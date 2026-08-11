# Phase 4: Stage-Transition + Automation

**Priority:** P1 — Core funnel logic
**Status:** pending
**Files to edit:** `src/models/lead.js`
**Files to create:** `src/automation/funnelRules.js`

## Transition Rules

| From Tier | To Tier | Trigger | Prerequisites |
|-----------|---------|---------|---------------|
| 0 (Lead Magnet) | 1 (Trial) | Manual | submit quiz answers |
| 1 (Trial) | 2 (Health Active) | Auto after 7 days OR manual | trial product purchased |
| 2 (Health Active) | 3 (Combo) | Auto after 14 days OR manual | health active for 14 days |
| 3 (Combo) | 4 (CTV Partner) | Manual | recruitment goal met (2+ referrals) |

## Reversions
- Any tier ≥2 → can revert to Contacted if no activity in 14 days
- Lost → terminal state (needs Admin to revive)

## Implementation Steps

1. `canTransition(lead, toTier)` — validate prerequisites
2. `transition(leadId, toTier, userId)` — update level, log event
3. `evaluateStalledLeads()` — find leads stuck > threshold, alert
4. `getFollowUpQueue()` — leads needing contact today

## Follow-Up Queue Logic
- Leads with `lastContactedAt > 3 days ago` AND status !== 'lost'
- Priority: higher funnel tier = higher priority

## Todo List

- [ ] `funnelRules.js` — `canTransition()`, `transition()`
- [ ] `evaluateStalledLeads()` — cron candidate
- [ ] `getFollowUpQueue()` — return lead IDs + days since contact
- [ ] Transition log appended to lead metadata
