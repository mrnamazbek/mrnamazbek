import { test, expect } from "@playwright/test";
test("poster precedes enhancement and reduced motion needs no canvas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-scene-poster]")).toBeVisible();
  await expect(page.locator("[data-studio-canvas]")).toHaveCount(0);
});
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
});
test.describe("motion scene", () => {
  test.use({ reducedMotion: "no-preference" });
  test("one persistent canvas, idle stops, neutral route and context recovery", async ({
    page,
  }) => {
    page.on("console", (message) => {
      if (message.type() === "error")
        console.log("SCENE_CONSOLE", message.text().slice(0, 250));
    });
    await page.goto("/studio");
    const canvas = page.locator("canvas[data-studio-canvas]");
    await expect(canvas).toHaveCount(1);
    await canvas.evaluate((el) => {
      el.dataset.testIdentity = "persistent-studio";
    });
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: "output/playwright/studio-foundation-desktop.png",
      fullPage: true,
    });
    const snapshot = await canvas.evaluate(
      (el) =>
        (el as HTMLCanvasElement & { __studioDiagnostics: object })
          .__studioDiagnostics,
    );
    console.log("STUDIO_SOFTWARE_DIAGNOSTICS", JSON.stringify(snapshot));
    const before = await canvas.evaluate(
      (el) =>
        (el as HTMLCanvasElement & { __studioDiagnostics: { frames: number } })
          .__studioDiagnostics.frames,
    );
    await page.waitForTimeout(1100);
    expect(
      await canvas.evaluate(
        (el) =>
          (
            el as HTMLCanvasElement & {
              __studioDiagnostics: { frames: number };
            }
          ).__studioDiagnostics.frames,
      ),
    ).toBe(before);
    await page.getByRole("link", { name: "Open Policy Workflow" }).click();
    await expect
      .poll(() =>
        canvas.evaluate(
          (el) =>
            (
              el as HTMLCanvasElement & {
                __studioDiagnostics: { mode: string };
              }
            ).__studioDiagnostics.mode,
        ),
      )
      .toBe("ambient");
    await expect(canvas).toHaveAttribute(
      "data-test-identity",
      "persistent-studio",
    );
    await page.goBack();
    await page.goForward();
    await expect(canvas).toHaveAttribute(
      "data-test-identity",
      "persistent-studio",
    );
    await expect
      .poll(() =>
        canvas.evaluate(
          (el) =>
            (
              el as HTMLCanvasElement & {
                __studioDiagnostics: { mode: string; progress: number };
              }
            ).__studioDiagnostics,
        ),
      )
      .toMatchObject({ mode: "ambient", progress: 0 });
    const beforePause = await page.evaluate(() => {
      const canvas = document.querySelector(
        "canvas[data-studio-canvas]",
      ) as HTMLCanvasElement & { __studioDiagnostics: { frames: number } };
      const frames = canvas.__studioDiagnostics.frames;
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      return frames;
    });
    await expect(page.locator("[data-scene-policy]")).toHaveAttribute(
      "data-scene-policy",
      "paused",
    );
    // Fiber9.8.2 public frameloop policy blocks new invalidations; one
    // already queued frame may drain. Count it honestly before testing rest.
    await page.waitForTimeout(1000);
    const hiddenFrames = await canvas.evaluate(
      (el) =>
        (el as HTMLCanvasElement & { __studioDiagnostics: { frames: number } })
          .__studioDiagnostics.frames,
    );
    expect(hiddenFrames - beforePause).toBeLessThanOrEqual(1);
    await page
      .getByRole("link", { name: "Back to the lab", exact: true })
      .click();
    await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
      "data-scene-mode",
      "story",
    );
    await page.goBack();
    await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
      "data-scene-mode",
      "ambient",
    );
    await expect(canvas).toHaveAttribute(
      "data-test-identity",
      "persistent-studio",
    );
    for (let i = 0; i < 4; i++) await page.mouse.move(100 + i * 30, 200);
    await page.waitForTimeout(600);
    expect(
      await canvas.evaluate(
        (el) =>
          (
            el as HTMLCanvasElement & {
              __studioDiagnostics: { frames: number };
            }
          ).__studioDiagnostics.frames,
      ),
    ).toBe(hiddenFrames);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(page.locator("[data-scene-policy]")).toHaveAttribute(
      "data-scene-policy",
      "interactive",
    );
    await expect
      .poll(() =>
        canvas.evaluate(
          (el) =>
            (
              el as HTMLCanvasElement & {
                __studioDiagnostics: { frames: number };
              }
            ).__studioDiagnostics.frames,
        ),
      )
      .toBeGreaterThan(hiddenFrames);
    await page.evaluate(() =>
      Object.assign(window, { __studioGpuRetryMarker: "retained" }),
    );
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
    expect(
      await page.evaluate(
        () =>
          (window as typeof window & { __studioGpuRetryMarker: string })
            .__studioGpuRetryMarker,
      ),
    ).toBe("retained");
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

test.describe("scene chunk recovery", () => {
  test.use({ reducedMotion: "no-preference" });
  test("a failed scene import leaves readable content and a working retry", async ({
    page,
  }) => {
    let blocked = 0;
    let blocking = true;
    await page.route("**/_next/static/chunks/*.js", async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes("data-studio-canvas") && blocking) {
        blocked++;
        await route.abort();
        return;
      }
      await route.fulfill({ response, body });
    });
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const retry = page.getByRole("button", { name: /retry.*visual/i });
    await expect(retry).toBeVisible();
    expect(blocked).toBeGreaterThan(0);
    blocking = false;
    await retry.click();
    await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(1);
  });
});

test.describe("background hit testing", () => {
  test.use({ reducedMotion: "no-preference" });
  test("background never captures the center of navigation links", async ({
    page,
  }) => {
    await page.goto("/studio/modules/policy-workflow");
    await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(1);
    const back = page.getByRole("link", {
      name: "Back to the lab",
      exact: true,
    });
    expect(
      await back.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return hit === el || el.contains(hit);
      }),
    ).toBe(true);
    await back.click();
    await expect(page).toHaveURL(/\/studio#studio-capabilities$/);
  });
});
