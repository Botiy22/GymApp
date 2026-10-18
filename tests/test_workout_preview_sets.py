"""2.27: preview the next workout without starting it, and see every logged set of a finished workout."""
import unittest
import test_responsive_polish as responsive

class WorkoutPreviewSets(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def test_next_workout_preview_and_finished_sets(self):
        for width, lang in [(320, 'hu'), (390, 'en')]:
            with self.subTest(width=width, lang=lang):
                page, errors = self.page(width, 844, lang)
                page.evaluate('()=>{__gym.A["routine-template-add"]({dataset:{id:"ppl6"}});__gym.ui.tab="home";__gym.ui.workout="train";__gym.render()}')
                hero = page.locator('.training-hero')
                title = hero.locator('.hero-preview strong').inner_text()
                self.assertNotIn(' · ', title)                      # just the session ("Push"), the split is shown separately
                self.assertTrue(hero.locator('.hero-plan').is_visible())
                hero.locator('.hero-preview').click()
                page.locator('#sheet [data-a=w-start]').wait_for()
                self.assertIsNone(page.evaluate('Store.d.active'))  # looking does not start a workout
                self.assertEqual(page.locator('#sheet-title').inner_text(), title)
                page.locator('#sheet [data-a=sheet-close]').click()
                page.evaluate('''()=>{const now=Date.now();Store.d.workouts.push({id:'done1',rid:null,name:'Push',start:now-3600000,end:now,entries:[{ex:'Barbell_Bench_Press_-_Medium_Grip',sets:[{kg:60,reps:10,w:true},{kg:80,reps:8},{kg:82.5,reps:6}]}],warm:false,cool:false});Store.save();__gym.A['wk-open']({dataset:{id:'done1'}})}''')
                ex = page.locator('#sheet .wk-sets').first
                ex.locator('summary').click()
                rows = ex.locator('.set-list li').evaluate_all('(ls)=>ls.map(l=>[...l.children].map(c=>c.textContent.trim()))')
                warm, first = ('Bemelegítő', '1. sorozat') if lang == 'hu' else ('Warm-up', 'Set 1')
                kg = '82,5 kg' if lang == 'hu' else '82.5 kg'
                self.assertEqual(rows, [[warm, '60 kg', '× 10'], [first, '80 kg', '× 8'], [first.replace('1', '2'), kg, '× 6']])
                self.assertIn('1 h' if lang == 'en' else '1 óra', page.locator('#sheet .kpis').inner_text())
                self.bounds(page, f'finished sets {width} {lang}')
                self.assertEqual(errors, [])

    def test_english_counts_use_singular(self):
        page, errors = self.page(390, 844, 'en')
        page.evaluate('''()=>{const now=Date.now();Store.d.workouts=[{id:'one',rid:null,name:'Legs',start:now-60000,end:now,entries:[{ex:'Leg_Press',sets:[{kg:100,reps:10}]}],warm:false,cool:false}];Store.save();__gym.ui.tab='home';__gym.ui.workout='history';__gym.render()}''')
        self.assertIn('1 workout in total', page.locator('#view').inner_text())
        self.assertIn('1 set', page.locator('.history-title small').first.inner_text())
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
