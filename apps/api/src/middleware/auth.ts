import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import type { UserIdentity } from "@gcc-portal/contracts";
import type { Env } from "../types/bindings.js";

export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: { user: UserIdentity } }>,
  next: Next
) {
  const token = getCookie(c, "session");

  if (!token) {
    return c.json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized" }
    }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    // JWT payloads don't perfectly map back unless explicitly typed
    const user: UserIdentity = {
      id: payload.id as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
      avatarUrl: payload.avatarUrl as string | undefined,
      role: payload.role as UserIdentity["role"],
    };
    c.set("user", user);
    await next();
  } catch {
    return c.json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" }
    }, 401);
  }
}

export function roleMiddleware(allowedRoles: UserIdentity["role"][]) {
  return async (
    c: Context<{ Variables: { user: UserIdentity } }>,
    next: Next
  ) => {
    const user = c.get("user") as UserIdentity | undefined;
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" }
      }, 403);
    }
    await next();
  };
}
