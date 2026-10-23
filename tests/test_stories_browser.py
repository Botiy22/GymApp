"""2.28 stories, photo posts, highlights and likes in a real browser against an in-memory backend (tests/stories_fixture.py)."""
import tempfile
import unittest
from pathlib import Path
from PIL import Image
import test_responsive_polish as responsive
from stories_fixture import Backend, FRIEND, STRANGER

class StoriesBrowser(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    bounds = responsive.ResponsivePolish.bounds

    def open(self, width=390, lang='en', calm=True, seed=True):
        backend = Backend()
        if seed: backend.seed()
        context = self.browser.new_context(viewport={'width': width, 'height': 844}, service_workers='block', reduced_motion='reduce' if calm else 'no-preference')
        self.addCleanup(context.close)
        context.route('**/js/config.js', lambda r: r.fulfill(body="window.CLOUD={url:'https://fixture.supabase.co',key:'fixture-public-key-long-enough'}", content_type='application/javascript'))
        context.add_init_script("localStorage.setItem('gymapp.v1.session',JSON.stringify({access_token:'fixture-token',refresh_token:'r',expires_at:4000000000,user:{id:'owner-fixture',email:'owner@example.test'}}))")
        context.route('https://fixture.supabase.co/**', backend.route)
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{self.server.server_port}/'); page.wait_for_function('()=>!!window.__gym')
        page.evaluate('([l,c])=>{Store.d.settings.lang=l;Store.d.settings.calm=c;Store.save();__gym.A["profile-home"]()}', [lang, calm])
        page.wait_for_function('()=>!!Social.state.data')
        return page, backend, errors

    def friends(self, page):
        page.locator('[data-a=profile-view][data-v=friends]').click()
        page.wait_for_function('()=>Stories.state.posts!==null&&document.querySelectorAll(".post-card:not(.ghost)").length>0')

    def photo(self, color=(30, 140, 180), size=(3000, 4000)):
        path = Path(tempfile.mkdtemp()) / 'photo.jpg'; Image.new('RGB', size, color).save(path, quality=92); return str(path)

    def test_tray_feed_and_visibility(self):
        page, backend, errors = self.open()
        self.friends(page)
        names = page.locator('.story-tray .story-name').all_inner_texts()
        self.assertEqual(names, ['Your story', 'Anna', 'Csaba'])                       # own first, then friends, then everyone else
        self.assertEqual(page.locator('.story-bubble.has:not(.seen)').count(), 2)
        captions = page.locator('.post-card .post-caption').all_inner_texts()
        self.assertEqual(len(captions), 2); self.assertNotIn('Friends only', ' '.join(captions))  # a stranger's friends-only post stays hidden
        # Full-size pictures load as the cards come into view; the first is in view, the second only after scrolling.
        full = '()=>[...document.querySelectorAll(".post-card img")].filter(i=>!i.dataset.full&&i.src.length>4000).length'
        page.wait_for_function(full + '>=1')
        self.assertEqual(len([n for n, b in backend.calls if n == 'social_media']), 1)
        page.evaluate('()=>document.querySelectorAll(".post-card")[1].scrollIntoView()')
        page.wait_for_function(full + '===2')
        self.bounds(page, 'friends feed'); self.assertEqual(errors, [])

    def test_viewer_steps_marks_seen_likes_and_closes(self):
        page, backend, errors = self.open()
        self.friends(page)
        page.locator('.story-bubble.has .story-ring').first.click()
        viewer = page.locator('#story-viewer'); page.wait_for_function('()=>document.querySelector("#story-viewer .sv-img.in")')
        self.assertEqual(viewer.locator('.sv-person b').inner_text(), 'Anna'); self.assertEqual(viewer.locator('.sv-bars span').count(), 2)
        self.assertEqual(viewer.locator('.sv-caption').inner_text(), 'Chest day')
        viewer.locator('[data-sv-like]').click(); page.wait_for_function('()=>Stories.find(document.querySelector("#story-viewer [data-sv-like]").dataset.id).liked')
        self.assertEqual(viewer.locator('[data-sv-like]').get_attribute('aria-pressed'), 'true')
        self.assertEqual([b['p_like'] for n, b in backend.calls if n == 'social_post_like'], [True])
        viewer.locator('.sv-next').click(); self.assertEqual(viewer.locator('.sv-person b').inner_text(), 'Anna')
        self.assertEqual(viewer.locator('.sv-bars i').first.evaluate('e=>e.style.transform'), 'scaleX(1)')
        viewer.locator('.sv-next').click(); self.assertEqual(viewer.locator('.sv-person b').inner_text(), 'Csaba')   # next person
        viewer.locator('.sv-prev').click(); self.assertEqual(viewer.locator('.sv-person b').inner_text(), 'Anna')
        page.keyboard.press('Escape'); page.wait_for_function('()=>!document.querySelector("#story-viewer").open')
        self.assertFalse(page.locator('#view').evaluate('e=>e.inert'))
        self.assertEqual(page.locator('.story-bubble.has.seen').count(), 2)
        # The story plays on its own: with the clock running the viewer reaches the end and closes.
        page.locator('.story-bubble.has .story-ring').nth(1).click(); page.wait_for_function('()=>document.querySelector("#story-viewer .sv-img.in")')
        page.wait_for_function('()=>!document.querySelector("#story-viewer").open', timeout=12000)
        self.assertEqual(errors, [])

    def test_compose_story_default_duration_audience_and_post(self):
        page, backend, errors = self.open()
        self.friends(page)
        page.locator('.story-bubble.own .story-add').click()
        self.assertEqual(page.locator('#sheet-title').inner_text(), 'New story')
        self.assertTrue(page.locator('#sheet [data-a=compose-share]').is_disabled())
        self.assertEqual(page.locator('.duration-chips .chip.on').inner_text(), '24 h')        # a day unless chosen otherwise
        page.locator('[data-in=compose-file]').set_input_files(self.photo())
        page.wait_for_function('()=>__gym.ui.compose&&__gym.ui.compose.image')
        page.locator('[data-in=compose-caption]').fill('Chest day')
        page.locator('[data-a=compose-audience][data-v=me]').click()
        self.assertIn('only you', page.locator('.audience-hint').inner_text())
        page.locator('[data-a=compose-share]').click(); page.wait_for_function('()=>!document.querySelector("#sheet").open')
        made = [b for n, b in backend.calls if n == 'social_post_create'][-1]
        self.assertEqual((made['p_kind'], made['p_hours'], made['p_audience'], made['p_caption']), ('story', 24, 'me', 'Chest day'))
        self.assertLessEqual(len(made['p_image']), 400000); self.assertLessEqual(len(made['p_thumb']), 38000)
        self.assertTrue(made['p_image'].startswith('data:image/jpeg;base64,'))
        page.wait_for_function('()=>document.querySelector(".story-bubble.own.has")')
        # A post never has a duration, and a chosen duration is sent for stories.
        page.locator('.feed-head [data-a=compose]').click()
        self.assertEqual(page.locator('.duration-chips').count(), 0)
        page.locator('[data-a=compose-kind][data-v=story]').click(); page.locator('[data-a=compose-hours][data-v="6"]').click()
        page.locator('[data-in=compose-file]').set_input_files(self.photo((200, 60, 60), (800, 600)))
        page.wait_for_function('()=>__gym.ui.compose&&__gym.ui.compose.image')
        page.locator('[data-a=compose-share]').click(); page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual([b['p_hours'] for n, b in backend.calls if n == 'social_post_create'][-1], 6)
        page.locator('.feed-head [data-a=compose]').click()
        page.locator('[data-in=compose-file]').set_input_files(self.photo((20, 200, 90)))
        page.wait_for_function('()=>__gym.ui.compose&&__gym.ui.compose.image')
        page.locator('[data-a=compose-share]').click(); page.wait_for_function('()=>document.querySelectorAll(".post-card:not(.ghost)").length===3')
        made = [b for n, b in backend.calls if n == 'social_post_create'][-1]
        self.assertEqual((made['p_kind'], made['p_hours']), ('post', None))
        self.assertEqual(errors, [])

    def test_feed_like_button_toggles_and_double_tap_likes_once(self):
        page, backend, errors = self.open()
        self.friends(page)
        like = page.locator('.post-card [data-a=post-like]').first
        like.click(); page.wait_for_function('()=>document.querySelector(".post-card [data-a=post-like]").getAttribute("aria-pressed")==="true"&&!Object.keys(__gym.ui.likeBusy||{}).length')
        self.assertEqual(like.locator('.like-count').inner_text(), '1')
        like.click(); page.wait_for_function('()=>document.querySelector(".post-card [data-a=post-like]").getAttribute("aria-pressed")==="false"&&!Object.keys(__gym.ui.likeBusy||{}).length')
        self.assertEqual(like.locator('.like-count').inner_text(), '')
        page.locator('.post-card .post-media').first.dblclick(); page.wait_for_function('()=>!Object.keys(__gym.ui.likeBusy||{}).length')
        page.locator('.post-card .post-media').first.dblclick(); page.wait_for_timeout(100)
        self.assertEqual([b['p_like'] for n, b in backend.calls if n == 'social_post_like'], [True, False, True])
        # A refused like goes back to the earlier state.
        page.route('https://fixture.supabase.co/rest/v1/rpc/social_post_like', lambda r: r.fulfill(status=400, json={'message': 'post_not_found'}))
        second = page.locator('.post-card [data-a=post-like]').nth(1); second.click()
        page.wait_for_function('()=>!Object.keys(__gym.ui.likeBusy||{}).length'); page.wait_for_timeout(450)
        self.assertEqual(second.get_attribute('aria-pressed'), 'false'); self.assertEqual(second.locator('.like-count').inner_text(), '')
        self.assertEqual(errors, [])

    def test_like_animation_runs_with_motion_and_not_with_calm(self):
        page, backend, errors = self.open(calm=False)
        self.friends(page)
        like = page.locator('.post-card [data-a=post-like]').first; like.click()
        self.assertTrue(like.evaluate('b=>b.classList.contains("pop")'))
        self.assertEqual(like.locator('.like-icon svg').evaluate('e=>getComputedStyle(e).animationName'), 'heart-pop')
        page.locator('.story-bubble.has .story-ring').first.click()
        self.assertTrue(page.locator('#story-viewer .sv-card').evaluate('e=>e.classList.contains("sv-opening")'))
        page.keyboard.press('Escape'); page.wait_for_function('()=>!document.querySelector("#story-viewer").open')
        calm, _, calm_errors = self.open(calm=True)
        self.friends(calm)
        btn = calm.locator('.post-card [data-a=post-like]').first; btn.click()
        self.assertFalse(btn.evaluate('b=>b.classList.contains("pop")'))
        calm.locator('.story-bubble.has .story-ring').first.click()
        self.assertFalse(calm.locator('#story-viewer .sv-card').evaluate('e=>e.classList.contains("sv-opening")'))
        self.assertEqual(errors + calm_errors, [])

    def test_highlights_profile_grid_and_post_management(self):
        page, backend, errors = self.open(seed=False)
        backend.add('owner-fixture', 'story', (220, 80, 60), 'Bench 100', age_hours=40, hours=24)      # already expired, still in the archive
        backend.add('owner-fixture', 'post', (40, 120, 200), 'Progress', age_hours=2)
        page.wait_for_function('()=>document.querySelector(".media-block .post-tile:not(.ghost)")')
        self.assertIn('1', page.locator('.posts-head small').inner_text())
        page.locator('[data-a=highlight-new]').click(); page.wait_for_function('()=>document.querySelector("[data-a=hl-pick]")')
        self.assertTrue(page.locator('#sheet button[form=highlight-form]').is_disabled())
        page.locator('[data-in=hl-name]').fill('Chest day'); page.locator('[data-a=hl-pick]').click()
        self.assertEqual(page.locator('.pick-mark').inner_text(), '1')
        page.locator('#sheet button[form=highlight-form]').click(); page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.locator('.story-bubble.hl:not(.new) .story-name').all_inner_texts(), ['Chest day'])
        page.locator('.story-bubble.hl:not(.new) .story-ring').click(); page.wait_for_function('()=>document.querySelector("#story-viewer .sv-img.in")')
        self.assertIn('Chest day', page.locator('#story-viewer .sv-person small').inner_text())
        page.locator('#story-viewer .sv-more').click(); page.locator('#story-viewer [data-sv=edithighlight]').click()
        page.wait_for_function('()=>document.querySelector("#sheet").open&&__gym.ui.hl&&__gym.ui.hl.id')
        page.locator('[data-in=hl-name]').fill('Push day'); page.locator('#sheet button[form=highlight-form]').click()
        page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.locator('.story-bubble.hl:not(.new) .story-name').all_inner_texts(), ['Push day'])
        # Post sheet: edit the caption and who can see it, then delete with a second tap.
        page.locator('.post-tile').first.click(); page.locator('#sheet .post-edit summary').click()
        page.locator('[data-in=post-caption]').fill('Week 4'); page.locator('[data-a=post-audience][data-v=friends]').click()
        page.locator('[data-a=post-save]').click(); page.wait_for_function('()=>!__gym.ui.postBusy&&Stories.find(__gym.ui.postId).caption==="Week 4"')
        self.assertEqual([b['p_audience'] for n, b in backend.calls if n == 'social_post_update'], ['friends'])
        page.locator('[data-a=post-delete]').click(); self.assertEqual(len([1 for n, b in backend.calls if n == 'social_post_delete']), 0)
        page.locator('[data-a=post-delete]').click(); page.wait_for_function('()=>!document.querySelector("#sheet").open')
        self.assertEqual(page.locator('.post-tile').count(), 0); self.assertEqual(page.locator('.posts-empty').count(), 1)
        self.assertEqual(errors, [])

    def test_stranger_profile_from_feed_and_small_screens(self):
        for lang in ['hu', 'en']:
            with self.subTest(lang=lang):
                page, backend, errors = self.open(320, lang)
                self.friends(page)
                self.bounds(page, f'friends {lang}')
                page.locator(f'.post-card [data-a=user-open][data-id={STRANGER}]').click()
                page.wait_for_function('()=>document.querySelector("#sheet .media-block .post-tile:not(.ghost)")')
                self.assertEqual(page.locator('#sheet .post-tile:not(.ghost)').count(), 1)          # the friends-only post is not shown
                self.assertEqual(page.locator('#sheet [data-a=friend-profile]').count(), 0)
                self.bounds(page, f'stranger {lang}')
                page.locator('#sheet [data-a=story-user]').click(); page.wait_for_function('()=>document.querySelector("#story-viewer").open')
                self.assertEqual(page.locator('#story-viewer .sv-more').is_hidden(), True)   # no owner menu on someone else's story
                over = page.evaluate('()=>[...document.querySelectorAll("#story-viewer .sv-head *,#story-viewer .sv-foot *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length')
                self.assertEqual(over, 0)
                page.locator('#story-viewer .sv-close').click(); page.wait_for_function('()=>!document.querySelector("#story-viewer").open')
                self.assertEqual(errors, [])

    def test_missing_migration_says_what_to_run(self):
        page, backend, errors = self.open()
        page.route('https://fixture.supabase.co/rest/v1/rpc/social_story_feed', lambda r: r.fulfill(status=404, json={'code': 'PGRST202', 'message': 'Could not find the function'}))
        page.evaluate('()=>{Stories.reset()}'); self.friends_without_posts(page)
        self.assertIn('20261018_stories_posts.sql', page.locator('.story-error').inner_text())
        self.assertEqual(errors, [])

    def friends_without_posts(self, page):
        page.locator('[data-a=profile-view][data-v=friends]').click()
        page.wait_for_function('()=>!!Stories.state.error')

if __name__ == '__main__':
    unittest.main()
