# Data Ownership — GCC Portal

> **Status:** Governance model to be formally approved. This is a planning document.

---

## Overview

GCC Portal uses two distinct data stores with different ownership models:

| Store | Owner | Access Model |
|---|---|---|
| Cloudflare D1 (primary DB) | GCC Tech Team | API Worker only — no direct client access |
| Google Sheets/Drive/Forms | GCC Operations Team | Managed via Google Workspace; synced via adapters |

---

## Cloudflare D1 — Application Database

**Who owns it:** The GCC Portal application (i.e., the Tech Team).

**What lives here:**
- User accounts and authentication state
- Event records
- Registration data
- Opportunities
- Internal tasks

**Access rules:**
- Only `apps/api` (the Cloudflare Worker) can query D1 directly via the `DB` binding.
- The frontend (`apps/web`) never queries D1 — it only calls the API.
- No public read access to the database.

**Data retention:** TBD — to be defined before launch.

**Backup strategy:** Cloudflare D1 has point-in-time recovery (PITR). Additional export
procedures will be documented when the production schema is finalised.

---

## Google Workspace — Operational Data

**Who owns it:** GCC Operations and Faculty Coordinators.

**What lives here:**
- Event planning sheets
- Member registration form responses
- Shared documents and resources in Drive

**Access rules:**
- Google Sheets/Forms/Drive data is read/written by `apps/api` via service account credentials
  stored as Wrangler secrets.
- The service account has the minimum required Drive/Sheets permissions.
- Credentials are **never** exposed to the frontend.

**Sync model:** *(to be designed)*
- Option A: Real-time — Worker queries Sheets on every API request.
- Option B: Scheduled sync — Worker reads Sheets periodically and writes to D1.
- Option C: Webhook — Google Sheets triggers a Worker endpoint on change.

The sync model will be chosen when the Google adapter implementations are built.

---

## Personal Data (DPDP / Privacy)

GCC Portal will store personal data (email addresses, display names) from Google accounts.

**Obligations (to be addressed before launch):**
1. Privacy notice displayed at sign-up.
2. Users can request deletion of their account data.
3. No personal data is exported to third-party services without consent.
4. Google profile data is stored only as needed for the application.

**Compliance owner:** Faculty Coordinator + GCC President.

---

## Data Classification

| Classification | Examples | Handling |
|---|---|---|
| Public | Event names, opportunities | Can be served without authentication |
| Internal | Member list, registration counts | Requires authentication |
| Sensitive | Email addresses, Google tokens | Encrypted in transit; never logged |
| Secret | API keys, OAuth secrets | Wrangler secrets / GitHub Actions secrets only |
