import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout

class MotionNavigation(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_equal_navigation_cells_and_keyboard(self):
        for width,text,lang in [(320,20,'hu'),(390,16,'en'),(430,20,'hu'),(844,16,'en')]:
            p,errors=self.page(width,844,lang,text)
            nav=p.locator('.workout-menu-nav')
            sizes=nav.locator('summary,.workout-menu-history').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})')
            for axis in [0,1]:self.assertLess(max(x[axis] for x in sizes)-min(x[axis] for x in sizes),1)
            summary=p.locator('[data-workout-menu=training] summary')
            summary.focus();p.keyboard.press('ArrowDown')
            self.assertTrue(p.locator('[data-workout-menu=training]').evaluate('e=>e.open'))
            p.keyboard.press('End');self.assertEqual(p.evaluate('document.activeElement.dataset.v'),'swim')
            p.keyboard.press('Escape');self.assertTrue(summary.evaluate('e=>e===document.activeElement'))
            self.assertFalse(p.locator('[data-workout-menu=training]').evaluate('e=>e.open'))
            p.locator('#tabbar [data-tab=settings]').click()
            sizes=p.locator('.settings-jumps>button').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,e.scrollWidth,e.clientWidth]})')
            for axis in [0,1]:self.assertLess(max(x[axis] for x in sizes)-min(x[axis] for x in sizes),1)
            self.assertTrue(all(x[2]<=x[3]+1 for x in sizes))
            self.bounds(p,'equal settings navigation')
            self.assertEqual(errors,[])

    def test_every_exercise_with_a_pair_animates_and_can_pause(self):
        # 2.59: the start and end pictures cross-fade in a loop; the three hand-built studies are gone
        p,errors=self.page(390,844,'en')
        for id in ['Hammer_Curls','Barbell_Full_Squat','Leg_Extensions','Plank']:
            p.evaluate('(id)=>__gym.A["ex-open"]({dataset:{id}})',id)
            self.assertEqual(p.locator('exercise-motion').count(),0)
            box=p.locator('.move-anim');self.assertEqual(box.locator('.move-frame').count(),2)
            p.wait_for_function('()=>[...document.querySelectorAll(".move-frame")].every(i=>i.complete&&i.naturalWidth>0)')
            self.assertEqual(p.locator('.drawing-phase').count(),2)
            box.locator('[data-a=move-toggle]').click()            # the test browser asks for reduced motion: first press plays
            self.assertTrue(box.evaluate('e=>e.classList.contains("playing")'))
            self.assertEqual(box.locator('.move-frame.f1').evaluate('e=>getComputedStyle(e).animationPlayState'),'running')
            a=box.locator('.move-frame.f1').evaluate('e=>getComputedStyle(e).opacity');p.wait_for_timeout(1700)
            self.assertNotEqual(a,box.locator('.move-frame.f1').evaluate('e=>getComputedStyle(e).opacity'))
            box.locator('[data-a=move-toggle]').click()
            self.assertEqual(box.locator('.move-frame.f1').evaluate('e=>getComputedStyle(e).animationPlayState'),'paused')
            self.assertEqual(box.locator('[data-a=move-toggle]').get_attribute('aria-label'),'Play animation')
            self.bounds(p,'movement animation');p.locator('[data-a=sheet-close]').click()
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
