import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("manual policy phases cancel without late output and reset identically", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const target = new URL("/studio/modules/policy-workflow", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.goto(target);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
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
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-policy.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(credits).toHaveValue("240");
  await expect(page.locator("[data-policy-receipt]")).toHaveCount(0);
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
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
