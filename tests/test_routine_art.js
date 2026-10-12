'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
global.window=global;require('../js/routine-templates.js');require('../data/routine-art.js');
test('every starter exercise has a distinct exact-ID line pair and offline assets',()=>{
 const ids=[...new Set(RoutineTemplates.templates.flatMap(t=>t.days.flatMap(d=>d.items.map(i=>i.ex))))];
 assert.equal(ids.length,22);
 const release=JSON.parse(fs.readFileSync(path.join(__dirname,'../release-manifest.json'),'utf8'));
 for(const id of ids){
  const art=ROUTINE_ART[id];assert.ok(art,id);assert.equal(art.pair.length,2);assert.notEqual(art.pair[0],art.pair[1]);
  for(const file of [...art.pair,art.thumb]){assert.ok(fs.existsSync(path.join(__dirname,'..',file)),id+' '+file);assert.ok(release.assets[file],file+' offline hash');}
 }
 assert.ok(release.assets['data/routine-art.js']);
});
