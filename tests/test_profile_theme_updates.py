"""Local phone and verified two-release update checks. No accounts or user data."""
import functools
import hashlib
import http.server
import json
import threading
import unittest
from urllib.parse import urlsplit
import test_responsive_polish as responsive

class ReleaseServer(responsive.Quiet):
    def do_GET(self):
        path=urlsplit(self.path).path.lstrip('/')
        body=self.server.overrides.get(path)
        if body is None:return super().do_GET()
        self.send_response(200)
        self.send_header('Content-Type','application/javascript' if path.endswith('.js') else 'application/json')
        self.send_header('Cache-Control','no-cache')
        self.end_headers();self.wfile.write(body)

class ProfileThemeUpdates(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        responsive.ResponsivePolish.setUpClass.__func__(cls)
        cls.server.shutdown();cls.server.server_close()
        cls.server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(ReleaseServer,directory=str(responsive.ROOT)))
        cls.server.overrides={}
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_settings_open_optional_collapse_and_stronger_colors(self):
        for width,lang,text,light in [(320,'hu',20,False),(390,'en',16,True)]:
            page,errors=self.page(width,844,lang,text,light)
            page.locator('#tabbar [data-tab=settings]').click()
            self.assertTrue(page.locator('.settings-group').evaluate_all('(ds)=>ds.length>=6&&ds.every(d=>d.open)'))
            self.assertTrue(page.locator('.mini-section').evaluate_all('(ds)=>ds.every(d=>d.open)'))
            self.assertEqual(page.locator('[data-a=update-now]').count(),0)
            self.assertEqual(page.locator('.update-app').count(),0)
            self.assertEqual(page.locator('[data-a=set-palette][data-v="350"]').count(),1)
            page.locator('[data-a=set-palette][data-v="270"]').click()
            self.assertEqual(page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()'),'rgb(53,88,244)')
            page.locator('[data-a=set-palette][data-v="350"]').click()
            self.assertEqual(page.evaluate('Store.d.settings.accentTone'),'vivid')
            self.assertIn('Reppsy',page.locator('.hue-wheel-preview').inner_text())
            custom=page.locator('[data-section=custom-accent]')
            custom.locator('summary').click();self.assertFalse(custom.evaluate('(d)=>d.open'))
            page.locator('[data-a=set-bg]').first.click()
            self.assertFalse(custom.evaluate('(d)=>d.open'))
            workout=page.locator('[data-section=settings-workout]')
            workout.locator('summary').click();self.assertFalse(workout.evaluate('(d)=>d.open'))
            page.locator('#tabbar [data-tab=food]').click();page.locator('#tabbar [data-tab=settings]').click()
            self.assertFalse(workout.evaluate('(d)=>d.open'));self.bounds(page,'settings collapsibles')
            page.screenshot(path=f'/tmp/reppsy-settings-{width}-{lang}.png')
            self.assertEqual(errors,[])

    def test_profile_live_preview_cover_frame_and_photo_navigation(self):
        page,errors=self.page(320,844,'hu',20)
        photo=page.evaluate('''()=>{const c=document.createElement('canvas');c.width=400;c.height=400;const x=c.getContext('2d');x.fillStyle='#e93390';x.fillRect(0,0,400,400);return c.toDataURL('image/png')}''')
        page.evaluate('p=>{Store.d.settings.publicProfile=Profile.clean({username:"fixture_user",displayName:"Fixture",avatar:p});Store.save();__gym.render()}',photo)
        self.assertEqual(page.locator('.profile-shortcut img').get_attribute('src'),photo)
        page.locator('.profile-shortcut').click();self.assertEqual(page.evaluate('__gym.ui.tab'),'profile')
        self.assertEqual(page.locator('#tabbar [data-tab=profile]').count(),0)
        page.locator('[data-a=profile-edit]').click()
        page.locator('[name=displayName]').fill('Live preview')
        self.assertIn('Live preview',page.locator('.profile-preview h2').inner_text())
        page.locator('.profile-color-wheel .hue-wheel').focus();page.locator('.profile-color-wheel .hue-wheel').press('End')
        page.locator('[data-a=profile-style-choice][data-v=mesh]').click()
        page.locator('[data-a=profile-style-choice][data-v=ring]').click()
        page.locator('[data-in=profile-style]').check()
        self.assertEqual(page.locator('.profile-preview.cover-mesh.frame-ring.profile-use-accent').count(),1)
        self.bounds(page,'profile editing')
        page.screenshot(path='/tmp/reppsy-profile-preview-320.png')
        page.locator('button[form=profile-edit-form]').click()
        page.wait_for_function('()=>!document.querySelector("#sheet").open')
        page.evaluate('()=>Store.replace(JSON.parse(Store.exportJSON()).data)')
        page.reload();page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(page.evaluate('Store.d.settings.profileStyle'),{'cover':'mesh','frame':'ring','useAccent':True})
        page.locator('.profile-shortcut').click()
        self.assertEqual(page.locator('.profile-cover.cover-mesh.frame-ring.profile-use-accent').count(),1)
        self.assertEqual(page.locator('.profile-identity h2').inner_text(),'Live preview')
        self.bounds(page,'saved profile');self.assertEqual(errors,[])

    def test_update_visibility_and_network_failure_recovery(self):
        page,errors=self.page(320,844,'hu',20)
        page.locator('#tabbar [data-tab=settings]').click()
        page.wait_for_function('()=>!__gym.ui.updateAvailable')
        self.assertEqual(page.locator('.update-app').count(),0)
        page.route('**/release-manifest.json?check=*',lambda r:r.fulfill(json={'version':'2.20.1','build':'20261010.5'}))
        page.evaluate('()=>__gym.checkForUpdate(true)')
        self.assertEqual(page.locator('.update-app').count(),1);self.bounds(page,'available update header')
        for tab in ['home','food','goals','profile']:
            page.locator('.profile-shortcut' if tab=='profile' else f'#tabbar [data-tab={tab}]').click()
            self.assertEqual(page.locator('.update-app').count(),0)
            self.assertEqual(page.locator('.profile-shortcut').count(),1)
        page.locator('#tabbar [data-tab=settings]').click()
        page.unroute('**/release-manifest.json?check=*')
        page.route('**/release-manifest.json?check=*',lambda r:r.abort())
        page.locator('.update-app').click()
        page.wait_for_function('()=>!__gym.ui.updateBusy')
        self.assertEqual(page.locator('#app-update-progress').count(),0)
        self.assertFalse(page.locator('#view').evaluate('(e)=>e.inert'))
        self.assertEqual(page.evaluate('__gym.ui.updateStatus'),'updateFail')
        self.assertEqual(errors,[])

    def test_cached_shell_loads_new_helpers_before_store_initialization(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='block')
        self.addCleanup(context.close)
        context.route('**/js/config.js',lambda r:r.fulfill(body="window.CLOUD={url:'',key:''};",content_type='application/javascript'))
        html=(responsive.ROOT/'index.html').read_text()
        for script in ['competition','routine-share','app-updates','accent-theme','hue-wheel','food-volume']:
            html=html.replace(f'<script src="js/{script}.js"></script>','')
        profile=(responsive.ROOT/'js/profile.js').read_text()
        old_profile=profile.replace('clean,cleanStyle,symbol','clean,symbol')
        calls=[]
        def old_once(route):
            calls.append(True)
            route.fulfill(body=old_profile if len(calls)==1 else profile,content_type='application/javascript')
        context.route('**/js/profile.js*',old_once)
        context.route(f'http://127.0.0.1:{self.server.server_port}/',lambda r:r.fulfill(body=html,content_type='text/html'))
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/')
        page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(len(calls),2)
        self.assertTrue(page.evaluate('!!AppUpdates&&!!AccentTheme&&!!HueWheel&&!!FoodVolume'))
        self.assertEqual(page.evaluate('Store.d.settings.profileStyle.cover'),'glow')
        self.assertEqual(errors,[])

    def test_verified_update_reload_preserves_diary_and_confirms_build(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow',reduced_motion='reduce')
        self.addCleanup(context.close)
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/');page.wait_for_function('()=>!!window.__gym')
        page.evaluate('async()=>{await navigator.serviceWorker.ready}')
        page.wait_for_function('()=>!!navigator.serviceWorker.controller')
        page.evaluate('()=>{Store.d.settings.lang="en";Store.d.settings.profileStyle={cover:"stripe",frame:"round",useAccent:true};Store.d.food[__gym.ui.foodDate]=[{id:"safe-fixture",name:"Milk",g:258,vml:250,kcal:129,p:9,c:12,f:5}];Store.save()}')
        page.evaluate('()=>__gym.checkForUpdate(true)') # Finish the startup check before publishing the fixture release.
        old=(responsive.ROOT/'js/release.js').read_bytes()
        new=old.replace(b"const version = '2.20.0'",b"const version = '2.20.1'").replace(b"const build = '20261010.4'",b"const build = '20261010.5'")
        manifest=json.loads((responsive.ROOT/'release-manifest.json').read_text());manifest.update(version='2.20.1',build='20261010.5')
        manifest['assets']['js/release.js']=hashlib.sha256(new).hexdigest()
        self.server.overrides={'js/release.js':new,'release-manifest.json':json.dumps(manifest).encode()}
        self.addCleanup(lambda:setattr(self.server,'overrides',{}))
        page.evaluate('()=>__gym.checkForUpdate(true)')
        page.locator('#tabbar [data-tab=settings]').click();page.locator('.update-app').click()
        page.locator('#app-update-progress').wait_for()
        self.assertTrue(page.locator('#view').evaluate('(e)=>e.inert'))
        with page.expect_navigation(wait_until='domcontentloaded',timeout=45000):
            page.wait_for_function('()=>document.querySelector("#app-update-progress")?.classList.contains("ready")',timeout=40000)
        page.wait_for_function('()=>window.__gym&&GYM_RELEASE.version==="2.20.1"')
        self.assertEqual(page.evaluate('__gym.ui.updateStatus'),'updateSuccess')
        self.assertEqual(page.locator('#toast').inner_text(),'Reppsy has been updated.')
        self.assertEqual(page.evaluate('Object.values(Store.d.food).flat()[0].vml'),250)
        self.assertEqual(page.evaluate('Store.d.settings.profileStyle.cover'),'stripe')
        page.locator('#tabbar [data-tab=settings]').click()
        self.assertEqual(page.locator('.update-app').count(),0)
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
