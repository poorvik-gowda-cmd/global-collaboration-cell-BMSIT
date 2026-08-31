# GCC Portal — Global Collaboration Cell, BMSIT

The official web platform for the Global Collaboration Cell at BMS Institute of Technology and Management.

> **Status:** Foundation scaffold — business features are not yet implemented.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend API | Cloudflare Workers, TypeScript |
| Database | Cloudflare D1 (SQLite at the edge) |
| Deployment | Cloudflare Pages / Workers |
| Operational data | Google Sheets, Google Forms, Google Drive |
| Authentication | Google OAuth/OIDC *(planned)* |
| Testing | Vitest (unit), Playwright (e2e) |
| CI/CD | GitHub Actions |

---

## Repository Structure

```
gcc-portal/
├── apps/
│   ├── web/          # Next.js frontend (TypeScript + Tailwind CSS)
│   └── api/          # Cloudflare Worker REST API
├── packages/
│   ├── contracts/    # Shared TypeScript types and API contracts
│   ├── auth/         # Auth interfaces/helpers (implementation pending)
│   ├── database/     # D1 database abstraction layer
│   ├── google-adapters/  # Google Workspace API adapters (implementation pending)
│   └── ui/           # Shared React component library
├── docs/             # Architecture and design documentation
├── tests/            # End-to-end Playwright tests
└── .github/
    └── workflows/    # GitHub Actions CI pipelines
```

---

## Package Manager

This monorepo uses **pnpm** with workspaces, orchestrated by **Turborepo**.

- pnpm is chosen for its efficient disk usage via a content-addressable store and strict dependency isolation.
- Turborepo provides incremental, cached task execution across packages.

### Prerequisites

- Node.js >= 20
- pnpm >= 9 — install with `npm install -g pnpm`

---

## Getting Started

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Copy the environment template
cp .env.example .env.local
# Edit .env.local and fill in placeholder values

# 3. Start all apps in development mode
pnpm dev

# 4. Or start individual apps
pnpm --filter @gcc-portal/web dev
pnpm --filter @gcc-portal/api dev
```

---

## Common Commands

| Command | Description |
|---|---|
| `pnpm build` | Build all packages and apps |
| `pnpm dev` | Start all apps in development mode |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all unit tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm clean` | Remove all build artifacts and node_modules |

---

## Documentation

See the [`docs/`](./docs/) directory for:

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System design and component overview
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) — Local development guide
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — Environment variable reference
- [API_CONTRACT.md](./docs/API_CONTRACT.md) — API design and contracts
- [DB_SCHEMA.md](./docs/DB_SCHEMA.md) — Database schema documentation
- [DATA_OWNERSHIP.md](./docs/DATA_OWNERSHIP.md) — Data ownership and governance
- [AUTHORIZATION_MATRIX.md](./docs/AUTHORIZATION_MATRIX.md) — Role-based access control matrix

---

## Contributing

Branch strategy:

- `main` — production-ready code
- `development` — integration branch (CI runs on push)
- `feature/*` — feature branches (PRs target `development`)

All PRs must pass CI checks (lint, typecheck, tests, build) before merging.
