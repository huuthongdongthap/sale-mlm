# Funnel OS Backend Architecture Report
**Date:** 2026-07-03 | **Project:** SALE MLM / Hive Warfare Academy | **Ver:** 2.0

---

## 1. Current State Assessment

### What Already Exists (Production)
| Component | Location | Status |
|-----------|----------|--------|
| Migration 0004: leads, products, orders, order_items, coach_sessions, journey_events | `migrations/0004_funnel_tables.sql` | Applied to D1 |
| Worker routes: leads CRUD, products list, orders create, journey events | `src/workers/index.js:980-1178` | Deployed |
| Frontend: leads table view (filter + pagination + detail modal) | `src/dashboard/leads-view.js` | Built |
| Frontend: funnel analytics visualization (conversion rates + revenue) | `src/dashboard/funnel-view.js` | Built |
| 6 products seeded (magnet→continuity) | seed script | Done |

### What's Missing (Gaps)
| Gap | Impact |
|-----|--------|
| No `funnel_stages` table — stages are hardcoded as L0-L4 | Can't customize funnel stages |
| No `stage_transitions` audit log | Can't track why a lead moved stages |
| No `follow_up_schedules` table | No automated follow-up system |
| No `funnel_metrics` aggregation | `handleFunnelMetrics` computes on-the-fly — slow for large datasets |
| No `funnel_automation_rules` table | Automation rules are in-memory only |
| No bulk import/export | Can't migrate leads from spreadsheets |
| No PSN-downline funnel view | PSN Leaders can't see their team's pipeline |
| No RBAC enforcement on funnel endpoints | Any authenticated user can access all leads |
| No caching on funnel metrics | Every analytics request hits D1 |

---

## 2. Database Schema Design

### New Tables Required

```sql
-- ============================================================
-- MIGRATION 0005: Funnel OS Phase 2 Tables
-- ============================================================

-- 2a. Funnel Stages (configurable pipeline stages)
CREATE TABLE IF NOT EXISTS funnel_stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,              -- e.g. "Lead Magnet", "Trial"
    slug TEXT NOT NULL UNIQUE,       -- e.g. "l0-magnet"
    level INTEGER NOT NULL,          -- sort order: 0, 1, 2, 3, 4
    description TEXT,
    color_hex TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT '🧲',
    is_active INTEGER DEFAULT 1,
    is_entry_stage INTEGER DEFAULT 0,  -- True if new leads start here
    is_conversion_stage INTEGER DEFAULT 0,  -- True if this is a "buy" stage
    required_training_module TEXT,    -- FK-ish: M1, M2... blocks progression until done
    required_habit_score REAL,        -- Min habit score to advance
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stages_level ON funnel_stages(level);
CREATE INDEX IF NOT EXISTS idx_stages_active ON funnel_stages(is_active, sort_order);

-- Seed: 5 default stages (idempotent)
INSERT OR IGNORE INTO funnel_stages (id, name, slug, level, color_hex, icon, is_entry_stage, is_conversion_stage, required_training_module, required_habit_score, sort_order)
VALUES
    ('stage-l0', 'Lead Magnet', 'l0-magnet', 0, '#3B82F6', '🧲', 1, 0, NULL, 0, 0),
    ('stage-l1', 'Trial', 'l1-trial', 1, '#8B5CF6', '🎁', 0, 1, 'M3', 2.5, 1),
    ('stage-l2', 'Health Active', 'l2-health', 2, '#10B981', '💚', 0, 1, 'M4', 3.5, 2),
    ('stage-l3', 'Combo', 'l3-combo', 3, '#F59E0B', '🎯', 0, 1, NULL, 4.0, 3),
    ('stage-l4', 'CTV Partner', 'l4-partner', 4, '#EF4444', '🤝', 0, 0, 'M5', 0, 4);

-- 2b. Extend leads table: add stage_id FK + soft-delete
ALTER TABLE leads ADD COLUMN stage_id TEXT REFERENCES funnel_stages(id);
ALTER TABLE leads ADD COLUMN deleted_at TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_deleted ON leads(deleted_at) WHERE deleted_at IS NULL;

-- Backfill: set stage_id based on existing funnel_level
UPDATE leads SET stage_id = 'stage-l' || CAST(CAST(funnel_level AS INTEGER) AS TEXT) WHERE stage_id IS NULL;

-- 2c. Stage Transitions Log (audit trail for lead movement)
CREATE TABLE IF NOT EXISTS stage_transitions (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    from_stage_id TEXT,
    to_stage_id TEXT NOT NULL,
    triggered_by TEXT,               -- member_id or 'system' or 'automation_rule:xxx'
    trigger_type TEXT DEFAULT 'manual',  -- manual, automated, purchase, training_complete
    notes TEXT,
    metadata_json TEXT DEFAULT '{}', -- { order_id, intent_score, automation_rule_id }
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (from_stage_id) REFERENCES funnel_stages(id),
    FOREIGN KEY (to_stage_id) REFERENCES funnel_stages(id)
);
CREATE INDEX IF NOT EXISTS idx_transitions_lead ON stage_transitions(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transitions_trigger ON stage_transitions(trigger_type, created_at);

-- 2d. Follow-up Schedules
CREATE TABLE IF NOT EXISTS follow_up_schedules (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    assigned_to TEXT,                -- member_id (CTV who owns this follow-up)
    type TEXT NOT NULL,              -- call, message, meeting, check_in, escalate
    due_at TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',  -- low, medium, high, critical
    status TEXT DEFAULT 'pending',   -- pending, completed, snoozed, cancelled, overdue
    notes TEXT,
    reminder_sent INTEGER DEFAULT 0,
    completed_at TEXT,
    completed_by TEXT,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);
CREATE INDEX IF NOT EXISTS idx_followup_lead ON follow_up_schedules(lead_id, due_at);
CREATE INDEX IF NOT EXISTS idx_followup_assignee ON follow_up_schedules(assigned_to, status, due_at);
CREATE INDEX IF NOT EXISTS idx_followup_status ON follow_up_schedules(status, due_at);

-- 2e. Funnel Metrics Aggregation (denormalized for fast reads)
-- Updated by cron job (runs hourly) — avoids expensive GROUP BY on leads/orders at query time
CREATE TABLE IF NOT EXISTS funnel_metrics (
    id TEXT PRIMARY KEY,
    stage_id TEXT NOT NULL,
    period TEXT NOT NULL,            -- '2026-07' (monthly) or '2026-W27' (weekly) or '2026-07-03' (daily)
    period_type TEXT NOT NULL,       -- daily, weekly, monthly
    count INTEGER DEFAULT 0,
    entered_count INTEGER DEFAULT 0,    -- leads that entered this stage in period
    exited_count INTEGER DEFAULT 0,     -- leads that left this stage in period
    converted_count INTEGER DEFAULT 0,  -- leads that reached a conversion stage
    avg_time_in_stage_hours REAL DEFAULT 0,
    revenue_vnd INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (stage_id) REFERENCES funnel_stages(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_stage_period ON funnel_metrics(stage_id, period, period_type);

-- 2f. Automation Rules (persisted version of in-memory rules)
CREATE TABLE IF NOT EXISTS funnel_automation_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL,     -- lead_created, stage_entered, order_created, habit_score_changed, training_completed
    trigger_conditions_json TEXT DEFAULT '{}',  -- { "intent_score": { ">=": 70 }, "status": "new" }
    action_type TEXT NOT NULL,       -- assign_ctv, send_message, create_followup, advance_stage, notify_leader, notify_admin
    action_params_json TEXT DEFAULT '{}',  -- { "days": 3, "template_id": "welcome-msg" }
    target_stage_id TEXT,            -- for advance_stage action
    is_active INTEGER DEFAULT 1,
    run_order INTEGER DEFAULT 0,     -- execution order when multiple rules match
    run_count INTEGER DEFAULT 0,     -- how many times triggered
    last_triggered_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_automation_event ON funnel_automation_rules(trigger_event, is_active);

-- Seed: default automation rules
INSERT OR IGNORE INTO funnel_automation_rules (id, name, trigger_event, trigger_conditions_json, action_type, action_params_json, run_order)
VALUES
    ('auto-assign-new-lead', 'Auto-assign new leads round-robin', 'lead_created', '{}', 'assign_ctv', '{"mode": "round_robin"}', 1),
    ('auto-welcome-msg', 'Send welcome message on L0 entry', 'stage_entered', '{"stage_id": "stage-l0"}', 'send_message', '{"template": "welcome-l0"}', 2),
    ('auto-create-followup-l1', 'Create follow-up 3 days after L1 entry', 'stage_entered', '{"stage_id": "stage-l1"}', 'create_followup', '{"due_days": 3, "type": "call", "priority": "high"}', 3),
    ('auto-notify-leader-hot-lead', 'Notify leader when intent_score >= 80', 'lead_created', '{"intent_score": {">=": 80}}', 'notify_leader', '{"severity": "high"}', 4),
    ('auto-escalate-lost', 'Escalate to admin if lead marked lost without contact', 'stage_entered', '{"stage_id": "stage-lost"}', 'notify_admin', '{"severity": "warning"}', 5);

-- 2g. Bulk Import Jobs (track CSV imports)
CREATE TABLE IF NOT EXISTS bulk_import_jobs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,       -- leads, products
    status TEXT DEFAULT 'pending',   -- pending, processing, completed, failed
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    errors_json TEXT DEFAULT '[]',
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_import_status ON bulk_import_jobs(status, created_at DESC);
```

### Rationale for Key Design Decisions

1. **`stage_id` on leads replaces `funnel_level` as the source of truth** — `funnel_level` kept as denormalized integer for backward compat with frontend. New code uses `stage_id`.

2. **`stage_transitions` replaces journey_events for stage movement** — `journey_events` kept for backward compat. New logic writes to both or migrates to `stage_transitions`.

3. **`funnel_metrics` pre-aggregated table** — D1 has no materialized views. Hourly cron job computes counts → eliminates slow multi-table GROUP BY on every analytics page load.

4. **`trigger_conditions_json` uses simple key-value DSL** — Same pattern as existing `alertEngine.js` rule DSL (`metric, op, threshold`). Evaluated in code, not SQL.

5. **`follow_up_schedules` has `assigned_to` FK to members** — Not a hard FK (D1 doesn't enforce FK in Workers mode), but logically links to `members.id`.

---

## 3. REST API Design

### Base Route Structure
```
/api/funnel              (Funnel OS namespace — clean separation)
├── stages               (CRUD for funnel stages)
├── leads                (CRUD for prospects/leads)
├── leads/:id/journey    (stage transition history)
├── leads/:id/followups  (follow-up schedules)
├── leads/:id/assign     (assign lead to CTV)
├── orders               (order CRUD — moves here from /api/orders)
├── followups            (follow-up CRUD)
├── metrics              (funnel analytics)
├── automation           (automation rule CRUD)
├── import               (bulk import endpoints)
└── export               (bulk export endpoints)
```

### Endpoint Specifications

#### 3a. Funnel Stages

```
GET    /api/funnel/stages
    Auth: requireAuth
    Response: { stages: [...] }
    Lists all active stages sorted by sort_order.
    Admin only: include inactive.

GET    /api/funnel/stages/:id
    Auth: requireAuth
    Response: { stage: {...} }

POST   /api/funnel/stages
    Auth: requireAdmin
    Body: { name, slug, level, color_hex, icon, is_entry_stage, is_conversion_stage, required_training_module, required_habit_score }
    Response: { stage: {...} } 201

PATCH  /api/funnel/stages/:id
    Auth: requireAdmin
    Body: { name?, color_hex?, is_active?, ... }
    Response: { stage: {...} }

DELETE /api/funnel/stages/:id
    Auth: requireAdmin
    Response: { success: true }
    Constraint: Cannot delete if stage has active leads (count > 0).
```

#### 3b. Leads (Expanded)

```
POST   /api/funnel/leads
    Auth: public (no token) for L0 capture
    Body: { name?, email (required), phone?, source?, quiz_answers?, intent_score? }
    Response: { id, funnel_level: 'L0', stage_id: 'stage-l0', status: 'new' } 201
    Triggers: automation rules on lead_created

GET    /api/funnel/leads
    Auth: requireAuth
    RBAC:
      - Member: sees only leads assigned to them (assigned_ctv_id = me)
      - PSN Leader: sees own + downline members' assigned leads
      - Core Leader / Admin: sees all
    Query params:
      - level (string, comma-separated: L0,L1)
      - status (string: new|contacted|qualified|converted|lost)
      - assigned_ctv_id (string)
      - stage_id (string)
      - min_intent_score (int)
      - source (string)
      - date_from, date_to (ISO date string)
      - limit (default 50, max 100)
      - offset
      - includePII (boolean, Admin/Core only)
    Response: { leads: [...], total, pagination: { limit, offset, hasMore } }
    Columns returned depend on role (PII scrub for non-admin).

GET    /api/funnel/leads/:id
    Auth: requireAuth
    RBAC: same scoping as list
    Response: { lead: { ..., stage: {...}, recent_followups: [...], recent_transitions: [...] } }
    Joins stage name + last 5 follow-ups + last 3 transitions.

PATCH  /api/funnel/leads/:id
    Auth: requireAuth
    RBAC:
      - Member: can only update leads assigned to them, limited fields (status, notes)
      - PSN Leader: can update own + downline leads
      - Core/Admin: full update
    Body: { stage_id?, status?, assigned_ctv_id?, notes?, intent_score?, funnel_level? }
    Response: { lead: {...} }
    Side effects:
      - If stage_id changes → INSERT INTO stage_transitions
      - If status changes → INSERT INTO stage_transitions (trigger_type: status_change)
      - If stage_id changes → evaluate automation rules

DELETE /api/funnel/leads/:id
    Auth: requireAdmin
    Soft delete (SET deleted_at = now()).
    Response: { success: true }
```

#### 3c. Stage Transitions

```
GET    /api/funnel/leads/:id/journey
    Auth: requireAuth
    Response: { transitions: [...], lead: { id, name } }
    Returns stage_transitions joined with stage names.

POST   /api/funnel/leads/:id/transition
    Auth: requireAuth
    RBAC: CTV can self-assign transition, PSN Leader can force transition for downline
    Body: { to_stage_id, notes? }
    Response: { transition: {...} }
    Validation:
      1. Check if target stage exists and is active
      2. Check if transition satisfies stage requirements (required_training_module, required_habit_score)
      3. INSERT INTO stage_transitions
      4. UPDATE leads SET stage_id, funnel_level, updated_at
      5. Evaluate automation rules (trigger: stage_entered)
      6. Check if lead reached conversion stage → alert rules engine
```

#### 3d. Follow-up Schedules

```
GET    /api/funnel/followups
    Auth: requireAuth
    RBAC: Member sees own, PSN Leader sees own + downline, Admin sees all
    Query: status?, due_before?, assigned_to?, lead_id?
    Response: { followups: [...], total }

POST   /api/funnel/followups
    Auth: requireAuth
    Body: { lead_id, type, due_at, priority?, notes? }
    Response: { followup: {...} } 201

PATCH  /api/funnel/followups/:id
    Auth: requireAuth
    Body: { status?, notes?, priority? }
    Completing: { status: 'completed', completed_at: now(), completed_by: claims.id }
    Response: { followup: {...} }

DELETE /api/funnel/followups/:id
    Auth: requireAuth
    Must be owner or Admin.
    Response: { success: true }
```

#### 3e. Funnel Analytics

```
GET    /api/funnel/metrics
    Auth: requireAuth
    Query params:
      - period_type: daily | weekly | monthly (default: monthly)
      - period: "2026-07" | "2026-W27" | "2026-07-03" (default: current)
      - stage_id: filter to specific stage
    Response: {
      summary: {
        total_leads, total_orders, total_revenue_vnd,
        overall_conversion_rate: "%",
        avg_time_to_convert_hours
      },
      stages: [
        {
          stage_id, name, level, color_hex, icon,
          count, entered_count, exited_count,
          conversion_rate: "%",           -- from L0 to this stage
          avg_time_in_stage_hours,
          revenue_vnd, orders_count
        }
      ],
      conversion_funnel: [               -- step-by-step rates
        { from: "L0", to: "L1", rate: 15.2, count: 50 },
        ...
      ]
    }

GET    /api/funnel/metrics/kanban    (Kanban board data)
    Auth: requireAuth
    Query: assigned_ctv_id? (default: self for Member)
    Response: {
      columns: [
        { stage_id, name, color_hex, icon, leads: [...] }
      ]
    }
    Each lead: { id, name, intent_score, assigned_ctv_id, last_contact, followup_due }
```

#### 3f. Bulk Import/Export

```
POST   /api/funnel/import/leads
    Auth: requirePSNLeader
    Body: multipart/form-data with CSV file
    Headers: Content-Type: multipart/form-data
    Async: Returns { job_id } immediately, processes in background
    CSV columns: name, email, phone, source, intent_score, notes
    Rate limit: 1000 leads per import, 1 import per 5 min per user
    Response: { job_id, status: 'processing', estimated_rows: N }

GET    /api/funnel/import/:job_id/status
    Auth: requireAuth
    Response: { status, total_rows, processed_rows, success_count, error_count, errors? }

GET    /api/funnel/export/leads
    Auth: requirePSNLeader
    Query: same filters as GET /api/funnel/leads
    Response: CSV blob (Content-Type: text/csv)
    Max: 10,000 rows per export

POST   /api/funnel/export/orders
    Auth: requirePSNLeader
    Query: date_from, date_to, ctv_id?
    Response: CSV with orders + lead + product join
```

#### 3g. Automation Rules

```
GET    /api/funnel/automation
    Auth: requireAuth
    RBAC: Core/Admin see all, PNL sees own PSN's rules
    Response: { rules: [...] }

POST   /api/funnel/automation
    Auth: requireAdmin
    Body: { name, trigger_event, trigger_conditions_json, action_type, action_params_json, target_stage_id?, run_order? }
    Response: { rule: {...} } 201

PATCH  /api/funnel/automation/:id
    Auth: requireAdmin
    Body: { is_active?, action_params_json?, ... }
    Response: { rule: {...} }

DELETE /api/funnel/automation/:id
    Auth: requireAdmin
    Response: { success: true }

POST   /api/funnel/automation/:id/test
    Auth: requireAdmin
    Body: { test_lead_id or mock_conditions_json }
    Response: { would_trigger: bool, matching_rules: [...], would_actions: [...] }
```

---

## 4. Integration with Existing System

### 4a. Members API Integration

**How Funnel OS connects to Members:**

The `leads` table has `assigned_ctv_id` — a member ID from the `members` table. When a lead is created:

1. Automation rule `auto-assign-new-lead` fires → selects an available CTV from `members` where `role IN ('PSN Leader', 'CTI Member')`
2. Round-robin logic: pick CTV with fewest uncontacted leads assigned
3. `leads.assigned_ctv_id = member.id`

**PSN-downline funnel view:**

```sql
-- PSN Leader sees their downline's assigned leads
-- Joins members → referrals → leads via referrer chain
WITH RECURSIVE downline AS (
    SELECT id FROM members WHERE id = ? AND role IN ('PSN Leader', 'Core Leader')
    UNION ALL
    SELECT m.id FROM members m
    JOIN referrals r ON r.referee_id = m.id
    JOIN downline d ON r.referrer_id = d.id
)
SELECT l.* FROM leads l
WHERE l.assigned_ctv_id IN (SELECT id FROM downline)
  AND l.status != 'lost'
ORDER BY l.created_at DESC;
```

**Training progress → funnel stage blocking:**

When Funnel OS checks stage transition eligibility:
```
IF target_stage.required_training_module IS NOT NULL:
    Lookup training_progress or training_records
    IF member has NOT completed required_module:
        RETURN error: "Complete M3 first before advancing to L1"
```

This creates a learning-gated funnel — leads can't progress until their assigned CTV completes training. Enforces system integrity.

### 4b. Alert Rules Engine Integration

**New funnel-specific alert rules** (add to `alerts_log` table, evaluate via `alertEngine.js`):

| New Metric | Description | Alert |
|------------|-------------|-------|
| funnel_drop_off_Lx | % of leads getting stuck at stage x > 7 days | PSN Leader notified |
| ctv_overload | CTV has >20 active followups | Admin notified |
| lead_waiting_hours | New lead unassigned > 4 hours | Auto-assign trigger |
| conversion_drop | Weekly conversion rate drops > 50% vs prior week | Core Leader notified |
| stage_overflow | >50 leads in any single stage | Admin notified |

All funnel alerts use the same `alerts_log` table and evaluation pipeline. Extend `alertEngine.js` with new metric names in the evaluation scope.

```javascript
// In alertEngine.js — extend evaluateAll to include funnel metrics
const funnelMetrics = await getFunnelSnapshot(env); // aggregate from stage_transitions
const evaluationScope = { ...psnMetrics, ...funnelMetrics };
```

### 4c. Cron Integration

Existing cron runs daily (`0 0 * * *` in wrangler.toml). Add funnel-specific cron jobs:

```toml
# Add to wrangler.toml:
[triggers]
crons = [
    "0 0 * * *",     # nightly: commission batch + PSN health
    "0 * * * *",     # hourly: funnel_metrics aggregation
    "*/15 * * * *"   # every 15min: followup reminder check + automation rule eval
]
```

New cron handlers:
1. **Hourly**: Compute funnel_metrics rollup (replaces ad-hoc GROUP BY)
2. **Every 15 min**: Run automation rules → create followups, send notifications, advance stages
3. **Daily**: Clean up stale "pending" followups (>30 days → mark expired)

---

## 5. Cloudflare D1 Migration Considerations

### 5a. SQL Schema Notes for D1

- **No ALTER TABLE DROP COLUMN**: D1 uses SQLite. Dropping columns requires the "create new table + copy + rename" pattern.
- **No JSONB**: Use `TEXT` with `JSON.stringify()` / `JSON.parse()`. Already used throughout (`metadata_json`, `quiz_answers`).
- **No partial indexes**: D1 supports `WHERE` in CREATE INDEX (SQLite 3.8.0+), but test before relying on it.
- **Foreign keys are not enforced by default in Workers**: D1 in Worker mode runs with `PRAGMA foreign_keys = OFF`. Enforce at application level.
- **Concurrent writes**: SQLite serializes writes. At our volume (~100 writes/day for leads), this is not a concern. If volume spikes, batch writes in a single transaction.

### 5b. Migration Strategy

```
Phase 0 (DONE): leads, products, orders, order_items, coach_sessions, journey_events
Phase 1: Add funnel_stages, stage_transitions, follow_up_schedules, funnel_automation_rules
Phase 2: Add funnel_metrics aggregation table + cron job
Phase 3: Migrate journey_events → stage_transitions (backfill, keep old for 30 days, then drop)
Phase 4: Convert leads.funnel_level INTEGER → leads.stage_id TEXT (backfill + drop old column)
```

**Backfill script pattern** (Python via `wrangler d1 execute`):
```bash
# Run during maintenance window
wrangler d1 execute hive-warfare-db --file migrations/0005_funnel_stages.sql
wrangler d1 execute hive-warfare-db --command "UPDATE leads SET stage_id = 'stage-l' || CAST(CAST(funnel_level AS INTEGER) AS TEXT) WHERE stage_id IS NULL"
```

### 5c. Query Patterns for Funnel Analytics

**Anti-pattern: Live GROUP BY on every page load**
```sql
-- DON'T DO THIS: 5 queries joining 3 tables each
SELECT funnel_level, COUNT(*) FROM leads GROUP BY funnel_level;
SELECT p.tier, SUM(total_vnd) FROM orders o JOIN products p ON ... GROUP BY p.tier;
-- ... repeated on every analytics page load
```

**Pattern: Pre-aggregate + cache**
```sql
-- Hourly cron: compute and store
INSERT OR REPLACE INTO funnel_metrics (id, stage_id, period, period_type, count, ...)
VALUES (?, ?, ?, ?, ?, ...)
```

```javascript
// API: simple lookup + KV cache
async function handleFunnelMetrics(env) {
    const periodType = url.searchParams.get('period_type') || 'daily';
    const period = url.searchParams.get('period') || today();
    const cacheKey = `metrics:${periodType}:${period}`;

    return cacheGetOrFetch(env, cacheKey, async () => {
        const { results } = await env.DB.prepare(
            'SELECT * FROM funnel_metrics WHERE period_type = ? AND period = ?'
        ).bind(periodType, period).all();
        return computeSummary(results);
    }, 300); // 5 min TTL on KV
}
```

---

## 6. RBAC Design for Funnel OS

### Permission Matrix

| Action | Member | PSN Leader | Core Leader | Admin |
|--------|--------|------------|-------------|-------|
| Create lead (L0 capture) | Public (no auth) | Public | Public | Public |
| View own assigned leads | YES | YES | YES | YES |
| View downline leads | NO | YES (own PSN) | YES (all) | YES |
| View all leads | NO | NO | YES | YES |
| Assign lead to CTV | Own only | Downline + own | All | All |
| Update lead stage | Own only (can request) | Downline + own | All | All |
| Create follow-up | Own only | Own + downline | All | All |
| View funnel metrics | Own only | Own PSN | All | All |
| Manage stages | NO | NO | NO | YES |
| Manage automation rules | NO | NO | YES | YES |
| Bulk import/export | NO | YES (own) | YES (all) | YES |
| Delete lead | NO | NO | NO | YES |

### Implementation Pattern

Extend `requireRole` middleware with funnel-specific helpers:

```javascript
// In src/middleware/requireRole.js — add:
async function getVisibleLeadScope(claims, env) {
    // Returns a WHERE clause + params for lead queries
    if (claims.role === 'Admin' || claims.role === 'Core Leader') {
        return { where: '', params: [] };  // No filter — sees all
    }
    if (claims.role === 'PSN Leader') {
        // Get downline member IDs via referrals recursive CTE
        const downlineIds = await getDownlineIds(env, claims.id);
        const ids = [...downlineIds, claims.id].map(id => `'${id}'`).join(',');
        return { where: `AND (l.assigned_ctv_id IN (${ids}) OR l.assigned_ctv_id IS NULL)`, params: [] };
    }
    // Member: only own assigned leads
    return { where: 'AND l.assigned_ctv_id = ?', params: [claims.id] };
}
```

### PII Masking for Funnel Data

Same pattern as Members API. Phone numbers are `phone_encrypted` — only Admin/Core can see decrypted values. In lead list responses, non-admin users see `phone: "+84***1234"`.

---

## 7. Caching Strategy

### What to Cache (KV Namespace: `CACHE`)

| Data | TTL | Invalidation Trigger |
|------|-----|---------------------|
| Funnel stage definitions | 1 hour | Admin updates stage config |
| Funnel metrics (daily/weekly/monthly) | 5 min | New order created, lead transitions |
| CTV workload (followup count per CTV) | 2 min | Followup created/completed |
| Automation rules | 5 min | Admin CRUD |
| PSN downline member list | 10 min | New member joins PSN |

### What NOT to Cache
- Individual lead data (too volatile, low TTL benefit)
- Follow-up schedules (real-time requirement)
- Order detail (financial data — must hit source of truth)

### Cache Pattern (consistent with existing workers)

```javascript
const CACHE_TTL = {
    funnelStages: 3600,      // 1h
    funnelMetrics: 300,      // 5min
    ctvWorkload: 120,        // 2min
    automationRules: 300,    // 5min
    psnDownline: 600         // 10min
};

async function getActiveStages(env) {
    return cacheGetOrFetch(env, 'funnel:stages', async () => {
        const { results } = await env.DB.prepare(
            'SELECT * FROM funnel_stages WHERE is_active = 1 ORDER BY sort_order'
        ).all();
        return results;
    }, CACHE_TTL.funnelStages);
}
```

### Invalidation Pattern

Write-through: when admin updates stages or rules, invalidate immediately:
```javascript
await env.CACHE.delete('funnel:stages');
await env.CACHE.delete('funnel:automation:rules');
// Then write-through to D1
await env.DB.prepare('UPDATE funnel_stages SET ...').run();
```

---

## 8. Performance Considerations

### Pagination Strategy

| Endpoint | Default | Max | Strategy |
|----------|---------|-----|----------|
| Leads list | 50 | 100 | Offset pagination (LIMIT/OFFSET) |
| Orders list | 50 | 100 | Offset pagination |
| Follow-ups | 20 | 50 | Offset pagination |
| Journey events | 50 | 200 | Offset pagination (always sorted DESC) |
| Stage transitions | 50 | 200 | Offset pagination |

Keyset pagination for "real-time" feeds (kanban board sorted by last_contact):
```javascript
// Instead of OFFSET, use WHERE id < last_seen_id
const lastId = url.searchParams.get('cursor');
const sql = lastId
    ? 'SELECT ... WHERE id < ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT ... ORDER BY created_at DESC LIMIT ?';
params.push(lastId, limit);
```

### Real-time Kanban Board

Cloudflare Workers has 10ms CPU time limit. For kanban board refresh:
1. **Client-side optimistic updates**: Drag-and-drop updates local state immediately
2. **Debounced server sync**: Batch updates, send every 2s
3. **WebSocket-free**: Use polling at 30s intervals for board refresh
4. **Server-sent events (SSE) on Cloudflare**: Not practical at free tier — defer to paid plan

```javascript
// Kanban polling: 1 endpoint returns full board state
GET /api/funnel/metrics/kanban
// Returns all columns with lead counts + recent 3 leads per column
// Client renders with drag-and-drop + status badges
// On drop: PATCH /api/funnel/leads/:id { stage_id: newStageId }
```

### Query Optimization for D1

```sql
-- Composite index for the most common filter: assigned CTV + status + stage
CREATE INDEX IF NOT EXISTS idx_leads_assignment ON leads(assigned_ctv_id, status, stage_id, created_at DESC);

-- For funnel metrics: cover index to avoid table lookup
CREATE INDEX IF NOT EXISTS idx_transitions_lead_ts ON stage_transitions(lead_id, created_at DESC)
    INCLUDE (from_stage_id, to_stage_id, trigger_type);

-- Follow-up reminder query: indexed by status + due_at
-- Already covered by idx_followup_status + idx_followup_assignee
```

---

## 9. Key Files to Modify

| File | Change |
|------|--------|
| `migrations/0005_funnel_stages.sql` | **NEW** — 8 new tables |
| `src/workers/index.js` | Add 12+ new handler functions (~400 lines), RBAC middleware extensions |
| `src/middleware/requireRole.js` | Add `getVisibleLeadScope()` helper, funnel-specific role shortcuts |
| `src/analytics/alertEngine.js` | Extend `DEFAULT_RULES` with funnel metrics, extend `evaluateAll()` scope |
| `src/api/alerts.js` | Wire new funnel alert types into existing alert endpoints |
| `src/db/adapter.js` | Add D1 adapter methods for new tables (if kept in Express sync) |
| `src/dashboard/router.js` | Add funnel/kanban/analytics routes |
| `src/dashboard/funnel-view.js` | **EXISTS** — update API URL to `/api/funnel/metrics` |
| `src/dashboard/leads-view.js` | **EXISTS** — update API URL to `/api/funnel/leads` |
| `wrangler.toml` | Add new cron triggers (hourly + 15min) |

---

## 10. Open Questions

1. **Zalo OA webhook**: When a Zalo message comes in for a lead at "L1 - Trial" stage, should automation automatically advance them? Decision needed on trigger logic.

2. **Coach sessions integration**: `coach_sessions` table exists but is unused. Should Funnel OS auto-create coach sessions when leads enter L1? Who is the "coach" — the assigned CTV or an AI agent?

3. **Lead merge/deduplication**: Quiz captures may create duplicate leads by email. Should we add a dedup step at creation time (UPSERT on email)?

4. **Data retention**: How long to keep `stage_transitions` and `journey_events` before archiving? Suggested: 90 days hot, 1 year cold, then delete. Need user confirmation.

5. **PSN hierarchy depth**: The recursive CTE for downline queries assumes 2-3 levels deep. If PSN lines go deeper (5+ levels), the recursive query may hit D1 performance limits. Need to validate with current network size.

--- end report -*-