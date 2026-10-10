/* Public templates are deliberately separate from private workout records and exercise photos. */
window.RoutineShare=(()=>{
 const text=(v,n)=>String(v||'').trim().slice(0,n);
 const pair=(v,lang)=>typeof v==='string'?v:v?.[lang]||v?.en||v?.hu||'';
 function pack(r,data,lang){
  const items=r.items.map(i=>({ex:i.ex,label:text(pair(i.label,lang),120),sets:i.sets,reps:i.reps,rest:i.rest,rir:text(i.rir,8)}));
  const ids=new Set(items.map(i=>i.ex));
  return {version:1,routine:{name:text(pair(r.name,lang),80),icon:r.icon,circuit:!!r.circuit,items},myEx:data.myEx.filter(e=>ids.has(e.id)).map(e=>({id:e.id,n:e.n,p:e.p,s:e.s,eq:e.eq,steps:e.steps}))};
 }
 function copy(snapshot,data,known,newId){
  if(snapshot?.version!==1||!Array.isArray(snapshot.routine?.items)||!snapshot.routine.items.length)throw new Error('routine_unavailable');
  const defs=snapshot.myEx||[],map=new Map();
  if(data.routines.length>=100||data.myEx.length+defs.length>300)throw new Error('copy_limit');
  const custom=defs.map(e=>{const id='my_'+newId();map.set(e.id,id);return {...e,id,img:'',vid:'',t:Date.now()};});
  const items=snapshot.routine.items.map(i=>{const ex=map.get(i.ex)||i.ex;if(!map.has(i.ex)&&!known[i.ex])throw new Error('exercise_unavailable');return {ex,label:i.label||null,sets:i.sets,reps:i.reps,rest:i.rest,rir:i.rir};});
  return {routine:{...snapshot.routine,id:newId(),builtin:false,items},custom};
 }
 return {pack,copy};
})();
