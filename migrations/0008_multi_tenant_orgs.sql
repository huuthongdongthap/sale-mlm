-- Migration 0008: Multi-tenant orgs
-- Adds orgs table and org_id columns to root entities

-- 1. Create orgs table
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed default org (idempotent)
INSERT OR IGNORE INTO orgs (id, name, slug) VALUES ('org-default', 'Default Organization', 'default');

-- 2. Add org_id columns to root tables
-- Note: SQLite ALTER TABLE ADD COLUMN does not support IF NOT EXISTS
-- Migration runner guards via PRAGMA table_info in local-adapter/index.js
-- If column already exists, ALTER will error and be caught by try/catch

ALTER TABLE members ADD COLUMN org_id TEXT;
ALTER TABLE psn ADD COLUMN org_id TEXT;
ALTER TABLE leads ADD COLUMN org_id TEXT;
ALTER TABLE orders ADD COLUMN org_id TEXT;

-- 3. Backfill existing data to default org
-- System admins (role = 'Admin') keep org_id NULL
UPDATE members SET org_id = 'org-default' WHERE org_id IS NULL AND role != 'Admin';
UPDATE psn SET org_id = 'org-default' WHERE org_id IS NULL;
UPDATE leads SET org_id = 'org-default' WHERE org_id IS NULL;
UPDATE orders SET org_id = 'org-default' WHERE org_id IS NULL;

-- 4. Create indexes for org-scoped queries
CREATE INDEX IF NOT EXISTS idx_members_org ON members(org_id);
CREATE INDEX IF NOT EXISTS idx_psn_org ON psn(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(org_id);