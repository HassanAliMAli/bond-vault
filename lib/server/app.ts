import { Hono, type Context } from "hono";
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
import { externalDrawRoutes } from "./routes/external-draws";
import { seedPlans, handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup, sendPendingNotifications } from "./services";
import { logger } from "./logger";

type Variables = {
  userId: string;
  adminId: string;
  __auth: ReturnType<typeof createAuth>;
};

const ALLOWED_ORIGINS = [
  "https://bondvault.hassanali205031.workers.dev",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  app.use("*", cors({
    origin: (origin) => {
      if (ALLOWED_ORIGINS.includes(origin || "")) return origin;
      return null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));

  app.use("*", async (c, next) => {
    if (!c.env.BETTER_AUTH_SECRET) {
      logger.error("BETTER_AUTH_SECRET is not set");
      return c.json({ success: false, error: { code: "CONFIG_ERROR", message: "Server configuration error" } }, 500);
    }
    if (!c.env.DB) {
      logger.error("DB binding is not configured");
      return c.json({ success: false, error: { code: "CONFIG_ERROR", message: "Database not configured" } }, 500);
    }
    await next();
  });

  app.use("*", async (c, next) => {
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");
    await next();
  });

  app.use("*", async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    logger.request(c.req.method, c.req.path, c.res.status, duration, { requestId: crypto.randomUUID().slice(0, 8) });
  });

  app.use("*", async (c, next) => {
    try {
      const auth = createAuth(
        c.env,
        (c.req.raw as Request & { cf: IncomingRequestCfProperties }).cf,
        new URL(c.req.url).origin
      );
      c.set("__auth", auth);
    } catch (e) {
      logger.error("createAuth error", { message: (e as Error).message });
    }
    await next();
  });

  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
    try {
      const res = await c.get("__auth").handler(c.req.raw);
      return res;
    } catch (e) {
      logger.error("Better Auth error", { message: (e as Error).message });
      return c.json({ success: false, error: String(e), message: (e as Error).message }, 500);
    }
  });

  app.use("/api/v1/*", async (c, next) => {
    try {
      const session = await c.get("__auth").api.getSession({ headers: c.req.raw.headers });
      if (session) c.set("userId", session.user.id);
    } catch (e) {
      logger.error("Session fetch error", { message: (e as Error).message });
    }
    await next();
  });

  app.use("*", async (c, next) => {
    if (c.env?.DB) await seedPlans(c.env.DB);
    await next();
  });

  const cronAuth = async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader !== `Bearer ${c.env.BETTER_AUTH_SECRET}`) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    await next();
  };

  app.get("/api/v1/cron/subscriptions", cronAuth, async (c) => {
    const count = await handleSubscriptionExpiration(c.env);
    return c.json({ success: true, count });
  });

  app.get("/api/v1/cron/retention", cronAuth, async (c) => {
    const result = await handleRetentionCleanup(c.env);
    return c.json({ success: true, ...result });
  });

  app.get("/api/v1/cron/imports-cleanup", cronAuth, async (c) => {
    const count = await handleImportCleanup(c.env);
    return c.json({ success: true, cleanedImports: count });
  });

  app.get("/api/v1/cron/notifications", cronAuth, async (c) => {
    const sent = await sendPendingNotifications(c.env);
    return c.json({ success: true, notificationsSent: sent });
  });

  app.get("/api/v1/cron/maintenance", cronAuth, async (c) => {
    const expired = await handleSubscriptionExpiration(c.env);
    const retention = await handleRetentionCleanup(c.env);
    const cleaned = await handleImportCleanup(c.env);
    return c.json({ success: true, subscriptionsExpired: expired, ...retention, importsCleaned: cleaned });
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
  app.route("/api/v1", externalDrawRoutes);
  app.route("/api/v1", adminRoutes);

  app.onError((err, c) => {
    logger.error("Unhandled error", { message: err.message, stack: err.stack, method: c.req.method, path: c.req.path });
    return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  });

  return app;
}
