'use strict';
// PDF plans whose workouts are headed by weekdays ("MONDAY - PUSH") with an Exercise | Sets x Reps | RIR | Rest table.
const test = require('node:test'), assert = require('node:assert/strict');
global.window = global;
global.document = { currentScript: { src: 'http://localhost/js/pdf-local.js' } };
require('../js/plan-sheet.js');
require('../js/pdf-local.js');

const catalog = ['Barbell_Bench_Press_-_Medium_Grip', 'Pullups', 'Side_Lateral_Raise', 'Leg_Press', 'Seated_Leg_Curl', 'Romanian_Deadlift', 'Triceps_Pushdown_-_Rope_Attachment', 'Split_Squat_with_Dumbbells']
  .map(id => ({ id, en: id.replace(/_/g, ' '), hu: '', aliases: [] }));
const lines = texts => texts.map(text => ({ text, page: 1 }));

test('weekday-headed exercise tables become routines with RIR and rest', () => {
  const src = { kind: 'pdf', name: 'plan.pdf', lines: lines([
    'TRAINING PLAN', 'Schedule | Monday / Wednesday',
    'MONDAY - PUSH / STRENGTH', 'Exercise | Sets x Reps | RIR | Rest',
    'Fekvenyomás rúddal | 4 x 5-7 | 2 | 3-4 min', 'Oldalemelés | 3 x 12-15 | 0-1 | 60-90 sec', 'Köteles tricepsz letolás | 2 x 10-12 | 1 | 75 sec',
    'WEDNESDAY - LEGS', 'Exercise | Sets x Reps | RIR | Rest',
    'Román felhúzás | 3 x 6-8 | 2 | 2.5-3 min', 'Lábtoló | 3 x 10 | 1-2 | 2 perc', 'Ülő / fekvő combhajlítás | 3 x 12 | 1 | 90 mp', 'Bolgár guggolás | 3 x 8-10 / láb | 1 | 2 min',
    'Wednesday is lighter: skip the last set if tired.'
  ]) };
  const out = PDFLocal.draft([src], catalog, true, {});
  assert.deepEqual(out.routines.map(r => r.name), ['Monday - Push / Strength', 'Wednesday - Legs']);
  const [push, legs] = out.routines;
  assert.deepEqual(push.items.map(i => [i.ex, i.sets, i.reps, i.rir, i.rest]), [
    ['Barbell_Bench_Press_-_Medium_Grip', 4, '5-7', '2', 210],
    ['Side_Lateral_Raise', 3, '12-15', '0-1', 75],
    ['Triceps_Pushdown_-_Rope_Attachment', 2, '10-12', '1', 75]]);
  assert.deepEqual(legs.items.map(i => [i.ex, i.rest]), [['Romanian_Deadlift', 165], ['Leg_Press', 120], ['Seated_Leg_Curl', 90], ['Split_Squat_with_Dumbbells', 120]]);
  assert.match(legs.items[3].note, /\/ láb$/);
  assert.equal(out.plan, null);
  assert.deepEqual(out.warnings, []);
});

test('weekday meal plans still import as meals without empty workouts', () => {
  const src = { kind: 'pdf', name: 'meals.pdf', lines: lines(['Monday', 'Breakfast | 500 kcal', 'Oats | 80 g', 'Tuesday', 'Lunch | 700 kcal', 'Rice | 120 g']) };
  const out = PDFLocal.draft([src], catalog, false, {});
  assert.equal(out.routines.length, 0);
  assert.equal(out.plan.days[0].meals[0].items[0].n, 'Oats');
  assert.equal(out.plan.days[1].meals[0].kcal, 700);
});

test('unknown wording stays unmatched instead of guessing', () => {
  assert.equal(PlanSheet.exercise('Kettlebell swing variáció', catalog), '');
  assert.equal(PlanSheet.exercise('Pullups', catalog), 'Pullups');
});
