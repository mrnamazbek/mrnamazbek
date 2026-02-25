const { test, expect } = require('@playwright/test');

test('Live FX and weather widget renders', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(String(err));
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  const root = page.locator('#ai-live-signals-root');
  await expect(root).toBeVisible();
  await expect(root).toContainText('USD/KZT');
  await expect(root).toContainText('RUB/KZT');
  await expect(root).toContainText('GBP/KZT');
  await expect(root).toContainText('EUR/KZT');
  await expect(root).toContainText('Almaty');
  await expect(root).toContainText('Shymkent');
  await expect(root).toContainText('Astana');
  await expect(root.locator('.ai-live-signals__weather-temp').first()).toBeVisible();
  await expect(root.locator('.ai-live-signals__trend').first()).toBeVisible();
  const hasHorizontalOverflow = await root.evaluate((el) => {
    const delta = el.scrollWidth - el.clientWidth;
    return delta > 2;
  });
  expect(hasHorizontalOverflow).toBeFalsy();
  const filteredErrors = consoleErrors.filter((msg) => !msg.includes('ERR_NAME_NOT_RESOLVED') && !msg.includes('ERR_CERT_AUTHORITY_INVALID'));
  expect(filteredErrors, `Console errors found: ${filteredErrors.join('\n')}`).toEqual([]);
});
