// Seed test for Playwright's planner and generator agents: it boots the app
// and lands on the shop, so the agents start every session from a known page.
import { test, expect } from '@playwright/test';

test.describe('Flora Mini', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Shop', level: 1 })).toBeVisible();
  });
});
