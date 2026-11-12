-- 2.56: shared recipe ratings. Every signed-in user can give a recipe 1–5 stars (one rating per user per recipe, changeable);
-- everyone, signed in or not, can read the average and the count per recipe. Who rated what is never exposed: the table is
-- not readable directly, only through the functions below. Additive and idempotent; nothing existing is changed.
begin;
create table if not exists public.recipe_ratings (
  recipe text not null check (recipe ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (recipe, user_id)
);
create index if not exists recipe_ratings_user on public.recipe_ratings(user_id);
alter table public.recipe_ratings enable row level security;
revoke all on public.recipe_ratings from public, anon, authenticated;

create or replace function public.recipe_rating_summary() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(recipe, jsonb_build_object('avg', avg_stars, 'n', n)), '{}'::jsonb)
  from (select recipe, round(avg(stars)::numeric, 2) as avg_stars, count(*) as n from public.recipe_ratings group by recipe) s
$$;

create or replace function public.recipe_rating_mine() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(recipe, stars), '{}'::jsonb) from public.recipe_ratings where user_id = auth.uid()
$$;

-- p_stars 1–5 sets or changes your rating, 0 removes it. Returns the recipe's new average and count.
create or replace function public.recipe_rate(p_recipe text, p_stars integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); result jsonb;
begin
  if me is null then raise exception 'not_signed_in' using errcode = '42501'; end if;
  if p_recipe is null or p_recipe !~ '^[a-z0-9][a-z0-9-]{1,79}$' then raise exception 'bad_recipe' using errcode = '22023'; end if;
  if p_stars is null or p_stars < 0 or p_stars > 5 then raise exception 'bad_stars' using errcode = '22023'; end if;
  if p_stars = 0 then
    delete from public.recipe_ratings where recipe = p_recipe and user_id = me;
  else
    if not exists (select 1 from public.recipe_ratings where recipe = p_recipe and user_id = me)
       and (select count(*) from public.recipe_ratings where user_id = me) >= 500 then
      raise exception 'rating_limit' using errcode = '54000';
    end if;
    insert into public.recipe_ratings(recipe, user_id, stars) values (p_recipe, me, p_stars)
    on conflict (recipe, user_id) do update set stars = excluded.stars, updated_at = now();
  end if;
  select jsonb_build_object('recipe', p_recipe, 'avg', coalesce(round(avg(stars)::numeric, 2), 0), 'n', count(*), 'mine', p_stars)
    into result from public.recipe_ratings where recipe = p_recipe;
  return result;
end $$;

revoke all on function public.recipe_rating_summary(), public.recipe_rating_mine(), public.recipe_rate(text, integer) from public;
grant execute on function public.recipe_rating_summary() to anon, authenticated;
grant execute on function public.recipe_rating_mine(), public.recipe_rate(text, integer) to authenticated;
commit;
