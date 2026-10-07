/* Read explicit spreadsheet columns into plans. Never guess nutrition or exercise variants. */
window.PlanSheet = (() => {
  'use strict';
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const week = [['hetfo','monday','mon','h'],['kedd','tuesday','tue','k'],['szerda','wednesday','wed','sz'],['csutortok','thursday','thu','cs'],['pentek','friday','fri','p'],['szombat','saturday','sat','szo'],['vasarnap','sunday','sun','v']];
  function weekday(s) { const n = norm(s); return week.findIndex(names => names.some(x => n === x || (x.length > 2 && n.startsWith(x + ' ')))); }
  function numeric(s) {
    if (s == null || String(s).trim() === '') return null;
    const n = String(s).trim().replace(/\s+/g,'').replace(',', '.');
    return /^\d+(?:\.\d+)?(?:g|gramm|grams|kcal)?$/i.test(n) ? Number(n.replace(/[a-z]+$/i,'')) : null;
  }
  function column(s) {
    const n = norm(String(s).replace(/100\s*g/gi,'100 g')), base = n.replace(/\b(?:per|100|g|gramm|grams|adagonkent|portion|serving)\b/g, ' ').replace(/\s+/g,' ').trim();
    if (/^(nap|nap neve|het napja|day|weekday|day of week|edzesnap|workout day)$/.test(n)) return 'day';
    if (/^(edzes|edzesterv|edzes neve|workout|routine|workout name|routine name)$/.test(n)) return 'routine';
    if (/^(nap tipusa|day type|type)$/.test(n)) return 'type';
    if (/^(gyakorlat|gyakorlat neve|exercise|exercise name|movement)$/.test(n)) return 'ex';
    if (/^(sorozat|sorozatok|sorozatszam|sets|set|sets count)(?: db| count)?$/.test(n)) return 'sets';
    if (/^(ismetles|ismetlesek|ismetlesszam|reps|repetitions|rep|duration)(?: db| count)?$/.test(n)) return 'reps';
    if (/^(piheno|pihenoid[o]?|rest|rest time|recovery)(?: |$)/.test(n)) return 'rest';
    if (n === 'rir') return 'rir';
    if (/^(megjegyzes|notes?|instructions?|tip)$/.test(n)) return 'note';
    if (/^(etkezes|etkezes neve|meal|meal name)$/.test(n)) return 'meal';
    if (/^(etel|etel neve|elelmiszer|alapanyag|food|food name|ingredient)$/.test(n)) return 'food';
    if (/^(g|gramm|grams|suly g|weight g|mennyiseg g|mennyiseg gramm|amount g|quantity g|portion g|adag g|mennyiseg|amount|quantity|weight)$/.test(n)) return 'grams';
    if (/^(egyseg|mertekegyseg|unit|units)$/.test(n)) return 'unit';
    if (/^(kcal|kaloria|calories|energy kcal|energia kcal)$/.test(base)) return 'kcal';
    if (/^(feherje|protein|p)$/.test(base)) return 'p';
    if (/^(szenhidrat|carbs|carbohydrate|carbohydrates|c)$/.test(base)) return 'c';
    if (/^(zsir|fat|fats|f)$/.test(base)) return 'f';
    return '';
  }
  function headers(cells) {
    const map = {}; cells.forEach((s,i) => { const key = column(s); if (key && map[key] == null) map[key] = i; });
    const kind = map.ex != null ? 'workout' : (map.food != null || map.meal != null) && ['grams','kcal','p','c','f'].some(k => map[k] != null) ? 'meal' : '';
    return {map,kind};
  }
  function exercise(label,catalog) {
    const n = norm(label), found = catalog.filter(e => [e.id,e.hu,e.en,...(e.aliases || [])].some(s => s && norm(s) === n));
    return found.length === 1 ? found[0].id : '';
  }
  const blank = () => ({type:'',total:null,meals:[]});
  function parse(source,catalog,hu,mappings = {}) {
    const out = {routines:[],plan:null,unassignedMeals:[],pendingTables:[],warnings:[]};
    const tables = new Map();
    for (const line of source.lines) if (Array.isArray(line.cells)) {
      const key = line.table || line.sheet || source.name;
      if (!tables.has(key)) tables.set(key,[]);
      tables.get(key).push(line);
    }
    const plan = () => out.plan || (out.plan = {name:source.name.replace(/\.[^.]+$/,''),targets:true,days:Array.from({length:7},blank),notes:[],train:[]});
    for (const [table,rows] of tables) {
      let map = null, labels = [], kind = '', name = '', day = weekday(table), meal = '', lastRow = 0, foundHeader = false;
      const custom = mappings[source.name + ':' + table];
      for (const [index,row] of rows.entries()) {
        if (custom && index < custom.headerRow) continue;
        const head = custom && index === custom.headerRow ? {map:custom.map,kind:custom.kind} : headers(row.cells);
        if (head.kind) { map=head.map;kind=head.kind;labels=row.cells.slice();if(custom&&index===custom.headerRow){if(map.rest!=null)labels[map.rest]='Rest (sec)';if(map.grams!=null)labels[map.grams]='Grams';}foundHeader=true;name='';meal='';day=custom && custom.day != null ? Number(custom.day) : weekday(table);lastRow=row.row || 0;continue; }
        if (!map) continue;
        if (row.row && lastRow && row.row > lastRow + 1) {name='';meal='';day=custom && custom.day != null ? Number(custom.day) : weekday(table);}
        lastRow=row.row || lastRow;
        const get = key => {
          const at=map[key]; if (at == null || at < 0) return '';
          const v=row.cells[at];
          return String(v || (['day','meal','routine','type'].includes(key) && row.merged && row.merged[at]) || '').trim();
        };
        const ref=source.name+' · '+row.page;
        const explicitDay=get('day');
        if (kind === 'workout') {
          const label=get('ex');
          if (/^(total|osszesen|napi osszes)/.test(norm(label))) continue;
          name=get('routine') || explicitDay || name || table;
          if (!label) continue;
          let routine=out.routines.find(r=>r.name===name);
          if (!routine) {routine={name,opt:/optional|opcionalis/.test(norm(name)),info:ref,items:[]};out.routines.push(routine);}
          const v=get('rest'), units=norm(labels[map.rest] || '')+' '+norm(v), duration=numeric(v.replace(/\s*(?:mp|s|sec|seconds|min|minutes|perc)\s*$/i,''));
          const rest=duration == null ? null : /\b(min|minutes|perc)\b/.test(units) ? duration*60 : /\b(mp|s|sec|seconds|masodperc)\b/.test(units) ? duration : null;
          routine.items.push({ex:exercise(label,catalog),label,sets:numeric(get('sets')),reps:get('reps'),rest,rir:get('rir'),note:[ref,get('note'),rest==null&&v?(hu?'Pihenő a fájlban: ':'Rest in file: ')+v:''].filter(Boolean).join(' · ')});
        } else {
          if (explicitDay) { const next=weekday(explicitDay); if (next!==day || next<0) meal='';day=next; }
          const mealName=get('meal'), food=get('food'), type=norm(get('type') || explicitDay);
          if (mealName) meal=mealName;
          const totals=/^(total|daily total|daily target|osszesen|napi osszes|napi cel)\b/.test(norm(mealName || food));
          const values={};
          const amount=get('grams'), amountUnit=norm(labels[map.grams] || '')+' '+norm(amount)+' '+norm(get('unit'));
          const grams=/\b(g|gramm|grams)\b/.test(amountUnit) || /\d\s*g\b/i.test(amount) ? numeric(amount) : null;
          for (const k of ['kcal','p','c','f']) {
            const v=numeric(get(k)), per100=/\b100\s*g\b/.test(norm(labels[map[k]] || ''));
            values[k]=v==null ? null : per100 ? grams==null ? null : v*grams/100 : v;
          }
          if (totals) {if(day>=0)plan().days[day].total=values;else out.warnings.push((hu?'A napi összeg napja nem azonosítható: ':'Daily total has no recognized weekday: ')+ref);meal='';continue;}
          if (!food && !mealName) continue;
          // A food-only table groups into one named meal; a meal-only row needs its food completed.
          const title=meal || (hu?'Étkezés':'Meal');
          const meals=day>=0 ? plan().days[day].meals : out.unassignedMeals;
          if(day<0)plan();
          let current=meals.find(m=>m.name===title && (day>=0 || m._table===table));
          if(!current){current={name:title,items:[],kcal:null,p:null,c:null,f:null,_values:[],_table:table};meals.push(current);}
          if(day>=0)plan().days[day].type=/pihenonap|rest day/.test(type)?'rest':/edzesnap|training day/.test(type)?'train':plan().days[day].type;
          if (food) {
            current.items.push({n:food,g:grams,kcal:values.kcal});
            current._values.push(values);
          } else {
            // Explicit meal totals take precedence over sums of ingredient rows.
            for(const k of ['kcal','p','c','f'])if(values[k]!=null){if(!current._totals)current._totals={};current._totals[k]=values[k];}
          }
        }
      }
      if (!foundHeader && rows.length) out.pendingTables.push({id:source.name+':'+table,name:table,source:source.name,rows:rows.slice(0,6)});
    }
    if(out.plan) {
      const meals=out.plan.days.flatMap(d=>d.meals).concat(out.unassignedMeals);
      for(const m of meals) {
        for(const k of ['kcal','p','c','f'])m[k]=m._totals&&m._totals[k]!=null?m._totals[k]:m._values.length&&m._values.every(v=>v[k]!=null)?m._values.reduce((n,v)=>n+v[k],0):null;
        if(m.kcal!=null)m.kcal=Math.round(m.kcal);
        for(const k of ['p','c','f'])if(m[k]!=null)m[k]=Math.round(m[k]*10)/10;
        delete m._values;delete m._totals;delete m._table;
      }
      out.plan.notes=[(hu?'Forrás: ':'Source: ')+source.name];
    }
    return out;
  }
  return {parse,headers,weekday,exercise};
})();
