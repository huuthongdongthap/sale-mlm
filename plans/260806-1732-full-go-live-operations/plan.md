# Go-Live Plan — Full luồng vận hành
Started: 2026-08-06 17:32 (Asia/Saigon)
Goal: verify create → markPaid → commission end-to-end + bots running

## Fixes applied
- `src/middleware/requireRole.js` — `normalizeRole()` case-insensitive role matching
- `src/api/orders.js` — removed dangling `verify` middleware (was blocking forever)
- `src/api/orders.js` — added `PAYMENT_METHODS` to imports
- `.env` — added `MEMBERS_DB` + `PASSWORD_SALT`

## Verification status
1. Server :3000 healthy ✓
2. Login admin@droppii.com → token ✓
3. POST /api/orders → 201 created ✓
4. POST /api/orders/mark-paid → 200 paid, commission 225,000 VND ✓
5. Onboarding bot start → active session ✓
6. Advance day → W1-D1 completed ✓

## Runtime verified at
2026-08-06 17:38 ICT
