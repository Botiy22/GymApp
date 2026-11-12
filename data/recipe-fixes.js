/* 2.56 recipe review. Clearer methods where steps were too thin, amounts for clips that showed none, and complete
   nutrition for every recipe. Values are computed here from USDA rows in foods.js; the few products USDA has no row for
   (shop gnocchi, plant cooking creams, sugar-free syrup) use the generic per-100 values in EST below and the recipe is
   marked `estimated` (shown with ≈). Where a supplied clip stated its own numbers, the note says so. */
(function () {
  const R = window.RECIPES, F = window.FOODS;
  if (!R || !F || window.RECIPE_FIXES_VERSION === 1) return;
  const rows = new Map(F.list.map(r => [r[0], r]));
  const EST = { gnocchi: [150, 3.5, 32, 0.5], oatcream: [150, 1, 7, 13], ricecream: [130, 0.3, 6, 11.5], syrup0: [20, 0, 5, 0] };
  const U = {
    chicken: 'Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw', broccoli: 'Broccoli, raw',
    mozz: 'Cheese, mozzarella, part skim milk', chickpea: 'Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids',
    onion: 'Onions, raw', garlic: 'Garlic, raw', ham: 'Ham, sliced, packaged (96% fat free, water added)', parmesan: 'Cheese, parmesan, hard',
    egg: 'Egg, whole, raw, fresh', quark0: 'Cheese, cottage, nonfat, uncreamed, dry, large or small curd', beef5: 'Beef, ground, 95% lean meat / 5% fat, raw',
    tomato: 'Tomato products, canned, sauce', broth: 'Soup, chicken broth cubes, dry, prepared with water'
  };
  /* parts: [[USDA key or EST key, grams]] → nutrition for one serving */
  function per(parts, servings) {
    const t = { g: 0, kcal: 0, p: 0, c: 0, f: 0 }; let estimated = false;
    for (const [key, g] of parts) {
      const v = EST[key] ? (estimated = true, EST[key]) : (rows.get(U[key]) || []).slice(1, 5);
      if (v.length < 4) return null;                                  // a missing row leaves the recipe as it was
      t.g += g; t.kcal += v[0] * g / 100; t.p += v[1] * g / 100; t.c += v[2] * g / 100; t.f += v[3] * g / 100;
    }
    const r1 = x => Math.round(x / servings * 10) / 10;
    return { kcal: Math.round(t.kcal / servings), p: r1(t.p), c: r1(t.c), f: r1(t.f), g: Math.round(t.g / servings), estimated };
  }
  const get = id => R.items.find(r => r.id === id);
  const fix = (id, o) => {
    const r = get(id); if (!r) return;
    const n = o.parts && per(o.parts, o.servings || r.servings || 1);
    Object.assign(r, o.set || {});
    if (n) { Object.assign(r, { kcal: n.kcal, p: n.p, c: n.c, f: n.f, g: n.g }); r.estimated = n.estimated || !!o.proxy; }
  };

  fix('clip-protein-banana-muffins', { set: {
    steps: { hu: [
      'Melegítsd elő a sütőt 180 °C-ra alsó-felső sütéssel (160 °C légkeveréssel), és tegyél 12 muffinpapírt egy muffinsütőbe. A meghámozott, érett banánt egy nagy tálban villával törd teljesen pépesre.',
      'Add hozzá a tojásfehérjét, a mandulatejet és a mogyoróvajat, és habverővel keverd simára, amíg a mogyoróvaj teljesen elkeveredik.',
      'Egy másik tálban keverd össze a lisztté darált zabot, a fehérjeport, a kakaót, a sütőport és a csipet sót. Szórd a nedves keverékhez, és spatulával csak addig keverd, amíg nem látszik száraz por; a túlkevert tészta tömör lesz.',
      'Forgasd bele a csokoládé kétharmadát. Oszd el egyenletesen a 12 papírban, legfeljebb háromnegyedig töltve, és szórd a tetejükre a maradék csokit.',
      'Süsd a középső rácson 20–25 percig, amíg a közepébe szúrt pálcikán nem marad nyers tészta. Hagyd 10 percig a formában, majd rácson hűtsd ki. Egy adag 1 muffin; hűtve tárold, és 2 napon belül fogyaszd el.'],
    en: [
      'Heat the oven to 180 °C (160 °C fan) and put 12 paper cases in a muffin tin. Mash the peeled ripe bananas in a large bowl with a fork until completely smooth.',
      'Add the egg whites, almond milk and peanut butter and whisk until smooth and the peanut butter is fully mixed in.',
      'In another bowl mix the oat flour, protein powder, cocoa, baking powder and the pinch of salt. Add to the wet mix and fold with a spatula only until no dry powder shows; over-mixing makes them dense.',
      'Fold in two thirds of the chocolate. Divide evenly between the 12 cases, no more than three quarters full, and scatter the rest of the chocolate on top.',
      'Bake on the middle shelf for 20–25 minutes, until a skewer pushed into the centre comes out without raw batter. Leave in the tin for 10 minutes, then cool on a rack. One serving is 1 muffin; keep chilled and eat within 2 days.'] },
    art: ['mash', 'mix', 'mix', 'tray', 'oven'] } });

  fix('clip-pizza-meat-roll', { parts: [['beef5', 250], ['tomato', 40], ['ham', 40], ['mozz', 40]], servings: 1, set: {
    portion: { hu: '1 egész tekercs', en: '1 whole roll' },
    ing: [['sovány darált marhahús (5% zsír)', 'lean minced beef (5% fat)', 250], ['fűszerkeverék, só, bors', 'spice mix, salt, pepper', ['ízlés szerint', 'to taste']],
      ['paradicsomszósz (passata)', 'tomato sauce (passata)', 40], ['sovány sonka, szeletelve', 'lean ham, sliced', 40],
      ['reszelt light mozzarella (30 g bele, 10 g a tetejére)', 'grated light mozzarella (30 g inside, 10 g on top)', 40], ['oregánó vagy bazsalikom', 'oregano or basil', ['ízlés szerint', 'to taste']]],
    note: { hu: 'A videó nem mutatja a mennyiségeket: ezek a mi javaslataink egy tekercshez. A beküldött videóban 550 kcal és 66 g fehérje szerepel. A hús közepe érje el a 71 °C-ot.',
      en: 'The clip shows no amounts: these are our suggestion for one roll. The supplied clip states 550 kcal and 66 g protein. Cook the meat to 71 °C in the centre.' },
    steps: { hu: [
      'A 250 g darált húst keverd össze a fűszerkeverékkel, egy csipet sóval és borssal, és 1–2 percig gyúrd, amíg összeáll és kissé ragad.',
      'Airfryerbe illő sütőpapíron nyomkodd kb. 20 × 15 cm-es, 1 cm vastag, egyenletes téglalappá; a széle se legyen vékonyabb a közepénél.',
      'Kend meg vékonyan a paradicsomszósszal, a széleken hagyj 1 cm-t szabadon. Fektesd rá a sonkát, és szórd meg 30 g sajttal.',
      'A rövidebb oldalától kezdve a sütőpapír segítségével tekerd fel szorosan, és fordítsd a varratával lefelé. Nyomd össze a két végét, hogy a sajt ne folyjon ki.',
      'Melegítsd elő az airfryert 180 °C-ra. Süsd a tekercset a papírral együtt 20 percig, majd szórd rá a maradék 10 g sajtot és az oregánót, és süsd még 5–8 percig. A közepe érje el a 71 °C-ot; maghőmérő nélkül vágd félbe, és ne legyen rózsaszín.',
      'Pihentesd 5 percig, hogy a leve visszaszívódjon, majd éles késsel szeleteld fel.'],
    en: [
      'Mix the 250 g minced beef with the spice mix, a pinch of salt and pepper and knead for 1–2 minutes until it holds together and feels slightly sticky.',
      'On baking paper that fits your air fryer, press it into an even rectangle about 20 × 15 cm and 1 cm thick; keep the edges as thick as the middle.',
      'Spread thinly with the tomato sauce, leaving a 1 cm border. Lay the ham on top and sprinkle with 30 g of the cheese.',
      'Starting from a short side, use the paper to roll it up tightly and turn it seam side down. Press both ends closed so the cheese does not run out.',
      'Heat the air fryer to 180 °C. Cook the roll on its paper for 20 minutes, then add the remaining 10 g cheese and the oregano and cook for 5–8 minutes more. The centre must reach 71 °C; without a thermometer, cut it in half and check it is not pink.',
      'Rest for 5 minutes so the juices settle, then slice with a sharp knife.'] } } });

  fix('clip-chicken-gnocchi', { parts: [['gnocchi', 400], ['chicken', 650], ['broccoli', 250], ['oatcream', 300], ['mozz', 80]], servings: 4, set: {
    ing: [['burgonyás gnocchi (bolti)', 'potato gnocchi (shop-bought)', 400], ['csirkemell, nyersen', 'chicken breast, raw', 650], ['brokkoli', 'broccoli', 250],
      ['zab főzőkrém', 'oat cooking cream', ['300 ml (1½ doboz)', '300 ml (1½ cartons)']], ['reszelt light mozzarella', 'grated light mozzarella', 80],
      ['só, bors, pirospaprika, bazsalikom, fokhagyma, oregánó', 'salt, pepper, paprika, basil, garlic, oregano', ['ízlés szerint', 'to taste']]],
    note: { hu: 'A gnocchi és a zab főzőkrém általános becsült értékkel szerepel (≈); a saját terméked címkéje pontosabb. A beküldött videóban adagonként 525 kcal és 47 g fehérje szerepel.',
      en: 'The gnocchi and oat cream use generic estimated values (≈); your product label is more exact. The supplied clip states 525 kcal and 47 g protein per serving.' },
    steps: { hu: [
      'Melegítsd elő a sütőt 180 °C-ra alsó-felső sütéssel (160 °C légkeveréssel). A csirkét vágd kb. 2 cm-es kockákra, a brokkolit kis rózsákra.',
      'Egy kb. 20 × 30 cm-es sütőtálban forgasd össze a nyers gnocchit, a csirkét és a brokkolit a fűszerekkel. Öntsd rá a főzőkrémet, és keverd át, hogy mindent bevonjon.',
      'Fedd le alufóliával, és süsd 30–35 percig. Félidőben keverd át, hogy a gnocchi egyenletesen megpuhuljon.',
      'Vedd le a fóliát, szórd rá a sajtot, és süsd fedetlenül még 10–15 percig, amíg a sajt aranybarna. A csirke legvastagabb darabjának közepe érje el a 74 °C-ot.',
      'Pihentesd 5 percig, majd oszd négy egyenlő adagra. Hűtőben 3 napig eláll; mikróban gőzölgő forróra melegítsd.'],
    en: [
      'Heat the oven to 180 °C (160 °C fan). Cut the chicken into about 2 cm cubes and the broccoli into small florets.',
      'In a dish about 20 × 30 cm, toss the raw gnocchi, chicken and broccoli with the seasoning. Pour over the cooking cream and stir so everything is coated.',
      'Cover with foil and bake for 30–35 minutes. Stir halfway so the gnocchi soften evenly.',
      'Remove the foil, scatter over the cheese and bake uncovered for 10–15 minutes more, until golden. The thickest piece of chicken must reach 74 °C in the centre.',
      'Rest for 5 minutes, then divide into four equal servings. Keeps 3 days in the fridge; reheat in the microwave until steaming hot.'] },
    art: ['knife', 'tray', 'oven', 'cheese', 'serve'] } });

  fix('clip-chicken-chickpeas', { parts: [['onion', 110], ['garlic', 6], ['chicken', 450], ['chickpea', 500], ['ham', 100], ['ricecream', 200], ['broth', 150], ['parmesan', 50]], servings: 4, set: {
    ing: [['vöröshagyma (1 db)', 'onion (1)', 110], ['fokhagyma (2 gerezd)', 'garlic (2 cloves)', 6], ['csirkemell, nyersen', 'chicken breast, raw', 450],
      ['csicseriborsó, konzerv, lecsepegtetve', 'chickpeas, canned, drained', 500], ['magas hústartalmú sonka vagy felvágott', 'high-meat ham or cold cuts', 100],
      ['rizs főzőkrém', 'rice cooking cream', ['200 ml', '200 ml']], ['csirkealaplé', 'chicken stock', ['150 ml', '150 ml']], ['parmezán, reszelve', 'parmesan, grated', 50],
      ['só, bors', 'salt, pepper', ['ízlés szerint', 'to taste']]],
    note: { hu: 'A rizs főzőkrém általános becsült értékkel szerepel (≈). A beküldött videóban adagonként 438 kcal és 43 g fehérje szerepel.',
      en: 'The rice cooking cream uses a generic estimated value (≈). The supplied clip states 438 kcal and 43 g protein per serving.' },
    steps: { hu: [
      'A hagymát és a fokhagymát aprítsd fel, a csirkét vágd kb. 2 cm-es kockákra, a felvágottat csíkokra. A csicseriborsót szűrd le és öblítsd át.',
      'Nagy, tapadásmentes serpenyőben 3–4 evőkanál alaplével párold a hagymát közepes lángon 3–4 percig, amíg üveges. Add hozzá a fokhagymát, és fél percig kevergesd.',
      'Tedd bele a csirkét, sózd, borsozd, és kevergetve süsd 6–8 percig, amíg minden oldala kifehéredik. Add hozzá a felvágottat és a csicseriborsót, és süsd még 2 percig.',
      'Öntsd rá a főzőkrémet és a maradék alaplevet. Gyenge forráson, fedő nélkül főzd 5–8 percig, amíg a szósz besűrűsödik és a csirke közepe eléri a 74 °C-ot.',
      'Vedd le a tűzről, keverd bele a parmezánt, és oszd négy egyforma adagra. Rizzsel vagy salátával is tálalhatod; a köretet külön naplózd.'],
    en: [
      'Chop the onion and garlic, cut the chicken into about 2 cm cubes and the cold cuts into strips. Drain and rinse the chickpeas.',
      'In a large non-stick pan, soften the onion in 3–4 tablespoons of the stock over medium heat for 3–4 minutes. Add the garlic and stir for 30 seconds.',
      'Add the chicken, season with salt and pepper and cook, stirring, for 6–8 minutes until white on all sides. Add the cold cuts and chickpeas and cook for 2 minutes more.',
      'Pour in the cooking cream and the rest of the stock. Simmer gently, uncovered, for 5–8 minutes until the sauce thickens and the chicken reaches 74 °C in the centre.',
      'Take off the heat, stir in the parmesan and divide into four equal servings. Serve with rice or salad if you like; log the side separately.'] },
    art: ['knife', 'pan', 'pan', 'pour', 'cheese'] } });

  fix('clip-ham-flatbread', { proxy: true, parts: [['quark0', 250], ['egg', 100], ['ham', 100], ['mozz', 75], ['onion', 30]], servings: 1, set: {
    portion: { hu: '1 egész lepény', en: '1 whole flatbread' },
    ing: [['0%-os quark', '0% fat quark', 250], ['tojás (2 db)', 'eggs (2)', 100], ['magas hústartalmú sonka', 'high-meat ham', 100],
      ['reszelt light mozzarella (60 g bele, 15 g a tetejére)', 'grated light mozzarella (60 g inside, 15 g on top)', 75], ['lilahagyma (¼ db), vékony karikákra', 'red onion (¼), thinly sliced', 30],
      ['só, bors, fokhagymagranulátum, oregánó', 'salt, pepper, garlic granules, oregano', ['ízlés szerint', 'to taste']]],
    note: { hu: 'A 0%-os quark helyett az USDA zsírmentes túró értékével számolunk (≈). A beküldött videóban 88 g fehérje és 12 g szénhidrát szerepel.',
      en: 'The 0% quark is calculated with the USDA fat-free curd cheese value (≈). The supplied clip states 88 g protein and 12 g carbohydrate.' },
    steps: { hu: [
      'Melegítsd elő a sütőt 180 °C-ra alsó-felső sütéssel (160 °C légkeveréssel), és bélelj ki egy tepsit sütőpapírral.',
      'Egy tálban keverd simára a quarkot a tojásokkal, majd add hozzá a felkockázott sonkát, a 60 g sajtot, egy csipet sót, borsot, fokhagymagranulátumot és oregánót.',
      'Terítsd a masszát a sütőpapírra kb. 20 × 25 cm-es, 1–1,5 cm vastag lappá. Szórd rá a lilahagyma-karikákat és a maradék 15 g sajtot.',
      'Süsd 30–35 percig, amíg a teteje aranybarna és a közepe megszilárdul (71 °C). Pihentesd 5 percig, majd vágd szeletekre. Egy adag az egész lepény; ha csak a felét eszed, naplózáskor válassz fél adagot.'],
    en: [
      'Heat the oven to 180 °C (160 °C fan) and line a tray with baking paper.',
      'In a bowl, mix the quark and eggs until smooth, then add the diced ham, 60 g of the cheese and a pinch of salt, pepper, garlic granules and oregano.',
      'Spread the mixture on the paper into a sheet about 20 × 25 cm and 1–1.5 cm thick. Top with the red onion rings and the remaining 15 g cheese.',
      'Bake for 30–35 minutes, until golden on top and set in the middle (71 °C). Rest for 5 minutes, then cut into slices. One serving is the whole flatbread; if you eat half, choose half a serving when logging.'] },
    art: ['oven', 'mix', 'spread', 'oven'] } });

  fix('clip-blueberry-pancakes', { set: {
    g: 102,
    ing: [['zsírszegény cottage cheese (2 csésze)', 'low-fat cottage cheese (2 cups)', 450], ['tojás (4 db)', 'eggs (4)', 200], ['vaníliakivonat', 'vanilla extract', ['1 tk', '1 tsp']],
      ['cukormentes juharszirup', 'sugar-free maple syrup', ['4 ek (60 ml)', '4 tbsp (60 ml)']], ['önkelő liszt (1¼ csésze)', 'self-raising flour (1¼ cups)', 156],
      ['áfonya (javasolt mennyiség)', 'blueberries (suggested amount)', 150]],
    steps: { hu: [
      'Turmixold simára a cottage cheese-t, a tojásokat, a vaníliát és a szirupot, kb. 30 másodpercig.',
      'Öntsd tálba, szitáld rá az önkelő lisztet, és spatulával csak addig keverd, amíg eltűnik a liszt. Forgasd bele az áfonyát; a tészta sűrű, kanalazható legyen.',
      'Tapadásmentes serpenyőt melegíts közepesen alacsony hőfokon, és ha kell, vékonyan kend ki olajjal (az olajat külön naplózd). Egy palacsintához kb. 2 evőkanál tésztát tegyél, és terítsd 8–9 cm-esre.',
      'Süsd 2–3 percig, amíg a széle megszilárdul és buborékok jelennek meg a tetején, majd fordítsd át, és süsd még 1–2 percig, amíg a közepe is átsül.',
      'A tésztából kb. 10 palacsinta lesz; egy adag 1 palacsinta. Naplózáskor add meg, hányat ettél.'],
    en: [
      'Blend the cottage cheese, eggs, vanilla and syrup until smooth, about 30 seconds.',
      'Pour into a bowl, sift in the self-raising flour and fold with a spatula only until the flour disappears. Fold in the blueberries; the batter should be thick and spoonable.',
      'Heat a non-stick pan over medium-low heat and, if needed, brush thinly with oil (log the oil separately). Use about 2 tablespoons of batter per pancake and spread it to 8–9 cm.',
      'Cook for 2–3 minutes until the edges set and bubbles appear on top, then flip and cook for 1–2 minutes more until cooked through.',
      'The batter makes about 10 pancakes; one serving is 1 pancake. When logging, enter how many you ate.'] },
    art: ['blend', 'mix', 'pan', 'pan', 'serve'] } });

  fix('oats-berry-turo', { set: {
    steps: { hu: [
      'Legalább 600 ml-es, fedeles üvegben keverd simára a 100 g túrót a 120 ml tejjel és a 10 g mézzel; ha csomós, villával nyomkodd szét.',
      'Forgasd bele az 50 g zabpelyhet és az 5 g chiamagot, majd 10 perc múlva keverd át újra, hogy a chia ne csomósodjon.',
      'Tedd a tetejére a 80 g fagyasztott gyümölcsöt, fedd le, és hűtsd legfeljebb 4 °C-on legalább 4 órát vagy egy éjszakán át: a gyümölcs kiolvad és megfesti a krémet. 2 napon belül fogyaszd el.'],
    en: [
      'In a lidded jar of at least 600 ml, mix the 100 g curd cheese with the 120 ml milk and 10 g honey until smooth; break up any lumps with a fork.',
      'Stir in the 50 g oats and 5 g chia seeds, then stir again after 10 minutes so the chia does not clump.',
      'Add the 80 g frozen berries on top, cover and chill at 4 °C or below for at least 4 hours or overnight: the fruit thaws and colours the cream. Eat within 2 days.'] },
    art: ['mix', 'mix', 'chill'] } });

  /* Juices: say what to do without a juicer. */
  const noJuicer = { hu: ' Ha nincs gyümölcscentrifugád, turmixold 1 dl hideg vízzel, majd szűrd át sűrű szitán vagy gézen.',
    en: ' No juicer? Blend with 100 ml cold water, then strain through a fine sieve or muslin.' };
  R.items.filter(r => /^clip-juice-/.test(r.id)).forEach(r => ['hu', 'en'].forEach(k => {
    const s = r.steps[k], i = s.findIndex(x => /Facsard|Juice /.test(x));
    if (i >= 0 && !s[i].includes(noJuicer[k].trim().slice(0, 12))) s[i] += noJuicer[k];
  }));
  const serve = { 'Töltsd jéggel teli pohárba, és rögtön idd meg.': 'Töltsd jéggel teli pohárba, keverd át, és rögtön idd meg, mielőtt a lé szétválik és veszít az ízéből.',
    'Pour over ice and drink straight away.': 'Pour into a glass full of ice, stir and drink straight away, before the juice separates and loses flavour.',
    'Főzz erős hibiszkuszteát, és hűtsd le.': 'Önts 1,5 dl forró vizet 2 filter (vagy 2 teáskanál) szárított hibiszkuszra, hagyd ázni 5 percig, majd szűrd le és hűtsd ki teljesen.',
    'Brew strong hibiscus tea and let it cool.': 'Pour 150 ml hot water over 2 tea bags (or 2 teaspoons) of dried hibiscus, steep for 5 minutes, then strain and cool completely.' };
  R.items.filter(r => /^clip-juice-/.test(r.id)).forEach(r => ['hu', 'en'].forEach(k => { r.steps[k] = r.steps[k].map(x => serve[x] || x); }));
  window.RECIPE_FIXES_VERSION = 1;
})();
