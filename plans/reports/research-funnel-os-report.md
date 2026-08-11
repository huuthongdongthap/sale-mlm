# MLM Funnel Management — Comprehensive Research Report
**Date:** 2026-07-03 | **Project:** SALE MLM (Droppii Training OS / Hive Warfare Academy)

---

## 1. MLM Funnel Stages

### CCFL Methodology: Connect → Consult → Follow-up → Close → Ladder Up → Duplicate

| Step | Vietnamese Term | What Happens |
|------|----------------|-------------|
| Connect | Kết nối | Warm outreach via Zalo/personal message (no cold pitch) |
| Consult | Tư vấn | Health assessment via quiz + AI coach (PSN-1 discovery) |
| Follow-up | Chăm sóc | Structured cadence: +1h, +24h, +72h, weekly |
| Close | Chốt đơn | Tripwire first, then core offer; payment via MoMo/Zalo Pay |
| Ladder Up | Nâng cấp | Upgrade to higher-tier product over 90-180 days |
| Duplicate | Nhân bản | Recruit L4 as new CTV, attach to PSN tree, assign academy |

### The 5-Tier Product-Aligned Funnel

| Level | Vietnamese | Tier Label | Product Focus | Price (VND) | Target LTV |
|-------|-----------|------------|---------------|-------------|-----------|
| **L0** | Mất Hoa (Awareness) | Lead Magnet | Free: AI Coach 1:1, ebook, mini-course, quiz | 0 | Cost-per-lead < 30K |
| **L1** | Tin (Interest) | Tripwire | Risk-free first purchase, entry product | 150K | L0→L1 ≥ 8-10% |
| **L2** | Hành (Action) | Core | 30-45 day health transformation pack | 3.5M - 8.9M | L1→L2 ≥ 18-25% |
| **L3** | Hoa (Habit) | Continuity | Combo 90+ days recurring subscription | 890K-990K/mo | L2→L3 ≥ 25-30% |
| **L4** | Hợp (Partnership) | CTV Partner | CTV contract + Academy enrollment training | 99K/yr | L3→L4 ≥ 7-15% |

### Extended 7-Stage Consideration (Future Layer)

| # | Stage | Vietnamese | Trigger to Next |
|---|-------|-----------|----------------|
| -1 | Visitor | Khách truy cập | Quiz submitted |
| 0 | Cold Prospect | Liên hệ mới | AI consult completed |
| 1 | Warm Lead | Tiềm năng | Share link clicked |
| 2 | Presented | Đã giới thiệu | Zalo message logged |
| 3 | Active Follow-up | Đang theo | Order webhook with `referred_by` match |
| 4 | Customer | Đã đặt hàng | 2nd order confirmed |
| 5 | Repeat Buyer | Mua lại | CTV application approved |
| 6 | CTV Partner | Hợp tác | Onboarding complete |

*Note: The 5-tier model (L0-L4) is the current schema; 7-stage can be layered as a "view" without breaking existing code.*

### Lead Status vs Funnel Level (Independent Axes)

| Status | Description |
|--------|-------------|
| `new` | Fresh lead, no contact made |
| `contacted` | Initial outreach sent |
| `qualified` | Interest confirmed, ready for presentation |
| `converted` | Made purchase (applies to L1, L2, L3) |
| `lost` | No contact >14 days, or explicit rejection |

A lead at L2 can have status "converted" (bought core offer) or "qualified" (still deciding).

---

## 2. Kanban / Trello-Style Funnel Analytics

### Current State Assessment

**Frontend has:** `leads-view.js` (table view, NOT kanban), `funnel-view.js` (pyramid visualization).
**Backend gap:** Zero funnel API routes registered in Express. DB tables exist (`leads`, `products`, `orders`, `coach_sessions`, `journey_events`) but are NEVER wired to any route handler. All data uses in-memory arrays.

### Kanban Board Design (5 Columns = L0→L4)

```
┌──────────┬───────────┬──────────┬────────────┬──────────┐
│ L0        │ L1         │ L2        │ L3          │ L4        │
│ New 🔵    │ Contacted  │ Active   │ Repeat      │ CTV 🤝    │
│            │ 🟡        │ 💚        │ 🟠          │            │
│ 12 leads  │ 8 leads   │ 5 leads   │ 3 leads     │ 1 lead    │
│ [card]    │ [card]    │ [card]    │ [card]      │ [card]    │
│ Nguyễn A  │ Trần B    │ Lê C      │ Phạm D      │ Hoàng E   │
│ 3d ago    │ 1d ago    │ 5d ago    │ 14d ago     │ 30d ago   │
└──────────┴───────────┴──────────┴────────────┴──────────┘
```

### Per-Card Data Display

| Element | Detail |
|---------|--------|
| Card header | [PSN badge] [assigned CTV ID] [source tag: Zalo/FB/ref] |
| Card body | Name (bold), Phone, Email |
| Card body | Last contact date + action icon |
| Card footer | Risk-level indicator (green/yellow/red dot) + quick-action mini-buttons (on hover) |

### Color Coding by Risk

| Color | Meaning |
|-------|---------|
| Green (#00cc66) | Healthy, engaged within 48h |
| Yellow (#ffaa00) | At-risk, no contact 3-7 days |
| Red (#ff4444) | Critical, no contact 7+ days, STALL flag |

### Conversion Rate Benchmarks (Stage-by-Stage)

| Transition | Vietnam TPCN Target | Global Typical | Optimistic | Pessimistic |
|-----------|---------------------|----------------|------------|-------------|
| Lead Magnet → First Contact | 10% (target 10%) | 20-40% | 45% | 15% |
| First Contact → Engagement | 8% | 10-30% | 35% | 5% |
| Engagement → Presentation | 18% | 15-40% | 50% | 10% |
| Presentation → First Purchase | 25% | 10-25% | 35% | 5% |
| First Purchase → Repeat | 30% | 20-40% | 50% | 10% |
| Repeat → CTV Recruitment | 7% | 5-15% | 20% | 2% |
| **End-to-end (prospect → CTV)** | **~1-5%** | — | — | — |

**Sources:** DSA/WFDSA, Amway historical data (~2%), Herbalife (~0.5-2%), Mary Kay (~3%)

### Time-in-Stage Benchmarks

| Stage | Optimal Average | Warning Threshold |
|-------|-----------------|-------------------|
| L0 → L1 (first contact) | <24-48h | >7 days = cold lead |
| L1 → L2 (presentation) | 3-10 days | >21 days = stalled |
| L2 → L3 (repeat order) | 14-30 days | >60 days = lapsed |
| L3 → L4 (CTV signup) | 30-90 days | >90 days = unlikely |

### Bottleneck Detection

**Heatmap approach:** Auto-detect when drop-off exceeds 2x average.

**PSN-level bottleneck mapping** (leverages existing Cửu Địa 9-state alert engine):
- **>70% leads stuck in L0-L1** → coaching focused on "connect skills"
- **>60% dropping between L2→L3** → coaching focused on "follow-up/reorder cadence"
- **Zero L4 conversions in 30 days** → direct leadership review

### Cohort Analysis

The most powerful analysis is cohorting by recruitment month:

```
Cohort: January 2026 CTV class
- 50 leads in system by Feb 1
- 25 contacted within 48h → 50% contact rate
- 12 attended product demo → 24%
- 8 made first purchase → 16%
- 3 became repeat buyers → 6%
- 1 became new CTV → 2%
```

Compare cohort-to-cohort to identify training impact over time.

### Stagnation Alert Thresholds

| Stage | Max Days Before Alert |
|-------|----------------------|
| L0 | 3 days |
| L1 | 7 days |
| L2 | 14 days |
| L3 | 21 days |
| L4 | 30 days |

---

## 3. Automated Nudges & Follow-ups

### Follow-up Cadence

| After Event | Channel | Timing | Message |
|-------------|---------|--------|---------|
| Lead captured (L0) | Zalo OA | +1h | Welcome + ebook delivery |
| Quiz completed | Zalo OA | +2h | Results + tripwire offer |
| Tripwire purchased (L1) | Zalo OA | +24h | Thank you + order confirmation |
| No response L0→L1 | Zalo personal | +72h | CTV personal outreach |
| Core offer interest | Email | +48h | Detailed product info + case study |
| Cart abandoned | Zalo OA | +1h, +24h | Reminder + limited-time bonus |
| CTV signup | Email | Immediate | Academy access + training schedule |

### Principles

- Max 3 touches per week; 24-48h between nudges
- Personalization: name + stage-specific message + reference last interaction
- Multi-channel priority: Zalo OA → Zalo personal → SMS → Email
- AI evaluates intent score → routes to appropriate sequence
- Escalate to human CTV when intent_score >= 70

### Zalo OA Integration

| Feature | Implementation |
|---------|---------------|
| Auto-reply | Keyword matching on incoming Zalo messages |
| Broadcast | Segment by stage (L0 gets ebook, L1 gets tripwire CTA) |
| Quick replies | Template buttons: "Xem sản phẩm", "Đặt hàng" |
| Conversation handoff | Escalate to human CTV when intent_score >= 70 |
| Cost | ~1M VND/year for official account |

**Zalo Compliance:** Include sender's actual name, space >=24h between messages, honor opt-out.

**Webhook handler exists** in `src/integrations/zalo-webhook.js` but NOT registered as an Express route.

### Staleness Detection (Extends Existing alertEngine.js)

| Stage | Threshold | Alert Action |
|-------|-----------|-------------|
| 0 (Cold/L0) | 24h | Auto-reassign to next available CTV |
| 1 (Warm/L1) | 48h | Notify PSN Leader |
| 2-3 (Presented/Active) | 7 days | Zalo nudge to prospect |
| 4-5 (Order/Repeat) | 14 days | Escalate to Core Leader |

### Zalo Nudge Templates (Vietnamese)

| Stage | Delay | Template Pattern |
|-------|-------|-----------------|
| Cold → Warm | +4h | "Xin chào {name}! Mình có sản phẩm hay ho bạn có thể thích..." |
| Stalled Follow-up | +6h | "Bạn còn quan tâm đến sản phẩm mình giới thiệu không ạ?" |
| First Order → Repeat | +7d | "Hôm nay bạn cần bổ sung vitamin C không?" |
| Repeat → CTV | +14d | "Bạn muốn kiếm thêm thu nhập?..." |

---

## 4. Pipeline KPIs

### Key Metrics Dashboard

| KPI Group | Metrics |
|-----------|---------|
| Input | Leads/day, CPL (cost per lead), Source attribution |
| Velocity | Avg time in stage, Funnel velocity (leads/day processed) |
| Conversion | L0→L1 rate, L1→L2 rate, Overall conversion rate |
| Revenue | Revenue/lead, AOV by level, Commission payout |
| Team | CTV active count, Leads/CTV, Response time, Close rate |

### Benchmarks (Vietnam Market)

| Metric | Benchmark |
|--------|-----------|
| Leads entering L0/day | 5-10 (pilot), 50+ (scale) |
| Funnel cycle time (L0→L4 or drop) | 14-21 days avg |
| Leads/CTV/week | 10-20 (optimal), >30 (overloaded) |
| Response time | <4 hours (target), <8h (acceptable) |
| Close rate (personal) | 15-20% |
| Close rate (referral) | 30-40% |

### Global MLM Benchmarks (DSA/WFDSA)

| Metric | Value |
|--------|-------|
| Active distributors worldwide | ~130 Million (WFDSA) |
| Avg distributor annual revenue | $2,500–$5,000 USD |
| % earning >$10K/year | 5-10% |
| % earning >$50K/year | 1-3% |

### Funnel Health Indicators

| Indicator | 🟢 Green (Healthy) | 🟡 Yellow (Warning) | 🔴 Red (Action Required) |
|-----------|-------------------|---------------------|--------------------------|
| Pipeline coverage ratio | >= 3x target | 1.5-3x | < 1.5x |
| Presentation rate per distributor | >= 2/week | 0.5-2/week | < 0.5/week |
| Contact → Presented conversion | >= 25% | 10-25% | < 10% |
| Customer 90-day retention | >= 25% | 10-25% | < 10% |
| New distributor growth MoM | >= 3% | 0-3% | Negative/0% |

### Key Formulas

| Formula | Purpose |
|---------|---------|
| Pipeline Coverage = Σ(Funnel Stage Value) / Monthly Target | Health indicator |
| Funnel Value = ∑(#leads × stage_value_weight) | Total pipeline worth |
| Conversion Rate Stage = (Entered → Completed) × 100 | Stage efficiency |
| Distributor Efficiency = Monthly Sales / Active Distributors | Productivity |
| Activation Rate = Active / Total Registered | Engagement health |

### Team Performance Distribution (Pareto)

Only ~20-30% of distributors are truly active in any given month.

| Tier | % of Team | Revenue Contribution |
|------|-----------|---------------------|
| Top 5% (Builders/Leaders) | 80% activity | 50% of sales |
| Next 15% (Active earners) | 40-80% activity | 30% of sales |
| Middle 30% (Semi-active) | 10-40% activity | 15% of sales |
| Bottom 50% (Passive/inactive) | <10% activity | 5% of sales |

### Recommended Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│ LEAD GENERATION        │ CONVERSION                  │
│ • New contacts (today) │ • Attended = rate            │
│ • New contacts (MTD)   │ • Purchased = rate           │
│ • Source breakdown     │ • Recruited = rate           │
│ • Pipeline coverage    │ • Avg time in stage          │
├──────────────────────────────────────────────────────┤
│ TEAM ACTIVITY          │ REVENUE HEALTH               │
│ • Active distributors  │ • Monthly revenue            │
│ • Presentations MTD    │ • Revenue per distributor    │
│ • Orders fulfilled     │ • Auto-ship rate             │
│ • Recruits MTD         │ • AOV trend                  │
└──────────────────────────────────────────────────────┘
```

### Leading vs Lagging Indicators

**Leading (predict future):** New contacts/week, presentations scheduled, follow-up completion rate, activity score per distributor.
**Lagging (confirm outcomes):** Revenue per distributor, customer retention rate, team growth rate, monthly bonuses paid.

---

## 5. Competitive Analysis

### Droppii Platform Context

Droppii is a **dropshipping + single-level affiliate platform** (NOT a true MLM). It is the **upstream platform** for this training OS. The training system (`droppii-training-os`) teaches Droppii distributors (CTV = Cộng Tác Viên) to sell more effectively.

**What Droppii HAS:**
- AI-powered product consultation + auto sales content generation
- 4,000+ SKUs, 35% partner margins, free registration
- Mobile apps, centralized warehousing (Hanoi + HCMC), 150K orders/month capacity
- 130,000+ sellers on platform

**What Droppii does NOT have (market gaps this project fills):**
- No true MLM multi-level commission structures
- No dedicated funnel builder (landing pages, email sequences, upsells)
- No CRM for lead management
- No distributor back-office
- No recruitment/team building tools
- No gamification (leaderboards, ranks, achievements)
- No automated compensation plan processing
- No PSN health scoring
- No AI coaching with intent scoring

### Competitor Comparison

| Competitor | Tech Score | AI Coaching | MLM Features | Vietnam Fit | Price |
|-----------|-----------|-------------|--------------|-------------|-------|
| Herbalife VN | 2.1/10 | None | Basic | Brand only | N/A |
| Amway VN | 2.8/10 | None | Mobile app + Zoom | Moderate | N/A |
| Nu Skin VN | 2.8/10 | None | Video LMS only | Moderate | N/A |
| **Droppii Funnel OS** | **8.9/10** | **9/10** | Full (funnel + commission + academy) | Native | 99K/member/yr |

### Moat Analysis

| Moat Type | Strength | Time to Replicate | Description |
|-----------|----------|-------------------|-------------|
| AI Coaching | Strong | 12-18 months | Proprietary prompts, Vietnam compliance, PSN classifier |
| Training Data | Strong | 12+ months | Operational data accumulation |
| Network Effects | Moderate-Strong | 500+ members | Same-side (PSN amplification) + Cross-side (data flywheel) |
| Content Library | Moderate | 6-8 months | 1000+ hours Vietnam-specific + Sun Tzu + DISC integration |

---

## 6. Express.js / Cloudflare Workers Backend

### Current State (CRITICAL GAP — MUST FIX FIRST)

- **`src/db/adapter.js` EXISTS with D1 queries but is NOT wired into any route handler**
- All "database" operations currently use **in-memory arrays** — data loss on every server restart
- Frontend has 9 views built but several backend endpoints only consumed by frontend, NOT implemented
- API base URL hardcoded to production Cloudflare Worker: `hive-warfare-os.sadec-marketing-hub.workers.dev`
- Backend dev is Express (port 3000) but frontend expects Cloudflare Workers config mismatch

### Existing API Routes

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /auth/login | None | Live |
| POST | /auth/verify | None | Live |
| GET | /auth/users | None | Live |
| POST | /api/habits/checkin | None | Live |
| GET | /api/members | Auth | Live |
| PATCH | /api/members/:id | Auth | Live |
| GET | /api/kpi/:memberId | Auth | Live |
| GET | /api/kpi/leaderboard | Auth | Live |
| GET/POST | /api/alerts/* | None | Live |
| POST | /api/onboarding/* | None | Live |
| POST | /api/training/* | None | Live |

### Missing API Routes (Frontend exists, backend missing)

| Method | Path | Frontend File | Priority |
|--------|------|---------------|---------|
| GET | /api/leads | leads-view.js | HIGH |
| GET | /api/leads/:id | leads-view.js | HIGH |
| PATCH | /api/leads/:id | leads-view.js | HIGH |
| GET | /api/leads/:id/journey | leads-view.js | MEDIUM |
| GET | /api/orders | orders-view.js | MEDIUM |
| GET | /api/orders/:id | orders-view.js | MEDIUM |
| GET | /api/analytics/funnel | funnel-view.js | HIGH |
| GET | /api/analytics/funnel-rate | — | MEDIUM |
| GET | /api/analytics/ctv-workload | — | MEDIUM |

### RBAC Design

| Role | Level | Access |
|------|-------|--------|
| Member | 1 | Own assigned leads only |
| PSN Leader | 2 | Own + downline members' leads |
| Core Leader | 3 | All leads |
| Admin | 4 | All + manage stages/rules |

### Required Cron Jobs

```toml
[triggers]
crons = [
  "0 0 * * *",      # nightly: commission batch + PSN health
  "0 * * * *",      # hourly: funnel_metrics aggregation
  "*/15 * * * *"    # every 15min: followup reminder check + automation
]
```

### Middleware Pattern

```javascript
requireRole('Admin')           // exact role
requireRole(['PSN Leader', 'Core Leader'])  // any of
requireAuth                   // any authenticated user
requireAdmin                  // Admin only
requireCoreLeader             // Core Leader or Admin
requirePSNLeader              // PSN Leader or above

// Funnel-specific tenant scope:
async function getVisibleLeadScope(claims, env) {
  if (claims.role === 'Admin' || claims.role === 'Core Leader') {
    return { where: '', params: [] }; // sees all
  }
  if (claims.role === 'PSN Leader') {
    const downlineIds = await getDownlineIds(env, claims.id);
    return { where: `AND assigned_ctv_id IN (${downlineIds})`, params: [] };
  }
  // Member: only own assigned leads
  return { where: 'AND assigned_ctv_id = ?', params: [claims.id] };
}
```

### API Response Convention

```json
// Success:
{ "success": true, "message": "Vietnamese success text", "data": { ... } }
// Error:
{ "error": "Vietnamese error text", "code": "SNAKE_CASE_CODE" }
```

### Key Files That Need Changes

| File | Change | Priority |
|------|--------|----------|
| `src/workers/index.js` | Add 12+ funnel handlers, wire to D1 | CRITICAL |
| `src/db/adapter.js` | Wire D1 adapter into all route handlers | CRITICAL |
| `src/middleware/requireRole.js` | Add funnel-specific role helpers | HIGH |
| `src/analytics/alertEngine.js` | Add funnel metrics to evaluateAll | MEDIUM |
| `migrations/0005_*.sql` | New tables: funnel_stages, stage_transitions, follow_up_schedules, funnel_metrics, automation_rules | HIGH |
| `wrangler.toml` | Add cron triggers | MEDIUM |

---

## 7. Tech Stack for Funnel Analytics

### Library Comparison & Recommendation

| Need | Recommended | Alternative | Rationale |
|------|------------|-------------|-----------|
| Funnel chart (primary) | **ECharts** (Apache 2.0) | ApexCharts (MIT) | Native funnel type, comparison support, dark theme, one library for funnel + sankey |
| Funnel chart (light) | **Funnel.js** (MIT, 20KB) | chartjs-chart-funnel | If funnel is the only complex chart |
| Kanban / Pipeline board | **Native HTML5 DnD** | SortableJS, HelloKanban | Zero deps, ~50 lines for single-card drag, matches dark luxury theme |
| Sankey / Flow diagram | **ECharts Sankey** | — | Reuse same library as funnel (zero extra cost) |
| Sparkline | **Custom SVG** | — | Small enough to inline |

### License Summary

| Library | License | Commercial Use |
|---------|---------|----------------|
| ECharts | Apache 2.0 | Yes, full modification |
| ApexCharts | MIT | Yes |
| Funnel.js | MIT | Yes |
| HelloKanban | MIT | Yes |
| SortableJS | MIT | Yes |
| Chart.js | MIT | Yes |

### Missing CSS Variables (Must Add Before Building Views)

These are referenced in components but NOT defined in `:root`:
- `--status-red`, `--status-yellow`, `--status-green`, `--status-blue`
- `--surface-hover`
- `--border-radius-xs`
- `--brand-gold-bright`

### Performance Targets

| Metric | Target |
|--------|--------|
| Dashboard load | <2s (Cloudflare Pages CDN) |
| Kanban render | <1s (virtual scroll for 100+ leads) |
| Chart animation | <500ms |
| API response | <500ms (D1 indexed queries) |
| Kanban drag-drop | Native HTML5 DnD (instant client-side, debounced server sync) |

### Optimization Patterns

- ECharts `setOption` with `notMerge: false` for efficient incremental updates
- Kanban: client-side optimistic update → debounced batch sync every 2s
- Lazy-load chart libs only on analytics tab (dynamic `import()`)
- Pre-compute funnel aggregates in D1 (cron job), return ready-to-plot JSON
- Keyset pagination for real-time feeds: `WHERE id < last_seen_id ORDER BY created_at DESC LIMIT ?`

### Deployment (Free Tier)

| Layer | Tech | Cost |
|-------|------|------|
| Frontend | Cloudflare Pages | $0 |
| API | Cloudflare Workers | $0 (100K req/day) |
| Database | Cloudflare D1 | $0 (5GB, 25M reads/mo) |
| AI | OpenRouter (Claude tiered) | ~$5-20/mo at pilot |

### Integration Pattern

```javascript
// 1. Backend endpoint (Express or Workers)
app.get('/api/analytics/funnel', (req, res) => {
  const funnelData = calculateFunnelStages(db);
  res.json({ stages: [
    { name: 'Leads', count: 150 },
    { name: 'Contacted', count: 120 },
    ...
  ]});
});

// 2. Frontend fetch (Vanilla JS)
const resp = await fetch('/api/analytics/funnel');
const { stages } = await resp.json();

// 3. Render with ECharts
echarts.init(el).setOption({
  series: [{ type: 'funnel', data: stages }]
});

// 4. Render Kanban (native DnD)
kanbanView.render(container); // class with handleDragStart/Drop
```

---

## 8. Tiered Implementation Plan

### Tier 1 Quick Wins (1-2 days)
1. **Fix critical gap:** Wire `src/db/adapter.js` into all route handlers (fix in-memory data loss)
2. Deploy 6 missing API endpoints (leads CRUD, orders list, funnel metrics)
3. Add missing CSS variables (`--status-*`, `--surface-hover`, etc.) to `style.css`
4. Native HTML5 DnD Kanban board (~50 lines, zero deps)
5. ECharts integration for funnel dashboard (funnel chart + basic conversion rates)

### Tier 2 (1-2 weeks)
6. Complete Funnel OS backend (migration 0005 — 8 new tables: funnel_stages, stage_transitions, follow_up_schedules, funnel_metrics, funnel_automation_rules, bulk_import_jobs)
7. RBAC enforcement on funnel endpoints (PSN downline scope)
8. Register Zalo OA webhook as Express route
9. AI Coach chat UI (calls existing coach_sessions API)
10. PSN handoff automation (intent_score >=70 → assign to CTV)
11. Staleness detection (extend alertEngine.js with new metrics)
12. Cohort analysis (filter funnel by date range)

### Tier 3 (2-4 weeks)
13. PayOS payment integration (QR codes)
14. Zalo OA broadcast automation
15. Content Warfare engine (Spy Scout + Script Writer + Video Dispatcher)
16. Training module gating on funnel progression
17. Bottleneck dashboard (auto-detect conversion drops)
18. Real-time kanban (polling at 30s intervals)

---

## 9. Key Data Points Summary

| Topic | Key Number | Source |
|-------|-----------|--------|
| Global direct selling market (2023) | ~$196B USD | WFDSA |
| Active distributors worldwide | ~130 million | WFDSA |
| Average distributor annual revenue | $2,500–$5,000 USD | DSA |
| End-to-end MLM conversion (prospect → distributor) | 1-5% | DSA/Amway/Herbalife |
| Contact rate (optimum response, CTV) | 15–20% | Industry |
| Zalo OA cost | ~1M VND/year | Zalo |
| Leads/CTV/week (optimal) | 10-20 | Industry |
| Response time target | <4 hours | Industry |
| Close rate (personal/referral) | 15-20% / 30-40% | Industry |
| Commission/month sustainable | 2-5M VND | Industry |
| Pipeline coverage (healthy) | >= 3x monthly target | Industry |

---

## 10. Key Sources

| Report | Topics |
|--------|--------|
| `deep-research-260701-2342-funnel-os-report` | Market research, CCFL methodology, webhook patterns |
| `bootstrap-funnel-os-260701-2352-complete-report` | Bootstrap implementation status |
| `brainstorm-260702-0008-funnel-next-steps-report` | Feature prioritization |
| `competitive-analysis-executive-summary-260623` | Competitor comparison |
| `stack-evaluation-260623-1844` | Tech stack recommendations |
| `architectural-gaps-and-technical-debt.md` | Known gaps |
| `general-purpose-260703-0706-funnel-os-architecture.md` | Migration 0005 DDL (8 tables), RBAC, API design, cron schedule |
| `general-purpose-260703-0708-codebase-exploration.md` | Current codebase state, critical in-memory gap |
| `general-purpose-260703-0710-funnel-os-complete-research.md` | Complete architecture integration, staleness detection, trigger taxonomy |
| `general-purpose-260703-0706-funnel-os-ui-ux-research.md` | Kanban UI design, missing CSS variables |
| `general-purpose-260703-0707-funnel-analytics-stack.md` | ECharts/ApexCharts/Funnel.js/HelloKanban comparison |
| `general-purpose-260703-0707-mlm-funnel-methodology.md` | CCFL method, extended 7-stage funnel, benchmark validation |
| `researcher-mlm-funnel-competitors.md` | Droppii analysis, Infinite MLM, Epixel, market gaps |
| `researcher-260703-0713-mlm-funnel-sales-pipeline.md` | Stage transitions, automation rules, visual analytics |
| `mlm-funnel-and-sales-pipeline-research.md` | Lead status model, transition rules, staleness detection |
| `mlm-kanban-funnel-research.md` | Conversion benchmarks, PSN bottleneck mapping, cohort analysis |
| `mlm-pipeline-kpi-metrics.md` | KPI formulas, team velocity, Pare distribution, dashboard layout |
| `mlm-followup-research.md` | Zalo integration patterns, follow-up cadence, automation |

---

## Unresolved Questions

1. Zalo OA webhook — template approval process status? (govt registration required)
2. PayOS payment flow — QR generation, webhook verification details
3. Content Warfare agents — scope for first iteration vs full pipeline
4. D1 emulator setup — exact wrangler config for dual dev/prod
5. Coach sessions — who is the "coach" when funnel auto-creates sessions? Assigned CTV or AI agent?
6. Lead deduplication — UPSERT on email at creation time?
7. Data retention — how long to keep stage_transitions before archiving? (suggested: 90 days hot, 1 year cold)
8. Monitoring stack — Sentry vs Logflare before production launch
9. Cron timing — hourly vs 15-minute cadence for followup reminders?
10. Alpine.js introduction — suggested at >10 dashboard views, when to add?
11. Vietnam-specific MLM conversion benchmarks — no published data found for VN/SEA market
12. Lead magnet type effectiveness — ebook vs free product sample vs webinar for Droppii context
13. L3→L4 timing realism — is 30-90 day target achievable for first-time distributors in Vietnam?
14. Tradeoff HelloKanban vs Custom HTML5 DnD — if custom drag-drop rules needed (only moving forward, not backward), native gives more control at ~200 LOC cost
15. Mobile kanban support — HTML5 DnD has poor mobile support; need to evaluate if mobile board interaction is required
16. PSN hierarchy depth — recursive CTE for downline queries assumes 2-3 levels; if 5+ levels, may hit D1 performance limits
