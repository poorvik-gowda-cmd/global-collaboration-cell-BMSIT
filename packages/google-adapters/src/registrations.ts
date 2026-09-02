import type { GoogleSheetsAdapter, GoogleSheetsRegistrationsAdapter, GoogleSheetRegistrationRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsRegistrationsConfig {
  spreadsheetId: string;
}

const EXPECTED_COLUMNS = [
  'registration_id',
  'event_id',
  'full_name',
  'email',
  'phone',
  'college',
  'department',
  'year',
  'custom_fields',
  'registered_at',
  'status'
];

export class GoogleSheetsRegistrationsService implements GoogleSheetsRegistrationsAdapter {
  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsRegistrationsConfig
  ) {
    if (!config.spreadsheetId) {
      throw new GoogleAdapterError(
        "Missing required configuration: spreadsheetId", 
        "CONFIG_ERROR", 
        "sheets"
      );
    }
  }

  private getSheetName(eventId: string): string {
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      throw new GoogleAdapterError("Invalid event_id provided for sheet naming", "CONFIG_ERROR", "sheets");
    }

    const sanitized = eventId.trim().toUpperCase();
    
    // Enforce the project's expected event ID convention: EVENT-YYYY-NNN
    if (!/^EVENT-\d{4}-\d{3}$/.test(sanitized)) {
      throw new GoogleAdapterError(
        `Invalid event ID format: ${sanitized}. Expected format: EVENT-YYYY-NNN`,
        "CONFIG_ERROR",
        "sheets"
      );
    }
    
    return `${sanitized}_REGISTRATIONS`;
  }

  private getRange(eventId: string): string {
    const sheetName = this.getSheetName(eventId);
    return `${sheetName}!A:K`;
  }

  async getRegistrations(eventId: string): Promise<GoogleSheetRegistrationRecord[]> {
    const range = this.getRange(eventId);
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, range);
    
    return rows.map((row, index) => {
      if (!row.registration_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing registration_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }
      if (!row.event_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing event_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetRegistrationRecord;
    });
  }

  async appendRegistration(registration: GoogleSheetRegistrationRecord): Promise<void> {
    if (!registration.registration_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append registration without registration_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }
    if (!registration.event_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append registration without event_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const range = this.getRange(registration.event_id);
    const values = EXPECTED_COLUMNS.map(col => registration[col as keyof GoogleSheetRegistrationRecord] ?? "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, range, values);
  }

  async getRegistrationById(eventId: string, registrationId: string): Promise<GoogleSheetRegistrationRecord | null> {
    if (!registrationId) {
      throw new GoogleAdapterError("Missing registrationId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const registrations = await this.getRegistrations(eventId);
    const match = registrations.find(r => r.registration_id === registrationId);
    
    return match || null;
  }
}
