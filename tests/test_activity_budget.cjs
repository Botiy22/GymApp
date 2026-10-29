const {test}=require('node:test');const assert=require('node:assert/strict');
require('../js/workout-energy.js');const E=WorkoutEnergy;
test('steps and training switches independently add their own amounts for new and legacy entries',()=>{
 for(const kind of [undefined,'steps','total'])for(const addActive of [false,true])for(const addWorkoutCalories of [false,true]){
  const b=E.budget(2000,800,300,200,{addActive,addWorkoutCalories},kind);
  assert.equal(b.base,2000);assert.equal(b.activityIncluded,addActive?200:0);assert.equal(b.workoutIncluded,addWorkoutCalories?300:0);
  assert.equal(b.total,2000+(addActive?200:0)+(addWorkoutCalories?300:0));assert.equal(b.remaining,b.total-800);
 }
});
test('zero step calories never suppress training; no target and negative input remain bounded',()=>{
 assert.equal(E.budget(2000,800,300,0,{addActive:true,addWorkoutCalories:true}).included,300);
 assert.equal(E.budget(null,800,0,0,{}).remaining,-800);
 assert.equal(E.budget(2000,0,-10,-20,{addActive:true,addWorkoutCalories:true}).included,0);
});
