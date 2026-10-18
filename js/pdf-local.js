/* Local PDF text extraction. PDF.js 5.6.205, Apache-2.0, bundled under vendor/pdfjs.
   Text-only: no rendering, embedded JavaScript, remote fonts, evaluation or OCR. */
window.PDFLocal = (() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const MAX = 12 * 1024 * 1024;
  function readArrayBuffer(file) {
    if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('file'));
      reader.onabort = () => reject(new DOMException('Aborted','AbortError'));
      reader.readAsArrayBuffer(file);
    });
  }
  function atStage(error, stage) {
    const e = new Error(error && error.message ? error.message : String(error));
    e.name = error && error.name ? error.name : 'Error';
    e.importStage = stage;
    return e;
  }
  function describeError(error) {
    if (error && error.name === 'AbortError') return {code:'cancelled',detail:''};
    if (error && error.name === 'PasswordException') return {code:'password',detail:''};
    if (error && error.name === 'InvalidPDFException') return {code:'invalid-pdf',detail:''};
    const message = String(error && error.message || '');
    if (['size','file','pages','length'].includes(message)) return {code:message,detail:''};
    const detail = (String(error && error.name || 'Error') + ': ' + message).replace(/[\r\n]+/g,' ').slice(0,180);
    return {code:error && error.importStage || 'preview',detail};
  }
  // PDF.js 5.6 getTextContent uses ReadableStream's async iterator, which some
  // Safari versions lack (upstream #20973). Read the public stream API directly;
  // no global polyfill or change to the vendored library is needed.
  async function pageText(page, signal, remaining) {
    const reader = page.streamTextContent().getReader(), items = [];
    let finished = false, size = 0;
    const abort = () => { reader.cancel().catch(() => {}); };
    signal.addEventListener('abort', abort, {once:true});
    try {
      for (;;) {
        if (signal.aborted) throw new DOMException('Aborted','AbortError');
        const chunk = await reader.read();
        if (signal.aborted) throw new DOMException('Aborted','AbortError');
        if (chunk.done) { finished = true; break; }
        for (const item of chunk.value.items || []) {
          size += typeof item.str === 'string' ? item.str.length : 0;
          if (size > remaining) throw new Error('length');
          items.push(item);
        }
      }
      return {items};
    } finally {
      signal.removeEventListener('abort', abort);
      if (!finished) { try { await reader.cancel(); } catch (e) {} }
      reader.releaseLock();
    }
  }
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const blankDay=()=>({type:'',total:null,meals:[]});
  // "3-4 min", "60-90 sec", "2.5-3 perc", "90 mp": the middle of a range, in seconds, rounded to 15 s.
  const restSeconds=text=>{
    const m=/([0-9]+(?:[.,][0-9]+)?)(?:\s*[-–]\s*([0-9]+(?:[.,][0-9]+)?))?\s*(mp|masodperc|s|sec|secs|seconds?|p|perc|min|mins|minutes?)\b/.exec(String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
    if(!m)return null;const a=Number(m[1].replace(',','.')),b=m[2]?Number(m[2].replace(',','.')):a,unit=/^(p|perc|min)/.test(m[3])?60:1,sec=(a+b)/2*unit;
    return sec>0&&sec<=3600?Math.round(sec/15)*15:null;
  };
  const LABEL_TRIM=/^(?:[\s•*·\-–>]+|\d{1,2}\s*[.)]\s*|[A-Za-z]\d\s*[.):]?\s+)+|[|:;,\s–-]+$/g;   // bullets, "1." numbering, superset codes such as "A1)"
  // Sets and reps in every common spelling: 3x8, 3 × 8-12, 4x8,8,6, 3x AMRAP, 3x30 mp, "4 sets of 10", "4 sorozat 8-10 ismétlés".
  function scheme(s){
    const reps='(\\d+(?:\\s*[-–]\\s*\\d+)?(?:\\s*[,/]\\s*\\d+(?!\\s*(?:kg|g)\\b))*(?:\\s*(?:mp|s|sec|secs|perc|min)\\b)?|amrap|max(?:imum)?)';
    let m=new RegExp('(?:^|[\\s|:(–-])([1-9][0-9]?)\\s*[x×*]\\s*'+reps,'i').exec(s);
    if(!m)m=new RegExp('(?:^|[\\s|:(–-])([1-9][0-9]?)\\s*(?:sets?|sorozat|sor)\\b\\s*(?:of|x|×|,|-|–)?\\s*'+reps+'\\s*(?:reps?|ism[eé]tl[eé]s(?:sel)?|ism\\.?)?','i').exec(s);
    if(!m)return null;
    const lead=m[0].length-m[0].replace(/^[\s|:(–-]+/,'').length,text=m[0].slice(lead).trim();
    return {index:m.index+lead,text,sets:Number(m[1]),reps:m[2].replace(/\s+/g,'').replace(/^maximum$/i,'max').toUpperCase()==='AMRAP'?'AMRAP':m[2].replace(/\s+(?=[a-z])/gi,' ').replace(/\s*([-–,/])\s*/g,'$1').trim()};
  }
  // A short title line: no table cells, no sentence punctuation, not a page number.
  const isHeading=s=>s.length>=3&&s.length<=60&&!s.includes('|')&&!/[.!?]\s|[.!?:]$/.test(s)&&/\p{L}{3}/u.test(s)&&!/^(page|oldal)\s*\d+$/i.test(s)&&!/^\d/.test(s);
  const titleCase=s=>s===s.toUpperCase()&&/[A-ZÁÉÍÓÖŐÚÜŰ]{3}/.test(s)?s.toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase()).replace(/\b([a-zA-Z])\b/g,c=>c.toUpperCase()):s;
  const nutrients=s=>{
    s=String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const value=labels=>{
      const label='(?:'+labels+')',num='([0-9]+(?:[.,][0-9]+)?)';
      const a=new RegExp('\\b'+label+'\\s*[:=]?\\s*'+num,'i').exec(s);
      const b=new RegExp(num+'\\s*(?:g\\s*)?'+label+'\\b','i').exec(s);
      return a||b?Number((a||b)[1].replace(',','.')):null;
    };
    return {kcal:value('kcal|kaloria|calories'),p:value('feherje|protein'),c:value('szenhidrat|carbs|carbohydrate'),f:value('zsir|fat')};
  };
  function draft(sources,catalog,hu,mappings) {
    const out={app:'gymapp',kind:'plan',appendRoutines:true,appendMeals:true,routines:[],plan:null,unassignedMeals:[],pendingTables:[],warnings:[]};
    const weekdays=['hetfo','kedd','szerda','csutortok','pentek','szombat','vasarnap'];
    const enweek=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const diet=()=>out.plan||(out.plan={name:hu?'PDF étrend':'PDF meal plan',targets:true,days:Array.from({length:7},blankDay),notes:[],train:[]});
    for(const source of sources){
      if(source.kind==='xlsx'){
        const parsed=PlanSheet.parse(source,catalog,hu,mappings);
        out.routines.push(...parsed.routines);out.unassignedMeals.push(...parsed.unassignedMeals);out.pendingTables.push(...parsed.pendingTables);out.warnings.push(...parsed.warnings,...(source.warnings||[]));
        if(parsed.plan){const p=diet();p.name=parsed.plan.name;parsed.plan.days.forEach((d,i)=>{p.days[i].meals.push(...d.meals);if(d.total)p.days[i].total=d.total;if(d.type)p.days[i].type=d.type;});}
        continue;
      }
      let routine=null,day=-1,meal=null,dayType='',calorieTable=null,inRules=false,cols=null,heading='',newHeading=false,weekdayHead=false;
      const listed=new Set();   // a weekday heading becomes a workout only once an exercise row follows it
      for(const line of source.lines){
        const s=line.text.replace(/\s*\|\s*/g,' ').trim(),plain=norm(s);if(!s)continue;
        const ref=source.name+' · '+(hu?'hely ':'location ')+line.page;
        if(/^(fixed rules|rogzitett szabalyok|alapszabalyok)$/.test(plain)){inRules=true;routine=null;day=-1;meal=null;calorieTable=null;continue;}
        if(inRules){if(out.plan&&!/^page [0-9]+$/.test(plain))out.plan.notes.push(s.replace(/^[•*]\s*/,''));continue;}
        const wi=weekdays.findIndex((w,i)=>new RegExp('^'+w+'\\b|^'+enweek[i]+'\\b').test(plain));
        if(wi>=0){
          day=wi;meal=null;calorieTable=null;cols=null;dayType=/edzesnap|training day/.test(plain)?'train':/pihenonap|rest day/.test(plain)?'rest':'';
          // "THURSDAY - UPPER A / STRENGTH": a short weekday heading may introduce an exercise table instead of meals.
          routine=s.length<=70&&!/[:.]\s/.test(s)?{name:titleCase(s).slice(0,80),opt:/opcionalis|optional/.test(plain),info:ref,items:[]}:null;
          weekdayHead=!!routine;newHeading=false;heading=routine?s:heading;
          continue;
        }
        const head=/^(?:([1-9][0-9]?)\s*[.)]?\s*nap|nap\s*([1-9][0-9]?)|day\s*([1-9][0-9]?))\b/i.exec(plain);
        if(head){routine={name:s.slice(0,80),opt:/opcionalis|optional/.test(plain),info:ref,items:[]};out.routines.push(routine);listed.add(routine);day=-1;meal=null;cols=null;newHeading=false;weekdayHead=false;continue;}
        if(day>=0 && /^(napi osszes|napi cel|osszesen|daily total|daily target|total)\b/.test(plain)){diet().days[day].total=nutrients(s);meal=null;continue;}
        if(day>=0 && /^(reggeli|tizorai|ebed|uzsonna|vacsora|breakfast|lunch|dinner|supper|snack|nasi|[1-9] etkezes|etkezes [1-9]|meal [1-9]|pre workout|post workout|edzes elott|edzes utan)\b/.test(plain)){
          calorieTable=null;meal=Object.assign({name:s.split(/[:|]/)[0].replace(/\s+(?:kcal|kaloria|calories|protein|feherje|carbs|szenhidrat|fat|zsir)\b.*$/i,'').slice(0,40),items:[]},nutrients(s));diet().days[day].type=dayType;diet().days[day].meals.push(meal);continue;
        }
        if(day>=0 && meal){
          const ns=nutrients(s);
          const columns=line.text.split('|').map(c=>c.trim()).filter(Boolean);
          const calorieIndex=columns.findIndex(c=>/^(kcal|calories|kaloria)$/.test(norm(c)));
          if(calorieIndex>=0 && columns.some(c=>/^(food|etel|elelmiszer)$/.test(norm(c))) && columns.some(c=>/^(amount|quantity|mennyiseg|gramm|grams)$/.test(norm(c)))){
            const header=(line.cells||[]).find(c=>/^(kcal|calories|kaloria)$/.test(norm(c.text)));
            const next=header&&(line.cells||[]).find(c=>c.x>header.x+3&&c.text.trim());
            calorieTable={index:calorieIndex,x:header&&header.x,end:next&&next.x,page:line.page};continue;
          }
          // A PDF's calorie heading labels the column, rather than every number.
          // Only use unlabelled numbers while that explicit table is active.
          const tableKcal=()=>{
            if(!calorieTable||calorieTable.page!==line.page)return null;
            const cell=calorieTable.x!=null&&line.cells?
              line.cells.filter(c=>c.x>=calorieTable.x-3&&(calorieTable.end==null||c.x<calorieTable.end-3)).map(c=>c.text).join(' ').trim():columns[calorieTable.index];
            return cell&&/^[0-9]+(?:[.,][0-9]+)?$/.test(cell)?Number(cell.replace(',','.')):null;
          };
          const mealTotal=/^(meal total|etkezes osszesen|etkezesi osszes|osszesen|ossz|total)\b/.test(plain);
          const macros=/^(meal macros|meal nutrition|makrok|etkezesi makrok)\b/.test(plain);
          const summary=mealTotal||macros||/^(?:(?:kcal|kaloria|energia|feherje|protein|szenhidrat|carbs|zsir|fat)\s*[:=]?\s*[0-9]|[0-9]+(?:[.,][0-9]+)?\s*kcal)/i.test(s.normalize('NFD').replace(/[\u0300-\u036f]/g,''));
          if(summary){
            if(mealTotal&&ns.kcal===null)ns.kcal=tableKcal();
            for(const k of ['kcal','p','c','f'])if(ns[k]!==null)meal[k]=ns[k];
            continue;
          }
          const grams=/\b([0-9]+(?:[.,][0-9]+)?)\s*(?:g|gr|gramm|grams|ml)\b\.?/i.exec(s);
          // "Zabpehely 80 g" and "80 g zabpehely" both name the food.
          if(grams){const food=(s.slice(0,grams.index).replace(/^[\s•*·\-–]+|[|:;,\s–-]+$/g,'')||s.slice(grams.index+grams[0].length).replace(/^[\s|:;,–-]+|[|:;,\s]+$/g,'').replace(/\s*\d+(?:[.,]\d+)?\s*kcal.*$/i,'')).trim();if(food && !/^(ossz|total|feherje|protein|szenhidrat|carbs|zsir|fat)/.test(norm(food)))meal.items.push({n:food,g:Number(grams[1].replace(',','.')),kcal:ns.kcal===null?tableKcal():ns.kcal});}
          continue;
        }
        {
          // A table heading such as "Exercise | Sets x Reps | RIR | Rest" says which unlabelled column holds RIR and rest.
          const columns=line.text.split('|').map(c=>c.trim()).filter(Boolean),names=columns.map(norm);
          if(columns.length>1&&names.some(c=>/^(exercise|exercises|gyakorlat|gyakorlatok|feladat|movement)$/.test(c))&&names.some(c=>/sets|reps|sorozat|ismetles|volume/.test(c))){
            cols={n:columns.length,rir:names.findIndex(c=>/^(rir|rpe)$/.test(c)),rest:names.findIndex(c=>/^(rest|rest time|piheno|pihenoido|szunet)\b/.test(c))};continue;
          }
          const rx=scheme(s);
          if(rx){
            let label=s.slice(0,rx.index).replace(LABEL_TRIM,'').trim();
            if(!label)label=s.slice(rx.index+rx.text.length).replace(/^[\s|:;,–-]+/,'').replace(/\s*(?:rest|pihenő|piheno|rir|rpe)\b.*$/i,'').replace(LABEL_TRIM,'').trim();   // "3x8 Bench press"
            if(!label||label.length>80)continue;
            // A routine needs a heading: weekday or "Day 1" lines, otherwise the last short title line ("PUSH DAY", "Upper A", "Mell + tricepsz").
            if(!routine||newHeading){routine={name:titleCase(heading||(hu?'Edzés':'Workout')+' '+(out.routines.length+1)).slice(0,80),opt:/opcionalis|optional/.test(norm(heading)),info:ref,items:[]};newHeading=false;}
            const exercise=PlanSheet.exercise(label,catalog),table=cols&&columns.length===cols.n;
            const rest=table&&cols.rest>=0?restSeconds(columns[cols.rest]):(r=>r?restSeconds(r[1]):null)(/(?:piheno|rest|szunet)\s*[:=]?\s*([0-9].*)$/i.exec(s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
            const rirCell=table&&cols.rir>=0?/^([0-9]+(?:[.,][0-9])?(?:\s*[-–]\s*[0-9]+(?:[.,][0-9])?)?)$/.exec(columns[cols.rir]):null,rir=rirCell||/\b(?:rir|rpe)\s*[:=@]?\s*([0-9]+(?:\s*[-–]\s*[0-9]+)?)/i.exec(s);
            const extra=table?(columns.find(c=>c.includes(rx.text))||'').replace(rx.text,'').trim():s.slice(rx.index+rx.text.length).trim();
            if(!listed.has(routine)){out.routines.push(routine);listed.add(routine);}
            routine.items.push({ex:exercise,label,sets:rx.sets,reps:rx.reps,rest,rir:rir?rir[1].replace(/\s+/g,''):'',note:ref+(extra?' · '+extra:'')});
            continue;
          }
          if(isHeading(s)){
            if(routine&&!listed.has(routine)&&!routine.items.length&&weekdayHead){routine.name=(routine.name+' – '+titleCase(s)).slice(0,80);weekdayHead=false;}   // "MONDAY" then "Push day"
            else{heading=s;if(routine&&routine.items.length)newHeading=true;else if(routine&&!weekdayHead)routine=null;}
          }
        }
      }
      out.warnings.push(...(source.warnings||[]));
    }
    if(out.plan)out.plan.notes=out.plan.notes.concat(sources.map(s=>hu?'Forrás: '+s.name:'Source: '+s.name));
    if(!out.routines.length&&!out.plan)out.warnings.push(hu?'Nem ismertem fel a terv szerkezetét. A kiolvasott szöveg alapján az alábbi szerkesztőben felépítheted.':'Plan layout not recognized. Build it in the editor below using the extracted text.');
    return out;
  }
  async function extract(files,signal,onProgress) {
    if(!files.length||files.length>2||files.reduce((n,f)=>n+f.size,0)>MAX)throw new Error('size');
    let lib=null;
    const sources=[];let pages=0,characters=0;
    for(const file of files){
      if(signal.aborted)throw new DOMException('Aborted','AbortError');
      if(/\.(docx|xlsx)$/i.test(file.name)){const source=await OfficeLocal.extract(file,signal,onProgress);characters+=source.lines.reduce((n,l)=>n+l.text.length,0);if(characters>200000)throw new Error('length');sources.push(source);continue;}
      if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')throw new Error('file');
      if(!lib){try{lib=await import(new URL('../vendor/pdfjs/pdf.min.mjs',scriptURL).href);lib.GlobalWorkerOptions.workerSrc=new URL('../vendor/pdfjs/pdf.worker.min.mjs',scriptURL).href;}catch(error){throw atStage(error,'pdf-library');}}
      const data=new Uint8Array(await readArrayBuffer(file));
      if(String.fromCharCode(...data.slice(0,5))!=='%PDF-')throw new Error('file');
      const task=lib.getDocument({data,isEvalSupported:false,useSystemFonts:false,disableFontFace:true,useWorkerFetch:false,enableXfa:false,stopAtErrors:true});
      const abort=()=>{task.destroy().catch(()=>{});};signal.addEventListener('abort',abort,{once:true});
      try{
        let pdf;try{pdf=await task.promise;}catch(error){throw atStage(error,'pdf-open');}
        pages+=pdf.numPages;if(pages>60)throw new Error('pages');const lines=[];
        for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
          if(signal.aborted)throw new DOMException('Aborted','AbortError');onProgress(file.name,pageNumber,pdf.numPages);
          let page,content;
          try{page=await pdf.getPage(pageNumber);content=await pageText(page,signal,200000-characters);}catch(error){if(page)page.cleanup();throw atStage(error,'pdf-text');}
          const rows=[];
          for(const item of content.items){if(!item.str)continue;const y=item.transform[5],x=item.transform[4];let row=rows.find(r=>Math.abs(r.y-y)<3);if(!row){row={y,items:[]};rows.push(row);}row.items.push({x,text:item.str});}
          rows.sort((a,b)=>b.y-a.y).forEach(row=>{const cells=row.items.filter(c=>c.text.trim()).sort((a,b)=>a.x-b.x);const s=cells.map(c=>c.text).join(' | ');characters+=s.length;if(characters>200000)throw new Error('length');lines.push({page:pageNumber,text:s,cells});});page.cleanup();
        }
        sources.push({name:file.name,lines});
      }finally{signal.removeEventListener('abort',abort);try{await task.destroy();}catch(error){/* Cleanup must not hide the original reading error. */}}
    }
    return sources;
  }
  return {extract,draft,describeError};
})();
