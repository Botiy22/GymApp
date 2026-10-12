const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GYMAPP_BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.resolve(__dirname,'../artifacts/phone-preview.html').replaceAll('\\','/'));
  const frame=page.frameLocator('iframe');
  const phone=frame.locator('.rp-phone[data-layout="hub"]');
  await phone.waitFor();
  for(const width of [320,390,736]){
   await page.setViewportSize({width,height:1100});
   for(const tab of ['today','workout','food','goals','settings']){
    await phone.locator(`.rp-footer [data-page="${tab}"]`).click();
    const bounds=await phone.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));
    assert.ok(bounds.scroll<=bounds.width+1,`${width} ${tab} overflow`);
   }
  }
  await phone.locator('.rp-footer [data-page="food"]').click();
  await phone.locator('[data-action="meal"]').click();
  assert.match(await phone.innerText(),/680/);
  await phone.locator('.rp-footer [data-page="goals"]').click();
  await phone.locator('[data-action="habit"]').first().click();
  assert.match(await phone.innerText(),/3 of 4/);
  await phone.locator('.rp-footer [data-page="workout"]').click();
  await phone.locator('[data-workout="Exercises"]').click();
  await phone.locator('.rp-tile').last().click();
  await phone.locator('.rp-art-pair img').first().evaluate(e=>e.decode());
  assert.match(await phone.innerText(),/1\. START/);
  await phone.locator('.rp-map summary').click();
  assert.ok(await phone.locator('.rp-map img').evaluate(e=>e.complete&&e.naturalWidth>0));
  await page.setViewportSize({width:736,height:1300});
  await page.emulateMedia({colorScheme:'dark'});
  await phone.locator('.rp-footer [data-page="today"]').click();
  await phone.screenshot({path:path.resolve(__dirname,'../artifacts/phone-home-preview.png')});
  assert.deepEqual(errors,[]);console.log('Passed: phone preview navigation, 15 responsive screens, meal/habit interactions, exercise drawings and muscle map.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
