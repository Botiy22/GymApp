/* Otisport service worker: makes the app start instantly and work with no connection.
   Bump js/release.js whenever you publish changed files so phones pick them up. */
importScripts('js/release.js');
const VERSION = GYM_RELEASE.cacheId;
const SHELL = 'gym-shell-' + VERSION, IMG = 'gym-img-v3';   // v3: invalidate replaced movement boards as well as cached photos
const CORE = ['js/personal-setup.js', 'css/otisport-theme.css', 'js/profile.js', 'js/social.js', 'css/profile.css', 'js/modal-lock.js', './', 'js/release.js', 'index.html', 'css/app.css', 'manifest.webmanifest', 'data/exercises.js', 'data/exercises.hu.js', 'data/foods.js', 'data/recipes.js', 'data/figures.js', 'data/body.js', 'data/additions.js', 'data/muscle-details.js',
  'js/i18n.js', 'js/plan.js', 'js/musclemap.js', 'js/config.js', 'js/momentum.js', 'js/store.js', 'js/charts.js', 'js/ai.js', 'js/cloud.js', 'js/app.js', 'js/strength-ranks.js', 'js/pdf-local.js', 'js/office-local.js', 'vendor/jszip/jszip.min.js', 'js/plan-import.js', 'css/plan-import.css', 'css/design.css', 'js/plan-sheet.js', 'vendor/pdfjs/pdf.min.mjs', 'vendor/pdfjs/pdf.worker.min.mjs',
  'img/fig/0211-0.svg', 'img/fig/0211-1.svg', 'img/fig/0114-0.svg', 'img/fig/0114-1.svg', 'img/fig/0201-0.svg', 'img/fig/0201-1.svg', 'img/fig/press.webp', 'img/fig/row.webp', 'img/fig/lat-wide.webp', 'img/fig/lat-medium.webp', 'img/fig/0122-0.svg', 'img/fig/0122-1.svg', 'img/fig/0093-0.svg', 'img/fig/0093-1.svg', 'icons/otisport-apple-180.png', 'icons/otisport-192.png', 'icons/otisport-512.png', 'icons/otisport-maskable-512.png'];
const PLAN_IMG = ["img/ex/Barbell_Bench_Press_-_Medium_Grip/t.jpg","img/ex/Barbell_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Pullups/t.jpg","img/ex/Pullups/0.jpg","img/ex/Pullups/1.jpg","img/ex/Incline_Dumbbell_Press/t.jpg","img/ex/Incline_Dumbbell_Press/0.jpg","img/ex/Incline_Dumbbell_Press/1.jpg","img/ex/Leverage_Iso_Row/t.jpg","img/ex/Leverage_Iso_Row/0.jpg","img/ex/Leverage_Iso_Row/1.jpg","img/ex/Side_Lateral_Raise/t.jpg","img/ex/Side_Lateral_Raise/0.jpg","img/ex/Side_Lateral_Raise/1.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/t.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/0.jpg","img/ex/Cable_Rope_Overhead_Triceps_Extension/1.jpg","img/ex/Incline_Dumbbell_Curl/t.jpg","img/ex/Incline_Dumbbell_Curl/0.jpg","img/ex/Incline_Dumbbell_Curl/1.jpg","img/ex/Barbell_Full_Squat/t.jpg","img/ex/Barbell_Full_Squat/0.jpg","img/ex/Barbell_Full_Squat/1.jpg","img/ex/Romanian_Deadlift/t.jpg","img/ex/Romanian_Deadlift/0.jpg","img/ex/Romanian_Deadlift/1.jpg","img/ex/Leg_Press/t.jpg","img/ex/Leg_Press/0.jpg","img/ex/Leg_Press/1.jpg","img/ex/Lying_Leg_Curls/t.jpg","img/ex/Lying_Leg_Curls/0.jpg","img/ex/Lying_Leg_Curls/1.jpg","img/ex/Seated_Calf_Raise/t.jpg","img/ex/Seated_Calf_Raise/0.jpg","img/ex/Seated_Calf_Raise/1.jpg","img/ex/Ab_Crunch_Machine/t.jpg","img/ex/Ab_Crunch_Machine/0.jpg","img/ex/Ab_Crunch_Machine/1.jpg","img/ex/Thigh_Adductor/t.jpg","img/ex/Thigh_Adductor/0.jpg","img/ex/Thigh_Adductor/1.jpg","img/ex/Standing_Military_Press/t.jpg","img/ex/Standing_Military_Press/0.jpg","img/ex/Standing_Military_Press/1.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/t.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg","img/ex/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg","img/ex/Dips_-_Chest_Version/t.jpg","img/ex/Dips_-_Chest_Version/0.jpg","img/ex/Dips_-_Chest_Version/1.jpg","img/ex/Single-Arm_Cable_Crossover/t.jpg","img/ex/Single-Arm_Cable_Crossover/0.jpg","img/ex/Single-Arm_Cable_Crossover/1.jpg","img/ex/Seated_Side_Lateral_Raise/t.jpg","img/ex/Seated_Side_Lateral_Raise/0.jpg","img/ex/Seated_Side_Lateral_Raise/1.jpg","img/ex/Incline_Barbell_Triceps_Extension/t.jpg","img/ex/Incline_Barbell_Triceps_Extension/0.jpg","img/ex/Incline_Barbell_Triceps_Extension/1.jpg","img/ex/Cable_One_Arm_Tricep_Extension/t.jpg","img/ex/Cable_One_Arm_Tricep_Extension/0.jpg","img/ex/Cable_One_Arm_Tricep_Extension/1.jpg","img/ex/Bent_Over_Barbell_Row/t.jpg","img/ex/Bent_Over_Barbell_Row/0.jpg","img/ex/Bent_Over_Barbell_Row/1.jpg","img/ex/Wide-Grip_Lat_Pulldown/t.jpg","img/ex/Wide-Grip_Lat_Pulldown/0.jpg","img/ex/Wide-Grip_Lat_Pulldown/1.jpg","img/ex/Seated_Cable_Rows/t.jpg","img/ex/Seated_Cable_Rows/0.jpg","img/ex/Seated_Cable_Rows/1.jpg","img/ex/Cable_Rear_Delt_Fly/t.jpg","img/ex/Cable_Rear_Delt_Fly/0.jpg","img/ex/Cable_Rear_Delt_Fly/1.jpg","img/ex/Barbell_Curl/t.jpg","img/ex/Barbell_Curl/0.jpg","img/ex/Barbell_Curl/1.jpg","img/ex/Hammer_Curls/t.jpg","img/ex/Hammer_Curls/0.jpg","img/ex/Hammer_Curls/1.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/t.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg","img/ex/Seated_Dumbbell_Palms-Up_Wrist_Curl/1.jpg","img/ex/Front_Barbell_Squat/t.jpg","img/ex/Front_Barbell_Squat/0.jpg","img/ex/Front_Barbell_Squat/1.jpg","img/ex/Seated_Leg_Curl/t.jpg","img/ex/Seated_Leg_Curl/0.jpg","img/ex/Seated_Leg_Curl/1.jpg","img/ex/Barbell_Hip_Thrust/t.jpg","img/ex/Barbell_Hip_Thrust/0.jpg","img/ex/Barbell_Hip_Thrust/1.jpg","img/ex/Split_Squat_with_Dumbbells/t.jpg","img/ex/Split_Squat_with_Dumbbells/0.jpg","img/ex/Split_Squat_with_Dumbbells/1.jpg","img/ex/Leg_Extensions/t.jpg","img/ex/Leg_Extensions/0.jpg","img/ex/Leg_Extensions/1.jpg","img/ex/Standing_Calf_Raises/t.jpg","img/ex/Standing_Calf_Raises/0.jpg","img/ex/Standing_Calf_Raises/1.jpg","img/ex/Cable_Crunch/t.jpg","img/ex/Cable_Crunch/0.jpg","img/ex/Cable_Crunch/1.jpg"];

// Commit a release only after every file matches its published content hash.
// Never refresh individual app modules inside an already active release.
let refreshing=null;
function verifiedRelease(){
  if(refreshing)return refreshing;
  refreshing=(async()=>{
    const nonce=Date.now().toString(36),stageName=SHELL+'-download',stage=await caches.open(stageName);
    try{
      const response=await fetch('release-manifest.json?check='+nonce,{cache:'no-store'});
      if(!response.ok)throw new Error('release manifest unavailable');
      const release=await response.json();
      if(release.version!==GYM_RELEASE.version||release.build!==GYM_RELEASE.build)throw new Error('release changed during update');
      const results=await Promise.allSettled(CORE.map(async path=>{
        const url=new URL(path,self.registration.scope);url.searchParams.set('__gym_build',GYM_RELEASE.build);
        const file=await fetch(url,{cache:'no-store'});if(!file.ok)throw new Error('missing '+path);
        const digest=await crypto.subtle.digest('SHA-256',await file.clone().arrayBuffer());
        const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
        if(hash!==release.assets[path])throw new Error('outdated or incomplete '+path);
        await stage.put(new URL(path,self.registration.scope).href,file);
      }));
      const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
      const cache=await caches.open(SHELL);
      for(const path of CORE){const url=new URL(path,self.registration.scope).href;await cache.put(url,await stage.match(url));}
      await cache.put(new URL('release-manifest.json',self.registration.scope).href,new Response(JSON.stringify(release),{headers:{'Content-Type':'application/json'}}));
    }finally{await caches.delete(stageName);}
  })().finally(()=>{refreshing=null;});
  return refreshing;
}
self.addEventListener('install',e=>e.waitUntil(verifiedRelease().then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('gym-shell-')&&key!==SHELL)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='release-info'){if(e.ports&&e.ports[0])e.ports[0].postMessage({version:VERSION});return;}
  // Warming exercise photos runs after activation, so it cannot delay an update.
  if(e.data==='warm-images'){
    e.waitUntil(caches.open(IMG).then(cache=>Promise.all(PLAN_IMG.map(async url=>{
      if(await cache.match(url))return;
      try{const response=await fetch(url);if(response.ok)await cache.put(url,response);}catch(error){}
    }))));return;
  }
  if(e.data!=='refresh'&&!(e.data&&e.data.type==='refresh'))return;
  e.waitUntil((async()=>{
    let ok=true;try{await verifiedRelease();}catch(error){ok=false;}
    if(e.ports&&e.ports[0])e.ports[0].postMessage(e.data==='refresh'?ok:{ok,verified:ok,version:VERSION,release:GYM_RELEASE.version,build:GYM_RELEASE.build});
  })());
});
function revalidated(response){const headers=new Headers(response.headers);headers.set('Cache-Control','no-cache');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
const coreURLs=new Set(CORE.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;
  if(url.pathname.endsWith('/release-manifest.json')){e.respondWith(fetch(req,{cache:'no-store'}));return;}
  const canonical=new URL(url);canonical.search='';canonical.hash='';
  if(coreURLs.has(canonical.href)){
    e.respondWith(caches.open(SHELL).then(async cache=>{
      const hit=await cache.match(canonical.href);
      // A verified release is immutable. Updating means activating a new worker.
      return hit?revalidated(hit):Response.error();
    }));return;
  }
  if(url.pathname.includes('/img/ex/')||url.pathname.includes('/img/fig/')){
    e.respondWith(caches.open(IMG).then(cache=>cache.match(req).then(hit=>hit||fetch(req).then(response=>{if(response.ok)cache.put(req,response.clone());return response;}))));return;
  }
  e.respondWith(fetch(req).catch(()=>req.mode==='navigate'?caches.open(SHELL).then(cache=>cache.match(new URL('index.html',self.registration.scope).href)):Response.error()));
});
