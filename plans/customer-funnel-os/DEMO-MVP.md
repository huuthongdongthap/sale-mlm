# DROPPII FUNNEL OS — DEMO MVP

> **Mục đích:** chứng minh giả thuyết cho Leader trong **3-4 tuần** với chi phí **<15 triệu VNĐ**, sau đó mới quyết định đầu tư đầy đủ.
>
> **Triết lý MVP:** *"Less is more — build cái nhỏ nhất để có data thật, không phải build cái đẹp nhất."*
>
> **Updated:** 2026-05-20
> **Phụ trách:** Auto-CTO Hive Warfare

---

## 0. TÁCH RÕ 2 LỚP TRƯỚC KHI BÀN MVP

Trộn lẫn 2 OS là sai lầm phổ biến nhất. Mỗi OS giải quyết 1 nhóm người khác nhau, có roadmap riêng:

| Tiêu chí | **Training OS** (Hive Academy) | **Funnel OS** (mới) |
|---|---|---|
| **Đối tượng** | CTV / Đại lý đã ký hợp đồng Droppii | End customer lạnh (chưa biết Droppii) |
| **Mục tiêu** | Đào tạo + giữ retention CTV trong 4 tuần đầu | Hấp khách lạ → khách hàng → đối tác |
| **Trạng thái hiện tại** | ✅ Đã code ~80% (Next.js + Cloudflare + 7 bảng D1, 6 AI agents đã thiết kế) | ❌ Chưa code dòng nào |
| **Folder code** | `hive-academy/` + `src/` | `apps/funnel/` (sẽ tạo) |
| **Database** | D1 với 7 bảng `users/habits/lessons/progress/points/posts/alerts` | Sẽ thêm bảng (xem mục 4) |
| **User journey** | Daily check-in 6 habit → học bài tier 1→2→3 → leader dashboard | Quiz → AI Coach → mua L1 → CTV handoff |
| **Touchpoint** | Web app sau khi login | Landing page public → web chat + Zalo |
| **Doanh thu nguồn** | Không trực tiếp (CTV nội bộ tốt → bán hàng giỏi → doanh thu) | Trực tiếp (khách mua sản phẩm) |
| **KPI đo lường** | Habit completion, learning progress, PSN health | CAC, lead conversion %, AOV, LTV |
| **Pilot scope** | 10 Tân Binh (T-025 plan cũ) | 50 cold leads (đề xuất MVP này) |
| **Trạng thái tài liệu** | `plans/droppii-training-os/`, `plans/orchestrator/` | `plans/customer-funnel-os/` |

**Quan hệ giữa 2 OS:**

```
                  ┌─────────────────────────────┐
                  │    FUNNEL OS (mới)          │
                  │  Public traffic → buy → CTV  │
                  └──────────────┬──────────────┘
                                 │ L4 conversion
                                 │ "khách → đối tác"
                                 ▼
                  ┌─────────────────────────────┐
                  │   TRAINING OS (đã có)       │
                  │  CTV Tier 1 → Chiến Binh →  │
                  │  Chỉ Huy → Tướng Quân       │
                  └─────────────────────────────┘
```

→ **2 OS chia sẻ 1 database** (theo phương án C Monorepo), nhưng UI/UX/roadmap/team vận hành **độc lập**.

→ **Demo MVP này chỉ làm Funnel OS**, KHÔNG đụng đến Training OS (Training OS có roadmap riêng, đã có 25 task plan cũ).

---

## 1. GIẢ THUYẾT CỐT LÕI CẦN CHỨNG MINH

Trước khi xin Leader thêm tiền, MVP phải trả lời được **1 câu hỏi duy nhất**:

> **"AI Coach + Lead Magnet có thể chuyển khách lạnh (FB ad clicker) thành đơn hàng L1 (<1tr) ở tỷ lệ ≥ 5% trong 3 tuần — và CTV được handoff lead warm thấy hiệu quả hơn cold-call không?"**

Nếu **CÓ** (đo bằng data thật) → Leader có lý do tiếp tục đầu tư cho Funnel OS đầy đủ.

Nếu **KHÔNG** → tiết kiệm được 30+ triệu so với việc build full plan rồi mới biết không hiệu quả.

### Giả thuyết phụ (nice-to-have)

- AI Coach giúp lead **tự nhận ra nhu cầu** → giảm áp lực CTV phải thuyết phục
- Khách có trải nghiệm sản phẩm tốt sẽ **giới thiệu bạn bè** trong 30 ngày
- Funnel có thể chạy **không cần CTV trực 24/7** ở khâu đầu

---

## 2. SCOPE DEMO MVP — Cái gì IN / OUT

### ✅ IN (BẮT BUỘC có)

| Component | Mô tả | Tại sao bắt buộc |
|---|---|---|
| **1 Landing Page** | `/quiz/healthspan-gia-dinh` — quiz 5 câu DISC + pain point + form | Cổng vào duy nhất, đo CAC |
| **1 Lead Magnet** | Ebook PDF 15 trang "Bài test Healthspan cho gia đình + 21 ngày sống xanh" | Trigger reciprocity, làm "ấm" lead |
| **AI Coach web chat** | Trang `/coach/[id]` — chat bubble, Claude Haiku, streaming SSE | Chứng minh AI khai vấn được khách thật |
| **1 Persona × 1 Pain** | Phụ nữ 28-40 có con nhỏ × Vấn đề giấc ngủ + miễn dịch gia đình | Cắt 9 nhánh persona×pain xuống 1 — đủ để test |
| **1 Product L1** | 1 SKU duy nhất, gói 2 món <1tr (vd: Vitamin tổng hợp gia đình 590k) | Đủ để có giao dịch thật |
| **Manual Checkout** | Thanh toán chuyển khoản + xác nhận thủ công qua Zalo | Không cần PayOS integration |
| **CTV Handoff Notification** | Khi AI chấm intent score ≥ 70 → gửi notification Telegram cho 1 CTV pilot | Test giả thuyết phụ |
| **Leader Dashboard 1 trang** | Bảng số liệu: leads/sessions/conversions/AOV — refresh 5 phút | Để Leader nhìn data thật, không phải PPT |
| **Audit log** | Lưu mọi session AI Coach (transcript) | Compliance + để Leader đọc câu chuyện thật |

### ❌ OUT (KHÔNG làm ở MVP — postpone v2)

| Component bị cắt | Lý do hoãn |
|---|---|
| Zalo OA tự động (chatbot) | Đăng ký OA mất 1-3 tuần, có thể dùng Zalo group manual trước |
| PayOS integration | Chuyển khoản thủ công đủ cho 50 đơn pilot |
| Health Companion daily check-in 30-90 ngày | Cần pilot lâu hơn để test, MVP chưa cần |
| Funnel Whisperer cron nurture 3 lần/ngày | Email/SMS nurture đơn giản dùng tay viết, gửi qua Mailerlite free tier |
| Product Matchmaker AI | 1 product nên không cần match |
| Partner Scout (L4 → Academy bridge) | Cần khách ở L3 trước — chưa có data |
| Downsell + Continuity | PB2 cốt lõi, nhưng MVP chỉ test L0→L1 nên chưa cần |
| 5B Engine (BAN/BÀN/BẠN/BÁN/BÁM) | PB4 toàn bộ — chỉ vận hành sau khi có buyer thực sự |
| 9 nhánh persona × pain | Bắt đầu 1 nhánh, sau đó nhân ra |
| Webinar/VSL | Tốn time content, MVP dùng text + quiz đủ |
| GAINS lần 2, SPIN, BANT, FAB, PICA, 4C, L.A.E.C., 7 closing tactics | MVP chỉ test GAINS rút gọn (3 yếu tố: Goals + Pain + Need) ở giai đoạn AI Coach |
| Multi-persona Empathy Story library | 1 persona = 1 câu chuyện |
| Pre-publish QA Gate, Frameworks registry, Myths KB | Postpone — chỉ cần khi scale |
| Sequences engine, A/B test infra | MVP chỉ chạy 1 version |
| Cloudflare R2 (asset storage) | Free tier Cloudinary đủ |
| Monorepo migrate Academy → apps/academy | KHÔNG ĐỘNG đến Academy code — chỉ build Funnel song song |
| Dual JWT auth cho 2 personas | MVP chỉ có customer journey, không có CTV login |

→ **Hơn 15 component bị cắt** — đó là chỗ tiết kiệm thời gian và tiền.

---

## 3. TECH STACK — Cheapest possible

| Tầng | Lựa chọn | Chi phí | Tại sao |
|---|---|---|---|
| **Frontend** | Next.js 14 + Vercel free tier | Free | Deploy 1-click, Vietnamese SSR tốt |
| **Backend API** | Next.js API routes (no separate Worker) | Free | Đơn giản, deploy chung |
| **Database** | Cloudflare D1 free tier (5GB) HOẶC Supabase free (500MB) | Free | D1 đã có account, free đủ pilot |
| **AI** | Anthropic Claude Haiku trực tiếp qua API | ~$15-30 cho 50 lead | Rẻ nhất, đủ thông minh cho coaching |
| **Email** | Resend free tier (3.000 email/tháng) | Free | Setup 5 phút |
| **File storage** | Cloudinary free (25GB) | Free | Ebook PDF + ảnh sản phẩm |
| **Auth** | Phone OTP qua Twilio trial OR Stringee (~150k cho 100 OTP) | ~150k | Mở rộng sau |
| **Analytics** | Plausible self-hosted trên Cloudflare Worker | Free | Tránh phụ thuộc Google |
| **Payment** | Bank transfer + manual confirm | Free | Skip PayOS hoàn toàn |
| **Zalo** | Khách vào Zalo Group qua link (không cần OA bot) | Free | Postpone OA registration |
| **CTV notify** | Telegram bot (1 bot, push tin cho 1 nhóm CTV pilot) | Free | Đăng ký 5 phút |
| **Domain** | `droppii-funnel.pages.dev` (free) hoặc subdomain Droppii sẵn có | Free | Tránh phí domain |

**Tổng OPEX/tháng pilot:** ~250-500k (chỉ Claude + Twilio + có thể FB ads test)

---

## 4. SCHEMA TỐI THIỂU — 5 BẢNG D1

So với 27 bảng full plan, MVP chỉ cần **5 bảng**:

```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  age_band TEXT,            -- '28-35' | '35-40' | '40-50'
  pain_primary TEXT,        -- 'sleep-immunity-family' (chỉ 1 ở MVP)
  family_context TEXT,      -- 'co-con-nho' | 'co-ba-me' | 'tu-cham'
  utm_json TEXT,
  zalo_group_joined BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'new', -- new|engaged|qualified|buyer|lost
  intent_score INTEGER DEFAULT 0,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coach_sessions (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  transcript_json TEXT,     -- [{role, content, ts}]
  intent_score INTEGER,     -- 0-100 AI tự chấm cuối session
  gains_summary_json TEXT,  -- {goals[], pain, need} chỉ 3 yếu tố rút gọn
  recommended_product_id TEXT,
  duration_min INTEGER,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT,
  price INTEGER,
  description TEXT,
  cogs INTEGER,
  active BOOLEAN DEFAULT 1
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  product_id TEXT,
  total INTEGER,
  status TEXT,              -- pending|paid|shipped|completed|refunded
  payment_method TEXT DEFAULT 'bank-transfer',
  ctv_assigned_id TEXT,     -- pilot CTV phụ trách
  bank_transfer_ref TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE handoff_events (   -- log handoff AI → CTV
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  ctv_id TEXT,
  reason TEXT,              -- 'intent_high' | 'requested_human' | 'product_inquiry'
  intent_score_at_handoff INTEGER,
  notification_sent_at DATETIME,
  ctv_responded_at DATETIME,
  outcome TEXT,             -- 'sold' | 'nurturing' | 'lost'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

→ **5 bảng** thay vì 27. Có thể setup trong 2h.

---

## 5. AI COACH PROMPT — Tối giản

Chỉ dùng **1 system prompt template** + GAINS rút gọn 3 yếu tố:

```
Bạn là Coach Linh — chuyên gia đồng hành sức khỏe gia đình theo
khung Medicine 3.0 của Dr. Peter Attia.

Đang chat với: chị {ten}, {age_band} tuổi, có con nhỏ.
Pain từ quiz: {pain_primary}.

NHIỆM VỤ (12-15 phút):
1. KHỞI ĐẦU (1-2 lượt): Đồng cảm + kể chuyện ngắn về 1 khách hàng tương tự.
2. GAINS RÚT GỌN (5-7 lượt):
   - Goals: Mục tiêu sức khỏe gia đình 3-6 tháng tới?
   - Pain: Pain cụ thể đang ảnh hưởng đến ai trong nhà?
   - Need: Nếu giải quyết được, đời sống nhà mình thay đổi thế nào?
3. CHỐT (1-2 lượt):
   - Nếu intent score ≥ 70: gợi ý sản phẩm L1 "Gói khởi đầu Healthspan Gia đình"
   - Nếu intent < 70: mời tham gia Zalo group + tặng ebook bổ sung
4. Cuối session: gọi tool `score_session()` chấm intent 0-100.

GIỚI HẠN BẮT BUỘC:
- KHÔNG dùng từ "trị/chữa/khỏi/thuốc"
- KHÔNG kê đơn, KHÔNG chẩn đoán
- Mỗi reply tối đa 80 từ, hỏi 1 câu/lượt
- Nếu khách hỏi y tế chuyên sâu → "Em không phải bác sĩ, mình nhờ bác sĩ tin cậy nhé"

GIỌNG: chị-em thân tình tiếng Việt miền Nam mềm.
```

Lưu vào `apps/funnel/lib/prompts/l0-coach-v1.md` — 1 file, không cần registry phức tạp.

---

## 6. TIMELINE — 3 TUẦN BUILD + 1 TUẦN PILOT

### Tuần 1 — Foundation + Landing (5 ngày dev thực)

| Task | Output |
|---|---|
| Tạo Next.js project trên Vercel | Hello world deployed |
| Setup Cloudflare D1 + 5 bảng schema | DB ready |
| Landing page `/quiz/healthspan-gia-dinh` với 5 câu quiz | Quiz functional |
| Form thu lead (tên+SĐT+age band+pain) → lưu D1 | Lead capture works |
| Phone OTP verify | Validate phone real |
| Trang `/cam-on` redirect sau lead capture, kèm link Zalo group + link AI Coach | Funnel entry complete |
| Ebook PDF 15 trang Healthspan (Content team — chạy song song) | Lead magnet ready |

### Tuần 2 — AI Coach + Product (5 ngày dev)

| Task | Output |
|---|---|
| Trang `/coach/[id]` web chat UI | Chat bubble functional |
| API route `/api/coach/message` gọi Claude Haiku streaming SSE | AI Coach responds |
| Lưu transcript vào `coach_sessions` mỗi lượt | Audit trail |
| Tool `score_session()` AI tự chấm intent score | Scoring works |
| Trang `/san-pham/{id}` product detail của 1 SKU L1 | Product page |
| Trang `/thanh-toan` manual: hiện QR + STK ngân hàng + form điền mã GD | Order form |
| API `/api/orders/confirm-payment` admin xác nhận paid | Order management |
| Trang `/khach-hang/don-hang` cho khách check status | Order tracking |

### Tuần 3 — Handoff + Dashboard + Polish (5 ngày dev)

| Task | Output |
|---|---|
| Telegram bot setup + integration | Bot ready |
| Cron khi `intent_score ≥ 70` → push Telegram cho CTV pilot | Handoff works |
| Dashboard `/admin` 1 trang cho Leader (10 metrics, refresh 5p) | Leader visibility |
| Audit log viewer — Leader đọc được 5 session random/tuần | QA compliance |
| Nurture email 3 cái cho lead chưa coach (gửi qua Resend) | Re-engagement |
| Testing E2E: 5 lead giả chạy từ ad → mua | Smoke test pass |
| Soft-launch 5 lead thật (nội bộ + bạn bè) | Pre-pilot validation |

### Tuần 4 — Pilot 50 lead thật + đo lường

| Hoạt động | Mục tiêu |
|---|---|
| FB ads chạy với budget ~3-5tr | ~50-100 click → ~50 leads |
| AI Coach hoạt động 24/7 | ~30 session hoàn thành |
| 1 CTV pilot trực Telegram | ~10-15 handoff |
| Daily standup 15 phút với Leader review dashboard | Leader nhìn data live |
| Cuối tuần 4: báo cáo demo cho Leader full team | Decision gate |

**Tổng thời gian:** 3 tuần build + 1 tuần pilot = **4 tuần**.

---

## 7. NHÂN LỰC TỐI THIỂU

| Vai | Khối lượng | Người |
|---|---|---|
| Auto-CTO orchestrator | Full | (đã có) |
| Worker AI subagents (4) | Full | (đã có) |
| Dev người review + deploy | ~25h | 1 dev part-time |
| Content writer (ebook + quiz + 5 ad creatives) | ~20h | 1 content writer part-time |
| Designer (banner FB ads + landing illust) | ~8h | 1 designer freelance |
| CTV pilot (trực Telegram nhận handoff) | ~1h/ngày × 14 ngày | 1 CTV tình nguyện |
| Leader review (daily 15p) | ~3h tổng | Leader |

→ **Không cần thuê thêm người.** Chỉ cần 1 dev + 1 content + 1 designer part-time + 1 CTV tình nguyện.

---

## 8. CHI PHÍ DEMO MVP

### CAPEX (3 tuần build)

| Hạng mục | Chi phí |
|---|---|
| Auto-CTO + 4 worker AI (sunk cost) | 0 |
| Dev người (~25h × 250k) | 6.250.000 |
| Content writer ebook + ad copy + quiz (~20h × 200k) | 4.000.000 |
| Designer banner + landing graphics (~8h × 250k) | 2.000.000 |
| Misc (Cloudflare paid tier nếu cần, domain test) | 500.000 |
| **TỔNG CAPEX MVP** | **~12.750.000** |

### OPEX trong 4 tuần pilot

| Hạng mục | Chi phí |
|---|---|
| Claude Haiku API (~50 session × ~7k đ) | ~350.000 |
| Twilio/Stringee phone OTP (~50 OTP) | ~150.000 |
| Cloudflare D1 + Vercel + Resend + Cloudinary | 0 (free tier) |
| Telegram bot | 0 |
| **FB Ads test** (controllable) | **3.000.000** (budget tối đa) |
| **TỔNG OPEX 4 tuần** | **~3.500.000** |

### Tổng đầu tư Demo MVP

**~16,25 triệu VND** (CAPEX 12,75tr + OPEX 3,5tr)

So với plan full 38tr trước đó → **tiết kiệm gần 60%** và **rút ngắn 4 tuần**.

---

## 9. KẾT QUẢ DEMO — Leader sẽ THẤY gì

Cuối tuần 4 (pilot day 14), Leader review dashboard và thấy:

### Dashboard "Demo Result"

```
┌─────────────────────────────────────────────────────────────┐
│  DROPPII FUNNEL OS — Demo Result (Day 28)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEADS         AI SESSIONS    PURCHASES     CTV HANDOFFS    │
│   58            34             6 (10.3%)     14             │
│  ▲             ▲              ▲             ▲                │
│  Goal: 50      Goal: 25       Goal: ≥4      Goal: 10        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  CAC      AOV       LTV est.   NPS (n=6)    Time-to-buy    │
│  ~85k     590k      ~1.2tr     +60          median 4 ngày   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  CTV Feedback (n=1 pilot CTV, 14 handoffs):                  │
│  "Lead warm hơn cold-call hẳn — 8/14 mở chat lại trong 24h.  │
│   Đỡ tốn 2-3h prospect mỗi ngày."                            │
├─────────────────────────────────────────────────────────────┤
│  Top 3 AI Coach session highlights (Leader đọc transcript):  │
│  • Session #023 — Chị Hương, 32t, con 5t → mua sau 6 lượt   │
│  • Session #047 — Chị Mai, 38t, ba ốm → không mua nhưng     │
│    join Zalo group, intent_score 78                          │
│  • Session #051 — Chị Linh, 29t → mua + giới thiệu 2 bạn    │
└─────────────────────────────────────────────────────────────┘
```

### 3 thứ Leader có thể tự kiểm chứng

1. **Đọc 3-5 transcript AI Coach thật** — xem có "khai vấn" đúng tinh thần không, có hard-sell không.
2. **Nói chuyện 5 phút với CTV pilot** — hỏi cảm nhận về warm lead.
3. **Bấm thử trải nghiệm `/quiz` và `/coach`** trên điện thoại — coi UX có ổn không.

→ **Không phải PPT, không phải lý thuyết — DATA THẬT từ KHÁCH THẬT.**

---

## 10. QUYẾT ĐỊNH SAU DEMO — GO / NO-GO

### Tiêu chí PASS (Leader nên invest tiếp)

Tối thiểu **3/5** tiêu chí sau:

- [ ] ≥ 5% L0→L1 conversion (≥ 3 đơn từ 60 lead)
- [ ] ≥ 50% lead hoàn thành AI Coach session
- [ ] CTV pilot phản hồi positive (NPS ≥ 7)
- [ ] CAC < 200k (đủ thấp để scale với margin Droppii)
- [ ] Leader đọc ít nhất 5 transcript và **xác nhận tone "khai vấn" đúng**

### Nếu PASS → Phase 2 đầu tư đầy đủ

- Approve full plan (~38tr CAPEX) cho 8 tuần build out:
  - Downsell + Continuity (T-044, T-045)
  - 5B Engine đầy đủ (T-051)
  - Zalo OA + PayOS
  - Multi-persona × pain (9 nhánh)
  - Health Companion 30-90 ngày
  - L4 → Academy bridge
  - Analytics + A/B testing infra

### Nếu NO-GO → Pivot hoặc Stop

- **Pivot:** thử persona khác / pain khác / lead magnet khác — chi phí pivot ~3-5tr
- **Stop:** đã tiết kiệm được 30tr+ so với việc build full mà không có data

→ **Đây là giá trị lớn nhất của Demo MVP: derisk quyết định đầu tư lớn.**

---

## 11. RỦI RO DEMO MVP

| Rủi ro | Mức | Mitigation |
|---|---|---|
| FB ads không có click chất lượng | Trung | Test 3 creative khác nhau, ad spend tối đa cap 5tr |
| AI Coach hallucinate sản phẩm | Trung | Hardcode chỉ recommend SKU duy nhất; guardrail regex |
| Khách không tin "AI coach" và bỏ ngay | Trung | UX nói rõ "Đây là Coach Linh của Droppii — AI hỗ trợ"; có nút "Chat với CTV thật" |
| CTV pilot không trực được Telegram | Thấp | Backup CTV thứ 2; SLA 1h |
| TPCN compliance vô tình vi phạm | Trung | Whitelist từ vựng chặt; ebook không nói "trị bệnh"; có disclaimer |
| Vercel/Cloudflare free tier hit limit | Thấp | 50 lead xa free tier limits |
| Khách không trust chuyển khoản | Thấp | Hiện QR code + xác nhận thủ công nhanh < 30 phút |

---

## 12. NEXT STEPS TỪ LEADER

Trước khi bắt đầu T-MVP-01, Leader chốt **5 quyết định nhỏ** (chỉ 5, không phải 9 như plan full):

1. **Approve CAPEX 13tr** cho Demo MVP?
2. **Approve OPEX 3-4tr** cho pilot ads + AI?
3. **Chọn persona + pain test:** đề xuất "Phụ nữ 28-40 có con nhỏ × Giấc ngủ + miễn dịch gia đình" — đồng ý?
4. **Chọn 1 SKU L1:** đề xuất gói vitamin tổng hợp gia đình ~590k — Leader pick SKU thực từ catalog Droppii?
5. **Cử 1 CTV pilot trực Telegram** trong 14 ngày — ai?

→ Nếu Leader trả lời 5 câu này, Auto-CTO bắt đầu T-MVP-01 trong 24h.

---

## 13. SAU MVP — Roadmap dài hạn

```
[Tuần 1-4] DEMO MVP (file này)
   ↓ PASS
[Tuần 5-12] FULL FUNNEL OS — Phase 2
   - 5 tầng sản phẩm (PB2)
   - 5B Engine (PB4)
   - 8 bước sales (PB3)
   - Multi-persona (9 nhánh)
   - L4 → Academy bridge ← KHÂU NÀY MỚI CHẠM TỚI TRAINING OS
   ↓
[Tuần 13+] HIVE WARFARE COMBINED
   - Funnel OS + Training OS chia sẻ data
   - Customer L4 chuyển CTV → Academy Tier 1 liền mạch
   - 1 dashboard 360° cho Leader
```

→ **Training OS vẫn tiếp tục phát triển song song theo roadmap riêng** (`plans/orchestrator/` đã có 25 task).

---

> **Tóm kết Demo MVP:**
>
> *"Demo MVP là **liều thuốc thử**, không phải sản phẩm hoàn chỉnh. Mất 16tr trong 4 tuần để biết có nên đầu tư thêm 30tr+ và 8 tuần nữa hay không. Trong tinh thần Tôn Tử — biết người biết ta, trăm trận trăm thắng — chúng ta đầu tư tiền ít nhất để có data thật nhất."*

**Phiên bản:** v1.0 — đợi Leader chốt 5 quyết định.
**Phụ trách:** Auto-CTO Hive Warfare.
