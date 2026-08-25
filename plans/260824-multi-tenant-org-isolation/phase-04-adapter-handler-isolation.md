# Phase 4: Adapter + handlers isolation

**Priority:** P0 · **Status:** ⏳

## Requirements

Local adapter (`src/db/local-adapter/`) + D1 mirror (`src/db/adapter.js`):

| Module | Thay đổi |
|---|---|
| `members.js` | listMembers: filter `org_id`; getMember: trả org_id (SELECT thêm cột); createMember: chấp nhận + insert org_id |
| `psn.js` | listPSNs: filter `org_id`; createPSN: org_id; getPSN: trả org_id |
| `leads.js` | listLeads: filter `org_id`; createLead: org_id; getLead trả org_id |
| `orders.js` | listOrders: filter `org_id`; createOrder: org_id |
| `adapter.js` (D1) | Mirror các method tương ứng |

Handlers — inject `scopeOrg(filters, req)` ở điểm đọc:

- `src/api/members/*`, `src/api/psn/*`, `src/api/leads/*`, `src/api/orders/*` — list/get/create.
- `src/analytics/psnHealth.js`, `src/analytics/alertEngine.js` — đọc qua psn_id/psn_health; nếu input từ PSN đã scoped thì transitive-safe; nếu có đường đọc trực tiếp (listPSNHealth, listAlerts) → thêm org filter.
- `src/api/analytics-funnel/*` — đọc orders/leads: thêm org filter vào funnel queries.

## Implementation steps

1. Grep toàn bộ handler gọi adapter: `getMember(`, `listMembers(`, `listPSNs(`, `listLeads(`, `listOrders(` — liệt kê chính xác call sites.
2. Sửa từng adapter module theo bảng trên (giữ signature backward-compatible: org filter là optional filter key, không đổi positional args trừ khi cần).
3. Handler: chuyển filters qua `scopeOrg(filters, req)`.
4. Create path: `scopeOrg` áp cho INSERT (bắt buộc org_id = org của user, không cho client tự khai báo).
5. `src/api/orders/handlers.js:99` — xóa debug console.log (đã biết từ trước, làm trong phase này).

## Success criteria

- List/get/create của 4 entity đều org-scoped.
- Funnel analytics đọc trong org.
- Không đổi public API contract (request/response shape giữ nguyên, chỉ thêm trường orgId khi hợp lý).

## Risk

- Funnel queries (analytics-funnel) có thể aggregate theo member — check kỹ từng query, org filter đặt ở bảng root (orders/leads).
- `adapter.js` (D1) không chạy trong test local — chỉ mirror, verify bằng compile/logic review.
