import type { GoogleSheetsAdapter, SheetRow } from './interfaces.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from './errors.js';
import type { GoogleAuthClient } from './auth.js';

export class GoogleSheetsService implements GoogleSheetsAdapter {
  constructor(private readonly authClient: GoogleAuthClient) {}

  private async fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    const token = await this.authClient.getAccessToken();
    
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(url, { ...init, headers });
    
    if (response.status === 429) {
      throw new GoogleApiRateLimitError("sheets");
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new GoogleAdapterError(
        `Google Sheets API error (${String(response.status)}): ${String(text)}`,
        "SHEETS_API_ERROR",
        "sheets"
      );
    }
    
    return response;
  }

  async readRows(spreadsheetId: string, range: string): Promise<SheetRow[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
    const response = await this.fetchWithAuth(url);
    
    const data = await response.json() as { values?: string[][] };
    const values = data.values;
    
    if (!values || values.length === 0) {
      return [];
    }
    
    const headers = values[0];
    const rows: SheetRow[] = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowObj: SheetRow = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header) {
          rowObj[header] = row?.[j] ?? "";
        }
      }
      rows.push(rowObj);
    }
    
    return rows;
  }

  async appendRow(spreadsheetId: string, range: string, values: string[]): Promise<void> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    
    await this.fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    });
  }
}
