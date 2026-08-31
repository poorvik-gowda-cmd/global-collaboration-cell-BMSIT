# Authorization Matrix — GCC Portal

> **Status:** RBAC is NOT yet implemented. This document defines the intended model.
> Implementation will begin after authentication (Google OAuth) is complete.

---

## Roles

| Role | Description |
|---|---|
| `guest` | Unauthenticated visitor |
| `member` | Authenticated GCC member |
| `coordinator` | GCC event/activity coordinator |
| `admin` | GCC President or Tech Lead — full access |

Role assignments are stored in `users.role` in D1.
A user's initial role is `member` on first sign-in. Role escalation requires an `admin`.

---

## Permission Matrix

### Events

| Action | guest | member | coordinator | admin |
|---|:---:|:---:|:---:|:---:|
| View published events | ✅ | ✅ | ✅ | ✅ |
| Register for event | ❌ | ✅ | ✅ | ✅ |
| Create event | ❌ | ❌ | ✅ | ✅ |
| Edit own event | ❌ | ❌ | ✅ | ✅ |
| Edit any event | ❌ | ❌ | ❌ | ✅ |
| Delete event | ❌ | ❌ | ❌ | ✅ |

### Opportunities

| Action | guest | member | coordinator | admin |
|---|:---:|:---:|:---:|:---:|
| View opportunities | ✅ | ✅ | ✅ | ✅ |
| Post opportunity | ❌ | ❌ | ✅ | ✅ |
| Edit own opportunity | ❌ | ❌ | ✅ | ✅ |
| Delete any opportunity | ❌ | ❌ | ❌ | ✅ |

### Users

| Action | guest | member | coordinator | admin |
|---|:---:|:---:|:---:|:---:|
| View own profile | ❌ | ✅ | ✅ | ✅ |
| Edit own profile | ❌ | ✅ | ✅ | ✅ |
| View member list | ❌ | ❌ | ✅ | ✅ |
| Change user role | ❌ | ❌ | ❌ | ✅ |
| Delete user | ❌ | ❌ | ❌ | ✅ |

### Tasks *(internal)*

| Action | guest | member | coordinator | admin |
|---|:---:|:---:|:---:|:---:|
| View assigned tasks | ❌ | ✅ | ✅ | ✅ |
| Create task | ❌ | ❌ | ✅ | ✅ |
| Assign task | ❌ | ❌ | ✅ | ✅ |
| Delete task | ❌ | ❌ | ❌ | ✅ |

---

## Implementation Notes *(for future reference)*

- Role checks will be implemented as Hono middleware in `apps/api`.
- The middleware reads the JWT claims and compares `user.role` against a
  route-level required role.
- Principle of least privilege: default to the most restrictive role.
- Role escalation emits an audit log entry (to be designed).

---

## Out of Scope

The following are explicitly out of scope for the initial RBAC implementation:
- Fine-grained resource-level permissions (e.g., per-event coordinators)
- Department-level roles
- Temporary elevated permissions
