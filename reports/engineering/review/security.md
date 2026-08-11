# Security Audit Report — SALE MLM / Hive Warfare Academy

**Project:** Hive Warfare Academy (Droppii Training OS)
**Date:** 2025-06-03
**Auditor:** Automated code review
**Scope:** Authentication, authorization, encryption, injection, session management, compliance

---

## CRITICAL Findings

### [C-1] Demo Credentials Hardcoded in Production Source Code
**Files:** `src/api/auth.js` lines 15–48, `src/models/member.js` lines 145–182
**Severity:** CRITICAL

Four complete user accounts with plaintext passwords are defined directly in application source code. The `hashPassword()` calls at module load time bake these hashes into the running process. The passwords (`admin123`, `core123`, `psn123`, `member123`) are trivially guessable.

The same accounts are duplicated identically in `Member.createSeededMembers()`. If either entry point is used in production, every account is compromised at rest.

**Remediation:**
- Remove all `DEMO_USERS` entries from `src/api/auth.js` immediately.
- Replace `Member.createSeededMembers()` with a production seed script that generates random passwords and requires forced reset on first login.
- Implement a proper user provisioning flow with invitation tokens.
- Audit git history — these credentials must be treated as compromised.

---

### [C-2] Custom PBKDF2 Implementation Is Not PBKDF2 — Trivially Crackable Password Hashes
**File:** `src/workers/index.js` lines 149–165
**Severity:** CRITICAL

The function named `pbkdf2()` at line 150 is a custom rolling-hash loop that calls `simpleHash()` 10,000 times. `simpleHash()` is a 32-bit djb2-variant integer hash (`h = ((h << 5) - h + charCode) | 0`) producing a 128-character hex string. This is not PBKDF2-HMAC-SHA-512 and provides no meaningful work factor. An attacker with the hashed values can compute the same function in microseconds, making brute-force against `dev-salt` effectively free.

This is the active password verification path in the Cloudflare Workers deployment (`src/workers/index.js` line 80).

**Remediation:**
- Replace with `crypto.subtle.importKey` + `crypto.subtle.deriveBits(PBKDF2)` in the Workers runtime, or bcrypt via a WASM module compatible with Workers.
- Minimum 600,000 iterations per OWASP guidance (2023+) for PBKDF2-SHA-512.
- If stuck on the Workers JS runtime limitation, use Argon2id via a compute-binding or pre-hashed passwords from a trusted auth service.

---

### [C-3] No Authentication on Multiple API Endpoints — Full Auth Bypass
**File:** `src/workers/index.js` lines 188–216
**Severity:** CRITICAL

Four endpoint handlers in the Workers entry point execute without reading or validating any JWT token:

| Line | Endpoint | Risk |
|------|----------|------|
| 188 | `GET /api/members` | Returns all member records (names, emails, roles, tiers) |
| 192 | `POST /api/habits/checkin` | Inserts arbitrary habit records for any `member_id` |
| 196 | `GET /api/kpi/:id` | Returns KPI rollups for any member |
| 214 | `POST /api/analytics/psn-health` | Business logic bypass (currently stub but will become sensitive) |

No `Authorization` header is read, no token is verified. Any unauthenticated HTTP client can enumerate all members and write habit data.

Additionally, `src/api/habits.js` lines 79–85 (`GET /api/habits`) has no authentication at all in the Express server.

**Remediation:**
- Add a shared `authenticate(env)` helper in `src/workers/index.js` that extracts and verifies the JWT before every protected handler.
- Apply it to `/api/members`, `/api/habits/checkin`, `/api/kpi/:id`, `/api/training/progress`, and `/api/analytics/psn-health`.
- Remove unauthenticated `GET /api/habits` or restrict it to the member's own records.

---

### [C-4] JWT Secrets Are Static Development Fallbacks
**Files:** `src/auth/jwt.js` line 10, `src/workers/index.js` line 85, `src/api/auth.js` line 11 (commented)
**Severity:** CRITICAL

Both JWT implementations have hardcoded fallback secrets:

- `src/auth/jwt.js` line 10: `const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production-32bytes!!';`
- `src/workers/index.js` line 85: `const secret = env.JWT_SECRET || 'dev-secret';`

If `JWT_SECRET` is not set in the production environment, any attacker who reads the deployed script (Workers scripts are publicly inspectable via `wrangler deployments list`) can forge perfectly valid JWTs with arbitrary `role: "Admin"` claims. The Workers fallback (`'dev-secret'`) is only 9 characters, making it even more trivially guessable.

`wrangler.toml` does not declare `JWT_SECRET` in `[vars]` or any `[env.*]` block, confirming it is not currently being set.

**Remediation:**
- Add `JWT_SECRET` to `wrangler.toml` via Cloudflare Workers Secrets (not `[vars]`, which are visible in the dashboard): `wrangler secret put JWT_SECRET`.
- Remove the fallback value entirely — throw a startup error if the secret is absent, rather than silently defaulting.
- Rotate all existing tokens after fixing.

---

### [C-5] Encryption Key Is a Static Development Fallback
**File:** `src/utils/encryption.js` lines 11–14
**Severity:** CRITICAL

```js
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-only-change-in-production-32bytes!!';
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
```

The fallback key is publicly known. The padding logic (`padEnd(32, '0')`) means any input shorter than 32 bytes deterministically derives the same key, and the `substring(0, 32)` truncation means keys longer than 32 bytes silently lose entropy. All PII fields (email, phone) encrypted with this key are decryptable by anyone who has read access to the deployed source.

This is the active PII encryption path used in `src/models/member.js` lines 72, 91.

**Remediation:**
- Store `ENCRYPTION_KEY` in a secrets manager (Cloudflare Workers Secrets, AWS Secrets Manager, or HashiCorp Vault).
- Remove the fallback value and the padding/truncation logic — require exactly 32 raw bytes via `Buffer.from(process.env.ENCRYPTION_KEY, 'hex')` with a startup validation error on wrong length.
- Rotate all existing encrypted PII after fixing. Implement key versioning for non-destructive rotation.

---

## HIGH Findings

### [H-1] CORS Misconfigured to Allow All Origins
**File:** `src/workers/index.js` lines 7–11
**Severity:** HIGH

```js
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

`Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Headers: Authorization` means any website on the internet can make authenticated cross-origin requests to this API from a user's browser, reading all responses including tokens and PII. This is a CSRF-style data exfiltration vector for any user who visits a malicious page while logged in.

**Remediation:**
- Restrict `Access-Control-Allow-Origin` to the actual frontend origin(s): `https://hive-warfare.droppii.vn` and the staging equivalent.
- Consider removing `Access-Control-Allow-Credentials: true` entirely if cross-origin is not needed; otherwise set it with a specific origin (wildcard is incompatible with credentials).
- Move CORS configuration behind an `env` check so staging and production have different allowed origins.

---

### [H-2] No Rate Limiting on Login Endpoint
**File:** `src/workers/index.js` lines 184–186, `src/api/auth.js` lines 61–79
**Severity:** HIGH

The login route at `/auth/login` (Express) and `/auth/login` (Workers) accepts unlimited requests per second with no throttling, IP-based blocking, or account lockout. With the weak custom hash from [C-2], an attacker can attempt millions of password guesses per second against the Workers endpoint.

**Remediation:**
- Implement rate limiting using a Cloudflare KV store (already bound as `SESSIONS` in `wrangler.toml`) to track failed attempts per IP and per account.
- Lock accounts for 15 minutes after 5 failed attempts.
- Add progressive delays after each failure.
- Consider Cloudflare WAF managed rules for the Workers route.

---

### [H-3] Plaintext Password Comparison Enables Timing Attack
**File:** `src/api/auth.js` lines 70–73, `src/workers/index.js` line 80–83
**Severity:** HIGH

```js
const passwordHash = hashPassword(password);
if (passwordHash !== user.passwordHash) { ... }
```

`hashPassword` is called on every login attempt, including for users that don't exist (the hash is computed after fetching the user, but the timing difference between "user found + hash mismatch" and "user not found" leaks whether an email is registered). For valid users, the non-constant-time `!==` comparison of hex strings leaks the position of the first differing character.

**Remediation:**
- Use `crypto.subtle.constantTimeCompare` (Workers) or `crypto.timingSafeEqual` (Node) for hash comparison.
- Always compute the hash even if the user doesn't exist, or add a dummy hash comparison for non-existent users.
- In the Express path, consider moving to `bcrypt.compare()` which handles constant-time comparison internally.

---

### [H-4] AES-256-CBC Without Authentication — Integrity Not Verified
**File:** `src/utils/encryption.js` lines 21–58
**Severity:** HIGH

The `encrypt()` and `decrypt()` functions use AES-256-CBC with no HMAC or AEAD mode. AES-CBC is malleable: an attacker who can modify ciphertext in transit (or at rest) can flip bits in the decrypted plaintext without detection. For PII fields (email, phone), a modified ciphertext could cause the application to write incorrect data to the database or cause the decryption function to throw and trigger different application logic.

**Remediation:**
- Switch to AES-256-GCM (available in both Node.js `crypto` and Cloudflare Workers `crypto.subtle`), which provides authenticated encryption.
- Alternatively, append an HMAC-SHA-256 of the ciphertext and verify it before decryption (encrypt-then-MAC pattern).
- Include the IV in the authenticated data or prepend it before the MAC.

---

### [H-5] Authorization Bypass — `includePII` Flag Overrides Role Checks
**File:** `src/api/members.js` lines 166–174
**Severity:** HIGH

```js
const shouldIncludePII = includePII === 'true' && (req.user.role === 'Admin' || req.user.role === 'Core Leader');
```

While the role check is technically present, the `includePII` parameter is controlled by the client. A lower-privileged user who can call this endpoint (any authenticated user can call `GET /api/members`) gets to decide whether their response includes decrypted PII. The server should determine what data to include based on the authenticated user's role alone, not a client-supplied flag.

**Remediation:**
- Remove the `includePII` query parameter entirely.
- Determine PII inclusion solely from `req.user.role` on the server side.
- Return `toSafeJSON()` by default for all non-Admin/CoreLeader roles regardless of client input.

---

### [H-6] JWT `alg` Header Not Validated — Potential Algorithm Confusion
**File:** `src/auth/jwt.js` lines 79–89, `src/workers/index.js` lines 49–61
**Severity:** HIGH

The JWT verification code computes an HMAC-SHA-256 signature and compares it directly, which is safe against algorithm confusion attacks (the `alg` in the header does not affect the verification path). However, neither implementation validates that the `alg` claim in the header is `HS256` before proceeding. If the JWT library or code is ever updated to use `jose`/`jsonwebtoken` library verification (which does honor the `alg` header), a `alg: none` or `alg: RS256` attack could be introduced.

**Remediation:**
- Explicitly parse and assert `header.alg === 'HS256'` before proceeding with verification.
- Reject tokens with `alg: none`, `alg: RS256`, or any unexpected algorithm.

---

## MEDIUM Findings

### [M-1] No Input Validation on D1 Query Parameters
**File:** `src/workers/index.js` lines 72–74, 99–101, 116–117
**Severity:** MEDIUM

While Cloudflare D1 prepared statements with `?` parameter binding prevent SQL injection, there is no validation of the parameter values before binding. For example, `handleKPI` at line 128 accepts any string as `member_id` and passes it directly to the query. There is no length limit, format check, or type validation on any parameter. This could lead to:

- Denial of service via extremely long `member_id` values (D1 has a 1MB query limit but no per-parameter limit).
- Logic errors if unexpected formats reach downstream code.

**Remediation:**
- Validate all inputs: `member_id` should match `/^[a-zA-Z0-9-]+$/`, `date` should match ISO date format, `items` should be validated as a JSON array before `JSON.stringify`.
- Add length limits (e.g., `member_id` max 64 chars, `items` max 10KB).

---

### [M-2] Error Messages Leak Internal Structure in Development Mode
**File:** `src/utils/monitoring.js` lines 99–103
**Severity:** MEDIUM

```js
error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
```

In any environment where `NODE_ENV` is not exactly `'production'`, full error messages (including stack traces) are returned to clients. The Workers runtime at `src/workers/index.js` line 104 also returns `err.message` directly without checking environment. This leaks internal file paths, database structure, and library versions.

**Remediation:**
- Use a whitelist of allowed `NODE_ENV` values: treat anything other than `'production'` as non-production.
- Never return raw error messages in API responses; map errors to user-safe codes.
- Log full errors server-side only.

---

### [M-3] Audit Logs Stored In-Memory — Lost on Restart
**File:** `src/utils/auditLog.js` line 8, `src/api/alerts.js` line 14
**Severity:** MEDIUM

Both PDPA audit logs (`auditLogs` array in `auditLog.js`) and alert history (`alertLog` array in `alerts.js`) are stored as in-memory arrays. They are lost on process restart, which means:

- PDPA audit trails are incomplete, violating Vietnam PDPA Article 35 (data retention requirements).
- Alert history does not persist across deployments or crashes.

**Remediation:**
- Write audit log entries to the D1 `audit_trail` table (already defined in the schema) on every PII access event.
- Persist alerts to the D1 `alerts_log` table.
- Ensure the D1 write happens before the response is returned (or use a non-blocking fire-and-forget pattern with a guaranteed delivery mechanism).

---

### [M-4] No Session Revocation or Token Blacklist
**File:** `src/auth/jwt.js`, `src/workers/index.js`
**Severity:** MEDIUM

JWT tokens are valid until their `exp` timestamp (24 hours). There is no mechanism to revoke a token before expiry. If a token is stolen or a user's role is changed, the old token remains valid for up to 24 hours. The KV namespace `SESSIONS` is bound in `wrangler.toml` but unused for session storage.

**Remediation:**
- Store session IDs in the KV `SESSIONS` namespace on login, and validate sessions on each request by checking KV.
- On logout or role change, delete the session from KV, effectively revoking the token.
- Reduce JWT `exp` to 1 hour and use refresh tokens stored server-side.

---

### [M-5] CSRF Token Not Implemented on State-Changing Endpoints
**File:** `src/server.js`, `src/workers/index.js`
**Severity:** MEDIUM

All POST/PATCH/DELETE endpoints accept requests without CSRF token validation. While the `Authorization: Bearer` header pattern provides some protection (browsers don't automatically attach custom headers in cross-origin requests), the wildcard CORS configuration [H-1] combined with `credentials: include` in the frontend (`hive-academy/lib/auth.ts` line 26 sets `Cookies.set` without `secure` or `sameSite`) creates a CSRF risk.

**Remediation:**
- Set `SameSite=Strict` on the `hive_token` cookie (line 26 of `hive-academy/lib/auth.ts`).
- Add `Secure` flag on cookies when served over HTTPS.
- Implement double-submit CSRF pattern or use the `Authorization` header exclusively (not cookies) for API calls.

---

### [M-6] Weak Password Policy in Demo Data
**File:** `src/api/auth.js` lines 15–48
**Severity:** MEDIUM

The demo passwords (`admin123`, `core123`, `psn123`, `member123`) are all short, common dictionary words with no special characters. If any of these accounts persist to production, they are susceptible to credential stuffing attacks.

**Remediation:**
- Enforce a minimum password length of 12 characters.
- Require at least one uppercase, lowercase, digit, and special character.
- Check passwords against the HaveIBeenPwned API or a local breached-password list.
- Force password reset on first login for all provisioned accounts.

---

### [M-7] Missing `sameSite` and `secure` Flags on Auth Cookies
**File:** `hive-academy/lib/auth.ts` line 26
**Severity:** MEDIUM

```ts
Cookies.set(TOKEN_KEY, token, { expires: 7 });
```

The `js-cookie` call sets no `sameSite` or `secure` options. Default is `sameSite: 'lax'`, which provides limited CSRF protection. The `secure` flag defaults to `false`, meaning the token cookie could be sent over HTTP in development.

**Remediation:**
```ts
Cookies.set(TOKEN_KEY, token, {
  expires: 7,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true  // prevent XSS access
});
```

---

### [M-8] No IP Address Logging in Workers Auth Path
**File:** `src/workers/index.js` lines 66–94
**Severity:** MEDIUM

The Workers login handler does not capture `request.headers.get('CF-Connecting-IP')` or any client IP. Without IP logging:
- Brute-force detection is impossible.
- PDPA audit trails are incomplete (missing `ip_address` per Article 35).
- Geographic anomaly detection for account takeover is unavailable.

**Remediation:**
- Capture `request.headers.get('CF-Connecting-IP')` on every authenticated request.
- Include it in the JWT payload audit log and the `audit_trail` database table.
- Use it for anomaly detection (login from new country, multiple IPs per session).

---

## LOW Findings

### [L-1] Sensitive Routes Not Hidden from Discovery
**File:** `src/workers/index.js` lines 180–216
**Severity:** LOW

The `/health` endpoint at line 180 returns `{ status: 'ok', timestamp: ... }` without any authentication. This is low-risk but confirms the service is running and can aid reconnaissance. Additionally, the stub `/api/analytics/psn-health` at line 214 returns data that suggests the presence of a PSN health scoring system.

**Remediation:**
- Consider returning 200 with no body for `/health` or require a service-internal token.
- Remove or authenticate stub endpoints that reveal business logic structure.

---

### [L-2] No Content Security Policy Headers
**File:** `src/workers/index.js` lines 13–18, `hive-academy/next.config.js`
**Severity:** LOW

Neither the Workers response helper nor the Next.js configuration sets `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, or `Strict-Transport-Security` headers. This leaves the application exposed to XSS, clickjacking, and downgrade attacks.

**Remediation:**
Add to Workers responses:
```js
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
}
```

---

### [L-3] Zalo Webhook Signature Verification Uses Raw String Comparison
**File:** `src/integrations/zalo-webhook.js` lines 27–33
**Severity:** LOW

```js
verifySignature(payload, signature) {
  const expected = crypto.createHmac('sha256', this.oaSecret).update(payload).digest('hex');
  return signature === expected;
}
```

`signature === expected` is a non-constant-time comparison, enabling timing attacks to reconstruct the expected HMAC byte-by-byte. While this is a webhook verification path (not user-facing auth), the principle applies.

**Remediation:**
- Use `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))` after padding both to the same length.

---

### [L-4] PDPA Audit Log Does Not Capture Request Body Contents
**File:** `src/utils/auditLog.js` lines 27–48
**Severity:** LOW

The `logPIIAccess` function logs which PII fields were accessed but not what values were changed. For PDPA Article 35 compliance (right to explanation / data provenance), the audit trail should record the before/after values or at minimum a hash of the changed data for non-repudiation.

**Remediation:**
- Add `before` and `after` hash fields to the audit log entry (hashed to avoid storing raw PII in the audit trail itself).
- Ensure `audit_trail` table writes are immutable (no UPDATE or DELETE on audit rows).

---

## Compliance Gaps (PDPA/GDPR)

| Requirement | Gap | Finding |
|-------------|-----|---------|
| Art. 9 (special category data) | Health data (`energyScore`, `habitScore`) not classified or protected separately | [M-4], [L-4] |
| Art. 15 (right of access) | No self-service data export endpoint | Not implemented |
| Art. 17 (right to erasure) | DELETE exists in `members.js` but does not cascade to habits, KPI, or audit records | Schema gap |
| Art. 35 (audit trail) | In-memory logs, no IP capture in Workers, no immutable storage | [M-3], [M-8] |
| Art. 32 (security of processing) | Static encryption keys, no key rotation, no integrity protection | [C-5], [H-4] |

---

## Summary

| Severity | Count | Findings |
|----------|-------|----------|
| CRITICAL | 5 | C-1 through C-5 |
| HIGH | 6 | H-1 through H-6 |
| MEDIUM | 8 | M-1 through M-8 |
| LOW | 4 | L-1 through L-4 |
| **Total** | **23** | |

**Immediate actions required before production:**
1. Remove hardcoded demo users [C-1]
2. Replace custom hash with real PBKDF2 [C-2]
3. Add authentication to all Workers API endpoints [C-3]
4. Set `JWT_SECRET` via Workers Secrets, remove fallback [C-4]
5. Set `ENCRYPTION_KEY` via secrets manager, remove fallback [C-5]
6. Restrict CORS to known origins [H-1]
