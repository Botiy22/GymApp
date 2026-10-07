# Core exercise release — 2026-10-07

User-approved scope: publish a stable illustrated core, covering the entire five-day split and supplied workout clips. The earlier all-877 migration requirement is superseded; the old checkpoints below are historical.

Version 2.2.0, build 20261007.5. Core: 61 exercises with two-position boards and three curated HU/EN cues. Full database: 878 entries; 198 curated descriptions in total; 817 further boards and 680 description reviews remain as future content. All 35 split IDs and both supplied routines (nine IDs, overlapping with the split; 39 distinct IDs total) are covered.

The split's historically machine-labelled Seated_Side_Lateral_Raise item selects a dedicated machine guide while retaining its saved ID. The original catalogue variant keeps its seated dumbbell drawing. New plans can choose the separate Machine_Lateral_Raise entry. The split's 21s curl uses 7 lower-half, 7 upper-half and 7 full-range cues. Long built-in coaching notes are omitted from details; user notes remain.

Published boards are mandatory release cache assets. Original source data, stock images, legacy media values, storage keys, plans, logs, backups and cloud merge logic remain intact. Full database and favourites still expose legacy exercises. Warm-up/stretch timers remain, with source descriptions for movements whose drawings are pending.

Verification: source/diff review; content build and JS syntax checks; all 61 release boards visually inspected. The user rejected the first machine-board candidate because the upper arm appeared inside its pad; v2 incorrectly placed the arms above supporting pads. The final v3 places the raised arms beneath the resistance pads, without penetration, matching the user-requested contact direction. No tests added or run. The cloud-browser opening timed out, so browser/mobile layout, offline operation and live-account sync have not been exercised. Built-in imagegen used; original and edit prompts: data/core-machine-image.json.

---

## Historical migration checkpoints

# Exercise migration checkpoint — 2026-10-07

UNFINISHED: do not merge to main. Scope remains all 877 exercises.

Current content files: 60 two-position boards (including the four previously accepted boards), 197 curated HU/EN descriptions. The generated board count is not a count of accepted or fully reviewed images. Read data/exercise-guide-status.json for pending IDs. Original IDs, plans and data remain unchanged.

The previous long image pipeline no longer exists after the tool session restarted. Do not promise unattended work continues after the session ends. Persist each small content batch to GitHub. The latest uncommitted work was recovered from the cloud filesystem and consolidated here; this is independent of the user's laptop.

Next:
- Finish all remaining descriptions and images; review variation, grip, equipment, connected cables, full framing and setup/movement order.
- Band_Good_Morning_Pull_Through: the description is corrected to the anchored band around the upper shoulders, not a between-the-legs pull-through. Use the corrected guide in new image prompts.
- Browser/layout/offline/account-sync checks remain unperformed. Main must stay unchanged until completion.

Changes: uniform two-position exercise UI, three-cue HU/EN guide layer, named-muscle chip wrapping, own-exercise schema preserving legacy storage fields, dependency loading for an older cached HTML shell, service-worker core refresh and generated-board prefetch for the 39 plan/routine exercises. Original stock photos and video values remain stored but are not shown as demonstrations.

Verification: content build and JavaScript syntax checks only; selected images visually inspected. No tests added or run. No claim of clinical validation or measured activation.


Completed image corrections, 2026-10-07: reverse-grip single-arm triceps handle and continuous foreground cable; overhead rope full framing; upright 3/4 sit-up with secured feet; cross-arm front-squat grip. Prompts and review notes are in data/exercise-image-corrections.json. At that checkpoint the generated board count was 48.

Added the overhead barbell triceps extension and underhand cable pulldown boards for the two supplied routines. The anchored-band good morning board now faces its front anchor in both panels. Full catalogue remains incomplete.

Goals/calendar fix: the completed main-only PR #2 renames the tab to Célok / Goals and gives the month its own state, separate from selected day. Monthly totals exclude future goals; the fixed 28-day summary remains. The same change is merged into this unfinished branch while preserving guide metadata, image UI and all 48 boards / 197 descriptions. Browser interaction checks remain unperformed.

UI follow-up (main PR #3, merge 81f6fc7d721bbc870d75580ac2e8f06f509472b6): daily and weekly Goals content is back above the month calendar. The compact today button appears only for another selected day. Selecting a date preserves its viewport position. Start/end illustrations have separate buttons and open the tapped position in a large view. Stock-photo and media sections are removed from the main exercise detail UI. Updates show progress and report verified completion after reload, with versioned worker replies and legacy-message compatibility. Source/diff review and JavaScript syntax checks passed; no tests or browser interaction/layout/offline checks performed. Catalogue completion counts are unchanged.

Release follow-up: completed main PR #4 introduces a single release metadata file and visible version/build numbers. Main PR #5 (2.1.1, build 20261007.2) wraps exercise text/chips and constrains horizontal overflow. This unfinished branch uses 2.1.1-dev and keeps its guide data and asset caching.

Image batch: Air_Bike, Alternate_Hammer_Curl, Alternate_Heel_Touchers, Alternate_Incline_Dumbbell_Curl, Alternating_Cable_Shoulder_Press and Arnold_Dumbbell_Press now have two-position generated boards. Prompts and selected review notes are in data/exercise-image-corrections.json. The bicycle crunch was edited after its first output. Counts: 54 boards / 197 curated descriptions; no claim that all images have user acceptance. No tests or browser layout/offline checks run.

Second image batch: Band_Pull_Apart, Barbell_Shrug, Bench_Dips, Ball_Leg_Curl, Alternating_Floor_Press and Barbell_Deadlift. Cable shoulder-press and deadlift framing were refined; wider floor illustrations retain their natural proportions in the UI. Counts: 60 boards / 197 curated descriptions. Unfinished developer release: 2.1.1-dev, build 20261007.3; image cache bumped to v7 for the replaced cable board. Generation uses the built-in tool. Images visually inspected; source/content build and syntax review only, no tests or browser checks.
