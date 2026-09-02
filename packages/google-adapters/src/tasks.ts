import type { GoogleSheetsAdapter, GoogleSheetsTasksAdapter, GoogleSheetTaskRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

export interface GoogleSheetsTasksConfig {
  spreadsheetId: string;
  range?: string; // Default: 'GCC_TASKS!A:O'
}

const DEFAULT_RANGE = 'GCC_TASKS!A:O';
const EXPECTED_COLUMNS = [
  'task_id',
  'title',
  'description',
  'department',
  'assigned_to_user_id',
  'assigned_to_name',
  'assigned_by',
  'deadline',
  'priority',
  'status',
  'progress_update',
  'latest_update_at',
  'remark',
  'created_at',
  'updated_at'
];

export class GoogleSheetsTasksService implements GoogleSheetsTasksAdapter {
  private range: string;

  constructor(
    private readonly sheetsAdapter: GoogleSheetsAdapter,
    private readonly config: GoogleSheetsTasksConfig
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

  async getTasks(): Promise<GoogleSheetTaskRecord[]> {
    const rows = await this.sheetsAdapter.readRows(this.config.spreadsheetId, this.range);
    
    return rows.map((row, index) => {
      if (!row.task_id) {
        throw new GoogleAdapterError(
          `Mapping error at row ${String(index + 2)}: Missing task_id`, 
          "MAPPING_ERROR", 
          "sheets"
        );
      }

      const record: Record<string, string> = {};
      for (const col of EXPECTED_COLUMNS) {
        record[col] = row[col] ?? "";
      }

      return record as unknown as GoogleSheetTaskRecord;
    });
  }

  async appendTask(task: GoogleSheetTaskRecord): Promise<void> {
    if (!task.task_id) {
       throw new GoogleAdapterError(
         "Mapping error: Cannot append task without task_id", 
         "MAPPING_ERROR", 
         "sheets"
       );
    }

    const values = EXPECTED_COLUMNS.map(col => task[col as keyof GoogleSheetTaskRecord] ?? "");
    
    await this.sheetsAdapter.appendRow(this.config.spreadsheetId, this.range, values);
  }

  async getTaskById(taskId: string): Promise<GoogleSheetTaskRecord | null> {
    if (!taskId) {
      throw new GoogleAdapterError("Missing taskId for lookup", "CONFIG_ERROR", "sheets");
    }
    
    const tasks = await this.getTasks();
    const match = tasks.find(t => t.task_id === taskId);
    
    return match || null;
  }
}
