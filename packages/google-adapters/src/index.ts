/**
 * @gcc-portal/google-adapters
 *
 * Google Workspace API adapter interfaces and error types.
 * Concrete implementations for Google Sheets are included.
 * @see docs/DATA_OWNERSHIP.md
 * @see docs/ARCHITECTURE.md — Google Workspace integration section
 */

export type {
  GoogleServiceAccountConfig,
  SheetRow,
  GoogleSheetsAdapter,
  GoogleSheetEventRecord,
  GoogleSheetsEventsAdapter,
  GoogleSheetRegistrationRecord,
  GoogleSheetsRegistrationsAdapter,
  GoogleSheetTaskRecord,
  GoogleSheetsTasksAdapter,
  GoogleSheetOpportunityRecord,
  GoogleSheetsOpportunitiesAdapter,
  GoogleSheetResearchRecord,
  GoogleSheetsResearchAdapter,
  GoogleSheetMouRecord,
  GoogleSheetsMouAdapter,
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
export { GoogleSheetsRegistrationsService, type GoogleSheetsRegistrationsConfig } from "./registrations.js";
export { GoogleSheetsTasksService, type GoogleSheetsTasksConfig } from "./tasks.js";
export { GoogleSheetsOpportunitiesService, type GoogleSheetsOpportunitiesConfig } from "./opportunities.js";
export { GoogleSheetsResearchService, type GoogleSheetsResearchConfig } from "./research.js";
export { GoogleSheetsMouService, type GoogleSheetsMouConfig } from "./mou.js";

