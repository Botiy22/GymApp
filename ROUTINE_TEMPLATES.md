## 2.14.0 session expansion and video complexes

Every starter day now has seven distinct library exercises, targeting approximately 60–70 minutes including preparation, transitions and rest. The five-day program uses the original PLAN prescriptions exactly. Other starters use three working sets, compound rests from their original definition and at least 120 seconds between accessory sets. All sessions remain editable; duration is not an enforced timer.

The pure duration estimator assumes 12 minutes preparation, two minutes between movements and 45 seconds per working set; rest is counted only between sets, with zero respected. Actual completion time depends on pace. No automatic changes to calorie estimation.

Legacy template definitions support a conservative, idempotent upgrade of unchanged saved starter copies (generated IDs, exact bilingual names/group, icon and exercise prescriptions). Any customized exercise, label, note, RIR, optional/circuit flag, name or icon prevents upgrading that session. Missing sessions are not recreated; history and active snapshots are not changed. Signed-in data upgrades only after successful sync so a stale local snapshot is not stamped newer before reading remote routines. Offline accounts upgrade on their next successful sync.

clip_centr10 and clip_lat_grips remain stable backing records for storage/backup/history compatibility, but are categorized as Exercise complexes in the exercise library, excluded from Plans, next-workout suggestions and ordinary add-to-routine choices. They start independently so the Centr circuit guide retains round ordering; AMRAP/tempo values are preserved. Their duration is not fabricated from unknown AMRAP values. These video combinations are not expanded to seven movements or an hour.

Run focused checks with `node --test tests/test_routine_templates.js`. Six tests passed for this release, plus local mobile browser checks documented in RELEASES.md.

---

# Editable workout splits

Open **Workout → Plans → Find a workout split**. Preview each session and its exercises, sets, reps and rest before adding. Adding a split appends ordinary editable routines; existing plans, diaries and active workouts are preserved. Added splits appear in collapsible groups above individual sessions. Edit a day to change its name, icon, exercises, order, sets, rep range, RIR and rest; Save copy remains available.

| Split | Sessions | Suggested schedule |
| --- | ---: | --- |
| Full body | 3 | Monday, Wednesday, Friday |
| Upper / Lower | 4 | Monday, Tuesday, Thursday, Friday |
| Upper / Lower + Push / Pull / Legs | 5 | Monday, Tuesday, Thursday, Friday, Saturday |
| Push / Pull / Legs | 6 | Monday–Saturday; Sunday rest |
| Arnold-inspired | 6 | Chest/back, shoulders/arms, legs, repeated; Sunday rest |

These are original starter arrangements based on common split structures, not copies of a named coach's prescribed program. The Arnold-inspired version uses moderate starting volume rather than recreating an extreme historical volume routine. Six-session splits are offered for users who recover well; no template assigns weights or automatically schedules workouts. All 24 sessions reference exercises already in the app library. Sets are working sets; warm-ups remain separate. Repeated B days start with the same movements and can be edited independently.

## Removal and data

The X action in a routine's detail footer or Remove routine in its editor removes that session after confirmation, including built-in routines. Logs and a running workout keep their saved snapshots. Routine deletion uses the existing tombstones and private sync; no database migration is needed. Deleting the last session now retains an empty list on reload instead of reseeding defaults. A missing/non-array routines field still receives the initial defaults. The existing maximum of 100 routines applies to adding a split. Failed saves retain the previous list.

Templates are optional, bundled in js/routine-templates.js, included in the verified offline shell and loaded by cached-shell fallback. They are never seeded into existing accounts. Added days keep existing routine fields; no new program schema is required. Grouping uses the template name in the existing bilingual sub field, with complete routine names preserved in saved data and accessible labels.

## Reference access

On 2026-10-08, attempts to read Muscle & Strength split articles, [the Fitness Wiki strength-routine directory](https://thefitness.wiki/routines/strength-training-muscle-building/) and Wikipedia's weight-training page were blocked by the cloud network proxy (403). Live source verification was unavailable. These starter arrangements use established split structures and should not be presented as externally verified coaching prescriptions. Useful references for later manual review include the Fitness Wiki directory and [Muscle & Strength's workout directory](https://www.muscleandstrength.com/workouts).

## Appearance and motion

Crimson red and Royal blue use vivid fills with contrasting text; the optional validated settings.accentTone field preserves the previous pastel custom hues by default. Other palettes and the custom hue slider stay supported. Update other devices before editing new appearance choices to prevent old clients from dropping the vivid-tone field.

All routine icons, including lower/pull/legs/full-body and the imported routines, follow the active accent in dark/light themes. Preferences and daily-budget/contact toggles use native checked controls with switch roles; exercise selection and approval checkboxes keep their selection semantics. Main and inner navigation use the existing transition helper. Fast asynchronous redraws preserve a still-running entry animation. Press feedback covers new buttons; reduced motion and the app's calm setting remain respected.

No tests were added or run for this release. Source/syntax/whitespace review and manual local browser screenshots used isolated demo storage, without live account/SQL/deployment verification.
