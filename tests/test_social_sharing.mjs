/* Disposable PostgreSQL via PGlite; never connects to a real Supabase project.
 Install: npm install --prefix /tmp/reppsy-pg --cache /tmp/reppsy-npm-cache @electric-sql/pglite
 Run: node tests/test_social_sharing.mjs [/tmp/reppsy-pg/node_modules/@electric-sql/pglite/dist/index.js] */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.argv[2]||'/tmp/reppsy-pg/node_modules/@electric-sql/pglite/dist/index.js');
const db=new PGlite();
const ids=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'];
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table public.userdata(user_id uuid primary key,data jsonb);`);
for(const f of ['20261008_social.sql','20261010_profile_sharing.sql','20261010_profile_sharing.sql'])await db.exec(fs.readFileSync(new URL('../migrations/'+f,import.meta.url),'utf8'));
for(let n=0;n<4;n++)await db.query('insert into auth.users values($1,$2)',[ids[n],{reppsy_username:'fixture_'+n}]);
await assert.rejects(db.query('insert into auth.users values($1,$2)',['00000000-0000-4000-8000-000000000005',{reppsy_username:'fixture_0'}]),/unique/);
await db.query("update public.social_profiles set avatar='data:image/png;base64,YQ==' where user_id=$1",[ids[0]]);
await db.query('insert into public.social_connections(sender,recipient,accepted) values($1,$2,true),($1,$3,false)',[ids[0],ids[1],ids[2]]);
const as=async(n,role='authenticated')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n==null?'':ids[n]]);await db.exec('set role '+role);};
const rpc=async(name,args)=> (await db.query('select public.'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+') as result',args)).rows[0].result;
await as(null,'anon');assert.equal(await rpc('social_username_available',['fixture_0']),false);assert.equal(await rpc('social_username_available',['new_fixture']),true);await assert.rejects(rpc('social_profile_activity',[ids[0]]),/permission denied/);await assert.rejects(db.query('select * from public.social_profiles'),/permission denied/);
await as(2);await assert.rejects(rpc('social_profile_activity',[ids[0]]),/profile_private/);await as(3);await assert.rejects(rpc('social_profile_activity',[ids[0]]),/profile_private/);
await as(1);assert.equal((await rpc('social_photo_like',[ids[0],true])).likes,1);assert.equal((await rpc('social_photo_like',[ids[0],true])).likes,1);
let a=await rpc('social_review_save',[ids[0],5,'Helpful training partner']);assert.equal(a.reviews.length,1);a=await rpc('social_review_save',[ids[0],4,'Updated review']);assert.equal(a.reviews.length,1);assert.equal(a.reviews[0].rating,4);const review=a.reviews[0].id;
await assert.rejects(rpc('social_review_save',[ids[0],6,'Invalid']),/check constraint/);
await as(3);await assert.rejects(rpc('social_review_remove',[review]),/review_not_found/);
await as(0);await assert.rejects(rpc('social_photo_like',[ids[0],true]),/profile_private/);await assert.rejects(rpc('social_review_save',[ids[0],5,'Self']),/profile_private/);
a=await rpc('social_review_remove',[review]);assert.equal(a.reviews.length,0);
const snap={version:1,routine:{name:'Fixture routine',icon:'push',items:[{ex:'Barbell_Bench_Press_-_Medium_Grip',sets:3,reps:'8–12',rest:90,kg:100}],workouts:['PRIVATE']},myEx:[],email:'PRIVATE',food:'PRIVATE'};
a=await rpc('social_routine_publish',['routine1',snap]);assert.equal(a.routines.length,1);assert.equal(JSON.stringify(a).includes('PRIVATE'),false);assert.equal('kg' in a.routines[0].snapshot.routine.items[0],false);const shared=a.routines[0].id;
await as(1);assert.equal((await rpc('social_routine_get',[shared])).routine.name,'Fixture routine');await assert.rejects(db.query('select * from public.social_routines'),/permission denied/);await rpc('social_routine_unshare',[shared]);assert.equal((await rpc('social_routine_get',[shared])).routine.name,'Fixture routine');
await as(2);await assert.rejects(rpc('social_routine_get',[shared]),/routine_unavailable/);
await as(0);await rpc('social_routine_unshare',[shared]);await as(1);await assert.rejects(rpc('social_routine_get',[shared]),/routine_unavailable/);
await db.exec('reset role');await db.query("update public.social_profiles set avatar='data:image/png;base64,Yg==',theme='hue_225' where user_id=$1",[ids[0]]);await as(0);assert.equal((await rpc('social_profile_activity',[ids[0]])).likes,0);
await db.close();console.log('PASS: migration rerun, atomic username claims, anon/table isolation, accepted-friend permissions, photo likes, reviews, snapshot privacy, unsharing and custom profile hues.');
