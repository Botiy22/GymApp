from workout_navigation import select_workout
import unittest
import test_responsive_polish as responsive
class LibraryExpansion(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    def test_new_exercises_search_sketches_and_translations(self):
        for lang in ['en','hu']:
            p,errors=self.page(390,844,lang)
            ids=p.evaluate("Object.keys(ROUTINE_ART).filter(id=>ROUTINE_ART[id].thumb.startsWith('img/library/'))")
            self.assertGreaterEqual(len(ids),6)
            select_workout(p,'exercises')
            for id in ids:
                name=p.evaluate('(id)=>'+('EX_HU[id][0]' if lang=='hu' else 'EXERCISES.find(e=>e.id===id).n'),id)
                p.locator('[data-in=lib-q]').fill(name)
                card=p.locator('[data-a=ex-open][data-id="'+id+'"]');card.wait_for();card.click()
                p.wait_for_function('()=>[...document.querySelectorAll("#sheet .drawing-phase img")].length===2&&[...document.querySelectorAll("#sheet .drawing-phase img")].every(i=>i.complete&&i.naturalWidth>0)')
                self.bounds(p,name)
                p.locator('[data-a=sheet-close]').click();p.wait_for_function('()=>!document.querySelector("#sheet").open&&!document.querySelector("#view").inert')
            self.assertEqual(errors,[])
    def test_recipe_copy_is_user_facing(self):
        for lang in ['hu','en']:
            p,errors=self.page(320,844,lang)
            p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-view][data-v=ideas]').click()
            self.assertEqual(p.locator('.recipe-source-clips').count(),0)
            for id in ['clip-protein-banana-muffins','clip-pizza-meat-roll','clip-blueberry-pancakes','clip-juice-carrot-orange']:
                p.locator('[data-a=idea-open][data-id="'+id+'"]').click()
                text=p.locator('#sheet').inner_text().lower()
                for word in ['screenshot','supplied clip','beküldött','képernyőkép','source:','forrás:']:
                    self.assertNotIn(word,text)
                self.bounds(p,id);p.locator('[data-a=sheet-close]').click();p.wait_for_function('()=>!document.querySelector("#sheet").open&&!document.querySelector("#view").inert')
            self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
