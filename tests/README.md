# Browser regression checks

Run from the repository root:

```sh
python3 -m pip install playwright
python3 -m unittest discover -s tests -v
```

The runner uses `/usr/bin/chromium`. If Chromium is installed elsewhere, set `GYMAPP_BROWSER_EXECUTABLE` to its executable path. A Playwright-managed Chromium can be installed with `python3 -m playwright install chromium`; use the path from `playwright.chromium.executable_path`. No app build or npm dependencies are required.

The tests start a temporary HTTP server and run the real app in fresh Chromium contexts. They generate actual OOXML ZIP containers with inline/shared strings, merged cells, cached/uncached formulas, Hungarian/English headers, separate workout sheets and weekday meals. Generated PDF and DOCX documents exercise the existing text readers. Fixtures contain invented test data. Tests never use a personal workbook or user account: ordinary tests replace the public cloud config with an empty test config; the service-worker test disables account initialization while serving the real app resources.

Coverage:

- Navigation order, nested exercise search, Goals habits/progress, bottom Settings and customizable Profile.
- Profile photo, safe text/bio/color save/reload, calorie dial from today's real budget, badges earned/selected individually, four-slot limit and recalculation after deletion. Mobile layouts in both languages/themes; profile storage-failure retry.
- Authenticated social HTTP fixtures cover publication, requests, acceptance, profile viewing, removal, missing migration and unique-username errors. Actual PostgreSQL permission/scoring validation is separately documented in [SOCIAL.md](../SOCIAL.md).
- Compact header upload across all pages; collapsible weekly days and daily plan with retained diary logging.
- Train/Plans/Exercises/History sections at mobile/desktop widths in English/Hungarian and dark/light themes; active exercise selector.
- Actual workout finish, volume expansion excluding warm-ups, Titan unlock at a logged 100 kg bench, persistence after reload and recalculation after deletion. Exact rank boundaries, catalogue IDs and exclusions for ticked/warm-up/unfinished/other-variant sets.

- XLSX recognition, explicit column mapping, worksheet-based workout/day names, merged day/meal groups, decimal commas, units, per-100-g scaling and zero-second rest.
- Automatic preview, missing-value/exercise corrections, explicit default-rest selection, missing-weekday scheduling, selecting only the valid section and repeat file selection.
- Appending workouts/meals, confirmed meal-plan replacement, capacity limits and persistence across reloads.
- Preservation of existing routines, diary entries and active workouts; storage errors restore the previous state and do not produce false success or duplicate retries.
- Starting and finishing an imported workout; logging and undoing an imported meal.
- FileReader fallback for XLSX and JSON backup reading, malformed/oversized file handling and invalid advanced JSON.
- PDF calorie columns with retained positions, meal totals/macros, rules saved as notes, and unlabelled numbers left unresolved.
- PDF reader/worker and DOCX import, visible release history, all five navigation tabs in four themes at 320/390/768/1280 px, plus responsive import controls and footer.
- Import preview minimum height, internal scroll, background lock and scroll/style restoration, cancellation/reopening, portrait/landscape dimensions and simulated keyboard viewport changes.
- Five distinct custom workout symbols, Lower icon selection and persistence after reload.
- Content-hash manifest validation, stale parser rejection/retry without data loss, immutable releases and a restart prompt that preserves an open preview.
- Loaded start/end images for every built-in routine exercise, exact photo fallback, enlargement and broken-drawing recovery.
- Updating from an older cached HTML/release/service-worker shell to 2.5.0 without losing plans, then importing XLSX and PDF while offline.

Validation on 2026-10-07: **40 Chromium browser tests passed**. JavaScript syntax checks and Git whitespace checks also passed. Mobile and desktop screenshots were visually reviewed.

The user's exact XLSX was not supplied. These results cover the fixture layouts above. The Safari/WebKit binary download returned proxy `403 Domain forbidden`, so no WebKit or physical iPhone test was run. Live Supabase authentication/sync and Anthropic calls are not covered; the test contexts have no live account or API key.

Additional validation for 2.4.2 used the supplied nine-page diet PDF in an isolated browser. All 7 days, 28 meals and 104 ingredients matched independently extracted amounts, calories and macros before and after save/reload; training/rest days and 9 rules were retained. The personal PDF is kept outside the repository and is not a committed fixture.

Additional 2.4.3 verification reproduced the supplied screenshot with the actual v2.4.1 app/parser/service worker, upgraded that installation, then imported and saved all 28 meals from the supplied PDF. The website URL/build is pending; requests to the assumed GitHub Pages host were blocked by the environment proxy.

## Responsive polish and independent recipe media (2.15.0)

Run `python3 -m unittest discover -s tests -p test_responsive_polish.py -v` for the four focused tests. They cover 16 phone/landscape/language/text-size combinations, all main/inner tabs, active workouts and a populated food diary, bounded controls/navigation labels, food-action dialogs, all 19 individual images, avatar enlargement/background blocking/nested draft/reload, and all recipe images after verified service-worker installation and offline reload. These fixtures use no live account or user image. Physical phone engines and live deployment remain outside this validation.

Starter sessions have separate pure checks: `node --test tests/test_routine_templates.js` (six tests).


## Profile sharing and surfaces (2.19.0)

Run `python3 -m unittest discover -s tests -p test_profile_sharing.py -v` for real Chromium checks of independent profile hue persistence/centering, four-button navigation, background/material differences, Data spacing and plan export round-trip, registration username metadata/duplicate preflight, likes, escaped reviews and fresh shared-routine copying. Auth routes use fixtures and never contact live accounts. `node --test tests/test_routine_share.js` checks privacy, custom exercise remapping, missing exercises and limits.

For disposable PostgreSQL role/RPC testing, install PGlite outside the checkout with `npm install --prefix /tmp/reppsy-pg --cache /tmp/reppsy-npm-cache @electric-sql/pglite --no-audit --no-fund`, then `node tests/test_social_sharing.mjs`. This covers migration reruns, atomic username uniqueness, anonymous/table isolation, pending/stranger/friend permissions, idempotent current-photo likes, editable/owner-removable reviews, sanitized templates, and stopping publication. No live database or physical Safari test.

## Covers, challenges and competition (2.20)

Focused fixture-only browser suites: `test_covers_friends.py`, `test_profile_sharing.py`, `test_profile_theme_updates.py` and `test_responsive_polish.py`. They cover photo upload/save/cancel/restore/removal; Friends search/contacts/long names/ties; real workout and meal check-in handlers with undo; challenge progress and lower lift ranks; old-backend fallback; all tabs with larger text, updates and offline install.

`node tests/test_competition.mjs /path/to/pglite/dist/index.js` checks actual disposable PostgreSQL against JavaScript for points, badges and all lift thresholds. `node tests/test_social_sharing.mjs /path/to/pglite/dist/index.js` checks repeatable migrations, cover privacy and existing likes/reviews/routine permissions. Install `@electric-sql/pglite` outside the app repository if needed. Neither test connects to Supabase.

## Personal routine and review polish (2.21)

`python3 -m unittest discover -s tests -p test_routine_review_polish.py -v` tests the actual downloadable JSON through Import/reload; conservative default retirement with edited copies/history/active workout and stale cloud merge; remembered achievements; double-click and touch photo likes; review failure/retry/stars/edit/cleared draft; shared update with a deliberately stale mutation response. Synthetic accounts only. The snapshot and disposable PostgreSQL tests also verify republishing replaces one share under the same ID.
