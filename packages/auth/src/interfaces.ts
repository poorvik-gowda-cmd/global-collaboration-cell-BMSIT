/**
 * Authentication interfaces — GCC Portal
 *
 * These interfaces define the contracts that any concrete authentication
 * implementation must fulfil. The Google OAuth/OIDC implementation will
 * be added in a future task.
 *
 * DO NOT implement authentication logic here yet.
 *
 * @see docs/ARCHITECTURE.md — Authentication section
 */

import type { UserIdentity } from "@gcc-portal/contracts";

// -----------------------------------------------------------------------
// Core auth interfaces
// -----------------------------------------------------------------------

/**
 * The result of a successful authentication flow.
 */
export interface AuthSession {
  /** The authenticated user. */
  user: UserIdentity;
  /** Opaque access token (JWT or similar). */
  accessToken: string;
  /** Unix timestamp (seconds) when the token expires. */
  expiresAt: number;
}

/**
 * Describes an OAuth provider configuration.
 * Concrete provider configs (e.g. Google) implement this interface.
 */
export interface OAuthProviderConfig {
  /** Unique identifier for this provider (e.g. "google"). */
  providerId: string;
  /** OAuth client ID. */
  clientId: string;
  /** OAuth client secret. */
  clientSecret: string;
  /** OAuth authorisation endpoint URL. */
  authorizationUrl: string;
  /** Token exchange endpoint URL. */
  tokenUrl: string;
  /** Requested OAuth scopes. */
  scopes: string[];
  /** Redirect URI registered with the provider. */
  redirectUri: string;
}

/**
 * Result of getAuthorizationUrl, containing PKCE verifiers if needed.
 */
export interface AuthorizationRequest {
  url: string;
  state: string;
  codeVerifier: string;
}

/**
 * The primary authentication service interface.
 * Implementations are responsible for provider-specific OAuth flows.
 */
export interface AuthService {
  /**
   * Generate an authorisation URL to redirect the user to the OAuth provider.
   */
  getAuthorizationUrl(): AuthorizationRequest;

  /**
   * Exchange an authorisation code for an authenticated session.
   * @param code - The authorisation code returned by the provider.
   * @param codeVerifier - The PKCE code verifier generated earlier.
   */
  handleCallback(code: string, codeVerifier: string): Promise<AuthSession>;

  /**
   * Validate an existing access token and return the associated user.
   * Returns null if the token is invalid or expired.
   */
  validateToken(token: string): Promise<UserIdentity | null>;

  /**
   * Invalidate the given session/token.
   */
  signOut(token: string): Promise<void>;
}
