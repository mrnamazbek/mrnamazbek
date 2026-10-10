import { createGitHubHandler } from "@/lib/server/github";

export const runtime = "nodejs";
export const maxDuration = 15;

export const GET = createGitHubHandler();
