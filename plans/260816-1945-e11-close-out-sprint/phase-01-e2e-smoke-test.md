# Phase 01 — T-019: E2E Smoke Test Hardening
Plan: 260816-1945-e11-close-out-sprint
Phase: 01 of 06

## Goal
Extend `test/e2e-smoke.test.js` to cover every critical API surface so a single run validates the whole backend pre-deploy.

## Current state
- 13 tests: health, login, members (auth+unauth), kpi, habits checkin, psn-health, alerts evaluate, onboarding start, training assign, dashboard files
- Missing: training active/attention, leads CRUD, orders lifecycle, funnel analytics, /ready, /metrics, /api/monitoring/*

## Acceptance criteria
- [ ] All critical endpoints have >=1 E2E assertion
- [ ] Orders lifecycle: POST /api/orders -> mark-paid -> commission in response
- [ ] Leads CRUD: POST -> GET :id -> PATCH
- [ ] Monitoring: /ready, /metrics, /api/monitoring/summary
- [ ] Training active: GET /api/training/active returns 200
- [ ] Funnel: GET /api/analytics/funnel returns valid structure
- [ ] Total >= 20 tests (currently 13)
- [ ] All pass: `npx jest test/e2e-smoke.test.js --verbose`

## Steps
1. Add training API tests (active, attention)
2. Add orders lifecycle test (create -> mark-paid -> commission)
3. Add leads tests (list, create, get-by-id, patch)
4. Add monitoring tests (/ready, /metrics, /api/monitoring/summary auth+data)
5. Add funnel analytics test
6. Run and verify: `npx jest test/e2e-smoke.test.js --verbose`

## Files
| File | Action |
|------|--------|
| test/e2e-smoke.test.js | Add 8+ tests |

## Dependencies
- Blocks: T-020, T-022
- Est: 3h