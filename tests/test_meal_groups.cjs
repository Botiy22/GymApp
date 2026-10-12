// Actual app/browser handlers with isolated sample data; no live account or API calls.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
(async()=>{
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(e,data)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(e?'missing':data);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.GYMAPP_BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Budapest',serviceWorkers:'block'});
 await context.addInitScript("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})");await context.route('https://**',r=>r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>!!window.__gym);
 async function openMeal(meal){const b=page.locator('.meal-group[data-meal="'+meal+'"] .meal-toggle');if(await b.getAttribute('aria-expanded')==='false')await b.click();await page.waitForTimeout(320);}
 const old=await page.evaluate(()=>{Store.d.settings.lang='en';Store.d.settings.calm=true;const k=__gym.ui.foodDate;Store.d.food[k]=[{id:'legacy_food',name:'Existing food',g:100,kcal:110,p:5,c:15,f:4,src:'manual',t:1234},{id:'labeled_food',name:'Previously labeled',g:80,kcal:90,p:3,c:10,f:2,src:'manual',t:2345,meal:'dinner',mealAt:50}];Store.save();__gym.render();return JSON.stringify(Store.d.food[k]);});
 await page.locator('#tabbar [data-tab="food"]').click();
 assert.equal(await page.locator('[data-in="meal-groups"]').isChecked(),false);
 await page.locator('[data-in="meal-groups"]').check();assert.equal(await page.locator('.meal-group').count(),5);
 assert.equal(await page.locator('.meal-toggle[aria-expanded="false"]').count(),5);await openMeal('other');assert.match(await page.locator('.meal-group[data-meal="other"]').innerText(),/Existing food/);
 await openMeal('dinner');assert.match(await page.locator('.meal-group[data-meal="dinner"]').innerText(),/Previously labeled/);
 assert.equal(await page.evaluate(()=>JSON.stringify(Store.d.food[__gym.ui.foodDate])),old,'turning on does not rewrite old foods');
 for(const meal of ['breakfast','lunch','dinner','snack','other']){
  await page.locator(`.meal-group[data-meal="${meal}"] [data-a="food-group-add"]`).click();
  assert.equal(await page.locator('[data-in="food-meal"]').inputValue(),meal);
  await page.locator('[data-a="fs-own"]').click();await page.locator('#fm [name="name"]').fill('Test '+meal);
  for(const [k,v]of Object.entries({g:'100',kcal:'100',p:'5',c:'10',f:'3'}))await page.locator(`#fm [name="${k}"]`).fill(v);
  await page.locator('[form="fm"]').click();await page.waitForFunction(()=>!document.getElementById('sheet').open);
  assert.match(await page.locator(`.meal-group[data-meal="${meal}"]`).innerText(),new RegExp('Test '+meal));
 }
 const total=await page.evaluate(()=>Store.d.food[__gym.ui.foodDate].reduce((n,f)=>n+f.kcal,0));assert.equal(total,700);
 await page.locator('.meal-group[data-meal="other"] [data-food-id="legacy_food"] [data-a="food-meal-edit"]').click();
 await page.locator('[data-in="food-meal"]').selectOption('lunch');await page.locator('[data-a="food-meal-save"]').click();
 assert.match(await page.locator('.meal-group[data-meal="lunch"]').textContent(),/Existing food/);
 assert.deepEqual(await page.evaluate(()=>{const f=Store.d.food[__gym.ui.foodDate].find(x=>x.id==='legacy_food');return {id:f.id,kcal:f.kcal,t:f.t,meal:f.meal};}),{id:'legacy_food',kcal:110,t:1234,meal:'lunch'});
 await page.locator('[data-in="meal-groups"]').uncheck();assert.equal(await page.locator('.meal-group').count(),0);
 assert.equal(await page.locator('[data-food-id]').count(),7);assert.equal(await page.evaluate(()=>Store.d.food[__gym.ui.foodDate].find(x=>x.id==='legacy_food').meal),'lunch');
 await page.reload();await page.waitForFunction(()=>!!window.__gym);await page.locator('#tabbar [data-tab="food"]').click();
 assert.equal(await page.locator('[data-in="meal-groups"]').isChecked(),false);await page.locator('[data-in="meal-groups"]').check();
 assert.match(await page.locator('.meal-group[data-meal="lunch"]').textContent(),/Existing food/);
 const preservation=await page.evaluate(()=>{const exported=JSON.parse(Store.exportJSON()).data,cleaned=Store.clean(exported);const k=__gym.ui.foodDate;return {entries:cleaned.food[k].length,meal:cleaned.food[k].find(x=>x.id==='legacy_food').meal,enabled:cleaned.settings.mealGroups};});
 assert.deepEqual(preservation,{entries:7,meal:'lunch',enabled:true});
 const merged=await page.evaluate(()=>{const a=Store.cloudDoc(),b=JSON.parse(JSON.stringify(a)),k=__gym.ui.foodDate;const af=a.food[k].find(x=>x.id==='legacy_food'),bf=b.food[k].find(x=>x.id==='legacy_food');af.meal='breakfast';af.mealAt=100;bf.meal='dinner';bf.mealAt=200;const x=Cloud.merge(a,b);delete af.meal;delete af.mealAt;const legacy=Cloud.merge(a,b);return {meal:x.food[k].find(f=>f.id==='legacy_food').meal,oldClientMeal:legacy.food[k].find(f=>f.id==='legacy_food').meal,count:x.food[k].length,kcal:x.food[k].reduce((n,f)=>n+f.kcal,0)};});
 assert.deepEqual(merged,{meal:'dinner',oldClientMeal:'dinner',count:7,kcal:700});
 // Real database-amount and AI-result handlers use the selected category too.
 await page.evaluate(()=>{__gym.ui.foodMeal='breakfast';__gym.ui.fa={food:{name:'Fixture database food',kcal:50,p:1,c:5,f:1,ports:[],key:'fixture'},g:'100',unit:'g'};__gym.A['fa-add']();__gym.ui.foodMeal='snack';__gym.ui.ai={res:{items:[{name:'Fixture AI food',grams:50,kcal:60,p:2,c:8,f:2}]},gone:[]};__gym.A['ai-add']();});
 assert.deepEqual(await page.evaluate(()=>Store.d.food[__gym.ui.foodDate].slice(-2).map(f=>f.meal)),['breakfast','snack']);
 // A real recipe portion offers a picker and retains the chosen dinner assignment.
 await page.evaluate(()=>{__gym.ui.foodMeal='dinner';__gym.A['idea-open']({dataset:{id:'protein-oats'}});});
 assert.equal(await page.locator('[data-in="food-meal"]').inputValue(),'dinner');
 await page.locator('[data-a="idea-add"]').click();await page.waitForFunction(()=>!document.getElementById('sheet').open);
 assert.equal(await page.evaluate(()=>Store.d.food[__gym.ui.foodDate].at(-1).meal),'dinner');
 // Toggle write failure rolls back both the preference and food entries.
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='gymapp.v1')throw new Error('fixture quota');return originalSetItem.call(this,k,v);};});
 await page.locator('[data-in="meal-groups"]').click();assert.equal(await page.locator('[data-in="meal-groups"]').isChecked(),true);
 assert.equal(await page.evaluate(()=>Store.d.food[__gym.ui.foodDate].length),10);
 await page.evaluate(()=>{Storage.prototype.setItem=originalSetItem;Store.save();});
 for(const width of [320,390,768])for(const lang of ['hu','en']){
  await page.setViewportSize({width,height:844});await page.evaluate(l=>{Store.d.settings.lang=l;__gym.render();},lang);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'grouped Food fits '+width+' '+lang);
 }
 // Imported meal detail uses exact meal totals; missing food-level values stay unknown.
 await page.evaluate(()=>{const k=__gym.ui.foodDate,idx=(new Date(k+'T12:00').getDay()+6)%7;Store.d.plan={name:'Document fixture',targets:false,notes:[],train:[],days:Array.from({length:7},()=>({type:'',total:null,meals:[]}))};Store.d.plan.days[idx].meals=[{id:'document_breakfast',name:'Breakfast',kcal:450,p:25,c:55,f:15,items:[{n:'Oats',g:60,kcal:230},{n:'Milk',g:200,kcal:null}]}];Store.d.settings.mealGroups=false;__gym.A['pm-tick']({dataset:{d:k,m:'document_breakfast'}});});
 const imported=await page.evaluate(()=>{const f=Store.d.food[__gym.ui.foodDate].find(f=>f.pm==='document_breakfast');return {meal:f.meal,kcal:f.kcal,p:f.p,items:f.items};});
 assert.deepEqual(imported,{meal:'breakfast',kcal:450,p:25,items:[{n:'Oats',g:60,kcal:230},{n:'Milk',g:200,kcal:null}]});
 await page.locator('[data-in="meal-groups"]').check();await openMeal('breakfast');
 assert.match(await page.locator('.meal-group[data-meal="breakfast"] .meal-food-parts').innerText(),/Oats · 60 g.*230 kcal/s);
 assert.equal(await page.locator('.meal-clock').count(),5);assert.equal(await page.locator('.meal-macros').count(),5);
 const conserved=await page.evaluate(()=>{const d=Store.clean(Store.d),f=d.food[__gym.ui.foodDate].find(f=>f.pm==='document_breakfast');return {kcal:f.kcal,items:f.items};});assert.equal(conserved.kcal,450);assert.equal(conserved.items[1].kcal,null);
 // Real switch element survives the redraw, allowing its thumb transition to run.
 await page.evaluate(()=>{window.mealSwitch=document.querySelector('[data-in="meal-groups"]');Store.d.settings.calm=false;__gym.ui.mealOpen={};__gym.render();window.mealSwitch=document.querySelector('[data-in="meal-groups"]');});
 await page.locator('[data-in="meal-groups"]').uncheck();assert.ok(await page.evaluate(()=>window.mealSwitch===document.querySelector('[data-in="meal-groups"]')));await page.locator('[data-in="meal-groups"]').check();
 assert.equal(await page.locator('.meal-toggle[aria-expanded="false"]').count(),5,'cards normally closed');
 await page.locator('.meal-group[data-meal="breakfast"] .meal-toggle').click();assert.equal(await page.locator('.meal-group[data-meal="breakfast"] .meal-panel').evaluate(e=>e.inert),false);
 await page.locator('.meal-group[data-meal="breakfast"] .meal-toggle').click();assert.equal(await page.locator('.meal-group[data-meal="breakfast"] .meal-panel').evaluate(e=>e.inert),true);
 await page.locator('#tabbar [data-tab="goals"]').click();
 const range=()=>page.locator('.momentum-week-nav small').textContent();const firstRange=await range();
 async function swipe(dx,dy=0){await page.locator('.momentum-week-browser').evaluate((el,{dx,dy})=>{el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,clientX:150,clientY:100})]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[new Touch({identifier:1,target:el,clientX:150+dx,clientY:100+dy})]}));},{dx,dy});}
 await swipe(90);assert.notEqual(await range(),firstRange);await swipe(-90);assert.equal(await range(),firstRange);await swipe(-90);assert.notEqual(await range(),firstRange);assert.equal(await page.locator('.momentum-week button:disabled').count(),7,'future week cannot log future goals');
 await swipe(90);await swipe(5,90);assert.equal(await range(),firstRange,'vertical scrolling does not browse weeks');
 await page.waitForTimeout(450);await page.locator('[data-a="habit-week-step"][data-d="-1"]').click();assert.notEqual(await range(),firstRange);await page.locator('[data-a="habit-week-step"][data-d="1"]').click();assert.equal(await range(),firstRange);
 for(const width of [320,390,768])for(const lang of ['hu','en']){await page.setViewportSize({width,height:844});await page.evaluate(l=>{Store.d.settings.lang=l;__gym.render();},lang);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Goals weeks fit '+width+' '+lang);}
 // Non-starter exercise with drawings must not retain its former photo thumbnail.
 await page.locator('#tabbar [data-tab="home"]').click();await page.evaluate(()=>{__gym.ui.workout='exercises';__gym.ui.lib.q='Hammer Curls';__gym.render();});
 const thumb=page.locator('[data-a="ex-open"][data-id="Hammer_Curls"] img');assert.match(await thumb.getAttribute('src'),/img\/fig\/0227-0\.svg/);await thumb.evaluate(e=>e.decode());
 // Every starter's index image must match the registered artwork.
 const thumbs=await page.evaluate(()=>{__gym.ui.lib.q='';__gym.ui.lib.limit=1000;__gym.render();return Object.entries(ROUTINE_ART).map(([id,art])=>({id,expected:art.thumb,actual:document.querySelector('.extile[data-id="'+id+'"] img')?.getAttribute('src')}));});
 for(const x of thumbs)assert.equal(x.actual,x.expected,x.id+' index art');
 fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});await page.locator('#tabbar [data-tab="food"]').click();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.scrollTo(0,0);document.getElementById('toast').classList.remove('on');});await page.screenshot({path:path.join(root,'artifacts/meal-groups.png'),fullPage:true});await page.locator('#food-diary').screenshot({path:path.join(root,'artifacts/meal-cards.png')});
 assert.deepEqual(errors,[]);console.log('Passed: meal-group toggle, five logging groups, reassignment, reload, backup, cloud merge, DB/AI logging, storage rollback, responsive HU/EN, compact expandable cards, imported food lists, week swipes and drawing thumbnails.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
