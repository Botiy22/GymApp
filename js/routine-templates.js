/* Optional, original starter workouts using established split structures.
   Adding a template creates ordinary editable routines; no schedule is imposed. */
window.RoutineTemplates=(()=>{
  const item=(ex,sets=3,reps='8–12',rest=90)=>({ex,label:null,sets,reps,rest});
  const bench='Barbell_Bench_Press_-_Medium_Grip',squat='Barbell_Full_Squat',rdl='Romanian_Deadlift',row='Seated_Cable_Rows',lat='Wide-Grip_Lat_Pulldown',press='Dumbbell_Shoulder_Press',raise='Side_Lateral_Raise',curl='Barbell_Curl',tri='Triceps_Pushdown',calf='Standing_Calf_Raises',legcurl='Lying_Leg_Curls';
  const day=(hu,en,icon,items)=>({name:{hu,en},icon,items});
  const upper=()=>day('Felsőtest','Upper','upper',[item(bench,3,'6–10',150),item(row,3,'8–12',120),item(press,2,'8–12',120),item(lat,3,'8–12',120),item(curl,2,'10–15'),item(tri,2,'10–15')]);
  const lower=()=>day('Alsótest','Lower','lower',[item(squat,3,'6–10',180),item(rdl,3,'8–10',150),item('Leg_Press',2,'10–15',120),item(legcurl,2,'10–15'),item(calf,3,'12–20'),item('Crunches',2,'12–20',60)]);
  const push=()=>day('Push','Push','push',[item(bench,3,'6–10',150),item('Incline_Dumbbell_Press',3,'8–12',120),item(press,2,'8–12',120),item(raise,3,'12–20',60),item(tri,3,'10–15')]);
  const pull=()=>day('Pull','Pull','pull',[item(lat,3,'8–12',120),item(row,3,'8–12',120),item('Leverage_Iso_Row',2,'10–12',120),item('Face_Pull',3,'12–20',60),item(curl,3,'10–15')]);
  const legs=()=>day('Láb','Legs','legs',[item(squat,3,'6–10',180),item(rdl,3,'8–10',150),item('Dumbbell_Lunges',2,'8–12',120),item(legcurl,3,'10–15'),item(calf,3,'12–20')]);
  const full=[
    day('Teljes test A','Full body A','full',[item(squat,3,'6–10',180),item(bench,3,'6–10',150),item(row,3,'8–12',120),item(legcurl,2,'10–15'),item(raise,2,'12–20',60),item('Crunches',2,'12–20',60)]),
    day('Teljes test B','Full body B','full',[item(rdl,3,'8–10',150),item(press,3,'8–12',120),item(lat,3,'8–12',120),item('Dumbbell_Lunges',2,'8–12',120),item(curl,2,'10–15'),item(calf,2,'12–20')]),
    day('Teljes test C','Full body C','full',[item('Leg_Press',3,'10–15',120),item('Incline_Dumbbell_Press',3,'8–12',120),item('Leverage_Iso_Row',3,'8–12',120),item(legcurl,2,'10–15'),item(tri,2,'10–15'),item('Hanging_Leg_Raise',2,'10–15',60)])
  ];
  const chestBack=()=>day('Mell és hát','Chest & back','upper',[item(bench,3,'6–10',150),item(lat,3,'8–12',120),item('Incline_Dumbbell_Press',3,'8–12',120),item(row,3,'8–12',120),item('Dumbbell_Flyes',2,'10–15')]);
  const shouldersArms=()=>day('Váll és kar','Shoulders & arms','arms',[item(press,3,'8–12',120),item(raise,3,'12–20',60),item('Face_Pull',2,'12–20',60),item(curl,3,'10–15'),item(tri,3,'10–15')]);
  const repeat=(days)=>days.concat(days.map(d=>({...d,name:{hu:d.name.hu+' B',en:d.name.en+' B'},items:d.items.map(x=>({...x}))})));
  const legacyTemplates=[
    {id:'full3',name:{hu:'3 nap · Teljes test',en:'3-day · Full body'},icon:'full',days:full,schedule:{hu:'Hétfő · Szerda · Péntek',en:'Mon · Wed · Fri'},hint:{hu:'Kiegyensúlyozott kezdőpont heti három edzéshez.',en:'A balanced starting point for three weekly sessions.'}},
    {id:'ul4',name:{hu:'4 nap · Felső / Alsó',en:'4-day · Upper / Lower'},icon:'upper',days:[upper(),lower(),{...upper(),name:{hu:'Felsőtest B',en:'Upper B'}},{...lower(),name:{hu:'Alsótest B',en:'Lower B'}}],schedule:{hu:'Hétfő · Kedd · Csütörtök · Péntek',en:'Mon · Tue · Thu · Fri'},hint:{hu:'Két felső- és két alsótestnap, köztes pihenővel.',en:'Two upper and two lower sessions, with a midweek break.'}},
    {id:'ulppl5',name:{hu:'5 nap · Felső / Alsó + PPL',en:'5-day · Upper / Lower + PPL'},icon:'full',days:[upper(),lower(),push(),pull(),legs()],schedule:{hu:'Hétfő · Kedd · Csütörtök · Péntek · Szombat',en:'Mon · Tue · Thu · Fri · Sat'},hint:{hu:'Felső/alsó napok, majd Push, Pull és Láb.',en:'Upper/lower sessions followed by push, pull and legs.'}},
    {id:'ppl6',name:{hu:'6 nap · Push / Pull / Láb',en:'6-day · Push / Pull / Legs'},icon:'push',days:repeat([push(),pull(),legs()]),schedule:{hu:'Hétfőtől szombatig · Vasárnap pihenő',en:'Mon–Sat · Rest Sunday'},hint:{hu:'Magasabb gyakoriság; akkor válaszd, ha jól regenerálódsz.',en:'Higher frequency for lifters who recover well between sessions.'}},
    {id:'arnold6',name:{hu:'6 nap · Arnold ihlette',en:'6-day · Arnold-inspired'},icon:'arms',days:repeat([chestBack(),shouldersArms(),legs()]),schedule:{hu:'Hétfőtől szombatig · Vasárnap pihenő',en:'Mon–Sat · Rest Sunday'},hint:{hu:'Mell/hát, váll/kar, láb — kétszer. Saját, mérsékelt volumenű változat.',en:'Chest/back, shoulders/arms, legs — twice. Our own moderate-volume adaptation.'}}
  ];
  // Keep the previous starters for a conservative upgrade of untouched saved copies.
  const additions={upper:[raise],lower:['Hanging_Leg_Raise'],push:['Dumbbell_Flyes','Cable_Rope_Overhead_Triceps_Extension'],pull:['Incline_Dumbbell_Curl','Crunches'],legs:['Leg_Press','Hanging_Leg_Raise'],arms:['Incline_Dumbbell_Curl','Cable_Rope_Overhead_Triceps_Extension']};
  const fullExtras=['Triceps_Pushdown','Crunches','Side_Lateral_Raise'];
  const templates=legacyTemplates.map(p=>({...p,days:p.days.map((d,n)=>{
    const extras=d.icon==='full'?[fullExtras[n]]:d.name.en.startsWith('Chest & back')?['Face_Pull','Straight-Arm_Pulldown']:additions[d.icon];
    return {...d,items:d.items.concat(extras.map(ex=>item(ex))).map(i=>({...i,sets:3,rest:Math.max(i.rest,120)}))};
  })}));
  /* 2.59: more ready-made workouts, built only from exercises that have the library's own drawings. Added as written
     (no automatic extras), so short sessions stay short. */
  const splitCount=templates.length;
  templates.push(
    {id:'machines2',name:{hu:'Kezdő · Gépeken',en:'Beginner · Machines'},icon:'full',schedule:{hu:'Heti 2–3 alkalom, felváltva',en:'2–3 times a week, alternating'},hint:{hu:'Vezetett mozgások, könnyen beállítható súly: jó első hetekre.',en:'Guided movements and easy weight changes: good for the first weeks.'},days:[
      day('Gépek A','Machines A','full',[item('Leg_Press',3,'10–12',120),item('Leverage_Chest_Press',3,'10–12',120),item('Wide-Grip_Lat_Pulldown',3,'10–12',120),item('Seated_Leg_Curl',2,'12–15'),item('Machine_Lateral_Raise',2,'12–15',60),item('Ab_Crunch_Machine',2,'12–15',60)]),
      day('Gépek B','Machines B','full',[item('Hack_Squat',3,'10–12',120),item('Seated_Cable_Rows',3,'10–12',120),item('Butterfly',3,'12–15'),item('Leg_Extensions',2,'12–15'),item('Reverse_Machine_Flyes',2,'12–15',60),item('Seated_Calf_Raise',2,'12–20',60)])]},
    {id:'dumbbell3',name:{hu:'Otthon · Kézisúlyzóval',en:'Home · Dumbbells'},icon:'upper',schedule:{hu:'Heti 3 alkalom, egy-egy pihenőnappal',en:'3 times a week with a rest day between'},hint:{hu:'Csak kézisúlyzó és egy pad kell hozzá.',en:'Needs only dumbbells and a bench.'},days:[
      day('Nyomás','Push','push',[item('Dumbbell_Bench_Press',3,'8–12',120),item('Arnold_Dumbbell_Press',3,'8–12',120),item('Dumbbell_Flyes',2,'10–15'),item('Side_Lateral_Raise',3,'12–20',60),item('Tricep_Dumbbell_Kickback',3,'10–15',60)]),
      day('Húzás','Pull','pull',[item('One-Arm_Dumbbell_Row',3,'8–12',120),item('Bent-Arm_Dumbbell_Pullover',3,'10–12'),item('Seated_Bent-Over_Rear_Delt_Raise',3,'12–15',60),item('Hammer_Curls',3,'10–12',60),item('Dumbbell_Shrug',2,'12–15',60)]),
      day('Láb és törzs','Legs & core','legs',[item('Goblet_Squat',3,'10–12',120),item('Dumbbell_Romanian_Deadlift',3,'8–12',120),item('Split_Squat_with_Dumbbells',2,'8–12',120),item('Dumbbell_Step_Ups',2,'10–12'),item('Suitcase_Carry',2,'30–40 m',60)])]},
    {id:'bodyweight2',name:{hu:'Saját testsúly',en:'Bodyweight'},icon:'full',schedule:{hu:'Heti 2–4 alkalom, felváltva',en:'2–4 times a week, alternating'},hint:{hu:'Eszköz nélkül; a B naphoz húzódzkodórúd kell.',en:'No equipment; day B needs a pull-up bar.'},days:[
      day('Testsúly A','Bodyweight A','full',[item('Pushups',3,'8–15'),item('Incline_Push-Up',2,'10–15'),item('Plank',3,'30–45 s',60),item('Reverse_Crunch',3,'10–15',60),item('Air_Bike',2,'15–20',60)]),
      day('Testsúly B','Bodyweight B','full',[item('Chin-Up',3,'4–8',120),item('Decline_Push-Up',3,'8–12'),item('Hanging_Leg_Raise',3,'8–12',60),item('Side_Bridge',2,'20–30 s',60),item('Crunches',2,'15–20',60)])]},
    {id:'glutes2',name:{hu:'Farizom és láb',en:'Glutes & legs'},icon:'lower',schedule:{hu:'Heti 2 alkalom, legalább 2 nap különbséggel',en:'Twice a week, at least 2 days apart'},hint:{hu:'Csípőemelés, felhúzás és egylábas gyakorlatok.',en:'Hip thrusts, hinges and single-leg work.'},days:[
      day('Farizom A','Glutes A','lower',[item('Barbell_Hip_Thrust',3,'8–12',150),item('Romanian_Deadlift',3,'8–10',150),item('Split_Squat_with_Dumbbells',3,'8–12',120),item('Thigh_Abductor',3,'12–20',60),item('Seated_Leg_Curl',2,'10–15')]),
      day('Farizom B','Glutes B','lower',[item('Machine_Hip_Thrust',3,'10–15',120),item('B_Stance_Dumbbell_RDL',3,'8–12',120),item('Dumbbell_Step_Ups',3,'10–12'),item('Barbell_Glute_Bridge',2,'12–15'),item('Hyperextensions_Back_Extensions',2,'12–15',60)])]},
    {id:'quick30',name:{hu:'Gyors 30 perc',en:'Quick 30 minutes'},icon:'full',schedule:{hu:'Amikor kevés az időd',en:'When you are short on time'},hint:{hu:'Négy nagy gyakorlat, rövid pihenőkkel.',en:'Four big movements with short rests.'},days:[
      day('Gyors A','Quick A','full',[item('Goblet_Squat',3,'10–12',75),item('Dumbbell_Bench_Press',3,'8–12',75),item('Seated_Cable_Rows',3,'10–12',75),item('Plank',2,'30–45 s',45)]),
      day('Gyors B','Quick B','full',[item('Leg_Press',3,'10–12',75),item('Wide-Grip_Lat_Pulldown',3,'10–12',75),item('Dumbbell_Shoulder_Press',3,'8–12',75),item('Reverse_Crunch',2,'12–15',45)])]},
    {id:'core1',name:{hu:'Törzs · 15 perc',en:'Core · 15 minutes'},icon:'full',schedule:{hu:'Bármelyik edzés végére vagy külön',en:'After any workout or on its own'},hint:{hu:'Has, oldalsó törzs és derék röviden.',en:'Abs, obliques and lower back in a short block.'},days:[
      day('Törzs','Core','full',[item('Plank',3,'30–45 s',45),item('Reverse_Crunch',3,'12–15',45),item('Side_Bridge',2,'20–30 s',45),item('Air_Bike',2,'15–20',45),item('Hyperextensions_Back_Extensions',2,'12–15',45)])]}
  );
  const isComplex=r=>r.id==='clip_centr10'||r.id==='clip_lat_grips';
  // Approximate session time: 12 min preparation, 2 min per equipment change,
  // 45 sec per working set, programmed rest only BETWEEN sets (including zero).
  const durationMinutes=r=>(720+Math.max(0,r.items.length-1)*120+r.items.reduce((s,i)=>s+i.sets*45+Math.max(0,i.sets-1)*(i.rest??90),0))/60;
  const estimateMinutes=r=>Math.round(durationMinutes(r)/5)*5;
  function upgradeRoutines(routines){
    let changed=false;
    const result=routines.map(r=>{
      if(!/^t[a-z0-9]+_\d+$/.test(r.id)||r.opt||r.circuit)return r;
      for(let k=0;k<legacyTemplates.length;k++){
        const p=legacyTemplates[k];
        if(r.sub?.hu!==p.name.hu||r.sub?.en!==p.name.en)continue;
        const n=p.days.findIndex(d=>r.icon===d.icon&&r.name?.hu===p.name.hu+' · '+d.name.hu&&r.name?.en===p.name.en+' · '+d.name.en);
        if(n<0)continue;
        const old=p.days[n].items;
        if(r.items.length!==old.length||!r.items.every((i,j)=>!i.label&&!i.rir&&!i.note&&Object.keys(i).every(k=>['ex','label','sets','reps','rest'].includes(k))&&['ex','sets','reps','rest'].every(k=>i[k]===old[j][k])))return r;
        changed=true;return {...r,items:templates[k].days[n].items.map(i=>({...i}))};
      }
      return r;
    });
    return changed?result:routines;
  }
  return {genericFiveDay:true,splitCount,templates,isComplex,durationMinutes,estimateMinutes,upgradeRoutines};
})();
