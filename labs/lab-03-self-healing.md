# Lab 3 — Self-healing: break the app, triage, heal

| | |
|---|---|
| **Time** | 30 minutes |
| **Goal** | Ship a "refactor" that breaks your UI suite, let Playwright's healer agent triage and repair it, and decide whether you'd merge the result |
| **You'll practise** | Telling a stale test from a real bug · directing a healer with guardrails · reviewing an AI's changes before trusting them |
| **You'll produce** | A healed UI suite, and your own verdict on it |

> **The question for this lab:** when a test goes red, did the *app* break or did the *test* go stale? The healer should fix the second kind, and must leave the first kind alone.

---

## Before you begin (2 min)

- [ ] **Your UI tests from Lab 2 pass.** Run `npm run test:ui`: it must be green.
  No time to finish Lab 2? Copy the reference suite instead: copy `reference/ui/shop.spec.ts` into `tests/ui/`, then run `npm run test:ui`.
- [ ] The app is on its normal version:
  ```bash
  npm run restore
  ```
- [ ] **Start a fresh AI session.** This lab gives the healer new rules, and they shouldn't mix with Lab 2's chat.

  | Tool | Start fresh |
  |---|---|
  | Claude Code (terminal) | Type `/exit`, then run `claude` again |
  | Claude Code (VS Code extension) | Start a new conversation from the Claude panel |
  | VS Code + Copilot | Click **New Chat** (the **+** at the top of the Chat panel) |
  | Codex / opencode | Exit, then start it again in the kit folder |

---

## Step 1 — Take a snapshot of your tests (1 min)

So you can see exactly what the healer changes later, stage your current tests in Git. This doesn't commit anything; it just records "before".

```bash
git add tests/ui
```

---

## Step 2 — Ship the refactor (3 min)

```bash
npm run break
npm run test:ui
```

✅ **Expected:** `Shipped the v2 "refactor"`, then **most of your UI tests go red**.

Don't fix anything yet. Open the report and look at one or two failures:
```bash
npm run report
```

Ask yourself: is each failure a test that's now **out of date**, or an app that's now **wrong**? Keep your guesses; you'll compare them with the healer's.

---

## Step 3 — Heal, but triage first (10 min)

Follow the steps for **your** tool:

<details open>
<summary><b>Claude Code</b></summary>

Paste:
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
Don't edit anything in app/. Finish with a table: test, classification,
confidence, change made.
```
</details>

<details>
<summary><b>VS Code + GitHub Copilot</b></summary>

1. In the agent dropdown at the bottom of the chat box, pick **playwright-test-healer**.
2. Paste:
   ```
   Heal the failing tests in tests/ui/. Before you change anything, classify
   every failure as one of:
     STALE TEST: the app changed on purpose (copy, structure, locators)
     REGRESSION: the app now behaves wrongly
     UNSURE
   For each one, give your evidence and a confidence from 0 to 100%.
   Only heal STALE TEST failures with confidence of 80% or more.
   Never change an expected value in an assertion about money, totals or
   business rules. Mark those as REGRESSION and leave the test failing.
   Don't edit anything in app/. Finish with a table: test, classification,
   confidence, change made.
   ```
</details>

<details>
<summary><b>Codex or opencode</b></summary>

Paste:
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
Don't edit anything in app/. Finish with a table: test, classification,
confidence, change made.
```
</details>

Allow the **playwright-test** tools if asked.

✅ **Expected:** the healer reruns the failing tests, inspects the pages, and gives you a table of failures with a classification and confidence for each. It patches the ones it judges stale, then reruns them.

> **Watch closely.** Does the healer ever change an expected value to make a test pass? That's exactly what a healer must not do.

---

## Step 4 — Read every change it made (5 min)

```bash
git diff tests/ui
```

This shows only what the healer changed since your snapshot in Step 1. For each change, ask:

| Question | What to look for |
|---|---|
| **Did it change a locator, or an assertion?** | A changed locator (a new button name, a new heading level) is usually fine. A changed assertion is suspicious |
| **Did anything get looser?** | `toHaveText` turned into `toBeVisible`, an exact string turned into a regex, an `expect` deleted |
| **Did any expected number change?** | A total, a price or a count edited to match what the app now shows |
| **Is anything still red?** | Run `npm run test:ui`. Should anything still be red? |

---

## Step 5 — Would you merge it? (3 min)

Turn to your neighbour. Using the diff and the healer's table, decide:

- Which heals would you **accept**?
- Which would you **reject**, and why?
- Is any test **still red**? Is that the right answer?

Be ready to share one example with the room.

---

## Step 6 — Ask your Lab 1 suite (2 min)

Your Lab 1 API tests weren't touched by the healer. Run them against this version of the app:

```bash
npm run test:api
```

Which tests fail? What do the failures tell you about the "refactor"?

---

## Step 7 — Compare with the reference, then put it back (3 min)

The instructor's healed suite is in `reference/healed/`. Run it against v2:
```bash
npm run test:healed
```

Open `reference/healed/shop.spec.ts`. Its comments mark each **HEALED** change, and the one change that was deliberately **NOT HEALED**. Compare with your diff.

Then switch the app back:
```bash
npm run restore
```

---

## ✅ You're done when

- [ ] You saw your suite go red on v2
- [ ] The healer classified every failure, with a confidence for each
- [ ] You reviewed `git diff tests/ui` and decided what you'd merge
- [ ] You ran your Lab 1 API suite against v2
- [ ] You ran `npm run restore`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Nothing goes red after `npm run break` | Run `npm run break` again, and check it says *Shipped the v2 "refactor"*. Then run `npm run test:ui` |
| `git diff tests/ui` shows nothing | You skipped Step 1, so Git has no "before". Look at the healer's summary table instead |
| The healer changed an expected total to make a test pass | That's the lesson of this lab. Reject that change: `git checkout -- <file>` puts the file back to your snapshot. Then discuss it with your neighbour |
| The healer keeps retrying the same test | Stop it. One heal attempt per test is enough; a test that still fails needs a human |
| Everything is green after healing | Be suspicious. Check the diff for loosened assertions or edited numbers |
| The healer isn't found | Re-run the `init-agents` line for your tool (SETUP.md A3), then restart or reload your AI tool |

---

## Finished early? Stretch goals

1. Ask the healer to **write its table to a file**, `heal-log.md`. That's the "heal event log" a CI pipeline would keep for a human to review.
2. Put your own **guardrail policy** into the healer prompt. Start from `prompts/04-guardrails.md`, and add one rule of your own.
3. Ask the generator to add a **checkout test with quantity 2**, then run it on v2. What does it catch?
