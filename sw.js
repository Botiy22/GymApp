/* Tungsten service worker: makes the app start instantly and work with no connection.
   Bump VERSION whenever you upload changed files so phones pick them up. */
const VERSION = 'v2-goals-calendar-20261007';
const SHELL = 'gym-shell-' + VERSION, IMG = 'gym-img-v3';   // v3: invalidate replaced movement boards as well as cached photos
const CORE = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'data/exercises.js', 'data/exercises.hu.js', 'data/foods.js', 'data/recipes.js', 'data/figures.js', 'data/body.js', 'data/additions.js', 'data/muscle-details.js',
  'js/i18n.js', 'js/plan.js', 'js/musclemap.js', 'js/config.js', 'js/momentum.js', 'js/store.js', 'js/charts.js', 'js/ai.js', 'js/cloud.js', 'js/app.js',
  'img/fig/0211-0.svg', 'img/fig/0211-1.svg', 'img/fig/0114-0.svg', 'img/fig/0114-1.svg', 'img/fig/0201-0.svg', 'img/fig/0201-1.svg', 'img/fig/press.webp', 'img/fig/row.webp', 'img/fig/lat-wide.webp', 'img/fig/lat-medium.webp', 'img/fig/0122-0.svg', 'img/fig/0122-1.svg', 'img/fig/0093-0.svg', 'img/fig/0093-1.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const PLAN_IMG = ["img/ex/Barbell_Bench_Press_-_Medium_Grip/t.jpg","img/ex/Barbell_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Pullups/t.jpg","img/ex/Pullups/0.jpg","img/ex/Pullups/1.jpg","img/ex/Incline_Dumbbell_Press/t.jpg","img/ex/Incline_Dumbbell_Press/0.jpg","img/ex/Incline_Dumbbell_Press/1.jpg","img/ex/Leverage_Iso_Row/t.jpg","img/ex/Leverage_Iso_Row/0.jpg","img/ex/Leverage_Iso_Row/1.jpg","img/ex/Side_Lateral_Raise/t.jpg","img/ex/Side_Lateral_Raise/0.jpg","img/ex/Side_Lateral_Raise/1.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/t.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/0.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/1.jpg","img/ex/Incline_Dumbbell_Curl/t.jpg","img/ex/Incline_Dumbbell_Curl/0.jpg","img/ex/Incline_Dumbbell_Curl/1.jpg","img/ex/Barbell_Full_Squat/t.jpg","img/ex/Barbell_Full_Squat/0.jpg","img/ex/Barbell_Full_Squat/1.jpg","img/ex/Romanian_Deadlift/t.jpg","img/ex/Romanian_Deadlift/0.jpg","img/ex/Romanian_Deadlift/1.jpg","img/ex/Leg_Press/t.jpg","img/ex/Leg_Press/0.jpg","img/ex/Leg_Press/1.jpg","img/ex/Lying_Leg_Curls/t.jpg","img/ex/Lying_Leg_Curls/0.jpg","img/ex/Lying_Leg_Curls/1.jpg","img/ex/Seated_Calf_Raise/t.jpg","img/ex/Seated_Calf_Raise/0.jpg","img/ex/Seated_Calf_Raise/1.jpg","img/ex/Ab_Crunch_Machine/t.jpg","img/ex/Ab_Crunch_Machine/0.jpg","img/ex/Ab_Crunch_Machine/1.jpg","img/ex/Thigh_Adductor/t.jpg","img/ex/Thigh_Adductor/0.jpg","img/ex/Thigh_Adductor/1.jpg","img/ex/Standing_Military_Press/t.jpg","img/ex/Standing_Military_Press/0.jpg","img/ex/Standing_Military_Press/1.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/t.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Dips_-_Chest_Version/t.jpg","img/ex/Dips_-_Chest_Version/0.jpg","img/ex/Dips_-_Chest_Version/1.jpg","img/ex/Single-Arm_Cable_Crossover/t.jpg","img/ex/Single-Arm_Cable_Crossover/0.jpg","img/ex/Single-Arm_Cable_Crossover/1.jpg","img/ex/Seated_Side_Lateral_Raise/t.jpg","img/ex/Seated_Side_Lateral_Raise/0.jpg","img/ex/Seated_Side_Lateral_Raise/1.jpg","img/ex/Incline_Barbell_Triceps_Extension/t.jpg","img/ex/Incline_Barbell_Triceps_Extension/0.jpg","img/ex/Incline_Barbell_Triceps_Extension/1.jpg","img/ex/Cable_One_Arm_Tricep_Extension/t.jpg","img/ex/Cable_One_Arm_Tricep_Extension/0.jpg","img/ex/Cable_One_Arm_Tricep_Extension/1.jpg","img/ex/Bent_Over_Barbell_Row/t.jpg","img/ex/Bent_Over_Barbell_Row/0.jpg","img/ex/Bent_Over_Barbell_Row/1.jpg","img/ex/Wide-Grip_Lat_Pulldown/t.jpg","img/ex/Wide-Grip_Lat_Pulldown/0.jpg","img/ex/Wide-Grip_Lat_Pulldown/1.jpg","img/ex/Seated_Cable_Rows/t.jpg","img/ex/Seated_Cable_Rows/0.jpg","img/ex/Seated_Cable_Rows/1.jpg","img/ex/Cable_Rear_Delt_Fly/t.jpg","img/ex/Cable_Rear_Delt_Fly/0.jpg","img/ex/Cable_Rear_Delt_Fly/1.jpg","img/ex/Barbell_Curl/t.jpg","img/ex/Barbell_Curl/0.jpg","img/ex/Barbell_Curl/1.jpg","img/ex/Hammer_Curls/t.jpg","img/ex/Hammer_Curls/0.jpg","img/ex/Hammer_Curls/1.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/t.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg","img/ex/Front_Barbell_Squat/t.jpg","img/ex/Front_Barbell_Squat/0.jpg","img/ex/Front_Barbell_Squat/1.jpg","img/ex/Seated_Leg_Curl/t.jpg","img/ex/Seated_Leg_Curl/0.jpg","img/ex/Seated_Leg_Curl/1.jpg","img/ex/Barbell_Hip_Thrust/t.jpg","img/ex/Barbell_Hip_Thrust/0.jpg","img/ex/Barbell_Hip_Thrust/1.jpg","img/ex/Split_Squat_with_Dumbbells/t.jpg","img/ex/Split_Squat_with_Dumbbells/0.jpg","img/ex/Split_Squat_with_Dumbbells/1.jpg","img/ex/Leg_Extensions/t.jpg","img/ex/Leg_Extensions/0.jpg","img/ex/Leg_Extensions/1.jpg","img/ex/Standing_Calf_Raises/t.jpg","img/ex/Standing_Calf_Raises/0.jpg","img/ex/Standing_Calf_Raises/1.jpg","img/ex/Cable_Crunch/t.jpg","img/ex/Cable_Crunch/0.jpg","img/ex/Cable_Crunch/1.jpg"];

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
  if (url.pathname.includes('/img/ex/') || url.pathname.includes('/img/fig/')) {   // photos and drawings: cache first, keep forever
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

