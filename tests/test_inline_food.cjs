const {test}=require('node:test'),assert=require('node:assert/strict');
global.window=global;
for(const f of ['data/foods','data/food-lexicon','js/food-volume','js/food-products','js/food-memory','js/food-query','js/ai','js/food-estimates'])require('../'+f+'.js');
const multiline=require('node:fs').readFileSync(require('node:path').join(__dirname,'fixtures/oats-description.txt'),'utf8').trim().replace('sugar 20g','sugar with 20g');
test('the screenshot text is eight identical ingredients with spaces, line breaks or phone paragraph separators',()=>{
 const baseline=FoodQuery.parse(multiline,{strict:true}).items;
 for(const separator of [' ','  ','\t','\r','\r\n','\u2028','\u2029','\u00a0']) {
   const items=FoodQuery.parse(multiline.replace(/\n/g,separator),{strict:true}).items;
   assert.equal(items.length,8,JSON.stringify(separator));
   assert.deepEqual(items.map(i=>[i.status,i.text,i.grams,i.ml,i.known]),baseline.map(i=>[i.status,i.text,i.grams,i.ml,i.known]));
   assert.equal(items[0].known.p,undefined);assert.equal(items[3].known.p,20);
   assert.equal(items[4].ml,10);assert.equal(items[5].status,'needAmount');
 }
});
test('nutrition claims, label bases, percentages and parentheses stay attached to the right food',()=>{
 for(const t of [
   '200g Pilos yoghurt with 20g protein 80g banana',
   '200g Pilos yoghurt, 20g protein 80g banana',
   '200g Pilos yoghurt with 20g of protein 80g banana',
   '200g Pilos yoghurt 20g protein per 100g 80g banana'
 ]){
   const r=FoodQuery.parse(t,{strict:true}).items;
   assert.equal(r.length,2,t);assert.equal(r[0].grams,200);assert.equal(r[0].known.p,t.includes('per 100g')?40:20);assert.equal(r[1].grams,80);
 }
 const explicit=FoodQuery.parse('200g Pilos yogurt (140 kcal, 20g protein, 10g carbs, 2g fat) 71g banana',{strict:true}).items;
 assert.equal(explicit.length,2);assert.equal(explicit[0].label,true);assert.equal(explicit[0].p,20);assert.equal(explicit[1].grams,71);
 const milk=FoodQuery.parse('10ml Pilos milk 1,5 fat 80g banana',{strict:true}).items;
 assert.equal(milk.length,2);assert.equal(milk[0].ml,10);assert.match(milk[0].text,/1\.5%/);
 const powder=FoodQuery.parse('200g Pilos yoghurt with 20g protein powder',{strict:true}).items;
 assert.equal(powder.length,2);assert.deepEqual(powder[0].known,{});assert.equal(powder[1].grams,20);
});
test('inline packaged foods stay separate and can use their previously saved labels',()=>{
 const foods=[{name:'Pilos high protein coconut yoghurt',kcal:70,p:10,c:5,f:1},{name:'choco-oat musli',kcal:400,p:10,c:60,f:10}]; // Synthetic labels.
 const result=FoodQuery.parse(multiline.replace(/\n/g,' '),{strict:true,foods}).items;
 assert.equal(result.length,8);assert.equal(result[0].status,'ok');assert.equal(result[0].kcal,200);assert.equal(result[3].status,'ok');assert.equal(result[3].p,20);
});
test('comma-separated foods without a leading quantity and suffix weights still work',()=>{
 const r=FoodQuery.parse('Pilos yogurt, 50g banana 10g dio',{strict:true}).items;
 assert.equal(r.length,3);assert.equal(r[0].status,'needAmount');assert.equal(r[1].grams,50);assert.equal(r[2].grams,10);
 const suffix=FoodQuery.parse('banan 71g',{strict:true}).items;
 assert.equal(suffix.length,1);assert.equal(suffix[0].grams,71);
});
test('inline list still has the same estimate options and never needs the API to split it',async()=>{
 global.fetch=()=>{throw Error('unexpected API call')};
 const r=await FoodAI.analyze('key','model',{text:multiline.replace(/\n/g,' '),lang:'hu'});
 const estimated=FoodEstimates.apply(r,'hu');
 assert.equal(r.items.length+r.pending.length,8);assert.equal(estimated.items.filter(i=>i.estimated).length,4);assert.equal(estimated.pending.length,3);
 assert.equal(estimated.items.find(i=>/yoghurt/.test(i.name)).p,20);
 assert.equal(FoodQuery.parse(Array(31).fill('10g Pilos yoghurt').join(' '),{strict:true}).items[0].status,'tooLong');
});
