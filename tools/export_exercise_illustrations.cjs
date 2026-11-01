/* Export reviewed generated boards at native resolution, preserving complete poses.
   npm install --prefix /tmp/reppsy-art sharp; NODE_PATH=/tmp/reppsy-art/node_modules node tools/export_exercise_illustrations.cjs
   PNG masters stay outside the app. Existing generated artwork is reused verbatim. */
const fs=require('node:fs'),crypto=require('node:crypto'),sharp=require('sharp');
global.window=global;
for(const f of ['exercises','exercises.hu','recipes','figures','additions','routine-art','library-expansion','exercise-guides','exercise-guides-extra'])require('../data/'+f+'.js');
const dir='img/atlas-line',manifest=JSON.parse(fs.readFileSync(dir+'/generation-20261031.json'));
const records=new Map(manifest.records.map(r=>[r.id,r]));
const art={};
async function phases(id,input,split,gap=3){
 const meta=await sharp(input).metadata(),mid=split||Math.floor(meta.width/2);
 const pair=[];
 for(const n of [0,1]){
  const left=n?mid+gap:0,width=n?meta.width-left:mid-gap,path=`${dir}/${id}-${n}.webp`;
  // fit:contain avoids changing anatomical proportions; no cropping of the pose.
  const buffer=await sharp(input).extract({left,top:0,width,height:meta.height}).resize(768,1024,{fit:'contain',background:'white',withoutEnlargement:true}).webp({quality:92,effort:6}).toBuffer();
  fs.writeFileSync(path,buffer);pair.push(path);
  if(!n)await sharp(buffer).resize(240,320,{fit:'contain',background:'white'}).webp({quality:85}).toFile(`${dir}/${id}-t.webp`);
 }
 return {pair,thumb:`${dir}/${id}-t.webp`,source:'generated'};
}
(async()=>{
 for(const id of Object.keys(EXERCISE_GUIDES)){
  const r=records.get(id),existing=ROUTINE_ART[id];
  if(r){
   if(!r.reviewed)throw Error('Review artwork before export: '+id);
   if(!r.source||!fs.existsSync(r.source))throw Error('Missing master: '+id);
   const input=fs.readFileSync(r.source);r.source_sha256=crypto.createHash('sha256').update(input).digest('hex');
   art[id]=await phases(id,input,r.split, r.gap??3);
  }else if(existing?.source==='generated')art[id]={...existing,source:'generated'};
  else if(existing?.source==='Reppsy'){
   // Older generated boards used an SVG viewport around an embedded WebP.
   const svg=fs.readFileSync(existing.pair[0],'utf8'),input=Buffer.from(svg.match(/base64,([^\"]+)/)[1],'base64');
   art[id]=await phases(id,input,null,0);
  }
 }
 fs.writeFileSync('data/generated-exercise-art.js','/* Original generated illustrations; exact exercise IDs, no stock-photo fallback. */\nwindow.GENERATED_EXERCISE_ART = '+JSON.stringify(art,null,2)+';\n');
 manifest.records=[...records.values()];fs.writeFileSync(dir+'/generation-20261031.json',JSON.stringify(manifest,null,2)+'\n');
 console.log('Illustrated exercises:',Object.keys(art).length);
})().catch(e=>{console.error(e);process.exitCode=1;});
