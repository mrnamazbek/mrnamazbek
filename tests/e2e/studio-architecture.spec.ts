import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test("fixed architecture is inspectable by keyboard with complete local comparisons", async ({
  page,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const target = new URL("/studio/modules/architecture", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.goto(target);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Follow the boundary, not the buzzword.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select Validate stage" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Validate the contract", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Advance packet" }).click();
  await expect(page.getByRole("status")).toContainText("validate");
  await page.getByRole("button", { name: "Cancel packet" }).click();
  await expect(page.getByRole("status")).toContainText("source");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Advance packet" }).click();
  await expect(page.getByRole("status")).toContainText("complete");
  await expect(
    page.getByRole("button", { name: "Advance packet" }),
  ).toBeDisabled();
  for (const label of ["Support", "Approval", "Data", "Cloud", "Controls"]) {
    const tab = page.getByRole("tab", { name: label, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Illustrative");
  }
  const table = page.getByRole("table", { name: /Hypothetical tradeoffs/ });
  for (const heading of ["Criterion", "Batch", "Stream", "Hybrid"])
    await expect(
      table.getByRole("columnheader", { name: heading, exact: true }),
    ).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Ordered pipeline alternative" })
      .getByRole("listitem"),
  ).toHaveCount(4);
  await page.getByLabel("Stack category").selectOption("platform-systems");
  await expect(
    page.getByRole("heading", { name: "PostgreSQL", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Playwright", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.getByLabel("Stack category")).toHaveValue(
    "project-tooling",
  );
  await expect(page.getByRole("status")).toContainText("source");
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-architecture.png",
    fullPage: true,
  });
});
