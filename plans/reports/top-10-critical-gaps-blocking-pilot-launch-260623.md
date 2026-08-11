# TOP 10 CRITICAL GAPS BLOCKING PILOT LAUNCH OR SCALE
**SALE MLM — Droppii Training OS (Hive Warfare Academy)**  
**Date:** 2026-06-23  
**Status:** BLOCKED — Pilot launch NOT ready despite T-024/T-025 marked "done"

---

## EXECUTIVE SUMMARY

The project has **15 CRITICAL** and **13 HIGH** findings from code review, plus **23 architectural gaps**. Despite T-024 and T-025 being marked "done" in the Kanban, **essential pilot launch artifacts are missing** and **core system stability issues remain unresolved**.

**Pilot Launch Blockers:** 5 gaps preventing safe onboarding of 10 Tân Binh  
**Scale Blockers:** 5 gaps that will cause failures at 50+ members

Total estimated fix effort: **95-120 hours** (2-3 weeks with parallel work)

---

## TOP 10 CRITICAL GAPS

### #1: MISSING PILOT LAUNCH ARTIFACTS (T-025) — BLOCKER
**Category:** Documentation / Operational Readiness  
**Severity:** CRITICAL  
**Priority:** P0 (BLOCKER)  
**Effort:** 4 hours

**Description:**
T-025 is marked `"done"` in `.mekong/tasks.json` (2026-05-20) but **deliverables do not exist**:
- ❌ `plans/launch/` directory missing
- ❌ Pilot go/no-go checklist (15 items) not created
- ❌ Kick-off Zalo message draft missing
- ❌ Day-0 dashboard snapshot missing

**Impact:**
- Cannot proceed with pilot launch — no verification criteria
- No documented checklist to ensure readiness
- No onboarding communication templates
- No baseline dashboard state for comparison

**Required Fix:**
1. Create `plans/launch/pilot-go-no-go-checklist.md` with 15 items covering:
   - Deployment & infrastructure (5 items)
   - Data & seeding (3 items)
   - Training content (3 items)
   - Operational readiness (4 items)
2. Create `plans/launch/kick-off-zalo-draft.md` with Vietnamese message template
3. Create `plans/launch/day-0-dashboard-snapshot.md` with screenshots
4. Verify checklist against actual system state

**Verification:**
```bash
test -d plans/launch
test -f plans/launch/pilot-go-no-go-checklist.md
test -f plans/launch/kick-off-zalo-draft.md
test -f plans/launch/day-0-dashboard-snapshot.md
```

---

### #2: IN-MEMORY DATA STRUCTURES — PERSISTENCE FAILURE
**Category:** Data Integrity / Reliability  
**Severity:** CRITICAL  
**Priority:** P0  
**Effort:** 24 hours (6 components × 4h each)

**Description:**
**Five critical stores use in-memory arrays/objects, guaranteed data loss on Worker/Express restart:**

1. **Alert Engine** (`src/analytics/alertEngine.js:20-21`)
   - `rules[]` and `alertLog[]` arrays
   - Impact: All alert firings lost, no historical analytics

2. **Error Monitoring** (`src/utils/monitoring.js:14`)
   - `errorLog` array only
   - Impact: Error history lost, cannot correlate incidents

3. **Onboarding Sessions** (`src/agents/onboardingBot.js:28`)
   - `sessions` object in memory
   - Impact: Training progress lost, 4-week state wiped on restart

4. **Training Records** (`src/agents/trainingOps.js:48`)
   - `trainingRecords` object
   - Impact: Curriculum state lost, graduation tracking unreliable

5. **Audit Trail** (`src/utils/auditLog.js:8`)
   - `auditLogs` array
   - Impact: **PDPA COMPLIANCE VIOLATION** — audit logs must be immutable and persistent (PDPA Article 35)

**Impact:**
- Pilot participants will lose training progress on any server restart
- Cannot track alert trends or errors over time
- Regulatory risk (PDPA fines up to 1% revenue)
- System appears broken to users (data disappearing)

**Required Fix:**
1. Create/use D1 tables: `alert_rules`, `alerts_log`, `error_events`, `onboarding_sessions`, `training_records`, `audit_trail`
2. Replace all `array.push()` with `INSERT` queries
3. Add cache layer (KV) for hot reads (TTL 5-15 min)
4. Implement periodic checkpoint/commit
5. On startup, reload active state from DB

**Verification:**
- All arrays/objects replaced with DB queries
- Data survives server restart test
- Audit trail append-only, 7-year retention

---

### #3: FAKE PBKDF2 PASSWORD HASHING — SECURITY CRITICAL
**Category:** Security / Authentication  
**Severity:** CRITICAL  
**Priority:** P0  
**Effort:** 6 hours

**Description:**
`src/workers/index.js:149-165` calls `pbkdf2()` which internally uses `simpleHash()` — a **djb2 rolling hash** (`h = ((h << 5) - h + charCode) | 0`). This is NOT PBKDF2, NOT HMAC-SHA512.

**Brute-force attack cost:** microseconds per guess (vs. 100ms+ for real PBKDF2)

**Impact:**
- All passwords trivially crackable
- Complete authentication compromise
- User PII exposure
- Regulatory violation (PDPA security obligation)

**Required Fix:**
```javascript
// Replace in src/workers/index.js and src/auth/password.js
import { subtle } from 'crypto';

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  return subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 10000, hash: 'SHA-512' },
    keyMaterial, 256
  );
}
```

**Verification:**
- Unit test: hash same password 10x, verify different outputs (salt)
- Benchmark: each hash ~100ms (enforce minimum 10K iterations)
- Pen test: 1000 guesses take > 100 seconds (not microseconds)

---

### #4: UNAUTHENTICATED API ENDPOINTS (4 routes)
**Category:** Security / Authorization  
**Severity:** CRITICAL  
**Priority:** P0  
**Effort:** 6 hours

**Description:**
`src/workers/index.js:188-216` exposes **4 production endpoints without JWT validation**:
- `GET /api/members`
- `POST /api/habits/checkin`
- `GET /api/kpi/:id`
- `GET /api/analytics/psn-health`

**Impact:**
- Anyone can access all member data (PII exposure)
- Anyone can record habit checkins (data integrity)
- Full unauthenticated data access to training analytics
- PDPA breach: personal data accessed without authorization

**Required Fix:**
1. Create `src/workers/middleware/auth.js`:
```javascript
export function requireAuth(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const payload = verifyJWT(token);  // use same secret as Express
  req.user = payload;
}
```
2. Apply to all 4 routes:
```javascript
router.get('/api/members', requireAuth, async (req, env) => { ... });
```
3. Ensure JWT verification matches Express implementation (same secret/alg)

**Verification:**
- Curl test: `curl http://localhost:3000/api/members` returns 401 without token
- Curl test: with valid JWT returns 200 + data

---

### #5: HARDCODED DEMO CREDENTIALS IN SOURCE
**Category:** Security / Access Control  
**Severity:** CRITICAL  
**Priority:** P0  
**Effort:** 2 hours

**Description:**
`src/api/auth.js:15-48` and `src/models/member.js:145-182` contain **4 demo accounts** with passwords baked into process:
- `admin123`
- `core123`
- `psn123`
- `member123`

**Impact:**
- Treat all demo accounts as **COMPROMISED**
- If used in pilot, anyone can log in as any role
- Complete authorization bypass possible

**Required Fix:**
1. Remove `DEMO_USERS` constant from source
2. Create `scripts/seed-pilot.js`:
```javascript
import { hashPassword } from '../src/auth/password.js';
import { db } from '../src/db/adapter.js';

const pilotUsers = [
  { email: 'admin@phungsu.vn', role: 'admin', password: await hashPassword('random-generated') },
  // ... 10 realistic pilot users
];

for (const user of pilotUsers) {
  await db.prepare('INSERT INTO members ...').run();
}
```
3. Generate unique passwords per pilot user, communicate securely
4. Document seed procedure in RUNBOOK

**Verification:**
- Grep source: `grep -r "admin123" src/ returns no matches`
- Seed script runs without errors
- Pilot users can login with provided passwords

---

### #6: KNOWN FALLBACK SECRETS IN SOURCE
**Category:** Security / Secrets Management  
**Severity:** CRITICAL  
**Priority:** P0  
**Effort:** 2 hours

**Description:**
Multiple files have fallback values **committed in source**:
- `src/auth/jwt.js:10` — `JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'`
- `src/utils/encryption.js:11` — `ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'sk-...'`
- `src/workers/index.js:85` — same pattern

**Impact:**
- Anyone with code access can **forge JWT tokens** (impersonate any user)
- Anyone can **decrypt PII** (phone, email, KPI data)
- **Complete security compromise**
- PDPA violation: inadequate key management

**Required Fix:**
1. Remove fallback defaults entirely:
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
```
2. Set via `wrangler secret put JWT_SECRET` (Workers) and `.env` (Express)
3. Add `SENTRY_DSN`, `ZALO_WEBHOOK`, `ENCRYPTION_KEY` to secrets list
4. Update `.env.example` and deployment docs

**Verification:**
- Start app without env var → throws clear error (not insecure default)
- Grep for `|| '` in auth/encryption files returns no matches
- All secrets set via `wrangler secret list` shows no "dev-" fallbacks

---

### #7: JWT ASYNC/AWAIT BUG — LOGIN FAILURE
**Category:** Architecture / Bug  
**Severity:** HIGH  
**Priority:** P1  
**Effort:** 0.5 hours

**Description:**
`src/workers/index.js:86` calls `createJWT()` which is `async` but **not awaited**. Result: `token` is a Promise object, not a JWT string.

**Impact:**
- Login endpoint returns `[object Promise]` instead of valid token
- Dashboard cannot authenticate
- Complete auth flow broken in Workers deployment

**Required Fix:**
```javascript
// Line 86 in src/workers/index.js
const token = await createJWT(user.id, user.role);  // Add await
```

**Verification:**
- Postman test: POST /auth/login returns string token (not Promise)
- Token decodes to valid payload with exp claim

---

### #8: SCHEMA MISMATCH — ADAPTER vs MIGRATION
**Category:** Architecture / Data Layer  
**Severity:** HIGH  
**Priority:** P1  
**Effort:** 6 hours

**Description:**
`src/d/adapter.js` queries tables/columns that **do not exist** in migration:
- Adapter queries: `habit_checkins`, `kpi_records`, `psns`, `alert_rules`, `audit_log`, `error_log`
- Migration has: `habits`, `kpi_rollups`, `psn_health_history`, `alerts_log`, `audit_trail`

Also `src/db/adapter.js:43` INSERT references `phone`, `buddy_id`, `status`, `join_date` — none exist in migration schema.

**Impact:**
- First real INSERT will throw SQL error
- All SELECT queries return empty
- System completely non-functional with real DB

**Required Fix:**
1. **Option A (Recommended):** Update migration to match adapter queries
   - Rename tables in migration to match adapter expectations
   - Add missing columns: `phone`, `buddy_id`, `status`, `join_date`
2. **Option B:** Rewrite adapter to use existing migration schema
   - Update all queries to use correct table/column names
3. Ensure both are synchronized and tested

**Verification:**
- `wrangler d1 execute` runs all queries without error
- INSERT test creates row with all fields
- SELECT test retrieves data correctly

---

### #9: ERROR MONITORING NOT PERSISTED
**Category:** Observability  
**Severity:** HIGH  
**Priority:** P1  
**Effort:** 3 hours

**Description:**
`src/utils/monitoring.js:14` — `errorLog` is in-memory array only. Errors lost on restart.

**Impact:**
- Cannot track error trends over time
- Debugging past incidents impossible
- No error rate metrics for alerting
- Sentry integration stub only (not wired)

**Required Fix:**
1. Create `errors` table if not exists:
```sql
CREATE TABLE IF NOT EXISTS errors (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  message TEXT,
  stack TEXT,
  context TEXT,
  environment TEXT
);
```
2. Replace `errorLog.push()` with `INSERT INTO errors`
3. Wire up Sentry SDK properly:
```javascript
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```
4. Add `GET /api/monitoring/errors` to query persisted errors

**Verification:**
- Generate error (trigger exception)
- Query `GET /api/monitoring/errors` returns error
- Restart server — error still in DB
- Sentry dashboard receives event (if configured)

---

### #10: NO CI/CD PIPELINE — MANUAL DEPLOYMENT RISK
**Category:** Deployment / DevOps  
**Severity:** HIGH  
**Priority:** P1  
**Effort:** 8 hours

**Description:**
Deployment is manual `wrangler deploy`. No:
- Automated testing on PRs
- Staging environment
- Rollback automation
- Build verification
- Environment promotion

**Impact:**
- Human error in deployment steps
- No confidence in deploy correctness
- Cannot quickly rollback on failure
- No automated quality gates (lint, test, type-check)
- T-025 checklist cannot be validated automatically

**Required Fix:**
1. Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD
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
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx wrangler deploy --env staging

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx wrangler deploy --env production
      - run: ./scripts/post-deploy-smoke.sh
```

2. Add `wrangler.toml` environments: `[env.staging]`, `[env.production]`
3. Create `scripts/post-deploy-smoke.sh` to verify `/health`, `/api/members`

**Verification:**
- Open PR → CI runs automatically
- Merge to staging → auto-deploys to staging
- Merge to main → auto-deploys to production
- Failed test blocks merge

---

## PILOT LAUNCH BLOCKERS (T-025 SPECIFIC)

The following **3 gaps** specifically block T-025 (pilot launch) despite being marked "done":

### Blocker 1: Missing Launch Checklist
- **Expected:** `plans/launch/pilot-go-no-go-checklist.md` with 15 items
- **Actual:** `plans/launch/` directory does not exist
- **Action:** Create checklist, verify all items pass before launch

### Blocker 2: Missing Zalo Kick-off Draft
- **Expected:** `plans/launch/kick-off-zalo-draft.md` with Vietnamese message template
- **Actual:** File missing
- **Action:** Draft message, validate with Zalo API sandbox

### Blocker 3: Missing Day-0 Snapshot
- **Expected:** `plans/launch/day-0-dashboard-snapshot.md` with screenshots
- **Actual:** File missing
- **Action:** Seed 10 pilot members, run dev server, capture screenshots of all views

---

## SCALE BLOCKERS (50+ members)

These **5 gaps** will cause failures when scaling beyond pilot:

### Scale Issue 1: No KV Cache Layer
- **Current:** Every request hits D1 (5-10ms latency per query)
- **At 50 members × 10 requests/day:** 500 D1 queries/day → cost escalates
- **At 500 members:** Full page loads become 500ms+ (DB bottleneck)
- **Fix:** Implement Cloudflare KV cache (8h effort)

### Scale Issue 2: No Connection Pooling Limits
- **Current:** D1 auto-pools but no explicit limits
- **At scale:** Workers spawn many connections → exceed D1 limits → starvation
- **Fix:** Monitor `d1 databases inspect`, tune connection pool (may require Cloudflare support)

### Scale Issue 3: N+1 Queries in Leaderboard
- `src/api/kpi.js` loads each member's KPI separately
- 100 members = 101 queries (1 + 100) → 10x latency
- **Fix:** Single JOIN or batch query (3h effort)

### Scale Issue 4: No Rate Limiting
- **Current:** No limits on login or alert evaluation
- **At scale:** Brute force attacks, DoS via expensive PSN health calculations
- **Fix:** Per-IP rate limit (login), per-user rate limit (alerts) (6h effort)

### Scale Issue 5: Missing DB Indexes
- Migration lacks indexes on `members.email`, `members.role`, `members.tier`
- Full table scans on auth checks (O(n) vs O(log n))
- **At 500 members:** Queries become 10x slower
- **Fix:** Add indexes (2h effort)

---

## UNRESOLVED QUESTIONS

1. **SaaS vs Single-Tenant:** Are we planning multiple MLM companies? Multi-tenancy work is 16-20h effort if yes.
2. **Pilot Size:** Is 10 Tân Binh still target or changed? Affects seed data and checklist.
3. **Budget for Observability:** Can we afford Sentry ($26/mo) or open-source only?
4. **Zalo API Status:** Is `ZALO_ALERT_WEBHOOK` actually configured and working? If not, pilot alerts will fail.
5. **Backup RPO/RTO:** What's acceptable data loss and recovery time? Not documented.
6. **Compliance Scope:** PDPA requires audit logs for 7 years — storage cost implications?

---

## PRIORITY RANKING & RECOMMENDED SEQUENCE

### Sprint 1: Pre-Pilot (BLOCKERS) — 3 days
**Goal:** Make pilot launch safe and verifiable

| Day | Tasks | Effort | Outcome |
|-----|-------|--------|---------|
| 1 | Create launch checklist + Zalo draft + snapshot | 4h | T-025 deliverables exist |
| 2 | Fix JWT async bug + schema mismatch | 6.5h | Auth + DB functional |
| 3 | Remove demo creds + secrets management + error persistence | 7h | Security baseline met |

**Checkpoint:** Can we safely onboard 10 pilot users without data loss or security breach?

---

### Sprint 2: Pilot Stability — 5 days
**Goal:** Ensure pilot runs for 28 days without incident

| Day | Tasks | Effort | Outcome |
|-----|-------|--------|---------|
| 4-5 | Migrate 5 in-memory stores to D1 (alertEngine, monitoring, onboardingBot, trainingOps, auditLog) | 24h | No data loss on restart |
| 6 | Fix fake PBKDF2 + unauthenticated endpoints | 12h | Auth security meets standards |
| 7-8 | CI/CD pipeline + backup/restore test | 11h | Deployments automated, recovery tested |

**Checkpoint:** Can we survive server crash and restore state? Can we deploy safely?

---

### Sprint 3: Scale Preparation — 7 days
**Goal:** Prepare for 50→500 members

| Day | Tasks | Effort | Outcome |
|-----|-------|--------|---------|
| 9-10 | KV cache layer (hot data) | 8h | 60% D1 read reduction |
| 11 | Rate limiting (login + alerts) | 6h | DoS protection |
| 12 | DB indexes + query optimization | 5h | Query latency < 50ms at 500 members |
| 13 | Structured logging + distributed tracing | 6h | Debuggability |
| 14 | Soft delete + idempotency keys | 8h | Data safety + retry safety |

**Checkpoint:** Can we handle 500 concurrent users with acceptable performance?

---

## TOTAL EFFORT & TIMELINE

| Sprint | Hours | Calendar (6h/day) | Deliverable |
|--------|-------|-------------------|-------------|
| 1: Pre-Pilot | 17.5h | 3 days | Pilot can safely launch |
| 2: Pilot Stability | 47h | 8 days | 28-day pilot survivable |
| 3: Scale Prep | 33h | 6 days | Ready for 500 members |
| **Total** | **97.5h** | **17 days** | **Production-ready** |

**Recommendation:** Allocate 4 weeks (20 work days) to complete all critical/high fixes before pilot launch.

---

## RISK IF NOT ADDRESSED

| Gap | Risk if Unfixed | Consequence |
|-----|----------------|-------------|
| Missing T-025 artifacts | No verification of readiness | Launch without confidence |
| In-memory state | Data loss on restart | Pilot participants lose training, trust broken |
| Fake PBKDF2 | Password database compromised | Security breach, PDPA fines |
| Unauthenticated APIs | PII exposed to world | Regulatory action, reputation damage |
| Demo credentials | Anyone can login | Pilot data contaminated, invalid results |
| Secrets in source | Token forgery possible | Complete auth compromise |
| Schema mismatch | DB queries fail | System non-functional at launch |
| No CI/CD | Manual deployment errors | Downtime during pilot |

**Minimum Viable Pilot (Extreme Risk Acceptance):**
If pilot must launch in 1 week with only critical fixes:
1. Create T-025 artifacts (4h)
2. Fix JWT async bug (0.5h)
3. Fix schema mismatch (6h)
4. Remove demo credentials (2h)
5. Remove secrets fallback (2h)
**Total: 14.5h** — Still risky due to data loss (in-memory), but at least auth works and data schema correct.

---

## SUCCESS METRICS

**Pre-Pilot Exit Criteria:**
- [ ] All T-025 deliverables present and verified
- [ ] Zero CRITICAL findings remaining (from consolidated report)
- [ ] All 15 HIGH findings addressed or documented as accepted risk
- [ ] Auth flow works end-to-end (login → dashboard)
- [ ] Data persists across 3 consecutive restarts
- [ ] CI/CD pipeline green on main branch
- [ ] Backup/restore tested successfully

**Post-Pilot Exit Criteria:**
- [ ] 28-day pilot completed with zero data loss incidents
- [ ] Zero security breaches (password leaks, unauthorized access)
- [ ] Performance SLA: 95th percentile < 200ms for dashboard loads
- [ ] Error rate < 0.1% over pilot period
- [ ] All participants graduate or have documented reasons

---

## REPORTS CONSULTED

- `/Users/mac/mekong-cli/SALE MLM/reports/engineering/review/consolidated.md` (66 findings)
- `/Users/mac/mekong-cli/SALE MLM/plans/reports/architectural-gaps-and-technical-debt.md` (23 gaps)
- `/Users/mac/mekong-cli/SALE MLM/plans/t-024-t-025-implementation-plan.md` (task definition)
- `/Users/mac/mekong-cli/SALE MLM/.mekong/tasks.json` (Kanban state)

---

## CONCLUSION

The project is **NOT ready for pilot launch** despite T-024/T-025 being marked "done". The **missing T-025 artifacts** alone block launch verification. More critically, **15 CRITICAL code-level findings** (fake PBKDF2, unauthenticated endpoints, in-memory data loss, hardcoded secrets) make the system **unsafe for production use**.

**Immediate Actions Required:**
1. **Stop:** Do NOT onboard pilot users until at least Sprint 1 complete
2. **Create:** Generate missing T-025 deliverables (checklist, Zalo draft, snapshot)
3. **Fix:** Address top 5 CRITICAL security bugs (17.5h effort minimum)
4. **Test:** Verify fixes with integration tests, not manual checks
5. **Document:** Update roadmap to reflect actual completion status (T-024/T-025 NOT done)

**Bottom Line:** Pilot launch requires **minimum 4 days** of focused engineering before it is safe to proceed. Scaling to 50+ members requires an additional **13 days** of stability/performance work.

---

**Unresolved Questions:**
1. Is the business willing to delay pilot 4+ weeks for proper fixes?
2. Can security risks be mitigated (e.g., WAF, network restrictions) if code fixes take longer?
3. Who will own the T-025 deliverables creation (currently no assigned worker)?
4. Is multi-tenancy required for pilot or only for later SaaS expansion?
