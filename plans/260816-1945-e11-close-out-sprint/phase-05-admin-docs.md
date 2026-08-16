# Phase 05 — T-024: Admin Documentation Update
Plan: 260816-1945-e11-close-out-sprint
Phase: 05 of 06

## Goal
Update README, RUNBOOK, CHANGELOG to reflect v1.1.0 close-out state with accurate deployment URLs and env vars.

## Current state
- README.md: generic, needs version + deployment section
- RUNBOOK.md: localhost only, missing monitoring table
- CHANGELOG.md: has v1.1.0 entry
- Deployment URLs referenced: api.droppii.vn, hive.droppii.vn, training.phungsu.vn (inconsistent)

## Acceptance criteria
- [ ] README.md: v1.1.0, deployment section, env var table
- [ ] RUNBOOK.md: production URLs, monitoring table, Cloudflare troubleshooting
- [ ] CHANGELOG.md: v1.1.1 close-out entry
- [ ] ROADMAP.md: E11 marked done
- [ ] No placeholder text remaining

## Steps
1. Update README.md (version, deployment, env vars)
2. Update RUNBOOK.md (production URLs, monitoring, Cloudflare ops)
3. Add CHANGELOG v1.1.1 entry
4. Mark E11 done in ROADMAP.md
5. Verify internal links valid

## Files
| File | Action |
|------|--------|
| README.md | Version, deployment, env vars |
| RUNBOOK.md | Production URLs, monitoring, CF ops |
| docs/12_CHANGELOG.md | Add v1.1.1 entry |
| docs/04_ROADMAP.md | Mark E11 complete |

## Dependencies
- Requires: T-021, T-022
- Blocks: T-025
- Est: 2h