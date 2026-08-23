-- Seed the products catalog referenced by orders.product_id FK.
-- IDs match the synthetic `tier-N` productIds the orders API generates
-- when no explicit productId is provided (src/api/orders/create.js).
-- tier CHECK constraint uses the funnel stage vocabulary.
INSERT OR IGNORE INTO products (id, name, slug, price_vnd, tier) VALUES ('tier-0', 'Lead Magnet', 'lead-magnet', 0, 'magnet');
INSERT OR IGNORE INTO products (id, name, slug, price_vnd, tier) VALUES ('tier-1', 'Trial', 'trial', 500000, 'tripwire');
INSERT OR IGNORE INTO products (id, name, slug, price_vnd, tier) VALUES ('tier-2', 'Health Active', 'health-active', 1500000, 'core');
INSERT OR IGNORE INTO products (id, name, slug, price_vnd, tier) VALUES ('tier-3', 'Combo', 'combo', 3500000, 'downsell');
INSERT OR IGNORE INTO products (id, name, slug, price_vnd, tier) VALUES ('tier-4', 'CTV Partner', 'ctv-partner', 5000000, 'continuity');
