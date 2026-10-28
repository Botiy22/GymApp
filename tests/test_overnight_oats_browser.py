"""2.36: overnight oats builder on a small phone: presets, toggles, steps, typed amounts, diary breakdown, save as my food."""
import unittest
import test_responsive_polish as responsive

class OvernightOatsBrowser(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def open_builder(self, page):
        page.locator('#tabbar [data-tab=food]').click(); page.locator('[data-a=food-view][data-v=ideas]').click()
        page.locator('.oats-cta').click(); page.locator('#oats-sum').wait_for()

    def kcal(self, page):
        return int(page.locator('#oats-sum .oats-total div').first.locator('b').inner_text())

    def test_ingredient_changes_keep_the_tapped_control_in_place(self):
        for width,lang,text in [(320,'hu',20),(390,'en',16)]:
            page,errors=self.page(width,844,lang,text)
            self.open_builder(page)
            page.emulate_media(reduced_motion='no-preference')
            for fruit in ['blueberry','mango','raspberry','blueberry']:
                chip=page.locator(f'#sheet .oats-group [data-a=oats-toggle][data-id={fruit}]')
                chip.scroll_into_view_if_needed()
                before=chip.bounding_box()['y']
                chosen=chip.get_attribute('aria-pressed')=='true'
                chip.click()
                page.wait_for_timeout(200)
                self.assertAlmostEqual(chip.bounding_box()['y'],before,delta=2,msg=f'{lang}/{fruit}')
                self.assertEqual(chip.get_attribute('aria-pressed'),str(not chosen).lower())
                self.assertEqual(self.kcal(page),page.evaluate('OvernightOats.compute(__gym.ui.oats.sel).kcal'))
            step=page.locator('#sheet .oats-row[data-id=mango] [data-a=oats-step][data-d="1"]')
            step.scroll_into_view_if_needed();before=step.bounding_box()['y'];step.click()
            self.assertAlmostEqual(step.bounding_box()['y'],before,delta=2)
            self.assertTrue(step.evaluate('(e)=>document.activeElement===e'))
            self.bounds(page,'oats stable scroll '+lang)
            self.assertEqual(errors,[])

    def test_remove_last_ingredient_then_add_again(self):
        page,errors=self.page(390,844,'en')
        self.open_builder(page)
        for ingredient in ['oats','milk15']:
            page.locator(f'.oats-row[data-id={ingredient}] .oats-remove').click()
        self.assertTrue(page.locator('.oats-empty').is_visible())
        self.assertEqual(page.locator('#sheet .sheet-foot').count(),0)
        chip=page.locator('.oats-group [data-a=oats-toggle][data-id=mango]')
        chip.scroll_into_view_if_needed();before=chip.bounding_box()['y'];chip.click()
        self.assertAlmostEqual(chip.bounding_box()['y'],before,delta=2)
        self.assertFalse(page.locator('.oats-empty').is_visible())
        self.assertEqual(page.locator('#sheet [data-a=oats-add]').count(),1)
        page.locator('.oats-row[data-id=mango] input').fill('10')
        page.locator('.oats-row[data-id=mango] [data-a=oats-step][data-d="-1"]').click()
        self.assertEqual(page.locator('.oats-row').count(),0)
        self.assertTrue(page.locator('.oats-empty').is_visible())
        self.assertTrue(page.evaluate('document.activeElement.isConnected&&document.querySelector("#sheet").contains(document.activeElement)'))
        self.assertEqual(errors,[])

    def test_builder_updates_macros_and_logs_breakdown(self):
        for width, lang, text in [(320, 'hu', 20), (390, 'en', 16)]:
            with self.subTest(lang=lang):
                page, errors = self.page(width, 844, lang, text)
                self.open_builder(page)
                self.assertEqual(self.kcal(page), page.evaluate('OvernightOats.compute(OvernightOats.defaults()).kcal'))
                page.locator('#sheet [data-a=oats-preset][data-id=oats-choco-pb]').click()
                self.assertEqual(self.kcal(page), page.evaluate("RECIPES.items.find(r=>r.id==='oats-choco-pb').kcal"))
                page.locator('#sheet .oats-group [data-a=oats-toggle][data-id=chia]').click()
                page.locator('#sheet [data-a=oats-step][data-id=whey][data-d="1"]').click()
                page.locator('#sheet [data-in=oats-amt][data-id=oats]').fill('70')
                expect = page.evaluate("OvernightOats.compute({oats:70,milk15:150,whey:30,cocoa:8,pb:15,banana:60,chia:10})")
                self.assertEqual(self.kcal(page), expect['kcal'])
                self.bounds(page, 'oats builder ' + lang)
                page.locator('#sheet [data-a=oats-add]').click()
                food = page.evaluate('Object.values(Store.d.food).flat()[0]')
                self.assertEqual([food['kcal'], food['g'], len(food['items'])], [expect['kcal'], expect['g'], 7])
                page.reload(); page.wait_for_function('()=>!!window.__gym')
                self.assertEqual(len(page.evaluate('Object.values(Store.d.food).flat()[0].items')), 7)   # the breakdown survives storage
                self.assertEqual(errors, [])

    def test_recipe_customise_and_save_as_my_food(self):
        page, errors = self.page(390, 844, 'hu')
        page.locator('#tabbar [data-tab=food]').click(); page.locator('[data-a=food-view][data-v=ideas]').click()
        page.locator('[data-a=idea-cat][data-c=breakfast]').click()
        for rid in ['overnight-oats', 'oats-choco-pb', 'oats-apple-cinnamon', 'oats-berry-turo', 'oats-mango-coconut', 'oats-tiramisu']:
            self.assertEqual(page.locator(f'[data-a=idea-open][data-id={rid}]').count(), 1, rid)
        page.locator('[data-a=idea-open][data-id=oats-tiramisu]').click()
        page.wait_for_function('()=>{const i=document.querySelector("#sheet .recipe-hero img");return i&&i.complete&&i.naturalWidth===1448}')
        page.locator('#sheet [data-a=oats-open]').click()
        self.assertEqual(page.locator('#sheet .oats-row').count(), 6)
        page.locator('#sheet .oats-rows [data-a=oats-toggle][data-id=honey]').click()
        page.locator('#sheet [data-a=oats-save]').click()
        self.assertEqual(page.locator('#fmf [name=port]').input_value(), str(page.evaluate("OvernightOats.compute({oats:50,milk15:100,espresso:30,greek2:100,cocoa:5}).g")))
        self.assertIn('Overnight oats', page.locator('#fmf [name=name]').input_value())
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
