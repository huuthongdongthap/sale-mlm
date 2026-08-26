# Go-Live Readiness Audit — Droppii Sales Training OS (Hive Warfare Academy)

## Executive Summary

**Status: CONDITIONAL HOLD** — Production deploy blocked by 2 critical gaps + coverage gate failure. Core functionality is wired and tests pass, but referral/leaderboard persistence, the staging/prod D1 collision, and sub-threshold test coverage must be resolved before pilot launch (T-025).

| Gate | Status | Detail |
|------|--------|--------|
| Test suite | ✅ PASS | 231/231 (14 suites), ~3-5s runtime |
| Coverage thresholds | ❌ FAIL | Statements 57.8% (need 70%), Branches 47.9% (need 60%), Functions 55.3% (need 60%) |
| Migrations | ✅ PASS | 0001–0008 present in `/migrations/` |
| Route wiring | ⚠️ PARTIAL | Referral + leaderDashboard NOT mounted in server.js |
| Storage persistence | ⚠️ GAP | Referrals + webhooks in-memory only |
| Env/config | ⚠️ GAP | Staging + prod share same D1 database_id |
| External blockers | ❌ BLOCKED | CF secrets, custom domains, Sentry/Zalo (operator-side) |

---

## Coverage Threshold Analysis

Per `jest.config.js` global thresholds:

| Metric | Actual | Threshold | Status |
|--------|--------|-----------|--------|
| Statements | 57.8% (1118/1934) | ≥70% | ❌ Fail |
| Branches | 47.9% (691/1442) | ≥60% | ❌ Fail |
| Functions | 55.3% (209/378) | ≥60% | ❌ Fail |
| Lines | 60.7% (1010/1664) | — | — |

**CI gate:** `.github/workflows/ci.yml` → `test` job requires `lint` first (lint passes via noop `echo`). Coverage gate is enforced by Jest config directly.

---

## Phase Completion Status

Per `plans/master-completion-plan.md` (claims 25/25, 27/27 audit):

| Phase | Status | Evidence |
|-------|--------|----------|
| Phase 1 (E11) | ✅ Done | Documented baseline |
| Phase 2 (T-026..T-032) | ✅ Done | Multi-tenant + org isolation |
| Phase 3 | ⚠️ Partial | Tasks 1-7 complete per `plans/260816-2140-phase3-production-scale/plan.md`; Task 6 (compliance pack) + Task 7 (deploy checklist) done. Worker bridge via Hono adapter closed the route-gap. |
| Pilot (T-025) | ❌ OPEN | Sole unchecked item in README.md |

---

## Critical Findings (Risk-Ranked)

### 🔴 CRITICAL-1: Coverage Gate Failure

**File:** `jest.config.js:15-19`
**Risk:** CI/CD blocks every PR; go-live checklist success criteria ("npm test ≥70% coverage") unmet.
**Detail:** Statements at 57.8%, branches at 47.9%, functions at 55.3% — all below Jest thresholds.

### 🔴 CRITICAL-2: Referral + Leader Dashboard Unwired

**File:** `src/server.js` (lines 244-248, 486-487)
**Risk:** /referral/* and /scaling/* endpoints return 404 in production.
**Detail:**
- `src/features/referral.js` — uses **in-memory arrays** (`const referrals = []; const rewards = []`) despite `src/db/local-adapter/referrals.js` exporting `ReferralsOps` (used nowhere by referral.js).
- `src/features/leaderDashboard.js` — Express router with `/referral/*`, `/scaling/progress` (HARDCODED: current_members=10, target=50, progress=20%) — **not mounted** in server.js.
- `grep` for `leaderDashboard` or `referral` in server.js → only `/api/leads`, `/api/orders` appear; referral/leaderboard dead routes.

**Fix path:** Mount `leaderDashboard` router + migrate `referral.js` from arrays to `ReferralsOps` adapter.

### 🟡 HIGH: In-Memory Webhook Subscriptions

**File:** `src/server.js` (in-memory `webhookSubscriptions` array)
**Risk:** Webhook registrations lost on Worker restart / cold start.
**Detail:** No persistence to D1 for `webhookSubscriptions`. Documented in RUNBOOK as in-memory scaling limit.

### 🟡 HIGH: Staging/Prod D1 Collision

**File:** `wrangler.toml` (lines 14-17, 39-46, 54-61)
**Risk:** Staging seed data overwrites production data (and vice versa).
**Detail:**
```
[env.staging.d1_databases] database_id = "def140e1-c5bb-48e5-a79f-e9368321c9d0"
[env.production.d1_databases] database_id = "def140e1-c5bb-48e5-a79f-e9368321c9d0"
```
Both environments share the SAME D1 database id.

### 🟡 MEDIUM: Worker Route Gap (Partially Closed)

**File:** `src/workers/index.js` → `src/workers/express-adapter.js` (ADR 004)
**Status:** Closed per Task 7 follow-up. Hono bridges Express app. Verified endpoints: `/health` 200, `/api/members` 401, `/api/alerts/rules` 200, `/api/compliance/report` 200/403/401.

---

## External Blockers (Operator-Side)

Per `plans/260816-2140-phase3-production-scale/plan.md` Task 7 + `plans/launch/pilot-go-no-go-checklist.md`:

| Item | Status | Owner |
|------|--------|-------|
| Cloudflare secrets (JWT_SECRET, ENCRYPTION_KEY, ALLOWED_ORIGIN, SENTRY_DSN, ZALO_ALERT_WEBHOOK) | ❌ Pending | Operator |
| Custom domains (api.droppii.vn, hive.droppii.vn) | ❌ Pending DNS | Operator |
| Sentry DSN configured | ❌ Not set | Operator |
| Zalo alert webhook | ❌ Not set | Operator |

---

## Remaining Audits to Select

Per `/audit-plan` pipeline (risk-rank → select-audits → allocate-resources):

1. **Coverage remediation audit** — Identify untested branches in `src/api/leads.js` (12.8KB, largest route file), `src/api/members.js`, `src/agents/onboardingBot.js` to push statements ≥70%.
2. **Persistence audit** — Verify `ReferralsOps` adapter wired to D1; confirm webhookSubscriptions persistence plan.
3. **Route wiring audit** — Confirm `leaderDashboard.js` mounted + `/scaling/progress` returns live data (not hardcoded).
4. **D1 isolation audit** — Split staging/prod database_ids in `wrangler.toml`.

## Resource Allocation

| Audit | Agent | Est |
|-------|-------|-----|
| Coverage remediation | `testing-expert` + developer | 4h |
| Persistence + route wiring | `fullstack-developer` | 3h |
| D1 isolation | `database-expert` | 1h |
| External blocker sync | `coo` (coordination) | — |

---

## Recommendation

**HOLD pilot launch (T-025) until:**
1. Coverage thresholds met (statements ≥70%, branches ≥60%, functions ≥60%)
2. Referral + leaderDashboard routes mounted + persistence migrated to D1
3. Staging/prod D1 split (separate database_id per environment)
4. Cloudflare secrets + domains configured by operator

---

*Compiled: 2026-08-26T00:44:00Z*
*Source: /audit-plan deep check các phase/feature cần hoàn tất để go live --auto --parallel*
*Reports path: /Users/mac/mekong-cli/SALE MLM/plans/reports/*