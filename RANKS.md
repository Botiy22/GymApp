# Personal lift ranks

Open **Profile → Your lift ranks** in the top navigation. The rank preview on Workout and the highest-rank card in Overview open that same page.

Ranks are derived from saved workout entries. No rank field is added to account data: existing logs, imports, exports and sync remain the source of truth. Deleting a qualifying workout recalculates its rank from the remaining history.

Three introductory ranks—First lift, Builder and Climber—start at 1 kg. The six retained milestones are Spark, Ember, Steel, Sentinel, Titan and Apex. They are personal app milestones based on the heaviest actual working-set weight, rather than estimated one-rep maximum or population strength standards. The highest earned rank is highlighted on the Workout page, while every lift has its own rank and next target.

| Lift | First lift | Builder | Climber | Spark | Ember | Steel | Sentinel | Titan | Apex |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Flat barbell bench press | 1 kg | 5 kg | 10 kg | 20 kg | 40 kg | 60 kg | 80 kg | 100 kg | 140 kg |
| Barbell back squat | 1 kg | 5 kg | 10 kg | 20 kg | 40 kg | 80 kg | 100 kg | 140 kg | 200 kg |
| Barbell deadlift | 1 kg | 10 kg | 20 kg | 40 kg | 60 kg | 100 kg | 140 kg | 180 kg | 240 kg |
| Standing barbell overhead press | 1 kg | 2.5 kg | 5 kg | 10 kg | 20 kg | 30 kg | 40 kg | 60 kg | 80 kg |

Only the exact exercise IDs listed in `js/strength-ranks.js` qualify. Dumbbells, Smith machines, other variants and custom exercise labels do not substitute for these movements. A saved set must have positive numeric weight and reps; warm-ups, explicitly unfinished sets and tick-only workouts do not count. The recorded barbell weight is treated as the total entered load. Ties use the set with more repetitions for the displayed reference.

Finishing a workout compares its new ranks with the previous history and shows any newly reached tier. The rank screen includes the logged weight/reps, a link to the qualifying workout, all nine thresholds and progress to the next tier. Reaching Apex caps the progress bar without an invented higher target.

Workout volume remains a separate measure: sum of weight × reps for working sets. Its expandable breakdown lists each exercise, the recorded sets and its subtotal; warm-ups remain visible in the workout log but do not inflate the displayed working-set volume.

These are entered total loads, including the bar; lighter training bars qualify. These ranks still track the four exact barbell variants; dumbbell weights are not silently substituted. The Four foundations badge retains its original Spark thresholds. Install `20261010_consistency_covers.sql` so friends see the same expanded lift ranks.
