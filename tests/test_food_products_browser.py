"""Real UI: resolve the user's meal, persist retailer labels, use dl and block partial logs."""
import unittest
from choice_navigation import choose
import test_responsive_polish as responsive
TEXT='''50g choco-oat musli
71g banan
10g dio
65g fagyi gyumi
15g erythritol
200g pilos high protein yoghurt, low fat ni added sugar 20g protein coconut flavour
17ml pilos freefrom lactosefree tej 1,5 fat
Fahej por'''
class FoodProductsBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def describe(self,p,text):
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-ai][data-m=text]').click()
        p.locator('[data-in=ai-text]').fill(text);p.locator('[data-a=ai-go]').click()
        p.locator('.ai-item, .ai-pending').first.wait_for()
    def test_new_oats_text_clarify_log_and_reuse_labels_on_small_phone(self):
        text=(responsive.ROOT/'tests/fixtures/oats-description.txt').read_text().strip()
        p,errors=self.page(320,844,'hu',20)
        calls=[]
        p.route('https://api.anthropic.com/**',lambda r:(calls.append(r.request.url),r.abort()))
        p.evaluate("Store.d.settings.apiKey='test-key';Store.d.settings.keyState='ok'")
        self.describe(p,text)
        self.assertEqual(p.locator('.ai-pending section').count(),7)
        self.assertTrue(p.locator('[data-a=ai-add]').is_disabled())
        self.bounds(p,'oats pending')
        p.locator('[data-a=ai-fruit][data-kind=berries]').click()
        p.locator('[data-a=ai-choice]').filter(has_text='Kevés').click()
        p.locator('[data-a=ai-choice]').filter(has_text='lecsepegtetve').click()
        p.locator('[data-a=ai-choice]').filter(has_text='általános becslés').click()
        self.assertEqual(p.locator('.ai-pending section').count(),3)
        # Synthetic labels only. Saving a label re-runs analysis: prior choices must remain settled.
        for values in [('400','10','60','10'),('70','10','5','1'),('46','3.4','4.8','1.5')]:
            p.locator('[data-a=ai-label]').first.click()
            if values[0]=='70':
                self.assertEqual(p.locator('#fmf [name=p]').input_value(),'10')
                self.assertEqual(p.locator('#fmf [name=port]').input_value(),'200')
            for key,value in zip(['kcal','p','c','f'],values):p.locator(f'#fmf [name={key}]').fill(value)
            p.locator('[form=fmf]').click()
        self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertEqual(p.locator('.ai-item').count(),8)
        self.assertEqual(p.locator('[data-in=ai-f][data-k=dl]').input_value(),'0.1')
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("yoghurt")).p'),20)
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("Fagyasztott")).grams'),80)
        self.assertTrue(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("mogyoróvaj")).approx'))
        self.assertFalse(p.locator('[data-a=ai-add]').is_disabled());self.bounds(p,'oats ready')
        p.screenshot(path='/tmp/oats-analysis-ready.png')
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(len(p.evaluate('Object.values(Store.d.food).flat()')),8)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().find(f=>f.vml).vml'),10)
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.describe(p,text)
        self.assertEqual(p.locator('.ai-pending section').count(),4)
        self.assertEqual(p.evaluate('Store.d.myFoods.length'),3)
        self.assertEqual(p.locator('.ai-item').count(),4)
        self.assertEqual(calls,[]);self.assertEqual(errors,[])
    def test_with_protein_uses_previously_saved_labels_for_the_full_meal(self):
        text=(responsive.ROOT/'tests/fixtures/oats-description.txt').read_text().strip().replace('sugar 20g','sugar with 20g')
        p,errors=self.page(390,844,'hu')
        # Synthetic labels represent foods already saved under the earlier, shorter wording.
        p.evaluate("""Store.d.myFoods=[
          {id:'muesli-test',name:'choco-oat musli',kcal:400,p:10,c:60,f:10},
          {id:'yogurt-test',name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1},
          {id:'milk-test',name:'Pilos freefrom lactosefree tej 1,5 fat',basis:'ml',kcal:46,p:3.4,c:4.8,f:1.5},
          {id:'peanut-test',name:'Alnatura crunchy peanut butter',kcal:600,p:25,c:20,f:48}
        ];Store.save()""")
        self.describe(p,text)
        self.assertEqual(p.locator('.ai-pending section').count(),3)
        self.assertEqual(p.locator('[data-a=ai-label]').count(),1) # Only the optional canned-fruit label.
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("yoghurt")).p'),20)
        p.locator('[data-a=ai-fruit][data-kind=berries]').click()
        p.locator('[data-a=ai-choice]').filter(has_text='Kevés').click()
        p.locator('[data-a=ai-choice]').filter(has_text='lecsepegtetve').click()
        self.assertEqual(p.locator('.ai-item').count(),8)
        self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertFalse(p.locator('[data-a=ai-add]').is_disabled())
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(len(p.evaluate('Object.values(Store.d.food).flat()')),8)
        self.assertEqual(p.evaluate('Store.d.myFoods.length'),4)
        self.assertEqual(errors,[])
    def test_entire_oats_meal_can_be_logged_without_labels_or_api_key(self):
        text=(responsive.ROOT/'tests/fixtures/oats-description.txt').read_text().strip().replace('sugar 20g','sugar with 20g')
        p,errors=self.page(320,844,'hu',20)
        calls=[]
        p.route('https://api.anthropic.com/**',lambda r:(calls.append(r.request.url),r.abort()))
        p.evaluate("Store.d.settings.apiKey='';Store.d.myFoods=[];Store.save()")
        self.describe(p,text)
        self.assertIn('(4)',p.locator('[data-a=ai-estimate]').inner_text())
        self.bounds(p,'optional estimates')
        p.locator('[data-a=ai-estimate]').click()
        self.assertEqual(p.locator('.ai-pending section').count(),3)
        self.assertEqual(p.locator('.ai-item .ai-db').filter(has_text='Becsült tápértékek').count(),4)
        self.assertTrue(p.locator('[data-a=ai-add]').is_disabled())
        p.locator('[data-a=ai-fruit][data-kind=berries]').click()
        p.locator('[data-a=ai-choice]').filter(has_text='Kevés').click()
        p.locator('[data-a=ai-choice]').filter(has_text='lecsepegtetve').click()
        self.assertEqual(p.locator('.ai-item').count(),8)
        self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertEqual(p.locator('[data-in=ai-f][data-k=dl]').input_value(),'0.1')
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("yoghurt")).p'),20)
        self.assertFalse(p.locator('[data-a=ai-add]').is_disabled());self.bounds(p,'estimated meal ready')
        p.screenshot(path='/tmp/oats-no-labels-ready.png')
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(len(p.evaluate('Object.values(Store.d.food).flat()')),8)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().filter(f=>f.estimated).length'),4)
        self.assertEqual(p.evaluate('Store.d.myFoods.length'),0)
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().filter(f=>f.estimated).length'),4)
        self.assertEqual(calls,[]);self.assertEqual(errors,[])

    def test_estimates_survive_reanalysis_but_exact_labels_take_priority(self):
        p,errors=self.page(390,844,'en')
        self.describe(p,'200g Pilos high protein coconut yoghurt low fat with 20g protein\n100g unknown Pilos product')
        p.locator('[data-a=ai-estimate]').click()
        p.locator('[data-in=ai-text]').fill('100g Pilos high protein coconut yoghurt low fat with 10g protein\n100g unknown Pilos product')
        p.locator('[data-a=ai-refine]').click()
        p.locator('.ai-item').first.wait_for()
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items[0].grams'),100)
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items[0].p'),10)
        self.assertTrue(p.evaluate('__gym.ui.ai.res.items[0].estimated'))
        # Synthetic exact label added independently; next analysis must prefer it.
        p.evaluate("Store.d.myFoods=[{name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1}]")
        p.locator('[data-a=ai-refine]').click();p.locator('.ai-item').first.wait_for()
        self.assertTrue(p.evaluate('__gym.ui.ai.res.items[0].label'))
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items[0].kcal'),70)
        p.locator('[data-a=ai-reset]').click();self.assertFalse(p.evaluate('__gym.ui.ai.allowEstimates'))
        self.assertEqual(errors,[])

    def test_quick_log_paste_preserves_lines_and_inline_screenshot_text_logs_eight_items(self):
        text=(responsive.ROOT/'tests/fixtures/oats-description.txt').read_text().strip().replace('sugar 20g','sugar with 20g')
        for pasted in [False,True]:
            with self.subTest(pasted=pasted):
                p,errors=self.page(390 if pasted else 320,844,'hu',16 if pasted else 20)
                p.locator('#tabbar [data-tab=food]').click()
                box=p.locator('.quick-log textarea[name=q]')
                value=text if pasted else text.replace('\n',' ')
                if pasted:
                    p.context.grant_permissions(['clipboard-read','clipboard-write'])
                    p.evaluate('(text)=>navigator.clipboard.writeText(text)',value)
                    box.focus();box.press('Control+V')
                else:box.fill(value)
                self.assertEqual(box.input_value(),value)
                box.press('Enter')
                p.locator('[data-a=ai-estimate]').wait_for()
                self.assertEqual(p.evaluate('__gym.ui.ai.text'),value)
                self.assertEqual(p.locator('.ai-pending section').count(),7)
                self.assertIn('(4)',p.locator('[data-a=ai-estimate]').inner_text())
                self.assertEqual(p.evaluate('__gym.ui.ai.res.pending.find(i=>i.text.includes("musli")).known.p??null'),None)
                self.assertEqual(p.evaluate('__gym.ui.ai.res.pending.find(i=>i.text.includes("yoghurt")).known.p'),20)
                self.bounds(p,'inline food recognition')
                p.screenshot(path='/tmp/inline-food-recognised.png')
                p.locator('[data-a=ai-estimate]').click()
                p.locator('[data-a=ai-fruit][data-kind=berries]').click()
                p.locator('[data-a=ai-choice]').filter(has_text='Kevés').click()
                p.locator('[data-a=ai-choice]').filter(has_text='lecsepegtetve').click()
                # Re-analysis must still separate the single line after short answers edit it.
                p.locator('[data-a=ai-refine]').click();p.locator('.ai-item').first.wait_for()
                self.assertEqual(p.locator('.ai-item').count(),8)
                self.assertEqual(p.locator('.ai-pending section').count(),0)
                self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.name.includes("yoghurt")).p'),20)
                self.assertEqual(p.locator('[data-in=ai-f][data-k=dl]').input_value(),'0.1')
                p.locator('[data-a=ai-add]').click()
                self.assertEqual(len(p.evaluate('Object.values(Store.d.food).flat()')),8)
                self.assertEqual(errors,[])
    def test_exact_meal_pending_labels_saved_then_reused_after_reload(self):
        p,errors=self.page(320,844,'hu',20);self.describe(p,TEXT)
        self.assertEqual(p.locator('.ai-pending section').count(),5)
        self.assertTrue(p.locator('[data-a=ai-add]').is_disabled());self.bounds(p,'partial meal')
        p.locator('[data-a=ai-fruit][data-kind=berries]').click()
        p.locator('[data-a=ai-amount]').click();p.locator('#ai-amount-form input').fill('1');p.locator('[form=ai-amount-form]').click()
        # Synthetic label fixtures, never published as actual brand data.
        for values in [('400','10','60','10'),('70','10','5','1'),('46','3.4','4.8','1.5')]:
            p.locator('[data-a=ai-label]').first.click()
            for key,value in zip(['kcal','p','c','f'],values):p.locator(f'#fmf [name={key}]').fill(value)
            self.bounds(p,'label form');p.locator('[form=fmf]').click()
        self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertEqual(p.locator('.ai-item').count(),8)
        self.assertEqual(p.locator('[data-in=ai-f][data-k=dl]').input_value(),'0.17')
        self.assertEqual(p.evaluate('ui=__gym.ui;ui.ai.res.items.find(i=>i.name.includes("yoghurt")).p'),20)
        self.assertFalse(p.locator('[data-a=ai-add]').is_disabled());self.bounds(p,'complete meal')
        p.locator('[data-a=ai-add]').click();self.assertEqual(len(p.evaluate('Object.values(Store.d.food).flat()')),8)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().find(f=>f.vml).vml'),17)
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.describe(p,TEXT.replace('fagyi gyumi','fagyasztott gyümi').replace('Fahej por','1g Fahej por'))
        self.assertEqual(p.locator('.ai-item').count(),8);self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertEqual(errors,[])
    def test_conflicting_saved_label_can_be_corrected_offline_without_duplicates(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow',reduced_motion='reduce');self.addCleanup(context.close)
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        p=context.new_page();p.goto(f'http://127.0.0.1:{self.server.server_port}/');p.wait_for_function('()=>!!window.__gym')
        p.wait_for_function('()=>!!navigator.serviceWorker.controller',timeout=120000)
        p.evaluate("Store.d.settings.lang='en';Store.d.myFoods=[{id:'label-fixture',name:'Pilos high protein coconut yoghurt',kcal:60,p:9,c:5,f:1,port:200,t:1}];Store.save()")
        context.set_offline(True);p.reload();p.wait_for_function('()=>!!window.__gym')
        self.describe(p,'71g banana\n200g Pilos high protein coconut yoghurt 20g protein')
        self.assertEqual(p.locator('.ai-pending section').count(),1)
        p.locator('[data-a=ai-label]').click();self.assertEqual(p.locator('#fmf [name=p]').input_value(),'10')
        for key,value in {'kcal':'70','p':'10','c':'5','f':'1'}.items():p.locator(f'#fmf [name={key}]').fill(value)
        p.locator('[form=fmf]').click();self.assertEqual(p.locator('.ai-pending section').count(),0)
        self.assertEqual(p.evaluate('Store.d.myFoods.length'),1);self.assertEqual(p.evaluate('Store.d.myFoods[0].id'),'label-fixture')
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items.find(i=>i.label).p'),20)
        p.screenshot(path='/tmp/food-analysis-complete.png')

    def test_photo_label_review_keeps_volume_and_does_not_log_missing_macros(self):
        p,errors=self.page(390,844,'en')
        import json
        reply={'items':[{'name':'Milk','src':'label','basisUnit':'ml','millilitres':17,'grams':0,'kcal100':46,'protein100':3.4,'carbs100':4.8,'fat100':1.5}], 'unresolved':[{'name':'Yogurt label','reason':'needLabel','known':{'p':20}}], 'confidence':'high'}
        p.route('https://api.anthropic.com/v1/messages',lambda r:r.fulfill(json={'content':[{'type':'text','text':json.dumps(reply)}]},headers={'access-control-allow-origin':'*'}))
        p.evaluate("Store.d.settings.apiKey='test-key';Store.d.settings.keyState='ok'")
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-ai][data-m=photo]').click()
        p.evaluate("__gym.ui.ai.imgs=[{url:'',b64:'test-fixture'}];__gym.A['ai-go']()")
        p.locator('[data-a=ai-label]').wait_for();self.assertTrue(p.locator('[data-a=ai-add]').is_disabled())
        self.assertEqual(p.locator('[data-in=ai-f][data-k=dl]').input_value(),'0.17')
        p.locator('[data-a=ai-label]').click()
        for key,value in {'kcal':'70','p':'10','c':'5','f':'1','port':'200'}.items():p.locator(f'#fmf [name={key}]').fill(value)
        p.locator('[form=fmf]').click()
        self.assertEqual(p.locator('.ai-item').count(),2);self.assertFalse(p.locator('[data-a=ai-add]').is_disabled())
        p.locator('[data-in=ai-f][data-k=dl]').fill('1');self.assertEqual(p.locator('[data-in=ai-f][data-k=kcal]').first.input_value(),'46')
        p.locator('[data-a=ai-add]').click();self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().find(i=>i.vml).vml'),100)
        self.assertEqual(errors,[])

    def test_retailer_lookup_review_and_network_failure(self):
        p,errors=self.page(390,844,'en')
        p.route('https://world.openfoodfacts.org/**',lambda r:r.fulfill(json={'products':[{'code':'1234567890123','product_name':'Test high protein coconut yogurt','brands':'Pilos','nutrition_data_per':'100g','nutriments':{'energy-kcal_100g':70,'proteins_100g':10,'carbohydrates_100g':5,'fat_100g':1}}]}))
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-manual]').click();p.locator('[data-a=shop-open]').click()
        for shop in ['Lidl','Tesco','SPAR']:choose(p,f'[data-a=shop-filter][data-shop={shop}]')
        p.locator('[data-in=shop-query]').fill('Pilos coconut');p.locator('[data-a=shop-search]').click();p.locator('[data-a=shop-select]').click()
        self.assertIn('community',p.locator('#sheet').inner_text());p.locator('[form=fmf]').click()
        self.assertEqual(p.evaluate('Store.d.myFoods[0].source'),'https://world.openfoodfacts.org/product/1234567890123')
        p.unroute('https://world.openfoodfacts.org/**');p.route('https://world.openfoodfacts.org/**',lambda r:r.abort())
        p.locator('[data-a=shop-search]').click();p.get_by_text('Product search is unavailable. You can enter the label instead.').wait_for()
        self.bounds(p,'shop fallback');self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
