import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import type { ServerEnvironment } from "../supabase/server";
import {
  createSupabaseContactStore,
  type ContactStore,
} from "./contact-store";
import {
  jsonResponse,
  readLimitedJson,
  RequestError,
  requireTrustedOrigin,
} from "./http";

const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    message: z.string().trim().min(10).max(5_000),
    website: z.string().max(200).optional().default(""),
  })
  .strict();

const MAX_BODY_BYTES = 24_000;
const RATE_WINDOW_SECONDS = 3_600;
const UNAVAILABLE_MESSAGE = "The contact form is temporarily unavailable. Please use the email link.";

interface ContactHandlerDependencies {
  environment?: ServerEnvironment;
  getStore?: (environment: ServerEnvironment) => ContactStore | null;
  logger?: Pick<Console, "error">;
}

function rateLimitKey(secret: string, kind: string, value: string): string {
  return `${kind}:${createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex")}`;
}

function clientAddress(request: Request, environment: ServerEnvironment): string {
  // Forwarded headers are trusted only behind Vercel's proxy, which overwrites them.
  // Other hosts share one bucket until their trusted proxy is explicitly configured.
  if (environment.VERCEL !== "1") return "local-or-untrusted-proxy";
  const address = (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    ""
  ).split(",")[0].trim();
  return isIP(address) ? address : "unknown-vercel-address";
}

export function createContactHandler(dependencies: ContactHandlerDependencies = {}) {
  return async function handleContact(request: Request): Promise<Response> {
    const environment = dependencies.environment ?? process.env;
    const logger = dependencies.logger ?? console;

    try {
      requireTrustedOrigin(request, environment);
      const payload = contactSchema.safeParse(await readLimitedJson(request, MAX_BODY_BYTES));
      if (!payload.success || payload.data.website.trim()) {
        return jsonResponse(
          { ok: false, error: "Please check your name, email, and message (10–5,000 characters)." },
          400,
        );
      }

      const secret =
        environment.CONTACT_RATE_LIMIT_SECRET ||
        environment.SUPABASE_SECRET_KEY ||
        environment.SUPABASE_SERVICE_ROLE_KEY;
      const store = (dependencies.getStore ?? createSupabaseContactStore)(environment);
      if (!store || !secret) {
        return jsonResponse({ ok: false, error: UNAVAILABLE_MESSAGE }, 503);
      }

      const limits = [
        { kind: "ip", value: clientAddress(request, environment), limit: 5 },
        { kind: "email", value: payload.data.email, limit: 3 },
      ];
      for (const { kind, value, limit } of limits) {
        const result = await store.consumeRateLimit(
          rateLimitKey(secret, kind, value),
          limit,
          RATE_WINDOW_SECONDS,
        );
        if (!result.allowed) {
          return jsonResponse(
            { ok: false, error: "Too many messages. Please try again later or use the email link." },
            429,
            { "Retry-After": String(Math.max(1, result.retryAfter)) },
          );
        }
      }

      const { name, email, message } = payload.data;
      await store.saveMessage({ name, email, message });
      return jsonResponse({ ok: true, message: "Your message was saved. Thank you for reaching out." }, 201);
    } catch (error) {
      if (error instanceof RequestError) {
        return jsonResponse({ ok: false, error: error.message }, error.status);
      }
      // Do not log a request body, email, IP address, or database credentials.
      logger.error("Contact request failed: database or rate limiter unavailable.");
      return jsonResponse({ ok: false, error: UNAVAILABLE_MESSAGE }, 503);
    }
  };
}
