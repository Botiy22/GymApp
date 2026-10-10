/* Detect a newer release without installing it; the service worker verifies all assets on update. */
window.AppUpdates=(()=>{
  const valid=r=>!!r&&/^\d+\.\d+\.\d+$/.test(r.version)&&/^\d{8}\.\d+$/.test(r.build);
  const cacheId=r=>'v'+r.version+'-'+r.build;
  function newer(current,next){
    if(!valid(current)||!valid(next))return false;
    const a=current.version.split('.').map(Number),b=next.version.split('.').map(Number);
    for(let i=0;i<3;i++)if(a[i]!==b[i])return b[i]>a[i];
    const [ad,an]=current.build.split('.').map(Number),[bd,bn]=next.build.split('.').map(Number);
    return bd>ad||bd===ad&&bn>an;
  }
  async function latest(){
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8000);
    try{const response=await fetch('release-manifest.json?check='+Date.now(),{cache:'no-store',signal:abort.signal});if(!response.ok)throw new Error('release unavailable');const r=await response.json();if(!valid(r))throw new Error('invalid release');return r;}
    finally{clearTimeout(timer);}
  }
  return {valid,cacheId,newer,latest};
})();
