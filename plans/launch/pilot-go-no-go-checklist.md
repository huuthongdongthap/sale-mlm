# Pilot Launch — Go / No-Go Checklist
Project: Droppii Sales Training OS
Date: 2026-07-29
Owner: Ops

## Deployment & Infrastructure
- [ ] Backend starts and `/health` returns 200
- [ ] Dashboard builds and loads (`npm run dev:dashboard`)
- [ ] Staging/prod env vars documented and set (`JWT_SECRET`, `ENCRYPTION_KEY`, `ALLOWED_ORIGIN`)
- [ ] Zalo webhook endpoint reachable from Cloudflare Worker
- [ ] Sentry DSN configured for production error tracking

## Data & Seeding
- [ ] `scripts/seed.js` runs successfully and creates 10 pilot members
- [ ] 14 days of habit + KPI history present for all 10 members
- [ ] PSN health states vary across 2 PSNs (include at least 1 critical state)

## Training Content
- [ ] All 4 Tier-1 modules (M1-M4) present in `content/tier1/` as valid JSON
- [ ] Each module has 7 lessons with Vietnamese content ≥ 400 words
- [ ] Curriculum auto-assignment via `POST /api/training/assign` tested

## Operational Readiness
- [ ] Onboarding end-to-end: start → day 7 → day 28 graduation
- [ ] Daily nudge webhook format validated
- [ ] Alert rules fire correctly on test metrics
- [ ] Dashboard views load: Members, KPI, PSN, Alerts

## Sign-off
- Prepared by: _____________ Date: ___
- Reviewed by: _____________ Date: ___
- Approved for launch: YES / NO
