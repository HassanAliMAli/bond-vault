import { createApp } from "@/lib/server/app";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

let app: ReturnType<typeof createApp>;
try {
  app = createApp();
} catch (e) {
  console.error("createApp failed at init:", e);
  throw e;
}

async function handler(request: Request) {
  try {
    const cf = await getCloudflareContext();
    return app.fetch(request, cf.env, cf.ctx);
  } catch (e) {
    console.error("Handler error:", e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
