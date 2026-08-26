# CI Green Recovery + Deploy Gate Discovery

## Session Info
- 2026-08-26 (14:30–15:40 ICT), CWD `/Users/mac/mekong-cli/SALE MLM`, branch main
- Trigger: continue CI fix after audit-plan completion session

## Final State
| Gate | Before | After |
|------|--------|-------|
| CI Pipeline | ❌ failure (100+ runs, never green) | ✅ **success × 2 consecutive** (`32934540859`, `32943506592`) |
| Dashboard build | ❌ Rollup "does not provide export" | ✅ vite build ok |
| Jest on runner | ❌ worker SIGSEGV (better-sqlite3 native) | ✅ 240/240 in-band |
| Worktree gitlinks | 6 stale entries in index | removed (`981a507`) |

## Fixes (3 commits)
1. **`678d225` fix: convert psn-health mock to ESM + jest-junit**
   - Sub-modules under `src/api/mock/psn-health/` were CommonJS while barrel was ESM → Rollup cannot statically resolve named exports out of CJS → dashboard build broke.
   - Converted all 4 sub-modules to ESM; added `jest-junit` devDep used by CI reporter flag; refreshed tracked dist.
2. **`fffc57c` ci: runInBand + Node 22**
   - Root cause of SIGSEGV: jest multi-process workers crash with better-sqlite3 native binding under load on ubuntu runner. `--runInBand` serializes suites (12.5s locally, acceptable).
   - Bumped `NODE_VERSION: '20' → '22'` to match local dev runtime (v22.22.3).
   - Note: better-sqlite3 ships prebuilds for all platforms incl. linux-x64 — binding itself loads fine; only crashes under parallel workers.
3. **`981a507` chore: remove stale worktree gitlinks** — `.claude/worktrees/wf_8465e50d-0de-{1..6}` were committed as mode-160000 gitlinks by an earlier workflow; caused git 128 warnings in every CI run.

## Deploy gate discovery ⚠️
"Deploy to Production" job is green but **deploys nothing**: it checks `CF_API_TOKEN`/`CF_API_ACCOUNT_ID` secrets, finds them unset, prints skip warnings, exits 0.

- Last real Worker deploy: 2026-08-25T16:49Z (manual, version `e32d279d`)
- Post-deploy health check step is also a placeholder (commented curl, always succeeds)
- Local wrangler is OAuth-authenticated (account `b69fee03…`) — manual deploys work; CI deploys do not
- workers.dev subdomain unknown/unresolved (tried account-id and name-based patterns — DNS NXDOMAIN); `api.droppii.vn` still points at Droppii's own infra per blocker ticket

## Remaining operator actions (unchanged + new)
1. **NEW:** Set GitHub secrets `CF_API_TOKEN` + `CF_API_ACCOUNT_ID` (repo Settings → Secrets → Actions) so the deploy job actually deploys; then replace placeholder health check with real URL
2. Set `ALLOWED_ORIGIN` secret on hive-warfare-os (+staging) — server refuses boot without it
3. Wire api.droppii.vn Custom Domain OR publish workers.dev URL
4. Verify PASSWORD_SALT == seed salt; rotate weak seed passwords

## Unresolved questions
1. Should CI deploy to staging too (currently only prod env block)? Recommend staging-on-push-to-main before prod.
2. Health-check URL to wire into CI once domain decision made.
