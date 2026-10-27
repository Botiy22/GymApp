/* Original variant instructions; research and art provenance in docs/EXERCISE_EXPANSION.md. */
(function(){
const additions = [
  {
    "id": "Suitcase_Carry",
    "art": "suitcase-carry",
    "n": "Suitcase carry",
    "hu": "Egykezes bőröndcipelés",
    "p": [
      "abdominals"
    ],
    "s": [
      "forearms",
      "traps"
    ],
    "eq": "dumbbell",
    "c": "strength",
    "lv": "beginner",
    "m": "compound",
    "f": "static",
    "k": 0,
    "i": [
      "Hold one dumbbell at your side and stand tall with level shoulders.",
      "Walk with short controlled steps, keeping your ribs over your pelvis without leaning toward the weight.",
      "Set the weight down with control and repeat with the other hand. Log the distance or time in your notes."
    ],
    "hi": [
      "Fogj egy kézisúlyzót az egyik kezedbe, és állj egyenesen, vízszintes vállakkal.",
      "Sétálj rövid, kontrollált lépésekkel. Tartsd a törzsed a medencéd fölött, ne dőlj a súly felé.",
      "Kontrolláltan tedd le a súlyt, majd ismételd a másik kézzel. Az időt vagy távolságot a megjegyzésben naplózd."
    ]
  },
  {
    "id": "Heels_Elevated_Goblet_Squat",
    "art": "heel-goblet",
    "n": "Heels-elevated goblet squat",
    "hu": "Goblet guggolás megemelt sarokkal",
    "p": [
      "quadriceps"
    ],
    "s": [
      "glutes",
      "abdominals"
    ],
    "eq": "dumbbell",
    "c": "strength",
    "lv": "intermediate",
    "m": "compound",
    "f": "push",
    "k": 0,
    "i": [
      "Place both heels on a stable squat wedge and hold one dumbbell close to your chest with both hands.",
      "Bend your knees and hips to lower between your feet. Keep your toes grounded and knees following the toes.",
      "Stop at a comfortable depth, then press through your feet to stand. Keep the wedge stable throughout."
    ],
    "hi": [
      "Tedd mindkét sarkad stabil guggolóékre, és tarts egy kézisúlyzót két kézzel a mellkasod előtt.",
      "Hajlítsd a térded és csípőd, ereszkedj a lábaid közé. A lábujjaid maradjanak lent, térded kövesse az irányukat.",
      "Kényelmes mélységből a talpadon keresztül nyomva állj fel. Az ék végig maradjon stabil."
    ]
  },
  {
    "id": "B_Stance_Dumbbell_RDL",
    "art": "b-stance-rdl",
    "n": "B-stance dumbbell Romanian deadlift",
    "hu": "B-állású román felhúzás kézisúlyzóval",
    "p": [
      "hamstrings"
    ],
    "s": [
      "glutes",
      "lower back"
    ],
    "eq": "dumbbell",
    "c": "strength",
    "lv": "intermediate",
    "m": "compound",
    "f": "pull",
    "k": 0,
    "i": [
      "Hold a dumbbell in each hand. Place one foot half a step behind you with its heel lifted; keep most weight on the front leg.",
      "Soften the front knee and push your hips back. Lower the weights close to the front leg without rounding your back.",
      "Stop when you feel the hamstrings stretch, drive the hips forward to stand and repeat on the other side."
    ],
    "hi": [
      "Fogj mindkét kezedbe egy súlyzót. Az egyik lábad tedd fél lépéssel hátrébb, megemelt sarokkal; a testsúly nagy része az elöl lévő lábon legyen.",
      "Enyhén hajlított első térddel told hátra a csípőd. A súlyokat az első láb mellett engedd le, egyenes háttal.",
      "A combhajlító feszülésénél állj meg, majd csípőből emelkedj fel. Ismételd a másik oldalon."
    ]
  },
  {
    "id": "Half_Kneeling_Landmine_Press",
    "art": "kneeling-landmine",
    "n": "Half-kneeling landmine press",
    "hu": "Landmine nyomás féltérdelésben",
    "p": [
      "shoulders"
    ],
    "s": [
      "triceps",
      "chest",
      "abdominals"
    ],
    "eq": "barbell",
    "c": "strength",
    "lv": "intermediate",
    "m": "compound",
    "f": "push",
    "k": 0,
    "i": [
      "Secure the bar in a landmine pivot in front of you. Kneel on one knee and plant the other foot ahead.",
      "Hold the loaded end at shoulder height. Brace your abdomen and press the bar diagonally up and forward.",
      "Lower slowly to your shoulder without leaning back. Repeat on the other side."
    ],
    "hi": [
      "Rögzítsd a rudat az előtted lévő landmine csuklóban. Az egyik térded tedd le, a másik talpad legyen előtted.",
      "Tartsd a terhelt véget vállmagasságban. Feszítsd a hasad, és nyomd a rudat átlósan előre-felfelé.",
      "Hátradőlés nélkül engedd vissza a válladhoz. Ismételd a másik oldalon."
    ]
  },
  {
    "id": "Wall_Tibialis_Raise",
    "art": "wall-tibialis",
    "n": "Wall-supported tibialis raise",
    "hu": "Sípcsonti izom emelés falnál",
    "p": [
      "calves"
    ],
    "s": [],
    "eq": "body only",
    "c": "strength",
    "lv": "beginner",
    "m": "isolation",
    "f": "pull",
    "k": 0,
    "i": [
      "Lean your back and hips against a wall with your feet a short distance in front and knees softly extended.",
      "Keep both heels planted and lift the toes and forefeet toward your shins. Feel the front of the lower legs work.",
      "Lower your toes slowly. Move your feet closer to the wall if the movement is too difficult."
    ],
    "hi": [
      "Támaszd a hátad és csípőd a falnak, lábaid kissé előtted legyenek, térded ne feszítsd túl.",
      "A sarkakat lent tartva emeld a lábujjaid és lábfejed elülső részét a sípcsont felé. A lábszár elülső izmai dolgozzanak.",
      "Lassan engedd vissza a lábujjakat. Ha nehéz, lépj közelebb a falhoz."
    ]
  },
  {
    "id": "Half_Kneeling_Band_Pallof_Press",
    "art": "kneeling-pallof",
    "n": "Half-kneeling band Pallof press",
    "hu": "Pallof nyomás szalaggal féltérdelésben",
    "p": [
      "abdominals"
    ],
    "s": [
      "glutes"
    ],
    "eq": "bands",
    "c": "strength",
    "lv": "intermediate",
    "m": "compound",
    "f": "static",
    "k": 0,
    "i": [
      "Anchor a resistance band to your side at chest height. Kneel on one knee and plant the other foot, holding the band at your chest with both hands.",
      "Press your hands straight forward while keeping your chest and pelvis facing ahead. Resist the sideways pull.",
      "Pause briefly, then bring your hands back slowly. Turn to train the other side."
    ],
    "hi": [
      "Rögzíts egy szalagot magad mellett mellmagasságban. Féltérdelésben tartsd két kézzel a mellkasod előtt.",
      "Nyújtsd előre a karod, miközben mellkasod és medencéd előre néz. Tarts ellen az oldalirányú húzásnak.",
      "Rövid megtartás után lassan húzd vissza a kezed. Fordulj meg, és dolgozz a másik oldalon is."
    ]
  },
  {
    "id": "Machine_Hip_Thrust",
    "art": "hip-thrust-machine",
    "n": "Machine hip thrust",
    "hu": "Csípőtolás gépen",
    "p": [
      "glutes"
    ],
    "s": [
      "hamstrings"
    ],
    "eq": "machine",
    "c": "strength",
    "lv": "beginner",
    "m": "compound",
    "f": "push",
    "k": 0,
    "i": [
      "Adjust the back support and secure the padded belt across your hip crease. Plant both feet on the platform and choose a light starting load.",
      "Brace your abdomen and push through your feet to raise your hips until your thighs and torso line up. Keep your ribs down without arching your lower back.",
      "Lower your hips under control while keeping your upper back supported. Re-engage the machine safety before releasing the belt."
    ],
    "hi": [
      "Állítsd be a háttámaszt, és rögzítsd a párnázott övet a csípőhajlaton. Mindkét talpad legyen a platformon; kezdj könnyű súllyal.",
      "Feszítsd a hasad, és a talpadon keresztül nyomva emeld a csípőd a törzs és comb vonaláig. Ne homoríts túl derékból.",
      "Kontrolláltan engedd le a csípőd; a felső hátad maradjon megtámasztva. Az öv kioldása előtt rögzítsd a gép biztosítóját."
    ]
  },
  {
    "id": "Machine_Lateral_Raise",
    "art": "machine-lateral-raise",
    "n": "Seated machine lateral raise",
    "hu": "Ülő oldalemelés gépen",
    "p": [
      "shoulders"
    ],
    "s": [],
    "eq": "machine",
    "c": "strength",
    "lv": "beginner",
    "m": "isolation",
    "f": "push",
    "k": 0,
    "i": [
      "Adjust the seat so the shoulder pivots line up with your shoulders. Place your upper arms against the pads above your elbows and hold the handles.",
      "With your torso against the backrest, raise your upper arms out to the sides to around shoulder height. Keep your elbows bent and avoid shrugging.",
      "Lower slowly without letting the weight stack slam. Use a comfortable range you can control."
    ],
    "hi": [
      "Állítsd az ülést úgy, hogy a gép forgástengelyei a vállad magasságában legyenek. A párnák a felkarod külső részén, a könyököd felett támaszkodjanak.",
      "A háttámlának támaszkodva emeld oldalra a felkarod körülbelül vállmagasságig. Könyököd maradjon hajlított, ne húzd fel a vállad.",
      "Lassan engedd vissza, a súlylapok ne csapódjanak össze. Csak kontrollálható, kényelmes tartományban dolgozz."
    ]
  },
  {
    "id": "Belt_Squat_Machine",
    "art": "belt-squat-machine",
    "n": "Belt squat machine",
    "hu": "Öves guggolás gépen",
    "p": [
      "quadriceps"
    ],
    "s": [
      "glutes",
      "adductors"
    ],
    "eq": "machine",
    "c": "strength",
    "lv": "beginner",
    "m": "compound",
    "f": "push",
    "k": 0,
    "i": [
      "Fasten the squat belt around your hips and attach it to the machine as instructed. Stand on the platform with feet about shoulder-width apart and hold the support handles lightly.",
      "Release the safety with the load supported, then bend your knees and hips to squat to a comfortable depth. Keep your heels down and knees following your toes.",
      "Push through your feet to stand without leaning back. At the end of the set, re-engage the safety before detaching the belt."
    ],
    "hi": [
      "Rögzítsd a guggolóövet a csípődön, és csatlakoztasd a gép előírása szerint. Állj a platformon vállszéles terpeszben, a kapaszkodót csak könnyedén fogd.",
      "A súlyt megtartva oldd a biztosítót, majd térd- és csípőhajlítással guggolj kényelmes mélységig. A sarkad maradjon lent, térded kövesse a lábujjak irányát.",
      "A talpadon keresztül nyomva állj fel, hátradőlés nélkül. A sorozat végén rögzítsd a biztosítót, és csak utána csatold le az övet."
    ]
  },
  {
    "id": "Dumbbell_Romanian_Deadlift",
    "art": "dumbbell-rdl",
    "n": "Dumbbell Romanian deadlift",
    "hu": "Román felhúzás kézisúlyzóval",
    "p": [
      "hamstrings"
    ],
    "s": [
      "glutes",
      "lower back"
    ],
    "eq": "dumbbell",
    "c": "strength",
    "lv": "beginner",
    "m": "compound",
    "f": "pull",
    "k": 0,
    "i": [
      "Stand with feet about hip-width apart and a dumbbell in each hand in front of your thighs. Soften your knees and brace your abdomen.",
      "Push your hips back, keeping the weights close to your legs and your back neutral. Keep the knee bend small and lower only until you feel a comfortable hamstring stretch.",
      "Press through your feet and bring your hips forward to stand tall. Keep your arms long and avoid leaning back at the top."
    ],
    "hi": [
      "Állj csípőszéles terpeszben, a kézisúlyzókat a combod előtt tartva. Enyhén hajlítsd a térded, és feszítsd a hasad.",
      "Told hátra a csípőd, a súlyokat tartsd a lábad közelében, a hátad természetes helyzetben. A térdhajlítás maradjon kicsi; csak a combhajlító kényelmes feszüléséig ereszkedj.",
      "A talpadon keresztül nyomva hozd előre a csípőd, és állj egyenesre. A karod maradjon nyújtott, felül ne dőlj hátra."
    ]
  }
];
for(const {art,hu,hi,...exercise} of additions){
 if(window.EXERCISES.some(e=>e.id===exercise.id))continue;
 window.EXERCISES.push(exercise);
 window.EX_HU[exercise.id]=[hu,hi];
 const pair=[0,1].map(n=>'img/library/'+art+'-'+n+'.svg');
 window.ROUTINE_ART[exercise.id]={pair,thumb:pair[0],source:'Reppsy'};
}

// Fill drawing gaps without changing exercise IDs, routines or logged weights.
for(const [id,art] of Object.entries({
 'Single-Leg_Leg_Extension':'single-leg-extension',
 Reverse_Machine_Flyes:'reverse-pec-deck',
 Butterfly:'pec-deck',
 Leverage_Chest_Press:'machine-chest-press'
})){
 const pair=[0,1].map(n=>'img/library/'+art+'-'+n+'.svg');
 window.ROUTINE_ART[id]={pair,thumb:pair[0],source:'Reppsy'};
}
// Replace the legacy knee-over-toes warning with adjustable, controlled machine setup.
const legExtension=window.EXERCISES.find(e=>e.id==='Leg_Extensions');
if(legExtension){
 legExtension.i=['Adjust the seat so your knees line up with the machine pivot. Place the roller against your lower shins just above the ankles and keep your back against the pad.',
 'Hold the side handles and straighten your knees smoothly through a comfortable range. Keep your hips on the seat and avoid snapping into lockout.',
 'Lower slowly without letting the stack slam. Adjust the load and range if the movement is uncomfortable.'];
 window.EX_HU.Leg_Extensions=['Ülő lábnyújtó gép',[
 'Állítsd az ülést úgy, hogy a térded a gép forgástengelyéhez igazodjon. A henger a lábszárad elülső részén, közvetlenül a bokád felett támaszkodjon; hátad legyen a támlán.',
 'Fogd az oldalsó kapaszkodókat, és kontrolláltan nyújtsd a térded kényelmes tartományban. A csípőd maradjon az ülésen, ne csapd ki a térded.',
 'Lassan engedd vissza, a súlylapok ne csapódjanak össze. Kellemetlen érzésnél csökkentsd a terhelést vagy a mozgástartományt.'
 ]];
}
window.EXERCISE_LIBRARY_VERSION=2;
})();
