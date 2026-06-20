// @ts-expect-error — Generated at build time by opennextjs-cloudflare
import { default as handler } from "./.open-next/worker.js";
import { handleQueueMessage } from "./lib/server/queue";
import {
  handleSubscriptionExpiration,
  handleRetentionCleanup,
  handleImportCleanup,
  sendPendingNotifications,
} from "./lib/server/services";

export default {
  fetch: handler.fetch,

  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext) {
    for (const msg of batch.messages) {
      switch (batch.queue) {
        case "match-generation":
          const body = msg.body as { drawId: string };
          await handleQueueMessage(env, body);
          break;
      }
      msg.ack();
    }
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case "0 0 * * *":
        await handleSubscriptionExpiration(env);
        await handleRetentionCleanup(env);
        break;
      case "0 2 * * 0":
        await handleImportCleanup(env);
        break;
      case "*/15 * * * *":
        await sendPendingNotifications(env);
        break;
    }
  },
} satisfies ExportedHandler<Env>;
