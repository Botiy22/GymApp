# Release versions

## 2.44.1 — 2026-10-31 (build 20261031.1)

Two Bellozzo transcription fixes, checked against the owner's screenshot of the table: Margherita 32 cm 1050 → 1060 kcal; Salame 24 cm carbohydrate 88 → 86 g. All other rows of `data/bellozzo-foods.js` match the image.

## 2.44.0 — 2026-10-30 (build 20261030.4)

Added Bellozzo nutrition from the owner-supplied screenshot of the official table: 12 pasta sauces with two sizes and five bases, 11 pizzas with two diameters, five salads, six desserts and 23 extra toppings. Sauce-with-toppings and pasta-base rows are added, not confused with whole-dish totals. “Primavera grande” asks for a base; complete names resolve locally. Search and Describe use the same catalogue, with compact restaurant review and fractional servings retained in the diary.

No serving weights, complete ingredient lists or complete drink macros appear in the screenshot, so none are invented. Printed inconsistencies (Carbonara) remain visible without changing the source values. Existing Burger King Hungary entries are preserved. See `docs/BELLOZZO_DATA.md` for provenance and limitations.

## 2.43.0 — 2026-10-30 (build 20261030.3)

New `data/restaurant-foods.js`: the full Burger King Hungary menu (105 items: burgers, chicken, nuggets by the piece, fries sizes, buckets, salads and toppings, desserts, shakes, drinks, coffees, dips and dressings) from the chain's nutrition and allergen table of 2024-12-16, stored per portion as sold and exact (no "typical" marker). The US-based "Whopper", "Sült krumpli" and "Hagymakarika (Burger King)" rows now carry the Hungarian values. Piece items answer to a bare number as pieces ("9 spicy nuggets") and to no number as the usual box. Two source problems are kept visible: Crispy Chicken prints 46.9 g fat, which does not fit its 413 kcal, so fat is derived from energy (≈23.7 g); the coffee rows are kept as printed with a note because their calories do not match their macros.

`js/food-query.js`: chain items match their bare names only when typed in full or by a unique alias; "bk …"/"burger king …" selects the chain; one chain in a message also picks that chain's sides and drinks; names containing "és"/"-val" (e.g. "Whopper sajttal") stay one food; decimal commas after a comma ("…, 0,4 l kóla") are no longer split. Answers name the chain's table as the source. Bellozzo is not included yet (its table is an image that could not be read here).

## 2.42.0 — 2026-10-30 (build 20261030.2)

Reviewed photo foods can now be remembered when added to the diary, with a personal short name or an optional name for the entire meal. A Frequent foods dropdown ranks saved portions by recency and frequency; serving adjustment, search, aliases and removal are available. Describe and food search resolve saved names locally, retaining the saved nutrition and estimate status. Ambiguous names require a choice, and unknown mass is never invented for liquids or serving-only foods.

The private food-memory collection is included in account sync and backup/export, with transactional diary writes, deletion markers and a 200-record capacity message. Source photos are not retained. Existing saved label products with a default serving also appear. No SQL migration is needed. See `docs/FOOD_MEMORY.md` for ranking and storage details.

## 2.41.0 — 2026-10-30 (build 20261030.1)

Workout dropdown headings reflect the active page. The former Library / Tár section is now Exercises / Gyakorlatok. Swimming appears below Cycling / Bringa, opens a dedicated swim page, and uses the existing pool-length, stroke, duration and energy logger. Swim history shows distance, time and calories and opens the original workout record.

A shared dropdown now handles standard single-choice page tabs, filters, profile appearance, settings, registration and form selects. It preserves source form values and existing handlers, adds keyboard navigation, disabled-option handling, required-field focus and selected labels, and closes on selection, outside click or Escape. Oat customization is explicitly excluded; multi-selection controls and ordinary action buttons remain direct controls. Added choice menus to the offline shell and stale-shell helper loader.

## 2.40.0 — 2026-10-29 (build 20261029.3)

Daily steps and that day's training are now independent calorie additions, as requested. The top switch adds only the entered step calories; the training switch adds only logged training energy. Both remain enabled and retain their own checked state. The equation shows both additions separately. Removed the full-day-total selector and override/locking behavior; the entry form and shortcut guidance now request steps only, not a watch's whole-day active energy. Existing numeric values remain unchanged and are treated as step calories; previously entered whole-day totals should be corrected in the entry form. Base nutrition targets are unchanged.

Workout navigation has three main destinations: Train (training overview, cycling), Library (plans, exercises, stability), and History. Native disclosure menus use full-width touch rows, selected-state feedback, outside/Escape dismissal and focus restoration. Menus stay within the viewport; all existing workout flows and ongoing sessions remain available.

## 2.39.1 — 2026-10-29 (build 20261029.2)

Fixed step calories suppressing the workout-calorie switch. Activity entries now distinguish steps-only calories (excluding workouts) from full daily active-energy totals. Steps and workouts can be included independently; full daily totals still replace workouts to prevent double counting. The food/profile budget shows both controls and explains when workouts are already included. Tap the activity amount to correct an existing entry. Step estimates select steps-only; pasted health-app totals select full-day. Legacy entries retain their previous full-day meaning until edited. The type persists through storage cleaning, backup and cloud documents; base targets stay unchanged.

## 2.39.0 — 2026-10-29 (build 20261029.1)

Text analysis preserves product nutrient claims (20 g protein) and fat percentages (1,5%) instead of making extra ingredients. Explicit labels, saved product variants and documented food values calculate locally. Only unresolved ordinary foods use AI; unknown branded nutrition stays pending. Users resolve missing labels/amounts or explicitly remove them before logging. Saved label aliases survive reload/account data cleaning; per-100-ml labels remain volumes, with dl controls. Pure erythritol uses EU total-carbohydrate/polyol conventions while keeping 0 kcal.

Food search adds an opt-in Lidl/Tesco/SPAR product and barcode lookup via Open Food Facts. Complete returned nutrition is reviewed before saving to My foods; offline and unavailable-service cases offer manual labels. This is a lookup/import workflow, not a verified bulk retailer catalogue: cloud retrieval of retailer/OFF data was blocked (HTTP 403). No synthetic brand nutrition is shipped.

Photo instructions now separate labels from meal views, avoid duplicate meals/invented scale or invisible fat, distinguish kJ/kcal, total carbohydrate/sugars/polyols and per-serving/per-100 bases, and preserve incomplete items. Confidence is capped for visual estimates. See `docs/FOOD_ANALYSIS.md` for limits and storage.

## 2.38.1 — 2026-10-28 (build 20261028.4)

Replaced the flat túrós–erdei gyümölcsös oats illustration with an individually generated food photograph and full-frame thumbnail. Recipe and nutrition stay the same. Photo caption metadata updated; the legacy drawing exporter now preserves this replacement.

## 2.38.0 — 2026-10-28 (build 20261028.3)

Swimming as a cardio type. The form takes pool length (25, 33.3 or 50 m), lengths per stroke (freestyle, breaststroke, backstroke, butterfly, mixed), duration, body weight and pace level, and shows distance, pace per 100 m and estimated active energy while typing. Energy uses the 2024 Compendium of Physical Activities swimming METs (recreational / training: freestyle 5.8 / 9.8, breaststroke 5.3 / 10.3, backstroke 4.8 / 9.5, butterfly 13.8), weighted by lengths, above resting energy like the other cardio types. Impossible combinations (faster than about 130 m/min, fractional lengths) are rejected.

Smartwatch bridge for the coming native apps: `js/wearable.js` defines a versioned message contract (iOS WKWebView handler, Android JavaScript interface or Capacitor plugin), cleans every live sample and finished workout, and maps them to swim entries and rides. Measured active energy is stored with the entry (`wear`) and replaces the estimate. The swim form and the Ride screen have a Smartwatch panel: import the last workout, live data (feeds the running ride's heart rate, cadence, power and speed like Bluetooth sensors). On the web the panel explains it is for the iOS/Android apps. Native implementation guide: `docs/WEARABLES.md`.

## 2.37.1 — 2026-10-28 (build 20261028.2)

Fixed the overnight oats builder jumping when adding fruit or other ingredients. Ingredient controls and the dialog stay mounted; selected rows and nutrition update in place, compensating for changed content above the tapped control. Amount buttons retain focus, and empty-to-populated transitions restore the diary actions.

## 2.37.0 — 2026-10-28 (build 20261028.1)

Ten original, protein-rich lower-fat recipes: five overnight oats (blueberry, raspberry cocoa, chocolate cherry, mango yogurt, apple cinnamon) and five grilled chicken meals (bulgur salad, potato/green beans, brown rice/broccoli, couscous/zucchini, sweet potato/yogurt slaw). Individually generated whole-frame photos, bilingual cooking instructions, explicit cooked weights, and USDA ingredient calculations. New oats also work in the existing builder.

Four clickable goal filters combine with meal categories. An optional guide distinguishes established nutrition principles from our transparent portion-based browsing rules; categories overlap, incomplete nutrition stays in All, and no meal promises maximum muscle growth. References and nutrition provenance are linked; external research retrieval was blocked in this environment, as documented in `docs/RECIPE_NUTRITION.md`.

## 2.36.0 — 2026-10-27 (build 20261027.6)

Overnight oats. `js/overnight-oats.js` holds a builder catalogue of 40 ingredients in seven groups (base, liquid in ml, yogurt/curd, protein, fruit, seeds and nuts, flavour and sweetener), each mapped to a row of the offline food database. One `compute()` gives the totals for recipe cards, the builder and the diary. Five new breakfast recipes (chocolate peanut butter protein, apple cinnamon, curd cheese and mixed berries, mango coconut, tiramisu) sit after the strawberry overnight oats, whose values are now calculated the same way. Amounts are our suggestions; pictures are original illustrations drawn by `tools/oats_art.py` and captioned as illustrations.

Recipes → "Build your own overnight oats" (and Customise on every oats recipe) opens the builder: presets, ingredient chips, −/+ steppers and typed amounts, a sticky calorie/macro summary. Adding logs one diary entry with its ingredient breakdown (diary entries from the database may now keep `items`); Save as my food opens the My food form with per-100 g values and the jar weight. The lexicon adds frozen mixed berries (USDA frozen blueberry/raspberry/strawberry average) and erythritol (0 kcal, not counted as carbohydrate).

## 2.35.1 — 2026-10-27 (build 20261027.5)

AI replies no longer break off or fail as "unreadable". Claude Sonnet 5.5 and Opus 5.5 think before answering by default, and thinking tokens count toward `max_tokens`; the old limits (900 for chat, 2000 for food analysis) could be used up by thinking, leaving a truncated reply or no text at all. Requests now allow 8000 (chat) / 16000 (food) tokens, set `output_config.effort` to `medium` on models that support it (not Haiku 4.5), and retry once at `low` effort with more room when a reply stops at `max_tokens` or cannot be parsed. A refusal or a second cut-off shows its own message. Timeouts are 90/120 s.

Remaining-budget colours: the calorie dial ticks, the "kcal left" line, the budget equation and the protein/carb/fat bars (Food card and Profile) go from green while at most half is used, through yellow and orange, to red as the target is reached or passed. Light theme uses a darker text tone.

## 2.35.0 — 2026-10-27 (build 20261027.4)

The offline food foundation. A new `js/food-query.js` understands food questions and amounts without AI or network: Hungarian and English number words, decimal commas, fractions and ranges, units (g, dkg, kg, ml, dl, l, evőkanál, teáskanál, pohár, bögre, szelet, db, adag, tányér, marék, gerezd, tábla, kocka, korsó, feles, pár…), question words (hány kalória, hány gramm, mennyi fehérje…), Hungarian case endings (zsemlében, tojást, vajjal), accents and small typos. "1 zsemle hány kalória?" answers 1 db ≈ 57 g, 167 kcal with the macros and the per-100 g values. Several foods in one sentence are listed with a total.

`data/food-lexicon.js` widens the database for everyday Hungarian eating: aliases for the existing entries, typical piece and portion weights (always shown with ≈ and the usual range), label values for kifli, kakaós csiga, sajtos pogácsa, Túró Rudi and low-fat túró, 2.8% and 1.5% milk interpolated from USDA milks, and Hungarian dishes calculated from typical home recipes written in the file (gulyásleves, húsleves, pörkölt, csirkepaprikás, rakott krumpli, töltött káposzta/paprika, lecsó, főzelékek, túrós csusza, rántott hús/csirke/sajt, fasírt, palacsinta, lángos, nokedli, tarhonya, rizibizi, gyros, szendvicsek, fröccsök, coffee drinks). Recipe and proxy values are estimates and are labelled as such.

Add food shows the database answer above the results with Add and Other amount. The describe box calculates understood amounts locally; without a key it returns what it understood and names what it could not. The coach answers food questions from the database instantly, with or without a key; other questions still go to the AI. Amount chips use the new portions. The narrow-phone footer no longer clips "Add · 644 kcal".

## 2.34.0 — 2026-10-27 (build 20261027.3)

Exercise search indexes English/Hungarian names, curated gym aliases, primary muscles and equipment. Exact matches rank above partial matches and favourites. Accent/punctuation/compound-word normalization handles phone input; a bounded one-edit fallback appears only when no direct match exists. Active filters remain respected, with a clear-filters shortcut when they hide results. Selected exercise order is retained. The My exercises filter and name-prefill/save behavior now work inside Workout → Exercises. Search gets more room on narrow phones.

Added machine hip thrust, machine lateral raise, belt squat machine and dumbbell Romanian deadlift, each with original EN/HU setup and movement cues. Eight individually generated sketch boards (sixteen phases) cover these additions plus single-leg extension, pec deck, reverse pec deck and plate-loaded chest press. Leg-extension setup instructions replace the legacy knee-over-toes warning with controlled, adjustable technique. Existing IDs, routines and logged weights stay in place. Search and new sketches are included in the verified offline release.

## 2.33.1 — 2026-10-27 (build 20261027.2)

A one-time, bilingual recipe invitation appears beside the AI chat button, with a gentle icon wave and a short fade. It waits until the app is visible and no dialog is open, remembers being shown on this browser, and opens chat when tapped. No AI request is made by the invitation. Settings gently glows in the selected accent when a newer release is detected; the indicator clears when no update is pending. System motion preferences remain respected.

## 2.33.0 — 2026-10-27 (build 20261027.1)

Settings section state is saved with the user settings and survives reload/export/sync. The in-app reduced-animation switch is removed and stale settings are normalized; system accessibility motion preferences remain respected. Navigation covers the full bottom edge and safe area with an opaque theme surface.

Six original exercise variations expand the searchable library, with EN/HU cues and twelve matching black-outline start/finish images. Based on reviewed public exercise dataset base movements; provenance and adaptation details in `docs/EXERCISE_EXPANSION.md`. All new media is bundled offline.

Recipe and recovery screens remove upload/screenshot history and redundant source paragraphs. Instructions retain useful portion, missing-nutrition and preparation information; unknown macros remain required before logging. Source metadata and licensing credits are retained outside everyday recipe flows. Food-analysis tips become expandable and profile privacy copy is concise.

## 2.32.0 — 2026-10-25 (build 20261025.1)

Food analysis uses conservative local exact-name/quantity matches and explicit per-portion labels before the configured AI. Unknown meal components prevent partial local matches; volumes use documented density. Branded shakes request serving/product/milk details. AI prompts distinguish powder from milk, consumed portions from package weight and readable labels from estimates. Missing, negative, nonnumeric and impossible macro values are rejected. Similar calories alone no longer trigger database substitution; macro corrections persist alongside calorie corrections. Requests have timeouts and duplicate-submit guards. No live model accuracy benchmark was available; API routing/validation tested with controlled responses.

Routine opens in a compact daily agenda with activity times, notes, editing and completion, alongside existing day/week calendar views. Narrow-screen Hungarian toolbar overflow fixed. Calendar relay deployment is unchanged.

## 2.31.1 — 2026-10-24 (build 20261024.1)

Seventeen recovery movements use original black-outline exercise sketches with separate portrait start/finish views, matching the exercise library style. The seven clip recipes now have separate full-resolution food photos with consistent neutral tableware, lighting and framing. No recipe collages are used. Existing recipes, nutrition, exercise IDs, programme doses and saved data are retained. Food captions identify AI imagery. Provenance and publishing instructions accompany each asset set; legacy procedural generators are retired.

## 2.31.0 — 2026-10-23 (build 20261023.3)

Content from the owner's `Videos_Photos` folder (6 screen recordings, 7 screenshots), read frame by frame; the videos have no captions with amounts and their speech could not be transcribed here, so only what is shown on screen is used.

- **Recovery** (`data/recovery.js`, Workout → Stability): `RECOVERY_PROGRAMS` — "Knee band routine" (KneeHab clip, 10 moves, 3×15 … 3×15 s as printed), "Knee stability circuit" (9 moves from the "Knee Stability" collage) and "Pelvic tilt reset" (glute bridge, hip flexor stretch, lying leg raise, knee to chest; the clip shows no sets, so ours are marked as suggestions). 17 new `Rehab_*` exercises with EN/HU names and cues and original two-phase line drawings in `img/recovery/` (generator `tools/recovery_art.py`, wired through `ROUTINE_ART`). Cards with Preview / Add / Add and start; adding creates an ordinary editable routine with `focus` and a fixed id, so it never duplicates and stays out of the strength rotation.
- **Recipes** (`data/clip-recipes.js`, new `drink` category "Juices"): muffins (amounts are our suggestion; ≈100 kcal / 9 g protein each, close to the clip's 100 / 10), pizza-style meat roll (clip's 550 kcal / 66 g protein; carbs/fat unknown and left blank, so logging still asks for them), five juices from the screenshots (amounts suggested, juice nutrition estimated from USDA juice data). Original flat illustrations (`tools/recipe_art.py`) captioned as illustrations. Ingredient amounts may now be `[hu, en]` pairs.
- **Recipe layout:** cards list Protein / Carbs / Fat by name with colour dots; the method is a list of separate step cards with a guide drawing each (`js/cook-art.js`, 19 drawings chosen by keyword or by the recipe's `art` list), also used in cook-step-by-step. Category tabs wrap instead of clipping.
- **Ranks:** each muscle card shows the popular "hardest muscles to grow" tier (from the owner's screenshot; labelled as opinion). **Targets:** a fibre suggestion of 14 g per 1,000 kcal. The video's 16–18 kcal/lb bulking rule is not adopted; the existing calculation stays.
- **Fix:** Routine → New activity: the All-day switch was stretched to full width by `#planner-event-form input{width:100%}` and pushed its label off screen; iOS date/time inputs centred and overflowed.
- `.gitignore` keeps `Videos_Photos/` out of the public repository.

Validation: new `tests/test_recovery_recipes.py` (programme data, drawings load, preview/add/start, no duplicates, stability page, recipe cards/steps/amounts/illustration, unknown macros, planner editor); `tests/test_recipes_stability.py` made data-driven (recipe count, macro spans, gnocchi card by id); full suite compared with unmodified 2.30.0.

## 2.30.0 — 2026-10-23 (build 20261023.2)

Food → Recipes replaces Ideas. A two-column feed uses equal-height cards with each existing individual dish photo, a two-line name, calories, preparation time, protein, carbs and fat. Unknown nutrition stays unknown. Category filters and source clips remain; clips are tucked into a collapsible section.

Recipe detail includes a guided cooking view with the original ingredient quantities, a checklist, full-batch yield, one original instruction per screen, separate original vector cooking illustrations, progress and Back/Next controls. Returning retains ingredient checks during this session. Finishing never logs food automatically. Existing portion logging and mandatory completion of missing nutrition remain. Bilingual ingredient quantities display in the selected language without changing values.

Workout has a separate Stability page and a dedicated Knee recovery subsection. Create a sequence with the existing exercise picker or move an existing routine. A Section selector in the routine editor moves it back to Strength if wanted. Private `focus` metadata is cleaned, exported/imported and synced with the routine; IDs, prescriptions and history stay intact. These sequences are excluded from the regular Strength rotation. The section label is not added to public sharing snapshots. Navigation uses six stable targets, in two rows on phones.

No new videos were attached or linked for this request. **New video extraction and population of knee recovery are pending those sources.** Existing transcribed clips and nutrition are retained; no new rehab protocol or video-derived facts are invented. Tests cover layout, recipe filters/macros, ingredient/step navigation and incomplete nutrition, stability creation/move/edit/reload/private sync, EN/HU pages, individual sharp images, offline use and verified app updates. No SQL change or physical-phone verification.

## 2.29.1 — 2026-10-23 (build 20261023.1)

The calendar relay now allows the exact BME Neptun host, preserving the full synchronization URL and query. Bilingual calendar help includes Neptun instructions, and unnamed Neptun connections default to BME Neptun. No private subscription URLs or timetable contents are committed. Link sync still requires deployment of the included Supabase function; .ics import remains available without it.

Validation: relay host/query passthrough and simulated calendar parsing, rejected lookalike hosts/unsafe redirects, translation parity and browser connection fixtures. A read-only request to the supplied live URL was unavailable from this environment, so its calendar contents and live service operation are not verified.

## 2.29.0 — 2026-10-22 (build 20261022.1)

Goals becomes Daily routine: a minimal hourly timetable with day/week views, seven-day navigation, overlapping activity columns, all-day events, editable time/title/category/notes, daily/weekday/weekly repeats and completion/undo. Tap a time or use Gym/Swimming/Focus shortcuts. Habits and Progress remain beside Schedule. Saved planner data joins private account sync and backups, with record-level merging and deletion markers; planning is separate from logged exercise calories and competition scores.

Calendar `.ics` import runs locally, including recurrence/exclusions/overrides, embedded time zones/DST, overnight events and all-day exclusive end dates. Re-import refreshes a file snapshot while retaining completion for stable event identities. Subscription links refresh while Schedule is active through an included authenticated `calendar-feed` Supabase Edge Function. **The function is not deployed to the live project**: until enabled, the app offers file import and explains the missing service. Browsers cannot directly access Apple’s on-device Calendar or silently link private calendar accounts. No SQL migration is required. See [CALENDARS.md](CALENDARS.md) for exact setup and limitations.

English/Hungarian dictionary parity and placeholders audited; five missing Hungarian singular keys added. Navigation accessibility labels follow the selected language. Main tabs, nested workout/food/routine/profile pages, key forms, exercise and recipe details, Settings/help/release notes and registration/recovery were exercised in both languages. All 876 exercise names and recipe title/step translations are present. User-entered titles and imported calendar text retain their original language.

Validation: planner/recurrence/timezone/merge unit tests, calendar relay auth/CORS/URL/redirect/size/rate checks, real browser editing/import/re-import/failure/sync/privacy/layout checks, bilingual page walks, existing clock/mobile/offline tests, and verified release-update/reload. No physical iPhone or live calendar account/deployment verification.

## 2.28.0 — 2026-10-18 (build 20261018.2)

Stories, photo posts, highlights and likes. New `migrations/20261018_stories_posts.sql` (tables `social_posts`, `social_post_likes`, `social_highlights`, `social_highlight_items`; all access through `security definer` functions, tables revoked from `anon`/`authenticated`). Audience per item: everyone signed in, friends, or only me. Stories expire after 1 h–7 days (24 h when not given); ended stories stay in the owner's archive for 30 days and are kept for good inside a highlight. Limits: 30 new items a day, 300 posts, 30 highlights. New `js/stories.js` (server calls, on-device JPEG shrinking to ≤1080 px / ≤400 kB plus a 360 px thumbnail, seen-state on the device, time labels, the like button and the full-screen story viewer with progress bars, tap/hold/swipe, keyboard and owner menu) and `css/stories.css`. Profile → Friends has the story row and a post feed (full pictures load as cards scroll into view); Profile → Overview and friend profiles show highlights and a post grid; stranger profiles open from the feed. The profile-photo like button uses the same heart animation. Entrance animations play once per item; Calm and reduced motion turn them off.

Muscle ranks (Profile → Ranks): `js/muscle-ranks.js` ranks eight muscle groups by the best estimated 1RM (Epley, reps capped at 12) relative to body weight, women scaled by 0.7, coloured on the body figure (`MuscleMap.ranked`) with cards for each group; the old barbell milestones sit underneath. Plan import: `pdf-local.js`/`plan-sheet.js` read generic headings ("PUSH DAY", "Day 2", weekday + title), sets × reps in many spellings, scheme-before-name lines, Excel title rows, a combined "Sets x Reps" column and unitless rest; more meal headings and amount-first foods.

Validation: `tests/test_stories_sql.py` (real PostgreSQL 16 with a Supabase stub: visibility, expiry, highlights, cleanup, likes, refusals, no direct table access), `tests/test_stories_browser.py` (8 flows against `tests/stories_fixture.py`), `tests/test_import_layouts.js`; existing suites. The migration has **not** been applied to the live Supabase project from this session.

## 2.27.0 — 2026-10-18 (build 20261018.1)

New `css/clean.css`, loaded last, sets one solid design system: neutral dark/light tokens, no background glow, glass blur or decorative gradients, one radius scale (cards 20 px, controls 14 px), consistent buttons, segmented controls, inputs, sheets and tab bar. `applyLook` always uses the matte finish; saved `material`/`solid` values are kept but no longer offered.

Settings: Appearance shows language, a Dark/Light theme switch (older aurora/plain backgrounds still render dark), compact accent swatches and the custom wheel under a closed "Custom colour" section, and "Fewer animations". Removed from Settings: background tiles, surface finish (glass/normal/matte), reduce-transparency switch and the storage size in kB. Own exercises/foods moved into Data; plan export, CSV export, restoring built-in routines and deleting all data sit under "More options". The AI and Data groups start closed. "Resets Monday · UTC" now reads "Resets every Monday".

Workout: the next-up card shows the session name ("Push") with its split underneath; tapping it or "View exercises" opens the routine without starting. Finished workouts list each exercise as an expandable row with every set (warm-up marked), weight and reps, plus a link to the how-to. History cards no longer repeat calorie estimates. Durations read "1 h" instead of "1 h 0 min" (HU "1 óra"); session names drop the split prefix in headers; English counts use the singular for one ("1 set", "1 workout in total").

Validation: new `tests/test_workout_preview_sets.py`; settings/colour/material tests updated for the new layout; JS suites; responsive, update, ride and release suites; page-by-page screenshots in HU/EN, dark/light. No data or SQL changes.

## 2.26.1 — 2026-10-17 (build 20261017.1)

A PDF training plan headed by weekdays ("THURSDAY - UPPER A / STRENGTH") with an `Exercise | Sets x Reps | RIR | Rest` table imported nothing: weekday lines were only treated as meal-plan days and routine headings had to read "N. nap"/"Day N". A short weekday heading now starts a workout that is created only once an exercise row follows, so weekday meal plans are unchanged. A table heading maps the unlabelled RIR and Rest columns; rest ranges ("3-4 min", "60-90 sec", "2.5-3 perc", "90 mp") use the midpoint rounded to 15 s. All-caps headings are shown in title case. `PlanSheet.exercise` (PDF, Word and Excel imports) falls back to an ordered list of common Hungarian gym phrases mapped to existing library IDs when no name matches exactly; unknown wording stays unmatched for the user to choose in the import editor.

Validation: the owner's 2-page PDF imports as 4 workouts with 32 exercises, all matched, and adds through the import dialog; new `tests/test_pdf_weekday_plan.js` (synthetic plan, weekday meal plan unchanged, no guessing for unknown names); existing suites. No data or SQL changes.

## 2.26.0 — 2026-10-12 (build 20261012.5)

Food meal groups are compact and initially collapsed. Tap the meal heading to expand its food list; each header has a 44px + control, a small calorie clock showing that meal's share of logged daily calories, protein/carbs/fat totals and a proportional macro bar. The grouping switch stays mounted so its thumb animates, and cards enter with a short stagger. Expansion preserves its state during diary redraws. Reduced-motion and Calm settings disable the new motion.

Imported PDF/Word/Excel meal check-ins assign recognized meal names even when grouping is off. They preserve the document's meal totals and copy the food list with supplied individual calories into the saved log. Missing individual calories remain unknown; no nutrient values are invented. Older plan entries use their linked meal or recorded name for grouping without rewriting their saved data. Imported plans are still plans until marked eaten.

Goals weekly progress has previous/next arrows, a visible date range and horizontal swipe navigation, including upcoming weeks. Vertical scrolling remains available and future dates cannot be checked off. Browsing weeks preserves the selected daily goal date and existing data.

Validation: local Chromium checks cover group expansion/inert collapsed controls, five logging categories, exact imported meal totals and item persistence, grouping-switch identity, responsive HU/EN Food, swipe directions, arrow navigation, vertical gestures and future-date restrictions. Physical phone gestures and live deployment are not verified.

## 2.25.0 — 2026-10-12 (build 20261012.4)

Food has an opt-in “Group by meal” switch, with Breakfast, Lunch, Dinner, Snacks and Other sections. Each section adds food separately; database amounts, manual entries, AI results and recipe portions offer a category picker. Existing uncategorized entries stay in Other without being rewritten. “Change meal” updates only category metadata, preserving entry IDs, timestamps and nutrition. Switching grouping off preserves both foods and saved labels. Cleaning, backups and cloud merges retain meal metadata; later meal-assignment timestamps win without dropping stale clients' diary entries. Failed saves keep the draft and roll back the grouping preference.

Exercise index images now use available SVG drawings outside the 22 starter exercises too, and active-workout illustration thumbnails fit without cropping. Custom uploaded pictures are retained. New drawing thumbnails are cached in the verified offline shell.

The additive Supabase migration `20261012134226_admin_user_directory.sql` is applied to the configured Tungsten project. The read-only admin directory joins account ID/email with existing saved/public usernames and display names. Normal app roles have no view privileges, and the view uses invoker security. Before/after checks found all six accounts and six saved-data records intact with identical diary fingerprints; four accounts currently have saved usernames. No user, diary or social-profile rows were rewritten.

Validation uses isolated browser fixtures with live account configuration disabled: five meal groups, reassignment, switch/reload, backup cleaning, concurrent/stale cloud merge, database/AI logging, storage-error rollback, HU/EN phone widths, starter/non-starter thumbnails, verified offline installation and existing routine detail/enlargement checks. Physical Safari and live client sync are not claimed tested.

## 2.24.0 — 2026-10-12 (build 20261012.3)

The 22 distinct exercises in the built-in starter templates have matching faceless anatomical line-art thumbnails and separate start/finish images. Eleven reuse existing attributed SVG pairs; eleven use generated boards exported to compact WebP pairs. Instructions retain the existing HU/EN text and move into numbered cards ahead of personal exercise statistics. Own thumbnails still take priority, broken drawings fall back to the exact exercise photos, and the anatomical muscle map is retained. No changes to exercise IDs, saved routines, food, goals or diary schemas.

The broader Today/Workout-first phone redesign is an interactive concept, not applied to the app navigation. Source/asset details: `img/routine-line/README.md`.

## 2.23.0 — 2026-10-12 (build 20261012.2)

Refined the existing interlocking logo and added versioned install/transparent update assets. Restart waits for the mark to settle upright. Ride fixes: finished duration excludes pauses; stationary GPS does not invent moving time; missing GPX coordinates do not become zero; GPX names decode once. Clearing device data also removes the separate running-ride record, and switching account owners stops the in-memory ride.

Release packaging explicitly reads UTF-8 and writes LF, rejects CRLF app-shell inputs, and `.gitattributes` requests LF checkout. Existing app-shell text was normalized before rebuilding hashes. Validation: 30 JavaScript tests, release line-ending test, 32 responsive Chromium views, update-logo spin/settle/reduced motion, verified offline loading and no browser runtime errors. The full Python browser suite could not run because its Playwright dependency is unavailable and package download failed; live services and physical Safari/iPhone were not tested.

## 2.22.1 — 2026-10-12 (build 20261012.1)

The vendored `vendor/leaflet/leaflet.css` had CRLF line endings. `.gitattributes` (`* text=auto`) committed it with LF, so the published bytes no longer matched the release manifest and the verified service-worker install rejected the whole 2.22.0 update; the app reported it as a connection problem. The file is now LF and the manifest is rebuilt. New `tests/test_release_files.py` fails if any manifest text asset contains CRLF. Validation: published-tree hash check of every manifest asset against `origin/main` content, plus the existing suites. No SQL changes.

## 2.22.0 — 2026-10-11 (build 20261011.2)

Workout → Ride records bike rides with `navigator.geolocation.watchPosition` (high accuracy), filtering fixes worse than ±35 m, sub-accuracy jitter and >120 km/h jumps. Moving time counts intervals above ~2.9 km/h; speed is a ~5 s window (or the device's reported speed); climb uses smoothed altitude with a 5 m threshold and is an estimate. The running ride is stored separately (`gymapp.v1.ride`) every few seconds and on hide, resumes after reload, and supports pause/resume (no straight line across pauses), discard and a floating progress pill. Finished rides are ordinary workouts with a cleaned `ride` part (Douglas–Peucker route at 6 m plus a point every 200 m, encoded polyline with time and elevation deltas), so history, goals, account sync and the existing cycling calorie estimate (when a body weight is known) include them. Detail sheets show an OpenStreetMap map (Leaflet 1.9.4 vendored, loaded on demand; CSP allows `tile.openstreetmap.org` images), totals and an elevation profile, and export GPX 1.1. GPX/TCX import (including indoor TCX without positions) skips duplicates. Web Bluetooth pairing reads standard heart-rate, cycling speed/cadence and cycling-power profiles; wheel distance replaces GPS for indoor rides.

Also fixed: downloads started from inside an open panel (ride GPX, the install sheet's backup) did nothing because content outside a modal dialog is inert; the glass tab bar now has a near-opaque fill so it no longer looks see-through during page-change snapshots on iPhone.

Limits: iPhone web apps receive no location while the screen is locked or another app is in front, and Safari has no Web Bluetooth. No direct Strava account connection (needs a server-side secret). Validation: node unit tests for recording/noise/pause/encoding/import/export/BLE packets, browser tests for record→reload→finish→export→reimport, simulated sensors, 320 px layouts in both languages and tab-bar opacity. No physical device, real GPS or real sensor verification.

## 2.21.3 — 2026-10-11 (build 20261011.1)

Update installation shows only the Reppsy mark (new transparent `icons/reppsy-mark.png`, cached by the service worker). It accelerates for 0.45 s, turns at a constant ~343°/s and, when the release is ready, decelerates to an upright stop before reloading. The orbiting ring, progress track and dialog focus outline were removed; reduced motion/Calm keep it still. The header update button only dims while busy.

Pop animations were bound to persistent state (`.on`, `.ai-on`), so they replayed on every render: the AI-key check in Settings → Account, selected exercise-picker rows and favorite hearts briefly rendered oversized. They now use a one-shot `pop` class added only on the tap that changes state. Chat messages no longer re-animate on redraw (only the newest one rises), headers just fade on tab switches, duplicate Goals subtitles are hidden, the sheet title takes initial focus without a ring, collapsible sections glide open/closed (reversible, Calm-aware), Workout/Goals/Profile tabs stay sticky, and bilingual “HU / EN” notes in the built-in clip routines display one language.

Validation: animation-replay crawl of every tab and non-destructive action at 390 px, idle animation listener, workout set/rest flow, section glide, update overlay spin/settle angle sampling and reduced motion; project unit, node and browser suites. Legacy `tests/test_browser.py` still has pre-existing failures from earlier navigation/energy changes (identical on the untouched 2.21.2 code). No physical iOS or hosted deployment verification.

## 2.21.2 — 2026-10-10 (build 20261010.7)

Canceling the native profile-photo or cover picker now keeps the editor, draft and modal scroll lock intact. Only the dialog’s own cancel event dismisses the sheet; explicit close and Save still work. Confirmed photo likes animate the updated count and enlarged-photo heart. Failed requests leave counts unchanged; reduced motion and Calm disable these animations. No SQL changes.

Validation: picker-cancel/draft/save/Escape regression, confirmed button and double-tap likes, request failure and reduced-motion checks, existing social flows and verified update/reload. Browser fixtures, no physical iOS or live-account checks.

## 2.21.1 — 2026-10-10 (build 20261010.6)

The Reppsy mark rotates gently during update installation and pauses on completion. Daily-goal counter buttons and the percentage readout are explicitly centered. Goals, Food and Profile clocks interpolate their visible fill over 650 ms; rapid edits continue from the current fill, undo drains it smoothly, and date-specific keys prevent borrowing another day's progress. Labels and calorie calculations update immediately; animation changes only the presentation. Calm/reduced-motion settings show the final fill immediately and disable logo rotation/transitions.

Validation: real DOM interpolation/rapid-tap/undo tests, counter text centering at 320px with larger text, Food/Profile fill continuity, reduced-motion/date boundaries, verified update/reload and all-tab mobile/landscape/offline regression. No physical iOS or hosted deployment verification.

## 2.21.0 — 2026-10-10 (build 20261010.5)

The personal Upper/Lower/Push/Pull/Legs split is no longer automatically seeded or duplicated by the general five-day library. `exports/reppsy-original-five-day.json` restores it through Settings → Data → Import JSON: five editable routines, all 35 original movements/sets/reps/rest, appended without diaries or account data. Updating removes only unchanged automatic copies, writes deletion markers for sync, and preserves edited routines, explicit copies, history and active workouts. People still need to update their clients; no live account rows were edited.

Enlarged accepted-friend photos accept desktop double-click and mobile double-tap likes, with an accessible button and idempotent liking rather than toggling on repeated taps. Scroll/pinch gestures do not count as likes. Existing modal background locking and image zoom are retained. Achievements are open by default and can be collapsed; the choice survives redraw/navigation.

Reviews use compact author/star cards, an aggregate rating and a small write/edit icon. A separate editor has large star buttons and a character counter. Successful submission closes it and clears the draft; explicit Edit loads the saved review. Errors retain the text and allow retry. Shared-routine publication now refetches server activity, displays current/changed status and confirms the updated copy, including when the mutation response was stale. Existing accepted-friend permissions and opt-in sharing remain unchanged; no additional SQL migration is required for this release.

Validation: original JSON import/reload, conservative retirement/sync/history/active-workout checks; desktop/touch likes; review error/retry/edit/clear; stale-response sharing updates; phone and larger-text layouts; verified update/offline checks; disposable PostgreSQL republishing the same routine without duplicates; template/snapshot tests. No physical iOS or live-account/deployment verification.

## 2.20.0 — 2026-10-10 (build 20261010.4)

Removed profile color presets above the touch wheel. Added Grid, Orbit and Horizon covers, plus individually uploaded high-resolution photo covers with a live preview, save/cancel and removal. Friends has separate weekly progress and people cards; search, contact settings and optional phone setup open only when needed. Narrow-screen controls and long names fit without squeezing the search input.

Completed workout check-ins/cardio earn training-day points; meal entries and meal check-ins earn capped consistency points. Working sets add a bonus. Weekly ranks and three Goals challenges reward consistency without changing calorie math or inventing lift weights. Four extra badges cover five logged workouts, first cardio, three training dates and seven meal dates. First lift, Builder and Climber add lower lift milestones from 1 kg while retaining all existing thresholds and the Four foundations badge requirement.

Requires additive `migrations/20261010_consistency_covers.sql` after the earlier three social files for shared covers, ranks/badges and competition. Not applied to the live database. Existing friends remain usable before installation; outdated competition scores are not shown as new scores.

Validation: focused Chromium mobile, persistence, check-in/undo, update and verified offline release checks; JavaScript/PostgreSQL scoring, badge and rank-boundary parity and social permissions on disposable databases. Physical iOS and live deployment remain unverified. External usability pages were blocked by the environment proxy (403); design uses established touch-target and progressive-disclosure principles.

## 2.19.0 — 2026-10-10 (build 20261010.3)

Profile now opens only from the top-right photo. Profile editing includes a centered Reppsy touch color wheel, independently saved from the app accent. Plain, Deep and Colourful backgrounds are visibly distinct; Glass, Normal and Matte surfaces add appearance choices. Settings Data offers plan-only JSON export and spaced actions.

Registration asks for a unique username. Accepted friends can like profile photos, leave/edit reviews, and copy explicitly published routine snapshots. Owners can remove reviews and stop sharing routines. These features require the additive `migrations/20261010_profile_sharing.sql` in Supabase, after the two existing social migrations. The live database has not been modified.


`js/release.js` is the single source of the app's public version, build number and derived cache ID. Both the page and service worker load it. The app displays the installed version/build in Settings and in a verified update-success message.

For each published change, increment the public version and choose a new build (`YYYYMMDD.sequence`). Use patch versions for fixes, minor versions for new compatible features, and major versions for breaking changes. Update this log in the same commit. Do not edit app.js/sw.js version constants separately.

An unfinished development branch uses a `-dev` suffix. Before publishing finished work, remove that suffix and select a version newer than main. Never merge the unfinished exercise migration just to update its version.

## 2.18.0 — 2026-10-10, build 20261010.2

Seven stronger accent presets include pink and an updated royal blue. New selections/custom hues use vivid colors with readable fill labels and light/dark accent text; previously stored soft custom colors are preserved. The large hue wheel previews Reppsy rather than Aa, with a clearer outlined thumb and selected swatches.

All Settings cards and the accent/custom/background sections are collapsible and open by default. User closures remain during navigation/theme changes; a fresh app load starts open. A circular profile-photo shortcut is at the top right; the bottom Profile icon also uses the saved photo. Header controls wrap when needed on narrow screens.

The profile editor has a live preview, four personal cover designs, three photo/frame shapes and an app-accent option. `settings.profileStyle` is sanitized, included in private sync/backup and restored after reload. Public profile themes, photo, bio and badges retain the existing Supabase format: the new cover/frame layout is personal to the user's app. Update other devices before editing this optional setting to avoid older clients dropping it. No SQL migration is required.

Removed the App/update settings card and automatic Restart banner. Version/release notes/shortcut help remain in a compact footer. A background, throttled manifest check reveals only the Settings-header update button for a newer version/build. Installation retains complete service-worker hash verification, shows a modal reload animation, saves data before restart, and announces success only when the reloaded build matches the expected release. Network failure releases the modal lock and allows retry; reduced-motion settings are honored. Cached older HTML loads new helper scripts before store initialization; release-tagged URLs avoid reusing an older script, and retries are bounded.

Validation: 11 Node checks; five focused Chromium tests for colors, disclosure state, live profile editing/export/restore, photo navigation, available-only update visibility, failure recovery, older-shell helper loading and a real verified two-release install/reload; six dl/food/color regressions; three existing photo/responsive/offline tests, including 16 viewport/language/text scenarios across all main/inner tabs. No live accounts were used. Physical Safari and hosted deployment are unverified.

## 2.17.0 — 2026-10-10, build 20261010.1

Custom color is always visible inside Appearance. A large circular hue control with a 46px thumb supports direct taps, pointer/touch dragging and keyboard arrows/Home/End; selection previews immediately and saves on release. Preset/background changes retain the wheel. Only the wheel captures scrolling gestures.

Supported liquids default to dl with quick portions and a g/dl switch. Each database conversion uses that food's documented gram/volume serving, preferring explicit metric portions over USDA US household units. No water-density assumption. Unknown-volume entries offer label entry; own-food labels support 100 ml (1 dl), manual logging supports dl, and the diary/recent entries display volumes. Existing gram entries and imported plan quantities are preserved.

Optional diary/recent `vml` and own-food `basis:'ml'` survive storage cleaning, exports and restore. Label-based drinks retain volume without inventing mass. All devices should update before editing these new entries: older clients can drop optional fields and interpret own-food label values as per 100 g. No SQL migration is needed.

Validation: eight Node calculation/geometry checks; six focused Chromium phone tests for drag/touch/keyboard/theme persistence, milk g/dl conversion, label/manual drinks, recent entries and export/restore; existing responsive/recipe/photo/offline checks. Touch emulation and narrow HU/enlarged text reviewed. Physical Safari and live account sync are unverified.

## 2.16.0 — 2026-10-09, build 20261009.1

Reppsy replaces the current visible Setora name. A new custom apricot/coral motion-link logo appears in headers, login/onboarding, browser and install icons. It is an abstract mark, not a letter R. New asset URLs and runtime metadata refresh update older cached HTML; all four deployment icons are in the verified offline shell. Backup/CSV filenames use `reppsy-`.

Manifest identity/start URL/scope, app address, storage keys, accounts and private diary data remain unchanged. Source PNG and deployment sizes are recorded in BRANDING.md. Existing iOS shortcuts may retain their old OS-managed metadata; Settings already provides backup/re-add guidance.

Validation: local Chromium at 320px HU/390px EN verified current names, loaded header images, manifest identity and icon dimensions, old-title/icon refresh, backup filenames and diary persistence. Sign-in branding and real verified offline reload also passed. Syntax, whitespace and release hashes checked. Physical iOS/Android shortcut refresh, live account operations and deployment not verified. Name availability remains unverified.

## 2.15.0 — 2026-10-08, build 20261008.17

Food actions use equal-width icon/label tiles, with an adaptive two-column layout for tight content widths and larger text. Describe stays on one line. Page gutters account for safe areas; navigation and exercise filters size from content and wrap; macros, action rows and sheet footers adapt to the space available. Narrow phones use a compact Hungarian Settings caption with the full accessible name. Calorie readouts scale within the dial. Recipe ingredient notes wrap instead of running out of their card.

All 19 recipe photographs were generated separately. Each has a native 1448 × 1086 WebP detail and a lightweight 384 × 288 thumbnail derived from its own whole image. The old atlas, tile positioning and old PNG assets are removed; all 38 new image assets are in the verified offline release. Ingredients, quantities and nutrition remain unchanged; a concise caption identifies generated serving ideas.

Own and viewed-friend profile photos open in the shared larger image dialog, keeping the background locked. Opening an image from the profile editor preserves the unsaved draft when returning. Empty profile filler and a redundant zero-calorie equation are removed; activity and calorie-toggle labels are shorter.

Validation: four focused Chromium regression tests passed, covering 16 English/Hungarian phone/landscape/text-size combinations (320/360/375/390/430 widths, 844 × 390 landscape, 16/20px root text), all tabs/subtabs, active workouts, populated diary, action dialogs, contained navigation labels, all 19 sharp images, photo enlargement/background blocking/draft/reload, and every image after a real verified service-worker install and offline reload. Six starter-template tests also passed. All 19 dish previews and representative mobile screenshots were visually reviewed. Physical iOS/Android, live account operations and hosting deployment were not verified.

## 2.14.0 — 2026-10-08, build 20261008.16

All 24 optional starter sessions now contain seven exercises and estimate approximately 60–70 minutes. The five-day starter copies the original Upper/Lower/Push/Pull/Legs movements and prescriptions. Estimates include 12 minutes preparation, two minutes per equipment change, 45 seconds per working set and programmed rest only between sets, respecting zero rest. These are estimates, not enforced minimum elapsed times.

Untouched previously added starter sessions upgrade conservatively after a successful account sync, or immediately in local/demo mode. Customized routines, deleted sessions, original built-ins, active workouts and history are preserved. The two video combinations appear in Workout → Exercises → Exercise complexes instead of Plans/next-workout suggestions. Starting them retains the Centr circuit's ten rounds and the pulldown combination's three grips, AMRAP and tempo notes.

Validation: six focused Node tests passed (exercise validity/counts/durations, original prescriptions, rest semantics, migration/idempotence/customization preservation, complex identities). Local Chromium checks at 320px EN/390px HU verified adding the five-day split, both complex starts, source circuit/tempo preservation, no complex recommendations, no page errors and no horizontal overflow in the reviewed screen. Live account sync, deployment and physical iOS were not verified.

## 2.13.2 — 2026-10-08, build 20261008.15

Settings adds an accessible compact update icon immediately before Upload in its header. Other headers are unchanged. The header action forwards to the existing updater, retaining busy/disabled state and update-status feedback; the existing App-section update button remains. Syntax/whitespace and focused local Chromium review at 320px EN/390px HU confirmed Settings-only placement, contained header actions, release-check invocation and recovery from an intentionally unavailable local release response. No tests added/run for this small UI change; successful live installation and physical Safari were not verified.

## 2.13.1 — 2026-10-08, build 20261008.14

- Cardio shortcut uses a constrained layout: phones up to 480px place the full-width Add button below the description; wider views use a content-sized button alongside flexible text. This removes the inherited 100%-width, non-shrinking flex button that squeezed the description and escaped its card.
- Shared buttons have bounded widths and wrappable text; two/three-action and inline grids use zero-minimum tracks. Heading rows can wrap actions onto another line. Intentional full-width actions remain full-width.
- No tests added/run. Source/syntax/whitespace review and manual local Chromium screenshots covered all five tabs at 320px EN, 390px HU, 430px EN, and 320px HU with 20px root text. Geometry observations found no visible controls outside their viewport/card/grid, no page errors, and the cardio action opened its form in each layout. These observations cover the local states reviewed; live deployment and physical Safari remain unverified.

## 2.13.0 — 2026-10-08, build 20261008.13

- Main and inner tabs use the same navigation transition; asynchronous Profile redraws preserve an active entry animation. Button press feedback covers new controls and respects reduced motion/calm preferences.
- Native on/off preferences render as accessible switches. Multi-select and approval checkboxes retain their selection semantics.
- Crimson red and Royal blue palettes use vivid fills and contrasting text. Existing custom hues remain soft by default; optional validated accentTone persists through existing settings sync/backup. Every routine icon follows the accent in dark/light themes.
- Profile has Overview, Your lift ranks and Friends pages. Overview/Workout rank shortcuts open the rank page. New target-and-arrow Goals icon and original gym-themed routine symbols.
- Five optional, editable split templates: 3-day full body, 4-day upper/lower, 5-day upper/lower + PPL, 6-day PPL and 6-day Arnold-inspired. Preview sessions before appending, customize through the existing editor and fold added groups in Plans. No existing routine is replaced automatically.
- All routines, including built-in days, can be removed after confirmation without deleting history or active workouts. Empty routine lists stay empty after reload; failed saves retain the prior list. See ROUTINE_TEMPLATES.md.
- Corrected the recipe-image update's historic What's new entry to its fixed 2.11.0/build 20261008.11 identity.
- No tests added/run. Source/syntax/whitespace review and manual local Chromium screenshots at 320px EN dark /390px HU light covered all main entry animations, rank navigation, switches/palettes, accent-colored original routines, split preview/add/edit/remove and empty-list reload. Demo counts changed 7→12→11, a removed built-in Lower stayed absent, empty stayed 0, and Royal blue persisted. No recorded page errors/horizontal overflow. All template IDs exist in the current exercise library. External routine sites were blocked by proxy 403; templates use common structures, not verified copies of published programs. Live sync/offline/deployment and physical Safari remain unverified.

## 2.12.0 — 2026-10-08, build 20261008.12

- Profile now has Overview and Friends pages with top navigation; nutrition, achievements and lift ranks stay in Overview.
- Friends puts a usable search field first, displays connected profiles directly and folds weekly competition into an optional section. Request feedback stays beside search, and queries survive refresh/error redraws. The Add button no longer squeezes the input or overflows its card.
- After private sync, a previously chosen username publishes automatically when the current account has no social profile. Existing server claims are preserved and username conflicts remain explicit. Username lookup accepts a leading @ and uppercase; missing username/contact messages explain publication and discovery requirements.
- No SQL migration added. Contact opt-in, verification and private-data permissions are unchanged.
- No tests added/run. Source/syntax/whitespace review and manual local Chromium screenshots at 320px EN dark /390px HU light used synthetic account responses. Reviewed Overview/Friends, absent-profile publication, search failures, sent requests and connected/expanded competition, with no recorded page errors or horizontal overflow. Real accounts, live SQL/deployment, offline installation and physical iOS remain unverified.

## 2.11.0 — 2026-10-08, build 20261008.11

- All 19 recipe ideas show original generated serving references in the list and recipe detail. Captions identify illustrative images; ingredients, portions and nutrition remain unchanged. Both local source images are included in the verified offline shell.
- Card/field outlines and the bottom navigation follow the accent in light and dark themes. Custom accent text now follows the chosen hue in dark mode as well.
- The expanded custom-color section survives palette/background changes; pending slider redraws are cancelled when making a new selection.
- SOCIAL.md explains activating both Supabase migrations, usernames, accepted requests and opt-in verified contact lookup. Live migrations have not been applied by this release.
- No tests added/run. JavaScript syntax/whitespace review and manual Chromium screenshots at 320px EN / 390px HU covered recipe images and Settings changes, with no recorded page errors or horizontal overflow. Live serving, offline installation, accounts and physical Safari remain unverified.

## 2.10.1 — 2026-10-08, build 20261008.10

Food replaces its calorie headline/bar with the same shared lined calorie clock as Profile. It uses the selected diary day and applicable budget, retaining separate base/exercise calories, macros and remaining/over-target amounts. No tests added/run; syntax/whitespace and manual mobile layout review only.

## 2.10.0 — 2026-10-08, build 20261008.9

- Lifting calories are estimated from confirmed duration/body weight/intensity after logging sets; older logs can be completed without invented estimates.
- Walking, incline walking, running, stairs, cycling and elliptical cardio can be logged alone, during an active workout, or in a saved session.
- Food/Profile retain the base calorie target and show lifting/cardio energy separately. Optional exercise inclusion uses base + active exercise − food; entered daily active totals replace estimates to avoid double counting.
- Sanitized session inputs and independent edit timestamps persist through the existing private sync and JSON backup. No extra database migration/API is needed.
- See WORKOUT_ENERGY.md for net-active formulas, effort assumptions, supported inputs and activity-multiplier limits. No tests added/run; syntax/whitespace and manual mobile screenshots reviewed. Live sync, physical Safari and deployment remain unverified.

## 2.9.1 — 2026-10-08, build 20261008.8

Profile macro totals are rounded for display to one decimal, avoiding floating-point strings such as `208.60000000000002`. Flexible value/unit rows and constrained columns prevent overlap while retaining complete values; bars align beneath each total. Stored nutrition values are unchanged. No tests added/run; syntax/whitespace and manual screenshot review only.

## 2.9.0 — 2026-10-08, build 20261008.7

- Setora working name in app, signup, manifest and browser metadata; existing account/data/PWA identity retained.
- Settings is a full tab with visible, usable bottom navigation. Quick section links, curated palettes, background previews and collapsible advanced sections replace the crowded chooser; custom hue and accessibility settings remain.
- Goals uses the shared lined dial and collapsible starter ideas. Workout navigation stays within reach while scrolling; Food puts search first. Profile keeps ranks before friends and correctly rotates/preserves its disclosure arrow.
- Exact friend lookup by verified email or phone, with opt-in discovery, private contact settings, bounded lookup and optional Auth SMS verification. Run `migrations/20261008_social.sql`, then `migrations/20261008_social_contacts.sql` on your existing Supabase project; configure SMS only if enabling phone verification. Neither migration was activated on the live project by this release.
- No tests added or run. Source/syntax/whitespace review and manual Chromium screenshots at 320/390 px covered all tabs in dark/light/custom appearances. Disposable account fixtures rendered contact controls and the upward open-rank arrow without runtime errors or horizontal overflow. SQL execution, live social/SMS, physical iOS and deployed serving remain unverified.

## 2.8.1 — 2026-10-08, build 20261008.6

- Restored the previous detailed anatomical drawing from data/body.js and removed the rejected schematic. Exercise details open with the existing movement images again; muscle selection remains available.
- Personalized signup, calories, navigation, account data and stored media are retained.
- No tests run. JavaScript syntax and whitespace reviewed. Backup: `backup/main-20261008-161655-before-drawing-restore` at `50018935f9d808f2d18910304243657aa402692c`. Normal restoration commit, no reset/force push.

## 2.8.0 — 2026-10-08, build 20261008.5

- Navigation now places Goals in the center and Settings immediately left of Profile. The main header keeps upload only.
- Private signup asks goal/body/activity before account credentials, previews calculated calories/macros, and restores the initial target after confirmation/sign-in through validated Auth metadata. Existing profiles, targets and reset epochs take precedence; the regular calculator shares its unchanged formula. No SQL migration required.
- Original front/back SVG anatomy, red/rose muscle highlights and individual group selection. Exercise details provide Muscles and Movement views; existing images, zoom, instructions and logging remain available.
- Runtime metadata repairs cached old branding references; stable manifest ID and Settings shortcut guidance explain iOS/browser limits. No automatic iPhone shortcut rewrite claim.
- No tests added/run. Separate syntax/whitespace and manual Chromium screenshot review used isolated demo account responses and synthetic profiles in HU/EN, dark/light, 320/390 px, including confirmation-required sign-in, profile meter and exercise views. Real Supabase/email, physical Safari/iPhone and live deployment unverified. See PERSONALIZATION.md.
- Verified pre-change code backup: `backup/main-20261008-114552-before-personalization` at `7283b1e59e6db77301070a12804afca8a374afc7`, plus complete local history bundle. Restore with a normal reviewed commit and newer release, never force-push.

## 2.7.0 — 2026-10-08, build 20261008.4

- Full shared appearance refresh: graphite, apricot and lavender, plus a warm light theme. Consistent headers, cards, forms, calendars, dialogs and five-button navigation cover Workout, Food, Goals, Profile, Settings and document uploads.
- Keeps custom hue/background/profile-cover choices, opaque surfaces and reduced motion. Exercise IDs, routines, logs, backups, account configuration and sync remain compatible. The new stylesheet is included in verified offline precaching.
- No tests added or run, per explicit user instruction. Separate syntax/whitespace checks and manual Chromium layout review covered small/large mobile, desktop workout/dialog views, light and custom themes, and the actual attached PDF preview/saved collapsible meal plan. Physical Safari/iPhone and live deployment remain unverified. See DESIGN_REFRESH.md for limits.
- Verified remote backup: `backup/main-20261008-112335-before-design`, preserving main `fd69d37e867dc5406c7bd02209a668ab6aba2aa0`; complete local history bundle also retained. Restore through a normal restoration commit with a newer release, never force-push.

## 2.6.1 — 2026-10-08, build 20261008.3

- Renamed the app to Otisport, following the user's suggested name direction. HTML, Apple home-screen metadata, manifest names, Hungarian/English labels, sign-in and export filenames use the new brand. App URL/scope, storage keys, account configuration and data schema stay compatible.
- New generated mint O app icon replaces the previous branding, with Apple, browser, PWA and padded Android maskable sizes. Versioned asset names and verified offline precaching include every deployed icon. Full-resolution master retained; see BRANDING.md.
- Validation: four existing release/update/browser tests passed, including verified upgrade, offline import and retained data/open previews. Actual browser checks confirmed manifest dimensions, both-language sign-in and loaded icon artwork. Syntax, manifest hashes, whitespace, backup verification and sign-in screenshot review passed. Physical iOS shortcut metadata refresh remains unverified.
- Backup: `/workspace/GymApp-backups/GymApp-before-otisport-branding-20261008.bundle` preserves v2.6.0 and complete Git history.

## 2.6.0 — 2026-10-08, build 20261008.2

- Bottom navigation: Workout, Food, Settings, Goals and Profile. Exercise search/library is inside Workout; Goals contains existing habits and progress without moving or deleting their logs.
- Custom profiles support display name, unique account username, photo, bio, four cover colors, lift ranks, gym totals and a 60-line calorie dial reflecting today's actual diary target and activity budget. Private profiles remain included in existing sync/backups.
- Seven derived workout achievements; select up to four earned badges individually and see new unlocks after finishing. Deleted qualifying history removes earned status from display.
- Authenticated username publication, friend requests/acceptance/decline/cancellation/removal, friend profile views and a Monday–Sunday UTC leaderboard. Points reward training days and capped working sets; see SOCIAL.md for rules.
- Additive migration `migrations/20261008_social.sql` keeps private userdata policies unchanged, restricts profile/connection operations to checked RPCs, derives scores/earned badges from saved logs, and caps connection counts. **Live activation requires running this migration in Supabase SQL Editor.** The project cannot be reached here (proxy 403); no database admin credentials are available. No live deployment claim.
- Validation: all 52 Chromium tests and 12 disposable PostgreSQL tests passed. Includes profile photos/save/reload/storage retry, calorie clock, badge selection/unlocks, responsive navigation, authenticated social HTTP flows and server permissions, request/friend caps, every lift-rank boundary and derived score/badge parity. Syntax/manifest/whitespace and dark/light mobile screenshot checks passed. Physical iPhone/Safari and live Supabase deployment remain unverified.
- Verified backup: `/workspace/GymApp-backups/GymApp-before-profile-social-20261008.bundle`, preserving v2.5.1 and complete Git history.

## 2.5.1 — 2026-10-08, build 20261008.1

- Exercise details, enlarged images and other sheets now lock document scrolling and background controls, including active workout inputs. The dialog content remains scrollable.
- Sheets and plan uploads share a lock: closing an underlying sheet leaves an upload locked; returning from image zoom leaves the detail sheet locked. Closing the final dialog restores the previous page position, inline styles and inert states.
- Closing animations retain the input shield to avoid interactions through a departing sheet. Scroll/touch events on the backdrop cannot move the page.
- Validation: all 43 Chromium browser tests passed, including verified offline updates; JavaScript syntax, manifest hashes and whitespace checks passed. Mobile zoom screenshot and actual backdrop-close restoration checked. Physical iPhone/Safari remains untested.
- Added regressions for exercise zoom/back/close, preserved styles and background action blocking, uploads over Settings, and active workout scroll restoration. Backup: `/workspace/GymApp-backups/GymApp-before-dialog-lock-20261008.bundle` (verified complete history).

## 2.5.0 — 2026-10-07, build 20261007.13

- Compact 44-pixel plan upload button beside Settings on every main page; supports PDF, Excel and Word without repeated large import cards.
- Workout navigation is divided into Train, Plans, History and Ranks. Train focuses on starting/resuming, switching plans and the latest session; Plans uses compact routine rows, and History includes expandable working-set volume.
- Active workouts have a direct exercise selector and completed-set count. Finishing a workout exposes an expandable weight/reps/subtotal breakdown by tapping the volume total.
- Weekly meal days and the diary's daily plan are collapsible; the current scheduled weekday is expanded initially. Existing one-tap meal logging and plan notes are retained.
- Six personal ranks (Spark, Ember, Steel, Sentinel, Titan, Apex) track actual working-set weight in four exact barbell lifts. Existing history qualifies automatically; warm-ups and tick-only sessions are excluded. New tiers appear after finishing, with next targets and milestone ladders. See RANKS.md for thresholds and data rules.
- 40 Chromium browser tests passed: new upload/collapse navigation, active exercise jumps, actual finish/volume/rank unlock, reload/delete recalculation, boundary/exclusion rules and mobile layouts in both languages/themes, plus existing import, storage rollback, image and verified offline-update checks. JavaScript syntax, content-hash manifest and whitespace checks passed. Physical Safari/iPhone remains untested.
- Previous release backed up in a verified Git bundle and `backup/before-workout-ranks-20261007`. Release history is visible in Settings.

## 2.4.3 — 2026-10-07, build 20261007.12

- Release manifests contain SHA-256 hashes for every app-shell file. Installation and explicit updates verify all downloads before replacing the release; active modules are immutable rather than individually refreshed. Stale/incomplete deployments are rejected without replacing the working cache.
- Update checks compare the latest published version with the installed worker. Automatic updates offer a Restart button without discarding an open import preview. Planned photo warming runs after activation, avoiding an update delay from more than 100 image downloads.
- The exact v2.4.1 app/parser/worker reproduced the user's screenshot. Updating that legacy installation to this verified release imported and saved the supplied PDF's 28 meals, with calories/macros and successful reload.
- Missing/broken drawings now use exact local start/end photos, retaining the existing artwork as the first choice. Photo pairs can be enlarged. Three exercises still have no available image pair.
- A reusable media audit and batch-production guide prioritize the 12 missing illustrations used by built-in routines. Current catalogue: 877 exercises, 188 illustrations, 873 photo pairs.
- 34 Chromium browser tests passed, along with JavaScript syntax and whitespace checks. Browser regressions cover stale-parser rejection/retry, retained data, complete-release hashes, automatic restart prompts, built-in exercise images, photo enlargement and broken-drawing fallback. Actual website/iPhone verification remains pending the user's app URL/version; the default GitHub Pages domain is blocked by the environment proxy.
- Pre-change backup is preserved in a verified Git bundle and `backup/before-verified-updates-20261007`.

## 2.4.2 — 2026-10-07, build 20261007.11

- PDF extraction retains text-column positions. An explicit Food / Amount / kcal header labels the ingredient calorie column, so unlabelled values in that column are read correctly. Unlabelled columns such as Price are left unresolved.
- Meal total rows populate meal calories and Meal macros rows populate protein, carbs and fat; macro summaries are no longer mistaken for ingredients.
- Fixed rules are saved as plan notes without creating extra Breakfast/Dinner entries. Printed daily totals and training/rest classifications are retained.
- The supplied nine-page diet PDF was imported in an isolated real browser: all 7 days, 28 meals and 104 food entries matched an independent extraction of its grams, calories and macros, before and after saving/reloading. All 9 diet rules were retained. The document and its personal contents were not added to the repository.
- 29 Chromium browser tests passed, including new generated table/summary fixtures and an unlabelled-price regression. JavaScript syntax and whitespace checks passed. Physical iPhone/Safari remains untested.
- Backup branch `backup/before-pdf-calories-20261007` and a verified local Git bundle preserve the previous release.

## 2.4.1 — 2026-10-07, build 20261007.10

- The import dialog has an explicit viewport height and a scrollable preview with a separate footer. Safe areas and changes to the visible viewport keep the dialog within the available space.
- Opening the importer fixes the background at its current scroll position. Closing, cancelling or opening saved plans restores the previous styles and scroll position.
- Custom SVG symbols for Push, Pull, Legs, Upper and Lower share a consistent stroke and highlighted muscle regions. Lower has its own selectable, saved icon; automatic built-in icons match their workout types.
- Added browser checks for preview height in portrait/landscape, scrolling and background locking, cancellation/reopening, keyboard-like viewport changes and icon selection persistence. Safari/WebKit and a physical iPhone remain untested because the browser download is blocked by the environment proxy.
- Validation: 27 Chromium browser tests passed, including the cached update/offline import check. JavaScript syntax and whitespace checks passed; mobile and landscape screenshots were reviewed.
- The previous release is preserved in GitHub branch `backup/before-dialog-icons-20261007` and a verified Git bundle outside the checkout.

## 2.4.0 — 2026-10-07, build 20261007.9

- Structured XLSX import uses Hungarian/English column headers, worksheet names, day/meal groupings, merged grouping cells and explicit units. Ingredient nutrition is summed only when all values are supplied; per-100-g columns are scaled by stated grams. Formulas use saved values only.
- Files are read automatically after selection. Compact previews show detected workout and meal counts, highlight missing fields and offer column mapping for unrecognized worksheets.
- One Add plans action saves the selected sections. Meals append to the existing plan by default, replacement is explicit, and existing routines, diary entries and active workouts are retained.
- A weekly Meal plan view makes every imported weekday visible. Import success provides direct buttons to the saved plans.
- Updated mint/deep-ink and light palettes, cards, navigation and responsive import dialog.
- What's new in Settings shows the installed release and recent app updates.
- 23 Chromium browser regression checks passed: XLSX/DOCX/PDF import, saving/reload, preserved data, workout/meal logging, storage rollback, responsive themes and an offline update/import. Syntax and whitespace checks passed. The user's original workbook was not provided; fixtures cover documented formats. Safari/WebKit download was blocked by the network proxy.

## 2.3.1 — 2026-10-07, build 20261007.8

- FileReader fallback for missing File.arrayBuffer/File.text APIs and repeat selection of the same document or image.
- No browser tests were run before that commit; it did not resolve structured spreadsheet recognition.

## 2.3.1 — 2026-10-07, build 20261007.7

- PDF text extraction reads the public PDF.js stream with a reader, avoiding ReadableStream async iteration unavailable in some Safari versions (upstream PDF.js issue #20973).
- Cancellation and extraction limits remain enforced; cleanup does not replace the original reading error.
- Import errors distinguish reader loading, PDF opening, text extraction, password protection and invalid PDF structure, with a short diagnostic instead of assuming the document is damaged.
- Shared release metadata refreshes the service-worker shell and installed app version.
- Source/diff review and JavaScript syntax checks only. No tests or real document/iPhone checks run; the PDF shown in the reported screenshot was not available.

## 2.3.0 — 2026-10-07, build 20261007.6

- Local, API-key-free assisted PDF/DOCX/XLSX plan import with bundled PDF.js 5.6.205 (Apache-2.0).
- One or two documents, location-referenced source text and OOXML table rows, limited explicit-format recognition and editable workout/weekly meal preview.
- Exact exercise selection, required missing fields, review approval, JSON download and separate diet-replacement approval.
- New routines append; the original split, diaries, active workout and account/sync stay intact.
- Scanned PDFs have no OCR; unusual layouts require manual completion. No invented nutrition or rest-range midpoint.
- PDF reader and worker are included in the versioned service-worker shell.
- Source/diff review and syntax checks only; no tests or real PDF/mobile/account checks run.
- This release contains only PDF import; the exercise catalogue PR remains separate.

## 2.1.1 — 2026-10-07

- Long exercise instructions and muscle names wrap inside their cards.
- Horizontal page overflow is constrained; vertical scrolling and local filter scrolling remain available.

## 2.1.0 — 2026-10-07

- Goals month calendar with independent day selection and restored daily/weekly layout.
- Compact conditional today button, individual drawing enlargement and drawing-only exercise details.
- Update progress/result feedback and shared visible release/build metadata.

Earlier changes displayed `2.0` without a complete release log. Their actual commits remain the source of history; historical version numbers have not been invented.

Validation: source/diff review and JavaScript syntax checks. No tests or browser interaction/offline checks run.

