const { test, expect } = require("@playwright/test");
test("poster precedes enhancement and reduced motion needs no canvas", async ({
  page,
}) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-scene-poster]")).toBeVisible();
  await expect(page.locator("[data-studio-canvas]")).toHaveCount(0);
});
test.describe("motion scene", () => {
  test.use({ reducedMotion: "no-preference" });
  test("one persistent canvas, idle stops, neutral route and context recovery", async ({
    page,
  }) => {
    await page.goto("/studio");
    const canvas = page.locator("canvas[data-studio-canvas]");
    await expect(canvas).toHaveCount(1);
    await page.waitForTimeout(1400);
    const before = await canvas.getAttribute("data-frames");
    await page.waitForTimeout(1100);
    expect(await canvas.getAttribute("data-frames")).toBe(before);
    await page.getByRole("link", { name: "Open Policy Workflow" }).click();
    await expect(canvas).toHaveAttribute("data-mode", "ambient");
    await canvas.evaluate((el) =>
      el.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true, bubbles: true }),
      ),
    );
    await expect(
      page.getByRole("button", { name: "Retry visual" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Retry visual" }).click();
    await expect(canvas).toHaveCount(1);
  });
  test("denied WebGL keeps the poster", async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto("/studio");
    await expect(page.locator("[data-scene-policy]")).toHaveAttribute(
      "data-scene-policy",
      "poster",
    );
    await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  });
});
