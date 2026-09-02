/**
 * @gcc-portal/google-adapters
 *
 * Google Workspace API adapter interfaces and error types.
 * Concrete implementations (Sheets, Drive, Forms) are NOT included yet.
 *
 * @see docs/DATA_OWNERSHIP.md
 * @see docs/ARCHITECTURE.md — Google Workspace integration section
 */

export type {
  GoogleServiceAccountConfig,
  SheetRow,
  GoogleSheetsAdapter,
  GoogleSheetEventRecord,
  GoogleSheetsEventsAdapter,
  DriveFileMetadata,
  GoogleDriveAdapter,
  FormResponse,
  GoogleFormsAdapter,
} from "./interfaces.js";

export {
  GoogleAdapterError,
  GoogleAuthError,
  GoogleApiRateLimitError,
} from "./errors.js";

export { GoogleAuthClient } from "./auth.js";
export { GoogleSheetsService } from "./sheets.js";
export { GoogleSheetsEventsService, type GoogleSheetsEventsConfig } from "./events.js";

