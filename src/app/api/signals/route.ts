import { createSignalsHandler } from "@/lib/server/signals";

export const runtime = "nodejs";
export const maxDuration = 15;

export const GET = createSignalsHandler();
