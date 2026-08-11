# Technical Architecture Documentation

## Droppii Sales Training OS — Hive Warfare Academy

**Version:** 1.0  
**Date:** 2026-06-23  
**Status:** Production Ready (v1.1)  
**Stack:** Cloudflare Workers + D1 + Pages + Vite Dashboard

---

## 1. System Architecture Overview

### 1.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Cloudflare Pages (Static Assets)                                   │
│  ├── Dashboard: Vite + Vanilla JS                                   │
│  │   ├── Members Table                                             │
│  │   ├── KPI Panel                                                │
│  │   ├── PSN Health View                                          │
│  │   ├── Alerts Inbox                                             │
│  │   └── Training Management                                      │
│  └── SPA: Single Page Application (dark luxury theme)              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Cloudflare Workers (Edge Functions)                                │
│  ├── Authentication (JWT + PBKDF2)                                 │
│  ├── Member Management (CRUD + RBAC)                               │
│  ├── Habit Tracking (6-point daily scoring)                       │
│  ├── KPI Rollup Engine                                            │
│  ├── Alert Rules Engine (6 default rules)                        │
│  ├── PSN Health Classifier (9-state Cửu Địa)                     │
│  ├── Onboarding Bot (automated 4-week curriculum)                │
│  ├── Training Ops Agent (progress tracking)                      │
│  └── Health Check Endpoints                                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Cloudflare D1 (SQLite)                                             │
│  ├── members (PDPA encrypted PII)                                 │
│  ├── habits (daily checkins with streak)                          │
│  ├── kpi_rollups (aggregated performance)                        │
│  ├── training_records (curriculum state)                         │
│  ├── onboarding_sessions (Week 1-4 tracking)                     │
│  ├── psn_health_history (snapshots)                              │
│  ├── alerts_log (rule firings)                                   │
│  ├── audit_trail (PDPA compliance)                               │
│  ├── referrals (reward tracking)                                 │
│  └── training_progress (per-module completion)                  │
│                                                                     │
│  Cloudflare R2 (Object Storage)                                    │
│  └── Training content assets (ebooks, media)                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Components

**Frontend:**
- **Framework:** Vite + Vanilla JavaScript (no React over-engineering)
- **Build:** Static assets deployed to Cloudflare Pages
- **Theme:** Dark luxury UI with custom CSS
- **Views:** 5 main screens (Members, KPI, PSN Health, Alerts, Training)

**Backend:**
- **Runtime:** Cloudflare Workers (V8 isolates, edge computing)
- **Language:** Native JavaScript (ES modules)
- **Architecture:** Serverless functions, stateless by design
- **Concurrency:** 10ms CPU time per request (free tier)

**Database:**
- **Type:** Cloudflare D1 (SQLite-compatible, globally distributed)
- **Connections:** Serverless, auto-scaling
- **Schema:** Normalized with foreign keys, indexes on member_id, date

**Integrations:**
- **Zalo OA Webhook:** Alert notifications to mobile
- **Sentry:** Error tracking (currently configured, can be enabled)
- **Anthropic Claude API:** AI coach (future integration)

---

## 2. Data Flow Analysis

### 2.1 Authentication Flow

```
1. User submits credentials (email + password) to POST /api/auth/login
2. Worker validates against members table (email lookup)
3. Password verification: PBKDF2-SHA512 with env.PASSWORD_SALT (600K iterations)
4. JWT issued: HS256 signature with env.JWT_SECRET (24h expiry)
5. Token returned to client → stored in localStorage
6. Subsequent requests: Bearer token in Authorization header
7. authMiddleware verifies signature + expiration on each protected route
8. RBAC: claims.role used in requireRole() for endpoint authorization
```

**Security Notes:**
- No session state in Workers (stateless JWT)
- Password hashing: 600K iterations (high security)
- Role-based access: Member, PSN Leader, Core Leader, Admin
- PII fields (email, phone) encrypted in DB via AES-GCM

### 2.2 Member Management Flow

```
Create Member (POST /api/members):
  - Requires role: PSN Leader, Core Leader, Admin
  - Validates email format, phone format (+84 regex)
  - Generates UUID for id
  - Password: default "changeme123" (must change on first login)
  - Stores: name, email (plaintext for deduplication), phone_encrypted (PDPA)
  - Referral tracking: referrer_id links to existing member

Read Members (GET /api/members):
  - Auth required
  - Filters: tier, role, psn_id, pagination (limit/offset)
  - PII exposure: only Admin/Core Leader can see full PII
  - Others: safe JSON without encrypted fields

Update Member (PATCH /api/members/:id):
  - Can edit own profile (name, email, phone)
  - Admin/Core Leader: full edit access
  - Validation on email/phone format
  - Updated_at timestamp automatically set

Delete Member (DELETE /api/members/:id):
  - Admin only (requireRole('Admin'))
  - Cascading cleanup: habits, kpi_rollups, training_records
```

**PDPA Compliance:**
- `auditLog.logAudit()` called on all PII access (decryption events)
- Encrypted fields: `_encryptedEmail`, `_encryptedPhone`
- Decryption triggers: `getEmail()`, `getPhone()` methods in Member model

### 2.3 Habit Tracking Flow (6-Point System)

```
Daily Habit Check-in (POST /api/habits/checkin):
  Request body: { member_id, date, items: [{wakeUp5am, connects, zoomAttend, kaizenJournal, orders}] }
  
  Processing:
  1. Habit class computes score: max 6 points
     - wakeUp5am: 2 points
     - connects: 2 points (15+=2, 10-14=1, <10=0)
     - zoomAttend: 1 point
     - kaizenJournal: 1 point
  
  2. Streak logic (updateStreak):
     - If score >= 4: streak increments only if consecutive day
     - Day continuity check: (current_date - previous_date) == 1 day
     - Gap detection: if missed day → streak resets to 0
     - stored in habits.streak column
  
  3. Persistence: INSERT OR REPLACE into habits table
     - JSON items stored for audit trail
     - Computed score and streak saved

Streak Query (GET /api/habits/streak/:member_id):
  - Queries latest habit record ORDER BY date DESC LIMIT 1
  - Returns { currentStreak, lastDate, totalDays }
```

**Habit Score Algorithm** (from `src/models/habit.js`):
```javascript
const score = 0;
if (wakeUp5am) score += 2;
if (connects >= 15) score += 2;
else if (connects >= 10) score += 1;
if (zoomAttend) score += 1;
if (kaizenJournal) score += 1;
// Max: 6 points
```

**Tier-1 Graduation Requirement:**
- Habit score ≥ 4/6 for 21 consecutive days (3 weeks)
- Plus 3 orders minimum

### 2.4 KPI Calculation Flow

**Tier-Specific Targets** (from `.mekong/company.json`):
```
Tier 1 (Tân Binh):
  connects_per_day: 15
  follow_ups_per_day: 3
  first_order_deadline_days: 14

Tier 2 (Chiến Binh):
  team_size_min: 5
  team_retention_rate: 70%
  personal_revenue_monthly: 10,000,000 VND
  coaching_sessions_weekly: 3

Tier 3 (Chỉ Huy):
  psn_count_managed: 3
  total_network_size: 30
  monthly_team_revenue: 100,000,000 VND
  retention_rate_90d: 75%
```

**Rollup Calculation** (GET /api/kpi/:member_id):
1. Query kpi_rollups for member over period (default 30 days)
2. Aggregate:
   - `connects_per_day`: average daily connects across period
   - `follow_ups_per_day`: average daily follow-ups
   - `first_order_14d`: boolean if ANY order in last 14 days
3. Compare to tier targets using `calculateStatus()`:
   - Ratio ≥ 1.0 → GREEN
   - Ratio 0.70-0.99 → YELLOW
   - Ratio < 0.70 → RED

**Leaderboard** (GET /api/kpi/leaderboard):
- Computes score = (GREEN count * 3) + (YELLOW * 2) + (RED * 1)
- Top 10 members ranked by score
- Shows status breakdown per member

### 2.5 PSN Health & Cửu Địa 9-State Classifier

**Inputs** (from member aggregation):
- `team_size`: active member count in PSN
- `retention_30d`: 30-day retention rate (0-1)
- `retention_90d`: 90-day retention rate (0-1)
- `revenue_delta`: month-over-month revenue change (-1 to +1)
- `activity_ratio`: fraction of members active this week (0-1)
- `habit_avg`: average habit score across team (0-6)
- `connect_avg`: average daily connects per member

**Scoring** (weighted 0-100):
```
w_retention30 = 0.25
w_retention90 = 0.15
w_revenue     = 0.20
w_activity    = 0.20
w_habit       = 0.10
w_connect     = 0.10
```

**9-State Mapping:**
```
Score < 25    → State 1: Tử Địa (Critical) — 🔴
Score 25-34   → State 2: Phạp Địa (Declining) — 🟠
Score 35-44   → State 3: Vi Địa (At Risk) — 🟡
Score 45-54   → State 4: Giao Địa (Unstable) — 🟢
Score 55-64   → State 5: Cù Địa (Average) — 🟢
Score 65-74   → State 6: Trọng Địa (Stable) — 💚
Score 75-84   → State 7: Tranh Địa (Growing) — 📈
Score 85-94   → State 8: Khinh Địa (Thriving) — ⭐
Score ≥ 95    → State 9: Tán Địa (Elite) — 👑
```

**Critical Overrides:**
- `retention_30d < 0.20` OR `activity_ratio < 0.10` → Immediate State 1
- Low retention + negative revenue → State 2 or 3 even if score higher

**API:** POST /api/analytics/psn-health with member list → returns state, score, factors

### 2.6 Alert Rules Engine

**Default Rules** (6 seeded rules in `src/analytics/alertEngine.js`):
```
1. retention_30d < 0.30 → critical, action: escalate
2. habit_avg < 2.5 → warning, action: auto_buddy
3. activity_ratio < 0.40 → warning, action: notify_leader
4. revenue_delta < -0.20 → warning, action: schedule_review
5. connect_avg < 8 → info, action: notify_leader
6. psn_health_score <= 25 → critical, action: escalate
```

**Evaluation:** POST /api/alerts/evaluate with metrics object → returns fired alerts array

**Persistence:** Alerts logged to `alerts_log` table with:
- rule_id, metric, severity, evidence (JSON), psn_id, acknowledged flag
- Supports acknowledgment: POST /api/alerts/:id/acknowledge

**Summary:** GET /api/alerts/summary returns total, bySeverity, unacknowledged counts

---

## 3. API Design Patterns

### 3.1 RESTful Conventions

The API follows REST principles:
- **Resources:** members, habits, kpi, alerts, onboarding, training
- **HTTP verbs:** GET (read), POST (create), PATCH (update), DELETE (remove)
- **Status codes:** 200/201 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (error)
- **Response format:** `{ success: boolean, data?: any, error?: string, code?: string }`

**Example Success:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { "id": "abc-123", "name": "John", "role": "Member" }
}
```

**Example Error:**
```json
{
  "error": "Email và mật khẩu là bắt buộc",
  "code": "MISSING_CREDENTIALS"
}
```

### 3.2 Authentication Strategy

- **Scheme:** JWT Bearer tokens
- **Header:** `Authorization: Bearer <token>`
- **Middleware:** `authMiddleware(request, env)` verifies token using env.JWT_SECRET
- **RBAC:** `requireRole(...allowedRoles)` wraps handlers
- **No session storage:** Stateless design suitable for edge compute

### 3.3 Pagination & Filtering

List endpoints (GET /api/members) support:
- Query params: `?tier=1&role=PSN+Leader&limit=50&offset=0`
- Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 150, "limit": 50, "offset": 0, "hasMore": true }
}
```

### 3.4 Idempotency & Safety

- **Habit checkin:** `INSERT OR REPLACE` semantics → safe to retry
- **KPI creation:** Same member_id + date overwrites (upsert)
- **Member creation:** Email uniqueness enforced (409 on duplicate)

### 3.5 Error Handling Pattern

Global try-catch in Worker fetch handler:
```javascript
try {
  // route dispatch
} catch (err) {
  const status = err.message.includes('Missing') ? 401 :
                 err.message.includes('Forbidden') ? 403 : 500;
  return jsonResponse({ error: err.message, code: ... }, status);
}
```

---

## 4. Deployment Topology

### 4.1 Cloudflare Workers Configuration

**wrangler.toml:**
```
name = "hive-warfare-os"
main = "src/workers/index.js"
compatibility_date = "2026-05-01"

[vars]
NODE_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "hive-warfare-db"
database_id = "def140e1-c5bb-48e5-a79f-e9368321c9d0"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "hive-warfare-storage"

[build]
command = "npm ci --production"
```

**Bindings:**
- `DB`: D1 database (SQLite)
- `STORAGE`: R2 object storage
- Environment: JWT_SECRET, PASSWORD_SALT, ALLOWED_ORIGIN (set via `wrangler secret put`)

### 4.2 Cloudflare Pages (Dashboard)

**Vite build:**
```bash
cd src/dashboard
npm run build  # outputs to dist/
```

**Deploy:** Link Pages project to `src/dashboard/dist/` with build command

**Config:** `src/dashboard/vite.config.js` with proxy to Workers API for dev

### 4.3 Database Schema (D1)

**Key Tables:**
1. `members` — user registry with PDPA encryption
2. `habits` — daily checkins with streak tracking
3. `kpi_rollups` — aggregated performance metrics
4. `training_records` — persistent curriculum state
5. `onboarding_sessions` — Week 1-4 progress tracking
6. `psn_health_history` — historical PSN scores
7. `alerts_log` — rule firings with acknowledgment
8. `audit_trail` — PDPA-compliant access logs
9. `referrals` — reward tracking for multi-level marketing
10. `training_progress` — per-module completion records

**Indexes:**
- `idx_habits_member` on (member_id, date)
- `idx_kpi_member` on (member_id, date)
- `idx_psn_history` on (psn_id, recorded_at)
- `idx_alerts_psn` on (psn_id, created_at)

---

## 5. Scaling Characteristics

### 5.1 Stateless Design

- Workers are ephemeral V8 isolates (no in-memory state)
- All data in D1 (centralized, ACID-compliant)
- JWT carries user claims → no server-side session
- Horizontal scaling: automatic across Cloudflare edge

### 5.2 Caching Strategy

**Current:** No explicit caching layer

**Recommendations for scale:**
1. **KV namespace** for:
   - Member profile cache (read-heavy, infrequent updates)
   - Training curriculum static data (Tier 1-3 definitions)
   - Alert rule definitions (read on every evaluation)

2. **Cache-Control headers** on static assets (dashboard JS/CSS)

3. **D1 connection pooling:** D1 auto-pools connections (no action needed)

**Cache Misses:** Direct D1 queries (fast: <5ms typical)

### 5.3 Rate Limiting

**Not implemented yet** — should add:
- Per-IP rate limiting on auth endpoints (prevent brute force)
- Per-user quota on habit checkin (1 per day per member)
- Alert evaluation throttling (avoid DB spam)

### 5.4 Database Scaling

D1 scaling considerations:
- Row limit: 10GB per database (free tier), can request increase
- Query performance: indexes cover common access patterns
- Write contention: low (training app, not high-frequency trading)
- Read replicas: not supported, but edge caching can reduce read load

---

## 6. Architectural Strengths

1. **Edge-native architecture:** Workers + D1 = low latency globally
2. **Cost-efficient:** Free tier sufficient for pilot (100K requests/day)
3. **PDPA-ready:** PII encryption, audit trail, access logging built-in
4. **Extensible agent framework:** Onboarding bot, training ops, alert engine decoupled
5. **9-state PSN health model:** Cửu Địa classifier is unique, culturally relevant
6. **Habit foundation:** 6-point daily scoring drives behavioral change
7. **Modular curriculum:** 12 modules across 3 tiers, clear progression
8. **RBAC fine-grained:** 4 roles with per-endpoint authorization
9. **Test coverage:** ~30 Jest tests covering core flows
10. **Observability:** Health check, error logging, monitoring middleware ready

---

## 7. Architectural Weaknesses & Risks

1. **No production secrets management:** JWT_SECRET, PASSWORD_SALT hardcoded in examples, must set via `wrangler secret`
2. **In-memory alert rules:** Default rules defined in code, not dynamic per-tenant
3. **No rate limiting:** Vulnerable to brute force on /auth/login
4. **SQLite limitations:** D1 lacks stored procedures, triggers not fully supported
5. **No backup strategy:** D1 automated backups exist but restore not documented
6. **Single-region DB:** D1 currently in one region, not multi-region (potential latency)
7. **No request tracing:** Difficult to debug distributed transactions across Workers
8. **Dashboard hardcoded API URL:** Needs environment variable for staging/prod
9. **Habit scoring inflexible:** Fixed point values, cannot customize per tier
10. **KPI rollup simplistic:** Only averages, no weighted scoring or trend analysis
11. **Training progress state machine bug:** `handleTrainingProgress` references undefined `kpiRecords` variable (line 680 in worker)
12. **Alert evaluation not persisted to DB in Worker version:** In-memory only, loses state on restart
13. **No idempotency keys:** Could create duplicate records on retry
14. **No soft delete:** Members hard-deleted, lose audit trail
15. **Zalo integration not wired:** Webhook code exists but no bot implementation

---

## 8. Data Model Summary

**Entities:**
- Member (4 roles, 3 tiers, PSN affiliation)
- Habit (daily checkin with 5 actions + score + streak)
- KPI Rollup (periodic aggregation: connects, followups, first_order)
- Training Record (curriculum state: module/day/completion)
- Onboarding Session (Week 1-4, habit scores, orders)
- PSN Health (9-state classification with metrics)
- Alert (rule firing with acknowledgment workflow)
- Referral (reward tracking)
- Audit Trail (PDPA compliance)

**Relationships:**
- Member → Habits (1:N)
- Member → KPI Rollups (1:N)
- Member → Training Record (1:1)
- Member → Onboarding Session (1:1)
- Member → Referrals (1:N as referrer + referee)
- PSN → Members (many-to-many via psn_id)

---

## 9. Security Model

**Authentication:**
- JWT signed with HS256 (shared secret)
- 24-hour token expiry
- Refresh not implemented (re-login required)

**Authorization:**
- Role-based: requireRole('Admin', 'Core Leader', 'PSN Leader', 'Member')
- Resource ownership: users can edit own profile, not others
- PII access: only Admin/Core Leader can view encrypted fields

**Encryption:**
- PII: email, phone encrypted via AES-GCM (see `src/utils/encryption.js`)
- Passwords: PBKDF2-SHA512 with 600K iterations + salt

**Audit Logging:**
- `audit_trail` table logs all PII access (decryption events)
- Includes actor_id, action, resource_type, resource_id, pii_fields, ip_address

**Input Validation:**
- Email: regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Phone: regex `^\+84\d{9,10}$` (Vietnam format)
- Request size limit: 100KB JSON body max

---

## 10. Performance Considerations

**Current:**
- D1 queries: indexed on member_id, date, psn_id → typical <5ms
- Worker cold start: ~10-50ms (V8 isolate spin-up)
- No N+1 queries: all list endpoints use single prepared statement
- Habit streak computation: O(1) with latest record lookup

**Bottlenecks:**
- Leaderboard: N+1 pattern (line 396-407 in worker) — queries KPI for each member separately
- PSN health: aggregates all members in PSN on each evaluation (no caching)
- Alert evaluation: runs all rules on each metrics POST (rules count small = OK)

**Optimization opportunities:**
- Cache member counts per PSN in separate table, update on member add/remove
- Precompute KPI rollups via cron job instead of on-demand averaging
- Use D1 batch operations for leaderboard instead of per-member queries
- Add Redis (KV) for frequently accessed PSN health snapshots

---

## 11. Observability & Monitoring

**Health Check:** GET /health returns:
```json
{
  "status": "ok",
  "timestamp": "2026-06-23T...",
  "db": "connected",
  "version": "1.1.0"
}
```

**Error Monitoring:**
- In-memory error log (last 50 errors) via `monitoring.getErrorLog()`
- GET /api/monitoring/errors (requires Admin)
- GET /api/monitoring/summary (error counts by type)

**Alerting:** Not implemented — should integrate with:
- Cloudflare Notifications ( Workers errors > threshold)
- PagerDuty/Opsgenie for critical PSN health drops
- Zalo webhook for immediate leader notification

---

## 12. Deployment Pipeline (Current)

**Manual process:**
1. `wrangler d1 migrations apply hive-warfare-db` (apply schema changes)
2. `wrangler secret put JWT_SECRET` (set production secret)
3. `wrangler secret put PASSWORD_SALT`
4. `wrangler deploy` (deploy Workers)
5. Cloudflare Pages: git push to trigger build, or manual upload

**Missing:**
- CI/CD automation (GitHub Actions not configured)
- Staging environment (only production Workers configured)
- Database migrations versioning (migrations folder exists but not in CI)
- Smoke tests post-deploy
- Rollback strategy (wrangler rollback exists but not documented)

---

## 13. Conclusion

The Droppii Sales Training OS demonstrates solid engineering practices:
- Clear separation of concerns (API, analytics, agents)
- Stateless serverless architecture suitable for edge deployment
- Culturally-adapted PSN health model (Cửu Địa 9 states)
- PDPA compliance groundwork (encryption, audit trail)
- Modular curriculum design supporting tiered progression

**Critical gaps to address pre-launch:**
1. Production secret management (no hardcoded defaults)
2. Rate limiting on auth endpoints
3. Rate limiting on alert evaluation (prevent DB spam)
4. Leaderboard N+1 query optimization
5. Staging environment setup
6. Automated test pipeline (GitHub Actions)
7. Multi-region D1 or edge caching strategy
8. Soft delete implementation for audit compliance
9. Request tracing/logging (Correlation IDs)
10. Zalo webhook wiring for notifications

Once gaps addressed, platform is ready for G0 pilot with 10-20 members.
