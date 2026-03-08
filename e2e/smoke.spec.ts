import { test, expect } from '@playwright/test';

test('app load smoke test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GardenStation/i);
});
