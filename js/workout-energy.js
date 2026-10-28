/* Estimated active energy above resting expenditure; never inferred from kg lifted. */
globalThis.WorkoutEnergy = (() => {
  'use strict';
  const types=['walk','incline','run','stairs','cycle','elliptical','swim'];
  // Swimming METs, Compendium of Physical Activities 2024 (pacompendium.com, water activities):
  // [recreational, training/fast] freestyle 18240 5.8 / 18230 9.8, breaststroke 18265 5.3 / 18260 10.3,
  // backstroke 18255 4.8 / 18250 9.5, butterfly 18270 13.8; "mixed" is the mean of the first three.
  const SWIM_MET={free:[5.8,9.8],breast:[5.3,10.3],back:[4.8,9.5],fly:[13.8,13.8],mixed:[5.3,9.87]},STROKES=Object.keys(SWIM_MET);
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
    if(type==='swim') {
      const pool=numeric(value.pool),laps={};let total=0;
      if(!valid(pool,10,100))return null;
      for(const k of STROKES){const v=numeric(value.laps&&value.laps[k]);if(Number.isFinite(v)&&v>0){if(!Number.isInteger(v)||v>999)return null;laps[k]=v;total+=v;}}
      const metres=total*pool;
      if(!total||metres/minutes>130||metres/minutes<3)return null;              // faster than a world-class sprint or barely moving: a typo
      c.pool=Math.round(pool*10)/10;c.laps=laps;
    }
    const wear=cleanWear(value.wear);if(wear)c.wear=wear;
    if(typeof value.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value.id))c.id=value.id;
    return c;
  }
  // Data a smartwatch measured (js/wearable.js). Its active energy replaces the estimate.
  function cleanWear(w) {
    if(!w||typeof w!=='object'||w.src!=='watch')return null;
    const o={src:'watch'},kc=numeric(w.kcal),st=numeric(w.strokes);
    if(valid(kc,0,10000))o.kcal=Math.round(kc);if(valid(st,0,100000))o.strokes=Math.round(st);
    if(typeof w.device==='string'&&w.device.trim())o.device=w.device.replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,60);
    if(w.hr&&typeof w.hr==='object'){const a=numeric(w.hr.avg),m=numeric(w.hr.max),hr={};if(valid(a,25,250))hr.avg=Math.round(a);if(valid(m,25,250))hr.max=Math.round(m);if(hr.avg||hr.max)o.hr=hr;}
    return o;
  }
  function swim(value) {                                      // distance, pace and the stroke-weighted MET of a swim entry
    const c=value&&value.type==='swim'&&value.laps?value:null;if(!c)return null;
    const total=STROKES.reduce((n,k)=>n+(c.laps[k]||0),0);if(!total)return null;
    const lvl=c.intensity==='vigorous'?1:0,met=STROKES.reduce((n,k)=>n+(c.laps[k]||0)*SWIM_MET[k][lvl],0)/total,metres=total*c.pool;
    return {lengths:total,metres:Math.round(metres),pace:metres>0?Math.round(c.minutes*60/metres*100):0,met:Math.round(met*100)/100};
  }
  const kcal=(met,weight,minutes)=>Math.round(Math.max(0,met-1)*3.5*weight/200*minutes);
  function strength(value) {
    const e=cleanStrength(value);return e?kcal(e.intensity==='vigorous'?6:3.5,e.weight,e.minutes):null;
  }
  function cardio(value) {
    const c=cleanCardio(value);if(!c)return null;
    if(c.wear&&c.wear.kcal!=null)return c.wear.kcal;
    let met;
    if(c.type==='swim')met=swim(c).met;
    else if(['walk','incline','run'].includes(c.type)) {
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
  return {types,STROKES,SWIM_MET,cleanStrength,cleanCardio,cleanWear,swim,strength,cardio,workout,daily,budget};
})();
