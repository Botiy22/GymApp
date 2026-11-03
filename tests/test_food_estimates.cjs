const {test}=require('node:test'),assert=require('node:assert/strict');
global.window=global;
for(const f of ['data/foods','data/food-lexicon','js/food-volume','js/food-products','js/food-memory','js/food-query','js/ai','js/food-estimates'])require('../'+f+'.js');
const text=require('node:fs').readFileSync(require('node:path').join(__dirname,'fixtures/oats-description.txt'),'utf8').replace('sugar 20g','sugar with 20g');
test('explicit opt-in makes all four missing labels usable, offline, without inventing brand records',async()=>{
 global.fetch=()=>{throw Error('no network required')};
 const r=await FoodAI.analyze('key','model',{text,lang:'hu'});
 assert.equal(r.pending.length,7);assert.equal(r.items.length,1); // Strict analysis unchanged before opt-in.
 const out=FoodEstimates.apply(r,'hu'),estimated=out.items.filter(i=>i.estimated);
 assert.equal(out.items.length,5);assert.equal(out.pending.length,3);assert.equal(estimated.length,4);
 assert.equal(r.pending.length,7); // No destructive change to the original result.
 assert.ok(estimated.every(i=>!i.label&&!i.db&&i.approx&&i.kcal>0));
 const yogurt=estimated.find(i=>/yoghurt/.test(i.name));assert.equal(yogurt.grams,200);assert.equal(yogurt.p,20);
 assert.match(yogurt.basis,/megadott adatból: 20 g/);
 const milk=estimated.find(i=>i.basisUnit==='ml');assert.equal(milk.ml,10);assert.equal(milk.grams,0);assert.equal(milk.kcal,5);
 assert.equal(estimated.find(i=>/musli/.test(i.name)).grams,50);
 assert.equal(estimated.find(i=>/alnatura/.test(i.name)).grams,10);
 assert.equal(out.items.find(i=>/Eritrit/.test(i.name)).kcal,0);
 assert.deepEqual(FoodEstimates.apply(out,'hu').items,out.items);
 assert.equal(out.confidence,'low'); // Questions remain; no false certainty.
});
test('estimates never override a saved label or a contradictory label claim',async()=>{
 // Synthetic product fixture; NOT brand nutrition.
 global.Store={d:{myFoods:[{name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1}]}};
 const r=FoodEstimates.apply(await FoodAI.analyze('','',{text,lang:'en'}),'en');
 const yogurt=r.items.find(i=>/yoghurt/.test(i.name));assert.equal(yogurt.label,true);assert.equal(yogurt.kcal,140);assert.equal(yogurt.estimated,undefined);
 const conflict=FoodQuery.parse('200g Pilos high protein coconut yoghurt with 28g protein',{strict:true}).items[0];
 assert.equal(conflict.conflict,true);assert.equal(FoodEstimates.item(conflict),null);
 delete global.Store;
});
test('unknown products, ambiguous quantities, plant milk and added ingredients are not guessed',()=>{
 for(const s of ['Pilos high protein low fat yoghurt','10ml Pilos coconut milk 1.5 fat','10ml Pilos almond milk 1.5 fat','100g Pilos milk chocolate 1.5 fat','100g Pilos protein shake','50g choco-oat musli with 20g banana','62g ananaszkonzerv szirupban','100g Alnatura hazelnut spread','200g Pilos high protein low fat yoghurt 200g protein']) {
   const p=FoodQuery.parse(s,{strict:true}).items[0];assert.equal(FoodEstimates.item(p),null,s);
 }
});
test('re-analysis uses newly typed quantities and marks results as estimates in both languages',async()=>{
 const r=FoodEstimates.apply(await FoodAI.analyze('','',{text:'20ml pilos freefrom lactosefree tej 1,5 fat\n100g pilos high protein yoghurt, low fat with 10g protein coconut flavour',lang:'en'}),'en');
 assert.equal(r.pending.length,0);assert.equal(r.confidence,'medium');assert.match(r.notes,/Estimated/);
 assert.equal(r.items[0].ml,20);assert.equal(r.items[1].grams,100);assert.equal(r.items[1].p,10);
 assert.ok(r.items.every(i=>i.estimated&&!i.label));
});
