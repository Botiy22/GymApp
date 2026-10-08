/* Estimated active energy above resting expenditure; never inferred from kg lifted. */
globalThis.WorkoutEnergy = (() => {
  'use strict';
  const types=['walk','incline','run','stairs','cycle','elliptical'];
  const numeric=v=>typeof v==='number'?v:typeof v==='string'&&v.trim()?Number(v.replace(',','.')):NaN;
  const valid=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
  function cleanStrength(value) {
    if(!value||typeof value!=='object')return null;
    const weight=numeric(value.weight),minutes=numeric(value.minutes),intensity=value.intensity;
    return valid(weight,30,300)&&valid(minutes,1,360)&&['moderate','vigorous'].includes(intensity)?{version:1,weight,minutes,intensity}:null;
  }
  function cleanCardio(value) {
    if(!value||typeof value!=='object'||!types.includes(value.type))return null;
    const weight=numeric(value.weight),minutes=numeric(value.minutes),type=value.type;
    if(!valid(weight,30,300)||!valid(minutes,1,480))return null;
    const c={version:1,type,weight,minutes,intensity:value.intensity==='vigorous'?'vigorous':'moderate'};
    if(['walk','incline','run'].includes(type)) {
      const speed=numeric(value.speed),incline=numeric(value.incline);
      if(!valid(speed,type==='run'?8.1:3,type==='run'?20:6)||!valid(incline,0,15))return null;
      c.speed=speed;c.incline=incline;
    }
    if(typeof value.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value.id))c.id=value.id;
    return c;
  }
  const kcal=(met,weight,minutes)=>Math.round(Math.max(0,met-1)*3.5*weight/200*minutes);
  function strength(value) {
    const e=cleanStrength(value);return e?kcal(e.intensity==='vigorous'?6:3.5,e.weight,e.minutes):null;
  }
  function cardio(value) {
    const c=cleanCardio(value);if(!c)return null;
    let met;
    if(['walk','incline','run'].includes(c.type)) {
      const speed=c.speed*1000/60,grade=c.incline/100;
      met=(3.5+(c.type==='run'?0.2:0.1)*speed+(c.type==='run'?0.9:1.8)*speed*grade)/3.5;
    }else {
      const rates={stairs:[6.8,9.3],cycle:[6.8,8],elliptical:[5,9]};
      met=rates[c.type][c.intensity==='vigorous'?1:0];
    }
    return kcal(met,c.weight,c.minutes);
  }
  function workout(w) {
    const hasLifting=!!w&&!w.tick&&(w.entries||[]).some(e=>(e.sets||[]).some(s=>s.reps>0));
    const lifting=hasLifting?strength(w.energy):0;
    const aerobic=(w&&w.cardio||[]).reduce((n,c)=>n+(cardio(c)||0),0);
    return {strength:lifting||0,cardio:aerobic,total:(lifting||0)+aerobic,missing:hasLifting&&lifting===null};
  }
  function daily(workouts,day,dayOf) {
    return (workouts||[]).filter(w=>dayOf(w.start)===day&&w.end>=w.start&&w.end<=Date.now()).reduce((sum,w)=>{
      const e=workout(w);sum.strength+=e.strength;sum.cardio+=e.cardio;sum.missing+=e.missing?1:0;sum.total=sum.strength+sum.cardio;return sum;
    },{strength:0,cardio:0,total:0,missing:0});
  }
  function budget(base,eaten,estimated,manual,settings) {
    // A supplied daily activity total includes workouts: use one source, never both.
    const useManual=settings.addActive&&manual>0;
    const included=useManual?manual:settings.addWorkoutCalories?estimated:0;
    return {base:base||0,included,total:(base||0)+included,remaining:(base||0)+included-eaten,source:useManual?'manual':included?'workouts':'none'};
  }
  return {types,cleanStrength,cleanCardio,strength,cardio,workout,daily,budget};
})();
