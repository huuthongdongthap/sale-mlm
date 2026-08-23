-- PSN (Personal Sales Network) registry table
-- Backs LocalDatabaseAdapter PsnOps (src/db/local-adapter/psn.js)
CREATE TABLE IF NOT EXISTS psn (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id TEXT,
  team_size INTEGER DEFAULT 0,
  target_revenue_vnd INTEGER DEFAULT 0,
  actual_revenue_vnd INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_psn_leader ON psn(leader_id);
