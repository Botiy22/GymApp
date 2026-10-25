import unittest
import test_responsive_polish as responsive
class FoodRoutine(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def test_offline_description_clarify_and_label(self):
        p,errors=self.page(320,844,'en')
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-ai][data-m=text]').click()
        p.locator('[data-in=ai-text]').fill('100 g banana');p.locator('[data-a=ai-go]').click()
        p.locator('[data-in=ai-f][data-k=p]').wait_for();self.assertEqual(p.locator('[data-in=ai-f][data-k=p]').input_value(),'1.1')
        p.locator('[data-in=ai-text]').fill('one biotech protein shake with milk');p.locator('[data-a=ai-refine]').click()
        self.assertEqual(p.locator('[data-a=ai-add]').count(),0)
        p.locator('[data-in=ai-text]').fill('35 g BioTech (140 kcal, 28 g protein, 4 g carbs, 1 g fat)');p.locator('[data-a=ai-refine]').click()
        p.locator('[data-in=ai-f][data-k=p]').wait_for();self.assertEqual(p.locator('[data-in=ai-f][data-k=p]').input_value(),'28')
        self.bounds(p,'food review')
        p.locator('[data-in=ai-f][data-k=p]').fill('30');p.locator('[data-a=ai-add]').click()
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.assertAlmostEqual(p.evaluate('Store.d.aiNotes.at(-1).macros.p'),30/35*100)
        self.assertEqual(errors,[])
    def test_similar_calories_never_replace_different_protein(self):
        p,errors=self.page()
        p.evaluate("""()=>{FoodAI.analyze=async()=>({items:[{name:'My powder',en:'Beverages, nutritional shake mix, high protein, powder',grams:100,k100:392,p100:28,c100:40,f100:10,kcal:392,p:28,c:40,f:10}],confidence:'medium',notes:'',question:null})}""")
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-ai][data-m=text]').click()
        p.locator('[data-in=ai-text]').fill('my powder');p.locator('[data-a=ai-go]').click()
        p.locator('[data-in=ai-f][data-k=p]').wait_for()
        self.assertEqual(p.locator('[data-in=ai-f][data-k=p]').input_value(),'28')
        self.assertEqual(errors,[])
    def test_agenda_default_and_modes_fit(self):
        for lang in ['hu','en']:
            p,errors=self.page(320,844,lang,20);p.locator('#tabbar [data-tab=goals]').click()
            self.assertEqual(p.locator('.planner-agenda').count(),1)
            p.locator('[data-a=planner-new][data-kind=gym]').click();p.locator('[name=title]').fill('Gym')
            p.locator('button[form=planner-event-form]').click();p.locator('.agenda-item').wait_for()
            p.locator('.agenda-item .planner-done').click();self.assertEqual(p.locator('.agenda-item.complete').count(),1)
            self.bounds(p,'agenda '+lang)
            p.locator('[data-a=planner-view][data-v=day]').click();self.assertEqual(p.locator('.planner-event.complete').count(),1)
            self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
