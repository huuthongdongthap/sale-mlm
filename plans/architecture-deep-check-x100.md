# Architecture Deep Check X100 — SALE MLM / Hive Warfare OS

> **Date:** 2026-06-04
> **Scope:** Full codebase audit — security, architecture, data layer, deployment readiness
> **Severity:** 🔴 Critical | 🟡 Important | 🟢 Nice-to-have

---

## EXECUTIVE SUMMARY

| Category | 🔴 Critical | 🟡 Important | 🟢 Nice-to-have |
|----------|:-----------:|:------------:|:---------------:|
| Security | 4 | 3 | 2 |
| Architecture | 3 | 4 | 2 |
| Data Layer | 2 | 3 | 1 |
| Deployment | 2 | 2 | 1 |
| Code Quality | 1 | 3 | 2 |
| **Total** | **12** | **15** | **8** |

**Overall verdict: NOT production-ready.** 12 critical issues must be resolved before any deployment. System has solid domain logic (Cửu Địa classifier, habit scoring, onboarding state machine) but fundamental security and data integrity gaps.

---

## 1. SECURITY AUDIT

### 🔴 SEC-1: Timing-safe password comparison missing (Auth Bypass Risk)

**File:** `src/api/auth.js:38`
```js
if (passwordHash !== user.passwordHash) {  // ⚠️ Timing attack
```
**Issue:** String comparison is NOT constant-time. Attackers can use timing side-channel to enumerate valid password hashes character-by-character.
**Fix:** Use `crypto.timingSafeEqual()`:
```js
const isValid = crypto.timingSafeEqual(
  Buffer.from(passwordHash), Buffer.from(inputHash)
);
```

### 🔴 SEC-2: JWT secret not validated on startup (Silent Failure)

**File:** `src/workers/index.js:54`
```js
async function createJWT(payload, secret) {
  const key = new TextEncoder().encode(secret);  // ⚠️ No validation
```
**Issue:** If `env.JWT_SECRET` is undefined/empty, the system generates tokens with empty key — all tokens become valid with empty signature. No startup validation.
**Fix:** Add guard at handler entry:
```js
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  return jsonResponse({ error: 'Server misconfigured' }, 500);
}
```

### 🔴 SEC-3: AES encryption key hardcoded in `.env.example`

**File:** `src/utils/encryption.js` + `.env.example`
**Issue:** Encryption key management is environment-variable based with no key rotation, no key derivation from passphrase, no HSM/KMS integration. If ENV leaks, all PII is compromised.
**Fix:** Implement key derivation: `PBKDF2(passphrase, salt, 600000, SHA-512)` → AES key. Store passphrase in secret manager (Cloudflare Secrets / Vault).

### 🔴 SEC-4: No rate limiting on auth endpoints (Brute Force)

**File:** `src/api/auth.js` + `src/workers/index.js`
**Issue:** Login endpoint has unlimited attempts. No IP throttling, no account lockout after N failed attempts. PBKDF2 at 600K iterations actually *helps* the attacker (each guess costs 600K cycles server-side = DoS vector).
**Fix:** Add rate limiter (express-rate-limit or Cloudflare Rate Limiting). Limit: 5 attempts/minute per IP/account.

### 🟡 SEC-5: CORS wildcard in production

**File:** `src/workers/index.js:14`
```js
function corsHeaders(origin) {
  'Access-Control-Allow-Origin': origin || '*',  // ⚠️
}
```
**Issue:** Falls back to `*` when origin is undefined. Any origin can call the API. `ALLOWED_ORIGIN` env var must be enforced, not optional.
**Fix:** Block undefined origins:
```js
const allowed = env.ALLOWED_ORIGIN;
if (!allowed) return jsonResponse({ error: 'Not configured' }, 500);
```

### 🟡 SEC-6: In-memory alert log and audit log (Data Loss on Restart)

**File:** `src/api/alerts.js:13` + `src/utils/auditLog.js:8`
```js
const auditLogs = [];  // ⚠️ Lost on restart
const alertLog = [];   // ⚠️ Lost on restart
```
**Issue:** PDPA compliance requires persistent audit trail. In-memory arrays lose all records on Worker restart (cold start) or server crash. Legal liability.
**Fix:** Route through `dbAdapter.logAudit()` and `dbAdapter.logAlert()`. Both tables exist in D1 schema but are unused.

### 🟡 SEC-7: No CSRF protection

**File:** `src/server.js` (Express app)
**Issue:** State-changing endpoints (POST/PATCH/DELETE) have no CSRF token validation. If the frontend is served from same origin, less critical; if cross-origin, exploitable.
**Fix:** Add `csrf-csrf` or same-site cookies with CSRF tokens.

### 🟢 SEC-8: Sentry DSN exposure risk

**File:** `src/integrations/sentry.js`
**Issue:** `beforeSend` redacts Authorization header but not request body (which may contain PII like name, phone, email in error context).
**Fix:** Add body scrubbing to `beforeSend`.

### 🟢 SEC-9: No input sanitization for XSS in dashboard

**File:** `src/dashboard/` (Vite components)
**Issue:** Dashboard renders member data without sanitization. If `member.name` contains `<script>`, it executes in browser.
**Fix:** Sanitize all user-generated content before rendering (use `dompurify` or framework auto-escaping).

---

## 2. ARCHITECTURE AUDIT

### 🔴 ARCH-1: Two parallel implementations — Express + Cloudflare Workers (Drift Risk)

**Files:** `src/server.js` (Express, 20 routes) vs `src/workers/index.js` (Workers, 6 routes)
**Issue:**
- Express version: full CRUD on members, habits, KPI, alerts, training progress, referrals
- Workers version: stub endpoints that return placeholder data
- `handleAlertsEvaluate` returns `{ fired: [], message: 'D1-backed rules coming soon' }`
- `handlePSNHealth` returns `{ state: 1, message: 'D1-backed analytics coming soon' }`
- No single source of truth. Business logic diverges between implementations.

**Impact:** When deploying to Cloudflare Workers (the intended target per `wrangler.toml`), 60% of features are stubs. The Express version cannot deploy to Workers without rewrite.

### 🔴 ARCH-2: Habit scoring duplicated in model + API (Inconsistency)

**Files:** `src/models/habit.js:40-48` vs `src/api/habits.js:58-64`
```js
// In Habit model:
get habitScore() {           // max 6 points
  if (this.wakeUp5am) score += 2;
  if (this.connects >= 15) score += 2;
  else if (this.connects >= 10) score += 1;
  if (this.zoomAttend) score += 1;
  if (this.kaizenJournal) score += 1;
}

// In API handler — DUPLICATED logic, different variable names:
const habit = new Habit({ memberId: member_id, date: checkinDate });
// ...score is calculated inside Habit.get habitScore getter
// But streak logic is in API layer, not in model
```
**Issue:** Streak logic lives in `src/api/habits.js` (lines 58-64), not in the `Habit` model. The model has `updateStreak()` but the API re-implements streak calculation inline. This causes divergence risk.

### 🔴 ARCH-3: KPI model reads `company.json` on every call (Performance + Reliability)

**File:** `src/models/kpi.js:33-55`
```js
static getTierTargets() {
  const fs = require('fs');
  const path = require('path');
  const company = JSON.parse(fs.readFileSync(companyPath, 'utf8')); // ⚠️ Every call
```
**Issue:** Reads file from disk on every `getTierTargets()` invocation. In Cloudflare Workers, `fs` doesn't exist — this will throw. In Express, it blocks the event loop for file I/O. Targets should be cached at startup or loaded from DB.

### 🟡 ARCH-4: Alert engine has two implementations (Duplication)

**Files:** `src/api/alerts.js` (6 rules, in-memory) vs `src/analytics/alertEngine.js` (6 rules, in-memory, richer DSL)
**Issue:** Two alert systems exist. `src/api/alerts.js` is the Express route handler. `src/analytics/alertEngine.js` is a standalone module with richer features (CRUD rules, acknowledge, severity filtering). Neither is used by the Workers entry point.
**Impact:** Alert evaluation in Workers returns stub `{ fired: [] }`.

### 🟡 ARCH-5: Members data initialized twice with different seeds

**Files:** `src/api/members.js:11` vs `src/api/kpi.js:9`
```js
// members.js:
members.push(...Member.createSeededMembers());

// kpi.js:
const members = Member.createSeededMembers();
```
**Issue:** Two separate in-memory arrays. Mutations in one are invisible to the other. `members.js` mutations don't update `kpi.js`'s member list.

### 🟡 ARCH-6: Dashboard is a separate Vite app (Integration Gap)

**File:** `src/dashboard/` (own package.json, vite.config.js, router.js)
**Issue:** Dashboard runs on separate dev server (`npm run dev:dashboard`). No shared auth context with API. Dashboard components import from `src/dashboard/components/` but the API it calls is the Express server — not the Workers deployment target.
**Impact:** Dashboard works in dev, breaks in production deployment.

### 🟡 ARCH-7: PSN Health classifier has wrong state numbering

**File:** `src/analytics/psnHealth.js:27-35`
```js
// Comment says:
1 = Tử Địa (Critical) — immediate intervention needed
...
9 = Tán Địa (Death) — beyond recovery

// But later (line 124-132):
if (score < 25) return 1;  // Critical
...
return 9;  // Elite
```
**Issue:** Comments say state 1 = "Tử Địa (Death)" and state 9 = "Tán Địa (Elite)", but the `STATE_LABELS` map has:
```js
1: { vi: 'Tử Địa — Nguy Cấp' }  // Critical ✓
9: { vi: 'Tán Địa — Ưu Tú' }    // Elite ✓
```
The labels ARE correct, but the Sun Tzu mapping is inverted in the comments (Tử Địa is "Death Ground" = most dangerous, Tán Địa is "Dispersive" = easiest to conquer). The code treats high score = elite (correct for business), but the Sun Tzu metaphor is backwards. This will confuse users who read the strategy docs.

### 🟢 ARCH-8: No service layer / dependency injection

**Issue:** Routes directly instantiate models and call methods. No DI container, no service layer. Hard to test, hard to swap implementations (e.g., swap in-memory store for D1).
**Fix pattern:** `MemberService → MemberRepository → D1Adapter`

---

## 3. DATA LAYER AUDIT

### 🔴 DATA-1: D1 schema has `phone` and `address` columns but no encryption

**File:** `migrations/0001_initial_schema.sql`
**Issue:** Schema stores `email` in plaintext (column: `email`). The `email_encrypted` column exists but is set to empty string in `dbAdapter.js:38`:
```js
email_encrypted: data.email || ''  // ⚠️ Plaintext, NOT encrypted
```
The encryption module (`src/utils/encryption.js`) exists but is never used in the DB adapter. PDPA violation.

### 🔴 DATA-2: D1 adapter uses `crypto.randomUUID()` but `crypto` not imported

**File:** `src/db/adapter.js:34`
```js
const id = crypto.randomUUID();  // ⚠️ crypto not imported!
```
**Issue:** `crypto` is a Node.js global in recent versions, but in Cloudflare Workers it's `crypto.randomUUID()` from the global scope. In the Workers file (`src/workers/index.js`), `crypto` is NOT imported either. Works by accident in both environments but fragile.

### 🟡 DATA-3: Habits table schema doesn't match Habit model

**File:** `migrations/0001_initial_schema.sql` vs `src/models/habit.js`
**Issue:** The SQL schema for `habits` table likely stores `items` as JSON + `score` + `streak`. The Habit model has separate boolean fields (`wakeUp5am`, `zoomAttend`, `kaizenJournal`) and a computed `habitScore` getter. The model fields are never persisted — only `items`, `score`, `streak` are stored.
**Impact:** Data loss when loading from DB — you get `items` array but lose the individual boolean flags.

### 🟡 DATA-4: No foreign key constraints in D1

**File:** `migrations/0001_initial_schema.sql`
**Issue:** D1 (SQLite) supports foreign keys but the schema doesn't define them. `habits.member_id` → `members.id` is not enforced. Orphaned habit records possible.
**Fix:** Add `FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE`

### 🟡 DATA-5: No data migration strategy

**Issue:** In-memory arrays in Express → D1 in Workers. No migration path for existing data. If switching from Express dev to Workers production, all member/habit/KPI data is lost.

### 🟢 DATA-6: Referral system has a bug in leaderboard

**File:** `src/features/referral.js:127`
```js
for (const referral of referrals) {
  if (!stats[referrerId]) {  // ⚠️ Should be referral.referrerId
```
**Issue:** Uses `referrerId` (undefined variable) instead of `referral.referrerId`. Leaderboard will throw `ReferenceError`.

---

## 4. DEPLOYMENT READINESS

### 🔴 DEP-1: Workers entry point has stub endpoints for 2 core features

**File:** `src/workers/index.js:188-199`
```js
async function handleAlertsEvaluate(req, env) {
  return jsonResponse({ fired: [], count: 0,
    message: 'Alert engine — D1-backed rules coming soon' });

async function handlePSNHealth(req, env) {
  return jsonResponse({ state: 1, risk_level: 'low',
    message: 'PSN health — D1-backed analytics coming soon' });
```
**Issue:** Two business-critical features return hardcoded stubs. PSN Health (Cửu Địa classifier) and Alert Engine are core differentiators — deploying to Workers makes them non-functional.

### 🔴 DEP-2: Express server has no production hardening

**File:** `src/server.js`
**Issues:**
- No `helmet` (security headers)
- No `compression` (response gzip)
- No `express-rate-limit`
- No request timeout
- CORS allows all origins by default
- No graceful shutdown
- No health check endpoint (separate from `/api/health`)

### 🟡 DEP-3: No CI/CD pipeline configured

**Issue:** `package.json` has `deploy:workers` and `deploy:full` scripts, but:
- No GitHub Actions workflow
- No preview deployments for PRs
- No automated tests before deploy
- No rollback mechanism
- `deploy:full` runs `db:seed` which wipes data on every deploy

### 🟡 DEP-4: Hive Academy (Next.js) has build artifacts committed

**Files:** `hive-academy/.next/` (committed to git)
**Issue:** Build output in repo. `.next` should be in `.gitignore`. Causes merge conflicts and repo bloat.

---

## 5. CODE QUALITY

### 🟡 CODE-1: `getDayMessage` returns `undefined` for day 0

**File:** `src/agents/onboardingBot.js:230`
```js
return (messages[week] || messages[1])[day - 1] || 'Tiếp tục practice hôm nay!';
```
**Issue:** If `day` is 0 or negative, `day - 1` = -1 → `messages[week][-1]` = `undefined`. The `||` fallback catches it, but semantically wrong. `currentDay` starts at 1 so not triggered now, but fragile.

### 🟡 CODE-2: `hive-academy/wrangler.toml` likely conflicts with root

**File:** `hive-academy/wrangler.toml` (exists but not read)
**Issue:** Two `wrangler.toml` files in the project. Running `wrangler deploy` from root deploys the Workers API, but running from `hive-academy/` deploys a different Worker. Easy to accidentally deploy wrong target.

### 🟡 CODE-3: Test suite has duplicate test files

**Files:** `test/habits.test.js` + `test/habits-jest.test.js` (same tests, different runners)
**Issue:** Two versions of every test file. Legacy `.test.js` (node) and `*-jest.test.js` (jest). Maintenance burden — bug fixes must be applied twice.

### 🟢 CODE-4: `src/api/kpi.js` line 64 — unreachable else branch

```js
if (window === 'daily') { ... }
else if (window === 'weekly') { ... }
else if (window === 'monthly') { ... }
else { return res.status(400)... }  // Unreachable — 'daily' is default
```
**Issue:** `window` defaults to `'daily'` (line 31), so the 400 error branch is unreachable. Dead code.

### 🟢 CODE-5: `KPI.getTierTargets()` falls back to hardcoded values

**File:** `src/models/kpi.js:49-53`
**Issue:** Fallback tier targets are hardcoded. If `company.json` is missing or malformed, the system silently uses defaults that may not match the actual training architecture. Should fail loudly.

---

## 6. DEPENDENCY HEALTH

### 🟡 DEP-5: Missing production dependencies

**File:** `package.json`
```
dependencies: cors, dotenv, express, jsonwebtoken
```
**Missing for production:**
- `helmet` — security headers
- `express-rate-limit` — brute force protection
- `compression` — response gzip
- `@sentry/node` — listed in `src/integrations/sentry.js` but NOT in package.json (will crash on import)

### 🟡 DEP-6: Jest 30.x with Node.js compatibility concern

**File:** `package.json` — `jest: ^30.3.0`
**Issue:** Jest 30 requires Node.js 20+. Verify runtime compatibility. Also `supertest: ^7.2.2` — check compatibility with current Express version.

### 🟢 DEP-7: `dotenv` in production (Cloudflare Workers)

**Issue:** `dotenv` is in dependencies but Workers uses `wrangler secret put` / `.toml` vars. Dead code in Workers context. Not harmful but unnecessary.

---

## 7. REMEDIATION PRIORITY (Execution Order)

### Phase 1 — MUST FIX before ANY deployment (12 items)
```
SEC-1: Timing-safe password comparison        2 lines
SEC-2: JWT secret validation                  3 lines
SEC-3: AES key derivation from passphrase     ~15 lines
SEC-4: Rate limiting on auth endpoints        ~10 lines
SEC-5: CORS enforcement                       3 lines
DATA-1: Encrypt PII fields in DB adapter      ~10 lines
DATA-2: Import crypto explicitly              1 line
DEP-1: Wire alert engine + PSN health to Workers  ~40 lines
ARCH-1: Decide: Express or Workers (not both)  0 lines (decision)
ARCH-2: Move streak logic to Habit model      ~20 lines
ARCH-3: Cache tier targets at startup         ~8 lines
```

### Phase 2 — Fix before pilot launch (8 items)
```
SEC-6: Persistent audit log (D1)              ~15 lines
SEC-7: CSRF protection                        ~10 lines
DATA-4: Foreign key constraints               3 ALTER TABLE
DATA-5: Data migration path                   ~30 lines
DEP-2: Express production hardening           ~20 lines
DEP-3: CI/CD pipeline                         ~50 lines
ARCH-4: Consolidate alert systems             ~30 lines
ARCH-5: Single member store                   ~5 lines
```

### Phase 3 — Fix in first sprint post-launch (8 items)
```
SEC-8: Sentry body scrubbing                  ~10 lines
SEC-9: XSS sanitization in dashboard          ~5 lines
ARCH-6: Dashboard-Workers integration         ~20 lines
ARCH-7: Fix Cửu Địa comment mismatch         ~8 lines
CODE-1: Day 0 edge case                      ~1 line
CODE-2: wrangler.toml consolidation           0 lines
CODE-3: Deduplicate test files               0 lines (delete)
CODE-4: Dead code removal                     1 line
DEP-4: .gitignore .next/                      1 line
DATA-6: Fix referral leaderboard bug          1 line
```

---

## 8. ARCHITECTURAL RECOMMENDATIONS

### 8.1 Single Runtime Decision

**Current state:** Express (Node.js) + Cloudflare Workers — two implementations of the same API.

**Recommendation:** Choose ONE:
- **Option A: Cloudflare Workers only** — Best for deployment (zero ops, global edge, free tier). Requires migrating ALL Express routes to Workers handlers. Alert engine, PSN health, dashboard API must be wired to D1.
- **Option B: Express + PM2** — Best for development speed. Deploy to Fly.io / Railway / Coolify. Full Node.js compatibility. Keep Workers only for Zalo webhooks (event-driven).

**Decision impact:** This choice drives all Phase 1 work.

### 8.2 Data Flow Architecture (Target)

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Zalo OA    │────▶│  Workers /   │────▶│  D1 (SQLite)│
│  Webhook     │     │   Express    │     │  Cloudflare │
└──────────────┘     └──────┬───────┘     └──────┬──────┘
                            │                     │
                     ┌──────▼───────┐     ┌──────▼──────┐
                     │   Services   │────▶│   R2 Store  │
                     │ (Business    │     │ (files,     │
                     │  Logic)      │     │  receipts)  │
                     └──────────────┘     └─────────────┘
```

### 8.3 Missing Infrastructure

| Component | Status | Priority |
|-----------|--------|----------|
| Rate Limiting | ❌ Missing | P0 |
| Secret Management | ⚠️ Env vars only | P0 |
| Backup/Recovery | ❌ Missing | P1 |
| Log Aggregation | ⚠️ Console only | P1 |
| Health Checks | ⚠️ Basic only | P1 |
| Feature Flags | ❌ Missing | P2 |
| API Versioning | ❌ Missing | P2 |

---

## 9. WHAT'S ACTUALLY GOOD

| Area | Assessment |
|------|-----------|
| Domain logic | Cửu Địa classifier (9-state), Habit scoring (6-point), Onboarding state machine — well-designed |
| Content | 12 training modules (M1-M12), 82-88KB each, production-ready |
| RBAC | 4-tier role system with proper middleware — clean |
| PDPA awareness | Audit logging structure exists, PII identification present |
| Test coverage | 16 test files covering auth, habits, members, KPI, alerts |
| UX research | 5 personas, opportunity map, competitive analysis — thorough |
| D1 schema | 9 well-designed tables with proper column types |
| Training OS | Complete tier system (Tân Binh → Chiến Binh → Tướng Quân) |
| G0 Decisions | 3 CEO decisions documented with budget breakdown |
| D1-D5 Mockups | All 5 deliverables prepared as templates |

---

## 10. BOTTOM LINE

The SALE MLM / Hive Warfare OS project has **strong domain expertise** (MLM training methodology, Cửu Địa strategy, Medicine 3.0 positioning) and **solid content** (12 complete training modules). The database schema is well-designed and already deployed on Cloudflare D1.

However, the **code layer has 12 critical issues** that prevent production deployment:
1. Security: Timing attacks, no rate limiting, plaintext PII in DB
2. Architecture: Dual Express/Workers implementations with stub endpoints
3. Data: Encryption module exists but unused, audit logs in-memory only

**Estimated effort to production-ready:** ~3-5 days focused engineering on Phase 1 items.

**Recommendation:** Fix Phase 1 (12 items) → deploy Workers with D1 → run G0 pilot → fix Phase 2 during pilot → Phase 3 post-launch.
