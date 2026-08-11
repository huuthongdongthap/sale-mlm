# Codebase Exploration Report — droppii-training-os



## 1. Directory Tree Overview

```
SALE MLM/
├── package.json                    # Express backend (droppii-training-os)
├── .env.example                    # JWT, encryption, Zalo env vars
├── wrangler.toml                   # Cloudflare Workers config (D1 DB)
├── jest.config.js
├── bin/
│   └── kanban.js                   # CLI task board (kanban — status flow)
├── migrations/
│   ├── 0001_initial_schema.sql     # Core tables (members, habits, kpi_rollups, etc.)
│   ├── 0002_add_columns.sql
│   ├── 0003_optimizations_wave1.sql
│   ├── 0003_seed_alert_rules.sql
│   └── 0004_funnel_tables.sql      # Funnel OS tables (leads, products, orders, coach_sessions, journey_events)
├── src/
│   ├── server.js                   # Express app entry — all routes registered here
│   ├── auth/
│   │   └── jwt.js                  # Custom HMAC-SHA256 JWT (no external deps)
│   ├── api/
│   │   ├── auth.js                 # POST /auth/login, /auth/verify, /auth/users
│   │   ├── members.js              # CRUD /api/members (in-memory array)
│   │   ├── habits.js               # POST /checkin, GET /, /streak/:id, /snapshot, /quick
│   │   ├── kpi.js                  # POST /, GET /:member_id, GET /leaderboard
│   │   └── alerts.js               # GET /rules, POST /check, GET /log
│   ├── analytics/
│   │   ├── alertEngine.js          # 6 default rules, evaluateAll, acknowledge, summary
│   │   └── psnHealth.js            # 9-state Cuu Dia classifier (Sun Tzu)
│   ├── agents/
│   │   ├── onboardingBot.js        # 4-week state machine, Zalo-ready nudges
│   │   └── trainingOps.js          # Curriculum assignment (3 tiers), progress tracking
│   ├── models/
│   │   ├── member.js               # Member class — PDPA encryption, roles, seeded data
│   │   ├── habit.js                # Habit class — 6-point scoring, streak logic
│   │   ├── kpi.js                  # KPI class — tier targets from company.json
│   │   └── psn.js                  # PSN class (basic)
│   ├── middleware/
│   │   └── requireRole.js          # RBAC: Member < PSN Leader < Core Leader < Admin
│   ├── integrations/
│   │   ├── zalo-webhook.js         # Zalo OA webhook handler (message, follow, unfollow)
│   │   ├── redis.js
│   │   └── sentry.js
│   ├── features/
│   │   ├── referral.js             # Referral system with reward tiers
│   │   └── leaderDashboard.js      # Q2 OKR endpoints (mounted in server.js)
│   ├── utils/
│   │   ├── encryption.js           # AES-256-CBC PII encryption
│   │   ├── auditLog.js             # PDPA audit trail
│   │   └── monitoring.js           # Error tracking
│   ├── workers/
│   │   └── index.js                # Background workers
│   └── dashboard/                  # Vite + Vanilla JS SPA
│       ├── package.json            # vite ^5, @google/stitch-sdk
│       ├── vite.config.js
│       ├── index.html              # Hash-based SPA shell
│       ├── main.js                 # DashboardApp init, theme, accessibility
│       ├── style.css               # Dark luxury theme (brand-gold #C9A200)
│       ├── router.js               # Hash router: /, /members, /psn, /kpi, /training, /alerts, /funnel, /orders, /leads
│       ├── funnel-view.js          # Funnel OS analytics (5-tier visualization)
│       ├── leads-view.js            # Leads management CRUD
│       ├── orders-view.js           # Orders management
│       ├── psn-health.js
│       ├── kpi-panel.js
│       ├── alerts-inbox.js
│       ├── members-table.js
│       └── components/
│           ├── alert-card.js       # Alert card component (severity, acknowledge)
│           ├── kpi-card.js         # KPI card with sparkline, progress bar, status pill
│           ├── psn-card.js         # PSN card with SVG trajectory chart
│           ├── filter-chips.js
│           ├── kpi-modal.js
│           ├── members-table.js
│           ├── psn-legend.js
│           ├── severity-group.js
│           └── sparkline.js
├── docs/
│   ├── README.md
│   ├── 00_FOUNDER_MANIFESTO.md
│   ├── 01_GOAL.md                  # Template (unfilled)
│   ├── 02_AGENTS.md                # Template (unfilled)
│   ├── 03_ARCHITECTURE.md          # Template (unfilled)
│   ├── 04_ROADMAP.md
│   ├── 07_EVALUATION.md
│   ├── 08_BUSINESS_MODEL.md
│   ├── 09_BEHAVIOR_GRAPH.md        # Template (unfilled)
│   ├── 10_RISK_REGISTER.md
│   ├── 11_GLOSSARY.md
│   ├── 12_CHANGELOG.md
│   ├── SALE-MLM-COMMANDS-GUIDE.md
│   ├── d5-tpcn-disclaimer.md
│   └── g0-pilot-mockup-data.md
├── plans/                           # Implementation plans (many iterations)
├── content/                         # (empty)
├── telegram-bot/
│   └── README.md
└── .mekong/
    ├── company.json
    └── tasks.json
```

## 2. Backend Structure



### Pattern: Express.js Router-per-Resource
- Each domain has its own router file in `src/api/`, mounted on a path prefix in `server.js`
- Controllers use inline handler functions (no separate controller layer)
- Middleware is composed via `requireRole()` factory returning Express middleware
- Data is mostly in-memory (arrays/objects), NOT connected to the D1 adapter yet



### Existing API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | None | Email + password login, returns JWT |
| POST | /auth/verify | None | Verify JWT token |
| GET | /auth/users | None | List all users |
| POST | /api/habits/checkin | None | Record daily habit check-in |
| GET | /api/habits | None | List habits (filter by memberId, date) |
| GET | /api/habits/streak/:memberId | None | Get streak for member |
| POST | /api/habits/snapshot | None | Midnight snapshot |
| POST | /api/habits/quick | None | One-click habit report |
| GET | /api/habits/cron/midnight-snapshot | None | Cron stub |
| POST | /api/members | PSN Leader+ | Create member |
| GET | /api/members | Auth | List members (with tier/role/status filters, pagination) |
| GET | /api/members/:id | Auth | Get member by ID |
| PATCH | /api/members/:id | Auth | Update member |
| DELETE | /api/members/:id | Admin | Delete member |
| POST | /api/kpi | Admin/Core/PSN | Create KPI record |
| GET | /api/kpi/:member_id | Auth | KPI rollup (daily/weekly/monthly) |
| GET | /api/kpi/leaderboard | Auth | Member rankings |
| GET | /api/alerts/rules | None | List alert rules |
| POST | /api/alerts/check | None | Check alerts against member data |
| GET | /api/alerts/log | None | Alert history |
| POST | /api/analytics/psn-health | None | Classify PSN health |
| POST | /api/alerts/evaluate | None | Evaluate all rules against metrics |
| GET | /api/alerts/rules | None | Get all rules |
| GET | /api/alerts/log | None | Get alert log |
| GET | /api/alerts/summary | None | Get alert summary |
| POST | /api/alerts/:id/acknowledge | None | Acknowledge alert |
| POST | /api/onboarding/start | None | Start onboarding session |
| GET | /api/onboarding/:memberId | None | Get session |
| POST | /api/onboarding/:memberId/advance | None | Advance day |
| POST | /api/onboarding/:memberId/nudge | None | Generate nudge |
| POST | /api/onboarding/:memberId/habit | None | Record habit score |
| POST | /api/onboarding/:memberId/order | None | Record order |
| GET | /api/onboarding/:memberId/progress | None | Get progress |
| GET | /api/onboarding/active | None | Get active sessions |
| POST | /api/training/assign | None | Assign curriculum |
| POST | /api/training/progress | None | Update training progress |
| GET | /api/training/:memberId | None | Get training record |
| GET | /api/training/:memberId/progress | None | Get progress |
| GET | /api/training/active | None | Get active trainees |
| GET | /api/training/attention | None | Get trainees needing attention |
| GET | /api/training/psn/:psnId | None | Get trainees by PSN |
| GET | /health | None | Health check |
| GET | /api/monitoring/errors | None | Error log |
| GET | /api/monitoring/summary | None | Error summary |



### Frontend API Endpoints Consumed (but NOT yet implemented in backend)

| Method | Path | Frontend File |
|--------|------|---------------|
| GET | /api/analytics/funnel | funnel-view.js |
| GET | /api/leads | leads-view.js |
| GET | /api/leads/:id | leads-view.js |
| PATCH | /api/leads/:id | leads-view.js |
| GET | /api/leads/:id/journey | leads-view.js |
| GET | /api/orders | orders-view.js |
| GET | /api/orders/:id | orders-view.js |



### Middleware Pattern
```js
// requireRole factory — returns Express middleware
requireRole('Admin')                    // exact role
requireRole(['PSN Leader', 'Core Leader'])  // any of
requireAuth                             // shortcut: any authenticated user
requireAdmin                            // shortcut: Admin only
requireCoreLeader                       // Core Leader or Admin
requirePSNLeader                        // PSN Leader or above
```



## 3. Database Schema (D1/SQLite)

### Existing tables (0001_initial_schema.sql)

| Table | Key Columns |
|-------|-------------|
| members | id, name, email, email_encrypted, phone_encrypted, password_hash, role, tier, psn_id, referrer_id |
| habits | id, member_id, date, items, score, streak, wake_up_5am, zoom_attend, kaizen_journal, connects, orders |
| kpi_rollups | id, member_id, connects_per_day, followups_per_day, first_order_14d, habit_score, window, status, date |
| training_progress | id, member_id, type, value |
| training_records | member_id (PK), curriculum_name, current_module, current_day, completed_modules, zalo_phone, psn_id |
| psn_health_history | id, psn_id, state, risk_level, team_size, retention_30d, retention_90d, revenue_delta, activity_ratio |
| alerts_log | id, rule_id, metric, severity, evidence, psn_id, acknowledged |
| audit_trail | id, actor_id, action, resource_type, pii_fields |
| referrals | id, referrer_id, referee_id, tier_purchased, reward_vnd |
| onboarding_sessions | member_id (PK), current_week, current_day, habit_scores, orders_count |

### Funnel OS tables (0004_funnel_tables.sql) — NOT yet connected

| Table | Key Columns |
|-------|-------------|
| leads | id, email, phone_encrypted, funnel_level (L0-L4), intent_score, quiz_answers, assigned_ctv_id, status |
| products | id, name, slug, price_vnd, tier (magnet/tripwire/core/downsell/continuity), commission_pct |
| orders | id, lead_id, customer_id, ctv_referrer_id, product_id, total_vnd, status, payment_ref |
| order_items | id, order_id, product_id, quantity, unit_price_vnd, subtotal_vnd |
| coach_sessions | id, lead_id, coach_type, messages_json, gains_json, spin_json, need_score, intent_score |
| journey_events | id, lead_id, event_type, from_level, to_level, metadata_json |

### Gap: The `src/db/adapter.js` (DatabaseAdapter) EXISTS with D1 queries but is NOT wired into any route handler. All "database" operations currently use in-memory arrays.



## 4. Frontend Architecture

### Stack: Vite 5 + Vanilla JS (ES modules, no framework)

### Router: Hash-based SPA (`src/dashboard/router.js`)
Routes: `/`, `/members`, `/psn`, `/kpi`, `/training`, `/alerts`, `/funnel`, `/orders`, `/leads`

### Theme: Dark Luxury
- Base: `#0A0A0A` bg, `#1A1A1A` cards
- Brand gold: `#C9A200` primary accent, `#FFD700` bright accent
- Fonts: Playfair Display (display), Inter (body), JetBrains Mono (data)
- CSS custom properties throughout
- Shadow: `0 8px 32px rgba(201, 162, 0, 0.1)` luxury shadow



### Component Pattern
- Each page is a class with `render(container)` method that returns HTML string
- Components use `export function createXxx()` or `export class Xxx`
- Styles are injected as `<style>` tags via JS (not external CSS)
- API base URL is hardcoded: `https://hive-warfare-os.sadec-marketing-hub.workers.dev`



### UI Components Summary

| Component | File | Purpose |
|-----------|------|---------|
| AlertCard | components/alert-card.js | Individual alert display with severity, ack button, evidence, suggested action |
| KPICard | components/kpi-card.js | Metric card with status pill (RED/YELLOW/GREEN), sparkline, progress bar |
| PSCCard | components/psn-card.js | PSN health card with SVG trajectory chart, escalation badge, risk indicator |
| Sparkline | components/sparkline.js | SVG sparkline chart |
| FilterChips | components/filter-chips.js | Filter UI |
| KpiModal | components/kpi-modal.js | KPI detail modal |
| SeverityGroup | components/severity-group.js | Group alerts by severity |



## 5. Key Backend Patterns

### Controller Style
```js
router.post('/endpoint', requireRole('Admin'), validateMiddleware, (req, res) => {
  try {
    // business logic using in-memory arrays
    res.status(201).json({ success: true, data: ... });
  } catch (error) {
    res.status(500).json({ error: 'Loi he thong', code: 'INTERNAL_SERVER_ERROR' });
  }
});
```

### Model Pattern
```js
class Member {
  constructor(data = {}) { ... }
  toJSON() { ... }          // with PII (triggers audit)
  toSafeJSON() { ... }      // without PII
  static createSeededMembers() { ... }
}
```

### Error Response Convention
```json
{ "error": "Vietnamese error message", "code": "SNAKE_CASE_CODE" }
```

### Success Response Convention
```json
{ "success": true, "message": "Vietnamese success message", "data": { ... } }
```



## 6. Spanish/Vietnamese Variable Naming Conventions

- Variable names use **camelCase** (JavaScript standard) — no Spanish/Latin naming found
- Error messages, UI labels, log messages, and comments are in **Vietnamese**
- API response codes use **UPPER_SNAKE_CASE** with Vietnamese error text
- Database columns use **snake_case**
- Class names use **PascalCase**
- No Spanish variable names found anywhere in the codebase



## 7. Existing Features Status

| Feature | Backend | Frontend | DB | Notes |
|---------|---------|----------|-----|-------|
| Auth (JWT) | ✅ Full | ✅ Login form | ✅ members table | Password: PBKDF2, PII: AES-256 |
| Member CRUD | ✅ Full (in-mem) | ✅ Members table page | ✅ schema | Validation + RBAC + PDPA audit |
| Habit Tracker | ✅ Full (in-mem) | — | ✅ habits table | 6-point scoring, streaks |
| KPI Rollup | ✅ Full (in-mem) | ✅ KPI panel | ✅ kpi_rollups | daily/weekly/monthly, tier targets |
| PSN Health Score | ✅ Engine | ✅ PSN health page | ✅ psn_health_history | 9-state Cuu Dia classifier |
| Alert Rules Engine | ✅ Full (in-mem) | ✅ Alerts inbox | ✅ alerts_log | 6 rules, evaluate, acknowledge |
| Training Modules | ✅ Full (in-mem) | ✅ Training page | ✅ training_records | 3-tier curriculum |
| Onboarding Bot | ✅ Full (in-mem) | — | ✅ onboarding_sessions | 4-week state machine |
| Funnel OS Tables | ✅ Schema | ✅ funnel-view.js | ✅ funnel tables | **NOT connected to backend** |
| Leads Management | ❌ No routes | ✅ leads-view.js | ✅ leads | Frontend expects /api/leads |
| Orders Management | ❌ No routes | ✅ orders-view.js | ✅ orders | Frontend expects /api/orders |
| Zalo Integration | ✅ Webhook handler | — | — | Console-only (not wired to routes) |
| Referral System | ✅ Logic | ✅ leaderDashboard | ✅ referrals | In-memory |



## 8. Zalo Integration Hints

- `src/integrations/zalo-webhook.js`: Full webhook handler class (Zalo OA v3.0 API)
- Commands: `checkin`, `streak`, `nudge`, `help` (Vietnamese)
- `trainingOps.js` → `generateReminderPayload()` produces Zalo-ready messages
- `onboardingBot.js` → `generateNudge()` includes `to: zaloPhone`
- Zalo OA token/secret configurable via env vars (ZALO_OA_TOKEN, ZALO_OA_SECRET)



## 9. Kanban / Board-like UI

- `bin/kanban.js`: CLI task board (kanban board pattern for internal task management)
- Used by `.mekong/tasks.json` with status columns: todo → in_progress → review → done → blocked
- NOT a UI component — purely CLI
- No visual kanban/board UI exists in the dashboard



## 10. Role Hierarchy

```
Member (1) < PSN Leader (2) < Core Leader (3) < Admin (4)
```

Roles in Vietnamese: `Member`, `PSN Leader`, `Core Leader`, `Admin`



## 11. Unresolved Questions

1. The `DatabaseAdapter` class in `src/db/adapter.js` is complete but **never wired to any route** — all data is in-memory
2. Frontend API base URL is hardcoded to a Cloudflare Worker domain but backend is Express on port 3000 — mismatch
3. Funnel/Leads/Orders frontend views exist but have **zero backend routes**
4. Many docs (`01_GOAL.md`, `02_AGENTS.md`, `03_ARCHITECTURE.md`) are unfilled templates
5. `wrangler.toml` exists suggesting Cloudflare Workers deployment intent, but the running server is Express
6. Zalo webhook handler is defined but not registered as an Express route
7. No build/compile step exists for the `src/` backend (no transpiler)
