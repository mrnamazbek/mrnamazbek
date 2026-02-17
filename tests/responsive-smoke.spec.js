const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'phone-320x568', width: 320, height: 568 },
  { name: 'phone-360x800', width: 360, height: 800 },
  { name: 'phone-375x812', width: 375, height: 812 },
  { name: 'phone-412x915', width: 412, height: 915 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 }
];

for (const vp of viewports) {
  test(`Responsive smoke: ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(String(err));
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#site-nav')).toBeVisible();

    // Resume flow: modal opens, scroll locks, nav remains aligned, closes by Escape.
    const navBefore = await page.locator('#site-nav').boundingBox();
    await page.locator('#resume-open').click();
    await expect(page.locator('#resume-modal')).toHaveAttribute('aria-hidden', 'false');

    const modalLocked = await page.evaluate(() => document.body.classList.contains('modal-open'));
    expect(modalLocked).toBeTruthy();

    const navDuring = await page.locator('#site-nav').boundingBox();
    expect(navBefore).not.toBeNull();
    expect(navDuring).not.toBeNull();
    expect(Math.abs(navBefore.x - navDuring.x)).toBeLessThan(2);

    await page.keyboard.press('Escape');
    await expect(page.locator('#resume-modal')).toHaveAttribute('aria-hidden', 'true');
    const modalUnlocked = await page.evaluate(() => document.body.classList.contains('modal-open'));
    expect(modalUnlocked).toBeFalsy();

    // DB ranking: rendered and readable container present.
    await page.locator('#mini-tools').scrollIntoViewIfNeeded();
    await expect(page.locator('#db-ranking .mini-table-shell')).toBeVisible();
    await expect(page.locator('#db-ranking .mini-table__row').first()).toBeVisible();

    // Library section: visible and proportionate at large widths.
    await page.locator('#vertical-library').scrollIntoViewIfNeeded();
    await expect(page.locator('#vertical-library')).toBeVisible();
    if (vp.width >= 1440) {
      const widths = await page.evaluate(() => {
        const list = document.querySelector('.library-list-panel');
        const info = document.querySelector('.library-info-panel');
        return {
          listW: list ? list.getBoundingClientRect().width : 0,
          infoW: info ? info.getBoundingClientRect().width : 0
        };
      });
      expect(widths.listW).toBeGreaterThan(320);
      expect(widths.infoW).toBeGreaterThan(500);
    }

    // No unexpected page-level horizontal overflow.
    const hasHorizontalOverflow = await page.evaluate(() => {
      const delta = document.documentElement.scrollWidth - window.innerWidth;
      return delta > 2;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    // No console/runtime errors.
    expect(consoleErrors, `Console errors found on ${vp.name}: ${consoleErrors.join('\n')}`).toEqual([]);
  });
}

