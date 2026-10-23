/* Small guide drawings for recipe steps (original, two-tone). CookArt.kind(text) picks one from the English step text;
   a recipe can name them itself with `art: ['mash', 'oven', ...]`. */
globalThis.CookArt = (() => {
  'use strict';
  // Each drawing: viewBox 0 0 64 64. "f" parts are filled with the soft accent tint, "s" parts are ink strokes.
  const A = {
    gather: { f: '<rect x="10" y="22" width="44" height="30" rx="6"/>', s: '<rect x="10" y="22" width="44" height="30" rx="6"/><path d="M20 22v-6a12 12 0 0 1 24 0v6M22 34h20M22 42h12"/>' },
    mash: { f: '<path d="M8 34h48a24 18 0 0 1-48 0Z"/>', s: '<path d="M8 34h48a24 18 0 0 1-48 0ZM20 56h24M40 8 30 30M24 30h12"/><circle cx="26" cy="38" r="1.6"/><circle cx="34" cy="40" r="1.6"/><circle cx="40" cy="37" r="1.6"/>' },
    mix: { f: '<path d="M8 34h48a24 18 0 0 1-48 0Z"/>', s: '<path d="M8 34h48a24 18 0 0 1-48 0ZM20 56h24M44 6 34 30"/><path d="M33 30c-6-2-9-8-5-12s10-1 9 5-2 8-4 7"/><path d="M22 42c4 3 12 3 16 0"/>' },
    pour: { f: '<path d="M10 44h30l-4 14H14Z"/>', s: '<path d="M10 44h30l-4 14H14ZM30 8h18l-3 18H33ZM45 14h6v6h-7M33 26c-3 3-6 8-8 16"/>' },
    season: { f: '<rect x="22" y="22" width="20" height="32" rx="5"/>', s: '<rect x="22" y="22" width="20" height="32" rx="5"/><path d="M25 22v-6h14v6M29 11l-1-4M35 11l1-4M32 10V5"/><path d="M27 34h10M27 41h10"/>' },
    oven: { f: '<rect x="14" y="22" width="36" height="26" rx="4"/>', s: '<rect x="8" y="8" width="48" height="48" rx="6"/><rect x="14" y="22" width="36" height="26" rx="4"/><path d="M14 15h16M18 40c4-8 24-8 28 0"/><circle cx="42" cy="15" r="2"/><circle cx="49" cy="15" r="2"/>' },
    airfryer: { f: '<path d="M16 26h32v24a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4Z"/>', s: '<path d="M14 10h36a4 4 0 0 1 4 4v38a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4ZM16 26h32M26 34h12M10 20h44"/><circle cx="32" cy="15" r="2.5"/>' },
    pan: { f: '<path d="M6 34h38a19 12 0 0 1-38 0Z"/>', s: '<path d="M6 34h38a19 12 0 0 1-38 0ZM44 36l14-6M16 26c-3-4 3-6 0-10M25 26c-3-4 3-6 0-10M34 26c-3-4 3-6 0-10"/>' },
    knife: { f: '<rect x="6" y="38" width="44" height="16" rx="4"/>', s: '<rect x="6" y="38" width="44" height="16" rx="4"/><path d="M50 46h8M18 34 46 8l4 4-24 26ZM22 46h6M32 46h6"/>' },
    roll: { f: '<path d="M10 30h40v16H10Z"/>', s: '<path d="M10 30h40v16H10Z"/><ellipse cx="10" cy="38" rx="5" ry="8"/><path d="M10 34c3 0 3 8 0 8M22 30v16M34 30v16M4 54h56"/>' },
    cheese: { f: '<path d="M22 8h20l4 40H18Z"/>', s: '<path d="M22 8h20l4 40H18ZM28 18h2M34 24h2M28 30h2M34 36h2M14 58c6-4 30-4 36 0M24 52v4M32 51v5M40 52v4"/>' },
    tray: { f: '<rect x="6" y="20" width="52" height="30" rx="6"/>', s: '<rect x="6" y="20" width="52" height="30" rx="6"/><circle cx="19" cy="30" r="5"/><circle cx="32" cy="30" r="5"/><circle cx="45" cy="30" r="5"/><circle cx="19" cy="42" r="3.5"/><circle cx="32" cy="42" r="3.5"/><circle cx="45" cy="42" r="3.5"/>' },
    juicer: { f: '<path d="M20 30h24l-3 22H23Z"/>', s: '<path d="M16 8h32v12a16 10 0 0 1-32 0ZM20 30h24l-3 22H23ZM32 30v-1M18 58h28M26 12h12"/>' },
    blend: { f: '<path d="M18 12h28l-4 30H22Z"/>', s: '<path d="M18 12h28l-4 30H22ZM16 12h32M22 42l-4 14h28l-4-14M46 18h6v14h-8M26 26l12 6M26 32l12-6"/>' },
    glass: { f: '<path d="M20 22h24l-3 32H23Z"/>', s: '<path d="M18 10h28l-4 46H22ZM20 22h24M38 6l-6 20"/><circle cx="29" cy="34" r="1.6"/><circle cx="35" cy="42" r="1.6"/>' },
    spread: { f: '<rect x="6" y="36" width="52" height="18" rx="4"/>', s: '<rect x="6" y="36" width="52" height="18" rx="4"/><path d="M14 46c8-4 14 4 22 0s12-2 16 0M44 8 30 30M26 34l6-6"/>' },
    serve: { f: '<ellipse cx="32" cy="42" rx="26" ry="10"/>', s: '<ellipse cx="32" cy="42" rx="26" ry="10"/><path d="M18 38c3-12 25-12 28 0M24 24c2-6 8-6 10-2M6 58h52"/>' },
    chill: { f: '<rect x="16" y="8" width="32" height="48" rx="5"/>', s: '<rect x="16" y="8" width="32" height="48" rx="5"/><path d="M16 24h32M22 14v4M22 30v8M32 38v12M27 41l5 4 5-4M27 47l5-4 5 4"/>' },
    timer: { f: '<circle cx="32" cy="36" r="20"/>', s: '<circle cx="32" cy="36" r="20"/><path d="M32 36V24M32 36l8 5M26 8h12M32 8v8"/>' }
  };
  const RULES = [
    ['airfryer', /air ?fryer/i], ['oven', /\boven|bake|baking\b/i], ['juicer', /\bjuic/i], ['blend', /blend|blitz|shake it|smoothie/i],
    ['tray', /muffin|cases|tray of|cupcake/i], ['roll', /\broll\b|roll it|roll up|wrap\b/i], ['cheese', /cheese|grate|parmesan/i],
    ['chill', /fridge|chill|overnight|refrigerat/i], ['mash', /\bmash/i], ['pour', /\bpour|top up|add the milk|add water|coconut water/i],
    ['spread', /spread|flatten|press it|baking paper|sauce on/i], ['season', /season|salt|pepper|spice|paprika/i], ['knife', /\bchop|slice|dice|cut|peel/i],
    ['pan', /\bpan\b|fry|brown|simmer|saut|heat|cook\b|boil/i], ['mix', /mix|stir|combine|whisk|fold/i], ['glass', /glass|ice|serve cold|drink/i],
    ['timer', /minute|rest\b|wait|leave/i], ['serve', /serve|divide|portion|plate|finish|eat/i]
  ];
  const kind = text => { for (const [k, re] of RULES) if (re.test(String(text || ''))) return k; return 'serve'; };
  const svg = (k, label) => {
    const a = A[k] || A.serve;
    return `<svg class="cook-art-svg" viewBox="0 0 64 64" ${label ? `role="img" aria-label="${String(label).replace(/"/g, '&quot;')}"` : 'aria-hidden="true"'}><g class="cook-art-fill">${a.f}</g><g class="cook-art-ink">${a.s}</g></svg>`;
  };
  return { kinds: Object.keys(A), kind, svg };
})();
