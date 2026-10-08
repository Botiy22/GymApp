# Otisport 2.8 — private signup and exercise anatomy

Updated in 2.8.1 / build 20261008.6: the user requested restoring the earlier detailed drawing. The original schematic added in 2.8.0 was removed; data/body.js supplies the drawing again. Movement opens first, while the muscle picker remains available. Signup and navigation are unchanged. The 2.8.0 implementation notes below describe the preceding release; its original-anatomy section is superseded by this restoration.

## Navigation

Workout · Food · Goals · Settings · Profile. Goals sits in the middle; Settings is immediately left of Profile and opens the existing dialog. Main headers contain only the compact document-upload button. Language changes also update the Settings navigation label.

## First signup

Selecting Register begins four short steps: goal, sex/age/height/weight, typical activity, then the calculated daily target and macros. Users review the result before entering email/password. Back and language controls preserve the in-memory draft. Each step starts at the top of the scrollable signup surface. Invalid or incomplete values block progression without guessing missing data.

`js/personal-setup.js` centralizes the existing Mifflin–St Jeor calculator, preserving its previous calorie/macro calculation, ranges, floor and under-18 behavior. The regular Profile/Settings calculator uses the same function. The requested goal and the effective calculated goal can differ under the existing minor/floor rules; the preview displays the effective calculation.

Validated profile fields travel in the signup request as private Supabase Auth `user_metadata.otisport_onboarding = {version: 1, profile}`. The draft is not saved into an unrelated device account before signup. Confirmation links and subsequent sign-in recover this metadata through the Auth user response, so registration does not depend on keeping the signup browser tab open. The session retains only the normalized setup fields, alongside its existing session information; this data is not used for roles or authorization.

After account isolation and cloud synchronization, a previously unconfigured private profile gets its initial target through the existing atomic Store.apply operation. `settings.onboardingVersion` records completion in normal sync/backups. Existing body profiles or manual targets take precedence. Imported meal plans keep their existing weekday-target precedence. A nonzero reset epoch prevents old registration metadata from restoring data after an explicit Delete all data. Public profiles/friend RPCs receive no new body or calorie fields. No new SQL migration is required.

## Exercise anatomy

`data/otisport-body.js` contains original hand-authored SVG shapes for front/back silhouettes and muscle groups. It does not contain Lyfta artwork, screenshots, traced shapes or code. The public Lyfta website request was blocked by the environment's proxy (403), so this work follows the user's description, not an inspected competitor screen.

Exercise details start with Muscles, with Movement one tap away. The existing movement drawings/photos, individual zoom, instructions, history and add-to-routine/workout actions remain available. Primary regions appear red, secondary regions rose. A short reveal animation respects reduced motion and the saved calm preference. Selecting a muscle name highlights it and returns the dialog to the body illustration; All restores the exercise's full map. Existing exact routine-region mappings still take precedence when available. The figure is a schematic of catalogue muscle groups, not measured activation or percentages; this explanation is available in its expandable caption. Exercises without assigned groups say so.

The new body/module are included in the offline release manifest. Bootstrap handles older cached HTML that lacks their script tags. Stored exercises, routines, diary IDs and photos are unchanged; the unfinished broader exercise-media migration is not part of this release.

## Home-screen names and icons

Runtime metadata also repairs older HTML title/icon/manifest references. The manifest now declares an explicit ID matching its previous implicit start_url identity (`./index.html`), preserving scope and app data origin. The current Otisport icon assets remain unchanged.

This does not promise an OS shortcut rewrite: ordinary bookmark titles and existing iPhone Home Screen metadata are managed outside the page. Settings → App → Update name and icon provides platform guidance and a backup action. iPhone users should export before adding a new Home Screen installation, and retain the old installation until the new one has their data. Android browsers may refresh installed PWA metadata on their own schedule. Physical home-screen metadata refresh remains unverified.

## Review and limits

No tests added or run, under the user's standing instruction. Separate JavaScript syntax/whitespace checks and manual screenshot/layout review were performed. Disposable Chromium contexts used synthetic body data and intercepted demo account responses, without creating users or contacting the live Supabase project. Hungarian 320/390 px dark views and English 390 px light views were reviewed across goal/body/activity/summary/account screens, the confirmation-required sign-in view, resulting profile meter, anatomy/selected-muscle/Movement views, Settings and shortcut guidance. The demo's displayed calorie target matched its summary after sign-in; no page JavaScript errors appeared in those captured sessions. Existing manual target/reset precedence was reviewed in source. These observations are not a regression-suite result or verification of real email delivery, cloud behavior, physical Safari/iPhone or live deployment. Historical tests have not been updated to the new release/nav/UI.

## Verified backup

Created and verified before edits from actual remote main:

- Remote code branch: `backup/main-20261008-114552-before-personalization`.
- SHA: `7283b1e59e6db77301070a12804afca8a374afc7`.
- Complete verified history bundle: `/workspace/GymApp-backups/GymApp-before-personalization-20261008-114552.bundle`.

Code backup does not export private diary/account data; all previous backups remain. Restore through a reviewed normal commit/PR on current main, never a force push/reset. Revert this release's implementation together, assign a newer release/build, and regenerate `release-manifest.json` with `python3 tools/build_release.py`. Review intervening work before restoring. Private setup fields already stored in Auth metadata are additive and ignored by the earlier client; a code rollback does not remove live account metadata.
