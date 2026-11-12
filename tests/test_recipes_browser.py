"""2.56: recipe servings scale the ingredients, logging uses the eaten servings, search/sort, and shared ratings.
The ratings backend is a local mock of the three Supabase functions; no real accounts or data."""
import json
import os
import time
import unittest
from urllib.parse import urlsplit
import test_responsive_polish as responsive

SHOTS = os.environ.get('REPPSY_SHOTS')
UID = '00000000-0000-4000-8000-0000000000aa'


class Recipes(unittest.TestCase):
    setUpClass = classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass = classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page = responsive.ResponsivePolish.page
    bounds = responsive.ResponsivePolish.bounds

    def ideas(self, p):
        p.locator('#tabbar [data-tab=food]').click(); p.locator('[data-a=food-view][data-v=ideas]').click(); p.locator('.recipe-card').first.wait_for()

    def test_servings_scale_ingredients_and_logging_uses_eaten_servings(self):
        p, errors = self.page(390, 844, 'hu')
        self.ideas(p)
        p.locator('[data-a=idea-open][data-id=clip-chicken-gnocchi]').click()
        ing = p.locator('#sheet .ing li')
        self.assertIn('650 g', ing.nth(1).inner_text())
        self.assertIn('4 adag', p.locator('.recipe-serv b').inner_text())
        p.locator('[data-a=recipe-serv][data-n="1"]').click(); p.locator('[data-a=recipe-serv][data-n="1"]').click()
        self.assertIn('6 adag', p.locator('.recipe-serv b').inner_text())
        self.assertIn('975 g', ing.nth(1).inner_text())                       # 650 g × 6/4
        self.assertIn('450 ml (2¼ doboz)', ing.nth(3).inner_text())
        self.assertIn('ízlés szerint', ing.nth(5).inner_text())
        self.assertIn('6 adagra', p.locator('.recipe-scaled').inner_text())
        self.assertIn('≈530', p.locator('.kpis').inner_text(), 'per-serving values do not change with the batch')
        if SHOTS: p.screenshot(path=os.path.join(SHOTS, 'recipe-scaled.png'))
        p.locator('[data-a=recipe-cook]').click()
        self.assertIn('975 g', p.locator('.cook-ingredients').inner_text(), 'cook mode uses the same amounts')
        p.locator('[data-a=sheet-close]').first.click() if p.locator('[data-a=sheet-close]').count() else None
        p.keyboard.press('Escape')
        p.locator('[data-a=idea-open][data-id=eggs-ham-toast]').click()
        self.assertIn('tojás (3 db)', p.locator('#sheet .ing li').first.inner_text())
        p.locator('[data-a=recipe-serv][data-n="1"]').click()
        self.assertIn('tojás (6 db)', p.locator('#sheet .ing li').first.inner_text(), 'counts in names follow too')
        p.locator('[data-a=recipe-qty][data-n="0.5"]').click()
        self.assertEqual(p.locator('.recipe-portions>b').inner_text(), '1,5')
        kcal = p.evaluate("RECIPES.items.find(r=>r.id==='eggs-ham-toast').kcal")
        self.assertIn(f'{round(kcal * 1.5)} kcal', p.locator('[data-a=idea-add]').inner_text())
        self.bounds(p, 'recipe sheet')
        p.locator('[data-a=idea-add]').click()
        f = p.evaluate('Store.d.food[Object.keys(Store.d.food)[0]].at(-1)')
        self.assertEqual((f['kcal'], f['servings']), (round(kcal * 1.5), 1.5)); self.assertTrue(f['name'].endswith('× 1,5'))
        self.assertEqual(errors, [])

    def test_search_and_sort(self):
        p, errors = self.page(390, 844, 'hu')
        self.ideas(p)
        p.locator('[data-in=recipe-q]').fill('gnocchi')
        self.assertEqual(p.locator('.recipe-card').count(), 1)
        self.assertEqual(p.locator('.recipe-bar .recipe-count').inner_text(), '1 recept')
        self.assertTrue(p.evaluate("document.activeElement.dataset.in==='recipe-q'"), 'typing keeps the focus')
        p.locator('[data-in=recipe-q]').fill('csirke rizs')                      # several words, ingredients count
        ids = p.locator('.recipe-card').evaluate_all('(xs)=>xs.map(x=>x.dataset.id)')
        self.assertIn('chicken-rice-broccoli', ids)
        p.locator('[data-in=recipe-q]').fill('nincs ilyen étel')
        self.assertEqual(p.locator('.recipe-card').count(), 0); p.locator('[data-a=recipe-clear]').click()
        self.assertEqual(p.locator('.recipe-card').count(), p.evaluate('RECIPES.items.length'))
        p.locator('[data-in=recipe-sort]').select_option('protein')
        prot = p.locator('.recipe-card').evaluate_all("(xs)=>xs.map(x=>RECIPES.items.find(r=>r.id===x.dataset.id).p)")
        self.assertEqual(prot, sorted(prot, reverse=True))
        p.locator('[data-in=recipe-sort]').select_option('quick')
        mins = p.locator('.recipe-card').evaluate_all("(xs)=>xs.map(x=>RECIPES.items.find(r=>r.id===x.dataset.id).min)")
        self.assertEqual(mins, sorted(mins))
        top = p.locator('.recipe-card').first.bounding_box()['y']
        self.assertLess(top, 844, 'the first recipes are visible without scrolling far')
        if SHOTS: p.screenshot(path=os.path.join(SHOTS, 'recipes-list.png'))
        self.bounds(p, 'recipe list'); self.assertEqual(errors, [])

    def rated_page(self, signed_in=True, backend=True):
        ratings = {'protein-oats': {UID: 5}, 'chicken-rice-broccoli': {'x1': 4, 'x2': 5, 'x3': 4}}
        calls = []
        ctx = self.browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', reduced_motion='reduce'); self.addCleanup(ctx.close)
        base = f'http://127.0.0.1:{self.server.server_port}'
        ctx.route('**/js/config.js', lambda r: r.fulfill(content_type='application/javascript', body='window.CLOUD=' + json.dumps({'url': 'https://fixture-recipes.supabase.co', 'key': 'fixture-publishable-key-no-secrets'}) + ';'))
        def summary():
            return {k: {'avg': round(sum(v.values()) / len(v), 2), 'n': len(v)} for k, v in ratings.items() if v}
        def api(route):
            path = urlsplit(route.request.url).path; name = path.rsplit('/', 1)[-1]; auth = route.request.headers.get('authorization', '')
            calls.append((name, auth))
            if name.startswith('recipe_') and not backend:
                return route.fulfill(status=404, content_type='application/json', body=json.dumps({'code': 'PGRST202', 'message': 'not found'}), headers={'access-control-allow-origin': '*'})
            if name == 'recipe_rating_summary': body = summary()
            elif name == 'recipe_rating_mine': body = {k: v[UID] for k, v in ratings.items() if UID in v}
            elif name == 'recipe_rate':
                data = route.request.post_data_json; rid, stars = data['p_recipe'], data['p_stars']
                if stars: ratings.setdefault(rid, {})[UID] = stars
                else: ratings.get(rid, {}).pop(UID, None)
                s = summary().get(rid, {'avg': 0, 'n': 0}); body = {'recipe': rid, **s, 'mine': stars}
            elif '/rest/v1/' in path: body = [{'updated_at': '2026-11-12T00:00:00Z'}] if route.request.method == 'POST' else []
            else: body = {}
            route.fulfill(status=200, content_type='application/json', body=json.dumps(body), headers={'access-control-allow-origin': '*', 'access-control-allow-headers': 'apikey, authorization, content-type, prefer', 'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS'})
        ctx.route('https://fixture-recipes.supabase.co/**', api)
        p = ctx.new_page(); errors = []; p.on('pageerror', lambda e: errors.append(str(e)))
        p.goto(base + '/')
        if signed_in:
            p.evaluate('(s)=>localStorage.setItem("gymapp.v1.session",JSON.stringify(s))', {'access_token': 'fixture-token', 'refresh_token': 'r', 'expires_at': int(time.time()) + 3600, 'user': {'id': UID, 'email': 'fixture@example.test'}})
            p.reload()
        p.wait_for_function('()=>!!window.__gym')
        p.evaluate("()=>{Store.d.settings.lang='hu';Store.d.settings.calm=true;Store.save();__gym.render()}")
        return p, errors, calls, ratings

    def test_ratings_are_shared_and_editable(self):
        p, errors, calls, ratings = self.rated_page()
        self.ideas(p)
        card = p.locator('.recipe-card[data-id=chicken-rice-broccoli]')
        card.locator('.rating').wait_for()
        self.assertIn('4,3', card.inner_text()); self.assertIn('(3)', card.inner_text())
        p.locator('[data-in=recipe-sort]').select_option('top')
        self.assertEqual(p.locator('.recipe-card').first.get_attribute('data-id'), 'chicken-rice-broccoli', 'three votes beat a single 5-star vote')
        card.click()
        box = p.locator('#recipe-rate'); box.wait_for()
        self.assertIn('3 értékelés', box.inner_text())
        p.locator('[data-a=recipe-rate][data-v="2"]').click()
        p.wait_for_function("()=>document.querySelector('#recipe-rate')?.innerText.includes('A te értékelésed: 2/5')")
        self.assertEqual(ratings['chicken-rice-broccoli'][UID], 2)
        self.assertIn('3,8', p.locator('#recipe-rate .rating').inner_text()); self.assertIn('4 értékelés', p.locator('#recipe-rate').inner_text())
        self.assertEqual(p.locator('#recipe-rate [aria-checked=true]').get_attribute('data-v'), '2')
        if SHOTS: p.screenshot(path=os.path.join(SHOTS, 'recipe-rating.png'), full_page=False)
        p.locator('[data-a=recipe-rate][data-v="0"]').click()
        p.wait_for_function("()=>!document.querySelector('#recipe-rate [aria-checked=true]')")
        self.assertNotIn(UID, ratings['chicken-rice-broccoli'])
        self.assertTrue(all(a == 'Bearer fixture-token' for n, a in calls if n in ('recipe_rate', 'recipe_rating_mine')))
        self.assertEqual(errors, [])

    def test_without_the_ratings_backend_nothing_is_shown(self):
        p, errors, calls, ratings = self.rated_page(backend=False)
        self.ideas(p)
        p.wait_for_function("()=>RecipeRatings.state.error!==''")
        self.assertEqual(p.locator('.recipe-card .rating').count(), 0)
        p.locator('[data-a=idea-open][data-id=protein-oats]').click()
        self.assertEqual(p.locator('#recipe-rate').count(), 0, 'no rating box until the server supports it')
        self.assertEqual([n for n, a in calls if n.startswith('recipe_')], ['recipe_rating_summary'])
        self.assertEqual(errors, [])


if __name__ == '__main__':
    unittest.main()
