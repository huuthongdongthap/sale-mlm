# Phase 7: Frontend Integration Test

**Priority:** P2 — Validate end-to-end flow  
**Status:** pending

## Frontend Files (already exist, no changes needed)

| File | Consumes |
|------|---------|
| `src/dashboard/leads-view.js` | `GET /api/leads`, `PATCH /api/leads/:id` |
| `src/dashboard/funnel-view.js` | `GET /api/analytics/funnel` |

## Backend Files (to be created)

| File | Endpoints |
|------|-----------|
| `src/api/leads.js` | 8 endpoints |
| `src/api/analytics-funnel.js` | 3 endpoints |
| `src/models/lead.js` | In-memory store |

## Validation Checklist

- [ ] Backend starts without errors
- [ ] `GET /api/leads` returns 200 + JSON
- [ ] `GET /api/leads/:id` returns 200 + JSON
- [ ] `POST /api/leads` creates lead
- [ ] `PATCH /api/leads/:id` updates lead
- [ ] `DELETE /api/leads/:id` (admin) archives lead
- [ ] `GET /api/leads/:id/journey` returns transition log
- [ ] `POST /api/leads/:id/assign` assigns CTV
- [ ] `POST /api/leads/:id/transition` moves tier (with validation)
- [ ] `GET /api/analytics/funnel` returns tier counts + rates
- [ ] `GET /api/analytics/funnel/stats` returns avg time + dropoff
- [ ] Frontend `funnel-view.js` renders without JS errors
- [ ] Frontend `leads-view.js` loads leads table

## Todo List

- [ ] Run full checklist, fix any 500 errors
- [ ] End-to-end: create lead → assign CTV → transition tier → view in funnel-view
