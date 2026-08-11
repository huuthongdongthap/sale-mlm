# PROJECT REVIEW REPORT — DROPPII TRAINING OS

**Project:** Droppii Sales Training OS (Hive Warfare Academy)  
**Review Date:** 2026-06-23  
**Reviewer:** Claude Code — Comprehensive Project Review  
**Work Context:** `/Users/mac/mekong-cli/SALE MLM`

---

## 1. EXECUTIVE SUMMARY

### Overall Health Score: 42/100 (RED)

**Status:** BLOCKED — NOT READY FOR PILOT LAUNCH

### Go/No-Go Recommendation: NO-GO

**Critical Blockers:** 15 CRITICAL findings + 13 HIGH findings + missing T-025 launch artifacts

**Bottom Line:** Despite T-024 and T-025 marked "done" in kanban (2026-05-20), the system is **unsafe for production** and **cannot proceed with pilot launch** without significant fixes. Core authentication is broken (fake PBKDF2), data loss guaranteed (5 in-memory stores), and PII exposure risk (unauthenticated endpoints, hardcoded secrets).

**Minimum Fix Effort:** 97.5 hours (17 work days)  
**Recommended Timeline:** 4 weeks (allow buffer for testing)

---

## 2. BUSINESS MODEL VALIDATION

### Business Model Canvas Assessment

**Projected Revenue Model:**
- Primary: Subscription SaaS for MLM training platform
- Target: $500K ARR (per README)
- Unit economics appear sound: LTV:CAC ratio 25:1 (excellent)

**Current State:** MVP with 10 pilot users planned

### Validation Findings

| Aspect | Status | Issues |
|--------|--------|--------|
| **Unit Economics** | ✅ SOUND | Positive contribution margin (63%), LTV:CAC > 3:1 target |
| **Customer Acquisition** | ⚠️ UNDERSIZED | CAC 40K VND assumed, no marketing automation |
| **Pricing Strategy** | ❓ NOT DEFINED | No pricing tiers documented in business model |
| **Revenue Forecast** | ⚠️ OPTIMISTIC | 0 → 50M VND/mo in 12mo requires 5% monthly growth |
| **Cost Structure** | ✅ LEAN | Fixed costs only 700K VND/mo (infrastructure) |
| **Compliance** | ⚠️ PDPA GAPS | Audit trail in-memory = compliance violation |
| **Scalability** | ❌ NOT PROVEN | Multiple architectural blockers for 50+ users |

**Business Model Verdict:** Economically viable concept, but **operational readiness** is insufficient to acquire/retain customers. Data loss incidents during pilot would destroy credibility.

---

## 3. ARCHITECTURE REVIEW FINDINGS

### System Architecture Quality

**Architecture Type:** Cloudflare Workers + D1 (SQLite) + Pages  
**Code Quality:** 71% test coverage, but key security gaps  
**Design Pattern:** Mostly clean separation (API, models, analytics, agents)

### Strengths
1. Edge-native serverless design (low latency, cost-efficient)
2. Stateless JWT auth pattern (good)
3. Clear module boundaries (api/, models/, analytics/, agents/)
4. PDPA groundwork (encryption intent, audit logging concept)
5. Culturally-relevant PSN health classifier (Cửu Địa 9-state model)
6. Comprehensive training curriculum (12 modules, 3 tiers)
7. RBAC implementation with 4 roles
8. Health check endpoint present

### Critical Architectural Gaps

#### Category: Persistence (CRITICAL)
**5 in-memory data structures guarantee data loss:**
1. Alert rules engine (`rules[]`, `alertLog[]`) — loses all alert history
2. Error monitoring (`errorLog[]`) — loses error trends
3. Onboarding sessions (`sessions`) — training progress wiped on restart
4. Training records (`trainingRecords`) — curriculum state lost
5. Audit trail (`auditLogs`) — **PDPA violation** (audit logs must be immutable)

**Impact:** Pilot users lose training progress on any Worker/Express restart. Cannot debug incidents without error history. Regulatory risk for audit log non-persistence.

#### Category: Security (CRITICAL)
1. **Fake PBKDF2** (`src/workers/index.js:149-165`): Uses `simpleHash()` (djb2) instead of real PBKDF2-SHA512. Password database trivially crackable in microseconds.
2. **Unauthenticated endpoints** (4 routes): `GET /api/members`, `POST /api/habits/checkin`, `GET /api/kpi/:id`, `GET /api/analytics/psn-health` expose all data without JWT.
3. **Hardcoded demo credentials**: `admin123`, `core123`, `psn123`, `member123` in source code.
4. **Fallback secrets** in source: `JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'` — allows anyone to forge JWT tokens and decrypt PII.

#### Category: Data Layer (HIGH)
1. **Schema mismatch**: `src/db/adapter.js` queries tables/columns that don't exist in migrations (`habit_checkins` vs `habits`, `kpi_records` vs `kpi_rollups`, etc.)
2. **No DB indexes** on `members.email`, `members.role`, `members.tier` — full table scans on auth
3. **No connection pooling limits** — potential D1 starvation at scale

#### Category: Deployment (HIGH)
1. **No CI/CD pipeline** — manual `wrangler deploy`, no staging, no automated tests on PR
2. **No backup/restore strategy** — D1 backups exist but restore untested
3. **No environment separation** — only production configured
4. **Missing post-deploy smoke tests**

#### Category: Observability (HIGH)
1. **Errors not persisted** — in-memory only, lost on restart
2. **No distributed tracing** — cannot debug multi-step flows
3. **No performance metrics** — no latency SLAs, no slow query detection
4. **No structured logging** — `console.log` everywhere, unparseable

---

## 4. SYSTEM HEALTH METRICS

### Code Quality Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Test Coverage** | 71.01% stmts, 71.62% branches, 64.7% funcs, 74.37% lines | ≥80% all | 🟡 Partial |
| **Tests Passing** | 131/131 (9 suites) | 100% | ✅ Pass |
| **Source LOC** | ~184,461 total (includes node_modules, dashboard) | N/A | — |
| **Production-ready JS** | ~15,000 estimated | N/A | — |
| **Code Organization** | Clean separation of concerns | Standard | ✅ Good |

### Security Posture

| Control | Implemented | Status |
|---------|-------------|--------|
| Password hashing | PBKDF2 claimed, but fake implementation | 🔴 Broken |
| JWT authentication | Yes (but unauthenticated endpoints exist) | 🟡 Partial |
| PII encryption | AES-GCM implemented, keys hardcoded | 🔴 Compromised |
| RBAC | 4 roles with per-endpoint authorization | ✅ Good |
| Rate limiting | None | 🔴 Missing |
| Audit logging | In-memory only | 🔴 Insufficient |
| Secret management | Fallback defaults in source | 🔴 Broken |

### Reliability Assessment

| Risk | Severity | Confidence |
|------|----------|------------|
| Data loss on restart | CRITICAL | Certain |
| Authentication bypass | CRITICAL | Certain |
| PII exposure | CRITICAL | Certain |
| Password compromise | CRITICAL | Certain |
| Schema mismatch errors | HIGH | Certain |
| Alert state loss | HIGH | Certain |
| Training progress loss | HIGH | Certain |

---

## 5. CRITICAL GAPS WITH PRIORITIES

### P0 (Blockers — Must Fix Before Pilot)

| # | Gap | Category | Effort | Impact if Unfixed |
|---|-----|----------|--------|-------------------|
| 1 | Missing T-025 launch artifacts | Documentation | 4h | No launch verification; cannot proceed |
| 2 | In-memory data stores (5) | Persistence | 24h | Data loss on restart, PDPA violation |
| 3 | Fake PBKDF2 password hashing | Security | 6h | Complete auth compromise |
| 4 | Unauthenticated API endpoints (4 routes) | Security | 6h | PII exposed to world |
| 5 | Hardcoded demo credentials | Security | 2h | Anyone can login as any role |
| 6 | Secrets with fallback defaults | Security | 2h | JWT forge, PII decrypt possible |
| 7 | Schema mismatch (adapter vs migration) | Data Layer | 6h | DB queries fail, system non-functional |

**Total P0 effort:** 50 hours (1.5 weeks)

### P1 (High — Fix Before Scale)

| # | Gap | Category | Effort |
|---|-----|----------|--------|
| 8 | JWT async bug (login returns Promise) | Bug | 0.5h |
| 9 | Error monitoring not persisted | Observability | 3h |
| 10 | No CI/CD pipeline | Deployment | 8h |
| 11 | No backup/restore test | Data Safety | 2h |
| 12 | No KV cache layer | Performance | 8h |
| 13 | N+1 queries in leaderboard | Performance | 3h |
| 14 | No rate limiting on auth | Security | 4h |
| 15 | Missing DB indexes | Performance | 2h |

**Total P1 effort:** 30.5 hours (1 week)

### P2 (Medium — Post-Launch)

| # | Gap | Category | Effort |
|---|-----|----------|--------|
| 16 | No message queue for notifications | Infrastructure | 12h |
| 17 | No scheduled cron runner | Infrastructure | 3h |
| 18 | No distributed tracing | Observability | 5h |
| 19 | No soft delete | Data Integrity | 5h |
| 20 | No idempotency keys | Data Safety | 6h |
| 21 | No structured logging | Observability | 2h |
| 22 | Multi-tenancy (if SaaS needed) | Architecture | 16h |

**Total P2 effort:** 43 hours

---

## 6. REVISED ROADMAP WITH TIMELINE

### Current State: MVP Code Complete, Launch Blocked

**Previous Estimate:** T-024/T-025 "done" on 2026-05-20  
**Actual Status:** Both incomplete + critical code gaps

### Recommended 4-Week Sprint Plan

#### Week 1: Security & Persistence Foundation (5 days)

**Day 1-2: Fix Critical Security Issues (12h)**
- Fix fake PBKDF2 → real PBKDF2-SHA512 with 100K iterations
- Add JWT async/await fix (0.5h)
- Remove hardcoded demo credentials (2h)
- Remove secrets fallback defaults (2h)
- Add authentication to 4 unauthenticated endpoints (6h)

**Day 3-5: Persistence Migration (18h)**
- Migrate alert engine state to D1 (6h)
- Migrate onboarding sessions to D1 (4h)
- Migrate training records to D1 (4h)
- Migrate audit trail to D1 (2h)
- Migrate error monitoring to D1 (2h)

**Week 1 Deliverable:** All P0 security issues resolved; no data loss on restart

---

#### Week 2: Schema Fixes & CI/CD (5 days)

**Day 1-2: Database Schema Alignment (12h)**
- Resolve adapter vs migration mismatch (6h)
  - Option A: Update migration to match adapter (chosen)
  - Add missing columns: `phone`, `buddy_id`, `status`, `join_date`
- Add required indexes (2h)
- Test all CRUD operations against real D1 (4h)

**Day 3-4: CI/CD Pipeline (12h)**
- Create GitHub Actions workflow (6h)
  - Test on PR
  - Deploy to staging on push
  - Deploy to production on main
- Add staging environment config (3h)
- Create post-deploy smoke test script (3h)

**Day 5: Backup & Recovery (6h)**
- Enable D1 point-in-time recovery
- Document restore procedure in RUNBOOK
- Test restore from backup (success criteria: <1 hour recovery)

**Week 2 Deliverable:** Fully automated CI/CD, recoverable backups, working DB schema

---

#### Week 3: Performance & Observability (5 days)

**Day 1-2: Caching Layer (10h)**
- Create Cloudflare KV namespace
- Implement member profile cache (5min TTL)
- Implement PSN health cache (1hr TTL)
- Implement alert rules cache (1hr TTL)
- Verify 40-60% D1 read reduction

**Day 3: Query Optimization (6h)**
- Fix N+1 in leaderboard (single batch query)
- Add missing indexes (training_records, alerts_log)
- Benchmark query latency (target <50ms at 100 members)

**Day 4: Rate Limiting (6h)**
- Implement per-IP rate limit on `/auth/login` (5/15min)
- Implement per-user rate limit on `/api/alerts/evaluate` (100/hr)
- Add progressive delays on failed logins

**Day 5: Error Monitoring & Tracing (6h)**
- Integrate Sentry SDK properly
- Add correlation IDs to all requests
- Implement structured logging (JSON format)
- Set up error rate alerts

**Week 3 Deliverable:** Sub-200ms response times, error rate <0.1%, observability in place

---

#### Week 4: Launch Readiness & Pilot Prep (5 days)

**Day 1-2: T-024 Documentation (8h)**
- Condense README.md to ≤30 lines, bilingual (3h)
- Rewrite RUNBOOK with 3 tested playbooks (DB down, API 500, Zalo fail) (5h)
- Verify all commands work on dev server

**Day 3-4: T-025 Launch Artifacts (8h)**
- Create `plans/launch/pilot-go-no-go-checklist.md` (15 items)
- Draft kick-off Zalo message (Vietnamese, ≤500 chars)
- Generate day-0 dashboard snapshots (seed 10 users, capture screenshots)
- Verify all T-022 monitoring dependencies

**Day 5: Final Verification & Sign-off (6h)**
- Run full test suite (must pass 100%)
- Execute pilot go/no-go checklist (all 15 items pass)
- Load test with 10 concurrent pilot users
- CTO sign-off and kanban update

**Week 4 Deliverable:** PILOT LAUNCH READY — all acceptance criteria met, CTO sign-off

---

### Revised Milestone Dates

| Milestone | Original Date | Revised Date | Delta |
|-----------|---------------|--------------|-------|
| T-024 (Admin Docs) | 2026-05-20 | 2026-06-30 (est) | +40 days |
| T-025 (Pilot Launch) | 2026-05-20 | 2026-07-04 (est) | +45 days |
| Pilot Launch (10 Tân Binh) | Unknown | 2026-07-07 (est) | — |
| Scale to 50 members | — | 2026-08-15 (est) | — |
| Scale to 500 members | — | 2026-12-01 (est) | — |

---

## 7. RISK REGISTER

### Top 10 Current Risks

| ID | Risk | Category | Likelihood (1-5) | Impact (1-5) | Score (L×I) | Mitigation |
|----|------|----------|------------------|--------------|-------------|------------|
| R01 | Data loss on Worker restart | Persistence | 5 | 5 | **25** | Migrate all in-memory stores to D1 before launch |
| R02 | Password database compromised | Security | 5 | 5 | **25** | Replace fake PBKDF2 with real PBKDF2-SHA512, 100K iterations |
| R03 | PII exposed via unauthenticated endpoints | Security | 5 | 5 | **25** | Add JWT auth middleware to all API routes |
| R04 | PDPA compliance violation (audit logs) | Compliance | 5 | 4 | **20** | Persist audit logs to `audit_trail` table, 7-year retention |
| R05 | Schema mismatch causes DB errors | Data Layer | 5 | 4 | **20** | Align adapter queries with migration schema, test all CRUD |
| R06 | Hardcoded secrets enable token forgery | Security | 4 | 5 | **20** | Remove all fallback defaults, use `wrangler secret put` |
| R07 | Pilot participants lose training progress | User Experience | 5 | 3 | **15** | Persist onboarding/training state to D1 |
| R08 | No rollback on failed deploy | Deployment | 4 | 4 | **16** | Implement CI/CD with staging, rollback procedures |
| R09 | Alert evaluation DoS via expensive calculations | Performance | 3 | 5 | **15** | Rate limit alerts endpoint (100 calls/hr per user) |
| R10 | N+1 queries slow dashboard at scale | Performance | 4 | 3 | **12** | Optimize leaderboard with batch query, add indexes |

**Total Risks:** 28 identified (15 critical, 13 high)

### Risk Appetite

The project currently operates with **unacceptable risk tolerance**:
- Security risks: Zero tolerance (multiple critical gaps)
- Data loss: No tolerance (pilot participants must not lose progress)
- Compliance: Zero violations (PDPA fines up to 1% revenue)

---

## 8. UNRESOLVED QUESTIONS NEEDING USER INPUT

### Business & Product

1. **SaaS vs Single-Tenant Strategy**
   - Are we planning to support multiple MLM companies on the same platform?
   - Multi-tenancy adds 16-20 hours of work (tenant isolation, scoped auth, per-tenant config)
   - Affects: database schema, deployment model, authentication, billing

2. **Pilot Launch Size**
   - Is 10 Tân Binh still the target cohort size?
   - Affects: seed data, load testing, onboarding capacity

3. **Pricing Model**
   - What are the actual subscription tiers and prices?
   - Business model doc mentions 50M VND ARR target but no pricing defined
   - Affects: billing integration (if needed later)

### Technical & Infrastructure

4. **Zalo Integration Status**
   - Is `ZALO_ALERT_WEBHOOK` actually configured and tested in production?
   - Current code: stub implementation, no bot logic
   - Affects: alerting strategy, RUNBOOK playbooks

5. **Observability Budget**
   - Can we afford paid services (Sentry $26/mo, Datadog $31/host/mo) or open-source only?
   - Affects: error monitoring implementation choice, retention policies

6. **Backup RPO/RTO**
   - What's acceptable data loss (Recovery Point Objective)?
   - What's maximum recovery time (Recovery Time Objective)?
   - Affects: backup frequency, PITR configuration, testing cadence

7. **Scale Targets**
   - How many concurrent users expected in 12 months?
   - Affects: caching strategy, connection pool sizing, performance SLAs

8. **Cloudflare Plan**
   - Are we on free tier or paid? Affects: Worker CPU time (10ms free), D1 storage (10GB free), KV/Queues availability

### Compliance & Legal

9. **PDPA Audit Log Retention**
   - 7-year retention required by law — storage cost implications?
   - Should we archive old logs to R2 (cheaper storage)?

10. **Multi-tenancy Data Isolation**
    - If SaaS, how strict is tenant isolation requirement?
    - Separate D1 per tenant vs partitioned tables (cost vs complexity trade-off)

---

## 9. RECOMMENDATIONS

### Immediate Actions (This Week)

1. **Halt pilot launch planning** until P0 issues addressed
2. **Assign engineering resources** to 4-week sprint plan above
3. **Decide SaaS vs single-tenant** (Question 1) — affects architecture
4. **Verify T-022 monitoring completion** (currently questionable)
5. **Create missing T-025 artifacts** (can proceed in parallel with code fixes, but must not launch without)

### 4-Week Sprint Execution

- **Week 1-2:** Security + persistence fixes (highest urgency)
- **Week 3:** Performance + observability
- **Week 4:** Documentation + launch verification

### Post-Launch (Q3-Q4 2026)

- Complete P2 items (caching, queue, tracing, soft delete)
- Multi-tenancy if required
- Scale optimization for 500+ members
- Automated scaling and capacity planning

---

## 10. CONCLUSION

The Droppii Training OS is a **promising MVP with solid foundations** (edge-native architecture, clean modules, good test coverage) but is **not production-ready** due to:

1. **Critical security flaws** (fake PBKDF2, unauthenticated endpoints, hardcoded secrets)
2. **Guaranteed data loss** (5 in-memory stores)
3. **Missing launch artifacts** (T-025 deliverables)
4. **No deployment automation** (manual deploys, no staging)
5. **Compliance violations** (PDPA audit trail)

**Minimum viable pilot (extreme risk acceptance):** 14.5 hours of security fixes only — still risky due to data loss.

**Recommended path:** 4-week focused engineering sprint to address all P0/P1 items, then proceed with pilot launch with proper monitoring and backup/restore tested.

**Health Score:** 42/100 (RED) → Projected post-sprint: 78/100 (YELLOW/GREEN)

---

**Report Generated:** 2026-06-23  
**Next Review:** After 4-week sprint completion (estimated 2026-07-21)

---

**Unresolved Questions Summary:**
1. SaaS vs single-tenant strategy?
2. Pilot size confirmation?
3. Pricing model defined?
4. Zalo integration status?
5. Observability budget?
6. Backup RPO/RTO?
7. Scale targets for 12 months?
8. Cloudflare plan (free vs paid)?
9. PDPA log retention cost tolerance?
10. Multi-tenancy data isolation requirements?

*All 10 questions require user input before final architecture decisions can be made.*
