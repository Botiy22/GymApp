"""Walk all main/inner pages, important sheets and registration in EN and HU."""
import unittest
import test_responsive_polish as responsive
import test_profile_sharing as sharing

class TranslationsBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    auth_page=sharing.ProfileSharing.auth_page

    def track(self,page):
        page.evaluate('''()=>{window.translationMissing=[];for(const lang of ['en','hu']){I18N[lang]=new Proxy(I18N[lang],{get(target,key){if(typeof key==='string'&&key&&!(key in target))translationMissing.push(lang+':'+key);return target[key];}});}}''')

    def test_all_pages_subpages_forms_and_labels_switch_language(self):
        for lang in ['en','hu']:
            page,errors=self.page(390,844,lang);self.track(page)
            page.evaluate('()=>{Store.d.plan={name:"Fixture",days:Array.from({length:7},()=>({meals:[]})),notes:[],train:[]};__gym.render()}')
            for tab in ['home','food','goals','settings','profile']:
                page.evaluate('(tab)=>{__gym.ui.tab=tab;__gym.render()}',tab)
                self.assertEqual(page.locator('html').get_attribute('lang'),lang)
                if tab=='home':
                    for inner in ['plans','exercises','stability','history','ride','train']:
                        page.evaluate('(v)=>__gym.A["workout-view"]({dataset:{v}})',inner)
                    page.evaluate('()=>__gym.A["ex-open"]({dataset:{id:EXERCISES[0].id}})');page.evaluate('__gym.A["sheet-close"]()')
                    for action in ['routine-library','cardio-add']:
                        page.evaluate('(a)=>__gym.A[a]({dataset:{}})',action);page.evaluate('__gym.A["sheet-close"]()')
                if tab=='food':
                    for inner in ['diary','ideas','plan']:
                        page.evaluate('(v)=>__gym.A["food-view"]?.({dataset:{v}})',inner)
                    page.evaluate('()=>__gym.A["idea-open"]({dataset:{id:RECIPES.items[0].id}})');page.evaluate('__gym.A["sheet-close"]()')
                    for action in ['food-manual','targets']:
                        page.evaluate('(a)=>__gym.A[a]({dataset:{}})',action);page.evaluate('__gym.A["sheet-close"]()')
                if tab=='goals':
                    for inner in ['habits','progress','planner']:
                        page.evaluate('(v)=>__gym.A["goals-view"]({dataset:{v}})',inner)
                        if inner=='habits':page.evaluate('__gym.A["habit-new"]()');page.evaluate('__gym.A["sheet-close"]()')
                        if inner=='progress':
                            for sub in ['history','overview']:page.evaluate('(v)=>__gym.A.prog({dataset:{v}})',sub)
                    for action in ['planner-new','planner-calendar']:
                        page.evaluate('(a)=>__gym.A[a]({dataset:{}})',action);page.evaluate('__gym.A["sheet-close"]()')
                if tab=='settings':
                    for action in ['install-help','acc-help','release-notes']:
                        page.evaluate('(a)=>__gym.A[a]({dataset:{}})',action);page.evaluate('__gym.A["sheet-close"]()')
                if tab=='profile':
                    for inner in ['ranks','friends','overview']:
                        page.evaluate('(v)=>__gym.A["profile-view"]({dataset:{v}})',inner)
                    for action in ['profile-edit','profile-badges','manage-sharing']:
                        page.evaluate('(a)=>__gym.A[a]({dataset:{}})',action);page.evaluate('__gym.A["sheet-close"]()')
                self.assertNotIn('undefined',page.locator('#view').inner_text())
            self.assertEqual(page.evaluate('[...new Set(translationMissing)]'),[]);self.assertEqual(errors,[])
            page.locator('#tabbar [data-tab=settings]').click()
            other='hu' if lang=='en' else 'en';page.evaluate('(v)=>__gym.A["gate-lang"]({dataset:{v}})',other)
            self.assertEqual(page.locator('html').get_attribute('lang'),other)
            self.assertEqual(page.locator('#tabbar [data-tab=goals]').inner_text(),'Napirend' if other=='hu' else 'Routine')

    def test_registration_setup_and_recovery_in_both_languages(self):
        for lang in ['en','hu']:
            page,calls,errors=self.auth_page(signed=False);self.track(page)
            page.evaluate('(v)=>__gym.A["gate-lang"]({dataset:{v}})',lang)
            page.evaluate('__gym.A["gate-mode"]({dataset:{v:"up"}})')
            for step in range(4):
                page.evaluate('(step)=>{__gym.ui.gate.setup.step=step;__gym.A["gate-lang"]({dataset:{v:Store.d.settings.lang}})}',step)
                self.assertEqual(page.locator('html').get_attribute('lang'),lang)
            for mode in ['in','forgot','up']:
                page.evaluate('(v)=>__gym.A["gate-mode"]({dataset:{v}})',mode)
            self.assertEqual(page.evaluate('[...new Set(translationMissing)]'),[]);self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
