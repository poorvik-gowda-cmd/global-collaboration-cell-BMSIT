import type { DatabaseClient } from "@gcc-portal/database";
import type { Registration, Attendee } from "@gcc-portal/contracts";

export class RegistrationRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(registration: Registration): Promise<boolean> {
    const exists = await this.isUserRegistered(registration.event_id, registration.user_id);
    if (exists) {
      return false;
    }

    try {
      await this.db.run(
        `INSERT INTO registrations (id, event_id, user_id, registered_at) VALUES (?, ?, ?, ?)`,
        registration.id,
        registration.event_id,
        registration.user_id,
        registration.registered_at
      );
      return true;
    } catch (e: unknown) {
      throw e;
    }
  }

  async delete(eventId: string, userId: string): Promise<boolean> {
    await this.db.run(
      `DELETE FROM registrations WHERE event_id = ? AND user_id = ?`,
      eventId,
      userId
    );
    // SQLite doesn't natively return rows affected from run() easily in all wrappers,
    // but we return true indicating no error.
    return true;
  }

  async findAttendeesByEventId(eventId: string): Promise<Attendee[]> {
    return this.db.query<Attendee>(
      `SELECT r.id, u.display_name as displayName, u.avatar_url as avatarUrl, r.registered_at as registeredAt
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?
       ORDER BY r.registered_at ASC`,
      eventId
    );
  }

  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const result = await this.db.queryFirst<{ id: string }>(
      `SELECT id FROM registrations WHERE event_id = ? AND user_id = ?`,
      eventId,
      userId
    );
    return !!result;
  }
}
