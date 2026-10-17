import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test("offline form keeps edits through manual outcomes, cancellation and Enter", async ({
  page,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const target = new URL("/studio/modules/form-workbench", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target);
  await expect(
    page.getByRole("heading", {
      name: "Inspect the boundary before sending anything.",
    }),
  ).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
  await page.evaluate(() => {
    const metrics = { mutations: 0 };
    Object.assign(window, { __studioStorageMetrics: metrics });
    for (const method of ["setItem", "removeItem", "clear"])
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value: () => {
          metrics.mutations++;
          throw new Error("Storage denied");
        },
      });
  });
  const name = page.getByLabel("Demo name", { exact: true });
  const message = page.getByLabel("Demo message", { exact: true });
  await name.fill("A");
  await page
    .getByRole("button", { name: "Start simulation", exact: true })
    .click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  const errorId = await name.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${errorId}"]`)).toContainText("2–100");
  await name.fill("Local Tester");
  await message.fill(
    "A sample message is retained through every local outcome.",
  );
  await page.evaluate(() =>
    Object.assign(window, { __studioLocalReloadMarker: "retained" }),
  );
  await name.press("Enter");
  await expect(page).toHaveURL(target);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __studioLocalReloadMarker: string })
          .__studioLocalReloadMarker,
    ),
  ).toBe("retained");
  await page.getByLabel("Adapter mode").selectOption("unavailable");
  await page
    .getByRole("button", { name: "Start simulation", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Pending simulation");
  await page
    .getByRole("button", { name: "Cancel simulation", exact: true })
    .click();
  await page.waitForTimeout(150);
  await expect(name).toHaveValue("Local Tester");
  await expect(page.locator("[data-form-response]")).toHaveCount(0);
  for (const [mode, outcome] of [
    ["unavailable", "unavailable"],
    ["failure", "failure"],
    ["success", "Simulated success"],
  ]) {
    await page.getByLabel("Adapter mode").selectOption(mode);
    await page
      .getByRole("button", { name: "Start simulation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Advance response", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(outcome);
    await expect(name).toHaveValue("Local Tester");
    await expect(message).toHaveValue(
      "A sample message is retained through every local outcome.",
    );
  }
  for (const status of [400, 403, 413, 415, 422, 502, 503, 200]) {
    await page.getByLabel("Boundary example").selectOption(String(status));
    await expect(page.locator("[data-boundary-example]")).toContainText(
      `HTTP ${status}`,
    );
  }
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(name).toHaveValue("Demo Builder");
  await expect(page.getByLabel("Demo email", { exact: true })).toHaveValue(
    "demo@example.invalid",
  );
  await expect(page.locator("[data-form-response]")).toHaveCount(0);
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __studioStorageMetrics: { mutations: number };
          }
        ).__studioStorageMetrics.mutations,
    ),
  ).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-form-workbench.png",
    fullPage: true,
  });
});

test("no JavaScript exposes only the fixture and ordinary navigation", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const target = new URL("/studio/modules/form-workbench", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.goto(target);
  await expect(page.getByRole("definition")).toHaveCount(3);
  await expect(page.locator("input, textarea, form")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Preparing workbench" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Back to the lab", exact: true }),
  ).toHaveAttribute("href", "/studio#studio-capabilities");
  expect(calls).toEqual([]);
  await context.close();
});
