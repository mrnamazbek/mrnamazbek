const { test, expect } = require('@playwright/test');

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`career focus and private workspace link at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const privateRequests = [];
    page.on('request', request => {
      if (request.url().includes('job-hunter-agent-taupe.vercel.app')) privateRequests.push(request.url());
    });
    await page.goto('/#career-dbt');
    await expect(page.locator('#career-dbt')).toBeVisible();
    await expect(page.locator('#career')).toContainText('A clear scope.');
    const workspace = page.getByRole('link', { name: 'Open private workspace' });
    await expect(workspace).toHaveAttribute('href', 'https://job-hunter-agent-taupe.vercel.app/#focus');
    await expect(workspace).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(page.locator('#career .career-card a')).toHaveCount(3);
    expect(privateRequests).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `test-results/career-${viewport.width}.png` });
  });
}
