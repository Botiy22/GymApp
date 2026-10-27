/* Recovery and stability programmes read from the owner's saved clips (October 2026): two knee band/stability
   circuits by Matthew Maloney (KneeHab) and a four-move pelvic-tilt routine by purple.faction.
   Sets, reps and hold times are the ones printed in the clips; where a clip shows none, the numbers are marked as our
   starting suggestion. Movement names and cues are our reading of what the clips show. The drawings in
   img/recovery/ are original black-outline exercise sketches generated for Reppsy, not frames from the clips.
   Reviewed sources and export details: img/recovery/README.md. */
(function () {
  const ART = name => ({ pair: ['img/recovery/' + name + '-0.svg', 'img/recovery/' + name + '-1.svg'], thumb: 'img/recovery/' + name + '-0.svg', source: 'Reppsy' });
  // [id, art, EN name, HU name, primary, secondary, equipment, category, force, EN steps, HU steps]
  const MOVES = [
    ['Rehab_Banded_Squat', 'banded-squat', 'Mini-band squat', 'Szalagos guggolás', ['quadriceps'], ['glutes', 'abductors'], 'bands', 'strength', 'push',
      ['Put a mini band just above your knees and stand with feet shoulder-width apart.', 'Sit down and back into a squat, keeping a little outward pressure on the band so your knees track over your toes.', 'Go as deep as is pain-free, then stand up tall.'],
      ['Tegyél egy mini szalagot közvetlenül a térded fölé, és állj vállszélességű terpeszbe.', 'Guggolj le hátra-lefelé, és közben enyhén told kifelé a szalagot, hogy a térded a lábujjaid irányába mutasson.', 'Csak fájdalommentes mélységig menj, majd állj fel egyenesen.']],
    ['Rehab_Terminal_Knee_Extension', 'tke', 'Terminal knee extension (band)', 'Térdfeszítés szalaggal (TKE)', ['quadriceps'], [], 'bands', 'strength', 'push',
      ['Anchor a band in front of you at knee height and loop it behind the working knee. Step back until it is tight.', 'Start with the knee slightly bent, then straighten it fully by squeezing the front of your thigh.', 'Hold the straight knee for a moment, then let it bend again slowly.'],
      ['Rögzítsd a szalagot magad előtt térdmagasságban, és hurkold a dolgozó térded mögé. Lépj hátra, amíg megfeszül.', 'Kissé hajlított térddel indulj, majd a combod elejét megfeszítve nyújtsd ki teljesen.', 'Tartsd egy pillanatig kinyújtva, majd lassan engedd vissza hajlításba.']],
    ['Rehab_Banded_Split_Squat', 'banded-split-squat', 'Banded split squat', 'Szalagos kitöréses guggolás', ['quadriceps'], ['glutes'], 'bands', 'strength', 'push',
      ['Hold a support in front of you. Loop a band around the front knee, anchored in front, and take a long split stance.', 'Lower the back knee towards the floor while the band gently pulls the front knee forward over the toes.', 'Push through the front foot to come back up. Do all reps, then change legs.'],
      ['Kapaszkodj meg magad előtt. A szalagot az elöl lévő térdedre hurkold, előre rögzítve, és állj hosszú kitöréses állásba.', 'Engedd a hátsó térdedet a padló felé, miközben a szalag finoman előre húzza az első térdet a lábujjak fölé.', 'Az első talpadon tolva emelkedj vissza. Az összes ismétlés után cserélj lábat.']],
    ['Rehab_Hamstring_Curl_Hold', 'hamstring-hold', 'Standing banded hamstring curl hold', 'Álló szalagos combhajlító tartás', ['hamstrings'], [], 'bands', 'strength', 'static',
      ['Anchor a band low in front of you and loop it around one ankle. Stand tall on the other leg, hands on hips.', 'Bend the banded knee and pull your heel back towards your bottom against the band.', 'Hold the bent position for the time shown, then lower slowly and switch sides.'],
      ['Rögzítsd a szalagot magad előtt alacsonyan, és hurkold az egyik bokádra. Állj egyenesen a másik lábadon, kezed csípőn.', 'Hajlítsd be a szalagos térdedet, és húzd a sarkadat a szalag ellenében a farod felé.', 'Tartsd a hajlított helyzetet a megadott ideig, majd lassan engedd le, és cserélj oldalt.']],
    ['Rehab_Single_Leg_Balance', 'single-leg-balance', 'Banded single-leg balance', 'Szalagos egylábas egyensúly', ['quadriceps'], ['glutes', 'calves'], 'bands', 'strength', 'static',
      ['Loop a band around the standing ankle, anchored to the side, so it tries to pull your foot away.', 'Lift the other knee to hip height and balance on the banded leg with a soft knee.', 'Keep the knee steady over the foot for the time shown, then switch sides.'],
      ['Hurkold a szalagot az álló lábad bokájára, oldalra rögzítve, hogy elhúzni próbálja a lábfejedet.', 'Emeld a másik térdedet csípőmagasságba, és egyensúlyozz enyhén hajlított térddel a szalagos lábadon.', 'Tartsd a térdet stabilan a lábfej fölött a megadott ideig, majd cserélj oldalt.']],
    ['Rehab_Single_Leg_Squat_Hold', 'single-leg-squat-hold', 'Banded single-leg quarter-squat hold', 'Szalagos egylábas negyedguggolás tartás', ['quadriceps'], ['glutes'], 'bands', 'strength', 'static',
      ['Keep the band around the standing ankle, anchored to the side. Hold a support lightly if you need it.', 'Bend the standing knee into a shallow squat with the other foot off the floor behind you.', 'Hold still with the knee pointing over the toes for the time shown. Switch sides.'],
      ['A szalag maradjon az álló lábad bokáján, oldalra rögzítve. Ha kell, kapaszkodj meg könnyedén.', 'Hajlítsd be az álló térdedet sekély guggolásba, a másik lábad hátul a levegőben.', 'Tartsd mozdulatlanul, a térd a lábujjak fölé mutasson, a megadott ideig. Cserélj oldalt.']],
    ['Rehab_Quadruped_Kickback', 'quadruped-kickback', 'Banded quadruped kickback', 'Szalagos hátrarúgás négykézláb', ['glutes'], ['hamstrings'], 'bands', 'strength', 'push',
      ['Kneel on all fours with a long band under your hands and around one foot.', 'Keeping your back flat, push that leg straight back until it is in line with your body.', 'Return the knee under the hip with control. Do all reps, then switch legs.'],
      ['Térdelj négykézlábra, a hosszú szalag legyen a tenyered alatt és az egyik talpad körül.', 'Egyenes háttal told hátra azt a lábat, amíg egy vonalba kerül a testeddel.', 'Kontrolláltan hozd vissza a térdet a csípő alá. Az összes ismétlés után cserélj lábat.']],
    ['Rehab_Knee_Drive', 'knee-drive', 'Banded knee-over-toes drive', 'Szalagos térdtolás a lábujjak fölé', ['quadriceps'], ['calves'], 'bands', 'strength', 'push',
      ['Put the front foot on a low step. Loop a band around the shin, anchored behind you.', 'Keep the whole foot down and slowly drive the knee forward past the toes against the band.', 'Pause at the end of the pain-free range, come back, and do all reps before switching legs.'],
      ['Tedd az első lábadat egy alacsony lépcsőre. A szalagot a sípcsontodra hurkold, mögötted rögzítve.', 'A teljes talpad maradjon lent, és lassan told előre a térdedet a lábujjak fölé a szalag ellenében.', 'A fájdalommentes tartomány végén állj meg, gyere vissza, és az összes ismétlés után cserélj lábat.']],
    ['Rehab_March_Hold', 'march-hold', 'Banded march hold', 'Szalagos térdemelés tartással', ['quadriceps'], ['abdominals'], 'bands', 'strength', 'static',
      ['Anchor a band low and loop it around one foot. Stand tall on the other leg.', 'Lift the banded knee to hip height against the band.', 'Hold the knee up for the time shown without leaning back, then switch sides.'],
      ['Rögzítsd a szalagot alacsonyan, és hurkold az egyik lábfejedre. Állj egyenesen a másik lábadon.', 'Emeld a szalagos térdedet csípőmagasságba a szalag ellenében.', 'Tartsd fent a megadott ideig hátradőlés nélkül, majd cserélj oldalt.']],
    ['Rehab_Split_Stance_Hold', 'split-stance-hold', 'Banded split-stance knee bend hold', 'Szalagos terpeszállás térdhajlítással', ['quadriceps'], ['glutes', 'hamstrings'], 'bands', 'strength', 'static',
      ['Loop a band around the back ankle, anchored behind you, and stand in a short split stance.', 'Lean slightly forward and bend the front knee, keeping it over the middle of the foot.', 'Hold the position for the time shown, then switch sides.'],
      ['Hurkold a szalagot a hátsó bokádra, mögötted rögzítve, és állj rövid terpeszállásba.', 'Dőlj kissé előre, és hajlítsd be az első térdet úgy, hogy a lábfej közepe fölött maradjon.', 'Tartsd a helyzetet a megadott ideig, majd cserélj oldalt.']],
    ['Rehab_Foot_Taps', 'foot-taps', 'Banded single-leg foot taps', 'Szalagos egylábas érintések', ['quadriceps'], ['glutes', 'calves'], 'bands', 'strength', 'push',
      ['Loop a band around the standing knee, anchored to the side, so it pulls the knee inwards.', 'Bend the standing knee slightly and keep it straight over the foot.', 'Reach the other foot out and lightly tap the floor, then bring it back. Do all reps, then switch sides.'],
      ['Hurkold a szalagot az álló térdedre, oldalra rögzítve, hogy befelé húzza a térdet.', 'Hajlítsd be kissé az álló térdedet, és tartsd egyenesen a lábfej fölött.', 'A másik lábaddal nyúlj ki, finoman érintsd meg a padlót, majd hozd vissza. Az összes ismétlés után cserélj oldalt.']],
    ['Rehab_Step_Down', 'step-down', 'Slow box step-down', 'Lassú lelépés dobozról', ['quadriceps'], ['glutes'], 'other', 'strength', 'push',
      ['Stand on one leg on a low box (the clip uses about 30 cm).', 'Bend the standing knee slowly and lower the other heel towards the floor in front of the box.', 'Touch lightly, then push back up through the box leg. Do all reps, then switch legs.'],
      ['Állj fél lábbal egy alacsony dobozra (a videóban kb. 30 cm).', 'Lassan hajlítsd be az álló térdedet, és engedd a másik sarkadat a doboz előtt a padló felé.', 'Finoman érintsd meg, majd a dobozon álló lábbal told vissza magad. Az összes ismétlés után cserélj lábat.']],
    ['Rehab_Split_Squat_Hold', 'split-squat-hold', 'Split squat hold', 'Kitöréses guggolás tartással', ['quadriceps'], ['glutes'], 'body only', 'strength', 'static',
      ['Hold a rail or wall and take a long split stance.', 'Lower until the back knee is just above the floor and the front shin is close to vertical.', 'Hold the bottom position for the time shown, then switch legs.'],
      ['Kapaszkodj korlátba vagy falba, és állj hosszú kitöréses állásba.', 'Ereszkedj le, amíg a hátsó térded épp a padló fölé ér, és az első sípcsontod közel függőleges.', 'Tartsd az alsó helyzetet a megadott ideig, majd cserélj lábat.']],
    ['Rehab_Plate_Balance_Swing', 'plate-balance-swing', 'Banded balance with leg swings', 'Szalagos egyensúly láblendítéssel', ['quadriceps'], ['glutes', 'calves'], 'bands', 'strength', 'push',
      ['Stand on one leg on a weight plate or low platform, with a band around the standing ankle anchored to the side.', 'Swing the free leg slowly forward and back.', 'Keep the standing knee soft and steady over the foot. Do all reps, then switch sides.'],
      ['Állj fél lábbal egy súlytárcsára vagy alacsony emelvényre, az álló bokádon oldalra rögzített szalaggal.', 'A szabad lábadat lassan lendítsd előre és hátra.', 'Az álló térd maradjon lazán hajlítva és stabilan a lábfej fölött. Az összes ismétlés után cserélj oldalt.']],
    ['Rehab_Single_Leg_RDL_Reach', 'sl-rdl-reach', 'Single-leg RDL reach hold', 'Egylábas román felhúzás nyújtózással, tartás', ['hamstrings'], ['glutes', 'lower back'], 'body only', 'strength', 'static',
      ['Stand on one leg with a soft knee and place a cone or target in front of you.', 'Hinge at the hips, let the free leg go back and reach your hands towards the target.', 'Hold the reach with level hips for the time shown, then stand up and switch sides.'],
      ['Állj fél lábon enyhén hajlított térddel, és tegyél magad elé egy bóját vagy célpontot.', 'Csípőből hajolj előre, a szabad lábad menjen hátra, a kezeddel nyúlj a célpont felé.', 'Tartsd a nyújtózást vízszintes csípővel a megadott ideig, majd egyenesedj fel, és cserélj oldalt.']],
    ['Rehab_Ball_Reverse_Lunge', 'ball-reverse-lunge', 'Medicine-ball reverse lunge', 'Hátra kitörés medicinlabdával', ['quadriceps'], ['glutes', 'hamstrings'], 'medicine ball', 'strength', 'push',
      ['Hold a medicine ball at your chest and stand tall.', 'Step one foot back and lower the back knee towards the floor, front knee over the middle of the foot.', 'Push through the front foot to return. Alternate legs or do one side at a time.'],
      ['Tarts egy medicinlabdát a mellkasod előtt, és állj egyenesen.', 'Lépj hátra az egyik lábaddal, és engedd a hátsó térdedet a padló felé; az első térd a lábfej közepe fölött legyen.', 'Az első talpadon tolva lépj vissza. Válts lábat, vagy egy oldalt csinálj végig egyszerre.']],
    ['Rehab_Lying_Leg_Raise', 'lying-leg-raise', 'Lying leg raise (back flat)', 'Fekvő lábemelés (lapos háttal)', ['abdominals'], [], 'body only', 'strength', 'pull',
      ['Lie on your back on a mat with your legs straight and arms by your sides.', 'Press your lower back into the floor and keep it there.', 'Raise both legs to vertical, then lower them slowly only as far as your back stays flat.'],
      ['Feküdj hanyatt egy szőnyegen, nyújtott lábbal, a karod a tested mellett.', 'Nyomd a derekadat a padlóhoz, és tartsd is ott.', 'Emeld mindkét lábadat függőlegesig, majd lassan csak addig engedd vissza, amíg a derekad a padlón marad.']]
  ];
  window.EX_HU = window.EX_HU || {};
  MOVES.forEach(([id, art, en, hu, p, s, eq, c, f, i, ih]) => {
    if (window.EXERCISES.some(e => e.id === id)) return;
    window.EXERCISES.push({ id, n: en, p, s, eq, c, lv: 'beginner', m: s.length ? 'compound' : 'isolation', f, k: 0, i });
    window.EX_HU[id] = [hu, ih];
    window.ROUTINE_ART[id] = ART(art);
  });
  const item = (ex, sets, reps, rest = 45) => ({ ex, label: null, sets, reps, rest });
  window.RECOVERY_PROGRAMS = [
    { id: 'rec_knee_bands', focus: 'knee', icon: 'legs', name: { hu: 'Szalagos térdprogram', en: 'Knee band routine' }, sub: { hu: 'Heti rendszerességgel · mini és hosszú szalag', en: 'Every week · mini band and long band' },
      source: 'Matthew Maloney · KneeHab', minutes: 30,
      info: {"hu": "Mindkét oldalra végezd. Fájdalommentesen dolgozz; sérülés után kövesd a gyógytornászod tervét.", "en": "Train both sides in a pain-free range. After an injury, follow your physiotherapist’s plan."},
      items: [item('Rehab_Banded_Squat', 3, '15'), item('Rehab_Terminal_Knee_Extension', 3, '12'), item('Rehab_Banded_Split_Squat', 2, '10'), item('Rehab_Hamstring_Curl_Hold', 3, '15 s'), item('Rehab_Single_Leg_Balance', 3, '20 s'),
        item('Rehab_Single_Leg_Squat_Hold', 3, '30 s'), item('Rehab_Quadruped_Kickback', 2, '15'), item('Rehab_Knee_Drive', 1, '10'), item('Rehab_March_Hold', 3, '10 s'), item('Rehab_Split_Stance_Hold', 3, '15 s')] },
    { id: 'rec_knee_stability', focus: 'knee', icon: 'legs', name: { hu: 'Térdstabilitási kör', en: 'Knee stability circuit' }, sub: { hu: 'Egyensúly, lelépés, kitörés', en: 'Balance, step-downs, lunges' },
      source: 'Matthew Maloney · Knee Stability', minutes: 30,
      info: {"hu": "Mindkét oldalra végezd. Válassz kényelmes lépcsőmagasságot, és kontrolláltan mozogj.", "en": "Train both sides. Choose a comfortable step height and move with control."},
      items: [item('Rehab_Foot_Taps', 2, '15'), item('Rehab_Step_Down', 2, '12'), item('Rehab_Split_Squat_Hold', 3, '20 s'), item('Rehab_Plate_Balance_Swing', 3, '15'), item('Rehab_Single_Leg_RDL_Reach', 2, '15 s'),
        item('Rehab_Single_Leg_Squat_Hold', 3, '30 s'), item('Rehab_Knee_Drive', 2, '8'), item('Rehab_Ball_Reverse_Lunge', 3, '12', 60), item('Split_Squats', 4, '8', 60)] },
    { id: 'rec_pelvic_tilt', focus: 'stability', icon: 'core', name: { hu: 'Medencebillenés-javító', en: 'Pelvic tilt reset' }, sub: { hu: 'Otthon, szőnyegen', en: 'At home on a mat' },
      source: 'purple.faction', minutes: 12,
      info: {"hu": "Javasolt kezdő sorozatok. A terhelést igazítsd a saját szintedhez.", "en": "Suggested starting sets. Adjust the difficulty to your level."},
      items: [item('Butt_Lift_Bridge', 3, '12'), item('Kneeling_Hip_Flexor', 2, '30 s'), item('Rehab_Lying_Leg_Raise', 3, '10'), item('One_Knee_To_Chest', 2, '30 s')] }
  ];
})();
