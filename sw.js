/* Tungsten service worker: makes the app start instantly and work with no connection.
   Bump VERSION whenever you upload changed files so phones pick them up. */
const VERSION = 'v3-guides-20261006-2';
const SHELL = 'gym-shell-' + VERSION, IMG = 'gym-img-v5';   // Invalidate replaced guide boards on update.
const CORE = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'data/exercises.js', 'data/exercises.hu.js', 'data/foods.js', 'data/recipes.js', 'data/figures.js', 'data/body.js', 'data/additions.js', 'data/muscle-details.js', 'data/exercise-guides.js', 'js/exercise-guide.js',
  'js/i18n.js', 'js/plan.js', 'js/musclemap.js', 'js/config.js', 'js/momentum.js', 'js/store.js', 'js/charts.js', 'js/ai.js', 'js/cloud.js', 'js/app.js',
  'img/fig/press.webp', 'img/fig/row.webp', 'img/fig/lat-wide.webp', 'img/fig/lat-medium.webp', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const PLAN_IMG = ["img/guide/Barbell_Bench_Press_-_Medium_Grip.webp", "img/guide/Pullups.webp", "img/guide/Incline_Dumbbell_Press.webp", "img/guide/Leverage_Iso_Row.webp", "img/guide/Side_Lateral_Raise.webp", "img/guide/Cable_Rope_Overhead_Triceps_Extension.webp", "img/guide/Incline_Dumbbell_Curl.webp", "img/guide/Barbell_Full_Squat.webp", "img/guide/Romanian_Deadlift.webp", "img/guide/Leg_Press.webp", "img/guide/Lying_Leg_Curls.webp", "img/guide/Seated_Calf_Raise.webp", "img/guide/Ab_Crunch_Machine.webp", "img/guide/Thigh_Adductor.webp", "img/fig/press.webp", "img/guide/Barbell_Incline_Bench_Press_-_Medium_Grip.webp", "img/guide/Dips_-_Chest_Version.webp", "img/guide/Single-Arm_Cable_Crossover.webp", "img/guide/Seated_Side_Lateral_Raise.webp", "img/guide/Incline_Barbell_Triceps_Extension.webp", "img/guide/Cable_One_Arm_Tricep_Extension.webp", "img/fig/row.webp", "img/fig/lat-wide.webp", "img/guide/Seated_Cable_Rows.webp", "img/guide/Cable_Rear_Delt_Fly.webp", "img/guide/Barbell_Curl.webp", "img/guide/Hammer_Curls.webp", "img/guide/Seated_Dumbbell_Palms-Up_Wrist_Curl.webp", "img/guide/Front_Barbell_Squat.webp", "img/guide/Seated_Leg_Curl.webp", "img/guide/Barbell_Hip_Thrust.webp", "img/guide/Split_Squat_with_Dumbbells.webp", "img/guide/Leg_Extensions.webp", "img/guide/Standing_Calf_Raises.webp", "img/guide/Cable_Crunch.webp", "img/guide/Standing_Overhead_Barbell_Triceps_Extension.webp", "img/guide/Barbell_Lunge.webp", "img/fig/lat-medium.webp", "img/guide/Underhand_Cable_Pulldowns.webp"];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL); await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    const ic = await caches.open(IMG);
    await Promise.all(PLAN_IMG.map(u => ic.match(u).then(hit => hit || fetch(u).then(r => r.ok ? ic.put(u, r) : null).catch(() => null))));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== IMG) await caches.delete(k);
    await self.clients.claim();
  })());
});
/* "Check for update" in Settings: fetch every app file fresh (bypassing all caches), then tell the page whether it worked. */
self.addEventListener('message', e => {
  if (e.data !== 'refresh') return;
  e.waitUntil((async () => {
    let ok = true;
    try { const c = await caches.open(SHELL); await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))); } catch (err) { ok = false; }
    if (e.ports && e.ports[0]) e.ports[0].postMessage(ok);
  })());
});
/* Hand cached app files to the page marked "always re-check", so a reload can never reuse an older in-memory copy. */
function revalidated(r) { const h = new Headers(r.headers); h.set('Cache-Control', 'no-cache'); return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h }); }

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;            // API calls go straight to the network
  if (url.pathname.includes('/img/ex/') || url.pathname.includes('/img/fig/') || url.pathname.includes('/img/guide/')) {   // photos and drawings: cache first, keep forever
    e.respondWith(caches.open(IMG).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(caches.open(SHELL).then(async c => {                              // app files: answer from cache, refresh in the background
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req.url, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);   // no-cache: ask the server every time, so an update is never masked by the browser cache
    if (hit) { e.waitUntil(net); return revalidated(hit); }
    return (await net) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
  }));
});

