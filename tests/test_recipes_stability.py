from workout_navigation import select_workout
"""Equal recipe cards, guided cooking, and private stability/knee sections."""
import unittest
import test_responsive_polish as responsive

class RecipesStability(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def recipes(self,p):
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-view][data-v=ideas]').click()

    def test_two_equal_columns_all_macros_and_phone_layout(self):
        for width,lang,text in [(320,'hu',20),(390,'en',16),(844,'hu',16)]:
            p,errors=self.page(width,844,lang,text,light=lang=='hu');self.recipes(p);self.bounds(p,'recipe grid')
            self.assertEqual(p.locator('[data-a=food-view][data-v=ideas]').inner_text(),'Receptek' if lang=='hu' else 'Recipes')
            metrics=p.locator('.recipe-card').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})')
            self.assertEqual(len(metrics),p.evaluate('RECIPES.items.length'));self.assertEqual(metrics[0]['y'],metrics[1]['y']);self.assertGreater(metrics[1]['x'],metrics[0]['x'])
            self.assertLess(max(m['h'] for m in metrics)-min(m['h'] for m in metrics),1)
            self.assertEqual(p.locator('.recipe-card-macros>span').count(),3*len(metrics))
            gnocchi=p.locator('[data-a=idea-open][data-id=clip-chicken-gnocchi]');self.assertIn('—',gnocchi.inner_text());self.assertEqual(gnocchi.locator('img').get_attribute('src'),'img/recipes/clip-chicken-gnocchi-thumb.webp')
            p.locator('[data-a=idea-cat][data-c=breakfast]').click();self.assertEqual(p.locator('.recipe-card').count(),len(p.evaluate('RECIPES.items.filter(r=>r.cat==="breakfast")')))
            p.screenshot(path=f'/tmp/reppsy-recipes-{width}-{lang}.png');self.assertEqual(errors,[])

    def test_high_density_phone_uses_the_whole_sharp_image(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},device_scale_factor=3,service_workers='block',reduced_motion='reduce');self.addCleanup(context.close)
        context.route('**/js/config.js',lambda r:r.fulfill(body="window.CLOUD={url:'',key:''};",content_type='application/javascript'))
        p=context.new_page();p.goto(f'http://127.0.0.1:{self.server.server_port}/');p.wait_for_function('()=>!!window.__gym');self.recipes(p)
        image=p.locator('[data-id=clip-chicken-gnocchi] img')
        image.scroll_into_view_if_needed();p.wait_for_function('()=>{const i=document.querySelector("[data-id=clip-chicken-gnocchi] img");return i?.complete&&i.naturalWidth>0&&i.currentSrc.endsWith("clip-chicken-gnocchi.webp")}')
        self.assertTrue(image.evaluate('(e)=>e.currentSrc.endsWith("clip-chicken-gnocchi.webp")'))
        self.assertEqual(image.evaluate('async e=>{const bitmap=await createImageBitmap(await (await fetch(e.currentSrc)).blob());return bitmap.width}'),1448)

    def test_cooking_checklist_steps_return_and_no_automatic_logging(self):
        p,errors=self.page(320,844,'hu',20);self.recipes(p)
        p.locator('[data-a=idea-open][data-id=clip-chicken-gnocchi]').click();p.locator('[data-a=recipe-cook]').click();self.bounds(p,'ingredient checklist')
        p.locator('[data-in=cook-ingredient]').first.check();p.locator('[data-a=cook-next]').click()
        self.assertEqual(p.locator('.cook-instruction').inner_text(),p.evaluate('RECIPES.items.find(r=>r.id==="clip-chicken-gnocchi").steps.hu[0]'));self.bounds(p,'cooking step')
        p.locator('[data-a=cook-back]').click();self.assertTrue(p.locator('[data-in=cook-ingredient]').first.is_checked())
        steps=p.evaluate('RECIPES.items.find(r=>r.id==="clip-chicken-gnocchi").steps.hu.length')
        for i in range(steps+1):p.locator('[data-a=cook-next]').click()
        self.assertEqual(p.locator('.recipe-cooking').count(),0);self.assertEqual(p.locator('.recipe-hero').count(),1)
        self.assertTrue(p.locator('#view').evaluate('(e)=>e.inert'));self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),0)
        p.locator('[data-a=recipe-cook]').click();self.assertTrue(p.locator('[data-in=cook-ingredient]').first.is_checked());self.assertEqual(errors,[])

    def test_incomplete_video_nutrition_still_requires_completion(self):
        p,errors=self.page();self.recipes(p);p.locator('[data-a=idea-open][data-id=clip-ham-flatbread]').click()
        p.locator('[data-a=idea-add]').click();self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),0)
        self.assertTrue(p.evaluate('__gym.ui.manual.requireMacros'));self.assertEqual(errors,[])

    def test_stability_and_knee_routing_preserves_ids_data_sync_and_history(self):
        p,errors=self.page(320,844,'hu',20)
        p.evaluate('()=>{Store.d.routines.push({id:"sequence-fixture",name:"My sequence",builtin:false,items:[{ex:"Standing_Calf_Raises",sets:2,reps:"8",rest:45}]});Store.save();__gym.render()}')
        select_workout(p,'stability');self.bounds(p,'stability page')
        p.locator('[data-a=stability-view][data-v=knee]').click();self.bounds(p,'knee recovery page')
        p.locator('[data-a=stability-organise]').click();p.locator('[data-a=stability-move][data-id=sequence-fixture]').click()
        self.assertEqual(p.locator('.stability-routines [data-id=sequence-fixture]').count(),1)
        self.assertEqual(p.evaluate('Store.d.routines.find(r=>r.id==="sequence-fixture").items[0].sets'),2)
        select_workout(p,'plans');self.assertEqual(p.locator('#view [data-a=r-open][data-id=sequence-fixture]').count(),0)
        self.assertEqual(p.evaluate('JSON.parse(Store.exportJSON()).data.routines.find(r=>r.id==="sequence-fixture").focus'),'knee')
        p.evaluate('()=>Store.adopt(Cloud.merge(Store.cloudDoc(),Store.cloudDoc()))');p.reload();p.wait_for_function('()=>!!window.__gym')
        select_workout(p,'stability');p.locator('[data-a=stability-view][data-v=knee]').click()
        p.locator('[data-a=r-open][data-id=sequence-fixture]').click();p.locator('[data-a=r-edit]').click();self.bounds(p,'routine section editor')
        p.locator('[data-in=re-focus]').select_option('strength');p.locator('[data-a=re-save]').click()
        select_workout(p,'plans');self.assertEqual(p.locator('#view [data-a=r-open][data-id=sequence-fixture]').count(),1);self.assertEqual(errors,[])

    def test_new_knee_sequence_keeps_area_through_picker_save(self):
        p,errors=self.page();select_workout(p,'stability');p.locator('[data-a=stability-view][data-v=knee]').click()
        p.locator('[data-a=r-new]').click();p.locator('[data-a=pick]').first.click();p.locator('[data-a=pick-done]').click()
        self.assertEqual(p.locator('[data-in=re-focus]').input_value(),'knee');p.locator('[data-in=re-name]').fill('User sequence');p.locator('[data-a=re-save]').click()
        self.assertEqual(p.locator('.stability-routines .rcard').count(),1);self.assertEqual(p.evaluate('Store.d.routines.find(r=>r.name==="User sequence").focus'),'knee');self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
