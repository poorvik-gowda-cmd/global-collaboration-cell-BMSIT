import { SignJWT, importPKCS8 } from 'jose';
import type { GoogleServiceAccountConfig } from './interfaces.js';
import { GoogleAuthError } from './errors.js';

export class GoogleAuthClient {
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(
    private readonly config: GoogleServiceAccountConfig,
    private readonly scopes: string[] = ["https://www.googleapis.com/auth/spreadsheets"]
  ) {
    if (!config.clientEmail || !config.privateKey) {
      throw new GoogleAuthError("Missing required service account configuration (clientEmail or privateKey).");
    }
  }

  async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    // Add a 60s buffer for expiration
    if (this.token && this.tokenExpiry > now + 60) {
      return this.token;
    }

    try {
      // 1. Create a JWT
      const privateKeyStr = this.config.privateKey.replace(/\\n/g, '\n');
      const privateKey = await importPKCS8(privateKeyStr, 'RS256');

      const jwt = await new SignJWT({
        iss: this.config.clientEmail,
        sub: this.config.clientEmail,
        aud: "https://oauth2.googleapis.com/token",
        scope: this.scopes.join(" "),
      })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

      // 2. Exchange for access token
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed (${String(response.status)}): ${String(errorText)}`);
      }

      const data = await response.json() as { access_token: string, expires_in: number };
      
      this.token = data.access_token;
      this.tokenExpiry = now + data.expires_in;

      return this.token;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown auth error";
      throw new GoogleAuthError(message);
    }
  }
}
