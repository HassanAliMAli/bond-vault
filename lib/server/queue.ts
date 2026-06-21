import { generateMatchesForDraw } from "./services/matches";
import { sendPendingNotifications } from "./services/notifications";
import { handleSubscriptionExpiration } from "./services/cron";
import { handleRetentionCleanup, handleImportCleanup } from "./services/retention";
import { logger } from "./logger";

type MatchGenMessage = { drawId: string };
type NotifMessage = { type: "send-pending" };
type DrawProcessMessage = { drawId: string; action: "import" };
type CleanupMessage = { type: "maintenance" };

async function handleMatchGeneration(env: Env, msg: MatchGenMessage) {
  const count = await generateMatchesForDraw(env, msg.drawId);
  if (count > 0) {
    await env.NotificationDeliveryQueue.send({ type: "send-pending" });
  }
}

async function handleNotificationDelivery(env: Env, _msg: NotifMessage) {
  const sent = await sendPendingNotifications(env);
  logger.info("Queue: notifications sent", { count: sent });
}

async function handleDrawProcessing(env: Env, _msg: DrawProcessMessage) {
  logger.info("Queue: draw-processing stub — not yet implemented");
}

async function handleCleanupJobs(env: Env, _msg: CleanupMessage) {
  await handleSubscriptionExpiration(env);
  await handleRetentionCleanup(env);
  await handleImportCleanup(env);
  logger.info("Queue: cleanup jobs completed");
}

export async function handleQueueMessage(env: Env, batch: { queue: string; body: unknown }) {
  switch (batch.queue) {
    case "match-generation":
      await handleMatchGeneration(env, batch.body as MatchGenMessage);
      break;
    case "notification-delivery":
      await handleNotificationDelivery(env, batch.body as NotifMessage);
      break;
    case "draw-processing":
      await handleDrawProcessing(env, batch.body as DrawProcessMessage);
      break;
    case "cleanup-jobs":
      await handleCleanupJobs(env, batch.body as CleanupMessage);
      break;
  }
}
