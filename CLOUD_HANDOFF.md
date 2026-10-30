# Collaboration protocol (Claude ↔ ChatGPT/Codex) — keep this section at the top

The owner works with two AI assistants on this repo. Claude leads; ChatGPT/Codex builds tasks it is given and reviews Claude's work. Both read this file first.

1. **One editor at a time.** Before starting, pull the latest `main`. Never work from an older copy, and never overwrite files from an older snapshot.
2. **Every change gets an entry below** (newest first): version/build, what changed, files touched, tests run, anything not verified. Keep it short.
3. **Review requests.** The author lists what the other assistant should review under "Open review requests". The reviewer reports findings as a list (file, line, problem, how to reproduce). Fix only clear bugs; leave design or product decisions to the owner.
4. **When Claude picks up a newer version**, it quick-checks the other assistant's commits (release hashes vs published content, JS tests, the browser suites, a smoke run of every tab) and records the result under "Review log".
5. **Release rules:** bump `js/release.js` + `RELEASES.md`, run `python3 tools/build_release.py`, keep text files LF (`tests/test_release_files.py`), add new shell files to `sw.js` CORE.
6. **Never** put API keys, service-role keys or personal plan files in the repo. SQL migrations that touch the live project must be listed here, with what was checked before and after.

## Open review requests

- **For ChatGPT — 2.38.0 swimming and smartwatch bridge (Claude):** `js/wearable.js` contract and `docs/WEARABLES.md` (is anything missing for a native WKWebView/Health Connect implementation?), swim MET weighting in `js/workout-energy.js`, the swim form in `js/app.js`.
- **For ChatGPT — 2.36.0 overnight oats (Claude):** `js/overnight-oats.js` catalogue refs and default amounts, `shOats` in `js/app.js`. If you can generate photos in the existing recipe style, the five `img/recipes/oats-*.webp` illustrations could be replaced (keep ids and sizes, drop `illustration: true`).
- **For ChatGPT — 2.35.0 offline food foundation (Claude):** `js/food-query.js` (parser: numbers/units/question words/Hungarian endings, `resolve` scoring and its exact/close rules, `unitGrams` portion order, strict mode used by the diary) and `data/food-lexicon.js` (aliases that pick the wrong default, piece weights that look off for Hungarian shops, recipe amounts and yields). Please try real phrasing that still fails or picks a wrong food and add it to `tests/test_food_query.cjs`. Recipe and proxy values are labelled estimates; label values cite their product page.
- **For ChatGPT — 2.31.0 recovery programmes and clip recipes (Claude):** `data/recovery.js` (do the 17 `Rehab_*` names/cues match what the KneeHab clips show? sets/reps are as printed), `tools/recovery_art.py` drawings, the recovery block in `js/app.js` (`recoveryCards`, `shRecovery`, `addRecovery`), `data/clip-recipes.js` (suggested amounts and computed macros), `js/cook-art.js` keyword rules, `css/recipes-stability.css` additions. Report clearly wrong exercise readings or nutrition maths; leave wording/design to the owner.
- **For ChatGPT — 2.28.0 stories, posts, highlights, likes (Claude):** `migrations/20261018_stories_posts.sql`, `js/stories.js`, the STORIES block in `js/app.js` (`storyTray`, `feedBlock`, `mediaBlock`, `shCompose`, `shPost`, `shHighlight`, `likePost`), `css/stories.css`. Please check: (a) the SQL for any path where an `audience='me'` or `'friends'` item leaks (feed, `social_user_media` highlights/cover, `social_media`, likes count); (b) the cleanup `delete` in `social_post_create` (runs for all accounts) and the 30-item daily limit; (c) story viewer edge cases: deleting the last story of the last person, a story whose picture fails to load, holding then swiping, keyboard-only use; (d) anything that redraws the feed while a like is in flight. Not yet checked on a real phone or against the live project.
- **For ChatGPT — 2.28.0 muscle ranks and import layouts (Claude):** `js/muscle-ranks.js` thresholds/factors (are any groups clearly too easy or too hard?), `vRanks` in `js/app.js`, `scheme()`/`isHeading()` in `js/pdf-local.js`, the `scheme` column and title rows in `js/plan-sheet.js`. Try real-world plan files that still import wrongly and add them as cases to `tests/test_import_layouts.js`.
- **For ChatGPT — Ride feature (Claude, 2.22.0–2.22.1):** `js/rides.js`, the BIKE RIDES block in `js/app.js`, `css/ride.css`. Already fixed in 2.23.0 by you: pause duration, stationary GPS, missing coordinates, GPX names. Still worth a look: (a) `rideFix`/`Rides.add` when GPS timestamps arrive out of order after the app returns from background; (b) sync merge when an older client strips the `ride` field from a workout (`js/cloud.js` merge keeps local); (c) Web Bluetooth reconnect loop in `Rides.pair` (gattserverdisconnected) — no real-sensor test exists; (d) storage growth of `ride.path/ts/ele` for long rides. Report findings; don't refactor.

- **For ChatGPT — PDF weekday workouts and Hungarian name matching (Claude, 2.26.1):** `js/pdf-local.js` (weekday heading → lazy routine, `cols`, `restSeconds`, `titleCase`) and `HU_WORDS` in `js/plan-sheet.js`. Please check: mappings that would pick a clearly wrong exercise; labels with alternatives ("A / B") where the first alternative should win; weekday meal plans or mixed meal+workout PDFs that could now produce a stray workout. Report findings; don't refactor.

- **For ChatGPT — 2.27.0 clean redesign (Claude):** `css/clean.css` overrides and the new Settings layout in `js/app.js` `shSettingsBody`. Please look for: pages or sheets where an old style still shows through (gradients, glass, odd radius/colour), anything in Settings that a user would miss now, and text that reads differently between HU and EN. Report findings with a screenshot or selector; don't refactor.

## Review log

- **2026-10-27 — Claude checked 2.31.1–2.34.0 (bc7dfd9, 864f319, 822f392, 1a4eb28, ad43c50, c1d13dc):** worked from GitHub main c1d13dc. Full suites on unmodified 2.34.0: Python 135 tests, 8 failures + 17 errors; Node 65 pass / 5 fail (`test_brand_review`, `test_competition`, `test_meal_groups`, `test_phone_preview`, `test_social_sharing` — environment/PGlite, same as before). 2.35.0 has exactly the same failing test names. `Store.clean` changes (`settings.sections` bounded map, `calm` normalized to false, validated `aiNotes.macros`) match the notes. Not blocking: the AI result footer clipped "Hozzáadás · 3-digit kcal" at 320 px in 2.34 too; fixed in 2.35.
- **2026-10-23 — Claude checked 2.29.0–2.30.0 (Codex commits 19a8934, 343fd88, b741d0b):** pulled from GitHub (the owner's device copy was still at b4eabb3). Manifest rebuild reproduces the committed hashes plus only the 2.31 files; Node 56/58 on both 2.30.0 and 2.31.0 (the 2 failures are the existing `/tmp/reppsy-pg` PGlite path in `test_competition.mjs`/`test_social_sharing.mjs`). Python: unmodified 2.30.0 ran 119 tests with 9 failures + 18 errors; 2.31.0 runs 125, and after making the two recipe-image tests in `test_responsive_polish.py` count `RECIPES.items` instead of a fixed 19 and making the stories tests ignore loading placeholder tiles (a timing flake that also hit 2.30.0), the remaining failures are the same legacy `test_browser`/`test_covers_friends` set as 2.30.0. One real bug from the owner's screenshot: Routine → New activity stretched the All-day switch to full width (`#planner-event-form input{width:100%}` also hit the checkbox) and pushed its label off screen; iOS date/time fields centred and overflowed — fixed in `css/planner.css`. The calendar relay code reads correctly (auth check, host allowlist, redirect re-validation, size/time limits); it is still not deployed because the exact GitHub Pages origin for `CALENDAR_ALLOWED_ORIGINS` was not confirmed. Live Supabase (project Tungsten): the 2.28 stories tables/functions are installed (someone ran the SQL), grants exclude `anon`; advisors only show the by-design "RLS enabled, no policy" notes and "leaked password protection disabled" (an Auth dashboard setting).
- **2026-10-18 — Claude, 2.28.0 before delivery:** device repo still at d5e687e (2.27.0), no newer commits to review. Full Python suite on 2.28.0: 105 tests, 6 failures + 17 errors; the same suite on unmodified 2.27.0: 95 tests, 5 failures + 17 errors, identical names except `test_covers_friends…recalculate_after_undo`, which expected the barbell milestones open — updated to open the new closed section (passes). All other differences are the 10 new tests, which pass (SQL tests with `GYMAPP_PG`). Node: 41/41.
- **2026-10-17 — Claude checked 2.26.0 (commit 4092a6f, meal-group cards):** release hashes match the committed files; JS suites pass; no runtime errors in a smoke run of all tabs. Two browser tests now fail on unmodified 2.26.0, both test-side: `test_covers_friends…ticks_refresh_competition_and_undo` builds `Store.d.plan.days` as an object instead of a 7-day array, so `pm-tick`'s `Store.apply` cleans the plan away and the second tick finds nothing (real imported plans are arrays, so the app is fine — fix the fixture); legacy `test_browser…builtin_routine_exercise_has_loaded_start_end_images` expects the old drawing caption text. `test_brand_review.cjs` still asserts the wordmark before it loads. Handoff entries for 2.23.0–2.26.0 are still missing below — please add short ones next time (rule 2).
- **2026-10-12 — Claude checked 2.23.0–2.25.0 (commits dc8430c, 70ebc5e, 7835b48):** every manifest hash matches the committed files; all `sw.js` CORE files exist; 31 JS unit tests pass; ride, release, routine and update browser suites pass on 2.25.0 (17 + 5 tests); a smoke run of all tabs plus Ride shows no runtime errors. `test_phone_preview.cjs` passes here. `test_brand_review.cjs` and `test_meal_groups.cjs` fail in this environment only on timing: the wordmark image is asserted before it loads, and `img.decode()` runs on a lazy, off-screen thumbnail. Both images load correctly in the app (checked), so the tests should wait for `load` first. Admin directory migration reviewed: a read-only view with `security_invoker`, revoked from anon/authenticated, granted to service_role only — looks correct. Missing: handoff entries for 2.23–2.25 (please add them next time, per rule 2).

---

# Update — Reppsy 2.42.0, 2026-10-30 (Codex)

- Backup `backup/main-20261030-before-food-memory` at `82bda45`; build `20261030.2`.
- New private `js/food-memory.js`: reviewed photo items are remembered only when added to the diary, with an opt-out switch, personal names/aliases and optional multi-component meal names. Saved portions resolve in Describe/search locally; explicit gram/ml quantities and serving multipliers scale the saved nutrition. Estimated photos remain estimated; conflicting claims, incompatible units and ambiguous names require clarification. No raw photos persisted.
- Food diary now has a Frequent foods dropdown (top twelve, weighted by actual consumption in the last 90 days with a 30-day half-life), full searchable library, portion preview, alias editing and forgetting without deleting past meals. Existing personal label products with default servings also appear. Diary batch IDs count multi-component meals once. Memory and diary save in one transaction; 200-record limit reports capacity instead of silently evicting saved foods.
- Store cleaning/export/reset and Cloud merge support the collection and deletion tombstones. Missing fields from older clients preserve memories; matching unchanged diary records also retain memory metadata. Existing private `userdata` JSON is used; **no SQL migration**. Added EN/HU copy, offline CORE/index, cached-shell loader, release history and 464-asset manifest. Details in `docs/FOOD_MEMORY.md`.
- Validation: 29 focused Node checks passed (memory, products, food query/analysis and translations). 17 distinct browser/release checks passed across personal food memory (photo review, reload, offline aliases/search, servings, ambiguity, deletion, opt-out, quota rollback, export/reset and account merge), existing food query/product flows, independent steps/training budget, cached-shell bootstrap, verified update and LF assets. Inspected 320px HU screenshot and removed an oversized link icon. Updated the retailer test to open its visible dropdown. Initial test harness issues (hidden native select, absent Add when all items pending, stale unreconstructed service-worker manifest) were resolved before targeted reruns. No full legacy-suite claim, paid model requests, live Supabase or physical-phone verification.

# Update — Reppsy 2.41.0, 2026-10-30 (Codex)

- Backup `backup/main-20261029-before-choice-menus` at `1c24bcd`; build `20261030.1`.
- Workout menu headings now display the selected page. Renamed Library / Tár to Exercises / Gyakorlatok. Added Swimming / Úszás directly below Cycling / Bringa, with its own page, existing swim logger preselected, and swim-only history (distance, minutes, calories, original record detail). Rebalanced header widths for Hungarian at 320px/enlarged text.
- New `js/choice-menus.js` / `css/choice-menus.css`: shared native-details dropdown presentation for standard single-choice tabs, filters, settings/profile appearance, native selects and registration/calculator choices. Original buttons/events and select form values retained; keyboard arrows/Home/End/type-ahead, Escape/outside dismissal, disabled options, required-field focus, dynamic option lists, selected-state labels and focus after redraw. Mutation enhancement handles partial updates; main/sheet/workout rendering also enhances before restoring scroll. Oat editor is explicitly excluded, including its meal picker; multi-select controls and ordinary actions stay direct. Registration choices start blank rather than silently choosing defaults.
- EN/HU strings, new-helper cached-shell bootstrap, offline CORE, index and release metadata/manifest updated. No SQL or account migration.
- Tests: 10 focused Node checks (translations, swimming/wearable, oats). Final 16-check browser/release run passed: choice menus + registration/swim history, recipe goal/filter/offline assets, daily planner/import flows, stale-shell helpers, verified update reload and LF files. Earlier focused runs also passed oats (including tap/scroll stability), independent calorie controls, workout navigation and swimming/wearable flows. Updated old UI test interactions to open the visible dropdown through `tests/choice_navigation.py`; no full legacy-suite claim. Inspected recipe/settings/swimming screenshots and fixed a wrapping Hungarian menu label. No physical-device/live-account check.

# Update — Reppsy 2.40.0, 2026-10-29 (Codex)

- Backup `backup/main-20261029-before-budget-navigation` at `db3367c`; build `20261029.3`.
- Owner clarified: keep daily steps and same-day training as two separate additions. This supersedes 2.39.1's total/steps override. `WorkoutEnergy.budget` now independently adds step calories (`addActive`) and logged training (`addWorkoutCalories`). Neither switch overrides, checks or disables the other. Food/Profile show each amount and both terms in the equation. `js/app.js` removes the activity-type selector, labels entry/paste/shortcut instructions as steps-only, and keeps numeric history untouched. Legacy full-day totals must be corrected by the owner if they are not step-only calories; no automatic guessed subtraction. Base targets are unchanged, no SQL migration.
- Workout menu: Train (overview/cycling), Library (plans/exercises/stability), History. Native details dropdowns, touch-sized rows spanning the nav width, selected states, exclusive open group, outside/Escape dismissal and focus restoration. Existing actions and ongoing workout state preserved. CSS in `recipes-stability.css`; separate budget amount labels in `clean.css`; EN/HU translations and helper capability bootstrap updated.
- Tests: 8 distinct Node checks (independent budget combinations including legacy records, translations, swim/wearable calculations). 19 browser checks across activity budget, workout navigation, exercise search, recipes/stability, rides and swimming; cached-shell/update reload and LF release checks also pass. Updated existing navigation tests to use the visible menus through `tests/workout_navigation.py`. Tested 320px HU enlarged text, EN/mobile and wide layouts, dropdown hit testing/keyboard/outside click, persistence, Food/Profile agreement and all four switch combinations. Inspected the settled dropdown screenshot. No physical-phone or live-account check.

# Update — Reppsy 2.39.1, 2026-10-29 (Codex)

- Backup `backup/main-20261029-before-activity-budget` at `d6a105f`; build `20261029.2`.
- Fixed step-calorie entries always taking priority over the workout-calorie switch. `js/workout-energy.js` accepts an activity kind: steps-only calories and workout energy are independently included; full daily active-energy totals still replace workouts to avoid double counting. Base targets stay unchanged.
- `js/app.js` offers steps-only/full-day selection in the activity sheet; step estimates select steps-only and pasted health totals select full-day. Budget panel exposes activity inclusion and the editable amount; when a full daily total is included, the workout switch clearly says it is already included and is disabled instead of appearing ineffective. Legacy records retain total semantics until explicitly edited. A short overlap hint warns against adding walking workouts already counted in steps.
- `js/store.js` preserves the bounded kind through cleaning/backup/cloud documents. EN/HU strings, cached-helper capability checks, release metadata and manifest updated. No SQL migration.
- Validation: 9 Node tests (activity budget, translations, wearable), 5 browser tests (two new activity-budget regressions plus three existing swimming/wearable flows), cached-shell/update reload and LF release checks. Covered all inclusion combinations, legacy totals, step estimation, paste, 320px HU at enlarged text, selected-day isolation, persistence and matching Food/Profile calorie targets. No physical-phone or live-account check.

# Update — Reppsy 2.39.0, 2026-10-29 (Codex)

- Backup `backup/main-20261029-before-food-analysis` at `4535b5b`; build `20261029.1`.
- Reproduced the supplied 8-line breakfast becoming 9 partial entries: protein claim parsed as another food, milk fat qualifier lost, cinnamon unresolved. `js/food-products.js` protects nutrient claims/percentages, matches confirmed personal labels and exposes opt-in OFF name/barcode search for Lidl/Tesco/SPAR. `js/food-query.js` retains original lines, decimal commas, pending label/identity/quantity states, longer bounded input and personal-label volume basis. Frozen-fruit aliases and ground cinnamon added to `data/food-lexicon.js`. Pure erythritol now retains EU-labelled carbohydrate as polyol at 0 kcal, explained in analysis.
- `js/ai.js`: local known components stay fixed; only unresolved ordinary-food lines go to AI with source indices. Incomplete/missing model lines stay pending, including partially recognized dishes. Precise label/amount hints resolve an existing ingredient without duplicating it. No branded values invented or zero-filled. Photo guidance handles labels vs extra meal views, units, kJ, sugars/polyols, cooking state, assumptions and missing information; native ml label scaling and conservative visual confidence. No real-model accuracy benchmark claimed.
- `js/app.js`, i18n/clean CSS: pending cards with label/amount/fruit clarification, explicitly remove-or-complete before logging; product search/review/manual fallback; confirmed labels reused offline. Existing matching labels update instead of accumulating duplicates. Native liquid results use dl controls and persist vml. My foods requires all four numeric values, transactional saves and an explicit 500-record-limit message. Store cleaning retains bounded aliases/OFF source URL. Precise grams are not invented for native ml labels.
- New helper, version capability bootstrap, index/SW CORE and narrow OFF CSP connect permission. Release metadata/history and 461-file manifest updated. `docs/FOOD_ANALYSIS.md` covers data provenance, routing, limits and capacity.
- **External access limitation:** Lidl, Tesco and Open Food Facts returned cloud proxy HTTP 403. No verified retailer labels were retrieved or bulk preloaded; no synthetic product macros are shipped. The user was asked for muesli/yogurt labels and fruit clarification, with no response as of publication. The implementation provides lookup/import plus manual label entry. OFF is community-maintained and must be reviewed against the package; its live reachability/CORS/coverage could not be verified here. Tests use explicitly synthetic fixtures. About 809,543 bytes of bundled food data; no repo-space issue. Live Supabase/browser quota not measured.
- Validation: 37 focused Node checks passed across products (7), food query (8), analysis (5), AI request retries (3), translations (2), oats (4), food volume (8). 13 distinct browser/LF checks passed: 4 new product cases (320px HU full meal -> labels -> diary -> reload, retailer import/failure, photo pending/native ml, offline correction without duplicate labels), 4 existing food-query, 2 food-analysis/routine, cached helper bootstrap, verified update retaining diary, LF. An actual CSP block discovered in the mock-network browser test was fixed with the specific OFF origin. Completed-result screenshot reviewed. No paid AI requests, live account changes or physical-phone checks.

# Update — Reppsy 2.38.1, 2026-10-28 (Codex)

- Replaced only `oats-berry-turo` full image and thumbnail with a reviewed, separately generated food photo matching the newer oats collection. Provenance: `img/recipes/generated-20261028-berry-oats.json`; whole-frame export, 1448×1086 / 384×288. Recipe quantities/macros unchanged.
- `js/overnight-oats.js` photo metadata selects the generated-photo caption. Existing Node assertion updated; `tools/oats_art.py` skips this recipe to avoid restoring its old drawing.
- Main advanced during image generation; fast-forwarded to Claude's `7f54532` and preserved 2.38.0 swimming/wearable work. Backups: `backup/main-20261028-before-berry-oats-image` at `a8ea413`, `backup/main-20261028-before-berry-photo-2380` at `7f54532`. Published as 2.38.1/build 20261028.4, not the earlier unpublished 2.37.2 draft.
- Passed existing oats Node tests (4), verified-update/diary and LF tests (2), plus isolated real-browser check of card/hero loading, photo caption and 390px HU bounds. Reviewed the generated source and in-app screenshot. Thumbnail DOM natural size is density-corrected by srcset; exported file remains 384×288. No physical-phone check. Release history and manifest rebuilt.

# Update — Reppsy 2.38.0, 2026-10-28 (Claude)

- Owner request: log swimming (lengths, mixed breast/back/free) and prepare smartwatch data for the future iOS/Android apps, also for rides; sauna answered as not counted (no app change).
- `js/workout-energy.js`: `swim` type (`pool`, `laps` per stroke, Compendium 2024 METs, `swim()` stats), `wear` (watch data; `wear.kcal` replaces the estimate). `js/wearable.js`: bridge contract v1, cleaning, `toSwim`/`toRide`. `js/app.js`: swim form with live preview, `wearPanel` (swim form + Ride screen), `wear-import/live/use-last`, live ride samples into `rideLive`/`Rides.sensor`, cardio rows show distance/lengths. `js/rides.js`: `src:'watch'`. `docs/WEARABLES.md` native guide (platform API names marked to verify). Loader/index/SW CORE.
- Tests: `tests/test_wearable.cjs` (4), `tests/test_swim_wearable_browser.py` (3, fake iOS handler), cached-shell test extended. Not verified: any real watch or native build (none exists).

# Update — Reppsy 2.37.1, 2026-10-28 (Codex)

- Backup `backup/main-20261028-before-oats-scroll` at `fd166ed`; build `20261028.2`.
- Reproduced ingredient-add jump: the whole sheet was replaced and its numeric scrollTop restored, but inserted selected-ingredient rows above the fruit chips moved the tapped control by ~128 px on a 320 px HU phone.
- `js/app.js`: shared `oatsRow` renderer and targeted `refreshOats` retain the sheet, chips and existing rows. Update macros, quantities, selected states and footer in place; compensate for geometry changes at the tapped control. Removed-row focus moves to a remaining control without scrolling. Applies to ingredient toggles, amount steps and presets, without changing other dialogs.
- Tests: new browser regression failed before the fix and passes after. All 7 focused browser/LF checks passed (4 oats cases including EN/HU enlarged-text, animations enabled, repeated fruit changes, focus and empty/last removal; recipe/builder/scaled diary integration; verified update with saved diary; LF). Six Node oats/translation tests passed. Physical iPhone not verified.
- Release metadata/history and 459-asset manifest rebuilt. No new assets or database changes.

# Update — Reppsy 2.37.0, 2026-10-28 (Codex)

- Backup `backup/main-20261028-before-recipe-goals` at `14c92ba`; build `20261028.1`. Preserves Claude 2.35–2.36 changes and the oats builder.
- `data/goal-recipes.js`: five high-protein lower-fat oats and five grilled chicken meals with sides, complete EN/HU methods, dl milk, explicit cooked weights and ingredient-calculated estimates. Oats use the existing builder calculation and appear as presets; chicken retains source rows/unrounded components for audit. Ten separately generated/reviewed photos plus thumbnails and provenance. `tools/export_generated_art.py` now tolerates a two-pixel size discrepancy by whole-frame resize (no cropping).
- `js/recipe-goals.js`, `js/app.js`, `js/i18n.js`, `css/clean.css`: Weight loss / Maintenance / Bulking / Muscle growth chips combine with meal categories, with an optional guide and references. Exact numeric cutoffs are disclosed product heuristics, not clinical thresholds; incomplete macros stay in All. No guaranteed or maximum muscle growth claim. `docs/RECIPE_NUTRITION.md` records source data, rationale, exact cutoffs and limitations.
- Research retrieval limitation: publisher/PMC/PubMed/Europe PMC/Crossref/NIH/EU/food-safety requests returned environment proxy 403. Established references are linked from existing knowledge, not claimed as freshly read. USDA SR28 ingredient rows were directly inspected/calculated locally. No actual product-specific/laboratory verification.
- Loader/index and SW CORE include both helpers and all 20 media files. Release metadata/history and 459-file manifest updated.
- Validation passed: eight Node tests (new nutrition/goal rules 2, existing oats 4, translations 2); eight distinct browser/LF checks (goal filters/EN-HU 320px enlarged-text layout, all ten photos/builder/scaled diary, verified offline recipe/photo use, existing oats browser 2, stale-shell helper loading, verified update retaining diary, LF). Initial diary assertion corrected for existing integer kcal storage; offline fixture now overrides Cloud via init script so cached real config cannot show auth gating. Phone screenshot visually reviewed. No live Supabase/AI calls or physical phone checks.

# Update — Reppsy 2.36.0, 2026-10-27 (Claude)

- Owner request: overnight oats recipes plus a builder with live macros. New `js/overnight-oats.js` (catalogue → database refs, `compute`, presets inserted into `RECIPES` after `overnight-oats`; existing recipe values recomputed: 430→438 kcal). `js/app.js`: `oatsCta`, `shOats`, `oatsName`, actions `oats-open/preset/toggle/step/add/save`, input `oats-amt`; customise button in `shRecipe`; `addFood` keeps `items`. `js/store.js`: `items` kept for `src:'db'` entries too (older clients drop them harmlessly). Lexicon: frozen mixed berries, erythritol. `tools/oats_art.py` + 10 `img/recipes/oats-*.webp` (illustrations). Loader/index/SW CORE updated.
- Tests: `tests/test_overnight_oats.cjs` (4), `tests/test_overnight_oats_browser.py` (2: 320 px HU text 20 and EN; reload keeps breakdown), cached-shell test extended.

# Update — Reppsy 2.35.1, 2026-10-27 (Claude)

- Owner report: coach (and describe/photo) often ended with "Az AI válasza nem volt értelmezhető" after a cut-off reply. Cause (platform.claude.com docs, Thinking + Effort): Sonnet 5.5/Opus 5.5 think by default and thinking counts toward `max_tokens`; 900/2000 were too small. `js/ai.js`: `post()` returns `{text, stop}`, refusal → code `refusal`; `call()` 16000 tokens at effort `medium`, one retry at `low`/32000 when unparseable; chat 8000 → retry `low`/16000 when empty or `max_tokens`; `output_config` only for models that support effort (regex `EFFORT`, Haiku 4.5 excluded). New i18n `err_cut`, `err_refusal`. Tests: `tests/test_ai_requests.cjs`.
- Owner request: remaining-budget colours. `js/app.js` `fuelHue/fuelStyle` (hue 130→0 between 50% and 100% of target) on the calorie dial, `.calorie-remaining`, energy equation, Food `.macros` meters and Profile macro bars; `css/clean.css` rules (light theme `--fuel-l:36%`).

# Update — Reppsy 2.35.0, 2026-10-27 (Claude)

Owner: the offline (no-AI) food understanding must be the foundation — e.g. "how many calories / grams is one zsemle" answered from the database — with a wider database and better logic.

- **New `js/food-query.js`** (`FoodQuery`): parser for HU/EN number words, decimals/fractions/ranges, units (g, dkg, kg, ml, dl, l, evőkanál, teáskanál, pohár, bögre, csésze, szelet, db, adag, tányér, marék, gerezd, tábla, kocka, korsó, feles, pár…), question words (kcal/grams/protein/carbs/fat), Hungarian endings (zsemlében, tojást, vajjal → second food), accents, bounded typo fallback. Resolver scores lexicon aliases > Hungarian names > USDA names; "exact" vs "close" (ignored word shown). Strict mode for the diary: no close guesses and no guessed servings (a typical piece weight is allowed, always ≈). `answer()` returns items, totals and bilingual text; ~3 ms per query, index built once (~90 ms).
- **New `data/food-lexicon.js`**: 95 new Hungarian entries + aliases/portions for existing ones (FOODS.hu 241 → 336, list +43 own/calculated rows). Label values (kifli, kakaós csiga, sajtos pogácsa, Túró Rudi, zsírszegény túró) cite their product page; 2.8%/1.5% milk interpolated from USDA milks; dishes calculated from recipes written in the file (marked ≈ "tipikus házi recept alapján"). Proxies flagged `approx`.
- **`js/app.js`**: Add food shows a database answer card (Add / Other amount / alternatives) above results; search strips amounts/question words and ranks aliases/endings/typos first; amount chips use the new portions (≈ marked). Coach answers food questions locally (with or without key, no API call), non-food questions still go to AI; without a key the input works and explains the limit. Loader capability checks for both new files.
- **`js/ai.js`**: `local()` uses FoodQuery strict (legacy path kept if missing); without a key, returns the understood items and names what it could not calculate. **`js/i18n.js`** new keys, updated help texts. **`css/clean.css`** card styles; `.sheet-foot>.btn.wide` no longer clips at 320 px. `index.html`, `sw.js` CORE, release 2.35.0 build 20261027.4, manifest rebuilt.
- **Tests:** new `tests/test_food_query.cjs` (8) and `tests/test_food_query_browser.py` (4: HU 320 px/text 20 and EN card + diary, multi-food, describe + offline coach, coach with key makes no API call for food); cached-shell test extended to the new helpers. Full suites compared with 2.34.0: identical failing set (see Review log). Not verified: physical phone, live account.

# Update — Reppsy 2.34.0, 2026-10-27 (Codex)

- Backup `backup/main-20261027-before-exercise-search` at `ad43c50`; build `20261027.3`.
- Audit: exact unaccented `ulo labnyujto gep` already worked without extra filters. Reproduced missing common synonyms/typos; fixed ranked bilingual retrieval with `data/exercise-aliases.js` (253 aliases / 72 exercise IDs) and `js/exercise-search.js`. Hungarian compounds, accents, punctuation, gym synonyms, primary-muscle/equipment vocabulary and conservative one-edit fallback; no automatic exercise substitution. Exact matches outrank favourites.
- `js/app.js`: same search in library/picker; filters remain active, empty filtered matches offer Clear filters without discarding query/selections. Selected order remains stable. Fixed `own` filter and custom-name prefill/save paths after the library moved into Workout. Mobile input wraps separately from equipment. Added missing-helper/data-version bootstrap for stale HTML.
- `data/library-expansion.js`: machine hip thrust, machine lateral raise, belt squat machine, dumbbell RDL, with original EN/HU instructions. Eight new generated boards / sixteen `img/library` phase assets include four existing machine movements. Visually reviewed; belt-squat chain/lever corrected. Existing exercise IDs/history unchanged. Leg-extension cues replace legacy knee-over-toes warning with controlled adjustable setup. Research/provenance notes in `docs/EXERCISE_EXPANSION.md` and `img/library/generated-20261027.json`. This update does not claim new website research or complete sketch coverage.
- Release metadata/history and SW CORE updated with search modules and all new phases.
- Validation: 4 search Node tests (including every EN/HU library name, common queries, typo/opposite-movement boundaries, aliases and custom vocabulary) and 2 translation tests passed. 7 browser/LF checks passed: actual 320px HU add-to-Alsótest/save/reload, filter recovery, custom filter, all 14 library-art pairs in both languages, recipe copy, cached-helper upgrade, verified update preserving diary, LF. Additional isolated browser check passed for verified offline alias search + new sketches and custom exercise creation/save/reload. Picker and machine detail screenshots inspected. No live Supabase/AI or physical iPhone verification.

# Update — Reppsy 2.33.1, 2026-10-27 (Codex)

- Backup `backup/main-20261027-before-chat-nudge` preserves `1a4eb28`. Build `20261027.2`.
- `js/app.js`, `js/i18n.js`, `css/clean.css`: one-time EN/HU recipe invitation next to coach button, gentle icon wave, tap-to-open and automatic fade. Per-browser local flag; waits for visible/unobstructed app. Opening chat first suppresses it. No AI call from the hint.
- Settings navigation gently pulses in the chosen accent only when a newer release is detected, with a status dot and accessible update label; clears when current or installing. OS reduced-motion remains respected.
- Validation: focused mobile Chromium checks cover first appearance, bounds, chat tap, persistence across reload, early chat suppression, HU/light theme, reduced motion, auto-dismiss and update indicator detection/clearing across tab changes. Existing settings/navigation and release-LF checks passed (3). Translation checks passed (2). Mobile dark/light screenshots inspected. No live account, paid AI or physical iPhone tests.

# Update — Reppsy 2.33.0, 2026-10-27 (Codex)

- Remote backup `backup/main-20261025-before-library-polish` at `822f392`.
- Added `data/library-expansion.js` after recovery, six unique variations, bilingual cues and twelve `img/library` sketch phase assets. Source research/adaptations recorded in `docs/EXERCISE_EXPANSION.md`; public wrkout repository fetched/read, external fitness websites blocked. Original generated sketches; no copied photos. Offline CORE includes script and artwork.
- Simplified recipe/recovery/routine prose in data files and `js/app.js`, removed source history and clip feed from recipe screens, retained unknown nutrition requirements, safety cues and licensing credits. Analysis tips collapsed, profile privacy caption shortened.
- Export helper accepts reviewed library boards as well as recovery boards. Existing exercise IDs/routines/history unchanged.
- Follow-up: section preferences now persist in `settings.sections` (bounded boolean map); removed calm control and normalized obsolete flag, retaining OS reduced-motion accessibility. Full-width opaque navigation covers bottom safe area; removed inherited centering transform. Build `20261027.1`.
- Validation: 23 browser/LF checks passed across Settings persistence/animation/nav safe area, library search and phase images in both languages, recipe copy/recovery flows, responsive layouts, offline recipes and verified update. Three Node translation/routine-art tests passed. Library test now waits for sheet close/unlock before the next search. Dark Settings/safe-area screenshot inspected. No live database changes or physical-phone verification.

# Update — Reppsy 2.32.0, 2026-10-25 (Codex)

- Remote backup `backup/main-20261025-before-food-analysis` at `864f319`.
- `js/ai.js`: local all-or-nothing exact database/quantity matching, explicit portion-label grammar, documented volume density, brand/shaker clarification before API; strict response validation, timeout, improved label/portion/photo instructions. Complex cases still require the owner's configured API key; no external product-search service or fake BioTech nutrition added.
- `js/app.js`, `js/store.js`: replace fuzzy calorie-only database override with identity+all-macro agreement; retain protein/carbs/fat corrections through cleaning/export/sync. Remove global portion bias. Text analysis works without key when exact, review supports description/details refinement. API responses remain estimates.
- Default planner agenda with compact activity cards, edit/completion, day/week retained; small-phone large-Hungarian-text toolbar wraps. EN/HU strings in `js/i18n.js`, styles in `css/planner.css`.
- Validation: 15 Node tests (food routing/labels/validation, planner, translations) and 15 browser/LF checks passed (food review and macro persistence, calorie-similarity regression, planner editing/import/overlap/layout, responsive/offline recipes, verified update preserving diary). Hungarian mobile agenda visually inspected. No live paid API, physical iOS or live database changes. Existing calendar relay deployment remains outstanding.

# Update — Reppsy 2.31.1, 2026-10-24 (Codex)

- Backed up current main `bc7dfd9` to remote `backup/main-20261024-before-food-recovery-art` before changes.
- Owner clarified recovery should match the exercise library's simple black-outline sketches. Replaced all 17 movement pairs (34 phase URLs); shaded anatomical trials were discarded. `data/recovery.js` instructions, IDs and programme doses remain unchanged. Portrait preview ratio in `css/recipes-stability.css` fits the new phase artwork.
- Seven clip recipes now have separate full-resolution food photos matching the existing neutral stone/ivory-tableware style. `data/clip-recipes.js` uses the existing AI-photo caption; nutrition and ingredients unchanged. No food sheet crops. Cooking-step sketches are retained.
- Provenance/README files in `img/recipes/` and `img/recovery/`; `tools/export_generated_art.py` encodes reviewed original generated PNGs. Legacy procedural generators stop rather than overwrite the reviewed artwork.
- Validation: 19 browser/LF checks passed (recovery recipes including all 34 sketch decodes, responsive polish including offline recipes, recipes/stability routing, verified update preserving diary, release LF); translation and routine-art Node checks passed (3 tests). Mobile previews visually checked. No live account/database changes; physical iOS not checked.

# Update — Reppsy 2.31.0, 2026-10-23 (Claude)

Owner put six screen recordings and seven screenshots in `Videos_Photos/` (kept out of git via `.gitignore`) and asked for their content in the app: a recovery part for the knee, plus foods side by side with macro names and images, little guide images and more separate steps. Videos were read frame by frame (no speech transcription available here: the model hosts are blocked), so only what is shown on screen is used and everything else is marked as our suggestion.

- `data/recovery.js` + `img/recovery/*.svg` (original drawings, `tools/recovery_art.py`): Knee band routine (10), Knee stability circuit (9), Pelvic tilt reset (4). Shown on Workout → Stability pages as Ready to add cards → preview sheet with start/finish drawings and cues → Add / Add and start. Routine ids are fixed (`rec_*`) so a programme is added once; `focus` keeps them out of the strength rotation (Codex's mechanism).
- `data/clip-recipes.js` + `img/recipes/clip-*` illustrations (`tools/recipe_art.py`): muffins, meat roll, five juices; new `drink` category. Cards show macro names; method = separate step cards with `js/cook-art.js` drawings (also used by Codex's cook mode, replacing its abstract icons). Amount values may be `[hu, en]`.
- `js/muscle-ranks.js` growth tiers from the tier-list screenshot (labelled as opinion); fibre target line in Targets; planner editor CSS fix; `tests/test_recipes_stability.py` made data-driven (it hard-coded 19 recipes and the first card).
- Not done: the meat-roll quantities and air-fryer setting (not shown in the clip); the video's bulking rule (kept the existing calculation); calendar relay deployment (origin not confirmed).

---

# Update — Reppsy 2.30.0, 2026-10-23 (Codex)

Owner requests watching new videos and extracting their content, separate knee recovery/stability inside Workout, and Recipes instead of Ideas with equal-height two-column photo/name/macro cards and cooking tutorials. **No new videos or URLs were supplied.** Asked for links through asynchronous input; extraction and populating recovery from those sources remain pending. Do not claim to have watched new clips. Existing data/additions.js transcriptions retained; no medical program, missing nutrition or ingredient quantities invented.

- Branch `codex/recipes-stability-20261023`; verified remote backup `backup/main-20261023-before-recipes-stability` at 343fd881e8a057f63034ec7b751d2f6b07dd92fa. Code backup only. Normal fast-forward publication remains authorized.
- `js/app.js`, `css/recipes-stability.css`: two equal recipe columns, existing individual full-frame photos, all macros with missing values preserved, category filters, collapsible source clips; guided nested cooking sheet with ingredient checklist, per-step vector illustration, original steps, progress and Back/Next. No automatic food logging. Ingredient checks kept in UI session memory; localized known bilingual quantity strings without changing numbers.
- Workout → Stability has Stability/Knee recovery subpages with honest empty states, new sequence picker and existing routine move flow. Routine editor adds Section selector. Optional private `routine.focus=stability|knee` is cleaned/preserved by Store and travels through existing routine sync/export/import. Strength lists/next rotation exclude these. Public sharing deliberately does not add health-related section labels. No IDs or history changed, no SQL. Added Store capability gate for stale shells and stylesheet/CORE entry; six Workout tabs fit 3×2 on phones.
- Checks: new recipes/stability browser suite covers two columns/equal height/all macros/unknowns/filtering, cooking checklist/back/finish/no-auto-log, missing nutrition, move/create/edit/reload/export/private merge; existing translation walks, individual recipe image/mobile/offline and verified update tests. Text LF and committed hashes checked. No physical iOS or live account mutations.

---

# Update — Reppsy 2.29.1, 2026-10-23 (Codex)

User supplied a BME Neptun timetable synchronization URL. Added exact `neptun.bme.hu` host to the calendar relay (no arbitrary subdomains); full query/endpoint preserved. Calendar connection defaults its name to BME Neptun and adds EN/HU help. No personal URL/token/calendar contents in repo. The supplied live GET was unavailable (URLError), so tests use invented fixtures and do not establish live compatibility. The Edge Function is still NOT deployed; deploy/redeploy per CALENDARS.md. No SQL migration.

Branch `codex/neptun-calendar-20261023`; backup `backup/main-20261023-before-neptun-calendar` preserves main 19a893432eb20f81f49ce4165e64db622d5d8767. Release 2.29.1/build 20261023.1, hashes regenerated. Relay, parser, translations and browser fixture tests run. Normal commit/push to main remains authorized.

---

# Update — Reppsy 2.29.0, 2026-10-22 (Codex)

Owner requested a bilingual audit followed by a minimal daily-routine planner replacing the Goals landing, calendar sync, then commit/push to main for trying it. Branch `codex/daily-planner-20261022`; verified remote backup `backup/main-20261022-before-daily-planner` at actual main b4eabb3ba2421a40eb69d1007eea38de049227bd. Restore by normal commit, never force/reset. Backup is code, not private account data.

- **UI:** `css/planner.css`, `js/app.js` Schedule day/week timetable and activity editor; old habits and progress remain secondary tabs. Completion doesn't log exercise/calories or add competition points. English/Hungarian keys audited (including nested vocabulary/placeholders) and pages/forms/registration exercised; five missing Hungarian singular keys and the nav's aria-label fixed. 876 exercise names and all recipe titles/steps have translations.
- **Data:** `js/daily-planner.js` cleans/merges private planner records, repeats, done/undo, calendar import/resync; `js/store.js` tracks/export/import/deletes planner records and `js/cloud.js` merges them. Calendar links live only in device-local per-owner storage, not exported userdata. Added ICAL.js 2.2.1 UMD distribution/license under `vendor/ical`, npm integrity verified. All new shell files registered in index/CORE, stale-shell helper gates added, release manifest regenerated.
- **Calendar service:** `supabase/functions/calendar-feed/{index.ts,handler.mjs}` is an authenticated read-only HTTPS/host-allowlisted relay with exact CORS, safe redirects, limits and no credential forwarding/storage/logging. **NOT deployed live**: no Supabase tool/CLI/auth binding available. No SQL migration needed. `.ics` import works without it. URL subscriptions require deployment + allowed origins per `CALENDARS.md`; one-way refresh every 15 minutes with Schedule visible. No direct browser access to phone calendars, private OAuth/CalDAV or background sync claimed.
- **Checks:** Node planner/relay/translations + existing routine/ride suites; browser planner create/edit/repeat/undo/delete/reload/export, file cancel/import/resync, live-relay fixtures/failure/missing service/private URLs, day/week phone/light/dark/larger text; translation walks including registration. Existing responsive/offline, clock and verified-update tests pass. Only browser fixtures/local unit checks, no physical iOS or hosted/live account verification.
- **Other assistants:** review the calendar parser range/exception handling, merge/tombstone behavior and function deployment/configuration before extending to private calendar authorization. Keep the explicit unconfigured state until actually deployed.

---

# Update — Reppsy 2.28.0, 2026-10-18 (Claude)

Owner asked for: a more robust PDF/Word/Excel importer, reworked ranks with a muscle figure in a Profile tab, an audit of what lives in Supabase, photo posts, Instagram-style stories that expire (default one day) with named highlight bubbles, likes with a new like button and animation, and smooth open/close/interaction motion. Visibility rule from the owner: anyone with an account, with a private option (implemented as Everyone / Friends / Only me).

- **SQL:** `migrations/20261018_stories_posts.sql` (additive). Tested on local PostgreSQL 16 with `tests/sql/supabase_stub.sql` (`tests/test_stories_sql.py`, run with `GYMAPP_PG`). **Not applied to the live project:** the Supabase connector is connected to the account but switched off for this chat, so I could not list tables or run it. The owner must run the file in the SQL Editor (SOCIAL.md lists the steps); until then Friends shows a note naming the file.
- **Client:** new `js/stories.js` + `css/stories.css` (added to `index.html`, `sw.js` CORE and the stale-shell loader in `app.js`). Pictures are shrunk on the device (≤1080 px JPEG ≤400 kB, 360 px thumb) and stored inline in the row; lists carry thumbs only and `social_media` loads full pictures when a card scrolls into view. Seen stories are remembered per device (`gymapp.v1.seenStories`). The profile-photo like button uses the same heart (class names kept for the 2.21 tests).
- **Ranks/import:** `js/muscle-ranks.js`, `MuscleMap.ranked`, `vRanks`; `pdf-local.js` / `plan-sheet.js` layout handling (`tests/test_import_layouts.js`).
- **Data audit (from the code, not the live database):** everything in the app document syncs to `userdata`; deliberately device-only: the running workout/ride, wheel size, seen stories, and the AI key unless "Sync API key" is on. Table list in SOCIAL.md.
- **Tests:** new SQL, browser (`tests/test_stories_browser.py`, 8 tests, in-memory backend `tests/stories_fixture.py`) and JS import tests pass; full suite compared with unmodified 2.27.0 (see the review log).

---

# Update — Reppsy 2.27.0, 2026-10-18 (Claude)

Owner asked for a clean, consistent redesign, simpler Settings, a way to preview the next workout, and per-set details in finished workouts. Added `css/clean.css` (last stylesheet; tokens + component baseline); `applyLook` forces `data-material=matte`. `shSettingsBody` rewritten (theme Dark/Light seg, swatches, closed custom wheel, Data merges own DB, "More options"); AI/Data groups closed by default. Hero `.hero-preview` → `r-open`; `shWorkout` exercise rows are `<details class="wk-sets">` with `.set-list`. Helpers `shortName()` and `pl()` (EN singular keys `*1`). Tests updated: test_profile_theme_updates, test_color_volume, test_profile_sharing, test_rides_browser; new test_workout_preview_sets.py.

---

# Update — Reppsy 2.26.1, 2026-10-17 (Claude)

The owner's weekday-headed PDF training plan ("THURSDAY - UPPER A / STRENGTH" + `Exercise | Sets x Reps | RIR | Rest` table) imported nothing. `js/pdf-local.js` draft(): a short weekday heading now opens a lazily-added workout (pushed only when an exercise row follows, so weekday meal plans are unaffected); table headings map RIR/Rest columns; `restSeconds()` reads ranges and units; `titleCase()` for all-caps headings. `js/plan-sheet.js` `exercise()`: ordered Hungarian phrase → library ID fallback (`HU_WORDS`) when no exact name match. Test: `tests/test_pdf_weekday_plan.js`. The personal PDF is not in the repo.

---

# Update — Reppsy 2.22.1, 2026-10-12

User reported the 2.22.0 update failing with "check internet connection". Cause: CRLF in vendored leaflet.css was normalised to LF by git, so its published sha256 differed from release-manifest.json and the service worker's verified install failed. Converted to LF, rebuilt manifest, added `tests/test_release_files.py`. Always run that test (or check `git show origin/main:<path>` hashes) after adding vendored files.

---

# Update — Reppsy 2.22.0, 2026-10-11

User asked for a Strava-like cycling section (session tracking, route, smart accessories) and reported the tab bar briefly see-through when pages load. Added `js/rides.js` (recording state machine, polyline storage, GPX/TCX parse, GPX export, BLE packet parsing/pairing), ride UI in `js/app.js` (Workout → Ride tab, live overlay `#ride-live`, pill `#ride-pill`, detail sheet, import), `css/ride.css`, vendored `vendor/leaflet` (BSD-2). Rides are workouts with `ride` (cleaned by `Rides.clean` in `Store.clean`; `Store.supportsRides` gates stale shells). CSP img-src now includes `https://tile.openstreetmap.org`. Fixed inert download links inside modal dialogs. Tests: `tests/test_rides.js`, `tests/test_rides_browser.py`. User may later want a native (Capacitor or fully native) app for background GPS and Bluetooth on iPhone.

---

# Update — Reppsy 2.21.3, 2026-10-11

User reported the Settings → Account checkmark briefly rendering large, asked for a whole-app bug/animation pass, and for updates to show only a nicer spinning logo without the moving outline. Pop keyframes moved from persistent state classes to one-shot `.pop` classes (AI key, picker rows, favorites); chat/header replay removed; overlay now uses `icons/reppsy-mark.png` with ease-in + linear spin and `settleMark()` to an upright stop; ring/track/focus outline removed. Details sections glide via WAAPI, tab bars sticky, bilingual clip routine notes split by language. Release 2.21.3/build 20261011.1, no SQL. `tests/test_browser.py` failures pre-date this change (stale profile tab / seeded split / energy prompt assumptions).

---

# Update — Reppsy 2.21.2, 2026-10-10

Work branch `codex/profile-picker-likes-20261010`; remote backup `backup/main-20261010-before-profile-picker` preserves main 1ef257fae38afb8622701380d20434283deefa97. Backup is code, not private diary data. Normal fast-forward publication remains authorized.

Native file-input cancel bubbles to the dialog; the dialog cancel listener now ignores descendant events instead of dismissing the editor. Draft/scroll lock remain intact, actual Escape still closes. Confirmed photo likes animate the count and enlarged-photo heart after refreshed server activity; errors never increment or animate. Calm and OS reduced motion disable both. Release 2.21.2/build 20261010.7, no SQL required. Focused regression and verified-update fixture tests; no physical iOS/live deployment verification.

---

# Update — Reppsy 2.21.1, 2026-10-10

User requests nicely rotating update logo, centered Daily goals count, and clocks that charge smoothly. Added gentle 2.8-second mark rotation (pause on ready), explicit counter/percentage alignment, and 650ms cubic eased tick progression for Goals/Food/Profile clocks. Rendering snapshots actual visible ratio before replacing DOM; rapid edits/undo continue from that ratio. Per-date keys isolate diary/goal days, over-target ratios cap at 1, numeric labels/account data stay exact and immediate. Detached clocks stop RAF; calm/reduced motion jumps to final ratio and disables CSS motion.

Backup `backup/main-20261010-before-clock-motion` verified at 5f12d74fb54f8e952e113c869af1d8609649f118 (actual main). Branch `codex/clock-motion-20261010`, release 2.21.1/build 20261010.6. No SQL changes. Functional browser interpolation/undo/rapid changes/centering/reduced motion tests, real update and responsive/offline checks; physical iOS/live deployment unverified. Publication to main remains authorized; no force/reset.

---

# Update — Reppsy 2.21.0, 2026-10-10

User now authorizes removing their original personal default split from everyone's pages and asks for an importable copy, photo double-tap likes, sharing-update fixes, collapsible achievements and simpler optional reviews. `exports/reppsy-original-five-day.json` preserves five routines/35 movements with stable personal_* IDs, builtin=false and appendRoutines=true. Import through Settings Data JSON; includes no private diary/account data. Default seeding now only retains the two video complexes; the optional general ULPPL library uses separate generic movements. Archived PLAN remains for exercise-name/tip/muscle references.

Store.clean retires only exact original builtin copies (IDs, name/sub, labels, item order, sets/reps/rest). Edited/explicit copies, active workouts and history remain. Deletion markers and routine timestamps prevent old synced copies returning. Initial load persists new retirement markers. Cached-shell bootstrap refreshes Store, RoutineTemplates and RoutineShare via capability markers. Other devices must update; no live userdata rows have been mutated.

Shared updates refetch server activity, show changed/current state and a success message. Existing SQL republish is tested to replace one snapshot under the same ID. No new migration required beyond already installed social files. Reviews open via icon in a nested sheet with star buttons; failures retain the draft, success clears/closes it, explicit edit reloads saved text. Desktop/touch photo likes are idempotent and owner/target/current-photo guarded; touch drags and canceled pointers excluded; modal lock retained. Achievements use remembered open-by-default miniSection.

Backup `backup/main-20261010-before-routine-review-polish` verified at fb6ff0b4cc505c8979739dd8c9a15691719f02bc (actual main). Work branch `codex/routine-review-polish-20261010`. Normal fast-forward publication authorized; never force/reset. This backup is code, not private account data. Release 2.21/build 20261010.5. Focused browser and disposable PostgreSQL tests only, no live accounts/physical iOS/hosted deployment checks.

---

# Update — Reppsy 2.20.0, 2026-10-10

Current work: `codex/cover-competition-polish-20261010`, based on main a962be524cdaae60750853bd22c69702c340c006. Verified remote backup `backup/main-20261010-before-cover-competition` preserves that exact commit. Restore by a normal restoration commit; never force/reset. Existing handoff authorizes tested work to be committed/pushed to main. Code backup is not private diary data.

Release 2.20/build 20261010.4 adds photo/design covers, simplified Friends search/discovery, check-in and meal consistency points, weekly ranks and Goals challenges. User steering adds three introductory lift ranks from 1 kg and four earned badges. Existing lift thresholds, calorie budgets, private sync/import data and storage keys retained. Settings accent presets stay; profile presets above its wheel removed.

Run the entire additive `migrations/20261010_consistency_covers.sql` after the three previous social migrations. Prepared/tested locally, NOT applied live. Existing friends fallback safely if dashboard_v2 is missing. Accepted friends get only active cover and aggregate totals/badges; pending profiles hide them. No private diary entries or weights become readable. The helper RPC regex now permits digits for `_v2`; cached-shell bootstrap refreshes changed helpers.

Disposable PostgreSQL tests exercise repeated migration, permission boundaries, JS/SQL point/badge parity, all nine thresholds for all four lifts and check-in undo. Chromium fixtures cover photo persistence/removal/backup, friend search/types, ties/long names, narrow/landscape layouts and update/offline install. No real user account operations or physical iOS verification. Apple/W3C/NNGroup internet research requests returned proxy 403; do not claim freshly researched guidance or hosted deployment checks.

---

# Update — Reppsy 2.18.0, 2026-10-10

User requested vivid accents/pink/better royal blue, optional open-by-default collapsibles, a top-right profile photo, improved private profile customization, Reppsy inside the wheel and available-only header updates with smooth restart/feedback. Seven vivid presets retain existing hue IDs and add 350=pink; royal RGB53/88/244. New custom selections use vivid OKLCH; existing soft saved hues stay soft until edited. AccentTheme chooses readable fill/text contrast. Circular profile shortcut and photo-based bottom Profile icon retain the five-tab navigation.

Settings cards and nested accent/custom/background sections are native details, initially open, retaining deliberate closures in UI memory while navigating or changing themes. They reset open on a fresh app load. Profile editor previews names/bio/photo and cover/color/frame immediately. New optional settings.profileStyle={cover:glow|mesh|stripe|clean,frame:soft|round|ring,useAccent:boolean} is private, cleaned/exported/restored/synced with account settings. Public profile layout format and Supabase RPCs/themes are unchanged. Friends still receive the existing shared photo/bio/theme/badges. Update other devices before editing profileStyle to avoid old cleaners dropping it; no SQL required.

App/update settings card and old ready-update banner removed; version/notes/shortcut help are a small footer. AppUpdates validates and compares stable version/build, rejects downgrade, uses an 8-second timeout and throttled startup/foreground/online/60-second checks. Only Settings header shows the update button when newer; no unconditional reload. Update acquires ModalLock, verifies the complete release through existing worker, saves before reload and compares expected build on restart before saying updated. Errors release lock and allow retry. Reduced motion is respected. Boot fallback loads new helpers and a cleanStyle-capable Profile before storage initialization, including older cached HTML. Dependency retries use release-tagged URLs and stop with a reload prompt if an incompatible script persists.

11 Node tests, five new local Chromium tests, six existing color/dl regressions and three existing responsive/photo/offline tests passed. Reviewed 320px HU with enlarged text/390px EN light screenshots. Real service-worker fixture installed a synthetic next release, showed modal progress, reloaded to its confirmed build, retained volume diary/profileStyle and hid update again. No live account operations; physical Safari and hosted deployment unverified. Screenshots /tmp/reppsy-settings-* and /tmp/reppsy-profile-preview-320.png.

Verified backup backup/main-20261010-before-profile-colors-updates preserves a5bff33fc4a1fe8b935036498f01872be02ec8cd. Normal restoration commit only, never force/reset. Code snapshot is not private diary data. Branch codex/profile-colors-updates-20261010.

---

# Update — Reppsy 2.17.0, 2026-10-10

Always-visible Custom color section inside Appearance, circular hue control with 46px thumb, pointer capture and keyboard support. Live OKLCH palette matches existing soft hue colors. Final gesture saves immediately; preset indicators update during drag; changing background/preset keeps the picker visible. Whole Appearance group can still be intentionally collapsed.

New FoodVolume helper uses each food's real gram/volume pair (explicit HU metric first, then documented USDA US cup/tbsp/tsp/fl oz). No water-density fallback. Supported liquids default dl with portions and optional grams switch. Missing volume offers own-label entry. Own-food basis per100ml and manual/recent dl logging work; optional vml/basis survive cleaner/export/restore. Nutrition remains per100g for database/old own foods and per100ml only for explicitly selected label foods. No migration of existing diary/plan grams, no guessed mass for label drinks, no SQL changes. Older clients strip these optional fields, so update other devices before editing new volume entries.

Eight Node tests plus six focused local Chromium checks cover conversions, missing data, solids, invalid bounds, hue geometry; wheel drag/keyboard/theme/reload; milk and label/manual dl, recent entries and backup roundtrip. Existing four responsive/recipes/photo/offline tests also passed. Touch emulation reviewed separately. Fixtures disable cloud accounts. Physical phones, deployment and live sync not verified.

Verified pre-edit backup backup/main-20261010-before-color-wheel-liquid-portions preserves 3471136339f3ee0e8722c5d6d31b7edc66126811. Restore by normal reviewed commit, never force/reset. Code backup is not private diary data. Current work branch codex/color-wheel-liquid-portions-20261010.

---

# Update — Reppsy 2.16.0, 2026-10-09

User explicitly selected Reppsy as the current name and requested a cool logo that is not an R. Created a custom AI-generated apricot/coral interlocking motion-link mark on graphite, retained unmodified master at icons/reppsy-source.png and exported Apple180/browser192/install512/maskable512. Old icons remain. Updated HU/EN appName, header wordmark/symbol, login/onboarding, HTML/title/Apple metadata, manifest names, runtime cached-shell metadata refresh and export filename prefixes. Four deployed icons included in verified offline CORE. Storage keys, manifest id/start_url/scope, account configuration, diary/history/plans and custom theme settings unchanged. Name availability is unverified.

Syntax/whitespace/hash checks and local Chromium at 320px HU/390px EN passed for names, header load, manifest identity/icon dimensions, old-metadata refresh, backup filenames and diary persistence. Fixture-only sign-in branding and real verified SW install/offline reload passed. Review script/screenshots /tmp/reppsy-brand-review*. No formal new test files, no live account calls, physical OS shortcut refresh or deployment verification. iOS shortcut metadata limitations and export-before-re-add guidance retained in BRANDING.md/Settings.

Verified remote pre-edit backup backup/main-20261009-before-reppsy-brand preserves b7b4e596491f3512934ee8e379d78f626ff7a382. Restore through a normal reviewed restoration commit; never force-push/reset. Code backup is not private diary data.

---

# Update — Setora 2.15.0, 2026-10-08

Completed responsive Food action tiles (Describe stays intact), content-sized/wrapping navigation and exercise filters, safe-area-aware fluid gutters, adaptive action/macro/footer layouts and dial text, plus recipe ingredient-note wrapping. Compact Hungarian Settings caption on narrow phones retains the full accessible name. Profile photos (own, editor and viewed friend) are independently clickable buttons only when a real avatar exists; small friend-row avatars stay spans inside their parent buttons. The shared modal and existing ModalLock preserve background blocking and nested-editor drafts. Empty-profile filler and an all-zero budget equation are suppressed; labels are shorter. Private data schemas, keys, sync protocol, plans/diaries and exercise media are unchanged.

All 19 recipe images were independently generated, matching existing dishes/ingredients. Native 1448x1086 WebP detail (quality92) and 384x288 whole-image thumbnail (quality90) for every recipe. Replaced/removed old atlas and flatbread PNG, crop logic and CSS. All 38 new files are content-hashed CORE assets; detail references eagerly load, lightweight list images lazily load. Generated serving captions remain explicit. Original PNGs retained unchanged in /workspace/generated_images; durable exported assets and generation notes in img/recipes.

Four focused tests in tests/test_responsive_polish.py passed: 16 viewport/language/text scenarios; all tabs/subtabs, active workouts and populated diary; action/dialog/label bounds; all 19 hero images; avatar view/background lock/editor draft/reload; real verified SW install and all recipe assets after offline reload. Six tests/test_routine_templates.js checks also passed. Recipe/ingredient and offline tests repeated after the final ingredient-wrap change. Visually reviewed 19 independent dish previews and screenshots in /tmp/setora-responsive-review. Physical phones, live account operations and deployment not verified. Existing broad browser suite was not run (older release-specific expectations); user permits useful focused tests.

Verified remote backup backup/main-20261008-before-responsive-individual-photos at cd9eaa1be50d19341e830aa3479ee10ee70cfecb before editing. Restore by a normal reviewed restoration commit, never force-push/reset. Code backup is not a private diary backup.

---

# Update — Setora 2.14.0, 2026-10-08

Expanded all optional starter sessions to seven valid exercises and approximately 60–70 minutes. The five-day starter follows PLAN exactly; existing original built-ins remain unchanged. Pure duration estimates count warm-up/preparation, equipment changes and only between-set rests, respecting zero. Conservative pristine-copy migration runs after successful cloud sync (or immediately when cloud is disabled), preserves edits/IDs and never recreates deleted sessions. Original video records now appear as independently startable Exercise complexes under Workout → Exercises, excluded from Plans/recommendations. Circuit rounds and pulldown grips/AMRAP/tempo are preserved. Storage keys/schemas, sync protocol, exercise imagery, active/history snapshots and calorie calculations are unchanged.

Six focused Node tests passed, plus isolated local Chromium assertions/screenshots at 320px EN and 390px HU: 35-movement five-day preview/add, both complex starts, ten-round zero-rest circuit, pulldown AMRAP/tempo, no next routine when only complexes remain, no page errors/overflow in reviewed states. Browser review script/images in /tmp/setora-full-sessions-review*. Live account sync, deployment and physical Safari unverified. User permits helpful tests per latest instruction.

Verified remote pre-edit backup backup/main-20261008-205949-before-full-sessions-complexes at f005884df8d1e320c9d455d44a8bd8f60fab3b7e. Restore via normal reviewed commit; never force-push. Code backup does not include private diary data.

---

# Update — Setora 2.13.2, 2026-10-08

User requested an update action beside Upload, only in Settings. head() accepts an explicit update flag enabled only by vSettings; an accessible update-app icon appears immediately before Upload and uses settings-update to forward to the existing update-now handler. This preserves the existing App-section control/selector, busy/disabled state and update-status announcement. Other headers remain unchanged.

Syntax/whitespace and focused local Chromium review at 320px EN/390px HU confirmed Settings-only button counts, contained header bounds, release-check request and re-enabled button/error status after a deliberately unavailable local release response. No tests added/run for this low-impact UI change; user now permits relevant tests when useful, superseding the former blanket no-tests rule. No live successful installation or physical Safari verification. Remote backup backup/main-20261008-204107-before-settings-update-button preserves 02194715b94d61636202a2bca31f0e88de897a67, verified before editing. Normal restoration commit only; code backup is not private diary data.

---

# Update — Setora 2.13.1, 2026-10-08

User screenshot showed the Workout cardio Add button extending beyond its card while the text collapsed into a narrow strip. Root cause: shared .btn width:100% combined with cardio-shortcut flex:none. The shortcut now uses minmax(0,1fr)/auto grid at wider widths and a single-column layout at <=480px, with the Add button below full-width copy. Shared .btn bounds/wrapping, zero-minimum row2/row3/inline grid tracks, and wrapping h2row headings prevent related intrinsic-width action overflow. Existing button actions, diaries, routine/sync/storage formats, themes and modal locks are unchanged.

No tests added/run. Syntax/whitespace/source review and manual local Chromium screenshot/geometry review used isolated local storage at 320px EN,390px HU,430px EN and320px HU with20px root text. Reviewed Workout/Food/Goals/Settings/Profile, expanded Settings groups and cardio form opening; no visible controls exceeded their viewport/card/grid in those states and no page errors were recorded. Browser scripts/screenshots stayed outside the repository. Live serving, populated account-specific states and physical Safari remain unverified. No SQL changes required.

Verified pre-edit remote backup backup/main-20261008-203114-before-action-layout-fix preserves fb131048c94a828451c8a39c47b0d903bf29c966. Restore by normal reviewed commit, never force-push. Code backup is not private diary data.

---

# Update — Setora 2.13.0, 2026-10-08

User requested consistent tab/button animations, switches where appropriate, more customization with red/royal blue, separate Profile rank tab, new Goals/routine icons, editable popular splits and removal, and accent fixes for lower/pull/legs/Centr/back routines.

All main/inner navigation uses go('tab'); render preserves existing entry animation until its timer ends so a quick Social refresh does not cancel Profile animation. Generic press transitions cover buttons/summary controls and obey calm/reduced-motion settings. Native .sw checkboxes now have switch roles/track+thumb styling; exercise selectors/import approvals retain checkbox behavior. No preference semantics changed.

Crimson red (217,56,73) and Royal blue (65,105,225) use white text on vivid fills, lighter readable accent text in dark mode and the fill color for text in light mode. Optional settings.accentTone='vivid' is sanitized/persisted, defaults to 'soft' to preserve prior custom hue colors, and the custom slider/reset returns to soft. Hue values 25/270 identify the new presets only with vivid tone. All devices should update before editing this optional setting to avoid older clients dropping it. Routine icon CSS overrides all legacy hard-coded colors, including light mode and editor choices. Only inline routine/Goals icons changed; detailed exercise illustrations are untouched.

Profile now has Overview / Your lift ranks / Friends; rank shortcuts select the ranks page and the old overview disclosure is removed. js/routine-templates.js offers five optional original starter splits with 24 sessions total and valid current exercise IDs, previews and suggested days. Add appends normal routines with unique IDs and existing bilingual name/sub/info fields; no program schema/migration is added. Matching sub names allow collapsible groups with short displayed day names and full saved/accessible names. Individual sessions remain separate. Original five-day split and imported routines remain unless the user removes them. Remove is available in every detail footer/editor, confirms intent, rolls back on save failure and preserves logged/current workout snapshots. Store.clean accepts explicit empty arrays so deleted last routines do not reseed, while missing/non-array routine data still falls back to defaults. Existing delete tombstones/private sync remain.

No tests added/run. Source/syntax/whitespace and manual local Chromium screenshots at 320px EN dark /390px HU light reviewed main transitions, rank navigation, palettes/switches, routine accent colors, library/preview/add/edit/remove and empty reload. Recorded all five main entry markers, original seven icons in current blue accent, 7→12→11 routine counts, removed built-in Lower absent after reload, empty=0, vivid Royal persisted, no page errors/horizontal overflow. Screenshot scripts and synthetic storage remained outside the repository. External Muscle & Strength/Fitness Wiki/Wikipedia research requests were blocked (proxy 403), so templates are common split structures rather than live-verified published prescriptions. See ROUTINE_TEMPLATES.md. Live sync, offline installation, served deployment and physical Safari remain unverified. No SQL migration required.

Verified remote pre-change backup backup/main-20261008-201056-before-routines-motion preserves 9fb446c4efc1d441e8842e8a69865b5219fb937d. Restore by normal reviewed commit, never force-push; code backup is not private diary data. Release history also fixes the old recipe update's variable version/build entry to its original 2.11.0/build11.

---

# Update — Setora 2.12.0, 2026-10-08

User rejected the crowded Friends section and reported lookup failures after running both SQL files with existing accounts; then requested a separate Friends page under Profile's top navigation. Profile now has Overview/Friends tabs; rank navigation from Workout explicitly selects Overview. Friends has full-size search, own published username, request feedback beside the field, direct accepted-profile rows and collapsed competition/discovery. Add button uses auto width in a constrained grid, fixing the inherited full-width button squeezing the search input. Draft search text survives rerenders and errors; changing lookup type clears it. Search accepts @username and case normalization.

Social.refresh syncs private data, reads social_dashboard and publishes a valid previously chosen private saved username ONLY when the current authenticated user has no social profile. It then reloads the dashboard. No usernames are invented; existing published records are not overwritten, conflicts require choosing another username, owner checks guard account changes, and contact discovery stays explicitly opted-in/verified. Existing Auth users without saved usernames still need Profile → Edit profile once. Both users must open the updated app for automatic missing-profile repair. No new SQL is required after the previous two migrations succeeded. Live account lookup/SQL remains unverified; no admin connection exists. SOCIAL.md contains activation and existing-account guidance.

No tests added/run. Syntax/whitespace and manual local Chromium screenshots at 320px EN dark /390px HU light used synthetic account responses only, reviewing Overview/Friends, missing-profile publication, search error/success/pending and connected competition. The demo recorded dashboard→publish→dashboard, usable search widths around 173/183px, no page errors or horizontal overflow. No private/live accounts, offline installation, served deployment or physical Safari were verified.

Verified pre-change remote backup backup/main-20261008-195049-before-friends-rework preserves 7deb064c2c7c0aeafed13a5f23dc8cc3f5ff832f. Restore via a normal reviewed commit, never force-push; code backup is not private diary data. Existing routine/diary/storage/private sync formats and detailed exercise images remain unchanged.

---

# Update — Setora 2.11.0, 2026-10-08

Added illustrative reference photos for all 19 existing recipe ideas, including the four imported recipes. img/recipes/reference-atlas.png is the original generated 3×6 contact sheet, clipped into individual servings with CSS using measured centers; img/recipes/ham-flatbread.png is the separate original flourless quark/egg flatbread reference. No photo pixels were edited. Both are included in sw.js CORE and release-manifest hashes; approximately 6.5 MB additional offline assets. Nutrition/source/ingredients are unchanged and captions clarify the pictures are illustrative. See img/recipes/README.md for provenance.

Theme borders and navigation use accent-derived variables in dark/light appearances; applyLook explicitly sets --acc-tx for custom dark hues instead of falling back to fixed apricot. Custom-color disclosure state survives render/refreshSheet, and palette/background/reset actions cancel pending hue redraws. Existing appearance/accessibility choices remain.

SOCIAL.md now gives complete dashboard SQL installation and account steps. Neither live social migration has been executed here; no database admin connection is available. Username search needs both signed-in users to publish usernames and the recipient to accept. Email/phone require verified, opted-in contacts; phone additionally needs an Auth SMS provider.

No tests added/run. JavaScript syntax and whitespace review plus manual local Chromium screenshots at 320px EN /390px HU showed all 19 images, custom-color disclosure remaining open after palette/background choices, blue borders/navigation with blue accent, no page errors and no horizontal overflow. Screenshot helper and synthetic browser state remained outside the repository. Live deployment, real account sync, offline installation and physical Safari remain unverified.

Verified pre-change remote backup backup/main-20261008-192822-before-recipe-theme-update preserves 15a8efde24ff0e417d49bfb3816df024190ba0f5. Restore using a normal reviewed commit, never force-push. Code backup is not private diary data.

---

# Update — Setora 2.10.1, 2026-10-08

Food's calorie headline/bar is replaced by the same lined dial as Profile. A shared calorieClock helper keeps eaten/budget/remaining/over/no-target output consistent; Food uses its selected diary date and optional exercise-adjusted budget. Base target, separate lifting/cardio panel, macros and food actions remain. No tests added/run; syntax/whitespace and manual 320px EN /390px HU Chromium layout review used synthetic meal/workout data. Live serving/physical Safari remain unverified.

Verified pre-change backup backup/main-20261008-191845-before-food-clock preserves 65fa083e6a542e07f76dd84b258bb66a4abe4876. Restore by normal reviewed commit, never force-push. Code backup is not private diary data.

---

# Update — Setora 2.10.0, 2026-10-08

User requested calories from lifting data, cardio logging and optional inclusion in daily intake. Implemented net active estimates from logged lifting + confirmed minutes/body weight/intensity; kg×reps does not become calories per exercise. Finish can skip estimates; old logs require missing inputs. Cardio supports walk/incline/run/stairs/cycle/elliptical, standalone/active/saved workouts. Food/Profile keep the base target and show lifting/cardio separately, using optional base+active−eaten. Existing manual daily activity inclusion replaces estimates, never stacks. Default workout inclusion is off; activity multipliers can already include workouts. See WORKOUT_ENERGY.md.

New js/workout-energy.js is loaded before Store, available through cached-shell fallback and included in verified offline assets. Store sanitizes/preserves session energy and cardio, allows cardio-only logs and active-cardio drafts, and saves independent energyAt/cardioAt timestamps. Cloud merge preserves newer field edits while keeping original entries/deletion/warm/cool behavior. JSON formats/data keys retain compatibility, but all devices should update before editing added fields. No SQL migration is required; social activation remains separate.

No tests added/run. Syntax/whitespace and manual Chromium screenshots at 320/390px EN/HU reviewed Food/Profile, workout summary, lifting/incline/stairs forms with synthetic local data. Example net strength184+cardio166=350 yields 726 remaining from2410 base/2034 eaten. No runtime errors or horizontal overflow recorded. Live sync, real calorimetry, physical Safari and served deployment remain unverified. Backup backup/main-20261008-190313-before-workout-calories preserves 88aefd36749b4826c24b8aa1e75b605604b3e88c, created and verified before edits. Restore through a normal reviewed commit, never force-push. Code backup is not private diary data.

---

# Update — Setora 2.9.1, 2026-10-08

User screenshot showed Profile Carbs displaying a floating-point sum (`208.60000000000002`) across the Fat column. Profile now formats macro totals through the existing one-decimal rounding helper before language-specific decimal formatting. Value/unit flex rows constrain and wrap within the three grid columns; bars remain aligned. Nutrition storage, calculations and other displays are unchanged.

No tests added/run. Syntax/whitespace reviewed. Manual Chromium screenshots used the screenshot's synthetic meal totals in 320px English and 390px Hungarian, plus unusually large totals at 320px; displayed values round correctly and documents have no horizontal overflow or runtime errors. Physical Safari remains unverified.

Backup backup/main-20261008-185133-before-macro-layout-fix was created and verified before edits at 0bdb59130539d8706518057731d2e2878545dbee. Restore via a normal reviewed restoration commit, never force-push. Code backup is not private diary data.

---

# Update — Setora 2.9.0, 2026-10-08

Latest user request: persistent menu navigation, lined dials, username/email/phone friends, rank-arrow correction, simpler tabs, premium appearance chooser, new name. Setora is a working name (availability unchecked). Settings is now a regular page with functional bottom navigation; editors/images keep their modal background lock. Quick section jumps and remembered collapsed advanced sections; curated OKLCH palettes/background previews preserve numeric custom hue and calm/solid/light modes. Workout/Goals subtabs are sticky, Food search primary, Goals tick dial and optional templates, ranks moved above friends with native-toggle state and open-arrow rotation. Detailed drawings remain restored.

Social client adds exact contact modes and own opt-in discovery settings; additive migrations/20261008_social_contacts.sql uses verified Auth email/phone, private RLS tables, RPC grants, generic unavailable-account responses and 20/hour contact limits. Auth SMS phone-change/verify UI requires configured provider. Original social migration and contact migration still need live SQL Editor activation; no DB admin credentials are available. No new private contacts are published to friends. No live users/messages created. Existing data keys, schemas and onboarding metadata stay compatible.

No tests added/run. Syntax and whitespace reviewed; manual Chromium screenshot review covered all tabs and subviews at 320/390 px, dark/light/custom/solid preferences. Disposable authenticated fixtures rendered discovery/phone controls and open rank arrow; no page errors or horizontal overflow recorded. SQL was not executed; live Supabase/SMS/physical Safari and served deployment remain unverified. release-manifest.json regenerated for 2.9.0 / 20261008.7.

Backup initial branch backup/main-20261008-180000-before-navigation-friends was verified before edits at 4e12a14f47342f0204571d4578bb100d0e69a267 (its label used a fixed time). The same original main is also saved with the actual UTC timestamp at backup/main-20261008-164148-before-navigation-friends. Preserve both and older backups. Roll back by a normal reviewed restoration commit with a newer release, never force-push/reset. Code backup is not private diary data.

---

# Update — Otisport 2.8.1, 2026-10-08

User rejected the new schematic. Restored the previous detailed data/body.js anatomy and its colors; movement images open first again. Removed the custom body asset/renderer/cache dependency. Personalized signup and navigation remain. No tests run; syntax/whitespace reviewed. Remote backup backup/main-20261008-161655-before-drawing-restore preserves 50018935f9d808f2d18910304243657aa402692c. Restore by normal reviewed commit, never force-push. Code backup is not private diary data.

---

# Update — Otisport 2.8.0, 2026-10-08

Navigation is Workout/Food/Goals/Settings/Profile, with header Settings removed. Personalized signup previews calories from goal, sex, age, height, weight and activity; validated private Auth metadata survives email confirmation and feeds the initial profile/diary target after sync. Existing targets and reset epochs are protected. The shared calculator retains the earlier formula. Original Otisport front/back SVG anatomy adds red primary/rose secondary highlights and Muscles/Movement tabs, retaining existing exercise images/zoom/actions. Settings provides honest home-screen name/icon update guidance; runtime metadata and stable manifest ID help ordinary browser/PWA updates without claiming forced iOS shortcut refresh.

See PERSONALIZATION.md for persistence and limits. No tests added/run. Syntax/whitespace and manual Chromium screenshots used disposable demo account responses and synthetic body data in HU/EN, dark/light, small mobile, including confirmation-required sign-in and resulting meter. No live users were created. Lyfta's public website was inaccessible (proxy 403); the original schematic follows the user's description. Physical iPhone/Safari, live Supabase/email and live deployment remain unverified. The broader unfinished exercise-media migration and social SQL activation remain separate.

Verified backup before edits: backup/main-20261008-114552-before-personalization at 7283b1e59e6db77301070a12804afca8a374afc7; complete history bundle /workspace/GymApp-backups/GymApp-before-personalization-20261008-114552.bundle. Preserve previous backups and restore via a normal reviewed commit with a newer release, never force-push. Code backup is not a private diary export.

---

# Update — Otisport 2.7.0, 2026-10-08

Continued the design handoff after comparing it with current main (2.6.1). The whole app now shares a graphite/apricot/lavender theme and matching warm light theme in css/otisport-theme.css. Headers, navigation, workout views, Food/weekly plans, Goals, Profile, Settings and import dialogs use consistent surfaces and controls. Custom hue/background/cover colors, reduced motion and opaque surfaces are retained. No data or account migration. See DESIGN_REFRESH.md for scope and safe restoration.

No tests added or run under the user's instruction. Syntax/whitespace checks and manual Chromium screenshot/layout review were performed separately, including the attached 28-meal PDF's review/saved weekly plan, small mobile, desktop dialogs, and light/custom themes. Screenshots are local only. No claim of physical Safari/iPhone or live deployment verification. Historical automated checks still reference 2.6.1; updating/running them requires separate authorization.

Verified backup before editing: remote branch backup/main-20261008-112335-before-design at fd69d37e867dc5406c7bd02209a668ab6aba2aa0; verified history bundle /workspace/GymApp-backups/GymApp-before-full-design-20261008-112335.bundle. Backup covers code, not private diary/account data. Preserve older backups. The prior unfinished exercise-media migration and live social activation remain separate work.

---

# Update — Otisport 2.6.1, 2026-10-08

Renamed Tungsten to Otisport and installed a new generated O icon. The manifest, document/Apple title, both language labels, sign-in logo, placeholder profile initial and export filenames use the new identity. New icon paths are referenced and included in verified offline precaching; the Android maskable asset has safe-circle padding. BRANDING.md records the assets and iOS shortcut refresh guidance. URL/scope/storage keys/account configuration stay unchanged.

Validation: four release/update tests passed, including actual verified update with offline import and data preservation; browser checks verified installed metadata, each icon's decoded dimensions and both-language sign-in. Syntax/manifest/whitespace and screenshot checks passed. Physical iPhone home-screen metadata refresh remains unverified.

Backup: `/workspace/GymApp-backups/GymApp-before-otisport-branding-20261008.bundle` (verified complete history). Previous social migration still requires activation in the live Supabase project; this branding release makes no database changes.

---

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


## 2026-10-10: Reppsy 2.19 profile sharing and glass design

Started from verified actual main `997b0a7217dc195f076dcb8610f3bf8b1274c532`. Remote backup `backup/main-20261010-before-profile-social-glass` preserves that commit. Work branch `codex/profile-social-glass-20261010`; release 2.19.0 / 20261010.3. Normal fast-forward main publication remains authorized; never force/reset.

Profile removed from bottom navigation; top-right photo retained. App and profile color wheels are separate, centered and touch/keyboard operable. Custom profile hues are shared; private cover/frame settings persist. Added Glass/Normal/Matte setting, more distinct backgrounds, and plan JSON export with Data-action spacing. Keys/diaries/history/IDs/calorie semantics preserved.

New `RoutineShare` module is part of the verified offline release and stale-shell bootstrap. Snapshot publication excludes logged weights, private exercise media and unrelated custom definitions; copying checks current publication and remaps custom IDs. Likes apply to current photo; reviews are author-editable, owner-removable, accepted-friend-only. No public account directory. New username Auth trigger reserves atomically; old accounts unchanged. SQL setup is required before new username signup.

Run the entire additive `migrations/20261010_profile_sharing.sql` in the existing live project's SQL Editor after the original two social migrations. No live SQL or live-account test was performed. Setup details in SOCIAL.md. No admin credentials belong in browser config.

Optional local security testing uses PGlite installed outside the checkout: `npm install --prefix /tmp/reppsy-pg --cache /tmp/reppsy-npm-cache @electric-sql/pglite --no-audit --no-fund`; then `node tests/test_social_sharing.mjs`. This is disposable PostgreSQL, with mock auth roles/users, never a connection to the live database. Browser tests intercept account requests with fixtures. Physical Safari/iPhone not tested.

Validation: focused Chromium checks passed for profile wheel isolation/centering/save/reload, four-tab navigation, materials/backgrounds, Data spacing and plan export round-trip, username preflight/metadata, likes/reviews, explicit share/unshare and fresh copies. Responsive tab/action checks covered 16 language/phone/landscape/text-size combinations. Color/dl regression checks, custom routine privacy/remapping/limits, disposable PostgreSQL permissions/idempotency and cached-shell/verified-update/offline checks passed. JavaScript syntax and complete release hashes verified. Screenshots of 320px Settings/profile editing were visually reviewed. The first concurrent responsive suite's offline install was interrupted by working-tree edits; that isolated offline check passed on the frozen release. Live Pages API verification is blocked by the environment proxy (Forbidden); do not claim served deployment or live account verification.
