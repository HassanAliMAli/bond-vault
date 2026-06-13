/// <reference types="@cloudflare/workers-types" />

import { handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup } from "../lib/server/services";

const WARM_URLS = [
  "https://bondvault.hassanali205031.workers.dev/api/v1/health",
  "https://bondvault.hassanali.site/api/v1/health",
];

async function keepWarm() {
  for (const url of WARM_URLS) {
    try {
      const res = await fetch(url, { method: "GET" });
      console.log(`[keep-warm] ${url}: ${res.status}`);
    } catch (e) {
      console.error(`[keep-warm] Failed ${url}:`, e);
    }
  }
}

const DAILY_CUTOFF = "06:00";

function shouldRunDaily(): boolean {
  const now = new Date();
  const hh = now.getUTCHours().toString().padStart(2, "0");
  const mm = now.getUTCMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;
  return time === DAILY_CUTOFF || time === "06:01" || time === "06:02" ||
         time === "06:03" || time === "06:04";
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log("[cron-worker] Triggered at", new Date().toISOString());

    _ctx.waitUntil(keepWarm());

    if (shouldRunDaily()) {
      console.log("[cron-worker] Running daily cleanup tasks");
      await handleSubscriptionExpiration(env);
      await handleRetentionCleanup(env);
      await handleImportCleanup(env);
    }
  },
};
