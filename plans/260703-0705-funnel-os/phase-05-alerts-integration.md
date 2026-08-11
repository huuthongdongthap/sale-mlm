# Phase 5: Alert Rules Integration

**Priority:** P1 — Uses existing alert engine
**Status:** pending
**Files to edit:** `src/analytics/alertEngine.js`
**Files to create:** `src/automation/funnelAlerts.js`

## New Alert Rules

| Rule ID | Name | Condition | Severity |
|---------|------|-----------|----------|
| F1 | Stalled Lead | lead.lastContactedAt > 3 days | warning |
| F2 | Tier 2→3 Auto | lead.funnelLevel === 2 AND daysSince >= 14 | info |
| F3 | Lost Lead | lead.status === 'lost' | warning |
| F4 | High Value Lead | lead.funnelLevel >= 3 AND not contacted 2 days | high |
| F5 | Pipeline Dry | PSN Leader: total leads in pipeline = 0 | warning |

## Integration Points

- `evaluateStalledLeads()` → fires F1/F2/F4
- Zalo webhook for high-value alerts (F4)
- PS dB email digest (planned)

## Todo List

- [ ] Add F1–F5 rules to `alertEngine.js` initRules()
- [ ] `funnelAlerts.js` — `evaluateFunnelAlerts(lead, member)` 
- [ ] Cron: every 15min → evaluateStalledLeads() → fire alerts
- [ ] Zalo webhook for F4 severity
