# Go-Live Plan — Full luồng vận hành
Started: 2026-08-03 20:54 (Asia/Saigon)
Goal: verify create → markPaid → commission end-to-end.

## Current blockers / evidence
- `/api/orders` route call hangs; `/health` responds fine (server can handle requests).
- Model-layer validation already passed: `createOrder` + `markPaid` work out of process.
- Auth/login path works: login call succeeded earlier.
- orders.js role strings already normalized to canonical Admin/Core Leader/PSN Leader/Member.

## Next actions
1) Finish orders route fix in task #5 (Fix orders route hang).
2) Run live server E2E: login → POST `/api/orders` → POST `/api/orders/mark-paid`.
3) Record final status / unresolved questions here.
