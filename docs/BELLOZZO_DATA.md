# Bellozzo nutrition snapshot

Source URL shown by the chain / supplied in the preceding handoff:
https://www.bellozzo.hu/files/images/allergens/tapertek_allergentablazat.jpg

The owner attached a screenshot of this table on 2026-10-30. The screenshot was read at enlarged scale to distinguish the small digits; the live file could not be retrieved because of the cloud network allowlist. No publication date is visible. This is a transcription of that supplied snapshot, not a claim that every menu item is currently sold. No private screenshot/chat UI is shipped in the app. Source attachment SHA-256: `0f28659a6af2badb3c030c8bc0a54549af99921c930eee7904610a0659fdd9ac`.

`data/bellozzo-foods.js` retains the printed column order in its raw tuples: **kcal, fat, carbohydrate, protein**, per serving. Runtime records use named macro fields. The source's “Tésztaszószok feltéttel” and “Tészta alapok” are separate. A complete pasta portion adds sauce-with-toppings and the corresponding Classico/Grande base. Example: Primavera Grande + Fusilloni Grande = 770 + 597 = 1367 kcal; protein 37 + 24 = 61 g, carbohydrate 6 + 119 = 125 g, fat 66 + 2 = 68 g.

Coverage: 12 sauces × 2 sizes × 5 bases = 120 complete pasta combinations; 11 pizzas × 2 diameters = 22 pizzas; 5 salads, 6 desserts, 23 extras. Total 176 complete serving records in 57 searchable groups. The original base/sauce tuples remain separate for audit. Extras can be logged separately by their printed serving name, such as `bellozzo extra csirke`.

## Limits

- There are no gram weights. Never encode one portion as a fictional 100 g. These records use `basisUnit: portion`; a zero internal gram field means unknown, and is not shown as a measured quantity. Diary serving multipliers are persisted separately, including quarter portions.
- Sizes and pasta bases are not interchangeable. Missing choices require selection. Pizza diameters are 24 / 32 cm; a bare restaurant pizza name asks which size. Everyday generic dishes do not automatically become Bellozzo items.
- The table lists allergen codes, not complete ingredients or recipe quantities. The importer does not infer a recipe or allergy suitability from those codes. Displayed pasta components are the named sauce and base only.
- Drinks provide calories but not complete P/C/F, so no drink entries are fabricated. Unlisted customizations, removed ingredients, unsupported sizes and gram quantities require clarification. Extras are entered on separate lines; they are not silently ignored.
- Carbonara's printed energy is inconsistent with its printed macro totals (Classico: 597 kcal, 38 g fat, 2 g carbs, 21 g protein; Grande: 925 / 58 / 2 / 33). These source values are kept with an explicit warning rather than deriving a replacement. Other small energy differences can reflect rounding/fibre.
- Nutrition changes with recipes and preparation. This snapshot has no visible publication date; a clearer/newer official table can replace it later.

The existing Burger King Hungary data in `data/restaurant-foods.js` is unchanged. No account schema migration or new external API is needed. Restaurant lookup and size/base selection work without a model key.
