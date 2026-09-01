import { Google, generateState, generateCodeVerifier } from "arctic";
import type { OAuthProviderConfig, AuthService, AuthorizationRequest, AuthSession } from "./interfaces.js";
import type { UserIdentity } from "@gcc-portal/contracts";
import { AuthError } from "./errors.js";

export interface GoogleAuthDependencies {
  config: OAuthProviderConfig;
  upsertUser: (googleUser: { email: string; displayName: string; avatarUrl: string | null }) => Promise<UserIdentity>;
  signJwt: (user: UserIdentity) => Promise<{ token: string; expiresAt: number }>;
}

export class GoogleAuthService implements AuthService {
  private readonly google: Google;

  constructor(private readonly deps: GoogleAuthDependencies) {
    this.google = new Google(
      deps.config.clientId,
      deps.config.clientSecret,
      deps.config.redirectUri
    );
  }

  getAuthorizationUrl(): AuthorizationRequest {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = this.google.createAuthorizationURL(state, codeVerifier, this.deps.config.scopes);
    
    return {
      url: url.toString(),
      state,
      codeVerifier,
    };
  }

  async handleCallback(code: string, codeVerifier: string): Promise<AuthSession> {
    try {
      const tokens = await this.google.validateAuthorizationCode(code, codeVerifier);
      
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });

      if (!response.ok) {
        throw new AuthError("Failed to fetch user info from Google", "OAUTH_CALLBACK_ERROR");
      }

      const googleUser = (await response.json()) as { email: string; name: string; picture?: string };
      
      const user = await this.deps.upsertUser({
        email: googleUser.email,
        displayName: googleUser.name,
        avatarUrl: googleUser.picture ?? null,
      });

      const { token, expiresAt } = await this.deps.signJwt(user);

      return {
        user,
        accessToken: token,
        expiresAt,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new AuthError(`Authentication failed: ${msg}`, "OAUTH_CALLBACK_ERROR");
    }
  }

  validateToken(_token: string): Promise<UserIdentity | null> {
    throw new AuthError("validateToken should be handled by Hono middleware directly", "UNSUPPORTED");
  }

  signOut(_token: string): Promise<void> {
    // JWTs are stateless, so signOut is just clearing the cookie on the client side.
    return Promise.resolve();
  }
}
