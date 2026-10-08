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
