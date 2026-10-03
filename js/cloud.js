/* Accounts and syncing through Supabase, with plain requests (no library).
   Sign-in: Supabase Auth (e-mail + password). Data: one row per user in the table "userdata", protected by row level security.
   Syncing is "merge, then upload": records made on different devices are combined, never blindly overwritten. */
window.Cloud = (function () {
  const cfg = window.CLOUD || {}, BASE = String(cfg.url || '').trim().replace(/\/+$/, ''), KEY = String(cfg.key || '').trim();
  const on = /^(https:\/\/[a-z0-9.-]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/i.test(BASE) && KEY.length >= 20 && !/service_role|sb_secret_/.test(KEY);
  const SK = 'gymapp.v1.session', YK = 'gymapp.v1.sync';
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const put = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let ses = get(SK); if (!ses || !ses.access_token || !ses.user || !ses.user.id) ses = null;
  let st = get(YK) || {}; const state = { seen: +st.seen || 0, hash: +st.hash || 0, at: +st.at || 0, err: '' };
  const keepState = () => put(YK, { seen: state.seen, hash: state.hash, at: state.at });
  function keep(s) {
    ses = s && s.access_token && s.user && s.user.id ? { access_token: String(s.access_token), refresh_token: String(s.refresh_token || ''), expires_at: +s.expires_at || Math.floor(Date.now() / 1000) + (+s.expires_in || 3600), user: { id: String(s.user.id), email: String(s.user.email || '') } } : null;
    put(SK, ses); if (!ses) { state.seen = 0; state.hash = 0; state.at = 0; put(YK, null); }
  }
  const fail = (code, msg) => { const e = new Error(msg || code); e.code = code; return e; };
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; };

  async function call(path, o) {
    o = o || {}; let res;
    const headers = { apikey: KEY, 'Content-Type': 'application/json' };
    if (o.auth) headers.Authorization = 'Bearer ' + o.auth; if (o.prefer) headers.Prefer = o.prefer;
    try { res = await fetch(BASE + path, { method: o.method || 'GET', headers, body: o.body ? JSON.stringify(o.body) : undefined }); } catch (e) { throw fail('network'); }
    let body = null; try { body = await res.json(); } catch (e) {}
    if (res.ok) return body;
    const c = String((body && (body.error_code || body.code || body.error)) || ''), m = String((body && (body.msg || body.message || body.error_description)) || '');
    if (res.status === 429 || /rate.?limit/i.test(c + m)) throw fail('rate', m);
    if (c === 'invalid_credentials' || /invalid login/i.test(m)) throw fail('creds', m);
    if (c === 'email_not_confirmed' || /not confirmed/i.test(m)) throw fail('confirm', m);
    if (c === 'user_already_exists' || c === 'email_exists' || /already (registered|exists)/i.test(m)) throw fail('exists', m);
    if (c === 'weak_password' || /password should|at least \d+ char/i.test(m)) throw fail('weak', m);
    if (c === 'signup_disabled' || /signups? (not allowed|disabled)/i.test(m)) throw fail('closed', m);
    if (c === 'email_address_invalid' || c === 'validation_failed' || /valid (e-?mail|password)|invalid format/i.test(m)) throw fail('email', m);
    if (res.status === 401 || res.status === 403 || c === 'invalid_grant' || /jwt|refresh token/i.test(c + m)) throw fail('auth', m);
    throw fail('api', m || ('HTTP ' + res.status));
  }
  let refreshing = null;
  function refresh() {
    if (!refreshing) refreshing = (async () => {
      try { keep(await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: ses.refresh_token } })); if (!ses) throw fail('auth'); return ses.access_token; }
      catch (e) { if (e.code !== 'network' && e.code !== 'rate') { const u = ses && ses.user; put(SK, null); ses = null; state.err = 'auth'; e.code = 'auth'; e.user = u; } throw e; }   // offline: the session is kept and tried again later
      finally { refreshing = null; }
    })();
    return refreshing;
  }
  async function token() { if (!ses) throw fail('auth'); return ses.expires_at - 90 > Date.now() / 1000 ? ses.access_token : refresh(); }

  /* ---------- combining two copies of the data ---------- */
  function merge(a, b) {
    a = a && typeof a === 'object' ? a : {}; b = b && typeof b === 'object' ? b : {};
    /* "Delete all data" starts a new epoch. A copy from an older epoch is thrown away whole, so deleted data cannot come back from another device. */
    if ((+b.epoch || 0) > (+a.epoch || 0)) { const o = JSON.parse(JSON.stringify(b)), k = a.settings || {}; o.settings = Object.assign({}, o.settings, { apiKey: k.apiKey || '', keyState: k.keyState || '' }); return o; }
    if ((+a.epoch || 0) > (+b.epoch || 0)) return JSON.parse(JSON.stringify(a));
    const A = a.mt || {}, B = b.mt || {}, newer = k => (+B[k] || 0) > (+A[k] || 0);                 // is the account copy of this part the more recent one?
    const out = JSON.parse(JSON.stringify(a)), list = v => Array.isArray(v) ? v : [], map = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    const del = Object.assign({}, map(b.del)); Object.keys(map(a.del)).forEach(k => { del[k] = Math.max(+del[k] || 0, +a.del[k] || 0); });
    out.del = del; out.mt = {}; Object.keys(A).concat(Object.keys(B)).forEach(k => { out.mt[k] = Math.max(+A[k] || 0, +B[k] || 0); });
    const w = {}; list(b.workouts).forEach(x => { if (x && x.id) w[x.id] = x; }); list(a.workouts).forEach(x => { if (x && x.id) w[x.id] = x; });        // workouts and meals: everything from both sides, minus what was deleted
    out.workouts = Object.keys(w).filter(id => !del[id]).map(id => w[id]).sort((x, y) => (x.start || 0) - (y.start || 0));
    out.food = {}; const fa = map(a.food), fb = map(b.food), days = {}; Object.keys(fa).concat(Object.keys(fb)).forEach(d => { days[d] = 1; });
    Object.keys(days).sort().forEach(d => { const m = {}; list(fb[d]).forEach(f => { if (f && f.id) m[f.id] = f; }); list(fa[d]).forEach(f => { if (f && f.id) m[f.id] = f; }); const l = Object.keys(m).filter(id => !del[id]).map(id => m[id]).sort((x, y) => (x.t || 0) - (y.t || 0)); if (l.length) out.food[d] = l; });
    const bd = {}; (newer('body') ? [a.body, b.body] : [b.body, a.body]).forEach(l => list(l).forEach(x => { if (x && x.d) bd[x.d] = x; })); out.body = Object.keys(bd).sort().map(k => bd[k]);   // per day; on a clash the newer side wins
    out.act = newer('act') ? Object.assign({}, map(a.act), map(b.act)) : Object.assign({}, map(b.act), map(a.act));
    const seen = {}; out.routines = (newer('routines') ? list(b.routines).concat(list(a.routines)) : list(a.routines).concat(list(b.routines))).filter(r => r && r.id && !del[r.id] && !seen[r.id] && (seen[r.id] = 1));
    const ch = {}; list(b.chats).concat(list(a.chats)).forEach(c => { if (c && c.id && (!ch[c.id] || (+c.t || 0) >= (+ch[c.id].t || 0))) ch[c.id] = c; });      // coach conversations: the later version of each
    out.chats = Object.keys(ch).filter(id => !del[id]).map(id => ch[id]).sort((x, y) => (x.t || 0) - (y.t || 0)).slice(-40);
    if (newer('favs')) { out.favEx = list(b.favEx); out.favFoods = list(b.favFoods); }
    if (newer('notes')) out.aiNotes = list(b.aiNotes);
    const mine = map(a.settings), theirs = map(b.settings);
    if (newer('settings')) out.settings = Object.assign({}, theirs, { apiKey: mine.apiKey || '', keyState: mine.keyState || '' });
    if (!out.settings || typeof out.settings !== 'object') out.settings = {};
    if (!out.settings.apiKey && theirs.syncKey && theirs.apiKey) { out.settings.apiKey = theirs.apiKey; out.settings.syncKey = true; }    // the key travels only when its owner switched that on
    return out;
  }

  /* ---------- syncing ---------- */
  let busy = null;
  function sync() {
    if (!on || !ses) return Promise.resolve('off');
    if (!busy) busy = (async () => {
      const run = async tk => {
        const uid = ses.user.id, q = '/rest/v1/userdata?user_id=eq.' + encodeURIComponent(uid);
        const hd = await call(q + '&select=updated_at', { auth: tk }), at = hd && hd[0] ? Date.parse(hd[0].updated_at) || 1 : 0;
        let changed = false;
        if (at && at !== state.seen) {                                           // another device wrote since this one last looked
          const row = await call(q + '&select=data,updated_at', { auth: tk });
          if (row && row[0] && row[0].data) { changed = window.Store.adopt(merge(window.Store.cloudDoc(), row[0].data)); state.seen = Date.parse(row[0].updated_at) || at; state.hash = hash(JSON.stringify(row[0].data)); }
        }
        const doc = window.Store.cloudDoc(), h = hash(JSON.stringify(doc));
        if (!at || h !== state.hash) {
          const iso = new Date().toISOString();
          const r = await call('/rest/v1/userdata?on_conflict=user_id&select=updated_at', { method: 'POST', auth: tk, prefer: 'resolution=merge-duplicates,return=representation', body: { user_id: uid, data: doc, updated_at: iso } });
          state.seen = Date.parse(r && r[0] && r[0].updated_at ? r[0].updated_at : iso); state.hash = h;
        }
        state.at = Date.now(); state.err = ''; keepState(); return changed ? 'changed' : 'ok';
      };
      try {
        try { return await run(await token()); }
        catch (e) { if (e.code !== 'auth' || !ses) throw e; return await run(await refresh()); }      // the server no longer accepts the token although it looked valid: renew it once and try again
      } catch (e) { state.err = e.code || 'api'; throw e; } finally { busy = null; }
    })();
    return busy;
  }

  return {
    on, merge, sync, state,
    get user() { return ses ? ses.user : null; },
    async signUp(email, password) {
      const r = await call('/auth/v1/signup', { method: 'POST', body: { email, password } });
      if (r && r.access_token) { keep(r); return 'in'; }
      const u = r && (r.user || r); if (u && Array.isArray(u.identities) && !u.identities.length) throw fail('exists');     // an address that already has an account
      return 'confirm';                                                                                                  // the project asks for the e-mail to be confirmed first
    },
    async signIn(email, password) { keep(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })); if (!ses) throw fail('api'); return 'in'; },
    async signOut() { const tk = ses && ses.access_token; keep(null); if (tk) { try { await call('/auth/v1/logout', { method: 'POST', auth: tk }); } catch (e) {} } },
    recover(email) { return call('/auth/v1/recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { method: 'POST', body: { email } }); },
    async setPassword(password) { const tk = await token(); await call('/auth/v1/user', { method: 'PUT', auth: tk, body: { password } }); },
    /* coming back from a link in an e-mail (confirm address, reset password): the session arrives in the address after "#" */
    async fromLink() {
      const h = location.hash.replace(/^#/, ''); if (!/access_token=/.test(h)) return '';
      const p = {}; h.split('&').forEach(kv => { const i = kv.indexOf('='); if (i > 0) p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      if (!on || !p.access_token) return '';
      const user = await call('/auth/v1/user', { auth: p.access_token });
      keep({ access_token: p.access_token, refresh_token: p.refresh_token, expires_in: +p.expires_in || 3600, user });
      return ses ? (p.type === 'recovery' ? 'recovery' : 'in') : '';
    }
  };
})();
