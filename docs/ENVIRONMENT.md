# Environment Variables — GCC Portal

This document is the canonical reference for all environment variables used across the monorepo.
**Do not commit real secrets.** Use `.env.local` locally and Cloudflare / GitHub secrets in CI/CD.

---

## Variable Matrix

| Variable | Used in | Required | Description |
|---|---|---|---|
| `NODE_ENV` | web, api | Yes | `development` / `production` / `test` |
| `NEXT_PUBLIC_APP_URL` | web | Yes | Public URL of the Next.js app |
| `NEXT_PUBLIC_API_URL` | web | Yes | Public URL of the API Worker |
| `CLOUDFLARE_ACCOUNT_ID` | CI/CD | Deploy only | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | CI/CD | Deploy only | Cloudflare API token (Workers deploy scope) |
| `D1_DATABASE_ID` | CI/CD | Deploy only | D1 database ID (overrides wrangler.toml) |
| `ENVIRONMENT` | api | Yes | Runtime environment label (`development`/`staging`/`production`) |
| `LOG_LEVEL` | api | No | Log verbosity (`debug`/`info`/`warn`/`error`) |
| `CORS_ALLOWED_ORIGINS` | api | Yes | Comma-separated list of allowed CORS origins |
| `GOOGLE_CLIENT_ID` | api (future) | Auth only | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | api (future) | Auth only | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | api (future) | Auth only | OAuth callback URL |
| `GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL` | api (future) | Sheets only | Service account email |
| `GOOGLE_SHEETS_PRIVATE_KEY` | api (future) | Sheets only | Service account private key |
| `GOOGLE_DRIVE_FOLDER_ID` | api (future) | Drive only | Shared Drive folder ID |
| `JWT_SECRET` | api (future) | Auth only | JWT signing secret (>=32 chars, random) |
| `SESSION_SECRET` | api (future) | Auth only | Session encryption secret |

---

## Local Development Files

| File | Gitignored | Purpose |
|---|---|---|
| `.env.local` | ✅ | Root-level Next.js environment overrides |
| `apps/api/.dev.vars` | ✅ | Wrangler local dev secrets (maps to Worker `env.*`) |

Templates:
- `.env.example` — root template
- `apps/api/.dev.vars.example` — API Worker template

---

## Cloudflare Workers: How Variables Are Injected

In Workers, plain text variables are set in `wrangler.toml` under `[vars]` or per-environment.
Secret values (credentials, keys) must **never** appear in `wrangler.toml`. Use:

```bash
# Set a secret for production
wrangler secret put JWT_SECRET --env production

# Set a secret for staging
wrangler secret put JWT_SECRET --env staging
```

Locally, Wrangler reads from `apps/api/.dev.vars`:
```
JWT_SECRET=some-local-dev-secret
```

---

## GitHub Actions Secrets

The following repository secrets must be configured in GitHub for CI/CD to work:

| Secret name | Description |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | API token scoped to Workers/Pages deploy |

> Deployment workflows are not yet created. These will be needed when deployment automation is added.

---

## Security Rules

1. Never commit `.env`, `.env.local`, or `.dev.vars`.
2. Never put real secrets in `wrangler.toml`.
3. Rotate secrets immediately if accidentally committed.
4. Use the minimum required scopes for all API tokens.
5. Google service account keys must be restricted to specific Sheets/Drive resources.
