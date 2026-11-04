import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout
from choice_navigation import choose

class VisibleNavigation(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def equal_tabs(self,p,selector):
        buttons=p.locator(selector)
        self.assertTrue(buttons.count()>1)
        self.assertEqual(buttons.first.locator('xpath=ancestor::details[contains(@class,"choice-menu")]').count(),0)
        sizes=buttons.evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,e.scrollWidth,e.clientWidth]})')
        for axis in [0,1]:self.assertLess(max(x[axis] for x in sizes)-min(x[axis] for x in sizes),1,selector)
        self.assertTrue(all(x[1]>=44 and x[2]<=x[3]+1 for x in sizes),selector)

    def test_visible_equal_page_tabs_and_recipe_filters_on_phone_sizes(self):
        for width,lang,text in [(320,'hu',20),(390,'hu',20),(430,'en',16),(844,'en',20)]:
            with self.subTest(width=width):
                p,errors=self.page(width,844,lang,text)
                p.evaluate("Store.d.plan={name:'Test plan',notes:[],train:[],days:[]}")
                p.locator('#tabbar [data-tab=food]').click()
                self.equal_tabs(p,'[data-a=food-view]')
                p.locator('[data-a=food-view][data-v=plan]').click()
                self.assertEqual(p.evaluate('__gym.ui.food'),'plan')
                p.locator('[data-a=food-view][data-v=ideas]').click()
                self.equal_tabs(p,'[data-a=recipe-goal]');self.equal_tabs(p,'[data-a=idea-cat]')
                p.locator('[data-a=recipe-goal][data-goal=loss]').click()
                p.locator('[data-a=idea-cat][data-c=breakfast]').click()
                self.assertEqual(p.evaluate('[__gym.ui.recipeGoal,__gym.ui.idea]'),['loss','breakfast'])
                self.bounds(p,'visible recipe filters')
                p.screenshot(path=f'/tmp/visible-recipes-{width}.png')
                p.locator('#tabbar [data-tab=goals]').click();self.equal_tabs(p,'[data-a=goals-view]')
                self.equal_tabs(p,'[data-a=planner-view]')
                p.locator('[data-a=goals-view][data-v=habits]').click()
                self.assertEqual(p.evaluate('__gym.ui.goals'),'habits')
                p.locator('.profile-shortcut').click();self.equal_tabs(p,'[data-a=profile-view]')
                p.locator('[data-a=profile-view][data-v=ranks]').click()
                self.assertEqual(p.evaluate('__gym.ui.profilePage'),'ranks')
                self.bounds(p,'visible profile navigation');self.assertEqual(errors,[])

    def test_equipment_label_does_not_split_words_and_filters_work(self):
        for width in [320,390,430]:
            p,errors=self.page(width,844,'hu',20)
            select_workout(p,'exercises')
            select=p.locator('[data-in=lib-eq]');menu=select.locator('..')
            summary=menu.locator('summary');label=summary.locator('.choice-value')
            self.assertGreater(menu.bounding_box()['width'],width*.8)
            self.assertLess(summary.bounding_box()['height'],90)
            lines=label.evaluate('''e=>{const text=e.firstChild;let offset=0;return text.textContent.split(' ').map(word=>{const r=document.createRange();r.setStart(text,offset);r.setEnd(text,offset+word.length);offset+=word.length+1;return r.getClientRects().length})}''')
            self.assertTrue(all(n==1 for n in lines),lines)
            self.equal_tabs(p,'[data-a=lib-grp]')
            p.locator('[data-a=lib-grp][data-g=lower]').click()
            self.equal_tabs(p,'[data-a=lib-mus]')
            choose(p,'[data-in=lib-eq]','machine')
            self.assertEqual(p.evaluate('__gym.ui.lib.eq'),'machine')
            p.locator('[data-in=lib-q]').fill('ulo labnyujto gep')
            p.locator('[data-a=ex-open][data-id=Leg_Extensions]').wait_for()
            self.bounds(p,'exercise filters')
            p.screenshot(path=f'/tmp/visible-exercises-{width}.png')
            self.assertEqual(errors,[])

    def test_visible_tabs_keyboard_and_focus_after_rerender(self):
        p,errors=self.page(390,844,'en')
        p.locator('#tabbar [data-tab=food]').click()
        first=p.locator('[data-a=food-view]').first
        first.focus();p.keyboard.press('End');p.keyboard.press('Enter')
        self.assertEqual(p.evaluate('__gym.ui.food'),'ideas')
        self.assertEqual(p.evaluate('document.activeElement.dataset.v'),'ideas')
        p.keyboard.press('Home');p.keyboard.press('Enter')
        self.assertEqual(p.evaluate('__gym.ui.food'),'diary')
        self.assertEqual(p.evaluate('document.activeElement.dataset.v'),'diary')
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
