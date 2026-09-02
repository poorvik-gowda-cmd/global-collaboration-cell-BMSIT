import type { GoogleSheetsAdapter, GoogleSheetsQrAdapter, GoogleSheetQrRecord, QrType } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsQrConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_QR_REGISTRY!A:G'
}

const DEFAULT_RANGE = 'GCC_QR_REGISTRY!A:G';
const EXPECTED_COLUMNS = [
  'qr_id',
  'event_id',
  'qr_type',
  'target_url',
  'status',
  'created_at',
  'updated_at'
];

const VALID_QR_TYPES: QrType[] = ['REGISTRATION', 'ATTENDANCE', 'FEEDBACK'];

export class GoogleSheetsQrService implements GoogleSheetsQrAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsQrConfig
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

  async getQrRecords(): Promise<GoogleSheetQrRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row.qr_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing qr_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      if (row.qr_type && !VALID_QR_TYPES.includes(row.qr_type as QrType)) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Invalid qr_type '${String(row.qr_type)}'`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetQrRecord;
    });
  }

  async appendQrRecord(record: GoogleSheetQrRecord): Promise<void> {
    if (!record.qr_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append QR record without qr_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    if (!VALID_QR_TYPES.includes(record.qr_type as QrType)) {
      throw new GoogleAdapterError(
        `Mapping error: Invalid qr_type '${String(record.qr_type)}'`, 
        "MAPPING_ERROR", 
        "sheets"
      );
    }

    const values = EXPECTED_COLUMNS.map(col => record[col as keyof GoogleSheetQrRecord] || "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }

  async getQrRecordById(qrId: string): Promise<GoogleSheetQrRecord | null> {
    if (!qrId) {
      throw new GoogleAdapterError("Missing qrId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const records = await this.getQrRecords();
    const match = records.find(r => r.qr_id === qrId);
    
    return match ?? null;
  }
}
