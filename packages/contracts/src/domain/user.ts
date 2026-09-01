/**
 * User domain types — foundation only.
 *
 * Detailed user models, role definitions, and profile fields are to be
 * finalised during the authentication and RBAC implementation phase.
 * See docs/AUTHORIZATION_MATRIX.md for the planned role model.
 */

/**
 * Minimal user identity as returned by the authentication layer.
 * Populated after Google OAuth/OIDC is implemented.
 */
export interface UserIdentity {
  /** Internal application user ID (UUID v4). */
  id: string;
  /** User's email address from Google account. */
  email: string;
  /** Display name from Google profile. */
  displayName: string;
  /** URL to the user's Google profile picture. */
  avatarUrl?: string | undefined;
  /** Role in the system (member, coordinator, admin). */
  role: UserRole;
}

/**
 * Placeholder for the full user role enum.
 * To be expanded when RBAC is implemented.
 *
 * @see docs/AUTHORIZATION_MATRIX.md
 */
export type UserRole = "member" | "coordinator" | "admin";
