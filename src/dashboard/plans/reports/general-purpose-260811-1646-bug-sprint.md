# Bug Sprint Report — Dashboard Codebase Scan

**Date:** 2026-08-11  
**Scope:** `/Users/mac/mekong-cli/SALE MLM/src/dashboard`

---

## Critical Issues (Must Fix)

### 1. **Missing Mock API Files — Runtime Crashes**
| File | Issue | Impact |
|------|-------|--------|
| `alerts-inbox.js:7` | `import { mockAlertsAPI } from '../mocks/alerts-api.js'` — file does not exist | **App crash on alerts page** |
| `psn-health.js:6` | `import { mockPSNHealthData } from '../api/mock/psn-health.js'` — directory/file missing | **App crash on PSN page** |

**Evidence:** Both import paths resolve to non-existent files. No `/mocks/` or `/api/mock/` directories exist in source.

---

### 2. **XSS Vulnerability — Unsanitized `innerHTML`**
**48+ locations** use `innerHTML` with interpolated data. Only `router.js:9` uses `escapeHtml()` helper.

**High-risk files:**
- `members-table.js:824, 851, 930, 1025, 1052` — User data rendered directly
- `alerts-inbox.js:116, 519` — Alert content unsanitized
- `router.js:131, 209, 249, 274, 340, 406, 409, 420, 423, 434, 437` — Route content
- `kpi-panel.js:114, 236` — KPI data rendered

**Fix:** Centralize a `sanitizeHTML()` utility and apply to all dynamic `innerHTML` assignments.

---

### 3. **Hardcoded Production API URLs**
| File | Line | URL |
|------|------|-----|
| `kpi-panel.js` | 63 | `https://hive-warfare-os.sadec-marketing-hub.workers.dev/api/kpi/...` |
| `leads-view.js` | 9 | `https://hive-warfare-os.sadec-marketing-hub.workers.dev` |
| `orders-view.js` | 9 | `https://hive-warfare-os.sadec-marketing-hub.workers.dev` |

**Risk:** No environment config. Cannot run against local/dev/staging. Exposes prod endpoint in client bundle.

---

### 4. **Insecure Token Storage — localStorage Only**
**7 files** read JWT from `localStorage` without HttpOnly cookie fallback:
- `kpi-panel.js:91`
- `leads-view.js:377`
- `funnel-view.js:301`
- `orders-view.js:315`
- `members-table.js:469` (also writes role to localStorage)
- `components/members-table.js:1069`
- `components/kpi-modal.js:532`

**Risk:** XSS → token theft. No token refresh logic. No secure storage pattern.

---

### 5. **Missing Error Boundaries / Graceful Degradation**
- No React-style error boundaries (vanilla JS)
- Multiple `catch` blocks only `console.error` + render inline error HTML
- No retry logic for failed API calls
- No offline detection / queue

---

## High Severity

### 6. **Duplicate Code — Auth Token Getters**
Same `getAuthToken()` function duplicated in **6 files**. Violates DRY. Any change requires 6 edits.

### 7. **No Test Infrastructure**
`package.json:11` — `"test": "echo \"No tests specified\""`
- Zero unit tests
- Zero integration tests
- No CI test pipeline

### 8. **Inconsistent Error Handling**
- Some `throw new Error()` with template literals
- Some bare `throw error`
- Mixed Vietnamese/English error messages
- No error codes / structured error objects

### 9. **PSN Detail Navigation — TODO Not Implemented**
`psn-health.js:333` — `// TODO: Navigate to detail page` — clicking PSN card does nothing.

---

## Medium Severity

### 10. **CSS-in-JS Style Injection at Module Load**
Multiple components call `document.head.insertAdjacentHTML('beforeend', styles)` in module scope:
- `kpi-card.js:446, 451`
- `kpi-modal.js:874, 879`
- `psn-health.js` (inline styles)

**Issues:** Duplicate style injection on hot reload, no cleanup, CSP violations.

### 11. **Memory Leaks — Event Listeners Not Removed**
- `kpi-card.js:452` — `bindKeyboardEvents()` adds global listeners, never removed
- `members-table.js` — Pagination/filter listeners added but cleanup unclear
- No `disconnect()` / `destroy()` pattern

### 12. **Inconsistent Date/Number Formatting**
- `formatVND()` duplicated in `funnel-view.js:291`, `orders-view.js:305`
- Mixed `Intl.NumberFormat` and manual formatting
- No centralized i18n utility

### 13. **Router — No Cleanup on Route Change**
`router.js` renders new content but doesn't destroy previous view instances (modals, listeners, intervals).

---

## Low Severity / Tech Debt

### 14. **Magic Strings — Status/Role Values**
- `'RED' | 'YELLOW' | 'GREEN'` scattered
- `'Member' | 'CTV' | 'Leader' | 'Admin'` in multiple files
- No shared constants/enum

### 15. **Console Logging in Production Code**
`console.log` / `console.warn` / `console.error` throughout — should use structured logger with levels.

### 16. **Vite Config Minimal**
`vite.config.js` — no env config, no alias, no build optimization, no test config.

---

## Summary Table

| Category | Count | Priority |
|----------|-------|----------|
| Critical (crash/data loss) | 2 | 🔴 P0 |
| Security (XSS, token) | 3 | 🔴 P0 |
| Architecture (hardcoded URLs, no tests) | 4 | 🟠 P1 |
| Code Quality (duplication, inconsistency) | 7 | 🟡 P2 |
| Tech Debt | 3 | 🟢 P3 |

---

## Recommended Fix Order

1. **Create missing mock files** — unblock dev
2. **Add `sanitizeHTML()` utility + apply to all `innerHTML`** — fix XSS
3. **Extract API base URL to config / env** — enable multi-env
4. **Centralize auth token handling** — secure storage + refresh
5. **Add test infrastructure (Vitest)** — enable CI
6. **Extract shared constants / formatters** — DRY
7. **Add error boundary pattern** — graceful degradation
8. **Implement PSN detail navigation** — feature complete
9. **Add component lifecycle (destroy/cleanup)** — memory leaks
10. **Replace console with logger** — production readiness

---

## Unresolved Questions

1. Is there a backend repo with OpenAPI spec to generate typed API clients?
2. What's the auth flow? (JWT in localStorage suggests implicit flow — security review needed)
3. Should mock data move to MSW (Mock Service Worker) for better dev experience?
4. Any plan to migrate to React/Preact for better component lifecycle management?