import "server-only";

import { z } from "zod";
import {
  createSupabaseAdminClient,
  type ServerEnvironment,
} from "../supabase/server";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ContactRateLimit {
  allowed: boolean;
  retryAfter: number;
}

export interface ContactStore {
  consumeRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<ContactRateLimit>;
  saveMessage(message: ContactMessage): Promise<void>;
}

const rateLimitResultSchema = z
  .array(
    z.object({
      allowed: z.boolean(),
      retry_after: z.number().int().min(0).max(86_400),
    }),
  )
  .length(1);

export function createSupabaseContactStore(
  environment: ServerEnvironment = process.env,
): ContactStore | null {
  const client = createSupabaseAdminClient(environment);
  if (!client) return null;

  return {
    async consumeRateLimit(key, limit, windowSeconds) {
      const { data, error } = await client.rpc("consume_contact_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) throw new Error("Contact rate limiter unavailable");

      const result = rateLimitResultSchema.safeParse(data);
      if (!result.success) throw new Error("Contact rate limiter returned invalid data");
      return {
        allowed: result.data[0].allowed,
        retryAfter: result.data[0].retry_after,
      };
    },
    async saveMessage(message) {
      const { error } = await client.from("contact_messages").insert(message);
      if (error) throw new Error("Contact persistence unavailable");
    },
  };
}
