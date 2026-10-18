# Prompt library — planning and generating UI tests

For the guided, step-by-step version, see [labs/lab-02-plan-and-generate.md](../labs/lab-02-plan-and-generate.md).

## One-time setup (skip if you did it before the workshop)

```bash
npx playwright init-agents --loop=claude    # or: vscode | codex | opencode
```

This creates the **planner**, **generator** and **healer** agent definitions for your tool. The seed test the agents start from is `tests/ui/seed.spec.ts`.

> The agent definitions change with each Playwright release. Re-run `init-agents` after upgrading Playwright.

## 1. Plan

Start the app in a second terminal with `npm start`, then:

```
Use the playwright-test-planner agent. Explore the Flora Mini app starting from
the seed test tests/ui/seed.spec.ts. Plan tests for: browsing and filtering the
shop, adding to the cart from the product page, removing items, and checkout
including validation errors. Keep it to the 10 most important scenarios, with
one test file per section. Save the plan as specs/shop-plan.md.
```

Review `specs/shop-plan.md` before generating:
- Does each scenario say what's being checked, not just which clicks to make?
- Is the $75 free-shipping rule in there?
- Strike anything vague.

## 2. Generate

```
Use the playwright-test-generator agent to turn specs/shop-plan.md into tests
in tests/ui/. Prefer getByRole and getByLabel locators. Keep one scenario per
test. When you're done, close the browser.
```

## 3. Review the locator strategy

```bash
npm run test:ui
```

- Any CSS or XPath selectors? Ask why, and ask for a role-based locator instead.
- Any `waitForTimeout`? Replace it with a web-first assertion.
- Compare your output with `reference/ui/shop.spec.ts`.
