from choice_navigation import choose
from workout_navigation import select_workout
"""2.31: knee/stability programmes from the owner's clips, the clip recipes with guide drawings, and the planner editor fix."""
import unittest
import test_responsive_polish as responsive

class RecoveryRecipes(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def test_programme_data_is_complete(self):
        page, errors = self.page()
        bad = page.evaluate('''async()=>{const out=[];for(const p of RECOVERY_PROGRAMS){for(const i of p.items){if(!EXERCISES.some(e=>e.id===i.ex))out.push('missing '+i.ex);
          if(/^Rehab_/.test(i.ex)){if(!EX_HU[i.ex])out.push('no hu '+i.ex);for(const src of ROUTINE_ART[i.ex].pair){const r=await fetch(src);if(!r.ok)out.push('art '+src);}}}
          if(!p.name.hu||!p.name.en||!p.info.hu||!p.info.en)out.push('text '+p.id);}return out}''')
        self.assertEqual(bad, [])
        self.assertEqual(page.evaluate('RECOVERY_PROGRAMS.map(p=>[p.id,p.focus,p.items.length])'), [['rec_knee_bands', 'knee', 10], ['rec_knee_stability', 'knee', 9], ['rec_pelvic_tilt', 'stability', 4]])
        # sets/reps printed in the clips
        self.assertEqual(page.evaluate('RECOVERY_PROGRAMS[0].items.map(i=>i.sets+"x"+i.reps)'), ['3x15', '3x12', '2x10', '3x15 s', '3x20 s', '3x30 s', '2x15', '1x10', '3x10 s', '3x15 s'])
        self.assertEqual(page.evaluate('RECOVERY_PROGRAMS[1].items.map(i=>i.sets+"x"+i.reps)'), ['2x15', '2x12', '3x20 s', '3x15', '2x15 s', '3x30 s', '2x8', '3x12', '4x8'])
        self.assertEqual(errors, [])

    def test_all_recovery_sketch_phases_decode(self):
        page, errors = self.page()
        results = page.evaluate('''async()=>{const ids=EXERCISES.filter(e=>/^Rehab_/.test(e.id)).map(e=>e.id);
          return Promise.all(ids.flatMap(id=>ROUTINE_ART[id].pair.map(src=>new Promise(resolve=>{
            const image=new Image();image.onload=()=>resolve([src,image.naturalWidth,image.naturalHeight]);
            image.onerror=()=>resolve([src,0,0]);image.src=src;
          }))));}''')
        self.assertEqual(len(results), 34)
        self.assertTrue(all((w,h)==(768,1024) for _,w,h in results), results)
        self.assertEqual(errors, [])

    def test_knee_page_preview_add_and_start(self):
        for width, lang in [(320, 'hu'), (390, 'en')]:
            with self.subTest(width=width, lang=lang):
                page, errors = self.page(width, 844, lang)
                select_workout(page,'stability'); choose(page,'[data-a=stability-view][data-v=knee]')
                self.assertEqual(page.locator('.recovery-card').count(), 2); self.bounds(page, f'knee page {lang}')
                page.locator('[data-a=recovery-preview][data-id=rec_knee_bands]').first.click()
                self.assertEqual(page.locator('#sheet .recovery-step').count(), 10)
                page.wait_for_function('()=>[...document.querySelectorAll("#sheet .recovery-pair img")].slice(0,4).every(i=>i.complete&&i.naturalWidth>0)')
                self.assertEqual(page.locator('#sheet .recovery-step').first.locator('.recovery-step-name small').inner_text(), '3 × 15')
                self.bounds(page, f'knee preview {lang}')
                page.locator('#sheet [data-a=recovery-add]').click()
                self.assertEqual(page.evaluate('Store.d.routines.filter(r=>r.id==="rec_knee_bands").map(r=>[r.focus,r.items.length])'), [['knee', 10]])
                self.assertEqual(page.locator('#sheet [data-a=recovery-add]').count(), 0)        # the sheet now offers Start only
                page.locator('#sheet [data-a=recovery-start]').click()
                self.assertEqual(page.evaluate('[Store.d.active.rid,Store.d.active.entries.length]'), ['rec_knee_bands', 10])
                self.assertEqual(page.evaluate('Store.d.routines.filter(r=>r.id==="rec_knee_bands").length'), 1)    # adding twice never duplicates
                # programmes stay out of the strength rotation
                self.assertNotEqual(page.evaluate('__gym.nextRoutine()?.id'), 'rec_knee_bands')
                self.assertEqual(errors, [])

    def test_pelvic_tilt_on_stability_page(self):
        page, errors = self.page(390, 844, 'en')
        select_workout(page,'stability')
        self.assertEqual(page.locator('.recovery-card').count(), 1)
        self.assertIn('Pelvic tilt reset', page.locator('.recovery-card').inner_text())
        page.locator('.recovery-card [data-a=recovery-add]').click()
        self.assertEqual(page.locator('.stability-routines .rcard').count(), 1)
        self.assertEqual(errors, [])

    def test_clip_recipes_cards_steps_and_amounts(self):
        page, errors = self.page(320, 844, 'hu', 20)
        page.locator('#tabbar [data-tab=food]').click(); choose(page,'[data-a=food-view][data-v=ideas]')
        card = page.locator('[data-a=idea-open][data-id=clip-protein-banana-muffins]')
        self.assertIn('Fehérje', card.inner_text()); self.assertIn('Szénhidrát', card.inner_text()); self.assertIn('Zsír', card.inner_text())
        choose(page,'[data-a=idea-cat][data-c=drink]'); self.assertEqual(page.locator('.recipe-card').count(), 5); self.bounds(page, 'juices')
        choose(page,'[data-a=idea-cat][data-c=""]'); card.click()
        steps = page.evaluate('RECIPES.items.find(r=>r.id==="clip-protein-banana-muffins").steps.hu.length')
        self.assertEqual(page.locator('#sheet .recipe-step').count(), steps)
        self.assertEqual(page.locator('#sheet .recipe-step svg').count(), steps)
        self.assertIn('egy csipet', page.locator('#sheet .ing').inner_text())
        self.assertIn('AI-generált kép', page.locator('#sheet .recipe-reference figcaption').inner_text())
        page.wait_for_function('()=>{const i=document.querySelector("#sheet .recipe-hero img");return i.complete&&i.naturalWidth===1448}')
        self.bounds(page, 'muffin recipe')
        page.locator('#sheet [data-a=recipe-cook]').click(); page.locator('#sheet [data-a=cook-next]').click()
        self.assertEqual(page.locator('#sheet .cooking-art svg').count(), 1)
        self.assertEqual(errors, [])

    def test_meat_roll_keeps_unknown_macros_unknown(self):
        page, errors = self.page()
        r = page.evaluate('RECIPES.items.find(r=>r.id==="clip-pizza-meat-roll")')
        self.assertEqual((r['kcal'], r['p'], r['c'], r['f']), (550, 66, None, None))
        page.locator('#tabbar [data-tab=food]').click(); choose(page,'[data-a=food-view][data-v=ideas]')
        page.locator('[data-a=idea-open][data-id=clip-pizza-meat-roll]').click(); page.locator('[data-a=idea-add]').click()
        self.assertEqual(page.evaluate('Object.values(Store.d.food).flat().length'), 0)        # needs the missing macros first
        self.assertEqual(errors, [])

    def test_planner_editor_switch_and_time_fields_fit(self):
        page, errors = self.page(390, 844, 'en')
        page.evaluate('()=>__gym.A["planner-new"]({dataset:{kind:"other"}})')
        sw = page.locator('#planner-event-form .sw input'); label = page.locator('#planner-event-form .sw span')
        self.assertLess(sw.bounding_box()['width'], 90)
        self.assertLessEqual(label.bounding_box()['x'] + label.bounding_box()['width'], 390)
        self.assertTrue(page.evaluate('[...document.querySelectorAll("#planner-event-form input,#planner-event-form select")].every(e=>e.getBoundingClientRect().right<=innerWidth)'))
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
