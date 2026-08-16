# Phase 03 — T-021: Cloudflare Deploy Secrets
Plan: 260816-1945-e11-close-out-sprint
Phase: 03 of 06

## Goal
Configure Cloudflare Workers/Pages production secrets so CI deploy-production job succeeds on main.

## Current state
- wrangler.toml: Workers (D1+KV+R2) with staging/production envs
- CI deploy-production checks `env.CF_API_TOKEN != ''` (silently skips if missing)
- Needed secrets: CF_API_TOKEN, CF_ACCOUNT_ID, JWT_SECRET, PASSWORD_SALT
- Dashboard deploy: `wrangler pages deploy src/dashboard/dist --project-name=hive-training-prod --env production`

## Acceptance criteria
- [ ] CF API token created with Workers/Pages/D1/KV permissions
- [ ] GitHub secrets: CF_API_TOKEN, CF_ACCOUNT_ID configured
- [ ] wrangler deploy --env production works locally
- [ ] CI deploy step runs (not skipped)
- [ ] Post-deploy health check configured
- [ ] Setup documented

## Steps
1. Create Cloudflare API Token (Workers Scripts Edit, D1 Edit, KV Edit, Pages Edit)
2. Get Account ID from Cloudflare dashboard
3. Add GitHub repo secrets: CF_API_TOKEN, CF_ACCOUNT_ID
4. Add CI validation step before deploy-production
5. Test local: `export CF_API_TOKEN=...; npx wrangler deploy --env staging`
6. Document in docs/05_TASKS/cloudflare-secrets-guide.md

## Files
| File | Action |
|------|--------|
| .github/workflows/ci.yml | Add secrets validation step |
| docs/05_TASKS/cloudflare-secrets-guide.md | New |

## Dependencies
- Blocks: T-024
- Est: 2h