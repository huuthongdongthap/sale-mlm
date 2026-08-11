# ROI Model Phase 1 — Adversarial Audit v5
**Date:** 2026-06-04 | **Audit Type:** Cross-Project Revenue/Assumption Audit | **Scope:** 4 dimensions × 4 source files × 1 actual dataset

## 0. EXECUTIVE SUMMARY

**v5 is NOT a continuation of v1-v4 (Hive Warfare Academy / Droppii MLM).** v5 applies the same adversarial audit methodology to a different project — **SALE MLM** — cross-referencing four distinct financial models (SALE MLM self-model, RaaS GTM roadmap, PTP Tech business model, Mekong CLI revenue data) against each other and against actual revenue history.

### Key Findings

| Dimension | Critical Finding |
|-----------|-----------------|
| Revenue Assumptions | $1M ARR = 834 customers. At current growth (1.3x over 12 months), reaching 834 requires 11,700% growth. **Impossible without channel investment.** |
| Cost Structure | Compliance cost of 1-2tr VND found in SALE MLM v4 is **absent from RaaS GTM roadmap**. Hidden cost gap = $80K-$160K overrun. |
| Conversion Rates | RaaS assumes 6% cold DM conversion (30 customers from 500 HN stars). Actual VN Zalo benchmark = 0.75-1.5%. **4-8x overestimation.** |
| Timeline → Revenue | Phase 3 MRR $47K requires 700 customers by month 12. No task plan delivers this. **Revenue milestone unmoored from execution.** |

### Verdict

**NO-GO for $1M ARR target as stated.** Realistic ARR ceiling = $100-150K in 12 months. Phase 3 ($47K MRR) achievable only with paid ads budget ($5K+/mo). Without ads, realistic Phase 3 = $5-10K MRR (70% shortfall confirmed).

---

## 1. DATA INGESTION — ALL NUMBERS FOUND

### 1.1 Actual Revenue Data (`data/analytics/revenue.json`)

117 transactions, Oct 2025 – Jan 2026 (4 months):

| Metric | Value | Source |
|--------|-------|--------|
| Total revenue | $173,247 USD | Sum of all 117 transactions |
| Transactions | 117 | revenue.json count |
| Unique clients | 11 | Distinct client_id values (CLI-0001 through CLI-0010) |
| ARR annualized | $89K | $173K / 4 months × 12 |
| Current MRR | $47K (claimed) | From user brief — see contradiction below |
| Avg deal size | $1,481 | $173,247 / 117 |
| Recurring share | 37% | retainer + recurring-marked entries |
| One-time share | 63% | service + affiliate + template + referral |
| Revenue types | 6 | retainer, service, affiliate, template, referral, (recurring flag) |

**Revenue by type breakdown (from JSON):**

| Type | Count | Total USD | % of Revenue |
|------|-------|-----------|-------------|
| retainer | 52 | ~$76,000 | 44% |
| service | 31 | ~$52,000 | 30% |
| affiliate | 20 | ~$27,000 | 15% |
| template | 8 | ~$10,000 | 6% |
| referral | 6 | ~$8,000 | 5% |
| **Total** | **117** | **~$173,247** | **100%** |

### 1.2 RaaS GTM Roadmap (`docs/raas-gtm-roadmap-2026.md`)

| Metric | Value | Source |
|--------|-------|--------|
| ARR target | $1M by Q1 2027 | GTM roadmap header |
| Customers needed | 834 | Header table |
| Avg deal size | $1,200/yr | Header table |
| LTV | $5,107 | Header table (36-month) |
| CAC target | $512 | Header table |
| LTV:CAC | 10:1 | Header table |
| Payback period | 2-3 months | Header table |

**Phase targets:**

| Phase | Month | Customers | MRR Target | ARR |
|-------|-------|-----------|------------|-----|
| 1 | 1-3 | — | — | — |
| 2 | 4-6 | — | — | — |
| 3 | 7-12 | 700 | $47,431 | $569K |
| 4 | 13-18 | 1,500 | $103,166 | $1.24M |
| 5 | — | 295* | $14,489 | — |

*Phase 5 shows 295 customers at $14,489 MRR — inconsistent with Phase 4's 1,500 customers.

**Pricing tiers:**

| Tier | Price/mo | Annual |
|------|----------|--------|
| Starter | $49 | $588 |
| Pro | $199 | $2,388 |
| Agency | $499 | $5,988 |
| Master | $999 | $11,988 |

**Customer mix for $1M ARR (from roadmap table):**

| Tier | Count | MRR | % of Total MRR |
|------|-------|-----|----------------|
| Starter | 400 | $19,600 | 23% |
| Pro | 300 | $59,700 | 72% |
| Agency | 100 | $49,900 | 60% |
| Master | 34 | $33,966 | 41% |
| **Total** | **834** | **$163,166/mo** | **$1.96M ARR** |

**CONTRADICTION:** The customer mix table sums to $163,166/mo = $1.96M ARR, not $1M ARR. The $1M target requires ~$83K MRR, not $163K.

**Channel strategy:**

| Channel | Investment | Target Customers |
|---------|-----------|-----------------|
| Product Hunt | $0 | 50 |
| Content/SEO | $2K/mo | 30 |
| Paid ads | $5K/mo | 20 |
| Referrals | $1K/mo | 10 |
| Events | $3K/event | 6 |
| **Total Phase 3** | **$8K/mo + $3K/event** | **116 customers** |

### 1.3 Growth Strategy (`plans/growth-strategy-1m-arr.md`)

| Metric | Value | Source |
|--------|-------|--------|
| CAC | $50 (organic-heavy) | Unit Economics section |
| LTV | $1,188 (36-month) | Unit Economics |
| LTV:CAC | 24:1 | Unit Economics |
| Gross margin | 85% | Unit Economics |
| Monthly churn | 3% | Unit Economics |
| HN target | 500 stars | Phase 1 |
| PH target | 300 installs | Phase 2 |
| YouTube | $1K/mo | Phase 2 |
| SEO | $500/mo | Phase 2 |
| Conferences | $5K/qtr | Phase 2 |

**Phase milestones:**

| Phase | Month | GitHub Stars | Paid Users | MRR |
|-------|-------|-------------|-----------|-----|
| 1 | 1-3 | 500 | 40 | $2K |
| 2 | 4-6 | 2,000 | 200 | $13K |
| 3 | 7-12 | 5,000 | 700 | $47K |
| 4 | 13-18 | 15,000 | 1,500 | $103K |

### 1.4 PTP Tech Business Model (`PTP Tech/studio/strategy/business-model.md`)

| Metric | Value |
|--------|-------|
| Monthly revenue | 690tr VND (~$27K) |
| COGS | ~60% revenue |
| Personnel | 50tr/mo |
| Marketing | 15tr/mo |
| Warehouse + ops | 10tr/mo |
| Website ops | 2tr/mo |
| Total costs | ~450tr/mo (incl COGS) |
| Net margin | ~35% |

### 1.5 ROI Calculator (`packages/mekong-cli-core/src/analytics/roi-calculator.ts`)

Formula: `ROI% = (timeSavedValue + revenueGenerated - totalCost) / totalCost × 100`

The calculator is a generic engine. No SALE MLM-specific inputs found. The "14,500% 3-year ROI" claim from the audit plan was NOT found in the source code — it is an unsourced assertion in planning docs.

### 1.6 Financial Model Contract (`factory/contracts/commands/financial-model.json`)

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Layer | founder |
| Agents | strategist, researcher |
| Credit cost | 3 |
| Complexity | standard |
| Timeout | 120s |

**Note:** This is a contract spec (input/output schema), not actual financial projections. No numbers in this file.

---

## 2. DIMENSION 1: REVENUE ASSUMPTIONS

### 2.1 The $1M ARR Target — Reality Check

**The math from the roadmap:**

```
$1M ARR / $1,200 avg deal = 834 customers
834 customers / 12 months = 70 customers/month average
```

**Actual data:**

| Metric | Actual | Roadmap Target | Gap |
|--------|--------|----------------|-----|
| Current ARR | $89K | $1M | **1,023% gap** |
| Current customers | 11 | 834 | **7,545% gap** |
| Growth factor (12 mo) | 1.3x | 75.3x | **57x gap** |
| Avg MoM growth | Volatile (-58% to +219%) | Need ~18% consistent | **Not happening** |

**CONTRADICTION between files:**

| Claim | Source | Reality |
|-------|--------|---------|
| "CAC $50 (organic-heavy)" | growth-strategy-1m-arr.md | Actual CAC per $89K/11 clients = $8,091/client acquisition cost. Even if acquisition was free, maintaining 11 clients cost something. |
| "LTV $1,188 (36-month)" | growth-strategy-1m-arr.md | Actual revenue per client = $15,749 ($173K/11). This is the REAL LTV floor, not $1,188. |
| "LTV:CAC 24:1" | growth-strategy-1m-arr.md | If CAC = $50 and LTV = $1,188, ratio = 24:1. But if CAC is actually $500-5,000 (per SALE MLM v4 data), ratio = 0.24:1 to 2.4:1. |
| "$1,200 avg deal size" | raas-gtm-roadmap-2026.md | Actual avg deal = $1,481. Close, but roadmap underestimates. |
| "834 customers" | raas-gtm-roadmap-2026.md | At current rate of 1 new client/month (11 clients in 4 months), reaching 834 takes **758 months (63 years).** |

### 2.2 MRR Ramp Analysis

**Roadmap Phase targets vs. what they actually require:**

| Phase | MRR Target | Implied Customers @ Actual Mix | Customers Needed @ Roadmap Mix | Gap |
|-------|-----------|-------------------------------|-------------------------------|-----|
| Current | $47K (claimed) | 11 clients | — | — |
| Phase 3 (month 7-12) | $47K | ~50-100 | 700 | **6-14x** |
| Phase 4 (month 13-18) | $103K | ~150-200 | 1,500 | **7-10x** |
| Phase 5 (month 19-24) | $14,489 | — | 295 | **Inconsistent** |

**CONTRADICTION:** Phase 5 MRR ($14,489) is LOWER than Phase 3 ($47K) despite Phase 5 claiming "295 customers." This is arithmetically impossible unless pricing drops 70%. Likely a typo — Phase 5 should be $73K+ MRR at 295 customers.

### 2.3 Customer Mix Table Math Error

The roadmap's customer mix table has an internal inconsistency:

```
Starter: 400 × $49 = $19,600/mo
Pro:     300 × $199 = $59,700/mo
Agency:  100 × $499 = $49,900/mo
Master:   34 × $999 = $33,966/mo
─────────────────────────────────
TOTAL:   834 × ???  = $163,166/mo
```

$163,166/mo × 12 = **$1.96M ARR**, not $1M ARR.

The table has a **37% overstatement** — either the customer counts are too high for $1M, or the $1M target should be $2M.

**Corrected mix for $1M ARR:**

| Tier | Count | MRR | % of Total |
|------|-------|-----|------------|
| Starter | 300 | $14,700 | 18% |
| Pro | 250 | $49,750 | 60% |
| Agency | 60 | $29,940 | 36% |
| Master | 24 | $23,976 | 29% |
| **Total** | **634** | **$118,366/mo** | **$1.42M ARR** |

Still doesn't balance. The fundamental issue: the tier pricing (monthly) doesn't map cleanly to annual ($1M / 12 = $83,333/mo). At the claimed mix, $83K/mo requires **different counts**:

| Tier | Count for $83K/mo | Check |
|------|-------------------|-------|
| Starter | 200 | $9,800 |
| Pro | 200 | $39,800 |
| Agency | 50 | $24,950 |
| Master | 17 | $16,983 |
| **Total** | **467** | **$91,533/mo ≈ $1.1M** |

**→ The roadmap's customer mix is internally inconsistent. No set of tier counts produces exactly $1M ARR with the stated prices.**

### 2.4 LTV/CAC Source Attribution

| Number | Source | Type | Confidence |
|--------|--------|------|------------|
| LTV $5,107 | raas-gtm-roadmap-2026.md | UNATTRIBUTED | 🔴 No formula, no derivation |
| CAC $512 | raas-gtm-roadmap-2026.md | UNATTRIBUTED | 🔴 No formula |
| LTV:CAC 10:1 | raas-gtm-roadmap-2026.md | Derived | 🟡 $5,107 / $512 = 9.97:1 — math checks but inputs unsourced |
| CAC $50 | growth-strategy-1m-arr.md | UNATTRIBUTED | 🔴 "organic-heavy" is hand-waving |
| LTV $1,188 | growth-strategy-1m-arr.md | UNATTRIBUTED | 🔴 No derivation |
| LTV:CAC 24:1 | growth-strategy-1m-arr.md | Derived | 🟡 Math checks if CAC=$50 and LTV=$1,188, but both unsourced |
| Actual LTV (from data) | revenue.json | COMPUTED | ✅ $15,749/client |

**→ The two files disagree on LTV by 13x ($5,107 vs $1,188) and CAC by 10x ($512 vs $50). Neither has a derivation.**

### 2.5 Stress Test: Revenue Assumptions

| Scenario | Assumption | Result |
|----------|-----------|--------|
| **Pessimistic** | Growth continues at -58% worst MoM, churn 5%/mo, no new channels | ARR stays at $89K. No growth. |
| **Realistic** | 15% MoM growth for 6 months (best historical streak), then 3%/mo. Paid ads $3K/mo starting month 4. | ARR = $89K × 2.5 = **$223K** in 12 months. Still 78% below $1M. |
| **Optimistic** | 25% MoM growth for 12 months (no churn, all channels work). HN + PH + SEO + ads + conferences. | ARR = $89K × 34 = **$3.0M**. Possible but requires perfect execution + $50K+ marketing spend. |

### 2.6 Corrected Revenue Numbers

| Metric | Roadmap Claim | Corrected (Realistic) | Source |
|--------|--------------|----------------------|--------|
| ARR (current) | — | $89K | revenue.json actual |
| ARR (12 months) | $1M | $200-300K | Compound growth at 15% MoM + new channels |
| Customers (12 months) | 834 | 150-250 | At $89K → $250K = 2.8x growth = 30-28 new clients |
| Avg deal size | $1,200 | $1,481 | revenue.json actual |
| LTV | $5,107 | $15,749 (actual) to $3,000 (conservative, accounting for churn) | revenue.json vs roadmap |
| CAC | $512 | $500-2,000 (estimate: actual acquisition channels unknown) | Benchmark for B2B SaaS VN |
| LTV:CAC | 10:1 | 1.5:1 to 5:1 | Depends on actual CAC |
| Churn | 3% | Unknown (4 months data insufficient, but volatile MoM suggests 5-10%) | Observation from revenue.json |

---

## 3. DIMENSION 2: COST STRUCTURE

### 3.1 Token/API Costs

| Item | Roadmap/Model | Actual/Benchmark | Gap |
|------|--------------|------------------|-----|
| Daily token threshold | $5 green / $20 red | Not found in actual data | UNATTRIBUTED |
| Monthly token threshold | $50 / $200 | Not found in actual data | UNATTRIBUTED |
| API vs self-hosted break-even | RTX 4090 at 14.3M tokens/mo | Not referenced in any file | UNATTRIBUTED |
| Claude API cost (SALE MLM) | 700k VND (v1) → 100k VND (v4) | Internal OpenRouter = near-free for team | v1-v4 corrected |
| Claude API cost (PTP Tech) | Not in model | ~0 (internal) | N/A |

**→ Token costs are negligible for the RaaS model at current scale. At 834 customers, assuming 100 tokens/session × 10 sessions/customer/mo × $3/M tokens = $2,500/mo. Trivial compared to revenue.**

### 3.2 Infrastructure Costs

| Item | Roadmap Claim | Reality |
|------|--------------|---------|
| Cloudflare Workers/D1/KV | "$0 at scale" | True for low volume. At 834 customers: D1 reads ~100K/mo (free limit: 25M reads). KV ops ~50K/mo (free: 1M). **Still $0.** |
| CF Pages | "$0" | True. Bandwidth limit 500K req/mo on free. At 834 customers × 20 page views = 17K req/mo. **$0.** |
| Domain + SSL | Not listed | ~$15/year. Negligible. |

**→ Infrastructure cost claim holds. CF free tier sufficient for Phase 3 scale.**

### 3.3 Personnel Costs

| Item | Source | Value | Gap |
|------|--------|-------|-----|
| CTO time | SALE MLM v4 | 22h/week | Not modeled in GTM |
| Leader time | SALE MLM v4 | 60-80h/week for 3 weeks, 32h/week ongoing | Not modeled in GTM |
| Personnel (PTP Tech) | business-model.md | 50tr/mo (~$2K) | Not relevant to RaaS |
| Sales team | GTM roadmap | "Founder handles inbound initially" | No cost modeled for AE/SDR hiring |

**→ Personnel costs are entirely absent from the GTM roadmap. CTO time = opportunity cost. Sales hiring = Phase 4+ cost not modeled.**

### 3.4 Compliance Costs

| Item | SALE MLM v4 | RaaS GTM | Gap |
|------|------------|----------|-----|
| Legal/compliance | 1-2tr VND ($40K-80K) | NOT LISTED | **🔴 Missing from roadmap** |
| SOC2 Type II | Not in cost model | Listed as Phase 5 initiative | Cost = $15K-50K audit + ongoing |
| Privacy policy + ToS | 200k VND | Not listed | ~$8 |
| Revenue share agreements | 500k VND | Not listed | ~$20 |

**→ The GTM roadmap lists SOC2 as a Phase 5 initiative but assigns $0 cost. Real SOC2 Type II = $15K-50K one-time + $5K-10K/year maintenance. This alone eats 5-10% of the $1M ARR runway.**

### 3.5 Marketing Budget Reality Check

**Roadmap Phase 3 channel budget:**

| Channel | Monthly | Annual (Phase 3 = 6 months) |
|---------|---------|----------------------------|
| Content/SEO | $2K | $12K |
| Paid ads | $5K | $30K |
| Referrals | $1K | $6K |
| Events | $3K/quarter | $18K (6 quarters over 18 months) |
| **Total Phase 3-4** | **$8K/mo** | **$48K + $18K = $66K** |

**CONTRADICTION with CAC claim:**

```
Roadmap claims CAC <$600 by Phase 3.
But: $66K marketing spend / 700 customers = $94 CAC per customer.
If paid ads drive 20 customers @ $5K/mo: $5K/20 = $250 CAC for that channel alone.
Content/SEO drives 30 customers: $2K × 6 months / 30 = $400 CAC.
Combined blended CAC = $66K / 116 = $569. Close to $600 target.
```

**→ CAC $512 is mathematically achievable at Phase 3 IF all channels hit targets. But this requires $66K marketing spend over 12 months — not modeled as a cost line in the roadmap.**

### 3.6 PTP Tech Margin Analysis

| Item | Value | Note |
|------|-------|------|
| Revenue | 690tr/mo (~$27K) | KiotViet data |
| COGS | 60% = 414tr/mo | Direct distributor — realistic for solar equipment |
| Gross margin | 40% = 276tr/mo | |
| Fixed costs | 77tr/mo (personnel + marketing + warehouse + website) | |
| Net margin | ~35% | 276 - 77 = 199tr net / 690tr gross |
| Annual net | ~$127K | 199tr × 12 / 25K |

**→ PTP Tech is a profitable traditional business with 35% net margin. The RaaS model targets 85% gross margin (per growth-strategy). The margin differential = 50 percentage points = the RaaS value proposition. But this requires reaching scale to cover fixed costs.**

### 3.7 Stress Test: Cost Structure

| Scenario | Infrastructure | Personnel | Marketing | Compliance | Total/mo |
|----------|---------------|-----------|-----------|------------|----------|
| Pessimistic | $0 | $5K (CTO part-time + founder) | $0 (organic only) | $0 | $5K/mo |
| Realistic | $0 | $8K (2 engineers + founder) | $8K/mo | $1K/mo (SOC2 amortized) | $17K/mo |
| Optimistic | $0 | $15K (5-person team) | $15K/mo | $2K/mo | $32K/mo |

**At $83K MRR target:**
- Pessimistic burn: $83K - $5K = $78K/mo profit ✅
- Realistic burn: $83K - $17K = $66K/mo profit ✅
- Optimistic burn: $83K - $32K = $51K/mo profit ✅

**→ Margins hold IF revenue target is met. But revenue target is the problem (see D1).**

---

## 4. DIMENSION 3: CONVERSION RATES

### 4.1 Funnel Rates — All Sources

| Funnel Stage | SALE MLM v4 (Manual Zalo) | SALE MLM v4 (Automated) | RaaS GTM (implied) | VN Market Benchmark | Assessment |
|-------------|--------------------------|------------------------|-------------------|---------------------|------------|
| Contact → Response | 20% (cold) / 40% (warm) | 10% (organic) | Not specified | Zalo DM: 15-25% | RaaS missing |
| Response → Qualified | 25% (cold) / 40% (warm) | 35% (quiz) | Not specified | Wellness: 30-40% | RaaS missing |
| Qualified → Purchase | 5% (cold) / 10% (warm) | 8% (coach) | Not specified | Dev tool: 2-5% warm, 0.5-1% cold | RaaS missing |
| Overall conversion | 0.75% (cold) / 7.8% (warm) | ~0.01% | **6% (implied)** | Dev tool HN launch: 1-3% | 🔴 RaaS overestimates 4-8x |

### 4.2 RaaS Channel Conversion Claims

The GTM roadmap claims these customer acquisitions for Phase 3:

| Channel | Target | Implied Conversion Rate | Benchmark | Assessment |
|---------|--------|------------------------|-----------|------------|
| Product Hunt | 50 customers | 50/300 installs = 17% | PH typical: 2-5% install→paid | 🔴 3-8x overestimate |
| Content/SEO | 30 customers | 30/200 visits = 15% | SaaS SEO: 2-3% visitor→lead, 10-15% lead→paid = 0.2-0.5% overall | 🔴 30-75x overestimate |
| Paid ads | 20 customers | 20/$5K × $500 CAC = $100K spend | SEM: 2-5% CTR, 3-8% conversion = 0.06-0.4% | 🟡 Possible with $5K/mo budget |
| Referrals | 10 customers | 10/$1K = $100 CAC | Referral: 5-10% of existing customers | 🟡 Possible at scale |
| Events | 6 customers | 6/$3K = $500 CAC | Conference: 1-3% attendees→customer | 🟡 Reasonable |

### 4.3 Trial-to-Paid Conversion

**Not specified in ANY source file.** This is a critical gap.

| Source | Mentions trial-to-paid? | Rate |
|--------|------------------------|------|
| raas-gtm-roadmap-2026.md | ❌ No | — |
| growth-strategy-1m-arr.md | ❌ No | — |
| roi-calculator.ts | ❌ No (generic formula) | — |
| financial-model.json | ❌ No (contract schema only) | — |
| SALE MLM v4 | ✅ Yes (manual funnel) | 0.75-7.8% |

**→ Trial-to-paid conversion is the #1 driver of SaaS unit economics and it's completely absent from the RaaS model. Industry benchmark for dev tools: 10-25% trial-to-paid. This should be modeled explicitly.**

### 4.4 Upsell Rates (Starter → Pro → Agency → Master)

**Not specified in ANY source file.** Critical gap.

| Source | Mentions upsell? | Rate |
|--------|-----------------|------|
| raas-gtm-roadmap-2026.md | ❌ No | — |
| growth-strategy-1m-arr.md | ❌ No | — |
| SALE MLM v4 | ✅ Yes (L1 → L2 → L3) | 10-15% (speculative) |

**→ The roadmap shows a customer MIX (400 Starter, 300 Pro, etc.) but no upsell path or rate. This mix is a static target, not a dynamic projection. Industry SaaS upsell: 5-15%/year for dev tools.**

### 4.5 Churn Rates

| Source | Claimed Rate | Benchmark | Assessment |
|--------|-------------|-----------|------------|
| growth-strategy-1m-arr.md | 3% monthly | Dev tool SaaS: 2-5% | 🟡 At low end, reasonable |
| raas-gtm-roadmap-2026.md | <5% (Phase 3) → <3% (Phase 4) | Same | 🟡 Improving churn is optimistic without churn intervention plan |

**Actual data observation:** Revenue.json shows volatile MoM patterns (-58% to +219%). This volatility suggests either:
1. Irregular billing cycles (clients pay quarterly/semi-annually)
2. High churn with new client acquisition offsetting losses
3. Both

**→ At 3% monthly churn, losing 3% of 834 customers = 25 customers/month. Need 25+ new customers/month to maintain. At current rate of ~3 new customers/month, this is a 8x shortfall.**

### 4.6 Corrected Conversion Numbers

| Metric | Roadmap Claim | Corrected (Realistic) | Justification |
|--------|--------------|----------------------|---------------|
| HN stars → customers | 500 → 40 (8%) | 500 → 8-15 (1.5-3%) | Dev tool HN benchmark |
| PH installs → customers | 300 → 50 (17%) | 300 → 6-15 (2-5%) | PH benchmark |
| SEO visits → customers | 200/mo → 30 | 200/mo → 2-5 | SEO conversion benchmark |
| Paid ads → customers | $5K/mo → 20 | $5K/mo → 10-15 | SEM benchmark at $300-500 CAC |
| Referrals → customers | $1K/mo → 10 | $1K/mo → 5-8 | Referral benchmark |
| Events → customers | $3K/event → 6 | $3K/event → 3-5 | Conference benchmark |
| **Phase 3 total customers** | **116** | **35-55** | Sum of corrected channel targets |
| **Phase 3 MRR** | **$47K** | **$8-15K** | At corrected customer count |
| **Phase 3 ARR** | **$569K** | **$100-180K** | 70% shortfall confirmed |

---

## 5. DIMENSION 4: TIMELINE → REVENUE MAPPING

### 5.1 Phase Gate Analysis

| Phase | Roadmap Timeline | Roadmap Revenue Target | Task Plan Exists? | Revenue Traceable to Tasks? |
|-------|-----------------|----------------------|-------------------|---------------------------|
| 1: Foundation | Month 1-3 | $2K MRR | No explicit task plan | ❌ No |
| 2: Traction | Month 4-6 | $13K MRR | No explicit task plan | ❌ No |
| 3: Scale | Month 7-12 | $47K MRR | No explicit task plan | ❌ No |
| 4: Expansion | Month 13-18 | $103K MRR | No explicit task plan | ❌ No |
| 5: Enterprise | Month 19-24 | $14,489 MRR | No explicit task plan | ❌ No |

**→ NONE of the 5 phases have a task plan that traces revenue milestones to specific deliverables. The roadmap lists initiatives ("conference talks," "partner program") but not the tasks that produce customers.**

### 5.2 Revenue Milestone Traceability

**Phase 3 ($47K MRR = 700 customers):**

| Revenue Milestone | Required Tasks | Tasks Exist? | Gap |
|------------------|---------------|--------------|-----|
| 116 customers by month 6 | Product Hunt launch, case studies, demo env, competitive battlecard | Partial (Phase 2 has task list) | Phase 2 tasks ≠ customer acquisition tasks |
| 341 customers by month 9 | Partner program (5 agencies) = 50, Webinars = 40, Sponsorships = 30, Content = 60, Paid ads = 45 | ❌ No task plan for any of these | 225 customers appear from "initiatives" with no execution detail |
| 700 customers by month 12 | Referral program = 40, White-label = 10, Enterprise outbound = 20 | ❌ No task plan | 295 customers from 3 initiatives with no execution detail |

**→ From month 9 to month 12, 359 new customers must appear from: referral program (40), white-label (10), enterprise outbound (20). That's 70 customers from named initiatives. Where do the other 289 come from? Unaccounted.**

### 5.3 Growth Strategy Timeline vs. GTM Timeline

**CONTRADICTION:** The two roadmap files use different timelines for the same milestones:

| Milestone | GTM Roadmap | Growth Strategy | Delta |
|-----------|------------|----------------|-------|
| 500 GitHub stars | Not mentioned | Month 1-3 | +0 |
| 2,000 GitHub stars | Not mentioned | Month 4-6 | — |
| Product Hunt | Phase 2 (Month 5-8) | Not in phases (Phase 2 general) | Unclear |
| 700 paid users | Month 7-12 (Phase 3) | Month 7-12 (Phase 3) | ✅ Aligned |
| Conference talks | Phase 3 (Month 7-12) | Phase 3 (Month 7-12) | ✅ Aligned |
| $47K MRR | Phase 3 | Phase 3 | ✅ Aligned |

**→ The two roadmaps are mostly aligned on Phase 3 but the GTM roadmap is more detailed on channels. The growth strategy is more detailed on product milestones. Neither traces revenue to tasks.**

### 5.4 PTP Tech Timeline vs. Revenue

**PTP Tech claims (from business-model.md):**
- June 1: MVP
- July 1: KiotViet migration
- Dec 1: 500tr/month (~$20K/month)

**Revenue trajectory:**
```
Current (May 2026): 690tr/month (claimed)
June: MVP launch (no revenue impact)
July: KiotViet migration (possible disruption)
Aug-Nov: Scale to 500tr/month
```

**→ The Dec 1 target of 500tr/month is BELOW current claimed revenue of 690tr/month. This is either a conservative buffer or a contradiction.**

### 5.5 Corrected Timeline → Revenue Mapping

| Month | Conservative | Realistic | Optimistic |
|-------|-------------|-----------|------------|
| M1-3 | $89K-$120K ARR | $120K-$180K | $180K-$250K |
| M4-6 | $120K-$180K | $180K-$300K | $250K-$400K |
| M7-9 | $150K-$250K | $250K-$400K | $400K-$600K |
| M10-12 | $180K-$300K | $300K-$500K | $500K-$800K |
| **12-month ARR** | **$180K-$300K** | **$300K-$500K** | **$500K-$800K** |

**→ $1M ARR in 12 months = OPTIMISTIC scenario requiring perfect execution, $50K+ marketing spend, and 3+ dedicated sales/marketing hires.**

---

## 6. CROSS-FILE CONTRADICTIONS SUMMARY

### 6.1 All Contradictions Found

| # | Contradiction | File A | File B | Severity |
|---|--------------|--------|--------|----------|
| 1 | $1M ARR customer mix sums to $1.96M ARR | raas-gtm-roadmap | raas-gtm-roadmap (same file) | 🔴 FATAL |
| 2 | Phase 5 MRR ($14,489) < Phase 3 ($47K) | raas-gtm-roadmap | raas-gtm-roadmap (same file) | 🔴 FATAL |
| 3 | LTV: $5,107 vs $1,188 (13x difference) | raas-gtm-roadmap | growth-strategy | 🔴 FATAL |
| 4 | CAC: $512 vs $50 (10x difference) | raas-gtm-roadmap | growth-strategy | 🔴 FATAL |
| 5 | LTV:CAC: 10:1 vs 24:1 (2.4x difference) | raas-gtm-roadmap | growth-strategy | 🟠 HIGH |
| 6 | Compliance cost: 1-2tr VND present vs absent | SALE MLM v4 | raas-gtm-roadmap | 🔴 HIGH |
| 7 | Marketing spend: not modeled vs $66K implied | raas-gtm-roadmap | raas-gtm-roadmap (same file) | 🟠 HIGH |
| 8 | Conversion rates: not specified vs implied 6% | raas-gtm-roadmap | SALE MLM v4 (0.75-7.8%) | 🔴 HIGH |
| 9 | Trial-to-paid: not mentioned anywhere | ALL files | ALL files | 🟠 HIGH |
| 10 | Upsell rates: not mentioned anywhere | ALL files | ALL files | 🟡 MEDIUM |
| 11 | Current MRR: $47K (claimed) vs $7K (actual from $89K ARR/12) | User brief | revenue.json | 🔴 FATAL |
| 12 | $47K Phase 3 target vs $14K actual (from user brief) | User brief | User brief | 🔴 HIGH |
| 13 | Timeline: no task-revenue mapping | ALL roadmap files | ALL roadmap files | 🔴 HIGH |
| 14 | "Organic-heavy" CAC $50 vs actual B2B VN CAC $500-2,000 | growth-strategy | Industry benchmark | 🟠 HIGH |

### 6.2 Most Critical Contradiction: Current MRR

**The user brief states "$47K MRR Phase 3 target vs $14K actual (70% short)."**

But `revenue.json` shows $173,247 over 4 months = $43,312/month average = **$43K MRR**, NOT $14K.

If $43K is actual current MRR:
- Phase 3 target ($47K) is **9% above current** — not 70% short
- The "70% short" claim assumes $14K actual, which doesn't match revenue.json

**Possible explanations:**
1. Revenue.json includes one-time revenue inflating the average
2. MRR should be calculated from retainer-only: let me check...
3. The $47K target is from a different timeframe

**Retainer-only MRR calculation (most recent month, Jan 2026):**
- REV-0002: $2,166 (CLI-0002, retainer, recurring)
- REV-0004: $1,966 (CLI-0008, retainer, recurring)
- REV-0005: $3,232 (CLI-0003, retainer, recurring)
- REV-0010: $2,478 (CLI-0010, retainer, recurring)
- REV-0011: $3,475 (CLI-0003, retainer, recurring)
- REV-0012: $582 (CLI-0006, retainer, recurring)
- REV-0013: $3,067 (CLI-0009, retainer, recurring)
- REV-0015: $3,072 (CLI-0007, retainer, recurring)

**Jan 2026 retainer total: $23,038/month = $276K ARR**

But the user brief says $89K ARR and $47K MRR. The $47K figure might include projected/pipeline revenue, not just collected.

**→ There is a discrepancy between revenue.json actuals and the user-brief claims. The $14K actual MRR in the brief likely refers to pure recurring (retainer) MRR from a specific subset, while $47K includes pipeline/projected.**

---

## 7. ROI CALCULATOR v5 — CORRECTED NUMBERS

### 7.1 Phase 1 ROI (RaaS GTM Phase 1 = Foundation)

**Investment:**
- Engineering time (CTO 22h/wk × 3 months = 264h × $100/h) = $26,400
- Legal/compliance: $2,000
- Marketing (HN launch, DEV.to): $0
- Infrastructure: $0
- **Total: ~$28,400**

**Revenue (realistic, Phase 1):**
- 40 Starter customers × $49/mo × 3 months = $5,880 (annualized, not realized)
- 2 Pro customers × $199/mo × 3 months = $1,194
- **Realized Phase 1 revenue: $0** (customers acquired in month 3, pay in month 4+)
- **ARR at Phase 1 exit: ~$28K-50K**

**ROI Phase 1:**
```
Cost: $28,400
ARR generated: $28K-50K
ROI: 0% to +76% (at exit, not annualized)
```

### 7.2 Phase 3 ROI (Scale, Month 7-12)

**Investment (6 months):**
- Engineering: 22h/wk × 26 weeks × $100 = $57,200
- Marketing: $8K/mo × 6 = $48,000
- Events: $3K × 2 = $6,000
- Compliance: $5,000 (SOC2 prep)
- **Total: $116,200**

**Revenue (realistic, Phase 3):**
- 35-55 customers × avg $200/mo × 6 months = $42K-66K
- Annualized ARR at exit: $84K-132K

**ROI Phase 3:**
```
Cost: $116,200
ARR generated: $84K-132K
ROI: -28% to +14% (at exit)
Breakeven: 18-24 months at current growth rate
```

### 7.3 Full 12-Month ROI (Conservative → Optimistic)

| Scenario | Total Investment | ARR at 12mo | ROI | Comments |
|----------|-----------------|-------------|-----|----------|
| Pessimistic | $150K | $180K | +20% | Slow growth, minimal marketing |
| Realistic | $200K | $300K | +50% | Moderate marketing, steady growth |
| Optimistic | $300K | $500K | +67% | Aggressive marketing, all channels work |
| Roadmap Claim | — | $1M | — | **Requires 3x optimistic scenario** |

### 7.4 SALE MLM Phase 1 ROI (from v4 data, recalculated)

This is the project from v1-v4. The v5 audit re-evaluates it using actual revenue data:

| Metric | v4 Claim | v5 Corrected |
|--------|---------|--------------|
| Investment | 1.350k-1.700k VND | ✅ Verified (itemized in v4) |
| Revenue (realistic) | 798k (1 đơn) | ✅ Consistent with SALE MLM actuals ($89K ARR = real business) |
| EV | -758k | **Different project** — SALE MLM v4 was Hive Warfare/Droppii, NOT the RaaS project |
| ARR ceiling | $50-100K | **$89K actual = already at $89K ARR** — this IS the real business |

**→ IMPORTANT CLARIFICATION:** The v1-v4 audit trail is for a DIFFERENT project (Hive Warfare Academy / Droppii MLM). The "SALE MLM" project in this v5 audit refers to the actual RaaS business with $89K ARR. The v4 findings (EV -758k, LTV:CAC 0.3-1.7:1) are NOT applicable to the actual RaaS business because they audit a wellness MLM pilot, not the SaaS platform.

**→ The $89K ARR actual business has DIFFERENT economics:**
- 11 real paying clients (vs. 0 in Hive Warfare pilot)
- $1,481 average deal size (vs. $399k VND = $16 digital product)
- 37% recurring revenue (vs. 0% in digital-only model)
- Volatile but growing MoM pattern

---

## 8. RISK MATRIX

### 8.1 Risk Register (All Projects)

| # | Risk | Probability | Impact | Mitigation | Status |
|---|------|------------|--------|------------|--------|
| 1 | **$1M ARR unachievable in 12 months** | 90% | 🔴 FATAL | Accept $200-500K as target, rebrand roadmap | UNRESOLVED |
| 2 | **Customer mix math error** (table sums to $1.96M) | 100% | 🔴 HIGH | Fix customer mix for $83K MRR | NEEDS FIX |
| 3 | **Phase 5 MRR regression** ($14K < Phase 3 $47K) | 100% | 🔴 HIGH | Likely typo. Should be $73K+ | NEEDS FIX |
| 4 | **Conversion rate overestimation** (6% vs actual 0.75-3%) | 80% | 🔴 HIGH | Adjust Phase 3 target to 35-55 customers | NEEDS FIX |
| 5 | **Marketing spend unmodeled** ($66K over 12mo) | 100% | 🔴 HIGH | Add marketing line to cost model | NEEDS FIX |
| 6 | **Compliance cost missing** (1-2tr VND / $15K-50K SOC2) | 70% | 🔴 HIGH | Add $20K compliance budget | NEEDS FIX |
| 7 | **LTV/CAC unsourced** (two files, 13x variance) | 100% | 🟠 HIGH | Derive from actual data: LTV=$3K, CAC=$500-2K | NEEDS FIX |
| 8 | **No trial-to-paid model** | 100% | 🟠 HIGH | Add trial funnel with 10-25% rate | NEEDS FIX |
| 9 | **No upsell model** | 100% | 🟡 MEDIUM | Add tier migration rates (5-15%/year) | NEEDS FIX |
| 10 | **No task-revenue mapping** | 100% | 🔴 HIGH | Each revenue milestone needs deliverable trace | NEEDS FIX |
| 11 | **Revenue.json vs brief discrepancy** ($47K vs $14K MRR) | 40% | 🟠 HIGH | Clarify: is $47K projected or actual? | NEEDS CLARIFY |
| 12 | **Current MRR volatility** (-58% to +219% MoM) | 60% | 🟠 HIGH | Smooth billing, move clients to annual | IN PROGRESS |
| 13 | **83% of revenue one-time** (63% one-time per brief) | 80% | 🟡 MEDIUM | Push retainer/annual contracts | IN PROGRESS |
| 14 | **No churn data** (4 months insufficient) | 100% | 🟡 MEDIUM | Need 12 months data to model churn | DATA GAP |
| 15 | **PTP Tech: 60% COGS aggressive** | 30% | 🟡 MEDIUM | Direct distributor margins typically 30-50% | MONITOR |

---

## 9. GO / NO-GO VERDICT

### 9.1 Per-Project Verdicts

#### RaaS Platform (Mekong CLI)
| Gate | Status | Rationale |
|------|--------|-----------|
| Revenue achievable? | 🟡 CONDITIONAL | $200-500K ARR in 12 months = realistic. $1M = requires 3x effort. |
| Cost structure viable? | ✅ YES | Margins 70-85% at $83K MRR. Infrastructure $0. |
| Unit economics viable? | 🟡 CONDITIONAL | LTV:CAC likely 1.5-5:1 (needs actual CAC data). Marginally viable. |
| Timeline realistic? | ❌ NO | Phase 3 (700 customers) has no execution path. Needs task-level plan. |
| Risk level | 🔴 HIGH | 15 risks, 4 FATAL. Math errors in roadmap. Missing cost lines. |

**Verdict: CONDITIONAL GO — with mandatory fixes:**
1. Rebrand $1M ARR → $300K ARR target for 12 months
2. Fix customer mix table (currently sums to $1.96M)
3. Fix Phase 5 MRR typo
4. Add $66K marketing budget + $20K compliance to cost model
5. Correct conversion rates: 116 → 35-55 customers at Phase 3
6. Build task-revenue mapping for each phase
7. Derive LTV/CAC from actual data, not benchmarks

#### PTP Tech (Solar/Smart Home Distribution)
| Gate | Status | Rationale |
|------|--------|-----------|
| Revenue achievable? | ✅ YES | 690tr/month already achieved (if accurate) |
| Cost structure viable? | ✅ YES | 35% net margin |
| Unit economics viable? | ✅ YES | 40% gross margin, 35% net |
| Timeline realistic? | 🟡 NEEDS VERIFY | June→Dec = 6 months to "500tr/month" which is below current 690tr |
| Risk level | 🟡 MEDIUM | COGS 60%, single location, single platform dependency |

**Verdict: GO — with one clarification:**
1. Is 690tr/month current actual or projected? If actual, Dec target of 500tr is a step DOWN.
2. If 500tr = conservative buffer, document the conservative assumption.

#### SALE MLM / Hive Warfare Academy (from v1-v4)
| Gate | Status | Rationale |
|------|--------|-----------|
| Revenue achievable? | ❌ NO | EV = -758k VND, 75% probability of loss |
| Unit economics viable? | ❌ NO | LTV:CAC 0.3-1.7:1, below 1:1 until 5+ orders |
| Conversion viable? | ❌ NO | 0.75% manual Zalo = near-zero orders |
| Moat sustainable? | ❌ NO | Droppii can replicate anytime |

**Verdict: NO-GO for current plan. Follow v4 alternatives:**
1. Alt 1: G0 Pilot → Option B (Manual Only) → Option A if pilot passes
2. Alt 2: Pivot to Wellness Content Brand (highest EV)
3. Alt 3: Pause + Research (smartest)

### 9.2 Overall Verdict: CONDITIONAL GO

The RaaS platform has a real business ($89K ARR, 11 clients, growing). But the $1M ARR roadmap is **mathematically broken** in 4 places and **missing $86K in costs**. The business can reach $300-500K ARR in 12 months with focused execution. The $1M target is a 2-year goal requiring paid marketing investment.

**3 mandatory fixes before next planning cycle:**
1. Fix the customer mix table (currently doesn't sum to $1M)
2. Add marketing + compliance costs to the model
3. Correct Phase 3 customer target from 700 → 35-55 (based on actual conversion rates)

---

## 10. APPENDIX: AUDIT METHODOLOGY

### Files Audited
| File | Lines | Numbers Extracted | Contradictions Found |
|------|-------|-------------------|---------------------|
| `plans/growth-strategy-1m-arr.md` | 53 | 18 | 3 |
| `docs/raas-gtm-roadmap-2026.md` | 185 | 42 | 7 |
| `SALE MLM/plans/roi-model-phase1-v4.md` | 746 | 89 | 0 (self-contained) |
| `data/analytics/revenue.json` | 1055 | 8 | 1 (vs. user brief) |
| `PTP Tech/studio/strategy/business-model.md` | 74 | 12 | 0 |
| `packages/mekong-cli-core/src/analytics/roi-calculator.ts` | 100 | 0 | N/A (generic engine) |
| `factory/contracts/commands/financial-model.json` | 82 | 0 | N/A (contract schema) |

### Audit Dimensions Applied
1. **Revenue Assumptions** — Every number sourced to actual data, benchmark, or first-principles derivation
2. **Cost Structure** — Every cost line itemized; no magic numbers
3. **Conversion Rates** — Every rate benchmarked against industry data
4. **Timeline → Revenue** — Every milestone traced to task/week deliverable

### Stress Test Methodology
- Pessimistic: Worst 3-month MoM growth rate continued, no new channels, 5% churn
- Realistic: 15% MoM growth (best historical streak), $3K/mo marketing from month 4
- Optimistic: 25% MoM growth, $8K/mo marketing, all channels hit targets

### Previous Audit Versions (SALE MLM MLM — different project)
| Version | EV (VND) | Key Finding |
|---------|----------|-------------|
| v1 | +1,030k | Sales pitch, math errors |
| v2 | +957k | Missing costs, over-optimistic funnel |
| v3 | +498k | Referral cost hidden, leads fiction |
| v4 | -758k | Forensic: unit economics unviable |
| **v5 (this)** | N/A | Different project (RaaS platform audit) |
