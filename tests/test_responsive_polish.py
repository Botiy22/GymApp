"""Focused real-browser regression for adaptive actions, recipe media and avatar viewing."""
import functools
import http.server
import os
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

class ResponsivePolish(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.pw=sync_playwright().start()
        cls.browser=cls.pw.chromium.launch(executable_path=os.environ.get('GYMAPP_BROWSER_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop();cls.server.shutdown();cls.server.server_close()

    def page(self,width=390,height=844,lang='en',text=16,light=False):
        context=self.browser.new_context(viewport={'width':width,'height':height},service_workers='block',reduced_motion='reduce')
        context.route('**/js/config.js',lambda r:r.fulfill(body="window.CLOUD={url:'',key:''};",content_type='application/javascript'))
        page=context.new_page();self.addCleanup(context.close)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/');page.wait_for_function('()=>!!window.__gym')
        page.evaluate('''([lang,text,light])=>{Store.d.settings.lang=lang;Store.d.settings.calm=true;Store.d.settings.bg=light?'light':'deep';Store.d.settings.targets={kcal:2650,p:194,c:293,f:78};Store.d.settings.hue=225;Store.d.settings.accentTone='vivid';__gym.A['set-bg']?.({dataset:{v:Store.d.settings.bg}});document.documentElement.style.fontSize=text+'px';__gym.render();}''',[lang,text,light])
        return page,errors

    def bounds(self,page,label):
        issues=page.evaluate('''()=>{const vw=innerWidth;return [...document.querySelectorAll('#view button,#view input,#view select,#workout button,#workout input,#workout select,#sheet button,#sheet input,#sheet select,#tabbar button')].filter(e=>e.getClientRects().length).map(e=>({a:e.dataset.a,text:e.textContent.trim().slice(0,35),r:e.getBoundingClientRect()})).filter(x=>x.r.left<-1||x.r.right>vw+1).map(x=>({a:x.a,text:x.text,left:x.r.left,right:x.r.right}));}''')
        self.assertEqual(issues,[],label)
        self.assertTrue(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),label)
        labels=page.evaluate("""()=>[...document.querySelectorAll('#tabbar button,.seg button')].filter(b=>b.getClientRects().length).flatMap(b=>{const e=b.querySelector('span')||b,r=document.createRange();r.selectNodeContents(e);const p=b.getBoundingClientRect();return [...r.getClientRects()].filter(x=>x.left<p.left-1||x.right>p.right+1).map(x=>({label:b.textContent.trim(),left:x.left,right:x.right,parentLeft:p.left,parentRight:p.right}));})""")
        self.assertEqual(labels,[],label)


    def test_phone_and_landscape_layouts(self):
        for width,height,text in [(320,740,16),(360,780,16),(375,812,16),(390,844,16),(430,932,16),(320,740,20),(390,844,20),(844,390,16)]:
            for lang in ['en','hu']:
                with self.subTest(width=width,height=height,text=text,lang=lang):
                    page,errors=self.page(width,height,lang,text,light=lang=='hu')
                    page.evaluate('()=>__gym.A["routine-template-add"]({dataset:{id:"full3"}})') # Optional library plan; the personal split is no longer seeded.
                    for tab in ['home','food','goals','profile','settings']:
                        page.locator('.profile-shortcut' if tab=='profile' else f'#tabbar [data-tab={tab}]').click()
                        self.bounds(page,f'{width}/{text}/{lang}/{tab}')
                        if tab=='food':
                            page.evaluate('()=>{const day=__gym.ui.foodDate;Store.d.food[day]=[{id:"fixture-food",name:"Chicken and broccoli with creamy rice and roasted vegetables",g:450,kcal:525,p:47,c:208.60000000000002,f:11.9}];__gym.render()}')
                            self.bounds(page,'populated food')

                            buttons=page.locator('.food-actions .btn')
                            self.assertEqual(buttons.count(),3)
                            self.assertTrue(buttons.evaluate_all('(bs)=>bs.every(b=>{const s=b.querySelector("span");return s.scrollWidth<=s.clientWidth+1 && s.getBoundingClientRect().right<=b.getBoundingClientRect().right-4})'))
                            # The three real actions still open the correct input modes.
                            for selector in ['[data-a=food-manual]','[data-a=food-ai][data-m=photo]','[data-a=food-ai][data-m=text]']:
                                page.locator(selector).click();self.assertTrue(page.locator('#sheet').evaluate('(d)=>d.open'))
                                page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
                        if tab=='home':
                            for v in ['plans','exercises','history','train']:
                                page.locator(f'.workout-tabs [data-v={v}]').click();self.bounds(page,f'{width}/{lang}/workout/{v}')
                            page.locator('[data-a=w-start]').first.click();self.bounds(page,'active workout')
                            page.evaluate('()=>{Store.d.active=null;__gym.ui.wOpen=false;Store.save();__gym.render()}')

                        if tab=='profile':
                            for v in ['ranks','friends','overview']:
                                page.locator(f'.profile-tabs [data-v={v}]').click();self.bounds(page,f'{width}/{lang}/profile/{v}')
                        if tab=='goals':
                            page.locator('[data-a=goals-view][data-v=progress]').click();self.bounds(page,'progress')
                    self.assertEqual(errors,[])
                    page.context.close()

    def test_each_recipe_has_its_own_sharp_image(self):
        page,errors=self.page()
        page.locator('#tabbar [data-tab=food]').click();page.locator('[data-a=food-view][data-v=ideas]').click()
        cards=page.locator('.recipe-card');self.assertEqual(cards.count(),19)
        sources=cards.locator('img').evaluate_all('(imgs)=>imgs.map(i=>i.getAttribute("src"))')
        self.assertEqual(len(set(sources)),19)
        for index in range(cards.count()):
            card=cards.nth(index);recipe_id=card.get_attribute('data-id');card.click()
            img=page.locator('.recipe-hero img');img.wait_for()
            page.wait_for_function('()=>document.querySelector(".recipe-hero img")?.complete')
            self.assertTrue(img.evaluate('(i)=>i.naturalWidth>=1280 && i.naturalHeight>=960'))
            self.assertEqual(img.get_attribute('src'),f'img/recipes/{recipe_id}.webp')
            self.assertEqual(page.locator('.recipe-hero img[style]').count(),0)
            self.bounds(page,recipe_id)
            self.assertTrue(page.locator('.ing').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
            page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(errors,[])

    def test_recipe_images_work_from_verified_offline_release(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow',reduced_motion='reduce')
        self.addCleanup(context.close)
        # Disable accounts in this browser only; serve every hashed file unchanged.
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        page=context.new_page();page.goto(f'http://127.0.0.1:{self.server.server_port}/');page.wait_for_function('()=>!!window.__gym')
        page.evaluate('async()=>{await navigator.serviceWorker.ready}')
        page.wait_for_function('()=>!!navigator.serviceWorker.controller',timeout=30000)
        page.reload();page.wait_for_function('()=>!!window.__gym')
        context.set_offline(True)
        page.reload();page.wait_for_function('()=>!!window.__gym')
        page.locator('#tabbar [data-tab=food]').click();page.locator('[data-a=food-view][data-v=ideas]').click()
        cards=page.locator('.recipe-card');self.assertEqual(cards.count(),19)
        for index in range(cards.count()):
            card=cards.nth(index);card.scroll_into_view_if_needed()
            page.wait_for_function('(id)=>{const i=document.querySelector(`[data-id="${id}"].recipe-card img`);return i?.complete&&i.naturalWidth===384}',arg=card.get_attribute('data-id'))
            card.click();page.wait_for_function('()=>document.querySelector(".recipe-hero img")?.naturalWidth===1448')
            page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')

    def test_photo_enlargement_locks_page_and_preserves_draft(self):
        page,errors=self.page(320)
        # A real browser-generated image fixture; no user data or external image fetches.
        photo=page.evaluate('''()=>{const c=document.createElement('canvas');c.width=480;c.height=360;const x=c.getContext('2d');x.fillStyle='#4169e1';x.fillRect(0,0,480,360);return c.toDataURL('image/png')}''')
        page.evaluate('photo=>{Store.d.settings.publicProfile=Profile.clean({username:"test_user",displayName:"Test User",avatar:photo});Store.save();__gym.ui.tab="profile";__gym.render()}',photo)
        self.assertEqual(page.locator('[data-a=profile-photo-view]').count(),1)
        page.locator('[data-a=profile-photo-view]').click()
        image=page.locator('.profile-photo-view img');self.assertEqual(image.get_attribute('src'),photo)
        self.assertGreater(image.bounding_box()['width'],200)
        self.assertTrue(page.evaluate('document.body.style.position==="fixed"'))
        tab=page.evaluate('__gym.ui.tab');page.locator('#tabbar [data-tab=food]').dispatch_event('click')
        self.assertEqual(page.evaluate('__gym.ui.tab'),tab)
        page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        page.locator('[data-a=profile-edit]').click();page.locator('[name=displayName]').fill('Unsaved name')
        page.locator('#sheet [data-a=profile-photo-view]').click();self.assertEqual(page.locator('.profile-photo-view img').count(),1)
        page.locator('[data-a=sheet-back]').click();self.assertEqual(page.locator('[name=displayName]').input_value(),'Unsaved name')
        page.locator('[data-a=sheet-close]').click();page.wait_for_function('()=>!document.querySelector("#sheet").open')
        page.reload();page.wait_for_function('()=>!!window.__gym');self.assertEqual(page.evaluate('Store.d.settings.publicProfile.avatar'),photo)
        self.assertEqual(errors,[])

if __name__=='__main__':
    unittest.main()
