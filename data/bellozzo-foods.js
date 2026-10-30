/* Bellozzo Hungary: transcribed from the owner's screenshot of the official table.
   Source: https://www.bellozzo.hu/files/images/allergens/tapertek_allergentablazat.jpg
   Received 2026-10-30; publication date and serving weights are NOT printed.
   Printed column order below: kcal, FAT, CARBS, PROTEIN, per named serving.
   Pasta sauce WITH toppings and pasta BASE are separate rows and must be added.
   Drinks lack complete macros in this image and are deliberately not entered.
   The table does not provide full ingredient lists. Never infer them from names. */
window.BellozzoFoods=(()=>{
  'use strict';
  const source='https://www.bellozzo.hu/files/images/allergens/tapertek_allergentablazat.jpg';
  const sauces=[
    ['bianco','Pasta in bianco',[457,38,10,17],[600,51,13,21]],
    ['pomodoro','Pomodoro',[195,16,6,6],[307,26,9,7]],
    ['arrabbiata','Arrabbiata',[195,16,6,6],[307,26,9,7]],
    ['carbonara','Carbonara',[597,38,2,21],[925,58,2,33]],
    ['pesto','Pesto',[503,50,3,10],[699,70,4,11]],
    ['pesto-bianco','Pesto Bianco',[624,60,6.6,14],[909,88,9.9,19]],
    ['pesto-rosso','Pesto Rosso',[701,67,11,13],[1030,99,17,17]],
    ['cacciatore','Cacciatore',[453,33,9,29],[599,46,14,30]],
    ['bolognese','Bolognese',[398,29,7,26],[612,46,10,38]],
    ['sorrentino','Sorrentino',[414,33,9,19],[735,59,17,32]],
    ['scampi','Scampi',[376,25,17,18],[572,39,29,25]],
    ['primavera','Primavera',[542,44,5,31],[770,66,6,37]]
  ];
  const bases=[
    ['fusilloni','Fusilloni durum','Fusilloni','fusilli|fusilloni|fusilloni durum|fusilli durum',[398,1,79,16],[597,2,119,24]],
    ['gnocchi','Gnocchi','Gnocchi','gnocchi|gnocchival',[311,2,64,7],[466,3,96,10]],
    ['linguine','Linguine durum','Linguine','linguine|linguine durum|linguinével|linguinevel',[343,1,68,14],[489,1,98,20]],
    ['mezze','Mezze teljes kiőrlésű','Wholewheat mezze','mezze|teljes kiőrlésű mezze|mezze teljes kiőrlésű|wholewheat mezze',[378,2,71,14],[567,3,107,21]],
    ['penne','Penne','Penne','penne|pennével|pennevel',[352,1,70,14],[548,2,105,21]]
  ];
  const pizzas=[
    ['margherita','Margherita',[727,19,87,46],[1050,28,126,67]],
    ['quattro-formaggi','Quattro formaggi',[874,32,85,56],[1328,51,123,86]],
    ['salame','Salame',[819,27,88,53],[1198,41,123,77]],
    ['prosciutto-cotto','Prosciutto Cotto',[780,21,88,54],[1139,32,127,79]],
    ['prosciutto-funghi','Prosciutto e Funghi',[767,21,86,53],[1120,31,124,77]],
    ['prosciutto-crudo','Prosciutto Crudo',[864,28,88,60],[1305,44,127,92]],
    ['carnissima','Carnissima',[1012,43,88,62],[1518,66,129,96]],
    ['guanciale','Guanciale',[1045,53,87,49],[1542,80,127,72]],
    ['bianca','Bianca',[829,32,83,48],[1221,46,121,70]],
    ['coppa','Coppa',[957,41,86,57],[1408,61,125,83]],
    ['tartufo','Tartufo',[871,36,84,48],[1285,54,123,70]]
  ];
  const singles=[
    ['salad-piccolo','Piccolo saláta','Piccolo salad',[21,0,4,2]],
    ['salad-pesto','Pesto vega saláta','Pesto vegetarian salad',[347,27,14,10]],
    ['salad-cesare','Cesare vega saláta','Cesare vegetarian salad',[411,33,15,13]],
    ['salad-premio','Premio vega saláta','Premio vegetarian salad',[602,50,18,17]],
    ['salad-delizia','Delizia vega saláta','Delizia vegetarian salad',[369,31,14,7]],
    ['panna-cotta','Panna cotta karamellel','Panna cotta with caramel',[237,14,24,4]],
    ['tiramisu','Tiramisu','Tiramisu',[203,12,22,2]],
    ['nutella-calzone','Nutellás-mascarponés calzone','Nutella mascarpone calzone',[337,15,39,10]],
    ['pistachio-calzone','Pisztáciás calzone','Pistachio calzone',[333,15,39,9]],
    ['torta','Torta della Nonna','Torta della Nonna',[245,10,35,1]],
    ['crema-calzone','Calzone con crema','Calzone con crema',[200,2,34,10]]
  ];
  const extras=[
    ['chicken','Csirke','Chicken',[90,3,1,15]],['salami','Szalámi','Salami',[121,9,0,10]],
    ['bacon','Szalonna','Bacon',[201,21,0,2]],['crudo','Prosciutto Crudo','Prosciutto Crudo',[74,5,0,8]],
    ['cotto','Prosciutto Cotto','Prosciutto Cotto',[53,2,0,8]],['bacon-pizza','Bacon pizzára','Bacon for pizza',[80,7,0,4]],
    ['bacon-pasta','Bacon tésztára','Bacon for pasta',[132,12,0,7]],['shrimp','Rák','Shrimp',[99,4,0,15]],
    ['grana','Grana padano sajt','Grana padano cheese',[48,3,0,4]],['mozzarella-pasta','Mozzarella tésztára','Mozzarella for pasta',[99,7,0,8]],
    ['mozzarella-pizza','Mozzarella pizzára','Mozzarella for pizza',[207,16,4,13]],['gorgonzola','Gorgonzola','Gorgonzola',[64,5,0,4]],
    ['pine','Fenyőmag','Pine nuts',[13,1,0,0]],['tomato-pizza','Koktélparadicsom pizzára','Cherry tomatoes for pizza',[17,0,3,1]],
    ['tomato-pasta','Koktélparadicsom tésztára','Cherry tomatoes for pasta',[12,0,2,1]],['rocket','Rukkola','Rocket',[2,0,0,0]],
    ['mushroom','Gomba','Mushrooms',[16,0,0,2]],['onion','Lilahagyma','Red onion',[8,0,2,0]],
    ['basil','Bazsalikom','Basil',[3,0,0,0]],['chili-oil','Chilis olaj','Chili oil',[49,5,0,0]],
    ['olive-oil','Extraszűz olívaolaj','Extra virgin olive oil',[166,18,0,0]],['vinaigrette','Vinegrette','Vinaigrette',[100,10,3,0]],
    ['grissini','Grissini','Grissini',[50,0,8,3]]
  ];
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[(),·–—-]/g,' ').replace(/\s+/g,' ').trim();
  const macros=v=>({kcal:v[0],f:v[1],c:v[2],p:v[3]}),sum=(a,b)=>Object.fromEntries(['kcal','p','c','f'].map(k=>[k,Math.round((a[k]+b[k])*10)/10]));
  const records=[],groups=[];
  function record(id,hu,en,v,parts=[]){const values=macros(v);const warning=values.kcal>50&&Math.abs(values.kcal-(4*values.p+4*values.c+9*values.f))>values.kcal*.15;const r={id,hu,en,...values,parts,warning};records.push(r);return r;}
  function group(id,hu,en,names,rows,distinct=false){groups.push({id,hu,en,names:[...new Set([hu,en,...names].map(norm))],rows,distinct});}
  for(const [id,n,cl,gr] of sauces){const rows=[];['classico','grande'].forEach((size,index)=>{
    const sauce=macros(index?gr:cl),warn=sauce.kcal>50&&Math.abs(sauce.kcal-(4*sauce.p+4*sauce.c+9*sauce.f))>sauce.kcal*.15;
    for(const [bid,bhu,ben,aliases,bcl,bgr] of bases){const base=macros(index?bgr:bcl),v=sum(sauce,base),r=record('pasta-'+id+'-'+size+'-'+bid,`${n} ${size} · ${bhu}`,`${n} ${size} · ${ben}`,[v.kcal,v.f,v.c,v.p],[{hu:n,en:n,...sauce},{hu:bhu,en:ben,...base}]);r.size=size;r.base=bid;r.warning||=warn;rows.push(r);}
  });group('pasta-'+id,n,n,[id.replaceAll('-',' '),...(id==='bianco'?['in bianco']:[])],rows,id==='primavera');}
  for(const [id,n,small,large] of pizzas){const rows=[24,32].map((size,i)=>{const r=record('pizza-'+id+'-'+size,`${n} pizza · ${size} cm`,`${n} pizza · ${size} cm`,i?large:small);r.size=String(size);return r;});group('pizza-'+id,n+' pizza',n+' pizza',[n],rows);}
  for(const [id,hu,en,v] of singles){const r=record(id,hu,en,v);group(id,hu,en,[hu.replace(/ saláta$/,''),en.replace(/ salad$/,'')],[r]);}
  for(const [id,hu,en,v] of extras){const r=record('extra-'+id,'Extra '+hu,'Extra '+en,v);group('extra-'+id,'Extra '+hu,'Extra '+en,[],[r]);}
  function item(r,n){return {status:'ok',text:r.hu+' (Bellozzo)',name:r.hu+' (Bellozzo)',nameEn:'Bellozzo '+r.en,restaurantId:r.id,servings:n,basisUnit:'portion',grams:0,ml:0,label:true,exact:true,estimated:false,warning:r.warning,parts:r.parts,source,
    ...Object.fromEntries(['kcal','p','c','f'].flatMap(k=>[[k,Math.round(r[k]*n*10)/10],[k==='kcal'?'k100':k+'100',r[k]]]))};}
  function resolve(text,chosen){
    const original=String(text||'').trim();let s=norm(original).replace(/^(?:i (?:ate|had)|ettem|megettem)\s+/,'').replace(/^(?:a|az|the)\s+/,'');
    const branded=/\bbellozz[oó]\b/.test(s);s=s.replace(/\bbellozzo\b/g,' ').replace(/\s+/g,' ').trim();
    const size=s.match(/\b(classico|grande|24\s*cm|32\s*cm)\b/);if(size)s=s.replace(size[0],' ').replace(/\s+/g,' ').trim();
    let n=1;const amount=s.match(/^(\d+(?:[.,]\d+)?|fel|half|egy|one)\s*(?:(?:adag|servings?|portions?|db)\s+)?(?=[a-z])/);
    if(amount){n=/fel|half/.test(amount[1])?.5:/egy|one/.test(amount[1])?1:Number(amount[1].replace(',','.'));s=s.slice(amount[0].length).trim();}
    let base=null;for(const b of bases){for(const a of b[3].split('|').sort((a,b)=>b.length-a.length)){const x=norm(a),re=new RegExp('(?:^| )'+x+'(?:$| )');if(re.test(s)){base=b[0];s=s.replace(re,' ').replace(/\s+/g,' ').trim();break;}}if(base)break;}
    s=s.replace(/\b(?:tesztaval|teszta|pasta|with|alappal)\b/g,' ').replace(/\s+/g,' ').trim();
    if(!s)return null;
    const matches=groups.filter(g=>g.names.includes(s));
    // Bare everyday dishes remain generic unless the chain or a menu size is explicit.
    const group=matches.find(g=>branded||size||base||g.distinct);
    const hinted=branded||groups.some(g=>g.distinct&&s.includes(g.names[0]));
    if(!group)return hinted?[{text:original,original,status:'needRestaurantDetail'}]:null;
    if(!(n>0&&n<=20))return [{text:original,original,status:'needRestaurantDetail'}];
    const chosenSize=size?.[1].replace(/\s*cm/,'');
    const rows=group.rows.filter(r=>(!chosenSize||r.size===chosenSize)&&(!base||r.base===base));
    if(!rows.length)return [{text:original,original,status:'needRestaurantDetail'}];
    if(chosen){const r=rows.find(r=>r.id===chosen);return r?[item(r,n)]:null;}
    if(rows.length===1)return [item(rows[0],n)];
    return [{text:original,original,status:'needRestaurant',candidates:rows.map(r=>r.id),servings:n}];
  }
  function search(text){const q=norm(text).replace(/\bbellozzo\b/g,'').trim();if(!q&&!/bellozzo/i.test(text))return [];return groups.filter(g=>!q||g.names.some(n=>n.includes(q))).slice(0,20).map(g=>({name:g.hu,nameEn:g.en,query:'bellozzo '+g.hu}));}
  const description=(i,lang)=>{const en=lang==='en',r=records.find(r=>r.id===i.restaurantId);if(!r)return '';return (r.parts.length?(en?'1 serving: ':'1 adag: ')+r.parts.map(p=>(en?p.en:p.hu)+' '+p.kcal+' kcal').join(' + ')+'. ':'')+(i.warning?(en?'The source’s calories and macros disagree; values retained as printed. ':'A forrás kalóriája és makrói eltérnek; a közölt értékek szerepelnek. '):'')+(en?'Bellozzo table · per serving; weight not published.':'Bellozzo-táblázat · adagonként; a súly nincs megadva.');};
  return {version:1,source,records,groups,resolve,search,description};
})();
