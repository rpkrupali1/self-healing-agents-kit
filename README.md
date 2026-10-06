# Self-Healing Test Automation with Agentic AI — Workshop Kit

Hands-on kit for the 2-hour workshop **"Self-Healing Test Automation with Agentic AI: Build, Adopt, and Orchestrate Your Testing Agents."**

The sample app is **Flora Mini**, a tiny flower shop. You'll point AI agents at it to:
1. generate an API suite from its OpenAPI spec,
2. plan and generate UI tests,
3. break it with a "refactor" and watch the tests heal.

## Quick start

1. **Set up:** follow [PREREQUISITES.md](PREREQUISITES.md). If you did the pre-workshop setup email, it takes about 5 minutes.
2. **Do the labs:** start at [labs/](labs/README.md).

Short version, if you've done this before:
```bash
git clone <this repo>
cd self-healing-agents-kit
npm install
npx playwright install chromium
npm run verify       # checks Node, Git, Playwright, Chromium and the app
npm start            # http://localhost:3000
```

You don't need a database, API keys or accounts. All data is generated from a fixed seed, so everyone sees the same catalog.

## What's inside

| Path | What it is |
|---|---|
| `app/` | The sample app (Node only, no dependencies) |
| `openapi.yaml` | The sample app's API spec, the input for Lab 1 (also served at `/openapi.yaml`) |
| `labs/` | Step-by-step labs, with steps for each AI tool |
| `PREREQUISITES.md` | Setup steps, including each of the 4 AI tools |
| `agents/api-test-generator.md` | The custom agent's instructions (Lab 1), shared by all AI tools |
| `.claude/agents/` | Claude Code's pointer to that agent |
| `prompts/` | Prompt library, for reuse on your own projects |
| `tests/api/`, `tests/ui/` | **Your** agent-generated tests go here |
| `tests/ui/seed.spec.ts` | Seed test for Playwright's planner and generator agents |
| `reference/` | Instructor reference suites (8 API, 5 UI) plus the healed UI suite |
| `scripts/` | Setup check, data generator, v1/v2 switch |
| `.github/workflows/quality-pipeline.yml` | CI template: API + UI jobs, HTML reports, quality gate |

## Commands

| Command | Does |
|---|---|
| `npm start` | Run the app on :3000 |
| `npm run break` / `npm run restore` | Switch the app to the v2 "refactor" / back to v1 |
| `npm run test:api` / `npm run test:ui` | Run **your** suites |
| `npm run test:ref` | Run the reference suites |
| `npm run test:healed` | Run the healed reference UI suite (meant for v2) |
| `npm run report` | Open the last HTML report |
| `npm run data` | Write the seed data to `data/seed.json` |

Tests start their own server on port 3100, so leaving `npm start` running on 3000 never gets in the way.

## Labs

1. [Lab 1: Build your own, an API test agent](labs/lab-01-api-agent.md)
2. Lab 2: Adopt what exists, Playwright's planner and generator *(coming soon)*
3. Lab 3: Self-healing *(coming soon)*
4. [Guardrails](prompts/04-guardrails.md)

## Supported AI tools

Use any **one**: Claude Code, VS Code 1.105+ with GitHub Copilot, Codex, or opencode. Set up Playwright's agents for your tool with:

```bash
npx playwright init-agents --loop=claude    # or: vscode | codex | opencode
```

## Adapting this to your own stack

- [ ] Replace `openapi.yaml` with your service's spec, and give the agent your data rules.
- [ ] Write a seed test that logs in and lands on your app's start page.
- [ ] Put the heal policy from `prompts/04-guardrails.md` into your healer instructions.
- [ ] Copy the workflow, point it at your projects, and require the quality gate on PRs.

## License

Code: MIT. Slides: CC BY 4.0.
