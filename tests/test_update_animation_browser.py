"""2.54: the update window animates real progress (local fixture release, no accounts or user data)."""
import hashlib
import json
import os
import unittest
import test_profile_theme_updates as updates
import test_responsive_polish as responsive

SHOTS = os.environ.get('REPPSY_SHOTS')
WATCH = """()=>{window.__upd=[];window.__swmsg=0;navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='update-progress')window.__swmsg++;});
  const tick=()=>{const d=document.querySelector('#app-update-progress');if(d){const a=d.querySelector('.upd-arc');__upd.push({p:parseFloat(a.getAttribute('stroke-dasharray')),m:d.querySelector('.upd-msg').textContent,
    on:[...d.querySelectorAll('.upd-steps i')].findIndex(i=>i.classList.contains('on')),ready:d.classList.contains('ready'),ver:d.querySelector('.upd-ver').textContent});}requestAnimationFrame(tick);};tick();}"""


class UpdateAnimation(unittest.TestCase):
    setUpClass = classmethod(updates.ProfileThemeUpdates.setUpClass.__func__)
    tearDownClass = classmethod(updates.ProfileThemeUpdates.tearDownClass.__func__)

    def publish_newer(self):
        old = (responsive.ROOT / 'js/release.js').read_bytes()
        manifest = json.loads((responsive.ROOT / 'release-manifest.json').read_text())
        cur_v, cur_b = manifest['version'], manifest['build']; nv = cur_v + '9'; nb = cur_b + '9'
        new = old.replace(f"const version = '{cur_v}'".encode(), f"const version = '{nv}'".encode()).replace(f"const build = '{cur_b}'".encode(), f"const build = '{nb}'".encode())
        manifest.update(version=nv, build=nb); manifest['assets']['js/release.js'] = hashlib.sha256(new).hexdigest()
        self.server.overrides = {'js/release.js': new, 'release-manifest.json': json.dumps(manifest).encode()}
        self.addCleanup(lambda: setattr(self.server, 'overrides', {}))
        return cur_v, nv

    def open_app(self, reduced='no-preference'):
        context = self.browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='allow', reduced_motion=reduced)
        self.addCleanup(context.close)
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        page = context.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/'); page.wait_for_function('()=>!!window.__gym')
        page.evaluate('async()=>{await navigator.serviceWorker.ready}'); page.wait_for_function('()=>!!navigator.serviceWorker.controller')
        page.evaluate('()=>{Store.d.settings.lang="hu";Store.save();__gym.render()}')
        page.evaluate('()=>__gym.checkForUpdate(true)')
        return page, errors

    def test_ring_follows_real_progress_through_every_step(self):
        page, errors = self.open_app()
        cur, nv = self.publish_newer()
        page.evaluate('()=>__gym.checkForUpdate(true)'); page.evaluate(WATCH)
        page.locator('#tabbar [data-tab=settings]').click(); page.locator('.update-app').click()
        page.locator('#app-update-progress').wait_for()
        page.wait_for_function("()=>/Letöltés|Telepítés/.test(document.querySelector('#app-update-progress .upd-msg')?.textContent||'')", timeout=30000)
        if SHOTS: page.screenshot(path=os.path.join(SHOTS, 'update-progress.png'))
        with page.expect_navigation(wait_until='domcontentloaded', timeout=45000):
            page.wait_for_function("()=>document.querySelector('#app-update-progress')?.classList.contains('ready')", timeout=40000)
            page.wait_for_timeout(700)
            log = page.evaluate('__upd'); swmsg = page.evaluate('__swmsg')
            if SHOTS: page.screenshot(path=os.path.join(SHOTS, 'update-ready.png'))
        values = [x['p'] for x in log]
        self.assertTrue(all(b >= a - 0.01 for a, b in zip(values, values[1:])), 'the ring never runs backwards')
        self.assertGreater(swmsg, 0, 'the new service worker reports verified files')
        msgs = {x['m'] for x in log}
        self.assertIn('Új verzió keresése…', msgs); self.assertIn('Telepítés…', msgs)
        self.assertTrue(any(m.startswith('Letöltés') for m in msgs), msgs)
        self.assertEqual(log[-1]['ver'], f'{cur} → {nv}')
        self.assertEqual(sorted({x['on'] for x in log if x['on'] >= 0}), [0, 1, 2], 'step dots move along')
        ready = [x for x in log if x['ready']]
        self.assertTrue(ready and ready[-1]['p'] > 99, 'the ring completes before the restart')
        self.assertTrue(max(x['p'] for x in log if not x['ready']) > 40, 'real progress, not just a spinner')
        page.wait_for_function('()=>window.__gym&&GYM_RELEASE.version==="' + nv + '"')
        self.assertEqual(errors, [])

    def test_reduced_motion_keeps_the_fill_without_motion(self):
        page, errors = self.open_app('reduce')
        page.evaluate('()=>{window.o=__gym.updateOverlay();o.stage("updateDownloading",1);o.progress(.5)}')
        page.wait_for_timeout(100)
        self.assertEqual(page.locator('.reload-mark img').evaluate('(e)=>getComputedStyle(e).animationName'), 'none')
        self.assertEqual(page.locator('.upd-halo').evaluate('(e)=>getComputedStyle(e).animationName'), 'none')
        fill = page.evaluate("parseFloat(document.querySelector('.upd-arc').getAttribute('stroke-dasharray'))")
        self.assertTrue(35 <= fill <= 60, fill)   # half of the download step (36%), creeping slowly inside the step
        self.assertEqual(page.locator('.upd-msg').inner_text(), 'Letöltés… 50%')
        page.evaluate('()=>o.message("updateRestarting")')
        self.assertEqual(page.locator('.upd-check').evaluate('(e)=>getComputedStyle(e).opacity'), '1')
        page.evaluate('()=>o.close()'); self.assertEqual(page.locator('#app-update-progress').count(), 0)
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
