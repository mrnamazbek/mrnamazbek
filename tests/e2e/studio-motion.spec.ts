import { test, expect } from "@playwright/test";
test.use({ reducedMotion: "no-preference" });
test("semantic heading, decorative cursor, stable action edges and tilt spotlight", async ({
  page,
}) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "I engineer systems. I test what should exist next.",
  );
  const cursor = page.locator("[data-studio-cursor]");
  await expect(cursor).toHaveAttribute("aria-hidden", "true");
  expect(
    await page.locator("body").evaluate((el) => getComputedStyle(el).cursor),
  ).not.toBe("none");
  const action = page.getByRole("link", {
    name: "Explore the lab",
    exact: true,
  });
  const before = await action.boundingBox();
  await page.mouse.move(before!.x + 2, before!.y + 2);
  expect(await action.boundingBox()).toEqual(before);
  await action.click({ position: { x: 2, y: 2 } });
  await expect(page).toHaveURL(/#studio-capabilities/);
  const tilt = page.locator("[data-tilt-card]").first();
  await tilt.scrollIntoViewIfNeeded();
  await tilt.hover({ position: { x: 20, y: 20 } });
  const link = page.getByRole("link", { name: "Open Policy Workflow" });
  const linkBounds = await link.boundingBox();
  await tilt.hover({ position: { x: 240, y: 60 } });
  await expect(tilt).toHaveAttribute("data-active", "true");
  expect(await link.boundingBox()).toEqual(linkBounds);
  await link.focus();
  await expect(tilt).toHaveAttribute("data-active", "false");
  await page.mouse.move(2, 2);
  await expect(tilt).toHaveAttribute("data-active", "false");
  await page.screenshot({
    path: "output/playwright/studio-motion-desktop.png",
    fullPage: true,
  });
});
test("static policies preserve semantic text and poster", async ({ page }) => {
  for (const mode of ["reduce", "forced"] as const) {
    await page.emulateMedia(
      mode === "reduce"
        ? { reducedMotion: "reduce" }
        : { reducedMotion: "no-preference", forcedColors: "active" },
    );
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("[data-studio-cursor]")).toHaveCount(0);
    await expect(page.locator("[data-scene-poster]")).toBeVisible();
  }
});

test("profiling positive control and continuous gestures cause no React commits", async ({
  page,
}) => {
  test.skip(
    process.env.STUDIO_PROFILE_BUILD !== "1",
    "Explicit profiling build only; normal release build excludes this hook.",
  );
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const commits = () =>
    page
      .locator("[data-studio-runtime]")
      .evaluate(
        (el) =>
          (el as HTMLElement & { __studioProfiler?: { commits: number } })
            .__studioProfiler?.commits ?? -1,
      );
  await expect.poll(commits).toBeGreaterThan(0);
  await page.waitForTimeout(1200);
  const before = await commits();
  await page.getByRole("button", { name: "Preview Policy Workflow" }).click();
  await expect.poll(commits).toBeGreaterThan(before);
  await page.getByRole("button", { name: "Close preview" }).click();
  await page.waitForTimeout(1000);
  const baseline = await commits();
  for (let i = 0; i < 12; i++) await page.mouse.move(50 + i * 30, 300 + i * 10);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1000);
  await expect
    .poll(() =>
      page
        .getByRole("heading", { level: 1 })
        .evaluate(
          (el) => el.style.getPropertyValue("--heading-skew") || "0deg",
        ),
    )
    .toBe("0deg");
  expect(await commits()).toBe(baseline);
  console.log(
    "STUDIO_PROFILE_COMMIT_PROOF",
    JSON.stringify({
      positiveControl: before,
      baseline,
      afterGestures: await commits(),
    }),
  );
});

test("touch preview keeps native reading and static visuals", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-studio-cursor]")).toHaveCount(0);
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await page.screenshot({
    path: "output/playwright/studio-motion-mobile.png",
    fullPage: true,
  });
  await context.close();
});

test("pointer movement reuses measured card bounds without layout reads", async ({
  page,
}) => {
  await page.goto("/studio");
  const tilt = page.locator("[data-tilt-card]").first();
  await tilt.hover({ position: { x: 40, y: 40 } });
  const box = await tilt.boundingBox();
  await page.evaluate(() => {
    const read = HTMLElement.prototype.getBoundingClientRect;
    const metrics = { reads: 0 };
    Object.assign(window, { __studioBoundsReads: metrics });
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.hasAttribute("data-tilt-card")) metrics.reads++;
      return read.call(this);
    };
  });
  for (let i = 0; i < 10; i++)
    await page.mouse.move(box!.x + 50 + i * 6, box!.y + 60);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __studioBoundsReads: { reads: number } })
          .__studioBoundsReads.reads,
    ),
  ).toBe(0);
});

test("320px kinetic glyphs stay inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(1400);
  await expect(page.locator("[data-kinetic-character]").first()).toBeVisible();
  const overflowing = await page
    .locator("[data-kinetic-character]")
    .evaluateAll((chars) =>
      chars
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
        })
        .map((el) => el.textContent),
    );
  expect(overflowing).toEqual([]);
  await page.screenshot({
    path: "output/playwright/studio-motion-narrow.png",
    fullPage: true,
  });
});
