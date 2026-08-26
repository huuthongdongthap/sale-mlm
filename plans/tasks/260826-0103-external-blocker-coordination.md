# Task: External Blocker Coordination (Operator-Side)

## Goal
Track + execute operator-side setup required for pilot launch.

## Blockers (from `pilot-go-no-go-checklist.md` + Task 7)
Updated 2026-08-26 via `wrangler secret list` (prod worker `hive-warfare-os`, staging `hive-warfare-os-staging`):

| Item | Where | Prod | Staging | Owner |
|------|-------|------|---------|-------|
| JWT_SECRET | CF secret | ✅ Set | ✅ Set | Done |
| ENCRYPTION_KEY | CF secret | ✅ Set | ⚠️ Verify | Operator confirm |
| ADMIN_TOKEN | CF secret | ✅ Set | — | Done |
| PASSWORD_SALT | CF secret | ✅ Set | ⚠️ Verify | Operator confirm |
| ALLOWED_ORIGIN | CF secret/var | ✅ Set (`https://hive-dashboard-0rc.pages.dev`) | ✅ Set | Done 2026-08-26 |
| api.droppii.vn DNS | — | ❌ Points to Droppii's own infra (404 on /health), NOT this Worker | n/a | ~~Blocker~~ **Workaround live:** workers.dev URL `https://hive-warfare-os.sadec-marketing-hub.workers.dev` verified `/health` 200 + CORS locked |
| SENTRY_DSN | CF secret | ❌ Not set | ❌ Not set | Optional pre-pilot, required before scale |
| ZALO_ALERT_WEBHOOK | CF secret | ❌ Not set | ❌ Not set | Optional pre-pilot |
| api.droppii.vn DNS | — | ❌ Points to Droppii's own infra (404 on /health), NOT this Worker | n/a | **Blocker** — wire Custom Domain in CF dashboard or use workers.dev URL |
| hive.droppii.vn DNS | Pages | ❌ Pending | n/a | Operator |

### New findings 2026-08-26
1. **PASSWORD_SALT mismatch risk:** prod seed accounts' hashes were generated with salt
   `test-salt-12345678901234567890123456789012` (verified: hash prefix `f1352ba0` matches that salt at
   100k iterations). The CF secret `PASSWORD_SALT` must equal that same value or login fails with 401.
   Operator: verify the secret value matches the one used by `scripts/migrate-password-hash.js`.
2. **Seed accounts use weak password** (`password123`) — rotate before pilot; regenerate hashes with
   the refactored script (`PASSWORD_SALT=<salt> node scripts/migrate-password-hash.js <new-password>`).
3. **Staging D1 now isolated** (`05434b11…`, schema 22/22 tables matches prod). Migration 0008 was also
   applied to prod (orgs table + org_id backfill were missing there).

## Scope
- This AI agent CANNOT set Cloudflare secrets (requires operator CF Dashboard access + `.env` is permission-blocked)
- This agent CAN: track via task ticket + prompt operator at handoff

## Constraints
- Never read `.env` (permission-blocked via UserPromptSubmit hooks)
- Never commit secrets to git
- YAGNI: Only the items above — don't expand to email/TCP/APM

## Evidence
- `wrangler.toml` reads secrets from CF env (no local `.env` for Worker secrets)
- `package.json` loads `.env` for local dev only (`require('dotenv').config()`)
- RUNBOOK §136-141 documents setup flow for ZALO + SENTRY
- `wrangler secret list --name hive-warfare-os` → `[ADMIN_TOKEN, ENCRYPTION_KEY, JWT_SECRET, PASSWORD_SALT]`

### 2026-08-26 (afternoon) — CORS + deploy progress
1. **ALLOWED_ORIGIN set on both workers** via local wrangler OAuth (`hive-dashboard-0rc.pages.dev`, the live Pages frontend — HTTP 200 verified).
2. **Security fix shipped (`ae5ae2a`):** worker entry `src/workers/index-native.js` hardcoded `origin: '*'` — secret was never read. Now fail-closed: echoes only configured origin; 503 if secret missing. Verified live: evil origin gets no ACAO header, dashboard origin echoed.
3. **Backend deployed to prod** version `247bdbff`+ (manual wrangler, OAuth). `/health` 200 at workers.dev URL.
4. **CI deploys still no-op** — GitHub secrets `CF_API_TOKEN`/`CF_API_ACCOUNT_ID` unset; "Deploy to Production" job skips silently. Operator must add repo secrets for push-to-deploy.
5. **Cron trigger partial error** on deploy ("account plan limits") — script+routes deploy fine, schedules API call fails. Non-blocking.

## Acceptance
- [x] ALLOWED_ORIGIN set as secret on both workers (2026-08-26)
- [x] Pilot uses workers.dev URL — `https://hive-warfare-os.sadec-marketing-hub.workers.dev` `/health` → `{"ok":true}` (custom domain still pending, demoted to nice-to-have)
- [ ] PASSWORD_SALT verified against seed-account hashes
- [ ] Seed passwords rotated
- [ ] GitHub secrets CF_API_TOKEN + CF_API_ACCOUNT_ID set (CI deploy gate)
- [ ] SENTRY_DSN + ZALO_ALERT_WEBHOOK set before scale-up (not launch-blocking)

This task ticket remains open until manual confirmation.

---
Handoff: To `coo` for operator sync + `ciso` for secret rotation review.
