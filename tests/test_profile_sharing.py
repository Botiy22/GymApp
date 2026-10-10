"""Real browser fixtures for profile hues, materials, exports and authenticated social actions."""
import json
import unittest
import test_responsive_polish as responsive

class ProfileSharing(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_profile_wheel_centering_isolated_and_saved(self):
        for width,lang,text in [(320,'hu',20),(390,'en',16)]:
            page,errors=self.page(width,844,lang,text)
            page.locator('.profile-shortcut').click();page.locator('[data-a=profile-edit]').click()
            wheel=page.locator('.profile-color-wheel .hue-wheel');wheel.focus();wheel.press('Home');wheel.press('ArrowRight')
            self.assertEqual(page.evaluate('__gym.ui.profileDraft.theme'),'hue_1')
            self.assertEqual(page.evaluate('Store.d.settings.hue'),225)
            offset=wheel.locator('b').evaluate('(b)=>{const a=b.getBoundingClientRect(),w=b.closest(".hue-wheel").getBoundingClientRect();return Math.abs(a.left+a.width/2-w.left-w.width/2)}')
            self.assertLess(offset,1);self.bounds(page,'profile wheel')
            page.locator('[name=username]').fill('fixture_user');page.locator('button[form=profile-edit-form]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
            page.reload();page.wait_for_function('()=>!!window.__gym');self.assertEqual(page.evaluate('Store.d.settings.publicProfile.theme'),'hue_1')
            self.assertEqual(page.locator('#tabbar button').count(),4)
            page.screenshot(path=f'/tmp/reppsy-glass-{width}.png');self.assertEqual(errors,[])

    def test_background_material_spacing_and_plan_export(self):
        page,errors=self.page();page.locator('#tabbar [data-tab=settings]').click()
        backgrounds=[]
        for v in ['plain','deep','aurora']:
            page.locator(f'[data-a=set-bg][data-v={v}]').click();backgrounds.append(page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--bg")'))
        self.assertEqual(len(set(backgrounds)),3)
        for v in ['glass','matte','balanced']:
            page.locator(f'[data-a=material][data-v={v}]').click();self.assertEqual(page.evaluate('Store.d.settings.material'),v)
        buttons=page.locator('[data-section=settings-data]>.section-body>.btn')
        gaps=buttons.evaluate_all('(bs)=>bs.slice(1).map((b,i)=>b.getBoundingClientRect().top-bs[i].getBoundingClientRect().bottom)')
        self.assertTrue(all(g>=13 for g in gaps),gaps)
        with page.expect_download() as dl:page.locator('[data-a=export-plan]').click()
        with open(dl.value.path()) as f:doc=json.load(f)
        self.assertEqual(doc['kind'],'plan');self.assertTrue(doc['appendRoutines']);self.assertNotIn('settings',doc);self.assertNotIn('workouts',doc)
        before=page.evaluate('Store.d.routines.length');self.assertTrue(page.evaluate('(d)=>__gym.applyPlan(d)',doc));self.assertEqual(page.evaluate('Store.d.routines.length'),before)
        self.bounds(page,'data');self.assertEqual(errors,[])

    def auth_page(self,signed=True):
        context=self.browser.new_context(viewport={'width':320,'height':844},service_workers='block',reduced_motion='reduce');self.addCleanup(context.close)
        context.route('**/js/config.js',lambda r:r.fulfill(body="window.CLOUD={url:'https://fixture.supabase.co',key:'fixture-public-key-long-enough'}",content_type='application/javascript'))
        if signed:context.add_init_script("localStorage.setItem('gymapp.v1.session',JSON.stringify({access_token:'fixture-token',expires_at:4000000000,user:{id:'owner-fixture',email:'owner@example.test'}}))")
        calls=[]
        activity={'likes':0,'liked':False,'reviews':[],'routines':[]}
        snapshot={'version':1,'routine':{'name':'Shared bench','icon':'push','items':[{'ex':'Barbell_Bench_Press_-_Medium_Grip','sets':4,'reps':'8','rest':120}]},'myEx':[]}
        def api(route):
            req=route.request;name=req.url.split('/')[-1];body=req.post_data_json if req.post_data else {};calls.append((name,body))
            if name in ['social_dashboard','social_dashboard_v2']:result={'competition_version':2,'profile':{'username':'owner','stats':{'score':0,'workout_points':0,'meal_points':0}},'incoming':[],'outgoing':[],'friends':[],'leaderboard':[]}
            elif name=='social_view_profile':result={'user_id':'friend-fixture','username':'friend','avatar':'data:image/png;base64,YQ==','stats':{},'theme':'mint'}
            elif name=='social_profile_activity':result={**activity,'routines':[{'id':'shared-fixture','source_id':'source','snapshot':snapshot}]} if body['p_user']=='friend-fixture' else activity
            elif name=='social_photo_like':activity['liked']=body['p_like'];activity['likes']=1 if body['p_like'] else 0;result={**activity,'routines':[{'id':'shared-fixture','source_id':'source','snapshot':snapshot}]}
            elif name=='social_review_save':activity['reviews']=[{'id':'review-fixture','author':'owner-fixture','username':'owner','rating':body['p_rating'],'body':body['p_text']}];result=activity
            elif name=='social_routine_publish':activity['routines']=[{'id':'owner-share','source_id':body['p_source_id'],'snapshot':body['p_snapshot']}];result=activity
            elif name=='social_routine_unshare':activity['routines']=[];result=activity
            elif name=='social_routine_get':result=snapshot
            elif name=='social_username_available':result=body['p_username']!='taken'
            elif name=='signup':result={'user':{'id':'new-fixture','identities':[{'id':'identity'}]}}
            else:result=[]
            route.fulfill(json=result)
        context.route('https://fixture.supabase.co/**',api)
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(f'http://127.0.0.1:{self.server.server_port}/');page.wait_for_function('()=>!!window.__gym');page.evaluate('()=>{Store.d.settings.lang="en";Store.d.settings.calm=true;__gym.render()}')
        return page,calls,errors

    def test_signup_username_metadata_and_duplicate_preflight(self):
        page,calls,errors=self.auth_page(False)
        page.evaluate('()=>{__gym.ui.gate.setup={step:4,profile:{sex:"m",goal:"cut",age:"30",height:"180",weight:"80",activity:1.55}};__gym.A["gate-mode"]({dataset:{v:"up"}})}')
        for handle in ['taken','Fresh_User']:
            page.locator('#gate [name=username]').fill(handle);page.locator('#gate [name=email]').fill('fixture@example.test');page.locator('#gate [name=password]').fill('fixture-password');page.locator('#gate button[type=submit],#gate button.btn.primary.big').click();page.wait_for_function('()=>!__gym.ui.gate.busy')
            if handle=='taken':self.assertEqual(len([c for c in calls if c[0]=='signup']),0)
        signup=[c[1] for c in calls if c[0]=='signup'][0]
        self.assertEqual(signup['data']['reppsy_username'],'fresh_user');self.assertEqual(signup['data']['otisport_onboarding']['profile']['goal'],'cut');self.assertEqual(errors,[])

    def test_publication_requires_choice_and_can_be_stopped(self):
        page,calls,errors=self.auth_page();page.locator('.profile-shortcut').click()
        page.wait_for_function('()=>!!Social.state.activity')
        self.assertFalse(any(c[0]=='social_routine_publish' for c in calls))
        page.locator('[data-a=manage-sharing]').click();page.locator('[data-a=routine-share]').first.click()
        page.wait_for_function('()=>Social.state.activity?.routines.length===1')
        publication=[c[1] for c in calls if c[0]=='social_routine_publish'][0]
        self.assertNotIn('workouts',publication['p_snapshot']);self.assertNotIn('settings',publication['p_snapshot'])
        self.assertTrue(all('kg' not in i for i in publication['p_snapshot']['routine']['items']))
        self.bounds(page,'manage sharing')
        page.locator('[data-a=routine-unshare]').click();page.wait_for_function('()=>Social.state.activity?.routines.length===0')
        self.assertEqual(errors,[])

    def test_friend_photo_review_and_fresh_copy(self):
        page,calls,errors=self.auth_page()
        page.evaluate('()=>__gym.A["friend-profile"]({dataset:{id:"friend-fixture"}})')
        page.locator('[data-a=photo-like]').click();page.wait_for_function('()=>__gym.ui.friendActivity?.liked')
        page.locator('[data-a=routine-copy]').click();page.wait_for_function('()=>Store.d.routines.some(r=>r.name==="Shared bench")')
        self.assertTrue(any(c[0]=='social_routine_get' for c in calls))
        page.locator('textarea[name=body]').fill('<Helpful friend>');page.locator('form[data-f=profile-review] button').click();page.wait_for_function('()=>__gym.ui.friendActivity?.reviews.length===1')
        self.assertEqual(page.locator('.profile-review p').inner_text(),'<Helpful friend>');self.assertEqual(page.locator('.profile-review p *').count(),0)
        self.bounds(page,'friend activity');self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
