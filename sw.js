/* GymApp service worker: makes the app start instantly and work with no connection.
   Bump VERSION whenever you upload changed files so phones pick them up. */
const VERSION = 'v1';
const SHELL = 'gym-shell-' + VERSION, IMG = 'gym-img-v1';
const CORE = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'data/exercises.js',
  'js/i18n.js', 'js/plan.js', 'js/musclemap.js', 'js/store.js', 'js/charts.js', 'js/ai.js', 'js/app.js',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const PLAN_IMG = ["img/ex/Barbell_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Pullups/0.jpg","img/ex/Pullups/1.jpg","img/ex/Incline_Dumbbell_Press/0.jpg","img/ex/Incline_Dumbbell_Press/1.jpg","img/ex/Leverage_Iso_Row/0.jpg","img/ex/Leverage_Iso_Row/1.jpg","img/ex/Side_Lateral_Raise/0.jpg","img/ex/Side_Lateral_Raise/1.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/0.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/1.jpg","img/ex/Incline_Dumbbell_Curl/0.jpg","img/ex/Incline_Dumbbell_Curl/1.jpg","img/ex/Barbell_Full_Squat/0.jpg","img/ex/Barbell_Full_Squat/1.jpg","img/ex/Romanian_Deadlift/0.jpg","img/ex/Romanian_Deadlift/1.jpg","img/ex/Leg_Press/0.jpg","img/ex/Leg_Press/1.jpg","img/ex/Lying_Leg_Curls/0.jpg","img/ex/Lying_Leg_Curls/1.jpg","img/ex/Seated_Calf_Raise/0.jpg","img/ex/Seated_Calf_Raise/1.jpg","img/ex/Ab_Crunch_Machine/0.jpg","img/ex/Ab_Crunch_Machine/1.jpg","img/ex/Thigh_Adductor/0.jpg","img/ex/Thigh_Adductor/1.jpg","img/ex/Standing_Military_Press/0.jpg","img/ex/Standing_Military_Press/1.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Dips_-_Chest_Version/0.jpg","img/ex/Dips_-_Chest_Version/1.jpg","img/ex/Single-Arm_Cable_Crossover/0.jpg","img/ex/Single-Arm_Cable_Crossover/1.jpg","img/ex/Seated_Side_Lateral_Raise/0.jpg","img/ex/Seated_Side_Lateral_Raise/1.jpg","img/ex/Incline_Barbell_Triceps_Extension/0.jpg","img/ex/Incline_Barbell_Triceps_Extension/1.jpg","img/ex/Cable_One_Arm_Tricep_Extension/0.jpg","img/ex/Cable_One_Arm_Tricep_Extension/1.jpg","img/ex/Bent_Over_Barbell_Row/0.jpg","img/ex/Bent_Over_Barbell_Row/1.jpg","img/ex/Wide-Grip_Lat_Pulldown/0.jpg","img/ex/Wide-Grip_Lat_Pulldown/1.jpg","img/ex/Seated_Cable_Rows/0.jpg","img/ex/Seated_Cable_Rows/1.jpg","img/ex/Cable_Rear_Delt_Fly/0.jpg","img/ex/Cable_Rear_Delt_Fly/1.jpg","img/ex/Barbell_Curl/0.jpg","img/ex/Barbell_Curl/1.jpg","img/ex/Hammer_Curls/0.jpg","img/ex/Hammer_Curls/1.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg","img/ex/Front_Barbell_Squat/0.jpg","img/ex/Front_Barbell_Squat/1.jpg","img/ex/Seated_Leg_Curl/0.jpg","img/ex/Seated_Leg_Curl/1.jpg","img/ex/Barbell_Hip_Thrust/0.jpg","img/ex/Barbell_Hip_Thrust/1.jpg","img/ex/Split_Squat_with_Dumbbells/0.jpg","img/ex/Split_Squat_with_Dumbbells/1.jpg","img/ex/Leg_Extensions/0.jpg","img/ex/Leg_Extensions/1.jpg","img/ex/Standing_Calf_Raises/0.jpg","img/ex/Standing_Calf_Raises/1.jpg","img/ex/Cable_Crunch/0.jpg","img/ex/Cable_Crunch/1.jpg"];

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
/* Hand cached app files to the page marked "always re-check", so a reload can never reuse an older in-memory copy. */
function revalidated(r) { const h = new Headers(r.headers); h.set('Cache-Control', 'no-cache'); return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h }); }

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;            // API calls go straight to the network
  if (url.pathname.includes('/img/ex/')) {                                        // photos: cache first, keep forever
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
