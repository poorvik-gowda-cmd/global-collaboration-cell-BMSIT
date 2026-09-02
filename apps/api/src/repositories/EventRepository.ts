import type { DatabaseClient } from "@gcc-portal/database";
import type { Event, EventStatus } from "@gcc-portal/contracts";

export interface EventFilter {
  status?: EventStatus | "all";
  createdBy?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  currentUserId?: string;
}

export class EventRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findAll(filter: EventFilter = {}): Promise<{ data: Event[]; total: number }> {
    const { status = "published", createdBy, category, page = 1, pageSize = 20, currentUserId } = filter;
    
    let whereClause = "WHERE 1=1";
    const params: (string | number | boolean | null)[] = [];

    if (status !== "all") {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (createdBy) {
      whereClause += " AND created_by = ?";
      params.push(createdBy);
    }

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    let selectClause = `SELECT *`;
    if (currentUserId) {
      selectClause = `SELECT e.*, EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.user_id = ?) as is_registered`;
      // We must insert the currentUserId at the BEGINNING of the params for the select clause,
      // but wait, SQLite driver expects params in order of `?`. 
      // The `?` for currentUserId is in the SELECT clause, which comes before the WHERE clause.
    }

    const countQuery = `SELECT COUNT(*) as total FROM events e ${whereClause}`;
    const countResult = await this.db.queryFirst<{ total: number }>(countQuery, ...params);
    const total = countResult?.total ?? 0;

    const offset = (page - 1) * pageSize;
    const dataQuery = `${selectClause} FROM events e ${whereClause} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    
    let dataParams = [...params, pageSize, offset];
    if (currentUserId) {
      dataParams = [currentUserId, ...params, pageSize, offset];
    }

    let data = await this.db.query<Event & { is_registered?: number | boolean }>(dataQuery, ...dataParams);
    
    // SQLite EXISTS returns 1 or 0, we need boolean
    if (currentUserId) {
      data = data.map(d => ({ ...d, is_registered: !!d.is_registered }));
    }

    return { data: data, total };
  }

  async findById(id: string, currentUserId?: string): Promise<Event | null> {
    if (currentUserId) {
      const result = await this.db.queryFirst<Event & { is_registered?: number | boolean }>(
        `SELECT e.*, EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.user_id = ?) as is_registered 
         FROM events e WHERE e.id = ?`, 
        currentUserId, id
      );
      if (result) {
        result.is_registered = !!result.is_registered;
      }
      return (result as Event) ?? null;
    }
    return this.db.queryFirst<Event>("SELECT * FROM events WHERE id = ?", id);
  }

  async create(event: Event): Promise<void> {
    await this.db.run(
      `INSERT INTO events (id, title, description, date, location, category, status, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      event.id,
      event.title,
      event.description ?? null,
      event.date,
      event.location ?? null,
      event.category,
      event.status,
      event.created_by,
      event.created_at,
      event.updated_at
    );
  }

  async update(id: string, updates: Partial<Event>): Promise<void> {
    const keys = Object.keys(updates).filter(k => k !== "id" && updates[k as keyof Event] !== undefined);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values: (string | number | boolean | null)[] = keys.map(k => {
      const val = updates[k as keyof Event];
      return val === undefined ? null : (val);
    });
    
    values.push(id);
    
    await this.db.run(`UPDATE events SET ${setClause} WHERE id = ?`, ...values);
  }

  async delete(id: string): Promise<void> {
    await this.db.run("DELETE FROM events WHERE id = ?", id);
  }
}
