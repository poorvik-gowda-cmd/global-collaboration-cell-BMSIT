import type { GoogleSheetsAdapter, GoogleSheetsEventsAdapter, GoogleSheetEventRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsEventsConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_EVENTS!A:P'
}

const DEFAULT_RANGE = 'GCC_EVENTS!A:P';
const EXPECTED_COLUMNS = [
  'event_id',
  'title',
  'short_description',
  'full_description',
  'category',
  'venue',
  'start_datetime',
  'end_datetime',
  'registration_status',
  'event_status',
  'registration_capacity',
  'registration_count',
  'banner_url',
  'created_by',
  'created_at',
  'updated_at'
];

export class GoogleSheetsEventsService implements GoogleSheetsEventsAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsEventsConfig
  ) {
    if (!config.spreadsheetId) {
      throw new GoogleAdapterError(
        "Missing required configuration: spreadsheetId", 
        "CONFIG_ERROR", 
        "sheets"
      );
    }
    this.range = config.range || DEFAULT_RANGE;
  }

  async getEvents(): Promise<GoogleSheetEventRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row['event_id']) {
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

      return record as unknown as GoogleSheetEventRecord;
    });
  }

  async appendEvent(event: GoogleSheetEventRecord): Promise<void> {
    if (!event.event_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append event without event_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const values = EXPECTED_COLUMNS.map(col => event[col as keyof GoogleSheetEventRecord] ?? "");
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }
}
