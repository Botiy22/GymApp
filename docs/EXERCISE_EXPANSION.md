# Exercise expansion — 2026-10-25

Research used the public [wrkout/exercises.json](https://github.com/wrkout/exercises.json) repository, fetched at commit `5994bea047eee4d39a2c0872be3dd8fdd258ba31`, under its Unlicense dedication. Also checked the live free-exercise-db JSON; its exercise set was already included. ACE, Muscle & Strength and wger HTTP access was blocked in this environment; those pages were not used as verified sources.

These six entries are original, clearly named variations of researched base movements, rather than claims that the source contains these exact variants. Instructions and Hungarian translations were written for the app. No source photos are redistributed.

| Added variation | Reviewed base record in wrkout/exercises.json |
|---|---|
| Suitcase carry | `exercises/Farmer's_Walk/exercise.json` |
| Heels-elevated goblet squat | `exercises/Goblet_Squat/exercise.json` |
| B-stance dumbbell Romanian deadlift | `exercises/Romanian_Deadlift/exercise.json` |
| Half-kneeling landmine press | `exercises/Landmine_Linear_Jammer/exercise.json` |
| Wall-supported tibialis raise | `exercises/Smith_Machine_Reverse_Calf_Raises/exercise.json` |
| Half-kneeling band Pallof press | `exercises/Pallof_Press/exercise.json` |

The tibialis movement uses the existing lower-leg `calves` filter because the app has no separate anterior-shin category; its name and cues specify the front of the lower leg. Carry duration/distance can be recorded in notes. No starter routine or user history is modified.

Six original image-generation boards match the black-outline exercise sketch style. Each supplies separate start/finish SVG viewports with embedded full-resolution WebP, as used in recovery. `img/library/generated-20261025.json` records original source hashes. `tools/export_generated_art.py` encodes reviewed artwork; it does not draw figures. Original PNGs remain in `/workspace/generated_images` in the execution workspace.

Recipe and programme provenance remains in source metadata and Git history; user-facing prose now describes the activity or recipe. Missing macro values remain missing and require completion before logging. Existing external-data licensing credits remain in About.


## Search and machine coverage — 2026-10-27

The exact `ulo labnyujto gep` query already matched `Leg_Extensions` on the pre-change main with no extra filters. Reproduced missing results for `combfeszítő gép`, `seated leg extension`, `pec deck`, `fekvo labhajlito`, `csigas letolas` and misspellings. Those are primarily retrieval gaps, not reasons to duplicate existing exercises. `data/exercise-aliases.js` maps common gym names to stable existing IDs; `js/exercise-search.js` ranks offline matches and retains distinct movements. Hidden filtered results get an explicit recovery action. "My exercises" previously reset to All because the action did not accept its `own` value; this is fixed.

Four actual gaps are added: `Machine_Hip_Thrust`, `Machine_Lateral_Raise`, `Belt_Squat_Machine`, `Dumbbell_Romanian_Deadlift`. These are app-authored descriptions and Hungarian translations, not new web transcriptions. The existing free-weight belt squat and stiff-leg dumbbell deadlift retain their separate identities. Machine illustrations show generic equipment; individual machine adjustments differ.

Eight original generated boards add sixteen offline phase images, including four existing exercises without sketches: `Single-Leg_Leg_Extension`, `Butterfly`, `Reverse_Machine_Flyes`, `Leverage_Chest_Press`. All were visually reviewed. The belt-squat board was corrected to preserve the chain/lever movement between phases. Source PNG hashes are in `img/library/generated-20261027.json`; artwork is encoded using the existing export helper. There is no claim that the entire library now has sketches.
