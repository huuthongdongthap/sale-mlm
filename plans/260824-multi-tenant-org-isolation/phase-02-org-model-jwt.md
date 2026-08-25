# Phase 2: Org model + JWT claim

**Priority:** P0 · **Status:** ⏳

## Requirements

- Model `Org` (mới): id/name/slug/createdAt, `static seedIfEmpty(db)` mirror `PSN.seedIfEmpty`, `static async findByMember(member)` hoặc resolve org qua member.orgId.
- JWT payload thêm `orgId` (null cho system admin).
- Login path: DB member (`members` table) → lấy orgId từ row; MEMBERS_DB env member → `member.org_id` nếu có, else `'org-default'` (Admin env-member → null).
- Token cũ (không có orgId claim) vẫn verify được — claim optional.

## Files

- **Tạo:** `src/models/org.js` (<200 lines)
- **Sửa:** `src/auth/jwt.js` (không đổi sign/verify — payload passthrough; chỉ xác nhận claim không bị strip), `src/api/auth.js` (login handler: resolve orgId trước khi sign), `src/models/member.js` (constructor nhận orgId; DB insert/select thêm org_id — phối hợp Phase 4)

## Implementation steps

1. `src/models/org.js`:
   ```js
   class Org {
     constructor(data = {}) { ... } // id, name, slug, createdAt
     static async seedIfEmpty(db) { ... } // create org-default nếu orgs trống
     static async resolve(db, orgId) { ... } // getOrg
   }
   ```

2. `src/api/auth.js` login:
   - Đọc member (env hoặc DB). DB path: row đã có org_id (sau migration) → claim.
   - Env path: `member.org_id || (role === 'Admin' ? null : 'org-default')`.
   - `jwt.sign({ id, email, role, name, orgId })`.

3. `src/models/member.js`:
   - Constructor: `this.orgId = data.orgId || data.org_id || null`.
   - toJSON bao gồm orgId.

4. Kiểm tra mọi nơi gọi `jwt.sign` (grep) — chỉ auth.js; các nơi khác (nếu có) cập nhật theo.

## Success criteria

- Login member thường → token có orgId = 'org-default'.
- Login Admin (env, không org_id) → token orgId null.
- Verify token cũ (không orgId) vẫn pass.

## Risk

- MEMBERS_DB có 2 format (array / object-of-objects) — xử lý cả 2 (auth.js đã parse sẵn, chỉ thêm field).
