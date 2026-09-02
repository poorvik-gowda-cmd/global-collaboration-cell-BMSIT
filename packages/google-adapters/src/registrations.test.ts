/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetsRegistrationsService } from './registrations.js';
import type { GoogleSheetsAdapter, GoogleSheetRegistrationRecord } from './interfaces.js';
import { GoogleAdapterError } from './errors.js';

describe('GoogleSheetsRegistrationsService', () => {
  let mockSheetsAdapter: GoogleSheetsAdapter;
  let service: GoogleSheetsRegistrationsService;

  beforeEach(() => {
    mockSheetsAdapter = {
      readRows: vi.fn(),
      appendRow: vi.fn(),
    };
    
    service = new GoogleSheetsRegistrationsService(mockSheetsAdapter, {
      spreadsheetId: 'test-spreadsheet-id'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws config error if spreadsheetId is missing', () => {
    expect(() => new GoogleSheetsRegistrationsService(mockSheetsAdapter, { spreadsheetId: '' }))
      .toThrow(GoogleAdapterError);
  });

  describe('Sheet Naming Validation', () => {
    it('throws error for malformed event ID', async () => {
      await expect(service.getRegistrations('MALFORMED-ID')).rejects.toThrowError(
        new GoogleAdapterError("Invalid event ID format: MALFORMED-ID. Expected format: EVENT-YYYY-NNN", "CONFIG_ERROR", "sheets")
      );
    });

    it('throws error for empty event ID', async () => {
      await expect(service.getRegistrations('')).rejects.toThrowError(
        new GoogleAdapterError("Invalid event_id provided for sheet naming", "CONFIG_ERROR", "sheets")
      );
    });

    it('throws error for whitespace event ID', async () => {
      await expect(service.getRegistrations('   ')).rejects.toThrowError(
        new GoogleAdapterError("Invalid event_id provided for sheet naming", "CONFIG_ERROR", "sheets")
      );
    });

    it('accepts valid event ID and targets correct sheet', async () => {
      vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
      await service.getRegistrations('EVENT-2027-042');
      expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'EVENT-2027-042_REGISTRATIONS!A:K');
    });

    it('accepts valid lowercase event ID and sanitizes correctly', async () => {
      vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
      await service.getRegistrations('event-2027-042');
      expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'EVENT-2027-042_REGISTRATIONS!A:K');
    });
  });

  it('successfully retrieves and maps registrations for an event', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        registration_id: 'REG-2026-001-0001',
        event_id: 'EVENT-2026-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        college: 'BMSIT',
        department: 'CSE',
        year: '3',
        custom_fields: '{}',
        registered_at: '2026-09-02T10:00:00Z',
        status: 'confirmed',
        extra_column: 'should be ignored'
      }
    ]);

    const registrations = await service.getRegistrations('EVENT-2026-001');
    
    expect(registrations).toHaveLength(1);
    expect(registrations[0]).toEqual({
      registration_id: 'REG-2026-001-0001',
      event_id: 'EVENT-2026-001',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      college: 'BMSIT',
      department: 'CSE',
      year: '3',
      custom_fields: '{}',
      registered_at: '2026-09-02T10:00:00Z',
      status: 'confirmed'
    });
    // Ensure extra_column is ignored
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    expect((registrations[0] as any).extra_column).toBeUndefined();
    // Verify correct sheet name/range was targeted
    expect(vi.mocked(mockSheetsAdapter.readRows)).toHaveBeenCalledWith('test-spreadsheet-id', 'EVENT-2026-001_REGISTRATIONS!A:K');
  });

  it('handles empty sheet', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([]);
    const registrations = await service.getRegistrations('EVENT-2026-001');
    expect(registrations).toEqual([]);
  });

  it('throws MAPPING_ERROR if registration_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { full_name: 'No ID User' }
    ]);

    await expect(service.getRegistrations('EVENT-2026-001')).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing registration_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('throws MAPPING_ERROR if event_id is missing', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      { registration_id: 'REG-1', full_name: 'No Event ID User' }
    ]);

    await expect(service.getRegistrations('EVENT-2026-001')).rejects.toThrowError(
      new GoogleAdapterError("Mapping error at row 2: Missing event_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('appends a registration correctly', async () => {
    const registration: GoogleSheetRegistrationRecord = {
      registration_id: 'REG-2026-001-0001',
      event_id: 'EVENT-2026-001',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      college: 'BMSIT',
      department: 'CSE',
      year: '3',
      custom_fields: '{}',
      registered_at: '2026-09-02T10:00:00Z',
      status: 'confirmed'
    };

    vi.mocked(mockSheetsAdapter.appendRow).mockResolvedValue();

    await service.appendRegistration(registration);

    expect(vi.mocked(mockSheetsAdapter.appendRow)).toHaveBeenCalledWith(
      'test-spreadsheet-id',
      'EVENT-2026-001_REGISTRATIONS!A:K',
      [
        'REG-2026-001-0001', 'EVENT-2026-001', 'John Doe', 'john@example.com', '1234567890',
        'BMSIT', 'CSE', '3', '{}', '2026-09-02T10:00:00Z', 'confirmed'
      ]
    );
  });

  it('throws error when appending registration without registration_id', async () => {
    const invalidReg = { full_name: 'Missing ID' } as GoogleSheetRegistrationRecord;
    
    await expect(service.appendRegistration(invalidReg)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append registration without registration_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('throws error when appending registration without event_id', async () => {
    const invalidReg = { registration_id: 'REG-1' } as GoogleSheetRegistrationRecord;
    
    await expect(service.appendRegistration(invalidReg)).rejects.toThrowError(
      new GoogleAdapterError("Mapping error: Cannot append registration without event_id", "MAPPING_ERROR", "sheets")
    );
  });

  it('successfully locates a registration by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        registration_id: 'REG-2026-001-0001',
        event_id: 'EVENT-2026-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        college: 'BMSIT',
        department: 'CSE',
        year: '3',
        custom_fields: '{}',
        registered_at: '2026-09-02T10:00:00Z',
        status: 'confirmed'
      },
      {
        registration_id: 'REG-2026-001-0002',
        event_id: 'EVENT-2026-001',
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        college: 'BMSIT',
        department: 'ISE',
        year: '2',
        custom_fields: '{}',
        registered_at: '2026-09-02T11:00:00Z',
        status: 'confirmed'
      }
    ]);

    const registration = await service.getRegistrationById('EVENT-2026-001', 'REG-2026-001-0002');
    
    expect(registration).not.toBeNull();
    expect(registration?.full_name).toBe('Jane Doe');
    expect(registration?.department).toBe('ISE');
  });

  it('returns null if registration is not found by id', async () => {
    vi.mocked(mockSheetsAdapter.readRows).mockResolvedValue([
      {
        registration_id: 'REG-2026-001-0001',
        event_id: 'EVENT-2026-001',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        college: 'BMSIT',
        department: 'CSE',
        year: '3',
        custom_fields: '{}',
        registered_at: '2026-09-02T10:00:00Z',
        status: 'confirmed'
      }
    ]);

    const registration = await service.getRegistrationById('EVENT-2026-001', 'REG-MISSING');
    expect(registration).toBeNull();
  });
  
  it('throws error when locating registration without registration_id', async () => {
    await expect(service.getRegistrationById('EVENT-2026-001', '')).rejects.toThrowError(
      new GoogleAdapterError("Missing registrationId for lookup", "CONFIG_ERROR", "sheets")
    );
  });
});
