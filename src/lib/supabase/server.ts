import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ServerEnvironment = Record<string, string | undefined>;

function createServerClient(
  key: string | undefined,
  environment: ServerEnvironment,
): SupabaseClient | null {
  const rawUrl = environment.SUPABASE_URL?.trim();
  if (!rawUrl || !key?.trim()) return null;

  try {
    const url = new URL(rawUrl);
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal))
    ) {
      return null;
    }

    return createClient(url.toString().replace(/\/$/, ""), key.trim(), {
      // Mutation retries can duplicate a message or consume a throttle twice.
      db: { retry: false },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store",
            signal: init?.signal
              ? AbortSignal.any([init.signal, AbortSignal.timeout(8_000)])
              : AbortSignal.timeout(8_000),
          }),
      },
    });
  } catch {
    // A missing or invalid configuration must never look like a working database.
    return null;
  }
}

/** Privileged access is confined to server routes that perform authorization. */
export function createSupabaseAdminClient(
  environment: ServerEnvironment = process.env,
): SupabaseClient | null {
  return createServerClient(
    environment.SUPABASE_SECRET_KEY || environment.SUPABASE_SERVICE_ROLE_KEY,
    environment,
  );
}

/** Public content always observes the anon role's row-level security policies. */
export function createSupabaseContentClient(
  environment: ServerEnvironment = process.env,
): SupabaseClient | null {
  return createServerClient(
    environment.SUPABASE_PUBLISHABLE_KEY || environment.SUPABASE_ANON_KEY,
    environment,
  );
}
