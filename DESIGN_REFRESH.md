# Otisport 2.7 design refresh

Release: 2.7.0 / build 20261008.4. Starting main: `fd69d37e867dc5406c7bd02209a668ab6aba2aa0` (2.6.1).
The continuation decisions were read from `codex/otisport-design-handoff:CODEX_DESIGN_HANDOFF.md` before changing the app.

## Shared appearance

`css/otisport-theme.css` loads last and supplies the common appearance of Workout, routines, exercise details, active sessions, history, ranks, Food, weekly meal plans, Goals, Profile, Settings, account screens and document uploads.

| Role | Dark | Light |
| --- | --- | --- |
| Background | Graphite `#14151b` | Warm white `#f8f5f0` |
| Card | `#1e2028` | `#ffffff` |
| Primary action | Apricot `#efad82` | Apricot `#edaf89` |
| Primary action text | `#281a12` | `#352318` |
| Secondary accent | Lavender `#bcb1e4` | Lavender `#74668e` |
| Main text | `#f6f3ef` | `#292833` |

A smaller Otisport wordmark anchors each main header. Cards, form fields, segments and buttons share spacing and corner radii; the five navigation destinations remain reachable in a quieter floating bar. The workout focus panel emphasizes starting/resuming. Meal days retain collapsible summaries. Profile retains personal cover colors and its calorie clock. The new theme is precached and included in the release hash manifest; cached older HTML can also load it through the existing app bootstrap.

No data migration: exercise IDs, seeded routines, diaries, storage keys, backup format, account configuration, importer calculations and sync logic are unchanged. Explicitly saved hue values still take precedence. Light, deep/plain backgrounds, reduced motion and opaque-surface preferences remain supported. Native iOS uses the existing dark safe-area strip for its white status icons. The recent mint O app icon remains the brand asset.

## Review performed

No tests were added or run, following the user's explicit instruction. JavaScript syntax and whitespace checks were performed separately from browser layout inspection.

Manual screenshot/layout review used isolated Chromium contexts, with account configuration disabled only in the temporary browser session. Reviewed the main pages, exercise library, routines, Goals/progress, Profile, Settings and upload dialog at 320/390 px, plus dark/light and a saved custom hue with opaque surfaces and reduced motion. No horizontal page overflow or page JavaScript errors appeared in those captured main views. Active workout and exercise detail screenshots were inspected at 320/390/1100 px.

The attached `Etrend2026_heti_beosztas.pdf` was opened through the actual file picker in a temporary local app session. Its 28-meal preview and collapsible saved weekly plan were inspected at 320/390/1100 px. The preview content had its own scroll region, including the 320×568 viewport. These observations are layout review, not regression or nutrition-accuracy certification. The PDF and screenshots are not committed. Physical iPhone/Safari and live deployment were not verified in this environment.

Existing historical release/update checks still name release 2.6.1. They were deliberately not changed or executed in this no-tests design continuation; update their expected release when test work is separately authorized. The unfinished broader exercise-media migration is not included.

## Backup and restoration

Before implementation, actual remote main was backed up and verified:

- Remote branch: `backup/main-20261008-112335-before-design`.
- Preserved SHA: `fd69d37e867dc5406c7bd02209a668ab6aba2aa0`.
- Verified local history bundle: `/workspace/GymApp-backups/GymApp-before-full-design-20261008-112335.bundle`.

These are code backups; they do not export private account or diary data. All earlier backups are retained.

To restore, first fetch current main and review any later changes. Create a restoration branch from current main and restore the design changes from the backup as a normal commit/PR. A focused revert of the design release commit is another option after reviewing intervening changes. Restore the matching release metadata/manifest together, give the restoration a new version/build so installed apps can upgrade, and regenerate `release-manifest.json` with `python3 tools/build_release.py`. Never reset or force-push main.
