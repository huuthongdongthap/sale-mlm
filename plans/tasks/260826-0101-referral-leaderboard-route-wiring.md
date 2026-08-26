# Task: Referral + LeaderDashboard Route Wiring

## Goal
Mount `src/features/referral.js` and `src/features/leaderDashboard.js` in `src/server.js`.

## Current Gap
- `src/features/leaderDashboard.js` — Express router with `/referral/*` + `/scaling/progress` (HARDCODED metrics) — **NOT mounted**.
- `src/features/referral.js` — uses in-memory arrays despite `src/db/local-adapter/referrals.js` exporting `ReferralsOps`.

## Scope
1. Mount `leaderDashboard` router in `src/server.js` (e.g. `app.use('/leaderboard', leaderRoutes)` or `/api/referral/*`)
2. Wire `referral.js` to use `ReferralsOps` adapter instead of in-memory `const referrals = []`
3. `/scaling/progress` must return live data (query members table + target config), not hardcoded 10/50/20%

## Constraints
- DRY: Reuse `ReferralsOps` from `src/db/local-adapter/referrals.js` — don't create new persistence layer
- KISS: Minimal wiring — don't refactor entire referral architecture
- YAGNI: Only mount endpoints needed for pilot; no extra admin tooling

## Evidence
- `src/server.js:244-248` — only `/auth`, `/api/habits`, `/api/members`, `/api/kpi`, `/api/leads` mounted
- `src/db/local-adapter/index.js` line30 — `ReferralsOps` exported but unused
- `src/features/leaderDashboard.js` — 5 endpoints defined, zero in server.js

## Acceptance
```bash
# Health check
curl -s http://localhost:3000/api/referral/code | head -c 100
curl -s http://localhost:3000/scaling/progress | grep -o '"current_members":[0-9]*'
# Should return live DB value, NOT hardcoded 10
```
Exit code0 = accepted.

---
Handoff: After wiring, delegate to `code-reviewer` for route verification.
