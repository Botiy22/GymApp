"""2.28 stories/posts SQL on a real PostgreSQL: visibility, expiry, highlights, likes, limits and no direct table access.
Runs only when GYMAPP_PG points at a local server, e.g. GYMAPP_PG="host=/var/tmp/rpg port=5544 user=postgres".
The database 'reppsy_test' is dropped and recreated from supabase.sql and every migration."""
import os
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DSN = os.environ.get('GYMAPP_PG', '')
A, B, C, D = ('00000000-0000-0000-0000-00000000000' + x for x in 'abcd')
IMG = "'data:image/jpeg;base64,AAAA'"

@unittest.skipUnless(DSN and shutil.which('psql'), 'set GYMAPP_PG to run the SQL tests')
class StoriesSql(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.psql(['-c', 'drop database if exists reppsy_test', '-c', 'create database reppsy_test'], db='postgres')
        for f in [ROOT / 'tests/sql/supabase_stub.sql', ROOT / 'supabase.sql', *sorted((ROOT / 'migrations').glob('*.sql'))]:
            cls.psql(['-f', str(f)])
        cls.psql(['-c', f"""insert into auth.users(id) values ('{A}'),('{B}'),('{C}'),('{D}');
          insert into public.social_profiles(user_id,username) values ('{A}','anna'),('{B}','bela'),('{C}','csaba');
          insert into public.social_connections(sender,recipient,accepted) values ('{A}','{B}',true);"""])

    @classmethod
    def psql(cls, args, db='reppsy_test'):
        out = subprocess.run(['psql', DSN + ' dbname=' + db, '-v', 'ON_ERROR_STOP=1', '-q', '-At', *args], capture_output=True, text=True)
        if out.returncode: raise AssertionError(out.stderr)
        return out.stdout.strip()

    def q(self, who, sql):
        """Run sql as the signed-in user `who` (role authenticated); returns the last line of output or raises with the error."""
        out = subprocess.run(['psql', DSN + ' dbname=reppsy_test', '-q', '-At', '-v', 'ON_ERROR_STOP=1', '-c', f"set role authenticated; select set_config('request.jwt.claim.sub','{who}',false);", '-c', sql], capture_output=True, text=True)
        if out.returncode: raise RuntimeError(out.stderr.strip())
        return out.stdout.strip().splitlines()[-1] if out.stdout.strip() else ''

    def admin(self, sql):
        return self.psql(['-c', sql])

    def test_visibility_expiry_highlights_and_likes(self):
        self.q(A, f"select public.social_post_create('story',{IMG},{IMG},'Chest day','everyone',null)")
        self.q(A, f"select public.social_post_create('story',{IMG},{IMG},'friends','friends',2)")
        self.q(A, f"select public.social_post_create('story',{IMG},{IMG},'just me','me',null)")
        self.q(A, f"select public.social_post_create('post',{IMG},{IMG},'Public post','everyone',null)")
        self.q(A, f"select public.social_post_create('post',{IMG},{IMG},'Friends post','friends',null)")
        hours = self.admin("select round(extract(epoch from expires_at-created_at)/3600) from public.social_posts where caption='Chest day'")
        self.assertEqual(hours, '24')                                                              # a day when no time is given
        self.assertEqual(self.admin("select count(*) from public.social_posts where kind='post' and expires_at is not null"), '0')
        annas = f"(select g->'items' from jsonb_array_elements(public.social_story_feed()) g where g->'user'->>'user_id'='{A}')"
        self.assertEqual(self.q(A, f"select jsonb_array_length({annas})"), '3')
        self.assertEqual(self.q(B, f"select jsonb_array_length({annas})"), '2')
        self.assertEqual(self.q(C, f"select jsonb_array_length({annas})"), '1')
        self.assertEqual(self.q(C, f"select count(*) from jsonb_array_elements(public.social_post_feed()->'posts') p where p->>'owner'='{A}'"), '1')
        self.assertEqual(self.q(B, f"select {annas}->0 ? 'audience'"), 'f')   # others never see the audience setting
        friends_post = self.admin("select id from public.social_posts where caption='Friends post'")
        with self.assertRaisesRegex(RuntimeError, 'post_not_found'): self.q(C, f"select public.social_post_like('{friends_post}',true)")
        self.assertEqual(self.q(B, f"select public.social_post_like('{friends_post}',true)->>'likes'"), '1')
        self.assertEqual(self.q(B, f"select public.social_post_like('{friends_post}',true)->>'likes'"), '1')   # liking twice counts once
        self.assertEqual(self.q(A, f"select jsonb_array_length(public.social_post_likers('{friends_post}'))"), '1')
        with self.assertRaisesRegex(RuntimeError, 'post_not_found'): self.q(B, f"select public.social_post_likers('{friends_post}')")
        # An ended story leaves the feed but stays visible inside a highlight.
        chest = self.admin("update public.social_posts set expires_at=now()-interval '1 hour' where caption='Chest day' returning id").splitlines()[0]
        self.assertEqual(self.q(C, f"select coalesce(jsonb_array_length({annas}),0)"), '0')
        self.assertEqual(self.q(A, f"select jsonb_array_length(public.social_highlight_save(null,'Chest day',array['{chest}'::uuid])->'highlights')"), '1')
        self.assertEqual(self.q(C, f"select public.social_user_media('{A}')->'highlights'->0->>'name'"), 'Chest day')
        self.assertEqual(self.q(C, f"select jsonb_array_length(public.social_media(array['{chest}'::uuid]))"), '1')
        # Old ended stories are cleaned up, unless they are kept in a highlight.
        self.admin("update public.social_posts set expires_at=now()-interval '40 days' where caption in ('Chest day','just me')")
        self.q(A, f"select public.social_post_create('story',{IMG},{IMG},'new','everyone',null)")
        self.assertEqual(self.admin(f"select string_agg(caption,',' order by caption) from public.social_posts where kind='story' and owner='{A}'"), 'Chest day,friends,new')

    def test_refusals_and_no_direct_access(self):
        with self.assertRaisesRegex(RuntimeError, 'profile_required'): self.q(D, f"select public.social_post_create('post',{IMG},{IMG},'','everyone',null)")
        with self.assertRaisesRegex(RuntimeError, 'invalid_duration'): self.q(A, f"select public.social_post_create('story',{IMG},{IMG},'','everyone',500)")
        with self.assertRaisesRegex(RuntimeError, 'check constraint'): self.q(A, f"select public.social_post_create('story','data:text/html;base64,AAAA',{IMG},'','everyone',5)")
        with self.assertRaisesRegex(RuntimeError, 'check constraint'): self.q(A, f"select public.social_post_create('post',{IMG},{IMG},'','public',null)")
        with self.assertRaisesRegex(RuntimeError, 'highlight_name'): self.q(A, "select public.social_highlight_save(null,'  ',null)")
        other = self.q(B, f"select public.social_post_create('story',{IMG},{IMG},'bela story','everyone',null)->>'id'")
        with self.assertRaisesRegex(RuntimeError, 'post_not_found'): self.q(A, f"select public.social_highlight_save(null,'Mine',array['{other}'::uuid])")
        with self.assertRaisesRegex(RuntimeError, 'post_not_found'): self.q(A, f"select public.social_post_delete('{other}')")
        with self.assertRaisesRegex(RuntimeError, 'permission denied'): self.q(A, 'select count(*) from public.social_posts')
        with self.assertRaisesRegex(RuntimeError, 'permission denied'): self.q(A, 'select count(*) from public.social_post_likes')
        with self.assertRaisesRegex(RuntimeError, 'permission denied'): self.q(A, 'select public.social_post_visible(null,null)')
        with self.assertRaisesRegex(RuntimeError, 'sign_in'): self.q('', 'select public.social_story_feed()')

if __name__ == '__main__':
    unittest.main()
