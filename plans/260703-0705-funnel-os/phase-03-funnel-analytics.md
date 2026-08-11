# Phase 3: Funnel Analytics API

**Priority:** P1 — Powers funnel-view.js
**Status:** pending
**Files to create:** `src/api/analytics-funnel.js`

## API Endpoints

| Method | Path | RBAC | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/funnel` | Auth | 5-tier counts + conversion rates + revenue |
| GET | `/api/analytics/funnel/stats` | Auth | Time-in-stage avg, drop-off rates |
| POST | `/api/analytics/funnel/export` | PSN Leader+ | CSV export of funnel data |

## Response Shapes

### GET /api/analytics/funnel
```json
{
  "counts": [
    { "tier": 0, "name": "Lead Magnet", "count": 120 },
    { "tier": 1, "name": "Trial", "count": 85 }
  ],
  "rates": [
    { "from_tier": 0, "to_tier": 1, "conversion_rate": 70.8, "from_count": 120, "to_count": 85 }
  ],
  "revenue": [
    { "tier": 3, "tier_name": "Combo", "order_count": 45, "revenue": 22500000 }
  ]
}
```

### GET /api/analytics/funnel/stats
```json
{
  "avgTimeInStage": [
    { "tier": 0, "avgDays": 3.2 },
    { "tier": 1, "avgDays": 7.5 }
  ],
  "dropoffRates": [
    { "tier": 0, "dropoffPct": 15.3 }
  ],
  "topPerformers": [
    { "ctvId": "xxx", "name": "CTV A", "convertedCount": 45 }
  ]
}
```

## Implementation Steps

1. Count leads per funnelLevel with `Array.filter().length`
2. Compute conversion: `nextTierCount / currentTierCount * 100`
3. Revenue: sum of orders where `leadId` matched (mock for now, real when Orders module lands)

## Todo List

- [ ] GET /api/analytics/funnel — tier counts + rates + revenue
- [ ] GET /api/analytics/funnel/stats — avg time, drop-off, top performers
- [ ] POST /api/analytics/funnel/export — CSV export
- [ ] RBAC scoping mirror leads.js

## Success Criteria
- Returns tierLabels matching frontend: `['Lead Magnet','Trial','Health Active','Combo','CTV Partner']`
- Frontend funnel-view.js renders without error
