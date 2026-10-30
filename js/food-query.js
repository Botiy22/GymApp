/* Offline food understanding, the foundation under every food answer: no AI and no network.
   "1 zsemle hány kalória?", "2 tojás és egy szelet kenyér", "10 dkg sonka", "fél liter tej", "how many grams is a bread roll"
   become database items with grams, calories and macros. Sources: the USDA table in data/foods.js plus the Hungarian
   lexicon in data/food-lexicon.js (aliases, piece weights, label values and dishes calculated from typical recipes).
   A typical piece weight is always marked as typical (≈) so it is never presented as a measured value. */
window.FoodQuery = (() => {
  'use strict';
  const strip = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const r1 = v => Math.round(v * 10) / 10;

  /* ---------- vocabulary ---------- */
  const NUMW = { egy: 1, ket: 2, ketto: 2, harom: 3, negy: 4, ot: 5, hat: 6, het: 7, nyolc: 8, kilenc: 9, tiz: 10, tizenegy: 11, tizenket: 12, tizenketto: 12, tizenot: 15, husz: 20, harminc: 30, negyven: 40, otven: 50, szaz: 100,
    fel: .5, masfel: 1.5, negyed: .25, haromnegyed: .75, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, dozen: 12, half: .5, quarter: .25 };
  const SOFT = { a: 1, an: 1 };                                   // English articles count as one only when nothing else gives a number
  // canonical unit -> [kind, factor]; kind 'g' mass, 'ml' volume, anything else a named portion
  const UNIT = {};
  const addU = (words, u, f) => words.split(' ').forEach(w => { UNIT[w] = [u, f || 1]; });
  addU('g gr gramm gram grams grammot grammnyi', 'g'); addU('dkg deka deko dekagramm dekat dekagram', 'g', 10); addU('kg kilo kilogramm kilogram kilot', 'g', 1000);
  addU('oz ounce ounces', 'g', 28.3495); addU('lb lbs pound pounds', 'g', 453.592);
  addU('ml milliliter', 'ml'); addU('cl centiliter', 'ml', 10); addU('dl deci deciliter decit decis', 'ml', 100); addU('l liter litre liters litres litert', 'ml', 1000);
  addU('ek evokanal evokanalnyi kanal kanalnyi tbsp tablespoon tablespoons', 'ek'); addU('tk teaskanal teaskanalnyi kiskanal kaveskanal tsp teaspoon teaspoons', 'tk');
  addU('db darab drb pc pcs piece pieces', 'db'); addU('szelet slice slices', 'szelet'); addU('karika', 'karika');
  addU('adag serving servings portion portions portio', 'adag'); addU('pohar glass glasses', 'pohar'); addU('bogre mug mugs', 'bogre'); addU('csesze', 'csesze'); addU('cup cups', 'cup');
  addU('gerezd clove cloves', 'gerezd'); addU('fej head heads', 'fej'); addU('kocka square squares cube cubes', 'kocka'); addU('tabla bar bars', 'tabla'); addU('gomboc scoop scoops', 'gomboc');
  addU('marek mareknyi handful handfuls', 'marek'); addU('csomag zacsko pack packs package packet bag', 'csomag'); addU('doboz can cans tin box', 'doboz'); addU('uveg palack bottle bottles', 'uveg');
  addU('korso pint pints', 'korso'); addU('feles kupica shot shots', 'feles'); addU('tanyer tanyernyi tal plate bowl bowls', 'tanyer'); addU('par pair pairs', 'par'); addU('szem', 'szem'); addU('cikk', 'cikk');
  const INTENT = {};
  const addI = (words, k) => words.split(' ').forEach(w => { INTENT[w] = k; });
  addI('kaloria kaloriat kaloriaja kaloriatartalma kaloriatartalom kaloriatartalmu kalorias kalori kcal kcalt kj energia energiat energiaja energiatartalma energiatartalom calorie calories cal kcals', 'kcal');
  addI('feherje feherjet feherjeje feherjetartalma feherjetartalom protein proteins proteint', 'p');
  addI('szenhidrat szenhidratot szenhidratja szenhidrattartalma szenhidrattartalom ch carb carbs carbohydrate carbohydrates', 'c');
  addI('zsir zsirt zsirja zsirtartalma zsirtartalom fat fats', 'f');
  addI('makro makrok makroja makroi makrot macro macros tapertek taperteke tapertekei tapanyag tapanyagtartalma nutrition nutritional nutrients', 'all');
  addI('suly sulya sulyu tomeg tomege tomegu nehez weigh weighs weight', 'g');
  const FILL = new Set(('hany mennyi mekkora mi mit mik milyen van vannak volt lesz benne ben ban az e kb korulbelul nagyjabol kozel atlag atlagos altalaban ' +
    'ettem ettel eszem eszek iszom ittam megettem megittam reggelire ebedre vacsorara uzsonnara tizoraira nassoltam kerem kerlek legyszi mondd mondja megmondod tudod szeretnem tudni ' +
    'tartalmaz tartalma tartalom adatai adat hogy ami amit abban ebben ennek annak nak nek osszesen osszes mennyiseg lenne darabja szelete egyben ' +
    'the of in is are there how many much what whats does do i had ate eat drank my for about approx approximately around roughly typical average please tell me can could you give show contain contains has have per info information value values total').split(' '));
  const SIZE = { nagy: 'large', nagyobb: 'large', large: 'large', big: 'large', kozepes: 'medium', medium: 'medium', kicsi: 'small', kis: 'small', kisebb: 'small', small: 'small' };
  const SIZE_K = { large: 1.3, medium: 1, small: .75 };
  const SPLIT = /\n|;|\+|,(?![^()]*\))(?=\s*\d+(?:[.,]\d+)?\s*(?:kg|dkg|g|ml|dl|l)\b)|\s+(?:és|es|meg|plusz|valamint|and|plus)\s+/i;
  // Hungarian case/possessive endings and English plurals, longest first
  const SUFFIX = ['javal', 'jevel', 'aban', 'eben', 'jaban', 'jeben', 'ban', 'ben', 'bol', 'rol', 'tol', 'nak', 'nek', 'hoz', 'hez', 'val', 'vel', 'nal', 'nel', 'jat', 'jet', 'jal', 'jel', 'nyi', 'ot', 'et', 'at', 'ok', 'ek', 'ak', 'ja', 'je', 'ba', 'be', 'ra', 're', 't', 'k', 'es', 's'];
  const canon = w => w.length > 3 && /s$/.test(w) && !/(ss|us|is|zs|ys)$/.test(w) ? (/ies$/.test(w) ? w.slice(0, -3) + 'y' : /oes$/.test(w) ? w.slice(0, -2) : w.slice(0, -1)) : w;
  const unitOf = (w, loose) => { if (UNIT[w]) return UNIT[w]; if (!loose) return null; for (const s of SUFFIX) if (s !== 's' && s !== 'es' && w.length - s.length >= 1 && w.endsWith(s) && UNIT[w.slice(0, -s.length)]) return UNIT[w.slice(0, -s.length)]; if (/s$/.test(w) && UNIT[w.slice(0, -1)]) return UNIT[w.slice(0, -1)]; return null; };   // endings only right after a number: "2 szeletet", never "fejes saláta"
  const intentOf = w => INTENT[w] || (/^kaloria/.test(w) ? 'kcal' : /^feherjetartalm/.test(w) ? 'p' : /^szenhidrattartalm/.test(w) ? 'c' : /^zsirtartalm/.test(w) ? 'f' : null);

  /* ---------- tokens ---------- */
  function prep(s) {
    return strip(String(s || '').replace(/½/g, ' 0.5 ').replace(/¼/g, ' 0.25 ').replace(/¾/g, ' 0.75 '))
      .replace(/(\d),(\d)/g, '$1.$2').replace(/(\d|\b(?:g|kg|dkg|dl|cl|ml|l|db|ek|tk))-[a-z]{1,4}\b/g, '$1').replace(/(\d)\s*[-–]\s*(\d)/g, '$1~$2').replace(/%\s*-?\s*(?:os|es|as|ös)\b/g, '%').replace(/(\d)\s*x\b/g, '$1 ').replace(/\bx\s*(\d)/g, ' $1');
  }
  const tokens = s => prep(s).match(/\d*\.?\d+(?:\/\d+)?(?:~\d*\.?\d+)?%?|[a-z]+(?:'[a-z]+)?/g) || [];
  const numOf = tk => {
    if (/%$/.test(tk)) return null;
    let m = tk.match(/^(\d*\.?\d+)~(\d*\.?\d+)$/); if (m) return { v: (+m[1] + +m[2]) / 2, range: true };
    m = tk.match(/^(\d+)\/(\d+)$/); if (m && +m[2]) return { v: +m[1] / +m[2] };
    if (/^\d*\.?\d+$/.test(tk)) return { v: +tk };
    return NUMW[tk] != null ? { v: NUMW[tk], word: true } : null;
  };
  const nameToks = s => tokens(String(s).replace(/\([^)]*\)/g, m => ' ' + m.slice(1, -1) + ' ')).map(canon);

  /* ---------- index (built on first use) ---------- */
  let IX = null;
  function install() {
    const F = window.FOODS, LX = window.FOOD_LEXICON;
    if (!F || F._lexicon || !LX) return F;
    F.meta = F.meta || {};
    const listBy = new Map(F.list.map((r, i) => [r[0], i])), huBy = new Map(F.hu.map((h, i) => [h[0], i]));
    const rowOf = name => listBy.has(name) ? listBy.get(name) : huBy.has(name) ? F.hu[huBy.get(name)][1] : -1;
    LX.items.forEach(it => {
      let i = -1;
      if (it.usda) i = rowOf(it.usda);
      else if (it.own || it.mix) {
        let v = it.own;
        if (it.mix) {
          const tot = [0, 0, 0, 0]; let ok = true;
          it.mix.forEach(([n, g]) => { const k = rowOf(n); if (k < 0) { ok = false; return; } for (let j = 0; j < 4; j++) tot[j] += F.list[k][j + 1] * g / 100; });
          v = ok && it.yield > 0 ? tot.map(x => x * 100 / it.yield) : null;
        }
        if (v) { i = F.list.length; F.list.push([it.en || it.hu, Math.round(v[0]), r1(v[1]), r1(v[2]), r1(v[3])]); listBy.set(it.en || it.hu, i); }
      }
      let h = huBy.has(it.hu) ? huBy.get(it.hu) : -1;
      if (h < 0) {
        if (i < 0) { (LX.missing = LX.missing || []).push(it.hu); return; }
        const port = it.port || (it.u && Object.keys(it.u)[0] ? ['1 ' + ({ db: 'db', szelet: 'szelet', adag: 'adag', tanyer: 'tányér', pohar: 'pohár' }[Object.keys(it.u)[0]] || Object.keys(it.u)[0]), it.u[Object.keys(it.u)[0]]] : null);
        h = F.hu.length; F.hu.push(port ? [it.hu, i, it.approx ? 1 : 0, port[0], port[1]] : [it.hu, i, it.approx ? 1 : 0]); huBy.set(it.hu, h);
      }
      const m = F.meta[h] = F.meta[h] || { alias: [], u: {} };
      m.alias.push(...String(it.a || '').split('|').filter(Boolean)); Object.assign(m.u, it.u || {});
      ['w', 'en', 'ref', 'def', 'dens', 'kind'].forEach(k => { if (it[k] != null) m[k] = it[k]; });
      if (it.mix) m.mixed = true;
    });
    F._lexicon = LX.version || 1; IX = null;
    return F;
  }
  function index() {
    if (IX) return IX;
    const F = install() || window.FOODS || { hu: [], list: [] };
    const phrases = [], tok = new Map(), full = new Map(), vocab = new Set(), huRow = new Set(), huTok = new Set(), rowHu = new Map();
    const add = (e, toks, prio) => { if (!toks.length) return; const p = phrases.length; phrases.push({ e, t: toks, prio }); new Set(toks).forEach(w => { vocab.add(w); if (prio > 0) huTok.add(w); if (!tok.has(w)) tok.set(w, []); tok.get(w).push(p); }); };
    const entries = [];
    F.hu.forEach((h, k) => {
      const e = entries.length; entries.push({ h: k, i: h[1], order: k });
      huRow.add(h[1]); if (!rowHu.has(h[1])) rowHu.set(h[1], k);
      full.set(nameToks(h[0]).join(' '), e);
      add(e, nameToks(h[0]), 30);
      const plain = nameToks(h[0].replace(/\([^)]*\)/g, ' ')); if (plain.length) add(e, plain, 26);
      const head = nameToks(h[0].split(',')[0].replace(/\([^)]*\)/g, ' ')); if (head.length && head.join() !== plain.join()) add(e, head, 20);
      (F.meta?.[k]?.alias || []).forEach(a => add(e, nameToks(a), 40));
    });
    F.list.forEach((r, i) => {
      const e = entries.length; entries.push({ h: -1, i, order: 100000 + i });
      const t = nameToks(r[0]); if (!full.has(t.join(' '))) full.set(t.join(' '), e);
      add(e, t, huRow.has(i) ? -5 : 0);
    });
    IX = { F, phrases, tok, full, vocab, entries, huTok, rowHu };
    return IX;
  }

  /* ---------- food phrase -> best database entry ---------- */
  function edit1(a, b, max) {                                     // bounded Damerau-Levenshtein
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) { let best = 99; for (let j = 1; j <= b.length; j++) { d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); best = Math.min(best, d[i][j]); } if (best > max) return max + 1; }
    return d[a.length][b.length];
  }
  function stems(w) {                                              // candidate dictionary forms of a Hungarian/English word
    const out = [], seen = new Set(), push = x => { if (x.length >= 2 && !seen.has(x)) { seen.add(x); out.push(x); } };
    const one = x => { const r = []; for (const s of SUFFIX) if (x.length - s.length >= 2 && x.endsWith(s)) { const b = x.slice(0, -s.length); r.push(b); if (/([bcdfghjklmnprstvz])\1$/.test(b)) r.push(b.slice(0, -1)); }
      const m = x.match(/^(.*?)([bcdfghjklmnprstvz])\2(?:al|el)$/); if (m) r.push(m[1] + m[2]); return r; };            // sajttal -> sajt, tojással -> tojás
    one(w).forEach(b => { push(b); one(b).forEach(push); });
    return out;
  }
  function canonQ(w, X) { const r = canonQ0(w, X); r.orig = w; return r; }
  function canonQ0(w, X) {                                         // query word -> vocabulary word (+ how sure)
    const c = canon(w); if (X.vocab.has(c)) return { w: c, cost: 0 };
    for (const b of stems(w)) { const cb = canon(b); if (X.vocab.has(cb)) return { w: cb, cost: 0 }; }
    if (c.length >= 5 && !/\d/.test(c)) {
      const max = c.length >= 9 ? 2 : 1; let best = null;
      for (const v of X.vocab) { if (v.length < 4 || Math.abs(v.length - c.length) > max || /\d/.test(v)) continue; const d = edit1(c, v, max); if (d <= max && (!best || d < best.d || (d === best.d && X.huTok.has(v) && !X.huTok.has(best.w)))) best = { w: v, d }; }
      if (best) return { w: best.w, cost: .3 * best.d, typo: w };
    }
    return { w: c, cost: 0, unknown: true };
  }
  function resolve(words) {
    const X = index();
    const q = words.map(w => canonQ(w, X)), Q = q.map(x => x.w), set = new Set(Q), unknown = new Set(q.filter(x => x.unknown).map(x => x.w));
    const score = new Map(), cand = new Set(); Q.forEach(w => (X.tok.get(w) || []).forEach(p => cand.add(p)));
    cand.forEach(p => {
      const P = X.phrases[p]; let m = 0, cost = 0; const used = new Set();
      P.t.forEach(w => { if (set.has(w) && !used.has(w)) { used.add(w); m++; const z = q.find(x => x.w === w); cost += z ? z.cost : 0; } });
      if (!m) return;
      const extra = Q.filter(w => !used.has(w)), known = extra.filter(w => !unknown.has(w)).length, missing = P.t.length - m;
      if (!((m > known || (missing === 0 && P.prio > 0 && known <= 1)) && extra.length - known <= 1)) return;
      const s = 100 * m - 60 * known - 25 * (extra.length - known) - 8 * missing - 30 * cost + P.prio;
      const tight = P.prio > 0 || missing <= 1;                      // long USDA names only count as exact when nearly every word was typed
      const cur = score.get(P.e); if (!cur || s > cur.s) score.set(P.e, { s, extra, known, missing, m, exact: !extra.length && tight, soft: !known && tight, full: !extra.length && !missing });
    });
    const ranked = [...score.entries()].map(([e, v]) => ({ e, ...v })).sort((a, b) => b.s - a.s || X.entries[a.e].order - X.entries[b.e].order);
    if (!ranked.length) return null;
    const best = ranked[0];
    const seen = new Set([X.entries[best.e].i]), alts = [];
    for (const x of ranked.slice(1)) { const en = X.entries[x.e]; if (seen.has(en.i) || x.s < best.s - 140) continue; seen.add(en.i); alts.push(x.e); if (alts.length >= 3) break; }
    return { e: best.e, exact: best.exact, soft: best.soft, full: best.full, ignored: best.extra.map(c => (q.find(x => x.w === c) || {}).orig || c), alts, typos: q.filter(x => x.typo).map(x => [x.typo, x.w]) };
  }

  /* ---------- portions ---------- */
  const COUNT = /\b(medium|large|small|extra large|each|item|fruit|whole|roll|link|frankfurter|piece|pastry|muffin|doughnut|donut|croissant|cookie|patty|sandwich|chop|steak|drumstick|thigh|wing|leg|breast|egg|pita|tortilla|pancake|waffle|bagel|biscuit|potato|cucumber|stick|bun|burger|nugget|taco|burrito|pepper|tomato|onion|carrot|banana|apple|orange|pear|peach|plum|kiwi|lemon|lime)\b/;
  function portionsOf(en) {                                        // [{u, g, size, label}] from the stored USDA portions
    const X = index(), r = X.F.list[en.i], out = [];
    for (let k = 5; k + 1 < r.length; k += 2) {
      const g = +r[k], lab = String(r[k + 1] || ''), m = lab.match(/^(\d*\.?\d+)\s+(.*)$/); if (!(g > 0) || !m) continue;
      const n = +m[1], w = m[2].toLowerCase(); if (!(n > 0)) continue;
      const size = /extra large/.test(w) ? 'xl' : /\blarge\b/.test(w) ? 'large' : /\bsmall\b|\bmini/.test(w) ? 'small' : /\bmedium\b/.test(w) ? 'medium' : '';
      let u = /\bslices?\b/.test(w) ? 'szelet' : /\b(tbsp|tablespoons?)\b/.test(w) ? 'ek' : /\b(tsp|teaspoons?)\b/.test(w) ? 'tk' : /\bcups?\b/.test(w) ? 'cup' : /\bcans?\b/.test(w) ? 'doboz' : /\bbottle/.test(w) ? 'uveg' : /\b(package|packet|container|box)\b/.test(w) ? 'csomag'
        : /\bcloves?\b/.test(w) ? 'gerezd' : /\bhead\b/.test(w) ? 'fej' : /\bscoop/.test(w) ? 'gomboc' : /\b(serving|order|portion)\b/.test(w) ? 'adag' : /\b(jigger|shot)\b/.test(w) ? 'feles' : /\bbar\b/.test(w) ? 'tabla' : /\bsquares?\b/.test(w) ? 'kocka' : COUNT.test(w) || /^(gumdrops|grapes|twists|wafers|cookies|chips)/.test(w) ? 'db' : '';
      if (!u) continue;
      const plain = u === 'cup' && /^cups?(,\s*(dry|raw|cooked|uncooked|prepared))?$/.test(w);
      out.push({ u, g: g / n, size, label: lab, plain });
    }
    return out;
  }
  const HU_PORT = { db: /\bdb\b|darab|\bkozepes\b|\bnagy\b|\bkicsi\b/, szelet: /szelet/, adag: /adag/, pohar: /pohar/, korso: /korso/, doboz: /doboz/, ek: /evokanal/, tk: /teaskanal/, tanyer: /tanyer/, bogre: /bogre/, csesze: /csesze/, feles: /feles/ };
  const huPortUnit = l => { for (const u of Object.keys(HU_PORT)) if (u !== 'db' && HU_PORT[u].test(l)) return u; return HU_PORT.db.test(l) ? 'db' : ''; };
  const VOL = { pohar: [250, false], bogre: [300, true], csesze: [200, true], cup: [236.588, false], ek: [15, false], tk: [5, false], korso: [500, false], feles: [50, false] };
  function density(en) {                                           // grams per ml, documented only
    const X = index(), m = en.h >= 0 ? X.F.meta?.[en.h] : null;
    if (m && m.dens > 0) return m.dens;
    const v = window.FoodVolume?.describe(X.F.list[en.i], en.h >= 0 ? X.F.hu[en.h] : null);
    return v && v.gramsPerDl > 0 ? v.gramsPerDl / 100 : 0;
  }
  function unitGrams(en, u, size) {
    const X = index(), meta = en.h >= 0 ? X.F.meta?.[en.h] : null, hu = en.h >= 0 ? X.F.hu[en.h] : null;
    const wnote = k => meta?.w?.[k] || '';
    if (u === 'par') { const one = unitGrams(en, 'db', size); return one ? { ...one, g: one.g * 2 } : null; }
    let hit = null;
    if (meta?.u?.[u] > 0) hit = { g: meta.u[u], typ: true, note: wnote(u) };
    if (!hit && hu && hu[3] && hu[4] > 0) { const l = strip(hu[3]), n = +(l.match(/^(\d*\.?\d+)\s/) || [0, 1])[1] || 1; if (huPortUnit(l) === u) hit = { g: hu[4] / n, typ: false, note: '' }; }
    const ports = portionsOf(en);
    if (!hit) {
      const list = ports.filter(p => p.u === u || (u === 'csesze' && p.u === 'cup' && density(en) === 0));
      if (list.length) {
        const pick = (size && list.find(p => p.size === size)) || list.find(p => p.size === 'medium') || list.find(p => !p.size) || list.find(p => p.size === 'large') || list[0];
        hit = { g: pick.g, typ: false, note: '', usda: pick.label, sized: !!size && pick.size === size };
      }
    }
    if (!hit && (u === 'ek' || u === 'tk' || u === 'cup')) {
      const cup = ports.find(p => p.u === 'cup' && p.plain); const d = density(en);
      if (d > 0) hit = { g: VOL[u][0] * d, typ: false, note: '', vol: true };
      else if (cup) hit = { g: u === 'cup' ? cup.g : cup.g / (u === 'ek' ? 16 : 48), typ: false, note: '', usda: cup.label };
    }
    if (!hit && VOL[u]) { const d = density(en); if (d > 0) hit = { g: VOL[u][0] * d, typ: VOL[u][1], note: '', vol: true }; }
    if (!hit && ['tabla', 'szem', 'cikk', 'karika', 'gerezd'].includes(u)) return u === 'karika' ? unitGrams(en, 'szelet', size) : unitGrams(en, 'db', size);
    if (!hit && u === 'tanyer') return unitGrams(en, 'adag', size);
    if (!hit) return null;
    if (size && !hit.sized && u === 'db' && SIZE_K[size] !== 1) hit = { ...hit, g: hit.g * SIZE_K[size], typ: true, sizeScaled: size };
    return hit;
  }
  function defaultUnit(en) {
    const X = index(), meta = en.h >= 0 ? X.F.meta?.[en.h] : null, hu = en.h >= 0 ? X.F.hu[en.h] : null;
    if (meta?.def) return meta.def;
    for (const u of ['db', 'szelet', 'adag']) if (meta?.u?.[u]) return u;
    if (hu && hu[3]) { const u = huPortUnit(strip(hu[3])); if (u) return u; }
    if (meta?.u && Object.keys(meta.u).length) return Object.keys(meta.u)[0];
    if (portionsOf(en).some(p => p.u === 'db')) return 'db';
    return '';
  }

  /* ---------- one piece of text: "2 db zsemle", "10 dkg sonka" ---------- */
  function scan(text) {
    const tk = tokens(text), out = { segs: [], intent: new Set() };
    let cur = null;
    const start = () => { cur = { qty: null, qtyWord: false, unit: null, size: '', sizeWord: '', food: [], raw: [], soft: null }; out.segs.push(cur); };
    start();
    for (let k = 0; k < tk.length; k++) {
      const w = tk[k], n = numOf(w);
      if (n) {
        if (cur.unit && cur.qty == null && cur.soft == null && !cur.food.length) cur.unit = null;          // a dangling unit word was not a unit ("can you … 200 g")
        if (cur.food.length && (cur.qty != null || cur.unit || nextHasFood(tk, k + 1))) start();      // a second amount starts a new food
        if (cur.qty != null && !cur.food.length && cur.unit == null && n.v < 1) cur.qty = cur.qtyWord ? n.v : cur.qty + n.v;   // "egy fél" = 0.5, "1 1/2" = 1.5
        else cur.qty = n.v;
        cur.qtyWord = !!n.word; if (n.range) cur.range = true;
        const u = tk[k + 1] && unitOf(tk[k + 1], true); if (u && cur.unit == null) { cur.unit = u; k++; }
        continue;
      }
      if (SOFT[w] && cur.qty == null && !cur.food.length) { cur.soft = 1; const u = tk[k + 1] && unitOf(tk[k + 1], true); if (u) { cur.unit = u; k++; } continue; }
      const it = intentOf(w);
      if (it && !(it === 'f' && cur.unit && !cur.food.length)) { out.intent.add(it); continue; }   // "1 ek zsír" is lard, "hány zsír" is a question
      if (FILL.has(w)) { if (cur.food.length) cur.raw.push(w); continue; }
      const u = unitOf(w, false);
      if (u && u[0] === 'g' && cur.qty == null) { out.intent.add('g'); continue; }                // "hány gramm"
      if (u && !cur.food.length && cur.unit == null) { cur.unit = u; continue; }
      if (SIZE[w] && !cur.food.length) { cur.size = SIZE[w]; cur.sizeWord = w; continue; }
      if (cur.food.length && WITH.test(w) && !canonQ(w, index()).unknown) { start(); }      // "rántott hús krumplipürével", "zsemle vajjal": a second food
      cur.food.push(w); cur.raw.push(w);
    }
    out.segs = out.segs.filter(s => s.food.length || s.qty != null || s.unit);
    return out;
  }
  const WITH = /(?:val|vel|jal|jel|([bcdfghjklmnprstvz])\1(?:al|el))$/;
  const nextHasFood = (tk, k) => { for (; k < tk.length; k++) { const w = tk[k]; if (numOf(w)) return false; if (unitOf(w) || FILL.has(w) || intentOf(w) || SIZE[w]) continue; return true; } return false; };

    function itemFromSeg(seg, opts) {
    const X = index(), raw = seg.food.join(' ');
    const base = { text: raw, qty: seg.qty != null ? seg.qty : seg.soft, unit: seg.unit, size: seg.size, range: !!seg.range };
    if (!seg.food.length) return { ...base, status: 'unknown', text: '' };
    // an exact full database name first (keeps typed USDA names such as "Milk, whole, 3.25% milkfat, with added vitamin D")
    let e = X.full.get(seg.raw.map(canon).join(' ')), res = null;
    if (e == null) e = X.full.get(seg.food.map(canon).join(' '));
    if (e != null) res = { e, exact: true, soft: true, full: true, ignored: [], alts: [], typos: [] };
    else {
      res = resolve(seg.food);
      if (seg.sizeWord) { const r2 = resolve([seg.sizeWord, ...seg.food]); if (r2 && r2.exact && (!res || !res.exact || r2.e !== res.e)) { res = r2; base.size = ''; } }   // "nagy fröccs", "kis fröccs"
    }
    if (!res) return { ...base, status: 'unknown' };
    const en = X.entries[res.e];
    const it = { ...base, entry: en, exact: res.exact, soft: res.soft, full: !!res.full, ignored: res.ignored, alts: res.alts.map(a => X.entries[a]), typos: res.typos || [], status: 'ok' };
    if (opts.strict && !res.exact) { it.status = 'unknown'; return it; }
    const qty = base.qty, unit = seg.unit;
    if (unit && unit[0] === 'g') it.grams = (qty ?? 1) * unit[1];
    else if (unit && unit[0] === 'ml') {
      const d = density(en); it.ml = (qty ?? 1) * unit[1];
      if (d > 0) it.grams = it.ml * d; else { it.status = 'needGrams'; it.why = 'volume'; }
    } else {
      const u = unit ? unit[0] : defaultUnit(en);
      if (!u) { if (qty == null && !opts.strict) { it.implicit = true; it.per100 = true; it.grams = 100; } else { it.status = qty == null ? 'needAmount' : 'needGrams'; it.why = 'count'; } }
      else {
        const ug = unitGrams(en, u, base.size);
        if (!ug) { it.status = 'needGrams'; it.why = 'unit'; it.u = u; }
        else if (opts.strict && qty == null && !unit && (u === 'adag' || ug.typ && u !== 'db')) { it.status = 'needAmount'; it.u = u; }   // the diary never guesses a serving
        else { if (qty == null) it.implicit = true; it.u = u; it.unitG = ug; it.grams = (qty ?? 1) * ug.g; it.typ = !!ug.typ; }
      }
    }
    if (it.grams != null && !(it.grams > 0 && it.grams <= 5000)) it.status = 'bad';
    if (it.status === 'ok') {
      const r = X.F.list[en.i]; it.k100 = r[1]; it.p100 = r[2]; it.c100 = r[3]; it.f100 = r[4];
      const k = it.grams / 100; it.kcal = Math.round(r[1] * k); it.p = r1(r[2] * k); it.c = r1(r[3] * k); it.f = r1(r[4] * k);
    }
    return it;
  }
  const LABEL = /^(\d+(?:[.,]\d+)?)\s*(g|kg)\s+(.+?)\s*\((\d+(?:[.,]\d+)?)\s*kcal,\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:protein|fehérje|feherje),\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:carbs|szénhidrát|szenhidrat),\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:fat|zsír|zsir)\)$/i;
  function labelItem(part) {                                       // portion totals the user copied from a label: never inferred from a brand
    const m = part.trim().match(LABEL); if (!m) return null;
    const grams = +m[1].replace(',', '.') * (m[2].toLowerCase() === 'kg' ? 1000 : 1), v = m.slice(4).map(x => +x.replace(',', '.'));
    if (!(grams > 0) || grams > 5000 || v.slice(1).reduce((a, b) => a + b, 0) > grams * 1.05 || v[0] > grams * 9.02) return { text: part, status: 'bad' };
    return { text: m[3], label: true, status: 'ok', grams, kcal: Math.round(v[0]), p: v[1], c: v[2], f: v[3], k100: v[0] * 100 / grams, p100: v[1] * 100 / grams, c100: v[2] * 100 / grams, f100: v[3] * 100 / grams };
  }
  function parsePiece(piece, opts) {
    if(/^\s*-\s*\d/.test(piece))return {items:[{text:piece,status:'bad'}],intent:new Set()};
    const lab = labelItem(piece); if (lab) return { items: [lab], intent: new Set(), stray: 0 };
    const products=window.FoodProducts, d=products?.read(piece), saved=products?.saved(piece,opts.foods||window.Store?.d?.myFoods);
    if(saved)return {items:[saved],intent:new Set()};
    const memories=window.FoodMemory?.resolve(piece,opts.doc||window.Store?.d);if(memories)return {items:memories,intent:new Set()};
    if(d?.packaged)return {items:[{...d,text:d.name,status:d.amount==null?'needAmount':'needLabel'}],intent:new Set()};
    if(/^(?:\d+(?:[.,]\d+)?\s*g\s+)?fagyi gyumi$/i.test(strip(piece).trim()))return {items:[{text:piece,status:'needIdentity'}],intent:new Set()};
    const sc = scan(d ? (d.amount!=null?d.amount+' '+d.unit+' ':'')+d.name : piece);
    return { items: sc.segs.map(s => ({...itemFromSeg(s, opts),original:sc.segs.length===1?piece:undefined})), intent: sc.intent };
  }
  const grade = r => r.items.reduce((s, i) => s + (i.status === 'ok' ? (i.exact ? 10 : 4) : i.status === 'unknown' && !i.text ? 0 : i.status === 'unknown' ? -15 : -5), 0);
  function parse(text, opts = {}) {
    text = String(text || '').trim();
    if(text.length>4000)return {items:[{text:'…',status:'tooLong'}],intent:new Set()};
    const out = { items: [], intent: new Set() };
    if (!text) return out;
    const parts = text.replace(/^(?:I (?:had|ate|drank)|ettem|ittam|megettem)\s+/i, '').replace(/(\d),(?=\d)/g,'$1\uE000').split(SPLIT).map(x => x.replace(/\uE000/g,',').trim()).filter(Boolean);
    if (parts.length > 30)return {items:[{text:'…',status:'tooLong'}],intent:new Set()};
    for (const part of parts) {
      let best = parsePiece(part, opts);
      const pieces = part.split(/,(?![^()]*\))|\s+(?:with|with a|with some)\s+/i).map(x => x.trim()).filter(Boolean);
      if (pieces.length > 1 && !best.items.some(i=>i.memoryId||['needLabel','needIdentity','needMemory','needMemoryAmount'].includes(i.status))) {
        const alt = pieces.map(p => parsePiece(p, opts)), merged = { items: alt.flatMap(a => a.items), intent: new Set(alt.flatMap(a => [...a.intent])) };
        if (!best.items.every(i => i.status === 'ok' && i.exact) && grade(merged) > grade(best)) best = merged;
      }
      best.items.forEach(i => { if (i.status !== 'unknown' || i.text) out.items.push(i); });
      best.intent.forEach(k => out.intent.add(k));
    }
    return out;
  }

  /* ---------- presentation ---------- */
  const TXT = {
    hu: { p: 'fehérje', c: 'szénhidrát', f: 'zsír', per100: '100 g-ban', total: 'Összesen', nf: 'Nem találtam az adatbázisban: {0}.', need: '{0}: írd meg grammban (pl. 150 g {0}).', needVol: '{0}: ehhez nincs dokumentált sűrűség, írd meg grammban.',
      ign: 'A(z) „{0}” szót nem vettem figyelembe.', typo: 'Elírásnak vettem: „{0}” → {1}.', typ: 'tipikus mennyiség', src: 'Forrás: helyi adatbázis ({0}). A ≈ tipikus vagy becsült érték; mérve pontosabb.', srcUsda: 'USDA SR28', srcLex: 'magyar kiegészítés',
      alts: 'Vagy erre gondoltál: {0}?', approx: 'közelítő adat', recipe: 'tipikus házi recept alapján számolva', label: 'címke', calc: 'USDA adatokból számolva', vals: 'adatai' },
    en: { p: 'protein', c: 'carbs', f: 'fat', per100: 'Per 100 g', total: 'Total', nf: 'Not in the database: {0}.', need: '{0}: give the amount in grams (e.g. 150 g {0}).', needVol: '{0}: there is no documented density for this, give it in grams.',
      ign: 'I ignored the word "{0}".', typo: 'Read "{0}" as {1}.', typ: 'typical amount', src: 'Source: local database ({0}). ≈ marks a typical or estimated value; weighing is more accurate.', srcUsda: 'USDA SR28', srcLex: 'Hungarian additions',
      alts: 'Or did you mean: {0}?', approx: 'approximate data', recipe: 'calculated from a typical home recipe', label: 'label', calc: 'calculated from USDA data', vals: 'values' }
  };
  const UL = {
    hu: { db: 'db', szelet: 'szelet', karika: 'karika', adag: 'adag', ek: 'evőkanál', tk: 'teáskanál', pohar: 'pohár', bogre: 'bögre', csesze: 'csésze', cup: 'csésze', gerezd: 'gerezd', fej: 'fej', kocka: 'kocka', tabla: 'tábla', gomboc: 'gombóc', marek: 'marék', csomag: 'csomag', doboz: 'doboz', uveg: 'üveg', korso: 'korsó', feles: 'feles', tanyer: 'tányér', par: 'pár', szem: 'szem', cikk: 'cikk' },
    en: { db: ['piece', 'pieces'], szelet: ['slice', 'slices'], karika: ['slice', 'slices'], adag: ['serving', 'servings'], ek: ['tbsp', 'tbsp'], tk: ['tsp', 'tsp'], pohar: ['glass', 'glasses'], bogre: ['mug', 'mugs'], csesze: ['cup', 'cups'], cup: ['cup', 'cups'], gerezd: ['clove', 'cloves'], fej: ['head', 'heads'], kocka: ['square', 'squares'], tabla: ['bar', 'bars'], gomboc: ['scoop', 'scoops'], marek: ['handful', 'handfuls'], csomag: ['pack', 'packs'], doboz: ['can', 'cans'], uveg: ['bottle', 'bottles'], korso: ['pint', 'pints'], feles: ['shot', 'shots'], tanyer: ['bowl', 'bowls'], par: ['pair', 'pairs'], szem: ['piece', 'pieces'], cikk: ['wedge', 'wedges'] }
  };
  const fmt = (v, lang) => { const s = String(Math.round(v * 10) / 10); return lang === 'hu' ? s.replace('.', ',') : s; };
  const fill = (s, ...a) => a.reduce((x, v, i) => x.split('{' + i + '}').join(v), s);
  function nameOf(en, lang) {
    const X = index(); if (!en) return '';
    const meta = en.h >= 0 ? X.F.meta?.[en.h] : null;
    const h = en.h >= 0 ? en.h : X.rowHu.has(en.i) ? X.rowHu.get(en.i) : -1;
    if (lang === 'hu' && h >= 0) return X.F.hu[h][0];
    return meta?.en || X.F.list[en.i][0];
  }
  function qtyText(it, lang) {
    if (it.label) return it.basisUnit==='ml'?fmt(it.ml/100,lang)+' dl':fmt(it.grams, lang) + ' g';
    const q = it.qty ?? 1, qs = q === .5 && lang === 'hu' ? 'fél' : fmt(q, lang);
    if (it.unit && it.unit[0] === 'g') return fmt(q, lang) + ' ' + (it.unit[1] === 10 ? 'dkg' : it.unit[1] === 1000 ? 'kg' : it.unit[1] === 1 ? 'g' : (it.unit[1] > 400 ? 'lb' : 'oz'));
    if (it.unit && it.unit[0] === 'ml') return fmt(q, lang) + ' ' + ({ 1: 'ml', 10: 'cl', 100: 'dl', 1000: 'l' }[it.unit[1]] || 'ml');
    if (it.per100) return '100 g';
    if (!it.u) return qs;
    const l = UL[lang === 'hu' ? 'hu' : 'en'][it.u]; return qs + ' ' + (Array.isArray(l) ? l[q === 1 ? 0 : 1] : l);
  }
  function view(it, lang) {                                       // plain data for the app's own cards
    if(it.memoryId)return {name:it.text,qty:it.basisUnit==='ml'?fmt(it.ml/100,lang)+' dl':it.basisUnit==='portion'?fmt(it.servings,lang)+(lang==='hu'?' adag':' servings'):fmt(it.grams,lang)+' g',...it,approx:it.estimated,typ:false,usda:'',alts:[],ignored:[],typos:[],per100:false,implicit:false,full:true,i:-1,h:-1,label:!!it.label};
    const X = index(), en = it.entry, meta = en && en.h >= 0 ? X.F.meta?.[en.h] : null, hu = en && en.h >= 0 ? X.F.hu[en.h] : null;
    return { basisUnit:it.basisUnit||'g', name: it.label ? it.text : nameOf(en, lang), qty: qtyText(it, lang), grams: it.grams != null ? r1(it.grams) : null, kcal: it.kcal, p: it.p, c: it.c, f: it.f, k100: it.k100, p100: it.p100, c100: it.c100, f100: it.f100,
      typ: !!it.typ, note: it.unitG?.note || '', approx: !!(hu && hu[2]) || !!meta?.mixed, mixed: !!meta?.mixed, ref: meta?.ref || '', usda: en ? X.F.list[en.i][0] : '', key: en ? (en.h >= 0 ? 'hu:' + hu[0] : 'en:' + X.F.list[en.i][0]) : '',
      h: en ? en.h : -1, i: en ? en.i : -1, ml: it.ml || 0, alts: (it.alts || []).map(a => ({ name: nameOf(a, lang), h: a.h, i: a.i })), implicit: !!it.implicit, per100: !!it.per100, exact: !!it.exact, full: !!it.full, ignored: it.ignored || [], u: it.u || '', label: !!it.label, typos: it.typos || [] };
  }
  function answer(text, lang = 'hu', opts = {}) {
    const L = TXT[lang === 'hu' ? 'hu' : 'en'], r = parse(text, opts), ok = r.items.filter(i => i.status === 'ok');
    if (!ok.length) return null;
    const unknown = r.items.filter(i => ['unknown','needLabel','needIdentity','needMemory','needMemoryAmount','tooLong'].includes(i.status) && i.text), need = r.items.filter(i => i.status === 'needGrams' || i.status === 'needAmount');
    const hasQty = r.items.some(i => i.qty != null || i.unit), intent = r.intent;
    // a chat message is answered here only when every word is accounted for
    const strayWords = ok.reduce((s, i) => s + (i.ignored || []).length, 0);
    const chat = !unknown.length && !r.items.some(i => i.status === 'bad') && strayWords <= ok.length && (intent.size > 0 || hasQty || (ok.every(i => i.exact) && !r.items.some(i => i.status !== 'ok')));
    const tot = ok.reduce((a, i) => ({ g: a.g + i.grams, kcal: a.kcal + i.kcal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { g: 0, kcal: 0, p: 0, c: 0, f: 0 });
    const views = ok.map(i => view(i, lang)), lines = [];
    const gramsOnly = intent.has('g') && intent.size === 1;
    const macroLine = v => `${L.p} ${fmt(v.p, lang)} g · ${L.c} ${fmt(v.c, lang)} g · ${L.f} ${fmt(v.f, lang)} g`;
    const focus = v => ['p', 'c', 'f'].filter(k => intent.has(k)).map(k => `${L[k]}: **${fmt(v[k], lang)} g**`).join(' · ');
    views.forEach((v, k) => {
      const g = v.label || v.memoryId ? '' : ` ${v.typ ? '≈' : '='} ${fmt(v.grams, lang)} g`;
      if (views.length === 1) {
        lines.push(gramsOnly ? `**${v.qty} ${v.name}${g}**` : `**${v.qty} ${v.name}**${g}: **${v.kcal} kcal**`);
        const fx = focus(v);
        if (gramsOnly) lines.push(`${v.kcal} kcal · ${macroLine(v)}`); else lines.push(fx || macroLine(v));
        if (v.typ) lines.push(`${L.typ}${v.note && lang === 'hu' ? ': ' + v.note : ''}.`);
        if (!v.memoryId && !v.label && !v.per100 && Math.round(v.grams) !== 100) lines.push(`${L.per100}: ${Math.round(v.k100)} kcal · ${macroLine({ p: v.p100, c: v.c100, f: v.f100 })}`);
        if (v.alts.length && !ok[k].exact) lines.push(fill(L.alts, v.alts.map(a => a.name).join(', ')));
      } else lines.push(`• ${v.qty} ${v.name}${g}: ${v.kcal} kcal · ${macroLine(v)}`);
      if (v.ref) lines.push(`${v.name}: ${lang === 'hu' ? v.ref : v.mixed ? L.calc : L.label + ' ' + L.vals}.`); else if (v.mixed) lines.push(`${v.name}: ${L.recipe}.`); else if (v.approx) lines.push(`${v.name}: ${L.approx}.`);
      (ok[k].ignored || []).forEach(w => lines.push(fill(L.ign, w)));
    });
    if (views.length > 1) lines.push(`**${L.total}: ${Math.round(tot.kcal)} kcal** · ${fmt(tot.g, lang)} g · ${macroLine(tot)}`);
    unknown.forEach(i => lines.push(fill(L.nf, '„' + i.text + '”')));
    need.forEach(i => lines.push(fill(i.why === 'volume' ? L.needVol : L.need, i.entry ? nameOf(i.entry, lang) : i.text)));
    const srcs = new Set(ok.map(i => { const m = i.entry && i.entry.h >= 0 ? index().F.meta?.[i.entry.h] : null; return i.memoryId ? (lang==='hu'?'Mentett saját adag':'Saved personal portion') : i.label ? L.label : m && (m.ref || m.mixed) ? L.srcLex : L.srcUsda; }));
    lines.push(fill(L.src, [...srcs].join(', ')));
    return { chat, items: views, total: { ...tot, g: r1(tot.g), p: r1(tot.p), c: r1(tot.c), f: r1(tot.f) }, unknown: unknown.map(i => i.text), need: need.map(i => i.entry ? nameOf(i.entry, lang) : i.text), intent: [...intent], text: lines.join('\n') };
  }
  /* the food words of a query, for the plain search list ("1 zsemle hány kalória" -> "zsemle") */
  function foodWords(text) { return parse(text).items.map(i => i.text).filter(Boolean).join(' ') || ''; }
  function hits(text, limit = 6) {                                  // ranked database entries for a search box
    const words = scan(text).segs.flatMap(s => s.food); if (!words.length) return [];
    const res = resolve(words); if (!res) return [];
    const X = index(); return [res.e, ...res.alts].slice(0, limit).map(e => ({ h: X.entries[e].h, i: X.entries[e].i, exact: e === res.e && res.exact }));
  }
  function units(h, i) {                                            // named portions of one food for quick-pick chips
    const X = index(), en = { h, i }, out = [], seen = new Set(), meta = h >= 0 ? X.F.meta?.[h] : null, hu = h >= 0 ? X.F.hu[h] : null;
    const list = [...new Set([hu && hu[3] ? huPortUnit(strip(hu[3])) : '', ...Object.keys(meta?.u || {}), 'db', 'szelet', 'adag', 'ek', 'tk'].filter(Boolean))];
    list.forEach(u => {
      const g = unitGrams(en, u, ''); if (!g || seen.has(Math.round(g.g))) return; seen.add(Math.round(g.g)); out.push({ u, g: r1(g.g), typ: !!g.typ, note: g.note || '' });
    });
    return out;
  }
  return { foodMemory:true,productLabels:true,install, parse, answer, resolve: w => resolve(tokens(w)), hits, units, view, foodWords, nameOf, unitLabel: (u, lang, n = 1) => { const l = UL[lang === 'hu' ? 'hu' : 'en'][u]; return Array.isArray(l) ? l[n === 1 ? 0 : 1] : l || u; }, _norm: prep };
})();
