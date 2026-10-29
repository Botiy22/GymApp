/* Packaged-food identities and opt-in retailer lookup. No invented brand nutrition.
   Open Food Facts is community-maintained (ODbL); users review the exact variant/label before saving. */
window.FoodProducts=(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const brands=/\b(lidl|pilos|crownfield|milbona|alesto|freshona|combino|solevita|tesco|spar|s-budget|s budget|despar|freefrom|free from|biotech|biotechusa)\b/;
  const number=s=>Number(String(s).replace(',','.'));
  function read(text){
    const original=String(text||'').trim(), m=original.match(/^(\d+(?:[.,]\d+)?)\s*(kg|dkg|g|ml|dl|l)\b\s*(.*)$/i);
    let name=m?m[3]:original;const known={};
    const per100=name.match(/\bper\s*100\s*(ml|g)\b/i);if(per100)name=name.replace(per100[0],' ');
    // A second nutrient amount is label information, never a second ingredient.
    if(m)name=name.replace(/(\d+(?:[.,]\d+)?)\s*g\s*(protein|fehérje|feherje|carbs|szénhidrát|szenhidrat|fat|zsír|zsir)\b/gi,(all,n,k)=>{known[/protein|feh/i.test(k)?'p':/carb|sz.n/i.test(k)?'c':'f']=number(n);return ' ';});
    name=name.replace(/(\d+(?:[.,]\d+)?)\s*%?\s*(?:fat|zsír|zsir)(?![a-záéíóöőúüű])/gi,(_,n)=>number(n)+'%');
    name=name.replace(/\bni added sugar\b/gi,'no added sugar').replace(/\s+/g,' ').replace(/^[, ]+|[, ]+$/g,'');
    const unit=m?.[2].toLowerCase(),amount=m?number(m[1]):null,ml=unit&&['ml','dl','l'].includes(unit)?amount*({ml:1,dl:100,l:1000}[unit]):null;
    if(per100){const qty=per100[1].toLowerCase()==='ml'?ml:unit&&['g','dkg','kg'].includes(unit)?amount*({g:1,dkg:10,kg:1000}[unit]):null;Object.keys(known).forEach(k=>{if(qty!=null)known[k]*=qty/100;else delete known[k];});}
    return {original,name,known,amount,unit,grams:unit&&['g','dkg','kg'].includes(unit)?amount*({g:1,dkg:10,kg:1000}[unit]):null,ml,packaged:brands.test(norm(name))||/\b(choco|chocolate|csokis)\b.*\b(musli|muzli|muesli|granola)\b/.test(norm(name))};
  }
  function identity(s){
    return norm(read(s).name).replace(/yoghurt|joghurt/g,'yogurt').replace(/kokusz(?:os)?/g,'coconut').replace(/vanilias|vanilia/g,'vanilla').replace(/csokolades|csokis|choco\b/g,'chocolate').replace(/tej\b/g,'milk').replace(/laktozmentes|lactosefree|lactose-free/g,'lactose free').replace(/freefrom/g,'free from').replace(/musli|muzli/g,'muesli').replace(/\b(low fat|no added sugar|hozzaadott cukor nelkul|zsirszegeny|flavour|flavor|izu)\b/g,' ').replace(/[^a-z0-9.%]+/g,' ').trim().split(/\s+/).filter(Boolean).sort().join(' ');
  }
  function saved(text,foods){
    const d=read(text),id=identity(d.name);if(!id||d.amount==null)return null;
    const matches=(foods||[]).filter(f=>[f.name,...(f.aliases||[])].some(n=>identity(n)===id));
    if(matches.length!==1)return null;
    const f=matches[0],volume=f.basis==='ml',amount=volume?d.ml:d.grams;
    if(!(amount>0&&amount<=5000))return {...d,text:d.name,status:'needGrams',why:volume?'labelVolume':'labelWeight'};
    const values=[f.kcal,f.p,f.c,f.f];if(!valid(values))return null;
    if(/\b(low fat|zsirszegeny)\b/.test(norm(d.name))&&f.f>(volume?1.5:3))return {...d,text:d.name,status:'needLabel',conflict:true};
    const k=amount/100,portion=values.map(v=>v*k);
    // Contradictory new label information must not silently lose to a previously saved product.
    if(Object.keys(d.known).some(key=>Math.abs(d.known[key]-portion[{p:1,c:2,f:3}[key]])>.2))return {...d,text:d.name,status:'needLabel',conflict:true};
    return {...d,text:f.name,status:'ok',exact:true,label:true,grams:volume?0:amount,ml:volume?amount:0,basisUnit:volume?'ml':'g',k100:f.kcal,p100:f.p,c100:f.c,f100:f.f,kcal:Math.round(portion[0]),p:round(portion[1]),c:round(portion[2]),f:round(portion[3])};
  }
  const round=v=>Math.round(v*10)/10;
  function valid(v){return v.length===4&&v.every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0)&&v[0]<=950&&v.slice(1).every(x=>x<=100)&&v.slice(1).reduce((a,b)=>a+b,0)<=105;}
  function product(p){
    const n=p?.nutriments||{},get=k=>{const v=n[k];return typeof v==='number'&&Number.isFinite(v)?v:null;};
    const kcal=get('energy-kcal_100g')??(get('energy-kj_100g')!=null?get('energy-kj_100g')/4.184:null),v=[kcal,get('proteins_100g'),get('carbohydrates_100g'),get('fat_100g')];
    const code=String(p?.code||''),name=String(p?.product_name_hu||p?.product_name||'').trim();
    if(!/^\d{8,14}$/.test(code)||!name||!valid(v)||!['100g','100ml'].includes(p.nutrition_data_per))return null;
    const brand=String(p.brands||'').split(',')[0].trim();
    return {name:(brand&&!norm(name).includes(norm(brand))?brand+' ':'')+name,kcal:round(v[0]),p:round(v[1]),c:round(v[2]),f:round(v[3]),basis:p.nutrition_data_per==='100ml'?'ml':'g',source:'https://world.openfoodfacts.org/product/'+code,barcode:code};
  }
  async function search(query,shop=''){
    query=String(query||'').trim().slice(0,120);if(query.length<2)return [];
    const fields='code,product_name,product_name_hu,brands,stores,nutriments,nutrition_data_per';
    const barcode=/^\d{8,14}$/.test(query),url=barcode?'https://world.openfoodfacts.org/api/v2/product/'+query+'.json?fields='+fields:'https://world.openfoodfacts.org/cgi/search.pl?'+new URLSearchParams({search_terms:[shop,query].filter(Boolean).join(' '),search_simple:'1',action:'process',json:'1',page_size:'20',fields});
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),15000);
    try{const r=await fetch(url,{signal:ctl.signal});if(!r.ok)throw Error('product lookup failed');const data=await r.json();return (barcode?[data.product]:data.products||[]).map(product).filter(Boolean).slice(0,20);}finally{clearTimeout(timer);}
  }
  return {version:1,read,identity,saved,product,valid,search,shops:['Lidl','Tesco','SPAR']};
})();
