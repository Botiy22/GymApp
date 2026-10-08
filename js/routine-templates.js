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
  const templates=[
    {id:'full3',name:{hu:'3 nap · Teljes test',en:'3-day · Full body'},icon:'full',days:full,schedule:{hu:'Hétfő · Szerda · Péntek',en:'Mon · Wed · Fri'},hint:{hu:'Kiegyensúlyozott kezdőpont heti három edzéshez.',en:'A balanced starting point for three weekly sessions.'}},
    {id:'ul4',name:{hu:'4 nap · Felső / Alsó',en:'4-day · Upper / Lower'},icon:'upper',days:[upper(),lower(),{...upper(),name:{hu:'Felsőtest B',en:'Upper B'}},{...lower(),name:{hu:'Alsótest B',en:'Lower B'}}],schedule:{hu:'Hétfő · Kedd · Csütörtök · Péntek',en:'Mon · Tue · Thu · Fri'},hint:{hu:'Két felső- és két alsótestnap, köztes pihenővel.',en:'Two upper and two lower sessions, with a midweek break.'}},
    {id:'ulppl5',name:{hu:'5 nap · Felső / Alsó + PPL',en:'5-day · Upper / Lower + PPL'},icon:'full',days:[upper(),lower(),push(),pull(),legs()],schedule:{hu:'Hétfő · Kedd · Csütörtök · Péntek · Szombat',en:'Mon · Tue · Thu · Fri · Sat'},hint:{hu:'Felső/alsó napok, majd Push, Pull és Láb.',en:'Upper/lower sessions followed by push, pull and legs.'}},
    {id:'ppl6',name:{hu:'6 nap · Push / Pull / Láb',en:'6-day · Push / Pull / Legs'},icon:'push',days:repeat([push(),pull(),legs()]),schedule:{hu:'Hétfőtől szombatig · Vasárnap pihenő',en:'Mon–Sat · Rest Sunday'},hint:{hu:'Magasabb gyakoriság; akkor válaszd, ha jól regenerálódsz.',en:'Higher frequency for lifters who recover well between sessions.'}},
    {id:'arnold6',name:{hu:'6 nap · Arnold ihlette',en:'6-day · Arnold-inspired'},icon:'arms',days:repeat([chestBack(),shouldersArms(),legs()]),schedule:{hu:'Hétfőtől szombatig · Vasárnap pihenő',en:'Mon–Sat · Rest Sunday'},hint:{hu:'Mell/hát, váll/kar, láb — kétszer. Saját, mérsékelt volumenű változat.',en:'Chest/back, shoulders/arms, legs — twice. Our own moderate-volume adaptation.'}}
  ];
  return {templates};
})();
