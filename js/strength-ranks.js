/* Personal lift milestones derived from saved working sets, never estimated 1RM. */
globalThis.StrengthRanks = (() => {
  'use strict';
  const tiers = [
    {en:'Spark',hu:'Szikra'}, {en:'Ember',hu:'Parázs'}, {en:'Steel',hu:'Acél'},
    {en:'Sentinel',hu:'Őrszem'}, {en:'Titan',hu:'Titán'}, {en:'Apex',hu:'Csúcs'}
  ];
  const tracks = [
    {id:'bench',ex:'Barbell_Bench_Press_-_Medium_Grip',en:'Bench press',hu:'Fekvenyomás',weights:[20,40,60,80,100,140]},
    {id:'squat',ex:'Barbell_Full_Squat',en:'Back squat',hu:'Hátsó guggolás',weights:[20,40,80,100,140,200]},
    {id:'deadlift',ex:'Barbell_Deadlift',en:'Deadlift',hu:'Felhúzás',weights:[40,60,100,140,180,240]},
    {id:'press',ex:'Standing_Military_Press',en:'Overhead press',hu:'Vállból nyomás',weights:[10,20,30,40,60,80]}
  ];
  function summary(workouts) {
    return tracks.map(track => {
      let best=0,reps=0,workout=null;
      for(const w of workouts||[]) {
        if(w.tick)continue;
        for(const e of w.entries||[]) {
          if(e.ex!==track.ex)continue;
          for(const set of e.sets||[]) {
            if(set.w||set.done===false||!Number.isFinite(set.kg)||set.kg<=0||set.kg>2000||!Number.isFinite(set.reps)||set.reps<=0)continue;
            if(set.kg>best||(set.kg===best&&set.reps>reps)){best=set.kg;reps=set.reps;workout=w.id;}
          }
        }
      }
      const tier=track.weights.reduce((rank,weight,index)=>best>=weight?index:rank,-1);
      const next=track.weights[tier+1]||null,base=tier<0?0:track.weights[tier];
      return {...track,best,reps,workout,tier,next,progress:next?Math.max(0,Math.min(1,(best-base)/(next-base))):1};
    });
  }
  function unlocked(before,after) {
    return summary(after).filter((rank,index)=>rank.tier>summary(before)[index].tier);
  }
  return {tiers,tracks,summary,unlocked};
})();
