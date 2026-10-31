import unittest
import test_responsive_polish as responsive
from choice_navigation import choose
class BellozzoBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def test_search_choose_base_log_and_reload_without_key(self):
        p,errors=self.page(320,844,'hu',20)
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-manual]').click()
        p.locator('[data-in=fs-q]').fill('primavera grande')
        self.bounds(p,'search pasta');p.locator('[data-a=bellozzo-open]').click()
        p.locator('[data-a=ai-pick-restaurant]').first.wait_for()   # 2.45: up to six options are tap cards
        self.assertEqual(p.locator('[data-a=ai-add]').count(),0)
        p.locator('[data-a=ai-pick-restaurant][data-id=pasta-primavera-grande-fusilloni]').click()
        self.assertEqual(p.locator('[data-in=ai-f][data-k=kcal]').input_value(),'1367')
        self.assertIn('770 kcal + Fusilloni durum 597 kcal',p.locator('.ai-basis').inner_text())
        p.locator('[data-in=ai-f][data-k=servings]').fill('0.25')
        self.assertEqual(p.locator('[data-in=ai-f][data-k=p]').input_value(),'15.3')
        self.bounds(p,'portion review');p.screenshot(path='/tmp/bellozzo-review.png')
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().map(f=>[f.g,f.servings,f.kcal,f.p])'),[[0,0.25,342,15.3]])
        p.reload();p.wait_for_function('()=>!!window.__gym')
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat()[0].servings'),0.25)
        self.assertEqual(errors,[])
    def test_menu_search_pizza_size_and_unsupported_modifications(self):
        p,errors=self.page(390,844,'en')
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-manual]').click()
        p.locator('[data-in=fs-q]').fill('bellozzo')
        self.assertGreater(p.locator('[data-a=bellozzo-open]').count(),10)
        p.locator('[data-in=fs-q]').fill('bellozzo margherita');p.locator('[data-a=bellozzo-open]').click()
        p.locator('[data-a=ai-pick-restaurant]').first.wait_for()   # 2.45: up to six options are tap cards
        p.locator('[data-a=ai-pick-restaurant][data-id=pizza-margherita-32]').click()
        self.assertEqual(p.locator('[data-in=ai-f][data-k=kcal]').input_value(),'1060')
        p.locator('[data-a=ai-add]').click()
        p.locator('[data-a=food-ai][data-m=text]').click()
        p.locator('[data-in=ai-text]').fill('bellozzo margherita 40cm');p.locator('[data-a=ai-go]').click()
        p.locator('.ai-pending').wait_for();self.assertEqual(p.locator('[data-a=ai-add]').count(),0)
        self.assertEqual(errors,[])
    def test_complete_name_search_and_burger_king_regression(self):
        p,errors=self.page()
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-manual]').click()
        p.locator('[data-in=fs-q]').fill('primavera grande penne')
        p.locator('[data-a=fq-add]').click()
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat()[0].kcal'),1318)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat()[0].servings'),1)
        p.locator('[data-a=food-manual]').click();p.locator('[data-in=fs-q]').fill('whopper')
        p.locator('[data-a=fq-add]').click()
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat()[1].kcal'),732)
        self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
