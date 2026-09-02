import type { GoogleSheetsAdapter, GoogleSheetsMouAdapter, GoogleSheetMouRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsMouConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_MOU_METADATA!A:K'
}

const DEFAULT_RANGE = 'GCC_MOU_METADATA!A:K';
const EXPECTED_COLUMNS = [
  'mou_id',
  'institution_name',
  'country',
  'collaboration_area',
  'year',
  'drive_file_id',
  'drive_url',
  'access_level',
  'status',
  'created_at',
  'updated_at'
];

export class GoogleSheetsMouService implements GoogleSheetsMouAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsMouConfig
  ) {
    if (!config.spreadsheetId) {
      throw new GoogleAdapterError(
        "Missing required configuration: spreadsheetId", 
        "CONFIG_ERROR", 
        "sheets"
      );
    }
    this.range = config.range ?? DEFAULT_RANGE;
  }

  async getMouRecords(): Promise<GoogleSheetMouRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row.mou_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing mou_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetMouRecord;
    });
  }

  async appendMouRecord(record: GoogleSheetMouRecord): Promise<void> {
    if (!record.mou_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append MOU record without mou_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const values = EXPECTED_COLUMNS.map(col => record[col as keyof GoogleSheetMouRecord] || "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }

  async getMouRecordById(mouId: string): Promise<GoogleSheetMouRecord | null> {
    if (!mouId) {
      throw new GoogleAdapterError("Missing mouId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const records = await this.getMouRecords();
    const match = records.find(r => r.mou_id === mouId);
    
    return match ?? null;
  }
}
