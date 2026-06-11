import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../schema";
import { eq, and, like, isNull } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { createBondSchema } from "../validations";
import { generateId } from "../id";

export const bondRoutes = new Hono()
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const denomination = c.req.query("denomination");
    const search = c.req.query("search");
    const status = c.req.query("status") || "active";
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");

    let query = db.select().from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.status, status as any), isNull(bonds.deletedAt))
    ).$dynamic();

    if (denomination) query = query.where(eq(bonds.denomination, parseInt(denomination)));
    if (search) query = query.where(like(bonds.bondNumber, `%${search}%`));

    const data = await query.limit(limit).offset((page - 1) * limit).all();
    return success(c, { bonds: data, total: data.length });
  })
  .post("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = createBondSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const { bondNumber, denomination } = parsed.data;
    const existing = await db.select({ id: bonds.id }).from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.bondNumber, bondNumber), eq(bonds.denomination, denomination), isNull(bonds.deletedAt))
    ).get();
    if (existing) return error(c, "CONFLICT", "This bond already exists in your portfolio", 409);

    const id = generateId();
    await db.insert(bonds).values({ id, userId, bondNumber, denomination, status: "active" as any, entryMethod: "manual" as any } as any);
    return success(c, await db.select().from(bonds).where(eq(bonds.id, id)).get(), 201);
  })
  .get("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);
    return success(c, bond);
  })
  .delete("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);
    await db.update(bonds).set({ deletedAt: new Date().toISOString(), status: "archived" as any } as any).where(eq(bonds.id, id));
    return success(c, { message: "Bond deleted" });
  });
