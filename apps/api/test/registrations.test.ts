import { describe, it, expect, beforeAll } from "vitest";
import app from "../src/index.js";
// @ts-ignore
import { env } from "cloudflare:test";
import { sign } from "hono/jwt";
import type { D1Database } from "@cloudflare/workers-types";
import type { UserIdentity } from "@gcc-portal/contracts";

describe("Registrations API", () => {
  const jwtSecret = "test_jwt_secret";

  const adminUser: UserIdentity = {
    id: "admin-123",
    email: "admin@example.com",
    displayName: "Admin User",
    role: "admin",
  };

  const coordinatorUser: UserIdentity = {
    id: "coord-123",
    email: "coord@example.com",
    displayName: "Coord User",
    role: "coordinator",
  };

  const memberUser: UserIdentity = {
    id: "member-123",
    email: "member@example.com",
    displayName: "Member User",
    role: "member",
  };

  const otherMemberUser: UserIdentity = {
    id: "member-456",
    email: "other@example.com",
    displayName: "Other Member",
    role: "member",
  };

  const createToken = async (user: UserIdentity) => {
    return sign({ ...user, exp: Math.floor(Date.now() / 1000) + 3600 }, jwtSecret);
  };

  beforeAll(async () => {
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, display_name TEXT, avatar_url TEXT, role TEXT, created_at TEXT, updated_at TEXT);`);
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, date TEXT NOT NULL, location TEXT, category TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('draft', 'published')), created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (created_by) REFERENCES users(id));`);
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS registrations (id TEXT PRIMARY KEY, event_id TEXT NOT NULL, user_id TEXT NOT NULL, registered_at TEXT NOT NULL, FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE (event_id, user_id));`);

    await (env.DB as D1Database).exec(`INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES ('admin-123', 'admin@example.com', 'Admin User', 'admin', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), ('coord-123', 'coord@example.com', 'Coord User', 'coordinator', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), ('member-123', 'member@example.com', 'Member User', 'member', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), ('member-456', 'other@example.com', 'Other Member', 'member', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');`);
    await (env.DB as D1Database).exec(`INSERT INTO events (id, title, description, date, location, category, status, created_by, created_at, updated_at) VALUES ('test-event-123', 'Test Event', 'A test event', '2026-10-10T10:00:00Z', 'BMSIT', 'Tech', 'published', 'coord-123', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');`);
  });

  const fetchApi = async (path: string, method = "GET", body?: unknown, user?: UserIdentity) => {
    const headers = new Headers();
    if (user) {
      headers.set("cookie", `session=${await createToken(user)}`);
    }
    if (body) {
      headers.set("content-type", "application/json");
    }

    return app.fetch(new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }), {
      ENVIRONMENT: "test",
      LOG_LEVEL: "silent",
      JWT_SECRET: jwtSecret,
      DB: env.DB as D1Database,
    });
  };

  const eventId = "test-event-123";

  it("should allow a member to register for an event", async () => {
    const res = await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, any>;
    expect(body.success).toBe(true);
  });

  it("should return 409 Conflict if registering twice", async () => {
    await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    const res = await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    expect(res.status).toBe(409);
    const body = (await res.json()) as Record<string, any>;
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("CONFLICT");
  });

  it("should forbid unauthenticated user from registering", async () => {
    const res = await fetchApi(`/events/${eventId}/registrations`, "POST");
    expect(res.status).toBe(401);
  });

  it("should include is_registered=true in GET /events/:id for registered user", async () => {
    await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    const res = await fetchApi(`/events/${eventId}`, "GET", undefined, memberUser);
    const body = (await res.json()) as Record<string, any>;
    expect(body.data?.is_registered).toBe(true);
  });

  it("should include is_registered=false in GET /events/:id for unregistered user", async () => {
    const res = await fetchApi(`/events/${eventId}`, "GET", undefined, otherMemberUser);
    const body = (await res.json()) as Record<string, any>;
    expect(body.data?.is_registered).toBe(false);
  });

  it("should forbid member from viewing attendees list", async () => {
    const res = await fetchApi(`/events/${eventId}/registrations`, "GET", undefined, memberUser);
    expect(res.status).toBe(403);
  });

  it("should allow coordinator to view attendees of their own event", async () => {
    await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    const res = await fetchApi(`/events/${eventId}/registrations`, "GET", undefined, coordinatorUser);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, any>;
    expect(body.success).toBe(true);
    expect(body.data?.length).toBe(1);
    expect(body.data?.[0]?.displayName).toBe("Member User");
  });

  it("should allow admin to view attendees", async () => {
    const res = await fetchApi(`/events/${eventId}/registrations`, "GET", undefined, adminUser);
    expect(res.status).toBe(200);
  });

  it("should allow a member to unregister", async () => {
    await fetchApi(`/events/${eventId}/registrations`, "POST", undefined, memberUser);
    const res = await fetchApi(`/events/${eventId}/registrations`, "DELETE", undefined, memberUser);
    expect(res.status).toBe(200);
  });

  it("should reflect is_registered=false after unregistering", async () => {
    const res = await fetchApi(`/events/${eventId}`, "GET", undefined, memberUser);
    const body = (await res.json()) as Record<string, any>;
    expect(body.data?.is_registered).toBe(false);
  });
});
