import { describe, it, expect } from "vitest";
import {
  DatabaseError,
  RecordNotFoundError,
  UniqueConstraintError,
} from "./errors.js";

describe("database error classes", () => {
  it("DatabaseError carries code", () => {
    const err = new DatabaseError("db failed", "DB_ERROR");
    expect(err.code).toBe("DB_ERROR");
    expect(err).toBeInstanceOf(Error);
  });

  it("RecordNotFoundError formats message correctly", () => {
    const err = new RecordNotFoundError("User", "abc-123");
    expect(err.message).toContain("User");
    expect(err.message).toContain("abc-123");
    expect(err.code).toBe("RECORD_NOT_FOUND");
  });

  it("UniqueConstraintError names the conflicting field", () => {
    const err = new UniqueConstraintError("email");
    expect(err.message).toContain("email");
    expect(err.code).toBe("UNIQUE_CONSTRAINT_VIOLATION");
  });
});
