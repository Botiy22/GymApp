const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={window:{}};vm.createContext(context);
for(const path of ['data/exercises.js','js/plan.js','js/routine-templates.js'])vm.runInContext(fs.readFileSync(path,'utf8'),context);
const R=context.window.RoutineTemplates,clone=x=>JSON.parse(JSON.stringify(x));
const ids=new Set(context.window.EXERCISES.map(x=>x.id));
test('all 24 starter sessions have seven distinct real exercises and estimate at least an hour',()=>{
 assert.equal(R.templates.reduce((s,p)=>s+p.days.length,0),24);
 for(const p of R.templates)for(const d of p.days){
  assert.equal(d.items.length,7,`${p.id}: ${d.name.en}`);
  assert.equal(new Set(d.items.map(i=>i.ex)).size,7);
  for(const i of d.items)assert.ok(ids.has(i.ex),i.ex);
  assert.ok(R.durationMinutes(d)>=60,`${p.id}: ${d.name.en}`);
 }
});
test('generic five-day library no longer republishes the personal split',()=>{
 const p=R.templates.find(p=>p.id==='ulppl5');
 p.days.forEach((d,n)=>assert.notDeepEqual(clone(d.items),clone(context.window.PLAN.items.filter(i=>i.day===context.window.PLAN.days[n].id).map(i=>({ex:i.ex,label:null,sets:i.sets,reps:i.reps,rest:i.rest})))));
});
test('duration counts actual zero rest and only rests between working sets',()=>{
 assert.equal(R.durationMinutes({items:[{sets:3,rest:0}]}),14.25);
 assert.equal(R.durationMinutes({items:[{sets:3,rest:120}]}),18.25);
 assert.equal(R.durationMinutes({items:[{sets:1,rest:120}]}),12.75);
});
const old={id:'tabc123_0',name:{hu:'5 nap · Felső / Alsó + PPL · Felsőtest',en:'5-day · Upper / Lower + PPL · Upper'},sub:{hu:'5 nap · Felső / Alsó + PPL',en:'5-day · Upper / Lower + PPL'},icon:'upper',builtin:false,items:[['Barbell_Bench_Press_-_Medium_Grip',3,'6–10',150],['Seated_Cable_Rows',3,'8–12',120],['Dumbbell_Shoulder_Press',2,'8–12',120],['Wide-Grip_Lat_Pulldown',3,'8–12',120],['Barbell_Curl',2,'10–15',90],['Triceps_Pushdown',2,'10–15',90]].map(([ex,sets,reps,rest])=>({ex,label:null,sets,reps,rest}))};
test('untouched saved starters expand without changing IDs or mutating original data; upgrade is idempotent',()=>{
 const input=[clone(old)],saved=clone(input),next=R.upgradeRoutines(input);
 assert.equal(next[0].id,old.id);assert.equal(next[0].items.length,7);assert.deepEqual(input,saved);assert.equal(R.upgradeRoutines(next),next);
});
test('customized sessions, original plan and deleted sessions are preserved',()=>{
 const modifications=[r=>r.items[0].sets=4,r=>r.items[0].reps='5',r=>r.items[0].rest=0,r=>r.items[0].note='my tempo',r=>r.items[0].label={en:'mine'},r=>r.items[0].ex='Pullups',r=>r.name.en='My session',r=>r.icon='pull',r=>r.opt=true,r=>r.items.pop(),r=>r.id='upper'];
 for(const edit of modifications){const r=clone(old);edit(r);const input=[r];assert.equal(R.upgradeRoutines(input),input);}
 const empty=[];assert.equal(R.upgradeRoutines(empty),empty);
});
test('video complexes retain stable source identities and are not split sessions',()=>{
 assert.equal(R.isComplex({id:'clip_centr10'}),true);assert.equal(R.isComplex({id:'clip_lat_grips'}),true);assert.equal(R.isComplex({id:'upper'}),false);
 const input=[{id:'clip_centr10',items:[{sets:10,rest:0}]},{id:'clip_lat_grips',items:[{sets:1,reps:'AMRAP'}]}];assert.equal(R.upgradeRoutines(input),input);
});
