/* Restaurant menu items with the chain's own published nutrition, per portion as sold. They join the offline food database
   (js/food-query.js adds them to data/food-lexicon.js when it installs), so "whopper", "6 db king nuggets" or "közepes bk krumpli" are answered exactly.
   Each row: [name, English name, portion g (or ml), kcal, protein g, carbs g, fat g, extra names, options].
   options: pcs = pieces in that portion (gives a per-piece weight; box = the usual box when no number is given), ml = drink (portion in ml, density 1), replace = existing
   database name that gets these official values, fix/fixEn = a note where the source itself is inconsistent, odd = printed values
   that do not add up and are kept as printed (the coffees).
   Promotions and limited items are not in the source tables. Values change with recipes: check the chain's current table. */
window.RESTAURANT_FOODS = (() => {
  const BK = { name: 'Burger King', short: ['bk'], ref: 'Burger King Magyarország tápanyag- és allergéntáblázat, burgerking.hu (2024.12.16.)', refEn: 'Burger King Hungary nutrition and allergen table, burgerking.hu (16 Dec 2024)' };
  const bk = [
    ['Whopper', 'Whopper', 332.5, 731.8, 36.6, 50.7, 41.9, 'whopper|whoppert|sima whopper', { replace: 'Whopper (Burger King)' }],
    ['Dupla Whopper', 'Double Whopper', 558.5, 1396.3, 90.9, 50.7, 91.6, 'dupla whopper|double whopper'],
    ['Whopper sajttal', 'Whopper with cheese', 342.6, 812.0, 41.1, 50.4, 47.6, 'sajtos whopper|whopper cheese|whopper with cheese'],
    ['Whopper baconnel és sajttal', 'Bacon & cheese Whopper', 370.3, 873.7, 45.0, 51.6, 53.3, 'baconos sajtos whopper|bacon cheese whopper|whopper bacon'],
    ['Whopper Junior', 'Whopper Jr.', 167.0, 368.1, 16.7, 30.3, 19.1, 'whopper jr|whopper junior|junior whopper'],
    ['Plant-Based Whopper', 'Plant-Based Whopper', 329.0, 624.4, 30.7, 53.4, 29.7, 'plant based whopper|vegan whopper|növényi whopper'],
    ['Vegetáriánus Whopper', 'Vegetarian Whopper', 332.0, 594.9, 12.7, 71.1, 27.7, 'vega whopper|vegetarian whopper'],
    ['Gluténmentes Whopper', 'Gluten-free Whopper', 323.5, 803.9, 31.5, 58.9, 47.0, 'gluten free whopper'],
    ['Dupla sajtburger', 'Double cheeseburger', 189.6, 524.6, 32.6, 30.1, 29.6, 'bk dupla sajtburger|bk double cheeseburger|burger king dupla sajtburger'],
    ['Dupla sajtburger bacon', 'Double bacon cheeseburger', 199.6, 566.1, 35.2, 30.1, 33.1, 'bk baconos dupla sajtburger|bk double bacon cheeseburger'],
    ['Sajtburger', 'Cheeseburger', 129.5, 340.3, 18.6, 29.7, 15.7, 'bk sajtburger|burger king sajtburger|bk cheeseburger'],
    ['Hamburger', 'Hamburger', 117.0, 297.0, 16.2, 29.3, 12.3, 'bk hamburger|burger king hamburger'],
    ['Chili cheese burger', 'Chili cheese burger', 129.0, 355.9, 16.3, 29.0, 18.9, 'chili cheese burger|chilis sajtos burger|bk chili cheese burger'],
    ['Dupla chili cheese burger', 'Double chili cheese burger', 159.6, 608.7, 32.8, 30.3, 38.7, 'dupla chili cheese burger|double chili cheese'],
    ['XTRA Long Chili Cheese', 'XTRA Long Chili Cheese', 295.0, 845.3, 47.6, 41.7, 53.3, 'xtra long chili cheese|extra long chili cheese|xtra long'],
    ['King Deluxe csirkemell', 'King Deluxe chicken', 275.0, 557.0, 25.8, 56.3, 24.1, 'king deluxe|king deluxe csirke|king deluxe chicken'],
    ['Chicken Royal', 'Chicken Royal', 272.0, 598.0, 23.0, 49.5, 32.8, 'chicken royal|csirke royal'],
    ['Crispy Chicken', 'Crispy Chicken', 156.0, 413.1, 11.2, 38.7, 23.7, 'crispy chicken|bk crispy chicken',
      { fix: 'a táblázat 46,9 g zsírt ír, ami nem fér bele a 413 kcal-ba; a zsírt az energiából számoltuk vissza', fixEn: 'the table prints 46.9 g fat, which cannot fit in 413 kcal; fat was calculated back from the energy' }],
    ['Chili Cheese Crispy Chicken', 'Chili Cheese Crispy Chicken', 136.0, 374.4, 11.0, 40.4, 18.1, 'chili cheese crispy chicken'],
    ['Classic Chicken Jr.', 'Classic Chicken Jr.', 195.0, 379.9, 31.0, 31.9, 13.4, 'classic chicken jr|classic chicken junior|chicken jr'],
    ['BBQ Chicken Jr.', 'BBQ Chicken Jr.', 216.5, 441.3, 33.6, 36.4, 16.9, 'bbq chicken jr|bbq chicken junior'],
    ['Nuggets Burger', 'Nuggets Burger', 134.0, 396.7, 10.9, 38.4, 21.6, 'nuggets burger|nuggetsburger'],
    ['Kids sajtburger', 'Kids cheeseburger', 119.5, 337.6, 18.5, 29.7, 15.5, 'kids sajtburger|gyerek sajtburger|kids cheeseburger'],
    ['Kids hamburger', 'Kids hamburger', 107.0, 294.3, 16.1, 29.2, 12.2, 'kids hamburger|gyerek hamburger'],
    ['Bacon King', 'Bacon King', 423.9, 1288.3, 79.4, 52.0, 83.4, 'bacon king'],
    ['Bacon King Jr.', 'Bacon King Jr.', 210.6, 644.4, 37.7, 31.2, 40.3, 'bacon king jr|bacon king junior'],
    ['Chili Cheese Bacon King', 'Chili Cheese Bacon King', 441.4, 1345.8, 79.7, 50.3, 90.3, 'chili cheese bacon king'],
    ['Chicken Bacon King', 'Chicken Bacon King', 288.4, 773.3, 39.1, 70.1, 36.5, 'chicken bacon king'],
    ["King's Angry Andalouse", "King's Angry Andalouse", 390.7, 868.7, 35.1, 50.0, 56.9, 'angry andalouse|kings angry andalouse|king s angry andalouse'],
    ["King's Whisky BBQ", "King's Whisky BBQ", 404.7, 889.6, 38.9, 72.3, 47.4, 'whisky bbq|kings whisky bbq|king s whisky bbq'],
    ['Fondue Lover', 'Fondue Lover', 478.5, 1187.8, 77.5, 51.2, 76.8, 'fondue lover'],
    ['Chicken Fondue Lover', 'Chicken Fondue Lover', 343.0, 672.8, 37.2, 69.3, 29.9, 'chicken fondue lover'],
    ['Sajtos toast', 'Cheese toast', 74.6, 230.5, 9.3, 28.0, 8.4, 'bk sajtos toast|bk sajtos tost'],
    ['Baconös-sajtos toast', 'Bacon & cheese toast', 87.6, 285.8, 12.8, 28.0, 13.0, 'bk baconos sajtos toast|bk bacon cheese toast'],
    ['Baconös-tojásos szendvics', 'Bacon & egg sandwich', 167.5, 395.4, 16.1, 39.7, 17.3, 'baconos tojasos szendvics|bk bacon egg sandwich|bk reggeli szendvics'],
    ['King saláta', 'King salad', 233.0, 119.8, 8.2, 5.7, 5.5, 'king salata|bk salata|king salad|burger king salata'],
    ['King saláta feltét: marhahús', 'King salad topping: beef', 176.0, 332.2, 27.1, 0.0, 24.9, 'king salata marhahussal|salata marhahus feltet'],
    ['King saláta feltét: Deluxe csirkemell', 'King salad topping: Deluxe chicken', 116.0, 236.6, 18.9, 19.0, 9.6, 'king salata deluxe csirkemellel|salata deluxe csirke feltet'],
    ['Kis saláta', 'Side salad', 162.0, 29.3, 2.1, 1.8, 0.1, 'bk kis salata|kis salata burger king'],
    ['Kis burgonya', 'Small fries', 74.0, 108.0, 2.4, 17.5, 3.1, 'bk kis krumpli|bk kis sult krumpli|burger king kis krumpli|bk small fries'],
    ['Közepes burgonya', 'Medium fries', 116.0, 169.4, 3.8, 27.5, 4.9, 'bk krumpli|bk sult krumpli|bk kozepes krumpli|bk kozepes sult krumpli|burger king krumpli|burger king sult krumpli|bk fries|bk medium fries', { replace: 'Sült krumpli (Burger King)' }],
    ['XXL burgonya', 'XXL fries', 248.0, 362.1, 8.2, 58.8, 10.4, 'xxl burgonya|xxl krumpli|xxl sult krumpli|bk xxl krumpli|bk nagy krumpli|xxl fries'],
    ['Édesburgonya', 'Sweet potato fries', 100.0, 162.0, 1.2, 28.6, 4.8, 'bk edesburgonya|bk edesburgonya hasab'],
    ['King Nuggets', 'King Nuggets', 340.0, 823.0, 41.0, 71.5, 41.0, 'king nuggets|bk nuggets|burger king nuggets|king nugget', { pcs: 20, box: 6, boxes: [4, 6, 9, 20] }],
    ['Spicy King Nuggets', 'Spicy King Nuggets', 420.0, 1125.6, 63.4, 71.8, 64.3, 'spicy king nuggets|spicy nuggets|csipos nuggets', { pcs: 20, box: 6, boxes: [4, 6, 9, 20] }],
    ['Chili Cheese Nuggets', 'Chili Cheese Nuggets', 140.0, 358.4, 14.7, 31.5, 18.9, 'chili cheese nuggets', { pcs: 7, box: 5, boxes: [5, 7] }],
    ['Gouda sajtfalatok', 'Gouda cheese bites', 160.0, 444.8, 12.0, 45.6, 23.2, 'gouda sajtfalatok|gouda sajtfalat|bk sajtfalatok', { pcs: 8, box: 5, boxes: [5, 8] }],
    ['Hagymakarika', 'Onion rings', 138.0, 528.4, 6.7, 65.5, 25.5, 'bk hagymakarika|bk hagymakarikak|burger king hagymakarika', { pcs: 12, box: 8, boxes: [8, 12], replace: 'Hagymakarika (Burger King)' }],
    ['Solo kosár', 'Solo bucket', 344.0, 995.8, 26.3, 111.2, 48.6, 'solo kosar|solo bucket'],
    ['Spicy Solo kosár', 'Spicy Solo bucket', 342.0, 908.0, 35.0, 83.1, 48.0, 'spicy solo kosar'],
    ['Dupla kosár', 'Double bucket (22)', 576.0, 1656.3, 53.4, 164.8, 86.1, 'dupla kosar|bk dupla kosar|double bucket'],   // "22-es dupla kosár" in the table; a leading number would read as an amount
    ['Duo kosár', 'Duo bucket', 678.0, 1727.7, 62.4, 173.7, 86.1, 'duo kosar|duo bucket'],
    ['Giga kosár', 'Giga bucket', 1188.0, 3296.9, 92.7, 359.7, 162.8, 'giga kosar|giga bucket'],
    ['Pöttyös King Fusion', 'Pöttyös King Fusion', 200.5, 333.4, 9.5, 46.0, 12.0, 'pottyos king fusion|turo rudis king fusion'],
    ['Oreo King Fusion', 'Oreo King Fusion', 160.0, 280.8, 4.9, 44.6, 8.9, 'oreo king fusion|king fusion'],
    ['Oreo King Fusion csokoládés', 'Oreo King Fusion chocolate', 184.0, 346.1, 5.4, 59.2, 9.2, 'csokis oreo king fusion|oreo king fusion csokis'],
    ['Oreo King Fusion sós-karamellás', 'Oreo King Fusion salted caramel', 184.0, 358.8, 5.6, 60.7, 10.0, 'sos karamellas oreo king fusion|oreo king fusion karamell'],
    ['Oreo King Fusion málnás-sajttortás', 'Oreo King Fusion raspberry cheesecake', 184.0, 352.8, 5.0, 62.1, 9.0, 'malnas sajttortas king fusion'],
    ['Oreo King Fusion epres', 'Oreo King Fusion strawberry', 184.0, 330.7, 5.0, 56.4, 9.0, 'epres oreo king fusion'],
    ['Epres-kekszes King Fusion', 'Strawberry biscuit King Fusion', 180.0, 325.7, 5.3, 55.2, 9.1, 'epres kekszes king fusion'],
    ['Brownie fagylalttal', 'Brownie with ice cream', 130.0, 424.4, 5.8, 42.8, 25.0, 'bk brownie|bk brownie fagylalttal'],
    ['Brownie Cheesecake', 'Brownie cheesecake', 75.0, 291.0, 5.3, 26.3, 18.0, 'brownie cheesecake'],
    ['Belga gofri csokoládé ízű öntettel', 'Belgian waffle, chocolate', 135.0, 391.8, 5.4, 54.7, 16.4, 'bk gofri|bk belga gofri|bk csokis gofri'],
    ['Belga gofri epres öntettel', 'Belgian waffle, strawberry', 135.0, 382.2, 5.2, 52.9, 16.3, 'bk epres gofri|bk belga gofri epres'],
    ['Belga gofri sós-karamellás öntettel', 'Belgian waffle, salted caramel', 135.0, 399.8, 5.5, 55.6, 16.9, 'bk karamellas gofri|bk belga gofri karamell'],
    ['Mini palacsinta juharszirup ízű öntettel', 'Mini pancakes, maple', 80.0, 307.8, 3.4, 46.6, 12.0, 'bk mini palacsinta|bk mini palacsinta juharszirup'],
    ['Mini palacsinta csokoládé ízű öntettel', 'Mini pancakes, chocolate', 80.0, 276.4, 3.8, 37.4, 12.2, 'bk mini palacsinta csokis'],
    ['Mini palacsinta sós-karamellás öntettel', 'Mini pancakes, salted caramel', 80.0, 287.0, 4.0, 38.6, 12.9, 'bk mini palacsinta karamell'],
    ['Mini palacsinta epres öntettel', 'Mini pancakes, strawberry', 80.0, 263.6, 3.5, 35.0, 12.1, 'bk mini palacsinta epres'],
    ['Fagylalt csokoládé ízű öntettel', 'Sundae, chocolate', 150.0, 240.0, 4.0, 44.7, 4.5, 'bk fagyi csokis|csokis fagylalt bk|sundae chocolate'],
    ['Fagylalt sós-karamellás öntettel', 'Sundae, salted caramel', 150.0, 255.9, 4.2, 46.5, 5.6, 'bk fagyi karamell|karamellas fagylalt bk'],
    ['Fagylalt epres öntettel', 'Sundae, strawberry', 150.0, 220.8, 3.5, 41.1, 4.4, 'bk fagyi epres|epres fagylalt bk'],
    ['Tölcséres fagylalt', 'Ice cream cone', 90.0, 118.8, 2.5, 19.8, 3.2, 'bk tolcseres fagyi|bk tolcseres fagylalt'],
    ['Pöttyös shake', 'Pöttyös shake', 395.0, 617.9, 14.9, 88.6, 22.0, 'pottyos shake|turo rudi shake'],
    ['Málnás-sajttortás shake', 'Raspberry cheesecake shake', 380.0, 661.3, 11.0, 114.1, 17.4, 'malnas sajttortas shake'],
    ['Sós-karamellás shake', 'Salted caramel shake', 347.0, 496.6, 9.7, 85.3, 12.4, 'sos karamellas shake|karamell shake'],
    ['Kávés shake', 'Coffee shake', 336.0, 462.9, 10.6, 73.1, 12.7, 'kaves shake|coffee shake'],
    ['Oreo shake', 'Oreo shake', 350.0, 566.4, 10.5, 91.1, 17.2, 'oreo shake|bk shake'],
    ['Coca-Cola', 'Coca-Cola', 400, 180.0, 0.0, 44.8, 0.0, 'bk kola|bk coca cola|bk cola|bk coke', { ml: 1 }],
    ['Coca-Cola Zero', 'Coca-Cola Zero', 400, 1.2, 0.0, 0.0, 0.0, 'bk zero kola|bk coca cola zero|bk coke zero|bk cola zero', { ml: 1 }],
    ['Fanta Zero', 'Fanta Zero', 400, 12.0, 0.0, 1.6, 0.0, 'bk fanta zero', { ml: 1 }],
    ['Sprite Zero', 'Sprite Zero', 400, 4.0, 0.0, 0.0, 0.0, 'bk sprite zero', { ml: 1 }],
    ['Kinley', 'Kinley', 400, 108.0, 0.0, 26.0, 0.0, 'kinley|bk kinley|bk tonic', { ml: 1 }],
    ['Red Bull', 'Red Bull', 250, 110.0, 0.0, 26.3, 0.0, 'bk red bull', { ml: 1, can: 1 }],
    ['Hohes C narancslé', 'Hohes C orange juice', 400, 172.0, 2.8, 35.2, 2.0, 'hohes c|hohes c narancsle|bk narancsle', { ml: 1 }],
    ['Happy Day multivitamin', 'Happy Day multivitamin', 200, 102.0, 0.5, 24.2, 0.0, 'happy day multivitamin|bk multivitamin', { ml: 1 }],
    ['Sió alma', 'Sió apple', 200, 86.0, 1.0, 20.4, 0.0, 'sio alma|bk almale', { ml: 1 }],
    ['Espresso', 'Espresso', 9.0, 31.2, 1.4, 1.1, 1.3, 'bk espresso|bk eszpresszo|bk kave|burger king kave', { odd: 1 }],
    ['Dupla espresso', 'Double espresso', 12.0, 41.6, 1.9, 1.5, 1.7, 'bk dupla espresso|bk dupla eszpresszo', { odd: 1 }],
    ['Hosszú kávé', 'Long coffee', 9.0, 31.2, 1.4, 1.1, 1.3, 'bk hosszu kave', { odd: 1 }],
    ['Cappuccino', 'Cappuccino', 69.0, 64.8, 3.2, 3.9, 3.0, 'bk cappuccino', { odd: 1 }],
    ['Dupla cappuccino', 'Double cappuccino', 132.0, 108.8, 5.5, 7.0, 5.1, 'bk dupla cappuccino'],
    ['Tejeskávé', 'Coffee with milk', 159.0, 115.2, 5.9, 8.0, 5.5, 'bk tejeskave|bk tejes kave'],
    ['Macchiato', 'Macchiato', 19.0, 36.8, 1.7, 1.6, 1.6, 'bk macchiato', { odd: 1 }],
    ['Dupla macchiato', 'Double macchiato', 38.0, 73.7, 3.4, 3.2, 3.2, 'bk dupla macchiato', { odd: 1 }],
    ['Cézár öntet', 'Caesar dressing', 50.0, 110.0, 0.4, 6.5, 9.0, 'bk cezar ontet'],
    ['Joghurtos öntet', 'Yogurt dressing', 50.0, 135.5, 0.4, 4.5, 13.0, 'bk joghurtos ontet'],
    ['Balzsamecetes öntet', 'Balsamic dressing', 50.0, 49.5, 0.1, 7.0, 2.1, 'bk balzsamecetes ontet'],
    ['Ketchup', 'Ketchup dip', 25.0, 25.5, 0.3, 5.8, 0.0, 'bk ketchup'],
    ['Majonéz', 'Mayonnaise dip', 25.0, 160.0, 0.3, 0.9, 17.3, 'bk majonez'],
    ['Édes-savanyú szósz', 'Sweet & sour dip', 25.0, 36.3, 0.1, 9.0, 0.0, 'bk edes savanyu szosz'],
    ['Curry-mangó szósz', 'Curry mango dip', 25.0, 83.0, 0.4, 4.5, 7.0, 'bk curry mango szosz'],
    ['Barbecue szósz', 'Barbecue dip', 25.0, 34.5, 0.2, 8.0, 0.1, 'bk bbq szosz|bk barbecue szosz'],
    ['Salsa szósz', 'Salsa dip', 25.0, 22.8, 0.2, 5.3, 0.1, 'bk salsa szosz'],
    ['Chili Cheese szósz', 'Chili cheese dip', 25.0, 109.0, 0.3, 3.1, 10.5, 'bk chili cheese szosz|chili cheese szosz']
  ];
  const ODD = { hu: 'a táblázat így közli, de a kalória nem egyezik a makrókkal (a kávéknál így van); helyben érdemes rákérdezni', en: 'printed like this, but the calories do not match the macros (as with all coffees in the table); worth asking in the restaurant' };
  const items = [];
  bk.forEach(([name, en, g, kcal, p, c, f, alias, o = {}]) => {
    if (o.odd) { o.fix = ODD.hu; o.fixEn = ODD.en; }
    const k = 100 / g, hu = o.replace || name + ' (Burger King)', piece = o.pcs ? g / o.pcs : 0;
    const names = alias.split('|').concat('bk ' + en.toLowerCase());   // "bk <name>" / "burger king <name>" work without listing them (js/food-query.js)
    const it = { hu, en: 'Burger King ' + en, brand: BK.name, ref: BK.ref + (o.fix ? '; ' + o.fix : ''), refEn: BK.refEn + (o.fixEn ? '; ' + o.fixEn : ''), exact: true, own: [kcal * k, p * k, c * k, f * k], a: [...new Set(names)].join('|'), fix: o.fix || undefined };
    if (o.ml) { const u = o.can ? 'doboz' : 'pohar'; it.dens = 1; it.u = { pohar: g, doboz: g, uveg: g }; it.port = ['1 ' + (o.can ? 'doboz' : 'pohár') + ' (' + String(g / 100).replace('.', ',') + ' dl)', g]; it.def = u; }   // the size sold is the portion: names carry no amount, "0,4 l" would read as one
    else if (piece) { const box = Math.round(piece * o.box * 10) / 10; it.u = { db: Math.round(piece * 10) / 10, adag: box }; it.port = ['1 adag (' + o.box + ' db, ' + String(box).replace('.', ',') + ' g)', box]; it.def = 'adag'; it.qu = 'db'; if (o.boxes) it.boxes = o.boxes; }
    else { it.u = { db: g, adag: g }; it.port = ['1 adag (' + String(g).replace('.', ',') + ' g)', g]; it.def = 'db'; }
    items.push(it);
  });
  return { version: 1, brands: [{ name: BK.name, short: BK.short }], count: items.length, items };
})();
