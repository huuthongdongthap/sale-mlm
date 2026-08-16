# Phase 04 — T-022: Monitoring Verification
Plan: 260816-1945-e11-close-out-sprint
Phase: 04 of 06

## Goal
Verify all monitoring endpoints functional, documented, and E2E covered. Production-ready for pilot.

## Current state
- src/utils/monitoring.js: errorMiddleware, notFoundMiddleware, getHealthStatus, monitoring
- Endpoints in server.js: GET /health, /ready, /metrics, /api/monitoring/errors, /api/monitoring/summary
- Only /health tested in E2E
- RUNBOOK.md documents with localhost only
- No Prometheus scrape config

## Acceptance criteria
- [ ] /health: 200 + {status, service, uptime}
- [ ] /ready: 200 + readiness status
- [ ] /metrics: Prometheus-compatible text
- [ ] /api/monitoring/errors: error log array (Admin)
- [ ] /api/monitoring/summary: error summary (Admin)
- [ ] All covered in E2E smoke (shared with T-019)
- [ ] RUNBOOK.md updated with production URLs

## Steps
1. Manual curl verify each endpoint
2. Check /ready implementation in monitoring.js
3. Verify /metrics format (Prometheus text or JSON?)
4. Add E2E smoke tests (shared with T-019)
5. Update RUNBOOK.md monitoring table

## Files
| File | Action |
|------|--------|
| test/e2e-smoke.test.js | Add monitoring tests (T-019) |
| src/utils/monitoring.js | Verify /ready |
| RUNBOOK.md | Update monitoring section |

## Dependencies
- Requires: T-019
- Blocks: T-025
- Est: 2h