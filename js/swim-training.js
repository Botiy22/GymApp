/* Original pool-session builder and 2D swimming technique studies.
 * Evidence boundaries and references: docs/SWIMMING_GUIDANCE.md.
 * Durations are estimates; no breath-hold/oxygen-deprivation prescriptions. */
globalThis.SwimTraining = (() => {
  'use strict';
  const defaults={pool:25,minutes:45,pace:150,routine:'foundation',stroke:'free'};
  const routines={
    easy:{distance:50,rest:30,rpe:'2–3',factor:1.15},
    foundation:{distance:100,rest:25,rpe:'4–5',factor:1},
    intervals:{distance:50,rest:35,rpe:'6–7',factor:.9},
    breathing:{distance:50,rest:30,rpe:'2–3',factor:1.15}
  };
  const number=(v,min,max,f)=>Number.isFinite(+v)&&+v>=min&&+v<=max?+v:f;
  function clean(v={}){v=v&&typeof v==='object'?v:{};return {
    pool:Math.round(number(v.pool,10,100,25)*10)/10,
    minutes:Math.round(number(v.minutes,20,59,45)),pace:Math.round(number(v.pace,60,600,150)),
    routine:Object.hasOwn(routines,v.routine)?v.routine:'foundation',stroke:['free','breast','back'].includes(v.stroke)?v.stroke:'free'
  };}
  function plan(raw){
    const c=clean(raw),r=routines[c.routine],stroke=c.routine==='breathing'?'free':c.stroke;
    const block=(id,reps,lengths,rest,factor,rpe)=>({id,reps,lengths,rest,factor,rpe,stroke});
    const blocks=[block('warm',1,Math.max(1,Math.round(100/c.pool)),30,1.2,'2–3'),
      block('skill',2,1,30,1.25,'2–3'),
      block('main',1,Math.max(1,Math.round(r.distance/c.pool)),r.rest,r.factor,r.rpe),
      block('cool',1,Math.max(1,Math.round(50/c.pool)),0,1.2,'2–3')];
    // Rest after each repetition, including between blocks; cool-down has no rest.
    const duration=b=>b.reps*(b.lengths*c.pool/100*c.pace*b.factor+b.rest);
    const allowance=300,budget=c.minutes*60-allowance;
    const fixed=blocks.filter(b=>b.id!=='main').reduce((n,b)=>n+duration(b),0),main=blocks[2];
    const count=Math.floor((budget-fixed)/duration(main));
    if(count<1)return {config:c,stroke,blocks:[],fits:false,minimumMinutes:Math.ceil((fixed+duration(main)+allowance)/60)};
    main.reps=Math.min(count,40);
    blocks.forEach(b=>{b.metres=b.reps*b.lengths*c.pool;b.swimSeconds=b.metres/100*c.pace*b.factor;b.restSeconds=b.reps*b.rest;});
    const metres=blocks.reduce((n,b)=>n+b.metres,0),lengths=blocks.reduce((n,b)=>n+b.reps*b.lengths,0);
    const swimSeconds=blocks.reduce((n,b)=>n+b.swimSeconds,0),restSeconds=blocks.reduce((n,b)=>n+b.restSeconds,0);
    return {config:c,stroke,blocks,fits:true,metres,lengths,swimSeconds,restSeconds,allowance,elapsedSeconds:swimSeconds+restSeconds+allowance};
  }
  const text={
    en:{workouts:'Workouts',technique:'Technique',history:'History',title:'Your next swim',intro:'A pool session built around your time and pace.',pool:'Pool length',custom:'Custom',time:'Time available',pace:'Comfortable pace · seconds / 100 m',paceHint:'Use your moving pace, excluding rests. 150 seconds = 2:30 / 100 m.',stroke:'Stroke',free:'Freestyle',breast:'Breaststroke',back:'Backstroke',easy:'Easy return',foundation:'Aerobic base',intervals:'Controlled intervals',breathing:'Breathing skills',easySub:'Short repeats · generous recovery',foundationSub:'Steady repeats · sustainable effort',intervalsSub:'Brisk repeats · never all-out',breathingSub:'Relaxed exhalation · easy swimming',warm:'Warm-up',skill:'Technique',main:'Main set',cool:'Cool-down',length:'length',lengths:'lengths',rest:'rest after each repeat',min:'min',total:'total',inWater:'swimming',recovery:'rest',buffer:'buffer',effort:'Effort',effortHint:'RPE is perceived effort out of 10. Slow down or add rest if technique slips.',timing:'Estimated from your pace, including rests and a 5-minute buffer. At your time limit, finish with an easy length; skip remaining repeats.',meaning:'1 length = one end of the pool to the other. A return trip is 2 lengths.',log:'Review & log swim',logHint:'After swimming, check your actual lengths and active swimming time before saving. Planned work is not logged automatically.',tooShort:'This pool and pace need at least {n} minutes for the basic session. Increase the time, choose a shorter pool or work with a coach.',week:'Build a routine',weekText:'For swimmers already comfortable with a full pool length. Start with two non-consecutive easy or aerobic sessions per week. Once recovery and technique feel comfortable, make one session controlled intervals. Add one repeat at a time, within your time limit.',safety:'Breathing & hypoxic training',safeText:'Exhale gently underwater and inhale whenever you need to. Never hyperventilate or compete to hold your breath underwater: blackout can happen without warning. Swim where lifeguards are present. Specialist hypoxic training needs qualified in-person supervision; this plan uses normal breathing.',breathCue:'Breathe at a comfortable rhythm, often every 2 arm strokes. Try either side on separate repeats; never delay a needed breath.',skillCue:'One focus per repeat: long body line, then smooth hand entry. Keep breathing normally.',warmCue:'Easy pace. Settle into a comfortable breathing rhythm.',mainCue:'Keep the final repeat as tidy as the first. Rest starts when you reach the wall.',coolCue:'Relaxed swimming to finish.',sources:'Guidance & references',sourcesNote:'Workouts are app-designed examples using standard training principles, not individually prescribed or clinically validated programmes.',play:'Play',pause:'Pause',slow:'Slow',normal:'Normal',step:'Phase',diagram:'Simplified technique study',diagramNote:'Learn the movement pattern here. A swimming instructor can check your alignment and timing in the water.',arm:'Arm & hand',leg:'Legs & body',breath:'Breathing',top:'Hand-entry view · from above',topNote:'Enter in line with your shoulder. Avoid crossing the centre line. Fingers together and relaxed; direct pressure backwards.',activeTime:'For the calorie estimate, record active swimming minutes; leave out wall rests.',invalid:'Check the highlighted values.',poolHint:'Choose 25, 50, 75 or 100 m, or enter 10–100 m.',minutesLabel:'Time · minutes',hypoxLabel:'Normal breathing, not breath-holding',skillLink:'See technique',stop:'Stop if dizzy, unwell or unusually breathless. Rest as needed; the clock is not a target to force.'},
    hu:{workouts:'Edzések',technique:'Technika',history:'Napló',title:'A következő úszásod',intro:'Edzésterv a medencédhez, az idődhöz és a tempódhoz.',pool:'Medence hossza',custom:'Egyéni',time:'Rászánt idő',pace:'Kényelmes tempó · másodperc / 100 m',paceHint:'A pihenők nélküli úszótempód. 150 másodperc = 2:30 / 100 m.',stroke:'Úszásnem',free:'Gyors',breast:'Mell',back:'Hát',easy:'Könnyű visszatérés',foundation:'Állóképességi alap',intervals:'Tempós résztávok',breathing:'Légzéstechnika',easySub:'Rövid távok · több pihenő',foundationSub:'Egyenletes, tartható tempó',intervalsSub:'Lendületesen · nem teljes erőből',breathingSub:'Nyugodt kilégzés · könnyű úszás',warm:'Bemelegítés',skill:'Technika',main:'Fő rész',cool:'Levezetés',length:'hossz',lengths:'hossz',rest:'pihenő minden ismétlés után',min:'perc',total:'összesen',inWater:'úszás',recovery:'pihenő',buffer:'tartalék',effort:'Terhelés',effortHint:'Az RPE az érzékelt terhelés 10-es skálán. Ha romlik a technikád, lassíts vagy pihenj többet.',timing:'A tempódból becsült idő, pihenőkkel és 5 perc tartalékkal. Az időkeret végén egy könnyű hosszal vezess le; a hátralévő ismétléseket hagyd ki.',meaning:'1 hossz = a medence egyik végétől a másikig. Oda-vissza = 2 hossz.',log:'Átnézés és naplózás',logHint:'Úszás után ellenőrizd a tényleges hosszakat és az aktív úszásidőt. A terv nem kerül automatikusan a naplóba.',tooShort:'Ehhez a medencéhez és tempóhoz legalább {n} perc kell az alapedzéshez. Adj több időt, válassz rövidebb medencét, vagy kérj segítséget úszóedzőtől.',week:'Rendszeres úszás',weekText:'A tervhez már kényelmesen tudnod kell egy teljes hosszt úszni. Kezdj heti két, nem egymást követő könnyű vagy alapozó edzéssel. Ha a technikád és regenerációd rendben van, az egyik lehet tempós résztávos edzés. Egyszerre egy ismétléssel emelj, az időkereten belül.',safety:'Légzés és hipoxiás edzés',safeText:'Fújd ki finoman a levegőt a víz alatt, és vegyél levegőt, amikor szükséges. Ne hiperventillálj és ne versenyezz víz alatti levegő-visszatartással: az eszméletvesztés előjel nélkül is bekövetkezhet. Úszómesterrel felügyelt helyen ússz. A speciális hipoxiás edzés szakképzett, személyes felügyeletet igényel; ez a terv normál légzést használ.',breathCue:'Kényelmes ritmusban lélegezz, gyakran két karcsapásonként. Külön ismétlésekben próbálhatod a másik oldalt; ne halaszd el a szükséges levegővételt.',skillCue:'Ismétlésenként egy cél: előbb hosszú testhelyzet, majd sima kézbevitel. Lélegezz végig természetesen.',warmCue:'Kényelmes tempóval keresd meg a légzésed ritmusát.',mainCue:'Az utolsó ismétlés technikája is maradjon rendezett. A pihenő a falhoz érkezéskor indul.',coolCue:'Laza úszással fejezd be.',sources:'Útmutató és források',sourcesNote:'Az edzések általános edzéselvekre épülő, saját mintatervek; nem személyre szabott vagy klinikailag igazolt programok.',play:'Lejátszás',pause:'Szünet',slow:'Lassú',normal:'Normál',step:'Fázis',diagram:'Egyszerűsített mozgásbemutató',diagramNote:'Itt a mozgásmintát tanulhatod meg. A pontos testhelyzetet és időzítést úszóoktató ellenőrizheti a vízben.',arm:'Kar és kéz',leg:'Láb és testhelyzet',breath:'Légzés',top:'Kézbevitel · felülnézet',topNote:'A vállad vonalában érkezz a vízbe, ne a test középvonala elé. Az ujjak lazán egymás mellett vannak; hátrafelé fejts ki nyomást.',activeTime:'A kalóriabecsléshez az aktív úszás perceit add meg, a falnál töltött pihenő nélkül.',invalid:'Ellenőrizd a jelölt értékeket.',poolHint:'25, 50, 75 vagy 100 m, illetve egyénileg 10–100 m.',minutesLabel:'Idő · perc',hypoxLabel:'Természetes légzés, nem levegő-visszatartás',skillLink:'Technika megtekintése',stop:'Szédülés, rosszullét vagy szokatlan légszomj esetén állj meg. Pihenj, amikor szükséges; az időkeret nem kényszer.'}
  };
  const cues={
    free:{
      en:[['Entry','Fingertips enter ahead of the shoulder, not across the head. Reach forward just below the surface.','Look down; hips near the surface. Small alternating kicks start at the hips.','Exhale gently into the water.'],['Catch','Bend the elbow while the hand and forearm angle down, then face backwards. Keep the elbow higher than the hand.','Keep the trunk long; soft knees, relaxed ankles. Avoid a cycling kick.','Continue exhaling; do not hold your breath.'],['Push & turn','Press water backwards toward the hip. Do not push down to lift the head.','Rotate shoulders and hips together. Kick stays narrow.','Turn with the body to inhale at the side as the pulling arm finishes. One goggle stays near/in the water.'],['Recovery','Lead with a relaxed elbow above water; bring the hand forward. Enter in line with the shoulder again.','Keep the head low; avoid twisting only the neck.','Return the face before the recovering hand enters. Resume exhaling; breathe again whenever needed.']],
      hu:[['Kézbevitel','Az ujjbegyek a váll előtt érkeznek, nem a fej középvonala elé. Nyúlj előre, közvetlenül a felszín alatt.','Nézz lefelé, a csípő legyen a felszín közelében. Apró, váltott lábtempó indul a csípőből.','Finoman fújd ki a levegőt a vízbe.'],['Vízfogás','Hajlítsd a könyököt; a kéz és az alkar előbb lefelé, majd hátrafelé fordul. A könyök maradjon a kéznél magasabban.','Hosszú törzs, puha térd és laza boka. Ne kerékpározz a lábaddal.','Folytasd a kilégzést; ne tartsd vissza a levegőt.'],['Tolás és fordulás','Nyomd a vizet hátra, a csípő felé. Ne lefelé nyomva emeld ki a fejed.','A váll és a csípő együtt fordul. A lábtempó maradjon szűk.','A kartempó végén a testtel együtt fordulva vegyél levegőt oldalt. Az egyik szemüveglencse maradjon a víz közelében vagy benne.'],['Visszavitel','Laza könyökkel vezesd előre a kart a víz felett. A kéz ismét a váll vonalában érkezzen.','A fej maradjon alacsonyan; ne csak a nyakad csavard.','Az arc a kéz beérkezése előtt forduljon vissza. Fújd ki a levegőt; szükség szerint újra lélegezz.']]},
    breast:{
      en:[['Glide','Hands together, arms reaching forwards just below the surface.','Legs together and long; glide with a neutral head.','Exhale underwater.'],['Outsweep & catch','Turn palms slightly out, sweep a little wider than shoulders and bend elbows. Do not pull behind the shoulders.','Begin bringing heels toward the seat; keep knees about hip-width.','Let the chest rise with the catch; start a small forward breath.'],['In-sweep & breath','Bring hands together under the chin. Elbows draw inward, then hands shoot forward.','Turn toes out with flexed ankles; keep knees controlled.','Inhale as the mouth clears the surface; avoid throwing the head back.'],['Kick & streamline','Extend hands and arms forward as the face returns to the water.','Sweep feet out, back and together, then point toes and glide. Stop if the kick causes knee pain.','Exhale as you glide. Rhythm: pull, breathe, kick, glide.']],
      hu:[['Siklás','Kezek együtt, karok előrenyújtva közvetlenül a felszín alatt.','A lábak zártak és nyújtottak, a fej semleges helyzetben.','Fújd ki a levegőt a víz alatt.'],['Vízfogás','A tenyér kissé kifelé fordul, a kezek vállszélességen túl nyílnak, majd hajlik a könyök. Ne húzz a váll mögé.','A sarkak induljanak a far felé; a térdek körülbelül csípőszélességben.','A vízfogással emelkedő mellkast kövesd egy kis előre irányuló levegővétellel.'],['Befelé húzás','A kezek az áll alatt közelítenek. A könyök befelé zár, a kezek előreindulnak.','Visszafeszített bokával fordítsd kifelé a lábfejet; kontrolláld a térdet.','Amikor a száj kiér, vegyél levegőt; ne dobd hátra a fejed.'],['Lábtempó és siklás','Nyújtsd előre a kezeket, miközben az arc visszakerül a vízbe.','A lábfejek kifelé, hátra, majd össze zárnak; nyújtott lábfejjel sikolj. Térdfájdalom esetén hagyd abba.','Siklás közben kilégzés. Ritmus: húzás, légzés, rúgás, siklás.']]},
    back:{
      en:[['Entry','Enter little-finger first in line with the shoulder. Avoid crossing behind the head.','Look straight up; hips high. Small alternating kicks come from the hips.','Breathe continuously; the face stays above water.'],['Catch','Roll slightly onto the pulling side; bend the elbow underwater and face the palm towards the feet.','Keep the neck still as shoulders and hips roll together.','Use an easy rhythm; no breath-holding.'],['Push','Press water towards the feet, finishing the hand beside the thigh.','Soft knees; feet flick near the surface without high knee lifts.','Exhale comfortably as the arm pushes.'],['Recovery','Lift thumb-first near the hip; carry a relaxed, nearly straight arm over the shoulder. Rotate to little-finger entry.','Keep a long body line and continuous narrow kick.','Inhale comfortably during recovery; keep breathing as needed.']],
      hu:[['Kézbevitel','A kisujj érkezik először, a váll vonalában. Ne keresztezd a fej mögött a középvonalat.','Nézz felfelé, tartsd magasan a csípőt. A váltott kis lábtempó a csípőből indul.','Lélegezz folyamatosan; az arc a víz felett marad.'],['Vízfogás','Fordulj kissé a húzó kar oldalára; a víz alatt hajlítsd a könyököt, a tenyér a lábak felé nézzen.','A nyak stabil, a váll és a csípő együtt fordul.','Kényelmes ritmusban lélegezz, ne tartsd vissza.'],['Tolás','Nyomd a vizet a lábak felé, a kéz a comb mellett fejezze be a tolást.','Puha térd, a lábfej a felszín közelében mozog; ne emeld magasra a térdet.','Kényelmes kilégzés a tolás alatt.'],['Visszavitel','A csípőnél hüvelykujjal előre emeld ki a kart. Közel nyújtottan, lazán vidd a váll fölött; fordíts kisujjas bevitelhez.','Hosszú testhelyzet és folyamatos, szűk lábtempó.','Visszavitelkor kényelmesen lélegezz be; szükség szerint vegyél újra levegőt.']]}
  };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${({workouts:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h4',technique:'M3 17q3-3 6 0t6 0 6 0M4 11l6-5 5 5 4-3M10 6 7 3H3',history:'M4 7v5h5M4 12a8 8 0 1 1 2 6M12 7v5l3 2',play:'m9 5 10 7-10 7Z',pause:'M8 5v14M16 5v14',easy:'M3 12h18M12 3v18',foundation:'M3 17 8 12l4 3 9-12',intervals:'M3 18V9h4v9h4V4h4v14h6',breathing:'M3 8h12a3 3 0 1 0-3-3M3 12h17M3 16h10a3 3 0 1 1-3 3'}[k]||'M4 12h16M12 4v16')}"/></svg>`;
  const fmt=(n,l)=>new Intl.NumberFormat(l==='hu'?'hu-HU':'en-GB',{maximumFractionDigits:1}).format(n);
  let page='workouts',stroke='free',progress=0,playing=true,speed=1,stopAnimation=()=>{};
  function view(lang,raw,history){
    const l=lang==='hu'?'hu':'en',t=text[l],c=clean(raw);
    return `<section id="swim-training" data-choice-skip><nav class="swim-tabs" aria-label="${t.title}">${['workouts','technique','history'].map(k=>`<button type="button" data-sw="page" data-value="${k}" aria-pressed="${page===k}">${icon(k)}<span>${t[k]}</span></button>`).join('')}</nav><div class="swim-content">${page==='history'?history:page==='technique'?technique(l):workout(l,c)}</div></section>`;
  }
  function workout(l,c){
    const t=text[l],p=plan(c);
    return `<header class="swim-heading"><span class="cap">${t.workouts}</span><h2>${t.title}</h2><p>${t.intro}</p></header>
      <form class="swim-config" data-sw-form>
      <label class="fld"><span>${t.pool} · m</span><div class="swim-presets">${[25,50,75,100].map(n=>`<button type="button" data-sw="pool" data-value="${n}" aria-pressed="${c.pool===n}">${n}</button>`).join('')}</div><input aria-label="${t.pool}" name="pool" type="number" inputmode="decimal" min="10" max="100" step="0.1" required value="${c.pool}"><small>${t.poolHint}</small></label>
      <div class="swim-fields"><label class="fld"><span>${t.minutesLabel}</span><input name="minutes" type="number" inputmode="numeric" min="20" max="59" step="1" required value="${c.minutes}"></label><label class="fld"><span>${t.pace}</span><input name="pace" type="number" inputmode="numeric" min="60" max="600" step="1" required value="${c.pace}"></label></div><small>${t.paceHint}</small>
      <div class="swim-stroke-options" role="group" aria-label="${t.stroke}">${['free','breast','back'].map(k=>`<button type="button" data-sw="stroke" data-value="${k}" aria-pressed="${(c.routine==='breathing'?'free':c.stroke)===k}">${t[k]}</button>`).join('')}</div></form>
      <div class="swim-routines">${Object.keys(routines).map(k=>`<button type="button" data-sw="routine" data-value="${k}" aria-pressed="${c.routine===k}">${icon(k)}<b>${t[k]}</b><small>${t[k+'Sub']}</small></button>`).join('')}</div>
      <div class="swim-plan-output">${p.fits?`<article class="swim-plan"><div class="swim-total"><div><b>${fmt(p.metres,l)} <small>m</small></b><span>${p.lengths} ${t.lengths} · ${t[p.stroke]}</span></div><div><b>~${Math.ceil(p.elapsedSeconds/60)} <small>${t.min}</small></b><span>${t.total}</span></div></div><p class="swim-time-parts">${fmt(p.swimSeconds/60,l)} ${t.min} ${t.inWater} · ${fmt(p.restSeconds/60,l)} ${t.min} ${t.recovery} · 5 ${t.min} ${t.buffer}</p>
      <ol class="swim-blocks">${p.blocks.map((b,i)=>`<li><span class="swim-index">${i+1}</span><div><div class="swim-block-head"><b>${t[b.id]}</b><span>RPE ${b.rpe}/10</span></div><h3>${b.reps} × ${b.lengths} ${t.lengths} <small>· ${fmt(b.lengths*c.pool,l)} m</small></h3><p>${b.rest?`${b.rest} s ${t.rest}`:t.coolCue}</p><small>${t[b.id==='skill'?(c.routine==='breathing'?'breathCue':'skillCue'):b.id+'Cue']}</small></div></li>`).join('')}</ol><p class="cap">${t.meaning}</p><button type="button" class="btn primary wide" data-sw="log">${t.log}</button><p class="cap">${t.logHint}</p></article>`:`<p class="note" role="status">${t.tooShort.replace('{n}',p.minimumMinutes)}</p>`}</div>
      <p class="cap">${t.timing}</p><p class="cap">${t.effortHint}</p>
      <button class="btn wide" type="button" data-sw="page" data-value="technique">${icon('technique')}${t.skillLink}</button>
      ${c.routine==='breathing'?`<aside class="swim-safety"><b>${t.safety}</b><p>${t.safeText}</p></aside>`:''}
      <details class="swim-details"><summary>${t.week}</summary><p>${t.weekText}</p><p>${t.stop}</p></details>
      ${references(l)}`;
  }
  function references(l){const t=text[l];return `<details class="swim-details"><summary>${t.sources}</summary><p>${t.sourcesNote}</p><p>${t.safeText}</p><ul><li><a href="https://www.swimming.org/learntoswim/" target="_blank" rel="noopener noreferrer">Swim England · Learn to Swim</a></li><li><a href="https://www.cdc.gov/physical-activity-basics/adding-adults/what-counts.html" target="_blank" rel="noopener noreferrer">CDC · Measuring physical activity intensity</a></li><li><a href="https://www.redcross.org/take-a-class/resources/articles" target="_blank" rel="noopener noreferrer">American Red Cross · Water safety</a></li><li><a href="https://www.usms.org/fitness-and-training" target="_blank" rel="noopener noreferrer">US Masters Swimming · Fitness and training</a></li></ul></details>`;}
  function technique(l){const t=text[l];return `<div class="swim-heading"><h2>${t.technique}</h2></div><div class="swim-stroke-options" role="group" aria-label="${t.stroke}">${['free','breast','back'].map(k=>`<button type="button" data-sw="demo-stroke" data-value="${k}" aria-pressed="${stroke===k}">${t[k]}</button>`).join('')}</div><article class="swim-demo"><div class="swim-scene" role="img" aria-label="${t[stroke]} · ${t.diagram}"></div><div class="swim-playback"><button class="btn" type="button" data-sw="play" aria-pressed="${playing}">${icon(playing?'pause':'play')}<span>${t[playing?'pause':'play']}</span></button><button class="btn" type="button" data-sw="speed">${speed===.5?'½×':'1×'} · ${t[speed===.5?'slow':'normal']}</button></div><label class="swim-scrub"><span>${t.step}</span><input aria-label="${t.step}" data-sw-progress type="range" min="0" max="999" value="${Math.round(progress*999)}"></label><div class="swim-phases">${cues[stroke][l].map((row,i)=>`<button type="button" data-sw="phase" data-value="${i}">${i+1}. ${row[0]}</button>`).join('')}</div><div class="swim-cue" aria-live="off"></div></article>${stroke==='free'?`<article class="swim-entry"><h3>${t.top}</h3>${entryDiagram()}<p>${t.topNote}</p><p>${t.breathCue}</p></article>`:''}<p class="cap">${t.diagramNote}</p><aside class="swim-safety"><b>${t.safety}</b><p>${t.safeText}</p></aside>`;}
  const point=p=>p.map(n=>Math.round(n*10)/10).join(',');
  function limb(a,b,c,color){
    const segment=(u,v,w1,w2)=>{const dx=v[0]-u[0],dy=v[1]-u[1],len=Math.hypot(dx,dy)||1,n=[-dy/len,dx/len];
      const at=(t,w)=>point([u[0]+dx*t+n[0]*w,u[1]+dy*t+n[1]*w]);
      return `<path d="M${at(0,w1*.7)}Q${at(.4,w1*1.3)} ${at(1,w2)}Q${at(1.05,0)} ${at(1,-w2)}Q${at(.4,-w1)} ${at(0,-w1*.7)}Z" fill="${color}" stroke="#162d3b" stroke-width="1.5"/><path d="M${at(.15,w1*.25)}Q${at(.5,w1*.5)} ${at(.85,w2*.2)}" fill="none" stroke="#9d9281" stroke-width=".7"/>`;};
    const arm=a[0]>250,angle=Math.atan2(c[1]-b[1],c[0]-b[0])*180/Math.PI;
    const tip=arm?`<g transform="translate(${point(c)}) rotate(${angle})"><path d="M-2-4q5-2 11-1l5 2q2 2 0 4l-11 3-7-3Z" fill="${color}" stroke="#162d3b" stroke-width="1.2"/><path d="M6-2h7M7 0h8M6 2h7" stroke="#9d9281" stroke-width=".7"/></g>`:`<path d="M${c[0]+3} ${c[1]-4}l-12-3-7 3 7 5 12 2Z" fill="${color}" stroke="#162d3b" stroke-width="1.2"/>`;
    return segment(a,b,arm?9:11,arm?5:6)+segment(b,c,arm?6:8,3)+tip;
  }
  function interpolate(poses,p){const v=(p%1)*poses.length,i=Math.floor(v),f=(1-Math.cos((v-i)*Math.PI))/2;return poses[i].map((n,k)=>n+(poses[(i+1)%poses.length][k]-n)*f);}
  function scene(kind,p){
    // Side view (free/back), overhead view (breast). Joint trajectories are explicit per stroke.
    const skin='#f3d8b6',far='#9ab6c4';let body='';
    if(kind==='breast'){
      const a=interpolate([[340,105,397,105],[330,60,354,45],[303,66,334,97],[344,101,388,103]],p),b=interpolate([[140,104,75,104],[143,94,178,82],[141,94,164,63],[125,103,78,93]],p);
      for(const flip of [false,true]){const y=v=>flip?220-v:v;body+=limb([291,y(100)],[a[0],y(a[1])],[a[2],y(a[3])],flip?far:skin);body+=limb([194,y(103)],[b[0],y(b[1])],[b[2],y(b[3])],flip?far:skin);}
      body+='<path d="M195 96Q230 84 293 92Q313 110 293 128Q230 136 195 124Z" fill="'+skin+'" stroke="#162d3b" stroke-width="2"/><path d="M194 95h25v30h-25Z" fill="#233d59"/><ellipse cx="318" cy="110" rx="22" ry="17" fill="'+skin+'" stroke="#162d3b" stroke-width="2"/><path d="M327 95v30" stroke="#233d59" stroke-width="7"/>';
    }else{
      const free=[[345,105,403,107],[350,124,359,160],[270,145,224,133],[270,49,325,61]];
      const back=[[347,93,403,96],[347,131,314,163],[252,144,221,113],[302,45,331,14]];
      const arms=kind==='back'?back:free;
      for(const phase of [.5,0]){const a=interpolate(arms,p+phase),k=Math.sin((p+phase)*Math.PI*4)*12;
        body+=limb([197,111],[137,109+k*.4],[77,111+k],phase?far:skin);
        if(phase)body+=limb([298,105],[a[0],a[1]],[a[2],a[3]],far);
      }
      body+='<path d="M193 98Q226 87 285 91Q311 96 307 112Q291 129 258 128L194 121Z" fill="'+skin+'" stroke="#162d3b" stroke-width="2"/><path d="M191 98h26v26h-26Z" fill="#233d59"/><path d="M235 100q35-8 55 3M237 117q20 6 37 2" fill="none" stroke="#b4a28e" stroke-width="1"/>';
      const a=interpolate(arms,p);body+=limb([295,104],[a[0],a[1]],[a[2],a[3]],skin);
      const turn=kind==='back'?1:(p>=.35&&p<=.85?Math.sin((p-.35)*2*Math.PI):0),breathe=turn>.7,cy=107-13*turn;
      body+=`<ellipse cx="328" cy="${cy}" rx="23" ry="17" fill="${skin}" stroke="#162d3b" stroke-width="2"/><path d="M313 ${cy-12}q9-10 24-1" fill="none" stroke="#233d59" stroke-width="8"/><circle cx="341" cy="${cy+7-12*turn}" r="4" fill="#233d59"/>`;
      if(kind==='free'&&!breathe)for(let n=0;n<3;n++)body+=`<circle cx="${348+n*9}" cy="${126+n*7+(p*25)%8}" r="${2+n}" fill="none" stroke="#43899b"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 220" aria-hidden="true"><rect width="480" height="220" fill="#edf5f5"/><path d="M0 106H480V220H0Z" fill="#d6e9ed"/><path d="M0 106H480" stroke="#83b1c1" stroke-dasharray="7 6"/>${body}<path d="M373 193h48m-7-5 7 5-7 5" fill="none" stroke="#4b7787" stroke-width="2"/></svg>`;
  }
  function entryDiagram(){return `<svg viewBox="0 0 480 150" aria-hidden="true"><rect width="480" height="150" fill="#edf5f5"/><path d="M40 75h400" stroke="#9ab6c4" stroke-dasharray="5 5"/><path d="M195 48h220M195 102h220" stroke="#73a99d" stroke-dasharray="4 4"/><path d="M150 55Q210 35 280 47v56Q210 115 150 95Z" fill="#f3d8b6" stroke="#162d3b" stroke-width="2"/><ellipse cx="310" cy="75" rx="22" ry="17" fill="#f3d8b6" stroke="#162d3b" stroke-width="2"/>${limb([275,49],[340,49],[401,49],'#f3d8b6')}${limb([275,101],[340,101],[401,101],'#9ab6c4')}<path d="M400 75l12-12m-12 0 12 12" stroke="#bf5656" stroke-width="3"/></svg>`;}
  function mount(root,{lang='en',prefs=defaults,history='',onPrefs=()=>{},onLog=()=>{}}={}){
    stopAnimation();if(!root)return;
    let c=clean(prefs),l=lang==='hu'?'hu':'en',t=text[l],raf=0,last=0,lastPhase=-1;
    const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};stopAnimation=stop;
    const update=()=>{
      const el=root.querySelector('.swim-scene');if(!el)return;
      el.innerHTML=scene(stroke,progress);
      const phase=Math.min(3,Math.floor(progress*4));
      if(phase!==lastPhase){lastPhase=phase;const cue=cues[stroke][l][phase];root.querySelector('.swim-cue').innerHTML=`<h3>${phase+1}. ${cue[0]}</h3>${['arm','leg','breath'].map((k,i)=>`<p><b>${t[k]}</b>${cue[i+1]}</p>`).join('')}`;root.querySelectorAll('[data-sw=phase]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));}
      const range=root.querySelector('[data-sw-progress]');if(range)range.value=Math.round(progress*999);
    };
    const tick=now=>{raf=0;if(!root.isConnected||page!=='technique'||!playing)return;if(document.hidden){last=0;raf=requestAnimationFrame(tick);return;}if(last)progress=(progress+Math.min(now-last,80)/8000*speed)%1;last=now;update();raf=requestAnimationFrame(tick);};
    const animate=()=>{stop();lastPhase=-1;update();if(page==='technique'&&playing)raf=requestAnimationFrame(tick);};
    const draw=()=>{stop();root.innerHTML=view(l,c,history).replace(/^<section[^>]*>|<\/section>$/g,'');animate();};
    const save=()=>onPrefs({...c});
    const read=()=>{const f=root.querySelector('[data-sw-form]');if(!f)return true;if(!f.reportValidity())return false;for(const k of ['pool','minutes','pace'])c[k]=+f.elements[k].value;c=clean(c);save();return true;};
    root.onclick=e=>{
      const b=e.target.closest('[data-sw]');if(!b)return;const a=b.dataset.sw,v=b.dataset.value;
      if(['routine','pool','stroke','log'].includes(a)&&!read())return;
      if(a==='page'){page=v;draw();}
      if(a==='routine'){c.routine=v;save();draw();}
      if(a==='pool'){c.pool=+v;save();draw();}
      if(a==='stroke'){c.stroke=v;if(c.routine==='breathing'&&v!=='free')c.routine='easy';save();draw();}
      if(a==='log'){const p=plan(c);if(p.fits)onLog(p);}
      if(a==='demo-stroke'){stroke=v;progress=0;draw();}
      if(a==='play'){playing=!playing;draw();}
      if(a==='speed'){speed=speed===1?.5:1;draw();}
      if(a==='phase'){progress=+v/4;playing=false;draw();}
      if(a!=='log')root.querySelector(`[data-sw="${a}"]${v?`[data-value="${v}"]`:''}`)?.focus({preventScroll:true});
    };
    root.onchange=e=>{if(e.target.matches('[data-sw-form] input')&&read()){
      // Keep live inputs and buttons mounted: blur/change must not swallow the next tap.
      const fragment=document.createElement('div');fragment.innerHTML=workout(l,c);
      root.querySelector('.swim-plan-output').innerHTML=fragment.querySelector('.swim-plan-output').innerHTML;
      root.querySelectorAll('[data-sw=pool]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.value===c.pool)));
    }};
    root.oninput=e=>{if(e.target.matches('[data-sw-progress]')){playing=false;stop();progress=+e.target.value/1000;update();const b=root.querySelector('[data-sw=play]');b.setAttribute('aria-pressed','false');b.innerHTML=icon('play')+`<span>${t.play}</span>`;}};
    animate();
  }
  return {version:1,defaults,clean,plan,view,mount,scene,text};
})();
