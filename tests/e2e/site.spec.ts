import { expect, test, type Page } from "@playwright/test";

const pages = ["/", "/about", "/projects", "/writing", "/gallery", "/lab", "/library", "/contact"];

function recordRuntimeErrors(page: Page, allowUnavailableWebGL = false) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (allowUnavailableWebGL && /WebGL.*(?:context|renderer)|Error creating WebGL/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(dimensions.content, `Horizontal overflow at ${page.url()}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect(heading).not.toBeNull();
  expect(heading!.x).toBeGreaterThanOrEqual(-1);
  expect(heading!.x + heading!.width).toBeLessThanOrEqual(dimensions.viewport + 1);
}

for (const width of [320, 375, 768, 1440]) {
  test(`all pages and navigation fit a ${width}px viewport without runtime errors`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width < 768 ? 812 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = recordRuntimeErrors(page);
    await page.goto("/");
    const mobileToggle = page.getByRole("button", { name: "Open navigation" });
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "About" }).click();
      await expect(page).toHaveURL(/\/about$/);
      await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
    } else {
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "About" }).click();
      await expect(page).toHaveURL(/\/about$/);
    }

    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page).toHaveTitle(/Namazbek Bekzhanov/);
      await expectNoHorizontalOverflow(page);
      if (path === "/") await expect(page.locator(".sculpture-fallback")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("mobile navigation supports Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "About" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("theme selection survives client navigation and a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
});

test("project search and language filters update actual results", async ({ page }) => {
  await page.goto("/projects");
  const cards = page.locator(".repository-grid .project-card");
  await expect(cards.first()).toBeVisible();
  const originalCount = await cards.count();
  expect(originalCount).toBeGreaterThan(0);
  const firstProject = (await cards.first().getByRole("heading").innerText()).trim();
  // Display names replace separators; searching a word works with original slugs too.
  const query = firstProject.split(/\s+/).find((word) => word.length > 2) ?? firstProject;
  await page.getByRole("searchbox", { name: "Search projects" }).fill(query);
  expect(await cards.count()).toBeLessThanOrEqual(originalCount);
  await expect(cards.first()).toBeVisible();
  await page.getByRole("searchbox", { name: "Search projects" }).fill("no-project-can-match-this-742b");
  await expect(cards).toHaveCount(0);
  await expect(page.getByText("No projects match that search.", { exact: false })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search projects" }).clear();
  await expect(cards).toHaveCount(originalCount);
  const filters = page.locator(".filter-tabs button");
  if (await filters.count() > 1) {
    const language = (await filters.nth(1).innerText()).trim();
    await filters.nth(1).click();
    await expect(filters.nth(1)).toHaveAttribute("aria-pressed", "true");
    for (const card of await cards.all()) await expect(card.locator(".card-topline .eyebrow")).toHaveText(language);
  }
});

test("bookshelf search and reading filters work with expandable details", async ({ page }) => {
  await page.goto("/library");
  const cards = page.locator(".book-card");
  await expect(cards.first()).toBeVisible();
  const originalCount = await cards.count();
  const firstTitle = (await cards.first().getByRole("heading").innerText()).trim();
  await page.getByRole("searchbox", { name: "Search the bookshelf" }).fill(firstTitle);
  await expect(cards).toHaveCount(1);
  await cards.first().locator("summary").click();
  await expect(cards.first().getByRole("link", { name: "Book details" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search the bookshelf" }).fill("unfindable-book-742b");
  await expect(cards).toHaveCount(0);
  await expect(page.getByText("No books match that search.")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search the bookshelf" }).clear();
  await expect(cards).toHaveCount(originalCount);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(page.getByRole("button", { name: "Completed", exact: true })).toHaveAttribute("aria-pressed", "true");
  for (const card of await cards.all()) await expect(card.locator(".book-status-completed")).toHaveText("Completed");
});

test("writing opens a complete article and missing paths have a useful recovery", async ({ page }) => {
  await page.goto("/writing");
  const firstPost = page.locator(".post-card h3 a").first();
  const title = (await firstPost.innerText()).trim();
  await firstPost.click();
  await expect(page).toHaveURL(/\/writing\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.locator(".article-body")).toBeVisible();
  expect((await page.locator(".article-body").innerText()).length).toBeGreaterThan(300);
  await expect(page.getByRole("link", { name: "All writing" })).toBeVisible();
  for (const missingPath of ["/writing/missing-article-742b", "/missing-page-742b"]) {
    const response = await page.goto(missingPath);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("uncharted");
    await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute("href", "/");
  }
});

test("contact validation prevents invalid submissions and keeps a direct email option", async ({ page }) => {
  await page.goto("/contact");
  let submissions = 0;
  page.on("request", (request) => { if (request.url().endsWith("/api/contact")) submissions++; });
  await page.getByRole("button", { name: "Send a message" }).click();
  await expect(page.getByLabel("Your name")).toBeFocused();
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByLabel("Email address", { exact: true }).fill("invalid-email");
  await page.getByLabel("What do you have in mind?").fill("A valid project message.");
  await page.getByRole("button", { name: "Send a message" }).click();
  await expect(page.getByLabel("Email address", { exact: true })).toBeFocused();
  expect(submissions).toBe(0);
  await expect(page.locator(".contact-email")).toHaveAttribute("href", /^mailto:/);
});

test("unconfigured contact API exposes the real email fallback", async ({ page }) => {
  test.skip(Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)), "A configured database is tested separately without adding live test messages.");
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Migration QA");
  await page.getByLabel("Email address", { exact: true }).fill("migration-qa@example.com");
  await page.getByLabel("What do you have in mind?").fill("This verifies the unavailable contact form response.");
  const response = page.waitForResponse((item) => item.url().endsWith("/api/contact"));
  await page.getByRole("button", { name: "Send a message" }).click();
  expect((await response).status()).toBe(503);
  await expect(page.getByRole("status")).toContainText("temporarily unavailable");
  await expect(page.getByRole("link", { name: "Email me directly" })).toHaveAttribute("href", /^mailto:/);
  await expect(page.getByRole("button", { name: "Message saved" })).toHaveCount(0);
});

test("API origin and honeypot guards reject requests before persistence", async ({ request, baseURL }) => {
  const data = { name: "Migration QA", email: "migration-qa@example.com", message: "This request must never be persisted.", website: "" };
  const foreign = await request.post("/api/contact", { headers: { Origin: "https://untrusted.example" }, data });
  expect(foreign.status()).toBe(403);
  expect((await foreign.json()).ok).toBe(false);
  const honeypot = await request.post("/api/contact", { headers: { Origin: baseURL! }, data: { ...data, website: "https://spam.example" } });
  expect(honeypot.status()).toBe(400);
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
});

test("3D enhancement retains the visible fallback when WebGL is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(contextId: string, ...options: unknown[]) {
        if (contextId === "webgl" || contextId === "webgl2" || contextId === "experimental-webgl") return null;
        return Reflect.apply(original, this, [contextId, ...options]);
      },
    });
  });
  const errors = recordRuntimeErrors(page, true);
  await page.goto("/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await expect(page.getByRole("heading", { name: "I make data work." })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(errors).toEqual([]);
});
