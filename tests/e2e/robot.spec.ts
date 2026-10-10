import { expect, test, type Locator, type Page } from "@playwright/test";

// Headless CI has no physical GPU; explicitly enable Chromium's software renderer.
test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

// Measure the rendered green body, excluding the animated face and dark backdrop.
// A changed texture or one antialiased pixel cannot masquerade as cursor tracking.
async function bodyCenter(page: Page, canvas: Locator) {
  const screenshot = (await canvas.screenshot()).toString("base64");
  return page.evaluate(async (png) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const sample = document.createElement("canvas");
    sample.width = image.width;
    sample.height = image.height;
    const context = sample.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, sample.width, sample.height);
    let count = 0;
    let sum = 0;
    for (let y = Math.floor(sample.height * 0.35); y < sample.height * 0.9; y++) {
      for (let x = 0; x < sample.width; x++) {
        const index = (y * sample.width + x) * 4;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        if (green > 70 && green > red * 1.45 && green > blue * 1.25) {
          count++;
          sum += x;
        }
      }
    }
    if (count < 400) throw new Error("The rendered robot body is missing");
    return sum / count / sample.width;
  }, screenshot);
}

for (const width of [1440, 2560]) {
  test(`cursor tracking moves the robot geometry at ${width}px and returns to the same pose`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause robot animation" })).toBeVisible({ timeout: 45_000 });
    // Isolate model motion from the separate decorative card tilt.
    await page.locator(".data-sculpture").evaluate(stage => {
      const depth = stage.parentElement!.parentElement!;
      depth.style.setProperty("transform", "none", "important");
      depth.style.setProperty("transition", "none", "important");
    });
    const canvas = page.locator(".data-sculpture canvas");
    await expect(canvas).toHaveCSS("opacity", "1");
    const bounds = (await canvas.boundingBox())!;
    const left = { x: bounds.x + bounds.width * 0.1, y: bounds.y + bounds.height * 0.5 };
    const right = { x: bounds.x + bounds.width * 0.9, y: left.y };
    await page.mouse.move(left.x, left.y);
    // Wait for the spring to settle, then compare substantial silhouette movement.
    await expect(async () => {
      const first = await bodyCenter(page, canvas);
      expect(Math.abs(await bodyCenter(page, canvas) - first)).toBeLessThan(0.002);
    }).toPass();
    const leftCenter = await bodyCenter(page, canvas);
    await page.mouse.move(right.x, right.y);
    await expect.poll(async () => Math.abs(await bodyCenter(page, canvas) - leftCenter)).toBeGreaterThan(0.008);
    await page.mouse.move(left.x, left.y);
    await expect.poll(async () => Math.abs(await bodyCenter(page, canvas) - leftCenter)).toBeLessThan(0.003);
    await page.getByRole("button", { name: "Pause robot animation" }).click();
    const pausedCenter = await bodyCenter(page, canvas);
    await page.mouse.move(right.x, right.y);
    expect(Math.abs(await bodyCenter(page, canvas) - pausedCenter)).toBeLessThan(0.002);
  });
}

test("the actual robot loads locally, supports playback controls, and respects motion preferences", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  const sceneRequests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => { if (/\.splinecode|\.wasm/.test(request.url())) sceneRequests.push(request.url()); });
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pause robot animation" });
  await expect(pause).toBeVisible({ timeout: 45_000 });
  const canvas = page.locator(".data-sculpture canvas");
  expect(Number(await canvas.getAttribute("width"))).toBeGreaterThan(200);
  expect(sceneRequests.some(url => url.endsWith("ddcnb-robot.splinecode"))).toBe(true);
  expect(sceneRequests.every(url => new URL(url).hostname === "127.0.0.1")).toBe(true);
  await pause.click();
  await expect(page.getByRole("button", { name: "Resume robot animation" })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Resume robot animation" }).click();
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await expect(pause).toHaveCount(0);
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(errors).toEqual([]);
});

for (const scenario of [{ width: 375, motion: "no-preference" as const }, { width: 1440, motion: "reduce" as const }]) {
  test(`the ${scenario.width}px ${scenario.motion} fallback never downloads the scene or decoders`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await page.emulateMedia({ reducedMotion: scenario.motion });
    const heavy: string[] = [];
    page.on("request", request => { if (/\.splinecode|\.wasm/.test(request.url())) heavy.push(request.url()); });
    await page.goto("/");
    const poster = page.locator(".sculpture-fallback");
    await expect(poster).toBeVisible();
    await expect(poster.locator("img").first()).toBeVisible();
    await expect.poll(() => poster.locator("img").first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Pause robot animation" })).toHaveCount(0);
    await page.getByRole("link", { name: "Explore my work" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    expect(heavy).toEqual([]);
  });
}

test("a failed scene download leaves the real poster and navigation intact", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/ddcnb-robot.splinecode", route => route.fulfill({ status: 200, body: "invalid scene" }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const download = page.waitForResponse("**/ddcnb-robot.splinecode");
  await page.goto("/");
  await download;
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(errors).toEqual([]);
});


test("the robot activates when a desktop visitor enables motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByRole("button", { name: "Pause robot animation" })).toBeVisible({ timeout: 45_000 });
});
