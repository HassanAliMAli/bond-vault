import { Hono } from "hono";
import { cors } from "hono/cors";
import { loggerMiddleware } from "./middleware";
import { createAuth } from "./auth";
import { bondRoutes } from "./routes/bonds";
import { matchRoutes } from "./routes/matches";
import { drawRoutes } from "./routes/draws";
import { notificationRoutes } from "./routes/notifications";
import { subscriptionRoutes } from "./routes/subscriptions";
import { paymentRoutes } from "./routes/payments";
import { ocrRoutes } from "./routes/ocr";
import { importRoutes } from "./routes/imports";
import { exportRoutes } from "./routes/exports";
import { userRoutes } from "./routes/user";
import { searchRoutes } from "./routes/search";
import { adminRoutes } from "./routes/admin";
import { checkRoute } from "./routes/check";
import { healthRoute } from "./routes/health";
import {
  seedPlans,
  createCronHandler,
  handleSubscriptionExpiration,
  handleRetentionCleanup,
  handleImportCleanup,
  handleFailedNotificationRetry,
  matchQueueConsumer,
  notificationQueueConsumer,
  cleanupQueueConsumer,
  drawQueueConsumer,
} from "./services";

interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
}

type Variables = {
  userId: string;
  isAdmin: boolean;
  auth: ReturnType<typeof createAuth>;
};

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

app.use("*", cors({
  origin: (origin) => origin,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use("*", loggerMiddleware);
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  await next();
});

app.use("*", async (c, next) => {
  const authInstance = createAuth(
    c.env,
    (c.req.raw as any).cf || {},
    new URL(c.req.url).origin
  );
  c.set("auth", authInstance);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return c.get("auth").handler(c.req.raw);
});

app.use("/api/v1/*", async (c, next) => {
  try {
    const session = await c.get("auth").api.getSession({
      headers: c.req.raw.headers,
    });
    if (session) {
      c.set("userId", session.user.id);
      c.set("isAdmin", session.user.email === "admin@bondvault.com");
    }
  } catch {
    // unauthenticated
  }
  await next();
});

app.use("*", async (c, next) => {
  await seedPlans(c.env.DB);
  await next();
});

// Cron endpoints
const cronAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  const expected = `Bearer ${c.env.BETTER_AUTH_SECRET}`;
  if (authHeader !== expected) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }
  await next();
};

app.get("/cron/subscriptions", cronAuth, createCronHandler(handleSubscriptionExpiration));
app.get("/cron/retention", cronAuth, createCronHandler(handleRetentionCleanup));
app.get("/cron/imports", cronAuth, createCronHandler(handleImportCleanup));
app.get("/cron/notifications", cronAuth, createCronHandler(handleFailedNotificationRetry));

// Queue consumers
export const queue = {
  async match(batch: MessageBatch, env: CloudflareBindings) { await matchQueueConsumer(env as Env, batch); },
  async notification(batch: MessageBatch, env: CloudflareBindings) { await notificationQueueConsumer(env as Env, batch); },
  async cleanup(batch: MessageBatch, env: CloudflareBindings) { await cleanupQueueConsumer(env as Env, batch); },
  async draw(batch: MessageBatch, env: CloudflareBindings) { await drawQueueConsumer(env as Env, batch); },
};

app.route("/api/v1", healthRoute);
app.route("/api/v1/bonds", bondRoutes);
app.route("/api/v1/matches", matchRoutes);
app.route("/api/v1/draws", drawRoutes);
app.route("/api/v1", notificationRoutes);
app.route("/api/v1", subscriptionRoutes);
app.route("/api/v1", paymentRoutes);
app.route("/api/v1", ocrRoutes);
app.route("/api/v1", importRoutes);
app.route("/api/v1", exportRoutes);
app.route("/api/v1/user", userRoutes);
app.route("/api/v1", searchRoutes);
app.route("/api/v1/admin", adminRoutes);
app.route("/api/v1", checkRoute);

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    500
  );
});

export default app;
