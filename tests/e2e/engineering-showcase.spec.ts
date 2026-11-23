import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("the work index supports keyboard selection and opens real case studies", async ({ page }) => {
  await page.goto("/");
  const work = page.getByRole("region", { name: "Selected work", exact: true });
  const data = work.getByRole("tab", { name: /Steam data pipeline/ });
  const software = work.getByRole("tab", { name: /UNTverse learning platform/ });
  const ai = work.getByRole("tab", { name: /Gemini workflow suite/ });
  await data.focus();
  await page.keyboard.press("ArrowDown");
  await expect(software).toBeFocused();
  await expect(software).toHaveAttribute("aria-selected", "true");
  await ai.hover();
  await expect(ai).toHaveAttribute("aria-selected", "true");
  await ai.focus();
  await page.keyboard.press("Tab");
  const panel = work.getByRole("tabpanel");
  await expect(panel).toBeFocused();
  await software.hover();
  await expect(ai).toHaveAttribute("aria-selected", "true");
  await panel.getByRole("link", { name: "Read case study" }).click();
  await expect(page).toHaveURL(/\/projects\/gemini-workflow-suite$/);
  await expect(page.getByRole("heading", { level: 1, name: "Gemini workflow suite" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View source" })).toHaveAttribute("href", "https://github.com/mrnamazbek/gmail-drive-ai-suite");
  await expect(page.getByRole("link", { name: "Discuss a similar project" })).toHaveAttribute("href", "/#start-a-project");
  await page.getByRole("link", { name: /Next case study Steam data pipeline/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Steam data pipeline" })).toBeVisible();
});

test("the reel opens muted, supports chapter selection, and returns focus when dismissed", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("link", { name: /Engineering reel/ });
  await trigger.focus();
  await trigger.press("Enter");
  const reel = page.getByRole("dialog", { name: "Engineering reel" });
  await expect(reel).toBeVisible();
  await expect(reel.getByRole("heading", { name: "Steam data pipeline" })).toBeVisible();
  await expect(reel.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(reel.getByRole("button", { name: "Reel sound" })).toHaveAttribute("aria-pressed", "false");
  await reel.getByRole("button", { name: "AI engineering" }).click();
  await expect(reel.getByRole("heading", { name: "Gemini workflow suite" })).toBeVisible();
  await expect(reel.getByRole("list", { name: "Technology stack" })).toContainText("Google Apps Script");
  await expect(reel.getByRole("link", { name: "Read case study" })).toHaveAttribute("href", "/projects/gemini-workflow-suite");
  await page.keyboard.press("Escape");
  await expect(reel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(reel).toBeVisible();
  await page.mouse.click(1, 1);
  await expect(reel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("reel playback keeps elapsed time and pauses on its case-study link", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("link", { name: /Engineering reel/ }).click();
  const reel = page.getByRole("dialog", { name: "Engineering reel" });
  const chapters = reel.getByRole("group", { name: "Reel chapters" });
  const play = reel.getByRole("button", { name: "Play", exact: true });
  await play.click();
  await page.clock.fastForward(3100);
  await reel.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.fastForward(6000);
  await expect(chapters.getByRole("button", { name: "Data engineering" })).toHaveAttribute("aria-pressed", "true");
  await play.click();
  await page.clock.fastForward(1850);
  await expect(chapters.getByRole("button", { name: "Software engineering" })).toHaveAttribute("aria-pressed", "true");
  const link = reel.getByRole("link", { name: "Read case study" });
  await link.focus();
  await expect(play).toBeVisible();
  await page.clock.fastForward(6000);
  await expect(link).toHaveAttribute("href", "/projects/untverse");
});

test("the readiness check makes track-specific recommendations at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/#readiness-check");
  const check = page.getByRole("region", { name: "What’s ready to ship?" });
  await check.getByLabel("System type").selectOption("ai");
  await check.getByRole("checkbox", { name: "Invalid model output is caught" }).check();
  await check.getByRole("button", { name: "Review readiness" }).click();
  await expect(check.getByRole("heading", { name: "1 of 3 practices confirmed" })).toBeVisible();
  await expect(check.getByText(/Collect a small evaluation set/)).toBeVisible();
  await expect(check.getByText(/Validate the output schema/)).toHaveCount(0);
  await expect(check.getByRole("link", { name: "Case study: Gemini workflow suite" })).toHaveAttribute("href", "/projects/gemini-workflow-suite");
  await check.getByLabel("System type").selectOption("data");
  await expect(check.getByRole("heading", { name: /practices confirmed/ })).toHaveCount(0);
  await check.getByRole("button", { name: "Review readiness" }).click();
  await expect(check.getByText(/Replay a small date range/)).toBeVisible();
  const pageWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport + 1);
});

test("project index and published build logs link directly to case studies", async ({ page }) => {
  await page.goto("/projects");
  const cases = page.getByRole("navigation", { name: "Engineering case studies" });
  await expect(cases.getByRole("link")).toHaveCount(3);
  await cases.getByRole("link", { name: "UNTverse learning platform" }).click();
  await expect(page).toHaveURL(/\/projects\/untverse$/);
  await page.goto("/#build-logs");
  const log = page.locator("#build-logs .post-card").filter({ has: page.locator('a[href="/writing/etl-ai-feature-pipelines"]') });
  await log.getByRole("link", { name: "Case study: Gemini workflow suite" }).click();
  await expect(page).toHaveURL(/\/projects\/gemini-workflow-suite$/);
});
