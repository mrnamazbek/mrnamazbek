const { test, expect } = require('@playwright/test');

test('AI audience pulse and engagement widgets render on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(String(err));
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('#audience-pulse')).toBeVisible();
  await expect(page.locator('#ai-audience-root')).toContainText('AI Platform Momentum');

  const chips = page.locator('#ai-audience-root .audience-chip');
  await expect(chips.first()).toBeVisible();
  const chipCount = await chips.count();
  if (chipCount > 1) {
    await chips.nth(1).click();
  } else {
    await chips.first().click();
  }

  await expect(page.locator('#ai-audience-root .audience-bar')).toHaveCount(12);

  await expect(page.locator('#site-engagement-root')).toContainText('Site Engagement');
  const likeBtn = page.locator('#engagement-like-btn');
  await expect(likeBtn).toBeVisible();
  await likeBtn.click();

  await expect(page.locator('#engagement-likes')).not.toBeEmpty();

  const hasHorizontalOverflow = await page.evaluate(() => {
    const delta = document.documentElement.scrollWidth - window.innerWidth;
    return delta > 2;
  });
  expect(hasHorizontalOverflow).toBeFalsy();

  expect(consoleErrors, `Console errors found: ${consoleErrors.join('\n')}`).toEqual([]);
});
