"""In-memory stand-in for the 2.28 social_* story, post, highlight and like functions (migrations/20261018_stories_posts.sql).
Browser tests route the fixture Supabase URL here, so no real account or database is touched."""
import base64
import datetime
import io
import uuid
from PIL import Image

OWNER, FRIEND, STRANGER = 'owner-fixture', 'friend-fixture', 'stranger-fixture'

def jpeg(color, size=(540, 720)):
    buf = io.BytesIO(); Image.new('RGB', size, color).save(buf, format='JPEG', quality=70)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

def iso(t):
    return t.isoformat().replace('+00:00', 'Z')

class Refusal(Exception):
    pass

class Backend:
    def __init__(self):
        self.now = datetime.datetime.now(datetime.timezone.utc)
        self.users = {OWNER: {'user_id': OWNER, 'username': 'owner', 'display_name': 'Owner', 'avatar': '', 'theme': 'mint'},
                      FRIEND: {'user_id': FRIEND, 'username': 'anna', 'display_name': 'Anna', 'avatar': jpeg((200, 120, 90), (120, 120)), 'theme': 'violet'},
                      STRANGER: {'user_id': STRANGER, 'username': 'csaba', 'display_name': 'Csaba', 'avatar': '', 'theme': 'amber'}}
        self.friends = {(OWNER, FRIEND)}
        self.posts, self.likes, self.highlights, self.calls = [], set(), [], []

    def connected(self, a, b):
        return a == b or (a, b) in self.friends or (b, a) in self.friends

    def kept(self, p):
        return any(p['id'] in h['items'] for h in self.highlights)

    def visible(self, p, viewer):
        if p['owner'] == viewer: return True
        if not (p['audience'] == 'everyone' or (p['audience'] == 'friends' and self.connected(viewer, p['owner']))): return False
        return p['kind'] == 'post' or p['expires_at'] > self.now or self.kept(p)

    def js(self, p, viewer, image=False, thumb=False):
        out = {'id': p['id'], 'owner': p['owner'], 'kind': p['kind'], 'caption': p['caption'], 'created_at': iso(p['created_at']),
               'likes': sum(1 for l in self.likes if l[0] == p['id']), 'liked': (p['id'], viewer) in self.likes}
        if p['expires_at']: out['expires_at'] = iso(p['expires_at'])
        if p['owner'] == viewer: out['audience'] = p['audience']
        if image: out['image'] = p['image']
        if thumb: out['thumb'] = p['thumb']
        return out

    def add(self, owner, kind, color, caption='', audience='everyone', hours=24, age_hours=0):
        created = self.now - datetime.timedelta(hours=age_hours)
        p = {'id': str(uuid.uuid4()), 'owner': owner, 'kind': kind, 'image': jpeg(color), 'thumb': jpeg(color, (120, 120)), 'caption': caption, 'audience': audience,
             'created_at': created, 'expires_at': created + datetime.timedelta(hours=hours) if kind == 'story' else None}
        self.posts.append(p); return p

    def media(self, uid, me):
        if uid not in self.users: raise Refusal('profile_required')
        mine = sorted([p for p in self.posts if p['owner'] == uid], key=lambda p: p['created_at'], reverse=True)
        posts = [p for p in mine if p['kind'] == 'post' and self.visible(p, me)]
        stories = sorted([p for p in mine if p['kind'] == 'story' and p['expires_at'] > self.now and self.visible(p, me)], key=lambda p: p['created_at'])
        hls = []
        for h in sorted([h for h in self.highlights if h['owner'] == uid], key=lambda h: h['created_at']):
            items = [p for i in h['items'] for p in self.posts if p['id'] == i and self.visible(p, me)]
            if uid == me or items:
                hls.append({'id': h['id'], 'name': h['name'], 'cover': items[0]['thumb'] if items else None, 'items': [self.js(p, me) for p in items]})
        return {'user': self.users[uid], 'own': uid == me, 'friend': self.connected(me, uid), 'post_count': len(posts),
                'posts': [self.js(p, me, thumb=True) for p in posts[:60]], 'stories': [self.js(p, me) for p in stories], 'highlights': hls}

    def handle(self, name, body, me=OWNER):
        self.calls.append((name, body))
        if name in ('social_dashboard', 'social_dashboard_v2'):
            return {'competition_version': 2, 'profile': {'username': 'owner', 'stats': {'score': 0, 'workout_points': 0, 'meal_points': 0}}, 'incoming': [], 'outgoing': [],
                    'friends': [{'user_id': FRIEND, 'username': 'anna'}], 'leaderboard': []}
        if name == 'social_profile_activity': return {'likes': 0, 'liked': False, 'reviews': [], 'routines': []}
        if name == 'social_view_profile': return {**self.users[body['p_user']], 'stats': {}}
        if name == 'social_story_feed':
            live = [p for p in self.posts if p['kind'] == 'story' and p['expires_at'] > self.now and self.visible(p, me)]
            owners = {}
            for p in live: owners.setdefault(p['owner'], []).append(p)
            order = sorted(owners, key=lambda o: (o != me, not self.connected(me, o), -max(p['created_at'] for p in owners[o]).timestamp()))
            return [{'user': self.users[o], 'own': o == me, 'friend': self.connected(me, o), 'latest': iso(max(p['created_at'] for p in owners[o])),
                     'items': [self.js(p, me) for p in sorted(owners[o], key=lambda p: p['created_at'])]} for o in order]
        if name == 'social_post_feed':
            before = body.get('p_before')
            page = sorted([p for p in self.posts if p['kind'] == 'post' and self.visible(p, me) and (not before or iso(p['created_at']) < before)], key=lambda p: p['created_at'], reverse=True)[:12]
            return {'posts': [self.js(p, me, thumb=True) for p in page], 'authors': {p['owner']: self.users[p['owner']] for p in page}}
        if name == 'social_user_media': return self.media(body['p_user'], me)
        if name == 'social_media':
            return [self.js(p, me, image=True) for p in self.posts if p['id'] in (body.get('p_ids') or [])[:8] and self.visible(p, me)]
        if name == 'social_story_archive':
            return [self.js(p, me, thumb=True) for p in sorted(self.posts, key=lambda p: p['created_at'], reverse=True) if p['owner'] == me and p['kind'] == 'story']
        if name == 'social_post_create':
            hours = body.get('p_hours') if body.get('p_hours') is not None else 24
            if body['p_kind'] not in ('post', 'story'): raise Refusal('invalid_post')
            if not 1 <= hours <= 168: raise Refusal('invalid_duration')
            if not str(body.get('p_image', '')).startswith('data:image/jpeg;base64,') or len(body['p_image']) > 420000 or len(body.get('p_thumb', '')) > 40000: raise Refusal('new row violates check constraint')
            p = {'id': str(uuid.uuid4()), 'owner': me, 'kind': body['p_kind'], 'image': body['p_image'], 'thumb': body['p_thumb'], 'caption': (body.get('p_caption') or '').strip()[:300],
                 'audience': body.get('p_audience') or 'everyone', 'created_at': datetime.datetime.now(datetime.timezone.utc),
                 'expires_at': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours) if body['p_kind'] == 'story' else None}
            self.posts.append(p); return self.js(p, me, thumb=True)
        if name == 'social_post_like':
            p = next((p for p in self.posts if p['id'] == body['p_id']), None)
            if not p or not self.visible(p, me): raise Refusal('post_not_found')
            (self.likes.add if body['p_like'] else self.likes.discard)((p['id'], me))
            return {'id': p['id'], 'likes': sum(1 for l in self.likes if l[0] == p['id']), 'liked': bool(body['p_like'])}
        if name == 'social_post_likers':
            return [{**self.users[a], 'avatar': None} for (pid, a) in self.likes if pid == body['p_id']]
        if name == 'social_post_update':
            p = next((p for p in self.posts if p['id'] == body['p_id'] and p['owner'] == me), None)
            if not p: raise Refusal('post_not_found')
            p['caption'] = (body.get('p_caption') or '')[:300]; p['audience'] = body.get('p_audience') or p['audience']; return self.js(p, me, thumb=True)
        if name == 'social_post_delete':
            n = len(self.posts); self.posts = [p for p in self.posts if not (p['id'] == body['p_id'] and p['owner'] == me)]
            if len(self.posts) == n: raise Refusal('post_not_found')
            for h in self.highlights: h['items'] = [i for i in h['items'] if i != body['p_id']]
            return {'id': body['p_id'], 'deleted': True}
        if name == 'social_highlight_save':
            nm = (body.get('p_name') or '').strip()
            if not 1 <= len(nm) <= 30: raise Refusal('highlight_name')
            h = next((h for h in self.highlights if h['id'] == body.get('p_id') and h['owner'] == me), None) if body.get('p_id') else None
            if body.get('p_id') and not h: raise Refusal('highlight_not_found')
            if not h: h = {'id': str(uuid.uuid4()), 'owner': me, 'name': nm, 'created_at': datetime.datetime.now(datetime.timezone.utc), 'items': []}; self.highlights.append(h)
            h['name'] = nm
            if body.get('p_items') is not None: h['items'] = list(dict.fromkeys(body['p_items']))
            return {**self.media(me, me), 'saved': h['id']}
        if name == 'social_highlight_delete':
            self.highlights = [h for h in self.highlights if not (h['id'] == body['p_id'] and h['owner'] == me)]; return self.media(me, me)
        if name == 'social_contact_settings': return {}
        return []

    def route(self, route):
        req = route.request; url = req.url
        if '/auth/v1/user' in url: return route.fulfill(json={'id': OWNER, 'email': 'owner@example.test'})
        if '/rest/v1/userdata' in url:
            return route.fulfill(json=[] if req.method == 'GET' else [{'updated_at': '2026-10-18T10:00:00Z'}])
        name = url.split('?')[0].split('/')[-1]
        body = req.post_data_json if req.post_data else {}
        try: result = self.handle(name, body or {})
        except Refusal as e: return route.fulfill(status=400, json={'code': 'P0001', 'message': str(e)})
        route.fulfill(json=result)

    def seed(self):
        """A friend with two live stories and a post, a stranger with a public story and post, and one friends-only post."""
        self.add(FRIEND, 'story', (230, 90, 70), 'Chest day', age_hours=3)
        self.add(FRIEND, 'story', (60, 120, 220), '', age_hours=1)
        self.add(FRIEND, 'post', (80, 160, 110), 'New PR on bench', age_hours=5)
        self.add(STRANGER, 'story', (240, 200, 60), 'Leg day', age_hours=2)
        self.add(STRANGER, 'post', (150, 90, 200), 'Morning run', age_hours=8)
        self.add(STRANGER, 'post', (90, 90, 90), 'Friends only', audience='friends', age_hours=1)   # not visible to the owner (not friends)
        return self
