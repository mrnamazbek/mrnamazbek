import { expect, test, type Page } from "@playwright/test";

async function desktopMotion(page: Page, path = "/about") {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
}

async function settleNativeScroll(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    let previous = window.scrollY;
    let stableFrames = 0;
    const sample = () => {
      stableFrames = Math.abs(window.scrollY - previous) < 1 ? stableFrames + 1 : 0;
      previous = window.scrollY;
      if (stableFrames >= 8) resolve();
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
}

test("desktop wheel settles smoothly while keyboard, anchors, and live reduced motion stay native", async ({ page }) => {
  await desktopMotion(page);
  await page.evaluate(() => {
    const samples: number[] = [];
    window.addEventListener("scroll", () => samples.push(window.scrollY), { passive: true });
    Object.assign(window, { scrollSamples: samples });
  });
  await page.mouse.move(12, 400);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(640);
  await expect(page.locator("html")).not.toHaveClass(/\blenis-smooth\b/);
  const samples = await page.evaluate(() => (window as typeof window & { scrollSamples: number[] }).scrollSamples);
  expect(samples.filter(value => value > 0 && value < 640).length).toBeGreaterThan(3);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(655);

  await page.keyboard.press("PageDown");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(900);
  await expect(page.locator("html")).not.toHaveClass(/\blenis-stopped\b/);

  // Browser focus scrolling (including validation) wins over wheel inertia.
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Native focus target");
    input.style.cssText = "display:block;margin:24px";
    document.body.append(input);
  });
  await page.mouse.move(12, 400);
  await page.mouse.wheel(0, 180);
  await expect(page.locator("html")).toHaveClass(/\blenis-smooth\b/);
  const focusTarget = page.getByRole("textbox", { name: "Native focus target" });
  await focusTarget.evaluate(input => (input as HTMLInputElement).focus());
  await expect(focusTarget).toBeFocused();
  await settleNativeScroll(page);
  await expect(focusTarget).toBeInViewport({ ratio: 1 });
  await focusTarget.evaluate(input => input.remove());
  await page.evaluate(() => window.scrollTo({ top: 650, behavior: "instant" }));
  await settleNativeScroll(page);

  // A native fragment updates the URL and reaches its target during wheel inertia.
  await page.mouse.wheel(0, -250);
  await page.evaluate(() => {
    const anchor = document.createElement("a");
    anchor.href = "#main-content";
    anchor.textContent = "Return to main content";
    anchor.style.cssText = "position:fixed;right:24px;top:100px;z-index:1000";
    document.body.append(anchor);
  });
  await page.getByRole("link", { name: "Return to main content" }).click();
  await expect(page).toHaveURL(/#main-content$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(140);
  await settleNativeScroll(page);
  await page.getByRole("link", { name: "Return to main content" }).evaluate(link => link.remove());

  // Native keyboard scrolling leaves Lenis's 400ms velocity cleanup pending.
  await page.keyboard.press("PageDown");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await page.waitForTimeout(500);
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(12, 400);
  await page.mouse.wheel(0, 450);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 400);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
});

test("client navigation and browser history preserve the browser scroll position", async ({ page }) => {
  await desktopMotion(page);
  const homeLink = page.locator(".footer-wordmark");
  await homeLink.scrollIntoViewIfNeeded();
  await settleNativeScroll(page);
  const previousPosition = await page.evaluate(() => window.scrollY);
  expect(previousPosition).toBeGreaterThan(900);
  await homeLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(140);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - previousPosition)).toBeLessThan(10);

  // Navigating during wheel inertia must not carry its old target to the new page.
  await page.mouse.move(12, 600);
  await page.mouse.wheel(0, -40);
  await expect(page.locator("html")).toHaveClass(/\blenis-smooth\b/);
  await homeLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(140);
  await settleNativeScroll(page);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(140);
  await page.keyboard.press("Home");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test("gallery keeps its native horizontal rail and locks the page while a photograph is open", async ({ page }) => {
  await desktopMotion(page, "/gallery");
  const rail = page.getByRole("region", { name: /^Personal photographs/ });
  await rail.scrollIntoViewIfNeeded();
  await settleNativeScroll(page);
  const position = await rail.boundingBox();
  expect(position).not.toBeNull();
  await page.mouse.move(position!.x + 100, position!.y + 120);
  await page.mouse.wheel(550, 0);
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(200);
  await rail.focus();
  await page.keyboard.press("Home");
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeLessThan(5);
  await settleNativeScroll(page);
  await page.evaluate(() => window.scrollBy({ top: window.scrollY > 20 ? -20 : 20, behavior: "instant" }));
  await expect(page.locator("html")).toHaveClass(/\blenis-scrolling\b/);
  const first = page.getByRole("link", { name: /^Enlarge photograph:/ }).first();
  await first.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  // A destroyed instance cannot restore its classes when the native timer fires.
  await page.waitForTimeout(500);
  await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  await settleNativeScroll(page);
  const lockedPosition = await page.evaluate(() => window.scrollY);
  const dialogPosition = await dialog.boundingBox();
  expect(dialogPosition).not.toBeNull();
  await page.mouse.move(dialogPosition!.x + 80, dialogPosition!.y + 80);
  await page.mouse.wheel(0, 600);
  expect(await page.evaluate(() => window.scrollY)).toBe(lockedPosition);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(first).toBeFocused();
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await rail.focus();
  await page.keyboard.press("End");
  await expect(page.locator("[data-gallery] p[aria-live]")).toHaveText("04 / 04");
});

test("coarse pointer devices retain native scrolling with motion allowed", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/about`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await page.mouse.move(12, 400);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(450);
  } finally {
    await context.close();
  }
});
