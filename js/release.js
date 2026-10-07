/* Release metadata and visible history shared by the app and service worker. */
(function (scope) {
  const version = '2.4.0';
  const build = '20261007.9';
  const history = [
    {version,build,date:'2026-10-07',
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
