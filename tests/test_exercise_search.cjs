const {test}=require('node:test'),assert=require('node:assert/strict');
global.window=global;
for(const file of ['data/exercises.js','data/exercises.hu.js','data/routine-art.js','data/recovery.js','data/library-expansion.js','data/exercise-aliases.js','js/i18n.js','js/exercise-search.js'])require('../'+file);
const index=ExerciseSearch.create(EXERCISES,{translations:EX_HU,aliases:EXERCISE_ALIASES,vocabulary:I18N});
const search=q=>index.find(EXERCISES,q);
const ranked=q=>search(q).matches.sort((a,b)=>b.score-a.score).map(m=>m.exercise.id);
test('common Hungarian/English gym names, accents, spacing and reordered words',()=>{
 const cases={
  'ulo labnyujto gep':'Leg_Extensions','ÜLŐ LÁBNYÚJTÓ GÉP':'Leg_Extensions','láb nyújtó gép':'Leg_Extensions','gép lábnyújtó ülő':'Leg_Extensions','labnyujtogep':'Leg_Extensions','combfeszítő gép':'Leg_Extensions','comb feszítő gép':'Leg_Extensions','seated leg extension':'Leg_Extensions','leg-extension machine':'Leg_Extensions',
  'fekvo labhajlito':'Lying_Leg_Curls','ulo labhajlitas':'Seated_Leg_Curl','seated hamstring curl':'Seated_Leg_Curl','belső comb gép':'Thigh_Adductor','külső comb gép':'Thigh_Abductor','hip abduction machine':'Thigh_Abductor','hip adduction machine':'Thigh_Adductor',
  'pec deck':'Butterfly','pecdeck':'Butterfly','reverse pec deck':'Reverse_Machine_Flyes','hátsó váll gép':'Reverse_Machine_Flyes','chest press machine':'Leverage_Chest_Press','csigas letolas':'Triceps_Pushdown','köteles tricepsz':'Triceps_Pushdown_-_Rope_Attachment','lat pull down':'Wide-Grip_Lat_Pulldown','szűk lehúzás':'V-Bar_Pulldown',
  'ülő csigás evezés':'Seated_Cable_Rows','döntött törzsű evezés rúddal':'Bent_Over_Barbell_Row','fűrészelés':'One-Arm_Dumbbell_Row','weighted pull up':'Weighted_Pull_Ups','fekve nyomas kezisulyzoval':'Dumbbell_Bench_Press','bench press':'Barbell_Bench_Press_-_Medium_Grip','ohp':'Standing_Military_Press','rdl':'Romanian_Deadlift','dumbbell rdl':'Dumbbell_Romanian_Deadlift','hip thrust machine':'Machine_Hip_Thrust','glute drive':'Machine_Hip_Thrust','lateral raise machine':'Machine_Lateral_Raise','belt squat machine':'Belt_Squat_Machine'
 };
 for(const [q,id] of Object.entries(cases))assert.equal(ranked(q)[0],id,q);
});
test('bounded typo recovery without guessing unrelated exercises or movement opposites',()=>{
 for(const q of ['labnyujtto','leg extensoin','labnyujto machien']){
  assert.equal(search(q).fuzzy,true,q);assert.ok(ranked(q).includes('Leg_Extensions'),q);
 }
 assert.equal(search('reverse pec deck').fuzzy,false);
 assert.equal(ranked('abductor machine')[0],'Thigh_Abductor');
 assert.ok(!ranked('abductor machine').includes('Thigh_Adductor'));
 assert.deepEqual(ranked('unicorn teleportation'),[]);
 assert.deepEqual(ranked('xx zz'),[]);
});
test('all names remain findable and aliases reference real exercises',()=>{
 assert.equal(new Set(EXERCISES.map(e=>e.id)).size,EXERCISES.length);
 for(const [id,aliases] of Object.entries(EXERCISE_ALIASES)){
  assert.ok(EXERCISES.some(e=>e.id===id),id);
  assert.ok(aliases.length,id);
 }
 for(const e of EXERCISES){
  assert.ok(search(e.n).matches.some(m=>m.exercise.id===e.id),e.n);
  assert.ok(search(EX_HU[e.id][0]).matches.some(m=>m.exercise.id===e.id),EX_HU[e.id][0]);
 }
});
test('custom exercise names and primary-muscle/equipment vocabulary are searchable',()=>{
 const exercise={id:'my_test',n:'Saját teszt mozdulat',p:['quadriceps'],eq:'machine'};
 const own=ExerciseSearch.create([exercise],{vocabulary:I18N});
 for(const q of ['saját teszt','quadriceps machine','combfeszítő gép'])assert.equal(own.find([exercise],q).matches[0]?.exercise.id,exercise.id,q);
});
