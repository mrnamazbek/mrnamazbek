import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test("three local language cards preserve global language and metadata", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      value: () => {
        throw new Error("denied");
      },
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("denied");
      },
    });
  });
  await page.goto("/studio/modules/locale-inspector");
  await expect(
    page.getByRole("heading", { name: "One contract. Three local voices." }),
  ).toBeVisible();
  const calls = await trapDemoRequests(page);
  const title = await page.title();
  const sample = page.locator("[data-locale-card]");
  const labels: Record<string, string> = {
    en: "English · en",
    ru: "Русский · ru",
    kk: "Қазақша · kk",
  };
  for (const locale of ["ru", "kk", "en"]) {
    await page
      .getByRole("button", { name: labels[locale], exact: true })
      .click();
    await expect(sample).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.title()).toBe(title);
  }
  await page.getByRole("button", { name: "Қазақша · kk", exact: true }).click();
  await page.getByLabel("Missing key fixture").selectOption("title");
  await expect(sample.getByRole("heading")).toHaveText(
    "Make a boundary visible",
  );
  await expect(sample).toContainText("Мысалды қарау");
  await expect(page.getByRole("status")).toContainText("title → English");
  const fields = {
    title: sample.getByRole("heading"),
    description: sample.locator("p"),
    action: sample.locator("dd"),
  };
  for (const missing of ["title", "description", "action"] as const) {
    await page.getByLabel("Missing key fixture").selectOption(missing);
    await expect(sample).toHaveAttribute("lang", "kk");
    for (const key of ["title", "description", "action"] as const) {
      expect(
        await fields[key].evaluate((element) =>
          element.closest("[lang]")?.getAttribute("lang"),
        ),
      ).toBe(key === missing ? "en" : "kk");
    }
  }
  expect(
    await sample
      .locator("dt")
      .evaluate((element) => element.closest("[lang]")?.getAttribute("lang")),
  ).toBe("en");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(sample).toHaveAttribute("lang", "en");
  await expect(page.getByLabel("Missing key fixture")).toHaveValue("none");
  expect(calls).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-locale.png",
    fullPage: true,
  });
});
