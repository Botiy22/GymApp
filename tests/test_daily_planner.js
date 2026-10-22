const {test}=require('node:test');const assert=require('node:assert/strict');
global.window=global;global.ICAL=require('../vendor/ical/ical.min.js');require('../js/daily-planner.js');
const P=DailyPlanner,now=+new Date('2026-10-22T12:00:00Z'),cal=events=>'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'+events+'\r\nEND:VCALENDAR',event=body=>'BEGIN:VEVENT\r\n'+body+'\r\nEND:VEVENT';
const base={id:'pe_test',title:'Gym',start:+new Date('2026-10-22T09:00'),end:+new Date('2026-10-22T10:00'),repeat:'weekly',updatedAt:now};
test('local repeating events, completion, time bounds and collision lanes',()=>{
 const p=P.clean({events:[base,{...base,id:'pe_two',start:base.start+18e5,end:base.end+18e5},{...base,id:'pe_three',start:base.end+18e5,end:base.end+36e5}]});
 assert.equal(P.occurrences(p,'2026-10-29').length,3);assert.equal(P.occurrences(p,'2026-10-23').length,0);
 assert.deepEqual(P.layout(P.occurrences(p,'2026-10-22'),'2026-10-22').map(e=>[e.lane,e.lanes]),[[0,2],[1,2],[0,1]]);
 assert.equal(P.clean({events:[{...base,title:''},{...base,end:base.start-1}]}).events.length,0);
});
test('private records merge independently, explicit completion undo and source deletions survive',()=>{
 const a={events:[{...base,done:{'2026-10-22':{value:true,at:5}}}]},b={events:[{...base,title:'Updated',updatedAt:now+1,done:{'2026-10-22':{value:false,at:7}}},{...base,id:'pe_other'}]};
 const merged=P.merge(a,b);assert.equal(merged.events.length,2);assert.equal(merged.events[0].title,'Updated');assert.equal(merged.events[0].done['2026-10-22'].value,false);assert.equal(P.merge(a,b,{pe_test:10}).events.length,1);
 const source={id:'pc_source',name:'Calendar',kind:'file',updatedAt:10};assert.equal(P.merge({sources:[source],events:[{...base,source:source.id}]},null,{pc_source:11}).events.length,0);
});
test('ICS recurrence, exclusion, exceptions, folded text and idempotent resync',()=>{
 const raw=cal(event('UID:week\r\nDTSTART:20261022T090000Z\r\nDTEND:20261022T100000Z\r\nSUMMARY:Strength\\, gym\r\nRRULE:FREQ=WEEKLY;COUNT=3\r\nEXDATE:20261029T090000Z')+'\r\n'+event('UID:week\r\nRECURRENCE-ID:20261105T090000Z\r\nDTSTART:20261105T110000Z\r\nDTEND:20261105T120000Z\r\nSUMMARY:Changed\r\n  time'));
 const events=P.parseICS(raw,'pc_src',now);assert.equal(events.length,2);assert.equal(events[0].title,'Strength, gym');assert.equal(events[1].start,+new Date('2026-11-05T11:00Z'));assert.equal(events[1].title,'Changed time');
 let p=P.replaceSource(null,{id:'pc_src',name:'Test',kind:'file'},events,now);p.events[0].done={'2026-10-22':{value:true,at:now}};
 p=P.replaceSource(p,p.sources[0],P.parseICS(raw,'pc_src',now+1),now+1);assert.equal(p.events.length,2);assert.equal(p.events[0].done['2026-10-22'].value,true);
 p=P.replaceSource(p,p.sources[0],[],now+2);assert.equal(p.events.length,0);
});
test('all-day exclusive end and overnight event are visible on the correct days',()=>{
 const raw=cal(event('UID:day\r\nDTSTART;VALUE=DATE:20261022\r\nDTEND;VALUE=DATE:20261024\r\nSUMMARY:Trip')+'\r\n'+event('UID:night\r\nDTSTART:20261022T230000\r\nDTEND:20261023T010000\r\nSUMMARY:Night'));
 const p={events:P.parseICS(raw,'pc_src',now),sources:[{id:'pc_src',name:'Test'}]};assert.equal(P.occurrences(p,'2026-10-22').length,2);assert.equal(P.occurrences(p,'2026-10-23').length,2);assert.equal(P.occurrences(p,'2026-10-24').length,0);assert.equal(P.layout(P.occurrences(p,'2026-10-23'),'2026-10-23')[0].from,0);
});
test('embedded European time zone keeps weekly local time across daylight saving',()=>{
 const zone='BEGIN:VTIMEZONE\r\nTZID:Europe/Budapest\r\nBEGIN:STANDARD\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE';
 const es=P.parseICS(cal(zone+'\r\n'+event('UID:dst\r\nDTSTART;TZID=Europe/Budapest:20261022T090000\r\nDTEND;TZID=Europe/Budapest:20261022T100000\r\nRRULE:FREQ=WEEKLY;COUNT=2\r\nSUMMARY:Swim')),'pc_src',now);
 assert.equal(es[0].start,+new Date('2026-10-22T07:00Z'));assert.equal(es[1].start,+new Date('2026-10-29T08:00Z'));
});
test('unsafe, missing-zone, excessive recurrence and canceled events are handled honestly',()=>{
 assert.throws(()=>P.parseICS('<html>login</html>','pc_src',now),e=>e.code==='plannerInvalidCalendar');
 assert.throws(()=>P.parseICS(cal(event('UID:bad\r\nDTSTART;TZID=Unknown/Zone:20261022T090000\r\nSUMMARY:Bad')),'pc_src',now),e=>e.code==='plannerCalendarZone');
 assert.throws(()=>P.parseICS(cal(event('UID:fast\r\nDTSTART:20261022T090000Z\r\nRRULE:FREQ=MINUTELY\r\nSUMMARY:Too fast')),'pc_src',now),e=>e.code==='plannerCalendarFrequency');
 assert.equal(P.parseICS(cal(event('UID:cancel\r\nDTSTART:20261022T090000Z\r\nSTATUS:CANCELLED\r\nSUMMARY:Gone')),'pc_src',now).length,0);
});
test('weekly overnight plans continue into the next day, with one completion identity',()=>{
 const p={events:[{...base,start:+new Date('2026-10-22T23:00'),end:+new Date('2026-10-23T01:00'),done:{'2026-10-22':{value:true,at:now}}}]};
 const next=P.occurrences(p,'2026-10-23');assert.equal(next.length,1);assert.equal(next[0].occurrenceDay,'2026-10-22');assert.equal(next[0].complete,true);assert.equal(P.layout(next,'2026-10-23')[0].from,0);
});
test('an exported detached occurrence is retained without its parent series',()=>{
 const raw=cal(event('UID:detached\r\nRECURRENCE-ID:20261022T090000Z\r\nDTSTART:20261022T110000Z\r\nDTEND:20261022T120000Z\r\nSUMMARY:One occurrence'));
 assert.equal(P.parseICS(raw,'pc_src',now).length,1);
 const another=raw.replace('END:VCALENDAR',event('UID:detached\r\nRECURRENCE-ID:20261029T090000Z\r\nDTSTART:20261029T110000Z\r\nDTEND:20261029T120000Z\r\nSUMMARY:Second occurrence')+'\r\nEND:VCALENDAR');
 assert.equal(P.parseICS(another,'pc_src',now).length,2);
});
