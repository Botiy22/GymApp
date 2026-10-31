const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
global.window=global;
for(const f of ['data/exercises','data/exercises.hu','data/recipes','data/foods','data/figures','data/additions','data/clip-recipes','js/plan','js/routine-templates','data/routine-art','data/recovery','data/library-expansion','data/exercise-guides','data/exercises-curated','js/exercise-catalog','js/exercise-atlas','js/overnight-oats','data/goal-recipes','js/cook-art','data/dessert-recipes','data/recipe-methods','js/routine-share'])require('../'+f+'.js');
test('starter collection covers every plan/template/complex ID and preserves legacy lookup',()=>{
 assert.equal(ExerciseCatalog.active,'curated');assert.equal(EXERCISES.length,47);assert.ok(LEGACY_EXERCISES.length>800);
 const ids=[...PLAN.items,...RoutineTemplates.templates.flatMap(t=>t.days.flatMap(d=>d.items)),...EXTRA_ROUTINES.flatMap(r=>r.items)].map(x=>x.ex);
 for(const id of ids){assert.ok(EXERCISE_GUIDES[id],id);assert.ok(CURATED_EXERCISES.some(x=>x.id===id),id);}
 assert.equal(new Set(CURATED_EXERCISES.map(x=>x.id)).size,CURATED_EXERCISES.length);
});
test('old/imported/shared exercises are admitted locally without losing IDs or exposing all legacy records',()=>{
 const old=LEGACY_EXERCISES.find(x=>!EXERCISE_GUIDES[x.id]);
 const snapshot={version:1,routine:{name:'Shared',items:[{ex:old.id,sets:3,reps:'8',rest:90},{ex:'my_old',sets:2,reps:'10',rest:60}]},myEx:[{id:'my_old',n:'My movement',p:['quadriceps'],s:[],eq:'other',steps:['Control the range.']}]};
 const d={routines:[],myEx:[]};let n=0;const copied=RoutineShare.copy(snapshot,d,ExerciseCatalog.byId,()=>String(++n));d.routines.push(copied.routine);d.myEx=copied.custom;
 const active=ExerciseCatalog.forData(d);assert.ok(active.some(x=>x.id===old.id));assert.ok(active.some(x=>x.id===copied.custom[0].id));assert.equal(active.length,49);assert.ok(ExerciseCatalog.forData({active:{entries:[{ex:old.id}]}}).some(e=>e.id===old.id));assert.equal(CURATED_EXERCISES.length,47);assert.ok(!EXERCISE_GUIDES[copied.custom[0].id]);
});
test('every authored motion has distinct finite poses, bilingual technique and original stills',()=>{
 for(const [id,g]of Object.entries(EXERCISE_GUIDES)){
  assert.equal(g.steps.hu.length,4,id);assert.equal(g.steps.en.length,4,id);
  assert.notEqual(ExerciseAtlas.render(g,0),ExerciseAtlas.render(g,1),id);
  for(const phase of [0,.25,.5,.75,1])assert.ok(!/NaN|Infinity|undefined/.test(ExerciseAtlas.render(g,phase)),id);
  for(const phase of [0,1])assert.equal(fs.readFileSync(`img/atlas/${id}-${phase}.svg`,'utf8'),ExerciseAtlas.render(g,phase)+'\n');
 }
});
test('six desserts have ingredient-calculated per-portion nutrition and separate full images',()=>{
 const recipes=RECIPES.items.filter(r=>r.id.startsWith('protein-')&&r.nutritionParts);assert.equal(recipes.length,6);
 for(const r of recipes){for(const k of ['kcal','p','c','f']){const n=r.nutritionParts.reduce((sum,p)=>sum+p[k],0)/r.servings;assert.ok(Math.abs(n-r[k])<=(k==='kcal'?.5:.05)+1e-8,r.id+' '+k);}
 assert.ok(r.p>=30);assert.ok(r.p*4/r.kcal>=.2);assert.equal(r.ing.length,r.nutritionParts.length);assert.ok(r.portion.hu);assert.ok(r.portion.en);
 for(const suffix of ['','-thumb'])assert.ok(fs.statSync(`img/recipes/${r.id}${suffix}.webp`).size>1000);
 }
});
test('existing recipe IDs retain complete bilingual instructions and descriptions',()=>{
 for(const r of RECIPES.items){assert.ok(r.description?.hu,r.id);assert.ok(r.description?.en,r.id);assert.ok(r.steps.hu.length>=3,r.id);assert.equal(r.steps.hu.length,r.steps.en.length,r.id);}
});
