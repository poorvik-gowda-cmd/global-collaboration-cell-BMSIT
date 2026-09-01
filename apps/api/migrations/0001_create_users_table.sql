-- Migration number: 0001 	 2026-09-01T05:50:32.807Z

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('member', 'coordinator', 'admin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
