/* Visible peer tabs and touch-friendly form dropdowns. Keep original controls and handlers. */
window.ChoiceMenus=(()=>{
  'use strict';
  const DOWN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const scope='#view,#sheet,#workout,#gate,#ride-live';
  const buttonGroups='.seg,.chips,.cover-choices,.accent-swatches,.recipe-goals,.planner-view-switch';
  const chipActions=new Set(['lib-mus','lib-grp','fs-brand','fa-set','shop-filter','shop-store','story-duration','ai-answer','ai-g']);
  const pick=e=>e.classList.contains('on')||e.getAttribute('aria-pressed')==='true';
  const caption=e=>e.getAttribute('aria-label')||e.textContent.trim();
  const label=e=>e.getAttribute('aria-label')||e.closest('label')?.querySelector(':scope>span')?.textContent.trim()||e.previousElementSibling?.matches('.lbl,h3,h2')&&e.previousElementSibling.textContent.trim()||'';
  // Original 24px line pictograms. Stable action/value keys keep EN/HU identical.
  const paths={
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    workout:'<path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/>',
    book:'<path d="M12 5v16M12 5C9 3 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1Z"/>',
    diary:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M8 3v18M3 7h4M3 12h4M3 17h4M12 8h4M12 12h4"/>',
    food:'<path d="M4 3v6c0 3 6 3 6 0V3M7 3v18M19 21V3c-4 2-5 6-4 10h4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 17h3"/>',
    check:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m7 12 3 3 7-7"/>',
    chart:'<path d="M4 3v18h17M8 16v-4M13 16V8M18 16V5"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    friends:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v2"/>',
    rank:'<path d="M6 3h12v7a6 6 0 0 1-12 0ZM6 5H3v3a4 4 0 0 0 4 4M18 5h3v3a4 4 0 0 1-4 4M12 16v5M8 21h8"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    history:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2"/>',
    bike:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 4-9 5 9H5M9 8h8l2 9M15 4h3l-1 4M7 5h4"/>',
    swim:'<circle cx="17" cy="7" r="2"/><path d="m4 13 6-6 4 4M10 7 7 4l-4 1M2 16q3-3 5 0t5 0 5 0 5 0M2 21q3-3 5 0t5 0 5 0 5 0"/>',
    body:'<circle cx="12" cy="4" r="2"/><path d="m5 8 7 2 7-2M12 7v8M12 15l-5 7M12 15l5 7"/>',
    play:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    down:'<path d="m3 6 6 6 4-4 8 8M15 16h6v-6"/>',
    up:'<path d="M4 20 20 4M12 4h8v8"/>',
    balance:'<path d="M12 3v18M6 21h12M4 7h16M5 7l-3 7h6ZM19 7l-3 7h6Z"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a3 3 0 0 0 3-3c0-4-4-7-9-7Z"/><circle cx="7" cy="9" r=".8"/><circle cx="10" cy="6" r=".8"/><circle cx="15" cy="6" r=".8"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    moon:'<path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    sliders:'<path d="M3 6h6M15 6h6M3 12h12M21 12h-1M3 18h2M11 18h10"/><circle cx="12" cy="6" r="3"/><circle cx="17" cy="12" r="3"/><circle cx="8" cy="18" r="3"/>',
    star:'<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    photo:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
    chat:'<path d="M3 4h18v13H9l-5 4v-4H3ZM7 8h10M7 12h6"/>',
    heart:'<path d="M12 21 3 12a5 5 0 0 1 9-7 5 5 0 0 1 9 7Z"/>',
    water:'<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13ZM8 15a4 4 0 0 0 4 4"/>',
    shop:'<path d="M3 4h2l3 12h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>'
  };
  const iconsByAction={
    'food-view':{diary:'diary',plan:'calendar',ideas:'book',videos:'play'},
    'workout-view':{train:'workout',plans:'calendar',history:'history',exercises:'search',stability:'body',ride:'bike',swim:'swim'},
    'profile-view':{overview:'user',ranks:'rank',friends:'friends'},
    'goals-view':{planner:'calendar',habits:'check',progress:'chart'},
    'planner-view':{agenda:'diary',day:'clock',week:'calendar'},
    'fa-unit':{dl:'water',g:'balance'},
    'ex-visual':{muscles:'body',movement:'play'},
    'recipe-goal':{'':'grid',loss:'down',maintain:'balance',bulk:'up',muscle:'workout'},
    'idea-cat':{'':'grid',breakfast:'sun',main:'food',snack:'book',drink:'water'},
    'settings-jump':{appearance:'palette',workout:'workout',nutrition:'food',data:'database'},
    'set-bg':{light:'sun',deep:'moon',plain:'moon',aurora:'palette'},
    'prog':{overview:'chart',history:'history'},
    'stability-view':{stability:'body',knee:'heart'}
  };
  const icon=(name)=>`<span class="menu-pictogram" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.sliders}</svg></span>`;
  function iconName(source,option){
    const d=option?.dataset||source.dataset,a=d.a||source.dataset.a||'',v=source.tagName==='SELECT'?(option?.value??''):(d.v??d.goal??d.c??d.g??d.m??'');
    if(d.icon)return paths[d.icon]?d.icon:'sliders';
    if(iconsByAction[a]?.[v])return iconsByAction[a][v];
    if(/lang/.test(a))return 'globe';
    if(/accent|style|material|cover/.test(a)||source.matches('.accent-swatches,.cover-choices'))return 'palette';
    if(/audience/.test(a))return v==='me'?'lock':v==='friends'?'friends':'globe';
    if(/lib-mus|lib-grp|muscle/.test(a))return v==='fav'?'star':v==='all'||v===''?'grid':'body';
    if(/recipe/.test(a))return 'book';
    if(/shop|fs-brand/.test(a))return 'shop';
    if(/gate-mode/.test(a))return 'user';
    if(/story|compose/.test(a))return 'photo';
    const field=[source.name,source.dataset.in,source.dataset.k].filter(Boolean).join(' ');
    if(/goal/.test(field))return v==='cut'?'down':v==='bulk'?'up':'target';
    if(/sex|gender/.test(field))return 'user';
    if(/pool/.test(field))return 'swim';
    if(/type|activity/.test(field)&&['walk','incline','run','bike','swim','stairs'].includes(v))return v==='swim'?'swim':v==='bike'?'bike':'body';
    if(/meal|food|unit/.test(field))return 'food';
    if(/sort/.test(field))return 'sliders';
    if(/day|week|date/.test(field))return 'calendar';
    if(/time|rest|duration/.test(field))return 'clock';
    if(/intensity|activity|equipment/.test(field))return 'workout';
    if(/friend|discovery/.test(field))return 'friends';
    return 'sliders';
  }
  function decorateOption(b,source,option=b){
    if(b.querySelector(':scope>.menu-pictogram')||source.matches('.accent-swatches,.cover-choices'))return;
    // Preserve original buttons, listeners, text and form data.
    if(!b.querySelector(':scope>svg')||b.closest('.workout-menu-items'))b.insertAdjacentHTML('afterbegin',icon(iconName(source,option)));
  }
  function decorateNavigation(root){
    root.querySelectorAll('.settings-jumps button,.workout-menu-items button').forEach(b=>decorateOption(b,b));
    root.querySelectorAll(`${scope.split(',').map(s=>s+' details:not(.choice-menu):not(.workout-menu)>summary').join(',')}`).forEach(s=>{
      if(s.querySelector('.menu-pictogram')||s.closest('[data-choice-skip]'))return;
      const key=s.parentElement.dataset.section||s.parentElement.className;
      const name=/account|profile/.test(key)?'user':/appearance|accent|style/.test(key)?'palette':/nutrition|meal/.test(key)?'food':/workout|routine/.test(key)?'workout':/rank|lift|achievement|badge/.test(key)?'rank':/friend|contact|competition/.test(key)?'friends':/data/.test(key)?'database':/ai|chat/.test(key)?'chat':/goal|habit/.test(key)?'target':'sliders';
      s.insertAdjacentHTML('afterbegin',icon(name));s.classList.add('pictogram-summary');
    });
  }
  let busy=false,started=false,pendingFocus=null,segmentFocus=null;
  function segments(g,bs){
    g.classList.add('choice-segments');
    const columns=Math.min(bs.length,3);if(g.style.getPropertyValue('--choice-columns')!==String(columns))g.style.setProperty('--choice-columns',columns);
    if(bs.length>3)g.classList.add('choice-many');
    bs.forEach(b=>{decorateOption(b,g);const pressed=String(pick(b));if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);});
  }
  function excluded(e){return !!e.closest('.workout-menu-nav,.choice-menu,[data-choice-skip]')||!!(e.closest('#sheet')&&document.querySelector('#sheet #oats-sum'));}
  function key(e){return [e.tagName,e.id,e.className,e.name,e.dataset.in,e.dataset.k,e.querySelector('button')?.dataset.a,label(e)].join('|');}
  function shell(source){
    const d=document.createElement('details');d.className='choice-menu';d.dataset.choiceKey=key(source);
    const summary=document.createElement('summary'),value=document.createElement('span');value.className='choice-value';if(source.tagName!=='SELECT'&&source.hasAttribute('aria-label')){const caption=document.createElement('span'),context=document.createElement('small');caption.className='choice-caption';context.className='choice-context';context.textContent=label(source);caption.append(context,value);summary.append(caption);}else summary.append(value);summary.insertAdjacentHTML('afterbegin',icon('sliders'));summary.insertAdjacentHTML('beforeend','<span class="choice-chevron" aria-hidden="true">'+DOWN+'</span>');d.append(summary);
    d._source=source;d._label=label(source);d._value=value;d._summary=summary;
    source.before(d);d.append(source);return d;
  }
  function title(d,text){if(d._value.textContent!==text)d._value.textContent=text;const a=(d._label?d._label+': ':'')+text;if(d._summary.getAttribute('aria-label')!==a)d._summary.setAttribute('aria-label',a);}
  function sync(d){
    const s=d._source;if(!s)return;
    if(s.tagName==='SELECT'){
      const signature=JSON.stringify([...s.options].map(o=>[o.textContent,o.value,o.hidden,o.dataset.detail]));
      if(signature!==d._options){d._options=signature;const list=d.querySelector('.choice-options');list.replaceChildren();[...s.options].forEach((o,i)=>{if(o.hidden)return;const b=document.createElement('button');b.type='button';b.dataset.choiceIndex=i;const copy=document.createElement('span');copy.className='choice-option-copy';copy.textContent=o.textContent;b.append(copy);if(o.dataset.detail){const note=document.createElement('small');note.textContent=o.dataset.detail;copy.append(note);}decorateOption(b,s,o);list.append(b);});}

      title(d,s.selectedOptions[0]?.textContent.trim()||d._label||'—');
      d._summary.setAttribute('aria-disabled',String(s.disabled));
      d.querySelectorAll('[data-choice-index]').forEach(b=>{const o=s.options[+b.dataset.choiceIndex];if(o){const pressed=String(o.selected),disabled=!!(s.disabled||o.disabled||o.parentElement.disabled);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);if(b.disabled!==disabled)b.disabled=disabled;}});
    }else{const bs=[...s.querySelectorAll(':scope>button')];bs.forEach(b=>decorateOption(b,s));const b=bs.find(pick);title(d,b?caption(b):d._label||'—');}
    const selected=s.tagName==='SELECT'?s.selectedOptions[0]:[...s.querySelectorAll(':scope>button')].find(pick);
    const name=iconName(s,selected);if(d._icon!==name){d._icon=name;d._summary.querySelector('.menu-pictogram').outerHTML=icon(name);}
  }
  function enhance(root=document){
    if(busy)return;busy=true;
    try{
      root.querySelectorAll(scope).forEach(area=>{
        area.querySelectorAll('select').forEach(s=>{
          if(excluded(s)||s.multiple||s.size>1)return;
          const d=shell(s);s.classList.add('choice-native');s.tabIndex=-1;s.setAttribute('aria-hidden','true');
          const list=document.createElement('div');list.className='choice-options';d.append(list);

          s.addEventListener('invalid',e=>{e.preventDefault();d.open=true;d._summary.focus();});
          s.addEventListener('click',e=>{e.preventDefault();if(!s.disabled){d.open=true;d._summary.focus();}});sync(d);
        });
        area.querySelectorAll(buttonGroups).forEach(g=>{
          if(excluded(g))return;
          const bs=[...g.children].filter(e=>e.tagName==='BUTTON');if(bs.length<2||bs.length!==g.children.length)return;
          if(g.matches('.chips')&&!bs.every(b=>chipActions.has(b.dataset.a)))return;
          const selected=bs.filter(pick);if(selected.length>1)return;
          if(g.matches('.seg,.recipe-goals,.planner-view-switch')||bs.every(b=>['lib-mus','lib-grp'].includes(b.dataset.a))){segments(g,bs);return;}
          const d=shell(g);g.classList.add('choice-options');if(g.matches('.accent-swatches'))bs.forEach(b=>{const text=document.createElement('span');text.textContent=caption(b);b.append(text);});sync(d);
        });
      });
      root.querySelectorAll('.choice-menu').forEach(sync);
      decorateNavigation(root);
      if(segmentFocus){const f=segmentFocus;if(Date.now()>f.until)segmentFocus=null;else if(!f.group.isConnected){const g=[...document.querySelectorAll('.choice-segments')].find(g=>key(g)===f.key);if(g){g.querySelectorAll(':scope>button')[f.index]?.focus({preventScroll:true});segmentFocus=null;}}}
      if(pendingFocus){if(Date.now()>pendingFocus.until)pendingFocus=null;else if(!pendingFocus.d.isConnected){const next=[...document.querySelectorAll('.choice-menu')].find(x=>x.dataset.choiceKey===pendingFocus.key);if(next){next._summary.focus({preventScroll:true});pendingFocus=null;}}}
    }finally{busy=false;}
  }
  function closeOthers(keep){document.querySelectorAll('.choice-menu[open],.workout-menu[open]').forEach(d=>{if(d!==keep&&!d.contains(keep))d.open=false;});}
  function restore(d){pendingFocus={d,key:d.dataset.choiceKey,until:Date.now()+1500};queueMicrotask(()=>{enhance();const current=d.isConnected?d:[...document.querySelectorAll('.choice-menu')].find(x=>x.dataset.choiceKey===d.dataset.choiceKey);current?._summary.focus({preventScroll:true});});}
  function start(){
    if(started)return;started=true;enhance();
    new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.matches?.('.choice-options>button,select,option')))enhance();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','selected','disabled','aria-pressed']});
    document.addEventListener('click',e=>{
      const segment=e.target.closest?.('.choice-segments'),option=e.target.closest?.('.choice-segments>button');
      if(segment&&option&&!option.disabled){segmentFocus={group:segment,key:key(segment),index:[...segment.children].indexOf(option),until:Date.now()+1500};queueMicrotask(()=>enhance());}
      const d=e.target.closest?.('.choice-menu');closeOthers(d||e.target.closest?.('.workout-menu'));
      if(!d)return;
      if(e.target.closest('summary')&&d._source.disabled){e.preventDefault();return;}
      const b=e.target.closest('.choice-options>button');if(!b||b.disabled)return;
      d.open=false;
      if(b.dataset.choiceIndex!=null){
        e.preventDefault();const s=d._source;s.selectedIndex=+b.dataset.choiceIndex;sync(d);
        s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));
      }
      restore(d);
    },true);
    document.addEventListener('input',e=>{const d=e.target.closest?.('.choice-menu');if(d)sync(d);});
    document.addEventListener('keydown',e=>{
      const segment=e.target.closest?.('.choice-segments');
      if(segment&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
        const bs=[...segment.querySelectorAll(':scope>button:not(:disabled)')];if(!bs.length)return;
        const n=bs.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?bs.length-1:e.key==='ArrowRight'?(n+1)%bs.length:(n+bs.length-1)%bs.length;
        e.preventDefault();bs[next].focus();return;
      }
      const workout=e.target.closest?.('.workout-menu');
      if(workout){
        const summary=workout.querySelector('summary'),buttons=[...workout.querySelectorAll('button:not(:disabled)')];
        if(e.key==='Escape'&&workout.open){e.preventDefault();e.stopPropagation();workout.open=false;summary.focus();return;}
        if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&buttons.length){e.preventDefault();workout.open=true;closeOthers(workout);const n=buttons.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?(n+1)%buttons.length:(n<0?buttons.length-1:(n+buttons.length-1)%buttons.length);buttons[next].focus();return;}
      }
      const d=e.target.closest?.('.choice-menu');if(!d)return;
      if(e.key==='Escape'&&d.open){e.preventDefault();e.stopPropagation();d.open=false;d._summary.focus();return;}
      const bs=[...d.querySelectorAll('.choice-options>button:not(:disabled)')];if(!bs.length)return;
      let n=bs.indexOf(document.activeElement),next=null;
      if(e.key==='ArrowDown')next=(n+1)%bs.length;
      if(e.key==='ArrowUp')next=(n+bs.length-1)%bs.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=bs.length-1;
      if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key!==' ')next=bs.findIndex((b,i)=>i>n&&caption(b).toLocaleLowerCase().startsWith(e.key.toLocaleLowerCase()));
      if(next!=null&&next>=0){e.preventDefault();d.open=true;closeOthers(d);bs[next].focus();}
    },true);
    document.addEventListener('reset',()=>queueMicrotask(()=>document.querySelectorAll('.choice-menu').forEach(sync)));
  }
  return {start,enhance,version:3};
})();
