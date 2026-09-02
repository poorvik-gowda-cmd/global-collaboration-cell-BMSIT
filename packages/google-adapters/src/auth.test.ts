import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAuthClient } from '../src/auth.js';
import { GoogleAuthError } from '../src/errors.js';
import type { GoogleServiceAccountConfig } from '../src/interfaces.js';

class MockSignJWT {
  setProtectedHeader() { return this; }
  setIssuedAt() { return this; }
  setExpirationTime() { return this; }
  async sign() { return "mocked-jwt"; }
}

// Mock jose to avoid needing real RSA keys
vi.mock('jose', () => {
  return {
    importPKCS8: vi.fn().mockResolvedValue({}),
    SignJWT: MockSignJWT,
  };
});

describe('GoogleAuthClient', () => {
  const mockConfig = {
    clientEmail: 'test@example.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
    projectId: 'test-project',
  };

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error if config is missing required fields', () => {
    expect(() => new GoogleAuthClient({} as unknown as GoogleServiceAccountConfig)).toThrow(GoogleAuthError);
  });

  it('successfully authenticates and caches token', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
    } as Response);

    const client = new GoogleAuthClient(mockConfig);
    const token1 = await client.getAccessToken();
    expect(token1).toBe('test-token');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Call again to verify caching
    const token2 = await client.getAccessToken();
    expect(token2).toBe('test-token');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws GoogleAuthError on API failure', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "Invalid grant",
    } as Response);

    const client = new GoogleAuthClient(mockConfig);
    await expect(client.getAccessToken()).rejects.toThrow(GoogleAuthError);
  });
});
