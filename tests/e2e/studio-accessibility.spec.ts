import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/studio",
  ...[
    "policy-workflow",
    "data-explorer",
    "architecture",
    "interface-lab",
    "locale-inspector",
    "form-workbench",
  ].map((slug) => `/studio/modules/${slug}`),
  "/studio/connect",
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/contact", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const path of routes) {
  test(`accessible semantics, keyboard focus and 320px text reflow: ${path}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
    if (path.includes("/modules/"))
      await expect(
        page.getByRole("button", { name: "Reset demo", exact: true }),
      ).toBeEnabled();
    if (path === "/studio/connect")
      await expect(page.getByLabel("Your name", { exact: true })).toBeEnabled();
    const violations = (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations;
    expect(
      violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content", exact: true }),
    ).toBeFocused();
    expect(
      await page
        .locator(":focus")
        .evaluate((element) => getComputedStyle(element).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#studio-main$/);
    await page.setViewportSize({ width: 320, height: 740 });
    // Text-only zoom: double each element's computed text size without scaling
    // boxes, viewport, or pixels. Reflow must accommodate the larger glyphs.
    await page.evaluate(() => {
      const texts = [
        ...document.querySelectorAll<HTMLElement>("[data-studio-runtime] *"),
      ].filter((element) =>
        [...element.childNodes].some(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        ),
      );
      const sizes = texts.map((element) =>
        parseFloat(getComputedStyle(element).fontSize),
      );
      texts.forEach(
        (element, i) => (element.style.fontSize = `${sizes[i] * 2}px`),
      );
    });
    const clipped = await page
      .locator("[data-studio-runtime]")
      .evaluate((main) => {
        const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        const result: string[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue;
          const parent = node.parentElement!;
          if (
            parent.closest("script, style, table") ||
            getComputedStyle(parent).visibility === "hidden" ||
            getComputedStyle(parent).clipPath === "inset(50%)" ||
            (parent.closest('[aria-hidden="true"]') &&
              !parent.closest('[data-enhanced="true"]'))
          )
            continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (
              rect.width > 0 &&
              (rect.left < -1 || rect.right > innerWidth + 1)
            ) {
              result.push(
                `${parent.tagName}: ${node.textContent.trim().slice(0, 70)} [${rect.left.toFixed(1)}, ${rect.right.toFixed(1)}]`,
              );
              break;
            }
          }
        }
        return result;
      });
    expect(clipped).toEqual([]);
    if (path === "/studio/modules/architecture") {
      const region = page.getByRole("region", {
        name: "Architecture tradeoff table",
        exact: true,
      });
      await expect(region).toHaveAttribute("tabindex", "0");
      await region.focus();
      await expect(region).toBeFocused();
      const start = await region.evaluate((element) => element.scrollLeft);
      for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => region.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(start);
      for (let i = 0; i < 40; i++) {
        if (
          await region.evaluate(
            (element) =>
              element.scrollLeft >=
              element.scrollWidth - element.clientWidth - 1,
          )
        )
          break;
        await page.keyboard.press("ArrowRight", { delay: 25 });
      }
      const lastColumn = page.getByRole("columnheader", {
        name: "Hybrid",
        exact: true,
      });
      // A tall region's native focus can leave its header outside the vertical
      // viewport. Prove horizontal access before arranging vertical reading.
      await expect
        .poll(() =>
          lastColumn.evaluate((element) => {
            const header = element.getBoundingClientRect();
            const region = element
              .closest('[role="region"]')!
              .getBoundingClientRect();
            return (
              header.left >= region.left - 1 && header.right <= region.right + 1
            );
          }),
        )
        .toBe(true);
      for (let i = 0; i < 8; i++) {
        const bounds = await lastColumn.evaluate((element) => ({
          top: element.getBoundingClientRect().top,
          bottom: element.getBoundingClientRect().bottom,
          height: innerHeight,
        }));
        if (bounds.bottom > 0 && bounds.top < bounds.height) break;
        await page.keyboard.press(bounds.top < 0 ? "PageUp" : "PageDown", {
          delay: 50,
        });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              let previous = scrollY;
              let stable = 0;
              const sample = () => {
                stable = Math.abs(scrollY - previous) < 0.5 ? stable + 1 : 0;
                previous = scrollY;
                if (stable >= 6) resolve();
                else requestAnimationFrame(sample);
              };
              requestAnimationFrame(sample);
            }),
        );
      }
      await expect(region).toBeFocused();
      await expect(lastColumn).toBeInViewport();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("forced colors and coarse touch preserve native reading and controls", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.emulateMedia({
    forcedColors: "active",
    reducedMotion: "no-preference",
  });
  await page.goto("/studio/modules/policy-workflow");
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);
  await expect(page.locator("[data-scene-poster]")).toBeVisible();
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Input validated");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await context.newPage();
  await mobile.route("**/api/contact", (route) => route.abort());
  await mobile.emulateMedia({ reducedMotion: "no-preference" });
  await mobile.goto(new URL("/studio", baseURL!).href);
  expect(
    await mobile.evaluate(() => matchMedia("(pointer: coarse)").matches),
  ).toBe(true);
  await expect(mobile.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await expect(mobile.getByRole("heading", { level: 1 })).toBeVisible();
  await mobile.getByRole("button", { name: "Navigation", exact: true }).click();
  await mobile
    .getByRole("navigation", { name: "Mobile Studio navigation", exact: true })
    .getByRole("link", { name: "Capabilities", exact: true })
    .click();
  await expect(mobile.locator("#studio-capabilities")).toBeInViewport();
  await mobile.screenshot({
    path: "output/playwright/studio-verification-mobile.png",
    fullPage: true,
  });
  await context.close();
});

test("enhanced kinetic glyphs reflow with doubled text at 320px", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await page.evaluate(() => {
    const elements = [
      ...document.querySelectorAll<HTMLElement>("[data-kinetic-character]"),
    ];
    const sizes = elements.map((element) =>
      parseFloat(getComputedStyle(element).fontSize),
    );
    elements.forEach(
      (element, i) => (element.style.fontSize = `${sizes[i] * 2}px`),
    );
  });
  for (const heading of await page.locator('[data-enhanced="true"]').all()) {
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toHaveAttribute("data-kinetic-entered", "true");
    // Let the one-shot stagger finish, then measure real visible glyph bounds.
    await page.waitForTimeout(1500);
    expect(
      await heading
        .locator("[data-kinetic-character]")
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.width > 0 && (box.left < -1 || box.right > innerWidth + 1)
              );
            })
            .map((element) => element.textContent),
        ),
    ).toEqual([]);
  }
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 320, height: 320 },
]) {
  test(`shown gallery dialog is centered, bounded and keyboard usable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/studio/modules/interface-lab");
    await page
      .getByRole("button", { name: "Motion & media", exact: true })
      .click();
    await page.getByLabel("Motion sample").selectOption("gallery");
    const opener = page.getByRole("button", {
      name: "Open Layer study",
      exact: true,
    });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const bounds = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        scrollbar: innerWidth - document.documentElement.clientWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      };
    });
    console.log("STUDIO_SHOWN_DIALOG_BOUNDS", JSON.stringify(bounds));
    expect(
      Math.abs(bounds.x + bounds.width / 2 - bounds.viewportWidth / 2),
    ).toBeLessThanOrEqual(2 + bounds.scrollbar / 2);
    expect(
      Math.abs(bounds.y + bounds.height / 2 - bounds.viewportHeight / 2),
    ).toBeLessThanOrEqual(2);
    expect(bounds.width).toBeLessThanOrEqual(bounds.viewportWidth * 0.9 + 1);
    expect(bounds.height).toBeLessThanOrEqual(bounds.viewportHeight * 0.85 + 1);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    if (viewport.height === 320) {
      expect(bounds.overflowY).toBe("auto");
      expect(bounds.scrollHeight).toBeGreaterThan(bounds.clientHeight);
      await dialog.focus();
      await page.keyboard.press("PageDown");
      await expect
        .poll(() => dialog.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
    }
    await dialog
      .getByRole("button", { name: "Close detail", exact: true })
      .focus();
    await page.keyboard.press("Shift+Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
}
