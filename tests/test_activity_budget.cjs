const {test}=require('node:test');const assert=require('node:assert/strict');
require('../js/workout-energy.js');const E=WorkoutEnergy;
test('steps and workouts can be included independently without changing the base target',()=>{
 for(const addActive of [false,true])for(const addWorkoutCalories of [false,true]){
  const b=E.budget(2000,800,300,200,{addActive,addWorkoutCalories},'steps');
  const extra=(addActive?200:0)+(addWorkoutCalories?300:0);
  assert.equal(b.base,2000);assert.equal(b.total,2000+extra);assert.equal(b.remaining,1200+extra);
 }
});
test('full-day watch totals replace workout estimates, including legacy records',()=>{
 for(const kind of [undefined,'total','unknown'])for(const addWorkoutCalories of [false,true]){
  const b=E.budget(2000,800,300,700,{addActive:true,addWorkoutCalories},kind);
  assert.equal(b.included,700);assert.equal(b.source,'manual');
 }
 assert.equal(E.budget(2000,800,300,700,{addActive:false,addWorkoutCalories:true},'total').included,300);
});
test('steps without calories do not suppress workouts; zero calories and no target stay finite',()=>{
 assert.equal(E.budget(2000,800,300,0,{addActive:true,addWorkoutCalories:true},'total').included,300);
 assert.equal(E.budget(null,800,0,0,{},'steps').remaining,-800);
});
