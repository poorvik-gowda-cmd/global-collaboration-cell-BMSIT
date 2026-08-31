import { describe, it, expect } from "vitest";
import app from "../src/index.js";

/**
 * Smoke test for the health-check endpoint.
 * Verifies the Worker responds correctly without a live Cloudflare environment.
 */
describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const req = new Request("http://localhost/health");
    const res = await app.fetch(req, {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      DB: {} as D1Database,
    });

    expect(res.status).toBe(200);

    const body = await res.json<Record<string, unknown>>();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("gcc-portal-api");
  });

  it("returns 404 for unknown routes", async () => {
    const req = new Request("http://localhost/unknown-route");
    const res = await app.fetch(req, {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      CORS_ALLOWED_ORIGINS: "http://localhost:3000",
      DB: {} as D1Database,
    });

    expect(res.status).toBe(404);
  });
});
