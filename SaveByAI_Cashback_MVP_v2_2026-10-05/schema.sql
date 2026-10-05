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

CREATE TABLE IF NOT EXISTS cashback_users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cashback_users_email ON cashback_users(email);

CREATE TABLE IF NOT EXISTS cashback_clicks (
  click_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  merchant TEXT NOT NULL,
  network TEXT NOT NULL,
  anon_id TEXT,
  user_id TEXT,
  cashback_label TEXT,
  cashback_rate_bps INTEGER,
  country TEXT,
  referrer_host TEXT
);
CREATE INDEX IF NOT EXISTS idx_cashback_clicks_created_at ON cashback_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_cashback_clicks_merchant ON cashback_clicks(merchant);
CREATE INDEX IF NOT EXISTS idx_cashback_clicks_anon_id ON cashback_clicks(anon_id);
CREATE INDEX IF NOT EXISTS idx_cashback_clicks_user_id ON cashback_clicks(user_id);

CREATE TABLE IF NOT EXISTS cashback_claims (
  claim_id TEXT PRIMARY KEY,
  click_id TEXT,
  user_id TEXT NOT NULL,
  merchant TEXT NOT NULL,
  order_reference TEXT,
  purchase_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cashback_claims_created_at ON cashback_claims(created_at);
CREATE INDEX IF NOT EXISTS idx_cashback_claims_user_id ON cashback_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_claims_click_id ON cashback_claims(click_id);
