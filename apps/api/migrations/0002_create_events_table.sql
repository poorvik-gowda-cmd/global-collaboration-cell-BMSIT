-- Migration number: 0002 	 2026-09-01T20:20:00.000Z

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    location TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
