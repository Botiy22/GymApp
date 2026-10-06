/* Daily goals. A zero-valued dated log is an explicit undo, retained during sync. */
window.Momentum = (() => {
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  const sources = ['check', 'count', 'steps', 'workout', 'protein'];
  const date = v => { const d = new Date(v), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  const shift = (k, n) => { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() + n); return date(d); };
  const bounded = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));
  function clean(h) {
    h = h && typeof h === 'object' ? h : {};
    if (!/^[A-Za-z0-9_\-]{1,40}$/.test(h.id || '') || typeof h.name !== 'string' || !h.name.trim()) return null;
    const source = sources.includes(h.source) ? h.source : 'check', logs = {};
    (Array.isArray(h.done) ? h.done : []).filter(k => typeof k === 'string' && DAY.test(k)).slice(-3000).forEach(k => { logs[k] = { v: 1, t: 1 }; });
    const raw = h.logs && typeof h.logs === 'object' ? h.logs : {};
    Object.keys(raw).filter(k => DAY.test(k)).sort().slice(-3000).forEach(k => {
      const z = raw[k]; if (z && typeof z === 'object') logs[k] = { v: bounded(z.v, 200000), t: bounded(z.t, 4e12) };
    });
    const days = [...new Set((Array.isArray(h.days) ? h.days : []).filter(x => Number.isInteger(x) && x >= 0 && x <= 6))].sort();
    return { id: h.id, name: h.name.trim().slice(0, 60), days: days.length ? days : [0, 1, 2, 3, 4, 5, 6],
      source, goal: source === 'check' || source === 'workout' ? 1 : Math.max(1, bounded(h.goal, 200000)),
      unit: typeof h.unit === 'string' ? h.unit.slice(0, 20) : '', started: typeof h.started === 'string' && DAY.test(h.started) ? h.started : '',
      logs, t: bounded(h.t, 4e12) };
  }
  const due = (h, k) => (!h.started || k >= h.started) && h.days.includes(new Date(k + 'T12:00').getDay());
  function value(h, k, d) {
    if (h.source === 'steps') return bounded((d.act[k] || {}).steps, 200000);
    if (h.source === 'workout') return d.workouts.some(w => date(w.start) === k) ? 1 : 0;
    if (h.source === 'protein') return (d.food[k] || []).reduce((n, f) => n + (Number(f.p) || 0), 0);
    return bounded((h.logs[k] || {}).v, 200000);
  }
  const progress = (h, k, d) => Math.min(1, value(h, k, d) / h.goal);
  const done = (h, k, d) => due(h, k) && value(h, k, d) >= h.goal;
  function streak(h, k, d) {
    if (!done(h, k, d)) k = shift(k, -1);
    let n = 0;
    for (let i = 0; i < 3660 && (!h.started || k >= h.started); i++, k = shift(k, -1)) {
      if (due(h, k)) { if (!done(h, k, d)) break; n++; }
    }
    return n;
  }
  function summary(habits, k, d) {
    const list = habits.filter(h => due(h, k));
    return { total: list.length, done: list.filter(h => done(h, k, d)).length,
      ratio: list.length ? list.reduce((n, h) => n + progress(h, k, d), 0) / list.length : 0 };
  }
  function merge(a, b, del) {
    const m = {};
    [a, b].forEach(list => (Array.isArray(list) ? list : []).forEach(raw => {
      const h = clean(raw); if (!h || del[h.id]) return;
      const old = m[h.id]; if (!old) { m[h.id] = h; return; }
      const winner = h.t > old.t || (h.t === old.t && JSON.stringify(h) > JSON.stringify(old)) ? h : old;
      const logs = Object.assign({}, old.logs);
      Object.keys(h.logs).forEach(k => { const x = h.logs[k], y = logs[k]; if (!y || x.t > y.t || (x.t === y.t && x.v < y.v)) logs[k] = x; });
      m[h.id] = Object.assign({}, winner, { logs });
    }));
    return Object.values(m).sort((x, y) => x.id.localeCompare(y.id));
  }
  return { sources, clean, date, shift, due, value, done, progress, streak, summary, merge };
})();
