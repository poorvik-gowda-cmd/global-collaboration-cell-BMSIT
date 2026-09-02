/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsResearchService } from './research.js';
import type { GoogleSheetsAdapter, GoogleSheetResearchRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsResearchService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsResearchService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsResearchService(mockSheetsAdapter, {
      spreadsheetId: 'test-spreadsheet-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsResearchService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps research records', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        research_id: 'RES-001',
        title: 'AI Ethics',
        description: 'Study on AI alignment',
        category: 'AI',
        drive_file_id: '1xyz',
        drive_url: 'https://docs.google.com/1xyz',
        owner: 'user_1',
        department: 'CS',
        status: 'published',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
        extra_column: 'should be ignored'
      }
    ]);

    const records = await service.getResearchRecords();
    
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      research_id: 'RES-001',
      title: 'AI Ethics',
      description: 'Study on AI alignment',
      category: 'AI',
      drive_file_id: '1xyz',
      drive_url: 'https://docs.google.com/1xyz',
      owner: 'user_1',
      department: 'CS',
      status: 'published',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((records[0] as any).extra_column).toBeUndefined();
    
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'GCC_RESEARCH_METADATA!A:K');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const records = await service.getResearchRecords();
    expect(records).toEqual([]);
  });

  it('throws MAPPING_ERROR if research_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { title: 'No ID Record' }
    ]);

    await expect(service.getResearchRecords()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing research_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends a research record correctly with exact 11-column mapping', async () => {
    const record: GoogleSheetResearchRecord = {
      research_id: 'RES-002',
      title: 'Quantum Computing',
      description: 'Research on quantum algorithms',
      category: 'Physics',
      drive_file_id: '2abc',
      drive_url: 'https://docs.google.com/2abc',
      owner: 'user_2',
      department: 'Physics',
      status: 'draft',
      created_at: '2026-09-02T12:00:00Z',
      updated_at: '2026-09-02T12:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendResearchRecord(record);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'GCC_RESEARCH_METADATA!A:K',
      [
        'RES-002', 'Quantum Computing', 'Research on quantum algorithms', 'Physics', '2abc',
        'https://docs.google.com/2abc', 'user_2', 'Physics', 'draft',
        '2026-09-02T12:00:00Z', '2026-09-02T12:00:00Z'
      ]
    );
  });

  it('throws error when appending record without research_id', async () => {
    const invalidRecord = { title: 'Missing ID' } as GoogleSheetResearchRecord;
    
    await expect(service.appendResearchRecord(invalidRecord)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append research record without research_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates a research record by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        research_id: 'RES-001',
        title: 'First doc',
        description: '...',
        category: 'Tech',
        drive_file_id: '',
        drive_url: '',
        owner: 'user_1',
        department: '',
        status: 'draft',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        research_id: 'RES-002',
        title: 'Second doc',
        description: '...',
        category: 'Science',
        drive_file_id: '',
        drive_url: '',
        owner: 'user_2',
        department: '',
        status: 'published',
        created_at: '2026-09-01T11:00:00Z',
        updated_at: '2026-09-02T10:00:00Z'
      }
    ]);

    const record = await service.getResearchRecordById('RES-002');
    
    expect(record).not.toBeNull();
    expect(record?.title).toBe('Second doc');
    expect(record?.status).toBe('published');
  });

  it('returns null if research record is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        research_id: 'RES-001',
        title: 'Only doc',
        description: '...',
        category: 'Tech',
        drive_file_id: '',
        drive_url: '',
        owner: 'user_1',
        department: '',
        status: 'published',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      }
    ]);

    const record = await service.getResearchRecordById('RES-MISSING');
    expect(record).toBeNull();
  });
  
  it('throws error when locating record without research_id provided', async () => {
    await expect(service.getResearchRecordById('')).rejects.toThrowError(
      new GoogleAdapterError("Missing researchId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});
