/* Small single-series charts. One accent hue for data, text in text colours, hairline grid. */
window.Charts = (function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function nice(min, max) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min, step = Math.pow(10, Math.floor(Math.log10(span / 3)));
    const s = [1, 2, 2.5, 5, 10].map(m => m * step).find(m => span / m <= 4) || step * 10;
    return { lo: Math.floor(min / s) * s, hi: Math.ceil(max / s) * s, step: s };
  }
  /* points: [{x: label, y: number}] */
  function line(points, opt) {
    opt = opt || {};
    if (!points.length) return '';
    const W = 320, H = 150, L = 36, R = 44, T = 12, B = 22;
    const ys = points.map(p => p.y), n = nice(Math.min.apply(0, ys), Math.max.apply(0, ys));
    const X = i => points.length === 1 ? (L + (W - L - R) / 2) : L + i * (W - L - R) / (points.length - 1);
    const Y = v => T + (H - T - B) * (1 - (v - n.lo) / (n.hi - n.lo));
    let g = '';
    for (let v = n.lo; v <= n.hi + 1e-9; v += n.step)
      g += `<line class="ch-grid" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ch-tick" x="${L - 6}" y="${Y(v) + 3.5}" text-anchor="end">${+v.toFixed(1)}</text>`;
    const pts = points.map((p, i) => X(i).toFixed(1) + ',' + Y(p.y).toFixed(1)).join(' ');
    const last = points[points.length - 1], lx = X(points.length - 1), ly = Y(last.y);
    const hits = points.map((p, i) => `<circle class="ch-hit" cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="14" data-i="${i}" tabindex="0"><title>${esc(p.x)}: ${esc(p.y)}${esc(opt.unit || '')}</title></circle>`).join('');
    const dots = points.length <= 16 ? points.map((p, i) => `<circle class="ch-pt" cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.5"/>`).join('') : '';
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" data-chart='${esc(JSON.stringify(points.map(p => [p.x, p.y])))}' data-unit="${esc(opt.unit || '')}">
      ${g}<polyline class="ch-line" points="${pts}"/>${dots}
      <circle class="ch-end" cx="${lx}" cy="${ly}" r="5"/>
      <text class="ch-val" x="${lx + 9}" y="${ly + 4}">${esc(last.y)}</text>
      <text class="ch-tick" x="${L}" y="${H - 5}">${esc(points[0].x)}</text>
      ${points.length > 1 ? `<text class="ch-tick" x="${W - R}" y="${H - 5}" text-anchor="end">${esc(last.x)}</text>` : ''}
      <g class="ch-hits">${hits}</g><g class="ch-tip" hidden><line class="ch-cross" y1="${T}" y2="${H - B}"/><rect class="ch-tipbox" rx="5" height="22"/><text class="ch-tiptext"></text></g></svg>`;
  }
  /* horizontal bars with an optional target band; rows: [{label, value}] */
  function bars(rows, opt) {
    opt = opt || {};
    const max = Math.max(opt.max || 0, ...rows.map(r => r.value), 1);
    return '<div class="hbars">' + rows.map(r => {
      const pct = Math.min(100, r.value / max * 100);
      const band = opt.band ? `<i class="hb-band" style="left:${opt.band[0] / max * 100}%;width:${(Math.min(opt.band[1], max) - opt.band[0]) / max * 100}%"></i>` : '';
      return `<div class="hb-row"><span class="hb-l">${esc(r.label)}</span><span class="hb-t">${band}<i class="hb-f" style="width:${pct}%"></i></span><span class="hb-v">${esc(r.text != null ? r.text : r.value)}</span></div>`;
    }).join('') + '</div>';
  }
  function meter(value, target, cls) {
    const pct = target > 0 ? Math.min(100, value / target * 100) : 0;
    return `<span class="meter ${cls || ''}${target > 0 && value > target * 1.05 ? ' over' : ''}"><i style="width:${pct}%"></i></span>`;
  }
  /* tap or hover a point to read its value */
  function bind(root) {
    root.addEventListener('pointerdown', show); root.addEventListener('pointermove', show); root.addEventListener('focusin', show);
    function show(e) {
      const c = e.target.closest && e.target.closest('.ch-hit'); if (!c) return;
      const svg = c.closest('svg'), data = JSON.parse(svg.dataset.chart), d = data[+c.dataset.i], tip = svg.querySelector('.ch-tip');
      const x = +c.getAttribute('cx'), txt = tip.querySelector('text'), box = tip.querySelector('rect'), cross = tip.querySelector('line');
      txt.textContent = d[1] + svg.dataset.unit + ' · ' + d[0];
      tip.removeAttribute('hidden');
      const w = txt.getComputedTextLength() + 14, bx = Math.max(2, Math.min(320 - w - 2, x - w / 2));
      box.setAttribute('x', bx); box.setAttribute('y', 0); box.setAttribute('width', w);
      txt.setAttribute('x', bx + 7); txt.setAttribute('y', 15);
      cross.setAttribute('x1', x); cross.setAttribute('x2', x);
    }
  }
  return { line, bars, meter, bind };
})();
