/* Food estimation through the Claude API, called straight from the phone with the user's own key.
   For a multi-user release this call must move behind your own server so the key is never on the device. */
window.FoodAI = (function () {
  const URL = 'https://api.anthropic.com/v1/messages';
  /* The instruction makes the model reason in a fixed order (scale -> items -> grams -> values per 100 g) before it writes numbers,
     and asks for per-100 g values so the app can cross-check them against its own food database. */
  function prompt(o) {
    const L = o.lang === 'hu' ? 'Hungarian' : 'English', n = o.images || 0;
    return 'You are a careful nutrition estimator. ' + (n ? 'Estimate the meal shown in the ' + (n > 1 ? n + ' photos (the same meal from different angles: use all of them).' : 'photo.') : 'Estimate the meal described below.') +
      ' Work in this order. 1) Scale: find something of known size (a dinner plate is usually 26-28 cm, a fork about 19 cm, a tablespoon, a hand, a can, standard packaging) and judge volumes from it.' +
      ' 2) Items: list every distinct food and drink. Cooking fat, sauces, dressings, butter and sugar in drinks count even when barely visible: list them as their own items when they add more than about 30 kcal.' +
      ' 3) Portion: estimate the weight of each item in grams as eaten (cooked weight for cooked food). Work it out, do not guess: for countable foods (eggs, slices, nuggets, dumplings, cookies) count the pieces and multiply by a typical piece weight; for everything else judge the area it covers and its height against the scale, turn that into a volume and then into grams. Write that working briefly in "basis" (for example "3 pieces x 55 g" or "a third of a 27 cm plate, about 2 cm deep"). Do not round to 50 or 100 out of habit. Also give the smallest and largest weight that would still be plausible as "gmin" and "gmax".' +
      ' 4) Values: give energy and macros PER 100 g of each item as prepared, using typical food-composition-table values.' +
      ' Important: A brand or shaker logo does not identify a product, serving weight, protein amount or milk volume. Separate powder and milk. Never substitute a generic shake for a named product. Ask for exact variant, label serving size and milk volume/fat when missing; never invent branded nutrition. User-stated label values override generic values. For photos, packaging net weight is NOT the consumed weight; unreadable labels are estimates. Do not infer invisible oil as a fact: explicitly identify assumptions. ' +
      ' 5) Labels: if a nutrition table or the packaging of a product is readable, do not estimate that product: copy its values per 100 g (or per 100 ml) exactly as printed, use the printed product name, set "src" to "label", and use the consumed amount supplied by the user; if unknown ask, never assume the whole package was eaten. Convert per-100-ml values to per-100-g using a documented density, or ask for a gram weight. Do not confuse per-serving values with per-100-g values. Everything else has "src":"estimate".' +
      ' 6) One question: if a single missing fact would change the total energy by more than about 15% (how it was cooked and in how much fat, sugar in a drink, lean or fatty cut, how much of the plate was eaten), put ONE short question in "question" with 2 to 4 short answers to choose from; otherwise "question" is null. Do not ask what the extra information already answers.' +
      (o.hint ? ' Extra information from the user (trust it over what you see): "' + String(o.hint).replace(/"/g, "'").slice(0, 600) + '".' : '') +
      (o.notes ? ' ' + o.notes : '') +
      ' If there is no food, return an empty items array and say so in notes.' +
      ' Reply with ONLY a JSON object, no markdown, no code fence, exactly in this shape: ' +
      '{"scene":"one short sentence: what gave you the scale","items":[{"name":"string","en":"string","src":"estimate|label","basis":"string","grams":number,"gmin":number,"gmax":number,"kcal100":number,"protein100":number,"carbs100":number,"fat100":number}],"question":null or {"text":"string","options":["string"]},"confidence":"low|medium|high","notes":"string"}.' +
      ' "name", "basis", "notes" and the question with its answers in ' + L + '; "en" is the plain English name worded like a food-composition table entry (for example "Chicken, breast, meat only, cooked, roasted" or "Rice, white, cooked"). Numbers are plain numbers without units.';
  }
  const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  // Deliberately conservative: every component must have an explicit quantity and an exact identity.
  // Unknown ingredients never disappear from a partially matched meal.
  /* The offline foundation (js/food-query.js): "2 zsemle, 10 dkg sonka, 1 pohár tej" is calculated from the database.
     Strict: every part must be understood with an amount (a typical piece weight counts, a guessed serving does not). */
  function fromQuery(i, lang) {
    const FQ = window.FoodQuery, v = FQ.view(i, lang), hu = lang === 'hu';
    return total({ name: v.name, en: i.label ? '' : v.usda, grams: Math.round(i.grams * 10) / 10, k100: i.k100, p100: i.p100, c100: i.c100, f100: i.f100, label: !!i.label, db: i.label ? undefined : v.usda,
      basis: i.label ? String(i.text || '') : v.qty + (v.typ ? ' ≈ ' : ' = ') + Math.round(i.grams * 10) / 10 + ' g' + (v.typ ? (hu ? ' (tipikus' : ' (typical') + (v.note && hu ? ': ' + v.note : '') + ')' : ''), gmin: 0, gmax: 0 });
  }
  const localNote = (lang, typ) => (lang === 'hu' ? 'Adatbázisból számolva a megadott mennyiséggel.' : 'Calculated from the food database using your quantities.') + (typ ? (lang === 'hu' ? ' A ≈ darabsúly tipikus érték: ha lemérted, írd át a grammot.' : ' A ≈ piece weight is typical: if you weighed it, change the grams.') : '');
  function local(o) {
    if ((o.images || []).length || o.hint) return null;
    if (window.FoodQuery && window.FOODS) {
      const r = window.FoodQuery.parse(String(o.text || ''), { strict: true });
      if (!r.items.length || r.items.length > 20 || r.items.some(i => i.status !== 'ok')) return null;
      return { items: r.items.map(i => fromQuery(i, o.lang)), confidence: 'high', notes: localNote(o.lang, r.items.some(i => i.typ)), scene: '', question: null, local: true };
    }
    const text = String(o.text || '').trim().replace(/^(?:I (?:had|ate|drank)|ettem|ittam)\s+/i,''), db = window.FOODS;
    if (!text || !db) return null;
    const aliases = {banana:'Bananas, raw',banan:'Bananas, raw'};
    const parts = text.split(/;|\n|\s+and\s+|\s+es\s+|\s+és\s+|\s*\+\s*/i).filter(x=>x.trim());
    if (!parts.length || parts.length > 20) return null;
    const items=[];
    for (const part of parts) {
      const m=part.trim().match(/^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|dl|l)\s+(.+)$/i);
      if (!m) return null;
      const amount=Number(m[1].replace(',','.')),unit=m[2].toLowerCase(),name=normalize(m[3]);
      if (!(amount>0)) return null;
      // Explicit user-supplied portion label: never infer a brand's serving from its name.
      const label=m[3].match(/^(.+?)\s*\((\d+(?:[.,]\d+)?)\s*kcal,\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:protein|fehérje),\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:carbs|szénhidrát),\s*(\d+(?:[.,]\d+)?)\s*g\s*(?:fat|zsír)\)$/i);
      if(label && ['g','kg'].includes(unit)) {
        const grams=amount*(unit==='kg'?1000:1), vals=label.slice(2).map(v=>Number(v.replace(',','.')));
        if(grams>5000||vals.slice(1).reduce((a,b)=>a+b,0)>grams*1.05||vals[0]>grams*9.02)return null;
        items.push(total({name:label[1],en:'',grams,k100:vals[0]*100/grams,p100:vals[1]*100/grams,c100:vals[2]*100/grams,f100:vals[3]*100/grams,label:true,basis:part.trim(),gmin:0,gmax:0}));continue;
      }
      let matches=db.list.filter(r=>normalize(r[0])===name||r[0]===aliases[name]);
      if (!matches.length) matches=(db.hu||[]).filter(h=>normalize(h[0])===name).map(h=>db.list[h[1]]);
      if (matches.length!==1) return null;
      const row=matches[0]; let grams=amount*(unit==='kg'?1000:1);
      if (!['g','kg'].includes(unit)) {
        const volume=window.FoodVolume?.describe(row,(db.hu||[]).find(h=>normalize(h[0])===name));
        if (!(volume?.gramsPerDl>0)) return null;
        grams=amount*({ml:.01,dl:1,l:10}[unit])*volume.gramsPerDl;
      }
      if (grams>5000) return null;
      items.push(total({name:m[3].trim(),en:row[0],grams:Math.round(grams*10)/10,k100:row[1],p100:row[2],c100:row[3],f100:row[4],db:row[0],basis:part.trim(),label:false,gmin:0,gmax:0}));
    }
    return {items,confidence:'high',notes:o.lang==='hu'?'Adatbázisból számolva a megadott mennyiséggel.':'Calculated from the food database using your quantities.',scene:'',question:null,local:true};
  }
  function clarification(o) {
    const hu=o.lang==='hu';
    return {items:[],confidence:'low',local:true,needsDetails:true,notes:hu?'Add meg a pontos terméket, az adag grammját és a címke adagonkénti tápértékeit. Tejnél a mennyiség és a zsírtartalom is kell. A shaker mérete nem az elfogyasztott mennyiség.':'Enter the exact product, serving weight and nutrition per serving from its label. Include the milk quantity and fat percentage. Shaker capacity is not the amount consumed.',scene:'',question:null};
  }
  function parse(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('bad-json');
    const o = JSON.parse(t.slice(a, b + 1));
    if (!o || !Array.isArray(o.items)) throw new Error('missing items');
    const num = v => { if (v === null || v === undefined || String(v).trim() === '') throw new Error('missing nutrition'); const n = Number(String(v).replace(',', '.')); if (!Number.isFinite(n) || n < 0) throw new Error('invalid nutrition'); return Math.round(n * 10) / 10; };
    const cap = (v, hi) => {const n=num(v);if(n>hi)throw new Error('value out of range');return n;};
    return {
      items: (Array.isArray(o.items) ? o.items : []).slice(0, 30).map(i => {
        const g = cap(i.grams, 5000), per = 'kcal100' in i || 'protein100' in i;          // older replies give totals for the portion instead of per 100 g
        const k = g > 0 ? 100 / g : 0;
        const lo = Math.round(cap(i.gmin ?? 0, 5000)), hi = Math.round(cap(i.gmax ?? 0, 5000)), okRange = lo > 0 && hi > lo && lo <= g && g <= hi && hi <= g * 4;
        const it = { name: String(i.name || '?').slice(0, 80), en: String(i.en || '').slice(0, 120), grams: g, label: i.src === 'label', basis: String(i.basis || '').slice(0, 140), gmin: okRange ? lo : 0, gmax: okRange ? hi : 0,
          k100: per ? cap(i.kcal100, 902) : cap(num(i.kcal) * k, 902), p100: per ? cap(i.protein100, 100) : cap(num(i.protein) * k, 100),
          c100: per ? cap(i.carbs100, 100) : cap(num(i.carbs) * k, 100), f100: per ? cap(i.fat100, 100) : cap(num(i.fat) * k, 100) };
        if (!(g > 0) || it.p100 + it.c100 + it.f100 > 105) throw new Error('invalid composition');
        return total(it);
      }),
      confidence: ['low', 'medium', 'high'].includes(o.confidence) ? o.confidence : 'low',
      notes: String(o.notes || '').slice(0, 400), scene: String(o.scene || '').slice(0, 200),
      question: (q => { const opts = q && Array.isArray(q.options) ? q.options.map(x => String(x || '').trim().slice(0, 40)).filter(Boolean).slice(0, 4) : []; const tx = q ? String(q.text || '').trim().slice(0, 160) : ''; return tx && opts.length >= 2 ? { text: tx, options: opts } : null; })(o.question && typeof o.question === 'object' ? o.question : null)
    };
  }
  /* portion totals from grams and per-100 g values */
  function total(it) { const k = it.grams / 100; it.kcal = Math.round(it.k100 * k); it.p = Math.round(it.p100 * k * 10) / 10; it.c = Math.round(it.c100 * k * 10) / 10; it.f = Math.round(it.f100 * k * 10) / 10; return it; }
  /* one request to the API; errors come back with a short code the app can translate */
  async function post(apiKey, payload) {
    let res; const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),45000);
    try {
      res = await fetch(URL, {
        method: 'POST', signal: controller.signal,
        headers: {
          'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) { const er = new Error('network'); er.code = 'network'; throw er; } finally { clearTimeout(timer); }
    let body = null; try { body = await res.json(); } catch (e) {}
    if (!res.ok) {
      const er = new Error((body && body.error && body.error.message) || ('HTTP ' + res.status));
      er.code = res.status === 401 ? 'auth' : res.status === 429 ? 'rate' : res.status === 404 ? 'model' : 'api';
      throw er;
    }
    return ((body && body.content) || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  }
  async function call(apiKey, model, content) {
    const txt = await post(apiKey, { model, max_tokens: 2000, messages: [{ role: 'user', content }] });
    try { return parse(txt); } catch (e) { const er = new Error('bad-json'); er.code = 'parse'; throw er; }
  }
  /* Downscale on the phone before sending: smaller upload, lower cost, and well inside the API's image limits. */
  function shrink(file, max) {
    return new Promise((ok, fail) => {
      const img = new Image(), url = (window.URL || window.webkitURL).createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        (window.URL || window.webkitURL).revokeObjectURL(url);
        const d = c.toDataURL('image/jpeg', 0.86);
        let luma = 128;                                                               // how bright the picture is on average (0-255): a dark photo is the most common reason for a poor estimate
        try { const s2 = document.createElement('canvas'); s2.width = s2.height = 24; const x2 = s2.getContext('2d'); x2.drawImage(c, 0, 0, 24, 24); const px = x2.getImageData(0, 0, 24, 24).data; let sum = 0; for (let i = 0; i < px.length; i += 4) sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; luma = sum / (px.length / 4); } catch (e) {}
        ok({ dataUrl: d, base64: d.split(',')[1], luma, side: Math.max(img.naturalWidth, img.naturalHeight) });
      };
      img.onerror = () => fail(new Error('image'));
      img.src = url;
    });
  }
  /* Ask the API whether it accepts this key. Listing models is free: no tokens are used.
     'ok' = accepted, 'bad' = rejected, 'offline' = could not reach the service, 'unknown' = some other answer. */
  async function check(apiKey) {
    const ctl = window.AbortController ? new AbortController() : null, timer = ctl ? setTimeout(() => ctl.abort(), 12000) : 0;
    try {
      const res = await fetch('https://api.anthropic.com/v1/models?limit=1', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        signal: ctl ? ctl.signal : undefined
      });
      return res.ok ? 'ok' : res.status === 401 ? 'bad' : 'unknown';
    } catch (e) { return 'offline'; } finally { clearTimeout(timer); }
  }
  return {
    shrink, parse, check, local,
    total,
    /* coach chat: system = who the coach is plus the user's data, msgs = [{ role: 'user' | 'assistant', content }] */
    chat: async (key, model, system, msgs) => {
      const m = msgs.slice(-12); while (m.length && m[0].role === 'assistant') m.shift();                 // a conversation always starts with the user
      const txt = (await post(key, { model, max_tokens: 900, system: String(system).slice(0, 12000), messages: m.map(x => ({ role: x.role === 'assistant' ? 'assistant' : 'user', content: String(x.content).slice(0, 4000) })) })).trim();
      if (!txt) { const er = new Error('empty'); er.code = 'parse'; throw er; }
      return txt.slice(0, 6000);
    },
    /* o: { images: [base64 jpeg…], text, lang, hint, notes } */
    analyze: async (key, model, o) => {
      const exact=local(o); if(exact)return exact;
      if (!(o.images||[]).length && !o.hint && /biotech|protein.*shake|feherje|fehérje|whey|shaker/i.test(o.text||'')) return clarification(o);
      if (!key) {
        const hu = o.lang === 'hu', r = window.FoodQuery && !(o.images || []).length ? window.FoodQuery.parse([o.text, o.hint].filter(Boolean).join(', '), { strict: true }) : null;
        const ok = r ? r.items.filter(i => i.status === 'ok') : [], rest = r ? r.items.filter(i => i.status !== 'ok') : [];
        if (ok.length) return { items: ok.map(i => fromQuery(i, o.lang)), confidence: rest.length ? 'low' : 'high', local: true, scene: '', question: null,   // what was understood, and plainly what was not
          notes: localNote(o.lang, ok.some(i => i.typ)) + (rest.length ? (hu ? ' Ezt nem tudtam AI nélkül kiszámolni, add hozzá külön: ' : ' Not calculated without AI, add it separately: ') + rest.map(i => '„' + (i.text || i.entry && window.FoodQuery.nameOf(i.entry, o.lang) || '?') + '”').join(', ') + '.' : '') };
        return {...clarification(o),notes:hu?'Ezt nem találtam az adatbázisban. Írd így: „2 zsemle, 10 dkg sonka, 1 pohár tej”, vagy keresd meg az ételt a Keresésben. Összetett ételhez vagy fotóhoz AI-kulcs kell (Beállítások).':'I could not find this in the food database. Try "2 bread rolls, 100 g ham, 1 glass of milk" or use Search. Complex meals and photos need an AI key (Settings).'};
      }
      const imgs = (o.images || []).slice(0, 2);
      return call(key, model, imgs.map(b => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b } }))
        .concat([{ type: 'text', text: prompt({ lang: o.lang, hint: o.hint, notes: o.notes, images: imgs.length }) + (imgs.length ? '' : '\n\nMeal: ' + String(o.text || '').slice(0, 1500)) }]));
    }
  };
})();
