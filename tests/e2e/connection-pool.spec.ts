import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("connection pool keyboard controls borrow, queue, hand off, and reset requests", async ({ page }) => {
  await page.goto("/lab");
  const pool = page.locator("#connection-pool");
  const send = pool.getByRole("button", { name: "Send request", exact: true });
  const complete = pool.getByRole("button", { name: "Complete one query", exact: true });
  await expect(complete).toBeDisabled();
  await send.focus();
  for (let index = 0; index < 4; index++) await page.keyboard.press("Enter");
  await expect(pool.getByTestId("pool-busy")).toHaveText("3 / 3");
  await expect(pool.getByTestId("pool-waiting")).toHaveText("1");
  await expect(pool.locator("[data-pool-connection][data-busy=true]")).toHaveCount(3);
  await expect(pool.locator("[data-pool-waiting][data-occupied=true]")).toHaveCount(1);
  await expect(pool.getByRole("status")).toContainText("Request 4 is waiting");
  await complete.focus();
  await page.keyboard.press("Enter");
  await expect(pool.getByTestId("pool-busy")).toHaveText("3 / 3");
  await expect(pool.getByTestId("pool-waiting")).toHaveText("0");
  await expect(pool.getByTestId("pool-completed")).toHaveText("1");
  await expect(pool.getByRole("list", { name: "Connection assignments" }).locator("li").first()).toContainText("Request 4");
  await expect(pool.getByRole("status")).toContainText("Waiting request 4 now uses connection 1");
  await pool.getByRole("button", { name: "Reset connection pool" }).click();
  await expect(pool.getByTestId("pool-busy")).toHaveText("0 / 3");
  await expect(pool.getByTestId("pool-completed")).toHaveText("0");
  await expect(complete).toBeDisabled();
});

test("pool waiting room stays bounded and returns connections in request order", async ({ page }) => {
  await page.goto("/lab");
  const pool = page.locator("#connection-pool");
  const send = pool.getByRole("button", { name: "Send request", exact: true });
  for (let index = 0; index < 10; index++) await send.click();
  await expect(pool.getByTestId("pool-waiting")).toHaveText("6");
  await expect(pool.getByRole("status")).toContainText("waiting room is full");
  const complete = pool.getByRole("button", { name: "Complete one query", exact: true });
  for (let index = 1; index <= 9; index++) {
    await complete.click();
    await expect(pool.getByRole("status")).toContainText(`Request ${index} completed`);
  }
  await expect(complete).toBeDisabled();
  await expect(pool.getByTestId("pool-busy")).toHaveText("0 / 3");
  await expect(pool.getByTestId("pool-waiting")).toHaveText("0");
  await expect(pool.getByTestId("pool-completed")).toHaveText("9");
});

test("pool diagram works on a narrow screen with reduced motion and both palettes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab");
  const pool = page.locator("#connection-pool");
  await pool.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(pool.getByTestId("pool-busy")).toHaveText("1 / 3");
  const diagram = pool.getByRole("img", { name: "A three-connection pool with a waiting room", exact: false });
  await expect(diagram).toBeVisible();
  const transitionSeconds = await diagram.locator("polygon").first().evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeLessThanOrEqual(0.00001);
  expect(await pool.evaluate((element) => element.getBoundingClientRect().right <= innerWidth)).toBe(true);
  for (const theme of ["dark", "light"]) {
    if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
    const result = await new AxeBuilder({ page }).include("#connection-pool").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations.map(({ id, impact }) => ({ id, impact })), theme).toEqual([]);
  }
});
