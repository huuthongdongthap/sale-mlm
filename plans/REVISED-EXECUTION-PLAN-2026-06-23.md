# REVISED EXECUTION PLAN — Droppii Sales Training OS

**Date:** 2026-06-23  
**Project:** Hive Warfare Academy (MLM Training Platform)  
**Target:** $500K ARR | Pilot: 10 Tân Binh  
**Team:** PHỤNG SỰ 100 ĐỘ C  
**Work Context:** `/Users/mac/mekong-cli/SALE MLM`  
**Reports Path:** `/Users/mac/mekong-cli/SALE MLM/plans/reports/`  
**Plans Path:** `/Users/mac/mekong-cli/SALE MLM/plans/`

---

## EXECUTIVE SUMMARY

Based on gap analysis of current project state (25 tasks in README, existing implementation, infrastructure), this revised plan addresses critical missing components needed for successful pilot launch. The original plan marked many tasks as complete, but verification reveals incomplete deployment configuration, missing launch artifacts, and documentation quality issues.

**Key Gaps Identified:**
1. README.md too long (206 lines vs ≤30 line requirement)
2. Pilot launch artifacts missing (`plans/launch/` directory)
3. Cloudflare Pages deployment not configured for frontend
4. E2E test uses supertest (API-level) instead of Playwright (browser-level)
5. Monitoring Sentry integration is stub only (needs real package)
6. Missing go/no-go checklist and Zalo message templates
7. Dashboard build configuration separate from Workers deployment

**Revised Approach:** Three-phase execution with parallel workstreams where possible.

---

## PHASE 1: IMMEDIATE (NEXT 7 DAYS) — CRITICAL PATH

**Goal:** Complete all blocking tasks for pilot launch readiness

### Task 1.1: Condense README to Bilingual ≤30 Lines (T-024)
**Effort:** 2 hours  
**Priority:** P0 — Blocks documentation sign-off  
**Dependencies:** None  
**Owner:** content-worker

**Specific Work:**
- Rewrite current 206-line README to essential commands only
- Include: project name (1 line), quick start (4 commands, 4 lines), deployment (2 lines), health check (2 lines), docs links (1 line), support (1 line)
- Vietnamese translation: add Vietnamese line below each English section
- Verify all commands runnable: `npm install`, `npm run dev`, `npm run dev:dashboard`, `curl /health`
- Total: ≤30 lines including whitespace

**Deliverable:** `/README.md` (final version)  
**Acceptance:** `wc -l README.md ≤ 30`

---

### Task 1.2: Create Pilot Launch Artifacts Directory (T-025)
**Effort:** 1 hour  
**Priority:** P0 — Blocks all launch preparation  
**Dependencies:** None  
**Owner:** ops-worker

**Specific Work:**
```bash
mkdir -p plans/launch
cd plans/launch
```

Create directory structure and placeholder files.

**Deliverable:** `plans/launch/` directory with README.md (index)  
**Acceptance:** Directory exists with at least 3 planned artifact files

---

### Task 1.3: Build Go/No-Go Launch Checklist (T-025)
**Effort:** 3 hours  
**Priority:** P0 — Required for launch approval  
**Dependencies:** Task 1.2 (directory)  
**Owner:** ops-worker

**Specific Work:**
- Create `plans/launch/pilot-go-no-go-checklist.md`
- 15 items across 4 categories: Infrastructure (5), Data (3), Content (3), Operations (4)
- Each item: clear verification method (curl command, test, manual check)
- Include sign-off section: Prepared by, Reviewed by, Approved (YES/NO)

**Items to include:**
1. Cloudflare Workers deployed, health returns 200
2. Cloudflare Pages dashboard deployed and loads
3. Domain resolves correctly
4. Sentry configured in production env
5. Zalo webhook tested with 3 sample messages
6. Seed data creates 10 pilot members
7. 14-day history present for all members
8. PSN health states vary across 2 PSNs
9. All 4 Tier-1 modules present as valid JSON
10. Each module has 7 lessons with ≥400 words Vietnamese
11. Curriculum auto-assignment tested
12. Onboarding bot end-to-end tested (W1→W4)
13. Nudge payload validated with Zalo sandbox
14. Alert rules fire correctly on threshold breach
15. Dashboard loads all 4 views (Members, KPI, PSN, Alerts)

**Deliverable:** `plans/launch/pilot-go-no-go-checklist.md`  
**Acceptance:** Exactly 15 items with verification methods

---

### Task 1.4: Create Kick-off Zalo Message Draft (T-025)
**Effort:** 2 hours  
**Priority:** P0 — Launch communication needed  
**Dependencies:** Task 1.2 (directory)  
**Owner:** ops-worker

**Specific Work:**
- Draft Vietnamese Zalo OA message ≤500 chars
- Structure: Welcome, start date, first module (M1), dashboard URL, credentials placeholder, support contact, 24h action required
- Use placeholders: [NAME], [DATE], [URL], [EMAIL], [TEMP_PASS], [ZALO_CONTACT]
- Friendly tone, PHỤNG SỰ 100 ĐỘ C branding

**Deliverable:** `plans/launch/kick-off-zalo-draft.md`  
**Acceptance:** Message fits Zalo 500-char limit, placeholders bracketed

---

### Task 1.5: Capture Day-0 Dashboard Snapshot (T-025)
**Effort:** 2 hours  
**Priority:** P0 — Documentation for PSN leaders  
**Dependencies:** Task 1.2 (directory), seed data working  
**Owner:** ops-worker + content-worker

**Specific Work:**
1. Start dev server with seed: `node scripts/seed.js && npm run dev`
2. Login as admin, navigate to 4 views
3. Capture screenshots:
   - Members table with 10 pilot members, filters applied
   - KPI panel showing metrics
   - PSN health 9-state view
   - Alerts inbox (empty or with sample)
4. Save as PNG files in `plans/launch/screenshots/`
5. Create `plans/launch/day-0-dashboard-snapshot.md` embedding images

**Deliverable:** `plans/launch/day-0-dashboard-snapshot.md` + screenshots  
**Acceptance:** 3+ screenshots showing realistic pilot data

---

### Task 1.6: Verify Cloudflare Pages Deployment (T-021)
**Effort:** 3 hours  
**Priority:** P0 — Infrastructure incomplete  
**Dependencies:** None  
**Owner:** devops-worker

**Specific Work:**
- Review `wrangler.toml`: Currently configured for Workers only (`main = "src/workers/index.js"`)
- Create `wrangler.toml` configuration for Pages:
  - Add `[pages]` section or separate `wrangler.pages.toml`
  - Configure build command: `npm --prefix src/dashboard ci && npm --prefix src/dashboard run build`
  - Configure output directory: `src/dashboard/dist`
  - Bind environment variables: JWT_SECRET, SENTRY_DSN (optional), ZALO_ALERT_WEBHOOK (optional)
- Test local build: `cd src/dashboard && npm run build`
- Verify `dist/` directory created with static assets
- Deploy to Cloudflare Pages (staging) or document manual deployment steps

**Deliverable:** Updated `wrangler.toml` with Pages configuration + deployment verification report  
**Acceptance:** `npm run build` succeeds in dashboard, `dist/` exists, deployment documented

---

### Task 1.7: Add Real Sentry SDK Integration (T-022)
**Effort:** 2 hours  
**Priority:** P0 — Monitoring incomplete  
**Dependencies:** None  
**Owner:** devops-worker

**Specific Work:**
- Current: `src/utils/monitoring.js` uses stub class (lines 17-46)
- Install real Sentry: `npm install @sentry/node` (if not in package.json)
- Update `monitoring.js` to use real Sentry when `SENTRY_DSN` set
- Replace console.error with `Sentry.captureException`
- Add `Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV })`
- Keep fallback to stub if DSN not set (graceful degradation)

**Deliverable:** Updated `src/utils/monitoring.js` + `package.json` if needed  
**Acceptance:** Real Sentry captures errors when DSN set; stub fallback when not

---

## PHASE 2: SHORT-TERM (DAYS 8-30) — STABILITY & QUALITY

**Goal:** Harden system, improve test coverage, complete documentation

### Task 2.1: Implement True E2E Test with Playwright (T-019)
**Effort:** 8 hours  
**Priority:** P1 — Quality gate  
**Dependencies:** Task 1.6 (deployment)  
**Owner:** tester

**Specific Work:**
- Current: `test/e2e-smoke.test.js` uses supertest (API-level)
- Requirement: Browser-level E2E (Playwright)
- Setup:
  - `npm install -D @playwright/test`
  - Create `playwright.config.ts` for headless Chromium
- Implement tests:
  1. Launch browser, navigate to dashboard URL
  2. Login as admin, verify dashboard loads
  3. Navigate to Members view, verify table renders
  4. Navigate to KPI, PSN, Alerts views
  5. Test member filter by tier/PSN
  6. Logout
- Run headless in CI: `npx playwright test`
- Update CI workflow to include Playwright E2E stage after build

**Deliverable:** `test/e2e-playwright.spec.ts` + updated CI workflow  
**Acceptance:** Playwright tests pass headless, CI includes E2E stage

---

### Task 2.2: Verify & Document Zalo Webhook Integration (T-022)
**Effort:** 4 hours  
**Priority:** P1 — Alerting needs validation  
**Dependencies:** Task 1.7 (monitoring)  
**Owner:** devops-worker + ops-worker

**Specific Work:**
- Test actual Zalo OA webhook integration:
  1. Verify ZALO_ALERT_WEBHOOK format (expected: OA access token + endpoint)
  2. Send test message via curl: `curl -X POST $ZALO_ALERT_WEBHOOK -d '{"test":"ping"}'`
  3. Confirm message received in Zalo admin chat
- If Zalo integration not ready: document expected format and mark as "pending production deployment"
- Add Zalo webhook test to monitoring verification script
- Document Zalo setup in RUNBOOK (env var format, test procedure)

**Deliverable:** Zalo integration test report + RUNBOOK update  
**Acceptance:** Zalo webhook verified working OR documented as pending with clear setup steps

---

### Task 2.3: Update Development Roadmap & Changelog (Documentation)
**Effort:** 2 hours  
**Priority:** P1 — Project tracking  
**Dependencies:** Task 1 completion  
**Owner:** content-worker

**Specific Work:**
- Update `docs/development-roadmap.md`:
  - Mark E10-docs (T-024) as Complete
  - Mark E11-launch (T-025) as Complete (after T-025 finish)
  - Update completion dates to 2026-06-30 (or actual)
  - Move all tasks to Done column
- Update `docs/project-changelog.md`:
  - Add entry: "2026-06-30 — MVP Closeout"
  - List added: Admin docs, pilot launch checklist, Zalo templates, snapshots
  - Note any breaking changes (none expected)

**Deliverable:** Updated `docs/development-roadmap.md` + `docs/project-changelog.md`  
**Acceptance:** Both files reflect MVP completion with correct dates

---

### Task 2.4: Run Full Test Suite & Fix Coverage Gaps
**Effort:** 6 hours  
**Priority:** P1 — Quality assurance before launch  
**Dependencies:** Task 2.1 (E2E)  
**Owner:** tester

**Specific Work:**
- Run full test suite: `npm test -- --coverage`
- Check coverage: target ≥70% statements, ≥65% branches, ≥60% functions, ≥70% lines
- Identify gaps: which modules have <70% coverage
- Write additional tests for uncovered code paths
- Focus on: alert engine, PSN health classifier, onboarding bot, training ops
- Re-run until all coverage targets met
- Fix any failing tests discovered

**Deliverable:** Updated test files + coverage report showing ≥70% all metrics  
**Acceptance:** `npm test` passes 100%, coverage thresholds met

---

### Task 2.5: Create Admin Training Materials (T-024 Extended)
**Effort:** 4 hours  
**Priority:** P2 — Ops readiness  
**Dependencies:** Task 1.1 (README)  
**Owner:** content-worker

**Specific Work:**
- Create `docs/admin-quick-start.md` (Vietnamese):
  - How to login to dashboard
  - How to view members and filter by tier/PSN
  - How to respond to alerts
  - How to check PSN health and take action
  - How to send daily nudges
- Create `docs/psn-leader-playbook.md` (Vietnamese):
  - Daily checklist for PSN leaders
  - How to interpret 9-state health scores
  - Escalation procedures for Tử Địa (Critical) states
  - How to review trainee progress and intervene
- Create video script templates for walkthrough recordings (optional)

**Deliverable:** 2 new admin guide docs in `docs/`  
**Acceptance:** Both guides complete, Vietnamese language, actionable steps

---

## PHASE 3: MEDIUM-TERM (DAYS 31-90) — SCALING & PRODUCTION READINESS

**Goal:** Prepare for production scale, add Tier 2 content, optimize performance

### Task 3.1: Migrate from In-Memory to D1 Database (Production Persistence)
**Effort:** 16 hours  
**Priority:** P0 — Production data persistence  
**Dependencies:** Task 1.6 (deployment)  
**Owner:** backend-dev

**Specific Work:**
- Current: In-memory storage (data lost on restart)
- Target: Cloudflare D1 (SQLite)
- Tasks:
  1. Design D1 schema: members, habits, kpi_records, alerts, onboarding_sessions, training_progress
  2. Create migration: `migrations/001_initial_schema.sql`
  3. Implement data access layer: `src/db/d1-client.js` (abstract CRUD operations)
  4. Refactor all API routes to use D1 instead of in-memory arrays
  5. Update seed script: `scripts/seed.js` to populate D1 instead of memory
  6. Add connection pooling/retry logic for D1
  7. Test migration: fresh D1 DB, run seed, verify all APIs return data
  8. Update `wrangler.toml` D1 binding if not already present
  9. Document D1 access via Cloudflare dashboard

**Deliverable:** D1 migration complete, all CRUD operations using D1  
**Acceptance:** Data persists across server restarts, seed script populates D1, APIs query D1

---

### Task 3.2: Implement Tier 2 Training Content (M5-M8)
**Effort:** 24 hours (8 hours per module)  
**Priority:** P1 — Beyond MVP  
**Dependencies:** Task 3.1 (DB ready)  
**Owner:** content-team

**Specific Work:**
- Create `content/tier2/` directory:
  - `m5-recruitment-funnel.json` (7 days) — lead gen, landing pages, funnel automation
  - `m6-leader-dna.json` (7 days) — DISC assessment, coaching styles, team building
  - `m7-psn-management.json` (7 days) — advanced PSN operations, territory planning
  - `m8-coaching-conversations.json` (7 days) — 1:1 templates, performance reviews, motivation
- Each module: 7 lessons, ≥500 words Vietnamese, script formats (daily tasks, key concepts, practice exercises)
- Seed training progress data for pilot graduates transitioning to Tier 2
- Update training ops agent to handle Tier 2 curriculum

**Deliverable:** 4 Tier 2 JSON modules in `content/tier2/`  
**Acceptance:** Each module validated by curriculum expert, ≥500 words/lesson

---

### Task 3.3: Add Advanced Analytics: ML-Based Predictions
**Effort:** 20 hours  
**Priority:** P2 — Competitive differentiation  
**Dependencies:** Task 3.1 (D1 with historical data)  
**Owner:** data-scientist

**Specific Work:**
- Build ML models to predict:
  1. Member churn risk (30-day retention prediction from early signals)
  2. PSN health trajectory (next 30 days: improve/deteriorate)
  3. Commission forecasting (individual and PSN revenue projections)
- Implementation:
  - Use simple models initially (logistic regression, random forest) via Python scikit-learn
  - Export model artifacts, load in Node.js via `ml5` or API to Python microservice
  - Create endpoints: `/api/analytics/predict-churn`, `/api/analytics/predict-psn-trajectory`, `/api/analytics/forecast-commission`
  - Store predictions in database with confidence scores
- Dashboard integration: show predictions in Members and PSN views

**Deliverable:** 3 prediction endpoints + dashboard widgets  
**Acceptance:** Models trained on seeded + real data, predictions update daily, API tests pass

---

### Task 3.4: Performance Optimization & Load Testing
**Effort:** 12 hours  
**Priority:** P2 — Scale preparation  
**Dependencies:** Task 3.1 (D1 production)  
**Owner:** backend-dev + devops

**Specific Work:**
- Load testing with k6:
  - Simulate 100 concurrent users hitting key endpoints
  - Test scenarios: dashboard load, member queries, habit check-ins
  - Measure: response time <200ms for 95th percentile, error rate <0.1%
- Identify bottlenecks: DB queries, memory leaks, slow routes
- Optimize:
  - Add database indexes on frequently queried columns (member_id, date, psn_id)
  - Implement caching layer (Redis or Cloudflare KV) for PSN health calculations
  - Paginate large list endpoints (members, alerts)
  - Compress responses (gzip)
- Monitor Cloudflare Workers CPU/time limits (10ms per request on free tier)

**Deliverable:** Load test report + optimization patches  
**Acceptance:** k6 tests pass SLA targets, no memory leaks, <10ms CPU per request avg

---

### Task 3.5: Security Audit & Penetration Testing
**Effort:** 10 hours  
**Priority:** P0 — Compliance & safety  
**Dependencies:** Task 3.1 (production deployment)  
**Owner:** security-engineer

**Specific Work:**
- Automated security scan:
  - `npm audit` — fix vulnerable dependencies
  - OWASP ZAP baseline scan — test for XSS, SQLi, CSRF, auth bypass
- Manual penetration testing:
  - Test JWT token handling: expired tokens, algorithm confusion, weak secrets
  - Test RBAC: verify role enforcement on all protected routes
  - Test input validation: injection attempts in all POST bodies
  - Test rate limiting (if implemented) — brute force login, DDoS simulation
- Secrets scanning: ensure no hardcoded API keys, passwords, JWT secrets
- Fix all high/critical findings
- Generate security report: `reports/security/penetration-test-report.md`

**Deliverable:** Security audit report + fixes  
**Acceptance:** 0 high/critical vulnerabilities, all medium findings addressed or documented as accepted risk

---

### Task 3.6: Prepare Production Deployment Checklist
**Effort:** 4 hours  
**Priority:** P1 — Go-live readiness  
**Dependencies:** Task 3.1-3.5 complete  
**Owner:** devops-worker

**Specific Work:**
- Create `docs/production-deployment-checklist.md`:
  - Domain configuration (training.phungsu.vn or custom)
  - Cloudflare Pages production branch deployment settings
  - Cloudflare Workers production environment variables
  - D1 database backup/restore procedures
  - Monitoring setup: Sentry project configured, Zalo webhook tested
  - CI/CD pipeline: main branch → auto-deploy to production
  - Rollback procedure: previous version rollback via wrangler
  - Post-deployment verification: smoke tests, health checks, dashboard loading
- Document incident response procedures in RUNBOOK for production issues

**Deliverable:** `docs/production-deployment-checklist.md`  
**Acceptance:** Checklist covers all deployment steps, verified by DevOps

---

## DEPENDENCY GRAPH

```
IMMEDIATE (Days 1-7)
├─ Task 1.1 ─┬─> T-024 complete
├─ Task 1.2 ─┼─> T-025 directory ready
├─ Task 1.3 ─┤
├─ Task 1.4 ─┤
├─ Task 1.5 ─┼─> T-025 artifacts complete
├─ Task 1.6 ─┬─> T-021 deployment ready
├─ Task 1.7 ─┘
└─ All tasks ─┬─> Pilot launch readiness (partial)

SHORT-TERM (Days 8-30)
├─ Task 2.1 ─┬─> T-019 E2E complete
├─ Task 2.2 ─┼─> T-022 monitoring verified
├─ Task 2.3 ─┤
├─ Task 2.4 ─┼─> Quality gate passed
├─ Task 2.5 ─┘
└─ All tasks ─┬─> MVP quality complete

MEDIUM-TERM (Days 31-90)
├─ Task 3.1 ─┬─> Production persistence
├─ Task 3.2 ─┼─> Beyond MVP content
├─ Task 3.3 ─┤
├─ Task 3.4 ─┼─> Scale ready
├─ Task 3.5 ─┤
└─ Task 3.6 ─┴─> Production deployment ready
```

**Critical Path:** Task 1.6 (Cloudflare Pages) → Task 1.7 (Sentry) → Task 2.1 (E2E) → Task 3.1 (D1 migration) → Task 3.6 (production deploy)

---

## RESOURCE ALLOCATION

**Workers needed:**
- content-worker: 2 tasks (1.1, 2.5) — 10 hours
- ops-worker: 3 tasks (1.2, 1.3, 1.4, 1.5) — 8 hours
- devops-worker: 2 tasks (1.6, 1.7) — 5 hours
- backend-dev: 1 task (3.1) — 16 hours
- data-scientist: 1 task (3.3) — 20 hours
- security-engineer: 1 task (3.5) — 10 hours
- tester: 2 tasks (2.1, 2.4) — 14 hours

**Total effort:** ~83 hours across 3 phases  
**Parallel capacity:** With 3 workers, can complete Phase 1 in 2-3 days, Phase 2 in 2-3 weeks, Phase 3 in 6-8 weeks.

---

## RISK REGISTER (Updated)

| Risk ID | Category | Description | Likelihood (1-5) | Impact (1-5) | Risk Score | Mitigation |
|---------|----------|-------------|------------------|--------------|-------------|------------|
| R001 | Technical | Cloudflare Pages + Workers deployment mismatch (frontend/backend separation) | 4 | 4 | 16 | Task 1.6 resolves; test full deployment before pilot |
| R002 | Technical | D1 migration incomplete by launch deadline | 3 | 5 | 15 | Prioritize D1 in Phase 3; if delayed, document data loss risk and plan hot migration |
| R003 | Operational | Pilot launch checklist artifacts missing (no directory) | 2 | 4 | 8 | Task 1.2 creates directory immediately; low likelihood given dedicated task |
| R004 | Quality | E2E test coverage insufficient (supertest only, no Playwright) | 3 | 3 | 9 | Task 2.1 adds Playwright; if time constrained, document as known gap |
| R005 | Security | Hardcoded JWT_SECRET in code or environment | 4 | 4 | 16 | Task 3.5 audits and rotates secrets; enforce env var usage |
| R006 | Content | Tier 2 content incomplete (beyond MVP scope) | 2 | 2 | 4 | Phase 3 explicitly marks as "beyond MVP"; defer if resources constrained |
| R007 | Monitoring | Sentry stub not replaced with real integration | 3 | 3 | 9 | Task 1.7 forces real integration; test with DSN set |
| R008 | Documentation | README exceeds 30-line requirement, not concise | 4 | 2 | 8 | Task 1.1 directly addresses; simple rewrite |
| R009 | Infrastructure | Cloudflare free tier limits exceeded during pilot (100K req/day, 10ms CPU) | 3 | 4 | 12 | Load testing in Task 3.4; if exceeded, upgrade to paid plan |
| R010 | Business | Pilot participants not available (recruitment failure) | 2 | 5 | 10 | Coordinate with PHỤNG SỰ 100 ĐỘ C leadership; have backup candidates ready |

---

## SUCCESS METRICS

**Immediate Phase Completion (Day 7):**
- [ ] README.md ≤ 30 lines, bilingual
- [ ] `plans/launch/` directory exists with 3+ artifacts
- [ ] Go/no-go checklist (15 items) complete
- [ ] Zalo kick-off draft complete
- [ ] Day-0 snapshot captured
- [ ] Cloudflare Pages deployment configured and tested
- [ ] Sentry real integration working

**Short-Term Completion (Day 30):**
- [ ] Playwright E2E test suite passing
- [ ] Zalo webhook verified functional
- [ ] Development roadmap and changelog updated
- [ ] Test coverage ≥70% all metrics
- [ ] Admin training materials complete (2 docs)

**Medium-Term Completion (Day 90):**
- [ ] D1 migration complete, data persistent
- [ ] Tier 2 content (M5-M8) created
- [ ] ML-based predictions API deployed
- [ ] Performance SLA met (<200ms 95th percentile)
- [ ] Security audit: 0 high/critical findings
- [ ] Production deployment checklist complete
- [ ] Pilot launched with 10 Tân Binh, graduation tracking enabled

**Business Success (Pilot):**
- [ ] 10 Tân Binh onboarded and active
- [ ] Habit score ≥4 achieved by ≥60% of pilot within 4 weeks
- [ ] At least 1 member places first order (3 orders required for graduation)
- [ ] PSN leaders successfully using dashboard and responding to alerts
- [ ] Zero data loss incidents during pilot
- [ ] Positive feedback from pilot participants (survey ≥4/5 avg)

---

## UNRESOLVED QUESTIONS

1. **Cloudflare deployment target:** Is the plan to use Cloudflare Pages (static frontend) + Workers (API) as separate services, or all-in-one Workers with dashboard static assets? Current wrangler.toml uses Workers only. Task 1.6 must clarify and configure accordingly.

2. **Zalo webhook actual status:** The codebase has Zalo references but integration may not be live. Need to verify with PHỤNG SỰ 100 ĐỘ C whether Zalo OA is configured and what the webhook endpoint/format is. If not, document as pending.

3. **Pilot participant recruitment:** Who is responsible for recruiting the 10 Tân Binh? Is that internal team or external? Need owner and timeline to ensure launch can proceed after technical readiness.

4. **Tier 2 content ownership:** Is there a curriculum expert available to create M5-M8 content? If not, need to allocate resource or defer to post-launch.

5. **Production domain:** What is the actual domain to use? Need to purchase/configure domain and set up Cloudflare DNS before production deployment (Task 3.6).

6. **Sentry project setup:** Has a Sentry project been created? Need DSN for production. If not, create Sentry account and project before Task 1.7.

7. **ML prediction models:** The requirement for ML-based predictions (Task 3.3) may be beyond current team capabilities. Should we defer or use simpler rule-based predictions instead? Need user input on whether this is essential for scale phase.

8. **Budget for Cloudflare paid tier:** If free tier limits exceeded, need budget approval for paid plan ($5-$25/month). Confirm before load testing (Task 3.4).

---

## NEXT ACTIONS

1. **Approve this revised plan** — review and confirm priorities, resource allocation, and timeline
2. **Assign workers** to each task (content-worker, ops-worker, devops-worker, backend-dev, tester, security-engineer)
3. **Start Phase 1 immediately** — Task 1.1 (README rewrite) has no dependencies, can begin today
4. **Schedule kick-off meeting** with all assigned workers to clarify dependencies and handoffs
5. **Set up daily standups** (15 min) during Phase 1 to unblock quickly
6. **Create GitHub issues** from each task if using project tracking

---

## APPENDICES

### Appendix A: Task Ownership Matrix

| Task | Primary Owner | Backup Owner | Effort (h) | Phase |
|------|---------------|--------------|------------|-------|
| 1.1 | content-worker | ops-worker | 2 | Immediate |
| 1.2 | ops-worker | devops-worker | 1 | Immediate |
| 1.3 | ops-worker | content-worker | 3 | Immediate |
| 1.4 | ops-worker | content-worker | 2 | Immediate |
| 1.5 | ops-worker | content-worker | 2 | Immediate |
| 1.6 | devops-worker | backend-dev | 3 | Immediate |
| 1.7 | devops-worker | backend-dev | 2 | Immediate |
| 2.1 | tester | backend-dev | 8 | Short-term |
| 2.2 | devops-worker | ops-worker | 4 | Short-term |
| 2.3 | content-worker | ops-worker | 2 | Short-term |
| 2.4 | tester | backend-dev | 6 | Short-term |
| 2.5 | content-worker | ops-worker | 4 | Short-term |
| 3.1 | backend-dev | devops-worker | 16 | Medium-term |
| 3.2 | content-team | content-worker | 24 | Medium-term |
| 3.3 | data-scientist | backend-dev | 20 | Medium-term |
| 3.4 | backend-dev | devops-worker | 12 | Medium-term |
| 3.5 | security-engineer | backend-dev | 10 | Medium-term |
| 3.6 | devops-worker | ops-worker | 4 | Medium-term |

**Total:** 83 hours (excluding parallelization)

---

### Appendix B: Definition of Done (DoD)

Each task must meet:
- [ ] Acceptance criteria explicitly met (documented with evidence)
- [ ] Code changes committed to git with conventional commit message
- [ ] Tests added/updated and passing (if applicable)
- [ ] Documentation updated (README, RUNBOOK, or new file created)
- [ ] Reviewed by at least one other team member (code-review or doc review)
- [ ] Deployed to staging environment (if production-impacting)
- [ ] Verified via manual testing or automated test

---

### Appendix C: Committed Files (Must Not Be Modified)

These files are reference artifacts and should not be altered by this plan:
- `README.md` (will be replaced/overwritten by Task 1.1)
- `RUNBOOK.md` (will be updated by Task 2.2)
- `docs/` directory (will be updated by Task 2.3, 2.5, 3.6)
- `wrangler.toml` (will be updated by Task 1.6)
- `src/utils/monitoring.js` (will be updated by Task 1.7)
- `package.json` (may be updated by Task 1.7)

---

**Plan Version:** 2.0 (Revised)  
**Status:** Ready for execution  
**Next Review:** After Phase 1 completion (Day 7)
