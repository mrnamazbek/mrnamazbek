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
  await expect(page.locator('#ai-monthly-feature-root')).toContainText("Match-Day Automation Pack: Turn Live Sports Spikes into Reliable Ops Signals");

  const card = page.locator('#ai-monthly-feature-root .ai-feature');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-widget-type', "impact_estimator");

  const slider = page.locator('#ai-impact-slider');
  await expect(slider).toBeVisible();
  const sliderMeta = await slider.evaluate((el) => {
    return {
      min: Number(el.getAttribute('min') || 0),
      max: Number(el.getAttribute('max') || 100)
    };
  });
  const target = Math.max(sliderMeta.min, Math.min(sliderMeta.max, sliderMeta.max - 1));
  await slider.evaluate((el, val) => {
    el.value = String(val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, target);
  await expect(page.locator('#ai-impact-stats')).toContainText('Saved Hours / Month');

  const hasHorizontalOverflow = await page.evaluate(() => {
    const delta = document.documentElement.scrollWidth - window.innerWidth;
    return delta > 2;
  });
  expect(hasHorizontalOverflow).toBeFalsy();

  expect(consoleErrors, `Console errors found: ${consoleErrors.join('\n')}`).toEqual([]);
});
