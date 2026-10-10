import { expect, test } from "@playwright/test";

for (const width of [375, 1440]) {
  test(`selected-project explorer switches real links and supports keyboard navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/projects");
    const showcase = page.locator("[data-project-showcase]");
    const tabs = showcase.getByRole("tab");
    const panel = showcase.getByRole("tabpanel");
    await expect(tabs).toHaveCount(4);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await expect(panel.getByRole("heading")).toHaveText("developer lab");
    await expect(panel.getByRole("link", { name: "View repository" })).toHaveAttribute("href", "https://github.com/mrnamazbek/developer-lab");

    await tabs.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(panel.getByRole("heading")).toHaveText("untverse");
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tabs.first()).toBeFocused();

    await showcase.getByRole("tab", { name: /ddc nbk website/ }).click();
    await expect(panel.getByRole("heading")).toHaveText("ddc nbk website");
    await expect(panel.getByRole("link", { name: "View repository" })).toHaveAttribute("href", "https://github.com/mrnamazbek/ddc-nbk-website");
    await expect(panel.getByRole("link", { name: "Visit project" })).toHaveAttribute("href", "https://ddcnbsite.vercel.app");
    await expect(panel.locator("[data-project-drawing]")).toHaveCSS("animation-name", "none");

    await showcase.getByRole("link", { name: "All repositories" }).click();
    await expect(page).toHaveURL(/#repository-index$/);
    await expect(page.getByRole("searchbox", { name: "Search projects" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
    expect(errors).toEqual([]);
  });
}

test("desktop project hover gives the same preview as keyboard selection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projects");
  const showcase = page.locator("[data-project-showcase]");
  const ddc = showcase.getByRole("tab", { name: /ddc nbk website/ });
  await ddc.hover();
  await expect(ddc).toHaveAttribute("aria-selected", "true");
  await expect(showcase.getByRole("tabpanel").getByRole("heading")).toHaveText("ddc nbk website");
});
