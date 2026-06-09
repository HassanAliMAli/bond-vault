import type { Context } from "hono";
import { getDb } from "../db";
import { payments, paymentReceipts } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  handleSubscriptionExpiration,
  handleRetentionCleanup,
  handleImportCleanup,
  handleFailedNotificationRetry,
} from "./cron";

export async function matchQueueConsumer(env: Env, _batch: MessageBatch) {
  // Match generation is triggered directly from admin endpoint
  console.log("Match queue consumer running");
}

export async function notificationQueueConsumer(env: Env, batch: MessageBatch) {
  let sent = 0;
  for (const msg of batch.messages) {
    try {
      const { batchId, userId, channel, message } = msg.body as {
        batchId: string;
        userId: string;
        channel: string;
        message: string;
      };

      if (channel === "email") {
        // Email delivery placeholder - integrate with an email provider
        console.log(`[Notification] To: ${userId}, Channel: ${channel}, Batch: ${batchId}, Message: ${message}`);
        sent++;
      }
    } catch (e) {
      console.error("Notification delivery failed:", e);
    }
  }
  console.log(`Notification queue processed ${sent}/${batch.messages.length} messages`);
}

export async function cleanupQueueConsumer(env: Env, _batch: MessageBatch) {
  const subs = await handleSubscriptionExpiration(env);
  const users = await handleRetentionCleanup(env);
  const imports = await handleImportCleanup(env);
  const notifs = await handleFailedNotificationRetry(env);
  console.log(
    `Cleanup: ${subs} subscriptions, ${users} users, ${imports} imports, ${notifs} notification retries`
  );
}

export async function drawQueueConsumer(env: Env, _batch: MessageBatch) {
  console.log("Draw queue consumer running");
}

export function createCronHandler(
  handler: (env: Env) => Promise<number>
): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    try {
      const env = c.env as Env;
      const count = await handler(env);
      return c.json({ success: true, count });
    } catch (e) {
      return c.json(
        { success: false, error: String(e) },
        500
      );
    }
  };
}
