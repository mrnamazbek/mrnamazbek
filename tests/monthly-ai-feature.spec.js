const { test, expect } = require('@playwright/test');

test('AI monthly feature renders and works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(String(err));
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('#ai-monthly-lab')).toBeVisible();
  await expect(page.locator('#ai-monthly-feature-root')).toContainText("Rocket Launch Watch: A Developer-Friendly Space Events Digest");

  const card = page.locator('#ai-monthly-feature-root .ai-feature');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-widget-type', "roadmap_planner");

  const checks = page.locator('#ai-monthly-feature-root [data-roadmap-step]');
  await expect(checks.first()).toBeVisible();
  await checks.first().check();
  await expect(page.locator('#ai-roadmap-meta')).toContainText('complete');

  const hasHorizontalOverflow = await page.evaluate(() => {
    const delta = document.documentElement.scrollWidth - window.innerWidth;
    return delta > 2;
  });
  expect(hasHorizontalOverflow).toBeFalsy();

  expect(consoleErrors, `Console errors found: ${consoleErrors.join('\n')}`).toEqual([]);
});
