// 2.55: swim and ride routines — plans fit the time, and storage keeps the type and cleans the settings.
const assert = require('node:assert/strict');
const test = require('node:test');
globalThis.window = globalThis;
require('../js/swim-training.js'); require('../js/routine-kinds.js');
const R = globalThis.RoutineKinds;

test('ride plans always add up to the chosen time', () => {
  for (const style of R.ride.styles) for (const minutes of [15, 20, 30, 45, 60, 90, 180, 300]) {
    const p = R.ride.plan({ style, minutes, reps: 6, on: 4, off: 2 });
    if (!p.fits) { assert(p.minimumMinutes > minutes, `${style} ${minutes}`); continue; }
    assert.equal(p.minutes, minutes, `${style} ${minutes}`);
    assert.equal(p.blocks[0].id, 'warm'); assert.equal(p.blocks.at(-1).id, 'cool');
    assert(p.blocks.every(b => b.minutes > 0 && b.zone >= 1 && b.zone <= 4));
    if (style === 'tempo') assert(p.blocks.find(b => b.id === 'main').minutes <= 40, 'tempo is capped, the rest is steady');
  }
});

test('intervals shrink to what fits and say so when nothing does', () => {
  const p = R.ride.plan({ style: 'intervals', minutes: 40, reps: 10, on: 5, off: 3 });
  assert(p.fits); assert.equal(p.reps, 3); assert.equal(p.blocks[1].reps, 3);   // 10 warm + 3 × 8 + 1 steady + 5 cool
  const no = R.ride.plan({ style: 'intervals', minutes: 20, reps: 4, on: 10, off: 5 });
  assert.equal(no.fits, false); assert.equal(no.minimumMinutes, 25);
});

test('cleaning keeps the type and bounds every value', () => {
  assert.deepEqual(R.ride.clean({ minutes: '9999', style: 'race', reps: -1, on: 'x' }), { minutes: 60, style: 'endurance', reps: 5, on: 4, off: 3 });
  assert.deepEqual(R.cleanRoutine({ kind: 'swim', plan: { pool: 50, minutes: 30, routine: 'intervals' } }).plan, SwimTraining.clean({ pool: 50, minutes: 30, routine: 'intervals' }));
  assert.equal(R.cleanRoutine({ kind: 'gym' }), null); assert.equal(R.cleanRoutine({}), null);
});
