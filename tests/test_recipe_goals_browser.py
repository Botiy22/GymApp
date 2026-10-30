from choice_navigation import choose
"""Goal chips, bilingual phone layout, real images, recipe portions and offline release."""
import unittest
import test_responsive_polish as responsive

class RecipeGoalsBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def recipes(self,page):
        page.locator('#tabbar [data-tab=food]').click()
        choose(page,'[data-a=food-view][data-v=ideas]')

    def test_filters_combine_and_sources_fit_small_phones(self):
        for width,lang,text in [(320,'hu',20),(390,'en',16)]:
            page,errors=self.page(width,844,lang,text)
            self.recipes(page)
            for goal in ['loss','maintain','bulk','muscle']:
                choose(page,f'[data-a=recipe-goal][data-goal={goal}]')
                self.assertEqual(page.locator(f'[data-goal={goal}]').get_attribute('aria-pressed'),'true')
                actual=page.locator('.recipe-card').evaluate_all('(xs)=>xs.map(x=>x.dataset.id)')
                expected=page.evaluate('(g)=>RECIPES.items.filter(r=>RecipeGoals.matches(r,g)).map(r=>r.id)',goal)
                self.assertEqual(actual,expected)
                self.bounds(page,f'{lang}/{goal}')
            choose(page,'[data-a=recipe-goal][data-goal=loss]')
            choose(page,'[data-a=idea-cat][data-c=breakfast]')
            self.assertEqual(page.locator('.recipe-card').count(),page.evaluate("RECIPES.items.filter(r=>r.cat==='breakfast'&&RecipeGoals.matches(r,'loss')).length"))
            geometry=page.locator('.recipe-card').evaluate_all('(xs)=>xs.slice(0,2).map(x=>{const r=x.getBoundingClientRect();return {y:r.y,h:r.height,w:r.width}})')
            self.assertEqual(geometry[0],geometry[1])
            page.screenshot(path=f'/tmp/recipe-goals-{lang}.png')
            page.locator('[data-a=recipe-goal-info]').click()
            self.assertEqual(page.locator('.recipe-goal-rule').count(),4)
            page.locator('.recipe-evidence summary').click()
            self.assertEqual(page.locator('.recipe-evidence a').count(),7)
            self.bounds(page,'goal evidence '+lang)
            self.assertEqual(errors,[])

    def test_new_photos_builder_and_scaled_chicken_diary(self):
        page,errors=self.page(390,844,'en')
        self.recipes(page)
        ids=page.evaluate('RECIPES.items.filter(r=>r.leanProtein).map(r=>r.id)')
        loaded=page.evaluate('''async(ids)=>Promise.all(ids.map(async id=>{const i=new Image();i.src='img/recipes/'+id+'.webp';await i.decode();return [i.naturalWidth,i.naturalHeight]}))''',ids)
        self.assertEqual(loaded,[[1448,1086]]*10)
        page.locator('[data-a=idea-open][data-id=oats-lean-blueberry]').click()
        page.locator('#sheet [data-a=oats-open]').click()
        self.assertEqual(int(page.locator('#oats-sum .oats-total div b').first.inner_text()),385)
        page.locator('#sheet [data-a=oats-add]').click()
        food=page.evaluate('Object.values(Store.d.food).flat()[0]')
        self.assertEqual([food['kcal'],food['p'],len(food['items'])],[385,37.6,5])
        choose(page,'[data-a=food-view][data-v=ideas]')
        page.locator('[data-a=idea-open][data-id=grilled-chicken-bulgur]').click()
        page.locator('#sheet [data-a=recipe-qty][data-n="0.5"]').click()
        self.assertEqual(page.locator('.recipe-portions b').inner_text(),'1.5')
        self.bounds(page,'scaled chicken')
        page.locator('#sheet [data-a=idea-add]').click()
        food=page.evaluate('Object.values(Store.d.food).flat().find(r=>r.name.includes("Lemon grilled"))')
        self.assertEqual([food['kcal'],food['p'],food['f']],[647,85.5,12.3])
        page.reload();page.wait_for_function('()=>!!window.__gym')
        self.assertEqual(len(page.evaluate('Object.values(Store.d.food).flat()')),2)
        self.assertEqual(errors,[])

    def test_new_recipes_and_images_work_offline(self):
        context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow')
        self.addCleanup(context.close)
        context.add_init_script("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})")
        page=context.new_page();page.goto(f'http://127.0.0.1:{self.server.server_port}/')
        page.wait_for_function('()=>!!window.__gym')
        page.evaluate('()=>navigator.serviceWorker.register("sw.js")')
        page.wait_for_function('()=>navigator.serviceWorker.controller!==null',timeout=120000)
        context.set_offline(True);page.reload();page.wait_for_function('()=>!!window.__gym')
        self.recipes(page)
        choose(page,'[data-a=recipe-goal][data-goal=loss]')
        self.assertEqual(page.locator('[data-a=idea-open][data-id^=grilled-chicken-]').count(),5)
        result=page.evaluate('''async()=>Promise.all(RECIPES.items.filter(r=>r.leanProtein).map(async r=>{const i=new Image();i.src='img/recipes/'+r.id+'.webp';await i.decode();return i.naturalWidth}))''')
        self.assertEqual(result,[1448]*10)

if __name__=='__main__':unittest.main()
