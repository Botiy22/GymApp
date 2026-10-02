(function () {
  'use strict';
  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const D = () => Store.d;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = () => D().settings.lang || ((navigator.language || 'en').toLowerCase().startsWith('hu') ? 'hu' : 'en');
  const t = (k, ...a) => { const d = I18N[L()], s = d[k] != null ? d[k] : (I18N.en[k] != null ? I18N.en[k] : k); return a.length ? s.replace(/\{(\d)\}/g, (m, i) => a[+i]) : s; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const today = () => ymd(Date.now());
  const fmtDate = (d, long) => new Date(d).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', long ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' });
  const fmtDur = ms => { const m = Math.round(ms / 60000); return m >= 60 ? Math.floor(m / 60) + ' ' + t('h') + ' ' + (m % 60) + ' ' + t('min') : m + ' ' + t('min'); };
  const clock = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + pad(s % 60); };
  const compact = n => Math.round(n).toLocaleString(L() === 'hu' ? 'hu-HU' : 'en-GB');
  const weekStart = d => { d = new Date(d); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
  const e1rm = (kg, reps) => kg > 0 && reps > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0;
  const r1 = n => Math.round(n * 10) / 10;

  const EX = {}; window.EXERCISES.forEach(e => { EX[e.id] = e; });
  const PLAN_BY_EX = {}; const HU_NAME = {};
  window.PLAN.items.forEach(i => { if (!PLAN_BY_EX[i.ex]) PLAN_BY_EX[i.ex] = i; if (!i.similar && i.reps !== '21') HU_NAME[i.ex] = i.hu; });
  const img = (id, f) => 'img/ex/' + encodeURIComponent(id) + '/' + (f || 0) + '.jpg';
  const exName = id => { const e = EX[id]; if (!e) return id; return L() === 'hu' && HU_NAME[id] ? HU_NAME[id] : e.n; };
  const itemName = it => (it.label && it.label[L()]) || exName(it.ex);
  const rName = r => typeof r.name === 'string' ? r.name : (r.name[L()] || r.name.en || r.name.hu);
  const mus = m => (I18N[L()].mus || {})[m] || m;
  const eqp = m => (I18N[L()].eq || {})[m] || m;

  const ui = { day: today(), tab: 'home', lib: { q: '', mus: '', limit: 40 }, pick: { q: '', mus: '', limit: 40 }, prog: 'overview', foodDate: today(), wOpen: false, sheets: [], ai: null };

  /* ---------- icons ---------- */
  const IC = {
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6A7.6 7.6 0 0 0 6.900 6.600l-2.300-1-2 3.400 2 1.500a7.600 7.600 0 0 0 0 3l-2 1.500 2 3.400 2.300-1a7.600 7.600 0 0 0 2.600 1.500l.5 2.600h4l.5-2.600a7.600 7.600 0 0 0 2.600-1.500l2.300 1 2-3.400z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 10v4M6.500 6.500v11M17.500 6.500v11M21 10v4M6.500 12h11"/></svg>',
    lib: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.500"/><path d="M16 16l5 5"/></svg>',
    prog: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    food: '<svg viewBox="0 0 24 24"><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 1-3 4-3 7 0 2 1 3 3 3v8"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3.500l1.500-2.500h6L16.500 8H20v11H4z"/><circle cx="12" cy="13.500" r="3.200"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.500 4.500l3 3L8 19z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 10l6 6 6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- history / stats ---------- */
  let hIdx = null, hRef = null, hLen = -1;
  function exHistory(id) {
    const ws = D().workouts;
    if (hRef !== ws || hLen !== ws.length) {
      hIdx = {}; hRef = ws; hLen = ws.length;
      ws.forEach(w => w.entries.forEach(e => { if (e.sets.length) (hIdx[e.ex] = hIdx[e.ex] || []).push({ d: w.start, sets: e.sets, wid: w.id }); }));
    }
    return hIdx[id] || [];
  }
  const bestOf = sets => sets.filter(s => !s.w).reduce((m, s) => Math.max(m, e1rm(s.kg, s.reps)), 0);
  const volOf = w => w.entries.reduce((a, e) => a + e.sets.filter(s => !s.w).reduce((b, s) => b + s.kg * s.reps, 0), 0);
  const setsOf = w => w.entries.reduce((a, e) => a + e.sets.filter(s => !s.w).length, 0);
  function weekWorkouts() { const ws = weekStart(Date.now()).getTime(); return D().workouts.filter(w => w.start >= ws); }
  function muscleSets(ws) {
    const m = {};
    ws.forEach(w => w.entries.forEach(e => { const x = EX[e.ex]; if (!x) return; const n = e.sets.filter(s => !s.w).length;
      x.p.forEach(k => { m[k] = (m[k] || 0) + n; }); x.s.forEach(k => { m[k] = (m[k] || 0) + n * 0.5; }); }));
    return m;
  }
  function nextRoutine() {
    const rs = D().routines; if (!rs.length) return null;
    const ws = D().workouts; for (let i = ws.length - 1; i >= 0; i--) { const k = rs.findIndex(r => r.id === ws[i].rid); if (k >= 0) return rs[(k + 1) % rs.length]; }
    return rs[0];
  }
  const estMin = r => Math.round(r.items.reduce((a, i) => a + i.sets * ((i.rest || 90) + 45), 0) / 60 / 5) * 5;
  const repTop = reps => { const m = String(reps).match(/(\d+)\s*$/); return m ? +m[1] : 0; };

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    if (Store.failed) msg = t('saveFailed');
    const el = $('#toast'); el.textContent = msg; clearTimeout(toastT);
    if (el.showPopover) { try { el.hidePopover(); } catch (e) {} try { el.showPopover(); } catch (e) {} }
    requestAnimationFrame(() => el.classList.add('on'));
    toastT = setTimeout(() => { el.classList.remove('on'); setTimeout(() => { if (el.hidePopover && !el.classList.contains('on')) { try { el.hidePopover(); } catch (e) {} } }, 300); }, 2600);
  }

  /* ================= VIEWS ================= */
  const head = (title, sub) => `<header class="top"><div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div><button class="icon-btn" data-a="settings" aria-label="${esc(t('settings'))}">${IC.gear}</button></header>`;
  const thumbs = (items, n) => `<span class="thumbs">${items.slice(0, n).map(i => `<img src="${img(i.ex)}" alt="" loading="lazy">`).join('')}</span>`;

  function vHome() {
    const d = D(), nx = nextRoutine(), wk = weekWorkouts();
    const days = [0, 1, 2, 3, 4, 5, 6].map(i => { const dt = new Date(weekStart(Date.now())); dt.setDate(dt.getDate() + i); return dt; });
    const done = new Set(wk.map(w => ymd(w.start)));
    let h = head(t('appName'), fmtDate(Date.now(), true));
    if (isIOS && !standalone) h += `<div class="note" data-a="install-help"><b>${esc(t('installTitle'))}</b><span>${esc(t('installShort'))}</span></div>`;
    if (Store.memoryOnly) h += `<div class="note warn"><b>${esc(t('noStorage'))}</b></div>`;
    if (Store.failed) h += `<div class="note warn"><b>${esc(t('saveFailed'))}</b></div>`;
    if (!window.HTMLDialogElement) h += `<div class="note warn"><b>${esc(t('oldIOS'))}</b></div>`;
    h += `<div class="week">${days.map(dt => `<span class="${done.has(ymd(dt)) ? 'on' : ''}${ymd(dt) === today() ? ' now' : ''}"><i>${dt.toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'narrow' })}</i><b>${done.has(ymd(dt)) ? IC.check : dt.getDate()}</b></span>`).join('')}</div>`;
    if (d.active) {
      h += `<button class="hero resume" data-a="w-open"><small>${esc(t('inProgress'))}</small><strong>${esc(d.active.name)}</strong><span>${esc(t('tapResume'))}</span></button>`;
    } else if (nx) {
      h += `<div class="hero"><small>${esc(t('nextUp'))}</small><strong>${esc(rName(nx))}</strong><span>${nx.sub ? esc(nx.sub[L()]) + ' · ' : ''}${nx.items.length} ${esc(t('exercises'))} · ~${estMin(nx)} ${esc(t('min'))}</span>
        <button class="btn primary big" data-a="w-start" data-id="${esc(nx.id)}">${esc(t('startWorkout'))}</button></div>`;
    }
    h += `<h2>${esc(t('routines'))}</h2><div class="rlist">` + d.routines.map(r =>
      `<button class="rcard" data-a="r-open" data-id="${esc(r.id)}">${thumbs(r.items, 3)}<span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(t('exercises'))} · ~${estMin(r)} ${esc(t('min'))}</i></span>${IC.chev}</button>`).join('') + `</div>`;
    h += `<div class="row2"><button class="btn" data-a="w-empty">${esc(t('emptyWorkout'))}</button><button class="btn" data-a="r-new">${IC.plus}${esc(t('newRoutine'))}</button></div>`;
    return h;
  }

  function libFilter(st) {
    const q = st.q.trim().toLowerCase().split(/\s+/).filter(Boolean), m = st.mus;
    let list = window.EXERCISES.filter(e => (!m || e.p.includes(m)) && q.every(w => e.n.toLowerCase().includes(w) || (HU_NAME[e.id] || '').toLowerCase().includes(w)));
    return list.sort((a, b) => (PLAN_BY_EX[b.id] ? 1 : 0) - (PLAN_BY_EX[a.id] ? 1 : 0) || a.n.localeCompare(b.n));
  }
  function libRows(pick) {
    const st = pick ? ui.pick : ui.lib, list = libFilter(st);
    if (!list.length) return `<p class="empty">${esc(t('noResults'))}</p>`;
    return list.slice(0, st.limit).map(e =>
      `<button class="exrow" data-a="${pick ? 'pick' : 'ex-open'}" data-id="${esc(e.id)}"><img src="${img(e.id)}" alt="" loading="lazy"><span><b>${esc(exName(e.id))}</b><i>${esc(e.p.map(mus).join(', '))} · ${esc(eqp(e.eq))}</i></span>${pick ? IC.plus : IC.chev}</button>`).join('') +
      (list.length > st.limit ? `<button class="btn ghost" data-a="lib-more">${esc(t('showMore'))} (${list.length - st.limit})</button>` : '');
  }
  const MUS_ORDER = ['chest', 'lats', 'middle back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abdominals', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'traps', 'lower back', 'adductors', 'abductors', 'neck'];
  function libControls(pick) {
    const st = pick ? ui.pick : ui.lib;
    return `<div class="search"><input type="search" data-in="lib-q" value="${esc(st.q)}" placeholder="${esc(t('searchEx'))}" autocomplete="off" autocapitalize="off" enterkeyhint="search" aria-label="${esc(t('searchEx'))}"></div>
      <div class="chips scroll"><button class="chip${!st.mus ? ' on' : ''}" data-a="lib-mus" data-m="">${esc(t('all'))}</button>${MUS_ORDER.map(m => `<button class="chip${st.mus === m ? ' on' : ''}" data-a="lib-mus" data-m="${m}">${esc(mus(m))}</button>`).join('')}</div>`;
  }
  function vLib() { return head(t('tabLib'), window.EXERCISES.length + ' ' + t('exercises')) + libControls() + `<div id="lib-list" class="exlist">${libRows(false)}</div>`; }

  function vProg() {
    const d = D();
    let h = head(t('tabProg')) + `<div class="seg"><button class="${ui.prog === 'overview' ? 'on' : ''}" data-a="prog" data-v="overview">${esc(t('overview'))}</button><button class="${ui.prog === 'history' ? 'on' : ''}" data-a="prog" data-v="history">${esc(t('history'))} (${d.workouts.length})</button></div>`;
    if (ui.prog === 'history') {
      if (!d.workouts.length) return h + `<p class="empty">${esc(t('noWorkouts'))}</p>`;
      let last = '';
      const all = d.workouts.slice().reverse(), lim = ui.histLimit || 60;
      return h + all.slice(0, lim).map(w => {
        const mo = new Date(w.start).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: 'long' });
        const hd = mo !== last ? `<h3 class="month">${esc(mo)}</h3>` : ''; last = mo;
        return hd + `<button class="wrow" data-a="wk-open" data-id="${esc(w.id)}"><span class="wr-d"><b>${new Date(w.start).getDate()}</b><i>${esc(new Date(w.start).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'short' }))}</i></span><span class="wr-t"><b>${esc(w.name)}</b><i>${fmtDur(w.end - w.start)} · ${setsOf(w)} ${esc(t('setsWord'))} · ${compact(volOf(w))} kg</i></span>${IC.chev}</button>`;
      }).join('') + (all.length > lim ? `<button class="btn ghost" data-a="hist-more">${esc(t('showMore'))} (${all.length - lim})</button>` : '');
    }
    const wk = weekWorkouts(), ms = muscleSets(wk);
    h += `<div class="kpis"><div><b>${wk.length}</b><i>${esc(t('thisWeek'))}</i></div><div><b>${compact(wk.reduce((a, w) => a + volOf(w), 0))}</b><i>${esc(t('volWeek'))}</i></div><div><b>${d.workouts.length}</b><i>${esc(t('totalWorkouts'))}</i></div></div>`;
    const rows = MUS_ORDER.filter(m => ms[m]).map(m => ({ label: mus(m), value: ms[m], text: r1(ms[m]) }));
    h += `<section class="card"><h2>${esc(t('setsPerMuscle'))}</h2>${rows.length ? Charts.bars(rows, { max: 24, band: [10, 20] }) + `<p class="cap"><i class="band-key"></i>${esc(t('setsCap'))}</p>` : `<p class="empty">${esc(t('setsEmpty'))}</p>`}</section>`;
    const bw = d.body.slice().sort((a, b) => a.d < b.d ? -1 : 1);
    h += `<section class="card"><h2>${esc(t('bodyweight'))}</h2>${bw.length ? `<p class="bignum">${bw[bw.length - 1].kg} <small>kg</small>${bw.length > 1 ? `<span class="delta">${(bw[bw.length - 1].kg - bw[0].kg > 0 ? '+' : '') + r1(bw[bw.length - 1].kg - bw[0].kg)} kg ${esc(t('since'))} ${esc(fmtDate(bw[0].d))}</span>` : ''}</p>` : ''}
      ${bw.length > 1 ? Charts.line(bw.slice(-30).map(b => ({ x: fmtDate(b.d), y: b.kg })), { unit: ' kg' }) : ''}
      <form class="inline" data-f="bw"><label class="sr" for="bw-in">${esc(t('bodyweight'))}</label><input id="bw-in" type="text" inputmode="decimal" name="kg" placeholder="${esc(t('todayKg'))}" autocomplete="off"><button class="btn primary">${esc(t('save'))}</button></form></section>`;
    const best = {}; d.workouts.forEach(w => w.entries.forEach(e => { const v = bestOf(e.sets); if (v > 0 && (!best[e.ex] || v > best[e.ex].b)) best[e.ex] = { id: e.ex, b: v, bd: w.start }; }));
    const prs = Object.values(best).filter(p => EX[p.id]).sort((a, b) => b.b - a.b).slice(0, 8);
    h += `<section class="card"><h2>${esc(t('records'))}</h2>${prs.length ? prs.map(p => `<button class="prrow" data-a="ex-open" data-id="${esc(p.id)}"><span><b>${esc(exName(p.id))}</b><i>${esc(fmtDate(p.bd))}</i></span><strong>${r1(p.b)} <small>kg</small></strong></button>`).join('') + `<p class="cap">${esc(t('e1rmCap'))}</p>` : `<p class="empty">${esc(t('recordsEmpty'))}</p>`}</section>`;
    return h;
  }

  function dayFood() { return D().food[ui.foodDate] || []; }
  function vFood() {
    const d = D(), tg = d.settings.targets, list = dayFood();
    const sum = list.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    let h = head(t('tabFood')) + `<div class="datenav"><button class="icon-btn" data-a="food-day" data-d="-1" aria-label="${esc(t('prevDay'))}">${IC.back}</button><b>${ui.foodDate === today() ? esc(t('today')) : esc(fmtDate(ui.foodDate + 'T12:00', true))}</b><button class="icon-btn flip" data-a="food-day" data-d="1" aria-label="${esc(t('nextDay'))}" ${ui.foodDate >= today() ? 'disabled' : ''}>${IC.back}</button></div>`;
    if (!tg) h += `<button class="note" data-a="targets"><b>${esc(t('setTargets'))}</b><span>${esc(t('setTargetsSub'))}</span></button>`;
    h += `<section class="card cal"><p class="bignum">${Math.round(sum.kcal)}<small> ${tg ? '/ ' + tg.kcal : ''} kcal</small></p>${tg ? Charts.meter(sum.kcal, tg.kcal) + `<p class="cap">${sum.kcal <= tg.kcal ? esc(t('remaining', Math.round(tg.kcal - sum.kcal))) : esc(t('over', Math.round(sum.kcal - tg.kcal)))}</p>` : ''}
      <div class="macros">${[['p', t('protein')], ['c', t('carbs')], ['f', t('fat')]].map(([k, n]) => `<div><span>${esc(n)}</span><b>${Math.round(sum[k])}${tg ? ' / ' + tg[k] : ''} g</b>${tg ? Charts.meter(sum[k], tg[k], 'thin') : ''}</div>`).join('')}</div>
      ${tg ? `<button class="link" data-a="targets">${esc(t('editTargets'))}</button>` : ''}</section>`;
    h += `<div class="row3"><button class="btn primary" data-a="food-ai" data-m="photo">${IC.cam}${esc(t('scanPhoto'))}</button><button class="btn" data-a="food-ai" data-m="text">${IC.pen}${esc(t('describe'))}</button><button class="btn" data-a="food-manual">${IC.plus}${esc(t('manual'))}</button></div>`;
    h += `<h2>${esc(t('meals'))}</h2>` + (list.length ? `<div class="flist">` + list.map(f => `<div class="frow"><span><b>${esc(f.name)}</b><i>${f.g ? f.g + ' g · ' : ''}${esc(t('pShort'))} ${Math.round(f.p)} · ${esc(t('cShort'))} ${Math.round(f.c)} · ${esc(t('fShort'))} ${Math.round(f.f)}${f.src === 'ai' ? ' · AI' : ''}</i></span><strong>${Math.round(f.kcal)}</strong><button class="icon-btn sm" data-a="food-del" data-id="${esc(f.id)}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>`).join('') + `</div>` : `<p class="empty">${esc(t('noMeals'))}</p>`);
    return h;
  }
  const VIEWS = { home: vHome, lib: vLib, prog: vProg, food: vFood };

  function render() {
    document.documentElement.lang = L();
    const y = ui.keepScroll ? window.scrollY : 0; ui.keepScroll = false;
    $('#view').innerHTML = VIEWS[ui.tab]();
    $$('#tabbar button').forEach(b => { b.classList.toggle('on', b.dataset.tab === ui.tab); b.querySelector('span').textContent = t('tab' + b.dataset.tab[0].toUpperCase() + b.dataset.tab.slice(1)); b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'); });
    window.scrollTo(0, y);
    renderWorkout();
  }
  const rerender = () => { ui.keepScroll = true; render(); };

  /* ================= SHEETS (bottom dialogs, stacked) ================= */
  const dlg = () => $('#sheet');
  function drawSheet() {
    const fn = ui.sheets[ui.sheets.length - 1]; if (!fn) return;
    const s = fn(), d = dlg(), old = $('.sheet-body', d), y = old && ui.sheetKeep ? old.scrollTop : 0; ui.sheetKeep = false;
    d.innerHTML = `<div class="sheet-head">${ui.sheets.length > 1 ? `<button class="icon-btn" data-a="sheet-back" aria-label="${esc(t('back'))}">${IC.back}</button>` : '<span class="sp"></span>'}<h2 id="sheet-title">${esc(s.title)}</h2><button class="icon-btn" data-a="sheet-close" aria-label="${esc(t('close'))}">${IC.close}</button></div><div class="sheet-body">${s.html}</div>${s.foot ? `<div class="sheet-foot">${s.foot}</div>` : ''}`;
    $('.sheet-body', d).scrollTop = y;
  }
  function openSheet(fn) { if (!dlg().showModal) { toast(t('oldIOS')); return; } ui.sheets.push(fn); drawSheet(); if (!dlg().open) dlg().showModal(); }
  function refreshSheet() { ui.sheetKeep = true; drawSheet(); }
  function closeSheet(all) { if (all) ui.sheets = []; else ui.sheets.pop(); if (ui.sheets.length) drawSheet(); else if (dlg().open) dlg().close(); }

  /* ---------- exercise detail ---------- */
  function shEx(id, item) {
    return () => {
      const e = EX[id], pl0 = PLAN_BY_EX[id], special = pl0 && (pl0.similar || pl0.reps === '21'), name = item ? itemName(item) : exName(id);
      const pl = pl0 && (!special || (item && item.label && item.label.hu === pl0.hu)) ? pl0 : null;
      const mm = pl && pl.mm ? pl.mm : MuscleMap.fromLists(e.p, e.s), hst = exHistory(id);
      let best = 0, top = null; hst.forEach(x => x.sets.forEach(s => { if (s.w) return; const v = e1rm(s.kg, s.reps); if (v > best) best = v; if (!top || s.kg > top.kg || (s.kg === top.kg && s.reps > top.reps)) top = s; }));
      const pts = hst.map(x => ({ x: fmtDate(x.d), y: r1(bestOf(x.sets)) })).filter(p => p.y > 0);
      let h = !e.k ? '' : `<div class="anim${e.k < 2 ? ' one' : ''}" data-a="anim"><img src="${img(id, 0)}" alt="${esc(name)}">${e.k > 1 ? `<img class="f2" src="${img(id, 1)}" alt="">` : ''}<span class="anim-tag">${esc(t('tapPause'))}</span></div>`;
      if (pl && pl.similar) h += `<p class="cap">${esc(t('similarPhoto'))}</p>`;
      h += `<p class="en">${name !== e.n ? esc(e.n) : ''}</p><div class="chips">${e.p.map(m => `<span class="chip on">${esc(mus(m))}</span>`).join('')}${e.s.map(m => `<span class="chip">${esc(mus(m))}</span>`).join('')}<span class="chip">${esc(eqp(e.eq))}</span></div>`;
      if (pl && pl.tip) h += `<div class="tip"><b>${esc(t('coachNote'))}</b>${esc(pl.tip[L()])}</div>`;
      h += `<section class="card"><h3>${esc(t('musclesWorked'))}</h3><div class="mm">${MuscleMap.svg(mm[0], mm[1], t('front'), t('backSide'))}</div><p class="cap"><i class="k1"></i>${esc(t('primary'))}<i class="k2"></i>${esc(t('secondary'))}</p></section>`;
      h += `<section class="card"><h3>${esc(t('myStats'))}</h3>` + (hst.length ? `<div class="kpis"><div><b>${best ? r1(best) : '–'}</b><i>${esc(t('est1rm'))}</i></div><div><b>${top ? (top.kg ? top.kg + '×' + top.reps : top.reps) : '–'}</b><i>${esc(t('bestSet'))}</i></div><div><b>${hst.length}</b><i>${esc(t('sessions'))}</i></div></div>${pts.length > 1 ? Charts.line(pts.slice(-20), { unit: ' kg' }) + `<p class="cap">${esc(t('e1rmChart'))}</p>` : ''}
        <div class="lastlist">${hst.slice(-3).reverse().map(x => `<p><i>${esc(fmtDate(x.d))}</i>${x.sets.map(s => `<span>${s.w ? 'W ' : ''}${s.kg ? s.kg + '×' : ''}${s.reps}</span>`).join('')}</p>`).join('')}</div>` : `<p class="empty">${esc(t('noHistoryEx'))}</p>`) + `</section>`;
      h += `<section class="card"><h3>${esc(t('howTo'))}</h3>${L() === 'hu' ? `<p class="cap">${esc(t('enOnly'))}</p>` : ''}<ol class="steps">${e.i.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>`;
      const foot = (D().active ? `<button class="btn primary" data-a="ex-to-workout" data-id="${esc(id)}">${esc(t('addToWorkout'))}</button>` : '') + `<button class="btn" data-a="ex-to-routine" data-id="${esc(id)}">${esc(t('addToRoutine'))}</button>`;
      return { title: name, html: h, foot };
    };
  }
  function shPickRoutine(exId) {
    return () => ({ title: t('addToRoutine'), html: D().routines.map(r => `<button class="rcard" data-a="ex-routine-add" data-id="${esc(r.id)}" data-ex="${esc(exId)}"><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(t('exercises'))}</i></span>${IC.plus}</button>`).join('') });
  }

  /* ---------- routines ---------- */
  const getR = id => D().routines.find(r => r.id === id);
  function shRoutine(id) {
    return () => {
      const r = getR(id); if (!r) return { title: '', html: '' };
      const h = (r.sub ? `<p class="lead">${esc(r.sub[L()])}</p>` : '') + `<p class="cap">${r.items.length} ${esc(t('exercises'))} · ${r.items.reduce((a, i) => a + i.sets, 0)} ${esc(t('setsWord'))} · ~${estMin(r)} ${esc(t('min'))}</p><div class="exlist">` +
        r.items.map((it, i) => `<button class="exrow" data-a="ex-open" data-id="${esc(it.ex)}" data-r="${esc(r.id)}" data-i="${i}"><img src="${img(it.ex)}" alt="" loading="lazy"><span><b>${esc(itemName(it))}</b><i>${it.sets} × ${esc(it.reps)} · ${esc(t('rest'))} ${clock(it.rest)}</i></span>${IC.chev}</button>`).join('') + `</div>`;
      return { title: rName(r), html: h, foot: `<button class="btn primary" data-a="w-start" data-id="${esc(r.id)}">${esc(t('startWorkout'))}</button><button class="btn" data-a="r-edit" data-id="${esc(r.id)}">${esc(t('edit'))}</button>` };
    };
  }
  function shRoutineEdit() {
    return () => {
      const r = ui.edit;
      const h = `<label class="fld"><span>${esc(t('name'))}</span><input type="text" data-in="re-name" value="${esc(rName(r))}" autocomplete="off"></label>
        <div class="re-list">${r.items.map((it, i) => `<div class="re-row"><div class="re-top"><img src="${img(it.ex)}" alt=""><b>${esc(itemName(it))}</b><button class="icon-btn sm" data-a="re-up" data-i="${i}" aria-label="${esc(t('moveUp'))}" ${i ? '' : 'disabled'}>${IC.up}</button><button class="icon-btn sm" data-a="re-down" data-i="${i}" aria-label="${esc(t('moveDown'))}" ${i < r.items.length - 1 ? '' : 'disabled'}>${IC.down}</button><button class="icon-btn sm" data-a="re-del" data-i="${i}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>
          <div class="re-f"><label><span>${esc(t('setsWord'))}</span><input type="text" inputmode="numeric" data-in="re-sets" data-i="${i}" value="${it.sets}"></label><label><span>${esc(t('reps'))}</span><input type="text" data-in="re-reps" data-i="${i}" value="${esc(it.reps)}"></label><label><span>${esc(t('rest'))} (s)</span><input type="text" inputmode="numeric" data-in="re-rest" data-i="${i}" value="${it.rest}"></label></div></div>`).join('')}</div>
        <button class="btn" data-a="re-add">${IC.plus}${esc(t('addExercise'))}</button>${r._old && !r.builtin ? `<button class="btn danger" data-a="r-del">${esc(t('deleteRoutine'))}</button>` : ''}`;
      return { title: r._old ? t('editRoutine') : t('newRoutine'), html: h, foot: `<button class="btn primary" data-a="re-save">${esc(t('save'))}</button>` };
    };
  }
  function shPicker() { return () => ({ title: t('addExercise'), html: libControls(true) + `<div id="pick-list" class="exlist">${libRows(true)}</div>` }); }

  /* ================= ACTIVE WORKOUT ================= */
  function newEntry(it) { return { ex: it.ex, label: it.label || null, target: it.sets || 3, reps: it.reps || '8–12', rest: it.rest || 90, sets: Array.from({ length: it.sets || 3 }, () => ({ kg: '', reps: '', done: false, w: false })) }; }
  function startWorkout(r) {
    if (D().active && !confirm(t('replaceActive'))) return;
    D().active = { id: uid(), rid: r ? r.id : null, name: r ? rName(r) : t('emptyWorkout'), start: Date.now(), entries: r ? r.items.map(newEntry) : [], restEnd: 0, restTotal: 0 };
    Store.save(); ui.wOpen = true; closeSheet(true); wake(); render();
  }
  function hintFor(en, hst) {
    if (!hst.length) return t('firstTime');
    const last = hst[hst.length - 1].sets.filter(s => !s.w), top = repTop(en.reps);
    const txt = last.map(s => (s.kg ? s.kg + '×' : '') + s.reps).join(', ');
    if (top && last.length >= en.target && last.every(s => s.reps >= top) && last[0].kg > 0) return t('hintUp', txt, top);
    return t('hintLast', txt);
  }
  function renderWorkout() {
    const el = $('#workout'), a = D().active, on = !!a && ui.wOpen;
    document.body.classList.toggle('w-on', on);
    if (!on) { el.hidden = true; el.innerHTML = ''; tick(); return; }
    const old = $('.w-body', el), y = old ? old.scrollTop : 0;
    el.hidden = false;
    el.innerHTML = `<header class="w-head"><button class="icon-btn" data-a="w-min" aria-label="${esc(t('minimize'))}">${IC.down}</button><div><b>${esc(a.name)}</b><i id="w-el">0:00</i></div><button class="btn primary" data-a="w-finish">${esc(t('finish'))}</button></header>
      <div class="w-body">${a.entries.map((en, i) => {
        const hst = exHistory(en.ex), prev = hst.length ? hst[hst.length - 1].sets : [];
        return `<section class="wex"><div class="wex-h"><button class="wex-img" data-a="ex-open" data-id="${esc(en.ex)}" data-w="${i}" aria-label="${esc(t('details'))}"><img src="${img(en.ex)}" alt=""></button><div><b>${esc(itemName(en))}</b><i>${en.target} × ${esc(en.reps)} · ${esc(t('rest'))} ${clock(en.rest)}</i></div><button class="icon-btn sm" data-a="w-tools" data-i="${i}" aria-label="${esc(t('more'))}">⋯</button></div>
          ${ui.wTools === i ? `<div class="wex-tools"><button class="btn sm" data-a="w-up" data-i="${i}" ${i ? '' : 'disabled'}>${IC.up}${esc(t('moveUp'))}</button><button class="btn sm" data-a="w-down" data-i="${i}" ${i < a.entries.length - 1 ? '' : 'disabled'}>${IC.down}${esc(t('moveDown'))}</button><button class="btn sm danger" data-a="w-delex" data-i="${i}">${esc(t('remove'))}</button></div>` : ''}
          <p class="hint">${esc(hintFor(en, hst))}</p>
          <div class="sets"><div class="set set-hd"><span>#</span><span>${esc(t('prev'))}</span><span>kg</span><span>${esc(t('reps'))}</span><span></span></div>
          ${en.sets.map((s, j) => { const p = prev[j];
            return `<div class="set${s.done ? ' done' : ''}"><button class="set-n${s.w ? ' w' : ''}" data-a="w-warm" data-i="${i}" data-j="${j}" aria-label="${esc(t('warmToggle'))}">${s.w ? 'W' : j + 1 - en.sets.slice(0, j).filter(x => x.w).length}</button><span class="prev">${p ? (p.kg ? p.kg + '×' : '') + p.reps : '–'}</span>
              <input type="text" inputmode="decimal" data-in="w-kg" data-i="${i}" data-j="${j}" value="${esc(s.kg)}" placeholder="${p && p.kg ? p.kg : ''}" aria-label="kg" autocomplete="off" enterkeyhint="next">
              <input type="text" inputmode="numeric" data-in="w-reps" data-i="${i}" data-j="${j}" value="${esc(s.reps)}" placeholder="${p ? p.reps : ''}" aria-label="${esc(t('reps'))}" autocomplete="off" enterkeyhint="done">
              <button class="set-ok" data-a="w-check" data-i="${i}" data-j="${j}" aria-label="${esc(t('setDone'))}" aria-pressed="${s.done}">${IC.check}</button></div>`; }).join('')}</div>
          <div class="wex-f"><button class="link" data-a="w-addset" data-i="${i}">+ ${esc(t('set'))}</button>${en.sets.length > 1 ? `<button class="link mut" data-a="w-delset" data-i="${i}">− ${esc(t('set'))}</button>` : ''}</div></section>`; }).join('')}
        ${a.entries.length ? '' : `<p class="empty">${esc(t('emptyHint'))}</p>`}
        <button class="btn" data-a="w-addex">${IC.plus}${esc(t('addExercise'))}</button><button class="btn danger ghost" data-a="w-cancel">${esc(t('cancelWorkout'))}</button></div>`;
    $('.w-body', el).scrollTop = y; tick();
  }
  function finishWorkout() {
    const a = D().active; if (!a) return;
    const entries = a.entries.map(e => ({ ex: e.ex, label: e.label, sets: e.sets.filter(s => s.done && num(s.reps) > 0).map(s => ({ kg: Math.min(2000, Math.max(0, num(s.kg))), reps: Math.min(1000, Math.round(num(s.reps))), w: !!s.w })) })).filter(e => e.sets.length);
    if (!entries.length) { if (confirm(t('nothingLogged'))) { D().active = null; Store.save(); ui.wOpen = false; unwake(); render(); } return; }
    const open = a.entries.reduce((n, e) => n + e.sets.filter(s => !s.done).length, 0);
    if (open && !confirm(t('finishOpen', open))) return;
    const prs = entries.map(e => { const before = exHistory(e.ex).reduce((m, x) => Math.max(m, bestOf(x.sets)), 0), now = bestOf(e.sets); return now > before && now > 0 ? { ex: e.ex, label: e.label, v: now, was: before } : null; }).filter(Boolean);
    const w = { id: a.id, rid: a.rid, name: a.name, start: a.start, end: Date.now(), entries };
    D().workouts.push(w); D().workouts.sort((x, y) => x.start - y.start); D().active = null; Store.save(); ui.wOpen = false; unwake(); render();
    openSheet(shWorkout(w.id, prs));
  }
  function shWorkout(id, prs) {
    return () => {
      const w = D().workouts.find(x => x.id === id); if (!w) return { title: '', html: '' };
      let h = `<p class="lead">${esc(fmtDate(w.start, true))}</p><div class="kpis"><div><b>${fmtDur(w.end - w.start)}</b><i>${esc(t('duration'))}</i></div><div><b>${setsOf(w)}</b><i>${esc(t('setsWord'))}</i></div><div><b>${compact(volOf(w))}</b><i>${esc(t('volume'))} kg</i></div></div>`;
      if (prs && prs.length) h += `<div class="tip pr"><b>${esc(t('newRecords'))}</b>${prs.map(p => `<span>${esc(itemName(p))}: ${r1(p.v)} kg${p.was ? ' (' + esc(t('was')) + ' ' + r1(p.was) + ')' : ''}</span>`).join('')}</div>`;
      h += w.entries.map(e => `<div class="wk-ex"><button class="exrow" data-a="ex-open" data-id="${esc(e.ex)}"><img src="${img(e.ex)}" alt="" loading="lazy"><span><b>${esc(itemName(e))}</b><i>${e.sets.map(s => (s.w ? 'W ' : '') + (s.kg ? s.kg + '×' : '') + s.reps).join(' · ')}</i></span>${IC.chev}</button></div>`).join('');
      return { title: prs ? t('workoutDone') : w.name, html: h, foot: prs ? `<button class="btn primary" data-a="sheet-close">${esc(t('done'))}</button>` : `<button class="btn danger" data-a="wk-del" data-id="${esc(w.id)}">${esc(t('deleteWorkout'))}</button>` };
    };
  }

  /* ---------- rest timer, clock, sound, wake lock ---------- */
  let actx = null, lock = null;
  function audio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
  function beep() {
    if (!D().settings.sound || !actx) return;
    [0, 0.22, 0.44].forEach(d => { try { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination); const s = actx.currentTime + d; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.4, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16); o.start(s); o.stop(s + 0.18); } catch (e) {} });
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  }
  async function wake() { try { if ('wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch (e) {} }
  function unwake() { try { if (lock) lock.release(); } catch (e) {} lock = null; }
  function startRest(sec) { const a = D().active; if (!a || !D().settings.restAuto || !sec) return; a.restEnd = Date.now() + sec * 1000; a.restTotal = sec; Store.saveActive(); tick(); }
  function dayCheck() { const d = today(); if (d !== ui.day) { if (ui.foodDate === ui.day) ui.foodDate = d; ui.day = d; if (!ui.sheets.length && !ui.wOpen) rerender(); } }
  function tick() {
    dayCheck();
    const a = D().active, bar = $('#restbar'), el = $('#w-el');
    if (a && el) el.textContent = clock((Date.now() - a.start) / 1000);
    if (!a || !a.restEnd) { bar.hidden = true; return; }
    const left = (a.restEnd - Date.now()) / 1000;
    if (left <= 0) { a.restEnd = 0; Store.saveActive(); bar.hidden = true; beep(); toast(t('restOver')); return; }
    bar.hidden = false;
    $('#rb-time').textContent = clock(left); $('#rb-fill').style.width = Math.max(0, Math.min(100, (1 - left / a.restTotal) * 100)) + '%';
  }

  /* ================= NUTRITION ================= */
  function addFood(items, src) {
    const d = D(), day = d.food[ui.foodDate] = d.food[ui.foodDate] || [];
    items.forEach(i => {
      const f = { id: uid(), name: String(i.name || '').trim() || t('meal'), g: Math.round(num(i.g)) || 0, kcal: Math.round(num(i.kcal)), p: r1(num(i.p)), c: r1(num(i.c)), f: r1(num(i.f)), src, t: Date.now() };
      day.push(f);
      d.recentFoods = [{ name: f.name, g: f.g, kcal: f.kcal, p: f.p, c: f.c, f: f.f }].concat(d.recentFoods.filter(x => x.name.toLowerCase() !== f.name.toLowerCase())).slice(0, 12);
    });
    Store.save();
  }
  function shFoodManual() {
    return () => {
      const rc = D().recentFoods, fld = (k, lbl, mode, v) => `<label class="fld"><span>${esc(lbl)}</span><input type="text" inputmode="${mode}" name="${k}" value="${esc(v == null ? '' : v)}" autocomplete="off"></label>`;
      const v = ui.manual || {};
      return { title: t('manual'), html: `${rc.length ? `<p class="cap">${esc(t('recent'))}</p><div class="chips">${rc.map((r, i) => `<button class="chip" data-a="food-recent" data-i="${i}">${esc(r.name)}</button>`).join('')}</div>` : ''}
        <form data-f="food-manual" id="fm"><label class="fld"><span>${esc(t('name'))}</span><input type="text" name="name" value="${esc(v.name || '')}" autocomplete="off" required></label>
        <div class="grid2">${fld('g', t('grams'), 'numeric', v.g || '')}${fld('kcal', 'kcal', 'numeric', v.kcal)}</div><div class="grid3">${fld('p', t('protein') + ' (g)', 'decimal', v.p)}${fld('c', t('carbs') + ' (g)', 'decimal', v.c)}${fld('f', t('fat') + ' (g)', 'decimal', v.f)}</div></form>`,
        foot: `<button class="btn primary" form="fm">${esc(t('addToDiary'))}</button>` };
    };
  }
  function shFoodAI() {
    return () => {
      const s = ui.ai, key = D().settings.apiKey;
      let h = '';
      if (!key) h += `<button class="note warn" data-a="settings"><b>${esc(t('needKey'))}</b><span>${esc(t('needKeySub'))}</span></button>`;
      if (s.res) {
        const tot = s.res.items.reduce((a, i) => a + num(i.kcal), 0);
        h += `${s.img ? `<img class="ai-prev sm" src="${s.img}" alt="">` : ''}<p class="lead"><span class="chip on">${esc(t('conf_' + s.res.confidence))}</span> ${esc(s.res.notes)}</p>`;
        h += s.res.items.length ? s.res.items.map((it, i) => `<div class="ai-item"><div class="re-top"><input type="text" data-in="ai-f" data-k="name" data-i="${i}" value="${esc(it.name)}" aria-label="${esc(t('name'))}"><button class="icon-btn sm" data-a="ai-del" data-i="${i}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>
          <div class="grid5">${[['grams', 'g'], ['kcal', 'kcal'], ['p', t('pShort')], ['c', t('cShort')], ['f', t('fShort')]].map(([k, l]) => `<label><span>${esc(l)}</span><input type="text" inputmode="decimal" data-in="ai-f" data-k="${k}" data-i="${i}" value="${it[k]}"></label>`).join('')}</div></div>`).join('') : `<p class="empty">${esc(t('aiNoFood'))}</p>`;
        h += `<p class="cap">${esc(t('aiCheck'))}</p>`;
        return { title: t('aiResult'), html: h, foot: (s.res.items.length ? `<button class="btn primary wide" data-a="ai-add">${esc(t('add'))} · <span id="ai-tot">${Math.round(tot)}</span> kcal</button>` : '') + `<button class="btn" data-a="ai-reset">${esc(t('again'))}</button>` };
      }
      if (s.loading) return { title: t('analyzing'), html: `${s.img ? `<img class="ai-prev" src="${s.img}" alt="">` : ''}<p class="empty spin">${esc(t('analyzingSub'))}</p>` };
      if (s.err) h += `<div class="note warn"><b>${esc(t('err_' + s.err.code))}</b>${s.err.msg ? `<span>${esc(s.err.msg)}</span>` : ''}</div>`;
      if (s.mode === 'photo') {
        h += s.img ? `<img class="ai-prev" src="${s.img}" alt="${esc(t('yourPhoto'))}"><label class="fld"><span>${esc(t('aiHint'))}</span><input type="text" data-in="ai-hint" value="${esc(s.hint)}" placeholder="${esc(t('aiHintPh'))}" autocomplete="off"></label>`
          : `<p class="lead">${esc(t('aiPhotoLead'))}</p><div class="row2"><label class="btn primary big">${IC.cam}${esc(t('takePhoto'))}<input class="sr" type="file" accept="image/*" capture="environment" data-in="ai-file"></label><label class="btn big">${esc(t('fromGallery'))}<input class="sr" type="file" accept="image/*" data-in="ai-file"></label></div><p class="cap">${esc(t('aiTips'))}</p>`;
      } else h += `<label class="fld"><span>${esc(t('describeLbl'))}</span><textarea rows="4" data-in="ai-text" placeholder="${esc(t('describePh'))}">${esc(s.text)}</textarea></label>`;
      const ready = s.mode === 'photo' ? !!s.img : true;
      return { title: s.mode === 'photo' ? t('scanPhoto') : t('describe'), html: h, foot: ready ? `<button class="btn primary" data-a="ai-go" ${key ? '' : 'disabled'}>${esc(t('analyze'))}</button>${s.img ? `<button class="btn" data-a="ai-reset">${esc(t('otherPhoto'))}</button>` : ''}` : '' };
    };
  }
  async function aiGo() {
    const s = ui.ai, st = D().settings;
    if (s.mode === 'text' && !s.text.trim()) { toast(t('describePh')); return; }
    s.loading = true; s.err = null; refreshSheet();
    try {
      const r = s.mode === 'photo' ? await FoodAI.fromPhoto(st.apiKey, st.model, s.b64, L(), s.hint) : await FoodAI.fromText(st.apiKey, st.model, s.text, L());
      r.items.forEach(i => { i._b = { grams: i.grams, kcal: i.kcal, p: i.p, c: i.c, f: i.f }; });
      s.res = r;
    } catch (e) { s.err = { code: e.code || 'api', msg: e.code === 'api' || e.code === 'model' ? e.message : '' }; }
    s.loading = false; if (ui.ai === s && ui.sheets.length) refreshSheet();
  }
  const ACT = [[1.2, 'act1'], [1.375, 'act2'], [1.55, 'act3'], [1.725, 'act4'], [1.9, 'act5']];
  function calcTargets(p) {
    const w = num(p.weight), hgt = num(p.height), a = num(p.age); if (!w || !hgt || !a) return null;
    const bmr = 10 * w + 6.25 * hgt - 5 * a + (p.sex === 'm' ? 5 : -161), tdee = bmr * num(p.activity);
    const kcal = Math.round(tdee * (1 + ({ cut: -0.18, maintain: 0, bulk: 0.1 }[p.goal] || 0)) / 10) * 10;
    const pr = Math.round(w * (p.goal === 'cut' ? 2.0 : 1.8)), fat = Math.round(Math.max(w * 0.8, kcal * 0.25 / 9));
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, p: pr, c: Math.max(0, Math.round((kcal - pr * 4 - fat * 9) / 4)), f: fat };
  }
  const tgOut = c => c ? `<div class="kpis"><div><b>${c.bmr}</b><i>${esc(t('bmr'))}</i></div><div><b>${c.tdee}</b><i>${esc(t('tdee'))}</i></div><div><b>${c.kcal}</b><i>${esc(t('targetKcal'))}</i></div></div>` : `<p class="empty">${esc(t('fillProfile'))}</p>`;
  function shTargets() {
    return () => {
      const s = ui.tg, p = s.profile, v = s.vals || {};
      const radio = (name, opts) => `<div class="radios">${opts.map(([val, lbl]) => `<label><input type="radio" name="${name}" data-in="tg-p" data-k="${name}" value="${val}" ${String(p[name]) === String(val) ? 'checked' : ''}><span>${esc(lbl)}</span></label>`).join('')}</div>`;
      const fld = (k, lbl) => `<label class="fld"><span>${esc(lbl)}</span><input type="text" inputmode="decimal" data-in="tg-p" data-k="${k}" value="${esc(p[k])}" autocomplete="off"></label>`;
      const out = k => `<label class="fld"><span>${esc(k === 'kcal' ? 'kcal' : t({ p: 'protein', c: 'carbs', f: 'fat' }[k]) + ' (g)')}</span><input type="text" inputmode="numeric" data-in="tg-v" data-k="${k}" id="tg-${k}" value="${v[k] != null ? v[k] : ''}"></label>`;
      return { title: t('targetsTitle'), html: `<fieldset><legend>${esc(t('sex'))}</legend>${radio('sex', [['m', t('male')], ['f', t('female')]])}</fieldset>
        <div class="grid3">${fld('age', t('age'))}${fld('height', t('height'))}${fld('weight', t('weight'))}</div>
        <label class="fld"><span>${esc(t('activity'))}</span><select data-in="tg-p" data-k="activity">${ACT.map(([val, k]) => `<option value="${val}" ${+p.activity === val ? 'selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
        <fieldset><legend>${esc(t('goal'))}</legend>${radio('goal', [['cut', t('cut')], ['maintain', t('maintain')], ['bulk', t('bulk')]])}</fieldset>
        <div id="tg-out">${tgOut(calcTargets(p))}</div><h3>${esc(t('dailyTargets'))}</h3><div class="grid2">${out('kcal')}${out('p')}</div><div class="grid2">${out('c')}${out('f')}</div><p class="cap">${esc(t('targetsCap'))}</p>`,
        foot: `<button class="btn primary" data-a="tg-save">${esc(t('save'))}</button>` };
    };
  }

  /* ================= SETTINGS ================= */
  const MODEL_NAMES = { 'claude-haiku-4-5-20251001': 'Claude Haiku 4.5', 'claude-sonnet-5-5': 'Claude Sonnet 5.5', 'claude-opus-5-5': 'Claude Opus 5.5' };
  const MODELS = Store.MODELS.map(m => [m, MODEL_NAMES[m] || m]);
  function shSettings() {
    return () => {
      const s = D().settings, kb = Math.round(Store.bytes() / 1024);
      return { title: t('settings'), html: `<section class="card"><h3>${esc(t('language'))}</h3><div class="seg"><button class="${L() === 'hu' ? 'on' : ''}" data-a="lang" data-v="hu">Magyar</button><button class="${L() === 'en' ? 'on' : ''}" data-a="lang" data-v="en">English</button></div></section>
        <section class="card"><h3>${esc(t('workout'))}</h3><label class="sw"><input type="checkbox" data-in="set-rest" ${s.restAuto ? 'checked' : ''}><span>${esc(t('restAuto'))}</span></label><label class="sw"><input type="checkbox" data-in="set-sound" ${s.sound ? 'checked' : ''}><span>${esc(t('restSound'))}</span></label><button class="link" data-a="reset-routines">${esc(t('resetRoutines'))}</button></section>
        <section class="card"><h3>${esc(t('aiTitle'))}</h3><p class="cap">${esc(t('aiExplain'))}</p><label class="fld"><span>${esc(t('apiKey'))}</span><input type="password" data-in="set-key" value="${esc(s.apiKey)}" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
          <label class="fld"><span>${esc(t('model'))}</span><select data-in="set-model">${MODELS.map(([v, n]) => `<option value="${v}" ${s.model === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><button class="btn" data-a="ai-test" ${s.apiKey ? '' : 'disabled'}>${esc(t('testKey'))}</button></section>
        <section class="card"><h3>${esc(t('nutrition'))}</h3><button class="btn" data-a="targets">${esc(s.targets ? t('editTargets') : t('setTargets'))}</button></section>
        <section class="card"><h3>${esc(t('data'))}</h3><p class="cap">${esc(t('dataExplain'))} ${kb} kB. ${esc(ui.persisted ? t('persistYes') : t('persistNo'))}</p><div class="row2"><button class="btn" data-a="export">${esc(t('export'))}</button><label class="btn">${esc(t('import'))}<input class="sr" type="file" accept="application/json,.json" data-in="import"></label></div></section>
        <section class="card"><h3>${esc(t('installTitle'))}</h3><ol class="steps">${[1, 2, 3, 4].map(i => `<li>${esc(t('install' + i))}</li>`).join('')}</ol><p class="cap">${esc(standalone ? t('installedYes') : t('installedNo'))}</p></section>
        <section class="card"><h3>${esc(t('about'))}</h3><p class="cap">${esc(t('aboutText'))}</p><p class="cap">GymApp 1.0 · ${window.EXERCISES.length} ${esc(t('exercises'))}</p></section>` };
    };
  }
  async function exportData() {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' }), name = 'gymapp-backup-' + today() + '.json';
    try { const f = new File([blob], name, { type: 'application/json' }); if (isIOS && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast(t('exported'));
  }

  /* ================= ACTIONS ================= */
  const A = {
    tab(el) { ui.tab = el.dataset.tab; render(); },
    settings() { openSheet(shSettings()); },
    'install-help'() { openSheet(shSettings()); },
    'sheet-back'() { closeSheet(); }, 'sheet-close'() { closeSheet(true); },
    lang(el) { D().settings.lang = el.dataset.v; Store.save(); render(); refreshSheet(); },
    /* workout */
    'w-open'() { ui.wOpen = true; wake(); renderWorkout(); }, 'w-min'() { ui.wOpen = false; render(); },
    'w-start'(el) { startWorkout(getR(el.dataset.id)); }, 'w-empty'() { startWorkout(null); }, 'w-finish'() { finishWorkout(); },
    'w-cancel'() { if (confirm(t('cancelConfirm'))) { D().active = null; Store.save(); ui.wOpen = false; unwake(); render(); } },
    'w-check'(el) {
      audio(); const a = D().active, en = a.entries[+el.dataset.i], s = en.sets[+el.dataset.j], row = el.closest('.set');
      if (s.done) { s.done = false; } else {
        const kgI = $('[data-in="w-kg"]', row), rpI = $('[data-in="w-reps"]', row);
        if (s.kg === '' && kgI.placeholder) s.kg = kgI.placeholder; if (s.reps === '' && rpI.placeholder) s.reps = rpI.placeholder;
        if (!(num(s.reps) > 0 && num(s.reps) <= 1000) || num(s.kg) < 0 || num(s.kg) > 2000) { rpI.focus(); row.classList.add('shake'); setTimeout(() => row.classList.remove('shake'), 400); toast(t('needReps')); return; }
        s.done = true; if (!s.w) startRest(en.rest);
      }
      Store.saveActive(); renderWorkout();
    },
    'w-warm'(el) { const s = D().active.entries[+el.dataset.i].sets[+el.dataset.j]; s.w = !s.w; Store.saveActive(); renderWorkout(); },
    'w-addset'(el) { const en = D().active.entries[+el.dataset.i], l = en.sets[en.sets.length - 1]; en.sets.push({ kg: l ? l.kg : '', reps: '', done: false, w: false }); Store.saveActive(); renderWorkout(); },
    'w-delset'(el) { const en = D().active.entries[+el.dataset.i]; en.sets.pop(); Store.saveActive(); renderWorkout(); },
    'w-tools'(el) { ui.wTools = ui.wTools === +el.dataset.i ? null : +el.dataset.i; renderWorkout(); },
    'w-up'(el) { const e = D().active.entries, i = +el.dataset.i; e.splice(i - 1, 0, e.splice(i, 1)[0]); ui.wTools = i - 1; Store.saveActive(); renderWorkout(); },
    'w-down'(el) { const e = D().active.entries, i = +el.dataset.i; e.splice(i + 1, 0, e.splice(i, 1)[0]); ui.wTools = i + 1; Store.saveActive(); renderWorkout(); },
    'w-delex'(el) { if (confirm(t('removeConfirm'))) { D().active.entries.splice(+el.dataset.i, 1); ui.wTools = null; Store.saveActive(); renderWorkout(); } },
    'w-addex'() { ui.pick = { q: '', mus: '', limit: 40 }; ui.pickCb = id => { D().active.entries.push(newEntry({ ex: id, label: null })); Store.saveActive(); closeSheet(true); renderWorkout(); const b = $('#workout .w-body'); b.scrollTop = b.scrollHeight; }; openSheet(shPicker()); },
    'rest-add'(el) { const a = D().active; if (!a || !a.restEnd) return; a.restEnd += +el.dataset.s * 1000; a.restTotal = Math.max(1, a.restTotal + +el.dataset.s); Store.saveActive(); tick(); },
    'rest-skip'() { const a = D().active; if (a) { a.restEnd = 0; Store.saveActive(); tick(); } },
    /* routines */
    'r-open'(el) { openSheet(shRoutine(el.dataset.id)); },
    'r-new'() { ui.edit = { id: uid(), name: L() === 'hu' ? 'Új edzésterv' : 'New routine', items: [], _old: false }; openSheet(shRoutineEdit()); },
    'r-edit'(el) { const r = getR(el.dataset.id); ui.edit = JSON.parse(JSON.stringify(r)); ui.edit._old = true; openSheet(shRoutineEdit()); },
    'r-del'() { if (confirm(t('deleteRoutineConfirm'))) { D().routines = D().routines.filter(r => r.id !== ui.edit.id); Store.save(); closeSheet(true); render(); } },
    're-up'(el) { const e = ui.edit.items, i = +el.dataset.i; e.splice(i - 1, 0, e.splice(i, 1)[0]); refreshSheet(); },
    're-down'(el) { const e = ui.edit.items, i = +el.dataset.i; e.splice(i + 1, 0, e.splice(i, 1)[0]); refreshSheet(); },
    're-del'(el) { ui.edit.items.splice(+el.dataset.i, 1); refreshSheet(); },
    're-add'() { ui.pick = { q: '', mus: '', limit: 40 }; ui.pickCb = id => { ui.edit.items.push({ ex: id, sets: 3, reps: '8–12', rest: 90 }); closeSheet(); }; openSheet(shPicker()); },
    're-save'() {
      const e = ui.edit, old = e._old; delete e._old;
      e.items.forEach(i => { i.sets = Math.max(1, Math.min(12, Math.round(num(i.sets)) || 3)); i.rest = Math.max(0, Math.round(num(i.rest))); i.reps = String(i.reps || '').trim() || '8–12'; });
      if (!String(typeof e.name === 'string' ? e.name : rName(e)).trim()) e.name = t('newRoutine');
      const rs = D().routines, k = rs.findIndex(r => r.id === e.id); if (k >= 0) rs[k] = e; else rs.push(e);
      Store.save(); closeSheet(true); render(); toast(t('saved')); void old;
    },
    pick(el) { if (ui.pickCb && EX[el.dataset.id]) ui.pickCb(el.dataset.id); },
    /* exercises */
    'ex-open'(el) {
      let item = null; const a = D().active;
      if (el.dataset.w != null && a) item = a.entries[+el.dataset.w]; else if (el.dataset.r) { const r = getR(el.dataset.r); item = r && r.items[+el.dataset.i]; }
      if (EX[el.dataset.id]) openSheet(shEx(el.dataset.id, item));
    },
    'ex-to-workout'(el) { if (!D().active || !EX[el.dataset.id]) return; D().active.entries.push(newEntry({ ex: el.dataset.id, label: null })); Store.saveActive(); closeSheet(true); ui.wOpen = true; render(); toast(t('added')); },
    'ex-to-routine'(el) { openSheet(shPickRoutine(el.dataset.id)); },
    'ex-routine-add'(el) { getR(el.dataset.id).items.push({ ex: el.dataset.ex, sets: 3, reps: '8–12', rest: 90 }); Store.save(); closeSheet(); toast(t('added')); if (ui.tab === 'home') rerender(); },
    anim(el) { el.classList.toggle('paused'); },
    'lib-mus'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.mus = el.dataset.m; st.limit = 40; if (pk) refreshSheet(); else rerender(); },
    'lib-more'(el) { const pk = !!el.closest('#sheet'); (pk ? ui.pick : ui.lib).limit += 60; if (pk) refreshSheet(); else rerender(); },
    /* progress */
    prog(el) { ui.prog = el.dataset.v; ui.histLimit = 60; render(); },
    'hist-more'() { ui.histLimit = (ui.histLimit || 60) + 120; rerender(); },
    'wk-open'(el) { openSheet(shWorkout(el.dataset.id, null)); },
    'wk-del'(el) { if (confirm(t('deleteWorkoutConfirm'))) { D().workouts = D().workouts.filter(w => w.id !== el.dataset.id); Store.save(); closeSheet(true); rerender(); } },
    /* food */
    'food-day'(el) { const d = new Date(ui.foodDate + 'T12:00'); d.setDate(d.getDate() + +el.dataset.d); if (ymd(d) <= today()) { ui.foodDate = ymd(d); render(); } },
    'food-del'(el) { const d = D(); d.food[ui.foodDate] = dayFood().filter(f => f.id !== el.dataset.id); Store.save(); rerender(); },
    'food-manual'() { ui.manual = null; openSheet(shFoodManual()); },
    'food-recent'(el) { ui.manual = Object.assign({}, D().recentFoods[+el.dataset.i]); refreshSheet(); },
    'food-ai'(el) { ui.ai = { mode: el.dataset.m, img: null, b64: null, hint: '', text: '', loading: false, res: null, err: null }; openSheet(shFoodAI()); },
    'ai-go'() { aiGo(); },
    'ai-reset'() { const m = ui.ai.mode; ui.ai = { mode: m, img: null, b64: null, hint: '', text: ui.ai.text, loading: false, res: null, err: null }; refreshSheet(); },
    'ai-del'(el) { ui.ai.res.items.splice(+el.dataset.i, 1); refreshSheet(); },
    'ai-add'() { addFood(ui.ai.res.items.map(i => ({ name: i.name, g: i.grams, kcal: i.kcal, p: i.p, c: i.c, f: i.f })), 'ai'); closeSheet(true); rerender(); toast(t('added')); },
    async 'ai-test'() { const s = D().settings; toast(t('testing')); try { await FoodAI.fromText(s.apiKey, s.model, 'one boiled egg', 'en'); toast(t('keyOk')); } catch (e) { toast(t('err_' + (e.code || 'api')) + (e.code === 'api' || e.code === 'model' ? ': ' + e.message : '')); } },
    targets() { const s = D().settings; ui.tg = { profile: Object.assign({}, s.profile), vals: s.targets ? Object.assign({}, s.targets) : (calcTargets(s.profile) || {}), manual: !!s.targets }; openSheet(shTargets()); },
    'tg-save'() { const v = ui.tg.vals, s = D().settings; if (!(num(v.kcal) > 0)) { toast(t('fillProfile')); return; } s.profile = ui.tg.profile; s.targets = { kcal: Math.round(num(v.kcal)), p: Math.round(num(v.p)), c: Math.round(num(v.c)), f: Math.round(num(v.f)) }; Store.save(); closeSheet(); render(); toast(t('saved')); },
    /* data */
    export() { exportData(); },
    'reset-routines'() { if (confirm(t('resetRoutinesConfirm'))) { Store.resetRoutines(); toast(t('saved')); render(); } }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
    const fn = A[el.dataset.a]; if (fn) { if (el.tagName === 'BUTTON' && el.type !== 'submit') e.preventDefault(); fn(el, e); }
  });

  /* ---------- typing ---------- */
  let saveT; const lazySave = () => { clearTimeout(saveT); saveT = setTimeout(() => Store.save(), 250); };
  let saveA; const lazyActive = () => { clearTimeout(saveA); saveA = setTimeout(() => Store.saveActive(), 250); };
  const IN = {
    'lib-q'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.q = el.value; st.limit = 40; const l = $(pk ? '#pick-list' : '#lib-list'); if (l) l.innerHTML = libRows(pk); },
    'w-kg'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].kg = el.value.trim(); lazyActive(); },
    'w-reps'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].reps = el.value.trim(); lazyActive(); },
    're-name'(el) { ui.edit.name = el.value; }, 're-sets'(el) { ui.edit.items[+el.dataset.i].sets = el.value; },
    're-reps'(el) { ui.edit.items[+el.dataset.i].reps = el.value; }, 're-rest'(el) { ui.edit.items[+el.dataset.i].rest = el.value; },
    'ai-hint'(el) { ui.ai.hint = el.value; }, 'ai-text'(el) { ui.ai.text = el.value; },
    'ai-f'(el) {
      const it = ui.ai.res.items[+el.dataset.i], k = el.dataset.k;
      if (k === 'name') { it.name = el.value; return; }
      it[k] = num(el.value);
      if (k === 'grams' && it._b && it._b.grams > 0) { const f = it.grams / it._b.grams; ['kcal', 'p', 'c', 'f'].forEach(m => { it[m] = m === 'kcal' ? Math.round(it._b[m] * f) : r1(it._b[m] * f); const inp = $(`[data-in="ai-f"][data-k="${m}"][data-i="${el.dataset.i}"]`); if (inp) inp.value = it[m]; }); }
      const tot = $('#ai-tot'); if (tot) tot.textContent = Math.round(ui.ai.res.items.reduce((a, i) => a + num(i.kcal), 0));
    },
    'set-key'(el) { D().settings.apiKey = el.value.trim(); lazySave(); const b = $('[data-a="ai-test"]'); if (b) b.disabled = !el.value.trim(); },
    'set-model'(el) { if (Store.MODELS.indexOf(el.value) >= 0) { D().settings.model = el.value; Store.save(); } },
    'set-rest'(el) { D().settings.restAuto = el.checked; Store.save(); }, 'set-sound'(el) { D().settings.sound = el.checked; Store.save(); },
    'tg-p'(el) {
      if (el.type === 'radio' && !el.checked) return;
      ui.tg.profile[el.dataset.k] = el.value; const c = calcTargets(ui.tg.profile); $('#tg-out').innerHTML = tgOut(c);
      if (c && !ui.tg.manual) { ui.tg.vals = { kcal: c.kcal, p: c.p, c: c.c, f: c.f }; ['kcal', 'p', 'c', 'f'].forEach(k => { $('#tg-' + k).value = c[k]; }); }
    },
    'tg-v'(el) { ui.tg.manual = true; ui.tg.vals[el.dataset.k] = el.value; }
  };
  document.addEventListener('input', e => { const el = e.target, k = el.dataset && el.dataset.in; if (k && IN[k] && el.type !== 'file') IN[k](el); });
  document.addEventListener('change', async e => {
    const el = e.target, k = el.dataset && el.dataset.in;
    if (k === 'ai-file' && el.files[0]) { try { const r = await FoodAI.shrink(el.files[0], 1024); ui.ai.img = r.dataUrl; ui.ai.b64 = r.base64; ui.ai.err = null; } catch (er) { ui.ai.err = { code: 'image' }; } refreshSheet(); }
    if (k === 'import' && el.files[0]) {
      try { const o = JSON.parse(await el.files[0].text()), d = o && o.data ? o.data : o; if (!d || !Array.isArray(d.workouts) || !Array.isArray(d.routines)) throw 0;
        if (confirm(t('importConfirm', d.workouts.length))) { Store.replace(d); ui.wOpen = false; ui.foodDate = today(); closeSheet(true); render(); toast(t('imported')); } } catch (er) { toast(t('importBad')); }
      el.value = '';
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.in === 'w-reps') { e.preventDefault(); e.target.blur(); const b = $('.set-ok', e.target.closest('.set')); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); } });
  document.addEventListener('submit', e => {
    const f = e.target, k = f.dataset.f; if (!k) return; e.preventDefault(); const v = Object.fromEntries(new FormData(f));
    if (k === 'bw') { const kg = r1(num(v.kg)); if (!(kg > 20 && kg < 400)) { toast(t('badValue')); return; } const d = D(); d.body = d.body.filter(b => b.d !== today()); d.body.push({ d: today(), kg }); Store.save(); rerender(); toast(t('saved')); }
    if (k === 'food-manual') { if (!(num(v.kcal) >= 0) || !String(v.name).trim()) return; addFood([v], 'manual'); closeSheet(true); rerender(); toast(t('added')); }
  });

  /* A photo missing from this copy of the app is fetched from the open dataset instead (needs a connection). */
  document.addEventListener('error', e => { const el = e.target, src = el && el.tagName === 'IMG' ? (el.getAttribute('src') || '') : ''; if (src.indexOf('img/ex/') === 0 && !el.dataset.fb && (EX[decodeURIComponent(src.split('/')[2])] || {}).k) { el.dataset.fb = '1'; el.src = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + src.slice(7); } else if (el && el.tagName === 'IMG' && (el.dataset.fb || src.indexOf('img/ex/') === 0)) el.style.visibility = 'hidden'; }, true);

  /* ================= INIT ================= */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = !!navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  Store.load();
  let failT = 0; Store.onFail = () => { if (Date.now() - failT > 4000) { failT = Date.now(); setTimeout(() => toast(t('saveFailed')), 0); } };
  dlg().addEventListener('close', () => { ui.sheets = []; });
  dlg().addEventListener('click', e => { if (e.target !== dlg()) return; const r = dlg().getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) closeSheet(true); });
  Charts.bind(document);
  $('#tabbar').innerHTML = [['home', IC.home], ['lib', IC.lib], ['prog', IC.prog], ['food', IC.food]].map(([k, ic]) => `<button data-a="tab" data-tab="${k}">${ic}<span></span></button>`).join('');
  $('#restbar').innerHTML = `<div class="rb-in"><span class="rb-l">${IC.check}</span><b id="rb-time">0:00</b><span class="rb-track"><i id="rb-fill"></i></span><button class="btn sm" data-a="rest-add" data-s="-15">−15</button><button class="btn sm" data-a="rest-add" data-s="15">+15</button><button class="btn sm primary" data-a="rest-skip" id="rb-skip"></button></div>`;
  render(); $('#rb-skip').textContent = t('skip');
  setInterval(tick, 500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { dayCheck(); tick(); if (D().active && ui.wOpen) wake(); } });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => { ui.persisted = p; }).catch(() => {});
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__gym = { ui, render, A };
})();
