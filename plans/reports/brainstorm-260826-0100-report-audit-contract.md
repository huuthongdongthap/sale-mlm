# Brainstorm Report: "report audit" Restructuring Contract

## Session Info
- DateTime: 8/26/2026, 01:00 AM
- CWD: `/Users/mac/mekong-cli` → target: `/Users/mac/mekong-cli/SALE MLM`
- Timezone: Asia/Saigon
- Goal context: Deep-check phases/features needed for go-live → audit plan remediation

## Trigger Failure
`mk-brainstorm` wrapper (via `mekong-wrapper.sh`) failed with `401 Invalid API key` — "pmv-balance" model unauthenticated. Proceeded manually per Autonomous Execution rule.

Analysis source: 46 existing audit reports in `/Users/mac/mekong-cli/SALE MLM/plans/reports/` + go-live readiness audit (`audit-260826-0044`).

## Brainstorm Contract

| Field | Value |
|-------|-------|
| **Outcome** | Bounded remediation contract for go-live audit findings: coverage gate, referral/LD wiring, D1 isolation → converted to executable task tickets |
| **Constraints** | Must not break existing CLI commands; single session; reuse `/plans/tasks/`; no operator-side actions (secrets/domains) |
| **Non-goals** | No referral persistence implementation; no D1 split execution; no CF secret configuration; no new test writing |
| **Acceptance Criteria** | ≥3 task tickets under `/Users/mac/mekong-cli/SALE MLM/plans/tasks/` with clear scope + acceptance commands; coverage remediation references `src/api/leads.js` + `src/api/members.js`; handoff path to `/mk:plan` |

## Approaches Compared

| # | Approach | Pro | Con |
|---|----------|-----|-----|
| 1 | Full mekong-cli restructuring (move `/src`→`/mekong-cli/sale-mlm/src`, symlink, etc.) | Aligns with global CLAUDE.md paths | Too broad for audit task; KISS violation |
| 2 | Targeted task tickets (chosen) | YAGNI: only fix go-live blockers | Requires operator for external |
| 3 | Rewrite entire audit pipeline + add 100+ tests | Maximum coverage | YAGNI + scope creep; 66 reports already exist |

## Recommendation (KISS/YAGNI)

**Selected: Approach #2** — 4 focused task tickets created:

1. **`260826-0100-coverage-threshold-remediation`** — Dev fixes coverage (leads.js + members.js)
2. **`260826-0101-referral-leaderboard-route-wiring`** — Mount dead routes + use ReferralsOps adapter
3. **`260826-0102-d1-staging-prod-isolation`** — Split DB ids in wrangler.toml
4. **`260826-0103-external-blocker-coordination`** — Track CF secrets + DNS (operator-only)

**Rationale:** Avoids architectural overhaul (YAGNI), reuses existing adapters (DRY), keeps fixes testable (KISS). 3-5h total vs 2-3 days for full restructure.

## Evidence Summary
- Coverage: statements57.8%, branches47.9%, functions55.3% (all below `jest.config.js` thresholds)
- Routes: `/auth`, `/api/habits`, `/api/members`, `/api/kpi`, `/api/leads` mounted; referral + leaderboard NOT
- D1: staging + prod share `database_id: "def140e1..."`
- External: 6 env vars + 2 DNS records pending operator

## Unresolved Questions
- Q1: Operator availability for CF secret setup? (blocks T-025 pilot)
- Q2: Does `ReferralsOps` adapter support all referral.js CRUD ops needed for leaderboard?
- Q3: Are staging DB contents (if any) safe to wipe/reseed after split?

---
Handoff: All task tickets → `/mk:plan` for execution sequencing.
