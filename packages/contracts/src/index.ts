/**
 * @gcc-portal/contracts
 *
 * Public exports for the shared contracts package.
 * Import from this entry point in both apps/web and apps/api.
 *
 * @example
 *   import type { ApiResponse, HealthResponse } from "@gcc-portal/contracts";
 */

// ---- API contracts ----
export type {
  ApiSuccess,
  ApiError,
  ApiResponse,
  ApiMeta,
  PaginatedResponse,
} from "./api/common.js";

export type { HealthResponse } from "./api/health.js";

// ---- Domain types ----
export type { UserIdentity, UserRole } from "./domain/user.js";
