const { test, expect } = require('@playwright/test');

const shots = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

for (const s of shots) {
  test(`Visual snapshot: ${s.name}`, async ({ page }) => {
    await page.setViewportSize({ width: s.width, height: s.height });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page).toHaveScreenshot(`home-${s.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.03
    });

    await page.locator('#mini-tools').scrollIntoViewIfNeeded();
    await expect(page.locator('#mini-tools')).toHaveScreenshot(`mini-tools-${s.name}.png`, {
      maxDiffPixelRatio: 0.03
    });

    await page.locator('#vertical-library').scrollIntoViewIfNeeded();
    await expect(page.locator('#vertical-library')).toHaveScreenshot(`library-${s.name}.png`, {
      maxDiffPixelRatio: 0.03
    });
  });
}

