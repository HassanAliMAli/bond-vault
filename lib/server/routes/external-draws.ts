import { Hono } from "hono";
import { success, error, getEnv } from "../lib";
import { getDb } from "../db";
import { draws as drawsTable, winningNumbers } from "../schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "../id";

export const externalDrawRoutes = new Hono<{ Bindings: Env }>()
  .get("/external/draws", async (c) => {
    const r2 = c.env.R2;
    const denom = c.req.query("denomination");
    const prefix = denom ? `draws/${denom}/` : "draws/";

    let objects: R2Object[];
    try {
      const result = await r2.list({ prefix, limit: 500 });
      objects = result.objects;
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to list draws", 500);
    }

    const result = [];
    for (const obj of objects) {
      if (!obj.key.endsWith(".json") || obj.key === "draws/index.json") continue;
      try {
        const data = await r2.get(obj.key);
        if (data) {
          const text = await data.text();
          result.push(JSON.parse(text));
        }
      } catch {
        // skip unparseable files
      }
    }

    result.sort((a, b) => {
      const da = a.drawDate || "";
      const db = b.drawDate || "";
      return db.localeCompare(da);
    });

    return success(c, { draws: result });
  })

  .get("/external/draws/index", async (c) => {
    const r2 = c.env.R2;
    try {
      const obj = await r2.get("draws/index.json");
      if (!obj) return error(c, "NOT_FOUND", "Index not found", 404);
      const text = await obj.text();
      return success(c, JSON.parse(text));
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to read index", 500);
    }
  })

  .get("/external/draws/:denomination/:date", async (c) => {
    const r2 = c.env.R2;
    const denom = c.req.param("denomination");
    const date = c.req.param("date");
    const key = `draws/${denom}/${date}.json`;

    try {
      const obj = await r2.get(key);
      if (!obj) return error(c, "NOT_FOUND", "Draw not found", 404);
      const text = await obj.text();
      return success(c, JSON.parse(text));
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to read draw", 500);
    }
  })

  .post("/external/draws/import", async (c) => {
    const auth = c.req.header("Authorization");
    if (auth !== `Bearer ${c.env.BETTER_AUTH_SECRET}`) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const env = getEnv(c);
    const db = getDb(env.DB);
    const body = await c.req.json();
    const { denomination, drawNumber, drawDate, winningNumbers: winners } = body;

    if (!denomination || !drawDate) {
      return error(c, "VALIDATION_ERROR", "denomination and drawDate are required", 400);
    }

    // Check if draw already exists
    const existing = await db
      .select({ id: drawsTable.id })
      .from(drawsTable)
      .where(
        and(
          eq(drawsTable.denomination, denomination),
          drawNumber ? eq(drawsTable.drawNumber, drawNumber) : eq(drawsTable.drawDate, drawDate)
        )
      )
      .get();

    if (existing) {
      return success(c, { id: existing.id, status: "already_exists" });
    }

    const drawId = generateId();

    const prizeAmounts: Record<string, number> = {
      first: denomination === 100 ? 700000
        : denomination === 200 ? 750000
        : denomination === 750 ? 1500000
        : denomination === 1500 ? 3000000
        : denomination === 25000 ? 30000000
        : denomination === 40000 ? 50000000
        : 0,
      second: denomination === 100 ? 200000
        : denomination === 200 ? 250000
        : denomination === 750 ? 500000
        : denomination === 1500 ? 1000000
        : denomination === 25000 ? 10000000
        : denomination === 40000 ? 10000000
        : 0,
      third: denomination === 100 ? 1000
        : denomination === 200 ? 1250
        : denomination === 750 ? 9300
        : denomination === 1500 ? 18500
        : denomination === 25000 ? 300000
        : denomination === 40000 ? 500000
        : 0,
    };

    await db.insert(drawsTable).values({
      id: drawId,
      denomination,
      drawNumber: drawNumber || null,
      drawDate,
      source: "savings.gov.pk",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (winners && winners.length > 0) {
      const deduped = new Map<string, typeof winners[number]>();
      for (const w of winners) {
        const key = `${w.bondNumber}-${w.prizeType}`;
        if (!deduped.has(key)) deduped.set(key, w);
      }

      const batch = [];
      for (const w of deduped.values()) {
        batch.push({
          id: generateId(),
          drawId,
          bondNumber: w.bondNumber,
          prizeType: w.prizeType,
          prizeAmount: prizeAmounts[w.prizeType] || 0,
          createdAt: new Date().toISOString(),
        });
      }

      for (let i = 0; i < batch.length; i += 100) {
        await db.insert(winningNumbers).values(batch.slice(i, i + 100));
      }
    }

    return success(c, { id: drawId, status: "imported", winnerCount: winners?.length || 0 }, 201);
  });
