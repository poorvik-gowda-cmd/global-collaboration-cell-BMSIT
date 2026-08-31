/**
 * Typed error classes for Google API adapter failures.
 */

export class GoogleAdapterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly adapter: string,
  ) {
    super(message);
    this.name = "GoogleAdapterError";
  }
}

export class GoogleAuthError extends GoogleAdapterError {
  constructor(detail: string) {
    super(
      `Google API authentication failed: ${detail}`,
      "GOOGLE_AUTH_ERROR",
      "auth",
    );
    this.name = "GoogleAuthError";
  }
}

export class GoogleApiRateLimitError extends GoogleAdapterError {
  constructor(adapter: string) {
    super(
      "Google API rate limit exceeded. Retry after backing off.",
      "GOOGLE_RATE_LIMIT",
      adapter,
    );
    this.name = "GoogleApiRateLimitError";
  }
}
