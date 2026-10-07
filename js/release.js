/* Release metadata and visible history shared by the app and service worker. */
(function (scope) {
  const version = '2.4.2';
  const build = '20261007.11';
  const history = [
    {version,build,date:'2026-10-07',
      hu:['A PDF-táblázatok kcal oszlopából az ételek és étkezések kalóriái is beolvashatók.','A Meal total és Meal macros sorokból az étkezési összesítések készülnek.','Az étrendi szabályok megjegyzésként maradnak meg, nem új étkezésként.'],
      en:['Calories are read from labelled kcal columns in PDF food tables.','Meal total and Meal macros lines populate meal nutrition.','Diet rules are retained as notes rather than extra meals.']},
    {version:'2.4.1',build:'20261007.10',date:'2026-10-07',
      hu:['Az importálási előnézet stabil magasságú és külön görgethető; a háttér helyben marad.','Egyedi Push, Pull, Láb, Felsőtest és Alsótest ikonok.'],
      en:['The import preview keeps its height and scrolls independently while the background stays still.','Custom Push, Pull, Legs, Upper and Lower workout icons.']},
    {version:'2.4.0',build:'20261007.9',date:'2026-10-07',
      hu:['Az Excel-oszlopokból edzésnapok és heti étkezések készülnek.','Fájlválasztás után rögtön átnézheted és hozzáadhatod a terveket.','A teljes heti étrend külön nézetet kapott az Étkezésben.','Letisztult mentaszín, új kártyák és lebegő navigáció.'],
      en:['Excel columns become workout days and scheduled weekly meals.','Choose a file, review the preview and add your plans.','A dedicated Meal plan view shows the whole week in Food.','A calmer mint palette, refreshed cards and floating navigation.']},
    {version:'2.3.1',build:'20261007.8',date:'2026-10-07',
      hu:['FileReader tartalékút a régebbi mobilböngészők fájlolvasásához.','Ugyanaz a fájl és kép újra kiválasztható.'],
      en:['FileReader fallback for older mobile browsers.','The same file or image can be selected again.']},
    {version:'2.3.1',build:'20261007.7',date:'2026-10-07',
      hu:['Safari-kompatibilis PDF-szövegkiolvasás és részletesebb hibajelzés.'],
      en:['Safari-compatible PDF text extraction and clearer import errors.']},
    {version:'2.3.0',build:'20261007.6',date:'2026-10-07',
      hu:['Helyi PDF-, Word- és Excel-tervbeolvasás külső adatküldés nélkül.'],
      en:['Local PDF, Word and Excel plan reading without an external upload.']}
  ];
  scope.GYM_RELEASE = Object.freeze({ version, build, history, cacheId: 'v' + version + '-' + build });
})(globalThis);
