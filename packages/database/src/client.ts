/**
 * D1 database client wrapper.
 *
 * Provides a thin typed wrapper around the Cloudflare D1 binding.
 * Query helpers and repository classes will be added here as features are built.
 *
 * @see docs/DB_SCHEMA.md for the planned schema
 */

export interface DatabaseConfig {
  /** The D1Database binding injected by the Cloudflare Worker runtime. */
  db: D1Database;
  /** Application environment, used for logging/metrics. */
  environment?: string;
}

/**
 * GCC Portal database client.
 * Wrap the raw D1Database binding and expose query helpers.
 */
export class DatabaseClient {
  private readonly db: D1Database;
  private readonly environment: string;

  constructor({ db, environment = "unknown" }: DatabaseConfig) {
    this.db = db;
    this.environment = environment;
  }

  /**
   * Execute a raw SQL statement.
   * Use this sparingly — prefer typed query helpers once they are added.
   */
  async exec(sql: string): Promise<D1ExecResult> {
    return this.db.exec(sql);
  }

  /**
   * Run a prepared statement and return all rows as type T.
   */
  async query<T = unknown>(
    sql: string,
    ...params: (string | number | boolean | null)[]
  ): Promise<T[]> {
    const stmt = this.db.prepare(sql).bind(...params);
    const result = await stmt.all<T>();
    return result.results;
  }

  /**
   * Run a prepared statement and return the first row as type T, or null.
   */
  async queryFirst<T = unknown>(
    sql: string,
    ...params: (string | number | boolean | null)[]
  ): Promise<T | null> {
    const stmt = this.db.prepare(sql).bind(...params);
    return stmt.first<T>();
  }

  /**
   * Run a write statement (INSERT / UPDATE / DELETE).
   * Returns D1 result metadata (rows changed, last row ID).
   */
  async run(
    sql: string,
    ...params: (string | number | boolean | null)[]
  ): Promise<D1Result> {
    const stmt = this.db.prepare(sql).bind(...params);
    return stmt.run();
  }

  /** Returns the environment this client is connected to, useful for logging. */
  get env(): string {
    return this.environment;
  }
}
