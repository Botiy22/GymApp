# Optional food estimates

The text-analysis result offers **Use estimates instead** when recognised food
classes have a consumed amount but no exact saved label. This is scoped to the
current analysis and resets with **Again**. It is not an automatic brand lookup.

`js/food-estimates.js` uses the existing local tables:

| Description | Substitute |
| --- | --- |
| Muesli / granola, including choco-oat | USDA homemade granola; chocolate proportion unknown |
| High-protein low-fat yogurt | USDA plain nonfat Greek yogurt; flavouring unknown |
| 1.5% dairy milk | Existing 1.5% milk entry, interpolated from USDA 1% and 2% milk |
| Alnatura crunchy peanut butter | USDA unsalted chunky peanut butter |

These are approximate substitutes, not verified nutrition for the named brands.
The review displays the basis and an estimate marker; the diary retains
`estimated: true` and displays ≈ after reload. They are never saved as product
labels or promoted to exact database matches. No network/API key is needed.

Consumed grams/ml are preserved. For milk in ml, the database gram amount supplies
the density factor; per-100-ml nutrition is converted consistently and grams stay
zero in the volume-based log. A user-stated macro amount replaces that macro for
the consumed portion. Estimated energy is adjusted by 4 kcal/g for the changed
protein/carbohydrate or 9 kcal/g for fat; this applies only to these generic
substitutes, never to an exact label or the erythritol entry.

Saved labels take precedence. Conflicting saved labels, missing amounts,
implausible macro substitutions, unfamiliar food classes, plant milk and mixed
descriptions with additional measured ingredients are not guessed. Frozen fruit,
canned-fruit form and cinnamon quantity still use the existing clarification
choices. Applying estimates again does not duplicate items; re-analysis uses the
newly entered quantities and any newly saved exact labels.
