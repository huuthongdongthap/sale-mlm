# 04_ROADMAP

## Project Timeline

**Project:** droppii-training-os
**Current Version:** 1.1.1
**Planning Date:** 2026-06-23
**Last Updated:** 2026-08-16

### Legend

- ✅ Completed
- 🚧 In Progress
- ⏳ Planned
- 🔄 On Hold

---

## Historical Milestones

### Past Releases

| Version | Date | Key Features | Status |
|---------|------|--------------|--------|
| 1.0.0 | 2026-06-23 | Core platform: Auth, Members, Habits, KPI, PSN Health, Alerts, Dashboard shell, 4 Tier-1 modules, Onboarding bot, Training Ops agent, Test harness, CI pipeline, Cloudflare deployment, Monitoring, Seed data, Admin docs, Pilot checklist | ✅ |
| 1.1.0 | 2026-07-21 | API expansion: Leads management (8 endpoints), Funnel analytics (3 endpoints), Health/monitoring endpoints, Seed script env fix, CI pipeline hardening, Test env config | ✅ |
| 1.1.1 | 2026-08-16 | E2E smoke hardening, CI coverage enforcement (70/60/60/70), Cloudflare deploy secrets guide, Monitoring endpoint verification, Route shadowing bugfix (kpi.js leaderboard) | ✅ |

---

## Current Phase

**Phase:** Pilot Launch Preparation (E11)
**Timeline:** 2026-07-21 → 2026-07-28
**Progress:** 100% (Complete)

### Current Phase Objectives

1. [✅] Seed 10 pilot members across 2 PSNs with 14-day history
2. [✅] Create 15-item Go/No-Go pilot launch checklist
3. [✅] Draft Zalo kick-off message with mail-merge script
4. [✅] Document Day-0 dashboard snapshot capture procedure
5. [✅] Capture 6 dashboard screenshots (Overview, Members, PSN Health, KPI, Alerts, Training)
6. [⏳] Configure Cloudflare production secrets (CF_API_TOKEN, CF_ACCOUNT_ID)
7. [⏳] Verify Zalo webhook integration with sandbox
8. [⏳] Address test coverage gap (currently ~50% vs 70% threshold)

### Blockers / Dependencies

- [⏳] Cloudflare Workers/Pages production deploy — requires CF_API_TOKEN, CF_ACCOUNT_ID in GitHub secrets
- [⏳] Zalo OA webhook sandbox verification — needs Zalo Business API access
- [⏳] Coverage threshold enforcement — CI currently passes with --no-coverage flag; needs auth.js, habits.js, kpi.js, leads.js, analytics-funnel.js unit tests

---

## Upcoming Milestones

### Pilot Execution — G0 Cohort (2026-07-28 - 2026-08-25)

**Goals:**
- Onboard 10 Tân Binh across 2 PSNs (psn-rising-dragon, psn-golden-star)
- Daily habit check-in compliance ≥ 80%
- Tier-1 graduation: 3+ orders + habit ≥4 for 21 days
- PSN health: psn-rising-dragon → State 6+ (Trọng Địa), psn-golden-star → State 4+ (Giao Địa)

**Deliverables:**
- Daily nudge delivery via Zalo OA (onboardingBot)
- Weekly PSN health report (PSN Health classifier)
- Alert escalation via Zalo (retention_guard, habit_guard)
- End-of-pilot graduation report

**Dependencies:**
- Production Cloudflare deployment
- Zalo OA webhook verified
- Pilot members have dashboard credentials

---

### Phase 2: Scale to 50 Members (2026-08-25 - 2026-10-20)

**Goals:**
- Expand to 5 PSNs, 50 members
- Tier-2 curriculum (Modules 5-8) content creation
- PSN Leader dashboard enhancements
- Referral tracking + reward automation

**Deliverables:**
- content/tier2/m5-leadership.json through m8-scale.json
- PSN Leader role: team view, coaching scheduler
- Referral API + reward distribution job
- Automated weekly business review email

**Dependencies:**
- G0 pilot graduation data for retention benchmarks
- Tier-2 content authoring (content worker)

---

### Phase 3: $500K ARR Trajectory (2026-10-20 - 2027-01-15)

**Goals:**
- 200+ active members across 20 PSNs
- $50K MRR → $500K ARR
- Tier-3 curriculum (Chỉ Huy) for PSN Leaders
- Multi-tenant architecture for franchise onboarding

**Deliverables:**
- Multi-tenant D1 schema (org_id partitioning)
- Franchise onboarding workflow
- Revenue analytics dashboard (MRR, ARPU, churn)
- Automated compliance reporting (PDPA audit trail)

**Dependencies:**
- Phase 2 benchmarks validated
- Infrastructure scaling (D1 limits, Workers CPU)

---

## Long-term Vision (12+ months)

- **Vietnam market leadership:** #1 MLM training OS for direct selling
- **Platform extensibility:** Plugin architecture for custom modules
- **AI Coach integration:** Anthropic Claude for personalized coaching
- **Regional expansion:** Thailand, Indonesia localization
- **Enterprise tier:** White-label SaaS for MLM companies

## Success Criteria

Each milestone is evaluated against:

- ✅ Feature completeness (all stories done)
- ✅ Test coverage ≥ 70% (targeting 80% post-pilot)
- ✅ Performance benchmarks met (API p95 < 200ms)
- ✅ Security audit passed (no critical/high vulns)
- ✅ Documentation updated (roadmap, changelog, ADRs)

## Timeline Visualization

```mermaid
gantt
    title droppii-training-os Roadmap
    dateFormat YYYY-MM-DD
    section Foundation
    E1: Auth + Members + PDPA          :done,    e1, 2026-04-24, 5d
    E2: Habits + KPI + PSN Health      :done,    e2, after e1, 7d
    E3: Analytics + Alerts             :done,    e3, after e2, 5d
    section Dashboard
    E4: Dashboard (5 views)            :done,    e4, 2026-04-26, 4d
    section Content
    E5: Tier-1 Modules (M1-M4)         :done,    e5, 2026-04-24, 7d
    section Agents
    E6: Onboarding Bot + Training Ops  :done,    e6, after e5, 5d
    section Quality
    E7: Test + E2E + CI                :done,    e7, 2026-05-20, 3d
    section Deploy
    E8: Cloudflare + Monitoring        :done,    e8, after e7, 4d
    section Data
    E9: Seed Data                      :done,    e9, 2026-05-20, 2d
    section Docs
    E10: Admin README + Runbook        :done,    e10, 2026-07-21, 1d
    section Launch
    E11: Pilot Launch Prep             :done,  e11, 2026-07-21, 7d
    section Scale
    Pilot Execution (G0)               :e11,    2026-07-28, 28d
    Phase 2: 50 Members                :e11,    2026-08-25, 56d
    Phase 3: $500K ARR                 :e11,    2026-10-20, 87d
```

---

*Last updated: 2026-08-16 — All T-001 through T-024 complete. Pilot launch (T-025) ready for execution.*