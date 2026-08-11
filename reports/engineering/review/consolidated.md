# Code Review — Consolidated Report
**Project:** Hive Warfare Academy (Droppii Training OS)
**Date:** 2026-06-04
**Reviewer:** Automated Architecture + Security + Performance Audit
**Scope:** Full codebase — Workers, Express, Auth, DB, Schema, Config

---

## Executive Summary

| Dimension | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Architecture | 6 | 3 | 5 | 1 | 15 |
| Security | 5 | 6 | 8 | 4 | 23 |
| Performance | 4 | 4 | 10 | 10 | 28 |
| **Total** | **15** | **13** | **23** | **15** | **66** |

**Verdict: NO-GO for production deployment.**

15 CRITICAL findings must be resolved before any production traffic. The most dangerous issues are:
1. **Fake PBKDF2** — password hashing is a trivial djb2 loop, not cryptographic
2. **Unauthenticated API** — 4 production endpoints accept any request without JWT
3. **Demo credentials** — `admin123` and friends hardcoded in source
4. **Known secrets** — JWT and encryption keys have public fallback values
5. **All state volatile** — in-memory arrays guarantee data loss on every cold start

---

## CRITICAL Findings (15)

### ARCH-1: Duplicate JWT — Workers version has NO expiry
**Files:** `src/workers/index.js:35-47` vs `src/auth/jwt.js`
The Workers JWT does not set `exp` claim. Tokens never expire. The Express version sets 24h expiry. Two incompatible implementations exist.

### ARCH-2: PBKDF2 masquerading as secure hash
**File:** `src/workers/index.js:149-165`
`pbkdf2()` calls `simpleHash()` 10K times. `simpleHash()` is `h = ((h << 5) - h + charCode) | 0` — a djb2 rolling hash. Not PBKDF2. Not HMAC-SHA512. Brute-force is microseconds per guess. This is the **active production auth path**.

### SEC-1: Demo credentials hardcoded
**File:** `src/api/auth.js:15-48`, `src/models/member.js:145-182`
Four accounts with passwords `admin123`, `core123`, `psn123`, `member123`. Baked into process at module load. Treat as compromised.

### SEC-2: Known fallback secrets in source
**Files:** `src/auth/jwt.js:10`, `src/utils/encryption.js:11`, `src/workers/index.js:85`
JWT_SECRET and ENCRYPTION_KEY fall back to strings committed in source. Workers scripts are public. Anyone can forge tokens or decrypt PII.

### SEC-3: No auth on 4 Workers endpoints
**File:** `src/workers/index.js:188-216`
`/api/members`, `/api/habits/checkin`, `/api/kpi/:id`, `/api/analytics/psn-health` execute without JWT validation. Full unauthenticated data access.

### SEC-4: CORS wide-open
**File:** `src/workers/index.js:7-11`
`Access-Control-Allow-Origin: *` with `Authorization` header = any site can make authenticated API calls on behalf of users.

### PERF-1: All state in-memory — guaranteed data loss
**Files:** `src/analytics/alertEngine.js:20`, `src/features/referral.js:15`, `src/agents/onboardingBot.js:28`, `src/api/habits.js:6`, `src/api/kpi.js:8`, `src/utils/auditLog.js:8`
Cloudflare Workers recycle instances routinely. All in-memory arrays/objects reset. D1 schema exists but is never used.

### PERF-2: Members in-memory only — D1 never connected
**File:** `src/api/members.js:8`
`const members = []` with 4 hardcoded demo users. `DatabaseAdapter` exists but is never imported. D1 bindings in `wrangler.toml` are dormant.

### PERF-3: JWT async called without await
**File:** `src/workers/index.js:86`
`createJWT()` returns a Promise (it's async). Called without `await` — `token` is a Promise object, not a JWT string. Login returns unresolvable tokens.

### PERF-4: Members DB INSERT references non-existent columns
**File:** `src/db/adapter.js:43`
INSERT references `phone`, `buddy_id`, `status`, `join_date` — none exist in migration schema. Would throw on first real insert.

### ARCH-3: Schema mismatch — adapter queries non-existent tables
**File:** `src/db/adapter.js` vs `migrations/0001_initial_schema.sql`
Adapter queries `habit_checkins`, `kpi_records`, `psns`, `alert_rules`, `audit_log`, `error_log` — none exist in migration. Migration has `habits`, `kpi_rollups`, `training_progress` — adapter never queries them.

### ARCH-4: No auth middleware on Workers routes
**File:** `src/workers/index.js` vs `src/middleware/requireRole.js`
Express has full RBAC (`requireAuth`, `requireAdmin`, `requirePSNLeader`). Workers has nothing. The middleware is Express-specific and cannot be reused.

### ARCH-5: Dual plaintext+encrypted columns in schema
**File:** `migrations/0001_initial_schema.sql:6-18`
`email` and `email_encrypted` both exist. Ambiguous source of truth. Risks reading unencrypted PII.

### ARCH-6: Audit log in-memory — PDPA non-compliant
**File:** `src/utils/auditLog.js:8`
PDPA Article 35 requires persistent audit trails. Array resets on restart. Migration has `audit_trail` table — never written to.

### PERF-5: Missing DB indexes for common queries
**File:** `migrations/0001_initial_schema.sql`
No index on `members.email` (every login), `members.psn_id`, `members.role`, `members.tier`. Full table scans on every auth check.

---

## HIGH Findings (13)

| ID | Category | Finding | File |
|----|----------|---------|------|
| H-1 | Security | CORS allows any origin with auth headers | `workers/index.js:7` |
| H-2 | Security | No rate limiting on login | `workers/index.js:184` |
| H-3 | Security | Non-constant-time password comparison | `workers/index.js:81` |
| H-4 | Security | AES-256-CBC without HMAC — malleable ciphertext | `encryption.js` |
| H-5 | Security | Client-controlled PII exposure via `includePII` param | `api/members.js:166` |
| H-6 | Security | No `alg` validation in JWT verification | `auth/jwt.js` |
| H-7 | Perf | N+1 queries in PSN health metrics | `analytics/psnHealth.js` |
| H-8 | Perf | KPI model reads company.json from disk per request | `models/kpi.js:33` |
| H-9 | Perf | PBKDF2 10K iterations too slow for Workers 10ms budget | `workers/index.js:150` |
| H-10 | Perf | No pagination cap — clients can request unlimited rows | `api/members.js` |
| H-11 | Arch | Express + Workers share domain logic but have separate auth/middleware/data | Multiple |
| H-12 | Arch | `requireRole.js` Express-only — cannot reuse in Workers | `middleware/requireRole.js` |
| H-13 | Perf | No caching strategy — D1 hit on every request | Multiple |

---

## MEDIUM Findings (23)

| ID | Finding | File |
|----|---------|------|
| M-1 | No input validation on D1 query parameters | `workers/index.js` |
| M-2 | Error messages leak internal structure in non-prod | Multiple |
| M-3 | No session revocation or token blacklist; KV unused | `wrangler.toml` |
| M-4 | No CSRF tokens; SameSite/Secure flags missing | Multiple |
| M-5 | Weak password policy in seeded accounts | `api/auth.js` |
| M-6 | No IP logging in Workers auth path | `workers/index.js` |
| M-7 | 10+ dead/unused exports in psnHealth.js | `analytics/psnHealth.js` |
| M-8 | Bug in referral.js:129 — `referrerId` undefined, leaderboard garbage | `features/referral.js` |
| M-9 | Inconsistent error response formats (5+ patterns) | Multiple |
| M-10 | parseBody() silently returns {} on failure | `workers/index.js:20` |
| M-11 | No request body size limit | `workers/index.js` |
| M-12 | Dual plaintext+encrypted columns | `migrations/0001_initial_schema.sql` |
| M-13 | KV namespace bound but unused | `wrangler.toml` |
| M-14 | R2 bucket bound but unused | `wrangler.toml` |
| M-15 | Non-constant-time HMAC in Zalo webhook | `api/zalo.js` |
| M-16 | PDPA log missing before/after data hashes | `utils/auditLog.js` |
| M-17 | Zero tests for encryption, JWT, Workers, PSN classifier, adapter | `test/` |
| M-18 | jsonwebtoken in deps but Workers can't use CommonJS | `package.json` |
| M-19 | Key derivation uses padEnd, not HKDF/PBKDF2 | `utils/encryption.js:14` |
| M-20 | SQL field names interpolated without allowlist | `db/adapter.js:52` |
| M-21 | No health check on D1/KV/R2 bindings | `workers/index.js:180` |
| M-22 | Missing security headers (CSP, X-Frame-Options, HSTS) | `workers/index.js` |
| M-23 | /health endpoint unauthenticated | `workers/index.js:180` |

---

## LOW Findings (15)

Including: missing DB indexes for training_progress.type, alerts_log.severity, referrals.referee_email; no cold-start optimization; no bundle size analysis; no connection pooling considerations; no response compression; no CDN cache headers; no graceful degradation; no circuit breakers.

---

## Recommended Fix Order

### Sprint 1 — Block production (15 CRITICAL)
1. Replace fake PBKDF2 with `crypto.subtle.deriveBits(PBKDF2)` in Workers
2. Add JWT validation middleware to all 4 Workers routes
3. Remove DEMO_USERS, generate production seed script
4. Set real secrets via `wrangler secret put` (JWT_SECRET, ENCRYPTION_KEY, PASSWORD_SALT)
5. Fix JWT `createJWT` — await the call, add `exp` claim
6. Add `exp` claim + proper verification to Workers JWT
7. Restrict CORS to actual frontend origin
8. Migrate all in-memory arrays to D1 (alertEngine, referral, onboardingBot, habits, kpi, auditLog)
9. Fix adapter to match migration schema (or vice versa)
10. Fix members DB INSERT column mismatch
11. Add DB indexes on email, psn_id, role, tier
12. Remove plaintext email column or encrypt it
13. Fix AES key derivation (use HKDF)
14. Add HMAC to AES-256-CBC or switch to AES-256-GCM
15. Add rate limiting to login endpoint

### Sprint 2 — Hardening (13 HIGH)
16. Extract auth middleware for Workers reuse
17. Add non-constant-time safe comparison for passwords
18. Remove client-controlled `includePII` param
19. Add `alg: 'HS256'` validation in JWT verify
20. Fix N+1 in PSN health queries
21. Cache company.json at startup
22. Add pagination with max limit
23. Consolidate error response format
24. Add input validation layer
25. Wire up KV for sessions + token blacklist
26. Add CSRF protection
27. Add security headers middleware
28. Unify Express + Workers auth logic

### Sprint 3 — Polish (23 MEDIUM + 15 LOW)
29-66. Remaining medium/low items + test coverage + documentation

---

**Reports saved to:**
- `/Users/mac/mekong-cli/SALE MLM/reports/engineering/review/architecture.md`
- `/Users/mac/mekong-cli/SALE MLM/reports/engineering/review/security.md`
- `/Users/mac/mekong-cli/SALE MLM/reports/engineering/review/performance.md`
- `/Users/mac/mekong-cli/SALE MLM/reports/engineering/review/consolidated.md` (this file)
