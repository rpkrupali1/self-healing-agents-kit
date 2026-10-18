# Lab 2 — Adopt what exists: Playwright's planner and generator

| | |
|---|---|
| **Time** | 30 minutes |
| **Goal** | Use Playwright's built-in test agents to explore the app, plan UI tests, and generate them, then review the result like an expert |
| **You'll practise** | Directing the planner and generator agents · reviewing a test plan · judging locator quality |
| **You'll produce** | Passing UI tests in `tests/ui/`. **You need these for Lab 3.** |

> **Lab 1 vs Lab 2:** in Lab 1 you *built* an agent, because nothing built-in turns an API spec into tests. Here you *adopt* the agents Playwright ships with, and learn what they do well and where they need you.

---

## Before you begin (1 min)

- [ ] You've done [SETUP.md](../SETUP.md) Part A, including **A3** (`init-agents` for your tool).
- [ ] The app is on its normal version:
  ```bash
  npm run restore
  ```
- [ ] The app is still running in your second terminal (SETUP.md A5). Refresh http://localhost:3000 to check. If it's stopped, run `npm start` again.

---

## Step 1 — Meet the three agents and the seed test (2 min)

`init-agents` installed three agents for your AI tool:

| Agent | What it does |
|---|---|
| **playwright-test-planner** | Opens a real browser, explores the app, and writes a test plan |
| **playwright-test-generator** | Turns the plan into runnable Playwright tests |
| **playwright-test-healer** | Repairs failing tests. You'll use it in Lab 3 |

Open **`tests/ui/seed.spec.ts`**. It's tiny: it opens the shop and checks the heading. That's the **seed test**, the known starting point the agents begin every session from.

---

## Step 2 — Plan (8 min)

**Start a fresh session first.** Your Lab 1 chat still follows the API agent's rules (such as *only write in `tests/api/`*), and your AI tool only picks up Playwright's agents when a session starts. Your Lab 1 tests are saved in `tests/api/`, so you lose nothing.

| Tool | Start fresh |
|---|---|
| Claude Code (terminal) | Type `/exit`, then run `claude` again. Use this rather than `/clear`, which doesn't reload the agents |
| Claude Code (VS Code extension) | Start a new conversation from the Claude panel |
| VS Code + Copilot | Click **New Chat** (the **+** at the top of the Chat panel) |
| Codex / opencode | Exit, then start it again in the kit folder |

Then follow the steps for **your** tool:

<details open>
<summary><b>Claude Code</b></summary>

1. In your fresh Claude Code session, paste:
   ```
   Use the playwright-test-planner agent. Explore the Flora Mini app starting from
   the seed test tests/ui/seed.spec.ts. Plan tests for: browsing and filtering the
   shop, adding to the cart from the product page, removing items, and checkout
   including validation errors. Keep it to the 10 most important scenarios, with
   one test file per section. Save the plan as specs/shop-plan.md.
   ```
2. The first time, Claude Code asks whether to use the **playwright-test** MCP server. **Allow it.** That's how the agent controls the browser.
</details>

<details>
<summary><b>VS Code + GitHub Copilot</b></summary>

1. Open Chat (**Ctrl+Alt+I**, or **⌃⌘I** on Mac).
2. Open the agent dropdown at the bottom of the chat box (where you chose **Agent** in Lab 1), and pick **playwright-test-planner**. Not in the list? Reload VS Code: **Ctrl+Shift+P → Developer: Reload Window**.
3. Paste:
   ```
   Explore the Flora Mini app starting from the seed test tests/ui/seed.spec.ts.
   Plan tests for: browsing and filtering the shop, adding to the cart from the
   product page, removing items, and checkout including validation errors. Keep
   it to the 10 most important scenarios, with one test file per section. Save
   the plan as specs/shop-plan.md.
   ```
4. Allow the **playwright-test** tools when Copilot asks.
</details>

<details>
<summary><b>Codex or opencode</b></summary>

1. In the kit folder, start your tool (`codex` or `opencode`).
2. Paste:
   ```
   Use the playwright-test-planner agent. Explore the Flora Mini app starting from
   the seed test tests/ui/seed.spec.ts. Plan tests for: browsing and filtering the
   shop, adding to the cart from the product page, removing items, and checkout
   including validation errors. Keep it to the 10 most important scenarios, with
   one test file per section. Save the plan as specs/shop-plan.md.
   ```
3. Allow the **playwright-test** tools when asked. If your tool says it doesn't know the agent, ask it: *"List the Playwright test agents in this project"*, then use the planner it lists.
</details>

✅ **Expected:** the agent reports that it's opening the app, clicking through pages and taking page snapshots. After a few minutes, **`specs/shop-plan.md`** appears.

> The agent explores the app through the test runner, which starts its own copy of the app. You won't see it in your browser tab; that's normal.
>
> **A browser window the agent opened stays open after the plan is done.** Leave it: the generator reuses it in Step 4, and the Step 4 prompt asks it to close the browser at the end. If it's still open after that, close it yourself, or it closes when you exit your AI tool.

---

## Step 3 — Review the plan before any code exists (5 min)

Open `specs/shop-plan.md`. Tick each one:

- [ ] Each scenario says **what is checked** (an expected result), not only which buttons are clicked
- [ ] The cart scenarios check **totals**, including the **$75 free-shipping** rule
- [ ] Checkout includes at least one **validation error**, such as an invalid email
- [ ] Every expected result is **definite**. Watch for *"observed"*, *"verify whether"* or *"A or B"*: a test can't assert "either"
- [ ] About **10 scenarios**. Many more won't fit in the time

> 💡 **Did your planner find the $75 rule?** Probably not. The planner only explores the UI, and the UI never shows the number $75; that rule lives in the spec (`openapi.yaml`). So the planner tests *what the app does*, not *what it should do*. Adding the business rules is your job.

> ⚠️ **Watch for a plan that "discovers" a rule.** For example: *"probe subtotals to determine the threshold, then assert it."* That turns whatever the app does into the expected result, so a bug would pass. Expected values must come from the spec, not from the app.

Missing something, or too big? Tell the planner. Use the parts you need:
```
Revise specs/shop-plan.md:
1. The free-shipping rule comes from the spec: shipping is $8.00 below a $75.00
   subtotal and free at or above it. Add scenarios built from real products for
   just below $75, exactly $75 (for example 3 × Rose Garden Candle at $25) and
   above $75, checking shipping and total in each.
2. Replace every expectation that says "observed", "verify whether" or "or"
   with one definite expected result.
3. Keep only the 10 most important scenarios, covering browsing, adding to the
   cart (including quantity above 1), removing, and checkout with a validation
   error. Put them in one file per section, not one file per scenario.
```

---

## Step 4 — Generate the tests (8 min)

**Stay in the same session you used for the planner.** Both are Playwright's agents, so there are no conflicting rules, and the plan is saved in `specs/shop-plan.md`, so the generator reads it from the file. Start a new session only if your tool gets slow or hits a usage limit; you lose nothing, because the plan is a file.

Follow the steps for **your** tool:

<details open>
<summary><b>Claude Code</b></summary>

Paste:
```
Use the playwright-test-generator agent to turn specs/shop-plan.md into tests
in tests/ui/, using the file names in the plan. Prefer getByRole and getByLabel
locators. Keep one scenario per test. When you're done, close the browser.
```
</details>

<details>
<summary><b>VS Code + GitHub Copilot</b></summary>

1. In the agent dropdown at the bottom of the chat box, switch from **playwright-test-planner** to **playwright-test-generator**.
2. Paste:
   ```
   Turn specs/shop-plan.md into tests in tests/ui/, using the file names in the
   plan. Prefer getByRole and getByLabel locators. Keep one scenario per test.
   When you're done, close the browser.
   ```
</details>

<details>
<summary><b>Codex or opencode</b></summary>

Paste:
```
Use the playwright-test-generator agent to turn specs/shop-plan.md into tests
in tests/ui/, using the file names in the plan. Prefer getByRole and getByLabel
locators. Keep one scenario per test. When you're done, close the browser.
```
</details>

Allow the **playwright-test** tools if asked again.

✅ **Expected:** the `*.spec.ts` files named in your plan appear in `tests/ui/`. The generator opens the app and runs each test as it writes it, so this takes a few minutes.

---

## Step 5 — Run them yourself (2 min)

```bash
npm run test:ui
npm run report
```

✅ **Expected:** all green. `npm run report` opens the HTML report. Click a test to see each step and a screenshot.

Something red? Ask the agent:
```
npm run test:ui has failures. Fix the tests so they pass against the app as it
is now. Don't change anything in app/.
```

---

## Step 6 — Review the locator strategy (3 min)

Open your new files in `tests/ui/` and look for:

| Look for | Why it matters |
|---|---|
| CSS or XPath selectors, like `.btn-primary` or `//div[3]/button` | They break when the page layout changes. Ask for `getByRole` or `getByLabel` instead |
| Position-based locators, like `.nth(2)` or `.first()` on table cells | They break when columns or rows are reordered, even with no CSS in sight. Ask for a locator by name, such as `getByRole('row', { name: 'Peony Bouquet' })` |
| `waitForTimeout(...)` | Fixed waits make tests slow and flaky. Ask for a web-first assertion such as `await expect(...).toBeVisible()` |
| A test with no `expect` | It clicks around but checks nothing |
| Money checked as "is this exact text visible?", like `getByText('Total: $75.00').toBeVisible()` | When it fails, the report only says *"not found"*. Prefer `await expect(page.getByText(/^Total:/)).toHaveText('Total: $75.00')`: the report then shows both the expected and the actual value |

Found one? Copy the prompt that matches what you found.

**CSS, XPath or `waitForTimeout`:**
```
Replace every CSS or XPath selector in tests/ui/ with a getByRole or getByLabel
locator, and every waitForTimeout with a web-first assertion. Keep every
expected value the same. Then run npm run test:ui.
```

**Position-based cells, like `.nth(2)`:**
```
In tests/ui/, replace position-based cell checks such as
row.getByRole('cell').nth(2) with a check on the row found by name, for example
await expect(page.getByRole('row', { name: /Rose Garden Candle/ })).toContainText('$75.00').
Keep every expected value the same. Then run npm run test:ui.
```

**Money checked with `toBeVisible()`:**
```
In tests/ui/, replace money checks like getByText('Total: $75.00').toBeVisible()
with an anchored locator and toHaveText, for example
await expect(page.getByText(/^Total:/)).toHaveText('Total: $75.00').
Do the same for the Subtotal: and Shipping: lines. Keep every expected value
the same. Then run npm run test:ui.
```

> 💡 **Why `/^Total:/` and not `'Total:'`?** `getByText` matches part of the text by default, so `'Total: $75.00'` also matches *"Subtotal: $75.00"* whenever shipping is free. Playwright then stops with a *strict mode violation: resolved to 2 elements*. The `^` anchors the match to the start of the line, so only the Total line is found.

---

## Step 7 — Compare with the reference (2 min)

Stay in the same session, and paste:
```
Compare my tests in tests/ui/ with reference/ui/shop.spec.ts. Answer from those
test files only: don't open anything in app/ or reference/healed/, don't run
any tests, and don't change any files. Briefly: which scenarios does each
cover, and which locators does each use?
```

---

## ✅ You're done when

- [ ] `specs/shop-plan.md` exists, and you've reviewed it
- [ ] **`npm run test:ui` is green.** Lab 3 starts from passing tests.
- [ ] You checked the locators for CSS, XPath and `waitForTimeout`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| The agent isn't found | Re-run the `init-agents` line for your tool (SETUP.md A3), then restart or reload your AI tool |
| It asks to use the "playwright-test" tools or MCP server | Allow it. That's how the agent drives the browser |
| The planner can't reach the app | Run `npm run verify`. The "Sample app starts" line must say PASS |
| The plan or tests went somewhere else | Ask the agent to move the plan to `specs/shop-plan.md` and the tests to `tests/ui/` |
| Tests are still red after one fix | Out of time? Copy `reference/ui/shop.spec.ts` into `tests/ui/`, run `npm run test:ui`, and you're ready for Lab 3 |
| Free-tier rate limit reached | Switch model, or pair with a neighbour |

---

## Finished early? Stretch goals

1. Ask the planner to add **a scenario you think it missed**, then generate just that one.
2. Ask the generator to make one test **data-driven**, such as filtering by each category in turn.
3. In the HTML report, open a test's **trace** and step through it. That's what you'll use in Lab 3 to see why a test broke.
