# Phase 5 — Alert Engine Automation
Plan: 260810-2100-alert-engine-automation
Started: 2026-08-10 21:00 ICT

## Goal
Automate PSN health monitoring with scheduled evaluation, notification delivery, and integration with onboarding/training data.

## Current state
- Alert engine exists (src/analytics/alertEngine.js) with 6 default rules + PSN health classifier
- PSN health classification works (9-state Cửu Địa)
- Manual evaluation endpoints work: POST /api/alerts/evaluate, GET /api/alerts/summary
- Basic alert rules CRUD in alertEngine.js (addRule, updateRule, deleteRule)
- Legacy alerts API in src/api/alerts.js with 6 simple rules

## TODO
- [x] Add scheduled evaluation: cron job that evaluates all PSNs every 4 hours
- [x] Add notification delivery: webhook endpoint for external systems (Slack, Discord, email)
- [x] Wire PSN health metrics from onboarding/training data automatically
- [x] Add /api/alerts/rules CRUD endpoints (create, update, delete rules)
- [x] Add /api/alerts/webhook endpoint for external notifications
- [x] Add scheduled evaluation trigger endpoint
- [x] Test full flow: onboarding → training → PSN metrics → alert evaluation → notification
- [x] Document alert rule DSL for customization

## Integration points
- Training ops: habit scores, activity ratios from trainingOps.getActiveTrainees()
- Onboarding bot: connect_avg, order counts from onboardingBot sessions
- Member model: team_size, retention from member data
- Order model: revenue_delta from order analytics

## Verification steps
1. Trigger scheduled evaluation manually → alerts fire correctly
2. Webhook receives notification payload
3. PSN metrics computed from live training/onboarding data
4. Alert rules CRUD works via API
5. Acknowledge/resolve workflow works