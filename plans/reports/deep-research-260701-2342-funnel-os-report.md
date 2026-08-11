# Deep Research: Funnel OS trong SALE MLM
**Date:** 2026-07-01 | **Project:** SALE MLM | **Researcher:** Claude Opus 4.8

---

## 1. Tổng quan

Funnel OS là **hệ thống bán hàng tự động** cho Droppii (MLM/CTV hợp pháp). Giải quyết vấn đề: 70% Tân Binh bỏ cuộc trong 4 tuần đầu vì không có "bữa sáng để ăn" và không biết upsell sau chốt đơn đầu tiên.

**Triết lý cốt lõi:** "Bát chiến tự nhiên thành" (Tôn Tư) — khách tự chốt qua khai vấn, không bán bằng áp lực.

---

## 2. Kiến trúc 3 tầng

```
┌─────────────────────────────────────────┐
│  Tầng Business                          │
│  ├── apps/funnel (customer-facing)      │
│  └── apps/academy (CTV-facing)          │
├─────────────────────────────────────────┤
│  Tầng Agentic                           │
│  └── 11 AI Agents share LLM gateway     │
├─────────────────────────────────────────┤
│  Tầng Data                              │
│  └── Cloudflare D1 (1 database chung)   │
└─────────────────────────────────────────┘
```

---

## 3. 5 Level + L4 Bridge

| Level | Tên | Mô tả | Sản phẩm |
|-------|-----|-------|----------|
| L0 | Mất Hoa | Lead Magnet | Free, đổi info |
| L1 | Tin | Trial <1tr | Tripwire 150k-1tr |
| L2 | Hành | Health Active 30-45 ngày | Core Offer >=3tr |
| L3 | Hoa | Combo chuyển hóa 90+ ngày | Downsell + Continuity |
| L4 | Hợp | Partner CTV | Recruitment + Academy |

**L4 Bridge:** Customer → CTV → Academy Tier 1 (Mindset Reset)

---

## 4. 11 AI Agents

**Funnel side (5):**
1. L0 Discovery Coach — Quiz + qualification
2. Funnel Whisperer — Nurture sequences
3. Product Matchmaker — L2/L3 product matching
4. Health Companion — L2 health tracking
5. Partner Scout — L4 CTV recruitment

**Academy side (6):**
1. Training Coach — Curriculum delivery
2. Retention Guard — Churn detection
3. Campaign Cmdr — Flash campaigns
4. PSN Analyst — Network analysis
5. Content Engine — Content generation
6. Onboarding Bot — 4-week onboarding

---

## 5. Database Schema (27+ bảng)

### 5 bảng cũ (Academy)
- `users` — Members/CTV
- `habits` — Daily habit check-ins
- `lessons` — Training modules
- `progress` — Training progress
- `points` — Gamification
- `posts` — Community
- `alerts` — Alert rules + log

### 8 bảng mới (Funnel OS)
- `leads` — Customer leads từ quiz/landing
- `products` — Product catalog
- `orders` — Customer orders
- `order_items` — Line items
- `coach_sessions` — AI Coach 1:1 sessions
- `journey_events` — Customer journey milestones
- `health_progress` — L2/L3 health tracking
- `ctv_invites` — L4 CTV invitation tracking

### 12 bảng bổ sung (Playbook Integration)
- `content_pieces` — Content theo channel/funnel_tier
- `myths` — Niềm tin sai + sự thật KB
- `frameworks` — Framework độc quyền registry
- `case_studies` — Customer success stories
- `product_progressions` — Ladder step mapping
- `offers` — Offer stack + bonuses + guarantee
- `subscriptions` — Continuity billing
- `sequences` — Automation sequences
- `sequence_runs` — Sequence execution tracking
- `personas` — Buyer personas
- `gifts` — Gift matrix
- `referrals` / `rewards` — Referral engine

### Bảng Content Warfare
- `content_campaigns` — Video campaign tracking (UTM → lead → sale attribution)

---

## 6. 4 Playbook Integration

### PB1 — Phiếu Marketing 4 tầng (AIDA cải tiến)
- Lạnh (Attention): Empathy + pain finder → Content Engine + Landing pages
- Ấm (Interest): Giáo dục có định hướng → Prompt template + myths KB
- Nóng (Desire): Framework độc quyền + case study → frameworks table + case_studies
- Ban (Action): Offer stack + scarcity + guarantee → offers table + UI OfferStack

### PB2 — Phiếu Sản phẩm 5 tầng
| Tầng | Sản phẩm | Giá |
|------|----------|-----|
| Lead Magnet | Free, đổi info | 0 |
| Tripwire | Trải nghiệm, hoàn vốn QC | 150k-1tr |
| Core Offer | Sản phẩm chính | >=3tr, margin >=60% |
| Downsell | Lưới đó | tripwire < downsell < core |
| Continuity | Subscription monthly | monthly/quarterly |

### PB3 — Quy trình bán hàng 8 bước
1. Lead Magnet + Form + Scoring
2. Hẹn gặp (3 chiến thuật)
3. GAINS (Goals/Pain/Need)
4. SPIN + BANT + COI
5. FAB + PICA + Bridge
6. 4C Closing + 7 Tactics
7. L.A.E.C. + Pre-emptive Objection
8. Handoff → PB4

### PB4 — 5B Customer Care
- BAN (Tặng) — Trao giá trị
- BAN (Trao đổi) — GAINS lần 2
- BAN (Thân thiện) — Customer Success
- BAN (Chào hàng mới) — Upsell/Cross-sell
- BAM (Bám sát) — Loyalty + Referral

---

## 7. Content Warfare Engine

### Kiến trúc
```
KINGCONTENT (Spy) + SOPHIA AI (Production) → Funnel OS (Conversion)
```

### 5 Sub-niches Droppii
| # | Sub-niche | Content Format | Sản phẩm | Funnel |
|---|-----------|---------------|----------|--------|
| 1 | Detox & Giảm cân | "3 loại nước detox tại nhà" | TPCN tiêu hóa | L0→L1 |
| 2 | Skincare tự nhiên | "5 thói quen da đẹp không mỹ phẩm" | Collagen, Vitamin E | L0→L1 |
| 3 | Béo sạch / Gia dụng xanh | "Review máy lọc nước ion kiềm" | Gia dụng xanh | L1→L2 |
| 4 | Before/After 30 ngày | "Thử thách 30 ngày uống collagen" | Gói Health Active 30 ngày | L2→L3 |
| 5 | Câu chuyện chuyển hóa | "Từ khách hàng thành đối tác" | CTV recruitment | L3→L4 |

### Daily Pipeline (80 phút/ngày)
```
06:00 — Spy Scout: KC trending API → top 5 topics
07:00 — Script Writer: 3 scripts (30s/45s/60s) với CTA Droppii
08:00 — Video Dispatcher: Submit video job lên KC/Sophia
10:00 — Distributor: Schedule lên 5-10 Fanpages + Zalo OA
24/7 — Funnel OS: Video viewer → Quiz → L0 → L1 → L2 → L3 → L4
```

### Revenue Projection
- Tháng 1: 90 videos × 1,000 views × 2% CTR × 50% completion × 8% L0→L1 × 500k = **36M VND**
- Tháng 3: 300 videos × 5,000 views × 3% CTR × 60% completion × 10% L0→L1 × 500k = **1.35B VND**

---

## 8. Integration với hệ thống khác

### Training OS (Academy)
- 1 JWT secret, `persona` claim phân vai ('ctv' | 'customer')
- Chung 1 bảng `users`, thêm cột `journey_level`, `persona`, `zalo_id`, `ltv_segment`
- 11 agents share `packages/ai-agents` — LLM gateway, rate-limit, prompt registry
- Filter `posts.audience='public'` cho testimonial wall

### Commission/Referral
- `orders.ctv_referrer_id` + `commission_pct` — lưu sẵn để xuất báo cáo Bộ Công Thương
- CTV incentive: 30-50% hoa hồng mỗi đơn
- Leader không phải bỏ tiền cọc trước — hoa hồng từ đơn hàng

### KPI Dashboard
- `/admin/funnel-360` với 4 nhóm KPI:
  1. **Đầu phiếu:** Leads/ngày, CPL, Source mix
  2. **Chuyển hóa:** L0→L1, L1→L2, L2→L3, L3→L4 rates
  3. **Doanh thu & LTV:** AOV theo level, LTV theo cohort, Revenue mix
  4. **Sức khỏe hệ thống:** AI session duration, Drop-off heatmap, NPS, Retention Guard alerts

### PSN (Personal Sales Network)
- Funnel OS cung cấp lead WARM cho PSN thay vì cold-call
- CTV nhận handoff từ Funnel khi `intent_score >= 70`
- L4 bridge: Customer → CTV → Academy Tier 1 (Mindset Reset)

---

## 9. Source Code thực tế

### Worker chính
- **File:** `workers/academy-api.ts` (~1033 lines)
- **Status:** FULLY MIGRATED từ Express.js sang native fetch API
- **Tech:** Cloudflare Workers + D1 + KV

### Training Ops Agent
- **File:** `src/agents/trainingOps.js` (~323 lines)
- **Features:** assignCurriculum, updateProgress, scheduleReminder, getTraineesNeedingAttention

### Content Tier Files
- `content/tier1/` — M1-M4 (Tân Binh → Chiến Binh)
- `content/tier2/` — M5-M8 (Chiến Binh → Chỉ Huy)
- `content/tier3/` — M9-M12 (Chỉ Huy → Tướng Quân)

---

## 10. Timeline & Investment

### MVP 6 tuần: ~24.75 triệu VND
### OPEX pilot 50 lead/tháng: ~4.13 triệu/tháng
### Break-even: Tháng 3, ROI 12 tháng kỳ vọng 4-6x

### 4 tuần (PHASE1-OPTIMAL, 1.5 triệu):
- G0 (Day 0): Pre-flight decisions
- G1 (Day 7): Foundation tech ready
- G2 (Day 14): AI Coach tone OK
- G3 (Day 17): Soft launch, >=1 paying friend
- G4 (Day 21): >=3 đơn từ 50 contacts
- G5 (Day 28): >=7 đơn tổng
- G6 (Day 28+): Demo Day, decision Phase 2

**Cash positive từ G4 (cuối tuần 3).**

---

## 11. Tổng công việc cần làm

| Phase | Công việc | Giờ | Ngày thực |
|-------|-----------|-----|-----------|
| Core Funnel OS | 18 tasks | ~24h | 7-9 ngày |
| Playbook gap | 15 tasks | ~17h | 4-5 ngày |
| Content Warfare | 6 tasks | ~6h | 2 ngày |
| **Tổng** | **39 tasks** | **~47h** | **12-15 ngày** |

**Critical path:** T-026 → T-027 → T-035 → T-040 → T-043

---

## 12. Files quan trọng trong repo

```
plans/customer-funnel-os/
├── MASTER-PLAN.md                    # Kế hoạch tổng (27 bảng, 5 level, 11 agents)
├── DEMO-MVP.md                       # MVP 5 bảng, 6 tuần, ~24.75 triệu
├── PHASE1-OPTIMAL.md                 # Ultra lean 1.5 triệu, 4 tuần, 50 lead
├── PLAYBOOK-INTEGRATION-MAP.md       # 4 playbook → 12 bảng mới
├── content-warfare-blueprint.md      # Content engine + KingContent integration
└── customer-brief-droppii-leader-2026-05-19.md

content/
├── tier1/  # M1-M4 (Tân Binh → Chiến Binh)
├── tier2/  # M5-M8 (Chiến Binh → Chỉ Huy)
└── tier3/  # M9-M12 (Chỉ Huy → Tướng Quân)

workers/academy-api.ts    # Cloudflare Worker — FULLY MIGRATED
src/agents/trainingOps.js # Training Ops Agent
d1/schema.sql             # Database schema
```

---

## 13. Kết luận

Funnel OS là hệ thống bán hàng tự động hoàn chỉnh với:
- 5 level funnel + L4 bridge CTV
- 11 AI agents
- 27+ database tables
- 4 playbook integration
- Content warfare engine
- Commission/referral tracking
- PSN handoff integration

**Trạng thái hiện tại:** Đã có worker API chạy production, commission engine, dashboard. Cần build tiếp: funnel landing pages, quiz, lead capture, coach chat UI, checkout flow.

**Unresolved questions:**
- PayOS integration chưa có (T-035)
- Zalo OA webhook chưa có (T-033)
- Content Warfare agents chưa build (T-044CW → T-049CW)
- Cron trigger cần setup manual trong Cloudflare dashboard
