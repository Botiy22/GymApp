-- Minimal stand-ins for the Supabase roles and auth schema, so the migrations can run on a plain local PostgreSQL for tests.
do $$ begin create role anon nologin; create role authenticated nologin; create role service_role nologin; exception when duplicate_object then null; end $$;
create schema auth;
create table auth.users(id uuid primary key default gen_random_uuid(), email text, phone text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz, phone_confirmed_at timestamptz, last_sign_in_at timestamptz, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
grant usage on schema public to anon,authenticated,service_role;
