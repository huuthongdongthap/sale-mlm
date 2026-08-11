# DROPPII FUNNEL OS — DEMO MVP LEAN (5 TRIỆU)

> **Mô hình hợp tác (co-founder):**
> - **CEO (Leader Droppii)** — đảm nhận **vận hành, đào tạo, phát triển hệ thống**, mang vốn 5tr CAPEX, brand Droppii, network CTV, kiến thức sản phẩm
> - **Cố vấn Mô hình + CTO + Product (Anh)** — đảm nhận **chiến lược kinh doanh, kiến trúc kỹ thuật, phát triển sản phẩm, AI design, content engineering**
> - Cả 2 cùng góp **công sức + rủi ro** vào Demo MVP; **% đóng góp** quy đổi thành quyền lợi sau Demo PASS
> - Không bên nào trả tiền mặt cho bên còn lại trong MVP — cùng làm để chứng minh giả thuyết
>
> **CAPEX tối đa:** 5 triệu VNĐ (do CEO chi cho ads + AI API + SaaS)
> **Mục tiêu:** chứng minh Funnel OS hiệu quả trong 4 tuần để 2 bên quyết định scale Phase 2
>
> **Updated:** 2026-05-28
> **Phụ trách kiến trúc:** Cố vấn + CTO (Anh) — Auto-CTO Hive Warfare orchestrator
> **Phụ trách vận hành:** CEO (Leader Droppii)
> **Phiên bản:** v2.1 — Co-founder structure (supersedes DEMO-MVP.md v1)

---

## 0. ĐIỀU CHỈNH SO VỚI DEMO-MVP.md v1

v1 đã cắt từ 38tr xuống 16tr với 4 tuần. v2 này cắt tiếp xuống **5tr với 4 tuần** bằng cách:

| Hạng mục v1 | Thay đổi ở v2 |
|---|---|
| Thuê dev (6,25tr) | ❌ Cắt — Auto-CTO + 4 worker AI làm; quy đổi thành **% đóng góp** |
| Thuê content writer (4tr) | ❌ Cắt — AI generate, Leader review (~30p/ngày) |
| Thuê designer (2tr) | ❌ Cắt — Canva templates + AI image; Leader pick template (10p) |
| CTV pilot trực Telegram | ❌ Cắt — **Leader tự nhận handoff** (giai đoạn 50 lead pilot — vừa sức) |
| Phone OTP Twilio (150k) | ❌ Cắt — verify qua **Zalo group join** |
| Misc (500k) | ❌ Cắt — dùng free tier 100% |
| FB Ads test (3tr) | ✅ Giữ — 2-3tr controllable |
| Claude API (350k) | ✅ Giữ — ~500k buffer cho 50-80 session |
| Buffer (~1,5tr) | ✅ Có |

**Tổng v2: ~5 triệu — Leader nắm 100% operations, Auto-CTO Hive nhận % đóng góp.**

---

## 1. PHÂN BỔ 5 TRIỆU CHI TIẾT

| Hạng mục | Số tiền | Ghi chú |
|---|---|---|
| **FB Ads test** | **3.000.000** | Cap cứng — pause nếu CPC > 8k |
| **Claude API (Haiku)** | **500.000** | Cho 50-80 session × ~7k/session |
| **Domain năm 1** (optional) | **300.000** | Có thể dùng `*.pages.dev` free, skip mục này |
| **Canva Pro 1 tháng** | **300.000** | Cho thiết kế ad creatives + ebook layout |
| **ChatGPT Plus / Claude Pro Leader** | **500.000** | Để Leader prompt content thủ công khi cần |
| **SaaS misc (Notion / Calendly free hoặc paid 1 tháng)** | **200.000** | Tùy chọn |
| **Buffer** | **200.000** | Phòng phát sinh |
| **TỔNG** | **5.000.000** | ≤ trần |

**Free 100%:**
- Cloudflare Pages + D1 + R2 + Workers + KV (free tier đủ cho 50 lead)
- Vercel (nếu không dùng Cloudflare Pages)
- Resend email (3.000 email/tháng free)
- Telegram bot (free)
- Cloudinary (25GB free, nếu cần)
- Zalo Group cá nhân của Leader (free)
- GitHub private repo (free)
- Plausible self-host on Cloudflare Worker (free)

---

## 2. CẤU TRÚC CO-FOUNDER — Đóng góp & Quyền lợi

### 2.1 Phân vai cố định

| Vai trò | Người đảm nhận | Trách nhiệm |
|---|---|---|
| **CEO** | Leader Droppii | Vận hành hằng ngày, đào tạo CTV, phát triển hệ thống, brand, network khách hàng, sản phẩm thực, ra quyết định business |
| **Cố vấn Mô hình + CTO + Product** | Anh (qua Auto-CTO Hive + worker AI) | Chiến lược kinh doanh, kiến trúc kỹ thuật, phát triển sản phẩm phần mềm, AI design, content engineering, quality |

Hai vai trò **bổ sung lẫn nhau**, không chồng chéo. CEO không cần code; CTO không nắm vận hành.

### 2.2 Đóng góp của 2 bên vào Demo MVP

Cả 2 bên đều góp **công + rủi ro**. Liệt kê cụ thể để minh bạch:

#### Đóng góp của CEO (Leader)

| Hạng mục | Giá trị quy đổi |
|---|---:|
| CAPEX cash 5tr (ads + Claude + SaaS) | 5.000.000 |
| Brand Droppii — cho phép dùng tên + reputation | (vô hình, ước tính ~10tr) |
| Network CTV + khách hàng — pilot recruitment | (vô hình, ước tính ~10tr) |
| Sản phẩm thực + SKU L1 + giá COGS + hậu cần | (vô hình, ước tính ~5tr) |
| Kiến thức sales + tone Medicine 3.0 + compliance | (vô hình, ước tính ~5tr) |
| Thời gian vận hành 30h × 500k (CEO rate) | 15.000.000 |
| **TỔNG ĐÓNG GÓP CEO** | **~50.000.000** |

#### Đóng góp của Cố vấn + CTO (Anh)

| Hạng mục | Giờ ước tính | Đơn giá | Giá trị |
|---|---:|---:|---:|
| Business model design + chiến lược (MASTER-PLAN, PLAYBOOK-INTEGRATION-MAP) | 12h | 800k/h | 9.600.000 |
| CTO architecture (schema, stack, deployment) | 10h | 700k/h | 7.000.000 |
| Senior full-stack dev (Auto-CTO orchestrate) | 35h | 500k/h | 17.500.000 |
| AI worker — content (prompts, ebook, ad copy, email) | 20h | 300k/h | 6.000.000 |
| AI worker — design (Canva templates, banner, landing) | 8h | 350k/h | 2.800.000 |
| AI worker — QA (testing, audit log review) | 6h | 250k/h | 1.500.000 |
| Product ownership + roadmap (Phase 2 plan) | 8h | 700k/h | 5.600.000 |
| **TỔNG ĐÓNG GÓP CTO** | **~99h** | | **~50.000.000** |

→ Hai bên đóng góp **gần ngang nhau** (~50tr/bên) → tiền đề cho **chia equity 50/50** mặc định.

### 2.3 Cơ chế chia quyền lợi sau Demo PASS

Equity / revenue share chỉ kích hoạt khi **Demo PASS** (3/5 KPI ở Section 8). Nếu FAIL → cả 2 cùng dừng, không nợ nhau.

#### Mặc định: 50/50 cho Funnel OS

- **Equity baseline**: CEO 50% — CTO 50% trong Funnel OS (tách biệt với Training OS và phần MLM kinh doanh Droppii hiện hữu).
- **Điều chỉnh sau Demo PASS**: cả 2 cùng đánh giá lại đóng góp thực tế (giờ logged, tài sản vô hình đo lường được) để adjust ±10% nếu cần.

#### 3 hình thức equity (CEO chọn cùng CTO trong 30 ngày sau Demo PASS)

| Hình thức | Cơ chế | Phù hợp khi |
|---|---|---|
| **A — Revenue share** | CTO nhận 30-50% doanh thu NET Funnel OS trong 18-36 tháng, cap-floor minh bạch | Leader muốn giữ control 100% nhưng share lợi nhuận |
| **B — JV cổ phần** | Lập pháp nhân riêng "Funnel OS JV", CEO 50% — CTO 50%, vesting 4 năm cliff 1 | Leader muốn spin-off khỏi Droppii thành công ty SaaS độc lập |
| **C — Module trong Droppii** | Funnel OS là module nội bộ; CTO nhận hợp đồng cố vấn dài hạn + bonus theo milestone | Leader muốn giữ trong Droppii, không tách pháp nhân |

**Lưu ý quan trọng:** equity là cho **Funnel OS**, KHÔNG đụng đến cấu trúc kinh doanh MLM Droppii hiện hữu. Funnel OS là sản phẩm phần mềm + business unit mới, có khả năng tách thành revenue stream/cổ phần riêng.

### 2.4 Tracking đóng góp minh bạch

| Phía | Cách track |
|---|---|
| **CEO** | Log ops time trong file `operations-log.md` (auto-gen từ Telegram bot activity, Zalo handoff, dashboard logins) |
| **CTO** | Log dev time qua git commits + `cto-worklog.md`, weekly summary tự động cho CEO review |
| **Cả 2** | Weekly 30-phút sync chốt số giờ + ghi nhận đóng góp ngoài khung (referral, ý tưởng, network) |

→ Sau 4 tuần Demo, có **báo cáo đóng góp** 2-3 trang, làm cơ sở quyết định equity %.

### 2.5 Hợp đồng co-founder tối giản (sẽ viết riêng `CO-FOUNDER-AGREEMENT.md`)

5 điều khoản nồng cốt:
1. **Phân vai cố định** — CEO / CTO trách nhiệm gì.
2. **Đóng góp baseline 50/50** cho Funnel OS, adjust ±10% sau Demo theo log thực tế.
3. **3 hình thức equity** — chọn 1 trong 30 ngày sau Demo PASS.
4. **Tiêu chí Demo PASS / FAIL** — minh bạch trước, không cãi sau.
5. **Exit clause** — cách 1 bên rút lui (notice 30 ngày, buy-out formula).

Nếu CEO đồng ý principle → tôi viết bản nháp `CO-FOUNDER-AGREEMENT.md` 1-2 trang để 2 bên ký trước Tuần 1.

---

## 3. LEADER PLAYBOOK — Vận hành solo 4 tuần

### 3 tuần build — Leader làm gì?

Leader **không cần code, không cần thiết kế** — chỉ làm 5 việc:

| Việc | Thời gian | Tần suất |
|---|---|---|
| Review content AI generate (ebook, quiz, ad copy) | 30 phút/ngày | Tuần 1-2 |
| Approve thiết kế Canva trước khi publish | 10 phút/ngày | Tuần 2 |
| Cung cấp 1 SKU L1 thực + ảnh sản phẩm + STK ngân hàng | 1 lần | Tuần 1 |
| Test E2E trên điện thoại cá nhân | 30 phút | Cuối tuần 2 |
| Setup tài khoản FB Business + Zalo group + Telegram bot | 1 giờ | Tuần 1 |
| **Tổng tuần 1-3** | **~10-12 giờ** | Phân tán |

### 1 tuần pilot — Leader vận hành solo

| Việc | Thời gian | Tần suất |
|---|---|---|
| Trực Telegram nhận notification handoff (intent ≥ 70) | ~15 phút/lần × ~5 lần/ngày | Daily |
| Phản hồi khách trên Zalo personal (sau handoff) | ~20-30 phút/lần × ~3-5 lần/ngày | Daily |
| Xác nhận chuyển khoản trên dashboard admin | ~5 phút/lần × ~1-2 lần/ngày | Daily |
| Review dashboard sáng/tối | 10 phút × 2 | Daily |
| Đọc 2-3 transcript AI Coach để QA tone | 20 phút | Hàng ngày |
| Tinh chỉnh ads creative nếu CTR < 1% | 30 phút | Khi cần |
| **Tổng pilot/ngày** | **~2-3 giờ/ngày** | 14 ngày |

→ Khả thi nếu Leader đã có 2-3h/ngày dành cho việc bán hàng. Nếu Leader bận hơn → cân nhắc gói thêm 1 CTV pilot tình nguyện (chia hoa hồng đơn pilot, không trả tiền cứng).

### Quy ước Leader handoff

- **Intent ≥ 70**: AI ping Leader Telegram trong 90 giây. Leader có **2 giờ SLA** để mở chat Zalo cá nhân với khách.
- **Intent 40-70**: AI tự gửi link Zalo group + ebook + đề xuất đơn L1, không cần Leader.
- **Intent < 40**: AI gửi ebook + đưa vào sequence nurture 3 email tự động.

---

## 4. CONTENT GENERATION — AI làm, Leader duyệt

| Asset | Cách làm | Thời gian Leader review |
|---|---|---|
| **Ebook 15 trang "Healthspan Gia đình"** | Claude generate draft → Canva layout → Leader edit final tone | 2h once |
| **Quiz 5 câu DISC + pain point** | Claude generate options → Leader pick wording | 30p once |
| **5 ad creative cho FB ads** | Canva templates + Claude headline → Leader chọn 3 | 1h once |
| **Landing copy** | Claude generate theo PB1 Tầng Lạnh-Ấm-Nóng-Bán → Leader edit | 1h once |
| **3 email nurture sequence** | Claude generate → Leader review trước khi schedule | 30p once |
| **System prompt AI Coach** | Auto-CTO viết theo Medicine 3.0 + GAINS rút gọn → Leader test 5 conversation | 1h once |
| **Disclaimer + ToS + Privacy** | Auto-CTO generate template Vietnam → Leader confirm | 15p |

**Tổng Leader review time tuần 1-2**: ~6-8h trải đều.

---

## 5. TECH STACK — Cập nhật cho 5tr

| Tầng | Lựa chọn | Lý do |
|---|---|---|
| **Frontend + API** | Next.js 14 + Cloudflare Pages | Free, 1-click deploy, Vietnamese SSR tốt |
| **Database** | Cloudflare D1 (free 5GB) | Plenty cho 50-100 lead |
| **AI** | Claude Haiku qua Anthropic API | ~6-7k/session |
| **Email** | Resend free (3000/tháng) | Đủ cho nurture + admin notifications |
| **File storage** | Cloudflare R2 free + Cloudinary 25GB free | Ebook PDF + ảnh sản phẩm |
| **Auth lead** | **Zalo group join** (không phone OTP) | Verify qua hành động: khách phải join Zalo group mới được vào AI Coach |
| **Payment** | Bank transfer + manual confirm | Skip PayOS — Leader tự confirm |
| **Notification Leader** | Telegram bot (free) | Push handoff alert |
| **Analytics** | Plausible self-host trên CF Worker hoặc just D1 queries | Free |
| **Domain** | `droppii-funnel.pages.dev` (free) hoặc Leader có domain sẵn | Free / 300k |

→ Tất cả miễn phí trừ Claude API.

---

## 6. SCOPE CẮT THÊM SO VỚI v1

| Component v1 | v2 cắt | Lý do |
|---|---|---|
| Phone OTP verify | ❌ | Verify qua Zalo group join — đỡ tốn Twilio 150k |
| Designer freelance | ❌ | Canva Pro + AI image gen |
| Content writer freelance | ❌ | Claude + Leader review |
| Dev freelance | ❌ | Auto-CTO Hive (equity) |
| CTV pilot riêng | ❌ | Leader tự handoff |
| Plausible analytics riêng | ❌ | Dashboard query trực tiếp D1 |
| Polish QA tuần 3 | ⚠️ Rút gọn | Chỉ smoke test E2E, skip A/B |

---

## 7. SCHEDULE — 4 TUẦN CHO LEAN

### Tuần 1 — Setup + Content draft (Leader: ~5h)

**Auto-CTO Hive (trong vòng 5-7 ngày):**
- Setup repo `apps/funnel/`
- Cloudflare D1 schema 5 bảng + seed
- Landing page `/quiz/healthspan-gia-dinh`
- Form lead capture → D1
- AI generate ebook draft 15 trang
- AI generate 5 ad creative concepts
- AI generate quiz 5 câu

**Leader cần làm:**
- Cung cấp 1 SKU L1 + ảnh + giá + mô tả (1h)
- Cung cấp STK ngân hàng + tài khoản FB Business ads (30p)
- Review ebook + sửa tone (2h)
- Review quiz + ad copy (1h)
- Test landing trên điện thoại (30p)

### Tuần 2 — AI Coach + Checkout (Leader: ~5h)

**Auto-CTO Hive:**
- AI Coach chat UI `/coach/[id]` + Claude Haiku integration
- Tool `score_session()` chấm intent 0-100
- Transcript lưu D1
- Product page + Bank transfer checkout
- Order confirmation admin view
- Telegram bot setup + notification cron

**Leader cần làm:**
- Test 10 session AI Coach giả (đóng vai khách) → confirm tone Medicine 3.0 (2h)
- Approve email templates (1h)
- Approve disclaimer + ToS (30p)
- Setup Telegram bot account + nhóm CTV pilot (30p)
- Add Zalo group public link (15p)

### Tuần 3 — Dashboard + Polish + Soft launch (Leader: ~3h)

**Auto-CTO Hive:**
- Leader Dashboard 1 trang (10 metrics, refresh 5p)
- Audit log viewer
- 3-email nurture sequence via Resend
- Smoke test E2E
- Soft-launch 5 lead nội bộ

**Leader cần làm:**
- Mời 5 friend/family thử full flow (~2h)
- Approve dashboard layout (30p)
- Setup FB ads campaign (~1h, có template Auto-CTO gửi)

### Tuần 4 — Pilot 50 lead thật

**Auto-CTO Hive:**
- Standby fix bug critical (~2-3h trong tuần)
- Daily morning report cho Leader qua Telegram

**Leader cần làm:**
- ~2-3h/ngày × 7 ngày (xem section 3) = ~14-21h

**Total Leader time 4 tuần:** ~30-35 giờ — **~1h/ngày trung bình**.

---

## 8. KẾT QUẢ DEMO — Tiêu chí PASS

**Tiêu chí Demo PASS = 3/5 metric đạt:**

| KPI | Target | Cách đo |
|---|---|---|
| Lead intake | ≥ 50 | FB ads + Zalo organic + referral cá nhân Leader |
| AI Coach session completion | ≥ 50% (25 sessions) | `coach_sessions.duration_min ≥ 5` |
| L1 conversion | ≥ 5% (≥ 3 đơn) | `orders.status='paid'` |
| CAC | ≤ 250k | FB Ads spend / số lead |
| Leader xác nhận tone đúng | Subjective | Đọc 5 transcript random, confirm Medicine 3.0 + khai vấn + no hard-sell |

→ Cách đo **DATA-DRIVEN**, không PPT.

---

## 9. RỦI RO RIÊNG CHO MÔ HÌNH LEAN

| Rủi ro | Mức | Mitigation |
|---|---|---|
| Leader quá tải 2-3h/ngày trong pilot | 🟡 Trung | Recruit 1 CTV tình nguyện chia hoa hồng đơn pilot — không trả tiền cứng |
| AI generate content sai tone Droppii | 🟡 Trung | Leader review bắt buộc trước publish; có "tone guide" file 1 trang |
| FB ads bị reject (TPCN compliance) | 🟡 Trung | Ad copy chỉ nói lead magnet (ebook free), không claim sức khỏe |
| Khách không trust chat AI | 🟢 Thấp | UX nói rõ "Coach Linh là AI hỗ trợ Droppii"; có nút "Chat với Leader" |
| Auto-CTO Hive làm chậm vì không có ràng buộc tiền | 🟢 Thấp | SLA cố định trong hợp đồng equity: tuần 1-3 không trễ quá 2 ngày |
| Demo FAIL → Auto-CTO mất công | 🟡 Trung | Đó là risk-sharing — đã chấp nhận từ đầu khi không lấy tiền mặt |
| Equity disagreement sau Demo PASS | 🟡 Trung | Hợp đồng 1-2 trang ký trước Tuần 1 |

---

## 10. NEXT STEPS — CEO + CTO chốt 4 việc

Trước khi bắt đầu Tuần 1, **2 co-founder** cùng chốt:

1. **CEO approve CAPEX 5tr** (chia: 3tr ads + 500k Claude + 1,5tr SaaS/buffer)?
2. **2 bên approve cấu trúc co-founder 50/50** cho Funnel OS, chọn 1 trong 3 hình thức equity (A/B/C) sau Demo PASS?
3. **CEO chốt 1 SKU L1** (đề xuất gói vitamin gia đình ~590k) + STK ngân hàng nhận + tone guide Droppii?
4. **CEO confirm dành ~30h trong 4 tuần** (~1h/ngày) cho vận hành ops + review content?

Nếu cả 4 đồng thuận → CTO bắt đầu Tuần 1 trong 24h và viết bản nháp `CO-FOUNDER-AGREEMENT.md` để 2 bên ký trước khi commit code.

CEO muốn xem **hợp đồng co-founder nháp 1-2 trang** trước khi commit? Reply "viết CO-FOUNDER-AGREEMENT" — tôi viết trong ngày hôm sau.

---

## 11. SAU DEMO PASS — Phase 2

Nếu Demo PASS (3/5 KPI đạt), 3 luồng song song mở ra:

1. **Equity activation**: 2 co-founder ký `CO-FOUNDER-AGREEMENT.md` final + chọn 1 trong 3 hình thức equity (A/B/C) trong 30 ngày.
2. **Phase 2 build full Funnel OS** theo PLAYBOOK-INTEGRATION-MAP.md (~38tr CAPEX, 8 tuần) — lúc này CEO có data thật để approve budget hoặc gọi đầu tư ngoài.
3. **Scale pilot** từ 50 → 200 lead/tháng với cùng infra MVP (~10tr/tháng OPEX) trong 2-3 tháng để generate cohort data + tinh chỉnh persona/pain.

→ Demo MVP Lean này là **"liều thử cùng nhau"** giữa 2 co-founder: chia rủi ro 4 tuần × 5tr × ~130 giờ công tổng để chứng minh Funnel OS đáng tiếp tục đầu tư lớn.

---

> **Tóm 1 câu:**
>
> *"CEO Droppii góp 5tr + 30h vận hành + brand. CTO+Cố vấn (Anh) góp ~100h chiến lược + kiến trúc + code + content. Cả 2 cùng chia rủi ro để chứng minh Funnel OS có hiệu quả thật — trước khi 2 bên cùng đầu tư 30tr+ cho Phase 2."*

**Phiên bản:** v2.1 Co-founder — đợi 2 bên chốt 4 quyết định.
**Phụ trách:** CEO (Leader Droppii) + CTO (Anh — Auto-CTO Hive Warfare).
