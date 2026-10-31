/* Original Reppsy vector movement studies. Joint-constrained two-dimensional
   illustrations, not motion capture. Same renderer supplies stills and playback. */
(function(root){
  const rad=d=>d*Math.PI/180, lerp=(a,b,t)=>a+(b-a)*t;
  const point=(p,l,a)=>[p[0]+l*Math.cos(rad(a)),p[1]+l*Math.sin(rad(a))];
  const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
  const fmt=n=>Math.round(n*10)/10, xy=p=>p.map(fmt).join(' ');
  function ik(a,b,l1,l2,sign=1){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.min(Math.hypot(dx,dy),l1+l2-.01);const angle=Math.atan2(dy,dx)+sign*Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*Math.max(d,.01)))));return[a[0]+l1*Math.cos(angle),a[1]+l1*Math.sin(angle)];}
  function pose(g,t){
    const m=g.mode,v=g.variant;
    let hip=[218,244],shoulder=[218,145],knee=[224,310],ankle=[224,382],hand=[245,242],elbow=[242,194],front=false,bench='',equipment='',weight='',far=true;
    if(['lateral','adductor','rearfly','facepull','pulldown','pullup','legraise','fly'].includes(m)){front=true;knee=[190,315];ankle=[190,382];}
    if(['curl','press','triceps','wrist'].includes(m)){
      if(v==='incline'){hip=[240,255];shoulder=[209,162];bench='inclinecurl';}
      if(v==='seated'||m==='wrist'){hip=[218,255];shoulder=[215,155];knee=[282,277];ankle=[282,382];bench='seat';}
    }
    if(m==='squat'){
      hip=mix([218,228],[172,300],t);ankle=[245,382];knee=ik(hip,ankle,77,77,-1);shoulder=point(hip,99,lerp(-90,-67,t));
      elbow=point(shoulder,43,v==='front'?0:85);hand=v==='front'?point(elbow,43,-135):point(elbow,47,-90);equipment='rack';weight='shoulderbar';
    }else if(m==='hinge'){
      hip=mix([218,228],[177,255],t);ankle=[232,382];knee=ik(hip,ankle,77,77,-1);shoulder=point(hip,99,lerp(-90,-23,t));hand=point(shoulder,100,90);elbow=point(shoulder,50,90);weight='bar';
    }else if(m==='bench'||(m==='fly'&&v==='bench')||(m==='triceps'&&v==='lying')){
      const incline=v.includes('incline')||v==='lying';hip=[262,275];shoulder=point(hip,99,incline?210:180);knee=[320,300];ankle=[320,382];bench=incline?'inclinebench':'flat';front=false;
      if(m==='fly'){hand=mix([110,245],[170,174],t);elbow=ik(shoulder,hand,52,49,-1);weight='dumbbell';}
      else if(m==='triceps'){elbow=point(shoulder,52,-75);hand=point(elbow,49,lerp(-165,-75,t));weight='bar';}
      else{hand=mix([202,235],[shoulder[0]+12,shoulder[1]-100],t);elbow=ik(shoulder,hand,53,50,1);weight=v.includes('bar')?'bar':'dumbbell';}
    }else if(m==='press'){
      hand=mix([260,156],[222,45],t);elbow=ik(shoulder,hand,53,50,1);weight=v==='bar'?'bar':'dumbbell';
    }else if(m==='curl'){
      elbow=point(shoulder,51,86);hand=point(elbow,49,lerp(80,-65,t));weight=v==='bar'?'bar':v==='hammer'?'hammer':'dumbbell';
    }else if(m==='triceps'){
      const overhead=v.startsWith('overhead');elbow=point(shoulder,51,overhead?-88:85);hand=point(elbow,49,overhead?lerp(140,-88,t):lerp(-35,85,t));weight=v==='overheadbar'?'bar':overhead?'lowrope':'highrope';equipment=v==='overheadbar'?'':overhead?'lowbehind':'high';far=v!=='single';
    }else if(m==='row'){
      if(v==='bent'){hip=[184,250];shoulder=point(hip,99,-27);knee=[232,310];ankle=[232,382];hand=mix([shoulder[0]+5,shoulder[1]+100],[207,253],t);weight='bar';}
      else{hip=[220,271];shoulder=[210,172];knee=[290,310];ankle=[337,353];bench='seat';hand=mix([310,192],[226,240],t);equipment=v==='machine'?'chestpad':'low';weight='handle';}
      elbow=ik(shoulder,hand,53,50,1);
    }else if(m==='pulldown'){
      hip=[220,263];shoulder=[220,164];knee=[177,315];ankle=[177,382];bench='frontseat';equipment='pulldown';
      hand=mix(v==='wide'?[115,61]:[163,63],v==='wide'?[115,182]:[163,182],t);elbow=ik([190,164],hand,58,58,-1);weight='widebar';
    }else if(m==='pullup'||m==='legraise'){
      const lift=m==='pullup'?t*100:0;hip=[220,264-lift];shoulder=[220,165-lift];hand=[139,60];elbow=ik([190,shoulder[1]],hand,58,58,-1);equipment='pullup';
      if(m==='legraise'){front=false;hip=[228,244];shoulder=[228,145];hand=[228,48];elbow=[220,97];knee=mix([230,310],[290,239],t);ankle=point(knee,60,90);}else{knee=[199,321-lift];ankle=[199,378-lift];}
    }else if(m==='lateral'){
      if(v==='seated'){hip=[220,265];shoulder=[220,166];knee=[177,317];ankle=[177,382];bench='frontseat';}
      elbow=point([190,shoulder[1]],53,lerp(103,175,t));hand=point(elbow,49,lerp(100,165,t));weight='dumbbell';
    }else if(m==='legpress'){
      hip=[167,300];shoulder=[102,226];knee=mix([200,229],[251,225],t);ankle=mix([264,246],[282,156],t);knee=ik(hip,ankle,80,77,-1);elbow=[133,276];hand=[160,303];equipment='sled';bench='legpress';
    }else if(m==='legcurl'){
      if(v==='lying'){hip=[228,264];shoulder=[129,264];knee=[302,275];ankle=point(knee,70,lerp(0,-105,t));bench='lying';elbow=[105,303];hand=[142,316];}
      else{hip=[174,250];shoulder=[174,151];knee=[250,265];ankle=point(knee,70,lerp(0,90,t));bench='legseat';elbow=[150,200];hand=[171,250];}
      equipment='anklepad';
    }else if(m==='extension'){
      hip=[174,250];shoulder=[174,151];knee=[250,265];ankle=point(knee,70,lerp(90,0,t));elbow=[150,200];hand=[171,250];bench='legseat';equipment='anklepad';
    }else if(m==='calf'){
      const lift=t*20;
      if(v==='seated'){hip=[184,252];shoulder=[184,153];knee=[260,265-lift];ankle=[260,367-lift];bench='legseat';equipment='kneepad';elbow=[217,194];hand=[252,228];}
      else{hip=[218,239-lift];shoulder=[218,140-lift];knee=[224,309-lift];ankle=[224,367-lift];elbow=[262,172-lift];hand=[294,162];equipment='calfmachine';}
      weight='step';
    }else if(m==='crunch'){
      if(v==='floor'){hip=[242,326];shoulder=mix([143,326],[157,287],t);knee=[295,269];ankle=[339,377];bench='mat';elbow=[shoulder[0]+33,shoulder[1]-29];hand=[shoulder[0]+19,shoulder[1]+10];}
      else if(v==='cable'){hip=[219,286];shoulder=point(hip,99,lerp(-75,-30,t));knee=[254,369];ankle=[159,369];hand=[shoulder[0]+10,shoulder[1]-15];elbow=[shoulder[0]+40,shoulder[1]+20];equipment='high';weight='highrope';}
      else{hip=[195,265];shoulder=point(hip,99,lerp(-90,-50,t));knee=[269,290];ankle=[269,381];elbow=[shoulder[0]+45,shoulder[1]+18];hand=[shoulder[0]+27,shoulder[1]-21];bench='legseat';equipment='crunchpad';}
    }else if(m==='adductor'){
      hip=[220,256];shoulder=[220,157];knee=mix([140,302],[205,320],t);ankle=[knee[0],380];bench='frontseat';elbow=[173,207];hand=[173,256];equipment='innerpads';
    }else if(m==='dip'){
      shoulder=mix([222,135],[237,197],t);hip=[shoulder[0]-14,shoulder[1]+98];hand=[245,238];elbow=ik(shoulder,hand,53,50,1);knee=[hip[0]-12,hip[1]+65];ankle=[hip[0]-63,hip[1]+89];equipment='dipbars';
    }else if(m==='fly'){
      front=true;hip=[220,244];shoulder=[220,145];hand=mix([92,153],[211,195],t);elbow=ik([190,145],hand,53,50,-1);equipment='sidecable';weight='handle';far=false;
    }else if(m==='rearfly'){
      hand=mix([230,170],[96,159],t);elbow=ik([190,145],hand,53,50,-1);equipment='twocable';weight='handle';
    }else if(m==='facepull'){
      front=false;hip=[210,244];shoulder=[210,145];hand=mix([311,145],[223,124],t);elbow=ik(shoulder,hand,53,50,1);equipment='facecable';weight='handle';
    }else if(m==='straightpull'){
      hip=[206,244];shoulder=point(hip,99,-70);hand=point(shoulder,100,lerp(-25,100,t));elbow=point(shoulder,51,lerp(-25,100,t));equipment='high';weight='bar';
    }else if(m==='wrist'){
      elbow=[240,234];hand=point([285,245],24,lerp(40,-35,t));equipment='forearm';weight='dumbbell';
    }else if(m==='lunge'){
      hip=mix([220,243],[220,298],t);shoulder=point(hip,99,-90);ankle=[286,382];knee=ik(hip,ankle,80,77,-1);elbow=point(shoulder,50,85);hand=point(elbow,49,v==='bar'?-90:85);weight=v==='bar'?'shoulderbar':'dumbbell';bench=v==='split'?'rearfoot':'';
    }else if(m==='hipthrust'){
      shoulder=[153,241];hip=mix([235,295],[252,241],t);knee=[320,267];ankle=[320,382];elbow=[190,260];hand=hip;bench='hip';weight='hipbar';
    }
    return{hip,shoulder,knee,ankle,elbow,hand,front,bench,equipment,weight,far,mode:m,variant:v,t};
  }
  const line=(a,b,color='#69788a',w=6)=>`<path d="M${xy(a)}L${xy(b)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  const rect=(x,y,w,h,r=5,fill='#475567')=>`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" rx="${r}" fill="${fill}"/>`;
  const circle=(p,r,fill)=>`<circle cx="${fmt(p[0])}" cy="${fmt(p[1])}" r="${r}" fill="${fill}"/>`;
  function limb(a,b,wa,wb,color){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,n=[-dy/d,dx/d],p=(v,w)=>[v[0]+n[0]*w,v[1]+n[1]*w];return `<path d="M${xy(p(a,wa))}Q${xy(p(mix(a,b,.4),wa+2))} ${xy(p(b,wb))}Q${xy(point(b,wb,Math.atan2(dy,dx)*180/Math.PI))} ${xy(p(b,-wb))}Q${xy(p(mix(a,b,.4),-wa-2))} ${xy(p(a,-wa))}Q${xy(point(a,wa,Math.atan2(dy,dx)*180/Math.PI+180))} ${xy(p(a,wa))}Z" fill="${color}" stroke="#293645" stroke-width="1.3"/>`;}
  function flyRender(t){
    const project=([x,y,z])=>[220+78*x+25*y,335-38*y-105*z];
    const arm3=side=>{const a=rad(78*t),b=a+rad(18),s=[side*.28,1,.67],e=[s[0]+side*.55*Math.cos(a),1,.67+.55*Math.sin(a)],w=[e[0]+side*.5*Math.cos(b),1.05,e[2]+.5*Math.sin(b)];return [s,e,w].map(project);};
    const H=project([0,0,.65]),S=project([0,1,.65]),head=project([0,1.35,.65]);
    let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 420"><rect width="440" height="420" rx="24" fill="#edf0ed"/><ellipse cx="230" cy="365" rx="150" ry="15" fill="#d8dfdc"/>';
    const corners=[[-.4,-.2,.5],[.4,-.2,.5],[.4,1.65,.5],[-.4,1.65,.5]].map(project);
    for(const c of [[-.3,0,.5],[.3,1.5,.5]])s+=line(project(c),project([c[0],c[1],0]),'#75828c',7);
    s+=`<path d="M${corners.map(xy).join('L')}Z" fill="#334b5b"/>`;
    for(const side of [-1,1]){const h=project([side*.17,0,.65]),k=project([side*.3,-.55,.45]),a=project([side*.3,-.65,.08]);s+=limb(h,k,15,10,'#aebfc5')+limb(k,a,9,5,'#c8d2d3')+line(a,project([side*.3,-.85,.04]),'#263d50',10);}
    s+=limb(H,S,19,26,'#334b5b')+line([H[0]-13,H[1]],[H[0]+13,H[1]],'#283a4d',19)+limb(S,head,7,10,'#c8d2d3')+`<ellipse cx="${head[0]}" cy="${head[1]}" rx="16" ry="20" fill="#c8d2d3" stroke="#546a78"/>`;
    for(const side of [-1,1]){const [sh,e,w]=arm3(side);s+=limb(sh,e,12,8,'#c8d2d3')+limb(e,w,8,5,'#c8d2d3')+circle(w,6,'#c8d2d3')+line([w[0]-13,w[1]],[w[0]+13,w[1]],'#66798a',5)+rect(w[0]-21,w[1]-10,9,20,3)+rect(w[0]+12,w[1]-10,9,20,3);}
    s+=line([S[0]-15,S[1]+8],[S[0]+12,S[1]+8],'#e98873',5);
    return s+'</svg>';
  }
  function render(g,t=0){
    if(g.mode==='fly'&&g.variant==='bench')return flyRender(Math.max(0,Math.min(1,t)));
    const p=pose(g,Math.max(0,Math.min(1,t))),{hip:H,shoulder:S,knee:K,ankle:A,elbow:E,hand:W}=p;
    let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 420" fill="none"><defs><linearGradient id="atlas-bg" x2="0" y2="1"><stop stop-color="#f5f5f2"/><stop offset="1" stop-color="#e6ebe9"/></linearGradient><linearGradient id="atlas-shirt" x2="1" y2="1"><stop stop-color="#52697d"/><stop offset="1" stop-color="#253749"/></linearGradient></defs><rect width="440" height="420" rx="24" fill="url(#atlas-bg)"/><ellipse cx="225" cy="390" rx="155" ry="12" fill="#d8dfdc"/>';
    // Equipment is drawn before the person, with handles/pads subsequently drawn in front.
    const rail=(a,b)=>line(a,b,'#75828c',9)+line(a,b,'#bac4c8',3);
    if(p.bench){
      if(['flat','inclinebench','lying'].includes(p.bench)){s+=rail([125,375],[148,294])+rail([278,375],[255,294])+line([119,295],[279,295],'#334b5b',16);if(p.bench==='inclinebench')s+=line([157,237],[262,289],'#334b5b',17);}
      else if(p.bench==='mat')s+=rect(92,381,270,7,3,'#91a9a8');
      else if(p.bench==='hip')s+=rect(99,255,79,22)+rail([110,277],[110,382]);
      else if(p.bench==='rearfoot')s+=rect(91,302,75,16)+rail([102,319],[102,382]);
      else if(p.bench==='legpress')s+=line([86,242],[163,319],'#334b5b',20)+rail([160,324],[160,380]);
      else{const front=p.bench==='frontseat',x=front?170:H[0]-26;s+=rect(x,H[1]+15,front?100:92,14,7,'#334b5b')+rail([x+35,H[1]+29],[x+35,380]);if(p.bench!=='frontseat')s+=line([H[0]-22,H[1]+8],[S[0]-22,S[1]+3],'#334b5b',15);}
    }
    if(['high','facecable','low','lowbehind','sidecable','twocable','pulldown'].includes(p.equipment)){
      const x=p.equipment==='lowbehind'?85:363;s+=rail([x,40],[x,380])+rect(x-16,261,32,92,5,'#a7b2b9');for(let i=0;i<6;i++)s+=line([x-13,269+i*13],[x+13,269+i*13],'#75828c',2);
      const y=p.equipment==='low'||p.equipment==='lowbehind'?338:p.equipment==='facecable'||p.equipment==='sidecable'||p.equipment==='twocable'?142:49;
      s+=circle([x,y],10,'#617482')+circle([x,y],4,'#d3dcdc');
      if(p.equipment==='pulldown'){s+=rail([363,49],[220,49])+line([220,49],[220,W[1]],'#8c9ca5',2);}
      else s+=line([x,y],W,'#8c9ca5',2);
      if(p.equipment==='twocable')s+=rail([75,142],[75,380])+line([75,142],[440-W[0],W[1]],'#8c9ca5',2);
    }
    if(p.equipment==='dipbars')s+=rail([126,238],[322,238])+rail([136,238],[136,382])+rail([312,238],[312,382]);
    if(p.equipment==='rack')s+=rail([91,76],[91,381])+rail([350,76],[350,381])+line([93,234],[139,234],'#75828c',7);
    if(p.equipment==='pullup')s+=rail([100,48],[100,382])+rail([340,48],[340,382])+line([100,48],[340,48],'#334b5b',9);
    if(p.equipment==='calfmachine')s+=rail([300,140],[300,382])+line([S[0]-15,S[1]-9],[S[0]+27,S[1]-9],'#334b5b',13)+rail([S[0]+27,S[1]-9],[300,S[1]-9]);
    if(p.equipment==='sled'){s+=rail([180,363],[342,118])+line([A[0]-24,A[1]-26],[A[0]+24,A[1]+26],'#334b5b',15);}
    if(p.equipment==='chestpad')s+=line([S[0]+23,S[1]+12],[S[0]+30,S[1]+64],'#334b5b',14)+rail([S[0]+30,S[1]+64],[S[0]+30,378]);
    if(p.weight==='step')s+=rect(205,377,84,12,3);
    // Tapered anatomical volumes, fabric shorts and shoes, rather than a stick figure.
    const skin='#c8d2d3',farSkin='#95a8af',shirt='url(#atlas-shirt)',active='#e98873';
    const leg=(h,k,a,back)=>limb(h,k,17,11,back?farSkin:skin)+limb(k,a,10,6,back?farSkin:skin)+line([a[0]-5,a[1]+3],[a[0]+19,p.mode==='calf'?372:a[1]+5],back?'#425869':'#263d50',10);
    const arm=(sh,e,w,back)=>limb(sh,e,12,8,back?farSkin:skin)+limb(e,w,8,5,back?farSkin:skin)+circle(w,6,back?farSkin:skin);
    if(p.front){s+=leg([H[0]+16,H[1]],[440-K[0],K[1]],[440-A[0],A[1]],true)+leg([H[0]-16,H[1]],K,A,false);}
    else{const farA=p.mode==='lunge'?(p.variant==='split'?[129,301]:[150,382]):[A[0]-14,A[1]+2],farK=p.mode==='lunge'?ik([H[0]-9,H[1]],farA,78,77,-1):[K[0]-14,K[1]+3];s+=leg([H[0]-9,H[1]],farK,farA,true)+leg(H,K,A,false);}
    const theta=Math.atan2(S[1]-H[1],S[0]-H[0]),nx=-Math.sin(theta),ny=Math.cos(theta),wide=p.front?30:19,at=(p,w)=>[p[0]+nx*w,p[1]+ny*w];
    if(!p.front&&p.far)s+=arm([S[0]-8,S[1]+3],[E[0]-9,E[1]+4],[W[0]-9,W[1]+4],true);
    s+=`<path d="M${xy(at(S,wide))}Q${xy(at(p.mode==='crunch'?(p.variant==='floor'?[S[0]+20,H[1]]:[H[0]+4,S[1]+65]):mix(S,H,.55),wide-4))} ${xy(at(H,17))}L${xy(at(H,-17))}Q${xy(at(p.mode==='crunch'?(p.variant==='floor'?[S[0]+20,H[1]]:[H[0]+4,S[1]+65]):mix(S,H,.5),-wide+5))} ${xy(at(S,-wide))}Q${xy(point(S,8,theta*180/Math.PI))} ${xy(at(S,wide))}Z" fill="${shirt}" stroke="#253749" stroke-width="1.5"/>`;
    s+=line(at(H,-14),at(H,14),'#283a4d',22);
    const neck=point(S,14,theta*180/Math.PI),head=point(S,35,theta*180/Math.PI);
    s+=limb(S,neck,7,7,skin)+`<ellipse cx="${fmt(head[0])}" cy="${fmt(head[1])}" rx="16" ry="20" fill="${skin}" stroke="#546a78" stroke-width="1.5"/>`;
    s+=`<path d="M${fmt(head[0]-15)} ${fmt(head[1]-5)}Q${fmt(head[0]-17)} ${fmt(head[1]-24)} ${fmt(head[0]+2)} ${fmt(head[1]-21)}Q${fmt(head[0]+18)} ${fmt(head[1]-20)} ${fmt(head[0]+16)} ${fmt(head[1]-7)}" fill="#334a59"/>`;
    if(p.front){s+=arm([190,S[1]],E,W,false)+(p.far?arm([250,S[1]],[440-E[0],E[1]],[440-W[0],W[1]],true):'');}
    else s+=arm(S,E,W,false);
    // A restrained highlight identifies the moving region; the full muscle map is a separate view.
    if(['squat','lunge','extension','legpress'].includes(p.mode))s+=line(mix(H,K,.2),mix(H,K,.7),active,6);
    else if(['hinge','legcurl'].includes(p.mode))s+=line(mix(H,K,.22),mix(H,K,.65),active,5);
    else if(p.mode==='calf')s+=line(mix(K,A,.25),mix(K,A,.55),active,6);
    else if(['curl','triceps'].includes(p.mode))s+=line(mix(S,E,.2),mix(S,E,.7),active,5);
    else if(p.mode==='crunch')s+=line(mix(S,H,.45),mix(S,H,.8),active,6);
    else s+=circle(p.front?[190,S[1]]:S,7,active);
    const dumb=(w,hammer=false)=>hammer?line([w[0],w[1]-14],[w[0],w[1]+14],'#66798a',5)+rect(w[0]-9,w[1]-19,18,8,3)+rect(w[0]-9,w[1]+11,18,8,3):line([w[0]-14,w[1]],[w[0]+14,w[1]],'#66798a',5)+rect(w[0]-21,w[1]-10,9,20,3)+rect(w[0]+12,w[1]-10,9,20,3);
    if(['dumbbell','hammer'].includes(p.weight)){s+=dumb(W,p.weight==='hammer');if(p.front)s+=dumb([440-W[0],W[1]],p.weight==='hammer');}
    if(['bar','shoulderbar','hipbar'].includes(p.weight)){const w=p.weight==='hipbar'?H:p.weight==='shoulderbar'?[S[0]+(p.variant==='front'?14:-8),S[1]-4]:W;s+=line([w[0]-43,w[1]],[w[0]+43,w[1]],'#66798a',5)+rect(w[0]-40,w[1]-19,12,38,3)+rect(w[0]+28,w[1]-19,12,38,3);}
    if(p.weight==='widebar')s+=line(W,[440-W[0],W[1]],'#334b5b',6);
    if(p.weight==='handle')s+=circle(W,8,'#334b5b');
    if(p.equipment==='anklepad')s+=circle(A,13,'#334b5b')+circle(A,5,'#b0c0c5');
    if(p.equipment==='kneepad')s+=rect(K[0]-24,K[1]-22,48,14,6);
    if(p.equipment==='innerpads')s+=rect(K[0]+6,K[1]-18,12,34)+rect(440-K[0]-18,K[1]-18,12,34);
    if(p.equipment==='crunchpad')s+=line([S[0]+19,S[1]+16],[S[0]+30,S[1]+53],'#334b5b',15);
    return s+'</svg>';
  }
  root.ExerciseAtlas={pose,render,version:1};
  if(!root.customElements||root.customElements.get('exercise-demo'))return;
  class ExerciseDemo extends HTMLElement{
    connectedCallback(){
      if(this.shadowRoot){document.addEventListener('visibilitychange',this.visibility);this.schedule();return;}
      this.guide=root.EXERCISE_GUIDES?.[this.getAttribute('exercise')];if(!this.guide)return;
      const hu=this.getAttribute('lang')==='hu';this.hu=hu;this.attachShadow({mode:'open'});this.phase=0;this.running=false;this.speed=1;
      this.shadowRoot.innerHTML=`<style>:host{display:block;margin:12px 0 20px;font:inherit;color:inherit}.scene{border-radius:22px;overflow:hidden;background:#ecefeb}.scene svg{display:block;width:100%;max-height:380px}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}button{font:inherit;font-size:.82em;min-height:44px;min-width:44px;flex:1;border:1px solid var(--line,#64717d);background:var(--card,#20262d);color:inherit;border-radius:12px;padding:9px;cursor:pointer}button[aria-pressed=true]{background:var(--acc,#e8a58d);color:var(--acc-ink,#17202a)}button:focus-visible{outline:3px solid var(--acc,#e8a58d);outline-offset:2px}.track{height:3px;background:#80909540;border-radius:4px;margin-top:12px;overflow:hidden}.track i{display:block;height:100%;background:var(--acc,#e8a58d);transform-origin:left;width:100%;transform:scaleX(0)}small{display:block;opacity:.65;margin-top:8px;font-size:.75em}</style><div class="scene" role="img" aria-label="${hu?'Mozgásbemutató':'Movement demonstration'}"></div><div class="track" aria-hidden="true"><i></i></div><nav aria-label="${hu?'Lejátszás':'Playback'}"><button data-do="play" aria-pressed="false">${hu?'Lejátszás':'Play'}</button><button data-do="start">${hu?'Kezdet':'Start'}</button><button data-do="end">${hu?'Végpont':'End'}</button><button data-do="speed" aria-label="${hu?'Lejátszási sebesség':'Playback speed'}">1×</button></nav><small>${hu?'2D mozgásvázlat · a részletes beállítást lent találod':'2D movement study · detailed setup below'}</small>`;
      this.shadowRoot.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;switch(b.dataset.do){case'play':this.running=!this.running;this.last=0;break;case'start':this.running=false;this.phase=0;break;case'end':this.running=false;this.phase=.5;break;case'speed':this.speed=this.speed===1?.5:1;b.textContent=this.speed+'×';break;}this.updateButton();this.draw();this.schedule();});
      this.visibility=()=>{this.last=0;if(!document.hidden)this.schedule();else cancelAnimationFrame(this.frame);};document.addEventListener('visibilitychange',this.visibility);this.draw();
    }
    updateButton(){const b=this.shadowRoot.querySelector('[data-do=play]');b.setAttribute('aria-pressed',String(this.running));b.textContent=this.hu?(this.running?'Szünet':'Lejátszás'):(this.running?'Pause':'Play');}
    draw(){const t=(1-Math.cos(this.phase*Math.PI*2))/2;this.shadowRoot.querySelector('.scene').innerHTML=render(this.guide,t);this.shadowRoot.querySelector('.track i').style.transform=`scaleX(${t})`;}
    schedule(){cancelAnimationFrame(this.frame);if(!this.running||document.hidden||!this.isConnected)return;this.frame=requestAnimationFrame(now=>{if(this.last)this.phase=(this.phase+(now-this.last)*this.speed/5000)%1;this.last=now;this.draw();this.schedule();});}
    disconnectedCallback(){cancelAnimationFrame(this.frame);document.removeEventListener('visibilitychange',this.visibility);}
  }
  root.customElements.define('exercise-demo',ExerciseDemo);
})(globalThis);
