/* Shared page lock: nested dialogs retain one position until all close. */
(function () {
  const owners = new Map();
  let saved, position, backgrounds;
  const properties = ['position', 'top', 'left', 'width', 'overflow'];
  function guard(event) {
    const top = Array.from(owners.keys()).filter(d => d.open).pop();
    const backdropScroll = top && event.target === top && (event.type === 'wheel' || event.type === 'touchmove');
    if (top && (!top.contains(event.target) || backdropScroll || top.classList.contains('closing'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  window.ModalLock = {
    acquire(dialog) {
      if (owners.has(dialog)) return owners.get(dialog);
      if (!owners.size) {
        const body = document.body, root = document.documentElement;
        position = [window.scrollX, window.scrollY];
        saved = properties.map(key => [body, key, body.style.getPropertyValue(key), body.style.getPropertyPriority(key)]);
        saved.push([root, 'overflow', root.style.getPropertyValue('overflow'), root.style.getPropertyPriority('overflow')]);
        backgrounds = Array.from(document.querySelectorAll('#view,#workout,#restbar,#tabbar,#coach,#gate')).map(el => [el, el.inert]);
        backgrounds.forEach(([el]) => { el.inert = true; });
        body.style.position = 'fixed'; body.style.top = -position[1] + 'px';
        body.style.left = -position[0] + 'px'; body.style.width = '100%';
        body.style.overflow = 'hidden'; root.style.overflow = 'hidden';
        ['wheel', 'touchmove', 'click', 'pointerdown'].forEach(type => document.addEventListener(type, guard, {capture:true, passive:false}));
      }
      const release = () => {
        if (!owners.delete(dialog) || owners.size) return;
        saved.forEach(([el, key, value, priority]) => {
          if (value) el.style.setProperty(key, value, priority); else el.style.removeProperty(key);
        });
        backgrounds.forEach(([el, inert]) => { el.inert = inert; });
        ['wheel', 'touchmove', 'click', 'pointerdown'].forEach(type => document.removeEventListener(type, guard, true));
        window.scrollTo(...position);
      };
      owners.set(dialog, release);
      return release;
    }
  };
})();
