/* Offline, bilingual exercise retrieval. Exact matches beat prefixes and aliases;
   a one-edit fallback is used only when the complete query has no direct matches. */
window.ExerciseSearch = (() => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const equivalents = {
    machine:['gep','gepi','gepen','geppel','machines'], cable:['csiga','csigas','csigan','kabel','kabeles','kabelen','cables'],
    dumbbell:['kezisulyzo','kezisulyzos','kezisulyzoval','dumbbells','db'], barbell:['ruddal','rudas','barbells'],
    seated:['ulo','ulve','ulesben'], lying:['fekvo','fekve','prone'], standing:['allo','allva'],
    single:['egy','egykezes','egylabas','unilateral'], leg:['legs','lab','labas'],
    extension:['extensions'], curl:['curls'], raise:['raises'], fly:['flyes','flys'], squat:['squats'],
    pushup:['pushups'], pullup:['pullups'], triceps:['tricepsz','tricep'], biceps:['bicepsz','bicep'],
    band:['bands','gumiszalag','gumiszalaggal','szalaggal'], bodyweight:['testsulyos','testsullyal']
  };
  const canonical = new Map();
  for(const [root,forms] of Object.entries(equivalents))for(const form of [root,...forms])canonical.set(form,root);
  // Hungarian compound gym names are often typed as separate words on a phone.
  const compound = value => normalize(value).replace(/\blab\s+(nyujt[a-z]*|hajlit[a-z]*|tolo[a-z]*)/g,'lab$1').replace(/\bcomb\s+(feszit[a-z]*|hajlit[a-z]*|kozelit[a-z]*|tavolit[a-z]*)/g,'comb$1').replace(/\boldal\s+(emel[a-z]*)/g,'oldal$1').replace(/\bfekve\s+(nyom[a-z]*)/g,'fekve$1').replace(/\b(push|pull|chin)\s+ups?\b/g,'$1up').replace(/\b(body only|sajat testsuly)\b/g,'bodyweight');
  const words = value => compound(value).split(' ').filter(Boolean).map(w=>canonical.get(w)||w);
  const phrase = value => words(value).join(' ');
  const distinct = values => [...new Set(values.filter(Boolean))];
  // Never blur movement opposites just because they are one character apart.
  const protectedWords = new Set(['abductor','adductor','abduction','adduction','push','pull']);
  function near(a,b){
    if(a.length<5||b.length<5||protectedWords.has(a)||protectedWords.has(b)||Math.abs(a.length-b.length)>1)return false;
    if(a===b)return true;
    if(a.length===b.length){
      const diff=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])diff.push(i);
      return diff.length===1||diff.length===2&&diff[1]===diff[0]+1&&a[diff[0]]===b[diff[1]]&&a[diff[1]]===b[diff[0]];
    }
    const small=a.length<b.length?a:b,big=a.length<b.length?b:a;
    let i=0,j=0,skip=0;while(i<small.length&&j<big.length){if(small[i]===big[j]){i++;j++;}else{if(++skip>1)return false;j++;}}return true;
  }
  const muscleNames={quadriceps:['combfeszítő','quads'],hamstrings:['combhajlító','hamstring'],glutes:['farizom','fenék'],calves:['vádli'],lats:['széles hátizom'],abdominals:['has','hasizom','abs'],adductors:['combközelítő','belső comb'],abductors:['combtávolító','külső comb'],shoulders:['váll','delts']};
  function create(exercises,{translations={},aliases={},planNames={},vocabulary={}}={}){
    const records=new Map(exercises.map(e=>{
      const names=distinct([e.n,translations[e.id]?.[0],planNames[e.id]].map(phrase));
      const other=distinct((aliases[e.id]||[]).map(phrase));
      const tags=distinct([e.eq,...e.p,...e.p.flatMap(m=>muscleNames[m]||[]),...Object.values(vocabulary).flatMap(v=>[v.eq?.[e.eq],...e.p.map(m=>v.mus?.[m])])].map(phrase));
      return [e.id,{names,other,nameWords:distinct([...names,...other].flatMap(words)),tags:distinct(tags.flatMap(words))}];
    }));
    function score(id,q,tokens,fuzzy){
      const r=records.get(id);if(!r)return 0;
      if(!q)return 1;
      if(r.names.includes(q))return 10000;
      if(r.other.includes(q))return 9500;
      const all=[...r.names,...r.other];
      if(all.some(n=>n.replace(/ /g,'')===q.replace(/ /g,'')))return 9200;
      const pool=[...r.nameWords,...r.tags];
      let quality=0,typos=0;
      for(const w of tokens){
        if(r.nameWords.includes(w))quality+=40;
        else if(r.nameWords.some(n=>n.startsWith(w)))quality+=30;
        else if(w.length>=3&&r.nameWords.some(n=>n.includes(w)))quality+=20;
        else if(r.tags.some(n=>n===w||w.length>=3&&n.startsWith(w)))quality+=10;
        else if(fuzzy&&pool.some(n=>near(w,n))){quality+=1;typos++;}
        else return 0;
      }
      // Require near-complete input; don't turn several unrelated words into a guess.
      if(typos>1)return 0;
      const prefix=all.some(n=>n.startsWith(q)),contains=all.some(n=>n.includes(q));
      return (typos?1000:prefix?8000:contains?7000:5000)+quality/tokens.length;
    }
    function find(exercises,query){
      const q=phrase(String(query||'').slice(0,160)),tokens=q.split(' ');
      const rank=fuzzy=>exercises.map(e=>({exercise:e,score:score(e.id,q,tokens,fuzzy)})).filter(x=>x.score>0);
      let matches=rank(false);const fuzzy=!matches.length&&!!normalize(query);if(fuzzy)matches=rank(true);
      return {matches,fuzzy:fuzzy&&matches.length>0};
    }
    return {find};
  }
  return {create,normalize};
})();
