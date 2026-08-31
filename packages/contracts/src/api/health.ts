/**
 * Contract types for the /health endpoint.
 */
export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  service: string;
  environment: string;
  timestamp: string;
  version: string;
}
