# Exercise 1 — Build your own: an API suite agent

The agent definition is in `.claude/agents/api-test-generator.md`.
- **Claude Code** picks it up automatically.
- **Other tools:** paste the body of that file (below the `---` header) as the first message, then continue with the prompts here.

## 1. Generate

```
Use the api-test-generator agent. Read openapi.yaml and show me the coverage
matrix first. Wait for my OK before you write any tests.
```

Review the matrix. Is every documented status code there? Is the shipping rule tested on both sides of $75.00? Then:

```
Approved. Write the suite into tests/api/ and run it with
npx playwright test --project=api.
```

## 2. Refine — pick at least one

**Negative tests**
```
Add negative tests for POST /api/cart/items: missing slug, unknown slug (404),
and adding more than stock in two separate calls (409). Use the product with
the lowest stock, read from the API.
```

**Boundaries**
```
The shipping rule changes at a $75.00 subtotal. Add data-driven tests for a
subtotal just below, exactly at, and just above the threshold. Build each cart
from real catalog prices. Don't hardcode amounts.
```

**Challenge the output**
```
Review your own suite as a skeptical senior tester. Which assertion could never
fail? Which test depends on another test's state? Fix both and explain the
change.
```

## 3. Critique (discuss with your neighbour)

- Find one test the agent wrote that **you wouldn't have thought of**.
- Find one test that is **wrong or weak**.
- Compare with `reference/api/`. Run it with `npm run test:ref`.
