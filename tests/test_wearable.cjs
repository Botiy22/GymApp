/* 2.38: swimming energy and the smartwatch bridge contract (docs/WEARABLES.md). */
const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;require('../js/workout-energy.js');require('../js/rides.js');require('../js/wearable.js');
const E=WorkoutEnergy,W=Wearable;
test('swim: Compendium METs by stroke and pace level, active energy above rest, typo guards',()=>{
 assert.deepEqual(E.SWIM_MET.breast,[5.3,10.3]);assert.deepEqual(E.SWIM_MET.free,[5.8,9.8]);assert.deepEqual(E.SWIM_MET.back,[4.8,9.5]);
 const c=E.cleanCardio({type:'swim',weight:80,minutes:40,pool:25,laps:{free:20,breast:30,back:10},intensity:'moderate'});
 assert.deepEqual(E.swim(c),{lengths:60,metres:1500,pace:160,met:5.38});
 assert.equal(E.cardio(c),Math.round((5.38-1)*3.5*80/200*40));
 assert.ok(E.cardio({...c,intensity:'vigorous'})>E.cardio(c));
 for(const bad of [{laps:{}},{laps:{free:2.5}},{pool:5},{minutes:1,laps:{free:20}},{laps:{free:1000}}])assert.equal(E.cleanCardio({...c,...bad}),null,JSON.stringify(bad));
 assert.equal(E.cardio({...c,wear:{src:'watch',kcal:310}}),310,'a watch measurement replaces the estimate');
 assert.equal(E.cleanCardio({...c,wear:{src:'phone',kcal:310}}).wear,undefined);
});
test('bridge: unavailable on the web, request/reply round trip through a native handler',async()=>{
 assert.equal(W.platform(),'web');await assert.rejects(W.request('authorize',{}),e=>e.code==='unavailable');
 const sent=[];global.webkit={messageHandlers:{reppsyWearable:{postMessage(m){sent.push(m);setTimeout(()=>W.receive(JSON.stringify({v:1,re:m.id,ok:m.method!=='startLive',result:{x:1},error:{code:'denied',message:'no'}})),1);}}}};
 assert.equal(W.platform(),'ios');assert.deepEqual(await W.request('authorize',{kinds:['swim']}),{x:1});
 await assert.rejects(W.request('startLive',{kind:'swim'}),e=>e.code==='denied');
 await assert.rejects(W.request('format-disk'),e=>e.code==='method');
 assert.deepEqual(sent.map(m=>[m.v,m.method]),[[1,'authorize'],[1,'startLive']]);
 delete global.webkit;
});
test('bridge: untrusted live samples and workouts are range-checked',()=>{
 let live=null;const off=W.onLive(l=>{live=l;});
 assert.equal(W.receive({v:1,type:'live',kind:'swim',session:'s',sample:{hr:300,kcal:-5,dist:650,laps:26,stroke:'doggy'}}),true);
 assert.deepEqual([live.sample.hr,live.sample.kcal,live.sample.dist,live.sample.stroke],[undefined,undefined,650,undefined]);
 assert.equal(W.receive({v:2,type:'live',kind:'swim',sample:{hr:120}}),false);assert.equal(W.receive('not json'),false);off();
 assert.equal(W.cleanWorkout({kind:'swim',start:Date.now()-1000,end:Date.now()-2000}),null);
 const w=W.cleanWorkout({kind:'swim',start:Date.now()-2400e3,end:Date.now(),device:'Watch<script>',pool:25,kcal:310,laps:[{stroke:'free',dist:25,sec:40},{stroke:'breast',dist:25,sec:50},{stroke:'x',dist:999,sec:1}]});
 assert.equal(w.device,'Watchscript');assert.equal(w.laps.length,2);
});
test('watch workouts become app data: swim lengths per stroke, ride in the stored ride shape',()=>{
 const s=Date.now()-2400e3,laps=[...Array(24)].map(()=>({stroke:'free',dist:25,sec:45})).concat([...Array(10)].map(()=>({stroke:'breast',dist:25,sec:55})));
 const swim=W.toSwim(W.cleanWorkout({kind:'swim',start:s,end:s+2400e3,pool:25,laps,kcal:300,hr:{avg:130}}),80);
 assert.deepEqual([swim.pool,swim.laps.free,swim.laps.breast,swim.minutes,swim.wear.kcal],[25,24,10,40,300]);
 const c=E.cleanCardio(swim);assert.equal(E.cardio(c),300);assert.equal(E.swim(c).metres,850);
 const ride=W.toRide(W.cleanWorkout({kind:'ride',start:s,end:s+3600e3,dist:24500,moving:3400,hr:{avg:141,max:171},cadence:84,power:{avg:165,max:420}}));
 const r=Rides.clean(ride);assert.deepEqual([r.src,r.dist,r.moving,r.hr.avg,r.cad.avg,r.pw.max],['watch',24500,3400,141,84,420]);
});
