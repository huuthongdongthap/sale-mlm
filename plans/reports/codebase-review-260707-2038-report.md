# Codebase Review Report
> **Date:** 2026-07-07 | **Scope:** Full src/ (Workers, Express, Dashboard, Models, Utils)
> **Tests:** 9 suites, 8 FAILED | **Coverage:** 4.87% (threshold: 70%)

---

## CRITICAL — Fix Immediately

### 🔴 CRIT-1: `kpiRecords` undefined crash (runtime)
**File:** `src/workers/index.js:881`
```javascript
case 'kpi': kpiRecords.push({ ...value, date: now }); break;
```
`kpiRecords` never declared. Any POST to `/api/training/progress` with `type:'kpi'` → ReferenceError → 500.
**Fix:** Add `let kpiRecords = [];` at line ~853 alongside `dayCompletions`, `habitScores`, `orderRecords`.

### 🔴 CRIT-2: `btoa()` corrupts Vietnamese characters in JWT
**File:** `src/workers/index.js:40`
```javascript
const base64urlEncode = (str) => btoa(str).replace(...)
```
`btoa()` only handles Latin-1. Member names like "Nguyễn Văn A" → corrupted JWT → silent auth failure.
**Fix:** Use `TextEncoder` + base64:
```javascript
const base64urlEncode = (str) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(str)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
```

### 🔴 CRIT-3: 8/9 test suites FAIL — supertest missing
**Error:** `Cannot find module 'supertest' from 'test/kpi-jest.test.js'`
List: `kpi-jest`, `api-jest`, `ops-jest`, `alerts-jest`, `members-jest`, `habits-jest`, `auth-jest`, `models-jest` — ALL fail to import.
**Root cause:** `supertest` in devDependencies but not installed properly in node_modules for Jest resolver.
**Fix:** `cd src/dashboard && npm install supertest` or add root-level jest config with proper module resolution.

### 🔴 CRIT-4: AES-CBC without authentication (padding oracle)
**File:** `src/utils/encryption.js:8`
```javascript
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
```
CBC mode has no integrity tag. Attacker can flip bits in ciphertext → predictable plaintext changes → padding oracle attack.
**Fix:** Switch to `aes-256-gcm` which includes authentication tag.

---

## HIGH — Fix Soon

### 🟠 HIGH-1: Encryption key not derived — uses raw env var
**File:** `src/utils/encryption.js:9-12`
```javascript
const key = (env.ENCRYPTION_KEY || 'hive-dev-key-2026').padEnd(32,'0').slice(0,32);
```
Raw env var used as AES key. No PBKDF2/HKDF derivation. Weak key → brute-forceable.
**Fix:** Derive key:
```javascript
const key = crypto.pbkdf2Sync(env.ENCRYPTION_KEY, salt, 600000, 32, 'sha256');
```

### 🟠 HIGH-2: PBKDF2 iteration count mismatch
**Workers (line 336):** 100,000 iterations — 6× weaker than documented design (600K).
Risk: Moderate for internal tool, but weakens password hash against brute-force.
**Fix:** Align to 600,000 or at minimum 300,000.

### 🟠 HIGH-3: XSS via innerHTML — 50+ instances
**Files:** `src/dashboard/*.js`, `src/dashboard/components/*.js`
Pattern: `container.innerHTML = \`<div>${userData}</div>\``
If any user-controlled data reaches innerHTML without escaping → XSS.
**Current risk:** MEDIUM — all data is from D1 (internal), no user-generated HTML input.
**Future risk:** HIGH — if public pages are added (which they need to be per audit).
**Fix:** Add `escapeHTML()` helper; use `textContent` for plain text.

### 🟠 HIGH-4: Duplicate route registration for /api/leads
**File:** `src/workers/index.js:1169` AND `:1176-1177`
Line 1169: `GET /api/leads` with auth
Line 1177: `GET /api/leads` with auth (duplicate, overwrites)
Line 1176: `POST /api/leads` without auth (correct for public)
Dead code at 1169. Confusing maintenance.
**Fix:** Remove line 1169-1171.

### 🟠 HIGH-5: No error recovery in handleCreateOrder
**File:** `src/workers/index.js:1036-1065`
`handleCreateOrder` does INSERT before commission calc. If commission calc fails after INSERT → order exists but no commission record. No transaction.
**Fix:** Use D1 transaction or rollback pattern.

---

## MEDIUM — Fix Before Production

### 🟡 MED-1: 197 console.log statements in src/
**Pattern:** `console.log('🧪', ...)`, `console.error(...)`, `console.warn(...)`
Found in: Workers (debug spam), dashboard, models, utils.
**Risk:** Log leakage in production (Cloudflare Workers logs bills per GB).
**Fix:** Replace with structured logging or remove debug logs.

### 🟡 MED-2: Rate limiter is per-isolate
**File:** `src/workers/index.js:107` — `rateLimitMap = new Map()`
Cloudflare spins new isolates under load → each gets fresh Map → rate limit reset.
**Impact:** Brute-force protection unreliable under DDoS.
**Fix:** Use KV store for distributed rate limiting (already configured in wrangler.toml).

### 🟡 MED-3: No soft delete — hard delete in handleDeleteMember
**File:** `src/workers/index.js:439`
`DELETE FROM members WHERE id = ?` — permanent.
**Fix:** Add `deleted_at` column + soft delete flag.

### 🟡 MED-4: 4 broken JSON content files
**Files:** `content/tier3/m9-sun-tzu.json`, `m10-campaign.json`, `m11-data.json`, `m12-legacy.json`
Parser error on load → modules 9-12 completely unusable.
**Fix:** Fix JSON syntax errors.

### 🟡 MED-5: Dashboard files exceed 200 LOC KEEP rule
| File | Lines |
|------|-------|
| `members-table.js` | 1145 |
| `kpi-modal.js` | 880 |
| `psn-health.js` | 676 |
| `leads-view.js` | 381 |
| `kpi-panel.js` | 380 |

Per CLAUDE.md: "Keep individual code files under 200 lines." All exceed.
**Fix:** Split into smaller components.

### 🟡 MED-6: 1134 try blocks, only 224 catch blocks
**Pattern:** Many `await` calls in try blocks without catch → unhandled rejections → silent 500s.
**Impact:** Debugging impossible in production.
**Fix:** Add catch blocks with structured error responses.

### 🟡 MED-7: No idempotency keys on orders/leads
**Risk:** Client retry → duplicate orders. Same email → duplicate leads.
**Fix:** Add unique constraint on `(email, created_at < 1 hour)` or idempotency key header.

### 🟡 MED-8: Orphan scripts in root
**Files:** `fix_routes.py`, `seed_d1_test.py`, `mlx_bridge.py`, `run_cto.sh`
Purpose unclear. May be stale.
**Fix:** Delete or move to `scripts/archive/`.

---

## LOW — Technical Debt

### 🟢 LOW-1: TODO in psn-health.js:333
```javascript
// TODO: Navigate to detail page
```
Minor — navigation feature placeholder.

### 🟢 LOW-2: Empty tests (mock-only)
`test/habits-jest.test.js`, `test/members-jest.test.js`, etc. — test suites exist but test implementation is minimal/mocked. Real coverage = near zero.

### 🟢 LOW-3: No CSP headers
Dashboard serves HTML inline. No Content-Security-Policy. XSS risk low but should add.

### 🟢 LOW-4: JWT secret + encryption key in .env.example
`.env.example` contains dev defaults. Risk: Developer copies .env.example to .env in production.
**Fix:** Add `# NEVER use these in production` warning at top of .env.example.

### 🟢 LOW-5: No input sanitization
All API endpoints accept raw JSON. No schema validation. Malformed input → SQL injection via string concatenation (some queries use template literals with `?` placeholders, but `handleFunnelMetrics` uses template literal for GROUP BY without params).

---

## SECURITY SUMMARY

| Issue | Severity | CWE | Fix Priority |
|-------|----------|-----|-------------|
| JWT corruption via btoa (Vietnamese chars) | CRITICAL | CWE-930 | Immediate |
| AES-CBC no auth tag | CRITICAL | CWE-327 | Immediate |
| PBKDF2 100K iterations (6× weaker) | HIGH | CWE-916 | Soon |
| Raw env var as encryption key | HIGH | CWE-326 | Soon |
| XSS via innerHTML (50+ instances) | HIGH | CWE-79 | Before public pages |
| No CORS configuration | MEDIUM | CWE-942 | Before production |
| No rate limiting on KV (per-isolate only) | MEDIUM | CWE-307 | Before public launch |
| Hard delete (no audit trail) | MEDIUM | CWE-799 | Before PDPA |
| No CSP headers | LOW | CWE-693 | Nice to have |
| Dev secrets in .env.example | LOW | CWE-798 | Easy fix |

---

## DEPENDENCY AUDIT

| Package | Status | Notes |
|---------|--------|-------|
| express 4.21.0 | Clean | No known CVEs |
| jsonwebtoken 9.0.3 | Clean | No known CVEs |
| cors 2.8.5 | Clean | No known CVEs |
| dotenv 16.4.5 | Clean | No known CVEs |
| jest 30.3.0 | Clean | No known CVEs |
| supertest 7.2.2 | Clean | Not installed in node_modules |

Only finding: `supertest` listed but not resolvable by Jest. Fix: `npm install supertest` in project root.

---

## DEAD CODE / UNUSED

| File | Reason |
|------|--------|
| `src/api/mock/psn-health.js` | Mock file, not imported anywhere |
| `src/dashboard/public/` | Directory doesn't exist (planned but not created) |
| `modules/` (root) | Unknown purpose, likely stale |
| `bin/kanban.js` | Not referenced in package.json scripts |
| `hive-academy/` | Separate Next.js project, not wired to main app |
| Root `.html` files | Hive_Academy_Proposal.html, hive-dashboard-temp.html — proposals/mockups |

---

## PRIORITIZED FIX QUEUE

### Immediate (today):
1. Fix CRIT-1: `kpiRecords` initialization (+4 LOC)
2. Fix CRIT-2: `base64urlEncode` → TextEncoder (+6 LOC)
3. Fix CRIT-3: `npm install supertest` (test resolution)
4. Fix CRIT-4: AES-CBC → AES-GCM (~10 LOC)

### This week:
5. Fix HIGH-1: Derive encryption key with PBKDF2
6. Fix HIGH-2: PBKDF2 iterations → 600K
7. Fix HIGH-3: Add `escapeHTML()` helper, audit innerHTML usages
8. Fix HIGH-4: Remove duplicate route registration
9. Fix HIGH-5: Transaction wrapper for order+commission

### Before production launch:
10. Fix MED-1: Remove/guard console.log
11. Fix MED-2: KV-based rate limiter
12. Fix MED-3: Soft delete + audit trail
13. Fix MED-4: Fix 4 broken JSON files
14. Fix MED-6: Add catch blocks to async handlers
15. Fix MED-7: Idempotency keys on orders

### Backlog:
16. Split files >200 LOC (MED-5)
17. Delete orphan scripts (MED-8)
18. Add CSP headers (LOW-3)
19. Add .env.example warning (LOW-4)

---

## UNRESOLVED QUESTIONS

1. `hive-academy/` Next.js project inside repo — keep, delete, or separate repo?
2. `src/dashboard/public/` planned but missing — build or remove from roadmap?
3. Why 8 test suites fail but `npm test` passes with "14 passed"? (Jest config issue with rootDir)
4. `DOCUMENT function in handleTrainingProgress` at line 843—comment mentions but function not in this scope?
5. Coverage report shows `All files` from `api/` at 0% but only 5 files listed — missing `analytics-funnel.js` (349 LOC, 0 tests)?
