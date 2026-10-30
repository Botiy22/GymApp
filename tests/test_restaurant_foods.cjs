/* 2.43: chain menus with the chain's own published values (data/restaurant-foods.js). Only the first test's spot
   values are typed from the Burger King Hungary table (2024-12-16); the rest checks that the data is used as written. */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../data/foods.js');require('../data/food-lexicon.js');require('../data/restaurant-foods.js');require('../js/food-volume.js');require('../js/food-query.js');
const Q=window.FoodQuery;Q.install();const R=window.RESTAURANT_FOODS;
const items=(t,lang='hu',opts)=>{const a=Q.answer(t,lang,opts);assert.ok(a,t);return a.items;};
const one=(t,lang='hu')=>{const x=items(t,lang);assert.equal(x.length,1,t+' -> '+x.map(i=>i.name));return x[0];};
const near=(a,b,d,msg)=>assert.ok(Math.abs(a-b)<=d,`${msg}: ${a} vs ${b}`);

test('spot values match the printed Burger King table per portion',()=>{
 for(const [q,g,kcal,p,c,f] of [['whopper',332.5,731.8,36.6,50.7,41.9],['giga kosár',1188,3296.9,92.7,359.7,162.8],['közepes bk krumpli',116,169.4,3.8,27.5,4.9],
  ['20 db king nuggets',340,823,41,71.5,41],['bacon king',423.9,1288.3,79.4,52,83.4],['oreo shake',350,566.4,10.5,91.1,17.2],['0,4 l bk kóla',400,180,0,44.8,0],['bk red bull',250,110,0,26.3,0]]){
  const i=one(q);assert.match(i.name,/Burger King/,q);near(i.grams,g,.05,q+' g');near(i.kcal,kcal,.6,q+' kcal');near(i.p,p,.06,q+' P');near(i.c,c,.06,q+' C');near(i.f,f,.06,q+' F');
 }
});

test('every chain item is in the database and gives its own portion back',()=>{
 assert.equal(FOOD_LEXICON.missing,undefined);assert.ok(R.count>=100,'whole menu');
 const seen=new Set();
 for(const it of R.items){
  assert.ok(!seen.has(it.hu),'unique '+it.hu);seen.add(it.hu);
  const h=FOODS.hu.findIndex(x=>x[0]===it.hu);assert.ok(h>=0,it.hu);assert.equal(FOODS.meta[h].brand,'Burger King',it.hu);
  const [k,p,c,f]=it.own;assert.ok(p+c+f<=100.5,it.hu+' macros per 100 g');
  if(k>40&&!it.fix)assert.ok(Math.abs(4*p+4*c+9*f-k)<=Math.max(8,k*.12),it.hu+' energy matches macros');   // fibre and rounding: salads land a few kcal off
  const i=one(it.hu);assert.equal(i.name,it.hu);assert.ok(!i.typ,it.hu+' is the chain portion, not a typical one');
  near(i.grams,it.port[1],.05,it.hu+' portion');near(i.kcal,k*it.port[1]/100,.6,it.hu+' kcal');
 }
 // the one inconsistent row of the source is marked, not silently changed
 const cc=R.items.find(x=>x.hu==='Crispy Chicken (Burger King)');assert.ok(cc.fix&&/46,9/.test(cc.ref));assert.match(Q.answer('crispy chicken','en').text,/46\.9 g fat/);
});

test('menu names, sizes and counts the way people say them',()=>{
 const cases=[['whopper','Whopper (Burger King)',1],['egy dupla whopper','Dupla Whopper (Burger King)',1],['whopper sajttal','Whopper sajttal (Burger King)',1],['2 whopper jr','Whopper Junior (Burger King)',2],
  ['king nuggets','King Nuggets (Burger King)',1],['9 spicy nuggets','Spicy King Nuggets (Burger King)',9],['bk kis krumpli','Kis burgonya (Burger King)',1],['kis bk krumpli','Kis burgonya (Burger King)',1],
  ['xxl krumpli','XXL burgonya (Burger King)',1],['burger king sült krumpli','Sült krumpli (Burger King)',1],['bk sajtburger','Sajtburger (Burger King)',1],['burger king hamburger','Hamburger (Burger King)',1],
  ['chicken royal hány kalória','Chicken Royal (Burger King)',1],['hagymakarika 12 db','Hagymakarika (Burger King)',12],['bk brownie','Brownie fagylalttal (Burger King)',1],['king fusion','Oreo King Fusion (Burger King)',1]];
 for(const [q,name,qty] of cases){const i=one(q);assert.equal(i.name,name,q);assert.match(String(i.qty),new RegExp('^'+qty+' '),q);}
 assert.equal(one('6 db king nuggets').grams,102);assert.equal(one('king nuggets').grams,102,'no number: the 6-piece box');
 assert.equal(one('9 spicy nuggets').grams,189,'a bare number counts pieces');assert.equal(one('hagymakarika 12 db').grams,138);
 for(const [q,name] of [['medium bk fries','Burger King Medium fries'],['small bk fries','Burger King Small fries'],['whopper with cheese','Burger King Whopper with cheese'],['bk onion rings','Burger King Onion rings']])assert.equal(one(q,'en').name,name,q);
});

test('one chain in the message: its sides and drinks are that chain\'s too',()=>{
 const m=items('whopper menü közepes krumplival és kólával').map(i=>i.name);
 assert.deepEqual(m,['Whopper (Burger King)','Sült krumpli (Burger King)','Coca-Cola (Burger King)']);
 assert.deepEqual(items('whopper, kis krumpli, 0,4 l kóla').map(i=>[i.name,i.grams]),[['Whopper (Burger King)',332.5],['Kis burgonya (Burger King)',74],['Coca-Cola (Burger King)',400]]);
 assert.equal(items('whopper és alma')[1].name,'Alma','an apple stays an apple');
});

test('everyday words never turn into a chain item',()=>{
 for(const q of ['kis krumpli','sült krumpli','brownie','tonic','espresso','cappuccino','rántott hús közepes krumplival','zsemle vajjal'])
  for(const i of items(q))assert.doesNotMatch(i.name,/Burger King/,q);
 assert.equal(one('sajtburger').name,"Sajtburger (McDonald's)");assert.equal(one('hamburger').name,"Hamburger (McDonald's)");assert.equal(one('nuggets').name,"Chicken McNuggets (McDonald's)");
 assert.equal(items('zsemle vajjal').length,2);assert.deepEqual(items('alma,2 banán').map(i=>i.qty),['1 db','2 db']);
});

test('the diary asks for the box size but takes exact portions',()=>{
 const p=t=>Q.parse(t,{strict:true}).items[0];
 assert.equal(p('whopper').status,'ok');assert.equal(p('king nuggets').status,'needAmount');
 const n=p('6 king nuggets');assert.equal(n.status,'ok');assert.equal(n.grams,102);
});
