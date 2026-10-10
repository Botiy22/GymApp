/* Personal milestones use completed working sets; private nutrition stays local. */
window.Profile = (() => {
  const badges = [
    {id:'five',icon:'shield',en:'Five strong',hu:'Ötös lendület',enHint:'Log five workouts with working sets.',huHint:'Naplózz öt edzést munkasorozatokkal.'},
    {id:'cardio',icon:'sun',en:'On the move',hu:'Mozgásban',enHint:'Log your first cardio session.',huHint:'Naplózd az első kardióedzésed.'},
    {id:'checkins',icon:'compass',en:'Keep showing up',hu:'Újra és újra',enHint:'Complete workouts on three different days, including check-ins.',huHint:'Teljesíts edzést három különböző napon, pipával is.'},
    {id:'food',icon:'diamond',en:'Food rhythm',hu:'Étkezési ritmus',enHint:'Log meals on seven different days.',huHint:'Naplózz étkezést hét különböző napon.'},
    {id:'first',icon:'spark',en:'First rep',hu:'Első ismétlés',enHint:'Log your first workout with working sets.',huHint:'Naplózd az első edzést munkasorozatokkal.'},
    {id:'ten',icon:'shield',en:'Finding rhythm',hu:'Megvan a ritmus',enHint:'Complete 10 logged workouts.',huHint:'Naplózz 10 teljes edzést.'},
    {id:'fifty',icon:'crown',en:'Built to last',hu:'Kitartásból jeles',enHint:'Complete 50 logged workouts.',huHint:'Naplózz 50 teljes edzést.'},
    {id:'days',icon:'sun',en:'Showing up',hu:'Mindig ott vagy',enHint:'Train on 7 different days.',huHint:'Eddz 7 különböző napon.'},
    {id:'volume',icon:'weight',en:'Hundred-ton club',hu:'Száztonnás klub',enHint:'Log 100,000 kg of working-set volume.',huHint:'Naplózz 100 000 kg összterhelést munkasorozatokból.'},
    {id:'bench',icon:'diamond',en:'Triple digits',hu:'Három számjegy',enHint:'Bench press 100 kg in a working set.',huHint:'Nyomj fekve 100 kg-ot egy munkasorozatban.'},
    {id:'balance',icon:'compass',en:'Four foundations',hu:'Négy alappillér',enHint:'Reach Spark in all four tracked lifts.',huHint:'Érd el a Szikra rangot mind a négy alapgyakorlatban.'}
  ];
  const date = ms => { return new Date(ms).toISOString().slice(0,10); };
  const sets = w => w.tick ? [] : (w.entries||[]).flatMap(e=>(e.sets||[]).filter(s=>!s.w && Number(s.reps)>=1 && Number(s.reps)<=1000 && Number(s.kg)>=0 && Number(s.kg)<=2000));
  function summary(workouts, now=Date.now(),food={}) {
    const logs=(workouts||[]).filter(w=>Number(w.end)>0&&Number(w.start)>0&&Number(w.start)<=now&&Number(w.end)>=Number(w.start)&&Number(w.end)<=now&&sets(w).length);
    const days=new Set(logs.map(w=>date(w.start))),volume=logs.reduce((n,w)=>n+sets(w).reduce((a,s)=>a+Number(s.kg)*Number(s.reps),0),0);
    const ranks=StrengthRanks.summary(logs),highest=Math.max(-1,...ranks.map(r=>r.tier));
    const valid=(workouts||[]).filter(w=>Number(w.start)>0&&Number(w.start)<=now&&Number(w.end)>=Number(w.start)&&Number(w.end)<=now);
    const cardio=w=>(w.cardio||[]).some(c=>Number(c.minutes)>=1&&Number(c.minutes)<=480&&Number(c.weight)>=30&&Number(c.weight)<=300);
    const attendance=new Set(valid.filter(w=>sets(w).length||(w.tick&&w.pl?.some(e=>typeof e.ex==='string'&&e.ex))||cardio(w)).map(w=>date(w.start)));
    const mealDays=Object.entries(food||{}).filter(([day,meals])=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&day<=date(now)&&Array.isArray(meals)&&meals.some(f=>f.id&&Number(f.kcal)>=1&&Number(f.kcal)<=20000)).length;
    const earned=[logs.length>=5,valid.some(cardio),attendance.size>=3,mealDays>=7,logs.length>=1,logs.length>=10,logs.length>=50,days.size>=7,volume>=100000,ranks.find(r=>r.id==='bench').best>=100,ranks.every(r=>r.tier>=3)];
    const start=new Date(now);start.setUTCHours(0,0,0,0);start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);
    const week=logs.filter(w=>Number(w.start)>=start.getTime());
    // Consistency is capped at one session per day; working sets at 20 per day.
    const daily=new Map();week.forEach(w=>daily.set(date(w.start),(daily.get(date(w.start))||0)+sets(w).length));
    const score=Array.from(daily.values()).reduce((n,count)=>n+100+Math.min(count,20)*5,0);
    return {workouts:logs.length,days:days.size,volume,ranks,highest,weekDays:daily.size,weekSets:week.reduce((n,w)=>n+sets(w).length,0),score,badges:badges.map((b,i)=>({...b,earned:earned[i]}))};
  }
  const image=(value,max)=>typeof value==='string'&&value.length<=max&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)?value:'';
  function clean(value) {
    const v=value&&typeof value==='object'?value:{};
    const text=(key,max)=>typeof v[key]==='string'?v[key].trim().slice(0,max):'';
    const username=text('username',24).toLowerCase();
    return {username:/^[a-z0-9_]{3,24}$/.test(username)?username:'',displayName:text('displayName',40),bio:text('bio',160),avatar:typeof v.avatar==='string'&&v.avatar.length<=90000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v.avatar)?v.avatar:'',coverPhoto:image(v.coverPhoto,240000),theme:(['mint','violet','amber','slate'].includes(v.theme)||/^hue_(?:[0-9]|[1-9][0-9]|[12][0-9]{2}|3[0-5][0-9])$/.test(v.theme))?v.theme:'mint',showcase:Array.isArray(v.showcase)?Array.from(new Set(v.showcase.filter(id=>badges.some(b=>b.id===id)))).slice(0,4):[]};
  }
  function cleanStyle(value){
    const v=value&&typeof value==='object'?value:{};
    return {cover:['glow','mesh','stripe','clean','grid','orbit','horizon','photo'].includes(v.cover)?v.cover:'glow',frame:['soft','round','ring'].includes(v.frame)?v.frame:'soft',useAccent:v.useAccent===true};
  }
  function symbol(kind) {
    const paths={spark:'M13 3 5 13h6l-1 8 9-12h-6z',shield:'M12 3 20 7v6c0 5-8 9-8 9s-8-4-8-9V7z M8 12l3 3 5-6',crown:'M4 7l4 4 4-7 4 7 4-4-2 12H6z M8 22h8',sun:'M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',weight:'M5 8h14l2 13H3z M9 8V5a3 3 0 0 1 6 0v3 M9 14h6',diamond:'M12 3 21 12 12 21 3 12z M12 7v10 M8 12h8',compass:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M16 8l-3 5-5 3 3-5z'};
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[kind]||paths.spark)+'"/>'+ (kind==='sun'?'<circle cx="12" cy="12" r="4"/>':'')+'</svg>';
  }
  function dial(consumed,goal,label) {
    const ratio=goal>0?Math.min(1,Math.max(0,consumed/goal)):0;
    return '<svg class="calorie-dial" viewBox="0 0 280 280" role="img" aria-label="'+label.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'"><circle class="dial-disc" cx="140" cy="140" r="101"/>'+Array.from({length:60},(_,i)=>{const a=i*6*Math.PI/180-Math.PI/2,r=i%5===0?112:119;return '<line class="dial-tick'+(i<ratio*60?' filled':'')+'" x1="'+(140+Math.cos(a)*r)+'" y1="'+(140+Math.sin(a)*r)+'" x2="'+(140+Math.cos(a)*130)+'" y2="'+(140+Math.sin(a)*130)+'"/>';}).join('')+'</svg>';
  }
  return {supportsHue:true,coverPhotos:true,badges,summary,clean,cleanStyle,symbol,dial};
})();
