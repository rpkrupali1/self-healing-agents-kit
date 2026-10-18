# Prompt library — API suite generation and refinement

For the guided, step-by-step version, see [labs/lab-01-api-agent.md](../labs/lab-01-api-agent.md).

Agent instructions: [agents/api-test-generator.md](../agents/api-test-generator.md).
- **Claude Code:** start with *"Use the api-test-generator agent."*
- **Other tools:** start with *"Read the file agents/api-test-generator.md and follow it as your instructions for the rest of this session."*

## Generate

```
Read openapi.yaml and show me the coverage matrix first, saved as
tests/api/coverage-matrix.md. Wait for my OK before you write any tests.
```

```
Approved. Write the suite into tests/api/ and run it with
npx playwright test --project=api. Then summarise the results.
```

## Refine coverage

**Boundaries**
```
The shipping rule changes at a $75.00 subtotal. Add data-driven tests for a
subtotal just below, exactly at, and just above the threshold. Build each cart
from real catalog prices. Don't hardcode amounts.
```

**Negative tests**
```
Add negative tests for POST /api/cart/items: missing slug, unknown slug (404),
and adding more than stock in two separate calls (409). Use the product with
the lowest stock, read from the API.
```

**Self-review**
```
Review your own suite as a skeptical senior tester. Which assertion could never
fail? Which test depends on another test's state? Fix both and explain the
change.
```

## Adapting to your own API

```
Read <your-spec>.yaml. Our business rules that the spec doesn't state are:
<rules>. Show me a coverage matrix that includes them. Wait for my OK before
writing tests.
```
