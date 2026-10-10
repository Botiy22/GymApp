/* Self-reported consistency points, separate from strength ranks and calorie targets. */
window.Competition=(()=>{
 const day=ms=>new Date(ms).toISOString().slice(0,10);
 const number=v=>{const s=String(v??'');return /^[0-9]{1,13}(\.[0-9]{1,4})?$/.test(s)?Number(s):0;};
 const array=v=>Array.isArray(v)?v:[];
 const tiers=[{min:0,en:'Starting',hu:'Indulás'},{min:100,en:'In motion',hu:'Lendületben'},{min:300,en:'Finding rhythm',hu:'Megvan a ritmus'},{min:600,en:'Consistent',hu:'Kitartó'},{min:900,en:'Driven',hu:'Elszánt'},{min:1200,en:'Momentum',hu:'Megállíthatatlan'}];
 const rank=score=>tiers.filter(t=>t.min<=score).at(-1)||tiers[0];
 function week(data,now=Date.now()){
  const start=new Date(now);start.setUTCHours(0,0,0,0);start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);
  const days=new Map(),meals=new Map(),first=day(+start),last=day(now);
  for(const w of array(data.workouts)){
   const begun=number(w?.start),end=number(w?.end);if(begun<+start||begun>now||end<begun||end>now)continue;
   const sets=w.tick===true?0:array(w.entries).reduce((n,e)=>n+array(e?.sets).filter(s=>s?.w!==true&&number(s?.reps)>=1&&number(s?.reps)<=1000&&number(s?.kg)<=2000).length,0);
   const tick=w.tick===true&&array(w.pl).some(i=>/^[A-Za-z0-9_-]{1,90}$/.test(i?.ex||'')&&number(i?.n)>=1&&number(i?.n)<=12);
   const cardio=w.tick!==true&&array(w.cardio).some(c=>number(c?.minutes)>=1&&number(c?.minutes)<=480&&number(c?.weight)>=30&&number(c?.weight)<=300);
   if(sets||tick||cardio)days.set(day(begun),(days.get(day(begun))||0)+sets);
  }
  for(const [d,entries] of Object.entries(data.food||{})){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||d<first||d>last)continue;
   const ids=new Set(array(entries).filter(f=>number(f?.kcal)>=1&&number(f?.kcal)<=20000&&String(f?.id||'').length>0).map(f=>String(f.pm||f.id)));
   if(ids.size)meals.set(d,Math.min(3,ids.size));
  }
  const attendance_points=days.size*100,set_points=[...days.values()].reduce((n,s)=>n+Math.min(20,s)*5,0),meal_points=[...meals.values()].reduce((n,m)=>n+m*20,0);
  const score=attendance_points+set_points+meal_points;
  return {score,days:days.size,sets:[...days.values()].reduce((a,b)=>a+b,0),attendance_points,set_points,workout_points:attendance_points+set_points,meal_points,meal_days:meals.size,rank:rank(score)};
 }
 return {week,rank,tiers};
})();
