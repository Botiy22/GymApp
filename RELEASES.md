# Release versions

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

