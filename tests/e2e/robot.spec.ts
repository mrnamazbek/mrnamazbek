import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

// Headless CI has no physical GPU; explicitly enable Chromium's software renderer.
test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

test("the actual robot loads locally, follows the pointer, and can be paused", async ({ page }) => {
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
  const digest = async () => createHash("sha256").update(await canvas.screenshot()).digest("hex");
  await page.mouse.move(20, 180);
  let previous = await digest();
  await page.mouse.move(650, 700);
  await expect.poll(digest, { timeout: 10_000 }).not.toBe(previous);
  await pause.click();
  await expect(page.getByRole("button", { name: "Resume robot animation" })).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(20, 180);
  previous = await digest();
  await page.mouse.move(650, 700);
  expect(await digest()).toBe(previous);
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
