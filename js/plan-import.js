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
    const errors = [], ids = new Set(catalog.map(x => x.id)), out = {app:'gymapp',kind:'plan',appendRoutines:true,routines:[]};
    const bad = (path, msg) => errors.push(path + ': ' + msg);
    const need = hu ? 'Hiányzó vagy érvénytelen érték.' : 'Missing or invalid value.';
    const n = (v, hi, path, integer) => { if (!number(v, hi, integer)) { bad(path, need); return null; } return v; };
    const nm = (v, max, path) => { const s = text(name(v), max); if (!s) bad(path, need); return s; };
    if (!obj(raw) || raw.app !== 'gymapp' || raw.kind !== 'plan') return {errors:[hu ? 'Nem GymApp terv.' : 'Not a GymApp plan.']};
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
        if (!out.plan.days.some(d=>d.meals.length) && !out.plan.notes.length && !out.plan.train.length) bad('plan',need);
      }
    }
    if (!out.routines.length && !out.plan) bad('plan',hu ? 'Nem találtam importálható tervet.' : 'No importable plan found.');
    return {out,errors};
  }
  function open(options) {
    if (document.getElementById('pdf-plan-dialog')) return;
    const hu=options.lang==='hu', tr=(h,e)=>hu?h:e;
    const dialog=document.createElement('dialog');dialog.id='pdf-plan-dialog';dialog.className='pdf-plan-dialog';
    dialog.innerHTML=`<div class="pdf-head"><h2>${tr('Terv betöltése dokumentumból','Import plan from document')}</h2><button type="button" class="btn sm" data-pdf="close">${tr('Bezárás','Close')}</button></div><p>${tr('Válassz egy vagy két PDF-, Word (.docx) vagy Excel (.xlsx) fájlt: edzéstervet és/vagy heti étrendet. A beolvasás ezen az eszközön történik, API-kulcs és külső adatküldés nélkül.','Choose one or two PDF, Word (.docx) or Excel (.xlsx) files: a workout plan and/or weekly meal plan. Extraction runs on this device without an API key or external upload.')}</p><label class="fld"><span>PDF / DOCX / XLSX · ${tr('legfeljebb 12 MB összesen','12 MB total maximum')}</span><input type="file" accept="application/pdf,.pdf,.docx,.xlsx" multiple data-pdf="files"></label><p>${tr('A beolvasás tévedhet. Betöltés előtt ellenőrizd az előnézetet az eredeti dokumentumokkal. A hiányzó adatokat ki kell egészíteni; becslést nem használunk.','Extraction may be wrong. Check the preview against the original documents before importing. Missing values require completion; no estimates are used.')}</p><button class="btn primary" type="button" data-pdf="convert" >${tr('Átalakítás és előnézet','Convert and preview')}</button><p data-pdf="status" role="status" aria-live="polite"></p><details data-pdf="source" hidden><summary>${tr('Kiolvasott szöveg és táblázatsorok','Extracted text and table rows')}</summary><pre data-pdf="text"></pre></details><div data-pdf="preview"></div><div data-pdf="finish" hidden><div class="row2"><button type="button" class="btn" data-pdf="add-routine">${tr('Edzésnap hozzáadása','Add workout day')}</button><button type="button" class="btn" data-pdf="add-diet">${tr('Heti étrend szerkesztése','Edit weekly meal plan')}</button></div><details><summary>${tr('JSON megtekintése és szerkesztése','View and edit JSON')}</summary><label class="fld"><span>JSON</span><textarea data-pdf="json" rows="14" spellcheck="false"></textarea></label><button type="button" class="btn" data-pdf="rebuild">${tr('Előnézet újraépítése','Rebuild preview')}</button></details><label class="fld"><span><input type="checkbox" data-pdf="diet"> ${tr('Az importált étrend váltsa le a jelenlegit (ha van benne étrend).','Replace my current meal plan if the import contains meals.')}</span></label><label class="fld"><span><input type="checkbox" data-pdf="review"> ${tr('Ellenőriztem a napokat, gyakorlatváltozatokat és mennyiségeket a PDF-ekkel.','I checked the days, exercise variants and quantities against the PDFs.')}</span></label><p>${tr('Az új edzésnapok hozzáadódnak. A meglévő terveid, naplóid és mentéseid megmaradnak.','New workout days are added. Existing routines, logs and saved data are preserved.')}</p><div class="row2"><button type="button" class="btn" data-pdf="export">${tr('Terv-JSON letöltése','Download plan JSON')}</button><button type="button" class="btn primary" data-pdf="apply">${tr('Terv hozzáadása','Add plan')}</button></div></div>`;
    document.body.append(dialog);dialog.showModal();
    const q=k=>dialog.querySelector('[data-pdf="'+k+'"]');
    let raw=null,files=[],busy=false,ctl=null,confirmed=null,jsonDirty=false;
    const status=s=>{q('status').textContent=s;};
    const close=()=>{if(ctl)ctl.abort();dialog.close();dialog.remove();};
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    function field(path,label,value,numeric) {
      return `<label class="fld"><span>${esc(label)}</span><input data-path="${esc(path)}" ${numeric?'type="number" min="0" step="any"':'type="text"'} value="${esc(value)}"></label>`;
    }
    function preview() {
      confirmed=null;jsonDirty=false;q('review').checked=false;q('finish').hidden=false;q('json').value=JSON.stringify(raw,null,2);
      const warnings=arr(raw.warnings).map(x=>`<li>${esc(x)}</li>`).join('');
      let html=warnings?`<section class="card"><h3>${tr('Ellenőrizendő részek','Items to review')}</h3><ul>${warnings}</ul></section>`:'';
      arr(raw.routines).forEach((r,ri)=>{
        if(!obj(r))return;
        html+=`<section class="card"><h3>${esc(name(r.name))}${r.opt?tr(' · opcionális',' · optional'):''}</h3>${field('routines.'+ri+'.name',tr('Edzésnap neve','Workout day name'),name(r.name),false)}${field('routines.'+ri+'.info',tr('Nap szabályai / opcionális jelölés','Day rules / optional marker'),r.info,false)}<label class="fld"><span><input type="checkbox" data-path="routines.${ri}.opt" ${r.opt?'checked':''}> ${tr('Opcionális nap','Optional day')}</span></label>`;
        arr(r.items).forEach((i,ii)=>{
          if(!obj(i))return;const p='routines.'+ri+'.items.'+ii;
          html+=`<div class="pdf-ex"><h4>${esc(name(i.label))}</h4>${field(p+'.label',tr('Gyakorlat neve a PDF-ben','Exercise name in PDF'),name(i.label),false)}<label class="fld"><span>${tr('Pontos gyakorlatváltozat','Exact exercise variant')}</span><select data-path="${p}.ex"><option value="">${tr('Válassz…','Choose…')}</option>${options.catalog.map(x=>`<option value="${esc(x.id)}" ${x.id===i.ex?'selected':''}>${esc(hu?x.hu||x.en:x.en||x.hu)}</option>`).join('')}</select></label><div class="pdf-fields">${field(p+'.sets',tr('Sorozat','Sets'),i.sets,true)}${field(p+'.reps',tr('Ismétlés / idő','Reps / duration'),i.reps,false)}${field(p+'.rest',tr('Pihenő (mp)','Rest (sec)'),i.rest,true)}${field(p+'.rir','RIR',i.rir,false)}</div>${field(p+'.note',tr('Forrás / megjegyzés / alternatíva','Source / note / alternative'),i.note,false)}<button type="button" class="link" data-pdf="remove-exercise" data-ri="${ri}" data-ii="${ii}">${tr('Sor eltávolítása','Remove row')}</button></div>`;
        });html+=`<button type="button" class="btn" data-pdf="add-exercise" data-ri="${ri}">${tr('Gyakorlat hozzáadása','Add exercise')}</button><button type="button" class="link" data-pdf="remove-routine" data-ri="${ri}">${tr('Nap eltávolítása','Remove day')}</button></section>`;
      });
      const week=hu?['Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat','Vasárnap']:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      if(obj(raw.plan))html+=field('plan.name',tr('Étrend neve','Meal plan name'),raw.plan.name,false)+`<button type="button" class="link" data-pdf="remove-diet">${tr('Étrend kihagyása az importból','Exclude diet from import')}</button>`;
      if(obj(raw.plan))arr(raw.plan.days).forEach((d,di)=>{
        if(!obj(d))return;const p='plan.days.'+di;
        const nutrients=(prefix,v)=>`<div class="pdf-fields">${['kcal','p','c','f'].map((k,j)=>field(prefix+'.'+k,['kcal',tr('Fehérje (g)','Protein (g)'),tr('Szénhidrát (g)','Carbs (g)'),tr('Zsír (g)','Fat (g)')][j],v[k],true)).join('')}</div>`;
        html+=`<section class="card"><h3>${esc(week[di]||di)}</h3><label class="fld"><span>${tr('Nap típusa a tervben','Day type in plan')}</span><select data-path="${p}.type"><option value="">${tr('Nincs megadva','Unspecified')}</option><option value="train" ${d.type==='train'?'selected':''}>${tr('Edzésnap','Training day')}</option><option value="rest" ${d.type==='rest'?'selected':''}>${tr('Pihenőnap','Rest day')}</option></select></label>`;
        if(obj(d.total))html+=`<h4>${tr('Napi cél a PDF-ből','Daily target from PDF')}</h4>`+nutrients(p+'.total',d.total);
        else html+=`<p>${tr('Nincs leolvasott napi cél; a meglévő általános cél marad.','No extracted daily target; your existing general target remains.')}</p>`;
        arr(d.meals).forEach((m,mi)=>{if(!obj(m))return;const mp=p+'.meals.'+mi;
          html+=`<div class="pdf-ex"><h4>${esc(name(m.name))}</h4>`+field(mp+'.name',tr('Étkezés neve','Meal name'),name(m.name),false)+nutrients(mp,m);
          arr(m.items).forEach((i,ii)=>{if(!obj(i))return;html+=`<div class="pdf-fields">${field(mp+'.items.'+ii+'.n',tr('Étel','Food'),i.n,false)}${field(mp+'.items.'+ii+'.g',tr('Gramm','Grams'),i.g,true)}</div><p>${i.kcal==null?tr('Étel kcal: nincs megadva; az étkezés összértékét használjuk.','Food kcal: not provided; the meal total is used.'):esc(i.kcal)+' kcal'}</p><button type="button" class="link" data-pdf="remove-food" data-di="${di}" data-mi="${mi}" data-fi="${ii}">${tr('Étel eltávolítása','Remove food')}</button>`;});html+=`<button type="button" class="btn" data-pdf="add-food" data-di="${di}" data-mi="${mi}">${tr('Étel hozzáadása','Add food')}</button><button type="button" class="link" data-pdf="remove-meal" data-di="${di}" data-mi="${mi}">${tr('Étkezés eltávolítása','Remove meal')}</button></div>`;
        });html+=`<button type="button" class="btn" data-pdf="add-meal" data-di="${di}">${tr('Étkezés hozzáadása','Add meal')}</button><button type="button" class="link" data-pdf="target" data-di="${di}">${tr(d.total?'Napi cél eltávolítása':'Napi cél hozzáadása',d.total?'Remove daily target':'Add daily target')}</button></section>`;
      });
      if(obj(raw.plan))html+=`<section class="card"><h3>${tr('A terv szabályai','Plan rules')}</h3><ul>${arr(raw.plan.notes).concat(arr(raw.plan.train)).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
      q('preview').innerHTML=html;
      const checked=validate(raw,options.catalog,hu);
      status(checked.errors.length?tr('Kiegészítendő mezők: ','Fields to complete: ')+checked.errors.slice(0,12).join('\n'):tr('Az előnézet elkészült. Ellenőrizd az eredeti dokumentumokkal.','Preview ready. Check it against the original documents.'));
    }
    function prepare() {
      if(jsonDirty){status(tr('A szerkesztett JSON-ból előbb építs új előnézetet.','Rebuild the preview from your edited JSON first.'));return null;}
      const result=validate(raw,options.catalog,hu);
      if(result.errors.length){status(result.errors.slice(0,12).join('\n'));return null;}
      if(!q('review').checked){status(tr('Előbb ellenőrizd és jelöld jóvá az előnézetet.','First review and approve the preview.'));return null;}
      if(result.out.plan && !q('diet').checked){status(tr('Az étrend betöltéséhez jelöld jóvá az étrend cseréjét.','Approve replacing the meal plan before importing it.'));return null;}
      // IDs are generated once per reviewed draft; source documents cannot reuse saved IDs.
      if(!confirmed){const token=Date.now().toString(36)+Math.random().toString(36).slice(2,7);confirmed=result.out;
        confirmed.routines.forEach((r,ri)=>{r.id='pdf-'+token+'-'+ri;});
        if(confirmed.plan)confirmed.plan.days.forEach((d,di)=>d.meals.forEach((m,mi)=>{m.id='pdfm-'+token+'-'+di+'-'+mi;}));
      }
      return confirmed;
    }
    dialog.addEventListener('input',e=>{if(e.target===q('json')){jsonDirty=true;confirmed=null;q('review').checked=false;}});
    dialog.addEventListener('change',e=>{
      if(e.target===q('files')){files=Array.from(e.target.files);e.target.value='';raw=null;confirmed=null;q('finish').hidden=true;q('preview').replaceChildren();q('source').hidden=true;status(files.length?'':tr('Előbb válassz ki egy vagy két fájlt.','Choose one or two files first.'));}
      const path=e.target.dataset.path;if(!path||!raw)return;
      const bits=path.split('.');let parent=raw;for(const part of bits.slice(0,-1))parent=parent[part];
      parent[bits[bits.length-1]]=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?(e.target.value===''?null:Number(e.target.value)):e.target.value;
      confirmed=null;q('review').checked=false;q('json').value=JSON.stringify(raw,null,2);
    });
    dialog.addEventListener('click',async e=>{
      const button=e.target.closest('button[data-pdf]');if(!button)return;const action=button.dataset.pdf;
      if(action==='close'){close();return;}
      if(action==='convert'){
        if(busy)return;busy=true;ctl=new AbortController();q('files').disabled=true;button.disabled=true;q('finish').hidden=true;status(tr('Dokumentumok feldolgozása…','Processing documents…'));
        const timeout=setTimeout(()=>ctl.abort(),180000);
        try{const sources=await PDFLocal.extract(files,ctl.signal,(file,page,total)=>status(file+' · '+page+' / '+total));raw=PDFLocal.draft(sources,options.catalog,hu);if(dialog.isConnected){q('source').hidden=false;q('text').textContent=sources.map(s=>s.name+'\n'+s.lines.map(l=>'['+l.page+'] '+l.text).join('\n')).join('\n\n');if(!sources.some(s=>s.lines.length))raw.warnings.push(tr('A dokumentumban nincs kiolvasható szöveg. Szkennelt képből itt nincs OCR; az adatokat kézzel kell felvinni.','No extractable text. Scanned images require manual entry; this importer has no OCR.'));preview();}}
        catch(er){if(dialog.isConnected){
          const info=PDFLocal.describeError(er);
          const messages={
            size:tr('Egy vagy két PDF/DOCX/XLSX fájlt válassz, legfeljebb 12 MB összmérettel.','Select one or two PDF/DOCX/XLSX files, up to 12 MB total.'),
            file:tr('Nem olvasható vagy nem támogatott dokumentum. A régi .doc/.xls formátumot mentsd .docx/.xlsx fájlként.','Unreadable or unsupported document. Save old .doc/.xls files as .docx/.xlsx first.'),
            pages:tr('Legfeljebb 60 oldal tölthető be egyszerre.','At most 60 pages per import.'),
            length:tr('Túl hosszú szöveg. Válassz rövidebb dokumentumot.','Text too long. Select a shorter document.'),
            cancelled:tr('A beolvasás megszakadt vagy túllépte az időkorlátot. Próbáld újra.','Reading was cancelled or timed out. Try again.'),
            password:tr('A PDF jelszóval védett. Válassz jelszó nélküli példányt.','The PDF is password-protected. Select an unlocked copy.'),
            'invalid-pdf':tr('A PDF-olvasó érvénytelen PDF-szerkezetet jelzett.','The PDF reader reported an invalid PDF structure.'),
            'pdf-library':tr('A PDF-olvasó nem töltődött be. Csatlakozz az internethez, keresd meg az app frissítését, majd próbáld újra.','The PDF reader could not load. Connect to the internet, check for an app update and retry.'),
            'pdf-open':tr('A PDF megnyitása vagy a feldolgozó indítása sikertelen. Ez önmagában nem jelenti, hogy a fájl sérült.','Opening the PDF or starting its worker failed. This does not by itself mean the file is damaged.'),
            'pdf-text':tr('A PDF megnyílt, de a szövegkiolvasás leállt.','The PDF opened, but text extraction stopped.'),
            preview:tr('A dokumentum feldolgozása vagy az előnézet elkészítése leállt.','Document processing or preview creation stopped.')
          };
          status((messages[info.code]||messages.preview)+(info.detail?'\n'+info.detail:''));
        }}
        finally{clearTimeout(timeout);busy=false;ctl=null;q('files').disabled=false;button.disabled=false;}
      }
      if(raw && ['add-routine','add-diet','add-exercise','remove-exercise','remove-routine','add-meal','remove-meal','add-food','remove-food','target','remove-diet'].includes(action)){
        if(jsonDirty){status(tr('Előbb építs új előnézetet a szerkesztett JSON-ból.','Rebuild your edited JSON preview first.'));return;}
        const ri=Number(button.dataset.ri),ii=Number(button.dataset.ii),di=Number(button.dataset.di),mi=Number(button.dataset.mi);
        const emptyTotals=()=>({kcal:null,p:null,c:null,f:null});
        if(action==='add-routine'){if(!Array.isArray(raw.routines))raw.routines=[];raw.routines.push({name:'',opt:false,info:'',items:[]});}
        if(action==='add-diet'&&!raw.plan)raw.plan={name:'',targets:true,notes:[],train:[],days:Array.from({length:7},()=>({type:'',total:null,meals:[]}))};
        if(action==='add-exercise')raw.routines[ri].items.push({ex:'',label:'',sets:null,reps:'',rest:null,rir:'',note:''});
        if(action==='remove-exercise')raw.routines[ri].items.splice(ii,1);
        if(action==='remove-routine')raw.routines.splice(ri,1);
        if(action==='add-meal')raw.plan.days[di].meals.push(Object.assign({name:'',items:[]},emptyTotals()));
        if(action==='remove-meal')raw.plan.days[di].meals.splice(mi,1);
        if(action==='remove-food')raw.plan.days[di].meals[mi].items.splice(Number(button.dataset.fi),1);
        if(action==='remove-diet')raw.plan=null;
        if(action==='add-food')raw.plan.days[di].meals[mi].items.push({n:'',g:null,kcal:null});
        if(action==='target')raw.plan.days[di].total=raw.plan.days[di].total?null:emptyTotals();
        preview();return;
      }
      if(action==='rebuild'){try{raw=JSON.parse(q('json').value);preview();}catch(er){status(tr('Érvénytelen JSON.','Invalid JSON.'));}}
      if(action==='export'||action==='apply'){
        const plan=prepare();if(!plan)return;
        try{if(action==='export')await options.onExport(plan);else{if(await options.onApply(plan)!==false)close();}}
        catch(er){status(tr('Nem sikerült menteni a tervet.','Could not save the plan.'));}
      }
    });
  }
  return {open};
})();
