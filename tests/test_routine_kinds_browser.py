"""2.55: a new routine starts with its type — gym keeps the exercise picker, swim and ride build a plan from a few settings."""
import os
import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout

SHOTS = os.environ.get('REPPSY_SHOTS')


class RoutineKinds(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def new_routine(self, p, kind):
        select_workout(p, 'plans')
        p.locator('[data-a=r-new]').first.click()
        p.locator('.kind-pick').wait_for()
        if SHOTS and kind == 'ride': p.screenshot(path=os.path.join(SHOTS, 'routine-kind-pick.png'))
        p.locator(f'[data-a=r-kind][data-v={kind}]').click()

    def test_gym_keeps_the_exercise_picker(self):
        p, errors = self.page(390, 844, 'hu')
        self.new_routine(p, 'gym')
        p.locator('#pick-list').wait_for()
        self.assertEqual(errors, [])

    def test_ride_plan_is_built_saved_and_shown_on_the_ride_page(self):
        p, errors = self.page(360, 800, 'hu')
        before = p.evaluate('Store.d.routines.length')
        self.new_routine(p, 'ride')
        p.locator('[data-a=ke-set][data-k=style][data-v=intervals]').click()
        p.locator('[data-in=ke-num][data-k=minutes]').fill('50')
        p.locator('[data-in=ke-num][data-k=reps]').fill('4')
        preview = p.locator('#ke-preview').inner_text()
        self.assertIn('4 × 4 perc kemény / 3 perc könnyű', preview)
        self.assertIn('Levezetés', preview)
        if SHOTS: p.screenshot(path=os.path.join(SHOTS, 'routine-ride-edit.png'))
        self.bounds(p, 'ride editor')
        p.locator('[data-a=ke-save]').click()
        r = p.evaluate('Store.d.routines.at(-1)')
        self.assertEqual(p.evaluate('Store.d.routines.length'), before + 1)
        self.assertEqual((r['kind'], r['plan']['style'], r['plan']['minutes'], r['plan']['reps'], r['items']), ('ride', 'intervals', 50, 4, []))
        self.assertEqual(r['name'], 'Kerékpár · Intervallumok')
        tile = p.locator(f'.rtile[data-id="{r["id"]}"]')
        self.assertIn('50 perc', tile.inner_text())
        tile.click()
        p.locator('[data-a=w-start]').click()
        p.locator('.ride-plan[data-plan]').wait_for()
        self.assertIn('Mai terv: Kerékpár · Intervallumok', p.locator('.ride-plan').inner_text())
        self.assertIsNone(p.evaluate('Store.d.active'), 'no gym workout is started')
        p.reload(); p.wait_for_function('()=>!!window.__gym')
        self.assertEqual(p.evaluate(f'Store.d.routines.find(r=>r.id==="{r["id"]}").kind'), 'ride', 'the type survives a reload')
        self.assertEqual(errors, [])

    def test_swim_plan_sets_the_swim_page(self):
        p, errors = self.page(390, 844, 'en')
        self.new_routine(p, 'swim')
        p.locator('[data-a=ke-set][data-k=routine][data-v=intervals]').click()
        p.locator('[data-a=ke-set][data-k=pool][data-v="50"]').click()
        p.locator('[data-in=ke-num][data-k=minutes]').fill('40')
        self.assertIn('Main set', p.locator('#ke-preview').inner_text())
        p.locator('[data-in=ke-name]').fill('Tuesday pool')
        p.locator('[data-a=ke-save]').click()
        r = p.evaluate('Store.d.routines.at(-1)')
        self.assertEqual((r['kind'], r['name'], r['plan']['pool'], r['plan']['routine'], r['plan']['minutes']), ('swim', 'Tuesday pool', 50, 'intervals', 40))
        self.assertNotIn(r['id'], p.evaluate('__gym.nextRoutine?.()?.id||""'))
        p.locator(f'.rtile[data-id="{r["id"]}"]').click()
        p.locator('[data-a=w-start]').click()
        p.locator('#swim-training').wait_for()
        self.assertEqual(p.evaluate('Store.d.settings.swimTraining.pool'), 50)
        self.assertEqual(p.evaluate('Store.d.settings.swimTraining.routine'), 'intervals')
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
