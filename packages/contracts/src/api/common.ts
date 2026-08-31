/**
 * Common API response envelope types.
 *
 * All GCC Portal API endpoints return responses in one of these shapes.
 * Detailed endpoint-specific contracts are defined in docs/API_CONTRACT.md
 * and will be typed here as features are built.
 */

/** A successful API response wrapping data of type T. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

/** A failed API response with a structured error. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Union of success and error responses. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Pagination metadata for list endpoints. */
export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

/** Standard paginated list response. */
export interface PaginatedResponse<T> {
  items: T[];
  meta: Required<ApiMeta>;
}
