/* Body map, front and back. Each muscle is its own shape; level 1 = primary, 2 = secondary. */
window.MuscleMap = (function () {
  const P = pts => pts.map(p => Math.round(p[0]) + ',' + Math.round(p[1])).join(' ');
  function cap(a, b, w1, w2, cls) {
    const dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / ln, ny = dx / ln;
    const pts = [[a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2],
                 [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2]];
    return `<polygon class="${cls}" points="${P(pts)}"/><circle class="${cls}" cx="${a[0]}" cy="${a[1]}" r="${w1 / 2}"/><circle class="${cls}" cx="${b[0]}" cy="${b[1]}" r="${w2 / 2}"/>`;
  }
  const pol = (pts, cls) => `<polygon class="${cls}" points="${P(pts)}"/>`;
  const ell = (c, rx, ry, cls) => `<ellipse class="${cls}" cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${ry}"/>`;
  function body(cx) {
    let s = `<circle class="mm-sil" cx="${cx}" cy="26" r="14"/>`;
    s += pol([[cx - 6, 38], [cx + 6, 38], [cx + 7, 46], [cx - 7, 46]], 'mm-sil');
    s += pol([[cx - 30, 48], [cx + 30, 48], [cx + 21, 98], [cx + 23, 120], [cx - 23, 120], [cx - 21, 98]], 'mm-sil');
    for (const d of [-1, 1]) {
      s += cap([cx + d * 28, 56], [cx + d * 36, 90], 15, 12, 'mm-sil');
      s += cap([cx + d * 36, 90], [cx + d * 40, 120], 12, 9, 'mm-sil');
      s += ell([cx + d * 42, 128], 6, 8, 'mm-sil');
      s += cap([cx + d * 11, 118], [cx + d * 14, 160], 21, 14, 'mm-sil');
      s += cap([cx + d * 14, 160], [cx + d * 15, 196], 14, 9, 'mm-sil');
      s += pol([[cx + d * 10, 196], [cx + d * 21, 196], [cx + d * 24, 204], [cx + d * 8, 204]], 'mm-sil');
    }
    return s;
  }
  const cls = (hl, k) => hl[k] === 1 ? 'mm-hi' : hl[k] === 2 ? 'mm-lo' : 'mm-m';
  function front(cx, hl) {
    let s = pol([[cx - 5, 39], [cx + 5, 39], [cx + 6, 45], [cx - 6, 45]], cls(hl, 'neck'));
    for (const d of [-1, 1]) {
      s += pol([[cx + d * 3, 46], [cx + d * 9, 44], [cx + d * 26, 50], [cx + d * 8, 54]], cls(hl, 'traps'));
      s += ell([cx + d * 27, 57], 10, 9, cls(hl, 'delt_front'));
      s += pol([[cx + d * 4, 55], [cx + d * 15, 56], [cx + d * 23, 61], [cx + d * 21, 71], [cx + d * 12, 77], [cx + d * 4, 73]], cls(hl, 'pec'));
      s += cap([cx + d * 26, 62], [cx + d * 34, 88], 11, 8, cls(hl, 'biceps'));
      s += cap([cx + d * 35, 92], [cx + d * 39, 116], 10, 7, cls(hl, 'forearm'));
      s += ell([cx + d * 21, 122], 5, 8, cls(hl, 'abductors'));
      s += cap([cx + d * 15, 124], [cx + d * 17, 156], 13, 10, cls(hl, 'quads'));
      s += cap([cx + d * 5, 122], [cx + d * 8, 150], 9, 7, cls(hl, 'adductors'));
      s += pol([[cx + d * 19, 74], [cx + d * 22, 80], [cx + d * 17, 98], [cx + d * 13, 92]], cls(hl, 'obliques'));
    }
    s += pol([[cx - 10, 76], [cx + 10, 76], [cx + 9, 112], [cx - 9, 112]], cls(hl, 'abs'));
    return s;
  }
  function back(cx, hl) {
    let s = pol([[cx - 5, 39], [cx + 5, 39], [cx + 6, 45], [cx - 6, 45]], cls(hl, 'neck'));
    s += pol([[cx - 8, 45], [cx + 8, 45], [cx + 27, 52], [cx + 13, 59], [cx - 13, 59], [cx - 27, 52]], cls(hl, 'traps'));
    s += pol([[cx - 12, 61], [cx + 12, 61], [cx + 10, 80], [cx - 10, 80]], cls(hl, 'midback'));
    for (const d of [-1, 1]) {
      s += ell([cx + d * 27, 57], 10, 9, cls(hl, 'delt_rear'));
      s += pol([[cx + d * 20, 62], [cx + d * 13, 80], [cx + d * 11, 98], [cx + d * 20, 86]], cls(hl, 'lats'));
      s += cap([cx + d * 28, 62], [cx + d * 35, 88], 11, 8, cls(hl, 'triceps'));
      s += cap([cx + d * 36, 92], [cx + d * 39, 116], 10, 7, cls(hl, 'forearm_ext'));
      s += pol([[cx + d * 3, 84], [cx + d * 9, 84], [cx + d * 9, 114], [cx + d * 3, 114]], cls(hl, 'erectors'));
      s += ell([cx + d * 13, 126], 12, 10, cls(hl, 'glutes'));
      s += cap([cx + d * 14, 140], [cx + d * 16, 158], 15, 12, cls(hl, 'hams'));
      s += cap([cx + d * 15, 164], [cx + d * 16, 184], 13, 8, cls(hl, 'calves'));
    }
    return s;
  }
  // dataset muscle name -> [front regions, back regions]
  const GEN = {
    'abdominals': [['abs'], []], 'abductors': [['abductors'], ['glutes']], 'adductors': [['adductors'], []],
    'biceps': [['biceps'], []], 'calves': [[], ['calves']], 'chest': [['pec'], []], 'forearms': [['forearm'], ['forearm_ext']],
    'glutes': [[], ['glutes']], 'hamstrings': [[], ['hams']], 'lats': [[], ['lats']], 'lower back': [[], ['erectors']],
    'middle back': [[], ['midback']], 'neck': [['neck'], ['neck']], 'quadriceps': [['quads'], []],
    'shoulders': [['delt_front'], ['delt_rear']], 'traps': [['traps'], ['traps']], 'triceps': [[], ['triceps']]
  };
  function fromLists(primary, secondary) {
    const f = {}, b = {};
    const put = (list, lvl) => (list || []).forEach(m => { const g = GEN[m]; if (!g) return;
      g[0].forEach(k => { if (!f[k]) f[k] = lvl; }); g[1].forEach(k => { if (!b[k]) b[k] = lvl; }); });
    put(primary, 1); put(secondary, 2);
    return [f, b];
  }
  function svg(f, b, lblFront, lblBack) {
    b = Object.assign({}, b); if (b.traps && !b.midback) b.midback = b.traps;
    return `<svg viewBox="0 0 320 224" role="img" aria-label="muscle map">${body(80)}${front(80, f || {})}${body(240)}${back(240, b)}` +
      `<text class="mm-lbl" x="80" y="220" text-anchor="middle">${lblFront}</text><text class="mm-lbl" x="240" y="220" text-anchor="middle">${lblBack}</text></svg>`;
  }
  return { svg, fromLists };
})();
