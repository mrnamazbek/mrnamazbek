import { test, expect } from "@playwright/test";
test("four chapter flagship has six real module routes and private preview metadata", async ({
  page,
}) => {
  await page.goto("/studio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "I engineer systems. I test what should exist next.",
  );
  for (const id of [
    "studio-author",
    "studio-capabilities",
    "studio-architecture",
    "studio-ventures",
  ])
    await expect(page.locator("#" + id)).toHaveCount(1);
  await expect(
    page.getByRole("link", {
      name: /^Open (Policy|Data|Architecture|Interface|Locale|Form)/,
    }),
  ).toHaveCount(6);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/studio$/,
  );
});
test("unknown Studio paths recover locally", async ({ page }) => {
  for (const path of ["/studio/modules/unknown", "/studio/no-such-route"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "This experiment does not exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to the lab", exact: true }),
    ).toBeVisible();
  }
});
test("320px is readable and mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/studio");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Navigation" }).click();
  await page.getByRole("link", { name: "Capabilities", exact: true }).click();
  await expect(page).toHaveURL(/#studio-capabilities/);
});
test("no JavaScript keeps server fixture and disabled controls", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/studio/modules/policy-workflow");
  await expect(
    page.getByText("240 LAB credits → hub-a", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preparing workbench" }),
  ).toBeDisabled();
  await page
    .getByRole("link", { name: "Back to the lab", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("preview stays out of sitemap and no-JS mobile menu stays native", async ({
  browser,
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("/studio");
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 740 },
  });
  const page = await context.newPage();
  await page.goto("/studio");
  await page.getByRole("button", { name: "Navigation" }).click();
  await expect(
    page.getByRole("link", { name: "Capabilities", exact: true }),
  ).toBeVisible();
  await context.close();
});

test("Classic and V2 remain independent and readable", async ({ page }) => {
  for (const path of ["/", "/v2"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("[data-studio-runtime]")).toHaveCount(0);
  }
});
