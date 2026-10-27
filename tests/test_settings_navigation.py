import unittest
import test_responsive_polish as responsive
class SettingsNavigation(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    def test_sections_survive_reload_and_animations_enabled(self):
        p,errors=self.page()
        p.emulate_media(reduced_motion='no-preference')
        p.evaluate('()=>{Store.d.settings.calm=true;Store.save()}')
        p.locator('#tabbar [data-tab=settings]').click()
        section=p.locator('.settings-group[open]').first
        key=section.get_attribute('data-section')
        section.locator('summary').first.click()
        p.wait_for_function('(k)=>document.querySelector(`[data-section="${k}"]`).open===false',arg=key)
        p.reload();p.wait_for_function('()=>!!window.__gym')
        p.locator('#tabbar [data-tab=settings]').click()
        self.assertFalse(p.locator('[data-section="'+key+'"]').evaluate('(e)=>e.open'))
        self.assertEqual(p.locator('[data-in=set-flag][data-k=calm]').count(),0)
        self.assertFalse(p.evaluate('document.documentElement.hasAttribute("data-calm")'))
        p.locator('[data-section="'+key+'"] > summary').click()
        p.wait_for_function('(k)=>Store.d.settings.sections[k]===true',arg=key)
        p.reload();p.wait_for_function('()=>!!window.__gym');p.locator('#tabbar [data-tab=settings]').click()
        self.assertTrue(p.locator('[data-section="'+key+'"]').evaluate('(e)=>e.open'))
        self.assertEqual(errors,[])
    def test_navigation_covers_bottom_and_safe_area(self):
        for light in [False,True]:
            p,errors=self.page(390,844,light=light)
            p.evaluate('document.documentElement.style.setProperty("--sb","34px")')
            p.mouse.wheel(0,1200)
            result=p.locator('#tabbar').evaluate('e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:r.left,right:r.right,bottom:r.bottom,bg:s.backgroundColor,radius:s.borderRadius}}')
            self.assertEqual(result['left'],0);self.assertEqual(result['right'],390);self.assertEqual(result['bottom'],844)
            self.assertTrue(result['bg'].startswith('rgb('),result);self.assertEqual(result['radius'],'0px');self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
