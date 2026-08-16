# 12_CHANGELOG

## Changelog

All notable changes to droppii-training-os will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.1] - 2026-08-16

### Added
- E2E smoke hardening: training, leads, orders, monitoring endpoints
- CI coverage enforcement: thresholds 70/60/60/70 (statements/branches/functions/lines)
- Cloudflare deploy secrets guide
- Monitoring endpoint verification

### Fixed
- Route shadowing bug in kpi.js (leaderboard unreachable)

---

## [1.1.0] - 2026-07-21

### Added
- **Leads Management API** (src/api/leads.js): 8 REST endpoints with full RBAC
  - GET /api/leads — list with filters (status, tier, assigned_to, pagination)
  - POST /api/leads — create lead with validation
  - PATCH /api/leads/:id — update lead status/fields
  - DELETE /api/leads/:id — delete lead (Admin only)
  - GET /api/leads/journey/:lead_id — full activity timeline
  - POST /api/leads/assign — assign lead to member
  - POST /api/leads/:id/transition — state machine transitions
  - POST /api/leads/:id/note — add note to lead journey
- **Funnel Analytics API** (src/api/analytics-funnel.js): 3 endpoints
  - GET /api/analytics/funnel — stage conversion funnel with counts
  - GET /api/analytics/funnel/stats — aggregate funnel metrics (conversion rates, stage velocity)
  - GET /api/analytics/funnel/export — CSV export of funnel data
- **Health & Monitoring Endpoints** wired in src/server.js:
  - GET /health — basic health check with build SHA
  - GET /ready — readiness probe
  - GET /metrics — Prometheus-format metrics
  - GET /api/monitoring/errors — error log (Admin)
  - GET /api/monitoring/summary — error summary (Admin)
- **Test Environment Configuration** (test/setup.js):
  - ENCRYPTION_KEY='test-encryption-key-32-bytes-long!!'
  - ALLOWED_ORIGIN='http://localhost:3000,http://localhost:3001'
- **CI Pipeline** (.github/workflows/ci.yml): 7-job pipeline
  - lint — ESLint + Prettier
  - test — Jest with coverage (currently skipped via --no-coverage)
  - build-dashboard — Vite production build
  - verify-backend — Worker syntax + health endpoint test
  - e2e-smoke — Playwright login + dashboard smoke test
  - deploy-preview — Cloudflare Pages preview deployment
  - deploy-production — Cloudflare Workers/Pages production (manual approval)
- **Launch Documentation** (plans/launch/):
  - pilot-go-no-go-checklist.md — 15-item checklist with verification methods and evidence paths
  - kick-off-zalo-draft.md — 498-char Zalo OA message template with 6 placeholders + mail-merge script
  - day-0-dashboard-snapshot.md — 5-view screenshot capture guide with seeded data expectations

### Changed
- **Seed Script** (scripts/seed.js): Fixed to require ENCRYPTION_KEY and ALLOWED_ORIGIN env vars
- **Source maps** enabled in CI for better error tracing
- **Artifact retention** configured (30 days for build artifacts, 7 days for test reports)
- **Test coverage threshold** documented as known gap (~50% vs 70% target)

### Fixed
- **Test environment failures**: Added missing ENCRYPTION_KEY and ALLOWED_ORIGIN to test/setup.js — all 131 tests now pass
- **CORS configuration**: ALLOWED_ORIGIN now includes both API (3000) and Dashboard (3001) origins
- **Seed script idempotency**: Safe to re-run without duplicates

### Security
- RBAC enforced on all 8 leads endpoints (requireRole: Admin, Core Leader, PSN Leader)
- RBAC enforced on all 3 funnel analytics endpoints (requireRole: Admin, Core Leader)
- JWT authentication required for all API routes

### Known Issues
- **Test coverage**: Currently ~50% (statements), below 70% threshold. Uncovered: src/api/auth.js, src/api/habits.js, src/api/kpi.js, src/api/leads.js, src/api/analytics-funnel.js
- **CI coverage enforcement**: Currently disabled via --no-coverage flag in .github/workflows/ci.yml
- **Production secrets**: Cloudflare Workers/Pages require CF_API_TOKEN, CF_ACCOUNT_ID, JWT_SECRET, PASSWORD_SALT in GitHub secrets

---

## [1.0.0] - 2026-06-23

### Added
- **Authentication & RBAC** (T-001): JWT auth with 4 roles (Admin, Core Leader, PSN Leader, Member), POST /auth/login, role middleware
- **Member CRUD + PDPA Encryption** (T-002): Full CRUD with AES-256 encryption for PII (email, phone), audit logging on decrypt
- **Habit Tracker Engine** (T-003): 6-point daily scoring (wakeUp5am, connects, zoomAttend, kaizenJournal), streak logic, midnight snapshot cron
- **KPI Rollup Engine** (T-004): connects/day, follow-ups/day, first-order-14d with tier-specific targets (Tier 1/2/3), RED/YELLOW/GREEN status
- **PSN Health Classifier** (T-005): Cửu Địa 9-state model (Tử Địa → Tán Địa), weighted scoring, critical overrides
- **Alert Rules Engine** (T-006): 6 seeded rules (retention_guard, habit_guard, activity_guard, revenue_guard, connect_guard, psn_health_guard)
- **Dashboard Shell** (T-007): Vite + Vanilla JS, dark luxury theme (gold #C9A200), 6 routes, responsive, Lighthouse a11y ≥ 90
- **Members Table View** (T-008): Filterable/sortable table, tier/PSN/status chips, virtualized rendering
- **KPI Tracker Panel** (T-009): Per-member cards + team aggregate, sparklines, drill-down modal
- **PSN Health View** (T-010): 9-state Cửu Địa heat map, Vietnamese labels, trajectory, buddy-assignment CTA
- **Alerts Inbox** (T-011): Grouped by severity, ACK button with audit trail
- **Tier-1 Curriculum** (T-012 to T-015): 4 modules × 7 days = 28 lessons (Vietnamese, ~400 words each)
  - M1: Mindset Reset — 5AM Club
  - M2: Product Mastery — Droppii ecosystem
  - M3: Connect Engine — 15 connects/day framework
  - M4: First Close — follow-up sequences
- **Onboarding Bot** (T-016): 4-week state machine (W1-mindset → W2-product → W3-connect → W4-close), daily Zalo-ready nudges
- **Training Ops Agent** (T-017): Auto-assign curriculum by tier, progress tracking, reminder scheduler
- **Test Harness** (T-018): Jest + supertest, 131 tests covering happy + 4xx paths
- **E2E Smoke Test** (T-019): Playwright login → members table → logout
- **Seed Data** (T-023): 10 pilot members across 2 PSNs, 14-day habit/KPI history, varied health states
- **Admin README + Runbook** (T-024): Setup/run/deploy in ≤20 lines, incident playbooks (DB down, API 500, Zalo webhook fail)

### Changed
- **Architecture**: Migrated from Express to Cloudflare Workers + D1 (serverless, edge)
- **Database**: Cloudflare D1 (SQLite) with 10 tables, proper indexes
- **Deployment**: wrangler.toml configured for Workers + Pages

### Fixed
- Various test flakiness resolved
- CORS configuration for dual-origin dev (API 3000 + Dashboard 3001)

---

## Versioning Scheme

- **Major (X.0.0):** Breaking changes, architectural shifts
- **Minor (X.Y.0):** New features, backward-compatible
- **Patch (X.Y.Z):** Bug fixes, minor improvements

---

## Release Process

1. Update this changelog before release
2. Update version numbers in:
   - `package.json`
   - `mekong.config.yaml`
   - `docs/01_GOAL.md`
3. Create git tag: `git tag -a v1.1.0 -m "Release v1.1.0"`
4. Push tag: `git push origin v1.1.0`
5. Update deployment (if applicable)

---

## Changelog Categories

- **Added:** New features
- **Changed:** Modifications to existing functionality
- **Deprecated:** Soon-to-be-removed features
- **Removed:** Removed features
- **Fixed:** Bug fixes
- **Security:** Security patches

---

*Keep this file updated with each release. Use conventional commit messages to track changes.*