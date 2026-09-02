/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleDriveService } from './drive.js';
import { GoogleAuthClient } from './auth.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from './errors.js';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GoogleDriveService', () => {
  let mockAuthClient: GoogleAuthClient;
  let service: GoogleDriveService;

  beforeEach(() => {
    mockFetch.mockReset();
    mockAuthClient = {
      getAccessToken: vi.fn().mockResolvedValue('test-token')
    } as unknown as GoogleAuthClient;
    
    service = new GoogleDriveService(mockAuthClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully retrieves and maps file metadata from a folder', async () => {
    const mockFiles = [
      {
        id: 'file-123',
        name: 'test.pdf',
        mimeType: 'application/pdf',
        webViewLink: 'https://example.com/view/123',
        createdTime: '2026-09-02T10:00:00Z'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ files: mockFiles })
    } as unknown as Response);

    const files = await service.listFiles('folder-456');
    
    expect(files).toHaveLength(1);
    expect(files[0]).toEqual(mockFiles[0]);
    
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(callUrl).toContain('https://www.googleapis.com/drive/v3/files?');
    expect(callUrl).toContain('q=%22folder-456%22+in+parents+and+trashed+%3D+false');
    
    const callInit = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(callInit.headers);
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('handles pagination correctly', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          files: [{ id: 'file-1' }],
          nextPageToken: 'token-abc'
        })
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          files: [{ id: 'file-2' }]
        })
      } as unknown as Response);

    const files = await service.listFiles('folder-456');
    
    expect(files).toHaveLength(2);
    expect(files[0]?.id).toBe('file-1');
    expect(files[1]?.id).toBe('file-2');
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const secondCallUrl = mockFetch.mock.calls[1]?.[0] as string;
    expect(secondCallUrl).toContain('pageToken=token-abc');
  });

  it('successfully retrieves a single file by id', async () => {
    const mockFile = {
      id: 'file-123',
      name: 'test.pdf',
      mimeType: 'application/pdf',
      webViewLink: 'https://example.com/view/123',
      createdTime: '2026-09-02T10:00:00Z'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockFile)
    } as unknown as Response);

    const file = await service.getFile('file-123');
    
    expect(file).toEqual(mockFile);
    
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(callUrl).toBe('https://www.googleapis.com/drive/v3/files/file-123?fields=id%2C+name%2C+mimeType%2C+webViewLink%2C+createdTime');
  });

  it('throws error for empty/invalid folderId', async () => {
    await expect(service.listFiles('')).rejects.toThrowError(
      new GoogleAdapterError("Invalid folderId provided", "VALIDATION_ERROR", "drive")
    );
    await expect(service.listFiles('   ')).rejects.toThrowError(
      new GoogleAdapterError("Invalid folderId provided", "VALIDATION_ERROR", "drive")
    );
  });

  it('throws error for empty/invalid fileId', async () => {
    await expect(service.getFile('')).rejects.toThrowError(
      new GoogleAdapterError("Invalid fileId provided", "VALIDATION_ERROR", "drive")
    );
    await expect(service.getFile('   ')).rejects.toThrowError(
      new GoogleAdapterError("Invalid fileId provided", "VALIDATION_ERROR", "drive")
    );
  });

  it('throws GoogleApiRateLimitError on 429 status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429
    } as unknown as Response);

    await expect(service.getFile('file-123')).rejects.toThrowError(GoogleApiRateLimitError);
  });

  it('throws GoogleAdapterError on non-2xx status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: vi.fn().mockResolvedValue('Forbidden')
    } as unknown as Response);

    await expect(service.listFiles('folder-456')).rejects.toThrowError(
      new GoogleAdapterError("Google Drive API error (403): Forbidden", "DRIVE_API_ERROR", "drive")
    );
  });
});
