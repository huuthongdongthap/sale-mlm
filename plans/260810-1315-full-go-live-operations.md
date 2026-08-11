# Go-Live Plan — Full luồng vận hành
Started: 2026-08-06 17:32 (Asia/Saigon) | Updated: 2026-08-10 13:15 (Asia/Saigon)
Goal: verify create → markPaid → commission end-to-end + bots running + leads seeded + funnel analytics

## Fixes applied
- `src/middleware/requireRole.js` — `normalizeRole()` case-insensitive role matching + export
- `src/api/orders.js` — removed dangling `verify` middleware (was blocking forever)
- `src/api/orders.js` — added `PAYMENT_METHODS` to imports
- `src/api/leads.js` — use `normalizeRole` for role matching
- `src/api/analytics-funnel.js` — use `normalizeRole` for role matching + wire order revenue
- `.env` — added `MEMBERS_DB` + `PASSWORD_SALT`
- `src/server.js` — seed models on startup

## Verification status (all runtime verified at 2026-08-10 13:15 ICT)
1. Server :3000 healthy ✓
2. Login admin@droppii.com → token ✓
3. POST /api/orders → 201 created ✓
4. POST /api/orders/mark-paid → 200 paid, commission 225,000 VND ✓
5. Onboarding bot start → active session ✓
6. Advance day → W1-D1 completed ✓
7. Leads seeded: 16 leads across 5 tiers ✓
8. GET /api/leads returns 16 leads with tier breakdown ✓
9. GET /api/analytics/funnel/funnel returns counts + conversion rates + revenue ✓
10. Revenue integration: orders mapped to funnel tiers ✓

## Runtime verified at
2026-08-10 13:15 ICT

## Next phases (Phase 1-7 of Funnel OS)
- Phase 1: Lead seed data ✅ (loaded 16 leads)
- Phase 2: Order flow ✅ (create → markPaid → commission)
- Phase 3: Onboarding bot ✅ (start → advanceDay → nudge)
- Phase 4: Training ops (assign curriculum, track progress)
- Phase 5: Alert engine (PSN health, threshold rules)
- Phase 6: Analytics dashboards (funnel stats, top performers)
- Phase 7: Frontend integration (leads-view.js, funnel-view.js)