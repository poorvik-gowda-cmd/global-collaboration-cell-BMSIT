import type { DatabaseClient } from "@gcc-portal/database";
import type { UserIdentity } from "@gcc-portal/contracts";

export class UserRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findByEmail(email: string): Promise<UserIdentity | null> {
    const user = await this.db.queryFirst<UserIdentity>(
      "SELECT id, email, display_name as displayName, avatar_url as avatarUrl, role FROM users WHERE email = ?",
      email
    );
    return user;
  }

  async findById(id: string): Promise<UserIdentity | null> {
    const user = await this.db.queryFirst<UserIdentity>(
      "SELECT id, email, display_name as displayName, avatar_url as avatarUrl, role FROM users WHERE id = ?",
      id
    );
    return user;
  }

  async upsertUser(user: { id: string; email: string; displayName: string; avatarUrl: string | null }): Promise<UserIdentity> {
    const now = new Date().toISOString();
    
    const existing = await this.findByEmail(user.email);
    if (existing) {
      await this.db.run(
        "UPDATE users SET display_name = ?, avatar_url = ?, updated_at = ? WHERE email = ?",
        user.displayName, user.avatarUrl, now, user.email
      );
      return { 
        id: existing.id, 
        email: existing.email, 
        displayName: user.displayName, 
        avatarUrl: user.avatarUrl ?? undefined, 
        role: existing.role 
      };
    }

    await this.db.run(
      "INSERT INTO users (id, email, display_name, avatar_url, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      user.id, user.email, user.displayName, user.avatarUrl, "member", now, now
    );
    
    return { 
      id: user.id, 
      email: user.email, 
      displayName: user.displayName, 
      avatarUrl: user.avatarUrl ?? undefined, 
      role: "member" 
    };
  }
}
