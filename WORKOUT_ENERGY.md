# Workout and cardio calories — 2.10.0

Log cardio from Workout → Train → Log cardio, from the active workout, or from a saved workout's summary. Walking, incline walking, running, stairs, cycling and elliptical are available. Duration and body weight are required; walking/running also use speed and incline. Standalone cardio appears in workout history. Cardio entries can be removed; removing the only entry of a cardio-only session removes that session. Cardio does not earn lifting ranks or working-set badges/competition points.

Finishing lifting asks you to confirm lifting minutes, body weight and Moderate/Vigorous intensity. Timer duration minus attached cardio is suggested; check it and exclude long breaks. Normal rests between sets stay included. You can finish without an estimate. Existing logs have no invented calorie value; open their summary → Calculate lifting calories to enter the missing details. Editing an estimate stores its inputs with the session, so later body-weight changes do not change historical calories.

Food and Profile show the base target, separate estimated lifting and cardio calories, and a budget switch. Workout estimates are excluded by default. If enabled:

**Remaining = base target + estimated active workout calories − food eaten.**

For example, 2,410 kcal base + 350 kcal active exercise − 2,034 kcal eaten = 726 kcal remaining. The base target and macro targets are retained. If the target's activity multiplier already accounts for this exercise, leave inclusion off. An entered daily activity total, when its existing inclusion option is enabled, replaces workout estimates in the budget; both sources are never added together. Enter the full daily active total, including workouts, rather than a second copy of one session. Steps alone do not become workout calories.

## Model and limits

These are estimates, not measured energy expenditure. Set counts, repetitions and lifted kilograms verify/log lifting work and continue to drive volume/ranks; they do not provide a reliable conversion into calories per exercise. There is no fabricated per-exercise precision. Lifting requires actual logged sets and the user's confirmed session duration/intensity.

The model uses net active energy above resting expenditure:

`active kcal = max(MET − 1, 0) × 3.5 × body weight in kg / 200 × minutes`

- Resistance training uses 3.5 MET for Moderate, 6 MET for Vigorous, including normal rests. Supported duration: 1–360 minutes.
- Walking/running use the standard steady-state oxygen-cost equations: `VO2 = 3.5 + a × speed + b × speed × grade`, where speed is m/min and grade is a fraction. Walking: a=0.1, b=1.8; running: a=0.2, b=0.9. MET=VO2/3.5. Walking speeds 3–6 km/h and running 8.1–20 km/h are supported; incline 0–15%. These do not model downhill travel, holding handrails or interval sprints.
- Other activities use typical Moderate/Vigorous MET assumptions: stairs 6.8/9.3, cycling 6.8/8, elliptical 5/9. These are broad effort categories, not individual machine calibration.
- Cardio duration: 1–480 minutes. Body weight: 30–300 kg. Values are rounded to whole kcal per activity; raw nutrition data is unchanged.

MET assumptions follow conventional activity-compendium categories; walking/running follow the ACSM steady-state equations. Fitness, movement technique, rest patterns and devices introduce uncertainty. The app clearly labels estimates and excludes resting calories to reduce overlap with a base energy target; this does not eliminate overlap with activity already included in the target.

## Data and compatibility

New `workouts[].energy` and `workouts[].cardio` inputs are sanitized by Store, exported with the existing JSON backup and synced through the existing private userdata row. Active-workout cardio follows the active local draft. Independent `energyAt` and `cardioAt` timestamps retain newer field edits when merging saved sessions; each field uses the last edit, so concurrent edits to the same cardio list should be avoided. Workouts' existing entries, identifiers, deletion markers, warm-up and cooldown merge rules remain. Update all signed-in devices before editing new fields; older app releases do not understand these additions. No new Supabase migration or third-party API is needed for this feature.

No tests were added or run. Source/syntax/whitespace and manual Chromium screenshot reviews used disposable local meal/session data at 320/390px in EN/HU, including Food/Profile breakdowns, workout summary and lifting/incline/stairs forms. Live account sync, physical Safari, real measured energy expenditure and deployed serving remain unverified.
