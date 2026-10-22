Healer: playwright-test-healer · App version: v2 · Policy: heal STALE TEST only at ≥ 80% confidence; never change money, totals or business-rule assertions.

**Result:** 10 failing UI tests → 7 healed (STALE TEST), 3 left red (REGRESSION). No expected values changed. Nothing in `app/` edited.

| Test | Classification | Confidence | Change made |
|---|---|---|---|
| browse: shop lists all 12 products | STALE TEST | 97% | "Add to cart" → "Add to bag"; cart link → "Shopping bag" (🛍 0) |
| browse: filter by category | STALE TEST | 97% | Product heading level 2 → 3 |
| add-to-cart: subtotal just below $75 pays $8 shipping | STALE TEST | 95% | "Add to bag"; cart link "Shopping bag" (🛍 2) |
| add-to-cart: subtotal above $75 ships free | STALE TEST | 95% | "Add to bag"; cart link "Shopping bag" (🛍 2) |
| checkout: successful checkout | STALE TEST | 93% | "Add to bag", "Name on order", "Complete purchase", "Your bag is empty." |
| checkout: validation errors keep user on checkout | STALE TEST | 93% | Same label and link changes |
| remove: removing the only item empties the cart | STALE TEST | 88% | "Add to bag", "Your bag is empty.", "Shopping bag" (🛍 0) |
| add-to-cart: product with quantity 3 | **REGRESSION** | 92% | Locators only. **Still red:** Subtotal expected $132.00, page shows $44.00 |
| add-to-cart: subtotal of exactly $75 ships free | **REGRESSION** | 93% | Locators only. **Still red:** Subtotal expected $75.00, page shows $25.00 |
| remove: removing an item drops subtotal below $75 | **REGRESSION** | 92% | Locators only. **Still red:** Subtotal expected $87.00, page shows $37.00 |

**For the reviewer:** the 3 regressions all have quantity > 1. The cart subtotal appears to ignore quantity. Needs an app fix, not a test change.
