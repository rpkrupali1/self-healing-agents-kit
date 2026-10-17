import { defineConfig } from '@playwright/test';

// Tests use their own port and always boot a fresh server, so a `npm start`
// you left running on :3000 never answers for the suite.
const PORT = 3100;

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // A missing button fails in 5s, not the 30s test timeout, so a broken
    // suite goes red fast during the demo.
    actionTimeout: 5_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node app/server.js',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    env: { PORT: String(PORT) },
  },
  projects: [
    // Where YOUR agents write tests during the workshop.
    // ui first: init-agents looks for the seed test in the first project's folder.
    { name: 'ui', testDir: 'tests/ui' },
    { name: 'api', testDir: 'tests/api' },
    // Instructor reference suites, for comparison with your agents' output.
    { name: 'ref-api', testDir: 'reference/api' },
    { name: 'ref-ui', testDir: 'reference/ui' },
    // The reference UI suite after healing against v2.
    { name: 'healed-ui', testDir: 'reference/healed' },
  ],
});
