/* 2.45: recognise the food, ask only the one missing thing. Offline engine side (js/food-query.js choices/withGrams). */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;['../data/foods.js','../data/food-lexicon.js','../data/restaurant-foods.js','../data/bellozzo-foods.js','../js/food-volume.js','../js/food-memory.js','../js/food-products.js','../js/food-query.js'].forEach(f=>require(f));
const Q=window.FoodQuery;Q.install();
const strict=t=>Q.parse(t,{strict:true}).items;
const names=t=>strict(t).map(i=>i.entry?Q.nameOf(i.entry,'hu'):i.text);

test('Hungarian "with" forms split into two foods, digraphs included',()=>{
 assert.deepEqual(names('csirkemell rizzsel'),['Csirkemell, nyers','Rizs, fehér, főtt']);
 assert.deepEqual(names('lecsó kolbásszal'),['Lecsó','Kolbász, füstölt']);
 assert.equal(names('zabpehely 60 g tejjel')[1],'Tej, 2,8%','a leading "with" word is the food itself, not the "kávé tejjel" alias');
 assert.deepEqual(names('kávé tejjel'),['Tejeskávé'],'a known name stays one food');
 assert.deepEqual(names('whopper sajttal'),['Whopper sajttal (Burger King)']);
});

test('everyday dishes are in the database as typical home recipes',()=>{
 for(const [q,n] of [['bolognai spagetti','Bolognai spagetti'],['spagetti bolognese','Bolognai spagetti'],['sajtos tészta','Sajtos tészta'],['cézár saláta','Cézár saláta (csirkés)'],['tonhalas szendvics','Tonhalas szendvics'],['avokádós pirítós','Avokádós pirítós'],['gyros tál','Gyros tál'],['sushi 8 db','Sushi (lazacos maki)'],['paradicsomleves','Paradicsomleves']])
  assert.equal(names(q)[0],n,q);
 const s=strict('sushi 8 db')[0];assert.equal(s.status,'ok');assert.equal(Math.round(s.grams),212);
 assert.equal(strict('proteinshake vízzel')[1].status,'ok','water needs no amount question');
});

test('a missing amount becomes three ready answers',()=>{
 const rice=strict('csirkemell rizzsel')[1];assert.equal(rice.status,'needAmount');
 const c=Q.choices(rice,'hu');assert.deepEqual(c.map(x=>x.label),['kis adag','1 adag','nagy adag']);
 assert.ok(c.every(x=>x.item.status==='ok'&&x.kcal>0&&x.grams>0));assert.ok(c[0].grams<c[1].grams&&c[1].grams<c[2].grams);
 assert.equal(c[1].grams,180,'regular = the stored serving');assert.equal(Math.round(c[0].grams/5)*5,c[0].grams);
 assert.deepEqual(Q.choices(strict('kávé tejjel')[0],'en').map(x=>x.label),['small mug','1 mug','large mug']);
 assert.deepEqual(Q.choices(strict('2 eggs and toast')[1],'hu').map(x=>x.label),['1 szelet','2 szelet','3 szelet']);
});

test('chain items offer their own box sizes, values from the table',()=>{
 const c=Q.choices(strict('king nuggets')[0],'hu');assert.deepEqual(c.map(x=>x.label),['4 db','6 db','9 db','20 db']);
 assert.deepEqual(c.map(x=>x.grams),[68,102,153,340]);assert.equal(c[3].kcal,823);
 assert.deepEqual(Q.choices(strict('hagymakarika')[0],'hu').map(x=>x.kcal),[352,528]);
});

test('no serving on record: spoons or plain gram amounts, never a guess presented as fact',()=>{
 const honey=strict('greek yogurt with honey')[1];assert.equal(honey.status,'needAmount');
 assert.ok(Q.choices(honey,'en').every(x=>/tbsp|tsp/.test(x.label)));
 const sausage=strict('lecsó kolbásszal')[1];assert.deepEqual(Q.choices(sausage,'hu').map(x=>x.label),['50 g','100 g','150 g']);
});

test('an unrecognised phrase offers the closest foods, and "other amount" logs the typed grams',()=>{
 const u=strict('csirkemel valami')[0];
 if(u.status==='unknown'&&u.entry){const c=Q.choices(u,'hu');assert.ok(c.length>=1);assert.match(c[0].label,/Csirkemell/);}
 const rice=strict('csirkemell rizzsel')[1],it=Q.withGrams(rice,320);assert.equal(it.status,'ok');assert.equal(it.grams,320);assert.equal(it.entry,rice.entry);
 assert.equal(Q.withGrams(rice,0),null);assert.equal(Q.withGrams(rice,9000),null);
});

test('offline recognition: every everyday description resolves or is one tap from it',()=>{
 const phrases=['reggelire 2 tojás és 2 szelet kenyér','csirkemell rizzsel','egy tányér gulyásleves','bolognai spagetti','rántott hús krumplipürével','egy banán meg egy alma','kávé tejjel','zabpehely 60 g tejjel','túró rudi','egy doboz kóla','4 szelet sonka és 2 szelet sajt','egy zsemle vajjal és sonkával','müzli joghurttal','pörkölt nokedlivel','töltött káposzta','lecsó kolbásszal','hamburger és sült krumpli','gyros tál','sushi 8 db','avokádós pirítós','tonhalas szendvics','cézár saláta','sajtos tészta','paradicsomleves','oatmeal with milk','2 eggs and toast','chicken breast with rice','greek yogurt with honey','king nuggets','primavera grande pennével'];
 for(const t of phrases){const it=strict(t);assert.ok(it.length,t);for(const i of it)assert.ok(i.status==='ok'||Q.choices(i,'hu').length,t+': '+i.status+' '+i.text);}
});
