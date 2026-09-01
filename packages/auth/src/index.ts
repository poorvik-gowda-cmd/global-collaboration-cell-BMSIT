/**
 * @gcc-portal/auth
 *
 * Authentication interfaces, types, and error classes.
 * Concrete OAuth implementations are NOT included yet.
 *
 * @see docs/ARCHITECTURE.md — Authentication section
 */

export type {
  AuthSession,
  OAuthProviderConfig,
  AuthService,
} from "./interfaces.js";

export {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  OAuthCallbackError,
} from "./errors.js";

export { GoogleAuthService } from "./google.js";
export type { GoogleAuthDependencies } from "./google.js";
