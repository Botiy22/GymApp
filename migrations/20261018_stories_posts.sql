-- 2.28: photo posts, stories that disappear, story highlights ("Chest day") and likes.
-- Run after the earlier social migrations. Additive and idempotent; nothing existing is changed.
-- Who can see an item: 'everyone' = any signed-in account, 'friends' = accepted friends only, 'me' = only the owner.
-- Pictures are JPEG/WebP data URLs that the app has already shrunk (about 1080 px, and a small square thumbnail).
-- Expired stories stay in the owner's archive for 30 days (so they can still be added to a highlight), then they are deleted,
-- unless they are kept in a highlight. All access goes through the functions below; the tables are not readable directly.
begin;
create table if not exists public.social_posts (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references public.social_profiles(user_id) on delete cascade,
 kind text not null check(kind in ('post','story')),
 image text not null check(length(image)<=420000 and image ~ '^data:image/(jpeg|webp);base64,[A-Za-z0-9+/=]+$'),
 thumb text not null check(length(thumb)<=40000 and thumb ~ '^data:image/(jpeg|webp);base64,[A-Za-z0-9+/=]+$'),
 caption text not null default '' check(length(caption)<=300),
 audience text not null default 'everyone' check(audience in ('everyone','friends','me')),
 created_at timestamptz not null default now(),
 expires_at timestamptz,
 check((kind='story')=(expires_at is not null))
);
create index if not exists social_posts_owner on public.social_posts(owner,kind,created_at desc);
create index if not exists social_posts_recent on public.social_posts(kind,created_at desc);
create index if not exists social_posts_expiry on public.social_posts(expires_at) where kind='story';
create table if not exists public.social_post_likes (
 post uuid not null references public.social_posts(id) on delete cascade,
 actor uuid not null references public.social_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post,actor)
);
create index if not exists social_post_likes_actor on public.social_post_likes(actor);
create table if not exists public.social_highlights (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references public.social_profiles(user_id) on delete cascade,
 name text not null check(length(name) between 1 and 30),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists social_highlights_owner on public.social_highlights(owner,created_at);
create table if not exists public.social_highlight_items (
 highlight uuid not null references public.social_highlights(id) on delete cascade,
 post uuid not null references public.social_posts(id) on delete cascade,
 position integer not null default 0,
 primary key(highlight,post)
);
create index if not exists social_highlight_items_post on public.social_highlight_items(post);
alter table public.social_posts enable row level security;
alter table public.social_post_likes enable row level security;
alter table public.social_highlights enable row level security;
alter table public.social_highlight_items enable row level security;
revoke all on public.social_posts,public.social_post_likes,public.social_highlights,public.social_highlight_items from public,anon,authenticated;

-- Internal helpers (not callable by the app).
create or replace function public.social_post_visible(p public.social_posts,viewer uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select viewer is not null and (p.owner=viewer or (
  (p.audience='everyone' or (p.audience='friends' and public.social_connected(viewer,p.owner)))
  and (p.kind='post' or p.expires_at>now() or exists(select 1 from public.social_highlight_items i where i.post=p.id)))) $$;
create or replace function public.social_post_json(p public.social_posts,viewer uuid,with_image boolean,with_thumb boolean) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_strip_nulls(jsonb_build_object('id',p.id,'owner',p.owner,'kind',p.kind,'caption',p.caption,
  'audience',case when p.owner=viewer then p.audience end,'created_at',p.created_at,'expires_at',p.expires_at,
  'likes',(select count(*) from public.social_post_likes l where l.post=p.id),
  'liked',exists(select 1 from public.social_post_likes l where l.post=p.id and l.actor=viewer),
  'thumb',case when with_thumb then p.thumb end,'image',case when with_image then p.image end)) $$;
create or replace function public.social_author(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('user_id',p.user_id,'username',p.username,'display_name',p.display_name,'avatar',p.avatar,'theme',p.theme)
 from public.social_profiles p where p.user_id=p_user $$;
create or replace function public.social_need_profile() returns uuid
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'sign_in' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=me) then raise exception 'profile_required'; end if;
 return me;
end $$;

-- Create, edit, delete.
create or replace function public.social_post_create(p_kind text,p_image text,p_thumb text,p_caption text,p_audience text,p_hours numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile(); hours numeric:=coalesce(p_hours,24); made public.social_posts;
begin
 if p_kind is null or p_kind not in ('post','story') then raise exception 'invalid_post'; end if;
 if hours<1 or hours>168 then raise exception 'invalid_duration'; end if;
 perform pg_advisory_xact_lock(hashtextextended('social_post:'||me::text,0));
 if (select count(*) from public.social_posts where owner=me and created_at>now()-interval '1 day')>=30 then raise exception 'post_limit'; end if;
 if p_kind='post' and (select count(*) from public.social_posts where owner=me and kind='post')>=300 then raise exception 'post_limit'; end if;
 delete from public.social_posts s where s.kind='story' and s.expires_at<now()-interval '30 days'
  and not exists(select 1 from public.social_highlight_items i where i.post=s.id);
 insert into public.social_posts(owner,kind,image,thumb,caption,audience,expires_at)
 values(me,p_kind,p_image,p_thumb,left(trim(coalesce(p_caption,'')),300),coalesce(p_audience,'everyone'),
  case when p_kind='story' then now()+make_interval(secs=>(hours*3600)::double precision) end)
 returning * into made;
 return public.social_post_json(made,me,false,true);
end $$;
create or replace function public.social_post_update(p_id uuid,p_caption text,p_audience text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile(); changed public.social_posts;
begin
 update public.social_posts set caption=left(trim(coalesce(p_caption,caption)),300),audience=coalesce(p_audience,audience)
 where id=p_id and owner=me returning * into changed;
 if changed.id is null then raise exception 'post_not_found'; end if;
 return public.social_post_json(changed,me,false,true);
end $$;
create or replace function public.social_post_delete(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile();
begin
 delete from public.social_posts where id=p_id and owner=me;
 if not found then raise exception 'post_not_found'; end if;
 return jsonb_build_object('id',p_id,'deleted',true);
end $$;

-- Likes. Anyone who can see an item can like it, the owner included.
create or replace function public.social_post_like(p_id uuid,p_like boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile(); item public.social_posts;
begin
 select * into item from public.social_posts where id=p_id;
 if item.id is null or not public.social_post_visible(item,me) then raise exception 'post_not_found'; end if;
 if p_like is true then insert into public.social_post_likes(post,actor) values(p_id,me) on conflict do nothing;
 else delete from public.social_post_likes where post=p_id and actor=me; end if;
 return jsonb_build_object('id',p_id,'likes',(select count(*) from public.social_post_likes where post=p_id),'liked',p_like is true);
end $$;
create or replace function public.social_post_likers(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=public.social_need_profile();
begin
 if not exists(select 1 from public.social_posts where id=p_id and owner=me) then raise exception 'post_not_found'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',p.user_id,'username',p.username,'display_name',p.display_name,'theme',p.theme) order by l.created_at desc)
  from (select * from public.social_post_likes where post=p_id order by created_at desc limit 200) l join public.social_profiles p on p.user_id=l.actor),'[]'::jsonb);
end $$;

-- Reading. Lists carry no full-size pictures; social_media fetches up to 8 of those at a time.
create or replace function public.social_story_feed() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'sign_in' using errcode='42501'; end if;
 return coalesce((with visible as (
   select s.* from public.social_posts s where s.kind='story' and s.expires_at>now() and public.social_post_visible(s,me)),
  owners as (select v.owner,max(v.created_at) latest,bool_or(v.owner=me) own,public.social_connected(me,v.owner) friend
   from visible v group by v.owner order by bool_or(v.owner=me) desc,public.social_connected(me,v.owner) desc,max(v.created_at) desc limit 30)
  select jsonb_agg(jsonb_build_object('user',public.social_author(o.owner),'own',o.own,'friend',o.friend,'latest',o.latest,
   'items',(select jsonb_agg(public.social_post_json(v,me,false,false) order by v.created_at) from visible v where v.owner=o.owner))
   order by o.own desc,o.friend desc,o.latest desc) from owners o),'[]'::jsonb);
end $$;
create or replace function public.social_post_feed(p_before timestamptz default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'sign_in' using errcode='42501'; end if;
 return (with page as (select p.* from public.social_posts p where p.kind='post' and (p_before is null or p.created_at<p_before)
   and public.social_post_visible(p,me) order by p.created_at desc limit 12)
  select jsonb_build_object('posts',coalesce((select jsonb_agg(public.social_post_json(p,me,false,true) order by p.created_at desc) from page p),'[]'::jsonb),
   'authors',coalesce((select jsonb_object_agg(x.owner,public.social_author(x.owner)) from (select distinct owner from page) x),'{}'::jsonb)));
end $$;
create or replace function public.social_user_media(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'sign_in' using errcode='42501'; end if;
 if not exists(select 1 from public.social_profiles where user_id=p_user) then raise exception 'profile_required'; end if;
 return jsonb_build_object('user',public.social_author(p_user),'own',p_user=me,'friend',public.social_connected(me,p_user),
  'post_count',(select count(*) from public.social_posts p where p.owner=p_user and p.kind='post' and public.social_post_visible(p,me)),
  'posts',coalesce((select jsonb_agg(public.social_post_json(p,me,false,true) order by p.created_at desc)
   from (select * from public.social_posts p where p.owner=p_user and p.kind='post' and public.social_post_visible(p,me) order by p.created_at desc limit 60) p),'[]'::jsonb),
  'stories',coalesce((select jsonb_agg(public.social_post_json(s,me,false,false) order by s.created_at)
   from public.social_posts s where s.owner=p_user and s.kind='story' and s.expires_at>now() and public.social_post_visible(s,me)),'[]'::jsonb),
  'highlights',coalesce((select jsonb_agg(h.j order by h.created_at) from (
   select hl.created_at,jsonb_build_object('id',hl.id,'name',hl.name,
    'cover',(select p.thumb from public.social_highlight_items i join public.social_posts p on p.id=i.post
     where i.highlight=hl.id and public.social_post_visible(p,me) order by i.position,p.created_at limit 1),
    'items',coalesce((select jsonb_agg(public.social_post_json(p,me,false,false) order by i.position,p.created_at)
     from public.social_highlight_items i join public.social_posts p on p.id=i.post where i.highlight=hl.id and public.social_post_visible(p,me)),'[]'::jsonb)) j
   from public.social_highlights hl where hl.owner=p_user) h where p_user=me or jsonb_array_length(h.j->'items')>0),'[]'::jsonb));
end $$;
create or replace function public.social_media(p_ids uuid[]) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=auth.uid();
begin
 if me is null then raise exception 'sign_in' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(public.social_post_json(p,me,true,false)) from public.social_posts p
  where p.id=any((coalesce(p_ids,'{}'::uuid[]))[1:8]) and public.social_post_visible(p,me)),'[]'::jsonb);
end $$;
create or replace function public.social_story_archive() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare me uuid:=public.social_need_profile();
begin
 return coalesce((select jsonb_agg(public.social_post_json(s,me,false,true) order by s.created_at desc)
  from (select * from public.social_posts s where s.owner=me and s.kind='story'
   and (s.created_at>now()-interval '31 days' or exists(select 1 from public.social_highlight_items i where i.post=s.id))
   order by s.created_at desc limit 200) s),'[]'::jsonb);
end $$;

-- Highlights: named story collections that stay on the profile after the stories expire.
create or replace function public.social_highlight_save(p_id uuid,p_name text,p_items uuid[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile(); hid uuid:=p_id; clean text:=trim(coalesce(p_name,''));
begin
 if length(clean)<1 or length(clean)>30 then raise exception 'highlight_name'; end if;
 if cardinality(coalesce(p_items,'{}'::uuid[]))>100 then raise exception 'highlight_limit'; end if;
 if exists(select 1 from unnest(coalesce(p_items,'{}'::uuid[])) x
  where not exists(select 1 from public.social_posts p where p.id=x and p.owner=me and p.kind='story')) then raise exception 'post_not_found'; end if;
 perform pg_advisory_xact_lock(hashtextextended('social_highlight:'||me::text,0));
 if hid is null then
  if (select count(*) from public.social_highlights where owner=me)>=30 then raise exception 'highlight_limit'; end if;
  insert into public.social_highlights(owner,name) values(me,clean) returning id into hid;
 else
  update public.social_highlights set name=clean,updated_at=now() where id=hid and owner=me;
  if not found then raise exception 'highlight_not_found'; end if;
  if p_items is not null then delete from public.social_highlight_items where highlight=hid; end if;
 end if;
 if p_items is not null then
  insert into public.social_highlight_items(highlight,post,position) select hid,u.x,u.o from unnest(p_items) with ordinality u(x,o) on conflict do nothing;
 end if;
 return public.social_user_media(me)||jsonb_build_object('saved',hid);
end $$;
create or replace function public.social_highlight_delete(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=public.social_need_profile();
begin
 delete from public.social_highlights where id=p_id and owner=me;
 if not found then raise exception 'highlight_not_found'; end if;
 return public.social_user_media(me);
end $$;

revoke all on function public.social_post_visible(public.social_posts,uuid),public.social_post_json(public.social_posts,uuid,boolean,boolean),public.social_author(uuid),
 public.social_need_profile(),public.social_post_create(text,text,text,text,text,numeric),public.social_post_update(uuid,text,text),public.social_post_delete(uuid),
 public.social_post_like(uuid,boolean),public.social_post_likers(uuid),public.social_story_feed(),public.social_post_feed(timestamptz),public.social_user_media(uuid),
 public.social_media(uuid[]),public.social_story_archive(),public.social_highlight_save(uuid,text,uuid[]),public.social_highlight_delete(uuid) from public,anon,authenticated;
grant execute on function public.social_post_create(text,text,text,text,text,numeric),public.social_post_update(uuid,text,text),public.social_post_delete(uuid),
 public.social_post_like(uuid,boolean),public.social_post_likers(uuid),public.social_story_feed(),public.social_post_feed(timestamptz),public.social_user_media(uuid),
 public.social_media(uuid[]),public.social_story_archive(),public.social_highlight_save(uuid,text,uuid[]),public.social_highlight_delete(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
