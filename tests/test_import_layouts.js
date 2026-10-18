'use strict';
// The many ways people write a plan: headings, sets × reps spellings, tables, Word paragraphs and Excel sheets.
const test = require('node:test'), assert = require('node:assert/strict');
global.window = global;
global.document = { currentScript: { src: 'http://localhost/js/pdf-local.js' } };
require('../js/plan-sheet.js');
require('../js/pdf-local.js');

const ids = ['Barbell_Bench_Press_-_Medium_Grip', 'Pullups', 'Side_Lateral_Raise', 'Leg_Press', 'Barbell_Full_Squat', 'Romanian_Deadlift', 'Wide-Grip_Lat_Pulldown', 'Seated_Cable_Rows', 'Triceps_Pushdown', 'Plank', 'Dumbbell_Bicep_Curl', 'Cable_Crunch'];
const catalog = ids.map(id => ({ id, en: id.replace(/_/g, ' ').replace(/ - .*$/, ''), hu: '', aliases: [] }));
const pdf = (texts, name = 'plan.pdf') => ({ kind: 'pdf', name, lines: texts.map((text, i) => ({ text, page: 1 + (i > 40) })) });
const draft = (texts, hu = true) => PDFLocal.draft([pdf(texts)], catalog, hu, {});
const rows = r => r.items.map(i => [i.ex || i.label, i.sets, i.reps, i.rest, i.rir]);

test('generic headings without weekdays: PUSH DAY / PULL DAY with mixed spellings', () => {
  const out = draft(['MY 2-DAY PLAN', 'PUSH DAY', '1. Fekvenyomás – 4 x 6-8, pihenő 2-3 perc', '2) Oldalemelés 3×12-15 (rest 60 sec)', '• Tricepsz letolás: 3 sets of 10-12 reps, RPE 8',
    'PULL DAY', 'A1. Húzódzkodás 4 sorozat 6-10 ismétlés', 'A2. Mellhez húzás 3x8,8,6', 'Plank 3 x 45 mp', 'Bicepsz 3x AMRAP']);
  assert.deepEqual(out.routines.map(r => r.name), ['Push Day', 'Pull Day']);
  assert.deepEqual(rows(out.routines[0]), [['Barbell_Bench_Press_-_Medium_Grip', 4, '6-8', 150, ''], ['Side_Lateral_Raise', 3, '12-15', 60, ''], ['Triceps_Pushdown', 3, '10-12', null, '8']]);
  assert.deepEqual(rows(out.routines[1]).map(r => [r[0], r[1], r[2]]), [['Pullups', 4, '6-10'], ['Wide-Grip_Lat_Pulldown', 3, '8,8,6'], ['Plank', 3, '45 mp'], ['Dumbbell_Bicep_Curl', 3, 'AMRAP']]);
  assert.deepEqual(out.warnings, []);
});

test('weekday heading followed by a session title, and Day N headings', () => {
  const out = draft(['HÉTFŐ', 'Mell és váll', 'Fekvenyomás 3x8', 'Kedd – pihenőnap', 'Day 2', 'Squat 5x5 rest 3 min', 'Leg press 3x10-12']);
  assert.equal(out.routines[0].name, 'Hétfő – Mell és váll');   // only ALL-CAPS headings are re-cased
  assert.equal(out.routines[1].name, 'Day 2');
  assert.deepEqual(rows(out.routines[1]).map(r => r.slice(0, 4)), [['Barbell_Full_Squat', 5, '5', 180], ['Leg_Press', 3, '10-12', null]]);
});

test('scheme before the name and unknown exercises keep their label', () => {
  const out = draft(['Upper', '3x10 Bench press', '4 x 12 Cable fly with pause']);
  assert.deepEqual(out.routines[0].items.map(i => [i.ex, i.label, i.sets, i.reps]), [['Barbell_Bench_Press_-_Medium_Grip', 'Bench press', 3, '10'], ['', 'Cable fly with pause', 4, '12']]);
});

test('prose, page numbers and nutrition lines do not become exercises', () => {
  const out = draft(['Training tips', 'Do 3x per week if possible, rest at least 48 hours.', 'Page 2', 'Protein 2x a day']);
  assert.equal(out.routines.length, 0);
});

test('meal plan PDFs: numbered meals, amount-first foods and ml', () => {
  const out = draft(['Monday', 'Étkezés 1 – 520 kcal', '80 g zabpehely', 'Tej 250 ml', '2. étkezés: 600 kcal', 'Csirkemell 200g', 'Edzés után', '30 g whey'], true);
  const day = out.plan.days[0];
  assert.deepEqual(day.meals.map(m => m.name.trim()), ['Étkezés 1 – 520 kcal'.split(/[:|]/)[0].replace(/\s+kcal.*$/i, '').trim(), '2. étkezés', 'Edzés után']);
  assert.deepEqual(day.meals[0].items.map(i => [i.n, i.g]), [['zabpehely', 80], ['Tej', 250]]);
  assert.equal(day.meals[0].kcal, 520);
  assert.deepEqual(day.meals[2].items.map(i => i.n), ['whey']);
});

test('Word tables with separate Sets, Reps and Rest columns (as OfficeLocal writes them)', () => {
  const out = PDFLocal.draft([{ kind: 'docx', name: 'plan.docx', lines: [
    { text: 'Edzés A – Felsőtest', page: '¶1' },
    { text: 'Gyakorlat | Sorozat | Ismétlés | Pihenő (mp)', page: 'T2R1', table: 'T2', cells: ['Gyakorlat', 'Sorozat', 'Ismétlés', 'Pihenő (mp)'] },
    { text: 'Fekvenyomás | 3×8-10 | rest 120 sec', page: 'T2R2', table: 'T2' },
    { text: 'Evezés csigán | 3×10 | rest 90 sec', page: 'T2R3', table: 'T2' }] }], catalog, true, {});
  assert.equal(out.routines[0].name, 'Edzés A – Felsőtest');
  assert.deepEqual(rows(out.routines[0]).map(r => r.slice(0, 4)), [['Barbell_Bench_Press_-_Medium_Grip', 3, '8-10', 120], ['Seated_Cable_Rows', 3, '10', 90]]);
});

test('Excel: title rows, a combined "Sets x Reps" column and unitless rest', () => {
  const sheet = (r, cells) => ({ page: 'Plan!' + r, sheet: 'Plan', row: r, merged: {}, cells, text: cells.join(' | ') });
  const src = { kind: 'xlsx', name: 'plan.xlsx', lines: [{ page: 'Plan', text: 'Plan' },
    sheet(1, ['Day 1 – Push']), sheet(2, ['Exercise', 'Sets x Reps', 'Rest']), sheet(3, ['Bench press', '4 x 6-8', '3']), sheet(4, ['Lateral raise', '3x15', '60']),
    sheet(6, ['Day 2 – Legs']), sheet(7, ['Squat', '5x5', '180'])] };
  const out = PDFLocal.draft([src], catalog, false, {});
  assert.deepEqual(out.routines.map(r => r.name), ['Day 1 – Push', 'Day 2 – Legs']);
  assert.deepEqual(rows(out.routines[0]).map(r => r.slice(0, 4)), [['Barbell_Bench_Press_-_Medium_Grip', 4, '6-8', 180], ['Side_Lateral_Raise', 3, '15', 60]]);
  assert.deepEqual(rows(out.routines[1]).map(r => r.slice(0, 4)), [['Barbell_Full_Squat', 5, '5', 180]]);
});
