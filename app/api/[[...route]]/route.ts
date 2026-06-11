import { createApp } from "@/lib/server/app";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

function createHandler() {
  const app = createApp();
  return async function handler(request: Request) {
    return app.fetch(request);
  };
}

const handle = createHandler();

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
