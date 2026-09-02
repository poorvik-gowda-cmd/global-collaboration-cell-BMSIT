/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsOpportunitiesService } from './opportunities.js';
import type { GoogleSheetsAdapter, GoogleSheetOpportunityRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsOpportunitiesService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsOpportunitiesService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsOpportunitiesService(mockSheetsAdapter, {
      spreadsheetId: 'test-spreadsheet-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsOpportunitiesService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  it('successfully retrieves and maps opportunities', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        opportunity_id: 'OPP-001',
        title: 'Software Engineer Intern',
        organization: 'Google',
        category: 'Internship',
        description: 'Work on cool stuff',
        deadline: '2026-10-01T00:00:00Z',
        application_url: 'https://careers.google.com',
        country: 'USA',
        status: 'open',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-02T10:00:00Z',
        extra_column: 'should be ignored'
      }
    ]);

    const opportunities = await service.getOpportunities();
    
    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).toEqual({
      opportunity_id: 'OPP-001',
      title: 'Software Engineer Intern',
      organization: 'Google',
      category: 'Internship',
      description: 'Work on cool stuff',
      deadline: '2026-10-01T00:00:00Z',
      application_url: 'https://careers.google.com',
      country: 'USA',
      status: 'open',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((opportunities[0] as any).extra_column).toBeUndefined();
    
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'GCC_OPPORTUNITIES!A:K');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const opportunities = await service.getOpportunities();
    expect(opportunities).toEqual([]);
  });

  it('throws MAPPING_ERROR if opportunity_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { title: 'No ID Opportunity' }
    ]);

    await expect(service.getOpportunities()).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing opportunity_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends an opportunity correctly with exact 11-column mapping', async () => {
    const opp: GoogleSheetOpportunityRecord = {
      opportunity_id: 'OPP-002',
      title: 'Data Analyst',
      organization: 'Meta',
      category: 'Full-time',
      description: 'Analyze data',
      deadline: '2026-11-01T00:00:00Z',
      application_url: 'https://metacareers.com',
      country: 'UK',
      status: 'draft',
      created_at: '2026-09-02T12:00:00Z',
      updated_at: '2026-09-02T12:00:00Z'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendOpportunity(opp);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'GCC_OPPORTUNITIES!A:K',
      [
        'OPP-002', 'Data Analyst', 'Meta', 'Full-time', 'Analyze data',
        '2026-11-01T00:00:00Z', 'https://metacareers.com', 'UK', 'draft',
        '2026-09-02T12:00:00Z', '2026-09-02T12:00:00Z'
      ]
    );
  });

  it('throws error when appending opportunity without opportunity_id', async () => {
    const invalidOpp = { title: 'Missing ID' } as GoogleSheetOpportunityRecord;
    
    await expect(service.appendOpportunity(invalidOpp)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append opportunity without opportunity_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates an opportunity by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        opportunity_id: 'OPP-001',
        title: 'First opp',
        organization: 'A',
        category: 'B',
        description: '...',
        deadline: '',
        application_url: '',
        country: '',
        status: 'open',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        opportunity_id: 'OPP-002',
        title: 'Second opp',
        organization: 'B',
        category: 'C',
        description: '...',
        deadline: '',
        application_url: '',
        country: '',
        status: 'closed',
        created_at: '2026-09-01T11:00:00Z',
        updated_at: '2026-09-02T10:00:00Z'
      }
    ]);

    const opp = await service.getOpportunityById('OPP-002');
    
    expect(opp).not.toBeNull();
    expect(opp?.title).toBe('Second opp');
    expect(opp?.status).toBe('closed');
  });

  it('returns null if opportunity is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        opportunity_id: 'OPP-001',
        title: 'Only opp',
        organization: 'A',
        category: 'B',
        description: '...',
        deadline: '',
        application_url: '',
        country: '',
        status: 'open',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      }
    ]);

    const opp = await service.getOpportunityById('OPP-MISSING');
    expect(opp).toBeNull();
  });
  
  it('throws error when locating opportunity without opportunity_id provided', async () => {
    await expect(service.getOpportunityById('')).rejects.toThrowError(
      new GoogleAdapterError("Missing opportunityId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});
