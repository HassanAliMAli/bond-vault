import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const workerPath = resolve(import.meta.dirname, "../.open-next/worker.js");

let code = readFileSync(workerPath, "utf8");

// Inject keep-warm function after imports but before the default export
const keepWarmCode = `
// Keep-warm: self-sustaining chain via ctx.waitUntil
// Ensures the worker stays warm without requiring a cron trigger
const KEEP_WARM_INTERVAL_MS = 240_000; // 4 minutes
const KEEP_WARM_URLS = [
  "https://bondvault.hassanali205031.workers.dev/api/v1/health",
  "https://bondvault.hassanali.site/api/v1/health",
];

function scheduleKeepWarm(env, ctx) {
  if (env.ENVIRONMENT !== "production") return;
  ctx.waitUntil(
    new Promise((resolve) => setTimeout(resolve, KEEP_WARM_INTERVAL_MS))
      .then(async () => {
        for (const url of KEEP_WARM_URLS) {
          try {
            await fetch(url, { method: "GET" });
          } catch {
            // Swallow — keep-alive failure is non-critical
          }
        }
      })
      .catch(() => {})
  );
}
`;

// Insert keepWarm before the default export
code = code.replace(
  "export default {",
  keepWarmCode + "\nexport default {"
);

// Add scheduleKeepWarm call inside the fetch handler, before returning
code = code.replace(
  "return runWithCloudflareRequestContext(request, env, ctx, async () => {",
  "return runWithCloudflareRequestContext(request, env, ctx, async () => { scheduleKeepWarm(env, ctx);"
);

writeFileSync(workerPath, code, "utf8");
console.log("[keep-warm] Injected self-warming into worker.js");
