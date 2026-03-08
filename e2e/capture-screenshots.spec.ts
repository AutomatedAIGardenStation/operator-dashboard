import { test, expect } from '@playwright/test';

test('capture desktop and mobile screenshots', async ({ page }) => {
  // Capture Desktop Screenshot
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page).toHaveTitle(/GardenStation/i);
  // Wait a bit for initial render/animation
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/issue-32-desktop.png', fullPage: true });

  // Capture Mobile Screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  // Wait a bit for layout to settle
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/issue-32-mobile.png', fullPage: true });
});
