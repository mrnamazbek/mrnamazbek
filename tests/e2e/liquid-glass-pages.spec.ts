import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const glassRoot = '[data-portfolio-version="liquid-glass"]';
const rootPages = ["/v2", "/v2/about", "/v2/contact", "/v2/lab"];
const contactDetails = {
  name: "Portfolio Browser QA",
  email: "portfolio-qa@example.com",
  message: "A test message for the mocked contact endpoint. Please preserve it if saving fails.",
  website: "",
};

function runtimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  return errors;
}

async function settledContent(page: Page, path: string) {
  if (path === "/v2/lab") {
    await expect(page.locator("#ai-live-signals-root").getByText("Loading currency and weather signals…", { exact: true })).toHaveCount(0, { timeout: 20_000 });
  }
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
    .map(animation => animation.finished.catch(() => {}))));
}

async function expectNoOverflow(page: Page, description: string) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(dimensions.content, description).toBeLessThanOrEqual(dimensions.viewport + 1);
  const heading = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(heading, description).not.toBeNull();
  expect(heading.x, description).toBeGreaterThanOrEqual(-1);
  expect(heading.x + heading.width, description).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectReadableHeroCards(page: Page) {
  const currentRole = page.getByText("CURRENTLY", { exact: true }).locator("..");
  const identity = page.getByRole("img", { name: "Namazbek Bekzhanov", exact: true }).locator("..");
  const caption = page.getByText("Clarity, through complexity.", { exact: true });
  await expect(currentRole).toBeVisible();
  await expect(identity).toBeVisible();
  await expect(caption).toBeVisible();
  const roleBox = (await currentRole.boundingBox())!;
  const identityBox = (await identity.boundingBox())!;
  const captionBox = (await caption.boundingBox())!;
  const artworkBox = (await page.getByTestId("glass-sculpture").boundingBox())!;
  // The role stays alongside the artwork instead of becoming another flow row.
  expect(roleBox.y).toBeLessThan(artworkBox.y + artworkBox.height);
  expect(roleBox.y + roleBox.height).toBeLessThanOrEqual(captionBox.y + 1);
  const overlapWidth = Math.min(identityBox.x + identityBox.width, captionBox.x + captionBox.width) - Math.max(identityBox.x, captionBox.x);
  const overlapHeight = Math.min(identityBox.y + identityBox.height, captionBox.y + captionBox.height) - Math.max(identityBox.y, captionBox.y);
  expect(overlapWidth > 1 && overlapHeight > 1, "The identity card must not cover the artwork caption").toBe(false);
}

for (const width of [320, 1440]) {
  test(`Liquid Glass home, about, contact and lab stay accessible at ${width}px in both palettes`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = runtimeErrors(page);
    for (const path of rootPages) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator(glassRoot)).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const theme of ["light", "dark"] as const) {
        const current = await page.locator(glassRoot).getAttribute("data-glass-theme");
        if (current !== theme) await page.getByRole("button", { name: `Switch to ${theme} theme`, exact: true }).click();
        await expect(page.locator(glassRoot)).toHaveAttribute("data-glass-theme", theme);
        await settledContent(page, path);
        await expectNoOverflow(page, `${path} in ${theme} at ${width}px`);
        if (path === "/v2") await expectReadableHeroCards(page);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(results.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          elements: nodes.map(node => node.target),
        })), `${path} in ${theme} at ${width}px`).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  });
}

test("an unknown Liquid Glass URL returns 404 inside its own navigation and recovery shell", async ({ page }) => {
  const errors = runtimeErrors(page);
  const response = await page.goto("/v2/unknown");
  expect(response?.status()).toBe(404);
  await expect(page.locator(glassRoot)).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("uncharted");
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "About", exact: true })).toHaveAttribute("href", "/v2/about");
  await expect(page.getByRole("link", { name: "Back home", exact: true })).toHaveAttribute("href", "/v2");
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/\/v2$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Namazbek");
  expect(errors).toEqual([]);
});

test("the Liquid Glass homepage has one exact document title without repeating the name", async ({ page }) => {
  await page.goto("/v2");
  await expect(page).toHaveTitle("Namazbek Bekzhanov — Liquid Glass Portfolio");
  await expect(page.locator("head title")).toHaveCount(1);
});

async function fillContact(page: Page) {
  await page.getByLabel("Your name", { exact: true }).fill(contactDetails.name);
  await page.getByLabel("Email address", { exact: true }).fill(contactDetails.email);
  await page.getByLabel("What do you have in mind?", { exact: true }).fill(contactDetails.message);
}

async function expectResetContact(page: Page) {
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("What do you have in mind?", { exact: true })).toHaveValue("");
}

for (const path of ["/v2/contact", "/contact"]) {
  test(`contact on ${path} posts the expected JSON and clears inputs after confirmed success`, async ({ page }) => {
    const requests: { method: string; contentType: string | undefined; payload: unknown }[] = [];
    let releaseResponse = () => {};
    const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
    await page.route("**/api/contact", async route => {
      const request = route.request();
      requests.push({ method: request.method(), contentType: request.headers()["content-type"], payload: request.postDataJSON() });
      await responseGate;
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    try {
      await page.goto(path);
      await fillContact(page);
      await page.getByRole("button", { name: "Send a message", exact: true }).click();
      await expect(page.getByRole("button", { name: "Saving", exact: true })).toBeDisabled();
      await expect.poll(() => requests.length).toBe(1);
      expect(requests[0]).toEqual({ method: "POST", contentType: "application/json", payload: contactDetails });
      // Pending messages remain present until the service confirms they were saved.
      await expect(page.getByLabel("What do you have in mind?", { exact: true })).toHaveValue(contactDetails.message);
      releaseResponse();
      await expect(page.locator(".contact-form").getByRole("status")).toContainText("Your message was saved.");
      await expect(page.getByRole("button", { name: "Message saved", exact: true })).toBeVisible();
      await expectResetContact(page);
      expect(requests).toHaveLength(1);
      expect(new URL(page.url()).search).toBe("");
    } finally {
      releaseResponse();
    }
  });

  test(`contact on ${path} preserves a failed message and retries the same JSON without retyping`, async ({ page }) => {
    const requests: { method: string; payload: unknown }[] = [];
    await page.route("**/api/contact", async route => {
      const request = route.request();
      requests.push({ method: request.method(), payload: request.postDataJSON() });
      const first = requests.length === 1;
      await route.fulfill({
        status: first ? 503 : 201,
        contentType: "application/json",
        body: JSON.stringify(first ? { ok: false, error: "The message service is temporarily unavailable." } : { ok: true }),
      });
    });
    await page.goto(path);
    await fillContact(page);
    const send = page.getByRole("button", { name: "Send a message", exact: true });
    await send.click();
    const status = page.locator(".contact-form").getByRole("status");
    await expect(status).toContainText("The message service is temporarily unavailable.");
    await expect(status.getByRole("link", { name: /Email me directly/ })).toHaveAttribute("href", /^mailto:/);
    await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(contactDetails.name);
    await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(contactDetails.email);
    await expect(page.getByLabel("What do you have in mind?", { exact: true })).toHaveValue(contactDetails.message);
    await expect(send).toBeEnabled();
    await send.click();
    await expect(status).toContainText("Your message was saved.");
    await expectResetContact(page);
    expect(requests).toEqual([
      { method: "POST", payload: contactDetails },
      { method: "POST", payload: contactDetails },
    ]);
    expect(new URL(page.url()).search).toBe("");
  });

  test(`contact on ${path} disables native form fields without JavaScript and offers direct email`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
    try {
      const page = await context.newPage();
      const privateGetRequests: string[] = [];
      page.on("request", request => {
        if (request.method() !== "GET") return;
        const url = new URL(request.url());
        if (["name", "email", "message", "website"].some(key => url.searchParams.has(key))) privateGetRequests.push(request.url());
      });
      const response = await page.goto(`${baseURL}${path}`);
      expect(response?.status()).toBe(200);
      const form = page.locator(".contact-form");
      await expect(page.getByLabel("Your name", { exact: true })).toBeDisabled();
      await expect(page.getByLabel("Email address", { exact: true })).toBeDisabled();
      await expect(page.getByLabel("What do you have in mind?", { exact: true })).toBeDisabled();
      await expect(form.locator('input[name="website"]')).toBeDisabled();
      await expect(form.getByRole("button", { name: "Send a message", exact: true })).toBeDisabled();
      const directEmail = form.getByRole("link", { name: "emailing me directly", exact: true });
      await expect(directEmail).toBeVisible();
      await expect(directEmail).toHaveAttribute("href", /^mailto:[^?]+$/);
      // Native FormData uses the same successful-control rules as HTML GET.
      // Disabled fields must contribute no private keys before React hydrates.
      const serializedKeys = await form.evaluate(element => [...new FormData(element as HTMLFormElement).keys()]);
      expect(serializedKeys).toEqual([]);
      expect(new URL(page.url()).search).toBe("");
      expect(privateGetRequests).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
