import type { GoogleSheetsAdapter, GoogleSheetsOpportunitiesAdapter, GoogleSheetOpportunityRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsOpportunitiesConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_OPPORTUNITIES!A:K'
}

const DEFAULT_RANGE = 'GCC_OPPORTUNITIES!A:K';
const EXPECTED_COLUMNS = [
  'opportunity_id',
  'title',
  'organization',
  'category',
  'description',
  'deadline',
  'application_url',
  'country',
  'status',
  'created_at',
  'updated_at'
];

export class GoogleSheetsOpportunitiesService implements GoogleSheetsOpportunitiesAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsOpportunitiesConfig
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

  async getOpportunities(): Promise<GoogleSheetOpportunityRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row.opportunity_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing opportunity_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetOpportunityRecord;
    });
  }

  async appendOpportunity(opportunity: GoogleSheetOpportunityRecord): Promise<void> {
    if (!opportunity.opportunity_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append opportunity without opportunity_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const values = EXPECTED_COLUMNS.map(col => opportunity[col as keyof GoogleSheetOpportunityRecord] || "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }

  async getOpportunityById(opportunityId: string): Promise<GoogleSheetOpportunityRecord | null> {
    if (!opportunityId) {
      throw new GoogleAdapterError("Missing opportunityId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const opportunities = await this.getOpportunities();
    const match = opportunities.find(o => o.opportunity_id === opportunityId);
    
    return match ?? null;
  }
}
