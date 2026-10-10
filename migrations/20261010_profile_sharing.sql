-- Run after the two 20261008 social migrations. Additive; private logs stay private.
begin;
alter table public.social_profiles drop constraint if exists social_profiles_theme_check;
alter table public.social_profiles add constraint social_profiles_theme_check check(theme in ('mint','violet','amber','slate') or theme ~ '^hue_([0-9]|[1-9][0-9]|[12][0-9]{2}|3[0-5][0-9])$');
create table if not exists public.social_photo_likes (
 target uuid references public.social_profiles(user_id) on delete cascade,
 actor uuid references public.social_profiles(user_id) on delete cascade,
 photo text not null, primary key(target,actor,photo), check(target<>actor)
);
create table if not exists public.social_reviews (
 id uuid primary key default gen_random_uuid(),target uuid not null references public.social_profiles(user_id) on delete cascade,
 author uuid not null references public.social_profiles(user_id) on delete cascade,
 rating integer not null check(rating between 1 and 5),body text not null check(length(body) between 1 and 280),
 updated_at timestamptz not null default now(),unique(target,author),check(target<>author)
);
create table if not exists public.social_routines (
 id uuid primary key default gen_random_uuid(),owner uuid not null references public.social_profiles(user_id) on delete cascade,
 source_id text not null check(length(source_id) between 1 and 80),snapshot jsonb not null,
 updated_at timestamptz not null default now(),unique(owner,source_id)
);
alter table public.social_photo_likes enable row level security;
alter table public.social_reviews enable row level security;
alter table public.social_routines enable row level security;
revoke all on public.social_photo_likes,public.social_reviews,public.social_routines from public,anon,authenticated;
create or replace function public.social_connected(a uuid,b uuid) returns boolean
language sql stable security definer set search_path='' as $$ select a is not null and b is not null and (a=b or exists(select 1 from public.social_connections where accepted and ((sender=a and recipient=b) or (sender=b and recipient=a)))) $$;
create or replace function public.social_username_available(p_username text) returns boolean
language sql stable security definer set search_path='' as $$ select lower(trim(p_username)) ~ '^[a-z0-9_]{3,24}$' and not exists(select 1 from public.social_profiles where username=lower(trim(p_username))) $$;
create or replace function public.social_signup_profile() returns trigger
language plpgsql security definer set search_path='' as $$
declare handle text:=lower(trim(new.raw_user_meta_data->>'reppsy_username'));
begin
 if handle is not null then
  if handle !~ '^[a-z0-9_]{3,24}$' then raise exception 'invalid_username'; end if;
  insert into public.social_profiles(user_id,username) values(new.id,handle);
 end if;
 return new;
end $$;
drop trigger if exists reppsy_signup_profile on auth.users;
create trigger reppsy_signup_profile after insert on auth.users for each row execute function public.social_signup_profile();
create or replace function public.social_profile_activity(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid(); result jsonb;
begin
 if not public.social_connected(me,p_user) then raise exception 'profile_private' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=p_user) then raise exception 'profile_required'; end if;
 select jsonb_build_object(
 'likes',(select count(*) from public.social_photo_likes l where l.target=p_user and l.photo=md5(p.avatar) and public.social_connected(p_user,l.actor)),
 'liked',exists(select 1 from public.social_photo_likes where target=p_user and actor=me and photo=md5(p.avatar)),
 'reviews',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'author',r.author,'username',a.username,'rating',r.rating,'body',r.body) order by r.updated_at desc) from public.social_reviews r join public.social_profiles a on a.user_id=r.author where r.target=p_user and public.social_connected(p_user,r.author)),'[]'::jsonb),
 'routines',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'source_id',r.source_id,'snapshot',r.snapshot) order by r.updated_at desc) from public.social_routines r where r.owner=p_user),'[]'::jsonb)) into result from public.social_profiles p where p.user_id=p_user;
 return result;
end $$;
create or replace function public.social_photo_like(p_user uuid,p_like boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); pic text;
begin
 if me=p_user or not public.social_connected(me,p_user) then raise exception 'profile_private' using errcode='42501'; end if;
 select avatar into pic from public.social_profiles where user_id=p_user;
 if coalesce(pic,'')='' then raise exception 'photo_required'; end if;
 if p_like is true then insert into public.social_photo_likes values(p_user,me,md5(pic)) on conflict do nothing;
 else delete from public.social_photo_likes where target=p_user and actor=me and photo=md5(pic); end if;
 return public.social_profile_activity(p_user);
end $$;
create or replace function public.social_review_save(p_user uuid,p_rating integer,p_text text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me=p_user or not public.social_connected(me,p_user) then raise exception 'profile_private' using errcode='42501'; end if;
 insert into public.social_reviews(target,author,rating,body) values(p_user,me,p_rating,trim(p_text)) on conflict(target,author) do update set rating=excluded.rating,body=excluded.body,updated_at=now();
 return public.social_profile_activity(p_user);
end $$;
create or replace function public.social_review_remove(p_review uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); target_id uuid;
begin
 delete from public.social_reviews where id=p_review and (author=me or target=me) returning target into target_id;
 if target_id is null then raise exception 'review_not_found'; end if;
 return public.social_profile_activity(target_id);
end $$;
-- Rebuild every snapshot from an allowlist. Logged weights, photos, account fields and diaries cannot leak.
create or replace function public.social_routine_publish(p_source_id text,p_snapshot jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); r jsonb:=p_snapshot->'routine'; items jsonb; defs jsonb; safe jsonb;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=me) then raise exception 'profile_required'; end if;
 perform pg_advisory_xact_lock(78231010);
 if octet_length(p_snapshot::text)>100000 or coalesce(jsonb_array_length(public.social_array(r->'items')),0) not between 1 and 60 or coalesce(length(r->>'name'),0) not between 1 and 80 or coalesce(length(p_source_id),0) not between 1 and 80 then raise exception 'invalid_routine'; end if;
 if (select count(*) from public.social_routines where owner=me)>=20 and not exists(select 1 from public.social_routines where owner=me and source_id=p_source_id) then raise exception 'sharing_limit'; end if;
 if exists(select 1 from jsonb_array_elements(public.social_array(r->'items')) i where coalesce(i->>'ex','') !~ '^[A-Za-z0-9_-]{1,90}$' or public.social_number(i->'sets') not between 1 and 12 or public.social_number(i->'rest') not between 0 and 3600) then raise exception 'invalid_routine'; end if;
 select jsonb_agg(jsonb_build_object('ex',i->>'ex','label',jsonb_build_object('en',left(coalesce(i->>'label',''),120),'hu',left(coalesce(i->>'label',''),120)),'sets',floor(public.social_number(i->'sets')),'reps',left(coalesce(i->>'reps','8–12'),20),'rest',floor(public.social_number(i->'rest')),'rir',left(coalesce(i->>'rir',''),8))) into items from jsonb_array_elements(public.social_array(r->'items')) i;
 select coalesce(jsonb_agg(jsonb_build_object('id',e->>'id','n',left(e->>'n',80),'p',public.social_array(e->'p'),'s',public.social_array(e->'s'),'eq',left(coalesce(e->>'eq','other'),30),'steps',(select coalesce(jsonb_agg(left(s #>> '{}',300)),'[]'::jsonb) from jsonb_array_elements(public.social_array(e->'steps')) with ordinality x(s,n) where n<=12))),'[]') into defs from jsonb_array_elements(public.social_array(p_snapshot->'myEx')) e where e->>'id' ~ '^my_[A-Za-z0-9]{1,36}$' and length(e->>'n') between 1 and 80 and exists(select 1 from jsonb_array_elements(items) i where i->>'ex'=e->>'id');
 if exists(select 1 from jsonb_array_elements(items) i where i->>'ex' like 'my\_%' escape '\' and not exists(select 1 from jsonb_array_elements(defs) e where e->>'id'=i->>'ex')) then raise exception 'invalid_routine'; end if;
 safe:=jsonb_build_object('version',1,'routine',jsonb_build_object('name',r->>'name','icon',left(coalesce(r->>'icon','upper'),20),'circuit',r->'circuit'='true'::jsonb,'items',items),'myEx',defs);
 insert into public.social_routines(owner,source_id,snapshot) values(me,p_source_id,safe) on conflict(owner,source_id) do update set snapshot=excluded.snapshot,updated_at=now();
 return public.social_profile_activity(me);
end $$;
create or replace function public.social_routine_unshare(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 delete from public.social_routines where id=p_id and owner=me;
 return public.social_profile_activity(me);
end $$;
create or replace function public.social_routine_get(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare r public.social_routines;
begin
 select * into r from public.social_routines where id=p_id;
 if r.id is null or not public.social_connected(auth.uid(),r.owner) then raise exception 'routine_unavailable' using errcode='42501'; end if;
 return r.snapshot;
end $$;
revoke all on function public.social_connected(uuid,uuid),public.social_signup_profile(),public.social_username_available(text),public.social_profile_activity(uuid),public.social_photo_like(uuid,boolean),public.social_review_save(uuid,integer,text),public.social_review_remove(uuid),public.social_routine_publish(text,jsonb),public.social_routine_unshare(uuid),public.social_routine_get(uuid) from public,anon,authenticated;
grant execute on function public.social_username_available(text) to anon,authenticated;
grant execute on function public.social_profile_activity(uuid),public.social_photo_like(uuid,boolean),public.social_review_save(uuid,integer,text),public.social_review_remove(uuid),public.social_routine_publish(text,jsonb),public.social_routine_unshare(uuid),public.social_routine_get(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
