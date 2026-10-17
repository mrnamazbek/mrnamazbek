import { test, expect } from "@playwright/test";
test.use({ reducedMotion: "no-preference" });
test("Studio owns a persistent scene and returns to neutral on deep routes", async ({
  page,
}) => {
  await page.goto("/");
  await page.goto("/studio");
  await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
    "data-scene-mode",
    "story",
  );
  await page.getByRole("link", { name: "Open Policy Workflow" }).click();
  await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
    "data-scene-mode",
    "ambient",
  );
  await page.goBack();
  await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
    "data-scene-mode",
    "story",
  );
  await page
    .getByRole("link", { name: "Classic portfolio", exact: true })
    .first()
    .click();
  await expect(page.locator("[data-studio-runtime]")).toHaveCount(0);
});
test("native anchors and keyboard remain usable", async ({ page }) => {
  await page.goto("/studio");
  await page
    .getByRole("link", { name: "Explore the lab", exact: true })
    .click();
  await expect(page).toHaveURL(/#studio-capabilities$/);
  await expect(
    page.getByRole("heading", { name: "Less promise. More proof." }),
  ).toBeInViewport();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("link", { name: "Classic portfolio", exact: true }),
  ).toBeInViewport();
});
