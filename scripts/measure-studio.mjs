import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import os from "node:os";
import path from "node:path";

const base = process.env.STUDIO_BASE_URL || "http://127.0.0.1:4173";
const directory = path.resolve(
  process.env.STUDIO_REPORT_DIR || "output/playwright/studio-verification",
);
const channel = process.env.STUDIO_BROWSER_CHANNEL || "chrome";
const headless = process.env.STUDIO_HEADLESS === "1";
const viewport = { width: 1440, height: 900 };
let browser;
const percentile = (values, p) =>
  [...values].sort((a, b) => a - b)[
    Math.min(values.length - 1, Math.ceil(values.length * p) - 1)
  ];

try {
  const url = new URL("/studio", base).href;
  const reachable = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!reachable.ok)
    throw new Error(`Studio document returned ${reachable.status}`);
  await mkdir(directory, { recursive: true });
  browser = await chromium.launch({ channel, headless });
  const rootSession = await browser.newBrowserCDPSession();
  const gpu = await rootSession.send("SystemInfo.getInfo");
  const version = await rootSession.send("Browser.getVersion");
  const renderer = String(gpu.gpu.auxAttributes?.glRenderer || "");
  const software = /swiftshader|llvmpipe|software/i.test(renderer);
  if (!renderer)
    throw new Error(
      "GPU renderer unavailable; hardware conditions cannot be established",
    );
  if (software && process.env.STUDIO_ALLOW_SOFTWARE !== "1")
    throw new Error(`Hardware measurement refused: ${renderer}`);
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.route("**/api/contact", (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const resources = new Map();
  const pending = [];
  page.on("response", (response) => {
    if (
      response.request().resourceType() !== "script" ||
      !new URL(response.url()).pathname.startsWith("/_next/static/")
    )
      return;
    pending.push(
      (async () => {
        const body = await response.body();
        const key = new URL(response.url()).pathname;
        resources.set(key, {
          path: key,
          bytes: body.length,
          gzipBytes: gzipSync(body).length,
        });
      })().catch((error) => {
        throw new Error(
          `Cannot account for script ${response.url()}: ${error.message}`,
        );
      }),
    );
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  if (
    !(await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ))
  )
    throw new Error("Reduced-motion baseline was not effective");
  if (await page.locator("canvas[data-studio-canvas]").count())
    throw new Error("Static baseline unexpectedly mounted a canvas");
  await Promise.all(pending);
  const initialPaths = new Set(resources.keys());
  const initialScripts = [...resources.values()];
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("canvas[data-studio-canvas]").waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector("canvas[data-studio-canvas]")?.__studioDiagnostics
        ?.frames > 0,
  );
  await page.waitForLoadState("networkidle");
  await Promise.all(pending);
  const deferredScripts = [...resources.values()].filter(
    (entry) => !initialPaths.has(entry.path),
  );
  await page.bringToFront();
  const hasProfiler = await page
    .locator("[data-studio-runtime]")
    .evaluate((element) => Boolean(element.__studioProfiler));
  if (hasProfiler)
    throw new Error("Normal release build required; profiling hook is present");
  await page.mouse.move(700, 400);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(90);
  }
  await page.keyboard.press("Home");
  await page.waitForTimeout(1200);
  if (await page.evaluate(() => scrollY > 2))
    throw new Error("Native Home did not restore the measurement start");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.send("Network.enable");
  await page.evaluate(() => {
    const samples = { frames: [], longTasks: [], draws: [], active: true };
    window.__studioMeasure = samples;
    let previous;
    const capture = (now) => {
      if (!samples.active) return;
      if (previous !== undefined) samples.frames.push(now - previous);
      previous = now;
      const snapshot = document.querySelector(
        "canvas[data-studio-canvas]",
      )?.__studioDiagnostics;
      if (snapshot) samples.draws.push({ time: now, ...snapshot });
      requestAnimationFrame(capture);
    };
    new PerformanceObserver((list) =>
      samples.longTasks.push(
        ...list.getEntries().map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
        })),
      ),
    ).observe({ type: "longtask" });
    requestAnimationFrame(capture);
  });
  await cdp.send("Tracing.start", {
    categories:
      "devtools.timeline,v8,blink.user_timing,cc,benchmark,disabled-by-default-devtools.timeline.frame",
    transferMode: "ReturnAsStream",
  });
  await page.evaluate(() => performance.mark("studio-scroll-start"));
  const scrollDistance = await page.evaluate(
    () => document.documentElement.scrollHeight - innerHeight,
  );
  const wheelStep = Math.ceil(scrollDistance / 30);
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, i < 30 ? wheelStep : -wheelStep);
    await page.waitForTimeout(55);
    if (i === 29) await page.waitForTimeout(400);
  }
  await page.evaluate(() => {
    performance.mark("studio-scroll-end");
    window.__studioMeasure.active = false;
  });
  const rest = [];
  const restStart = await page.evaluate(() => performance.now());
  for (let i = 0; i <= 12; i++) {
    rest.push(
      await page.evaluate(
        (start) => ({
          elapsedMs: performance.now() - start,
          ...document.querySelector("canvas[data-studio-canvas]")
            .__studioDiagnostics,
        }),
        restStart,
      ),
    );
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => performance.mark("studio-idle-end"));
  const traceDone = new Promise((resolve) =>
    cdp.once("Tracing.tracingComplete", resolve),
  );
  await cdp.send("Tracing.end");
  const { stream } = await traceDone;
  let trace = "";
  while (true) {
    const chunk = await cdp.send("IO.read", { handle: stream });
    trace += chunk.base64Encoded
      ? Buffer.from(chunk.data, "base64").toString()
      : chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send("IO.close", { handle: stream });
  await writeFile(path.join(directory, "trace.json"), trace);
  const samples = await page.evaluate(() => ({
    ...window.__studioMeasure,
    dpr: devicePixelRatio,
    userAgent: navigator.userAgent,
    memory: navigator.deviceMemory,
    cores: navigator.hardwareConcurrency,
    motion: matchMedia("(prefers-reduced-motion: no-preference)").matches,
    coarse: matchMedia("(pointer: coarse)").matches,
    visibility: document.visibilityState,
    focused: document.hasFocus(),
  }));
  if (
    samples.frames.length < 60 ||
    samples.draws.length < 60 ||
    !samples.motion
  )
    throw new Error(
      `No meaningful motion measurement: ${samples.frames.length} samples`,
    );
  const lastChange = rest.reduce(
    (last, entry, i) =>
      i && entry.frames !== rest[i - 1].frames ? entry.elapsedMs : last,
    0,
  );
  const idleStopped =
    rest.at(-1).frames === rest.at(-3).frames && lastChange <= 1000;
  const sum = (entries) => entries.reduce((n, entry) => n + entry.gzipBytes, 0);
  const frameP95 = percentile(samples.frames, 0.95);
  const counts = {
    drawCalls: Math.max(...samples.draws.map((sample) => sample.drawCalls)),
    triangles: Math.max(...samples.draws.map((sample) => sample.triangles)),
    geometries: Math.max(...samples.draws.map((sample) => sample.geometries)),
    textures: Math.max(...samples.draws.map((sample) => sample.textures)),
  };
  const result = {
    measuredAt: new Date().toISOString(),
    commit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    productionSource:
      execFileSync("git", ["diff", "--name-only", "--", "src"], {
        encoding: "utf8",
      }).trim() || "clean",
    buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(),
    environment: {
      browser: version,
      node: process.version,
      os: { platform: os.platform(), release: os.release(), arch: os.arch() },
      cpu: os.cpus()[0]?.model,
      gpu,
      renderer,
      software,
      device:
        process.env.STUDIO_DEVICE ||
        "local desktop; CPU and GPU identities recorded separately",
      systemMemoryBytes: os.totalmem(),
      viewport,
      dpr: samples.dpr,
      headless,
      channel,
      cache:
        "warm same-document JS/GPU state after static-to-interactive load and a full scroll; HTTP cache disabled by contact request interception",
      cpuThrottle: 1,
      networkThrottle: "none",
      reducedMotion: "no-preference (effective MQL asserted)",
      touch: samples.coarse,
      documentVisibility: samples.visibility,
      documentHasFocus: samples.focused,
      releaseProfilerAbsent: !hasProfiler,
    },
    accounting: {
      definition:
        "All same-origin Next script response bodies during static Studio entry; deferred scene is additional script paths after switching to no-preference. Includes framework/runtime, uses independent per-resource gzip, excludes CSS/RSC/HTML/fonts and unrequested workbench views. Does not claim total route transfer.",
      initialScripts,
      deferredScripts,
      initialGzipBytes: sum(initialScripts),
      deferredSceneGzipBytes: sum(deferredScripts),
    },
    timing: {
      source:
        "rAF intervals during warm scripted wheel scroll, not hardware presentation timestamps",
      samples: samples.frames.length,
      scrollDistance,
      wheelStep,
      p50: percentile(samples.frames, 0.5),
      p95: frameP95,
      max: Math.max(...samples.frames),
      over50ms: samples.frames.filter((n) => n > 50).length,
      longTasks: samples.longTasks,
      animationAttribution:
        "Long tasks are temporal observations; inspect raw trace before attributing causes.",
    },
    counts,
    idle: {
      samples: rest,
      lastChangeMs: lastChange,
      stoppedWithin1s: idleStopped,
    },
    unexpectedPageErrors: errors,
    budgets: {
      frameP95: { target: 16.7, actual: frameP95, pass: frameP95 <= 16.7 },
      drawCalls: {
        target: 100,
        actual: counts.drawCalls,
        pass: counts.drawCalls <= 100,
      },
      triangles: {
        target: 100000,
        actual: counts.triangles,
        pass: counts.triangles <= 100000,
      },
      initialGzip: {
        target: 350 * 1024,
        actual: sum(initialScripts),
        pass: sum(initialScripts) <= 350 * 1024,
      },
      deferredSceneGzip: {
        target: 450 * 1024,
        actual: sum(deferredScripts),
        pass: sum(deferredScripts) <= 450 * 1024,
      },
      idle: { pass: idleStopped },
    },
    artifacts: {
      trace: path.join(directory, "trace.json"),
      rawSamples: path.join(directory, "samples.json"),
      screenshot: path.join(directory, "desktop.png"),
    },
  };
  await page.screenshot({ path: result.artifacts.screenshot, fullPage: true });
  await writeFile(
    result.artifacts.rawSamples,
    JSON.stringify(samples, null, 2),
  );
  await writeFile(
    path.join(directory, "measurement.json"),
    JSON.stringify(result, null, 2),
  );
  if (errors.length)
    throw new Error(`Unexpected page errors: ${errors.join("; ")}`);
  console.log(
    JSON.stringify(
      {
        commit: result.commit,
        renderer,
        software,
        samples: samples.frames.length,
        timing: result.timing,
        counts,
        initialKiB: sum(initialScripts) / 1024,
        sceneKiB: sum(deferredScripts) / 1024,
        idleStopped,
        report: path.join(directory, "measurement.json"),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Studio measurement failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
