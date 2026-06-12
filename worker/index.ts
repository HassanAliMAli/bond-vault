import { handleMatchQueue, handleNotificationQueue, handleCleanupQueue, handleDrawQueue } from "../lib/server/queues";
import { handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup } from "../lib/server/services";

export default {
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    switch (batch.queue) {
      case "match-generation":
        await handleMatchQueue(env, batch);
        break;
      case "notification-delivery":
        await handleNotificationQueue(env, batch);
        break;
      case "cleanup-jobs":
        await handleCleanupQueue(env, batch);
        break;
      case "draw-processing":
        await handleDrawQueue(env, batch);
        break;
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case "0 0 * * *": {
        await handleSubscriptionExpiration(env);
        await handleRetentionCleanup(env);
        await handleImportCleanup(env);
        break;
      }
    }
  },
};
