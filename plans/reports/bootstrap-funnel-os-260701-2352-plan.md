# Funnel OS Bootstrap — Lowest Cost → Feasibility Proof
**Date:** 2026-07-01 | **Project:** SALE MLM

---

## Strategy

Chi phí thấp nhất → chứng minh tính khả thi:
1. **Stability** ($0): Fix DB schema, add funnel tables, fix commission batch
2. **Revenue tracking** ($0): Lead capture + product catalog + order API
3. **Automation** ($0): Cron jobs + dashboard funnel view

---

## Wave 1: Stability (Fixes)

### 1.1 Fix members table
- `status` column added ✅
- Need: `leaderboard_score`, `last_kpi_calc` already in schema

### 1.2 Add funnel tables (migration 0004)
- `leads` — Lead capture từ quiz/landing
- `products` — Product catalog (5 tầng: magnet, tripwire, core, downsell, continuity)
- `orders` — Customer orders
- `order_items` — Line items
- `coach_sessions` — AI Coach 1:1 sessions

### 1.3 Fix commission batch
- Already uses `members.status` — column added ✅
- Need to verify `reward_status = 'paid'` filter works

---

## Wave 2: Revenue Tracking

### 2.1 Lead capture API
- `POST /api/leads` — Capture lead từ quiz/landing
- `GET /api/leads` — List leads (admin)
- `GET /api/leads/:id` — Lead detail

### 2.2 Product catalog API
- `GET /api/products` — List products
- `GET /api/products/:id` — Product detail
- `POST /api/products` — Create product (admin)

### 2.3 Order API
- `POST /api/orders` — Create order
- `GET /api/orders` — List orders (admin)
- `GET /api/orders/:id` — Order detail

### 2.4 Commission for funnel sales
- Extend commission engine to handle `orders` table
- Calculate commission based on `orders.ctv_referrer_id`

---

## Wave 3: Automation

### 3.1 Cron jobs
- Nightly commission batch (already in code)
- Lead nurture sequence (daily)
- Alert evaluation (hourly)

### 3.2 Dashboard funnel view
- Funnel metrics: L0→L1, L1→L2, L2→L3, L3→L4 rates
- Revenue by level
- Lead source breakdown

---

## Execution Plan

```
Wave 1: Migration 0004 + fix commission batch
  → Wave 2: API endpoints (leads, products, orders)
    → Wave 3: Cron + dashboard
```

**Total estimated: ~8-12h dev, $0 cost**
