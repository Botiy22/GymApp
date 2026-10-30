const {test}=require('node:test'),assert=require('node:assert/strict');global.window=global;
for(const f of ['data/foods','data/food-lexicon','data/restaurant-foods','data/bellozzo-foods','js/food-products','js/food-memory','js/food-query','js/ai'])require('../'+f+'.js');
const B=BellozzoFoods,Q=FoodQuery;
const parse=q=>Q.parse(q,{strict:true}).items;
test('Primavera grande asks for pasta base, then sums the two printed rows without invented weight',async()=>{
 const pending=parse('primavera grande')[0];assert.equal(pending.status,'needRestaurant');assert.equal(pending.candidates.length,5);
 const i=B.resolve('primavera grande','pasta-primavera-grande-fusilloni')[0];
 assert.deepEqual([i.kcal,i.p,i.c,i.f,i.grams],[1367,61,125,68,0]);
 assert.deepEqual([parse('primavera grande penne')[0].kcal,parse('primavera classico gnocchi')[0].kcal],[1318,853]);
 const c=parse('primavera')[0];assert.equal(c.candidates.length,10);assert.equal(B.resolve('primavera grande','pasta-primavera-classico-penne'),null);
 global.fetch=()=>{throw Error('Known restaurant meals must stay offline')};
 const a=await FoodAI.analyze('test-key','',{text:'fél adag primavera grande linguine',lang:'hu'});
 assert.equal(a.local,true);assert.equal(a.items[0].kcal,630);assert.equal(a.items[0].p,28.5);assert.equal(a.items[0].basisUnit,'portion');
});
test('pizza diameters are distinct choices; typed quantities and canonical names survive',()=>{
 assert.equal(parse('bellozzo margherita')[0].candidates.length,2);
 for(const [q,kcal] of [['bellozzo margherita 24cm',727],['32 cm bellozzo margherita',1050],['2 adag bellozzo tiramisu',406],['bellozzo extra csirke',90]])assert.equal(parse(q)[0].kcal,kcal,q);
 for(const r of B.records){const a=parse(r.hu+' (Bellozzo)');assert.ok(a,r.hu);assert.equal(a[0].status,'ok',r.hu);assert.equal(a[0].restaurantId,r.id,r.hu);assert.equal(a[0].kcal,r.kcal,r.hu);}
});
test('unknown changes, mass, ingredients and menu sizes never become a guessed whole meal',()=>{
 for(const q of ['300g primavera grande penne','primavera grande penne sajt nélkül','primavera grande extra bacon','bellozzo margherita 40cm','bellozzo cola'])assert.equal(parse(q)[0].status,'needRestaurantDetail',q);
 assert.equal(parse('bellozzo carbonara classico penne')[0].warning,true,'inconsistent printed source retained, not recalculated');
 assert.equal(parse('bellozzo pesto grande penne')[0].kcal,1247);
 assert.ok(!parse('margherita')[0].restaurantId);assert.ok(!parse('tiramisu')[0].restaurantId);
 assert.equal(parse('whopper')[0].status,'ok');assert.equal(Math.round(parse('whopper')[0].kcal),732);
});
test('search and coach explain portions rather than claiming 100 g data',()=>{
 const a=Q.answer('primavera grande penne','hu');assert.equal(a.items[0].qty,'1 adag');assert.doesNotMatch(a.text,/100 g|= 0 g/);assert.match(a.text,/770 kcal.*548 kcal/);
 const en=Q.answer('bellozzo tiramisu','en');assert.match(en.text,/servings/);assert.match(en.text,/weight not published/);
 assert.ok(B.search('bellozzo').length);assert.equal(B.search('prim')[0].query,'bellozzo Primavera');assert.equal(B.search('nem létező étel').length,0);
});
