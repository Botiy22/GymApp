const {test}=require('node:test'),assert=require('node:assert/strict');
global.window=global;
for(const f of ['data/foods','data/food-lexicon','js/food-volume','js/food-products','js/food-query','js/ai'])require('../'+f+'.js');
const text=`50g choco-oat musli
71g banan
10g dio
65g fagyi gyumi
15g erythritol
200g pilos high protein yoghurt, low fat ni added sugar 20g protein coconut flavour
17ml pilos freefrom lactosefree tej 1,5 fat
Fahej por`;
test('the exact meal preserves eight ingredients and the protein/fat claims without inventing labels',async()=>{
 const r=FoodQuery.parse(text,{strict:true});assert.equal(r.items.length,8);
 assert.deepEqual(r.items.map(i=>i.status),['needLabel','ok','ok','needIdentity','ok','needLabel','needLabel','needAmount']);
 assert.deepEqual(r.items[5].known,{p:20});assert.equal(r.items[4].c,15);assert.equal(r.items[4].kcal,0);assert.deepEqual(FoodProducts.read('200g Pilos yogurt 20g protein per 100g').known,{p:40});assert.equal(FoodQuery.parse('200g Pilos yogurt, 71g banan',{strict:true}).items.length,2);assert.equal(r.items[5].grams,200);assert.equal(r.items[6].ml,17);assert.match(r.items[6].text,/1\.5%/);assert.equal(r.items[7].entry.i,FOODS.list.findIndex(r=>r[0]==='Spices, cinnamon, ground'));
 global.fetch=()=>{throw Error('should not pay AI to guess brand labels')};const a=await FoodAI.analyze('key','m',{text,lang:'hu'});assert.equal(a.local,true);assert.equal(a.items.length,3);assert.equal(a.pending.length,5);assert.equal(a.confidence,'low');
 for(const shop of ['Lidl','Tesco','SPAR'])assert.equal(FoodQuery.parse('100g '+shop+' high protein yoghurt',{strict:true}).items[0].status,'needLabel');
});
// Test fixtures are deliberately synthetic, NOT verified real brand nutrition.
const foods=[{name:'choco-oat musli',kcal:400,p:10,c:60,f:10},{name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1},{name:'Pilos freefrom lactosefree tej 1,5 fat',basis:'ml',kcal:46,p:3.4,c:4.8,f:1.5}];
test('confirmed labels calculate offline on the next use; 20 g stays 20 g and 17 ml stays a volume',async()=>{
 global.Store={d:{myFoods:foods}};const fixed=text.replace('fagyi gyumi','fagyasztott gyümi').replace('Fahej por','1g Fahej por');
 const a=await FoodAI.analyze('key','m',{text:fixed,lang:'hu'});assert.equal(a.local,true);assert.equal(a.items.length,8);assert.equal(a.items.find(i=>/yoghurt/.test(i.name)).p,20);
 const milk=a.items.find(i=>i.basisUnit==='ml');assert.equal(milk.ml,17);assert.equal(milk.grams,0);assert.equal(milk.kcal,8);assert.equal(milk.p,.6);
 const conflict=FoodQuery.parse('200g Pilos high protein coconut yoghurt 28g protein',{strict:true});assert.equal(conflict.items[0].status,'needLabel');
 assert.equal(FoodQuery.parse('200g Pilos high protein vanilla yoghurt',{strict:true}).items[0].status,'needLabel');
 delete global.Store;
});
test('label search validates complete per-100 values, rejects missing fields and preserves ml/kJ basis',async()=>{
 const fixture={code:'1234567890123',product_name:'Test yogurt',brands:'Pilos',nutrition_data_per:'100g',nutriments:{'energy-kcal_100g':70,proteins_100g:10,carbohydrates_100g:5,fat_100g:1}};
 assert.equal(FoodProducts.product(fixture).p,10);
 assert.equal(FoodProducts.product({...fixture,nutriments:{...fixture.nutriments,proteins_100g:null}}),null);
 assert.equal(FoodProducts.product({...fixture,nutrition_data_per:'serving'}),null);
 const ml=FoodProducts.product({...fixture,nutrition_data_per:'100ml',nutriments:{...fixture.nutriments,'energy-kcal_100g':undefined,'energy-kj_100g':292.88}});assert.equal(ml.basis,'ml');assert.equal(ml.kcal,70);
 let url;global.fetch=async u=>{url=u;return {ok:true,json:async()=>({products:[fixture]})}};assert.equal((await FoodProducts.search('yogurt','Lidl')).length,1);assert.match(url,/Lidl/);
 global.fetch=async()=>{throw Error('offline')};await assert.rejects(FoodProducts.search('pilos'));
});
test('only unresolved ordinary foods go to the agent; database amounts cannot be rewritten',async()=>{
 let sent;global.fetch=async(u,o)=>{sent=JSON.parse(o.body);return {ok:true,json:async()=>({content:[{type:'text',text:JSON.stringify({items:[{sourceIndex:0,name:'Stew',en:'Stew',grams:220,kcal100:120,protein100:10,carbs100:12,fat100:4}],confidence:'high'})}]})}};
 const a=await FoodAI.analyze('key','m',{text:'71g banan\na mysterious stew',lang:'en'});assert.equal(a.items[0].grams,71);assert.equal(a.items[0].kcal,63);assert.equal(a.items[1].name,'Stew');assert.equal(a.pending.length,0);assert.doesNotMatch(sent.messages[0].content[0].text,/71g banan/);
});
test('photo requests preserve label units and unknown nutrients, and do not claim visual certainty',async()=>{
 let sent;global.fetch=async(u,o)=>{sent=JSON.parse(o.body);return {ok:true,json:async()=>({content:[{type:'text',text:JSON.stringify({items:[{name:'Milk',src:'label',basisUnit:'ml',millilitres:17,grams:0,kcal100:46,protein100:3.4,carbs100:4.8,fat100:1.5}],unresolved:[{name:'Unclear yogurt',reason:'needLabel',known:{p:20}}],confidence:'high'})}]})}};
 const a=await FoodAI.analyze('key','m',{images:['test-image'],hint:'17 ml milk',lang:'en'});assert.equal(a.items[0].kcal,8);assert.equal(a.items[0].ml,17);assert.equal(a.pending[0].known.p,20);assert.equal(a.confidence,'low');
 assert.match(sent.messages[0].content[1].text,/nutrition-label photo as a second meal/);assert.match(sent.messages[0].content[1].text,/kJ \/ 4.184/);assert.match(sent.messages[0].content[1].text,/never put zero/);
});

test('partial agent components never make an unresolved line appear complete; legacy ml totals scale correctly',async()=>{
 global.fetch=async()=>({ok:true,json:async()=>({content:[{type:'text',text:JSON.stringify({items:[{sourceIndex:0,name:'Rice',grams:100,kcal100:130,protein100:2.5,carbs100:28,fat100:.3}],unresolved:[{sourceIndex:0,name:'Unknown sauce',reason:'unknown'}],confidence:'medium'})}]})});
 const a=await FoodAI.analyze('key','m',{text:'71g banana\na mysterious stew',lang:'en'});assert.equal(a.items.length,1);assert.equal(a.pending.length,1);
 const ml=FoodAI.parse(JSON.stringify({items:[{name:'Milk',basisUnit:'ml',millilitres:200,grams:0,kcal:92,protein:6.8,carbs:9.6,fat:3}]}));assert.equal(ml.items[0].kcal,92);assert.equal(ml.items[0].p,6.8);
});

test('precise refinement labels and amounts resolve existing lines without duplicating a portion',async()=>{
 global.fetch=()=>{throw Error('unexpected API')};
 const r=await FoodAI.analyze('key','m',{text:'200g Pilos high protein coconut yoghurt\nFahej por',hint:'200g Pilos high protein coconut yoghurt (140 kcal, 20g protein, 10g carbs, 2g fat)\n1g cinnamon powder',lang:'en'});
 assert.equal(r.items.length,2);assert.equal(r.pending.length,0);assert.equal(r.items[0].p,20);assert.equal(r.items[0].kcal,140);assert.equal(r.items[1].grams,1);assert.equal(r.local,true);
});
