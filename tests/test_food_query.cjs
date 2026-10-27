/* 2.35: the offline food foundation. Questions and amounts are answered from the database, without AI or network. */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../data/foods.js');require('../data/food-lexicon.js');require('../js/food-volume.js');require('../js/food-query.js');require('../js/ai.js');
const Q=window.FoodQuery;Q.install();
const one=(t,lang='hu')=>{const a=Q.answer(t,lang);assert.ok(a,t);return a;};
const item=(t,lang='hu')=>{const a=one(t,lang);assert.equal(a.items.length,1,t+' -> '+a.items.map(i=>i.name));return a.items[0];};

test('every lexicon entry resolves to database values that add up',()=>{
 assert.equal(FOOD_LEXICON.missing,undefined);
 const names=new Set(FOODS.hu.map(h=>h[0]));assert.equal(names.size,FOODS.hu.length,'Hungarian names stay unique');
 for(const it of FOOD_LEXICON.items){
  const h=FOODS.hu.findIndex(x=>x[0]===it.hu);assert.ok(h>=0,it.hu);const r=FOODS.list[FOODS.hu[h][1]];
  if(it.usda)assert.equal(r[0],it.usda,it.hu);
  const [k,p,c,f]=r.slice(1,5);assert.ok(p+c+f<=100.5,it.hu+' macros per 100 g');
  if(k>20&&(it.own||it.mix))assert.ok(Math.abs(4*p+4*c+9*f-k)<=Math.max(25,k*.12)+(/beverage|pálinka|bor|fröccs|házmester|hosszúlépés|sör/i.test(it.hu+r[0])?7*k:0),it.hu+' energy matches macros');
  for(const [u,g] of Object.entries(it.u||{}))assert.ok(g>0&&g<=1000,it.hu+' '+u);
  if(it.mix)for(const [n] of it.mix)assert.ok(FOODS.list.some(x=>x[0]===n)||FOODS.hu.some(x=>x[0]===n),it.hu+': '+n);
 }
 // a recipe is calculated, never typed: gulyásleves = sum of its ingredients / finished weight
 const g=FOOD_LEXICON.items.find(x=>x.hu==='Gulyásleves'),row=FOODS.list[FOODS.hu.find(h=>h[0]==='Gulyásleves')[1]];
 const kcal=g.mix.reduce((s,[n,w])=>s+FOODS.list.find(x=>x[0]===n)[1]*w/100,0)*100/g.yield;assert.equal(row[1],Math.round(kcal));
});

test('one zsemle: calories and grams straight from the database, in any wording',()=>{
 for(const t of ['1 zsemle hány kalória','hány kalória van egy zsemlében?','zsemle','egy zsömle','zsemlye kalória','zsemlét','Hány gramm egy zsemle?','mennyi a súlya egy zsemlének']){
  const v=item(t);assert.equal(v.name,'Zsemle (kaiser)',t);assert.equal(v.grams,57,t);assert.equal(v.kcal,167,t);assert.equal(v.typ,true,t);assert.equal(one(t).chat,true,t);
 }
 assert.match(one('hány gramm egy zsemle').text,/^\*\*1 db Zsemle \(kaiser\) ≈ 57 g\*\*/);
 assert.match(one('1 zsemle hány kalória').text,/50–60 g/);
 const en=item('how many calories in a bread roll','en');assert.equal(en.name,'Bread roll (zsemle)');assert.equal(en.kcal,167);
 assert.equal(item('100 g zsemle').kcal,293);assert.equal(item('2 zsemle').grams,114);
});

test('Hungarian amounts, units, endings and sizes',()=>{
 const cases=[['10 dkg sonka',100,'Sonka, szeletelt'],['fél liter tej',516,'Tej, 2,8%'],['2 dl tej',206.4,'Tej, 2,8%'],['egy pohár tej',258,'Tej, 2,8%'],['3 evőkanál zabpehely',15,'Zabpehely'],
  ['egy marék dió',30,'Dió'],['1 pár virsli',110,'Virsli, sertés'],['másfél kifli',69,'Kifli'],['2 szelet kenyér',70,'Fehér kenyér'],['1 tábla csoki',100,'Tejcsokoládé'],['egy kocka étcsoki',5,'Étcsokoládé, 70–85%'],
  ['0,5 kg csirkemell',500,'Csirkemell, nyers'],['1 feles pálinka',48,'Pálinka (40%)'],['egy korsó sör',500,'Sör'],['2 kisfröccs',400,'Kisfröccs'],['nagyfröccs',300,'Nagyfröccs'],['egy tányér gulyás',350,'Gulyásleves'],
  ['túró rudi',30,'Túró Rudi (natúr)'],['250 g túró',250,'Túró, zsírszegény'],['1 kakaós csiga',90,'Kakaós csiga'],['lángos',165,'Lángos (sima)'],['sajtos tejfölös lángos',238,'Lángos, sajtos-tejfölös'],
  ['2 gerezd fokhagyma',6,'Fokhagyma'],['1 közepes alma',182,'Alma'],['150 g főtt rizs',150,'Rizs, fehér, főtt'],['200 g nyers rizs',200,'Rizs, fehér, nyers'],['1 rántott hús',130,'Rántott hús (sertés)']];
 for(const [t,g,name] of cases){const v=item(t);assert.equal(v.name,name,t);assert.equal(v.grams,g,t);assert.equal(v.kcal,Math.round(v.k100*g/100),t);}
 assert.ok(item('egy nagy alma').grams>item('egy kicsi alma').grams);
 assert.equal(item('2-3 tojás').grams,125);
});

test('several foods in one sentence, typos and English',()=>{
 const a=one('2 tojás és egy szelet kenyér, 10 dkg sonka');assert.deepEqual(a.items.map(i=>[i.name,i.grams]),[['Tojás, egész, nyers',100],['Fehér kenyér',35],['Sonka, szeletelt',100]]);
 assert.equal(a.total.kcal,a.items.reduce((s,i)=>s+i.kcal,0));assert.match(a.text,/Összesen: 399 kcal/);
 assert.deepEqual(one('rántott hús krumplipürével').items.map(i=>i.name),['Rántott hús (sertés)','Krumplipüré']);
 assert.deepEqual(one('zsemle vajjal').items.map(i=>i.name),['Zsemle (kaiser)','Vaj']);
 assert.equal(item('csirkemel 200 g').name,'Csirkemell, nyers');assert.equal(item('pogacsat').name,'Sajtos pogácsa');
 const e=one('2 eggs and a slice of white bread','en');assert.deepEqual(e.items.map(i=>[i.name,i.grams]),[['Egg',100],['White bread',35]]);
 assert.equal(item('can you tell me the protein in 200 g greek yogurt','en').p,18);
 assert.match(one('mennyi fehérje van 2 tojásban').text,/fehérje: \*\*12,6 g\*\*/);
 const close=one('ropogós zsemle');assert.equal(close.items[0].name,'Zsemle (kaiser)');assert.equal(close.chat,false);
});

test('questions that are not about one food are left for the coach',()=>{
 for(const t of ['mennyi fehérje kell naponta','mit egyek edzés előtt?','what should I eat before training','a cooked meal','szia','hogyan edzek lábat'])assert.equal(Q.answer(t,'hu'),null,t);
 assert.equal(one('zsemle és egy turmix').unknown.length,1);
});

test('the describe box: strict offline items, never a guessed serving or an unknown part',async()=>{
 let calls=0;global.fetch=async()=>{calls++;throw Error('unexpected network')};
 const r=await FoodAI.analyze('', '',{text:'2 zsemle, 10 dkg sonka és egy pohár tej',lang:'hu'});
 assert.equal(r.local,true);assert.deepEqual(r.items.map(i=>[i.name,i.grams,i.kcal]),[['Zsemle (kaiser)',114,334],['Sonka, szeletelt',100,163],['Tej, 2,8%',258,147]]);
 assert.match(r.items[0].basis,/2 db ≈ 114 g/);assert.match(r.notes,/tipikus/);
 assert.equal((await FoodAI.analyze('','',{text:'100 g banana + 50 g banana',lang:'en'})).items.reduce((s,i)=>s+i.kcal,0),134);
 assert.equal(FoodAI.local({text:'100 g banana + a shake'}),null);assert.equal(FoodAI.local({text:'0 g banana'}),null);assert.equal(FoodAI.local({text:'100 ml banana'}),null);
 assert.equal(FoodAI.local({text:'rizs'}),null,'no guessed serving in the diary');assert.equal(FoodAI.local({text:'ropogós zsemle'}),null,'no close guesses in the diary');
 const label=FoodAI.local({text:'35 g BioTech serving (140 kcal, 28 g protein, 4 g carbs, 1 g fat)'});assert.equal(label.items[0].p,28);assert.equal(label.items[0].label,true);
 const row=FOODS.list.find(r=>r[0]==='Milk, whole, 3.25% milkfat, with added vitamin D');const milk=FoodAI.local({text:'250 ml '+row[0]});assert.equal(milk.items[0].grams,Math.round(FoodVolume.describe(row).gramsPerDl*2.5*10)/10);
 // without a key, the understood part comes back and the rest is named, not dropped silently
 const part=await FoodAI.analyze('','',{text:'2 zsemle és egy turmix',lang:'hu'});assert.equal(part.items.length,1);assert.match(part.notes,/„turmix”/);
 const none=await FoodAI.analyze('','',{text:'valami finom',lang:'hu'});assert.deepEqual(none.items,[]);assert.match(none.notes,/2 zsemle, 10 dkg sonka/);
 assert.equal((await FoodAI.analyze('key','m',{text:'one biotech protein shake with milk'})).needsDetails,true);
 assert.equal(calls,0);
});

test('search helpers: the food words of a question and named portions',()=>{
 assert.equal(Q.foodWords('1 zsemle hány kalória'),'zsemle');
 const h=Q.hits('zsemlében');assert.equal(FOODS.hu[h[0].h][0],'Zsemle (kaiser)');
 const sz=FOODS.hu.findIndex(x=>x[0]==='Fehér kenyér');assert.deepEqual(Q.units(sz,FOODS.hu[sz][1]).map(u=>[u.u,u.g]),[['szelet',35]]);
 const beer=FOODS.hu.findIndex(x=>x[0]==='Sör');assert.ok(Q.units(beer,FOODS.hu[beer][1]).some(u=>u.u==='korso'&&u.g===500));
});

test('a bare food name means a sensible single portion',()=>{
 assert.equal(item('pizza').grams,107);assert.equal(item('bagett').grams,30);assert.equal(item('szőlő').grams,80);assert.equal(item('2 szem szőlő').grams,9.8);
});
