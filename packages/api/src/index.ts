import { Hono } from "hono";
import { cors } from "hono/cors";
import { loggerMiddleware } from "./middleware";
import { authRoutes } from "./routes/auth";
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

const app = new Hono();

app.use("*", cors());
app.use("*", loggerMiddleware);

app.route("/api/v1", healthRoute);
app.route("/api/v1/auth", authRoutes);
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
