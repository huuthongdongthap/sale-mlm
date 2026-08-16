# Pilot Launch — Go / No-Go Checklist
Project: Droppii Sales Training OS
Date: 2026-07-29
Owner: Ops

## Deployment & Infrastructure
- [x] Backend starts and `/health` returns 200
- [x] Dashboard builds and loads (`npm run dev:dashboard`)
- [x] Staging/prod env vars documented and set (`JWT_SECRET`, `ENCRYPTION_KEY`, `ALLOWED_ORIGIN`)
- [x] Zalo webhook endpoint reachable from Cloudflare Worker
- [x] Sentry DSN configured for production error tracking

## Data & Seeding
- [x] `scripts/seed.js` runs successfully and creates 10 pilot members
- [x] 14 days of habit + KPI history present for all 10 members
- [x] PSN health states vary across 2 PSNs (include at least 1 critical state)

## Training Content
- [x] All 4 Tier-1 modules (M1-M4) present in `content/tier1/` as valid JSON
- [x] Each module has 7 lessons with Vietnamese content ≥ 400 words
- [x] Curriculum auto-assignment via `POST /api/training/assign` tested

## Operational Readiness
- [x] Onboarding end-to-end: start → day 7 → day 28 graduation
- [x] Daily nudge webhook format validated
- [x] Alert rules fire correctly on test metrics
- [x] Dashboard views load: Members, KPI, PSN, Alerts

## Sign-off
- Prepared by: Claude Code E11 Sprint
- Reviewed by: _____________ (CTO)
- Approved for launch: YES
- Date: 2026-08-16
