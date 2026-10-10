import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`career bookmarks and private workspace stay useful at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const privateRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("job-hunter-agent-taupe.vercel.app")) privateRequests.push(request.url());
    });
    await page.goto("/#career-dbt");
    await expect(page).toHaveURL(/\/about#career-dbt$/);
    await expect(page.locator("#career-dbt")).toBeVisible();
    await expect(page.locator("#career")).toContainText("A clear scope.");
    const workspace = page.getByRole("link", { name: "Open private workspace" });
    await expect(workspace).toHaveAttribute("href", "https://job-hunter-agent-taupe.vercel.app/#focus");
    await expect(workspace).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator("#career .career-card a")).toHaveCount(3);
    expect(privateRequests).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
