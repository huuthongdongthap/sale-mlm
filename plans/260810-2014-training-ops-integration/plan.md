# Phase 4 — Training Ops & Onboarding Integration
Plan: 260810-2014-training-ops-integration
Started: 2026-08-10 20:15 ICT

## Goal
Wire training curriculum with onboarding bot, verify Phase 4 flow:
1. Assign curriculum on onboarding start
2. Daily advanceDay → updateProgress (day_complete)
3. Habit scores → updateProgress (habit_score)
4. Orders → updateProgress (order) + onboardingBot.recordOrder
5. Graduation criteria sync between both systems

## Current state
- onboardingBot: 4-week Tier-1 flow (W1:M1, W2:M2, W3:M3, W4:M4)
- trainingOps: 3-tier curriculum (Tier 1: 4 modules × 7 days = 28 days)
- Both use in-memory stores (sessions / trainingRecords)
- Both have graduation criteria (onboarding: 3 orders + habit≥4 × 3 weeks; training: completed_days ≥ total_days)

## Integration points
- `assignCurriculum` called from `/api/onboarding/start` → creates training record
- `advanceDay` calls `updateProgress(memberId, {type: 'day_complete'})`
- `recordHabitScore` calls `updateProgress(memberId, {type: 'habit_score', value: score})`
- `recordOrder` calls `updateProgress(memberId, {type: 'order'})` + onboardingBot.recordOrder
- Graduation check synced: trainingOps status='graduated' ↔ onboardingBot status='graduated'

## TODO
- [ ] Modify `/api/onboarding/start` to call `assignCurriculum` 
- [ ] Modify `/api/onboarding/:memberId/advance` to call `updateProgress` + `advanceDay`
- [ ] Modify `/api/onboarding/:memberId/habit` to call `updateProgress` + `recordHabitScore`
- [ ] Modify `/api/onboarding/:memberId/order` to call `updateProgress` + `recordOrder`
- [ ] Add `/api/training/graduation-check` endpoint
- [ ] Verify end-to-end: start → 28 days → graduation in both systems
- [ ] Test PSN Leader can view trainees: GET /api/training/psn/:psnId
- [ ] Test attention alerts: GET /api/training/attention