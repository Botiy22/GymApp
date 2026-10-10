const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const c={window:{}};vm.createContext(c);for(const p of ['data/foods.js','js/food-volume.js','js/hue-wheel.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
const V=c.window.FoodVolume,D=c.window.FOODS,plain=x=>JSON.parse(JSON.stringify(x));
const hu=name=>{const h=D.hu.find(x=>x[0]===name);return V.describe(D.list[h[1]],h);};
test('explicit metric serving calibrates milk, cola and beer separately',()=>{
 assert.equal(hu('Tej, 2%').gramsPerDl,103.2);assert.equal(hu('Sör').gramsPerDl,100);assert.ok(Math.abs(hu('Kóla').gramsPerDl-340/3.3)<1e-9);
});
test('oil and milk never share a guessed water density',()=>{
 const oil=hu('Olívaolaj');assert.ok(oil.gramsPerDl>90&&oil.gramsPerDl<92);assert.notEqual(oil.gramsPerDl,hu('Tej, 2%').gramsPerDl);
 assert.ok(Math.abs(oil.gramsPerDl-13.5/14.7867648*100)<1e-10);
});
test('US household units and metric decimal commas parse correctly',()=>{
 assert.equal(V.portionMl('1 pohár (2,5 dl)',true),250);assert.equal(V.portionMl('0.5 l'),500);assert.equal(V.portionMl('330 ml'),330);
 assert.equal(V.portionMl('1 cup'),236.5882365);assert.equal(V.portionMl('2 tablespoons'),29.5735296);assert.equal(V.portionMl('8 fl oz'),236.5882368);
 assert.equal(V.portionMl('1 can or bottle'),null);
});
test('solid cup portions and dry drink powders are not liquids',()=>{
 assert.equal(V.describe(['Oats, raw',300,1,1,1,100,'1 cup']).liquid,false);
 assert.equal(V.isLiquid('Beverages, cocoa, dry powder'),false);assert.equal(V.isLiquid('Milk, dry, whole'),false);assert.equal(V.isLiquid('Fish, tuna, canned in oil'),false);
});
test('missing volume data stays unknown and dl conversion refuses it',()=>{
 const volume=V.describe(['Beverages, carbonated, unknown',30,0,5,0]);assert.equal(volume.gramsPerDl,null);assert.equal(V.quantity({volume},2,'dl'),null);
});
test('2.5 dl milk uses its gram weight and 2.5 dl label values use volume directly',()=>{
 assert.deepEqual(plain(V.quantity({volume:hu('Tej, 2%')},'2,5','dl')),{g:258,vml:250,k:2.58});
 assert.deepEqual(plain(V.quantity({basis:'ml'},'2.5','dl')),{g:0,vml:250,k:2.5});assert.equal(V.quantity({basis:'ml'},250,'g'),null);
});
test('invalid amounts are rejected; grams remain compatible',()=>{
 assert.deepEqual(plain(V.quantity({},100,'g')),{g:100,k:1});for(const n of [-1,NaN,'nope',51])assert.equal(V.quantity({basis:'ml'},n,'dl'),null);
});
test('hue-wheel coordinates map clockwise from the top with a seamless wrap',()=>{
 const H=c.window.HueWheel;assert.equal(H.pointHue(0,-1,0,0),0);assert.equal(H.pointHue(1,0,0,0),90);assert.equal(H.pointHue(0,1,0,0),180);assert.equal(H.pointHue(-1,0,0,0),270);
 assert.ok(H.pointHue(-.001,-1,0,0)>359);assert.ok(H.pointHue(.001,-1,0,0)<1);
});
