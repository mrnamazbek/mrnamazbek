import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

// Inspect the actual composited sculpture, not a transform or pointer uniform.
async function glassPixels(page: Page, canvas: Locator) {
  const screenshot = (await canvas.screenshot()).toString("base64");
  return page.evaluate(async png => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const sample = document.createElement("canvas");
    sample.width = 160;
    sample.height = 160;
    const context = sample.getContext("2d")!;
    context.drawImage(image, 0, 0, 160, 160);
    const { data } = context.getImageData(0, 0, 160, 160);
    const pixels: number[] = [];
    let visibleGlass = 0;
    for (let y = 25; y < 135; y++) {
      for (let x = 25; x < 135; x++) {
        const offset = (y * 160 + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        if (red + green + blue < 570 && blue > red * 1.04) visibleGlass++;
        pixels.push((red << 16) | (green << 8) | blue);
      }
    }
    if (visibleGlass < 180) throw new Error("The glass sculpture has no visible optical silhouette");
    return pixels;
  }, screenshot);
}

function difference(first: number[], second: number[]) {
  let changed = 0;
  for (let index = 0; index < first.length; index++) {
    const before = first[index];
    const after = second[index];
    const delta = Math.abs((before >> 16) - (after >> 16))
      + Math.abs(((before >> 8) & 255) - ((after >> 8) & 255))
      + Math.abs((before & 255) - (after & 255));
    if (delta > 30) changed++;
  }
  return changed / first.length;
}

async function settleMotion(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    let count = 75;
    const next = () => {
      if (--count) requestAnimationFrame(next);
      else resolve();
    };
    requestAnimationFrame(next);
  }));
}

for (const width of [1440, 2560]) {
  test(`glass renders visible local geometry and follows the cursor at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 1050 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/v2");
    const stage = page.getByTestId("glass-sculpture");
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute("data-renderer", "webgl", { timeout: 45_000 });
    const canvas = stage.locator("canvas");
    const bounds = (await stage.boundingBox())!;
    const left = { x: bounds.x + bounds.width * 0.13, y: bounds.y + bounds.height * 0.4 };
    const right = { x: bounds.x + bounds.width * 0.87, y: bounds.y + bounds.height * 0.6 };
    await page.mouse.move(left.x, left.y);
    await settleMotion(page);
    let leftPixels: number[] = [];
    await expect(async () => {
      const first = await glassPixels(page, canvas);
      leftPixels = await glassPixels(page, canvas);
      expect(difference(first, leftPixels)).toBeLessThan(0.002);
    }).toPass({ timeout: 30_000 });
    await page.mouse.move(right.x, right.y);
    await settleMotion(page);
    await expect.poll(async () => difference(leftPixels, await glassPixels(page, canvas)), { timeout: 30_000 }).toBeGreaterThan(0.035);
    await page.mouse.move(left.x, left.y);
    await settleMotion(page);
    await expect.poll(async () => difference(leftPixels, await glassPixels(page, canvas)), { timeout: 30_000 }).toBeLessThan(0.004);
    const pause = page.getByRole("button", { name: "Pause glass motion" });
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume glass motion" })).toHaveAttribute("aria-pressed", "true");
    const paused = await glassPixels(page, canvas);
    await page.mouse.move(right.x, right.y);
    await settleMotion(page);
    expect(difference(paused, await glassPixels(page, canvas))).toBeLessThan(0.002);
    expect(errors).toEqual([]);
  });
}

for (const scenario of [{ width: 390, motion: "no-preference" as const }, { width: 1440, motion: "reduce" as const }]) {
  test(`glass has a visible static fallback at ${scenario.width}px with ${scenario.motion}`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: 1000 });
    await page.emulateMedia({ reducedMotion: scenario.motion });
    await page.goto("/v2");
    const stage = page.getByTestId("glass-sculpture");
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute("data-renderer", "static");
    await expect(page.getByTestId("glass-sculpture-fallback")).toBeVisible();
    await expect(stage.locator("canvas")).toHaveCSS("opacity", "0");
    await expect(page.getByRole("button", { name: "Pause glass motion" })).toHaveCount(0);
  });
}

test("GPU failure keeps the original poster visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (args[0] === "webgl2") return null;
      return original.apply(this, args);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/v2");
  const stage = page.getByTestId("glass-sculpture");
  await stage.scrollIntoViewIfNeeded();
  await expect(page.getByTestId("glass-sculpture-fallback")).toBeVisible();
  await expect(stage).toHaveAttribute("data-renderer", "static");
  await expect(page.getByRole("button", { name: "Pause glass motion" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("switching motion preferences releases the glass and restores it on demand", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/v2");
  const stage = page.getByTestId("glass-sculpture");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-renderer", "webgl", { timeout: 45_000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(stage).toHaveAttribute("data-renderer", "static");
  await expect(page.getByTestId("glass-sculpture-fallback")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(stage).toHaveAttribute("data-renderer", "webgl", { timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Pause glass motion" })).toBeVisible();
});
