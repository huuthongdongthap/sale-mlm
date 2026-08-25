# Phase 1: Schema + migration 0008

**Priority:** P0 · **Status:** ⏳

## Requirements

- Table `orgs`: id TEXT PK, name TEXT NOT NULL, slug TEXT, created_at TEXT.
- `ALTER TABLE` thêm `org_id TEXT` vào `members`, `psn`, `leads`, `orders`.
- Backfill: `UPDATE ... SET org_id='org-default' WHERE org_id IS NULL AND role != 'Admin'` (members); `leads`/`orders`/`psn` → org-default (không phân biệt role).
- Admin hiện tại giữ org_id NULL = system admin.
- Index: `idx_members_org(members.org_id)`, `idx_psn_org`, `idx_leads_org`, `idx_orders_org`.

## Files

- **Tạo:** `migrations/0008_multi_tenant_orgs.sql`
- **Sửa:** (none — local adapter tự apply migrations theo filename order)

## Implementation steps

1. Viết `0008_multi_tenant_orgs.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS orgs (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     slug TEXT,
     created_at TEXT DEFAULT (datetime('now'))
   );
   INSERT OR IGNORE INTO orgs (id, name, slug) VALUES ('org-default', 'Default Organization', 'default');
   ALTER TABLE members ADD COLUMN org_id TEXT;   -- x3 cho psn, leads, orders
   UPDATE members SET org_id = 'org-default' WHERE org_id IS NULL AND role != 'Admin';
   UPDATE psn SET org_id = 'org-default' WHERE org_id IS NULL;
   UPDATE leads SET org_id = 'org-default' WHERE org_id IS NULL;
   UPDATE orders SET org_id = 'org-default' WHERE org_id IS NULL;
   CREATE INDEX IF NOT EXISTS idx_members_org ON members(org_id);
   -- + idx_psn_org, idx_leads_org, idx_orders_org
   ```
   Lưu ý: `ALTER TABLE ADD COLUMN` với SQLite fail nếu column đã tồn tại — migration runner hiện tại (index.js:69-76) chạy file 1 lần duy nhất khi DB mới; DB cũ cần xử lý thủ công hoặc check `PRAGMA table_info` — kiểm tra cơ chế runner ở bước 2.

2. Đọc `src/db/local-adapter/index.js` constructor (lines 60-90) — xác nhận cơ chế migration runner (migrations_applied table? hay chạy mọi file mỗi lần?). Nếu chạy mọi file mỗi lần → SQL phải idempotent:
   - `ALTER TABLE ... ADD COLUMN` KHÔNG có IF NOT EXISTS trong SQLite → cần guard bằng `PRAGMA table_info(<table>)` trong code hoặc try/catch.
   - Phương án an toàn: trong `index.js` runner, wrap từng file trong try/catch và bỏ qua lỗi "duplicate column name" — hoặc guard column-tồn-tại bằng PRAGMA trước khi apply.

3. Thêm `org_id` vào danh sách column của các adapter module nếu chúng dùng column list tường minh (members.js:27,31,44,45; leads.js:28,31; psn.js; orders.js) — Phase 4 xử lý chi tiết; Phase 1 chỉ đảm bảo migration áp được.

## Success criteria

- DB mới tạo → `orgs` có row org-default; `members` có cột org_id.
- DB cũ (nếu có) migrate không crash.
- Migration idempotent: chạy 2 lần không lỗi.

## Risk

- **SQLite ALTER non-idempotent** — guard PRAGMA/try-catch bắt buộc.
- D1 (production) cần migration thủ công tương đương — document trong phase file, không tự áp.
