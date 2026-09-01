import { Hono } from "hono";
import type { Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { Env } from "../types/bindings.js";
import { GoogleAuthService } from "@gcc-portal/auth";
import { DatabaseClient } from "@gcc-portal/database";
import { UserRepository } from "../repositories/UserRepository.js";
import { authMiddleware } from "../middleware/auth.js";
import type { UserIdentity } from "@gcc-portal/contracts";

const auth = new Hono<{ Bindings: Env; Variables: { user: UserIdentity } }>();

function getAuthService(c: Context<{ Bindings: Env; Variables: { user: UserIdentity } }>) {
  const dbClient = new DatabaseClient({ db: c.env.DB, environment: c.env.ENVIRONMENT });
  const userRepo = new UserRepository(dbClient);
  
  return new GoogleAuthService({
    config: {
      providerId: "google",
      clientId: c.env.GOOGLE_CLIENT_ID,
      clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["openid", "email", "profile"],
      redirectUri: c.env.GOOGLE_REDIRECT_URI,
    },
    upsertUser: async (googleUser) => userRepo.upsertUser({ id: crypto.randomUUID(), ...googleUser }),
    signJwt: async (user) => {
      const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
      const token = await sign({ ...user, exp: expiresAt }, c.env.JWT_SECRET);
      return { token, expiresAt };
    }
  });
}

auth.get("/login", (c) => {
  const authService = getAuthService(c);
  const { url, state, codeVerifier } = authService.getAuthorizationUrl();
  
  const isSecure = c.env.ENVIRONMENT !== "development";
  
  setCookie(c, "oauth_state", state, { httpOnly: true, secure: isSecure, sameSite: "lax", path: "/", maxAge: 600 });
  setCookie(c, "oauth_code_verifier", codeVerifier, { httpOnly: true, secure: isSecure, sameSite: "lax", path: "/", maxAge: 600 });
  
  return c.redirect(url);
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  
  const storedState = getCookie(c, "oauth_state");
  const storedCodeVerifier = getCookie(c, "oauth_code_verifier");

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return c.json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid OAuth callback" }
    }, 400);
  }

  try {
    const authService = getAuthService(c);
    const session = await authService.handleCallback(code, storedCodeVerifier);
    
    const isSecure = c.env.ENVIRONMENT !== "development";

    setCookie(c, "session", session.accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt * 1000),
    });

    deleteCookie(c, "oauth_state");
    deleteCookie(c, "oauth_code_verifier");

    return c.redirect("/");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return c.json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: msg }
    }, 500);
  }
});

auth.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

auth.post("/logout", (c) => {
  deleteCookie(c, "session");
  return c.json({ status: "ok" });
});

export { auth };
