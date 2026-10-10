"""Original routine retirement/import and social interactions on synthetic accounts."""
import base64
from io import BytesIO
import json
import unittest
from PIL import Image
import test_responsive_polish as responsive
import test_profile_sharing as sharing

class RoutineReviewPolish(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    auth_page=sharing.ProfileSharing.auth_page

    def friend(self,page):
        buf=BytesIO();Image.new('RGB',(300,300),(82,110,160)).save(buf,format='PNG');avatar='data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
        page.route('**/rest/v1/rpc/social_view_profile',lambda r:r.fulfill(json={'user_id':'friend-fixture','username':'friend_fixture','avatar':avatar,'stats':{},'theme':'mint'}))
        page.evaluate('()=>__gym.A["friend-profile"]({dataset:{id:"friend-fixture"}})');page.locator('.profile-cover .profile-avatar img').wait_for()

    def test_picker_cancel_keeps_editor_draft_and_save_returns_to_profile(self):
        page,errors=self.page(320,844,'en',20)
        page.locator('.profile-shortcut').click();page.locator('[data-a=profile-edit]').click()
        page.locator('[name=displayName]').fill('Draft stays here')
        page.locator('[data-a=profile-style-choice][data-v=orbit]').click()
        for kind in ['profile-cover-photo','profile-photo']:
            # Same bubbling event fired by native file inputs on picker cancellation.
            page.locator('[data-in='+kind+']').evaluate("e=>e.dispatchEvent(new Event('cancel',{bubbles:true}))")
            self.assertTrue(page.locator('#sheet').evaluate('(e)=>e.open'))
            self.assertEqual(page.locator('[name=displayName]').input_value(),'Draft stays here')
            self.assertEqual(page.evaluate('__gym.ui.profileStyleDraft.cover'),'orbit')
            self.assertTrue(page.locator('#view').evaluate('(e)=>e.inert'))
        self.bounds(page,'cancelled cover picker')
        page.locator('[name=username]').fill('draft_fixture')
        page.locator('button[form=profile-edit-form]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.evaluate('Store.d.settings.publicProfile.displayName'),'Draft stays here')
        self.assertEqual(page.evaluate('Store.d.settings.profileStyle.cover'),'orbit')
        page.locator('[data-a=profile-edit]').click();page.keyboard.press('Escape')
        page.wait_for_function('()=>!document.querySelector("#sheet").open');self.assertEqual(errors,[])

    def test_confirmed_photo_like_count_animation_and_failure(self):
        page,calls,errors=self.auth_page();self.friend(page)
        page.emulate_media(reduced_motion='no-preference')
        page.evaluate('()=>{Store.d.settings.calm=false;document.documentElement.removeAttribute("data-calm")}')
        page.locator('[data-a=photo-like]').click();page.wait_for_function('()=>__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        count=page.locator('.photo-like-count')
        self.assertEqual(count.inner_text(),'1');self.assertEqual(count.evaluate('(e)=>getComputedStyle(e).animationName'),'photoLikeCount')
        page.locator('[data-a=photo-like]').click();page.wait_for_function('()=>!__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        page.locator('.profile-avatar[data-a=profile-photo-view]').click()
        page.locator('.photo-view-like').click();page.wait_for_function('()=>__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        self.assertEqual(page.locator('.photo-like-count').inner_text(),'1')
        self.assertTrue(page.locator('.profile-photo-view').evaluate('(e)=>e.classList.contains("like-pop")'))
        page.locator('.photo-view-like').click();page.wait_for_function('()=>!__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        page.route('**/rest/v1/rpc/social_photo_like',lambda r:r.fulfill(status=500,json={'message':'fixture failure'}))
        page.locator('.photo-view-like').click();page.wait_for_function('()=>!__gym.ui.communityBusy')
        self.assertEqual(page.locator('.photo-like-count').inner_text(),'0');self.assertEqual(page.locator('.like-count-pop').count(),0)
        page.unroute('**/rest/v1/rpc/social_photo_like');page.emulate_media(reduced_motion='reduce')
        page.locator('.photo-view-like').click();page.wait_for_function('()=>__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        self.assertEqual(page.locator('.photo-like-count').evaluate('(e)=>getComputedStyle(e).animationName'),'none');self.assertEqual(errors,[])

    def test_default_retirement_preserves_edits_history_and_active_workout(self):
        page,errors=self.page()
        self.assertFalse(page.evaluate('Store.d.routines.some(r=>PLAN.days.some(d=>d.id===r.id))'))
        raw=page.evaluate('''()=>{const rs=PLAN.days.map(d=>({id:d.id,name:{hu:d.hu,en:d.en},sub:d.sub,builtin:true,items:PLAN.items.filter(i=>i.day===d.id).map(i=>({ex:i.ex,label:{hu:i.hu,en:i.en},sets:i.sets,reps:i.reps,rest:i.rest}))}));rs[0].items[0].sets=4;const custom=JSON.parse(JSON.stringify(rs[1]));custom.id='my_lower';custom.builtin=false;Store.d.routines=rs.concat([custom]);Store.d.workouts=[{id:'history',rid:'lower',name:'Original lower',start:1,end:2,entries:[{ex:'Barbell_Full_Squat',sets:[{kg:20,reps:8}]}]}];Store.d.active={id:'active',rid:'lower',name:'In progress',start:2,entries:[],cardio:[]};Store.save();return JSON.parse(Store.exportJSON()).data;}''')
        page.reload();page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(page.evaluate('Store.d.routines.map(r=>r.id)'),['upper','my_lower'])
        self.assertEqual(page.evaluate('Store.d.routines[0].items[0].sets'),4)
        self.assertEqual(page.evaluate('Store.d.workouts[0].rid'),'lower');self.assertEqual(page.evaluate('Store.d.active.id'),'active')
        self.assertTrue(page.evaluate('()=>["lower","push","pull","legs"].every(id=>Store.d.del[id]>0)'))
        page.evaluate('(stale)=>Store.adopt(Cloud.merge(Store.cloudDoc(),stale))',raw)
        self.assertEqual(page.evaluate('Store.d.routines.map(r=>r.id)'),['upper','my_lower'])
        page.reload();page.wait_for_function('()=>!!window.__gym');self.assertEqual(page.evaluate('Store.d.routines.map(r=>r.id)'),['upper','my_lower']);self.assertEqual(errors,[])

    def test_original_json_import_is_exact_and_survives_reload(self):
        page,errors=self.page();page.locator('#tabbar [data-tab=settings]').click()
        page.on('dialog',lambda d:d.accept());page.locator('[data-in=import]').set_input_files(str(responsive.ROOT/'exports/reppsy-original-five-day.json'))
        page.wait_for_function('()=>Store.d.routines.filter(r=>r.id.startsWith("personal_")).length===5')
        expected=json.loads((responsive.ROOT/'exports/reppsy-original-five-day.json').read_text())['routines']
        self.assertEqual(page.evaluate('Store.d.routines.filter(r=>r.id.startsWith("personal_")).map(r=>r.items)'),[r['items'] for r in expected])
        page.reload();page.wait_for_function('()=>!!window.__gym');self.assertEqual(page.evaluate('Store.d.routines.filter(r=>r.id.startsWith("personal_")).length'),5)
        page.locator('#tabbar [data-tab=home]').click();page.locator('[data-a=workout-view][data-v=plans]').first.click();self.bounds(page,'imported personal split');self.assertEqual(errors,[])

    def test_achievements_close_and_remain_closed_after_redraw(self):
        page,errors=self.page(320,844,'hu',20);page.locator('.profile-shortcut').click()
        details=page.locator('[data-section=profile-achievements]');self.assertTrue(details.evaluate('(e)=>e.open'))
        details.locator('summary').click();self.assertFalse(details.evaluate('(e)=>e.open'))
        page.locator('#tabbar [data-tab=food]').click();page.locator('.profile-shortcut').click();self.assertFalse(details.evaluate('(e)=>e.open'))
        details.locator('summary').click();details.locator('[data-a=profile-badges]').click();self.bounds(page,'achievement picker');self.assertEqual(errors,[])

    def test_big_photo_double_click_and_touch_like_once(self):
        page,calls,errors=self.auth_page();self.friend(page)
        page.locator('.profile-avatar[data-a=profile-photo-view]').click();self.assertTrue(page.locator('#view').evaluate('(e)=>e.inert'))
        page.locator('.profile-photo-view img').dblclick();page.wait_for_function('()=>__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        page.locator('.profile-photo-view img').dblclick();self.assertEqual(len([n for n,b in calls if n=='social_photo_like']),1)
        page.locator('.photo-view-like').click();page.wait_for_function('()=>!__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy')
        page.evaluate('''()=>{const im=document.querySelector('.profile-photo-view img');for(let n=0;n<2;n++){im.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',pointerId:1,isPrimary:true,clientX:120,clientY:150}));im.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',pointerId:1,isPrimary:true,clientX:120,clientY:150}));}}''')
        page.wait_for_function('()=>__gym.ui.friendActivity?.liked&&!__gym.ui.communityBusy');self.assertEqual([b['p_like'] for n,b in calls if n=='social_photo_like'],[True,False,True])
        page.locator('[data-a=sheet-back]').click();self.assertEqual(page.locator('[data-a=photo-like]').get_attribute('aria-pressed'),'true');self.bounds(page,'photo liked');self.assertEqual(errors,[])

    def test_review_optional_editor_stars_failure_retry_clear_and_edit(self):
        page,calls,errors=self.auth_page();self.friend(page);self.assertEqual(page.locator('textarea[name=body]').count(),0)
        page.locator('[data-a=review-open]').first.click();page.locator('textarea[name=body]').fill('Helpful partner 😊');page.locator('[data-a=review-rating][data-v="3"]').click()
        self.assertEqual(page.locator('textarea[name=body]').input_value(),'Helpful partner 😊');self.assertEqual(page.locator('[name=rating]').input_value(),'3')
        page.set_viewport_size({'width':320,'height':844});page.evaluate('document.documentElement.style.fontSize="20px"');self.bounds(page,'review editor')
        page.route('**/rest/v1/rpc/social_review_save',lambda r:r.fulfill(status=500,json={'message':'fixture failure'}))
        page.locator('button[form=review-editor]').click();page.wait_for_function('()=>!!__gym.ui.reviewError&&!__gym.ui.communityBusy')
        self.assertEqual(page.locator('textarea[name=body]').input_value(),'Helpful partner 😊')
        page.unroute('**/rest/v1/rpc/social_review_save');page.locator('button[form=review-editor]').click();page.wait_for_function('()=>__gym.ui.reviewDraft===null&&!__gym.ui.communityBusy')
        self.assertEqual(page.locator('textarea[name=body]').count(),0);self.assertEqual(page.locator('.profile-review p').inner_text(),'Helpful partner 😊')
        self.assertEqual(page.locator('.profile-review .review-stars').inner_text(),'★★★');page.screenshot(path='/tmp/reppsy-reviews-320.png')
        page.locator('[data-a=review-open]').first.click();self.assertEqual(page.locator('textarea[name=body]').input_value(),'Helpful partner 😊');page.locator('textarea[name=body]').fill('Updated');page.locator('button[form=review-editor]').click();page.wait_for_function('()=>__gym.ui.reviewDraft===null&&!__gym.ui.communityBusy')
        self.assertEqual(page.locator('.profile-review').count(),1);self.assertEqual(page.locator('.profile-review p').inner_text(),'Updated');self.assertEqual(errors,[])

    def test_shared_update_refetches_changed_snapshot_without_duplicate(self):
        page,calls,errors=self.auth_page();activity={'likes':0,'liked':False,'reviews':[],'routines':[]}
        page.route('**/rest/v1/rpc/social_profile_activity',lambda r:r.fulfill(json=activity))
        def publish(route):
            b=route.request.post_data_json;activity['routines']=[{'id':'shared','source_id':b['p_source_id'],'snapshot':b['p_snapshot']}];route.fulfill(json={'likes':0,'liked':False,'reviews':[],'routines':[]}) # Simulate a stale mutation response.
        page.route('**/rest/v1/rpc/social_routine_publish',publish)
        page.locator('.profile-shortcut').click();page.wait_for_function('()=>!!Social.state.activity&&!Social.state.busy');page.locator('[data-a=manage-sharing]').click()
        source=page.locator('[data-a=routine-share]').first.get_attribute('data-id');page.locator('[data-a=routine-share]').first.click();page.wait_for_function('()=>Social.state.activity?.routines.length===1&&!__gym.ui.communityBusy')
        page.evaluate('(id)=>{const r=Store.d.routines.find(r=>r.id===id);r.name="Updated training";r.items[0].sets=5;Store.save();__gym.A["sheet-back"]();__gym.A["manage-sharing"]();}',source)
        self.assertIn('Changes ready',page.locator('.sharing-state').first.inner_text());page.locator('[data-a=routine-share]').first.click();page.wait_for_function('()=>Social.state.activity?.routines[0].snapshot.routine.name==="Updated training"&&!__gym.ui.communityBusy')
        self.assertEqual(len(activity['routines']),1);self.assertEqual(activity['routines'][0]['snapshot']['routine']['items'][0]['sets'],5)
        self.assertEqual(page.locator('.sharing-state').first.inner_text(),'Up to date');self.assertIn('Shared copy updated',page.locator('.sharing-notice').inner_text());self.bounds(page,'sharing update');self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
