import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";

test.use({
  reducedMotion: "reduce",
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
});
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("navigation sample owns preferences, keyboard preview and a native menu", async ({
  page,
}) => {
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
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/studio/modules/interface-lab");
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "One interaction. A clear purpose." }),
  ).toBeVisible();
  const calls = await trapDemoRequests(page);
  await page.getByLabel("Sample theme").selectOption("light");
  await page.getByLabel("Text size").selectOption("200");
  await page.getByLabel("Color scheme").selectOption("warm");
  await page.getByLabel("Sample palette").selectOption("mint");
  await page.getByLabel("Text spacing").selectOption("wide");
  await page.getByLabel("Sample font").selectOption("serif");
  await page.getByLabel("Grayscale sample").check();
  await page.getByLabel("Icon style").selectOption("solid");
  const sample = page.locator("[data-interface-sample]");
  await expect(sample).toHaveAttribute("data-theme", "light");
  await expect(sample).toHaveAttribute("data-scale", "200");
  await page
    .getByRole("button", { name: "Preview Systems", exact: true })
    .focus();
  await expect(
    page.getByText("Systems preview: contracts and clear ownership.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sample menu", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Sample menu", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.getByLabel("Sample theme")).toHaveValue("dark");
  await expect(page.getByLabel("Text size")).toHaveValue("100");
  await expect(page.getByLabel("Grayscale sample")).not.toBeChecked();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-interface-lab.png",
    fullPage: true,
  });
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
});

test("pause stops all animated sample classes and static preference wins", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/studio/modules/interface-lab");
  await page
    .getByRole("button", { name: "Motion & media", exact: true })
    .click();
  const catalog = page.locator("[data-motion-catalog]");
  const running = () =>
    catalog.evaluate(
      (element) =>
        element
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === "running").length,
    );
  for (const sample of ["icons", "cube", "choice", "curve"]) {
    await page.getByLabel("Motion sample").selectOption(sample);
    await page
      .getByRole("button", { name: "Resume sample motion", exact: true })
      .click();
    await expect.poll(running).toBeGreaterThan(0);
    await page
      .getByRole("button", { name: "Pause sample motion", exact: true })
      .click();
    await expect.poll(running).toBe(0);
  }
  await page.getByLabel("Motion sample").selectOption("pointer");
  await page
    .getByRole("button", { name: "Preview right field", exact: true })
    .focus();
  await expect(
    page
      .getByRole("button", { name: "Preview right field", exact: true })
      .locator(".."),
  ).toHaveCSS("--field-x", "80%");
  await page
    .getByRole("button", { name: "Resume sample motion", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(catalog).toHaveAttribute("data-paused", "true");
  await expect(
    page.getByRole("button", { name: "Resume sample motion", exact: true }),
  ).toBeDisabled();
});

test("200 percent sample text remains readable at 320 pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/studio/modules/interface-lab");
  await page.getByLabel("Text size").selectOption("200");
  const heading = page.locator("[data-interface-sample] h3");
  const bounds = await heading.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return Array.from(range.getClientRects()).map((box) => ({
      left: box.left,
      right: box.right,
    }));
  });
  expect(bounds.length).toBeGreaterThan(0);
  expect(bounds.every((box) => box.left >= 0 && box.right <= 320)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "output/playwright/studio-interface-narrow.png",
    fullPage: true,
  });
});

test("state samples disclose FAQ and anonymous roles and recover locally", async ({
  page,
}) => {
  await page.goto("/studio/modules/interface-lab");
  await page
    .getByRole("button", { name: "States & disclosures", exact: true })
    .click();
  const calls = await trapDemoRequests(page);
  await page
    .getByRole("button", { name: "Loading fixture", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Loading fixture");
  await page
    .getByRole("button", { name: "Error fixture", exact: true })
    .click();
  await page.getByRole("button", { name: "Retry sample", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Recovered locally");
  const faq = page.getByRole("button", {
    name: "Does this connect to a service?",
    exact: true,
  });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  const panelId = await faq.getAttribute("aria-controls");
  await expect(page.locator(`[id="${panelId}"]`)).toContainText("No request");
  await page
    .getByRole("button", { name: "Inspect Maintainer role", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Anonymous role");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Keep failure recoverable", exact: true })
    .click();
  await expect(
    page.getByText(
      "Preserve the original input and offer a bounded next step.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText(/Non-purchasable example/)).toBeVisible();
  expect(calls).toEqual([]);
});

test("motion catalog has owned details, static pause and equivalent curve controls", async ({
  page,
}) => {
  await page.goto("/studio/modules/interface-lab");
  await page
    .getByRole("button", { name: "Motion & media", exact: true })
    .click();
  const calls = await trapDemoRequests(page);
  await expect(
    page.getByRole("button", { name: "Resume sample motion", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Motion sample").selectOption("gallery");
  const gallery = page.getByRole("button", {
    name: "Open Layer study",
    exact: true,
  });
  await gallery.click();
  await expect(page.getByRole("dialog")).toContainText("Owned abstract study");
  await page.keyboard.press("Tab");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(gallery).toBeFocused();
  await page.getByLabel("Motion sample").selectOption("timeline");
  await page
    .getByRole("button", { name: "Select Prototype milestone", exact: true })
    .click();
  await expect(
    page.getByText("A fictional prototype tests one boundary.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Motion sample").selectOption("regions");
  await page
    .getByRole("button", { name: "Inspect East region", exact: true })
    .click();
  await expect(
    page.getByText("East · illustrative handoff boundary.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Motion sample").selectOption("curve");
  await page.getByLabel("Point 2 X").fill("50");
  await page.getByLabel("Point 2 Y").fill("50");
  const handle = page.getByRole("button", {
    name: "Curve point 2",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Point 2 X")).toHaveValue("51");
  await page.keyboard.press("ArrowLeft");
  await page.locator("[data-curve-editor]").scrollIntoViewIfNeeded();
  const box = await page.locator("[data-curve-editor]").boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.6, box!.y + box!.height * 0.6);
  await expect(page.getByLabel("Point 2 X")).toHaveValue("50");
  await page.mouse.up();
  await expect(page.getByLabel("Point 2 X")).toHaveValue("60");
  await expect(page.getByLabel("Point 2 Y")).toHaveValue("60");
  await handle.dispatchEvent("pointerdown", {
    pointerId: 5,
    clientX: box!.x + box!.width * 0.6,
    clientY: box!.y + box!.height * 0.6,
  });
  await handle.dispatchEvent("pointermove", {
    pointerId: 5,
    clientX: box!.x + box!.width * 0.9,
    clientY: box!.y + box!.height * 0.9,
  });
  await handle.dispatchEvent("pointercancel", { pointerId: 5 });
  await expect(page.getByLabel("Point 2 X")).toHaveValue("60");
  await expect(handle).toHaveAttribute("transform", "translate(60 60)");
  expect(calls).toEqual([]);
});
