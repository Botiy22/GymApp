(function startGymApp() {
  'use strict';
  if (!window.ROUTINE_ART) {
    const script=document.createElement('script');script.src='data/routine-art.js';
    script.onload=startGymApp;script.onerror=()=>{window.ROUTINE_ART={};startGymApp();};
    document.head.append(script);return;
  }
  if (!document.querySelector('link[href="css/design.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/design.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/profile.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/profile.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/otisport-theme.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/otisport-theme.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/ride.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/ride.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/clean.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/clean.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/stories.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/stories.css'; document.head.append(style); }
  if (!document.querySelector('link[href="css/planner.css"]')) { const style=document.createElement('link');style.rel='stylesheet';style.href='css/planner.css';document.head.append(style); }
  if(!document.querySelector('link[href="css/recipes-stability.css"]')){const style=document.createElement('link');style.rel='stylesheet';style.href='css/recipes-stability.css';document.head.append(style);}
  // A previously cached HTML shell may receive this newer app script before its new script tags.
  // Load the release metadata before initializing storage or installing event handlers.
  if (!window.CookArt || !window.RECOVERY_PROGRAMS || !window.RECIPES?.items?.some(r=>r.id==='clip-protein-banana-muffins') || !window.I18N?.en?.recoveryReady || !window.Store?.supportsStability || !window.I18N?.en?.stabilityTitle || !window.ICAL || !window.DailyPlanner || !window.Store?.supportsPlanner || !window.Cloud?.supportsPlanner || !window.I18N?.en?.plannerTitle || !window.Stories || !window.Competition || !window.RoutineShare?.sharingUpdates || !window.AppUpdates || !window.AccentTheme || !window.HueWheel || !window.FoodVolume || !window.RoutineTemplates?.genericFiveDay || !window.WorkoutEnergy || !window.PersonalSetup || !window.GYM_RELEASE || !window.OfficeLocal || !window.PlanSheet || !window.PDFLocal || !window.PlanImport || !window.StrengthRanks?.lowWeights || (!window.Profile?.cleanStyle || !window.Profile?.coverPhotos) || !window.Social?.consistency || !window.Cloud?.consistencyRpc || !window.Cloud?.supportsMealGroups || !window.Rides || (!window.Store?.supportsMaterial || !window.Store?.retiredPersonalSplit || !window.Store?.supportsRides || !window.Store?.supportsMealGroups) || !window.ModalLock) {
    const src = !window.CookArt ? 'js/cook-art.js' : !window.RECOVERY_PROGRAMS ? 'data/recovery.js' : !window.RECIPES?.items?.some(r=>r.id==='clip-protein-banana-muffins') ? 'data/clip-recipes.js' : !window.I18N?.en?.recoveryReady ? 'js/i18n.js' : !window.Store?.supportsStability ? 'js/store.js' : !window.I18N?.en?.stabilityTitle ? 'js/i18n.js' : !window.ICAL ? 'vendor/ical/ical.min.js' : !window.DailyPlanner ? 'js/daily-planner.js' : !window.Store?.supportsPlanner ? 'js/store.js' : !window.Cloud?.supportsPlanner ? 'js/cloud.js' : !window.I18N?.en?.plannerTitle ? 'js/i18n.js' : !window.Stories ? 'js/stories.js' : !window.MuscleRanks ? 'js/muscle-ranks.js' : !window.Rides ? 'js/rides.js' : !window.Competition ? 'js/competition.js' : !window.RoutineShare?.sharingUpdates ? 'js/routine-share.js' : !window.AppUpdates ? 'js/app-updates.js' : !window.AccentTheme ? 'js/accent-theme.js' : !window.HueWheel ? 'js/hue-wheel.js' : !window.FoodVolume ? 'js/food-volume.js' : !window.RoutineTemplates?.genericFiveDay ? 'js/routine-templates.js' : !window.WorkoutEnergy ? 'js/workout-energy.js' : !window.PersonalSetup ? 'js/personal-setup.js' : !window.GYM_RELEASE ? 'js/release.js' : !window.OfficeLocal ? 'js/office-local.js' : !window.PlanSheet ? 'js/plan-sheet.js' : !window.PDFLocal ? 'js/pdf-local.js' : !window.PlanImport ? 'js/plan-import.js' : !window.StrengthRanks?.lowWeights ? 'js/strength-ranks.js' : (!window.Profile?.cleanStyle || !window.Profile?.coverPhotos) ? 'js/profile.js' : !window.Social?.consistency ? 'js/social.js' : !window.Cloud?.consistencyRpc || !window.Cloud?.supportsMealGroups ? 'js/cloud.js' : (!window.Store?.supportsMaterial || !window.Store?.retiredPersonalSplit || !window.Store?.supportsRides || !window.Store?.supportsMealGroups) ? 'js/store.js' : 'js/modal-lock.js';
    const script = document.createElement('script');
    // A distinct URL avoids re-executing the document's cached older script.
    script.src=src+'?release='+encodeURIComponent(window.GYM_RELEASE?.cacheId||'latest');
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
    const attempted=startGymApp.attempted||(startGymApp.attempted=new Set());
    if(attempted.has(src)){script.onerror();return;}
    attempted.add(src);document.head.append(script);
    return;
  }
  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const D = () => Store.d;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = () => D().settings.lang || ((navigator.language || 'en').toLowerCase().startsWith('hu') ? 'hu' : 'en');
  const t = (k, ...a) => { const d = I18N[L()], s = d[k] != null ? d[k] : (I18N.en[k] != null ? I18N.en[k] : k); return a.length ? s.replace(/\{(\d)\}/g, (m, i) => a[+i]) : s; };
  // "6-day · Push / Pull / Legs · Push" reads as "Push" wherever the split is already clear from context.
  const shortName = n => { n = String(n == null ? '' : n); const hit = (window.RoutineTemplates ? RoutineTemplates.templates : []).flatMap(p => [p.name.hu, p.name.en]).find(x => x && n.startsWith(x + ' · ')); return hit ? n.slice(hit.length + 3) : n; };
  const pl = (n, k) => +n === 1 && L() === 'en' && I18N.en[k + '1'] ? I18N.en[k + '1'] : t(k);     // singular for one, in English
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const today = () => ymd(Date.now());
  const fmtDate = (d, long) => new Date(d).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', long ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' });
  const fmtDur = ms => { const m = Math.round(ms / 60000); return m >= 60 ? Math.floor(m / 60) + ' ' + t('h') + (m % 60 ? ' ' + (m % 60) + ' ' + t('min') : '') : m + ' ' + t('min'); };
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
  const thumb = id => ownPic(id) || (!ui.figBad[id] && window.ROUTINE_ART[id]?.thumb) || (!ui.figBad[id] && window.FIG?.[id] ? 'img/fig/'+window.FIG[id]+'-0.svg' : '') || (window.EX_ART && window.EX_ART[id] ? 'img/fig/' + window.EX_ART[id] + '.webp' : 'img/ex/' + encodeURIComponent(id) + '/t.jpg');
  const FIG = window.FIG || {};                                                        // exercise id -> line drawing (Everkinetic)
  const EXHU = window.EX_HU || {};                                                   // Hungarian names and steps for the whole library
  const exName = id => { const e = EX[id]; if (!e) return /^my_/.test(id) ? t('myExGone') : id; return L() === 'hu' ? (HU_NAME[id] || (EXHU[id] && EXHU[id][0]) || e.n) : e.n; };
  const exSteps = id => { const hu = L() === 'hu' && EXHU[id] ? (EXHU[id][1] || []).filter(Boolean) : []; return hu.length ? { list: hu, own: true } : { list: (EX[id].i || []).filter(Boolean), own: L() !== 'hu' || !!EX[id].own }; };
  /* Our own database: exercises the user added live in their data (and account) and are merged into the library here. */
  const BASE_N = window.EXERCISES.length; let ownRef = null;
  function ownSync() {
    const my = D().myEx; if (my === ownRef) return; ownRef = my;
    window.EXERCISES.length = BASE_N; Object.keys(EX).forEach(k => { if (EX[k].own) delete EX[k]; });
    my.forEach(e => { if (EX[e.id]) return; const x = { id: e.id, n: e.n, p: e.p, s: e.s, eq: e.eq, c: 'strength', lv: '', m: '', f: '', i: e.steps, k: 0, own: true, img: e.img, vid: e.vid }; window.EXERCISES.push(x); EX[x.id] = x; });
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
  const ui = { day: today(), tab: 'home', goals: 'planner', plannerDate:today(), plannerView:'day', workout: 'train', food: 'diary', idea: '', fs: { q: '', hits: [] }, fa: null, lib: { q: '', grp: '', mus: '', eq: '', limit: 40 }, pick: { q: '', grp: '', mus: '', eq: '', limit: 40, sel: [] }, prog: 'overview', foodDate: today(), mealOpen: {}, habitDate: today(), habitMonth: today().slice(0, 7), habitEdit: null, wOpen: false, sheets: [], ai: null, figBad: {}, coach: newCoach(), gate: { mode: 'in', email: '', busy: false, err: '', info: '' } };

  /* ---------- icons ---------- */
  const IC = {
    del:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>',
    more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
    profile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M12 17v-5m-3 3 3-3 3 3"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6A7.6 7.6 0 0 0 6.900 6.600l-2.300-1-2 3.400 2 1.500a7.600 7.600 0 0 0 0 3l-2 1.500 2 3.400 2.300-1a7.600 7.600 0 0 0 2.600 1.500l.5 2.600h4l.5-2.600a7.600 7.600 0 0 0 2.600-1.500l2.300 1 2-3.400z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 10v4M6.500 6.500v11M17.500 6.500v11M21 10v4M6.500 12h11"/></svg>',
    lib: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.500"/><path d="M16 16l5 5"/></svg>',
    prog: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    food: '<svg viewBox="0 0 24 24"><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 1-3 4-3 7 0 2 1 3 3 3v8"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3.500l1.500-2.500h6L16.500 8H20v11H4z"/><circle cx="12" cy="13.500" r="3.200"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.500 4.500l3 3L8 19z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 10l6 6 6-6"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.500v13l11-6.500z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
    bike: '<svg viewBox="0 0 24 24"><circle cx="5.500" cy="16.500" r="3.500"/><circle cx="18.500" cy="16.500" r="3.500"/><path d="M5.500 16.500 9.500 9h6l3 7.500M9.500 9 12 16.500h-6.500M14 5.500h2.500l-1 3.500M8 7h3"/></svg>',
    locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.500"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    bt: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10-5 4V3l5 4L7 17"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    walk: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.500" r="1.800"/><path d="M9 21l2.500-6.500L9.500 12l1-5 3 1.500 1.500 3 3 1M11.500 14.500l3 2.500 1 4M10.500 7L7 9v3"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.600l2.600 5.300 5.800.800-4.200 4.100 1 5.800-5.200-2.700-5.200 2.700 1-5.800-4.200-4.100 5.800-.800z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M4 6.500h16v13H4zM4 10.500h16M8 4v4M16 4v4"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5.500h16v10.500h-8.500L7 20v-4H4z"/><path d="M8.500 9.500h7M8.500 12.500h4.500"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M4 12l16-7.500-5 15.500-3.500-6z"/><path d="M11.500 14L20 4.500"/></svg>',
    stretch: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.300" r="1.800"/><path d="M12 7v7.500M12 9.500L6.500 5M12 9.500L17.500 5M12 14.500L8 21M12 14.500L16 21"/></svg>',
    habit: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 15l3 3 5-5"/></svg>'
  };
  /* routine icons: chosen from the muscles of the routine, or picked by hand in the editor */
  const RICON = {
    upper: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 8V5h10v3l5 5-3 4-4-3v13h-6V14l-4 3-3-4z"/><path class="muscle" d="M12 12h8v7h-8z"/><path d="M16 12v7M12 22h8"/></svg>',
    lower: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M10 4h12l1 8-4 16h-5l2-13-3 13H8l2-16z"/><path d="M10 10h12"/><path class="muscle" d="m11 13 3 1-2 8h-2zM18 13h3l-2 9h-2z"/></svg>',
    legs: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M8 6h16M10 3v6M22 3v6M12 12h8l3 8-4 8h-5l3-7-4-5M12 12l-4 8 4 8"/><path class="muscle" d="m12 15 3 2-4 5-2-2zM19 15l2 5-2 2-3-5z"/></svg>',
    push: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 6h24M7 3v6M25 3v6M10 10v6h12v-6M7 22h18M9 22v6M23 22v6"/><path class="muscle" d="M10 16h12v4H10z"/><path d="M16 11V3m-3 3 3-3 3 3"/></svg>',
    pull: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 4h22M7 4v6l5 7M25 4v6l-5 7M10 27V16M22 27V16"/><path class="muscle" d="m10 16 6 2 6-2-3 9h-6z"/><path d="M16 6v8m-3-3 3 3 3-3"/></svg>',
    core: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M10 4h12l2 7-3 16H11L8 11z"/><path class="muscle" d="M12 10h8v13h-8z"/><path d="M16 10v13M12 14h8M12 18h8"/></svg>',
    arms: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="m6 24 4-8 3-2 1-6-4-1-2 4-3-1 2-7h9l1 10c7-1 10 3 9 8-1 6-14 9-20 3z"/><path class="muscle" d="M16 17c6-3 9 0 7 4-2 2-6 2-9 0z"/></svg>',
    full: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 7h18v18H7zM3 12v8M29 12v8M7 16h18M12 3h8M12 29h8"/><path class="muscle" d="m17 10-6 8h5l-1 5 6-8h-5z"/></svg>',
    cardio: '<svg class="routine-symbol" viewBox="0 0 32 32" aria-hidden="true"><path d="m13 5-4 8 3 4 5-4 3 5 7 3v6H8l-3-3 4-8M4 9h4M3 13h3M17 23h7"/><path class="muscle" d="m14 16 3-3 3 5-4 2z"/></svg>',
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
  const rIcon = r => RICON[r.icon] ? r.icon : r.builtin && ['upper','lower','push','pull','legs'].includes(r.id) ? r.id : autoIcon(r);

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
  const volumeText = n => n.toLocaleString(L()==='hu'?'hu-HU':'en-GB',{maximumFractionDigits:2});
  const setsOf = w => w.tick ? (w.pl || []).reduce((a, x) => a + x.n, 0) : w.entries.reduce((a, e) => a + e.sets.filter(s => !s.w).length, 0);
  const workoutDuration = w => !w.entries.length&&(w.cardio||[]).length?w.cardio.reduce((n,c)=>n+c.minutes*60000,0):w.end-w.start;
  const wMeta = w => (w.tick ? t('tickedTag') : fmtDur(workoutDuration(w))) + ' · ' + setsOf(w) + ' ' + t('setsWord') + (w.tick ? '' : ' · ' + compact(volOf(w)) + ' kg');
  function weekWorkouts() { const ws = weekStart(Date.now()).getTime(); return D().workouts.filter(w => w.start >= ws); }
  function muscleSets(ws) {
    const m = {};
    const add = (id, n) => { const x = EX[id]; if (!x) return; x.p.forEach(k => { m[k] = (m[k] || 0) + n; }); x.s.forEach(k => { m[k] = (m[k] || 0) + n * 0.5; }); };
    ws.forEach(w => { if (w.tick) (w.pl || []).forEach(z => add(z.ex, z.n)); else w.entries.forEach(e => add(e.ex, e.sets.filter(s => !s.w).length)); });      // a ticked workout counts with its planned sets
    return m;
  }
  function nextRoutine() {
    const all = D().routines.filter(r=>!RoutineTemplates.isComplex(r)&&!r.focus); if (!all.length) return null;
    const must = all.filter(r => !r.opt), rs = must.length ? must : all;                  // optional days are never offered as "next"
    const ws = D().workouts; for (let i = ws.length - 1; i >= 0; i--) { const k = rs.findIndex(r => r.id === ws[i].rid); if (k >= 0) return rs[(k + 1) % rs.length]; }
    return rs[0];
  }
  const estMin = RoutineTemplates.estimateMinutes;
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
  const head = (title, sub, cal, update=false) => (sub === title ? (sub = '') : 0, `<header class="top"><div><span class="app-wordmark" aria-hidden="true"><img src="icons/reppsy-192-v2.png" width="20" height="20" alt="">${esc(t('appName').toUpperCase())}</span><h1>${esc(title)}</h1>${sub ? (cal ? `<button class="datebtn" data-a="cal" aria-label="${esc(t('openCal'))}">${esc(sub)}${IC.down}</button>` : `<p>${esc(sub)}</p>`) : ''}</div><div class="top-actions">${update?updateButton():''}<button class="icon-btn upload-plan" data-a="pdf-plan" aria-label="${esc(t('uploadPlan'))}" title="${esc(t('uploadPlan'))}">${IC.upload}</button>${profileShortcut()}</div></header>`);
  function popFav(on) { const b = $('#sheet .favbtn'); if (b && on) b.classList.add('pop'); }
  const BI_RIDS = new Set((window.EXTRA_ROUTINES || []).map(r => r.id));
  const bi = (s, rid) => { if (!BI_RIDS.has(rid)) return s; const p = String(s).split(' / '); return p.length === 2 && p[0] && p[1] ? p[L() === 'hu' ? 0 : 1] : s; };
  function updateButton(){return ui.updateAvailable||ui.updateBusy?`<button class="icon-btn update-app${ui.updateBusy?' busy':''}" data-a="settings-update" aria-label="${esc(t(ui.updateBusy?'updating':'updateNow'))}" title="${esc(t('updateAvailable'))}" ${ui.updateBusy?'disabled':''}>${IC.refresh}<span class="update-dot" aria-hidden="true"></span></button>`:'';}
  function syncUpdateButton(){
    const actions=$('#view > .top .top-actions');if(!actions||ui.tab!=='settings')return;
    const existing=$('.update-app',actions),html=updateButton();
    if(existing){if(html)existing.outerHTML=html;else existing.remove();}else if(html)actions.insertAdjacentHTML('afterbegin',html);
  }
  let updateCheckAt=0,updateChecking=null;
  async function checkForUpdate(force=false){
    if(updateChecking)return updateChecking;
    if(!force&&Date.now()-updateCheckAt<60000)return;updateCheckAt=Date.now();
    updateChecking=(async()=>{try{const next=await AppUpdates.latest();ui.updateAvailable=AppUpdates.newer(GYM_RELEASE,next)?next:null;syncUpdateButton();}catch(error){/* Offline or failed check does not invent an available update. */}finally{updateChecking=null;}})();
    return updateChecking;
  }
  function updateOverlay(){
    const dialog=document.createElement('dialog');dialog.className='app-update-overlay';dialog.id='app-update-progress';dialog.setAttribute('aria-label',t('updating'));
    dialog.innerHTML=`<div class="app-update-card" role="status" aria-live="polite"><div class="reload-mark"><img src="icons/reppsy-mark-v2.png" width="80" height="80" alt=""></div><b>Reppsy</b><p>${esc(t('updating'))}</p></div>`;
    dialog.addEventListener('cancel',e=>e.preventDefault());document.body.append(dialog);const unlock=ModalLock.acquire(dialog);dialog.showModal();
    return {message:key=>{$('p',dialog).textContent=t(key);dialog.classList.add('ready');return settleMark($('.reload-mark img',dialog));},close:()=>{dialog.close();dialog.remove();unlock();}};
  }
  /* Ready: the spinning mark slows down and comes to rest upright instead of freezing mid-turn. */
  function settleMark(img){
    try{
      if(!img||!img.getAnimations)return;const spin=img.getAnimations();if(!spin.length)return;
      const m=new DOMMatrix(getComputedStyle(img).transform),angle=(Math.atan2(m.b,m.a)*180/Math.PI+360)%360;
      let rest=360-angle;if(rest<120)rest+=360;                                              // at least a third of a turn, so it never stops abruptly
      const ms=Math.max(500,Math.min(1100,rest/0.343*1.6));                                   // starts at the spinning speed (343°/s), then eases out
      spin.forEach(a=>a.cancel());img.style.transform='rotate('+(angle+rest)+'deg)';
      img.animate([{transform:'rotate('+angle+'deg)'},{transform:'rotate('+(angle+rest)+'deg)'}],{duration:ms,easing:'cubic-bezier(.33,.53,.3,1)'});
      return ms;
    }catch(e){}
  }
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
    h += `<section class="card momentum-hero"><div class="momentum-dial" data-clock-key="goals-${esc(k)}" data-clock-ratio="${percent/100}">${Profile.dial(percent,100,percent+"%")}<b>${percent}%</b></div><div><small>${esc(t('momentumSub'))}</small><h2>${esc(t(due.length ? done === due.length ? 'momentumDone' : 'momentumProgress' : 'momentumRest'))}</h2><p>${done} / ${due.length} ${esc(t('momentumRate'))}</p></div></section>`;
    const start = ui.habitWeek || ymd(weekStart(k + 'T12:00'));
    h += `<section class="momentum-week-browser" aria-label="${esc(t('weekBrowse'))}"><div class="momentum-week-nav"><button class="icon-btn sm" data-a="habit-week-step" data-d="-1" aria-label="${esc(t('prevWeek'))}">${IC.back}</button><span><b>${esc(t('weekBrowse'))}</b><small aria-live="polite">${esc(fmtDate(start+'T12:00',true))} – ${esc(fmtDate(Momentum.shift(start,6)+'T12:00',true))}</small></span><button class="icon-btn sm flip" data-a="habit-week-step" data-d="1" aria-label="${esc(t('nextWeek'))}">${IC.back}</button></div><div class="momentum-week">${Array.from({ length: 7 }, (_, i) => { const key = Momentum.shift(start, i), s = Momentum.summary(D().habits, key, D()); return `<button class="${key === k ? 'selected' : ''}" data-a="habit-select-date" data-d="${key}" ${key > today() ? 'disabled' : ''} aria-label="${esc(fmtDate(key + 'T12:00', true))}: ${s.done}/${s.total}"><i>${esc(new Date(key + 'T12:00').toLocaleDateString(loc, { weekday: 'narrow' }))}</i><b>${key.slice(-2)}</b><span style="--fill:${s.total ? s.ratio * 100 : 0}%"></span></button>`; }).join('')}</div></section>`;
    h += `<div class="card habit-card"><div class="h2row"><h2>${esc(t('habitsDaily'))}</h2><span class="habit-count">${done}/${due.length}</span></div>${habitRows(k)}</div><button class="btn primary habit-add" data-a="habit-new">${IC.plus}${esc(t('habitAdd'))}</button>`;
    h += `<details class="card goal-templates"><summary>${esc(t('momentumTemplates'))}${IC.down}</summary><div class="chips">${['Water', 'Read', 'Stretch', 'Steps', 'Workout', 'Protein'].map((n, i) => `<button class="chip" data-a="habit-template" data-i="${i}">${esc(t('tpl' + n))}</button>`).join('')}</div><p class="cap">${esc(t('habitEmpty'))}</p></details>`;
    let recentTotal = 0, recentDone = 0;
    const recentStart = Momentum.shift(today(), -27);
    for (let i = 0; i < 28; i++) { const s = Momentum.summary(D().habits, Momentum.shift(recentStart, i), D()); recentTotal += s.total; recentDone += s.done; }
    h += `<section class="card momentum-recent"><h3>${esc(t('momentum28'))}</h3><p class="cap">${esc(fmtDate(recentStart + 'T12:00'))} – ${esc(fmtDate(today() + 'T12:00'))}</p><b>${esc(recentTotal ? t('momentumMonthSummary', recentDone, recentTotal, Math.round(recentDone / recentTotal * 100)) : t('momentumMonthEmpty'))}</b></section>`;
    h += habitMonthView();
    return h;
  }
  function weightFor(day) {
    const latest=D().body.filter(b=>b.d<=day).sort((a,b)=>b.d.localeCompare(a.d))[0];
    const weight=latest?latest.kg:num(D().settings.profile.weight);
    return weight>=30&&weight<=300?weight:'';
  }
  function energyDay(day) {return WorkoutEnergy.daily(D().workouts,day,ymd);}
  function energyBudget(day,eaten,base) {return WorkoutEnergy.budget(base, eaten,energyDay(day).total,actOf(day).kcal,D().settings);}
  function calorieClock(eaten,goal,offerTarget=true) {
    return `<div class="dial-wrap" data-clock-key="calories-${esc(ui.tab==='food'?ui.foodDate:today())}" data-clock-ratio="${goal>0?Math.min(1,Math.max(0,eaten/goal)):0}">${Profile.dial(eaten,goal,t('calorieDialLabel',compact(eaten),goal?compact(goal):t('noCalorieTarget')))}<div class="dial-readout"><small>${esc(t('eaten'))}</small><b data-calorie-total>${compact(eaten)}</b><span>kcal</span><p data-calorie-goal>${goal?esc(t('calorieOf',compact(goal))):esc(t('noCalorieTarget'))}</p></div></div><p class="calorie-remaining">${goal?esc(t(eaten>goal?'calorieOver':'calorieLeft',compact(Math.abs(goal-eaten)))):offerTarget?`<button class="link" data-a="targets">${esc(t('setTargets'))}</button>`:''}</p>`;
  }
  function energyBudgetPanel(day,eaten,base) {
    const e=energyDay(day),b=energyBudget(day,eaten,base),manual=actOf(day).kcal;
    return `<div class="energy-budget"><div class="energy-base"><span>${esc(t('baseCalorieTarget'))}</span><b>${base?compact(base)+' kcal':esc(t('noCalorieTarget'))}</b></div><div class="energy-split"><div><small>${esc(t('strengthEnergy'))}</small><b>~${compact(e.strength)} <span>kcal</span></b></div><div><small>${esc(t('cardioEnergy'))}</small><b>~${compact(e.cardio)} <span>kcal</span></b></div></div>${manual?`<p class="cap">${esc(t('manualEnergyTotal',compact(manual)))}</p>`:''}<label class="sw"><input type="checkbox" role="switch" data-in="set-flag" data-k="addWorkoutCalories" ${D().settings.addWorkoutCalories?'checked':''}><span>${esc(t('includeWorkoutEnergy'))}</span></label>${base&&(b.included||eaten)?`<p class="energy-equation">${compact(base)} + ${compact(b.included)} − ${compact(eaten)} = <b>${compact(b.remaining)} kcal</b></p>`:''}${b.source==='manual'?`<p class="cap">${esc(t('manualEnergyPriority'))}</p>`:''}${e.missing?`<button class="link" data-a="energy-history">${esc(t('energyMissing',e.missing))}</button>`:''}<details class="energy-explain"><summary>${esc(t('energyAbout'))}</summary><p class="cap">${esc(t('energyEstimateHint'))}</p><p class="cap">${esc(t('energyBudgetHint'))}</p></details></div>`;
  }
  function cardioRows(w,target) {
    return (w.cardio||[]).map(c=>`<div class="cardio-row"><span><b>${esc(t('cardio_'+c.type))}</b><small>${dec(c.minutes)} ${esc(t('min'))}${c.speed?' · '+dec(c.speed)+' km/h · '+dec(c.incline)+'%':''}</small></span><strong>~${compact(WorkoutEnergy.cardio(c)||0)} kcal</strong><button class="icon-btn sm" data-a="cardio-remove" data-target="${esc(target)}" data-id="${esc(c.id)}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>`).join('');
  }
  function workoutEnergyPanel(w) {
    const e=WorkoutEnergy.workout(w);
    return `<section class="card workout-energy"><h3>${esc(t('estimatedActiveEnergy'))}</h3><div class="energy-split"><div><small>${esc(t('strengthEnergy'))}</small><b>${e.missing?'—':'~'+compact(e.strength)} <span>kcal</span></b></div><div><small>${esc(t('cardioEnergy'))}</small><b>~${compact(e.cardio)} <span>kcal</span></b></div></div><p class="cap">${esc(t('energyEstimateHint'))}</p>${!w.tick&&w.entries.length?`<button class="link" data-a="energy-edit" data-id="${esc(w.id)}">${esc(t(e.missing?'calculateEnergy':'editEnergy'))}</button>`:''}${cardioRows(w,w.id)}<button class="btn" data-a="cardio-add" data-target="${esc(w.id)}">${IC.plus}${esc(t('logCardio'))}</button></section>`;
  }
  function shEnergy(target) {
    const fn=()=>{
      const w=target==='active'?D().active:D().workouts.find(x=>x.id===target),v=ui.energyDraft;if(!w)return {title:'',html:''};
      return {title:t('estimatedActiveEnergy'),html:`<form data-f="workout-energy"><p class="cap">${esc(t('energyEstimateHint'))}</p><div class="grid2"><label class="fld"><span>${esc(t('liftingMinutes'))}</span><input name="minutes" type="number" min="1" max="360" step="0.1" value="${esc(v.minutes)}" required></label><label class="fld"><span>${esc(t('energyBodyweight'))}</span><input name="weight" type="number" min="30" max="300" step="0.1" value="${esc(v.weight)}" required></label></div><label class="fld"><span>${esc(t('energyIntensity'))}</span><select name="intensity">${['moderate','vigorous'].map(k=>`<option value="${k}" ${v.intensity===k?'selected':''}>${esc(t('energy_'+k))}</option>`).join('')}</select></label><p class="cap">${esc(t('liftingDurationHint'))}</p><button class="btn primary wide">${esc(t(target==='active'?'finish':'save'))}</button>${target==='active'?`<button type="button" class="link" data-a="energy-skip">${esc(t('skipEnergy'))}</button>`:''}</form>`};
    };fn.kind='energy';return fn;
  }
  function openEnergy(target) {
    const w=target==='active'?D().active:D().workouts.find(x=>x.id===target);if(!w)return;
    const cardioMinutes=(w.cardio||[]).reduce((n,c)=>n+c.minutes,0),elapsed=((target==='active'?Date.now():w.end)-w.start)/60000-cardioMinutes;
    ui.energyTarget=target;ui.energyDraft=w.energy||{weight:weightFor(ymd(w.start)),minutes:elapsed>=1&&elapsed<=360?r1(elapsed):'',intensity:'moderate'};
    openSheet(shEnergy(target));
  }
  function shCardio() {
    const fn=()=>{const c=ui.cardioDraft,withSpeed=['walk','incline','run'].includes(c.type);return {title:t('logCardio'),html:`<form data-f="cardio"><label class="fld"><span>${esc(t('cardioActivity'))}</span><select name="type" data-in="cardio-type">${WorkoutEnergy.types.map(k=>`<option value="${k}" ${c.type===k?'selected':''}>${esc(t('cardio_'+k))}</option>`).join('')}</select></label>${ui.cardioTarget?'':`<label class="fld"><span>${esc(t('date'))}</span><input type="date" name="day" value="${esc(c.day)}" min="2000-01-01" max="${today()}" data-in="cardio-field" data-k="day" required></label>`}<div class="grid2"><label class="fld"><span>${esc(t('duration'))} (${esc(t('min'))})</span><input type="number" name="minutes" min="1" max="480" step="0.1" value="${esc(c.minutes)}" data-in="cardio-field" data-k="minutes" required></label><label class="fld"><span>${esc(t('energyBodyweight'))}</span><input type="number" name="weight" min="30" max="300" step="0.1" value="${esc(c.weight)}" data-in="cardio-field" data-k="weight" required></label></div>${withSpeed?`<div class="grid2"><label class="fld"><span>${esc(t('cardioSpeed'))} (km/h)</span><input type="number" name="speed" min="${c.type==='run'?8.1:3}" max="${c.type==='run'?20:6}" step="0.1" value="${esc(c.speed)}" data-in="cardio-field" data-k="speed" required></label><label class="fld"><span>${esc(t('cardioIncline'))} (%)</span><input type="number" name="incline" min="0" max="15" step="0.5" value="${esc(c.incline)}" data-in="cardio-field" data-k="incline" required></label></div>`:`<label class="fld"><span>${esc(t('energyIntensity'))}</span><select name="intensity" data-in="cardio-field" data-k="intensity">${['moderate','vigorous'].map(k=>`<option value="${k}" ${c.intensity===k?'selected':''}>${esc(t('energy_'+k))}</option>`).join('')}</select></label>`}<p class="cap">${esc(t('cardioEstimateHint'))}</p><button class="btn primary wide">${esc(t('save'))}</button></form>`};};fn.kind='cardio';return fn;
  }
  function openCardio(target) {
    if(target==='active'&&!D().active)return;
    if(target&&target!=='active'&&!D().workouts.some(w=>w.id===target))return;
    ui.cardioTarget=target||'';const w=target==='active'?D().active:D().workouts.find(w=>w.id===target),day=w?ymd(w.start):today();
    ui.cardioDraft={type:'incline',day,minutes:'',weight:weightFor(day),speed:5,incline:5,intensity:'moderate'};openSheet(shCardio());
  }
  function saveCardio(values) {
    const c=WorkoutEnergy.cleanCardio({...values,id:uid()}),target=ui.cardioTarget,day=String(values.day||ui.cardioDraft.day);
    if(!c||!/^\d{4}-\d\d-\d\d$/.test(day)||ymd(new Date(day+'T12:00'))!==day||day>today()||day<'2000-01-01'){toast(t('badValue'));return;}
    const w=target==='active'?D().active:D().workouts.find(w=>w.id===target);
    if(target&&!w)return;
    if(w){const before=w.cardio||[];if(before.length>=40){toast(t('cardioLimit'));return;}const at=w.cardioAt;w.cardio=before.concat(c);w.cardioAt=Date.now();if(!Store.save()){w.cardio=before;w.cardioAt=at;return;}}
    else {
      const end=day===today()?Date.now():new Date(day+'T12:00').getTime()+c.minutes*60000;
      const start=day===today()?Math.max(new Date(day+'T00:00').getTime(),end-c.minutes*60000):new Date(day+'T12:00').getTime();
      const doc={id:uid(),rid:null,name:t('cardio_'+c.type),start,end,entries:[],cardio:[c],cardioAt:Date.now(),warm:false,cool:false};
      if(!Store.apply(d=>{d.workouts.push(doc);d.workouts.sort((a,b)=>a.start-b.start);})){toast(t('saveFailed'));return;}
    }
    closeSheet();if(ui.sheets.length)refreshSheet();rerender();toast(t('saved'));
  }
  function actRow(k) {
    const a = actOf(k), has = a.steps > 0 || a.kcal > 0;
    return `<button class="qrow actrow" data-a="act" data-d="${esc(k)}"><span class="q-ic line">${IC.walk}</span><span class="rc-t"><b>${has ? `${compact(a.steps)} ${esc(t('steps'))} · ${compact(a.kcal)} kcal` : esc(t('actAdd'))}</b><i>${esc(t(has ? 'actEdit' : 'actAddSub'))}</i></span>${IC.chev}</button>`;
  }

  function routineGrid() {
    const routines=D().routines.filter(r=>!RoutineTemplates.isComplex(r)&&!r.focus);
    const groups=RoutineTemplates.templates.map(p=>({p,days:routines.filter(r=>r.sub?.en===p.name.en&&r.sub?.hu===p.name.hu)})).filter(g=>g.days.length);
    const grouped=new Set(groups.flatMap(g=>g.days.map(r=>r.id)));
    const individual=routines.filter(r=>!grouped.has(r.id));
    const tile=(r,p)=>{
      const ic=rIcon(r),name=rName(r),prefix=p&&p.name[L()]+' · ',label=prefix&&name.startsWith(prefix)?name.slice(prefix.length):name;
      return `<button class="rcard rtile ic-${ic}" data-a="r-open" data-id="${esc(r.id)}" aria-label="${esc(name)}"><span class="r-ic">${RICON[ic]}</span><span class="rc-t"><b>${esc(label)}</b><i>${r.items.length} ${esc(pl(r.items.length,'exercises'))} · ~${estMin(r)} ${esc(t('min'))}${r.opt?' · '+esc(t('optional')):''}</i></span>${IC.chev}</button>`;
    };
    const library=`<button class="template-launch" data-a="routine-library"><span class="r-ic">${RICON.full}</span><span><b>${esc(t('browseSplits'))}</b><small>${esc(t('browseSplitsHint'))}</small></span>${IC.chev}</button>`;
    return library+`<div class="h2row"><h2>${esc(t('routines'))}</h2><button class="pill" data-a="r-new">${IC.plus}${esc(t('newPlan'))}</button></div>`+groups.map(({p,days})=>`<details class="routine-group" data-program="${p.id}" ${ui.routineGroups?.[p.id]!==false?'open':''}><summary><span><b>${esc(p.name[L()])}</b><small>${esc(t('splitSessionCount',days.length))}</small></span>${IC.down}</summary><div class="rlist rgrid">${days.map(r=>tile(r,p)).join('')}</div></details>`).join('')+(groups.length&&individual.length?`<h3 class="individual-routines-title">${esc(t('otherRoutines'))}</h3>`:'')+`<div class="rlist rgrid">${individual.map(r=>tile(r)).join('')}</div>`+(!routines.length?`<p class="empty">${esc(t('noRoutinesYet'))}</p>`:'');
  }
  function volumeBreakdown(w) {
    const rows=w.entries.map(e=>({entry:e,sets:e.sets.filter(s=>!s.w)})).filter(row=>row.sets.length);
    return `<div class="volume-breakdown">${rows.map(({entry,sets})=>`<div class="volume-lift"><div><b>${esc(itemName(entry))}</b><strong>${volumeText(sets.reduce((n,s)=>n+s.kg*s.reps,0))} kg</strong></div><p>${sets.map(s=>`${dec(s.kg)} kg × ${s.reps}`).join(' · ')}</p></div>`).join('')}<p class="cap">${esc(t('volumeMethod'))}</p></div>`;
  }
  /* ================= BIKE RIDES ================= */
  // The running ride lives in its own storage key and is written every few seconds, so a reload or a closed app resumes it.
  const RKEY = 'gymapp.v1.ride', WKEY = 'gymapp.v1.wheel';
  const WHEELS = [[2.096, '700×23c'], [2.105, '700×25c'], [2.136, '700×28c'], [2.155, '700×32c'], [2.18, '27.5×2.2'], [2.326, '29×2.2']];
  // An older cached page may not have the ride elements yet.
  if (!document.getElementById('ride-live')) { const sec = document.createElement('section'); sec.id = 'ride-live'; sec.hidden = true; const pill = document.createElement('button'); pill.id = 'ride-pill'; pill.type = 'button'; pill.dataset.a = 'ride-open'; pill.hidden = true; document.getElementById('workout')?.after(sec, pill); }
  let ride = null, rideWatch = null, rideLock = null, rideSaveT = 0, rideDrawF = 0, rideSensors = [], leafletP = null;
  const rideLive = { gps: '', hr: null, cad: null, pw: null, wspd: null, at: {} }, rideRev = {}, rideMaps = new Map();
  try { const raw = localStorage.getItem(RKEY), r = raw && JSON.parse(raw); if (r && r.v === 1 && Number.isFinite(r.start) && Array.isArray(r.pts) && Array.isArray(r.hr)) ride = r; } catch (e) {}
  const loc = () => L() === 'hu' ? 'hu-HU' : 'en-GB';
  const wheelCirc = () => { try { const v = +localStorage.getItem(WKEY); return WHEELS.some(w => w[0] === v) ? v : 2.105; } catch (e) { return 2.105; } };
  const km = m => (m / 1000).toLocaleString(loc(), { minimumFractionDigits: m < 100000 ? 2 : 1, maximumFractionDigits: m < 100000 ? 2 : 1 });
  const kmh = v => (Math.round(v * 10) / 10).toLocaleString(loc(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const hms = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + pad(m) : m) + ':' + pad(s % 60); };
  const rideName = at => { const h = new Date(at).getHours(); return t(h >= 5 && h < 11 ? 'rideMorning' : h >= 11 && h < 17 ? 'rideAfternoon' : h >= 17 && h < 22 ? 'rideEvening' : 'rideNight'); };
  const liveFresh = k => rideLive[k] != null && Date.now() - (rideLive.at[k] || 0) < 5000;
  function rideStore(force) {
    if (!ride) { try { localStorage.removeItem(RKEY); } catch (e) {} return; }
    if (!force && Date.now() - rideSaveT < 4000) return;
    rideSaveT = Date.now(); try { localStorage.setItem(RKEY, JSON.stringify(ride)); } catch (e) {}
  }
  function rideGeo(on) {
    if (!on) { if (rideWatch != null) { try { navigator.geolocation.clearWatch(rideWatch); } catch (e) {} } rideWatch = null; return; }
    if (rideWatch != null || !navigator.geolocation) return;
    rideLive.gps = 'search';
    rideWatch = navigator.geolocation.watchPosition(p => {
      const c = p.coords; rideFix({ lat: c.latitude, lon: c.longitude, acc: c.accuracy, alt: c.altitude, altAcc: c.altitudeAccuracy, speed: c.speed, t: Date.now() });
    }, e => { rideLive.gps = e.code === 1 ? 'denied' : 'search'; if (e.code === 1) rideGeo(false); rideDraw(); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
  }
  function rideFix(fix) {
    if (!ride) return;
    const r = Rides.add(ride, fix);
    if (!ride.paused) rideLive.gps = r === 'weak' ? 'weak' : 'ok';
    if (r === 'ok' || r === 'first') { rideStore(); const m = rideMaps.get('live'); if (m) m.line.addLatLng([fix.lat, fix.lon]); }
    const m = rideMaps.get('live'); if (m && r !== 'skip') { m.dot.setLatLng([fix.lat, fix.lon]); if (m.follow) m.map.panTo([fix.lat, fix.lon], { animate: !calm() }); }
    rideDraw();
  }
  function rideWake() { try { if ('wakeLock' in navigator && !rideLock && !document.hidden) navigator.wakeLock.request('screen').then(l => { rideLock = l; l.addEventListener('release', () => { rideLock = null; }); }).catch(() => {}); } catch (e) {} }
  function rideSleep() { try { if (rideLock) rideLock.release(); } catch (e) {} rideLock = null; }
  function rideBegin() {
    if (ride) { rideOpen(true); return; }
    if (!navigator.geolocation) { toast(t('rideNoGps')); return; }
    ride = Rides.start(Date.now()); rideStore(true); rideGeo(true); rideWake(); rideOpen(true);
  }
  // A finished or imported ride is an ordinary workout with a "ride" part, so history, goals, calories and account sync all include it.
  function rideWorkout(data, start, end, name) {
    const day = ymd(start), weight = weightFor(day), minutes = Math.min(480, Math.max(1, Math.round(data.moving / 60)));
    const w = { id: uid(), rid: null, name: name || rideName(start), start, end: Math.max(start, end), entries: [], warm: false, cool: false, ride: data };
    const c = weight ? WorkoutEnergy.cleanCardio({ type: 'cycle', weight, minutes, intensity: Rides.avgSpeed(data) >= 19.3 ? 'vigorous' : 'moderate' }) : null;
    if (c) { c.id = uid(); w.cardio = [c]; w.cardioAt = Date.now(); }
    return w;
  }
  function rideAdd(w) { return Store.apply(d => { d.workouts.push(w); d.workouts.sort((a, b) => a.start - b.start); }); }
  function rideEnd(save) {
    if (!ride) return;
    const now = Date.now(), end = ride.paused ? ride.pausedAt : now;
    let w = null;
    if (save) {
      w = rideWorkout(Rides.finish(ride, now, 'gps'), ride.start, end, '');
      if (!w.ride.dist && !w.ride.moving) save = false;
      else if (!rideAdd(w)) { toast(t('saveFailed')); return; }
    }
    ride = null; rideStore(true); rideGeo(false); rideSleep(); rideLive.gps = '';
    if (save) { ui.tab = 'home'; ui.workout = 'ride'; }
    rideOpen(false); rerender();
    if (save) openSheet(shRide(w.id, true)); else toast(t('rideDiscarded'));
  }
  function rideOpen(on) {
    ui.rideOpen = !!on && !!ride;
    const el = $('#ride-live'); if (!el) return;
    document.body.classList.toggle('ride-on', ui.rideOpen);
    if (!ui.rideOpen) { rideMapDrop('live'); el.hidden = true; el.innerHTML = ''; rideDraw(); return; }
    const box = (k, label, unit) => `<div class="rs" data-box="${k}"><b><span data-r="${k}">–</span>${unit ? '<small>' + esc(unit) + '</small>' : ''}</b><i>${esc(label)}</i></div>`;
    el.hidden = false;
    el.innerHTML = `<header class="ride-head"><button class="icon-btn" data-a="ride-min" aria-label="${esc(t('minimize'))}">${IC.down}</button><div><b>${esc(t('rideLive'))}</b><i data-r="gps"></i></div><button class="btn primary" data-a="ride-finish">${esc(t('finish'))}</button></header>
      <div class="ride-map live" data-map="live"><button class="icon-btn ride-center" data-a="ride-center" aria-label="${esc(t('rideCenter'))}" hidden>${IC.locate}</button></div>
      <div class="ride-panel"><div class="rs-main"><b data-r="dist">0,00</b><i>km</i></div>
      <div class="ride-grid">${box('time', t('rideTime'))}${box('spd', t('rideSpeed'), 'km/h')}${box('avg', t('rideAvg'), 'km/h')}${box('gain', t('rideGain'), 'm')}${box('hr', t('rideHr'), 'bpm')}${box('cad', t('rideCad'), 'rpm')}${box('pw', t('ridePower'), 'W')}</div>
      <div class="ride-controls"><button class="btn big" data-a="ride-pause" data-r="pause"></button><button class="link" data-a="ride-discard">${esc(t('rideDiscard'))}</button></div>
      <p class="cap ride-note">${esc(t(isIOS ? 'rideKeepOpenIOS' : 'rideKeepOpen'))}</p></div>`;
    rideDrawNow(); rideMapsMount(el);
  }
  function rideDraw() { if (!rideDrawF) rideDrawF = requestAnimationFrame(() => { rideDrawF = 0; rideDrawNow(); }); }
  function rideDrawNow() {
    const pill = $('#ride-pill'), show = !!ride && !ui.rideOpen;
    if (pill) { pill.hidden = !show; pill.setAttribute('aria-label', t('rideInProgress')); }
    if (!ride) return;
    const now = Date.now(), gpsFresh = rideLive.gps === 'ok' && now - (ride.lastFix || 0) < 8000;
    const speed = ride.paused ? 0 : gpsFresh ? ride.spd * 3.6 : liveFresh('wspd') ? rideLive.wspd * 3.6 : 0;
    const v = { dist: km(ride.dist + (ride.dist < 100 ? ride.wheel : 0)), time: hms(Rides.elapsed(ride, now)), spd: kmh(speed), avg: kmh(ride.moving > 0 ? ride.dist / ride.moving * 3.6 : ride.wheel > 0 && Rides.elapsed(ride, now) > 0 ? ride.wheel / Rides.elapsed(ride, now) * 3.6 : 0), gain: String(Math.round(ride.gain)),
      hr: liveFresh('hr') ? String(rideLive.hr) : null, cad: liveFresh('cad') ? String(rideLive.cad) : null, pw: liveFresh('pw') ? String(rideLive.pw) : null,
      gps: ride.paused ? t('ridePaused') : t('rideGps_' + (rideLive.gps || 'search'), ride.acc != null ? ride.acc : '–'), pause: '' };
    if (show) pill.innerHTML = `<span class="ride-dot${ride.paused ? ' paused' : ''}"></span>${IC.bike}<b>${esc(v.dist)} km</b><span>${esc(v.time)}</span>`;
    const live = $('#ride-live');
    if (live && !live.hidden) {
      $$('[data-r]', live).forEach(n => { const k = n.dataset.r; if (k === 'pause') { n.innerHTML = ride.paused ? IC.play + esc(t('rideResume')) : IC.pause + esc(t('ridePause')); n.classList.toggle('primary', ride.paused); return; } if (n.textContent !== (v[k] ?? '–')) n.textContent = v[k] ?? '–'; });
      const offered = new Set(rideSensors.flatMap(x => x.kinds.flatMap(k => k === 'csc' ? ['cad'] : k === 'pw' ? ['pw', 'cad'] : [k])));
      ['hr', 'cad', 'pw'].forEach(k => { const b = $(`[data-box="${k}"]`, live); if (b) b.hidden = v[k] == null && !offered.has(k); });
      live.dataset.gps = ride.paused ? 'paused' : rideLive.gps || 'search';
    }
    $$('[data-rh]').forEach(n => { const k = n.dataset.rh; n.textContent = k === 'dist' ? v.dist + ' km' : v.time + (ride.paused ? ' · ' + t('ridePaused') : ''); });
  }
  /* ---------- maps (Leaflet with OpenStreetMap tiles, loaded only when a map is shown) ---------- */
  function leaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (!leafletP) leafletP = new Promise((ok, bad) => {
      if (!$('link[href="vendor/leaflet/leaflet.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'vendor/leaflet/leaflet.css'; document.head.append(l); }
      const s = document.createElement('script'); s.src = 'vendor/leaflet/leaflet.js'; s.onload = () => ok(window.L); s.onerror = () => { leafletP = null; bad(new Error('map')); }; document.head.append(s);
    });
    return leafletP;
  }
  function rideMapDrop(key) { const m = rideMaps.get(key); if (m) { try { m.map.remove(); } catch (e) {} rideMaps.delete(key); } }
  function rideMapsMount(root) {
    $$('.ride-map[data-map]', root).forEach(async el => {
      const key = el.dataset.map, liveMap = key === 'live';
      rideMapDrop(key);
      let Lf; try { Lf = await leaflet(); } catch (e) { el.classList.add('no-map'); return; }
      if (!el.isConnected) return;
      const pts = liveMap ? (ride ? ride.pts.map(p => [p[0], p[1]]) : []) : Rides.route((D().workouts.find(w => w.id === key) || {}).ride).map(p => [p.lat, p.lon]);
      const map = Lf.map(el, { zoomControl: false, attributionControl: true, dragging: liveMap, touchZoom: liveMap, scrollWheelZoom: liveMap, doubleClickZoom: liveMap, boxZoom: false, keyboard: false, fadeAnimation: !calm(), zoomAnimation: !calm() });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }).addTo(map);
      const line = Lf.polyline(pts, { className: 'ride-line', weight: 5, interactive: false }).addTo(map);
      const m = { map, line, follow: true };
      if (liveMap) {
        const last = pts[pts.length - 1];
        m.dot = Lf.circleMarker(last || [0, 0], { className: 'ride-here', radius: 7, weight: 3, interactive: false }).addTo(map);
        if (last) map.setView(last, 16); else { map.setView([47.4979, 19.0402], 5); navigator.geolocation && navigator.geolocation.getCurrentPosition(p => { if (rideMaps.get('live') === m && !ride.pts.length) { map.setView([p.coords.latitude, p.coords.longitude], 16); m.dot.setLatLng([p.coords.latitude, p.coords.longitude]); } }, () => {}, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }); }
        const center = $('.ride-center', el.parentElement);
        map.on('dragstart', () => { m.follow = false; if (center) center.hidden = false; });
        m.recenter = () => { m.follow = true; if (center) center.hidden = true; const ll = m.dot.getLatLng(); if (ll.lat || ll.lng) map.setView(ll, Math.max(map.getZoom(), 15)); };
      } else if (pts.length > 1) {
        Lf.circleMarker(pts[0], { className: 'ride-start', radius: 6, weight: 3, interactive: false }).addTo(map);
        Lf.circleMarker(pts[pts.length - 1], { className: 'ride-finish', radius: 6, weight: 3, interactive: false }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [22, 22] });
      }
      rideMaps.set(key, m);
      setTimeout(() => { try { map.invalidateSize(); if (!liveMap && pts.length > 1) map.fitBounds(line.getBounds(), { padding: [22, 22] }); } catch (e) {} }, 320);
    });
  }
  /* ---------- small route pictures and the elevation profile (plain SVG, no map needed) ---------- */
  function rideThumb(r) {
    const pts = Rides.route(r); if (pts.length < 2) return IC.bike;
    const k = Math.cos(pts[0].lat * Math.PI / 180), xs = pts.map(p => p.lon * k), ys = pts.map(p => -p.lat);
    const x0 = Math.min(...xs), y0 = Math.min(...ys), span = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0) || 1;
    const ox = (span - (Math.max(...xs) - x0)) / 2, oy = (span - (Math.max(...ys) - y0)) / 2;
    const step = Math.max(1, Math.floor(pts.length / 120));
    const d = pts.filter((_, i) => i % step === 0 || i === pts.length - 1).map((p, i) => (i ? 'L' : 'M') + (4 + (p.lon * k - x0 + ox) / span * 40).toFixed(1) + ' ' + (4 + (-p.lat - y0 + oy) / span * 40).toFixed(1)).join('');
    return `<svg class="ride-shape" viewBox="0 0 48 48" aria-hidden="true"><path d="${d}"/></svg>`;
  }
  function rideProfile(r) {
    const pts = Rides.route(r).filter(p => p.e != null); if (pts.length < 3) return '';
    let acc = 0; const xs = pts.map((p, i) => (acc += i ? Rides.dist(pts[i - 1], p) : 0));
    const lo = Math.min(...pts.map(p => p.e)), hi = Math.max(...pts.map(p => p.e)), range = Math.max(10, hi - lo), total = acc || 1;
    const line = pts.map((p, i) => (i ? 'L' : 'M') + (xs[i] / total * 300).toFixed(1) + ' ' + (88 - (p.e - lo) / range * 76).toFixed(1)).join('');
    return `<section class="ride-profile"><h3>${esc(t('rideElevation'))}</h3><svg viewBox="0 0 300 92" preserveAspectRatio="none" role="img" aria-label="${esc(t('rideElevation'))}: ${Math.round(lo)}–${Math.round(hi)} m"><path class="fill" d="${line}L300 92L0 92Z"/><path class="stroke" d="${line}"/></svg><div class="cap"><span>${Math.round(lo)} m</span><span>${Math.round(hi)} m</span></div></section>`;
  }
  function shRide(id, fresh) {
    const fn = () => {
      const w = D().workouts.find(x => x.id === id); if (!w || !w.ride) return { title: '', html: '' };
      const r = w.ride, kc = WorkoutEnergy.workout(w).cardio, time = new Date(w.start).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
      const k = [[km(r.dist), 'km'], [hms(r.moving), t('rideMoving')], [kmh(Rides.avgSpeed(r)), t('rideAvg') + ' km/h']];
      if (r.maxSpd) k.push([kmh(r.maxSpd), t('rideMax') + ' km/h']);
      if (r.path || r.gain) k.push([compact(r.gain), t('rideGain') + ' m']);
      k.push([hms(r.elapsed), t('rideElapsed')]);
      if (r.hr) k.push([r.hr.avg + (r.hr.max ? ' / ' + r.hr.max : ''), t('rideHr') + ' bpm']);
      if (r.cad) k.push([String(r.cad.avg), t('rideCad') + ' rpm']);
      if (r.pw) k.push([r.pw.avg + (r.pw.max ? ' / ' + r.pw.max : ''), t('ridePower') + ' W']);
      let h = `<p class="lead">${esc(fmtDate(w.start, true))} · ${esc(time)}</p>`;
      h += r.path ? `<div class="ride-map" data-map="${esc(w.id)}" role="img" aria-label="${esc(t('rideRoute'))}"></div>` : `<div class="note"><b>${esc(t(r.wheel ? 'rideIndoor' : 'rideNoRoute'))}</b></div>`;
      h += `<div class="ride-kpis">${k.map(([v, l]) => `<div><b>${esc(v)}</b><i>${esc(l)}</i></div>`).join('')}</div>`;
      h += rideProfile(r);
      h += `<p class="history-energy">${kc ? `${esc(t('cardioEnergy'))}: ~${compact(kc)} kcal` : esc(t('rideNoWeight'))}</p>`;
      if (r.src !== 'gps') h += `<p class="cap">${esc(t('rideFromFile', r.src.toUpperCase()))}</p>`;
      return { title: fresh ? t('rideSaved') : w.name, html: h, foot: `${r.path ? `<button class="btn" data-a="ride-gpx" data-id="${esc(w.id)}">${IC.share}${esc(t('rideExport'))}</button>` : ''}<button class="btn danger" data-a="wk-del" data-id="${esc(w.id)}">${esc(t('rideDelete'))}</button>` };
    };
    fn.kind = 'ride'; return fn;
  }
  function rideRow(w) {
    const r = w.ride;
    return `<button class="ride-row" data-a="ride-view" data-id="${esc(w.id)}"><span class="ride-thumb">${rideThumb(r)}</span><span class="rr-t"><b>${esc(shortName(w.name))}</b><i>${esc(fmtDate(w.start))} · ${esc(hms(r.moving))}</i></span><span class="rr-n"><b>${esc(km(r.dist))} km</b><i>${esc(kmh(Rides.avgSpeed(r)))} km/h</i></span></button>`;
  }
  function rideTotals(list, from) {
    const l = list.filter(w => w.start >= from), dist = l.reduce((n, w) => n + w.ride.dist, 0), mov = l.reduce((n, w) => n + w.ride.moving, 0), gain = l.reduce((n, w) => n + w.ride.gain, 0);
    return `<b>${esc(km(dist))} km</b><i>${l.length} ${esc(pl(l.length,'ridesWord'))} · ${esc(hms(mov))} · ${compact(gain)} m</i>`;
  }
  function rideView() {
    const rides = D().workouts.filter(w => w.ride), month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
    let h = ride
      ? `<button class="hero ride-hero resume" data-a="ride-open"><small>${esc(t('rideInProgress'))}</small><strong data-rh="dist"></strong><span data-rh="time"></span></button>`
      : `<section class="hero ride-hero"><small>${esc(t('rideTitle'))}</small><strong>${esc(t('rideReady'))}</strong><span>${esc(t('rideLead'))}</span><button class="btn primary big" data-a="ride-start">${IC.play}${esc(t('rideStart'))}</button></section>`;
    if (isIOS) h += `<p class="cap ride-ios">${esc(t('rideIOSNote'))}</p>`;
    h += `<div class="ride-totals"><div><small>${esc(t('rideThisWeek'))}</small>${rideTotals(rides, weekStart(Date.now()).getTime())}</div><div><small>${esc(t('rideThisMonth'))}</small>${rideTotals(rides, month.getTime())}</div></div>`;
    h += `<section class="card ride-sensors"><h3>${esc(t('rideSensors'))}</h3>`;
    if (Rides.bluetooth()) {
      h += rideSensors.map((s, i) => `<div class="sensor-row">${IC.bt}<span><b>${esc(s.name || t('rideSensor'))}</b><i>${esc(s.kinds.map(k => t('rideKind_' + k)).join(' · '))}</i></span><button class="link" data-a="ride-sensor-off" data-i="${i}">${esc(t('rideDisconnect'))}</button></div>`).join('');
      h += `<p class="cap">${esc(t('rideSensorHint'))}</p><div class="row2"><button class="btn" data-a="ride-sensor">${IC.plus}${esc(t('rideAddSensor'))}</button><label class="ride-wheel"><span>${esc(t('rideWheel'))}</span><select data-in="ride-wheel">${WHEELS.map(w => `<option value="${w[0]}"${w[0] === wheelCirc() ? ' selected' : ''}>${w[1]}</option>`).join('')}</select></label></div>`;
    } else h += `<p class="cap">${esc(t(isIOS ? 'rideBtIOS' : 'rideBtNone'))}</p>`;
    h += `</section><section class="card ride-import"><div><h3>${esc(t('rideImport'))}</h3><p class="cap">${esc(t('rideImportHint'))}</p></div><label class="btn">${IC.upload}${esc(t('rideChooseFile'))}<input class="sr" type="file" data-in="ride-file"></label></section>`;
    const limit = ui.rideLimit || 30, list = rides.slice().reverse();
    h += `<div class="h2row"><h2>${esc(t('rideHistory'))}</h2><span class="cap">${rides.length}</span></div>`;
    h += list.length ? `<div class="ride-list">${list.slice(0, limit).map(rideRow).join('')}</div>${list.length > limit ? `<button class="btn" data-a="ride-more">${esc(t('showMore'))}</button>` : ''}` : `<p class="empty">${esc(t('rideNone'))}</p>`;
    return h;
  }
  async function rideImport(file) {
    if (file.size > 30 * 1024 * 1024) { toast(t('rideImportBad')); return; }
    let out; try { out = Rides.parse(await file.text()); } catch (e) { out = { error: 'format' }; }
    if (out.error) { toast(t('rideImportBad')); return; }
    if (D().workouts.some(w => w.ride && Math.abs(w.start - out.start) < 60000 && Math.abs(w.ride.dist - out.ride.dist) <= Math.max(50, out.ride.dist * 0.02))) { toast(t('rideDuplicate')); return; }
    if (out.start > Date.now() + 86400000) { toast(t('rideImportBad')); return; }
    const w = rideWorkout(out.ride, out.start, out.end, out.name);
    if (!rideAdd(w)) { toast(t('saveFailed')); return; }
    rerender(); openSheet(shRide(w.id)); toast(t('rideImported'));
  }
  function rideSensorData(kind, dv) {
    try {
      const now = Date.now();
      if (kind === 'hr') { const b = Rides.parseHr(dv); rideLive.hr = b; rideLive.at.hr = now; if (ride) Rides.sensor(ride, 'hr', b); }
      else {
        const cur = kind === 'csc' ? Rides.parseCsc(dv) : Rides.parsePower(dv);
        if (kind === 'pw') { rideLive.pw = Math.max(0, cur.watts); rideLive.at.pw = now; if (ride) Rides.sensor(ride, 'pw', rideLive.pw); }
        const d = Rides.revDelta(rideRev[kind], cur, wheelCirc()); rideRev[kind] = cur;
        if (d.cadence != null) { rideLive.cad = Math.round(d.cadence); rideLive.at.cad = now; if (ride) Rides.sensor(ride, 'cad', d.cadence); }
        if (d.speed != null) { rideLive.wspd = d.speed; rideLive.at.wspd = now; }
        if (d.dist && ride && kind === 'csc') Rides.sensor(ride, 'wheel', d.dist);
      }
      rideDraw();
    } catch (e) { /* a malformed packet is ignored */ }
  }
  async function rideSensorAdd() {
    let s = null;
    try {
      s = await Rides.pair(rideSensorData, () => { rideSensors = rideSensors.filter(x => x !== s); toast(t('rideSensorLost')); if (ui.tab === 'home' && ui.workout === 'ride') rerender(); });
      rideSensors.push(s); toast(t('rideSensorOn', s.name || t('rideSensor'))); if (ui.tab === 'home' && ui.workout === 'ride') rerender();
    } catch (e) { if (e && e.name === 'NotFoundError') return; toast(t(e && e.message === 'unsupported' ? 'rideSensorUnsupported' : 'rideSensorFail')); }
  }

  function workoutHistory(workouts) {
    return workouts.length?workouts.map(w=>`<article class="workout-history"><button class="history-title" data-a="wk-open" data-id="${esc(w.id)}"><span><b>${esc(shortName(w.name))}</b><small>${esc(fmtDate(w.start))} · ${w.ride?esc(km(w.ride.dist))+' km · '+esc(hms(w.ride.moving)):setsOf(w)+' '+esc(t('setsWord'))}</small></span>${IC.chev}</button>${w.tick?`<p class="cap">${esc(t('tickedTag'))}</p>`:!w.entries.length?'':`<details class="workout-volume"><summary><span>${volumeText(volOf(w))} kg <small>${esc(t('volume'))}</small></span>${IC.down}</summary>${volumeBreakdown(w)}</details>`}</article>`).join(''):`<p class="empty">${esc(t('noWorkouts'))}</p>`;
  }
  function rankBadge(tier) {
    return `<span class="rank-badge rank-${tier<3?'entry-'+tier:tier-3}" aria-hidden="true"><svg viewBox="0 0 40 44"><path d="M20 3 35 10v13c0 9-15 18-15 18S5 32 5 23V10z"/><path d="m12 22 8-9 8 9-8 9z"/>${tier>=5?'<path d="M12 10h16"/>':''}${tier>=7?'<path d="m16 21 4-4 4 4-4 4z"/>':''}</svg></span>`;
  }
  /* Ranks page: a body figure coloured by each muscle group's rank, then one card per group, then the classic barbell milestones. */
  function vRanks() {
    const p=D().settings.profile,bw=weightFor(today()),groups=MuscleRanks.summary(D().workouts,bw,p.sex),highest=Math.max(-1,...groups.map(g=>g.tier));
    const [f,b]=MuscleRanks.regions(groups),tierName=i=>i<0?t('rankUnranked'):StrengthRanks.tiers[i][L()];
    let h=`<section class="muscle-hero"><div class="muscle-figure">${MuscleMap.ranked(f,b,t('frontView'),t('backView'),t('muscleRanks'))}</div><div class="muscle-hero-text"><small>${esc(t('highestRank'))}</small><h2>${esc(tierName(highest))}</h2><p class="cap">${esc(bw?t('muscleRankIntro',dec(bw)):t('muscleRankNoWeight'))}</p>${bw?'':`<button class="btn sm" data-a="targets">${esc(t('addWeight'))}</button>`}</div>
      <div class="tier-legend" aria-label="${esc(t('rankMilestones'))}">${StrengthRanks.tiers.map((x,i)=>`<span class="${i<=highest?'on':''}"><i class="tier-dot t${i}"></i>${esc(x[L()])}</span>`).join('')}</div></section>`;
    h+=`<div class="muscle-cards">${groups.map(g=>{const name=g[L()],best=g.best;return `<details class="muscle-card" data-group="${g.id}"><summary><i class="tier-dot t${g.tier}"></i><span><b>${esc(name)}</b><small>${esc(tierName(g.tier))}${best?' · '+esc(t('timesBw',dec(g.ratio))):''}</small></span><span class="muscle-bar" role="progressbar" aria-label="${esc(name)}" aria-valuenow="${Math.round(g.progress*100)}" aria-valuemin="0" aria-valuemax="100"><span class="t${Math.max(0,g.tier+(g.next?1:0))}" style="width:${g.tier<0&&!best?0:g.progress*100}%"></span></span>${IC.down}</summary>
      <div class="muscle-body">${best?`<p>${esc(t('bestFor'))}: <b>${esc(exName(best.ex))}</b> · ${dec(best.kg)} kg × ${best.reps}</p>`:`<p class="cap">${esc(t('muscleNoLift'))}</p>`}${g.next?`<p class="cap">${esc(t('muscleNext',tierName(g.tier+1),dec(Math.round(g.next*100)/100)))}</p>`:`<p class="cap">${esc(t('rankTop'))}</p>`}
      ${g.growth?.length?`<p class="muscle-growth"><span>${esc(t('growthTier'))}</span>${g.growth.map(([tier,en,hu])=>`<b class="growth-${tier.toLowerCase()}" title="${esc(t('growthTierHint'))}">${esc(L()==='hu'?hu:en)} · ${tier}</b>`).join('')}</p>`:''}
      <p class="cap">${esc(t('muscleCounts'))}: ${Object.keys(MuscleRanks.groups.find(x=>x.id===g.id).ex).map(exName).slice(0,6).map(esc).join(', ')}</p>${best?`<button class="link" data-a="wk-open" data-id="${esc(best.workout)}">${esc(t('viewLift'))}</button>`:''}</div></details>`;}).join('')}</div>`;
    h+=`<details class="mini-section lift-milestones" data-section="lift-milestones" ${ui.sections?.['lift-milestones']?'open':''}><summary>${esc(t('liftMilestones'))}${IC.down}</summary><div class="section-body">${liftRanks()}</div></details>`;
    return h+`<p class="cap rank-method">${esc(t('muscleRankMethod'))}</p>`;
  }
  // The best rank shown on Workout and Profile: muscle-group ranks when body weight is known, otherwise the barbell milestones.
  const muscleSummary = () => MuscleRanks.summary(D().workouts, weightFor(today()), D().settings.profile.sex);
  const topRank = () => Math.max(-1, ...StrengthRanks.summary(D().workouts).map(r => r.tier), ...muscleSummary().map(g => g.tier));
  function liftRanks() {
    const ranks=StrengthRanks.summary(D().workouts),highest=Math.max(...ranks.map(r=>r.tier));
    let h=`<div class="rank-grid">`;
    h+=ranks.map(r=>`<section class="rank-card" data-rank="${r.id}"><div class="rank-heading">${rankBadge(r.tier)}<div><h3>${esc(r[L()])}</h3><b>${esc(r.tier<0?t('rankUnranked'):StrengthRanks.tiers[r.tier][L()])}</b></div></div><p class="rank-best">${dec(r.best)} <small>kg${r.reps?' × '+r.reps:''}</small></p><p class="cap">${esc(t('heaviestSet'))}</p><div class="rank-progress" role="progressbar" aria-label="${esc(r[L()])}" aria-valuenow="${Math.round(r.progress*100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${r.progress*100}%"></span></div><p class="rank-next">${r.next?esc(t('rankNext',StrengthRanks.tiers[r.tier+1][L()],dec(r.next),dec(r.next-r.best))):esc(t('rankTop'))}</p>${r.workout?`<button class="link" data-a="wk-open" data-id="${esc(r.workout)}">${esc(t('viewLift'))}</button>`:''}<details class="rank-ladder"><summary>${esc(t('rankMilestones'))}</summary>${r.weights.map((weight,i)=>`<div class="${i<=r.tier?'earned':''}"><span>${esc(StrengthRanks.tiers[i][L()])}</span><b>${weight} kg ${i<=r.tier?'✓':''}</b></div>`).join('')}</details></section>`).join('');
    return h+'</div>'+`<p class="cap rank-method">${esc(t('rankMethod'))}</p>`;
  }
  function stabilitySymbol(knee=false){return knee?'<svg viewBox="0 0 48 48"><path d="M18 5v11l8 7 3 19M30 5v10l-3 4M15 20l7 7 2 15M30 24l6 5M35 18h7M38 12l-4 4"/><circle cx="25" cy="23" r="5"/></svg>':'<svg viewBox="0 0 48 48"><path d="M9 37h30M24 17v12l-8 8M24 29l8 8M11 23l13-6 13 6M7 43h34"/><circle cx="24" cy="8" r="4"/></svg>';}
  function vStability(){
    const focus=ui.stabilityPage==='knee'?'knee':'stability',rows=D().routines.filter(r=>r.focus===focus);
    return `<section class="stability-page"><div class="stability-heading"><span>${stabilitySymbol(focus==='knee')}</span><div><h2>${esc(t(focus==='knee'?'kneeRecovery':'stabilityTitle'))}</h2><p>${esc(t(focus==='knee'?'kneeRecoverySub':'stabilitySub'))}</p></div></div><nav class="seg stability-tabs" aria-label="${esc(t('stabilityTitle'))}">${['stability','knee'].map(v=>`<button class="${v===focus?'on':''}" data-a="stability-view" data-v="${v}" aria-pressed="${v===focus}">${esc(t(v==='knee'?'kneeRecovery':'stabilityTitle'))}</button>`).join('')}</nav><div class="h2row"><h3>${esc(t('yourSequences'))}</h3><button class="btn sm" data-a="r-new" data-focus="${focus}">${IC.plus}${esc(t('newPlan'))}</button></div>${!rows.length&&REC.some(p=>p.focus===focus)?`<p class="cap stability-hint">${esc(t('recoveryHint'))}</p>`:rows.length?`<div class="rlist stability-routines">${rows.map(r=>`<button class="rcard" data-a="r-open" data-id="${esc(r.id)}"><span class="stability-small-icon">${stabilitySymbol(focus==='knee')}</span><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(pl(r.items.length,'exercises'))}</i></span>${IC.chev}</button>`).join('')}</div>`:`<div class="stability-empty"><span>${stabilitySymbol(focus==='knee')}</span><h3>${esc(t(focus==='knee'?'kneeEmpty':'stabilityEmpty'))}</h3><p>${esc(t('stabilityEmptyHint'))}</p></div>`}${recoveryCards(focus)}<button class="btn stability-organise" data-a="stability-organise" data-focus="${focus}">${IC.plus}${esc(t('moveExistingRoutine'))}</button></section>`;
  }
  /* ---------- ready-made recovery programmes from the owner's clips (data/recovery.js) ---------- */
  const REC = window.RECOVERY_PROGRAMS || [];
  const recName = p => p.name[L()] || p.name.en;
  const recPair = id => window.ROUTINE_ART[id]?.pair || (FIG[id] ? [0, 1].map(k => 'img/fig/' + FIG[id] + '-' + k + '.svg') : [img(id, 0), img(id, 1)]);
  const doseText = reps => /\bs$/.test(String(reps)) ? String(reps).replace(/\s*s$/, ' ' + t('secShort')) : String(reps);
  function recoveryCards(focus){
    const list=REC.filter(p=>p.focus===focus);if(!list.length)return '';
    return `<div class="h2row"><h3>${esc(t('recoveryReady'))}</h3></div><div class="recovery-programs">${list.map(p=>{const added=D().routines.some(r=>r.id===p.id);return `<article class="recovery-card"><button class="recovery-open" data-a="recovery-preview" data-id="${esc(p.id)}"><span class="recovery-art" aria-hidden="true">${p.items.slice(0,3).map(i=>`<img src="${esc(thumb(i.ex))}" alt="" loading="lazy" decoding="async">`).join('')}</span><span class="recovery-copy"><b>${esc(recName(p))}</b><small>${esc(p.sub[L()]||p.sub.en)}</small><small class="recovery-meta">${p.items.length} ${esc(pl(p.items.length,'exercises'))} · ~${p.minutes} ${esc(t('min'))}</small></span></button><div class="recovery-actions">${added?`<button class="btn sm" data-a="r-open" data-id="${esc(p.id)}">${IC.check}<span>${esc(t('recoveryAdded'))}</span></button>`:`<button class="btn sm primary" data-a="recovery-add" data-id="${esc(p.id)}">${IC.plus}<span>${esc(t('recoveryAdd'))}</span></button>`}<button class="btn sm" data-a="recovery-preview" data-id="${esc(p.id)}">${esc(t('recoveryPreview'))}</button></div></article>`;}).join('')}</div>`;
  }
  function shRecovery(id){const fn=()=>{const p=REC.find(x=>x.id===id);if(!p)return {title:'',html:''};const added=D().routines.some(r=>r.id===p.id);
    return {title:recName(p),html:`<section class="recovery-intro"><p class="recovery-lead">${esc(p.sub[L()]||p.sub.en)} · ${p.items.length} ${esc(pl(p.items.length,'exercises'))} · ~${p.minutes} ${esc(t('min'))}</p><p class="note">${esc(p.info[L()]||p.info.en)}</p><p class="cap">${esc(t('recoverySource'))}: ${esc(p.source)}</p></section><ol class="recovery-steps">${p.items.map((it,n)=>{if(!EX[it.ex])return '';const cues=exSteps(it.ex).list;return `<li class="recovery-step"><div class="recovery-step-head"><span class="recovery-num" aria-hidden="true">${n+1}</span><span class="recovery-step-name"><b>${esc(exName(it.ex))}</b><small>${it.sets} × ${esc(doseText(it.reps))}</small></span><button class="icon-btn" data-a="ex-open" data-id="${esc(it.ex)}" aria-label="${esc(t('exerciseGuide'))}: ${esc(exName(it.ex))}">${IC.chev}</button></div><div class="recovery-pair">${recPair(it.ex).map((src,k)=>`<figure><img src="${esc(src)}" alt="${esc(exName(it.ex)+' · '+t(k?'artEnd':'artStart'))}" loading="lazy" decoding="async"><figcaption>${esc(t(k?'artEnd':'artStart'))}</figcaption></figure>`).join('')}</div><ol class="recovery-cues">${cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ol></li>`;}).join('')}</ol>`,
      foot:added?`<button class="btn primary" data-a="recovery-start" data-id="${esc(p.id)}">${IC.play}${esc(t('startWorkout'))}</button>`:`<div class="cook-nav"><button class="btn" data-a="recovery-add" data-id="${esc(p.id)}">${IC.plus}${esc(t('recoveryAdd'))}</button><button class="btn primary" data-a="recovery-start" data-id="${esc(p.id)}">${IC.play}${esc(t('recoveryAddStart'))}</button></div>`};};fn.kind='recovery';return fn;}
  function addRecovery(id){
    const p=REC.find(x=>x.id===id);if(!p)return null;const have=getR(p.id);if(have)return have;
    if(D().routines.length>=100){toast(t('routineLimit'));return null;}
    const r={id:p.id,builtin:false,icon:p.icon,focus:p.focus,name:{hu:p.name.hu,en:p.name.en},sub:p.sub,info:p.info,items:p.items.filter(i=>EX[i.ex]).map(i=>({...i}))};
    if(!Store.apply(d=>{d.routines.push(r);})){toast(t('saveFailed'));return null;}
    return getR(p.id);
  }
  function shStabilityOrganise(focus){const fn=()=>({title:t('moveExistingRoutine'),html:`<p class="cap">${esc(t('stabilityMoveHint'))}</p><div class="rlist">${D().routines.filter(r=>r.focus!==focus).map(r=>`<button class="rcard" data-a="stability-move" data-id="${esc(r.id)}" data-focus="${focus}"><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(pl(r.items.length,'exercises'))}</i></span>${IC.plus}</button>`).join('')||`<p class="empty">${esc(t('noRoutinesYet'))}</p>`}</div>`});fn.kind='stability-organise';return fn;}

  function vHome() {
    const d=D(),nx=nextRoutine(),wk=weekWorkouts(),tk=d.workouts.filter(w=>w.tick&&ymd(w.start)===today()).pop();
    let h=head(t('tabHome'),fmtDate(Date.now(),true),true);
    if(isIOS&&!standalone)h+=`<div class="note" data-a="install-help"><b>${esc(t('installTitle'))}</b><span>${esc(t('installShort'))}</span></div>`;
    if(Store.memoryOnly)h+=`<div class="note warn"><b>${esc(t('noStorage'))}</b></div>`;
    if(Store.failed)h+=`<div class="note warn"><b>${esc(t('saveFailed'))}</b></div>`;
    h+=`<nav class="workout-tabs seg" aria-label="${esc(t('workoutNavigation'))}">${['train','plans','exercises','stability','ride','history'].map(tab=>`<button class="${ui.workout===tab?'on':''}" data-a="workout-view" data-v="${tab}" aria-pressed="${ui.workout===tab}">${esc(t('workout_'+tab))}</button>`).join('')}</nav>`;
    if(ui.workout==='plans')return h+routineGrid();
    if(ui.workout==='stability')return h+vStability();
    if(ui.workout==='ride')return h+rideView();
    if(ui.workout==='history')return h+`<div class="h2row"><h2>${esc(t('history'))}</h2><span class="cap">${d.workouts.length} ${esc(pl(d.workouts.length,'totalWorkouts'))}</span></div>`+workoutHistory(d.workouts.slice().reverse().slice(0,ui.homeHistLimit||40))+(d.workouts.length>(ui.homeHistLimit||40)?`<button class="btn" data-a="workout-history-more">${esc(t('showMore'))}</button>`:'');
    if(ui.workout==='exercises')return h+complexCards()+libControls()+`<div class="ownrow"><button class="pill" data-a="mx-new">${IC.plus}${esc(t('myExBtn'))}</button></div><div id="lib-list" class="exlist exgrid">${libRows(false)}</div>`;
    const goal=d.settings.weekGoal;
    h+=`<div class="training-week"><span>${esc(t('thisWeek'))}</span><b>${wk.length}${goal>0?' / '+goal:''} ${esc(pl(goal>0?goal:wk.length,'workoutsWord'))}</b></div>`;
    if(d.active)h+=`<button class="hero resume" data-a="w-open"><small>${esc(t('inProgress'))}</small><strong>${esc(d.active.name)}</strong><span>${esc(t('tapResume'))}</span></button>`;
    else if(tk)h+=`<div class="hero done"><small>${esc(t('doneToday'))}</small><strong>${IC.check}${esc(tk.name)}</strong><span>${esc(t('tickedSub'))}</span><button class="link" data-a="w-untick" data-id="${esc(tk.id)}">${esc(t('undo'))}</button></div>`;
    else if(nx){
      // The next session shows its own name large and the split it belongs to small; tapping it previews the exercises without starting.
      const full=rName(nx),plan=nx.sub&&nx.sub[L()],short=plan&&full.startsWith(plan+' · ')?full.slice(plan.length+3):full;
      h+=`<div class="hero training-hero"><small>${esc(t('nextUp'))}</small><button class="hero-preview" data-a="r-open" data-id="${esc(nx.id)}" aria-label="${esc(t('viewExercises'))}: ${esc(short)}"><strong>${esc(short)}</strong>${IC.chev}</button>${plan?`<span class="hero-plan">${esc(plan)}</span>`:''}<span>${nx.items.length} ${esc(pl(nx.items.length,'exercises'))} · ~${estMin(nx)} ${esc(t('min'))}</span><button class="btn primary big" data-a="w-start" data-id="${esc(nx.id)}">${IC.play}${esc(t('startWorkout'))}</button><div class="hero-links"><button class="link" data-a="r-open" data-id="${esc(nx.id)}">${IC.lib}${esc(t('viewExercises'))}</button><button class="link training-tick" data-a="w-tick" data-id="${esc(nx.id)}">${IC.check}${esc(t('tickWorkout'))}</button></div></div>`;
    }
    h+=`<div class="training-actions"><button class="btn" data-a="workout-view" data-v="plans">${IC.home}${esc(t('chooseWorkout'))}</button><button class="btn" data-a="w-quick">${IC.bolt}${esc(t('quickWorkout'))}</button></div>`;
    const rank=topRank();
    h+=`<button class="rank-preview" data-a="open-ranks">${rankBadge(rank)}<span><small>${esc(t('yourRanks'))}</small><b>${esc(rank<0?t('rankStart'):StrengthRanks.tiers[rank][L()])}</b></span>${IC.chev}</button>`;
    h+=`<section class="card cardio-shortcut"><div><h3>${esc(t('logCardio'))}</h3><p class="cap">${esc(t('cardioShortcutHint'))}</p></div><button class="btn" data-a="cardio-add">${IC.plus}${esc(t('add'))}</button></section>`;
    h+=`<div class="h2row"><h2>${esc(t('latestWorkout'))}</h2><button class="link" data-a="workout-view" data-v="history">${esc(t('viewAll'))}</button></div>`+workoutHistory(d.workouts.slice(-1).reverse());
    return h;
  }

  function libFilter(st) {
    const q = norm(st.q).split(/\s+/).filter(Boolean), g = st.grp || '';
    if (g === 'sel') return (st.sel || []).map(id => EX[id]).filter(Boolean);     // "selected": what is ticked, in the order it was ticked
    const ms = st.mus ? [st.mus] : GROUPS[g], fav = D().favEx;
    const list = window.EXERCISES.filter(e => (g !== 'fav' || fav.indexOf(e.id) >= 0) && (g !== 'own' || e.own) && (!ms || e.p.some(m => ms.indexOf(m) >= 0)) && (!st.eq || e.eq === st.eq) && q.every(w => exKey(e.id).indexOf(w) >= 0));
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
    return `<div class="search with-sel"><input type="search" data-in="lib-q" value="${esc(st.q)}" placeholder="${esc(t('searchEx'))}" autocomplete="off" autocapitalize="off" enterkeyhint="search" aria-label="${esc(t('searchEx'))}"><select data-in="lib-eq" aria-label="${esc(t('equipment'))}"><option value="">${esc(t('eqAll'))}</option>${EQS.map(q => `<option value="${q}" ${st.eq === q ? 'selected' : ''}>${esc(eqp(q))}</option>`).join('')}</select></div>
      <div class="seg grp">${segs.map(([v, n]) => `<button class="${g === v ? 'on' : ''}" data-a="lib-grp" data-g="${v}" ${v === 'fav' ? `aria-label="${esc(t('favs'))}"` : ''} aria-pressed="${g === v}">${esc(n)}</button>`).join('')}</div>
      ${pick ? `<div class="chips selrow" id="pk-selrow" ${st.sel.length ? '' : 'hidden'}><button class="chip sel${g === 'sel' ? ' on' : ''}" id="pk-selchip" data-a="lib-grp" data-g="sel">${esc(t('selected'))} (<span>${st.sel.length}</span>)</button></div>` : ''}
      ${GROUPS[g] ? `<div class="chips mus"><button class="chip${!st.mus ? ' on' : ''}" data-a="lib-mus" data-m="">${esc(t('all'))}</button>${GROUPS[g].map(m => `<button class="chip${st.mus === m ? ' on' : ''}" data-a="lib-mus" data-m="${m}">${esc(mus(m))}</button>`).join('')}</div>` : ''}`;
  }
  function complexCards(){
    const rows=D().routines.filter(r=>RoutineTemplates.isComplex(r)&&!r.focus);
    return rows.length?`<section class="exercise-complexes"><h3>${esc(t('exerciseComplexes'))}</h3><p class="cap">${esc(t('complexHint'))}</p><div class="rlist rgrid">${rows.map(r=>`<button class="rcard rtile ic-${rIcon(r)}" data-a="r-open" data-id="${esc(r.id)}"><span class="r-ic">${RICON[rIcon(r)]}</span><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(pl(r.items.length,'exercises'))} · ${esc(t(r.circuit?'complexRounds':'complexGrips'))}</i></span>${IC.chev}</button>`).join('')}</div></section>`:'';
  }
  function vLib() { return head(t('tabLib'), window.EXERCISES.length + ' ' + t('exercises')) + complexCards() + libControls() + `<div class="ownrow"><button class="pill" data-a="mx-new">${IC.plus}${esc(t('myExBtn'))}</button></div><div id="lib-list" class="exlist exgrid">${libRows(false)}</div>`; }

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
        return hd + `<button class="wrow" data-a="wk-open" data-id="${esc(w.id)}"><span class="wr-d"><b>${new Date(w.start).getDate()}</b><i>${esc(new Date(w.start).toLocaleDateString(L() === 'hu' ? 'hu-HU' : 'en-GB', { weekday: 'short' }))}</i></span><span class="wr-t"><b>${esc(shortName(w.name))}</b><i>${esc(wMeta(w))}</i></span>${IC.chev}</button>`;
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
    return `<details class="daily-plan" ${full?'open':''}><summary class="h2row"><h2>${esc(t('mealPlan'))}</h2><span class="plan-n${n === pd.meals.length ? ' ok' : ''}">${pd.type ? esc(t(pd.type === 'train' ? 'dayTrain' : 'dayRest')) + ' · ' : ''}${n} / ${pd.meals.length}</span>${IC.down}</summary><div class="plan">` + pd.meals.map(m => {
      const on = !!got[m.id];
      return `<button class="pmeal${on ? ' on' : ''}" data-a="pm-tick" data-m="${esc(m.id)}" data-d="${esc(k)}" role="checkbox" aria-checked="${on}"><span class="pm-box">${IC.check}</span><span class="pm-t"><b>${esc(pmName(m))}<small>${m.kcal} kcal</small></b>${full ? `<span class="pm-items">${m.items.map(i => `<span><span>${esc(i.n)}</span><em>${dec(i.g)} g</em></span>`).join('')}</span>` : `<i>${esc(m.items.map(i => i.n).join(', '))}</i>`}<i class="pm-m">${macroLine(m)}</i></span></button>`; }).join('') + `</div>` +
      (full && (p.notes.length || p.train.length) ? `<button class="link" data-a="plan-notes">${esc(t('planRules'))}</button>` : '')+'</details>';
  }
  function shPlanNotes() {
    return () => { const p = D().plan || { notes: [], train: [], name: '' }, sec = (ttl, l) => l.length ? `<h3>${esc(ttl)}</h3><ul class="pnotes">${l.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '';
      return { title: p.name || t('planRules'), html: sec(t('planTrain'), p.train) + sec(t('planFood'), p.notes) || `<p class="empty">${esc(t('noResults'))}</p>` }; };
  }
  function planEntry() {
    return `<button class="plan-entry" data-a="pdf-plan"><span><b>${esc(t('addPlan'))}</b><small>Excel · PDF · Word</small></span>${IC.plus}</button>`;
  }
  function vMealPlan() {
    const p=D().plan;if(!p)return `<section class="meal-plan-header"><h2>${esc(t('mealPlan'))}</h2><p>${esc(t('emptyPlanHint'))}</p></section>`;
    const days=L()==='hu'?['Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat','Vasárnap']:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const current=(new Date().getDay()+6)%7;
    return `<section class="meal-plan-header"><h2>${esc(p.name||t('mealPlan'))}</h2><p>${esc(t('collapsePlanHint'))}</p>${p.notes.length||p.train.length?`<button class="link" data-a="plan-notes">${esc(t('planRules'))}</button>`:''}</section><div class="meal-week">`+p.days.map((d,i)=>`<details class="meal-day" data-meal-day="${i}" ${i===current&&d.meals.length?'open':''}><summary><span><b>${days[i]}</b><small>${d.meals.length} ${esc(L()==='hu'?'étkezés':d.meals.length===1?'meal':'meals')}${d.type?' · '+esc(t(d.type==='train'?'dayTrain':'dayRest')):''}</small></span><span class="meal-day-total">${d.total?d.total.kcal+' kcal':''}${IC.down}</span></summary><div class="meal-day-body">${d.meals.length?d.meals.map(m=>`<div class="meal-plan-row"><div><b>${esc(pmName(m))}</b><strong>${m.kcal} kcal</strong></div><p>${macroLine(m)}</p><details><summary>${esc(t('foodsWord'))}</summary><ul>${m.items.map(f=>`<li>${esc(f.n)} · ${dec(f.g)} g</li>`).join('')}</ul></details></div>`).join(''):`<p class="meal-day-empty">${esc(t('noPlannedMeals'))}</p>`}</div></details>`).join('')+'</div>';
  }
  function vFood() {
    const d = D(), tg0 = dayTargets(ui.foodDate), fromPlan = !!tg0 && tg0 !== d.settings.targets, list = dayFood();
    const burn = energyBudget(ui.foodDate,0,tg0&&tg0.kcal).included, tg = tg0 ? Object.assign({}, tg0, { kcal: tg0.kcal + burn }) : null;   // active calories can be added to the day's budget
    const sum = list.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    let h = head(t('tabFood')) + `<div class="seg"><button class="${ui.food === 'diary' ? 'on' : ''}" data-a="food-view" data-v="diary">${esc(t('diary'))}</button>${d.plan?`<button class="${ui.food === 'plan' ? 'on' : ''}" data-a="food-view" data-v="plan">${esc(t('mealPlan'))}</button>`:''}<button class="${ui.food === 'ideas' ? 'on' : ''}" data-a="food-view" data-v="ideas">${esc(t('ideas'))}</button></div>`;
    if (ui.food === 'ideas') return h + vIdeas();
    if (ui.food === 'plan') return h + vMealPlan();
    h += `<div class="datenav"><button class="icon-btn" data-a="food-day" data-d="-1" aria-label="${esc(t('prevDay'))}">${IC.back}</button><button class="datebtn" data-a="cal" data-d="${ui.foodDate}" aria-label="${esc(t('openCal'))}"><b>${ui.foodDate === today() ? esc(t('today')) : esc(fmtDate(ui.foodDate + 'T12:00', true))}</b>${IC.down}</button><button class="icon-btn flip" data-a="food-day" data-d="1" aria-label="${esc(t('nextDay'))}" ${ui.foodDate >= today() ? 'disabled' : ''}>${IC.back}</button></div>`;
    if (!tg) h += `<button class="note" data-a="targets"><b>${esc(t('setTargets'))}</b><span>${esc(t('setTargetsSub'))}</span></button>`;
    h += `<section class="card cal">${calorieClock(sum.kcal,tg&&tg.kcal,false)}
      ${energyBudgetPanel(ui.foodDate,sum.kcal,tg0&&tg0.kcal)}<div class="macros">${[['p', t('protein')], ['c', t('carbs')], ['f', t('fat')]].map(([k, n]) => `<div><span>${esc(n)}</span><b>${Math.round(sum[k])}${tg ? ' / ' + dec(tg[k]) : ''} g</b>${tg ? Charts.meter(sum[k], tg[k], 'thin') : ''}</div>`).join('')}</div>
      ${fromPlan ? `<p class="cap plancap">${esc(t('planTgCap'))}</p>` : tg ? `<button class="link" data-a="targets">${esc(t('editTargets'))}</button>` : ''}</section>`;
    h += planCard(ui.foodDate, true);
    h += `<div class="food-actions"><button class="btn primary" data-a="food-manual">${IC.plus}<span>${esc(t('foodSearchBtn'))}</span></button><button class="btn" data-a="food-ai" data-m="photo">${IC.cam}<span>${esc(t('scanPhoto'))}</span></button><button class="btn" data-a="food-ai" data-m="text">${IC.pen}<span>${esc(t('describe'))}</span></button></div>`;
    h += actRow(ui.foodDate) + `<div class="meal-mode"><h2>${esc(t('meals'))}</h2><label class="sw"><input type="checkbox" role="switch" data-in="meal-groups" ${d.settings.mealGroups?'checked':''}><span>${esc(t('groupMeals'))}</span></label></div>` + `<div id="food-diary">${foodDiary(list)}</div>`;
    return h;
  }
  const MEAL_KINDS=['breakfast','lunch','dinner','snack','other'];
  const mealKind=v=>MEAL_KINDS.includes(v)?v:'other';
  const mealLabel=v=>t('meal_'+mealKind(v));
  const plannedMealKind=name=>{const n=norm(name);return /\b(breakfast|reggeli)\b/.test(n)?'breakfast':/\b(lunch|ebed)\b/.test(n)?'lunch':/\b(dinner|vacsora)\b/.test(n)?'dinner':/\b(snack|snacks|tizorai|uzsonna)\b/.test(n)?'snack':'other';};
  function mealPicker(){return D().settings.mealGroups?`<label class="fld meal-picker"><span>${esc(t('mealType'))}</span><select data-in="food-meal">${MEAL_KINDS.map(k=>`<option value="${k}" ${mealKind(ui.foodMeal)===k?'selected':''}>${esc(mealLabel(k))}</option>`).join('')}</select></label>`:'';}
  function linkedMeal(f){return f.pm?planDay(ui.foodDate)?.meals.find(m=>m.id===f.pm):null;}
  function loggedMealKind(f){return MEAL_KINDS.includes(f.meal)?f.meal:f.src==='plan'?plannedMealKind(linkedMeal(f)?.name||f.name.split(':')[0]):'other';}
  function diaryRows(list){return `<div class="flist">${list.map(f=>{
    const items=f.items||linkedMeal(f)?.items||[];
    return `<div class="frow" data-food-id="${esc(f.id)}"><span><b>${esc(f.name)}</b><i>${foodAmountText(f)?esc(foodAmountText(f))+' · ':''}${esc(t('pShort'))} ${Math.round(f.p)} · ${esc(t('cShort'))} ${Math.round(f.c)} · ${esc(t('fShort'))} ${Math.round(f.f)}${f.src==='ai'?' · AI':f.src==='plan'?' · '+esc(t('planTag')):''}</i>${items.length?`<ul class="meal-food-parts">${items.map(i=>`<li><span>${esc(i.n)} · ${dec(i.g)} g</span>${i.kcal==null?'':`<b>${Math.round(i.kcal)} kcal</b>`}</li>`).join('')}</ul>`:''}${D().settings.mealGroups?`<button class="link meal-change" data-a="food-meal-edit" data-id="${esc(f.id)}" aria-label="${esc(t('moveMeal'))}: ${esc(f.name)}">${esc(t('moveMeal'))}</button>`:''}</span><strong>${Math.round(f.kcal)}</strong><button class="icon-btn sm" data-a="food-del" data-id="${esc(f.id)}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>`;
  }).join('')}</div>`;}
  function foodDiary(list){
    if(!D().settings.mealGroups)return list.length?diaryRows(list):`<p class="empty">${esc(t('noMeals'))}</p>`;
    const dayTotal=list.reduce((n,f)=>n+f.kcal,0);
    return MEAL_KINDS.map(k=>{
      const rows=list.filter(f=>loggedMealKind(f)===k),sum=rows.reduce((a,f)=>({kcal:a.kcal+f.kcal,p:a.p+f.p,c:a.c+f.c,f:a.f+f.f}),{kcal:0,p:0,c:0,f:0}),share=dayTotal?sum.kcal/dayTotal:0,open=!!ui.mealOpen[ui.foodDate+'-'+k],label=mealLabel(k),macroEnergy=sum.p*4+sum.c*4+sum.f*9;
      return `<section class="card meal-group${open?' expanded':''}" data-meal="${k}"><div class="meal-group-head"><button class="meal-toggle" data-a="food-group-toggle" data-meal="${k}" aria-expanded="${open}" aria-controls="meal-panel-${k}"><span class="meal-clock" data-clock-key="meal-${ui.foodDate}-${k}" data-clock-ratio="${share}">${Profile.dial(sum.kcal,dayTotal,t('mealShareLabel',label,Math.round(sum.kcal),Math.round(share*100)))}<span><b>${Math.round(sum.kcal)}</b><small>kcal</small></span></span><span class="meal-summary"><b>${esc(label)}${IC.down}</b><span class="meal-macros">${[['p','pShort'],['c','cShort'],['f','fShort']].map(([m,n])=>`<span title="${esc(t({p:'protein',c:'carbs',f:'fat'}[m]))}">${esc(t(n))} ${Math.round(sum[m])} g</span>`).join('')}</span><span class="meal-macro-bar" aria-hidden="true">${['p','c','f'].map(m=>`<i class="macro-${m}" style="width:${macroEnergy?sum[m]*(m==='f'?9:4)/macroEnergy*100:0}%"></i>`).join('')}</span></span></button><button class="icon-btn meal-add" data-a="food-group-add" data-meal="${k}" aria-label="${esc(t('addFoodTo',label))}" title="${esc(t('addFoodTo',label))}">${IC.plus}</button></div><div class="meal-panel" id="meal-panel-${k}" ${open?'':'inert'}><div><div class="meal-panel-content">${rows.length?diaryRows(rows):`<p class="cap">${esc(t('mealEmpty'))}</p>`}<p class="meal-share cap">${esc(t('mealShare',Math.round(share*100)))}</p></div></div></div></section>`;
    }).join('');
  }
  /* ---------- meal ideas ---------- */
  const RCP = window.RECIPES || { items: [], videos: [] };
  function recipeReference(r,hero=false) {
    const picture=`<span class="recipe-photo ${hero?'recipe-hero':'recipe-thumb'}" ${hero?`role="img" aria-label="${esc(t('recipeReferenceLabel',r[L()]||r.en))}"`:'aria-hidden="true"'}><img src="img/recipes/${esc(r.id)}${hero?'':'-thumb'}.webp" alt="" ${hero?'':`srcset="img/recipes/${esc(r.id)}-thumb.webp 384w, img/recipes/${esc(r.id)}.webp 1448w" sizes="(min-width: 760px) 360px, calc((100vw - 44px) / 2)"`} loading="${hero?'eager':'lazy'}" decoding="async" width="${hero?1448:384}" height="${hero?1086:288}"></span>`;
    return hero?`<figure class="recipe-reference">${picture}<figcaption>${esc(t(r.illustration?'recipeIllustrationCaption':'recipeReferenceCaption'))}</figcaption></figure>`:picture;
  }
  function vIdeas() {
    const cats = [['', t('all')], ['breakfast', t('cat_breakfast')], ['main', t('cat_main')], ['snack', t('cat_snack')], ['drink', t('cat_drink')]];
    let h = `<nav class="seg recipe-categories" aria-label="${esc(t('recipeCategories'))}">${cats.map(([c, n]) => `<button class="${ui.idea === c ? 'on' : ''}" data-a="idea-cat" data-c="${c}" aria-pressed="${ui.idea === c}">${esc(n)}</button>`).join('')}</nav><div class="recipe-grid">` +
      RCP.items.filter(r => !ui.idea || r.cat === ui.idea).map(r => `<button class="rcard recipe-card" data-a="idea-open" data-id="${esc(r.id)}" aria-label="${esc(r[L()]||r.en)}">${recipeReference(r)}<span class="recipe-card-copy"><b class="recipe-card-name">${esc(r[L()]||r.en)}</b><span class="recipe-card-meta"><span>${r.kcal==null?'—':dec(r.kcal)} <small>kcal</small></span><small>${r.min} ${esc(t('min'))}</small></span><span class="recipe-card-macros">${[['p','protein'],['c','carbs'],['f','fat']].map(([key,label])=>`<span class="macro-${key}"><small>${esc(t(label))}</small><b>${r[key]==null?'—':dec(r[key])}<small> g</small></b></span>`).join('')}</span></span></button>`).join('') + `</div>`;
    const vids=RCP.videos.filter(v=>/^https:\/\/www\.tiktok\.com\//.test(v.url));
    if(vids.length)h+=`<details class="recipe-source-clips mini-section"><summary>${esc(t('videosTitle'))}${IC.down}</summary><div class="rlist">${vids.map(v=>`<a class="rcard" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer"><span class="q-ic">${IC.play}</span><span class="rc-t"><b>${esc(v.t)}</b><i>TikTok · @iamvargacsaba</i></span>${IC.chev}</a>`).join('')}</div><p class="cap">${esc(t('videosCap'))}</p></details>`;
    return h;
  }
  const stepArt = (r, n) => (r.art && r.art[n]) || CookArt.kind((r.steps.en || [])[n]);
  function cookingArt(kind){ return `<div class="cooking-art" aria-hidden="true">${CookArt.svg(kind)}</div>`; }
  function recipeAmount(value){
    if(typeof value==='number')return dec(value)+' g';
    if(Array.isArray(value))return String(value[L()==='hu'?0:1]||value[1]||'');
    const pairs={
      '400 g (a videóban 390 g / 390 g used in clip)':['400 g (a videóban 390 g)','400 g (390 g used in clip)'],
      '1½ doboz / cartons':['1½ doboz','1½ cartons'], 'ízlés szerint / to taste':['ízlés szerint','to taste'],
      '1 db / one':['1 db','1'], '1–3 gerezd / cloves':['1–3 gerezd','1–3 cloves'], '2 db / two':['2 db','2'],
      '60 g + 15 g a tetejére / topping':['60 g + 15 g a tetejére','60 g + 15 g for topping'],
      '2 csésze / cups':['2 csésze','2 cups'], '4 db / four':['4 db','4'], '1 tk / tsp':['1 tk','1 tsp'],
      '4 ek / tbsp':['4 ek','4 tbsp'], '1¼ csésze / cups':['1¼ csésze','1¼ cups'],
      'mennyiség nem látszik / quantity not shown':['mennyiség nem látszik','quantity not shown']
    };
    return pairs[value]?.[L()==='hu'?0:1]||String(value||'');
  }
  function recipeCookState(r){ui.recipeCooking=ui.recipeCooking||{};return ui.recipeCooking[r.id]||(ui.recipeCooking[r.id]={step:0,ingredients:{}});}
  function shRecipeCook(id){
    const fn=()=>{const r=RCP.items.find(r=>r.id===id);if(!r)return {title:t('method'),html:''};const state=recipeCookState(r),steps=r.steps[L()]||r.steps.en,step=Math.max(0,Math.min(steps.length,state.step)),k=L()==='hu'?0:1;
      const body=step===0?`<h3>${esc(t('cookGather'))}</h3><p class="cap">${esc(t('recipeYield',r.servings||1))}</p><div class="cook-ingredients">${r.ing.map((i,n)=>`<label class="cook-ingredient${state.ingredients[n]?' checked':''}"><input type="checkbox" data-in="cook-ingredient" data-id="${esc(r.id)}" data-i="${n}" ${state.ingredients[n]?'checked':''}><span><b>${esc(i[k])}</b><small>${esc(recipeAmount(i[2]))}</small></span></label>`).join('')}</div>`:`<small class="eyebrow">${esc(t('cookStep',step,steps.length))}</small><h3>${esc(t(step===steps.length?'cookLastStep':'cookNextStep'))}</h3><p class="cook-instruction">${esc(steps[step-1])}</p>`;
      return {title:r[L()]||r.en,html:`<section class="recipe-cooking"><div class="cook-progress" role="progressbar" aria-label="${esc(t('cookProgress'))}" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${step}"><i style="width:${step/Math.max(1,steps.length)*100}%"></i></div>${cookingArt(step===0?'gather':stepArt(r,step-1))}${body}</section>`,foot:`<div class="cook-nav"><button class="btn" data-a="cook-back" data-id="${esc(id)}" ${step===0?'disabled':''}>${IC.back}${esc(t('back'))}</button><button class="btn primary" data-a="cook-next" data-id="${esc(id)}">${esc(t(step===steps.length?'done':step===0?'cookStart':'next'))}${step===steps.length?IC.check:IC.chev}</button></div>`};
    };fn.kind='recipe-cook';return fn;
  }

  function shRecipe(id) {
    return () => {
      const r = RCP.items.find(x => x.id === id); if (!r) return { title: '', html: '' };
      const k = L() === 'hu' ? 0 : 1, q = ui.recipeQty || 1, macro = key => r[key] == null ? '—' : r1(r[key] * q);
      return { title: r[L()] || r.en, html: `${mealPicker()}${recipeReference(r,true)}<div class="kpis k4"><div><b>${macro('kcal')}</b><i>kcal</i></div><div><b>${macro('p')} g</b><i>${esc(t('protein'))}</i></div><div><b>${macro('c')} g</b><i>${esc(t('carbs'))}</i></div><div><b>${macro('f')} g</b><i>${esc(t('fat'))}</i></div></div>
        <div class="recipe-portions"><span>${esc(t('recipeQty'))}</span><button class="icon-btn" data-a="recipe-qty" data-n="-0.5" ${q <= .5 ? 'disabled' : ''} aria-label="−0.5">−</button><b>${q}</b><button class="icon-btn" data-a="recipe-qty" data-n="0.5" ${q >= 20 ? 'disabled' : ''} aria-label="+0.5">+</button></div><p class="cap">${r.g ? r1(r.g * q) + ' g · ' : ''}${r.min} ${esc(t('min'))} · ${esc(t('recipeYield', r.servings || 1))}${r.source ? ' · ' + esc(t('recipeEstimate')) : ''}</p>
        <section class="card"><h3>${esc(t('recipeBatch'))}</h3><ul class="ing">${r.ing.map(i => `<li${typeof i[2]==='string'&&i[2].length>24?' class="long-quantity"':''}><span>${esc(i[k])}</span><b>${esc(recipeAmount(i[2]))}</b></li>`).join('')}</ul></section>
        <button class="btn primary recipe-cook-launch" data-a="recipe-cook" data-id="${esc(r.id)}">${IC.play}${esc(t('cookTogether'))}</button><h3 class="recipe-method-title">${esc(t('method'))}</h3><ol class="recipe-steps">${(r.steps[L()] || r.steps.en).map((x, n) => `<li class="recipe-step"><span class="recipe-step-art">${CookArt.svg(stepArt(r, n))}<b>${n + 1}</b></span><p>${esc(x)}</p></li>`).join('')}</ol><p class="cap">${esc(r.note ? r.note[L()] || r.note.en : t('ideasCap'))}</p>${r.source ? `<p class="cap">${esc(t('recipeSource'))}: ${esc(r.source)}</p>` : ''}`,
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
    return { key: (hu ? 'hu:' + hu[0] : 'en:' + r[0]), own: !!(hu && hu[3]), name: hu ? hu[0] : r[0], usda: hu ? r[0] : '', approx: !!(hu && hu[2]), kcal: r[1], p: r[2], c: r[3], f: r[4], ports,volume:FoodVolume.describe(r,hu) };
  }
  const dec = v => L() === 'hu' ? String(v).replace('.', ',') : String(v);                                 // Hungarian writes 22,5
  const macroLine = f => `${esc(t('pShort'))} ${dec(f.p)} · ${esc(t('cShort'))} ${dec(f.c)} · ${esc(t('fShort'))} ${dec(f.f)}`;
  let fKey = null;                                                                      // favourite key -> where the food is in the table
  function favFoodHits() {
    if (!fKey) { fKey = {}; FOODS.hu.forEach((h, i) => { fKey['hu:' + h[0]] = { h: i, i: h[1] }; }); FOODS.list.forEach((r, i) => { fKey['en:' + r[0]] = { h: -1, i }; }); }
    return D().favFoods.map(k => fKey[k]).filter(Boolean);
  }
  const BRANDS = ["McDonald's", 'Burger King', 'KFC', 'Subway', 'Pizza Hut', "Wendy's", 'Taco Bell', "Domino's", 'Popeyes'];
  const foodHit = (x, k, a) => { const f = foodOf(x.i, x.h); return `<button class="frow fhit" data-a="${a}" data-n="${k}"><span><b>${esc(f.name)}${f.approx ? ' ≈' : ''}${D().favFoods.indexOf(f.key) >= 0 ? ' <em class="fv" aria-hidden="true">★</em>' : ''}</b><i>${Math.round(f.kcal*(f.volume.gramsPerDl?f.volume.gramsPerDl/100:1))} kcal / ${f.volume.gramsPerDl?'1 dl':'100 g'} · ${macroLine({p:r1(f.p*(f.volume.gramsPerDl?f.volume.gramsPerDl/100:1)),c:r1(f.c*(f.volume.gramsPerDl?f.volume.gramsPerDl/100:1)),f:r1(f.f*(f.volume.gramsPerDl?f.volume.gramsPerDl/100:1))})}</i></span>${IC.chev}</button>`; };
  function foodRows() {
    const st = ui.fs, q = st.q.trim(), rc = D().recentFoods;
    const more = `<div class="fs-more"><p class="cap">${esc(t(q ? 'foodNotFound' : 'foodOwnLead'))}</p>${q ? `<button class="btn" data-a="fs-ai">${IC.bolt}${esc(t('foodAskAI'))}</button>` : ''}<button class="btn" data-a="fs-own">${IC.pen}${esc(t('foodOwn'))}</button><button class="btn" data-a="mf-new">${IC.plus}${esc(t('myFoodNew'))}</button></div>`;
    const toks = norm(q).split(/[\s,]+/).filter(Boolean), mine = D().myFoods.filter(z => { const s = norm(z.name); return toks.every(tk => s.indexOf(tk) >= 0); });
    const myBlock = mine.length ? `<p class="cap">${esc(t('myFoods'))}</p><div class="flist">${mine.map(z => `<div class="frow myf"><button class="myf-main" data-a="fs-my" data-id="${esc(z.id)}"><b>${esc(z.name)}</b><i>${dec(z.kcal)} kcal / ${z.basis==='ml'?'1 dl':'100 g'} · ${macroLine(z)}</i></button><button class="icon-btn sm" data-a="mf-edit" data-id="${esc(z.id)}" aria-label="${esc(t('edit'))}">${IC.pen}</button></div>`).join('')}</div>` : '';
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
    const fn = () => ({ title: t('addFoodTitle'), html: `${mealPicker()}<div class="search"><input type="search" data-in="fs-q" value="${esc(ui.fs.q)}" placeholder="${esc(t('foodSearchPh'))}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="${esc(t('addFoodTitle'))}"></div><div id="fs-list">${foodRows()}</div>` });
    fn.kind = 'foodfind'; return fn;
  }
  function faOut() {
    const f = ui.fa.food, q=FoodVolume.quantity(f,ui.fa.g,ui.fa.unit), k=q?q.k:0;
    return `<div class="kpis k4"><div class="hl"><b>${Math.round(f.kcal * k)}</b><i>kcal</i></div><div><b>${dec(r1(f.p * k))} g</b><i>${esc(t('protein'))}</i></div><div><b>${dec(r1(f.c * k))} g</b><i>${esc(t('carbs'))}</i></div><div><b>${dec(r1(f.f * k))} g</b><i>${esc(t('fat'))}</i></div></div>`;
  }
  function shFoodAmount() {
    return () => {
      const f = ui.fa.food,dl=ui.fa.unit==='dl',canDl=f.basis==='ml'||f.volume?.gramsPerDl>0;
      const chips=dl?[[1,'1 dl'],[2,'2 dl'],[2.5,'2.5 dl'],[3.3,'3.3 dl'],[5,'5 dl']]:[[100,'100 g']].concat(f.ports.map(p=>[p[0],p[1]+' ('+p[0]+' g)']));
      const k100=f.basis==='ml'?1:canDl?f.volume.gramsPerDl/100:1;
      const fav = D().favFoods.indexOf(f.key) >= 0;
      return { title: t('addFoodTitle'), html: `<div class="exmeta top"><p class="fa-name">${esc(f.name)}</p>${f.my ? '' : `<button class="favbtn${fav ? ' on' : ''}" data-a="fav-food" aria-pressed="${fav}">${IC.star}${esc(t(fav ? 'favOn' : 'favAdd'))}</button>`}</div>${f.usda ? `<p class="en">${esc(f.usda)}</p>` : ''}<p class="cap">${f.basis==='ml'||canDl?'1 dl':esc(t('per100'))}: ${Math.round(f.kcal*k100)} kcal · ${macroLine({p:r1(f.p*k100),c:r1(f.c*k100),f:r1(f.f*k100)})}</p>
        ${f.approx ? `<div class="note warn"><b>${esc(t('foodApprox'))}</b></div>` : ''}
        ${canDl&&f.basis!=='ml'?`<div class="seg quantity-units"><button data-a="fa-unit" data-v="dl" aria-pressed="${dl}" class="${dl?'on':''}">dl</button><button data-a="fa-unit" data-v="g" aria-pressed="${!dl}" class="${!dl?'on':''}">g</button></div>`:''}
        ${f.volume?.liquid&&!canDl?`<p class="cap">${esc(t('volumeMissing'))}</p><button class="btn" data-a="fa-label">${esc(t('useLiquidLabel'))}</button>`:''}
        <label class="fld"><span>${esc(t(dl?'decilitres':'grams'))}</span><input type="text" inputmode="decimal" data-in="fa-g" value="${esc(ui.fa.g)}" autocomplete="off" enterkeyhint="done"></label>
        <div class="chips">${chips.map(([v, l]) => `<button class="chip${num(ui.fa.g) === v ? ' on' : ''}" data-a="fa-set" data-g="${v}">${esc(l)}</button>`).join('')}</div>
        ${mealPicker()}<div id="fa-out">${faOut()}</div><p class="cap">${esc(t(f.my ? 'myFoodSrc' : 'foodSrc'))}</p>`,
        foot: `<button class="btn primary" data-a="fa-add">${esc(t('addToDiary'))}</button>` };
    };
  }
  function pickFood(x) { const f = foodOf(x.i, x.h); const each = f.ports.find(pt => f.own || /item|sandwich|slice|\bsub\b|\bbar\b|large|medium|small|link|patty|biscuit|taco|burrito|pieces|container|\bcan\b|packet/i.test(pt[2] || ''));   // start from a natural unit (1 sandwich, 1 slice…), otherwise from 100 g
      ui.fa = {food:f,unit:f.volume.gramsPerDl?'dl':'g',g:f.volume.gramsPerDl?'2.5':String(each?each[0]:100)};openSheet(shFoodAmount()); }
  const profileLocal = () => Profile.clean(D().settings.publicProfile);
  function profileShortcut(){const p=profileLocal();return `<button class="profile-shortcut" data-a="profile-home" aria-label="${esc(t('tabProfile'))}" title="${esc(t('tabProfile'))}">${p.avatar?`<img src="${esc(p.avatar)}" alt="">`:IC.profile}</button>`;}
  function profileColor(p){const match=/^hue_(\d+)$/.exec(p.theme);return match?(AccentTheme.fill(+match[1])||hueRGB(+match[1],.68)):null;}
  function profileWheelStyle(p){const c=profileColor(p)||({mint:[42,206,157],violet:[153,109,241],amber:[248,174,67],slate:[105,160,217]}[p.theme]);return ` style="--acc:rgb(${c.join(',')});--acc-ink:${AccentTheme.ink(c)}"`; }
  const colorStyle=(p,style)=>{if(style?.useAccent)return '';const c=profileColor(p);return c?` style="--profile-rgb:${c.join(',')}"`:'';};
  const profileHue=p=>/^hue_(\d+)$/.test(p.theme)?+p.theme.slice(4):({mint:155,violet:262,amber:40,slate:211}[p.theme]||155);
  const profileStyle=()=>Profile.cleanStyle(D().settings.profileStyle);
  const coverPhoto=(p,s)=>s.cover==='photo'&&p.coverPhoto?`<img class="profile-cover-photo" src="${esc(p.coverPhoto)}" alt="" aria-hidden="true">`:'';
  const styleClasses=s=>`cover-${s.cover} frame-${s.frame}${s.useAccent?' profile-use-accent':''}`;
  const sectionOpen=key=>ui.sections?.[key]!==false;
  function miniSection(key,title,body){return `<details class="mini-section" data-section="${key}" ${sectionOpen(key)?'open':''}><summary>${esc(title)}${IC.down}</summary><div class="section-body">${body}</div></details>`;}
  function profilePreview(p,style){return `<div class="profile-cover profile-preview theme-${p.theme} ${styleClasses(style)}"${colorStyle(p,style)}>${coverPhoto(p,style)}<div class="profile-identity">${avatar(p,false)}<div><h2>${esc(p.displayName||p.username||t('profileWelcome'))}</h2>${p.username?`<p>@${esc(p.username)}</p>`:''}</div></div>${p.bio?`<p class="profile-bio">${esc(p.bio)}</p>`:''}</div>`;}
  function avatar(p, small, view=false) {
    const initial=(p.displayName||p.username||t('appName')).slice(0,1).toUpperCase();
    const tag=view&&p.avatar?'button':'span';
    return `<${tag} class="profile-avatar${small?' small':''}"${tag==='button'?` type="button" data-a="profile-photo-view" aria-label="${esc(t('viewProfilePhoto'))}" aria-haspopup="dialog"`:""}>${p.avatar?`<img src="${esc(p.avatar)}" alt="${esc(p.displayName||p.username||t('tabProfile'))}">`:esc(initial)}</${tag}>`;
  }
  function badgeChip(b, detailed) {
    return `<span class="achievement${b.earned?' earned':' locked'}" data-badge="${esc(b.id)}">${Profile.symbol(b.icon)}<span><b>${esc(b[L()])}</b>${detailed?`<small>${esc(b[L()+'Hint'])}</small>`:''}</span></span>`;
  }
  /* ================= DAILY ROUTINE ================= */
  const plannerTime = ms => new Date(ms).toLocaleTimeString(L()==='hu'?'hu-HU':'en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});
  const plannerIcon = kind => ({gym:IC.home,swim:'<svg viewBox="0 0 24 24"><path d="M3 19c3-3 3 3 6 0s3 3 6 0 3 3 6 0M5 13l5-4 5 4 4-3M10 9l-3-4H3"/><circle cx="16" cy="6" r="2"/></svg>',run:IC.walk,focus:IC.prog,personal:IC.profile,recovery:IC.habit,other:IC.cal}[kind]||IC.habit);
  function plannerDays(){const d=ui.plannerDate;return ui.plannerView==='week'?Array.from({length:7},(_,i)=>Momentum.shift(DailyPlanner.day(weekStart(d+'T12:00')),i)):[d];}
  function vPlanner(){
    const d=ui.plannerDate,loc=L()==='hu'?'hu-HU':'en-GB',week=DailyPlanner.day(weekStart(d+'T12:00')),days=plannerDays();
    const items=days.map(k=>DailyPlanner.occurrences(D().planner,k));
    const layouts=items.flatMap((es,i)=>DailyPlanner.layout(es,days[i]));
    const startHour=Math.min(6,...layouts.map(e=>Math.floor(e.from/60))),endHour=Math.max(23,...layouts.map(e=>Math.ceil(e.to/60)));
    const sourceCount=D().planner.sources.length,local=DailyPlanner.occurrences(D().planner,d),completed=local.filter(e=>e.complete).length;
    const dateLabel=new Date(d+'T12:00').toLocaleDateString(loc,{month:'long',year:'numeric'});
    let h=`<section class="daily-planner"><div class="planner-toolbar"><div><p class="planner-month">${esc(dateLabel)}</p><h2>${esc(d===today()?t('today'):new Date(d+'T12:00').toLocaleDateString(loc,{weekday:'long'}))}<span>${new Date(d+'T12:00').getDate()}</span></h2></div><div class="planner-tools"><button class="icon-btn" data-a="planner-calendar" aria-label="${esc(t('plannerCalendars'))}" title="${esc(t('plannerCalendars'))}">${IC.cal}${sourceCount?'<i class="planner-connected-dot"></i>':''}</button><button class="btn sm primary" data-a="planner-new">${IC.plus}<span>${esc(t('add'))}</span></button></div></div>`;
    h+=`<div class="planner-week-row"><button class="icon-btn" data-a="planner-shift" data-d="-7" aria-label="${esc(t('prevWeek'))}">${IC.back}</button><div class="planner-week">${Array.from({length:7},(_,i)=>{const k=Momentum.shift(week,i),e=DailyPlanner.occurrences(D().planner,k);return `<button data-a="planner-day" data-d="${k}" class="${k===d?'selected':''}" aria-pressed="${k===d}" ${k===today()?'aria-current="date"':''} aria-label="${esc(fmtDate(k+'T12:00',true))}"><small>${esc(new Date(k+'T12:00').toLocaleDateString(loc,{weekday:'short'}).replace(/\.$/,''))}</small><b>${k.slice(-2)}</b><i class="${e.length?'has-events':''}"></i></button>`;}).join('')}</div><button class="icon-btn flip" data-a="planner-shift" data-d="7" aria-label="${esc(t('nextWeek'))}">${IC.back}</button></div>`;
    h+=`<div class="planner-view-row"><span class="planner-summary">${local.length?esc(t('plannerDayCount',completed,local.length)):esc(t('plannerOpenDay'))}</span><div class="planner-view-switch" aria-label="${esc(t('plannerView'))}">${['day','week'].map(v=>`<button class="${ui.plannerView===v?'on':''}" data-a="planner-view" data-v="${v}" aria-pressed="${ui.plannerView===v}">${esc(t(v==='day'?'plannerDay':'plannerWeek'))}</button>`).join('')}</div>${d!==today()?`<button class="link planner-today" data-a="planner-today">${esc(t('today'))}</button>`:''}</div>`;
    const from=startHour*60,span=(endHour-startHour)*60;
    h+=`<div class="planner-scroll" data-start-hour="${startHour}" tabindex="0" role="region" aria-label="${esc(t('plannerTimetable'))}" style="--planner-days:${days.length};--planner-height:${span*1.2}px"><div class="planner-canvas${days.length>1?' planner-wide':''}"><div class="planner-grid-head"><span>${esc(t('plannerTime'))}</span>${days.map(k=>`<b>${esc(new Date(k+'T12:00').toLocaleDateString(loc,{weekday:'short',day:'numeric'}))}</b>`).join('')}</div>`;
    if(items.some(es=>es.some(e=>e.allDay)))h+=`<div class="planner-all-day"><small>${esc(t('plannerAllDay'))}</small>${items.map(es=>`<div>${es.filter(e=>e.allDay).map(e=>`<button class="planner-all-event${e.complete?' complete':''}" data-a="planner-edit" data-id="${esc(e.id)}" data-d="${e.occurrenceDay||e.day}">${esc(e.title)}</button>`).join('')}</div>`).join('')}</div>`;
    h+=`<div class="planner-timetable"><div class="planner-hours">${Array.from({length:endHour-startHour+1},(_,i)=>`<span style="top:${i*72}px">${pad(startHour+i)}:00</span>`).join('')}</div>${days.map((k,index)=>{
      const events=DailyPlanner.layout(items[index],k),now=new Date(),minute=now.getHours()*60+now.getMinutes();
      return `<div class="planner-day-column" aria-label="${esc(fmtDate(k+'T12:00',true))}">${Array.from({length:(endHour-startHour)*2},(_,i)=>`<button class="planner-slot" style="top:${i*36}px" data-a="planner-new" data-d="${k}" data-minute="${from+i*30}" aria-label="${esc(t('plannerAddAt',pad(Math.floor((from+i*30)/60))+':'+pad((from+i*30)%60)))}"></button>`).join('')}${!events.length&&!items[index].length&&days.length===1?`<div class="planner-empty" style="top:${Math.max(72,(9-startHour)*72)}px"><span>${IC.cal}</span><b>${esc(t('plannerEmptyTitle'))}</b><p>${esc(t('plannerEmptyHint'))}</p><button class="link" data-a="planner-new">${IC.plus}${esc(t('plannerFirst'))}</button></div>`:''}${events.map(e=>`<article class="planner-event kind-${e.category}${e.complete?' complete':''}${e.lanes>2?' compact-event':''}" style="--event-top:${(e.from-from)*1.2}px;--event-height:${Math.max(43,(e.to-e.from)*1.2-4)}px;--event-lane:${e.lane};--event-lanes:${e.lanes}"><button class="planner-event-main" data-a="planner-edit" data-id="${esc(e.id)}" data-d="${e.occurrenceDay||k}" aria-label="${esc(e.title+' · '+plannerTime(e.start)+'–'+plannerTime(e.end))}"><b>${esc(e.title)}</b><small>${plannerTime(e.start)} – ${plannerTime(e.end)}${e.source?' · '+esc(t('plannerCalendarShort')):''}</small>${e.note&&e.to-e.from>=70?`<span>${esc(e.note)}</span>`:''}</button>${days.length===1&&e.lanes<3?`<button class="planner-done" data-a="planner-done" data-id="${esc(e.id)}" data-d="${e.occurrenceDay||k}" aria-pressed="${e.complete}" aria-label="${esc(t(e.complete?'plannerMarkUndone':'plannerMarkDone')+': '+e.title)}">${e.complete?IC.check:'<span></span>'}</button>`:''}</article>`).join('')}${k===today()&&minute>=from&&minute<=from+span?`<div class="planner-now" style="top:${(minute-from)*1.2}px" aria-label="${esc(t('plannerNow'))}"><i></i></div>`:''}</div>`;
    }).join('')}</div></div></div>`;
    h+=`<div class="planner-quick"><span>${esc(t('plannerQuickAdd'))}</span>${['gym','swim','focus'].map(kind=>`<button class="chip" data-a="planner-new" data-kind="${kind}">${plannerIcon(kind)}${esc(t('plannerKind_'+kind))}</button>`).join('')}</div>${ui.calendarStatus?`<p class="planner-status" role="status">${esc(t(ui.calendarStatus))}</p>`:''}</section>`;
    return h;
  }
  function shPlannerEvent(){
    const fn=()=>{const e=ui.plannerDraft,imported=!!e.source;
      const form=`<form id="planner-event-form" data-f="planner-event"><label class="fld"><span>${esc(t('plannerActivity'))}</span><input name="title" maxlength="100" required value="${esc(e.title)}" placeholder="${esc(t('plannerTitleHint'))}"></label><label class="fld"><span>${esc(t('date'))}</span><input type="date" name="date" required value="${DailyPlanner.day(e.start)}"></label><label class="sw"><input type="checkbox" name="allDay" data-in="planner-all-day" role="switch" ${e.allDay?'checked':''}><span>${esc(t('plannerAllDay'))}</span></label><div class="planner-time-fields"><label class="fld"><span>${esc(t('plannerStart'))}</span><input type="time" name="start" required value="${plannerTime(e.start)}" ${e.allDay?'disabled':''}></label><label class="fld"><span>${esc(t('plannerEnd'))}</span><input type="time" name="end" required value="${plannerTime(e.end)}" ${e.allDay?'disabled':''}></label></div><div class="planner-time-fields"><label class="fld"><span>${esc(t('plannerCategory'))}</span><select name="category">${DailyPlanner.categories.map(k=>`<option value="${k}" ${e.category===k?'selected':''}>${esc(t('plannerKind_'+k))}</option>`).join('')}</select></label><label class="fld"><span>${esc(t('plannerRepeat'))}</span><select name="repeat">${['none','daily','weekdays','weekly'].map(k=>`<option value="${k}" ${e.repeat===k?'selected':''}>${esc(t('plannerRepeat_'+k))}</option>`).join('')}</select></label></div><label class="fld"><span>${esc(t('plannerNote'))}</span><input name="note" maxlength="500" value="${esc(e.note||'')}" placeholder="${esc(t('plannerNoteHint'))}"></label><p class="planner-form-error note warn" role="status" hidden></p></form>`;
      return {title:t(e.existing?'plannerEditActivity':'plannerNewActivity'),html:imported?`<div class="planner-import-detail"><span class="eyebrow">${esc(D().planner.sources.find(s=>s.id===e.source)?.name||t('plannerCalendarShort'))}</span><h3>${esc(e.title)}</h3><p>${esc(fmtDate(e.start,true))}</p><p>${e.allDay?esc(t('plannerAllDay')):plannerTime(e.start)+' – '+plannerTime(e.end)}</p>${e.note?`<p>${esc(e.note)}</p>`:''}<p class="cap">${esc(t('plannerImportedReadOnly'))}</p></div>`:form,foot:imported?`<button class="btn primary" data-a="planner-done" data-id="${esc(e.id)}" data-d="${ui.plannerEditDay}" data-close="1">${IC.check}${esc(t(e.done?.[ui.plannerEditDay]?.value?'plannerMarkUndone':'plannerMarkDone'))}</button>`:`<div class="planner-form-actions">${e.existing?`<button class="icon-btn danger" data-a="planner-delete" data-id="${esc(e.id)}" aria-label="${esc(t('delete'))}">${IC.del}</button>`:''}<button class="btn primary" form="planner-event-form">${esc(t('save'))}</button></div>`};
    };fn.kind='planner-event';return fn;
  }
  const calendarKey=()=> 'gymapp.v1.calendar.'+(CL?.user?.id||'local');
  function calendarLinks(){try{const v=JSON.parse(localStorage.getItem(calendarKey())||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch(_){return {};}}
  function saveCalendarLinks(v){try{localStorage.setItem(calendarKey(),JSON.stringify(v));return true;}catch(_){toast(t('saveFailed'));return false;}}
  function shPlannerCalendars(){const fn=()=>({title:t('plannerCalendars'),html:`<p class="planner-calendar-intro">${esc(t('plannerCalendarIntro'))}</p><label class="btn planner-import-file">${IC.upload}${esc(t('plannerImportFile'))}<input type="file" class="sr" data-in="planner-ics" accept=".ics,text/calendar"></label><p class="cap">${esc(t('plannerImportRange'))}</p>${D().planner.sources.length?`<div class="planner-sources">${D().planner.sources.map(s=>`<article><span class="planner-source-icon">${IC.cal}</span><div><b>${esc(s.name)}</b><small>${esc(t(s.kind==='feed'?'plannerSubscribed':'plannerFileSnapshot'))} · ${esc(fmtDate(s.syncedAt))}</small></div>${s.kind==='feed'?`<button class="icon-btn" data-a="planner-sync-one" data-id="${s.id}" aria-label="${esc(t('plannerSyncNow'))}" ${ui.calendarBusy?'disabled':''}>${IC.refresh}</button>`:''}<button class="icon-btn" data-a="planner-disconnect" data-id="${s.id}" aria-label="${esc(t('remove'))}">${IC.close}</button></article>`).join('')}</div>`:''}<details class="mini-section planner-feed-setup" open><summary>${esc(t('plannerSubscribe'))}${IC.down}</summary><div class="section-body"><p class="cap">${esc(t('plannerFeedHint'))}</p><form id="planner-calendar-form" data-f="planner-calendar"><label class="fld"><span>${esc(t('name'))}</span><input name="name" maxlength="80" value="${esc(ui.calendarDraft?.name||'')}" placeholder="${esc(t('plannerCalendarName'))}"></label><label class="fld"><span>${esc(t('plannerFeedUrl'))}</span><input type="text" inputmode="url" name="url" value="${esc(ui.calendarDraft?.url||'')}" required maxlength="2048" autocomplete="off" spellcheck="false" placeholder="webcal://…"></label><p class="cap">${esc(t('plannerLinkPrivacy'))}</p><p class="planner-calendar-error note warn" role="status" ${ui.calendarError?'':'hidden'}>${esc(t(ui.calendarError||''))}</p><button class="btn primary" ${ui.calendarBusy?'disabled':''}>${IC.refresh}${esc(t(ui.calendarBusy?'plannerSyncing':'plannerConnect'))}</button></form></div></details><details class="mini-section"><summary>${esc(t('plannerWhereCalendar'))}${IC.down}</summary><div class="section-body"><p><b>Apple / iCloud</b><br>${esc(t('plannerAppleHelp'))}</p><p><b>Google Calendar</b><br>${esc(t('plannerGoogleHelp'))}</p><p><b>Outlook</b><br>${esc(t('plannerOutlookHelp'))}</p><p><b>BME Neptun</b><br>${esc(t('plannerNeptunHelp'))}</p><p class="cap">${esc(t('plannerCalendarLimits'))}</p></div></details>`});fn.kind='planner-calendars';return fn;}
  function plannerCommit(next){const before=D().planner;D().planner=DailyPlanner.clean(next);if(!Store.save()){D().planner=before;return false;}return true;}
  async function syncCalendars(force=false,only=null){
    if(ui.calendarBusy||!force&&Date.now()-(ui.calendarAttempt||0)<15*60000)return;const links=calendarLinks(),owner=calendarKey();
    const sources=D().planner.sources.filter(s=>s.kind==='feed'&&(!only||s.id===only)&&(force||Date.now()-s.syncedAt>15*60000));
    if(!sources.length)return;
    if(!CL?.user){ui.calendarStatus='plannerCalendarSignIn';return;}
    ui.calendarAttempt=Date.now();
    ui.calendarBusy=true;ui.calendarStatus='plannerSyncing';if(topIs('planner-calendars'))refreshSheet();
    try{for(const s of sources){
      if(!links[s.id]){ui.calendarStatus='plannerReconnect';continue;}
      const result=await CL.calendarFeed(links[s.id]);if(calendarKey()!==owner)return;
      if(!D().planner.sources.some(x=>x.id===s.id))continue;
      const events=DailyPlanner.parseICS(result?.ics,s.id);if(!plannerCommit(DailyPlanner.replaceSource(D().planner,s,events)))return;ui.calendarStatus='plannerSynced';
    }}catch(e){ui.calendarStatus=e.code==='plannerCalendarSetup'?'plannerCalendarSetup':e.code?.startsWith('planner')?e.code:'plannerSyncFailed';}
    finally{ui.calendarBusy=false;if(calendarKey()===owner){if(topIs('planner-calendars'))refreshSheet();if(ui.tab==='goals'&&ui.goals==='planner')rerender();}}
  }
  async function connectCalendar(v){
    if(ui.calendarBusy)return;ui.calendarDraft={name:String(v.name||'').trim(),url:String(v.url||'').trim()};ui.calendarError='';
    const normalized=ui.calendarDraft.url.replace(/^webcal:/i,'https:');let url;try{url=new URL(normalized);if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')throw 0;}catch(_){ui.calendarError='plannerBadUrl';refreshSheet();return;}
    if(!CL?.user){ui.calendarError='plannerCalendarSignIn';refreshSheet();return;}
    if(D().planner.sources.length>=8){ui.calendarError='plannerCalendarLimit';refreshSheet();return;}
    const owner=calendarKey(),links=calendarLinks(),existing=D().planner.sources.find(s=>links[s.id]===url.href);
    const source={id:existing?.id||'pc_'+uid(),name:ui.calendarDraft.name||(url.hostname==='neptun.bme.hu'?'BME Neptun':t('plannerCalendarName')),kind:'feed'};
    ui.calendarBusy=true;refreshSheet();
    try{const result=await CL.calendarFeed(url.href);if(calendarKey()!==owner)return;
      const events=DailyPlanner.parseICS(result?.ics,source.id);
      if(!saveCalendarLinks({...links,[source.id]:url.href}))return;
      if(!plannerCommit(DailyPlanner.replaceSource(D().planner,source,events))){saveCalendarLinks(links);return;}
      ui.calendarDraft=null;ui.calendarStatus='plannerSynced';toast(t('plannerSynced'));if(topIs('planner-calendars'))closeSheet();rerender();
    }catch(e){if(calendarKey()===owner){ui.calendarError=e.code==='plannerCalendarSetup'?'plannerCalendarSetup':e.code?.startsWith('planner')?e.code:'plannerSyncFailed';}}
    finally{ui.calendarBusy=false;if(calendarKey()===owner&&topIs('planner-calendars'))refreshSheet();}
  }

  function vGoals() {
    const navigation=`<nav class="seg goals-tabs" aria-label="${esc(t('tabGoals'))}">${['planner','habits','progress'].map(v=>`<button data-a="goals-view" data-v="${v}" class="${ui.goals===v?'on':''}" aria-pressed="${ui.goals===v}">${esc(t(v==='planner'?'plannerSchedule':v==='habits'?'tabHabits':'tabProg'))}</button>`).join('')}</nav>`;
    if(ui.goals==='planner')return head(t('plannerTitle'))+navigation+vPlanner();
    const content=ui.goals==='progress'?vProg():vHabits();
    const end=content.indexOf('</header>')+9;
    return head(t('plannerTitle'))+navigation+(ui.goals==='habits'?weeklyChallenges():'')+content.slice(end);
  }
  function weeklyChallenges(){
    const week=Competition.week(D()),items=[['challengeTraining',week.days,3],['challengeSets',week.sets,10],['challengeMeals',week.meal_days,5]];
    return `<details class="card weekly-challenges" open><summary>${esc(t('weeklyChallenges'))}${IC.down}</summary><p class="cap">${esc(t('competitionReset'))}</p>${items.map(([key,value,target])=>`<div class="challenge-row"><div><b>${esc(t(key))}</b><span>${value>=target?IC.check:''}${Math.min(value,target)} / ${target}</span></div><progress aria-label="${esc(t(key))}" value="${Math.min(value,target)}" max="${target}"></progress></div>`).join('')}</details>`;
  }
  function socialCard(){
    const s=Social.state,data=s.data,connected=!!CL?.user,me=data?.profile;
    const controls=`<button class="icon-btn" data-a="social-refresh" aria-label="${esc(t('refreshFriends'))}" ${s.busy?'disabled':''}>${IC.refresh}</button>`;
    if(!connected)return `<section class="card friends-empty-card"><h2>${esc(t('friends'))}</h2><p class="cap">${esc(t('socialSignIn'))}</p></section>`;
    if(!me)return `<section class="card social-card"><div class="h2row"><h2>${esc(t('friends'))}</h2>${controls}</div><p class="cap" role="status">${esc(t(s.error|| (s.busy?'socialLoading':'socialNeedProfile')))}</p>${!s.busy?`<button class="btn" data-a="profile-edit">${esc(t('editProfile'))}</button>`:''}</section>`;
    const points=s.competitionReady?me.stats:Competition.week(D()),rank=Competition.rank(points?.score||0),next=Competition.tiers.find(r=>r.min>(points?.score||0));
    const rows=(data.leaderboard||[]).slice().sort((a,b)=>b.score-a.score||a.username.localeCompare(b.username)),friends=data.friends||[],incoming=data.incoming||[],outgoing=data.outgoing||[];
    const board=s.competitionReady?`<ol class="leaderboard clean-board">${rows.map((r,i)=>{const p=Profile.clean({username:r.username,displayName:r.display_name,avatar:r.avatar,theme:r.theme}),place=i&&+rows[i-1].score===+r.score?rows.findIndex(x=>+x.score===+r.score)+1:i+1;return `<li class="${r.user_id===CL.user.id?'you':''}"><span class="board-place">${place}</span><button class="board-person" data-a="friend-profile" data-id="${esc(r.user_id)}">${avatar(p,true)}<span><b>${esc(p.displayName||p.username)}${r.user_id===CL.user.id?' · '+esc(t('you')):''}</b><small>${esc(Competition.rank(r.score)[L()])}</small></span></button><strong>${compact(r.score)}<small>${esc(t('points'))}</small></strong></li>`;}).join('')}</ol>`:`<p class="cap">${esc(t('competitionSetup'))}</p>`;
    let h=`<section class="card weekly-card"><div class="h2row"><div><small class="eyebrow">${esc(t('thisWeekShort'))}</small><h2>${esc(rank[L()])}</h2></div>${controls}</div>${s.error?`<p class="note warn" role="status">${esc(t(s.error))}</p>`:''}<div class="weekly-total"><b>${compact(points?.score||0)}</b><span>${esc(t('points'))}</span></div><div class="weekly-progress" role="progressbar" aria-label="${esc(t('weeklyRank'))}" aria-valuemin="0" aria-valuemax="${next?.min||1200}" aria-valuenow="${Math.min(points?.score||0,next?.min||1200)}"><i style="width:${Math.min(100,(points?.score||0)/(next?.min||1200)*100)}%"></i></div><p class="weekly-next">${next?`${compact(next.min-(points?.score||0))} ${esc(t('pointsTo'))} ${esc(next[L()])}`:esc(t('weeklyTopRank'))}</p><div class="weekly-breakdown"><div>${IC.home}<span>${esc(t('workout'))}<b>${compact(points?.workout_points||0)}</b></span></div><div>${IC.food}<span>${esc(t('tabFood'))}<b>${compact(points?.meal_points||0)}</b></span></div></div>${miniSection('friends-week',t('weeklyCompetition'),board)}<details class="competition-method"><summary>${esc(t('howPointsWork'))}</summary><ul class="point-rules"><li>${esc(t('pointAttendance'))}</li><li>${esc(t('pointSets'))}</li><li>${esc(t('pointMeals'))}</li></ul><p class="cap">${esc(t('pointsPrivacy'))}</p></details></section>`;
    h+=feedBlock();
    h+=`<section class="card social-card friend-people"><div class="h2row"><div><h2>${esc(t('friends'))} <small>${friends.length}</small></h2><span class="friend-own-handle">@${esc(me.username)}</span></div><button class="btn sm" data-a="friend-search-open">${IC.plus}<span>${esc(t('add'))}</span></button></div><div class="friend-connections">${friends.length?friends.map(r=>{const info=rows.find(x=>x.user_id===r.user_id)||r,p=Profile.clean({username:r.username,displayName:info.display_name,avatar:info.avatar,theme:info.theme});return `<div class="friend-connection"><button class="board-person" data-a="friend-profile" data-id="${esc(r.user_id)}">${avatar(p,true)}<span><b>${esc(p.displayName||p.username)}</b><small>@${esc(r.username)}</small></span>${IC.chev}</button><button class="icon-btn" data-a="friend-options" data-id="${esc(r.user_id)}" aria-label="${esc(t('friendOptions'))}: @${esc(r.username)}">${IC.more}</button></div>`;}).join(''):`<div class="friend-empty"><span aria-hidden="true">${IC.profile}${IC.plus}${IC.profile}</span><p>${esc(t('friendsStart'))}</p><button class="btn" data-a="friend-search-open">${esc(t('findFriend'))}</button></div>`}</div><button class="link friend-discovery-link" data-a="friend-discovery">${esc(t('contactDiscovery'))}${IC.chev}</button></section>`;
    if(incoming.length||outgoing.length)h+=`<section class="card social-card request-card"><h2>${esc(t('friendRequests'))} <small>${incoming.length+outgoing.length}</small></h2>${incoming.map(r=>`<div class="friend-request"><button class="link" data-a="friend-profile" data-id="${esc(r.user_id)}">@${esc(r.username)}</button><div><button class="btn sm" data-a="friend-respond" data-id="${esc(r.request_id)}" data-accept="true" ${ui.friendBusy?'disabled':''}>${esc(t('acceptFriend'))}</button><button class="icon-btn" data-a="friend-respond" data-id="${esc(r.request_id)}" data-accept="false" aria-label="${esc(t('declineFriend'))}" ${ui.friendBusy?'disabled':''}>${IC.close}</button></div></div>`).join('')}${outgoing.length?`<details class="friend-list"><summary>${esc(t('sentRequests'))} (${outgoing.length})${IC.down}</summary>${outgoing.map(r=>`<div class="friend-request"><span>@${esc(r.username)}</span><button class="link" data-a="friend-remove" data-id="${esc(r.user_id)}">${esc(t('cancelRequest'))}</button></div>`).join('')}</details>`:''}</section>`;
    return h;
  }
  function shFriendSearch(){const fn=()=>{const kind=ui.friendKind||'username';return {title:t('findFriend'),html:`<div class="social-card search-sheet"><form class="friend-search" data-f="friend-add"><div class="friend-search-heading"><label for="friend-identifier">${esc(t('findFriend'))}</label><select name="kind" data-in="friend-kind" aria-label="${esc(t('findBy'))}">${['username','email','phone'].map(k=>`<option value="${k}" ${kind===k?'selected':''}>${esc(t(k==='username'?'username':k==='email'?'email':'phoneNumber'))}</option>`).join('')}</select></div><div class="friend-search-row"><input id="friend-identifier" name="identifier" data-in="friend-identifier" type="${kind==='email'?'email':kind==='phone'?'tel':'text'}" value="${esc(ui.friendValue||'')}" placeholder="${esc(t(kind==='email'?'friendEmail':kind==='phone'?'friendPhone':'friendUsername'))}" maxlength="254" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="friend-search-hint${ui.friendError?' friend-search-error':''}" ${ui.friendError?'aria-invalid="true"':''} required><button class="btn primary" ${ui.friendBusy?'disabled':''}>${IC.plus}<span>${esc(t('addFriend'))}</span></button></div><p class="cap" id="friend-search-hint">${esc(t(kind==='username'?'friendUsernameHint':'friendContactHint'))}</p>${ui.friendError?`<p id="friend-search-error" class="friend-feedback error" role="alert">${esc(t(ui.friendError))}</p>`:''}${ui.friendNotice?`<p class="friend-feedback" role="status">${esc(t(ui.friendNotice))}</p>`:''}</form></div>`};};fn.kind='friend-search';return fn;}
  function vProfile() {
    const page=ui.profilePage||'overview';
    const navigation=head(t('tabProfile'))+`<nav class="seg profile-tabs" aria-label="${esc(t('tabProfile'))}">${['overview','ranks','friends'].map(v=>`<button data-a="profile-view" data-v="${v}" class="${page===v?'on':''}" aria-pressed="${page===v}">${esc(t(v==='friends'?'friends':v==='ranks'?'yourRanks':'profileOverview'))}</button>`).join('')}</nav>`;
    if(page==='friends')return navigation+storyTray()+socialCard();
    if(page==='ranks')return navigation+vRanks();
    const p=profileLocal(),stats=Profile.summary(D().workouts,Date.now(),D().food),top=topRank(),rank=top<0?t('rankUnranked'):StrengthRanks.tiers[top][L()];
    const td=today(),list=D().food[td]||[],sum=list.reduce((a,f)=>({kcal:a.kcal+f.kcal,p:a.p+f.p,c:a.c+f.c,f:a.f+f.f}),{kcal:0,p:0,c:0,f:0});
    const base=dayTargets(td),goal=base?energyBudget(td,sum.kcal,base.kcal).total:0;
    const display=stats.badges.filter(b=>b.earned&&p.showcase.includes(b.id)).sort((a,b)=>p.showcase.indexOf(a.id)-p.showcase.indexOf(b.id));
    const claimed=Social.state.data&&Social.state.data.profile&&Social.state.data.profile.username===p.username;
    let h=navigation+`<section class="profile-cover theme-${p.theme} ${styleClasses(profileStyle())}"${colorStyle(p,profileStyle())}>${coverPhoto(p,profileStyle())}<div class="profile-identity">${CL?.user&&Stories.ownGroup()?`<button class="story-ring cover-ring${Stories.groupSeen(Stories.ownGroup())?' seen':''}" data-a="story-own" aria-label="${esc(t('viewYourStory'))}">${avatar(p,false,false)}</button>`:avatar(p,false,true)}<div><h2>${esc(p.displayName||p.username||t('profileWelcome'))}</h2><p>${p.username?'@'+esc(p.username):esc(t('profileUsernameHint'))}</p>${p.username&&CL&&!claimed?`<small class="username-status">${esc(t('usernameUnclaimed'))}</small>`:''}</div><button class="icon-btn" data-a="profile-edit" aria-label="${esc(t('editProfile'))}">${IC.pen}</button></div>${p.bio?`<p class="profile-bio">${esc(p.bio)}</p>`:''}<button class="profile-rank" data-a="profile-ranks">${rankBadge(top)}<span><small>${esc(t('highestRank'))}</small><b>${esc(rank)}</b></span>${IC.chev}</button><div class="profile-showcase">${display.length?display.map(b=>badgeChip(b,false)).join(''):`<button class="link" data-a="profile-badges">${IC.plus}${esc(t('chooseBadges'))}</button>`}</div></section>`;
    if(socialReady())h+=mediaBlock(me(),true);
    h+=`<section class="card profile-nutrition"><div class="h2row"><div><small class="eyebrow">${esc(t('today'))}</small><h2>${esc(t('dailyFuel'))}</h2></div><button class="link" data-a="profile-food">${esc(t('diary'))}${IC.chev}</button></div>${calorieClock(sum.kcal,goal)}${energyBudgetPanel(td,sum.kcal,base&&base.kcal)}<div class="profile-macros">${['p','c','f'].map((k,i)=>`<div><small>${esc(t(['protein','carbs','fat'][i]))}</small><b><span class="macro-value">${dec(r1(sum[k]))}</span><span class="macro-unit">g</span></b><i><span style="width:${base&&base[k]>0?Math.min(100,sum[k]/base[k]*100):0}%"></span></i></div>`).join('')}</div></section>`;
    h+=`<div class="profile-stats"><div><b>${stats.workouts}</b><small>${esc(t('loggedSessions'))}</small></div><div><b>${stats.days}</b><small>${esc(t('trainingDays'))}</small></div><div><b>${stats.volume>=1000?dec(r1(stats.volume/1000)):compact(stats.volume)} <span>${stats.volume>=1000?'t':'kg'}</span></b><small>${esc(t('lifetimeVolume'))}</small></div></div><section class="card">${miniSection('profile-achievements',t('achievements'),`<button class="link achievement-pick" data-a="profile-badges">${esc(t('chooseBadges'))}</button><div class="achievement-grid">${stats.badges.map(b=>badgeChip(b,true)).join('')}</div>`)}</section>`;
    if(CL?.user)h+=`<section class="card profile-community"><h2>${esc(t('community'))}</h2>${activityView(Social.state.activity,CL?.user?.id,true)}</section>`;
    return h;
  }
  function activityView(a,target,own=false){
    if(!a)return `<p class="cap">${esc(t(own?(Social.state.busy?'socialLoading':Social.state.activityError||'socialNeedProfile'):'profilePrivate'))}</p>`;
    const reviews=a.reviews||[],saved=reviews.find(r=>r.author===CL?.user?.id),average=reviews.length?reviews.reduce((n,r)=>n+(+r.rating||0),0)/reviews.length:0;
    const reviewCards=reviews.map(r=>`<article class="profile-review"><div class="review-person"><span class="review-avatar" aria-hidden="true">${esc((r.username||'?')[0].toUpperCase())}</span><b>@${esc(r.username)}</b><span class="review-stars" aria-label="${r.rating}/5">${'★'.repeat(Math.max(1,Math.min(5,+r.rating||1)))}</span></div><p>${esc(r.body)}</p>${own||r.author===CL?.user?.id?`<div class="review-controls">${!own&&r.author===CL?.user?.id?`<button class="icon-btn" data-a="review-open" data-id="${esc(target)}" aria-label="${esc(t('editReview'))}">${IC.pen}</button>`:''}<button class="icon-btn" data-a="review-remove" data-id="${esc(r.id)}" aria-label="${esc(t('removeReview'))}">${IC.del}</button></div>`:''}</article>`).join('');
    return `<div class="profile-social-actions">${own?`<span class="like-total">${likeIcon()}${compact(a.likes||0)} ${esc(t('photoLikes'))}</span>`:`<button class="btn sm like-pill${a.liked?' on':''}" data-a="photo-like" data-id="${esc(target)}" aria-pressed="${!!a.liked}" ${ui.communityBusy||!ui.friendProfile?.avatar?'disabled':''}>${likeIcon()}<span class="photo-like-count">${compact(a.likes||0)}</span><span class="like-label">${esc(t(a.liked?'unlikePhoto':'likePhoto'))}</span></button>`}</div>${miniSection('reviews-'+target,t('profileReviews')+' ('+reviews.length+')',`<div class="review-summary"><div>${reviews.length?`<b>${dec(r1(average))}<small> / 5</small></b><span class="review-stars" aria-hidden="true">${'★'.repeat(Math.round(average))}</span>`:`<p class="cap">${esc(t('noReviews'))}</p>`}</div>${!own?`<button class="icon-btn review-add" data-a="review-open" data-id="${esc(target)}" aria-label="${esc(t(saved?'editReview':'addReview'))}">${IC.pen}${IC.plus}</button>`:''}</div>${reviewCards}`)}<details class="mini-section" open><summary>${esc(t('sharedRoutines'))} (${(a.routines||[]).length})${IC.down}</summary><div class="section-body">${(a.routines||[]).map(r=>`<article class="shared-routine"><h3>${esc(r.snapshot.routine.name)}</h3><small>${r.snapshot.routine.items.length} ${esc(pl(r.snapshot.routine.items.length,'exercises'))}</small><details><summary>${esc(t('exercises'))}</summary><ol>${r.snapshot.routine.items.map(i=>`<li>${esc(r.snapshot.myEx.find(e=>e.id===i.ex)?.n||exName(i.ex))}<small>${i.sets} × ${esc(i.reps)}</small></li>`).join('')}</ol></details>${!own?`<button class="btn" data-a="routine-copy" data-id="${esc(r.id)}" ${ui.communityBusy?'disabled':''}>${esc(t('copyRoutine'))}</button>`:''}</article>`).join('')||`<p class="cap">${esc(t('noSharedRoutines'))}</p>`}${own?`<button class="btn" data-a="manage-sharing">${esc(t('manageSharing'))}</button>`:''}</div></details>`;
  }
  function shReviewEditor(){const fn=()=>{const d=ui.reviewDraft||{},target=d.target;return {title:t(d.edit?'editReview':'addReview'),html:`<form id="review-editor" data-f="profile-review" class="review-editor" data-id="${esc(target)}"><p class="review-recipient">@${esc(ui.friendProfile?.username||'')}</p><fieldset class="star-rating"><legend>${esc(t('rating'))}</legend><input type="hidden" name="rating" value="${d.rating||5}"><div role="group" aria-label="${esc(t('rating'))}">${[1,2,3,4,5].map(n=>`<button type="button" data-a="review-rating" data-v="${n}" aria-label="${n} / 5" aria-pressed="${d.rating===n}" class="${n<=(d.rating||5)?'selected':''}" ${ui.communityBusy?'disabled':''}>★</button>`).join('')}</div></fieldset><label class="fld"><span>${esc(t('writeReview'))}</span><textarea name="body" data-in="review-text" rows="4" maxlength="280" required placeholder="${esc(t('reviewPlaceholder'))}" ${ui.communityBusy?'disabled':''}>${esc(d.body||'')}</textarea></label><div class="review-meta"><span data-review-count>${(d.body||'').length} / 280</span></div>${ui.reviewError?`<p class="note warn" role="status">${esc(t(ui.reviewError))}</p>`:''}</form>`,foot:`<button class="btn primary" form="review-editor" ${ui.communityBusy?'disabled':''}>${esc(t(ui.communityBusy?'savingProfile':d.edit?'save':'postReview'))}</button>`};};fn.kind='review-editor';return fn;}

  function shSharing(){const fn=()=>({title:t('manageSharing'),html:`<p class="cap">${esc(t('sharePrivacy'))}</p>${D().routines.map(r=>{const shared=Social.state.activity?.routines?.find(x=>x.source_id===r.id),current=RoutineShare.pack(r,D(),L()),changed=shared&&!RoutineShare.matches(current,shared.snapshot,L());return `<article class="sharing-row" data-source="${esc(r.id)}"><div class="sharing-heading"><h3>${esc(rName(r))}</h3><small class="sharing-state ${changed?'changed':''}">${esc(t(shared?changed?'shareChanges':'sharedCurrent':'routinePrivate'))}</small></div><p class="cap">${r.items.length} ${esc(pl(r.items.length,'exercises'))}${shared?' · '+esc(shared.snapshot.routine.name):''}</p>${ui.sharingNotice?.id===r.id?`<p class="sharing-notice" role="status">${IC.check}${esc(t(ui.sharingNotice.key))}</p>`:''}<div class="sharing-actions">${shared?`<button class="btn sm" data-a="routine-unshare" data-id="${esc(shared.id)}" ${ui.communityBusy?'disabled':''}>${esc(t('unshare'))}</button>`:''}<button class="btn sm ${shared?'':'primary'}" data-a="routine-share" data-id="${esc(r.id)}" ${ui.communityBusy||!r.items.length?'disabled':''}>${shared?IC.refresh:IC.plus}${esc(t(shared?'updateShared':'shareRoutine'))}</button></div></article>`;}).join('')||`<p class="cap">${esc(t('noRoutinesYet'))}</p>`}`});fn.kind='sharing';return fn;}

  function shFriend(){const fn=()=>{const r=ui.friendProfile,p=Profile.clean({username:r.username,displayName:r.display_name,bio:r.bio,avatar:r.avatar,coverPhoto:r.cover_photo,theme:r.theme,showcase:r.badges}),stats=r.stats||{},earned=Profile.badges.filter(b=>(stats.badges||[]).includes(b.id)&&p.showcase.includes(b.id)).map(b=>({...b,earned:true}));return {title:'@'+p.username,html:`<section class="profile-cover theme-${p.theme} cover-${esc(r.cover_style||'glow')}"${colorStyle(p)}>${coverPhoto(p,{cover:r.cover_style})}<div class="profile-identity">${Stories.state.media[r.user_id]?.stories?.length?`<button class="story-ring cover-ring${Stories.groupSeen({items:Stories.state.media[r.user_id].stories})?' seen':''}" data-a="story-user" data-id="${esc(r.user_id)}" aria-label="${esc(t('storyOf',p.displayName||p.username))}">${avatar(p,false,false)}</button>`:avatar(p,false,true)}<div><h2>${esc(p.displayName||p.username)}</h2><p>@${esc(p.username)}</p></div></div><p class="profile-bio">${esc(p.bio)}</p><div class="profile-showcase">${earned.map(b=>badgeChip(b,false)).join('')}</div></section><div class="profile-stats friend-profile-stats"><div><b>${compact(stats.score||0)}</b><small>${esc(t('weeklyPoints'))}</small></div><div><b>${stats.days||0}</b><small>${esc(t('trainingDays'))}</small></div><div><b>${esc(stats.highest>=0?StrengthRanks.tiers[stats.highest+(Social.state.competitionReady?0:3)]?.[L()]||t('rankUnranked'):t('rankUnranked'))}</b><small>${esc(t('highestRank'))}</small></div></div>${mediaBlock(r.user_id,r.user_id===CL?.user?.id)}${ui.friendActivityError?`<p class="cap">${esc(t(ui.friendActivityError))}</p>`:activityView(ui.friendActivity,r.user_id,r.user_id===CL?.user?.id)}`};};fn.kind='friend-profile';return fn;}

  /* ================= STORIES, POSTS AND HIGHLIGHTS (2.28) ================= */
  const me = () => CL?.user?.id || '';
  const likeIcon = () => `<span class="like-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${Stories.HEART}"/></svg><span class="like-ring"></span><span class="like-burst">${'<i></i>'.repeat(8)}</span></span>`;
  const storyFace = u => { const name=(u&&(u.display_name||u.displayName||u.username))||'?',pic=u&&u.avatar; return `<span class="story-face">${pic?`<img src="${esc(pic)}" alt="" draggable="false">`:esc(name.slice(0,1).toUpperCase())}</span>`; };
  const personName = u => (u&&(u.display_name||u.displayName||u.username))||'';
  function authorOf(uid){
    if(uid&&uid===me()){const p=profileLocal();return {user_id:uid,username:p.username||Social.state.data?.profile?.username||'',display_name:p.displayName||Social.state.data?.profile?.display_name||'',avatar:p.avatar,theme:p.theme};}
    return Stories.state.authors[uid]||Stories.state.media[uid]?.user||(Stories.state.feed||[]).find(g=>g.user?.user_id===uid)?.user||{user_id:uid,username:'',display_name:''};
  }
  // Cards and bubbles play their entrance animation only the first time they appear, not on every redraw.
  const shown=new Set(),enter=key=>{if(shown.has(key))return '';shown.add(key);return ' enter';};
  const socialReady = () => !!(CL?.user&&Social.state.data?.profile);
  function storyTray(){
    if(!socialReady())return '';
    const s=Stories.state,own=Stories.ownGroup(),others=(s.feed||[]).filter(g=>g.user&&g.user.user_id!==me());
    const ownBubble=`<div class="story-bubble own${enter('b:own')}${own?' has':''}${own&&Stories.groupSeen(own)?' seen':''}"><button class="story-ring" data-a="story-own" aria-label="${esc(t(own?'viewYourStory':'addStory'))}">${storyFace(authorOf(me()))}</button><button class="story-add" data-a="compose" data-v="story" aria-label="${esc(t('addStory'))}">${IC.plus}</button><span class="story-name">${esc(t('yourStoryShort'))}</span></div>`;
    const bubbles=others.map(g=>`<div class="story-bubble has${enter('b:'+g.user.user_id)}${Stories.groupSeen(g)?' seen':''}"><button class="story-ring" data-a="story-open" data-id="${esc(g.user.user_id)}" aria-label="${esc(t('storyOf',personName(g.user)))}">${storyFace(g.user)}</button><span class="story-name">${esc(personName(g.user))}</span></div>`).join('');
    const loading=s.feed===null&&!s.error?'<div class="story-bubble ghost" aria-hidden="true"><span class="story-ring"></span><span class="story-name"></span></div>'.repeat(3):'';
    return `<section class="story-tray" aria-label="${esc(t('storiesTitle'))}"><div class="story-row">${ownBubble}${bubbles}${loading}</div>${s.error?`<p class="cap story-error" role="status">${esc(t(s.error))}</p>`:''}</section>`;
  }
  function postCard(p){
    const a=authorOf(p.owner),name=personName(a),full=Stories.imageOf(p.id);
    return `<article class="post-card${enter('c:'+p.id)}" data-post="${esc(p.id)}"><header class="post-head"><button class="post-author" data-a="user-open" data-id="${esc(p.owner)}">${storyFace(a)}<span><b>${esc(name)}</b><small>${a.username?'@'+esc(a.username)+' · ':''}${esc(Stories.ago(p.created_at))}</small></span></button>${p.owner===me()?`<button class="icon-btn" data-a="post-open" data-id="${esc(p.id)}" aria-label="${esc(t('moreOptions'))}">${IC.more}</button>`:''}</header><figure class="post-media" data-like-target="${esc(p.id)}"><img src="${esc(full||p.thumb||'')}" ${full?'':`data-full="${esc(p.id)}"`} alt="${esc(p.caption||t('photoOf',name))}" draggable="false" loading="lazy"></figure><div class="post-actions">${Stories.likeHTML(p)}</div>${p.caption?`<p class="post-caption"><b>${esc(name)}</b> ${esc(p.caption)}</p>`:''}</article>`;
  }
  function feedBlock(){
    if(!socialReady())return '';
    const s=Stories.state,posts=s.posts;
    const header=`<div class="h2row feed-head"><h2>${esc(t('feedTitle'))}</h2><button class="btn sm" data-a="compose" data-v="post">${IC.cam}<span>${esc(t('newPost'))}</span></button></div>`;
    if(posts===null)return header+(s.error?'':`<div class="post-card ghost" aria-hidden="true"><div class="post-media"></div></div>`);
    if(!posts.length)return header+`<section class="card feed-empty">${IC.cam}<p>${esc(t('feedEmpty'))}</p><button class="btn primary" data-a="compose" data-v="post">${esc(t('shareFirstPhoto'))}</button></section>`;
    return header+`<div class="feed">${posts.map(postCard).join('')}</div>${s.more?`<button class="btn feed-more" data-a="feed-more" ${s.busy?'disabled':''}>${esc(t(s.busy?'socialLoading':'showMore'))}</button>`:''}`;
  }
  const mediaLoading=new Set(),mediaError={};
  function ensureMedia(uid){
    if(!uid||mediaLoading.has(uid)||Stories.state.media[uid]||mediaError[uid])return;
    const owner=me();mediaLoading.add(uid);
    Stories.user(uid).then(()=>{delete mediaError[uid];}).catch(e=>{mediaError[uid]=Stories.message(e);}).finally(()=>{mediaLoading.delete(uid);if(me()!==owner)return;mediaChanged();});
  }
  function mediaChanged(){
    if(ui.tab==='profile'&&!Stories.isOpen())rerender();
    if(topIs('friend-profile')||topIs('user-media')||topIs('post'))refreshSheet();
  }
  function highlightRow(uid,m,own){
    const list=(m.highlights||[]).map(h=>`<div class="story-bubble hl${enter('h:'+h.id)}"><button class="story-ring" data-a="highlight-open" data-u="${esc(uid)}" data-id="${esc(h.id)}" aria-label="${esc(t('highlightOf',h.name))}"><span class="story-face">${h.cover?`<img src="${esc(h.cover)}" alt="" draggable="false">`:IC.plus}</span></button><span class="story-name">${esc(h.name)}</span></div>`).join('');
    const add=own?`<div class="story-bubble hl new"><button class="story-ring" data-a="highlight-new" aria-label="${esc(t('newHighlight'))}"><span class="story-face">${IC.plus}</span></button><span class="story-name">${esc(t('newHighlightShort'))}</span></div>`:'';
    return list||add?`<div class="highlight-row story-row" aria-label="${esc(t('highlights'))}">${add}${list}</div>`:'';
  }
  function mediaBlock(uid,own){
    if(!CL?.user||!uid)return '';
    const m=Stories.state.media[uid];
    if(!m){ensureMedia(uid);return mediaError[uid]?`<p class="cap media-error">${esc(t(mediaError[uid]))}</p>`:`<div class="media-block loading" aria-busy="true"><div class="highlight-row story-row">${'<div class="story-bubble ghost"><span class="story-ring"></span><span class="story-name"></span></div>'.repeat(3)}</div><div class="post-grid">${'<span class="post-tile ghost"></span>'.repeat(3)}</div></div>`;}
    const posts=m.posts||[];
    const grid=posts.length?`<div class="post-grid">${posts.map(p=>`<button class="post-tile${enter('t:'+p.id)}" data-a="post-open" data-id="${esc(p.id)}" aria-label="${esc(p.caption||t('photoPost'))}"><img src="${esc(p.thumb||'')}" alt="" loading="lazy" draggable="false">${p.likes?`<span class="post-tile-likes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${Stories.HEART}"/></svg>${compact(p.likes)}</span>`:''}${own&&p.audience&&p.audience!=='everyone'?`<span class="post-tile-aud" title="${esc(t('audience_'+p.audience))}">${IC.lock}</span>`:''}</button>`).join('')}</div>`:`<div class="posts-empty">${IC.cam}<p>${esc(t(own?'postsEmptyOwn':'postsEmpty'))}</p>${own?`<button class="btn sm primary" data-a="compose" data-v="post">${esc(t('shareFirstPhoto'))}</button>`:''}</div>`;
    return `<section class="media-block">${highlightRow(uid,m,own)}<div class="h2row posts-head"><h2>${esc(t('postsTitle'))} <small>${compact(m.post_count||0)}</small></h2>${own&&posts.length?`<button class="btn sm" data-a="compose" data-v="post">${IC.plus}<span>${esc(t('newPost'))}</span></button>`:''}</div>${grid}</section>`;
  }
  // Full-size pictures are fetched only for the post cards that come into view.
  let imageWatch=null;
  function postImages(root){
    const imgs=$$('img[data-full]',root);if(!imgs.length||!CL?.user)return;
    const load=list=>{const ids=list.map(i=>i.dataset.full);list.forEach(i=>i.removeAttribute('data-full'));Stories.fetchImages(ids).then(srcs=>srcs.forEach((src,k)=>{if(src){const im=new Image();im.onload=()=>{list[k].src=src;list[k].classList.add('sharp');};im.src=src;}})).catch(()=>{});};
    if(!('IntersectionObserver' in window)){load(imgs);return;}
    if(!imageWatch)imageWatch=new IntersectionObserver(entries=>{const hits=entries.filter(e=>e.isIntersecting).map(e=>e.target);hits.forEach(h=>imageWatch.unobserve(h));if(hits.length)load(hits.filter(h=>h.dataset.full));},{rootMargin:'300px 0px'});
    imgs.forEach(i=>imageWatch.observe(i));
  }
  function likeButtons(id){
    const item=Stories.find(id);if(!item)return;
    $$('[data-a=post-like][data-id="'+CSS.escape(id)+'"]').forEach(b=>{b.classList.toggle('on',!!item.liked);b.setAttribute('aria-pressed',!!item.liked);const c=b.querySelector('.like-count');if(c&&!c.querySelector('.like-roll'))c.textContent=item.likes?compact(item.likes):'';});
  }
  async function likePost(id,on,btn){
    const item=Stories.find(id);if(!item||ui.likeBusy?.[id])return false;
    if(on==null)on=!item.liked;if(!!item.liked===on)return true;
    ui.likeBusy={...(ui.likeBusy||{}),[id]:true};
    const view={liked:on,likes:Math.max(0,(+item.likes||0)+(on?1:-1))};
    $$('[data-a=post-like][data-id="'+CSS.escape(id)+'"]').forEach(b=>Stories.pop(b,view));
    try{await Stories.like(id,on);return true;}catch(e){return false;}
    finally{delete ui.likeBusy[id];likeButtons(id);}
  }
  function openStories(groups,g,origin,opts){Stories.open(groups,g,0,origin,{unseen:true,...opts});}
  function shCompose(){const fn=()=>{const c=ui.compose,story=c.kind==='story';return {title:t(story?'newStory':'newPost'),html:`<div class="compose ${story?'is-story':'is-post'}"><nav class="seg compose-kind" aria-label="${esc(t('postType'))}">${['story','post'].map(k=>`<button type="button" data-a="compose-kind" data-v="${k}" class="${c.kind===k?'on':''}" aria-pressed="${c.kind===k}" ${c.busy?'disabled':''}>${esc(t(k==='story'?'storyWord':'postWord'))}</button>`).join('')}</nav>
      <label class="compose-pick${c.image?' has':''}${c.reading?' reading':''}">${c.image?`<img src="${esc(c.image)}" alt="${esc(t('photoPreview'))}" draggable="false"><span class="compose-change">${IC.cam}${esc(t('changePhoto'))}</span>`:`<span class="compose-empty">${IC.cam}<b>${esc(t(c.reading?'photoReading':'choosePhoto'))}</b><small>${esc(t('choosePhotoHint'))}</small></span>`}<input class="sr" type="file" accept="image/*" data-in="compose-file" ${c.busy?'disabled':''}></label>
      <label class="fld"><span>${esc(t('caption'))}</span><textarea data-in="compose-caption" maxlength="300" rows="2" placeholder="${esc(t(story?'storyCaptionHint':'postCaptionHint'))}" ${c.busy?'disabled':''}>${esc(c.caption)}</textarea><small class="compose-count" data-compose-count>${c.caption.length} / 300</small></label>
      <p class="lbl">${esc(t('whoCanSee'))}</p><div class="seg audience-seg">${Stories.AUDIENCES.map(a=>`<button type="button" data-a="compose-audience" data-v="${a}" class="${c.audience===a?'on':''}" aria-pressed="${c.audience===a}" ${c.busy?'disabled':''}>${esc(t('audience_'+a))}</button>`).join('')}</div><p class="cap audience-hint">${esc(t('audienceHint_'+c.audience))}</p>
      ${story?`<p class="lbl">${esc(t('storyDuration'))}</p><div class="chips duration-chips" role="group" aria-label="${esc(t('storyDuration'))}">${Stories.DURATIONS.map(h=>`<button type="button" class="chip${c.hours===h?' on':''}" data-a="compose-hours" data-v="${h}" aria-pressed="${c.hours===h}" ${c.busy?'disabled':''}>${esc(Stories.hoursLabel(h))}</button>`).join('')}</div><p class="cap">${esc(t('storyDurationHint'))}</p>`:''}
      ${c.error?`<p class="note warn" role="status">${esc(t(c.error))}</p>`:''}</div>`,foot:`<button class="btn primary" data-a="compose-share" ${!c.image||c.busy?'disabled':''}>${esc(t(c.busy?'sharing':story?'shareStory':'sharePost'))}</button>`};};fn.kind='compose';return fn;}
  function shPost(){const fn=()=>{
    const p=Stories.find(ui.postId);if(!p)return {title:t('photoPost'),html:`<p class="cap">${esc(t('postGone'))}</p>`};
    const own=p.owner===me(),a=authorOf(p.owner),name=personName(a),full=Stories.imageOf(p.id),e=ui.postEdit;
    const edit=own?`<details class="mini-section post-edit" ${e?.open?'open':''}><summary>${esc(t('editPost'))}${IC.down}</summary><div class="section-body"><label class="fld"><span>${esc(t('caption'))}</span><textarea data-in="post-caption" maxlength="300" rows="2">${esc(e?.caption??p.caption)}</textarea></label><p class="lbl">${esc(t('whoCanSee'))}</p><div class="seg audience-seg">${Stories.AUDIENCES.map(x=>`<button type="button" data-a="post-audience" data-v="${x}" class="${(e?.audience||p.audience)===x?'on':''}" aria-pressed="${(e?.audience||p.audience)===x}">${esc(t('audience_'+x))}</button>`).join('')}</div><div class="post-edit-actions"><button class="btn primary sm" data-a="post-save" data-id="${esc(p.id)}" ${ui.postBusy?'disabled':''}>${esc(t('save'))}</button><button class="btn danger sm" data-a="post-delete" data-id="${esc(p.id)}" ${ui.postBusy?'disabled':''}>${esc(t(ui.postConfirm===p.id?'tapAgainDelete':'deletePost'))}</button></div></div></details>`:'';
    return {title:own?t('yourPost'):'@'+(a.username||name),html:`<article class="post-view"><header class="post-head"><button class="post-author" data-a="user-open" data-id="${esc(p.owner)}">${storyFace(a)}<span><b>${esc(name)}</b><small>${esc(Stories.ago(p.created_at))}${own?' · '+esc(t('audience_'+(p.audience||'everyone'))):''}</small></span></button></header><figure class="post-media" data-like-target="${esc(p.id)}"><img src="${esc(full||p.thumb||'')}" ${full?'':`data-full="${esc(p.id)}"`} alt="${esc(p.caption||t('photoOf',name))}" draggable="false"></figure><div class="post-actions">${Stories.likeHTML(p)}${own&&p.likes?`<button class="link" data-a="post-likers" data-id="${esc(p.id)}">${esc(t('likedByCount',compact(p.likes)))}</button>`:''}</div>${p.caption?`<p class="post-caption"><b>${esc(name)}</b> ${esc(p.caption)}</p>`:''}${edit}</article>`};};fn.kind='post';return fn;}
  function shUserMedia(){const fn=()=>{const uid=ui.mediaUser,m=Stories.state.media[uid],a=authorOf(uid),name=personName(a),hasStory=!!m?.stories?.length;
    return {title:a.username?'@'+a.username:t('profileTitle'),html:`<section class="user-media-head">${hasStory?`<button class="story-ring big${Stories.groupSeen({items:m.stories})?' seen':''}" data-a="story-user" data-id="${esc(uid)}" aria-label="${esc(t('storyOf',name))}">${storyFace(a)}</button>`:`<span class="story-ring big plain">${storyFace(a)}</span>`}<div><h2>${esc(name)}</h2>${a.username?`<p>@${esc(a.username)}</p>`:''}${m?.friend?`<button class="btn sm" data-a="friend-profile" data-id="${esc(uid)}">${esc(t('viewFullProfile'))}</button>`:''}</div></section>${mediaBlock(uid,false)}`};};fn.kind='user-media';return fn;}
  function shHighlight(){const fn=()=>{const h=ui.hl,list=Stories.state.archive;
    const grid=list===null?`<div class="post-grid">${'<span class="post-tile ghost"></span>'.repeat(6)}</div>`:list.length?`<div class="post-grid pick-grid">${list.map(s=>{const k=h.items.indexOf(s.id);return `<button type="button" class="post-tile pick${k>=0?' on':''}" data-a="hl-pick" data-id="${esc(s.id)}" aria-pressed="${k>=0}" aria-label="${esc(fmtDate(Date.parse(s.created_at)))}"><img src="${esc(s.thumb||'')}" alt="" draggable="false"><span class="pick-mark">${k>=0?k+1:''}</span><small>${esc(fmtDate(Date.parse(s.created_at)))}</small></button>`;}).join('')}</div>`:`<div class="posts-empty">${IC.cam}<p>${esc(t('archiveEmpty'))}</p><button class="btn sm primary" data-a="compose" data-v="story">${esc(t('addStory'))}</button></div>`;
    return {title:t(h.id?'editHighlight':'newHighlight'),html:`<form id="highlight-form" data-f="highlight" class="highlight-editor"><label class="fld"><span>${esc(t('highlightName'))}</span><input name="name" data-in="hl-name" maxlength="30" value="${esc(h.name)}" placeholder="${esc(t('highlightPlaceholder'))}" autocomplete="off" required></label><p class="lbl">${esc(t('chooseStories'))} <small>${h.items.length}</small></p>${grid}${h.error?`<p class="note warn" role="status">${esc(t(h.error))}</p>`:''}${h.id?`<button type="button" class="btn danger hl-delete" data-a="hl-delete" ${h.busy?'disabled':''}>${esc(t(h.confirm?'tapAgainDelete':'deleteHighlight'))}</button>`:''}</form>`,foot:`<button class="btn primary" form="highlight-form" ${h.busy||!h.items.length||!h.name.trim()?'disabled':''}>${esc(t(h.busy?'savingProfile':'save'))}</button>`};};fn.kind='highlight';return fn;}
  function openHighlightEditor(id,add){
    const m=Stories.state.media[me()],h=id&&m?.highlights?.find(x=>x.id===id);
    ui.hl={id:h?h.id:null,name:h?h.name:'',items:h?h.items.map(x=>x.id):[],busy:false,error:'',confirm:false};
    if(add&&!ui.hl.items.includes(add))ui.hl.items.push(add);
    openSheet(shHighlight());
    if(Stories.state.archive===null||add)Stories.archive().then(()=>{if(topIs('highlight'))refreshSheet();}).catch(e=>{if(ui.hl)ui.hl.error=Stories.message(e);Stories.state.archive=Stories.state.archive||[];if(topIs('highlight'))refreshSheet();});
  }
  function shLikers(){const fn=()=>{const list=ui.likers;return {title:t('likesTitle'),html:list===null?`<p class="cap">${esc(t('socialLoading'))}</p>`:list.length?`<ul class="likers">${list.map(u=>`<li>${storyFace(u)}<span><b>${esc(personName(u))}</b><small>@${esc(u.username)}</small></span></li>`).join('')}</ul>`:`<p class="cap">${esc(t('noLikesYet'))}</p>`};};fn.kind='likers';return fn;}
  function openLikers(id){ui.likers=null;openSheet(shLikers());Stories.likers(id).then(l=>{ui.likers=l||[];}).catch(e=>{ui.likers=[];toast(t(Stories.message(e)));}).finally(()=>{if(topIs('likers'))refreshSheet();});}
  function openUser(uid){
    if(!uid)return;
    if(uid===me()){closeSheet(true);go('tab',()=>{ui.tab='profile';ui.profilePage='overview';render();});return;}
    ui.mediaUser=uid;delete mediaError[uid];ensureMedia(uid);openSheet(shUserMedia());
  }
  function storyGroupsFor(uid){
    const m=Stories.state.media[uid];
    if(m?.stories?.length)return [{user:m.user,own:uid===me(),items:m.stories}];
    const g=(Stories.state.feed||[]).find(x=>x.user?.user_id===uid);return g?[g]:[];
  }
  function startCompose(kind){
    if(!socialReady()){toast(t(CL?.user?'socialNeedProfile':'socialSignIn'));return;}
    ui.compose={kind:kind==='post'?'post':'story',image:'',thumb:'',caption:'',audience:'everyone',hours:Stories.DEFAULT_HOURS,busy:false,error:'',reading:false};
    openSheet(shCompose());
  }
  Stories.init({t,esc,calm,lang:L,date:d=>fmtDate(d),toast:m=>toast(m),vibrate:n=>{if(D().settings.vibrate&&navigator.vibrate)navigator.vibrate(n);},
    changed:()=>{if(ui.tab==='profile'&&!Stories.isOpen())rerender();if(topIs('friend-profile')||topIs('user-media'))refreshSheet();},
    profile:uid=>openUser(uid),likers:id=>openLikers(id),highlight:id=>openHighlightEditor(null,id),editHighlight:id=>openHighlightEditor(id)});
  async function communityAction(name,body,own=false){
    if(ui.communityBusy)return false;const owner=CL?.user?.id,target=own?owner:body.p_user||ui.friendProfile?.user_id;if(!owner)return false;
    let addedLike=false;const previousLikes=ui.friendActivity?.likes||0;
    ui.communityBusy=true;ui.reviewError='';if(topIs('review-editor')||topIs('sharing'))refreshSheet();
    try{
      let a=await Social.mutate(name,body);if(CL?.user?.id!==owner)return false;
      // Refetch after publication so Update displays the current server snapshot.
      if(name==='social_routine_publish'||name==='social_routine_unshare'){a=await Social.mutate('social_profile_activity',{p_user:owner});if(CL?.user?.id!==owner)return false;}
      if(own){Social.state.activity=a;if(ui.friendProfile?.user_id===owner)ui.friendActivity=a;}else if(ui.friendProfile?.user_id===target)ui.friendActivity=a;
      addedLike=name==='social_photo_like'&&body.p_like===true&&a.liked&&a.likes>previousLikes&&ui.friendProfile?.user_id===target;
      if(name==='social_review_save'){ui.reviewDraft=null;ui.reviewError='';if(topIs('review-editor'))closeSheet();toast(t('reviewPosted'));}
      if(name==='social_routine_publish'){ui.sharingNotice={id:body.p_source_id,key:'sharedUpdated'};toast(t('sharedUpdated'));}
      if(name==='social_routine_unshare'){ui.sharingNotice=null;toast(t('unsharedNotice'));}
      return true;
    }catch(e){if(CL?.user?.id===owner){const key=Social.message(e);if(topIs('review-editor'))ui.reviewError=key;else toast(t(key));}return false;}
    finally{
      ui.communityBusy=false;
      if(topIs('friend-profile')||topIs('sharing')||topIs('review-editor')||topIs('profile-photo'))refreshSheet();
      if(ui.tab==='profile')rerender();
      if(addedLike&&CL?.user?.id===owner&&ui.friendProfile?.user_id===target){
        const button=$('[data-a=photo-like]',dlg());
        if(button?.dataset.id===target){button.querySelector('.photo-like-count')?.classList.add('like-count-pop');if(!calm()){button.classList.add('pop');setTimeout(()=>button.classList.remove('pop'),700);}}
        const figure=$('.profile-photo-view[data-photo-like]',dlg());
        if(figure?.dataset.photoLike===target)figure.classList.add('like-pop');
      }
    }
  }

  function shProfileEdit() {
    const fn=()=>{
      const p=ui.profileDraft,style=ui.profileStyleDraft||profileStyle();
      return {title:t('editProfile'),html:`${profilePreview(p,style)}<form id="profile-edit-form" data-f="profile-edit"><div class="avatar-edit">${avatar(p,false,true)}<label class="btn sm">${esc(t('changePhoto'))}<input class="sr" type="file" accept="image/jpeg,image/png,image/webp" data-in="profile-photo"></label>${p.avatar?`<button type="button" class="link" data-a="profile-photo-remove">${esc(t('removePhoto'))}</button>`:''}</div><label class="fld"><span>${esc(t('displayName'))}</span><input name="displayName" maxlength="40" data-in="profile-draft" value="${esc(p.displayName)}" autocomplete="nickname"></label><label class="fld"><span>${esc(t('username'))}</span><input name="username" value="${esc(p.username)}" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" autocapitalize="none" spellcheck="false" data-in="profile-draft" ${CL?'required':''}><small>${esc(t('usernameRule'))}</small></label><label class="fld"><span>${esc(t('profileBio'))}</span><textarea name="bio" maxlength="160" rows="3" data-in="profile-draft">${esc(p.bio)}</textarea></label>${miniSection('profile-look',t('profileLook'),`<p class="lbl">${esc(t('profileColor'))}</p><div class="profile-color-wheel"${profileWheelStyle(p)}>${colorWheel(profileHue(p),'profile')}</div><label class="sw"><input type="checkbox" role="switch" data-in="profile-style" data-k="useAccent" ${style.useAccent?'checked':''}><span>${esc(t('profileUseAccent'))}</span></label><p class="lbl">${esc(t('profileCover'))}</p><div class="cover-choices">${['glow','mesh','stripe','clean','grid','orbit','horizon',...(p.coverPhoto?['photo']:[])].map(v=>`<button type="button" class="cover-choice theme-${p.theme} cover-${v}${style.useAccent?' profile-use-accent':''} ${style.cover===v?'on':''}" data-a="profile-style-choice" data-k="cover" data-v="${v}" aria-pressed="${style.cover===v}"${colorStyle(p,style)}><span aria-hidden="true">${v==='photo'?`<img src="${esc(p.coverPhoto)}" alt="">`:''}</span><b>${esc(t('cover_'+v))}</b>${style.cover===v?IC.check:''}</button>`).join('')}</div><div class="cover-upload"><label class="btn sm">${IC.cam}${esc(t(p.coverPhoto?'replaceCoverPhoto':'addCoverPhoto'))}<input class="sr" type="file" accept="image/jpeg,image/png,image/webp" data-in="profile-cover-photo"></label>${p.coverPhoto?`<button type="button" class="link" data-a="cover-photo-remove">${esc(t('removePhoto'))}</button>`:''}</div><p class="lbl">${esc(t('profileFrame'))}</p><div class="seg">${['soft','round','ring'].map(v=>`<button type="button" data-a="profile-style-choice" data-k="frame" data-v="${v}" aria-pressed="${style.frame===v}" class="${style.frame===v?'on':''}">${esc(t('frame_'+v))}</button>`).join('')}</div>`)}<p class="cap">${esc(t('profileShared'))}</p><p class="profile-edit-error note warn" role="status" ${ui.profileError?'':'hidden'}>${esc(t(ui.profileError||''))}</p></form>`,foot:`<button class="btn primary" form="profile-edit-form" ${ui.profileBusy?'disabled':''}>${esc(t(ui.profileBusy?'savingProfile':'saveProfile'))}</button>`};
    };fn.kind='profile-edit';return fn;
  }
  function shBadges() {
    const fn=()=>{const p=profileLocal(),stats=Profile.summary(D().workouts,Date.now(),D().food);return {title:t('chooseBadges'),html:`<p class="cap">${esc(t('badgeChooseHint'))}</p><div class="badge-picker">${stats.badges.map(b=>`<button class="badge-choice ${p.showcase.includes(b.id)&&b.earned?'selected':''}" data-a="profile-badge" data-id="${b.id}" aria-pressed="${p.showcase.includes(b.id)&&b.earned}" ${b.earned?'':'disabled'}>${badgeChip(b,true)}<span>${b.earned?p.showcase.includes(b.id)?'✓':'+':esc(t('badgeLocked'))}</span></button>`).join('')}</div>`};};fn.kind='badges';return fn;
  }
  function contactDiscovery(full=false) {
    const c=Social.state.contacts;
    if(!c)return `<p class="cap">${esc(t(Social.state.contactError||'contactUnavailable'))}</p>`;
    return `<${full?'section':'details'} class="contact-discovery" ${!full&&ui.contactOpen?'open':''}>${full?'':`<summary>${esc(t('contactDiscovery'))}${IC.down}</summary>`}<p class="cap">${esc(t('contactPrivacy'))}</p><form data-f="contact-settings"><label class="sw"><input type="checkbox" role="switch" name="email" ${c.by_email?'checked':''} ${c.email_verified?'':'disabled'}><span>${esc(t('findMeEmail'))}</span></label><label class="sw"><input type="checkbox" role="switch" name="phone" ${c.by_phone?'checked':''} ${c.phone_verified?'':'disabled'}><span>${esc(t('findMePhone'))}</span></label><button class="btn" ${ui.friendBusy?'disabled':''}>${esc(t('save'))}</button></form><details class="phone-setup" ${ui.pendingPhone?'open':''}><summary>${esc(t('phoneNumber'))}${IC.down}</summary><p class="cap">${esc(t(c.phone_verified?'phoneVerified':'phoneVerificationHint'))}</p><form data-f="phone-verify" class="phone-verification"><label class="fld"><span>${esc(t('phoneNumber'))}</span><input type="tel" name="phone" placeholder="+36 20 123 4567" value="${esc(ui.pendingPhone||'')}" required autocomplete="tel" maxlength="24"></label>${ui.pendingPhone?`<label class="fld"><span>${esc(t('verificationCode'))}</span><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{4,10}" required maxlength="10"></label>`:''}<button class="btn" ${ui.friendBusy?'disabled':''}>${esc(t(ui.pendingPhone?'verifyPhone':'sendCode'))}</button>${ui.pendingPhone?`<button type="button" class="link" data-a="phone-restart">${esc(t('changePhone'))}</button>`:''}</form></details></${full?'section':'details'}>`;
  }
  async function phoneVerification(values) {
    if(ui.friendBusy)return;
    const phone=String(values.phone||'').replace(/[ ()-]/g,'');
    if(!/^\+[1-9][0-9]{6,14}$/.test(phone)){toast(t('phoneFormat'));return;}
    const owner=CL&&CL.user&&CL.user.id;if(!owner)return;ui.friendBusy=true;
    try {
      if(ui.pendingPhone&&phone===ui.pendingPhone){await CL.verifyPhone(phone,String(values.code||'').trim());if(!CL.user||CL.user.id!==owner)return;ui.pendingPhone='';await Social.refresh();toast(t('phoneVerified'));}
      else {await CL.requestPhone(phone);if(!CL.user||CL.user.id!==owner)return;ui.pendingPhone=phone;toast(t('codeSent'));}
    }catch(error){toast(t(error.code==='rate'?'contactLookupLimit':'phoneVerificationError'));}
    finally{ui.friendBusy=false;if(topIs('friend-search')||topIs('discovery'))refreshSheet();if(ui.tab==='profile')rerender();}
  }
  async function loadSocial(force) {const owner=CL&&CL.user&&CL.user.id;if(ui.contactOwner!==owner){ui.contactOwner=owner;ui.pendingPhone='';ui.contactOpen=false;ui.friendKind='username';ui.friendValue='';ui.friendError='';ui.friendNotice='';ui.friendCompetition=false;}await Social.refresh();if(ui.tab==='profile')rerender();if(CL?.user&&Social.state.data?.profile){Stories.refresh(force===true);if(force===true){Object.keys(Stories.state.media).forEach(k=>delete Stories.state.media[k]);Object.keys(mediaError).forEach(k=>delete mediaError[k]);}}}
  async function socialAction(name,args) {
    if(ui.friendBusy)return;
    const search=name.startsWith('social_request_friend');
    const owner=CL?.user?.id;ui.friendBusy=true;ui.friendError='';ui.friendNotice='';if(topIs('friend-search'))refreshSheet();if(ui.tab==='profile')rerender();
    try {
      await Social.mutate(name,args);if(CL?.user?.id!==owner)return;await Social.refresh();if(CL?.user?.id!==owner)return;
      if(search){ui.friendValue='';ui.friendNotice='requestSent';if(topIs('friend-search'))closeSheet(true);}
      if(name==='social_remove_friend'&&topIs('friend-options'))closeSheet(true);toast(t(search?'requestSent':'saved'));
    }catch(error){
      const key=Social.message(error);
      if(search)ui.friendError=key==='friendNotFound'?(name==='social_request_friend'?'friendUsernameMissing':'friendContactMissing'):key;
      else Social.state.error=key;
    }
    finally {ui.friendBusy=false;if(topIs('friend-search')||topIs('discovery'))refreshSheet();if(ui.tab==='profile')rerender();}
  }
  async function saveProfile(values) {
    if(ui.profileBusy)return;
    const draft=Profile.clean({...ui.profileDraft,...values});
    if((values.username||'').trim()&&!draft.username){ui.profileError='usernameRule';refreshSheet();return;}
    ui.profileBusy=true;ui.profileError='';ui.profileDraft=draft;
    const before=D().settings.publicProfile,beforeStyle=D().settings.profileStyle;D().settings.publicProfile=draft;D().settings.profileStyle=Profile.cleanStyle(ui.profileStyleDraft);
    if(!Store.save()){D().settings.publicProfile=before;D().settings.profileStyle=beforeStyle;ui.profileBusy=false;ui.profileError='saveFailed';refreshSheet();return;}
    refreshSheet();
    try {
      if(CL&&CL.user){await Social.publish(draft);await Social.refresh();}
      ui.profileBusy=false;if(topIs('profile-edit'))closeSheet(true);rerender();toast(t('saved'));
    }catch(error){ui.profileBusy=false;ui.profileError=Social.message(error);Social.state.error=ui.profileError;if(topIs('profile-edit'))refreshSheet();if(ui.tab==='profile')rerender();}
  }

  const VIEWS = { settings: vSettings, home: vHome, food: vFood, goals: vGoals, profile: vProfile, lib: vLib, prog: vProg, habits: vHabits };

  // Preserve the visible fill through redraws, including rapid taps and undo.
  function animateClocks(previous){
    $$('[data-clock-key]', $('#view')).forEach(clock=>{
      const svg=$('.calorie-dial',clock),ticks=$$('.dial-tick',svg),target=+clock.dataset.clockRatio,from=previous.get(clock.dataset.clockKey)??0;
      if(!svg||!ticks.length)return;
      const paint=ratio=>{clock.dataset.clockDisplay=String(ratio);ticks.forEach((tick,i)=>tick.classList.toggle('filled',i<ratio*ticks.length));};
      if(calm()||Math.abs(target-from)<.0001){paint(target);return;}
      paint(from);svg.classList.add('clock-charging');svg.getBoundingClientRect();const started=performance.now(),duration=650;
      const frame=now=>{if(!clock.isConnected)return;const progress=calm()?1:Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3);paint(from+(target-from)*eased);if(progress<1)requestAnimationFrame(frame);else paint(target);};
      requestAnimationFrame(frame);
    });
  }
  let animT = 0;
  function render() {
    const oldPlanner=$('.planner-scroll');if(oldPlanner){if(ui.plannerScroll!==null)ui.plannerScroll=oldPlanner.scrollTop;if(ui.plannerScrollX!==null)ui.plannerScrollX=oldPlanner.scrollLeft;}
    ownSync();
    document.documentElement.lang = L();
    $('#tabbar').setAttribute('aria-label',t('mainNavigation'));
    refreshBrandMetadata();
    const y = ui.keepScroll ? window.scrollY : 0; ui.keepScroll = false;
    const v = $('#view'),previousClocks=new Map($$('[data-clock-key]',v).map(c=>[c.dataset.clockKey,+(c.dataset.clockDisplay??c.dataset.clockRatio)])), entering=ui.anim; ui.anim='';
    // Async profile/sync redraws must not cancel a tab's entry animation immediately.
    if(entering){v.dataset.anim=entering;clearTimeout(animT);animT=setTimeout(()=>{delete v.dataset.anim;},600);}
    v.innerHTML = VIEWS[ui.tab]();
    const plannerScroll=$('.planner-scroll');if(plannerScroll){const firstHour=+plannerScroll.dataset.startHour;plannerScroll.scrollTop=ui.plannerScroll==null?Math.max(0,(9-firstHour)*72-35):ui.plannerScroll+((ui.plannerHourStart??firstHour)-firstHour)*72;ui.plannerScroll=plannerScroll.scrollTop;ui.plannerHourStart=firstHour;plannerScroll.scrollLeft=ui.plannerScrollX??(ui.plannerView==='week'?plannerDays().indexOf(ui.plannerDate)*118:0);ui.plannerScrollX=plannerScroll.scrollLeft;}
    animateClocks(previousClocks);
    postImages(v);
    if(ui.tab==='goals'&&ui.goals==='planner')queueMicrotask(()=>syncCalendars(false));
    $$('#tabbar button[data-tab]').forEach(b => { b.classList.toggle('on', b.dataset.tab === ui.tab); const label=t(b.dataset.tab==='settings'?'settings':'tab'+b.dataset.tab[0].toUpperCase()+b.dataset.tab.slice(1));b.setAttribute('aria-label',label);b.querySelector('span').innerHTML=b.dataset.tab==='settings'?`<span class="nav-caption-full">${esc(label)}</span><span class="nav-caption-short" aria-hidden="true">${esc(t('settingsNavShort'))}</span>`:esc(label); b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'); });
    const settingsLabel = $('#tabbar [data-a="settings"] span'); if (settingsLabel) { settingsLabel.parentElement.setAttribute('aria-label', t('settings')); }
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
    d.innerHTML = `<div class="sheet-head">${ui.sheets.length > 1 ? `<button class="icon-btn" data-a="sheet-back" aria-label="${esc(t('back'))}">${IC.back}</button>` : '<span class="sp"></span>'}<h2 id="sheet-title" tabindex="-1" autofocus>${esc(s.title)}</h2><button class="icon-btn" data-a="sheet-close" aria-label="${esc(t('close'))}">${IC.close}</button></div><div class="sheet-body">${s.html}</div>${s.foot ? `<div class="sheet-foot">${s.foot}</div>` : ''}`;
    $('.sheet-body', d).scrollTop = y;
    postImages(d);
    [...rideMaps.keys()].filter(k => k !== 'live').forEach(rideMapDrop); rideMapsMount(d);
  }
  let closeT = 0, unlockSheet = null;
  function openSheet(fn) {
    const d = dlg(); if (!d.showModal) { toast(t('oldIOS')); return; }
    const nested = d.open && !closeT;
    clearTimeout(closeT); closeT = 0; d.classList.remove('closing');          // a sheet that was sliding away is reused
    ui.sheets.push(fn); drawSheet(nested ? 'fwd' : '');
    if (!d.open) {
      unlockSheet = ModalLock.acquire(d);
      try { d.showModal(); } catch (error) { unlockSheet(); unlockSheet = null; ui.sheets = []; throw error; }
    }
  }
  function refreshSheet() { if (!ui.sheets.length && ui.tab === "settings") { rerender(); return; } ui.sheetKeep = true; drawSheet(); }
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
  const topIs = kind => { const f = ui.sheets[ui.sheets.length - 1]; return f ? f.kind === kind : kind === "settings" && ui.tab === "settings"; };

  /* ---------- exercise detail ---------- */
  function drawingPicture(source, phase, board, label) {
    return `<span class="drawing-picture"><img class="${board ? 'drawing-board phase-' + phase : ''}" src="${esc(source)}" alt="${esc(label)}"></span>`;
  }
  function exerciseDrawings(id, name, board, pair, photos) {
    return `<div class="drawing-pair">${[0, 1].map(phase => {
      const source = board || pair[phase], label = name + ' · ' + t(phase ? 'artEnd' : 'artStart');
      return source ? `<button class="drawing-phase" data-a="fig-big" data-id="${esc(id)}" data-phase="${phase}" data-source="${esc(source)}" data-board="${board ? '1' : '0'}" aria-label="${esc(t(photos ? 'figPhoto' : 'figBig') + ': ' + label)}">${drawingPicture(source, phase, !!board, label)}<span class="drawing-caption">${esc(t(phase ? 'artEnd' : 'artStart'))}</span></button>` : `<div class="drawing-phase"><p class="cap">${esc(t('artUnavailable'))}</p></div>`;
    }).join('')}</div><p class="cap figcap">${photos ? esc(t('figPhoto')) + ' · ' : ''}${esc(t('guideTap'))}</p>`;
  }
  function shEx(id, item) {
    return () => {
      const e = EX[id], pl0 = PLAN_BY_EX[id], special = pl0 && (pl0.similar || pl0.reps === '21'), name = item ? itemName(item) : exName(id);
      const pl = pl0 && (!special || (item && item.label && item.label.hu === pl0.hu)) ? pl0 : null;
      const focus = ui.muscleFocus && ui.muscleFocus.id === id ? ui.muscleFocus.group : '', mm = focus ? MuscleMap.fromLists(e.p.includes(focus) ? [focus] : [], e.s.includes(focus) ? [focus] : []) : pl && pl.mm ? pl.mm : MuscleMap.fromLists(e.p, e.s), hst = exHistory(id);
      let best = 0, top = null; hst.forEach(x => x.sets.forEach(s => { if (s.w) return; const v = e1rm(s.kg, s.reps); if (v > best) best = v; if (!top || s.kg > top.kg || (s.kg === top.kg && s.reps > top.reps)) top = s; }));
      const pts = hst.map(x => ({ x: fmtDate(x.d), y: r1(bestOf(x.sets)) })).filter(p => p.y > 0);
      const routineArt = !ui.figBad[id] && !ownPic(id) && window.ROUTINE_ART[id];
      const art = !routineArt && (window.EX_ART || {})[id], figure = !routineArt && FIG[id], board = !ui.figBad[id] && art ? 'img/fig/' + art + '.webp' : '';
      const drawing = !ui.figBad[id] && figure;
      const photos = !routineArt && !board && !drawing && e.k >= 2;
      const pair = routineArt ? routineArt.pair : drawing ? [0, 1].map(phase => 'img/fig/' + figure + '-' + phase + '.svg') : photos ? [img(id,0),img(id,1)] : [];
      const visual = ui.exVisual && ui.exVisual.id === id ? ui.exVisual.mode : 'movement';
      const muscleName = m => (window.MUSCLE_DETAIL[m] || [mus(m), mus(m)])[L() === 'hu' ? 0 : 1];
      const mapLabel = focus ? t('muscleSelected', muscleName(focus)) : [t('musclesWorked'), t('primary') + ': ' + e.p.map(muscleName).join(', '), t('secondary') + ': ' + e.s.map(muscleName).join(', ')].join('. ');
      const map = `<section class="muscle-spotlight"><h3>${esc(t('musclesWorked'))}</h3><div class="mm">${MuscleMap.svg(mm[0], mm[1], t('front'), t('backSide'), mapLabel)}</div><p class="cap muscle-legend"><i class="k1"></i>${esc(t('primary'))}<i class="k2"></i>${esc(t('secondary'))}</p>${e.p.length || e.s.length ? `<p class="cap">${esc(t('muscleMapHint'))}</p><div class="muscle-picks"><button class="chip${!focus ? ' on' : ''}" data-a="muscle-focus" data-id="${esc(id)}" data-group="" aria-pressed="${!focus}">${esc(t('muscleAll'))}</button>${[['primary',e.p],['secondary',e.s]].map(([key,list]) => list.length ? `<div><small>${esc(t(key))}</small><div class="chips">${list.map(m => `<button class="chip${focus === m ? ' on' : ''}" data-a="muscle-focus" data-id="${esc(id)}" data-group="${esc(m)}" aria-pressed="${focus === m}">${esc(muscleName(m))}</button>`).join('')}</div></div>` : '').join('')}</div>` : `<p class="cap">${esc(t('muscleMapEmpty'))}</p>`}<details class="muscle-precision"><summary>${esc(t('muscleMapAbout'))}</summary><p class="cap">${esc(t('musclePrecision'))}</p></details></section>`;
      let h = `<div class="seg exercise-visual-tabs" aria-label="${esc(t('details'))}">${['muscles','movement'].map(mode => `<button class="${visual === mode ? 'on' : ''}" data-a="ex-visual" data-id="${esc(id)}" data-v="${mode}" aria-pressed="${visual === mode}">${esc(t(mode === 'muscles' ? 'muscleMapTitle' : 'movementTitle'))}</button>`).join('')}</div>`;
      h += visual === 'muscles' ? map : e.own && ownPic(id) !== NOPIC ? `<div class="anim one ownpic"><img src="${esc(ownPic(id))}" alt="${esc(name)}"></div>` : exerciseDrawings(id, name, board, pair, photos);
      if (item && (item.rir || item.note)) h += `<div class="tip"><b>${esc(t('planNote'))}</b>${item.rir ? 'RIR ' + esc(item.rir) + (item.note ? ' · ' : '') : ''}${esc(item.note || '')}</div>`;
      const fav = isFav(id), st = exSteps(id);
      if (routineArt && st.list.length) h += `<section class="card routine-technique"><h3>${esc(t('howTo'))}</h3>${st.own ? '' : `<p class="cap">${esc(t('enOnly'))}</p>`}<ol class="routine-steps">${st.list.map((x,i) => `<li><span aria-hidden="true">${i+1}</span><p>${esc(x)}</p></li>`).join('')}</ol></section>`;
      h += `<div class="exmeta"><p class="en">${name !== e.n ? esc(e.n) : ''}</p><button class="favbtn${fav ? ' on' : ''}" data-a="fav-ex" data-id="${esc(id)}" aria-pressed="${fav}">${IC.star}${esc(t(fav ? 'favOn' : 'favAdd'))}</button></div><div class="chips">${visual !== 'muscles' ? e.p.map(m => `<button class="chip on" data-a="muscle-focus" data-id="${esc(id)}" data-group="${esc(m)}">${esc(mus(m))}</button>`).join('') : ''}${visual !== 'muscles' ? e.s.map(m => `<button class="chip" data-a="muscle-focus" data-id="${esc(id)}" data-group="${esc(m)}">${esc(mus(m))}</button>`).join('') : ''}<span class="chip">${esc(eqp(e.eq))}</span></div>`;
      if (pl && pl.tip) h += `<div class="tip"><b>${esc(t('coachNote'))}</b>${esc(pl.tip[L()])}</div>`;
      h += `<section class="card"><h3>${esc(t('myStats'))}</h3>` + (hst.length ? `<div class="kpis"><div><b>${best ? r1(best) : '–'}</b><i>${esc(t('est1rm'))}</i></div><div><b>${top ? (top.kg ? top.kg + '×' + top.reps : top.reps) : '–'}</b><i>${esc(t('bestSet'))}</i></div><div><b>${hst.length}</b><i>${esc(t('sessions'))}</i></div></div>${pts.length > 1 ? Charts.line(pts.slice(-20), { unit: ' kg' }) + `<p class="cap">${esc(t('e1rmChart'))}</p>` : ''}
        <div class="lastlist">${hst.slice(-3).reverse().map(x => `<p><i>${esc(fmtDate(x.d))}</i>${x.sets.map(s => `<span>${s.w ? 'W ' : ''}${s.kg ? s.kg + '×' : ''}${s.reps}</span>`).join('')}</p>`).join('')}</div>` : `<p class="empty">${esc(t('noHistoryEx'))}</p>`) + `</section>`;
      if (!routineArt && st.list.length) h += `<section class="card"><h3>${esc(t('howTo'))}</h3>${st.own ? '' : `<p class="cap">${esc(t('enOnly'))}</p>`}<ol class="steps">${st.list.map(x => `<li>${esc(x)}</li>`).join('')}</ol></section>`;
      if (e.own) h += `<section class="card"><h3>${esc(t('myExOwn'))}</h3><button class="btn" data-a="mx-edit" data-id="${esc(id)}">${IC.pen}${esc(t('edit'))}</button></section>`;
      const foot = (D().active ? `<button class="btn primary" data-a="ex-to-workout" data-id="${esc(id)}">${esc(t('addToWorkout'))}</button>` : '') + `<button class="btn" data-a="ex-to-routine" data-id="${esc(id)}">${esc(t('addToRoutine'))}</button>`;
      return { title: name, html: h, foot };
    };
  }
  function shPickRoutine(exId) {
    return () => ({ title: t('addToRoutine'), html: D().routines.filter(r=>!RoutineTemplates.isComplex(r)).map(r => `<button class="rcard" data-a="ex-routine-add" data-id="${esc(r.id)}" data-ex="${esc(exId)}"><span class="rc-t"><b>${esc(rName(r))}</b><i>${r.items.length} ${esc(pl(r.items.length,'exercises'))}</i></span>${IC.plus}</button>`).join('') });
  }

  /* ---------- routines ---------- */
  const getR = id => D().routines.find(r => r.id === id);
  function shRoutineLibrary() {
    return ()=>({title:t('browseSplits'),html:`<p class="cap">${esc(t('splitLibraryHint'))}</p><div class="split-library">${RoutineTemplates.templates.map(p=>`<button class="split-card" data-a="routine-template" data-id="${p.id}"><span class="r-ic">${RICON[p.icon]}</span><span><b>${esc(p.name[L()])}</b><small>${esc(p.hint[L()])}</small></span>${IC.chev}</button>`).join('')}</div>`});
  }
  function shRoutineTemplate(id) {
    return ()=>{
      const p=RoutineTemplates.templates.find(x=>x.id===id);if(!p)return {title:'',html:''};
      return {title:p.name[L()],html:`<p class="lead">${esc(p.hint[L()])}</p><p class="split-schedule">${IC.cal}${esc(p.schedule[L()])}</p><div class="split-preview">${p.days.map((d,i)=>`<details><summary><span class="r-ic">${RICON[d.icon]}</span><span><small>${esc(t('splitSession',i+1))}</small><b>${esc(d.name[L()])}</b><small>7 ${esc(t('exercises'))} · ~${estMin(d)} ${esc(t('min'))}</small></span>${IC.down}</summary><div>${d.items.map(it=>`<div class="split-exercise"><b>${esc(exName(it.ex))}</b><small>${it.sets} × ${esc(it.reps)} · ${clock(it.rest)}</small></div>`).join('')}</div></details>`).join('')}</div><p class="cap">${esc(t('durationHint'))}</p><p class="cap">${esc(t('splitCustomHint'))}</p>`,foot:`<button class="btn primary" data-a="routine-template-add" data-id="${p.id}">${IC.plus}${esc(t('addSplit',p.days.length))}</button>`};
    };
  }
  function addRoutineTemplate(id) {
    const p=RoutineTemplates.templates.find(x=>x.id===id);if(!p)return;
    const before=D().routines;if(before.length+p.days.length>100){toast(t('routineLimit'));return;}
    const group=uid();
    const days=p.days.map((d,i)=>({id:'t'+group+'_'+i,builtin:false,icon:d.icon,name:{hu:p.name.hu+' · '+d.name.hu,en:p.name.en+' · '+d.name.en},sub:p.name,info:{hu:p.schedule.hu+' · '+I18N.hu.splitCustomHint,en:p.schedule.en+' · '+I18N.en.splitCustomHint},items:d.items.map(it=>({...it}))}));
    D().routines=before.concat(days);
    if(!Store.save()){D().routines=before;toast(t('saveFailed'));return;}
    closeSheet(true);ui.tab='home';ui.workout='plans';render();toast(t('splitAdded'));
  }
  function removeRoutine(id) {
    if(!getR(id)||!confirm(t('deleteRoutineConfirm')))return;
    const before=D().routines;D().routines=before.filter(r=>r.id!==id);
    if(!Store.save()){D().routines=before;toast(t('saveFailed'));return;}
    closeSheet(true);render();toast(t('routineRemoved'));
  }
  function shRoutine(id) {
    return () => {
      const r = getR(id); if (!r) return { title: '', html: '' };
      const complex=RoutineTemplates.isComplex(r);
      const h = (r.sub ? `<p class="lead">${esc(r.sub[L()])}</p>` : '') + (r.info ? `<p class="cap rinfo">${esc(typeof r.info === 'object' ? r.info[L()] || r.info.en || '' : r.info)}</p>` : '') + `<p class="cap">${r.items.length} ${esc(pl(r.items.length,'exercises'))} · ${r.items.reduce((a, i) => a + i.sets, 0)} ${esc(pl(r.items.reduce((a, i) => a + i.sets, 0),'setsWord'))}${complex?'':' · ~'+estMin(r)+' '+esc(t('min'))}</p>${!complex?`<p class="cap">${esc(t('durationHint'))}</p>`:''}${prepRow('warm', { entries: r.items }, ` data-r="${esc(r.id)}"`)}${prepRow('cool', { entries: r.items }, ` data-r="${esc(r.id)}"`)}<div class="exlist prep-gap">` +
        r.items.map((it, i) => `<button class="exrow" data-a="ex-open" data-id="${esc(it.ex)}" data-r="${esc(r.id)}" data-i="${i}"><img src="${thumb(it.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(itemName(it))}</b><i>${it.sets} × ${esc(bi(it.reps, r.id))}${it.rir ? ' · RIR ' + esc(it.rir) : ''} · ${esc(t('rest'))} ${clock(it.rest)}</i>${it.note ? `<i class="nt">${esc(bi(it.note, r.id))}</i>` : ''}</span>${IC.chev}</button>`).join('') + `</div>` +
        (complex?'':`<button class="btn tickbtn" data-a="w-tick" data-id="${esc(r.id)}">${IC.check}${esc(t('tickWorkout'))}</button>`) + (D().plan && D().plan.train.length ? `<button class="link" data-a="plan-notes">${esc(t('planRules'))}</button>` : '');
      return { title: shortName(rName(r)), html: h, foot: `<button class="btn primary" data-a="w-start" data-id="${esc(r.id)}">${esc(t(complex?'startComplex':'startWorkout'))}</button><button class="btn" data-a="r-edit" data-id="${esc(r.id)}">${esc(t('edit'))}</button><button class="btn routine-remove" data-a="routine-remove" data-id="${esc(r.id)}" aria-label="${esc(t('deleteRoutine'))}">${IC.close}</button>` };
    };
  }
  function shRoutineEdit() {
    return () => {
      const r = ui.edit;
      const h = `<label class="fld"><span>${esc(t('routineName'))}</span><input type="text" data-in="re-name" value="${esc(rName(r))}" placeholder="${esc(t('routineNamePh'))}" autocomplete="off"></label>
        <label class="fld"><span>${esc(t('routineSection'))}</span><select data-in="re-focus">${['strength','stability','knee'].map(v=>`<option value="${v}" ${(r.focus||'strength')===v?'selected':''}>${esc(t('routineSection_'+v))}</option>`).join('')}</select></label>
        <p class="lbl">${esc(t('icon'))}</p><div class="icons">${[''].concat(Store.ICONS).map(v => `<button class="${(r.icon || '') === v ? 'on ' : ''}ic-${v || rIcon(Object.assign({}, r, { icon: '' }))}" data-a="re-icon" data-v="${v}" aria-pressed="${(r.icon || '') === v}" aria-label="${esc(v ? t('icon') + ' ' + ((PLAN.days.find(day => day.id === v) || {})[L()] || v) : t('iconAuto'))}"><span class="r-ic">${v ? RICON[v] : RICON[rIcon(Object.assign({}, r, { icon: '' }))]}</span>${v ? '' : `<i>${esc(t('iconAuto'))}</i>`}</button>`).join('')}</div>
        <div class="re-list">${r.items.map((it, i) => `<div class="re-row"><div class="re-top"><img src="${thumb(it.ex)}" alt="" decoding="async"><b>${esc(itemName(it))}</b><button class="icon-btn sm" data-a="re-up" data-i="${i}" aria-label="${esc(t('moveUp'))}" ${i ? '' : 'disabled'}>${IC.up}</button><button class="icon-btn sm" data-a="re-down" data-i="${i}" aria-label="${esc(t('moveDown'))}" ${i < r.items.length - 1 ? '' : 'disabled'}>${IC.down}</button><button class="icon-btn sm" data-a="re-del" data-i="${i}" aria-label="${esc(t('delete'))}">${IC.close}</button></div>
          <div class="re-f"><label><span>${esc(t('setsWord'))}</span><input type="text" inputmode="numeric" data-in="re-sets" data-i="${i}" value="${it.sets}"></label><label><span>${esc(t('reps'))}</span><input type="text" data-in="re-reps" data-i="${i}" value="${esc(it.reps)}"></label><label><span>${esc(t('rest'))} (s)</span><input type="text" inputmode="numeric" data-in="re-rest" data-i="${i}" value="${it.rest}"></label><label><span>RIR</span><input type="text" data-in="re-rir" data-i="${i}" value="${esc(it.rir || '')}" maxlength="8"></label></div></div>`).join('') || `<p class="empty">${esc(t('noItems'))}</p>`}</div>
        <button class="btn" data-a="re-add">${IC.plus}${esc(t('addExercise'))}</button>${r._old ? `<button class="btn" data-a="r-dup">${esc(t('saveCopy'))}</button>` : ''}${r._old ? `<button class="btn danger" data-a="r-del">${esc(t('deleteRoutine'))}</button>` : ''}`;
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
    $$('#pick-list .pickrow').forEach(r => { const i = st.sel.indexOf(r.dataset.id), was = r.classList.contains('on'); r.classList.toggle('on', i >= 0); r.classList.toggle('pop', i >= 0 && !was); $('.pk-n', r).textContent = i >= 0 ? i + 1 : ''; $('.pk-main', r).setAttribute('aria-pressed', i >= 0); });
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
    return `<section class="card circuit-guide" aria-live="polite"><h3>${esc(next ? t('circuitRound', next.round, next.rounds) : t('circuitComplete'))}</h3><p>${done} / ${sets.length} ${esc(pl(sets.length,'setsWord'))}</p><progress max="${Math.max(1, sets.length)}" value="${done}" aria-label="${esc(t('circuitProgress'))}"></progress>${next ? `<button class="btn primary" data-a="circuit-next">${esc(t('circuitNext'))}: ${esc(itemName(a.entries[next.i]))}</button>` : ''}</section>`;
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
    el.innerHTML = `<header class="w-head"><button class="icon-btn" data-a="w-min" aria-label="${esc(t('minimize'))}">${IC.down}</button><div><b>${esc(shortName(a.name))}</b><i id="w-el">0:00</i></div><button class="btn primary" data-a="w-finish">${esc(t('finish'))}</button></header>
      <div class="workout-jump"><label><span>${esc(t('jumpExercise'))}</span><select data-in="w-jump" aria-label="${esc(t('jumpExercise'))}"><option value="">${esc(t('chooseExercise'))}</option>${a.entries.map((en,i)=>`<option value="${i}">${i+1}. ${esc(itemName(en))} · ${en.sets.filter(s=>s.done).length}/${en.sets.length}</option>`).join('')}</select></label><span class="workout-completion">${a.entries.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0)}/${a.entries.reduce((n,e)=>n+e.sets.length,0)} ${esc(pl(a.entries.reduce((n,e)=>n+e.sets.length,0),'setsWord'))}</span></div>
      <div class="w-body">${circuitGuide(a)}${a.info ? `<p class="cap rinfo">${esc(typeof a.info === 'object' ? a.info[L()] || a.info.en || '' : a.info)}</p>` : ''}${prepRow('warm', a, '')}${a.entries.map((en, i) => {
        const hst = exHistory(en.ex), prev = hst.length ? hst[hst.length - 1].sets : [];
        return `<section class="wex" data-ex-index="${i}"><div class="wex-h"><button class="wex-img" data-a="ex-open" data-id="${esc(en.ex)}" data-w="${i}" aria-label="${esc(t('details'))}"><img src="${thumb(en.ex)}" alt="" decoding="async"></button><div><b>${esc(itemName(en))}</b><i>${en.target} × ${esc(bi(en.reps, a.rid))}${en.rir ? ' · RIR ' + esc(en.rir) : ''} · ${esc(t('rest'))} ${clock(en.rest)}</i></div><button class="icon-btn sm" data-a="w-tools" data-i="${i}" aria-label="${esc(t('more'))}">⋯</button></div>
          ${ui.wTools === i ? `<div class="wex-tools${ui.fx === 'tools' ? ' in' : ''}"><button class="btn sm" data-a="w-up" data-i="${i}" ${i ? '' : 'disabled'}>${IC.up}${esc(t('moveUp'))}</button><button class="btn sm" data-a="w-down" data-i="${i}" ${i < a.entries.length - 1 ? '' : 'disabled'}>${IC.down}${esc(t('moveDown'))}</button><button class="btn sm danger" data-a="w-delex" data-i="${i}">${esc(t('remove'))}</button></div>` : ''}
          ${en.note ? `<p class="hint wnote">${esc(bi(en.note, a.rid))}</p>` : ''}<p class="hint">${esc(hintFor(en, hst))}</p>
          <div class="sets"><div class="set set-hd"><span>#</span><span>${esc(t('prev'))}</span><span>kg</span><span>${esc(t('reps'))}</span><span></span></div>
          ${en.sets.map((s, j) => { const p = prev[j];
            return `<div data-i="${i}" data-j="${j}" class="set${s.done ? ' done' : ''}${ui.fx === 'pop' + i + '-' + j ? ' pop' : ''}${ui.fx === 'new' + i + '-' + j ? ' in' : ''}"><button class="set-n${s.w ? ' w' : ''}" data-a="w-warm" data-i="${i}" data-j="${j}" aria-label="${esc(t('warmToggle'))}">${s.w ? 'W' : j + 1 - en.sets.slice(0, j).filter(x => x.w).length}</button><span class="prev">${p ? (p.kg ? p.kg + '×' : '') + p.reps : '–'}</span>
              <input type="text" inputmode="decimal" data-in="w-kg" data-i="${i}" data-j="${j}" value="${esc(s.kg)}" placeholder="${p && p.kg ? p.kg : ''}" aria-label="kg" autocomplete="off" enterkeyhint="next">
              <input type="text" inputmode="numeric" data-in="w-reps" data-i="${i}" data-j="${j}" value="${esc(s.reps)}" placeholder="${p ? p.reps : ''}" aria-label="${esc(t('reps'))}" autocomplete="off" enterkeyhint="done">
              <button class="set-ok" data-a="w-check" data-i="${i}" data-j="${j}" aria-label="${esc(t('setDone'))}" aria-pressed="${s.done}">${IC.check}</button></div>`; }).join('')}</div>
          <div class="wex-f"><button class="link" data-a="w-addset" data-i="${i}">+ ${esc(t('set'))}</button>${en.sets.length > 1 ? `<button class="link mut" data-a="w-delset" data-i="${i}">− ${esc(t('set'))}</button>` : ''}</div></section>`; }).join('')}
        ${a.entries.length ? '' : `<p class="empty">${esc(t('emptyHint'))}</p>`}
        <section class="card active-cardio"><h3>${esc(t('cardioEnergy'))}</h3>${cardioRows(a,'active')}<button class="btn" data-a="cardio-add" data-target="active">${IC.plus}${esc(t('logCardio'))}</button></section><button class="btn" data-a="w-addex">${IC.plus}${esc(t('addExercise'))}</button>${prepRow('cool', a, '')}<button class="btn danger ghost" data-a="w-cancel">${esc(t('cancelWorkout'))}</button></div>`;
    $('.w-body', el).scrollTop = y; ui.fx = ''; tick();
  }
  function finishWorkout(energy,reviewed) {
    const a = D().active; if (!a) return;
    const entries = a.entries.map(e => ({ ex: e.ex, label: e.label, sets: e.sets.filter(s => s.done && num(s.reps) > 0).map(s => ({ kg: Math.min(2000, Math.max(0, num(s.kg))), reps: Math.min(1000, Math.round(num(s.reps))), w: !!s.w })) })).filter(e => e.sets.length);
    if (!entries.length && !(a.cardio||[]).length) { if (confirm(t('nothingLogged'))) { D().active = null; Store.save(); ui.wOpen = false; unwake(); render(); } return; }
    const open = a.entries.reduce((n, e) => n + e.sets.filter(s => !s.done).length, 0);
    if (!reviewed && open && !confirm(t('finishOpen', open))) return;
    if(entries.length && energy===undefined){openEnergy('active');return;}
    const prs = entries.map(e => { const before = exHistory(e.ex).reduce((m, x) => Math.max(m, bestOf(x.sets)), 0), now = bestOf(e.sets); return now > before && now > 0 ? { ex: e.ex, label: e.label, v: now, was: before } : null; }).filter(Boolean);
    const ranksBefore=StrengthRanks.summary(D().workouts),musclesBefore=muscleSummary();
    const badgesBefore=Profile.summary(D().workouts,Date.now(),D().food).badges.filter(b=>b.earned).map(b=>b.id);
    const w = { id: a.id, rid: a.rid, name: a.name, start: a.start, end: Date.now(), entries, energy:energy||null, energyAt:Date.now(), cardio:a.cardio||[], cardioAt:Date.now(), warm: !!a.warm, cool: !!a.cool };
    const before=D().workouts.slice();D().workouts.push(w); D().workouts.sort((x, y) => x.start - y.start); D().active = null; if(!Store.save()){D().workouts=before;D().active=a;toast(t('saveFailed'));return;} closeSheet(true);ui.wOpen = false; unwake(); render();
    const rankUps=StrengthRanks.summary(D().workouts).filter((r,i)=>r.tier>ranksBefore[i].tier).concat(muscleSummary().filter((g,i)=>g.tier>musclesBefore[i].tier).map(g=>({tier:g.tier,en:g.en,hu:g.hu,best:g.best?g.best.kg:0})));
    const badgeUps=Profile.summary(D().workouts,Date.now(),D().food).badges.filter(b=>b.earned&&!badgesBefore.includes(b.id));
    openSheet(shWorkout(w.id, prs, rankUps, badgeUps));
  }
  function shWorkout(id, prs, rankUps, badgeUps) {
    return () => {
      const w = D().workouts.find(x => x.id === id); if (!w) return { title: '', html: '' };
      let h = `<p class="lead">${esc(fmtDate(w.start, true))}</p><div class="kpis"><div><b>${w.tick ? IC.check : fmtDur(workoutDuration(w))}</b><i>${esc(t(w.tick ? 'tickedTag' : 'duration'))}</i></div><div><b>${setsOf(w)}</b><i>${esc(t('setsWord'))}</i></div><button class="volume-total" data-a="wk-volume" ${w.tick?'disabled':''} aria-label="${esc(t('volumeDetails'))}"><b>${volumeText(volOf(w))}</b><i>${esc(t('volume'))} kg ${IC.down}</i></button></div>`;
      h+=workoutEnergyPanel(w);
      if(!w.tick&&w.entries.length)h+=`<details class="workout-volume completion-volume" data-volume><summary>${esc(t('volumeDetails'))}${IC.down}</summary>${volumeBreakdown(w)}</details>`;
      if(badgeUps&&badgeUps.length)h+=`<section class="badge-unlocks"><h3>${esc(t('newBadges'))}</h3><div class="profile-showcase">${badgeUps.map(b=>badgeChip(b,false)).join('')}</div><button class="link" data-a="open-profile">${esc(t('chooseBadges'))}</button></section>`;
      if(rankUps&&rankUps.length)h+=`<section class="rank-unlocks"><h3>${esc(t('rankUnlocked'))}</h3>${rankUps.map(r=>`<div>${rankBadge(r.tier)}<span><b>${esc(StrengthRanks.tiers[r.tier][L()])}</b><small>${esc(r[L()])} · ${dec(r.best)} kg</small></span></div>`).join('')}<button class="link" data-a="open-ranks">${esc(t('yourRanks'))}</button></section>`;
      h += prs ? prepRow('cool', w, ` data-w="${esc(w.id)}"`) : (w.warm || w.cool ? `<p class="cap">${[w.warm ? t('warmTitle') : '', w.cool ? t('coolTitle') : ''].filter(Boolean).map(x => esc(x) + ' ✓').join(' · ')}</p>` : '');
      if (prs && prs.length) h += `<div class="tip pr"><b>${esc(t('newRecords'))}</b>${prs.map(p => `<span>${esc(itemName(p))}: ${r1(p.v)} kg${p.was ? ' (' + esc(t('was')) + ' ' + r1(p.was) + ')' : ''}</span>`).join('')}</div>`;
      if (w.tick) h += `<p class="cap">${esc(t('tickedInfo'))}</p>` + (w.pl || []).map(x => `<div class="wk-ex"><button class="exrow" data-a="ex-open" data-id="${esc(x.ex)}"><img src="${thumb(x.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(exName(x.ex))}</b><i>${x.n} ${esc(pl(x.n,'setsWord'))}</i></span>${IC.chev}</button></div>`).join('');
      // Each exercise opens to its sets one by one: set number, weight and reps (warm-up sets marked).
      h += w.entries.map(e => { let n = 0; const best = e.sets.filter(x => !x.w).reduce((m, x) => x.kg * x.reps > m.kg * m.reps ? x : m, { kg: 0, reps: 0 });
        return `<details class="wk-ex wk-sets"><summary><img src="${thumb(e.ex)}" alt="" loading="lazy" decoding="async"><span><b>${esc(itemName(e))}</b><i>${e.sets.length} ${esc(pl(e.sets.length,'setsWord'))}${best.reps ? ' · ' + esc(t('bestSet')) + ' ' + (best.kg ? dec(best.kg) + ' kg × ' : '') + best.reps : ''}</i></span>${IC.down}</summary>
          <ol class="set-list">${e.sets.map(x => `<li class="${x.w ? 'warm' : ''}"><span>${x.w ? esc(t('warmShort')) : esc(t('setN', ++n))}</span><b>${x.kg ? dec(x.kg) + ' kg' : esc(t('bodyweight'))}</b><b>× ${x.reps}</b></li>`).join('')}</ol>
          <button class="link" data-a="ex-open" data-id="${esc(e.ex)}">${esc(t('exerciseGuide'))}${IC.chev}</button></details>`; }).join('');
      const keep = w.rid || !w.entries.length ? '' : `<button class="btn" data-a="wk-to-routine" data-id="${esc(w.id)}">${esc(t('saveAsRoutine'))}</button>`;
      return { title: prs ? t('workoutDone') : shortName(w.name), html: h, foot: prs ? `<button class="btn primary" data-a="sheet-close">${esc(t('done'))}</button>${keep}` : `${keep}<button class="btn danger" data-a="wk-del" data-id="${esc(w.id)}">${esc(t('deleteWorkout'))}</button>` };
    };
  }

  /* ---------- our own database: exercises and foods the user adds ---------- */
  const picCount = () => D().myEx.filter(e => e.img).length + Object.keys(D().exMedia).filter(k => D().exMedia[k].img).length;
  const urlOk = v => /^https:\/\/[^\s"'<>]{4,300}$/.test(v);
  /* a phone photo made small enough to keep with the data: 480 px, or 340 px when that is still too heavy */
  function smallPic(file,cover=false) {
    return new Promise((ok, fail) => {
      const im = new Image(), U = window.URL || window.webkitURL, url = U.createObjectURL(file);
      im.onload = () => { let out = '';
        (cover?[[1280,.88],[1280,.8],[1024,.76],[960,.7]]:[[480,.74],[340,.7],[260,.66]]).some(([side, q]) => { const k = Math.min(1, side / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', q); return out.length <= (cover?230000:80000); });
        U.revokeObjectURL(url); if (out && out.length <= (cover?240000:90000)) ok(out); else fail(new Error('big')); };
      im.onerror = () => { U.revokeObjectURL(url); fail(new Error('image')); };
      im.src = url;
    });
  }
  const newMyEx = e => e ? { id: e.id, n: e.n, p: e.p.slice(), s: e.s.slice(), eq: e.eq, steps: (e.steps || []).join('\n'), img: e.img || '', vid: e.vid || '' } : { id: '', n: '', p: [], s: [], eq: 'other', steps: '', img: '', vid: '' };
  function shMyEx() {
    const fn = () => {
      const x = ui.myex, chips = k => `<div class="chips mus">${MUS_ORDER.map(m => `<button class="chip${x[k].indexOf(m) >= 0 ? ' on' : ''}" data-a="mx-mus" data-k="${k}" data-m="${m}" aria-pressed="${x[k].indexOf(m) >= 0}">${esc(mus(m))}</button>`).join('')}</div>`;
      return { title: t(x.id ? 'myExEdit' : 'myExNew'), html: `<p class="lead">${esc(t('myExLead'))}</p>
        <label class="fld"><span>${esc(t('name'))}</span><input type="text" data-in="mx-n" value="${esc(x.n)}" maxlength="80" autocomplete="off"></label>
        <p class="lbl">${esc(t('mxPrimary'))}</p>${chips('p')}<p class="lbl">${esc(t('mxSecondary'))}</p>${chips('s')}
        <label class="fld row"><span>${esc(t('equipment'))}</span><select data-in="mx-eq">${EQS.map(q => `<option value="${q}" ${x.eq === q ? 'selected' : ''}>${esc(eqp(q))}</option>`).join('')}</select></label>
        <label class="fld"><span>${esc(t('myExSteps'))}</span><textarea data-in="mx-steps" rows="4" maxlength="2400">${esc(x.steps)}</textarea></label>
        <label class="fld"><span>${esc(t('vidLink'))}</span><input type="text" inputmode="url" data-in="mx-vid" value="${esc(x.vid)}" placeholder="https://" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
        <p class="lbl">${esc(t('picture'))}</p>${x.img ? `<div class="mx-pic"><img src="${esc(x.img)}" alt=""><button class="link" data-a="mx-nopic">${esc(t('remove'))}</button></div>` : ''}<label class="btn">${IC.cam}${esc(t(x.img ? 'picChange' : 'picAdd'))}<input class="sr" type="file" accept="image/*" data-in="mx-file"></label>
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
        <label class="fld"><span>${esc(t('nutritionBasis'))}</span><select name="basis" data-in="mf-basis"><option value="g" ${v.basis!=='ml'?'selected':''}>100 g</option><option value="ml" ${v.basis==='ml'?'selected':''}>100 ml (1 dl)</option></select></label><div class="grid2">${fld('kcal',v.basis==='ml'?t('kcal100ml'):t('kcal100'),'decimal')}${fld('port',v.basis==='ml'?t('portionMl'):t('portionG'),'decimal')}</div><div class="grid3">${fld('p', t('protein') + ' (g)', 'decimal')}${fld('c', t('carbs') + ' (g)', 'decimal')}${fld('f', t('fat') + ' (g)', 'decimal')}</div></form>
        ${v.id ? `<button class="btn danger" data-a="mf-del" data-id="${esc(v.id)}">${esc(t('myFoodDel'))}</button>` : ''}`, foot: `<button class="btn primary" form="fmf">${esc(t('save'))}</button>` }; };
  }
  /* A plan file: the plan's routines take the place of the built-in ones, the meal plan and rules are stored; the log is not touched. */
  function applyPlan(o) {
    return Store.apply(c => {
      if (o.plan) {
        if(o.appendMeals === true && c.plan) {
          o.plan.days.forEach((day,i)=>{
            const existing=c.plan.days[i],hadMeals=existing.meals.length>0,ids=new Set(day.meals.map(m=>m.id));
            existing.meals=existing.meals.filter(m=>!ids.has(m.id)).concat(day.meals);
            // Keep existing daily targets when adding meals; replacement imports can change them.
            if(!existing.total&&!hadMeals&&day.total)existing.total=day.total;
            if(!existing.type&&day.type)existing.type=day.type;
          });
          c.plan.notes=Array.from(new Set(c.plan.notes.concat(o.plan.notes||[])));
        } else c.plan = o.plan;
      }
      if (Array.isArray(o.routines) && o.routines.length) { const ids = o.routines.map(r => r && r.id); c.routines = o.routines.concat(c.routines.filter(r => (o.appendRoutines === true || !r.builtin) && ids.indexOf(r.id) < 0)); }
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
  function dayCheck() { const d = today(); if (d !== ui.day) { if (ui.plannerDate === ui.day) ui.plannerDate=d; if (ui.foodDate === ui.day) ui.foodDate = d; if (ui.habitDate === ui.day) { if (ui.habitMonth === ui.day.slice(0, 7)) ui.habitMonth = d.slice(0, 7); ui.habitDate = d; } ui.day = d; if (!ui.sheets.length && !ui.wOpen) rerender(); } }
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
  const foodAmountText=f=>f.vml>0?dec(r1(f.vml/100))+' dl':f.g?f.g+' g':'';
  function addFood(items, src) {
    return Store.apply(d=>{const day = d.food[ui.foodDate] = d.food[ui.foodDate] || [];
    items.forEach(i => {
      const f = { id: uid(), name: String(i.name || '').trim() || t('meal'), g: Math.round(num(i.g)) || 0, kcal: Math.round(num(i.kcal)), p: r1(num(i.p)), c: r1(num(i.c)), f: r1(num(i.f)), src, t: Date.now() };
      if(d.settings.mealGroups){f.meal=mealKind(ui.foodMeal);f.mealAt=Date.now();}
      if(num(i.vml)>0&&num(i.vml)<=5000)f.vml=Math.round(num(i.vml)*100)/100;
      day.push(f);
      d.recentFoods = [{ name: f.name, g: f.g, kcal: f.kcal, p: f.p, c: f.c, f: f.f,...(f.vml?{vml:f.vml}:{}) }].concat(d.recentFoods.filter(x => x.name.toLowerCase() !== f.name.toLowerCase())).slice(0, 12);
    });
    });
  }
  function shFoodManual() {
    return () => {
      const rc = D().recentFoods, fld = (k, lbl, mode, v) => `<label class="fld"><span>${esc(lbl)}</span><input type="text" inputmode="${mode}" name="${k}" value="${esc(v == null ? '' : v)}" ${ui.manual && ui.manual.requireMacros && k !== 'g' ? 'required' : ''} autocomplete="off"></label>`;
      const v = ui.manual || {},dl=v.unit==='dl'||(!v.unit&&v.vml>0);
      return { title: t('foodOwn'), html: `${rc.length ? `<p class="cap">${esc(t('recent'))}</p><div class="chips">${rc.map((r, i) => `<button class="chip" data-a="food-recent" data-i="${i}">${esc(r.name)}</button>`).join('')}</div>` : ''}
        ${v.requireMacros ? `<p class="cap">${esc(t('recipeMissing'))}</p>` : ''}<form data-f="food-manual" id="fm"><label class="fld"><span>${esc(t('name'))}</span><input type="text" name="name" value="${esc(v.name || '')}" autocomplete="off" required></label>
        <label class="fld"><span>${esc(t('amountUnit'))}</span><select name="unit" data-in="fm-unit"><option value="g" ${!dl?'selected':''}>g</option><option value="dl" ${dl?'selected':''}>dl</option></select></label><div class="grid2">${fld('g',t(dl?'decilitres':'grams'),'decimal',dl?(v.vml?v.vml/100:v.g||''):v.g||'')}${fld('kcal','kcal','numeric',v.kcal)}</div><div class="grid3">${fld('p', t('protein') + ' (g)', 'decimal', v.p)}${fld('c', t('carbs') + ' (g)', 'decimal', v.c)}${fld('f', t('fat') + ' (g)', 'decimal', v.f)}</div>
        ${mealPicker()}<label class="sw"><input type="checkbox" role="switch" name="keep"><span>${esc(t('myFoodKeep'))}</span></label></form>`,
        foot: `<button class="btn primary" form="fm">${esc(t('addToDiary'))}</button>` };
    };
  }
  const aiNew = (mode, text) => ({ mode, imgs: [], hint: '', text: text || '', loading: false, res: null, err: null, gone: [], qa: [] });
  const AI_CHIPS = ['aiChip1', 'aiChip2', 'aiChip3', 'aiChip4', 'aiChip5', 'aiChip6', 'aiChip7', 'aiChip8'];
  function shFoodAI() {
    return () => {
      const s = ui.ai, st = D().settings, bad = st.keyState === 'bad', key = st.apiKey && !bad;
      const shots = edit => s.imgs.length ? `<div class="ai-shots${s.imgs.length < 2 ? ' one' : ''}">${s.imgs.map((x, i) => `<div class="ai-shot"><img class="ai-prev${edit ? '' : ' sm'}" src="${x.url}" alt="${esc(t('yourPhoto'))}">${edit ? `<button class="icon-btn sm" data-a="ai-rm" data-i="${i}" aria-label="${esc(t('removePhoto'))}">${IC.close}</button>` : ''}</div>`).join('')}</div>` : '';
      let h = mealPicker();
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
  const calcTargets = p => PersonalSetup.calculate(p);
  const tgOut = (c, p) => !c ? `<p class="empty">${esc(t('fillProfile'))}</p>` : c.bad ? `<p class="empty">${esc(t('tgRange'))}</p>`
    : `<div class="kpis"><div><b>${c.bmr}</b><i>${esc(t('bmr'))}</i></div><div><b>${c.tdee}</b><i>${esc(t('tdee'))}</i></div><div class="hl"><b>${c.kcal}</b><i>${esc(t('tg_' + c.goal))}</i></div></div><p class="cap">BMI ${dec(c.bmi)}${c.floored ? ' · ' + esc(t('tgFloor', c.floor)) : ''}${c.minor ? ' · ' + esc(t('tgMinor')) : ''}</p><p class="cap tg-fibre">${esc(t('tgFibre', Math.round(c.kcal * 14 / 1000)))}</p>`;
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
    const pop = ui.keyPop; ui.keyPop = false;
    if (s.apiKey && s.keyState !== 'bad')                                    // a key is saved and nothing says it is wrong: no key field at all
      return `<p class="ai-on${s.keyState === 'ok' ? (pop ? ' pop' : '') : ' wait'}">${IC.check}<span><b>${esc(t(s.keyState === 'ok' ? 'aiOn' : 'aiSaved'))}</b><i>${esc(t(s.keyState === 'ok' ? 'aiOnSub' : 'aiSavedSub'))}</i></span></p>${model}<button class="link mut" data-a="key-remove">${esc(t('keyRemove'))}</button>`;
    return (s.keyState === 'bad' ? `<div class="note warn"><b>${esc(t('keyBad'))}</b><span>${esc(t('keyBadNew'))}</span></div>` : '') +
      `<p class="cap">${esc(t('aiExplain'))}</p><label class="fld"><span>${esc(t('apiKey'))}</span><input type="password" data-in="key-draft" value="${esc(ui.keyDraft || '')}" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${ui.keyBusy ? 'disabled' : ''}></label>
      <button class="btn primary${ui.keyBusy ? ' busy' : ''}" data-a="key-save" ${ui.keyBusy || !(ui.keyDraft || '').trim() ? 'disabled' : ''}>${esc(t(ui.keyBusy ? 'keyChecking' : 'keySave'))}</button>`;
  }
  function vSettings() {
    let content = shSettingsBody()().html;
    const template=document.createElement('template');template.innerHTML=content;
    for(const card of [...template.content.children].filter(c=>c.matches('section.card'))){
      const heading=card.querySelector(':scope > h3');if(!heading)continue;
      const key=['account','appearance','workout','aiTitle','nutrition','planCard','data'].find(k=>t(k)===heading.textContent);if(!key)continue;
      const details=document.createElement('details');details.className='card settings-group';details.dataset.section='settings-'+key;details.open=['aiTitle','data'].includes(key)?ui.sections?.[details.dataset.section]===true:sectionOpen(details.dataset.section);   // rarely used groups start closed
      const summary=document.createElement('summary');summary.innerHTML=esc(heading.textContent)+IC.down;heading.remove();
      const body=document.createElement('div');body.className='section-body';body.append(...card.childNodes);details.append(summary,body);card.replaceWith(details);
    }
    content=template.innerHTML;
    return head(t('settings'),t('settingsIntro'),false,true) + `<nav class="settings-jumps" aria-label="${esc(t('settings'))}">${['appearance','workout','nutrition','data'].map(key=>`<button class="chip" data-a="settings-jump" data-v="${key}">${esc(t(key))}</button>`).join('')}</nav><div class="settings-content">${content}</div>`;
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
  const PALETTES=[[null,'paletteApricot'],[155,'paletteSage'],[250,'paletteSky'],[300,'paletteLavender'],[25,'paletteRed'],[270,'paletteRoyal'],[350,'palettePink']];
  const vividFill=h=>AccentTheme.fill(h);
  const DEF_HUE = 55;                                                                 // default apricot hue; explicitly saved hues remain unchanged
  function colorWheel(h,kind='app'){
    const a=h*Math.PI/180,gradient=Array.from({length:73},(_,i)=>'rgb('+(vividFill(i*5%360)||hueRGB(i*5,.68)).join(',')+') '+i*5+'deg').join(',');
    return `<div class="hue-wheel" role="slider" tabindex="0" aria-label="${esc(t('customAccent'))}" aria-valuemin="0" aria-valuemax="359" aria-valuenow="${h}" aria-valuetext="${h}°" style="background:conic-gradient(${gradient})"><span class="hue-wheel-preview" aria-hidden="true"><img src="icons/reppsy-192-v2.png" width="28" height="28" alt=""><b>Reppsy</b></span><span class="hue-wheel-thumb" aria-hidden="true" style="left:${50+40*Math.sin(a)}%;top:${50-40*Math.cos(a)}%"></span><input class="sr" tabindex="-1" aria-hidden="true" type="range" min="0" max="359" value="${h}" data-in="${kind==='profile'?'profile-hue':'set-hue'}"></div>`;
  }
  function applyLook() {
    const s = D().settings, e = document.documentElement;
    const light = s.bg === 'light', hue = s.hue == null ? DEF_HUE : s.hue;
    if (s.hue == null&&s.accentTone!=='vivid') ['--acc', '--acc-rgb', '--acc-ink', '--acc-tx'].forEach(k => e.style.removeProperty(k));
    else {
      const vivid=s.accentTone==='vivid';
      const c=vivid?(vividFill(s.hue)||hueRGB(hue,.68)):hueRGB(hue,light?.74:.82);
      e.style.setProperty('--acc','rgb('+c.join(',')+')');e.style.setProperty('--acc-rgb',c.join(','));e.style.setProperty('--acc-ink',AccentTheme.ink(c));
      const text=vivid?AccentTheme.text(c,light):light?hueRGB(hue,.45):c;
      e.style.setProperty('--acc-tx','rgb('+text.join(',')+')');
    }
    e.dataset.bg=s.bg;e.dataset.material='matte';
    const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', light ? '#f8f5f0' : '#14151b');
    if (s.calm) e.dataset.calm = '1'; else delete e.dataset.calm;
    if (s.solid) e.dataset.solid = '1'; else delete e.dataset.solid;
  }
  function shSettingsBody() {
    return () => {
      const s = D().settings;
      const sw = (k, lbl, attr) => `<label class="sw"><input type="checkbox" role="switch" ${attr || `data-in="set-flag" data-k="${k}"`} ${s[k] ? 'checked' : ''}><span>${esc(lbl)}</span></label>`;
      const sel = (k, lbl, opts) => `<label class="fld row"><span>${esc(lbl)}</span><select data-in="set-num" data-k="${k}">${opts.map(([v, n]) => `<option value="${v}" ${+s[k] === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
      const seg = (a, cur, opts) => `<div class="seg">${opts.map(([v, n]) => `<button class="${cur === v ? 'on' : ''}" data-a="${a}" data-v="${v}">${esc(n)}</button>`).join('')}</div>`;
      const cs = CL && CL.user ? CL.state : null, when = cs && cs.at ? new Date(cs.at).toLocaleString(L() === 'hu' ? 'hu-HU' : 'en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const account = !cs ? '' : `<section class="card"><h3>${esc(t('account'))}</h3><p class="ai-on${cs.err ? ' wait' : ''}">${IC.check}<span><b>${esc(CL.user.email)}</b><i id="sync-st">${esc(cs.err ? t('syncErr') + ' ' + t('ac_' + (I18N.en['ac_' + cs.err] ? cs.err : 'api')) : when ? t('syncedAt', when) : t('syncNever'))}</i></span></p>
          ${sw('syncKey', t('setSyncKey'))}<div class="row2"><button class="btn" data-a="sync-now">${esc(t('syncNow'))}</button><button class="btn" data-a="sign-out">${esc(t('signOut'))}</button></div><p class="cap">${esc(t('accountCap'))}</p></section>`;
      const accOff = cs || CL ? '' : `<section class="card"><h3>${esc(t('account'))}</h3><p class="cap">${esc(t('accOff'))}</p><button class="btn" data-a="acc-help">${esc(t('accHelp'))}</button></section>`;
      // Settings, simplest first: how the app looks, how workouts behave, nutrition, the AI helper, then data and rarely used actions.
      const dark = s.bg !== 'light';
      return { title: t('settings'), html: `${account}${accOff}<section class="card"><h3>${esc(t('appearance'))}</h3>
          <p class="lbl">${esc(t('language'))}</p>${seg('lang', L(), [['hu', 'Magyar'], ['en', 'English']])}
          <p class="lbl">${esc(t('theme'))}</p><div class="seg">${[['deep', t('themeDark')], ['light', t('themeLight')]].map(([v, n]) => `<button class="${(v === 'light') !== dark ? 'on' : ''}" data-a="set-bg" data-v="${v}" aria-pressed="${(v === 'light') !== dark}">${esc(n)}</button>`).join('')}</div>
          <p class="lbl">${esc(t('accent'))}</p><div class="accent-swatches">${PALETTES.map(([h,key])=>{const on=s.hue===h&&s.accentTone==='vivid';return `<button class="swatch${on?' on':''}" data-a="set-palette" data-v="${h==null?'default':h}" aria-pressed="${on}" aria-label="${esc(t(key))}" title="${esc(t(key))}" style="--swatch:${'rgb('+vividFill(h).join(',')+')'}">${on?IC.check:''}</button>`;}).join('')}</div>
          <details class="custom-accent mini-section" data-section="custom-accent" ${ui.sections?.['custom-accent']?'open':''}><summary>${esc(t('customAccent'))}${IC.down}</summary><div class="section-body">${colorWheel(s.hue==null?DEF_HUE:s.hue)}<button class="link mut" data-a="hue-reset">${esc(t('hueReset'))}</button></div></details>
          ${sw('calm', t('setCalm'))}</section>
        <section class="card"><h3>${esc(t('workout'))}</h3>${sw('restAuto', t('restAuto'), 'data-in="set-rest"')}${sw('sound', t('restSound'), 'data-in="set-sound"')}${'vibrate' in navigator ? sw('vibrate', t('setVibrate')) : ''}${sw('awake', t('setAwake'))}${sw('autofill', t('setAutofill'))}
          ${sw('stretch', t('setStretch'))}${s.stretch ? sel('hold', t('holdLbl'), [20, 30, 45].map(v => [v, v + ' ' + t('secShort')])) : ''}
          ${sel('restDefault', t('restDefault'), [60, 90, 120, 150, 180].map(v => [v, clock(v)]))}${sel('weekGoal', t('weekGoal'), [[0, t('goalOff')]].concat([2, 3, 4, 5, 6, 7].map(v => [v, v + ' ' + t('times')])))}${sel('weekStart', t('weekStartLbl'), [[1, t('monday')], [0, t('sunday')]])}</section>
        <section class="card"><h3>${esc(t('nutrition'))}</h3><button class="btn" data-a="targets">${esc(s.targets ? t('editTargets') : t('setTargets'))}</button>${sw('addActive', t('setAddActive'))}${sw('addWorkoutCalories', t('includeWorkoutEnergy'))}<p class="cap">${esc(t('energyBudgetHint'))}</p></section>
        ${D().plan ? `<section class="card"><h3>${esc(t('planCard'))}</h3><p class="cap">${esc(D().plan.name || t('mealPlan'))}</p>${sw('', t('planUseTg'), `data-in="plan-tg"${D().plan.targets ? ' checked' : ''}`)}<button class="btn" data-a="plan-notes">${esc(t('planRules'))}</button><button class="btn danger" data-a="plan-remove">${esc(t('planRemove'))}</button></section>` : ''}
        <section class="card"><h3>${esc(t('aiTitle'))}</h3>${aiCard(s)}${sw('coach', t('setCoach'))}</section>
        <section class="card"><h3>${esc(t('data'))}</h3><p class="cap">${esc(t(cs ? 'dataWhereCloud' : 'dataWhere'))}</p><div class="row2"><button class="btn" data-a="export">${esc(t('export'))}</button><label class="btn">${esc(t('import'))}<input class="sr" type="file" accept="application/json,.json" data-in="import"></label></div>
          <button class="btn" data-a="pdf-plan">${esc(t('addPlan'))}</button><div class="row2"><button class="btn" data-a="mx-new">${IC.plus}${esc(t('myExBtn'))}</button><button class="btn" data-a="mf-new">${IC.plus}${esc(t('myFoodBtn'))}</button></div>
          <details class="mini-section" data-section="data-more" ${ui.sections?.['data-more']?'open':''}><summary>${esc(t('moreOptions'))}${IC.down}</summary><div class="section-body"><button class="btn" data-a="export-plan">${esc(t('exportPlan'))}</button><button class="btn" data-a="export-csv">${esc(t('exportCsv'))}</button><button class="btn" data-a="reset-routines">${esc(t('resetRoutines'))}</button><button class="btn danger" data-a="wipe">${esc(t('wipe'))}</button></div></details></section>
        <footer class="app-info"><p>${esc(t('appName'))} ${esc(releaseText())}</p><button class="link" data-a="release-notes">${esc(t('whatsNew'))}</button><button class="link" data-a="shortcut-help">${esc(t('shortcutTitle'))}</button></footer>` };
    };
  }
  /* shown only from the note an iPhone user sees in Safari before the app is on the Home Screen */
  function shInstall() { return () => ({ title: t('installTitle'), html: `<ol class="steps">${[1, 2, 3, 4].map(i => `<li>${esc(t('install' + i))}</li>`).join('')}</ol><h3>${esc(t('shortcutTitle'))}</h3><p class="cap">${esc(t('shortcutIOS'))}</p><button class="btn" data-a="export">${esc(t('shortcutBackup'))}</button>` }); }
  function shAccHelp() { return () => ({ title: t('account'), html: `<p class="lead">${esc(t('accHelpLead'))}</p><ol class="steps">${[1, 2, 3, 4, 5].map(i => `<li>${esc(t('accStep' + i))}</li>`).join('')}</ol><p class="cap">${esc(t('accHelpCap'))}</p>` }); }
  async function saveFile(name, blob) {
    try { const f = new File([blob], name, { type: blob.type }); if (isIOS && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    // Everything outside an open modal panel is inert, so the download link must live inside it to work.
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.hidden = true; ([...document.querySelectorAll('dialog[open]')].pop() || document.body).appendChild(a); a.click(); a.remove(); toast(t('exported'));
  }
  function exportCSV() {
    const rows = [['date', 'workout', 'exercise', 'set', 'kg', 'reps', 'warmup']];
    D().workouts.forEach(w => w.entries.forEach(e => e.sets.forEach((x, j) => rows.push([ymd(w.start), w.name, itemName(e), j + 1, x.kg, x.reps, x.w ? 1 : 0]))));
    const cell = v => { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };     // a name can never be read as a formula by a spreadsheet
    saveFile('reppsy-workouts-' + today() + '.csv', new Blob(['\ufeff' + rows.map(r => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv' }));
  }
  function exportData() { saveFile('reppsy-backup-' + today() + '.json', new Blob([Store.exportJSON()], { type: 'application/json' })); }

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
      let h = `<h3>${esc(t('workoutsDay'))}</h3>` + (ws.length ? ws.map(w => `<button class="wrow" data-a="wk-open" data-id="${esc(w.id)}"><span class="q-ic line">${IC.home}</span><span class="wr-t"><b>${esc(shortName(w.name))}</b><i>${pad(new Date(w.start).getHours())}:${pad(new Date(w.start).getMinutes())} · ${esc(wMeta(w))}</i></span>${IC.chev}</button>`).join('') : `<p class="empty">${esc(t('noWorkoutDay'))}</p>`);
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
        <details class="card activity-help"><summary>${esc(t('actHow'))}${IC.down}</summary><ol class="steps">${[1, 2, 3, 4, 5, 6].map(i => `<li>${esc(t('actHow' + i))}</li>`).join('')}</ol><p class="cap">${esc(t('actHowCap'))}</p></details>
        <p class="cap">${esc(t('manualEnergyHint'))}</p><label class="sw"><input type="checkbox" role="switch" data-in="set-flag" data-k="addActive" ${D().settings.addActive ? 'checked' : ''}><span>${esc(t('setAddActive'))}</span></label>`,
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
    out.push(fl.length ? 'Eaten today so far: ' + Math.round(tot.kcal) + ' kcal, protein ' + Math.round(tot.p) + ' g, carbs ' + Math.round(tot.c) + ' g, fat ' + Math.round(tot.f) + ' g. Items: ' + fl.slice(0, 15).map(f => f.name + (foodAmountText(f)?' '+foodAmountText(f):'') + ' (' + Math.round(f.kcal) + ' kcal, protein ' + Math.round(f.p) + ' g)').join('; ') + '.' : 'Nothing is logged in the food diary today.');
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
  function refreshBrandMetadata() {
    document.title = t('appName');
    const apple = document.querySelector('meta[name="apple-mobile-web-app-title"]'); if (apple) apple.content = t('appName');
    // A cached older HTML shell may still reference the old brand's icon files.
    for (const [rel, path] of [['apple-touch-icon','icons/reppsy-apple-180-v2.png'],['icon','icons/reppsy-192-v2.png'],['manifest','manifest.webmanifest']]) {
      let link = document.querySelector('link[rel="' + rel + '"]');
      if (!link) { link = document.createElement('link'); link.rel = rel; document.head.append(link); }
      if (link.getAttribute('href') !== path) link.href = path;
    }
  }

  const setupState = () => ui.gate.setup || (ui.gate.setup = PersonalSetup.fresh());
  function setupCapture(values) {
    const draft = setupState();
    ['sex','goal','age','height','weight','activity'].forEach(k => { if (values[k] != null) draft.profile[k] = String(values[k]).trim().slice(0, 12); });
    return draft;
  }
  function setupView() {
    const draft = setupState(), p = draft.profile, step = draft.step;
    const headings = ['setupGoal','setupBody','setupActivity','setupReady'];
    const descriptions = ['setupGoalHint','setupBodyHint','setupActivityHint','setupReadyHint'];
    const option = (key, value, label, hint) => `<label class="setup-choice"><input type="radio" name="${key}" data-in="setup-field" data-k="${key}" value="${value}" ${String(p[key]) === String(value) ? 'checked' : ''}><span><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</span>${IC.check}</label>`;
    let body = '';
    if (step === 0) body = `<fieldset class="setup-options"><legend class="sr">${esc(t('goal'))}</legend>${['cut','maintain','bulk'].map(v => option('goal', v, t(v), t('setup_' + v))).join('')}</fieldset>`;
    if (step === 1) {
      const field = (key, label, unit, min, max) => `<label class="fld"><span>${esc(label)}${unit ? ' · ' + unit : ''}</span><input type="text" inputmode="${key === 'age' ? 'numeric' : 'decimal'}" name="${key}" data-in="setup-field" data-k="${key}" value="${esc(p[key])}" autocomplete="off" maxlength="8" aria-describedby="setup-error" placeholder="${min}–${max}" required></label>`;
      body = `<fieldset class="setup-options setup-sex"><legend>${esc(t('sex'))}</legend>${option('sex', 'f', t('female'))}${option('sex', 'm', t('male'))}</fieldset><div class="grid2">${field('age', t('age'), '', 14, 100)}${field('height', t('height'), '', 120, 230)}</div>${field('weight', t('bodyweight'), 'kg', 30, 300)}`;
    }
    if (step === 2) body = `<fieldset class="setup-options"><legend class="sr">${esc(t('activity'))}</legend>${ACT.map(([v, key], i) => option('activity', v, t('setupAct' + (i + 1)), t(key))).join('')}</fieldset>`;
    if (step === 3) {
      const c = calcTargets(p);
      if (!c || c.bad || !PersonalSetup.normalize(p)) { draft.step = 1; ui.gate.err = t('setupBodyError'); return setupView(); }
      body = `<section class="setup-result"><small>${esc(t('tg_' + c.goal))}</small><strong>${compact(c.kcal)} <span>kcal</span></strong><p>${esc(t('setupPerDay'))}</p><div class="setup-macros">${[['p','protein'],['c','carbs'],['f','fat']].map(([k,label]) => `<div><small>${esc(t(label))}</small><b>${c[k]} g</b></div>`).join('')}</div></section><p class="cap">${esc(t('setupEstimate'))}${c.minor ? ' ' + esc(t('tgMinor')) : ''}${c.floored ? ' ' + esc(t('tgFloor', c.floor)) : ''}</p>`;
    }
    return `<div class="setup-progress" aria-label="${esc(t('setupStep', step + 1, 4))}">${headings.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div><small class="eyebrow">${esc(t('setupStep', step + 1, 4))}</small><h2 class="setup-title" tabindex="-1">${esc(t(headings[step]))}</h2><p class="setup-intro">${esc(t(descriptions[step]))}</p>${body}<div id="setup-error" ${ui.gate.err ? 'class="note warn" role="alert"' : ''}>${ui.gate.err ? esc(ui.gate.err) : ''}</div><div class="setup-actions">${step > 0 ? `<button type="button" class="btn" data-a="setup-back">${esc(t('back'))}</button>` : ''}<button class="btn primary" type="submit">${esc(t(step === 3 ? 'setupCreateAccount' : 'next'))}${IC.chev}</button></div><button type="button" class="link setup-signin" data-a="gate-mode" data-v="in">${esc(t('backToSignIn'))}</button>`;
  }
  function setupSubmit(values) {
    const draft = setupCapture(values), p = draft.profile;
    const error = draft.step === 0 && !['cut','maintain','bulk'].includes(p.goal) ? 'setupGoalError' : draft.step === 1 && !PersonalSetup.bodyValid(p) ? 'setupBodyError' : draft.step === 2 && !ACT.some(([v]) => v === +p.activity) ? 'setupActivityError' : '';
    if (error) { ui.gate.err = t(error); renderGate(); return; }
    ui.gate.err = ''; draft.step = Math.min(4, draft.step + 1); renderGate();
    const title = $('#gate .setup-title'); if (title) title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function adoptRegistrationProfile() {
    const s = D().settings, profile = PersonalSetup.normalize(CL && CL.user && CL.user.setup);
    const handle=CL?.user?.username;if(handle&&!s.publicProfile?.username&&D().epoch===0)Store.apply(doc=>{doc.settings.publicProfile=Profile.clean({...doc.settings.publicProfile,username:handle});});
    if (!profile || s.onboardingVersion === 1 || D().epoch > 0) return false;
    // Synced targets and existing personal settings take precedence over the initial signup draft.
    const hasProfile = !!(s.profile.age || s.profile.height || s.profile.weight || s.targets);
    const c = calcTargets(profile);
    const saved = Store.apply(doc => {
      if (!hasProfile) { doc.settings.profile = profile; doc.settings.targets = { kcal: c.kcal, p: c.p, c: c.c, f: c.f }; }
      doc.settings.onboardingVersion = 1;
    });
    if (!saved) { toast(t('saveFailed')); return false; }
    if (!hasProfile) { ui.tab = 'profile'; toast(t('setupSaved', compact(c.kcal))); }
    return !hasProfile;
  }

  function renderGate() {
    const g = $('#gate'); if (!g) return;
    const need = !!CL && (!CL.user || ui.gate.mode === 'newpw');
    document.body.classList.toggle('gated', need); g.hidden = !need; if (!need) { g.innerHTML = ''; return; }
    document.documentElement.lang = L();
    const s = ui.gate, m = s.mode;
    if (m === 'up' && setupState().step < 4) {
      g.innerHTML = `<form class="gate-in setup-in" data-f="gate-setup" novalidate><div class="setup-brand"><img src="icons/reppsy-192-v2.png" alt=""><b>${esc(t('appName'))}</b></div>${setupView()}<div class="seg lang"><button type="button" class="${L() === 'hu' ? 'on' : ''}" data-a="gate-lang" data-v="hu">Magyar</button><button type="button" class="${L() === 'en' ? 'on' : ''}" data-a="gate-lang" data-v="en">English</button></div></form>`; g.scrollTop = 0; return;
    }
    g.innerHTML = `<form class="gate-in" data-f="gate" novalidate><div class="gate-logo brand-logo"><img src="icons/reppsy-192-v2.png" alt=""></div><h1>${esc(t('appName'))}</h1><p class="lead">${esc(t('gate_' + m))}</p>
      ${m === 'in' || m === 'up' ? `<div class="seg"><button type="button" class="${m === 'in' ? 'on' : ''}" data-a="gate-mode" data-v="in">${esc(t('signIn'))}</button><button type="button" class="${m === 'up' ? 'on' : ''}" data-a="gate-mode" data-v="up">${esc(t('signUp'))}</button></div>` : ''}
      ${s.err ? `<div class="note warn" role="alert"><b>${esc(s.err)}</b></div>` : ''}${s.info ? `<div class="note" role="status"><b>${esc(s.info)}</b></div>` : ''}
      ${m === 'up' ? `<div class="setup-account-summary"><span>${esc(t('setupYourTarget'))}<b>${compact(calcTargets(setupState().profile).kcal)} kcal</b></span><button type="button" class="link" data-a="setup-edit">${esc(t('edit'))}</button></div>` : ''}
      ${m==='up'?`<label class="fld"><span>${esc(t('username'))}</span><input name="username" data-in="gate-username" value="${esc(s.username||'')}" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" autocomplete="nickname" autocapitalize="none" spellcheck="false" required><small>${esc(t('usernameRule'))}</small></label>`:''}
      ${m !== 'newpw' ? `<label class="fld"><span>${esc(t('email'))}</span><input type="email" name="email" value="${esc(s.email)}" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="email" required></label>` : ''}
      ${m !== 'forgot' ? `<label class="fld"><span>${esc(t(m === 'newpw' ? 'newPassword' : 'password'))}</span><input type="password" name="password" autocomplete="${m === 'in' ? 'current-password' : 'new-password'}" minlength="8" required></label>` : ''}
      ${m === 'up' || m === 'newpw' ? `<p class="cap">${esc(t('pwRule'))}</p>` : ''}
      <button class="btn primary big${s.busy ? ' busy' : ''}" ${s.busy ? 'disabled' : ''}>${esc(t({ in: 'signIn', up: 'signUp', forgot: 'sendReset', newpw: 'savePassword' }[m]))}</button>
      ${m === 'in' ? `<button type="button" class="link" data-a="gate-mode" data-v="forgot">${esc(t('forgot'))}</button>` : ''}${m === 'forgot' ? `<button type="button" class="link" data-a="gate-mode" data-v="in">${esc(t('backToSignIn'))}</button>` : ''}
      <p class="cap">${esc(t('gateCap'))}</p><div class="seg lang"><button type="button" class="${L() === 'hu' ? 'on' : ''}" data-a="gate-lang" data-v="hu">Magyar</button><button type="button" class="${L() === 'en' ? 'on' : ''}" data-a="gate-lang" data-v="en">English</button></div></form>`;
    g.scrollTop = 0;
  }
  /* a session exists: make sure the data on this device belongs to that account, then bring both sides up to date */
  async function signedIn() {
    const u = CL && CL.user; if (!u) return;
    let d = D();
    if (d.owner && d.owner !== u.id) { rideEnd(false); Store.wipe(); d = D(); ui.wOpen = false; ui.foodDate = today(); ui.coach = newCoach(); }      // another person's data is never mixed in
    if (d.owner !== u.id) Store.stamp(u.id, d.workouts.length > 0 || Object.keys(d.food).length > 0 || d.body.length > 0 || !!d.settings.targets);
    applyLook(); await doSync(true); adoptRegistrationProfile(); renderGate(); render();
  }
  function upgradeStarterSessions(){
    const before=D().routines,after=RoutineTemplates.upgradeRoutines(before);
    if(after===before)return false;
    D().routines=after;
    if(!Store.save()){D().routines=before;return false;}
    return true;
  }
  let syncT = 0;
  async function doSync(loud) {
    if (!CL || !CL.user) return;
    try {
      const r = await CL.sync();
      const upgraded=(r==='changed'||r==='ok')&&upgradeStarterSessions();
      if (r === 'changed'||upgraded) { hRef = null; applyLook(); if (!ui.sheets.length && !ui.wOpen) rerender(); else ui.stale = true; }
    } catch (e) {
      if (e.code === 'auth') { ui.gate = { mode: 'in', email: (e.user && e.user.email) || ui.gate.email, busy: false, err: '', info: t('sessionOver') }; closeSheet(true); renderGate(); return; }   // signed out elsewhere or the session ran out: the data stays, sign in again
    }
    if (loud && topIs('settings')) refreshSheet();
  }
  const syncSoon = () => { if (!CL || !CL.user) return; clearTimeout(syncT); syncT = setTimeout(() => doSync(false), 2500); };
  async function gateSubmit(v) {
    const s = ui.gate, email = String(v.email || '').trim().toLowerCase(), pw = String(v.password || ''); if (s.busy || !CL) return;
    s.info = '';
    if(s.mode==='up'){s.username=String(v.username||'').trim().toLowerCase();if(!/^[a-z0-9_]{3,24}$/.test(s.username)){s.err=t('usernameRule');renderGate();return;}}
    if (s.mode === 'up' && (!s.setup || s.setup.step !== 4 || !PersonalSetup.normalize(s.setup.profile))) { setupState().step = 0; renderGate(); return; }
    if (s.mode !== 'newpw') { s.email = email; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { s.err = t('ac_email'); renderGate(); return; } }
    if (s.mode !== 'forgot' && pw.length < 8) { s.err = t('ac_weak'); renderGate(); return; }
    s.busy = true; s.err = ''; renderGate();
    try {
      if (s.mode === 'forgot') { await CL.recover(email); s.info = t('resetSent'); s.mode = 'in'; }
      else if (s.mode === 'newpw') { await CL.setPassword(pw); s.mode = 'in'; toast(t('pwSaved')); }
      else if (s.mode === 'up') { if (await CL.signUp(email, pw, PersonalSetup.normalize(s.setup.profile),s.username) !== 'in') { s.info = t('confirmSent'); s.mode = 'in'; } }
      else await CL.signIn(email, pw);
    } catch (e) { if(e.code==='usernameTaken'||e.code==='socialSetup')s.err=t(e.code);else s.err = t('ac_' + (AC_CODES.indexOf(e.code) >= 0 ? e.code : 'api')) + (AC_CODES.indexOf(e.code) < 0 && e.message ? ' (' + String(e.message).slice(0, 120) + ')' : ''); }
    s.busy = false; if (CL.user && s.mode !== 'newpw') await signedIn(); else renderGate();
  }

  /* ================= ACTIONS ================= */
  const A = {
    'energy-history'() {closeSheet(true);ui.tab='home';ui.workout='history';render();},
    'cardio-add'(el) {openCardio(el.dataset.target);},
    'energy-edit'(el) {openEnergy(el.dataset.id);},
    'energy-skip'() {finishWorkout(null,true);},
    'cardio-remove'(el) {
      const target=el.dataset.target,w=target==='active'?D().active:D().workouts.find(w=>w.id===target);if(!w||!confirm(t('cardioRemoveConfirm')))return;
      const before=w.cardio||[],next=before.filter(c=>c.id!==el.dataset.id);if(next.length===before.length)return;
      if(target!=='active'&&!w.entries.length&&!next.length){if(!Store.apply(d=>{d.workouts=d.workouts.filter(x=>x.id!==target);})){toast(t('saveFailed'));return;}closeSheet(true);rerender();return;}
      const at=w.cardioAt;w.cardio=next;w.cardioAt=Date.now();if(!Store.save()){w.cardio=before;w.cardioAt=at;return;}if(ui.sheets.length)refreshSheet();rerender();
    },
    'pdf-plan'() {
      if (!document.querySelector('link[href="css/plan-import.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/plan-import.css'; document.head.append(style); }
      PlanImport.open({ lang: L(), hasMealPlan: !!D().plan, restDefault: D().settings.restDefault,
        catalog: Object.values(EX).map(e => ({ id: e.id, hu: HU_NAME[e.id] || (EXHU[e.id] && EXHU[e.id][0]) || e.n, en: e.n, aliases: [e.id, (EXHU[e.id] || [])[0], (PLAN_BY_EX[e.id] || {}).en, (PLAN_BY_EX[e.id] || {}).hu].filter(Boolean) })),
        onExport: plan => saveFile('GymApp-terv.json', new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })),
        onOpen: tab => { ui.tab=tab;if(tab==='home')ui.workout='plans';if(tab==='food')ui.food='plan';render(); },
        onApply: plan => {
          const newRoutines=plan.routines.filter(r=>!D().routines.some(x=>x.id===r.id)).length;
          if (D().routines.length + newRoutines > 100) throw new Error(t('routineImportLimit'));
          if(plan.plan&&plan.appendMeals&&D().plan&&plan.plan.days.some((d,i)=>D().plan.days[i].meals.filter(m=>!d.meals.some(n=>n.id===m.id)).length+d.meals.length>10)) throw new Error(t('mealImportLimit'));
          const saved = applyPlan(plan);
          if(!saved)return false;
          ui.foodDate=today();closeSheet(true);render();return true;
        }
      });
    },
    'planner-new'(el){
      const k=DailyPlanner.validDay(el.dataset.d)?el.dataset.d:ui.plannerDate,kind=DailyPlanner.categories.includes(el.dataset.kind)?el.dataset.kind:'other';
      const start=new Date(k+'T00:00'),now=new Date();let minute=el.dataset.minute!==undefined?+el.dataset.minute:Math.min(22*60,Math.ceil((now.getHours()*60+now.getMinutes())/30)*30);
      if(!Number.isFinite(minute))minute=9*60;start.setMinutes(Math.max(0,Math.min(1439,minute)));
      ui.plannerDraft={id:'pe_'+uid(),title:kind==='other'?'':t('plannerKind_'+kind),start:+start,end:+start+36e5,allDay:false,category:kind,repeat:'none',note:'',done:{}};
      ui.plannerEditDay=k;openSheet(shPlannerEvent());
    },
    'planner-edit'(el){const e=D().planner.events.find(e=>e.id===el.dataset.id);if(!e)return;ui.plannerDraft={...e,existing:true};ui.plannerEditDay=el.dataset.d||ui.plannerDate;openSheet(shPlannerEvent());},
    'planner-delete'(el){const e=D().planner.events.find(e=>e.id===el.dataset.id);if(!e||e.source)return;if(e.repeat!=='none'&&!confirm(t('plannerDeleteSeries')))return;if(plannerCommit({...D().planner,events:D().planner.events.filter(x=>x.id!==e.id)})){closeSheet();rerender();}},
    'planner-done'(el){const k=el.dataset.d,e=D().planner.events.find(e=>e.id===el.dataset.id);if(!e||!DailyPlanner.validDay(k))return;const next={...e,done:{...e.done,[k]:{value:!e.done[k]?.value,at:Date.now()}}};if(plannerCommit({...D().planner,events:D().planner.events.map(x=>x.id===e.id?next:x)})){if(el.dataset.close)closeSheet();rerender();}},
    'planner-day'(el){if(!DailyPlanner.validDay(el.dataset.d))return;ui.plannerDate=el.dataset.d;ui.plannerScroll=null;ui.plannerScrollX=null;go('tab',render);},
    'planner-shift'(el){ui.plannerDate=Momentum.shift(ui.plannerDate,+el.dataset.d);ui.plannerScroll=null;ui.plannerScrollX=null;go('tab',render);},
    'planner-today'(){ui.plannerDate=today();ui.plannerScroll=null;ui.plannerScrollX=null;go('tab',render);},
    'planner-view'(el){if(!['day','week'].includes(el.dataset.v))return;ui.plannerView=el.dataset.v;ui.plannerScrollX=null;rerender();},
    'planner-calendar'(){ui.calendarError='';openSheet(shPlannerCalendars());},
    'planner-sync-one'(el){syncCalendars(true,el.dataset.id);},
    'planner-disconnect'(el){if(!confirm(t('plannerDisconnectConfirm')))return;const id=el.dataset.id;if(plannerCommit({sources:D().planner.sources.filter(s=>s.id!==id),events:D().planner.events.filter(e=>e.source!==id)})){const links=calendarLinks();delete links[id];saveCalendarLinks(links);ui.calendarStatus='';refreshSheet();rerender();}},
    'goals-view'(el) {if(!['planner','habits','progress'].includes(el.dataset.v))return;go('tab',()=>{ui.goals=el.dataset.v;render();if(ui.goals==='planner')syncCalendars(false);});},
    'profile-view'(el) {if(!['overview','ranks','friends'].includes(el.dataset.v))return;go('tab',()=>{ui.profilePage=el.dataset.v;render();if(ui.profilePage==='friends')loadSocial();});},
    'open-profile'() {closeSheet(true);ui.tab='profile';render();loadSocial();},
    'profile-home'(){go('tab',()=>{ui.tab='profile';ui.profilePage='overview';render();});if(CL&&CL.user)loadSocial();},
    'profile-edit'() {ui.profileStyleDraft=profileStyle();ui.profileDraft=profileLocal();ui.profileError='';ui.profileBusy=false;openSheet(shProfileEdit());},
    'profile-color'(el) {ui.profileDraft.theme=el.dataset.v;ui.profileStyleDraft.useAccent=false;refreshSheet();},
    'profile-style-choice'(el){ui.profileStyleDraft[el.dataset.k]=el.dataset.v;refreshSheet();},
    'profile-photo-view'(el) {
      const img=el.querySelector('img');if(!img)return;
      const src=img.getAttribute('src'),label=img.getAttribute('alt')||t('tabProfile'),owner=CL?.user?.id;
      if(!Profile.clean({avatar:src}).avatar)return;
      const target=topIs('friend-profile')?ui.friendProfile?.user_id:null,canLike=target&&target!==owner&&ui.friendActivity&&ui.friendProfile.avatar===src;
      const fn=()=>({title:label,html:`<figure class="profile-photo-view" ${canLike?`data-photo-like="${esc(target)}" data-photo-owner="${esc(owner)}"`:''}><img src="${esc(src)}" alt="${esc(label)}" draggable="false"><span class="photo-like-burst" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${Stories.HEART}"/></svg></span></figure>${canLike?`<button class="btn photo-view-like like-pill${ui.friendActivity?.liked?' on':''}" data-a="photo-like" data-id="${esc(target)}" aria-pressed="${!!ui.friendActivity?.liked}" ${ui.communityBusy?'disabled':''}>${likeIcon()}<span class="photo-like-count">${compact(ui.friendActivity?.likes||0)}</span><span class="like-label">${esc(t(ui.friendActivity?.liked?'unlikePhoto':'likePhoto'))}</span></button>`:''}`});fn.kind='profile-photo';openSheet(fn);
    },
    async 'photo-double-like'(el){
      const target=el.dataset.photoLike,src=el.querySelector('img')?.getAttribute('src');
      if(!topIs('profile-photo')||!target||CL?.user?.id!==el.dataset.photoOwner||ui.friendProfile?.user_id!==target||ui.friendProfile.avatar!==src||ui.communityBusy)return;
      if(!ui.friendActivity?.liked&&!await communityAction('social_photo_like',{p_user:target,p_like:true}))return;
      const figure=$('.profile-photo-view[data-photo-like]');if(!figure||figure.dataset.photoLike!==target)return;
      figure.classList.remove('like-pop');void figure.offsetWidth;figure.classList.add('like-pop');
    },
    'cover-photo-remove'(){ui.profileDraft.coverPhoto='';if(ui.profileStyleDraft.cover==='photo')ui.profileStyleDraft.cover='glow';refreshSheet();},
    'profile-photo-remove'() {ui.profileDraft.avatar='';refreshSheet();},
    'profile-ranks'() {go('tab',()=>{ui.profilePage='ranks';render();});},
    'profile-food'() {ui.tab='food';ui.food='diary';ui.foodDate=today();render();},
    'profile-badges'() {openSheet(shBadges());},
    async 'profile-badge'(el) {
      const id=el.dataset.id;if(!Profile.summary(D().workouts,Date.now(),D().food).badges.some(b=>b.id===id&&b.earned))return;
      const p=profileLocal(),earned=Profile.summary(D().workouts,Date.now(),D().food).badges.filter(b=>b.earned).map(b=>b.id);
      p.showcase=p.showcase.filter(x=>earned.includes(x));if(p.showcase.includes(id))p.showcase=p.showcase.filter(x=>x!==id);
      else {if(p.showcase.length>=4){toast(t('badgeLimit'));return;}p.showcase.push(id);}
      const before=D().settings.publicProfile;D().settings.publicProfile=p;
      if(!Store.save()){D().settings.publicProfile=before;toast(t('saveFailed'));return;}
      refreshSheet();rerender();
      if(CL&&CL.user&&p.username){try{await Social.publish(p);await Social.refresh();}catch(error){Social.state.error=Social.message(error);}if(ui.tab==='profile')rerender();}
    },
    'social-refresh'() {loadSocial(true);},
    'story-own'(el){const g=Stories.ownGroup();if(g)openStories([g],0,el.querySelector('.story-face,.profile-avatar')||el);else startCompose('story');},
    'story-open'(el){const groups=(Stories.state.feed||[]).filter(g=>g.user&&g.user.user_id!==me()),i=groups.findIndex(g=>g.user.user_id===el.dataset.id);if(i>=0)openStories(groups,i,el.querySelector('.story-face')||el);},
    'story-user'(el){const groups=storyGroupsFor(el.dataset.id);if(groups.length)openStories(groups,0,el.querySelector('.story-face,.profile-avatar')||el);},
    'highlight-open'(el){const uid=el.dataset.u,m=Stories.state.media[uid],h=m?.highlights?.find(x=>x.id===el.dataset.id);if(!h)return;if(!h.items.length){if(uid===me())openHighlightEditor(h.id);return;}Stories.open([{user:m.user,own:uid===me(),highlight:{id:h.id,name:h.name},items:h.items}],0,0,el.querySelector('.story-face')||el);},
    'highlight-new'(){openHighlightEditor(null);},
    compose(el){startCompose(el.dataset.v);},
    'compose-kind'(el){const c=ui.compose;if(!c||c.busy)return;c.kind=el.dataset.v==='post'?'post':'story';c.error='';refreshSheet();},
    'compose-audience'(el){const c=ui.compose;if(!c||c.busy||!Stories.AUDIENCES.includes(el.dataset.v))return;c.audience=el.dataset.v;refreshSheet();},
    'compose-hours'(el){const c=ui.compose,h=+el.dataset.v;if(!c||c.busy||!Stories.DURATIONS.includes(h))return;c.hours=h;refreshSheet();},
    async 'compose-share'(){const c=ui.compose;if(!c||c.busy||!c.image)return;c.busy=true;c.error='';refreshSheet();let ok=false;try{await Stories.create(c);ok=true;}catch(e){c.error=Stories.message(e);}finally{c.busy=false;}if(ui.compose!==c)return;if(ok){ui.compose=null;if(topIs('compose'))closeSheet();toast(t(c.kind==='story'?'storyShared':'postShared'));if(ui.tab==='profile')rerender();if(topIs('highlight')){Stories.state.archive=null;Stories.archive().then(()=>{if(topIs('highlight'))refreshSheet();}).catch(()=>{});}}else if(topIs('compose'))refreshSheet();},
    'feed-more'(){Stories.more();rerender();},
    'post-like'(el){likePost(el.dataset.id,null,el);},
    'post-open'(el){if(!Stories.find(el.dataset.id))return;ui.postId=el.dataset.id;ui.postEdit=null;ui.postConfirm='';openSheet(shPost());},
    'post-likers'(el){openLikers(el.dataset.id);},
    'post-audience'(el){const p=Stories.find(ui.postId);if(!p||!Stories.AUDIENCES.includes(el.dataset.v))return;ui.postEdit={open:true,caption:ui.postEdit?.caption??p.caption,audience:el.dataset.v};refreshSheet();},
    async 'post-save'(el){const p=Stories.find(el.dataset.id);if(!p||ui.postBusy)return;const e=ui.postEdit||{};ui.postBusy=true;refreshSheet();try{await Stories.update(p.id,e.caption??p.caption,e.audience||p.audience);ui.postEdit={open:true};toast(t('saved'));}catch(er){toast(t(Stories.message(er)));}finally{ui.postBusy=false;if(topIs('post'))refreshSheet();}},
    async 'post-delete'(el){const id=el.dataset.id;if(ui.postBusy)return;if(ui.postConfirm!==id){ui.postConfirm=id;ui.postEdit={...(ui.postEdit||{}),open:true};refreshSheet();return;}ui.postBusy=true;refreshSheet();let ok=false;try{await Stories.remove(id);ok=true;}catch(er){toast(t(Stories.message(er)));}finally{ui.postBusy=false;}ui.postConfirm='';if(ok){if(topIs('post'))closeSheet();toast(t('postDeleted'));if(ui.tab==='profile')rerender();}else if(topIs('post'))refreshSheet();},
    'user-open'(el){openUser(el.dataset.id);},
    'hl-pick'(el){const h=ui.hl;if(!h||h.busy)return;const id=el.dataset.id,k=h.items.indexOf(id);if(k>=0)h.items.splice(k,1);else if(h.items.length<100)h.items.push(id);h.error='';refreshSheet();},
    async 'hl-delete'(){const h=ui.hl;if(!h||!h.id||h.busy)return;if(!h.confirm){h.confirm=true;refreshSheet();return;}h.busy=true;refreshSheet();try{await Stories.deleteHighlight(h.id);if(ui.hl===h){ui.hl=null;if(topIs('highlight'))closeSheet();}toast(t('highlightDeleted'));if(ui.tab==='profile')rerender();}catch(e){h.error=Stories.message(e);h.busy=false;if(topIs('highlight'))refreshSheet();}},
    'friend-search-open'(){ui.friendError='';ui.friendNotice='';openSheet(shFriendSearch());},
    'friend-discovery'(){const fn=()=>({title:t('contactDiscovery'),html:contactDiscovery(true)});fn.kind='discovery';openSheet(fn);},
    'friend-options'(el){const friend=Social.state.data?.friends?.find(f=>f.user_id===el.dataset.id);if(!friend)return;const fn=()=>({title:'@'+friend.username,html:`<button class="btn danger" data-a="friend-remove" data-id="${esc(friend.user_id)}">${esc(t('removeFriend'))}</button>`});fn.kind='friend-options';openSheet(fn);},
    'phone-restart'() {ui.pendingPhone='';if(topIs('discovery'))refreshSheet();rerender();},
    'friend-respond'(el) {socialAction('social_respond_friend',{p_request:el.dataset.id,p_accept:el.dataset.accept==='true'});},
    'friend-remove'(el) {if(confirm(t('removeFriendConfirm')))socialAction('social_remove_friend',{p_other:el.dataset.id});},
    async 'friend-profile'(el) {
      const owner=CL?.user?.id;
      try{const r=await Social.mutate('social_view_profile',{p_user:el.dataset.id});if(CL?.user?.id!==owner)return;ui.friendProfile=r;ui.reviewDraft=null;ui.friendActivity=null;ui.friendActivityError='';try{ui.friendActivity=await Social.mutate('social_profile_activity',{p_user:el.dataset.id});}catch(e){ui.friendActivityError=Social.message(e);}if(CL?.user?.id===owner)openSheet(shFriend());}catch(e){toast(t(Social.message(e)));}
    },
    'photo-like'(el){communityAction('social_photo_like',{p_user:el.dataset.id,p_like:!ui.friendActivity?.liked});},
    'review-open'(el){const target=el.dataset.id;if(ui.communityBusy||!target||ui.friendProfile?.user_id!==target||target===CL?.user?.id)return;const saved=ui.friendActivity?.reviews?.find(r=>r.author===CL?.user?.id);ui.reviewDraft={target,rating:saved?.rating||5,body:saved?.body||'',edit:!!saved};ui.reviewError='';openSheet(shReviewEditor());},
    'review-rating'(el){if(!ui.reviewDraft||ui.communityBusy)return;ui.reviewDraft.rating=Math.max(1,Math.min(5,+el.dataset.v));refreshSheet();},
    'review-remove'(el){const own=!topIs('friend-profile')||ui.friendProfile?.user_id===CL?.user?.id;communityAction('social_review_remove',{p_review:el.dataset.id},own);},
    'manage-sharing'(){if(!Social.state.activity){toast(t(Social.state.activityError||'socialSignIn'));return;}openSheet(shSharing());},
    'routine-share'(el){const r=getR(el.dataset.id);if(r)communityAction('social_routine_publish',{p_source_id:r.id,p_snapshot:RoutineShare.pack(r,D(),L())},true);},
    'routine-unshare'(el){communityAction('social_routine_unshare',{p_id:el.dataset.id},true);},
    async 'routine-copy'(el){
      if(ui.communityBusy)return;const owner=CL?.user?.id;ui.communityBusy=true;
      try{const snap=await Social.mutate('social_routine_get',{p_id:el.dataset.id});if(CL?.user?.id!==owner)return;const c=RoutineShare.copy(snap,D(),EX,uid);if(!Store.apply(d=>{d.myEx=d.myEx.concat(c.custom);d.routines.push(c.routine);})){toast(t('saveFailed'));return;}ownRef=null;toast(t('routineCopied'));}
      catch(e){toast(t(Social.message(e)));}finally{ui.communityBusy=false;}
    },
    'workout-history-more'() {ui.homeHistLimit=(ui.homeHistLimit||40)+40;render();},
    'open-ranks'() {closeSheet(true);go('tab',()=>{ui.tab='profile';ui.profilePage='ranks';render();});loadSocial();},
    'recovery-preview'(el){if(REC.some(p=>p.id===el.dataset.id))openSheet(shRecovery(el.dataset.id));},
    'recovery-add'(el){const had=!!getR(el.dataset.id),r=addRecovery(el.dataset.id);if(!r)return;if(topIs('recovery'))refreshSheet();rerender();if(!had)toast(t('recoveryAddedToast'));},
    'recovery-start'(el){const r=addRecovery(el.dataset.id);if(!r)return;closeSheet(true);ui.tab='home';startWorkout(r);},
    'stability-view'(el){if(!['stability','knee'].includes(el.dataset.v))return;ui.stabilityPage=el.dataset.v;go('tab',render);},
    'stability-organise'(el){if(['stability','knee'].includes(el.dataset.focus))openSheet(shStabilityOrganise(el.dataset.focus));},
    'stability-move'(el){const focus=el.dataset.focus,r=getR(el.dataset.id);if(!r||!['stability','knee'].includes(focus))return;if(Store.apply(d=>{d.routines.find(x=>x.id===r.id).focus=focus;})){ui.stabilityPage=focus;closeSheet();rerender();toast(t('saved'));}},
    'workout-view'(el) { if(el.dataset.v==='ranks'){A['open-ranks']();return;}if(!['train','plans','history','exercises','stability','ride'].includes(el.dataset.v))return;go('tab',()=>{ui.tab='home';ui.workout=el.dataset.v;render();}); },
    'wk-volume'() { const panel=$('#sheet [data-volume]');if(panel)panel.open=!panel.open; },
    'update-restart'() { return A['update-now'](); },
    'release-notes'() {
      openSheet(() => ({title:t('whatsNew'),html:(GYM_RELEASE.history||[]).map(r=>`<section class="card"><span class="release-badge">${esc(r.version)}${r.version===VERSION?' · '+esc(t('installedVersion')):''}</span><p class="release-date">${esc(r.date)} · ${esc(r.build)}</p><ul class="release-notes">${(r[L()]||r.en).map(n=>'<li>'+esc(n)+'</li>').join('')}</ul></section>`).join('')}));
    },
    tab(el) { let k = el.dataset.tab; if(k==='lib'){k='home';ui.workout='exercises';}if(k==='prog'||k==='habits'){ui.goals=k==='prog'?'progress':'habits';k='goals';}if(k==='settings'){A.settings();return;}if(k==='profile')loadSocial(); if (!VIEWS[k]) return; if (ui.tab !== k) go('tab', () => { ui.tab = k; render(); }); else render(); },
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
    'habit-select-date'(el) { ui.habitWeek=null;
      if (!/^\d{4}-\d\d-\d\d$/.test(el.dataset.d) || el.dataset.d > today()) return;
      const group = el.classList.contains('momentum-cell') ? '.momentum-heat' : '.momentum-week', top = el.getBoundingClientRect().top;
      ui.habitDate = el.dataset.d; rerender();
      const button = $(group + ' [data-d="' + ui.habitDate + '"]');
      if (button) { button.focus({ preventScroll: true }); window.scrollBy(0, button.getBoundingClientRect().top - top); }
    },
    'habit-month-step'(el) { ui.habitWeek=null; const d = new Date(ui.habitMonth + '-01T12:00'); d.setMonth(d.getMonth() + +el.dataset.d); const month = ymd(d).slice(0, 7); if (month > today().slice(0, 7)) return; const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); ui.habitMonth = month; ui.habitDate = month + '-' + pad(Math.min(Number(ui.habitDate.slice(-2)), last)); if (ui.habitDate > today()) ui.habitDate = today(); rerender(); const button = $('.momentum-month-nav [data-d="' + el.dataset.d + '"]'); const focus = button && !button.disabled ? button : $('.momentum-heat [data-d="' + ui.habitDate + '"]'); if (focus) focus.focus({ preventScroll: true }); },
    'habit-week-step'(el){const start=ui.habitWeek||ymd(weekStart(ui.habitDate+'T12:00'));ui.habitWeek=Momentum.shift(start,+el.dataset.d<0?-7:7);ui.keepScroll=true;rerender();},
    'habit-today'() { ui.habitWeek=null; ui.habitDate = today(); ui.habitMonth = today().slice(0, 7); rerender(); const button = $('.momentum-heat [data-d="' + ui.habitDate + '"]'); if (button) button.focus({ preventScroll: true }); },
    'habit-date'(el) { ui.habitWeek=null; const d = new Date(ui.habitDate + 'T12:00'); d.setDate(d.getDate() + +el.dataset.d); if (ymd(d) <= today()) { ui.habitDate = ymd(d); ui.habitMonth = ui.habitDate.slice(0, 7); rerender(); } },
    'act-est'() { const w = num(D().settings.profile.weight), st = num(ui.act.steps); if (!(st > 0)) { toast(t('actEstNeed')); return; } ui.act.kcal = String(Math.round(st * w * 0.00055)); const b = $('#act-kcal'); if (b) b.value = ui.act.kcal; },
    async 'act-paste'() { let txt = ''; try { txt = await navigator.clipboard.readText(); } catch (e) { toast(t('actClipNo')); return; } if (topIs('act')) actFill(parseAct(txt)); },
    'act-save'(el) {
      const k = el.dataset.d, st = Math.round(num(ui.act.steps)), kc = Math.round(num(ui.act.kcal)); if (!/^\d{4}-\d\d-\d\d$/.test(k)) return;
      if (st < 0 || st > 200000 || kc < 0 || kc > 20000) { toast(t('badValue')); return; }
      if (st || kc) D().act[k] = { steps: st, kcal: kc }; else delete D().act[k];
      Store.save(); closeSheet(); if (topIs('day')) refreshSheet(); rerender(); toast(t('saved'));
    },
    /* favourites */
    'fav-ex'(el) { const id = el.dataset.id, f = D().favEx, k = f.indexOf(id); if (!EX[id]) return; if (k >= 0) f.splice(k, 1); else f.push(id); Store.save(); refreshSheet(); popFav(k < 0); if (ui.tab === 'lib') rerender(); },
    'fav-food'() { const key = ui.fa && ui.fa.food.key, f = D().favFoods; if (!key) return; const k = f.indexOf(key); if (k >= 0) f.splice(k, 1); else f.unshift(key); Store.save(); refreshSheet(); popFav(k < 0); },
    'fs-fav'(el) { const x = (ui.fs.favs || [])[+el.dataset.n]; if (!x) return; pickFood(x); },
    'fs-brand'(el) { ui.fs.q = String(el.dataset.q || '').slice(0, 40); refreshSheet(); const b = $('#sheet .sheet-body'); if (b) b.scrollTop = 0; },
    'ai-forget'() { if (!confirm(t('aiForgetConfirm'))) return; D().aiNotes = []; Store.save(); refreshSheet(); },
    'ai-rm'(el) { ui.ai.imgs.splice(+el.dataset.i, 1); refreshSheet(); },
    're-icon'(el) { const v = el.dataset.v; ui.edit.icon = Store.ICONS.indexOf(v) >= 0 ? v : ''; refreshSheet(); },
    settings() { ui.settingsNavigate = dlg().open; ui.keyDraft = ''; closeSheet(true); go('tab',()=>{ui.tab = 'settings'; render();}); checkSavedKey(); },
    'shortcut-help'() { openSheet(() => ({ title: t('shortcutTitle'), html: `<p class="lead">${esc(t('shortcutHint'))}</p><p>${esc(t('shortcutIOS'))}</p><p>${esc(t('shortcutOther'))}</p><button class="btn primary" data-a="export">${esc(t('shortcutBackup'))}</button>` })); },
    'install-help'() { openSheet(shInstall()); },
    'sheet-back'() { closeSheet(); }, 'sheet-close'() { closeSheet(true); },
    lang(el) { D().settings.lang = el.dataset.v === 'en' ? 'en' : 'hu'; Store.save(); fIdx = null; render(); refreshSheet(); },
    material(el){if(!['glass','balanced','matte'].includes(el.dataset.v))return;D().settings.material=el.dataset.v;Store.save();applyLook();refreshSheet();},
    'set-bg'(el) { clearTimeout(hueT);if ((Store.BGS || []).indexOf(el.dataset.v) < 0) return; D().settings.bg = el.dataset.v; Store.save(); applyLook(); refreshSheet(); },
    'export-plan'(){const d=JSON.parse(Store.exportJSON()).data;saveFile('reppsy-plan-'+today()+'.json',new Blob([JSON.stringify({app:'gymapp',kind:'plan',routines:d.routines,plan:d.plan,myEx:d.myEx,appendRoutines:true},null,2)],{type:'application/json'}));},
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
    'settings-jump'(el) { const section=$$('#view .settings-content section,#view .settings-group').find(s=>(s.querySelector('h3')||s.querySelector('summary'))?.textContent===t(el.dataset.v)); if(section?.tagName==='DETAILS')section.open=true;if(section)section.scrollIntoView({block:'start',behavior:calm()?'auto':'smooth'}); },
    'set-palette'(el) { clearTimeout(hueT);const hue=el.dataset.v==='default'?null:+el.dataset.v;if(hue!==null&&!PALETTES.some(p=>p[0]===hue))return;D().settings.hue=hue;D().settings.accentTone='vivid';Store.save();applyLook();refreshSheet(); },
    'hue-reset'() { clearTimeout(hueT);D().settings.hue = null;D().settings.accentTone='soft'; Store.save(); applyLook(); refreshSheet(); },
    'ai-chip'(el) { const s = ui.ai, v = String(el.dataset.v || ''), parts = s.hint.split(',').map(x => x.trim()).filter(Boolean), k = parts.indexOf(v); if (!v) return; if (k >= 0) parts.splice(k, 1); else parts.push(v); s.hint = parts.join(', ').slice(0, 300); refreshSheet(); },
    'ai-g'(el) { const it = ui.ai.res.items[+el.dataset.i], g = +el.dataset.g; if (!it || !(g > 0 && g <= 5000)) return; it.grams = g; FoodAI.total(it); refreshSheet(); },
    'ai-answer'(el) { const s = ui.ai, q = s.res && s.res.question; if (!q || s.loading) return; s.qa = (s.qa || []).concat([q.text + ' ' + String(el.dataset.o || '').slice(0, 40)]); s.res = null; refreshSheet(); aiGo(); },
    /* the plan: tick a meal, tick a workout */
    'pm-tick'(el) {
      const k = el.dataset.d, pd = planDay(k), m = pd && pd.meals.find(x => x.id === el.dataset.m); if (!m) return;
      const had=(D().food[k]||[]).some(f=>f.pm===m.id),at=Date.now();
      if(!Store.apply(d=>{const day=d.food[k]||[];d.food[k]=had?day.filter(f=>f.pm!==m.id):day.concat([{id:uid(),name:(pmName(m)+': '+m.items.map(i=>i.n).join(', ')).slice(0,80),g:Math.round(m.items.reduce((a,i)=>a+i.g,0)),kcal:m.kcal,p:m.p,c:m.c,f:m.f,src:'plan',pm:m.id,t:at,meal:plannedMealKind(m.name),mealAt:at,items:m.items.map(i=>({n:i.n,g:i.g,kcal:i.kcal??null}))}]);if(!d.food[k].length)delete d.food[k];})){toast(t('saveFailed'));return;}
      if(D().settings.vibrate&&navigator.vibrate&&!had)navigator.vibrate(20);rerender();
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
    'mx-nopic'() { ui.myex.img = ''; refreshSheet(); },
    'mx-save'() {
      const x = ui.myex, n = x.n.trim(), vid = x.vid.trim(), d = D(), old = x.id ? d.myEx.find(o => o.id === x.id) : null;
      if (!n) { toast(t('myExNeedName')); return; } if (!x.p.length) { toast(t('myExNeedMus')); return; } if (vid && !urlOk(vid)) { toast(t('vidBad')); return; }
      if (x.img && !(old && old.img) && picCount() >= 30) { toast(t('picLimit')); return; }
      if (!old && d.myEx.length >= 300) { toast(t('picLimit')); return; }
      const e = { id: x.id || 'my_' + uid(), n: n.slice(0, 80), p: x.p.slice(0, 6), s: x.s.filter(m => x.p.indexOf(m) < 0).slice(0, 6), eq: x.eq, steps: x.steps.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12), img: x.img, vid, t: Date.now() };
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
    'fs-my'(el) { const z = D().myFoods.find(x => x.id === el.dataset.id); if (!z) return; ui.fa = { food: { key: 'my:' + z.id, my: true, own: true, name: z.name, usda: '', approx: false, kcal: z.kcal, p: z.p, c: z.c, f: z.f, ports: z.port ? [[z.port, t('portion')]] : [],basis:z.basis },unit:z.basis==='ml'?'dl':'g',g: String(z.basis==='ml'?(z.port||250)/100:(z.port||100)) }; openSheet(shFoodAmount()); },
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
    'ex-visual'(el) { if (!EX[el.dataset.id] || !['muscles','movement'].includes(el.dataset.v)) return; ui.exVisual = { id: el.dataset.id, mode: el.dataset.v }; refreshSheet(); },
    'muscle-focus'(el) { const e = EX[el.dataset.id], group = el.dataset.group; if (!e || (group && !e.p.concat(e.s).includes(group))) return; ui.muscleFocus = { id: el.dataset.id, group }; ui.exVisual = { id: el.dataset.id, mode: 'muscles' }; refreshSheet();
      const active = $('#sheet .muscle-picks [data-group="' + group + '"]'); if (active) active.focus({ preventScroll: true });
      const body = $('#sheet .sheet-body'); if (body) body.scrollTo({ top: 0, behavior: calm() ? 'auto' : 'smooth' });
    },
    'circuit-next'() { jumpCircuit(); },
    'fig-big'(el) {
      const phase = el.dataset.phase === '1' ? 1 : 0, source = el.dataset.source;
      if (!source) return;
      const label = exName(el.dataset.id) + ' · ' + t(phase ? 'artEnd' : 'artStart');
      openSheet(() => ({ title: label, html: `<div class="drawing-zoom" data-id="${esc(el.dataset.id)}" data-phase="${phase}">${drawingPicture(source, phase, el.dataset.board === '1', label)}</div>` }));
    },
    'acc-help'() { openSheet(shAccHelp()); },
    /* account */
    'setup-back'() { const draft = setupState(); draft.step = Math.max(0, draft.step - 1); ui.gate.err = ''; renderGate(); window.scrollTo(0, 0); },
    'setup-edit'() { const email = $('#gate input[name=email]'); if (email) ui.gate.email = email.value.trim(); setupState().step = 0; ui.gate.err = ''; renderGate(); window.scrollTo(0, 0); },
    'gate-mode'(el) { const f = $('#gate input[name=email]'), v = el.dataset.v; if (f) ui.gate.email = f.value.trim(); if (ui.gate.busy || ['in', 'up', 'forgot'].indexOf(v) < 0) return; ui.gate.mode = v; ui.gate.err = ''; ui.gate.info = ''; renderGate(); },
    'gate-lang'(el) { const f = $('#gate input[name=email]'); if (f) ui.gate.email = f.value.trim(); D().settings.lang = el.dataset.v === 'en' ? 'en' : 'hu'; Store.save(); fIdx = null; ui.gate.err = ''; renderGate(); render(); },
    async 'sync-now'(el) { if (!CL || !CL.user) return; el.disabled = true; await doSync(true); toast(t(CL.state.err ? 'syncErr' : 'synced')); },
    async 'sign-out'() {
      if (!CL || !CL.user || !confirm(t('signOutConfirm'))) return;
      try { await CL.sync(); } catch (e) { if (!confirm(t('signOutUnsynced'))) return; }
      Social.reset();Stories.reset();if(Stories.isOpen())Stories.close();
      await CL.signOut(); Store.wipe(); location.reload();                               // nothing of the account stays on this device
    },
    'settings-update'(el) {return A['update-now'](el);},
    async 'update-now'(el) {
      if (ui.updateBusy) return;
      ui.updateBusy=true;ui.updateStatus='updating';syncUpdateButton();const overlay=updateOverlay();
      try {
        let result = null;
        const latest=await AppUpdates.latest();
        if(!AppUpdates.newer(GYM_RELEASE,latest)){ui.updateBusy=false;ui.updateAvailable=null;syncUpdateButton();overlay.close();toast(t('updateCurrent'));return;}
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
        if(result&&(!result.verified||result.version!==AppUpdates.cacheId(latest)))throw new Error('worker did not install the latest release');
        if(!Store.save())throw new Error('data could not be saved');
        // Success is shown only when the new page's build matches the expected release.
        try { sessionStorage.setItem('gym-update-result', JSON.stringify({ version:AppUpdates.cacheId(latest), at: Date.now() })); } catch (e) {}
        ui.updateStatus=result?'updateRestarting':'updateReloading';const settleMs=overlay.message(ui.updateStatus)||0;
        setTimeout(() => location.reload(), Math.max(900,settleMs+100));             // let the mark finish settling before restart
      } catch(e){ui.updateBusy=false;ui.updateStatus='updateFail';overlay.close();syncUpdateButton();toast(t('updateFail'));}
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
    'r-new'(el) {                                                                      // first tick the exercises, then name it and set the numbers
      const focus=['stability','knee'].includes(el?.dataset?.focus)?el.dataset.focus:null;
      ui.pick = newPick({ title: t('newRoutine'), lead: t('newRoutineLead'), cta: t('next'), done: ids => { ui.edit = { id: uid(), name: '', ...(focus?{focus}:{}), items: ids.map(itemFor), _old: false }; ui.sheets = []; openSheet(shRoutineEdit()); } });
      openSheet(shPicker());
    },
    'r-edit'(el) { const r = getR(el.dataset.id); ui.edit = JSON.parse(JSON.stringify(r)); ui.edit._old = true; openSheet(shRoutineEdit()); },
    'r-del'() {removeRoutine(ui.edit?.id);},
    'routine-remove'(el) {removeRoutine(el.dataset.id);},
    'routine-library'() {openSheet(shRoutineLibrary());},
    'routine-template'(el) {openSheet(shRoutineTemplate(el.dataset.id));},
    'routine-template-add'(el) {addRoutineTemplate(el.dataset.id);},
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
      Store.save(); if(ui.tab==='home'){if(e.focus){ui.workout='stability';ui.stabilityPage=e.focus;}else if(ui.workout==='stability')ui.workout='plans';} closeSheet(true); render(); toast(t('saved'));
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
    'lib-grp'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib, g = el.dataset.g; st.grp = GROUPS[g] || g === 'fav' || (pk && g === 'sel') ? g : ''; st.mus = ''; st.limit = 40; if (pk) refreshSheet(); else rerender(); },
    'lib-more'(el) { const pk = !!el.closest('#sheet'); (pk ? ui.pick : ui.lib).limit += 60; if (pk) refreshSheet(); else rerender(); },
    /* progress */
    prog(el) { const v = el.dataset.v === 'history' ? 'history' : 'overview'; ui.histLimit = 60; if (ui.prog !== v) go('tab', () => { ui.prog = v; render(); }); else render(); },
    'hist-more'() { ui.histLimit = (ui.histLimit || 60) + 120; rerender(); },
    'wk-open'(el) { const w = D().workouts.find(x => x.id === el.dataset.id); openSheet(w && w.ride ? shRide(w.id) : shWorkout(el.dataset.id, null)); },
    'ride-start'() { rideBegin(); },
    'ride-open'() { if (ride) rideOpen(true); },
    'ride-min'() { rideOpen(false); if (ui.tab === 'home' && ui.workout === 'ride') rerender(); },
    'ride-pause'() { if (!ride) return; if (ride.paused) { Rides.resume(ride, Date.now()); rideGeo(true); rideWake(); } else Rides.pause(ride, Date.now()); rideStore(true); rideDraw(); },
    'ride-finish'() { if (!ride) return; const tiny = ride.dist < 50 && ride.wheel < 50; if (tiny) { if (confirm(t('rideTooShort'))) rideEnd(false); return; } if (confirm(t('rideFinishConfirm'))) rideEnd(true); },
    'ride-discard'() { if (ride && confirm(t('rideDiscardConfirm'))) rideEnd(false); },
    'ride-center'() { const m = rideMaps.get('live'); if (m && m.recenter) m.recenter(); },
    'ride-view'(el) { openSheet(shRide(el.dataset.id)); },
    'ride-more'() { ui.rideLimit = (ui.rideLimit || 30) + 30; rerender(); },
    'ride-gpx'(el) { const w = D().workouts.find(x => x.id === el.dataset.id); if (!w || !w.ride) return; saveFile('reppsy-' + ymd(w.start) + '-' + w.id + '.gpx', new Blob([Rides.gpx(w.ride, w.start, w.name)], { type: 'application/gpx+xml' })); },
    'ride-sensor'() { rideSensorAdd(); },
    'ride-sensor-off'(el) { const s = rideSensors[+el.dataset.i]; if (s) { rideSensors = rideSensors.filter(x => x !== s); s.close(); } rerender(); },
    'wk-to-routine'(el) {
      const w = D().workouts.find(x => x.id === el.dataset.id); if (!w) return;
      ui.edit = { id: uid(), name: '', _old: false,
        items: w.entries.map(e => { const d = itemFor(e.ex), n = e.sets.filter(s => !s.w).length || e.sets.length; return { ex: e.ex, label: e.label || null, sets: Math.max(1, Math.min(12, n)), reps: d.reps, rest: d.rest }; }) };
      openSheet(shRoutineEdit());
    },
    'wk-del'(el) { if (confirm(t('deleteWorkoutConfirm'))) { D().workouts = D().workouts.filter(w => w.id !== el.dataset.id); Store.save(); closeSheet(true); rerender(); } },
    /* food */
    'food-group-toggle'(el){const k=mealKind(el.dataset.meal),key=ui.foodDate+'-'+k,open=!ui.mealOpen[key];ui.mealOpen[key]=open;el.setAttribute('aria-expanded',String(open));const card=el.closest('.meal-group');card.classList.toggle('expanded',open);$('.meal-panel',card).inert=!open;},
    'food-group-add'(el){ui.foodMeal=mealKind(el.dataset.meal);ui.mealOpen[ui.foodDate+'-'+ui.foodMeal]=true;A['food-manual']();},
    'food-meal-edit'(el){if(!dayFood().some(f=>f.id===el.dataset.id))return;ui.moveFood=el.dataset.id;ui.foodMeal=mealKind(dayFood().find(f=>f.id===ui.moveFood).meal);openSheet(()=>({title:t('moveMeal'),html:mealPicker(),foot:`<button class="btn primary" data-a="food-meal-save">${esc(t('save'))}</button>`}));},
    'food-meal-save'(){const id=ui.moveFood,meal=mealKind(ui.foodMeal);if(!Store.apply(d=>{const f=(d.food[ui.foodDate]||[]).find(x=>x.id===id);if(f){f.meal=meal;f.mealAt=Date.now();}})){toast(t('saveFailed'));return;}closeSheet(true);rerender();toast(t('saved'));},
    'food-day'(el) { const d = new Date(ui.foodDate + 'T12:00'); d.setDate(d.getDate() + +el.dataset.d); if (ymd(d) <= today()) go(+el.dataset.d < 0 ? 'back' : 'fwd', () => { ui.foodDate = ymd(d); render(); }); },
    'food-del'(el) { const d = D(); d.food[ui.foodDate] = dayFood().filter(f => f.id !== el.dataset.id); Store.save(); rerender(); },
    'food-view'(el) { const v = el.dataset.v === 'ideas' ? 'ideas' : el.dataset.v === 'plan' && D().plan ? 'plan' : 'diary'; if (ui.food !== v) go('tab', () => { ui.food = v; render(); }); else render(); },
    'idea-cat'(el) {go('tab',()=>{ui.idea = el.dataset.c;rerender();});},
    'recipe-cook'(el){const r=RCP.items.find(r=>r.id===el.dataset.id);if(r){recipeCookState(r);openSheet(shRecipeCook(r.id));}},
    'cook-back'(el){const r=RCP.items.find(r=>r.id===el.dataset.id);if(r){const state=recipeCookState(r);state.step=Math.max(0,state.step-1);refreshSheet();}},
    'cook-next'(el){const r=RCP.items.find(r=>r.id===el.dataset.id);if(!r)return;const state=recipeCookState(r),length=(r.steps[L()]||r.steps.en).length;if(state.step>=length){state.step=0;closeSheet();}else{state.step++;refreshSheet();}},
    'idea-open'(el) { ui.recipeQty = 1; openSheet(shRecipe(el.dataset.id)); },
    'recipe-qty'(el) { ui.recipeQty = Math.max(.5, Math.min(20, (ui.recipeQty || 1) + num(el.dataset.n))); refreshSheet(); },
    'idea-add'(el) { const r = RCP.items.find(x => x.id === el.dataset.id); if (!r) return; const q = ui.recipeQty || 1, food = { name: (r[L()] || r.en) + (q !== 1 ? ' × ' + q : ''), g: Math.round((r.g || 0) * q) }; ['kcal', 'p', 'c', 'f'].forEach(k => { food[k] = r[k] == null ? '' : r1(r[k] * q); }); if (['kcal', 'p', 'c', 'f'].some(k => r[k] == null)) { ui.manual = Object.assign(food, { requireMacros: true }); openSheet(shFoodManual()); return; } if(!addFood([food], r.source ? 'manual' : 'db')){toast(t('saveFailed'));return;} closeSheet(true); rerender(); toast(t('added')); },
    'food-manual'() { ui.fs = { q: '', hits: [] }; openSheet(shFoodFind()); },
    'food-recent'(el) { ui.manual = Object.assign({}, D().recentFoods[+el.dataset.i]); if (topIs('foodfind')) openSheet(shFoodManual()); else refreshSheet(); },
    'fs-pick'(el) { const x = ui.fs.hits[+el.dataset.n]; if (x) pickFood(x); },
    'fs-own'() { ui.manual = { name: ui.fs.q.trim() }; openSheet(shFoodManual()); },
    'fs-ai'() { ui.ai = aiNew('text', ui.fs.q.trim()); openSheet(shFoodAI()); const st = D().settings; if (st.apiKey && st.keyState !== 'bad') aiGo(); },
    'fa-unit'(el){
      const f=ui.fa.food,unit=el.dataset.v;if(!['dl','g'].includes(unit)||unit===ui.fa.unit)return;
      const q=FoodVolume.quantity(f,ui.fa.g,ui.fa.unit);if(!q)return;
      ui.fa.g=String(Math.round((unit==='dl'?q.g/f.volume.gramsPerDl:q.g)*10000)/10000);ui.fa.unit=unit;refreshSheet();
    },
    'fa-label'(){ui.myfood={id:'',name:ui.fa.food.name,basis:'ml',kcal:'',p:'',c:'',f:'',port:250};openSheet(shMyFood());},
    'fa-set'(el) { ui.fa.g = String(+el.dataset.g); refreshSheet(); },
    'fa-add'() {
      const f = ui.fa.food, q=FoodVolume.quantity(f,ui.fa.g,ui.fa.unit); if (!q||!q.k) { toast(t('badValue')); return; }
      if(!addFood([{name:f.name,g:q.g,vml:q.vml,kcal:f.kcal*q.k,p:f.p*q.k,c:f.c*q.k,f:f.f*q.k}], 'db')){toast(t('saveFailed'));return;} closeSheet(true); rerender(); toast(t('added'));
    },
    'food-ai'(el) { ui.ai = aiNew(el.dataset.m === 'photo' ? 'photo' : 'text'); openSheet(shFoodAI()); },
    'ai-go'() { aiGo(); },
    'ai-reset'() { ui.ai = aiNew(ui.ai.mode, ui.ai.text); refreshSheet(); },
    'ai-del'(el) { const it = ui.ai.res.items.splice(+el.dataset.i, 1)[0]; if (it && it._b) ui.ai.gone.push(it.en || it._b.name); refreshSheet(); },
    'ai-add'() { const s = ui.ai, learned = aiLearn(s); if(!addFood(s.res.items.map(i => ({ name: i.name, g: i.grams, kcal: i.kcal, p: i.p, c: i.c, f: i.f })), 'ai')){toast(t('saveFailed'));return;} closeSheet(true); rerender(); toast(t(learned ? 'aiLearned' : 'added')); },
    async 'key-save'() {
      const k = (ui.keyDraft || '').replace(/[^\x21-\x7e]/g, ''); if (!k || ui.keyBusy) return;
      ui.keyBusy = true; refreshSheet();
      const r = FoodAI.check ? await FoodAI.check(k) : 'unknown';
      ui.keyBusy = false;
      if (r === 'bad') { toast(t('err_auth')); if (topIs('settings')) refreshSheet(); return; }      // a rejected key is never stored
      const st = D().settings; st.apiKey = k; st.keyState = r === 'ok' ? 'ok' : ''; Store.save(); ui.keyDraft = ''; ui.keyPop = r === 'ok';
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
    'meal-groups'(el){const enabled=el.checked;if(!Store.apply(d=>{d.settings.mealGroups=enabled;})){el.checked=!enabled;toast(t('saveFailed'));return;}const diary=$('#food-diary');if(diary){diary.innerHTML=foodDiary(dayFood());diary.classList.remove('meal-mode-enter');void diary.offsetWidth;diary.classList.add('meal-mode-enter');animateClocks(new Map());}},
    'food-meal'(el){ui.foodMeal=mealKind(el.value);},
    'gate-username'(el){ui.gate.username=el.value;},
    'compose-caption'(el){if(!ui.compose)return;ui.compose.caption=el.value.slice(0,300);const c=$('[data-compose-count]');if(c)c.textContent=ui.compose.caption.length+' / 300';},
    'post-caption'(el){const p=Stories.find(ui.postId);if(!p)return;ui.postEdit={open:true,audience:ui.postEdit?.audience||p.audience,caption:el.value.slice(0,300)};},
    'hl-name'(el){const h=ui.hl;if(!h)return;h.name=el.value;const b=$('#sheet button[form=highlight-form]');if(b)b.disabled=h.busy||!h.items.length||!el.value.trim();},
    'review-text'(el){if(!ui.reviewDraft)return;ui.reviewDraft.body=el.value;ui.reviewError='';const count=$('[data-review-count]');if(count)count.textContent=el.value.length+' / 280';},
    'profile-draft'(el) {if(ui.profileDraft){ui.profileDraft[el.name]=el.value;const preview=$('.profile-preview');if(preview)preview.outerHTML=profilePreview(ui.profileDraft,ui.profileStyleDraft||profileStyle());}},
    'profile-hue'(el){const v=Math.round(+el.value);if(!(v>=0&&v<=359)||!ui.profileDraft)return;ui.profileDraft.theme='hue_'+v;ui.profileStyleDraft.useAccent=false;const wheel=el.closest('.profile-color-wheel');if(wheel){const c=profileColor(ui.profileDraft);wheel.style.setProperty('--acc',`rgb(${c.join(',')})`);wheel.style.setProperty('--acc-ink',AccentTheme.ink(c));HueWheel.update(el.closest('.hue-wheel'),v);}const preview=$('.profile-preview');if(preview)preview.outerHTML=profilePreview(ui.profileDraft,ui.profileStyleDraft);$$('.cover-choice').forEach(b=>{b.classList.remove('profile-use-accent');b.style.setProperty('--profile-rgb',profileColor(ui.profileDraft).join(','));});const toggle=$('[data-in=profile-style]');if(toggle)toggle.checked=false;$$('.profile-colors button').forEach(b=>{b.classList.remove('on');b.setAttribute('aria-pressed','false');});},
    'profile-style'(el){ui.profileStyleDraft.useAccent=el.checked;refreshSheet();},
    'habit-name'(el) { if (ui.habitEdit) ui.habitEdit.name = el.value; },
    'habit-source'(el) { if (!ui.habitEdit || !Momentum.sources.includes(el.value)) return; ui.habitEdit.source = el.value; ui.habitEdit.goal = ({ check: 1, workout: 1, count: 8, steps: 8000, protein: 150 })[el.value]; refreshSheet(); },
    'habit-goal'(el) { if (ui.habitEdit) ui.habitEdit.goal = el.value; },
    'habit-unit'(el) { if (ui.habitEdit) ui.habitEdit.unit = el.value; },
    'lib-q'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.q = el.value; st.limit = 40; const l = $(pk ? '#pick-list' : '#lib-list'); if (l) l.innerHTML = libRows(pk); },
    'w-jump'(el) { if(el.value==='')return;const row=$('#workout [data-ex-index="'+Number(el.value)+'"]');if(row)row.scrollIntoView({block:'start',behavior:calm()?'auto':'smooth'}); },
    'w-kg'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].kg = el.value.trim(); lazyActive(); },
    'w-reps'(el) { D().active.entries[+el.dataset.i].sets[+el.dataset.j].reps = el.value.trim(); lazyActive(); },
    're-focus'(el){if(['stability','knee'].includes(el.value))ui.edit.focus=el.value;else delete ui.edit.focus;},
    're-name'(el) { ui.edit.name = el.value; }, 're-sets'(el) { ui.edit.items[+el.dataset.i].sets = el.value; },
    're-reps'(el) { ui.edit.items[+el.dataset.i].reps = el.value; }, 're-rir'(el) { ui.edit.items[+el.dataset.i].rir = el.value; },
    'mx-n'(el) { ui.myex.n = el.value; }, 'mx-steps'(el) { ui.myex.steps = el.value; }, 'mx-vid'(el) { ui.myex.vid = el.value; }, 'mx-eq'(el) { ui.myex.eq = EQS.indexOf(el.value) >= 0 ? el.value : 'other'; },
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
    'set-flag'(el) { const k = el.dataset.k; if (['vibrate', 'awake', 'autofill', 'calm', 'solid', 'addActive', 'addWorkoutCalories', 'coach', 'syncKey', 'stretch'].indexOf(k) < 0) return; D().settings[k] = el.checked; Store.save(); applyLook(); if (k === 'awake' && !el.checked) unwake(); if (k === 'addActive' || k === 'addWorkoutCalories' || k === 'coach' || k === 'stretch') rerender(); if (k === 'stretch') refreshSheet(); },
    'coach-q'(el) { ui.coach.draft = el.value; },
    'friend-identifier'(el) {ui.friendValue=el.value;ui.friendError='';ui.friendNotice='';},
    'friend-kind'(el) { if(!['username','email','phone'].includes(el.value))return;ui.friendKind=el.value;ui.friendValue='';ui.friendError='';ui.friendNotice='';if(topIs('friend-search'))refreshSheet();else rerender();$('#friend-identifier')?.focus(); },
    'cardio-field'(el) {ui.cardioDraft[el.dataset.k]=el.value;},
    'cardio-type'(el) {const type=el.value;if(!WorkoutEnergy.types.includes(type))return;ui.cardioDraft.type=type;ui.cardioDraft.speed=type==='run'?8.5:5;ui.cardioDraft.incline=type==='incline'?5:0;refreshSheet();},
    'set-hue'(el) { const v = Math.round(+el.value); if (!(v >= 0 && v <= 359)) return; D().settings.hue = v;D().settings.accentTone='vivid'; applyLook();$$('.hue-wheel').forEach(w=>HueWheel.update(w,v)); clearTimeout(hueT); hueT = setTimeout(() => Store.save(), 500); $$('.palette').forEach(b=>{const on=String(v)===b.dataset.v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));const check=$('.palette-check',b);if(check)check.innerHTML=on?IC.check:'';}); },   // colour follows the finger; saved when it rests
    'set-photo-model'(el) { D().settings.photoModel = Store.MODELS.indexOf(el.value) >= 0 ? el.value : ''; Store.save(); },
    'lib-eq'(el) { const pk = !!el.closest('#sheet'), st = pk ? ui.pick : ui.lib; st.eq = EQS.indexOf(el.value) >= 0 ? el.value : ''; st.limit = 40; const l = $(pk ? '#pick-list' : '#lib-list'); if (l) l.innerHTML = libRows(pk); },
    'act-f'(el) { if (el.dataset.k === 'steps' || el.dataset.k === 'kcal') ui.act[el.dataset.k] = el.value; },
    'act-paste'(el) { if (/\d/.test(el.value) && el.value.length > 3) { const o = parseAct(el.value); if (o.steps > 0 || o.kcal > 0) { actFill(o); el.value = ''; } } },
    'set-num'(el) { const k = el.dataset.k, v = +el.value, ok = { restDefault: [60, 90, 120, 150, 180], weekGoal: [0, 2, 3, 4, 5, 6, 7], weekStart: [0, 1], hold: [20, 30, 45] }[k]; if (!ok || ok.indexOf(v) < 0) return; D().settings[k] = v; Store.save(); rerender(); },
    'fs-q'(el) { ui.fs.q = el.value; const l = $('#fs-list'); if (l) l.innerHTML = foodRows(); },
    'fm-unit'(el){const form=el.closest('form');ui.manual=Object.assign({},ui.manual,Object.fromEntries(new FormData(form)),{g:'',vml:0});refreshSheet();},
    'mf-basis'(el){const form=el.closest('form'),v=Object.fromEntries(new FormData(form));Object.assign(ui.myfood,v,{port:''});refreshSheet();},
    'fa-g'(el) { ui.fa.g = el.value; const o = $('#fa-out'); if (o) o.innerHTML = faOut(); $$('#sheet [data-a="fa-set"]').forEach(c => c.classList.toggle('on', num(el.value) === +c.dataset.g)); },
    'tg-p'(el) {
      if (el.type === 'radio' && !el.checked) return;
      ui.tg.profile[el.dataset.k] = el.value; const c = calcTargets(ui.tg.profile); $('#tg-out').innerHTML = tgOut(c, ui.tg.profile);
      if (c && !c.bad) { ui.tg.vals = { kcal: c.kcal, p: c.p, c: c.c, f: c.f }; ['kcal', 'p', 'c', 'f'].forEach(k => { $('#tg-' + k).value = c[k]; }); }
    },
    'setup-field'(el) { if (el.type === 'radio' && !el.checked) return; setupCapture({ [el.dataset.k]: el.value }); },
    'tg-v'(el) { ui.tg.vals[el.dataset.k] = el.value; }
  };
  document.addEventListener('input', e => { const el = e.target, k = el.dataset && el.dataset.in; if (k && IN[k] && el.type !== 'file') IN[k](el); });
  function readLocalText(file) {
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('file'));
      reader.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
      reader.readAsText(file, 'UTF-8');
    });
  }
  let lastPhotoTap=null,photoPointer=null;
  document.addEventListener('pointerdown',e=>{const figure=e.target.closest?.('.profile-photo-view[data-photo-like]');if(e.pointerType==='touch')photoPointer=e.isPrimary&&figure?{figure,id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()}:null;});
  document.addEventListener('pointercancel',()=>{photoPointer=null;lastPhotoTap=null;});
  document.addEventListener('pointerup',e=>{
    if(e.pointerType!=='touch'||!e.isPrimary)return;
    const figure=e.target.closest?.('.profile-photo-view[data-photo-like]');if(!figure){lastPhotoTap=null;return;}
    const now=performance.now(),down=photoPointer;photoPointer=null;if(!down||down.figure!==figure||down.id!==e.pointerId||now-down.time>300||Math.hypot(e.clientX-down.x,e.clientY-down.y)>10){lastPhotoTap=null;return;}
    const previous=lastPhotoTap;lastPhotoTap={figure,x:e.clientX,y:e.clientY,time:now};
    if(previous&&previous.figure===figure&&now-previous.time<320&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<28){lastPhotoTap=null;A['photo-double-like'](figure);}
  });
  document.addEventListener('dblclick',e=>{const figure=e.target.closest?.('.profile-photo-view[data-photo-like]');if(figure)A['photo-double-like'](figure);});
  // Double-tap (or double-click) a post picture to like it, with a big heart over the photo.
  const postDouble=figure=>{const id=figure.dataset.likeTarget;Stories.burst(figure);likePost(id,true);};
  let postTap=null;
  document.addEventListener('dblclick',e=>{const figure=e.target.closest?.('.post-media[data-like-target]');if(figure){e.preventDefault();postDouble(figure);}});
  document.addEventListener('pointerup',e=>{
    if(e.pointerType!=='touch'||!e.isPrimary)return;
    const figure=e.target.closest?.('.post-media[data-like-target]');if(!figure){postTap=null;return;}
    const now=performance.now(),last=postTap;postTap={figure,x:e.clientX,y:e.clientY,time:now};
    if(last&&last.figure===figure&&now-last.time<320&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<30){postTap=null;postDouble(figure);}
  });
  document.addEventListener('change', async e => {
    const el = e.target, k = el.dataset && el.dataset.in;
    if (k === 'ride-file' && el.files[0]) { const file = el.files[0]; el.value = ''; rideImport(file); return; }
    if (k === 'ride-wheel') { try { localStorage.setItem(WKEY, el.value); } catch (er) {} rideRev.csc = null; return; }
    if(k==='cook-ingredient'){const r=RCP.items.find(r=>r.id===el.dataset.id),n=+el.dataset.i;if(r&&Number.isInteger(n)&&n>=0&&n<r.ing.length){recipeCookState(r).ingredients[n]=el.checked;el.closest('.cook-ingredient')?.classList.toggle('checked',el.checked);}}
    if(k==='planner-all-day'){const f=el.form;for(const field of ['start','end'])f.elements[field].disabled=el.checked;}
    if(k==='planner-ics'&&el.files[0]){
      const file=el.files[0],owner=calendarKey();el.value='';if(file.size>2*1024*1024){toast(t('plannerCalendarLimit'));return;}
      const existing=D().planner.sources.find(s=>s.kind==='file'&&s.name===file.name.slice(0,80));
      if(!existing&&D().planner.sources.length>=8){toast(t('plannerCalendarLimit'));return;}
      const source={id:existing?.id||'pc_'+uid(),name:file.name.slice(0,80),kind:'file'};
      try{const events=DailyPlanner.parseICS(await file.text(),source.id);if(calendarKey()!==owner)return;if(plannerCommit(DailyPlanner.replaceSource(D().planner,source,events))){ui.calendarStatus='plannerImported';if(topIs('planner-calendars'))closeSheet();rerender();toast(t('plannerImportedCount',events.length));}}
      catch(error){if(calendarKey()===owner)toast(t(error.code||'plannerInvalidCalendar'));}
    }
    if(k==='profile-cover-photo'&&el.files[0]){const file=el.files[0],draft=ui.profileDraft;el.value='';if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>20*1024*1024){toast(t('picBad'));return;}try{const pic=await smallPic(file,true);if(draft===ui.profileDraft&&topIs('profile-edit')){draft.coverPhoto=pic;ui.profileStyleDraft.cover='photo';refreshSheet();}}catch(error){toast(t('picBad'));}}
    if(k==='compose-file'&&el.files[0]){const file=el.files[0],c=ui.compose;el.value='';if(!c||c.busy)return;if(file.size>40*1024*1024){c.error='photoTooBig';refreshSheet();return;}c.reading=true;c.error='';refreshSheet();try{const r=await Stories.shrink(file);if(ui.compose===c){c.image=r.image;c.thumb=r.thumb;}}catch(er){if(ui.compose===c)c.error=Stories.message(er);}finally{if(ui.compose===c){c.reading=false;if(topIs('compose'))refreshSheet();}}return;}
    if(k==='profile-photo'&&el.files[0]){const file=el.files[0],draft=ui.profileDraft;el.value='';try{const pic=await smallPic(file);if(draft===ui.profileDraft&&topIs('profile-edit')){draft.avatar=pic;refreshSheet();}}catch(error){toast(t('picBad'));}}
    if (k === 'ai-file' && el.files[0]) { const file = el.files[0]; el.value = ''; const s0 = ui.ai; try { const r = await FoodAI.shrink(file, 1568); if (ui.ai === s0 && s0.imgs.length < 2) { s0.imgs.push({ url: r.dataUrl, b64: r.base64, warn: r.luma < 45 ? 'dark' : r.side < 640 ? 'small' : '' }); s0.err = null; } } catch (er) { s0.err = { code: 'image' }; } if (ui.ai === s0) refreshSheet(); }   // 1568 px: the largest size the model looks at without shrinking it again
    if (k === 'mx-file' && el.files[0]) { const file = el.files[0]; el.value = ''; const s0 = ui.myex; try { const u = await smallPic(file); if (ui.myex === s0) { s0.img = u; if (topIs('myex')) refreshSheet(); } } catch (er) { toast(t('picBad')); } }
    if (k === 'exm-file' && el.files[0]) {
      const file = el.files[0], id = el.dataset.id, had = D().exMedia[id]; el.value = '';
      try { if (!(had && had.img) && picCount() >= 30) { toast(t('picLimit')); } else { const u = await smallPic(file); if (EX[id]) { D().exMedia[id] = { img: u, vid: (had && had.vid) || '' }; Store.save(); refreshSheet(); if (!ui.wOpen) rerender(); toast(t('saved')); } } } catch (er) { toast(t('picBad')); }
    }
    if (k === 'import' && el.files[0]) {
      const file = el.files[0]; el.value = '';
      let contents = ''; try { contents = await readLocalText(file); } catch (er) { toast(t('importBad')); return; }
      let plan = null; try { plan = JSON.parse(contents); } catch (er) { plan = null; }
      if (plan && plan.app === 'gymapp' && plan.kind === 'plan') {                           // a plan file: routines, meal plan, rules; the log stays
        const nr = Array.isArray(plan.routines) ? plan.routines.length : 0, nm = plan.plan && Array.isArray(plan.plan.days) ? plan.plan.days.reduce((a, x) => a + (x && Array.isArray(x.meals) ? x.meals.length : 0), 0) : 0;
        if (!nr && !nm) toast(t('importBad'));
        else if (plan.appendRoutines === true && D().routines.filter(r => !plan.routines.some(n => n.id === r.id)).length + nr > 100) toast(L() === 'hu' ? 'Legfeljebb 100 edzésterv tárolható.' : 'At most 100 routines can be saved.');
        else if (Array.isArray(plan.myEx)&&plan.myEx.filter(e=>!D().myEx.some(x=>x.id===e.id)).length+D().myEx.length>300) toast(t('picLimit'));
        else if (confirm(t('planConfirm', nr, nm))) { if(applyPlan(plan)){ui.foodDate = today(); closeSheet(true); render(); toast(t('planLoaded'));}else toast(t('saveFailed')); }
        el.value = ''; return;
      }
      try { const o = JSON.parse(contents), d = o && o.data ? o.data : o; if (!d || !Array.isArray(d.workouts) || !Array.isArray(d.routines)) throw 0;
        if (confirm(t('importConfirm', d.workouts.length))) { Store.replace(d); ui.wOpen = false; ui.foodDate = today(); closeSheet(true); render(); toast(t('imported')); } } catch (er) { toast(t('importBad')); }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.in === 'w-reps') { e.preventDefault(); e.target.blur(); const b = $('.set-ok', e.target.closest('.set')); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); } });
  document.addEventListener('submit', e => {
    const f = e.target, k = f.dataset.f; if (!k) return; e.preventDefault(); const v = Object.fromEntries(new FormData(f));
    if (k === 'highlight') { const h=ui.hl;if(!h||h.busy)return;h.name=String(v.name||'').trim().slice(0,30);if(!h.name){h.error='highlightNameNeeded';refreshSheet();return;}if(!h.items.length)return;h.busy=true;h.error='';refreshSheet();Stories.saveHighlight(h.id,h.name,h.items).then(()=>{if(ui.hl!==h)return;ui.hl=null;if(topIs('highlight'))closeSheet();toast(t('highlightSaved'));if(ui.tab==='profile')rerender();}).catch(er=>{h.error=Stories.message(er);h.busy=false;if(topIs('highlight'))refreshSheet();});return; }
    if (k === 'habit-amount') { const x = ui.habitAmount, h = x && D().habits.find(z => z.id === x.id); if (!h || !habitDue(h, x.day) || x.day > today() || !/^[0-9]+([.,][0-9]+)?$/.test(String(v.value).trim()) || num(v.value) < 0 || num(v.value) > 200000) { toast(t('badValue')); return; } h.logs[x.day] = { v: r1(num(v.value)), t: Date.now() }; Store.save(); closeSheet(); if (topIs('day')) refreshSheet(); rerender(); }
    if (k === 'bw') { const kg = r1(num(v.kg)); if (!(kg > 20 && kg < 400)) { toast(t('badValue')); return; } const d = D(); d.body = d.body.filter(b => b.d !== today()); d.body.push({ d: today(), kg }); Store.save(); rerender(); toast(t('saved')); }
    if (k === 'food-manual') { if (ui.manual && ui.manual.requireMacros && ['kcal', 'p', 'c', 'f'].some(key => !/^[0-9]+([.,][0-9]+)?$/.test(String(v[key]).trim()))) { toast(t('badValue')); return; } if (!(num(v.kcal) >= 0) || !String(v.name).trim()) return;
      const dl=v.unit==='dl',amount=num(v.g),g=dl?0:amount,vml=dl?amount*100:0,nm=String(v.name).trim().slice(0,80);
      if(dl&&(!(amount>0)||vml>5000)){toast(t('badValue'));return;}
      if(v.keep&&amount>0){const divisor=dl?vml:g,k100=x=>r1(num(x)*100/divisor),d=D(),same=d.myFoods.find(z=>z.name.toLowerCase()===nm.toLowerCase());
        const z={id:same?same.id:uid(),name:nm,kcal:k100(v.kcal),p:k100(v.p),c:k100(v.c),f:k100(v.f),port:Math.round(divisor),t:Date.now(),...(dl?{basis:'ml'}:{})};d.myFoods=same?d.myFoods.map(o=>o.id===z.id?z:o):d.myFoods.concat([z]);}
      if(!addFood([{...v,g,...(dl?{vml}:{})}], 'manual')){toast(t('saveFailed'));return;} closeSheet(true); rerender(); toast(t('added')); }
    if (k === 'myfood') {
      const nm = String(v.name || '').trim().slice(0, 80), kc = num(v.kcal); if (!nm || !(kc >= 0 && kc <= 950)||!String(v.kcal).trim()) { toast(t('badValue')); return; }
      if ([v.p, v.c, v.f].some(x => num(x) < 0 || num(x) > 100)) { toast(t('badValue')); return; }
      const d = D(), id = ui.myfood.id, z = { id: id || uid(), name: nm, kcal: r1(kc), p: r1(num(v.p)), c: r1(num(v.c)), f: r1(num(v.f)), port: Math.max(0, Math.min(5000, Math.round(num(v.port)))), t: Date.now() };if(v.basis==='ml')z.basis='ml';
      d.myFoods = id ? d.myFoods.map(o => o.id === id ? z : o) : d.myFoods.concat([z]); Store.save(); closeSheet(); if (topIs('settings')) refreshSheet(); toast(t('saved'));
    }
    if (k === 'exm-vid') {
      const id = f.dataset.id, vid = String(v.vid || '').trim(), had = D().exMedia[id]; if (vid && !urlOk(vid)) { toast(t('vidBad')); return; }
      if (EX[id]) { if (vid || (had && had.img)) D().exMedia[id] = { img: (had && had.img) || '', vid }; else delete D().exMedia[id]; Store.save(); closeSheet(); toast(t('saved')); }
    }
    if (k === 'coach') coachSend(v.q);
    if(k==='planner-calendar')connectCalendar(v);
    if(k==='planner-event'){
      const draft=ui.plannerDraft;if(!draft||draft.source)return;
      const date=String(v.date||''),allDay=v.allDay==='on',validTime=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x||'');
      const error=$('.planner-form-error',f);
      if(!String(v.title||'').trim()||!DailyPlanner.validDay(date)||!allDay&&(!validTime(v.start)||!validTime(v.end))){error.hidden=false;error.textContent=t('badValue');return;}
      const start=+new Date(date+'T'+(allDay?'00:00':v.start)),endDate=new Date(date+'T'+(allDay?'00:00':v.end));
      if(allDay||+endDate<=start)endDate.setDate(endDate.getDate()+1);
      const next=DailyPlanner.cleanEvent({...draft,title:v.title,start,end:+endDate,allDay,repeat:v.repeat,category:v.category,note:v.note,updatedAt:Date.now()});
      if(!next){error.hidden=false;error.textContent=t('badValue');return;}
      if(D().planner.events.length>=6000&&!draft.existing){error.hidden=false;error.textContent=t('plannerCalendarLimit');return;}
      if(plannerCommit({...D().planner,events:D().planner.events.filter(e=>e.id!==next.id).concat([next])})){ui.plannerDate=date;closeSheet();rerender();}
    }
    if (k === 'profile-edit') saveProfile(v);
    if(k==='cardio')saveCardio(v);
    if(k==='workout-energy'){
      const energy=WorkoutEnergy.cleanStrength(v);if(!energy){toast(t('badValue'));return;}
      if(ui.energyTarget==='active')finishWorkout(energy,true);
      else {const w=D().workouts.find(w=>w.id===ui.energyTarget);if(!w)return;const before=w.energy,at=w.energyAt;w.energy=energy;w.energyAt=Date.now();if(!Store.save()){w.energy=before;w.energyAt=at;return;}closeSheet();refreshSheet();rerender();}
    }
    if (k === 'friend-add') {
      const value=String(v.identifier||'').trim();ui.friendValue=value;
      if(v.kind==='username'){
        const username=value.replace(/^@/,'').toLowerCase();
        if(!/^[a-z0-9_]{3,24}$/.test(username)){ui.friendError='usernameRule';ui.friendNotice='';rerender();return;}
        socialAction('social_request_friend',{p_username:username});
      }else if(['email','phone'].includes(v.kind))socialAction('social_request_friend_contact',{p_identifier:value,p_kind:v.kind});
    }
    if (k === 'contact-settings') socialAction('social_save_contact_settings',{p_email:v.email==='on',p_phone:v.phone==='on'});
    if (k === 'phone-verify') phoneVerification(v);
    if (k === 'gate-setup') setupSubmit(v);
    if(k==='profile-review'){const body=String(v.body||'').trim(),target=ui.reviewDraft?.target;if(!target||target!==ui.friendProfile?.user_id)return;if(!body){toast(t('badValue'));return;}ui.reviewDraft.body=body;ui.reviewDraft.rating=+v.rating;communityAction('social_review_save',{p_user:target,p_rating:+v.rating,p_text:body});}
    if (k === 'gate') gateSubmit(v);
  });

  /* A photo missing from this copy of the app is fetched from the open dataset instead (needs a connection). */
  document.addEventListener('error', e => {
    const el = e.target; if (!el || el.tagName !== 'IMG') return; const src = el.getAttribute('src') || '';
    if (src.indexOf('img/fig/') === 0 || src.indexOf('img/guide/') === 0 || src.indexOf('img/routine-line/') === 0) {
      const holder = el.closest('[data-id]'), id = holder && holder.dataset.id;
      if (id) ui.figBad[id] = 1;
      if (!el.closest('.drawing-picture') && id && window.ROUTINE_ART[id] && EX[id]?.k >= 2) { el.src=img(id,'t');return; }
      const picture = el.closest('.drawing-picture');
      if (picture && id && EX[id] && EX[id].k >= 2) { const button=picture.closest('button'),phase=Number((button||holder).dataset.phase)||0;const source=img(id,phase);el.className='';el.src=source;if(button){button.dataset.source=source;button.dataset.board='0';button.setAttribute('aria-label',t('figPhoto')+': '+el.alt);}return; }
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
  dlg().addEventListener('close', () => {
    if (dlg().open) return; // A queued close event can arrive after the sheet reopens.
    ui.sheets = [];
    if (unlockSheet) { unlockSheet(); unlockSheet = null; }
    if (ui.tab === "settings") { if(ui.settingsNavigate){ui.settingsNavigate=false;render();}else rerender(); }
  });
  dlg().addEventListener('cancel', e => {
    // File inputs emit a bubbling cancel when their native picker is dismissed.
    // Only the dialog's own cancel (Escape/back) should dismiss the sheet.
    if (e.target !== dlg()) return;
    e.preventDefault(); closeSheet(true);
  });      // Esc key: close with the same slide
  document.addEventListener('click',e=>{const summary=e.target.closest?.('summary'),details=summary?.parentElement;if(details?.dataset.section){ui.sections=ui.sections||{};ui.sections[details.dataset.section]=!details.open;}});
  /* Opening and closing a section glides to its new height instead of jumping (skipped with fewer animations). */
  document.addEventListener('click', e => {
    const sum = e.target.closest && e.target.closest('summary'), d = sum && sum.parentElement, ctl = e.target.closest && e.target.closest('a,button,input,select,label,textarea');
    if (!d || d.tagName !== 'DETAILS' || sum !== d.firstElementChild || (ctl && ctl !== sum && sum.contains(ctl)) || calm() || !d.animate) return;
    e.preventDefault();
    const cs = getComputedStyle(d), from = d.getBoundingClientRect().height, closing = d._glide ? !d._glideClosing : d.open;   // a second tap mid-way turns it around
    if (d._glide) { const g = d._glide; d._glide = null; g.cancel(); }
    if (!closing) d.open = true;
    const to = closing ? sum.getBoundingClientRect().bottom - d.getBoundingClientRect().top + parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth) : d.getBoundingClientRect().height;
    if (Math.abs(to - from) < 2) { if (closing) d.open = false; return; }
    d.style.overflow = 'hidden';
    const g = d.animate({ height: [from + 'px', to + 'px'] }, { duration: Math.round(Math.min(340, 170 + Math.abs(to - from) * 0.2)), easing: 'cubic-bezier(.2,.8,.2,1)' });
    d._glide = g; d._glideClosing = closing;
    g.onfinish = () => { if (d._glide !== g) return; d._glide = null; d.style.overflow = ''; if (closing) d.open = false; };
    g.oncancel = () => { d.style.overflow = ''; };
  }, true);
  document.addEventListener('toggle', e => { if(e.target.isConnected&&e.target.dataset?.section){ui.sections=ui.sections||{};ui.sections[e.target.dataset.section]=e.target.open;} if(e.target.matches?.('.profile-lifts'))ui.profileRanks=e.target.open;if(e.target.matches?.('.contact-discovery'))ui.contactOpen=e.target.open;if(e.target.matches?.('.friend-competition'))ui.friendCompetition=e.target.open;if(e.target.matches?.('.routine-group')){ui.routineGroups=ui.routineGroups||{};ui.routineGroups[e.target.dataset.program]=e.target.open;}if(e.target.matches?.('.settings-group')){ui.settingsGroups=ui.settingsGroups||{};ui.settingsGroups[e.target.dataset.group]=e.target.open;} }, true);
  // Horizontal swipes browse weeks; vertical gestures keep normal page scrolling.
  let weekGesture=null,weekSuppressUntil=0;
  document.addEventListener('touchstart',e=>{const card=e.target.closest?.('.momentum-week-browser');const touch=e.touches[0];weekGesture=card&&e.touches.length===1?{card,x:touch.clientX,y:touch.clientY,at:performance.now()}:null;},{passive:true});
  document.addEventListener('touchcancel',()=>{weekGesture=null;},{passive:true});
  document.addEventListener('touchend',e=>{const g=weekGesture;weekGesture=null;if(!g||!g.card.isConnected||e.touches.length)return;const p=e.changedTouches[0];if(!p)return;const dx=p.clientX-g.x,dy=p.clientY-g.y;if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.5||performance.now()-g.at>1200)return;weekSuppressUntil=performance.now()+400;A['habit-week-step']({dataset:{d:dx<0?'1':'-1'}});},{passive:true});
  document.addEventListener('click',e=>{if(performance.now()<weekSuppressUntil&&e.target.closest?.('.momentum-week-browser')){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('touchstart', () => {}, { passive: true });                   // lets iOS show the pressed state of buttons
  dlg().addEventListener('click', e => { if (e.target !== dlg()) return; const r = dlg().getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) closeSheet(true); });
  Charts.bind(document);HueWheel.bind(document);
  document.addEventListener('change',e=>{if(e.target.matches?.('.hue-wheel input')){clearTimeout(hueT);Store.save();}});
  $('#tabbar').innerHTML = [['home', IC.home], ['food', IC.food], ['goals', IC.habit], ['settings', IC.gear]].map(([k, ic]) => `<button data-a="${k==='settings'?'settings':'tab'}" data-tab="${k}">${ic}<span>${k==='settings'?esc(t('settings')):''}</span></button>`).join('');
  $('#restbar').innerHTML = `<div class="rb-in"><span class="rb-l">${IC.check}</span><b id="rb-time">0:00</b><span class="rb-track"><i id="rb-fill"></i></span><button class="btn sm" data-a="rest-add" data-s="-15">−15</button><button class="btn sm" data-a="rest-add" data-s="15">+15</button><button class="btn sm primary" data-a="rest-skip" id="rb-skip"></button></div>`;
  { const cb = $('#coach'); if (cb) { cb.innerHTML = IC.chat; cb.dataset.a = 'coach'; } }
  if(!CL)upgradeStarterSessions();
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
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ui.tab==='goals'&&ui.goals==='planner')syncCalendars(false);});
  setInterval(()=>{if(!document.hidden&&ui.tab==='goals'&&ui.goals==='planner')syncCalendars(false);},60000);
  if (ride) { if (!ride.paused) rideGeo(true); rideDraw(); }
  setInterval(() => { if (ride && !document.hidden) rideDraw(); }, 1000);
  addEventListener('pagehide', () => rideStore(true));
  document.addEventListener('visibilitychange', () => { if (!ride) return; if (document.hidden) rideStore(true); else { if (ui.rideOpen) rideWake(); if (!ride.paused) rideGeo(true); rideDraw(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { dayCheck(); tick(); if (D().active && ui.wOpen) wake(); if (CL && CL.user && Date.now() - CL.state.at > 30000) doSync(false); } });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => { ui.persisted = p; }).catch(() => {});
  if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>checkForUpdate(true));
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(() => navigator.serviceWorker.ready).then(reg => {if(reg.active)reg.active.postMessage('warm-images');checkForUpdate(true);}).catch(() => {});
  checkForUpdate();
  window.addEventListener('online',()=>checkForUpdate(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForUpdate();});
  setInterval(()=>{if(!document.hidden)checkForUpdate();},60000);
  window.__gym = { ui, render, A, rideFix, rideSensorData, get ride() { return ride; }, checkForUpdate, updateOverlay, parseAct, aiMemo, dbCheck, autoIcon, coachContext, coachSystem, doSync, hueRGB, calcTargets, prepList, dayTargets, nextRoutine, applyPlan }; window.__gymFood = { search: foodSearch, of: foodOf };
})();



