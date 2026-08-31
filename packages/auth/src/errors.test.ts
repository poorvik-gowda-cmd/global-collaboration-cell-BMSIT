import { describe, it, expect } from "vitest";
import {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  OAuthCallbackError,
} from "./errors.js";

describe("auth error classes", () => {
  it("AuthError carries code and message", () => {
    const err = new AuthError("something failed", "TEST_CODE");
    expect(err.message).toBe("something failed");
    expect(err.code).toBe("TEST_CODE");
    expect(err).toBeInstanceOf(Error);
  });

  it("TokenExpiredError has correct code", () => {
    const err = new TokenExpiredError();
    expect(err.code).toBe("TOKEN_EXPIRED");
    expect(err).toBeInstanceOf(AuthError);
  });

  it("InvalidTokenError has correct code", () => {
    const err = new InvalidTokenError();
    expect(err.code).toBe("INVALID_TOKEN");
  });

  it("OAuthCallbackError includes detail in message", () => {
    const err = new OAuthCallbackError("access_denied");
    expect(err.message).toContain("access_denied");
    expect(err.code).toBe("OAUTH_CALLBACK_ERROR");
  });
});
