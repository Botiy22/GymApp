import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout
class WorkoutNavigation(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def test_all_destinations_small_and_wide_both_languages(self):
        for width,text,lang in [(320,20,'hu'),(390,16,'en'),(844,20,'hu')]:
            p,errors=self.page(width,844,lang,text)
            self.assertEqual(p.locator('.workout-menu-nav>details,.workout-menu-nav>button').count(),3)
            for view in ['plans','exercises','stability','ride','history','train']:
                select_workout(p,view)
                self.assertEqual(p.evaluate('__gym.ui.workout'),view)
                self.assertEqual(p.locator('.workout-menu[open]').count(),0)
                self.assertEqual(p.locator(f'.workout-tabs [data-v={view}]').get_attribute('aria-current'),'page')
                self.bounds(p,view)
            p.locator('[data-workout-menu=library] summary').click();self.bounds(p,'open dropdown')
            self.assertTrue(p.locator('.workout-menu[open] .workout-menu-items').evaluate('(e)=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}'))
            if width==390:
                p.evaluate('document.getAnimations().forEach(a=>a.finish())');p.screenshot(path='/tmp/workout-menu.png')
            self.assertEqual(errors,[])
    def test_dropdown_exclusivity_outside_dismiss_keyboard_and_active_workout(self):
        p,errors=self.page()
        p.locator('[data-workout-menu=training] summary').click()
        p.locator('[data-workout-menu=library] summary').click()
        self.assertEqual(p.locator('.workout-menu[open]').count(),1)
        p.keyboard.press('Escape');self.assertEqual(p.locator('.workout-menu[open]').count(),0)
        self.assertTrue(p.locator('[data-workout-menu=library] summary').evaluate('(e)=>e===document.activeElement'))
        p.keyboard.press('Enter');self.assertEqual(p.locator('.workout-menu[open]').count(),1)
        p.locator('.top h1').click();self.assertEqual(p.locator('.workout-menu[open]').count(),0)
        p.evaluate("()=>{Store.d.active={id:'active-test',start:Date.now(),name:'Active',entries:[]};Store.save();__gym.render()}")
        select_workout(p,'exercises');select_workout(p,'train')
        self.assertEqual(p.evaluate('Store.d.active.id'),'active-test')
        self.assertEqual(p.locator('[data-a=w-open]').count(),1)
        self.assertEqual(errors,[])
