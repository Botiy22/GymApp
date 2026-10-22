/* Private day planning and RFC 5545 calendar import. ICAL.js is vendored under MPL-2.0.
   No calendar URLs or credentials enter exported/synced planner documents. */
window.DailyPlanner = (function () {
  'use strict';
  const categories = ['gym','swim','run','focus','personal','recovery','other'];
  const day = ms => { const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const validDay = s => typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&day(new Date(s+'T12:00').getTime())===s;
  const text = (s,n) => typeof s==='string'?s.slice(0,n).trim():'';
  const stamp = v => Number.isFinite(v)&&v>=0&&v<4e12?v:0;
  const id = v => typeof v==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(v)?v:'';
  function cleanEvent(e) {
    if(!e||!id(e.id)||!text(e.title,100)||!stamp(e.start)||!stamp(e.end)||e.end<=e.start||e.end-e.start>366*864e5)return null;
    const done={};Object.entries(e.done||{}).slice(-800).forEach(([d,v])=>{if(validDay(d)&&v&&stamp(v.at))done[d]={value:v.value===true,at:v.at};});
    return {id:e.id,title:text(e.title,100),start:e.start,end:e.end,allDay:e.allDay===true,category:categories.includes(e.category)?e.category:'other',repeat:['daily','weekdays','weekly'].includes(e.repeat)&&!e.source?e.repeat:'none',note:text(e.note,500),source:id(e.source),externalId:text(e.externalId,300),updatedAt:stamp(e.updatedAt),done};
  }
  function clean(p) {
    const unique=a=>a.filter((x,i)=>x&&a.findIndex(y=>y?.id===x.id)===i);
    return {events:unique((Array.isArray(p?.events)?p.events:[]).slice(-6000).map(cleanEvent)),sources:unique((Array.isArray(p?.sources)?p.sources:[]).slice(0,8).map(s=>s&&id(s.id)&&text(s.name,80)?{id:s.id,name:text(s.name,80),kind:s.kind==='feed'?'feed':'file',syncedAt:stamp(s.syncedAt),updatedAt:stamp(s.updatedAt)}:null))};
  }
  function merge(a,b,deleted={}) {
    a=clean(a);b=clean(b);
    const join=(left,right)=>{const rows=new Map();[...left,...right].forEach(x=>{if(deleted[x.id])return;const old=rows.get(x.id);const next=!old||x.updatedAt>old.updatedAt?{...x}:{...old};if(old&&x.done){next.done={...old.done};Object.entries(x.done).forEach(([d,v])=>{if(!next.done[d]||v.at>next.done[d].at)next.done[d]=v;});}rows.set(x.id,next);});return [...rows.values()];};
    const sources=join(a.sources,b.sources),ids=new Set(sources.map(s=>s.id));
    return {events:join(a.events,b.events).filter(e=>!e.source||ids.has(e.source)),sources};
  }
  function occurrences(p,d) {
    if(!validDay(d))return [];
    const start=new Date(d+'T00:00').getTime(),end=new Date(d+'T00:00');end.setDate(end.getDate()+1);
    return clean(p).events.flatMap(e=>{
      const candidates=[];
      if(e.repeat==='none')candidates.push({from:e.start,to:e.end,occurrenceDay:d});
      else for(const offset of [-1,0]){
        const at=new Date(start);at.setDate(at.getDate()+offset);const key=day(+at),weekDay=at.getDay();
        if(key<day(e.start)||e.repeat==='weekdays'&&(weekDay===0||weekDay===6)||e.repeat==='weekly'&&weekDay!==new Date(e.start).getDay())continue;
        const original=new Date(e.start);at.setHours(original.getHours(),original.getMinutes(),0,0);
        let to=+at+(e.end-e.start);if(e.allDay){const next=new Date(at);next.setDate(next.getDate()+1);to=+next;}
        candidates.push({from:+at,to,occurrenceDay:key});
      }
      return candidates.filter(c=>c.from<+end&&c.to>start).map(c=>({...e,start:c.from,end:c.to,day:d,occurrenceDay:c.occurrenceDay,complete:e.done[c.occurrenceDay]?.value===true}));
    }).sort((a,b)=>Number(b.allDay)-Number(a.allDay)||a.start-b.start||a.title.localeCompare(b.title));
  }
  function layout(events,d) {
    const rows=events.filter(e=>!e.allDay).map(e=>({...e,from:day(e.start)<d?0:new Date(e.start).getHours()*60+new Date(e.start).getMinutes(),to:day(e.end)>d?1440:new Date(e.end).getHours()*60+new Date(e.end).getMinutes()}));
    let group=[],until=0;const finish=()=>{if(!group.length)return;let ends=[];group.forEach(e=>{let lane=ends.findIndex(end=>end<=e.from);if(lane<0)lane=ends.length;e.lane=lane;ends[lane]=Math.max(e.to,e.from+30);});group.forEach(e=>e.lanes=ends.length);group=[];};
    rows.forEach(e=>{if(e.from>=until)finish();group.push(e);until=Math.max(until,Math.max(e.to,e.from+30));});finish();return rows;
  }
  function hash(s){let a=2166136261,b=5381;for(const ch of s){a=Math.imul(a^ch.charCodeAt(0),16777619);b=Math.imul(b,33)^ch.charCodeAt(0);}return (a>>>0).toString(36)+(b>>>0).toString(36);}
  const fail=code=>{throw Object.assign(new Error(code),{code});};
  function parseICS(raw,source,now=Date.now()) {
    if(typeof raw!=='string'||raw.length>2*1024*1024||!/BEGIN:VCALENDAR/i.test(raw)||!id(source))return fail('plannerInvalidCalendar');
    const lower=new Date(now),upper=new Date(now);lower.setDate(lower.getDate()-90);upper.setDate(upper.getDate()+366);
    let root;try{root=new ICAL.Component(ICAL.parse(raw));}catch(_){return fail('plannerInvalidCalendar');}
    if(root.name!=='vcalendar')return fail('plannerInvalidCalendar');
    // Component-local zones avoid leaking one calendar's timezone definitions into another.
    const components=root.getAllSubcomponents('vevent');
    ICAL.TimezoneService.register('Etc/UTC',ICAL.Timezone.utcTimezone);if(components.length>4000)return fail('plannerCalendarLimit');
    let steps=0;const out=[],seen=new Set();
    const ms=time=>{
      if(time.isDate||time.zone===ICAL.Timezone.localTimezone)return +new Date(time.year,time.month-1,time.day,time.hour,time.minute,time.second);
      return time.toUnixTime()*1000;
    };
    const add=(event,from,to,key)=>{
      if(String(event.component.getFirstPropertyValue('status')).toUpperCase()==='CANCELLED')return;
      const start=ms(from),end=ms(to);if(end<=+lower||start>=+upper)return;
      const identity=String(event.uid||hash(event.component.toString()))+'|'+key,identityHash='pi_'+source+'_'+hash(identity);if(seen.has(identityHash))return;seen.add(identityHash);
      const title=text(event.summary,100);if(!title)return;
      out.push({id:identityHash,title,start,end:end>start?end:start+(from.isDate?864e5:36e5),allDay:from.isDate,category:'other',repeat:'none',note:text(event.location,500),source,externalId:identity,updatedAt:now,done:{}});
      if(out.length>2000)return fail('plannerCalendarLimit');
    };
    try{
      // Resolve only TZIDs with actual definitions. Unknown zones must never silently shift events.
      for(const c of components)for(const name of ['dtstart','dtend','recurrence-id','exdate','rdate'])for(const p of c.getAllProperties(name)){
        const tz=p.getParameter('tzid');if(tz&&tz!=='UTC'&&tz!=='Etc/UTC'&&!root.getTimeZoneByID(tz))return fail('plannerCalendarZone');
      }
      for(const c of components){
        if(c.hasProperty('recurrence-id')&&components.some(master=>!master.hasProperty('recurrence-id')&&master.getFirstPropertyValue('uid')===c.getFirstPropertyValue('uid')))continue;
        const event=new ICAL.Event(c);if(!c.hasProperty('dtstart'))return fail('plannerInvalidCalendar');
        if(event.isRecurring()){
          const rule=c.getFirstPropertyValue('rrule');if(rule&&!['DAILY','WEEKLY','MONTHLY','YEARLY'].includes(rule.freq))return fail('plannerCalendarFrequency');
          const iterator=event.iterator();let next;
          while((next=iterator.next())){
            if(++steps>40000)return fail('plannerCalendarLimit');
            if(ms(next)>=+upper)break;
            const detail=event.getOccurrenceDetails(next);add(detail.item,detail.startDate,detail.endDate,next.toString());
          }
        }else add(event,event.startDate,event.endDate,c.getFirstPropertyValue('recurrence-id')?.toString()||'single');
      }
    }catch(e){if(e.code)throw e;return fail('plannerInvalidCalendar');}
    return out;
  }
  function replaceSource(p,source,events,now=Date.now()) {
    p=clean(p);const previous=new Map(p.events.filter(e=>e.source===source.id).map(e=>[e.id,e]));
    const incoming=events.map(e=>({...e,done:previous.get(e.id)?.done||{}}));
    if(p.events.filter(e=>e.source!==source.id).length+incoming.length>6000)return fail('plannerCalendarLimit');
    return clean({events:p.events.filter(e=>e.source!==source.id).concat(incoming),sources:p.sources.filter(s=>s.id!==source.id).concat([{...source,syncedAt:now,updatedAt:now}])});
  }
  return {categories,clean,cleanEvent,merge,day,validDay,occurrences,layout,parseICS,replaceSource,hash};
})();
