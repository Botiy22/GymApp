"""2.45: Describe recognises the food and asks only the one missing thing, as taps."""
import os
import unittest
import test_responsive_polish as responsive

SHOTS = os.environ.get('REPPSY_SHOTS')


class OneQuestionBrowser(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def describe(self, page, text):
        page.locator('#tabbar [data-tab=food]').click(); page.locator('[data-a=food-ai][data-m=text]').click()
        page.locator('[data-in=ai-text]').fill(text); page.locator('[data-a=ai-go]').click()

    def shot(self, page, name):
        if SHOTS: page.screenshot(path=os.path.join(SHOTS, name + '.png'))

    def test_amount_is_one_tap_and_the_meal_is_logged(self):
        page, errors = self.page(360, 780, 'hu')
        self.describe(page, 'csirkemell rizzsel')
        ask = page.locator('.ask1'); ask.wait_for()
        self.assertIn('Rizs', ask.locator('b').inner_text())
        picks = ask.locator('[data-a=ai-choice]'); self.assertEqual(picks.count(), 3)
        self.assertTrue(page.locator('[data-a=ai-add]').is_disabled())
        self.assertEqual(page.locator('[data-in=ai-hint]').count(), 0, 'no extra form while one tap answers it')
        self.shot(page, 'ask-amount'); self.bounds(page, 'one question')
        picks.nth(1).click()
        page.wait_for_function("!document.querySelector('.ask1')")
        self.assertFalse(page.locator('[data-a=ai-add]').is_disabled())
        names = page.locator('[data-in=ai-f][data-k=name]').evaluate_all('els=>els.map(e=>e.value)')
        self.assertEqual(len(names), 2); self.assertTrue(any('Rizs' in n for n in names))
        self.assertIn('180 g Rizs', page.evaluate('__gym.ui.ai.text'), 'the answer is kept for a later re-analysis')
        self.shot(page, 'ask-answered')
        page.locator('[data-a=ai-add]').click()
        day = page.evaluate("Store.d.food[Object.keys(Store.d.food).sort().pop()]")
        rice = [f for f in day if 'Rizs' in f['name']][0]
        self.assertEqual(rice['g'], 180); self.assertEqual(errors, [])

    def test_box_sizes_and_other_amount(self):
        page, errors = self.page(360, 780, 'hu')
        self.describe(page, 'king nuggets és pörkölt')
        page.locator('.ask1').first.wait_for()
        labels = page.locator('.ask1').first.locator('[data-a=ai-choice]').all_inner_texts()
        self.assertTrue(any(l.startswith('4 db') for l in labels) and any(l.startswith('20 db') for l in labels), labels)
        self.shot(page, 'ask-boxes')
        page.locator('.ask1').first.locator('[data-a=ai-choice]').nth(1).click()
        page.locator('.ask1 [data-a=ai-amount]').click()
        page.locator('#ai-amount-form input[name=g]').fill('320'); page.locator('[form=ai-amount-form]').click()
        page.wait_for_function("!document.querySelector('.ask1')")
        grams = page.locator('[data-in=ai-f][data-k=grams]').evaluate_all('els=>els.map(e=>+e.value)')
        self.assertIn(102, grams); self.assertIn(320, grams)

    def test_unknown_word_offers_the_closest_foods(self):
        page, errors = self.page(360, 780, 'hu')
        self.describe(page, 'csirkemel 200 g')
        ok = page.locator('[data-in=ai-f][data-k=name]')
        if ok.count() == 0:   # a typo is either corrected outright or asked as one tap
            page.locator('.ask1 [data-a=ai-choice]').first.click()
        ok.first.wait_for()
        self.assertIn('Csirkemell', ok.first.input_value())

    def test_quick_log_from_the_top_of_the_food_tab(self):
        page, errors = self.page(320, 700, 'hu')
        page.locator('#tabbar [data-tab=food]').click()
        box = page.locator('.quick-log input[name=q]'); box.wait_for()
        self.assertLess(box.bounding_box()['y'], 260, 'visible without scrolling')
        self.shot(page, 'quick-log'); self.bounds(page, 'quick log')
        box.fill('2 tojás és 2 szelet kenyér'); box.press('Enter')
        page.locator('[data-a=ai-add]:not([disabled])').wait_for()
        page.locator('[data-a=ai-add]').click()
        self.assertEqual(page.evaluate("Store.d.food[Object.keys(Store.d.food).sort().pop()].length"), 2)
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
