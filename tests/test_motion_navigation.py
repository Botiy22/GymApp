import unittest
import test_responsive_polish as responsive
from workout_navigation import select_workout

class MotionNavigation(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def test_equal_navigation_cells_and_keyboard(self):
        for width,text,lang in [(320,20,'hu'),(390,16,'en'),(430,20,'hu'),(844,16,'en')]:
            p,errors=self.page(width,844,lang,text)
            nav=p.locator('.workout-menu-nav')
            sizes=nav.locator('summary,.workout-menu-history').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})')
            for axis in [0,1]:self.assertLess(max(x[axis] for x in sizes)-min(x[axis] for x in sizes),1)
            summary=p.locator('[data-workout-menu=training] summary')
            summary.focus();p.keyboard.press('ArrowDown')
            self.assertTrue(p.locator('[data-workout-menu=training]').evaluate('e=>e.open'))
            p.keyboard.press('End');self.assertEqual(p.evaluate('document.activeElement.dataset.v'),'swim')
            p.keyboard.press('Escape');self.assertTrue(summary.evaluate('e=>e===document.activeElement'))
            self.assertFalse(p.locator('[data-workout-menu=training]').evaluate('e=>e.open'))
            p.locator('#tabbar [data-tab=settings]').click()
            sizes=p.locator('.settings-jumps>button').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,e.scrollWidth,e.clientWidth]})')
            for axis in [0,1]:self.assertLess(max(x[axis] for x in sizes)-min(x[axis] for x in sizes),1)
            self.assertTrue(all(x[2]<=x[3]+1 for x in sizes))
            self.bounds(p,'equal settings navigation')
            self.assertEqual(errors,[])

    def test_three_motion_players_play_pause_restart_speed_and_cleanup(self):
        p,errors=self.page(390,844,'en')
        for id in ['Hammer_Curls','Side_Lateral_Raise','Leg_Extensions']:
            p.evaluate('(id)=>__gym.A["ex-open"]({dataset:{id}})',id)
            self.assertEqual(p.locator('.drawing-phase').count(),2)
            player=p.locator('exercise-motion');self.assertEqual(player.count(),1)
            player.locator('.launch').click()
            p.wait_for_function('()=>document.querySelector("exercise-motion").phase>.03')
            a=player.locator('.scene').inner_html();p.wait_for_timeout(240)
            self.assertNotEqual(a,player.locator('.scene').inner_html())
            player.locator('[data-do=play]').click();paused=player.evaluate('e=>e.phase')
            p.wait_for_timeout(180);self.assertEqual(paused,player.evaluate('e=>e.phase'))
            player.locator('[data-do=speed]').click();self.assertEqual(player.evaluate('e=>e.speed'),.5)
            player.locator('[data-do=restart]').click();self.assertEqual(player.evaluate('e=>e.phase'),0)
            player.locator('[data-do=play]').click();p.wait_for_timeout(100)
            p.screenshot(path='/tmp/reppsy-motion-'+id+'.png')
            player.locator('.launch').click();self.assertFalse(player.evaluate('e=>e.running'))
            self.assertTrue(player.locator('section').evaluate('e=>e.hidden'))
            player.locator('.launch').click();p.evaluate('window.removedPlayer=document.querySelector("exercise-motion")')
            p.locator('[data-a=sheet-close]').click();p.wait_for_function('()=>!removedPlayer.running');phase=p.evaluate('removedPlayer.phase')
            p.wait_for_timeout(100);self.assertEqual(phase,p.evaluate('removedPlayer.phase'))
            p.evaluate('removedPlayer.remove()');p.wait_for_timeout(50);self.assertEqual(phase,p.evaluate('removedPlayer.phase'))
        p.evaluate('()=>__gym.A["ex-open"]({dataset:{id:"Barbell_Full_Squat"}})')
        self.assertEqual(p.locator('exercise-motion').count(),0)
        self.assertEqual(errors,[])

    def test_motion_on_narrow_hungarian_phone_and_offscreen_pause(self):
        p,errors=self.page(320,740,'hu',20)
        p.evaluate('()=>__gym.A["ex-open"]({dataset:{id:"Leg_Extensions"}})')
        player=p.locator('exercise-motion');player.locator('.launch').click()
        p.wait_for_function('()=>document.querySelector("exercise-motion").phase>.01')
        self.assertEqual(player.locator('[data-do=play]').inner_text(),'Szünet')
        sizes=player.locator('.controls>button').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,r.right]})')
        self.assertLess(max(x[0] for x in sizes)-min(x[0] for x in sizes),1)
        self.assertTrue(all(x[1]>=44 and x[2]<=320 for x in sizes))
        p.locator('.sheet-body').evaluate('e=>e.scrollTop=e.scrollHeight')
        p.wait_for_function('()=>document.querySelector("exercise-motion").visible===false')
        phase=player.evaluate('e=>e.phase');p.wait_for_timeout(150)
        self.assertEqual(phase,player.evaluate('e=>e.phase'))
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
