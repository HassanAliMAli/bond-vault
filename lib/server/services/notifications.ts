import { getDb } from "../db";
import { notificationBatches, notifications, notificationPreferences, type NotificationChannel } from "../schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "../id";

export interface BatchNotificationParams {
  userId: string;
  matchIds: string[];
  drawName: string;
  totalPrizeValue: number;
  prizeBreakdown: Record<string, number>;
}

export async function createNotificationBatch(
  env: Env,
  params: BatchNotificationParams
) {
  const db = getDb(env.DB);

  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, params.userId))
    .get();

  const channels: NotificationChannel[] = [];
  if (prefs?.emailEnabled) channels.push("email");
  if (prefs?.whatsappEnabled) channels.push("whatsapp");
  if (prefs?.smsEnabled) channels.push("sms");
  if (channels.length === 0) channels.push("email");

  const summaryLines = Object.entries(params.prizeBreakdown)
    .map(([tier, count]) => `  ${tier}: ${count}`)
    .join("\n");

  const title = `${params.matchIds.length} Winning Bond${params.matchIds.length !== 1 ? "s" : ""}`;
  const message = [
    `You have ${params.matchIds.length} winning bond${params.matchIds.length !== 1 ? "s" : ""} in ${params.drawName}.`,
    ``,
    `Prize Breakdown:`,
    summaryLines,
    ``,
    `Total Prize Value: Rs. ${params.totalPrizeValue.toLocaleString()}`,
    ``,
    `View details: https://bondvault.app/matches`,
  ].join("\n");

  for (const channel of channels) {
    const batchId = generateId();
    await db.insert(notificationBatches).values({
      id: batchId,
      userId: params.userId,
      channel,
      matchCount: params.matchIds.length,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    const notificationId = generateId();
    await db.insert(notifications).values({
      id: notificationId,
      userId: params.userId,
      batchId,
      channel,
      title,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }
}

export async function sendPendingNotifications(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const pending = await db
    .select()
    .from(notifications)
    .where(eq(notifications.status, "pending"))
    .all();

  let sent = 0;
  for (const notification of pending) {
    try {
      await sendNotification(env, notification);
      await db
        .update(notifications)
        .set({ status: "sent", sentAt: new Date().toISOString() })
        .where(eq(notifications.id, notification.id));
      sent++;
    } catch {
      await db
        .update(notifications)
        .set({ status: "failed" })
        .where(eq(notifications.id, notification.id));
    }
  }
  return sent;
}

async function sendNotification(env: Env, notification: { channel: string; userId: string; title: string | null; message: string | null }) {
  if (notification.channel === "email") {
    await sendEmail(env, notification);
  }
}

async function sendEmail(env: Env, notification: { userId: string; title: string | null; message: string | null }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "BondVault <notifications@bondvault.app>",
      to: notification.userId,
      subject: notification.title,
      text: notification.message,
    }),
  });
  if (!res.ok) {
    throw new Error(`Email send failed: ${res.status}`);
  }
}

export async function markNotificationRead(env: Env, userId: string, notificationId: string) {
  const db = getDb(env.DB);
  await db
    .update(notifications)
    .set({ status: "read", readAt: new Date().toISOString() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}
