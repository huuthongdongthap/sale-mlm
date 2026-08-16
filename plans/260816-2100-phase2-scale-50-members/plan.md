# Phase 2 — Scale to 50 Members

Plan: 260816-2100-phase2-scale-50-members

## Goal

Extend the platform from 10 pilot members to 50 across 5 PSNs, enrich Tier-2 curriculum (M5-M8) with exercises and quizzes, add a PSN Leader dashboard view, implement referral tracking with reward automation, and automate weekly business reviews. This phase bridges the gap between the G0 pilot (10 members, 2 PSNs) and Phase 3's 200+ member target.

## Current State (v1.1.1)

- **Stack:** Express 4.21 + in-memory stores, Vite + Vanilla JS dashboard (dark luxury theme), Cloudflare Workers/Pages target
- **Dashboard views:** 8 (Home, Members, PSN Health, KPI Tracker, Training, Alerts, Funnel OS, Orders, Leads)
- **Tier-1 modules:** M1-M4 with 7 lessons each, activities, reflection prompts, habit checklists, assessment blocks (`content/tier1/`)
- **Tier-2 content files exist:** `content/tier2/m5-recruitment.json` through `m8-coaching.json` with 14 lessons each, but lessons contain only `day`, `title`, `objective`, `content` -- no exercises, quizzes, or activities
- **Agents:** onboardingBot (4-week state machine, daily nudges, graduation check), trainingOps (curriculum assignment, progress tracking, reminders), alertEngine (9-state PSN classifier, webhook dispatch)
- **Seed data:** 10 members across 2 PSNs (`scripts/seed.js`), 14-day habit/KPI history
- **Auth:** JWT with 4 roles (Member=1, PSN Leader=2, Core Leader=3, Admin=4), PII encryption, PDPA audit log
- **Integrations:** Zalo webhook handler (stubbed for production), Sentry, Redis (config present)
- **Tests:** 23 test files, coverage ~76%, E2E smoke tests passing
- **No referral system, no PSN team endpoint, no rate limiting, no weekly report automation**

---

## Tasks (Detailed, Copy-Pasteable)

### T-026: Tier-2 Curriculum Enrichment (M5-M8 Exercises + Quizzes)

**Status:** New
**Estimate:** 8h

**Context:** The JSON files already exist at `content/tier2/m5-recruitment.json` through `content/tier2/m8-coaching.json`. Each has 14 lessons with only basic fields (`day`, `title`, `objective`, `content`). Tier-1 lessons have richer structure: `activity` (with `title`, `description`, `steps`), `reflection_prompts`, `habit_checklist`. Some Tier-1 modules have top-level `assessment` blocks.

**Work items:**

1. Add `activity` blocks to each of the 56 lessons (4 modules x 14 days) following Tier-1 pattern:
   ```json
   "activity": {
     "title": "...",
     "description": "...",
     "steps": ["step1", "step2", ...]
   }
   ```

2. Add `reflection_prompts` array to each lesson (2-3 prompts per lesson)

3. Add `habit_checklist` to relevant lessons (daily action items for MLM)

4. Add top-level `assessment` block to each module JSON (scoring rubric + graduation threshold):
   - M5: Recruitment metrics assessment (contacts made, conversion rate, members onboarded)
   - M6: DISC assessment + coaching practice scoring
   - M7: PSN health management scenarios
   - M8: GROW model coaching conversation evaluation

5. Add `resources` and `next_steps` blocks to each module (following m1-mindset.json pattern)

6. Content must be Vietnamese, MLM-contextualized for Droppii (Medicine 3.0 / healthspan positioning)

**Files to modify:**
- `content/tier2/m5-recruitment.json`
- `content/tier2/m6-disc.json`
- `content/tier2/m7-psn-management.json`
- `content/tier2/m8-coaching.json`

**Validation:**
- All 56 lessons have `activity` with `title`, `description`, `steps`
- All modules have `assessment` block with scoring criteria
- JSON parsing succeeds for all 4 files
- Existing test suite still passes (no schema breaking changes -- additions only)

---

### T-027: PSN Leader Dashboard

**Status:** New
**Estimate:** 6h

**Context:** The dashboard currently has 8 views. PSN Leaders need a dedicated team view showing their PSN members, coaching schedule, and progress. The existing `trainingOps.js` already has `getTraineesByPSN(psnId)`. The `server.js` already has `computePSNMetrics(psnId)`.

**Backend work:**

1. Create `src/api/psn-team.js` with endpoints:
   - `GET /api/psn/:psnId/team` -- List all members in a PSN with roles, tiers, status, last activity (requires PSN Leader role for own PSN, Core Leader+ for any PSN)
   - `GET /api/psn/:psnId/team/progress` -- Aggregated training progress for PSN members (reuse `getTraineesByPSN`)
   - `GET /api/psn/:psnId/team/at-risk` -- At-risk members (low habit score, inactive 2+ days)
   - `POST /api/psn/:psnId/coaching/schedule` -- Schedule a coaching session (date, member, topic)
   - `GET /api/psn/:psnId/coaching/sessions` -- List scheduled coaching sessions

2. Add coaching session store (in-memory) in the new file, following existing patterns

3. Register routes in `src/server.js`:
   ```js
   const psnTeamRoutes = require('./api/psn-team');
   app.use('/api/psn', psnTeamRoutes);
   ```

4. Apply `requirePSNLeader` middleware for PSN-scoped endpoints

**Frontend work:**

5. Create `src/dashboard/psn-team-view.js` following existing view patterns (members-table.js, training-view.js)

6. Add route `/psn-team` to `src/dashboard/router.js`:
   ```js
   this.routes.set('/psn-team', () => this.renderPSNTeamPage());
   ```

7. Add nav link in `src/dashboard/index.html`:
   ```html
   <a href="#/psn-team" class="nav-link" data-route="/psn-team">
     <span class="nav-icon">👥</span>
     Đội PSN
   </a>
   ```

8. View sections: Member table with tier badges, coaching calendar, at-risk alerts, progress charts

**Files to create:**
- `src/api/psn-team.js`
- `src/dashboard/psn-team-view.js`

**Files to modify:**
- `src/server.js` (add route registration)
- `src/dashboard/router.js` (add route)
- `src/dashboard/index.html` (add nav link)

---

### T-028: Referral API + Reward Automation

**Status:** New
**Estimate:** 5h

**Context:** The funnel system (`models/lead.js`, `models/order.js`) tracks leads and orders with commission fields. The order model already has `commissionVND` and `commissionRate`. The referral system connects member-to-member recruitment tracking to the existing commission model.

**Backend work:**

1. Create `src/models/referral.js`:
   ```js
   // Referral record: { id, referrerId, referredId, referredName, status, referredAt, convertedAt, orderId, commissionEarned }
   // In-memory store following existing model patterns
   ```

2. Create `src/api/referrals.js` with endpoints:
   - `POST /api/referrals` -- Track a new referral (referrerId, referredId/name, referredPhone)
   - `GET /api/referrals/:memberId` -- Get referral tree for a member (direct + indirect)
   - `GET /api/referrals/:memberId/stats` -- Summary: total referrals, conversion rate, total commission earned
   - `GET /api/referrals/leaderboard` -- Top referrers across all PSNs

3. Create `src/automation/rewardEngine.js`:
   - On order creation (hook into existing order flow), check if the buyer was referred
   - Calculate commission: 10% of order value to direct referrer, 5% to upline (referrer's referrer)
   - Update referral record with `commissionEarned`
   - Generate Zalo notification payload for commission earned

4. Register in `src/server.js`:
   ```js
   const referralRoutes = require('./api/referrals');
   app.use('/api/referrals', referralRoutes);
   ```

**Files to create:**
- `src/models/referral.js`
- `src/api/referrals.js`
- `src/automation/rewardEngine.js`

**Files to modify:**
- `src/server.js` (register routes, hook reward engine into order flow)

---

### T-029: Tier-2 Training Integration

**Status:** New
**Estimate:** 4h

**Context:** The `trainingOps.js` CURRICULUM object already defines Tier-2 modules (M5-M8) with names and durations, but tier-1 modules have `content_file` references while tier-2 modules do not. The graduation criteria in `trainingOps.js` are simple (`completed_days >= total_days`). The `onboardingBot.js` has a 4-week Tier-1 state machine but no Tier-2 equivalent.

**Work items:**

1. Add `content_file` references to Tier-2 CURRICULUM modules in `trainingOps.js`:
   ```js
   { id: 'M5', name: 'Recruitment Funnel', days: 14, content_file: 'content/tier2/m5-recruitment.json' }
   // ... same for M6, M7, M8
   ```

2. Enhance graduation criteria for Tier-2 in `trainingOps.js` `updateProgress()`:
   - Tier-1 graduation: 3 orders + habit >= 4 for 21 days (existing)
   - Tier-2 graduation: complete all 4 modules + recruit 3 new members + maintain habit >= 4 for 14 days
   - Add `recruit_count` field to training record

3. Update `assignCurriculum()` to accept tier transition (when a Tier-1 graduate advances to Tier-2):
   - Auto-create Tier-2 training record
   - Link to Tier-1 completion record

4. Extend `getProgress()` to show tier-appropriate metrics:
   - Tier-1: orders, habit score, days completed
   - Tier-2: orders, recruits, habit score, coaching sessions conducted

5. Update graduation check endpoint in `server.js` (`/api/training/graduation-check/:memberId`) to handle Tier-2 criteria

6. Add tests in `test/ops-jest.test.js` for Tier-2 curriculum assignment and graduation

**Files to modify:**
- `src/agents/trainingOps.js`
- `src/server.js` (graduation-check endpoint update)
- `test/ops-jest.test.js` (add Tier-2 test cases)

---

### T-030: Weekly Business Review Automation

**Status:** New
**Estimate:** 4h

**Context:** The server already has cron-style scheduling via `setInterval` in `server.js` (PSN health eval every 4h, funnel auto-transition every 4h, stalled leads every 4h). The Zalo webhook handler exists at `src/integrations/zalo-webhook.js`. The alert engine has `getAlertSummary()` and PSN health classifier.

**Backend work:**

1. Create `src/automation/weeklyReview.js`:
   - `generateWeeklyReport()` -- Collects:
     - PSN health trends (compare current vs last week for each PSN)
     - Top performers (by habit score, orders, recruits)
     - At-risk members (declining habit scores, inactive)
     - Funnel metrics (leads converted, new referrals)
     - Revenue summary (total orders, average order value)
   - Returns structured report object

2. Create `src/automation/reportScheduler.js`:
   - `scheduleWeeklyReview()` -- Registers a cron for Monday 6:00 AM (Vietnam time, UTC+7)
   - Uses `setInterval` pattern already established in server.js
   - Calculates ms until next Monday 6AM, sets first timer, then weekly interval

3. Add API endpoints in `server.js`:
   - `GET /api/reports/weekly` -- Get latest weekly report (on-demand generation)
   - `POST /api/reports/weekly/generate` -- Force-generate report (Admin only)
   - `GET /api/reports/weekly/history` -- List past reports (last 12 weeks)

4. Zalo notification summary:
   - After report generation, call `zalo-webhook.js` `sendMessage()` to each PSN Leader with their PSN's summary
   - Rate-limit: max 5 Zalo sends per report cycle to avoid API limits

5. Register scheduler in `server.js` alongside existing crons (inside `require.main === module` block)

**Files to create:**
- `src/automation/weeklyReview.js`
- `src/automation/reportScheduler.js`

**Files to modify:**
- `src/server.js` (register routes + start scheduler)

---

### T-031: Member Limit & PSN Scaling

**Status:** New
**Estimate:** 6h

**Context:** The seed script (`scripts/seed.js`) hardcodes 10 members across 2 PSNs. The `src/models/member.js` `createSeededMembers()` has 4 core members. The in-memory store is a plain array.

**Work items:**

1. Expand `scripts/seed.js` for 50 members across 5 PSNs:
   - 5 PSNs with realistic Vietnamese names and locations (Hanoi, HCMC, Da Nang, Can Tho, Hai Phong)
   - 10 members per PSN: 1 PSN Leader (tier 3), 2-3 tier 2, 6-7 tier 1
   - 30-day habit/KPI history (up from 14 days)
   - Buddy pairings for all members
   - Referral relationships between members

2. Update `src/models/member.js` `createSeededMembers()` to include 50 members (or remove in favor of seed script)

3. Load testing validation:
   - Create `test/load-test.js` that simulates 50 concurrent API requests
   - Verify all endpoints respond within 200ms (existing success criterion from roadmap)
   - Test memory usage stays under 100MB with 50 members

4. Database migration strategy document:
   - Create `docs/06_MIGRATION_PLAN.md` outlining the path from in-memory to D1 or PostgreSQL
   - Identify tables needed: members, training_records, orders, referrals, coaching_sessions, audit_logs
   - Recommend D1 (already in architecture doc) as primary, with PostgreSQL fallback for complex queries
   - Define migration triggers: >100 members OR production deployment

5. Update seed script to be idempotent (check existing data before inserting)

**Files to modify:**
- `scripts/seed.js`
- `src/models/member.js`

**Files to create:**
- `test/load-test.js`
- `docs/06_MIGRATION_PLAN.md`

---

### T-032: Security & Compliance

**Status:** New
**Estimate:** 4h

**Context:** The audit log (`src/utils/auditLog.js`) already logs PII access. The encryption utility exists. The `requireRole.js` middleware handles auth. No rate limiting exists. Input validation is minimal (basic null checks in route handlers).

**Work items:**

1. PDPA audit trail hardening:
   - Integrate `auditLog.js` `logPIIAccess()` into all member data access points (members.js API, psn-team.js, referrals.js)
   - Add audit log query endpoint: `GET /api/audit/logs` (Admin only)
   - Ensure all PII field access (email, phone) triggers audit log entry

2. Rate limiting:
   - Create `src/middleware/rateLimit.js` using in-memory sliding window counter
   - Apply limits:
     - Auth endpoints: 5 req/min per IP
     - Member CRUD: 30 req/min per user
     - Training endpoints: 60 req/min per user
     - Report endpoints: 10 req/min per user
   - Add `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

3. Input validation hardening:
   - Create `src/middleware/validate.js` with common validators:
     - `validateBody(schema)` -- JSON body field presence and type checks
     - `validateParams(paramNames)` -- URL parameter sanitization
     - `sanitizeString(str)` -- Strip HTML/script tags
   - Apply to all POST/PUT/PATCH endpoints

4. Add security headers middleware:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security` (for production)

**Files to create:**
- `src/middleware/rateLimit.js`
- `src/middleware/validate.js`

**Files to modify:**
- `src/server.js` (register middleware)
- `src/api/members.js` (add audit logging + validation)
- `src/api/psn-team.js` (add audit logging + validation) [from T-027]
- `src/api/referrals.js` (add audit logging + validation) [from T-028]

---

## Dependencies

```
T-026 (Content Enrichment)         ── no dependencies ──> independent
T-027 (PSN Leader Dashboard)       ── no dependencies ──> independent
T-028 (Referral API + Rewards)     ── no dependencies ──> independent

T-029 (Tier-2 Training Integration) ── depends on: T-026 (content files must be enriched first)
                                       (needs content_file references and assessment blocks)

T-030 (Weekly Business Review)     ── depends on: T-027, T-028
                                       (report needs PSN team data + referral metrics)

T-031 (Member Limit & Scaling)     ── depends on: T-028
                                       (seed script must include referral relationships)

T-032 (Security & Compliance)      ── depends on: T-027, T-028
                                       (audit logging + validation for new endpoints)
```

**Execution order:**
```
Phase A (parallel):  T-026, T-027, T-028
Phase B (parallel):  T-029, T-031
Phase C (parallel):  T-030, T-032
```

Phase A tasks are fully independent and can run simultaneously. Phase B requires Phase A completion. Phase C requires Phase B.

---

## Files to Create/Modify

### New Files (10)
| File | Task | Purpose |
|------|------|---------|
| `src/api/psn-team.js` | T-027 | PSN Leader team endpoints |
| `src/dashboard/psn-team-view.js` | T-027 | PSN Leader dashboard view |
| `src/models/referral.js` | T-028 | Referral data model |
| `src/api/referrals.js` | T-028 | Referral API endpoints |
| `src/automation/rewardEngine.js` | T-028 | Commission calculation |
| `src/automation/weeklyReview.js` | T-030 | Report generation logic |
| `src/automation/reportScheduler.js` | T-030 | Monday 6AM cron scheduler |
| `src/middleware/rateLimit.js` | T-032 | Rate limiting middleware |
| `src/middleware/validate.js` | T-032 | Input validation middleware |
| `test/load-test.js` | T-031 | Load testing for 50 members |

### Modified Files (12)
| File | Task | Change |
|------|------|--------|
| `content/tier2/m5-recruitment.json` | T-026 | Add exercises, quizzes, activities |
| `content/tier2/m6-disc.json` | T-026 | Add exercises, quizzes, activities |
| `content/tier2/m7-psn-management.json` | T-026 | Add exercises, quizzes, activities |
| `content/tier2/m8-coaching.json` | T-026 | Add exercises, quizzes, activities |
| `src/agents/trainingOps.js` | T-029 | Tier-2 content_file refs, graduation criteria |
| `src/server.js` | T-027, T-028, T-030, T-032 | Register routes, middleware, scheduler |
| `src/dashboard/router.js` | T-027 | Add /psn-team route |
| `src/dashboard/index.html` | T-027 | Add nav link for PSN Team |
| `src/models/member.js` | T-031 | Update seed data |
| `scripts/seed.js` | T-031 | 50 members, 5 PSNs |
| `test/ops-jest.test.js` | T-029 | Tier-2 training tests |
| `docs/06_MIGRATION_PLAN.md` | T-031 | Database migration strategy |

### New Documentation (1)
| File | Task |
|------|------|
| `docs/06_MIGRATION_PLAN.md` | T-031 |

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| In-memory store does not scale beyond ~100 members | High | T-031 includes migration plan; implement D1 before Phase 3 |
| Tier-2 content quality requires SME review | Medium | Content files already exist; enrichment adds exercises/quizzes that can be reviewed iteratively |
| Zalo OA API rate limits for mass notifications | Medium | T-030 limits to 5 sends per report cycle; implement exponential backoff in rewardEngine |
| In-memory coaching sessions lost on restart | Low | Coaching sessions in T-027 are ephemeral; real persistence deferred to D1 migration |
| Load test may reveal Express memory issues at 50 members | Low | In-memory store is fast for reads; risk is memory footprint, not latency |
| New endpoints need auth middleware before merge | Medium | T-032 applies rate limiting + validation; all new endpoints must use requireAuth |

---

## Unresolved Questions

1. **Commission rates:** 10%/5% split in T-028 is a placeholder -- need business confirmation
2. **Zalo OA production token:** Still pending from pilot phase; required for T-030 notifications
3. **D1 vs PostgreSQL:** T-031 migration plan recommends D1 but final choice depends on Cloudflare Workers CPU limits with 50+ members
4. **Coaching session data model:** T-027 uses simple in-memory store; should coaching notes be PDPA-audited (contains member discussions)?
5. **Tier-2 graduation requires 3 recruits:** Need to confirm if this is the correct threshold or if it should be tier-adjustable
