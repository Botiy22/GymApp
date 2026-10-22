const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');global.window=global;require('../js/i18n.js');
test('all EN/HU keys, nested vocabulary and interpolation placeholders match',()=>{
 function check(a,b,path=''){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),path);for(const k of Object.keys(a)){if(a[k]&&typeof a[k]==='object'){check(a[k],b[k],path+k+'.');continue;}assert.equal(typeof a[k],'string',path+k);assert.ok(a[k].trim(),path+k);assert.ok(typeof b[k]==='string'&&b[k].trim(),path+k);assert.deepEqual((a[k].match(/\{\d+\}/g)||[]).sort(),(b[k].match(/\{\d+\}/g)||[]).sort(),path+k);}}check(I18N.en,I18N.hu);
});
test('all literal UI translation calls resolve in both languages',()=>{
 for(const filename of ['app.js','stories.js']){const source=fs.readFileSync(__dirname+'/../js/'+filename,'utf8');for(const match of source.matchAll(/\bt\(['"]([^'"]+)['"]\s*[,)]/g)){for(const lang of ['en','hu'])assert.equal(typeof I18N[lang][match[1]],'string',filename+':'+lang+':'+match[1]);}}
});
