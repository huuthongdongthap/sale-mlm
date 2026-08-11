# Dev Audit Summary

**Date:** 2026-07-09
**Scope:** `/Users/mac/mekong-cli/SALE MLM`
**Auditor:** Mekong RaaS `dev:audit` pipeline

---

## Scan Results

| Scanner | Status | Findings |
|---------|--------|---------|
| `worker-scan --lint` | ✅ Complete | 1 BLOCKER, 4 MINOR |
| `worker-scan --types` | ⚠️ N/A | No TS files; plain JS project — no type checker applicable |
| `worker-scan --security` | ✅ Complete | 9 findings (4 CRITICAL/HIGH, 2 MEDIUM, 3 systemic) |

---

## Lint — Blocker Issues

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `src/integrations/zalo-webhook.js` | 146 | Missing opening quote in `• [số]` string literal — syntax crash at load |

## Lint — Minor Issues

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `scripts/launch-checklist.js` | 11 | `path` imported but unused |
| 2 | `test/api-jest.test.js` | 7 | `jwt` imported but unused |
| 3 | `test/ops-jest.test.js` | 5 | `request` imported but unused |
| 4 | `test/ops-jest.test.js` | 6 | `jwt` imported but unused |

**Cleared:** `node --check src/server.js` PASS, all hive-academy relative imports resolve.

---

## Security — Critical / High

| Severity | File | Issue |
|----------|------|-------|
| CRITICAL | `src/auth/jwt.js:8` | JWT secret falls back to hardcoded default — allows token forgery |
| CRITICAL | `src/utils/encryption.js:9` | AES-256 key falls back to hardcoded default — PII decryptable |
| HIGH | `src/dashboard/*.js` ×4 | JWT in `localStorage` — vulnerable to XSS theft |
| HIGH | `src/dashboard/router.js:403,417,431` | `error.message` → `innerHTML` — XSS vector |
| HIGH | `src/dashboard/leads-view.js:370` | Same `error.message` → `innerHTML` pattern |
| HIGH | `src/server.js:20` | `cors()` with no origin restriction — CORS wide open |
| HIGH | `src/api/*.js` | No CSRF tokens on POST/PATCH/DELETE routes |

## Security — Medium

| Severity | File | Issue |
|----------|------|-------|
| MEDIUM | `src/dashboard/leads-view.js:267` | `JSON.parse(quiz_answers)` without schema validation — prototype pollution risk |
| MEDIUM | 10+ dashboard components | Systemic `innerHTML = \`...\`` with interpolated user data — systemic XSS exposure |

## Security — Cleared

- SQL injection: 0 findings (project uses JSON file storage, not SQL)

---

## Top 3 Recommended Fixes

1. **Enforce env var presence** — remove hardcoded fallbacks in `jwt.js` and `encryption.js`; fail startup if secrets missing
2. **Whitelist CORS origins** — replace `cors()` with explicit allowlist; add CSRF tokens to all state-changing routes
3. **Move JWT to HttpOnly cookies** — eliminate localStorage token storage; add `Secure` + `SameSite` flags

---

## Unresolved

- No ESLint config present — deeper patterns (shadowed vars, unreferenced params) not scanned
- Type check: no TS/JSDoc tooling found; type issues not systematically detected
