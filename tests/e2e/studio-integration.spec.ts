import { test, expect, type Page } from "@playwright/test";

async function settleNativeScroll(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let previous = scrollY;
        let stableFrames = 0;
        const sample = () => {
          stableFrames =
            Math.abs(scrollY - previous) < 1 ? stableFrames + 1 : 0;
          previous = scrollY;
          if (stableFrames >= 8) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
}
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
});

test.beforeEach(async ({ page }) => {
  await page.route("**/api/contact", (route) => route.abort());
});

test("deep header chapters preserve the actual canvas and native anchor destination", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/studio/modules/policy-workflow");
  const canvas = page.locator("canvas[data-studio-canvas]");
  await expect(canvas).toHaveCount(1);
  await canvas.evaluate((element) => {
    element.dataset.testIdentity = "header-persistent";
  });
  const navigation = page.getByRole("navigation", {
    name: "Studio navigation",
    exact: true,
  });
  const capabilities = navigation.getByRole("link", {
    name: "Capabilities",
    exact: true,
  });
  await capabilities.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/studio#studio-capabilities$/);
  await expect(canvas).toHaveAttribute(
    "data-test-identity",
    "header-persistent",
  );
  await expect
    .poll(() =>
      page
        .locator("#studio-capabilities")
        .evaluate((element) =>
          Math.abs(
            element.getBoundingClientRect().top -
              parseFloat(
                getComputedStyle(document.documentElement).scrollPaddingTop,
              ) -
              parseFloat(getComputedStyle(element).scrollMarginTop),
          ),
        ),
    )
    .toBeLessThan(3);
  await expect(capabilities).toHaveAttribute("aria-current", "location");
  const openArchitecture = page.getByRole("link", {
    name: "Open Architecture Inspector",
    exact: true,
  });
  await openArchitecture.scrollIntoViewIfNeeded();
  await openArchitecture.click();
  await expect(capabilities).not.toHaveAttribute("aria-current", "location");
  await page.goBack();
  await expect(page).toHaveURL(/\/studio#studio-capabilities$/);
  await expect
    .poll(() =>
      page
        .locator("#studio-capabilities")
        .evaluate((element) =>
          Math.abs(
            element.getBoundingClientRect().top -
              parseFloat(
                getComputedStyle(document.documentElement).scrollPaddingTop,
              ) -
              parseFloat(getComputedStyle(element).scrollMarginTop),
          ),
        ),
    )
    .toBeLessThan(3);
  await page.goForward();
  await expect(page).toHaveURL(/\/studio\/modules\/architecture$/);
  await navigation
    .getByRole("link", { name: "Architecture", exact: true })
    .click();
  await expect(canvas).toHaveAttribute(
    "data-test-identity",
    "header-persistent",
  );
  const ventures = navigation.getByRole("link", {
    name: "Venture lab",
    exact: true,
  });
  await ventures.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page
        .locator("#studio-ventures")
        .evaluate((element) =>
          Math.abs(
            element.getBoundingClientRect().top -
              parseFloat(
                getComputedStyle(document.documentElement).scrollPaddingTop,
              ) -
              parseFloat(getComputedStyle(element).scrollMarginTop),
          ),
        ),
    )
    .toBeLessThan(3);
  await expect(ventures).toHaveAttribute("aria-current", "location");
  await expect(canvas).toHaveAttribute(
    "data-test-identity",
    "header-persistent",
  );
  // Fragment Back follows the native hash destination. An ordinary entry
  // separately restores the actual prior reading position.
  await page.locator('header [data-studio-section="studio-author"]').click();
  await expect(page).toHaveURL(/\/studio$/);
  await openArchitecture.scrollIntoViewIfNeeded();
  await settleNativeScroll(page);
  const ordinaryPosition = await page.evaluate(() => scrollY);
  expect(ordinaryPosition).toBeGreaterThan(500);
  await openArchitecture.click();
  await expect(page).toHaveURL(/\/studio\/modules\/architecture$/);
  await expect(
    page.getByRole("button", { name: "Advance packet", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/studio$/);
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => scrollY)) - ordinaryPosition),
    )
    .toBeLessThan(3);
  await expect(canvas).toHaveAttribute(
    "data-test-identity",
    "header-persistent",
  );
});

test("active chapters follow native anchors after wide and mobile resizing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");
  for (const width of [1920, 320, 1280]) {
    await page.setViewportSize({ width, height: 720 });
    await settleNativeScroll(page);
    if (width < 768)
      await page
        .getByRole("button", { name: "Navigation", exact: true })
        .click();
    const navigation = page.getByRole("navigation", {
      name: width < 768 ? "Mobile Studio navigation" : "Studio navigation",
      exact: true,
      includeHidden: true,
    });
    const capabilities = navigation.getByRole("link", {
      name: "Capabilities",
      exact: true,
      includeHidden: true,
    });
    await expect(capabilities).toBeVisible();
    await capabilities.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#studio-capabilities$/);
    await expect(capabilities).toHaveAttribute("aria-current", "location");
    await expect(
      page.getByRole("heading", {
        name: "Less promise. More proof.",
        exact: true,
      }),
    ).toBeInViewport();
  }
  await expect(page.locator("canvas[data-studio-canvas]")).toHaveCount(0);
});

test("kinetic headings enter once when visible and remain semantic", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/studio");
  const hero = page.getByRole("heading", { level: 1 });
  await expect(hero).toHaveAttribute("data-kinetic-entered", "true");
  const architecture = page.getByRole("heading", {
    name: "Make the invisible understandable.",
    exact: true,
  });
  await expect(architecture).not.toHaveAttribute(
    "data-kinetic-entered",
    "true",
  );
  await architecture.scrollIntoViewIfNeeded();
  await expect(architecture).toHaveAttribute("data-kinetic-entered", "true");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(architecture).toHaveAttribute("data-kinetic-entered", "true");
  await expect(hero).toHaveAccessibleName(
    "I engineer systems. I test what should exist next.",
  );
});

test("matrix mounts one working lazy preview at a time", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");
  await page
    .getByRole("button", { name: "Preview Policy Workflow", exact: true })
    .click();
  await expect(
    page.getByRole("region", {
      name: "Policy Workflow workbench",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Validate input", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Input validated" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preview Data Explorer", exact: true })
    .click();
  await expect(
    page.getByRole("region", {
      name: "Policy Workflow workbench",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Data Explorer workbench", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search notes").fill("café");
  await expect(
    page.getByRole("status").filter({ hasText: "1 notes" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await expect(page.locator("[data-studio-preview]")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Preview Data Explorer", exact: true }),
  ).toBeFocused();
});

test("story progress follows geometry after a live preview expands", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/studio");
  const canvas = page.locator("canvas[data-studio-canvas]");
  await expect(canvas).toHaveCount(1);
  await page
    .getByRole("button", { name: "Preview Interface Lab", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "One interaction. A clear purpose.",
      exact: true,
    }),
  ).toBeVisible();
  const expected = await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>("[data-studio-story]")!;
    const top = story.getBoundingClientRect().top + scrollY;
    const destination =
      document.getElementById("studio-architecture")!.getBoundingClientRect()
        .top + scrollY;
    window.scrollTo({ top: destination, behavior: "instant" });
    return Math.max(
      0,
      Math.min(1, (destination - top) / (story.offsetHeight - innerHeight)),
    );
  });
  await expect
    .poll(() =>
      canvas.evaluate(
        (element) =>
          (
            element as HTMLCanvasElement & {
              __studioDiagnostics: { progress: number };
            }
          ).__studioDiagnostics.progress,
      ),
    )
    .toBeCloseTo(expected, 2);
});

test("a real contact draft survives in-place GPU recovery", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/studio/connect?intent=partner");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Start a conversation.",
  );
  const canvas = page.locator("canvas[data-studio-canvas]");
  await expect(canvas).toHaveCount(1);
  await page.getByLabel("Your name", { exact: true }).fill("Draft Builder");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("draft@example.invalid");
  await page
    .getByLabel("What do you have in mind?", { exact: true })
    .fill("A local draft for visual recovery proof.");
  await canvas.evaluate((element) =>
    element.dispatchEvent(
      new Event("webglcontextlost", { cancelable: true, bubbles: true }),
    ),
  );
  await page.getByRole("button", { name: "Retry visual", exact: true }).click();
  await expect(canvas).toHaveCount(1);
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Draft Builder",
  );
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "draft@example.invalid",
  );
  await expect(
    page.getByLabel("What do you have in mind?", { exact: true }),
  ).toHaveValue("A local draft for visual recovery proof.");
});
