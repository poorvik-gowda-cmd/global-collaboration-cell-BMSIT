/**
 * Google Workspace adapter interfaces — GCC Portal
 *
 * These interfaces define contracts for Google API integrations.
 * Concrete implementations for Google Sheets are included.
 * Planned adapters:
 *   - GoogleSheetsAdapter  — read/write operational data from Google Sheets
 *   - GoogleDriveAdapter   — file management and folder access
 *   - GoogleFormsAdapter   — form submission ingestion
 *
 * @see docs/ARCHITECTURE.md — Data ownership section
 * @see docs/DATA_OWNERSHIP.md
 */

// -----------------------------------------------------------------------
// Credential configuration (injected — never hard-coded)
// -----------------------------------------------------------------------

/**
 * Service account credentials for server-to-server Google API access.
 * Values are sourced from environment variables / Cloudflare Worker secrets.
 */
export interface GoogleServiceAccountConfig {
  clientEmail: string;
  privateKey: string;
  projectId: string;
}

// -----------------------------------------------------------------------
// Sheets adapter
// -----------------------------------------------------------------------

/** A single row of data from a Google Sheet, keyed by column header. */
export type SheetRow = Record<string, string>;

/**
 * Interface for reading/writing Google Sheets data.
 * Implement this to add the concrete Sheets adapter.
 */
export interface GoogleSheetsAdapter {
  /**
   * Read all rows from a named sheet range.
   * @param spreadsheetId - The Google Sheets document ID.
   * @param range - A1-notation range (e.g. "Sheet1!A1:Z").
   */
  readRows(spreadsheetId: string, range: string): Promise<SheetRow[]>;

  /**
   * Append a row to a sheet.
   * @param spreadsheetId - The Google Sheets document ID.
   * @param range - Target sheet/range.
   * @param values - Column values to append.
   */
  appendRow(
    spreadsheetId: string,
    range: string,
    values: string[],
  ): Promise<void>;
}

// -----------------------------------------------------------------------
// Drive adapter
// -----------------------------------------------------------------------

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string | undefined;
  createdTime?: string | undefined;
}

/**
 * Interface for Google Drive file operations.
 */
export interface GoogleDriveAdapter {
  /**
   * List files in a Drive folder.
   * @param folderId - The Google Drive folder ID.
   */
  listFiles(folderId: string): Promise<DriveFileMetadata[]>;

  /**
   * Get metadata for a single file.
   * @param fileId - The Google Drive file ID.
   */
  getFile(fileId: string): Promise<DriveFileMetadata>;
}

// -----------------------------------------------------------------------
// Forms adapter
// -----------------------------------------------------------------------

/** A single form response, keyed by question title. */
export type FormResponse = Record<string, string>;

/**
 * Interface for reading Google Forms response data.
 */
export interface GoogleFormsAdapter {
  /**
   * Retrieve all responses for a form.
   * @param formId - The Google Forms document ID.
   */
  getResponses(formId: string): Promise<FormResponse[]>;
}

// -----------------------------------------------------------------------
// Events adapter
// -----------------------------------------------------------------------

export interface GoogleSheetEventRecord {
  event_id: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  venue: string;
  start_datetime: string;
  end_datetime: string;
  registration_status: string;
  event_status: string;
  registration_capacity: string;
  registration_count: string;
  banner_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsEventsAdapter {
  getEvents(): Promise<GoogleSheetEventRecord[]>;
  appendEvent(event: GoogleSheetEventRecord): Promise<void>;
}

// -----------------------------------------------------------------------
// Registrations adapter
// -----------------------------------------------------------------------

export interface GoogleSheetRegistrationRecord {
  registration_id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  custom_fields: string;
  registered_at: string;
  status: string;
}

export interface GoogleSheetsRegistrationsAdapter {
  getRegistrations(eventId: string): Promise<GoogleSheetRegistrationRecord[]>;
  appendRegistration(registration: GoogleSheetRegistrationRecord): Promise<void>;
  getRegistrationById(eventId: string, registrationId: string): Promise<GoogleSheetRegistrationRecord | null>;
}

// -----------------------------------------------------------------------
// Tasks adapter
// -----------------------------------------------------------------------

export interface GoogleSheetTaskRecord {
  task_id: string;
  title: string;
  description: string;
  department: string;
  assigned_to_user_id: string;
  assigned_to_name: string;
  assigned_by: string;
  deadline: string;
  priority: string;
  status: string;
  progress_update: string;
  latest_update_at: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsTasksAdapter {
  getTasks(): Promise<GoogleSheetTaskRecord[]>;
  appendTask(task: GoogleSheetTaskRecord): Promise<void>;
  getTaskById(taskId: string): Promise<GoogleSheetTaskRecord | null>;
}

// -----------------------------------------------------------------------
// Opportunities adapter
// -----------------------------------------------------------------------

export interface GoogleSheetOpportunityRecord {
  opportunity_id: string;
  title: string;
  organization: string;
  category: string;
  description: string;
  deadline: string;
  application_url: string;
  country: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsOpportunitiesAdapter {
  getOpportunities(): Promise<GoogleSheetOpportunityRecord[]>;
  appendOpportunity(opportunity: GoogleSheetOpportunityRecord): Promise<void>;
  getOpportunityById(opportunityId: string): Promise<GoogleSheetOpportunityRecord | null>;
}

// -----------------------------------------------------------------------
// Research Metadata adapter
// -----------------------------------------------------------------------

export interface GoogleSheetResearchRecord {
  research_id: string;
  title: string;
  description: string;
  category: string;
  drive_file_id: string;
  drive_url: string;
  owner: string;
  department: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetsResearchAdapter {
  getResearchRecords(): Promise<GoogleSheetResearchRecord[]>;
  appendResearchRecord(record: GoogleSheetResearchRecord): Promise<void>;
  getResearchRecordById(researchId: string): Promise<GoogleSheetResearchRecord | null>;
}
