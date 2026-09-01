import { describe, it, expect } from "vitest";
import app from "../src/index.js";

describe("GET /auth/login", () => {
  it("redirects to Google OAuth with state and code_verifier cookies", async () => {
    const req = new Request("http://localhost/auth/login");
    const res = await app.fetch(req, {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      GOOGLE_CLIENT_ID: "test_client",
      GOOGLE_CLIENT_SECRET: "test_secret",
      GOOGLE_REDIRECT_URI: "http://localhost/callback",
      JWT_SECRET: "test_jwt_secret",
      DB: {} as D1Database,
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("accounts.google.com");
    
    // In Hono, multiple Set-Cookie headers are joined by commas in the fetch API response wrapper
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("oauth_state=");
    expect(setCookie).toContain("oauth_code_verifier=");
  });
});

describe("GET /auth/callback", () => {
  it("returns 400 when state or code is missing", async () => {
    const req = new Request("http://localhost/auth/callback");
    const res = await app.fetch(req, {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      DB: {} as D1Database,
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ success: boolean; error: { code: string; message: string } }>();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Invalid OAuth callback");
  });
});

describe("POST /auth/logout", () => {
  it("clears the session cookie", async () => {
    const req = new Request("http://localhost/auth/logout", { method: "POST" });
    const res = await app.fetch(req, {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      DB: {} as D1Database,
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("Max-Age=0");
  });
});
