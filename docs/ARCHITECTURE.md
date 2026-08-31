# Architecture — GCC Portal

> **Status:** Foundation scaffold. Detailed architecture evolves as features are designed.

---

## System Overview

GCC Portal is a full-stack web platform deployed entirely on Cloudflare's edge network.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
          ┌──────────────▼──────────────┐
          │      Cloudflare CDN/Edge     │
          └──────┬───────────────┬───────┘
                 │               │
    ┌────────────▼───┐   ┌───────▼──────────┐
    │   apps/web      │   │    apps/api       │
    │  (Next.js)      │   │  (CF Worker/Hono) │
    │  CF Pages       │   │  CF Workers       │
    └────────────────┘   └───────┬──────────┘
                                 │
                    ┌────────────▼───────────┐
                    │    Cloudflare D1        │
                    │    (SQLite at edge)     │
                    └────────────────────────┘
```

---

## Monorepo Structure

```
gcc-portal/
├── apps/
│   ├── web/              Next.js frontend — served from Cloudflare Pages
│   └── api/              REST API — Cloudflare Worker (Hono framework)
├── packages/
│   ├── contracts/        Shared TypeScript types and API response shapes
│   ├── auth/             Auth interfaces (Google OAuth/OIDC — pending)
│   ├── database/         D1 abstraction layer (DatabaseClient, migrations)
│   ├── google-adapters/  Google Workspace adapter interfaces (pending)
│   └── ui/               Shared React component library
├── docs/                 This directory
├── tests/                Playwright end-to-end tests
└── .github/workflows/    GitHub Actions CI pipelines
```

---

## Technology Decisions

### Package Manager: pnpm + Turborepo
- **pnpm** — strict dependency isolation, efficient disk use via content-addressable store.
- **Turborepo** — incremental cached task execution across packages.

### Frontend: Next.js 15 on Cloudflare Pages
- App Router with React Server Components.
- Deployment via `@cloudflare/next-on-pages` (OpenNext adapter) or `vinext` once stable.
- Tailwind CSS v4 for styling.

### API: Cloudflare Workers + Hono
- **Hono** — ultra-lightweight typed router designed for the Workers runtime.
- D1 binding injected via `wrangler.toml` environment bindings.
- CORS configured per-environment from environment variables.

### Database: Cloudflare D1
- SQLite-compatible, runs at the edge next to Workers.
- Schema managed via Wrangler migration files in `apps/api/migrations/`.
- `packages/database` provides a typed `DatabaseClient` wrapper.

### Authentication: Google OAuth/OIDC *(not yet implemented)*
- Interfaces are defined in `packages/auth`.
- Will use Google's OIDC endpoint for sign-in.
- Session tokens will be short-lived JWTs verified in the Worker.
- See `docs/AUTHORIZATION_MATRIX.md` for planned roles.

### Operational Data: Google Workspace *(not yet implemented)*
- Google Sheets for operational records (event data, registration data).
- Google Forms for member input.
- Google Drive for file storage.
- Adapters defined in `packages/google-adapters` — implementations pending.

---

## Web ↔ API Connection

`apps/web` and `apps/api` are separate deployments that communicate over HTTPS:

- **Development:** `apps/web` runs on `localhost:3000`; `apps/api` runs on `localhost:8787`.
  The web app reads `NEXT_PUBLIC_API_URL` to construct API request URLs.
- **Production:** The API Worker is deployed to a `*.workers.dev` subdomain or a custom domain.
  `NEXT_PUBLIC_API_URL` is set to that URL at build time via Cloudflare Pages environment variables.
- **Shared types:** Both apps import from `@gcc-portal/contracts` so request/response shapes
  stay in sync without runtime overhead.

There is no server-side proxy in Next.js — all API calls go directly to the Worker. This keeps
routing simple and avoids double-hop latency at the edge.

---

## Deployment Topology

| Asset | Platform | URL pattern |
|---|---|---|
| Next.js frontend | Cloudflare Pages | `gcc-portal.pages.dev` / custom domain |
| Hono API Worker | Cloudflare Workers | `gcc-portal-api.workers.dev` / custom domain |
| Database | Cloudflare D1 | Bound to API Worker as `DB` |

> Deployment is NOT configured yet. See `ENVIRONMENT.md` for required variables.

---

## Security Principles

1. All secrets are injected via environment variables / Wrangler secrets. No secrets in code.
2. CORS allowlist is environment-specific.
3. Authentication will be handled entirely in the Worker — the frontend never holds raw tokens.
4. D1 is only accessible from the Worker, never from the frontend directly.
5. Content Security Policy headers will be added during the security hardening phase.
