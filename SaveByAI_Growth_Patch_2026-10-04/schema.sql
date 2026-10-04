CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  event_name TEXT NOT NULL,
  anon_id TEXT,
  path TEXT,
  props_json TEXT,
  country TEXT,
  referrer_host TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);

CREATE TABLE IF NOT EXISTS leads (
  email TEXT PRIMARY KEY,
  interest TEXT,
  source TEXT,
  country TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
