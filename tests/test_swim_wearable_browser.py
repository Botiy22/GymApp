from workout_navigation import select_workout
"""2.38: swim logging, and the smartwatch bridge driven by a fake native iOS handler (swim form, live ride data, ride import)."""
import unittest
from choice_navigation import choose
import test_rides_browser as rides
import test_responsive_polish as responsive

FAKE_IOS = """window.__sent=[];window.webkit={messageHandlers:{reppsyWearable:{postMessage(m){__sent.push(m);setTimeout(()=>{
 if(m.method==='importWorkouts'&&m.params.kinds[0]==='swim'){const s=Date.now()-3600e3,laps=[];for(let i=0;i<40;i++)laps.push({stroke:i<24?'free':i<34?'breast':'back',dist:25,sec:45,strokes:18});
  Wearable.receive({v:1,re:m.id,ok:true,result:{workouts:[{kind:'swim',start:s,end:s+40*60e3,device:'Apple Watch',pool:25,laps,kcal:310,hr:{avg:132,max:158},strokes:720}]}});}
 else if(m.method==='importWorkouts'){const s=Date.now()-7200e3;Wearable.receive({v:1,re:m.id,ok:true,result:{workouts:[{kind:'ride',start:s,end:s+3600e3,device:'Garmin',dist:24500,moving:3400,kcal:610,hr:{avg:141,max:171},cadence:84,power:{avg:165,max:420}}]}});}
 else Wearable.receive({v:1,re:m.id,ok:true,result:{}});},10);}}}};"""

class SwimWearable(unittest.TestCase):
    setUpClass = classmethod(rides.RideBrowser.setUpClass.__func__)
    tearDownClass = classmethod(rides.RideBrowser.tearDownClass.__func__)
    bounds = responsive.ResponsivePolish.bounds
    feed = rides.RideBrowser.feed

    def page(self, width=390, lang='hu', native=False):
        context = self.browser.new_context(viewport={'width': width, 'height': 844}, service_workers='block', reduced_motion='reduce')
        self.addCleanup(context.close)
        context.route('**/js/config.js', lambda r: r.fulfill(body="window.CLOUD={url:'',key:''};", content_type='application/javascript'))
        context.route('https://tile.openstreetmap.org/**', lambda r: r.fulfill(body=rides.TILE, content_type='image/png'))
        if native: context.add_init_script(FAKE_IOS)
        page = context.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/'); page.wait_for_function('()=>!!window.__gym')
        page.evaluate('(l)=>{Store.d.settings.lang=l;Store.d.settings.profile.weight="80";Store.save();__gym.render()}', lang)
        return page, errors

    def open_swim(self, page):
        page.evaluate("__gym.A['cardio-add']({dataset:{target:''}})"); choose(page,'[data-in=cardio-type]','swim')

    def test_log_mixed_swim_by_hand_on_a_small_phone(self):
        page, errors = self.page(320)
        self.open_swim(page)
        self.assertIn('webes', page.locator('.wear-card').inner_text())          # the watch part explains it is for the apps
        page.fill('[name=minutes]', '40'); page.fill('[name=laps_free]', '20'); page.fill('[name=laps_breast]', '30'); page.fill('[name=laps_back]', '10')
        self.assertEqual(page.locator('#swim-out').inner_text().split('\n')[:3], ['1500 m', 'táv', '2:40'])
        self.bounds(page, 'swim form')
        page.locator('#sheet button.primary.wide').click()
        w = page.evaluate('Store.d.workouts.at(-1)')
        self.assertEqual([w['name'], w['cardio'][0]['laps'], w['cardio'][0]['pool']], ['Úszás', {'free': 20, 'breast': 30, 'back': 10}, 25])
        self.assertEqual(page.evaluate('WorkoutEnergy.workout(Store.d.workouts.at(-1)).cardio'), 245)
        page.reload(); page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(page.evaluate('Store.d.workouts.at(-1).cardio[0].laps.breast'), 30)
        self.assertEqual(errors, [])

    def test_native_watch_fills_swim_shows_live_and_measured_energy(self):
        page, errors = self.page(390, 'hu', True)
        self.assertEqual(page.evaluate('Wearable.platform()'), 'ios')
        self.open_swim(page)
        page.locator('[data-a=wear-import][data-kind=swim]').click()
        page.wait_for_function('()=>__gym.ui.cardioDraft.laps_free===24')
        self.assertIn('310 kcal', page.locator('#swim-out').inner_text())
        page.locator('[data-a=wear-live][data-kind=swim]').click()
        page.wait_for_function('()=>!!document.querySelector("#wear-live-swim")')
        page.evaluate("Wearable.receive({v:1,type:'live',session:'x',kind:'swim',sample:{hr:128,kcal:95,dist:650,laps:26,strokes:470}})")
        self.assertIn('128', page.locator('#wear-live-swim').inner_text())
        page.locator('#sheet button.primary.wide').click()
        c = page.evaluate('Store.d.workouts.at(-1).cardio[0]')
        self.assertEqual([c['laps'], c['wear']['kcal'], c['wear']['device']], [{'free': 24, 'breast': 10, 'back': 6}, 310, 'Apple Watch'])
        self.assertEqual(page.evaluate('__sent.map(m=>m.method)'), ['authorize', 'importWorkouts', 'authorize', 'startLive'])
        self.assertEqual(errors, [])

    def test_live_watch_data_during_a_ride_and_ride_import(self):
        page, errors = self.page(390, 'en', True)
        select_workout(page,'ride')
        self.assertEqual(page.locator('.wear-card[data-wear=ride] [data-a=wear-live]').count(), 1)
        page.locator('[data-a="ride-start"]').click(); page.locator('#ride-live').wait_for()
        self.feed(page, 120)
        for hr, pw in [(130, 180), (150, 220)]:
            page.evaluate("([h,p])=>Wearable.receive({v:1,type:'live',session:'r',kind:'ride',sample:{hr:h,power:p,cadence:88}})", [hr, pw])
        self.assertEqual(page.evaluate('[__gym.ride.hr[0]/__gym.ride.hr[1],__gym.ride.pw[2]]'), [140, 220])
        page.evaluate("__gym.A['ride-min']&&__gym.A['ride-min']()")
        page.evaluate("Store.d.workouts=Store.d.workouts.filter(w=>!w.ride);Store.save();__gym.render()")
        page.locator('[data-a=wear-import][data-kind=ride]').click()
        page.wait_for_function('()=>Store.d.workouts.some(w=>w.ride&&w.ride.src==="watch")')
        w = page.evaluate('Store.d.workouts.find(w=>w.ride&&w.ride.src==="watch")')
        self.assertEqual([w['ride']['dist'], w['ride']['hr']['avg'], w['cardio'][0]['wear']['kcal']], [24500, 141, 610])
        self.assertEqual(errors, [])

if __name__ == '__main__':
    unittest.main()
