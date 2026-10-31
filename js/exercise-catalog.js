/* The active collection is a deliberate, reversible choice. The old dataset is
   lookup-only: saved workouts and shared plans must never lose their IDs. */
(function(root){
  if(root.ExerciseCatalog)return;
  const ACTIVE_CATALOG = 'curated'; // Change to 'legacy' to restore the old browse catalogue.
  const legacy=root.EXERCISES.slice(),curated=root.CURATED_EXERCISES;
  const byId=Object.fromEntries(legacy.map(e=>[e.id,e]));
  for(const e of curated)byId[e.id]=e;
  const base=ACTIVE_CATALOG==='curated'?curated:legacy;
  function forData(data){
    const out=base.slice(),ids=new Set(out.map(e=>e.id));
    const add=id=>{if(byId[id]&&!ids.has(id)){out.push(byId[id]);ids.add(id);}};
    // Only this user's saved/imported/copied plans; no account-wide data enumeration.
    for(const r of data.routines||[])for(const i of r.items||[])add(i.ex);
    for(const i of data.active?.entries||[])add(i.ex);
    for(const id of data.favEx||[])add(id);
    for(const e of data.myEx||[]){if(ids.has(e.id))continue;out.push({id:e.id,n:e.n,p:e.p||[],s:e.s||[],eq:e.eq||'other',c:'strength',lv:'',m:'',f:'',i:e.steps||[],k:0,own:true,img:e.img,vid:e.vid});ids.add(e.id);}
    return out;
  }
  root.LEGACY_EXERCISES=legacy;
  root.EXERCISES=base.slice();
  root.ExerciseCatalog={version:1,active:ACTIVE_CATALOG,base,byId,forData};
})(globalThis);
