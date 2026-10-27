"""Exercise search must work in both the library and the real routine picker."""
import unittest
import test_responsive_polish as responsive
from playwright.sync_api import expect

class ExerciseSearchBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_add_seated_extension_to_lower_routine_and_reload(self):
        p,errors=self.page(320,740,lang='hu')
        p.evaluate("()=>{Store.d.routines.push({id:'search-lower',name:'Alsótest',icon:'lower',items:[]});Store.save();__gym.render()}")
        p.locator('.workout-tabs [data-a=workout-view][data-v=plans]').click()
        p.locator('[data-a=r-open][data-id=search-lower]').click()
        p.locator('[data-a=r-edit][data-id=search-lower]').click()
        p.locator('[data-a=re-add]').click()
        p.locator('#sheet [data-a=lib-grp][data-g=lower]').click()
        p.locator('#sheet [data-in=lib-q]').fill('ulo labnyujto gep')
        row=p.locator('#pick-list [data-a=pick]').first
        self.assertEqual(row.get_attribute('data-id'),'Leg_Extensions')
        row.click()
        # Filters can hide a real match. Clear them without losing query/selection.
        p.locator('#sheet [data-in=lib-eq]').select_option('dumbbell')
        expect(p.locator('[data-a=lib-clear-filters]')).to_be_visible()
        p.locator('[data-a=lib-clear-filters]').click()
        self.assertEqual(p.locator('#sheet [data-in=lib-q]').input_value(),'ulo labnyujto gep')
        expect(p.locator('#pick-list [data-a=pick][data-id=Leg_Extensions]')).to_have_attribute('aria-pressed','true')
        self.bounds(p,'320px Hungarian picker')
        p.screenshot(path='/tmp/exercise-search-lower-picker.png')
        p.locator('[data-a=pick-done]').click()
        p.locator('[data-a=re-save]').click()
        self.assertTrue(p.evaluate("Store.d.routines.find(r=>r.id==='search-lower').items.some(i=>i.ex==='Leg_Extensions')"))
        p.reload();p.wait_for_function('!!window.__gym')
        self.assertEqual(p.evaluate("Store.d.routines.find(r=>r.id==='search-lower').items.map(i=>i.ex)"),['Leg_Extensions'])
        self.assertEqual(errors,[])

    def test_library_aliases_typo_filters_and_custom_exercises(self):
        p,errors=self.page(390,844,lang='en')
        p.locator('[data-a=workout-view][data-v=exercises]').click()
        for q,id in [('láb nyújtó gép','Leg_Extensions'),('pec deck','Butterfly'),('fekvo labhajlito','Lying_Leg_Curls'),('hip thrust machine','Machine_Hip_Thrust')]:
            p.locator('[data-in=lib-q]').fill(q)
            self.assertEqual(p.locator('#lib-list [data-a=ex-open]').first.get_attribute('data-id'),id,q)
        p.locator('[data-in=lib-q]').fill('labnyujtto')
        expect(p.locator('.exercise-search-hint')).to_be_visible()
        expect(p.locator('#lib-list [data-id=Leg_Extensions]')).to_be_visible()
        p.locator('[data-a=lib-grp][data-g=upper]').click()
        expect(p.locator('[data-a=lib-clear-filters]')).to_be_visible()
        p.locator('[data-a=lib-clear-filters]').click()
        expect(p.locator('#lib-list [data-id=Leg_Extensions]')).to_be_visible()
        p.evaluate("()=>{Store.d.myEx=[{id:'my_search_test',n:'My special shoulder press',p:['shoulders'],s:[],eq:'machine',steps:['Sit down.']}];Store.save();__gym.render()}")
        p.locator('[data-in=lib-q]').fill('special shoulder')
        expect(p.locator('#lib-list [data-id=my_search_test]')).to_be_visible()
        p.locator('[data-a=lib-grp][data-g=own]').click()
        expect(p.locator('[data-a=lib-grp][data-g=own]')).to_have_attribute('aria-pressed','true')
        self.assertEqual(p.locator('#lib-list [data-a=ex-open]').count(),1)
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
