/* Shared recipe ratings: every signed-in user can give a recipe 1–5 stars, everyone sees the average and the count.
   Data lives in Supabase (migrations/20261112_recipe_ratings.sql); only counts and averages are public, never who rated.
   The last summary is cached on the device so cards still show ratings offline. */
globalThis.RecipeRatings = (() => {
  'use strict';
  const KEY = 'gymapp.v1.recipeRatings', ID = /^[a-z0-9][a-z0-9-]{1,79}$/, PRIOR = 3.5, WEIGHT = 3, TTL = 5 * 60 * 1000;
  const st = { summary: {}, mine: {}, at: 0, error: '', ready: false };   // ready: the server has answered once (the ratings backend exists)
  let busy = null;
  const cleanSummary = o => { const out = {}; for (const [id, v] of Object.entries(o && typeof o === 'object' ? o : {})) { const avg = +(v && v.avg), n = Math.round(+(v && v.n)); if (ID.test(id) && avg >= 1 && avg <= 5 && n > 0) out[id] = { avg: Math.round(avg * 100) / 100, n }; } return out; };
  const cleanMine = o => { const out = {}; for (const [id, v] of Object.entries(o && typeof o === 'object' ? o : {})) { const s = Math.round(+v); if (ID.test(id) && s >= 1 && s <= 5) out[id] = s; } return out; };
  try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c) { st.summary = cleanSummary(c.summary); st.mine = cleanMine(c.mine); st.owner = String(c.owner || ''); st.ready = c.ready === true; } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ summary: st.summary, mine: st.mine, owner: st.owner || '', ready: st.ready })); } catch (e) {} };
  const cloud = () => globalThis.Cloud && Cloud.on && Cloud.publicRpc ? Cloud : null;
  const user = () => { const C = cloud(); return C && C.user ? C.user.id : ''; };
  function load(force) {
    const C = cloud(); if (!C) return Promise.resolve(false);
    if (busy) return busy;
    if (!force && ((Date.now() - st.at < TTL && st.owner === user()) || Date.now() - (st.tried || 0) < TTL)) return Promise.resolve(false);
    busy = (async () => {
      try {
        st.summary = cleanSummary(await C.publicRpc('recipe_rating_summary'));
        const me = user(); st.mine = me ? cleanMine(await C.rpc('recipe_rating_mine')) : {}; st.owner = me;
        st.at = Date.now(); st.error = ''; st.ready = true; save(); return true;
      } catch (e) { st.error = e.code || 'api'; st.tried = Date.now(); return false; } finally { busy = null; }   // wait before asking again
    })();
    return busy;
  }
  /* stars 1–5 sets your rating, 0 removes it. The summary updates at once and is replaced by the server's answer. */
  async function rate(id, stars) {
    const C = cloud(); if (!C || !C.user) { const e = new Error('signin'); e.code = 'signin'; throw e; }
    stars = Math.round(+stars); if (!ID.test(id) || !(stars >= 0 && stars <= 5)) throw new Error('bad');
    const prevMine = st.mine[id] || 0, prevSum = st.summary[id] ? { ...st.summary[id] } : null;
    const s = prevSum ? { ...prevSum } : { avg: 0, n: 0 }, total = s.avg * s.n - prevMine + stars, n = s.n - (prevMine ? 1 : 0) + (stars ? 1 : 0);
    if (n > 0) st.summary[id] = { avg: Math.round(total / n * 100) / 100, n }; else delete st.summary[id];
    if (stars) st.mine[id] = stars; else delete st.mine[id];
    try {
      const r = await C.rpc('recipe_rate', { p_recipe: id, p_stars: stars });
      const fresh = cleanSummary({ [id]: r || {} })[id];
      if (fresh) st.summary[id] = fresh; else if (r && +r.n === 0) delete st.summary[id];
      st.owner = C.user.id; save(); return st.summary[id] || null;
    } catch (e) {
      if (prevSum) st.summary[id] = prevSum; else delete st.summary[id];
      if (prevMine) st.mine[id] = prevMine; else delete st.mine[id];
      throw e;
    }
  }
  /* Ranking without letting one 5-star vote win: an average pulled towards 3.5 by three imaginary votes. */
  const score = id => { const s = st.summary[id]; return s ? (s.avg * s.n + PRIOR * WEIGHT) / (s.n + WEIGHT) : 0; };
  return { version: 1, state: st, load, rate, score, get: id => st.summary[id] || null, mine: id => (st.owner === user() && st.mine[id]) || 0,
    configured: () => !!cloud(), available: () => !!cloud() && st.ready, canRate: () => !!user() && st.ready };
})();
