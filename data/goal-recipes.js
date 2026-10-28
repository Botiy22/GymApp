/* Ingredient-calculated portions; nutrition provenance and goal rules:
   docs/RECIPE_NUTRITION.md. Existing oats builder and recipe IDs are preserved. */
(function(){
  const O=window.OvernightOats,R=window.RECIPES,F=window.FOODS;
  if(!O||!R||!F||window.GOAL_RECIPES_VERSION===1)return;
  const oats=[
    {id:'oats-lean-blueberry',hu:'Áfonyás fehérjés éjszakai zab',en:'Blueberry protein overnight oats',sel:{oats:40,skim:100,greek0:200,whey:10,blueberry:80}},
    {id:'oats-lean-raspberry',hu:'Málnás-kakaós fehérjés éjszakai zab',en:'Raspberry cocoa protein overnight oats',sel:{oats:40,skim:100,greek0:150,whey:15,raspberry:80,cocoa:5}},
    {id:'oats-lean-cherry',hu:'Meggyes-csokis fehérjés éjszakai zab',en:'Chocolate cherry protein overnight oats',sel:{oats:40,skim:120,greek0:170,whey:10,cherry:80,cocoa:5}},
    {id:'oats-lean-mango',hu:'Mangós-joghurtos fehérjés éjszakai zab',en:'Mango yogurt protein overnight oats',sel:{oats:40,skim:100,greek0:200,whey:10,mango:80}},
    {id:'oats-lean-apple',hu:'Almás-fahéjas fehérjés éjszakai zab',en:'Apple cinnamon protein overnight oats',sel:{oats:40,skim:100,greek0:200,whey:10,apple:100,cinnamon:1}}
  ];
  for(const preset of oats){
    if(R.items.some(r=>r.id===preset.id))continue;
    const apple=preset.id==='oats-lean-apple',cocoa=!!preset.sel.cocoa;
    const steps={
      en:[`Whisk the protein powder${cocoa?' and cocoa':''} into the skim milk until smooth, then stir in the 0% Greek yogurt.`,
          `Stir in the oats${apple?', cinnamon and grated apple':''}. ${apple?'':"Wash and prepare the fruit; reserve a little for the topping and fold the rest into the oats."}`.trim(),
          'Cover and refrigerate at 4 °C or below for at least 4 hours, ideally overnight.',
          `Stir before serving${apple?' and add a few reserved apple pieces':', then add the reserved fruit'}. Keep refrigerated and eat within 3 days.`],
      hu:[`Keverd csomómentesre a fehérjeport${cocoa?' és a kakaót':''} a sovány tejjel, majd add hozzá a 0%-os görög joghurtot.`,
          `Keverd bele a zabot${apple?', a fahéjat és a reszelt almát':''}. ${apple?'':"Mosd meg és készítsd elő a gyümölcsöt; egy keveset tegyél félre a tetejére, a többit forgasd a zabhoz."}`.trim(),
          'Lefedve tedd legfeljebb 4 °C-os hűtőbe legalább 4 órára, lehetőleg egész éjszakára.',
          `Tálalás előtt keverd át${apple?', és tegyél rá néhány félretett almakockát':', majd tedd rá a félretett gyümölcsöt'}. Hűtve tárold, és 3 napon belül fogyaszd el.`]
    };
    if(apple){steps.en[1]='Reserve a few small apple pieces for the topping. Grate the rest and stir it into the oats with the cinnamon.';steps.hu[1]='Néhány almakockát tegyél félre a tetejére. A többit reszeld le, és a fahéjjal együtt keverd a zabhoz.';}
    const v=O.compute(preset.sel);
    const ing=Object.entries(preset.sel).map(([id,a])=>{const it=O.ITEMS[id];return[it.hu,it.en,it.ml?[(a/100).toLocaleString('hu-HU')+' dl',(a/100)+' dl']:a];});
    const recipe={...preset,cat:'breakfast',min:5,servings:1,illustration:false,oats:{...preset.sel},ing,steps,art:['mix','mix','chill','serve'],leanProtein:true,nutritionBasis:'USDA SR28; generic ingredient values',...v,
      note:{en:'Use 0% yogurt and skim milk. Nutrition is estimated from these quantities; protein powders vary by brand.',hu:'0%-os joghurttal és sovány tejjel készítsd. A tápérték a megadott mennyiségekből számolt becslés; a fehérjeporok értékei márkánként eltérnek.'}};
    delete recipe.sel;delete recipe.parts;
    R.items.push(recipe);O.PRESETS.push({...preset,steps,art:recipe.art});
  }
  const row=ref=>{const hu=F.hu.find(h=>h[0]===ref);const found=hu?F.list[hu[1]]:F.list.find(r=>r[0]===ref);if(!found)throw new Error('Missing recipe ingredient: '+ref);return found;};
  const food=(ref,g,hu,en)=>({ref,g,hu,en});
  const chicken=()=>food('Csirkemell, sült',150,'Bőr nélküli csirkemell, sütés után mérve','Skinless chicken breast, cooked weight');
  const oil=()=>food('Olívaolaj',2,'Olívaolaj, a teljes recepthez','Olive oil, for the whole recipe');
  const lemon=()=>food('Lemon juice, raw',15,'Citromlé','Lemon juice');
  const garlic=()=>food('Garlic, raw',3,'Fokhagyma','Garlic');
  const cookChicken={
    en:'Pat about 200 g raw skinless chicken breast dry and flatten to an even thickness. Use the measured oil and seasoning; grill over medium-high heat, turning once, until the thickest part reaches 74 °C. Rest, then weigh out 150 g cooked chicken for this portion.',
    hu:'Kb. 200 g nyers, bőr nélküli csirkemellet törölj szárazra, és egyenletes vastagságúra lapíts. Használd a kimért olajat és fűszereket; közepesen erős rostlapon, egyszer megfordítva süsd, amíg a legvastagabb része eléri a 74 °C-ot. Pihentesd, majd mérj ki 150 g sült húst ehhez az adaghoz.'
  };
  const recipes=[
    {id:'grilled-chicken-bulgur',hu:'Citromos rostonsült csirkemell bulgursalátával',en:'Lemon grilled chicken with bulgur salad',min:25,
     foods:[chicken(),food('Bulgur, főtt',120,'Bulgur, főtt súly','Bulgur, cooked weight'),food('Cucumber, with peel, raw',100,'Uborka','Cucumber'),food('Tomatoes, red, ripe, raw, year round average',100,'Paradicsom','Tomato'),food('Görög joghurt, zsírmentes',50,'Görög joghurt, 0%','Greek yogurt, 0%'),lemon(),oil()],
     steps:{en:['Cook bulgur in water according to its packet, then weigh out 120 g cooked.',cookChicken.en,'Dice the cucumber and tomato. Mix the yogurt with the lemon juice, then toss some through the bulgur and vegetables.','Serve the sliced chicken with the bulgur salad and remaining lemon yogurt.'],hu:['A csomagolás szerint főzd meg vízben a bulgurt, majd mérj ki belőle 120 g főtt adagot.',cookChicken.hu,'Kockázd fel az uborkát és a paradicsomot. A joghurtot keverd össze a citromlével; egy részét forgasd a bulgurhoz és a zöldségekhez.','A felszeletelt csirkét a bulgursalátával és a maradék citromos joghurttal tálald.']},art:['boil','pan','mix','serve']},
    {id:'grilled-chicken-potato',hu:'Paprikás rostonsült csirkemell burgonyával és zöldbabbal',en:'Paprika grilled chicken with potatoes and green beans',min:30,
     foods:[chicken(),food('Burgonya, főtt',150,'Burgonya, főtt súly','Potatoes, boiled weight'),food('Beans, snap, green, cooked, boiled, drained, without salt',180,'Zöldbab, főtt és lecsepegtetett','Green beans, cooked and drained'),food('Spices, paprika',1,'Őrölt pirospaprika','Ground paprika'),oil()],
     steps:{en:['Boil the potatoes until tender and steam or boil the green beans. Weigh out the listed cooked portions.',cookChicken.en,'Season the chicken with the paprika before grilling; keep the heat moderate enough that the spice does not scorch.','Serve with the warm potatoes and beans. The listed oil covers the whole meal; no butter is needed.'],hu:['Főzd puhára a burgonyát, a zöldbabot pedig párold vagy főzd meg. Mérd ki a megadott főtt adagokat.',cookChicken.hu,'A csirkét sütés előtt ízesítsd a pirospaprikával; a hő ne legyen olyan erős, hogy a fűszer megégjen.','Meleg burgonyával és zöldbabbal tálald. A megadott olaj a teljes ételhez elegendő; vaj nem szükséges.']},art:['boil','pan','serve','serve']},
    {id:'grilled-chicken-brown-rice',hu:'Fokhagymás rostonsült csirkemell barna rizzsel és brokkolival',en:'Garlic grilled chicken with brown rice and broccoli',min:35,
     foods:[chicken(),food('Rice, brown, long-grain, cooked',120,'Barna rizs, főtt súly','Brown rice, cooked weight'),food('Brokkoli, főtt',180,'Brokkoli, főtt és lecsepegtetett','Broccoli, cooked and drained'),garlic(),lemon(),oil()],
     steps:{en:['Cook brown rice according to the packet and steam the broccoli until just tender. Weigh out the listed cooked portions.','Crush the garlic and mix with the lemon juice and measured oil. Brush over the chicken.',cookChicken.en,'Slice the chicken and serve with the rice and broccoli.'],hu:['A csomagolás szerint főzd meg a barna rizst, a brokkolit pedig párold roppanósra. Mérd ki a megadott főtt adagokat.','A zúzott fokhagymát keverd össze a citromlével és a kimért olajjal, majd kend a csirkére.',cookChicken.hu,'Szeleteld fel a csirkét, és a rizzsel, brokkolival tálald.']},art:['boil','mix','pan','serve']},
    {id:'grilled-chicken-couscous',hu:'Zöldfűszeres rostonsült csirkemell kuszkusszal és cukkinivel',en:'Herb grilled chicken with couscous and zucchini',min:25,
     foods:[chicken(),food('Kuszkusz, főtt',100,'Kuszkusz, elkészítve mérve','Couscous, cooked weight'),food('Squash, summer, zucchini, includes skin, cooked, boiled, drained, without salt',180,'Cukkini, párolva és lecsepegtetve','Zucchini, steamed and drained'),food('Tomatoes, red, ripe, raw, year round average',80,'Paradicsom','Tomato'),food('Parsley, fresh',5,'Petrezselyem','Parsley'),lemon(),oil()],
     steps:{en:['Cover couscous with boiling water according to its packet. Fluff and weigh out 100 g cooked.',cookChicken.en,'Steam the sliced zucchini, drain and weigh out 180 g. Chop the tomato and parsley.','Toss the couscous with the parsley and lemon juice. Serve with the sliced chicken and vegetables.'],hu:['A csomagolás szerint öntsd le forró vízzel a kuszkuszt. Lazítsd fel villával, és mérj ki 100 g kész adagot.',cookChicken.hu,'Párold meg a felkarikázott cukkinit, csepegtesd le, és mérj ki 180 g-ot. Aprítsd fel a paradicsomot és a petrezselymet.','A kuszkuszt forgasd össze a petrezselyemmel és a citromlével, majd tálald a csirkével és a zöldségekkel.']},art:['boil','pan','knife','serve']},
    {id:'grilled-chicken-sweet-potato',hu:'Rostonsült csirkemell édesburgonyával és joghurtos káposztasalátával',en:'Grilled chicken with sweet potato and yogurt slaw',min:35,
     foods:[chicken(),food('Édesburgonya, sütve',130,'Édesburgonya, sütés után mérve','Sweet potato, baked weight'),food('Cabbage, raw',120,'Fejes káposzta','White cabbage'),food('Carrots, raw',80,'Sárgarépa','Carrot'),food('Görög joghurt, zsírmentes',60,'Görög joghurt, 0%','Greek yogurt, 0%'),lemon(),oil()],
     steps:{en:['Bake the sweet potato on parchment at 200 °C until tender; weigh out 130 g cooked. Use the measured oil for the chicken.',cookChicken.en,'Finely shred the cabbage and carrot. Mix with the yogurt and lemon juice; no mayonnaise is needed.','Serve the sliced chicken with the sweet potato and slaw.'],hu:['Sütőpapíron, 200 °C-on süsd puhára az édesburgonyát; sütés után mérj ki 130 g-ot. A kimért olajat a csirkéhez használd.',cookChicken.hu,'A káposztát és a répát vékonyra reszeld. Keverd össze a joghurttal és a citromlével; majonéz nem szükséges.','A felszeletelt csirkét az édesburgonyával és a káposztasalátával tálald.']},art:['oven','pan','mix','serve']}
  ];
  // Season before cooking, not after the grilling instruction.
  const paprika=recipes.find(r=>r.id==='grilled-chicken-potato');
  for(const lang of ['hu','en'])[paprika.steps[lang][1],paprika.steps[lang][2]]=[paprika.steps[lang][2],paprika.steps[lang][1]];
  paprika.art=['boil','mix','pan','serve'];
  for(const recipe of recipes){
    if(R.items.some(r=>r.id===recipe.id))continue;
    const total={g:0,kcal:0,p:0,c:0,f:0};
    const parts=recipe.foods.map(i=>{const r=row(i.ref),part={...i,source:r[0]};['kcal','p','c','f'].forEach((k,n)=>{part[k]=r[n+1]*i.g/100;total[k]+=part[k];});total.g+=i.g;return part;});
    const {foods,...rest}=recipe;
    R.items.push({...rest,cat:'main',servings:1,illustration:false,leanProtein:true,ing:foods.map(i=>[i.hu,i.en,i.g]),nutritionParts:parts,nutritionBasis:'USDA SR28; cooked roasted chicken proxy for grilled',...Object.fromEntries(Object.entries(total).map(([k,v])=>[k,k==='g'||k==='kcal'?Math.round(v):Math.round(v*10)/10])),
      note:{en:'Nutrition is estimated for one portion using the listed cooked weights. Chicken needs to reach 74 °C; cooking time depends on thickness.',hu:'A tápérték egy adag becslése a feltüntetett főtt/sült súlyok alapján. A csirke érje el a 74 °C-os maghőt; a sütési idő a vastagságtól függ.'}});
  }
  window.GOAL_RECIPES_VERSION=1;
})();
