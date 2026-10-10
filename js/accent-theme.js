/* Vivid presets keep existing hue identities; custom/legacy soft colors remain compatible. */
window.AccentTheme=(()=>{
  const presets={default:[255,158,96],25:[217,43,65],155:[19,187,130],250:[37,137,245],270:[53,88,244],300:[143,82,233],350:[237,62,148]};
  const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const ink=c=>contrast(c,[255,255,255])>=contrast(c,[12,14,18])?'#ffffff':'#0c0e12';
  function text(c,light){
    const bg=light?[255,255,255]:[30,32,40],end=light?0:255;
    for(let amount=0;amount<=1;amount+=.025){const x=c.map(v=>Math.round(v+(end-v)*amount));if(contrast(x,bg)>=4.5)return x;}
    return [end,end,end];
  }
  const fill=h=>presets[h==null?'default':h]||null;
  return {fill,ink,text,contrast};
})();
