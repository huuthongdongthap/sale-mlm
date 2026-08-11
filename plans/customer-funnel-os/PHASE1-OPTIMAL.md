# PHASE 1 OPTIMAL — Lời Giải Chi Phí Thấp Nhất

> **Bài toán:** Leader + CTO tự làm hết. Giảm CAPEX xuống mức **TỐI THIỂU TUYỆT ĐỐI** để chứng minh App xứng đáng đầu tư Phase 2 — không phí 1 đồng nào không cần thiết.
>
> **Lời giải đề xuất:** **~1-1,5 triệu VND** (giảm 70% so với LEAN 5M, giảm 96% so với plan full 38tr).
>
> **Kết quả kỳ vọng:** 4-8 đơn L1 trong 4 tuần, **cash-positive** ngay Phase 1.
>
> **Updated:** 2026-05-29
> **Phụ trách:** Cố vấn + CTO (Auto-CTO Hive Warfare)
> **Phiên bản:** v3 — Optimal Zero-Ad (supersedes LEAN-5M)

---

## 0. INSIGHT CHÍNH — Tại sao có thể giảm xuống 1-1,5tr

Phần lớn chi phí trong các plan trước là **FB Ads (3-5tr) để mua traffic cold**. Nhưng **Leader Droppii đã có sẵn tài sản traffic** mà không phải mua:

| Tài sản traffic của Leader | Ước tính reach |
|---|---|
| Zalo cá nhân của Leader (danh bạ + group) | 500-2.000 contacts |
| Zalo group "Droppii [team]" Leader đang quản lý | 100-500 members active |
| Network CTV team (20-50 CTV × 200-500 contacts mỗi người) | 4.000-25.000 reach gián tiếp |
| Facebook cá nhân + Fanpage Droppii | 1.000-5.000 followers |
| Email list khách cũ Droppii | 100-2.000 emails |
| Bạn bè + người thân ủng hộ | 50-100 first wave testers |
| **Tổng warm traffic potential** | **~5.000-30.000 unique reach** |

→ Mục tiêu Phase 1 chỉ cần **100-150 lead** để có 4-8 đơn → **chỉ cần activate <5% mạng lưới đã có**.

**Kết luận:** với mục tiêu chứng minh hypothesis, **FB Ads là OVER-KILL ở Phase 1**. Phase 1 dùng organic, Phase 2 mới add ads.

---

## 1. SO SÁNH 3 TIER BUDGET — Chọn cái nào?

| Tier | Budget | Traffic source | Lead potential | Chứng minh được gì? |
|---|---|---|---|---|
| **T1. ULTRA LEAN** ⭐ | **~1,5tr** | 100% organic (Leader network + CTV team) | 100-150 warm leads | "AI Coach + funnel converts Droppii's warm audience" |
| **T2. ORGANIC + MINI ADS** | ~3tr | Organic + 1,5tr ads test | 150-250 leads (mix warm + cold) | T1 + "Cold ads cũng convert được" |
| **T3. LEAN 5M (v2)** | ~5tr | Organic + 3tr ads | 200-350 leads | T2 + statistical significance |
| Plan đầu (LEAN) | ~16tr | Heavy ads | 50+ cold leads | Cold ads economics |
| Plan full | ~38tr | Multi-channel paid | 500+ leads | Scale validated |

### ⭐ Khuyến nghị: TIER 1 — ULTRA LEAN (~1,5tr)

**Lý do:**
1. **Đủ để chứng minh hypothesis** — nếu AI Coach convert được warm audience của Leader → mô hình hoạt động
2. **Risk cash $0** — ngay cả Demo FAIL, chỉ tốn 1,5tr (1 bữa ăn nhà hàng cao cấp)
3. **Cash-positive khả thi** — 4-8 đơn × 590k = 2,5-5tr doanh thu > 1,5tr cost
4. **Pivot dễ** — nếu nhận signal sai, đổi nhanh không tốn nhiều
5. **Phase 2 logic rõ** — nếu T1 PASS, T2/T3 chỉ là scale traffic, không phải rebuild

---

## 2. PHÂN BỔ 1,5TR — Chi tiết từng đồng

| Hạng mục | Số tiền | Bắt buộc/optional |
|---|---|---|
| **Claude API (Haiku)** cho 100-150 session | 700.000 | 🔴 Bắt buộc |
| **Sản phẩm L1 prototype** (in nhãn, ship hậu cần thử) | 300.000 | 🟡 Nếu chưa có sẵn |
| **Buffer Claude overage** (nếu chuyển sang Sonnet 1 vài session khó) | 200.000 | 🟡 |
| **Phí giao hàng pilot** (5-10 đơn đầu cọc J&T/GHN) | 200.000 | 🟡 |
| **Misc** (nếu phát sinh — print QR code, banner Zalo group) | 100.000 | 🟢 |
| **TỔNG** | **~1.500.000** | |

**Free 100% (sử dụng free tier):**
- Cloudflare Pages + D1 + R2 + Workers + KV
- Vercel (backup)
- Resend (3.000 email/tháng)
- Cloudinary (25GB)
- Telegram bot
- Canva free (1.000+ templates đủ dùng)
- GitHub private repo
- Plausible self-hosted on CF Worker
- Domain `*.pages.dev` (free, đủ cho demo)
- Zalo group Leader đã có
- AI generate content trực tiếp qua Claude API (không cần Claude Pro)

→ **Cash thực sự bỏ ra: 1-1,5tr — bằng giá 1 tài khoản Claude Pro / 1 buổi tea-with-friend.**

---

## 3. NGUỒN TRAFFIC ORGANIC — 5 KÊNH KHÔNG TỐN TIỀN

### Kênh A — Zalo cá nhân Leader (HIGHEST TRUST)

**Cách triển khai:**
- Leader đăng story Zalo về "Bài test Healthspan cho gia đình mình — em mới thử, share cho mọi người" (kiểu personal, không bán hàng)
- Reach: 100-500 người trong danh bạ
- Conversion to click: 8-15% (vì personal story)
- Estimated leads: 10-50

**Lý do hiệu quả:** trust baseline cao, người Việt thường click khi bạn thân share.

### Kênh B — Zalo group Droppii có sẵn

**Cách triển khai:**
- Đăng trong group: *"Em vừa thử công cụ AI Coach mới Droppii làm — test Healthspan cho cả gia đình mất 5 phút, kết quả khá thú vị. Mọi người thử rồi share kết quả nhé."*
- Reach: 100-500 members
- Click rate: 10-20% (active members)
- Estimated leads: 20-80

**Lý do hiệu quả:** members đã tin Droppii brand, chỉ cần 1 lý do click.

### Kênh C — CTV team referral push (BIGGEST LEVER)

**Cách triển khai:**
- Leader gửi tin riêng cho 20-50 CTV trong team:
  ```
  "Chị em, Droppii vừa làm AI Coach mới giúp chị em có lead warm 
  thay vì cold call. Mỗi CTV thử share landing này cho 5-10 người 
  thân quen, em sẽ tặng commission đặc biệt cho 5 đơn đầu tiên 
  mỗi CTV bring về."
  ```
- Reach gián tiếp: 20 CTV × 200 contacts = 4.000 reach potential
- Conversion to click: 3-5% (personal CTV share)
- Estimated leads: 50-200

**Incentive cho CTV: 30-50% hoa hồng** mỗi đơn họ refer → đúng mô hình MLM Droppii, không phải tiền thật ra túi Leader.

### Kênh D — Facebook cá nhân Leader

**Cách triển khai:**
- Post organic về Medicine 3.0 + ebook free
- Reach: 500-2.000 followers (depend Leader's FB)
- Conversion: 1-3%
- Estimated leads: 5-30

### Kênh E — Email khách cũ Droppii

**Cách triển khai:**
- Email blast 1 lần đến list khách cũ
- *"Chào chị, Droppii vừa làm Healthspan AI Coach — gửi tặng chị bản test miễn phí, kèm ebook 21 ngày sống xanh cho gia đình..."*
- Open rate: 20-30% (khách cũ trust cao)
- Click rate: 5-10%
- Estimated leads: depend list size, có thể 10-100

**Tổng kỳ vọng từ 5 kênh organic: 100-450 lead** — quá đủ cho mục tiêu 100-150 Phase 1.

---

## 4. MATH: KINH TẾ PHASE 1 ULTRA LEAN

### Kịch bản BASE — 100 leads organic

```
100 leads (organic, $0 cost)
  ↓ 50% session complete (warm baseline cao hơn cold ads)
50 AI Coach sessions
  ↓ 25% intent ≥70 → handoff
12 handoff
  ↓ 40% Leader close (warm-warm + brand trust)
~5 đơn L1
```

| Metric | Số |
|---|---|
| Revenue: 5 × 590k | **2.950.000** |
| COGS sản phẩm (40%): | 1.180.000 |
| Cash cost (Claude+misc): | 1.500.000 |
| **Net cash flow** | **+270.000** |

→ **CASH POSITIVE NGAY Ở PHASE 1**, dù chỉ ở BASE case.

### Kịch bản REALISTIC — 150 leads organic + 6 đơn

| Metric | Số |
|---|---|
| Revenue: 8 × 590k | 4.720.000 |
| COGS sản phẩm | 1.888.000 |
| Cash cost | 1.500.000 |
| **Net cash flow** | **+1.332.000** |

### Kịch bản OPTIMISTIC — CTV network active mạnh, 250 leads

| Metric | Số |
|---|---|
| Revenue: 12 × 590k | 7.080.000 |
| COGS sản phẩm | 2.832.000 |
| Cash cost | 1.500.000 |
| **Net cash flow** | **+2.748.000** |

→ **Risk-adjusted Expected Cash Flow Phase 1: +800k đến +2,7tr** — KHÔNG LỖ.

### So với LEAN 5M (v2) có ads

| | T1 ORGANIC (v3) | T3 LEAN+ADS (v2) |
|---|---|---|
| Cash bỏ ra | 1,5tr | 5tr |
| Revenue kỳ vọng | 3-7tr (5-12 đơn) | 3-9tr (5-15 đơn) |
| **Net cash** | **+0 đến +3tr** | **-2tr đến +4tr** |
| Validation strength | "Warm audience converts" | "Warm + cold audience converts" |
| Risk | 🟢 Thấp | 🟡 Trung |

→ **T1 Net Cash dương cao hơn**, validation hơi yếu hơn (không test cold) → **trade-off đáng làm Phase 1**.

---

## 5. TRADE-OFF: T1 vs T3 — Hi sinh gì?

| Tiêu chí | T1 ULTRA LEAN | T3 LEAN+ADS |
|---|---|---|
| Chứng minh AI Coach hoạt động | ✅ | ✅ |
| Chứng minh funnel logic đúng | ✅ | ✅ |
| Chứng minh giá L1 đúng | ✅ | ✅ |
| Chứng minh tone Medicine 3.0 resonate | ✅ | ✅ |
| Chứng minh có thể scale qua ads (cold) | ❌ | ✅ |
| Chứng minh CAC < 250k khả thi | ❌ | ⚠️ |

→ **T1 mất 2 validation về ads economics**. Nhưng cả 2 không cần thiết để **quyết định Phase 2 có đáng đầu tư hay không** — chỉ cần biết model converts, ads economics có thể test riêng ở Phase 2 với 5-10tr nhỏ.

---

## 6. PLAYBOOK LEADER — Làm gì trong 4 tuần?

### Tuần 1 — CTO build, Leader chuẩn bị mạng lưới (5h Leader)

**CTO work** (không cần Leader):
- Setup Cloudflare D1 + landing page + Quiz
- AI generate ebook + ad creative + landing copy
- AI Coach prompt v1

**Leader work:**
- [ ] **2h:** Cung cấp 1 SKU L1 + ảnh + giá + STK ngân hàng + tone guide
- [ ] **1h:** Lập list 50 contacts ưu tiên (CTV pilot, bạn thân, khách cũ tin tưởng)
- [ ] **1h:** Soạn 3 message template cá nhân hóa cho 3 nhóm: CTV, bạn bè, khách cũ
- [ ] **1h:** Setup Telegram bot + nhóm Zalo riêng cho pilot tracking

### Tuần 2 — CTO finish, Leader review + soft test (5h)

**CTO work:**
- AI Coach chat hoàn thành + intent scoring
- Dashboard 1 trang
- Email nurture sequence
- Smoke test E2E

**Leader work:**
- [ ] **2h:** Test 10 session AI Coach (đóng vai khách thật) — confirm tone
- [ ] **1h:** Review ebook + landing + email copy
- [ ] **1h:** Approve disclaimer + ToS
- [ ] **1h:** Mời 5 friend/family test full flow

### Tuần 3 — Activate Wave 1 (20-30 leads từ 50 contacts ưu tiên) (~10h)

Đây là tuần Leader phải **active push** organic:

- [ ] **Ngày 1-2:** Đăng story Zalo cá nhân + post Zalo group + Facebook (~30p)
- [ ] **Ngày 3-5:** Gửi tin riêng cho 50 CTV/bạn bè ưu tiên (~3h tổng, split 30/ngày)
- [ ] **Ngày 4-7:** Reply mọi câu hỏi từ pilot tester (~5h tuần)
- [ ] **Ngày 7:** Email blast khách cũ Droppii (1 lần)
- [ ] **Daily 30p:** Check dashboard + handoff intent ≥70

**Kỳ vọng cuối tuần 3:** 40-70 leads, 20-30 sessions, 5-10 handoff, 2-3 đơn đầu.

### Tuần 4 — Activate Wave 2 + push CTV team (~15h)

- [ ] **Ngày 1:** Gọi/họp 30 phút với 20-50 CTV team — pitch program + incentive
- [ ] **Ngày 2-7:** Daily handoff handling (~2h/ngày)
- [ ] **Ngày 5:** Mid-week review với CTO → tinh chỉnh
- [ ] **Ngày 7:** Demo Day report ra cho team Droppii Leader/Mentor

**Kỳ vọng cuối tuần 4:** Tổng 100-200 leads, 50-100 sessions, 15-25 handoff, **5-12 đơn**.

**Tổng Leader time 4 tuần: ~35-40h** = **~1.5h/ngày trung bình**.

---

## 7. CTV INCENTIVE — Cách kéo CTV team join organic push

Để CTV team active push mà không tốn cash, dùng mô hình **performance-based commission**:

| Mức | Yêu cầu CTV | Reward |
|---|---|---|
| Tier 1 — Bronze | Share landing đến ≥5 contacts | Tên trên leaderboard công khai |
| Tier 2 — Silver | Bring 1 đơn confirmed | 50% hoa hồng tiêu chuẩn × 1.5 (bonus pilot) |
| Tier 3 — Gold | Bring 3 đơn | 50% hoa hồng × 2.0 + lifetime LTV share 5% |
| Tier 4 — Platinum | Bring 5+ đơn + 1 đơn upsell L2 | Cofounder track — invited vào Phase 2 leadership |

→ **Tiền hoa hồng đến TỪ đơn hàng** — Leader không phải bỏ tiền cứng trước.

→ **Đây cũng là sandbox test cho Phase 2** — CTV nào active = ứng cử viên Manager pilot.

---

## 8. CÁI LEADER PHẢI CHUẨN BỊ TRƯỚC TUẦN 1

| Item | Cần có | Lý do |
|---|---|---|
| 1 SKU L1 + ảnh + mô tả + giá + COGS | Tuần 1 ngày 1 | Build product page |
| STK ngân hàng nhận thanh toán | Tuần 1 ngày 1 | Manual checkout |
| Tài khoản FB Business + Pixel (optional, cho Phase 2) | Tuần 1 ngày 3 | Future ads |
| List 50 contacts ưu tiên + phân nhóm | Tuần 1 ngày 2 | Wave 1 outreach |
| Tone guide Droppii 1 trang | Tuần 1 ngày 2 | AI prompt overlay |
| Zalo cá nhân + Zalo group có sẵn | Tuần 1 ngày 1 | Traffic channel |
| Telegram username | Tuần 2 ngày 1 | Handoff alerts |
| Hoa hồng CTV pilot policy | Tuần 2 ngày 7 | Trước Wave 2 |
| 5-10 friend/family pilot tester | Tuần 3 ngày 1 | Soft launch |

---

## 9. NẾU CÂN NHẮC TIER 2 (THÊM 1,5TR ADS)

Tier 2 = T1 + **1,5tr FB Ads test sau Wave 1**.

**Khi nào nên chọn T2:**
- Tuần 3 organic Wave 1 đạt > 50 leads VÀ conversion > 5% → có signal mạnh → đáng thử cold ads
- Hoặc Leader muốn validate cold ads economics trước Phase 2

**Khi không nên T2:**
- Tuần 3 organic chậm hoặc conversion thấp → cần tune AI/funnel trước, không phải thêm traffic
- Cash flow Phase 1 đang căng

→ **Quy tắc:** Chỉ kích hoạt T2 sau ngày 14 nếu Wave 1 vượt threshold.

---

## 10. RISK MITIGATION — Mọi rủi ro của LEAN-5M vẫn áp dụng

Áp dụng nguyên xi top 10 rủi ro từ STRESS-TEST-100Q section "Tổng kết" + **mitigation v3 cụ thể:**

| Rủi ro | Mitigation v3 (cho organic) |
|---|---|
| AI Coach Vietnamese tone chưa test | Soft launch 10 friend/family WEEK 2 trước Wave 1 |
| FB Ads bị reject health claims | **N/A** ở T1 — chỉ organic, không có FB ads |
| Conversion H4 thấp | Wave 1 organic warm baseline cao → H4 8-15% khả thi |
| Leader busy → handoff lag | CTV pilot tier 2-4 đóng vai backup handler |
| TPCN compliance | Vẫn cần legal review ebook + landing copy |
| Sample size benchmark nhỏ | Phase 1 organic = generate own data Droppii-specific |
| Manual checkout drop-off | Leader call/Zalo trong 30p sau khách click "Mua" |
| Quiz fatigue | Niche-specific Medicine 3.0 framing |
| MLM scandal nghi ngờ | T1 KHÔNG đụng đến recruitment |
| Claude API price | Fixed-rate 6 tháng từ Anthropic, dự trù 700k đủ |

---

## 11. EXPECTED VALUE T1 vs T2 vs T3

| Tier | Cash bỏ | Revenue kỳ vọng (50% PASS) | Net cash EV | Validation value | EV ratio |
|---|---|---|---|---|---|
| **T1 ULTRA** ⭐ | 1,5tr | 3-5tr | **+1-2,5tr** | "Model works trên warm" | **~3-4× cash** |
| T2 ORGANIC+MINI ADS | 3tr | 4-7tr | +1-3tr | "+ cold validation" | ~2× |
| T3 LEAN+ADS (v2) | 5tr | 5-9tr | 0 to +3tr | "+ statistical signif" | ~1.5× |

→ **T1 có EV ratio cao nhất** (return / cash spent). Đây là **strictly optimal** choice cho Phase 1.

→ T3 chỉ tốt hơn nếu mục tiêu Phase 1 = full validation cho VC pitch (lúc đó cần statistical signif). Nếu mục tiêu Phase 1 = CEO + CTO quyết Phase 2, T1 đủ.

---

## 12. QUYẾT ĐỊNH 3 ĐIỀU — CEO chốt nhanh

Vì T1 chi phí cực thấp + risk cực thấp, CEO chỉ cần chốt **3 điều** thay vì 4:

1. **Approve CAPEX 1,5tr** (1tr Claude + 500k buffer/misc)?
2. **Chốt 1 SKU L1** (đề xuất ~590k) + STK ngân hàng?
3. **Confirm có thể dành 35-40 giờ ops trong 4 tuần** (~1.5h/ngày)?

Nếu cả 3 OK → CTO bắt đầu Tuần 1 trong 24h.

**KHÔNG cần chốt equity ngay** — vì cash risk quá thấp (1,5tr ≈ 1 bữa ăn), cofounder agreement có thể ký sau Demo PASS khi cả 2 đã thấy data thật.

---

## 13. CON ĐƯỜNG TỐI ƯU (Decision Tree)

```
                  CEO approve 1,5tr + 35h time?
                  /                       \
                YES                      NO
                 │                       │
                 ▼                       ▼
         Tuần 1-2 build              [STOP] hoặc revisit
                 │
                 ▼
         Tuần 2 soft test 10 friend
                 │
        ┌────────┴────────┐
       Tone OK?         Tone tệ?
        │                 │
        ▼                 ▼
    Tuần 3 Wave 1      Tune prompt
    (50 contacts)      1 tuần thêm
        │
        ▼
    Day 21 review
    /            \
  Signal mạnh   Signal yếu
    │              │
    ▼              ▼
  Tuần 4 Wave 2  Pivot persona
  + CTV team     hoặc pain point
    │              │
    ▼              ▼
  Day 28 Demo    Day 28 lessons learned
  PASS/FAIL      → quyết Phase 2 dứt khoát
```

Mọi nhánh đều **dẫn đến quyết định Phase 2 rõ ràng trong ≤ 28 ngày, với cash risk ≤ 1,5tr**.

---

> **Tóm 1 câu cuối:**
>
> *"Phase 1 không cần ads. Leader có sẵn 5.000-30.000 warm reach trong network — chỉ cần activate <5% là đủ chứng minh model. CTO làm code free, Claude API 700k, sản phẩm L1 thực tế = tổng 1,5tr. Cash-positive ngay Phase 1. Đây là lời giải tối ưu tuyệt đối."*

**Phiên bản:** v3 Optimal Zero-Ad — đợi CEO chốt 3 quyết định.
**Phụ trách:** CEO (Leader) + CTO (Anh — Auto-CTO Hive Warfare).
