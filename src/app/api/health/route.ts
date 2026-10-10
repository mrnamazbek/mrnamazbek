import { jsonResponse } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Liveness only; does not expose credentials or claim that persistence is ready. */
export function GET(): Response {
  return jsonResponse({ status: "ok" });
}
