# Implementation Plan: T-024 & T-025 — Admin Documentation & Pilot Launch

**Project:** Droppii Sales Training OS (Hive Warfare Academy)  
**Date:** 2025-06-23  
**Author:** Claude Code Implementation Plan  
**Work Context:** `/Users/mac/mekong-cli/SALE MLM`  
**Reports Path:** `/Users/mac/mekong-cli/SALE MLM/plans/reports/`  
**Plans Path:** `/Users/mac/mekong-cli/SALE MLM/plans/`

---

## Executive Summary

**T-024** (Admin README + Runbook): Create operational documentation for system administrators and PSN leaders  
**T-025** (Pilot Launch Checklist): Prepare all artifacts and checklists for onboarding 10 Tân Binh (new recruits)  

These are the **final closing tasks** for the MVP. They don't require coding but demand high-quality operational documentation and launch readiness verification.

---

## PHASE BREAKDOWN

### Phase 1: Documentation Foundation & Content Audit (T-024)
- **Objective:** Gather all operational information needed for admin documentation
- **Duration:** 4 hours
- **Dependencies:** T-021 (Deployment), T-022 (Monitoring) — must be deployed to document procedures
- **Owner:** content-worker (documentation specialist)
- **Critical Path:** YES — T-024 must complete before T-025 can finalize

### Phase 2: README.md Authoring (T-024)
- **Objective:** Create concise, bilingual setup and usage guide
- **Duration:** 2 hours
- **Dependencies:** Phase 1 completion
- **Owner:** content-worker

### Phase 3: RUNBOOK.md Authoring (T-024)
- **Objective:** Create incident response playbooks for common operational issues
- **Duration:** 4 hours
- **Dependencies:** Phase 1 completion
- **Owner:** content-worker

### Phase 4: Pilot Launch Checklist Creation (T-025)
- **Objective:** Build comprehensive go/no-go checklist with 15 items
- **Duration:** 3 hours
- **Dependencies:** T-024 partial (need README for reference)
- **Owner:** ops-worker

### Phase 5: Pilot Artifacts Preparation (T-025)
- **Objective:** Create kick-off Zalo message draft and dashboard snapshot
- **Duration:** 2 hours
- **Dependencies:** Phase 4 completion
- **Owner:** ops-worker

### Phase 6: Final Verification & Sign-off (T-024 + T-025)
- **Objective:** Review all deliverables, ensure completeness, archive to plans/
- **Duration:** 1 hour
- **Dependencies:** All previous phases
- **Owner:** CTO/lead

**Total Estimated Effort:** 16 hours  
**Critical Path Duration:** 2 days (with parallel work where possible)

---

## DETAILED TASK BREAKDOWN

### Phase 1: Documentation Foundation & Content Audit

#### Task 1.1: Inventory Existing Systems
**Effort:** 1 hour  
**Owner:** content-worker  
**Deliverable:** `docs/system-inventory.md` (temporary audit file)

**Steps:**
1. Read deployment configuration files: `wrangler.toml`, `.env.example`
2. Check monitoring setup: `src/api/monitoring/` endpoints, alert rules in `src/analytics/`
3. Verify seed data script: `scripts/seed.js` — understand data structure
4. List all API endpoints from `src/api/` and document their purposes
5. Identify environment variables required (from codebase grep)
6. Document Cloudflare Pages/Workers deployment status

**Acceptance Criteria:**
- Complete inventory of all operational components
- List of required environment variables with descriptions
- Map of API endpoints and their health checks

---

#### Task 1.2: Test Incident Response Procedures
**Effort:** 2 hours  
**Owner:** content-worker + ops-worker  
**Deliverable:** `docs/incident-test-log.md` (temporary test results)

**Steps:**
1. Start dev server: `npm run dev`
2. Simulate DB down: kill server, verify `/health` returns appropriate status
3. Simulate API 500 spike: introduce error in test route, monitor `/api/monitoring/errors`
4. Test Zalo webhook fail: unset `ZALO_ALERT_WEBHOOK`, trigger alert, verify graceful degradation
5. Test Sentry fail: unset `SENTRY_DSN`, generate error, verify console fallback
6. Document actual error messages, response codes, recovery steps observed

**Acceptance Criteria:**
- All 3 incident scenarios tested and logged
- Recovery procedures documented with actual observed behavior
- Screenshots or curl outputs captured for reference

---

#### Task 1.3: Understand Pilot Onboarding Flow
**Effort:** 1 hour  
**Owner:** content-worker  
**Deliverable:** `docs/pilot-onboarding-flow.md` (temporary flow doc)

**Steps:**
1. Read onboarding bot code: `src/agents/onboardingBot.js`
2. Understand 4-week Tier-1 curriculum structure from `content/tier1/`
3. Identify critical checkpoints: habit_score ≥ 4, 3 orders required for graduation
4. Document daily nudge format and timing (webhook payload structure)
5. Map PSN leader actions during pilot (dashboard views, alert responses)

**Acceptance Criteria:**
- Clear timeline of pilot (Day 0 → Day 28)
- List of automated vs. manual touchpoints
- Escalation paths for stuck trainees

---

### Phase 2: README.md Authoring (T-024)

#### Task 2.1: Draft README.md
**Effort:** 2 hours  
**Owner:** content-worker  
**Deliverable:** `/README.md` (replace or supplement existing)

**Content Requirements (≤ 20 lines as per acceptance, but allow expansion to 30 lines for bilingual):**

```markdown
# Droppii Sales Training OS

AI-operated MLM training platform for PHỤNG SỰ 100 ĐỘ C team.

## Quick Setup

```bash
npm install
npm run dev              # Start API at http://localhost:3000
npm run dev:dashboard    # Start dashboard at http://localhost:3001
```

## Deployment

Frontend → Cloudflare Pages (Vite build from `src/dashboard/`)  
Backend → Cloudflare Workers (`wrangler.toml` configured)  

## Health Check

```bash
curl http://localhost:3000/health
```

## Documentation

- `RUNBOOK.md` — Incident response playbooks  
- `docs/` — System architecture, deployment guides  
- `.mekong/tasks.json` — Kanban board (505 commands)

## Support

Team: PHỤNG SỰ 100 ĐỘ C | Target: $500K ARR by Q1-2027
```

**Vietnamese Version:** Include same content with Vietnamese explanations below each section.

**Acceptance Criteria:**
- Setup instructions verified by running `npm install && npm run dev` on clean checkout
- Deployment section reflects actual `wrangler.toml` configuration
- Health check command returns 200 OK
- ≤ 30 lines total (bilingual)

---

### Phase 3: RUNBOOK.md Authoring (T-024)

#### Task 3.1: Draft Daily Operations Section
**Effort:** 1 hour  
**Owner:** content-worker  
**Deliverable:** Section in `/RUNBOOK.md`

**Content:**
- Morning check (5AM): health check, active onboarding sessions, trainees needing attention, alert summary
- Send daily nudges: fetch active sessions, POST `/onboarding/{memberId}/nudge`
- Evening review: habit streaks, KPI rollup, PSN health evaluation

**Format:** curl commands with explanations, actual endpoint names from codebase.

---

#### Task 3.2: Draft Incident Playbooks
**Effort:** 2 hours  
**Owner:** content-worker  
**Deliverable:** Section in `/RUNBOOK.md`

**Three mandatory playbooks (from acceptance criteria):**

**1. Database Down (In-Memory Storage Failure)**
- Detection: `GET /health` returns 500 or timeout
- Diagnosis: `lsof -i :3000` check port, `ps aux | grep node` check process
- Recovery: Restart server (`npm run dev`), re-seed data (`node scripts/seed.js`)
- Prevention: Monitor memory usage, consider D1 migration (Cloudflare SQLite)

**2. API 500 Spike**
- Detection: `GET /api/monitoring/errors?limit=20` shows surge
- Diagnosis: Check error logs, identify failing endpoint pattern
- Rollback: `git log --oneline -10`, revert recent deploy if applicable
- Fix: Debug specific route, run tests (`npm test`), redeploy

**3. Zalo Webhook Fail**
- Detection: Alerts not sending but `ZALO_ALERT_WEBHOOK` is set
- Diagnosis: `curl -X POST $ZALO_ALERT_WEBHOOK -d '{"test":"ping"}'` — verify connectivity
- Fallback: Check `SENTRY_DSN` for error tracking, manual Zalo message to admin
- Recovery: Verify webhook URL format, check network/firewall

**Acceptance Criteria:**
- Each playbook has Detection → Diagnosis → Recovery → Prevention structure
- All curl commands tested against running dev server
- Commands use correct endpoints from actual codebase

---

#### Task 3.3: Add Monitoring & Troubleshooting Sections
**Effort:** 1 hour  
**Owner:** content-worker  
**Deliverable:** Section in `/RUNBOOK.md`

**Content:**
- Error log viewing: `GET /api/monitoring/errors`, `GET /api/monitoring/summary`
- Health endpoints table
- Zalo alert setup instructions (set env var)
- Sentry setup instructions (set env var)
- Backup/restore procedures (export members, re-seed)
- Current limits table (10,000 members, 100K habit/KPI records)

**Acceptance Criteria:**
- All endpoints documented match actual implementation
- Commands are runnable and verified

---

### Phase 4: Pilot Launch Checklist Creation (T-025)

#### Task 4.1: Define Go/No-Go Criteria (15 Items)
**Effort:** 2 hours  
**Owner:** ops-worker  
**Deliverable:** `plans/launch/pilot-go-no-go-checklist.md`

**Checklist Structure (15 items minimum):**

**Deployment & Infrastructure (5 items)**
- [ ] Cloudflare Workers deployed and `wrangler.toml` health endpoint returns 200
- [ ] Cloudflare Pages dashboard deployed and loads
- [ ] Domain `training.phungsu.vn` (or staging URL) resolves correctly
- [ ] Sentry project created and `SENTRY_DSN` configured in production env
- [ ] Zalo webhook tested with 3 sample messages

**Data & Seeding (3 items)**
- [ ] `scripts/seed.js` runs successfully and creates 10 pilot members
- [ ] 14 days of habit + KPI history present for all 10 members
- [ ] PSN health states vary across 2 PSNs (include at least 1 critical state)

**Training Content (3 items)**
- [ ] All 4 Tier-1 modules (M1-M4) present in `content/tier1/` as valid JSON
- [ ] Each module has 7 lessons with ≥400 words Vietnamese content
- [ ] Curriculum auto-assignment via `POST /api/training/assign` tested

**Operational Readiness (4 items)**
- [ ] Onboarding bot flow tested end-to-end: start → day 7 → day 28 graduation
- [ ] Daily nudge webhook payload format validated with Zalo API sandbox
- [ ] Alert rules engine: 3 seeded rules (`habit_score<3`, `leads<2/day`) fire correctly
- [ ] Dashboard loads with Members, KPI, PSN, Alerts views; all mock API calls succeed

**Sign-off Section:**
- Prepared by: _____________ (ops-worker) Date: ___
- Reviewed by: _____________ (CTO) Date: ___
- Approved for Launch: YES / NO

**Acceptance Criteria:**
- Exactly 15 checklist items covering all critical paths
- Each item has clear verification method (test, curl command, manual check)
- Checklist saved to `plans/launch/pilot-go-no-go-checklist.md`

---

#### Task 4.2: Draft Kick-off Zalo Message
**Effort:** 1 hour  
**Owner:** ops-worker  
**Deliverable:** `plans/launch/kick-off-zalo-draft.md`

**Message Requirements:**
- Vietnamese language, friendly tone
- Include: Welcome to PHỤNG SỰ 100 ĐỘ C, start date (Day 0), first module (M1 Mindset)
- Provide: Dashboard URL, login credentials (temp), support contact
- Action required: Login within 24h, complete Day 1 habit check-in
- Format: Zalo OA message (≤ 500 chars, with line breaks)

**Draft Structure:**

```
🎯 CHÀO MỪNG TÂN BINH [NAME]!

Bạn đã chính thức bắt đầu hành trình 28 ngày 
Tier-1 Training tại Droppii Sales Training OS.

📅 Ngày đầu tiên: [DATE]
📚 Bài đầu tiên: M1 — Mindset Reset (5AM Club)

🚀 Truy cập Dashboard:
[URL]
👤 Tài khoản: [EMAIL]
🔑 Mật khẩu: [TEMP_PASS]

📲 Hỗ trợ: [ZALO_CONTACT]

⏰ Hạn: Đăng nhập trong 24h và hoàn thành Day 1 habit check-in.

"Kiến tạo thành công — bắt đầu từ hôm nay!"
— PHỤNG SỰ 100 ĐỘ C
```

**Acceptance Criteria:**
- Message fits Zalo 500-char limit
- Placeholders bracketed for mail-merge
- Draft saved to `plans/launch/kick-off-zalo-draft.md`

---

#### Task 4.3: Capture Day-0 Dashboard Snapshot
**Effort:** 1 hour  
**Owner:** ops-worker  
**Deliverable:** `plans/launch/day-0-dashboard-snapshot.png` (or .md with screenshots)

**Steps:**
1. Start dev server with seed data: `node scripts/seed.js && npm run dev`
2. Login as Admin at `http://localhost:3001` (or deployed URL)
3. Navigate to Members view — capture full page screenshot showing:
   - 10 pilot members table
   - Filters applied (tier, PSN)
   - Habit scores and KPI status pills
4. Navigate to PSN health view — capture 9-state heat map
5. Navigate to Alerts inbox — show empty or seeded alerts
6. Save screenshots as PNG files, embed in `day-0-dashboard-snapshot.md`

**Acceptance Criteria:**
- At least 3 screenshots capturing all major views
- Screenshots show realistic pilot data (not empty)
- Snapshot document saved to `plans/launch/day-0-dashboard-snapshot.md`

---

### Phase 5: Integration & Documentation Updates

#### Task 5.1: Update Project Roadmap
**Effort:** 0.5 hours  
**Owner:** content-worker  
**Deliverable:** `docs/development-roadmap.md` updated

**Changes:**
- Mark E10-docs (T-024) as Complete
- Mark E11-launch (T-025) as Complete
- Update completion dates to 2026-05-20 (or today)
- Move all tasks to Done column in roadmap status table

---

#### Task 5.2: Update Project Changelog
**Effort:** 0.5 hours  
**Owner:** content-worker  
**Deliverable:** `docs/project-changelog.md` updated

**Entry to add:**
```
## 2026-05-20 — MVP Closeout

### Added
- Admin README with bilingual setup instructions (T-024)
- Comprehensive RUNBOOK with incident playbooks (T-024)
- Pilot launch checklist (15 items) with go/no-go criteria (T-025)
- Kick-off Zalo message templates and Day-0 dashboard snapshots (T-025)

### Documentation
- Updated development roadmap to reflect MVP completion
- Operational procedures documented for handoff to PSN leaders
```

---

#### Task 5.3: Archive Plan Reports
**Effort:** 0.5 hours  
**Owner:** ops-worker  
**Deliverable:** Report files in `plans/reports/`

**Files to create:**
1. `plans/reports/t-024-admin-docs-completion-report.md`
2. `plans/reports/t-025-pilot-launch-readiness-report.md`

Each report should contain:
- Tasks completed (checklist)
- Verification methods used
- Any issues encountered and resolved
- Unresolved questions (if any)
- Sign-off: Prepared by ___, Reviewed by ___, Date: ___

---

### Phase 6: Final Verification & CTO Sign-off

#### Task 6.1: Pre-Sign-off Verification
**Effort:** 0.5 hours  
**Owner:** CTO/lead  
**Deliverable:** Verification checklist completed

**Verification Steps:**
1. Read `README.md` — confirm ≤ 30 lines, bilingual, commands runnable
2. Read `RUNBOOK.md` — confirm all 3 playbooks present and tested
3. Inspect `plans/launch/` — confirm checklist, Zalo draft, snapshots exist
4. Verify `docs/development-roadmap.md` shows all tasks complete
5. Run `npm test` — ensure test suite still passing (no regression)
6. Start dev server and manually verify: `/health`, `/api/members`, `/api/kpi/:id`
7. Review all deliverables in `plans/reports/` for completeness

---

#### Task 6.2: CTO Sign-off & Kanban Update
**Effort:** 0.5 hours  
**Owner:** CTO/lead  
**Deliverable:** Official sign-off

**Actions:**
- Update `.mekong/tasks.json` to set T-024 and T-025 to `"done"` (if not already)
- Add completion notes to task `events` array with timestamps
- Ensure all phase files are committed to git (if applicable)
- Create final summary report for stakeholder

---

## CRITICAL PATH

```
Phase 1 (4h) → Phase 2 (2h) → Phase 3 (4h) → Phase 4 (3h) → Phase 5 (1.5h) → Phase 6 (1h)
     ↓              ↓             ↓             ↓              ↓             ↓
  Audit        README        Runbook     Checklist    Docs Update   Sign-off
```

**Parallelizable work:**
- Phase 4 can overlap with Phase 3 (checklist drafting while runbook is in progress)
- Phase 5 tasks (5.1, 5.2, 5.3) can run in parallel

**Critical dependencies:**
- Phase 2 & 3 cannot start until Phase 1 completes (need system inventory)
- Phase 4 needs README draft for reference on endpoints/setup
- Phase 6 requires all deliverables present

**Total sequential time:** 14 hours  
**Total elapsed time with parallelism:** 12 hours (2 days at 6 hours/day)

---

## RISK ASSESSMENT & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Deployment not actually ready** (T-021/T-022 incomplete) | Medium | High | Verify deployment status before Phase 1; if incomplete, flag and pause documentation until deployment done |
| **Monitoring endpoints missing or broken** | Low | Medium | Run `curl` tests against all endpoints in Phase 1; document actual behavior even if imperfect |
| **Pilot data not realistic** (seed script insufficient) | Medium | Medium | Test seed script; if inadequate, enhance to create 10 varied members before Phase 4 snapshot |
| **Zalo webhook integration not functional** | Medium | Medium | Test actual Zalo API call; if unavailable, document expected format and note as open issue |
| **Language quality** (Vietnamese/English) | Low | Low | Use bilingual review; if language skills insufficient, ask user to review drafts |
| **Documentation too long** (violates ≤20 lines for README) | Medium | Low | Draft full version first, then condense; prioritize essential commands over explanations |

---

## FILE PATHS & DELIVERABLES

### Temporary Working Files
- `docs/system-inventory.md` (Phase 1.1 output)
- `docs/incident-test-log.md` (Phase 1.2 output)
- `docs/pilot-onboarding-flow.md` (Phase 1.3 output)

### Final Deliverables (Production)
1. `/README.md` — Bilingual setup guide (T-024)
2. `/RUNBOOK.md` — Incident response playbooks (T-024)
3. `plans/launch/pilot-go-no-go-checklist.md` — 15-item checklist (T-025)
4. `plans/launch/kick-off-zalo-draft.md` — Message template (T-025)
5. `plans/launch/day-0-dashboard-snapshot.md` + screenshots (T-025)

### Documentation Updates
6. `docs/development-roadmap.md` — Updated to mark E10/E11 complete
7. `docs/project-changelog.md` — Added closeout entry

### Reports Archive
8. `plans/reports/t-024-admin-docs-completion-report.md`
9. `plans/reports/t-025-pilot-launch-readiness-report.md`

---

## SUCCESS CRITERIA

**T-024 Success:**
- README.md: Setup, run, deploy instructions complete; ≤ 30 lines; bilingual; commands verified runnable
- RUNBOOK.md: All 3 incident playbooks (DB down, API 500 spike, Zalo fail) present with detection→diagnosis→recovery structure
- Both files committed to repo and linked from main README

**T-025 Success:**
- Go/no-go checklist with exactly 15 items covering infrastructure, data, content, operations
- Kick-off Zalo message draft ready for copy-paste with placeholders
- Day-0 dashboard snapshot capturing realistic pilot state
- All deliverables saved to `plans/launch/` directory

**Overall Success:**
- All 19 deliverables (9 files + 3 updates + 7 reports) present and verified
- CTO sign-off obtained with no blocking issues
- Kanban board updated to show E10-docs and E11-launch as Complete

---

## UNRESOLVED QUESTIONS

1. **Is the pilot actually ready to launch?** The tasks are marked "done" in Kanban but we should verify that all acceptance criteria were truly met (especially Day-0 snapshot exists in `plans/launch/`).
2. **Bilingual requirement:** Should README and RUNBOOK be fully bilingual (every section duplicated) or essential sections only? Current plan assumes essential sections with Vietnamese explanations.
3. **Zalo integration status:** Need to verify `ZALO_ALERT_WEBHOOK` is actually configured and working. If not, runbook should document it as "pending production deployment."
4. **Owner assignment:** The Kanban assigns T-024 to `content` worker and T-025 to `ops` worker. If these roles aren't available in current team structure, tasks may need re-assignment.
5. **Pilot size:** Acceptance says "10 Tân Binh" — is this still the target or has it changed?

---

## NEXT STEPS AFTER COMPLETION

1. **Stakeholder notification:** Email/chat announcement that MVP documentation is complete and pilot ready to launch
2. **Training session:** Conduct 1-hour walkthrough of RUNBOOK with PSN leaders
3. **Pilot execution:** Begin Day-0 onboarding of 10 Tân Binh using the prepared materials
4. **Feedback collection:** After 1 week, gather feedback on documentation clarity and update if needed
5. **Production handoff:** Ensure all ops team members have read RUNBOOK before scaling beyond pilot

---

**Plan Version:** 1.0  
**Status:** Ready for execution  
**Estimated Total Effort:** 16 hours  
**Critical Path Duration:** 2 days  
