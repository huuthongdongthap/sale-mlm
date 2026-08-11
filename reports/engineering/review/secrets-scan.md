# Hardcoded Secrets Scan Report
**Date:** 2026-06-04 | **Scanner:** Automated grep + git ls-files
**Scope:** Full `/Users/mac/mekong-cli` codebase (excluding node_modules, .git, .venv, test fixtures)

---

## Executive Summary

**7 confirmed hardcoded secrets** in production code paths. **4 .env files** exist outside git (good — not tracked). **2 API keys** committed in source code (DASHSCOPE in two locations). No AWS keys, GitHub tokens, or private keys found in tracked files.

| Severity | Count | Location |
|----------|-------|----------|
| 🔴 CRITICAL | 2 | Real API keys committed in source |
| 🟠 HIGH | 2 | Weak/short fallback secrets in SALE MLM Workers |
| 🟡 MEDIUM | 3 | Demo credentials, placeholder secrets in non-critical paths |

---

## CRITICAL Findings

### SEC-01: DASHSCOPE_API_KEY committed in source
**File:** `scripts/dashscope-bridge-proxy.py:24`
```python
DASHSCOPE_API_KEY = "REDACTED_DASHSCOPE_API_KEY"
```
Real Qwen/DashScope API key. Valid format `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. This script is the proxy bridge — likely used in production to route calls to Alibaba's DashScope.

**Action:** Rotate key immediately. Move to `process.env.DASHSCOPE_API_KEY` with a clear error if missing.

---

### SEC-02: DASHSCOPE fallback key in safety-guard.js
**File:** `packages/openclaw-engine/src/safety/safety-guard.js:156`
```javascript
Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY || 'sk-sp-afce4429a10e41bb901d6012d7f525c8'}`,
```
Another DashScope API key as fallback in the safety classification API call. If env var is missing, this key is used — and it's committed to source. Even if the key in SEC-01 is rotated, this one still works.

**Action:** Rotate. Remove fallback — fail loudly if env var missing. This is a safety-critical module; silent fallback to a hardcoded key is wrong.

---

## HIGH Findings

### SEC-03: JWT + Encryption fallback secrets in SALE MLM Workers (production path)
**Files:**
- `SALE MLM/src/auth/jwt.js:10` — `process.env.JWT_SECRET || 'dev-only-change-in-production-32bytes!!'`
- `SALE MLM/src/utils/encryption.js:11` — `process.env.ENCRYPTION_KEY || 'dev-only-change-in-production-32bytes!!'`
- `SALE MLM/src/workers/index.js:85` — `env.JWT_SECRET || 'dev-secret'`
- `SALE MLM/src/workers/index.js:80` — `env.PASSWORD_SALT || 'dev-salt'`

These fallback values are already documented in the architecture review. If `wrangler secret put` was not executed (which requires manual CLI interaction), the Workers deployment runs with these public values. Anyone can forge JWT tokens or decrypt PII.

**Action:** Verify `wrangler secret put JWT_SECRET` was run. If not — secrets are public. Rotate all four.

---

### SEC-04: Demo credentials baked into process
**Files:**
- `SALE MLM/src/api/auth.js:15-48` — `DEMO_USERS` array with `admin123`, `core123`, `psn123`, `member123`
- `SALE MLM/src/models/member.js:145-182` — `Member.createSeededMembers()` duplicates same accounts

These are loaded at module import time. Even if the Workers layer doesn't use them, the Express server does.

**Action:** Remove from source. Use a seed script with random passwords + forced reset.

---

## MEDIUM Findings

### SEC-05: Hardcoded bot token in test script
**File:** `tests/test_telegram_bot.py:41`
```python
bot = MekongBot(token="test-token")
```
Low risk — test file with placeholder token. But if this test file runs against real Telegram, it would fail. Not a real secret.

---

### SEC-06: PGP public key in auto_updater
**File:** `src/cli/auto_updater.py:162`
```
-----BEGIN PGP PUBLIC KEY BLOCK-----
```
This is a **public** PGP key used for signature verification of updates. Not a secret, but worth noting — if this key is compromised, an attacker could sign malicious updates.

---

### SEC-07: Hardcoded "local" API keys
**Files:**
- `src/daemon/agent_loop.py:228` — `api_key = "local"`
- `src/core/binh_phap_dispatcher.py:239` — `api_key="local"`
- `src/core/binh_phap_escalation.py:84` — `api_key="local"`
- `src/raas/checkout_router.py:117,129,151` — `api_key="pending_webhook_verification"` / `"retrieve_from_dashboard"`

These are placeholder/development values. The `checkout_router.py` ones are particularly concerning — they suggest production checkout routes have placeholder API keys that may have been left in code.

---

## Clean Items (not flagged)

| Item | Status |
|------|--------|
| `.env` files (4 found) | All are **local-only**, NOT tracked in git ✅ |
| `ide-core/engine-farm/config.env` | Model names + Ollama config only, no API keys ✅ |
| `FnB-Container-Caffe/.env` | VNPay sandbox credentials (TEST mode) — separate project ✅ |
| `tests/` directory | All "secrets" are test fixtures (`sk_test_abc`, `test-token`, etc.) ✅ |
| `.env.example` / `.env.template` | All are templates with placeholder values ✅ |
| PGP public key | Public key, not a secret ✅ |
| `config.json` files | No sensitive values found ✅ |

---

## Git History Clean Check

No `.env`, `.pem`, or `.key` files were ever committed to the repo. One past commit cleaned up `.dev.vars` with secrets (commit `447b71221d`). One commit removed `.claude/skills/.venv` (commit `688b26e56d`). Git history is clean of secret files.

---

## Recommended Actions

| Priority | Action | Files |
|----------|--------|-------|
| **P0** | Rotate DASHSCOPE_API_KEY in `dashscope-bridge-proxy.py` | `scripts/dashscope-bridge-proxy.py:24` |
| **P0** | Remove fallback key from `safety-guard.js:156`, fail if env missing | `packages/openclaw-engine/src/safety/safety-guard.js:156` |
| **P1** | Verify `wrangler secret put` was run for SALE MLM Workers | `SALE MLM/wrangler.toml` |
| **P1** | Remove `DEMO_USERS` from `auth.js` and `member.js` | `SALE MLM/src/api/auth.js`, `src/models/member.js` |
| **P2** | Audit `checkout_router.py` placeholder API keys | `src/raas/checkout_router.py` |
| **P3** | Replace hardcoded `"local"` keys with env vars | `src/daemon/agent_loop.py`, `src/core/binh_phap_*.py` |
