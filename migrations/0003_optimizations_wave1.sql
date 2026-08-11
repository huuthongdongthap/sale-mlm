-- Wave 1: Low-cost optimizations for revenue proof
-- Migration: 0003_optimizations_wave1

-- Alert rules table already created in 0002_add_columns.sql
-- Seed additional default rules (idempotent)
INSERT OR IGNORE INTO alert_rules (id, trigger_text, action, severity, metric, threshold, op) VALUES
  ('conversion_low', 'Conversion < 15%', 'Notify leader + watchlist', 'red', 'conversionRate', 15, '<'),
  ('lead_drop', 'Leads < 100/week', 'MiniBoost campaign + notify core', 'yellow', 'leadsWeek', 100, '<'),
  ('habit_drop', 'Habit score < 3', 'Assign buddy + schedule 1:1', 'red', 'habitScore', 3, '<'),
  ('psn_weak', 'PSN avg habit < 3', 'Escalate + coaching pack', 'red', 'psnAvgHabit', 3, '<'),
  ('retention_risk', 'Risk = High', 'Immediate 1:1 + ticket', 'critical', 'retentionRisk', 0, '=='),
  ('q2_neglect', 'Q2 tasks < 40%', 'Block time + notify leader', 'red', 'q2Pct', 40, '<');

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup ON rate_limits(identifier, action, created_at);

-- Leaderboard score cache (denormalized for fast ranking)
ALTER TABLE members ADD COLUMN leaderboard_score INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN last_kpi_calc TEXT;
