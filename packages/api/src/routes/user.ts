import { Hono } from "hono";
import { getDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, sessionMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { updateProfileSchema } from "../validations";
import { getUserId, getEnv } from "../lib/context";

export const userRoutes = new Hono()
  .use(sessionMiddleware, authMiddleware)
  .get("/profile", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return error(c, "NOT_FOUND", "User not found", 404);
    return success(c, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      whatsappNumber: user.whatsappNumber,
      status: user.status,
    });
  })
  .patch("/profile", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);
    await db.update(users).set({ ...parsed.data, updatedAt: new Date().toISOString() } as any).where(eq(users.id, userId));
    const updated = await db.select().from(users).where(eq(users.id, userId)).get();
    return success(c, updated);
  })
  .delete("/account", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    await db.update(users).set({ status: "deleted" as any, deletedAt: new Date().toISOString() } as any).where(eq(users.id, userId));
    return success(c, { message: "Account deletion requested. Data will be permanently deleted after 90 days." });
  });
