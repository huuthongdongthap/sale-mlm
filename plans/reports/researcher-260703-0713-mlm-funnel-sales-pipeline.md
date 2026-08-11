# MLM Funnel & Sales Pipeline — Research Report

**Date:** 2026-07-03 | **Project:** SALE MLM (Hive Warfare Academy / droppii-training-os)

---

## 1. Droppii Platform Features (Source: droppii.com + docs/)

### Core Model
- Vietnamese dropshipping marketplace — 4,000 SKUs, 130,000+ sellers, 150K orders/month
- Two partner types: **Resellers** (sell products) and **Suppliers** (provide products)
- Up to 35% margin for business partners
- Local fulfillment: Hanoi + Ho Chi Minh City warehouses
- Mobile-first design for domestic Vietnam market

### Platform Automation
- AI assistant for product suggestions and promotional text generation (<1s)
- Packaging, warehousing, logistics fully managed by platform
- Payment reconciliation, 63-province nationwide coverage
- Women entrepreneur programs, Shark Tank partnerships for recruitment credibility

### Key Takeaway for SALE MLM
Droppii is the **upstream platform** for this training OS. The training system (`droppii-training-os`) is a separate system that teaches Droppii distributors (CTV = Cộng Tác Viên) to sell more effectively. The funnel in this project is for training-to-distributor conversion, not product sales directly.

---

## 2. Project's Existing Funnel Model (Source: src/models/lead.js)

The codebase already implements a **5-tier product-aligned funnel**:

| Level | Label | Product SKU | Price | Target Segment |
|-------|-------|-------------|-------|----------------|
| 0 | Lead Magnet | DROP-EBOOK-01 | Free | 100% leads → AI quiz + ebook |
| 1 | Trial | DROP-FAMILY-01 | 590K VND | Warm network, first buyer |
| 2 | Health Active | DROP-ACTIVE-30 | 3.5M VND | L1 buyers ready to upgrade |
| 3 | Combo | DROP-TRANSFORM-90 | 9.5M VND | L2 buyers, 90-day commitment |
| 4 | CTV Partner | CTV contract | N/A | L3 evangelists → become sellers |

**Lead statuses:** `new → contacted → qualified → converted → lost → archived`

**Transition rules:**
- Linear progression (plus promotions)
- Demotion allowed: tier >=2 can demote to trial (level 1)
- Cannot revert to lead magnet (level 0)
- Each transition logs `fromTier`, `toTier`, `actorId`, timestamp

**Sources tracked:** organic, referral, social, zalo, event, ads

**Quiz integration:** Leads carry `quizAnswers` (DISC + pain-points questions on the landing page)

---

## 3. MLM Terminology & Structure (Source: Wikipedia + company.json)

### Compensation Model
- **Binary/Unilevel commission:** Two revenue streams — direct sales commissions + wholesale commissions from downline
- Earnings = f(own volume + downline volume)
- Organizational hierarchy: upline → distributor → downline
- Pyramid-shaped compensation model (legal MLM, not pyramid scheme — key distinction for compliance)

### Recruitment Funnel (from company.json + onboardingBot.js)
1. **Lead Magnet** → Free ebook, AI quiz
2. **Trial** → First product purchase (590K VND entry point)
3. **Health Active** → Repeat buyer, 30-day program
4. **Combo** → Premium tier, 90-day commitment
5. **CTV Partner** → Become a seller (the MLM recruitment moment)

---

## 4. Training Tier Architecture (Source: company.json + system-architecture.md)

### Tier 1: Tân Binh → Chiến Binh (4 weeks)
- **M1:** Mindset Reset — 5AM Club + Kaizen journaling
- **M2:** Product Mastery — Droppii ecosystem
- **M3:** Connect Engine — 15 connects/day
- **M4:** First Close — Follow-up mastery
- **Graduation:** 3 orders + habit score ≥ 4/6 for 3 consecutive weeks

### Tier 2: Chiến Binh → Chỉ Huy (8 weeks)
- **M5:** Recruitment Funnel — Online/offline lead generation
- **M6:** Leader DNA — DISC personality coaching
- **M7:** PSN Management — Group formation + metrics
- **M8:** Coaching Conversations — 1:1 framework + buddy system
- **Graduation:** PSN score ≥ 65 + team size ≥ 5 active members

### Tier 3: Chỉ Huy → Tướng Quân (12 weeks)
- **M9-M12:** Sun Tzu Applied, Campaign Warfare, Data Commander, Legacy Builder
- **Graduation:** 3+ active PSN lines + 75% 90-day retention

### Distribution Network (PSN) Model
- **PSN** = Phân Số Nhà (a grouping unit — like a "team" or "pod")
- 9-state health classifier (Cửu Địa): Tử Địa (Critical, <25) → Tán Địa (Elite, 95+)
- Weighted scoring: retention_30d (25%) + retention_90d (15%) + revenue (20%) + activity (20%) + habit (10%) + connects (10%)

---

## 5. Pipeline Management Best Practices (Source: system-architecture.md + funnel-view.js)

### Funnel OS Analytics Already Implemented
- `GET /api/analytics/funnel` — tier-level counts, conversion rates, revenue breakdown
- Visual funnel rendering with tier badges and conversion percentages
- Revenue aggregation per tier

### Habit Scoring (6-Point Daily System)
- 5AM wakeup: 2 pts
- Connects (15+ = 2 pts, 10-14 = 1 pt)
- Zoom attend: 1 pt
- Kaizen journal: 1 pt
- **Max: 6 pts/day**
- Streak tracking with day-continuity enforcement
- Tier-1 graduation: score ≥ 4/6 for 21 consecutive days

### Alert Rules Engine (6 default rules)
1. retention_30d < 0.30 → critical
2. habit_avg < 2.5 → warning (auto_buddy)
3. activity_ratio < 0.40 → warning (notify_leader)
4. revenue_delta < -0.20 → warning (schedule_review)
5. connect_avg < 8 → info
6. psn_health_score <= 25 → critical (escalate)

### Referral System (src/features/referral.js)
- HIVE-{memberId} referral code
- 5 reward tiers: 1 referral (50K) → 5 referrals (500K) → 10 referrals (1M) → 20 referrals (3M)
- Auto-reward detection on new member activation

---

## 6. Vietnamese Market Specifics

### Product Positioning
- **TPCN** (Thực Phẩm Chức Năng) = Functional Food — NOT medicine (legal distinction mandatory)
- Medicine 3.0 framing: proactive, preventive, healthspan (not disease treatment)
- Compliance: must always include TPCN disclaimer
- Forbidden words: "trị bệnh", "chữa khỏi", "điều trị", "đảm bảo 100%"

### Payment
- PAYOS gateway (Napas 247) — QR code + bank transfer
- Free: no setup fee, no per-transaction fee
- Direct to bank account (no withdraw needed)
- Webhook real-time for order confirmation
- Evolution: manual bank transfer (G3 soft launch) → PAYOS (G4-Wave1) → PAYOS + Zalo Mini App (G5+)

### Communication Channels
- **Zalo** = primary DM channel (not WhatsApp in Vietnam)
- Zalo OA (Official Account) for 24h window messaging
- Zalo DM sequence: Day 0 → Day 1 → Day 3 (value) → Day 5 (CTA) → Day 7 → Day 10 (offer) → Day 14 (final)
- Social: Facebook + Zalo groups for lead gen
- "Chị em thân tình" tone: friendly, NOT pushy ("em"/"chị" pronouns)

### Pricing Psychology (VND)
- L1 entry: 590K (under 1M — impulse buy range)
- L2: 3.5M (3-5M range for committed buyers)
- L3: 9.5M (premium, 90-day commitment)
- CAC target: ≤250K VND per L1 customer
- Commission margins: 46-53% on product tiers

---

## 7. Automation Patterns for Funnel Stage Transitions

### Already Implemented
1. **Zalo DM sequence engine** (`zalo-auto-sales/src/sequence-engine.ts`) — cron-triggered, every 1 minute
2. **Onboarding bot** — daily nudges via Zalo-ready payload, auto-advances through 4-week curriculum
3. **Training ops agent** — auto-assigns curriculum, tracks progress, identifies trainees needing attention
4. **PSN health evaluator** — weighted 9-state classifier with automatic alert firing
5. **Referral activation** — auto-rewards when new member completes onboarding
6. **Habit streak auto-calculation** — O(1) with latest record lookup

### Automation Opportunities (from plan.md)
1. **Commission calculation engine** — binary pair + unilevel override, nightly cron
2. **KV caching layer** — member profiles, alert rules, training curriculum (Cloudflare KV, 1M reads/day free)
3. **Leaderboard cron** — precompute instead of on-demand
4. **PSN health snapshots** — nightly historical tracking
5. **Campaign Commander agent** — deploy flash campaigns when lead velocity drops

---

## 8. Key Metrics & Targets

| Metric | Target |
|--------|--------|
| CAC L1 | ≤250K VND |
| L1 orders (4 weeks) | 4-8 orders |
| L2 orders | 1-2 (nice to have) |
| Quiz completion rate | ≥70% |
| Coach session completion | ≥50% of leads |
| Tier-1 graduation | 70% habit completion rate |
| PSN retention (90d) | 75% |
| LTV:CAC ratio | Target ≥3:1 (current model shows 25:1 at scale) |

---

## 9. Architectural Fit Assessment

### Current Stack Alignment
- **Frontend:** Vite + Vanilla JS (dark luxury theme) — 5 views: Members, KPI, PSN, Alerts, Training
- **Backend:** Cloudflare Workers + D1 (SQLite) — stateless, edge-native
- **Integrations:** Zalo OA webhook, Sentry, Anthropic Claude (future AI coach)
- **PDPA compliance:** PII encrypted (AES-GCM), audit trail for all PII access

### Maturity Assessment for MLM Funnel
| Component | Status | Maturity |
|-----------|--------|----------|
| Lead model (5-tier) | Implemented | Production |
| Funnel analytics view | Implemented | Production |
| Onboarding bot (4-week) | Implemented | Production |
| Habit tracking (6-point) | Implemented | Production |
| Referral/reward system | Implemented | Alpha |
| Commission engine | Planned (Wave 2) | Not built |
| Campaign automation | Planned (agent) | Not built |
| Zalo DM sequence | Code exists | Partial |
| PSN health 9-state | Implemented | Production |
| Zalo Mini App | Phase 2 | Not started |

---

## 10. Ranked Recommendations

### Short-term (Build now)
1. **Commission engine** (Wave 2 in plan.md) — binary pair + unilevel override, nightly cron. This is the revenue proof path.
2. **Zalo webhook wiring** (identified as gap in system-architecture.md) — the DM sequence engine exists but Zalo bot isn't connected.
3. **KV caching layer** (Wave 2, free tier) — 5-50x faster reads for member profiles and training data.

### Medium-term (After revenue proof)
4. **Zalo Mini App** — quiz + AI coach inside Zalo (reduces friction)
5. **Campaign Commander agent** — auto-deploy flash campaigns when lead velocity drops
6. **PSN health historical snapshots** — nightly cron for trend analysis

### Long-term (Scale phase)
7. **Multi-PSN strategy tools** (Tier 3 — general rank)
8. **Franchise training model** (Q1 2027 OKR)

---

## Unresolved Questions
1. **Legal structure:** Is this a legal MLM under Vietnamese law? Pyramid scheme regulations in Vietnam are strict — needs legal review before public launch.
2. **Droppii relationship:** Is this training OS officially sanctioned by Droppii company or a third-party tool? Affects data access and go-to-market.
3. **Commission rates:** What are the actual commission percentages between Droppii and CTVs? Not found in research.
4. **Zalo OA setup:** No active Zalo OA credentials found — entire DM pipeline is blocked until this is wired.
5. **Payment flow (G0):** PAYOS credentials mocked — CEO needs to provide real credentials for pilot.
