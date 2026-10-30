/* Shared touch-friendly single-choice dropdowns. Original controls keep their form data and handlers. */
window.ChoiceMenus=(()=>{
  'use strict';
  const DOWN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const scope='#view,#sheet,#workout,#gate,#ride-live';
  const buttonGroups='.seg,.chips,.cover-choices,.accent-swatches,.recipe-goals,.planner-view-switch';
  const chipActions=new Set(['lib-mus','lib-grp','fs-brand','fa-set','shop-filter','shop-store','story-duration','ai-answer','ai-g']);
  const pick=e=>e.classList.contains('on')||e.getAttribute('aria-pressed')==='true';
  const caption=e=>e.getAttribute('aria-label')||e.textContent.trim();
  const label=e=>e.getAttribute('aria-label')||e.closest('label')?.querySelector(':scope>span')?.textContent.trim()||e.previousElementSibling?.matches('.lbl,h3,h2')&&e.previousElementSibling.textContent.trim()||'';
  let busy=false,started=false,pendingFocus=null;
  function excluded(e){return !!e.closest('.workout-menu-nav,.choice-menu,[data-choice-skip]')||!!(e.closest('#sheet')&&document.querySelector('#sheet #oats-sum'));}
  function key(e){return [e.tagName,e.id,e.className,e.name,e.dataset.in,e.dataset.k,e.querySelector('button')?.dataset.a,label(e)].join('|');}
  function shell(source){
    const d=document.createElement('details');d.className='choice-menu';d.dataset.choiceKey=key(source);
    const summary=document.createElement('summary'),value=document.createElement('span');value.className='choice-value';if(source.tagName!=='SELECT'&&source.hasAttribute('aria-label')){const caption=document.createElement('span'),context=document.createElement('small');caption.className='choice-caption';context.className='choice-context';context.textContent=label(source);caption.append(context,value);summary.append(caption);}else summary.append(value);summary.insertAdjacentHTML('beforeend',DOWN);d.append(summary);
    d._source=source;d._label=label(source);d._value=value;d._summary=summary;
    source.before(d);d.append(source);return d;
  }
  function title(d,text){if(d._value.textContent!==text)d._value.textContent=text;const a=(d._label?d._label+': ':'')+text;if(d._summary.getAttribute('aria-label')!==a)d._summary.setAttribute('aria-label',a);}
  function sync(d){
    const s=d._source;if(!s)return;
    if(s.tagName==='SELECT'){
      const signature=JSON.stringify([...s.options].map(o=>[o.textContent,o.value,o.hidden,o.dataset.detail]));
      if(signature!==d._options){d._options=signature;const list=d.querySelector('.choice-options');list.replaceChildren();[...s.options].forEach((o,i)=>{if(o.hidden)return;const b=document.createElement('button');b.type='button';b.dataset.choiceIndex=i;b.textContent=o.textContent;if(o.dataset.detail){const note=document.createElement('small');note.textContent=o.dataset.detail;b.append(note);}list.append(b);});}

      title(d,s.selectedOptions[0]?.textContent.trim()||d._label||'—');
      d._summary.setAttribute('aria-disabled',String(s.disabled));
      d.querySelectorAll('[data-choice-index]').forEach(b=>{const o=s.options[+b.dataset.choiceIndex];if(o){const pressed=String(o.selected),disabled=!!(s.disabled||o.disabled||o.parentElement.disabled);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);if(b.disabled!==disabled)b.disabled=disabled;}});
    }else{const b=[...s.querySelectorAll(':scope>button')].find(pick);title(d,b?caption(b):d._label||'—');}
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
          const d=shell(g);g.classList.add('choice-options');if(g.matches('.accent-swatches'))bs.forEach(b=>{const text=document.createElement('span');text.textContent=caption(b);b.append(text);});sync(d);
        });
      });
      root.querySelectorAll('.choice-menu').forEach(sync);
      if(pendingFocus){if(Date.now()>pendingFocus.until)pendingFocus=null;else if(!pendingFocus.d.isConnected){const next=[...document.querySelectorAll('.choice-menu')].find(x=>x.dataset.choiceKey===pendingFocus.key);if(next){next._summary.focus({preventScroll:true});pendingFocus=null;}}}
    }finally{busy=false;}
  }
  function closeOthers(keep){document.querySelectorAll('.choice-menu[open],.workout-menu[open]').forEach(d=>{if(d!==keep&&!d.contains(keep))d.open=false;});}
  function restore(d){pendingFocus={d,key:d.dataset.choiceKey,until:Date.now()+1500};queueMicrotask(()=>{enhance();const current=d.isConnected?d:[...document.querySelectorAll('.choice-menu')].find(x=>x.dataset.choiceKey===d.dataset.choiceKey);current?._summary.focus({preventScroll:true});});}
  function start(){
    if(started)return;started=true;enhance();
    new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.matches?.('.choice-options>button,select,option')))enhance();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','selected','disabled','aria-pressed']});
    document.addEventListener('click',e=>{
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
  return {start,enhance};
})();
