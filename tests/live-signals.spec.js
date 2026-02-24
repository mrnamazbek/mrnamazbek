const { test, expect } = require('@playwright/test');

test('Live FX and weather widget renders', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('/', { waitUntil: 'networkidle' });

  const root = page.locator('#ai-live-signals-root');
  await expect(root).toBeVisible();
  await expect(root).toContainText('USD → RUB');
  await expect(root).toContainText('USD → GBP');
  await expect(root).toContainText('USD → EUR');
  await expect(root).toContainText('Almaty');
  await expect(root).toContainText('Shymkent');
  await expect(root).toContainText('Astana');
});
