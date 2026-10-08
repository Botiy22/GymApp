-- Run AFTER 20261008_social.sql. Verified contacts are used for exact lookup only.
begin;
create table if not exists public.social_discovery (
 user_id uuid primary key references auth.users(id) on delete cascade,
 by_email boolean not null default false,
 by_phone boolean not null default false
);
create table if not exists public.social_lookup_limits (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_at timestamptz not null default now(), attempts integer not null default 0
);
alter table public.social_discovery enable row level security;
alter table public.social_lookup_limits enable row level security;
revoke all on public.social_discovery,public.social_lookup_limits from public,anon,authenticated;

create or replace function public.social_contact_settings() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid(); result jsonb;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select jsonb_build_object('by_email',coalesce(d.by_email,false),'by_phone',coalesce(d.by_phone,false),
 'email_verified',u.email_confirmed_at is not null,'phone_verified',u.phone_confirmed_at is not null and coalesce(u.phone,'')<>'',
 'phone',case when u.phone_confirmed_at is not null then coalesce(u.phone,'') else '' end) into result
 from auth.users u left join public.social_discovery d on d.user_id=u.id where u.id=me;
 return result;
end $$;
create or replace function public.social_save_contact_settings(p_email boolean,p_phone boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if p_email is true and not exists(select 1 from auth.users where id=me and email_confirmed_at is not null) then raise exception 'contact_unverified'; end if;
 if p_phone is true and not exists(select 1 from auth.users where id=me and phone_confirmed_at is not null and coalesce(phone,'')<>'') then raise exception 'contact_unverified'; end if;
 insert into public.social_discovery(user_id,by_email,by_phone) values(me,coalesce(p_email,false),coalesce(p_phone,false))
 on conflict(user_id) do update set by_email=excluded.by_email,by_phone=excluded.by_phone;
 return public.social_contact_settings();
end $$;
create or replace function public.social_request_friend_contact(p_identifier text,p_kind text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); identifier text:=trim(p_identifier); username text; counter integer;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=me) then raise exception 'profile_required'; end if;
 if p_kind not in ('email','phone') or p_kind is null or identifier is null or length(identifier)>254 then return jsonb_build_object('error','friend_not_found'); end if;
 -- Count unsuccessful exact lookups too; returning an error object commits this counter.
 insert into public.social_lookup_limits(user_id,window_at,attempts) values(me,now(),1)
 on conflict(user_id) do update set
 attempts=case when social_lookup_limits.window_at<now()-interval '1 hour' then 1 else social_lookup_limits.attempts+1 end,
 window_at=case when social_lookup_limits.window_at<now()-interval '1 hour' then now() else social_lookup_limits.window_at end
 returning attempts into counter;
 if counter>20 then return jsonb_build_object('error','contact_lookup_limit'); end if;
 if p_kind='email' then
   select p.username into username from auth.users u join public.social_discovery d on d.user_id=u.id join public.social_profiles p on p.user_id=u.id
   where d.by_email and u.email_confirmed_at is not null and lower(u.email)=lower(identifier);
 else
   identifier:=regexp_replace(identifier,'[ ()-]','','g');
   if identifier !~ '^\+[1-9][0-9]{6,14}$' then return jsonb_build_object('error','invalid_phone'); end if;
   select p.username into username from auth.users u join public.social_discovery d on d.user_id=u.id join public.social_profiles p on p.user_id=u.id
   where d.by_phone and u.phone_confirmed_at is not null and ltrim(u.phone,'+')=substring(identifier from 2);
 end if;
 -- Opted-out, missing and unverified accounts all return the same message.
 if username is null then return jsonb_build_object('error','friend_not_found'); end if;
 return public.social_request_friend(username);
end $$;
revoke all on function public.social_contact_settings(),public.social_save_contact_settings(boolean,boolean),public.social_request_friend_contact(text,text) from public,anon,authenticated;
grant execute on function public.social_contact_settings(),public.social_save_contact_settings(boolean,boolean),public.social_request_friend_contact(text,text) to authenticated;
notify pgrst,'reload schema';
commit;
