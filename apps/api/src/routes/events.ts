import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { DatabaseClient } from "@gcc-portal/database";
import { EventRepository } from "../repositories/EventRepository.js";
import { authMiddleware } from "../middleware/auth.js";
import { CreateEventRequestSchema, UpdateEventRequestSchema } from "@gcc-portal/contracts";
import type { Env } from "../types/bindings.js";
import type { UserIdentity } from "@gcc-portal/contracts";
import type { Context, Next } from "hono";
import { z } from "zod";

const events = new Hono<{ Bindings: Env; Variables: { user: UserIdentity } }>();

function getRepo(c: Context) {
  const dbClient = new DatabaseClient({ db: c.env.DB, environment: c.env.ENVIRONMENT });
  return new EventRepository(dbClient);
}

// Optional Auth Middleware to attach user if token exists, without throwing 401 if missing
const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    await authMiddleware(c, async () => {});
  } catch (e) {
    // ignore
  }
  await next();
};

const QuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft", "all"]).optional(),
});

events.get("/", optionalAuthMiddleware, zValidator("query", QuerySchema), async (c) => {
  const user = c.get("user") as UserIdentity | undefined;
  const repo = getRepo(c);
  const query = c.req.valid("query");

  let status: "published" | "draft" | "all" = "published";
  let createdBy: string | undefined = undefined;

  if (query.status && query.status !== "published") {
    if (!user) {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Must be logged in to view drafts" } }, 401);
    }
    
    if (user.role === "member") {
      return c.json({ success: false, error: { code: "FORBIDDEN", message: "Members cannot view drafts" } }, 403);
    }

    if (user.role === "coordinator") {
      status = query.status;
      createdBy = user.id; // Coordinators can only see their own drafts
    } else if (user.role === "admin") {
      status = query.status;
      // Admins can see any drafts
    }
  }

  const { data, total } = await repo.findAll({
    status,
    createdBy,
    category: query.category,
    page: query.page,
    pageSize: query.pageSize,
  });

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  return c.json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

events.get("/:id", optionalAuthMiddleware, async (c) => {
  const id = c.req.param("id") as string;
  const repo = getRepo(c);
  const event = await repo.findById(id);

  if (!event) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } }, 404);
  }

  if (event.status === "draft") {
    const user = c.get("user") as UserIdentity | undefined;
    if (!user) {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Must be logged in to view draft event" } }, 401);
    }
    if (user.role === "member") {
      return c.json({ success: false, error: { code: "FORBIDDEN", message: "Members cannot view draft events" } }, 403);
    }
    if (user.role === "coordinator" && event.created_by !== user.id) {
      return c.json({ success: false, error: { code: "FORBIDDEN", message: "You can only view your own draft events" } }, 403);
    }
  }

  return c.json({ success: true, data: event });
});

events.post("/", authMiddleware, zValidator("json", CreateEventRequestSchema), async (c) => {
  const user = c.get("user");
  if (user.role === "member") {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Members cannot create events" } }, 403);
  }

  const data = c.req.valid("json");
  const repo = getRepo(c);

  const now = new Date().toISOString();
  const event = {
    ...data,
    id: crypto.randomUUID(),
    created_by: user.id,
    created_at: now,
    updated_at: now,
  };

  await repo.create(event);

  return c.json({ success: true, data: event }, 201);
});

events.put("/:id", authMiddleware, zValidator("json", UpdateEventRequestSchema), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  
  if (user.role === "member") {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Members cannot edit events" } }, 403);
  }

  const repo = getRepo(c);
  const event = await repo.findById(id);

  if (!event) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } }, 404);
  }

  if (user.role === "coordinator" && event.created_by !== user.id) {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Coordinators can only edit their own events" } }, 403);
  }

  const data = c.req.valid("json");
  const now = new Date().toISOString();
  
  const updates = {
    ...data,
    updated_at: now,
  };

  await repo.update(id, updates);
  
  const updatedEvent = await repo.findById(id);

  return c.json({ success: true, data: updatedEvent });
});

events.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id")!;
  const user = c.get("user");

  if (user.role !== "admin") {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Only admins can delete events" } }, 403);
  }

  const repo = getRepo(c);
  const event = await repo.findById(id);

  if (!event) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } }, 404);
  }

  await repo.delete(id);

  return c.json({ success: true, data: { deleted: true } });
});

export { events };
