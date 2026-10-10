import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  // Inspect settled content rather than transient reveal and theme colors.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const path of ["/", "/about", "/projects", "/writing", "/gallery", "/lab", "/library", "/contact"]) {
  test(`essential accessibility checks for ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (path === "/lab") await expect(page.locator("#ai-live-signals-root").getByText("Loading currency and weather signals…", { exact: true })).toHaveCount(0, { timeout: 20_000 });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, impact, nodes }) => ({ id, impact, elements: nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test("mobile navigation exposes accessible controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map(({ id, impact }) => ({ id, impact }))).toEqual([]);
});

test("light palette keeps text and controls accessible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch to light/i }).click();
  for (const path of ["/", "/gallery", "/lab", "/library", "/contact"]) {
    await page.goto(path);
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.evaluate(() => Promise.all(document.getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => {}))));
    // Async weather rows must finish inserting before axe samples text/background colors.
    if (path === "/lab") await expect(page.locator("#ai-live-signals-root").getByText("Loading currency and weather signals…", { exact: true })).toHaveCount(0, { timeout: 20_000 });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, impact, nodes }) => ({ id, impact, elements: nodes.map((node) => node.target) })), path).toEqual([]);
  }
});
