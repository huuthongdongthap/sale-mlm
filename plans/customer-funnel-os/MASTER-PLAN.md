# 🐝 DROPPII FUNNEL OS — MASTER PLAN

### Hệ Thống Bán Hàng Tự Động Khai Vấn — Mở Rộng Hive Warfare Academy

> **Triết lý:** "Bất chiến tự nhiên thành" — khách tự chốt qua khai vấn, không bán bằng áp lực
> **Framework:** Sun Tzu Binh Pháp × Hive Colony × Customer Journey Funnel
> **Cho:** Leader team Droppii — quyết định đầu tư & vận hành Q3-2026
> **Stage:** Concept → MVP (6 tuần) → Scale (Q4-2026)
> **Updated:** 2026-05-08
> **Phụ trách kiến trúc:** Auto-CTO Hive Warfare
> **Customer brief update:** 2026-05-19 — dữ liệu từ Leader Droppii: end user là cả gia đình từ bé 3 tuổi tới người lớn; buyer chính là phụ nữ 28 tuổi tới U50; recruitment target là U30/U40/U50, sau đó mở rộng sinh viên; trục truyền thông sức khỏe dùng Medicine 3.0 / healthspan.

---

## 0. TÓM TẮT 1 TRANG (EXECUTIVE BRIEF)

**Vấn đề hiện tại của Droppii:** Hệ thống Hive Warfare Academy đang đào tạo CTV/đại lý **rất tốt cho người đã ký hợp đồng**, nhưng **đầu phễu lạnh** vẫn chưa có hệ thống — phụ thuộc 100% vào kỹ năng cá nhân của từng CTV. Mỗi CTV mới phải tự tìm 15 connect/ngày, tự đối phó từ chối, tự lọc lead. Chi phí cơ hội rất lớn: 70% Tân Binh bỏ cuộc trong 4 tuần đầu vì không có "bữa sáng dễ ăn".

**Đề xuất chiến lược:** Xây **Funnel OS** — một nhánh mới chạy song song với Academy, tự động hóa hành trình `khách lạ → khách hàng → đối tác`. Funnel làm 3 việc:

1. **Hấp khách bằng giá trị** (Level 0 cho đi: AI Coach 1:1, ebook, mini-course) — mỗi CTV được "trợ thủ AI" thay vì cold-call.
2. **Dẫn dắt khách tự chốt qua 3 mức sản phẩm** (L1 dưới 1tr → L2 gói 30-45 ngày 3-5tr → L3 combo chuyển hóa 90+ ngày).
3. **Chuyển khách thành đối tác** (L4) — đổ vào Tier 1 Tân Binh của Academy, đóng vòng lặp.

**Cập nhật đối tượng theo brief Leader Droppii:** Funnel phải nói với **người phụ nữ ra quyết định mua hàng trong gia đình** thay vì chỉ nói với từng pain point cá nhân. Người dùng sản phẩm có thể là cả nhà, từ bé 3 tuổi tới người lớn; vì vậy messaging phải xoay quanh family wellness, routine sống khỏe, môi trường sống an toàn, và **Medicine 3.0 / healthspan**: chăm sóc chủ động trước khi bệnh xảy ra, kéo dài thời gian sống khỏe mạnh.

**Đầu tư MVP 6 tuần:** ~25 triệu VND chi phí phát triển + 2-3 triệu VND/tháng vận hành. Pilot 50 lead → kỳ vọng 4 đơn L1, 1 đơn L2, ROI hòa vốn tháng 4-5.

**Khuyến nghị:** Approve phương án **C (Monorepo + Shared Core)** — không nhập chung, không tách rời. 1 database, 2 front-end, 1 hệ AI Agents thống nhất. Lợi thế lớn nhất: customer L3 → CTV L4 chỉ là `UPDATE 1 dòng`, không mất data.

**Cần Leader chốt 5 quyết định** (xem section 13): ngân sách, người vận hành Zalo OA, chính sách hoa hồng cho CTV trong funnel, content seed sản phẩm, ngày D-Day pilot.

---

## 1. CHIẾN LƯỢC — BINH PHÁP TÔN TỬ × HIVE VẬN DỤNG

### 1.1 "Bất chiến tự nhiên thành" — Triết lý cốt lõi của Funnel

Tôn Tử nói: *"Thiện chi thiện giả, bất chiến nhi khuất nhân chi binh dã"* — kẻ giỏi nhất là kẻ thắng mà không cần đánh. Funnel OS được thiết kế đúng theo nguyên tắc này:

- **Không có "chốt sale" hung hăng.** Khách hàng được dẫn dắt bằng câu hỏi khai vấn (coaching questions), tự nhận ra nỗi đau, tự thấy giải pháp, tự yêu cầu mua. CTV chỉ là người mở cửa, không phải người đẩy khách.
- **AI làm phần lặp đi lặp lại** (chào hỏi, hỏi pain point, gửi nhắc nhở) — CTV chỉ vào những "trận đánh quan trọng" (chốt L2, chốt L3, mời CTV).
- **Sản phẩm cho đi (L0) là binh khí mạnh nhất.** Coach 1:1 free hoặc ebook giá trị thật → khách nợ ơn → reciprocity → mua.

### 1.1.1 Medicine 3.0 — Nền tảng giáo dục sức khỏe

Theo brief từ Leader Droppii, Medicine 3.0 là trục giáo dục cần đưa vào Funnel OS. Đây là cách tiếp cận hiện đại được Dr. Peter Attia, tác giả *Outlive*, phổ biến: chuyển từ điều trị triệu chứng sau khi bệnh xuất hiện sang **ngăn ngừa bệnh trước khi xảy ra** và tối ưu **healthspan**.

| Khung | Ý nghĩa | Vai trò trong Funnel OS |
|---|---|---|
| Medicine 1.0 | Y học cổ đại dựa trên quan sát và phỏng đoán | Bối cảnh kể chuyện giáo dục |
| Medicine 2.0 | Y học hiện đại, bệnh rồi mới chữa | Vấn đề của lối sống bị động |
| Medicine 3.0 | Chủ động phòng ngừa, cá nhân hóa, kéo dài healthspan | Big idea cho quiz, coach, content, hành trình 30-90 ngày |

Ứng dụng thực tế:

- Lead magnet: "Bài test Healthspan cho gia đình", "Medicine 3.0 là gì?", "Checklist chăm sóc chủ động cho nhà có trẻ nhỏ/người lớn tuổi".
- AI Coach: hỏi thói quen ngủ, tiêu hóa, năng lượng, môi trường sống, bữa ăn gia đình thay vì chỉ hỏi một triệu chứng.
- Content: dùng ngôn ngữ "hỗ trợ", "routine", "sống khỏe", "chủ động", tuyệt đối tránh claim chữa bệnh.

### 1.2 Mapping 13 chương Binh Pháp vào Funnel

Hệ Academy đã mapping 13 chương này cho training. Funnel mở rộng mapping song song:

| Chương | Tinh thần | Áp dụng trong Funnel OS |
|---|---|---|
| **KẾ** (Planning) | Định kế hoạch trước khi đánh | 4-level funnel `L0→L1→L2→L3→L4` là master plan; mỗi level có gate conversion rõ ràng |
| **TÁC CHIẾN** (Resources) | Đánh nhanh, tốn ít | Mỗi lead chi phí AI ≤ 2.500 đ; CAC mục tiêu < 80k cho L1, < 400k cho L2 |
| **MƯU CÔNG** (Strategy) | Thắng không cần đánh | AI khai vấn = khách tự chốt; KHÔNG hard-sell, KHÔNG email blast |
| **HÌNH** (Formation) | Đội hình quyết định | Sản phẩm xếp tầng `<1tr → 3-5tr → 10-15tr` tạo bậc thang giá trị + ngân sách |
| **THẾ** (Momentum) | Tạo đà rồi đẩy | Health Companion check-in daily 30-90 ngày tạo momentum cảm xúc + thấy kết quả |
| **HƯ THỰC** (Testing) | Thật-giả lừa địch | A/B test 3 phiên bản coach intro, 2 giá L1, 4 nội dung email — Whisperer auto-rotate |
| **QUÂN TRANH** (Speed) | Nhanh chiếm thời cơ | AI trả lời lead trong 90 giây 24/7; cron nurture chạy 3 lần/ngày |
| **CỬU BIẾN** (Adaptation) | 9 biến hóa | AI Coach có 9 nhánh prompt theo `pain_point × persona` — không nói chung chung |
| **HÀNH QUÂN** (Morale) | Nuôi sĩ khí | Health Companion phát hiện drop-off ngày 7/14/21 → ping leader can thiệp |
| **ĐỊA HÌNH** (Terrain) | Đánh đúng đất | Phân khúc: tiêu hóa, ngủ, năng lượng, cân nặng, da — mỗi khúc có funnel riêng |
| **CỬU ĐỊA** (Situations) | 9 thế trận | Customer state machine 9 trạng thái: `new → engaged → trial → buyer → active → loyal → evangelist → invited → partner` |
| **HỎA CÔNG** (Decisive) | Đánh trận quyết định | Flash launch tháng 1 lần: combo 90 ngày giảm 30% trong 48h → push L2 lên L3 |
| **DỤNG GIÁN** (Intel) | Tình báo quyết định thắng | Funnel analytics: cohort table, drop-off point, LTV — leader quyết bằng data, không bằng cảm tính |

### 1.3 Hive Colony — Phân vai theo loài ong

Academy đã có Worker Bee 🐝 (Tân Binh) → Queen 👑 (Tướng Quân). Funnel mở rộng phía customer:

| Vai | Loài ong | Vị trí trong funnel | Mô tả |
|---|---|---|---|
| **🌸 Mật hoa** | — | Trước L0 | Nội dung lead magnet (ebook, video) — thứ thu hút ong tới |
| **🐝 Drone Bee** | Ong đực dò đường | L0 lead chưa qualified | Lead vào nhưng chưa engage |
| **🐝 Forager Bee** | Ong tìm mật | L1 customer mới | Đã trial sản phẩm <1tr |
| **🐝 Nurse Bee** | Ong y tá | L2 customer đang chăm sóc 30-45 ngày | Đang trong gói Health Active |
| **🐝 Royal Forager** | Ong cao cấp | L3 customer combo 90+ ngày | Evangelist tự nguyện giới thiệu |
| **👑 Queen Candidate** | Ong chúa tương lai | L4 — đã ký CTV | Chuyển vào Academy Tier 1 |

**Tổ ong (Hive) = Zalo Group + Cộng đồng.** Funnel OS là cánh đồng hoa thu hút ong; Academy là tổ ong nơi ong làm việc và sinh sôi.

### 1.4 Vì sao hai nhánh Funnel + Academy phải đi cùng nhau

Một CTV Droppii hiện tại có **2 nỗi đau lớn**:
1. *"Em đăng bài 5 ngày không có ai inbox"* — đầu phễu trống.
2. *"Em chốt được người đầu tiên rồi nhưng em không biết upsell"* — không có hệ sản phẩm bậc thang để upsell.

Funnel OS giải quyết cả 2:
- Đầu phễu được **AI Coach + Lead Magnet** lo, CTV chỉ tham gia khi có warm lead.
- Bậc thang sản phẩm L1→L2→L3 được hệ thống **tự upsell qua Whisperer + Companion**, CTV ngồi nhận hoa hồng theo gói.

Với leader: **Funnel OS giảm 70% áp lực onboarding Tân Binh**, vì Tân Binh không phải cold-call nữa — họ có lead warm từ funnel để thực hành.

---

## 2. KIẾN TRÚC HỆ THỐNG (BIRD-EYE VIEW)

### 2.1 Sơ đồ kiến trúc 3 tầng (Tri-Layer)

Kế thừa nguyên tắc 3 tầng đã được chấp nhận trong `plans/droppii-training-os/plan.md` (Business / Agentic / Governance):

```
┌────────────────────────────────────────────────────────────────┐
│  TẦNG BUSINESS (Customer-facing & CTV-facing)                  │
│  ┌──────────────────────┐      ┌──────────────────────────────┐│
│  │  apps/funnel         │      │  apps/academy                ││
│  │  (Customer-facing)   │      │  (CTV nội bộ — đang có)     ││
│  │  - Landing + Quiz    │      │  - Daily check-in 6 habits   ││
│  │  - AI Coach 1:1      │      │  - Learning path 3 tier      ││
│  │  - Shop + Checkout   │      │  - Community feed            ││
│  │  - Customer Dashboard│      │  - Leader dashboard          ││
│  └──────────┬───────────┘      └──────────┬───────────────────┘│
└─────────────┼────────────────────────────┼───────────────────┘
              │                            │
              ▼                            ▼
┌────────────────────────────────────────────────────────────────┐
│  TẦNG AGENTIC (11 AI Agents thống nhất)                        │
│  ┌──────────────── Funnel side (5 mới) ────────────────┐       │
│  │ L0 Discovery Coach │ Funnel Whisperer               │       │
│  │ Product Matchmaker │ Health Companion               │       │
│  │ Partner Scout                                       │       │
│  └─────────────────────────────────────────────────────┘       │
│  ┌──────────── Academy side (6 đã thiết kế) ───────────┐       │
│  │ Training Coach   │ Retention Guard                  │       │
│  │ Campaign Cmdr    │ PSN Analyst                      │       │
│  │ Content Engine   │ Onboarding Bot                   │       │
│  └─────────────────────────────────────────────────────┘       │
│        ▲ Tất cả gọi qua packages/ai-agents (LLM gateway,       │
│        ▲ rate-limit, prompt registry, audit trail chung)       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│  TẦNG DATA & GOVERNANCE                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Cloudflare D1 (1 database — KHÔNG tách)               │    │
│  │  Bảng cũ:  users, habits, lessons, progress, points,   │    │
│  │            posts, alerts                                │    │
│  │  Bảng mới: leads, products, orders, order_items,       │    │
│  │            coach_sessions, journey_events,              │    │
│  │            health_progress, ctv_invites                 │    │
│  │  Cột mở rộng users: persona, journey_level, zalo_id    │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌─────────────┬──────────────┬─────────────┬────────────┐     │
│  │ Cloudflare  │ Cloudflare   │ Cloudflare  │ Audit Log   │     │
│  │ KV (cache)  │ R2 (assets)  │ Workers(API)│ + RBAC       │     │
│  └─────────────┴──────────────┴─────────────┴────────────┘     │
└────────────────────────────────────────────────────────────────┘

  Tích hợp ngoài:
  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────────┐
  │ Zalo OA  │  │  PayOS   │  │  Anthropic    │  │   FB Ads    │
  │ (chat)   │  │ (payment)│  │ Claude API    │  │ (lead gen)   │
  └──────────┘  └──────────┘  └──────────────┘  └─────────────┘
```

### 2.2 Cấu trúc thư mục (monorepo)

```
SALE MLM/                           # repo gốc
├── apps/
│   ├── academy/                    # = hive-academy hiện tại (move vào)
│   └── funnel/                     # 🆕 nhánh mới
│       ├── app/(public)/           # / , /quiz, /coach, /shop
│       ├── app/(member)/           # /khach-hang/*
│       └── app/api/funnel/         # API endpoints
├── packages/
│   ├── core-db/                    # D1 client + migrations
│   ├── core-auth/                  # JWT dual-mode (CTV + Customer)
│   ├── ai-agents/                  # 11 agents — share LLM gateway
│   ├── ui-kit/                     # Components dùng chung
│   └── analytics/                  # Funnel events, KPI calc
├── workers/                        # Cloudflare Workers
│   ├── academy-api.ts
│   └── funnel-api.ts               # 🆕
├── d1/
│   └── schema.sql                  # 1 schema chung (mở rộng)
└── plans/
    ├── droppii-training-os/        # plan academy (đã có)
    ├── orchestrator/               # Auto-CTO orchestration
    └── customer-funnel-os/         # 🆕 plan này
```

**Triết lý:** *"Một tổ ong, nhiều cửa ra vào — không phải hai tổ ong cạnh nhau."*

### 2.3 Tại sao 1 database mà không 2

Có 3 lý do chiến lược, không phải kỹ thuật:

1. **Khách → CTV liền mạch** (yêu cầu cốt lõi từ tài liệu gốc): customer L3 muốn trở thành CTV → `UPDATE users SET persona='ctv', journey_level='L4'` → ngay lập tức xuất hiện trong Academy Tân Binh. Nếu 2 DB phải migrate dữ liệu thủ công, rất dễ lạc.
2. **CTV referrer tracking xuyên hệ thống**: khi 1 CTV giới thiệu khách qua link affiliate → khách mua L1 → CTV nhận hoa hồng → toàn bộ chain `referrer_id → user_id → orders` ở cùng schema, query 1 join duy nhất.
3. **Leader dashboard 1 cửa**: leader muốn biết "team em tháng này thu được bao nhiêu lead, chuyển được bao nhiêu CTV mới" — query bắt đầu từ `users WHERE team_id=?` rồi join sang `leads`, `orders`, `ctv_invites`. Nếu 2 DB phải làm ETL hằng đêm.

---

## 3. CƠ CHẾ VẬN HÀNH — 4 LEVEL CUSTOMER JOURNEY

Funnel hoạt động như một **dây chuyền sàng** — mỗi level lọc khách phù hợp, không phù hợp tự rớt mà không tốn năng lượng của CTV.

### 3.1 LEVEL 0 — "MẬT HOA" (Cho đi để hấp khách)

**Mục tiêu:** Đổi giá trị thật lấy `name + phone + interest + Zalo`. Không bán gì.

**Lead magnet đề xuất (chọn 1-2):**
- *Phiên AI Coach 1:1* — 15 phút khai vấn miễn phí, 1 vấn đề sức khỏe cụ thể (ngủ, tiêu hóa, cân nặng…). Đây là **vũ khí khác biệt nhất** vì các đối thủ chưa có.
- *Ebook* "21 ngày sống xanh không độc hóa chất gia dụng" — 30 trang PDF.
- *Mini-course email 7 ngày* về dinh dưỡng chủ động.

**Vận hành:**

```
[Khách thấy ad/post] 
   → [Click landing /quiz/khoi-dau]
   → [Trả lời 5 câu DISC + pain point — 90 giây]
   → [Form xin tên + SĐT + đồng ý nhận tư vấn]
   → [Lead lưu vào D1 leads.status=new]
   → [Auto reply: link Zalo group + lịch coach session]
   → [AI Coach gửi tin chào trong 90 giây qua Zalo OA]
   → [Khách bấm vào link /coach/[id] → vào phòng chat AI]
   → [AI Coach hỏi sâu 5-8 lượt về pain point]
   → [AI cho recommendation 1-2 sản phẩm L1 phù hợp]
   → [Lead chuyển sang status=qualified, intent_score=0-100]
```

**Thời gian khách dùng ở L0:** 0-3 ngày. Nếu sau 3 ngày không upgrade → Funnel Whisperer nurture qua Zalo.

### 3.2 LEVEL 1 — "TIN" (Trial pack <1tr)

**Mục tiêu:** Tạo trải nghiệm đầu tiên với sản phẩm thật — niềm tin > doanh số.

**Sản phẩm gợi ý:** combo nhỏ 2-3 món (1 món gia dụng xanh + 1 món TPCN khởi động). Giá 290k-790k. Có chính sách đổi trả 7 ngày.

**Vận hành:**
- AI Coach gợi ý → Khách bấm "Tôi muốn thử" → Cart auto-fill → Checkout PayOS.
- Sau khi paid: bắt đầu **Funnel Whisperer 7-day nurture** qua Zalo (không spam, mỗi tin có giá trị: hướng dẫn dùng, công thức, FAQ).
- Ngày 5: AI hỏi "Anh/chị thấy thế nào?" → thu feedback → cho ranking sao.
- Ngày 7: gợi ý L2 nếu intent_score đủ cao + feedback ≥ 4 sao.

### 3.3 LEVEL 2 — "HÀNH" (Health Active 30-45 ngày)

**Mục tiêu:** Khách bắt đầu thấy kết quả thật — giấc ngủ tốt hơn, đỡ đầy hơi, da sáng hơn… Đây là level tạo "evangelist" thật.

**Sản phẩm gợi ý:** gói TPCN chuyên đề (ngủ / tiêu hóa / năng lượng / collagen) trị giá 3-5 triệu, kèm app theo dõi 30-45 ngày.

**Vận hành — đây là level quan trọng nhất:**
- **Health Companion** check-in 2 lần/ngày (sáng & tối) qua Zalo: hỏi giấc ngủ, năng lượng, ăn uống, các triệu chứng. 30 giây trả lời.
- Dữ liệu lưu vào `health_progress` — biểu đồ trên `/khach-hang/tien-trinh`.
- Ngày 7, 14, 21, 30: AI tạo report cá nhân hóa "Anh/chị đã cải thiện X% giấc ngủ".
- Ngày 25: AI gợi ý gia hạn / nâng cấp L3.
- Ngày 30: nếu khách không respond 5 ngày → **Retention Guard** alert leader trực tiếp can thiệp.

**Đây là điểm Hive Warfare áp dụng "THẾ" — đà tâm lý quyết định chốt L3.**

### 3.4 LEVEL 3 — "HÓA" (Combo chuyển hóa 90+ ngày)

**Mục tiêu:** Khách trở thành "evangelist" — họ giới thiệu bạn bè không cần CTV ép.

**Sản phẩm gợi ý:** combo full transformation 90-180 ngày, giá 10-25 triệu. Có thể đóng theo tháng.

**Vận hành:**
- Health Companion tiếp tục, thêm community module: cho khách join nhóm Zalo riêng "Người đồng hành 90 ngày" (community privé, chỉ L3 trở lên).
- Tháng 2 và 3: kêu chia sẻ testimonial — lên `posts.audience='public'` trên landing → social proof.
- Ngày 60-75: **Partner Scout** chấm điểm khách qua các tiêu chí (đã giới thiệu ≥2 bạn, hoàn thành ≥80% check-in, NPS ≥9) → flag invite CTV.

### 3.5 LEVEL 4 — "HỢP" (Customer → Partner CTV)

**Mục tiêu:** Khách hóa CTV → đổ vào Academy Tier 1 — đóng vòng lặp.

**Vận hành — bridge sang Academy:**

```
[Partner Scout phát hiện L3 đủ điều kiện]
   → [Tạo ctv_invites record + ping leader phụ trách]
   → [Leader review + bấm "Gửi invite"]
   → [Khách nhận tin Zalo: "Mình thấy anh/chị đã chuyển hóa rất tốt..."]
   → [Khách bấm vào /khach-hang/tro-thanh-ctv]
   → [Form contract + cam kết Tân Binh]
   → [users.persona='ctv', journey_level='L4']
   → [Auto-redirect sang academy.droppii.io với pre-filled profile]
   → [Bắt đầu Tier 1 ngày 1 — Mindset Reset]
```

**Tỷ lệ kỳ vọng:** 15% L3 sẽ trở thành CTV. Mỗi 1 customer L4 đáng giá 5-10 customer L1 mới (đa cấp ROI).

### 3.6 Tổng kết "đường tiến quân" của khách

```
┌────┐ Mật ┌────┐ Tin  ┌────┐ Hành ┌────┐ Hóa  ┌────┐ Hợp
│ 🌸 │────▶│ L0 │─────▶│ L1 │─────▶│ L2 │─────▶│ L3 │─────▶ L4 (CTV)
└────┘ Hoa └────┘ Trial└────┘ 30-45└────┘ 90+  └────┘
                                                        │
                                                        ▼
                                          ┌──────────────────┐
                                          │ ACADEMY Tier 1   │
                                          │  Tân Binh 4 tuần │
                                          └──────────────────┘

  Conversion mục tiêu:
  Visit→L0:  3-8%   (FB ads + organic)
  L0→L1:     8-12%  (giá rẻ + AI coach thuyết phục)
  L1→L2:     20-30% (đã có niềm tin)
  L2→L3:     25-35% (Health Companion tạo đà)
  L3→L4:     15-20% (Partner Scout chọn lọc)
```

---

## 4. TÍCH HỢP VỚI ACADEMY (HIVE WARFARE OS)

### 4.1 Bảng đối ứng — cái gì share, cái gì riêng

| Hạng mục | Academy | Funnel | Cách xử lý |
|---|---|---|---|
| User table | Có | Cùng bảng | Cột `persona ∈ {customer, ctv, leader}` phân vai |
| Auth (JWT) | CTV-only | Customer + CTV | `core-auth` cấp claim `persona`, FE check |
| Bảng `posts` | CTV chia sẻ | Testimonial public | Cột `audience ∈ {ctv-only, public}` |
| Bảng `points` | CTV gamification | Customer royalty | Cột `action` prefix: `ctv:*` vs `cus:*` |
| AI agents | 6 (training) | 5 (funnel) | `packages/ai-agents` chung 1 LLM gateway, rate-limit chung |
| Dashboard | Leader xem CTV | Leader xem funnel | 2 view khác nhau, chung 1 query layer |
| Reporting | Weekly PSN | Weekly funnel cohort | Auto-CTO chạy 2 cron khác nhau |
| KPI | Habit + chốt đơn | CAC + LTV | `packages/analytics` chứa cả 2 công thức |

### 4.2 Bridge `Customer L3 → CTV L4` — chi tiết kỹ thuật

Đây là khâu giá trị nhất của hệ thống. Flow đầy đủ:

1. **Partner Scout** (cron Sunday 7am) quét customers với `journey_level='L3'` AND `referral_count>=2` AND `nps_score>=9` AND `allow_partner_invite=true`.
2. Tạo `ctv_invites` record, gắn `invited_by_id = leader phụ trách team gần nhất`.
3. Push notification cho leader qua dashboard.
4. Leader review profile khách (mở `/khach-hang/[id]/full-profile`) → bấm Send Invite.
5. Khách nhận tin Zalo cá nhân hóa từ AI: *"Mình theo dõi hành trình anh/chị 90 ngày qua. Nếu chia sẻ điều này cho người khác, bạn nghĩ sao?"*
6. Khách click → trang `/khach-hang/tro-thanh-ctv` → đọc contract → ký số (e-signature minimal: tick + ảnh CMND).
7. System: `UPDATE users SET persona='ctv', journey_level='L4', joined_ctv_at=NOW()`.
8. Auto trigger Academy `Onboarding Bot` → gửi email "Chào mừng Tân Binh ngày 1".
9. Customer redirect tới `academy.droppii.io` với SSO token (cùng JWT, không phải re-login).
10. Bắt đầu **Tier 1 — Tuần 1: Mindset Reset (5AM Club)**.

### 4.3 Tránh "rối hệ thống" cho leader

Để leader không phải mở 2 dashboard, làm 1 trang `/admin/360-view` với 4 widget:
- **Funnel pipeline** (số lead, số chuyển từng level, drop-off)
- **CTV roster** (Tân Binh active, Chiến Binh, …)
- **Revenue mix** (% từ funnel direct vs CTV-driven)
- **Bridge L3→L4 queue** (customer chờ leader review invite)

Một màn hình duy nhất, 30 giây hiểu tình hình.

---

## 5. PHÂN VAI VÀ TRÁCH NHIỆM (HIVE COLONY ROLES)

| Vai | Trong tổ ong | Người thật / AI | Trách nhiệm |
|---|---|---|---|
| **Queen 👑** | Người sáng lập / Mentor | Leader cao nhất | Chính sách, ngân sách, OA, brand |
| **Royal Guard** | Thủ lĩnh team | Coach 2-3 sao | Approve invite L3→L4, review case khó |
| **Scout Bee** | Đi tìm cánh đồng hoa mới | Marketing CTV | Sáng tạo content L0, chạy ads |
| **Forager Bee** | Mang mật về | CTV bán hàng | Convert L1, L2, L3 từ warm lead |
| **Nurse Bee** | Chăm sóc ấu trùng | CTV chăm sóc khách | Đồng hành khách L2, L3 30-90 ngày |
| **Drone Bot 🤖** | AI tự động hóa lặp | 11 AI Agents | 60-80% công việc routine |

**Nguyên tắc Hive:** *"Mỗi con ong làm 1 việc rất giỏi. Tổ ong mạnh khi vai trò rõ ràng."* — Funnel OS phải làm cho từng vai trò có công cụ riêng, không lẫn lộn.

---

## 6. BA TÙY CHỌN KIẾN TRÚC — PHÂN TÍCH ƯU NHƯỢC

Ba phương án đã đặt lên bàn cân:

### Phương án A — Nhập chung 1 app

> Tất cả funnel logic gắn thẳng vào `hive-academy/` hiện tại, dùng chung route, chung component.

**Ưu điểm:**
- Code ít nhất, deploy 1 lần.
- Không cần học monorepo tooling.
- Share component dễ.

**Nhược điểm:**
- **2 persona cực khác** nhồi chung 1 app → UX lẫn lộn (CTV thấy giao diện shop khách hàng, khách thấy dashboard học bài).
- SEO landing customer-facing **bị nhiễm** noise của LMS internal (Google bot index nhầm).
- RBAC phức tạp — mọi route phải check `persona` 2 lần.
- Không scale được khi 2 team (marketing & training) làm song song — tranh chấp file.

**Phù hợp với:** dự án ≤ 5 dev, scope ≤ 6 tháng, user ≤ 1.000.

### Phương án B — Tách hoàn toàn 2 repo, 2 DB

> `droppii-funnel` repo riêng, D1 database riêng, deploy riêng. Khi cần share data thì REST API.

**Ưu điểm:**
- Clean isolation tuyệt đối.
- Scale độc lập (funnel có thể chạy server lớn nếu traffic cao mà academy không bị ảnh hưởng).
- Team marketing không cần biết code academy.

**Nhược điểm (rất nghiêm trọng):**
- **Mất khả năng chuyển tiếp customer→CTV liền mạch.** Phải build ETL job sync user, dễ lỗi data.
- Duplicate auth: customer phải register lần 2 khi thành CTV → drop-off lớn.
- Không share được AI Agents → phí Claude API gấp đôi (mỗi repo maintain 1 LLM gateway).
- Leader phải mở 2 dashboard → phí thời gian, quên check.
- Tăng độ phức tạp vận hành 2 lần (2 deploy pipeline, 2 monitoring, 2 backup).

**Phù hợp với:** trường hợp 2 nhánh độc lập về business model (ví dụ Droppii muốn bán nhánh funnel cho công ty khác).

### ⭐ Phương án C — Monorepo + Shared Core (KHUYẾN NGHỊ)

> 1 repo, 2 app (`apps/funnel` + `apps/academy`), share `packages/*`, share 1 D1.

**Ưu điểm:**
- **Giải quyết triệt để use case L3→L4** — chuyển CTV chỉ là 1 dòng SQL.
- Share 11 AI agents → tiết kiệm 40% Claude API cost.
- Dev parallel — 4 worker subagent có thể build 2 app cùng lúc nhờ Auto-CTO orchestration đã có sẵn (`policy.max_parallel = 4`).
- Deploy độc lập (2 Cloudflare Pages projects) nhưng share infra.
- Leader 1 dashboard 360°.
- Migration nhỏ và an toàn (move `hive-academy/` → `apps/academy/`, không sửa logic).

**Nhược điểm:**
- Setup pnpm workspace + Turbo lần đầu (~1-2h).
- Cần dev hiểu monorepo (curve học ~1 tuần).
- 1 D1 instance — nếu rỉ data sẽ ảnh hưởng cả 2 (phải backup nghiêm).

**Phù hợp với:** Droppii hiện tại — **ĐÚNG VỚI BỐI CẢNH**.

### Bảng so sánh tổng

| Tiêu chí | A. Monolith | B. Tách | C. Monorepo |
|---|---|---|---|
| Tốc độ ship MVP | 🟢 Nhanh nhất | 🔴 Chậm nhất | 🟡 Trung bình |
| Dev complexity | 🟢 Thấp | 🟡 Trung bình | 🟡 Trung bình |
| L3→L4 conversion | 🔴 Khó | 🔴 Rất khó | 🟢 Native |
| AI cost optimization | 🟡 OK | 🔴 Tốn 2x | 🟢 Share LLM |
| Scale 10x traffic | 🔴 Bottleneck | 🟢 Tốt nhất | 🟢 Tốt |
| Maintain dài hạn | 🔴 Spaghetti | 🟡 OK | 🟢 Sạch |
| **Phù hợp Droppii** | ❌ | ❌ | ✅ |

---

## 7. CHI PHÍ ĐẦU TƯ — CAPEX & OPEX

### 7.1 Chi phí phát triển MVP (CAPEX) — 6 tuần

Tính theo nhân lực Auto-CTO + 1 dev người (review/oversight) + 1 content creator part-time.

| Hạng mục | Giờ người | Đơn giá | Thành tiền |
|---|---:|---:|---:|
| Auto-CTO + 4 worker AI (T-026 → T-043) | ~24h | (đã trả) | (sunk cost) |
| Dev người review code + manual deploy | ~30h | 250.000 đ/h | 7.500.000 đ |
| Content creator (15 post lead magnet, 30 email seq, 50 product copy) | ~40h | 200.000 đ/h | 8.000.000 đ |
| Designer (banner, OG image, ebook layout) | ~16h | 250.000 đ/h | 4.000.000 đ |
| Legal review TPCN compliance (1 lần) | trọn gói | — | 3.000.000 đ |
| Buffer (10%) | — | — | 2.250.000 đ |
| **TỔNG CAPEX** | | | **~24.750.000 đ** |

### 7.2 Chi phí vận hành (OPEX) — sau MVP, theo tháng

Phân theo 3 mức traffic:

| Hạng mục | Pilot 50 lead/tháng | Scale 500 lead/tháng | Scale 5.000 lead/tháng |
|---|---:|---:|---:|
| Cloudflare Pages | Free | Free | Free |
| Cloudflare D1 | Free (5GB) | Free | ~600.000 đ |
| Cloudflare Workers | Free (100k req/d) | ~250.000 đ | ~1.500.000 đ |
| Cloudflare R2 (assets) | ~50.000 đ | ~150.000 đ | ~600.000 đ |
| Cloudflare KV | Free | Free | ~150.000 đ |
| Zalo OA Standard | 150.000 đ | 150.000 đ | 1.500.000 đ (Premium) |
| Anthropic Claude API (Haiku 80% + Sonnet 20%) | ~700.000 đ | ~5.000.000 đ | ~35.000.000 đ |
| PayOS phí giao dịch (~2%) | ~200.000 đ | ~3.000.000 đ | ~30.000.000 đ |
| FB Ads (CAC) | ~3.000.000 đ | ~25.000.000 đ | ~200.000.000 đ |
| Domain (sau khi có) | ~30.000 đ | ~30.000 đ | ~30.000 đ |
| Monitoring (Sentry free / paid) | Free | ~250.000 đ | ~600.000 đ |
| **OPEX/tháng** | **~4.130.000 đ** | **~33.830.000 đ** | **~270.000.000 đ** |

> ⚠️ FB Ads là dòng lớn nhất. Có thể giảm 30-50% nếu dùng organic (Zalo OA broadcast, content marketing, KOL CTV) — nhưng cần thời gian build audience.

### 7.3 Tổng đầu tư năm 1 (kỳ vọng pilot → scale 500 lead)

- CAPEX: 24,75 triệu (1 lần)
- OPEX 3 tháng pilot: ~12,4 triệu
- OPEX 9 tháng scale: ~304,5 triệu
- **Tổng năm 1: ~340 triệu**

---

## 8. ROI & GIÁ TRỊ KỲ VỌNG

### 8.1 Mô hình doanh thu — kỳ vọng tháng 6 trở đi (500 lead/tháng)

Với conversion mục tiêu (đã đặt ở section 3.6):

```
500 lead L0/tháng
├─ 50 (10%) chuyển L1, AOV 590k → 29,5tr/tháng
├─ 13 (25% L1) chuyển L2, AOV 4tr → 52tr/tháng
├─ 4 (30% L2) chuyển L3, AOV 18tr → 72tr/tháng
└─ 0,6 (15% L3) chuyển L4 (CTV) → giá trị lifetime ~50-100tr/CTV

Doanh thu tháng 6 (chưa tính LTV): ~153,5 triệu/tháng
```

### 8.2 Bảng break-even

| Tháng | Lead | Doanh thu | OPEX | Lợi nhuận tích lũy |
|---:|---:|---:|---:|---:|
| 1 (pilot) | 50 | 8 triệu | 4,1 triệu | -20,8 triệu (đã trừ CAPEX) |
| 2 | 100 | 18 triệu | 8 triệu | -10,8 triệu |
| 3 | 200 | 45 triệu | 16 triệu | +18 triệu |
| 4 | 350 | 95 triệu | 25 triệu | +88 triệu |
| 5 | 500 | 153 triệu | 34 triệu | +207 triệu |
| 6 | 500+CTV multiplier | 250 triệu | 50 triệu | +407 triệu |

**Break-even tháng 3.** ROI 12 tháng kỳ vọng 4-6x đầu tư ban đầu.

### 8.3 Giá trị phi tài chính

- Tăng tỷ lệ giữ Tân Binh 4 tuần đầu **từ 30% lên 60-70%** (vì có lead warm sẵn).
- Brand Droppii dịch chuyển từ "MLM truyền thống" → "công ty health-tech có AI Coach" — định vị cao cấp hơn.
- Data asset: sau 1 năm có **10.000 customer journey records** — nguyên liệu vàng cho ML model future.

---

## 9. RỦI RO VÀ MITIGATION

| Rủi ro | Mức độ | Tác động | Mitigation |
|---|:---:|---|---|
| **Compliance TPCN** — quảng cáo "trị bệnh" trái luật | 🔴 Cao | Phạt 70-100 triệu, gỡ landing | Content Engine có guardrail khóa từ "trị/chữa/khỏi"; legal review trước launch; mọi claim phải có trích dẫn |
| **Zalo OA bị block** vì spam | 🔴 Cao | Mất kênh chính | Whisperer rate-limit 1 tin/3h/user, đa dạng nội dung, opt-out 1 click |
| **AI Coach hallucinate sản phẩm không có** | 🟡 Trung | Khách hỏi mua không có hàng | Rule engine ràng `recommended_product_id IN products` |
| **PayOS từ chối giao dịch lớn (>5tr)** | 🟡 Trung | Chốt L2/L3 fail | Backup chuyển khoản thủ công + COD cho L1 |
| **Leader quá tải duyệt invite L3→L4** | 🟡 Trung | Bottleneck conversion | Auto-approve cho khách thoả ≥3 tiêu chí, leader chỉ duyệt edge case |
| **Customer overload tin Zalo, opt-out hàng loạt** | 🟡 Trung | Mất audience | Cap 4 tin/tuần, tin có giá trị thật, A/B test frequency |
| **Schema D1 migration hỏng data academy** | 🟡 Trung | Down hệ thống đang chạy | Migration `IF NOT EXISTS`, backup D1 trước, run staging trước |
| **CAC FB Ads tăng vọt (Q4 cạnh tranh)** | 🟡 Trung | Lỗ tháng | Diversify: Zalo OA organic, KOL CTV, referral L3 |
| **Anthropic API thay đổi giá** | 🟢 Thấp | Tăng OPEX 20-30% | Caching aggressive trên KV, dùng Haiku 80% |
| **CTV "ăn cắp" customer rồi tự bán ngoài** | 🟡 Trung | Mất doanh thu, mất uy tín | Audit log mọi access, hợp đồng CTV có điều khoản, dashboard track theo `referrer_id` |

### Rủi ro đặc thù MLM cần Leader biết

Vì đây là sản phẩm Droppii (mô hình MLM hợp pháp), thêm 2 rủi ro pháp lý:
- **Hệ thống chuyển khách thành CTV qua Funnel có thể bị hiểu nhầm là "tuyển dụng đa cấp không phép"** nếu không cẩn thận về wording. → Tất cả copy invite L3→L4 phải có disclaimer rõ "Đối tác kinh doanh độc lập theo NĐ40/2018/NĐ-CP".
- **Hoa hồng từ funnel cho CTV cần khai báo** đúng tỷ lệ % theo NĐ40. → Phần `orders.ctv_referrer_id + commission_pct` cần lưu sạch để xuất báo cáo Bộ Công Thương khi cần.

---

## 10. ROADMAP MVP — 6 TUẦN BLITZ CAMPAIGN (HỎA CÔNG)

Theo tinh thần "Quân Tranh — Speed", MVP phải tới đích trong 6 tuần. Mỗi tuần là 1 sprint với deliverable rõ.

### Tuần 1 — Foundation (KẾ + HÌNH)

- T-026 Migrate monorepo (move `hive-academy/` → `apps/academy/`)
- T-027 Mở rộng D1 schema (8 bảng + ALTER users)
- T-028 `core-auth` dual-mode JWT
- T-029 Funnel landing + quiz `/quiz/khoi-dau`
- **Deliverable:** demo lead capture flow end-to-end, lưu được vào D1

### Tuần 2 — AI Coach + Zalo (CỬU BIẾN)

- T-030 Lead capture API + Zalo group invite link
- T-031 L0 Discovery Coach agent (9 nhánh prompt)
- T-032 Coach chat UI `/coach/[id]`
- T-033 Zalo OA webhook bridge
- **Deliverable:** customer thật có thể chat AI Coach qua Zalo

### Tuần 3 — Shop + Checkout (TÁC CHIẾN)

- T-034 Products catalog (admin CRUD + public listing)
- T-035 Cart + PayOS checkout (webhook + IPN)
- T-036 Funnel Whisperer agent (cron 3 lần/ngày)
- **Deliverable:** mua được sản phẩm L1 thật, nhận tin Zalo follow-up

### Tuần 4 — Customer Journey (THẾ + HÀNH QUÂN)

- T-037 Customer dashboard `/khach-hang/*`
- T-038 Health Companion agent (daily check-in)
- T-039 Product Matchmaker
- **Deliverable:** customer L2 trải nghiệm gói 30 ngày đầy đủ

### Tuần 5 — Bridge + Analytics (DỤNG GIÁN)

- T-040 Partner Scout + L4 bridge sang Academy
- T-041 Funnel analytics dashboard cho leader
- **Deliverable:** flow L3→L4 hoạt động, leader xem được cohort

### Tuần 6 — Pilot Launch (HỎA CÔNG)

- T-042 E2E test L0→L3
- T-043 Pilot 50 lead launch
- Content seed: 5 post FB ads, 3 ebook lead magnet, 30 email Whisperer copy
- **Deliverable:** 50 lead thật chạy qua, đo conversion → iterate

### Critical Path (đường găng)

```
T-026 ─→ T-027 ─→ T-035 ─→ T-040 ─→ T-043
   ↘─ T-029 ─→ T-031 ─→ T-038 ─↗
```

Với 4 worker AI song song: **6-8 ngày work thực** từ T-026 đến T-043. 6 tuần lịch là để buffer review, content, legal, soft-launch.

---

## 11. KPI ĐO LƯỜNG (DỤNG GIÁN — DATA COMMANDER)

Dashboard `/admin/funnel-360` cho leader, chia 4 nhóm KPI:

### 11.1 Đầu phễu (KẾ — Strategic)
- **Leads/ngày, /tháng** (mục tiêu 10/ngày tháng 1, 25/ngày tháng 3)
- **Cost-per-lead (CPL)** (mục tiêu < 30k tháng 1, < 50k khi scale)
- **Source mix:** % FB ads / Zalo organic / referral CTV

### 11.2 Chuyển hóa (HƯ THỰC — Conversion)
- **L0→L1 rate** (mục tiêu ≥ 8%)
- **L1→L2 rate** (mục tiêu ≥ 25%)
- **L2→L3 rate** (mục tiêu ≥ 30%)
- **L3→L4 rate** (mục tiêu ≥ 15%)
- **Time-in-stage:** trung bình 3-5 ngày L0, 7 ngày L1→L2 quyết định

### 11.3 Doanh thu & LTV (MƯU CÔNG — Revenue)
- **AOV theo level** (Average Order Value)
- **LTV theo cohort tháng** (3, 6, 12 tháng)
- **Revenue mix:** % từ funnel direct vs % CTV-driven
- **Hoa hồng CTV** (audit-ready cho NĐ40)

### 11.4 Sức khỏe hệ thống (HÀNH QUÂN — Health)
- **AI session avg duration** (mục tiêu 8-15 phút, không quá ngắn cũng không lê thê)
- **Drop-off heatmap** theo level + ngày
- **NPS từng cohort** (mục tiêu ≥ 50 sau L1, ≥ 70 sau L3)
- **Retention Guard alerts** đã trigger / đã resolve
- **Customer support tickets** mỗi 100 lead

### Quy tắc dụng gián

> *"Tin tốt báo ngay. Tin xấu báo ngay hơn."* — Mọi alert mức 🔴 phải push notification cho leader trong 5 phút (qua Zalo OA + email).

---

## 12. TỔ CHỨC THỰC THI — AUTO-CTO ORCHESTRATION

Tận dụng nguyên xi `plans/orchestrator/` đã có. Funnel chỉ thêm 18 task (T-026 → T-043) vào `tasks.json`.

```
                   ┌─────────────────────────┐
                   │   /sale-mlm:cto         │   ← lệnh trong Claude Code
                   │   (Auto-CTO)             │
                   └────────────┬────────────┘
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
       ┌────────────┐  ┌────────────┐  ┌────────────┐
       │ backend-   │  │ frontend-  │  │ content-   │
       │ worker     │  │ worker     │  │ worker     │
       │            │  │            │  │            │
       │ T-027 DB   │  │ T-029 LP   │  │ T-031 AI   │
       │ T-028 auth │  │ T-032 chat │  │ Coach      │
       │ T-035 pay  │  │ T-037 dash │  │ T-036 Whis │
       │ T-040      │  │            │  │ T-038 Comp │
       └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
             │               │               │
             └───────┬───────┴───────────────┘
                     ▼
             ┌──────────────────┐
             │ Auto-CTO verify  │ → done | review | retry
             └──────────────────┘
```

**Thời gian thực:** 7-9 ngày (vì có max_parallel=4, dependency đã optimize).
**Lịch:** ~6 tuần (buffer cho review, content, legal, ads creative, pilot recruit).

---

## 13. CÂU HỎI CẦN LEADER LÀM RÕ — 9 QUYẾT ĐỊNH

Để Auto-CTO bắt đầu T-026, leader chốt giúp 9 mục sau:

### Nhóm A — Ngân sách & Pháp lý

**Q1.** Approve CAPEX 24,75 triệu cho 6 tuần MVP?
**Q2.** Approve OPEX trần 5 triệu/tháng giai đoạn pilot 3 tháng đầu?
**Q3.** Đơn vị pháp lý nào sẽ đứng ra đăng ký Zalo OA + chịu trách nhiệm content TPCN compliance? (Droppii Việt Nam hay đơn vị PSN?)

### Nhóm B — Sản phẩm & Hoa hồng

**Q4.** Danh mục sản phẩm L1 (3-5 SKU < 1tr): leader chọn từ catalog Droppii hay tạo bundle riêng cho funnel?
**Q5.** Chính sách hoa hồng CTV trong funnel — `orders.ctv_referrer_id` được commission % bao nhiêu? Có khác với hoa hồng Academy không?
**Q6.** Customer L4 trở thành CTV — họ tự động vào team của leader nào? (Auto theo source / theo region / theo recruit attribution)

### Nhóm C — Vận hành

**Q7.** Ai là **Zalo OA Operator** thật (người đứng tên + login OA + reply những case AI escalate)?
**Q8.** Ai là **Content Editor** duyệt nội dung AI Coach trước khi production (đảm bảo tone Droppii + compliance)?
**Q9.** D-Day Pilot mục tiêu? (Đề xuất: 6 tuần tính từ ngày approve = giữa tháng 6/2026)

### Bonus

- Có muốn ngày T-026 commit code đầu tiên = ngày họp leader review không, để lan tỏa tinh thần "cùng build"?
- Có muốn CTV pilot (10-20 người) được cấp affiliate link để đo lường hiệu quả funnel + giới thiệu vs traffic ads không?

---

## 14. NEXT STEPS

1. **Leader họp duyệt** Master Plan này — quyết định Phương án C + 9 câu hỏi.
2. Auto-CTO load 18 task vào `tasks.json`, fan-out 4 worker → 7-9 ngày dev.
3. Content team song song: chuẩn bị 5 ad creative, 3 ebook lead magnet, seed product copy.
4. Pháp lý song song: đăng ký Zalo OA + tạo merchant PayOS (~3 ngày).
5. Tuần 6: pilot 50 lead — review tuần 1 sau pilot để iterate.
6. Q4-2026: scale 500 lead/tháng — hòa vốn tháng 3 sau khi launch.
7. Q1-2027: tích hợp Funnel với Academy V2 (cho phép CTV chia sẻ funnel link cá nhân hóa).

---

## PHỤ LỤC A — Sơ đồ Customer State Machine (CỬU ĐỊA)

```
                  ┌──────┐
                  │ NEW  │ (vừa nhập lead)
                  └───┬──┘
                      │ trả lời quiz
                      ▼
                ┌───────────┐
                │ ENGAGED   │ (đã chat AI Coach)
                └─────┬─────┘
            ┌─────────┴────────┐
            ▼                  ▼
     ┌────────────┐     ┌────────────┐
     │ NURTURING  │     │   TRIAL    │ (đã mua L1)
     │ (chưa mua) │     └─────┬──────┘
     └─────┬──────┘           │
           │                  ▼
     after 30d           ┌──────────┐
           │             │  BUYER   │ (đã mua L2)
           ▼             └─────┬────┘
     ┌────────┐                │
     │ COLD   │                ▼
     └────────┘          ┌──────────┐
                         │  ACTIVE  │ (đang dùng L2)
                         └─────┬────┘
                               │
                               ▼
                         ┌──────────┐
                         │  LOYAL   │ (đã mua L3)
                         └─────┬────┘
                               │
                               ▼
                         ┌──────────────┐
                         │ EVANGELIST   │ (giới thiệu ≥2 bạn)
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  INVITED     │ (đã được Partner Scout flag)
                         └──────┬───────┘
                                │ ký contract
                                ▼
                         ┌──────────────┐
                         │  PARTNER     │ (CTV — qua Academy)
                         └──────────────┘
```

---

## PHỤ LỤC B — Glossary (Vietnamese cho Leader)

- **Funnel** = Phễu bán hàng — dây chuyền lọc khách qua các tầng.
- **Lead Magnet** = Mật hoa — nội dung free thu hút lead (ebook, coach, quiz).
- **AOV** (Average Order Value) — giá trị đơn hàng trung bình.
- **CAC** (Customer Acquisition Cost) — chi phí có 1 khách.
- **LTV** (Lifetime Value) — tổng doanh thu khách trong vòng đời.
- **NPS** (Net Promoter Score) — điểm khách giới thiệu bạn bè (-100 đến +100).
- **CRO** (Conversion Rate Optimization) — tối ưu tỷ lệ chuyển đổi.
- **MQL/SQL** — Marketing Qualified Lead / Sales Qualified Lead.
- **CTV** = Cộng tác viên = thành viên kinh doanh độc lập của Droppii.
- **Cohort** = nhóm khách cùng tháng vào — phân tích theo cohort cho biết tháng nào "khách tốt".
- **PSN** = Personal Sales Network — mạng lưới CTV cá nhân (đã có trong Academy).

---

> **Mỗi tổ ong mạnh không nhờ 1 con ong giỏi.**
> **Tổ ong mạnh nhờ hệ thống — vai trò rõ — luật rõ — luôn vận hành kể cả khi không có Queen.**
>
> *— Triết lý Hive Warfare*

**Trình bày bởi:** Auto-CTO Hive Warfare
**Ngày:** 2026-05-08
**Phiên bản:** v1.0 — đợi Leader duyệt
