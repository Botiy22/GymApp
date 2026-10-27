/* 2.35.1: newer models think first and that thinking uses max_tokens. Replies must not end up cut off or "unreadable". */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../data/foods.js');require('../js/food-volume.js');require('../js/ai.js');
const meal=JSON.stringify({items:[{name:'Zabkása',en:'Oatmeal',grams:300,kcal100:120,protein100:5,carbs100:18,fat100:3}],confidence:'medium',notes:''});
const reply=(content,stop='end_turn')=>({ok:true,json:async()=>({content,stop_reason:stop})});
test('food analysis: a reply cut off during thinking is retried once with less thinking and more room',async()=>{
 const bodies=[];global.fetch=async(u,o)=>{const b=JSON.parse(o.body);bodies.push(b);return bodies.length===1?reply([{type:'thinking',thinking:''}],'max_tokens'):reply([{type:'thinking',thinking:''},{type:'text',text:meal}]);};
 const r=await FoodAI.analyze('key','claude-sonnet-5-5',{text:'50g zab 10g dio 60g fagyasztott bogyos gyumolcs',lang:'hu'});
 assert.equal(r.items[0].grams,300);assert.equal(bodies.length,2);
 assert.ok(bodies[0].max_tokens>=16000);assert.equal(bodies[0].output_config.effort,'medium');assert.equal(bodies[1].output_config.effort,'low');assert.ok(bodies[1].max_tokens>bodies[0].max_tokens);
});
test('food analysis: cut off twice gives a clear "cut" error; Haiku 4.5 gets no effort field',async()=>{
 const bodies=[];global.fetch=async(u,o)=>{bodies.push(JSON.parse(o.body));return reply([{type:'text',text:'{"items":[{"name":"x"'}],'max_tokens');};
 await assert.rejects(FoodAI.analyze('key','claude-haiku-4-5-20251001',{text:'valami ismeretlen étel',lang:'hu'}),e=>e.code==='cut');
 assert.equal(bodies.length,2);assert.equal(bodies[0].output_config,undefined);
});
test('coach chat: an empty or truncated reply is retried; a refusal is reported as such',async()=>{
 let n=0;global.fetch=async()=>(++n===1?reply([{type:'thinking',thinking:''}],'max_tokens'):reply([{type:'text',text:'Jó reggeli, kb. 700 kcal.'}]));
 assert.equal(await FoodAI.chat('key','claude-opus-5-5','sys',[{role:'user',content:'Ez egy reggelinek milyen?'}]),'Jó reggeli, kb. 700 kcal.');assert.equal(n,2);
 global.fetch=async()=>reply([],'refusal');
 await assert.rejects(FoodAI.chat('key','claude-opus-5-5','sys',[{role:'user',content:'x'}]),e=>e.code==='refusal');
});
