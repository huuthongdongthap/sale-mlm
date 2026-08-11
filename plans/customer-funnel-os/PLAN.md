# DROPPII CUSTOMER FUNNEL OS — Plan mở rộng nhánh hướng ngoại

> **Tên nhánh đề xuất:** `funnel-os` (song song với `training-os` hiện tại)
> **Stage:** 0 → MVP (4-6 tuần)
> **Đối tượng:** End customer lạnh → warm lead → buyer → CTV
> **Triết lý:** "Khai vấn dẫn dắt — Khách tự chốt — Khách hóa partner"
> **Updated:** 2026-05-08

> **Customer brief update 2026-05-19:** Leader Droppii bổ sung: người dùng sản phẩm là cả gia đình từ bé 3 tuổi tới người lớn; người ra quyết định mua hàng chính là phụ nữ 28 tuổi tới U50. Đối tượng tuyển dụng là U30/U40/U50, sau đó mở rộng tới sinh viên. Positioning sức khỏe dùng khung **Medicine 3.0 / healthspan**: chăm sóc chủ động, phòng ngừa từ thói quen, kéo dài thời gian sống khỏe mạnh; không dùng claim chữa bệnh.

---

## 1. CONTEXT — Yêu cầu cốt lõi từ tài liệu

Hệ thống bán hàng tự động cho **Gia dụng xanh + TPCN**, thiết kế theo **3 + 1 tầng phễu tự đóng** (self-closing funnel):

| Level | Vai trò | Sản phẩm | Mục tiêu | KPI nhân viên |
|---|---|---|---|---|
| **L0 — Cho đi** | Lead magnet | Phiên AI Coach 1:1, ebook, mini-course | Lấy `name + phone + interest`, đẩy vào Zalo group | Cost-per-lead < 30k |
| **L1 — Tin** | Trial pack | Sản phẩm < 1tr | Tạo trải nghiệm + niềm tin | L0→L1 conv ≥ 8% |
| **L2 — Hành** | Health Active | Gói chăm sóc sức khỏe chủ động 3-5tr / 30-45 ngày | Khách bắt đầu nhận kết quả | L1→L2 conv ≥ 25% |
| **L3 — Hóa** | Combo chuyển hóa | Gói 90+ ngày | Khách thấy đời thay đổi → trở thành "evangelist" | L2→L3 conv ≥ 30% |
| **L4 — Hợp** | Partner | Hợp đồng CTV Droppii | Customer → CTV → vào Training OS Tier 1 | L3→L4 ≥ 15% |

**Insight cốt lõi:** L4 chính là **input của hệ thống đào tạo hiện tại** (`training-os`). Đây là điểm khâu lại 2 nhánh.

### 1.1 Audience update từ Leader Droppii

| Nhóm | Định nghĩa mới | Hàm ý thiết kế funnel |
|---|---|---|
| **Người dùng sản phẩm** | Cả gia đình, từ bé 3 tuổi tới người lớn | Funnel không chỉ nói với cá nhân; phải nói tới routine sức khỏe gia đình, môi trường sống, tiêu hóa, ngủ, năng lượng, miễn dịch, gia dụng xanh |
| **Người quyết định mua** | Phụ nữ 28 tuổi tới U50 | Copywriting ưu tiên người phụ nữ quản lý sức khỏe gia đình và quyết định chi tiêu |
| **Đối tượng tuyển dụng hiện tại** | U30, U40, U50 | Partner Scout ưu tiên phụ nữ đã có trải nghiệm sản phẩm, có niềm tin về chăm sóc chủ động |
| **Đối tượng tuyển dụng sau này** | Sinh viên | Xây nhánh messaging riêng sau MVP: thu nhập thêm, kỹ năng bán hàng, cộng đồng học tập |

### 1.2 Medicine 3.0 / Healthspan positioning

Medicine 3.0 là cách tiếp cận y học hiện đại được Dr. Peter Attia, tác giả *Outlive*, phổ biến: chuyển trọng tâm từ "bệnh rồi mới chữa" sang **ngăn ngừa bệnh trước khi xảy ra** và kéo dài **healthspan** - thời gian sống khỏe mạnh.

| Giai đoạn | Tư duy | Cách dùng trong nội dung |
|---|---|---|
| **Medicine 1.0** | Y học cổ đại dựa trên quan sát và phỏng đoán | Chỉ dùng làm bối cảnh giáo dục |
| **Medicine 2.0** | Y học hiện đại, bệnh rồi mới chữa | Đối lập nhẹ với lối sống bị động |
| **Medicine 3.0** | Chủ động phòng ngừa, cá nhân hóa, healthspan | Trục chính cho lead magnet, quiz, nội dung giáo dục, hành trình 30-90 ngày |

Guardrail: không claim chữa bệnh, không dùng ngôn ngữ điều trị. Dùng các cụm: "chăm sóc sức khỏe chủ động", "thói quen sống khỏe", "hỗ trợ routine gia đình", "healthspan", "kéo dài thời gian sống khỏe mạnh".

---

## 2. PHÂN TÍCH KIẾN TRÚC HIỆN TẠI

| Module | Vị trí trong repo | Trạng thái |
|---|---|---|
| Training OS backend | `src/` (Express + JWT + D1 mock) | Active, ~26 files |
| Hive Academy frontend | `hive-academy/` (Next.js 14 + Cloudflare) | Active, đã có 8 routes |
| D1 schema | `hive-academy/d1/schema.sql` | 7 bảng, có seed lessons |
| 6 AI Agents | `.mekong/company.json` + planned `T-016, T-017` | Plan, chưa triển khai |
| Plans/Orchestrator | `plans/orchestrator/` | Đã có 25 task plan |
| Brand kit | `.mekong/` | Vietnamese UI, dark theme đã chuẩn hóa |

**Tài sản tái sử dụng được cho funnel:**
- Auth/JWT (`src/auth/jwt.js`)
- Bảng `users` (mở rộng cột `journey_level`, `referrer_id` đã có sẵn)
- AI Agent skeleton + Cloudflare Workers infra
- Bảng `posts` (community → có thể tái dùng cho testimonial wall)
- Brand colors/fonts đã chuẩn

**Khoảng trống cần lấp:**
- ❌ Chưa có CRM/lead pipeline
- ❌ Chưa có sản phẩm + đơn hàng (e-commerce layer)
- ❌ Chưa có AI Coach 1:1 hướng customer (hiện chỉ thiết kế cho CTV)
- ❌ Chưa có landing page bán hàng + checkout
- ❌ Chưa có Zalo OA integration (group invite + broadcast)

---

## 3. QUYẾT ĐỊNH KIẾN TRÚC — So sánh 3 phương án

### A. Nhập chung (monolith chung 1 app)
**Ưu:** Code ít, share tất cả components, deploy 1 lần.
**Nhược:** Trộn 2 persona rất khác (CTV nội bộ vs end customer) → UX confused, SEO landing customer-facing bị nhiễm noise của LMS, RBAC phức tạp.

### B. Tách hoàn toàn (2 repo, 2 DB, 2 deploy)
**Ưu:** Clean isolation, scale độc lập.
**Nhược:** Duplicate auth, **mất khả năng chuyển tiếp customer→CTV liền mạch** (đây là use case quan trọng nhất theo tài liệu), tốn công sync user data, AI Agents không share được.

### C. ⭐ **MONOREPO + SHARED CORE — KHUYẾN NGHỊ**
**Cấu trúc:**
```
SALE MLM/                            # repo gốc giữ nguyên
├── apps/
│   ├── academy/                     # = hive-academy hiện tại (đổi tên/move)
│   │   ├── app/...                  # /dashboard, /checkin, /learn, /community
│   │   └── (CTV-only, requires login)
│   └── funnel/                      # 🆕 NHÁNH MỚI
│       ├── app/
│       │   ├── (public)/            # / (landing), /quiz, /coach, /shop
│       │   ├── (member)/            # /khach-hang, /lich-hen, /tien-trinh
│       │   └── api/funnel/...
│       └── (customer-facing, public)
├── packages/
│   ├── core-db/                     # 🆕 D1 client + migrations chung
│   ├── core-auth/                   # 🆕 JWT chung, dual-mode (CTV vs Customer)
│   ├── ai-agents/                   # 🆕 6 agents cũ + 5 agents mới, share 1 LLM gateway
│   ├── ui-kit/                      # 🆕 Industrial-luxury components dùng chung
│   └── analytics/                   # 🆕 KPI/funnel events chung
├── workers/                         # Cloudflare Workers (API gateway)
│   ├── academy-api.ts               # /api/academy/*
│   └── funnel-api.ts                # 🆕 /api/funnel/*
└── d1/
    └── schema.sql                   # ⚠️ Mở rộng chứ không tách DB
```

**Ưu:**
1. **Giải quyết use case L3→L4 conversion**: customer trở thành CTV chỉ là `UPDATE users SET role='ctv'` cùng 1 hàng — không cần migrate sang DB khác.
2. **Chia sẻ AI Agents**: Onboarding Bot (cũ) tái dùng làm AI Coach L0 chỉ cần đổi system prompt.
3. **Deploy độc lập**: 2 Cloudflare Pages projects (`shop.droppii.io` + `academy.droppii.io`) cùng trỏ vào 1 D1.
4. **Dev parallel**: 2 worker subagent có thể build 2 app cùng lúc mà không tranh chấp.

**Nhược (chấp nhận được):**
- Cần migration nhỏ đưa `hive-academy/` → `apps/academy/` (1-2h work, có script).
- Setup pnpm workspace + Turbo (~30 min).

**→ Chọn phương án C.**

---

## 4. SCHEMA MỞ RỘNG (D1)

Giữ 7 bảng cũ, thêm 8 bảng mới + mở rộng `users`:

```sql
-- ============ MỞ RỘNG users ============
ALTER TABLE users ADD COLUMN journey_level TEXT DEFAULT 'L0';
  -- 'L0','L1','L2','L3','L4','CTV' (L4 = CTV mới onboard)
ALTER TABLE users ADD COLUMN persona TEXT DEFAULT 'customer';
  -- 'customer' | 'ctv' | 'leader'  (RBAC chính)
ALTER TABLE users ADD COLUMN zalo_id TEXT;
ALTER TABLE users ADD COLUMN interests TEXT;  -- JSON array
ALTER TABLE users ADD COLUMN source TEXT;     -- 'fb-ads','organic','referral'

-- ============ FUNNEL CORE ============
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  source TEXT,
  utm_json TEXT,
  interests TEXT,            -- ['chong-bao-bi','tpcn-tieu-hoa',...]
  pain_point TEXT,
  status TEXT DEFAULT 'new', -- new|qualified|contacted|nurturing|converted|lost
  zalo_joined BOOLEAN DEFAULT 0,
  user_id TEXT,              -- nullable, set khi convert thành user
  referrer_id TEXT,          -- CTV giới thiệu (nếu có)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT,
  category TEXT,             -- 'gia-dung-xanh' | 'tpcn' | 'combo'
  level_target TEXT,         -- 'L1','L2','L3'
  price INTEGER,             -- VND
  cogs INTEGER,
  duration_days INTEGER,     -- NULL với gia dụng, 30/45/90... với gói
  description TEXT,
  benefits_json TEXT,
  image_urls TEXT,           -- JSON array
  active BOOLEAN DEFAULT 1
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  level TEXT,                -- 'L1','L2','L3'
  total INTEGER,
  status TEXT,               -- pending|paid|shipped|completed|refunded
  ctv_referrer_id TEXT,      -- CTV được commission
  payment_method TEXT,
  shipping_address_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  qty INTEGER,
  price INTEGER,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============ CUSTOMER JOURNEY ============
CREATE TABLE coach_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,              -- hoặc lead_id nếu chưa có user
  lead_id TEXT,
  type TEXT,                 -- 'discovery','health-assessment','progress-check'
  level TEXT,                -- L0/L1/L2/L3
  ai_transcript TEXT,        -- JSON [{role, content, ts}]
  intent_score INTEGER,      -- 0-100, AI rate intent mua
  recommended_product_id TEXT,
  next_action TEXT,
  scheduled_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE journey_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  lead_id TEXT,
  event_type TEXT,           -- 'level_up','order_placed','quiz_done','zalo_joined','ctv_invited'
  from_level TEXT,
  to_level TEXT,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_progress (        -- Chỉ cho L2/L3 khách dùng gói TPCN
  id TEXT PRIMARY KEY,
  user_id TEXT,
  order_id TEXT,
  day_num INTEGER,           -- 1..90
  metrics_json TEXT,         -- {"can-nang":68,"giac-ngu":7,"nang-luong":8}
  notes TEXT,
  photo_urls TEXT,
  ai_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ctv_invites (             -- L3→L4 conversion
  id TEXT PRIMARY KEY,
  user_id TEXT,                       -- customer được invite
  invited_by_id TEXT,                 -- CTV/leader gửi invite
  status TEXT,                        -- pending|accepted|declined
  reason TEXT,                        -- AI gợi ý: "đã hoàn thành combo 90 ngày + giới thiệu 2 bạn"
  signed_contract_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (invited_by_id) REFERENCES users(id)
);
```

**Indexes:** `leads(phone)`, `leads(status)`, `orders(user_id, status)`, `journey_events(user_id, event_type)`, `coach_sessions(user_id, completed_at)`.

---

## 5. AI AGENTS — 5 agent mới cho funnel (cộng 6 cũ)

| Agent mới | Vai trò | LLM call | Trigger |
|---|---|---|---|
| **L0 Discovery Coach** | Phiên khai vấn 1:1 — hỏi sâu pain point, đề xuất sản phẩm phù hợp, KHÔNG hard-sell | Claude Haiku qua web chat | Khi lead bấm "Đặt phiên 1:1" |
| **Funnel Whisperer** | Gửi tin nhắn Zalo/email tự động theo journey state, A/B test copy | Claude Haiku | Cron 3 lần/ngày + sau mỗi event |
| **Product Matchmaker** | Map pain point → SKU phù hợp, gợi ý cross-sell | Claude Haiku + rule engine | Trên cart + sau coach session |
| **Health Companion** | Đồng hành L2/L3 90 ngày, daily check-in dinh dưỡng/giấc ngủ, phát hiện drop-off | Claude Haiku | Daily 7am + 9pm |
| **Partner Scout** | Quét customer L3 đủ tiêu chí → tự gợi ý Leader gửi invite CTV | Claude Sonnet | Weekly Sunday |

**Tái dùng từ Training OS:**
- Onboarding Bot (cũ) → mở rộng thành "Onboarding Bot" cho **cả** CTV mới và customer L0 mới (tách 2 system prompt).
- Content Engine (cũ) → tái dùng để generate testimonial copy + email broadcast.

---

## 6. UX FLOW — Vietnamese, dark industrial-luxury

### 6.1 Funnel app routes (apps/funnel)

```
/                          → Landing dark luxury, hero "Bạn đang tìm gì cho sức khỏe?"
/quiz/khoi-dau            → Quiz 5 câu DISC + pain point → đẩy vào L0
/coach                     → Đặt phiên AI Coach 1:1 (live chat web hoặc qua Zalo)
/coach/[sessionId]         → Phòng chat với AI Coach
/ebook/[slug]             → Lead magnet trang
/shop                      → Catalog sản phẩm theo level
/shop/[productId]         → Product detail + AI suggest
/cart, /checkout           → Stripe / VNPay
/khach-hang                → Login required — dashboard cá nhân
  ├── tien-trinh           → Health journey 90 ngày, biểu đồ
  ├── don-hang             → Order history
  ├── coach                → Lịch sử coach sessions
  └── tro-thanh-ctv        → 🆕 Khi đủ điều kiện L4 → CTA "Trở thành đối tác"
                              → bấm vào → redirect academy.droppii.io với pre-filled
```

### 6.2 Customer journey (state machine)

```
[Visit] → [Quiz/Lead Magnet] → leads.status=new
   ↓
[L0: AI Coach session] → coach_sessions, intent_score
   ↓
[Add to Zalo] → leads.zalo_joined=1
   ↓
[Buy L1 product <1tr] → users.journey_level='L1', orders
   ↓
[Funnel Whisperer 7-day nurture]
   ↓
[Buy L2 health pack 3-5tr] → users.journey_level='L2'
   ↓
[Health Companion 30-45 days daily check-in]
   ↓
[Buy L3 combo 90+ days] → users.journey_level='L3'
   ↓
[Partner Scout flag] → ctv_invites
   ↓
[Accept invite + sign] → users.persona='ctv', journey_level='L4'
   → CHUYỂN SANG ACADEMY = bắt đầu Tier 1 Tân Binh
```

### 6.3 Brand consistency

Sử dụng `packages/ui-kit` — kế thừa hệ màu Droppii/Hive Warfare đã định nghĩa trong `hive-academy/SPEC.md`:

```css
--primary:   #004CE3;   /* Xanh dương Droppii — CTA chính */
--secondary: #FFC734;   /* Vàng — accent, badge tier */
--success:   #57d697;   /* Xanh lá — confirm, paid */
--warning:   #ba7517;   /* Cam đậm — alert nhẹ */
--danger:    #d7263d;   /* Đỏ — drop-off, churn risk */
--ink:       #1a1d29;   /* Text chính */
--paper:     #ffffff;   /* Background mặc định */
--muted:     #f4f6fb;   /* Card surface */
```

- Funnel app dùng tone **sáng/sạch/y tế** (không dark theme) để tương thích với customer cuối — TPCN/sức khỏe cần cảm giác đáng tin, không industrial-luxury.
- Academy app giữ nguyên theme hiện có.
- Fonts: Inter (body), Manrope hoặc Be Vietnam Pro (display) — chuẩn UI Việt, không serif.
- Mobile-first responsive (>70% traffic Zalo dự kiến mobile).

---

## 7. ROADMAP — 6 tuần MVP

| Tuần | Epic | Deliverable | Owner agent |
|---|---|---|---|
| **W1** | Foundation | Monorepo migrate, schema mở rộng, core-auth dual-mode | backend-worker |
| **W1** | Funnel landing | `/`, `/quiz`, lead capture form → leads table | frontend-worker |
| **W2** | AI Coach L0 | `/coach` chat UI + L0 Discovery Coach agent | content + backend |
| **W2** | Zalo OA bridge | Webhook nhận message Zalo → forward AI agent | backend-worker |
| **W3** | Shop + Checkout | Products CRUD, cart, **PayOS** payment integration | frontend + backend |
| **W3** | Funnel Whisperer | Cron 3 lần/ngày gửi Zalo nurture sequence | backend-worker |
| **W4** | Customer dashboard | `/khach-hang/tien-trinh` + Health Companion daily | frontend + content |
| **W4** | Product Matchmaker | Logic suggest L1→L2→L3 từ pain point | backend-worker |
| **W5** | Partner Scout + L4 bridge | Auto detect L3 đủ điều kiện → invite CTV → academy | backend |
| **W5** | Analytics dashboard | Funnel chart (L0→L4), CAC, LTV per cohort | frontend |
| **W6** | QA + Pilot | 50 lead pilot, Vietnamese copy review, A/B test | tất cả |

**Ngân sách hạ tầng (Cloudflare):** $0–600k VND/tháng (giống academy hiện tại) trong giai đoạn MVP.

**Thêm phí:**
- Zalo OA Official: ~150k/tháng (gói cơ bản, sau verify)
- Claude API (5 agents): ~$30-80/tháng cho 1k DAU
- **PayOS:** miễn phí phí kết nối, ~1.5-2.2% mỗi giao dịch (rẻ hơn VNPay/Stripe)
- Cloudflare Pages: free tier đủ cho MVP, R2 cho ảnh sản phẩm $0.015/GB

---

## 8. INTEGRATION VỚI HỆ THỐNG HIỆN TẠI

| Touchpoint | Cũ (academy) | Mới (funnel) | Cách khâu |
|---|---|---|---|
| Auth | JWT cho CTV | JWT cho customer | `core-auth` 1 secret, `persona` claim phân vai |
| User table | `users` | Cùng bảng | `persona` + `journey_level` cột mới |
| AI infra | 6 agents kế hoạch | 5 agents mới | `packages/ai-agents` chung — share LLM gateway, prompt registry, rate limit |
| Posts/Community | CTV chia sẻ | Testimonial wall public | Filter `posts.audience='public'` |
| Points | CTV gamification | Customer royalty (~~điểm tích~~) | Cùng bảng, scope qua `action` prefix |
| Reporting | Leader dashboard | Funnel dashboard | 2 view khác nhau, 1 query layer |
| KPI alerts | CTV inactive 24h | Customer drop-off ở L1→L2 | Bảng `alerts` thêm `category='funnel'` |

**Quy ước đặt tên:** API path `/api/academy/*` vs `/api/funnel/*`. Không trộn handler.

---

## 9. TASK BREAKDOWN — 18 task mới cho orchestrator

Đề xuất bổ sung vào `.mekong/tasks.json` (numbering nối từ `T-026`):

| ID | Tên | Phụ thuộc | Giờ ước tính |
|---|---|---|---|
| T-026 | Migrate to monorepo (pnpm + turbo) | — | 90 |
| T-027 | Mở rộng D1 schema (8 bảng + ALTER) | T-026 | 60 |
| T-028 | core-auth dual-mode JWT | T-026 | 75 |
| T-029 | Funnel landing + quiz | T-027 | 90 |
| T-030 | Lead capture API + Zalo group invite | T-027, T-028 | 60 |
| T-031 | L0 Discovery Coach agent | T-027 | 120 |
| T-032 | Coach chat UI | T-031 | 75 |
| T-033 | Zalo OA webhook bridge | T-030 | 90 |
| T-034 | Products & catalog UI | T-027 | 75 |
| T-035 | Cart + PayOS checkout (webhook + IPN) | T-034 | 105 |
| T-036 | Funnel Whisperer agent | T-035 | 90 |
| T-037 | Customer dashboard | T-035 | 90 |
| T-038 | Health Companion agent | T-037 | 105 |
| T-039 | Product Matchmaker | T-037 | 75 |
| T-040 | Partner Scout + L4 bridge | T-038, academy/T-001 | 90 |
| T-041 | Funnel analytics dashboard | T-036, T-038 | 75 |
| T-042 | E2E test funnel L0→L3 | T-040 | 60 |
| T-043 | Pilot 50 lead launch | T-042 | 30 |

**Total:** ~1,455 phút (~24h người). Với 4 worker song song và critical path `T-026 → T-027 → T-035 → T-040 → T-043`, thời gian thực ~7-9 ngày.

---

## 10. RỦI RO & MITIGATION

| Rủi ro | Mức | Mitigation |
|---|---|---|
| Zalo OA API limit (50 msg/sec OA Standard) | Cao | Queue qua KV, throttle Funnel Whisperer; nâng OA Premium khi >5k lead |
| Compliance: TPCN cần đăng ký công bố sản phẩm + không "treatment claim" | Cao | Content Engine có guardrail từ chối generate copy y khoa; legal review trước launch |
| Customer L3 không muốn làm CTV → Partner Scout làm phiền | Trung | Opt-in flag `users.allow_partner_invite`, tối đa 2 invite/customer |
| AI Coach hallucinate sản phẩm không tồn tại | Trung | Rule engine ràng buộc `recommended_product_id` phải IN `products` table |
| Mix persona vô tình: customer thấy giao diện CTV | Cao | Middleware check `persona` ở mọi route; e2e test catch leakage |
| Schema migration phá data academy hiện tại | Trung | Migration `IF NOT EXISTS` + backup D1 trước khi run |

---

## 11. SUCCESS METRICS — Định nghĩa "đạt MVP"

- **Lead intake:** ≥ 200 leads/tháng vào tuần 6
- **L0→L1 conversion:** ≥ 8%
- **L1→L2 conversion:** ≥ 25%
- **AI Coach session avg time:** 8-15 phút (đủ sâu, không lê thê)
- **L3→L4 (CTV) conversion:** ≥ 15% — đo cả academy onboarding rate
- **System uptime:** ≥ 99% Cloudflare
- **NPS sau L1:** ≥ 50

---

## 12. CẤU HÌNH ĐÃ CHỐT (2026-05-08)

| Hạng mục | Quyết định | Hành động cần làm |
|---|---|---|
| **Zalo OA** | Tạo mới | Đăng ký OA tại `oa.zalo.me` → verify business → request `oa_id` + `access_token` (24h). Trong khi chờ, dev mock webhook ở `apps/funnel/api/zalo/webhook` |
| **Payment** | PayOS | Tạo merchant account `my.payos.vn` → lấy `client_id`, `api_key`, `checksum_key`. Sandbox không cần KYC, prod cần ĐKKD/MST |
| **Domain** | Cloudflare Pages cho demo, domain quyết sau | 2 Pages projects: `droppii-funnel.pages.dev` + `droppii-academy.pages.dev`. Khi có domain chính thức chỉ thêm custom domain trong Pages settings (không refactor code) |
| **Pilot scope** | Toàn quốc theo data | Bỏ ràng buộc địa lý — funnel public, target seed 50 lead từ FB ads / Zalo CTV existing |

## 13. NEXT STEPS

1. ✅ Plan đã chốt phương án C + 4 cấu hình trên.
2. Bạn (hoặc team Droppii) bắt đầu thủ tục **Zalo OA + PayOS** song song (~1-3 ngày).
3. Mở Claude Code CLI tại `SALE MLM/`, gõ `/sale-mlm:cto` → orchestrator load 18 task mới (`T-026 → T-043`).
4. Worker đầu tiên (`T-026 monorepo migrate`) dừng ở `review` để bạn check structure.
5. Sau review pass, fan-out 4 worker song song theo critical path.
6. Tuần 6: pilot 50 lead thực, đo conversion, iterate.

**Biến môi trường cần chuẩn bị (`.env`):**
```
# Zalo OA (chờ approve)
ZALO_OA_ID=
ZALO_OA_ACCESS_TOKEN=
ZALO_OA_SECRET_KEY=

# PayOS
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_RETURN_URL=https://droppii-funnel.pages.dev/checkout/return
PAYOS_WEBHOOK_URL=https://droppii-funnel.pages.dev/api/funnel/payos/webhook

# Cloudflare
CF_ACCOUNT_ID=
CF_D1_DATABASE_ID=     # share với academy
CF_KV_NAMESPACE_ID=

# Claude API (AI Agents)
ANTHROPIC_API_KEY=
```
