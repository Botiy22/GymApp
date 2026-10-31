# Reppsy exercise atlas

The active catalogue is selected by `ACTIVE_CATALOG` in `js/exercise-catalog.js`.
`curated` uses `data/exercises-curated.js`; changing it to `legacy` restores the
previous browse catalogue. Do not delete `data/exercises.js`: saved routine IDs,
workout history, plan imports and old shared templates still need its lookup.

## Initial collection

47 stable IDs cover every exercise in `PLAN`, all 24 starter-template sessions,
and both video-derived complexes. This does not re-publish the owner's personal
five-day routine. `data/exercise-guides.js` contains the authored HU/EN setup,
execution, return and common-error instructions. Primary/secondary muscle metadata
is retained from the existing catalogue and rendered by the existing muscle map;
these broad region maps cannot show every stabiliser or individual muscle head.

`js/exercise-atlas.js` is an original, procedural 2D vector renderer, not a copied
video or motion capture. A posed mannequin, apparatus, limb volumes and controlled
interpolation illustrate the loaded movement. Play/pause, start/end and half-speed
controls use a five-second cycle. Playback is deliberately user-started, stops when
detached/hidden and respects the user's selected accent. It is a schematic teaching
companion, not a certified biomechanical model or an individualized technique assessment.
Setup and un/racking are explained in text rather than animated. The separate muscle
view remains the anatomical reference; small accents in the movement study mark the
moving region, not a complete activation map.

Run `node tools/build_exercise_atlas.cjs` after editing guides/poses to regenerate
the standalone data and 94 matching SVG stills. Runtime animation uses that same
renderer, so the exported images and playback endpoints match. Existing third-party
images/attributions and the original database remain untouched.

## Growing from plans without losing user data

`ExerciseCatalog.byId` is the full compatibility lookup, with authored entries taking
precedence. `forData` starts with the curated collection and adds only referenced
legacy exercises from this account's saved/imported/copied routines, active workout
and favourites, plus its custom definitions. This derived list is rebuilt on render
and reload; it is not a destructive database migration. Unknown IDs remain subject
to the existing import review / shared-copy validation instead of silently mapping
them to a different movement. Custom exercise notes and pictures remain private.

Copying a publicly shared routine still uses `RoutineShare.copy`, including custom
ID remapping. Newly encountered legacy/custom entries are usable but do **not** get
an invented generic animation. To promote one into the authored collection, review
its identity and equipment, add a guide and correct pose, export, inspect and test.
Other accounts' private plans have not been queried or reviewed. This work had no
logged-in account context to inspect the live shared-plan inventory, and creates no
service-role/anonymous data-enumeration endpoint. No Supabase migration is required.

## Validation

`tests/test_curated_atlas.cjs` checks plan coverage, preserving/remapping copied IDs,
finite distinct frames, bilingual guides, and dessert nutrition. Browser coverage in
`test_curated_atlas_browser.py` exercises real HU search, all 47 detail sheets,
play/pause/speed/end controls, muscle maps, imported-plan reload, recipe images,
guided cooking and scaled diary logging. Recovery tests check the compatibility
lookup rather than assuming recovery IDs must appear in the curated browse list.
