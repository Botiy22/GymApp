/* Touch/keyboard hue control. Only the wheel captures gestures; the page still scrolls elsewhere. */
window.HueWheel=(()=>{
  const pointHue=(x,y,cx,cy)=>((Math.atan2(x-cx,cy-y)*180/Math.PI)+360)%360;
  function update(wheel,hue){
    hue=Math.round(hue)%360;const a=hue*Math.PI/180,thumb=wheel.querySelector('.hue-wheel-thumb');
    wheel.setAttribute('aria-valuenow',hue);wheel.setAttribute('aria-valuetext',hue+'°');
    if(thumb){thumb.style.left=(50+40*Math.sin(a))+'%';thumb.style.top=(50-40*Math.cos(a))+'%';}
    const input=wheel.querySelector('input');if(input)input.value=hue;
  }
  function bind(root){
    let drag=null;
    const emit=(wheel,h,finish=false)=>{update(wheel,h);const input=wheel.querySelector('input');input.dispatchEvent(new Event('input',{bubbles:true}));if(finish)input.dispatchEvent(new Event('change',{bubbles:true}));};
    const fromPoint=(wheel,e)=>{const r=wheel.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;if(Math.hypot(e.clientX-cx,e.clientY-cy)<r.width*.18)return null;return pointHue(e.clientX,e.clientY,cx,cy);};
    root.addEventListener('pointerdown',e=>{const w=e.target.closest?.('.hue-wheel');if(!w||!e.isPrimary||e.button!==0)return;const h=fromPoint(w,e);if(h===null)return;e.preventDefault();w.focus({preventScroll:true});w.setPointerCapture(e.pointerId);drag={w,id:e.pointerId};emit(w,h);});
    root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const h=fromPoint(drag.w,e);if(h!==null)emit(drag.w,h);});
    const end=e=>{if(!drag||drag.id!==e.pointerId)return;const {w}=drag;drag=null;if(w.isConnected)emit(w,+w.getAttribute('aria-valuenow'),true);};
    root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);root.addEventListener('lostpointercapture',end);
    root.addEventListener('keydown',e=>{const w=e.target.closest?.('.hue-wheel');if(!w)return;let h=+w.getAttribute('aria-valuenow'),step=e.shiftKey?10:1;
      if(e.key==='ArrowRight'||e.key==='ArrowUp')h+=step;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')h-=step;else if(e.key==='Home')h=0;else if(e.key==='End')h=359;else return;
      e.preventDefault();emit(w,(h+360)%360,true);
    });
  }
  return {pointHue,update,bind};
})();
