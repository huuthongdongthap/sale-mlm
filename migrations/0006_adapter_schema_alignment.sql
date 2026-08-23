-- Align local schema with adapter code expectations.
-- LocalDatabaseAdapter members ops SELECT/INSERT a `status` column,
-- leads ops INSERT email_encrypted / phone_encrypted / notes_encrypted /
-- lead_stage / psn_id columns, and orders ops INSERT member_id /
-- product_name / product_tier / payment_status / payment_reference /
-- updated_at columns that earlier migrations never created.
ALTER TABLE members ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE leads ADD COLUMN email_encrypted TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN notes_encrypted TEXT;
ALTER TABLE leads ADD COLUMN lead_stage TEXT DEFAULT 'lead_magnet';
ALTER TABLE leads ADD COLUMN psn_id TEXT;
ALTER TABLE orders ADD COLUMN member_id TEXT;
ALTER TABLE orders ADD COLUMN product_name TEXT;
ALTER TABLE orders ADD COLUMN product_tier INTEGER;
ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN payment_reference TEXT;
ALTER TABLE orders ADD COLUMN updated_at TEXT;
