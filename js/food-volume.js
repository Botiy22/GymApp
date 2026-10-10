/* Nutrition stays per 100 g. Convert only from a documented household volume + gram weight.
   USDA SR US household units: cup 236.5882365 ml, tbsp 14.7867648 ml, tsp 4.92892159 ml,
   fl oz 29.5735296 ml. Explicit metric portions take precedence. No water-density fallback. */
window.FoodVolume=(()=>{
  const US={cup:236.5882365,tablespoon:14.7867648,tbsp:14.7867648,teaspoon:4.92892159,tsp:4.92892159};
  function portionMl(label,metricOnly=false){
    label=String(label||'');const si=label.match(/(\d+(?:[.,]\d+)?)\s*(ml|dl|l)\b/i);
    if(si)return +si[1].replace(',','.')*({ml:1,dl:100,l:1000}[si[2].toLowerCase()]);
    if(metricOnly)return null;
    const oz=label.match(/(\d+(?:\.\d+)?)\s*(fl[ .-]*oz|fluid ounces?)\b/i);if(oz)return +oz[1]*29.5735296;
    const us=label.match(/(\d+(?:\.\d+)?)\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp)\b/i);if(us)return +us[1]*US[us[2].toLowerCase().replace(/s$/,'')];
    return null;
  }
  function isLiquid(name){
    name=String(name||'');if(/\b(dry|powder|dehydrated|concentrate|concentrated|frozen|whipped)\b/i.test(name))return false;
    return /^(milk|cream|water|oil|oils|vinegar|alcoholic beverage|beverages|coffee|tea|broth|soup|sauce|sauces|syrup|syrups|honey|juice),/i.test(name)||/^[a-z -]+ juice,/i.test(name);
  }
  function describe(row,hu){
    const ml=hu&&portionMl(hu[3],true),liquid=isLiquid(row[0])||!!ml;
    if(!liquid)return {liquid:false,gramsPerDl:null};
    const candidates=[];if(ml>0&&hu[4]>0)candidates.push({ml,g:hu[4],source:hu[3]});
    for(let i=5;i+1<row.length;i+=2){const v=portionMl(row[i+1]);if(v>0&&row[i]>0&&!/yields|diluted|prepared/i.test(row[i+1]))candidates.push({ml:v,g:row[i],source:row[i+1]});}
    const p=candidates.find(p=>p.g/p.ml>=.3&&p.g/p.ml<=2);
    return {liquid:true,gramsPerDl:p?p.g/p.ml*100:null,source:p?.source||''};
  }
  function quantity(food,amount,unit){
    amount=Number(String(amount).replace(',','.'));if(!Number.isFinite(amount)||amount<0)return null;
    if(unit==='dl'){
      const vml=amount*100;if(vml>5000)return null;
      if(food.basis==='ml')return {g:0,vml,k:amount};
      if(!(food.volume?.gramsPerDl>0))return null;
      const g=amount*food.volume.gramsPerDl;if(g>5000)return null;return {g,vml,k:g/100};
    }
    if(food.basis==='ml'||amount>5000)return null;
    return {g:amount,k:amount/100};
  }
  return {portionMl,isLiquid,describe,quantity};
})();
