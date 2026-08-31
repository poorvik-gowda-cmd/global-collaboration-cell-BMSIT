/**
 * Typed error classes for the authentication layer.
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super("The access token has expired.", "TOKEN_EXPIRED");
    this.name = "TokenExpiredError";
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super("The access token is invalid.", "INVALID_TOKEN");
    this.name = "InvalidTokenError";
  }
}

export class OAuthCallbackError extends AuthError {
  constructor(detail: string) {
    super(`OAuth callback failed: ${detail}`, "OAUTH_CALLBACK_ERROR");
    this.name = "OAuthCallbackError";
  }
}
