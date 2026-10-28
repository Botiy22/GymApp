# Recipe goals and nutrition — 2.37.0

## Evidence and limits

These are original recipes, not dishes proven in a clinical trial. Weight loss requires a sustained energy deficit; maintenance requires approximate energy balance. Bulking commonly uses a modest surplus alongside resistance training. More calories do not guarantee more muscle: the optimal surplus is uncertain. Muscle growth also requires progressive training, adequate daily protein and recovery. No recipe can promise “maximum muscle growth”, so the filter is named **Muscle growth**.

The ISSN protein position stand describes roughly 1.4–2.0 g/kg/day for most exercising adults and typical 20–40 g protein doses. Morton et al.'s resistance-training meta-analysis supports adequate total protein, not unlimited benefit from larger doses. These population-level findings do not determine an individual's meal size.

References (also linked from the app):

- Jäger et al. (2017), ISSN protein and exercise: https://doi.org/10.1186/s12970-017-0177-8
- Aragon et al. (2017), ISSN diets and body composition: https://doi.org/10.1186/s12970-017-0174-y
- Morton et al. (2018), systematic review/meta-analysis: https://doi.org/10.1136/bjsports-2017-097608
- Slater et al. (2019), energy surplus and hypertrophy review: https://doi.org/10.3389/fnut.2019.00131
- EU Regulation 1924/2006, Annex: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006R1924
- USDA FoodData Central: https://fdc.nal.usda.gov/
- Safe chicken temperature, 74 °C: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures

**Retrieval limitation, 2026-10-28:** this environment returned proxy HTTP 403 for publisher, PMC, PubMed, Europe PMC, Crossref, NIH, EU and food-safety requests. No new full-text review was completed. The above established references and guidance are used from existing knowledge; they were not independently re-read online this session. Ingredient data was directly inspected and calculated from the repository's USDA SR28 (2015) table. This is not a current systematic literature review.

## Transparent browsing rules

`js/recipe-goals.js` applies the following **product heuristics**, not research-validated clinical boundaries, to one displayed portion. These intentionally overlap. The explanation in the app distinguishes this from scientific principles. Any food can fit multiple goals at appropriate portions within a suitable overall diet.

| Filter | Breakfast/main portion | Snack/drink portion |
|---|---|---|
| Weight loss | 250–500 kcal, ≥25 g protein | 80–250 kcal, ≥15 g protein |
| Maintenance | 300–650 kcal, ≥20 g protein | 100–300 kcal, ≥10 g protein |
| Bulking | ≥550 kcal, ≥25 g protein | ≥300 kcal, ≥15 g protein |
| Muscle growth | ≥25 g protein and ≥20% energy from protein | Same |

Unknown nutrition is excluded from goal matches, but stays in All. Filters are not personalized calorie prescriptions. Changing portions changes suitability; the list classifies the original portion. Fat is not inherently incompatible with weight loss or muscle gain. The user requested lower-fat additions, not a universal low-fat diet.

## Ten new recipes

Five overnight oats: blueberry; raspberry/cocoa; chocolate/cherry; mango/yogurt; apple/cinnamon. All use rolled oats, skim milk, 0% Greek yogurt and whey. Five grilled skinless chicken breasts with bulgur salad, potato/green beans, brown rice/broccoli, couscous/zucchini, or sweet potato/yogurt slaw.

Each new recipe is one portion. Energy and macros are ingredient-row values multiplied by weighed amounts, summed before rounding. Oats share the builder's calculation and liquid density (milk 1.03 g/ml); recipe milk is shown in dl. Chicken meals use 150 g cooked chicken, explicit cooked grain/potato/vegetable weights and 2 g oil for the entire meal. Raw produce weights are labelled as appropriate. About 200 g raw chicken is only a preparation starting point: the user weighs 150 g after cooking.

The USDA cooked roasted breast row is a declared proxy for grilled breast; actual brands, water loss, trimming and retained oil vary. Photos illustrate the dish, not calibrated portion sizes. Generic whey/0% yogurt estimates must not override a user's actual package label. Energy is the source table energy, not recomputed from rounded macros. Chicken recipes retain each resolved source row and unrounded nutrition in `nutritionParts` for audit.

All ten estimates exceed 20% energy from protein and are below 3 g fat/100 g prepared food, the EU Annex composition criteria for “high protein” and “low fat” solid foods respectively. This calculation is not laboratory or legal certification. They also contain less than 10 g fat per listed portion. Rounded serving estimates: oats 381–394 kcal, 36.4–37.7 g protein, 3.9–4.8 g fat; chicken meals 424–484 kcal, 52.9–57.5 g protein, 8.1–9.4 g fat.

All ten photos were generated separately and reviewed. No sheet was sliced into food photos. Export keeps each whole frame; a maximum two-pixel generation-size discrepancy is normalized to 1448×1086, with a 384×288 thumbnail. Provenance: `img/recipes/generated-20261028.json`.
