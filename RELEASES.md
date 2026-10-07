# Release versions

`js/release.js` is the single source of the app's public version, build number and derived cache ID. Both the page and service worker load it. The app displays the installed version/build in Settings and in a verified update-success message.

For each published change, increment the public version and choose a new build (`YYYYMMDD.sequence`). Use patch versions for fixes, minor versions for new compatible features, and major versions for breaking changes. Update this log in the same commit. Do not edit app.js/sw.js version constants separately.

An unfinished development branch uses a `-dev` suffix. Before publishing finished work, remove that suffix and select a version newer than main. Never merge the unfinished exercise migration just to update its version.

## 2.2.0 — 2026-10-07, build 20261007.4

- 61 illustrated core exercises; 198 curated descriptions across the full database.
- Core library and picker default, with separate full-database access for all 878 entries.
- All 35 five-day split exercises and both supplied routines covered (39 distinct exercise IDs).
- Exact machine lateral-raise guide for the saved split, plus a separate machine entry for new plans.
- Short three-cue HU/EN descriptions, including the split's 21s curl sequence; long built-in coaching notes omitted from details.
- All published guide boards included in the mandatory release refresh for coherent offline assets.
- Existing IDs, saved plans, history, backup fields and cloud merge logic preserved.
- All generation prompts and selected review notes are in data/exercise-image-corrections.json.
- The new machine-board prompt is in data/core-machine-image.json. The remaining catalogue content can be expanded gradually under the user-approved scope.

## 2.1.1 — 2026-10-07

- Long exercise instructions and muscle names wrap inside their cards.
- Horizontal page overflow is constrained; vertical scrolling and local filter scrolling remain available.

## 2.1.0 — 2026-10-07

- Goals month calendar with independent day selection and restored daily/weekly layout.
- Compact conditional today button, individual drawing enlargement and drawing-only exercise details.
- Update progress/result feedback and shared visible release/build metadata.

Earlier changes displayed `2.0` without a complete release log. Their actual commits remain the source of history; historical version numbers have not been invented.

Validation: source/diff review and JavaScript syntax checks. No tests or browser interaction/offline checks run.
