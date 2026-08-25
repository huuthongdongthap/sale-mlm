# Phase 3: Middleware requireOrg + scoping helper

**Priority:** P0 · **Status:** ⏳

## Requirements

- `requireOrg(req, res, next)`: 401 nếu thiếu/trống JWT; 403 nếu `req.user.orgId` undefined? — **KHÔNG**: orgId null là hợp lệ cho system admin. Quy tắc:
  - Token hợp lệ (requireAuth đã lo) → qua.
  - `req.user.orgId` (string) = scoped; `req.user.orgId === null && role === 'Admin'` = system admin (bypass).
  - Edge: `orgId null` mà role != Admin → 403 (dữ liệu không nhất quán — không cho truy cập cross-org).
- `scopeOrg(filters, req)`: trả `{...filters, org_id: req.user.orgId}` nếu scoped; trả filters nguyên nếu system admin. Dùng được cả query + create path (bảo vệ INSERT).

## Files

- **Sửa:** `src/middleware/requireRole.js` (thêm exports, giữ nguyên requireAuth/requireRole tương thích ngược)

## Implementation steps

1. Thêm vào `requireRole.js`:
   ```js
   function isSystemAdmin(user) {
     return user && user.role === 'Admin' && (user.orgId === null || user.orgId === undefined);
   }
   function requireOrg(req, res, next) {
     if (!req.user) return next(); // requireAuth chạy trước; nếu test gọi trực tiếp, skip
     if (!isSystemAdmin(req.user) && typeof req.user.orgId !== 'string') {
       return res.status(403).json({ error: 'Forbidden: no org scope' });
     }
     next();
   }
   function scopeOrg(filters, req) {
     if (isSystemAdmin(req.user)) return filters;
     return { ...filters, org_id: req.user.orgId };
   }
   ```

2. Mọi route chain quan trọng: `requireAuth, requireOrg` — quyết định áp ở đâu:
   - **Bắt buộc:** routes `/api/members*`, `/api/psn*`, `/api/leads*`, `/api/orders*`, `/api/kpi*` (đọc member data).
   - Gắn trực tiếp vào handler (không sửa router) — ít touchpoint hơn, test trực tiếp dễ hơn.

## Success criteria

- scopeOrg inject đúng org_id khi scoped; không inject khi system admin.
- requireOrg chặn user orgId null + role != Admin.

## Risk

- `req.user` có thể undefined trong test đơn vị — xử lý defensive.
