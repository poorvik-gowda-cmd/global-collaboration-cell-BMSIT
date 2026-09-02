/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsQrService } from './qr.js';
import type { GoogleSheetsAdapter, GoogleSheetQrRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsQrService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsQrService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsQrService(mockSheetsAdapter, {
      spreadsheetId: 'test-qr-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsQrService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps qr records', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        qr_id: 'QR-001',
        event_id: 'EVT-001',
        qr_type: 'REGISTRATION',
        target_url: 'https://example.com/reg',
        status: 'active',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
        extra_column: 'ignored'
      }
    ]);

    const records = await service.getQrRecords();
    
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      qr_id: 'QR-001',
      event_id: 'EVT-001',
      qr_type: 'REGISTRATION',
      target_url: 'https://example.com/reg',
      status: 'active',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((records[0] as any).extra_column).toBeUndefined();
    
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-qr-id', 'GCC_QR_REGISTRY!A:G');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const records = await service.getQrRecords();
    expect(records).toEqual([]);
  });

  it('throws MAPPING_ERROR if qr_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { event_id: 'No ID Record' }
    ]);

    await expect(service.getQrRecords()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing qr_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('throws MAPPING_ERROR if qr_type is invalid during read', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { qr_id: 'QR-001', qr_type: 'INVALID_TYPE' }
    ]);

    await expect(service.getQrRecords()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Invalid qr_type 'INVALID_TYPE'", "MAPPING_ERROR", "sheets")
    );
  });

  it('allows REGISTRATION, ATTENDANCE, FEEDBACK qr types during read', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { qr_id: 'QR-001', qr_type: 'REGISTRATION' },
      { qr_id: 'QR-002', qr_type: 'ATTENDANCE' },
      { qr_id: 'QR-003', qr_type: 'FEEDBACK' }
    ]);

    const records = await service.getQrRecords();
    expect(records).toHaveLength(3);
    expect(records[0]?.qr_type).toBe('REGISTRATION');
    expect(records[1]?.qr_type).toBe('ATTENDANCE');
    expect(records[2]?.qr_type).toBe('FEEDBACK');
  });

  it('appends a QR record correctly with exact 7-column mapping', async () => {
    const record: GoogleSheetQrRecord = {
      qr_id: 'QR-002',
      event_id: 'EVT-002',
      qr_type: 'ATTENDANCE',
      target_url: 'https://example.com/att',
      status: 'expired',
      created_at: '2025-01-01T12:00:00Z',
      updated_at: '2026-01-01T12:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendQrRecord(record);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-qr-id',
      'GCC_QR_REGISTRY!A:G',
      [
        'QR-002', 'EVT-002', 'ATTENDANCE', 'https://example.com/att',
        'expired', '2025-01-01T12:00:00Z', '2026-01-01T12:00:00Z'
      ]
    );
  });

  it('throws error when appending record without qr_id', async () => {
    const invalidRecord = { event_id: 'Missing ID' } as GoogleSheetQrRecord;
    
    await expect(service.appendQrRecord(invalidRecord)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append QR record without qr_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('throws error when appending record with invalid qr_type', async () => {
    const invalidRecord = { qr_id: 'QR-123', qr_type: 'BAD_TYPE' } as GoogleSheetQrRecord;
    
    await expect(service.appendQrRecord(invalidRecord)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Invalid qr_type 'BAD_TYPE'", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates a QR record by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        qr_id: 'QR-001',
        event_id: 'EVT-001',
        qr_type: 'FEEDBACK',
        target_url: '',
        status: 'active',
        created_at: '',
        updated_at: ''
      },
      {
        qr_id: 'QR-002',
        event_id: 'EVT-002',
        qr_type: 'REGISTRATION',
        target_url: '',
        status: 'draft',
        created_at: '',
        updated_at: ''
      }
    ]);

    const record = await service.getQrRecordById('QR-002');
    
    expect(record).not.toBeNull();
    expect(record?.event_id).toBe('EVT-002');
    expect(record?.status).toBe('draft');
  });

  it('returns null if QR record is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        qr_id: 'QR-001',
        event_id: 'Only doc',
        qr_type: 'REGISTRATION',
        target_url: '',
        status: '',
        created_at: '',
        updated_at: ''
      }
    ]);

    const record = await service.getQrRecordById('QR-MISSING');
    expect(record).toBeNull();
  });
  
  it('throws error when locating record without qr_id provided', async () => {
    await expect(service.getQrRecordById('')).rejects.toThrowError(
      new GoogleAdapterError("Missing qrId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});
