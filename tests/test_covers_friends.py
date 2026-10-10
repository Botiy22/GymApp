"""Photo covers, uncluttered friend panels, check-in updates and phone layouts using fixtures."""
import unittest
from pathlib import Path
from PIL import Image
import test_responsive_polish as responsive
import test_profile_sharing as sharing

class CoversFriends(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    auth_page=sharing.ProfileSharing.auth_page

    def test_cover_upload_cancel_save_restore_remove(self):
        page,errors=self.page(320,844,'hu',20)
        pic=Path('/tmp/reppsy-cover-fixture.png');Image.new('RGB',(1600,900),(55,104,180)).save(pic)
        page.locator('.profile-shortcut').click();page.locator('[data-a=profile-edit]').click()
        self.assertEqual(page.locator('.profile-colors').count(),0)
        for cover in ['grid','orbit','horizon']:
            page.locator(f'[data-a=profile-style-choice][data-v={cover}]').click();self.assertEqual(page.locator('.profile-preview.cover-'+cover).count(),1)
        page.locator('[name=displayName]').fill('Kept while changing cover')
        page.locator('[data-in=profile-cover-photo]').set_input_files(str(pic));page.wait_for_function('()=>__gym.ui.profileStyleDraft.cover==="photo"')
        image=page.locator('.profile-preview>.profile-cover-photo');image.wait_for();self.assertGreaterEqual(image.evaluate('(i)=>i.naturalWidth'),1280)
        self.bounds(page,'photo cover editor');page.screenshot(path='/tmp/reppsy-cover-editor-320.png')
        page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.evaluate('Store.d.settings.publicProfile.coverPhoto'),'')
        page.locator('[data-a=profile-edit]').click();page.locator('[name=username]').fill('fixture_cover')
        page.locator('[data-in=profile-cover-photo]').set_input_files(str(pic));page.wait_for_function('()=>__gym.ui.profileStyleDraft.cover==="photo"')
        page.locator('button[form=profile-edit-form]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.evaluate('Store.d.settings.profileStyle.cover'),'photo')
        page.evaluate('()=>Store.replace(JSON.parse(Store.exportJSON()).data)');page.reload();page.wait_for_function('()=>!!window.__gym');page.locator('.profile-shortcut').click()
        self.assertEqual(page.locator('.profile-cover-photo').count(),1);self.bounds(page,'saved cover');page.screenshot(path='/tmp/reppsy-cover-profile-320.png')
        page.locator('[data-a=profile-edit]').click();page.locator('[data-a=cover-photo-remove]').click()
        page.locator('button[form=profile-edit-form]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.evaluate('Store.d.settings.publicProfile.coverPhoto'),'');self.assertEqual(page.locator('.profile-cover-photo').count(),0);self.assertEqual(errors,[])

    def test_populated_friends_phone_layouts_and_search_panels(self):
        for width,text,lang in [(320,20,'hu'),(390,16,'en'),(844,16,'en')]:
            page,calls,errors=self.auth_page();page.set_viewport_size({'width':width,'height':390 if width==844 else 844})
            data={'competition_version':2,'profile':{'username':'owner','stats':{'score':1020,'workout_points':800,'meal_points':220}},'friends':[{'user_id':'friend-fixture','username':'friend_fixture'}],'incoming':[{'request_id':'request-fixture','user_id':'pending-fixture','username':'pending_fixture'}],'outgoing':[{'user_id':'out-fixture','username':'outgoing_fixture'}],'leaderboard':[{'user_id':'owner-fixture','username':'owner','display_name':'A very long display name that still fits','score':1020,'days':4,'meal_points':220},{'user_id':'friend-fixture','username':'friend_fixture','display_name':'Friend with a long name','score':1020,'days':4,'meal_points':220}]}
            page.route('**/rest/v1/rpc/social_dashboard_v2',lambda r:r.fulfill(json=data))
            page.evaluate('([lang,text])=>{Store.d.settings.lang=lang;Store.d.settings.calm=true;document.documentElement.style.fontSize=text+"px";__gym.ui.tab="profile";__gym.ui.profilePage="friends";__gym.render();__gym.A["social-refresh"]()}',[lang,text])
            page.wait_for_function('()=>Social.state.competitionReady&&Social.state.data?.friends.length===1')
            self.assertEqual(page.locator('#friend-identifier').count(),0);self.assertEqual(page.locator('.weekly-total b').inner_text(),page.evaluate('(1020).toLocaleString(Store.d.settings.lang==="hu"?"hu-HU":"en-GB")'))
            self.assertEqual(page.locator('.board-place').all_inner_texts(),['1','1']);self.bounds(page,'friend list')
            page.screenshot(path=f'/tmp/reppsy-friends-{width}-{lang}.png')
            page.locator('[data-a=friend-search-open]').click();self.bounds(page,'add friend')
            page.locator('#friend-identifier').fill('friend_name');page.locator('[data-in=friend-kind]').select_option('email')
            self.assertEqual(page.locator('#friend-identifier').get_attribute('type'),'email');self.assertEqual(page.locator('#friend-identifier').input_value(),'')
            page.locator('[data-in=friend-kind]').select_option('username');page.locator('#friend-identifier').fill('new_friend');page.locator('form[data-f=friend-add] button').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
            self.assertTrue(any(n=='social_request_friend' and b['p_username']=='new_friend' for n,b in calls));self.assertEqual(errors,[])

    def test_workout_and_meal_ticks_refresh_competition_and_undo(self):
        page,calls,errors=self.auth_page()
        def dashboard(route):
            points=page.evaluate('Competition.week(Store.d)')
            route.fulfill(json={'competition_version':2,'profile':{'username':'owner','stats':points},'incoming':[],'outgoing':[],'friends':[],'leaderboard':[{'user_id':'owner-fixture','username':'owner','score':points['score']}]})
        page.route('**/rest/v1/rpc/social_dashboard_v2',dashboard)
        page.evaluate('()=>{__gym.A["w-tick"]({dataset:{id:Store.d.routines[0].id}});const day=__gym.ui.foodDate,index=(new Date(day+"T12:00").getDay()+6)%7;const meal={id:"meal1",name:"Breakfast",kcal:400,p:25,c:45,f:13,items:[{n:"Breakfast",g:200}]};Store.d.plan={name:"Fixture",days:{[index]:{meals:[meal]}},notes:[],train:[]};Store.save();__gym.A["pm-tick"]({dataset:{d:day,m:"meal1"}});__gym.A["profile-home"]();}')
        page.locator('[data-a=profile-view][data-v=friends]').click();page.wait_for_function('()=>Social.state.data?.profile.stats.score===120&&!Social.state.busy')
        self.assertEqual(page.locator('.weekly-total b').inner_text(),'120');self.assertEqual(page.evaluate('WorkoutEnergy.workout(Store.d.workouts[0]).strength'),0)
        page.evaluate('()=>{__gym.A["pm-tick"]({dataset:{d:__gym.ui.foodDate,m:"meal1"}});__gym.A["w-untick"]({dataset:{id:Store.d.workouts[0].id}});__gym.A["social-refresh"]()}')
        page.wait_for_function('()=>Social.state.data?.profile.stats.score===0&&!Social.state.busy');self.assertEqual(page.locator('.weekly-total b').inner_text(),'0');self.assertEqual(errors,[])

    def test_weekly_challenges_complete_and_recalculate_after_undo(self):
        page,errors=self.page(320,844,'hu',20)
        page.evaluate("""()=>{const now=Date.now(),day=new Date().toISOString().slice(0,10);Store.d.workouts=[{id:'challenge',start:now,end:now,entries:[{ex:'Barbell_Bench_Press_-_Medium_Grip',sets:Array.from({length:10},()=>({kg:5,reps:8}))}]}];Store.d.food={[day]:[{id:'meal',kcal:400}]};Store.save();}""")
        page.locator('#tabbar [data-tab=goals]').click();self.bounds(page,'weekly challenges')
        values=page.locator('.weekly-challenges progress').evaluate_all('(els)=>els.map(e=>[e.value,e.max])');self.assertEqual(values,[[1,3],[10,10],[1,5]])
        page.locator('.weekly-challenges summary').click();self.assertFalse(page.locator('.weekly-challenges').evaluate('(e)=>e.open'))
        page.locator('.profile-shortcut').click();page.locator('[data-a=profile-view][data-v=ranks]').click();self.assertIn('Alapozó',page.locator('[data-rank=bench]').inner_text())
        page.evaluate("()=>{Store.d.workouts=[];Store.save()}");page.locator('#tabbar [data-tab=goals]').click();self.assertEqual(page.locator('.weekly-challenges progress').first.evaluate('(e)=>e.value'),0);self.assertEqual(errors,[])

    def test_missing_new_migration_keeps_friends_and_explains_scoring(self):
        page,calls,errors=self.auth_page()
        page.route('**/rest/v1/rpc/social_dashboard_v2',lambda r:r.fulfill(status=404,json={'code':'PGRST202','message':'missing function'}))
        page.locator('.profile-shortcut').click();page.locator('[data-a=profile-view][data-v=friends]').click()
        page.wait_for_function('()=>!!Social.state.data?.profile&&!Social.state.busy')
        self.assertFalse(page.evaluate('Social.state.competitionReady'));self.assertEqual(page.locator('.weekly-card .clean-board').count(),0)
        self.assertIn('Supabase',page.locator('.weekly-card').inner_text());self.assertEqual(page.locator('[data-a=friend-search-open]').count(),2);self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
