-- Add missing columns to habits table
ALTER TABLE habits ADD COLUMN wake_up_5am INTEGER DEFAULT 0;
ALTER TABLE habits ADD COLUMN zoom_attend INTEGER DEFAULT 0;
ALTER TABLE habits ADD COLUMN kaizen_journal INTEGER DEFAULT 0;
ALTER TABLE habits ADD COLUMN connects INTEGER DEFAULT 0;
ALTER TABLE habits ADD COLUMN orders INTEGER DEFAULT 0;

-- Training records table (replaces in-memory trainingRecords{})
CREATE TABLE IF NOT EXISTS training_records (
  member_id TEXT PRIMARY KEY,
  member_name TEXT DEFAULT 'Unknown',
  tier INTEGER DEFAULT 1,
  curriculum_name TEXT,
  duration_weeks INTEGER DEFAULT 4,
  current_module INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  completed_modules TEXT DEFAULT '[]',
  completed_days INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 28,
  started_at TEXT DEFAULT (datetime('now')),
  last_activity TEXT,
  status TEXT DEFAULT 'active',
  habit_scores TEXT DEFAULT '[]',
  kpi_records TEXT DEFAULT '[]',
  orders INTEGER DEFAULT 0,
  buddy_id TEXT,
  psn_id TEXT,
  zalo_phone TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id)
);
CREATE INDEX IF NOT EXISTS idx_training_records_member ON training_records(member_id);

-- Alert rules table (persisted rules for alert engine)
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  trigger_text TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  metric TEXT NOT NULL,
  threshold REAL NOT NULL,
  op TEXT DEFAULT '<',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON alert_rules(metric);

-- Commission ledger (accrual accounting for MLM payouts)
CREATE TABLE IF NOT EXISTS commission_ledger (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  referrer_id TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  amount_vnd REAL NOT NULL,
  period TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_commission_member ON commission_ledger(member_id, period);
CREATE INDEX IF NOT EXISTS idx_commission_status ON commission_ledger(status, period);
