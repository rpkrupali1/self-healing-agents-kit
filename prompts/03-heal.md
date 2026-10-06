# Exercise 3 — Self-healing

## 1. Ship the "refactor"

```bash
npm run break        # switches the app to v2
npm run test:ui      # watch the suite go red
```

## 2. Heal, but triage first

```
Use the playwright-test-healer agent on the failing tests in tests/ui/.
Before you change anything, classify every failure as one of:
  STALE TEST: the app changed on purpose (copy, structure, locators)
  REGRESSION: the app now behaves wrongly
  UNSURE
For each one, give your evidence and a confidence from 0 to 100%.
Only heal STALE TEST failures with confidence of 80% or more.
Never change an expected value in an assertion about money, totals or
business rules. Mark those as REGRESSION and leave the test failing.
```

## 3. Decide: would YOU merge it?

```bash
git diff tests/ui
```

For each healed change, ask:
- Did it change a **locator** (fine) or an **assertion** (suspicious)?
- Did it get looser? For example, `toHaveText` turned into `toBeVisible`, or an exact string turned into a regex.
- Is there still a red test? Should there be?

Compare with `reference/healed/shop.spec.ts` (`npm run test:healed`).

## 4. Put it back

```bash
npm run restore      # back to v1
```
