/* 2.36: overnight oats recipes and builder — one calculation for cards, builder and diary. */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../data/foods.js');require('../data/food-lexicon.js');require('../data/recipes.js');require('../js/food-volume.js');require('../js/food-query.js');require('../js/overnight-oats.js');
const O=window.OvernightOats;
test('every builder ingredient resolves to a database row with sane values',()=>{
 for(const it of Object.values(O.ITEMS)){const v=O.compute({[it.id]:it.def});assert.equal(v.parts.length,1,it.ref);assert.ok(v.kcal>=0&&v.kcal<200,it.id+' '+v.kcal);assert.ok(it.step>0&&it.def>0);}
});
test('builder totals are the sum of the parts, liquids convert ml to grams',()=>{
 const v=O.compute({oats:50,milk15:150});const oats=FOODS.list[FOODS.hu.find(h=>h[0]==='Zabpehely')[1]];
 assert.equal(v.parts[0].kcal,oats[1]*.5);assert.equal(v.parts[1].g,154.5);assert.equal(v.g,205);
 assert.equal(v.kcal,Math.round(v.parts.reduce((s,p)=>s+p.kcal,0)));
 assert.deepEqual(O.compute({oats:0,chia:-5,nope:20,whey:5000}).parts,[]);
});
test('ready recipes are breakfast items whose card values come from the same calculation',()=>{
 const oats=RECIPES.items.filter(r=>r.oats);assert.deepEqual(oats.map(r=>r.id),['overnight-oats','oats-choco-pb','oats-apple-cinnamon','oats-berry-turo','oats-mango-coconut','oats-tiramisu']);
 for(const r of oats){const v=O.compute(r.oats);assert.deepEqual([r.kcal,r.p,r.c,r.f,r.g],[v.kcal,v.p,v.c,v.f,v.g],r.id);assert.equal(r.cat,'breakfast');assert.ok(r.steps.hu.length===r.steps.en.length&&r.ing.length===Object.keys(r.oats).length,r.id);
  if(r.id!=='overnight-oats'){assert.ok(r.hu&&r.en&&r.illustration,r.id);assert.ok(require('fs').existsSync(__dirname+'/../img/recipes/'+r.id+'.webp')&&require('fs').existsSync(__dirname+'/../img/recipes/'+r.id+'-thumb.webp'),r.id);}}
 const ids=RECIPES.items.map(r=>r.id);assert.equal(new Set(ids).size,ids.length);
});
test('the user breakfast phrase is now understood offline',()=>{
 const a=FoodQuery.answer('50g zab 10g dio 60g fagyasztott bogyos gyumolcs 70g banan 15g erythrytol 200g görög joghurt','hu');
 assert.deepEqual(a.unknown,[]);assert.equal(a.items.length,6);assert.equal(a.items.find(i=>/Eritrit/.test(i.name)).kcal,0);
});
