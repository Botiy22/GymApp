"""Personal food memory through photo review, offline reuse, diary and cloud merge.
Nutrition/photo responses here are synthetic fixtures, not real product claims.
"""
import json
import unittest
import test_responsive_polish as responsive
from choice_navigation import choose

class FoodMemoryBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds

    def photo(self,p,model=False):
        reply={'items':[{'name':'Protein shake','src':'model' if model else 'label','basisUnit':'ml','millilitres':300,'grams':0,'kcal100':100,'protein100':10,'carbs100':10,'fat100':2}], 'confidence':'medium' if model else 'high'}
        p.route('https://api.anthropic.com/v1/messages',lambda r:r.fulfill(json={'content':[{'type':'text','text':json.dumps(reply)}]},headers={'access-control-allow-origin':'*'}))
        p.evaluate("Store.d.settings.apiKey='test-key';Store.d.settings.keyState='ok'")
        p.locator('#tabbar [data-tab=food]').click();p.locator('[data-a=food-ai][data-m=photo]').click()
        p.evaluate("__gym.ui.ai.imgs=[{url:'',b64:'test-fixture'}];__gym.A['ai-go']()")
        p.locator('[data-in=memory-name]').wait_for()

    def test_photo_review_reload_quick_portion_and_offline_text(self):
        p,errors=self.page(320,844,'hu',20)
        self.photo(p,model=True)
        p.locator('[data-in=memory-name]').fill('Reggeli shake')
        self.bounds(p,'photo memory review')
        p.locator('[data-a=ai-add]').click()
        mid=p.evaluate('Store.d.foodMemories[0].id')
        self.assertTrue(p.evaluate('Store.d.foodMemories[0].estimated'))
        self.assertEqual(p.evaluate('Store.d.foodMemories[0].items[0].p'),30)
        p.reload();p.wait_for_function('()=>!!window.__gym')
        p.locator('#tabbar [data-tab=food]').click()
        choose(p,'[data-in=memory-quick]',mid)
        p.locator('[data-in=memory-portion]').fill('2')
        self.assertIn('600 kcal',p.locator('#memory-nutrition').inner_text())
        self.assertIn('6 dl',p.locator('.memory-parts').inner_text())
        self.bounds(p,'saved portion')
        p.screenshot(path='/tmp/reppsy-food-memory.png')
        p.locator('[data-a=memory-add]').click()
        self.assertEqual(p.evaluate('FoodMemory.rank(Store.d)[0].count'),2)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().reduce((n,i)=>n+i.p,0)'),90)
        # An offline remembered alias never needs the model; keep rendering UI normally.
        calls=[];p.unroute('https://api.anthropic.com/v1/messages')
        p.route('https://api.anthropic.com/v1/messages',lambda r:(calls.append(r.request.url),r.abort()))
        p.context.set_offline(True)
        p.locator('[data-a=food-ai][data-m=text]').click()
        p.locator('[data-in=ai-text]').fill('fél adag reggeli shake');p.locator('[data-a=ai-go]').click()
        p.locator('.ai-item').wait_for()
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items[0].p'),15)
        self.assertTrue(p.evaluate('__gym.ui.ai.res.items[0].approx'))
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(p.evaluate('FoodMemory.rank(Store.d)[0].count'),3)
        # Ordinary food search also reuses the same personal portion.
        p.locator('[data-a=food-manual]').click()
        p.locator('[data-in=fs-q]').fill('Reggeli shake')
        p.locator('[data-a=fq-add]').click()
        self.assertEqual(p.evaluate('FoodMemory.rank(Store.d)[0].count'),4)
        self.assertEqual(calls,[]);self.assertEqual(errors,[])

    def test_opt_out_and_transaction_failure_keep_memory_consistent(self):
        p,errors=self.page()
        self.photo(p);p.locator('[data-in=memory-remember]').uncheck()
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(p.evaluate('Store.d.foodMemories.length'),0)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),1)
        self.photo(p)
        p.evaluate("()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}}")
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(p.evaluate('Store.d.foodMemories.length'),0)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),1)
        self.assertTrue(p.locator('#sheet').evaluate('(s)=>s.open'))
        p.evaluate('()=>{Storage.prototype.setItem=window.originalSetItem}')
        p.locator('[data-a=ai-add]').click()
        self.assertEqual(p.evaluate('Store.d.foodMemories.length'),1)
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),2)
        self.assertEqual(errors,[])

    def test_alias_edit_ambiguity_and_forget_preserve_diary(self):
        p,errors=self.page()
        self.photo(p);p.locator('[data-in=memory-name]').fill('Morning shake');p.locator('[data-a=ai-add]').click()
        mid=p.evaluate('Store.d.foodMemories[0].id')
        choose(p,'[data-in=memory-quick]',mid);p.locator('[data-a=memory-edit]').click()
        p.locator('#memory-edit textarea').fill('shake\nmy usual')
        p.locator('[form=memory-edit]').click()
        self.assertEqual(p.evaluate("FoodMemory.resolve('shake',Store.d)[0].p"),30)
        p.locator('[data-a=sheet-close]').click()
        p.evaluate("FoodMemory.remember(Store.d,[{name:'Different shake',g:0,vml:300,kcal:400,p:40,c:30,f:2,estimated:false}],{name:'shake'});Store.save()")
        p.locator('[data-a=food-ai][data-m=text]').click();p.locator('[data-in=ai-text]').fill('2 servings shake');p.locator('[data-a=ai-go]').click()
        p.locator('[data-in=memory-resolve]').wait_for(state='attached')
        self.assertEqual(p.locator('[data-a=ai-add]').count(),0)
        choose(p,'[data-in=memory-resolve]',mid)
        self.assertEqual(p.evaluate('__gym.ui.ai.res.items[0].p'),60)
        p.locator('[data-a=ai-add]').click()
        choose(p,'[data-in=memory-quick]',mid)
        p.once('dialog',lambda d:d.accept());p.locator('[data-a=memory-forget]').click()
        self.assertEqual(p.evaluate('Object.values(Store.d.food).flat().length'),2)
        self.assertTrue(p.evaluate('(id)=>!!Store.d.del[id]',mid))
        self.assertEqual(p.evaluate('Store.d.foodMemories.length'),1)
        self.assertEqual(errors,[])

    def test_account_merge_export_and_reset_keep_private_memories(self):
        p,errors=self.page()
        self.photo(p);p.locator('[data-a=ai-add]').click()
        result=p.evaluate('''()=>{
          const a=JSON.parse(JSON.stringify(Store.d)),b=JSON.parse(JSON.stringify(a)),id=a.foodMemories[0].id;
          b.foodMemories[0].aliases=['morning'];b.foodMemories[0].updatedAt+=100;
          FoodMemory.remember(b,[{name:'Toast',g:100,kcal:200,p:10,c:30,f:5,estimated:false}]);
          const merged=Store.clean(Cloud.merge(a,b));
          const old=JSON.parse(JSON.stringify(b));delete old.foodMemories;Object.values(old.food).flat().forEach(f=>{delete f.memoryIds;delete f.memoryBatch;delete f.estimated});
          const deleted=JSON.parse(JSON.stringify(b));deleted.del[id]=Date.now();deleted.foodMemories=deleted.foodMemories.filter(m=>m.id!==id);
          const exported=JSON.parse(Store.exportJSON()).data,restored=Store.clean(exported);
          const reset=JSON.parse(JSON.stringify(a));reset.epoch=(a.epoch||0)+1;reset.foodMemories=[];reset.food={};
          return {count:merged.foodMemories.length,alias:merged.foodMemories.find(m=>m.id===id).aliases,
            oldCount:Cloud.merge(a,old).foodMemories.length,oldDiary:Object.values(Cloud.merge(old,a).food).flat()[0].memoryIds[0]===id,deleted:Cloud.merge(a,deleted).foodMemories.some(m=>m.id===id),
            exported:restored.foodMemories.length,key:exported.settings.apiKey,photo:JSON.stringify(exported).includes('test-fixture'),
            diaryRef:Object.values(restored.food).flat()[0].memoryIds[0]===id,reset:Cloud.merge(a,reset).foodMemories.length};
        }''')
        self.assertEqual(result,{'count':2,'alias':['morning'],'oldCount':1,'oldDiary':True,'deleted':False,'exported':1,'key':'','photo':False,'diaryRef':True,'reset':0})
        self.assertEqual(errors,[])

if __name__=='__main__':unittest.main()
