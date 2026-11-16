/* Disposable PostgreSQL via PGlite; never connects to a real Supabase project.
 Install: npm install --prefix /tmp/reppsy-pg @electric-sql/pglite
 Run: node tests/test_recipe_ratings_sql.mjs */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.argv[2]||'/tmp/reppsy-pg/node_modules/@electric-sql/pglite/dist/index.js');
const db=new PGlite();
const ids=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'];
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);grant usage on schema auth to anon,authenticated;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;`);
const sql=fs.readFileSync(new URL('../migrations/20261112_recipe_ratings.sql',import.meta.url),'utf8');
await db.exec(sql);await db.exec(sql);                                   // idempotent
for(const id of ids)await db.query('insert into auth.users values($1)',[id]);
const as=async(n,role='authenticated')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n==null?'':ids[n]]);await db.exec('set role '+role);};
const rpc=async(name,args=[])=>(await db.query('select public.'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+') as result',args)).rows[0].result;
await as(null,'anon');
assert.deepEqual(await rpc('recipe_rating_summary'),{});
await assert.rejects(rpc('recipe_rate',['protein-oats',5]),/permission denied/);
await assert.rejects(db.query('select * from public.recipe_ratings'),/permission denied/);
await as(0);
assert.deepEqual(await rpc('recipe_rate',['protein-oats',5]),{recipe:'protein-oats',avg:5,n:1,mine:5});
assert.equal((await rpc('recipe_rate',['protein-oats',3])).n,1,'one rating per user, changeable');
await assert.rejects(rpc('recipe_rate',['protein-oats',6]),/bad_stars/);
await assert.rejects(rpc('recipe_rate',['Bad Id!',4]),/bad_recipe/);
await assert.rejects(db.query('select * from public.recipe_ratings'),/permission denied/,'raters stay private');
await as(1);
assert.deepEqual(await rpc('recipe_rate',['protein-oats',4]),{recipe:'protein-oats',avg:3.5,n:2,mine:4});
assert.deepEqual(await rpc('recipe_rating_mine'),{'protein-oats':4});
await as(null,'anon');
assert.deepEqual(await rpc('recipe_rating_summary'),{'protein-oats':{avg:3.5,n:2}});
await as(1);assert.deepEqual(await rpc('recipe_rate',['protein-oats',0]),{recipe:'protein-oats',avg:3,n:1,mine:0});
await db.exec('reset role');await db.query('delete from auth.users where id=$1',[ids[0]]);
assert.deepEqual(await rpc('recipe_rating_summary'),{},'ratings go with the account');
console.log('recipe ratings SQL checks passed');
