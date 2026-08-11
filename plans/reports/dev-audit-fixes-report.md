# Dev Audit Fixes Report
**Date:** 2026-07-09
**Agent:** background fix-worker + inline completion

## Fixes Applied

| # | File | Line | Issue | Fix | Verified |
|---|------|------|-------|-----|----------|
| 1 | `src/auth/jwt.js` | 8 | Hardcoded JWT secret fallback | Replace `|| '<fallback>'` with `envor throw` — fails closed if `JWT_SECRET` unset | ✅ `node --check` |
| 2 | `src/utils/encryption.js` | 9 | Hardcoded encryption key fallback | Same `envor throw` pattern for `ENCRYPTION_KEY` | ✅ `node --check` |
| 3 | `src/server.js` | 20 | CORS wide open | `app.use(cors())` → `app.use(cors({ origin: env.ALLOWED_ORIGIN }))` with env throw | ✅ `node --check` |
| 4 | `src/dashboard/router.js` | 403,417,431 | `error.message` → `innerHTML` XSS | Added `escapeHtml()` helper; all 3 sites now pass through escape | ✅ `node --check` |
| 5a | `src/dashboard/leads-view.js` | 267 | `JSON.parse(quiz_answers)` unsanitized + unschemed | Wrapped in try/catch with type guard; output HTML-escaped before interpolation | ✅ `node --check` |
| 5b | `src/dashboard/leads-view.js` | 370 | `error.message` → `innerHTML` XSS | Changed to `textContent` assignment | ✅ `node --check` |

## False Positive Cleared

| File | Original Finding | Result |
|------|-----------------|--------|
| `src/integrations/zalo-webhook.js:146` | BLOCKER: missing opening quote | `node --check` PASS — file valid UTF-8 JS |

## Unresolved

- Systemic `innerHTML = \`...\`` pattern in 10+ dashboard components still requires field-by-field audit (MEDIUM)
- JWT in `localStorage` migration to HttpOnly cookie requires auth flow rework — deferred pending architecture decision
- `/api/orders.js` referenced but missing — either create stub or remove references
