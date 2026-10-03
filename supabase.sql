-- Rep Riot: run this once in your Supabase project (SQL Editor -> New query -> paste -> Run).
-- It creates one table with one row per user and makes sure a signed-in user can only ever see and change their own row.

create table if not exists public.userdata (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint userdata_size check (octet_length(data::text) < 5000000)   -- nobody can fill the database with one huge row
);

alter table public.userdata enable row level security;

drop policy if exists "own row: read"   on public.userdata;
drop policy if exists "own row: insert" on public.userdata;
drop policy if exists "own row: update" on public.userdata;
drop policy if exists "own row: delete" on public.userdata;

create policy "own row: read"   on public.userdata for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row: insert" on public.userdata for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row: update" on public.userdata for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own row: delete" on public.userdata for delete to authenticated using ((select auth.uid()) = user_id);

-- people who are not signed in get nothing at all
revoke all on public.userdata from anon;
grant select, insert, update, delete on public.userdata to authenticated;
