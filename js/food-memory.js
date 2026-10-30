/* Private, reviewed meal portions. Frequency is derived from the diary, never a drifting counter. */
window.FoodMemory=(()=>{
  'use strict';
  const LIMIT=200,keys=['kcal','p','c','f'],round=n=>Math.round(n*10)/10;
  const id=()=> 'fm_'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  const name=s=>typeof s==='string'?s.trim().slice(0,80):'';
  const identity=s=>FoodProducts.identity(s),validId=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(s);
  function item(z){
    if(!z||!name(z.name)||!keys.every(k=>typeof z[k]==='number'&&Number.isFinite(z[k])&&z[k]>=0&&z[k]<=100000))return null;
    if(z.vml!=null&&!(typeof z.vml==='number'&&Number.isFinite(z.vml)&&z.vml>0&&z.vml<=5000))return null;
    const o={name:name(z.name),g:typeof z.g==='number'&&Number.isFinite(z.g)&&z.g>=0?round(Math.min(z.g,100000)):0};
    keys.forEach(k=>o[k]=round(z[k]));if(typeof z.vml==='number'&&Number.isFinite(z.vml)&&z.vml>0&&z.vml<=5000)o.vml=round(z.vml);return o;
  }
  function clean(list){return (Array.isArray(list)?list:[]).slice(0,LIMIT).map(m=>{
    if(!m||!validId(m.id)||!name(m.name)||!Array.isArray(m.items)||!m.items.length||m.items.length>30)return null;
    const items=m.items.map(item);if(items.some(i=>!i))return null;
    return {id:m.id,name:name(m.name),aliases:(Array.isArray(m.aliases)?m.aliases:[]).map(name).filter(Boolean).slice(0,4),items,estimated:m.estimated!==false,updatedAt:typeof m.updatedAt==='number'&&Number.isFinite(m.updatedAt)?Math.max(0,Math.min(m.updatedAt,4e12)):0};
  }).filter(Boolean).filter((m,i,a)=>a.findIndex(x=>x.id===m.id)===i);}
  function sources(doc){
    const memories=clean(doc?.foodMemories);
    for(const f of doc?.myFoods||[]){if(!(f.port>0))continue;const n=f.port/100,o=item({name:f.name,g:f.basis==='ml'?0:f.port,...(f.basis==='ml'?{vml:f.port}:{}),...Object.fromEntries(keys.map(k=>[k,f[k]*n]))});
      if(o&&!memories.some(m=>identity(m.name)===identity(f.name)))memories.push({id:'product:'+f.id,name:f.name,aliases:f.aliases||[],items:[o],estimated:false,updatedAt:f.t||0,product:true});}
    return memories;
  }
  const totals=m=>m.items.reduce((sum,i)=>{keys.forEach(k=>sum[k]=round(sum[k]+i[k]));return sum;},{kcal:0,p:0,c:0,f:0});
  function scaled(m,n=1){if(!m||!Number.isFinite(n)||n<=0||n>20||m.items.some(i=>i.g*n>100000||(i.vml||0)*n>5000||keys.some(k=>i[k]*n>100000)))return [];return m.items.map(i=>({...i,g:round(i.g*n),...(i.vml?{vml:round(i.vml*n)}:{}),...Object.fromEntries(keys.map(k=>[k,round(i[k]*n)])),memoryIds:[m.id],estimated:m.estimated}));}
  function remember(doc,items,options={}){
    doc.foodMemories=clean(doc.foodMemories);let full=false;const saved=[];
    const save=(raw,title,aliases=[])=>{
      if(!raw.length||raw.length>30)return null;
      const parts=raw.map(item);if(parts.some(x=>!x))return null;
      const signature=JSON.stringify(parts),same=doc.foodMemories.find(m=>[m.name,...m.aliases].some(a=>identity(a)===identity(title))&&JSON.stringify(m.items)===signature);
      if(same)return same;
      if(doc.foodMemories.length>=LIMIT){full=true;return null;}
      const m={id:id(),name:name(title),aliases:aliases.map(name).filter(Boolean).slice(0,4),items:parts,estimated:raw.some(i=>i.estimated!==false),updatedAt:Date.now()};doc.foodMemories.push(m);saved.push(m.id);return m;
    };
    items.forEach(i=>{const title=items.length===1&&options.name?.trim()?options.name:i.name,m=save([i],title,title!==i.name?[i.name]:[]);if(m)i.memoryIds=[...new Set([...(i.memoryIds||[]),m.id])].slice(-2);});
    if(items.length>1&&options.name?.trim()){const m=save(items,options.name);if(m)items.forEach(i=>i.memoryIds=[...new Set([...(i.memoryIds||[]),m.id])].slice(-2));}
    return {saved,full};
  }
  function rank(doc,now=Date.now()){
    const pool=sources(doc),stats=new Map(pool.map(m=>[m.id,{count:0,score:0,last:0}]));
    const current=new Date(now),today=[current.getFullYear(),String(current.getMonth()+1).padStart(2,'0'),String(current.getDate()).padStart(2,'0')].join('-'),byName=new Map();pool.filter(m=>m.items.length===1).forEach(m=>{const key=identity(m.items[0].name);byName.set(key,[...(byName.get(key)||[]),m]);});
    const entries=Object.entries(doc?.food||{}).filter(([day])=>{const age=(now-Date.parse(day+'T12:00:00'))/86400000;return day<=today&&age>=-1&&age<=90;});
    for(const [day,foods] of entries){const at=Date.parse(day+'T12:00:00'),age=Math.max(0,(now-at)/86400000),seen=new Set();for(const f of foods||[]){
      let ids=f.memoryIds||[];
      if(!ids.length)ids=(byName.get(identity(f.name))||[]).filter(m=>keys.every(k=>Math.abs(m.items[0][k]-f[k])<=Math.max(.2,m.items[0][k]*.02))).map(m=>m.id);
      for(const mid of ids){const stat=stats.get(mid),event=mid+'|'+(f.memoryBatch||f.id);if(!stat||seen.has(event))continue;seen.add(event);stat.count++;stat.score+=Math.pow(.5,age/30);stat.last=Math.max(stat.last,at);}
    }}
    return pool.map(m=>({...m,...stats.get(m.id)})).sort((a,b)=>b.score-a.score||b.last-a.last||b.updatedAt-a.updatedAt||a.name.localeCompare(b.name));
  }
  function resolve(text,doc,chosen){
    const original=String(text||'').trim(),sentence=original.replace(/^(?:(?:i (?:ate|had|drank)|ettem|ittam|megettem|megittam)\s+)/i,''),stripped=sentence.replace(/^(?:(?:a|az|egy|the|my|same|usual|szok[aá]sos|ugyanaz|ugyanazt)\s+)+/i,'');
    const portion=stripped.match(/^(\d+(?:[.,]\d+)?|fél|half)\s*(?:adag|servings?|portions?)\s+(.+)$/i);
    const pool=sources(doc),raw=FoodProducts.read(sentence),literal=pool.some(m=>[m.name,...m.aliases].some(n=>identity(n)===identity(raw.name))),d=literal?raw:FoodProducts.read(portion?portion[2]:stripped),key=identity(d.name);
    const matches=pool.filter(m=>(!chosen||m.id===chosen)&&[m.name,...m.aliases].some(n=>[n,n+'-et',n+'t',n+'ot',n+'-em',n+'-emet'].some(a=>identity(a)===key)));
    if(!matches.length)return null;
    if(matches.length>1)return [{text:d.name,original,status:'needMemory',candidates:matches.map(m=>m.id)}];
    const m=matches[0];let n=portion?/fél|half/i.test(portion[1])?.5:Number(portion[1].replace(',','.')):1;
    if(d.amount!=null){const volume=d.ml!=null,compatible=m.items.every(i=>volume?i.vml>0:!i.vml&&i.g>0),sum=m.items.reduce((s,i)=>s+(volume?i.vml||0:i.g),0);if(!compatible||!(sum>0))return [{text:d.name,original,status:'needMemoryAmount'}];n=(volume?d.ml:d.grams)/sum;}
    const list=scaled(m,n);if(list.length&&Object.keys(d.known).some(k=>Math.abs(d.known[k]-list.reduce((s,i)=>s+i[k],0))>.2))return [{text:d.name,original,status:'needLabel',conflict:true}];if(!list.length)return [{text:d.name,original,status:'needMemoryAmount'}];
    return list.map(i=>{const basisUnit=i.vml?'ml':i.g>0?'g':'portion',amount=basisUnit==='ml'?i.vml:i.g,k=basisUnit==='portion'?n:amount/100;return {status:'ok',text:i.name,name:i.name,grams:i.g,ml:i.vml||0,basisUnit,servings:n,memoryId:m.id,memoryIds:[m.id],estimated:m.estimated,exact:true,label:!m.estimated,...Object.fromEntries(keys.flatMap(key=>[[key,i[key]],[key==='kcal'?'k100':key+'100',i[key]/k]]))};});
  }
  return {LIMIT,clean,sources,totals,scaled,remember,rank,resolve};
})();
