import { Hono } from "hono";
import { logger } from "hono/logger";
import type { Env } from "./types/bindings.js";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { events } from "./routes/events.js";

/**
 * GCC Portal API — Cloudflare Worker
 *
 * This is the root application entry point.
 * Only the /health endpoint is implemented at this stage.
 * Business-domain routes will be added as features are built.
 */
const app = new Hono<{ Bindings: Env }>();

// ---- Global middleware ----
app.use("*", logger());
app.use("*", createCorsMiddleware());

// ---- Routes ----
app.route("/health", health);
app.route("/auth", auth);
app.route("/events", events);

// ---- Root ----
app.get("/", (c) => {
  return c.json({
    name: "gcc-portal-api",
    description: "GCC Portal REST API",
    docs: "/health",
    status: "ok",
  });
});

// ---- 404 fallback ----
app.notFound((c) => {
  return c.json({ error: "Not Found", status: 404 }, 404);
});

// ---- Error handler ----
app.onError((err, c) => {
  console.error("[api] unhandled error:", err);
  return c.json({ error: "Internal Server Error", status: 500 }, 500);
});

export default app;
