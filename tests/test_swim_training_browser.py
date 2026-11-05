import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout

class SwimTraining(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def open(self,p):
        select_workout(p,'swim')
        p.locator('[data-sw=page][data-value=workouts]').click()

    def test_pool_customisation_persists_and_logging_requires_review(self):
        p,errors=self.page(390,844,'hu',20)
        self.open(p)
        for pool in [25,50,75,100]:
            p.locator(f'[data-sw=pool][data-value="{pool}"]').click()
            self.assertEqual(p.evaluate('Store.d.settings.swimTraining.pool'),pool)
            self.assertIn('hossz',p.locator('.swim-plan').inner_text())
        p.locator('.swim-config [name=pool]').fill('33.3')
        p.locator('.swim-config [name=minutes]').fill('59')
        p.locator('.swim-config [name=pace]').fill('180')
        # The first click after input change must work, not disappear on rerender.
        p.locator('[data-sw=routine][data-value=easy]').click()
        self.assertEqual(p.evaluate('Store.d.settings.swimTraining.routine'),'easy')
        self.assertEqual(p.evaluate('Store.d.workouts.length'),0)
        p.reload();p.wait_for_function('()=>!!window.__gym');self.open(p)
        self.assertEqual(p.locator('.swim-config [name=pool]').input_value(),'33.3')
        self.assertEqual(p.locator('.swim-config [name=minutes]').input_value(),'59')
        plan=p.evaluate('SwimTraining.plan(Store.d.settings.swimTraining)')
        p.evaluate('Store.d.settings.profile.weight="75"')
        p.locator('[data-sw=log]').click()
        self.assertEqual(p.evaluate('Store.d.workouts.length'),0)
        self.assertEqual(float(p.locator('#sheet [name=pool]').input_value()),33.3)
        self.assertEqual(int(p.locator('#sheet [name=laps_free]').input_value()),plan['lengths'])
        self.assertAlmostEqual(float(p.locator('#sheet [name=minutes]').input_value()),plan['swimSeconds']/60,delta=.051)
        p.locator('#sheet [name=minutes]').fill('30')
        p.locator('#sheet [name=laps_free]').fill('20')
        p.locator('#sheet button.primary.wide').click()
        self.assertEqual(p.evaluate('Store.d.workouts.length'),1)
        p.locator('[data-sw=page][data-value=history]').click()
        self.assertIn('666',p.locator('.swim-page').inner_text())
        self.assertEqual(p.evaluate('Store.d.workouts[0].cardio[0].minutes'),30)
        self.bounds(p,'custom swim history');self.assertEqual(errors,[])

    def test_unfeasible_session_and_invalid_input_do_not_log(self):
        p,errors=self.page(320,740,'en',20);self.open(p)
        p.locator('[data-sw=pool][data-value="100"]').click()
        p.locator('.swim-config [name=minutes]').fill('20')
        p.locator('.swim-config [name=pace]').fill('600')
        p.locator('[data-sw=routine][data-value=breathing]').click()
        self.assertEqual(p.locator('[data-sw=log]').count(),0)
        self.assertIn('at least',p.locator('.swim-plan-output').inner_text())
        p.locator('.swim-config [name=pool]').fill('0')
        p.locator('[data-sw=routine][data-value=easy]').click()
        self.assertEqual(p.evaluate('Store.d.settings.swimTraining.pool'),100)
        self.assertEqual(p.evaluate('Store.d.workouts.length'),0)
        self.bounds(p,'infeasible swim');self.assertEqual(errors,[])

    def test_technique_play_pause_scrub_strokes_and_no_background_player(self):
        p,errors=self.page(390,844,'en');self.open(p)
        p.locator('.swim-tabs [data-sw=page][data-value=technique]').click()
        first=p.locator('.swim-scene').inner_html();p.wait_for_timeout(200)
        self.assertNotEqual(first,p.locator('.swim-scene').inner_html())
        p.locator('[data-sw=play]').click()
        paused=p.locator('.swim-scene').inner_html();p.wait_for_timeout(200)
        self.assertEqual(paused,p.locator('.swim-scene').inner_html())
        p.locator('[data-sw=phase][data-value="2"]').click()
        self.assertIn('One goggle',p.locator('.swim-cue').inner_text())
        p.locator('[data-sw=speed]').click();self.assertIn('½',p.locator('[data-sw=speed]').inner_text())
        for stroke in ['breast','back','free']:
            p.locator(f'[data-sw=demo-stroke][data-value={stroke}]').click()
            p.locator('[data-sw=phase][data-value="0"]').click()
            self.assertNotIn('undefined',p.locator('#swim-training').inner_text())
            self.assertEqual(p.locator('[data-sw=phase][aria-pressed=true]').count(),1)
            self.bounds(p,stroke+' technique')
        p.locator('[data-sw-progress]').fill('700')
        self.assertIn('Push & turn',p.locator('.swim-cue').inner_text())
        p.locator('[data-sw=play]').click()
        p.locator('#tabbar [data-tab=food]').click()
        p.wait_for_timeout(150)
        self.assertEqual(p.locator('.swim-scene').count(),0)
        self.assertEqual(errors,[])

    def test_responsive_translated_screens_and_animation_art(self):
        for width,lang,text in [(320,'hu',20),(390,'en',16),(430,'hu',16),(844,'en',20)]:
            p,errors=self.page(width,844,lang,text);self.open(p)
            self.bounds(p,'swim workouts')
            p.screenshot(path=f'/tmp/swim-workouts-{width}.png',full_page=True)
            for stroke in ['free','breast','back']:
                p.locator('.swim-tabs [data-sw=page][data-value=technique]').click()
                p.locator(f'[data-sw=demo-stroke][data-value={stroke}]').click()
                p.locator('[data-sw=phase][data-value="2"]').click()
                self.bounds(p,'swim technique')
                if width==390:
                    p.locator('.swim-scene').screenshot(path=f'/tmp/swim-{stroke}-art.png')
                    p.screenshot(path=f'/tmp/swim-{stroke}.png',full_page=True)
            self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
