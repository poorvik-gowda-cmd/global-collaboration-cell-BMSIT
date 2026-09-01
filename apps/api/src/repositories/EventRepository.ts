import type { DatabaseClient } from "@gcc-portal/database";
import type { Event, EventStatus } from "@gcc-portal/contracts";

export interface EventFilter {
  status?: EventStatus | "all";
  createdBy?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export class EventRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findAll(filter: EventFilter = {}): Promise<{ data: Event[]; total: number }> {
    const { status = "published", createdBy, category, page = 1, pageSize = 20 } = filter;
    
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

    const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
    const countResult = await this.db.queryFirst<{ total: number }>(countQuery, ...params);
    const total = countResult?.total ?? 0;

    const offset = (page - 1) * pageSize;
    const dataQuery = `SELECT * FROM events ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    // SQLite uses snake_case, but our Event type expects snake_case for created_by, created_at, updated_at
    // wait, we defined the Zod schema with snake_case: id, title, description, date, location, category, status, created_by, created_at, updated_at
    // so we can just use `SELECT *`.
    const dataParams = [...params, pageSize, offset];
    const data = await this.db.query<Event>(dataQuery, ...dataParams);

    return { data, total };
  }

  async findById(id: string): Promise<Event | null> {
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
