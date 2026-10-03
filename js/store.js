/* All data lives on the device (localStorage). One JSON document, saved on every change.
   Everything read from storage or from a backup file goes through clean(), which rebuilds the
   document field by field with fixed types, so a damaged or hand-edited file cannot inject markup. */
window.Store = (function () {
  const KEY = 'gymapp.v1', AKEY = KEY + '.active';   // AKEY: the running workout, saved on every tap without rewriting the whole history
  const MODELS = ['claude-haiku-4-5-20251001', 'claude-sonnet-5-5', 'claude-opus-5-5'];
  const ACCENTS = ['volt', 'sky', 'orange', 'pink', 'mint'], BGS = ['aurora', 'deep', 'plain'];
  const OLD_HUE = { sky: 231, orange: 67, pink: 3, mint: 170 };                       // the four colours older versions offered, as places on the scale
  const ICONS = ['upper', 'legs', 'push', 'pull', 'core', 'arms', 'full', 'cardio', 'star'];
  const EXID = /^[A-Za-z0-9_\-]{1,90}$/, DAY = /^\d{4}-\d{2}-\d{2}$/, NUMSTR = /^[0-9.,]{0,8}$/;
  let data = null, mem = false, failed = false, onFail = null, onSave = null, snap = null;

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
        accent: 'volt', bg: 'aurora', calm: false, solid: false, addActive: false, coach: true, figure: 'draw', syncKey: false, hue: null, photoModel: '', apiKey: '', keyState: '', model: MODELS[0],
        profile: { sex: 'm', age: '', height: '', weight: '', activity: 1.55, goal: 'maintain' }, targets: null },
      routines: seedRoutines(), workouts: [], active: null, body: [], food: {}, recentFoods: [], favEx: [], favFoods: [], aiNotes: [], act: {}, chats: [],
      mt: {}, del: {}, owner: '', epoch: 0      // for syncing with an account: when each part last changed, what was deleted, whose data this is
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
      accent: ACCENTS.indexOf(s.accent) >= 0 ? s.accent : 'volt', bg: BGS.indexOf(s.bg) >= 0 ? s.bg : 'aurora', calm: s.calm === true, solid: s.solid === true, addActive: s.addActive === true, coach: s.coach !== false, figure: s.figure === 'photo' ? 'photo' : 'draw', syncKey: s.syncKey === true,
      hue: s.hue != null && isFinite(+s.hue) ? int(s.hue, 0, 359, 0) : (OLD_HUE[s.accent] != null ? OLD_HUE[s.accent] : null),   // accent colour as a hue on the colour scale; null = the app's own yellow-green
      photoModel: MODELS.indexOf(s.photoModel) >= 0 ? s.photoModel : '',
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
      return { id: idStr(x.id) || newId(), name: name || 'Routine', sub: pair(x.sub), builtin: x.builtin === true, icon: ICONS.indexOf(x.icon) >= 0 ? x.icon : '', items: arr(x.items).slice(0, 60).map(item).filter(Boolean) };
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
    const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
    out.favEx = uniq(arr(r.favEx).filter(v => typeof v === 'string' && EXID.test(v))).slice(0, 400);
    out.favFoods = uniq(arr(r.favFoods).filter(v => typeof v === 'string' && v.length > 2 && v.length <= 220)).slice(0, 300);
    out.aiNotes = arr(r.aiNotes).slice(-60).map(z => { z = obj(z); const nm = str(z.n, 80).trim(); return nm ? { n: nm, n2: str(z.n2, 80).trim(), ga: int(z.ga, 0, 100000, 0), gu: int(z.gu, 0, 100000, 0), ka: int(z.ka, 0, 1000, 0), ku: int(z.ku, 0, 1000, 0), x: z.x === true, t: num(z.t, 0, 4e12, 0) } : null; }).filter(Boolean);
    out.act = {};
    Object.keys(obj(r.act)).slice(-3000).forEach(d => { if (!DAY.test(d)) return; const z = obj(r.act[d]), st = int(z.steps, 0, 200000, 0), kc = int(z.kcal, 0, 20000, 0); if (st || kc) out.act[d] = { steps: st, kcal: kc }; });
    /* coach conversations: newest 40, and never more than about 400 000 characters in all */
    let room = 400000;
    out.chats = arr(r.chats).map(c => { c = obj(c); const id = idStr(c.id), msgs = arr(c.msgs).slice(-60).map(m => { m = obj(m); const tx = str(m.content, 6000); return tx ? { role: m.role === 'assistant' ? 'assistant' : 'user', content: tx } : null; }).filter(Boolean); return id && msgs.length ? { id, t: num(c.t, 0, 4e12, 0), msgs } : null; })
      .filter(Boolean).sort((x, y) => y.t - x.t).slice(0, 40).filter(c => { room -= c.msgs.reduce((n, m) => n + m.content.length, 0); return room >= 0; }).reverse();
    out.mt = {}; SECTS.forEach(k => { const v = num(obj(r.mt)[k], 0, 4e12, 0); if (v) out.mt[k] = v; });
    out.del = {}; Object.keys(obj(r.del)).filter(k => idStr(k)).map(k => [k, num(r.del[k], 0, 4e12, 0)]).filter(x => x[1] > 0).sort((x, y) => y[1] - x[1]).slice(0, 800).forEach(x => { out.del[x[0]] = x[1]; });
    out.owner = /^[0-9a-fA-F-]{8,64}$/.test(str(r.owner, 64)) ? r.owner : ''; out.epoch = num(r.epoch, 0, 4e12, 0);
    out.recentFoods = arr(r.recentFoods).slice(0, 12).map(food).filter(Boolean).map(z => ({ name: z.name, g: z.g, kcal: z.kcal, p: z.p, c: z.c, f: z.f }));
    return out;
  }

  /* What changed since the last save? Each part gets a "last changed" time and every removed workout, meal or routine leaves a marker,
     so that two devices signed in to the same account can be merged without one overwriting the other. */
  const SECTS = ['settings', 'routines', 'favs', 'notes', 'body', 'act'];
  const PART = { settings: d => { const c = Object.assign({}, d.settings); delete c.apiKey; delete c.keyState; return c; }, routines: d => d.routines, favs: d => [d.favEx, d.favFoods], notes: d => d.aiNotes, body: d => d.body, act: d => d.act };
  function shot(d) {
    const o = { ids: {} }; SECTS.forEach(k => { o[k] = JSON.stringify(PART[k](d)); });
    d.workouts.forEach(w => { o.ids[w.id] = 1; }); d.routines.forEach(r => { o.ids[r.id] = 1; }); d.chats.forEach(c => { o.ids[c.id] = 1; }); Object.keys(d.food).forEach(day => d.food[day].forEach(f => { o.ids[f.id] = 1; }));
    return o;
  }
  function track() {
    const now = Date.now(), cur = shot(data);
    if (snap) { SECTS.forEach(k => { if (cur[k] !== snap[k]) data.mt[k] = now; }); Object.keys(snap.ids).forEach(id => { if (!cur.ids[id]) data.del[id] = now; }); Object.keys(cur.ids).forEach(id => { if (data.del[id]) delete data.del[id]; }); }
    snap = cur;
  }
  function write() {
    const a = data.active; let json;
    data.active = null; try { json = JSON.stringify(data); } finally { data.active = a; }
    try { localStorage.setItem(KEY, json); } catch (e) { failed = true; if (onFail) onFail(); return false; }
    return saveActive();
  }
  function cloudDoc() { const c = JSON.parse(JSON.stringify(data)); c.active = null; if (!c.settings.syncKey) c.settings.apiKey = ''; c.settings.keyState = ''; return c; }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); localStorage.setItem(KEY + '.t', '1'); localStorage.removeItem(KEY + '.t'); }
    catch (e) { mem = true; }
    let doc = null, act;
    if (raw) { try { doc = JSON.parse(raw); } catch (e) { try { localStorage.setItem(KEY + '.corrupt', raw); } catch (e2) {} } }   // keep the unreadable copy aside
    try { const ra = localStorage.getItem(AKEY); if (ra) act = JSON.parse(ra); } catch (e) {}
    if (act !== undefined) { doc = doc && typeof doc === 'object' ? doc : {}; doc.active = act; }
    try { data = doc ? clean(doc) : fresh(); } catch (e) { data = fresh(); }
    snap = shot(data);
    return data;
  }
  function saveActive() {
    if (mem) return false;
    try { if (data.active) localStorage.setItem(AKEY, JSON.stringify(data.active)); else localStorage.removeItem(AKEY); failed = false; return true; }
    catch (e) { failed = true; if (onFail) onFail(); return false; }
  }
  function save() {
    try { track(); } catch (e) {}
    if (onSave) { try { onSave(); } catch (e) {} }
    if (mem) return false;
    return write();
  }
  return {
    get d() { return data || load(); },
    get memoryOnly() { return mem; },
    get failed() { return failed; },
    set onFail(fn) { onFail = fn; },
    set onSave(fn) { onSave = fn; },
    MODELS, ACCENTS, BGS, ICONS, load, save, saveActive, clean,
    wipe() { try { [KEY, AKEY, KEY + '.corrupt'].forEach(k => localStorage.removeItem(k)); } catch (e) {} data = null; snap = null; },
    cloudDoc,
    /* take over a document merged with the account copy: same cleaning as a backup, the running workout and this device's key stay */
    adopt(doc) {
      const before = JSON.stringify(cloudDoc()), cur = data.settings, act = data.active, theirs = doc && doc.settings && doc.settings.syncKey ? String(doc.settings.apiKey || '') : '';
      const key = cur.apiKey || theirs;
      data = clean(doc, key); data.settings.keyState = key && key === cur.apiKey ? cur.keyState : ''; data.active = act; snap = shot(data);
      if (!mem) write();
      return JSON.stringify(cloudDoc()) !== before;
    },
    /* first sign-in on a device that already holds data: everything on it counts as "changed now" */
    stamp(uid, real) { const now = Date.now(); if (real) SECTS.forEach(k => { data.mt[k] = now; }); data.owner = uid; if (!mem) write(); },
    /* a backup never carries the API key in, and never carries it out */
    replace(o) { const k = data ? data.settings : { apiKey: '', keyState: '' }, own = data ? data.owner : '', ep = data ? data.epoch : 0, sk = data ? data.settings.syncKey : false; data = clean(o, k.apiKey); data.settings.keyState = k.apiKey ? k.keyState : ''; data.settings.syncKey = sk; data.owner = own; data.epoch = ep; data.mt = {}; data.del = {}; return save(); },   // a backup never changes whose data this is
    exportJSON() { const copy = JSON.parse(JSON.stringify(data)); copy.settings.apiKey = ''; copy.settings.keyState = ''; copy.settings.syncKey = false; copy.owner = ''; copy.mt = {}; copy.del = {}; copy.epoch = 0; return JSON.stringify({ app: 'gymapp', exported: new Date().toISOString(), data: copy }, null, 1); },
    resetRoutines() { data.routines = seedRoutines().concat(data.routines.filter(r => !r.builtin)); save(); },
    bytes() { try { return (localStorage.getItem(KEY) || '').length + (localStorage.getItem(AKEY) || '').length; } catch (e) { return 0; } }
  };
})();
