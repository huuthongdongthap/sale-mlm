# E11 Close-out Sprint — Pilot Launch Blocker Cleanup
Plan: 260816-1945-e11-close-out-sprint
Started: 2026-08-16 19:45 ICT
Project: droppii-training-os v1.1.0

## Goal

Clear 6 remaining blockers: CI coverage enforcement, E2E smoke completeness, Cloudflare deploy secrets, monitoring verification, admin docs, pilot checklist sign-off. When closed, CI enforces >=70% coverage, all critical endpoints have E2E assertions, production deploy works end-to-end, and the go/no-go checklist is fully signed.

## Critical path
T-019 (E2E) -> T-020 (CI coverage) -> T-025 (sign-off)
T-021 (CF secrets) -> T-024 (docs) -> T-025
T-019 -> T-022 (monitoring) -> T-025

## Tasks
| ID | Task | Est |
|----|------|-----|
| T-019 | E2E smoke hardening | 3h |
| T-020 | CI coverage enforcement | 4h |
| T-021 | Cloudflare deploy secrets | 2h |
| T-022 | Monitoring verification | 2h |
| T-024 | Admin docs update | 2h |
| T-025 | Pilot launch checklist sign-off | 2h |

## Unresolved questions
1. Coverage target: 70/60/60/70 immediate or staged? Suggest immediate.
2. Production domain: training.droppii.vn vs hive.droppii.vn?
3. Zalo OA webhook: verified or pending sandbox?
4. Uncommitted router.js + training-view.js: commit in sprint or separately?
5. E2E approach: supertest-only (current) or add Playwright later?