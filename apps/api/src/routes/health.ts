import { Hono } from "hono";
import type { Env } from "../types/bindings.js";

const health = new Hono<{ Bindings: Env }>();

/**
 * GET /health
 *
 * Basic health-check endpoint. Returns the current server status and timestamp.
 * Used by CI/CD pipelines and monitoring to verify the Worker is reachable.
 */
health.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "gcc-portal-api",
    environment: c.env.ENVIRONMENT ?? "unknown",
    timestamp: new Date().toISOString(),
    version: "0.0.1",
  });
});

export { health };
