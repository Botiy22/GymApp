/* 2.55: KFC, Pizza Hut and Starbucks from their official tables; store own brands; imported store labels; loose phrases. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
global.window=global;
// an imported export (synthetic, not brand data) is loaded like data/store-products.js
const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'reppsy-')),'store-products.js');
execFileSync('python3',[path.join(__dirname,'../tools/import_off.py'),path.join(__dirname,'fixtures/off-sample.tsv')],{env:{...process.env,STORE_PRODUCTS_OUT:out}});
for(const f of ['data/foods','data/food-lexicon','data/chain-menus'])require('../'+f+'.js');require(out);
for(const f of ['data/restaurant-foods','data/bellozzo-foods','js/food-volume','js/food-products','js/food-memory','js/food-query','js/ai'])require('../'+f+'.js');
const Q=window.FoodQuery,parse=t=>Q.parse(t,{strict:true,foods:[],doc:{}}).items,one=t=>{const i=parse(t);assert.equal(i.length,1,t+': '+i.map(x=>x.status+' '+x.text));return i[0];};
const name=i=>i.entry?Q.nameOf(i.entry,'hu'):i.text;

test('the generated chain menus match the transcribed official tables',()=>{
 const menus=Object.fromEntries(CHAIN_MENUS.map(m=>[m.name,m.rows]));
 assert.ok(menus.KFC.length>=75&&menus['Pizza Hut'].length>=80&&menus.Starbucks.length>=70);
 for(const rows of Object.values(menus))for(const [hu,,g,kcal,p,c,f] of rows){assert.ok(g>0,hu);assert.ok(Math.abs(4*p+4*c+9*f-kcal)<=Math.max(15,kcal*.15),hu+' energy');}
 // spot values typed from the sources
 const z=one('zinger');assert.equal(name(z),'Zinger (KFC)');assert.equal(z.grams,170);assert.equal(z.kcal,445);assert.equal(z.p,24.8);
 const m=one('pizza hut margarita');assert.equal(name(m),'Margarita pizza, Pan, közepes (Pizza Hut)');assert.equal(m.kcal,1428);
 assert.equal(one('2 szelet pizza hut margarita').grams,136,'a slice is 1/8 of the medium pizza');
 assert.equal(name(one('pizza hut margarita san francisco')),'Margarita pizza, San Francisco, közepes (Pizza Hut)');
 const sb=one('starbucks áfonyás muffin');assert.equal(sb.kcal,435);assert.equal(sb.grams,115);
 assert.equal(one('6 hot wings').grams,216);assert.equal(name(one('twister')),'Twister Classic (KFC)');assert.equal(name(one('hot shots')),'Hot Shots falatok (KFC)');
 // inconsistent source rows are left out, never fixed silently
 assert.ok(!CHAIN_MENUS.flatMap(m=>m.rows).some(r=>['Deluxe toast','Lazacos bagel'].includes(r[0])));
});

test('everyday words stay everyday foods; a chain is only used when named or unique',()=>{
 for(const q of ['csirkemell','csirkeszárny','káposztasaláta','margarita pizza','áfonyás muffin','ketchup','sajtburger','cappuccino'])
  for(const i of parse(q))assert.ok(!/(KFC|Pizza Hut|Starbucks)\)$/.test(name(i)),q+' → '+name(i));
 assert.equal(name(one('kfc káposztasaláta')),'Káposztasaláta (KFC)');assert.equal(name(one('kfc ketchup')),'Ketchup (KFC)');
});

test('store own brands are named with their store',()=>{
 for(const [q,store,brand] of [['150g milbona skyr','Lidl','Milbona'],['100g moser roth étcsokoládé','Aldi','Moser Roth'],['200g s-budget joghurt','SPAR','S-Budget'],['50g tesco finest müzli','Tesco','Tesco Finest'],['200g auchan joghurt','Auchan','Auchan']]){
  const i=one(q.replace('milbona skyr','milbona görög joghurt'));   // not the imported Milbona skyrassert.equal(i.estimated,true,q);assert.deepEqual(i.store,{store,brand},q);
  assert.match(FoodAI.fromQuery(i,'hu').basis,new RegExp('^'+store+' saját márka \\('+brand+'\\) · ≈ '));}
});

test('an imported label (Open Food Facts export) beats the estimate',()=>{
 assert.equal(STORE_PRODUCTS.count,2);
 const s=one('150g milbona skyr natúr');assert.ok(!s.estimated);assert.equal(s.kcal,93);assert.equal(s.p,16.5);assert.match(Q.view(s,'hu').ref,/Open Food Facts/);
 const s0=one('milbona skyr natúr');assert.equal(s0.status,'needAmount');assert.equal(Q.choices(s0,'hu')[1].grams,150,'"1 adag" is the export\'s serving size');
 assert.equal(one('100g s-budget zabpehely').kcal,370);
 assert.equal(one('150g milbona joghurt').estimated,true,'no imported match: still estimated');
});

test('describing words and side-by-side foods become their own items',()=>{
 for(const [q,names] of [['csirkés rizs',['Csirkemell, nyers','Rizs, fehér, főtt']],['mogyoróvajas kenyér',['Fehér kenyér','Mogyoróvaj']],['banános zabkása',['Zabkása (vízzel főzve)','Banán']],['csirkemel rizs',['Rizs, fehér, főtt','Csirkemell, nyers']]])
  assert.deepEqual(parse(q).map(name).sort(),names.slice().sort(),q);
 for(const [q,n] of [['csokis müzli','Müzli'],['epres joghurt','Gyümölcsjoghurt'],['ropogós zsemle','Zsemle (kaiser)'],['sajtos pogácsa','Sajtos pogácsa'],['kakaós csiga','Kakaós csiga']])assert.equal(name(one(q)),n,q);
 for(const [q,n] of [['halászlé','Halászlé'],['bejgli','Bejgli (diós)'],['kürtőskalács','Kürtőskalács'],['somlói','Somlói galuska'],['zabkása','Zabkása (vízzel főzve)'],['fanta','Fanta (narancsos üdítő)'],['sült csirke','Csirkecomb, sült (bőrrel)'],['töki','Tökfőzelék']])assert.equal(name(one(q)),n,q);
});
