# Reppsy exercise collection

The active catalogue is selected by `ACTIVE_CATALOG` in `js/exercise-catalog.js`.
`curated` uses `data/exercises-curated.js`; `legacy` restores the archived browse list.
Keep `data/exercises.js`: saved routines, workout history and shared/imported plans
still need its stable IDs. Only this account’s referenced archive entries are added
to its active list; the app does not enumerate other users’ private workouts.

## 100 illustrated exercises

The collection covers the original plan exercise IDs, all starter-template sessions,
both complexes and additional common machine, free-weight and bodyweight movements.
Every active entry uses original generated black contour artwork. Eleven approved
pairs in `img/routine-line` are reused. Fourteen previous generated library boards
are exported to WebP, and 75 new two-pose boards complete the collection. The old
procedural mannequin player and its SVG stills are retained only as inactive archive
files; neither is loaded or precached by this release.

`data/exercise-guides.js` and `data/exercise-guides-extra.js` hold bilingual technique.
`data/generated-exercise-art.js` maps exact exercise IDs to two phases and a thumbnail.
Pictures open in the existing scroll-locked zoom sheet. The existing primary and
secondary muscle maps remain available. These broad maps are not muscle-head-level
anatomical models. Images are teaching illustrations, not motion capture.

## Building

`node tools/export_exercise_illustrations.cjs` exports generated PNG masters using
Sharp, without stretching poses. Master paths and SHA-256 hashes are recorded in
`img/atlas-line/generation-20261031.json`; masters are not downloaded at runtime.
`node tools/build_curated_library.cjs` validates complete artwork and builds the
static catalogue. The old builder name redirects to this command.

The existing third-party assets and notices remain for archived entries. They are
not used by the 100-entry generated collection. User-added media still takes priority.
All active image pairs and thumbnails belong in the verified service-worker cache.

## First continuous movement studies (2.49.0)

`js/exercise-motion.js` adds three explicit, original 2D vector animations:
`Hammer_Curls`, `Side_Lateral_Raise`, and `Leg_Extensions`. These are continuous
joint rotations, not fades between the two photographs and not filmed video.
Only these supported IDs receive a badge and collapsible player. Detailed generated
stills, technique instructions and muscle views remain available for all 100 entries.
The previous `exercise-atlas.js` renderer remains inactive.

Playback starts only when opened, with pause, restart and half-speed controls.
It stops when collapsed or its dialog closes; it suspends offscreen or when the
browser tab is hidden. Animation frames and observers are cleaned up on removal.
All controls retain text labels and visible keyboard focus. Geometry and visual
frames have been checked in browser, but no professional motion-capture or physical
biomechanical validation is claimed. New exercises require a matching authored
motion rather than a generic fallback.
