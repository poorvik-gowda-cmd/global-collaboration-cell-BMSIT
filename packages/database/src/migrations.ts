/**
 * Migration helpers for Cloudflare D1.
 *
 * Cloudflare D1 migrations are SQL files executed via:
 *   wrangler d1 migrations apply <database-name>
 *
 * Migration files live in: apps/api/migrations/
 * File naming convention: 0001_<description>.sql
 *
 * This module provides TypeScript helpers for migration metadata only.
 * Do not run migrations programmatically — use `wrangler d1 migrations apply`.
 *
 * @see docs/DB_SCHEMA.md
 */

export interface MigrationRecord {
  id: number;
  name: string;
  appliedAt: string;
}

/**
 * Retrieve all applied migration records from the D1 migrations table.
 * Useful for health-checks and diagnostics.
 *
 * Note: D1 tracks applied migrations in the `d1_migrations` table automatically.
 */
export async function getAppliedMigrations(
  db: D1Database,
): Promise<MigrationRecord[]> {
  const result = await db
    .prepare(
      "SELECT id, name, applied_at as appliedAt FROM d1_migrations ORDER BY id ASC",
    )
    .all<MigrationRecord>();

  return result.results;
}
