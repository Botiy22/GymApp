"""Steps-only energy, daily-total overlap, independent switches and persistence."""
import unittest
import test_responsive_polish as responsive
class ActivityBudget(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def seed(self,p):
        p.locator('#tabbar [data-tab=food]').click()
        p.evaluate('''()=>{const d=Store.d,k=__gym.ui.foodDate,start=new Date(k+'T00:00:00').getTime();
          d.settings.targets={kcal:2000,p:100,c:200,f:60};d.settings.profile.weight=80;
          d.settings.addActive=true;d.settings.addWorkoutCalories=false;
          d.act[k]={steps:5000,kcal:200};
          d.workouts=[{id:'budget-test',name:'Lifting',start,end:start+3600000,entries:[{ex:'bench',sets:[{kg:20,reps:10}]}],energy:{weight:80,minutes:60,intensity:'moderate'},cardio:[]}];
          Store.save();__gym.render();}''')
    def goal(self,p,n):
        value=p.locator('[data-calorie-goal]').inner_text()
        self.assertIn(str(n),''.join(c for c in value if c.isdigit()))
    def test_independent_switches_legacy_data_reload_and_profile(self):
        p,errors=self.page(320,844,'hu',20);self.seed(p);self.goal(p,2200)
        w=p.locator('.energy-budget [data-k=addWorkoutCalories]')
        active=p.locator('.energy-budget [data-k=addActive]')
        self.assertFalse(w.is_disabled());self.assertFalse(w.is_checked())
        w.check();self.goal(p,2410);self.bounds(p,'steps and training')
        active.uncheck();self.goal(p,2210);self.assertTrue(w.is_checked())
        w.uncheck();self.goal(p,2000);active.check();self.goal(p,2200)
        self.assertFalse(w.is_checked());w.check();self.goal(p,2410)
        p.reload();p.wait_for_function('()=>!!window.__gym');p.locator('#tabbar [data-tab=food]').click()
        self.goal(p,2410);self.assertFalse(w.is_disabled())
        p.locator('.profile-shortcut').click();self.goal(p,2410)
        p.locator('.energy-budget [data-k=addWorkoutCalories]').uncheck();self.goal(p,2200)
        p.locator('.energy-budget [data-k=addActive]').uncheck();self.goal(p,2000)
        self.assertEqual(errors,[])
    def test_steps_entry_estimate_paste_and_selected_day(self):
        p,errors=self.page();self.seed(p)
        p.locator('.energy-budget [data-a=act]').click();p.locator('[data-a=act-est]').click()
        self.assertEqual(p.locator('[data-in=act-kind]').count(),0)
        self.assertEqual(p.locator('#act-kcal').input_value(),'220')
        p.locator('[data-a=act-save]').click();p.locator('.energy-budget [data-k=addWorkoutCalories]').check();self.goal(p,2430)
        p.locator('.energy-budget [data-a=act]').click();p.locator('[data-in=act-paste]').fill('steps=8000;kcal=600');p.locator('#act-steps').click()
        p.locator('[data-a=act-save]').click();self.goal(p,2810)
        self.assertFalse(p.locator('.energy-budget [data-k=addWorkoutCalories]').is_disabled())
        p.locator('.energy-budget [data-k=addActive]').uncheck();self.goal(p,2210)
        p.evaluate("()=>{__gym.ui.foodDate='2020-01-01';__gym.render();}");self.goal(p,2000)
        self.assertEqual(errors,[])
