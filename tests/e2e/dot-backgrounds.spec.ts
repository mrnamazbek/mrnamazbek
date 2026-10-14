import { expect, test, type Page } from "@playwright/test";

// Exercise the real point shaders even on CI machines without a physical GPU.
test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

const effects = ["Magnetic dots", "Flow dots", "Ripple dots"] as const;
const canvasId = "dot-background-canvas";

function runtimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function openControls(page: Page) {
  const choices = page.getByRole("group", { name: "Choose a background", exact: true });
  if (!await choices.isVisible()) {
    await page.getByRole("button", { name: "Background effects", exact: true }).click();
  }
  await expect(choices).toBeVisible();
  return choices;
}

async function advanceFrames(page: Page, count = 45) {
  // Wait for browser frames rather than assuming a GPU frame has composited.
  await page.evaluate(frames => new Promise<void>(resolve => {
    const next = () => {
      if (--frames) requestAnimationFrame(next);
      else resolve();
    };
    requestAnimationFrame(next);
  }), count);
}

type GutterPixels = { near: number[]; far: number[] };

async function gutterPixels(page: Page): Promise<GutterPixels> {
  // At 1920px the 1280px site content leaves these two gutters empty. The
  // samples exclude headings, cards, the open control panel below 400px,
  // and the robot entirely.
  const screenshot = await page.screenshot({ clip: { x: 20, y: 120, width: 1880, height: 280 }, scale: "css" });
  return page.evaluate(async png => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const sample = document.createElement("canvas");
    sample.width = image.width;
    sample.height = image.height;
    const context = sample.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, sample.width, sample.height);
    const readGutter = (start: number) => {
      const pixels: number[] = [];
      // Green-channel samples every two pixels detect the actual green dots
      // without transferring a full uncompressed screenshot to the runner.
      for (let y = 0; y < 280; y += 2) {
        for (let x = start; x < start + 240; x += 2) {
          pixels.push(data[(y * sample.width + x) * 4 + 1]);
        }
      }
      return pixels;
    };
    return { near: readGutter(0), far: readGutter(1640) };
  }, screenshot.toString("base64"));
}

function changedFraction(first: number[], second: number[]) {
  expect(second.length).toBe(first.length);
  return first.filter((value, index) => Math.abs(value - second[index]) >= 5).length / first.length;
}

async function pressPlayback(page: Page, label: string) {
  // Keyboard activation leaves the pointer over the sampled dots. Clicking
  // the control would move the pointer away and obscure the causal check.
  const button = page.getByRole("button", { name: label, exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

for (const effect of effects) {
  test(`${effect} visibly responds near the cursor and its pause freezes actual pixels`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = runtimeErrors(page);
    await page.goto("/about");
    const canvas = page.getByTestId(canvasId);
    await expect(canvas).toHaveAttribute("data-renderer", "webgl", { timeout: 30_000 });
    await expect(canvas).toHaveAttribute("data-state", "running");
    await expect(page.getByTestId("dot-background")).toHaveCSS("pointer-events", "none");
    const choices = await openControls(page);
    await choices.getByRole("radio", { name: effect, exact: true }).check();
    await expect(choices.getByRole("radio", { name: effect, exact: true })).toBeChecked();

    await page.mouse.move(1200, 800);
    await advanceFrames(page);
    const baseline = await gutterPixels(page);
    // A blank canvas or CSS-only fallback cannot pass the motion assertion.
    expect(baseline.near.filter(green => green > 24).length).toBeGreaterThan(30);
    await page.mouse.move(100, 350);
    await advanceFrames(page);
    await expect(async () => {
      const moved = await gutterPixels(page);
      const nearbyChange = changedFraction(baseline.near, moved.near);
      const distantChange = changedFraction(baseline.far, moved.far);
      // Autonomous flow may move distant dots too. The cursor must create a
      // stronger local change, affecting at least 200 physical sample pixels.
      expect(nearbyChange).toBeGreaterThan(0.003);
      expect(nearbyChange).toBeGreaterThan(distantChange * 1.1 + 0.0005);
    }).toPass({ timeout: 30_000 });

    await pressPlayback(page, "Pause background animation");
    await expect(canvas).toHaveAttribute("data-state", "paused");
    // Capture two composited frames so a pending GPU swap cannot masquerade
    // as a response to the following pointer movement while paused.
    let frozen: GutterPixels = { near: [], far: [] };
    await expect(async () => {
      const first = await gutterPixels(page);
      frozen = await gutterPixels(page);
      expect(changedFraction(first.near, frozen.near)).toBeLessThan(0.0001);
      expect(changedFraction(first.far, frozen.far)).toBeLessThan(0.0001);
    }).toPass({ timeout: 20_000 });
    await page.mouse.move(300, 600);
    await advanceFrames(page, 20);
    const paused = await gutterPixels(page);
    expect(changedFraction(frozen.near, paused.near)).toBeLessThan(0.0001);
    expect(changedFraction(frozen.far, paused.far)).toBeLessThan(0.0001);
    await pressPlayback(page, "Resume background animation");
    await expect(canvas).toHaveAttribute("data-state", "running");
    await page.mouse.move(100, 350);
    await advanceFrames(page);
    await page.mouse.move(300, 600);
    await expect.poll(async () => changedFraction(frozen.near, (await gutterPixels(page)).near), { timeout: 20_000 }).toBeGreaterThan(0.002);
    expect(errors).toEqual([]);
  });
}

test("exactly three background choices support keyboard selection and persist across navigation and reload", async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto("/about");
  const trigger = page.getByRole("button", { name: "Background effects", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const choices = page.getByRole("group", { name: "Choose a background", exact: true });
  await expect(choices).toBeVisible();
  await expect(choices.getByRole("radio")).toHaveCount(3);
  await expect(choices.getByRole("radio", { name: "Magnetic dots", exact: true })).toBeChecked();
  const magnetic = choices.getByRole("radio", { name: "Magnetic dots", exact: true });
  await page.keyboard.press("Tab");
  await expect(magnetic).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(choices.getByRole("radio", { name: "Flow dots", exact: true })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(choices.getByRole("radio", { name: "Ripple dots", exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(choices).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(choices.getByRole("radio", { name: "Ripple dots", exact: true })).toBeChecked();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByTestId(canvasId)).toHaveCount(1);
  await expect((await openControls(page)).getByRole("radio", { name: "Ripple dots", exact: true })).toBeChecked();
  await page.reload();
  await expect((await openControls(page)).getByRole("radio", { name: "Ripple dots", exact: true })).toBeChecked();
  await expect(page.getByTestId(canvasId)).toHaveAttribute("data-state", "running", { timeout: 30_000 });
  expect(errors).toEqual([]);
});

for (const scenario of [{ width: 375, motion: "no-preference" as const }, { width: 1920, motion: "reduce" as const }]) {
  test(`${scenario.width}px ${scenario.motion} uses static dots without attempting a GPU context`, async ({ page }) => {
    const errors = runtimeErrors(page);
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await page.emulateMedia({ reducedMotion: scenario.motion });
    await page.addInitScript(() => {
      let attempts = 0;
      Object.defineProperty(window, "__dotGpuAttempts", { get: () => attempts });
      const original = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        value(this: HTMLCanvasElement, contextId: string, ...options: unknown[]) {
          if (this.dataset.testid === "dot-background-canvas" && /^webgl/.test(contextId)) attempts++;
          return Reflect.apply(original, this, [contextId, ...options]);
        },
      });
    });
    await page.goto("/about");
    await expect(page.getByTestId(canvasId)).toHaveAttribute("data-state", "static");
    const choices = await openControls(page);
    await expect(choices.getByRole("radio")).toHaveCount(3);
    await choices.getByRole("radio", { name: "Flow dots", exact: true }).check();
    await expect(choices.getByRole("radio", { name: "Flow dots", exact: true })).toBeChecked();
    expect(await page.evaluate(() => (window as unknown as { __dotGpuAttempts: number }).__dotGpuAttempts)).toBe(0);
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("unavailable WebGL keeps the static background, choices, and navigation usable", async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, contextId: string, ...options: unknown[]) {
        if (this.dataset.testid === "dot-background-canvas" && /^webgl/.test(contextId)) return null;
        return Reflect.apply(original, this, [contextId, ...options]);
      },
    });
  });
  await page.goto("/about");
  await expect(page.getByTestId(canvasId)).toHaveAttribute("data-state", "unavailable", { timeout: 30_000 });
  await (await openControls(page)).getByRole("radio", { name: "Ripple dots", exact: true }).check();
  await expect(page.getByRole("radio", { name: "Ripple dots", exact: true })).toBeChecked();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("changing motion preference stops and reactivates the shader without changing its selection", async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto("/about");
  const canvas = page.getByTestId(canvasId);
  await expect(canvas).toHaveAttribute("data-state", "running", { timeout: 30_000 });
  await (await openControls(page)).getByRole("radio", { name: "Flow dots", exact: true }).check();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-state", "static");
  await expect(page.getByRole("radio", { name: "Flow dots", exact: true })).toBeChecked();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-state", "running", { timeout: 30_000 });
  await expect(page.getByRole("radio", { name: "Flow dots", exact: true })).toBeChecked();
  await expect(canvas).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("background and robot playback controls operate independently", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = runtimeErrors(page);
  await page.goto("/");
  const canvas = page.getByTestId(canvasId);
  await expect(canvas).toHaveAttribute("data-state", "running", { timeout: 30_000 });
  const pauseRobot = page.getByRole("button", { name: "Pause robot animation", exact: true });
  await expect(pauseRobot).toBeVisible({ timeout: 45_000 });
  await openControls(page);
  await pressPlayback(page, "Pause background animation");
  await expect(canvas).toHaveAttribute("data-state", "paused");
  await expect(pauseRobot).toHaveAttribute("aria-pressed", "false");
  await pauseRobot.click();
  const resumeRobot = page.getByRole("button", { name: "Resume robot animation", exact: true });
  await expect(resumeRobot).toHaveAttribute("aria-pressed", "true");
  await openControls(page);
  await pressPlayback(page, "Resume background animation");
  await expect(canvas).toHaveAttribute("data-state", "running");
  await expect(resumeRobot).toHaveAttribute("aria-pressed", "true");
  await pressPlayback(page, "Pause background animation");
  await resumeRobot.click();
  await expect(pauseRobot).toHaveAttribute("aria-pressed", "false");
  await expect(canvas).toHaveAttribute("data-state", "paused");
  expect(errors).toEqual([]);
});
