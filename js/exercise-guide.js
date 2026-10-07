/* Stable guide schema; original descriptions remain intact for backup and future review. */
window.ExerciseGuide = (() => {
  function concise(lines) {
    const useful = (lines || []).map(s => String(s).replace(/\s+/g, ' ').trim()).filter(s => s && !/^(repeat|ismételd|this will be your starting|ez a kiinduló)/i.test(s));
    const picked = useful.length <= 3 ? useful : [useful[0], useful[Math.floor(useful.length / 2)], useful[useful.length - 1]];
    return picked.map(s => (s.match(/[^.!?]+[.!?]+/g) || [s])[0].trim());
  }
  function ready(id) {
    const g = (window.EXERCISE_GUIDES || {})[id];
    return !!(g && g.board && g.reviewed && ['hu', 'en'].every(lang => g.steps && g.steps[lang] && g.steps[lang].length === 3 && g.steps[lang].every(s => typeof s === 'string' && s.trim())));
  }
  function get(id, e, lang, variant) {
    const entry = (window.EXERCISE_GUIDES || {})[id];
    const g = variant && entry && entry.variants && entry.variants[variant] || entry;
    const full = e.own ? e.i || [] : lang === 'hu' && window.EX_HU[id] ? window.EX_HU[id][1] : e.i || [];
    const steps = e.own && e.phaseSteps && e.phaseSteps.length ? e.phaseSteps : g && g.steps && (g.steps[lang] && g.steps[lang].length ? g.steps[lang] : g.steps.en) || concise(full);
    const board = e.own ? '' : g && g.board || '';
    return {version:1, steps, full, board, pair:e.own ? [e.img || '', e.endImg || ''] : [], reviewed:!!(g && g.reviewed)};
  }
  return {get, concise, ready};
})();
