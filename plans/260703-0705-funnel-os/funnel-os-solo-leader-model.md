# Funnel OS — Solo Leader Business Model
> **Mục tiêu:** Leader 1 người tự bắt đầu, test 4 tuần → proof → nhân bản CTV → 5M → 10M → 15M VND/tháng
> **Nguyên tắc:** Không vốn lớn. Không ads (Phase 1). Dùng network sẵn có. Hệ thống làm phần lặp, Leader chỉ chốt.

---

## 1. Sản phẩm & Funnel đã có

Bạn đã build sẵn trong repo:

| Vai trò | Trong code | Ý nghĩa kinh doanh |
|---------|-----------|-------------------|
| L0 Lead Magnet | `funnelLevel: 0` | Free AI Coach quiz — thu lead miễn phí |
| L1 Trial | `funnelLevel: 1` | Gói sản phẩm L1 dưới 1tr → mua thử |
| L2 Health Active | `funnelLevel: 2` | Gói 30-45 ngày 3-5tr → duy trì kết quả |
| L3 Combo | `funnelLevel: 3` | Combo 90 ngày 10-15tr → khách hàng trung thành |
| L4 CTV Partner | `funnelLevel: 4` | Khách trở thành Cộng Tác Viên → mở vòng tuần hoàn |

Transition rules đã có: `src/automation/funnelRules.js` (L0→L1 cần quiz answers, L1→L2 cần purchased, L2→L3 cần 14 ngày, L3→L4 cần referral).

---

## 2. Mô hình kinh doanh solo-leader

### 2.1 Revenue model — phần Leader giữ lại

**Doanh thu thực tế = Leader direct sales + Override từ CTV team**

```
Tuần 1-4:    Leader tự bán        → 0 CTV, margin 70%
Tháng 2-3:    Leader + 1-2 CTV     → override 10-15%
Tháng 4-6:    Leader + 3-5 CTV     → override cấp 1 + cấp 2
Tháng 7-12:   Leader hệ thống      → 8-12 CTV, margin 70% + override
```

### 2.2 Unit economics per customer

| Product | Giá bán | COGS | Margin | Role trong funnel |
|---------|---------|------|--------|-------------------|
| L1 (Trial) | 590K | ~177K (30%) | **413K (70%)** | Lead magnet → first purchase |
| L2 (30-45 ngày) | 3,5tr | ~1,05tr (30%) | **2,45tr (70%)** | Retention + upsell |
| L3 (Combo 90 ngày) | 12tr | ~3,6tr (30%) | **8,4tr (70%)** | LTV max |

### 2.3 Cost structure

| Hạng mục | Chi phí | Ghi chú |
|---------|---------|---------|
| Claude API (Haiku) | ~700K/tháng | AI Coach quiz + follow-up (100-200 sessions) |
| Cloudflare | ~$0-5/tháng | Pages + D1 + Workers (free tier đủ cho <500 leads) |
| Giao hàng pilot | ~200K/đợt | J&T/GHN, 5-10 đơn đầu |
| Marketing | 0 VND | Chỉ dùng Zalo cá nhân, không ads Phase 1 |
| **Tổng fixed** | **~1M/tháng** | Scale đến 500 customers vẫn không đổi nhiều |

---

## 3. Chương trình CTV (Cộng Tác Viên)

### 3.1 Commission structure — MINIMAL để leader có margin

```
CTV bán L1 (590K):
  → CTV nhận: 50K (8.5%)
  → Leader nhận: 540K (91.5%) — đủ cover COGS + margin

CTV bán L2 (3,5tr):
  → CTV nhận: 200K (5.7%)
  → Leader nhận: 3,3tr (94.3%)

CTV bán L3 (12tr):
  → CTV nhận: 600K (5%)
  → Leader nhận: 11,4tr (95%)
```

Tại sao commission thấp? Vì:
- CTV nhận **AI Coach + Lead Magnet + Funnel đã build sẵn** (value cao, không cần tự build)
- Leader chịu logistics + fulfillment + customer service
- CTV chỉ cần share link → AI lo qualification → leader chốt
- CTV nhận **passive income** với effort ~2-3h/tuần (chỉ share + follow-up)

### 3.2 CTV recruitment criteria

| Yêu cầu | Lý do |
|---------|-------|
| Đã mua L1 của Leader | Tin tưởng product trước khi sell |
| Hoàn thành onboarding (Day 3) | Hiểu cách dùng AI Coach |
| Cam kết 5 connect/ngày | Minimum effort để qualify |
| Có Zalo active | Kênh bán chính |

### 3.3 CTV onboarding via Academy

```
Day 1: Leader giới thiệu CTV → Academy onboardingBot start
Day 1-3: AI Coach train: product pitch, FAQ, how to share funnel link
Day 4: CTV nhận referral link riêng (tracked trong Lead.assignedCtvId)
Day 5+: CTV bắt đầu share, leader theo dõi qua dashboard
```

Code đã có sẵn:
- `src/agents/onboardingBot.js` — onboarding flow
- `src/api/onboarding/*` — REST API
- Dashboard: `/onboarding` view

---

## 4. Revenue roadmap — tháng/tháng

### Tháng 1: "Proof of concept" (Tuần 1-4)
**Chiến lược:** Leader tự bán. Không CTV. Chỉ dùng network Zalo cá nhân.

| Tuần | Hành động | Target contacts | Target đơn | Doanh thu |
|------|-----------|----------------|-----------|----------|
| Tuần 1 | Gửi 30 Zalo (10 bạn thân + 10 khách cũ + 10 CTV tin cậy) | 30 | 1-2 L1 | 590K-1,2M |
| Tuần 2 | 50 contacts, test 3 phiên bản message | 50 | 2-3 L1 | 1,2-1,8M |
| Tuần 3 | 50 contacts, nhắn Zalo group + post story | 50 | 2-3 L1 | 1,2-1,8M |
| Tuần 4 | Review + chốt upsell L2 | - | 1 L2 | 3,5tr |
| **Tổng Tháng 1** | | **130 contacts** | **6-8 L1 + 1 L2** | **~5,5-7,5M GMV** |
| **Margin (70%)** | | | | **~3,9-5,3M** |

**KPI pass/fail:** ≥ 3 đơn L1 → pass → mời CTV. < 3 đơn → điều chỉnh funnel/message trước.

### Tháng 2-3: "First CTV wave" (2 CTV)
**Chiến lược:** Tuyển 1-2 CTV từ khách L1 đã mua.

```
Leader direct: ~4-5M margin/tháng (tương tự Tháng 1)
CTV #1 (giỏi hơn): sell 3-5 L1/tháng → Leader nhận override 270K-450K
CTV #2 (mới): sell 1-3 L1/tháng → Leader nhận override 90K-270K
→ Tổng: 5-6M + 360K-720K = **~5,7-6,7M/tháng**
```

**CTV onboarding mỗi người:**
- Tuần 1: Học product + cách dùng Funnel link
- Tuần 2: Leader dẫn 5 connect đầu tiên cho CTV (shadow)
- Tuần 3+: CTV tự chạy, leader check weekly

### Tháng 4-6: "Mini network" (3-5 CTV)
```
Leader direct: 4-6M
Team CTV (5 người × 4 L1/tháng TB): 20 L1 × 413K × 8.5% override = 700K
  + 1 CTV giỏi sell L2: 3,3tr × 10% = 330K
Upsell từ customers cũ (L2/L3 repeat): 1-2M
→ Tổng: **~8-10M/tháng**
```

### Tháng 7-12: "Systematized"
```
Leader direct: 4-5M (tiết kiệm effort, chỉ chốt deal lớn)
Team 8-12 CTV, tổng sell 35-50 đơn/tháng:
  Override cấp 1: 35-50 × 590K × 8.5% = 1,8-2,5M
  Override cấp 2 (CTV tuyển CTV): 0,5-1M
Pipeline L2/L3 upsell tự động: 2-4M
→ Tổng: **~12-15M/tháng**
```

---

## 5. Mapping sang code đã có

### 5.1 Trong tháng 1 — dùng những gì sẵn có

| Tính năng | File | Trạng thái | Cần action |
|-----------|------|-----------|-----------|
| Lead model | `src/models/lead.js` | ✅ Đã có | Dùng làm đăng ký L0 |
| Leads API | `src/api/leads.js` | ✅ Đã có | Leader tạo lead thủ công hoặc AI auto-create |
| Funnel analytics | `src/api/analytics-funnel.js` | ✅ Đã có | Xem conversion rates |
| Transition rules | `src/automation/funnelRules.js` | ✅ Đã có | L0→L1=L1→L2 đã có logic |
| Alert engine | `src/analytics/alertEngine.js` | ✅ Đã có | Stalled lead alerts (3 ngày không contact) |
| Dashboard | `src/dashboard/funnel-view.js` | ✅ Đã có | Xem metrics real-time |
| Onboarding bot | `src/agents/onboardingBot.js` | ✅ Đã có | Dùng cho L0 onboarding |

### 5.2 Phase plan còn cần build

#### Sprint 1: "Leader self-service" — 1 tuần

Mục tiêu: Leader tự vận hành end-to-end không cần CTO can thiệp.

**Cần thêm (mỗi thứ ~100-200 LOC):**

1. **Landing page / AI Coach entry point** (serve từ Express static)
   - File: `src/dashboard/public/landing.html` — đã có code máy, cần đưa lên
   - AI Coach auto-detect pain point → gợi ý sản phẩm → redirect đến Zalo Leader hoặc tạo order form

2. **Simple order form endpoint**
   ```javascript
   // src/api/orders.js (NEW, ~150 LOC)
   POST /api/orders — tạo đơn L1/L2/L3
   GET  /api/orders — xem danh sách đơn
   POST /api/orders/:id/mark-paid — leader đánh dấu đã chuyển khoản
   ```

3. **CTV referral tracking**
   ```javascript
   // Extend src/models/lead.js
   // Mỗi lead gắn assignedCtvId + referralSource
   // Khi lead convert → tự động tính commission cho CTV
   ```

4. **Commission dashboard mini-view**
   - Leader xem: CTV nào sell bao nhiêu, commission bao nhiêu
   - File: `src/dashboard/commission-view.js` (NEW, ~250 LOC)

#### Sprint 2: "CTV self-service" — 1 tuần

1. **CTV portal** — mỗi CTV chỉ xem leads của mình
   - Reuse existing RBAC (`requireRole.js`)
   - CTV (role: Member) thấy `visibleLeadScope` chỉ leads `assignedCtvId === me`

2. **Referral link generator**
   ```javascript
   GET /api/ctv/:ctvId/referral-link → trả về unique landing URL
   GET /api/ctv/:ctvId/commission → xem commission tháng
   GET /api/ctv/:ctvId/leads → xem leads cá nhân
   ```

3. **Weekly CTV auto-report** (Telegram bot)
   - Code đã có: `src/integrations/zalo-webhook.js`
   - Thêm: cron gửi weekly summary cho mỗi CTV
   ```
   📊 Tuần này của bạn:
   - Leads được assign: 5
   - Leads đã contact: 3
   - Converted: 1 đơn L1
   - Commission tuần này: 50K
   - Tổng commission tháng: 200K
   ```

#### Sprint 3: "Automation layer" — 1 tuần

1. **AI Coach sell mode** — đã có base, cần thêm:
   - Khi quiz complete → AI tính pain_point → recommend sản phẩm phù hợp
   - Offer link qua chat → đặt hàng

2. **Cron nurture** (đã có trong plan, cần implement)
   ```javascript
   // src/workers/cron.js
   // Chạy mỗi 2h:
   // 1. Tìm stalled leads (>3 ngày không contact)
   // 2. Gửi auto-nudge message qua Zalo
   // 3. Cập nhật leader alert nếu >7 ngày
   ```

3. **Stage-transition triggers** (đã có rules, man man cần wire vào API)
   ```javascript
   // POST /api/leads/:id/transition
   // Wire vào funnelRules.canTransition()
   // Code đã có logic, thiếu endpoint wrapper
   ```

---

## 6. Leader playbook — Từng bước tuần đầu tiên

### Trước khi bắt đầu (Tuần 0, 1 ngày)

```
□ Chọn nhóm khách hàng mục tiêu (vd: phụ nữ 28-50, quan tâm sức khỏe)
□ Viết 3 phiên bản Zalo message (test A/B):
    - Version A: "Chị có biết? [pain point]..."
    - Version B: "Chị ơi, em vừa tìm được tool free..."
    - Version C: Direct referral từ người quen
□ Chuẩn bị: STK ngân hàng + QR code
□ Setup 1 CTV đầu tiên (nếu có người sẵn sàng)
```

### Tuần 1: Chạy thử 30 contacts

**Ngày 1-2:** Gửi 10 Zalo với Version A message → đo tỷ lệ reply
- Nếu reply rate >30% → dùng Version A làm default
- Nếu <10% → đổi sang Version B sau

**Ngày 3-4:** Gửi tiếp 20 Zalo với version đã chọn

**Ngày 5-7:** Follow-up với người reply → gửi AI Coach link → hẹn review sau quiz

### Tuần 2: Chốt đơn + on-board CTV

**Lead quota:** 50 contacts/tuần
**Target:** 2-3 đơn L1 + setup 1 CTV đầu tiên

**CTV onboarding checklist:**
```
□ Giới thiệu: "Bạn sẽ bán sản phẩm wellness, AI Coach lo phần khó"
□ Demo 1 phiên AI Coach cho CTV xem cách nó hoạt động
□ CTV nhận referral link + commission structure
□ CTV tự test: share cho 3-5 người thân
□ Tuần sau: CTV target 10 contacts
```

### Tuần 3-4: Scale + optimize

- Leader: 50 contacts/tuần, target 5-6 đơn/tháng
- CTV: 10 contacts/tuần, target 1-2 đơn/tháng
- Leader dùng dashboard để theo:
  - Conversion rate theo version message
  - CTV nào active, CTV nào cần support
  - Leads nào cần follow-up (alert từ `alertEngine`)

### Hàng tháng (điểm họp 15 phút với team)

```
1. Leader xem dashboard funnel rates (5 phút)
2. Review top CTV + coach bottom CTV (5 phút)
3. Chốt deals L2/L3 từ customers cũ (5 phút)
```

---

## 7. Success metrics theo phase

| Phase | Metric | Target tháng 1 | Target tháng 3 | Target tháng 6 | Target tháng 12 |
|-------|--------|---------------|---------------|----------------|-----------------|
| **Leader direct** | L1 đơn/tháng | 4-6 | 4-6 | 3-5 | 3-5 |
| **Leader direct** | L2 đơn/tháng | 0-1 | 1-2 | 2-3 | 3-4 |
| **Leader direct** | L3 đơn/tháng | 0 | 0-1 | 1 | 2 |
| **CTV team** | Số CTV active | 0 | 1-2 | 3-5 | 8-12 |
| **CTV team** | L1 đơn/tháng | 0 | 2-4 | 10-15 | 30-40 |
| **Revenue** | GMV/tháng | 3-5M | 5-8M | 10-12M | 15M+ |
| **Revenue** | Leader margin/tháng | 2-3,5M | 4-5M | 7-8M | 10-12M |
| **Efficiency** | Time Leader/spend | 3-4h/ngày | 3h/ngày | 2-3h/ngày | 1-2h/ngày |

---

## 8. Risk & mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| L1 conversion thấp (<3%) | Không đủ evidence để mời CTV | Tuần 1-2 chạy A/B test, nếu fail → điều chỉnh funnel/messaging trước khi scale |
| CTV attrition cao | Giữ team lean, not bloated | CTV không commit → không recruit. Quality > quantity |
| Compliance TPCN | Bị Bộ Y tế/BCT xử lý | NO disease cure claims trong mọi content. Hẹn gặp coach để tư vấn, không quảng cáo TPCN như thuốc |
| Leader time burnout | Quá nhiều phiên AI Coach + follow-up | Tuần 4 đã có CTV lo qualification. Leader chỉ chốt deals lớn |
| Leader cạn contacts | Mạng network hết sau vài tháng | Phase 2: thêm cold outreach + content marketing. Phase 1: chỉ dùng warm network |
| CTV tự riêng (giữ commission) | Leader mất team | Contract đơn giản: thỏa thuận verbal + commission tracking. CTV không có system nên rất khó chạy solo (AI + Funnel + Fulfillment đều của Leader) |

---

## 9. Implementation checklist

### This week (tuần 0):
- [ ] Chọn nhóm khách hàng mục tiêu + segment Zalo contacts
- [ ] Viết 3 phiên bản Zalo outreach message
- [ ] Setup STK + QR ngân hàng
- [ ] Tạo 1 landing page đơn giản (landing + AI Coach link)
- [ ] Cấp quyền test landing page cho 5 bạn bè

### Week 1-2 (test phase):
- [ ] Chạy outreach 30 contacts/ngày cho Leader
- [ ] Đo: reply rate → click landing → quiz complete → L1 purchase
- [ ] Nếu >5% L1 conversion → tiếp tục. <3% → điều chỉnh

### Week 3-4 (proof phase):
- [ ] Target 6-10 L1 + 1-2 L2
- [ ] Chốt 5M margin nếu đúng target
- [ ] Onboard CTV đầu tiên từ list khách L1 đã mua

### Month 2+ (scale phase):
- [ ] Leader 50 contacts/tuần
- [ ] CTV #1 tự chạy: 10 contacts/tuần
- [ ] Weekly 15ph team sync qua Telegram
- [ ] Mỗi tháng: review funnel rates, optimize bottom tier

---

## Appendix: Tech scope tổng

**Đã có sẵn (không cần build gì thêm để bắt đầu):**
- ✅ Funnel stages L0-L4 (`src/models/lead.js`)
- ✅ Transition rules (`src/automation/funnelRules.js`)
- ✅ Leads CRUD API (`src/api/leads.js`)
- ✅ Funnel analytics (`src/api/analytics-funnel.js`)
- ✅ Dashboard views (`src/dashboard/funnel-view.js`, `leads-view.js`)
- ✅ Alert engine (`src/analytics/alertEngine.js`)
- ✅ Onboarding bot (`src/agents/onboardingBot.js`)
- ✅ Auth + RBAC (`src/middleware/requireRole.js`)

**Cần build để chạy full cycle (ước ~2-3 tuần dev):**

| Item | Files | LOC estimate | Priority |
|------|-------|-------------|----------|
| Order form API | `src/api/orders.js` (new) | ~150 | P0 |
| Landing page public | `src/dashboard/public/` (new) | ~200 | P0 |
| CTV referral tracking | extend `src/api/leads.js` | ~100 | P0 |
| Commission view | `src/dashboard/commission-view.js` (new) | ~250 | P1 |
| CTV API (self-service) | extend `src/api/leads.js` | ~100 | P1 |
| Cron nurture | `src/workers/cron.js` (new) | ~200 | P2 |
| Weekly CTV report | extend `src/integrations/zalo-webhook.js` | ~150 | P2 |
| AI Coach sell mode | extend onboardingBot prompt | ~100 | P1 |

**Total: ~1,250 LOC for full MVP deployment.**
**Timeline: Founder tự code với 1 dev, ~2-3 tuần. Hoặc delegate cho 1 dev part-time.**

---

*Mô hình này tối giản: Funnel OS đã có 80% backend. Leader chỉ cần order form + landing + CTV commission tracking để launch. Hết 2 tuần dev là có thể chạy revenue.*
