const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.window=global;
for(const f of ['data/foods','data/food-lexicon','data/recipes','js/food-volume','js/food-query','js/overnight-oats','data/goal-recipes','js/recipe-goals'])require('../'+f+'.js');
const added=RECIPES.items.filter(r=>r.leanProtein),keys=['kcal','p','c','f','g'];
test('ten new lower-fat, high-protein portions use ingredient calculations and unique IDs',()=>{
 assert.equal(added.length,10);assert.equal(added.filter(r=>r.oats).length,5);
 for(const r of added){
  assert.ok(RecipeGoals.complete(r));assert.equal(r.servings,1);assert.ok(r.p*4/r.kcal>=.2&&r.f/r.g*100<=3&&r.f<10,r.id);
  assert.ok(r.steps.en.length===r.steps.hu.length&&r.steps.en.length===r.art.length);
  assert.ok(fs.existsSync(__dirname+'/../img/recipes/'+r.id+'.webp'));
  let expected;
  if(r.oats){expected=OvernightOats.compute(r.oats);assert.ok(OvernightOats.PRESETS.some(p=>p.id===r.id));assert.ok(r.ing.some(i=>Array.isArray(i[2])&&i[2][1].endsWith(' dl')));}
  else{expected={};for(const k of keys){const sum=r.nutritionParts.reduce((s,p)=>s+p[k],0);expected[k]=k==='g'||k==='kcal'?Math.round(sum):Math.round(sum*10)/10;}for(const p of r.nutritionParts){const row=FOODS.list.find(f=>f[0]===p.source);for(const [n,k] of ['kcal','p','c','f'].entries())assert.equal(p[k],row[n+1]*p.g/100);}assert.match(r.steps.en.join(' '),/74 °C/);assert.match(r.ing[0][1],/cooked weight/);}
  assert.deepEqual(keys.map(k=>r[k]),keys.map(k=>expected[k]),r.id);
  assert.deepEqual(RecipeGoals.classify(r),['loss','maintain','muscle']);
 }
 const ids=RECIPES.items.map(r=>r.id);assert.equal(new Set(ids).size,ids.length);
 const count=OvernightOats.PRESETS.length;vm.runInThisContext(fs.readFileSync(__dirname+'/../data/goal-recipes.js','utf8'));assert.equal(OvernightOats.PRESETS.length,count);assert.equal(RECIPES.items.length,ids.length);
});
test('goal rules are inclusive at boundaries and do not hide unknown recipes from All',()=>{
 const r={cat:'main',kcal:500,p:25,c:40,f:10};assert.deepEqual(RecipeGoals.classify(r),['loss','maintain','muscle']);
 assert.ok(!RecipeGoals.classify({...r,kcal:501}).includes('loss'));
 assert.ok(RecipeGoals.classify({...r,kcal:550}).includes('bulk'));
 assert.ok(!RecipeGoals.classify({...r,kcal:549}).includes('bulk'));
 assert.ok(RecipeGoals.classify({...r,cat:'snack',kcal:250,p:15}).includes('loss'));
 for(const bad of [null,NaN,-1,'25',undefined]){const x={...r,p:bad};assert.deepEqual(RecipeGoals.classify(x),[]);assert.ok(RecipeGoals.matches(x,''));}
 for(const goal of RecipeGoals.keys)assert.ok(RECIPES.items.some(r=>RecipeGoals.matches(r,goal)),goal);
});
