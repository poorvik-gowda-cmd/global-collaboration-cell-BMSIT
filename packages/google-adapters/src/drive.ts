import type { GoogleDriveAdapter, DriveFileMetadata } from './interfaces.js';
import { GoogleAdapterError, GoogleApiRateLimitError } from './errors.js';
import type { GoogleAuthClient } from './auth.js';

interface DriveListResponse {
  files?: DriveFileMetadata[];
  nextPageToken?: string;
}

export class GoogleDriveService implements GoogleDriveAdapter {
  constructor(private readonly authClient: GoogleAuthClient) {}

  private async fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    const token = await this.authClient.getAccessToken();
    
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(url, { ...init, headers });
    
    if (response.status === 429) {
      throw new GoogleApiRateLimitError("drive");
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new GoogleAdapterError(
        `Google Drive API error (${String(response.status)}): ${String(text)}`,
        "DRIVE_API_ERROR",
        "drive"
      );
    }
    
    return response;
  }

  async listFiles(folderId: string): Promise<DriveFileMetadata[]> {
    if (!folderId || !folderId.trim()) {
      throw new GoogleAdapterError("Invalid folderId provided", "VALIDATION_ERROR", "drive");
    }

    const allFiles: DriveFileMetadata[] = [];
    let pageToken: string | undefined;

    do {
      const query = `"${folderId}" in parents and trashed = false`;
      const searchParams = new URLSearchParams({
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, createdTime)',
        pageSize: '1000'
      });

      if (pageToken) {
        searchParams.set('pageToken', pageToken);
      }

      const url = `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`;
      const response = await this.fetchWithAuth(url);
      
      const data = await response.json() as DriveListResponse;
      
      if (data.files && data.files.length > 0) {
        allFiles.push(...data.files);
      }
      
      pageToken = data.nextPageToken;
    } while (pageToken);

    return allFiles;
  }

  async getFile(fileId: string): Promise<DriveFileMetadata> {
    if (!fileId || !fileId.trim()) {
      throw new GoogleAdapterError("Invalid fileId provided", "VALIDATION_ERROR", "drive");
    }

    const searchParams = new URLSearchParams({
      fields: 'id, name, mimeType, webViewLink, createdTime'
    });

    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${searchParams.toString()}`;
    const response = await this.fetchWithAuth(url);
    
    const data = await response.json() as DriveFileMetadata;
    return data;
  }
}
