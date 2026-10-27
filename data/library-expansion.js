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
  }
];
for(const {art,hu,hi,...exercise} of additions){
 if(window.EXERCISES.some(e=>e.id===exercise.id))continue;
 window.EXERCISES.push(exercise);
 window.EX_HU[exercise.id]=[hu,hi];
 const pair=[0,1].map(n=>'img/library/'+art+'-'+n+'.svg');
 window.ROUTINE_ART[exercise.id]={pair,thumb:pair[0],source:'Reppsy'};
}
})();
