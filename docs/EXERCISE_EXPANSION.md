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
