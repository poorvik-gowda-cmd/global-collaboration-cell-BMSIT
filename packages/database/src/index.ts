/**
 * @gcc-portal/database
 *
 * Cloudflare D1 database abstraction layer.
 * Provides typed query helpers and error classes.
 *
 * @see docs/DB_SCHEMA.md for the planned schema
 */

export { DatabaseClient } from "./client.js";
export type { DatabaseConfig } from "./client.js";

export { getAppliedMigrations } from "./migrations.js";
export type { MigrationRecord } from "./migrations.js";

export {
  DatabaseError,
  RecordNotFoundError,
  UniqueConstraintError,
} from "./errors.js";
