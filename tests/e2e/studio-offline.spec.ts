import { test, expect } from "@playwright/test";
import { trapDemoRequests } from "./helpers/studio-network";
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
});

const fixtures = [
  ["policy-workflow", "Policy Workflow", "240 LAB credits → hub-a"],
  ["data-explorer", "Data Explorer", "19 invented records · four categories"],
  [
    "architecture",
    "Architecture Inspector",
    "Source → Validate → Transform → Serve",
  ],
  ["interface-lab", "Interface Lab", "Appearance · Resilience · Motion"],
  ["locale-inspector", "Locale Inspector", "English · Русский · Қазақша"],
  ["form-workbench", "Form Workbench", "No request is sent."],
] as const;

test("every Studio document is visibly readable with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const contacts: string[] = [];
  await page.route("**/api/contact", (route) => {
    contacts.push(route.request().method());
    return route.abort();
  });
  await page.goto(new URL("/studio", baseURL!).href);
  const hero = page.getByRole("heading", { level: 1 });
  await expect(hero).toBeVisible();
  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toBeInViewport();
  await expect(page.getByRole("button", { name: /^Preview / })).toHaveCount(6);
  for (const button of await page
    .getByRole("button", { name: /^Preview / })
    .all())
    await expect(button).toBeDisabled();
  for (const [slug, title, sample] of fixtures) {
    await page.goto(new URL(`/studio/modules/${slug}`, baseURL!).href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const value = page.getByText(sample, { exact: true });
    await value.scrollIntoViewIfNeeded();
    await expect(value).toBeVisible();
    await expect(value).toBeInViewport();
    for (const value of await page
      .locator('dl[aria-label="Read-only initial fixture"] dd')
      .all())
      await expect(value).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Preparing workbench", exact: true }),
    ).toBeDisabled();
    await expect(page.locator("input, textarea, form")).toHaveCount(0);
    await page
      .getByRole("link", { name: "Back to the lab", exact: true })
      .click();
    await expect(page).toHaveURL(/\/studio#studio-capabilities$/);
    await expect(page.locator("#studio-capabilities")).toBeInViewport();
  }
  await page.goto(new URL("/studio/connect?intent=partner", baseURL!).href);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const control of await page
    .locator("input, textarea, button[type=submit]")
    .all())
    await expect(control).toBeDisabled();
  const email = page.getByRole("link", {
    name: "emailing me directly",
    exact: true,
  });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("href", /^mailto:/);
  expect(contacts).toEqual([]);
  await context.close();
});

test("lost lazy workbench import retains the visible fixture and explicitly reloads to retry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/contact", (route) => route.abort());
  let blocking = true;
  let blocked = 0;
  const expectedErrors: string[] = [];
  const unexpectedErrors: string[] = [];
  page.on("pageerror", (error) => {
    (/chunk|load/i.test(error.message)
      ? expectedErrors
      : unexpectedErrors
    ).push(error.message);
  });
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (
      blocking &&
      body.includes("Inspect the boundary before sending anything.")
    ) {
      blocked++;
      return route.abort();
    }
    return route.fulfill({ response, body });
  });
  await page.goto("/studio/modules/form-workbench");
  await expect(
    page.getByRole("heading", {
      name: "The enhancement could not load.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("No request is sent.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("input, textarea, form")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Back to the lab", exact: true }),
  ).toBeVisible();
  expect(blocked).toBeGreaterThan(0);
  await expect(page.getByText(/Reloading clears any edits/)).toBeVisible();
  blocking = false;
  await page
    .getByRole("button", {
      name: "Reload page to retry workbench",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Demo name", { exact: true })).toBeEnabled();
  expect(unexpectedErrors).toEqual([]);
  console.log(
    "STUDIO_EXPECTED_INJECTED_CHUNK_ERRORS",
    JSON.stringify({ blocked, expectedErrors }),
  );
});

test("local form has zero request, storage and native GET side effects from initialization", async ({
  page,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const target = new URL("/studio/modules/form-workbench", baseURL!).href;
  const calls = await trapDemoRequests(page, target);
  await page.addInitScript(() => {
    const metrics = { reads: 0, writes: 0 };
    Object.assign(window, { __studioOfflineStorage: metrics });
    for (const method of ["getItem", "setItem", "removeItem", "clear"] as const)
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value: () => {
          metrics[method === "getItem" ? "reads" : "writes"]++;
          throw new Error("Injected storage denial");
        },
      });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target);
  await expect(page.getByLabel("Demo name", { exact: true })).toBeEnabled();
  await page.getByLabel("Demo name", { exact: true }).fill("Offline Builder");
  await page.getByLabel("Demo name", { exact: true }).press("Enter");
  await expect(page).toHaveURL(target);
  for (const mode of ["success", "unavailable", "failure"]) {
    await page.getByLabel("Adapter mode").selectOption(mode);
    await page
      .getByRole("button", { name: "Start simulation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Advance response", exact: true })
      .click();
    await expect(page.getByLabel("Demo name", { exact: true })).toHaveValue(
      "Offline Builder",
    );
  }
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __studioOfflineStorage: object })
          .__studioOfflineStorage,
    ),
  ).toEqual({ reads: 0, writes: 0 });
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
});

test.describe("route ownership", () => {
  test("repeated routes and history retain one canvas and stable subscription counts", async ({
    page,
  }) => {
    await page.route("**/api/contact", (route) => route.abort());
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const watched = new Set([
        "studio:invalidate",
        "studio:story-ready",
        "pointermove",
        "pointerleave",
        "visibilitychange",
        "resize",
        "popstate",
        "hashchange",
        "keydown",
        "focusin",
        "click",
        "blur",
        "change",
      ]);
      const active = new Map<
        EventTarget,
        Map<string, Map<EventListenerOrEventListenerObject, Set<boolean>>>
      >();
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function (
        type,
        callback,
        options,
      ) {
        if (
          callback &&
          watched.has(type) &&
          (this === window ||
            this === document ||
            this instanceof MediaQueryList)
        ) {
          const events = active.get(this) || new Map();
          active.set(this, events);
          const callbacks = events.get(type) || new Map();
          events.set(type, callbacks);
          const captures = callbacks.get(callback) || new Set();
          callbacks.set(callback, captures);
          captures.add(
            typeof options === "boolean" ? options : options?.capture === true,
          );
        }
        return add.call(this, type, callback, options);
      };
      EventTarget.prototype.removeEventListener = function (
        type,
        callback,
        options,
      ) {
        if (callback)
          active
            .get(this)
            ?.get(type)
            ?.get(callback)
            ?.delete(
              typeof options === "boolean"
                ? options
                : options?.capture === true,
            );
        return remove.call(this, type, callback, options);
      };
      Object.assign(window, {
        __studioSubscriptions: () => {
          const counts: Record<string, number> = {};
          for (const events of active.values())
            for (const [type, callbacks] of events)
              for (const captures of callbacks.values())
                if (captures.size)
                  counts[type] = (counts[type] || 0) + captures.size;
          return counts;
        },
      });
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/studio");
    const canvas = page.locator("canvas[data-studio-canvas]");
    await expect(canvas).toHaveCount(1);
    await canvas.evaluate((element) =>
      element.setAttribute("data-verification-identity", "persistent"),
    );
    const counts = () =>
      page.evaluate(() =>
        (
          window as typeof window & {
            __studioSubscriptions: () => Record<string, number>;
          }
        ).__studioSubscriptions(),
      );
    const frames = () =>
      canvas.evaluate(
        (element) =>
          (
            element as HTMLCanvasElement & {
              __studioDiagnostics: { frames: number };
            }
          ).__studioDiagnostics.frames,
      );
    await page.waitForTimeout(1300);
    const before = await counts();
    for (let i = 0; i < 3; i++) {
      await page
        .getByRole("link", { name: "Open Policy Workflow", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Validate input", exact: true }),
      ).toBeEnabled();
      await expect(page.locator("[data-studio-runtime]")).toHaveAttribute(
        "data-scene-mode",
        "ambient",
      );
      await page.goBack();
      await expect(
        page.getByRole("heading", { level: 1 }),
      ).toHaveAccessibleName(
        "I engineer systems. I test what should exist next.",
      );
      await page.goForward();
      await expect(
        page.getByRole("button", { name: "Validate input", exact: true }),
      ).toBeEnabled();
      await page
        .getByRole("link", { name: "Back to the lab", exact: true })
        .click();
      await expect(page.locator("#studio-capabilities")).toBeFocused();
      await expect(canvas).toHaveAttribute(
        "data-verification-identity",
        "persistent",
      );
      await expect(canvas).toHaveCount(1);
      await page.waitForTimeout(1100);
      expect(await counts()).toEqual(before);
    }
    await page.mouse.move(5, 5);
    await page.waitForTimeout(1000);
    const settled = await frames();
    await page.waitForTimeout(500);
    expect(await frames()).toBe(settled);
    expect(errors).toEqual([]);
    console.log("STUDIO_STABLE_SUBSCRIPTIONS", JSON.stringify(before));
  });
});
