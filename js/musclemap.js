/* Body map, front and back: an anatomical line drawing with every muscle as its own shape (data/body.js).
   The muscles an exercise works are filled: level 1 = primary, 2 = secondary. */
window.MuscleMap = (function () {
  const B = window.BODY || { front: { outline: [], parts: {} }, back: { outline: [], parts: {} } };
  /* region name used by the app -> shape group in the drawing (and which shapes of that group, when it is split) */
  const FRONT = { neck: ['neck'], traps: ['trapezius'], delt_front: ['deltoids'], pec: ['chest'], biceps: ['biceps'], triceps_f: ['triceps'], forearm: ['forearm'], abs: ['abs'], obliques: ['obliques'], quads: ['quadriceps'], adductors: ['adductors'], calves_f: ['calves'] };
  const BACK = { neck: ['neck'], traps: ['trapezius'], delt_rear: ['deltoids'], midback: ['upper-back', [0, 2, 3, 4]], lats: ['upper-back', [1, 5]], triceps: ['triceps'], forearm_ext: ['forearm'], erectors: ['lower-back'], glutes: ['gluteal'], hams: ['hamstring'], adductors_b: ['adductors'], calves: ['calves'] };
  function side(data, map, hl) {
    const lvl = {};
    Object.keys(map).forEach(k => { const v = hl[k]; if (v !== 1 && v !== 2) return; const slug = map[k][0], idx = map[k][1];
      (data.parts[slug] || []).forEach((p, i) => { if (idx && idx.indexOf(i) < 0) return; const key = slug + '#' + i; if (!lvl[key] || v < lvl[key]) lvl[key] = v; }); });
    let s = '';
    Object.keys(data.parts).forEach(slug => data.parts[slug].forEach((p, i) => { const l = lvl[slug + '#' + i]; s += `<path class="${l === 1 ? 'mm-hi' : l === 2 ? 'mm-lo' : slug === 'hair' ? 'mm-hair' : 'mm-m'}" d="${p}"/>`; }));
    return s + data.outline.map(p => `<path class="mm-out" d="${p}"/>`).join('');
  }
  // dataset muscle name -> [front regions, back regions]
  const GEN = {
    'abdominals': [['abs'], []], 'abductors': [['abductors'], ['glutes']], 'adductors': [['adductors'], ['adductors_b']],
    'biceps': [['biceps'], []], 'calves': [['calves_f'], ['calves']], 'chest': [['pec'], []], 'forearms': [['forearm'], ['forearm_ext']],
    'glutes': [[], ['glutes']], 'hamstrings': [[], ['hams']], 'lats': [[], ['lats']], 'lower back': [[], ['erectors']],
    'middle back': [[], ['midback']], 'neck': [['neck'], ['neck']], 'quadriceps': [['quads'], []],
    'shoulders': [['delt_front'], ['delt_rear']], 'traps': [['traps'], ['traps']], 'triceps': [['triceps_f'], ['triceps']]
  };
  function fromLists(primary, secondary) {
    const f = {}, b = {};
    const put = (list, lvl) => (list || []).forEach(m => { const g = GEN[m]; if (!g) return;
      g[0].forEach(k => { if (!f[k]) f[k] = lvl; }); g[1].forEach(k => { if (!b[k]) b[k] = lvl; }); });
    put(primary, 1); put(secondary, 2);
    return [f, b];
  }
  const txt = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function originalSide(data, map, hl, offset, label) {
    const level = {};
    Object.keys(map).forEach(k => {
      const v = hl[k]; if (v !== 1 && v !== 2) return;
      const [slug, indices] = map[k];
      (data.parts[slug] || []).forEach((_, i) => { if (indices && !indices.includes(i)) return; const key = slug + '#' + i; if (!level[key] || v < level[key]) level[key] = v; });
    });
    // Lateral hip regions have their own shapes in the original front illustration.
    if (hl.abductors) (data.parts.abductors || []).forEach((_, i) => { level['abductors#' + i] = hl.abductors; });
    let content = `<path class="body-silhouette" d="${data.outline}"/>`;
    Object.keys(data.parts).forEach(slug => data.parts[slug].forEach((part, i) => {
      const l = level[slug + '#' + i];
      content += `<path class="body-region${l === 1 ? ' body-primary' : l === 2 ? ' body-secondary' : ''}" d="${part.d}"${part.mirror ? ' transform="translate(240 0) scale(-1 1)"' : ''}/>`;
    }));
    content += data.face.map(d => `<path class="body-face" d="${d}"/>`).join('');
    return `<g transform="translate(${offset} 0)">${content}<text class="body-label" x="120" y="512" text-anchor="middle">${txt(label)}</text></g>`;
  }
  function svg(f, b, lblFront, lblBack, label) {
    const own = window.OTISPORT_BODY;
    if (own) return `<svg class="otisport-anatomy" viewBox="0 0 500 524" role="img" aria-label="${txt(label || [lblFront, lblBack].join(' · '))}"><title>${txt(label || [lblFront, lblBack].join(' · '))}</title>${originalSide(own.front, FRONT, f || {}, 0, lblFront)}${originalSide(own.back, BACK, b || {}, 260, lblBack)}</svg>`;
    return `<svg viewBox="0 70 1448 1400" role="img" aria-label="${txt(label || 'muscle map')}">${side(B.front, FRONT, f || {})}${side(B.back, BACK, b || {})}` +
      `<text class="mm-lbl" x="362" y="1452" text-anchor="middle">${txt(lblFront)}</text><text class="mm-lbl" x="1086" y="1452" text-anchor="middle">${txt(lblBack)}</text></svg>`;
  }
  return { svg, fromLists };
})();
