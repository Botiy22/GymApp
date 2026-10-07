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
      let routine=null,day=-1,meal=null,dayType='',calorieTable=null,inRules=false;
      for(const line of source.lines){
        const s=line.text.replace(/\s*\|\s*/g,' ').trim(),plain=norm(s);if(!s)continue;
        const ref=source.name+' · '+(hu?'hely ':'location ')+line.page;
        if(/^(fixed rules|rogzitett szabalyok|alapszabalyok)$/.test(plain)){inRules=true;routine=null;day=-1;meal=null;calorieTable=null;continue;}
        if(inRules){if(out.plan&&!/^page [0-9]+$/.test(plain))out.plan.notes.push(s.replace(/^[•*]\s*/,''));continue;}
        const wi=weekdays.findIndex((w,i)=>new RegExp('^'+w+'\\b|^'+enweek[i]+'\\b').test(plain));
        if(wi>=0){day=wi;routine=null;meal=null;calorieTable=null;dayType=/edzesnap|training day/.test(plain)?'train':/pihenonap|rest day/.test(plain)?'rest':'';continue;}
        const head=/^(?:([1-9][0-9]?)\s*[.)]?\s*nap|nap\s*([1-9][0-9]?)|day\s*([1-9][0-9]?))\b/i.exec(plain);
        if(head){routine={name:s.slice(0,80),opt:/opcionalis|optional/.test(plain),info:ref,items:[]};out.routines.push(routine);day=-1;meal=null;continue;}
        if(day>=0 && /^(napi osszes|napi cel|osszesen|daily total|daily target|total)\b/.test(plain)){diet().days[day].total=nutrients(s);meal=null;continue;}
        if(day>=0 && /^(reggeli|tizorai|ebed|uzsonna|vacsora|breakfast|lunch|dinner|snack|[1-9] etkezes|meal [1-9])\b/.test(plain)){
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
          const grams=/\b([0-9]+(?:[.,][0-9]+)?)\s*(?:g|gramm|grams)\b/i.exec(s);
          if(grams){const food=s.slice(0,grams.index).replace(/[|:;\s]+$/,'').trim();if(food && !/^(ossz|total|feherje|protein|szenhidrat|carbs|zsir|fat)/.test(norm(food)))meal.items.push({n:food,g:Number(grams[1].replace(',','.')),kcal:ns.kcal===null?tableKcal():ns.kcal});}
          continue;
        }
        if(routine){
          const rx=/\b([1-9][0-9]?)\s*[x×]\s*([0-9]+(?:\s*[-–]\s*[0-9]+)?)/i.exec(s);
          if(rx){
            const label=s.slice(0,rx.index).replace(/^[\s•*\-\d.)]+|[|:;\s]+$/g,'').trim();if(!label)continue;
            const exercise=PlanSheet.exercise(label,catalog);
            const rest=/(?:piheno|rest)\s*[:=]?\s*([0-9]+)\s*(mp|s|sec|perc|min)\b/i.exec(plain);
            const rir=/\brir\s*[:=]?\s*([0-9]+(?:\s*[-–]\s*[0-9]+)?)/i.exec(s);
            routine.items.push({ex:exercise,label,sets:Number(rx[1]),reps:rx[2].replace(/\s+/g,''),rest:rest?Number(rest[1])*(/perc|min/.test(rest[2])?60:1):null,rir:rir?rir[1]:'',note:ref+' · '+s.slice(rx.index+rx[0].length).trim()});
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
