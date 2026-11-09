/* 2.53 (owner): "it always asks for a label and product clarification, it rarely provides anything".
   Packaged products are logged at once from their generic food (≈); the label is an optional refinement. */
const {test}=require('node:test'),assert=require('node:assert/strict');
global.window=global;
for(const f of ['data/foods','data/food-lexicon','data/restaurant-foods','data/bellozzo-foods','js/food-volume','js/food-products','js/food-memory','js/food-query','js/ai','js/food-estimates'])require('../'+f+'.js');
const Q=window.FoodQuery,parse=t=>Q.parse(t,{strict:true,foods:[],doc:{}}).items;

test('everyday branded products are logged straight away or with one tap',()=>{
 const cases=[['50g choco-oat musli','Müzli'],['150g milbona skyr','Skyr'],['200g pilos protein puding csokis','Fehérjepuding (általános becslés)'],['250g pilos túró','Túró, zsírszegény'],
  ['50g tesco zabpehely','Zabpehely'],['2 szelet spar toast kenyér','Fehér kenyér'],['30g biotech whey protein','Fehérjepor (tejsavó alapú)'],['1 adag biotech iso whey','Fehérjepor (tejsavó alapú)'],
  ['corny protein szelet','Fehérjeszelet (általános becslés)'],['40g lidl protein szelet','Fehérjeszelet (általános becslés)'],['300ml pilos tej 2,8%','Tej, 2,8%'],['125g milbona görög joghurt','Görög joghurt, teljes'],
  ['100g lidl csirkemell sonka','Csirkemell sonka'],['20g pilos vaj','Vaj'],['1 pilos joghurt','Joghurt, natúr, teljes tejből'],['150g pilos epres joghurt','Gyümölcsjoghurt'],['100g alesto mandula','Mandula'],
  ['250ml solevita narancslé','Narancslé'],['1 combino spagetti 100g','Tészta, főtt'],['200 g Lidl hummusz','Hummusz'],['100g lidl protein shake','Fehérjeturmix (por vízzel)']];
 for(const [t,generic] of cases){const it=parse(t);assert.equal(it.length,1,t);assert.equal(it[0].status,'ok',t);assert.equal(it[0].estimated,true,t);assert.equal(it[0].generic,generic,t);assert.ok(!it[0].label,t);assert.ok(it[0].kcal>0,t);}
 assert.equal(parse('1 combino spagetti 100g')[0].grams,100,'a trailing weight wins over the count');
 const milk=parse('300ml pilos tej 2,8%')[0];assert.equal(milk.basisUnit,'ml');assert.equal(milk.ml,300);assert.equal(milk.grams,0);
 const y=parse('pilos epres joghurt')[0];assert.equal(y.status,'needAmount');assert.equal(y.estimated,true);
 const c=Q.choices(y,'hu');assert.equal(c.length,3);assert.ok(c.every(x=>x.item.estimated&&x.item.text==='pilos epres joghurt'&&x.kcal>0));
});

test('stated nutrients replace the generic ones; contradictions and flavoured spreads are not guessed',()=>{
 const y=parse('200g pilos high protein yoghurt, low fat ni added sugar 20g protein coconut flavour')[0];
 assert.equal(y.p,20);assert.equal(y.grams,200);assert.equal(y.generic,'Görög joghurt, zsírmentes');
 const v=FoodAI.fromQuery(y,'hu');assert.equal(v.estimated,true);assert.equal(v.approx,true);assert.match(v.name,/pilos/);assert.match(v.basis,/≈ Görög joghurt, zsírmentes alapján; megadva: fehérje 20 g/);
 assert.match(FoodAI.fromQuery(y,'en').basis,/≈ based on .*stated: protein 20 g.*refine/i);
 for(const t of ['10g Alnatura chocolate crunchy peanut butter','10g Alnatura crunchy peanut butter 8g protein','10ml Pilos coconut milk 1.5 fat'])assert.equal(parse(t)[0].status,'needLabel',t);
});

test('what was added to a product stays a separate food',()=>{
 const shake=parse('one biotech protein shake with milk');assert.equal(shake.length,2);assert.equal(shake[0].estimated,true);assert.equal(shake[1].status,'needAmount');
 const y=parse('150g pilos joghurt with honey');assert.equal(y.length,2);assert.equal(y[0].grams,150);assert.equal(y[0].estimated,true);assert.equal(Q.nameOf(y[1].entry,'hu'),'Méz');
 const b=parse('200g Pilos yoghurt with 20g banana');assert.equal(b.length,2);assert.equal(b[0].estimated,true);assert.equal(b[1].grams,20);
});

test('a saved label still wins, and a contradicting new claim still asks',()=>{
 const foods=[{name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1}]; // synthetic fixture, not brand data
 const saved=Q.parse('200g pilos high protein coconut yoghurt',{strict:true,foods}).items[0];assert.equal(saved.label,true);assert.equal(saved.kcal,140);assert.ok(!saved.estimated);
 assert.equal(Q.parse('200g pilos high protein coconut yoghurt 28g protein',{strict:true,foods}).items[0].status,'needLabel');
});

test('everyday words are not hijacked: puding is not sausage, a bare shake or turmix is not protein',()=>{
 assert.equal(Q.nameOf(parse('200 g puding')[0].entry,'hu'),'Puding (tejjel főzött)');
 assert.equal(Q.nameOf(parse('200 g protein puding')[0].entry,'hu'),'Fehérjepuding (általános becslés)');
 assert.equal(Q.nameOf(parse('protein shake')[0].entry,'hu'),'Fehérjeturmix (por vízzel)');
 assert.equal(Q.answer('zsemle és egy turmix','hu').unknown.length,1);
 assert.equal(Q.nameOf(parse('hány protein van 100 g csirkében')[0].entry,'hu'),'Csirkemell, nyers');
});

test('the owner meal: no label question at all, only fruit identity and cinnamon amount',async()=>{
 global.fetch=()=>{throw Error('answered offline')};
 const text=require('node:fs').readFileSync(require('node:path').join(__dirname,'fixtures/oats-description.txt'),'utf8');
 const r=await FoodAI.analyze('key','model',{text,lang:'hu'});
 assert.ok(r.pending.every(p=>p.status!=='needLabel'),r.pending.map(p=>p.status+':'+p.text).join(', '));
 assert.equal(r.items.filter(i=>i.estimated).length,4);assert.match(r.notes,/címkével pontosíthatod/i);
});

test('with an AI key, products the database cannot place are estimated by the AI, not left as label questions',async()=>{
 let sent='';global.fetch=async(url,o)=>{sent=JSON.parse(o.body).messages[0].content.map(c=>c.text||'').join('');
  return {ok:true,status:200,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({items:[{sourceIndex:0,basisUnit:'ml',millilitres:10,name:'Pilos kókusztej',en:'Coconut milk beverage',src:'estimate',basis:'typical coconut drink',grams:0,kcal100:20,protein100:0.2,carbs100:2.7,fat100:1}],unresolved:[],question:null,confidence:'medium',notes:''})}]})};};
 const r=await FoodAI.analyze('key','claude-x',{text:'10ml Pilos coconut milk 1.5 fat\n100 g banán',lang:'hu'});
 assert.match(sent,/never a reason to leave a food unresolved/);assert.doesNotMatch(sent,/never invent branded nutrition/);assert.match(sent,/Pilos coconut milk/);
 assert.equal(r.pending.length,0);const coco=r.items.find(i=>/kókusz/.test(i.name));assert.equal(coco.estimated,true);assert.equal(coco.product,'Pilos coconut milk 1.5%');
 assert.equal(r.items.length,2);
});
