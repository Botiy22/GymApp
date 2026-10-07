# Exercise content sources

Decision, 2026-10-06: keep GymApp's stable exercise IDs and curate its own guide layer.
New descriptions use three brief Hungarian/English cues; demonstrations use two generated
static positions in the accepted style. Generated images require visual review.

| Source | Role | Relevant constraints |
| --- | --- | --- |
| Repository free-exercise-db data | Preserve IDs and original records; review each variation | Original names, instructions and images can disagree. |
| wger | Candidate supplementary structured source | Community exercise wiki and REST API; exercise data has entry-specific Creative Commons licensing. No independent validation of the whole catalogue was established. |
| ACE Exercise Library | Reference for checking movement descriptions | Detailed descriptions/photos; the site does not grant general permission to copy its content into an app. Use original wording and original images for GymApp. |
| ExerciseDB free V1 | Alternative considered | Provider documents non-commercial use, attribution and 180p GIF media. A larger catalogue does not supply GymApp's chosen visual style. |

References consulted:
- https://github.com/wger-project/wger/blob/master/README.md
- https://wger.readthedocs.io/en/latest/
- https://www.acefitness.org/resources/everyone/exercise-library/
- https://www.acefitness.org/legal/terms-of-use/
- https://oss.exercisedb.dev/docs

Concrete source correction: `Band_Hip_Adductions` is named hip adduction, has adductors
as its primary group, and both repository photographs show the near-post leg moving inward.
Its original text instead describes a far-side leg moving outward. The curated guide follows
the named variation and photographs, while preserving the original record and stable ID.

`reviewed: true` records a content review of the short guide, not clinical certification,
measured activation, a browser test or proof that every generated image is correct.
Keep image review and text review separate. Do not import a replacement database wholesale
or infer exercise equivalence from the name alone.
