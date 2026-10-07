# Browser regression checks

Run from the repository root:

```sh
python3 -m pip install playwright
python3 -m unittest discover -s tests -v
```

The runner uses `/usr/bin/chromium`. If Chromium is installed elsewhere, set `GYMAPP_BROWSER_EXECUTABLE` to its executable path. A Playwright-managed Chromium can be installed with `python3 -m playwright install chromium`; use the path from `playwright.chromium.executable_path`. No app build or npm dependencies are required.

The tests start a temporary HTTP server and run the real app in fresh Chromium contexts. They generate actual OOXML ZIP containers with inline/shared strings, merged cells, cached/uncached formulas, Hungarian/English headers, separate workout sheets and weekday meals. Generated PDF and DOCX documents exercise the existing text readers. Fixtures contain invented test data. Tests never use a personal workbook or user account: ordinary tests replace the public cloud config with an empty test config; the service-worker test disables account initialization while serving the real app resources.

Coverage:

- XLSX recognition, explicit column mapping, worksheet-based workout/day names, merged day/meal groups, decimal commas, units, per-100-g scaling and zero-second rest.
- Automatic preview, missing-value/exercise corrections, explicit default-rest selection, missing-weekday scheduling, selecting only the valid section and repeat file selection.
- Appending workouts/meals, confirmed meal-plan replacement, capacity limits and persistence across reloads.
- Preservation of existing routines, diary entries and active workouts; storage errors restore the previous state and do not produce false success or duplicate retries.
- Starting and finishing an imported workout; logging and undoing an imported meal.
- FileReader fallback for XLSX and JSON backup reading, malformed/oversized file handling and invalid advanced JSON.
- PDF reader/worker and DOCX import, visible release history, all five navigation tabs in four themes at 320/390/768/1280 px, plus responsive import controls and footer.
- Updating from an older cached HTML/release/service-worker shell to 2.4.0 without losing plans, then importing XLSX and PDF while offline.

Validation on 2026-10-07: **23 Chromium browser tests passed**. JavaScript syntax checks and Git whitespace checks also passed. Mobile and desktop screenshots were visually reviewed.

The user's exact XLSX was not supplied. These results cover the fixture layouts above. The Safari/WebKit binary download returned proxy `403 Domain forbidden`, so no WebKit or physical iPhone test was run. Live Supabase authentication/sync and Anthropic calls are not covered; the test contexts have no live account or API key.
