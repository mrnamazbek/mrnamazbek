import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 1440]) {
  test(`gallery navigation, enlargement and focus work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/gallery");
    const photos = page.getByRole("link", { name: /^Enlarge photograph:/ });
    await expect(photos).toHaveCount(4);
    const first = photos.first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toHaveText("A little about me");
    await expect(dialog.getByRole("button", { name: "Close photograph" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "View next photograph" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("heading")).toHaveText("In black and white");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByRole("heading")).toHaveText("A little about me");
    await expect(dialog.locator("img")).toHaveJSProperty("complete", true);
    const imageWidth = await dialog.locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth);
    expect(imageWidth).toBeGreaterThan(0);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, impact }) => ({ id, impact }))).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(first).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    const counter = page.locator("[data-gallery] [aria-live]");
    await page.getByRole("button", { name: "Next photograph", exact: true }).click();
    await expect(counter).not.toHaveText("01 / 04");
    const rail = page.getByRole("region", { name: /^Personal photographs/ });
    await rail.focus();
    await page.keyboard.press("End");
    await expect(counter).toHaveText("04 / 04");
    await page.keyboard.press("Home");
    await expect(counter).toHaveText("01 / 04");
    expect(errors).toEqual([]);
  });
}

test("photos and mobile navigation remain usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/gallery");
  const photo = page.getByRole("link", { name: /^Enlarge photograph:/ }).first();
  await expect(photo).toBeVisible();
  await photo.click();
  await expect(page).toHaveURL(/\/assets\/gallery\/portrait-blue.webp$/);
  await page.goBack();
  await page.getByRole("navigation", { name: "Navigation without JavaScript" }).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await context.close();
});
