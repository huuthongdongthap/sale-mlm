# PLAYBOOK ↔ FUNNEL OS — Integration Map

> **Mục đích:** đối chiếu từng mục trong 4 playbook nội bộ của Droppii với module / agent / bảng D1 / prompt trong Funnel OS — để Leader xác nhận **không bỏ sót dòng nào**, và dev biết chính xác phải implement gì.
>
> **Cơ sở:**
> - Playbook 1 (PB1) — Hệ Thống Phễu Marketing (AIDA cải tiến: Lạnh-Ấm-Nóng-Bán)
> - Playbook 2 (PB2) — Hệ thống phễu sản phẩm (Lead Magnet → Tripwire → Core → Downsell → Continuity)
> - Playbook 3 (PB3) — Quy trình bán hàng thành công (8 bước, dùng GAINS/SPIN/BANT/FAB/PICA/4C/LAEC)
> - Playbook 4 (PB4) — Quy trình chăm sóc khách hàng trọn đời (Công thức 5B: BAN-BÀN-BẠN-BÁN-BÁM)
> - File prompt thực chiến: "Các prompt thường dùng tư vấn dinh dưỡng AI" (4 bước thu thập/phân tích/tìm chất/hướng dẫn dùng)
>
> **Updated:** 2026-05-20
> **Phụ trách kiến trúc:** Auto-CTO Hive Warfare

---

## 0. NGUYÊN TẮC ĐỐI CHIẾU

3 nguyên tắc tôi áp dụng khi map:

1. **Không phát minh lại.** Funnel OS là phần mềm hóa 4 playbook — mọi từ vựng (Lạnh/Ấm/Nóng/Bán, 5B, GAINS, SPIN…) đều dùng nguyên xi để team Droppii đọc thấy quen.
2. **Mỗi mục playbook phải có 1 chỗ "chui" vào hệ thống** — hoặc là 1 agent, 1 bảng D1, 1 prompt template, 1 cron job, 1 component UI, hoặc 1 luật vận hành (policy). Không có mục nào "treo".
3. **Cái gì 4 playbook nhắc đi nhắc lại → đó là core, không phải tùy chọn.** Ví dụ GAINS xuất hiện ở cả PB3 (Bước 3) và PB4 (Bước BÀN) → phải là module dùng chung (`packages/ai-agents/frameworks/gains.ts`).

---

## 1. BẢNG TỔNG KẾT — 4 PLAYBOOK NHÌN TỪ FUNNEL OS

| Playbook | Bản chất | Phần Funnel OS phụ trách | Mức tự động hóa kỳ vọng |
|---|---|---|---|
| **PB1 — Phễu Marketing 4 tầng** | Awareness funnel — dẫn dắt nhận thức trước khi mua | Content Engine + Landing pages + Ads + Email + Zalo broadcast | **~60%** (AI generate copy theo tầng, người duyệt) |
| **PB2 — Phễu sản phẩm 5 tầng** | Product progression — bậc thang giá trị + dòng tiền | Catalog (products table) + Cart/Checkout + Upsell engine + Subscription billing | **~85%** (rule engine + matchmaker AI) |
| **PB3 — Quy trình bán hàng 8 bước** | Sales conversation workflow của CTV | AI Coach L0 (Bước 1-4) + Offer Composer (Bước 5-6) + Objection Bot (Bước 7) + CTV handoff (Bước 8) | **~70%** Bước 1-4, **~40%** Bước 5-7 (CTV vào trận), 100% Bước 8 (→ PB4) |
| **PB4 — 5B Customer Care** | Lifetime customer care + LTV maximization | 5B Engine (5 agent con: BAN, BÀN, BẠN, BÁN, BÁM) chạy hậu mãi | **~80%** (vài đoạn cần CTV escalate khi NPS thấp) |

---

## 2. PB1 → FUNNEL OS — Mapping chi tiết phễu Marketing

### 2.1 Tầng LẠNH (Attention)

| Mục trong PB1 | Funnel OS triển khai |
|---|---|
| Triết lý "Marketing là dẫn dắt nhận thức, không phải thuyết phục" | Hard-coded vào system prompt của tất cả AI agents (line đầu prompt template) |
| Chỉ tập trung "sự thấu hiểu" | `Content Engine` agent — preset 1: `cold-empathy` |
| Tuyệt đối KHÔNG bán | Guardrail regex post-process: chặn copy có chữ "mua/đăng ký/order" khi `tier_target='cold'` |
| Câu hỏi "Vấn đề nào khiến KH mất ngủ đêm qua mà chưa gọi được tên" | Prompt template `pb1-cold-pain-finder.md` — input: persona JSON, output: 3 sự thật khó nghe |
| Multi-channel: Social, Ads, Email, Landing, Webinar | Bảng `content_pieces` cột `channel ∈ {fb,tiktok,ig,zalo-oa,email,landing,webinar}` + `funnel_tier='cold'` |
| Format không cố định, vai trò cố định | Bảng `content_pieces.role` riêng với `channel` — 1 content có thể export ra nhiều channel |
| Phễu dài (1 content = 1 tầng) vs phễu nhanh (1 content = 4 tầng) | Cột `content_pieces.mode ∈ {single-tier, four-tier}`. Single-tier dùng Long-form sequencer; four-tier dùng PICA cấu trúc |

### 2.2 Tầng ẤM (Interest)

| Mục trong PB1 | Funnel OS triển khai |
|---|---|
| "Giáo dục có định hướng" — bóc tách niềm tin sai lệch | Prompt template `pb1-warm-debunk.md`. Input: phổ biến niềm tin sai (database `myths` table). Output: bài bóc tách |
| 3 cột so sánh (Vấn đề / Giải pháp phổ thông / Giới hạn-Hậu quả) | UI component `<ThreeColumnComparison>` cho landing/Webinar; reusable trong Content Engine output |
| Debunking Myths | Bảng D1 mới `myths (id, niem_tin_sai, su_that, nganh, segment)` — KB để AI Coach và Content Engine truy cập |
| Checklist sai lầm + Case Study đảo chiều | Template generator `pb1-warm-checklist-and-reverse-case.md` |
| Retargeting Ads cho người đã xem video Lạnh | Webhook FB Pixel → cron `ads-retarget.ts` chuyển audience từ `cold` sang `warm`, swap creative |

### 2.3 Tầng NÓNG (Desire)

| Mục trong PB1 | Funnel OS triển khai |
|---|---|
| Công bố Framework độc quyền (tên + cấu trúc, không tiết lộ chi tiết) | Bảng `frameworks (id, name, structure_json, owner_id)` — Droppii có thể có nhiều framework: "Hive Warfare", "Medicine 3.0 Family", "5B Care"… |
| Case Study chứng minh logic | Bảng `case_studies (id, customer_id, journey_summary, results_json, audience_target)` — Content Engine pull khi cần |
| Hành trình cá nhân (Origin Story) | Trường `frameworks.origin_story_md` |
| KHÔNG nói giá, KHÔNG đưa offer | Guardrail: `tier_target='hot'` → khoá copy chứa `\d+(đ\|tr\|k\|VND)` (regex) |
| 3 trục thuyết phục L-R-F (Logic, Kết quả, Phù hợp) | Prompt template `pb1-hot-framework-pitch.md` bắt buộc output có 3 section L/R/F |

### 2.4 Tầng BÁN (Action)

| Mục trong PB1 | Funnel OS triển khai |
|---|---|
| Offer = Sản phẩm cốt lõi + Bonus + Guarantee + Fast-action incentive | Bảng `offers (id, core_product_id, bonuses_json, guarantee_md, fast_action_window_h, valid_from, valid_to)` |
| Neo giá (Price Anchoring) — công bố Tổng Giá trị trước Giá | UI component `<OfferStack>` render đúng thứ tự: Stack giá trị → Total → Giá đặc biệt |
| Scarcity (giới hạn số lượng) + Urgency (deadline) | Bảng `offers.scarcity_qty`, `valid_to` + UI `<CountdownTimer>` + cron `expire-offer.ts` |
| Cam kết hoàn tiền (Risk-free) | Bảng `offers.guarantee_md` + `orders.refund_policy` — auto handle ở Customer Dashboard |
| CTA hướng tới Kết quả ("Nhận X ngay" không phải "Mua ngay") | Convention trong UI kit: button label luôn bắt đầu bằng verb + outcome |

### 2.5 PB1 — Phần III, IV, V: Triển khai + đo lường

| Mục PB1 | Funnel OS |
|---|---|
| Phễu dài hạn vs phễu nhanh | `campaigns.mode ∈ {long-form, fast-conversion}` |
| Multi-channel orchestration | `Campaign Commander` agent (đã có trong Academy 6 agents) — mở rộng để bắn cross-channel |
| Checklist 4 câu hỏi trước khi đăng (Mục tiêu / Cảm xúc / Thời điểm / CTA) | UI `<ContentQAGate>` bắt buộc duyệt 4 câu hỏi trước khi `publish_status='ready'` |
| KPI tổng (CPL, Opt-in, LP rate) | Funnel analytics dashboard tab "Marketing" |

---

## 3. PB2 → FUNNEL OS — Mapping chi tiết phễu Sản phẩm

### 3.1 Lead Magnet — Sản phẩm miễn phí

| Mục trong PB2 | Funnel OS |
|---|---|
| Định nghĩa: free, đổi info | Bảng `products.tier='magnet'`, `price=0`, `requires_lead_capture=true` |
| 4 tiêu chí (cụ thể-cấp bách / giá trị cao / dễ tiêu thụ / liên kết Tripwire) | Pre-publish checklist trong admin UI — block publish nếu không tick đủ |
| 3 dạng (Educator: Checklist/Ebook/Report; Implementer: Template/Workbook/Trial; Assessor: Quiz/Mini-Audit) | `products.magnet_format ∈ {checklist, ebook, report, template, workbook, trial, quiz, mini-audit}` |
| Quy trình 7 bước thiết kế | Markdown SOP file `docs/sop/lead-magnet-design.md` (tham khảo, không tự động hóa) |
| Tỷ lệ Opt-in 20-40% target | KPI dashboard "Lead Magnet" — alert nếu < 15% |
| Email sau Lead Magnet: cảm ơn → 24h gợi ý Tripwire | Auto sequence `lead-magnet-followup` (gồm 2 email) |
| Thank-you Page = trang bán hàng đầu tiên cho Tripwire | UI `<ThankYouPage>` component bắt buộc có slot `<TripwireOTO>` |

### 3.2 Tripwire — Hoàn vốn quảng cáo

| Mục trong PB2 | Funnel OS |
|---|---|
| Giá $7-$47 (VN ~150k-1tr) | `products.tier='tripwire'`, `price ∈ [150000, 1000000]` constraint |
| No-brainer offer | Tỷ lệ conversion target ≥ 10% sau Lead Magnet — alert nếu thấp |
| Liên kết Lead Magnet → Tripwire | Bảng `product_progressions (from_product_id, to_product_id, ladder_step)` |
| Sản phẩm số COGS gần 0 (ưu tiên) | `products.cogs` field — block tier='tripwire' với cogs > 30% price |
| Lời chào Upsell ngay tại Thank-you Page (OTO) | UI `<OneTimeOffer>` với countdown 10-15 phút |
| Email Downsell sequence cho người từ chối Core | Sequence `tripwire-to-core-then-downsell` |
| KPI Break-even Rate (Tripwire ≥ CAC quảng cáo) | Dashboard auto-calc, alert nếu < 80% |

### 3.3 Core Offer — Sản phẩm chính

| Mục trong PB2 | Funnel OS |
|---|---|
| Giá cao, lợi nhuận chính | `products.tier='core'`, `target_margin_pct ≥ 60` |
| Giải quyết vấn đề CỐT LÕI và toàn diện | `products.core_problem_solved_md` field bắt buộc — text mô tả vấn đề |
| Đóng gói "Hệ thống" (Framework + Modules) | `products.modules_json` array — render ra UI checkpoint |
| Yếu tố tăng giá trị (Support, Tools, Community) | `products.value_addons_json` — 3 mục bắt buộc |
| Upsell ngay sau Tripwire | Sequence `tripwire-success-to-core-upsell` chạy ngay (cron 0 phút) |
| KPI: LTV, AOV, Refund rate | Dashboard "Revenue" |

### 3.4 Downsell — Lưới đỡ ⚠️ (Plan hiện tại đang THIẾU)

| Mục trong PB2 | Funnel OS |
|---|---|
| Trigger khi khách từ chối Core Offer | Event `core_offer_declined` → kích hoạt Downsell flow |
| Giá thấp hơn Core, cao hơn Tripwire | `products.tier='downsell'`, validator `tripwire.price < downsell.price < core.price` |
| Tinh gọn = Minimum Viable Transformation | `products.downsell_of_id` (foreign key đến Core) + `removed_features_json` |
| 3 dạng (Lite Version / Component Split / Reduced Support) | `products.downsell_type ∈ {lite, component, reduced-support}` |
| Lời chào "Just in Case…" ngay sau từ chối | UI `<DownsellPopup>` xuất hiện trong 10 phút sau decline |
| Khan hiếm "$197 này chỉ có hiệu lực 10 phút" | Token-based offer link với TTL 10 phút |
| Email sequence Downsell 3 ngày | Sequence `downsell-3day` |
| Nuôi dưỡng để upgrade lên Core sau 3-6 tháng | Cron `downsell-upgrade-nurture` chạy hàng quý |
| KPI Downsell Conversion Rate 10-30% | Dashboard alert nếu < 8% |

→ **Phải thêm:** `T-044 — Implement Downsell pipeline` (xem section 8 — Gap analysis).

### 3.5 Continuity — Dòng tiền MRR ⚠️ (Plan hiện tại đang THIẾU)

| Mục trong PB2 | Funnel OS |
|---|---|
| Subscription monthly/quarterly | `products.tier='continuity'`, `billing_cycle ∈ {monthly, quarterly, yearly}` |
| 4 dạng (Physical Subscription / SaaS / Membership / Retainer) | `products.continuity_type ∈ {physical-sub, saas, membership, retainer}` |
| Phù hợp Droppii (gia đình + TPCN): **Physical Subscription** (hộp tháng) + **Membership** (community + content) | Pilot mặc định dùng cả 2 |
| Tiêu chí Giá trị Gia tăng Liên tục | Bắt buộc trường `products.monthly_value_calendar_md` mô tả nội dung mỗi tháng |
| High Opportunity Cost of Leaving | `products.switching_cost_hooks_json` — list hooks (data history, community membership, exclusive content) |
| Tự động hóa 90%+ | `products.auto_renewal=true` + Dunning Management |
| Renewal email 1 tuần trước hết hạn | Sequence `continuity-renewal-1w` |
| Dunning Management (3-5 email trong 7 ngày sau payment fail) | Sequence `continuity-dunning-7d` |
| Cancellation page với "Tạm dừng" option | UI `<CancellationFlow>` với 3 lựa chọn: Tạm dừng / Đổi gói / Hủy |
| KPI MRR + Churn Rate (< 5% B2C target) + LTV/CAC ≥ 3 | Dashboard "Subscription Health" |

→ **Phải thêm:** `T-045 — Implement Continuity (subscription) billing + lifecycle`.

### 3.6 PB2 Phần III, IV, V — Vận hành phễu sản phẩm

| Mục PB2 | Funnel OS |
|---|---|
| Value Ladder Mapping | UI `<ValueLadderEditor>` cho admin — kéo thả product vào tầng |
| Solo-biz: 3 tầng (Magnet → Tripwire → Core) đủ | Validator: cần MIN Magnet+Tripwire+Core để launch funnel |
| SME: full 5 tầng | Funnel OS support tất cả, không bắt buộc |
| Tự động hóa Trigger | Engine `funnel-trigger-engine.ts` đọc bảng `triggers (event, condition, action)` |

---

## 4. PB3 → FUNNEL OS — Mapping 8 bước Sales

### 4.1 Bước 1 — Xây dựng danh sách (Lead Magnet)

| Mục trong PB3 Bước 1 | Funnel OS |
|---|---|
| ICP (Ideal Customer Profile) — Demographic + Psychographic | Bảng `personas (id, demo_json, psycho_json, ai_prompt_overlay_md)` |
| Phân biệt Lead vs Prospect (đã qualified) | `leads.status ∈ {new, engaged, qualified, prospect, customer, lost}` |
| Form qualification 1-2 câu chiến lược | Quiz step trên landing — câu hỏi từ `personas.qualification_questions_json` |
| Email Nurturing 3-7 bước (1-3-7 ngày) | Sequence `nurture-7day` với 4 email mặc định |
| Lead Scoring | Cột `leads.score INTEGER` — updated bởi `Lead Scorer` cron mỗi giờ |

### 4.2 Bước 2 — Hẹn gặp (Logical Reason)

| Mục PB3 Bước 2 | Funnel OS |
|---|---|
| Chiến thuật 1: Hướng dẫn sử dụng quà tặng | Template email `pb3-step2-value-max.md` |
| Chiến thuật 2: Đánh giá Cá nhân hóa | AI Coach mở session với câu mở "Em đã đọc form chị điền, có 3 điểm em muốn trao đổi…" |
| Chiến thuật 3: Đánh giá tình hình thị trường | Template `pb3-step2-market-context.md` |
| Webinar/VSL = Mass Appointment | Module `webinars (id, vsl_url, agenda_md, scheduled_at)` + auto-reminder SMS/Zalo |
| CTA "Đặt Cuộc Gọi 1:1 miễn phí" cho High-Ticket | Slot trên `coach_sessions.type='1on1-vsl-followup'` |
| Calendly-style booking | Tích hợp Cal.com hoặc embed Calendly |

### 4.3 Bước 3 — GAINS (Empathy + Khai vấn) ⭐ CORE FRAMEWORK

**GAINS** (Goals - Achievements - Interests - Know - Skills) là khung hỏi xuất hiện ở **cả PB3 Bước 3 và PB4 Bước BÀN** → phải implement chuẩn xác.

| Yếu tố GAINS | Lưu vào DB | Prompt sử dụng | Output expected |
|---|---|---|---|
| **G** — Goals | `coach_sessions.gains_json.goals[]` | `gains-G-elicit.md` — hỏi mục tiêu 6 tháng / 1 năm / 5 năm | Array of `{statement, timeframe, personal_significance}` |
| **A** — Achievements | `coach_sessions.gains_json.achievements[]` | `gains-A-elicit.md` — hỏi đã thử gì, gì hoạt động tốt | Array of `{action_taken, result, learning}` |
| **I** — Interests | `coach_sessions.gains_json.interests[]` | `gains-I-elicit.md` — sở thích cá nhân + ngành nghề đam mê | Array of strings |
| **N** — Know (network/knowledge) | `coach_sessions.gains_json.know[]` | `gains-N-elicit.md` — nguồn thông tin tin cậy + decision makers khác | Array of `{type:'person/source/group', detail}` |
| **S** — Skills | `coach_sessions.gains_json.skills[]` | `gains-S-elicit.md` — kỹ năng mạnh + cần bổ sung | Array of `{type:'strength/gap', detail}` |

**Empathy Story** (mở đầu Bước 3 — kể chuyện đồng cảm 3 phần: Setup-Struggle-Realization):
- Lưu vào `personas.empathy_stories_json[]` — mỗi persona có ≥3 câu chuyện
- AI random chọn 1 phù hợp pain → kể trước GAINS

**Active Listening — Paraphrasing + Silent 3-5s + Drill Down**:
- AI sử dụng technique "paraphrase confirmation" mỗi 3 câu trả lời (built into system prompt)
- Drill Down: AI hỏi follow-up "Tại sao điều đó quan trọng?" tối đa 3 lần

**7 Nguyên tắc vàng xây niềm tin** (PB3 mục 3.6) — bake vào AI system prompt:
1. Giữ lời hứa "không bán hàng" trong Bước 3 — guardrail
2. Tôn trọng thời gian — AI tracks `coach_sessions.duration_min`
3. Tập trung 100% — N/A cho AI
4. Không phê phán giải pháp cũ — guardrail word list
5. Dùng "Tôi" không "Chúng tôi" — system prompt voice
6. Liên kết Lead Magnet — AI luôn quote `leads.magnet_consumed` ở turn 1
7. Bắt đầu + kết thúc bằng cảm ơn — bake vào template

### 4.4 Bước 4 — SPIN + BANT + COI (Xác định nhu cầu) ⭐ CORE FRAMEWORK

**SPIN** (Situation - Problem - Implication - Need-payoff):

| SPIN | Implement |
|---|---|
| **S** — Situation | Pull dữ liệu từ `leads.intake_json` (đã thu ở Bước 1), KHÔNG hỏi lại |
| **P** — Problem | Prompt `spin-P-elicit.md` — hỏi tối đa 3 vấn đề bề mặt |
| **I** — Implication | Prompt `spin-I-elicit.md` — đào sâu hậu quả; mục tiêu chốt thành con số |
| **N** — Need-Payoff | Prompt `spin-N-elicit.md` — hỏi giá trị nếu giải quyết |

**BANT** (Budget - Authority - Need - Timeline):

| BANT | Implement |
|---|---|
| **B** — Budget | Gián tiếp qua COI ("anh/chị đã dự trù khoảng ngân sách nào?") — lưu `coach_sessions.budget_range` |
| **A** — Authority | Hỏi quy trình mua ("ngoài chị, còn ai tham gia quyết định?") — lưu `coach_sessions.decision_makers_json` |
| **N** — Need | Đã có từ SPIN |
| **T** — Timeline | Hỏi deadline gắn với Goal — lưu `coach_sessions.timeline_target_date` |

**COI** (Cost of Inaction — định lượng nỗi đau bằng tiền/thời gian):
- Function call `calculate_coi(metric, value_per_unit, timeframe_months)` → return số tiền cụ thể
- Lưu `coach_sessions.coi_amount_vnd`
- AI dùng câu khung: "Chị đã chia sẻ X. Như vậy mỗi tháng nhà mình đang [mất/tốn] Y VNĐ chỉ vì Z."

**Need Score** (1-4 điểm — PB3 mục 4.8.3):
- 1: Confirm Problem
- 2: Confirm Implication
- 3: Confirm COI (định lượng)
- 4: Confirm Need-Payoff

→ AI tự chấm sau Bước 4, lưu `coach_sessions.need_score`. CHỈ chuyển Bước 5 nếu score ≥ 3.

### 4.5 Bước 5 — Trình bày lợi ích (FAB + PICA + Bridge Statement)

**FAB** (Feature - Advantage - Benefit):

| Yếu tố | Implement |
|---|---|
| Feature | Pull từ `products.features_json` |
| Advantage | `products.advantages_json` (chức năng = giúp khách làm gì) |
| Benefit (3 cấp: Cấp 1 tổ chức/cấp 2 nhóm/cấp 3 cá nhân) | `products.benefits_json[]` mỗi item có `level ∈ {1,2,3}` |

**Bridge Statement**: AI luôn dùng cụm từ chuyển tiếp ("Điều đó có nghĩa là…", "Lợi ích cho chị là…").

**PICA** (Problem - Impact - Cure - Action):
- Cấu trúc bắt buộc của output Bước 5 — Composer agent generate theo template `pb3-step5-pica.md`

**Trial Closing**: Sau mỗi lợi ích quan trọng, AI hỏi confirm. Lưu vào `coach_sessions.trial_close_responses[]`.

**Contrast Selling** (Trước-Sau): UI render `<BeforeAfterCard>` để show.

### 4.6 Bước 6 — Chốt đơn (4C Closing) ⭐ CORE FRAMEWORK

**4C** = Confidence / Clarity / Conviction / Commitment — phải có audit:

| 4C | Check trước khi trigger close |
|---|---|
| **Confidence** | `need_score ≥ 3` + GAINS đầy đủ |
| **Clarity** | Offer đã render đầy đủ (`<OfferStack>` shown) |
| **Conviction** | Có ít nhất 1 Case Study đã show (`coach_sessions.case_studies_shown[]` ≥ 1) |
| **Commitment** | User nhấp button "Yes, I want this" hoặc reply confirm |

**5-Point Closing Framework**:
1. Recapitulation — AI auto-summary 3 điểm (G/P/Solution) — template `pb3-step6-recap.md`
2. Offer Stacking — UI `<OfferStack>` với Total Value → Final Price
3. Trial Close question — text + 5s silent timer
4. Objection Handling → chuyển Bước 7
5. Final Close + Action Plan — UI `<ActionPlanCard>` (gửi hợp đồng, lịch kick-off)

**Closing Tactics** (mỗi tactic là 1 prompt variant cho A/B test):
- Assumptive Close (`closing-assumptive.md`)
- Reverse Close / Exit Strategy (`closing-reverse.md`)
- COI Close (`closing-coi.md`)
- Scarcity/Urgency Close (`closing-scarcity.md`)
- Breakdown of Profit (`closing-breakdown.md`)
- Exclusive Option Close (`closing-exclusive.md`)
- Step-by-Step Commitment Close (`closing-step-commit.md`)

→ Composer agent chọn tactic dựa trên `coach_sessions.objection_likely` (predict từ GAINS data).

### 4.7 Bước 7 — Xử lý từ chối (L.A.E.C. + Pre-emptive)

**L.A.E.C.** (Listen - Acknowledge - Explore - Close):

| Bước | Implement |
|---|---|
| **L** — Listen | AI không ngắt lời (tạm dừng response 3 turn cho khách nói) |
| **A** — Acknowledge | AI bắt đầu reply bằng "Em hoàn toàn hiểu…" hoặc "Em rất đánh giá cao sự thẳng thắn của chị" |
| **E** — Explore | AI hỏi "nếu chúng ta giải quyết được [objection], chị có sẵn lòng bắt đầu không?" — lưu `coach_sessions.lock_objections[]` |
| **C** — Close | Quay lại closing tactic phù hợp |

**Pre-emptive Objection Handling** (PB3 mục 6.4): AI tự nêu objection phổ biến **trước** khi khách nêu — system prompt buộc trong Bước 6 phải address 3 phổ biến: Price, Authority, Time.

**Phân biệt "Không" vs "Phản đối"**:
- "Phản đối" (e.g. "tôi cần suy nghĩ thêm") → L.A.E.C.
- "Không" (sau 2 vòng L.A.E.C.) → chuyển sang Downsell flow (PB2.3.4)

### 4.8 Bước 8 — Chăm sóc sau bán → bắt cầu sang PB4

| Mục PB3 Bước 8 | Funnel OS |
|---|---|
| Trigger ngay sau payment success | Event `order.paid` → kích hoạt PB4 BAN sequence ngay |
| Thank-you note cá nhân hóa | Email + Zalo template `pb3-step8-thankyou.md` (template variables: tên, sản phẩm, ngày dự kiến nhận hàng) |
| Lịch onboarding/kick-off | Auto-create event trong `coach_sessions.kickoff_scheduled_at` |
| Chuyển handoff sang Customer Success (BẠN) | Event `bridge.sales-to-care` — log `audit_log` |

---

## 5. PB4 → FUNNEL OS — Mapping 5B Customer Care

5 agent con cho mỗi bước 5B, chạy song song hậu mãi. Một customer có thể đang trong **nhiều** bước 5B đồng thời tùy state.

### 5.1 BAN (Tặng — Trao giá trị) — Agent `5b-ban-engine`

| Mục PB4 Bước BAN | Implement |
|---|---|
| Gift Matrix 3 loại | Bảng `gifts (id, type, content_url, target_segment, trigger_event)` với `type ∈ {onboarding, nurturing, community-personal}` |
| Onboarding Value (Quick-Start Guide, Video Demo, Webinar) | Sequence `ban-onboarding-7day` |
| Nurturing Value (Ebook, Newsletter, Template) | Cron monthly send |
| Community & Personal (Lời chúc sinh nhật + Mã giảm giá; quyền truy cập nhóm kín) | Trigger theo `users.birthday`, `users.purchase_anniversary` |
| Nguyên tắc "Liên quan mật thiết" | Gift Matcher: chỉ chọn `gifts` nơi `target_segment ∩ user.segments ≠ ∅` |
| Nguyên tắc "High Value, Low Friction" | Validator: `gifts.consume_time_min ≤ 15` |
| Đúng thông điệp - đúng thời điểm | Trigger Automation Engine (3 trigger types: time-based / behavior-based / event-based) |
| KPI: Open rate, CSAT, Repeat purchase | Dashboard "BAN Performance" |

### 5.2 BÀN (Trao đổi — GAINS lần 2) — Agent `5b-ban-engine` (BÀN)

| Mục PB4 Bước BÀN | Implement |
|---|---|
| Thời điểm: 15-30 ngày sau mua | Cron `5b-ban-trigger` chạy daily, check `orders.paid_at + 21d` |
| GAINS lần 2 (Macro Goals chứ không phải ban đầu) | Cùng prompt template GAINS như PB3 Bước 3, chỉ thêm wrapper "Sau khi đã đạt được [previous goal], mục tiêu tiếp theo của chị là gì?" |
| Goals — phát hiện Upsell opportunity | `coach_sessions.gains_json.goals[]` lưu lần 2 |
| Achieve — đánh giá Onboarding | If chưa achieve → trigger BẠN (Proactive Support), KHÔNG chuyển BÁN |
| Interest — phát hiện Cross-sell | `users.interests_evolution_json[]` track theo thời gian |
| Know/Skills — phát hiện Educational Product opportunity | Tag `users.upsell_signals[]` |
| 3 hình thức: Khảo sát tự động / Cuộc gọi 1-1 (LTV cao) / Community Q&A | `5b-ban-engine` pick hình thức theo `users.ltv_segment` |
| Nguyên tắc 80/20 nghe nhiều hơn nói | Built in system prompt: AI response < 100 từ mỗi turn |
| Nguyên tắc KHÔNG bán | Guardrail strict trong Bước BÀN |
| Mục tiêu "Điểm giao thoa" (nhu cầu mới × sản phẩm tiếp theo) | Function `find_intersection(gains_v2, product_catalog)` → return top 3 candidates |
| KPI: Bàn-to-Bán Conversion Rate | Dashboard "BÀN Performance" |

### 5.3 BẠN (Thân thiện — Customer Success) — Agent `5b-ban-engine` (BẠN)

| Mục PB4 Bước BẠN | Implement |
|---|---|
| Reactive Service → Proactive Success | Cron `proactive-csm` scan daily các signal Churn |
| 4 trụ cột (Proactive Support / Community / Crisis Handling / Personalized Milestones) | 4 sub-modules trong `5b-ban-engine` |
| Stumbling Block detection | Compare `gains_v2.skills_gap` vs `users.activity_log` — nếu mismatch → push tài liệu hỗ trợ |
| Low Usage Alert (7+ ngày không activity) | Cron daily → if no `journey_events` in 7d → trigger personal email |
| Community moderation | Bảng `community_posts` + role `moderator` trong `users.role[]` |
| Crisis Handling (đồng cảm → giải pháp tức thì → cam kết tương lai) | Template `5b-ban-crisis-resolution.md` cho CTV/leader dùng manual |
| "Làm quá" (Over-Delivery) | Policy: với churn risk customer, leader có quyền cấp `extra_gift` ngoài budget thường |
| Phân loại CSM theo LTV (High-Ticket → CSM riêng; Medium → automation; Low → Chatbot) | `users.csm_tier ∈ {auto, hybrid, dedicated}` field |
| Chatbot Multi-channel với smooth hand-off | Bot trên Zalo OA + web — keyword "phàn nàn/hủy/khó chịu" → ping CSM dedicated trong 5 phút |
| KPI: CSAT, NPS, Resolution Time | Dashboard "BẠN Health" |

### 5.4 BÁN (Chào hàng mới — Upsell/Cross-sell/Continuity/Downsell hậu mãi)

| Mục PB4 Bước BÁN | Implement |
|---|---|
| Triết lý "Bán là gợi ý giải pháp logic" | System prompt voice — không pushy |
| Triggers từ GAINS data | Sequence `5b-ban-pick-offer` đọc `coach_sessions.gains_json` v2 |
| 4 chiến lược (Upsell / Cross-sell / Continuity / Down-sell) | Function `recommend_5b_offer(user, gains_v2)` return type + product |
| GAINS-to-Sale Framework 5 bước (Empathy → Gap → Solution → Vision → Soft CTA) | Template `5b-ban-pitch-5step.md` |
| Hyper-Personalization (dùng từ vựng khách dùng) | Inject `gains_v2.user_vocabulary[]` vào prompt |
| Email 4-step sequence (Hook → Proof → FAQ → Gentle Close) | Sequence `5b-ban-4email-pitch` |
| Suppression rule (dừng nếu khách phản hồi tiêu cực) | Listener trên `email.replied_negative` → set `users.do_not_pitch_until` |
| Chatbot trigger theo keyword nhu cầu | Keyword list trong `5b-ban-chatbot-triggers.json` |
| Nguyên tắc "Thành công trước doanh thu" | Validator: chặn pitch nếu `achievement_score < 50` (khách chưa thấy kết quả thì không bán thêm) |
| Soft hand-off sau khi mua → quay lại BAN | Event `5b-ban.purchased` → trigger BAN cho sản phẩm mới |
| KPI: Post-Sales Conversion, AOV, LTV, Continuity Adoption | Dashboard "BÁN 5B" |

### 5.5 BÁM (Bám sát — Loyalty + Referral + Loop closure)

| Mục PB4 Bước BÁM | Implement |
|---|---|
| 2 mục tiêu (Loyalty + Advocacy) | KPI dual: Retention + Referral |
| Churn Signal Monitoring | Cron `churn-signal-scan` hourly — check 3 signals: usage drop / email engagement drop / community silence |
| Intervention Sequence (chuyển khách về BẠN ngay) | Auto trigger `bridge.bam-to-ban-as-friend` |
| Value Mapping report định kỳ | Cron monthly send "Báo cáo thành công 60 ngày qua" — auto-generate từ `health_progress` + `orders` + `community_posts` |
| Next-Dollar Value Nurturing (nội dung free tiếp tục) | Sequence `bam-nurture-monthly` |
| Behind-the-Scenes content | Bảng `content_pieces.audience='loyal-customers'` |
| Soft Upgrades (tính năng mới miễn phí) | Notification module |
| Peer-to-Peer BÁM (cộng đồng tự bám sát) | Community engagement gamification |
| VIP/Loyalty Programs (High-Ticket events, ưu tiên hỗ trợ) | `users.loyalty_tier ∈ {regular, vip, ambassador}` |
| Referral Engine | Bảng `referrals (id, referrer_user_id, referred_user_id, status, reward_json)` |
| Thời điểm vàng yêu cầu referral (sau khi A+ NPS 9-10) | Trigger `prompt_referral_when_nps_high` |
| Two-sided rewards | Field `referrals.referrer_reward_id` + `referred_reward_id` (FK to `rewards` table) |
| Non-monetary rewards (Recognition, Early Access, Beta) | `rewards.type ∈ {discount, gift, recognition, early-access, beta-access}` |
| Testimonial collection | Trigger sau Achievement → ask permission record video |
| Loop closure → BAN cho sản phẩm mới | Bridge auto |
| KPI: CRR, NRV, Engagement Rate, Re-engagement to BÀN | Dashboard "BÁM" |

---

## 6. FRAMEWORK REGISTRY — Toàn bộ frameworks đưa vào đâu

Tất cả frameworks được implement dưới dạng **reusable modules** trong `packages/ai-agents/frameworks/`:

```
packages/ai-agents/frameworks/
├── aida-cold-warm-hot-sell.ts      # PB1 — 4 tầng marketing
├── product-ladder.ts                # PB2 — 5 tầng product
├── gains.ts                         # PB3 Bước 3 + PB4 Bước BÀN ⭐
├── spin.ts                          # PB3 Bước 4 ⭐
├── bant.ts                          # PB3 Bước 4 ⭐
├── coi.ts                           # PB3 Bước 4 — cost of inaction calculator
├── fab.ts                           # PB3 Bước 5
├── pica.ts                          # PB3 Bước 5
├── trial-close.ts                   # PB3 Bước 5
├── 4c-closing.ts                    # PB3 Bước 6 ⭐
├── closing-tactics/                 # PB3 Bước 6 — 7 tactics
│   ├── assumptive.ts
│   ├── reverse-exit.ts
│   ├── coi-close.ts
│   ├── scarcity-urgency.ts
│   ├── breakdown-profit.ts
│   ├── exclusive-option.ts
│   └── step-commitment.ts
├── laec-objection.ts                # PB3 Bước 7 ⭐
├── pre-emptive-objection.ts         # PB3 Bước 6.4
└── 5b-care/                         # PB4 ⭐
    ├── ban-gift.ts
    ├── ban-survey-gains-v2.ts
    ├── ban-friend-csm.ts
    ├── ban-offer-pitch.ts
    └── bam-loyalty-referral.ts
```

Mỗi framework có:
- `system_prompt.md` (Vietnamese)
- `function_schema.json` (input/output)
- `kpi_spec.md`
- `unit_tests.ts`

---

## 7. SCHEMA MỞ RỘNG — Bổ sung so với plan hiện tại

Plan hiện tại đã có 8 bảng mới (`leads`, `products`, `orders`, `order_items`, `coach_sessions`, `journey_events`, `health_progress`, `ctv_invites`).

**Cần thêm 12 bảng nữa** để cover hết 4 playbook:

```sql
-- PB1 — Marketing infrastructure
CREATE TABLE content_pieces (
  id TEXT PRIMARY KEY,
  channel TEXT,            -- fb|tiktok|ig|zalo-oa|email|landing|webinar
  funnel_tier TEXT,        -- cold|warm|hot|sell
  mode TEXT,               -- single-tier|four-tier
  body_md TEXT,
  asset_urls TEXT,
  audience_target TEXT,
  publish_status TEXT,     -- draft|qa|ready|published
  qa_checklist_json TEXT,  -- 4 questions PB1 mục 5.1
  framework_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE myths (        -- PB1 — knowledge base niềm tin sai lệch
  id TEXT PRIMARY KEY,
  niem_tin_sai TEXT,
  su_that TEXT,
  nganh TEXT,
  segment TEXT
);

CREATE TABLE frameworks (   -- PB1 Tầng Nóng — framework độc quyền
  id TEXT PRIMARY KEY,
  name TEXT,
  structure_json TEXT,
  origin_story_md TEXT,
  owner_id TEXT
);

CREATE TABLE case_studies ( -- PB1+PB3+PB4 — proof
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  journey_summary TEXT,
  results_json TEXT,
  audience_target TEXT,
  framework_id TEXT,
  testimonial_video_url TEXT
);

-- PB2 — Product/funnel infrastructure
CREATE TABLE product_progressions (
  from_product_id TEXT,
  to_product_id TEXT,
  ladder_step INTEGER,
  conversion_target_pct INTEGER
);

CREATE TABLE offers (       -- PB1 Bán + PB3 Bước 6
  id TEXT PRIMARY KEY,
  core_product_id TEXT,
  bonuses_json TEXT,
  guarantee_md TEXT,
  fast_action_window_h INTEGER,
  scarcity_qty INTEGER,
  valid_from DATETIME,
  valid_to DATETIME
);

CREATE TABLE subscriptions (   -- PB2 Continuity ⚠️ MỚI
  id TEXT PRIMARY KEY,
  user_id TEXT,
  product_id TEXT,
  billing_cycle TEXT,
  next_billing_at DATETIME,
  status TEXT,             -- active|paused|canceled|past_due
  cancel_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PB3+PB4 — Sales + care infrastructure
CREATE TABLE sequences (    -- Email/Zalo automation
  id TEXT PRIMARY KEY,
  name TEXT,
  trigger_event TEXT,
  trigger_condition_json TEXT,
  steps_json TEXT          -- [{step, channel, content_id, delay_h}]
);

CREATE TABLE sequence_runs (
  id TEXT PRIMARY KEY,
  sequence_id TEXT,
  user_id TEXT,
  status TEXT,
  current_step INTEGER,
  next_action_at DATETIME
);

CREATE TABLE personas (     -- PB3 Bước 1 — ICP
  id TEXT PRIMARY KEY,
  name TEXT,               -- "Phụ nữ 28-35 có con nhỏ"
  demo_json TEXT,
  psycho_json TEXT,
  qualification_questions_json TEXT,
  empathy_stories_json TEXT,
  ai_prompt_overlay_md TEXT
);

CREATE TABLE gifts (        -- PB4 BAN
  id TEXT PRIMARY KEY,
  type TEXT,               -- onboarding|nurturing|community-personal
  content_url TEXT,
  consume_time_min INTEGER,
  target_segment TEXT,
  trigger_event TEXT
);

CREATE TABLE referrals (    -- PB4 BÁM
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT,
  referred_user_id TEXT,
  status TEXT,
  referrer_reward_id TEXT,
  referred_reward_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  type TEXT,               -- discount|gift|recognition|early-access|beta-access
  value_json TEXT
);
```

Mở rộng cột vào bảng hiện có:

```sql
ALTER TABLE products ADD COLUMN tier TEXT;  -- magnet|tripwire|core|downsell|continuity
ALTER TABLE products ADD COLUMN magnet_format TEXT;
ALTER TABLE products ADD COLUMN downsell_of_id TEXT;
ALTER TABLE products ADD COLUMN downsell_type TEXT;
ALTER TABLE products ADD COLUMN continuity_type TEXT;
ALTER TABLE products ADD COLUMN billing_cycle TEXT;
ALTER TABLE products ADD COLUMN modules_json TEXT;
ALTER TABLE products ADD COLUMN value_addons_json TEXT;
ALTER TABLE products ADD COLUMN target_margin_pct INTEGER;
ALTER TABLE products ADD COLUMN cogs INTEGER;

ALTER TABLE coach_sessions ADD COLUMN gains_json TEXT;       -- GAINS structured
ALTER TABLE coach_sessions ADD COLUMN spin_json TEXT;        -- SPIN structured
ALTER TABLE coach_sessions ADD COLUMN budget_range TEXT;
ALTER TABLE coach_sessions ADD COLUMN decision_makers_json TEXT;
ALTER TABLE coach_sessions ADD COLUMN timeline_target_date DATE;
ALTER TABLE coach_sessions ADD COLUMN coi_amount_vnd INTEGER;
ALTER TABLE coach_sessions ADD COLUMN need_score INTEGER;     -- 1-4
ALTER TABLE coach_sessions ADD COLUMN lock_objections_json TEXT;
ALTER TABLE coach_sessions ADD COLUMN trial_close_responses_json TEXT;
ALTER TABLE coach_sessions ADD COLUMN case_studies_shown_json TEXT;

ALTER TABLE users ADD COLUMN ltv_segment TEXT;       -- high|medium|low
ALTER TABLE users ADD COLUMN csm_tier TEXT;          -- auto|hybrid|dedicated
ALTER TABLE users ADD COLUMN loyalty_tier TEXT;      -- regular|vip|ambassador
ALTER TABLE users ADD COLUMN nps_score INTEGER;
ALTER TABLE users ADD COLUMN birthday DATE;
ALTER TABLE users ADD COLUMN purchase_anniversary DATE;
ALTER TABLE users ADD COLUMN do_not_pitch_until DATETIME;
ALTER TABLE users ADD COLUMN upsell_signals_json TEXT;
```

**Tổng:** schema mới có 7 (cũ) + 8 (plan v1) + 12 (mới này) = **27 bảng**, plus ~25 cột mới vào users/products/coach_sessions.

---

## 8. GAP ANALYSIS — So với MASTER-PLAN.md hiện tại

Đối chiếu MASTER-PLAN.md v1.0 (file 779 dòng đã viết) với 4 playbook, tìm ra **15 gaps**:

| # | Gap | Mức độ | Hành động |
|---|---|---|---|
| 1 | Thiếu tầng **Downsell** trong phễu sản phẩm | 🔴 Cao | Add T-044 |
| 2 | Thiếu tầng **Continuity** (subscription monthly) | 🔴 Cao | Add T-045 |
| 3 | Thiếu khung **GAINS** chuẩn (chỉ nhắc tên, chưa schema) | 🔴 Cao | Add T-046 |
| 4 | Thiếu khung **SPIN + BANT + COI** | 🔴 Cao | Add T-047 |
| 5 | Thiếu khung **4C + 7 Closing Tactics** | 🔴 Cao | Add T-048 |
| 6 | Thiếu khung **L.A.E.C. + Pre-emptive Objection** | 🟡 Trung | Add T-049 |
| 7 | Thiếu **Empathy Story library** + 3-phần kể chuyện | 🟡 Trung | Add T-050 |
| 8 | Thiếu **5B Customer Care Engine** (5 sub-agents) | 🔴 Cao | Add T-051 (lớn) |
| 9 | Thiếu **Referral Engine + Two-sided rewards** | 🟡 Trung | Add T-052 |
| 10 | Thiếu **Myths KB** (niềm tin sai lệch) | 🟡 Trung | Add T-053 |
| 11 | Thiếu **Frameworks registry** (Hive Warfare, Medicine 3.0, 5B…) | 🟡 Trung | Add T-054 |
| 12 | Thiếu **Sequences engine** (email/Zalo automation) | 🔴 Cao | Add T-055 (lớn) |
| 13 | Thiếu **Pre-publish QA Gate** (4 câu hỏi PB1.5.1) | 🟢 Thấp | Add T-056 |
| 14 | Thiếu **COI Calculator** function tool | 🟡 Trung | Add T-057 |
| 15 | Tên agents chưa khớp ngôn ngữ playbook | 🟡 Trung | T-058 — Rename trong code |

→ **15 task bổ sung** (T-044 → T-058). Sẽ append vào `tasks.json` orchestrator.

---

## 9. TASK BREAKDOWN — Bổ sung 15 task

| ID | Tên | Phụ thuộc | Giờ | Owner |
|---|---|---|---|---|
| T-044 | Downsell pipeline (table + UI popup + sequence) | T-027, T-035 | 60 | backend + frontend |
| T-045 | Continuity (subscription) billing + lifecycle | T-027, T-035 | 105 | backend |
| T-046 | GAINS framework module + 5 elicit prompts | T-031 | 75 | content + backend |
| T-047 | SPIN+BANT+COI module + Need Score | T-031, T-046 | 90 | content + backend |
| T-048 | 4C Closing + 7 tactic prompts + Offer Composer | T-027 (offers table), T-047 | 90 | content + backend |
| T-049 | L.A.E.C. + Pre-emptive Objection module | T-048 | 60 | content + backend |
| T-050 | Empathy Story library + 3-part renderer | T-046 | 45 | content |
| T-051 | 5B Customer Care Engine (5 sub-agents) | T-040 | 150 | content + backend (lớn) |
| T-052 | Referral Engine + Rewards | T-051 | 75 | backend |
| T-053 | Myths KB (initial seed 50 entries) | T-027 | 45 | content |
| T-054 | Frameworks registry + Origin story import | T-027 | 30 | backend |
| T-055 | Sequences engine (email/Zalo cron + step runner) | T-033 | 120 | backend (lớn) |
| T-056 | Pre-publish QA Gate (4 câu hỏi PB1) | T-029 | 30 | frontend |
| T-057 | COI Calculator function tool | T-047 | 30 | backend |
| T-058 | Rename agents theo ngôn ngữ playbook (refactor) | T-051 | 30 | dev |

**Tổng:** ~1.035 phút (~17h người) — chạy 4 worker song song theo dependency = **~5-6 ngày dev thực thêm**.

→ Cộng vào 18 task hiện có (~24h người) = **~41h người** = **~10-12 ngày dev thực với 4 worker**.

→ MVP timeline phải mở rộng từ **6 tuần → 8 tuần** để cover hết playbook.

---

## 10. COMPLETENESS CHECKLIST — Đối chiếu xuôi từng playbook

### PB1 — Phễu Marketing 4 tầng ✅

- [x] Tầng Lạnh — empathy + pain finder
- [x] Tầng Ấm — debunk myths + 3-col comparison
- [x] Tầng Nóng — framework + case study
- [x] Tầng Bán — offer stack + scarcity + guarantee
- [x] 2 chế độ phễu (dài / nhanh)
- [x] Multi-channel orchestration
- [x] Pre-publish QA checklist 4 câu hỏi
- [x] KPI dashboard Marketing

### PB2 — Phễu Sản phẩm 5 tầng ✅

- [x] Lead Magnet (8 sub-criteria + 3 dạng + 7-step design)
- [x] Tripwire (no-brainer + Thank-you OTO + KPI break-even)
- [x] Core Offer (modules + value addons + upsell after tripwire)
- [x] Downsell ⚠️ (gap đã noted — T-044)
- [x] Continuity ⚠️ (gap đã noted — T-045)
- [x] Value Ladder editor
- [x] Subscription billing + Dunning + Cancellation flow

### PB3 — Quy trình bán hàng 8 bước ✅

- [x] Bước 1: Lead Magnet + Form + Scoring + Nurture
- [x] Bước 2: Hẹn gặp (3 chiến thuật + Webinar/VSL)
- [x] Bước 3: GAINS (5 yếu tố) + Empathy Story + 7 nguyên tắc vàng
- [x] Bước 4: SPIN + BANT + COI + Need Score
- [x] Bước 5: FAB + Bridge + PICA + Trial Close + Contrast
- [x] Bước 6: 4C + 5-Point Framework + 7 Closing Tactics + Offer Stack
- [x] Bước 7: L.A.E.C. + Pre-emptive Objection + Phân biệt "Không" vs "Phản đối"
- [x] Bước 8: Handoff sang PB4 (BAN sequence)

### PB4 — 5B Customer Care ✅

- [x] BAN — Gift Matrix 3 loại + 3 thời điểm + Automation
- [x] BÀN — GAINS lần 2 + 3 hình thức triển khai + Điểm Giao Thoa
- [x] BẠN — Customer Success 4 trụ cột + Phân loại CSM + Chatbot
- [x] BÁN — 4 chiến lược + 5-step GAINS-to-Sale + Suppression
- [x] BÁM — Churn signal + Value mapping + Referral Engine + Loop closure
- [x] Automation triggers (time/behavior/event)
- [x] KPI cho mỗi bước 5B

### Cross-playbook ✅

- [x] GAINS xuất hiện ở PB3 Bước 3 + PB4 BÀN — implement 1 module dùng chung
- [x] Lead Magnet xuất hiện ở PB2 + PB3 Bước 1 — 1 implementation
- [x] Case Study xuất hiện ở PB1 Nóng + PB3 Bước 5 + PB4 BÁM — 1 implementation
- [x] Continuity xuất hiện ở PB2 + PB4 BÁN — 1 implementation
- [x] Khung 4 tầng AIDA của PB1 ≠ 4 level L0-L1-L2-L3 của Funnel OS — đã clarify: PB1 là awareness, Funnel OS L0-L3 là buying journey, chúng overlap nhưng phục vụ khác

---

## 11. TỪ VỰNG CHUẨN — Bắt buộc trong code và UI

Để team Droppii đọc thấy quen, các thuật ngữ sau phải **giữ nguyên tiếng Việt** trong code variable names, UI labels, dashboard tabs:

| Thuật ngữ playbook | Trong code / UI |
|---|---|
| Phễu Marketing | `marketing_funnel`, tab "Phễu Marketing" |
| Lạnh / Ấm / Nóng / Bán | `cold` / `warm` / `hot` / `sell` (DB enum) ; UI dùng tiếng Việt |
| Lead Magnet | `lead_magnet` (DB) ; UI "Sản phẩm Mồi" |
| Tripwire | `tripwire` (DB) ; UI "Sản phẩm Trải nghiệm" |
| Core Offer | `core_offer` (DB) ; UI "Sản phẩm Chính" |
| Downsell | `downsell` (DB) ; UI "Sản phẩm Giữ chân" |
| Continuity | `continuity` (DB) ; UI "Sản phẩm Định kỳ" |
| GAINS | giữ nguyên `gains` |
| SPIN | giữ nguyên `spin` |
| BANT | giữ nguyên `bant` |
| COI | `cost_of_inaction` (DB) ; UI "Chi phí Trì hoãn" |
| FAB | giữ nguyên `fab` |
| PICA | giữ nguyên `pica` |
| 4C Closing | `four_c_closing` |
| L.A.E.C. | `laec_objection` |
| BAN / BÀN / BẠN / BÁN / BÁM | `ban_gift` / `ban_gains_v2` / `ban_friend` / `ban_offer` / `bam_loyalty` |
| Hive Warfare | giữ nguyên (đã là brand) |
| Medicine 3.0 / Healthspan | giữ nguyên |

---

## 12. KẾT LUẬN — Funnel OS đã CHỨA toàn bộ 4 playbook

**Kết luận từ phân tích kín kẽ:**

1. **4 playbook + 1 file prompt dinh dưỡng** map được **100%** vào Funnel OS sau khi bổ sung 15 task gap.
2. Funnel OS thực chất là **phần mềm hóa quy trình đã thực chiến của Droppii** — không phát minh framework mới, chỉ tự động hóa và đóng gói thành sản phẩm phần mềm.
3. **27 bảng D1** + **~30 prompt templates** + **~25 cron jobs** + **~15 framework modules** = đủ infrastructure để vận hành 4 playbook ở quy mô 5k+ lead/tháng.
4. Timeline MVP **mở rộng từ 6 → 8 tuần** để cover hết. CAPEX từ 24,75tr → **~38tr** (cộng thêm content + dev time cho 15 task mới).
5. Sau MVP, Funnel OS sẽ là **tài sản chiến lược dài hạn của Droppii** — bất kỳ leader mới nào cũng có thể vận hành phễu mà không cần nhớ thuộc lòng 4 playbook.

**Câu cốt lõi cho Leader:**

> *"Bạn đã có công thức (4 playbook). Funnel OS biến công thức đó thành cỗ máy tự chạy 24/7 — kể cả khi không ai trực."*

---

**Bước tiếp theo:**

Sau khi Leader review file này và confirm:
- (a) Plan hiện tại đã **không bỏ sót gì** trong 4 playbook,
- (b) Đồng ý mở rộng MVP từ 6 → 8 tuần,
- (c) Approve CAPEX bổ sung ~13tr cho 15 task gap,

→ Tôi sẽ refactor MASTER-PLAN.md và slide deck để cập nhật, và viết tiếp `AI-COACH-L0-SPEC.md` với prompt template thực sự dùng được.
