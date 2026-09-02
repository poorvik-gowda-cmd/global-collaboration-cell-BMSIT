import { describe, it, expect, beforeAll } from "vitest";
import app from "../src/index.js";
// @ts-expect-error - cloudflare:test is resolved by vitest
import { env } from "cloudflare:test";
import { sign } from "hono/jwt";
import type { D1Database } from "@cloudflare/workers-types";
import type { UserIdentity } from "@gcc-portal/contracts";

describe("Events API", () => {
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

  const createToken = async (user: UserIdentity) => {
    return sign({ ...user, exp: Math.floor(Date.now() / 1000) + 3600 }, jwtSecret);
  };

  beforeAll(async () => {
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, display_name TEXT, avatar_url TEXT, role TEXT, created_at TEXT, updated_at TEXT);`);
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, date TEXT NOT NULL, location TEXT, category TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('draft', 'published')), created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (created_by) REFERENCES users(id));`);
    await (env.DB as D1Database).exec(`CREATE TABLE IF NOT EXISTS registrations (id TEXT PRIMARY KEY, event_id TEXT NOT NULL, user_id TEXT NOT NULL, registered_at TEXT NOT NULL, FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE (event_id, user_id));`);
    await (env.DB as D1Database).exec(`INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES ('admin-123', 'admin@example.com', 'Admin User', 'admin', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), ('coord-123', 'coord@example.com', 'Coord User', 'coordinator', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'), ('member-123', 'member@example.com', 'Member User', 'member', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');`);
    await (env.DB as D1Database).exec(`INSERT INTO events (id, title, description, date, location, category, status, created_by, created_at, updated_at) VALUES ('test-event-123', 'Test Event', 'A test event', '2026-10-10T10:00:00Z', 'BMSIT', 'Tech', 'draft', 'coord-123', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');`);
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

  it("should allow coordinator to create an event", async () => {
    const res = await fetchApi("/events", "POST", {
      title: "Test Event",
      description: "A test event",
      date: "2026-10-10T10:00:00Z",
      location: "BMSIT",
      category: "Tech",
      status: "draft"
    }, coordinatorUser);
    
    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, any>;
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeDefined();
  });

  it("should forbid member from creating an event", async () => {
    const res = await fetchApi("/events", "POST", {
      title: "Test Event 2",
      date: "2026-10-10T10:00:00Z",
      category: "Tech",
      status: "draft"
    }, memberUser);
    
    expect(res.status).toBe(403);
  });

  it("should allow coordinator to view their own draft", async () => {
    const res = await fetchApi(`/events/${eventId}`, "GET", undefined, coordinatorUser);
    expect(res.status).toBe(200);
  });

  it("should forbid member from viewing a draft", async () => {
    const res = await fetchApi(`/events/${eventId}`, "GET", undefined, memberUser);
    expect(res.status).toBe(403);
  });

  it("should allow admin to edit coordinator's event", async () => {
    const res = await fetchApi(`/events/${eventId}`, "PUT", {
      status: "published"
    }, adminUser);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { id: string; status: string } };
    expect(body.data.status).toBe("published");
  });

  it("should allow public to view published events", async () => {
    // We need to publish it first since it's an isolated test
    await (env.DB as D1Database).prepare("UPDATE events SET status = 'published' WHERE id = ?").bind(eventId).run();
    
    const res = await fetchApi("/events");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, any>;
    expect(body.data?.length).toBe(1);
    expect(body.data?.[0]?.status).toBe("published");
  });

  it("should enforce category filtering and pagination", async () => {
    await (env.DB as D1Database).prepare("UPDATE events SET status = 'published' WHERE id = ?").bind(eventId).run();
    
    const res = await fetchApi("/events?category=Tech&page=1&pageSize=10");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, any>;
    expect(body.meta?.total).toBe(1);
  });

  it("should allow admin to delete the event", async () => {
    const res = await fetchApi(`/events/${eventId}`, "DELETE", undefined, adminUser);
    expect(res.status).toBe(200);
  });
});
