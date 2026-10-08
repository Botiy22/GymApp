/* Local PDF -> reviewed GymApp plan. No API key or external request. */
window.PlanImport = (() => {
  'use strict';
  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  const arr = v => Array.isArray(v) ? v : [];
  const name = v => typeof v === 'string' ? v : obj(v) ? v.hu || v.en || '' : '';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (v, n) => typeof v === 'string' ? v.trim().slice(0, n) : '';
  function number(v, hi, integer) { return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= hi && (!integer || Number.isInteger(v)); }
  /* Validate BEFORE Store's legacy cleaner can turn missing numbers into defaults/zero. */
  function validate(raw, catalog, hu) {
    const errors = [], ids = new Set(catalog.map(x => x.id)), out = {app:'gymapp',kind:'plan',appendRoutines:true,appendMeals:raw && raw.appendMeals!==false,routines:[]};
    const bad = (path, msg) => errors.push(path + ': ' + msg);
    const need = hu ? 'Hiányzó vagy érvénytelen érték.' : 'Missing or invalid value.';
    const n = (v, hi, path, integer) => { if (!number(v, hi, integer)) { bad(path, need); return null; } return v; };
    const nm = (v, max, path) => { const s = text(name(v), max); if (!s) bad(path, need); return s; };
    if (!obj(raw) || raw.app !== 'gymapp' || raw.kind !== 'plan') return {errors:[hu ? 'Nem GymApp terv.' : 'Not a GymApp plan.']};
    if (arr(raw.unassignedMeals).length) bad('unassignedMeals', hu ? 'Válassz napot az étkezésekhez.' : 'Choose a weekday for the meals.');
    if (arr(raw.routines).length > 30) bad('routines', need);
    arr(raw.routines).slice(0,30).forEach((r, ri) => {
      if (!obj(r)) { bad('routines.'+ri, need); return; }
      const prefix = 'routines.'+ri, items = arr(r.items);
      if (!items.length || items.length > 60) bad(prefix+'.items', need);
      out.routines.push({name:nm(r.name,80,prefix+'.name'),opt:r.opt===true,info:text(r.info,1200),items:items.slice(0,60).map((i,ii)=>{
        i = obj(i) ? i : {}; const path=prefix+'.items.'+ii;
        if (!ids.has(i.ex)) bad(path+'.ex', hu ? 'Válassz pontos gyakorlatot.' : 'Select the exact exercise.');
        const sets=n(i.sets,12,path+'.sets',true); if (sets===0) bad(path+'.sets',need);
        return {ex:ids.has(i.ex)?i.ex:'',label:{hu:nm(i.label,80,path+'.label'),en:nm(i.label,80,path+'.label')},sets,reps:nm(i.reps,20,path+'.reps'),rest:n(i.rest,3600,path+'.rest',true),rir:text(i.rir,8),note:text(i.note,200)};
      })});
    });
    if (raw.plan != null) {
      const p=raw.plan;
      if (!obj(p) || !Array.isArray(p.days) || p.days.length!==7) bad('plan.days',hu ? 'Hét nap kell, hétfőtől vasárnapig.' : 'Seven days required, Monday through Sunday.');
      else {
        const totals=(v,path)=>({kcal:n(v.kcal,20000,path+'.kcal',true),p:n(v.p,100000,path+'.p'),c:n(v.c,100000,path+'.c'),f:n(v.f,100000,path+'.f')});
        const lines=v=>arr(v).slice(0,60).map(x=>text(x,500)).filter(Boolean);
        out.plan={name:nm(p.name,60,'plan.name'),targets:p.targets!==false,notes:lines(p.notes),train:lines(p.train),days:p.days.map((d,di)=>{
          d=obj(d)?d:{}; const path='plan.days.'+di;
          if (arr(d.meals).length>10) bad(path+'.meals',need);
          const day={type:['train','rest'].includes(d.type)?d.type:'',total:obj(d.total)?totals(d.total,path+'.total'):null,meals:arr(d.meals).slice(0,10).map((m,mi)=>{
            m=obj(m)?m:{}; const mp=path+'.meals.'+mi;
            if (!arr(m.items).length || arr(m.items).length>20) bad(mp+'.items',need);
            return Object.assign({name:nm(m.name,40,mp+'.name'),items:arr(m.items).slice(0,20).map((i,ii)=>{
              i=obj(i)?i:{}; const ip=mp+'.items.'+ii;
              // Per-food kcal is informational: no invented per-food macros or kcal required.
              return {n:nm(i.n,80,ip+'.n'),g:n(i.g,100000,ip+'.g'),kcal:i.kcal==null?null:n(i.kcal,20000,ip+'.kcal',true)};
            })},totals(m,mp));
          })};
          if (day.total && day.total.kcal===0) bad(path+'.total.kcal',need);
          return day;
        })};
        if (!out.plan.days.some(d=>d.meals.length)) bad('plan',need);
      }
    }
    if (!out.routines.length && !out.plan) bad('plan',hu ? 'Nem találtam importálható tervet.' : 'No importable plan found.');
    return {out,errors};
  }
  function open(options) {
    if (document.getElementById('pdf-plan-dialog')) return;
    const hu=options.lang==='hu', tr=(h,e)=>hu?h:e;
    const days=hu?['Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat','Vasárnap']:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const dialog=document.createElement('dialog');dialog.id='pdf-plan-dialog';dialog.className='pdf-plan-dialog';
    const fileIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/></svg>';
    dialog.innerHTML=`<div class="pdf-head"><div><span class="import-eyebrow">${tr('SAJÁT TERV','YOUR PLAN')}</span><h2>${tr('Terv hozzáadása','Add a plan')}</h2></div><button type="button" class="icon-btn" data-pdf="close" aria-label="${tr('Bezárás','Close')}">×</button></div>
      <div class="import-steps" aria-label="${tr('Lépések','Steps')}"><span class="active">1 · ${tr('Fájl','File')}</span><span>2 · ${tr('Átnézés','Review')}</span><span>3 · ${tr('Hozzáadás','Add')}</span></div>
      <div data-pdf="content"><label class="import-upload">${fileIcon}<b>${tr('Válassz egy fájlt','Choose a file')}</b><span>Excel · PDF · Word</span><input class="sr" type="file" accept=".xlsx,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple data-pdf="files" aria-label="${tr('Tervfájl kiválasztása','Choose a plan file')}"></label><p class="import-hint">${tr('Edzésterv vagy étrend. Legfeljebb két fájl, összesen 12 MB.','Workouts or meals. Up to two files, 12 MB total.')}</p><div data-pdf="filenames" class="import-files"></div>
      <p data-pdf="status" class="import-status" role="status" aria-live="polite"></p><button type="button" class="btn sm" data-pdf="retry" hidden>${tr('Újrapróbálás','Retry')}</button>
      <div data-pdf="selection" class="import-selection" hidden><label><input type="checkbox" data-pdf="workouts" checked><span><b data-pdf="workout-count"></b><small>${tr('Edzéstervekhez','To Workouts')}</small></span></label><label><input type="checkbox" data-pdf="meals" checked><span><b data-pdf="meal-count"></b><small>${tr('Étrendhez','To Meal plan')}</small></span></label></div>
      <label class="fld" data-pdf="meal-mode-wrap" hidden><span>${tr('Meglévő étrend','Existing meal plan')}</span><select data-pdf="meal-mode"><option value="append">${tr('Új étkezések hozzáadása','Add new meals')}</option><option value="replace">${tr('Étrend lecserélése','Replace meal plan')}</option></select></label>
      <div class="import-default-rest" data-pdf="rest-default-wrap" hidden><span>${tr('Hiányzó pihenőidő','Rest times not provided')}</span><button type="button" class="btn sm" data-pdf="default-rest">${tr('Saját alapérték: ','My default: ')}${options.restDefault||90} s</button></div><div data-pdf="preview"></div><div data-pdf="mapping"></div>
      <details class="import-advanced" data-pdf="advanced" hidden><summary>${tr('Részletek és további lehetőségek','Details and more options')}</summary><div data-pdf="warnings"></div><details data-pdf="source"><summary>${tr('Kiolvasott szöveg','Extracted text')}</summary><pre data-pdf="text"></pre></details><div class="row2"><button type="button" class="btn sm" data-pdf="add-routine">${tr('Edzésnap hozzáadása','Add workout day')}</button><button type="button" class="btn sm" data-pdf="add-meal">${tr('Étkezés hozzáadása','Add meal')}</button></div><details><summary>JSON</summary><textarea data-pdf="json" rows="8" aria-label="${tr('Terv JSON','Plan JSON')}"></textarea><div class="row2"><button type="button" class="btn sm" data-pdf="rebuild">${tr('Előnézet frissítése','Refresh preview')}</button><button type="button" class="btn sm" data-pdf="export">${tr('Terv letöltése','Download plan')}</button></div></details></details></div>
      <div class="import-footer" data-pdf="footer"><span>${tr('Átnézés után a terv hozzáadható.','Review the plan before adding it.')}</span><button type="button" class="btn primary" data-pdf="apply" disabled>${tr('Tervek hozzáadása','Add plans')}</button></div>`;
    const releasePage = ModalLock.acquire(dialog);
    const viewport=window.visualViewport;
    const size=()=>{dialog.style.setProperty('--import-viewport',(viewport?viewport.height:window.innerHeight)+'px');dialog.style.setProperty('--import-offset',(viewport?viewport.offsetTop:0)+'px');};
    size();window.addEventListener('resize',size);if(viewport){viewport.addEventListener('resize',size);viewport.addEventListener('scroll',size);}
    let unlocked=false;
    const unlock=()=>{
      if(unlocked)return;unlocked=true;
      window.removeEventListener('resize',size);if(viewport){viewport.removeEventListener('resize',size);viewport.removeEventListener('scroll',size);}
      releasePage();
    };
    dialog.addEventListener('close',unlock,{once:true});
    document.body.append(dialog);
    try{dialog.showModal();}catch(error){unlock();dialog.remove();throw error;}
    const q=k=>dialog.querySelector('[data-pdf="'+k+'"]');
    let raw=null,files=[],sources=[],busy=false,ctl=null,confirmed=null,jsonDirty=false,edited=false;
    const mappings={};let previewErrors=[];
    const display=e=>(hu?e.hu||e.en:e.en||e.hu)+(e.hu&&e.en&&e.hu!==e.en?' · '+(hu?e.en:e.hu):'');
    const catalog=options.catalog, byID=new Map(catalog.map(e=>[e.id,e]));
    const list=document.createElement('datalist');list.id='import-exercises';list.innerHTML=catalog.map(e=>`<option value="${esc(display(e))}"></option>`).join('');dialog.append(list);
    const status=s=>{q('status').textContent=s;};
    const close=()=>{if(ctl)ctl.abort();dialog.close();dialog.remove();unlock();};
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    function selected() {
      return Object.assign({},raw,{routines:q('workouts').checked?arr(raw.routines):[],plan:q('meals').checked?raw.plan:null,unassignedMeals:q('meals').checked?raw.unassignedMeals:[],appendMeals:q('meal-mode').value!=='replace'});
    }
    function checked() { return raw?validate(selected(),catalog,hu):{errors:[]}; }
    function updateState() {
      confirmed=null;
      const result=checked();q('apply').disabled=busy||!raw||!!result.errors.length;
      q('meal-mode-wrap').hidden=!options.hasMealPlan||!q('meals').checked;
      q('rest-default-wrap').hidden=!raw||!q('workouts').checked||!arr(raw.routines).some(r=>arr(r.items).some(i=>i.rest==null));
      if(!raw)return;
      const n=result.errors.length;
      status(n?tr('Még '+n+' mezőt kell kiegészíteni.','Complete '+n+' remaining fields.'):'');
      q('json').value=JSON.stringify(raw,null,2);
      dialog.querySelectorAll('[data-ex]').forEach(el=>el.classList.toggle('needs-value',!valueAt(el.dataset.ex).ex));
      dialog.querySelectorAll('[data-check]').forEach(el=>{const missing=result.errors.some(s=>s.startsWith(el.dataset.check+'.'))||el.dataset.check.startsWith('unassignedMeals');el.querySelector('[data-missing]').hidden=!missing;});
      // Keep error indicators and the action current while editing; do not replace focused inputs.
      dialog.querySelectorAll('[data-path]').forEach(el=>el.classList.toggle('needs-value',result.errors.some(s=>s.startsWith(el.dataset.path+':'))));
    }
    function field(path,label,value,numeric) {
      const error=previewErrors.some(s=>s.startsWith(path+':'));
      return `<label class="fld"><span>${esc(label)}</span><input data-path="${esc(path)}" class="${error?'needs-value':''}" ${numeric?'type="number" min="0" step="any"':'type="text"'} value="${esc(value)}"></label>`;
    }
    const summary=(title,subtitle,missing)=>`<summary><span><b>${esc(title)}</b><small>${esc(subtitle)}</small></span><em data-missing ${missing?'':'hidden'}>${tr('Kiegészítendő','Needs details')}</em><i aria-hidden="true">⌄</i></summary>`;
    const macros=(path,m)=>`<div class="import-macros">${['kcal','p','c','f'].map((k,i)=>field(path+'.'+k,['kcal',tr('Fehérje (g)','Protein (g)'),tr('Szénhidrát (g)','Carbs (g)'),tr('Zsír (g)','Fat (g)')][i],m[k],true)).join('')}</div>`;
    function mealEditor(m,path,index,unassigned) {
      const missing=unassigned||previewErrors.some(s=>s.startsWith(path+'.'));
      return `<details class="import-card" data-check="${path}" ${missing?'open':''}>${summary(name(m.name),m.kcal==null?tr('Tápérték kiegészítendő','Nutrition needs details'):m.kcal+' kcal · '+arr(m.items).length+' '+tr('étel','foods'),missing)}<div class="import-card-body">${unassigned?`<label class="fld"><span>${tr('Melyik napra?','Which weekday?')}</span><select data-assign="${index}" class="needs-value"><option value="">${tr('Válassz napot','Choose a weekday')}</option>${days.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select></label>`:''}${field(path+'.name',tr('Étkezés','Meal'),name(m.name),false)}${arr(m.items).map((i,ii)=>`<div class="import-food-row">${field(path+'.items.'+ii+'.n',tr('Étel','Food'),i.n,false)}${field(path+'.items.'+ii+'.g','g',i.g,true)}<button class="import-remove" type="button" data-pdf="remove-food" data-path="${path}.items" data-index="${ii}" aria-label="${tr('Étel eltávolítása','Remove food')}">×</button></div>`).join('')}${macros(path,m)}<button type="button" class="link" data-pdf="add-food" data-path="${path}.items">+ ${tr('Étel','Food')}</button><button type="button" class="link mut" data-pdf="remove-meal" data-path="${unassigned?'unassignedMeals':path.split('.').slice(0,-1).join('.')}" data-index="${index}">${tr('Étkezés eltávolítása','Remove meal')}</button></div></details>`;
    }
    function preview() {
      jsonDirty=false;confirmed=null;
      const routines=arr(raw.routines),mealCount=raw.plan?arr(raw.plan.days).reduce((n,d)=>n+arr(d.meals).length,0)+arr(raw.unassignedMeals).length:0;
      q('selection').hidden=!routines.length&&!mealCount;q('advanced').hidden=false;
      q('workouts').disabled=!routines.length;q('meals').disabled=!mealCount;
      q('workouts').closest('label').hidden=!routines.length;q('meals').closest('label').hidden=!mealCount;
      q('selection').classList.toggle('single',!routines.length||!mealCount);
      if(!routines.length)q('workouts').checked=false;if(!mealCount)q('meals').checked=false;
      q('workout-count').textContent=routines.length+' '+tr('edzésnap',routines.length===1?'workout day':'workout days');q('meal-count').textContent=mealCount+' '+tr('étkezés',mealCount===1?'meal':'meals');
      q('warnings').innerHTML=arr(raw.warnings).length?'<ul>'+arr(raw.warnings).map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'';
      q('text').textContent=sources.map(s=>s.name+'\n'+s.lines.map(l=>'['+l.page+'] '+l.text).join('\n')).join('\n\n');
      let html='';
      const errors=checked().errors;previewErrors=errors;
      if(q('workouts').checked) {
        html+=`<h3 class="import-section-title">${tr('Edzéstervek','Workouts')}</h3>`;
        routines.forEach((r,ri)=>{
          const path='routines.'+ri,missing=errors.some(s=>s.startsWith(path+'.'));
          html+=`<details class="import-card" data-check="${path}" ${missing?'open':''}>${summary(name(r.name),arr(r.items).length+' '+tr('gyakorlat','exercises'),missing)}<div class="import-card-body">${field(path+'.name',tr('Edzésnap neve','Workout name'),name(r.name),false)}`;
          arr(r.items).forEach((i,ii)=>{
            const ip=path+'.items.'+ii,e=byID.get(i.ex);
            html+=`<div class="import-exercise"><h4>${esc(name(i.label))}</h4><label class="fld"><span>${tr('Gyakorlat az appban','Exercise in the app')}</span><input type="text" list="import-exercises" data-ex="${ip}" value="${esc(e?display(e):'')}" class="${i.ex?'':'needs-value'}" placeholder="${esc(tr('Keress és válassz gyakorlatot','Search and choose an exercise'))}" autocomplete="off"></label><div class="pdf-fields">${field(ip+'.sets',tr('Sorozat','Sets'),i.sets,true)}${field(ip+'.reps',tr('Ismétlés','Reps'),i.reps,false)}${field(ip+'.rest',tr('Pihenő (mp)','Rest (sec)'),i.rest,true)}</div><details class="import-extra"><summary>${tr('Megjegyzések','Notes')}</summary>${field(ip+'.rir','RIR',i.rir,false)}${field(ip+'.note',tr('Megjegyzés és forrás','Notes and source'),i.note,false)}</details><button type="button" class="link mut" data-pdf="remove-exercise" data-path="${path}.items" data-index="${ii}">${tr('Sor eltávolítása','Remove row')}</button></div>`;
          });
          html+=`<button type="button" class="link" data-pdf="add-exercise" data-path="${path}.items">+ ${tr('Gyakorlat','Exercise')}</button><button type="button" class="link mut" data-pdf="remove-routine" data-path="routines" data-index="${ri}">${tr('Nap eltávolítása','Remove day')}</button></div></details>`;
        });
      }
      if(q('meals').checked && raw.plan){
        html+=`<h3 class="import-section-title">${tr('Heti étrend','Weekly meals')}</h3>`;
        arr(raw.unassignedMeals).forEach((m,i)=>{html+=mealEditor(m,'unassignedMeals.'+i,i,true);});
        raw.plan.days.forEach((d,di)=>{
          if(!arr(d.meals).length&&!d.total)return;
          html+=`<h4 class="import-day">${days[di]}</h4>`;
          d.meals.forEach((m,mi)=>{html+=mealEditor(m,'plan.days.'+di+'.meals.'+mi,mi,false);});
          if(d.total)html+=`<details class="import-card" ${errors.some(s=>s.startsWith('plan.days.'+di+'.total'))?'open':''}>${summary(tr('Napi cél','Daily target'),d.total.kcal==null?'—':d.total.kcal+' kcal',false)}<div class="import-card-body">${macros('plan.days.'+di+'.total',d.total)}<button type="button" class="link mut" data-pdf="remove-total" data-path="plan.days.${di}.total">${tr('Napi cél kihagyása','Exclude daily target')}</button></div></details>`;
        });
      }
      if(!routines.length&&!mealCount)html=`<div class="import-empty"><b>${tr('A fájl megnyílt, de nem találtam tervet.','The file opened, but no plan was found.')}</b><p>${arr(raw.pendingTables).length?tr('Válaszd ki az oszlopokat az alábbi munkalapokhoz.','Choose the columns for the worksheets below.'):tr('A kiolvasott szöveget a Részletekben találod.','The extracted text is in Details.')}</p></div>`;
      q('preview').innerHTML=html;
      renderMappings();updateState();
      dialog.querySelectorAll('.import-steps span').forEach((el,i)=>el.classList.toggle('active',i<=1));
    }
    function renderMappings() {
      const pending=arr(raw.pendingTables);
      q('mapping').innerHTML=pending.map((table,i)=>`<details class="import-card import-map" ${!raw.routines.length&&!raw.plan?'open':''}><summary><span><b>${esc(table.name)}</b><small>${tr('Válaszd ki az oszlopokat','Choose columns')}</small></span><i>⌄</i></summary><div class="import-card-body"><label class="fld"><span>${tr('Mit tartalmaz a munkalap?','What is in this worksheet?')}</span><select data-map-kind="${i}"><option value="workout">${tr('Edzésterv','Workout plan')}</option><option value="meal">${tr('Étrend','Meal plan')}</option></select></label><label class="fld"><span>${tr('Fejléc sora','Header row')}</span><select data-map-row="${i}">${table.rows.map((r,j)=>`<option value="${j}">${j+1} · ${esc(r.cells.filter(Boolean).join(' · ').slice(0,90))}</option>`).join('')}</select></label><div data-map-fields="${i}"></div><button type="button" class="btn" data-pdf="map" data-index="${i}">${tr('Munkalap beolvasása','Read worksheet')}</button></div></details>`).join('');
      pending.forEach((t,i)=>mapFields(i));
    }
    function mapFields(index) {
      const table=raw.pendingTables[index],kind=dialog.querySelector('[data-map-kind="'+index+'"]').value,row=Number(dialog.querySelector('[data-map-row="'+index+'"]').value),cells=table.rows[row].cells;
      const keys=kind==='workout'?[['day',tr('Edzésnap','Workout day')],['ex',tr('Gyakorlat','Exercise')],['sets',tr('Sorozat','Sets')],['reps',tr('Ismétlés','Reps')],['rest',tr('Pihenő (mp)','Rest (sec)')]]:[['day',tr('Hét napja','Weekday')],['meal',tr('Étkezés','Meal')],['food',tr('Étel','Food')],['grams',tr('Gramm','Grams')],['kcal','kcal'],['p',tr('Fehérje (g)','Protein (g)')],['c',tr('Szénhidrát (g)','Carbs (g)')],['f',tr('Zsír (g)','Fat (g)')]];
      const detected=PlanSheet.headers(cells).map;
      dialog.querySelector('[data-map-fields="'+index+'"]').innerHTML=`<div class="import-map-fields">${keys.map(([k,label])=>`<label class="fld"><span>${label}</span><select data-map-key="${k}" data-table="${index}"><option value="-1">${tr('Nincs','Not provided')}</option>${cells.map((v,i)=>`<option value="${i}" ${detected[k]===i?'selected':''}>${esc(v||String.fromCharCode(65+i))}</option>`).join('')}</select></label>`).join('')}</div>${kind==='meal'?`<label class="fld"><span>${tr('Nap, ha nincs a fájlban','Weekday if not in the file')}</span><select data-map-day="${index}"><option value="">${tr('Később választom ki','Choose later')}</option>${days.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select></label>`:''}`;
    }
    function valueAt(path) {return path.split('.').reduce((v,k)=>v[k],raw);}
    function set(path,value) {const bits=path.split('.'),parent=valueAt(bits.slice(0,-1).join('.'));parent[bits.at(-1)]=value;}
    async function read() {
      if(busy||!files.length)return;
      busy=true;ctl=new AbortController();const current=ctl;
      q('files').disabled=true;q('apply').disabled=true;q('retry').hidden=true;q('preview').replaceChildren();q('selection').hidden=true;q('mapping').replaceChildren();q('advanced').hidden=true;
      status(tr('Fájl beolvasása…','Reading file…'));
      const timeout=setTimeout(()=>current.abort(),180000);
      try {
        sources=await PDFLocal.extract(files,current.signal,(file,page,total)=>status(file+' · '+page+' / '+total));
        if(current.signal.aborted||!dialog.isConnected)return;
        raw=PDFLocal.draft(sources,catalog,hu,mappings);q('workouts').checked=!!raw.routines.length;q('meals').checked=!!raw.plan;
        preview();
      } catch(er) {
        raw=null;
        if(dialog.isConnected){const info=PDFLocal.describeError(er);const messages={size:tr('Legfeljebb két fájlt válassz, összesen 12 MB méretig.','Choose up to two files, 12 MB total.'),file:tr('Ez a fájl nem olvasható. XLSX, DOCX vagy PDF szükséges.','Cannot read this file. Choose XLSX, DOCX or PDF.'),password:tr('Válassz jelszó nélküli PDF-et.','Choose an unlocked PDF.'),pages:tr('Legfeljebb 60 PDF-oldal importálható.','Import up to 60 PDF pages.'),length:tr('Túl nagy a dokumentum. Válassz kisebbet.','The document is too large. Choose a smaller one.'),cancelled:tr('A beolvasás megszakadt. Próbáld újra.','Reading was interrupted. Try again.')};status((messages[info.code]||tr('Nem sikerült beolvasni. Próbáld újra, vagy válassz másik fájlt.','Could not read the file. Retry or choose another file.'))+(info.detail?'\n'+info.detail:''));q('retry').hidden=false;}
      } finally {clearTimeout(timeout);busy=false;ctl=null;q('files').disabled=false;if(raw)updateState();}
    }
    function prepare() {
      if(jsonDirty){status(tr('Előbb frissítsd az előnézetet.','Refresh the preview first.'));return null;}
      const result=checked();if(result.errors.length){status(result.errors.slice(0,4).join('\n'));return null;}
      if(!confirmed){confirmed=result.out;const token=Date.now().toString(36)+Math.random().toString(36).slice(2,7);confirmed.routines.forEach((r,i)=>r.id='imp-'+token+'-'+i);if(confirmed.plan)confirmed.plan.days.forEach((d,di)=>d.meals.forEach((m,mi)=>m.id='impm-'+token+'-'+di+'-'+mi));}
      return confirmed;
    }
    dialog.addEventListener('change',e=>{
      const el=e.target;
      if(el===q('files')){const chosen=Array.from(el.files);el.value='';if(!chosen.length)return;files=chosen;dialog.classList.add('has-file');Object.keys(mappings).forEach(k=>delete mappings[k]);edited=false;raw=null;q('filenames').innerHTML=files.map(f=>'<span>'+esc(f.name)+'</span>').join('');read();return;}
      if(el.matches('[data-map-kind],[data-map-row]')){mapFields(Number(el.dataset.mapKind||el.dataset.mapRow));return;}
      if(!raw)return;
      if(el===q('workouts')||el===q('meals')){preview();return;}
      if(el===q('meal-mode')){updateState();return;}
      if(el.dataset.assign!=null){const i=Number(el.dataset.assign),day=Number(el.value);if(el.value!==''&&day>=0&&day<7){raw.plan.days[day].meals.push(raw.unassignedMeals.splice(i,1)[0]);edited=true;preview();}return;}
      editField(el);
    });
    function editField(el) {
      if(el.dataset.ex){const found=catalog.filter(x=>display(x)===el.value);set(el.dataset.ex+'.ex',found.length===1?found[0].id:'');if(found.length===1&&!name(valueAt(el.dataset.ex).label))set(el.dataset.ex+'.label',hu?found[0].hu||found[0].en:found[0].en);edited=true;updateState();return;}
      if(el.dataset.path&&el.tagName==='INPUT'){set(el.dataset.path,el.type==='number'?(el.value===''?null:Number(el.value)):el.value);edited=true;updateState();}
    }
    dialog.addEventListener('input',e=>{
      if(e.target===q('json')){jsonDirty=true;confirmed=null;q('apply').disabled=true;}
      else if(raw)editField(e.target);
    });
    dialog.addEventListener('click',async e=>{
      const b=e.target.closest('button[data-pdf]');if(!b)return;const action=b.dataset.pdf;
      if(action==='close'){close();return;}
      if(action==='open-workouts'||action==='open-meals'){close();if(options.onOpen)options.onOpen(action==='open-meals'?'food':'home');return;}
      if(action==='retry'){read();return;}
      if(busy||!raw)return;
      if(action==='apply'||action==='export'){
        const plan=prepare();if(!plan)return;
        if(action==='export'){await options.onExport(plan);return;}
        if(plan.plan&&!plan.appendMeals&&options.hasMealPlan&&!confirm(tr('Lecseréled a jelenlegi étrendet?','Replace your current meal plan?')))return;
        busy=true;q('apply').disabled=true;
        try{
          const saved=await options.onApply(plan);
          if(saved===false)throw new Error('storage');
          const n=plan.routines.length,m=plan.plan?plan.plan.days.reduce((n,d)=>n+d.meals.length,0):0;
          q('content').innerHTML=`<div class="import-success"><span aria-hidden="true">✓</span><h3>${tr('Tervek hozzáadva','Plans added')}</h3><p>${n} ${tr('edzésnap',n===1?'workout day':'workout days')} · ${m} ${tr('étkezés',m===1?'meal':'meals')}</p><p class="cap">${tr('Az edzéstervek és a heti étrend már az appban vannak.','Your workouts and weekly meals are now in the app.')}</p></div>`;
          q('footer').innerHTML=`${n?`<button type="button" class="btn ${!m?'primary':''}" data-pdf="open-workouts">${tr('Edzéstervek','View workouts')}</button>`:''}${m?`<button type="button" class="btn primary" data-pdf="open-meals">${tr('Étrend megnyitása','View meal plan')}</button>`:''}`;
          dialog.querySelectorAll('.import-steps span').forEach(el=>el.classList.add('active'));
        }catch(er){status(er.message==='storage'?tr('A tervet nem sikerült elmenteni. Szabadíts fel tárhelyet, és próbáld újra.','The plan could not be saved. Free some storage and retry.'):String(er.message||tr('Nem sikerült hozzáadni a tervet.','Could not add the plan.')));q('apply').disabled=false;}
        finally{busy=false;}return;
      }
      if(action==='map'){
        if(edited&&!confirm(tr('Az oszlopok újraolvasása felülírja az előnézetben végzett módosításokat. Folytatod?','Reading columns again resets preview edits. Continue?')))return;
        const i=Number(b.dataset.index),table=raw.pendingTables[i],map={};dialog.querySelectorAll('[data-map-key][data-table="'+i+'"]').forEach(el=>{if(+el.value>=0)map[el.dataset.mapKey]=+el.value;});
        if(new Set(Object.values(map)).size!==Object.keys(map).length){status(tr('Minden mezőhöz másik oszlopot válassz.','Choose a different column for each field.'));return;}
        const kind=dialog.querySelector('[data-map-kind="'+i+'"]').value;
        if(kind==='workout'&&map.ex==null||kind==='meal'&&map.food==null&&map.meal==null){status(tr('Válassz gyakorlat- vagy ételoszlopot.','Choose an exercise or food column.'));return;}
        const day=dialog.querySelector('[data-map-day="'+i+'"]');mappings[table.id]={kind:dialog.querySelector('[data-map-kind="'+i+'"]').value,headerRow:+dialog.querySelector('[data-map-row="'+i+'"]').value,map,day:day&&day.value!==''?+day.value:null};
        raw=PDFLocal.draft(sources,catalog,hu,mappings);q('workouts').checked=!!raw.routines.length;q('meals').checked=!!raw.plan;edited=false;preview();return;
      }
      if(action==='default-rest'){raw.routines.forEach(r=>r.items.forEach(i=>{if(i.rest==null){i.rest=options.restDefault||90;i.note=(i.note||'')+' · '+tr('Az app alapértelmezett pihenője; nem a fájlból.','App default rest; not supplied by the file.');}}));edited=true;preview();return;}
      if(action==='rebuild'){const previous=raw;try{const candidate=JSON.parse(q('json').value);if(!obj(candidate)||candidate.app!=='gymapp'||candidate.kind!=='plan'||!Array.isArray(candidate.routines)||candidate.plan&&(!obj(candidate.plan)||!Array.isArray(candidate.plan.days)||candidate.plan.days.length!==7))throw 0;raw=candidate;preview();}catch(er){raw=previous;status(tr('Érvénytelen terv-JSON.','Invalid plan JSON.'));}return;}
      const path=b.dataset.path,index=+b.dataset.index;
      if(action.startsWith('remove-')&&path){if(action==='remove-total')set(path,null);else valueAt(path).splice(index,1);}
      if(action==='add-exercise')valueAt(path).push({ex:'',label:'',sets:null,reps:'',rest:null,rir:'',note:''});
      if(action==='add-food')valueAt(path).push({n:'',g:null,kcal:null});
      if(action==='add-routine'){raw.routines.push({name:tr('Új edzésnap','New workout'),items:[]});q('workouts').checked=true;}
      if(action==='add-meal'){if(!raw.plan)raw.plan={name:tr('Étrend','Meal plan'),targets:true,days:Array.from({length:7},()=>({type:'',total:null,meals:[]})),notes:[],train:[]};if(!raw.unassignedMeals)raw.unassignedMeals=[];raw.unassignedMeals.push({name:tr('Új étkezés','New meal'),items:[],kcal:null,p:null,c:null,f:null});q('meals').checked=true;}
      edited=true;preview();
    });
  }
  return {open,validate};
})();
