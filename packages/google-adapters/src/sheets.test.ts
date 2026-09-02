import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsService } from '../src/sheets.js';
import { GoogleAuthClient } from '../src/auth.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from '../src/errors.js';

describe('GoogleSheetsService', () => {
  let mockAuthClient: GoogleAuthClient;
  let service: GoogleSheetsService;

  beforeEach(() => {
    mockAuthClient = {
      getAccessToken: vi.fn().mockResolvedValue('mock-token'),
    } as unknown as GoogleAuthClient;
    
    service = new GoogleSheetsService(mockAuthClient);
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads rows correctly', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        values: [
          ["id", "name"],
          ["1", "Alice"],
          ["2", "Bob"]
        ]
      }),
    } as Response);

    const rows = await service.readRows('sheet-id', 'Sheet1!A1:B3');
    expect(rows).toEqual([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" }
    ]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('values/Sheet1!A1%3AB3'),
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
  });

  it('handles empty sheet data', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const rows = await service.readRows('sheet-id', 'Sheet1!A1:B3');
    expect(rows).toEqual([]);
  });

  it('appends a row correctly', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
    } as Response);

    await service.appendRow('sheet-id', 'Sheet1!A1:B3', ['3', 'Charlie']);
    
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(':append?valueInputOption=USER_ENTERED'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ values: [['3', 'Charlie']] }),
      })
    );
  });

  it('throws GoogleApiRateLimitError on 429', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    await expect(service.readRows('sheet-id', 'A1')).rejects.toThrow(GoogleApiRateLimitError);
  });

  it('throws GoogleAdapterError on other API errors', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response);

    await expect(service.readRows('sheet-id', 'A1')).rejects.toThrow(GoogleAdapterError);
  });
});
