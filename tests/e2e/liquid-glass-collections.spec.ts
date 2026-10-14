import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Liquid Glass project search and language filters use the shared project collection", async ({ page }) => {
  await page.goto("/v2/projects");
  const cards = page.getByTestId("v2-project-card");
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  const firstTitle = (await cards.first().getByRole("heading", { level: 2 }).innerText()).trim();
  await page.getByRole("searchbox", { name: "Search projects" }).fill(firstTitle.split(/\s+/).find((word) => word.length > 2) ?? firstTitle);
  expect(await cards.count()).toBeLessThanOrEqual(count);
  await expect(cards.first()).toBeVisible();
  await page.getByRole("searchbox", { name: "Search projects" }).fill("no-collection-project-742b");
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No projects match that search." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(cards).toHaveCount(count);
  const filters = page.getByRole("group", { name: "Filter projects by language" }).getByRole("button");
  if (await filters.count() > 1) {
    const language = (await filters.nth(1).innerText()).trim();
    await filters.nth(1).click();
    await expect(filters.nth(1)).toHaveAttribute("aria-pressed", "true");
    for (const card of await cards.all()) await expect(card).toHaveAttribute("data-language", language);
  }
});

test("Liquid Glass library preserves reading filters and native expandable book details", async ({ page }) => {
  await page.goto("/v2/library");
  const cards = page.getByTestId("v2-book-card");
  await expect(cards.first()).toBeVisible();
  const title = (await cards.first().getByRole("heading", { level: 2 }).innerText()).trim();
  await page.getByRole("searchbox", { name: "Search the bookshelf" }).fill(title);
  await expect(cards).toHaveCount(1);
  await cards.first().locator("summary").click();
  await expect(cards.first().getByRole("link", { name: "Book details" })).toHaveAttribute("href", /^https:\/\/openlibrary.org\/isbn\//);
  await page.getByRole("searchbox", { name: "Search the bookshelf" }).fill("no-collection-book-742b");
  await expect(cards).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(page.getByRole("button", { name: "Completed", exact: true })).toHaveAttribute("aria-pressed", "true");
  for (const card of await cards.all()) await expect(card).toHaveAttribute("data-reading-status", "completed");
});

test("Liquid Glass writing search opens the full shared article within V2", async ({ page }) => {
  await page.goto("/v2/writing");
  const cards = page.getByTestId("v2-writing-card");
  await expect(cards.first()).toBeVisible();
  const title = (await cards.first().getByRole("heading", { level: 2 }).innerText()).trim();
  await page.getByRole("searchbox", { name: "Search writing" }).fill("no-collection-note-742b");
  await expect(cards).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search" }).click();
  await cards.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/v2\/writing\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  expect((await page.getByTestId("v2-article-body").innerText()).length).toBeGreaterThan(300);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/writing\/[^/]+$/);
  await expect(page.getByRole("link", { name: "All writing" })).toHaveAttribute("href", "/v2/writing");
  await page.getByRole("link", { name: "All writing" }).click();
  await expect(page).toHaveURL(/\/v2\/writing$/);
});

for (const width of [375, 1440]) {
  test(`Liquid Glass gallery keeps working native lightbox and keyboard focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/v2/gallery");
    if (width === 1440) await page.getByRole("button", { name: "Switch to dark theme" }).click();
    const photographs = page.getByRole("link", { name: /^Enlarge photograph:/ });
    await expect(photographs).toHaveCount(4);
    const first = photographs.first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close photograph" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "View next photograph" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("heading")).toHaveText("In black and white");
    await expect(dialog.locator("img")).toHaveJSProperty("complete", true);
    expect(await dialog.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) }))).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(first).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    const rail = page.getByRole("region", { name: /^Personal photographs/ });
    await rail.focus();
    await page.keyboard.press("End");
    await expect(page.locator("[data-gallery] [aria-live]")).toHaveText("04 / 04");
    await expect(page.getByRole("link", { name: "Read my story" })).toHaveAttribute("href", "/v2/about");
  });
}

for (const width of [320, 1440]) {
  test(`Liquid Glass collection pages fit ${width}px and preserve accessible content`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/v2/projects", "/v2/writing", "/v2/library", "/v2/gallery"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
      expect(dimensions.content, path).toBeLessThanOrEqual(dimensions.viewport + 1);
      for (const theme of ["light", "dark"] as const) {
        if (theme === "dark") await page.getByRole("button", { name: "Switch to dark theme" }).click();
        await expect(page.locator('[data-portfolio-version="liquid-glass"]')).toHaveAttribute("data-glass-theme", theme);
        await page.evaluate(() => Promise.all(document.getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {}))));
        const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(accessibility.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) })), `${path} in ${theme}`).toEqual([]);
      }
      await page.getByRole("button", { name: "Switch to light theme" }).click();
    }
    expect(errors).toEqual([]);
  });
}

test("Liquid Glass collections remain complete and navigable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/v2/projects`);
  await expect(page.getByTestId("v2-project-card").first()).toBeVisible();
  await page.goto(`${baseURL}/v2/library`);
  const book = page.getByTestId("v2-book-card").first();
  await book.locator("summary").click();
  await expect(book.getByRole("link", { name: "Book details" })).toBeVisible();
  await page.goto(`${baseURL}/v2/writing`);
  await page.getByTestId("v2-writing-card").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/v2\/writing\/[^/]+$/);
  await expect(page.getByTestId("v2-article-body")).toBeVisible();
  await page.goto(`${baseURL}/v2/gallery`);
  await page.getByRole("link", { name: /^Enlarge photograph:/ }).first().click();
  await expect(page).toHaveURL(/\/assets\/gallery\/portrait-blue.webp$/);
  await context.close();
});
