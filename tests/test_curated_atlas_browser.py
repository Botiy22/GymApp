"""Curated browsing, illustrations, serving logging and legacy-plan compatibility."""
import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout
from choice_navigation import choose

class CuratedAtlas(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_curated_library_images_zoom_muscles_and_all_guides(self):
        p,errors=self.page(320,844,'hu',20)
        select_workout(p,'exercises')
        self.assertEqual(p.evaluate('EXERCISES.length'),100)
        p.locator('[data-in=lib-q]').fill('ulo labnyujto gep')
        p.locator('#lib-list [data-a=ex-open][data-id=Leg_Extensions]').click()
        self.bounds(p,'exercise on narrow phone')
        self.assertEqual(p.locator('exercise-demo').count(),0)
        self.assertEqual(p.locator('.drawing-phase').count(),2)
        p.wait_for_function('()=>[...document.querySelectorAll(".drawing-phase img")].every(i=>i.complete&&i.naturalWidth>0)')
        p.locator('.drawing-phase').first.click()
        p.wait_for_function('()=>{const i=document.querySelector(".drawing-zoom img");return i?.complete&&i.naturalWidth>0}')
        p.locator('[data-a=sheet-back]').click()
        p.screenshot(path='/tmp/reppsy-atlas-mobile.png')
        choose(p,'[data-a=ex-visual][data-v=muscles]')
        self.assertGreater(p.locator('.muscle-spotlight .mm-hi').count(),0)
        p.locator('[data-a=sheet-close]').click()
        for id in p.evaluate('CURATED_EXERCISES.map(x=>x.id)'):
            p.evaluate('(id)=>__gym.A["ex-open"]({dataset:{id}})',id)
            # Reset visual mode if the previously opened exercise selected muscle view.
            choose(p,'[data-a=ex-visual][data-v=movement]')
            self.assertEqual(p.locator('exercise-demo').count(),0,id)
            p.wait_for_function('()=>[...document.querySelectorAll(".drawing-phase img")].length===2&&[...document.querySelectorAll(".drawing-phase img")].every(i=>i.complete&&i.naturalWidth>0)')
            self.assertGreaterEqual(p.locator('.routine-steps li').count(),3,id)
            p.locator('[data-a=sheet-close]').click()
        self.assertEqual(errors,[])

    def test_dessert_images_portions_cooking_and_logging(self):
        p,errors=self.page(390,844,'en',16)
        p.locator('#tabbar [data-tab=food]').click();choose(p,'[data-a=food-view][data-v=ideas]')
        ids=p.evaluate('RECIPES.items.filter(r=>r.id.startsWith("protein-")&&r.nutritionParts).map(r=>r.id)')
        for id in ids:
            p.locator(f'[data-a=idea-open][data-id={id}]').click()
            self.bounds(p,id)
            p.wait_for_function('()=>{const i=document.querySelector(".recipe-hero img");return i?.complete&&i.naturalWidth===1448}')
            self.assertIn('1 serving:',p.locator('#sheet').inner_text())
            if id=='protein-muffin-blueberry':
                p.screenshot(path='/tmp/reppsy-dessert-mobile.png')
                p.locator('[data-a=recipe-cook]').click();p.locator('[data-in=cook-ingredient]').first.check()
                p.locator('[data-a=cook-next]').click();self.assertIn('180 °C',p.locator('.cook-instruction').inner_text())
                p.locator('[data-a=sheet-back]').click()
                p.locator('[data-a=recipe-qty][data-n="0.5"]').click()
                p.locator('[data-a=idea-add]').click()
                rows=p.evaluate('Object.values(Store.d.food).flat()');self.assertEqual(len(rows),1)
                self.assertAlmostEqual(rows[0]['p'],31.3*1.5,delta=.1)
            else:p.locator('[data-a=sheet-close]').click()
        self.assertEqual(errors,[])

    def test_copied_legacy_and_custom_exercises_remain_available_after_reload(self):
        p,errors=self.page(390,844,'hu')
        old=p.evaluate('''()=>{const old=LEGACY_EXERCISES.find(x=>!EXERCISE_GUIDES[x.id]&&x.k>=2);const snap={version:1,routine:{name:'Imported',items:[{ex:old.id,sets:3,reps:'8',rest:60},{ex:'my_source',sets:2,reps:'12',rest:60}]},myEx:[{id:'my_source',n:'Private custom movement',p:['quadriceps'],s:[],eq:'other',steps:['Controlled movement.']}]};let n=0;const c=RoutineShare.copy(snap,Store.d,ExerciseCatalog.byId,()=> 'test'+(++n));Store.d.routines.push(c.routine);Store.d.myEx.push(...c.custom);Store.save();__gym.render();return old.id;}''')
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.assertTrue(p.evaluate('(id)=>EXERCISES.some(e=>e.id===id)',old))
        self.assertTrue(p.evaluate('EXERCISES.some(e=>e.n==="Private custom movement")'))
        p.evaluate('(id)=>__gym.A["ex-open"]({dataset:{id}})',old)
        self.assertEqual(p.locator('exercise-demo').count(),0)
        self.assertGreater(p.locator('.steps li').count(),0)
        self.assertEqual(errors,[])

    def test_new_collection_and_desserts_work_offline(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow')
        self.addCleanup(context.close)
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        p=context.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
        p.goto(f'http://127.0.0.1:{self.server.server_port}/');p.wait_for_function('()=>!!window.__gym')
        p.evaluate('()=>navigator.serviceWorker.register("sw.js")')
        p.wait_for_function('()=>navigator.serviceWorker.controller!==null',timeout=120000)
        context.set_offline(True);p.reload();p.wait_for_function('()=>!!window.__gym')
        result=p.evaluate('''async()=>{const paths=[...Object.values(GENERATED_EXERCISE_ART).flatMap(a=>[...a.pair,a.thumb]),...RECIPES.items.filter(r=>r.id.startsWith('protein-')&&r.nutritionParts).flatMap(r=>['','-thumb'].map(s=>'img/recipes/'+r.id+s+'.webp'))];return await Promise.all(paths.map(async path=>{const i=new Image();i.src=path;await i.decode();return i.naturalWidth>0;}));}''')
        self.assertEqual(result,[True]*312)
        p.evaluate('()=>__gym.A["ex-open"]({dataset:{id:"Barbell_Full_Squat"}})')
        p.wait_for_function('()=>[...document.querySelectorAll(".drawing-phase img")].every(i=>i.complete&&i.naturalWidth>0)')
        self.assertEqual(errors,[])

    def test_changed_screens_fit_narrow_and_landscape_phones(self):
        for width,height,lang,text in [(320,740,'hu',20),(844,390,'en',16)]:
            p,errors=self.page(width,height,lang,text,light=lang=='en')
            for tab in ['home','food','goals','settings','profile']:
                p.locator('.profile-shortcut' if tab=='profile' else f'#tabbar [data-tab={tab}]').click()
                self.bounds(p,tab)
            p.locator('#tabbar [data-tab=home]').click();select_workout(p,'exercises')
            self.bounds(p,'curated library')
            p.locator('[data-a=ex-open]').first.click();self.bounds(p,'exercise detail')
            self.assertTrue(p.locator('.drawing-phase').evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth})'))
            self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
