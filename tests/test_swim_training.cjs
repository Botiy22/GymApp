const assert=require('node:assert/strict');
require('../js/swim-training.js');require('../js/workout-energy.js');
const S=globalThis.SwimTraining;let count=0;
function check(name,fn){fn();count++;console.log('ok',name);}
check('whole lengths, accurate totals and budget across pools, pace and routines',()=>{
 for(const pool of [10,17.5,25,33.3,50,75,100])for(const pace of [60,150,240,600])for(const minutes of [20,45,59])for(const routine of ['easy','foundation','intervals','breathing']){
  const p=S.plan({pool,pace,minutes,routine});
  if(!p.fits){assert(p.minimumMinutes>minutes);continue;}
  assert(p.elapsedSeconds<=minutes*60+1e-6);assert(p.elapsedSeconds<3600);
  assert.equal(p.blocks.length,4);assert(p.blocks.every(b=>Number.isInteger(b.reps)&&Number.isInteger(b.lengths)&&b.lengths>=1&&b.reps>=1));
  assert.equal(p.lengths,p.blocks.reduce((a,b)=>a+b.reps*b.lengths,0));
  assert(Math.abs(p.metres-pool*p.lengths)<1e-7);
  assert.equal(p.elapsedSeconds,p.swimSeconds+p.restSeconds+300);
  const c=WorkoutEnergy.cleanCardio({type:'swim',weight:75,minutes:Math.round(p.swimSeconds/6)/10,pool,laps:{[p.stroke]:p.lengths}});
  assert(c,'plan must survive the actual diary validator');
 }
});
check('pool sizes change lengths, not pool distance; no fractional lengths',()=>{
 const a=S.plan({pool:25}),b=S.plan({pool:50}),c=S.plan({pool:75}),d=S.plan({pool:100});
 assert.equal(a.blocks[2].lengths,4);assert.equal(b.blocks[2].lengths,2);assert.equal(c.blocks[2].lengths,1);assert.equal(d.blocks[2].lengths,1);
 assert.equal(c.blocks[2].metres,c.blocks[2].reps*75);
});
check('normal breathing focus uses freestyle, restores other strokes in other routines',()=>{
 assert.equal(S.plan({routine:'breathing',stroke:'back'}).stroke,'free');
 assert.equal(S.plan({routine:'easy',stroke:'breast'}).stroke,'breast');
});
check('invalid saved preferences use bounded defaults',()=>{
 assert.deepEqual(S.clean({pool:0,minutes:NaN,pace:Infinity,routine:'__proto__',stroke:'fly'}),S.defaults);
 assert.equal(S.clean(null).pool,25);assert.equal(S.clean({pool:33.333}).pool,33.3);
});
check('freestyle uses the four illustrated phases that ship offline; no drawn figures remain',()=>{
 const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
 assert.equal(S.frames.length,4);for(const f of S.frames){assert.ok(fs.existsSync(path.join(root,f)),f);assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('"'+f+'"'),f+' cached');}
 assert.equal(S.scene,undefined);
});
check('HU and EN contain the same UI keys',()=>assert.deepEqual(Object.keys(S.text.hu).sort(),Object.keys(S.text.en).sort()));
console.log(count+' swim training checks passed');
