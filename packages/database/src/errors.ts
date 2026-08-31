/**
 * Typed error classes for the database layer.
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found.`, "RECORD_NOT_FOUND");
    this.name = "RecordNotFoundError";
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(field: string) {
    super(
      `A record with this ${field} already exists.`,
      "UNIQUE_CONSTRAINT_VIOLATION",
    );
    this.name = "UniqueConstraintError";
  }
}
