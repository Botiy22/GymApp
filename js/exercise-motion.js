/* Three original continuous 2D technique studies. Explicit exercise IDs only.
   The detailed generated stills remain the primary visual references. */
(function(root){
 'use strict';
 const entries={
  Hammer_Curls:{kind:'curl',hu:'Kalapács bicepsz',en:'Hammer curl',cue:{hu:'Felkar stabil · lassú visszaengedés',en:'Keep the upper arm steady · lower slowly'}},
  Side_Lateral_Raise:{kind:'lateral',hu:'Oldalemelés',en:'Lateral raise',cue:{hu:'Enyhén hajlított könyök · vállmagasságig',en:'Soft elbows · stop at shoulder height'}},
  Leg_Extensions:{kind:'extension',hu:'Ülő lábnyújtás',en:'Seated leg extension',cue:{hu:'Térd a gép tengelyénél · medence az ülésen',en:'Align the knee with the pivot · keep hips seated'}}
 };
 const f=n=>Math.round(n*100)/100,xy=p=>p.map(f).join(' '),point=(p,l,a)=>[p[0]+l*Math.cos(a*Math.PI/180),p[1]+l*Math.sin(a*Math.PI/180)];
 const path=(d,fill='none',stroke='#252b30',w=1.5)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const line=(a,b,c='#737b80',w=2)=>path(`M${xy(a)}L${xy(b)}`,'none',c,w);
 const ellipse=(p,rx,ry,fill='#fff',stroke='#252b30')=>`<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
 const rect=(x,y,w,h,r=3,fill='#e4e7e6')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="#596367" stroke-width="1.5"/>`;
 // Tapered curved muscle contours, with the tendon drawn inside the outline.
 function limb(a,b,wa,wb,active=false){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,n=[-dy/len,dx/len];
  const p=(t,w)=>[a[0]+dx*t+n[0]*w,a[1]+dy*t+n[1]*w];
  let s=path(`M${xy(p(0,wa*.55))}C${xy(p(.22,wa*1.15))} ${xy(p(.6,wa))} ${xy(p(1,wb))}Q${xy(p(1.06,0))} ${xy(p(1,-wb))}C${xy(p(.6,-wa*.75))} ${xy(p(.2,-wa))} ${xy(p(0,-wa*.55))}Z`,active?'#e9eeed':'#fafaf7');
  s+=path(`M${xy(p(.16,wa*.35))}Q${xy(p(.5,wa*.65))} ${xy(p(.85,wb*.35))}M${xy(p(.45,-wa*.45))}Q${xy(p(.65,-wa*.4))} ${xy(p(.94,-wb*.3))}`,'none','#747c7b',.8);
  return s;
 }
 function chain(a,b,c,w1=12,w2=7,w3=4){
  const normal=(u,v)=>{const l=Math.hypot(v[0]-u[0],v[1]-u[1]);return[-(v[1]-u[1])/l,(v[0]-u[0])/l];},n=normal(a,b),m=normal(b,c);
  const q=(u,v,t,n,w)=>[u[0]+(v[0]-u[0])*t+n[0]*w,u[1]+(v[1]-u[1])*t+n[1]*w];
  const at=(t,w)=>xy(q(a,b,t,n,w)),bt=(t,w)=>xy(q(b,c,t,m,w));
  let d=`M${at(0,w1*.6)}C${at(.2,w1*1.15)} ${at(.65,w1*.9)} ${at(1,w2)}Q${xy(b)} ${bt(0,w2)}C${bt(.25,w2*1.2)} ${bt(.7,w2*.8)} ${bt(1,w3)}Q${bt(1.08,0)} ${bt(1,-w3)}C${bt(.7,-w2*.6)} ${bt(.3,-w2)} ${bt(0,-w2)}Q${xy(b)} ${at(1,-w2)}C${at(.65,-w1*.8)} ${at(.2,-w1)} ${at(0,-w1*.6)}Q${at(-.05,0)} ${at(0,w1*.6)}Z`;
  return path(d,'#fafaf7')+path(`M${at(.13,w1*.25)}Q${at(.5,w1*.65)} ${at(.86,w2*.2)}M${at(.85,-w2*.5)}Q${xy(b)} ${bt(.2,-w2*.3)}M${bt(.18,w2*.3)}Q${bt(.55,w2*.55)} ${bt(.86,w3*.3)}`,'none','#7b8580',.85);
 }
 function dumbbell(p,angle=0){return `<g transform="translate(${xy(p)}) rotate(${f(angle)})">${rect(-16,-2,32,4,1,'#7c8589')}${rect(-20,-10,7,20,2,'#353e44')}${rect(13,-10,7,20,2,'#353e44')}${line([-17,-7],[-17,7],'#b6bdbf',1)}${line([16,-7],[16,7],'#b6bdbf',1)}</g>`;}
 function shoe(p){return path(`M${f(p[0]-7)} ${f(p[1]-7)}l13 0 14 8q4 5-2 6h-29q-4-1-3-6Z`,'#f4f5f2')+line([p[0]+3,p[1]-3],[p[0]+9,p[1]],'#737b80',1);}
 function torso(side=true){
  if(side)return path('M149 81Q145 89 146 96L134 104Q127 122 129 146L136 183 137 205Q150 217 174 208L178 186 175 158Q188 134 176 109L162 97 162 82','#fafaf7')+
   path('M135 111Q148 106 172 117M137 123Q151 135 176 132M140 139Q153 149 172 145M142 153Q153 157 169 157M143 168Q153 173 169 170M139 186l29 7M151 142l-1 37','none','#818985',.9)+
   path('M147 86Q137 82 138 66Q135 47 148 43Q166 38 171 56l-1 9 6 7-7 3-1 10q-7 7-21 1Z','#fafaf7')+path('M143 60q6-12 20-7M161 64l5 1M160 80h7','none','#818985',.9);
  return path('M190 80v13l-20 9q-8 7-8 20l13 31 4 40-2 14h46l-2-14 4-40 13-31q0-13-8-20l-20-9V80','#fafaf7')+
   path('M169 113q16-9 31 3 15-12 31-3M169 119q13 20 31 5 18 15 31-5M200 112v77M186 143q7-5 14-1 7-4 14 1M186 155q7-5 14-1 7-4 14 1M186 169q7-5 14-1 7-4 14 1M178 186l13 12M222 186l-13 12','none','#7c8581',.9)+
   path('M188 45q12-7 24 0l3 10-2 22-7 9h-12l-7-9-2-22Z','#fafaf7')+path('M189 53q10-6 22 0M192 68h3M205 68h3M197 78h6','none','#818985',.9);
 }
 function scene(id,progress){
  const entry=entries[id];if(!entry)return '';
  const t=Math.max(0,Math.min(1,Number(progress)||0));
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 350" aria-hidden="true"><rect width="400" height="350" fill="#fafaf7"/>'+ellipse([201,329],126,5,'#e8ebe7','none');
  if(entry.kind==='lateral'){
   const leftS=[171,111],leftE=point(leftS,46,106+74*t),leftW=point(leftE,45,100+70*t),mirror=p=>[400-p[0],p[1]];
   for(const x of [185,215])s+=chain([x,215],[x,268],[x,317],15,9,5)+shoe([x,319]);
   s+=torso(false)+path('M177 200q23 6 46 0l5 33-24 2-4-17-4 17-24-2Z','#3d4649')+path('M181 207h38M201 212l3 17','none','#b5bdbb',1);
   for(const flip of [false,true]){const a=flip?mirror(leftS):leftS,b=flip?mirror(leftE):leftE,c=flip?mirror(leftW):leftW;s+=chain(a,b,c,13,8,4)+ellipse(c,5,7)+dumbbell(c,flip?-12*t:12*t);}
  }else if(entry.kind==='curl'){
   s+=chain([147,211],[142,269],[139,317],16,9,5)+shoe([139,319]);
   s+=chain([164,212],[172,268],[176,317],16,9,5)+shoe([176,319]);
   s+=torso()+path('M136 201q20 8 39 0l2 33-22 4-5-12-14 9-6-10Z','#3d4649')+path('M139 209l31 2M154 214l1 15','none','#b5bdbb',1);
   const a=[172,113],b=[180,166],c=point(b,49,79-130*t);
   s+=chain(a,b,c,13,8,4)+dumbbell(c,90)+ellipse(c,5,7)+path(`M${xy(c)}l3 3`,'none','#777',.7);
  }else{
   // Seat and back support; the knee stays at the lever pivot throughout.
   s+=rect(117,102,13,111,5,'#454f52')+rect(130,212,100,14,5,'#454f52')+line([146,226],[140,319],'#858f90',9)+line([210,226],[225,319],'#858f90',9)+line([112,322],[345,322],'#596467',8)+rect(324,183,21,132,4,'#e6e9e5');
   for(let y=200;y<304;y+=13)s+=line([329,y],[340,y],'#a6b0ad',1);
   const knee=[231,219],ankle=point(knee,78,90-83*t);
   s+=torso()+limb([153,209],knee,18,12,true)+path('M136 201q22 8 42-1l35 12-5 23-52-5-20-13Z','#3d4649');
   s+=line(knee,ankle,'#919b9a',7)+limb(knee,ankle,11,5)+shoe(ankle)+ellipse([ankle[0]+8,ankle[1]-3],12,10,'#39464c')+ellipse(knee,5,5,'#a5afad');
   s+=chain([171,115],[184,164],[171,204],11,7,4)+ellipse([171,207],5,7)+line([168,210],[184,210],'#4a5558',5);
  }
  return s+'</svg>';
 }
 root.ExerciseMotion={entries,scene,version:1};
 if(!root.customElements||customElements.get('exercise-motion'))return;
 class ExerciseMotionPlayer extends HTMLElement{
  connectedCallback(){
   if(this.shadowRoot){document.addEventListener('visibilitychange',this.visibility);this.intersection.observe(this);this.dialog=this.closest('dialog');this.dialog?.addEventListener('close',this.onClose);this.last=0;this.schedule();return;}
   this.entry=entries[this.getAttribute('exercise')];if(!this.entry)return;
   this.lang=this.getAttribute('lang')==='hu'?'hu':'en';const hu=this.lang==='hu';
   this.phase=0;this.speed=1;this.running=false;this.last=0;this.attachShadow({mode:'open'});
   this.shadowRoot.innerHTML=`<style>:host{display:block;min-width:0;margin:12px 0 16px;color:var(--ink);font:inherit}button{font:inherit;color:inherit;cursor:pointer;border:1px solid var(--edge);border-radius:12px;background:var(--card);min-height:46px;min-width:0;line-height:1.3}button:focus-visible{outline:2px solid var(--acc-tx);outline-offset:2px}.launch{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:12px 14px;font-weight:600;font-size:.88em}.launch svg{width:22px;height:22px;fill:none;stroke:var(--acc-tx);stroke-width:1.8;flex:none}.launch span{flex:1;text-align:left}.launch[aria-expanded=true]{border-color:var(--acc-tx)}.launch[aria-expanded=true] .chevron{transform:rotate(180deg)}.chevron{transition:transform .2s}section[hidden]{display:none}section{margin-top:10px;border:1px solid var(--edge);border-radius:16px;overflow:hidden}.scene{background:#fafaf7}.scene svg{display:block;width:100%;max-height:310px}.controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:10px}.controls button{font-size:.75em;padding:8px 4px}button[aria-pressed=true]{background:var(--raised);border-color:var(--acc-tx);color:var(--acc-tx)}.cue{font-size:.75em;line-height:1.5;margin:0;padding:0 12px 12px;color:var(--mut)}.progress{height:3px;background:var(--line)}.progress i{display:block;width:100%;height:100%;background:var(--acc-tx);transform-origin:left;transform:scaleX(0)}</style><button class="launch" aria-expanded="false" aria-controls="player"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg><span>${hu?'Mozgásbemutató':'Movement demo'}</span><svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><section id="player" hidden><div class="scene" role="img" aria-label="${this.entry[this.lang]} · ${hu?'2D animáció':'2D animation'}"></div><div class="progress" aria-hidden="true"><i></i></div><nav class="controls" aria-label="${hu?'Lejátszás':'Playback'}"><button data-do="play" aria-pressed="false">${hu?'Lejátszás':'Play'}</button><button data-do="restart">${hu?'Elölről':'Restart'}</button><button data-do="speed" aria-label="${hu?'Lejátszási sebesség':'Playback speed'}">1×</button></nav><p class="cue">${this.entry.cue[this.lang]}</p></section>`;
   this.shadowRoot.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.classList.contains('launch')){const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));this.shadowRoot.querySelector('section').hidden=!open;this.running=open;}
    else if(b.dataset.do==='play')this.running=!this.running;
    else if(b.dataset.do==='restart'){this.phase=0;}
    else if(b.dataset.do==='speed'){this.speed=this.speed===1?.5:1;b.textContent=this.speed+'×';}
    this.last=0;this.update();this.draw();this.schedule();
   });
   this.onClose=()=>{this.running=false;this.last=0;this.update();this.schedule();};this.dialog=this.closest('dialog');this.dialog?.addEventListener('close',this.onClose);
   this.visibility=()=>{this.last=0;this.schedule();};document.addEventListener('visibilitychange',this.visibility);
   this.intersection=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.last=0;this.schedule();});this.intersection.observe(this);this.draw();
  }
  update(){const b=this.shadowRoot.querySelector('[data-do=play]');b.setAttribute('aria-pressed',String(this.running));b.textContent=this.lang==='hu'?(this.running?'Szünet':'Lejátszás'):(this.running?'Pause':'Play');}
  draw(){const t=(1-Math.cos(this.phase*2*Math.PI))/2;this.shadowRoot.querySelector('.scene').innerHTML=scene(this.getAttribute('exercise'),t);this.shadowRoot.querySelector('.progress i').style.transform=`scaleX(${t})`;}
  schedule(){cancelAnimationFrame(this.frame);if(!this.running||document.hidden||this.visible===false||!this.isConnected)return;this.frame=requestAnimationFrame(now=>{if(this.last)this.phase=(this.phase+Math.min(now-this.last,80)*this.speed/5000)%1;this.last=now;this.draw();this.schedule();});}
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.intersection?.disconnect();this.dialog?.removeEventListener('close',this.onClose);document.removeEventListener('visibilitychange',this.visibility);}
 }
 customElements.define('exercise-motion',ExerciseMotionPlayer);
})(globalThis);
