const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const ctx=vm.createContext({window:{},Date,Set,Map});vm.runInContext(fs.readFileSync('js/routine-share.js','utf8'),ctx);const share=ctx.window.RoutineShare;
const data={routines:[],myEx:[{id:'my_original',n:'Custom press',p:['chest'],s:['triceps'],eq:'other',steps:['Press slowly'],img:'PRIVATE PHOTO',vid:'PRIVATE VIDEO'},{id:'my_unrelated',n:'Private exercise'}],workouts:['PRIVATE LOG']};
const r={id:'private-id',name:{en:'Custom day',hu:'Saját nap'},items:[{ex:'my_original',label:{en:'Slow press'},sets:3,reps:'8',rest:90,kg:60,note:'PRIVATE NOTE'}]};
test('publication includes only the chosen template and referenced custom definitions',()=>{const s=share.pack(r,data,'en');assert.equal(s.routine.name,'Custom day');assert.equal(s.routine.items[0].label,'Slow press');assert.equal(s.myEx.length,1);assert.equal(JSON.stringify(s).includes('PRIVATE'),false);assert.equal(JSON.stringify(s).includes('private-id'),false);});
test('copy remaps custom IDs and never changes source data or imports logged weights',()=>{const s=share.pack(r,data,'en');let n=0;const c=share.copy(s,data,{},()=>String(++n));assert.equal(c.routine.items[0].ex,c.custom[0].id);assert.notEqual(c.custom[0].id,'my_original');assert.equal(c.custom[0].img,'');assert.equal(c.routine.builtin,false);assert.equal(c.routine.items[0].kg,undefined);assert.equal(data.routines.length,0);assert.equal(data.myEx[0].id,'my_original');});
test('copy refuses unknown exercises, unsupported templates and capacity overflow',()=>{assert.throws(()=>share.copy({version:1,routine:{items:[{ex:'unknown'}]},myEx:[]},data,{},()=> 'new'),/exercise_unavailable/);assert.throws(()=>share.copy({version:2},data,{},()=> 'new'),/routine_unavailable/);assert.throws(()=>share.copy(share.pack(r,data,'en'),{...data,routines:Array(100).fill({})},{},()=> 'new'),/copy_limit/);});

test('shared snapshot comparison detects edits and accepts sanitized bilingual labels',()=>{
 const r={name:'Plan',icon:'push',items:[{ex:'Barbell_Bench_Press_-_Medium_Grip',label:{en:'Bench'},sets:3,reps:'8',rest:120}]},data={myEx:[]};
 const local= share.pack(r,data,'en'),server=JSON.parse(JSON.stringify(local));server.routine.items[0].label={en:'Bench',hu:'Bench'};assert.equal(share.matches(local,server,'en'),true);
 server.routine.items[0].sets=4;assert.equal(share.matches(local,server,'en'),false);
});
