# Starter-routine line illustrations

The five built-in starter splits contain 24 sessions using 22 distinct exercises. `data/routine-art.js` maps every exercise to an exact start/finish pair and a matching thumbnail. Eleven reuse the unchanged Everkinetic SVGs credited in `data/figures.js` and the main README (CC BY-SA 4.0); eleven use new generated boards in the same faceless anatomical contour style.

The built-in imagegen tool generated the new boards from each exercise's exact `img/ex/<id>/0.jpg` and `1.jpg` photographs, with the existing hammer-curl drawing as the style reference. The photo dataset's provenance and limitations are recorded in the main README. No ownership or exclusive-rights claim is made for reused source drawings. Existing attribution stays.

Prompt specification: two equal side-by-side white panels; black anatomical contour drawings; faceless adult, simple shorts; preserve the exercise-specific equipment, grip and stance; no text, UI, muscle highlights or extra exercises. Refinements ensure front-chest wide-grip pulldowns, low-pulley overhead rope extensions and a nearly straight-arm pulldown. Incline curls depict the simultaneous movement in the existing written instructions. The detailed anatomical muscle map remains separate and uses existing app data.

Visual review checked the selected boards against their source poses and rejected photographic/collage variants. This is not independent trainer certification of technique. Generated boards and master paths are recorded in `generation.json`; selected masters are copied into `source/`. `tools/export_routine_art.cjs` crops the two panels and exports 640px WebP detail images and 240px thumbnails without stretching. Deployment files are included in the verified offline shell; masters are not preloaded.

Instructions retain existing HU/EN exercise text, displayed as numbered cards before personal statistics. User-supplied thumbnails take priority. Missing illustrations fall back to the same exercise's existing photos.
