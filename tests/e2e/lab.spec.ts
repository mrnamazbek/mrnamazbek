import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("regex worker evaluates expressions and recovers from invalid and expensive patterns", async ({ page }) => {
  await page.goto("/lab");
  await page.getByLabel("Regular expression").fill("\\d+");
  await page.getByLabel("Test string").fill("A 12 B 345");
  await expect(page.locator(".regex-results [role=status]")).toHaveText("2 MATCHES");
  await expect(page.locator(".regex-results li code")).toHaveText(["12", "345"]);
  await page.getByLabel("Regular expression").fill("[");
  await expect(page.locator(".regex-results [role=status]")).toHaveText("INVALID EXPRESSION");
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Test string").fill(`${"a".repeat(1_000)}b`);
  await expect(page.locator(".regex-results .error-text")).toContainText("took too long");
  await page.getByLabel("Regular expression").fill("\\d+");
  await page.getByLabel("Test string").fill("Recovered: 42");
  await expect(page.locator(".regex-results [role=status]")).toHaveText(/^1 MATCH(?:ES)?$/);
  await expect(page.locator(".regex-results li code")).toHaveText("42");
});

test("Docker generator updates the actual YAML and downloads it", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("navigation", { name: "Developer tools" }).getByRole("button", { name: "Docker Compose" }).click();
  await page.getByLabel("Database", { exact: true }).selectOption("mysql");
  await page.getByLabel("Host port").fill("3307");
  await page.getByLabel("Database name").fill("my_project");
  const code = page.locator(".code-output code");
  await expect(code).toContainText("image: mysql:8.4");
  await expect(code).toContainText('"127.0.0.1:3307:3306"');
  await expect(code).toContainText('MYSQL_DATABASE: "my_project"');
  await expect(code).toContainText("${DATABASE_PASSWORD:?Set DATABASE_PASSWORD in .env}");
  const generated = await code.innerText();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("compose.yaml");
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  let downloaded = "";
  for await (const chunk of stream!) downloaded += chunk.toString();
  expect(downloaded.trim()).toBe(generated.trim());
});

test("cost estimator uses editable assumptions and currency conversion", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("navigation", { name: "Developer tools" }).getByRole("button", { name: "Cost estimator" }).click();
  await expect(page.locator(".cost-total")).toContainText("$165");
  await page.locator("#cost-cpu").focus();
  await page.keyboard.press("End");
  await expect(page.locator(".cost-total")).toContainText("$1,065");
  await page.getByText("Adjust the assumptions", { exact: false }).click();
  await page.getByLabel("Compute / vCPU / month").fill("1");
  await expect(page.locator(".cost-total")).toContainText("$169");
  await page.getByRole("button", { name: "USD ↔" }).click();
  await expect(page.locator(".cost-total")).toContainText("84,500");
  await expect(page.getByText("illustrative assumptions", { exact: false })).toBeVisible();
});

test("world clock displays all four actual time zones", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("navigation", { name: "Developer tools" }).getByRole("button", { name: "World clock" }).click();
  const clocks = page.locator(".clock-grid article");
  await expect(clocks).toHaveCount(4);
  await expect(clocks.locator(".eyebrow")).toHaveText(["Almaty", "London", "New York", "Singapore"]);
  for (const clock of await clocks.all()) await expect(clock.locator("time")).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  const clockSeconds = (time: string) => time.split(":").map(Number).reduce((sum, value) => sum * 60 + value, 0);
  const almaty = clockSeconds(await clocks.nth(0).locator("time").innerText());
  const singapore = clockSeconds(await clocks.nth(3).locator("time").innerText());
  // The one-second clock tick can occur between reading the two elements.
  expect(Math.abs((singapore - almaty + 86_400) % 86_400 - 10_800)).toBeLessThanOrEqual(1);
});

test("pipeline validates real connections, rejects cycles, and exports the graph", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("navigation", { name: "Developer tools" }).getByRole("button", { name: "Pipeline architect" }).click();
  await page.getByRole("button", { name: "Validate graph" }).click();
  await expect(page.locator(".tool-status")).toHaveText("Valid DAG: 3 tasks and 2 connections.");
  await page.getByLabel("From task").selectOption("destination_3");
  await page.getByLabel("To task").selectOption("source_1");
  await page.getByRole("button", { name: "Add connection" }).click();
  await expect(page.locator(".tool-status")).toContainText("would create a cycle");
  await page.getByRole("button", { name: "View Airflow code" }).click();
  await expect(page.locator(".dag-export code")).toContainText("source_1 >> transform_2");
  await expect(page.locator(".dag-export code")).not.toContainText("destination_3 >> source_1");
  const source = page.getByRole("button", { name: "source: Raw data" });
  await source.focus();
  await page.keyboard.press("ArrowRight");
  await expect(source).toHaveAttribute("style", /left: 18\.75%;/);
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download DAG" }).click();
  expect((await downloading).suggestedFilename()).toBe("my_data_pipeline.py");
  await source.focus();
  await page.keyboard.press("Delete");
  await expect(page.locator(".pipeline-node")).toHaveCount(2);
  await page.getByRole("button", { name: "Validate graph" }).click();
  await expect(page.locator(".tool-status")).toContainText("Valid DAG: 2 tasks and 1 connection");
});

test("tech radar displays real API records or an explicit unavailable state", async ({ page }) => {
  const firstResponse = page.waitForResponse((response) => response.url().includes("/api/github?category=dataeng"));
  await page.goto("/lab");
  const response = await firstResponse;
  expect([200, 503]).toContain(response.status());
  if (response.status() === 200) {
    const payload = await response.json();
    if (payload.repositories.length) await expect(page.locator(".radar-grid h3 a").first()).toHaveText(payload.repositories[0].name);
  } else {
    await expect(page.getByText("GitHub is unavailable right now.", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore on GitHub" })).toHaveAttribute("href", "https://github.com/topics/data-engineering");
  }
  const pythonResponse = page.waitForResponse((item) => item.url().includes("/api/github?category=python"));
  await page.getByRole("button", { name: "Python", exact: true }).click();
  expect([200, 503]).toContain((await pythonResponse).status());
  await expect(page.getByRole("button", { name: "Python", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("Kazakhstan currency and weather display the actual API values or unavailable sources", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const responding = page.waitForResponse((response) => response.url().endsWith("/api/signals"));
  await page.goto("/lab");
  const response = await responding;
  expect([200, 503]).toContain(response.status());
  const payload = await response.json();
  const signals = page.locator("#ai-live-signals-root");
  await expect(signals.getByRole("heading", { name: "A view from Kazakhstan" })).toBeVisible();
  const currencyPanel = signals.locator("article").nth(0);
  if (payload.fx) {
    await expect(currencyPanel.locator("dl > div")).toHaveCount(4);
    for (const currency of ["USD", "RUB", "GBP", "EUR"]) {
      const row = currencyPanel.locator("dl > div").filter({ has: page.getByText(`1 ${currency}`, { exact: true }) });
      await expect(row.locator("dd")).toContainText(new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payload.fx.rates[currency]));
    }
    await expect(currencyPanel.locator("time")).toHaveAttribute("datetime", payload.fx.updatedAt);
  } else {
    await expect(currencyPanel).toContainText("Exchange rates are temporarily unavailable.");
    await expect(currencyPanel.locator("dl")).toHaveCount(0);
  }
  await expect(currencyPanel.getByRole("link", { name: "Rates by Exchange Rate API" })).toHaveAttribute("href", /^https:\/\/www\.exchangerate-api\.com\/?$/);
  const weatherPanel = signals.locator("article").nth(1);
  if (payload.weather.length) {
    for (const city of payload.weather) {
      const card = weatherPanel.getByText(city.city, { exact: true }).locator("..").locator("..");
      await expect(card).toContainText(`${city.temperatureC.toFixed(1)}`);
      await expect(card).toContainText(`Feels like ${city.feelsLikeC.toFixed(1)}°C`);
      await expect(card.locator("time")).toHaveAttribute("datetime", city.updatedAt);
    }
  } else {
    await expect(weatherPanel).toContainText("Weather data is temporarily unavailable.");
    await expect(weatherPanel.locator("time")).toHaveCount(0);
  }
  await expect(weatherPanel.getByRole("link", { name: "Weather by Open-Meteo" })).toHaveAttribute("href", "https://open-meteo.com/");
  for (const error of payload.errors) await expect(signals).toContainText(error);
  await expect(signals.locator(".source-note")).toContainText("timestamps show when each value was recorded");
  const accessibility = await new AxeBuilder({ page }).include("#ai-live-signals-root").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations.map(({ id, impact }) => ({ id, impact }))).toEqual([]);
});

test("all developer tools preserve accessible forms and controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab");
  for (const tool of ["Regex", "Docker Compose", "Cost estimator", "World clock", "Pipeline architect"]) {
    await page.getByRole("navigation", { name: "Developer tools" }).getByRole("button", { name: tool }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(({ id, impact }) => ({ id, impact })), tool).toEqual([]);
  }
});

test("system console runs bounded browser commands and clears its output", async ({ page }) => {
  await page.goto("/lab");
  const input = page.getByRole("textbox", { name: "Console command" });
  await input.fill("help");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("Commands: about");
  await input.fill("stack");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("Apache Iceberg / Trino");
  await input.fill("unknown-742b");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("Unknown command: unknown-742b");
  await input.fill("clear");
  await input.press("Enter");
  await expect(page.getByRole("log").locator("p")).toHaveCount(0);
});

test("saved experiments and audience signals preserve their source and methodology", async ({ page }) => {
  await page.goto("/lab");
  const experiment = page.locator(".monthly-experiment").first();
  await expect(experiment.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(experiment.locator(".source-note")).toContainText("Captured");
  const range = experiment.getByRole("slider");
  if (await range.count()) {
    await range.focus();
    await range.press("Home");
    const firstResult = await experiment.locator(".experiment-result strong").innerText();
    await range.press("End");
    const secondResult = await experiment.locator(".experiment-result strong").innerText();
    expect(Number(secondResult)).toBeGreaterThan(Number(firstResult));
    await expect(experiment).toContainText("Original illustrative model");
  } else if (await experiment.locator(".tradeoff-experiment").count()) {
    const options = experiment.getByRole("radio");
    expect(await options.count()).toBeGreaterThan(1);
    await expect(options.first()).toBeChecked();
    await options.last().check();
    await expect(options.last()).toBeChecked();
    await expect(experiment.locator(".tradeoff-outcome h4")).not.toHaveText("");
    await expect(experiment).toContainText("illustrative decision aid");
  } else {
    expect(await experiment.locator(".roadmap li").count()).toBeGreaterThan(0);
  }
  await page.getByText("Explore earlier experiments", { exact: false }).click();
  await expect(page.locator(".feature-archive .experiment-grid")).toBeVisible();
  const signals = page.locator("#signals");
  expect(await signals.locator(".audience-bars > div").count()).toBeGreaterThan(0);
  await expect(signals).toContainText("Last saved weekly pageviews");
  expect(await signals.locator(".ranking-table tbody tr").count()).toBeGreaterThan(0);
  await expect(signals.getByRole("link", { name: "View current rankings" })).toHaveAttribute("href", /^https:\/\/db-engines\.com\//);
});
