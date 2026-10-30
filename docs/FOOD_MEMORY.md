# Personal food memory

Photo analysis offers **Remember for next time** in the review screen, enabled by default. Nothing is remembered until the user adds the completed analysis to the diary. The user can correct nutrition, opt out, give one food a short name, or name a multi-ingredient meal. Each food is saved separately; an optional meal name also saves its components together.

Food → **Frequent foods** shows the twelve highest-ranked saved portions. Select a portion, adjust its multiplier and add it again. **All saved foods** provides search, name/alias editing and removal without deleting diary history. Existing personal label products with a default serving also appear. Short names work in Describe and food search, without an AI request; examples: `reggeli shake`, `2 adag reggeli shake`, `fél adag reggeli shake`, `150 ml reggeli shake`. Unknown foods continue through the existing analysis flow.

Only reviewed names, serving amounts and nutrition are retained, not the source photos. Visual estimates stay marked as estimates when reused. Saving is not independent verification of the model's nutrition reading. A conflicting nutrition claim or an ambiguous name requires clarification. Different recipes sharing a name are never silently overwritten. Mass and volume remain separate; a serving with unknown weight can be scaled by servings without inventing grams.

## Ranking

For every saved portion, sum `0.5 ** (ageDays / 30)` over its diary uses in the past 90 days. Recent, repeated uses rise to the top. A multi-component meal counts once per add action; multiple meals on the same day count separately. Future diary entries are excluded. Ties use latest consumption, latest edit, then name. The score is derived from the diary so undo/deletion updates it immediately; there is no drifting counter and no paid model call for ranking.

## Persistence and limits

`foodMemories` is a private array in the existing account JSON, with up to 200 records, 30 components per meal and four aliases per record. Existing `myFoods` products remain in their existing collection. Diary entries keep memory IDs and a batch ID for ranking. Memory plus diary additions are one `Store.apply` transaction; a storage failure retains neither half of the change. Export/import, existing account sync and reset include the collection. No new Supabase SQL migration is required.

Sync merges records by ID and latest update time, respects deletion tombstones and the existing reset epoch, and preserves the collection if an older client omits it. At capacity the meal can still be logged, but the app asks the user to remove an old saved food before remembering new ones. Actual browser/account storage quota remains environment-dependent; no live Supabase capacity measurement is claimed.
