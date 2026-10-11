/* Bike rides: GPS recording, route storage, GPX/TCX import and export, Bluetooth sensor parsing.
   Pure logic and device access only; the screens live in app.js. Distances in metres, times in seconds. */
globalThis.Rides = (() => {
  'use strict';
  const EARTH = 6371008.8, rad = d => d * Math.PI / 180;
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const MAX_SPEED = 33;          // m/s (~120 km/h): faster jumps are GPS glitches
  const MOVING = 0.8;            // m/s (~2.9 km/h): slower intervals do not count as moving time
  const SIMPLIFY = 6;            // metres of tolerance when a finished route is stored

  function dist(a, b) {
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /* ---------- compact storage: the polyline character scheme for signed integers ---------- */
  function encInts(list) {
    let out = '', prev = 0;
    for (const value of list) {
      let v = Math.round(value) - prev; prev = Math.round(value);
      v = v < 0 ? ~(v << 1) : v << 1;
      while (v >= 0x20) { out += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>>= 5; }
      out += String.fromCharCode(v + 63);
    }
    return out;
  }
  function decInts(text) {
    const out = []; let i = 0, prev = 0;
    while (i < text.length) {
      let shift = 0, result = 0, b;
      do { b = text.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20 && i < text.length);
      prev += result & 1 ? ~(result >> 1) : result >> 1; out.push(prev);
    }
    return out;
  }
  function encodePath(points) {
    // lat and lon interleaved, each a delta from its own previous value (the usual polyline layout)
    let out = '', pl = 0, pn = 0;
    const one = v => { v = v < 0 ? ~(v << 1) : v << 1; let s = ''; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>>= 5; } return s + String.fromCharCode(v + 63); };
    for (const p of points) { const la = Math.round(p.lat * 1e5), lo = Math.round(p.lon * 1e5); out += one(la - pl) + one(lo - pn); pl = la; pn = lo; }
    return out;
  }
  function decodePath(text) {
    const ints = decIntsRaw(text), out = []; let la = 0, lo = 0;
    for (let i = 0; i + 1 < ints.length; i += 2) { la += ints[i]; lo += ints[i + 1]; out.push({ lat: la / 1e5, lon: lo / 1e5 }); }
    return out;
  }
  function decIntsRaw(text) {
    const out = []; let i = 0;
    while (i < text.length) {
      let shift = 0, result = 0, b;
      do { b = text.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20 && i < text.length);
      out.push(result & 1 ? ~(result >> 1) : result >> 1);
    }
    return out;
  }

  /* Douglas-Peucker on a local flat projection; keeps the first and last point. Returns kept indices. */
  function simplify(points, tol) {
    const n = points.length; if (n < 3) return points.map((_, i) => i);
    const lat0 = rad(points[0].lat), kx = EARTH * Math.cos(lat0) * Math.PI / 180, ky = EARTH * Math.PI / 180;
    const xy = points.map(p => [p.lon * kx, p.lat * ky]), keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
    const stack = [[0, n - 1]], tol2 = tol * tol;
    while (stack.length) {
      const [a, b] = stack.pop(); let max = 0, at = -1;
      const [ax, ay] = xy[a], [bx, by] = xy[b], dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
      for (let i = a + 1; i < b; i++) {
        const [px, py] = xy[i]; let u = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0; u = Math.max(0, Math.min(1, u));
        const ex = ax + u * dx - px, ey = ay + u * dy - py, d2 = ex * ex + ey * ey;
        if (d2 > max) { max = d2; at = i; }
      }
      if (at > 0 && max > tol2) { keep[at] = 1; stack.push([a, at], [at, b]); }
    }
    const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(i);
    return out;
  }

  /* ---------- recording ---------- */
  // The running ride is plain JSON so it survives a reload: points are [lat, lon, seconds since start, elevation|null].
  function start(now) {
    return { v: 1, id: 'r' + now.toString(36) + Math.random().toString(36).slice(2, 6), start: now, paused: false, pausedAt: 0, pausedMs: 0,
      pts: [], breakNext: false, dist: 0, moving: 0, gain: 0, eleRef: null, maxSpd: 0, spd: 0, recent: [], last: null,
      hr: [0, 0, 0], cad: [0, 0], pw: [0, 0, 0], wheel: 0, acc: null, lastFix: 0 };
  }
  // Feed one position. opts.imported skips the accuracy and jitter filters (files were already filtered by the device).
  function add(s, fix, opts) {
    opts = opts || {};
    if (!s || s.paused || !fix || !finite(fix.lat) || !finite(fix.lon) || !finite(fix.t)) return 'skip';
    if (Math.abs(fix.lat) > 90 || Math.abs(fix.lon) > 180) return 'skip';
    s.acc = finite(fix.acc) ? Math.round(fix.acc) : null; s.lastFix = fix.t;
    if (!opts.imported && finite(fix.acc) && fix.acc > 35) return 'weak';
    const t = (fix.t - s.start) / 1000, ele = finite(fix.alt) && (!finite(fix.altAcc) || fix.altAcc <= 25) ? Math.round(fix.alt * 10) / 10 : null;
    const point = [Math.round(fix.lat * 1e6) / 1e6, Math.round(fix.lon * 1e6) / 1e6, Math.round(t), ele];
    const prev = s.last;
    if (!prev || s.breakNext) {
      s.breakNext = false; s.pts.push(point); s.last = { lat: fix.lat, lon: fix.lon, t: fix.t }; if (ele != null) { s.eleBuf = [ele]; if (s.eleRef == null) s.eleRef = ele; }
      s.spd = 0; s.recent = []; return 'first';
    }
    const d = dist(prev, fix), dt = (fix.t - prev.t) / 1000;
    if (!(dt > 0)) return 'skip';
    const jitter = opts.imported ? 0 : Math.max(4, (finite(fix.acc) ? fix.acc : 10) * 0.5);
    if (d < jitter) { if (dt > 8) s.spd = 0; return 'still'; }
    const v = d / dt;
    if (v > MAX_SPEED) return 'glitch';
    s.dist += d; if (v >= MOVING && v <= 25) s.moving += dt;
    s.pts.push(point); s.last = { lat: fix.lat, lon: fix.lon, t: fix.t };
    // Speed over the last ~5 seconds is far steadier than fix-to-fix speed, whose GPS noise inflates the maximum.
    s.recent.push([d, dt]); let span = s.recent.reduce((n, x) => n + x[1], 0);
    while (s.recent.length > 1 && span - s.recent[0][1] >= 5) span -= s.recent.shift()[1];
    const smooth = s.recent.reduce((n, x) => n + x[0], 0) / span;
    const reported = finite(fix.speed) && fix.speed >= 0 && fix.speed <= MAX_SPEED ? fix.speed : null;
    s.spd = reported != null ? reported : smooth;
    if (span >= 4 && dt <= 30) s.maxSpd = Math.max(s.maxSpd, Math.min(25, smooth));
    if (ele != null) {
      // Average the last few altitudes, follow descents, and count a climb once it clears the threshold.
      const step = opts.imported ? 2 : 5; s.eleBuf = (s.eleBuf || []).concat(ele).slice(opts.imported ? -3 : -10);
      const sm = s.eleBuf.reduce((n, x) => n + x, 0) / s.eleBuf.length;
      if (s.eleRef == null || sm < s.eleRef) s.eleRef = sm;
      else if (sm - s.eleRef >= step) { s.gain += sm - s.eleRef; s.eleRef = sm; }
    }
    return 'ok';
  }
  function pause(s, now) { if (s && !s.paused) { s.paused = true; s.pausedAt = now; s.spd = 0; } }
  function resume(s, now) { if (s && s.paused) { s.paused = false; s.pausedMs += Math.max(0, now - s.pausedAt); s.pausedAt = 0; s.breakNext = true; } }
  function elapsed(s, now) { return s ? Math.max(0, ((s.paused ? s.pausedAt : now) - s.start - s.pausedMs) / 1000) : 0; }
  function sensor(s, kind, value) {
    if (!s || s.paused || !finite(value)) return;
    if (kind === 'hr' && value >= 25 && value <= 250) { s.hr[0] += value; s.hr[1]++; s.hr[2] = Math.max(s.hr[2], value); }
    if (kind === 'cad' && value >= 0 && value <= 250) { s.cad[0] += value; s.cad[1]++; }
    if (kind === 'pw' && value >= 0 && value <= 3000) { s.pw[0] += value; s.pw[1]++; s.pw[2] = Math.max(s.pw[2], value); }
    if (kind === 'wheel' && value > 0 && value < 200) s.wheel += value;
  }
  // Turn a recording into the stored ride: a simplified route, its times and elevations, and the totals.
  function finish(s, now, src) {
    const pts = s.pts.map(p => ({ lat: p[0], lon: p[1], t: p[2], e: p[3] }));
    // Corners come from the simplification; a point at least every 200 m also keeps times and elevations useful on straight roads.
    const kept = new Set(simplify(pts, SIMPLIFY)); let run = 0;
    for (let i = 1; i < pts.length; i++) { run += dist(pts[i - 1], pts[i]); if (kept.has(i)) run = 0; else if (run >= 200) { kept.add(i); run = 0; } }
    const keep = [...kept].sort((a, b) => a - b).map(i => pts[i]);
    let total = s.dist, wheel = false;
    if (total < 100 && s.wheel > total) { total = s.wheel; wheel = true; }           // indoor trainer or no GPS: the wheel sensor measured the distance
    const lastT = pts.length ? pts[pts.length - 1].t : 0, elapsedS = Math.round(src === 'gps' ? Math.max(elapsed(s, now), lastT) : lastT);
    let moving = Math.round(s.moving); if (wheel || moving < 1) moving = elapsedS;
    const ride = { v: 1, src: src || 'gps', dist: Math.round(total), moving: Math.min(moving, elapsedS || moving), elapsed: elapsedS, gain: Math.round(s.gain), maxSpd: Math.round(s.maxSpd * 36) / 10 };
    if (keep.length >= 2) {
      ride.path = encodePath(keep); ride.ts = encInts(keep.map(p => p.t));
      // Some fixes come without altitude: fill short gaps from the nearest known value when most points have one.
      const known = keep.filter(p => p.e != null).length;
      if (known && known >= keep.length * 0.8) { let last = keep.find(p => p.e != null).e; ride.ele = encInts(keep.map(p => (last = p.e != null ? p.e : last))); }
    }
    if (s.hr[1]) ride.hr = { avg: Math.round(s.hr[0] / s.hr[1]), max: Math.round(s.hr[2]) };
    if (s.cad[1]) ride.cad = { avg: Math.round(s.cad[0] / s.cad[1]) };
    if (s.pw[1]) ride.pw = { avg: Math.round(s.pw[0] / s.pw[1]), max: Math.round(s.pw[2]) };
    if (wheel) ride.wheel = true;
    return ride;
  }
  const avgSpeed = r => r && r.moving > 0 ? r.dist / r.moving * 3.6 : 0;       // km/h
  function route(r) {
    if (!r || !r.path) return [];
    const p = decodePath(r.path), ts = r.ts ? decInts(r.ts) : [], el = r.ele ? decInts(r.ele) : [];
    return p.map((x, i) => ({ lat: x.lat, lon: x.lon, t: ts[i], e: el.length === p.length ? el[i] : null }));
  }

  /* ---------- cleaning stored rides (backups and account copies are untrusted) ---------- */
  const POLY = /^[\x3f-\x7e]*$/;
  function clean(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    const n = (x, lo, hi) => { x = typeof x === 'number' ? x : parseFloat(x); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0; };
    const o = { v: 1, src: ['gps', 'gpx', 'tcx'].includes(v.src) ? v.src : 'gps', dist: Math.round(n(v.dist, 0, 2e6)), moving: Math.round(n(v.moving, 0, 4e5)), elapsed: Math.round(n(v.elapsed, 0, 4e5)), gain: Math.round(n(v.gain, 0, 30000)), maxSpd: Math.round(n(v.maxSpd, 0, 150) * 10) / 10 };
    if (o.elapsed < o.moving) o.elapsed = o.moving;
    const text = (x, max) => typeof x === 'string' && x.length <= max && POLY.test(x) ? x : '';
    const path = text(v.path, 120000);
    if (path) {
      const count = decodePath(path).length, ts = text(v.ts, 60000), ele = text(v.ele, 60000);
      if (count >= 2) { o.path = path; if (ts && decInts(ts).length === count) o.ts = ts; if (ele && decInts(ele).length === count) o.ele = ele; }
    }
    const pair = (x, keys, hi) => { if (!x || typeof x !== 'object') return null; const r = {}; for (const k of keys) { const y = Math.round(n(x[k], 0, hi)); if (y > 0) r[k] = y; } return Object.keys(r).length ? r : null; };
    const hr = pair(v.hr, ['avg', 'max'], 250), cad = pair(v.cad, ['avg'], 250), pw = pair(v.pw, ['avg', 'max'], 3000);
    if (hr) o.hr = hr; if (cad) o.cad = cad; if (pw) o.pw = pw; if (v.wheel === true) o.wheel = true;
    return o.dist > 0 || o.moving > 0 ? o : null;
  }

  /* ---------- files from bike computers and other apps ---------- */
  const tag = (body, name) => { const m = new RegExp('<(?:[\\w-]+:)?' + name + '\\b[^>]*>([^<]*)<', 'i').exec(body); return m ? m[1].trim() : ''; };
  const attr = (head, name) => { const m = new RegExp('\\b' + name + '\\s*=\\s*["\']([^"\']+)["\']', 'i').exec(head); return m ? m[1] : ''; };
  const unxml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  function parse(text) {
    text = String(text || '').slice(0, 30e6);
    const points = []; let kind = '', name = '', total = 0, sport = '';
    if (/<gpx[\s>]/i.test(text)) {
      kind = 'gpx'; const trk = /<trk\b[\s\S]*?<name>([^<]*)<\/name>/i.exec(text); name = trk ? unxml(trk[1].trim()) : '';
      const re = /<trkpt\b([^>]*?)(\/>|>([\s\S]*?)<\/trkpt>)/gi; let m;
      while ((m = re.exec(text))) {
        const body = m[3] || '';
        points.push({ lat: +attr(m[1], 'lat'), lon: +attr(m[1], 'lon'), alt: tag(body, 'ele') === '' ? NaN : +tag(body, 'ele'), t: Date.parse(tag(body, 'time')), hr: +tag(body, 'hr') || 0, cad: +tag(body, 'cad') || 0, pw: +tag(body, 'power') || 0 });
      }
    } else if (/<TrainingCenterDatabase[\s>]/i.test(text)) {
      kind = 'tcx'; const act = /<Activity\b([^>]*)>/i.exec(text); sport = act ? attr(act[1], 'Sport') : '';
      const re = /<Trackpoint\b[^>]*>([\s\S]*?)<\/Trackpoint>/gi; let m;
      while ((m = re.exec(text))) {
        const b = m[1], hrm = /<HeartRateBpm\b[^>]*>([\s\S]*?)<\/HeartRateBpm>/i.exec(b), dm = +tag(b, 'DistanceMeters') || 0;
        if (dm > total) total = dm;
        points.push({ lat: tag(b, 'LatitudeDegrees') === '' ? NaN : +tag(b, 'LatitudeDegrees'), lon: tag(b, 'LongitudeDegrees') === '' ? NaN : +tag(b, 'LongitudeDegrees'), alt: tag(b, 'AltitudeMeters') === '' ? NaN : +tag(b, 'AltitudeMeters'), t: Date.parse(tag(b, 'Time')), hr: hrm ? +tag(hrm[1], 'Value') || 0 : 0, cad: +tag(b, 'Cadence') || 0, pw: +tag(b, 'Watts') || 0 });
      }
    } else return { error: 'format' };
    const timed = points.filter(p => Number.isFinite(p.t)).sort((a, b) => a.t - b.t);
    if (!timed.length) return { error: points.length ? 'time' : 'empty' };
    const s = start(timed[0].t);
    for (const p of timed) {
      if (Number.isFinite(p.lat) && Number.isFinite(p.lon)) add(s, { lat: p.lat, lon: p.lon, t: p.t, alt: Number.isFinite(p.alt) ? p.alt : null }, { imported: true });
      if (p.hr) sensor(s, 'hr', p.hr); if (p.cad) sensor(s, 'cad', p.cad); if (p.pw) sensor(s, 'pw', p.pw);
    }
    const end = timed[timed.length - 1].t;
    if (total > s.dist + 50 && s.dist < 100) { s.wheel = total; }                    // indoor file: distance without positions
    else if (total > 0 && Math.abs(total - s.dist) < s.dist * 0.2) s.dist = total;   // trust the device's own distance when it roughly agrees
    const ride = finish(s, end, kind);
    ride.elapsed = Math.round((end - timed[0].t) / 1000); if (!ride.moving || ride.wheel) ride.moving = ride.elapsed; ride.moving = Math.min(ride.moving, ride.elapsed);
    if (!ride.dist && !ride.moving) return { error: 'empty' };
    return { ride, start: timed[0].t, end, name: unxml(name).slice(0, 80), sport };
  }
  const xmlEsc = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
  function gpx(ride, startMs, name) {
    const pts = route(ride);
    const rows = pts.map(p => `<trkpt lat="${p.lat.toFixed(5)}" lon="${p.lon.toFixed(5)}">${p.e != null ? `<ele>${p.e}</ele>` : ''}${Number.isFinite(p.t) ? `<time>${new Date(startMs + p.t * 1000).toISOString()}</time>` : ''}</trkpt>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Reppsy" xmlns="http://www.topografix.com/GPX/1/1">\n<metadata><time>${new Date(startMs).toISOString()}</time></metadata>\n<trk><name>${xmlEsc(name || 'Ride')}</name><type>cycling</type><trkseg>\n${rows}\n</trkseg></trk>\n</gpx>\n`;
  }

  /* ---------- Bluetooth sensors (standard GATT profiles) ---------- */
  const u16 = (dv, o) => dv.getUint16(o, true), u32 = (dv, o) => dv.getUint32(o, true);
  function parseHr(dv) { const f = dv.getUint8(0); return f & 1 ? u16(dv, 1) : dv.getUint8(1); }
  function parseCsc(dv) {
    const f = dv.getUint8(0), out = {}; let o = 1;
    if (f & 1) { out.wheelRevs = u32(dv, o); out.wheelTime = u16(dv, o + 4) / 1024; out.wheelWrap = 64; o += 6; }
    if (f & 2) { out.crankRevs = u16(dv, o); out.crankTime = u16(dv, o + 2) / 1024; }
    return out;
  }
  function parsePower(dv) {
    const f = u16(dv, 0), out = { watts: dv.getInt16(2, true) }; let o = 4;
    if (f & 1) o += 1; if (f & 4) o += 2;
    if (f & 16) { out.wheelRevs = u32(dv, o); out.wheelTime = u16(dv, o + 4) / 2048; out.wheelWrap = 32; o += 6; }
    if (f & 32) { out.crankRevs = u16(dv, o); out.crankTime = u16(dv, o + 2) / 1024; }
    return out;
  }
  // Speed and cadence from two consecutive revolution readings; counters and event clocks wrap around.
  function revDelta(prev, cur, circ) {
    const out = {};
    if (prev && cur.wheelRevs != null && prev.wheelRevs != null) {
      const W = cur.wheelWrap || 64, revs = (cur.wheelRevs - prev.wheelRevs + 4294967296) % 4294967296, dt = (cur.wheelTime - prev.wheelTime + W) % W;
      if (dt > 0 && revs < 200) { out.dist = revs * circ; out.speed = out.dist / dt; } else if (revs === 0) { out.dist = 0; }
    }
    if (prev && cur.crankRevs != null && prev.crankRevs != null) {
      const revs = (cur.crankRevs - prev.crankRevs + 65536) % 65536, dt = (cur.crankTime - prev.crankTime + 64) % 64;
      if (dt > 0 && revs < 50) out.cadence = revs / dt * 60;
    }
    return out;
  }
  const bluetooth = () => !!(globalThis.navigator && navigator.bluetooth && navigator.bluetooth.requestDevice);
  const SERVICES = { hr: 'heart_rate', csc: 'cycling_speed_and_cadence', pw: 'cycling_power' };
  const CHARS = { hr: 'heart_rate_measurement', csc: 'csc_measurement', pw: 'cycling_power_measurement' };
  // Pick a sensor from the browser's own chooser and subscribe to everything it offers. onData(kind, DataView).
  async function pair(onData, onLost) {
    const device = await navigator.bluetooth.requestDevice({ filters: Object.values(SERVICES).map(s => ({ services: [s] })), optionalServices: Object.values(SERVICES) });
    const kinds = [];
    async function subscribe() {
      const gatt = await device.gatt.connect(); kinds.length = 0;
      for (const k of Object.keys(SERVICES)) {
        try { const svc = await gatt.getPrimaryService(SERVICES[k]), ch = await svc.getCharacteristic(CHARS[k]); ch.addEventListener('characteristicvaluechanged', e => onData(k, e.target.value)); await ch.startNotifications(); kinds.push(k); } catch (e) { /* the sensor does not offer this profile */ }
      }
      if (!kinds.length) throw new Error('unsupported');
    }
    let closed = false;
    device.addEventListener('gattserverdisconnected', async () => {
      if (closed) return;
      for (let i = 0; i < 3 && !closed; i++) { await new Promise(r => setTimeout(r, 1500 * (i + 1))); try { await subscribe(); return; } catch (e) {} }
      if (onLost) onLost();
    });
    await subscribe();
    return { name: device.name || '', kinds, close() { closed = true; try { device.gatt.disconnect(); } catch (e) {} } };
  }

  return { dist, encInts, decInts, encodePath, decodePath, simplify, start, add, pause, resume, elapsed, sensor, finish, avgSpeed, route, clean, parse, gpx,
    parseHr, parseCsc, parsePower, revDelta, bluetooth, pair };
})();
