import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const platform of ["GitHub", "LinkedIn", "Telegram"]) {
  test(`${platform} footer preview stays hoverable and closes with Escape`, async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("contentinfo").getByRole("link", { name: platform, exact: true });
    await trigger.hover();
    const card = page.getByRole("tooltip", { name: `${platform} profile preview` });
    await expect(card).toBeVisible();
    await expect(card).toContainText(platform === "Telegram" ? "@tech_digest_kz" : "Namazbek Bekzhanov");
    const description = await trigger.getAttribute("aria-describedby");
    expect(description).toBe(await card.getAttribute("id"));
    const bounds = await card.boundingBox();
    const viewport = page.viewportSize()!;
    expect(bounds!.x).toBeGreaterThanOrEqual(10);
    expect(bounds!.y).toBeGreaterThanOrEqual(10);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width - 10);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height - 10);
    await card.hover();
    // Let the close delay elapse to detect a card that disappears during transfer.
    await page.waitForTimeout(250);
    await expect(card).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute("aria-describedby");
  });
}

test("keyboard focus previews a profile without trapping focus or breaking Enter", async ({ page, context }) => {
  await context.route("https://linkedin.com/**", (route) => route.fulfill({ body: "Public profile destination" }));
  await page.goto("/contact");
  const trigger = page.getByRole("main").getByRole("link", { name: "LinkedIn", exact: true });
  await trigger.focus();
  const card = page.getByRole("tooltip", { name: "LinkedIn profile preview" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Software Engineer · Data Engineer · Python Developer");
  await trigger.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(card).toHaveCount(0);
  await trigger.press("Tab");
  await expect(page.getByRole("main").getByRole("link", { name: "Telegram channel", exact: true })).toBeFocused();
  await trigger.focus();
  const popup = context.waitForEvent("page");
  await trigger.press("Enter");
  const destination = await popup;
  await expect(destination).toHaveURL("https://linkedin.com/in/namazbek-bekzhanov");
  await destination.close();
});

test("moving between focused and hovered profiles shows only one preview", async ({ page }) => {
  await page.goto("/contact");
  const links = page.getByRole("main");
  await links.getByRole("link", { name: "LinkedIn", exact: true }).focus();
  await expect(page.getByRole("tooltip", { name: "LinkedIn profile preview" })).toBeVisible();
  await links.getByRole("link", { name: "GitHub", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "GitHub profile preview" })).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(1);
});

test("touch previews fit a narrow viewport, dismiss outside, and open on a second tap", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 700 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await context.route("https://github.com/mrnamazbek", (route) => route.fulfill({ body: "Public profile destination" }));
    await page.goto("/contact");
    const trigger = page.getByRole("main").getByRole("link", { name: "GitHub", exact: true });
    await trigger.tap();
    const card = page.getByRole("tooltip", { name: "GitHub profile preview" });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Tap the link again to open");
    expect(context.pages()).toHaveLength(1);
    const bounds = await card.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(10);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(310);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(690);
    await page.touchscreen.tap(5, 5);
    await expect(card).toHaveCount(0);
    await trigger.tap();
    await expect(card).toBeVisible();
    const popup = context.waitForEvent("page");
    await trigger.tap();
    await expect(await popup).toHaveURL("https://github.com/mrnamazbek");
  } finally {
    await context.close();
  }
});

for (const theme of ["dark", "light"]) {
  test(`profile preview is accessible in the ${theme} theme without third-party requests`, async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (/linkedin\.com|githubusercontent\.com|telesco\.pe|t\.me\//.test(request.url())) external.push(request.url());
    });
    await page.goto("/contact");
    if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
    const trigger = page.getByRole("main").getByRole("link", { name: "LinkedIn", exact: true });
    // Audit the visible card after scrolling, so axe samples its settled background.
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const card = page.getByRole("tooltip", { name: "LinkedIn profile preview" });
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("opacity", "1");
    const results = await new AxeBuilder({ page }).include('[role="tooltip"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, nodes }))).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("page-specific social profile links share the same preview", async ({ page }) => {
  for (const [path, linkName, platform] of [
    ["/about", "LinkedIn", "LinkedIn"],
    ["/projects", "Follow the work on GitHub", "GitHub"],
    ["/writing", "Read on Telegram", "Telegram"],
  ]) {
    await page.goto(path);
    await page.getByRole("main").getByRole("link", { name: linkName, exact: true }).hover();
    await expect(page.getByRole("tooltip", { name: `${platform} profile preview` })).toBeVisible();
  }
});
