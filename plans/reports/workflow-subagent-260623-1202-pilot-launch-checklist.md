# T-025 Pilot Launch Checklist — Droppii Sales Training OS

**Created:** 2026-06-23 | **Target:** Soft Launch G3 (Day 15-17) | **Status:** Pre-flight

---

## 1. TECHNICAL READINESS

### 1.1 Deployment & Infrastructure

- [ ] **Cloudflare Workers** - Backend API deployed to production namespace
  - Verify `wrangler.toml` production config
  - Test `GET /health` endpoint returns 200 with all subsystems green
  - Confirm D1 database binding active
  - Check KV namespace bindings for sessions/cache

- [ ] **Cloudflare Pages** - Frontend dashboard deployed
  - `src/dashboard/` built and deployed to `app.hivewarfare.vn`
  - Landing page `/quiz/healthspan-gia-dinh` accessible
  - AI Coach UI `/coach/[id]` accessible with SSE streaming
  - Admin dashboard `/admin` accessible with auth

- [ ] **Domain & SSL** - Production domain configured
  - `app.hivewarfare.vn` DNS points to Cloudflare Pages
  - SSL certificate active (auto-managed by CF)
  - CORS headers configured for allowed origins only
  - HSTS enabled (security header)

- [ ] **Environment Variables** - All secrets configured via `wrangler secret put`
  - `JWT_SECRET` (32+ random chars)
  - `PASSWORD_SALT` (16+ random chars)
  - `ADMIN_TOKEN` (strong bearer token for admin API)
  - `ALLOWED_ORIGIN` (frontend URL)
  - `SENTRY_DSN` (if error tracking enabled)
  - `ZALO_OA_ACCESS_TOKEN` (for Zalo DM)
  - `RESEND_API_KEY` (for email notifications)
  - `PAYOS_CLIENT_ID`, `PAYOS_CLIENT_SECRET`, `PAYOS_API_KEY`

### 1.2 Monitoring & Observability

- [ ] **Health Check Endpoints**
  - `GET /health` returns JSON with subsystem status (DB, cache, external APIs)
  - `GET /api/monitoring/errors` returns last 20 errors (admin only)
  - `GET /api/monitoring/summary` returns aggregated error stats
  - All endpoints authenticated or IP-restricted

- [ ] **Error Tracking**
  - Sentry SDK integrated and configured (optional but recommended)
  - Error alerts routed to Zalo webhook for critical failures
  - Daily error digest email to tech lead

- [ ] **Performance Monitoring**
  - API response time tracking (p95 < 500ms for key endpoints)
  - Database query performance baseline measured
  - Memory usage monitoring ( Workers have 128MB limit)
  - Rate limiting configured (if needed for pilot scale)

- [ ] **Logging**
  - Structured JSON logs for API requests (timestamp, method, path, status, duration)
  - Audit log for member data changes (who, what, when)
  - Payment webhook events logged with signature verification status
  - Logs aggregated (e.g., Datadog, Logflare) or tail-able via `wrangler tail`

### 1.3 Backup & Recovery

- [ ] **Database Backup Strategy**
  - D1 automatic backups configured (Cloudflare daily)
  - Manual backup procedure documented: `wrangler d1 export`
  - Test restore procedure on staging DB
  - Backup retention policy: 30 days

- [ ] **Data Export Capability**
  - `GET /api/members/export` endpoint (admin only) exports all members as CSV/JSON
  - `GET /api/orders/export` endpoint exports orders
  - Habit/KPI data export available for analysis

- [ ] **Disaster Recovery Runbook**
  - Documented steps to restore from backup within 2 hours
  - Emergency contact list (tech lead, CTO, CEO)
  - Rollback procedures (see Section 5)

### 1.4 Security & Compliance

- [ ] **Authentication & Authorization**
  - JWT tokens signed with strong secret, 24h expiry
  - Role-based access: Admin, PSN Leader, Member
  - Admin routes protected by `ADMIN_TOKEN` header
  - Rate limiting on login endpoint (5 attempts/15min per IP)

- [ ] **Data Protection (PDPA)**
  - Member data encrypted at rest in D1 (Cloudflare default)
  - HTTPS enforced (Cloudflare SSL)
  - No sensitive data logged in plaintext
  - Data deletion endpoint `DELETE /api/members/:id` works (soft delete)
  - Privacy policy accessible in dashboard

- [ ] **API Security**
  - Input validation on all endpoints (zod or similar)
  - SQL injection prevention (D1 parameterized queries)
  - CORS configured to allow only production frontend origin
  - No debug endpoints exposed in production

---

## 2. DATA READINESS

### 2.1 Seed Data & Test Content

- [ ] **Tier 1 Training Content** (from `content/tier1/`)
  - Module M1 (Mindset) - 7 days content loaded
  - Module M2 (Product) - 7 days content loaded
  - Module M3 (Connect) - 7 days content loaded
  - Module M4 (Close) - 7 days content loaded
  - All content approved by CEO/Subject Matter Expert
  - Content formatted correctly (markdown or JSON schema)

- [ ] **Product Catalog** (from `docs/g0-pilot-mockup-data.md`)
  - L1 product (DROP-FAMILY-01) price 590K confirmed in system
  - COGS data recorded for margin calculations
  - L2 and L3 product definitions ready (even if not offered yet)
  - Product photos uploaded to CDN or Cloudflare R2

- [ ] **Pilot User Accounts**
  - 10 pilot users from Friend/Family group seeded in D1
  - Each has: name, phone, Zalo ID, email (optional), PSN assignment
  - Passwords set to temporary values, communicated to users
  - Admin accounts created: CEO, CTO, PSN Leaders

- [ ] **Mock Orders** (if testing payment flow)
  - 3-5 test orders in PENDING status
  - 1-2 test orders in PAID status
  - Order codes follow format: `DROP-YYYYMMDD-XXX`

### 2.2 D1 Database Schema

- [ ] **Migrations Applied**
  - `migrations/0001_initial_schema.sql` applied to production D1
  - All tables exist: members, habits, kpi_records, orders, onboarding_sessions, alerts
  - Indexes created for performance: `member_id`, `date`, `psn_id`
  - Database constraints validated

- [ ] **Schema Versioning**
  - Current schema version recorded in `docs/system-architecture.md`
  - Any pending migrations documented with rollback SQL
  - Migration testing completed on staging

- [ ] **Data Validation**
  - No orphaned records (foreign key integrity)
  - Unique constraints enforced (email, phone)
  - Date formats consistent (ISO 8601)
  - Numeric fields within expected ranges

### 2.3 External Data Integrations

- [ ] **Zalo OA Integration**
  - Zalo OA app created and approved
  - Access token obtained (valid 30 days)
  - Token refresh mechanism implemented
  - `/api/zalo/send` endpoint tested with 1-2 messages
  - Zalo group join link generated and working

- [ ] **Payment Gateway (PAYOS)**
  - PAYOS merchant account created and verified
  - API credentials (Client ID, Client Secret, API Key) configured
  - Webhook endpoint `https://app.hivewarfare.vn/api/payments/payos-webhook` registered
  - Test payment link created and checkout flow tested end-to-end
  - Signature verification code validated

- [ ] **Email Service (Resend)**
  - Resend API key configured
  - `from` address verified (noreply@droppii.vn or similar)
  - Email templates: order confirmation, ebook delivery, AI Coach welcome
  - Test email sent and received

---

## 3. PROCESS READINESS

### 3.1 User Onboarding Flow

- [ ] **Lead Capture → Quiz → Account Creation**
  - Landing page `/quiz/healthspan-gia-dinh` accessible publicly
  - Quiz loads and submits without errors
  - Lead data inserted into D1 `members` table
  - Automatic account creation: temporary password emailed/SMS
  - First login redirects to onboarding checklist

- [ ] **Onboarding Bot (T-016)**
  - `/api/onboarding/start` endpoint working
  - Daily nudges generated via `/api/onboarding/{id}/nudge`
  - Onboarding progress tracked in `onboarding_sessions` table
  - 7-day onboarding flow content reviewed and approved
  - Advance mechanism `POST /api/onboarding/{id}/advance` tested

- [ ] **Habit Tracker Integration**
  - `POST /api/habits/checkin` working
  - Streak calculation `GET /api/habits/streak/:member_id` accurate
  - Daily snapshot `POST /api/habits/snapshot` runs via cron (if implemented)
  - Habit data displayed in dashboard correctly

### 3.2 Support & Escalation Procedures

- [ ] **Support Channels**
  - Zalo group for pilot users created and invite link working
  - CTV assigned to respond within 2 hours during pilot
  - Escalation path documented: CTV → PSN Leader → CTO → CEO
  - Emergency hotline number communicated (CEO's mobile)

- [ ] **Issue Triage Process**
  - Bug reports captured in GitHub Issues or Notion
  - Severity levels defined: P0 (system down), P1 (core feature broken), P2 (minor issue)
  - Response SLA: P0 (1 hour), P1 (4 hours), P2 (24 hours)
  - Daily standup at 5PM to review pilot issues

- [ ] **User Communication Templates**
  - Welcome email/SMS with login credentials
  - FAQ document covering: password reset, quiz retake, Zalo group access
  - Troubleshooting guide for common issues (login, quiz not loading)
  - Feedback survey sent on Day 7 and Day 28

### 3.3 Admin & Operational Procedures

- [ ] **Admin Dashboard Access**
  - Admin users can log in and view all members
  - Member list paginated and filterable (by PSN, status, signup date)
  - KPI panel showing aggregate metrics (quiz completions, session counts, revenue)
  - Alerts inbox working: `GET /api/alerts/summary`
  - PSN health view: `POST /api/analytics/psn-health` with accurate scores

- [ ] **Daily Operations Runbook**
  - Morning check at 5AM: health check, active sessions, trainees needing attention
  - Evening review: habit streaks, KPI rollup, PSN health
  - Daily nudges sent automatically via cron or manual trigger
  - Log review: check error logs every 4 hours

- [ ] **Manual Override Capabilities**
  - Admin can reset member password
  - Admin can manually advance onboarding day
  - Admin can delete member data (GDPR/PDPA compliance)
  - Admin can trigger manual alert evaluation

---

## 4. SUCCESS METRICS & KPIs

### 4.1 Primary KPIs (Pilot Phase - 4 Weeks)

| Metric | Target | Measurement | Source |
|--------|--------|-------------|--------|
| **Quiz completions** | 100-150 | Count of members who completed all 5 questions | `members.quiz_completed_at` |
| **AI Coach sessions** | 30-50 | Count of unique sessions ≥5 minutes | `training_sessions` |
| **L1 orders** | 4-8 | Count of PAID orders for DROP-FAMILY-01 | `orders` table |
| **Revenue** | 2.5-5M VND | Sum of `orders.amount` for pilot period | `orders` table |
| **CAC L1** | ≤250K | (Total spend) / (L1 orders) | Finance calc |
| **Net profit** | +1-3.5M | Revenue - COGS - ad spend | Finance calc |

### 4.2 Leading Indicators (Weekly Tracking)

- **Week 1 (G3 Soft Launch)**
  - 10 friend/family accounts created
  - ≥7 complete quiz (70%+ conversion)
  - ≥5 start AI Coach session
  - ≥3 complete full session (≥10 min)
  - Feedback score ≥6/10 on experience

- **Week 2 (G4 Wave 1)**
  - 50 contacts reached (20 old customers + 30 CTV)
  - ≥20 quiz completions (cumulative)
  - ≥15 AI Coach sessions (cumulative)
  - ≥2 L1 orders
  - Zalo group active: ≥20 messages posted

- **Week 3 (G5 Wave 2)**
  - Remaining 20 CTV contacted
  - ≥35 quiz completions (cumulative)
  - ≥25 AI Coach sessions (cumulative)
  - ≥5 L1 orders (cumulative)
  - ≥1 L2 upsell attempt

- **Week 4 (Demo Day)**
  - ≥100 quiz completions (stretch target)
  - ≥50 AI Coach sessions (stretch target)
  - ≥8 L1 orders (stretch target)
  - ≥3 CTV recruited for Phase 2

### 4.3 Cohort Conversion Targets

| Cohort | Size | Quiz Rate | Session Rate | Purchase Rate |
|--------|------|-----------|--------------|---------------|
| Friend/Family (G3) | 10 | 70% | 50% | 30% |
| Old Customers (G4) | 50 | 40% | 30% | 6% |
| CTV (G5) | 20 | 60% | 40% | 15% |
| **Overall** | **80** | **~45%** | **~35%** | **~10%** |

### 4.4 Quality Metrics

- **AI Coach Satisfaction** (survey after session): ≥7/10 average
- **Tone Compliance**: 100% of AI responses pass guardrail regex (no "trị/chữa/khỏi")
- **System Uptime**: ≥99% during pilot (Cloudflare SLA is 100%, but track outages)
- **API Response Time**: p95 < 500ms for key endpoints
- **Error Rate**: <1% of requests return 5xx errors
- **Data Accuracy**: KPI calculations match manual audit within 2%

### 4.5 Tracking Dashboard

- [ ] Real-time metrics dashboard accessible to CTO/CEO
  - Built-in admin panel OR external (Metabase, Google Data Studio)
  - Updated hourly or real-time via API
  - Shows: daily signups, quiz completions, sessions, orders, revenue

- [ ] Daily email report at 8AM to stakeholders
  - Yesterday's metrics vs targets
  - Week-to-date cumulative
  - Top 3 issues requiring attention

---

## 5. ROLLBACK PLAN

### 5.1 Rollback Triggers (When to Abort Pilot)

- **Critical (Immediate rollback)**
  - Payment system broken: webhook not firing or signature verification failing
  - Data breach: unauthorized access to member PII detected
  - Compliance violation: medical claims detected in AI responses or marketing
  - System outage: >2 hours downtime within first 48 hours

- **Warning (Mitigate within 24 hours, else rollback)**
  - Quiz completion rate < 30% (technical friction)
  - AI Coach satisfaction < 5/10 for ≥3 consecutive users
  - Error rate > 5% sustained over 6 hours
  - Any single user reports severe bug blocking usage

- **Manual rollback (CEO/CTO decision)**
  - Revenue target not met after 3 weeks with no path to recovery
  - Major negative feedback from >50% of pilot users
  - External factor (e.g., Zalo blocks OA account)

### 5.2 Rollback Procedures

#### Scenario A: Data Issues (Corrupt/Missing Data)
```
1. Stop all frontend traffic (disable landing page)
2. Restore D1 from backup (wrangler d1 restore)
3. Verify data integrity (sample queries)
4. Communicate to pilot users: "System maintenance, resume in 24h"
5. Resume frontend
```

#### Scenario B: Payment Flow Broken
```
1. Disable payment links (remove PAYOS integration or set to test mode)
2. Keep training platform accessible (free mode)
3. Manual order processing via bank transfer if needed
4. Fix payment issue in staging, validate with test transaction
5. Re-enable payment in production
```

#### Scenario C: AI Coach Misbehaving
```
1. Disable AI Coach endpoint (return maintenance message)
2. Fall back to static content (pre-written lessons in content/tier1/)
3. Collect user feedback on static content
4. Debug AI integration (Haiku API, prompts, guardrails)
5. Re-enable with fixes and monitor first 10 sessions
```

#### Scenario D: Zalo Integration Failed
```
1. Switch to manual DM via Zalo OA app (human CTV)
2. Pause automated sequences
3. Debug Zalo API (token expired? webhook URL mismatch?)
4. Regenerate token, re-register webhook
5. Resume automated sequences with monitoring
```

### 5.3 Communication Plan

- **Internal Team**
  - Rollback decision announced in WhatsApp/Slack group immediately
  - Root cause documented within 2 hours
  - Fix timeline communicated within 4 hours
  - Daily updates until resolved

- **Pilot Users**
  - If outage >2 hours: send Zalo message explaining maintenance
  - If payment issue: "temporary technical difficulty, we'll notify when resolved"
  - If major bug: "we're improving the platform, new version coming soon"
  - Never disclose technical details to users, maintain confidence

- **Stakeholders (CEO/Board)**
  - Immediate notification if rollback triggered
  - Daily status updates with ETA
  - Post-mortem report within 3 days

---

## 6. PILOT USER RECRUITMENT CRITERIA

### 6.1 Friend/Family Group (G3 - 10 people)

**Selection Priority:**
1. **High readiness** (⭐⭐⭐⭐⭐): Actively interested in health/wellness
2. **Technical ability**: Comfortable with smartphone apps, Zalo
3. **Feedback quality**: Willing to provide detailed feedback
4. **Representative persona**: Matches target customer (mother, 30-50, family health decision-maker)
5. **Low risk**: Not likely to share negative publicly if issues arise

**Recruitment Process:**
- [ ] CEO identifies 10 candidates from personal network
- [ ] Each receives personal invitation via phone call (not just DM)
- [ ] Incentive: Free L1 product + AI Coach access (value ~1M)
- [ ] Commitment: 15-30 minutes/day for 7 days + feedback survey
- [ ] NDA signed (optional, but recommended)

**Success Threshold for G3:**
- ≥70% complete quiz
- ≥50% complete AI Coach session
- ≥3 orders (590K each) from this group

### 6.2 Old Customers (G4 - 50 contacts)

**Selection Criteria:**
- Past purchasers of Droppii products (any time)
- Last purchase: 1-6 months ago (recent enough to remember brand)
- Lifetime orders: ≥2 (proven buyer)
- Not currently active (no purchase in last 2 months)
- Have Zalo account (verified)

**Segmentation:**
- Tier A (top 20): 5+ orders, last purchase <2 months → Warm outreach
- Tier B (next 30): 2-4 orders, last purchase 2-6 months → Standard outreach

**Recruitment Process:**
- [ ] Extract list from order history (SQL query on orders table)
- [ ] CTV or CEO sends personalized DM (Template 2)
- [ ] Incentive: 10% discount on L1 product + free AI Coach
- [ ] Target: ≥6% conversion to L1 order (3 orders from 50 contacts)

**Success Threshold for G4:**
- ≥20 quiz completions (40%)
- ≥15 AI Coach sessions (30%)
- ≥3 L1 orders (6% conversion)

### 6.3 CTV Group (G5 - 20 contacts)

**Selection Criteria:**
- Current or former CTV (Commissioned Trainee/Vendor)
- Capability: M2, M3, or M4 level in training hierarchy
- Active or semi-active (logged in within last 30 days)
- Not currently hitting targets (has capacity for more)
- Has Zalo and phone number

**Recruitment Process:**
- [ ] Query `members` table where `role = 'CTV'` and `status = 'active'`
- [ ] CEO or senior leader sends recruitment DM (Template 3)
- [ ] Incentive: Higher commission rate for pilot period (20% vs 15%), exclusive training
- [ ] Ask: Try AI Coach, then recruit 2-3 new CTV from their network
- [ ] Track recruitment separately (new CTV signups attributed to pilot CTV)

**Success Threshold for G5:**
- ≥60% quiz completion (12 people)
- ≥40% AI Coach sessions (8 people)
- ≥3 CTV recruited from this group
- ≥3 L1 orders from recruited CTV network

### 6.4 Screening Checklist (Per Pilot User)

Before adding to pilot:
- [ ] Has Zalo account and active in last 7 days
- [ ] Phone number verified (SMS test sent)
- [ ] Agrees to feedback survey at Day 7 and Day 28
- [ ] Not related to team (avoid bias in feedback)
- [ ] Fits target persona (30-50 years, health-conscious, family-oriented)
- [ ] Commits to 15-30 min/day usage for first week

---

## 7. PRE-FLIGHT CHECKLIST (Day -3 to Day 0)

### 7.3 Days Before Launch (Day -3)

- [ ] All technical readiness items (Section 1) verified and signed off by CTO
- [ ] Database seeded with pilot users (10 + 50 + 20 = 80 total)
- [ ] Zalo OA access token obtained and tested
- [ ] PAYOS sandbox test transaction completed successfully
- [ ] Resend test email delivered to inbox (not spam)
- [ ] Admin dashboard demo run with CEO/PSN Leaders
- [ ] Error monitoring (Sentry) configured and test error logged

### 7.2 Days Before Launch (Day -2)

- [ ] Landing page QA: test quiz on mobile (iOS/Android), desktop
- [ ] All links working: quiz → account creation → dashboard → AI Coach
- [ ] Email deliverability tested (check spam score)
- [ ] SMS gateway tested (if using for OTP/login)
- [ ] Backup procedures validated: D1 export/import on staging
- [ ] Rollback plan reviewed with CTO and CEO

### 7.1 Day Before Launch (Day -1)

- [ ] Final content review: training modules, product descriptions, compliance disclaimers
- [ ] Admin training session: CTV/PSN Leaders trained on dashboard, support procedures
- [ ] Pilot user onboarding pack prepared (email template, Zalo group invite, FAQ)
- [ ] Monitoring dashboard populated with pilot users
- [ ] Communication plan locked: who sends what, when, via which channel
- [ ] Emergency contacts list distributed to all team members

### 7.0 Launch Day (Day 0)

- [ ] Morning: All hands (15 min) - review plan, roles, success metrics
- [ ] 9AM: Send first batch (Friend/Family, n=5)
- [ ] 12PM: Check delivery status, send follow-up to non-responders
- [ ] 3PM: Send second batch (Friend/Family, n=5)
- [ ] 5PM: Daily standup - review first-day metrics, issues, adjustments
- [ ] Evening: Check system health, error logs, user activity

---

## 8. DAILY CHECKLIST (During Pilot)

### Morning (5AM - 8AM)

- [ ] Health check: `curl https://app.hivewarfare.vn/health`
- [ ] Error log review: `wrangler tail` or dashboard
- [ ] Active onboarding sessions count
- [ ] Trainees needing attention (KPI below threshold)
- [ ] Alert summary: any PSN health issues (Cửu Địa state <40)

### Midday (12PM - 2PM)

- [ ] Quiz completion count (today so far)
- [ ] AI Coach session count
- [ ] Orders placed (if any)
- [ ] Zalo group activity level
- [ ] User feedback collected (if any)
- [ ] Error rate monitoring

### Evening (8PM - 10PM)

- [ ] Habit streak data for today
- [ ] KPI rollup for pilot users
- [ ] PSN health recalculation
- [ ] Daily nudges sent (if manual)
- [ ] Tomorrow's plan: who to contact next
- [ ] Issue triage summary

---

## 9. POST-PILOT HANDOFF

### Day 28 (Demo Day)

- [ ] All metrics compiled and analyzed
- [ ] Success criteria evaluated: pass/fail per KPI
- [ ] User feedback synthesized (quotes, patterns)
- [ ] Technical review: performance, bugs, stability
- [ ] Financial review: actual vs budget, ROI calculation

### Decision Points

- **Go (Phase 2)**: ≥5/8 KPIs met, positive user feedback, system stable
  - Scale to 200-500 users (Wave 3)
  - Add L2/L3 products
  - Expand to new PSNs/territories

- **Pivot**: 3-4 KPIs met, but major issues identified
  - Fix top 3 issues (technical or UX)
  - Refine AI Coach prompts/content
  - Retest with 20-30 users before full launch

- **Stop**: <3 KPIs met, fundamental issues with product/market fit
  - Archive pilot data for analysis
  - Re-evaluate product hypothesis
  - Consider significant pivot or shutdown

### Documentation Update (If Go)

- [ ] Update `docs/project-roadmap.md` with Phase 2 timeline
- [ ] Update `docs/project-changelog.md` with pilot results
- [ ] Update `docs/system-architecture.md` with production learnings
- [ ] Create `docs/pilot-postmortem.md` with full analysis

---

## 10. UNRESOLVED QUESTIONS

- **Budget tracking**: Who owns daily spend tracking against the 1.5M budget? (Finance?)
- **Payment reconciliation**: How to match PAYOS webhook orders with D1 records if webhook fails? (Manual audit process needed)
- **CTV commission tracking**: How to calculate and payout commissions during pilot? (Separate spreadsheet or module?)
- **Zalo API rate limits**: What are Zalo's sending limits and will we hit them with 80 users × sequences? (Need to check Zalo docs)
- **AI Coach cost**: Claude Haiku cost per session - budget impact? (Estimate: 100 sessions × ~100 tokens = minimal, but verify)
- **Data migration**: If pilot successful, how to migrate from D1 to PostgreSQL for scale? (Plan for Phase 2)
- **Mobile app vs web**: Should AI Coach be native mobile app? (User feedback in pilot will inform)

---

**Report:** `/Users/mac/mekong-cli/SALE MLM/plans/reports/workflow-subagent-260623-1202-pilot-launch-checklist.md`

**Next:** Review with CTO and CEO, assign owners, track completion in project board.