# Security Audit Report

**Project:** SALE MLM (Hive Warfare OS)  
**Scan scope:** src/**/*.js, public/**/*.js, public/**/*.html  
**Excluded:** node_modules/, src/dashboard/node_modules/  
**Date:** 2026-07-09  
**Scan method:** Grep + manual review across 5 categories

---

## 1. EXPOSED SECRETS (3 findings)

### [CRITICAL] Hardcoded JWT fallback secret
- **File:** `src/auth/jwt.js:8`
- **Pattern:** `const JWT_SECRET = process.env.JWT_SECRET || 'hive-warfare-default-secret-change-in-prod';`
- **Explanation:** Fallback JWT secret is hardcoded. If `JWT_SECRET` env var is unset at runtime, any attacker who discovers this string can forge valid JWTs for any user (including Admin). Production must enforce env var presence, not silently fall back.

### [CRITICAL] Hardcoded encryption key fallback
- **File:** `src/utils/encryption.js:9`
- **Pattern:** `const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-256-bit-key-for-dev-only-change-in-prod!!';`
- **Explanation:** AES-256 encryption key falls back to a hardcoded default. PII fields (phone, email) encrypted with this key would be decryptable by anyone who reads the source. Comment says "dev-only" but code allows production use without enforcement.

### [HIGH] JWT tokens stored in localStorage without HttpOnly
- **File:** `src/dashboard/kpi-panel.js:91`, `src/dashboard/orders-view.js:315`, `src/dashboard/leads-view.js:377`, `src/dashboard/members-table.js:1069`
- **Pattern:** `localStorage.getItem('auth_token')`
- **Explanation:** JWT bearer tokens stored in localStorage are vulnerable to XSS theft. Any XSS bug (see section 2) gives an attacker the active session token. `HttpOnly` cookies with `Secure` + `SameSite` flags are the correct mechanism.

---

## 2. XSS VULNERABILITIES (4 findings)

### [HIGH] innerHTML with error.message — unescaped server errors injected into DOM
- **File:** `src/dashboard/router.js:403`, `:417`, `:431`
- **Pattern:** `this.contentContainer.innerHTML = '<div...><p>' + error.message + '</p></div>';`
- **Explanation:** `error.message` from caught exceptions is interpolated directly into innerHTML. If a server-side component throws an error containing user-controlled data (e.g., a lead name from `req.body`), that data becomes executable HTML. Use `textContent` or a templating escape function.

### [HIGH] innerHTML with error.message in leads-view
- **File:** `src/dashboard/leads-view.js:370`
- **Pattern:** `eventsContainer.innerHTML = \`<p style="color: var(--status-red);">Lỗi: ${error.message}</p>\`;`
- **Explanation:** Same pattern as router — unescaped error messages rendered as HTML.

### [MEDIUM] JSON.parse on quiz_answers rendered with innerHTML context
- **File:** `src/dashboard/leads-view.js:267`
- **Pattern:** `${JSON.stringify(JSON.parse(lead.quiz_answers), null, 2)}` inside template literal assigned to innerHTML
- **Explanation:** `quiz_answers` comes from `req.body` (user input at lead creation time: `src/api/leads.js:126`). If a malicious user stored HTML/Script in quiz answers during creation, it would execute when another admin views the lead detail. The `JSON.stringify` output could contain crafted payloads if origin data had `\\x3cscript\\x3e` style encodings.

### [MEDIUM] Widespread template-literal-to-innerHTML pattern
- **Files:** `src/dashboard/kpi-panel.js:114,236`, `src/dashboard/funnel-view.js:14,41,130`, `src/dashboard/members-table.js:24,420`, `src/dashboard/alerts-inbox.js:116,519`, `src/dashboard/psn-health.js:43,126,171,271`, `src/dashboard/leads-view.js:19,54,151,222`, `src/dashboard/orders-view.js:20,56,153,229`, `src/dashboard/router.js:243,334`
- **Pattern:** `container.innerHTML = \`...\`` with data interpolated
- **Explanation:** Every dashboard component uses template literals assigned to innerHTML. Any field derived from `req.body` or `req.query` that is displayed without escaping is an XSS vector. This is a systemic pattern — an inventory of which interpolated fields originate from user input should be created for a full audit.

---

## 3. CSRF / CORS ISSUES (2 findings)

### [HIGH] CORS wide open — accepts any origin
- **File:** `src/server.js:20`
- **Pattern:** `app.use(cors());`
- **Explanation:** The `cors()` middleware is called with no options, which defaults to `Access-Control-Allow-Origin: *`. This allows any website to make cross-origin API calls to this server using the victim's cookies/localStorage tokens. For a state-changing API (POST/PATCH/DELETE), this effectively nullifies same-origin protection.

### [HIGH] No CSRF tokens on state-changing endpoints
- **Files:** `src/api/members.js`, `src/api/leads.js`, `src/api/habits.js`
- **Pattern:** POST/PATCH/DELETE routes accept JSON body with no CSRF token validation
- **Explanation:** With CORS wide open + no CSRF protection, a malicious page can silently submit forms to this server. The `requireRole` middleware authenticates the user via JWT, so if a logged-in admin visits attacker.com, the attacker can perform actions on their behalf.

---

## 4. SQL INJECTION (0 findings)

No SQL queries found in application code. The project uses `JSON.parse(process.env.MEMBERS_DB)` for data storage, not a SQL database. No injection vectors present in the scanned scope.

---

## 5. UNSAFE DESERIALIZATION (2 findings)

### [HIGH] JSON.parse on quiz_answers from user input without validation
- **File:** `src/dashboard/leads-view.js:267`
- **Pattern:** `JSON.parse(lead.quiz_answers)`
- **Explanation:** `quiz_answers` is set from `req.body` at `src/api/leads.js:139` with no schema validation. A crafted payload could exploit prototype pollution (e.g., `{"__proto__": {"isAdmin": true}}`) or cause a denial-of-service via deeply nested JSON. Input should be validated against a schema before parsing.

### [MEDIUM] JWT claims parsed without validation
- **File:** `src/auth/jwt.js:90`
- **Pattern:** `const claims = JSON.parse(base64urlDecode(encodedClaims));`
- **Explanation:** After signature verification, the claims object is parsed and returned as-is. A crafted JWT with a `__proto__` key in claims would pollute `Object.prototype` if the consuming code uses spread/map on the returned object. Add a schema check or `Object.create(null)` wrapper.

---

## 6. ADDITIONAL FINDINGS (2 findings)

### [MEDIUM] No rate limiting on authentication endpoint
- **File:** `src/api/auth.js:14`
- **Pattern:** `router.post('/login', async (req, res) => {` — no rate limiter
- **Explanation:** Brute-force password attacks have no throttling. The login uses `pbkdf2Sync` with 600,000 iterations (expensive on purpose), but without rate limiting an attacker can still attempt login at moderate rate to lock out legitimate users or wait for timing leaks.

### [LOW] Trust proxy not configured
- **File:** `src/server.js`
- **Pattern:** No `app.set('trust proxy', ...)` call
- **Explanation:** If deployed behind a reverse proxy (Cloudflare, nginx), `req.ip` will reflect the proxy IP, not the client IP. Not a direct vulnerability but affects rate limiting and logging accuracy if proxy trust is not set.

---

## SUMMARY

| Severity | Category | Count |
|----------|----------|-------|
| CRITICAL | Exposed Secrets | 2 |
| HIGH | Exposed Secrets | 1 |
| HIGH | XSS | 2 |
| HIGH | CSRF/CORS | 2 |
| HIGH | Unsafe Deserialization | 1 |
| MEDIUM | XSS | 1 |
| MEDIUM | XSS (systemic) | 1 |
| MEDIUM | Unsafe Deserialization | 1 |
| MEDIUM | Auth | 1 |
| LOW | Infrastructure | 1 |

**Total: 13 findings** (4 systemic, 9 pinpoint)

## TOP PRIORITY FIXES (recommended order)

1. Enforce `JWT_SECRET` and `ENCRYPTION_KEY` env vars — fail startup if missing, no fallback
2. Replace `app.use(cors())` with origin-whitelist: `cors({ origin: [process.env.ALLOWED_ORIGIN] })`
3. Add CSRF tokens to all state-changing routes
4. Migrate auth tokens from localStorage to HttpOnly Secure SameSite cookies
5. Sanitize `error.message` before innerHTML rendering — use `textContent`
6. Add rate limiting middleware (`express-rate-limit`) on /auth/login
7. Validate `quiz_answers` JSON against a schema before parsing
8. Audit all innerHTML template literals for user-data interpolation — add escaping utility
