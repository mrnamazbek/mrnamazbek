import type { Page } from "@playwright/test";

const navigationReads = new Set(["/studio", "/studio/connect", "/", "/v2"]);

export async function trapDemoRequests(page: Page): Promise<string[]> {
  const unexpected: string[] = [];
  const origin = new URL(page.url()).origin;
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const localGet = request.method() === "GET" && url.origin === origin;
    const frameworkRead =
      localGet &&
      request.headers().rsc === "1" &&
      navigationReads.has(url.pathname);
    const assetRead =
      localGet &&
      ["script", "stylesheet", "font", "image"].includes(
        request.resourceType(),
      ) &&
      (url.pathname.startsWith("/_next/static/") ||
        url.pathname === "/favicon.ico");
    if (frameworkRead || assetRead) return route.continue();
    unexpected.push(`${request.method()} ${url.pathname}`);
    return route.abort();
  });
  return unexpected;
}
