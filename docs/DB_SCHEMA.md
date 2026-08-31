# Database Schema — GCC Portal

> **Status:** Schema not yet finalised. This document is a planning placeholder.
> Production tables will be created via Wrangler migration files in `apps/api/migrations/`.

---

## Database Technology

- **Cloudflare D1** — SQLite-compatible, runs at the edge.
- Migrations managed via `wrangler d1 migrations`.
- Migration files: `apps/api/migrations/XXXX_<description>.sql`
- The `packages/database` package provides the `DatabaseClient` abstraction.

---

## Migration Strategy

```bash
# Create a new migration file
wrangler d1 migrations create gcc-portal-db-dev "<description>"

# Apply all pending migrations (local)
wrangler d1 migrations apply gcc-portal-db-dev --local

# Apply all pending migrations (remote)
wrangler d1 migrations apply gcc-portal-db --env production
```

Migration files are SQL and committed to the repository. They are applied in order and are
irreversible — use new migrations to alter existing tables.

---

## Planned Tables *(not yet created)*

The following entities are expected based on initial product requirements.
Exact columns, constraints, and indexes are to be determined during feature design.

### `users`
Stores authenticated user accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `email` | TEXT | Unique, from Google |
| `display_name` | TEXT | From Google profile |
| `avatar_url` | TEXT | Nullable |
| `role` | TEXT | `member` / `coordinator` / `admin` |
| `created_at` | TEXT | ISO 8601 timestamp |
| `updated_at` | TEXT | ISO 8601 timestamp |

### `events` *(planned)*
GCC-organised events.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `title` | TEXT | — |
| `description` | TEXT | Nullable |
| `date` | TEXT | ISO 8601 |
| `location` | TEXT | Nullable |
| `created_by` | TEXT | FK → `users.id` |
| `created_at` | TEXT | — |

### `registrations` *(planned)*
Event registration records.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `event_id` | TEXT | FK → `events.id` |
| `user_id` | TEXT | FK → `users.id` |
| `registered_at` | TEXT | — |

### `opportunities` *(planned)*
External opportunities (internships, competitions, etc.).

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `title` | TEXT | — |
| `description` | TEXT | — |
| `deadline` | TEXT | Nullable |
| `created_by` | TEXT | FK → `users.id` |
| `created_at` | TEXT | — |

### `tasks` *(planned)*
Internal task tracking for coordinators.

> Schema TBD

---

## Design Principles

1. All primary keys are UUIDs (TEXT) — avoids sequential ID leakage.
2. Timestamps are stored as ISO 8601 TEXT — SQLite has no native DATE type.
3. Foreign keys are declared but D1 requires `PRAGMA foreign_keys = ON` per connection.
4. No soft-delete pattern yet — to be decided during feature design.
5. Keep the schema minimal — add columns only when a feature requires them.
