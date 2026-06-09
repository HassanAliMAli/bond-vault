import { Hono } from "hono";
import { getDb } from "../db";
import { winningNumbers, draws } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { createBondSchema } from "../validations";

export const checkRoute = new Hono()
  .use(authMiddleware)
  .post("/check", async (c) => {
    const db = getDb((c.env as Env).DB);
    const body = await c.req.json();
    const parsed = createBondSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const { bondNumber, denomination } = parsed.data;

    const result = await db.select()
      .from(winningNumbers)
      .innerJoin(draws, eq(winningNumbers.drawId, draws.id))
      .where(and(
        eq(winningNumbers.bondNumber, bondNumber),
        eq(draws.denomination, denomination)
      ))
      .all();

    const matches = result.map(m => ({
      bondNumber: m.winning_numbers.bondNumber,
      prizeType: m.winning_numbers.prizeType,
      prizeAmount: m.winning_numbers.prizeAmount,
      drawDate: m.draws.drawDate,
      drawNumber: m.draws.drawNumber,
    }));

    return success(c, {
      isWinner: matches.length > 0,
      matches,
    });
  });
