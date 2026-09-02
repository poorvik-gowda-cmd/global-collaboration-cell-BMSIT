import type { GoogleSheetsAdapter, GoogleSheetsResearchAdapter, GoogleSheetResearchRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsResearchConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_RESEARCH_METADATA!A:K'
}

const DEFAULT_RANGE = 'GCC_RESEARCH_METADATA!A:K';
const EXPECTED_COLUMNS = [
  'research_id',
  'title',
  'description',
  'category',
  'drive_file_id',
  'drive_url',
  'owner',
  'department',
  'status',
  'created_at',
  'updated_at'
];

export class GoogleSheetsResearchService implements GoogleSheetsResearchAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsResearchConfig
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

  async getResearchRecords(): Promise<GoogleSheetResearchRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row.research_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing research_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetResearchRecord;
    });
  }

  async appendResearchRecord(record: GoogleSheetResearchRecord): Promise<void> {
    if (!record.research_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append research record without research_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const values = EXPECTED_COLUMNS.map(col => record[col as keyof GoogleSheetResearchRecord] || "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }

  async getResearchRecordById(researchId: string): Promise<GoogleSheetResearchRecord | null> {
    if (!researchId) {
      throw new GoogleAdapterError("Missing researchId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const records = await this.getResearchRecords();
    const match = records.find(r => r.research_id === researchId);
    
    return match ?? null;
  }
}
