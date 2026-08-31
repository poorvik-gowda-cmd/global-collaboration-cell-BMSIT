# Development Guide — GCC Portal

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 20 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Wrangler CLI | >= 4 | included as dev dependency |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/bmsit-gcc/global-collaboration-cell-BMSIT.git
cd global-collaboration-cell-BMSIT

# 2. Install all workspace dependencies
pnpm install

# 3. Copy environment templates
cp .env.example .env.local
cp apps/api/.dev.vars.example apps/api/.dev.vars

# 4. Edit both files and fill in the placeholder values
```

---

## Running the Development Servers

### Start everything at once
```bash
pnpm dev
```
This uses Turborepo to start `apps/web` and `apps/api` in parallel.

### Start individually
```bash
# Frontend only
pnpm --filter @gcc-portal/web dev

# API Worker only (requires .dev.vars to be populated)
pnpm --filter @gcc-portal/api dev
```

| App | URL |
|---|---|
| Web (Next.js) | http://localhost:3000 |
| API (Wrangler dev) | http://localhost:8787 |

---

## Common Commands

```bash
# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck

# Lint everything
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Run all unit tests (Vitest)
pnpm test

# Run e2e tests (Playwright) — requires a running web server
pnpm test:e2e

# Format all files
pnpm format

# Clean all build artifacts
pnpm clean
```

### Target a specific package
```bash
pnpm --filter @gcc-portal/api typecheck
pnpm --filter @gcc-portal/web test
```

---

## Working with D1 (Database)

> D1 database IDs must be filled in `apps/api/wrangler.toml` before using D1 locally.

```bash
# Create a local D1 database (development)
pnpm --filter @gcc-portal/api exec wrangler d1 create gcc-portal-db-dev

# Apply migrations
pnpm --filter @gcc-portal/api exec wrangler d1 migrations apply gcc-portal-db-dev --local

# List applied migrations
pnpm --filter @gcc-portal/api exec wrangler d1 migrations list gcc-portal-db-dev --local

# Generate TypeScript types from wrangler.toml bindings
pnpm --filter @gcc-portal/api cf:types
```

Migration files live in `apps/api/migrations/` and follow the naming convention:
`0001_<description>.sql`

---

## Adding a New Package

1. Create the directory: `packages/<name>/`
2. Add `package.json` with name `@gcc-portal/<name>`
3. Add `tsconfig.json` extending `../../tsconfig.base.json`
4. Add `eslint.config.mjs` re-exporting the root config
5. Add `vitest.config.ts`
6. Add `src/index.ts`
7. Run `pnpm install` to link the workspace

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `development` | Integration branch — CI runs on every push |
| `feature/*` | Feature branches — PR targets `development` |
| `fix/*` | Bug fix branches |

All PRs must pass CI (lint + typecheck + tests + build) before merging.

---

## Troubleshooting

**`pnpm install` fails with peer dependency errors**
Run `pnpm install --no-strict-peer-dependencies` as a temporary workaround, then investigate the actual conflict.

**Wrangler `dev` says "Missing D1 database ID"**
Fill in `database_id` in `apps/api/wrangler.toml` for the `development` environment. Create the DB first with `wrangler d1 create gcc-portal-db-dev`.

**Next.js type errors about `NEXT_PUBLIC_*` variables**
Add the variable to `apps/web/.env.local` and restart the dev server.

**Turbo cache stale after config changes**
Run `pnpm clean` then `pnpm build` to force a clean rebuild.
