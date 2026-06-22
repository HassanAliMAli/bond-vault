import { getDb } from "../db";
import {
  bonds,
  winningNumbers,
  draws,
  matches,
  notificationBatches,
  notifications,
  notificationPreferences,
  type NotificationChannel,
} from "../schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateId } from "../id";

export async function generateMatchesForDraw(env: Env, drawId: string): Promise<number> {
  const db = getDb(env.DB);

  const draw = await db.select().from(draws).where(eq(draws.id, drawId)).get();
  if (!draw) return 0;

  const winning = await db
    .select()
    .from(winningNumbers)
    .where(eq(winningNumbers.drawId, drawId))
    .all();

  if (winning.length === 0) return 0;

  const userBonds = await db
    .select()
    .from(bonds)
    .where(
      and(
        eq(bonds.denomination, draw.denomination),
        eq(bonds.status, "active"),
        isNull(bonds.deletedAt)
      )
    )
    .all();

  const bondMap = new Map<string, typeof userBonds[number][]>();
  for (const bond of userBonds) {
    const key = bond.bondNumber.padStart(6, "0");
    if (!bondMap.has(key)) bondMap.set(key, []);
    bondMap.get(key)!.push(bond);
  }

  let matchCount = 0;
  const userMatchesMap = new Map<string, { matchIds: string[]; prizeBreakdown: Record<string, number>; totalPrize: number }>();

  for (const wn of winning) {
    const matchingBonds = bondMap.get(wn.bondNumber.padStart(6, "0")) || [];
    for (const bond of matchingBonds) {
      const existing = await db
        .select({ id: matches.id })
        .from(matches)
        .where(
          and(
            eq(matches.bondId, bond.id),
            eq(matches.drawId, drawId),
            eq(matches.winningNumberId, wn.id)
          )
        )
        .get();

      if (existing) continue;

      const matchId = generateId();
      await db.insert(matches).values({
        id: matchId,
        userId: bond.userId,
        bondId: bond.id,
        winningNumberId: wn.id,
        drawId: drawId,
        bondNumberSnapshot: bond.bondNumber,
        denominationSnapshot: bond.denomination,
        prizeTypeSnapshot: wn.prizeType,
        prizeAmountSnapshot: wn.prizeAmount,
        drawDateSnapshot: draw.drawDate,
        status: "unseen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      matchCount++;

      if (!userMatchesMap.has(bond.userId)) {
        userMatchesMap.set(bond.userId, { matchIds: [], prizeBreakdown: {}, totalPrize: 0 });
      }
      const userData = userMatchesMap.get(bond.userId)!;
      userData.matchIds.push(matchId);
      userData.prizeBreakdown[wn.prizeType] = (userData.prizeBreakdown[wn.prizeType] || 0) + 1;
      userData.totalPrize += wn.prizeAmount;
    }
  }

  for (const [userId, data] of userMatchesMap) {
    await createNotificationBatch(env, userId, data, draw);
  }

  return matchCount;
}

async function createNotificationBatch(
  env: Env,
  userId: string,
  data: { matchIds: string[]; prizeBreakdown: Record<string, number>; totalPrize: number },
  draw: typeof draws.$inferSelect
) {
  const db = getDb(env.DB);

  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .get();

  const channels: NotificationChannel[] = [];
  if (prefs?.emailEnabled) channels.push("email");
  if (prefs?.whatsappEnabled) channels.push("whatsapp");
  if (prefs?.smsEnabled) channels.push("sms");
  if (channels.length === 0) return;

  const summaryLines = Object.entries(data.prizeBreakdown)
    .map(([tier, count]) => `  ${tier}: ${count}`)
    .join("\n");

  const title = `${data.matchIds.length} Winning Bond${data.matchIds.length !== 1 ? "s" : ""}`;
  const message = [
    `You have ${data.matchIds.length} winning bond${data.matchIds.length !== 1 ? "s" : ""} in Draw #${draw.drawNumber || ""}.`,
    ``,
    `Prize Breakdown:`,
    summaryLines,
    ``,
    `Total Prize Value: Rs. ${data.totalPrize.toLocaleString()}`,
  ].join("\n");

  for (const channel of channels) {
    const batchId = generateId();
    await db.insert(notificationBatches).values({
      id: batchId,
      userId,
      channel,
      matchCount: data.matchIds.length,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    await db.insert(notifications).values({
      id: generateId(),
      userId,
      batchId,
      channel,
      title,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }
}


