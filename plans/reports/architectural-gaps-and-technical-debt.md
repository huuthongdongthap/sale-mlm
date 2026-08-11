# Architectural Gaps & Technical Debt Analysis
**Droppii Sales Training OS — Hive Warfare Academy**  
**Date:** 2026-06-23  
**Version:** 1.0

---

## Executive Summary

| Category | Issues Found | Critical | High | Medium | Low |
|----------|--------------|----------|------|--------|-----|
| **Persistence** | 5 in-memory stores | 2 | 2 | 1 | 0 |
| **Infrastructure** | 3 missing services | 1 | 1 | 1 | 0 |
| **Security** | 6 vulnerabilities | 2 | 2 | 2 | 0 |
| **Observability** | 4 gaps | 1 | 2 | 1 | 0 |
| **Multi-tenancy** | 5 limitations | 1 | 2 | 1 | 1 |
| **Total** | **23** | **7** | **9** | **6** | **1** |

**Estimated total effort to address all critical/high issues:** 40-55 engineering hours  
**Risk if unaddressed before pilot launch:** Data loss, security breaches, inability to scale

---

## 1. In-Memory Data Structures (Persistence Gaps)

### 1.1 Alert Rules & Log — `src/analytics/alertEngine.js`

**Status:** `rules[]` and `alertLog[]` are in-memory arrays (lines 20-21)

**Impact:**
- All alert firings lost on Worker restart/crash
- No historical alert analytics
- Cannot track alert trends over time
- Acknowledgment status not persistent

**Severity:** **CRITICAL**  
**Effort:** Medium (6-8h) — Need to migrate alert rules to DB table, add API endpoints for CRUD

**Required Changes:**
1. Create `alert_rules` table (id, name, metric, op, threshold, action, severity, active, created_at)
2. Modify `initRules()` to load from DB instead of DEFAULT_RULES
3. Replace `alertLog.push()` with INSERT into `alerts_log` table
4. Add DB query functions for `getAlertLog()`, `getAlertSummary()`
5. Keep small in-memory cache (LRU) for hot rules if needed

---

### 1.2 Error Monitoring — `src/utils/monitoring.js`

**Status:** `errorLog` array in memory only (line 14)

**Impact:**
- Error history lost on restart
- Cannot correlate errors over time
- No long-term error trend analysis
- Debugging past incidents impossible

**Severity:** **HIGH**  
**Effort:** Low (2-3h) — Already have `errors` table in schema? If not, add it

**Required Changes:**
1. Create `error_events` table (id, timestamp, error_message, stack, context, environment)
2. Replace `errorLog.push()` with `INSERT INTO error_events`
3. Update `getErrorLog()` and `getErrorSummary()` to query DB
4. Add TTL cleanup policy (30 days) for error events

---

### 1.3 Onboarding Sessions — `src/agents/onboardingBot.js`

**Status:** `sessions` object in memory (line 28)

**Impact:**
- All onboarding progress lost on restart
- Members lose 4-week training state
- No recovery from crash mid-onboarding
- Cannot resume interrupted sessions

**Severity:** **CRITICAL**  
**Effort:** Medium (4-6h) — Already have `onboarding_sessions` table, need to sync

**Required Changes:**
1. Update `onboarding_sessions` table schema (already exists in migrations)
2. Modify `startOnboarding()` to INSERT into DB
3. Modify `getSession()` to SELECT from DB (cache in memory for performance)
4. Add periodic checkpoint (every day) to persist session state
5. On Worker restart, reload active sessions from DB

---

### 1.4 Training Records — `src/agents/trainingOps.js`

**Status:** `trainingRecords` object in memory (line 48)

**Impact:**
- Training progress lost on restart
- Members lose curriculum state
- Graduation tracking unreliable
- Cannot scale across multiple Workers

**Severity:** **CRITICAL**  
**Effort:** Medium (4-6h) — Already have `training_records` table

**Required Changes:**
1. `training_records` table exists (see migrations/0001) but not used by agent
2. Modify `assignCurriculum()` to INSERT into `training_records`
3. Modify `getRecord()` to SELECT from `training_records`
4. Add `UPDATE` on `updateProgress()` to persist changes
5. Consider caching in memory for hot reads (TTL 5min)

---

### 1.5 Reminders Queue — `src/agents/trainingOps.js`

**Status:** `reminders` array in memory (line 49)

**Impact:**
- Reminders lost on restart → trainees miss notifications
- No visibility into scheduled vs sent
- Cannot retry failed notifications
- No batch processing optimization

**Severity:** **HIGH**  
**Effort:** Medium (4-5h) — Need new table + worker process

**Required Changes:**
1. Create `reminders` table (id, member_id, type, scheduled_at, sent, sent_at, payload)
2. Modify `scheduleReminder()` to INSERT into DB
3. Modify `getPendingReminders()` to SELECT WHERE sent=false
4. Modify `markReminderSent()` to UPDATE
5. Add background job (cron) to process pending reminders
6. Consider Cloudflare Queues or Durable Objects for distributed processing

---

### 1.6 Audit Trail — `src/utils/auditLog.js`

**Status:** `auditLogs` array in memory (line 8)

**Impact:**
- **PDPA compliance violation:** Audit logs must be immutable and persistent
- Cannot prove who accessed PII and when
- Legal/regulatory risk if audited
- Logs lost on restart

**Severity:** **CRITICAL**  
**Effort:** Low (2-3h) — Already have `audit_trail` table, just need to use it

**Required Changes:**
1. Replace `auditLogs.push()` with `INSERT INTO audit_trail`
2. Update `getAuditLogs()` to query DB with filters
3. Add retention policy (7 years for PDPA compliance)
4. Make logs append-only (no DELETE allowed)
5. Consider partitioning by month for performance

---

## 2. Missing Infrastructure

### 2.1 Redis / KV Cache

**Current State:** No caching layer. Every request hits D1 database.

**Impact:**
- Higher D1 query costs at scale
- Slower response times (D1 latency ~5-10ms per query)
- Hot data (member profiles, PSN health) recomputed repeatedly
- Dashboard slow when listing 100+ members

**Severity:** **HIGH**  
**Effort:** Medium (6-8h)

**Required Implementation:**
1. **Cloudflare KV namespace** for:
   - Member profile cache (key: `member:{id}`, TTL: 5min)
   - PSN health snapshots (key: `psn:{id}:health`, TTL: 1hr)
   - Alert rule definitions (key: `alert:rules`, TLR: 1hr)
   - Training curriculum static data (key: `curriculum:tier:{n}`)

2. **Cache Strategy:**
   - Write-through: Cache update on DB write
   - Cache invalidation: Delete on member update, PSN recalc
   - Stale-while-revalidate for read-heavy endpoints

3. **API Integration:**
   ```javascript
   // Example: GET /api/members/:id
   const cached = await MEMBERS_KV.get(`member:${id}`);
   if (cached) return JSON.parse(cached);
   const member = await db.prepare(...).first();
   await MEMBERS_KV.put(`member:${id}`, JSON.stringify(member), { expirationTtl: 300 });
   ```

4. **Estimated savings:** 40-60% reduction in D1 reads for dashboard

---

### 2.2 Message Queue for Async Tasks

**Current State:** No queue. Reminders and notifications fire inline or not at all.

**Impact:**
- Long-running tasks (Zalo webhook sends) block API response
- No retry logic for failed notifications
- No prioritization (urgent vs batch)
- Cannot schedule delayed tasks reliably

**Severity:** **MEDIUM**  
**Effort:** High (10-12h)

**Options:**
1. **Cloudflare Queues** (recommended):
   - Create queue for notifications
   - Producers: scheduleReminder(), alertEngine (escalate action)
   - Consumer: worker that sends Zalo webhooks, retries on failure
   - Batch processing for daily digest

2. **Durable Objects** (alternative):
   - More control over state
   - Can implement rate limiting per recipient
   - But more complex, higher cost

3. **Implementation steps:**
   - Create queue binding in wrangler.toml
   - Add `queue.send()` calls in reminder/alert code
   - Create separate consumer worker or same worker with `queue` listener
   - Add dead-letter queue for failed messages
   - Add metrics: queue depth, processing latency, failure rate

---

### 2.3 Scheduled Job Runner (Cron)

**Current State:** No cron. Daily habit snapshots, PSN health recalc, alert evaluation must be manual/on-demand.

**Impact:**
- Daily rollups must be triggered manually
- PSN health not automatically updated
- No regular maintenance tasks (cleanup, aggregates)
- Missed SLA windows for batch jobs

**Severity:** **MEDIUM**  
**Effort:** Low (2-3h)

**Required Implementation:**
1. **Cloudflare Cron Triggers** in wrangler.toml:
   ```toml
   [[triggers]]
   crons = ["0 1 * * *"]  # Daily 1AM UTC: habit snapshot, PSN health
   ```

2. **Cron handler** in worker:
   ```javascript
   export default {
     async scheduled(event, env, ctx) {
       if (event.type === 'cron') {
         await runDailyJobs(env);
       }
     }
   };
   ```

3. **Daily jobs to run:**
   - Recompute PSN health for all PSNs
   - Evaluate alert rules for all PSNs (persist to DB)
   - Generate daily training digest for leaders
   - Clean up old in-memory caches (if any)
   - Archive old error logs (>30 days) to R2

---

## 3. Security Concerns

### 3.1 Rate Limiting — Authentication Endpoints

**Current State:** No rate limiting on `/auth/login`

**Impact:**
- Brute force password guessing possible
- DoS via credential stuffing
- Account lockup via repeated failed attempts
- JWT secret exhaustion (if using short secrets)

**Severity:** **HIGH**  
**Effort:** Medium (4-6h)

**Required Implementation:**
1. **Per-IP rate limit:**
   - 5 attempts per 15 minutes on `/auth/login`
   - Track in KV with key `ratelimit:login:{ip}` (increment, TTL 900)
   - Return 429 with Retry-After header

2. **Per-account rate limit:**
   - Lock account after 10 failed attempts
   - Require admin unlock or email reset
   - Track in KV `ratelimit:login:{email}`

3. **Progressive delays:**
   - 1st failure: immediate
   - 2nd: 1s delay
   - 5th: 10s delay
   - 10th: lock for 15min

---

### 3.2 Rate Limiting — Alert Evaluation

**Current State:** `/api/alerts/evaluate` can be called arbitrarily often

**Impact:**
- Denial-of-service via repeated expensive PSN health calculations
- Alert spam in DB if persisted
- CPU exhaustion on Worker (10ms limit)

**Severity:** **MEDIUM**  
**Effort:** Low (2-3h)

**Required Implementation:**
1. Rate limit per API key (if API keys exist) or per user JWT
2. Limit: 100 calls per hour per user
3. Track in KV: `ratelimit:alerts:{userId}` (increment, TTL 3600)
4. Return 429 if exceeded

---

### 3.3 Encryption Key Management

**Current State:** Hardcoded in `src/utils/encryption.js` (check file)

**Impact:**
- If key is in source, anyone with code can decrypt PII
- Cannot rotate keys without code deploy
- Key rotation requires re-encrypting all data
- Compliance violation (PDPA requires key separation)

**Severity:** **HIGH**  
**Effort:** Low (1-2h)

**Required Changes:**
1. Move encryption keys to environment variables:
   - `ENCRYPTION_KEY_1` (current key)
   - `ENCRYPTION_KEY_2` (next key for rotation)
   - `KEY_ROTATION_DATE` (when to rotate)

2. Use `wrangler secret put ENCRYPTION_KEY_1` (never in code)

3. Implement key rotation:
   - Decrypt with old key, re-encrypt with new key on member update
   - Background job to re-encrypt all records over 30 days

---

### 3.4 Soft Delete Implementation

**Current State:** Member DELETE hard-deletes (see `src/api/members.js`)

**Impact:**
- Loss of audit trail (who deleted what and why)
- Cannot recover accidental deletions
- Violates PDPA "right to be forgotten" requires retention of deletion logs
- Orphaned child records (habits, KPI) if cascade not implemented

**Severity:** **MEDIUM**  
**Effort:** Medium (4-5h)

**Required Changes:**
1. Add `deleted_at` column to `members` table
2. Add `deleted_by` column (user who performed delete)
3. Change DELETE endpoint to soft-delete (set `deleted_at = NOW()`)
4. Add filter to GET `/api/members` to exclude soft-deleted by default
5. Admin-only endpoint to view/restore soft-deleted members
6. Child records (habits, kpi) should also soft-delete or archive

---

### 3.5 Idempotency Keys

**Current State:** POST endpoints lack idempotency protection

**Impact:**
- Network retry creates duplicate habit checkins
- Double-submit problem (user clicks twice)
- Duplicate alerts, training records, onboarding sessions

**Severity:** **MEDIUM**  
**Effort:** Medium (4-6h)

**Required Implementation:**
1. **Idempotency-Key header** (RFC 7232):
   - Client sends `Idempotency-Key: <uuid>`
   - Store in KV: `idempotency:{key}` → response (24h TTL)
   - On duplicate, return cached response

2. **Implement middleware:**
   ```javascript
   const idempotencyKey = req.header('Idempotency-Key');
   if (idempotencyKey) {
     const cached = await IDEMPOTENCY_KV.get(`idempotency:${idempotencyKey}`);
     if (cached) return JSON.parse(cached);
     // After successful response: store in KV
   }
   ```

3. **Endpoints needing it:**
   - POST `/api/habits/checkin`
   - POST `/api/alerts/evaluate`
   - POST `/api/onboarding/start`
   - POST `/api/training/assign`

---

### 3.6 Input Validation — Request Size

**Current State:** No body size limit in Express app (server.js line 19 uses default)

**Impact:**
- Large JSON payload can exhaust memory
- DoS via giant requests (100MB+)
- Slow parsing blocks event loop

**Severity:** **LOW**  
**Effort:** Low (30min)

**Required Change:**
```javascript
app.use(express.json({ limit: '100kb' }));  // Add limit
```

---

## 4. Observability Gaps

### 4.1 Distributed Tracing (Correlation IDs)

**Current State:** No request tracing across services

**Impact:**
- Cannot trace a user's journey across multiple endpoints
- Debugging multi-step flows (onboarding → habit checkin → alert) requires log correlation
- No visibility into latency per component
- Hard to identify slow database queries

**Severity:** **HIGH**  
**Effort:** Medium (4-5h)

**Required Implementation:**
1. **Correlation ID generation:**
   - Middleware generates `X-Request-ID` if not present
   - Store in request context, pass to all DB queries, external calls

2. **Logging:**
   - Every log line includes `request_id`
   - Use structured logging (JSON) instead of console.log

3. **Metrics to collect per request:**
   - Duration (total, DB time, external calls)
   - Status code
   - User ID (if authenticated)
   - Endpoint path

4. **Export:**
   - Cloudflare Workers Analytics Engine (built-in)
   - Or external: Datadog, New Relic, self-hosted Grafana

---

### 4.2 Error Monitoring — Persistence & Aggregation

**Current State:** Errors in-memory only (see 1.2 above)

**Impact:**
- Cannot track error trends
- No alerting on error rate spikes
- Lost on restart

**Severity:** **HIGH**  
**Effort:** Low (2-3h) — Partially addressed by persisting errors to DB

**Additional Requirements:**
1. Integrate Sentry SDK properly (currently stub only)
2. Set up Sentry project, get DSN
3. Install `@sentry/node` (if budget permits)
4. Configure Sentry to capture:
   - Unhandled exceptions
   - Handled errors with context
   - Performance traces (10% sampling)
5. Set up Sentry alerts:
   - Error rate > threshold
   - New error type appeared
   - Critical error in production

---

### 4.3 Performance Metrics

**Current State:** No request latency metrics, no DB query timing

**Impact:**
- No visibility into performance bottlenecks
- Cannot set SLAs
- Cannot detect degradation before users complain

**Severity:** **MEDIUM**  
**Effort:** Low (2-3h)

**Required Implementation:**
1. **Request timing middleware:**
   ```javascript
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       metrics.record('request_duration', duration, { path: req.path, method: req.method });
     });
     next();
   });
   ```

2. **DB query timing:**
   - Wrap D1 prepared statements to capture execution time
   - Log slow queries (>100ms)

3. **Metrics to track:**
   - Request rate (RPS) per endpoint
   - Error rate (5xx)
   - P50/P95/P99 latency
   - D1 query latency
   - Cache hit rate (when KV added)

4. **Export:** Cloudflare Analytics Engine or external

---

### 4.4 Structured Logging

**Current State:** Using `console.log`, `console.error` with inconsistent format

**Impact:**
- Logs hard to parse/aggregate
- No standard fields (timestamp, level, request_id, user_id)
- Cannot filter/search programmatically
- Poor log rotation/retention

**Severity:** **MEDIUM**  
**Effort:** Low (2h)

**Required Implementation:**
1. **Use a structured logger:** `pino` or `winston`
2. **Standard log format (JSON):**
   ```javascript
   {
     "timestamp": "2025-06-23T10:30:00Z",
     "level": "info",
     "request_id": "abc-123",
     "user_id": "member-456",
     "action": "member.create",
     "resource_id": "member-789",
     "duration_ms": 45
   }
   ```

3. **Replace console.log/error calls**
4. **Log aggregation:**
   - Cloudflare Workers logs → Cloudflare Logpush → external (or local dev tail)

---

## 5. Multi-Tenancy Considerations

**Current State:** Single-tenant design (one MLM company per Worker deployment)

**Future Need:** Scale to multiple MLM companies on same platform (SaaS model)

### 5.1 Tenant Isolation in Database

**Gap:** No `tenant_id` column in any table

**Impact:**
- Cannot separate data between MLM companies
- All members in same table → data leakage risk
- Cannot scale to multiple customers

**Severity:** **LOW** (if staying single-tenant) | **HIGH** (if SaaS)  
**Effort:** High (12-16h)

**Required Changes (if multi-tenant):**
1. Add `tenant_id` to every table:
   - members, habits, kpi_rollups, training_records, onboarding_sessions, psn_health_history, alerts_log, audit_trail, referrals

2. **Row-level security:**
   - Every query must filter by `tenant_id`
   - Add middleware to inject `tenantId` from user context
   - Prevent accidental cross-tenant access

3. **Data migration:**
   - Backfill `tenant_id` for existing data (single tenant = 'droppii')
   - Create separate D1 database per tenant OR partitioned tables

4. **Deployment changes:**
   - Deploy separate Workers per tenant (simpler) OR
   - Single Worker with tenant-aware routing (more complex)

---

### 5.2 Tenant-Specific Configuration

**Gap:** All configuration in `company.json` is global

**Impact:**
- Cannot customize training curriculum per tenant
- Cannot customize KPI thresholds per company
- Cannot customize branding (logo, colors)

**Severity:** **LOW** (if single-tenant) | **MEDIUM** (if SaaS)  
**Effort:** Medium (6-8h)

**Required Changes:**
1. Create `tenants` table:
   ```sql
   CREATE TABLE tenants (
     id TEXT PRIMARY KEY,
     name TEXT,
     subdomain TEXT UNIQUE,
     config_json TEXT,  -- custom curriculum, KPI thresholds, branding
     created_at TEXT
   );
   ```

2. Load tenant config on authentication:
   - After JWT verify, look up tenant from `members.tenant_id`
   - Cache tenant config in KV for 1hr

3. Use tenant config to override global defaults:
   - Training curriculum
   - KPI thresholds (per tier)
   - Alert rule defaults
   - Branding (logo, theme colors)

---

### 5.3 Tenant-Scoped Authentication

**Gap:** JWT doesn't validate tenant membership

**Impact:**
- If multi-tenant, user could access another tenant's data by guessing IDs
- No tenant context in JWT claims

**Severity:** **HIGH** (if SaaS)  
**Effort:** Low (2-3h)

**Required Changes:**
1. Add `tenant_id` to JWT payload on login
2. Middleware verifies member belongs to tenant (from JWT claims matches DB)
3. All queries filter by tenant_id automatically

---

### 5.4 Tenant Metrics & Billing

**Gap:** No usage tracking per tenant

**Impact:**
- Cannot bill per-tenant (if SaaS)
- Cannot enforce quotas (member count, API calls)
- No tenant-level reporting

**Severity:** **LOW** (if single-tenant) | **MEDIUM** (if SaaS)  
**Effort:** Medium (6-8h)

**Required Implementation:**
1. Track usage events:
   - Member count per tenant
   - API calls per tenant
   - Storage used (R2)
   - D1 rows accessed

2. Create `tenant_usage` table:
   ```sql
   CREATE TABLE tenant_usage (
     tenant_id TEXT,
     date DATE,
     api_calls INTEGER,
     active_members INTEGER,
     storage_bytes INTEGER,
     PRIMARY KEY (tenant_id, date)
   );
   ```

3. Increment counters on each API call (using KV for atomic increments)

4. Daily aggregation job to roll up usage

5. Billing integration: Stripe, Polar, or VN payment gateway

---

### 5.5 Tenant-Onboarding Flow

**Gap:** No self-service signup

**Severity:** **LOW** (if single-tenant) | **LOW** (if SaaS)  
**Effort:** High (10-12h)

**Required if SaaS:**
1. Tenant signup form (Landing page)
2. Tenant provisioning workflow:
   - Create tenant record
   - Create D1 database (or schema partition)
   - Create KV namespace
   - Create R2 bucket
   - Generate tenant-specific JWT secret
3. First admin user creation
4. Tenant settings page (branding, curriculum import)

---

## 6. Performance & Scaling Risks

### 6.1 N+1 Queries — Leaderboard

**Location:** `src/api/kpi.js` (lines 396-407 based on architecture doc)

**Impact:**
- N+1 query pattern loads each member's KPI separately
- With 100 members, 1 query becomes 101 queries
- Latency multiplies with member count

**Severity:** **MEDIUM**  
**Effort:** Low (2-3h)

**Fix:**
- Single query with JOIN or batch query
- Or cache leaderboard in KV (expire 1hr)

---

### 6.2 No Connection Pooling Limits

**Current State:** D1 auto-pools, but no explicit limits

**Impact:**
- Workers spawn many connections under load
- Could exceed D1 connection limits
- Starvation of queries

**Severity:** **LOW** (Cloudflare handles)  
**Effort:** N/A (managed by Cloudflare)

**Note:** D1 connection pooling is automatic. Monitor with `d1 databases inspect`.

---

### 6.3 No Database Query Optimization

**Impact:**
- Missing indexes for common query patterns
- Full table scans on large tables

**Severity:** **MEDIUM**  
**Effort:** Low (2h)

**Required:**
1. Review slow queries (enable query logging)
2. Add indexes:
   - `habits(member_id, date)` already exists ✓
   - `kpi_rollups(member_id, date)` already exists ✓
   - `training_records(psn_id, status)` needed
   - `alerts_log(psn_id, acknowledged, created_at)` needed

---

## 7. Data Integrity & Backup

### 7.1 Backup Strategy

**Current State:** D1 automated backups exist but restore not documented/tested

**Impact:**
- Data loss if DB corrupted
- No tested restore procedure
- No backup retention policy

**Severity:** **HIGH**  
**Effort:** Low (2h)

**Required:**
1. Enable D1 point-in-time recovery (PITR)
2. Document restore procedure in RUNBOOK.md
3. Test restore quarterly
4. Export weekly snapshot to R2 for long-term archival

---

### 7.2 Migration Versioning

**Current State:** Migrations in `/migrations` but no version tracking table

**Impact:**
- Cannot track which migrations applied
- Risk of re-applying or missing migrations
- Hard to rollback

**Severity:** **LOW**  
**Effort:** Low (1h)

**Required:**
1. Create `schema_migrations` table (version, applied_at)
2. Add script to apply migrations in order, record version
3. Use `wrangler d1 migrations` which handles this ✓

---

## 8. Testing Gaps

### 8.1 Integration Tests with Real Database

**Current State:** Jest tests likely use mocks (need to verify)

**Impact:**
- Tests don't catch DB schema issues
- False confidence in code quality
- SQL errors only surface in production

**Severity:** **MEDIUM**  
**Effort:** Medium (6-8h)

**Required:**
1. Set up test D1 database
2. Run migrations on test DB before tests
3. Use real DB queries in tests (not mocks)
4. Cleanup after tests (DELETE all rows)
5. Seed with test data

---

### 8.2 E2E Smoke Tests

**Current State:** Task T-019 marked pending in goals.json

**Impact:**
- No confidence that full stack works end-to-end
- Deployments break without immediate notice

**Severity:** **HIGH**  
**Effort:** Medium (4-6h)

**Required:**
1. Playwright test suite:
   - Login flow
   - Create member
   - Habit checkin
   - Dashboard renders
   - Alert evaluation

2. Run on every deploy (GitHub Actions)

---

## 9. Deployment & CI/CD Gaps

### 9.1 CI/CD Pipeline

**Current State:** Manual deployment (wrangler deploy)

**Impact:**
- Human error in deployment steps
- No automated testing on PRs
- No staging environment
- No rollback automation

**Severity:** **HIGH**  
**Effort:** Medium (6-8h)

**Required:**
1. **GitHub Actions workflow:**
   ```yaml
   on:
     push:
       branches: [main, staging]
     pull_request:
       branches: [main]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm ci
         - run: npm test
         - run: npm run lint
     deploy-staging:
       if: github.ref == 'refs/heads/staging'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: wrangler deploy --env staging
     deploy-prod:
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: wrangler deploy --env production
         - run: ./scripts/post-deploy-smoke.sh
   ```

2. **Separate environments:**
   - Staging: smaller D1, test data
   - Production: real data

---

### 9.2 Environment Configuration

**Current State:** Some env vars not documented, hardcoded values

**Impact:**
- Difficult to configure new deployment
- Config drift between environments
- Secrets may leak via code

**Severity:** **MEDIUM**  
**Effort:** Low (2h)

**Required:**
1. Create `.env.example` with all variables
2. Document each variable in README
3. Use `wrangler secret put` for all secrets
4. Non-secret config in `wrangler.toml` [vars] section

---

## 10. Summary & Prioritization

### Immediate Pre-Launch (Before Pilot)

**Must fix before launching 10 Tân Binh:**

| # | Issue | Severity | Effort | Impact if not fixed |
|---|-------|----------|--------|---------------------|
| 1 | Persist onboarding sessions to DB | CRITICAL | 4h | Training progress lost on restart |
| 2 | Persist training records to DB | CRITICAL | 4h | Curriculum state lost |
| 3 | Persist audit logs to DB | CRITICAL | 2h | PDPA compliance violation |
| 4 | Rate limiting on /auth/login | HIGH | 4h | Brute force attacks |
| 5 | Error persistence to DB | HIGH | 2h | Cannot debug incidents |
| 6 | Soft delete for members | MEDIUM | 4h | Audit trail incomplete |
| 7 | CI/CD pipeline | HIGH | 6h | Manual deployments, no staging |
| 8 | E2E smoke tests | HIGH | 4h | No deployment validation |
| 9 | Encrypt keys via env vars | HIGH | 1h | Key security risk |
| 10 | Backup/restore test | HIGH | 2h | Data loss risk |

**Total pre-launch effort:** ~32 hours (4-5 days with context switching)

---

### Phase 2 (Post-Launch, Q3 2026)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 11 | Add Redis/KV cache | HIGH | 8h |
| 12 | Message queue for notifications | MEDIUM | 12h |
| 13 | Distributed tracing | HIGH | 4h |
| 14 | Alert rules persistence (currently in-memory) | CRITICAL | 8h |
| 15 | Structured logging | MEDIUM | 2h |
| 16 | Performance metrics | MEDIUM | 3h |
| 17 | Tenant isolation (if SaaS) | HIGH | 16h |

---

### Phase 3 (Q4 2026 — Scale to 500+ members)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 18 | Multi-tenancy full implementation | MEDIUM | 20h |
| 19 | Advanced caching strategies | MEDIUM | 8h |
| 20 | Query optimization at scale | MEDIUM | 6h |
| 21 | Rate limiting expansion | LOW | 4h |
| 22 | Idempotency keys | MEDIUM | 6h |
| 23 | Tenant metrics & billing | MEDIUM | 8h |

---

## Unresolved Questions

1. **SaaS vs Single-Tenant:** Are we planning to support multiple MLM companies on same platform? This affects all multi-tenancy work.
2. **Budget for Observability:** Can we afford Sentry ($26/mo), Datadog ($31/host/mo), or open-source only?
3. **Backup RPO/RTO:** What's acceptable data loss (RPO) and recovery time (RTO)?
4. **Scale Targets:** How many concurrent users in 12 months? (affects caching/queue decisions)
5. **Compliance Scope:** PDPA requires audit logs for 7 years — storage cost implications?
6. **Zalo API Limits:** Can we send 1000 notifications/day on free tier? Need volume pricing?
7. **Cloudflare Limits:** Worker CPU time (10ms free, need paid for more), D1 storage (10GB free limit)

---

## Conclusion

The architecture is **solid for MVP/pilot** with 10-20 users, but **23 technical gaps** need addressing before scaling to 50+ members. The most critical are:

1. **Data persistence** — 5 in-memory stores must move to D1
2. **Security** — Rate limiting, encryption keys, soft delete
3. **Observability** — Error persistence, tracing, metrics
4. **Infrastructure** — KV cache, queue, cron

**Recommended 2-week sprint** to fix all CRITICAL/HIGH items before pilot launch. MEDIUM/LOW can be addressed post-launch with revenue.

---

**Architectural Strengths:**
- Edge-native Workers + D1 design
- Stateless API design (mostly)
- PDPA groundwork (encryption, audit intent)
- Culturally-adapted PSN health model

**Key Risk:** Data loss on Worker restart due to in-memory state. **Do not launch pilot without persistence fixes.**
