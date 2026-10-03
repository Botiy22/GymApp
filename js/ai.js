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
      ' 3) Portion: estimate the weight of each item in grams as eaten (cooked weight for cooked food). Do not round to 50 or 100 out of habit; when torn between two sizes take the middle.' +
      ' 4) Values: give energy and macros PER 100 g of each item as prepared, using typical food-composition-table values.' +
      (o.hint ? ' Extra information from the user (trust it over what you see): "' + String(o.hint).replace(/"/g, "'").slice(0, 300) + '".' : '') +
      (o.notes ? ' ' + o.notes : '') +
      ' If there is no food, return an empty items array and say so in notes.' +
      ' Reply with ONLY a JSON object, no markdown, no code fence, exactly in this shape: ' +
      '{"scene":"one short sentence: what gave you the scale","items":[{"name":"string","en":"string","grams":number,"kcal100":number,"protein100":number,"carbs100":number,"fat100":number}],"confidence":"low|medium|high","notes":"string"}.' +
      ' "name" and "notes" in ' + L + '; "en" is the plain English name worded like a food-composition table entry (for example "Chicken, breast, meat only, cooked, roasted" or "Rice, white, cooked"). Numbers are plain numbers without units.';
  }
  function parse(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('bad-json');
    const o = JSON.parse(t.slice(a, b + 1));
    const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : 0; };
    const cap = (v, hi) => Math.min(hi, num(v));
    return {
      items: (Array.isArray(o.items) ? o.items : []).slice(0, 30).map(i => {
        const g = Math.round(cap(i.grams, 5000)), per = 'kcal100' in i || 'protein100' in i;          // older replies give totals for the portion instead of per 100 g
        const k = g > 0 ? 100 / g : 0;
        const it = { name: String(i.name || '?').slice(0, 80), en: String(i.en || '').slice(0, 120), grams: g,
          k100: per ? cap(i.kcal100, 902) : cap(num(i.kcal) * k, 902), p100: per ? cap(i.protein100, 100) : cap(num(i.protein) * k, 100),
          c100: per ? cap(i.carbs100, 100) : cap(num(i.carbs) * k, 100), f100: per ? cap(i.fat100, 100) : cap(num(i.fat) * k, 100) };
        return total(it);
      }),
      confidence: ['low', 'medium', 'high'].includes(o.confidence) ? o.confidence : 'low',
      notes: String(o.notes || '').slice(0, 400), scene: String(o.scene || '').slice(0, 200)
    };
  }
  /* portion totals from grams and per-100 g values */
  function total(it) { const k = it.grams / 100; it.kcal = Math.round(it.k100 * k); it.p = Math.round(it.p100 * k * 10) / 10; it.c = Math.round(it.c100 * k * 10) / 10; it.f = Math.round(it.f100 * k * 10) / 10; return it; }
  /* one request to the API; errors come back with a short code the app can translate */
  async function post(apiKey, payload) {
    let res;
    try {
      res = await fetch(URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) { const er = new Error('network'); er.code = 'network'; throw er; }
    let body = null; try { body = await res.json(); } catch (e) {}
    if (!res.ok) {
      const er = new Error((body && body.error && body.error.message) || ('HTTP ' + res.status));
      er.code = res.status === 401 ? 'auth' : res.status === 429 ? 'rate' : res.status === 404 ? 'model' : 'api';
      throw er;
    }
    return ((body && body.content) || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  }
  async function call(apiKey, model, content) {
    const txt = await post(apiKey, { model, max_tokens: 1500, messages: [{ role: 'user', content }] });
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
        ok({ dataUrl: d, base64: d.split(',')[1] });
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
    shrink, parse, check,
    total,
    /* coach chat: system = who the coach is plus the user's data, msgs = [{ role: 'user' | 'assistant', content }] */
    chat: async (key, model, system, msgs) => {
      const m = msgs.slice(-12); while (m.length && m[0].role === 'assistant') m.shift();                 // a conversation always starts with the user
      const txt = (await post(key, { model, max_tokens: 900, system: String(system).slice(0, 12000), messages: m.map(x => ({ role: x.role === 'assistant' ? 'assistant' : 'user', content: String(x.content).slice(0, 4000) })) })).trim();
      if (!txt) { const er = new Error('empty'); er.code = 'parse'; throw er; }
      return txt.slice(0, 6000);
    },
    /* o: { images: [base64 jpeg…], text, lang, hint, notes } */
    analyze: (key, model, o) => {
      const imgs = (o.images || []).slice(0, 2);
      return call(key, model, imgs.map(b => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b } }))
        .concat([{ type: 'text', text: prompt({ lang: o.lang, hint: o.hint, notes: o.notes, images: imgs.length }) + (imgs.length ? '' : '\n\nMeal: ' + String(o.text || '').slice(0, 1500)) }]));
    }
  };
})();
