# SALE MLM — Engineering Performance Review

**Project:** Hive Warfare Academy / Droppii Training OS
**Date:** 2026-06-04
**Reviewed by:** Claude Code (Automated Analysis)
**Scope:** Performance bottlenecks, cold start optimization, database indexing, caching, bundle size, error handling, connection pooling, response time, pagination, serialization, code quality, TypeScript coverage, test coverage

---

## CRITICAL

### C-1. In-Memory Data Loss — alertEngine.js, referral.js, onboardingBot.js

**Files:** `src/analytics/alertEngine.js:20-21`, `src/features/referral.js:15-16`, `src/agents/onboardingBot.js:28`
**Severity:** CRITICAL

`alertEngine.js` stores rules and alert log in module-level arrays. `referral.js` stores referrals and rewards in arrays. `onboardingBot.js` stores sessions in a plain object. All three are in-memory only.

On Cloudflare Workers, every instance gets its own memory. Data written to these arrays is lost when the instance is recycled (Workers runtime does this routinely — sometimes every few seconds). Multiple concurrent requests hit different instances, so there is no shared state.

This means:
- Alert rules reset to default on every instance cold start
- Referral data is completely lost on restart
- Onboarding sessions disappear between requests
- Any leader dashboard reading these gets empty or stale data

**Remediation:**
1. Migrate `alertLog` to D1 using the existing `alerts_log` table in the schema
2. Migrate `referrals` and `rewards` to D1 using the existing `referrals` table
3. Migrate onboarding sessions to D1 using the `onboarding_sessions` table (schema line 127, not yet implemented in adapter)
4. Load alert rules from D1 on Worker cold start

---

### C-2. In-Memory Member Storage — members.js

**File:** `src/api/members.js:8`
**Severity:** CRITICAL

The entire member list is held in a module-level `const members = []` array initialized from `Member.createSeededMembers()`. The D1 schema exists but is never used by any route. The `DatabaseAdapter` in `src/db/adapter.js` implements all needed queries but nothing imports it. The `package.json` entry point is `src/server.js` (Express), not the Workers file, so D1 bindings in `wrangler.toml` are never activated.

**Remediation:**
1. Replace in-memory `members` array with `DatabaseAdapter` calls
2. Ensure `src/server.js` loads D1 binding and passes it to `DatabaseAdapter`
3. Remove `Member.createSeededMembers()` and seed via D1

---

### C-3. Custom JWT Implementation — Security and Performance Risk

**Files:** `src/workers/index.js:22-84`, `src/auth/jwt.js:15-104`
**Severity:** CRITICAL

Two separate JWT implementations exist. The Workers version has a critical bug: `createJWT` is `async` but called without `await` in `handleLogin`, so the returned value is a Promise object, not a JWT string. Additionally, `verifyJWT` imports the crypto key with `['sign']` usage but calls `.verify()` on it — this will fail. The Node.js version does not use `timingSafeEqual` for signature comparison. Both re-create and re-import the crypto key on every request, which is expensive.

**Remediation:**
1. Use the standard `jsonwebtoken` npm package (already in `dependencies`)
2. If staying with crypto.subtle, cache the imported CryptoKey at module scope
3. Fix the missing `await` in `handleLogin`
4. Use `crypto.subtle.timingSafeEqual` for constant-time comparison

---

### C-4. Insecure Password Hashing in Workers

**File:** `src/workers/index.js:113-125`
**Severity:** CRITICAL

The Workers file implements `pbkdf2()` as a custom loop-based hash using a non-cryptographic DJB2-style `simpleHash`. The output is a fixed 128-char hex string regardless of input. Any password produces a deterministic hash that can be reversed trivially. The iteration count of 10,000 on a non-cryptographic function provides no actual security.

**Remediation:**
1. Do not perform password hashing inside Workers — hash at member creation time server-side
2. Use `crypto.subtle.deriveBits` (PBKDF2) in Workers if verification is needed, or move verification to a Node.js endpoint
3. Consider Argon2id via WebAssembly for server-side hashing

---

## HIGH

### H-1. No Database Indexes on Critical Filter Columns

**File:** `migrations/0001_initial_schema.sql`
**Severity:** HIGH

The schema creates indexes on `habits(member_id, date)`, `kpi_rollups(member_id, date)`, `training_progress(member_id)`, and `alerts_log(psn_id, created_at)`. However:

- `members` table has no index on `email` (looked up by `SELECT ... WHERE email = ?` on every login in Workers)
- `members` has no index on `psn_id` (used in `WHERE psn_id = ?` in adapter)
- `members` has no index on `role` or `tier` (filtered in listMembers)
- `psn_health_history` has `(psn_id, recorded_at)` but no standalone `psn_id` index for the `IN (SELECT id FROM members WHERE psn_id = ?)` pattern
- `referrals` has `idx_referrals_referrer` but no composite index on `(referrer_id, reward_status)`
- `audit_trail` has `(actor_id, created_at)` but no index on `resource_type` or `action`

**Remediation:**
```sql
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_psn ON members(psn_id);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_psn_health_psn ON psn_health_history(psn_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON referrals(referrer_id, reward_status);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_trail(resource_type, action);
```

---

### H-2. N+1 Query Pattern in getPSNHealthMetrics

**File:** `src/db/adapter.js:172-190`
**Severity:** HIGH

`getPSNHealthMetrics` runs 3 sequential queries, with queries 2 and 3 each containing a subquery `SELECT id FROM members WHERE psn_id = ?`. For 50 PSNs on a dashboard refresh, this becomes 150+ queries.

**Remediation:**
Combine into a single query using conditional aggregation:
```sql
SELECT COUNT(DISTINCT m.id) as team_size,
  AVG(h.habit_score) as habit_avg,
  AVG(k.connects_per_day) as connect_avg
FROM members m
LEFT JOIN habit_checkins h ON h.member_id = m.id AND h.date >= date('now', '-7 days')
LEFT JOIN kpi_records k ON k.member_id = m.id AND k.date >= date('now', '-7 days')
WHERE m.psn_id = ? AND m.status = 'active'
```

---

### H-3. No Pagination Limit Cap — Unbounded Queries

**Files:** `src/api/members.js:127-163`, `src/db/adapter.js:34-38`
**Severity:** HIGH

The list endpoint accepts `limit` with a default of 50 but no maximum cap. A client can request `limit=100000`. For the D1 version, this hits SQL `LIMIT ?` with unbounded input. For the in-memory version, `result.slice()` creates a massive array copy. Responses of 100,000 rows will exceed Workers' 100MB response body limit.

**Remediation:**
1. Add: `const limitNum = Math.min(parseInt(limit) || 50, 100)`
2. Validate `offset` is non-negative
3. Return `hasMore: false` when hitting the cap

---

### H-4. PBKDF2 10,000 Iterations is Too Slow for Workers

**File:** `src/auth/jwt.js:51`
**Severity:** HIGH

`crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512')` runs 10,000 HMAC-SHA512 iterations synchronously on every login. Cloudflare Workers have 10ms CPU time per request on the free tier — this alone can consume the entire budget. OWASP recommends 600,000 iterations for SHA-512 in 2023+. The Workers version works around this with a non-cryptographic hash (see C-4), which is worse than using fewer iterations with a proper algorithm.

**Remediation:**
1. Increase iterations to 100,000+ for server-side
2. In Workers, use `crypto.subtle.deriveBits` (PBKDF2) which runs in optimized native crypto
3. Or move password verification to a server-side endpoint with Argon2id

---

## MEDIUM

### M-1. Duplicate JWT Implementation

**Files:** `src/workers/index.js:22-84` vs `src/auth/jwt.js:15-104`
**Severity:** MEDIUM

Two separate JWT implementations with different base64 padding handling, different HMAC key encoding, and the Workers version lacks expiration claim validation. If Workers ever needs to verify tokens from Express, subtle compatibility issues will surface.

**Remediation:** Extract into shared module or use `jsonwebtoken` package for both.

---

### M-2. CORS Wildcard

**File:** `src/workers/index.js:2-5`
**Severity:** MEDIUM

`Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Headers: Authorization` allows any origin to make authenticated requests. This bypasses CSRF protections and enables credential-stuffing from any domain.

**Remediation:** Restrict origin to specific domains from an environment variable whitelist.

---

### M-3. Duplicate base64url Functions

**Files:** `src/workers/index.js:22-33`, `src/auth/jwt.js:15-29`
**Severity:** MEDIUM (Code Quality)

Identical `base64urlEncode`/`base64urlDecode` functions implemented independently with different padding logic. Bug fixes must be manually replicated.

**Remediation:** Extract into shared `src/utils/base64url.js`.

---

### M-4. No Caching Strategy

**Files:** `src/workers/index.js`, `src/db/adapter.js`
**Severity:** MEDIUM

Every request hits D1 directly. The KV namespace (`SESSIONS` binding) is configured in `wrangler.toml` but never used. Login queries D1 on every request. Dashboard queries run 3 queries per PSN evaluation.

**Remediation:**
1. Cache member lookup by email in KV with 5-minute TTL
2. Cache PSN health metrics in KV with 2-minute TTL
3. Cache alert rules in KV (infrequent changes)

---

### M-5. No Pagination on alertLog (In-Memory Version)

**File:** `src/analytics/alertEngine.js:228-242`
**Severity:** MEDIUM

`getAlertLog` returns the full array with no pagination. Over months of operation this grows to tens of thousands of entries, consuming bandwidth and blocking the event loop during JSON serialization.

**Remediation:** Add `limit` and `offset` parameters, default `limit=50`, cap at `limit=200`.

---

### M-6. Regex Validation Compiled on Every Request

**File:** `src/api/members.js:29-44`
**Severity:** MEDIUM

RegExp objects are created fresh on every middleware invocation. Email regex is simplistic (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) and accepts invalid patterns like `a@b.c`. Phone regex does not accept domestic Vietnamese format (`0\d{9}`).

**Remediation:**
1. Hoist regex to module scope: `const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. Add domestic phone format support: `^(\+84|0)\d{9,10}$`

---

### M-7. No Streaming for Large JSON Responses

**File:** `src/workers/index.js:9-13`
**Severity:** MEDIUM

`JSON.stringify` buffers the entire response body before sending. For large payloads this blocks the event loop and may exceed Workers' 100MB response limit.

**Remediation:**
1. Use streaming responses for payloads over 1MB
2. Add `Content-Length` header for known-size responses
3. Add `Cache-Control` headers for non-sensitive endpoints

---

### M-8. No Prepared Statement Caching in DatabaseAdapter

**File:** `src/db/adapter.js`
**Severity:** MEDIUM

Every `this.db.prepare(query)` call re-compiles the SQL statement in SQLite. For frequently-run queries like `SELECT * FROM members WHERE email = ?` (every login), this is wasteful.

**Remediation:** Cache prepared statements in a `Map` keyed by query string. Prepare once at cold start for hot queries.

---

### M-9. Password Hashing Uses Dev Salt Fallback

**File:** `src/api/auth.js:50-53`
**Severity:** MEDIUM

`process.env.PASSWORD_SALT || 'dev-salt'` — if `PASSWORD_SALT` is not set in production, all hashes use the same salt, enabling rainbow table attacks. Demo users are hashed at module load time with this salt.

**Remediation:**
1. Fail hard if `PASSWORD_SALT` is not set in production
2. Use per-user random salts: `salt_hex:hash_hex`
3. Move to Argon2id via server-side endpoint

---

### M-10. classifyPSNHealth Called on Every Rule Evaluation

**File:** `src/analytics/alertEngine.js:141`
**Severity:** MEDIUM

`classifyPSNHealth` runs weighted scoring, state classification, and factor computation on every `evaluateAll` call, even when only checking a single metric like `retention_30d < 0.30`.

**Remediation:**
1. Cache PSN health in the metrics object
2. Only compute health classification for rules referencing `psn_health_score`
3. Pre-compute on a schedule and store in D1 or KV

---

## LOW

### L-1. psn_id Column Unused — No psns Table Exists

**Files:** `migrations/0001_initial_schema.sql:14`, `src/models/member.js:31`, `src/db/adapter.js:112`
**Severity:** LOW

`members` table has `psn_id` column. `adapter.js` has `listPSNs()` querying `SELECT * FROM psns` but no `psns` table exists in any migration. The `psn_id` field in members is set but never queried or enforced.

---

### L-2. Column Name Mismatch: email_encrypted vs _encryptedEmail

**Files:** `migrations/0001_initial_schema.sql:10`, `src/models/member.js:26`
**Severity:** LOW

Schema uses `email_encrypted` but model uses `_encryptedEmail`. `SELECT *` returns `email_encrypted` from D1, but the model constructor expects `_encryptedEmail`, causing `setEmail()` to be called with plaintext `email` field (if present) resulting in double-encryption.

**Remediation:** Standardize naming across schema and model.

---

### L-3. referral.js getLeaderboard Bug

**File:** `src/features/referral.js:129`
**Severity:** LOW (Bug)

```javascript
for (const referral of referrals) {
  if (!stats[referrerId]) {  // BUG: referrerId is undefined
```

`referrerId` is never declared. Should be `referral.referrerId`. As written, `getLeaderboard()` always returns `[{ referrerId: undefined, count: referrals.length, rewards: 0 }]`.

**Remediation:** Change to `for (const referral of referrals)` and `stats[referral.referrerId]`.

---

### L-4. includePII Query Parameter Has No Validation

**File:** `src/api/members.js:127`
**Severity:** LOW

`const { includePII = 'false' } = req.query` — values like `?includePII=1` or `?includePII=yes` silently fall back to non-PII without warning.

**Remediation:** Add explicit validation: `const shouldIncludePII = ['true', '1', 'yes'].includes(includePII)`.

---

### L-5. express.json() Has No Body Size Limit

**File:** `src/server.js:19`
**Severity:** LOW

`app.use(express.json())` without a limit allows multi-GB JSON payloads. Workers limits requests to 100MB, but standalone Express has no such protection.

**Remediation:** Change to `app.use(express.json({ limit: '1mb' }))`.

---

### L-6. Unused psnHealth Exports

**File:** `src/analytics/psnHealth.js:223-231`
**Severity:** LOW (Code Quality)

`calculateHealthScore`, `scoreToState`, `getHealthFactors`, `getStateLabel`, `getRecommendedActions` are exported but never imported. Only `classifyPSNHealth` is used.

**Remediation:** Remove unused exports or import them where relevant (e.g., `getRecommendedActions` in the alerts system).

---

### L-7. Demo Users Hardcoded in Source

**File:** `src/api/auth.js:15-48`
**Severity:** LOW (Security Debt)

Four demo users with hardcoded passwords (`admin123`, `core123`, `psn123`, `member123`) in source code. Password hashes computed at module load with a dev salt fallback.

**Remediation:** Move to separate `demo-users.js` excluded from production builds. Add guard: `if (NODE_ENV === 'production') throw`.

---

### L-8. createSeededMembers Creates Duplicates on Hot Reload

**File:** `src/models/member.js:145-182`
**Severity:** LOW

`createSeededMembers()` pushes 4 hardcoded members into the `members` array on every module load. Hot-reload in development causes duplicates.

**Remediation:** Check for existing IDs before pushing, or remove from route initialization and use seed script only.

---

### L-9. toJSON() Always Decrypts PII on Serialization

**File:** `src/models/member.js:103-115`
**Severity:** LOW

`toJSON()` calls `getEmail()` and `getPhone()` which call `decrypt()` on every serialization, even when only non-PII fields are needed. For a list of 50 members, this is 100 unnecessary decrypt calls.

**Remediation:** Use `toSafeJSON()` as default for list endpoints. Call `toJSON()` only for individual detail views.

---

### L-10. jsonwebtoken in Dependencies But Not Used in Workers

**File:** `package.json:26`
**Severity:** LOW (Bundle Size)

`jsonwebtoken` (~150KB + `jws` ~50KB) is in `dependencies` but Workers cannot `require()` it. `wrangler.toml` runs `npm ci --production` which installs it anyway, wasting Workers' 1MB compressed bundle budget.

**Remediation:** Split `package.json` for Workers vs Express, or configure separate build commands in `wrangler.toml`.

---

## Test Coverage Gaps

**Severity:** MEDIUM

Existing tests cover Express auth routes, members, habits, KPI, alerts (smoke), E2E (smoke), and frontend components.

**Missing critical test coverage:**
1. **`src/utils/encryption.js`** — Zero tests for PII encryption/decryption round-trip, null handling, malformed ciphertext
2. **`src/auth/jwt.js`** — Zero tests for JWT signing, verification, expiration, tampered tokens
3. **`src/workers/index.js`** — Zero integration tests (the `await` bug in `createJWT` would be caught by one test)
4. **`src/analytics/psnHealth.js`** — Zero tests for 9-state classifier boundary scores (25, 35, 45, 55, 65, 75, 85, 95)
5. **`src/db/adapter.js`** — Zero tests, including SQL injection risk in `updateMember` (string interpolation of field names)
6. **`src/agents/onboardingBot.js`** — Zero tests for state machine progression, graduation check, streak logic

**Remediation:**
1. Add encryption round-trip tests
2. Add JWT tests for valid/invalid/expired/tampered tokens
3. Add 5+ Workers integration tests (login, members, habits, KPI, health)
4. Add psnHealth boundary tests
5. Add adapter tests with SQL injection attempts
6. Consolidate duplicate test files (`members.test.js` + `members-jest.test.js`)

---

## Bundle Size Analysis

**Workers Bundle:**
- `src/workers/index.js`: 7,253 bytes, zero dependencies — good for cold start
- `npm ci --production` installs `express` (~200KB), `cors`, `dotenv`, `jsonwebtoken` (~150KB) + `jws` (~50KB) — Workers cannot use these
- Estimated Workers bundle after minification: ~300-500KB including dead dependency code
- Workers free tier limit: 1MB compressed

**Remediation:**
1. Use separate `package.json` for Workers build with only necessary packages
2. Configure `wrangler.toml` `[build]` with custom install command
3. Remove `express`, `cors`, `dotenv` from Workers build

---

## Priority Action Summary

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Migrate in-memory state (alerts, referrals, onboarding) to D1 | 2 days |
| P0 | Fix Workers JWT await bug and key import issue | 2 hours |
| P0 | Replace custom PBKDF2 in Workers | 1 day |
| P1 | Add missing database indexes (email, psn_id, role, tier) | 1 hour |
| P1 | Wire DatabaseAdapter into Express routes | 1 day |
| P1 | Fix N+1 in getPSNHealthMetrics | 4 hours |
| P1 | Add pagination limit cap | 2 hours |
| P2 | Implement KV caching for login and PSN metrics | 1 day |
| P2 | Migrate JWT implementations to jsonwebtoken | 4 hours |
| P2 | Add test coverage for critical modules | 3 days |
| P3 | Fix referral.js leaderboard bug | 15 min |
| P3 | Restrict CORS origins | 1 hour |
| P3 | Remove dead code | 2 hours |

---

**Total findings:** 28 (4 CRITICAL, 4 HIGH, 10 MEDIUM, 10 LOW)
