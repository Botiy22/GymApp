"""2.55: an estimated store product is looked up online in the background and offered as one tap.
Open Food Facts is mocked with a synthetic product; nothing here is real brand data."""
import json
import os
import unittest
import test_responsive_polish as responsive

SHOTS = os.environ.get('REPPSY_SHOTS')
PRODUCT = {'code': '5900000000017', 'product_name': 'Skyr natúr', 'brands': 'Milbona', 'stores': 'Lidl',
           'nutrition_data_per': '100g', 'nutriments': {'energy-kcal_100g': 62, 'proteins_100g': 11, 'carbohydrates_100g': 4, 'fat_100g': 0.2}}
OTHER = {'code': '5900000000024', 'product_name': 'Vaníliás puding', 'brands': 'Pilos', 'stores': 'Lidl',
         'nutrition_data_per': '100g', 'nutriments': {'energy-kcal_100g': 100, 'proteins_100g': 3, 'carbohydrates_100g': 17, 'fat_100g': 2}}


class StoreProducts(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def describe(self, p, text):
        p.locator('#tabbar [data-tab=food]').click(); box = p.locator('.quick-log [name=q]'); box.fill(text); box.press('Enter')

    def test_found_label_is_offered_and_used_after_confirming(self):
        p, errors = self.page(360, 800, 'hu')
        calls = []
        def off(route):
            calls.append(route.request.url)
            route.fulfill(status=200, content_type='application/json', body=json.dumps({'products': [OTHER, PRODUCT]}))
        p.route('https://world.openfoodfacts.org/**', off)
        self.describe(p, '150g milbona skyr natúr')
        p.locator('.ai-item').first.wait_for()
        self.assertIn('Lidl saját márka (Milbona)', p.locator('.ai-item').first.inner_text())
        p.locator('[data-a=ai-use-product]').wait_for(timeout=10000)
        self.assertIn('Milbona Skyr natúr', p.locator('[data-a=ai-use-product]').inner_text())
        self.assertIn('Lidl', calls[0])
        if SHOTS: p.screenshot(path=os.path.join(SHOTS, 'store-product-found.png'))
        self.bounds(p, 'found product')
        p.locator('[data-a=ai-use-product]').click()
        self.assertEqual(p.locator('#fmf [name=kcal]').input_value(), '62')
        p.locator('[form=fmf]').click(); p.locator('.ai-item').first.wait_for()
        item = p.evaluate('__gym.ui.ai.res.items[0]')
        self.assertTrue(item['label']); self.assertFalse(item.get('estimated')); self.assertEqual(item['kcal'], 93)
        self.assertEqual(p.evaluate('Store.d.myFoods.length'), 1)
        self.assertEqual(errors, [])

    def test_no_match_or_offline_keeps_the_estimate_quietly(self):
        p, errors = self.page(360, 800, 'hu')
        p.route('https://world.openfoodfacts.org/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps({'products': [OTHER]})))
        self.describe(p, '150g milbona skyr')
        p.locator('.ai-item').first.wait_for(); p.wait_for_timeout(600)
        self.assertEqual(p.locator('[data-a=ai-use-product]').count(), 0, 'another product is never offered')
        self.assertTrue(p.evaluate('__gym.ui.ai.res.items[0].estimated'))
        p.route('https://world.openfoodfacts.org/**', lambda r: r.abort())
        p.locator('[data-a=ai-reset]').click() if p.locator('[data-a=ai-reset]').count() else None
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
