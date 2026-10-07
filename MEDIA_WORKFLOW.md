# Exercise image production

The app has 877 exercises: 188 have a local illustration/board, 873 have a complete local photo pair, and 3 have neither. Drawings stay first; exact exercise photos fill missing or broken drawings. Twelve exercises used by built-in routines still need illustrations. The three entries with no image pair are Kettlebell Halo, Kettlebell Halo With Overhead Extension and Kettlebell Overhead Triceps Extension.

Generate a repeatable queue from the repository:

```sh
python3 tools/audit_media.py --output /tmp/gymapp-illustration-queue.json
```

The queue prioritizes built-in routines, then exercises with no references, then equipment and exercise ID. Each entry includes exact start/end photo paths, muscles, equipment and instructions. Generated queues belong outside the checkout; no image-generation dependencies are required to audit coverage.

Produce illustrations in small batches of four exercises, with one board per exercise. Load each exact photo pair as references, preserve equipment and grip, and use the established shaded style with normal faces. Each board contains two clearly separated start/end positions. Do not substitute a related exercise, invent a missing reference pose, or claim that an unreviewed image is finished. For the three exercises without photos, obtain suitable reference material before production.

Review each board against both reference photos and the exercise instructions: grip and stance, equipment, joint positions, range of motion, handedness and start/end order. Export compact WebP assets, map each reviewed asset to its exact exercise ID in EX_ART, and retain source/licence attribution. Use a new filename for replacements, since image caches retain existing URLs. Add files needed offline to the service worker's CORE list, regenerate the release manifest, and run the browser checks. Test a detail view and its enlarged start/end views before publication.

The first twelve boards are Barbell Hip Thrust, Romanian Deadlift, Cable Crunch, Cable Rear Delt Fly, Cable Rope Overhead Triceps Extension, Single-Arm Cable Crossover, Incline Dumbbell Curl, Seated Dumbbell Palms-Up Wrist Curl, Seated Side Lateral Raise, Split Squat with Dumbbells, Ab Crunch Machine and Leverage Iso Row. Completing these first covers the built-in workouts without waiting for hundreds of library illustrations.
