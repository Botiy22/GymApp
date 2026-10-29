# Food analysis and retailer labels — 2.39.0

## What changed

The reported eight-line oats meal previously split `20g protein` into a second ingredient, dropped the milk's fat qualifier, failed on cinnamon powder and guessed at colloquial fruit wording. `FoodProducts.read` protects nutrient claims and fat percentages, and the normal parser retains an original ingredient line for correction. Decimal commas stay intact when separating ingredient lists. Inputs over 4000 characters/30 lines are not silently truncated.

Explicit user portion labels and confirmed My foods values take priority. Brand/flavour mismatches or conflicting new protein claims need review; generic milk/yogurt must not overwrite a Pilos label. A saved 100 ml label scales from consumed ml without inventing a density. For gram-based data, existing documented liquid-density conversion remains available. Unknown mass is 0 in the storage field only when a known `vml` volume carries the quantity; nutrition scales from that volume, never from 0 g.

Generic cinnamon now has Hungarian aliases and a USDA ground-cinnamon row. Frozen-fruit informal aliases are supported. `fagyi gyumi` explicitly asks whether it means frozen mixed berries or ice cream. Missing cinnamon quantity is not guessed. Pure erythritol is 0 kcal, with 100 g carbohydrate/100 g as polyol under EU label conventions, not 100 g sugar; no automatic 4 kcal/g calculation. Label data for a sweetener blend must take priority over generic pure erythritol.

## Retailer products

`js/food-products.js` supports opt-in name/barcode queries to Open Food Facts, with Lidl/Tesco/SPAR search options and recognition of common store brands. The user reviews the exact variant, all four nutrients, and per-100-g/ml basis before saving. Only complete, bounded numeric entries with a valid barcode and explicit 100 g/100 ml basis are offered. kcal may be converted from kJ using 4.184. Nutrients per serving are not silently interpreted as per 100 g.

Open Food Facts is community-maintained, not an official retailer feed or independently verified label. Product/source links are retained in My foods; its database is licensed under ODbL (https://world.openfoodfacts.org/terms-of-use). The request sends the searched product/barcode, not an account, diary or AI key. No automatic lookup occurs for every ingredient. Confirmed values and aliases are account-owned My foods records and are available offline; the catalogue search requires internet. CSP permits only the specific OFF host for this feature.

**Retrieval limitation:** on 2026-10-29 the cloud proxy returned HTTP 403 for Lidl Hungary, Tesco Hungary and Open Food Facts. No current retailer nutrition was retrieved or preloaded. No guessed Pilos/Crownfield/Tesco/SPAR macros are packaged with the app. Search/import behavior is tested with clearly synthetic fixtures, not represented as real product values. Live OFF reachability, CORS and product coverage on the user's connection still need real-world verification. Manual label entry remains available if the service fails.

For the supplied meal, the yogurt's stated 20 g protein is retained, but kcal/carbohydrate/fat still require the actual variant's label. The muesli and branded lactose-free milk also require labels. The fruit meaning and cinnamon amount need clarification. The app cannot honestly make every macro certain from that text alone. Label rounding and natural food variation also remain.

## Local/AI routing and photos

Complete local matches avoid paid requests. In a partial text meal, only unresolved ordinary-food lines go to the model with source indices. Known database quantities/macros and missing brand labels stay local. Missing model source indices remain unresolved; API failure cannot silently remove understood items. A partial meal cannot be logged through the main analysis action until missing items are completed or explicitly removed.

Photo prompts distinguish a label photo from another portion, discourage duplicate whole-dish/ingredient counting, mark plate size/oil/portion as assumptions, keep explicit quantities above visual guesses, separate per-serving and per-100 units, and ask for missing brand/label/quantity facts. Responses can return unresolved items with known protein/amounts. Numeric validation rejects missing, negative, nonfinite and impossible compositions; ml labels retain native volume. Visual estimates cannot claim the highest confidence. These are prompt/schema/validation improvements, not a measured accuracy benchmark: no real meal-photo/model evaluation was possible without supplied photos and an API key. Model mistakes remain possible and the user reviews results.

## Storage

The bundled USDA table and lexicon together occupy about 0.8 MB. No repository capacity problem was found. Retailer labels are loaded on demand, not as an enormous offline dump. My foods has an existing 500-record application limit; adding another now gives a visible message instead of losing the new item during cleaning. Saves use the transactional Store path and show failures. Actual browser quota and live Supabase project usage were not measured or changed. Aliases are limited to four strings of 160 characters per item and source URLs to OFF product URLs.
