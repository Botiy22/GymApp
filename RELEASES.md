# Release versions

`js/release.js` is the single source of the app's public version, build number and derived cache ID. Both the page and service worker load it. The app displays the installed version/build in Settings and in a verified update-success message.

For each published change, increment the public version and choose a new build (`YYYYMMDD.sequence`). Use patch versions for fixes, minor versions for new compatible features, and major versions for breaking changes. Update this log in the same commit. Do not edit app.js/sw.js version constants separately.

An unfinished development branch uses a `-dev` suffix. Before publishing finished work, remove that suffix and select a version newer than main. Never merge the unfinished exercise migration just to update its version.

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

