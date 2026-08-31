/**
 * Smoke test — verifies the web app test setup is working.
 * Replace with meaningful component/page tests as features are built.
 */
import { describe, it, expect } from "vitest";

describe("web app smoke test", () => {
  it("passes a trivial assertion to confirm the test runner is set up correctly", () => {
    expect(true).toBe(true);
  });

  it("confirms the environment is jsdom", () => {
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});
