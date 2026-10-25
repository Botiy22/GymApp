const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../data/foods.js');require('../js/food-volume.js');require('../js/ai.js');
test('exact quantities calculate offline without dropping unmatched ingredients',async()=>{
 let calls=0;global.fetch=async()=>{calls++;throw Error('unexpected network')};
 const r=await FoodAI.analyze('', '',{text:'100 g banana + 50 g banana',lang:'en'});
 assert.equal(r.local,true);assert.equal(r.items.reduce((s,i)=>s+i.kcal,0),134);assert.equal(calls,0);
 assert.equal(FoodAI.local({text:'100 g banana + a shake'}),null);
 assert.equal(FoodAI.local({text:'0 g banana'}),null);
});
test('provided portion label keeps 28g protein instead of substituting generic whey',async()=>{
 const r=await FoodAI.analyze('','',{text:'35 g BioTech serving (140 kcal, 28 g protein, 4 g carbs, 1 g fat)',lang:'en'});
 assert.equal(r.items[0].p,28);assert.equal(r.items[0].label,true);assert.equal(r.local,true);
});
test('brand and shaker never establish serving or milk quantity',async()=>{
 const r=await FoodAI.analyze('key','model',{text:'I had a biotech one serving protein shake in a biotech shaker with milk'});
 assert.equal(r.needsDetails,true);assert.deepEqual(r.items,[]);
});
test('ambiguous meals use configured AI, photo descriptions reach prompt, malformed values rejected',async()=>{
 let body;global.fetch=async(url,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({content:[{type:'text',text:JSON.stringify({items:[{name:'Meal',grams:100,kcal100:120,protein100:10,carbs100:15,fat100:2}],confidence:'medium'})}]})}};
 const r=await FoodAI.analyze('key','model',{text:'a cooked meal',hint:'No oil'});assert.equal(r.items[0].p,10);assert.match(body.messages[0].content[0].text,/No oil/);
 await FoodAI.analyze('key','model',{images:['jpeg'],hint:'250 ml milk'});assert.equal(body.messages[0].content[0].type,'image');assert.match(body.messages[0].content[1].text,/250 ml milk/);
 for(const v of [null,'unknown',-1,'28g'])assert.throws(()=>FoodAI.parse(JSON.stringify({items:[{grams:100,kcal100:120,protein100:v,carbs100:10,fat100:2}]})));
 assert.throws(()=>FoodAI.parse('{}'));
});
test('millilitres require documented density',()=>{
 const row=FOODS.list.find(r=>r[0]==='Milk, whole, 3.25% milkfat, with added vitamin D');assert.ok(row);
 const volume=FoodVolume.describe(row);assert.ok(volume.gramsPerDl>0);
 const r=FoodAI.local({text:'250 ml '+row[0]});assert.equal(r.items[0].grams,Math.round(volume.gramsPerDl*2.5*10)/10);
 assert.equal(FoodAI.local({text:'100 ml banana'}),null);
});
