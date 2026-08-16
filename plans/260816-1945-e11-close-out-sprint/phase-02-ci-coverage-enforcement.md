# Phase 02 — T-020: CI Coverage Enforcement
Plan: 260816-1945-e11-close-out-sprint
Phase: 02 of 06

## Goal
Remove --no-coverage workaround from CI and raise Jest thresholds to 70/60/60/70 (statements/branches/functions/lines).

## Current state
- jest.config.js thresholds: 25/15/15/30
- Actual coverage ~50% statements
- CI already runs `npx jest --coverage`
- Uncovered hotspots: src/api/{habits,kpi,leads,analytics-funnel,alerts,orders}.js

## Acceptance criteria
- [ ] jest.config.js coverageThreshold: 70/60/60/70
- [ ] npx jest --coverage exits 0
- [ ] Min 5 new test files for uncovered API modules
- [ ] No --no-coverage flag in CI
- [ ] All existing tests pass

## Steps
1. Audit coverage gaps: `npx jest --coverage --verbose 2>&1 | head -80`
2. Write unit tests (priority order): habits, kpi, leads, analytics-funnel, alerts, orders
3. Update jest.config.js coverageThreshold
4. Verify: `npx jest --coverage`
5. Check CI workflow: no hidden skip flags

## Files
| File | Action |
|------|--------|
| jest.config.js | Raise coverageThreshold |
| test/api-habits-jest.test.js | New |
| test/api-kpi-jest.test.js | New |
| test/api-leads-jest.test.js | New |
| test/api-analytics-funnel-jest.test.js | New |
| test/api-alerts-jest.test.js | New |
| test/api-orders-jest.test.js | New |

## Dependencies
- Requires: T-019
- Blocks: T-025
- Est: 4h