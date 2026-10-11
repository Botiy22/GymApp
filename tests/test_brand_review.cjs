// Local Chromium review: no live accounts or external services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const mime = {'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
(async () => {
  const server = http.createServer((req,res) => {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.GYMAPP_BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    const context = await browser.newContext({serviceWorkers:'allow'});
    await context.addInitScript("Object.defineProperty(window,'CLOUD',{get:()=>({url:'',key:''}),set:()=>{}})");
    await context.route('https://**',route=>route.abort());
    const page = await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(()=>!!window.__gym);
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    for (const width of [320,390,768,1280]) {
      await page.setViewportSize({width,height:844});
      for (const lang of ['en','hu']) {
        await page.evaluate(lang=>{Store.d.settings.lang=lang;Store.d.settings.calm=true;Store.save();__gym.render();},lang);
        for (const tab of ['home','food','goals','settings']) {
          await page.locator(`#tabbar [data-tab="${tab}"]`).click();
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${lang} ${tab} overflow`);
          assert.ok(await page.locator('.app-wordmark img').evaluate(e=>e.complete&&e.naturalWidth>0));
        }
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>{Store.d.settings.lang='en';Store.d.settings.calm=false;Store.save();__gym.render();window.reviewOverlay=__gym.updateOverlay();});
    await page.locator('.reload-mark img').evaluate(e=>e.decode());
    assert.match(await page.locator('.reload-mark img').evaluate(e=>getComputedStyle(e).animationName),/reppsy-logo-turn/);
    assert.equal(await page.locator('#view').evaluate(e=>e.inert),true);
    fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(root,'artifacts/logo-update.png')});
    await page.evaluate(()=>reviewOverlay.message('updateSuccess'));
    await page.waitForTimeout(1200);
    assert.ok(await page.locator('.reload-mark img').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return Math.abs(m.b)<0.001&&Math.abs(m.a-1)<0.001;}),'mark rests upright');
    await page.evaluate(()=>{reviewOverlay.close();window.reviewOverlay=__gym.updateOverlay();});
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.reload-mark img').evaluate(e=>getComputedStyle(e).animationName),'none');
    await page.evaluate(()=>reviewOverlay.close());
    await context.setOffline(true);
    await page.reload();await page.waitForFunction(()=>!!window.__gym);
    assert.ok(await page.locator('.app-wordmark img').evaluate(e=>e.complete&&e.naturalWidth>0),'offline logo');
    await page.evaluate(()=>{localStorage.setItem('gymapp.v1.ride',JSON.stringify(Rides.start(Date.now())));Store.wipe();});
    assert.equal(await page.evaluate(()=>localStorage.getItem('gymapp.v1.ride')),null,'delete/sign-out clears separately stored ride');
    assert.deepEqual(errors,[]);
    console.log('Passed: 32 responsive views, logo loading/spin/upright finish/reduced motion, verified offline shell, no runtime errors.');
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
