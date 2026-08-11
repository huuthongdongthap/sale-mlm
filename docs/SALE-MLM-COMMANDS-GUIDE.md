# SALE MLM — HƯỚNG DẪN TUẦN TỰ BUILD DỰ ÁN

> **Dự án:** Hive Warfare Academy — Droppii Sales Training OS
> **Phiên bản:** 1.0 | **Ngày:** 2026-06-03
> **Mục đích:** Tài liệu tham khảo tuần tự các Mekong CLI commands để build đầy đủ hệ thống

---

## TỔNG QUAN TRẠNG THÁI HIỆN TẠI

| Module | Trạng thái | % hoàn thành |
|--------|-----------|-------------|
| Training OS — Platform (T-001~T-011) | ✅ 25/25 tasks DONE | 100% |
| Training OS — Tier 1 Content (M1-M4) | ✅ Done | 100% |
| Training OS — Tier 2 Content (M5-M8) | ⚠️ STUBS (~5%) | 5% |
| Training OS — Tier 3 Content (M9-M12) | ⚠️ STUBS (~5%) | 5% |
| Training OS — AI Agents (T-016, T-017) | ✅ Done | 100% |
| Funnel OS | ❌ 0% code | 0% |
| Express → Cloudflare Workers migration | ⚠️ Code ready, NOT wired | 30% |
| D1 Database | ⚠️ Adapter exists, bindings commented out | 30% |
| Security fixes (hardcoded secrets) | ⚠️ Flagged in v4 audit | 50% |
| ROI Loop (weekly check → iterate) | ❌ Chưa có | 0% |

---

## PHẦN 1: COMMANDS CHO TỪNG GIAI ĐOẠN

### GIAI ĐOẠN 0 — PRIMING & SETUP

Mục tiêu: Load full context trước khi bắt đầu bất kỳ việc gì.

```
/context-prime
```

Output: Project readiness summary (architecture, deps, dir structure, available commands).

Sau đó load company config:

```
/mekong company/init    # Nếu chưa có .mekong/company.json
```

→ **Kết quả mong đợi:** Hiểu rõ 3-tier training architecture, ICP, brand tokens, KPIs.

---

### GIAI ĐOẠN 1 — PHẢN BIỆN & KIỂM CHỨNG (ADVERSARIAL AUDIT)

Mục tiêu: Đảm bảo mọi giả định của dự án đã được challenge bởi nhiều góc nhìn.

```
/plan hard "ROI model Phase 1 — adversarial audit toàn bộ giả định doanh thu, chi phí, conversion, timeline"
```

Sau khi plan xong:

```
/review    # Code review — architecture check, security scan, performance
```

Kết hợp với v4 audit đã có (`plans/roi-model-phase1-v4.md`):
- EV = -758k VND → 50% loss probability
- 3 alternatives đã được đề xuất
- **Decision cần Leader sign-off trước khi tiếp tục**

→ **Gate:** Leader phải chọn 1 trong 3 options:
  - (1) G0 Pilot → Manual → Build
  - (2) Pivot to Wellness Content Brand
  - (3) Pause + Research 8-10 weeks

---

### GIAI ĐOẠN 2A — FIX FOUNDATION (Training OS)

Mục tiêu: Fix các vấn đề kỹ thuật còn tồn đọng trước khi build mới.

#### 2A.1 — Security: Rotate hardcoded secrets

```
/sec-secrets    # Scan cho hardcoded secrets trong codebase
```

Output: Danh sách files có secrets hardcoded → fix trước khi build tiếp.

Sau khi fix:

```
/sec-scan       # Verify không còn secrets lộ
```

#### 2A.2 — Database: Wire up D1 bindings

```
/backend-db-task "Wire D1 bindings trong wrangler.toml, migrate từ in-memory sang D1 SQLite"
```

Steps:
1. Uncomment D1/KV/R2 bindings trong `wrangler.toml`
2. Run migration: `wrangler d1 migrations apply droppii-db`
3. Update `src/db/adapter.js` — đã có code, chỉ cần activate
4. Test: `wrangler dev` → verify queries hoạt động

```
/test --all     # Verify DB integration tests pass
```

#### 2A.3 — Express → Cloudflare Workers migration

```


```
/test --all     # Verify migration không break APIs
```

#### 2A.4 — Full security audit

```
/sec-full-audit
```

→ **Gate:** 0 high/critical findings trước khi deploy.

---

### GIAI ĐOẠN 2B — CONTENT EXPANSION (Tier 2 + Tier 3)

Mục tiêu: Hoàn thành curriculum từ 12% (M1-M4) → 100% (M1-M12).

#### 2B.1 — Tier 2: Chiến Binh → Chỉ Huy (M5-M8)

| Module | Topic | Tuần | Workers |
|--------|-------|------|---------|
| M5 | Recruitment Funnel — lead gen online/offline | T2-1/2 | content × 1 |
| M6 | Leader DNA — DISC profiling, EQ | T2-3/4 | content × 1 |
| M7 | PSN Management — group formation, metrics | T2-5/6 | content × 1 |
| M8 | Coaching Conversations — 1:1 framework | T2-7/8 | content × 1 |

Command sequence:

```
/content-engine "M5 Recruitment Funnel: 14 bài × 400 từ VN, script online/offline lead gen"
/content-engine "M6 Leader DNA: 14 bài DISC + communication styles + EQ exercises"
/content-engine "M7 PSN Management: 14 bài group formation + metric tracking + weekly sync"
/content-engine "M8 Coaching: 14 bài 1:1 framework + accountability + motivation"
```

Output: `content/tier2/m5-recruitment.json` → `m8-coaching.json`

#### 2B.2 — Tier 3: Chỉ Huy → Tướng Quân (M9-M12)

| Module | Topic | Tuần | Workers |
|--------|-------|------|---------|
| M9 | Sun Tzu Applied — 13 chương Binh Pháp | T3-1/3 | content × 1 |
| M10 | Campaign Warfare — flash campaigns, A/B | T3-4/6 | content × 1 |
| M11 | Data Commander — dashboard mastery | T3-7/9 | content × 1 |
| M12 | Legacy Builder — mentorship multiplication | T3-10/12 | content × 1 |

```
/content-engine "M9 Sun Tzu Applied: 21 bài, mỗi chương Binh Pháp ứng dụng vào sales warfare"
/content-engine "M10 Campaign Warfare: 21 bài flash campaigns + A/B testing + blitz week"
/content-engine "M11 Data Commander: 21 bài dashboard mastery + alert response + analytics"
/content-engine "M12 Legacy Builder: 21 bài mentorship multiplication + team culture"
```

Output: `content/tier3/m9-sun-tzu.json` → `m12-legacy.json`

#### 2B.3 — Verify content quality

```
/qa-plan "Content quality gate — verify M5-M12 đạt ≥ 400 từ/bài, 100% VN, actionable"
```

→ **Gate:** M1-M12 tất cả đều ≥ 70% target word count, 100% Vietnamese.

---

### GIAI ĐOẠN 3 — FUNNEL OS BUILD (0 → 100%)

Mục tiêu: Build Funnel OS từ scratch. Đây là module sinh tiền — ưu tiên cao nhất sau G0.

#### 3.0 — Context & Architecture

```
/context-prime "Funnel OS — customer acquisition funnel cho Hive Warfare Academy"
```

#### 3.1 — Plan Funnel Architecture

```
/plan "Funnel OS architecture: Quiz (DISC) → Landing Page → Checkout (VietQR) → AI Coach → Referral loop. Tech: Cloudflare Workers + D1 + R2. Budget: 1-1,5tr VND."
```

#### 3.2 — Backend APIs

```
/backend-api-build "Funnel APIs: POST /quiz/submit, GET /quiz/result, POST /checkout/create, GET /checkout/verify, POST /referral/track, GET /referral/status"
```

Sau mỗi API group:

```
/test --all
```

#### 3.3 — Funnel Frontend (Quiz + Landing + Checkout)

```
/frontend-ui-build "Funnel pages: (1) Quiz 5 câu DISC, (2) Result page + CTA, (3) Checkout VietQR, (4) Thank you + access grant"
```

```
/frontend-responsive-fix "Funnel pages mobile-first — 90%+ Lighthouse"
```

#### 3.4 — AI Coach Integration

```
/backend-api-build "AI Coach: POST /coach/session {member_id, module, day} → Claude Haiku response with wellness framework + Sun Tzu principles"
```

```
/test --all
```

#### 3.5 — Referral System (wired up)

File `src/features/referral.js` đã có logic nhưng **in-memory only**. Cần wire vào D1:

```
/backend-db-task "Migrate referral rewards (50K/200K/500K/1M/3M VND) từ in-memory sang D1, wire vào API routes"
```

```
/test --all
```

#### 3.6 — Payment Integration (VietQR)

```
/backend-api-build "VietQR payment: POST /payment/vietqr/create {amount, order_id, customer_zalo}, webhook /payment/vietqr/webhook verify + mark paid"
```

#### 3.7 — Full Funnel Review

```
/review
```

Output: Architecture + security + performance review của toàn bộ Funnel OS.

→ **Gate:** Tất cả tests pass, 0 high security findings, Lighthouse ≥ 90.

---

### GIAI ĐOẠN 4 — DEPLOY FOUNDATION + FUNNEL

Mục tić: Deploy Training OS + Funnel OS lên Cloudflare.

#### 4.1 — Pre-flight checks

```
/worker-health
/ops-health
```

#### 4.2 — Deploy Training OS

```
/deploy "Deploy Training OS: Workers (API) + Pages (dashboard) + D1 (database). Env: JWT_SECRET, ANTHROPIC_API_KEY."
```

Sau deploy:

```
/vercel-debug    # Verify live URLs hoạt động
```

#### 4.3 — Deploy Funnel OS

```
/deploy "Deploy Funnel OS: Workers (quiz + checkout + coach) + Pages (funnel pages) + R2 (ebook assets)."
```

#### 4.4 — End-to-end smoke test

```
/qa-e2e "Full flow: visit landing → take quiz → see result → checkout VietQR → confirm → access AI Coach first session"
```

---

### GIAI ĐOẠN 5 — G0 PILOT (Pre-flight Decision Gate)

Mục tiêu: Trước khi chạy thật, chạy pilot nhỏ để validate.

#### 5.1 — G0 Checklist

Dựa trên `plans/customer-funnel-os/EXECUTION-PLAN-WITH-GATES.md` G0:

- [ ] Leader approve CAPEX 1,5tr
- [ ] Chốt 1 SKU L1 + STK + COGS
- [ ] Confirm 35-40h/4 tuần
- [ ] 5 tài liệu: ảnh SP, STK+QR, tone guide, 50 contacts list, TPCN disclaimer

```
/goals "Set G0 Pilot goal: 10 warm contacts, manual Zalo DM funnel, validate 99K price point, target ≥2 orders in 7 days"
```

#### 5.2 — Manual Funnel (Leader tự chạy, không dùng app)

```
/business-revenue-engine "Manual warm network outreach: 50 Zalo contacts, 3-touch sequence, 99K Healthspan quiz product"
```

→ **Không build tech ở G0.** Leader test hypothesis bằng tay:
  - Post story Zalo → track clicks
  - DM warm contacts → track replies
  - Chuyển khoản manual → track payments

```
/growth-metrics "Track: story views → clicks → DMs → replies → checkout → payment"
```

#### 5.3 — G0 Gate Decision

| Metric | PASS | FAIL |
|--------|------|------|
| ≥2 orders từ 50 contacts | → G1 (build tech) | → Pivot hoặc STOP |
| ≥5% reply rate warm DM | → Continue | → Thay đổi messaging |
| ≥1 order từ non-family | → Demand validated | → Chỉ family mua = không có PMF |

```
/qa-plan "G0 gate report: conversion rate, CAC, LTV estimate, go/no-go recommendation"
```

---

### GIAI ĐOẠN 6 — FUNNEL OS LAUNCH (G1-G6)

Mục tiêu: Deploy funnel automated + chạy 6-gate execution.

#### 6.1 — G1: Foundation (Ngày 0-7)

```
/dev-feature "Funnel OS MVP: Quiz → Result → VietQR Checkout → Thank You. All 4 pages functional, end-to-end test pass."
```

Verify:

```
/qa-e2e "G1 gate: complete flow works end-to-end with test data"
```

→ **G1 PASS:** 4/4 functional | **FAIL:** Extend 3 ngày

#### 6.2 — G2: AI Coach Tone (Ngày 7-14)

```
/dev-feature "AI Coach tone validation: 10 test sessions, Vietnamese wellness + Sun Tzu tone, ≥7/10 human-approved"
```

```
/test --all
```

→ **G2 PASS:** ≥7/10 tone OK | **FAIL:** Tune prompt, retest

#### 6.3 — G3: Soft Launch (Ngày 14-17)

```
/business-revenue-engine "Soft launch: 10 friends/family, track funnel metrics: visits → quiz starts → completions → checkouts → payments"
```

```
/growth-metrics "Weekly funnel metrics: drop-off rates per stage, conversion per channel"
```

→ **G3 PASS:** ≥1 paying friend | **FAIL:** Pivot persona/pain

#### 6.4 — G4: Wave 1 — 50 Contacts (Ngày 17-21)

```
/marketing-campaign-run "Wave 1: Zalo story + DM sequence cho 50 priority contacts, 3-touch follow-up"
```

```
/growth-metrics "Wave 1 KPI: reach → engagement → lead → order. Target ≥3 orders from 50 contacts."
```

```
/finance-monthly-close "Track real revenue, CAC, LTV vs Phase 1 budget 1,5tr"
```

→ **G4 PASS:** ≥3 orders từ 50 contacts | **FAIL:** Pause Wave 2, post-mortem

#### 6.5 — G5: Wave 2 — CTV Team (Ngày 21-28)

```
/sdr-outreach-blast "Wave 2: Scale to CTV team (20-50 people), provide them funnel link + talking points + tracking"
```

```
/revops-comp "CTV referral commission: track who brings who, automate payout queue"
```

```
/finance-collections "Track payments + pending + failed. Target ≥7 orders tổng cộng."
```

→ **G5 PASS:** ≥7 orders tổng | **FAIL:** Scale lower, lessons learned

#### 6.6 — G6: Demo Day (Ngày 28+)

```
/founder-pitch "Demo Day presentation: metrics từ G0-G5, unit economics, Phase 2 ask"
```

```
/venture-due-diligence "Phase 1 retrospective: what worked, what didn't, ROI final number"
```

→ **G6 PASS:** 3/5 KPI | **FAIL:** Pivot hoặc stop

---

### GIAI ĐOẠN 7 — ROI LOOP (Weekly Iteration)

Mục tiêu: Vòng lặp liên tục kiểm tra → đo → cải tiến.

#### Mỗi tuần (Weekly cadence):

```
/finance-monthly-close    # Revenue, costs, burn rate, runway
/growth-metrics           # Funnel metrics: CAC, LTV, conversion per channel
/sales-weekly-review      # Pipeline review: leads, conversations, orders
/marketing-performance-report  # Channel effectiveness: Zalo vs FB vs organic
```

→ **Weekly Decision Matrix:**

| Metric | Action if Good | Action if Bad |
|--------|---------------|---------------|
| CAC < 30% LTV | Scale traffic | Reduce CAC (free channels) |
| Conversion > 3% | Keep messaging | A/B test new hooks |
| 99K price → 0 orders | Test 149K or 49K | Pivot to freemium |
| Zalo DM > 5% reply | Double down | Test FB messenger |
| Referral rate > 10% | Add referral rewards | Simplify referral flow |

```
/cook "weekly-optimization: analyze funnel drop-off → generate hypotheses → prioritize top 3 → A/B test → measure"
```

---

### GIAI ĐOẠN 8 — SCALE (Phase 2+)

Chỉ start khi G6 PASS + unit economics đã validated.

#### 8.1 — Add Paid Traffic

```
/ck-marketing-growth "Scale Phase 2: FB Ads budget 3-5tr, target cold audience, A/B test creative"
```

#### 8.2 — Add L2/L3 Upsell

```
/business-revenue-engine "Upsell funnel: L1 customers → L2 wellness program (299K) → L3 coaching (499K)"
```

#### 8.3 — Build Sustainable Moat

```
/idea "Hive Wellness content brand: build personal brand + community + proprietary content — moat Droppii không thể replicate trong 6-12 tháng"
```

#### 8.4 — Compliance Full

```
/legal-compliance-check "Full compliance: trademark Hive Wellness, TNCN registration, PDPA, TPCN/ATTP registration, MLM registration"
```

```
/compliance-monitor
```

---

## PHẦN 2: COMMANDS CHO AI AGENTS (6 agents)

Dựa trên `.mekong/company.json`, 6 AI agents cần được configure:

### Agent 1: AI Coach (Đã có code T-016)

```
/backend-api-build "AI Coach agent: session state machine W1→W2→W3→W4, daily Zalo nudges, graduation check"
```

### Agent 2: Onboarding Bot (Đã có code T-016)

```
/worker-exec "Deploy onboarding bot webhook: Zalo → new member → Week 1 Day 1 content push"
```

### Agent 3: Training Ops (Đã có code T-017)

```
/backend-api-build "Training Ops agent: detect member tier → auto-assign next module → POST /api/training/progress"
```

### Agent 4: Alert Engine (Đã có code T-006)

```
/backend-db-task "Wire alert engine từ in-memory sang D1: retention_guard + campaign_commander triggers"
```

### Agent 5: PSN Health Classifier (Đã có code T-005)

```
/backend-db-task "Wire PSN health classifier sang D1: 9-state classification, weekly snapshot, trajectory tracking"
```

### Agent 6: Funnel AI Coach (MỚI — cần build)

```
/backend-api-build "Funnel AI Coach agent: Claude Haiku, wellness framework + Sun Tzu principles, Vietnamese tone, session memory per member"
```

---

## PHẦN 3: COMMANDS CHO DOCUMENTATION

```
/docs-manager "Update README.md: setup, run, deploy instructions"
/docs-manager "Update RUNBOOK.md: incident playbooks (DB down, API 500, Zalo webhook fail, payment fail)"
/docs-manager "Create FUNNEL-OS-RUNBOOK.md: funnel troubleshooting, payment reconciliation, refund process"
/docs-manager "Create ROI-LOOP-PLAYBOOK.md: weekly metrics, decision matrix, A/B test framework"
/docs-manager "Create COMPLIANCE-CHECKLIST.md: TPCN, ATTP, TNCN, PDPA, MLM registration steps"
```

---

## PHẦN 4: COMMANDS CHO TESTING & QUALITY

### Test Pyramid

```
/test                   # Unit tests — Jest, supertest
/qa-plan                # QA plan — test strategy
/qa-automation          # CI test automation
/qa-e2e                 # E2E smoke tests (Playwright)
/qa-perf                # Performance testing (Lighthouse CI)
/qa-regression          # Regression suite trước mỗi deploy
```

### Security

```
/sec-audit              # Security audit — OWASP top 10
/sec-scan               # Dependency scan (npm audit)
/sec-secrets            # Secret scanning — đảm bảo 0 hardcoded secrets
/compliance-check       # PDPA VN compliance check
```

### Review Gates

```
/review                 # Pre-merge: architecture + security + performance
/tech-architecture-review  # Architecture review trước mỗi major deploy
```

---

## PHẦN 5: COMMANDS CHO DEPLOYMENT

### CI/CD Pipeline

```
/devops-deploy-pipeline "CI: lint → test → build → deploy-preview. CD: merge main → deploy production"
```

### Cloudflare Deploy

```
/deploy                 # Pre-flight → deploy → smoke test → rollback plan
/cloudflare             # CF-specific: Pages, Workers, D1, KV, R2 config
```

### Monitoring

```
/cto-health             # Full subsystem health check
/ops-health             # Ops health: API, DB, Workers, Pages
/obs-dashboard          # Observability dashboard
/obs-metrics            # Key metrics: latency, error rate, throughput
/obs-alert              # Alert rules: error rate > 1%, latency > 500ms
```

---

## PHẦN 6: SEQUENTIAL EXECUTION PLAN (TUẦN TỰ)

### Week 0-1: Foundation Fixes

```
/context-prime → /sec-secrets → fix secrets → /sec-scan
→ /tech-migration (Express→Workers) → /test --all
→ /backend-db-task (wire D1) → /test --all
→ /deploy (Training OS to CF)
```

### Week 1-2: Content Expansion

```
/content-engine "M5 Recruitment Funnel" → /content-engine "M6 Leader DNA"
→ /content-engine "M7 PSN Management" → /content-engine "M8 Coaching"
→ /content-engine "M9 Sun Tzu" → /content-engine "M10 Campaign"
→ /content-engine "M11 Data Commander" → /content-engine "M12 Legacy"
→ /qa-plan "Content quality gate"
```

### Week 2-3: Funnel Build

```
/plan "Funnel OS architecture" → /backend-api-build (quiz + checkout + payment)
→ /frontend-ui-build (quiz + landing + checkout pages)
→ /backend-api-build "AI Coach integration" → /test --all
→ /review → /deploy (Funnel OS to CF)
→ /qa-e2e "Full flow test"
```

### Week 3-4: G0 Pilot

```
/goals "G0 Pilot: 50 warm contacts, manual Zalo DM"
→ /business-revenue-engine (manual outreach)
→ /growth-metrics (track funnel)
→ /qa-plan "G0 gate report"
```

### Week 4-5: G1-G3 (Soft Launch)

```
/dev-feature "Funnel MVP" → /qa-e2e "G1 gate"
→ /dev-feature "AI Coach tone" → /test --all "G2 gate"
→ /business-revenue-engine "Soft launch 10 friends" → /growth-metrics "G3 gate"
```

### Week 5-6: G4-G6 (Scale + Demo Day)

```
/marketing-campaign-run "Wave 1: 50 contacts" → /growth-metrics "G4 gate"
→ /sdr-outreach-blast "Wave 2: CTV team" → /finance-collections "G5 gate"
→ /founder-pitch "Demo Day" → /venture-due-diligence "G6 gate"
```

### Week 6+: ROI Loop (Continuous)

```
/finance-monthly-close → /growth-metrics → /sales-weekly-review
→ /marketing-performance-report → /qa-plan "Weekly optimization"
→ /cook "weekly-optimization-recipe"
```

---

## PHẦN 7: QUICK REFERENCE — COMMANDS THEO CHỨC NĂNG

### Planning & Strategy
| Command | Dùng khi |
|---------|----------|
| `/plan` | Tạo implementation plan |
| `/idea` | Business idea → full architecture |
| `/quick-start` | Bootstrap project mới |
| `/brainstorm` | Idea generation + validation |
| `/pm-roadmap` | Product roadmap |

### Building & Coding
| Command | Dùng khi |
|---------|----------|
| `/dev-feature` | Build full feature (plan→code→test) |
| `/dev-bug-sprint` | Batch fix bugs |
| `/backend-api-build` | Build backend APIs |
| `/backend-db-task` | Database tasks |
| `/frontend-ui-build` | Build UI components |
| `/tech-migration` | Tech stack migration |

### Testing & QA
| Command | Dùng khi |
|---------|----------|
| `/test` | Generate + run tests |
| `/qa-e2e` | End-to-end testing |
| `/qa-perf` | Performance testing |
| `/qa-regression` | Regression suite |

### Review & Security
| Command | Dùng khi |
|---------|----------|
| `/review` | Full code review |
| `/sec-audit` | Security audit |
| `/sec-secrets` | Scan hardcoded secrets |
| `/compliance-check` | Compliance audit |

### Deploy & Ops
| Command | Dùng khi |
|---------|----------|
| `/deploy` | Full deploy pipeline |
| `/ship` | Lint → test → commit → push |
| `/cto-health` | CTO health dashboard |
| `/ops-health` | Ops health check |
| `/vercel-debug` | CI/CD debug |

### Sales & Revenue
| Command | Dùng khi |
|---------|----------|
| `/business-revenue-engine` | Full revenue pipeline |
| `/sales-pipeline-build` | Build sales pipeline |
| `/marketing-campaign-run` | Run marketing campaign |
| `/growth-metrics` | Growth analytics |
| `/finance-monthly-close` | Financial close |

### Content & Marketing
| Command | Dùng khi |
|---------|----------|
| `/content-engine` | Generate content |
| `/marketing-vn` | Vietnamese marketing |
| `/writer-blog` | Blog writing |
| `/marketing-cro` | Conversion rate optimization |

---

## PHẦN 8: DEPENDENCY MAP

```
/context-prime
    │
    ▼
/plan (architecture + phases)
    │
    ├── /sec-secrets → fix → /sec-scan
    │
    ├── /tech-migration (Express→Workers)
    │   └── /test --all
    │
    ├── /backend-db-task (wire D1)
    │   └── /test --all
    │
    ├── /content-engine (M5-M12)
    │   └── /qa-plan
    │
    └── /backend-api-build (Funnel)
        ├── /frontend-ui-build (Funnel pages)
        │   └── /frontend-responsive-fix
        ├── /test --all
        ├── /review
        └── /deploy

G0 PILOT (manual)
    │
    ▼
G1-G6 (automated funnel)
    │
    ▼
ROI LOOP (weekly)
    ├── /finance-monthly-close
    ├── /growth-metrics
    ├── /sales-weekly-review
    └── /cook "weekly-optimization"
```

---

## NOTES

1. **Tất cả commands đều có thể chạy từ CLI** — prefix với `/` hoặc gọi qua Task tool
2. **Mỗi command có MCU cost** — check bằng `/commands-status`
3. **Workers chạy song song** — dùng `/4-project dispatch` nếu muốn parallel
4. **Stop hooks** — session có thể có stop hook đang block, cần produce output để clear
5. **Budget 1-1,5tr VND** cho Phase 1 — track bằng `/finance-monthly-close`
6. **Phase 1 target:** 4-8 orders @ 99K-399K = 400K-3.2tr doanh thu

---

## NEXT IMMEDIATE ACTION

```
/goals /plan build song song Training OS (content M5-M12 + CF migration) với Funnel OS (quiz + checkout + VietQR), Funnel chạy ROI loop mỗi tuần để có dòng tiền sớm nhất
```
