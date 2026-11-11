/* Routines that are not gym sessions: a saved swim (the pool-session builder's settings) or a planned ride
 * (warm-up, main part, cool-down). A routine with kind 'swim' or 'ride' keeps its settings in `plan` and has no exercises.
 * Effort is given as RPE (perceived effort out of 10) with a talk test, not as heart-rate or power numbers. */
globalThis.RoutineKinds = (() => {
  'use strict';
  const kinds = ['gym', 'swim', 'ride'];
  const STYLES = {
    recovery: { zone: 1, rpe: '2–3' },
    endurance: { zone: 2, rpe: '3–4' },
    tempo: { zone: 3, rpe: '5–6' },
    intervals: { zone: 4, rpe: '7–8' }
  };
  const int = (v, min, max, f) => { const n = Math.round(+v); return Number.isFinite(n) && n >= min && n <= max ? n : f; };
  function cleanRide(v) {
    v = v && typeof v === 'object' ? v : {};
    return { minutes: int(v.minutes, 15, 300, 60), style: Object.hasOwn(STYLES, v.style) ? v.style : 'endurance',
      reps: int(v.reps, 1, 20, 5), on: int(v.on, 1, 30, 4), off: int(v.off, 1, 15, 3) };
  }
  function planRide(raw) {
    const c = cleanRide(raw), s = STYLES[c.style];
    const warm = c.style === 'recovery' || c.minutes < 30 ? 5 : 10, cool = c.minutes < 45 || c.style === 'recovery' ? 5 : 10;
    const main = c.minutes - warm - cool;
    const block = (id, minutes, zone, rpe, extra) => Object.assign({ id, minutes, zone, rpe }, extra || {});
    const blocks = [block('warm', warm, 1, '2–3')];
    if (main < 5) return { config: c, blocks: [], fits: false, minimumMinutes: warm + cool + 5 };
    if (c.style === 'intervals') {
      const per = c.on + c.off, reps = Math.min(c.reps, Math.floor(main / per));
      if (reps < 1) return { config: c, blocks: [], fits: false, minimumMinutes: warm + cool + per };
      blocks.push(block('main', reps * per, s.zone, s.rpe, { reps, on: c.on, off: c.off, offZone: 1 }));
      if (main - reps * per > 0) blocks.push(block('steady', main - reps * per, 2, '3–4'));
    } else if (c.style === 'tempo' && main > 40) {                // long rides: up to 40 minutes at tempo, the rest steady
      blocks.push(block('main', 40, s.zone, s.rpe), block('steady', main - 40, 2, '3–4'));
    } else blocks.push(block('main', main, s.zone, s.rpe));
    blocks.push(block('cool', cool, 1, '2'));
    return { config: c, blocks, fits: true, minutes: blocks.reduce((n, b) => n + b.minutes, 0), reps: blocks[1].reps || 0 };
  }
  const swim = {
    clean: v => globalThis.SwimTraining ? SwimTraining.clean(v) : Object.assign({ pool: 25, minutes: 45, pace: 150, routine: 'foundation', stroke: 'free' }, v || {}),
    plan: v => globalThis.SwimTraining ? SwimTraining.plan(v) : { fits: false, blocks: [] }
  };
  const ride = { clean: cleanRide, plan: planRide, styles: Object.keys(STYLES) };
  /* What a routine's plan is cleaned with when it is stored; gym routines have no plan. */
  function cleanRoutine(x) {
    if (x.kind === 'swim') return { kind: 'swim', plan: swim.clean(x.plan) };
    if (x.kind === 'ride') return { kind: 'ride', plan: cleanRide(x.plan) };
    return null;
  }
  return { version: 1, kinds, swim, ride, cleanRoutine };
})();
