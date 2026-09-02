import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsEventsService } from './events.js';
import type { GoogleSheetsAdapter, GoogleSheetEventRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsEventsService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsEventsService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsEventsService(mockSheetsAdapter, {
      spreadsheetId: 'test-spreadsheet-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsEventsService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps events', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        event_id: '123',
        title: 'Test Event',
        short_description: 'Short',
        full_description: 'Full',
        category: 'Tech',
        venue: 'Room 1',
        start_datetime: '2026-09-02T10:00:00Z',
        end_datetime: '2026-09-02T12:00:00Z',
        registration_status: 'open',
        event_status: 'published',
        registration_capacity: '100',
        registration_count: '10',
        banner_url: 'http://example.com/banner.png',
        created_by: 'admin',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z',
        extra_column: 'should be ignored'
      }
    ]);

    const events = await service.getEvents();
    
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      event_id: '123',
      title: 'Test Event',
      short_description: 'Short',
      full_description: 'Full',
      category: 'Tech',
      venue: 'Room 1',
      start_datetime: '2026-09-02T10:00:00Z',
      end_datetime: '2026-09-02T12:00:00Z',
      registration_status: 'open',
      event_status: 'published',
      registration_capacity: '100',
      registration_count: '10',
      banner_url: 'http://example.com/banner.png',
      created_by: 'admin',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z'
    });
    // Ensure extra_column is ignored
    expect((events[0] as any).extra_column).toBeUndefined();
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const events = await service.getEvents();
    expect(events).toEqual([]);
  });

  it('throws MAPPING_ERROR if event_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { title: 'No ID Event' }
    ]);

    await expect(service.getEvents()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing event_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends an event correctly', async () => {
    const event: GoogleSheetEventRecord = {
      event_id: '123',
      title: 'Test Event',
      short_description: 'Short',
      full_description: 'Full',
      category: 'Tech',
      venue: 'Room 1',
      start_datetime: '2026-09-02T10:00:00Z',
      end_datetime: '2026-09-02T12:00:00Z',
      registration_status: 'open',
      event_status: 'published',
      registration_capacity: '100',
      registration_count: '10',
      banner_url: 'http://example.com/banner.png',
      created_by: 'admin',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendEvent(event);

    expect(mockSheetsAdapter.appendRow).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'GCC_EVENTS!A:P',
      [
        '123', 'Test Event', 'Short', 'Full', 'Tech', 'Room 1', 
        '2026-09-02T10:00:00Z', '2026-09-02T12:00:00Z', 'open', 'published', 
        '100', '10', 'http://example.com/banner.png', 'admin', 
        '2026-09-01T10:00:00Z', '2026-09-01T10:00:00Z'
      ]
    );
  });

  it('throws error when appending event without event_id', async () => {
    const invalidEvent = { title: 'Missing ID' } as GoogleSheetEventRecord;
    
    await expect(service.appendEvent(invalidEvent)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append event without event_id", "MAPPING_ERROR", "sheets")
    );
  });
});
