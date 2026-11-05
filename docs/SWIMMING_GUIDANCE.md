# Swimming guidance and evidence boundaries

Added 2026-11-05. These are original recreational training examples, not a
coach assessment, clinical programme or a claim that a particular set is
scientifically optimal. They assume an adult who can already swim a full pool
length comfortably. For a non-swimmer or someone returning after illness/injury,
start with an instructor or appropriate professional guidance.

## Principles and references

- **Swim England, Learn to Swim / stroke technique guidance**:
  https://www.swimming.org/learntoswim/
  Front crawl: shoulder-line entry, bent-elbow catch, backward pressure,
  coordinated body roll and side breathing; narrow hip-driven flutter kick.
  Breaststroke: pull/breathe/kick/glide, controlled knee width and turned-out
  feet; backstroke: shoulder-line little-finger entry, bent underwater elbow,
  continuous breathing and hip-driven flutter kick.
- **CDC, Measuring physical activity intensity**:
  https://www.cdc.gov/physical-activity-basics/adding-adults/what-counts.html
  Relative intensity depends on the individual. Effort ratings here are
  approximate cues on a 0–10 scale, not a measured physiological zone. Talk-test
  concepts are not instructions to speak while swimming.
- **American Red Cross, water safety resources**:
  https://www.redcross.org/take-a-class/resources/articles
  Hyperventilation and extended underwater breath-holding can cause hypoxic
  blackout. Lifeguard presence is a baseline precaution, not permission for
  breath-hold challenges. No breath-hold times, underwater distance targets or
  progressive breath restriction are generated.
- **US Masters Swimming, Fitness and Training**:
  https://www.usms.org/fitness-and-training
  Technique-focused practice, aerobic repeat sets, recovery and progressive
  training are established coaching practices. The specific repeats, rests and
  weekly example in this app are our design, not quoted research protocols.
- Existing calorie calculations use the **2024 Adult Compendium of Physical
  Activities, Water Activities**: https://pacompendium.com/water-activities/
  See `js/workout-energy.js`. This update does not change MET values. Session
  plans prefill active swim time only; users review actual minutes and lengths.

**Access limitation:** attempts to retrieve Swim England, CDC, USMS, Red Cross,
Royal Life Saving and Europe PMC on 2026-11-05 were blocked by the environment's
network proxy (403). Links identify authoritative reference organisations; no
fresh literature search, current-page verification or direct quotation is
claimed. No hypoxia performance benefit is asserted. Have a qualified swimming
coach review the animations before describing them as precise individual form
instruction.

## Timing and distance model

`js/swim-training.js` is deterministic and works offline:

1. Input pool length 10–100 m (0.1 m resolution), available time 20–59 min,
   comfortable active pace 60–600 seconds / 100 m, stroke and session focus.
2. Warm-up target 100 m, two technique repeats of one length, main repeat
   targets 50 or 100 m, cool-down target 50 m. Distances are rounded to at least
   one **whole length**. One length is end-to-end; an out-and-back is two.
3. Predicted swim time = metres / 100 × input pace × block factor. Easy/
   breathing 1.15, foundation 1, brisk intervals 0.9; warm/cool 1.2, drills 1.25.
   These factors are modelling assumptions, not evidence-based guarantees.
4. Add rest after each repetition (including a transition rest after the last
   repeat of a block); no rest after cool-down. Reserve five minutes for
   transitions or slower-than-expected swimming.
5. Choose the integer main-repeat count that fits the remaining budget, capped
   at 40 repeats. Never silently shorten the specified pool or omit warm-up/
   cool-down to meet the budget. Show an infeasible-session message when even
   one main repeat will not fit. Extra rest or a slower real pace can exceed the
   estimate: skip repeats and finish easily at the time limit.
6. Routines, pool, pace and stroke preferences use normal per-account settings
   backup/sync. Constructing a plan never records exercise or calories. Review
   & log opens the existing editable form; only Save records the actual swim.

## Animations

Three original articulated SVG studies: freestyle and backstroke from the side,
breaststroke from above. Four interpolated phases each; play/pause, half speed,
scrubbing and phase-by-phase cues. Freestyle also has an overhead shoulder-line
entry diagram. No photographic video, biomechanics measurement, exact hand-force
vector or individual technique assessment is implied. The diagrams simplify
body roll, depth and continuous motion; accompanying cues supply those details.
