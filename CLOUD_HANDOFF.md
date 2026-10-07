# Current release scope — 2026-10-07

The user approved a stable core release instead of completing every catalogue entry first,
with their five-day split and supplied workout clips as mandatory content. Version 2.2.0,
build 20261007.5: 61 illustrated core exercises, all 39 distinct split/supplied-routine IDs
covered, 878 total entries retained behind Full database. Saved plans and IDs are unchanged.
The split's machine lateral raise selects its own guide; normal seated dumbbell raises remain
a different variation. See EXERCISE_GUIDE.md and data/exercise-guide-status.json.
Historical all-catalogue completion requirements below are superseded by this user-approved scope.
Verification: source/diff review, content build, JS syntax checks and visual board inspection.
No tests added/run. Browser layout, offline and live-account sync have not been checked.

# Completion update — 2026-10-06

Cloud implementation completed after checkpoint 6f8e727. The historical handoff below describes
the starting point, not the current implementation. Completed: movement boards and human-face
medium-grip board, specific muscle names/focus, bilingual routine info, round-order circuit guide,
zero-rest handling, Momentum/recipe/mobile/light-theme CSS, input defaults/validation, source
attribution, and service-worker core/cache refresh. Existing storage keys, workout plans and cloud
sync remain in use. Missing source macros require user entry before logging.

Verification: source review, JavaScript syntax checks and git whitespace checks. No tests added or
run, per user instruction. The edited image was visually inspected. Live layout inspection could
not run: Chromium installation download returned a truncated archive, and the provided cloud
browser blocked the cloud workspace loopback URL (net::ERR_BLOCKED_BY_CLIENT). Account sync
and offline behavior were not exercised against live user data. Do not claim they were tested.

Image edit prompt: replace only both mannequin heads/necks with normal human heads/faces;
preserve machine, hands, shoulder-width overhand grip, poses, shaded anatomy and white background.
Used built-in imagegen; final project asset: img/fig/lat-medium.webp.

---

# GymApp cloud continuation — 2026-10-06

This branch is unfinished work, preserved because the user's laptop is running out of battery. Do not treat it as deployable.

## User's requested outcome

Finish the GymApp updates, then push/merge into `Botiy22/GymApp` `main`. The user explicitly authorized this. Communicate in Hungarian. Preserve existing data and workout plans.

- Add four recipes from the supplied recordings to Food.
- Add the Centr 10-round full-body workout from the screenshot, and the three-grip lat pulldown technique sequence from another recording to Workouts.
- Detailed exercise illustrations at least as good as the existing Everkinetic drawings. The user rejected stickmen, accepted the new detailed shaded illustrations. They briefly preferred faceless heads, then corrected that: **keep normal heads/faces**. Three final WebP assets already have normal faces; `lat-medium.webp` still needs a normal head/face restored.
- Keep the existing anatomical muscle map and add specific muscle names and a useful way to inspect them. Do not claim measured activation percentages or exact individual muscle-head activation from group geometry.
- Rework Habits into **Lendület** (English **Momentum**): counters, automatic goals from logged steps/workouts/protein, weekly and 28-day progress, useful templates. Preserve old checkmarks, backups and cloud sync.

## Already changed, incomplete integration

- `data/additions.js`: four new bilingual recipes, source notes and explicitly null missing macros; two optional routines; one new medium-grip exercise; `EX_ART` mappings. Loaded before app initialization.
- `data/muscle-details.js`: bilingual anatomical names, loaded but not integrated into exercise UI.
- `js/momentum.js`: clean/migrate old habits, values from diaries, streaks, summaries, merge daily logs including explicit zero-value undo records.
- `js/store.js`: habits migrated through Momentum; contentVersion migration adds optional routines once; circuit metadata preserved; bilingual routine info preserved.
- `js/cloud.js`: merges habits per record/day through Momentum instead of whole-array last-writer overwrite.
- `js/app.js`: renamed version 2.0; Momentum UI/action handlers, counter amount form, templates, weekly/28-day data; midnight habit date rollover; source recipe portion chooser; missing macros open manual food entry and require fields; art thumbnails prefer new assets.
- `js/i18n.js`: appended HU/EN strings for new features.
- `img/fig/press.webp`, `row.webp`, `lat-wide.webp`: approved detailed two-phase anatomical illustrations WITH NORMAL HEADS/FACES.
- `img/fig/lat-medium.webp`: correct shoulder-width overhand grip, but still grey mannequin head. Restore normal heads/faces to match the other three using imagegen if available.
- New unchanged Everkinetic SVG pairs `0122-0/1.svg` (barbell back squat), `0093-0/1.svg` (underhand pulldown). CC BY-SA 4.0 attribution already exists in app/README; update attribution for generated assets separately.

## Required remaining work

1. Integrate `EX_ART` boards into `shEx`: display full board, start/end captions, enlarge on tap, preserve photo toggle when photos exist, accessible labels/error fallback. Do not use the wrong variation. `Medium_Grip_Lat_Pulldown` has no photos (`k:0`) and must show its new art. Current exercise-detail code only uses FIG SVGs/photos, so the new WebP boards are not yet shown there.
2. Integrate MUSCLE_DETAIL into exercise map with primary/secondary names, optional focus buttons narrowing map through MuscleMap.fromLists. Keep original plan-specific maps for full view; don't invent fiber precision.
3. `shRoutine` currently escapes `r.info` as a string, but added routines have bilingual objects: resolve by language. Circuit workout still needs a round-by-round guide. Ten sets per exercise represent ten rounds; prioritize first unfinished set across exercises in round order, show current round/next exercise and jump to the right set. Preserve 0-second rest: `newEntry` currently uses `it.rest || 90`, incorrectly turning zero into 90. Add `circuit` to active creation and useful progress display. Don't invent source rest times/counts.
4. Add CSS for all new Momentum UI, counter, progress ring/meters, week/heatmap, recipe portions, board illustrations, muscle focus buttons, circuit guide. Account for narrow phones, keyboard access and light theme. Current classes have NO CSS yet.
5. Review new UI/input logic carefully. `habit-source` dropdown currently resets goal to one for check/workout; sensible editable defaults for steps/protein/count can be improved. `habit-template` calls new-habit handler; guard at limit so stale `ui.habitEdit` cannot be reused. Count labels currently compact() rounds fractional values; preserve decimal goals/counts. Refresh day sheet after counter/manual save.
6. Review partial-recipe manual entry: known values prefill, missing values must stay blank and be supplied. Don't record absent carbs/fat/calories as zero silently. Listing handles null as em dash. The existing global `ideasCap` falsely implies all recipes are USDA app recipes: scope or revise this caption and About/README now that supplied-source recipes are included.
7. Update service worker CORE with all new JS/data/assets and bump shell version for coherent offline refresh. It still has v1 and does not include new files. Preserve offline behavior and asset licensing.
8. Review changes for defects and inspect resulting layouts. No tests have been run. Follow applicable developer instruction: do not add/run tests unless the user asks. Report actual verification honestly.
9. Finish, commit and push/merge to main as authorized. No force pushes. Inspect remote before final merge, preserve any concurrent user changes. Attach any PR you create using the app tool. This checkpoint is intentionally on a separate branch, not main.

## Source extraction and uncertainty

The original five videos are local iCloud recordings and will not be available in cloud. Their useful recipe/workout data is already in additions.js; no need to re-read local media.

- Gnocchi tray: 400 g gnocchi (creator says 390 g actually used), 650 g chicken breast, 250 g broccoli, 1.5 cartons oat cooking cream, seasonings, 80 g light cheese. Four servings. 180 °C covered 30–35 min, then cheese/uncovered another 10–15 min. Source screen says 525 kcal / 47 g protein per serving. Carton volume, carbs and fat not established. Keep uncertainty explicit.
- Skillet: 1 onion, 1–3 garlic cloves, 450 g chicken, 500 g chickpeas, 100 g high-meat-content cold cuts, 200 g rice cooking cream, 150 ml chicken stock, 50 g Parmesan, salt/pepper. Four portions. Creator says 438 kcal / 43 g protein per serving. Carbs/fat not confirmed; ignore unreliable speech-recognition fibre number. Recipe notes recommend cooked/drained chickpeas as an adaptation because weighing state unspecified. Never copy the creator's unsupported health claims.
- Ham-cheese flatbread: 250 g 0% quark, 2 eggs, 100 g ham, 60 g light cheese plus 15 g topping, red onion to taste, seasoning. 180 °C 30–35 min. On-screen 88 g protein / 12 g carbs for whole recipe. Kcal/fat absent.
- Pancakes caption: each pancake 122 kcal, 10 g protein, 12.5 g carbs, 3.5 g fat. Ingredients caption for 30 pancakes: 6 cups low-fat cottage cheese, 12 eggs, 3 tsp vanilla, 12 tbsp sugar-free maple syrup, 3.75 cups self-rising flour. We divided by three for 10 pancakes. Blueberry quantity was beyond the visible caption and cannot be established. Keep cups, no invented gram conversions. These are creator's figures, not independently verified.
- Screenshot Centr text: ten rounds, bicep curl x10, overhead press x10, tricep extension x10, squat x10, lunge x10, bent-over row x10. Only overhead barbell triceps extension visually established; choosing barbell variants for other movements is explicitly labelled an app adaptation. Lunges source does not specify per leg, so no unsupported 10-per-side assertion.
- Lat pulldown audio: wide grip 4-second negative, medium grip AMRAP, underhand grip AMRAP. No reliably visible total number of sets/rest. Optional routine records one demonstrated sequence, with clear note. Medium and underhand drawings must match their actual grips.

Honesty and accuracy instructions from the user: flag uncertainty, never invent references/numbers/quotes, don't present uncertain details as facts.
