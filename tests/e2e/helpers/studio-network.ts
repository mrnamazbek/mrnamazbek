import type { Page } from "@playwright/test";

const navigationReads = new Set(["/studio", "/studio/connect", "/", "/v2"]);
const moduleSlugs = new Set([
  "policy-workflow",
  "data-explorer",
  "architecture",
  "interface-lab",
  "locale-inspector",
  "form-workbench",
]);

function isFrameworkRead(url: URL): boolean {
  const pathAllowed =
    navigationReads.has(url.pathname) ||
    (url.pathname.startsWith("/studio/modules/") &&
      moduleSlugs.has(url.pathname.slice(16)));
  return (
    pathAllowed &&
    url.searchParams.getAll("_rsc").length <= 1 &&
    url.searchParams.getAll("intent").length <= 1 &&
    [...url.searchParams].every(
      ([key, value]) =>
        key === "_rsc" ||
        (url.pathname === "/studio/connect" &&
          key === "intent" &&
          ["cofound", "invest", "partner"].includes(value)),
    )
  );
}

export async function trapDemoRequests(
  page: Page,
  initialDocument?: string,
): Promise<string[]> {
  const unexpected: string[] = [];
  const target = initialDocument ? new URL(initialDocument) : null;
  const origin = target?.origin ?? new URL(page.url()).origin;
  let initialReadPending = target !== null;
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const localGet = request.method() === "GET" && url.origin === origin;
    if (
      initialReadPending &&
      target &&
      localGet &&
      request.resourceType() === "document" &&
      url.pathname === target.pathname &&
      url.search === target.search
    ) {
      initialReadPending = false;
      return route.continue();
    }
    const frameworkRead =
      localGet && request.headers().rsc === "1" && isFrameworkRead(url);
    const assetRead =
      localGet &&
      [...url.searchParams].every(
        ([key, value]) =>
          ["dpl", "v"].includes(key) && /^[a-zA-Z0-9_-]{1,128}$/.test(value),
      ) &&
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
