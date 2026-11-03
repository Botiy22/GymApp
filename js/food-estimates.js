/* Opt-in substitutes from the bundled food tables, NOT brand-label records.
   Only recognisable food classes with an explicit consumed amount are eligible.
   Keep confirmed nutrients; the remaining nutrients and energy stay estimates. */
window.FoodEstimates=(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function item(p,lang='hu') {
    if(p?.status!=='needLabel'||p.conflict||!window.FoodQuery||!window.FoodAI)return null;
    const n=norm(p.text),volume=p.ml>0,amount=volume?p.ml:p.grams;
    if(!(amount>0&&amount<=5000)||/\d+\s*(?:g|ml|dl)\b|powder|protein por|szelet|\bbar\b|shake|smoothie/.test(n))return null;
    let query='',basis='';const hu=lang==='hu';
    if(/\b(?:musli|muzli|muesli|granola)\b/.test(n)&&!volume) {
      query=amount+' g müzli';basis=hu?'Általános granola alapján; a csokoládé aránya ismeretlen.':'Generic granola; the chocolate proportion is unknown.';
    } else if(/\b(?:yogurt|yoghurt|joghurt)\b/.test(n)&&/high protein|magas feherje/.test(n)&&/low fat|zsirszegeny|nonfat|fat free/.test(n)&&!volume) {
      query=amount+' g zsírmentes görög joghurt';basis=hu?'Zsírmentes görög joghurt alapján; az ízesítés becsült.':'Based on nonfat Greek yogurt; flavouring is estimated.';
    } else if(/\b(?:tej|milk)\b/.test(n)&&/1[.,]5%/.test(n)&&!(/yog|joghurt|butter|vaj|coffee|kave|cocoa|kakao|choco|csoki|cream|tejszin|coconut|kokusz|almond|mandula|soy|szoja|oat|zab/.test(n))) {
      query=amount+(volume?' ml ':' g ')+'1.5% tej';basis=hu?'Általános 1,5%-os tej alapján.':'Based on generic 1.5% milk.';
    } else if(window.FoodProducts?.identity(p.text)==='alnatura butter crunchy peanut'&&!volume) {
      query=amount+' g darabos mogyoróvaj';basis=hu?'Általános darabos mogyoróvaj alapján.':'Based on generic crunchy peanut butter.';
    }
    if(!query)return null;
    const q=FoodQuery.parse(query,{strict:true,foods:[],doc:{}}).items;
    if(q.length!==1||q[0].status!=='ok')return null;
    const base=q[0],factor=volume?base.grams/amount:1;
    const it={name:p.text,en:'',grams:volume?0:amount,ml:volume?amount:0,basisUnit:volume?'ml':'g',
      k100:base.k100*factor,p100:base.p100*factor,c100:base.c100*factor,f100:base.f100*factor,
      label:false,estimated:true,approx:true,basis,gmin:0,gmax:0};
    const known=p.known||{};
    for(const key of ['p','c','f'])if(known[key]!=null) {
      if(!Number.isFinite(known[key])||known[key]<0)return null;
      const value=known[key]*100/amount;
      // Large contradictions need review, not a forced generic substitute.
      if(value>100||Math.abs(value-it[key+'100'])>15)return null;
      it.k100+=(value-it[key+'100'])*(key==='f'?9:4);it[key+'100']=value;
    }
    if(!FoodProducts.valid([it.k100,it.p100,it.c100,it.f100]))return null;
    if(known.p!=null)it.basis+=(hu?' Fehérje a megadott adatból: ':' Protein from your stated value: ')+known.p+' g.';
    return FoodAI.total(it);
  }
  function apply(result,lang='hu') {
    const items=[...(result.items||[])],pending=[];
    for(const p of result.pending||[]) {const estimate=item(p,lang);if(estimate)items.push(estimate);else pending.push(p);}
    const estimated=items.some(i=>i.estimated);
    return {...result,items,pending,needsDetails:pending.length>0,confidence:pending.length?'low':estimated?'medium':result.confidence,
      notes:estimated?(lang==='hu'?'Becsült tápértékek; a megadott mennyiségekkel számolva.':'Estimated nutrition calculated using your quantities.'):result.notes};
  }
  return {version:1,item,apply};
})();
