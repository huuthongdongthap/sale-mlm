# Audit Trước — Funnel OS Revenue Gap Analysis
> **Ngày:** 2026-07-07 | **Baseline:** feasibility-audit.md (2026-07-06) + codebase current state
> **Scope:** Điều gì đã fix, điều gì còn thiếu để tạo doanh số thực tế

---

## TL;DR — TRIẾT LÝ LÀM VIỆC

> **Trước khi build thêm: phải fix bug hiện có.**
> Bug = code chạy fail. Build thêm feature trên buggy code = lãng phí.
>
> **Thứ tự đúng:**
> 1. Fix bugs (code chạy được)
> 2. Build features (code đúng chạy tốt)

Code hiện tại: **Workers chạy được NHƯNG có bug runtime chưa fix.**
Cần fix bugs trước khi build Wave 1 (product catalog, public landing, payment).

---

## GAP ANALYSIS — Audit vs Reality

### ✅ ALREADY FIXED (từ feasibility audit dated 2026-07-06)

| # | Audit Item | Status | Evidence |
|---|-----------|--------|---------|
| 1 | Product catalog model | ✅ DONE | `products` table migration 0004 + `handleListProducts` endpoint line 982-987 |
| 2 | Orders table + schema | ✅ DONE | `orders` + `order_items` tables, CREATE/INSERT in migration 0004 |
| 3 | Order creation endpoint | ✅ DONE | `handleCreateOrder` line 1036-1065, POST /api/orders |
| 4 | D1 DB migration (in-memory → D1) | ✅ DONE | All Workers routes use `env.DB`, no in-memory store in Workers path |
| 5 | Referral tracking (assigned_ctv_id) | ✅ DONE | leads.assigned_ctv_id, commission engine line 290-328 |
| 6 | Commission calculator | ✅ DONE | `handleCommissionCalculate` + `handleCommissionBatch` + `handleCommissionHistory` |
| 7 | Funnel analytics | ✅ DONE | `handleFunnelMetrics` line 1115-1135, conversion rates + revenue by tier |
| 8 | Lead assignment endpoint | ✅ DONE | PATCH /api/leads/:id with assigned_ctv_id, status, notes |

### 🔴 STILL CRITICAL — Blocking Revenue

| # | Audit Item | Current State | Gap | Revenue Impact |
|---|-----------|--------------|-----|----------------|
| **P0-A** | **Public landing page (no auth)** | ❌ `src/dashboard/public/` NOT FOUND. All 34 routes require JWT. | Anonymous user → 404/401. Lead cannot enter funnel without account. | **100% — Không có lead mới nào vào được nếu không có leader tạo account trước** |
| **P0-B** | **Order mark-paid endpoint** | ❌ NO handler exists. `handleCreateOrder` creates order with `status = 'pending'`. `handleGetOrder` reads it. `handleListOrders` lists them. **But no endpoint to change status from 'pending' → 'paid'.** | Orders stuck at "pending" forever. No fulfillment trigger. No commission payout. | **100% — Không thể chốt đơn. Không có revenue.** |
| **P0-C** | **Payment proof upload** | ❌ No file upload endpoint. No R2 usage for payment evidence. | Leader cannot attach bank transfer screenshot. No audit trail of payment. | **High — Manual only. Leader phải check bank app manually, không có proof trong system.** |
| **P1-A** | **Product recommendation trigger** | ⚠️ Quiz data collected (`quiz_answers`, `intent_score` on leads). BUT: no code converts quiz → product recommendation. `handleCreateOrder` requires `product_id` — no auto-suggest. | AI Coach recommends hành trình, không recommend sản phẩm cụ thể. Không có "Bạn phù hợp L1 (590K) — chat CTV để đặt". | **High — Conversion funnel broken at recommendation step** |
| **P1-B** | **Referral link auto-assign from URL** | ⚠️ `handleCreateLead` (line 989) does NOT read `?ctvId=` or `?referral=` from URL query params. `assigned_ctv_id` is NULL on all new leads. Required manual PATCH to assign. | Lead created from landing page = no CTV attribution. Commission = 0. CTV không có incentive share link. | **High — CTV không bán được vì không track được lead của họ** |

### 🟡 PARTIAL — Workaround Exists

| # | Audit Item | Current State | Gap |
|---|-----------|--------------|-----|
| 6 | AI Coach sell trigger | Partial — Onboarding bot exists but no "recommend_product" function. Quiz → L0 lead only, not → buy flow. | Need AI recommendation engine |
| 8 | Zalo OA webhook | Partial — `src/integrations/zalo-webhook.js` exists but NOT registered in Workers route handler (line 927-1217). | Webhook receives but no route processes it |
| 9 | Real-time notifications | Partial — Telegram bot + alert engine exist. No specific "new L0 lead" or "new order" push to leader. | Leader must poll dashboard |

### 🟢 ALREADY DONE (added post-audit)

| # | Feature | Evidence |
|---|---------|---------|
| — | PBKDF2 password hashing in Workers | `handleRegister` line 336 |
| — | Rate limiter (per-isolate) | `rateLimit` function line ~107 |
| — | KV cache layer | `cacheGet`/`cacheSet`/`cacheGetOrFetch` pattern |
| — | Cron trigger (daily 00:00) | `wrangler.toml` + `scheduled()` handler line 1224 |
| — | Audit trail | `audit_trail` table + logging in handlers |
| — | Encryption utilities | `src/utils/encryption.js` AES-256-CBC |

---

## 🔴 BUG FOUND DURING AUDIT — Must Fix Before Building Anything

### Bug #1: `kpiRecords` undefined (line 881) — CRASH

**Location:** `src/workers/index.js:843-884` — `handleTrainingProgress`

```javascript
// Line 860
case 'day_complete':
  dayCompletions.push({ day: value, date: now });
// Line 876
case 'habit_score': habitScores.push({ score: value, date: now }); break;
// Line 877
case 'order': ... break;               // ← doesn't init kpiRecords
// Line 881
case 'kpi': kpiRecords.push({ ...value, date: now }); break;  // ← CRASH: kpiRecords never declared
```

`kpiRecords` is never initialized. When type = 'kpi' → ReferenceError → Worker returns 500.

**Impact:** Training progress tracking is broken. Any POST to `/api/training/progress` with `type: 'kpi'` crashes.

### Bug #2: `btoa()` fails on Vietnamese characters (line 40)

**Location:** `src/workers/index.js:40` — `base64urlEncode`

```javascript
const base64urlEncode = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
```

`btoa()` only handles Latin-1. Vietnamese names with accents → corrupted JWT payload.

**Impact:** Members with Vietnamese names get broken tokens. Login/register with `name: "Nguyễn Văn A"` → JWT corruption → auth fails silently.

### Bug #3: Dual route registration for leads (line 1169-1177)

**Location:** `src/workers/index.js:1169` AND `src/workers/index.js:1176-1177`

```javascript
// Line 1169
if (path === '/api/leads' && method === 'GET') { authMiddleware... handleListLeads }
// Line 1176 — DUPLICATE, no auth check!
if (path === '/api/leads' && method === 'POST') return await handleCreateLead(request, env);  // ← NO auth = intentional (public)
// Line 1177 — DUPLICATE GET, WITH auth
if (path === '/api/leads' && method === 'GET') { authMiddleware... handleListLeads }
```

Line 1177 overwrites line 1169. Line 1176 (POST, no auth) is correct for public lead capture. But the duplicate GET at 1177 means line 1169 is dead code.

**Impact:** Code confusion. Not a runtime bug due to if-chain ordering, but misleading.

---

## PRIORITIZED FIX-BEFORE-BUILD LIST

### Phase 0: Fix Bugs (MUST do before ANY feature build)

| # | Bug | LOC | File |
|---|-----|-----|------|
| B1 | Init `kpiRecords`, `dayCompletions`, `habitScores`, `orderRecords` in `handleTrainingProgress` | +4 | `src/workers/index.js:853` |
| B2 | Fix `btoa()` → `TextEncoder` + base64 for multi-byte chars | +6 | `src/workers/index.js:40` |
| B3 | Remove duplicate lead route (line 1169) | -4 | `src/workers/index.js:1169` |

**Total: ~10 LOC. Should take 15 minutes.**

### Phase 1: P0 Revenue Enablers (~200 LOC, 2-3 days)

| # | Feature | What to build | Revenue Enables |
|---|---------|--------------|-----------------|
| P0-A | **PATCH /api/orders/:id/mark-paid** | `handleMarkPaid` → SET status='paid', paid_at=NOW(), trigger commission calc | Leader confirms payment → Order fulfilled → Revenue recorded → Commission paid |
| P0-B | **Public lead capture (no auth)** | Already EXISTS: POST /api/leads (line 1176, no auth ✅). Need: GET /api/products (already exists ✅). Need: public quiz page | Anonymous user → submit quiz → create lead → gets product recommendation |
| P0-C | **Referral auto-assign from URL** | `handleCreateLead` → read `?ctvId=` from URL → set `assigned_ctv_id` | CTV share link → lead auto-attributed → commission tracked |

### Phase 2: P1 Conversion Features (~400 LOC, 3-4 days)

| # | Feature | What to build | Revenue Enables |
|---|---------|--------------|-----------------|
| P1-A | **Product recommendation engine** | POST /api/leads/:id/recommend → quiz_answers → suggest product tier | "Bạn phù hợp L1 (590K)" → direct to order |
| P1-B | **Public landing + checkout page** | `/public/quiz.html`, `/public/checkout.html` (Vite route, no auth required) | Customer journey: landing → quiz → recommend → order → payment |
| P1-C | **Zalo OA webhook route** | Register `/api/webhook/zalo` handler in Workers | Zalo message → auto-create lead |

---

## COMPLETE API INVENTORY — Workers

### Existing Endpoints (34 total)

| Method | Path | Auth | Handler | Status |
|--------|------|------|---------|--------|
| GET | /health | No | handleHealth | ✅ |
| POST | /api/auth/register | No | handleRegister | ✅ |
| POST | /api/auth/login | No | handleLogin | ✅ |
| POST | /auth/verify | No | handleVerifyToken | ✅ |
| GET | /auth/users | No | handleAuthUsers | ✅ |
| GET | /api/members | Yes | handleListMembers | ✅ |
| GET | /api/members/:id | Yes | handleGetMember | ✅ |
| POST | /api/members | Yes | handleCreateMember | ✅ |
| PATCH | /api/members/:id | Yes | handleUpdateMember | ✅ |
| DELETE | /api/members/:id | Yes | handleDeleteMember | ✅ |
| POST | /api/habits/checkin | Yes | handleHabitCheckin | ✅ |
| GET | /api/habits | No | handleListHabits | ✅ |
| GET | /api/habits/streak/:id | Yes | handleHabitStreak | ✅ |
| POST | /api/habits/snapshot | Yes | handleHabitSnapshot | ✅ |
| POST | /api/habits/quick | Yes | handleHabitQuick | ✅ |
| GET | /api/kpi/leaderboard | Yes | handleKPILeaderboard | ✅ |
| POST | /api/kpi | No | handleCreateKPI | ✅ |
| GET | /api/kpi/:id | Yes | handleGetKPI | ✅ |
| GET | /api/alerts/rules | No | handleAlertsRules | ✅ |
| POST | /api/alerts/check | Yes | handleAlertsCheck | ✅ |
| GET | /api/alerts/log | Yes | handleAlertsLog | ✅ |
| POST | /api/alerts/:id/acknowledge | Yes | handleAlertsAcknowledge | ✅ |
| POST | /api/alerts/evaluate | Yes | handleAlertsEvaluate | ✅ |
| GET | /api/alerts/summary | No | handleAlertsSummary | ✅ |
| POST | /api/commission/calculate | No | handleCommissionCalculate | ✅ |
| POST | /api/commission/batch | Yes | handleCommissionBatch | ✅ |
| GET | /api/commission/history/:id | Yes | handleCommissionHistory | ✅ |
| GET | /api/products | No | handleListProducts | ✅ |
| POST | /api/leads | **No** | handleCreateLead | ✅ (public!) |
| GET | /api/leads | Yes | handleListLeads | ✅ |
| GET | /api/leads/:id | Yes | handleGetLead | ✅ |
| PATCH | /api/leads/:id | Yes | handleAssignLead | ✅ |
| GET | /api/leads/:id/journey | Yes | handleGetLeadJourney | ✅ |
| POST | /api/orders | Yes | handleCreateOrder | ✅ |
| GET | /api/orders | Yes | handleListOrders | ✅ |
| GET | /api/orders/:id | Yes | handleGetOrder | ✅ |
| GET | /api/analytics/funnel | Yes | handleFunnelMetrics | ✅ |
| GET | /api/analytics/psn-health | Yes | handlePSNHealth | ✅ |
| GET | /api/onboarding/active | No | handleOnboardingActive | ✅ |
| POST | /api/onboarding/start | No | handleOnboardingStart | ✅ |
| GET/POST | /api/onboarding/:id | Yes | handleOnboardingGet/Advance | ✅ |
| POST | /api/onboarding/:id/nudge | Yes | handleOnboardingNudge | ✅ |
| POST | /api/onboarding/:id/habit | Yes | handleOnboardingHabit | ✅ |
| POST | /api/onboarding/:id/order | Yes | handleOnboardingOrder | ✅ |
| GET | /api/onboarding/:id/progress | Yes | handleOnboardingProgress | ✅ |
| POST | /api/training/assign | Yes | handleTrainingAssign | ✅ |
| POST | /api/training/progress | Yes | handleTrainingProgress | ⚠️ BUG: kpiRecords crash |
| GET | /api/training/:id | Yes | inline query | ✅ |
| GET | /api/training/active | Yes | inline query | ✅ |
| GET | /api/training/attention | Yes | inline query | ✅ |

### Missing Endpoints (cần build để có revenue)

| Method | Path | Auth | Purpose | Priority |
|--------|------|------|---------|----------|
| PATCH | /api/orders/:id/mark-paid | Yes | Leader confirm payment → status='paid', paid_at=NOW() | **P0** |
| PATCH | /api/orders/:id/status | Yes | Update order status (pending → paid → shipped → delivered) | P0 |
| POST | /api/orders/:id/payment-proof | Yes | Upload bank transfer screenshot → R2 | P1 |
| GET | /api/products/:id | No | Single product detail (for checkout page) | P1 |
| POST | /api/leads/:id/recommend | Yes | Quiz answers → suggest product tier | P1 |
| GET | /api/leads?ctvId=:id | Yes | Lead filter by CTV (for CTV dashboard) | P1 |
| GET | /public/quiz | No | Quiz page (Vite route, no JWT) | P0 |
| GET | /public/checkout | No | Checkout page (Vite route, no JWT) | P0 |
| POST | /api/public/quiz | No | Submit quiz anonymously → create L0 lead | P0 |
| GET | /api/commission/ctv/:id/overview | Yes | Commission summary per CTV | P2 |

---

## DOÁN SỐ THỰC TẾ SAU KHI FIX

### Trước khi fix (hiện tại):
- ✅ Leader tạo lead → Lead nhập database
- ❌ Lead xem sản phẩm → NO public products page
- ❌ Lead đặt hàng → NO checkout
- ❌ Leader confirm thanh toán → NO mark-paid
- ❌ CTV track commission → có engine nhưng không có lead gắn CTV
- **Revenue: 0đ**

### Sau Phase 0 (fix bugs, 15 phút):
- Same revenue = 0đ nhưng code chạy ổn định

### Sau Phase 1 (P0 features, ~200 LOC):
- ✅ Leader gửi link `/public/quiz?ctvId=CTV001`
- ✅ Khách vào → làm quiz → lead auto-created với assigned_ctv_id
- ✅ Leader xem dashboard → thấy order pending
- ✅ Leader check bank → click "Đã thanh toán" → mark-paid → commission calc trigger
- **Revenue: CÓ (manual flow, 1-2 tuần có đơn đầu tiên)**

### Sau Phase 2 (P1 features, +400 LOC):
- ✅ CTV tự share link → tự xem leads + commission riêng
- ✅ Quizzes → recommend sản phẩm cụ thể
- ✅ Zalo OA → auto lead capture
- **Revenue: SCALABLE (CTV bán được autonomously)**

---

## UNRESOLVED QUESTIONS

1. **Payment flow decision:** Chọn Option A (manual mark-paid) hay cần proof upload từ đầu? Manual mark-paid nhanh hơn nhưng rủi ro fraud.
2. **CTV registration:** CTV tự register (`handleRegister`) hay chỉ Leader tạo CTV accounts? Audit ghi "CTV self-register" nhưng business logic có thể cần Leader approve.
3. **Zalo OA webhook:** File `src/integrations/zalo-webhook.js` có code nhưng chưa verify có route handler tương ứng trong Workers. Cần confirm.
4. **Product seeding:** Products đã có schema nhưng chưa có seed data. Ai insert 3 products (L1 590K, L2 3.5tr, L3 12tr)?
5. **Commission payout threshold:** Khi nào CTV nhận tiền? Mỗi đơn real-time hay batch tháng? (Có batch cron nhưng threshold chưa define)
