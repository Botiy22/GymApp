const {test}=require('node:test'),assert=require('node:assert/strict');global.window=global;
for(const f of ['data/foods','data/food-lexicon','js/food-volume','js/food-products','js/food-memory','js/food-query','js/ai'])require('../'+f+'.js');
const shake=()=>({name:'Protein shake',g:0,vml:300,kcal:300,p:30,c:25,f:8,estimated:true});
const fresh=()=>({foodMemories:[],myFoods:[],food:{}});
test('reviewed portions are remembered once; custom aliases and estimated provenance survive cleaning',()=>{
 const d=fresh(),a=shake();FoodMemory.remember(d,[a],{name:'Reggeli shake'});assert.equal(d.foodMemories.length,1);assert.equal(a.memoryIds[0],d.foodMemories[0].id);
 FoodMemory.remember(d,[shake()]);assert.equal(d.foodMemories.length,1);
 const saved=FoodMemory.clean(JSON.parse(JSON.stringify(d.foodMemories)))[0];assert.equal(saved.estimated,true);assert.deepEqual(saved.aliases,['Protein shake']);assert.equal(saved.items[0].vml,300);
 FoodMemory.remember(d,[{name:'Unknown',g:20,kcal:50}]);assert.equal(d.foodMemories.length,1);
});
test('named meals, servings and ml scale offline, including short-name Hungarian references',async()=>{
 const d=fresh();FoodMemory.remember(d,[shake()],{name:'Reggeli shake'});d.foodMemories[0].aliases.push('shake');global.Store={d};global.fetch=()=>{throw Error('remembered food must not call AI')};
 for(const [text,kcal,p,ml] of [['Reggeli shake',300,30,300],['2 adag reggeli shake',600,60,600],['150ml reggeli shake',150,15,150],['ittam a szokasos shake-et',300,30,300]]){
  const a=await FoodAI.analyze('key','model',{text,lang:'hu'});assert.equal(a.local,true);assert.deepEqual([a.items[0].kcal,a.items[0].p,a.items[0].ml],[kcal,p,ml]);assert.equal(a.items[0].approx,true);
 }
 assert.equal(FoodQuery.parse('150ml reggeli shake 99g protein').items[0].status,'needLabel');
 assert.equal(FoodQuery.parse('50g reggeli shake').items[0].status,'needMemoryAmount');
});
test('whole meals retain ingredients; unknown mass stays a serving without fabricated grams',async()=>{
 const d=fresh();FoodMemory.remember(d,[{name:'Toast',g:100,kcal:220,p:10,c:35,f:5,estimated:false},shake()],{name:'Breakfast'});global.Store={d};
 const a=await FoodAI.analyze('','',{text:'2 servings breakfast',lang:'en'});assert.equal(a.items.length,2);assert.equal(a.items.reduce((n,i)=>n+i.kcal,0),1040);
 FoodMemory.remember(d,[{name:'Mystery bar',g:0,kcal:150,p:12,c:13,f:5,estimated:false}]);
 const b=await FoodAI.analyze('','',{text:'2 servings mystery bar',lang:'en'});assert.equal(b.items[0].basisUnit,'portion');assert.equal(b.items[0].grams,0);assert.equal(b.items[0].kcal,300);b.items[0].servings=.5;assert.equal(FoodAI.total(b.items[0]).kcal,75);
});
test('different recipes with the same name require a choice and never overwrite old nutrition',()=>{
 const d=fresh();FoodMemory.remember(d,[shake()],{name:'Shake'});FoodMemory.remember(d,[{...shake(),p:40}],{name:'Shake'});global.Store={d};
 const a=FoodQuery.parse('2 adag shake').items[0];assert.equal(a.status,'needMemory');assert.equal(a.candidates.length,2);
 assert.equal(FoodMemory.resolve(a.original,d,a.candidates[1])[0].p,80);assert.equal(d.foodMemories[0].items[0].p,30);
});
test('frequency uses actual recent diary events, counts a meal once and reacts to deletion',()=>{
 const d=fresh();FoodMemory.remember(d,[shake(),{name:'Apple',g:100,kcal:50,p:0,c:12,f:0}],{name:'Breakfast'});
 const batch=d.foodMemories.find(m=>m.name==='Breakfast'),now=Date.parse('2026-10-30T18:00:00');
 d.food['2026-10-30']=FoodMemory.scaled(batch).map((i,n)=>({...i,id:'item'+n,memoryBatch:'one-meal'}));
 d.food['2027-01-01']=FoodMemory.scaled(batch).map(i=>({...i,id:'future'}));
 assert.equal(FoodMemory.rank(d,now).find(m=>m.id===batch.id).count,1);
 d.food['2026-10-30']=[];assert.equal(FoodMemory.rank(d,now).find(m=>m.id===batch.id).count,0);
});
test('capacity, unsafe values, portion bounds and saved-label default volumes are explicit',()=>{
 const d=fresh();for(let i=0;i<FoodMemory.LIMIT;i++)FoodMemory.remember(d,[{...shake(),name:'shake '+i}]);
 assert.equal(FoodMemory.remember(d,[{...shake(),name:'overflow'}]).full,true);assert.equal(d.foodMemories.length,200);
 assert.deepEqual(FoodMemory.scaled(d.foodMemories[0],20),[]);assert.deepEqual(FoodMemory.clean([{id:'x',name:'bad',items:[{...shake(),p:NaN}]}]),[]);
 const p={myFoods:[{id:'milk',name:'My milk',basis:'ml',port:200,kcal:50,p:3,c:5,f:2}]};assert.equal(FoodMemory.resolve('my milk',p)[0].ml,200);assert.equal(FoodMemory.resolve('my milk',p)[0].kcal,100);
});
test('recent repeat meals outrank old habits without counting future or duplicate components',()=>{
 const d=fresh(),now=Date.parse('2026-10-30T12:00:00');
 FoodMemory.remember(d,[shake()],{name:'Old shake'});FoodMemory.remember(d,[{...shake(),name:'Oats'}]);
 const [old,recent]=d.foodMemories;
 d.food['2026-08-31']=[0,1].map(n=>({...FoodMemory.scaled(old)[0],id:'old'+n}));
 d.food['2026-10-30']=[{...FoodMemory.scaled(recent)[0],id:'recent'}];
 assert.equal(FoodMemory.rank(d,now)[0].id,recent.id);
 d.food['2026-10-30'].push(...[0,1].map(n=>({...FoodMemory.scaled(old)[0],id:'new'+n})));
 assert.equal(FoodMemory.rank(d,now)[0].id,old.id);
 d.food['2026-10-30']=d.food['2026-10-30'].slice(0,1);
 assert.equal(FoodMemory.rank(d,now)[0].id,recent.id);
});
