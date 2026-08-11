# Funnel OS — Feasibility Audit & Gap Analysis
> **Ngày audit:** 2026-07-06 | **Auditor:** Claude
> **Scope:** Toàn bộ stack hiện tại → những gì cần có để tạo doanh số thực tế

---

## EXECUTIVE VERDICT

> **STATE HIỆN TẠI CỦA CODE = DEMO, KHÔNG PHẢI PRODUCT THƯƠNG MẠI.**
> Có thể fake revenue với các lead giả. Không thể bán hàng thực cho khách thật vì thiếu 4 critical gaps.

```javascript
// Có thể chạy:   ✅ Express server starts, dashboard loads, leads create/view
// Có thể bán:     ❌ NO. Không có cách để khách mua hàng.
// Có thể thu tiền: ❌ NO. Không có payment, order, checkout.
// Có thể ship:    ❌ NO. Không có fulfillment tracking.
// Có thể CTV bán: ❌ NO. Không có commission calculation, không có referral tracking functional.
```

---

## TIER 1 — CRITICAL GAPS (4 thứ)
*Không sửa được những cái này = KHÔNG BAO GIỜ có doanh số.*

### ❌ 1. NO ORDER / PRODUCT SYSTEM

**Vấn đề:** Server có đầy đủ `leads`, `members`, `habits`, `kpi`, `alerts`, `training`, `onboarding`... nhưng **không có endpoint nào để tạo đơn, xem sản phẩm, xác nhận thanh toán.**

```
Hiện có:                  Thiếu:
├── Leads CRUD            ├── Products (L1, L2, L3 catalog)
├── Lead → chốt ???       ├── Order creation
├── Payment ???           ├── Payment confirmation
└── AI recommend ???      └── Order fulfillment tracking
```

**Consequence:** Lead đi hết funnel L0→L1→L2, AI Coach recommend sản phẩm... rồi thua. Không có "Add to cart" → "Place order" → "Chuyển khoản" → "Xác nhận" → "Gửi hàng".

**Cần build:**
```
src/models/product.js    — Product catalog (name, price, COGS, description, image URL)
src/api/orders.js        — POST /api/orders, GET /api/orders, PATCH /api/orders/:id/status
src/api/products.js      — GET /api/products, GET /api/products/:id
                         — OR merge vào orders.js
```

### ❌ 2. NO PUBLIC LANDING PAGE / CHECKOUT

**Vấn đề:** `src/dashboard/public/` **KHÔNG TỒN TẠI**. Tất cả views trong dashboard (funnel-view, leads-view, psn-health...) đều yêu cầu JWT auth. Không có route nào cho anonymous visitor.

**JWT auth requirement blocks the entire funnel:**
```javascript
// src/middleware/requireRole.js
// TẤT CẢ routes trong src/api/ đều requireAuth
// → Lead không thể submit quiz mà không có account
// → Khách lạ không thể mua sản phẩm mà không đăng ký
```

**Consequence:** Lead click vào landing link → 404 hoặc "please login" → chết. AI Coach quiz không thể mở cho anonymous user.

**Cần build:**
```
src/dashboard/public/landing.html       — Public landing page (Zalo OA redirect)
src/dashboard/public/quiz.html          — AI Coach quiz (no auth required)
src/dashboard/public/checkout.html      — Order form + bank info
src/api/public/quiz.js                   — POST /api/public/quiz (anonymous)
src/api/public/leads.js                  — POST /api/public/leads (anonymous submit)
```

### ❌ 3. NO PAYMENT SYSTEM

**Vấn đề:** Tài liệu nói "chuyển khoản ngân hàng" nhưng không có code nào để:
- Xác nhận lead đã chuyển khoản (chưa có payment proof upload)
- Đối chiếu số tiền với bank statement
- Đánh dấu đơn đã thanh toán
- Gửi thông báo cho CTV/Leader khi có tiền vào

**Consequence:** Leader nhận Zalo message "em chuyển 590K rồi ạ" phải tự check bank app, tự đánh dấu đơn hoàn thành. Không có audit trail. Không thể scale.

**Cần build (chọn 1 trong 3 option):**

| Option | Công sức | Chi phí | Phù hợp |
|--------|---------|---------|---------|
| A. Manual confirmation | ~50 LOC | 0đ | Solo leader, <20 đ/tháng |
| B. QR auto-check (MoMo/ZaloPay sandbox) | ~300 LOC | ~3tr/tháng | Scale 20-100 đ/tháng |
| C. Full payment gateway | ~800 LOC | ~5-10tr/tháng | Scale 100+/tháng |

**Recommendation:** Option A cho tuần 1-4. Leader xem bank app, click "Đã thanh toán". Code thêm `PATCH /api/orders/:id/mark-paid` → đủ.

### ❌ 4. NO PRODUCT CATALOG DATA MODEL

**Vấn đề:** L1/L2/L3 dùng toàn hardcoded string trong docs và dashboard: "590K", "3-5tr", "10-15tr". Không có Product model. Không có cách để:
- Thêm/sửa/xóa sản phẩm
- Set inventory (còn hàng không?)
- Set real-time pricing
- Add product images

**Consequence:** Mỗi lần đổi giá hoặc thêm sản phẩm mới phải sửa nhiều file JS. Không scalable. Lỗi pricing dễ xảy ra.

**Cần build:**
```
src/models/product.js — Product với {id, name, price, cogs, tierLevel, description, imageUrl, active, stock}
src/api/products.js  — CRUD (Admin/PSN Leader only)
```

---

## TIER 2 — MAJOR GAPS (5 thứ)
*Không sửa được = doanh số bị giảm 50-80% hoặc quá tốn effort.*

### ⚠️ 5. IN-MEMORY DATA STORE — PRODUCTION FATAL

**Vấn đề:** TẤT CẢ data hiện tại nằm trong biến JavaScript `leads = []`, `members = []`. Khi server restart → mất toàn bộ.

```javascript
// src/models/lead.js — pattern across ALL models:
let _leads = new Map();  // or []
// → Restart = empty
```

D1 Cloudflare đã configured trong `wrangler.toml` nhưng Express (`src/server.js`) không dùng. Cũng không có DB adapter cho Express.

**Consequence:** Test với vài lead OK. Test với 100+ leads bằng các browser khác nhau → restart để fix bug → mất hết. Không có backup. Không có history.

**Fix:**
- Phase 0 ulta: Thêm `localStorage` persistence cho dev testing
- Phase 1: Chuyển `src/models/*.js` sang D1 SQLite (đã có `src/db/adapter.js` base)
- Phase 2: Cloudflare Workers production deployment

### ⚠️ 6. AI COACH RECOMMENDATION → BUY CHỐT NGANG (Broken conversion)

**Vấn đề:** `src/agents/onboardingBot.js` collect quiz answers và gợi ý hành trình. Nhưng không có code nào:
- Convert quiz result → "Bạn phù hợp với gói L1 (590K)"
- Tạo deep link với CTV referral code
- Redirect đến checkout với pre-filled data

**Current flow:**
```
User vào landing → (không có page) → ???
```

**Expected flow:**
```
User vào quiz → AI Coach(5 câu) → AI recommend sản phẩm →
Hiện giá + CTV name → "Chat với [CTV name] để đặt hàng" →
Telegram/Zalo link sẵn → CTV contact + leader fulfill
```

### ⚠️ 7. REFERRAL TRACKING KHÔNG FUNCTIONAL

**Vấn đề:** `Lead` model có `assignedCtvId` và `promotedFromId`. Nhưng:
- Không có API endpoint để tạo referral link
- Không có code auto-assign lead khi người click referral link
- Không có commission calculation engine
- Lead có `assignedCtvId` nhưng tạo lead mới KHÔNG auto-set assignedCtvId từ URL param

**Consequence:** Mỗi CTV phải nhớ tự chọn "đây là lead của tôi" khi tạo. Leader phải manually assign. Commission tính bằng Excel, không bằng code.

### ⚠️ 8. ZALO OA INTEGRATION CHƯA HOÀN TẬT

**Vấn đề:** `src/integrations/zalo-webhook.js` exists nhưng:
- Chưa confirm có endpoint handler trong `src/server.js` (chưa thấy `app.post('/webhook/zalo')` hoặc tương tự)
- Chưa có Zalo Official Account setup guide (app ID, secret, token)
- Chưa có "gửi tin nhắn tự động" pattern — follower gửi tin → webhook → API → AI Coach → reply

**Consequence:** Không thể dùng Zalo làm channel #1 cho lead intake. Phải dùng Telegram (đã có) nhưng Zalo có network của Droppii sẵn → lãng phí.

### ⚠️ 9. NO REAL-TIME NOTIFICATION CHO LEADER

**Vấn đề:** Có `alertEngine` (Rule-based) và có `Telegram Bot`. Nhưng:
- Không có notify khi có lead mới L0
- Không có notify khi có đơn mới L1
- Không có notify khi có tiền chuyển vào (manual confirm)

**Consequence:** Leader phải refresh dashboard liên tục để check. Quên check → lead chết (stalled). L1 mua nhưng không confirm → khách bực.

---

## TIER 3 — MEDIUM GAPS (4 thứ)
*Có thể tạm workaround nhưng tốn effort khổng lồ.*

### 🟡 10. NO CUSTOMER LIFECYCLE AFTER FIRST PURCHASE
- Không có follow-up sequence sau khi khách nhận hàng (ngày 3, 7, 14, 30)
- Không có upsell trigger L1→L2 (nên gửi sau 21 ngày dùng L1)
- Không có referral prompt sau khi khách hài lòng (ngày 30)
- Thiếu this → LTV thấp, repeat rate thấp

### 🟡 11. CTV SELF-SERVICE PORTAL NOT BUILT
- CTV không thể register để join
- Không xem leads cá nhân (dashboard dành cho Leader/Admin)
- Không track commission của mình
- Không xem leaderboard so với CTV khác
- CTV onboarding có AI bot nhưng không có CTV-facing dashboard

### 🟡 12. NO COMPLIANCE FLOW (PDPA + TPCN)
- Không có consent checkbox ("đồng ý nhận thông tin sản phẩm")
- Không có data export/deletion (PDPA yêu cầu)
- Không có disclaimer trên landing page (TPCN compliance)
- Không có age verification (sản phẩm wellness, không sell cho <18)

### 🟡 13. NO LEAD SCORING / PRIORITIZATION
- Alert engine có stalled detection nhưng không có "hot lead" scoring
- Tất cả leads đều equal → Leader phải manual sort
- Không có auto-qualification: quiz score > X → auto-assign priority
- Không có auto-rejection: quiz score < Y → mark as "lost" với lý do

---

## TIER 4 — NICE TO HAVE

- 🟢 No A/B testing framework cho landing/messaging
- 🟢 No lead enrichment (Zalo profile lookup, social data)
- 🟢 No cart / multi-product orders
- 🟢 No subscription/recurring billing (L2 auto-renew, L3 auto-ship)
- 🟢 No customer reviews/ratings
- 🟢 No CTV gamification (badge, leaderboard, streak)

---

## SECURITY AUDIT

| Item | Status | Risk |
|------|--------|------|
| CORS (no origin config) | ❌ Wide open | Medium — any site can call APIs |
| Helmet (security headers) | ❌ Missing | Low — XSS, clickjacking possible |
| Rate limiting | ❌ Missing | Medium — API abuse, cost spike |
| Input sanitization | ❌ None | Medium-High — XSS in dashboard |
| JWT secret | ⚠️ Dev value in .env.example | Critical if deployed with this key |
| Encryption key | ⚠️ Dev value in .env.example | Critical — PII might be "encrypted" with weak key |
| Password hashing | ⚠️ Referenced but Admin-only delete | Low — no public registration, no brute force vector |
| PDPA consent | ❌ Missing | High — legal risk if selling to VN customers |
| Data export/deletion | ❌ Missing | High — PDPA legal requirement |

---

## DEPLOYMENT AUDIT

| Layer | Dev | Prod | Gap |
|-------|-----|------|-----|
| Runtime | Express (`src/server.js`) | Cloudflare Workers (`src/workers/index.js`) | ❌ Workers file chưa có / chỉ sync partial |
| Database | In-memory `[]` | D1 SQLite (`database_id: def140e1...`) | ❌ Express không connect D1 |
| Storage | N/A | R2 Storage (bucket: hive-warfare-storage) | ❌ Chưa dùng |
| Cache | N/A | KV (CACHE namespace) | ⚠️ Configured nhưng KV không dùng |
| Cron | N/A | `crons = ["0 0 * * *"]` | ✅ Daily midnight cron configured |
| Hosting dev | localhost:3000 | Cloudflare Pages + Workers | ⚠️ Chưa deploy production |
| SSL | ❌ Dev only | ✅ Cloudflare auto-SSL | Auto khi deploy |

**Key finding:** The current setup is WORKS FOR LOCAL DEV ONLY. Production deployment requires `src/workers/index.js` to mirror all Express routes, which it likely doesn't do yet (not audited for this report).

---

## FEASIBILITY SCORE

| Dimension | Score | Note |
|-----------|-------|------|
| **Backend logic** | 7/10 | Crud operations for leads/members/kpi/solid. Missing orders/products. |
| **Frontend (leader)** | 7/10 | Dashboard works, views exist. Missing public-facing pages. |
| **Frontend (ctv)** | 2/10 | Không có CTV self-service portal |
| **Payment** | 0/10 | Không tồn tại |
| **Fulfillment** | 0/10 | Không tồn tại |
| **Storage/DB** | 3/10 | In-memory = dev only. D1 configured nhưng chưa wire. |
| **AI/Sell** | 5/10 | AI Coach works cho quiz/training. Missing buy flow trigger. |
| **Referral/CTV** | 3/10 | Data model có nhưng business logic chưa implement |
| **Security** | 3/10 | Many gaps, manageable solo but needs fixing before public |
| **Deployment** | 4/10 | Dev works, production path unclear |
| **Tests** | 6/10 | Test suite exists, 17 files. Unknown pass rate without running. |

**OVERALL FEASIBILITY: 3.5/10 for generating ACTUAL revenue**
**OVERALL FEASIBILITY: 8/10 for generating MOCK/DEMO revenue**

---

## PRIORITIZED ROADMAP TO REVENUE

### WAVE 1: MINIMUM VIABLE SELL (Tuần 1) — Target: 1st đơn
*Fix 4 CRITICAL gaps. Chỉ build những gì cần cho 1 cuộc gọi bán hàng thành công.*

```
Priority 0A: Product catalog data model + seed data
  → src/models/product.js (50 LOC)
  → src/api/products.js (GET /api/products) (30 LOC)
  → Seed 3 products: L1 (590K), L2 (3,5tr), L3 (12tr)

Priority 0B: Order creation endpoint
  → POST /api/orders (create từ lead + product)
  → GET /api/orders (Leader xem tất cả)
  → PATCH /api/orders/:id/mark-paid (Leader đánh dấu)
  → ~150 LOC

Priority 0C: Public landing page (no auth)
  → src/dashboard/public/landing.html
  → AI Coach quiz embed (no JWT required)
  → "Đặt hàng" button → chuyển Zalo Leader hoặc form đơn
  → ~150 LOC

Priority 0D: Bank transfer check → manual mark-paid
  → Leader check ZaloPay/MoMo/bank app
  → Click "Đã nhận tiền" trong dashboard
  → → Trigger: CTV commission calculation, lead → L1 conversion
  → ~30 LOC (UI only, logic simple)
```

**Tuần 1 deliverable:** Leader gửi Zalo → Khách vào landing → Quiz → "Đặt hàng" → Leader nhận notification → Check bank → Mark paid → First revenue.

### WAVE 2: CTV ONBOARDING (Tuần 2-3) — Target: 1st CTV sell
```
Priority 1A: Referral link system
  → GET /api/leads?referral_code=CTV001 → auto-set assignedCtvId
  → CTV nhận unique link mỗi người

Priority 1B: Commission calculator
  → POST /api/commission/calculate (tháng)
  → GET /api/commission/:ctvId/month

Priority 1C: Zalo OA webhook (real-time lead intake)
  → app.post('/webhook/zalo', ...) in server.js
  → Customer nhắn Zalo OA → auto-create Lead L0

Priority 1D: Post-purchase follow-up (ngày 3, 7, 14, 30)
  → Cron định kỳ gửi Zalo message/ZNS
  → Auto-upsell L2 sau ngày 21
```

### WAVE 3: SCALE (Tuần 4-8) — Target: 5M/tháng
```
Priority 2A: CTV self-service dashboard
  → CTV xem leads riêng, commission, leaderboard
  → CTV tự generate referral link

Priority 2B: D1 migration (in-memory → D1)
  → Update src/models/lead.js, member.js, product.js
  → Wire through src/db/adapter.js
  → Data persists across restarts

Priority 3C: Security hardening
  → CORS origin whitelist
  → Helmet headers
  → Rate limiting
  → Input sanitization

Priority 3D: PDPA compliance
  → Consent checkbox ở landing
  → Data export/delete endpoints
  → Privacy policy page
```

### WAVE 4: OPTIMIZE (Tháng 2+) — Target: 10M/tháng
```
- MoMo/ZaloPay integration (auto payment confirmation)
- R2 Storage cho product images
- LTV optimization (upsell automation)
- A/B testing cho messaging
- React Native mobile app cho CTV (thay web dashboard)
```

---

## WORK BREAKDOWN — ESTIMATED LOE

| Work item | LOC | Priority | Timeline |
|-----------|-----|----------|---------|
| Product catalog (model + API + seed) | 200 | P0 | 1 ngày |
| Orders API (create/read/mark-paid) | 300 | P0 | 1-2 ngày |
| Public landing page (no auth) | 200 | P0 | 1 ngày |
| CTV commission calculator | 200 | P1 | 1 ngày |
| Referral link auto-assign | 100 | P1 | 0.5 ngày |
| Zalo webhook → auto-create lead | 150 | P1 | 1 ngày |
| Post-purchase nurture cron | 200 | P2 | 1 ngày |
| CTV self-service dashboard | 400 | P2 | 2-3 ngày |
| D1 migration (models + adapter) | 500 | P2 | 2-3 ngày |
| Security hardening | 300 | P3 | 1-2 ngày |
| PDPA compliance | 300 | P3 | 1-2 ngày |
| AI Coach sell-mode trigger | 200 | P1 | 1 ngày |
| **TOTAL P0 (doanh số tháng 1)** | **~850** | — | **~1 tuần** |
| **TOTAL P0-P1 (CTV bán được)** | **~1,550** | — | **~2 tuần** |
| **TOTAL ALL** | **~3,000** | — | **~4-6 tuần** |

---

## RISK MATRIX — CHÂN THỰC

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|-----------|--------|
| Leader mất hứng sau 1 tuần không có đơn | HIGH | HIGH | Wave 1 đủ cho đơn đầu tiên trong tuần 1 nếu leader có network | Mitigatable |
| CTV bán không được → tụt hết team | HIGH | HIGH | CTV commission thấp (5-8.5%) = low risk for leader | Acceptable |
| Codebase phức tạp → leader phải thuê dev | MEDIUM | HIGH | Wave 1 chỉ cần 850 LOC. Leader tự code được hoặc thuê 1 dev 1 tuần | Manageable |
| Zalo OA approval delay (5-10 ngày) | MEDIUM | HIGH | Phase 1 dùng Telegram + Zalo cá nhân trước | Workaround |
| Compliance (BCT/Y tế) | LOW-MED | CRITICAL | NO disease claim, NO income guarantee. Tone guide rõ ràng. | Nếu fail = shutdown |
| Data loss (in-memory) | MEDIUM | HIGH | Wave 3 migrate sang D1 | Phải fix trước scale |
| Payment fraud (fake xác nhận) | LOW | MEDIUM | Leader check bank app là đủ. CTV không có authority mark-paid. | Acceptable |

---

## KẾT LUẬN

**Reply to user's question: "Tính khả thi và điều còn thiếu để tạo doanh số"**

Tính khả thi: **CÓ** — nhưng chỉ với điều kiện:
1. Leader tự bán trước (tháng 1), không phụ thuộc CTV
2. Sửa 4 critical gaps trước (850 LOC, ~1 tuần dev)
3. Chấp nhận workaround manual cho payment, fulfillment, communication phase đầu

Điều còn thiếu (theo priority):

```
PHẢI CÓ TRƯỚC KHI BÁN (P0 — 850 LOC, 1 tuần):
  □ Product catalog (L1, L2, L3)
  □ Order creation endpoint
  □ Public landing page (no auth)
  □ Payment confirmation (manual ok)

CẦN ĐỂ CTV BÁN ĐƯỢC (P1 — 700 LOC, 1 tuần):
  □ Referral link tracking
  □ Commission calculator
  □ AI Coach sell-mode trigger
  □ Zalo webhook intake

KHẮC PHỤC TRƯỚC KHI SCALE (P2 — 1,200 LOC, 2-3 tuần):
  □ D1 database migration
  □ CTV self-service dashboard
  □ Post-purchase nurture automation
  □ Security hardening
```
