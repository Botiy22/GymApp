/* Food estimation through the Claude API, called straight from the phone with the user's own key.
   For a multi-user release this call must move behind your own server so the key is never on the device. */
window.FoodAI = (function () {
  const URL = 'https://api.anthropic.com/v1/messages';
  function prompt(lang, hint, hasImage) {
    const L = lang === 'hu' ? 'Hungarian' : 'English';
    return (hasImage
      ? 'You are a nutrition estimator. Look at the photo of a meal and estimate what is on the plate.'
      : 'You are a nutrition estimator. Estimate the nutrition of the meal described below.') +
      ' Split it into separate food items. For each item estimate the portion in grams and its calories, protein, carbohydrate and fat for that portion.' +
      ' Account for likely cooking fat, sauces and dressings even when they are not clearly visible, and say so in the notes.' +
      (hint ? ' Extra information from the user: "' + hint.replace(/"/g, "'") + '".' : '') +
      ' If there is no food, return an empty items array and explain in notes.' +
      ' Reply with ONLY a JSON object, no markdown, no code fence, exactly in this shape: ' +
      '{"items":[{"name":"string","grams":number,"kcal":number,"protein":number,"carbs":number,"fat":number}],"confidence":"low|medium|high","notes":"string"}.' +
      ' Write name and notes in ' + L + '. Numbers must be plain numbers without units.';
  }
  function parse(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('bad-json');
    const o = JSON.parse(t.slice(a, b + 1));
    const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : 0; };
    return {
      items: (Array.isArray(o.items) ? o.items : []).map(i => ({
        name: String(i.name || '?').slice(0, 80), grams: Math.round(num(i.grams)), kcal: Math.round(num(i.kcal)),
        p: num(i.protein), c: num(i.carbs), f: num(i.fat)
      })),
      confidence: ['low', 'medium', 'high'].includes(o.confidence) ? o.confidence : 'low',
      notes: String(o.notes || '').slice(0, 400)
    };
  }
  async function call(apiKey, model, content) {
    let res;
    try {
      res = await fetch(URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content }] })
      });
    } catch (e) { const er = new Error('network'); er.code = 'network'; throw er; }
    let body = null; try { body = await res.json(); } catch (e) {}
    if (!res.ok) {
      const er = new Error((body && body.error && body.error.message) || ('HTTP ' + res.status));
      er.code = res.status === 401 ? 'auth' : res.status === 429 ? 'rate' : res.status === 404 ? 'model' : 'api';
      throw er;
    }
    const txt = ((body && body.content) || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
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
        const d = c.toDataURL('image/jpeg', 0.82);
        ok({ dataUrl: d, base64: d.split(',')[1] });
      };
      img.onerror = () => fail(new Error('image'));
      img.src = url;
    });
  }
  return {
    shrink, parse,
    fromPhoto: (key, model, base64, lang, hint) => call(key, model, [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
      { type: 'text', text: prompt(lang, hint, true) }]),
    fromText: (key, model, text, lang) => call(key, model, [{ type: 'text', text: prompt(lang, '', false) + '\n\nMeal: ' + text }])
  };
})();
