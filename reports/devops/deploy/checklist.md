# Pre-flight Checklist — Staging Deploy

**Date:** 2026-08-25  
**Target:** `hive-warfare-os-staging.sadec-marketing-hub.workers.dev`  
**Worker:** `hive-warfare-os-staging`  
**Entry Point:** `src/workers/index-native.js` (Hono-native)

---

## ✅ Code Readiness

- [x] All D1 calls properly awaited (`await DB.prepare().bind().first()`, `await DB.prepare().bind().all()`, `await DB.prepare().bind().run()`)
- [x] JWT verification uses explicit `HS256` algorithm (`await verify(token, secret, 'HS256')`)
- [x] PBKDF2 password verification matches Node.js implementation (100,000 iterations, SHA-512, 512-bit)
- [x] Org isolation logic implemented:
  - System admin (Admin + orgId=null) → sees all orgs
  - Non-system admin → scoped to own orgId
- [x] Health endpoints: `/health`, `/ready` (no auth required)
- [x] Auth endpoints: `/auth/login`, `/auth/verify`
- [x] Protected endpoints: `/api/members`, `/api/leads`, `/api/orders` (all with org scoping)

## ✅ Configuration

- [x] `wrangler.toml`: `main = "src/workers/index-native.js"`, `compatibility_flags = ["nodejs_compat"]`
- [x] Staging environment shares production D1 database (`def140e1-c5bb-48e5-a79f-e9368321c9d0`)
- [x] Staging environment shares production KV namespace (`CACHE`)
- [x] Staging environment shares production R2 bucket (`hive-warfare-storage`)
- [x] Secrets configured: `JWT_SECRET`, `PASSWORD_SALT` (both staging + production)

## ✅ Database State

- [x] Schema migrations applied (org_id columns on members/leads/orders/psn; habit_score/energy_score/join_date on members)
- [x] Seeded users exist:
  - `admin@droppii.vn` (Admin, org_id=NULL → system admin)
  - `core@droppii.vn` (Core Leader, org_id='org-default')
  - `psn@droppii.vn` (PSN Leader, org_id='org-default')
  - `member@droppii.vn` (Member, org_id='org-default')
- [x] Password hashes updated to 100k PBKDF2 for all seeded users
- [x] Seed data org_id corrected: leads/orders updated from NULL to 'org-default'

## ⚠️ Known Concerns

- Staging uses **same D1 database as production** — data changes affect both environments
- Consider provisioning separate staging D1 database for isolation
- Cron trigger registration failed (Free tier limit: 5 crons max) — worker code deployed successfully

## ✅ Local Tests

- [x] Jest suite: 231 tests, 14 suites — **ALL PASSING**
- [x] Local smoke test against `http://localhost:8787` (wrangler dev) — org scoping verified