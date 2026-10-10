import "server-only";

import type { ServerEnvironment } from "../supabase/server";

export class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(body, { status, headers });
}

function validOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function requireTrustedOrigin(
  request: Request,
  environment: ServerEnvironment,
): void {
  const origin = request.headers.get("origin");
  const parsedOrigin = validOrigin(origin ?? undefined);
  const requestOrigin = validOrigin(request.url);
  const allowedOrigins = new Set<string>();
  if (requestOrigin) allowedOrigins.add(requestOrigin);

  // Next may normalize request.url to localhost. Host still identifies the actual
  // request target; browsers cannot substitute a different Host header.
  const host = request.headers.get("host");
  if (host && /^[a-zA-Z0-9.\[\]:-]{1,255}$/.test(host)) {
    const proxyProtocol = request.headers.get("x-forwarded-proto");
    const protocol = environment.VERCEL === "1" && ["http", "https"].includes(proxyProtocol ?? "")
      ? `${proxyProtocol}:`
      : new URL(request.url).protocol;
    const actualOrigin = validOrigin(`${protocol}//${host}`);
    if (actualOrigin) allowedOrigins.add(actualOrigin);
  }

  const configuredOrigins = [
    environment.SITE_URL,
    ...(environment.CONTACT_ALLOWED_ORIGINS?.split(",") ?? []),
    ...[
      environment.VERCEL_URL,
      environment.VERCEL_BRANCH_URL,
      environment.VERCEL_PROJECT_PRODUCTION_URL,
    ]
      .filter(Boolean)
      .map((hostname) => `https://${hostname}`),
  ];
  for (const configured of configuredOrigins) {
    const allowedOrigin = validOrigin(configured?.trim());
    if (allowedOrigin) allowedOrigins.add(allowedOrigin);
  }

  if (
    !parsedOrigin ||
    origin !== parsedOrigin ||
    !allowedOrigins.has(parsedOrigin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new RequestError(403, "Please submit the form from this website.");
  }
}

/** Enforce the limit while reading, even when Content-Length is absent or false. */
export async function readLimitedJson(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get("content-type") ?? "")) {
    throw new RequestError(415, "Please submit the form as JSON.");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      throw new RequestError(400, "The request body is invalid.");
    }
    if (Number(contentLength) > maxBytes) {
      throw new RequestError(413, "Your message is too large.");
    }
  }

  if (!request.body) throw new RequestError(400, "The request body is invalid.");

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel().catch(() => undefined);
        throw new RequestError(413, "Your message is too large.");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, "The request body is invalid.");
  } finally {
    reader.releaseLock();
  }
}
