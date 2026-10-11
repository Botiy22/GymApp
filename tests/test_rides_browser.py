"""Real-browser regression for bike rides: recording, resume after reload, saving, GPX export/import, sensors and layout."""
import functools
import http.server
import json
import math
import os
from pathlib import Path
import tempfile
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
# A plain grey tile stands in for OpenStreetMap so the map renders offline and no real tile server is contacted.
TILE = bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010806000000'
                     '1f15c4890000000d49444154789c63f8cfc0f01f0005000201e2b9e1a90000000049454e44ae426082')

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

FAKE_BLUETOOTH = """
window.__chars={};
const mk=()=>({listeners:[],addEventListener(t,f){this.listeners.push(f)},async startNotifications(){},emit(bytes){const v=new DataView(new Uint8Array(bytes).buffer);this.listeners.forEach(f=>f({target:{value:v}}))}});
Object.defineProperty(navigator,'bluetooth',{value:{async requestDevice(){return{name:'Trainer',addEventListener(){},gatt:{async connect(){return{async getPrimaryService(s){if(s==='heart_rate')throw new Error('absent');return{async getCharacteristic(c){return window.__chars[c]=window.__chars[c]||mk()}}}}},disconnect(){}}}}}});
"""

class RideBrowser(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path=os.environ.get('GYMAPP_BROWSER_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop(); cls.server.shutdown(); cls.server.server_close()

    def page(self, width=390, lang='en', bluetooth=False):
        context = self.browser.new_context(viewport={'width': width, 'height': 844}, service_workers='block', reduced_motion='reduce')
        self.addCleanup(context.close)
        context.route('**/js/config.js', lambda r: r.fulfill(body="window.CLOUD={url:'',key:''};", content_type='application/javascript'))
        context.route('https://tile.openstreetmap.org/**', lambda r: r.fulfill(body=TILE, content_type='image/png'))
        if bluetooth: context.add_init_script(FAKE_BLUETOOTH)
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e))); page.on('dialog', lambda d: d.accept())
        page.goto(f'http://127.0.0.1:{self.server.server_port}/'); page.wait_for_function('()=>!!window.__gym')
        page.evaluate('(l)=>{Store.d.settings.lang=l;Store.d.settings.calm=true;Store.d.settings.profile.weight="75";Store.save();__gym.render()}', lang)
        page.locator('[data-a="workout-view"][data-v="ride"]').click()
        return page, errors

    def feed(self, page, seconds=300, metres=7):
        # Shift the ride's start back so synthetic fixes line up with the real clock, then drive north with a gentle climb.
        start = page.evaluate('()=>{const r=__gym.ride;r.start-=%d;r.pts=[];r.last=null;r.eleRef=null;return r.start}' % (seconds * 1000 + 2000))
        fixes = [{'lat': 47.5 + i * metres / 111195, 'lon': 19.04, 'acc': 5, 'alt': 110 + i * 0.1, 'altAcc': 4, 'speed': metres, 't': start + 1000 + i * 1000} for i in range(seconds)]
        page.evaluate('(f)=>f.forEach(x=>__gym.rideFix(x))', fixes)
        return start

    def test_record_resume_finish_export_and_reimport(self):
        page, errors = self.page()
        page.locator('[data-a="ride-start"]').click()
        live = page.locator('#ride-live'); live.wait_for()
        self.feed(page)
        self.assertEqual(page.locator('#ride-live [data-r=dist]').inner_text(), '2.09')
        page.wait_for_function('()=>document.querySelectorAll("#ride-live .ride-line").length===1')
        page.locator('[data-a="ride-pause"]').click()
        self.assertTrue(page.evaluate('__gym.ride.paused'))
        page.locator('[data-a="ride-pause"]').click()
        page.locator('[data-a="ride-min"]').click()
        self.assertTrue(page.locator('#ride-pill').is_visible())
        self.assertIn('2.09 km', page.locator('#ride-pill').inner_text())
        # Closing or reloading the app keeps the running ride.
        page.reload(); page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(page.evaluate('__gym.ride.pts.length'), 300)
        page.locator('#ride-pill').click(); page.locator('[data-a="ride-finish"]').click()
        page.locator('#sheet .ride-kpis').wait_for()
        self.assertEqual(page.locator('#sheet-title').inner_text(), 'Ride saved')
        self.assertEqual(page.locator('.ride-kpis b').first.inner_text(), '2.09')
        page.wait_for_function('()=>!!document.querySelector("#sheet .ride-line")')
        self.assertEqual(page.locator('#sheet .ride-profile svg').count(), 1)
        self.assertFalse(page.evaluate('!!localStorage.getItem("gymapp.v1.ride")'))
        saved = page.evaluate('Store.d.workouts.find(w=>w.ride)')
        self.assertEqual(saved['entries'], []); self.assertEqual(saved['cardio'][0]['type'], 'cycle'); self.assertEqual(saved['cardio'][0]['minutes'], 5)
        self.assertAlmostEqual(saved['ride']['dist'], 2093, delta=5); self.assertAlmostEqual(saved['ride']['gain'], 25, delta=6)
        with page.expect_download() as download:
            page.locator('[data-a="ride-gpx"]').click()
        gpx = Path(download.value.path()).read_text()
        self.assertIn('<type>cycling</type>', gpx); self.assertGreaterEqual(gpx.count('<time>'), 3)
        page.locator('#sheet [data-a="sheet-close"]').click()
        self.assertEqual(page.evaluate('__gym.ui.workout'), 'ride')
        self.assertEqual(page.locator('.ride-row').count(), 1)
        # The same file again is recognised as a duplicate; a renamed copy of a different day imports.
        with tempfile.TemporaryDirectory() as tmp:
            same = Path(tmp) / 'same.gpx'; same.write_text(gpx)
            page.locator('[data-in="ride-file"]').set_input_files(str(same))
            page.wait_for_function('()=>document.querySelector("#toast").textContent.includes("already")')
            other = Path(tmp) / 'other.gpx'; other.write_text(gpx.replace('2026-', '2025-').replace('<name>', '<name>Lake loop ').replace('</name>', '</name>', 1))
            page.locator('[data-in="ride-file"]').set_input_files(str(other))
            page.locator('#sheet .ride-kpis').wait_for()
            self.assertIn('Lake loop', page.locator('#sheet-title').inner_text())
        page.locator('#sheet [data-a="sheet-close"]').click()
        self.assertEqual(page.locator('.ride-row').count(), 2)
        page.locator('[data-a="workout-view"][data-v="history"]').click()
        self.assertIn('2.09 km', page.locator('.history-title small').first.inner_text())
        page.locator('.history-title').first.click()
        page.locator('#sheet .ride-kpis').wait_for()
        self.assertEqual(errors, [])

    def test_bluetooth_sensor_drives_an_indoor_ride(self):
        page, errors = self.page(bluetooth=True)
        page.locator('[data-a="ride-sensor"]').click()
        page.locator('.sensor-row').wait_for()
        self.assertIn('Speed & cadence', page.locator('.sensor-row').inner_text())
        page.locator('[data-a="ride-start"]').click()
        for i in range(1, 31):
            wheel, crank, clock = 100 + i * 4, 10 + i * 2, (i * 1024) % 65536
            page.evaluate('(b)=>__chars.csc_measurement.emit(b)', [3, wheel & 255, wheel >> 8, 0, 0, clock & 255, clock >> 8, crank & 255, crank >> 8, clock & 255, clock >> 8])
        page.wait_for_timeout(150)
        self.assertEqual(page.locator('#ride-live [data-r=spd]').inner_text(), '30.3')
        self.assertEqual(page.locator('#ride-live [data-r=cad]').inner_text(), '120')
        self.assertTrue(page.locator('#ride-live [data-box=hr]').is_hidden())
        page.locator('[data-a="ride-finish"]').click()
        page.locator('#sheet .ride-kpis').wait_for()
        ride = page.evaluate('Store.d.workouts.find(w=>w.ride).ride')
        self.assertTrue(ride['wheel']); self.assertEqual(ride['dist'], 244); self.assertEqual(ride['cad']['avg'], 120)
        self.assertIn('wheel sensor', page.locator('#sheet .note').inner_text())
        self.assertEqual(errors, [])

    def test_ride_screens_fit_small_phones_in_both_languages(self):
        for lang in ['en', 'hu']:
            with self.subTest(lang=lang):
                page, errors = self.page(320, lang)
                self.assertEqual(len({round(b['y']) for b in page.locator('.workout-tabs button').evaluate_all('(bs)=>bs.map(b=>b.getBoundingClientRect())')}), 1)
                self.assertTrue(page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                page.locator('[data-a="ride-start"]').click(); self.feed(page, 60)
                over = page.evaluate('()=>[...document.querySelectorAll("#ride-live .ride-head *,#ride-live .ride-panel *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length')
                self.assertEqual(over, 0)
                self.assertFalse(page.locator('.ride-head .btn').evaluate('(b)=>b.getBoundingClientRect().width>innerWidth/2'))
                page.locator('[data-a="ride-discard"]').click()
                self.assertIsNone(page.evaluate('__gym.ride'))
                self.assertEqual(errors, [])

    def test_tab_bar_is_not_see_through_on_glass(self):
        page, _ = self.page()
        page.evaluate('()=>{Store.d.settings.material="glass";Store.d.settings.solid=false;Store.save();__gym.render()}')
        alpha = page.locator('#tabbar').evaluate('(e)=>{const m=getComputedStyle(e).backgroundColor.match(/rgba?\\(([^)]+)\\)/)[1].split(",");return m.length>3?+m[3]:1}')
        self.assertGreaterEqual(alpha, 0.94)

if __name__ == '__main__':
    unittest.main()
