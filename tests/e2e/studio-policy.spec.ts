import { test, expect } from "@playwright/test";

test("manual policy phases cancel without late output and reset identically", async ({
  page,
}) => {
  await page.goto("/studio/modules/policy-workflow");
  const calls: string[] = [];
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    // Next's native-link RSC prefetch is framework navigation, not demo transport.
    if (
      request.method() === "GET" &&
      request.headers().rsc === "1" &&
      url.origin === new URL(page.url()).origin &&
      ["/studio", "/studio/connect", "/", "/v2"].includes(url.pathname)
    ) {
      await route.continue();
      return;
    }
    if (["fetch", "xhr"].includes(route.request().resourceType())) {
      calls.push(route.request().url());
      await route.abort();
    } else await route.continue();
  });
  await expect(
    page.getByRole("heading", { name: "A decision, made inspectable." }),
  ).toBeVisible();
  const credits = page.getByLabel("LAB credits");
  await expect(credits).toHaveValue("240");
  await credits.fill("0");
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .click();
  await expect(page.locator("#policy-errors")).toContainText(
    "positive whole number",
  );
  await credits.fill("100");
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Input validated");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(credits).toBeEditable();
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Evaluate policy", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Allowed");
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  await page.waitForTimeout(200);
  await expect(page.locator("[data-policy-receipt]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Evaluate policy", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create receipt", exact: true })
    .click();
  await expect(page.locator("[data-policy-receipt]")).toContainText(
    "LAB-0100-A-EDUCATION",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "output/playwright/studio-policy.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(credits).toHaveValue("240");
  await expect(page.locator("[data-policy-receipt]")).toHaveCount(0);
  expect(calls).toEqual([]);
});

test("the fixed scene paints behind workbench content", async ({ page }) => {
  await page.goto("/studio/modules/policy-workflow");
  const credits = page.getByLabel("LAB credits");
  await credits.scrollIntoViewIfNeeded();
  const isAboveScene = await credits.evaluate((field) => {
    const host = document.querySelector<HTMLElement>("[data-scene-policy]")!;
    // Temporarily enable hit testing only to observe paint order independently
    // of the separately tested pointer-transparent background policy.
    host.style.pointerEvents = "auto";
    const box = field.getBoundingClientRect();
    const top = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    host.style.removeProperty("pointer-events");
    return top === field;
  });
  expect(isAboveScene).toBe(true);
});
