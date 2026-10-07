# Exercise guide schema v1

All exercise detail views use the same shape, independent of catalogue or own exercise.
Keep stable exercise IDs: saved plans, logs and cloud documents reference these IDs.

- Two static positions: start/setup on the left, main movement/end on the right.
- Three short instructions in Hungarian and English: setup, movement, controlled return/key cue.
- Specific anatomical group names and the existing muscle map, followed by personal results.
- No animated database photos, video player or external demonstration links in the exercise view.

Built-in guide metadata is in `data/exercise-guides.js`. Each entry has `version: 1`,
`steps: {hu: [...], en: [...]}`, and a `board` path. Two equally sized panels share one
landscape board; the UI shows them separately, and each tapped position opens in its own large view. The board keeps its natural aspect ratio; figures are never stretched to fill the card. Exact variation,
hand orientation, bench angle and equipment must match the exercise ID. A board for a different
variation is not an acceptable fallback. Use `data/exercise-guide-overrides.json` for curated
instructions that should survive regeneration.

Images use the accepted detailed shaded human style: natural head and face, charcoal tank top,
grey shorts/shoes, white background, the same person/viewpoint in both positions. No stick figures,
text inside images, logos, invented activation percentages or unverified prescriptions.

Own exercises use `schemaVersion: 1`, `phaseSteps` (three cues), `img` (start), `endImg` (finish).
New own exercises require both positions and all three cues. Original `steps`, single images and
video URL fields of legacy records are preserved in storage/backup/sync. Video URLs are not
shown or accepted by the new form. The application cannot generate a picture on its own;
image generation is a development/content-authoring operation, not a hidden runtime API call.

Run `python scripts/build-exercise-guides.py` to rebuild metadata after adding content. This is a
content build, not a test runner. Source-extracted short descriptions remain marked unreviewed;
that flag must not be flipped just because a file or image exists. Check complex movements against
the source variation. Source images remain in the repository during migration; they are not used
as an animated fallback in the new UI.

Source: repository's free-exercise-db data and Hungarian translations. Five original entries had
no written instructions; their variations were inspected in the repository images. Curated lunge
wording was cross-checked with ACE's Forward Lunge page:
https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/
The source-extraction process is not an independent scientific validation of the full catalogue.

## Current content state

Read `data/exercise-guide-status.json` for exact generated/pending counts. This branch is unfinished
until all 877 exercise boards and the remaining source summaries have been reviewed. Do not merge
this incomplete migration to main. No tests added or run without an explicit user request.

