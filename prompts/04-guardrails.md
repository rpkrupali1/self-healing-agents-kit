# Guardrails — when must an agent NOT auto-heal?

Use these for the closing debate, and as a starting policy for your own team.

## Suggested policy

| Situation | Auto-heal? |
|---|---|
| Locator changed and the element's role and purpose are the same | ✅ Yes, if confidence ≥ 80% |
| Visible copy changed (button text, headings) | ✅ Yes, and log it for review |
| An expected value about **money, totals, permissions or data** changed | ❌ Never. Treat as a regression |
| The fix makes an assertion **weaker** (exact → partial, assertion removed) | ❌ Never |
| The test still fails after one heal attempt | ❌ Stop and hand it to a human |
| Failure in an area with no recent code change | ⚠️ Escalate. It may be the environment or data |

## Prompt to bake the policy into the healer

```
When healing tests, follow these rules:
1. Classify every failure as STALE TEST, REGRESSION or UNSURE, with evidence
   and a confidence score, before you edit anything.
2. Only edit locators and UI copy. Never edit expected values for money,
   totals, permissions or data.
3. Never weaken an assertion.
4. Make at most one heal attempt per test. If it still fails, stop and report.
5. Finish with a heal log: test, classification, confidence, change made.
```

## Debate questions

- Who owns a healed test: the agent, the PR author, or QA?
- Should a heal ever auto-merge? Under what conditions?
- How would you notice an agent slowly weakening your suite over 6 months?
