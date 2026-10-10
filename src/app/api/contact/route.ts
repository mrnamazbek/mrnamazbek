import { createContactHandler } from "@/lib/server/contact";

export const runtime = "nodejs";
export const maxDuration = 30;

export const POST = createContactHandler();
