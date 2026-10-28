/* Smartwatch / health-platform bridge. The web app cannot read Apple Watch, Wear OS, Garmin or Health Connect data, so
   here this only describes the contract; the iOS and Android apps implement the native side and every screen already
   works with it. Contract (version 1) and the native mapping: docs/WEARABLES.md.

   JS -> native: { v:1, id, method, params }   via one of
     iOS WKWebView   window.webkit.messageHandlers.reppsyWearable.postMessage(obj)
     Android WebView window.ReppsyWearableAndroid.postMessage(JSON string)
     Capacitor       Capacitor.Plugins.ReppsyWearable.request(obj) (Promise) + addListener('message', cb)
   native -> JS: Wearable.receive(obj or JSON string):
     { v:1, re:id, ok:true, result } | { v:1, re:id, ok:false, error:{ code, message } }   replies
     { v:1, type:'status', device:{ name, kind }, authorized:[kinds] }                       connection state
     { v:1, type:'live', session, kind, sample:{ t, hr, kcal, dist, laps, strokes, stroke, cadence, power, speed } }
     { v:1, type:'workout', workout:{ kind, start, end, device, pool, laps:[...], kcal, dist, hr:{avg,max}, cadence, power } }
   Values are untrusted: everything is range-checked here before the app sees it. */
window.Wearable = (() => {
  'use strict';
  const V = 1, KINDS = ['swim', 'ride', 'run', 'walk', 'strength', 'other'], STROKES = ['free', 'breast', 'back', 'fly', 'mixed'];
  const METHODS = ['authorize', 'startLive', 'stopLive', 'importWorkouts', 'status'];
  const g = globalThis;
  const n = (x, lo, hi) => { x = typeof x === 'number' ? x : typeof x === 'string' && x.trim() ? Number(x) : NaN; return Number.isFinite(x) && x >= lo && x <= hi ? x : null; };
  const text = (x, max) => typeof x === 'string' ? x.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max) : '';
  function platform() {
    if (g.webkit?.messageHandlers?.reppsyWearable) return 'ios';
    if (g.ReppsyWearableAndroid && typeof g.ReppsyWearableAndroid.postMessage === 'function') return 'android';
    if (g.Capacitor?.isNativePlatform?.() && g.Capacitor.Plugins?.ReppsyWearable) return 'capacitor';
    return 'web';
  }
  const state = { device: null, authorized: [], live: null, last: null };
  const pending = new Map(), liveSubs = new Set(), workoutSubs = new Set(), statusSubs = new Set();
  let seq = 0, capListener = null;
  function send(msg) {
    const p = platform();
    if (p === 'ios') g.webkit.messageHandlers.reppsyWearable.postMessage(msg);
    else if (p === 'android') g.ReppsyWearableAndroid.postMessage(JSON.stringify(msg));
    else if (p === 'capacitor') {
      if (!capListener && g.Capacitor.Plugins.ReppsyWearable.addListener) capListener = g.Capacitor.Plugins.ReppsyWearable.addListener('message', receive);
      return g.Capacitor.Plugins.ReppsyWearable.request(msg).then(receive, e => receive({ v: V, re: msg.id, ok: false, error: { code: 'native', message: String(e && e.message || e) } }));
    }
  }
  /* Ask the native side to do something. On the web this rejects with code 'unavailable'. */
  function request(method, params = {}, wait = 20000) {
    if (!METHODS.includes(method)) return Promise.reject(Object.assign(new Error('method'), { code: 'method' }));
    if (platform() === 'web') return Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' }));
    const id = 'w' + (++seq) + '-' + Date.now().toString(36);
    return new Promise((ok, fail) => {
      const timer = setTimeout(() => { pending.delete(id); fail(Object.assign(new Error('timeout'), { code: 'timeout' })); }, wait);
      pending.set(id, { ok, fail, timer });
      try { send({ v: V, id, method, params }); } catch (e) { clearTimeout(timer); pending.delete(id); fail(Object.assign(new Error('send'), { code: 'native' })); }
    });
  }
  /* ---------- cleaning what the watch sends ---------- */
  function cleanSample(s) {
    if (!s || typeof s !== 'object') return null;
    const o = { t: n(s.t, 0, 4e12) || Date.now() };
    const put = (k, lo, hi, round) => { const v = n(s[k], lo, hi); if (v != null) o[k] = round ? Math.round(v * round) / round : v; };
    put('hr', 25, 250, 1); put('kcal', 0, 10000, 1); put('dist', 0, 500000, 10); put('laps', 0, 2000, 1); put('strokes', 0, 100000, 1);
    put('cadence', 0, 250, 1); put('power', 0, 3000, 1); put('speed', 0, 40, 100);
    if (STROKES.includes(s.stroke)) o.stroke = s.stroke;
    return Object.keys(o).length > 1 ? o : null;
  }
  function cleanLap(l) {
    if (!l || typeof l !== 'object') return null;
    const dist = n(l.dist, 1, 200), sec = n(l.sec, 1, 3600);
    if (dist == null || sec == null) return null;
    const o = { stroke: STROKES.includes(l.stroke) ? l.stroke : 'mixed', dist: Math.round(dist * 10) / 10, sec: Math.round(sec * 10) / 10 };
    const st = n(l.strokes, 0, 500); if (st != null) o.strokes = Math.round(st);
    return o;
  }
  function cleanWorkout(w) {
    if (!w || typeof w !== 'object' || !KINDS.includes(w.kind)) return null;
    const start = n(w.start, 946684800000, Date.now() + 86400000), end = n(w.end, 946684800000, Date.now() + 86400000);
    if (start == null || end == null || end <= start || end - start > 12 * 3600000) return null;
    const o = { kind: w.kind, start, end, device: text(w.device, 60) };
    const kc = n(w.kcal, 0, 10000); if (kc != null) o.kcal = Math.round(kc);
    const d = n(w.dist, 0, 500000); if (d != null) o.dist = Math.round(d);
    const hr = w.hr && typeof w.hr === 'object' ? { avg: n(w.hr.avg, 25, 250), max: n(w.hr.max, 25, 250) } : null;
    if (hr && (hr.avg || hr.max)) o.hr = { ...(hr.avg ? { avg: Math.round(hr.avg) } : {}), ...(hr.max ? { max: Math.round(hr.max) } : {}) };
    if (w.kind === 'swim') {
      const pool = n(w.pool, 10, 100); if (pool != null) o.pool = Math.round(pool * 10) / 10;
      o.laps = Array.isArray(w.laps) ? w.laps.slice(0, 1000).map(cleanLap).filter(Boolean) : [];
      const st = n(w.strokes, 0, 100000); if (st != null) o.strokes = Math.round(st);
    }
    if (w.kind === 'ride') {
      const cad = n(w.cadence, 0, 250), pw = w.power && typeof w.power === 'object' ? { avg: n(w.power.avg, 0, 3000), max: n(w.power.max, 0, 3000) } : null;
      if (cad) o.cadence = Math.round(cad); if (pw && (pw.avg || pw.max)) o.power = { ...(pw.avg ? { avg: Math.round(pw.avg) } : {}), ...(pw.max ? { max: Math.round(pw.max) } : {}) };
      const mv = n(w.moving, 0, 4e5); if (mv != null) o.moving = Math.round(mv);
    }
    return o;
  }
  function receive(raw) {
    let m = raw; if (typeof m === 'string') { try { m = JSON.parse(m); } catch (e) { return false; } }
    if (!m || typeof m !== 'object' || m.v !== V) return false;
    if (m.re && pending.has(m.re)) { const p = pending.get(m.re); pending.delete(m.re); clearTimeout(p.timer); if (m.ok) p.ok(m.result ?? null); else p.fail(Object.assign(new Error(text(m.error?.message, 200) || 'native'), { code: text(m.error?.code, 30) || 'native' })); return true; }
    if (m.type === 'status') {
      state.device = m.device && typeof m.device === 'object' ? { name: text(m.device.name, 60), kind: text(m.device.kind, 30) } : null;
      state.authorized = Array.isArray(m.authorized) ? m.authorized.filter(k => KINDS.includes(k)) : [];
      statusSubs.forEach(f => { try { f(state); } catch (e) {} }); return true;
    }
    if (m.type === 'live') {
      const s = cleanSample(m.sample); if (!s || !KINDS.includes(m.kind)) return false;
      state.live = { session: text(m.session, 80), kind: m.kind, sample: s };
      liveSubs.forEach(f => { try { f(state.live); } catch (e) {} }); return true;
    }
    if (m.type === 'workout') {
      const w = cleanWorkout(m.workout); if (!w) return false;
      state.last = w; workoutSubs.forEach(f => { try { f(w); } catch (e) {} }); return true;
    }
    return false;
  }
  const sub = set => cb => { set.add(cb); return () => set.delete(cb); };

  /* ---------- turning a watch workout into app data ---------- */
  // Swim: lengths per stroke for the app's own swim entry; the watch's measured active energy is kept with it.
  function toSwim(w, weight) {
    if (!w || w.kind !== 'swim') return null;
    const laps = { free: 0, breast: 0, back: 0, fly: 0, mixed: 0 };
    let pool = w.pool || 0;
    (w.laps || []).forEach(l => { laps[l.stroke]++; if (!pool) pool = l.dist; });
    if (!pool && w.dist && w.laps?.length) pool = w.dist / w.laps.length;
    const out = { type: 'swim', pool: Math.round(pool * 10) / 10 || 25, laps, minutes: Math.round((w.end - w.start) / 6000) / 10, weight, intensity: 'moderate', wear: { src: 'watch', device: w.device || '' } };
    if (!(w.laps || []).length && w.dist && pool) out.laps.mixed = Math.round(w.dist / pool);
    if (w.kcal != null) out.wear.kcal = w.kcal; if (w.hr) out.wear.hr = w.hr; if (w.strokes != null) out.wear.strokes = w.strokes;
    return out;
  }
  // Ride: the same shape a recorded or imported ride has (js/rides.js clean()).
  function toRide(w) {
    if (!w || w.kind !== 'ride' || !(w.dist > 0)) return null;
    const elapsed = Math.round((w.end - w.start) / 1000);
    return { v: 1, src: 'watch', dist: w.dist, moving: Math.min(elapsed, w.moving || elapsed), elapsed, gain: 0, maxSpd: 0, ...(w.hr ? { hr: w.hr } : {}), ...(w.cadence ? { cad: { avg: w.cadence } } : {}), ...(w.power ? { pw: w.power } : {}), ...(w.kcal != null ? { kcal: w.kcal } : {}), ...(w.device ? { device: w.device } : {}) };
  }
  return { V, KINDS, STROKES, METHODS, platform, available: () => platform() !== 'web', request, receive, state,
    onLive: sub(liveSubs), onWorkout: sub(workoutSubs), onStatus: sub(statusSubs), cleanSample, cleanWorkout, toSwim, toRide };
})();
