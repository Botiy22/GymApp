(function startGymApp() {
  'use strict';
  // A previously cached HTML shell may receive this newer app script before its new script tags.
  // Load the release/guide dependencies before initializing storage or installing event handlers.
  if (!window.GYM_RELEASE || !window.EXERCISE_GUIDES || !window.ExerciseGuide || typeof window.ExerciseGuide.ready !== 'function') {
    const src = !window.GYM_RELEASE ? 'js/release.js' : !window.EXERCISE_GUIDES ? 'data/exercise-guides.js' : 'js/exercise-guide.js';
    const script = document.createElement('script');
    script.src = src;
    script.onload = startGymApp;
    script.onerror = () => {
      const hu = (navigator.language || '').toLowerCase().startsWith('hu');
      const view = document.getElementById('view');
      if (!view) return;
      const box = document.createElement('div');
      box.className = 'card';
      const message = document.createElement('p');
      message.textContent = hu ? 'Az alkalmazás frissítéséhez csatlakozz az internethez, majd töltsd újra.' : 'Connect to the internet and reload to update the app.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = hu ? 'Újratöltés' : 'Reload';
      retry.onclick = () => location.reload();
      box.append(message, retry);
      view.replaceChildren(box);
    };
    document.head.append(script);
    return;
  }
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
  const weekStart = d => { d = new Date(d); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 7 - (D().settings.weekStart === 0 ? 0 : 1)) % 7)); return d; };
  const e1rm = (kg, reps) => kg > 0 && reps > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0;
  const r1 = n => Math.round(n * 10) / 10;
  const calm = () => !!D().settings.calm || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const VERSION = GYM_RELEASE.version;
  const APP_BUILD = GYM_RELEASE.cacheId;
  const releaseText = () => VERSION + ' · ' + t('buildNumber', GYM_RELEASE.build);
  const updateStatusText = () => t(ui.updateStatus, releaseText());
  const norm = s => { s = String(s).toLowerCase(); return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s; };   // search ignores accents
  /* play an element's leaving animation (class "closing"), then run done() */
  function leave(el, ms, done) {
    if (calm()) { done(); return; }
    if (el.classList.contains('closing')) return;
    el.classList.add('closing'); setTimeout(() => { el.classList.remove('closing'); done(); }, ms);
  }

  const EX = {}; window.EXERCISES.forEach(e => { EX[e.id] = e; });
  const PLAN_BY_EX = {}; const HU_NAME = {};
  window.PLAN.items.forEach(i => { if (!PLAN_BY_EX[i.ex]) PLAN_BY_EX[i.ex] = i; if (!i.similar && i.reps !== '21') HU_NAME[i.ex] = i.hu; });
  /* The user's own picture for an exercise (their own exercises, or a replacement for a built-in one) comes before the library's photos. */
  const NOPIC = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160"><rect width="240" height="160" fill="#26272d"/><path d="M84 80h72M72 60v40M58 69v22M168 60v40M182 69v22" fill="none" stroke="#8b8d98" stroke-width="8" stroke-linecap="round"/></svg>');
  const ownPic = id => { const m = D().exMedia[id]; return (m && m.img) || (EX[id] && EX[id].own ? (EX[id].img || NOPIC) : /^my_/.test(id) ? NOPIC : ''); };      // a deleted own exercise has no picture to ask the server for
  const exVid = id => { const m = D().exMedia[id]; return (m && m.vid) || (EX[id] && EX[id].own && EX[id].vid) || ''; };
  const img = (id, f) => ownPic(id) || 'img/ex/' + encodeURIComponent(id) + '/' + (f || 0) + '.jpg';
  const thumb = id => EX[id] && EX[id].own ? ownPic(id) || NOPIC : ((window.EXERCISE_GUIDES || {})[id] || {}).board || NOPIC;
  const FIG = window.FIG || {};                                                        // exercise id -> line drawing (Everkinetic)
  const EXHU = window.EX_HU || {};                                                   // Hungarian names and steps for the whole library
  const exName = id => { const e = EX[id]; if (!e) return /^my_/.test(id) ? t('myExGone') : id; return L() === 'hu' ? (HU_NAME[id] || (EXHU[id] && EXHU[id][0]) || e.n) : e.n; };
  const exSteps = id => ({list:ExerciseGuide.get(id, EX[id], L()).steps, own:true});
  /* Our own database: exercises the user added live in their data (and account) and are merged into the library here. */
  const BASE_N = window.EXERCISES.length; let ownRef = null;
  function ownSync() {
    const my = D().myEx; if (my === ownRef) return; ownRef = my;
    window.EXERCISES.length = BASE_N; Object.keys(EX).forEach(k => { if (EX[k].own) delete EX[k]; });
    my.forEach(e => { if (EX[e.id]) return; const x = { id: e.id, n: e.n, p: e.p, s: e.s, eq: e.eq, c: 'strength', lv: '', m: '', f: '', i: e.steps, phaseSteps:e.phaseSteps, k: 0, own: true, img: e.img, endImg:e.endImg, vid: e.vid }; window.EXERCISES.push(x); EX[x.id] = x; });
    exIdx = null;
  }
  let exIdx = null;                                                                    // search text per exercise: both names, without accents
  const exKey = id => { if (!exIdx) { exIdx = {}; window.EXERCISES.forEach(e => { exIdx[e.id] = norm(e.n + ' ' + (HU_NAME[e.id] || '') + ' ' + ((EXHU[e.id] || [])[0] || '')); }); } return exIdx[id]; };
  const isFav = id => D().favEx.indexOf(id) >= 0;
  const itemName = it => (it.label && it.label[L()]) || exName(it.ex);
  const rName = r => typeof r.name === 'string' ? r.name : (r.name[L()] || r.name.en || r.name.hu);
  const mus = m => (I18N[L()].mus || {})[m] || m;
  const eqp = m => (I18N[L()].eq || {})[m] || m;

  const newCoach = () => ({ id: '', msgs: [], busy: false, err: null, draft: '' });
  const ui = { day: today(), tab: 'home', food: 'diary', idea: '', fs: { q: '', hits: [] }, fa: null, lib: { q: '', grp: '', mus: '', eq: '', limit: 40 }, pick: { q: '', grp: '', mus: '', eq: '', limit: 40, sel: [] }, prog: 'overview', foodDate: today(), habitDate: today(), habitMonth: today().slice(0, 7), habitEdit: null, wOpen: false, sheets: [], ai: null, figBad: {}, coach: newCoach(), gate: { mode: 'in', email: '', busy: false, err: '', info: '' } };

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
    chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.500v13l11-6.500z"/></svg>',
    walk: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.500" r="1.800"/><path d="M9 21l2.500-6.500L9.500 12l1-5 3 1.500 1.500 3 3 1M11.500 14.500l3 2.500 1 4M10.500 7L7 9v3"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.600l2.600 5.300 5.800.800-4.200 4.100 1 5.800-5.200-2.700-5.200 2.700 1-5.800-4.200-4.100 5.800-.800z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M4 6.500h16v13H4zM4 10.500h16M8 4v4M16 4v4"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5.500h16v10.500h-8.500L7 20v-4H4z"/><path d="M8.500 9.500h7M8.500 12.500h4.500"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M4 12l16-7.500-5 15.500-3.500-6z"/><path d="M11.500 14L20 4.500"/></svg>',
    stretch: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.300" r="1.800"/><path d="M12 7v7.500M12 9.500L6.500 5M12 9.500L17.500 5M12 14.500L8 21M12 14.500L16 21"/></svg>',
    habit: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/><circle cx="12" cy="12" r="10"/></svg>'
  };
  /* routine icons: chosen from the muscles of the routine, or picked by hand in the editor */
  const RICON = {
    upper: '<svg viewBox="0 0 24 24"><path d="M8 3.500c1.100 1.300 2.500 2 4 2s2.900-.700 4-2l4.500 2.500-1.500 4.500-2.500-.800V20h-9v-10.300l-2.500.800L3.500 6z"/></svg>',
    legs: '<svg viewBox="0 0 24 24"><path d="M7 3.500h10l1 17h-4.200L12 10l-1.800 10.500H6z"/><path d="M7 7h10"/></svg>',
    push: '<svg viewBox="0 0 24 24"><path d="M3 8h18M6.500 5v6M17.500 5v6M12 21v-8.500M8.500 16L12 12.500l3.500 3.500"/></svg>',
    pull: '<svg viewBox="0 0 24 24"><path d="M3 5h18M7 5v3M17 5v3M12 9v11M8.500 16.500L12 20l3.500-3.500"/></svg>',
    core: '<svg viewBox="0 0 24 24"><path d="M8.500 3.500h7a2 2 0 0 1 2 2v10a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-10a2 2 0 0 1 2-2zM12 3.500v17M6.500 9h11M6.500 14h11"/></svg>',
    arms: '<svg viewBox="0 0 24 24"><path d="M3 10v4M6.500 6.500v11M17.500 6.500v11M21 10v4M6.500 12h11"/></svg>',
    full: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.500" r="2"/><path d="M5 9.500h14M12 9.500v5.500M12 15l-4 6M12 15l4 6"/></svg>',
    cardio: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.500-4.600-7.500-10.200A4.200 4.200 0 0 1 12 7.300a4.200 4.200 0 0 1 7.500 2.500C19.500 15.400 12 20 12 20z"/><path d="M5 12h3.500l1.500-2.500 2 5 1.500-2.500H19"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.600l2.600 5.300 5.800.800-4.200 4.100 1 5.800-5.200-2.700-5.200 2.700 1-5.800-4.200-4.100 5.800-.800z"/></svg>'
  };
  const GROUPS = { upper: ['chest', 'lats', 'middle back', 'shoulders', 'traps', 'biceps', 'triceps', 'forearms', 'neck'], core: ['abdominals', 'lower back'], lower: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] };
  const EQS = ['barbell', 'dumbbell', 'machine', 'cable', 'body only', 'kettlebells', 'bands', 'e-z curl bar', 'exercise ball', 'medicine ball', 'foam roll', 'other'];
  function autoIcon(r) {
    const c = { push: 0, pull: 0, core: 0, legs: 0 }; let k = 0;
    r.items.forEach(i => { const e = EX[i.ex], m = e && e.p[0]; if (!m) return; k++; if (GROUPS.lower.indexOf(m) >= 0) c.legs++; else if (GROUPS.core.indexOf(m) >= 0) c.core++; else if (['chest', 'shoulders', 'triceps'].indexOf(m) >= 0) c.push++; else c.pull++; });
    if (!k) return 'full';
    if (c.legs / k >= 0.6) return 'legs'; if (c.core / k >= 0.6) return 'core';
    const up = c.push + c.pull; if (up / k >= 0.7) return c.push / up >= 0.75 ? 'push' : c.pull / up >= 0.75 ? 'pull' : 'upper';
    return 'full';
  }
  const rIcon = r => RICON[r.icon] ? r.icon : autoIcon(r);

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
  const setsOf = w => w.tick ? (w.pl || []).reduce((a, x) => a + x.n, 0) : w.entries.reduce((a, e) => a + e.sets.filter(s => !s.w).length, 0);
  const wMeta = w => (w.tick ? t('tickedTag') : fmtDur(w.end - w.start)) + ' · ' + setsOf(w) + ' ' + t('setsWord') + (w.tick ? '' : ' · ' + compact(volOf(w)) + ' kg');
  function weekWorkouts() { const ws = weekStart(Date.now()).getTime(); return D().workouts.filter(w => w.start >= ws); }
  function muscleSets(ws) {
    const m = {};
    const add = (id, n) => { const x = EX[id]; if (!x) return; x.p.forEach(k => { m[k] = (m[k] || 0) + n; }); x.s.forEach(k => { m[k] = (m[k] || 0) + n * 0.5; }); };
    ws.forEach(w => { if (w.tick) (w.pl || []).forEach(z => add(z.ex, z.n)); else w.entries.forEach(e => add(e.ex, e.sets.filter(s => !s.w).length)); });      // a ticked workout counts with its planned sets
    return m;
  }
  function nextRoutine() {
    const all = D().routines; if (!all.length) return null;
    const must = all.filter(r => !r.opt), rs = must.length ? must : all;                  // optional days are never offered as "next"
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
  const head = (title, sub, cal) => `<header class="top"><div><h1>${esc(title)}</h1>${sub ? (cal ? `<button class="datebtn" data-a="cal" aria-label="${esc(t('openCal'))}">${esc(sub)}${IC.down}</button>` : `<p>${esc(sub)}</p>`) : ''}</div><button class="icon-btn" data-a="settings" aria-label="${esc(t('settings'))}">${IC.gear}</button></header>`;
  /* steps and burned calories of a day (typed in or pasted from the phone's health app) */
  const actOf = k => D().act[k] || { steps: 0, kcal: 0 };
  const habitDue = Momentum.due;
  const habitDone = (h, k) => Momentum.done(h, k, D());
  function habitStreak(h, k) {
    return Momentum.streak(h, k, D());
  }
  function habitRows(k) {
    const list = D().habits.filter(h => habitDue(h, k));
    if (!list.length) return `<p class="empty">${esc(D().habits.length ? t('habitsNoneDue') : t('habitsEmpty'))}</p>`;
    return list.map(h => { const done = habitDone(h, k), value = r1(Momentum.value(h, k, D())), ratio = Momentum.progress(h, k, D()), auto = !['check', 'count'].includes(h.source), unit = h.source === 'protein' ? 'g' : h.source === 'steps' ? t('stepsLbl') : h.unit;
      const attrs = `data-id="${esc(h.id)}" data-d="${esc(k)}"`;
      return `<div class="habit-row"><button class="habit-check${done ? ' on' : ''}" data-a="habit-toggle" ${attrs} aria-pressed="${done}" aria-label="${esc(auto ? t('momentumAuto') : done ? t('habitUndo') : t('habitComplete'))}: ${esc(h.name)}">${done ? IC.check : auto ? IC.chev : h.source === 'count' ? IC.plus : ''}</button><span class="habit-name"><b>${esc(h.name)}</b><i>${esc(t('habitStreak', habitStreak(h, k)))}${auto ? ' · ' + esc(t('momentumAuto')) : ''}</i>${h.source !== 'check' ? `<span class="habit-meter" role="progressbar" aria-label="${esc(h.name)}" aria-valuemin="0" aria-valuemax="${h.goal}" aria-valuenow="${Math.min(value, h.goal)}"><i style="width:${ratio * 100}%"></i></span><i>${r1(value)} / ${h.goal} ${esc(unit)}</i>` : ''}</span>${h.source === 'count' ? `<div class="habit-counter"><button class="icon-btn sm" data-a="habit-count" ${attrs} data-n="-1" aria-label="−1 ${esc(unit)}" ${value <= 0 ? 'disabled' : ''}>−</button><button class="pill" data-a="habit-amount" ${attrs} aria-label="${esc(t('momentumAmount'))}">${value}</button><button class="icon-btn sm" data-a="habit-count" ${attrs} data-n="1" aria-label="+1 ${esc(unit)}">+</button></div>` : ''}<button class="icon-btn sm" data-a="habit-edit" data-id="${esc(h.id)}" aria-label="${esc(t('edit'))}: ${esc(h.name)}">${IC.pen}</button></div>`;
    }).join('');
  }
  function shHabitEdit() {
    const x = ui.habitEdit, labels = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'short' }));
    return () => ({ title: x.id ? t('habitEdit') : t('habitAdd'), html: `<label class="fld"><span>${esc(t('habitName'))}</span><input id="habit-name" data-in="habit-name" maxlength="60" value="${esc(x.name)}" placeholder="${esc(t('habitNamePh'))}" autocomplete="off"></label><label class="fld"><span>${esc(t('momentumType'))}</span><select data-in="habit-source">${Momentum.sources.map(s => `<option value="${s}" ${x.source === s ? 'selected' : ''}>${esc(t('momentum_' + s))}</option>`).join('')}</select></label>${!['check', 'workout'].includes(x.source) ? `<div class="grid2"><label class="fld"><span>${esc(t('momentumGoal'))}</span><input id="habit-goal" data-in="habit-goal" inputmode="decimal" value="${esc(x.goal)}"></label>${x.source === 'count' ? `<label class="fld"><span>${esc(t('momentumUnit'))}</span><input data-in="habit-unit" maxlength="20" value="${esc(x.unit)}" placeholder="${esc(t('momentumUnitPh'))}"></label>` : ''}</div>` : ''}${!['check', 'count'].includes(x.source) ? `<p class="cap">${esc(t('momentumAutoCap'))}</p>` : ''}<p class="cap">${esc(t('habitSchedule'))}</p><div class="chips">${labels.map((n, i) => `<button class="chip${x.days.indexOf(i) >= 0 ? ' on' : ''}" data-a="habit-day-pick" data-day="${i}" aria-pressed="${x.days.indexOf(i) >= 0}">${esc(n)}</button>`).join('')}</div>${x.id ? `<button class="btn danger" data-a="habit-delete">${esc(t('delete'))}</button>` : ''}`, foot: `<button class="btn primary" data-a="habit-save">${esc(t('save'))}</button>` });
  }
  function habitMonthView() {
    const month = ui.habitMonth, first = new Date(month + '-01T12:00'), loc = L() === 'hu' ? 'hu-HU' : 'en-GB';
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const offset = (first.getDay() - (D().settings.weekStart === 0 ? 0 : 1) + 7) % 7;
    const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, (D().settings.weekStart === 0 ? 7 : 8) + i).toLocaleDateString(loc, { weekday: 'short' }));
    let scheduled = 0, completed = 0;
    const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
      const day = i - offset + 1;
      if (day < 1 || day > count) return '<span class="momentum-blank" aria-hidden="true"></span>';
      const key = month + '-' + pad(day), future = key > today(), s = future ? { total: 0, done: 0, ratio: 0 } : Momentum.summary(D().habits, key, D());
      scheduled += s.total; completed += s.done;
      const label = fmtDate(key + 'T12:00', true) + ': ' + (future ? t('momentumFuture') : s.total ? t('momentumDaySummary', s.done, s.total) : t('habitsNoneDue'));
      return `<button class="momentum-cell${s.total ? ' due' : ''}${s.done === s.total && s.total ? ' full' : ''}${key === ui.habitDate ? ' selected' : ''}${key === today() ? ' today' : ''}" style="--fill:${Math.round(s.ratio * 100)}%" data-a="habit-select-date" data-d="${key}" ${future ? 'disabled' : ''} aria-pressed="${key === ui.habitDate}" ${key === today() ? 'aria-current="date"' : ''} aria-label="${esc(label)}" title="${esc(label)}">${day}</button>`;
    }).join('');
    return `<section class="card momentum-month"><h2>${esc(t('momentumMonth'))}</h2><div class="datenav momentum-month-nav"><button class="icon-btn" data-a="habit-month-step" data-d="-1" aria-label="${esc(t('momentumPrevMonth'))}">${IC.back}</button><b aria-live="polite">${esc(first.toLocaleDateString(loc, { month: 'long', year: 'numeric' }))}</b><button class="icon-btn flip" data-a="habit-month-step" data-d="1" aria-label="${esc(t('momentumNextMonth'))}" ${month >= today().slice(0, 7) ? 'disabled' : ''}>${IC.back}</button></div><div class="momentum-weekdays" aria-hidden="true">${weekdays.map(n => `<span>${esc(n)}</span>`).join('')}</div><div class="momentum-heat">${cells}</div><p class="momentum-month-summary">${esc(scheduled ? t('momentumMonthSummary', completed, scheduled, Math.round(completed / scheduled * 100)) : t('momentumMonthEmpty'))}</p><p class="cap">${esc(t('momentumMonthCap'))}</p>${ui.habitDate !== today() ? `<button class="btn sm habit-today" data-a="habit-today">${esc(t('momentumBackToday'))}</button>` : ''}</section>`;
  }
  function vHabits() {
    const k = ui.habitDate, d = new Date(k + 'T12:00'), loc = L() === 'hu' ? 'hu-HU' : 'en-GB', due = D().habits.filter(h => habitDue(h, k)), done = due.filter(h => habitDone(h, k)).length;
    let h = head(t('tabHabits'), t('momentumSub'));
    h += `<div class="datenav habit-nav"><button class="icon-btn" data-a="habit-date" data-d="-1" aria-label="${esc(t('prevDay'))}">${IC.back}</button><b>${k === today() ? esc(t('today')) : esc(d.toLocaleDateString(loc, { weekday: 'short', month: 'short', day: 'numeric' }))}</b><button class="icon-btn flip" data-a="habit-date" data-d="1" aria-label="${esc(t('nextDay'))}" ${k >= today() ? 'disabled' : ''}>${IC.back}</button></div>`;
    const stats = Momentum.summary(D().habits, k, D()), percent = Math.round(stats.ratio * 100);
    h += `<section class="card momentum-hero"><div class="momentum-ring" style="--progress:${percent * 3.6}deg" role="img" aria-label="${percent}%"><b>${percent}%</b></div><div><small>${esc(t('momentumSub'))}</small><h2>${esc(t(due.length ? done === due.length ? 'momentumDone' : 'momentumProgress' : 'momentumRest'))}</h2><p>${done} / ${due.length} ${esc(t('momentumRate'))}</p></div></section>`;
    const start = ymd(weekStart(k + 'T12:00'));
    h += `<h3>${esc(t('momentumWeek'))}</h3><div class="momentum-week">${Array.from({ length: 7 }, (_, i) => { const key = Momentum.shift(start, i), s = Momentum.summary(D().habits, key, D()); return `<button class="${key === k ? 'selected' : ''}" data-a="habit-select-date" data-d="${key}" ${key > today() ? 'disabled' : ''} aria-label="${esc(fmtDate(key + 'T12:00', true))}: ${s.done}/${s.total}"><i>${esc(new Date(key + 'T12:00').toLocaleDateString(loc, { weekday: 'narrow' }))}</i><b>${key.slice(-2)}</b><span style="--fill:${s.total ? s.ratio * 100 : 0}%"></span></button>`; }).join('')}</div>`;
    h += `<div class="card habit-card"><div class="h2row"><h2>${esc(t('habitsDaily'))}</h2><span class="habit-count">${done}/${due.length}</span></div>${habitRows(k)}</div><button class="btn primary habit-add" data-a="habit-new">${IC.plus}${esc(t('habitAdd'))}</button>`;
    h += `<section class="card"><h3>${esc(t('momentumTemplates'))}</h3><div class="chips">${['Water', 'Read', 'Stretch', 'Steps', 'Workout', 'Protein'].map((n, i) => `<button class="chip" data-a="habit-template" data-i="${i}">${esc(t('tpl' + n))}</button>`).join('')}</div><p class="cap">${esc(t('habitEmpty'))}</p></section>`;
    let recentTotal = 0, recentDone = 0;
    const recentStart = Momentum.shift(today(), -27);
    for (let i = 0; i < 28; i++) { const s = Momentum.summary(D().habits, Momentum.shift(recentStart, i), D()); recentTotal += s.total; recentDone += s.done; }
    h += `<section class="card momentum-recent"><h3>${esc(t('momentum28'))}</h3><p class="cap">${esc(fmtDate(recentStart + 'T12:00'))} – ${esc(fmtDate(today() + 'T12:00'))}</p><b>${esc(recentTotal ? t('momentumMonthSummary', recentDone, recentTotal, Math.round(recentDone / recentTotal * 100)) : t('momentumMonthEmpty'))}</b></section>`;
    h += habitMonthView();
    return h;
  }
  function actRow(k) {
    const a = actOf(k), has = a.steps > 0 || a.kcal > 0;
    return `<button class="qrow actrow" data-a="act" data-d="${esc(k)}"><span class="q-ic line">${IC.walk}</span><span class="rc-t"><b>${has ? `${compact(a.steps)} ${esc(t('steps'))} · ${compact(a.kcal)} kcal` : esc(t('actAdd'))}</b><i>${esc(t(has ? 'actEdit' : 'actAddSub'))}</i></span>${IC.chev}</button>`;
  }

  function vHome() {
    const d = D(), nx = nextRoutine(), wk = weekWorkouts(), tk = d.workouts.filter(w => w.tick && ymd(w.start) === today()).pop();
    const days = [0, 1, 2, 3, 4, 5, 6].map(i => { const dt = new Date(weekStart(Date.now())); dt.setDate(dt.getDate() + i); return dt; });
    const done = new Set(wk.map(w => ymd(w.start)));
    let h = head(t('appName'), fmtDate(Date.now(), true), true);
    if (isIOS && !standalone) h += `<div class="note" data-a="install-help"><b>${esc(t('installTitle'))}</b><span>${esc(t('installShort'))}</span></div>`;
    if (Store.memoryOnly) h += `<div class="note warn"><b>${esc(t('noStorage'))}</b></div>`;
    if (Store.failed) h += `<div class="note warn"><b>${esc(t('saveFailed'))}</b></div>`;
    if (!window.HTMLDialogElement) h += `<div class="note warn"><b>${esc(t('oldIOS'))}</b></div>`;
    h += `<div class="week">${days.map(dt => `<button class="wd${done.has(ymd(dt)) ? ' on' : ''}${ymd(dt) === today() ? ' now' : ''}" data-a="day-open" data-d="${ymd(dt)}" aria-label="${esc(fmtDate(dt, true))}" ${ymd(dt) > today() ? 'disabled' : ''}><i>${dt.toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'narrow' })}</i><b>${done.has(ymd(dt)) ? IC.check : dt.getDate()}</b></button>`).join('')}</div>`;
    const goal = d.settings.weekGoal;
    if (goal > 0) h += `<p class="goal${wk.length >= goal ? ' ok' : ''}"><b>${wk.length} / ${goal}</b> ${esc(t(wk.length >= goal ? 'goalDone' : 'goalText'))}</p>`;
    if (d.active) {
      h += `<button class="hero resume" data-a="w-open"><small>${esc(t('inProgress'))}</small><strong>${esc(d.active.name)}</strong><span>${esc(t('tapResume'))}</span></button>`;
    } else if (tk) {
      h += `<div class="hero done"><small>${esc(t('doneToday'))}</small><strong>${IC.check}${esc(tk.name)}</strong><span>${esc(t('tickedSub'))}</span><button class="link" data-a="w-untick" data-id="${esc(tk.id)}">${esc(t('undo'))}</button></div>`;
    } else if (nx) {
      h += `<div class="hero"><small>${esc(t('nextUp'))}</small><strong>${esc(rName(nx))}</strong><span>${nx.sub ? esc(nx.sub[L()]) + ' · ' : ''}${nx.items.length} ${esc(t('exercises'))} · ~${estMin(nx)} ${esc(t('min'))}</span>
        <button class="btn primary big" data-a="w-start" data-id="${esc(nx.id)}">${esc(t('startWorkout'))}</button><button class="btn big tickbtn" data-a="w-tick" data-id="${esc(nx.id)}">${IC.check}${esc(t('tickWorkout'))}</button></div>`;
    }
    h += planCard(today(), false);
    if (!d.active) h += `<button class="qrow" data-a="w-quick"><span class="q-ic">${IC.bolt}</span><span class="rc-t"><b>${esc(t('quickWorkout'))}</b><i>${esc(t('quickSub'))}</i></span>${IC.chev}</button>`;
    h += `<div class="h2row"><h2>${esc(t('routines'))}</h2><button class="pill" data-a="r-new">${IC.plus}${esc(t('newPlan'))}</button></div><div class="rlist rgrid">` + d.routines.map(r => { const ic = rIcon(r);
      return `<button class="rcard rtile ic-${ic}" data-a="r-open" data-id="${esc(r.id)}"><span class="r-ic">${RICON[ic]}</span><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(t('exercises'))} · ~${estMin(r)} ${esc(t('min'))}${r.opt ? ' · ' + esc(t('optional')) : ''}</i></span></button>`; }).join('') + `</div>`;
    h += `<h2>${esc(t('actToday'))}</h2>` + actRow(today());
    return h;
  }

  function libFilter(st) {
    const q = norm(st.q).split(/\s+/).filter(Boolean), g = st.grp || '';
    if (g === 'sel') return (st.sel || []).map(id => EX[id]).filter(Boolean);     // "selected": what is ticked, in the order it was ticked
    const ms = st.mus ? [st.mus] : GROUPS[g], fav = D().favEx;
    const list = window.EXERCISES.filter(e => (st.catalogue === 'all' || e.own || g === 'fav' || ExerciseGuide.ready(e.id)) && (g !== 'fav' || fav.indexOf(e.id) >= 0) && (g !== 'own' || e.own) && (!ms || e.p.some(m => ms.indexOf(m) >= 0)) && (!st.eq || e.eq === st.eq) && q.every(w => exKey(e.id).indexOf(w) >= 0));
    const rank = e => (e.own ? 4 : 0) + (fav.indexOf(e.id) >= 0 ? 2 : 0) + (PLAN_BY_EX[e.id] ? 1 : 0);                 // favourites first, then the exercises of the built-in plan
    return list.sort((a, b) => rank(b) - rank(a) || exName(a.id).localeCompare(exName(b.id), L()));
  }
  function libRows(pick) {
    const st = pick ? ui.pick : ui.lib, list = libFilter(st);
    if (!list.length) return `<p class="empty">${esc(t(st.grp === 'fav' && !st.q.trim() && !st.eq ? 'favEmpty' : 'noResults'))}</p>`;
    return list.slice(0, st.limit).map(e => {
      const k = pick ? st.sel.indexOf(e.id) : -1, sub = `<span><b>${esc(exName(e.id))}${isFav(e.id) ? ' <em class="fv" aria-hidden="true">★</em>' : ''}</b><i>${esc(e.p.map(mus).join(', '))} · ${esc(eqp(e.eq))}</i></span>`;
      return pick                                                                     // picker: the photo opens the details, the rest of the row ticks it
        ? `<div class="exrow pickrow${k >= 0 ? ' on' : ''}" data-id="${esc(e.id)}"><button class="pk-img" data-a="ex-open" data-id="${esc(e.id)}" aria-label="${esc(t('details'))}"><img src="${thumb(e.id)}" alt="" loading="lazy" decoding="async"></button><button class="pk-main" data-a="pick" data-id="${esc(e.id)}" aria-pressed="${k >= 0}">${sub}<em class="pk-n">${k >= 0 ? k + 1 : ''}</em></button></div>`
        : `<button class="exrow extile" data-a="ex-open" data-id="${esc(e.id)}"><img src="${thumb(e.id)}" alt="" loading="lazy" decoding="async" width="240" height="160">${sub}</button>`;
    }).join('') +
      (list.length > st.limit ? `<button class="btn ghost" data-a="lib-more">${esc(t('showMore'))} (${list.length - st.limit})</button>` : '');
  }
  const MUS_ORDER = ['chest', 'lats', 'middle back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abdominals', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'traps', 'lower back', 'adductors', 'abductors', 'neck'];
  /* Filters without sideways scrolling: body part first (one row of big buttons), then the muscles of that part, wrapped onto as many rows as needed. */
  function libControls(pick) {
    const st = pick ? ui.pick : ui.lib, g = st.grp || '';
    const segs = [['', t('all')], ['fav', '★'], ['upper', t('grpUpper')], ['core', t('grpCore')], ['lower', t('grpLower')]].concat(D().myEx.length ? [['own', t('grpOwn')]] : []);
    return `<div class="seg catalogue-scope">${[['ready', 'catalogueReady'], ['all', 'catalogueAll']].map(([v, key]) => `<button class="${(st.catalogue || 'ready') === v ? 'on' : ''}" data-a="lib-catalogue" data-v="${v}" aria-pressed="${(st.catalogue || 'ready') === v}">${esc(t(key))}</button>`).join('')}</div><p class="cap">${esc(t(st.catalogue === 'all' ? 'catalogueAllNote' : 'catalogueReadyNote'))}</p><div class="search with-sel"><input type="search" data-in="lib-q" value="${esc(st.q)}" placeholder="${esc(t('searchEx'))}" autocomplete="off" autocapitalize="off" enterkeyhint="search" aria-label="${esc(t('searchEx'))}"><select data-in="lib-eq" aria-label="${esc(t('equipment'))}"><option value="">${esc(t('eqAll'))}</option>${EQS.map(q => `<option value="${q}" ${st.eq === q ? 'selected' : ''}>${esc(eqp(q))}</option>`).join('')}</select></div>
      <div class="seg grp">${segs.map(([v, n]) => `<button class="${g === v ? 'on' : ''}" data-a="lib-grp" data-g="${v}" ${v === 'fav' ? `aria-label="${esc(t('favs'))}"` : ''} aria-pressed="${g === v}">${esc(n)}</button>`).join('')}</div>
      ${pick ? `<div class="chips selrow" id="pk-selrow" ${st.sel.length ? '' : 'hidden'}><button class="chip sel${g === 'sel' ? ' on' : ''}" id="pk-selchip" data-a="lib-grp" data-g="sel">${esc(t('selected'))} (<span>${st.sel.length}</span>)</button></div>` : ''}
      ${GROUPS[g] ? `<div class="chips mus"><button class="chip${!st.mus ? ' on' : ''}" data-a="lib-mus" data-m="">${esc(t('all'))}</button>${GROUPS[g].map(m => `<button class="chip${st.mus === m ? ' on' : ''}" data-a="lib-mus" data-m="${m}">${esc(mus(m))}</button>`).join('')}</div>` : ''}`;
  }
  function vLib() { return head(t('tabLib'), t('catalogueCount', window.EXERCISES.filter(e => !e.own && ExerciseGuide.ready(e.id)).length, BASE_N)) + libControls() + `<div class="ownrow"><button class="pill" data-a="mx-new">${IC.plus}${esc(t('myExBtn'))}</button></div><div id="lib-list" class="exlist exgrid">${libRows(false)}</div>`; }

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
        return hd + `<button class="wrow" data-a="wk-open" data-id="${esc(w.id)}"><span class="wr-d"><b>${new Date(w.start).getDate()}</b><i>${esc(new Date(w.start).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'short' }))}</i></span><span class="wr-t"><b>${esc(w.name)}</b><i>${esc(wMeta(w))}</i></span>${IC.chev}</button>`;
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
  /* ---------- the loaded plan: meals per weekday with exact numbers, each ticked off with one tap ---------- */
  const planDay = k => { const p = D().plan; return p ? p.days[(new Date(k + 'T12:00').getDay() + 6) % 7] || null : null; };
  const dayTargets = k => { const p = D().plan, pd = p && p.targets ? planDay(k) : null; return pd && pd.total ? pd.total : D().settings.targets; };     // the plan's own totals for that weekday, otherwise the general target
  const pmName = m => typeof m.name === 'string' ? m.name : (m.name[L()] || m.name.hu || m.name.en);
  function planCard(k, full) {
    const pd = planDay(k); if (!pd || !pd.meals.length) return '';
    const got = {}; (D().food[k] || []).forEach(f => { if (f.pm) got[f.pm] = 1; });
    const n = pd.meals.filter(m => got[m.id]).length, p = D().plan;
    return `<div class="h2row"><h2>${esc(t('mealPlan'))}</h2><span class="plan-n${n === pd.meals.length ? ' ok' : ''}">${pd.type ? esc(t(pd.type === 'train' ? 'dayTrain' : 'dayRest')) + ' · ' : ''}${n} / ${pd.meals.length}</span></div><div class="plan">` + pd.meals.map(m => {
      const on = !!got[m.id];
      return `<button class="pmeal${on ? ' on' : ''}" data-a="pm-tick" data-m="${esc(m.id)}" data-d="${esc(k)}" role="checkbox" aria-checked="${on}"><span class="pm-box">${IC.check}</span><span class="pm-t"><b>${esc(pmName(m))}<small>${m.kcal} kcal</small></b>${full ? `<span class="pm-items">${m.items.map(i => `<span><span>${esc(i.n)}</span><em>${dec(i.g)} g</em></span>`).join('')}</span>` : `<i>${esc(m.items.map(i => i.n).join(', '))}</i>`}<i class="pm-m">${macroLine(m)}</i></span></button>`; }).join('') + `</div>` +
      (full && (p.notes.length || p.train.length) ? `<button class="link" data-a="plan-notes">${esc(t('planRules'))}</button>` : '');
  }
  function shPlanNotes() {
    return () => { const p = D().plan || { notes: [], train: [], name: '' }, sec = (ttl, l) => l.length ? `<h3>${esc(ttl)}</h3><ul class="pnotes">${l.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '';
      return { title: p.name || t('planRules'), html: sec(t('planTrain'), p.train) + sec(t('planFood'), p.notes) || `<p class="empty">${esc(t('noResults'))}</p>` }; };
  }
  function vFood() {
    const d = D(), tg0 = dayTargets(ui.foodDate), fromPlan = !!tg0 && tg0 !== d.settings.targets, list = dayFood();
    const burn = tg0 && d.settings.addActive ? actOf(ui.foodDate).kcal : 0, tg = tg0 ? Object.assign({}, tg0, { kcal: tg0.kcal + burn }) : null;   // active calories can be added to the day's budget
    const sum = list.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    let h = head(t('tabFood')) + `<div class="seg"><button class="${ui.food === 'diary' ? 'on' : ''}" data-a="food-view" data-v="diary">${esc(t('diary'))}</button><button class="${ui.food === 'ideas' ? 'on' : ''}" data-a="food-view" data-v="ideas">${esc(t('ideas'))}</button></div>`;
    if (ui.food === 'ideas') return h + vIdeas();
    h += `<div class="datenav"><button class="icon-btn" data-a="food-day" data-d="-1" aria-label="${esc(t('prevDay'))}">${IC.back}</button><button class="datebtn" data-a="cal" data-d="${ui.foodDate}" aria-label="${esc(t('openCal'))}"><b>${ui.foodDate === today() ? esc(t('today')) : esc(fmtDate(ui.foodDate + 'T12:00', true))}</b>${IC.down}</button><button class="icon-btn flip" data-a="food-day" data-d="1" aria-label="${esc(t('nextDay'))}" ${ui.foodDate >= today() ? 'disabled' : ''}>${IC.back}</button></div>`;
    if (!tg) h += `<button class="note" data-a="targets"><b>${esc(t('setTargets'))}</b><span>${esc(t('setTargetsSub'))}</span></button>`;
    h += `<section class="card cal"><p class="bignum">${Math.round(sum.kcal)}<small> ${tg ? '/ ' + tg.kcal : ''} kcal</small></p>${tg ? Charts.meter(sum.kcal, tg.kcal) + `<p class="cap">${sum.kcal <= tg.kcal ? esc(t('remaining', Math.round(tg.kcal - sum.kcal))) : esc(t('over', Math.round(sum.kcal - tg.kcal)))}${burn ? ' · ' + esc(t('budgetCap', burn)) : ''}</p>` : ''}
      <div class="macros">${[['p', t('protein')], ['c', t('carbs')], ['f', t('fat')]].map(([k, n]) => `<div><span>${esc(n)}</span><b>${Math.round(sum[k])}${tg ? ' / ' + dec(tg[k]) : ''} g</b>${tg ? Charts.meter(sum[k], tg[k], 'thin') : ''}</div>`).join('')}</div>
      ${fromPlan ? `<p class="cap plancap">${esc(t('planTgCap'))}</p>` : tg ? `<button class="link" data-a="targets">${esc(t('editTargets'))}</button>` : ''}</section>`;
    h += planCard(ui.foodDate, true);
    h += `<div class="row3"><button class="btn primary" data-a="food-ai" data-m="photo">${IC.cam}${esc(t('scanPhoto'))}</button><button class="btn" data-a="food-ai" data-m="text">${IC.pen}${esc(t('describe'))}</button><button class="btn" data-a="food-manual">${IC.lib}${esc(t('foodSearchBtn'))}</button></div>`;
    h += actRow(ui.foodDate) + `<h2>${esc(t('meals'))}</h2>` + (list.length ? `<div class="flist">` + list.map(f => `<div class="frow"><span><b>${esc(f.name)}</b><i>${f.g ? f.g + ' g · ' : ''}${esc(t('pShort'))} ${Math.round(f.p)} · ${esc(t('cShort'))} ${Math.round(f.c)} · ${esc(t('fShort'))} ${Math.round(f.f)}${f.src === 'ai' ? ' · AI' : f.src === 'plan' ? ' · ' + esc(t('planTag')) : ''}</i></span><strong>${Math.round(f.kcal)}</strong><button class="icon-btn sm" data-a="food-del" data-id="${esc(f.id)}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>`).join('') + `</div>` : `<p class="empty">${esc(t('noMeals'))}</p>`);
    return h;
  }
  /* ---------- meal ideas ---------- */
  const RCP = window.RECIPES || { items: [], videos: [] };
  function vIdeas() {
    const cats = [['', t('all')], ['breakfast', t('cat_breakfast')], ['main', t('cat_main')], ['snack', t('cat_snack')]];
    let h = `<div class="seg">${cats.map(([c, n]) => `<button class="${ui.idea === c ? 'on' : ''}" data-a="idea-cat" data-c="${c}" aria-pressed="${ui.idea === c}">${esc(n)}</button>`).join('')}</div><div class="rlist">` +
      RCP.items.filter(r => !ui.idea || r.cat === ui.idea).map(r => `<button class="rcard" data-a="idea-open" data-id="${esc(r.id)}"><span class="rc-t"><b>${esc(r[L()] || r.en)}</b><i>${r.source ? esc(t('recipeNew')) + ' · ' : ''}${r.kcal == null ? '—' : r.kcal} kcal · ${r.p == null ? '—' : r.p} g ${esc(t('protein').toLowerCase())} · ${r.min} ${esc(t('min'))}</i></span>${IC.chev}</button>`).join('') + `</div><p class="cap">${esc(t('ideasCap'))}</p>`;
    const vids = RCP.videos.filter(v => /^https:\/\/www\.tiktok\.com\//.test(v.url));
    if (vids.length) h += `<h2>${esc(t('videosTitle'))}</h2><div class="rlist">${vids.map(v => `<a class="rcard" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer"><span class="q-ic">${IC.play}</span><span class="rc-t"><b>${esc(v.t)}</b><i>TikTok · @iamvargacsaba</i></span>${IC.chev}</a>`).join('')}</div><p class="cap">${esc(t('videosCap'))}</p>`;
    return h;
  }
  function shRecipe(id) {
    return () => {
      const r = RCP.items.find(x => x.id === id); if (!r) return { title: '', html: '' };
      const k = L() === 'hu' ? 0 : 1, q = ui.recipeQty || 1, macro = key => r[key] == null ? '—' : r1(r[key] * q);
      return { title: r[L()] || r.en, html: `<div class="kpis k4"><div><b>${macro('kcal')}</b><i>kcal</i></div><div><b>${macro('p')} g</b><i>${esc(t('protein'))}</i></div><div><b>${macro('c')} g</b><i>${esc(t('carbs'))}</i></div><div><b>${macro('f')} g</b><i>${esc(t('fat'))}</i></div></div>
        <div class="recipe-portions"><span>${esc(t('recipeQty'))}</span><button class="icon-btn" data-a="recipe-qty" data-n="-0.5" ${q <= .5 ? 'disabled' : ''} aria-label="−0.5">−</button><b>${q}</b><button class="icon-btn" data-a="recipe-qty" data-n="0.5" ${q >= 20 ? 'disabled' : ''} aria-label="+0.5">+</button></div><p class="cap">${r.g ? r1(r.g * q) + ' g · ' : ''}${r.min} ${esc(t('min'))} · ${esc(t('recipeYield', r.servings || 1))}${r.source ? ' · ' + esc(t('recipeEstimate')) : ''}</p>
        <section class="card"><h3>${esc(t('recipeBatch'))}</h3><ul class="ing">${r.ing.map(i => `<li><span>${esc(i[k])}</span><b>${typeof i[2] === 'number' ? i[2] + ' g' : esc(i[2])}</b></li>`).join('')}</ul></section>
        <section class="card"><h3>${esc(t('method'))}</h3><ol class="steps">${(r.steps[L()] || r.steps.en).map(x => `<li>${esc(x)}</li>`).join('')}</ol></section><p class="cap">${esc(r.note ? r.note[L()] || r.note.en : t('ideasCap'))}</p>${r.source ? `<p class="cap">${esc(t('recipeSource'))}: ${esc(r.source)}</p>` : ''}`,
        foot: `<button class="btn primary" data-a="idea-add" data-id="${esc(r.id)}">${esc(t('addToDiary'))}</button>` };
    };
  }

  /* ---------- food database (USDA) ---------- */
  const FOODS = window.FOODS || { hu: [], list: [] };
  let fIdx = null;
  function foodSearch(q, enOnly) {
    const toks = norm(q).split(/[\s,]+/).filter(Boolean); if (!toks.length) return [];
    if (!fIdx) fIdx = { hu: FOODS.hu.map(h => norm(h[0])), en: FOODS.list.map(r => norm(r[0])) };      // built on first use
    const out = [], seen = {};
    const score = (str, base) => { let sc = base - str.length / 8; if (str.indexOf(toks[0]) === 0) sc += 40; toks.forEach(tk => { const i = str.indexOf(tk); if (i === 0 || /[\s,(]/.test(str[i - 1])) sc += 12; }); return sc; };
    if (L() === 'hu' && !enOnly) fIdx.hu.forEach((str, i) => { if (toks.every(tk => str.indexOf(tk) >= 0)) out.push({ h: i, i: FOODS.hu[i][1], sc: score(str, 200) }); });
    fIdx.en.forEach((str, i) => { if (toks.every(tk => str.indexOf(tk) >= 0)) out.push({ h: -1, i, sc: score(str, 0) }); });
    if (!enOnly) { const fv = D().favFoods; if (fv.length) out.forEach(x => { if (fv.indexOf(x.h >= 0 ? 'hu:' + FOODS.hu[x.h][0] : 'en:' + FOODS.list[x.i][0]) >= 0) x.sc += 30; }); }
    return out.sort((a, b) => b.sc - a.sc).filter(x => { const k = x.h >= 0 ? 'h' + x.h : 'e' + x.i; if (seen[k] || (x.h < 0 && seen['i' + x.i])) return false; seen[k] = 1; if (x.h >= 0) seen['i' + x.i] = 1; return true; }).slice(0, 40);
  }
  /* portion words of the USDA table in Hungarian: whole phrases first, single words after */
  const PORT_HU = [[/\bexcluding refuse\b|\bwithout refuse\b/g, 'hulladék nélkül'], [/\bwithout skin\b/g, 'bőr nélkül'], [/\bwith skin\b/g, 'bőrrel'], [/\bskin only\b/g, 'csak a bőre'], [/\bbone removed\b|\bbone and skin removed\b/g, 'csont nélkül'], [/\bwith bone\b/g, 'csonttal'],
    [/\btotal can contents\b/g, 'a konzerv teljes tartalma'], [/\bwith liquid\b|\bwith juice\b/g, 'lével'], [/\bnot packed\b/g, 'lazán'], [/\bpacked\b/g, 'tömörítve'], [/\bchopped or diced\b|\bchopped\b|\bdiced\b/g, 'aprítva'], [/\bhalves or slices\b/g, 'felezve vagy szeletelve'],
    [/\btablespoons?\b|\btbsp\b/g, 'evőkanál'], [/\bteaspoons?\b|\btsp\b/g, 'teáskanál'], [/\bcups?\b/g, 'csésze (2,4 dl)'], [/\bslices?\b/g, 'szelet'], [/\bpieces?\b/g, 'darab'], [/\bitem\b|\beach\b/g, 'db'], [/\bsandwich\b|\bsub\b/g, 'szendvics'],
    [/\bextra large\b/g, 'extra nagy'], [/\blarge\b/g, 'nagy'], [/\bmedium\b/g, 'közepes'], [/\bsmall\b/g, 'kicsi'], [/\bregular\b/g, 'normál'], [/\bmini\b/g, 'mini'], [/\bpackage\b/g, 'csomag'], [/\bcan\b/g, 'konzerv'], [/\bcontainer\b|\bbox\b/g, 'doboz'], [/\bfillet\b/g, 'filé'], [/\bbar\b/g, 'szelet'],
    [/\bbottle\b/g, 'palack'], [/\bserving\b|\bportion\b|\border\b/g, 'adag'], [/\bsliced\b/g, 'szeletelve'], [/\bshredded\b/g, 'reszelve'], [/\bcookies?\b/g, 'keksz'], [/\blinks?\b/g, 'szál'], [/\bpatty\b/g, 'pogácsa'],
    [/\bsteak\b/g, 'szelet'], [/\broast\b/g, 'egész sült'], [/\bchop\b/g, 'karajszelet'], [/\bfruit\b/g, 'db'], [/\bpacket\b|\bpouch\b|\benvelope\b/g, 'tasak'], [/\bbag\b/g, 'zacskó'], [/\bscoop\b/g, 'adagolókanál'], [/\bwhole\b/g, 'egész'], [/\bmashed\b|\bpureed\b/g, 'pépesítve'],
    [/\bdrumstick\b/g, 'alsócomb'], [/\bthigh\b/g, 'felsőcomb'], [/\bbreast\b/g, 'mell'], [/\bwing\b/g, 'szárny'], [/\bleg\b/g, 'comb'], [/\bback\b/g, 'hát'], [/\bbird\b/g, 'egész madár'], [/\bchicken\b/g, 'csirke'], [/\bskin\b/g, 'bőr'], [/\bribs\b/g, 'borda'], [/\brack\b/g, 'oldalas'],
    [/\bcrackers?\b/g, 'kréker'], [/\bpastry\b/g, 'péksütemény'], [/\bcubes\b/g, 'kockázva'], [/\bcube\b/g, 'kocka'], [/\bhalves\b/g, 'felezve'], [/\bhalf\b/g, 'fél'], [/\bcakes?\b/g, 'sütemény'], [/\bpie\b/g, 'pite'], [/\broll\b/g, 'zsemle'], [/\bcondensed\b/g, 'sűrítve'],
    [/\bcooked\b/g, 'főzve'], [/\bwaffles?\b/g, 'gofri'], [/\bbiscuits?\b/g, 'pogácsa'], [/\bleaf\b|\bleaves\b/g, 'levél'], [/\bstrips?\b/g, 'csík'], [/\bpitted\b/g, 'kimagozva'], [/\bpepper\b/g, 'paprika'], [/\bhead\b/g, 'fej'], [/\bpancakes?\b/g, 'palacsinta'], [/\broot\b/g, 'gyökér'],
    [/\bcrushed\b/g, 'zúzva'], [/\bdrained\b/g, 'lecsepegtetve'], [/\bfrankfurter\b/g, 'virsli'], [/\bpotato\b/g, 'burgonya'], [/\bunthawed\b/g, 'fagyasztva'], [/\bthawed\b/g, 'kiolvasztva'], [/\bentree\b/g, 'főétel'], [/\bpod\b/g, 'hüvely'], [/\bsections\b/g, 'gerezdek'],
    [/\bround\b/g, 'kerek'], [/\bkernels\b/g, 'szem'], [/\bblock\b/g, 'tömb'], [/\bbeans\b/g, 'bab'], [/\bstick\b/g, 'rúd'], [/\bgiblets\b/g, 'aprólék'], [/\bsifted\b/g, 'szitálva'], [/\bear\b/g, 'cső'], [/\bchunks\b/g, 'darabokban'], [/\bliver\b/g, 'máj'], [/\binch\b/g, 'hüvelyk (2,5 cm)'],
    [/\bor\b/g, 'vagy'], [/\band\b/g, 'és'], [/^\.(\d)/, '0,$1']];
  const portName = dsc => L() === 'hu' ? PORT_HU.reduce((x, [re, to]) => x.replace(re, to), dsc) : dsc;
  function foodOf(i, h) {
    const r = FOODS.list[i], hu = h >= 0 ? FOODS.hu[h] : null, ports = [];
    if (hu && hu[3]) ports.push([hu[4], hu[3]]);
    else for (let k = 5; k + 1 < r.length; k += 2) ports.push([r[k], portName(r[k + 1]), r[k + 1]]);
    return { key: (hu ? 'hu:' + hu[0] : 'en:' + r[0]), own: !!(hu && hu[3]), name: hu ? hu[0] : r[0], usda: hu ? r[0] : '', approx: !!(hu && hu[2]), kcal: r[1], p: r[2], c: r[3], f: r[4], ports };
  }
  const dec = v => L() === 'hu' ? String(v).replace('.', ',') : String(v);                                 // Hungarian writes 22,5
  const macroLine = f => `${esc(t('pShort'))} ${dec(f.p)} · ${esc(t('cShort'))} ${dec(f.c)} · ${esc(t('fShort'))} ${dec(f.f)}`;
  let fKey = null;                                                                      // favourite key -> where the food is in the table
  function favFoodHits() {
    if (!fKey) { fKey = {}; FOODS.hu.forEach((h, i) => { fKey['hu:' + h[0]] = { h: i, i: h[1] }; }); FOODS.list.forEach((r, i) => { fKey['en:' + r[0]] = { h: -1, i }; }); }
    return D().favFoods.map(k => fKey[k]).filter(Boolean);
  }
  const BRANDS = ["McDonald's", 'Burger King', 'KFC', 'Subway', 'Pizza Hut', "Wendy's", 'Taco Bell', "Domino's", 'Popeyes'];
  const foodHit = (x, k, a) => { const f = foodOf(x.i, x.h); return `<button class="frow fhit" data-a="${a}" data-n="${k}"><span><b>${esc(f.name)}${f.approx ? ' ≈' : ''}${D().favFoods.indexOf(f.key) >= 0 ? ' <em class="fv" aria-hidden="true">★</em>' : ''}</b><i>${f.kcal} kcal / 100 g · ${macroLine(f)}</i></span>${IC.chev}</button>`; };
  function foodRows() {
    const st = ui.fs, q = st.q.trim(), rc = D().recentFoods;
    const more = `<div class="fs-more"><p class="cap">${esc(t(q ? 'foodNotFound' : 'foodOwnLead'))}</p>${q ? `<button class="btn" data-a="fs-ai">${IC.bolt}${esc(t('foodAskAI'))}</button>` : ''}<button class="btn" data-a="fs-own">${IC.pen}${esc(t('foodOwn'))}</button><button class="btn" data-a="mf-new">${IC.plus}${esc(t('myFoodNew'))}</button></div>`;
    const toks = norm(q).split(/[\s,]+/).filter(Boolean), mine = D().myFoods.filter(z => { const s = norm(z.name); return toks.every(tk => s.indexOf(tk) >= 0); });
    const myBlock = mine.length ? `<p class="cap">${esc(t('myFoods'))}</p><div class="flist">${mine.map(z => `<div class="frow myf"><button class="myf-main" data-a="fs-my" data-id="${esc(z.id)}"><b>${esc(z.name)}</b><i>${dec(z.kcal)} kcal / 100 g · ${macroLine(z)}</i></button><button class="icon-btn sm" data-a="mf-edit" data-id="${esc(z.id)}" aria-label="${esc(t('edit'))}">${IC.pen}</button></div>`).join('')}</div>` : '';
    if (!q) {
      st.favs = favFoodHits();
      return myBlock + (st.favs.length ? `<p class="cap">${esc(t('favs'))}</p><div class="flist">${st.favs.map((x, k) => foodHit(x, k, 'fs-fav')).join('')}</div>` : '') +
        (rc.length ? `<p class="cap">${esc(t('recent'))}</p><div class="chips">${rc.map((r, i) => `<button class="chip" data-a="food-recent" data-i="${i}">${esc(r.name)}</button>`).join('')}</div>` : '') +
        `<p class="cap">${esc(t('brands'))}</p><div class="chips">${BRANDS.map(b => `<button class="chip" data-a="fs-brand" data-q="${esc(b)}">${esc(b)}</button>`).join('')}</div><p class="lead">${esc(t('foodSearchLead', FOODS.list.length))}</p>` + more;
    }
    st.hits = foodSearch(q);
    return myBlock + (st.hits.length ? `<div class="flist">${st.hits.map((x, k) => foodHit(x, k, 'fs-pick')).join('')}</div>` : mine.length ? '' : `<p class="empty">${esc(t('foodNone'))}</p>`) + more;
  }
  function shFoodFind() {
    const fn = () => ({ title: t('addFoodTitle'), html: `<div class="search"><input type="search" data-in="fs-q" value="${esc(ui.fs.q)}" placeholder="${esc(t('foodSearchPh'))}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="${esc(t('addFoodTitle'))}"></div><div id="fs-list">${foodRows()}</div>` });
    fn.kind = 'foodfind'; return fn;
  }
  function faOut() {
    const f = ui.fa.food, g = num(ui.fa.g), k = g / 100;
    return `<div class="kpis k4"><div class="hl"><b>${Math.round(f.kcal * k)}</b><i>kcal</i></div><div><b>${dec(r1(f.p * k))} g</b><i>${esc(t('protein'))}</i></div><div><b>${dec(r1(f.c * k))} g</b><i>${esc(t('carbs'))}</i></div><div><b>${dec(r1(f.f * k))} g</b><i>${esc(t('fat'))}</i></div></div>`;
  }
  function shFoodAmount() {
    return () => {
      const f = ui.fa.food, chips = [[100, '100 g']].concat(f.ports.map(p => [p[0], p[1] + ' (' + p[0] + ' g)']));
      const fav = D().favFoods.indexOf(f.key) >= 0;
      return { title: t('addFoodTitle'), html: `<div class="exmeta top"><p class="fa-name">${esc(f.name)}</p>${f.my ? '' : `<button class="favbtn${fav ? ' on' : ''}" data-a="fav-food" aria-pressed="${fav}">${IC.star}${esc(t(fav ? 'favOn' : 'favAdd'))}</button>`}</div>${f.usda ? `<p class="en">${esc(f.usda)}</p>` : ''}<p class="cap">${esc(t('per100'))}: ${f.kcal} kcal · ${macroLine(f)}</p>
        ${f.approx ? `<div class="note warn"><b>${esc(t('foodApprox'))}</b></div>` : ''}
        <label class="fld"><span>${esc(t('grams'))}</span><input type="text" inputmode="decimal" data-in="fa-g" value="${esc(ui.fa.g)}" autocomplete="off" enterkeyhint="done"></label>
        <div class="chips">${chips.map(([v, l]) => `<button class="chip${num(ui.fa.g) === v ? ' on' : ''}" data-a="fa-set" data-g="${v}">${esc(l)}</button>`).join('')}</div>
        <div id="fa-out">${faOut()}</div><p class="cap">${esc(t(f.my ? 'myFoodSrc' : 'foodSrc'))}</p>`,
        foot: `<button class="btn primary" data-a="fa-add">${esc(t('addToDiary'))}</button>` };
    };
  }
  function pickFood(x) { const f = foodOf(x.i, x.h); const each = f.ports.find(pt => f.own || /item|sandwich|slice|\bsub\b|\bbar\b|large|medium|small|link|patty|biscuit|taco|burrito|pieces|container|\bcan\b|packet/i.test(pt[2] || ''));   // start from a natural unit (1 sandwich, 1 slice…), otherwise from 100 g
      ui.fa = { food: f, g: String(each ? each[0] : 100) }; openSheet(shFoodAmount()); }
  const VIEWS = { home: vHome, lib: vLib, prog: vProg, food: vFood, habits: vHabits };

  let animT = 0;
  function render() {
    ownSync();
    document.documentElement.lang = L();
    const y = ui.keepScroll ? window.scrollY : 0; ui.keepScroll = false;
    const v = $('#view'); v.dataset.anim = ui.anim || ''; ui.anim = '';
    clearTimeout(animT); if (v.dataset.anim) animT = setTimeout(() => { v.dataset.anim = ''; }, 600);
    v.innerHTML = VIEWS[ui.tab]();
    $$('#tabbar button').forEach(b => { b.classList.toggle('on', b.dataset.tab === ui.tab); b.querySelector('span').textContent = t('tab' + b.dataset.tab[0].toUpperCase() + b.dataset.tab.slice(1)); b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'); });
    window.scrollTo(0, y);
    const cb = $('#coach'); if (cb) { cb.hidden = !D().settings.coach; cb.setAttribute('aria-label', t('coachTitle')); }
    renderWorkout();
  }
  const rerender = () => { ui.keepScroll = true; render(); };
  /* Changing screen: where the browser can do it, the old screen fades into the new one (View Transitions); elsewhere the new blocks rise in as before.
     Automated browsers skip the cross-fade unless a test asks for it, because it finishes one frame later. */
  function go(kind, change) {
    ui.anim = kind;
    if (calm() || !document.startViewTransition || (navigator.webdriver && !ui.vt)) { change(); return; }
    try { document.startViewTransition(change); } catch (e) { change(); }
  }

  /* ================= SHEETS (bottom dialogs, stacked) ================= */
  const dlg = () => $('#sheet');
  function drawSheet(nav) {
    const fn = ui.sheets[ui.sheets.length - 1]; if (!fn) return;
    ownSync();
    const s = fn(), d = dlg(), old = $('.sheet-body', d), y = old && ui.sheetKeep ? old.scrollTop : 0; ui.sheetKeep = false;
    d.dataset.nav = nav || '';                                   // fwd / back: the new content slides in from that side
    d.innerHTML = `<div class="sheet-head">${ui.sheets.length > 1 ? `<button class="icon-btn" data-a="sheet-back" aria-label="${esc(t('back'))}">${IC.back}</button>` : '<span class="sp"></span>'}<h2 id="sheet-title">${esc(s.title)}</h2><button class="icon-btn" data-a="sheet-close" aria-label="${esc(t('close'))}">${IC.close}</button></div><div class="sheet-body">${s.html}</div>${s.foot ? `<div class="sheet-foot">${s.foot}</div>` : ''}`;
    $('.sheet-body', d).scrollTop = y;
  }
  let closeT = 0;
  function openSheet(fn) {
    const d = dlg(); if (!d.showModal) { toast(t('oldIOS')); return; }
    const nested = d.open && !closeT;
    clearTimeout(closeT); closeT = 0; d.classList.remove('closing');          // a sheet that was sliding away is reused
    ui.sheets.push(fn); drawSheet(nested ? 'fwd' : ''); if (!d.open) d.showModal();
  }
  function refreshSheet() { ui.sheetKeep = true; drawSheet(); }
  function closeSheet(all) {
    if (all) ui.sheets = []; else ui.sheets.pop();
    if (!ui.sheets.length && ui.stale) { ui.stale = false; setTimeout(rerender, 0); }      // data arrived from the account while a panel was open
    const d = dlg();
    if (ui.sheets.length) { drawSheet('back'); return; }
    if (!d.open || closeT) return;
    if (calm()) { d.close(); return; }
    d.classList.add('closing');                                               // slide down first, then really close
    closeT = setTimeout(() => { closeT = 0; d.classList.remove('closing'); if (d.open && !ui.sheets.length) d.close(); }, 200);
  }
  const topIs = kind => { const f = ui.sheets[ui.sheets.length - 1]; return !!f && f.kind === kind; };

  /* ---------- exercise detail ---------- */
  function drawingPicture(source, phase, board, label) {
    return `<span class="drawing-picture"><img class="${board ? 'drawing-board phase-' + phase : ''}" src="${esc(source)}" alt="${esc(label)}"></span>`;
  }
  function exerciseDrawings(id, name, board, pair) {
    return `<div class="drawing-pair">${[0, 1].map(phase => {
      const source = board || pair[phase], label = name + ' · ' + t(phase ? 'artEnd' : 'artStart');
      return source ? `<button class="drawing-phase" data-a="fig-big" data-id="${esc(id)}" data-phase="${phase}" data-source="${esc(source)}" data-board="${board ? '1' : '0'}" aria-label="${esc(t('figBig') + ': ' + label)}">${drawingPicture(source, phase, !!board, label)}<span class="drawing-caption">${esc(t(phase ? 'artEnd' : 'artStart'))}</span></button>` : `<div class="drawing-phase"><p class="cap">${esc(t('artUnavailable'))}</p></div>`;
    }).join('')}</div><p class="cap figcap">${esc(t('guideTap'))}</p>`;
  }
  function shEx(id, item) {
    return () => {
      const e = EX[id], pl0 = PLAN_BY_EX[id], special = pl0 && (pl0.similar || pl0.reps === '21'), name = item ? itemName(item) : exName(id);
      const pl = pl0 && (!special || (item && item.label && item.label.hu === pl0.hu)) ? pl0 : null;
      const focus = ui.muscleFocus && ui.muscleFocus.id === id ? ui.muscleFocus.group : '', mm = focus ? MuscleMap.fromLists(e.p.includes(focus) ? [focus] : [], e.s.includes(focus) ? [focus] : []) : pl && pl.mm ? pl.mm : MuscleMap.fromLists(e.p, e.s), hst = exHistory(id);
      let best = 0, top = null; hst.forEach(x => x.sets.forEach(s => { if (s.w) return; const v = e1rm(s.kg, s.reps); if (v > best) best = v; if (!top || s.kg > top.kg || (s.kg === top.kg && s.reps > top.reps)) top = s; }));
      const pts = hst.map(x => ({ x: fmtDate(x.d), y: r1(bestOf(x.sets)) })).filter(p => p.y > 0);
      const variant = pl && pl.similar ? 'machine' : pl && pl.reps === '21' ? 'twentyOne' : '';
      const guide = ExerciseGuide.get(id, e, L(), variant), board = !ui.figBad[guide.board] ? guide.board : '', phases = guide.pair;
      let h = exerciseDrawings(id, name, board, phases);
      if (!e.own && !ExerciseGuide.ready(id)) h += `<p class="cap">${esc(t('guidePending'))}</p>`;
      if (guide.steps.length) h += `<section class="card exercise-instructions"><h3>${esc(t('howTo'))}</h3><ol class="steps">${guide.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></section>`;
      if (item && (item.rir || item.note)) h += `<div class="tip"><b>${esc(t('planNote'))}</b>${item.rir ? 'RIR ' + esc(item.rir) + (item.note ? ' · ' : '') : ''}${esc(item.note || '')}</div>`;
      const fav = isFav(id);
      h += `<div class="exmeta"><p class="en">${name !== e.n ? esc(e.n) : ''}</p><button class="favbtn${fav ? ' on' : ''}" data-a="fav-ex" data-id="${esc(id)}" aria-pressed="${fav}">${IC.star}${esc(t(fav ? 'favOn' : 'favAdd'))}</button></div><div class="chips">${e.p.map(m => `<span class="chip on">${esc(mus(m))}</span>`).join('')}${e.s.map(m => `<span class="chip">${esc(mus(m))}</span>`).join('')}<span class="chip">${esc(eqp(e.eq))}</span></div>`;
      h += `<section class="card"><h3>${esc(t('musclesWorked'))}</h3><div class="mm">${MuscleMap.svg(mm[0], mm[1], t('front'), t('backSide'))}</div><p class="cap"><i class="k1"></i>${esc(t('primary'))}<i class="k2"></i>${esc(t('secondary'))}</p></section>`;
      const muscleName = m => (window.MUSCLE_DETAIL[m] || [mus(m), mus(m)])[L() === 'hu' ? 0 : 1];
      h += `<section class="card muscle-detail"><h3>${esc(t('muscleNames'))}</h3><button class="chip${!focus ? ' on' : ''}" data-a="muscle-focus" data-id="${esc(id)}" data-group="" aria-pressed="${!focus}">${esc(t('muscleAll'))}</button>${[['primary', e.p], ['secondary', e.s]].map(([key, list]) => `<h4>${esc(t(key))}</h4><div class="chips">${list.map(m => `<button class="chip${focus === m ? ' on' : ''}" data-a="muscle-focus" data-id="${esc(id)}" data-group="${esc(m)}" aria-pressed="${focus === m}"><b>${esc(muscleName(m).split(' · ')[0])}</b>${muscleName(m).includes(' · ') ? `<small>${esc(muscleName(m).split(' · ').slice(1).join(' · '))}</small>` : ''}</button>`).join('')}</div>`).join('')}<p class="cap">${esc(t('musclePrecision'))}</p></section>`;
      h += `<section class="card"><h3>${esc(t('myStats'))}</h3>` + (hst.length ? `<div class="kpis"><div><b>${best ? r1(best) : '–'}</b><i>${esc(t('est1rm'))}</i></div><div><b>${top ? (top.kg ? top.kg + '×' + top.reps : top.reps) : '–'}</b><i>${esc(t('bestSet'))}</i></div><div><b>${hst.length}</b><i>${esc(t('sessions'))}</i></div></div>${pts.length > 1 ? Charts.line(pts.slice(-20), { unit: ' kg' }) + `<p class="cap">${esc(t('e1rmChart'))}</p>` : ''}
        <div class="lastlist">${hst.slice(-3).reverse().map(x => `<p><i>${esc(fmtDate(x.d))}</i>${x.sets.map(s => `<span>${s.w ? 'W ' : ''}${s.kg ? s.kg + '×' : ''}${s.reps}</span>`).join('')}</p>`).join('')}</div>` : `<p class="empty">${esc(t('noHistoryEx'))}</p>`) + `</section>`;
      if (e.own) h += `<section class="card"><button class="btn" data-a="mx-edit" data-id="${esc(id)}">${IC.pen}${esc(t('edit'))}</button></section>`;
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
      const h = (r.sub ? `<p class="lead">${esc(r.sub[L()])}</p>` : '') + (r.info ? `<p class="cap rinfo">${esc(typeof r.info === 'object' ? r.info[L()] || r.info.en || '' : r.info)}</p>` : '') + `<p class="cap">${r.items.length} ${esc(t('exercises'))} · ${r.items.reduce((a, i) => a + i.sets, 0)} ${esc(t('setsWord'))} · ~${estMin(r)} ${esc(t('min'))}</p>${prepRow('warm', { entries: r.items }, ` data-r="${esc(r.id)}"`)}${prepRow('cool', { entries: r.items }, ` data-r="${esc(r.id)}"`)}<div class="exlist prep-gap">` +
        r.items.map((it, i) => `<button class="exrow" data-a="ex-open" data-id="${esc(it.ex)}" data-r="${esc(r.id)}" data-i="${i}"><img src="${thumb(it.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(itemName(it))}</b><i>${it.sets} × ${esc(it.reps)}${it.rir ? ' · RIR ' + esc(it.rir) : ''} · ${esc(t('rest'))} ${clock(it.rest)}</i>${it.note ? `<i class="nt">${esc(it.note)}</i>` : ''}</span>${IC.chev}</button>`).join('') + `</div>` +
        `<button class="btn tickbtn" data-a="w-tick" data-id="${esc(r.id)}">${IC.check}${esc(t('tickWorkout'))}</button>` + (D().plan && D().plan.train.length ? `<button class="link" data-a="plan-notes">${esc(t('planRules'))}</button>` : '');
      return { title: rName(r), html: h, foot: `<button class="btn primary" data-a="w-start" data-id="${esc(r.id)}">${esc(t('startWorkout'))}</button><button class="btn" data-a="r-edit" data-id="${esc(r.id)}">${esc(t('edit'))}</button>` };
    };
  }
  function shRoutineEdit() {
    return () => {
      const r = ui.edit;
      const h = `<label class="fld"><span>${esc(t('routineName'))}</span><input type="text" data-in="re-name" value="${esc(rName(r))}" placeholder="${esc(t('routineNamePh'))}" autocomplete="off"></label>
        <p class="lbl">${esc(t('icon'))}</p><div class="icons">${[''].concat(Store.ICONS).map(v => `<button class="${(r.icon || '') === v ? 'on ' : ''}ic-${v || rIcon(Object.assign({}, r, { icon: '' }))}" data-a="re-icon" data-v="${v}" aria-pressed="${(r.icon || '') === v}" aria-label="${esc(v ? t('icon') + ' ' + v : t('iconAuto'))}"><span class="r-ic">${v ? RICON[v] : RICON[rIcon(Object.assign({}, r, { icon: '' }))]}</span>${v ? '' : `<i>${esc(t('iconAuto'))}</i>`}</button>`).join('')}</div>
        <div class="re-list">${r.items.map((it, i) => `<div class="re-row"><div class="re-top"><img src="${thumb(it.ex)}" alt="" decoding="async"><b>${esc(itemName(it))}</b><button class="icon-btn sm" data-a="re-up" data-i="${i}" aria-label="${esc(t('moveUp'))}" ${i ? '' : 'disabled'}>${IC.up}</button><button class="icon-btn sm" data-a="re-down" data-i="${i}" aria-label="${esc(t('moveDown'))}" ${i < r.items.length - 1 ? '' : 'disabled'}>${IC.down}</button><button class="icon-btn sm" data-a="re-del" data-i="${i}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>
          <div class="re-f"><label><span>${esc(t('setsWord'))}</span><input type="text" inputmode="numeric" data-in="re-sets" data-i="${i}" value="${it.sets}"></label><label><span>${esc(t('reps'))}</span><input type="text" data-in="re-reps" data-i="${i}" value="${esc(it.reps)}"></label><label><span>${esc(t('rest'))} (s)</span><input type="text" inputmode="numeric" data-in="re-rest" data-i="${i}" value="${it.rest}"></label><label><span>RIR</span><input type="text" data-in="re-rir" data-i="${i}" value="${esc(it.rir || '')}" maxlength="8"></label></div></div>`).join('') || `<p class="empty">${esc(t('noItems'))}</p>`}</div>
        <button class="btn" data-a="re-add">${IC.plus}${esc(t('addExercise'))}</button>${r._old ? `<button class="btn" data-a="r-dup">${esc(t('saveCopy'))}</button>` : ''}${r._old && !r.builtin ? `<button class="btn danger" data-a="r-del">${esc(t('deleteRoutine'))}</button>` : ''}`;
      return { title: r._old ? t('editRoutine') : t('newRoutine'), html: h, foot: `<button class="btn primary" data-a="re-save">${esc(t('save'))}</button>` };
    };
  }
  /* What a freshly picked exercise starts with: the plan's own numbers when the plan has that exercise, otherwise 3 × 8–12. */
  const itemFor = id => { const p = PLAN_BY_EX[id]; return p && !p.similar && p.reps !== '21' ? { ex: id, label: null, sets: p.sets, reps: p.reps, rest: p.rest } : { ex: id, label: null, sets: 3, reps: '8–12', rest: D().settings.restDefault ?? 90 }; };
  function cleanEdit(e) {
    delete e._old;
    e.items.forEach(i => { i.sets = Math.max(1, Math.min(12, Math.round(num(i.sets)) || 3)); i.rest = Math.max(0, Math.min(3600, Math.round(num(i.rest)))); i.reps = String(i.reps || '').trim().slice(0, 20) || '8–12'; i.rir = String(i.rir || '').trim().slice(0, 8); if (!i.rir) delete i.rir; });
    if (!String(typeof e.name === 'string' ? e.name : rName(e)).trim()) { const base = t('myRoutine'), k = D().routines.filter(r => rName(r).indexOf(base) === 0).length; e.name = base + (k ? ' ' + (k + 1) : ''); }
    return e;
  }
  /* Exercise picker: tick as many as you like, the number shows the order, one button adds them all. */
  const newPick = o => Object.assign({ q: '', grp: '', mus: '', eq: '', limit: 40, sel: [], title: t('addExercise'), lead: '', cta: t('add'), done: null }, o);
  function shPicker() {
    const fn = () => { const st = ui.pick; return { title: st.title, html: (st.lead ? `<p class="lead">${esc(st.lead)}</p>` : '') + libControls(true) + `<div id="pick-list" class="exlist">${libRows(true)}</div>`,
      foot: `<button class="btn primary" data-a="pick-done" ${st.sel.length ? '' : 'disabled'}>${esc(st.cta)}<span id="pk-count">${st.sel.length ? ' (' + st.sel.length + ')' : ''}</span></button>` }; };
    fn.kind = 'picker'; return fn;
  }
  function pickSync() {                                                                // after a tick: update numbers, button and chip without redrawing (keeps scroll and keyboard)
    const st = ui.pick, n = st.sel.length;
    $$('#pick-list .pickrow').forEach(r => { const i = st.sel.indexOf(r.dataset.id); r.classList.toggle('on', i >= 0); $('.pk-n', r).textContent = i >= 0 ? i + 1 : ''; $('.pk-main', r).setAttribute('aria-pressed', i >= 0); });
    const c = $('#pk-count'), b = $('#sheet [data-a="pick-done"]'), chip = $('#pk-selchip'), row = $('#pk-selrow');
    if (c) c.textContent = n ? ' (' + n + ')' : ''; if (b) b.disabled = !n; if (chip) $('span', chip).textContent = n; if (row) row.hidden = !n;
  }

  /* ================= ACTIVE WORKOUT ================= */
  function newEntry(it) { return { ex: it.ex, label: it.label || null, target: it.sets || 3, reps: it.reps || '8–12', rest: it.rest ?? 90, rir: it.rir || '', note: it.note || '', sets: Array.from({ length: it.sets || 3 }, () => ({ kg: '', reps: '', done: false, w: false })) }; }
  function startWorkout(r, asked) {
    if (!r || (!asked && D().active && !confirm(t('replaceActive')))) return;
    D().active = { id: uid(), rid: r.id || null, name: rName(r), start: Date.now(), entries: r.items.map(newEntry), circuit: !!r.circuit, info: r.info || null, restEnd: 0, restTotal: 0, warm: false, cool: false };
    if (D().settings.autofill) D().active.entries.forEach(en => { const hs = exHistory(en.ex), prev = hs.length ? hs[hs.length - 1].sets : []; en.sets.forEach((x, j) => { if (prev[j] && prev[j].kg) x.kg = String(prev[j].kg); }); });   // last time's weights typed in for you
    Store.save(); ui.wOpen = true; closeSheet(true); wake(); render();
  }
  function hintFor(en, hst) {
    if (!hst.length) return t('firstTime');
    const last = hst[hst.length - 1].sets.filter(s => !s.w), top = repTop(en.reps);
    const txt = last.map(s => (s.kg ? s.kg + '×' : '') + s.reps).join(', ');
    if (top && last.length >= en.target && last.every(s => s.reps >= top) && last[0].kg > 0) return t('hintUp', txt, top);
    return t('hintLast', txt);
  }
  function circuitNext(a) {
    const rows = a.entries.map(en => en.sets.map((s, j) => ({ s, j })).filter(x => !x.s.w));
    const rounds = Math.max(0, ...rows.map(r => r.length));
    for (let round = 0; round < rounds; round++) for (let i = 0; i < rows.length; i++) {
      const x = rows[i][round]; if (x && !x.s.done) return { i, j: x.j, round: round + 1, rounds };
    }
    return null;
  }
  function circuitGuide(a) {
    if (!a.circuit) return '';
    const next = circuitNext(a), sets = a.entries.flatMap(e => e.sets).filter(s => !s.w), done = sets.filter(s => s.done).length;
    return `<section class="card circuit-guide" aria-live="polite"><h3>${esc(next ? t('circuitRound', next.round, next.rounds) : t('circuitComplete'))}</h3><p>${done} / ${sets.length} ${esc(t('setsWord'))}</p><progress max="${Math.max(1, sets.length)}" value="${done}" aria-label="${esc(t('circuitProgress'))}"></progress>${next ? `<button class="btn primary" data-a="circuit-next">${esc(t('circuitNext'))}: ${esc(itemName(a.entries[next.i]))}</button>` : ''}</section>`;
  }
  function jumpCircuit() {
    const a = D().active, next = a && a.circuit && circuitNext(a); if (!next) return;
    const row = $(`#workout .set[data-i="${next.i}"][data-j="${next.j}"]`); if (!row) return;
    row.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
    const input = $('[data-in="w-reps"]', row); if (input) input.focus({ preventScroll: true });
  }
  function renderWorkout() {
    const el = $('#workout'), a = D().active, on = !!a && ui.wOpen;
    document.body.classList.toggle('w-on', on);
    if (!on) { el.hidden = true; el.innerHTML = ''; tick(); return; }
    const old = $('.w-body', el), y = old ? old.scrollTop : 0;
    el.hidden = false;
    el.innerHTML = `<header class="w-head"><button class="icon-btn" data-a="w-min" aria-label="${esc(t('minimize'))}">${IC.down}</button><div><b>${esc(a.name)}</b><i id="w-el">0:00</i></div><button class="btn primary" data-a="w-finish">${esc(t('finish'))}</button></header>
      <div class="w-body">${circuitGuide(a)}${a.info ? `<p class="cap rinfo">${esc(typeof a.info === 'object' ? a.info[L()] || a.info.en || '' : a.info)}</p>` : ''}${prepRow('warm', a, '')}${a.entries.map((en, i) => {
        const hst = exHistory(en.ex), prev = hst.length ? hst[hst.length - 1].sets : [];
        return `<section class="wex"><div class="wex-h"><button class="wex-img" data-a="ex-open" data-id="${esc(en.ex)}" data-w="${i}" aria-label="${esc(t('details'))}"><img src="${thumb(en.ex)}" alt="" decoding="async"></button><div><b>${esc(itemName(en))}</b><i>${en.target} × ${esc(en.reps)}${en.rir ? ' · RIR ' + esc(en.rir) : ''} · ${esc(t('rest'))} ${clock(en.rest)}</i></div><button class="icon-btn sm" data-a="w-tools" data-i="${i}" aria-label="${esc(t('more'))}">⋯</button></div>
          ${ui.wTools === i ? `<div class="wex-tools${ui.fx === 'tools' ? ' in' : ''}"><button class="btn sm" data-a="w-up" data-i="${i}" ${i ? '' : 'disabled'}>${IC.up}${esc(t('moveUp'))}</button><button class="btn sm" data-a="w-down" data-i="${i}" ${i < a.entries.length - 1 ? '' : 'disabled'}>${IC.down}${esc(t('moveDown'))}</button><button class="btn sm danger" data-a="w-delex" data-i="${i}">${esc(t('remove'))}</button></div>` : ''}
          ${en.note ? `<p class="hint wnote">${esc(en.note)}</p>` : ''}<p class="hint">${esc(hintFor(en, hst))}</p>
          <div class="sets"><div class="set set-hd"><span>#</span><span>${esc(t('prev'))}</span><span>kg</span><span>${esc(t('reps'))}</span><span></span></div>
          ${en.sets.map((s, j) => { const p = prev[j];
            return `<div data-i="${i}" data-j="${j}" class="set${s.done ? ' done' : ''}${ui.fx === 'pop' + i + '-' + j ? ' pop' : ''}${ui.fx === 'new' + i + '-' + j ? ' in' : ''}"><button class="set-n${s.w ? ' w' : ''}" data-a="w-warm" data-i="${i}" data-j="${j}" aria-label="${esc(t('warmToggle'))}">${s.w ? 'W' : j + 1 - en.sets.slice(0, j).filter(x => x.w).length}</button><span class="prev">${p ? (p.kg ? p.kg + '×' : '') + p.reps : '–'}</span>
              <input type="text" inputmode="decimal" data-in="w-kg" data-i="${i}" data-j="${j}" value="${esc(s.kg)}" placeholder="${p && p.kg ? p.kg : ''}" aria-label="kg" autocomplete="off" enterkeyhint="next">
              <input type="text" inputmode="numeric" data-in="w-reps" data-i="${i}" data-j="${j}" value="${esc(s.reps)}" placeholder="${p ? p.reps : ''}" aria-label="${esc(t('reps'))}" autocomplete="off" enterkeyhint="done">
              <button class="set-ok" data-a="w-check" data-i="${i}" data-j="${j}" aria-label="${esc(t('setDone'))}" aria-pressed="${s.done}">${IC.check}</button></div>`; }).join('')}</div>
          <div class="wex-f"><button class="link" data-a="w-addset" data-i="${i}">+ ${esc(t('set'))}</button>${en.sets.length > 1 ? `<button class="link mut" data-a="w-delset" data-i="${i}">− ${esc(t('set'))}</button>` : ''}</div></section>`; }).join('')}
        ${a.entries.length ? '' : `<p class="empty">${esc(t('emptyHint'))}</p>`}
        <button class="btn" data-a="w-addex">${IC.plus}${esc(t('addExercise'))}</button>${prepRow('cool', a, '')}<button class="btn danger ghost" data-a="w-cancel">${esc(t('cancelWorkout'))}</button></div>`;
    $('.w-body', el).scrollTop = y; ui.fx = ''; tick();
  }
  function finishWorkout() {
    const a = D().active; if (!a) return;
    const entries = a.entries.map(e => ({ ex: e.ex, label: e.label, sets: e.sets.filter(s => s.done && num(s.reps) > 0).map(s => ({ kg: Math.min(2000, Math.max(0, num(s.kg))), reps: Math.min(1000, Math.round(num(s.reps))), w: !!s.w })) })).filter(e => e.sets.length);
    if (!entries.length) { if (confirm(t('nothingLogged'))) { D().active = null; Store.save(); ui.wOpen = false; unwake(); render(); } return; }
    const open = a.entries.reduce((n, e) => n + e.sets.filter(s => !s.done).length, 0);
    if (open && !confirm(t('finishOpen', open))) return;
    const prs = entries.map(e => { const before = exHistory(e.ex).reduce((m, x) => Math.max(m, bestOf(x.sets)), 0), now = bestOf(e.sets); return now > before && now > 0 ? { ex: e.ex, label: e.label, v: now, was: before } : null; }).filter(Boolean);
    const w = { id: a.id, rid: a.rid, name: a.name, start: a.start, end: Date.now(), entries, warm: !!a.warm, cool: !!a.cool };
    D().workouts.push(w); D().workouts.sort((x, y) => x.start - y.start); D().active = null; Store.save(); ui.wOpen = false; unwake(); render();
    openSheet(shWorkout(w.id, prs));
  }
  function shWorkout(id, prs) {
    return () => {
      const w = D().workouts.find(x => x.id === id); if (!w) return { title: '', html: '' };
      let h = `<p class="lead">${esc(fmtDate(w.start, true))}</p><div class="kpis"><div><b>${w.tick ? IC.check : fmtDur(w.end - w.start)}</b><i>${esc(t(w.tick ? 'tickedTag' : 'duration'))}</i></div><div><b>${setsOf(w)}</b><i>${esc(t('setsWord'))}</i></div><div><b>${compact(volOf(w))}</b><i>${esc(t('volume'))} kg</i></div></div>`;
      h += prs ? prepRow('cool', w, ` data-w="${esc(w.id)}"`) : (w.warm || w.cool ? `<p class="cap">${[w.warm ? t('warmTitle') : '', w.cool ? t('coolTitle') : ''].filter(Boolean).map(x => esc(x) + ' ✓').join(' · ')}</p>` : '');
      if (prs && prs.length) h += `<div class="tip pr"><b>${esc(t('newRecords'))}</b>${prs.map(p => `<span>${esc(itemName(p))}: ${r1(p.v)} kg${p.was ? ' (' + esc(t('was')) + ' ' + r1(p.was) + ')' : ''}</span>`).join('')}</div>`;
      if (w.tick) h += `<p class="cap">${esc(t('tickedInfo'))}</p>` + (w.pl || []).map(x => `<div class="wk-ex"><button class="exrow" data-a="ex-open" data-id="${esc(x.ex)}"><img src="${thumb(x.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(exName(x.ex))}</b><i>${x.n} ${esc(t('setsWord'))}</i></span>${IC.chev}</button></div>`).join('');
      h += w.entries.map(e => `<div class="wk-ex"><button class="exrow" data-a="ex-open" data-id="${esc(e.ex)}"><img src="${thumb(e.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(itemName(e))}</b><i>${e.sets.map(s => (s.w ? 'W ' : '') + (s.kg ? s.kg + '×' : '') + s.reps).join(' · ')}</i></span>${IC.chev}</button></div>`).join('');
      const keep = w.rid ? '' : `<button class="btn" data-a="wk-to-routine" data-id="${esc(w.id)}">${esc(t('saveAsRoutine'))}</button>`;
      return { title: prs ? t('workoutDone') : w.name, html: h, foot: prs ? `<button class="btn primary" data-a="sheet-close">${esc(t('done'))}</button>${keep}` : `${keep}<button class="btn danger" data-a="wk-del" data-id="${esc(w.id)}">${esc(t('deleteWorkout'))}</button>` };
    };
  }

  /* ---------- our own database: exercises and foods the user adds ---------- */
  const picCount = () => D().myEx.reduce((n,e)=>n + +!!e.img + +!!e.endImg,0) + Object.keys(D().exMedia).filter(k => D().exMedia[k].img).length;
  const urlOk = v => /^https:\/\/[^\s"'<>]{4,300}$/.test(v);
  /* a phone photo made small enough to keep with the data: 480 px, or 340 px when that is still too heavy */
  function smallPic(file) {
    return new Promise((ok, fail) => {
      const im = new Image(), U = window.URL || window.webkitURL, url = U.createObjectURL(file);
      im.onload = () => { let out = '';
        [[480, 0.74], [340, 0.7], [260, 0.66]].some(([side, q]) => { const k = Math.min(1, side / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', q); return out.length <= 80000; });
        U.revokeObjectURL(url); if (out && out.length <= 90000) ok(out); else fail(new Error('big')); };
      im.onerror = () => { U.revokeObjectURL(url); fail(new Error('image')); };
      im.src = url;
    });
  }
  const newMyEx = e => ({id:e ? e.id : '', n:e ? e.n : '', p:e ? e.p.slice() : [], s:e ? e.s.slice() : [], eq:e ? e.eq : 'other', steps:e ? (e.phaseSteps && e.phaseSteps.length ? e.phaseSteps.slice() : ExerciseGuide.concise(e.steps)) : ['', '', ''], originalSteps:e ? (e.steps || []).slice() : [], img:e && e.img || '', endImg:e && e.endImg || '', vid:e && e.vid || ''});
  function shMyEx() {
    const fn = () => {
      const x = ui.myex, chips = k => `<div class="chips mus">${MUS_ORDER.map(m => `<button class="chip${x[k].indexOf(m) >= 0 ? ' on' : ''}" data-a="mx-mus" data-k="${k}" data-m="${m}" aria-pressed="${x[k].indexOf(m) >= 0}">${esc(mus(m))}</button>`).join('')}</div>`;
      return { title: t(x.id ? 'myExEdit' : 'myExNew'), html: `<p class="lead">${esc(t('myExLead'))}</p>
        <label class="fld"><span>${esc(t('name'))}</span><input type="text" data-in="mx-n" value="${esc(x.n)}" maxlength="80" autocomplete="off"></label>
        <p class="lbl">${esc(t('mxPrimary'))}</p>${chips('p')}<p class="lbl">${esc(t('mxSecondary'))}</p>${chips('s')}
        <label class="fld row"><span>${esc(t('equipment'))}</span><select data-in="mx-eq">${EQS.map(q => `<option value="${q}" ${x.eq === q ? 'selected' : ''}>${esc(eqp(q))}</option>`).join('')}</select></label>
        ${['guideSetup','guideMovement','guideCue'].map((key,i)=>`<label class="fld"><span>${esc(t(key))}</span><textarea data-in="mx-steps" data-index="${i}" rows="2" maxlength="220">${esc(x.steps[i] || '')}</textarea></label>`).join('')}
        <div class="own-phases">${['img','endImg'].map((key,i)=>`<div><p class="lbl">${esc(t(i ? 'artEnd' : 'artStart'))}</p>${x[key] ? `<div class="mx-pic"><img src="${esc(x[key])}" alt=""><button class="link" data-a="mx-nopic" data-key="${key}">${esc(t('remove'))}</button></div>` : ''}<label class="btn">${IC.cam}${esc(t(x[key] ? 'picChange' : 'picAdd'))}<input class="sr" type="file" accept="image/jpeg,image/png,image/webp" data-in="mx-file" data-key="${key}"></label></div>`).join('')}</div>
        ${x.id ? `<button class="btn danger" data-a="mx-del">${esc(t('myExDel'))}</button>` : ''}`, foot: `<button class="btn primary" data-a="mx-save">${esc(t('save'))}</button>` };
    };
    fn.kind = 'myex'; return fn;
  }
  function shVid(id) {
    return () => ({ title: t('vidLink'), html: `<p class="lead">${esc(t('vidLead'))}</p><form data-f="exm-vid" id="fv" data-id="${esc(id)}"><label class="fld"><span>${esc(t('vidLink'))}</span><input type="text" inputmode="url" name="vid" value="${esc((D().exMedia[id] || {}).vid || '')}" placeholder="https://" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label></form>`, foot: `<button class="btn primary" form="fv">${esc(t('save'))}</button>` });
  }
  function shMyFood() {
    return () => { const v = ui.myfood, fld = (k, lbl, mode) => `<label class="fld"><span>${esc(lbl)}</span><input type="text" inputmode="${mode}" name="${k}" value="${esc(v[k] == null || v[k] === 0 && k === 'port' ? '' : v[k])}" autocomplete="off"></label>`;
      return { title: t(v.id ? 'myFoodEdit' : 'myFoodNew'), html: `<p class="lead">${esc(t('myFoodLead'))}</p><form data-f="myfood" id="fmf"><label class="fld"><span>${esc(t('name'))}</span><input type="text" name="name" value="${esc(v.name || '')}" maxlength="80" autocomplete="off" required></label>
        <div class="grid2">${fld('kcal', t('kcal100'), 'decimal')}${fld('port', t('portionG'), 'numeric')}</div><div class="grid3">${fld('p', t('protein') + ' (g)', 'decimal')}${fld('c', t('carbs') + ' (g)', 'decimal')}${fld('f', t('fat') + ' (g)', 'decimal')}</div></form>
        ${v.id ? `<button class="btn danger" data-a="mf-del" data-id="${esc(v.id)}">${esc(t('myFoodDel'))}</button>` : ''}`, foot: `<button class="btn primary" form="fmf">${esc(t('save'))}</button>` }; };
  }
  /* A plan file: the plan's routines take the place of the built-in ones, the meal plan and rules are stored; the log is not touched. */
  function applyPlan(o) {
    return Store.apply(c => {
      if (o.plan) c.plan = o.plan;
      if (Array.isArray(o.routines) && o.routines.length) { const ids = o.routines.map(r => r && r.id); c.routines = o.routines.concat(c.routines.filter(r => !r.builtin && ids.indexOf(r.id) < 0)); }
      ['myFoods', 'myEx'].forEach(k => { if (Array.isArray(o[k])) { const ids = o[k].map(z => z && z.id); c[k] = (c[k] || []).filter(z => ids.indexOf(z.id) < 0).concat(o[k]); } });
    });
  }

  /* ---------- warm-up before and stretching after a workout ----------
     Chosen from the muscles of the workout: moving warm-up exercises before, held stretches after (both from the exercise library, so each has photos and steps). */
  const WARM = { chest: 'Dynamic_Chest_Stretch', shoulders: 'Arm_Circles', lats: 'Dynamic_Back_Stretch', 'middle back': 'Dynamic_Back_Stretch', traps: 'Shoulder_Circles', neck: 'Shoulder_Circles', biceps: 'Elbow_Circles', triceps: 'Elbow_Circles', forearms: 'Wrist_Circles',
    abdominals: 'Cat_Stretch', 'lower back': 'Cat_Stretch', quadriceps: 'Bodyweight_Squat', glutes: 'Standing_Hip_Circles', hamstrings: 'Front_Leg_Raises', calves: 'Ankle_Circles', adductors: 'Standing_Hip_Circles', abductors: 'Standing_Hip_Circles' };
  const COOL = { chest: 'Chest_And_Front_Of_Shoulder_Stretch', shoulders: 'Shoulder_Stretch', lats: 'One_Arm_Against_Wall', 'middle back': 'Upper_Back_Stretch', traps: 'Side_Neck_Stretch', neck: 'Chin_To_Chest_Stretch', biceps: 'Standing_Biceps_Stretch', triceps: 'Triceps_Stretch', forearms: 'Kneeling_Forearm_Stretch',
    abdominals: 'Standing_Lateral_Stretch', 'lower back': 'Childs_Pose', quadriceps: 'On_Your_Side_Quad_Stretch', glutes: 'Ankle_On_The_Knee', hamstrings: 'Hamstring_Stretch', calves: 'Calf_Stretch_Hands_Against_Wall', adductors: 'Side_Lying_Groin_Stretch', abductors: 'IT_Band_and_Glute_Stretch' };
  const TWO_SIDES = ['Shoulder_Stretch', 'One_Arm_Against_Wall', 'Side_Neck_Stretch', 'Triceps_Stretch', 'Standing_Lateral_Stretch', 'On_Your_Side_Quad_Stretch', 'Ankle_On_The_Knee', 'Hamstring_Stretch', 'Calf_Stretch_Hands_Against_Wall', 'Side_Lying_Groin_Stretch', 'IT_Band_and_Glute_Stretch', 'Kneeling_Hip_Flexor', 'Front_Leg_Raises', 'Standing_Hip_Circles', 'Ankle_Circles'];
  function prepList(kind, entries) {
    const score = {}; (entries || []).forEach(x => { const e = EX[x.ex]; if (!e) return; e.p.forEach(m => { score[m] = (score[m] || 0) + 1; }); e.s.forEach(m => { score[m] = (score[m] || 0) + 0.4; }); });
    const order = Object.keys(score).sort((a, b) => score[b] - score[a] || MUS_ORDER.indexOf(a) - MUS_ORDER.indexOf(b)), map = kind === 'warm' ? WARM : COOL, max = kind === 'warm' ? 5 : 6, ids = [];
    order.forEach(m => { const id = map[m]; if (id && EX[id] && ids.indexOf(id) < 0 && ids.length < max) ids.push(id); });
    if (kind === 'cool' && score.quadriceps >= 1 && EX.Kneeling_Hip_Flexor && ids.indexOf('Kneeling_Hip_Flexor') < 0) ids.push('Kneeling_Hip_Flexor');      // leg work shortens the hip flexors too
    const one = kind === 'warm' ? 20 : (D().settings.hold || 30);
    return ids.map(id => { const sides = TWO_SIDES.indexOf(id) >= 0 ? 2 : 1; return { id, sides, sec: one * sides }; });
  }
  const prepMin = list => Math.max(1, Math.round(list.reduce((a, x) => a + x.sec, 0) / 60));
  /* the row that opens the warm-up or the stretching: src is the running workout, a finished one or a routine */
  function prepRow(kind, src, attr) {
    if (!D().settings.stretch) return '';
    const list = prepList(kind, src.entries); if (!list.length) return '';
    const done = src[kind] === true;
    return `<button class="qrow prep${done ? ' done' : ''}" data-a="prep" data-k="${kind}"${attr}><span class="q-ic line">${done ? IC.check : kind === 'warm' ? IC.walk : IC.stretch}</span><span class="rc-t"><b>${esc(t(kind === 'warm' ? 'warmTitle' : 'coolTitle'))}</b><i>${list.length} ${esc(t('moves'))} · ~${prepMin(list)} ${esc(t('min'))}${done ? ' · ' + esc(t('doneWord')) : ''}</i></span>${IC.chev}</button>`;
  }
  function shPrep() {
    const fn = () => {
      const p = ui.prep, left = p.i >= 0 && p.i < p.list.length ? (p.run ? (p.end - Date.now()) / 1000 : p.left / 1000) : 0;
      const rows = p.list.map((x, i) => { const ok = p.fin || i < p.i, cur = i === p.i && !p.fin;
        return `<div class="exrow preprow${cur ? ' cur' : ''}${ok ? ' ok' : ''}" data-i="${i}"><button class="pk-img" data-a="ex-open" data-id="${esc(x.id)}" aria-label="${esc(t('details'))}"><img src="${thumb(x.id)}" alt="" loading="lazy" decoding="async"></button><div class="pp-t"><b>${esc(exName(x.id))}</b><i>${esc(x.sides > 1 ? t('perSide', x.sec / 2) : t('secs', x.sec))}</i></div><em class="pp-n">${cur ? `<b id="prep-time">${clock(left)}</b>` : ok ? IC.check : ''}</em></div>`; }).join('');
      return { title: t(p.kind === 'warm' ? 'warmTitle' : 'coolTitle'), html: `<p class="lead">${esc(t(p.kind === 'warm' ? 'warmLead' : 'coolLead', D().settings.hold))}</p><div class="exlist">${rows}</div><p class="cap">${esc(t('prepCap'))}</p>`,
        foot: p.fin ? `<button class="btn primary" data-a="prep-done">${esc(t('done'))}</button>`
          : p.i < 0 ? `<button class="btn primary wide" data-a="prep-go">${IC.play}${esc(t('prepStart'))}</button><button class="btn" data-a="prep-done">${esc(t('prepMark'))}</button>`
          : `<button class="btn primary" data-a="prep-pause">${esc(t(p.run ? 'pause' : 'resume'))}</button><button class="btn" data-a="prep-next">${esc(t('skip'))}</button>` };
    };
    fn.kind = 'prep'; return fn;
  }
  function chirp(n) {
    if (D().settings.sound && actx) { for (let k = 0; k < (n || 1); k++) { try { const o = actx.createOscillator(), g = actx.createGain(), s0 = actx.currentTime + k * 0.2; o.frequency.value = n > 1 ? 660 : 880; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(0.0001, s0); g.gain.exponentialRampToValueAtTime(0.35, s0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s0 + 0.15); o.start(s0); o.stop(s0 + 0.17); } catch (e) {} } }
    if (D().settings.vibrate && navigator.vibrate) navigator.vibrate(n > 1 ? [80, 60, 80] : 90);
  }
  function prepMark() {                                                                // remember that it was done: on the running workout or on the finished one
    const p = ui.prep, d = D(); if (!p) return;
    if (p.live && d.active) { d.active[p.kind] = true; Store.saveActive(); renderWorkout(); }
    else if (p.wid) { const w = d.workouts.find(x => x.id === p.wid); if (w && !w[p.kind]) { w[p.kind] = true; Store.save(); } }
  }
  function prepStep(i) {
    const p = ui.prep; if (!p) return;
    if (i >= p.list.length) { p.i = p.list.length; p.run = false; p.fin = true; chirp(1); prepMark(); if (!(D().active && ui.wOpen)) unwake(); if (topIs('prep')) refreshSheet(); return; }
    p.i = i; p.end = Date.now() + p.list[i].sec * 1000; p.half = p.list[i].sides > 1; p.run = true;
    if (topIs('prep')) { refreshSheet(); const row = $('#sheet .preprow.cur'); if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' }); }
  }
  function prepTick() {
    const p = ui.prep; if (!p || !p.run) return;
    if (!topIs('prep')) { p.left = Math.max(0, p.end - Date.now()); p.run = false; if (!(D().active && ui.wOpen)) unwake(); return; }      // panel closed or covered: the clock waits
    const left = (p.end - Date.now()) / 1000, x = p.list[p.i];
    if (p.half && left <= x.sec / 2) { p.half = false; chirp(2); toast(t('otherSide')); }
    if (left <= 0) { if (p.i + 1 < p.list.length) chirp(1); prepStep(p.i + 1); return; }
    const el = $('#prep-time'); if (el) el.textContent = clock(left);
  }

  /* ---------- rest timer, clock, sound, wake lock ---------- */
  let actx = null, lock = null;
  function audio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
  function beep() {
    if (!D().settings.sound || !actx) return;
    [0, 0.22, 0.44].forEach(d => { try { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination); const s = actx.currentTime + d; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.4, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16); o.start(s); o.stop(s + 0.18); } catch (e) {} });
    if (D().settings.vibrate && navigator.vibrate) navigator.vibrate([120, 80, 120]);
  }
  async function wake() { try { if (D().settings.awake && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch (e) {} }
  function unwake() { try { if (lock) lock.release(); } catch (e) {} lock = null; }
  function startRest(sec) { const a = D().active; if (!a || !D().settings.restAuto || !sec) return; a.restEnd = Date.now() + sec * 1000; a.restTotal = sec; Store.saveActive(); tick(); }
  function dayCheck() { const d = today(); if (d !== ui.day) { if (ui.foodDate === ui.day) ui.foodDate = d; if (ui.habitDate === ui.day) { if (ui.habitMonth === ui.day.slice(0, 7)) ui.habitMonth = d.slice(0, 7); ui.habitDate = d; } ui.day = d; if (!ui.sheets.length && !ui.wOpen) rerender(); } }
  function tick() {
    dayCheck();
    prepTick();
    const a = D().active, bar = $('#restbar'), el = $('#w-el');
    if (a && el) el.textContent = clock((Date.now() - a.start) / 1000);
    if (!a || !a.restEnd) { bar.hidden = true; return; }
    const left = (a.restEnd - Date.now()) / 1000;
    if (left <= 0) { a.restEnd = 0; Store.saveActive(); bar.hidden = true; beep(); toast(t('restOver')); return; }
    bar.hidden = false;
    $('#rb-time').textContent = clock(left); $('#rb-fill').style.transform = 'scaleX(' + Math.max(0, Math.min(1, 1 - left / a.restTotal)).toFixed(4) + ')';
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
      const rc = D().recentFoods, fld = (k, lbl, mode, v) => `<label class="fld"><span>${esc(lbl)}</span><input type="text" inputmode="${mode}" name="${k}" value="${esc(v == null ? '' : v)}" ${ui.manual && ui.manual.requireMacros && k !== 'g' ? 'required' : ''} autocomplete="off"></label>`;
      const v = ui.manual || {};
      return { title: t('foodOwn'), html: `${rc.length ? `<p class="cap">${esc(t('recent'))}</p><div class="chips">${rc.map((r, i) => `<button class="chip" data-a="food-recent" data-i="${i}">${esc(r.name)}</button>`).join('')}</div>` : ''}
        ${v.requireMacros ? `<p class="cap">${esc(t('recipeMissing'))}</p>` : ''}<form data-f="food-manual" id="fm"><label class="fld"><span>${esc(t('name'))}</span><input type="text" name="name" value="${esc(v.name || '')}" autocomplete="off" required></label>
        <div class="grid2">${fld('g', t('grams'), 'numeric', v.g || '')}${fld('kcal', 'kcal', 'numeric', v.kcal)}</div><div class="grid3">${fld('p', t('protein') + ' (g)', 'decimal', v.p)}${fld('c', t('carbs') + ' (g)', 'decimal', v.c)}${fld('f', t('fat') + ' (g)', 'decimal', v.f)}</div>
        <label class="sw"><input type="checkbox" name="keep"><span>${esc(t('myFoodKeep'))}</span></label></form>`,
        foot: `<button class="btn primary" form="fm">${esc(t('addToDiary'))}</button>` };
    };
  }
  const aiNew = (mode, text) => ({ mode, imgs: [], hint: '', text: text || '', loading: false, res: null, err: null, gone: [], qa: [] });
  const AI_CHIPS = ['aiChip1', 'aiChip2', 'aiChip3', 'aiChip4', 'aiChip5', 'aiChip6', 'aiChip7', 'aiChip8'];
  function shFoodAI() {
    return () => {
      const s = ui.ai, st = D().settings, bad = st.keyState === 'bad', key = st.apiKey && !bad;
      const shots = edit => s.imgs.length ? `<div class="ai-shots${s.imgs.length < 2 ? ' one' : ''}">${s.imgs.map((x, i) => `<div class="ai-shot"><img class="ai-prev${edit ? '' : ' sm'}" src="${x.url}" alt="${esc(t('yourPhoto'))}">${edit ? `<button class="icon-btn sm" data-a="ai-rm" data-i="${i}" aria-label="${esc(t('removePhoto'))}">${IC.close}</button>` : ''}</div>`).join('')}</div>` : '';
      let h = '';
      if (!key) h += `<button class="note warn" data-a="settings"><b>${esc(t(bad ? 'keyBad' : 'needKey'))}</b><span>${esc(t(bad ? 'keyBadSub' : 'needKeySub'))}</span></button>`;
      if (s.res) {
        const tot = s.res.items.reduce((a, i) => a + num(i.kcal), 0), q = s.res.question && (s.qa || []).length < 2 ? s.res.question : null;
        h += `${shots(false)}<p class="lead"><span class="chip on">${esc(t('conf_' + s.res.confidence))}</span> ${esc(s.res.notes)}</p>`;
        if (q && s.res.items.length) h += `<div class="note ask"><b>${esc(q.text)}</b><div class="chips">${q.options.map(o => `<button class="chip" data-a="ai-answer" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><span>${esc(t('aiAskCap'))}</span></div>`;
        h += s.res.items.length ? s.res.items.map((it, i) => `<div class="ai-item"><div class="re-top"><input type="text" data-in="ai-f" data-k="name" data-i="${i}" value="${esc(it.name)}" aria-label="${esc(t('name'))}"><button class="icon-btn sm" data-a="ai-del" data-i="${i}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>
          <div class="grid5">${[['grams', 'g'], ['kcal', 'kcal'], ['p', t('pShort')], ['c', t('cShort')], ['f', t('fShort')]].map(([k, l]) => `<label><span>${esc(l)}</span><input type="text" inputmode="decimal" data-in="ai-f" data-k="${k}" data-i="${i}" value="${it[k]}"></label>`).join('')}</div>
          ${it.basis ? `<p class="ai-basis">${esc(it.basis)}</p>` : ''}${it.gmin && it.gmax ? `<div class="chips ai-range"><button class="chip${it.grams === it.gmin ? ' on' : ''}" data-a="ai-g" data-i="${i}" data-g="${it.gmin}">${esc(t('aiLess'))} · ${it.gmin} g</button><button class="chip${it.grams === it.gmax ? ' on' : ''}" data-a="ai-g" data-i="${i}" data-g="${it.gmax}">${esc(t('aiMore'))} · ${it.gmax} g</button></div>` : ''}
          ${it.label ? `<i class="ai-db">${IC.check}${esc(t('aiLabel'))}</i>` : it.db ? `<i class="ai-db">${IC.check}${esc(t('aiDb'))}</i>` : ''}</div>`).join('') : `<p class="empty">${esc(t('aiNoFood'))}</p>`;
        h += `<p class="cap">${esc(t('aiCheck'))}${s.used ? ' ' + esc(t('aiUsedNotes', s.used)) : ''}</p>`;
        return { title: t('aiResult'), html: h, foot: (s.res.items.length ? `<button class="btn primary wide" data-a="ai-add"><span class="one">${esc(t('add'))} · <span id="ai-tot">${Math.round(tot)}</span> kcal</span></button>` : '') + `<button class="btn" data-a="ai-reset">${esc(t('again'))}</button>` };
      }
      if (s.loading) return { title: t('analyzing'), html: `${shots(false)}<p class="empty spin">${esc(t('analyzingSub'))}</p>` };
      if (s.err && !(bad && s.err.code === 'auth')) h += `<div class="note warn"><b>${esc(t('err_' + s.err.code))}</b>${s.err.msg ? `<span>${esc(s.err.msg)}</span>` : ''}</div>`;
      const picked = s.hint.split(',').map(x => x.trim());
      const chips = `<div class="chips ai-chips">${AI_CHIPS.map(k => `<button class="chip${picked.indexOf(t(k)) >= 0 ? ' on' : ''}" data-a="ai-chip" data-v="${esc(t(k))}" aria-pressed="${picked.indexOf(t(k)) >= 0}">${esc(t(k))}</button>`).join('')}</div>`;
      if (s.mode === 'photo') {
        const warn = s.imgs.some(x => x.warn === 'dark') ? 'aiDark' : s.imgs.some(x => x.warn === 'small') ? 'aiSmall' : '';
        h += s.imgs.length ? `${shots(true)}${warn ? `<div class="note warn"><b>${esc(t(warn))}</b></div>` : ''}${s.imgs.length < 2 ? `<label class="btn">${IC.plus}${esc(t('aiSecond'))}<input class="sr" type="file" accept="image/*" data-in="ai-file"></label><p class="cap">${esc(t('aiSecondCap'))}</p>` : ''}<label class="fld"><span>${esc(t('aiHint'))}</span><input type="text" data-in="ai-hint" value="${esc(s.hint)}" placeholder="${esc(t('aiHintPh'))}" autocomplete="off"></label>${chips}`
          : `<p class="lead">${esc(t('aiPhotoLead'))}</p><div class="row2"><label class="btn primary big">${IC.cam}${esc(t('takePhoto'))}<input class="sr" type="file" accept="image/*" capture="environment" data-in="ai-file"></label><label class="btn big">${esc(t('fromGallery'))}<input class="sr" type="file" accept="image/*" data-in="ai-file"></label></div><p class="cap">${esc(t('aiTips'))}</p><p class="cap">${esc(t('aiLabelTip'))}</p>`;
      } else h += `<label class="fld"><span>${esc(t('describeLbl'))}</span><textarea rows="4" data-in="ai-text" placeholder="${esc(t('describePh'))}">${esc(s.text)}</textarea></label>`;
      const ready = s.mode === 'photo' ? s.imgs.length > 0 : true;
      return { title: s.mode === 'photo' ? t('scanPhoto') : t('describe'), html: h, foot: ready ? `<button class="btn primary" data-a="ai-go" ${key ? '' : 'disabled'}>${esc(t('analyze'))}</button>${s.imgs.length ? `<button class="btn" data-a="ai-reset">${esc(t('otherPhoto'))}</button>` : ''}` : '' };
    };
  }
  /* The model itself never learns from use. What the app can do: remember how the user corrected earlier estimates and send that along with every new request. */
  function aiMemo() {
    const ns = D().aiNotes.slice(-25); if (!ns.length) return '';
    const q = v => String(v).replace(/["\\\n\r]/g, ' ').trim();
    const parts = ns.map(m => {
      if (m.x) return '"' + q(m.n) + '": you listed it, but it was not part of the meal';
      const a = []; if (m.n2) a.push('it was really "' + q(m.n2) + '"'); if (m.gu) a.push('you estimated ' + m.ga + ' g, the real amount was ' + m.gu + ' g'); if (m.ku) a.push('you gave ' + m.ka + ' kcal per 100 g, the real value was ' + m.ku);
      return '"' + q(m.n) + '": ' + a.join('; ');
    });
    const rs = ns.filter(m => m.ga > 0 && m.gu > 0).map(m => m.gu / m.ga); let bias = '';
    if (rs.length >= 3) { const g = Math.exp(rs.reduce((a, r) => a + Math.log(r), 0) / rs.length); if (Math.abs(g - 1) >= 0.08) bias = ' Across these corrections the real portions were on average ' + Math.round(Math.abs(g - 1) * 100) + '% ' + (g > 1 ? 'larger' : 'smaller') + ' than your estimates, so shift your portion estimates for this user the same way.'; }
    return ('Calibration from corrections this same user made to your earlier estimates (their plates, their usual portions). Apply them when the same or a similar food appears: ' + parts.join(' | ') + '.' + bias).slice(0, 2600);
  }
  /* Cross-check: when the food database has an entry under the name the model gave and its energy agrees within 15%, the measured values replace the model's. */
  function dbCheck(it) {
    const toks = norm(it.en || '').split(/[\s,]+/).filter(Boolean); if (toks.length < 1 || !(it.k100 > 0)) return;
    let hits = []; for (let k = toks.length; k >= Math.min(2, toks.length) && !hits.length; k--) hits = foodSearch(toks.slice(0, k).join(' '), true).slice(0, 4);
    let best = null;
    if (it.label) return;                                                             // read from the product's own label: nothing to check it against
    hits.forEach(x => { const r = FOODS.list[x.i], df = Math.abs(r[1] - it.k100) / Math.max(r[1], it.k100, 1); if (df <= 0.15 && (!best || df < best.df)) best = { r, df }; });
    if (best) { it.k100 = best.r[1]; it.p100 = best.r[2]; it.c100 = best.r[3]; it.f100 = best.r[4]; it.db = best.r[0]; FoodAI.total(it); }
  }
  function aiLearn(s) {
    const d = D(), now = Date.now(), per = it => it.grams > 0 ? it.kcal / it.grams * 100 : 0; let k = 0;
    s.res.items.forEach(it => {
      const b = it._b; if (!b) return;
      const gCh = b.grams > 0 && it.grams > 0 && Math.abs(it.grams - b.grams) / b.grams >= 0.15, kCh = b.k100 > 0 && per(it) > 0 && Math.abs(per(it) - b.k100) / b.k100 >= 0.15, nCh = norm(it.name).trim() !== norm(b.name).trim() && !!it.name.trim();
      if (gCh || kCh || nCh) { d.aiNotes.push({ n: (it.en || b.name).slice(0, 80), n2: nCh ? it.name.trim().slice(0, 80) : '', ga: gCh ? b.grams : 0, gu: gCh ? Math.round(it.grams) : 0, ka: kCh ? Math.round(b.k100) : 0, ku: kCh ? Math.round(per(it)) : 0, x: false, t: now }); k++; }
    });
    if (s.mode === 'photo') (s.gone || []).forEach(nm => { d.aiNotes.push({ n: String(nm).slice(0, 80), n2: '', ga: 0, gu: 0, ka: 0, ku: 0, x: true, t: now }); k++; });
    d.aiNotes = d.aiNotes.slice(-60); return k;
  }
  /* remember what the API said about the saved key: a rejected key brings the key field back in Settings */
  function keyResult(state) { const st = D().settings; if (st.apiKey && st.keyState !== state) { st.keyState = state; Store.save(); } }
  async function checkSavedKey() {
    const st = D().settings, k = st.apiKey; if (!k || st.keyState || !FoodAI.check) return;
    const r = await FoodAI.check(k); if (D().settings.apiKey !== k || (r !== 'ok' && r !== 'bad')) return;
    keyResult(r); if (topIs('settings')) refreshSheet();
  }
  async function aiGo() {
    const s = ui.ai, st = D().settings;
    if (s.mode === 'text' && !s.text.trim()) { toast(t('describePh')); return; }
    s.loading = true; s.err = null; refreshSheet();
    try {
      const memo = aiMemo();
      const qa = (s.qa || []).join('. '), photo = s.mode === 'photo';                 // answers given to the model's own questions go back in as extra information
      const r = await FoodAI.analyze(st.apiKey, photo && st.photoModel ? st.photoModel : st.model, { images: photo ? s.imgs.map(x => x.b64) : [], text: s.text, lang: L(), hint: [photo ? s.hint : '', qa].filter(Boolean).join('. '), notes: memo });
      r.items.forEach(i => { dbCheck(i); i._b = { name: i.name, grams: i.grams, k100: i.k100 }; });       // _b: what the estimate was before the user touched it
      s.res = r; s.used = memo ? Math.min(25, D().aiNotes.length) : 0; s.gone = []; keyResult('ok');
    } catch (e) { s.err = { code: e.code || 'api', msg: e.code === 'api' || e.code === 'model' ? e.message : '' }; if (e.code === 'auth') keyResult('bad'); }
    s.loading = false; if (ui.ai === s && ui.sheets.length) refreshSheet();
  }
  const ACT = [[1.2, 'act1'], [1.375, 'act2'], [1.55, 'act3'], [1.725, 'act4'], [1.9, 'act5']];
  /* Mifflin-St Jeor resting energy x activity factor, then the goal. Checked against hand-calculated cases in the tests.
     Guards: values outside a plausible range give no result; no deficit under 18; a deficit never goes below 1500 kcal (men) / 1200 kcal (women);
     protein and fat per kg count at most the weight at BMI 27, so they do not run away at a high body weight. */
  function calcTargets(p) {
    const w = num(p.weight), hgt = num(p.height), a = num(p.age); if (!w || !hgt || !a) return null;
    if (a < 14 || a > 100 || hgt < 120 || hgt > 230 || w < 30 || w > 300) return { bad: true };
    const act = [1.2, 1.375, 1.55, 1.725, 1.9].indexOf(+p.activity) >= 0 ? +p.activity : 1.55;
    const bmr = 10 * w + 6.25 * hgt - 5 * a + (p.sex === 'm' ? 5 : -161), tdee = bmr * act, m2 = (hgt / 100) * (hgt / 100);
    const goal = ['cut', 'maintain', 'bulk'].indexOf(p.goal) < 0 ? 'maintain' : a < 18 && p.goal === 'cut' ? 'maintain' : p.goal, floor = p.sex === 'm' ? 1500 : 1200;
    let kcal = Math.round(tdee * (1 + { cut: -0.18, maintain: 0, bulk: 0.1 }[goal]) / 10) * 10, floored = false;
    if (goal === 'cut' && kcal < floor) { kcal = Math.min(floor, Math.round(tdee / 10) * 10); floored = true; }
    const ref = Math.min(w, 27 * m2);
    const pr = Math.round(ref * (goal === 'cut' ? 2.0 : 1.8)), fat = Math.round(Math.max(ref * 0.8, kcal * 0.25 / 9));
    return { bmr: Math.round(bmr / 10) * 10, tdee: Math.round(tdee / 10) * 10, kcal, p: pr, c: Math.max(0, Math.round((kcal - pr * 4 - fat * 9) / 4)), f: fat, bmi: Math.round(w / m2 * 10) / 10, goal, floored, floor, minor: a < 18 && p.goal === 'cut' };
  }
  const tgOut = (c, p) => !c ? `<p class="empty">${esc(t('fillProfile'))}</p>` : c.bad ? `<p class="empty">${esc(t('tgRange'))}</p>`
    : `<div class="kpis"><div><b>${c.bmr}</b><i>${esc(t('bmr'))}</i></div><div><b>${c.tdee}</b><i>${esc(t('tdee'))}</i></div><div class="hl"><b>${c.kcal}</b><i>${esc(t('tg_' + c.goal))}</i></div></div><p class="cap">BMI ${dec(c.bmi)}${c.floored ? ' · ' + esc(t('tgFloor', c.floor)) : ''}${c.minor ? ' · ' + esc(t('tgMinor')) : ''}</p>`;
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
        <div id="tg-out">${tgOut(calcTargets(p), p)}</div><h3>${esc(t('dailyTargets'))}</h3><div class="grid2">${out('kcal')}${out('p')}</div><div class="grid2">${out('c')}${out('f')}</div><p class="cap">${esc(t('targetsCap'))}</p>`,
        foot: `<button class="btn primary" data-a="tg-save">${esc(t('save'))}</button>` };
    };
  }

  /* ================= SETTINGS ================= */
  const MODEL_NAMES = { 'claude-haiku-4-5-20251001': 'Claude Haiku 4.5', 'claude-sonnet-5-5': 'Claude Sonnet 5.5', 'claude-opus-5-5': 'Claude Opus 5.5' };
  const MODELS = Store.MODELS.map(m => [m, MODEL_NAMES[m] || m]);
  function aiCard(s) {
    const nn = D().aiNotes.length;
    const model = `<label class="fld"><span>${esc(t('model'))}</span><select data-in="set-model">${MODELS.map(([v, n]) => `<option value="${v}" ${s.model === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="fld"><span>${esc(t('photoModel'))}</span><select data-in="set-photo-model"><option value="">${esc(t('sameModel'))}</option>${MODELS.map(([v, n]) => `<option value="${v}" ${s.photoModel === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <p class="cap" id="ai-learn">${esc(nn ? t('aiLearnN', nn) : t('aiLearn0'))}</p>${nn ? `<button class="link mut" data-a="ai-forget">${esc(t('aiForget'))}</button>` : ''}`;
    if (s.apiKey && s.keyState !== 'bad')                                    // a key is saved and nothing says it is wrong: no key field at all
      return `<p class="ai-on${s.keyState === 'ok' ? '' : ' wait'}">${IC.check}<span><b>${esc(t(s.keyState === 'ok' ? 'aiOn' : 'aiSaved'))}</b><i>${esc(t(s.keyState === 'ok' ? 'aiOnSub' : 'aiSavedSub'))}</i></span></p>${model}<button class="link mut" data-a="key-remove">${esc(t('keyRemove'))}</button>`;
    return (s.keyState === 'bad' ? `<div class="note warn"><b>${esc(t('keyBad'))}</b><span>${esc(t('keyBadNew'))}</span></div>` : '') +
      `<p class="cap">${esc(t('aiExplain'))}</p><label class="fld"><span>${esc(t('apiKey'))}</span><input type="password" data-in="key-draft" value="${esc(ui.keyDraft || '')}" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${ui.keyBusy ? 'disabled' : ''}></label>
      <button class="btn primary${ui.keyBusy ? ' busy' : ''}" data-a="key-save" ${ui.keyBusy || !(ui.keyDraft || '').trim() ? 'disabled' : ''}>${esc(t(ui.keyBusy ? 'keyChecking' : 'keySave'))}</button>`;
  }
  function shSettings() {
    const fn = shSettingsBody(); fn.kind = 'settings'; return fn;
  }
  /* accent colour from a place on the colour scale: same lightness for every hue (OKLCH), as vivid as the screen can show */
  function hueRGB(h, L) {
    L = L || 0.82;
    const conv = C => { const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180), l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
      return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]; };
    let C = 0.2, lin = conv(C); while (C > 0.02 && lin.some(v => v < -0.0005 || v > 1.0005)) { C -= 0.01; lin = conv(C); }
    return lin.map(v => { v = Math.min(1, Math.max(0, v)); return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255); });
  }
  const DEF_HUE = 121;                                                                 // where the app's own yellow-green sits on the scale
  function applyLook() {
    const s = D().settings, e = document.documentElement;
    const light = s.bg === 'light', hue = s.hue == null ? DEF_HUE : s.hue;
    if (s.hue == null && !light) ['--acc', '--acc-rgb', '--acc-ink', '--acc-tx'].forEach(k => e.style.removeProperty(k));
    else {
      const c = hueRGB(hue, light ? 0.74 : 0.82);                                    // on the bright background the fill is a little deeper, and accent-coloured text much darker, so both stay readable
      e.style.setProperty('--acc', 'rgb(' + c.join(',') + ')'); e.style.setProperty('--acc-rgb', c.join(',')); e.style.setProperty('--acc-ink', '#0c0e12');
      if (light) e.style.setProperty('--acc-tx', 'rgb(' + hueRGB(hue, 0.45).join(',') + ')'); else e.style.removeProperty('--acc-tx');
    }
    e.dataset.bg = s.bg;
    const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', light ? '#eef0f5' : '#0e0f11');
    if (s.calm) e.dataset.calm = '1'; else delete e.dataset.calm;
    if (s.solid) e.dataset.solid = '1'; else delete e.dataset.solid;
  }
  function shSettingsBody() {
    return () => {
      const s = D().settings, kb = Math.round(Store.bytes() / 1024);
      const sw = (k, lbl, attr) => `<label class="sw"><input type="checkbox" ${attr || `data-in="set-flag" data-k="${k}"`} ${s[k] ? 'checked' : ''}><span>${esc(lbl)}</span></label>`;
      const sel = (k, lbl, opts) => `<label class="fld row"><span>${esc(lbl)}</span><select data-in="set-num" data-k="${k}">${opts.map(([v, n]) => `<option value="${v}" ${+s[k] === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
      const seg = (a, cur, opts) => `<div class="seg">${opts.map(([v, n]) => `<button class="${cur === v ? 'on' : ''}" data-a="${a}" data-v="${v}">${esc(n)}</button>`).join('')}</div>`;
      const cs = CL && CL.user ? CL.state : null, when = cs && cs.at ? new Date(cs.at).toLocaleString(L() === 'hu' ? 'hu-HU' : 'en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const account = !cs ? '' : `<section class="card"><h3>${esc(t('account'))}</h3><p class="ai-on${cs.err ? ' wait' : ''}">${IC.check}<span><b>${esc(CL.user.email)}</b><i id="sync-st">${esc(cs.err ? t('syncErr') + ' ' + t('ac_' + (I18N.en['ac_' + cs.err] ? cs.err : 'api')) : when ? t('syncedAt', when) : t('syncNever'))}</i></span></p>
          ${sw('syncKey', t('setSyncKey'))}<div class="row2"><button class="btn" data-a="sync-now">${esc(t('syncNow'))}</button><button class="btn" data-a="sign-out">${esc(t('signOut'))}</button></div><p class="cap">${esc(t('accountCap'))}</p></section>`;
      const accOff = cs || CL ? '' : `<section class="card"><h3>${esc(t('account'))}</h3><p class="cap">${esc(t('accOff'))}</p><button class="btn" data-a="acc-help">${esc(t('accHelp'))}</button></section>`;
      return { title: t('settings'), html: `${account}${accOff}<section class="card"><h3>${esc(t('appearance'))}</h3><p class="lbl">${esc(t('language'))}</p>${seg('lang', L(), [['hu', 'Magyar'], ['en', 'English']])}
          <p class="lbl">${esc(t('accent'))}</p><div class="hue"><input type="range" min="0" max="359" step="1" value="${s.hue == null ? DEF_HUE : s.hue}" data-in="set-hue" aria-label="${esc(t('accent'))}" style="background:linear-gradient(90deg,${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 359].map(h => 'rgb(' + hueRGB(h).join(',') + ')').join(',')})"></div>
          ${s.hue == null ? '' : `<button class="link mut" data-a="hue-reset">${esc(t('hueReset'))}</button>`}
          <p class="lbl">${esc(t('background'))}</p>${seg('set-bg', s.bg, (Store.BGS || ['aurora']).map(b => [b, t('bg_' + b)]))}
          ${sw('calm', t('setCalm'))}${sw('solid', t('setSolid'))}</section>
        <section class="card"><h3>${esc(t('workout'))}</h3>${sw('restAuto', t('restAuto'), 'data-in="set-rest"')}${sw('sound', t('restSound'), 'data-in="set-sound"')}${'vibrate' in navigator ? sw('vibrate', t('setVibrate')) : ''}${sw('awake', t('setAwake'))}${sw('autofill', t('setAutofill'))}
          ${sw('stretch', t('setStretch'))}${s.stretch ? sel('hold', t('holdLbl'), [20, 30, 45].map(v => [v, v + ' ' + t('secShort')])) : ''}
          ${sel('restDefault', t('restDefault'), [60, 90, 120, 150, 180].map(v => [v, clock(v)]))}${sel('weekGoal', t('weekGoal'), [[0, t('goalOff')]].concat([2, 3, 4, 5, 6, 7].map(v => [v, v + ' ' + t('times')])))}${sel('weekStart', t('weekStartLbl'), [[1, t('monday')], [0, t('sunday')]])}
          <button class="link" data-a="reset-routines">${esc(t('resetRoutines'))}</button></section>
        <section class="card"><h3>${esc(t('aiTitle'))}</h3>${aiCard(s)}${sw('coach', t('setCoach'))}</section>
        <section class="card"><h3>${esc(t('nutrition'))}</h3>${sw('addActive', t('setAddActive'))}<button class="btn" data-a="targets">${esc(s.targets ? t('editTargets') : t('setTargets'))}</button></section>
        ${D().plan ? `<section class="card"><h3>${esc(t('planCard'))}</h3><p class="cap">${esc(D().plan.name || t('mealPlan'))}</p>${sw('', t('planUseTg'), `data-in="plan-tg"${D().plan.targets ? ' checked' : ''}`)}<button class="btn" data-a="plan-notes">${esc(t('planRules'))}</button><button class="btn danger" data-a="plan-remove">${esc(t('planRemove'))}</button></section>` : ''}
        <section class="card"><h3>${esc(t('myDb'))}</h3><p class="cap">${esc(t('myDbCap', D().myEx.length, D().myFoods.length))}</p><div class="row2"><button class="btn" data-a="mx-new">${IC.plus}${esc(t('myExBtn'))}</button><button class="btn" data-a="mf-new">${IC.plus}${esc(t('myFoodBtn'))}</button></div></section>
        <section class="card"><h3>${esc(t('data'))}</h3><p class="cap">${esc(t(cs ? 'dataExplainCloud' : 'dataExplain'))} ${kb} kB.</p><div class="row2"><button class="btn" data-a="export">${esc(t('export'))}</button><label class="btn">${esc(t('import'))}<input class="sr" type="file" accept="application/json,.json" data-in="import"></label></div><p class="cap">${esc(t('planHint'))}</p>
          <button class="btn" data-a="export-csv">${esc(t('exportCsv'))}</button><button class="btn danger" data-a="wipe">${esc(t('wipe'))}</button></section>
        <section class="card"><h3>${esc(t('appCard'))}</h3><p class="cap">${esc(t('appName'))} ${esc(releaseText())} · ${window.EXERCISES.length} ${esc(t('exercises'))} · ${FOODS.list.length} ${esc(t('foodsWord'))}</p><button class="btn" data-a="update-now" ${ui.updateBusy ? 'disabled' : ''} aria-describedby="update-status">${esc(t(ui.updateBusy ? 'updating' : 'updateNow'))}</button><p id="update-status" class="cap update-status" role="status" aria-live="polite">${ui.updateStatus ? esc(updateStatusText()) : ''}</p>
          <details class="more"><summary>${esc(t('about'))}</summary><p class="cap">${esc(t('aboutText'))}</p></details></section>` };
    };
  }
  /* shown only from the note an iPhone user sees in Safari before the app is on the Home Screen */
  function shInstall() { return () => ({ title: t('installTitle'), html: `<ol class="steps">${[1, 2, 3, 4].map(i => `<li>${esc(t('install' + i))}</li>`).join('')}</ol>` }); }
  function shAccHelp() { return () => ({ title: t('account'), html: `<p class="lead">${esc(t('accHelpLead'))}</p><ol class="steps">${[1, 2, 3, 4, 5].map(i => `<li>${esc(t('accStep' + i))}</li>`).join('')}</ol><p class="cap">${esc(t('accHelpCap'))}</p>` }); }
  async function saveFile(name, blob) {
    try { const f = new File([blob], name, { type: blob.type }); if (isIOS && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast(t('exported'));
  }
  function exportCSV() {
    const rows = [['date', 'workout', 'exercise', 'set', 'kg', 'reps', 'warmup']];
    D().workouts.forEach(w => w.entries.forEach(e => e.sets.forEach((x, j) => rows.push([ymd(w.start), w.name, itemName(e), j + 1, x.kg, x.reps, x.w ? 1 : 0]))));
    const cell = v => { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };     // a name can never be read as a formula by a spreadsheet
    saveFile('tungsten-workouts-' + today() + '.csv', new Blob(['\ufeff' + rows.map(r => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv' }));
  }
  function exportData() { saveFile('tungsten-backup-' + today() + '.json', new Blob([Store.exportJSON()], { type: 'application/json' })); }

  /* ================= CALENDAR, DAY, ACTIVITY ================= */
  function shCal() {
    const fn = () => {
      const c = ui.cal, d = D(), first = new Date(c.y, c.m, 1), days = new Date(c.y, c.m + 1, 0).getDate(), td = today(), loc = L() === 'hu' ? 'hu-HU' : 'en-GB';
      const off = (first.getDay() + 7 - (d.settings.weekStart === 0 ? 0 : 1)) % 7, now = new Date(), pre = c.y + '-' + pad(c.m + 1) + '-';
      const wd = {}; let cnt = 0; d.workouts.forEach(w => { const k = ymd(w.start); wd[k] = 1; if (k.indexOf(pre) === 0) cnt++; });
      const names = [0, 1, 2, 3, 4, 5, 6].map(i => { const x = new Date(weekStart(Date.now())); x.setDate(x.getDate() + i); return `<span>${esc(x.toLocaleDateString(loc, { weekday: 'narrow' }))}</span>`; }).join('');
      let cells = ''; for (let i = 0; i < off; i++) cells += '<span></span>';
      for (let i = 1; i <= days; i++) { const k = pre + pad(i), hd = d.habits.some(h => habitDue(h, k) && habitDone(h, k)); cells += `<button class="cd${wd[k] ? ' on' : ''}${k === td ? ' now' : ''}${(d.food[k] || []).length ? ' fd' : ''}${hd ? ' hb' : ''}" data-a="day-open" data-d="${k}" ${k > td ? 'disabled' : ''}>${i}</button>`; }
      return { title: t('calTitle'), html: `<div class="datenav"><button class="icon-btn" data-a="cal-mo" data-d="-1" aria-label="${esc(t('prevMonth'))}">${IC.back}</button><b>${esc(first.toLocaleDateString(loc, { year: 'numeric', month: 'long' }))}</b><button class="icon-btn flip" data-a="cal-mo" data-d="1" aria-label="${esc(t('nextMonth'))}" ${c.y * 12 + c.m >= now.getFullYear() * 12 + now.getMonth() ? 'disabled' : ''}>${IC.back}</button></div>
        <div class="cal-h">${names}</div><div class="cal-g">${cells}</div><p class="cap"><i class="k-on"></i>${esc(t('calKeyW'))}<i class="k-fd"></i>${esc(t('calKeyF'))}<i class="k-hb"></i>${esc(t('calKeyH'))} · ${esc(t('calCount', cnt))}</p><p class="cap">${esc(t('calTap'))}</p>` };
    };
    fn.kind = 'cal'; return fn;
  }
  function shDay(k) {
    const fn = () => {
      const d = D(), ws = d.workouts.filter(w => ymd(w.start) === k), fl = d.food[k] || [], tg = dayTargets(k);
      const sum = fl.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
      let h = `<h3>${esc(t('workoutsDay'))}</h3>` + (ws.length ? ws.map(w => `<button class="wrow" data-a="wk-open" data-id="${esc(w.id)}"><span class="q-ic line">${IC.home}</span><span class="wr-t"><b>${esc(w.name)}</b><i>${pad(new Date(w.start).getHours())}:${pad(new Date(w.start).getMinutes())} · ${esc(wMeta(w))}</i></span>${IC.chev}</button>`).join('') : `<p class="empty">${esc(t('noWorkoutDay'))}</p>`);
      h += `<h3>${esc(t('tabFood'))}</h3><button class="rcard" data-a="day-food" data-d="${esc(k)}"><span class="q-ic line">${IC.food}</span><span class="rc-t"><b>${Math.round(sum.kcal)}${tg ? ' / ' + tg.kcal : ''} kcal</b><i>${fl.length ? `${esc(t('dayFoodN', fl.length))} · ${esc(t('pShort'))} ${Math.round(sum.p)} · ${esc(t('cShort'))} ${Math.round(sum.c)} · ${esc(t('fShort'))} ${Math.round(sum.f)}` : esc(t('noMeals'))}</i></span>${IC.chev}</button>`;
      h += `<h3>${esc(t('actTitle'))}</h3>` + actRow(k);
      if (d.habits.length) h += `<h3>${esc(t('tabHabits'))}</h3><div class="day-habits">${habitRows(k)}</div>`;
      return { title: fmtDate(k + 'T12:00', true), html: h };
    };
    fn.kind = 'day'; return fn;
  }
  /* "steps=8432;kcal=412", "8 432 lépés, 412 kcal", '{"steps":8432,"kcal":412.6}' or simply two numbers: steps first, burned calories second */
  function parseAct(txt) {
    txt = String(txt || '').slice(0, 400);
    const val = (str, hi) => { str = String(str).trim().replace(/[\s\u00a0]+$/g, ''); const grouped = +str.replace(/[\s\u00a0.,]/g, ''); if (/^\d{1,3}([\s\u00a0.,]\d{3})+$/.test(str) && grouped <= hi) return grouped; const v = Math.round(parseFloat(str.replace(/[\s\u00a0]/g, '').replace(',', '.'))); return isFinite(v) && v >= 0 && v <= hi ? v : 0; };
    const N = '(\\d[\\d\\u00a0 .,]*)', ST = '(?:steps?|l[eé]p[eé]s(?:ek)?)', KC = '(?:kcal|calories|energy|energia|kal[oó]ria)';
    /* every way a keyword can claim a number, best first: "steps=8432", then by the style of the text ("8432 steps" when it starts with a number, "steps 8432" otherwise) */
    const cand = K => { const first = /^\s*\d/.test(txt), pats = [K + '\\s*[=:]\\s*"?' + N].concat(first ? [N + '\\s*' + K, K + '\\D{0,8}?' + N] : [K + '\\D{0,8}?' + N, N + '\\s*' + K]);
      return pats.map(pt => txt.match(new RegExp(pt, 'i'))).filter(Boolean).map(m => ({ v: m[1], pos: m.index + m[0].indexOf(m[1]) })); };
    const A = cand(ST), B = cand(KC); let a = null, b = null, bestR = 99;
    A.concat([null]).forEach((x, i) => B.concat([null]).forEach((y, k) => { if (x && y && x.pos === y.pos) return; const r = (x ? i : 10) + (y ? k : 10); if (r < bestR) { bestR = r; a = x; b = y; } }));   // the two never share one number
    const out = { steps: a ? val(a.v, 200000) : 0, kcal: b ? val(b.v, 20000) : 0 };
    if (!a && !b) { const all = txt.match(/\d[\d.,]*/g) || []; if (all[0]) out.steps = val(all[0], 200000); if (all[1]) out.kcal = val(all[1], 20000); }
    return out;
  }
  function shAct(k) {
    const fn = () => {
      const v = ui.act, w = num(D().settings.profile.weight), canPaste = !!(navigator.clipboard && navigator.clipboard.readText);
      return { title: t('actTitle'), html: `<p class="lead">${esc(k === today() ? t('today') : fmtDate(k + 'T12:00', true))}</p>
        <div class="grid2"><label class="fld"><span>${esc(t('stepsLbl'))}</span><input type="text" inputmode="numeric" data-in="act-f" data-k="steps" id="act-steps" value="${esc(v.steps)}" autocomplete="off"></label><label class="fld"><span>${esc(t('burnLbl'))}</span><input type="text" inputmode="numeric" data-in="act-f" data-k="kcal" id="act-kcal" value="${esc(v.kcal)}" autocomplete="off"></label></div>
        ${w ? `<button class="link" data-a="act-est">${esc(t('actEst'))}</button>` : ''}
        <section class="card"><h3>${esc(t('actImport'))}</h3><p class="cap">${esc(t('actImportLead'))}</p>${canPaste ? `<button class="btn" data-a="act-paste">${esc(t('actPaste'))}</button>` : ''}<label class="fld"><span>${esc(t('actPasteLbl'))}</span><input type="text" data-in="act-paste" placeholder="steps=8432;kcal=412" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label></section>
        <section class="card"><h3>${esc(t('actHow'))}</h3><ol class="steps">${[1, 2, 3, 4, 5, 6].map(i => `<li>${esc(t('actHow' + i))}</li>`).join('')}</ol><p class="cap">${esc(t('actHowCap'))}</p></section>
        <label class="sw"><input type="checkbox" data-in="set-flag" data-k="addActive" ${D().settings.addActive ? 'checked' : ''}><span>${esc(t('setAddActive'))}</span></label>`,
        foot: `<button class="btn primary" data-a="act-save" data-d="${esc(k)}">${esc(t('save'))}</button>` };
    };
    fn.kind = 'act'; return fn;
  }
  function actFill(o) {
    if (!(o.steps > 0 || o.kcal > 0)) { toast(t('actPasteBad')); return; }
    if (o.steps > 0) ui.act.steps = String(o.steps); if (o.kcal > 0) ui.act.kcal = String(o.kcal);
    const a = $('#act-steps'), b = $('#act-kcal'); if (a) a.value = ui.act.steps; if (b) b.value = ui.act.kcal;
    toast(t('actPasted', compact(o.steps), compact(o.kcal)));
  }

  /* ================= COACH: ask the AI about food and training ================= */
  const rich = x => esc(x).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/^#{1,4} *(.+)$/gm, '<b>$1</b>').replace(/\n/g, '<br>');    // escaped first, then only bold and line breaks are let through
  function coachContext() {
    const d = D(), s = d.settings, p = s.profile, td = today(), tg = dayTargets(td), out = [], en = id => (EX[id] || {}).n || id;
    const sum = l => l.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    out.push('Today is ' + td + '.');
    out.push('Profile: ' + [p.sex === 'f' ? 'female' : 'male', p.age ? p.age + ' years' : '', p.height ? p.height + ' cm' : '', p.weight ? p.weight + ' kg' : ''].filter(Boolean).join(', ') + '; goal: ' + ({ cut: 'lose fat', maintain: 'maintain weight', bulk: 'build muscle' }[p.goal] || 'maintain weight') + '.');
    out.push(tg ? 'Daily targets: ' + tg.kcal + ' kcal, protein ' + tg.p + ' g, carbs ' + tg.c + ' g, fat ' + tg.f + ' g.' : 'No calorie or macro targets are set.');
    const pd = planDay(td); if (pd && pd.meals.length) { const got = {}; (d.food[td] || []).forEach(f => { if (f.pm) got[f.pm] = 1; });
      out.push('The user follows a fixed meal plan' + (pd.type ? ' (today is a ' + (pd.type === 'train' ? 'training' : 'rest') + ' day)' : '') + '. Planned meals today: ' + pd.meals.map(m => (typeof m.name === 'string' ? m.name : m.name.en || m.name.hu) + ' [' + m.items.map(i => i.n + ' ' + i.g + ' g').join(', ') + '; ' + m.kcal + ' kcal]' + (got[m.id] ? ' (eaten)' : ' (not ticked yet)')).join('; ') + '.'); }
    const fl = d.food[td] || [], tot = sum(fl);
    out.push(fl.length ? 'Eaten today so far: ' + Math.round(tot.kcal) + ' kcal, protein ' + Math.round(tot.p) + ' g, carbs ' + Math.round(tot.c) + ' g, fat ' + Math.round(tot.f) + ' g. Items: ' + fl.slice(0, 15).map(f => f.name + (f.g ? ' ' + f.g + ' g' : '') + ' (' + Math.round(f.kcal) + ' kcal, protein ' + Math.round(f.p) + ' g)').join('; ') + '.' : 'Nothing is logged in the food diary today.');
    const days = Object.keys(d.food).filter(k => k < td).sort().slice(-7).map(k => sum(d.food[k]));
    if (days.length) out.push('Average of the last ' + days.length + ' logged days before today: ' + Math.round(days.reduce((a, x) => a + x.kcal, 0) / days.length) + ' kcal, protein ' + Math.round(days.reduce((a, x) => a + x.p, 0) / days.length) + ' g.');
    const ac = actOf(td); if (ac.steps || ac.kcal) out.push('Activity today: ' + ac.steps + ' steps, ' + ac.kcal + ' kcal burned.');
    const now = Date.now(), ws = d.workouts;
    out.push(ws.length ? 'Training: ' + ws.filter(w => w.start > now - 7 * 864e5).length + ' workouts in the last 7 days, ' + ws.filter(w => w.start > now - 30 * 864e5).length + ' in the last 30, ' + ws.length + ' in total.' : 'No workouts are logged yet.');
    const ms = muscleSets(weekWorkouts()), mk = Object.keys(ms); if (mk.length) out.push('Sets per muscle this week: ' + mk.map(k => k + ' ' + r1(ms[k])).join(', ') + '.');
    ws.slice(-4).reverse().forEach(w => out.push('Workout on ' + ymd(w.start) + ' "' + w.name + '": ' + w.entries.slice(0, 8).map(e => en(e.ex) + ' ' + e.sets.filter(x => !x.w).map(x => (x.kg ? x.kg + 'x' : '') + x.reps).join(', ')).join('; ') + '.'));
    out.push('Routines in the app: ' + d.routines.map(r => rName(r)).join(', ') + '.');
    const bw = d.body.slice(-3).map(b => b.kg + ' kg (' + b.d + ')'); if (bw.length) out.push('Body weight log: ' + bw.join(', ') + '.');
    if (d.favEx.length) out.push('Favourite exercises: ' + d.favEx.slice(0, 15).map(en).join(', ') + '.');
    const old = d.chats.filter(c => c.id !== ui.coach.id).sort((a, b) => b.t - a.t).slice(0, 5);          // memory: what was discussed before
    if (old.length) out.push('Earlier conversations with this user, newest first (for continuity; do not repeat them unless asked): ' + old.map(c => { const q = (c.msgs.find(m => m.role === 'user') || {}).content || '', a = (c.msgs.filter(m => m.role === 'assistant').pop() || {}).content || ''; return '[' + ymd(c.t) + '] the user asked "' + q.replace(/\s+/g, ' ').slice(0, 160) + '" and you answered "' + a.replace(/\s+/g, ' ').slice(0, 220) + '"'; }).join(' | ') + '.');
    return out.join('\n').slice(0, 8000);
  }
  const coachSystem = () => 'You are the coach inside "' + I18N.en.appName + '", an app for logging gym workouts and food. Reply in ' + (L() === 'hu' ? 'Hungarian' : 'English') + '. Be concrete and brief: normally under 140 words, plain text; short lists with "- " are fine. Use the data below when it helps and mention the numbers you relied on. ' +
    'For food questions suggest everyday foods with rough amounts and their approximate protein and calories, and say that these are estimates. For training questions name specific exercises with sets and reps and give the reason in one line. ' +
    'You are not a doctor: for pain, injury, illness, medication, pregnancy or signs of an eating disorder give only general information and recommend seeing a professional. Never recommend crash diets, dehydration or drugs. If something is not in the data, say so instead of guessing.\n\nUser data from the app:\n' + coachContext();
  const COACH_Q = ['coachQ1', 'coachQ2', 'coachQ3', 'coachQ4'];
  function coachList() {
    const c = ui.coach;
    return (c.msgs.length || c.busy ? c.msgs.map(m => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>') : rich(m.content)}</div>`).join('') + (c.busy ? `<div class="msg ai wait" aria-label="${esc(t('analyzing'))}"><i></i><i></i><i></i></div>` : '')
      : `<p class="lead">${esc(t('coachLead'))}</p><div class="asks">${COACH_Q.map(k => `<button class="chip ask" data-a="coach-ask" data-q="${esc(t(k))}">${esc(t(k))}</button>`).join('')}</div><p class="cap">${esc(t('coachCap'))}</p>`) +
      (c.err ? `<div class="note warn"><b>${esc(t('err_' + c.err.code))}</b>${c.err.msg ? `<span>${esc(c.err.msg)}</span>` : ''}</div>` : '');
  }
  function shCoach() {
    const fn = () => {
      const st = D().settings, bad = st.keyState === 'bad', key = st.apiKey && !bad, c = ui.coach;
      const nh = D().chats.length;
      return { title: t('coachTitle'), html: (key ? '' : `<button class="note warn" data-a="settings"><b>${esc(t(bad ? 'keyBad' : 'coachNeedKey'))}</b><span>${esc(t(bad ? 'keyBadSub' : 'needKeySub'))}</span></button>`) +
        `<div class="chat-top"><button class="pill" data-a="coach-hist">${IC.cal}${esc(t('coachHist'))}${nh ? ' (' + nh + ')' : ''}</button></div><div id="chat" class="chat" aria-live="polite">${coachList()}</div>`,
        foot: `<form class="chatbar" data-f="coach"><label class="sr" for="coach-in">${esc(t('coachPh'))}</label><input id="coach-in" type="text" name="q" data-in="coach-q" value="${esc(c.draft)}" placeholder="${esc(t('coachPh'))}" autocomplete="off" enterkeyhint="send" maxlength="600" ${key ? '' : 'disabled'}><button class="btn primary" id="coach-send" ${key && !c.busy ? '' : 'disabled'} aria-label="${esc(t('send'))}">${IC.send}</button>${c.msgs.length ? `<button type="button" class="icon-btn" data-a="coach-clear" aria-label="${esc(t('coachNew'))}">${IC.plus}</button>` : ''}</form>` };
    };
    fn.kind = 'coach'; return fn;
  }
  const fmtWhen = ts => new Date(ts).toLocaleString(L() === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  function shCoachHist() {
    const fn = () => {
      const cs = D().chats.slice().sort((a, b) => b.t - a.t);
      return { title: t('coachHist'), html: cs.length ? `<div class="flist">${cs.map(ch => { const q = (ch.msgs.find(m => m.role === 'user') || {}).content || '';
        return `<div class="frow chrow${ch.id === ui.coach.id ? ' cur' : ''}"><button class="ch-open" data-a="coach-open" data-id="${esc(ch.id)}"><b>${esc(q.replace(/\s+/g, ' ').slice(0, 90))}</b><i>${esc(fmtWhen(ch.t))} · ${ch.msgs.length} ${esc(t('coachMsgs'))}</i></button><button class="icon-btn sm" data-a="coach-del" data-id="${esc(ch.id)}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>`; }).join('')}</div><p class="cap">${esc(t('coachHistCap'))}</p>`
        : `<p class="empty">${esc(t('coachHistEmpty'))}</p>` };
    };
    fn.kind = 'coachhist'; return fn;
  }
  /* every finished exchange is written into the saved conversation it belongs to */
  function saveChat() {
    const c = ui.coach, d = D(); if (!c.msgs.length) return; if (!c.id) c.id = uid();
    d.chats = d.chats.filter(x => x.id !== c.id).concat([{ id: c.id, t: Date.now(), msgs: c.msgs.map(m => ({ role: m.role, content: m.content })) }]).slice(-40); Store.save();
  }
  /* update only the message list, so the keyboard stays open while talking */
  function coachDraw(full) {
    if (!topIs('coach')) return;
    const l = $('#chat'); if (full || !l) refreshSheet(); else { l.innerHTML = coachList(); const btn = $('#coach-send'); if (btn) btn.disabled = ui.coach.busy; }
    const b = $('#sheet .sheet-body'); if (b) b.scrollTop = b.scrollHeight;
  }
  async function coachSend(q) {
    const c = ui.coach, st = D().settings; q = String(q || '').trim().slice(0, 600); if (!q || c.busy || !st.apiKey || st.keyState === 'bad') return;
    c.msgs.push({ role: 'user', content: q }); c.draft = ''; c.busy = true; c.err = null; const inp = $('#coach-in'); if (inp) inp.value = '';
    coachDraw(c.msgs.length === 1);                                                    // first message: the "clear" button appears too
    try { const a = await FoodAI.chat(st.apiKey, st.model, coachSystem(), c.msgs); c.msgs.push({ role: 'assistant', content: a }); c.msgs = c.msgs.slice(-60); saveChat(); keyResult('ok'); }
    catch (e) { c.err = { code: ['network', 'auth', 'rate', 'model', 'api', 'parse'].indexOf(e.code) >= 0 ? e.code : 'api', msg: e.code === 'api' || e.code === 'model' ? e.message : '' }; c.msgs.pop(); c.draft = q; if (e.code === 'auth') keyResult('bad'); }
    c.busy = false; coachDraw(!!c.err);
  }

  /* ================= ACCOUNT: only when js/config.js names a Supabase project ================= */
  const CL = window.Cloud && window.Cloud.on ? window.Cloud : null;
  const AC_CODES = ['network', 'creds', 'confirm', 'exists', 'weak', 'closed', 'email', 'rate', 'auth'];
  function renderGate() {
    const g = $('#gate'); if (!g) return;
    const need = !!CL && (!CL.user || ui.gate.mode === 'newpw');
    document.body.classList.toggle('gated', need); g.hidden = !need; if (!need) { g.innerHTML = ''; return; }
    document.documentElement.lang = L();
    const s = ui.gate, m = s.mode;
    g.innerHTML = `<form class="gate-in" data-f="gate" novalidate><div class="gate-logo">${IC.home}</div><h1>${esc(t('appName'))}</h1><p class="lead">${esc(t('gate_' + m))}</p>
      ${m === 'in' || m === 'up' ? `<div class="seg"><button type="button" class="${m === 'in' ? 'on' : ''}" data-a="gate-mode" data-v="in">${esc(t('signIn'))}</button><button type="button" class="${m === 'up' ? 'on' : ''}" data-a="gate-mode" data-v="up">${esc(t('signUp'))}</button></div>` : ''}
      ${s.err ? `<div class="note warn" role="alert"><b>${esc(s.err)}</b></div>` : ''}${s.info ? `<div class="note" role="status"><b>${esc(s.info)}</b></div>` : ''}
      ${m !== 'newpw' ? `<label class="fld"><span>${esc(t('email'))}</span><input type="email" name="email" value="${esc(s.email)}" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="email" required></label>` : ''}
      ${m !== 'forgot' ? `<label class="fld"><span>${esc(t(m === 'newpw' ? 'newPassword' : 'password'))}</span><input type="password" name="password" autocomplete="${m === 'in' ? 'current-password' : 'new-password'}" minlength="8" required></label>` : ''}
      ${m === 'up' || m === 'newpw' ? `<p class="cap">${esc(t('pwRule'))}</p>` : ''}
      <button class="btn primary big${s.busy ? ' busy' : ''}" ${s.busy ? 'disabled' : ''}>${esc(t({ in: 'signIn', up: 'signUp', forgot: 'sendReset', newpw: 'savePassword' }[m]))}</button>
      ${m === 'in' ? `<button type="button" class="link" data-a="gate-mode" data-v="forgot">${esc(t('forgot'))}</button>` : ''}${m === 'forgot' ? `<button type="button" class="link" data-a="gate-mode" data-v="in">${esc(t('backToSignIn'))}</button>` : ''}
      <p class="cap">${esc(t('gateCap'))}</p><div class="seg lang"><button type="button" class="${L() === 'hu' ? 'on' : ''}" data-a="gate-lang" data-v="hu">Magyar</button><button type="button" class="${L() === 'en' ? 'on' : ''}" data-a="gate-lang" data-v="en">English</button></div></form>`;
  }
  /* a session exists: make sure the data on this device belongs to that account, then bring both sides up to date */
  async function signedIn() {
    const u = CL && CL.user; if (!u) return;
    let d = D();
    if (d.owner && d.owner !== u.id) { Store.wipe(); d = D(); ui.wOpen = false; ui.foodDate = today(); ui.coach = newCoach(); }      // another person's data is never mixed in
    if (d.owner !== u.id) Store.stamp(u.id, d.workouts.length > 0 || Object.keys(d.food).length > 0 || d.body.length > 0 || !!d.settings.targets);
    applyLook(); renderGate(); render(); await doSync(true);
  }
  let syncT = 0;
  async function doSync(loud) {
    if (!CL || !CL.user) return;
    try {
      const r = await CL.sync();
      if (r === 'changed') { hRef = null; applyLook(); if (!ui.sheets.length && !ui.wOpen) rerender(); else ui.stale = true; }
    } catch (e) {
      if (e.code === 'auth') { ui.gate = { mode: 'in', email: (e.user && e.user.email) || ui.gate.email, busy: false, err: '', info: t('sessionOver') }; closeSheet(true); renderGate(); return; }   // signed out elsewhere or the session ran out: the data stays, sign in again
    }
    if (loud && topIs('settings')) refreshSheet();
  }
  const syncSoon = () => { if (!CL || !CL.user) return; clearTimeout(syncT); syncT = setTimeout(() => doSync(false), 2500); };
  async function gateSubmit(v) {
    const s = ui.gate, email = String(v.email || '').trim().toLowerCase(), pw = String(v.password || ''); if (s.busy || !CL) return;
    s.info = '';
    if (s.mode !== 'newpw') { s.email = email; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { s.err = t('ac_email'); renderGate(); return; } }
    if (s.mode !== 'forgot' && pw.length < 8) { s.err = t('ac_weak'); renderGate(); return; }
    s.busy = true; s.err = ''; renderGate();
    try {
      if (s.mode === 'forgot') { await CL.recover(email); s.info = t('resetSent'); s.mode = 'in'; }
      else if (s.mode === 'newpw') { await CL.setPassword(pw); s.mode = 'in'; toast(t('pwSaved')); }
      else if (s.mode === 'up') { if (await CL.signUp(email, pw) !== 'in') { s.info = t('confirmSent'); s.mode = 'in'; } }
      else await CL.signIn(email, pw);
    } catch (e) { s.err = t('ac_' + (AC_CODES.indexOf(e.code) >= 0 ? e.code : 'api')) + (AC_CODES.indexOf(e.code) < 0 && e.message ? ' (' + String(e.message).slice(0, 120) + ')' : ''); }
    s.busy = false; if (CL.user && s.mode !== 'newpw') await signedIn(); else renderGate();
  }

  /* ================= ACTIONS ================= */
  const A = {
    tab(el) { const k = el.dataset.tab; if (!VIEWS[k]) return; if (ui.tab !== k) go('tab', () => { ui.tab = k; render(); }); else render(); },
    /* calendar, day, activity */
    cal(el) { const d = new Date((/^\d{4}-\d\d-\d\d$/.test(el.dataset.d || '') ? el.dataset.d : today()) + 'T12:00'); ui.cal = { y: d.getFullYear(), m: d.getMonth() }; openSheet(shCal()); },
    'cal-mo'(el) { const c = ui.cal, d = new Date(c.y, c.m + +el.dataset.d, 1), now = new Date(); if (d.getFullYear() * 12 + d.getMonth() > now.getFullYear() * 12 + now.getMonth() || d.getFullYear() < 2000) return; ui.cal = { y: d.getFullYear(), m: d.getMonth() }; refreshSheet(); },
    'day-open'(el) { const k = el.dataset.d; if (/^\d{4}-\d\d-\d\d$/.test(k) && k <= today()) openSheet(shDay(k)); },
    'day-food'(el) { const k = el.dataset.d; if (!/^\d{4}-\d\d-\d\d$/.test(k) || k > today()) return; ui.foodDate = k; ui.food = 'diary'; closeSheet(true); go('tab', () => { ui.tab = 'food'; render(); }); },
    act(el) { const k = /^\d{4}-\d\d-\d\d$/.test(el.dataset.d || '') && el.dataset.d <= today() ? el.dataset.d : today(), a = actOf(k); ui.act = { steps: a.steps ? String(a.steps) : '', kcal: a.kcal ? String(a.kcal) : '' }; openSheet(shAct(k)); },
    'habit-new'() { if (D().habits.length >= 100) { toast(t('momentumLimit')); return; } ui.habitEdit = { id: '', name: '', days: [0, 1, 2, 3, 4, 5, 6], source: 'check', goal: 1, unit: '' }; openSheet(shHabitEdit()); },
    'habit-template'(el) { if (D().habits.length >= 100) { toast(t('momentumLimit')); return; } A['habit-new'](); if (!ui.habitEdit) return; const x = [['tplWater', 'count', 8, L() === 'hu' ? 'pohár' : 'glasses'], ['tplRead', 'count', 10, L() === 'hu' ? 'oldal' : 'pages'], ['tplStretch', 'check', 1, ''], ['tplSteps', 'steps', 8000, ''], ['tplWorkout', 'workout', 1, ''], ['tplProtein', 'protein', 150, '']][+el.dataset.i]; if (!x) return; Object.assign(ui.habitEdit, { name: t(x[0]), source: x[1], goal: x[2], unit: x[3] }); refreshSheet(); },
    'habit-edit'(el) { const h = D().habits.find(x => x.id === el.dataset.id); if (!h) return; ui.habitEdit = Object.assign({}, h, { days: h.days.slice() }); openSheet(shHabitEdit()); },
    'habit-day-pick'(el) { const a = ui.habitEdit.days, n = +el.dataset.day, i = a.indexOf(n); if (i >= 0) { if (a.length === 1) { toast(t('habitNeedDay')); return; } a.splice(i, 1); } else a.push(n); a.sort(); refreshSheet(); },
    'habit-save'() {
      const x = ui.habitEdit, input = $('#habit-name'), name = String(input ? input.value : x.name).trim().slice(0, 60); if (!name) { toast(t('habitNeedName')); if (input) input.focus(); return; }
      if (!x.days.length) { toast(t('habitNeedDay')); return; }
      if (!['check', 'workout'].includes(x.source) && !(num(x.goal) >= 1 && num(x.goal) <= 200000)) { toast(t('badValue')); return; }
      const d = D(), old = x.id && d.habits.find(h => h.id === x.id), h = Momentum.clean({ id: x.id || uid(), name, days: x.days.slice(), source: x.source, goal: num(x.goal), unit: x.unit, logs: old ? old.logs : {}, started: old ? old.started : today(), t: Date.now() });
      d.habits = old ? d.habits.map(z => z.id === h.id ? h : z) : d.habits.concat([h]); Store.save(); ui.habitEdit = null; closeSheet(true); rerender(); toast(t('saved'));
    },
    'habit-delete'() { const x = ui.habitEdit, d = D(); if (!x || !x.id) return; d.habits = d.habits.filter(h => h.id !== x.id); Store.save(); ui.habitEdit = null; closeSheet(true); rerender(); toast(t('saved')); },
    'habit-toggle'(el) {
      const k = el.dataset.d, h = D().habits.find(x => x.id === el.dataset.id); if (!h || !/^\d{4}-\d\d-\d\d$/.test(k) || k > today() || !habitDue(h, k)) return;
      if (h.source === 'steps') { A.act(el); return; }
      if (h.source === 'protein') { A['day-food'](el); return; }
      if (h.source === 'workout') { if (k === today()) { closeSheet(true); ui.tab = 'home'; rerender(); } else A['day-open'](el); return; }
      if (h.source === 'count') { A['habit-count']({ dataset: Object.assign({}, el.dataset, { n: '1' }) }); return; }
      h.logs[k] = { v: habitDone(h, k) ? 0 : 1, t: Date.now() }; Store.save(); if (topIs('day')) refreshSheet(); rerender();
    },
    'habit-count'(el) { const h = D().habits.find(x => x.id === el.dataset.id), k = el.dataset.d; if (!h || h.source !== 'count' || !/^\d{4}-\d\d-\d\d$/.test(k) || k > today() || !habitDue(h, k)) return; h.logs[k] = { v: Math.max(0, Math.min(200000, r1(Momentum.value(h, k, D()) + num(el.dataset.n)))), t: Date.now() }; Store.save(); if (topIs('day')) refreshSheet(); rerender(); },
    'habit-amount'(el) { const h = D().habits.find(x => x.id === el.dataset.id), k = el.dataset.d; if (!h || h.source !== 'count' || k > today() || !habitDue(h, k)) return; ui.habitAmount = { id: h.id, day: k }; openSheet(() => ({ title: h.name, html: `<form id="habit-amount-form" data-f="habit-amount"><label class="fld"><span>${esc(t('momentumAmount'))} ${esc(h.unit)}</span><input name="value" inputmode="decimal" required value="${Momentum.value(h, k, D())}"></label></form>`, foot: `<button class="btn primary" form="habit-amount-form">${esc(t('save'))}</button>` })); },
    'habit-select-date'(el) {
      if (!/^\d{4}-\d\d-\d\d$/.test(el.dataset.d) || el.dataset.d > today()) return;
      const group = el.classList.contains('momentum-cell') ? '.momentum-heat' : '.momentum-week', top = el.getBoundingClientRect().top;
      ui.habitDate = el.dataset.d; rerender();
      const button = $(group + ' [data-d="' + ui.habitDate + '"]');
      if (button) { button.focus({ preventScroll: true }); window.scrollBy(0, button.getBoundingClientRect().top - top); }
    },
    'habit-month-step'(el) { const d = new Date(ui.habitMonth + '-01T12:00'); d.setMonth(d.getMonth() + +el.dataset.d); const month = ymd(d).slice(0, 7); if (month > today().slice(0, 7)) return; const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); ui.habitMonth = month; ui.habitDate = month + '-' + pad(Math.min(Number(ui.habitDate.slice(-2)), last)); if (ui.habitDate > today()) ui.habitDate = today(); rerender(); const button = $('.momentum-month-nav [data-d="' + el.dataset.d + '"]'); const focus = button && !button.disabled ? button : $('.momentum-heat [data-d="' + ui.habitDate + '"]'); if (focus) focus.focus({ preventScroll: true }); },
    'habit-today'() { ui.habitDate = today(); ui.habitMonth = today().slice(0, 7); rerender(); const button = $('.momentum-heat [data-d="' + ui.habitDate + '"]'); if (button) button.focus({ preventScroll: true }); },
    'habit-date'(el) { const d = new Date(ui.habitDate + 'T12:00'); d.setDate(d.getDate() + +el.dataset.d); if (ymd(d) <= today()) { ui.habitDate = ymd(d); ui.habitMonth = ui.habitDate.slice(0, 7); rerender(); } },
    'act-est'() { const w = num(D().settings.profile.weight), st = num(ui.act.steps); if (!(st > 0)) { toast(t('actEstNeed')); return; } ui.act.kcal = String(Math.round(st * w * 0.00055)); const b = $('#act-kcal'); if (b) b.value = ui.act.kcal; },
    async 'act-paste'() { let txt = ''; try { txt = await navigator.clipboard.readText(); } catch (e) { toast(t('actClipNo')); return; } if (topIs('act')) actFill(parseAct(txt)); },
    'act-save'(el) {
      const k = el.dataset.d, st = Math.round(num(ui.act.steps)), kc = Math.round(num(ui.act.kcal)); if (!/^\d{4}-\d\d-\d\d$/.test(k)) return;
      if (st < 0 || st > 200000 || kc < 0 || kc > 20000) { toast(t('badValue')); return; }
      if (st || kc) D().act[k] = { steps: st, kcal: kc }; else delete D().act[k];
      Store.save(); closeSheet(); if (topIs('day')) refreshSheet(); rerender(); toast(t('saved'));
    },
    /* favourites */
    'fav-ex'(el) { const id = el.dataset.id, f = D().favEx, k = f.indexOf(id); if (!EX[id]) return; if (k >= 0) f.splice(k, 1); else f.push(id); Store.save(); refreshSheet(); if (ui.tab === 'lib') rerender(); },
    'fav-food'() { const key = ui.fa && ui.fa.food.key, f = D().favFoods; if (!key) return; const k = f.indexOf(key); if (k >= 0) f.splice(k, 1); else f.unshift(key); Store.save(); refreshSheet(); },
    'fs-fav'(el) { const x = (ui.fs.favs || [])[+el.dataset.n]; if (!x) return; pickFood(x); },
    'fs-brand'(el) { ui.fs.q = String(el.dataset.q || '').slice(0, 40); refreshSheet(); const b = $('#sheet .sheet-body'); if (b) b.scrollTop = 0; },
    'ai-forget'() { if (!confirm(t('aiForgetConfirm'))) return; D().aiNotes = []; Store.save(); refreshSheet(); },
    'ai-rm'(el) { ui.ai.imgs.splice(+el.dataset.i, 1); refreshSheet(); },
    're-icon'(el) { const v = el.dataset.v; ui.edit.icon = Store.ICONS.indexOf(v) >= 0 ? v : ''; refreshSheet(); },
    settings() { ui.keyDraft = ''; openSheet(shSettings()); checkSavedKey(); },
    'install-help'() { openSheet(shInstall()); },
    'sheet-back'() { closeSheet(); }, 'sheet-close'() { closeSheet(true); },
    lang(el) { D().settings.lang = el.dataset.v === 'en' ? 'en' : 'hu'; Store.save(); fIdx = null; render(); refreshSheet(); },
    'set-bg'(el) { if ((Store.BGS || []).indexOf(el.dataset.v) < 0) return; D().settings.bg = el.dataset.v; Store.save(); applyLook(); refreshSheet(); },
    'export-csv'() { exportCSV(); },
    async wipe() {
      const acc = CL && CL.user; if (!confirm(t(acc ? 'wipeConfirmCloud' : 'wipeConfirm')) || !confirm(t('wipeConfirm2'))) return;
      Store.wipe();
      if (acc) { const d = D(); d.epoch = Date.now(); Store.stamp(acc.id, false); try { await CL.sync(); } catch (e) {} }      // the empty state gets a newer "epoch", so other devices drop their old copy instead of bringing it back
      location.reload();
    },
    /* coach */
    coach() { openSheet(shCoach()); checkSavedKey(); const b = $('#sheet .sheet-body'); if (b) b.scrollTop = b.scrollHeight; },
    'coach-ask'(el) { coachSend(el.dataset.q); },
    'coach-clear'() { if (ui.coach.busy) return; ui.coach = newCoach(); refreshSheet(); },                 // a new conversation; the old one stays in the history
    'coach-hist'() { openSheet(shCoachHist()); },
    'coach-open'(el) { const ch = D().chats.find(x => x.id === el.dataset.id); if (!ch || ui.coach.busy) return; ui.coach = Object.assign(newCoach(), { id: ch.id, msgs: ch.msgs.map(m => ({ role: m.role, content: m.content })) }); closeSheet(); const b = $('#sheet .sheet-body'); if (b) b.scrollTop = b.scrollHeight; },
    'coach-del'(el) { if (!confirm(t('coachDelConfirm'))) return; const d = D(); d.chats = d.chats.filter(x => x.id !== el.dataset.id); if (ui.coach.id === el.dataset.id && !ui.coach.busy) ui.coach = newCoach(); Store.save(); refreshSheet(); },
    'hue-reset'() { D().settings.hue = null; Store.save(); applyLook(); refreshSheet(); },
    'ai-chip'(el) { const s = ui.ai, v = String(el.dataset.v || ''), parts = s.hint.split(',').map(x => x.trim()).filter(Boolean), k = parts.indexOf(v); if (!v) return; if (k >= 0) parts.splice(k, 1); else parts.push(v); s.hint = parts.join(', ').slice(0, 300); refreshSheet(); },
    'ai-g'(el) { const it = ui.ai.res.items[+el.dataset.i], g = +el.dataset.g; if (!it || !(g > 0 && g <= 5000)) return; it.grams = g; FoodAI.total(it); refreshSheet(); },
    'ai-answer'(el) { const s = ui.ai, q = s.res && s.res.question; if (!q || s.loading) return; s.qa = (s.qa || []).concat([q.text + ' ' + String(el.dataset.o || '').slice(0, 40)]); s.res = null; refreshSheet(); aiGo(); },
    /* the plan: tick a meal, tick a workout */
    'pm-tick'(el) {
      const k = el.dataset.d, pd = planDay(k), m = pd && pd.meals.find(x => x.id === el.dataset.m); if (!m) return;
      const d = D(), day = d.food[k] || [], had = day.some(f => f.pm === m.id);
      if (had) d.food[k] = day.filter(f => f.pm !== m.id);
      else d.food[k] = day.concat([{ id: uid(), name: (pmName(m) + ': ' + m.items.map(i => i.n).join(', ')).slice(0, 80), g: Math.round(m.items.reduce((a, i) => a + i.g, 0)), kcal: m.kcal, p: m.p, c: m.c, f: m.f, src: 'plan', pm: m.id, t: Date.now() }]);
      if (!d.food[k].length) delete d.food[k];
      Store.save(); if (D().settings.vibrate && navigator.vibrate && !had) navigator.vibrate(20); rerender();
    },
    'plan-notes'() { openSheet(shPlanNotes()); },
    'plan-remove'() { if (!confirm(t('planRemoveConfirm'))) return; D().plan = null; Store.save(); refreshSheet(); rerender(); toast(t('saved')); },
    'w-tick'(el) {
      const r = getR(el.dataset.id); if (!r) return; const d = D(), now = Date.now();
      d.workouts.push({ id: uid(), rid: r.id, name: rName(r), start: now, end: now, entries: [], tick: true, pl: r.items.map(i => ({ ex: i.ex, n: i.sets })), warm: false, cool: false });
      d.workouts.sort((x, y) => x.start - y.start); Store.save(); if (d.settings.vibrate && navigator.vibrate) navigator.vibrate(30); closeSheet(true); rerender(); toast(t('ticked'));
    },
    'w-untick'(el) { const d = D(); d.workouts = d.workouts.filter(w => !(w.id === el.dataset.id && w.tick)); Store.save(); rerender(); },
    /* own exercises */
    'mx-new'() { ui.myex = newMyEx(null); if (ui.tab === 'lib' && ui.lib.q.trim()) ui.myex.n = ui.lib.q.trim(); openSheet(shMyEx()); },
    'mx-edit'(el) { const e = D().myEx.find(x => x.id === el.dataset.id); if (!e) return; ui.myex = newMyEx(e); openSheet(shMyEx()); },
    'mx-mus'(el) { const x = ui.myex, l = x[el.dataset.k === 's' ? 's' : 'p'], m = el.dataset.m, i = l.indexOf(m); if (i >= 0) l.splice(i, 1); else if (l.length < 6) { l.push(m); const o = x[el.dataset.k === 's' ? 'p' : 's'], j = o.indexOf(m); if (j >= 0) o.splice(j, 1); } refreshSheet(); },
    'mx-nopic'(el) { ui.myex[el.dataset.key === 'endImg' ? 'endImg' : 'img'] = ''; refreshSheet(); },
    'mx-save'() {
      const x = ui.myex, n = x.n.trim(), vid = x.vid, d = D(), old = x.id ? d.myEx.find(o => o.id === x.id) : null;
      if (!n) { toast(t('myExNeedName')); return; } if (!x.p.length) { toast(t('myExNeedMus')); return; }
      if (!old && (!x.img || !x.endImg || x.steps.length < 3 || x.steps.some(v => !v.trim()))) { toast(t('guideNeed')); return; }
      if (picCount() - (old ? +!!old.img + +!!old.endImg : 0) + +!!x.img + +!!x.endImg > 30) { toast(t('picLimit')); return; }
      if (!old && d.myEx.length >= 300) { toast(t('picLimit')); return; }
      const e = { id: x.id || 'my_' + uid(), n: n.slice(0, 80), p: x.p.slice(0, 6), s: x.s.filter(m => x.p.indexOf(m) < 0).slice(0, 6), eq: x.eq, steps: old ? x.originalSteps : x.steps.map(s => s.trim()).filter(Boolean), phaseSteps:x.steps.map(s => s.trim()).filter(Boolean).slice(0,3), schemaVersion:1, img: x.img, endImg:x.endImg, vid, t: Date.now() };
      d.myEx = old ? d.myEx.map(o => o.id === e.id ? e : o) : d.myEx.concat([e]);
      Store.save(); ownSync(); closeSheet(); if (!ui.sheets.length) { if (ui.tab === 'lib' && !old) { ui.lib.q = ''; ui.lib.grp = 'own'; ui.lib.mus = ''; ui.lib.eq = ''; } rerender(); } toast(t('saved'));
    },
    'mx-del'() {
      const x = ui.myex, d = D(); if (!x.id || !confirm(t('myExDelConfirm'))) return;
      d.myEx = d.myEx.filter(o => o.id !== x.id); d.favEx = d.favEx.filter(i => i !== x.id); d.routines.forEach(r => { r.items = r.items.filter(i => i.ex !== x.id); });
      if (ui.lib.grp === 'own' && !d.myEx.length) ui.lib.grp = '';
      Store.save(); ownSync(); closeSheet(true); rerender(); toast(t('saved'));
    },
    'exm-vid'(el) { openSheet(shVid(el.dataset.id)); },
    'exm-clear'(el) { delete D().exMedia[el.dataset.id]; Store.save(); refreshSheet(); if (!ui.wOpen) rerender(); },
    /* own foods */
    'mf-new'() { ui.myfood = { id: '', name: ui.fs && ui.fs.q ? ui.fs.q.trim() : '', kcal: '', p: '', c: '', f: '', port: '' }; openSheet(shMyFood()); },
    'mf-edit'(el) { const z = D().myFoods.find(x => x.id === el.dataset.id); if (z) { ui.myfood = Object.assign({}, z); openSheet(shMyFood()); } },
    'mf-del'(el) { if (!confirm(t('myFoodDelConfirm'))) return; D().myFoods = D().myFoods.filter(z => z.id !== el.dataset.id); Store.save(); closeSheet(); if (topIs('settings')) refreshSheet(); },
    'fs-my'(el) { const z = D().myFoods.find(x => x.id === el.dataset.id); if (!z) return; ui.fa = { food: { key: 'my:' + z.id, my: true, own: true, name: z.name, usda: '', approx: false, kcal: z.kcal, p: z.p, c: z.c, f: z.f, ports: z.port ? [[z.port, t('portion')]] : [] }, g: String(z.port || 100) }; openSheet(shFoodAmount()); },
    /* warm-up and stretching */
    prep(el) {
      const k = el.dataset.k === 'warm' ? 'warm' : 'cool', d = D(), w = el.dataset.w ? d.workouts.find(x => x.id === el.dataset.w) : null, r = el.dataset.r ? getR(el.dataset.r) : null;
      const src = w || (r ? { entries: r.items } : d.active); if (!src) return;
      ui.prep = { kind: k, wid: w ? w.id : '', live: !w && !r, list: prepList(k, src.entries), i: -1, end: 0, left: 0, run: false, half: false, fin: false };
      if (ui.prep.list.length) openSheet(shPrep());
    },
    'prep-go'() { audio(); wake(); prepStep(0); },
    'prep-pause'() { const p = ui.prep; if (!p || p.fin || p.i < 0) return; if (p.run) { p.left = Math.max(0, p.end - Date.now()); p.run = false; } else { audio(); wake(); p.end = Date.now() + p.left; p.run = true; } refreshSheet(); },
    'prep-next'() { const p = ui.prep; if (!p || p.fin || p.i < 0) return; audio(); prepStep(p.i + 1); },
    'prep-done'() { const p = ui.prep; if (!p) return; const was = p.fin; p.run = false; prepMark(); if (!(D().active && ui.wOpen)) unwake(); closeSheet(); if (!was && (p.live || p.wid)) toast(t('saved')); if (topIs('prep') === false && ui.sheets.length) refreshSheet(); },
    'muscle-focus'(el) { const e = EX[el.dataset.id], group = el.dataset.group; if (!e || (group && !e.p.concat(e.s).includes(group))) return; ui.muscleFocus = { id: el.dataset.id, group }; refreshSheet(); },
    'circuit-next'() { jumpCircuit(); },
    'fig-big'(el) {
      const phase = el.dataset.phase === '1' ? 1 : 0, source = el.dataset.source;
      if (!source) return;
      const label = exName(el.dataset.id) + ' · ' + t(phase ? 'artEnd' : 'artStart');
      openSheet(() => ({ title: label, html: `<div class="drawing-zoom" data-id="${esc(el.dataset.id)}">${drawingPicture(source, phase, el.dataset.board === '1', label)}</div>` }));
    },
    'acc-help'() { openSheet(shAccHelp()); },
    /* account */
    'gate-mode'(el) { const f = $('#gate input[name=email]'), v = el.dataset.v; if (f) ui.gate.email = f.value.trim(); if (ui.gate.busy || ['in', 'up', 'forgot'].indexOf(v) < 0) return; ui.gate.mode = v; ui.gate.err = ''; ui.gate.info = ''; renderGate(); },
    'gate-lang'(el) { const f = $('#gate input[name=email]'); if (f) ui.gate.email = f.value.trim(); D().settings.lang = el.dataset.v === 'en' ? 'en' : 'hu'; Store.save(); fIdx = null; ui.gate.err = ''; renderGate(); render(); },
    async 'sync-now'(el) { if (!CL || !CL.user) return; el.disabled = true; await doSync(true); toast(t(CL.state.err ? 'syncErr' : 'synced')); },
    async 'sign-out'() {
      if (!CL || !CL.user || !confirm(t('signOutConfirm'))) return;
      try { await CL.sync(); } catch (e) { if (!confirm(t('signOutUnsynced'))) return; }
      await CL.signOut(); Store.wipe(); location.reload();                               // nothing of the account stays on this device
    },
    async 'update-now'(el) {
      if (ui.updateBusy) return;
      ui.updateBusy = true; ui.updateStatus = 'updating'; refreshSheet(); toast(t('updating'));
      try {
        let result = null;
        if ('serviceWorker' in navigator && window.caches && location.protocol !== 'file:') {
          const probe = await fetch('sw.js', { method: 'HEAD', cache: 'no-store' });
          if (!probe.ok) throw new Error('offline');
          const reg = await navigator.serviceWorker.getRegistration() || await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
          await reg.update();
          if (reg.installing) await new Promise((resolve, reject) => {
            const worker = reg.installing, timer = setTimeout(() => finish(new Error('install timeout')), 30000);
            function finish(error) { clearTimeout(timer); worker.removeEventListener('statechange', changed); error ? reject(error) : resolve(); }
            function changed() { if (worker.state === 'installed' || worker.state === 'activated') finish(); else if (worker.state === 'redundant') finish(new Error('install failed')); }
            worker.addEventListener('statechange', changed); changed();
          });
          const worker = reg.waiting || reg.active || navigator.serviceWorker.controller;
          if (!worker) throw new Error('no worker');
          result = await new Promise((resolve, reject) => {
            const channel = new MessageChannel(), timer = setTimeout(() => finish(null, new Error('refresh timeout')), 30000);
            function finish(value, error) { clearTimeout(timer); channel.port1.close(); error ? reject(error) : resolve(value); }
            channel.port1.onmessage = event => { const value = event.data; if (value === true || (value && value.ok === true)) finish(value); else finish(null, new Error('refresh failed')); };
            worker.postMessage({ type: 'refresh', versioned: true }, [channel.port2]);
          });
        }
        // This marker only reports success when the reloaded app matches the refreshed worker.
        try { sessionStorage.setItem('gym-update-result', JSON.stringify({ version: result && result.version || '', at: Date.now() })); } catch (e) {}
        ui.updateStatus = result ? 'updateRestarting' : 'updateReloading'; refreshSheet(); toast(updateStatusText());
        setTimeout(() => location.reload(), 700);
      } catch (e) { ui.updateBusy = false; ui.updateStatus = 'updateFail'; refreshSheet(); toast(t('updateFail')); }
    },
    /* workout */
    'w-open'() { ui.wOpen = true; wake(); renderWorkout(); }, 'w-min'() { leave($('#workout'), 210, () => { ui.wOpen = false; render(); }); },
    'w-start'(el) { startWorkout(getR(el.dataset.id)); }, 
    'w-quick'() {
      if (D().active && !confirm(t('replaceActive'))) return;
      ui.pick = newPick({ title: t('quickWorkout'), lead: t('quickLead'), cta: t('startWorkout'), done: ids => startWorkout({ id: null, name: t('quickWorkout'), items: ids.map(itemFor) }, true) });
      openSheet(shPicker());
    }, 'w-finish'() { finishWorkout(); },
    'w-cancel'() { if (confirm(t('cancelConfirm'))) { D().active = null; Store.save(); ui.wOpen = false; unwake(); render(); } },
    'w-check'(el) {
      audio(); const a = D().active, en = a.entries[+el.dataset.i], s = en.sets[+el.dataset.j], row = el.closest('.set');
      if (s.done) { s.done = false; } else {
        const kgI = $('[data-in="w-kg"]', row), rpI = $('[data-in="w-reps"]', row);
        if (s.kg === '' && kgI.placeholder) s.kg = kgI.placeholder; if (s.reps === '' && rpI.placeholder) s.reps = rpI.placeholder;
        if (!(num(s.reps) > 0 && num(s.reps) <= 1000) || num(s.kg) < 0 || num(s.kg) > 2000) { rpI.focus(); row.classList.add('shake'); setTimeout(() => row.classList.remove('shake'), 400); toast(t('needReps')); return; }
        s.done = true; ui.fx = 'pop' + el.dataset.i + '-' + el.dataset.j; if (!s.w) startRest(en.rest);
      }
      Store.saveActive(); renderWorkout(); if (s.done && a.circuit) jumpCircuit();
    },
    'w-warm'(el) { const s = D().active.entries[+el.dataset.i].sets[+el.dataset.j]; s.w = !s.w; Store.saveActive(); renderWorkout(); },
    'w-addset'(el) { const en = D().active.entries[+el.dataset.i], l = en.sets[en.sets.length - 1]; en.sets.push({ kg: l ? l.kg : '', reps: '', done: false, w: false }); ui.fx = 'new' + el.dataset.i + '-' + (en.sets.length - 1); Store.saveActive(); renderWorkout(); },
    'w-delset'(el) { const en = D().active.entries[+el.dataset.i]; en.sets.pop(); Store.saveActive(); renderWorkout(); },
    'w-tools'(el) { ui.wTools = ui.wTools === +el.dataset.i ? null : +el.dataset.i; ui.fx = 'tools'; renderWorkout(); },
    'w-up'(el) { const e = D().active.entries, i = +el.dataset.i; e.splice(i - 1, 0, e.splice(i, 1)[0]); ui.wTools = i - 1; Store.saveActive(); renderWorkout(); },
    'w-down'(el) { const e = D().active.entries, i = +el.dataset.i; e.splice(i + 1, 0, e.splice(i, 1)[0]); ui.wTools = i + 1; Store.saveActive(); renderWorkout(); },
    'w-delex'(el) { if (confirm(t('removeConfirm'))) { D().active.entries.splice(+el.dataset.i, 1); ui.wTools = null; Store.saveActive(); renderWorkout(); } },
    'w-addex'() {
      ui.pick = newPick({ done: ids => { ids.forEach(id => D().active.entries.push(newEntry(itemFor(id)))); Store.saveActive(); closeSheet(true); renderWorkout(); const b = $('#workout .w-body'); b.scrollTop = b.scrollHeight; } });
      openSheet(shPicker());
    },
    'rest-add'(el) { const a = D().active; if (!a || !a.restEnd) return; a.restEnd += +el.dataset.s * 1000; a.restTotal = Math.max(1, a.restTotal + +el.dataset.s); Store.saveActive(); tick(); },
    'rest-skip'() { const a = D().active; if (a) { a.restEnd = 0; Store.saveActive(); tick(); } },
    /* routines */
    'r-open'(el) { openSheet(shRoutine(el.dataset.id)); },
    'r-new'() {                                                                      // first tick the exercises, then name it and set the numbers
      ui.pick = newPick({ title: t('newRoutine'), lead: t('newRoutineLead'), cta: t('next'), done: ids => { ui.edit = { id: uid(), name: '', items: ids.map(itemFor), _old: false }; ui.sheets = []; openSheet(shRoutineEdit()); } });
      openSheet(shPicker());
    },
    'r-edit'(el) { const r = getR(el.dataset.id); ui.edit = JSON.parse(JSON.stringify(r)); ui.edit._old = true; openSheet(shRoutineEdit()); },
    'r-del'() { if (confirm(t('deleteRoutineConfirm'))) { D().routines = D().routines.filter(r => r.id !== ui.edit.id); Store.save(); closeSheet(true); render(); } },
    're-up'(el) { const e = ui.edit.items, i = +el.dataset.i; e.splice(i - 1, 0, e.splice(i, 1)[0]); refreshSheet(); },
    're-down'(el) { const e = ui.edit.items, i = +el.dataset.i; e.splice(i + 1, 0, e.splice(i, 1)[0]); refreshSheet(); },
    're-del'(el) { ui.edit.items.splice(+el.dataset.i, 1); refreshSheet(); },
    're-add'() { ui.pick = newPick({ done: ids => { ids.forEach(id => ui.edit.items.push(itemFor(id))); closeSheet(); } }); openSheet(shPicker()); },
    'r-dup'() {                                                                      // keeps the original, saves what is on screen as a new routine
      const c = cleanEdit(JSON.parse(JSON.stringify(ui.edit))), src = getR(ui.edit.id); c.id = uid(); c.builtin = false; c.sub = null;
      if (src && rName(c) === rName(src)) c.name = t('copyOf', rName(src));
      D().routines.push(c); Store.save(); closeSheet(true); render(); toast(t('saved'));
    },
    're-save'() {
      const e = cleanEdit(ui.edit), rs = D().routines, k = rs.findIndex(r => r.id === e.id); if (k >= 0) rs[k] = e; else rs.push(e);
      Store.save(); closeSheet(true); render(); toast(t('saved'));
    },
    pick(el) {
      const id = el.dataset.id, st = ui.pick; if (!EX[id]) return;
      const k = st.sel.indexOf(id); if (k >= 0) st.sel.splice(k, 1); else st.sel.push(id);
      if (st.grp === 'sel') { if (!st.sel.length) st.grp = ''; refreshSheet(); } else pickSync();
    },
    'pick-done'() { const st = ui.pick; if (st.sel.length && st.done) st.done(st.sel.slice()); },
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
    'lib-mus'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.mus = MUS_ORDER.indexOf(el.dataset.m) >= 0 ? el.dataset.m : ''; st.limit = 40; if (pk) refreshSheet(); else rerender(); },
    'lib-catalogue'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.catalogue = el.dataset.v === 'all' ? 'all' : 'ready'; st.limit = 40; if (pk) refreshSheet(); else rerender(); },
    'lib-grp'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib, g = el.dataset.g; st.grp = GROUPS[g] || g === 'fav' || g === 'own' || (pk && g === 'sel') ? g : ''; st.mus = ''; st.limit = 40; if (pk) refreshSheet(); else rerender(); },
    'lib-more'(el) { const pk = !!el.closest('#sheet'); (pk ? ui.pick : ui.lib).limit += 60; if (pk) refreshSheet(); else rerender(); },
    /* progress */
    prog(el) { const v = el.dataset.v === 'history' ? 'history' : 'overview'; ui.histLimit = 60; if (ui.prog !== v) go('tab', () => { ui.prog = v; render(); }); else render(); },
    'hist-more'() { ui.histLimit = (ui.histLimit || 60) + 120; rerender(); },
    'wk-open'(el) { openSheet(shWorkout(el.dataset.id, null)); },
    'wk-to-routine'(el) {
      const w = D().workouts.find(x => x.id === el.dataset.id); if (!w) return;
      ui.edit = { id: uid(), name: '', _old: false,
        items: w.entries.map(e => { const d = itemFor(e.ex), n = e.sets.filter(s => !s.w).length || e.sets.length; return { ex: e.ex, label: e.label || null, sets: Math.max(1, Math.min(12, n)), reps: d.reps, rest: d.rest }; }) };
      openSheet(shRoutineEdit());
    },
    'wk-del'(el) { if (confirm(t('deleteWorkoutConfirm'))) { D().workouts = D().workouts.filter(w => w.id !== el.dataset.id); Store.save(); closeSheet(true); rerender(); } },
    /* food */
    'food-day'(el) { const d = new Date(ui.foodDate + 'T12:00'); d.setDate(d.getDate() + +el.dataset.d); if (ymd(d) <= today()) go(+el.dataset.d < 0 ? 'back' : 'fwd', () => { ui.foodDate = ymd(d); render(); }); },
    'food-del'(el) { const d = D(); d.food[ui.foodDate] = dayFood().filter(f => f.id !== el.dataset.id); Store.save(); rerender(); },
    'food-view'(el) { const v = el.dataset.v === 'ideas' ? 'ideas' : 'diary'; if (ui.food !== v) go('tab', () => { ui.food = v; render(); }); else render(); },
    'idea-cat'(el) { ui.idea = el.dataset.c; rerender(); },
    'idea-open'(el) { ui.recipeQty = 1; openSheet(shRecipe(el.dataset.id)); },
    'recipe-qty'(el) { ui.recipeQty = Math.max(.5, Math.min(20, (ui.recipeQty || 1) + num(el.dataset.n))); refreshSheet(); },
    'idea-add'(el) { const r = RCP.items.find(x => x.id === el.dataset.id); if (!r) return; const q = ui.recipeQty || 1, food = { name: (r[L()] || r.en) + (q !== 1 ? ' × ' + q : ''), g: Math.round((r.g || 0) * q) }; ['kcal', 'p', 'c', 'f'].forEach(k => { food[k] = r[k] == null ? '' : r1(r[k] * q); }); if (['kcal', 'p', 'c', 'f'].some(k => r[k] == null)) { ui.manual = Object.assign(food, { requireMacros: true }); openSheet(shFoodManual()); return; } addFood([food], r.source ? 'manual' : 'db'); closeSheet(true); rerender(); toast(t('added')); },
    'food-manual'() { ui.fs = { q: '', hits: [] }; openSheet(shFoodFind()); },
    'food-recent'(el) { ui.manual = Object.assign({}, D().recentFoods[+el.dataset.i]); if (topIs('foodfind')) openSheet(shFoodManual()); else refreshSheet(); },
    'fs-pick'(el) { const x = ui.fs.hits[+el.dataset.n]; if (x) pickFood(x); },
    'fs-own'() { ui.manual = { name: ui.fs.q.trim() }; openSheet(shFoodManual()); },
    'fs-ai'() { ui.ai = aiNew('text', ui.fs.q.trim()); openSheet(shFoodAI()); const st = D().settings; if (st.apiKey && st.keyState !== 'bad') aiGo(); },
    'fa-set'(el) { ui.fa.g = String(+el.dataset.g); refreshSheet(); },
    'fa-add'() {
      const f = ui.fa.food, g = num(ui.fa.g); if (!(g > 0 && g <= 5000)) { toast(t('badValue')); return; }
      addFood([{ name: f.name, g, kcal: f.kcal * g / 100, p: f.p * g / 100, c: f.c * g / 100, f: f.f * g / 100 }], 'db'); closeSheet(true); rerender(); toast(t('added'));
    },
    'food-ai'(el) { ui.ai = aiNew(el.dataset.m === 'photo' ? 'photo' : 'text'); openSheet(shFoodAI()); },
    'ai-go'() { aiGo(); },
    'ai-reset'() { ui.ai = aiNew(ui.ai.mode, ui.ai.text); refreshSheet(); },
    'ai-del'(el) { const it = ui.ai.res.items.splice(+el.dataset.i, 1)[0]; if (it && it._b) ui.ai.gone.push(it.en || it._b.name); refreshSheet(); },
    'ai-add'() { const s = ui.ai, learned = aiLearn(s); addFood(s.res.items.map(i => ({ name: i.name, g: i.grams, kcal: i.kcal, p: i.p, c: i.c, f: i.f })), 'ai'); closeSheet(true); rerender(); toast(t(learned ? 'aiLearned' : 'added')); },
    async 'key-save'() {
      const k = (ui.keyDraft || '').replace(/[^\x21-\x7e]/g, ''); if (!k || ui.keyBusy) return;
      ui.keyBusy = true; refreshSheet();
      const r = FoodAI.check ? await FoodAI.check(k) : 'unknown';
      ui.keyBusy = false;
      if (r === 'bad') { toast(t('err_auth')); if (topIs('settings')) refreshSheet(); return; }      // a rejected key is never stored
      const st = D().settings; st.apiKey = k; st.keyState = r === 'ok' ? 'ok' : ''; Store.save(); ui.keyDraft = '';
      if (ui.ai && ui.ai.err && ui.ai.err.code === 'auth') ui.ai.err = null;                           // the old 'key rejected' message no longer applies
      toast(t(r === 'ok' ? 'keyOk' : 'keyUnchecked')); if (topIs('settings')) refreshSheet();
    },
    'key-remove'() { if (!confirm(t('keyRemoveConfirm'))) return; const st = D().settings; st.apiKey = ''; st.keyState = ''; Store.save(); ui.keyDraft = ''; refreshSheet(); },
    targets() { const s = D().settings; ui.tg = { profile: Object.assign({}, s.profile), vals: s.targets ? Object.assign({}, s.targets) : ((c0 => c0 && !c0.bad ? { kcal: c0.kcal, p: c0.p, c: c0.c, f: c0.f } : {})(calcTargets(s.profile))) }; openSheet(shTargets()); },
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
  let hueT = 0;
  let saveA; const lazyActive = () => { clearTimeout(saveA); saveA = setTimeout(() => Store.saveActive(), 250); };
  const IN = {
    'habit-name'(el) { if (ui.habitEdit) ui.habitEdit.name = el.value; },
    'habit-source'(el) { if (!ui.habitEdit || !Momentum.sources.includes(el.value)) return; ui.habitEdit.source = el.value; ui.habitEdit.goal = ({ check: 1, workout: 1, count: 8, steps: 8000, protein: 150 })[el.value]; refreshSheet(); },
    'habit-goal'(el) { if (ui.habitEdit) ui.habitEdit.goal = el.value; },
    'habit-unit'(el) { if (ui.habitEdit) ui.habitEdit.unit = el.value; },
    'lib-q'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.q = el.value; st.limit = 40; const l = $(pk ? '#pick-list' : '#lib-list'); if (l) l.innerHTML = libRows(pk); },
    'w-kg'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].kg = el.value.trim(); lazyActive(); },
    'w-reps'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].reps = el.value.trim(); lazyActive(); },
    're-name'(el) { ui.edit.name = el.value; }, 're-sets'(el) { ui.edit.items[+el.dataset.i].sets = el.value; },
    're-reps'(el) { ui.edit.items[+el.dataset.i].reps = el.value; }, 're-rir'(el) { ui.edit.items[+el.dataset.i].rir = el.value; },
    'mx-n'(el) { ui.myex.n = el.value; }, 'mx-steps'(el) { ui.myex.steps[+el.dataset.index] = el.value; }, 'mx-vid'(el) { ui.myex.vid = el.value; }, 'mx-eq'(el) { ui.myex.eq = EQS.indexOf(el.value) >= 0 ? el.value : 'other'; },
    'plan-tg'(el) { if (D().plan) { D().plan.targets = el.checked; Store.save(); rerender(); } }, 're-rest'(el) { ui.edit.items[+el.dataset.i].rest = el.value; },
    'ai-hint'(el) { ui.ai.hint = el.value; }, 'ai-text'(el) { ui.ai.text = el.value; },
    'ai-f'(el) {
      const it = ui.ai.res.items[+el.dataset.i], k = el.dataset.k, P = { kcal: 'k100', p: 'p100', c: 'c100', f: 'f100' };
      if (k === 'name') { it.name = el.value; return; }
      if (!it || !(k === 'grams' || P[k])) return;
      it[k] = Math.max(0, num(el.value));
      if (k === 'grams') { FoodAI.total(it); Object.keys(P).forEach(m => { const inp = $(`[data-in="ai-f"][data-k="${m}"][data-i="${el.dataset.i}"]`); if (inp) inp.value = it[m]; }); }   // new weight: same food, so everything scales with it
      else if (it.grams > 0) it[P[k]] = it[k] / it.grams * 100;
      const tot = $('#ai-tot'); if (tot) tot.textContent = Math.round(ui.ai.res.items.reduce((a, i) => a + num(i.kcal), 0));
    },
    'key-draft'(el) { ui.keyDraft = el.value; const b = $('[data-a="key-save"]'); if (b) b.disabled = !el.value.trim(); },
    'set-model'(el) { if (Store.MODELS.indexOf(el.value) >= 0) { D().settings.model = el.value; Store.save(); } },
    'set-rest'(el) { D().settings.restAuto = el.checked; Store.save(); }, 'set-sound'(el) { D().settings.sound = el.checked; Store.save(); },
    'set-flag'(el) { const k = el.dataset.k; if (['vibrate', 'awake', 'autofill', 'calm', 'solid', 'addActive', 'coach', 'syncKey', 'stretch'].indexOf(k) < 0) return; D().settings[k] = el.checked; Store.save(); applyLook(); if (k === 'awake' && !el.checked) unwake(); if (k === 'addActive' || k === 'coach' || k === 'stretch') rerender(); if (k === 'stretch') refreshSheet(); },
    'coach-q'(el) { ui.coach.draft = el.value; },
    'set-hue'(el) { const v = Math.round(+el.value); if (!(v >= 0 && v <= 359)) return; D().settings.hue = v; applyLook(); clearTimeout(hueT); hueT = setTimeout(() => { Store.save(); if (topIs('settings') && !$('#sheet [data-a="hue-reset"]')) refreshSheet(); }, 500); },   // colour follows the finger; saved when it rests
    'set-photo-model'(el) { D().settings.photoModel = Store.MODELS.indexOf(el.value) >= 0 ? el.value : ''; Store.save(); },
    'lib-eq'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.eq = EQS.indexOf(el.value) >= 0 ? el.value : ''; st.limit = 40; const l = $(pk ? '#pick-list' : '#lib-list'); if (l) l.innerHTML = libRows(pk); },
    'act-f'(el) { if (el.dataset.k === 'steps' || el.dataset.k === 'kcal') ui.act[el.dataset.k] = el.value; },
    'act-paste'(el) { if (/\d/.test(el.value) && el.value.length > 3) { const o = parseAct(el.value); if (o.steps > 0 || o.kcal > 0) { actFill(o); el.value = ''; } } },
    'set-num'(el) { const k = el.dataset.k, v = +el.value, ok = { restDefault: [60, 90, 120, 150, 180], weekGoal: [0, 2, 3, 4, 5, 6, 7], weekStart: [0, 1], hold: [20, 30, 45] }[k]; if (!ok || ok.indexOf(v) < 0) return; D().settings[k] = v; Store.save(); rerender(); },
    'fs-q'(el) { ui.fs.q = el.value; const l = $('#fs-list'); if (l) l.innerHTML = foodRows(); },
    'fa-g'(el) { ui.fa.g = el.value; const o = $('#fa-out'); if (o) o.innerHTML = faOut(); $$('#sheet [data-a="fa-set"]').forEach(c => c.classList.toggle('on', num(el.value) === +c.dataset.g)); },
    'tg-p'(el) {
      if (el.type === 'radio' && !el.checked) return;
      ui.tg.profile[el.dataset.k] = el.value; const c = calcTargets(ui.tg.profile); $('#tg-out').innerHTML = tgOut(c, ui.tg.profile);
      if (c && !c.bad) { ui.tg.vals = { kcal: c.kcal, p: c.p, c: c.c, f: c.f }; ['kcal', 'p', 'c', 'f'].forEach(k => { $('#tg-' + k).value = c[k]; }); }
    },
    'tg-v'(el) { ui.tg.vals[el.dataset.k] = el.value; }
  };
  document.addEventListener('input', e => { const el = e.target, k = el.dataset && el.dataset.in; if (k && IN[k] && el.type !== 'file') IN[k](el); });
  document.addEventListener('change', async e => {
    const el = e.target, k = el.dataset && el.dataset.in;
    if (k === 'ai-file' && el.files[0]) { const s0 = ui.ai; try { const r = await FoodAI.shrink(el.files[0], 1568); if (ui.ai === s0 && s0.imgs.length < 2) { s0.imgs.push({ url: r.dataUrl, b64: r.base64, warn: r.luma < 45 ? 'dark' : r.side < 640 ? 'small' : '' }); s0.err = null; } } catch (er) { s0.err = { code: 'image' }; } if (ui.ai === s0) refreshSheet(); }   // 1568 px: the largest size the model looks at without shrinking it again
    if (k === 'mx-file' && el.files[0]) { const s0 = ui.myex, key = el.dataset.key === 'endImg' ? 'endImg' : 'img'; try { const u = await smallPic(el.files[0]); if (ui.myex === s0) { s0[key] = u; if (topIs('myex')) refreshSheet(); } } catch (er) { toast(t('picBad')); } el.value = ''; }
    if (k === 'exm-file' && el.files[0]) {
      const id = el.dataset.id, had = D().exMedia[id];
      try { if (!(had && had.img) && picCount() >= 30) { toast(t('picLimit')); } else { const u = await smallPic(el.files[0]); if (EX[id]) { D().exMedia[id] = { img: u, vid: (had && had.vid) || '' }; Store.save(); refreshSheet(); if (!ui.wOpen) rerender(); toast(t('saved')); } } } catch (er) { toast(t('picBad')); }
      el.value = '';
    }
    if (k === 'import' && el.files[0]) {
      let plan = null; try { plan = JSON.parse(await el.files[0].text()); } catch (er) { plan = null; }
      if (plan && plan.app === 'gymapp' && plan.kind === 'plan') {                           // a plan file: routines, meal plan, rules; the log stays
        const nr = Array.isArray(plan.routines) ? plan.routines.length : 0, nm = plan.plan && Array.isArray(plan.plan.days) ? plan.plan.days.reduce((a, x) => a + (x && Array.isArray(x.meals) ? x.meals.length : 0), 0) : 0;
        if (!nr && !nm) toast(t('importBad'));
        else if (confirm(t('planConfirm', nr, nm))) { applyPlan(plan); ui.foodDate = today(); closeSheet(true); render(); toast(t('planLoaded')); }
        el.value = ''; return;
      }
      try { const o = JSON.parse(await el.files[0].text()), d = o && o.data ? o.data : o; if (!d || !Array.isArray(d.workouts) || !Array.isArray(d.routines)) throw 0;
        if (confirm(t('importConfirm', d.workouts.length))) { Store.replace(d); ui.wOpen = false; ui.foodDate = today(); closeSheet(true); render(); toast(t('imported')); } } catch (er) { toast(t('importBad')); }
      el.value = '';
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.in === 'w-reps') { e.preventDefault(); e.target.blur(); const b = $('.set-ok', e.target.closest('.set')); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); } });
  document.addEventListener('submit', e => {
    const f = e.target, k = f.dataset.f; if (!k) return; e.preventDefault(); const v = Object.fromEntries(new FormData(f));
    if (k === 'habit-amount') { const x = ui.habitAmount, h = x && D().habits.find(z => z.id === x.id); if (!h || !habitDue(h, x.day) || x.day > today() || !/^[0-9]+([.,][0-9]+)?$/.test(String(v.value).trim()) || num(v.value) < 0 || num(v.value) > 200000) { toast(t('badValue')); return; } h.logs[x.day] = { v: r1(num(v.value)), t: Date.now() }; Store.save(); closeSheet(); if (topIs('day')) refreshSheet(); rerender(); }
    if (k === 'bw') { const kg = r1(num(v.kg)); if (!(kg > 20 && kg < 400)) { toast(t('badValue')); return; } const d = D(); d.body = d.body.filter(b => b.d !== today()); d.body.push({ d: today(), kg }); Store.save(); rerender(); toast(t('saved')); }
    if (k === 'food-manual') { if (ui.manual && ui.manual.requireMacros && ['kcal', 'p', 'c', 'f'].some(key => !/^[0-9]+([.,][0-9]+)?$/.test(String(v[key]).trim()))) { toast(t('badValue')); return; } if (!(num(v.kcal) >= 0) || !String(v.name).trim()) return;
      const g = num(v.g), nm = String(v.name).trim().slice(0, 80);
      if (v.keep && g > 0 && num(v.kcal) > 0) { const k100 = x => r1(num(x) * 100 / g), d = D(), same = d.myFoods.find(z => z.name.toLowerCase() === nm.toLowerCase());     // kept for next time, counted back to 100 g
        const z = { id: same ? same.id : uid(), name: nm, kcal: k100(v.kcal), p: k100(v.p), c: k100(v.c), f: k100(v.f), port: Math.round(g), t: Date.now() }; d.myFoods = same ? d.myFoods.map(o => o.id === z.id ? z : o) : d.myFoods.concat([z]); }
      addFood([v], 'manual'); closeSheet(true); rerender(); toast(t('added')); }
    if (k === 'myfood') {
      const nm = String(v.name || '').trim().slice(0, 80), kc = num(v.kcal); if (!nm || !(kc > 0 && kc <= 950)) { toast(t('badValue')); return; }
      if ([v.p, v.c, v.f].some(x => num(x) < 0 || num(x) > 100)) { toast(t('badValue')); return; }
      const d = D(), id = ui.myfood.id, z = { id: id || uid(), name: nm, kcal: r1(kc), p: r1(num(v.p)), c: r1(num(v.c)), f: r1(num(v.f)), port: Math.max(0, Math.min(5000, Math.round(num(v.port)))), t: Date.now() };
      d.myFoods = id ? d.myFoods.map(o => o.id === id ? z : o) : d.myFoods.concat([z]); Store.save(); closeSheet(); if (topIs('settings')) refreshSheet(); toast(t('saved'));
    }
    if (k === 'exm-vid') {
      const id = f.dataset.id, vid = String(v.vid || '').trim(), had = D().exMedia[id];
      if (EX[id]) { if (vid || (had && had.img)) D().exMedia[id] = { img: (had && had.img) || '', vid }; else delete D().exMedia[id]; Store.save(); closeSheet(); toast(t('saved')); }
    }
    if (k === 'coach') coachSend(v.q);
    if (k === 'gate') gateSubmit(v);
  });

  /* A photo missing from this copy of the app is fetched from the open dataset instead (needs a connection). */
  document.addEventListener('error', e => {
    const el = e.target; if (!el || el.tagName !== 'IMG') return; const src = el.getAttribute('src') || '';
    if (src.indexOf('img/fig/') === 0 || src.indexOf('img/guide/') === 0) {
      ui.figBad[src] = 1;
      const picture = el.closest('.drawing-picture');
      if (picture) { picture.innerHTML = `<span class="phase-missing">${esc(t('artUnavailable'))}</span>`; const button = picture.closest('button'); if (button) button.disabled = true; }
      return;
    }
    if (src.indexOf('img/ex/') === 0 && /\/t\.jpg$/.test(src) && !el.dataset.t) { el.dataset.t = '1'; el.src = src.replace(/t\.jpg$/, '0.jpg'); return; }                                       // no small picture: use the large one
    if (src.indexOf('img/ex/') === 0 && !el.dataset.fb && (EX[decodeURIComponent(src.split('/')[2])] || {}).k) { el.dataset.fb = '1'; el.src = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + src.slice(7).replace(/t\.jpg$/, '0.jpg'); }
    else if (el.dataset.fb || src.indexOf('img/ex/') === 0) el.style.visibility = 'hidden';
  }, true);

  /* ================= INIT ================= */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = !!navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  Store.load(); applyLook();
  let failT = 0; Store.onFail = () => { if (Date.now() - failT > 4000) { failT = Date.now(); setTimeout(() => toast(t('saveFailed')), 0); } };
  dlg().addEventListener('close', () => { ui.sheets = []; });
  dlg().addEventListener('cancel', e => { e.preventDefault(); closeSheet(true); });      // Esc key: close with the same slide
  document.addEventListener('touchstart', () => {}, { passive: true });                   // lets iOS show the pressed state of buttons
  dlg().addEventListener('click', e => { if (e.target !== dlg()) return; const r = dlg().getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) closeSheet(true); });
  Charts.bind(document);
  $('#tabbar').innerHTML = [['home', IC.home], ['habits', IC.habit], ['lib', IC.lib], ['prog', IC.prog], ['food', IC.food]].map(([k, ic]) => `<button data-a="tab" data-tab="${k}">${ic}<span></span></button>`).join('');
  $('#restbar').innerHTML = `<div class="rb-in"><span class="rb-l">${IC.check}</span><b id="rb-time">0:00</b><span class="rb-track"><i id="rb-fill"></i></span><button class="btn sm" data-a="rest-add" data-s="-15">−15</button><button class="btn sm" data-a="rest-add" data-s="15">+15</button><button class="btn sm primary" data-a="rest-skip" id="rb-skip"></button></div>`;
  { const cb = $('#coach'); if (cb) { cb.innerHTML = IC.chat; cb.dataset.a = 'coach'; } }
  render(); $('#rb-skip').textContent = t('skip');
  renderGate();
  try {
    const result = JSON.parse(sessionStorage.getItem('gym-update-result') || 'null');
    sessionStorage.removeItem('gym-update-result');
    if (result && Date.now() - result.at < 120000) { ui.updateStatus = result.version === APP_BUILD ? 'updateSuccess' : 'updateReloaded'; toast(updateStatusText()); }
  } catch (e) {}
  if (CL) {
    Store.onSave = syncSoon;
    window.addEventListener('online', () => doSync(false));
    CL.fromLink().then(r => { if (r === 'recovery') { ui.gate = { mode: 'newpw', email: '', busy: false, err: '', info: '' }; renderGate(); } else if (r === 'in') signedIn(); }).catch(() => {});
    if (CL.user) signedIn();
  }
  setInterval(tick, 500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { dayCheck(); tick(); if (D().active && ui.wOpen) wake(); if (CL && CL.user && Date.now() - CL.state.at > 30000) doSync(false); } });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => { ui.persisted = p; }).catch(() => {});
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  window.__gym = { ui, render, A, parseAct, aiMemo, dbCheck, autoIcon, coachContext, coachSystem, doSync, hueRGB, calcTargets, prepList, dayTargets, nextRoutine, applyPlan }; window.__gymFood = { search: foodSearch, of: foodOf };
})();
