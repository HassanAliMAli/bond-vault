import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { bondRoutes } from "./routes/bonds";
import { matchRoutes } from "./routes/matches";
import { drawRoutes } from "./routes/draws";
import { checkRoute } from "./routes/check";
import { userRoutes, notificationRoutes, subscriptionRoutes } from "./routes/user";
import { healthRoute } from "./routes/health";
import { paymentRoutes } from "./routes/payments";
import { ocrRoutes } from "./routes/ocr";
import { importRoutes } from "./routes/imports";
import { exportRoutes } from "./routes/exports";
import { searchRoutes } from "./routes/search";
import { adminRoutes } from "./routes/admin";
import { seedPlans, handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup } from "./services";

type Variables = {
  userId: string;
};

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  app.use("*", cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));

  app.use("*", async (c, next) => {
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
  });

  app.use("*", async (c, next) => {
    try {
      const auth = createAuth(
        c.env,
        (c.req.raw as any).cf || {},
        new URL(c.req.url).origin
      );
      (c as any).__auth = auth;
    } catch (e) {
      console.error("createAuth error:", e);
    }
    await next();
  });

  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
    try {
      return await (c as any).__auth.handler(c.req.raw);
    } catch (e) {
      console.error("Better Auth error:", e);
      return c.json({ success: false, error: String(e) }, 500);
    }
  });

  app.use("/api/v1/*", async (c, next) => {
    try {
      const session = await (c as any).__auth.api.getSession({ headers: c.req.raw.headers });
      if (session) c.set("userId", session.user.id);
    } catch {}
    await next();
  });

  app.use("*", async (c, next) => {
    if (c.env?.DB) await seedPlans(c.env.DB);
    await next();
  });

  const cronAuth = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader !== `Bearer ${c.env.BETTER_AUTH_SECRET}`) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    await next();
  };

  app.get("/cron/subscriptions", cronAuth, async (c) => {
    const count = await handleSubscriptionExpiration(c.env);
    return c.json({ success: true, count });
  });

  app.get("/cron/retention", cronAuth, async (c) => {
    const result = await handleRetentionCleanup(c.env);
    return c.json({ success: true, ...result });
  });

  app.get("/cron/imports-cleanup", cronAuth, async (c) => {
    const count = await handleImportCleanup(c.env);
    return c.json({ success: true, cleanedImports: count });
  });

  app.route("/api/v1", healthRoute);
  app.route("/api/v1/bonds", bondRoutes);
  app.route("/api/v1/matches", matchRoutes);
  app.route("/api/v1/draws", drawRoutes);
  app.route("/api/v1", checkRoute);
  app.route("/api/v1/user", userRoutes);
  app.route("/api/v1", notificationRoutes);
  app.route("/api/v1", subscriptionRoutes);
  app.route("/api/v1", paymentRoutes);
  app.route("/api/v1", ocrRoutes);
  app.route("/api/v1", importRoutes);
  app.route("/api/v1", exportRoutes);
  app.route("/api/v1", searchRoutes);
  app.route("/api/v1", adminRoutes);

  app.onError((err, c) => {
    console.error("Unhandled error:", err);
    return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  });

  return app;
}
