# Lab 1 — Build your own: an API test agent

| | |
|---|---|
| **Time** | 30 minutes |
| **Goal** | Direct a custom AI agent to turn an OpenAPI spec into a full Playwright API suite, then review its output like an expert |
| **You'll practise** | Status-code, schema, negative and data-driven tests · reviewing AI-written tests · refining with targeted prompts |
| **You'll produce** | A working API suite in `tests/api/` |

> **Why build this one yourself?** Playwright's built-in agents (Lab 2) explore a **UI**. Nothing built-in turns an **API spec** into tests. That's the gap you fill here.

---

## Before you begin (1 min)

- [ ] You've done [PREREQUISITES.md](../PREREQUISITES.md), and `npm run verify` shows 5 × PASS.
- [ ] You're in the kit folder: `cd self-healing-agents-kit`
- [ ] The app is on its normal version:
  ```bash
  npm run restore
  ```

---

## Step 1 — Know what "good" looks like (3 min)

Open `openapi.yaml` in your editor and skim it. You'll judge the agent against these rules, so note them:

| Rule in the spec | Why it matters for testing |
|---|---|
| Amounts are integer **cents** (`4400` = $44.00) | Expected values must be in cents |
| Shipping is **$8.00 below a $75.00 subtotal**, free at or above it | A boundary: test just below, exactly at, and above |
| Cart `quantity` must be an integer **1–10**, and can't exceed stock | Boundaries: 0, 1, 10, 11. Also non-integers. Also a 409 when over stock |
| Errors: **400** (bad input), **404** (not found), **409** (over stock) | Every documented status needs a test |
| Responses don't allow extra fields (`additionalProperties: false`) | Schema checks should fail on unexpected fields |

---

## Step 2 — Start your agent (2 min)

The agent's instructions are in **`agents/api-test-generator.md`**, in the `agents` folder at the **top level** of the kit. Open it and read the *Rules* section. It's short.

> There's also a file with the same name inside the hidden `.claude/agents/` folder. That one is only a small loader for Claude Code, and it points to the file above. You don't need to open it.

Then follow the steps for **your** tool:

<details open>
<summary><b>Claude Code</b></summary>

1. Start Claude Code in the kit folder:
   - **Terminal:** run `claude`
   - **VS Code extension:** open the kit folder in VS Code and click the **Claude** icon (✱)
2. Paste this prompt:
   ```
   Use the api-test-generator agent. Read openapi.yaml and show me the coverage
   matrix first. Wait for my OK before you write any tests.
   ```
   Claude Code loads the agent from `.claude/agents/` automatically.
</details>

<details>
<summary><b>VS Code + GitHub Copilot</b></summary>

1. Open the kit folder in VS Code: **File → Open Folder…**
2. Open Chat: **Ctrl+Alt+I** (or **⌃⌘I** on Mac).
3. At the bottom of the Chat panel:
   - Set the mode dropdown to **Agent**. *Ask* or *Edit* mode can't run commands.
   - Leave the button next to it on **Auto**, optimized for **Balance**. If the agent's tests look weak, switch it to **Intelligence**.
4. Paste this prompt:
   ```
   Read the file agents/api-test-generator.md and follow it as your
   instructions for the rest of this session. Then read openapi.yaml and show
   me the coverage matrix first. Wait for my OK before you write any tests.
   ```
   If Copilot says it can't find the file, type `#file:agents/api-test-generator.md` at the start of the prompt to attach it.
</details>

<details>
<summary><b>Codex</b></summary>

1. In a terminal in the kit folder, run:
   ```bash
   codex
   ```
2. Paste this prompt:
   ```
   Read the file agents/api-test-generator.md and follow it as your
   instructions for the rest of this session. Then read openapi.yaml and show
   me the coverage matrix first. Wait for my OK before you write any tests.
   ```
</details>

<details>
<summary><b>opencode</b></summary>

1. In a terminal in the kit folder, run:
   ```bash
   opencode
   ```
2. Paste this prompt:
   ```
   Read the file agents/api-test-generator.md and follow it as your
   instructions for the rest of this session. Then read openapi.yaml and show
   me the coverage matrix first. Wait for my OK before you write any tests.
   ```
</details>

**All tools:** when the agent asks permission to read files, edit files or run a command, **allow it**.

✅ **Expected:** the agent replies with a **coverage matrix**, a table with one row per API operation, and **stops**. It hasn't written any files yet.

---

## Step 3 — Review the matrix before any code exists (5 min)

This is the cheapest moment to catch gaps. Tick each one:

- [ ] All **9 operations** are listed: health, categories, products list, product by slug, get cart, add item, remove item, checkout, get order. *Some agents list the `?category=` filter as its own row, so you may see 10. That's fine.*
- [ ] **400, 404 and 409** each appear somewhere
- [ ] The **$75 shipping boundary** is planned (below, at, above)
- [ ] **Quantity boundaries** are planned: 0, 1, 10, 11, and a non-integer
- [ ] **Schema checks** are planned for products, the cart and orders

If something is missing, tell the agent. For example:
```
Your matrix has no 409 case. Add one for adding more than the product's stock.
Show me the updated matrix.
```

---

## Step 4 — Approve and generate (5 min)

Paste:
```
Approved. Write the suite into tests/api/ and run it with
npx playwright test --project=api. Then summarise the results.
```

✅ **Expected:**
- New files in `tests/api/`, such as `catalog.spec.ts`, `cart.spec.ts` and `orders.spec.ts`
- The agent runs the tests and reports how many passed and failed

> 💡 **On this version of the app, the API matches the spec.** So a failing test here usually means **the test is wrong**, not the app. Keep that failure. It's great material for Step 7.

---

## Step 5 — Run it yourself (2 min)

Never just trust the agent's summary.

```bash
npm run test:api
npm run report
```

`npm run report` opens the HTML report in your browser. Click a test to see each request it made.

---

## Step 6 — Refine with ONE targeted prompt (5 min)

Pick **one** of these and paste it. If your suite already covers an option, pick another; **C** works for every suite:

**A. Boundaries**
```
The shipping rule changes at a $75.00 subtotal. Add data-driven tests for a
subtotal just below, exactly at, and just above the threshold. Build each cart
from real catalog prices. Don't hardcode amounts.
```

**B. Negative tests**
```
Add negative tests for POST /api/cart/items: missing slug, unknown slug (404),
and adding more than stock in two separate calls (409). Use the product with
the lowest stock, read from the API.
```

**C. Challenge the agent**
```
Review your own suite as a skeptical senior tester. Which assertion could never
fail? Which test depends on another test's state? Fix both and explain the
change.
```

Then run `npm run test:api` again.

---

## Step 7 — Critique like an expert (5 min)

Open the files in `tests/api/` and find:

| Find | Write it down |
|---|---|
| 🌟 One test **you wouldn't have thought to write** | File + test name: ____________ |
| ⚠️ One test that's **wrong or weak**: it can never fail, it's hardcoded, it depends on another test, or it checks the wrong thing | File + test name: ____________ |

Be ready to share one of them with the room.

---

## Step 8 — Compare with the reference (2 min)

The instructor's reference suite is in `reference/api/`. Run it:
```bash
npm run test:ref
```

Open `reference/api/cart-checkout.spec.ts` and compare it with your agent's cart tests. Look at:
- How are expected totals calculated? From the spec's rules, or hardcoded?
- Which quantities are tested? Why does testing **more than 1** matter?

---

## ✅ You're done when

- [ ] `tests/api/` has an agent-written suite that runs
- [ ] You refined it with at least one prompt
- [ ] You found one 🌟 and one ⚠️ test

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Agent wrote tests without showing a matrix | Say: *"Stop. Delete what you wrote and show me the coverage matrix first."* |
| Agent put files somewhere other than `tests/api/` | Say: *"Move the tests into tests/api/."* Tests elsewhere won't run with `npm run test:api` |
| Agent edited `app/` or `openapi.yaml` | Undo it with `git checkout -- app openapi.yaml`, then remind it of the rules in `agents/api-test-generator.md` |
| `Error: No tests found` | The files aren't in `tests/api/`, or don't end in `.spec.ts` |
| `Error: http://localhost:3100 is already used` | Another test run is still going. Wait for it to finish, or close the old terminal |
| Agent can't run commands | Copilot: make sure you're in **Agent** mode. Any tool: run `npm run test:api` yourself and paste the output into the chat |
| Free-tier rate limit reached | Switch to another model in your tool, or pair with a neighbour |
| You're stuck | Copy one file from `reference/api/` into `tests/api/` and continue from Step 7 |

---

## Finished early? Stretch goals

1. Ask the agent to add tests for **`DELETE /api/cart/items/{slug}`**, including removing something that isn't in the cart.
2. Ask it to test that **two separate sessions have separate carts**.
3. Edit `agents/api-test-generator.md` to add one rule of your own, for example *"every test name must state the expected status code."* Then regenerate one file and compare.
