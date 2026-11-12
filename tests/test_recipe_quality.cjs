// 2.56: every recipe has complete nutrition, a usable method in both languages and real amounts; shared ratings math.
const { test } = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.join(__dirname, '..');
function load() {
  const html = fs.readFileSync(root + '/index.html', 'utf8'), srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  const ctx = { console, localStorage: { getItem() { return null; }, setItem() {} } }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
  const want = s => s.startsWith('data/') || /^js\/(release|food-volume|food-products|food-estimates|food-query|overnight-oats|recipe-goals|cook-art|recipe-ratings)\.js$/.test(s);
  for (const s of srcs.slice(0, srcs.indexOf('js/recipe-ratings.js') + 1)) if (want(s)) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
  return ctx;
}
const ctx = load(), R = ctx.RECIPES.items, J = o => JSON.parse(JSON.stringify(o));

test('every recipe has complete, consistent nutrition per serving', () => {
  assert.ok(R.length >= 51);
  for (const r of R) {
    for (const k of ['kcal', 'p', 'c', 'f']) assert.ok(typeof r[k] === 'number' && r[k] >= 0, `${r.id} ${k}`);
    const calc = 4 * r.p + 4 * r.c + 9 * r.f;
    assert.ok(Math.abs(calc - r.kcal) <= Math.max(25, r.kcal * .12), `${r.id}: ${r.kcal} kcal vs ${Math.round(calc)} from macros`);
  }
});

test('methods are complete in both languages and every step says enough to act on', () => {
  for (const r of R) {
    const hu = r.steps.hu, en = r.steps.en;
    assert.ok(hu.length >= 3 && hu.length === en.length, r.id);
    for (const s of [...hu, ...en]) assert.ok(s.length >= 40, `${r.id}: "${s}"`);
    if (r.art) assert.equal(r.art.length, hu.length, r.id + ' drawings');
    for (const i of r.ing) assert.doesNotMatch(JSON.stringify(i[2]), /choose amount|nem látszik|not shown/, r.id);
  }
  const juice = R.find(r => r.id === 'clip-juice-beet-carrot');
  assert.match(juice.steps.hu.join(' '), /nincs gyümölcscentrifugád/); assert.match(juice.steps.en.join(' '), /No juicer/);
});

test('clip recipes without stated macros are calculated from their ingredients and marked when estimated', () => {
  const get = id => R.find(r => r.id === id);
  const gn = get('clip-chicken-gnocchi'), roll = get('clip-pizza-meat-roll'), flat = get('clip-ham-flatbread'), chick = get('clip-chicken-chickpeas');
  assert.ok(Math.abs(gn.kcal - 525) <= 30 && Math.abs(gn.p - 47) <= 3, 'close to what the clip states');
  assert.ok(Math.abs(chick.kcal - 438) <= 40 && Math.abs(chick.p - 43) <= 3);
  assert.equal(gn.estimated, true); assert.equal(chick.estimated, true); assert.equal(flat.estimated, true); assert.ok(!roll.estimated);
  assert.equal(roll.ing[0][2], 250); assert.match(roll.note.hu, /javaslat/);
  const pan = get('clip-blueberry-pancakes'); assert.deepEqual([pan.kcal, pan.p, pan.c, pan.f], [122, 10, 12.5, 3.5], 'clip values kept');
});

test('ratings update at once, use the server answer and roll back on failure', async () => {
  const calls = []; let fail = false;
  ctx.Cloud = { on: true, user: { id: 'u1' }, publicRpc: async () => ({ 'protein-oats': { avg: 4, n: 2 }, 'BAD id': { avg: 5, n: 1 } }),
    rpc: async (name, body) => { calls.push([name, body]); if (name === 'recipe_rating_mine') return { 'protein-oats': 5 }; if (fail) { const e = new Error('x'); e.code = 'api'; throw e; } return { avg: 4.33, n: 3 }; } };
  const RR = ctx.RecipeRatings;
  assert.equal(RR.available(), false, 'hidden until the backend has answered');
  assert.equal(await RR.load(true), true); assert.equal(RR.available(), true);
  assert.deepEqual(J(RR.get('protein-oats')), { avg: 4, n: 2 }); assert.equal(RR.get('BAD id'), null); assert.equal(RR.mine('protein-oats'), 5);
  const p = RR.rate('eggs-ham-toast', 4); assert.deepEqual(J(RR.get('eggs-ham-toast')), { avg: 4, n: 1 }, 'optimistic'); await p;
  assert.deepEqual(J(RR.get('eggs-ham-toast')), { avg: 4.33, n: 3 }, 'server answer wins');
  fail = true; await assert.rejects(RR.rate('protein-oats', 1)); assert.equal(RR.mine('protein-oats'), 5); assert.deepEqual(J(RR.get('protein-oats')), { avg: 4, n: 2 });
  assert.ok(RR.score('protein-oats') > 3.5 && RR.score('protein-oats') < 4, 'few votes are pulled towards the middle');
  assert.deepEqual(J(calls.find(c => c[0] === 'recipe_rate')[1]), { p_recipe: 'eggs-ham-toast', p_stars: 4 });
  ctx.Cloud.user = null; await assert.rejects(RR.rate('protein-oats', 3), e => e.code === 'signin');
});

test('the migration keeps raters private and only exposes averages', () => {
  const sql = fs.readFileSync(root + '/migrations/20261112_recipe_ratings.sql', 'utf8');
  assert.match(sql, /enable row level security/); assert.match(sql, /revoke all on public\.recipe_ratings from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.recipe_rating_summary\(\) to anon, authenticated/);
  assert.match(sql, /security definer set search_path = ''/); assert.doesNotMatch(sql, /grant execute on function public\.recipe_rate\([^)]*\) to anon/);
});
