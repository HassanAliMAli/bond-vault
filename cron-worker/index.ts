/// <reference types="@cloudflare/workers-types" />

import { handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup } from "../lib/server/services";

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleSubscriptionExpiration(env);
    await handleRetentionCleanup(env);
    await handleImportCleanup(env);
  },
};
