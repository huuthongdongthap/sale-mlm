# Funnel OS — Complete Integrated Research Report
**Date:** 2026-07-03 | **Project:** Droppii Sales Training OS — Hive Warfare Academy | **Stack:** Express.js + Vite/JS + Cloudflare D1

---



## 1. MLM Funnel Stages (CCFL Methodology)

The system uses a 5-tier funnel aligned to company.json's existing tier structure. The DB schema (`migrations/0004_funnel_tables.sql`) already defines the products table with these tiers:

| Level | Vietnamese Name | Tier Label | Product Focus | Price (VND) |
|-------|----------------|------------|---------------|-------------|
| L0 | Mất Hoa (Awareness) | `lead_magnet` | Free high-value lead capture (quiz, ebook) | 0 |
| L1 | Tin (Interest) | `tripwire` | Risk-free first purchase, entry product | 150K |
| L2 | Hành (Action) | `core` | 30-45 day health transformation | 3.5M - 8.9M |
| L3 | Hoa (Habit) | `continuity` | 90+ day recurring commitment | 890K - 990K/mo |
| L4 | Hợp (Partnership) | CTV Recruitment | Customer promoted to CTV + Academy enrollment | 99K/yr |

This maps directly into the `leads.funnel_level` column (L0-L4) and `products.tier` column (`magnet|tripwire|core|downsell|continuity`).

### Conversion Benchmarks (Target)
- L0 → L1: **10%** (industry avg 8-12%)
- L1 → L2: **18%** (industry avg 15-20%)
- L2 → L3: **28%** (industry avg 25-30%)
- L3 → L4: **7%** (industry avg 5-8%)

### Lead Status Values (from existing frontend)
`new` → `contacted` → `qualified` → `converted` → `lost`
- Status is independent of funnel_level
- L0 starts at status=`new`, progresses with CTV contact

---



## 2. Kanban/Trello-Style Funnel Analytics

### Existing Gap Analysis
The frontend has `funnel-view.js` (analytics dashboard) and `leads-view.js` (table list, NOT kanban), but the backend has **zero funnel API routes registered in server.js**. The DB tables exist (leads, products, orders, order_items, coach_sessions, journey_events) but are never wired.

### Recommended Kanban Board Design

**Column headers = funnel_level (L0-L4) + status sub-grouping:**
- Each column shows count + conversion arrow
- Cards display: name, intent_score (color-coded), assigned CTV, days-in-stage (green <3d, yellow 3-7d, red >7d), source badge
- Drag-drop moves card to new column → triggers journey_events entry

**Stagnation alerts** (from existing research):
- L0: 3 days | L1: 7 days | L2: 14 days | L3: 21 days | L4: 30 days

### UI Pattern (matches existing codebase)
- Class-based component with `render(container)` returning HTML strings
- Styles via inline CSS using CSS variables from style.css
- API calls use `fetch()` against harcoded `apiBase` (NOTE: this is `hive-warfare-os.sadec-marketing-hub.workers.dev` — needs config)
- Pattern from `leads-view.js:7-16` → instantiate class, call `render(container)`

---



## 3. Automated Nudges & Follow-ups

### Existing Assets
1. **ZaloWebhookHandler** (`src/integrations/zalo-webhook.js`) — full class with sendMessage, handleMessage, auto-replies for "checkin/streak/help/nudge", welcome message for new followers. Webhook NOT yet registered as route.
2. **Training Ops reminders** (`src/agents/trainingOps.js:196-235`) — scheduleReminder, generateReminderPayload with Zalo-ready message templates. Types: welcome, next_day, habit_reminder, weekly_review, graduation.
3. **Onboarding Bot nudges** (`src/agents/onboardingBot.js`) — generateNudge for daily coaching nudges.

### Recommended Nudge Engine
Connect trainingReminders + ZaloWebhookHandler + handleMessage into one notification service:

| Trigger | Channel | Timing | Content Source |
|---------|---------|--------|----------------|
| Lead captured (L0) | Zalo OA | +1h | Welcome template + ebook link |
| Tripwire purchased (L1) | Zalo OA | +24h | Thank you + order confirmation |
| No response L0→L1 | Zalo personal | +72h | CTV manual outreach trigger |
| Stagnation alert | Zalo OA + in-app | Immediate | Alert from funnel stage tracker |
| Habit score drop | Zalo OA | Daily check | from trainingOps reminders |
| PSN health state change | In-app alert | Immediate | from alertEngine evaluateAll |

### Implementation Pattern
Follow `trainingOps.js:216-235` payload structure:
```
{ to: zalo_phone, message: STRING, type: STRING, module: STRING, day: INT }
```

---



## 4. Pipeline KPIs for MLM

### Existing KPI Model (`src/models/kpi.js`)
Already tracks: connectsPerDay, followUpsPerDay, firstOrderIn14Days, habitScore, ordersCount, revenue
Tier targets loaded from `.mekong/company.json` per tier.

### Funnel-Specific KPIs to Add

| KPI | Formula | Data Source |
|-----|---------|-------------|
| Funnel conversion rate | `→count_leads(next_stage) / count_leads(current_stage) * 100` | leads table + journey_events |
| Avg time in stage | `AVG(updated_at - created_at) per funnel_level` | leads table |
| Drop-off rate | `leads_lost / total_leads_entering * 100` per level | leads table |
| Pipeline value | `SUM(leads_at_stage * expected_order_value_at_stage)` | leads + products |
| CTV velocity | `leads_assigned / active_CTVs / 7d` | leads + members |
| Revenue by tier | `SUM(orders.total_vnd) WHERE product.tier = X` | orders + products |
| Funnel cycle time | `AVG(time from L0 creation to L4 conversion)` | leads timestamps |
| Response time CTV | `AVG(time from first_inbound to first_outbound)` | journey_events + coach_sessions |

### Implementation as API Routes (following existing pattern)
```
GET /api/analytics/funnel          → conversion rates, throughput
GET /api/analytics/funnel/kpis     → pipeline KPI dashboard
GET /api/analytics/ctv-workload    → per-CTV lead count, response time
GET /api/analytics/revenue         → revenue by stage and period
GET /api/analytics/bottleneck      → stage with highest drop-off
POST /api/analytics/evaluate       → run alert rules against funnel metrics
```

---



## 5. Integration with Existing System

### Points of Integration

| Existing System | Funnel OS Integration |
|----------------|----------------------|
| **members model** | `lead.assigned_ctv_id` → references `members.id` where `role='CTV'` or `role='PSN Leader'` |
| **PSN Health** (`psnHealth.js`) | PSN health state 3 ("At Risk") → auto-flag leads assigned to that PSN. Use `evaluateAll()` with funnel metrics |
| **Alert Engine** (`alertEngine.js`) | New rules: `funnel_drop` (conversion < 10%), `stage_stagnation` (lead stuck >14 days), `ctv_overload` (>30 leads/CTV/week) |
| **Training Ops** (`trainingOps.js`) | When member graduates training → auto-create lead at L2 (they are now a CTV prospect) |
| **Zalo Webhook** (`zalo-webhook.js`) | Connect funnel stage changes to Zalo notifications. Stage advancement → send automated Zalo to lead |
| **Database** (D1) | `leads`, `products`, `orders`, `order_items`, `coach_sessions`, `journey_events`, `commission_ledger` tables already exist in migration 0004 |
| **Dark Luxury Theme** (`style.css`) | Funnel-specific CSS already in style.css lines 374-728: `.funnel-visualization`, `.funnel-tier`, `.conversion-card`, `.tier-badge` |

### RBAC (from `requireRole` middleware)
```
CTV → can view/update leads assigned to them
PSN Leader → can view/manage all leads in their PSN
Core Leader → full funnel read + manage alerts
Admin → full access + assignment + delete
```

---



## 6. Notification/Alert System

### Existing Alert System (`src/analytics/alertEngine.js`)
- 6 default rules: retention, habit, activity, revenue, connects, PSN health
- Rule DSL: `{ metric, op, threshold, action }` with fire → alertLog entry
- Actions: `notify_leader`, `notify_admin`, `escalate`, `auto_buddy`, `schedule_review`

### Required New Integration
1. **Zalo dispatch to alert notifications**: Extend `alertEngine.js` to call `ZaloWebhookHandler.sendMessage()` when escalation fires
2. **In-app notification badge**: New frontend component (follow `alerts-inbox.js` pattern) showing funnel-specific alerts
3. **Funnel-specific rules** to add to `DEFAULT_RULES`:
```javascript
{ id: 'funnel-drop', name: 'Funnel Drop-off High', metric: 'L0_L1_conversion', op: '<', threshold: 5, action: 'notify_leader', severity: 'red' }
{ id: 'stage-stagnation', name: 'Lead Stuck >14 Days', metric: 'days_in_stage', op: '>=', threshold: 14, action: 'schedule_review', severity: 'yellow' }
{ id: 'ctv_overload', name: 'CTV Overloaded', metric: 'leads_per_ctv', op: '>', threshold: 30, action: 'auto_redistribute', severity: 'warning' }
```

### Journey Event Tracking (existing DB table)
`journey_events` already exists with columns: `id, lead_id, event_type, from_level, to_level, metadata_json`. This is the natural place to log stage transitions for timeline views.

---



## 7. Competitive Analysis

### Droppii vs Competitors (Regional MLM in Vietnam)
| Competitor | Tech Stack | Funnel Support | AI Coaching | Vietnam Fit |
|-----------|-----------|----------------|-------------|-------------|
| Herbalife VN | None | Basic spreadsheet | None | Brand only |
| Amway VN | Mobile app + Zoom | No pipeline view | None | Moderate |
| Nu Skin VN | Video LMS | No pipeline view | None | Moderate |
| **Droppii Funnel OS** | **Express + D1 + IA** | **Full 5-tier funnel** | **9/10 AI** | **Native** |

### Key Differentiators
1. AI-native coaching with intent scoring (no competitor has this)
2. Unified funnel + commission + training in one platform
3. PSN health Cửu Địa 9-state classifier (unique)
4. Zalo-first design (Vietnamese messaging, not WhatsApp/SMS)
5. Sun Tzu × Covey methodology embedded in curriculum

---



## 8. Recommended API Endpoints

### CRITICAL: Backend Route Registration (currently MISSING from server.js)
The following tables have DDL but zero backend routes:

### Funnel Routes (new file: `src/api/funnel.js`)
```
GET    /api/leads                  → List leads (filters: level, status, assigned_ctv, page)
GET    /api/leads/:id              → Lead detail + journey events
PATCH  /api/leads/:id              → Update stage (funnel_level), status, assign CTV
GET    /api/leads/:id/journey      → Journey timeline for lead
POST   /api/leads/:id/advance      → Move lead to next funnel_level

POST   /api/orders                 → Create order (link to lead)
GET    /api/orders                 → List orders (filters: status, date range)
GET    /api/orders/:id             → Order detail with items

GET    /api/products               → Product catalog (by tier)
```

### Analytics Routes (new file: `src/api/analytics.js`)
```
GET    /api/analytics/funnel        → Funnel metrics (counts per level, conversion rates)
GET    /api/analytics/funnel/kpis   → Pipeline KPI dashboard data
GET    /api/analytics/ctv-workload  → Per-CTV load, response time avg
GET    /api/analytics/revenue       → Revenue breakdown by tier + period
GET    /api/analytics/bottleneck    → Stage with highest drop-off
POST   /api/alertRules              → Evaluate funnel alert rules
GET    /api/alertRules/rules        → Current alert rules (already exists)
```

### Pattern to Follow (from existing routes)
- Express Router → `src/api/<name>.js`
- `requireAuth` middleware from `src/middleware/requireRole.js`
- Response format: `{ success: boolean, data: object, message?: string }`
- Error format: `{ error: string, code: SNAKE_CASE_ERROR_CODE }`
- Vietnamese error messages (convention from `members.js`)
- In-memory storage for now (same as members, kpis, alerts), wire to D1 adapter later

---



## 9. Database Schema Summary

### Funnel Tables (already migrated in `0004_funnel_tables.sql`)
```sql
leads              → id, name, email, phone_encrypted, source, funnel_level(L0-L4), intent_score, quiz_answers, assigned_ctv_id, status, notes
products           → id, name, slug, price_vnd, tier(magnet|tripwire|core|downsell|continuity), commission_pct, margin_pct, modules_json
orders             → id, lead_id, customer_id, ctv_referrer_id, product_id, quantity, unit_price_vnd, total_vnd, commission_vnd, status, payment_ref
order_items        → id, order_id, product_id, quantity, unit_price_vnd, subtotal_vnd
coach_sessions     → id, lead_id, coach_type, status, messages_json, gains_json, spin_json, budget_range, need_score, intent_score, next_action
journey_events     → id, lead_id, event_type, from_level, to_level, metadata_json
```

### Indexes present
- `idx_leads_level` → `(funnel_level, status)` — fast stage queries ✓
- `idx_leads_ctv` → `(assigned_ctv_id)` — CTV workload ✓
- `idx_orders_ctv` → `(ctv_referrer_id, status)` — CTV revenue ✓
- `idx_coach_sessions_lead` → `(lead_id, status)` — lead timeline ✓
- `idx_journey_events_lead` → `(lead_id, created_at)` — journey timeline ✓

### Missing Indexes (add for funnel analytics)
```sql
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
```

---



## 10. Frontend UI Patterns

### Architecture
- `router.js` — hash-based SPA router, Map of route → render function
- Each view is a class with `render(container)` → sets container.innerHTML, then does async fetch + re-render
- Dynamic imports: `import('./funnel-view.js').then(...)`
- API base hardcoded in each view: `'https://hive-warfare-os.sadec-marketing-hub.workers.dev'` → **needs central config**

### Component Pattern (from funnel-view.js, leads-view.js)
```javascript
class FunnelView {          // PascalCase, one file per view
  constructor() { ... }     // sets apiBase, state vars
  async render(container) { // renders loading, then loads data
  async loadXxx(container) { // fetch data, handles errors
  renderXxx(container) {    // sets innerHTML with template literal
  getAuthToken() {          // reads localStorage
}
```

### Theme Integration
- CSS variables from `style.css` :root: `--brand-gold`, `--brand-card`, `--brand-bg`, `--text-accent`, `--surface-secondary`
- Fluent dropdowns, modals, tables already styled
- Tier badges: tier-0 (blue) through tier-4 (red) in style.css
- Funnel-specific CSS already defined (lines 657-682)

### Components to Build
1. **KanbanBoard** — new, drag-drop columns L0-L4 (use SortableJS)
2. **ConversionChart** — extend `funnel-view.js` with real API data
3. **LeadCard** — follows existing card/table patterns
4. **StageTimer** — shows days-in-stage with color coding
5. **CTVWorkload** — CTV management view (new)
6. **FunnelAlertBadge** — in-app notification (follow `alerts-inbox.js`)

---



## 11. Recommended Implementation Order

### Phase 1: Wire Existing DB to Backend Routes (1-2 days)
1. Create `src/api/funnel.js` — leads CRUD + orders CRUD
2. Register in `src/server.js` → `app.use('/api/leads', ...)`
3. Create `src/api/analytics.js` — funnel metrics
4. Switch frontend `apiBase` to relative URL or config
5. Run existing tests, add funnel test cases

### Phase 2: Kanban Board (1 day)
6. Add SortableJS to `src/dashboard/package.json`
7. Build `src/dashboard/kanban-board.js` (L0-L4 columns, drag-drop)
8. Register `/kanban` route in router.js
9. Wire stage change → PATCH /api/leads/:id → journey_events logging

### Phase 3: Alert Integration (half day)
10. Connect `alertEngine.evaluateAll` to funnel stage change events
11. Add Zalo dispatch in `ZaloWebhookHandler`
12. Frontend funnel alert component

### Phase 4: Analytics Enrichment (half day)
13. ECharts funnel chart in `funnel-view.js`
14. Revenue breakdown + CTV workload views

---



## 12. Variable Naming Convention

Codebase uses:
- **JS variables**: camelCase (`funnelLevel`, `intentScore`, `assignedCtvId`, `apiBase`)
- **DB columns**: snake_case (`funnel_level`, `assigned_ctv_id`, `intent_score`, `created_at`)
- **Error codes**: UPPER_SNAKE (`MISSING_REQUIRED_FIELD`, `INVALID_EMAIL_FORMAT`, `FUNNEL_LEAD_NOT_FOUND`)
- **UI strings**: Vietnamese (`"Trạng thái"`, `"Đã chuyển đổi"`, `"Chưa phân công"`)
- No Spanish naming found anywhere in codebase (contrary to user's initial note)

---



## Integration Points Diagram

```
[D1 tables: leads, products, orders, coach_sessions, journey_events]
         ↓
[src/api/funnel.js] ← new route builders
    → PATCH /api/leads/:id → triggers journey_events
    → POST /api/orders → triggers commission ledger
         ↓
[src/analytics/alertEngine.js] ← extended with funnel rules
    → evaluateAll(funnelMetrics) → fires alerts
    → ZaloWebhookHandler.sendMessage() → Zalo notification
         ↓
[src/dashboard/] ← frontend views
    → kanban-board.js (new) ← drag-drop interaction
    → funnel-view.js (enhanced with real data)
    → leads-view.js (enhanced from table to kanban)
    → alerts-inbox.js (extended with funnel alerts)
         ↓
[existing integrations]
    → PSN Health: downstream funnel impact analysis
    → Training Ops: graduation triggers lead creation
    → Zalo: downstream notification channel
    → Commission Ledger: order completion triggers payout
```

---



## Key Risks & Gaps

1. **Backend routes missing**: DB tables exist, frontend views exist, but server.js has NO funnel routes — complete disconnect
2. **Hardcoded API URL**: Every frontend view has `'https://hive-warfare-os.sadec-marketing-hub.workers.dev'` hardcoded instead of relative URL or config
3. **Zalo webhook not registered**: `ZaloWebhookHandler` class exists but no POST route in server.js
4. **In-memory only**: Funnel data stored in-arrays will disappear on restart — D1 adapter exists (`src/db/adapter.js`) but never wired
5. **Intake system missing**: `members` table exists but no public `POST /api/leads` for quiz/landing capture

---



## References
- `migrations/0004_funnel_tables.sql` — DDL for 6 funnel tables + indexes
- `src/dashboard/funnel-view.js` — existing funnel analytics view (fetches from non-existent API)
- `src/dashboard/leads-view.js` — existing leads list view
- `src/dashboard/router.js` — route registry, already defines `/funnel` and `/leads`
- `src/integrations/zalo-webhook.js` — Zalo integration class (not registered)
- `src/analytics/alertEngine.js` — alert rules engine (needs funnel rules)
- `src/models/kpi.js` — KPI model with tier targets
- `.mekong/company.json` — training architecture, tier definitions, agents list
