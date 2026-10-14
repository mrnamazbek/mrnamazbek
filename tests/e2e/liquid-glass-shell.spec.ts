import { expect, test } from "@playwright/test";

test("glass appearance persists independently of the classic theme", async ({ page }) => {
  await page.goto("/v2");
  const shell = page.locator('[data-portfolio-version="liquid-glass"]');
  await expect(shell).toHaveAttribute("data-glass-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await expect(shell).toHaveAttribute("data-glass-theme", "dark");
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/v2\/projects$/);
  await page.reload();
  await expect(shell).toHaveAttribute("data-glass-theme", "dark");

  await page.getByRole("link", { name: "Classic", exact: true }).click();
  await expect(page).toHaveURL(new URL("/projects", page.url()).toString());
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/v2");
  await expect(shell).toHaveAttribute("data-glass-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await expect(shell).toHaveAttribute("data-glass-theme", "light");
  await page.goto("/projects");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Liquid Glass edition", exact: true }).click();
  await expect(page).toHaveURL(new URL("/v2", page.url()).toString());
  await expect(shell).toHaveAttribute("data-glass-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await expect(shell).toHaveAttribute("data-glass-theme", "dark");
});

test("glass mobile navigation supports keyboard disclosure and Escape focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/v2");
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const navigation = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
  await expect(navigation.getByRole("link", { name: "About", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigation).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await navigation.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/v2\/projects$/);
  await expect(navigation).not.toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
});

test("glass mobile navigation remains usable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await page.goto("/v2");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page.getByRole("navigation", { name: "Mobile navigation", exact: true }).getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/v2\/projects$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("glass controls use an opaque legible surface in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/v2");
  const header = page.getByRole("banner");
  const theme = page.getByRole("button", { name: "Switch to dark theme", exact: true });
  await expect(theme).toBeVisible();
  await expect(header.locator('[aria-hidden="true"].liqui-glass')).toHaveClass(/liqui-glass--clear/);
  const decoration = await header.locator('[aria-hidden="true"].liqui-glass').evaluate((element) => ({
    clear: element.classList.contains("liqui-glass--clear"),
    backdropCount: element.querySelectorAll(".liqui-glass__refract, .liqui-glass__backdrop").length,
  }));
  expect(decoration).toEqual({ clear: true, backdropCount: 0 });
  await theme.click();
  await expect(page.locator('[data-portfolio-version="liquid-glass"]')).toHaveAttribute("data-glass-theme", "dark");
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Projects", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/v2\/projects$/);
});

test("glass navigation enhances to a bounded refraction lens without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/v2");
  const lens = page.getByRole("banner").locator(".liqui-glass--refract");
  await expect(lens).toBeVisible();
  await expect(lens.locator(".liqui-glass__refract")).toHaveCount(1);
  const geometry = await lens.evaluate((element) => {
    const surface = element.getBoundingClientRect();
    const layer = element.querySelector<HTMLElement>(".liqui-glass__refract")!;
    const id = layer.style.backdropFilter.match(/#([^"')\s]+)/)?.[1];
    const filter = id ? document.getElementById(id) : null;
    return {
      width: surface.width,
      height: surface.height,
      filterWidth: Number(filter?.getAttribute("width")),
      filterHeight: Number(filter?.getAttribute("height")),
      displacement: !!filter?.querySelector("feDisplacementMap"),
    };
  });
  expect(geometry.displacement).toBe(true);
  expect(geometry.width * geometry.height).toBeLessThan(150_000);
  expect(Math.abs(geometry.width - geometry.filterWidth)).toBeLessThan(2);
  expect(Math.abs(geometry.height - geometry.filterHeight)).toBeLessThan(2);
  expect(errors).toEqual([]);
});
