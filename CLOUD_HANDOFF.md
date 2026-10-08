# Update — 2.6.0, 2026-10-08

New bottom navigation puts Workout on the left, Food beside it, Settings in the center, Goals left of Profile and Profile on the right. Exercise library/search is inside Workout. Goals retains habits and progress. Profile supports safe local/synced customization, photo/bio/colors, real calorie clock, ranks, seven derived milestones and individual badge showcases. Workout completion announces new badge unlocks.

Social RPC client and additive migration implement unique usernames, recipient-approved friendships, removals, friends-only aggregate profile views and server-derived weekly consistency points. See SOCIAL.md. Existing private userdata is never opened to friends. New modules/CSS are in the verified offline release manifest, and the bootstrap handles older HTML shells.

**Remaining live activation:** run `migrations/20261008_social.sql` in the existing Supabase SQL Editor. The configured project is blocked by this environment's proxy (403), and no admin database binding exists. Local PostgreSQL checks validate the migration/permissions; browser social tests use synthetic HTTP fixtures, not real users. Profile edits remain local when publication is unavailable. Physical iPhone/Safari remains untested.

Validation: 52 Chromium browser tests and 12 real disposable PostgreSQL tests passed, plus syntax/manifest/whitespace checks and dark/light mobile screenshot review. Social browser fixtures exercise authenticated HTTP calls; database checks test all rank boundaries against the JavaScript module, raw-table/helper/anonymous denial, recipient-only acceptance, caps, removals and private data isolation. Final targeted checks cover the unavailable-service copy and accurate kg/tonne totals.

Backup: `/workspace/GymApp-backups/GymApp-before-profile-social-20261008.bundle` (complete history verified).

---

# Update — 2.5.1, 2026-10-08

General exercise/detail/image sheets now use `js/modal-lock.js`, shared with the importer. The lock fixes the body at its original scroll position and makes background app containers inert. Capture guards block background actions and backdrop scrolling; internal dialog scrolling remains available. Multiple dialog owners retain the lock until the last closes, so import/save over Settings cannot unlock early. Existing page styles, inert states and position are restored on final close. The active workout's internal scroller is preserved. Closing animation still shields input.

Validation: all 43 Chromium browser tests passed, alongside syntax, manifest-hash and whitespace checks. Added three browser regressions covering zoom/Back/close, background actions and scroll restoration, active workouts, and an upload whose underlying sheet closes on save. Mobile screenshot and physical-coordinate backdrop close checked in Chromium. Physical iPhone/Safari remains untested.

Backup: `/workspace/GymApp-backups/GymApp-before-dialog-lock-20261008.bundle` (complete history verified). Release manifest includes the new lock module for offline startup.

---

# Update — 2.5.0, 2026-10-07

Implemented compact header plan upload, collapsible weekly/daily meals, a focused Workout page (Train/Plans/History/Ranks), active exercise jumps and expandable volume breakdowns. Six derived personal lift ranks track four exact barbell lifts using actual working sets, with upgrade feedback on finish and next milestones. Existing logs qualify; no account schema changes. RANKS.md documents thresholds and exclusions.

Validation: 40 Chromium browser tests, syntax/whitespace/content-hash checks and mobile screenshot review. Includes actual 100 kg bench finish → Titan → volume breakdown → reload → delete/recalculate; responsive views in both languages and themes; prior XLSX/PDF/storage rollback/media/verified offline updates. Physical Safari/iPhone remains untested.

Backup bundle: `/workspace/GymApp-backups/GymApp-before-workout-ranks-20261007.bundle`; remote branch `backup/before-workout-ranks-20261007` preserves the previous release. Regenerate `release-manifest.json` with `python3 tools/build_release.py` after any future core-file changes.

---

# Update — 2.4.3, 2026-10-07

The screenshot exactly matched the old v2.4.1 PDF parser. Reproduced it using the historical app/parser/service worker, then verified the upgrade to this release and successful import/save/reload of all 28 meals from the supplied PDF. Releases now use a SHA-256 manifest and immutable app-module caches; stale/incomplete deployments are rejected before activation. Explicit updates verify the latest worker version, while automatic updates offer a restart without discarding open previews. Run `python3 tools/build_release.py` after any release/core-file change, and publish all app files plus the manifest together.

Missing drawings now fall back to exact local start/end exercise photos; existing artwork stays first. `tools/audit_media.py` and MEDIA_WORKFLOW.md provide a production queue and batch process. Catalogue coverage: 877 exercises, 188 illustration boards/pairs, 873 photo pairs, 3 without any image pair. Twelve illustrations are missing among built-in routine exercises.

Validation: 34 Chromium tests, including corrupted-deployment rejection/retry, complete-release hashes, update prompts, all built-in exercise images and broken-drawing/photo enlargement checks. Live website URL/installed build is still pending; the assumed GitHub Pages URL was blocked by the proxy. No physical iPhone/Safari check. Optional user question about the temporary photo fallback was unanswered during the work; the reversible fallback was adopted to fill existing gaps.

Backup bundle: `/workspace/GymApp-backups/GymApp-before-verified-updates-20261007.bundle`; remote branch `backup/before-verified-updates-20261007` preserves the prior release.

---

# Update — 2.4.2, 2026-10-07

The supplied diet PDF revealed a parser defect: column-only kcal labels were discarded, Meal total lines were missed, and Meal macros lines became bogus food entries. PDF extraction now retains column coordinates; explicit kcal columns, meal totals/macros and fixed rules are handled correctly. Printed totals are preserved rather than recalculated from rounded ingredient values.

Validation: 29 Chromium regression tests passed, including generated PDF table and unlabelled-price checks. The actual supplied PDF was verified independently against pdftotext output: 7 days, 28 meals, 104 ingredients, every amount/calorie/macro, day classification and 9 rules, including after save/reload. Mobile preview and saved-meal screenshots were reviewed. Physical Safari/iPhone remains untested. The personal PDF is not committed.

Backup: `backup/before-pdf-calories-20261007` preserves `f59fc4c`; verified Git bundle at `/workspace/GymApp-backups/GymApp-before-pdf-calories-20261007.bundle`.

---

# Update — 2.4.1, 2026-10-07

Fixed the collapsed import preview with explicit viewport sizing and independent scrolling. The document stays fixed while the importer is open, and its original scroll position/styles are restored on exit. Visible viewport resize/offset changes and safe areas are handled. Added custom Push, Pull, Legs, Upper and Lower SVG symbols and persistent Lower icon selection. In-app release history describes this update.

Validation: 27 real Chromium browser tests, including new modal scrolling, landscape, simulated keyboard viewport and icon persistence checks. JavaScript syntax and Git whitespace checks passed; mobile/landscape screenshots reviewed. No physical iPhone or Safari test: the WebKit download remains blocked by the proxy.

Backup: GitHub branch `backup/before-dialog-icons-20261007` preserves `7c2f91a`; a complete verified bundle is at `/workspace/GymApp-backups/GymApp-before-dialog-icons-20261007.bundle`.

---

# Update — 2.4.0, 2026-10-07

The user explicitly requested browser tests for this change. Fixed XLSX recognition by preserving worksheet columns and grouping workout days and weekday meals, added compact automatic preview and safe appending, a weekly meal-plan view, mint/light design refresh and visible release history in Settings. Storage failure rolls back plan imports.

Validation: 23 real Chromium browser regressions, JavaScript syntax and Git whitespace checks; responsive screenshots reviewed. See tests/README.md for coverage and commands. Tests use generated fixtures and isolated browser data, with no live account. The actual user's XLSX was not provided. WebKit download was blocked by proxy 403, so physical Safari/iPhone and live Supabase/AI checks remain unrun.

A complete pre-change filesystem/Git backup is outside the checkout under /workspace/GymApp-backups. GitHub branch backup/before-xlsx-redesign-20261007 preserves commit d95ab8f.

---

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
