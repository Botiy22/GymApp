# Release versions

`js/release.js` is the single source of the app's public version, build number and derived cache ID. Both the page and service worker load it. The app displays the installed version/build in Settings and in a verified update-success message.

For each published change, increment the public version and choose a new build (`YYYYMMDD.sequence`). Use patch versions for fixes, minor versions for new compatible features, and major versions for breaking changes. Update this log in the same commit. Do not edit app.js/sw.js version constants separately.

An unfinished development branch uses a `-dev` suffix. Before publishing finished work, remove that suffix and select a version newer than main. Never merge the unfinished exercise migration just to update its version.

## 2.1.1 — 2026-10-07

- Long exercise instructions and muscle names wrap inside their cards.
- Horizontal page overflow is constrained; vertical scrolling and local filter scrolling remain available.

## 2.1.0 — 2026-10-07

- Goals month calendar with independent day selection and restored daily/weekly layout.
- Compact conditional today button, individual drawing enlargement and drawing-only exercise details.
- Update progress/result feedback and shared visible release/build metadata.

Earlier changes displayed `2.0` without a complete release log. Their actual commits remain the source of history; historical version numbers have not been invented.

Validation: source/diff review and JavaScript syntax checks. No tests or browser interaction/offline checks run.
