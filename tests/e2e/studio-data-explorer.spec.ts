import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("notes filter and local details support keyboard focus and reset", async ({
  page,
}) => {
  await page.goto("/studio/modules/data-explorer");
  await expect(
    page.getByRole("heading", { name: "A small archive. A useful signal." }),
  ).toBeVisible();
  const calls = await trapDemoRequests(page);
  await expect(page.getByRole("status")).toContainText("19 notes");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 4 of 4", { exact: true })).toBeVisible();
  await page.getByLabel("Search notes").fill("CAFÉ");
  await expect(page.getByText("Page 1 of 1", { exact: true })).toBeVisible();
  const details = page.getByRole("button", {
    name: "Read Unicode at the boundary",
  });
  await details.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Invented note");
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(details).toBeFocused();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.getByLabel("Search notes")).toHaveValue("");
  await expect(page.getByRole("status")).toContainText("19 notes");
  expect(calls).toEqual([]);
});

test("role adapters clear old selections and offer an honest local retry", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const target = new URL("/studio/modules/data-explorer", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.goto(target);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await page.getByRole("button", { name: "Sample roles", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("9 sample roles");
  await expect(
    page.getByText("Fictional roles, not current openings.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await page.getByLabel("Role fixture").selectOption("unavailable");
  await expect(page.getByText("Page 1 of 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Inspect / })).toHaveCount(0);
  await page.getByRole("button", { name: "Retry local fixture" }).click();
  await expect(page.getByRole("status")).toContainText("9 sample roles");
  await page.getByLabel("Role fixture").selectOption("empty");
  await expect(
    page.getByText("The selected fixture contains no roles."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByText("Page 1 of 4", { exact: true })).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-data-explorer.png",
    fullPage: true,
  });
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
});
