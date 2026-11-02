/* Original Reppsy recipes. Whole-batch ingredients, per-serving nutrition.
   Generic USDA ingredients, not a branded product claim. See docs/RECIPE_NUTRITION.md. */
(function () {
  if (window.DESSERT_RECIPES_VERSION===2) return;
  const F = window.FOODS, R = window.RECIPES;
  const refs = {
    oats:['Oats','Zabpehely, finomra darálva','Oats, finely ground'],
    yogurt:['Yogurt, Greek, plain, nonfat','Görög joghurt, 0%','Greek yogurt, 0%'],
    cottage:['Cheese, cottage, lowfat, 2% milkfat','Cottage cheese, 2%','Cottage cheese, 2%'],
    whey:['Beverages, Protein powder whey based','Tejsavófehérje-por','Whey protein powder'],
    egg:['Egg, whole, raw, fresh','Tojás, héj nélkül','Egg, without shell'],
    blueberry:['Blueberries, raw','Áfonya','Blueberries'], raspberry:['Raspberries, raw','Friss málna','Fresh raspberries'],
    apple:['Apples, raw, with skin','Alma, magház nélkül','Apple, cored'], banana:['Bananas, raw','Banán, meghámozva','Banana, peeled'],
    cocoa:['Cocoa, dry powder, unsweetened','Cukrozatlan kakaópor','Unsweetened cocoa powder'],
    cinnamon:['Spices, cinnamon, ground','Őrölt fahéj','Ground cinnamon'], lemon:['Lemon peel, raw','Kezeletlen citrom reszelt héja','Unwaxed lemon zest'],
    baking:['Leavening agents, baking powder, double-acting, straight phosphate','Sütőpor','Baking powder']
  };
  const muffinStart = {
    hu:'Melegítsd elő a sütőt 180 °C-ra alsó-felső sütéssel (160 °C légkeveréssel). Készíts elő 6, egyenként kb. 150 ml-es szilikon muffinformát; tedd őket tepsire.',
    en:'Preheat to 180 °C conventional / 160 °C fan. Put 6 silicone muffin cups, about 150 ml each on a baking tray.'
  };
  const muffinEnd = {
    hu:'Oszd el 6 formában, legfeljebb háromnegyedig töltve. Süsd középen 20–25 percig; a közepükbe szúrt pálcikán ne maradjon nyers tészta. Hagyd 10 percig a formában, majd rácson hűtsd ki. Egy adag 2 muffin.',
    en:'Divide between 6 cups, filling no more than three-quarters full. Bake on the middle shelf for 20–25 minutes, until a skewer has no wet batter. Cool in the cups for 10 minutes, then on a rack. One serving is 2 muffins.'
  };
  const recipes = [
    {id:'protein-muffin-blueberry',hu:'Citromos-áfonyás proteinmuffin',en:'Lemon blueberry protein muffins',min:35,servings:3,portion:{hu:'2 muffin',en:'2 muffins'},amounts:{oats:90,yogurt:180,whey:60,egg:100,blueberry:120,baking:5,lemon:2},
      description:{hu:'Puha, gyümölcsös zabmuffin joghurttal. Hat darab, három uzsonnára.',en:'Soft yogurt oat muffins with juicy blueberries. Six muffins, three snack portions.'},
      steps:{hu:[muffinStart.hu,'A tojást keverd simára a joghurttal és a citromhéjjal. Külön tálban vegyítsd a darált zabot, a fehérjeport és a sütőport.','Röviden keverd össze a nedves és száraz részt; ne verd sokáig. Forgasd bele a megmosott, szárazra törölt áfonyát. A massza legyen sűrű, kanalazható; ha túl száraz, adj hozzá 1–2 evőkanál vizet.',muffinEnd.hu],en:[muffinStart.en,'Whisk the eggs, yogurt and lemon zest until smooth. In another bowl mix the ground oats, whey and baking powder.','Briefly combine the wet and dry mixtures; do not beat. Fold in washed, dried blueberries. The batter should be thick but spoonable; add 1–2 tablespoons of water if too stiff.',muffinEnd.en]},art:['oven','mix','mix','tray']},
    {id:'protein-muffin-chocolate',hu:'Kakaós cottage cheese proteinmuffin',en:'Cocoa cottage cheese protein muffins',min:35,servings:3,portion:{hu:'2 muffin',en:'2 muffins'},amounts:{oats:75,cottage:200,whey:60,egg:100,cocoa:15,baking:5},
      description:{hu:'Szaftos kakaós muffin, a tésztába turmixolt cottage cheese-zel.',en:'Moist cocoa muffins with cottage cheese blended into the batter.'},
      steps:{hu:[muffinStart.hu,'A cottage cheese-t és a tojást botmixerrel turmixold teljesen simára. Külön keverd össze a darált zabot, a fehérjeport, a kakaót és a sütőport.','Forgasd össze a két keveréket. Adj hozzá 2–4 evőkanál vizet, amíg sűrű, kanalazható masszát kapsz. Édesített kakaós vagy vaníliás fehérjeporral édesebb lesz; ízlés szerint használhatsz energiamentes édesítőt.',muffinEnd.hu],en:[muffinStart.en,'Blend the cottage cheese and eggs completely smooth. Separately mix the ground oats, whey, cocoa and baking powder.','Fold the mixtures together. Add 2–4 tablespoons of water to make a thick, spoonable batter. Sweetened chocolate or vanilla whey gives a sweeter result; add a zero-calorie sweetener to taste if desired.',muffinEnd.en]},art:['oven','blend','mix','tray']},
    {id:'protein-muffin-apple',hu:'Almás-fahéjas proteinmuffin',en:'Apple cinnamon protein muffins',min:35,servings:3,portion:{hu:'2 muffin',en:'2 muffins'},amounts:{oats:90,yogurt:150,whey:60,egg:100,apple:180,cinnamon:2,baking:5},
      description:{hu:'Almadarabos, fahéjas zabmuffin hozzáadott olaj nélkül.',en:'Cinnamon oat muffins with apple pieces and no added oil.'},
      steps:{hu:[muffinStart.hu,'Az alma felét durvára reszeld, a többit vágd apró kockákra. Keverd a tojást a joghurthoz, majd add hozzá a reszelt almát a levével együtt.','A darált zabot, fehérjeport, fahéjat és sütőport keverd össze. Forgasd a nedves részhez az almakockákkal együtt; néhány kockát tehetsz a tetejére. Szükség esetén 1 evőkanál vízzel lazítsd.',muffinEnd.hu],en:[muffinStart.en,'Coarsely grate half the apple and finely dice the rest. Whisk the eggs with the yogurt, then add the grated apple and its juice.','Mix the ground oats, whey, cinnamon and baking powder. Fold into the wet mixture with the diced apple; reserve a few pieces for the tops. Add a tablespoon of water if needed.',muffinEnd.en]},art:['oven','knife','mix','tray']},
    {id:'protein-cheesecake-berry',hu:'Málnás mini proteinsajttorta',en:'Raspberry mini protein cheesecakes',min:40,waitMin:120,servings:3,portion:{hu:'2 mini sajttorta',en:'2 mini cheesecakes'},amounts:{cottage:300,yogurt:150,whey:45,egg:100,raspberry:150,lemon:2},
      description:{hu:'Kekszalap nélküli, krémes mini sajttorta friss málnaszósszal.',en:'Creamy crustless mini cheesecakes with raspberry sauce.'},
      steps:{hu:['Melegítsd elő a sütőt 160 °C-ra alsó-felső sütéssel (140 °C légkeveréssel). Tegyél 6, egyenként kb. 150 ml-es szilikon muffinformát egy tepsire.','Turmixold simára a cottage cheese-t, joghurtot, fehérjeport és citromhéjat. A tojást röviden keverd bele; ne habosítsd. Édesítéshez vaníliás fehérjepor vagy energiamentes édesítő használható.','Oszd a krémet a 6 formába. Süsd 25–30 percig: a széle legyen szilárd, a közepe enyhén remeghet, de ne legyen folyós; tojásos töltelékként érje el a 71 °C-ot.','10 perc után vedd ki a formákat a tepsiből. Amint már nem forrók, tedd hűtőbe; legkésőbb 2 órán belül. Hűtsd legalább 2 órát, csak hidegen bontsd ki.','100 g málnát 1 evőkanál vízzel főzz 3–4 percig, majd hűtsd le. A sajttortákra oszd a szószt és a maradék 50 g friss málnát. Egy adag 2 darab.'],en:['Preheat to 160 °C conventional / 140 °C fan. Place 6 silicone muffin cups, about 150 ml each, on a tray.','Blend the cottage cheese, yogurt, whey and lemon zest smooth. Briefly mix in the eggs without whipping in air. Use vanilla whey or zero-calorie sweetener for sweetness.','Divide between the cups. Bake 25–30 minutes until the edges set and the centre jiggles slightly rather than looking liquid; the egg filling should reach 71 °C.','After 10 minutes, remove the cups from the hot tray. Refrigerate as soon as no longer hot, within 2 hours. Chill for at least 2 hours and unmould cold.','Simmer 100 g raspberries with a tablespoon of water for 3–4 minutes, then cool. Divide the sauce and remaining 50 g fresh berries over the cakes. One serving is 2 cakes.']},art:['oven','blend','oven','chill','serve']},
    {id:'protein-mousse-cocoa',hu:'Kakaós-banános fehérjekrém',en:'Cocoa banana protein cream',min:5,waitMin:20,servings:1,portion:{hu:'1 tál',en:'1 bowl'},amounts:{yogurt:200,whey:15,cocoa:8,banana:70},
      description:{hu:'Sűrű csokikrém görög joghurtból, tejszín és nyers tojás nélkül.',en:'Thick chocolate yogurt cream without cream or raw egg.'},
      steps:{hu:['Szitáld a kakaót és a fehérjeport egy tálba. Adj hozzá 2 evőkanálnyit a kimért joghurtból, és keverd csomómentes pasztává.','Dolgozd bele a többi joghurtot. Ha túl sűrű, 1–2 teáskanál vízzel lazítsd; ne habosítsd. Ízlés szerint energiamentes édesítőt adhatsz hozzá.','Lefedve hűtsd 20 percig. A kimért banánt közvetlenül tálalás előtt szeleteld a tetejére. A teljes tál egy adag.'],en:['Sift the cocoa and whey into a bowl. Add 2 tablespoons of the measured yogurt and stir into a smooth paste.','Stir in the remaining yogurt. If too thick, loosen with 1–2 teaspoons of water; no whipping needed. Add zero-calorie sweetener to taste if desired.','Cover and chill for 20 minutes. Slice the measured banana over the cream just before serving. The whole bowl is one portion.']},art:['mix','mix','serve']},
    {id:'protein-quark-raspberry',hu:'Málnás cottage cheese pohárkrém',en:'Raspberry cottage cheese dessert',min:8,waitMin:20,servings:1,portion:{hu:'1 pohár',en:'1 glass'},amounts:{cottage:150,yogurt:100,whey:10,raspberry:100,oats:10},
      description:{hu:'Réteges málnás pohárdesszert selymesre turmixolt fehérjekrémmel.',en:'Raspberry layers with a silky blended cottage cheese cream.'},
      steps:{hu:['A cottage cheese-t, joghurtot és vaníliás fehérjeport turmixold 30–60 másodpercig teljesen simára. A pohár méretéhez legalább 400 ml-es edényt válassz.','A friss málnát mosd meg, csepegtesd le; a felét villával törd össze. A zabot ehhez a recepthez hagyd pehely formában.','Rétegezd a krémet és az összetört málnát a pohárba. A tetejére tedd az egész málnaszemeket és a 10 g zabpelyhet.','Lefedve hűtsd 20 percig; puhább zabhoz hagyd 2 órát. A teljes pohár egy adag.'],en:['Blend the cottage cheese, yogurt and vanilla whey for 30–60 seconds until completely smooth. Use a glass or jar holding at least 400 ml.','Wash and drain the fresh raspberries; crush half with a fork. Leave the oats as flakes for this recipe.','Layer the cream and crushed berries in the glass. Top with the whole raspberries and 10 g oat flakes.','Cover and chill for 20 minutes, or 2 hours for softer oats. The whole glass is one serving.']},art:['blend','mash','glass','chill']}
  ];
  // Six muffins per batch: the chocolate core and crisp topping are included.
  Object.assign(refs,{
    chocolate:['Chocolate, dark, 70-85% cacao solids','Étcsokoládé, 70–85%, a töltelékhez','Dark chocolate, 70–85%, for the centres'],
    hazelnut:['Nuts, hazelnuts or filberts','Törökmogyoró, durvára vágva','Hazelnuts, roughly chopped'],
    peanut:['Peanuts, all types, dry-roasted, without salt','Sózatlan, szárazon pörkölt földimogyoró','Unsalted dry-roasted peanuts'],
    almond:['Nuts, almonds','Mandula, szeletelve','Almonds, sliced'],
    oatTop:['Oats','Zabpehely, a ropogós tetőhöz','Rolled oats, for the crunchy topping'],
    honey:['Honey','Méz, a morzsához','Honey, for the crumble']
  });
  const filled=[
    {id:'protein-filled-hazelnut',hu:'Mogyorós proteinmuffin csokiszívvel',en:'Hazelnut protein muffins with chocolate centres',nut:'hazelnut',cocoa:10,
     description:{hu:'Kakaós zabmuffin étcsokis középpel és pirult törökmogyoróval.',en:'Cocoa oat muffins with a dark chocolate centre and toasted hazelnut crunch.'}},
    {id:'protein-filled-peanut',hu:'Földimogyorós proteinmuffin csokiszívvel',en:'Peanut crunch protein muffins with chocolate centres',nut:'peanut',cocoa:10,
     description:{hu:'Puha kakaós muffin csokoládétöltelékkel és ropogós földimogyoróval.',en:'Soft cocoa muffins with chocolate filling and a crunchy peanut topping.'}},
    {id:'protein-filled-raspberry-almond',hu:'Málnás-mandulás proteinmuffin csokiszívvel',en:'Raspberry almond protein muffins with chocolate centres',nut:'almond',fruit:true,
     description:{hu:'Málnás zabmuffin étcsokis középpel és vékony, pirult mandulaszeletekkel.',en:'Raspberry oat muffins with a dark chocolate centre and toasted almond flakes.'}},
    {id:'protein-filled-oat-crunch',hu:'Zabmorzsás proteinmuffin csokiszívvel',en:'Oat crumble protein muffins with chocolate centres',crumble:true,cocoa:10,
     description:{hu:'Kakaós muffin csokis töltelékkel és vékony, mézes zab-mandula morzsával.',en:'Cocoa muffins with a chocolate centre and a thin honey oat–almond crumble.'}}
  ];
  for(const f of filled){
    const amounts={oats:90,yogurt:180,whey:60,egg:100,baking:5,chocolate:36};
    if(f.cocoa)amounts.cocoa=f.cocoa;if(f.nut)amounts[f.nut]=24;if(f.fruit)amounts.raspberry=90;
    if(f.crumble)Object.assign(amounts,{oatTop:18,almond:12,honey:12});
    const toppingHu=f.crumble?'A tetőhöz a 18 g egész zabpelyhet, a 12 g apróra vágott mandulát és a 12 g mézet külön keverd morzsásra.':`A 24 g ${f.nut==='hazelnut'?'törökmogyorót vágd durvára':f.nut==='peanut'?'földimogyorót vágd durvára':'mandulát szeleteld vékonyra'}; tedd félre a tetőhöz.`;
    const toppingEn=f.crumble?'For the topping, separately mix 18 g rolled oats, 12 g finely chopped almonds and 12 g honey into a loose crumble.':`Prepare 24 g ${f.nut==='hazelnut'?'roughly chopped hazelnuts':f.nut==='peanut'?'roughly chopped peanuts':'sliced almonds'} and reserve for the tops.`;
    recipes.push({id:f.id,hu:f.hu,en:f.en,description:f.description,min:40,servings:3,portion:{hu:'2 muffin (a 6 darabos adag harmada)',en:'2 muffins (one third of the 6-muffin batch)'},amounts,filledChocolate:true,
      steps:{hu:[
        'Melegítsd elő a sütőt 180 °C-ra alsó-felső sütéssel (160 °C légkeveréssel). Tegyél 6, kb. 180 ml-es szilikon muffinformát tepsire. A 36 g csokoládét oszd 6 darab, egyenként 6 g-os töltelékre.',
        'Keverd simára a 100 g héj nélküli tojást és a 180 g joghurtot. Külön vegyítsd a 90 g finomra darált zabot, a 60 g fehérjeport és az 5 g sütőport'+(f.cocoa?', valamint a 10 g kakaót.':'.')+' Édesített vaníliás vagy csokis fehérjeporral készítsd; natúr porhoz ízlés szerint energiamentes édesítőt adhatsz.',
        'Röviden forgasd össze a nedves és száraz részt. Ha túl sűrű, 1–3 evőkanál vizet adj hozzá: sűrű, kanalazható massza legyen.'+(f.fruit?' Óvatosan forgasd bele a 90 g megmosott, szárazra törölt friss málnát.':'')+' '+toppingHu,
        'Oszd a tészta felét a formákba. Mindegyik közepébe tegyél 6 g csokoládét, majd fedd be a maradék tésztával. Legfeljebb háromnegyedig töltsd. A kimért ropogós feltétet oszd el a 6 tetőn, és enyhén nyomd a tésztába.',
        'Süsd középen 22–28 percig. A csokitöltelék mellett ellenőrizd pálcikával: a tésztán ne maradjon nyers massza, a tojásos tészta közepe érje el a 71 °C-ot. Az olvadt csokoládé önmagában nem a nyers tészta jele.',
        'Pihentesd 10 percig a formában, majd tedd rácsra fedetlenül. Langyosan a csoki lágy, hűtve megszilárdul; a tető frissen a legropogósabb. Egy adag 2 muffin. Hűtés után 160 °C-os sütőben 5–7 perc alatt melegítheted át.'
      ],en:[
        'Preheat to 180 °C conventional / 160 °C fan. Place 6 silicone muffin cups of about 180 ml on a tray. Divide the 36 g chocolate into six 6 g pieces for the centres.',
        'Whisk 100 g eggs without shells with 180 g yogurt. Separately mix 90 g finely ground oats, 60 g whey and 5 g baking powder'+(f.cocoa?', plus 10 g cocoa.':'.')+' Use sweetened vanilla or chocolate whey; with plain whey, add zero-calorie sweetener to taste if desired.',
        'Briefly fold the wet and dry mixtures together. If too stiff, add 1–3 tablespoons of water for thick, spoonable batter.'+(f.fruit?' Gently fold in 90 g washed, dried fresh raspberries.':'')+' '+toppingEn,
        'Divide half the batter among the cups. Put 6 g chocolate in each centre and cover completely with the remaining batter, filling no more than three-quarters full. Divide the measured crunchy topping between all six muffins and gently press it in.',
        'Bake on the middle shelf for 22–28 minutes. Test the crumb beside the chocolate pocket: a skewer should have no wet batter and the egg batter should reach 71 °C. Melted chocolate alone does not mean the batter is raw.',
        'Rest in the cups for 10 minutes, then cool uncovered on a rack. The chocolate is soft when warm and sets when chilled; the top is crunchiest fresh. One serving is 2 muffins. Reheat chilled muffins at 160 °C for 5–7 minutes if desired.'
      ]},art:['oven','mix','mix','tray','oven','serve']});
  }
  for (const recipe of recipes) {
    const {amounts,...r}=recipe, total={kcal:0,p:0,c:0,f:0};
    r.nutritionParts=Object.entries(amounts).map(([key,g])=>{const [ref,hu,en]=refs[key],row=F.list.find(x=>x[0]===ref);if(!row)throw Error('Missing dessert ingredient '+ref);const part={source:ref,g,hu,en};['kcal','p','c','f'].forEach((k,i)=>{part[k]=row[i+1]*g/100;total[k]+=part[k];});return part;});
    r.ing=r.nutritionParts.map(p=>[p.hu,p.en,p.g]);
    Object.keys(total).forEach(k=>r[k]=Math.round(total[k]/r.servings*(k==='kcal'?1:10))/(k==='kcal'?1:10));
    r.cat='snack';r.illustration=false;r.art=r.art||[];r.nutritionBasis='USDA SR28 generic ingredients; whole batch divided by servings';
    r.note={hu:'A tápérték egy adagra számolt becslés; a fehérjepor címkéje eltérhet. Lefedve, legfeljebb 4 °C-on tárold, és 2 napon belül fogyaszd el.',en:'Estimated nutrition per serving; your whey label may differ. Keep covered at 4 °C or below and eat within 2 days.'};
    if(!R.items.some(x=>x.id===r.id))R.items.push(r);
  }
  window.DESSERT_RECIPES_VERSION=2;
})();
