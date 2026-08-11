-- Funnel OS tables (Wave 1)
-- Run: wrangler d1 migrations apply hive-warfare-db

-- Leads table (L0 capture from quiz/landing)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone_encrypted TEXT,
  source TEXT DEFAULT 'organic',
  funnel_level TEXT DEFAULT 'L0',
  intent_score INTEGER DEFAULT 0,
  quiz_answers TEXT DEFAULT '{}',
  assigned_ctv_id TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_level ON leads(funnel_level, status);
CREATE INDEX IF NOT EXISTS idx_leads_ctv ON leads(assigned_ctv_id);

-- Products table (5-tier funnel)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price_vnd INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('magnet','tripwire','core','downsell','continuity')),
  commission_pct REAL DEFAULT 0,
  margin_pct REAL DEFAULT 0,
  modules_json TEXT DEFAULT '{}',
  benefits_json TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier, is_active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  customer_id TEXT,
  ctv_referrer_id TEXT,
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price_vnd INTEGER NOT NULL,
  total_vnd INTEGER NOT NULL,
  commission_vnd INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_ref TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (customer_id) REFERENCES members(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX IF NOT EXISTS idx_orders_ctv ON orders(ctv_referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_lead ON orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);

-- Order items (for bundle orders)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price_vnd INTEGER NOT NULL,
  subtotal_vnd INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Coach sessions (AI Coach 1:1)
CREATE TABLE IF NOT EXISTS coach_sessions (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  coach_type TEXT DEFAULT 'discovery',
  status TEXT DEFAULT 'active',
  messages_json TEXT DEFAULT '[]',
  gains_json TEXT DEFAULT '{}',
  spin_json TEXT DEFAULT '{}',
  budget_range TEXT,
  need_score INTEGER DEFAULT 0,
  intent_score INTEGER DEFAULT 0,
  next_action TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_lead ON coach_sessions(lead_id, status);

-- Journey events (customer journey milestones)
CREATE TABLE IF NOT EXISTS journey_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_level TEXT,
  to_level TEXT,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
CREATE INDEX IF NOT EXISTS idx_journey_events_lead ON journey_events(lead_id, created_at);
