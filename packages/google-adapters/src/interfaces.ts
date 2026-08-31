/**
 * Google Workspace adapter interfaces — GCC Portal
 *
 * These interfaces define contracts for future Google API integrations.
 * Concrete implementations are NOT included yet.
 *
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
