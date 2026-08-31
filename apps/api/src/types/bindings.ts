/**
 * Cloudflare Worker environment bindings.
 *
 * These types are generated from wrangler.toml by running:
 *   pnpm --filter @gcc-portal/api cf:types
 *
 * The interface below serves as the source of truth until generated types exist.
 * Keep it in sync with wrangler.toml bindings.
 */
export interface Env {
  // ---- D1 Database ----
  DB: D1Database;

  // ---- Environment variables (set via .dev.vars / wrangler secret) ----
  // Marked optional because env vars may be absent if not configured in wrangler.toml / .dev.vars.
  ENVIRONMENT: string | undefined;
  LOG_LEVEL: string | undefined;
  CORS_ALLOWED_ORIGINS: string | undefined;

  // ---- Future bindings (uncomment when needed) ----
  // CACHE: KVNamespace;
  // GOOGLE_CLIENT_ID: string;
  // GOOGLE_CLIENT_SECRET: string;
  // JWT_SECRET: string;
}
