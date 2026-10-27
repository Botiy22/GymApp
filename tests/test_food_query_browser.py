"""2.35: offline food answers in Add food, the describe box and the coach, without an AI key."""
import unittest
import test_responsive_polish as responsive

class FoodQueryBrowser(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def open_search(self, page):
        page.locator('#tabbar [data-tab=food]').click(); page.locator('[data-a=food-manual]').click()

    def test_zsemle_answer_card_adds_to_diary(self):
        for width, lang, query, name in [(320, 'hu', '1 zsemle hány kalória', 'Zsemle (kaiser)'), (390, 'en', 'how many calories in a bread roll', 'Bread roll (zsemle)')]:
            with self.subTest(lang=lang):
                page, errors = self.page(width, 844, lang, 20 if width == 320 else 16)
                self.open_search(page); page.locator('[data-in=fs-q]').fill(query)
                card = page.locator('.food-answer'); card.wait_for()
                self.assertIn(name, card.inner_text()); self.assertIn('167 kcal', card.inner_text()); self.assertIn('57 g', card.inner_text())
                self.assertGreater(page.locator('#fs-list .fhit').count(), 0)          # the plain list still finds the roll
                self.bounds(page, 'answer card ' + lang)
                page.locator('[data-a=fq-add]').click()
                self.assertEqual(page.evaluate('Object.values(Store.d.food).flat().map(f=>[f.name,f.g,f.kcal])'), [[name, 57, 167]])
                self.assertEqual(errors, [])

    def test_multi_food_other_amount_and_portion_chips(self):
        page, errors = self.page(320, 844, 'hu')
        self.open_search(page); page.locator('[data-in=fs-q]').fill('2 tojás és egy szelet kenyér, 10 dkg sonka')
        page.locator('.food-answer .fq-total').wait_for()
        self.assertEqual(page.locator('.food-answer .fq-row').count(), 3); self.assertIn('399 kcal', page.locator('.fq-total').inner_text())
        self.assertEqual(page.locator('#fs-list .empty').count(), 0)
        self.bounds(page, 'multi answer')
        page.locator('[data-in=fs-q]').fill('kifli'); page.locator('[data-a=fq-edit]').wait_for(); page.locator('[data-a=fq-edit]').click()
        self.assertEqual(page.locator('[data-in=fa-g]').input_value(), '46')
        self.assertTrue(page.locator('#sheet .chip', has_text='1 db (≈46 g)').count() == 1)
        page.locator('[data-a=fa-add]').click()
        self.assertEqual(page.evaluate('Object.values(Store.d.food).flat().map(f=>[f.name,f.g])'), [['Kifli', 46]])
        self.assertEqual(errors, [])

    def test_describe_box_and_coach_work_without_key(self):
        page, errors = self.page(320, 844, 'hu', 20)
        page.locator('#tabbar [data-tab=food]').click(); page.locator('[data-a=food-ai][data-m=text]').click()
        page.locator('[data-in=ai-text]').fill('2 zsemle, 10 dkg sonka és egy pohár tej'); page.locator('[data-a=ai-go]').click()
        page.locator('[data-in=ai-f][data-k=name][data-i="2"]').wait_for()
        self.assertEqual([page.locator(f'[data-in=ai-f][data-k=grams][data-i="{i}"]').input_value() for i in range(3)], ['114', '100', '258'])
        self.bounds(page, 'describe result')
        page.locator('[data-a=ai-add]').click()
        self.assertEqual(len(page.evaluate('Object.values(Store.d.food).flat()')), 3)
        page.evaluate('Store.d.settings.coach=true;Store.save();__gym.render()'); page.locator('#coach').click()
        page.locator('[data-a=coach-ask]').first.click()
        self.assertIn('167 kcal', page.locator('#chat .msg.ai').last.inner_text())
        page.locator('#coach-in').fill('mit egyek edzés előtt?'); page.locator('#coach-send').click()
        self.assertIn('AI-kulcs', page.locator('#chat .msg.ai').last.inner_text())
        self.assertEqual(page.evaluate('Store.d.chats.at(-1).msgs.length'), 4)
        self.bounds(page, 'offline coach')
        self.assertEqual(errors, [])

    def test_coach_answers_food_locally_even_with_key(self):
        page, errors = self.page(390, 844, 'en')
        page.evaluate("Store.d.settings.apiKey='sk-test';Store.d.settings.keyState='ok';Store.d.settings.coach=true;Store.save();__gym.render()")
        calls = []
        page.route('https://api.anthropic.com/**', lambda r: (calls.append(r.request.url), r.fulfill(json={'content': [{'type': 'text', 'text': 'Coach reply'}]})))
        page.locator('#coach').click(); page.locator('#coach-in').fill('2 eggs and a slice of white bread'); page.locator('#coach-send').click()
        self.assertIn('Total: 236 kcal', page.locator('#chat .msg.ai').last.inner_text()); self.assertEqual(calls, [])
        page.locator('#coach-in').fill('How should I warm up for squats?'); page.locator('#coach-send').click()
        page.locator('#chat .msg.ai', has_text='Coach reply').wait_for(); self.assertEqual(len(calls), 1)
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
