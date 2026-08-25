# Plan: Multi-tenant org isolation

**Date:** 2026-08-24
**Status:** Awaiting approval
**Goal:** Ngăn chặn đọc/xuyên org — mỗi org (công ty) có members/PSNs/leads/orders riêng; Admin không org = system admin nhìn toàn hệ thống.

## Decisions (user-confirmed)

| Question | Decision |
|---|---|
| Tenant model | 1 org → nhiều PSN; org_id trên bảng gốc |
| Migration | Backfill default org ('org-default'); Admin hiện tại giữ org_id NULL = system admin |
| Scope | Full-stack: JWT claim + middleware + adapter queries + Org model + migration + tests |

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | [Schema + migration 0008](phase-01-schema-migration.md) | ⏳ |
| 2 | [Org model + JWT claim](phase-02-org-model-jwt.md) | ⏳ |
| 3 | [Middleware requireOrg + scoping helper](phase-03-middleware-org-scoping.md) | ⏳ |
| 4 | [Adapter + handlers isolation](phase-04-adapter-handler-isolation.md) | ⏳ |
| 5 | [Tests + full suite green](phase-05-tests.md) | ⏳ |

## Key design

- **org_id columns:** `members`, `psn`, `leads`, `orders` (root entities). Derived tables (`habits`, `kpi_rollups`, `training_*`, `referrals`, `onboarding_sessions`, `alerts_log`, `audit_trail`, `psn_health_history`) scope transitively qua member_id/psn_id — không có đường đọc cross-org trực tiếp.
- **System admin:** member role `Admin` với `org_id IS NULL` → JWT orgId null → middleware bỏ qua org filter.
- **JWT:** payload thêm `orgId`; MEMBERS_DB env format hỗ trợ `org_id` (mặc định org-default).
- **Isolation:** helper `scopeOrg(filters, req)` inject org_id vào filter objects; mọi handler member/psn/lead/order + analytics đọc qua helper.
- **Local adapter** (SQLite) áp migration từ `migrations/` tự động theo filename (index.js:69-76) — migration 0008 tự chạy.

## Success criteria

1. Member org A → list/get data org B = rỗng/403.
2. PSN/lead/order cùng quy tắc.
3. System admin (role Admin, orgId null) thấy toàn bộ.
4. Backfill không mất dữ liệu — 231 tests hiện tại + suite mới đều xanh.

## Dependencies

- `migrations/0001_initial_schema.sql`, `0004_funnel_tables.sql`, `0005_psn_table.sql` — schema hiện tại
- `src/db/local-adapter/{members,psn,leads,orders,index}.js` — nơi inject org_id
- `src/db/adapter.js` — mirror D1
- `src/auth/jwt.js`, `src/api/auth.js` — JWT claim
- `src/middleware/requireRole.js` — requireOrg + scopeOrg
