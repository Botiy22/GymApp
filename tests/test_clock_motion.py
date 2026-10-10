"""Real DOM fill interpolation, rapid changes, centering and reduced motion."""
import unittest
import test_responsive_polish as responsive

class ClockMotion(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def goals(self,motion=True):
        page,errors=self.page(320,844,'en',20)
        page.emulate_media(reduced_motion='no-preference' if motion else 'reduce')
        page.evaluate('''()=>{Store.d.settings.calm=false;__gym.A['set-bg']({dataset:{v:Store.d.settings.bg}});Store.d.habits=[Momentum.clean({id:'water',name:'Water',source:'count',goal:3,unit:'Liter',days:[0,1,2,3,4,5,6],logs:{}})];Store.save();__gym.ui.tab='goals';__gym.render();}''')
        return page,errors

    def test_goal_charge_rapid_changes_undo_and_centered_counter(self):
        page,errors=self.goals()
        page.locator('[data-a=habit-count][data-n="1"]').click()
        page.wait_for_function('()=>{const c=document.querySelector(".momentum-dial");return +c.dataset.clockDisplay>0&&+c.dataset.clockDisplay<+c.dataset.clockRatio}')
        page.wait_for_function('()=>+document.querySelector(".momentum-dial").dataset.clockDisplay===.33')
        result=page.evaluate('''()=>{const before=+document.querySelector('.momentum-dial').dataset.clockDisplay;const el={dataset:{id:'water',d:__gym.ui.habitDate,n:'1'}};__gym.A['habit-count'](el);__gym.A['habit-count'](el);el.dataset.n='-1';__gym.A['habit-count'](el);return {before,from:+document.querySelector('.momentum-dial').dataset.clockDisplay,target:+document.querySelector('.momentum-dial').dataset.clockRatio};}''')
        self.assertEqual(result,{'before':.33,'from':.33,'target':.67})
        page.wait_for_function('()=>+document.querySelector(".momentum-dial").dataset.clockDisplay===.67')
        self.assertEqual(page.locator('.momentum-dial .filled').count(),41)
        centered=page.locator('.habit-counter .pill').evaluate('''e=>{const r=document.createRange();r.selectNodeContents(e);const a=r.getBoundingClientRect(),b=e.getBoundingClientRect();return {x:Math.abs(a.x+a.width/2-b.x-b.width/2),y:Math.abs(a.y+a.height/2-b.y-b.height/2)};}''')
        self.assertLess(centered['x'],1);self.assertLess(centered['y'],2);self.bounds(page,'goal clock');page.screenshot(path='/tmp/reppsy-clock-goals-320.png');self.assertEqual(errors,[])

    def test_food_clock_fill_and_profile_share_current_level(self):
        page,errors=self.goals();page.locator('#tabbar [data-tab=food]').click()
        page.evaluate('''()=>{Store.d.food[__gym.ui.foodDate]=[{id:'food',name:'Meal',g:200,kcal:1325,p:20,c:30,f:10}];Store.save();__gym.render();}''')
        page.wait_for_function('()=>{const c=document.querySelector(".dial-wrap");return +c.dataset.clockDisplay>0&&+c.dataset.clockDisplay<.5}')
        page.wait_for_function('()=>+document.querySelector(".dial-wrap").dataset.clockDisplay===.5');self.assertEqual(page.locator('.dial-wrap .filled').count(),30)
        page.evaluate('()=>__gym.A["profile-home"]()');self.assertEqual(page.locator('.dial-wrap').get_attribute('data-clock-display'),'0.5')
        page.evaluate('()=>{Store.d.food={};Store.save();__gym.render()}');page.wait_for_function('()=>+document.querySelector(".dial-wrap").dataset.clockDisplay===0');self.assertEqual(page.locator('.dial-wrap .filled').count(),0);self.assertEqual(errors,[])

    def test_reduced_motion_immediate_and_date_changes_do_not_borrow_fill(self):
        page,errors=self.goals(False);page.locator('[data-a=habit-count][data-n="1"]').click()
        self.assertEqual(page.locator('.momentum-dial').get_attribute('data-clock-display'),'0.33');self.assertEqual(page.locator('.clock-charging').count(),0)
        page.locator('[data-a=habit-date][data-d="-1"]').click();self.assertEqual(page.locator('.momentum-dial').get_attribute('data-clock-display'),'0');self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
