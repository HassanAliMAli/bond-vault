import { Hono } from "hono";
import { getDb } from "../db";
import { winningNumbers, draws, matches } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { success, error, getEnv, getUserId } from "../lib";
import { createBondSchema } from "../validations";
import { generateMatchesForAllActiveBonds } from "../services/matches";

export const checkRoute = new Hono<{ Bindings: Env }>()
  .post("/check", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const body = await c.req.json();
    const parsed = createBondSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const { bondNumber, denomination } = parsed.data;
    const result = await db.select()
      .from(winningNumbers)
      .innerJoin(draws, eq(winningNumbers.drawId, draws.id))
      .where(and(eq(winningNumbers.bondNumber, bondNumber), eq(draws.denomination, denomination)))
      .all();

    const matchResults = result.map(m => ({
      bondNumber: m.winning_numbers.bondNumber,
      prizeType: m.winning_numbers.prizeType,
      prizeAmount: m.winning_numbers.prizeAmount,
      drawDate: m.draws.drawDate,
      drawNumber: m.draws.drawNumber,
    }));

    return success(c, { isWinner: matchResults.length > 0, matches: matchResults });
  })
  .post("/check/all", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = c.get("userId");
    if (!userId) return error(c, "UNAUTHORIZED", "Not logged in", 401);

    const count = await generateMatchesForAllActiveBonds(env, userId);

    const matchResults = await db
      .select()
      .from(matches)
      .where(and(eq(matches.userId, userId), eq(matches.status, "unseen")))
      .orderBy(desc(matches.createdAt))
      .all();

    return success(c, {
      matchesCreated: count,
      totalChecked: 0,
      matches: matchResults.map((m) => ({
        id: m.id,
        bondNumber: m.bondNumberSnapshot,
        denomination: String(m.denominationSnapshot ?? ""),
        prizeType: m.prizeTypeSnapshot ?? "",
        prizeAmount: m.prizeAmountSnapshot ? `Rs. ${m.prizeAmountSnapshot.toLocaleString()}` : "",
        drawDate: m.drawDateSnapshot ?? "",
        drawNumber: "",
      })),
    });
  });
