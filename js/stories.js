/* Stories, photo posts, highlights and likes (2.28): server calls, picture shrinking, time labels, the shared like button
   and the full-screen story viewer. The lists and sheets that show them live in app.js, which calls Stories.init(ctx) once.
   Everything goes through the social_* functions in migrations/20261018_stories_posts.sql. */
globalThis.Stories = (() => {
  'use strict';
  const DURATIONS = [1, 6, 12, 24, 72, 168];          // hours a story stays up; 24 when nothing is chosen
  const DEFAULT_HOURS = 24;
  const AUDIENCES = ['everyone', 'friends', 'me'];
  const SEEN_KEY = 'gymapp.v1.seenStories';
  const STORY_MS = 5000, CAPTION_MS = 1500;           // how long one story shows, plus extra time to read a caption
  const HEART = 'M12 20.6s-7.3-4.4-9.3-8.9C1.3 8.4 3.3 4.6 7 4.6c2 0 3.5 1 5 2.9 1.5-1.9 3-2.9 5-2.9 3.7 0 5.7 3.8 4.3 7.1-2 4.5-9.3 8.9-9.3 8.9z';
  const state = { feed: null, posts: null, authors: {}, more: true, media: {}, archive: null, busy: false, error: '', at: 0 };
  const images = new Map();                            // id -> full-size picture, most recent last
  let ctx = { t: k => k, esc: s => String(s), calm: () => true, toast() {}, changed() {}, vibrate() {} };
  const t = (...a) => ctx.t(...a), esc = s => ctx.esc(s);

  /* ---------- seen stories (this device only) ---------- */
  let seen = null;
  function seenMap() {
    if (seen) return seen;
    seen = {};
    try { const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); if (raw && typeof raw === 'object') seen = raw; } catch (e) { seen = {}; }
    const now = Date.now();
    for (const id of Object.keys(seen)) if (!(seen[id] > now - 86400000)) delete seen[id];
    return seen;
  }
  function markSeen(item) {
    const map = seenMap(); if (!item || map[item.id]) return;
    map[item.id] = Date.parse(item.expires_at) || Date.now() + 86400000;
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(map)); } catch (e) {}
  }
  const isSeen = item => !!seenMap()[item.id];
  const groupSeen = g => !!(g && g.items && g.items.length && g.items.every(isSeen));

  /* ---------- server ---------- */
  const call = (name, body) => globalThis.Social.mutate(name, body || {});
  const CODES = { post_limit: 'postLimit', invalid_duration: 'storyDurationInvalid', highlight_name: 'highlightNameNeeded', highlight_limit: 'highlightLimit', post_not_found: 'postGone', highlight_not_found: 'postGone', image: 'photoUnreadable', big: 'photoTooBig' };
  function message(e) {
    if (e && (e.backendCode === 'PGRST202' || e.backendCode === '42P01' || e.backendCode === '42883')) return 'storiesSetup';
    const code = (String(e && e.message).match(/^[a-z_]+/) || [''])[0];
    if (CODES[code]) return CODES[code];
    return globalThis.Social ? globalThis.Social.message(e) : 'socialError';
  }
  let loading = null;
  function refresh(force) {
    if (loading) return loading;
    if (!force && state.at && Date.now() - state.at < 20000) return Promise.resolve();
    const owner = globalThis.Cloud && Cloud.user && Cloud.user.id;
    if (!owner) { reset(); return Promise.resolve(); }
    state.busy = true;
    loading = Promise.all([call('social_story_feed'), call('social_post_feed', {})]).then(([feed, page]) => {
      if (!Cloud.user || Cloud.user.id !== owner) return;
      state.feed = Array.isArray(feed) ? feed : []; state.posts = page.posts || []; state.authors = page.authors || {};
      state.more = state.posts.length >= 12; state.error = ''; state.at = Date.now();
    }).catch(e => { state.error = message(e); }).finally(() => { state.busy = false; loading = null; ctx.changed(); });
    return loading;
  }
  async function more() {
    if (!state.posts || !state.more || state.busy) return;
    state.busy = true;
    try {
      const last = state.posts[state.posts.length - 1], page = await call('social_post_feed', { p_before: last ? last.created_at : null });
      const known = new Set(state.posts.map(p => p.id));
      state.posts.push(...(page.posts || []).filter(p => !known.has(p.id))); Object.assign(state.authors, page.authors || {});
      state.more = (page.posts || []).length >= 12;
    } catch (e) { ctx.toast(t(message(e))); } finally { state.busy = false; ctx.changed(); }
  }
  async function user(id, force) {
    if (!force && state.media[id] && Date.now() - state.media[id].at < 20000) return state.media[id];
    const data = await call('social_user_media', { p_user: id });
    data.at = Date.now(); state.media[id] = data; return data;
  }
  async function fetchImages(ids) {
    const need = [...new Set(ids.filter(id => id && !images.has(id)))];
    for (let i = 0; i < need.length; i += 8) {
      const list = await call('social_media', { p_ids: need.slice(i, i + 8) });
      for (const item of list || []) { images.set(item.id, item.image); each(item.id, x => { x.likes = item.likes; x.liked = item.liked; }); }
      for (const id of need.slice(i, i + 8)) if (!images.has(id)) images.set(id, '');   // gone or no longer visible
    }
    while (images.size > 40) images.delete(images.keys().next().value);
    return ids.map(id => images.get(id) || '');
  }
  const imageOf = id => images.get(id);
  // Every copy of an item that is held in memory (feed, profile pages, highlights), so a like shows everywhere at once.
  function each(id, fn) {
    const lists = [];
    (state.feed || []).forEach(g => lists.push(g.items || []));
    lists.push(state.posts || [], state.archive || []);
    Object.values(state.media).forEach(m => { lists.push(m.posts || [], m.stories || []); (m.highlights || []).forEach(h => lists.push(h.items || [])); });
    if (viewer) viewer.groups.forEach(g => lists.push(g.items));
    const done = new Set();
    lists.forEach(list => list.forEach(x => { if (x && x.id === id && !done.has(x)) { done.add(x); fn(x); } }));
  }
  const find = id => { let hit = null; each(id, x => { hit = hit || x; }); return hit; };
  async function like(id, on) {
    const before = find(id); if (!before) return null;
    const was = { liked: !!before.liked, likes: +before.likes || 0 };
    if (was.liked === on) return before;
    each(id, x => { x.liked = on; x.likes = Math.max(0, was.likes + (on ? 1 : -1)); });
    try {
      const r = await call('social_post_like', { p_id: id, p_like: on });
      each(id, x => { x.liked = !!r.liked; x.likes = +r.likes || 0; });
    } catch (e) { each(id, x => { x.liked = was.liked; x.likes = was.likes; }); ctx.toast(t(message(e))); throw e; }
    return find(id);
  }
  async function create(post) {
    const made = await call('social_post_create', { p_kind: post.kind, p_image: post.image, p_thumb: post.thumb, p_caption: post.caption || '', p_audience: post.audience || 'everyone', p_hours: post.kind === 'story' ? +post.hours || DEFAULT_HOURS : null });
    images.set(made.id, post.image);
    if (globalThis.Cloud && Cloud.user) delete state.media[Cloud.user.id];
    state.at = 0; state.archive = null; await refresh(true);
    return made;
  }
  async function update(id, caption, audience) {
    const r = await call('social_post_update', { p_id: id, p_caption: caption, p_audience: audience });
    each(id, x => { x.caption = r.caption; if (r.audience) x.audience = r.audience; }); ctx.changed(); return r;
  }
  async function remove(id) {
    await call('social_post_delete', { p_id: id });
    images.delete(id);
    const drop = list => { if (!list) return list; const i = list.findIndex(x => x.id === id); if (i >= 0) list.splice(i, 1); return list; };
    (state.feed || []).forEach(g => drop(g.items)); if (state.feed) state.feed = state.feed.filter(g => g.items.length);
    drop(state.posts); drop(state.archive);
    Object.values(state.media).forEach(m => { const had = (m.posts || []).some(x => x.id === id); drop(m.posts); drop(m.stories); (m.highlights || []).forEach(h => drop(h.items)); if (had) m.post_count = Math.max(0, (m.post_count || 1) - 1); });
    ctx.changed();
  }
  async function archive() { state.archive = await call('social_story_archive'); return state.archive; }
  async function saveHighlight(id, name, items) {
    const data = await call('social_highlight_save', { p_id: id || null, p_name: name, p_items: items });
    data.at = Date.now(); if (Cloud.user) state.media[Cloud.user.id] = data; ctx.changed(); return data;
  }
  async function deleteHighlight(id) {
    const data = await call('social_highlight_delete', { p_id: id });
    data.at = Date.now(); if (Cloud.user) state.media[Cloud.user.id] = data; ctx.changed(); return data;
  }
  const likers = id => call('social_post_likers', { p_id: id });
  function reset() { state.feed = null; state.posts = null; state.authors = {}; state.media = {}; state.archive = null; state.error = ''; state.at = 0; state.more = true; images.clear(); }
  const ownGroup = () => { const me = globalThis.Cloud && Cloud.user && Cloud.user.id; return (state.feed || []).find(g => g.user && g.user.user_id === me) || null; };

  /* ---------- pictures ---------- */
  // A phone photo becomes a JPEG of at most 1080 px (under ~300 KB) plus a 360 px square thumbnail for grids.
  function shrink(file) {
    return new Promise((ok, fail) => {
      if (!file || !/^image\//.test(file.type || 'image/')) { fail(new Error('image')); return; }
      const U = globalThis.URL, url = U.createObjectURL(file), im = new Image();
      im.onload = () => {
        try {
          const w = im.naturalWidth, h = im.naturalHeight; if (!w || !h) throw new Error('image');
          const draw = (cw, ch, sx, sy, sw, sh, q) => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, cw, ch); x.imageSmoothingQuality = 'high'; x.drawImage(im, sx, sy, sw, sh, 0, 0, cw, ch); return c.toDataURL('image/jpeg', q); };
          let image = '';
          for (const [side, q] of [[1080, .82], [1080, .74], [1080, .66], [900, .68], [720, .66]]) {
            const k = Math.min(1, side / Math.max(w, h)); image = draw(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)), 0, 0, w, h, q);
            if (image.length <= 400000) break;
          }
          const s = Math.min(w, h); let thumb = '';
          for (const [side, q] of [[360, .72], [300, .68], [240, .62]]) { thumb = draw(Math.min(side, s), Math.min(side, s), (w - s) / 2, (h - s) / 2, s, s, q); if (thumb.length <= 38000) break; }
          if (image.length > 410000 || thumb.length > 39000) throw new Error('big');
          ok({ image, thumb, ratio: w / h });
        } catch (e) { fail(e); } finally { U.revokeObjectURL(url); }
      };
      im.onerror = () => { U.revokeObjectURL(url); fail(new Error('image')); };
      im.src = url;
    });
  }

  /* ---------- time labels ---------- */
  function ago(ts, now = Date.now()) {
    const s = Math.max(0, (now - Date.parse(ts)) / 1000);
    if (s < 60) return t('agoNow');
    if (s < 3600) return t('agoMin', Math.floor(s / 60));
    if (s < 86400) return t('agoHour', Math.floor(s / 3600));
    if (s < 7 * 86400) return t('agoDay', Math.floor(s / 86400));
    return ctx.date ? ctx.date(Date.parse(ts)) : new Date(ts).toLocaleDateString();
  }
  function left(ts, now = Date.now()) {
    const s = (Date.parse(ts) - now) / 1000;
    if (!(s > 0)) return t('storyEnded');
    if (s < 3600) return t('storyLeft', t('durMin', Math.max(1, Math.round(s / 60))));
    if (s < 86400 * 2) return t('storyLeft', t('durHour', Math.round(s / 3600)));
    return t('storyLeft', t('durDay', Math.round(s / 86400)));
  }
  const hoursLabel = h => h < 24 ? t('durHour', h) : h === 24 ? t('durHour', 24) : t('durDay', h / 24);

  /* ---------- the like button ---------- */
  function likeHTML(item, action = 'post-like', extra = '') {
    const on = !!item.liked, n = +item.likes || 0;
    return `<button type="button" class="like-btn${on ? ' on' : ''}" data-a="${esc(action)}" data-id="${esc(item.id)}" aria-pressed="${on}" aria-label="${esc(t(on ? 'unlikeItem' : 'likeItem'))}"${extra}><span class="like-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${HEART}"/></svg><span class="like-ring"></span><span class="like-burst">${'<i></i>'.repeat(8)}</span></span><span class="like-count">${n ? compact(n) : ''}</span></button>`;
  }
  const compact = n => Math.round(n).toLocaleString(ctx.lang && ctx.lang() === 'hu' ? 'hu-HU' : 'en-GB');
  // Plays the like animation on a button whose state has just changed, and rolls the counter to the new number.
  function pop(btn, item) {
    if (!btn || !item) return;
    const on = !!item.liked, n = +item.likes || 0, count = btn.querySelector('.like-count'), old = count ? count.textContent : '';
    btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', t(on ? 'unlikeItem' : 'likeItem'));
    const next = n ? compact(n) : '';
    if (ctx.calm()) { if (count) count.textContent = next; return; }
    btn.classList.remove('pop', 'unpop'); void btn.offsetWidth; btn.classList.add(on ? 'pop' : 'unpop');
    setTimeout(() => btn.classList.remove('pop', 'unpop'), 700);
    if (count && old !== next) {
      const was = esc(old || '0'), now = esc(next || '0');
      count.innerHTML = on ? `<span class="like-roll up"><b>${was}</b><b>${now}</b></span>` : `<span class="like-roll down"><b>${now}</b><b>${was}</b></span>`;
      setTimeout(() => { if (count.querySelector('.like-roll')) count.textContent = next; }, 420);
    }
    if (on) ctx.vibrate(12);
  }
  // A large heart over a picture (double-tap to like).
  function burst(host) {
    if (!host || ctx.calm()) return;
    const h = document.createElement('span'); h.className = 'big-heart'; h.setAttribute('aria-hidden', 'true');
    h.innerHTML = `<svg viewBox="0 0 24 24"><path d="${HEART}"/></svg>`; host.appendChild(h);
    setTimeout(() => h.remove(), 950);
  }

  /* ---------- story viewer ---------- */
  let viewer = null, dialog = null, unlock = null, raf = 0;
  const avatarHTML = u => {
    const name = (u && (u.display_name || u.username)) || '?';
    return `<span class="sv-avatar">${u && u.avatar ? `<img src="${esc(u.avatar)}" alt="">` : esc(name.slice(0, 1).toUpperCase())}</span>`;
  };
  function build() {
    dialog = document.createElement('dialog');
    dialog.id = 'story-viewer'; dialog.className = 'story-viewer';
    dialog.innerHTML = `<div class="sv-card"><div class="sv-backdrop"></div><img class="sv-img" alt="" draggable="false"><div class="sv-spin" aria-hidden="true"></div><p class="sv-gone" hidden></p><div class="sv-shade"></div>
      <div class="sv-bars" aria-hidden="true"></div>
      <header class="sv-head"><button type="button" class="sv-person"></button><span class="sv-sp"></span><button type="button" class="sv-btn sv-pause"></button><button type="button" class="sv-btn sv-more" hidden></button><button type="button" class="sv-btn sv-close"></button></header>
      <button type="button" class="sv-zone sv-prev"></button><button type="button" class="sv-zone sv-next"></button>
      <footer class="sv-foot"><p class="sv-caption"></p><div class="sv-actions"></div></footer>
      <div class="sv-menu" hidden></div></div>`;
    document.body.appendChild(dialog);
    const card = dialog.querySelector('.sv-card');
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dialog.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !viewer) return;
      if (b.classList.contains('sv-close')) close();
      else if (b.classList.contains('sv-prev')) step(-1);
      else if (b.classList.contains('sv-next')) step(1);
      else if (b.classList.contains('sv-pause')) { viewer.held = !viewer.held; paint(); }
      else if (b.classList.contains('sv-more')) menu(!viewer.menu);
      else if (b.classList.contains('sv-person')) { const id = cur().owner || group().user.user_id; close(() => ctx.profile && ctx.profile(id)); }
      else if (b.dataset.svLike != null) toggleLike(b);
      else if (b.dataset.sv) act(b.dataset.sv, b);
    });
    dialog.addEventListener('keydown', e => {
      if (!viewer || e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); viewer.held = !viewer.held; paint(); }
    });
    // Hold to pause, swipe down to close, swipe sideways to change person.
    let start = null;
    card.addEventListener('pointerdown', e => {
      if (!viewer || e.button > 0 || e.target.closest('.sv-head button,.sv-foot button,.sv-menu')) return;
      start = { x: e.clientX, y: e.clientY, at: performance.now(), id: e.pointerId, moved: false };
      viewer.press = setTimeout(() => { if (start) { viewer.pressed = true; paint(); } }, 180);
    });
    card.addEventListener('pointermove', e => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!start.moved && Math.hypot(dx, dy) > 10) { start.moved = true; clearTimeout(viewer.press); viewer.pressed = true; }
      if (start.moved && dy > 0 && Math.abs(dy) > Math.abs(dx) && !ctx.calm()) { card.style.transform = `translateY(${dy}px) scale(${Math.max(.82, 1 - dy / 1200)})`; card.style.transition = 'none'; dialog.style.setProperty('--sv-fade', Math.max(.2, 1 - dy / 500)); }
    });
    const end = e => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y, s = start; start = null;
      clearTimeout(viewer && viewer.press); if (!viewer) return;
      const wasHold = viewer.pressed && !s.moved && performance.now() - s.at > 260;
      viewer.pressed = false;
      card.style.transition = ''; card.style.transform = ''; dialog.style.removeProperty('--sv-fade');
      if (s.moved && dy > 90 && Math.abs(dy) > Math.abs(dx)) { close(); return; }
      if (s.moved && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { jump(dx < 0 ? 1 : -1); return; }
      paint();
      const zone = e.type === 'pointerup' && !s.moved && !wasHold && e.target.closest('.sv-zone');
      if (zone) step(zone.classList.contains('sv-prev') ? -1 : 1);
    };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
    // Pointer taps on the zones are handled on pointerup (so a hold or a swipe does not also step); keyboard presses arrive as clicks.
    card.addEventListener('click', e => { if (e.detail && e.target.closest('.sv-zone')) e.stopPropagation(); }, true);
    document.addEventListener('visibilitychange', () => { if (viewer) { viewer.hidden = document.hidden; paint(); } });
  }
  const group = () => viewer.groups[viewer.g];
  const cur = () => group().items[viewer.i];
  function labels() {
    const q = s => dialog.querySelector(s);
    q('.sv-close').setAttribute('aria-label', t('close')); q('.sv-close').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    q('.sv-prev').setAttribute('aria-label', t('storyPrev')); q('.sv-next').setAttribute('aria-label', t('storyNext'));
    q('.sv-more').setAttribute('aria-label', t('moreOptions')); q('.sv-more').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  }
  function open(groups, g = 0, i = 0, origin = null, opts = {}) {
    groups = (groups || []).filter(x => x && x.items && x.items.length);
    if (!groups.length) return;
    if (!dialog) build();
    if (viewer) stopLoop();
    g = Math.max(0, Math.min(groups.length - 1, g));
    if (opts.unseen) { const k = groups[g].items.findIndex(x => !isSeen(x)); i = k >= 0 ? k : 0; }
    viewer = { groups, g, i: Math.max(0, Math.min(groups[g].items.length - 1, i)), elapsed: 0, held: false, pressed: false, menu: false, hidden: document.hidden, origin, opts, token: 0 };
    labels();
    dialog.setAttribute('aria-label', t('storiesTitle'));
    const card = dialog.querySelector('.sv-card');
    card.classList.remove('sv-closing'); dialog.classList.remove('closing');
    if (!dialog.open) {
      unlock = globalThis.ModalLock ? ModalLock.acquire(dialog) : null;
      try { dialog.showModal(); } catch (e) { if (unlock) unlock(); unlock = null; viewer = null; return; }
    }
    if (!ctx.calm()) {
      const r = origin && origin.isConnected ? origin.getBoundingClientRect() : null, box = card.getBoundingClientRect();
      if (r && r.width) {
        card.style.setProperty('--sv-ox', (r.left + r.width / 2 - (box.left + box.width / 2)) + 'px');
        card.style.setProperty('--sv-oy', (r.top + r.height / 2 - (box.top + box.height / 2)) + 'px');
        card.style.setProperty('--sv-os', Math.max(.05, r.width / box.width));
      } else { card.style.setProperty('--sv-ox', '0px'); card.style.setProperty('--sv-oy', '40px'); card.style.setProperty('--sv-os', '.9'); }
      card.classList.remove('sv-opening'); void card.offsetWidth; card.classList.add('sv-opening');
      setTimeout(() => card.classList.remove('sv-opening'), 420);
    }
    show();
    dialog.querySelector('.sv-close').focus({ preventScroll: true });
    loop();
  }
  function show(dir) {
    const g = group(), item = cur(), card = dialog.querySelector('.sv-card'), own = !!g.own || (globalThis.Cloud && Cloud.user && item.owner === Cloud.user.id);
    viewer.elapsed = 0; viewer.menu = false; viewer.loaded = false; const token = ++viewer.token;
    dialog.querySelector('.sv-bars').innerHTML = g.items.map((x, k) => `<span><i style="transform:scaleX(${k < viewer.i ? 1 : 0})"></i></span>`).join('');
    const name = (g.user && (g.user.display_name || g.user.username)) || '';
    dialog.querySelector('.sv-person').innerHTML = `${avatarHTML(g.user)}<span><b>${esc(name)}</b><small>${esc(g.highlight ? g.highlight.name + ' · ' + ago(item.created_at) : own && item.expires_at && Date.parse(item.expires_at) > Date.now() ? ago(item.created_at) + ' · ' + left(item.expires_at) : ago(item.created_at))}</small></span>`;
    dialog.querySelector('.sv-person').setAttribute('aria-label', t('openProfileOf', name));
    dialog.querySelector('.sv-more').hidden = !own;
    const cap = dialog.querySelector('.sv-caption'); cap.textContent = item.caption || ''; cap.hidden = !item.caption;
    dialog.querySelector('.sv-actions').innerHTML = (own ? `<span class="sv-audience">${esc(t('audience_' + (item.audience || 'everyone')))}</span>` : '') + likeHTML(item, 'sv-like', ' data-sv-like=""');
    dialog.querySelector('.sv-menu').hidden = true;
    const img = dialog.querySelector('.sv-img'), back = dialog.querySelector('.sv-backdrop'), gone = dialog.querySelector('.sv-gone');
    img.classList.remove('in'); img.removeAttribute('src'); back.style.backgroundImage = ''; gone.hidden = true;
    dialog.querySelector('.sv-spin').hidden = false;
    if (dir && !ctx.calm()) { card.classList.remove('sv-next-in', 'sv-prev-in'); void card.offsetWidth; card.classList.add(dir > 0 ? 'sv-next-in' : 'sv-prev-in'); setTimeout(() => card.classList.remove('sv-next-in', 'sv-prev-in'), 360); }
    markSeen(item);
    const ids = [item.id, ...g.items.slice(viewer.i + 1, viewer.i + 3).map(x => x.id)];
    const next = viewer.groups[viewer.g + 1]; if (next) ids.push(next.items[0].id);
    fetchImages(ids).then(([src]) => {
      if (!viewer || viewer.token !== token) return;
      dialog.querySelector('.sv-spin').hidden = true;
      if (!src) { gone.textContent = t('postGone'); gone.hidden = false; viewer.loaded = true; viewer.elapsed = STORY_MS - 1500; return; }
      img.onload = () => { if (viewer && viewer.token === token) { img.classList.add('in'); viewer.loaded = true; } };
      img.src = src; back.style.backgroundImage = `url("${src}")`;
      // Preload the next pictures so stepping forward is instant.
      ids.slice(1).forEach(id => { const s = images.get(id); if (s) { const p = new Image(); p.src = s; } });
    }).catch(() => { if (viewer && viewer.token === token) { dialog.querySelector('.sv-spin').hidden = true; gone.textContent = t('socialOffline'); gone.hidden = false; viewer.loaded = true; } });
    paint();
  }
  const duration = () => STORY_MS + (cur().caption ? CAPTION_MS : 0);
  function paint() {
    if (!viewer || !dialog) return;
    const paused = viewer.held || viewer.pressed || viewer.menu || viewer.hidden;
    dialog.classList.toggle('sv-paused', paused);
    const b = dialog.querySelector('.sv-pause');
    b.setAttribute('aria-label', t(viewer.held ? 'storyPlay' : 'storyPause'));
    b.innerHTML = viewer.held ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  }
  function loop() {
    let last = performance.now();
    const frame = now => {
      if (!viewer) return;
      const dt = Math.min(100, now - last); last = now;
      const paused = viewer.held || viewer.pressed || viewer.menu || viewer.hidden || !viewer.loaded;
      if (!paused) viewer.elapsed += dt;
      const bar = dialog.querySelectorAll('.sv-bars i')[viewer.i];
      if (bar) bar.style.transform = `scaleX(${Math.min(1, viewer.elapsed / duration())})`;
      if (viewer.elapsed >= duration()) { step(1); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  const stopLoop = () => { cancelAnimationFrame(raf); raf = 0; };
  function step(d) {
    if (!viewer) return;
    const g = group();
    if (d > 0 && viewer.i < g.items.length - 1) { viewer.i++; show(); return; }
    if (d < 0 && viewer.i > 0) { viewer.i--; show(); return; }
    if (d < 0 && viewer.g === 0) { viewer.elapsed = 0; show(); return; }
    jump(d);
  }
  function jump(d) {
    if (!viewer) return;
    const g = viewer.g + d;
    if (g < 0) { viewer.i = 0; show(); return; }
    if (g >= viewer.groups.length) { close(); return; }
    viewer.g = g; const items = group().items, k = items.findIndex(x => !isSeen(x));
    viewer.i = d > 0 ? (k >= 0 ? k : 0) : 0;
    show(d);
  }
  function close(after) {
    if (!viewer || !dialog) return;
    const card = dialog.querySelector('.sv-card'), origin = viewer.origin;
    const finish = () => {
      stopLoop(); viewer = null; card.classList.remove('sv-closing'); dialog.classList.remove('closing');
      if (dialog.open) dialog.close(); if (unlock) { unlock(); unlock = null; }
      ctx.changed(); if (typeof after === 'function') after();
    };
    if (ctx.calm()) { finish(); return; }
    const r = origin && origin.isConnected ? origin.getBoundingClientRect() : null, box = card.getBoundingClientRect();
    if (r && r.width && r.bottom > 0 && r.top < innerHeight) {
      card.style.setProperty('--sv-ox', (r.left + r.width / 2 - (box.left + box.width / 2)) + 'px');
      card.style.setProperty('--sv-oy', (r.top + r.height / 2 - (box.top + box.height / 2)) + 'px');
      card.style.setProperty('--sv-os', Math.max(.05, r.width / box.width));
    } else { card.style.setProperty('--sv-ox', '0px'); card.style.setProperty('--sv-oy', '60px'); card.style.setProperty('--sv-os', '.9'); }
    viewer.menu = true; card.classList.add('sv-closing'); dialog.classList.add('closing');
    setTimeout(finish, 260);
  }
  async function toggleLike(btn) {
    if (!viewer) return;
    const item = cur(), on = !item.liked;
    const local = { liked: on, likes: Math.max(0, (+item.likes || 0) + (on ? 1 : -1)) };
    pop(btn, local);
    try { await like(item.id, on); } catch (e) { pop(btn, item); return; }
    if (viewer && cur() === item) { const b = dialog.querySelector('[data-sv-like]'); const c = b && b.querySelector('.like-count'); if (c && !c.querySelector('.like-roll')) c.textContent = item.likes ? compact(item.likes) : ''; }
  }
  function menu(on) {
    if (!viewer) return;
    viewer.menu = on; const m = dialog.querySelector('.sv-menu'), item = cur(), g = group();
    if (!on) { m.hidden = true; paint(); return; }
    m.innerHTML = `${+item.likes ? `<button type="button" data-sv="likers">${esc(t('likedByCount', compact(+item.likes)))}</button>` : ''}<button type="button" data-sv="highlight">${esc(t('addToHighlight'))}</button>${g.highlight ? `<button type="button" data-sv="edithighlight">${esc(t('editHighlight'))}</button><button type="button" data-sv="unhighlight">${esc(t('removeFromHighlight'))}</button>` : ''}<button type="button" data-sv="delete" class="danger">${esc(t('deleteStory'))}</button><button type="button" data-sv="cancel">${esc(t('cancel'))}</button>`;
    m.hidden = false; m.querySelector('button').focus({ preventScroll: true }); paint();
  }
  async function act(kind, btn) {
    const item = cur(), g = group();
    if (kind === 'cancel') { menu(false); return; }
    if (kind === 'likers') { close(() => ctx.likers && ctx.likers(item.id)); return; }
    if (kind === 'highlight') { close(() => ctx.highlight && ctx.highlight(item.id)); return; }
    if (kind === 'edithighlight') { close(() => ctx.editHighlight && ctx.editHighlight(g.highlight.id)); return; }
    if (kind === 'unhighlight') {
      const h = g.highlight; btn.disabled = true;
      try { await saveHighlight(h.id, h.name, g.items.filter(x => x.id !== item.id).map(x => x.id)); g.items.splice(viewer.i, 1); }
      catch (e) { ctx.toast(t(message(e))); btn.disabled = false; return; }
      if (!g.items.length) { close(); return; } viewer.i = Math.min(viewer.i, g.items.length - 1); show(); return;
    }
    if (kind === 'delete') {
      if (btn.dataset.confirm !== '1') { btn.dataset.confirm = '1'; btn.textContent = t('tapAgainDelete'); return; }
      btn.disabled = true;
      try { await remove(item.id); } catch (e) { ctx.toast(t(message(e))); btn.disabled = false; return; }
      ctx.toast(t('storyDeleted'));
      if (g.items[viewer.i] === item) g.items.splice(viewer.i, 1);
      if (!g.items.length) { viewer.groups.splice(viewer.g, 1); if (!viewer.groups.length) { close(); return; } viewer.g = Math.min(viewer.g, viewer.groups.length - 1); viewer.i = 0; }
      else viewer.i = Math.min(viewer.i, g.items.length - 1);
      show();
    }
  }
  const isOpen = () => !!viewer;

  function init(c) { ctx = Object.assign(ctx, c); }
  return { DURATIONS, DEFAULT_HOURS, AUDIENCES, HEART, state, init, refresh, more, user, fetchImages, imageOf, like, create, update, remove, archive, saveHighlight, deleteHighlight, likers, reset, ownGroup, find,
    shrink, ago, left, hoursLabel, likeHTML, pop, burst, open, close, isOpen, isSeen, groupSeen, markSeen, message };
})();
