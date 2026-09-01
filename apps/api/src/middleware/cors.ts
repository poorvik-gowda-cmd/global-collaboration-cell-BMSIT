import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/bindings.js";

/**
 * CORS middleware.
 *
 * Reads allowed origins from the CORS_ALLOWED_ORIGINS environment variable
 * (comma-separated list). Falls back to localhost:3000 in development.
 */
export function createCorsMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const rawOrigins = c.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000";
    const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

    return cors({
      origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400,
    })(c, next);
  };
}
