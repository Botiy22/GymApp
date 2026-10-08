#!/usr/bin/env python3
"""Exercise the social migration in a disposable PostgreSQL instance.
Requires pgserver and psycopg2-binary; no real credentials or account data.
"""
import json
import subprocess
from pathlib import Path
import tempfile
import unittest
import pgserver
import psycopg2
from psycopg2.extras import Json

ROOT=Path(__file__).resolve().parents[1]
A='00000000-0000-4000-8000-000000000001'
B='00000000-0000-4000-8000-000000000002'
C='00000000-0000-4000-8000-000000000003'

class SocialDatabaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=pgserver.get_server(tempfile.mkdtemp(prefix='gymapp-social-test-'),cleanup_mode='delete')
        cls.db=psycopg2.connect(cls.server.get_uri());cls.db.autocommit=True
        with cls.db.cursor() as cur:
            cur.execute("""create role anon;create role authenticated;
                create schema auth;create table auth.users(id uuid primary key);
                create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
                grant usage on schema auth to authenticated,anon;""")
            cur.execute((ROOT/'supabase.sql').read_text())
            # Reapplying the migration must preserve tables, policies and data.
            for _ in range(2):cur.execute((ROOT/'migrations/20261008_social.sql').read_text())
    @classmethod
    def tearDownClass(cls):
        cls.db.close();cls.server.cleanup()
    def setUp(self):
        with self.db.cursor() as cur:
            cur.execute('reset role;truncate auth.users cascade;')
            cur.execute('insert into auth.users values(%s),(%s),(%s)',(A,B,C))
            cur.execute("select (extract(epoch from now())*1000)::bigint")
            self.now=cur.fetchone()[0]-1000
            for uid in [A,B,C]:cur.execute('insert into public.userdata(user_id,data) values(%s,%s)',(uid,Json({'workouts':[]})))
        self.save(A,'alice');self.save(B,'bob');self.save(C,'charlie')
    def sql(self,user,query,args=(),role='authenticated'):
        with self.db.cursor() as cur:
            cur.execute('set role '+role)
            cur.execute("select set_config('request.jwt.claim.sub',%s,false)",(user or '',))
            try:
                cur.execute(query,args)
                row=cur.fetchone() if cur.description else None
                return row[0] if row else None
            finally:cur.execute('reset role')
    def rpc(self,user,name,*args):
        return self.sql(user,'select public.'+name+'('+','.join(['%s']*len(args))+')',args)
    def save(self,user,name,badges=None):return self.rpc(user,'social_save_profile',name,name.title(),'A gym bio.','','mint',badges or [])
    def dashboard(self,user):return self.rpc(user,'social_dashboard')
    def request(self):return self.rpc(A,'social_request_friend','bob')['id']
    def workouts(self,user,logs):
        with self.db.cursor() as cur:cur.execute('update public.userdata set data=%s where user_id=%s',(Json({'workouts':logs,'food':{'private':'secret'},'settings':{'apiKey':'private-test-marker'}}),user))
    def workout(self,weight=100,reps=5,sets=1,**extras):
        return {'id':'fixture','start':self.now-1000,'end':self.now,'entries':[{'ex':'Barbell_Bench_Press_-_Medium_Grip','sets':[{'kg':weight,'reps':reps,'w':False} for _ in range(sets)]}],**extras}
    def test_requests_require_recipient_acceptance(self):
        request=self.request()
        self.assertEqual(1,len(self.dashboard(B)['incoming']))
        self.assertEqual(1,len(self.dashboard(A)['leaderboard']))
        with self.assertRaises(psycopg2.Error):self.rpc(A,'social_respond_friend',request,True)
        with self.assertRaises(psycopg2.Error):self.rpc(C,'social_respond_friend',request,True)
        self.rpc(B,'social_respond_friend',request,True)
        self.assertEqual(2,len(self.dashboard(A)['leaderboard']))
        self.assertEqual(1,len(self.dashboard(B)['friends']))
    def test_cross_requests_are_idempotent_and_do_not_auto_accept(self):
        request=self.request()
        self.assertEqual(request,self.rpc(B,'social_request_friend','alice')['id'])
        self.assertEqual([],self.dashboard(A)['friends'])
        self.assertEqual(request,self.request())
    def test_decline_cancel_and_remove_revoke_profile_access(self):
        request=self.request();self.rpc(B,'social_respond_friend',request,False)
        self.assertEqual([],self.dashboard(A)['outgoing'])
        self.request();self.rpc(A,'social_remove_friend',B)
        self.assertEqual([],self.dashboard(B)['incoming'])
        request=self.request();self.rpc(B,'social_respond_friend',request,True)
        self.rpc(A,'social_remove_friend',B)
        with self.assertRaises(psycopg2.Error):self.rpc(A,'social_view_profile',B)
        self.assertEqual(1,len(self.dashboard(A)['leaderboard']))
    def test_stats_and_badges_are_derived_not_client_scores(self):
        self.workouts(A,[self.workout(sets=25)])
        self.save(A,'alice',['first','bench','fifty','balance'])
        p=self.dashboard(A)['profile']
        self.assertEqual(200,p['stats']['score'])
        self.assertEqual(['first','bench'],p['badges'])
        self.assertEqual(4,p['stats']['highest'])
        self.assertNotIn('fifty',p['stats']['badges'])
        self.workouts(A,[])
        self.assertEqual([],self.dashboard(A)['profile']['badges'])
    def test_warmups_ticks_future_unfinished_and_other_weeks_do_not_score(self):
        warm=self.workout(200);warm['entries'][0]['sets'][0]['w']=True
        future=self.workout();future['start']=self.now+100000;future['end']=self.now+120000
        unfinished=self.workout();unfinished['end']=0
        old=self.workout();old['start']=self.now-14*86400000;old['end']=old['start']+1000
        self.workouts(A,[warm,future,unfinished,old,self.workout(tick=True)])
        p=self.dashboard(A)['profile']
        self.assertEqual(0,p['stats']['score'])
        self.assertEqual(1,p['stats']['workouts'])
        self.assertEqual(4,p['stats']['highest'])
    def test_private_userdata_and_bio_not_exposed_to_requests(self):
        self.workouts(B,[self.workout()]);self.request()
        p=self.rpc(A,'social_view_profile',B)
        self.assertEqual({},p['stats']);self.assertEqual('',p['bio']);self.assertEqual([],p['badges'])
        data=json.dumps(self.dashboard(A))
        self.assertNotIn('private-test-marker',data);self.assertNotIn('secret',data)
        self.assertIsNone(self.sql(A,'select data from public.userdata where user_id=%s',(B,)))
        with self.assertRaises(psycopg2.Error):self.rpc(C,'social_view_profile',B)
    def test_raw_tables_helpers_and_anonymous_rpcs_are_denied(self):
        for query in ['select * from public.social_profiles','select * from public.social_connections','select public.social_stats(\''+B+'\')','select public.social_number(\'1\')']:
            with self.assertRaises(psycopg2.Error):self.sql(A,query)
        with self.assertRaises(psycopg2.Error):self.sql(None,'select public.social_dashboard()',role='anon')
        with self.assertRaises(psycopg2.Error):self.rpc(None,'social_dashboard')
    def test_unique_case_insensitive_usernames_and_profile_constraints(self):
        with self.assertRaises(psycopg2.errors.UniqueViolation):self.save(C,'ALICE')
        with self.assertRaises(psycopg2.Error):self.save(C,'not a name')
        with self.assertRaises(psycopg2.Error):self.rpc(C,'social_save_profile','charlie','Charlie','bio','data:image/svg+xml;base64,AAAA','mint',[])
        with self.assertRaises(psycopg2.Error):self.rpc(C,'social_save_profile','charlie','Charlie','bio','','mint',['first']*5)
    def test_self_unknown_and_request_limits(self):
        with self.assertRaises(psycopg2.Error):self.rpc(A,'social_request_friend','alice')
        with self.assertRaises(psycopg2.Error):self.rpc(A,'social_request_friend','unknown')
        with self.db.cursor() as cur:
            for i in range(100):
                uid='10000000-0000-4000-8000-'+str(i).zfill(12)
                cur.execute('insert into auth.users values(%s)',(uid,))
                cur.execute('insert into public.social_profiles(user_id,username) values(%s,%s)',(uid,'fixture_'+str(i)))
                cur.execute('insert into public.social_connections(sender,recipient) values(%s,%s)',(A,uid))
        with self.assertRaises(psycopg2.Error):self.request()
    def test_browser_and_database_milestones_match_every_rank_boundary(self):
        tracks=[('Barbell_Bench_Press_-_Medium_Grip',[20,40,60,80,100,140]),('Barbell_Full_Squat',[20,40,80,100,140,200]),('Barbell_Deadlift',[40,60,100,140,180,240]),('Standing_Military_Press',[10,20,30,40,60,80])]
        cases=[]
        for exercise,weights in tracks:
            for weight in [0]+[n for w in weights for n in [w-.01,w]]:
                w=self.workout(weight=weight);w['entries'][0]['ex']=exercise;cases.append([w])
        script="globalThis.window=globalThis;require('./js/strength-ranks.js');require('./js/profile.js');const x=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(x.cases.map(w=>Profile.summary(w,x.now))));"
        local=json.loads(subprocess.check_output(['node','-e',script],input=json.dumps({'cases':cases,'now':self.now+1000}).encode(),cwd=ROOT))
        for logs,expected in zip(cases,local):
            self.workouts(A,logs);actual=self.dashboard(A)['profile']['stats']
            self.assertEqual(expected['highest'],actual['highest'],logs)
            self.assertEqual(expected['score'],actual['score'],logs)
            self.assertEqual([b['id'] for b in expected['badges'] if b['earned']],actual['badges'],logs)
    def test_friend_cap_does_not_allow_accepting_a_fifty_first_friend(self):
        request=self.request()
        with self.db.cursor() as cur:
            for i in range(50):
                uid='20000000-0000-4000-8000-'+str(i).zfill(12)
                cur.execute('insert into auth.users values(%s)',(uid,))
                cur.execute('insert into public.social_profiles(user_id,username) values(%s,%s)',(uid,'friend_'+str(i)))
                cur.execute('insert into public.social_connections(sender,recipient,accepted) values(%s,%s,true)',(B,uid))
        with self.assertRaises(psycopg2.Error):self.rpc(B,'social_respond_friend',request,True)
        self.assertEqual(1,len(self.dashboard(B)['incoming']))

    def test_malformed_import_data_cannot_break_dashboard(self):
        self.workouts(A,[{'start':'bad','end':{},'entries':'bad'},self.workout(weight='NaN'),self.workout(reps='Infinity')])
        self.assertEqual(105,self.dashboard(A)['profile']['stats']['score'])

if __name__=='__main__':unittest.main()
