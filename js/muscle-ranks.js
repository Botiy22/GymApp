/* Muscle-group ranks: the strongest logged working set for each group, as an estimated one-rep max relative to body weight.
   These are the app's own standards, set roughly in line with common bodyweight strength tables; they are estimates, not test results. */
globalThis.MuscleRanks = (() => {
  'use strict';
  const tiers = globalThis.StrengthRanks ? StrengthRanks.tiers : [];
  // Ratio of estimated 1RM (in the group's reference lift) to body weight needed for each of the nine tiers, for men.
  // Builder ≈ beginner, Climber ≈ novice, Spark ≈ intermediate, Steel ≈ advanced, Titan ≈ elite in common bodyweight tables (approximate).
  // Women use the same table scaled by WOMEN (an approximation; published standards differ by source).
  const WOMEN = 0.7;
  // An exercise counts as f × its estimated 1RM; "pair" means the entered weight is one dumbbell, so both hands are added;
  // "bw" means body weight plus any added weight (pull-ups, dips).
  const groups = [
    { id: 'chest', en: 'Chest', hu: 'Mell', front: ['pec'], back: [], steps: [0.01, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25],
      ex: { 'Barbell_Bench_Press_-_Medium_Grip': 1, 'Bench_Press_-_Powerlifting': 1, 'Barbell_Incline_Bench_Press_-_Medium_Grip': 1.15, 'Smith_Machine_Bench_Press': 0.95, 'Machine_Bench_Press': 0.9, 'Leverage_Chest_Press': 0.85, 'Dumbbell_Bench_Press': [1.15, 'pair'], 'Incline_Dumbbell_Press': [1.3, 'pair'], 'Decline_Barbell_Bench_Press': 0.95 } },
    { id: 'back', en: 'Back', hu: 'Hát', front: ['traps'], back: ['lats', 'midback', 'traps'], steps: [0.01, 0.5, 0.65, 0.8, 1, 1.2, 1.4, 1.6, 1.8],
      ex: { 'Bent_Over_Barbell_Row': 1, 'Seated_Cable_Rows': 1, 'Wide-Grip_Lat_Pulldown': 1, 'Close-Grip_Front_Lat_Pulldown': 1, 'Leverage_Iso_Row': 1, 'T-Bar_Row_with_Handle': 1, 'Pullups': [0.7, 'bw'], 'Chin-Up': [0.67, 'bw'], 'One-Arm_Dumbbell_Row': [0.9, 'pair'], 'Dumbbell_Incline_Row': [1, 'pair'] } },
    { id: 'shoulders', en: 'Shoulders', hu: 'Váll', front: ['delt_front'], back: ['delt_rear'], steps: [0.01, 0.35, 0.45, 0.55, 0.65, 0.8, 0.95, 1.1, 1.25],
      ex: { 'Standing_Military_Press': 1, 'Barbell_Shoulder_Press': 1, 'Seated_Barbell_Military_Press': 1, 'Machine_Shoulder_Military_Press': 0.9, 'Leverage_Shoulder_Press': 0.9, 'Dumbbell_Shoulder_Press': [1.15, 'pair'], 'Arnold_Dumbbell_Press': [1.2, 'pair'] } },
    { id: 'biceps', en: 'Biceps', hu: 'Bicepsz', front: ['biceps'], back: [], steps: [0.01, 0.2, 0.3, 0.4, 0.5, 0.65, 0.8, 0.95, 1.1],
      ex: { 'Barbell_Curl': 1, 'EZ-Bar_Curl': 1, 'Preacher_Curl': 1.1, 'Standing_Biceps_Cable_Curl': 1, 'Dumbbell_Bicep_Curl': [1, 'pair'], 'Hammer_Curls': [0.9, 'pair'], 'Incline_Dumbbell_Curl': [1.1, 'pair'] } },
    { id: 'triceps', en: 'Triceps', hu: 'Tricepsz', front: ['triceps_f'], back: ['triceps'], steps: [0.01, 0.45, 0.65, 0.9, 1.1, 1.35, 1.6, 1.8, 2],
      ex: { 'Close-Grip_Barbell_Bench_Press': 1, 'Dips_-_Triceps_Version': [0.6, 'bw'], 'Dips_-_Chest_Version': [0.6, 'bw'], 'Triceps_Pushdown': 1.8, 'Triceps_Pushdown_-_Rope_Attachment': 1.9, 'Cable_Rope_Overhead_Triceps_Extension': 2, 'EZ-Bar_Skullcrusher': 1.9 } },
    { id: 'quads', en: 'Quads', hu: 'Combfeszítők', front: ['quads'], back: [], steps: [0.01, 0.75, 1, 1.25, 1.5, 1.85, 2.25, 2.6, 3],
      ex: { 'Barbell_Full_Squat': 1, 'Barbell_Squat': 1, 'Front_Barbell_Squat': 1.2, 'Hack_Squat': 0.6, 'Barbell_Hack_Squat': 0.8, 'Leg_Press': 0.4, 'Smith_Machine_Squat': 0.9, 'Split_Squat_with_Dumbbells': [1.6, 'pair'] } },
    { id: 'posterior', en: 'Hamstrings & glutes', hu: 'Combhajlítók és far', front: [], back: ['hams', 'glutes', 'erectors'], steps: [0.01, 1, 1.25, 1.5, 1.85, 2.25, 2.6, 3, 3.4],
      ex: { 'Barbell_Deadlift': 1, 'Sumo_Deadlift': 1, 'Romanian_Deadlift': 1.25, 'Stiff-Legged_Barbell_Deadlift': 1.25, 'Barbell_Hip_Thrust': 0.6, 'Trap_Bar_Deadlift': 0.95 } },
    { id: 'calves', en: 'Calves', hu: 'Vádli', front: ['calves_f'], back: ['calves'], steps: [0.01, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5],
      ex: { 'Standing_Calf_Raises': 1, 'Smith_Machine_Calf_Raise': 1, 'Seated_Calf_Raise': 1.5, 'Calf_Press_On_The_Leg_Press_Machine': 0.6, 'Barbell_Seated_Calf_Raise': 1.5 } }
  ];
  // How hard each part is to grow, from a popular gym tier list the owner saved (S = hardest … D = easiest). Opinion, not research.
  const growth = { chest: [['C', 'Chest', 'Mell'], ['S', 'Upper chest', 'Felső mell']], back: [['A', 'Lats', 'Széles hátizom'], ['C', 'Traps', 'Csuklyásizom'], ['C', 'Lower back', 'Alsó hát'], ['D', 'Mid back', 'Középső hát']],
    shoulders: [['S', 'Side delts', 'Oldalsó váll'], ['A', 'Rear delts', 'Hátsó váll'], ['D', 'Front delts', 'Elülső váll']], biceps: [['B', 'Biceps', 'Bicepsz']], triceps: [['A', 'Triceps', 'Tricepsz']],
    quads: [['B', 'Quads', 'Combfeszítő']], posterior: [['A', 'Hamstrings', 'Combhajlító'], ['B', 'Glutes', 'Farizom']], calves: [['S', 'Calves', 'Vádli']] };
  groups.forEach(g => { g.growth = growth[g.id] || []; });
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  // Epley estimate, trusted up to 12 reps; heavier sets are not inflated past what was lifted.
  const e1rm = (kg, reps) => reps <= 1 ? kg : kg * (1 + Math.min(reps, 12) / 30);
  function summary(workouts, bodyweight, sex) {
    const bw = finite(+bodyweight) && +bodyweight >= 30 && +bodyweight <= 300 ? +bodyweight : 0, scale = sex === 'f' ? WOMEN : 1;
    return groups.map(g => {
      let best = null;
      if (bw) for (const w of workouts || []) {
        if (w.tick) continue;
        for (const e of w.entries || []) {
          const rule = g.ex[e.ex]; if (rule == null) continue;
          const [f, kind] = Array.isArray(rule) ? rule : [rule, ''];
          for (const s of e.sets || []) {
            if (s.w || s.done === false || !finite(s.reps) || s.reps <= 0 || s.reps > 100 || !finite(s.kg) || s.kg < 0 || s.kg > 1000) continue;
            const load = kind === 'bw' ? bw + s.kg : kind === 'pair' ? s.kg * 2 : s.kg;
            if (load <= 0) continue;
            const ratio = e1rm(load, s.reps) * f / bw;
            if (!best || ratio > best.ratio) best = { ratio, ex: e.ex, kg: s.kg, reps: s.reps, workout: w.id, at: w.start };
          }
        }
      }
      const steps = g.steps.map(x => x * scale), ratio = best ? best.ratio : 0;
      const tier = steps.reduce((t, need, i) => ratio >= need ? i : t, -1);
      const next = steps[tier + 1] || null, base = tier < 0 ? 0 : steps[tier];
      return { id: g.id, en: g.en, hu: g.hu, front: g.front, back: g.back, growth: g.growth, tier, ratio: Math.round(ratio * 100) / 100, best, next, progress: next ? Math.max(0, Math.min(1, (ratio - base) / (next - base))) : 1, steps };
    });
  }
  // Region → tier maps for the body figure (a region shared by two groups shows the higher rank).
  function regions(list) {
    const f = {}, b = {};
    for (const g of list) {
      if (g.tier < 0) continue;
      for (const r of g.front) f[r] = Math.max(f[r] ?? -1, g.tier);
      for (const r of g.back) b[r] = Math.max(b[r] ?? -1, g.tier);
    }
    return [f, b];
  }
  return { groups, summary, regions, e1rm, WOMEN };
})();
