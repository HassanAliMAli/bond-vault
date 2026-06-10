import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../db/schema";
import { eq, and, like, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { createBondSchema } from "../validations";
import { generateId } from "../lib/id";
import { getUserId, getEnv } from "../lib/context";

export const bondRoutes = new Hono()
  .use(authMiddleware)
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const denomination = c.req.query("denomination");
    const search = c.req.query("search");
    const status = c.req.query("status") || "active";
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = (page - 1) * limit;

    let query = db.select().from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.status, status as any), isNull(bonds.deletedAt))
    ).$dynamic();

    if (denomination) {
      query = query.where(eq(bonds.denomination, parseInt(denomination)));
    }
    if (search) {
      query = query.where(like(bonds.bondNumber, `%${search}%`));
    }

    const data = await query.limit(limit).offset(offset).all();
    return success(c, { bonds: data, total: data.length });
  })
  .post("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = createBondSchema.safeParse(body);

    if (!parsed.success) {
      return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { bondNumber, denomination } = parsed.data;

    const existing = await db.select({ id: bonds.id }).from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.bondNumber, bondNumber), eq(bonds.denomination, denomination), isNull(bonds.deletedAt))
    ).get();

    if (existing) {
      return error(c, "CONFLICT", "This bond already exists in your portfolio", 409);
    }

    const id = generateId();
    await db.insert(bonds).values({
      id,
      userId,
      bondNumber,
      denomination,
      status: "active" as any,
      entryMethod: "manual" as any,
    } as any);

    const created = await db.select().from(bonds).where(eq(bonds.id, id)).get();
    return success(c, created, 201);
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
  .patch("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const body = await c.req.json();

    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);

    if (body.bondNumber) {
      if (!/^\d{6}$/.test(body.bondNumber)) {
        return error(c, "VALIDATION_ERROR", "Bond number must be exactly 6 digits");
      }
    }

    await db.update(bonds).set({ updatedAt: new Date().toISOString() } as any).where(eq(bonds.id, id));
    const updated = await db.select().from(bonds).where(eq(bonds.id, id)).get();
    return success(c, updated);
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
  })
  .post("/:id/archive", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");

    await db.update(bonds).set({ status: "archived" as any, updatedAt: new Date().toISOString() } as any).where(
      and(eq(bonds.id, id), eq(bonds.userId, userId))
    );
    return success(c, { message: "Bond archived" });
  })
  .post("/:id/restore", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");

    await db.update(bonds).set({ status: "active" as any, updatedAt: new Date().toISOString() } as any).where(
      and(eq(bonds.id, id), eq(bonds.userId, userId))
    );
    return success(c, { message: "Bond restored" });
  });
