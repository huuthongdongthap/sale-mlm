# MLM Funnel & Sales Pipeline — Research Report
**Project:** Droppii Sales Training OS (Hive Warfare Academy)
**Date:** 2026-07-03
**Scope:** Funnel OS architecture, stage transitions, dashboard, automation, VN market

---

## 1. MLM Sales Funnel Stages

### Current State in Codebase
The `Lead` model (`src/models/lead.js`) already defines 5 funnel levels with Vietnamese tier labels:

| Level | Label | Description |
|-------|-------|-------------|
| 0 | Lead Magnet | Cold prospect — entered via quiz, ads, Zalo |
| 1 | Trial | Warm lead — contacted, qualified intent |
| 2 | Health Active | Active buyer — first order placed |
| 3 | Combo | Repeat customer — multi-category buyer |
| 4 | CTV Partner | Team builder — recruited as partner |

`Member` model (`src/models/member.js`) ranks: Tân Binh (tier 1) → Chiến Binh (tier 2) → Chỉ Huy (tier 3) → Tướng Quân (tier 4, implicit). PSN Leader role manages a `psnId` team.

### Recommended: Extended 7-Stage Funnel (Droppii Hybrid)

| # | Stage | Vietnamese Term | Droppii Context | Trigger to Next |
|---|-------|----------------|-----------------|-----------------|
| -1 | Visitor | Khách truy cập | Zalo bot / ad click → quiz entry | Quiz submitted |
| 0 | Cold Prospect | Liên hệ mới | Zalo contact added, no product view | Profiled via AI assistant |
| 1 | Warm Lead | Tiềm năng | Viewed catalog, engaged AI consult | First share/follow-up |
| 2 | Presented | Đã giới thiệu | Shared Droppii shop link via Zalo | COD order placed |
| 3 | Follow-up | Đang chăm sóc | Active conversations, reminders | First order delivered + feedback |
| 4 | First Order | Khách đầu tiên | Delivery confirmed | 2nd order |
| 5 | Repeat Customer | Khách VIP | 2+ orders, cross-category (Combo) | Applies as CTV partner |
| 6 | Team Builder | Nhà phân phối | Onboarding complete, first recruit | Running PSN, 3+ members |

**Funnel stages (customer journey) and rank tiers (team progression) are orthogonal dimensions.** A PSN at "Chỉ huy" rank can still have prospects at "Follow-up" stage. Track independently and cross-reference in dashboards.

### Data Model (D1 SQLite)

```sql
-- Extend existing leads table
ALTER TABLE leads ADD COLUMN stage_entered_at TEXT DEFAULT (datetime('now'));
ALTER TABLE leads ADD COLUMN next_action_due TEXT;
ALTER TABLE leads ADD COLUMN drop_off_score REAL DEFAULT 0;  -- 0-1 ML churn risk

-- New funnel aggregate table for fast dashboard queries
CREATE TABLE funnel_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  psn_leader_id TEXT,
  snapshot_date DATE DEFAULT (date('now')),
  funnel_counts TEXT,  -- JSON: {0: 23, 1: 15, ...}
  conversions_7d INTEGER,
  new_leads_7d INTEGER,
  avg_stage_duration REAL
);
```

**Priority: HIGH**

---

## 2. Funnel Stage Transitions

### Trigger Taxonomy

| Trigger Type | Example | Implementation |
|-------------|---------|---------------|
| **Activity-based** | Prospect clicks shared product link | Webhook event → check transition rules |
| **Order-based** | First COD order confirmed → advance | Droppii order webhook → update stage |
| **Training-based** | PSN completes M3 (Closing) → unlock convert action | Training module completion event |
| **Time-based** | No Zalo contact in 48h → stall → escalate | Alert Engine cron job (hourly) |
| **Rank-based** | PSN hits "Chiến binh" → auto-assign 5 prospects | Rank promotion event → batch allocation |

### Transition Rules

| From → To | Allowed | Condition | Auto? |
|-----------|---------|-----------|-------|
| -1 → 0 | Yes | Quiz submitted | Yes (Zalo webhook) |
| 0 → 1 | Yes | AI consult completed or manual | No (alert PSN) |
| 1 → 2 | Yes | Share link clicked | Yes |
| 2 → 3 | Yes | Zalo message logged | Yes |
| 3 → 4 | Yes | Order webhook with `referred_by` match | Yes |
| 4 → 5 | Yes | 2nd order confirmed | Yes |
| 5 → 6 | Yes | CTV application approved | Manual/onboarding |
| Any → Lost | Yes | 14 days no contact | Yes (staleness) |
| Any → Archived | Admin only | Lost > 30 days | Scheduled job |

Demotion: Level 2+ → 1 (re-engagement) allowed. Below 1 requires explicit "lost" flag.

### Staleness Detection

Leverage existing Alert Rules Engine (`src/analytics/alertEngine.js`). Add new metric `lead_staleness_hours`:

| Stage | Threshold | Alert Action |
|-------|-----------|--------------|
| 0 (Cold) | 24h | Auto-reassign to next available CTV |
| 1 (Warm) | 48h | Notify PSN Leader |
| 2-3 (Presented/Follow) | 7 days | Zalo nudge to prospect |
| 4-5 (Order/Repeat) | 14 days | Escalate to Core Leader |

**Priority: MEDIUM** — Add metric to `alertEngine.js` + hourly cron job.

---

## 3. Dashboard Analytics

### Visualization Prescriptions

| View | Type | Use Case | Library |
|------|------|----------|---------|
| Funnel conversion | Vertical funnel / pyramid | Single PSN conversion rate | `recharts` Funnel |
| Stage flow | Sankey diagram | Multi-stage drop-off analysis | `d3-sankey` or `recharts` |
| Time-series trends | Area chart | Weekly funnel entry/exit | `recharts` AreaChart |
| Leader comparison | Horizontal bar | Team sizes & conversion rates | `recharts` BarChart |
| Heatmap | CSS grid | Stage distribution by PSN Leader | Custom CSS + data |

All compatible with Vite + vanilla JS stack. Recharts ~50KB gz for standard views; d3-sankey (~30KB) for Admin Sankey only.

#### PSN Leader: Team Pipeline View
- Mini-funnel pyramid (7 columns per team member)
- Stalled prospects list (top 10, with owner + days idle)
- Conversion rate sparkline (30d trend)
- "Who needs help" panel (members with >50% stalled)

#### Admin: Org-Wide View
- Sankey: prospect inflow/outflow across all stages
- Leader leaderboard (sorted by conversion rate, revenue)
- Funnel velocity histogram (time-per-stage)
- Pickup rate (% auto-assigned prospects contacted within 48h)

**Priority: HIGH** — PSN Leader view is primary stakeholder value; Admin view can follow.

---

## 4. Automation Rules

### Auto-Assign Prospects to Recruits (Round-Robin)

When a new Lead enters at any stage:
1. Round-robin across active CTVs in same PSN team
2. If PSN Leader has no CTVs → assign to PSN Leader
3. If PSN Leader inactive (no login 7d) → escalate to Core Leader
4. Zalo OA sends "New lead assigned" notification

Capacity per rank: Tân binh=20, Chiến binh=50, Chỉ huy=100 prospects max.

**Priority: HIGH** — Speed-to-contact is the #1 conversion lever in VN MLM.

### Follow-Up Nudges

Scheduled Zalo template messages (leverage existing `src/integrations/zalo-webhook.js`):

| Stage | Delay | Template Pattern |
|-------|-------|-----------------|
| Cold → Warm | +4h | "Xin chào {name}! Mình có sản phẩm hay ho bạn có thể thích..." |
| Stalled Follow-up | +6h | "Bạn còn quan tâm đến sản phẩm mình giới thiệu không ạ?" |
| First Order → Repeat | +7d | "Hôm nay bạn cần bổ sung vitamin C không?" |
| Repeat → CTV | +14d | "Bạn muốn kiếm thêm thu nhập?..." |

**Zalo compliance:** Include sender's actual name, space ≥24h between messages, honor opt-out.

**Priority: MEDIUM**

### Stalled Prospect Escalation

```
L1: Auto reminder → assigned CTV     (48h idle)
L2: Alert → PSN Leader + reassign    (72h idle)
L3: Admin review, re-assignment      (120h idle)
```

Reuse existing Alert Engine with new alert types (extend `alertEngine.js`):
- `FETALERT_funnel_stalled_{stage_code}`
- Payload: prospect name, owner PSN, stage, days idle, suggested action

**Priority: MEDIUM**

### Funnel → Alert Rules Engine Integration

Extend `alertEngine.js` metric list:
```javascript
// New metrics
'lead_staleness_hours',       // max staleness in PSN team
'lead_conversion_rate_7d',    // % entering vs converting
'ctv_load_avg',               // avg leads per active CTV
'drop_off_rate',              // % leads entering → lost
'stage_velocity_avg',         // avg days to convert
```

New actions:
```javascript
'reassign_lead',              // auto-reassign stalled lead
'zalo_nudge_ctv',             // send Zalo template to CTV
'promote_recruit',            // auto-promote if criteria met
'notify_core_leader',         // escalation tier
```

**Priority: MEDIUM**

---

## 5. Vietnamese Market Specifics

### Zalo Webhook Integration

**Status:** Already exists at `src/integrations/zalo-webhook.js`.

**Enhancements needed:**
- Inbound Zalo messages from leads → auto-create Lead + trigger assignment
- Zalo OA template messages for follow-up nudges
- Zalo Mini App deep-link for lead → product catalog → order flow

**Priority: HIGH** — Zalo is primary comms channel (70M+ users).

### Social Selling Patterns

| Platform | MLM Use Case | Priority |
|----------|-------------|----------|
| Zalo (1:1 + OA) | Primary selling channel, contact hub | CRITICAL |
| Facebook | Group posts, testimonials, demos | HIGH |
| TikTok Shop | Short-form product demos, viral deals | HIGH |
| Instagram | Lifestyle posts, aspirational selling | MEDIUM |

**Funnel design implications:**
1. **Trust via social proof** — Customer testimonials ("Khách đã mua") at warm_lead stage
2. **Price negotiation culture** — "Giá riêng" field per PSN's prospects; show savings on dashboard
3. **COD dominant (~70%)** — Track COD vs e-wallet; different conversion rates per method
4. **Personal relationship first** — "Relationship level" field (friend/family/stranger) to tailor messages
5. **Team recruitment aspirational** — Showcase rank progression success stories at stages 3-5

### Mobile-First

- Dashboard must work on phone (PSN Leaders check on the go)
- PWA: installable, offline queue for lead status changes
- Large touch targets, Vietnamese keyboard support

**Priority: HIGH**

### Payment/Ordering Patterns

- COD dominant → dropp_off rate may include "COD refused"
- Momo/ZaloPay growing → higher retention than COD
- Integration point: Droppii webhook on `order.created` / `order.delivered` events

**Priority: MEDIUM**

---

## Integration Map

```
              ┌─────────────────────────────────┐
              │     Droppii Sales Training OS     │
              │                                  │
              │  ┌──────────┐  ┌─────────────┐   │
              │  │  Lead     │  │  Member      │   │
              │  │  Model    │  │  Model       │   │
              │  │ (7 stages,│  │ (4 roles,    │   │
              │  │  PDPA)    │  │  4 tiers)    │   │
              │  └─┬────────┘  └──────┬──────┘   │
              │    │                  │           │
              │  ┌─┴──────────────┐   │           │
              │  │ Alert Rules    │◄──┘           │
              │  │ Engine         │  staleness    │
              │  │ (extended)     │  triggers     │
              │  └─┬──────────────┘              │
              │    │                            │
              │  ┌─┴──────────────┐             │
              │  │ Zalo OA        │◄────────────┘
              │  │ Integration    │ nudges/notify
              │  └───┬────────────┘             │
              │      │                          │
              │  ┌───┴────────────┐             │
              │  │ Auto-Assign    │              │
              │  │ Service        │              │
              │  └────────────────┘              │
              │                                  │
              │  ┌─────────────────────────┐     │
              │  │ Dashboard (Vite/React)   │     │
              │  │ - PSN Leader: funnel +   │     │
              │  │   stalled list           │     │
              │  │ - Admin: Sankey + table  │     │
              │  └─────────────────────────┘     │
              └─────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────┴────┐          ┌────┴────┐
         │ Droppii │          │  Zalo   │
         │  API    │          │  OA API │
         │(orders/ │          │ (templ.  │
         │ products)│          │ /webhooks)│
         └─────────┘          └──────────┘
```

---

## Priority Matrix

| Feature | Priority | Effort | Dependencies |
|---------|----------|--------|-------------|
| Extend funnel to 7 stages (-1→6) | HIGH | Small | Lead model migration |
| Staleness detection in Alert Engine | HIGH | Low | Existing `alertEngine.js` |
| Auto-assign CTV round-robin | HIGH | Medium | Member/PSN query + cron |
| Zalo nudge automation | HIGH | Medium | Existing Zalo webhook |
| PSN Leader funnel dashboard | HIGH | Medium | Recharts + leads API |
| Prospect activity tracking | MEDIUM | Small | `prospect_activities` table |
| Follow-up nudge templates | MEDIUM | Medium | Zalo template setup |
| Stalled prospect escalation | MEDIUM | Medium | Alert engine extension |
| Admin org-wide Sankey view | MEDIUM | High | d3-sankey + aggregation |
| Funnel snapshot aggregation | MEDIUM | Medium | D1 table + cron |
| Social selling tracking (ref codes) | MEDIUM | Small | Lead model field |
| COD/payment tracking | MEDIUM | Medium | Droppii webhook (future) |
| Training-funnel gating (M1-M4) | LOW | High | Module completion events |
| Team Builder auto-promotion | LOW | Medium | Recruit count logic |

---

## Open Questions

1. **Droppii API access:** Do we have webhook access to Droppii for `order.created` / `order.delivered` events to auto-advance funnel stages?
2. **Zalo OA template approval:** Are Zalo message templates already ministry-approved for automated sends?
3. **Funnel level -1 persistence:** Should "visitor" stage be persisted as a Lead row, or tracked as event-only?
4. **Commission split on conversion:** When Lead → CTV (Level 4), does the referring PSN Leader get commission? Need business model clarity.
5. **Multi-PSN membership:** Can a Member belong to >1 PSN team? Current model uses `psnId` as single FK.
6. **Zalo message rate limits:** What daily cap applies to automated nudges to avoid spam flags?
