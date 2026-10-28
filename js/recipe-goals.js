/* Evidence-informed meal filters, not medical diet prescriptions.
   Exact portion cutoffs are transparent product rules, not clinical thresholds.
   Rationale, sources and retrieval limits: docs/RECIPE_NUTRITION.md. */
window.RecipeGoals=(()=>{
  const keys=['loss','maintain','bulk','muscle'];
  const sources=[
    {title:'ISSN position stand: protein and exercise (2017)',url:'https://doi.org/10.1186/s12970-017-0177-8'},
    {title:'ISSN position stand: diets and body composition (2017)',url:'https://doi.org/10.1186/s12970-017-0174-y'},
    {title:'Morton et al.: protein supplementation and resistance training — meta-analysis (2018)',url:'https://doi.org/10.1136/bjsports-2017-097608'},
    {title:'Is an energy surplus required to maximize muscle hypertrophy? (2019)',url:'https://doi.org/10.3389/fnut.2019.00131'},
    {title:'EU Regulation 1924/2006 — nutrition claims, Annex',url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006R1924'},
    {title:'USDA FoodData Central — food composition data',url:'https://fdc.nal.usda.gov/'},
    {title:'FoodSafety.gov — safe cooking temperatures',url:'https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures'}
  ];
  function complete(r){return !!r&&['kcal','p','c','f'].every(k=>typeof r[k]==='number'&&Number.isFinite(r[k])&&r[k]>=0)&&r.kcal>0;}
  function classify(r){
    if(!complete(r))return [];
    const meal=r.cat==='main'||r.cat==='breakfast',tags=[];
    if(r.kcal>=(meal?250:80)&&r.kcal<=(meal?500:250)&&r.p>=(meal?25:15))tags.push('loss');
    if(r.kcal>=(meal?300:100)&&r.kcal<=(meal?650:300)&&r.p>=(meal?20:10))tags.push('maintain');
    if(r.kcal>=(meal?550:300)&&r.p>=(meal?25:15))tags.push('bulk');
    if(r.p>=25&&r.p*4/r.kcal>=.2)tags.push('muscle');
    return tags;
  }
  return {keys,sources,classify,matches:(r,goal)=>!goal||classify(r).includes(goal),complete};
})();
