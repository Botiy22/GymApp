/* Overnight oats: ready recipes and a builder where you choose what goes into the jar. Every number is calculated from the
   offline food database (USDA rows and data/food-lexicon.js), so a recipe card, the builder and the diary always agree. */
window.OvernightOats = (() => {
  'use strict';
  // ref: the database name (Hungarian entry or USDA row). def/step: grams, or millilitres when ml is set (dens = g per ml).
  const GROUPS = [
    { id: 'base', hu: 'Alap', en: 'Base', items: [
      { id: 'oats', hu: 'Zabpehely', en: 'Rolled oats', ref: 'Zabpehely', def: 50, step: 5 }] },
    { id: 'liquid', hu: 'Folyadék', en: 'Liquid', items: [
      { id: 'milk15', hu: 'Tej, 1,5%', en: 'Milk, 1.5%', ref: 'Tej, 1,5%', def: 150, step: 10, ml: 1, dens: 1.03 },
      { id: 'milk28', hu: 'Tej, 2,8%', en: 'Milk, 2.8%', ref: 'Tej, 2,8%', def: 150, step: 10, ml: 1, dens: 1.03 },
      { id: 'skim', hu: 'Sovány tej', en: 'Skim milk', ref: 'Tej, sovány (0,1%)', def: 150, step: 10, ml: 1, dens: 1.03 },
      { id: 'almond', hu: 'Mandulaital, cukrozatlan', en: 'Almond drink, unsweetened', ref: 'Beverages, almond milk, unsweetened, shelf stable', def: 150, step: 10, ml: 1, dens: 1.0 },
      { id: 'soy', hu: 'Szójaital', en: 'Soy drink', ref: 'Soymilk, original and vanilla, unfortified', def: 150, step: 10, ml: 1, dens: 1.0 },
      { id: 'kefir', hu: 'Kefir', en: 'Kefir', ref: 'Kefir, zsírszegény', def: 150, step: 10, ml: 1, dens: 1.03 },
      { id: 'water', hu: 'Víz', en: 'Water', ref: 'Víz', def: 100, step: 10, ml: 1, dens: 1 },
      { id: 'espresso', hu: 'Eszpresszó', en: 'Espresso', ref: 'Eszpresszó', def: 30, step: 10, ml: 1, dens: 1 }] },
    { id: 'creamy', hu: 'Krémesítő', en: 'Creamy', items: [
      { id: 'greek0', hu: 'Görög joghurt 0%', en: 'Greek yogurt 0%', ref: 'Görög joghurt, zsírmentes', def: 100, step: 10 },
      { id: 'greek2', hu: 'Görög joghurt 2%', en: 'Greek yogurt 2%', ref: 'Görög joghurt, zsírszegény (2%)', def: 100, step: 10 },
      { id: 'greek', hu: 'Görög joghurt, teljes', en: 'Greek yogurt, whole', ref: 'Görög joghurt, teljes', def: 100, step: 10 },
      { id: 'yogurt', hu: 'Natúr joghurt', en: 'Plain yogurt', ref: 'Joghurt, natúr, teljes tejből', def: 100, step: 10 },
      { id: 'turo', hu: 'Túró, zsírszegény', en: 'Curd cheese (túró)', ref: 'Túró, zsírszegény', def: 100, step: 10 },
      { id: 'cottage', hu: 'Cottage cheese', en: 'Cottage cheese', ref: 'Cottage cheese, 2%', def: 100, step: 10 }] },
    { id: 'protein', hu: 'Fehérje', en: 'Protein', items: [
      { id: 'whey', hu: 'Tejsavófehérje-por', en: 'Whey protein powder', ref: 'Fehérjepor (tejsavó alapú)', def: 25, step: 5, note: { hu: 'általános tejsavófehérje; a saját porod címkéje pontosabb', en: 'generic whey; your powder’s label is more exact' } }] },
    { id: 'fruit', hu: 'Gyümölcs', en: 'Fruit', items: [
      { id: 'banana', hu: 'Banán', en: 'Banana', ref: 'Banán', def: 60, step: 10 },
      { id: 'strawberry', hu: 'Eper', en: 'Strawberries', ref: 'Eper', def: 80, step: 10 },
      { id: 'blueberry', hu: 'Áfonya', en: 'Blueberries', ref: 'Áfonya', def: 60, step: 10 },
      { id: 'raspberry', hu: 'Málna', en: 'Raspberries', ref: 'Málna', def: 60, step: 10 },
      { id: 'berries', hu: 'Fagyasztott erdei gyümölcs', en: 'Frozen mixed berries', ref: 'Fagyasztott erdei gyümölcs', def: 60, step: 10 },
      { id: 'apple', hu: 'Alma (reszelve)', en: 'Apple (grated)', ref: 'Alma', def: 100, step: 10 },
      { id: 'mango', hu: 'Mangó', en: 'Mango', ref: 'Mangó', def: 80, step: 10 },
      { id: 'cherry', hu: 'Meggy', en: 'Sour cherries', ref: 'Meggy', def: 60, step: 10 },
      { id: 'raisin', hu: 'Mazsola', en: 'Raisins', ref: 'Mazsola', def: 15, step: 5 }] },
    { id: 'crunch', hu: 'Magvak és diófélék', en: 'Seeds and nuts', items: [
      { id: 'chia', hu: 'Chia mag', en: 'Chia seeds', ref: 'Chia mag', def: 10, step: 5 },
      { id: 'flax', hu: 'Lenmag', en: 'Flaxseed', ref: 'Lenmag', def: 10, step: 5 },
      { id: 'walnut', hu: 'Dió', en: 'Walnuts', ref: 'Dió', def: 10, step: 5 },
      { id: 'almondnut', hu: 'Mandula', en: 'Almonds', ref: 'Mandula', def: 10, step: 5 },
      { id: 'hazelnut', hu: 'Mogyoró', en: 'Hazelnuts', ref: 'Mogyoró', def: 10, step: 5 },
      { id: 'pb', hu: 'Mogyoróvaj', en: 'Peanut butter', ref: 'Mogyoróvaj', def: 15, step: 5 },
      { id: 'coconut', hu: 'Kókuszreszelék', en: 'Desiccated coconut', ref: 'Kókuszreszelék (cukrozatlan)', def: 8, step: 2 },
      { id: 'granola', hu: 'Müzli (ropogós)', en: 'Granola', ref: 'Müzli', def: 20, step: 5 }] },
    { id: 'flavor', hu: 'Íz és édesítés', en: 'Flavour and sweetener', items: [
      { id: 'cocoa', hu: 'Kakaópor', en: 'Cocoa powder', ref: 'Kakaópor, cukrozatlan', def: 8, step: 2 },
      { id: 'darkchoc', hu: 'Étcsokoládé', en: 'Dark chocolate', ref: 'Étcsokoládé, 70–85%', def: 10, step: 5 },
      { id: 'cinnamon', hu: 'Fahéj', en: 'Cinnamon', ref: 'Spices, cinnamon, ground', def: 2, step: 1 },
      { id: 'honey', hu: 'Méz', en: 'Honey', ref: 'Méz', def: 10, step: 5 },
      { id: 'maple', hu: 'Juharszirup', en: 'Maple syrup', ref: 'Syrups, maple', def: 10, step: 5 },
      { id: 'erythritol', hu: 'Eritrit', en: 'Erythritol', ref: 'Eritrit (édesítő)', def: 10, step: 5 }] }
  ];
  const ITEMS = {}; GROUPS.forEach(g => g.items.forEach(i => { ITEMS[i.id] = { ...i, group: g.id }; }));
  const MAX = 1000;
  let rows = null;
  function rowOf(ref) {
    const F = window.FOODS; if (!F) return null;
    window.FoodQuery?.install();
    if (!rows) { rows = new Map(); F.list.forEach(r => rows.set(r[0], r)); F.hu.forEach(h => rows.set(h[0], F.list[h[1]])); }
    return rows.get(ref) || null;
  }
  const grams = (it, amount) => Math.round(amount * (it.ml ? it.dens : 1) * 10) / 10;
  /* sel: { id: amount (g, or ml for liquids) } -> totals and parts */
  function compute(sel, lang = 'hu') {
    const parts = [], tot = { g: 0, kcal: 0, p: 0, c: 0, f: 0 };
    Object.entries(sel || {}).forEach(([id, amount]) => {
      const it = ITEMS[id], r = it && rowOf(it.ref), a = Number(amount);
      if (!it || !r || !(a > 0) || a > MAX) return;
      const g = grams(it, a), k = g / 100, part = { id, name: it[lang === 'hu' ? 'hu' : 'en'], amount: a, unit: it.ml ? 'ml' : 'g', g, kcal: r[1] * k, p: r[2] * k, c: r[3] * k, f: r[4] * k };
      parts.push(part); ['g', 'kcal', 'p', 'c', 'f'].forEach(x => { tot[x] += part[x]; });
    });
    const rd = v => Math.round(v * 10) / 10;
    return { parts, g: Math.round(tot.g), kcal: Math.round(tot.kcal), p: rd(tot.p), c: rd(tot.c), f: rd(tot.f) };
  }
  /* Ready recipes. Amounts are our own suggestions; all values come from compute(). */
  const PRESETS = [
    { id: 'overnight-oats', sel: { oats: 50, greek2: 150, milk28: 100, chia: 10, strawberry: 100 } },
    { id: 'oats-choco-pb', hu: 'Csokis-mogyoróvajas fehérjés zab', en: 'Chocolate peanut butter protein oats', sel: { oats: 50, milk15: 150, whey: 25, cocoa: 8, pb: 15, banana: 60 },
      steps: { hu: ['Egy üvegben keverd csomómentesre a fehérjeport és a kakaót a tejjel.', 'Add hozzá a zabot, keverd át, és fedd le.', 'Tedd a hűtőbe legalább 4 órára vagy éjszakára.', 'Reggel tedd a tetejére a felkarikázott banánt és a mogyoróvajat.'], en: ['In a jar, whisk the protein powder and cocoa into the milk until smooth.', 'Stir in the oats and cover.', 'Chill for at least 4 hours or overnight.', 'In the morning top with sliced banana and the peanut butter.'] }, art: ['mix', 'pour', 'chill', 'knife'] },
    { id: 'oats-apple-cinnamon', hu: 'Almás-fahéjas zab dióval', en: 'Apple cinnamon oats with walnuts', sel: { oats: 50, milk15: 120, yogurt: 100, apple: 100, cinnamon: 2, walnut: 10, honey: 10 },
      steps: { hu: ['Reszeld le az almát, és keverd össze a zabbal, a fahéjjal, a joghurttal és a tejjel.', 'Fedd le, és tedd a hűtőbe éjszakára.', 'Reggel csorgasd rá a mézet, és szórd meg durvára vágott dióval.'], en: ['Grate the apple and mix it with the oats, cinnamon, yogurt and milk.', 'Cover and chill overnight.', 'In the morning drizzle with honey and scatter the roughly chopped walnuts on top.'] }, art: ['knife', 'chill', 'serve'] },
    { id: 'oats-berry-turo', hu: 'Túrós-erdei gyümölcsös zab', en: 'Curd cheese and mixed berry oats', sel: { oats: 50, turo: 100, milk15: 120, berries: 80, chia: 5, honey: 10 },
      steps: { hu: ['Keverd simára a túrót a tejjel és a mézzel.', 'Forgasd bele a zabot és a chia magot.', 'Rétegezd üvegbe a fagyasztott gyümölccsel, és tedd a hűtőbe éjszakára: reggelre kiolvad és megfesti a krémet.'], en: ['Mix the curd cheese with the milk and honey until smooth.', 'Fold in the oats and chia seeds.', 'Layer in a jar with the frozen berries and chill overnight: by morning they thaw and colour the cream.'] }, art: ['mix', 'mix', 'chill'] },
    { id: 'oats-mango-coconut', hu: 'Mangós-kókuszos zab', en: 'Mango coconut oats', sel: { oats: 50, almond: 150, greek0: 100, mango: 80, coconut: 8, chia: 8 },
      steps: { hu: ['Keverd össze a zabot, a chia magot, a kókuszreszeléket, a joghurtot és a mandulaitalt.', 'Fedd le, és tedd a hűtőbe éjszakára.', 'Reggel tedd a tetejére a felkockázott mangót.'], en: ['Mix the oats, chia seeds, coconut, yogurt and almond drink.', 'Cover and chill overnight.', 'In the morning top with diced mango.'] }, art: ['mix', 'chill', 'knife'] },
    { id: 'oats-tiramisu', hu: 'Tiramisus zab', en: 'Tiramisu overnight oats', sel: { oats: 50, milk15: 100, espresso: 30, greek2: 100, cocoa: 5, honey: 10 },
      steps: { hu: ['Keverd össze a kihűlt eszpresszót a tejjel, a mézzel és a zabbal.', 'Üvegben rétegezd a görög joghurttal.', 'Tedd a hűtőbe éjszakára, és tálalás előtt szórd meg kakaóporral.'], en: ['Mix the cooled espresso with the milk, honey and oats.', 'Layer it in a jar with the Greek yogurt.', 'Chill overnight and dust with cocoa powder before serving.'] }, art: ['pour', 'serve', 'chill'] }
  ];
  const INTRO = { hu: 'Az összetevőket és mennyiségeket mi javasoljuk; a tápértéket az alkalmazás adatbázisából számoljuk. A képek illusztrációk.', en: 'Ingredients and amounts are our suggestion; nutrition is calculated from the app’s food database. Pictures are illustrations.' };
  function ingredientsOf(sel) {
    return Object.entries(sel).map(([id, a]) => { const it = ITEMS[id]; return [it.hu.toLowerCase(), it.en.toLowerCase(), it.ml ? [a + ' ml', a + ' ml'] : a]; });
  }
  function install() {
    const R = window.RECIPES; if (!R || R._oats || !window.FOODS) return;
    R._oats = true;
    const at = Math.max(0, R.items.findIndex(r => r.id === 'overnight-oats'));
    const made = [];
    PRESETS.forEach(p => {
      const v = compute(p.sel);
      const old = R.items.find(r => r.id === p.id);
      if (old) { Object.assign(old, { oats: p.sel, kcal: v.kcal, p: v.p, c: v.c, f: v.f, g: v.g, ing: ingredientsOf(p.sel) }); return; }
      made.push({ id: p.id, cat: 'breakfast', min: 5, servings: 1, hu: p.hu, en: p.en, illustration: true, oats: p.sel, ing: ingredientsOf(p.sel), steps: p.steps, art: p.art, note: INTRO, kcal: v.kcal, p: v.p, c: v.c, f: v.f, g: v.g });
    });
    R.items.splice(at + 1, 0, ...made);
  }
  install();
  return { GROUPS, ITEMS, PRESETS, compute, install, grams, defaults: () => ({ oats: 50, milk15: 150 }) };
})();
