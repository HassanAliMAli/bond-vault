import { Hono } from "hono";
import { getDb } from "../db";
import { bonds, type BondStatus } from "../schema";
import { eq, and, like, isNull } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { createBondSchema, updateBondSchema } from "../validations";
import { generateId } from "../id";
import { logAudit, getClientIp } from "../services";

export const bondRoutes = new Hono()
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const denomination = c.req.query("denomination");
    const search = c.req.query("search");
    const status = (c.req.query("status") || "active") as BondStatus;
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "50")));

    const conditions = [
      eq(bonds.userId, userId),
      eq(bonds.status, status),
      isNull(bonds.deletedAt),
    ];
    if (denomination) conditions.push(eq(bonds.denomination, parseInt(denomination)));
    if (search) conditions.push(like(bonds.bondNumber, `%${search}%`));

    const query = db.select().from(bonds).where(and(...conditions)).$dynamic();
    const total = (await db.select({ count: bonds.id }).from(bonds).where(and(...conditions)).all()).length;
    const data = await query.limit(limit).offset((page - 1) * limit).all();
    return success(c, { bonds: data, total });
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
    await db.insert(bonds).values({ id, userId, bondNumber, denomination, status: "active", entryMethod: "manual" });
    await logAudit(env, { userId, action: "bond.create", entityType: "bond", entityId: id, ipAddress: getClientIp(c) });
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
  .patch("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = updateBondSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);

    const updateData: Partial<typeof bonds.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (parsed.data.bondNumber) updateData.bondNumber = parsed.data.bondNumber;
    if (parsed.data.denomination) updateData.denomination = parsed.data.denomination;

    if (updateData.bondNumber || updateData.denomination) {
      const dupCheck = await db.select({ id: bonds.id }).from(bonds).where(
        and(
          eq(bonds.userId, userId),
          eq(bonds.bondNumber, updateData.bondNumber || bond.bondNumber),
          eq(bonds.denomination, updateData.denomination || bond.denomination),
          isNull(bonds.deletedAt),
          eq(bonds.status, bond.status)
        )
      ).get();
      if (dupCheck && dupCheck.id !== id) return error(c, "CONFLICT", "A bond with these details already exists", 409);
    }

    await db.update(bonds).set(updateData).where(eq(bonds.id, id));
    await logAudit(env, { userId, action: "bond.update", entityType: "bond", entityId: id, ipAddress: getClientIp(c) });
    return success(c, await db.select().from(bonds).where(eq(bonds.id, id)).get());
  })
  .delete("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);
    await db.update(bonds).set({ deletedAt: new Date().toISOString(), status: "archived" }).where(eq(bonds.id, id));
    await logAudit(env, { userId, action: "bond.delete", entityType: "bond", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Bond deleted" });
  })
  .post("/:id/archive", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);
    await db.update(bonds).set({ status: "archived", updatedAt: new Date().toISOString() }).where(eq(bonds.id, id));
    await logAudit(env, { userId, action: "bond.archive", entityType: "bond", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Bond archived" });
  })
  .post("/:id/restore", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const bond = await db.select().from(bonds).where(and(eq(bonds.id, id), eq(bonds.userId, userId))).get();
    if (!bond) return error(c, "NOT_FOUND", "Bond not found", 404);
    await db.update(bonds).set({ status: "active", deletedAt: null, updatedAt: new Date().toISOString() }).where(eq(bonds.id, id));
    await logAudit(env, { userId, action: "bond.restore", entityType: "bond", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Bond restored" });
  });
