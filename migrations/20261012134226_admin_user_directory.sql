create view public.admin_user_directory
with (security_invoker = true)
as
select
  u.id as user_id,
  u.email,
  coalesce(nullif(p.username, ''), nullif(d.data #>> '{settings,publicProfile,username}', ''), nullif(u.raw_user_meta_data ->> 'reppsy_username', '')) as username,
  coalesce(nullif(p.display_name, ''), nullif(d.data #>> '{settings,publicProfile,displayName}', '')) as display_name,
  u.created_at as account_created_at,
  u.last_sign_in_at,
  d.updated_at as data_updated_at,
  (d.user_id is not null) as has_saved_data
from auth.users u
left join public.userdata d on d.user_id = u.id
left join public.social_profiles p on p.user_id = u.id;

revoke all on public.admin_user_directory from public, anon, authenticated;
grant select on public.admin_user_directory to service_role;
comment on view public.admin_user_directory is
'Reppsy administrator account directory. Read only; visible to database administrators and service_role. App browser roles have no access. Source diary, account and social-profile data is not rewritten.';
