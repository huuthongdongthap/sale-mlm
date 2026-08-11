# Planner — Module Gap Inventory + Readiness Sync
Date: 2026-07-29
Sources: top-10-critical, audit-truoc-260707, audit-training-truoc-260707, research-funnel-os

## 1. Security-Critical (resolve before any other work)

| ID | Module | File:Line | Issue |
|----|--------|-----------|-------|
| S-1 | Auth (all) | src/workers/index.js:149-165 | Fake PBKDF2 (djb2 rolling hash, not real PBKDF2)
| S-2 | Auth | src/workers/index.js:188-216 | 4 unauthenticated endpoints (members, habits, kpi, psn-health)
| S-3 | Auth | src/api/auth.js:15-48 | Hardcoded demo credentials (admin123, core123, psn123, member123)
| S-4 | Auth | src/auth/jwt.js:10, src/utils/encryption.js:11 | Fallback secrets committed in source

## 2. Data Integrity (loss on restart)

| ID | Module | File:Line | Issue |
|----|--------|-----------|-------|
| D-1 | Alerts | src/analytics/alertEngine.js:20-21 | rules[], alertLog[] in-memory
| D-2 | Monitoring | src/utils/monitoring.js:14 | errorLog in-memory
| D-3 | Onboarding | src/agents/onboardingBot.js:28 | sessions object in-memory
| D-4 | Training | src/agents/trainingOps.js:48 | trainingRecords in-memory
| D-5 | All | src/utils/auditLog.js:8 | auditLogs in-memory (PDPA Art.35 violation)

## 3. Runtime Bugs (crash or broken flow)

| ID | Module | File:Line | Issue |
|----|--------|-----------|-------|
| B-1 | Training | src/workers/index.js:881 | kpiRecords undeclared — ReferenceError on POST /api/training/progress with type=kpi
| B-2 | Auth | src/workers/index.js:40 | btoa() fails on Vietnamese chars — JWT corruption
| B-3 | Leads | src/workers/index.js:1169-1177 | Duplicate route registration (dead code)
| B-4 | Auth | src/workers/index.js:86 | createJWT async not awaited — returns Promise object instead of token

## 4. Schema / DB Alignment

| ID | Module | File:Line | Issue |
|----|--------|-----------|-------|
| SC-1 | DB | src/db/adapter.js | Adapter queries habit_checkins/kpi_records/psns/alert_rules/audit_log/error_log — migration has habits/kpi_rollups/psn_health_history/alerts_log/audit_trail
| SC-2 | DB | src/db/adapter.js:43 | INSERT references phone/buddy_id/status/join_date — none exist in migration

## 5. Module-Specific Missing Endpoints/Features

| Module | Missing Item | Source | Impact |
|--------|--------------|--------|--------|
| /funnel | Funnel CSS vars (--status-*, --surface-hover) | research-funnel-os-report | Incomplete UI tokens |
| /orders | PATCH /api/orders/:id/mark-paid | audit-truoc-260707 | Revenue flow blocked — cannot fulfill orders |
| /orders | Payment proof upload (R2/file) | audit-truoc-260707 | No bank transfer evidence in system |
| /orders | Order state machine (pending->paid->shipped->delivered) | audit-truoc-260707 | No status transitions |
| /leads | Referral auto-assign from ?ctvId= URL param | audit-truoc-260707 | CTV attribution = NULL, commission = 0 |
| /leads | Product recommendation engine (quiz -> product) | audit-truoc-260707 | No 'Ban phu hop L1' conversion |
| /leads | Public quiz page + checkout page (no auth) | audit-truoc-260707 | Anonymous lead capture blocked |
| /training | Public training portal (src/dashboard/public/) | audit-training-truoc-260707 | CTV cannot access training |
| /training | Training content (tier1/tier2 JSON) | audit-training-truoc-260707 | No curriculum data |
| /training | Graduation -> Funnel OS bridge | audit-training-truoc-260707 | Tier-1 grad does not enter sales funnel |
| /alerts | Alert rules/log persistence (D1) — already in-memory | top-10-critical | History lost, no trend analysis |
| /onboarding | Session persistence (D1) | top-10-critical | 4-week state wiped on restart |
| /onboarding | Zalo OA webhook route not registered | audit-truoc-260707 | Webhook receives but no handler processes it |
| Auth | CTV self-register vs Leader-created accounts | audit-truoc-260707 | Business logic not decided |

---

## 2. PRIORITIZED FIXES

### Sprint 0: Security Baseline (BLOCKER) — 17.5h, 3 days

| # | Fix | Effort | Verification |
|---|-----|--------|--------------|
| F-1 | Replace fake PBKDF2 with real PBKDF2-SHA512 (10K iterations) | 6h | Benchmark: each hash ~100ms; 1000 guesses > 100s
| F-2 | Add requireAuth to 4 unauthenticated endpoints | 2h | curl without token -> 401; with token -> 200
| F-3 | Remove DEMO_USERS, create seed-pilot.js with random passwords | 2h | grep 'admin123' src/ returns 0 matches
| F-4 | Remove all || fallback secrets; enforce env vars at startup | 2h | Start without JWT_SECRET -> clear error
| F-5 | Fix JWT async/await (line 86) + btoa Vietnamese fix | 0.5h | Token decodes correctly for 'Nguyen Van A'
| F-6 | Remove duplicate lead route (line 1169) | 0.5h | No route ambiguity |
| F-7 | Fix schema mismatch: align adapter queries with migration | 6h | All INSERT/SELECT run without SQL error

### Sprint 1: Data Persistence — 24h, 4 days

| # | Fix | Effort |
|---|-----|--------|
| P-1 | Migrate alertEngine rules[]/alertLog[] to D1 tables | 4h |
| P-2 | Migrate monitoring errorLog to D1 errors table | 3h |
| P-3 | Migrate onboardingBot sessions to D1 onboarding_sessions | 5h |
| P-4 | Migrate trainingOps trainingRecords to D1 training_records | 5h |
| P-5 | Migrate auditLog to D1 audit_trail (append-only, 7yr retention) | 4h |
| P-6 | Data survives 3 consecutive restart test | 1h |
| P-7 | KV cache for hot reads (TTL 5-15min) | 3h |

### Sprint 2: Revenue-Critical Endpoints — 12h, 2 days

| # | Fix | Effort | Revenue Enables |
|---|-----|--------|-----------------|
| R-1 | PATCH /api/orders/:id/mark-paid (status=pending->paid, trigger commission) | 3h | Leaders can fulfill orders |
| R-2 | GET /api/leads?ctvId= (lead filter by CTV) | 2h | CTV sees own leads |
| R-3 | Referral auto-assign: handleCreateLead reads ?ctvId= from URL | 2h | CTV commission attribution |
| R-4 | Public quiz page (/, no auth) + POST /api/public/quiz | 4h | Anonymous lead capture |
| R-5 | Product recommendation: POST /api/leads/:id/recommend | 3h | Quiz -> product tier suggestion |
| R-6 | Public checkout page (/checkout, no auth) | 3h | Order creation by anonymous lead |

### Sprint 3: Training + Onboarding + Alerts — 18h, 3 days

| # | Fix | Effort |
|---|-----|--------|
| T-1 | Build public training portal (src/dashboard/public/) | 4h |
| T-2 | Create tier1/tier2 training content JSON | 4h |
| T-3 | Wire Graduation -> Funnel OS enrollment bridge | 3h |
| T-4 | Register Zalo OA webhook route in Workers | 3h |
| T-5 | Alert notification fire-and-forget (Zalo/Telegram) | 2h |
| T-6 | Onboarding nudge delivery pipeline wired to Zalo | 2h |

### Sprint 4: Scale Preparation — 22h, 4 days

| # | Fix | Effort |
|---|-----|--------|
| SC-1 | KV cache layer (reduce D1 reads 60%) | 8h |
| SC-2 | Rate limiting (login per-IP, alerts per-user) | 6h |
| SC-3 | DB indexes (members.email/role/tier, orders.status) | 2h |
| SC-4 | N+1 query fix in kpi.js leaderboard (batch JOIN) | 3h |
| SC-5 | CI/CD pipeline (.github/workflows/ci.yml) | 8h |
| SC-6 | Structured logging + distributed tracing | 6h |

**Total estimated: 73.5h**

---

## 3. READINESS CHECKLIST — GO/NO-GO GATES

### /funnel
- [ ] `handleFunnelMetrics` returns valid data via GET /api/analytics/funnel
- [ ] CSS vars `--status-*`, `--surface-hover` present in globals.css or design-system
- [ ] Funnel metrics read from D1 (not in-memory)
- [ ] PSN health endpoint auth-consistent (no unauthenticated gaps)
- [ ] Funnel CSS parity with dashboard existing tokens

### /orders
- [ ] PATCH /api/orders/:id/mark-paid implemented and tested
- [ ] Order state machine documented (pending -> paid -> shipped -> delivered)
- [ ] Commission calculator triggers on mark-paid
- [ ] Payment proof upload endpoint exists (R2 or local storage)
- [ ] `mock orders.js` removed or marked as legacy
- [ ] Order status transitions validated via integration test

### /leads
- [ ] `handleCreateLead` reads `?ctvId=` from URL query params
- [ ] `assigned_ctv_id` set automatically on lead creation from referral link
- [ ] Product recommendation engine: POST /api/leads/:id/recommend returns tier suggestion
- [ ] Public quiz page at /quiz (no auth) functional
- [ ] Public checkout page at /checkout (no auth) functional
- [ ] CTV dashboard shows own leads (GET /api/leads?ctvId=X)
- [ ] Lead status transitions work (L0 -> L1 -> L2 -> L3)

### /training
- [ ] Training content JSON exists (tier1/m1-*, tier2/m5-*)
- [ ] Public training portal UI exists (public/ path)
- [ ] Training progress persists across server restart (D1, not in-memory)
- [ ] Graduation detection triggers Funnel OS enrollment
- [ ] `kpiRecords` bug fixed (init arrays in handleTrainingProgress)
- [ ] Training assignment endpoint works end-to-end
- [ ] CTV training completion visible in dashboard

### /alerts
- [ ] Alert rules load from D1 on startup (not in-memory)
- [ ] Alert log entries persist to D1 (not in-memory)
- [ ] Alert evaluation runs within budget (no DoS vector)
- [ ] Retention guard triggers Zalo/Telegram notification
- [ ] Alert summary endpoint returns historical data
- [ ] Alert ack/clear workflow functional

### /onboarding
- [ ] Onboarding sessions persist to D1 (not in-memory)
- [ ] 4-week curriculum state survives restart
- [ ] Habit check-in within onboarding tracks to habit engine
- [ ] Nudge delivery pipeline wired to Zalo OA webhook
- [ ] Onboarding progress visible to leader dashboard
- [ ] Session expiry / graduation transition clean

---
## Exercises (non-blocking, for next sprint)

1. Schema alignment audit: map every adapter query to migration schema; produce diff report
2. Auth coverage sweep: grep all route registrations; flag any missing requireAuth
3. Vietnamese i18n smoke test: register/login with accented names under both Workers and Express
4. Sentry cost analysis: estimate error volume; decide open-source (Umami) vs Sentry ($26/mo)
5. Commission payout policy: define threshold (per-order instant vs batch monthly); update engine config
6. Multi-tenancy decision: SaaS needed for pilot or post-scale? Document ADR
7. CI/CD hardening: add coverage enforcement (currently passes with --no-coverage flag)
8. Backup RPO/RTO: define and test recovery procedure
9. Zalo OA webhook: verify sandbox; document production webhook URL + secret
10. Product seeding: define who inserts 3 products (L1/L2/L3) and at what price point

---

## Unresolved Questions

1. S-4 fallback secrets: is JWT_SECRET same across Workers and Express? Must converge before pilot.
2. Schema alias strategy: rename migration tables to match adapter OR update adapter? Pick one.
3. Zalo OA webhook: is ZALO_ALERT_WEBHOOK env var set? If not, alerts/nudges fail silently in pilot.
4. Commission payout: per-order real-time or batch monthly? Unblocks R-1 logic.
5. CTV self-register vs Leader-created: decide before seed-pilot.js is written.
6. Multi-tenancy: required for pilot (2 PSNs) or only for SaaS expansion later?
7. Coverage threshold: currently ~50% vs 70% target. Path to 70%: which files get tests first?

PLAN: plans/260729-1825-gap-readiness-sync/plan.md
REPORT: plans/reports/planner-260729-1825-gap-readiness-sync.md