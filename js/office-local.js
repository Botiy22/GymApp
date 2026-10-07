/* Restricted OOXML text reader for .docx/.xlsx. No macro/formula/link execution.
   Keeps table rows and cell addresses; unsupported layouts remain manual. */
window.OfficeLocal=(()=>{
  'use strict';
  const ns=(node,tag)=>Array.from(node.getElementsByTagNameNS('*',tag));
  const direct=(node,tag)=>Array.from(node.children).filter(x=>x.localName===tag);
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  let loading=null;
  function readArrayBuffer(file){
    if(typeof file.arrayBuffer==='function')return file.arrayBuffer();
    return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('file'));r.onabort=()=>reject(new DOMException('Aborted','AbortError'));r.readAsArrayBuffer(file);});
  }
  function zipLibrary(){if(window.JSZip)return Promise.resolve(window.JSZip);if(!loading)loading=new Promise((ok,fail)=>{const s=document.createElement('script');s.src='vendor/jszip/jszip.min.js';s.onload=()=>ok(window.JSZip);s.onerror=()=>{loading=null;fail(new Error('file'));};document.head.append(s);});return loading;}
  function preflight(data){
    const v=new DataView(data);let e=-1;
    for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-65557);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break;}
    if(e<0||v.getUint16(e+4,true)||v.getUint16(e+6,true))throw new Error('file');
    const count=v.getUint16(e+10,true);let pos=v.getUint32(e+16,true),total=0;
    if(count>2000||pos===0xffffffff)throw new Error('length');
    for(let i=0;i<count;i++){
      if(pos+46>v.byteLength||v.getUint32(pos,true)!==0x02014b50)throw new Error('file');
      const size=v.getUint32(pos+24,true);total+=size;
      if(size>8*1024*1024||total>24*1024*1024)throw new Error('length');
      if(v.getUint16(pos+8,true)&1)throw new Error('file');
      pos+=46+v.getUint16(pos+28,true)+v.getUint16(pos+30,true)+v.getUint16(pos+32,true);
    }
  }
  async function xml(zip,path,signal){
    if(signal.aborted)throw new DOMException('Aborted','AbortError');
    const f=zip.file(path);if(!f)throw new Error('file');const s=await f.async('string');
    if(s.length>8*1024*1024||/<!DOCTYPE|<!ENTITY/i.test(s))throw new Error('file');
    const doc=new DOMParser().parseFromString(s,'application/xml');if(ns(doc,'parsererror').length)throw new Error('file');return doc;
  }
  const text=node=>ns(node,'t').map(t=>t.textContent).join('');
  /* Label numeric columns only when an explicit recognizable header says what they mean. */
  function tableLines(rows){
    let headers=null;
    const out=[];
    for(const row of rows){
      const h=row.cells.map(value=>{const h=norm(value);if(/^(piheno|rest)\b/.test(h))return h;if(/^(mennyiseg|quantity|amount) g$/.test(h))return 'g';return h.replace(/ (?:g|db|darab|count)$/,'');});
      if(h.some(x=>/^(gyakorlat|exercise|etkezes|meal|etel|food)$/.test(x))&&h.some(x=>/^(sorozat|sets|ismetles|reps|kcal|feherje|protein|gramm|grams|g)$/.test(x))){headers=h;out.push(row);continue;}
      if(!headers){out.push(row);continue;}
      const get=rx=>{const i=headers.findIndex(h=>rx.test(h));return i<0?'':row.cells[i]||'';};
      const ex=get(/^(gyakorlat|exercise)$/),sets=get(/^(sorozat|sets)$/),reps=get(/^(ismetles|reps)$/);
      if(ex&&/^\d+$/.test(sets)&&reps){
        const parts=[ex,sets+'×'+reps],rest=get(/^(piheno|rest)\b/),rir=get(/^rir$/);
        const ri=headers.findIndex(h=>/^(piheno|rest)\b/.test(h));
        if(rest)parts.push('rest '+rest+(/\b(mp|sec|s)\b/.test(headers[ri])?' sec':/\b(perc|min)\b/.test(headers[ri])?' min':''));
        if(rir)parts.push('RIR '+rir);out.push(Object.assign({},row,{text:parts.join(' | ')}));continue;
      }
      const food=get(/^(etel|food)$/),grams=get(/^(g|gramm|grams)$/);
      if(food&&grams){const kcal=get(/^kcal$/);out.push(Object.assign({},row,{text:food+' | '+grams+' g'+(kcal?' | '+kcal+' kcal':'')}));continue;}
      const meal=get(/^(etkezes|meal)$/);
      if(meal){const parts=[meal];for(const [rx,label]of [[/^kcal$/,'kcal'],[/^(feherje|protein)$/,'feherje'],[/^(szenhidrat|carbs)$/,'szenhidrat'],[/^(zsir|fat)$/,'zsir']]){const v=get(rx);if(v)parts.push(label+': '+v);}out.push(Object.assign({},row,{text:parts.join(' | ')}));continue;}
      out.push(row);
    }
    return out;
  }
  async function extract(file,signal,onProgress){
    const extension=file.name.split('.').pop().toLowerCase();if(!['docx','xlsx'].includes(extension))throw new Error('file');
    const data=await readArrayBuffer(file);preflight(data);const ZIP=await zipLibrary(),zip=await ZIP.loadAsync(data);const lines=[],warnings=[];
    if(extension==='docx'){
      const doc=await xml(zip,'word/document.xml',signal),body=ns(doc,'body')[0];if(!body)throw new Error('file');let block=0;
      for(const child of body.children){
        block++;onProgress(file.name,block,body.children.length);
        if(child.localName==='p'){const s=text(child);if(s.trim())lines.push({page:'¶'+block,text:s});}
        if(child.localName==='tbl'){
          const rows=direct(child,'tr').map((row,i)=>{const cells=direct(row,'tc').map(cell=>ns(cell,'p').map(text).join(' '));return {page:'T'+block+'R'+(i+1),table:'T'+block,cells,text:cells.join(' | ')};});lines.push(...tableLines(rows));
        }
      }
      warnings.push('DOCX: body paragraphs and tables only; headers, footers, text boxes, comments and images are not imported.');
    }else{
      const workbook=await xml(zip,'xl/workbook.xml',signal),rels=await xml(zip,'xl/_rels/workbook.xml.rels',signal),strings=[];
      if(zip.file('xl/sharedStrings.xml')){const shared=await xml(zip,'xl/sharedStrings.xml',signal);ns(shared,'si').forEach(si=>strings.push(text(si)));}
      const sheets=ns(workbook,'sheet');if(sheets.length>30)throw new Error('length');let count=0;
      for(const [index,sheet]of sheets.entries()){
        onProgress(file.name,index+1,sheets.length);const id=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sheet.getAttributeNS('http://purl.oclc.org/ooxml/officeDocument/relationships','id');
        const rel=ns(rels,'Relationship').find(r=>r.getAttribute('Id')===id);
        if(!rel||rel.getAttribute('TargetMode')==='External'){warnings.push('Skipped external or missing worksheet: '+sheet.getAttribute('name'));continue;}
        const target=rel.getAttribute('Target')||'';if(target.includes('..')||/^[a-z]+:/i.test(target))throw new Error('file');
        const path=target.startsWith('/')?target.slice(1):'xl/'+target;const doc=await xml(zip,path,signal),rows=[];
        const merged=[];
        for(const cell of ns(doc,'mergeCell')){const m=/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(cell.getAttribute('ref')||'');if(m)merged.push({first:m[1]+m[2],col:m[1],start:+m[2],end:+m[4]});}
        const savedCells={};ns(doc,'c').forEach(cell=>{const v=direct(cell,'v')[0],kind=cell.getAttribute('t');savedCells[cell.getAttribute('r')]=kind==='s'&&v?strings[Number(v.textContent)]||'':kind==='inlineStr'?text(cell):v?v.textContent:'';});
        lines.push({page:sheet.getAttribute('name'),text:sheet.getAttribute('name')});
        for(const row of ns(doc,'row')){
          if(++count>10000)throw new Error('length');const cells=[];
          for(const cell of direct(row,'c')){
            const ref=cell.getAttribute('r')||'',col=/^([A-Z]+)/.exec(ref);if(!col)continue;
            const at=Array.from(col[1]).reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;if(at>255)throw new Error('length');
            const type=cell.getAttribute('t'),value=direct(cell,'v')[0];let s=value?value.textContent:'';
            if(type==='s')s=value&&s!==''?(strings[Number(s)]||''):'';else if(type==='inlineStr')s=text(cell);else if(type==='e')s='';
            if(direct(cell,'f').length){warnings.push(sheet.getAttribute('name')+'!'+ref+': formula uses the saved value only; no recalculation.');}
            cells[at]=s;
          }
          const rowNumber=+row.getAttribute('r'),inherited={};
          for(const merge of merged)if(rowNumber>=merge.start&&rowNumber<=merge.end){const col=Array.from(merge.col).reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;inherited[col]=savedCells[merge.first]||'';}
          if(cells.some(Boolean))rows.push({page:sheet.getAttribute('name')+'!'+row.getAttribute('r'),sheet:sheet.getAttribute('name'),row:rowNumber,merged:inherited,cells:Array.from(cells,x=>x||''),text:cells.join(' | ')});
        }
        lines.push(...rows);
      }
      warnings.push('XLSX: saved cell values are used. Formulas are not recalculated; drawings and external links are not imported.');
    }
    if(lines.reduce((n,l)=>n+l.text.length,0)>200000)throw new Error('length');return {name:file.name,kind:extension,lines,warnings};
  }
  return {extract};
})();
