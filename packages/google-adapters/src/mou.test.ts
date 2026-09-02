/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsMouService } from './mou.js';
import type { GoogleSheetsAdapter, GoogleSheetMouRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsMouService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsMouService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsMouService(mockSheetsAdapter, {
      spreadsheetId: 'test-mou-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsMouService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps mou records', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        mou_id: 'MOU-001',
        institution_name: 'MIT',
        country: 'USA',
        collaboration_area: 'CS',
        year: '2026',
        drive_file_id: 'file1',
        drive_url: 'url1',
        access_level: 'internal',
        status: 'active',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
        extra_column: 'ignored'
      }
    ]);

    const records = await service.getMouRecords();
    
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      mou_id: 'MOU-001',
      institution_name: 'MIT',
      country: 'USA',
      collaboration_area: 'CS',
      year: '2026',
      drive_file_id: 'file1',
      drive_url: 'url1',
      access_level: 'internal',
      status: 'active',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((records[0] as any).extra_column).toBeUndefined();
    
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-mou-id', 'GCC_MOU_METADATA!A:K');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const records = await service.getMouRecords();
    expect(records).toEqual([]);
  });

  it('throws MAPPING_ERROR if mou_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { institution_name: 'No ID Record' }
    ]);

    await expect(service.getMouRecords()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing mou_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends an MOU record correctly with exact 11-column mapping', async () => {
    const record: GoogleSheetMouRecord = {
      mou_id: 'MOU-002',
      institution_name: 'Oxford',
      country: 'UK',
      collaboration_area: 'Physics',
      year: '2025',
      drive_file_id: 'file2',
      drive_url: 'url2',
      access_level: 'public',
      status: 'expired',
      created_at: '2025-01-01T12:00:00Z',
      updated_at: '2026-01-01T12:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendMouRecord(record);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-mou-id',
      'GCC_MOU_METADATA!A:K',
      [
        'MOU-002', 'Oxford', 'UK', 'Physics', '2025',
        'file2', 'url2', 'public', 'expired',
        '2025-01-01T12:00:00Z', '2026-01-01T12:00:00Z'
      ]
    );
  });

  it('throws error when appending record without mou_id', async () => {
    const invalidRecord = { institution_name: 'Missing ID' } as GoogleSheetMouRecord;
    
    await expect(service.appendMouRecord(invalidRecord)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append MOU record without mou_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates an MOU record by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        mou_id: 'MOU-001',
        institution_name: 'MIT',
        country: 'USA',
        collaboration_area: 'Tech',
        year: '2026',
        drive_file_id: '',
        drive_url: '',
        access_level: 'internal',
        status: 'active',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        mou_id: 'MOU-002',
        institution_name: 'Stanford',
        country: 'USA',
        collaboration_area: 'Tech',
        year: '2026',
        drive_file_id: '',
        drive_url: '',
        access_level: 'public',
        status: 'draft',
        created_at: '2026-09-01T11:00:00Z',
        updated_at: '2026-09-02T10:00:00Z'
      }
    ]);

    const record = await service.getMouRecordById('MOU-002');
    
    expect(record).not.toBeNull();
    expect(record?.institution_name).toBe('Stanford');
    expect(record?.status).toBe('draft');
  });

  it('returns null if MOU record is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        mou_id: 'MOU-001',
        institution_name: 'Only doc',
        country: '',
        collaboration_area: '',
        year: '',
        drive_file_id: '',
        drive_url: '',
        access_level: '',
        status: '',
        created_at: '',
        updated_at: ''
      }
    ]);

    const record = await service.getMouRecordById('MOU-MISSING');
    expect(record).toBeNull();
  });
  
  it('throws error when locating record without mou_id provided', async () => {
    await expect(service.getMouRecordById('')).rejects.toThrowError(
      new GoogleAdapterError("Missing mouId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});
