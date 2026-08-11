# Brainstorm: Funnel OS Next Steps
**Date:** 2026-07-02 | **Based on:** bootstrap-funnel-os-260701-2352-complete-report.md

---

## Current State (What's Working)

| Component | Status | Details |
|-----------|--------|---------|
| Worker API | ✅ v1.1.0 | 20 DB tables, Cloudflare Workers |
| Product Catalog | ✅ | 6 products, 5 tiers (magnet→continuity) |
| Lead Capture | ✅ | Public POST, admin GET list |
| Orders | ✅ | Create with auto-commission |
| Commission Batch | ✅ | Processes 46 records, cron ready |
| Dashboard | ✅ | Cloudflare Pages deployed |
| Auth | ✅ | JWT, rate limiter |
| KPI Leaderboard | ✅ | Batch JOIN, no N+1 |
| Alerts | ✅ | 6 rules, D1 persistence |
| PSN Health | ✅ | 9-state classifier |

---

## Brainstorm: What's Missing for Full Funnel

### Tier 1: Quick Wins (1-2 days, $0)

1. **Order List API** — Admin view all orders with filters
   - `GET /api/orders` — list with status/date filters
   - `GET /api/orders/:id` — order detail with items
   - Impact: Admin can track sales

2. **Lead Detail API** — View single lead with journey events
   - `GET /api/leads/:id` — lead detail
   - `GET /api/leads/:id/journey` — journey events
   - Impact: CTV can see lead progress

3. **Funnel Metrics API** — Conversion rates L0→L1→L2→L3→L4
   - `GET /api/analytics/funnel` — conversion rates, revenue by level
   - Impact: Dashboard can show funnel health

4. **Lead Assignment** — Assign lead to CTV
   - `PATCH /api/leads/:id` — update assigned_ctv_id, status
   - Impact: CTV gets notified of new leads

### Tier 2: Conversion Flow (3-5 days, $0)

5. **Quiz/Landing Page** — L0 capture with intent scoring
   - Simple HTML page with quiz form
   - Auto-calculate intent_score from answers
   - Impact: Higher quality leads

6. **Coach Chat UI** — L0→L1 AI conversation
   - Simple chat interface in dashboard
   - Calls existing coach_sessions API
   - Impact: Automated qualification

7. **Order Status Updates** — Mark paid, track fulfillment
   - `PATCH /api/orders/:id` — update status
   - Webhook for payment confirmation
   - Impact: Order lifecycle tracking

### Tier 3: Scale (1-2 weeks, $0-$500K pitch)

8. **Payment Integration** — PayOS/Casso
   - QR code generation
   - Webhook for payment confirmation
   - Impact: Real revenue flow

9. **Zalo OA Webhook** — Auto-reply, broadcast
   - Receive messages from Zalo
   - Send automated responses
   - Impact: 80% automation of CTV work

10. **Content Warfare** — Auto content generation
    - Spy Scout (trending topics)
    - Script Writer (LLM + templates)
    - Video Dispatcher (KC/Sophia)
    - Impact: 90 videos/month → 1.35B VND revenue

---

## Recommended Next: Tier 1 (Quick Wins)

**Why:** 4 endpoints, 1 day, $0, unlocks:
- Admin can see orders → proves revenue
- Funnel metrics → proves conversion
- Lead assignment → proves CTV workflow

**Order:**
1. Order list API (30 min)
2. Lead detail API (20 min)
3. Funnel metrics API (45 min)
4. Lead assignment (20 min)

**Total: ~2 hours dev, deploy, smoke test**

---

## Decision Matrix

| Option | Effort | Cost | Revenue Impact | Priority |
|--------|--------|------|----------------|----------|
| Tier 1 Quick Wins | 2h | $0 | Admin visibility | P0 |
| Tier 2 Conversion | 3-5d | $0 | Lead→Sale flow | P1 |
| Tier 3 Scale | 1-2w | $0 | Full automation | P2 |
| Content Warfare | 6h | $0 | 1.35B VND/mo | P1 |

**Recommendation: Tier 1 NOW → Tier 2 next week → Tier 3 for pitch**
