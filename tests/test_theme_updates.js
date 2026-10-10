const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};vm.createContext(c);
for(const file of ['js/accent-theme.js','js/app-updates.js','js/profile.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
const T=c.window.AccentTheme,U=c.window.AppUpdates,P=c.window.Profile,plain=x=>JSON.parse(JSON.stringify(x));
test('all vivid presets have readable fill labels and light/dark accent text',()=>{
 for(const hue of [null,25,155,250,270,300,350]){
  const fill=T.fill(hue),ink=T.ink(fill)==='#ffffff'?[255,255,255]:[12,14,18];
  assert.ok(T.contrast(fill,ink)>=4.5,String(hue));
  assert.ok(T.contrast(T.text(fill,true),[255,255,255])>=4.5);
  assert.ok(T.contrast(T.text(fill,false),[30,32,40])>=4.5);
 }
 assert.deepEqual(plain(T.fill(270)),[53,88,244]);assert.deepEqual(plain(T.fill(350)),[237,62,148]);
});
test('release checks compare versions then numeric build numbers without downgrade',()=>{
 const current={version:'2.18.0',build:'20261010.2'};
 assert.equal(U.newer(current,current),false);
 assert.equal(U.newer(current,{version:'2.18.0',build:'20261010.10'}),true);
 assert.equal(U.newer(current,{version:'2.19.0',build:'20261009.1'}),true);
 assert.equal(U.newer(current,{version:'2.17.0',build:'20271010.1'}),false);
 assert.equal(U.newer(current,{version:'2.18.0',build:'20261009.9'}),false);
 for(const value of [null,{}, {version:'bad',build:'20261010.3'},{version:'2.18.1',build:'bad'}])assert.equal(U.newer(current,value),false);
 assert.equal(U.cacheId(current),'v2.18.0-20261010.2');
});
test('profile layouts sanitize independently of the compatible public profile',()=>{
 assert.deepEqual(plain(P.cleanStyle({cover:'mesh',frame:'ring',useAccent:true})),{cover:'mesh',frame:'ring',useAccent:true});
 assert.deepEqual(plain(P.cleanStyle({cover:'<script>',frame:'bad',useAccent:'yes'})),{cover:'glow',frame:'soft',useAccent:false});
 const publicProfile=P.clean({username:'existing_user',theme:'violet',cover:'mesh'});
 assert.equal(publicProfile.username,'existing_user');assert.equal(publicProfile.theme,'violet');assert.equal('cover' in publicProfile,false);
});
