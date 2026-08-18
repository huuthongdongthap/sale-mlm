# Phase 3 — Production Scale (200 Members / 20 PSNs)
Plan: 260816-2140-phase3-production-scale
Status: Tasks 1-7 complete; deploy-blockers (CF secrets, domains) remain external

## Goal
Scale from 50 members / 5 PSNs to 200 members / 20 PSNs with persistent storage, production hardening, and revenue analytics. Target: $50K MRR trajectory.

## Phases (7 tasks, est. 28 days)

| # | Task | Focus | Est |
|---|------|-------|-----|
| 1 | Database migration (D1) | Replace in-memory stores with SQLite | 4d |
| 2 | Multi-tenant org isolation | org_id partitioning, RBAC org scope | 3d |
| 3 | Seed 200 members / 20 PSNs | Expand generator, 90-day history | 2d |
| 4 | Revenue analytics dashboard | MRR, ARPU, churn, cohort, commission | 4d |
| 5 | Load testing + perf tuning | 200 concurrent, <500ms p95 | 3d |
| 6 | Security compliance pack | PDPA report automation, rate limit prod | 3d |
| 7 | Production deploy checklist | CF secrets, domain, SSL, monitoring | 2d |

## Dependencies
- Requires: Phase 1 (E11) + Phase 2 (T-026..T-032) complete
- Blocks: Marketing launch, franchise onboarding (Phase 4)
- Est total: ~21 days

## Files
- src/models/*.js — refactor for D1
- src/server.js — add org isolation middleware
- src/api/analytics*.js — revenue endpoints (new)
- test/integration/*.test.js — load + perf tests (new)
- wrangler.toml — D1 bindings, KV for cache

## Open Questions
1. SQLite D1 vs external Postgres for long term — depends on franchise white-label needs
2. Commissioner rate split (10%/5%) needs business sign-off
3. Zalo OA webhook still pending from pilot
---

## Task Completion Log

### Task 6 — Security Compliance Pack ✅ (2026-08-18)

Implemented the PDPA compliance pack. Deliverables:

| File | Change |
|------|--------|
| `src/utils/auditLog.js` | `logPIIAccess` now persists to `global.db.logAudit` (audit_trail table) when a database adapter is wired, falling back to the in-memory array. Added `mapAuditRow`, `normalizeAuditRows`, and `getAuditLogsAsync` so the compliance report reflects the full trail across restarts. |
| `src/db/adapter.js` | Added `getAuditTrail(filters)` SELECT with actorId/resourceType/action/dateFrom/dateTo filters + LIMIT; normalizes D1 `{ results: [...] }` vs raw array. |
| `src/db/local-adapter.js` | Added matching `getAuditTrail` for the local SQLite adapter. |
| `src/middleware/rateLimit.js` | New production rate limiter: auth (10/15min), api (300/15min), webhook (60/60s), keyed by `CF-Connecting-IP` via `ipKeyGenerator`. `skip: () => !isProduction` so dev/test are never throttled. |
| `src/server.js` | Mounted `authLimiter` on `/auth`, `apiLimiter` on `/api/habits`, `/api/members`, `/api/kpi`; added `GET /api/compliance/report` (Admin only). |
| `src/utils/complianceReport.js` | New `buildComplianceReport(filters)` aggregating the 30-day window via `getAuditLogsAsync`. |
| `test/compliance-jest.test.js` | 12 tests covering audit persistence, adapter normalization, report aggregation, rate-limit exports, and endpoint auth. |

**Bugs found and fixed during verification:**
1. `express-rate-limit` rejects custom `keyGenerator`s that don't use `ipKeyGenerator` for IPv6 — replaced the raw `req.ip` generator with `ipKeyGenerator(req.get('CF-Connecting-IP') || req.ip)`. Without this the server threw `ERR_ERL_KEY_GEN_IPV6` at startup in production.
2. `getAuditTrail` bound raw `Date` objects as SQLite params → `SQLite3 can only bind numbers, strings, bigints, buffers, and null`. Added `iso()` normalization in both adapters.
3. The compliance test mock's `logAudit` did `JSON.parse(data.piiFields)` while `auditLog` passes an array — the parse threw and the `.catch` swallowed it, leaving `persisted` empty. Normalized the mock to accept both shapes.

### Task 7 — Production Deploy Checklist ✅ (2026-08-18)

Deliverables:

| File | Change |
|------|--------|
| `docs/05_TASKS/production-deploy-checklist.md` | New production deploy checklist: completed infrastructure (wrangler.toml, CI/CD, deploy.sh, health endpoints, compliance pack, RUNBOOK), remaining Cloudflare secrets, domain/DNS, worker route coverage gap, monitoring, pre/post-deploy verification, rollback plan. |

**Key finding:** `src/workers/index.js` is a 79-line stub — it only handles `/quiz`, `/checkout`, and `/api/quiz/submit`. The full Express route surface (`/auth/*`, `/api/members/*`, `/api/habits/*`, `/api/kpi/*`, `/api/psn/*`, `/api/alerts/*`, `/api/onboarding/*`, `/api/analytics/*`, `/api/compliance/report`, `/api/monitoring/*`, `/health`, `/ready`, `/metrics`) has not been ported to native fetch API. Production deployment as currently configured would serve only the quiz stub. This is documented as an open gap in the checklist.
