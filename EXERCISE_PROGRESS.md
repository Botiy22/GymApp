# Exercise migration checkpoint — 2026-10-07

UNFINISHED: do not merge to main. Scope remains all 877 exercises.

Current content files: 48 two-position boards (including the four previously accepted boards), 197 curated HU/EN descriptions. The generated board count is not a count of accepted or fully reviewed images. Read data/exercise-guide-status.json for pending IDs. Original IDs, plans and data remain unchanged.

The previous long image pipeline no longer exists after the tool session restarted. Do not promise unattended work continues after the session ends. Persist each small content batch to GitHub. The latest uncommitted work was recovered from the cloud filesystem and consolidated here; this is independent of the user's laptop.

Next:
- Finish all remaining descriptions and images; review variation, grip, equipment, connected cables, full framing and setup/movement order.
- Band_Good_Morning_Pull_Through: the description is corrected to the anchored band around the upper shoulders, not a between-the-legs pull-through. Use the corrected guide in new image prompts.
- Browser/layout/offline/account-sync checks remain unperformed. Main must stay unchanged until completion.

Changes: uniform two-position exercise UI, three-cue HU/EN guide layer, named-muscle chip wrapping, own-exercise schema preserving legacy storage fields, dependency loading for an older cached HTML shell, service-worker core refresh and generated-board prefetch for the 39 plan/routine exercises. Original stock photos and video values remain stored but are not shown as demonstrations.

Verification: content build and JavaScript syntax checks only; selected images visually inspected. No tests added or run. No claim of clinical validation or measured activation.


Completed image corrections, 2026-10-07: reverse-grip single-arm triceps handle and continuous foreground cable; overhead rope full framing; upright 3/4 sit-up with secured feet; cross-arm front-squat grip. Prompts and review notes are in data/exercise-image-corrections.json. Generated board count is now 48.

Added the overhead barbell triceps extension and underhand cable pulldown boards for the two supplied routines. The anchored-band good morning board now faces its front anchor in both panels. Full catalogue remains incomplete.
