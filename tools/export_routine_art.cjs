// Resize/crop reviewed imagegen boards into compact deployment assets; retain the masters.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'img/routine-line/generation.json'),'utf8'));
 const folder=path.join(root,'img/routine-line'),masters=path.join(folder,'source');fs.mkdirSync(masters,{recursive:true});
 for(const entry of manifest.images){
  const source=entry.generatedPath;
  fs.copyFileSync(source,path.join(masters,entry.id+'.png'));
  const meta=await sharp(source).metadata(),half=Math.floor(meta.width/2);
  for(const phase of [0,1]){
   const buffer=await sharp(source).extract({left:phase*half+3,top:0,width:half-6,height:meta.height}).resize(640,640,{fit:'contain',background:'#fff'}).webp({quality:88}).toBuffer();
   fs.writeFileSync(path.join(folder,entry.id+'-'+phase+'.webp'),buffer);
   if(!phase)await sharp(buffer).resize(240,240).webp({quality:85}).toFile(path.join(folder,entry.id+'-t.webp'));
  }
 }
 global.window=global;require('../data/routine-art.js');
 const swpath=path.join(root,'sw.js');let sw=fs.readFileSync(swpath,'utf8');
 const paths=['data/routine-art.js',...Object.values(ROUTINE_ART).flatMap(x=>[...x.pair,x.thumb])];
 const core=sw.match(/const CORE = \[([\s\S]*?)\];/)[1];
 const current=new Set([...core.matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]));
 const additions=[...new Set(paths)].filter(x=>!current.has(x));
 if(additions.length)sw=sw.replace('const CORE = [','const CORE = ['+additions.map(x=>JSON.stringify(x)).join(', ')+', ');
 fs.writeFileSync(swpath,sw);
 console.log('Exported',manifest.images.length,'line boards; added',additions.length,'offline assets.');
})().catch(e=>{console.error(e);process.exitCode=1;});
