/* All data lives on the device (localStorage). One JSON document, saved on every change.
   Everything read from storage or from a backup file goes through clean(), which rebuilds the
   document field by field with fixed types, so a damaged or hand-edited file cannot inject markup. */
window.Store = (function () {
  const KEY = 'gymapp.v1', AKEY = KEY + '.active';   // AKEY: the running workout, saved on every tap without rewriting the whole history
  const MODELS = ['claude-haiku-4-5-20251001', 'claude-sonnet-5-5', 'claude-opus-5-5'];
  const ACCENTS = ['volt', 'sky', 'orange', 'pink', 'mint'], BGS = ['aurora', 'deep', 'plain'];
  const EXID = /^[A-Za-z0-9_\-]{1,90}$/, DAY = /^\d{4}-\d{2}-\d{2}$/, NUMSTR = /^[0-9.,]{0,8}$/;
  let data = null, mem = false, failed = false, onFail = null;

  function seedRoutines() {
    return window.PLAN.days.map(d => ({
      id: d.id, name: { hu: d.hu, en: d.en }, sub: d.sub, builtin: true,
      items: window.PLAN.items.filter(i => i.day === d.id).map(i => ({
        ex: i.ex, label: { hu: i.hu, en: i.en }, sets: i.sets, reps: i.reps, rest: i.rest
      }))
    }));
  }
  function fresh() {
    return {
      v: 1,
      settings: { lang: null, restAuto: true, sound: true, vibrate: true, awake: true, autofill: false, restDefault: 90, weekGoal: 4, weekStart: 1,
        accent: 'volt', bg: 'aurora', calm: false, solid: false, apiKey: '', keyState: '', model: MODELS[0],
        profile: { sex: 'm', age: '', height: '', weight: '', activity: 1.55, goal: 'maintain' }, targets: null },
      routines: seedRoutines(), workouts: [], active: null, body: [], food: {}, recentFoods: []
    };
  }

  /* ---------- type-safe rebuild ---------- */
  const str = (v, max) => (typeof v === 'string' ? v : typeof v === 'number' && isFinite(v) ? String(v) : '').slice(0, max || 120);
  const num = (v, lo, hi, def) => { const n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def; };
  const int = (v, lo, hi, def) => Math.round(num(v, lo, hi, def));
  const arr = v => Array.isArray(v) ? v : [];
  const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const numStr = v => { const s = str(v, 8).trim(); return NUMSTR.test(s) ? s : ''; };
  const idStr = v => { const s = str(v, 40); return /^[A-Za-z0-9_\-]{1,40}$/.test(s) ? s : ''; };
  const pair = v => { const o = obj(v); return (typeof o.hu === 'string' || typeof o.en === 'string') ? { hu: str(o.hu, 80), en: str(o.en, 80) } : null; };
  let seq = 0; const newId = () => 'x' + Date.now().toString(36) + (seq++).toString(36);

  function clean(raw, keepKey) {
    const f = fresh(), r = obj(raw), s = obj(r.settings), p = obj(s.profile), out = fresh(), tg = obj(s.targets);
    out.settings = {
      lang: s.lang === 'hu' || s.lang === 'en' ? s.lang : null,
      restAuto: s.restAuto !== false, sound: s.sound !== false, vibrate: s.vibrate !== false, awake: s.awake !== false, autofill: s.autofill === true,
      restDefault: [60, 90, 120, 150, 180].indexOf(+s.restDefault) >= 0 ? +s.restDefault : 90, weekGoal: int(s.weekGoal, 0, 7, 4), weekStart: +s.weekStart === 0 ? 0 : 1,
      accent: ACCENTS.indexOf(s.accent) >= 0 ? s.accent : 'volt', bg: BGS.indexOf(s.bg) >= 0 ? s.bg : 'aurora', calm: s.calm === true, solid: s.solid === true,
      apiKey: keepKey != null ? keepKey : str(s.apiKey, 300).replace(/[^\x21-\x7e]/g, ''),
      keyState: s.keyState === 'ok' || s.keyState === 'bad' ? s.keyState : '',   // '' = saved but not checked yet
      model: MODELS.indexOf(s.model) >= 0 ? s.model : MODELS[0],
      profile: {
        sex: p.sex === 'f' ? 'f' : 'm', age: numStr(p.age), height: numStr(p.height), weight: numStr(p.weight),
        activity: [1.2, 1.375, 1.55, 1.725, 1.9].indexOf(+p.activity) >= 0 ? +p.activity : 1.55,
        goal: ['cut', 'maintain', 'bulk'].indexOf(p.goal) >= 0 ? p.goal : 'maintain'
      },
      targets: num(tg.kcal, 1, 20000, 0) > 0
        ? { kcal: int(tg.kcal, 1, 20000, 2000), p: int(tg.p, 0, 2000, 0), c: int(tg.c, 0, 3000, 0), f: int(tg.f, 0, 2000, 0) } : null
    };
    if (!out.settings.apiKey) out.settings.keyState = '';
    const item = i => { i = obj(i); return EXID.test(str(i.ex, 90)) ? { ex: i.ex, label: pair(i.label), sets: int(i.sets, 1, 12, 3), reps: str(i.reps, 20) || '8–12', rest: int(i.rest, 0, 3600, 90) } : null; };
    out.routines = arr(r.routines).slice(0, 100).map(x => {
      x = obj(x);
      const name = typeof x.name === 'string' ? x.name.slice(0, 80) : pair(x.name);
      return { id: idStr(x.id) || newId(), name: name || 'Routine', sub: pair(x.sub), builtin: x.builtin === true, items: arr(x.items).slice(0, 60).map(item).filter(Boolean) };
    });
    if (!out.routines.length) out.routines = f.routines;
    const doneSet = z => { z = obj(z); return { kg: Math.round(num(z.kg, 0, 2000, 0) * 100) / 100, reps: int(z.reps, 0, 1000, 0), w: z.w === true }; };
    out.workouts = arr(r.workouts).slice(-5000).map(w => {
      w = obj(w);
      const start = num(w.start, 0, 4e12, 0);
      const entries = arr(w.entries).slice(0, 80).map(e => {
        e = obj(e); if (!EXID.test(str(e.ex, 90))) return null;
        const sets = arr(e.sets).slice(0, 40).map(doneSet).filter(z => z.reps > 0);
        return sets.length ? { ex: e.ex, label: pair(e.label), sets } : null;
      }).filter(Boolean);
      return start && entries.length ? { id: idStr(w.id) || newId(), rid: idStr(w.rid) || null, name: str(w.name, 80) || 'Workout', start, end: num(w.end, start, 4e12, start), entries } : null;
    }).filter(Boolean).sort((a, b) => a.start - b.start);
    const a = r.active && typeof r.active === 'object' ? r.active : null;
    out.active = a && num(a.start, 0, 4e12, 0) ? {
      id: idStr(a.id) || newId(), rid: idStr(a.rid) || null, name: str(a.name, 80) || 'Workout', start: num(a.start, 0, 4e12, 0),
      entries: arr(a.entries).slice(0, 80).map(e => {
        e = obj(e); if (!EXID.test(str(e.ex, 90))) return null;
        return { ex: e.ex, label: pair(e.label), target: int(e.target, 1, 12, 3), reps: str(e.reps, 20) || '8–12', rest: int(e.rest, 0, 3600, 90),
          sets: arr(e.sets).slice(0, 40).map(z => { z = obj(z); return { kg: numStr(z.kg), reps: numStr(z.reps), done: z.done === true, w: z.w === true }; }) };
      }).filter(Boolean),
      restEnd: num(a.restEnd, 0, 4e12, 0), restTotal: num(a.restTotal, 0, 36000, 0)
    } : null;
    const seen = {};
    out.body = arr(r.body).map(b => {
      b = obj(b); const kg = num(b.kg, 0, 1000, 0);
      if (!DAY.test(str(b.d, 10)) || kg < 20 || kg > 400 || seen[b.d]) return null;
      seen[b.d] = 1; return { d: b.d, kg: Math.round(kg * 10) / 10 };
    }).filter(Boolean).slice(-2000);
    const food = z => {
      z = obj(z); const name = str(z.name, 80).trim(); if (!name) return null;
      const r1 = v => Math.round(num(v, 0, 10000, 0) * 10) / 10;
      return { id: idStr(z.id) || newId(), name, g: int(z.g, 0, 100000, 0), kcal: int(z.kcal, 0, 100000, 0), p: r1(z.p), c: r1(z.c), f: r1(z.f), src: z.src === 'ai' || z.src === 'db' ? z.src : 'manual', t: num(z.t, 0, 4e12, 0) };
    };
    out.food = {};
    Object.keys(obj(r.food)).slice(-3000).forEach(d => { if (DAY.test(d)) { const l = arr(r.food[d]).slice(0, 200).map(food).filter(Boolean); if (l.length) out.food[d] = l; } });
    out.recentFoods = arr(r.recentFoods).slice(0, 12).map(food).filter(Boolean).map(z => ({ name: z.name, g: z.g, kcal: z.kcal, p: z.p, c: z.c, f: z.f }));
    return out;
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); localStorage.setItem(KEY + '.t', '1'); localStorage.removeItem(KEY + '.t'); }
    catch (e) { mem = true; }
    let doc = null, act;
    if (raw) { try { doc = JSON.parse(raw); } catch (e) { try { localStorage.setItem(KEY + '.corrupt', raw); } catch (e2) {} } }   // keep the unreadable copy aside
    try { const ra = localStorage.getItem(AKEY); if (ra) act = JSON.parse(ra); } catch (e) {}
    if (act !== undefined) { doc = doc && typeof doc === 'object' ? doc : {}; doc.active = act; }
    try { data = doc ? clean(doc) : fresh(); } catch (e) { data = fresh(); }
    return data;
  }
  function saveActive() {
    if (mem) return false;
    try { if (data.active) localStorage.setItem(AKEY, JSON.stringify(data.active)); else localStorage.removeItem(AKEY); failed = false; return true; }
    catch (e) { failed = true; if (onFail) onFail(); return false; }
  }
  function save() {
    if (mem) return false;
    const a = data.active; let json;
    data.active = null; try { json = JSON.stringify(data); } finally { data.active = a; }
    try { localStorage.setItem(KEY, json); } catch (e) { failed = true; if (onFail) onFail(); return false; }
    return saveActive();
  }
  return {
    get d() { return data || load(); },
    get memoryOnly() { return mem; },
    get failed() { return failed; },
    set onFail(fn) { onFail = fn; },
    MODELS, ACCENTS, BGS, load, save, saveActive, clean,
    wipe() { try { [KEY, AKEY, KEY + '.corrupt'].forEach(k => localStorage.removeItem(k)); } catch (e) {} data = null; },
    /* a backup never carries the API key in, and never carries it out */
    replace(o) { const k = data ? data.settings : { apiKey: '', keyState: '' }; data = clean(o, k.apiKey); data.settings.keyState = k.apiKey ? k.keyState : ''; return save(); },
    exportJSON() { const copy = JSON.parse(JSON.stringify(data)); copy.settings.apiKey = ''; copy.settings.keyState = ''; return JSON.stringify({ app: 'gymapp', exported: new Date().toISOString(), data: copy }, null, 1); },
    resetRoutines() { data.routines = seedRoutines().concat(data.routines.filter(r => !r.builtin)); save(); },
    bytes() { try { return (localStorage.getItem(KEY) || '').length + (localStorage.getItem(AKEY) || '').length; } catch (e) { return 0; } }
  };
})();
