# Production Deploy Checklist

**Status:** Ready for Cloudflare production deployment once secrets are configured

---

## ✅ Completed Infrastructure

### Cloudflare Configuration
- [x] `wrangler.toml` configured with:
  - Worker name: `hive-warfare-os`
  - D1 database binding: `DB` (hive-warfare-db)
  - KV namespace: `CACHE` (session/query caching)
  - R2 bucket: `STORAGE` (file uploads)
  - Staging + Production environments
  - Cron trigger: `0 0 * * *` (nightly)
  - Build command: `npm ci --production`

### GitHub Actions CI/CD
- [x] `.github/workflows/ci.yml` with:
  - Preview deployment on PR (Workers + Pages)
  - Production deployment on push to main
  - Secret validation step (checks CF_API_TOKEN, CF_ACCOUNT_ID)
  - Post-deploy health check against `/health`
  - Deployment success notification

### Deploy Script
- [x] `deploy.sh` supports:
  - `./deploy.sh` — production (Workers + Pages + health check)
  - `./deploy.sh staging` — staging environment
  - `./deploy.sh preview` — Pages preview only
  - `./deploy.sh secrets` — print secrets setup guide
  - `./deploy.sh health` — run health checks

### Health Endpoints (Express dev server, `src/server.js`)
- [x] `GET /health` — delegates to `monitoring.getHealthStatus()` (`src/utils/monitoring.js:130`)
- [x] `GET /ready` — readiness probe (200 only when `global.db` is bound and all subsystems healthy; 503 otherwise)
- [x] `GET /metrics` — Prometheus text/plain probe (uptime, error count, per-subsystem status)

### Security Compliance Pack (Task #25)
- [x] PDPA audit trail persistence (`src/utils/auditLog.js` → `global.db.logAudit` + `audit_trail` table)
- [x] Compliance report endpoint: `GET /api/compliance/report` (Admin only, 30-day window)
- [x] Rate limiting middleware (`src/middleware/rateLimit.js`):
  - Auth tier: 10 req/15min (production only)
  - API tier: 300 req/15min (production only)
  - Webhook tier: 60 req/60s (production only)
  - `skip: () => !isProduction` — no throttling in dev/test
  - Keyed by `CF-Connecting-IP` header (Cloudflare real IP)

### Runbook
- [x] `RUNBOOK.md` documents:
  - Production URLs (api.droppii.vn, hive.droppii.vn)
  - Daily operations procedures
  - Troubleshooting guides
  - Monitoring endpoints
  - Cloudflare secrets setup (6 secrets documented)
  - GitHub Actions secrets required
  - Free tier limits tracking
  - Rollback procedure

---

## ⚠️ Remaining Before Production Deploy

### Cloudflare Secrets (set via `wrangler secret put`)
| Secret | Purpose | Required |
|--------|---------|----------|
| `JWT_SECRET` | HMAC signing for auth tokens | ✅ Yes |
| `PASSWORD_SALT` | PBKDF2 salt for passwords | ✅ Yes |
| `ADMIN_TOKEN` | Admin API bearer token | ✅ Yes |
| `ZALO_OA_TOKEN` | Zalo OA notifications | ⚠️ Optional (alerting) |
| `SENTRY_DSN` | Error tracking | ⚠️ Optional |
| `ENCRYPTION_KEY` | PII encryption (32-byte hex) | ✅ Yes |

### GitHub Actions Secrets
- [ ] `CF_API_TOKEN` — Cloudflare API token (Workers/D1/KV/Pages Edit permissions)
- [ ] `CF_ACCOUNT_ID` — Cloudflare account ID

### Domain & DNS
- [ ] `api.droppii.vn` → Worker custom domain (Cloudflare Dashboard > Workers > Triggers)
- [ ] `hive.droppii.vn` → Pages custom domain (Cloudflare Dashboard > Pages > Custom domains)
- [ ] SSL certificates auto-provisioned (Cloudflare managed)

### Worker Route Coverage (Gap Analysis)
**Closed 2026-08-18** — `src/workers/index.js` now serves the full Express route surface.

Instead of rewriting ~40 routes for the Workers runtime, the worker wires Hono
(ADR 004) to the existing Express app via `src/workers/express-adapter.js`.
Hono's `fetch(request, env, ctx)` signature matches the Workers `export default`
contract, and the adapter builds `IncomingMessage`/`ServerResponse` pairs, runs
the Express handler, and returns a Workers `Response` carrying the captured
status, headers, and body.

**Coverage verified end-to-end** (all routes return 200 through `worker.default.fetch`):
- `/health`
- `/quiz`, `/checkout` (static HTML pages)
- `/auth/*` (login, register, verify, refresh)
- `/api/members/*` (CRUD, search, hierarchy)
- `/api/habits/*` (check-in, streak, history)
- `/api/kpi/*` (rollup, leaderboard)
- `/api/alerts/*` (rules, evaluate, log, summary, psn-metrics, webhooks)
- `/api/onboarding/*` (start, advance, nudge, habit, order, progress, active)
- `/api/training/*` (assign, progress, active, attention, psn, graduation)
- `/api/leads/*`
- `/api/analytics/funnel/*`
- `/api/orders/*`
- `/api/monitoring/errors`, `/api/monitoring/summary`
- `/api/compliance/report` (Admin, PDPA report)

**Bridge details** (`src/workers/express-adapter.js`):
- Only `res.end` is wrapped — capturing the encoded body + status before it
  reaches the socket layer. Overriding `res.json`/`res.status`/`res.setHeader`
  breaks Express's send→end→finish→next chain (verified: recursive
  `res.setHeader` → "Maximum call stack size exceeded").
- The handler promise resolves *inside* `res.end` (not the `next` callback),
  because a bare `http.ServerResponse` has no socket, so Express never emits
  `finish` and the chain never advances on its own.
- `res.app` is set to the Express app (not the Hono app) so settings lookups
  like `app.get('json escape')` inside `res.json` resolve.
- `req.socket` is stubbed with the real client IP from `CF-Connecting-IP`
  (falling back to `X-Forwarded-For`), because Express's error middleware calls
  `req.ip`, which proxyaddr resolves through `req.socket.remoteAddress` — a
  bare `IncomingMessage` has no socket and that read throws.
- Worker request bodies are Web `ReadableStream`s; `raw.body.getReader()`
  is used (async iteration does not work on the raw body object), and GET
  requests have `raw.body === null`.

**Already wired through the Express app** (no separate port needed):
- Rate limiting — `src/middleware/rateLimit.js` (auth/api/webhook tiers,
  `skip: () => !isProduction`, so test runs are never throttled)
- RBAC — `src/middleware/requireRole.js`
- D1 database adapter — `src/server.js` binds `DB` (D1) or
  `better-sqlite3` (local) into `global.db`
- [x] Full Express route migration to native fetch API
- [x] Rate limiting integration in worker (port `src/middleware/rateLimit.js`)
- [x] RBAC middleware integration (port `src/middleware/requireRole.js`)
- [x] D1 database adapter initialization in worker context

### Monitoring & Alerting
- [ ] Sentry DSN configured and verified (error tracking)
- [ ] Zalo OA webhook verified (critical alerts)
- [x] `/api/monitoring/errors` endpoint accessible in production (served via Hono bridge)
- [x] `/api/monitoring/summary` endpoint accessible in production (served via Hono bridge)

### Pre-deploy Verification
- [x] `npm test` passes (276 tests, coverage ≥ 70/60/60/70)
- [x] `node --check src/server.js` passes
- [x] `node --check src/workers/index.js` passes
- [ ] `bash -n deploy.sh` passes
- [ ] `wrangler secret list` shows all required secrets
- [ ] `wrangler secret list --env staging` shows staging secrets

---

## Deployment Commands

```bash
# One-time secret setup
./deploy.sh secrets
# Follow prompts to run: wrangler secret put JWT_SECRET etc.

# Deploy to staging for validation
./deploy.sh staging
# Verify health: curl https://api-staging.droppii.vn/health

# Deploy to production
./deploy.sh
# Or via GitHub Actions: push to main branch
```

---

## Post-Deploy Validation

```bash
# Health checks
curl https://api.droppii.vn/health
curl https://api.droppii.vn/ready
curl https://api.droppii.vn/metrics

# Compliance endpoint (Admin token required)
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  https://api.droppii.vn/api/compliance/report

# Dashboard
curl https://hive.droppii.vn

# Live logs
wrangler tail --format pretty
```

---

## Rollback Plan

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback <version-id>

# Verify
curl https://api.droppii.vn/health
```

---

## Documentation References

- `docs/05_TASKS/cloudflare-secrets-guide.md` — Secrets generation & GitHub setup
- `docs/04_ROADMAP.md` — Milestone 50, Phase 3 completion
- `plans/reports/workflow-subagent-260816-2203-production-deploy-checklist.md` — Previous completion report
- `RUNBOOK.md` — Full operations guide
