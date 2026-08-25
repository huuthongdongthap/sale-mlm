# Phase 5: Tests + full suite green

**Priority:** P0 · **Status:** ⏳

## New test suite: `tests/multi-tenant.test.js` (hoặc split theo entity)

1. **Migration/backfill:** org-default tồn tại; members non-Admin → org-default; Admin → org_id NULL.
2. **JWT claim:** login member → `orgId` trong payload; login Admin env → orgId null; verify token cũ không orgId → vẫn pass (trường hợp claim undefined).
3. **Middleware:**
   - `scopeOrg` scoped user → inject org_id; system admin → không inject.
   - `requireOrg` → 403 cho orgId null + role != Admin; pass cho Admin null; pass cho member có orgId.
4. **Adapter isolation (org A vs org B):**
   - Tạo org B member + data; list/get với filter org_id = org A → không thấy.
   - createMember/createLead/createOrder/psn với org_id → insert đúng org.
5. **Handler isolation:** request user org A → response không chứa data org B (qua adapter mock hoặc integration với local DB).
6. **Regression:** toàn bộ 231 tests hiện tại giữ xanh — đặc biệt auth.test, requireRole.test, members/psn/leads/orders handler tests (fixtures thêm org_id).

## Implementation steps

1. Xem test setup hiện tại (nơi khởi tạo LocalDatabaseAdapter + seed) — tái sử dụng.
2. Viết tests theo danh sách trên — mock tối thiểu, dùng real local adapter (theo luật "no mocks/cheats").
3. Chạy: `npx jest` → fix fail → lặp tới 100% xanh.
4. Cập nhật README/docs nếu cần (docs impact: minor).

## Success criteria

- Suite mới pass.
- 231 tests cũ pass.
- Không test nào bị xóa/sửa để "cho qua" (2 STRIKES rule).

## Risk

- Auth tests phụ thuộc MEMBERS_DB fixtures — thêm org_id field cẩn thận, không phá format cũ.
