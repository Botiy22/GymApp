-- Run after all previous social migrations. Additive and idempotent. No private logs become readable.
begin;
create or replace function public.social_strength_stats(p_user uuid) returns jsonb
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
     case when bench>=140 then 8 when bench>=100 then 7 when bench>=80 then 6 when bench>=60 then 5 when bench>=40 then 4 when bench>=20 then 3 when bench>=10 then 2 when bench>=5 then 1 when bench>=1 then 0 else -1 end,
     case when squat>=200 then 8 when squat>=140 then 7 when squat>=100 then 6 when squat>=80 then 5 when squat>=40 then 4 when squat>=20 then 3 when squat>=10 then 2 when squat>=5 then 1 when squat>=1 then 0 else -1 end,
     case when deadlift>=240 then 8 when deadlift>=180 then 7 when deadlift>=140 then 6 when deadlift>=100 then 5 when deadlift>=60 then 4 when deadlift>=40 then 3 when deadlift>=20 then 2 when deadlift>=10 then 1 when deadlift>=1 then 0 else -1 end,
     case when press>=80 then 8 when press>=60 then 7 when press>=40 then 6 when press>=30 then 5 when press>=20 then 4 when press>=10 then 3 when press>=5 then 2 when press>=2.5 then 1 when press>=1 then 0 else -1 end) as highest from totals
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

create or replace function public.social_consistency(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 with bounds as(select extract(epoch from date_trunc('week',now() at time zone 'UTC') at time zone 'UTC')*1000 as first_ms,extract(epoch from now())*1000 as last_ms,to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') as first_day,to_char(now() at time zone 'UTC','YYYY-MM-DD') as last_day),
 raw as(select w,public.social_number(w->'start') as started,public.social_number(w->'end') as ended from public.userdata u cross join lateral jsonb_array_elements(public.social_array(u.data->'workouts')) w where u.user_id=p_user),
 sessions as(select w,to_char(to_timestamp((started/1000)::double precision) at time zone 'UTC','YYYY-MM-DD') as day from raw,bounds where started>=first_ms and started<=last_ms and ended>=started and ended<=last_ms),
 checked as(select day,
 case when w->'tick'='true'::jsonb then 0 else (select count(*) from jsonb_array_elements(public.social_array(w->'entries')) e cross join lateral jsonb_array_elements(public.social_array(e->'sets')) s where coalesce(s->'w','false'::jsonb)<>'true'::jsonb and public.social_number(s->'reps') between 1 and 1000 and public.social_number(s->'kg') between 0 and 2000) end as sets,
 coalesce(w->'tick'='true'::jsonb,false) and exists(select 1 from jsonb_array_elements(public.social_array(w->'pl')) i where i->>'ex' ~ '^[A-Za-z0-9_-]{1,90}$' and public.social_number(i->'n') between 1 and 12) as tick,
 coalesce(w->'tick','false'::jsonb)<>'true'::jsonb and exists(select 1 from jsonb_array_elements(public.social_array(w->'cardio')) c where public.social_number(c->'minutes') between 1 and 480 and public.social_number(c->'weight') between 30 and 300) as cardio from sessions),
 training as(select day,sum(sets) as sets from checked where sets>0 or tick or cardio group by day),
 food as(select d.key as day,f from public.userdata u cross join lateral jsonb_each(case when jsonb_typeof(u.data->'food')='object' then u.data->'food' else '{}'::jsonb end) d cross join lateral jsonb_array_elements(public.social_array(d.value)) f,bounds where u.user_id=p_user and d.key ~ '^\d{4}-\d{2}-\d{2}$' and d.key between first_day and last_day),
 meals as(select day,least(3,count(distinct coalesce(nullif(f->>'pm',''),f->>'id'))) as n from food where public.social_number(f->'kcal') between 1 and 20000 and length(coalesce(f->>'id',''))>0 group by day),
 total as(select (select count(*) from training) as days,coalesce((select sum(sets) from training),0) as sets,coalesce((select sum(least(sets,20)*5) from training),0) as bonus,coalesce((select sum(n*20) from meals),0) as nutrition,(select count(*) from meals) as meal_days)
 select jsonb_build_object('days',days,'sets',sets,'attendance_points',days*100,'set_points',bonus,'workout_points',days*100+bonus,'meal_points',nutrition,'meal_days',meal_days,'score',days*100+bonus+nutrition) from total
$$;
create or replace function public.social_extra_badges(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 with valid as(select w,to_char(to_timestamp((public.social_number(w->'start')/1000)::double precision) at time zone 'UTC','YYYY-MM-DD') as day from public.userdata u cross join lateral jsonb_array_elements(public.social_array(u.data->'workouts')) w where u.user_id=p_user and public.social_number(w->'start')>0 and public.social_number(w->'start')<=extract(epoch from now())*1000 and public.social_number(w->'end')>=public.social_number(w->'start') and public.social_number(w->'end')<=extract(epoch from now())*1000),
 counted as(select day,
 exists(select 1 from jsonb_array_elements(public.social_array(w->'cardio')) c where public.social_number(c->'minutes') between 1 and 480 and public.social_number(c->'weight') between 30 and 300) as cardio,
 coalesce(w->'tick'='true'::jsonb,false) and exists(select 1 from jsonb_array_elements(public.social_array(w->'pl')) e where length(coalesce(e->>'ex',''))>0) as tick,
 coalesce(w->'tick','false'::jsonb)<>'true'::jsonb and exists(select 1 from jsonb_array_elements(public.social_array(w->'entries')) e cross join lateral jsonb_array_elements(public.social_array(e->'sets')) s where coalesce(s->'w','false'::jsonb)<>'true'::jsonb and public.social_number(s->'reps') between 1 and 1000 and public.social_number(s->'kg') between 0 and 2000) as working from valid),
 food_days as(select count(distinct d.key) as n from public.userdata u cross join lateral jsonb_each(case when jsonb_typeof(u.data->'food')='object' then u.data->'food' else '{}'::jsonb end) d where u.user_id=p_user and d.key ~ '^\d{4}-\d{2}-\d{2}$' and d.key<=to_char(now() at time zone 'UTC','YYYY-MM-DD') and exists(select 1 from jsonb_array_elements(public.social_array(d.value)) f where length(coalesce(f->>'id',''))>0 and public.social_number(f->'kcal') between 1 and 20000))
 select to_jsonb(array_remove(array[
 case when (select count(*) from counted where working)>=5 then 'five' end,
 case when exists(select 1 from counted where cardio) then 'cardio' end,
 case when (select count(distinct day) from counted where working or tick or cardio)>=3 then 'checkins' end,
 case when (select n from food_days)>=7 then 'food' end],null))
$$;

create or replace function public.social_stats(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$ select public.social_strength_stats(p_user)||public.social_consistency(p_user)||jsonb_build_object('badges',(public.social_strength_stats(p_user)->'badges')||public.social_extra_badges(p_user)) $$;
create or replace function public.social_dashboard_v2() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare d jsonb; board jsonb;
begin
 d:=public.social_dashboard();
 select coalesce(jsonb_agg(r||jsonb_build_object('workout_points',s->'workout_points','meal_points',s->'meal_points','meal_days',s->'meal_days') order by (r->>'score')::numeric desc,r->>'username'),'[]'::jsonb) into board from jsonb_array_elements(d->'leaderboard') r cross join lateral (select public.social_stats((r->>'user_id')::uuid) as s) x;
 return d||jsonb_build_object('competition_version',2,'leaderboard',board);
end $$;
alter table public.social_profiles add column if not exists cover_photo text not null default '' check(length(cover_photo)<=240000 and (cover_photo='' or cover_photo ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$'));
alter table public.social_profiles add column if not exists cover_style text not null default 'glow' check(cover_style in ('glow','mesh','stripe','clean','grid','orbit','horizon','photo'));
create or replace function public.social_save_cover(p_photo text,p_style text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'authentication_required' using errcode='42501'; end if;
 update public.social_profiles set cover_photo=coalesce(p_photo,''),cover_style=coalesce(p_style,'glow'),updated_at=now() where user_id=me;
 if not found then raise exception 'profile_required'; end if;
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
 'cover_photo',case when connected and p.cover_style='photo' then p.cover_photo else '' end,'cover_style',case when connected then p.cover_style else 'glow' end,
 'bio',case when connected then p.bio else '' end,'badges',case when connected then (select coalesce(jsonb_agg(b),'[]') from unnest(p.badges) b where (stats->'badges') ? b) else '[]'::jsonb end,'stats',stats);
end $$;

revoke all on function public.social_extra_badges(uuid),public.social_strength_stats(uuid),public.social_consistency(uuid),public.social_stats(uuid),public.social_dashboard_v2(),public.social_save_cover(text,text),public.social_view_profile(uuid) from public,anon,authenticated;
grant execute on function public.social_dashboard_v2(),public.social_save_cover(text,text),public.social_view_profile(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
