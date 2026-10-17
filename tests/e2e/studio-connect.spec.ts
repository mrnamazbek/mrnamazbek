import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // This remains installed for every test, including navigation and error cases.
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      json: { ok: false, error: "Intercepted test response." },
    }),
  );
});

test("terminal help, clear and keyboard commands navigate only to safe intents", async ({
  page,
}) => {
  await page.goto("/studio");
  const command = page.getByLabel("Lab command", { exact: true });
  await expect(command).toBeVisible();
  const output = page.locator("[data-terminal-output]");
  await command.fill("  HELP  ");
  await command.press("Enter");
  await expect(output).toContainText(
    "help · cofound · invest · partner · clear",
  );
  await page
    .getByRole("button", { name: "Clear terminal", exact: true })
    .click();
  await expect(output).toHaveText("");
  await command.fill("person@example.invalid");
  await command.press("Enter");
  await expect(output).toContainText("Unknown command");
  await expect(output).not.toContainText("person@example.invalid");
  await expect(page).toHaveURL("/studio");
  await command.fill(" CoFoUnD ");
  await command.press("Enter");
  await expect(page).toHaveURL("/studio/connect?intent=cofound");
  await expect(page.locator("[data-connect-intent]")).toHaveAttribute(
    "data-connect-intent",
    "cofound",
  );
  await page
    .getByRole("link", { name: "Back to the lab", exact: true })
    .click();
  await page.getByRole("link", { name: "Invest ↗", exact: true }).click();
  await expect(page).toHaveURL("/studio/connect?intent=invest");
});

test("invalid or repeated intent stays general without reflecting its value", async ({
  page,
}) => {
  for (const query of [
    "intent=invest&intent=partner",
    "intent=%3Cscript%3E",
    "intent=person%40example.invalid",
  ]) {
    await page.goto(`/studio/connect?${query}`);
    await expect(page.locator("[data-connect-intent]")).toHaveAttribute(
      "data-connect-intent",
      "general",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Start a conversation.",
    );
    await expect(page.locator("body")).not.toContainText(
      "person@example.invalid",
    );
    await expect(page.locator("[data-connect-intent]")).not.toContainText(
      "<script>",
    );
  }
});

test("real shared form preserves failures and clears only confirmed saved responses", async ({
  page,
  baseURL,
}) => {
  const target = new URL("/studio/connect?intent=partner", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  const payloads: object[] = [];
  let reply = 0;
  // Latest route wins over the broad guard; it always fulfills locally.
  await page.route("**/api/contact", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(new URL(request.url()).search).toBe("");
    payloads.push(request.postDataJSON());
    if (reply++ === 0)
      return route.fulfill({
        status: 503,
        json: {
          ok: false,
          error: "Temporarily unavailable. Your draft is preserved.",
        },
      });
    if (reply === 2)
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "malformed",
      });
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto(target);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Start a conversation.",
  );
  const name = page.getByLabel("Your name", { exact: true });
  const email = page.getByLabel("Email address", { exact: true });
  const message = page.getByLabel("What do you have in mind?", { exact: true });
  await expect(name).toBeEnabled();
  await name.fill("Sample Visitor");
  await email.fill("visitor@example.invalid");
  await message.fill(
    "A fictional conversation for an intercepted browser test.",
  );
  for (let attempt = 0; attempt < 2; attempt++) {
    await page
      .getByRole("button", { name: "Send a message", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Email me directly ↗", exact: true }),
    ).toBeVisible();
    await expect(name).toHaveValue("Sample Visitor");
    await expect(message).toHaveValue(
      "A fictional conversation for an intercepted browser test.",
    );
  }
  await page
    .getByRole("button", { name: "Send a message", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Your message was saved",
  );
  await expect(name).toHaveValue("");
  await expect(email).toHaveValue("");
  await expect(message).toHaveValue("");
  expect(payloads).toHaveLength(3);
  for (const payload of payloads)
    expect(payload).toEqual({
      name: "Sample Visitor",
      email: "visitor@example.invalid",
      message: "A fictional conversation for an intercepted browser test.",
      website: "",
    });
  expect(calls).toEqual([]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/studio\/connect$/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-connect.png",
    fullPage: true,
  });
});

test("contact without JavaScript has disabled fields and an email fallback", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const target = new URL("/studio/connect", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.route("**/api/contact", (route) => route.abort());
  await page.goto(target);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Start a conversation.",
  );
  await expect(page.getByLabel("Your name", { exact: true })).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "emailing me directly", exact: true }),
  ).toHaveAttribute("href", /^mailto:/);
  expect(calls).toEqual([]);
  await context.close();
});
