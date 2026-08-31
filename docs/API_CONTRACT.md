# API Contract — GCC Portal

> **Status:** Foundation only. Detailed endpoint contracts are to be defined as features are built.

All API types are defined in `packages/contracts/src/`.

---

## Base URL

| Environment | Base URL |
|---|---|
| Development | `http://localhost:8787` |
| Staging | `https://gcc-portal-api-staging.workers.dev` *(placeholder)* |
| Production | `https://gcc-portal-api.workers.dev` *(placeholder)* |

---

## Response Envelope

All endpoints return JSON in one of two shapes:

**Success**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "User with id \"abc\" was not found.",
    "details": {}
  }
}
```

TypeScript types: `ApiSuccess<T>`, `ApiError`, `ApiResponse<T>` from `@gcc-portal/contracts`.

---

## Implemented Endpoints

### `GET /`
Returns basic API metadata.

**Response**
```json
{
  "name": "gcc-portal-api",
  "description": "GCC Portal REST API",
  "docs": "/health",
  "status": "ok"
}
```

---

### `GET /health`
Health-check endpoint used by monitoring and CI/CD.

**Response** (`200 OK`)
```json
{
  "status": "ok",
  "service": "gcc-portal-api",
  "environment": "development",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "0.0.1"
}
```

TypeScript type: `HealthResponse` from `@gcc-portal/contracts`.

---

## Planned Endpoints *(not yet implemented)*

The following endpoint groups are planned. Contracts will be added here as each is designed.

| Group | Prefix | Status |
|---|---|---|
| Authentication | `/auth/*` | Planned — requires Google OAuth |
| Users | `/users/*` | Planned |
| Events | `/events/*` | Planned |
| Opportunities | `/opportunities/*` | Planned |
| Registrations | `/registrations/*` | Planned |
| Tasks | `/tasks/*` | Planned |

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `NOT_FOUND` | 404 | Resource does not exist |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `VALIDATION_ERROR` | 422 | Request body failed schema validation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Authentication *(planned)*

All protected endpoints will require a Bearer token:
```
Authorization: Bearer <jwt>
```

JWTs will be issued by the `/auth/callback` endpoint after successful Google OAuth login.
Token validation occurs in the Worker middleware before reaching route handlers.

---

## Versioning

The API is currently unversioned (`v0`). A `/v1/` path prefix will be introduced before the
first production release.
