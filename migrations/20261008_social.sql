-- Run after supabase.sql in the Supabase SQL editor. Additive, idempotent migration.
-- Private userdata is never made readable by friends. All sharing goes through RPCs.
begin;
create table if not exists public.social_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null default '' check (length(display_name)<=40),
  bio text not null default '' check (length(bio)<=160),
  avatar text not null default '' check (length(avatar)<=90000 and (avatar='' or avatar ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')),
  theme text not null default 'mint' check (theme in ('mint','violet','amber','slate')),
  badges text[] not null default '{}' check (cardinality(badges)<=4),
  updated_at timestamptz not null default now()
);
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references public.social_profiles(user_id) on delete cascade,
  recipient uuid not null references public.social_profiles(user_id) on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  check(sender<>recipient)
);
create unique index if not exists social_connection_pair on public.social_connections(least(sender,recipient),greatest(sender,recipient));
create index if not exists social_connection_sender on public.social_connections(sender);
create index if not exists social_connection_recipient on public.social_connections(recipient);
alter table public.social_profiles enable row level security;
alter table public.social_connections enable row level security;
-- No direct table access, including update of another user's friendship or badges.
revoke all on public.social_profiles,public.social_connections from public,anon,authenticated;

create or replace function public.social_array(v jsonb) returns jsonb
language sql immutable set search_path='' as $$ select case when jsonb_typeof(v)='array' then v else '[]'::jsonb end $$;
create or replace function public.social_number(v jsonb) returns numeric
language sql immutable set search_path='' as $$
 select case when (v #>> '{}') ~ '^[0-9]{1,13}(\.[0-9]{1,4})?$' then (v #>> '{}')::numeric else 0 end
$$;
create or replace function public.social_stats(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 with raw as (
   select w,public.social_number(w->'start') as started,public.social_number(w->'end') as ended
   from public.userdata u cross join lateral jsonb_array_elements(public.social_array(u.data->'workouts')) w where u.user_id=p_user
 ), valid as (
   select w,started from raw where started>0 and started<=extract(epoch from now())*1000 and ended>=started and ended<=extract(epoch from now())*1000 and coalesce(w->>'tick','false')<>'true'
 ), working as (
   select v.started,to_char(to_timestamp((v.started/1000)::double precision) at time zone 'UTC','YYYY-MM-DD') as day,
     e->>'ex' as exercise,public.social_number(s->'kg') as kg,public.social_number(s->'reps') as reps
   from valid v cross join lateral jsonb_array_elements(public.social_array(v.w->'entries')) e
   cross join lateral jsonb_array_elements(public.social_array(e->'sets')) s
   where coalesce(s->>'w','false')<>'true' and public.social_number(s->'reps') between 1 and 1000 and public.social_number(s->'kg') between 0 and 2000
 ), sessions as (
   select count(*) as n from valid v where exists(select 1 from working s where s.started=v.started)
 ), totals as (
   select count(distinct day) as days,coalesce(sum(kg*reps),0) as volume,
     coalesce(max(kg) filter(where exercise='Barbell_Bench_Press_-_Medium_Grip'),0) as bench,
     coalesce(max(kg) filter(where exercise='Barbell_Full_Squat'),0) as squat,
     coalesce(max(kg) filter(where exercise='Barbell_Deadlift'),0) as deadlift,
     coalesce(max(kg) filter(where exercise='Standing_Military_Press'),0) as press from working
 ), tiers as (
   select *,greatest(
     case when bench>=140 then 5 when bench>=100 then 4 when bench>=80 then 3 when bench>=60 then 2 when bench>=40 then 1 when bench>=20 then 0 else -1 end,
     case when squat>=200 then 5 when squat>=140 then 4 when squat>=100 then 3 when squat>=80 then 2 when squat>=40 then 1 when squat>=20 then 0 else -1 end,
     case when deadlift>=240 then 5 when deadlift>=180 then 4 when deadlift>=140 then 3 when deadlift>=100 then 2 when deadlift>=60 then 1 when deadlift>=40 then 0 else -1 end,
     case when press>=80 then 5 when press>=60 then 4 when press>=40 then 3 when press>=30 then 2 when press>=20 then 1 when press>=10 then 0 else -1 end) as highest from totals
 ), week as (
   select day,count(*) as sets from working where started>=extract(epoch from date_trunc('week',now() at time zone 'UTC') at time zone 'UTC')*1000 group by day
 )
 select jsonb_build_object('workouts',n,'volume',volume,'highest',highest,
   'days',(select count(*) from week),'sets',coalesce((select sum(sets) from week),0),
   'score',coalesce((select sum(100+least(sets,20)*5) from week),0),
   'badges',to_jsonb(array_remove(array[
     case when n>=1 then 'first' end,case when n>=10 then 'ten' end,case when n>=50 then 'fifty' end,
     case when tiers.days>=7 then 'days' end,case when volume>=100000 then 'volume' end,
     case when bench>=100 then 'bench' end,case when bench>=20 and squat>=20 and deadlift>=40 and press>=10 then 'balance' end
   ],null))) from sessions cross join tiers
$$;

create or replace function public.social_save_profile(p_username text,p_display_name text,p_bio text,p_avatar text,p_theme text,p_badges text[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); earned jsonb; chosen text[];
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if p_username is null or lower(trim(p_username)) !~ '^[a-z0-9_]{3,24}$' then raise exception 'invalid_username'; end if;
 if cardinality(p_badges)>4 then raise exception 'badge_limit'; end if;
 earned:=public.social_stats(me)->'badges';
 select coalesce(array_agg(id order by ord),'{}') into chosen from (
   select id,min(ord) as ord from unnest(coalesce(p_badges,'{}')) with ordinality as b(id,ord) where earned ? id group by id
 ) b;
 insert into public.social_profiles(user_id,username,display_name,bio,avatar,theme,badges)
 values(me,lower(trim(p_username)),coalesce(p_display_name,''),coalesce(p_bio,''),coalesce(p_avatar,''),coalesce(p_theme,'mint'),chosen)
 on conflict(user_id) do update set username=excluded.username,display_name=excluded.display_name,bio=excluded.bio,avatar=excluded.avatar,theme=excluded.theme,badges=excluded.badges,updated_at=now();
 return jsonb_build_object('username',lower(trim(p_username)));
end $$;

create or replace function public.social_request_friend(p_username text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); target uuid; request uuid;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 -- Serializing requests avoids a concurrent pair or limit race; requests are short.
 perform pg_advisory_xact_lock(78231008);
 if not exists(select 1 from public.social_profiles where user_id=me) then raise exception 'profile_required'; end if;
 select user_id into target from public.social_profiles where username=lower(trim(p_username));
 if target is null then raise exception 'friend_not_found'; end if;
 if target=me then raise exception 'self_request'; end if;
 select id into request from public.social_connections where least(sender,recipient)=least(me,target) and greatest(sender,recipient)=greatest(me,target);
 if request is not null then return jsonb_build_object('id',request); end if;
 if (select count(*) from public.social_connections where sender=me or recipient=me)>=100 or (select count(*) from public.social_connections where sender=target or recipient=target)>=100 then raise exception 'request_limit'; end if;
 insert into public.social_connections(sender,recipient) values(me,target) returning id into request;
 return jsonb_build_object('id',request);
end $$;

create or replace function public.social_respond_friend(p_request uuid,p_accept boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); request public.social_connections;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(78231008);
 select * into request from public.social_connections where id=p_request and recipient=me and not accepted for update;
 if request.id is null then raise exception 'request_not_found'; end if;
 if p_accept is true then
   if (select count(*) from public.social_connections where accepted and (sender=me or recipient=me))>=50 or (select count(*) from public.social_connections where accepted and (sender=request.sender or recipient=request.sender))>=50 then raise exception 'friend_limit'; end if;
   update public.social_connections set accepted=true where id=p_request;
 else delete from public.social_connections where id=p_request; end if;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.social_remove_friend(p_other uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 delete from public.social_connections where (sender=me and recipient=p_other) or (recipient=me and sender=p_other);
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.social_view_profile(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid(); p public.social_profiles; stats jsonb; connected boolean;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select * into p from public.social_profiles where user_id=p_user;
 if p.user_id is null then raise exception 'profile_not_found'; end if;
 select me=p_user or exists(select 1 from public.social_connections where accepted and ((sender=me and recipient=p_user) or (recipient=me and sender=p_user))) into connected;
 if not connected and not exists(select 1 from public.social_connections where (sender=me and recipient=p_user) or (recipient=me and sender=p_user)) then raise exception 'profile_private' using errcode='42501'; end if;
 -- Pending requests show only identification; no bio, milestones or stats yet.
 stats:=case when connected then public.social_stats(p_user) else '{}'::jsonb end;
 return jsonb_build_object('user_id',p.user_id,'username',p.username,'display_name',p.display_name,'avatar',p.avatar,'theme',p.theme,
 'bio',case when connected then p.bio else '' end,'badges',case when connected then (select coalesce(jsonb_agg(b),'[]') from unnest(p.badges) b where (stats->'badges') ? b) else '[]'::jsonb end,'stats',stats);
end $$;

create or replace function public.social_dashboard() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid(); profile jsonb; incoming jsonb; outgoing jsonb; friends jsonb; board jsonb;
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=me) then return jsonb_build_object('profile',null,'incoming','[]'::jsonb,'outgoing','[]'::jsonb,'friends','[]'::jsonb,'leaderboard','[]'::jsonb); end if;
 profile:=public.social_view_profile(me);
 select coalesce(jsonb_agg(jsonb_build_object('request_id',c.id,'user_id',p.user_id,'username',p.username)),'[]') into incoming from public.social_connections c join public.social_profiles p on p.user_id=c.sender where c.recipient=me and not c.accepted;
 select coalesce(jsonb_agg(jsonb_build_object('request_id',c.id,'user_id',p.user_id,'username',p.username)),'[]') into outgoing from public.social_connections c join public.social_profiles p on p.user_id=c.recipient where c.sender=me and not c.accepted;
 select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'username',p.username) order by p.username),'[]') into friends from public.social_connections c join public.social_profiles p on p.user_id=case when c.sender=me then c.recipient else c.sender end where c.accepted and (c.sender=me or c.recipient=me);
 select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'username',p.username,'display_name',p.display_name,'avatar',p.avatar,'theme',p.theme,'score',s.stats->'score','days',s.stats->'days','sets',s.stats->'sets') order by (s.stats->>'score')::numeric desc,p.username),'[]') into board
 from public.social_profiles p cross join lateral (select public.social_stats(p.user_id) as stats) s
 where p.user_id=me or exists(select 1 from public.social_connections c where c.accepted and ((c.sender=me and c.recipient=p.user_id) or (c.recipient=me and c.sender=p.user_id)));
 return jsonb_build_object('profile',profile,'incoming',incoming,'outgoing',outgoing,'friends',friends,'leaderboard',board);
end $$;
-- Functions get PUBLIC EXECUTE by default. Revoke that, including helper functions.
revoke all on function public.social_array(jsonb),public.social_number(jsonb),public.social_stats(uuid),public.social_save_profile(text,text,text,text,text,text[]),public.social_request_friend(text),public.social_respond_friend(uuid,boolean),public.social_remove_friend(uuid),public.social_view_profile(uuid),public.social_dashboard() from public,anon,authenticated;
grant execute on function public.social_save_profile(text,text,text,text,text,text[]),public.social_request_friend(text),public.social_respond_friend(uuid,boolean),public.social_remove_friend(uuid),public.social_view_profile(uuid),public.social_dashboard() to authenticated;
notify pgrst,'reload schema';
commit;
