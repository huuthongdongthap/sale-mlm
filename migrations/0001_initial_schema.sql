-- Hive Warfare Academy — D1 Schema v2
-- Run: wrangler d1 migrations apply hive-warfare-db

-- Members table
CREATE TABLE IF NOT EXISTS members (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 phone_encrypted TEXT,
 email_encrypted TEXT,
 password_hash TEXT NOT NULL,
 role TEXT DEFAULT 'Member',
 tier INTEGER DEFAULT 1,
 referrer_id TEXT,
 psn_id TEXT,
 created_at TEXT DEFAULT (datetime('now')),
 updated_at TEXT DEFAULT (datetime('now'))
);

-- Habits table (v2: added action columns)
CREATE TABLE IF NOT EXISTS habits (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id TEXT NOT NULL,
 date TEXT NOT NULL,
 items TEXT NOT NULL,
 score INTEGER DEFAULT 0,
 streak INTEGER DEFAULT 0,
 wake_up_5am INTEGER DEFAULT 0,
 zoom_attend INTEGER DEFAULT 0,
 kaizen_journal INTEGER DEFAULT 0,
 connects INTEGER DEFAULT 0,
 orders INTEGER DEFAULT 0,
 created_at TEXT DEFAULT (datetime('now')),
 FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_habits_member ON habits(member_id, date);

-- KPI rollups table
CREATE TABLE IF NOT EXISTS kpi_rollups (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id TEXT NOT NULL,
 connects_per_day REAL DEFAULT 0,
 followups_per_day REAL DEFAULT 0,
 first_order_14d INTEGER DEFAULT 0,
 habit_score REAL DEFAULT 0,
 window TEXT DEFAULT 'daily',
 status TEXT DEFAULT 'green',
 date TEXT DEFAULT (datetime('now')),
 FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_kpi_member ON kpi_rollups(member_id, date);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id TEXT NOT NULL,
 type TEXT NOT NULL,
 value TEXT NOT NULL,
 updated_at TEXT DEFAULT (datetime('now')),
 FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_training_member ON training_progress(member_id);

-- Training records table (v2: persistent training state)
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
 orders INTEGER DEFAULT 0,
 buddy_id TEXT,
 psn_id TEXT,
 zalo_phone TEXT,
 FOREIGN KEY (member_id) REFERENCES members(id)
);

-- PSN health history
CREATE TABLE IF NOT EXISTS psn_health_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 psn_id TEXT NOT NULL,
 state INTEGER NOT NULL,
 risk_level TEXT DEFAULT 'low',
 team_size INTEGER DEFAULT 0,
 retention_30d REAL DEFAULT 0,
 retention_90d REAL DEFAULT 0,
 revenue_delta REAL DEFAULT 0,
 activity_ratio REAL DEFAULT 0,
 top_risk TEXT,
 recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_psn_history ON psn_health_history(psn_id, recorded_at);

-- Alerts log
CREATE TABLE IF NOT EXISTS alerts_log (
 id TEXT PRIMARY KEY,
 rule_id TEXT,
 metric TEXT,
 severity TEXT DEFAULT 'info',
 evidence TEXT,
 psn_id TEXT,
 acknowledged INTEGER DEFAULT 0,
 acknowledged_by TEXT,
 acknowledged_at TEXT,
 created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_psn ON alerts_log(psn_id, created_at);

-- Audit trail (PDPA compliance)
CREATE TABLE IF NOT EXISTS audit_trail (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 actor_id TEXT,
 action TEXT NOT NULL,
 resource_type TEXT,
 resource_id TEXT,
 details TEXT,
 ip_address TEXT,
 created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_trail(actor_id, created_at);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
 id TEXT PRIMARY KEY,
 referrer_id TEXT NOT NULL,
 referee_id TEXT NOT NULL,
 referee_email TEXT,
 referee_phone_encrypted TEXT,
 tier_purchased INTEGER DEFAULT 1,
 reward_vnd INTEGER DEFAULT 0,
 reward_status TEXT DEFAULT 'pending',
 payment_ref TEXT,
 created_at TEXT DEFAULT (datetime('now')),
 paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- Onboarding sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
 member_id TEXT PRIMARY KEY,
 current_week INTEGER DEFAULT 1,
 current_day INTEGER DEFAULT 1,
 module TEXT DEFAULT 'M1',
 habit_scores TEXT DEFAULT '[]',
 orders_count INTEGER DEFAULT 0,
 status TEXT DEFAULT 'active',
 started_at TEXT DEFAULT (datetime('now')),
 updated_at TEXT DEFAULT (datetime('now'))
);
