# EXECUTION PLAN — Hiệu Quả Vững Chắc Ở Từng Bước

> **Mục đích:** Sau khi CEO duyệt PHASE1-OPTIMAL (1,5tr / 4 tuần / organic), đây là **kế hoạch thực thi từng ngày với cổng kiểm tra (gate) đảm bảo hiệu quả ở mọi giai đoạn** — không cho phép "đi qua bước này khi bước trước chưa chắc chắn".
>
> **Triết lý:** *"Đi chậm để đi chắc — mỗi gate là 1 chốt an toàn, không có gate FAIL nào được pass mà không có mitigation."*
>
> **Updated:** 2026-05-29
> **Phụ trách:** CEO (Leader) + CTO (Anh — Auto-CTO Hive Warfare)
> **Phiên bản:** v1 — Execution Plan

---

## 0. TỔNG QUAN — 6 GATE BẢO HIỂM

Demo MVP chia thành **6 stage**, mỗi stage có **1 gate** kiểm tra trước khi sang stage tiếp theo. Nếu gate fail → pivot hoặc dừng, KHÔNG đốt thêm tiền/thời gian.

```
G0       G1            G2            G3              G4              G5             G6
 │        │             │             │               │               │              │
Pre   Foundation   AI Coach     Soft Launch     Wave 1           Wave 2         Demo Day
flight   ready        ready        (10 friends)    (50 contacts)    (CTV team)     PASS/FAIL
Day 0    Day 7        Day 14       Day 17          Day 21           Day 28         Day 28+
```

| Gate | Stage | Đo gì | PASS = | Fail → |
|---|---|---|---|---|
| G0 | Pre-flight | 3 quyết định CEO | Đủ + signed | STOP, không build |
| G1 | Foundation | Tech ready | 4/4 functional | Extend 3 ngày |
| G2 | AI Coach | Tone OK | ≥7/10 session tone OK | Tune prompt, retest |
| G3 | Soft launch | Real user signal | ≥1 paying friend | Pivot persona/pain |
| G4 | Wave 1 | Funnel works | ≥3 đơn từ 50 contacts | Pause Wave 2, post-mortem |
| G5 | Wave 2 | CTV leverage | ≥7 đơn tổng | Scale lower, lessons learn |
| G6 | Demo Day | Decision Phase 2 | 3/5 KPI | Pivot or stop |

→ **Cumulative pass rate kỳ vọng: 70-80%.** Nếu 1 gate fail → có specific mitigation rõ.

---

## STAGE 0 — PRE-FLIGHT (Ngày 0, trước khi start)

### Mục tiêu
Khóa cứng các điều kiện cần thiết — không bắt đầu build nếu thiếu.

### CEO chuẩn bị (3 quyết định + 5 tài liệu)

**3 Quyết định:**
- [ ] **Q1:** Approve CAPEX 1,5tr (Claude 700k + sản phẩm 300k + ship 200k + buffer 300k)
- [ ] **Q2:** Chốt 1 SKU L1 thực tế (đề xuất gói vitamin gia đình ~590k) + STK ngân hàng nhận thanh toán
- [ ] **Q3:** Confirm dành 35-40 giờ ops trong 4 tuần (~1.5h/ngày)

**5 Tài liệu CEO cung cấp:**
- [ ] **D1:** Ảnh sản phẩm L1 (≥3 ảnh, mobile-ready) + mô tả 200 từ + COGS rõ
- [ ] **D2:** STK ngân hàng + tên người nhận + QR code chuyển khoản
- [ ] **D3:** Tone guide Droppii 1 trang (cách xưng hô, từ vựng nên/không nên dùng)
- [ ] **D4:** List 50 contacts ưu tiên — phân thành 3 nhóm: 10 friend/family pilot, 20 khách cũ, 20 CTV tin tưởng
- [ ] **D5:** Disclaimer y tế chuẩn Droppii (compliance TPCN)

### CTO chuẩn bị

- [ ] Cloudflare account verify + D1 + Pages access
- [ ] Anthropic API key + budget cap 1tr
- [ ] GitHub repo `apps/funnel/` private
- [ ] Telegram bot tạo + webhook test

### G0 — GATE PRE-FLIGHT

**Pass criteria (must all 3 + all 5):**
| Item | Trạng thái yêu cầu |
|---|---|
| Q1 approve CAPEX 1,5tr | ✅ Bank transfer/budget commit |
| Q2 SKU + STK | ✅ Có sẵn + ảnh + COGS |
| Q3 confirm 35-40h | ✅ Lịch sạch 4 tuần, không trùng đi công tác |
| D1-D5 đầy đủ | ✅ 5/5 tài liệu |

**Nếu FAIL G0:**
- Q1/Q2/Q3 thiếu → STOP, revisit principle trước
- D1-D5 thiếu → trễ thêm 1-3 ngày để CEO chuẩn bị, KHÔNG start build

→ **Không có gate G0, ngày 1 không bắt đầu.**

---

## STAGE 1 — FOUNDATION (Ngày 1-7)

### Mục tiêu
Tech stack ready để có thể nhận lead đầu tiên.

### CTO tasks (làm trong vòng 5-7 ngày)

| Day | Task | Output |
|---|---|---|
| 1 | Setup repo + Cloudflare Pages + D1 | Hello world deployed |
| 2 | D1 schema 5 bảng + seed | `migrate.sql` chạy thành công |
| 3 | Landing page `/quiz/healthspan-gia-dinh` | Mobile responsive, render OK |
| 4 | Quiz 5 câu DISC + pain | Form submit lưu D1 |
| 5 | Lead capture + Zalo group join confirmation | Full flow lead-in works |
| 6 | Admin dashboard 1 trang | Real-time refresh 5p |
| 7 | Email auto thank-you qua Resend | Email delivered trong 60s |

### CEO tasks (Tuần 1 ~5h)

- [ ] Ngày 1-2: Cung cấp D1-D5 (~2h)
- [ ] Ngày 3-4: Review landing copy + ebook draft AI generate (~2h)
- [ ] Ngày 5-7: Test E2E trên điện thoại cá nhân (~1h)

### G1 — GATE FOUNDATION

**Pass criteria (4/4 functional):**

| # | Test case | PASS = |
|---|---|---|
| 1 | Mở landing trên 3 mobile (iOS, Android, low-end) | Load < 3s, không lỗi render |
| 2 | Hoàn thành quiz 5 câu + submit form | Lead xuất hiện trong D1 + dashboard |
| 3 | Click link Zalo group sau form | Mở Zalo group, join được |
| 4 | Email thank-you gửi trong 60s | Email arrive với ebook attached |

**Nếu FAIL G1:**
- 1/4 fail → fix trong 1-2 ngày, extend Stage 1
- 2/4 fail → revisit tech stack, có thể đổi từ Next.js sang plain HTML
- 3-4/4 fail → STOP, post-mortem trước khi continue

**Gate review:** CTO demo trực tiếp cho CEO ngày 7. CEO tick từng test case.

---

## STAGE 2 — AI COACH READY (Ngày 8-14)

### Mục tiêu
AI Coach chat hoạt động + tone Vietnamese đúng tinh thần Droppii.

### CTO tasks

| Day | Task | Output |
|---|---|---|
| 8 | AI Coach chat UI `/coach/[id]` | UI bubble functional |
| 9 | Claude Haiku integration + SSE streaming | Chat realtime |
| 10 | System prompt v1 (Medicine 3.0 + GAINS rút gọn) | Prompt deployed |
| 11 | Tool `score_session()` AI tự chấm intent 0-100 | Score lưu D1 |
| 12 | Transcript lưu vào `coach_sessions.transcript_json` | Audit log |
| 13 | Guardrail regex chặn từ "trị/chữa/khỏi" | Block + fallback |
| 14 | Telegram bot push handoff khi intent ≥70 | Alert trong 90s |

### CEO tasks (Tuần 2 ~6h)

**Đây là tuần QUAN TRỌNG NHẤT cho QA tone:**

- [ ] Day 11-12: Test 10 session AI Coach (đóng vai khách thật) — **2h**
- [ ] Day 13: Đọc 10 transcript, đánh giá tone từng session (`tone-issues.md`) — **2h**
- [ ] Day 14: Approve prompt v1 hoặc request tune — **1h**
- [ ] Day 14: Approve disclaimer + ToS + privacy policy — **1h**

### G2 — GATE AI COACH (Quan trọng nhất)

**Pass criteria — CEO review 10 sessions:**

| Tiêu chí | Đạt = | Cách đo |
|---|---|---|
| Tone "chị-em thân tình" | ≥ 7/10 sessions | CEO subjective rating |
| KHÔNG hard-sell | 10/10 sessions | Regex auto-check + CEO review |
| GAINS hỏi đủ 3 yếu tố (G/Pain/Need) | ≥ 8/10 sessions | Auto-parse transcript |
| Recommend SKU đúng (chỉ ID trong DB) | 10/10 sessions | Function call validator |
| Disclaimer y tế xuất hiện khi cần | 10/10 sessions | Keyword detection |
| Latency response | ≤ 3s/lượt | Auto-log |

**Nếu FAIL G2 (< 7/10 tone):**
- 7-8/10 sessions OK → Tune prompt + retest 5 sessions trong 2 ngày
- 4-6/10 → Major prompt rewrite + retest 10 sessions, extend 3-5 ngày
- < 4/10 → Pivot persona / pain (có thể persona "phụ nữ 28-40 con nhỏ" không match)

**Quy tắc CEO QA mẫu transcript:**

| Câu hỏi CEO tự hỏi khi đọc transcript | Điểm |
|---|---|
| Câu mở đầu có cá nhân hóa (dùng tên khách)? | 1đ |
| AI hỏi 1 câu/lượt (không bombard)? | 1đ |
| AI paraphrase confirm hiểu khách? | 1đ |
| Tone "chị em thân tình" không quá xã giao? | 1đ |
| Không nhắc tên thuốc/sản phẩm trước lượt 5? | 1đ |
| GAINS qua đủ Goals + Pain + Need? | 1đ |
| Đề xuất SKU phù hợp pain khách nói? | 1đ |
| Có disclaimer "em không phải bác sĩ"? | 1đ |
| Kết thúc có CTA Zalo group/ebook (không hard-sell)? | 1đ |
| Tổng thể "giống chị Droppii thật" không? | 1đ |
| **Tổng** | **/10** |

→ Session pass khi ≥ 7/10. Sessions pass / 10 ≥ 7 = G2 PASS.

---

## STAGE 3 — SOFT LAUNCH (Ngày 15-17)

### Mục tiêu
Validate real-world trên 10 friend/family trước khi push Wave 1.

### CTO tasks

- [ ] Bug fix continuous từ feedback soft launch (~1-2h/ngày standby)
- [ ] Monitor logs + analytics real-time
- [ ] Hot-fix critical issue trong 4h SLA

### CEO tasks (Tuần 3 ngày 15-17 ~3h)

- [ ] **Day 15 sáng:** Gửi link cá nhân cho 10 friend/family — script:
  ```
  "Chào [tên], em vừa build công cụ AI Coach mới cho Droppii — 
  test Healthspan cho gia đình, mất 5 phút. Em muốn nhờ [tên] 
  thử và cho feedback thật. Có thưởng nhẹ nếu hoàn thành 😊"
  ```
- [ ] **Day 15-17:** Theo dõi sát từng người — DM hỏi sau khi họ hoàn thành
- [ ] **Day 17:** Mời 2-3 người chia sẻ cảm nhận trực tiếp (call 10 phút)

### G3 — GATE SOFT LAUNCH

**Pass criteria:**

| # | Tiêu chí | Đạt = |
|---|---|---|
| 1 | ≥ 7/10 friend hoàn thành quiz | Quiz completion OK |
| 2 | ≥ 5/10 hoàn thành AI Coach session (≥5 phút) | Funnel reach session |
| 3 | ≥ 1 friend mua L1 thực sự (không nể) | Real buying signal |
| 4 | 0/10 phản hồi tiêu cực nghiêm trọng (cảm thấy bị manipulate) | Tone OK |
| 5 | ≥ 3/10 phản hồi "interesting, em sẽ thử với người khác" | Word-of-mouth signal |

**Nếu FAIL G3:**
- Fail 1-2 tiêu chí nhẹ → Sửa friction point cụ thể (vd quiz quá dài), retest 5 friend nữa
- Fail 3 (không có ai mua) → KHÔNG push Wave 1, revisit:
  - Persona "phụ nữ 28-40 con nhỏ" có đúng không?
  - Sản phẩm L1 590k có đắt cho thị trường mục tiêu?
  - AI Coach có thực sự thuyết phục?
- Fail 4 (tiêu cực) → URGENT pivot tone, có thể là vấn đề nghiêm trọng

**Lưu ý quan trọng:** Friend/family có thể mua **vì nể**, không phải vì model hoạt động. Để tránh bias:
- Khi gửi script, nhấn mạnh: "Cho feedback thật, đừng mua vì nể em"
- Track "mua sau bao lâu" — nếu mua < 5 phút coach session → nghi vấn nể
- Hỏi explicit: "Em mua vì [tên product] hay vì em [Leader]?" — chấp nhận data thật

---

## STAGE 4 — WAVE 1 (Ngày 18-21)

### Mục tiêu
Activate 50 contacts ưu tiên (CTV + khách cũ + bạn bè rộng). Tạo 30-50 lead real.

### CEO tasks (Tuần 3 Day 18-21 ~10h tổng)

#### Day 18 — Mass outreach (~3h)

**Sáng (1.5h):**
- [ ] Đăng story Zalo cá nhân về quiz Healthspan
- [ ] Post Zalo group Droppii có sẵn
- [ ] Post Facebook cá nhân (organic, không boost)

**Chiều (1.5h):**
- [ ] Gửi tin nhắn riêng cho 20 CTV (template trong CTV-OUTREACH-TEMPLATE.md)
- [ ] Gửi tin nhắn cho 20 khách cũ trong list

#### Day 19 — Mid-wave checkpoint (~2h)

**Quan trọng:** Đây là **MID-WAVE GATE INTERNAL** — không pass thì pause Wave 1.

Đo sau 24h từ ngày 18:
| Mid-metric | Threshold để continue |
|---|---|
| Số lead intake | ≥ 10 leads trong 24h |
| Quiz completion rate | ≥ 30% |
| Session start rate | ≥ 50% từ lead |

Nếu thấp hơn → CEO + CTO emergency call 30p:
- Diagnose: persona sai? quiz quá dài? share content tệ?
- Quyết: pause hay tiếp tục với fix

#### Day 20-21 — Handoff handling (~5h)

- [ ] Trực Telegram 8h-22h
- [ ] Mỗi alert intent ≥70 reply Zalo trong 2h SLA
- [ ] Confirm chuyển khoản trên dashboard

### CTO tasks

- [ ] Daily morning digest qua Telegram cho CEO (~10p tự động)
- [ ] Standby fix bug ~1-2h/ngày
- [ ] Real-time monitor leading indicators

### G4 — GATE WAVE 1 (Day 21)

**Pass criteria:**

| # | KPI | Target | Stretch |
|---|---|---|---|
| 1 | Tổng leads | ≥ 30 | ≥ 50 |
| 2 | Quiz completion rate | ≥ 35% | ≥ 50% |
| 3 | Session completion rate | ≥ 40% | ≥ 60% |
| 4 | Handoff intent ≥70 | ≥ 8 | ≥ 15 |
| 5 | **Đơn L1 confirmed** | **≥ 3** | ≥ 5 |
| 6 | Cash net Stage 4 | ≥ 0 (break-even) | +500k |

**Pass = đạt ≥ 4/6 KPI, BẮT BUỘC đạt KPI #5 (đơn L1 ≥ 3).**

**Nếu FAIL G4:**
- Pass 4-5/6 nhưng đơn ≥ 3 → Continue Wave 2 với optimization
- Pass < 4/6 hoặc đơn < 3 → **KHÔNG push Wave 2** + post-mortem 1 ngày
  - Tune AI prompt
  - A/B test 2 quiz variant
  - Đổi sản phẩm L1 nếu giá là vấn đề

**Quy tắc cấm:** KHÔNG được activate Wave 2 (CTV team push) nếu G4 fail — vì sẽ "đốt" trust của CTV cho 1 funnel chưa hoàn thiện.

---

## STAGE 5 — WAVE 2 (Ngày 22-28)

### Mục tiêu
Activate CTV team (20-50 CTV) cho mass organic push. Bring 50-100 lead bổ sung.

### CEO tasks (~15h)

#### Day 22 — CTV team kickoff (~3h)

- [ ] **Zoom call 30p với 20-50 CTV** (or Zalo group voice):
  - Show kết quả Wave 1 (live dashboard)
  - Pitch incentive program (xem section CTV Incentive trong PHASE1-OPTIMAL.md)
  - Demo cách share landing page
  - Q&A
- [ ] **Setup leaderboard public** cho CTV pilot
- [ ] **Gửi kit:** landing link + 3 message template CTV share + 5 visual Canva

#### Day 23-28 — Daily ops (~2h/ngày)

- [ ] Trực Telegram + reply handoff
- [ ] Daily leaderboard update + động viên CTV top
- [ ] Confirm orders + ship coordination
- [ ] Daily 15p sync với CTO

### CTO tasks

- [ ] CTV leaderboard auto-generate trong dashboard
- [ ] Unique tracking link mỗi CTV để attribution
- [ ] Standby fix bug

### Mid-Wave 2 checkpoint (Day 25)

| Metric | Threshold |
|---|---|
| Số CTV active push (≥1 share) | ≥ 50% (10/20) |
| Leads từ CTV channel | ≥ 20 |
| Conversion Wave 2 vs Wave 1 | Không kém hơn 30% |

Nếu CTV không engage → CEO 1-1 với CTV không active, ask why.

### G5 — GATE WAVE 2 + DEMO PASS (Day 28)

**Pass criteria DEMO PASS = 3/5 KPI:**

| # | KPI | Target |
|---|---|---|
| 1 | Tổng leads (cumulative Wave 1 + 2) | ≥ 100 |
| 2 | Total AI Coach sessions completed | ≥ 50 |
| 3 | **Đơn L1 confirmed** | **≥ 7** |
| 4 | Cash net Phase 1 | ≥ 0 (break-even) |
| 5 | CEO confirm tone "khai vấn" đúng sau đọc 10 transcript random | Subjective ≥ 7/10 |

**Pass = 3/5 KPI** (must include #3 ≥ 7 đơn HOẶC #5 tone OK với ≥ 5 đơn).

**Stretch goals (good signal cho Phase 2):**
- ≥ 12 đơn → strong PASS, scale ngay
- ≥ 30% CTV active → CTV network model validate
- ≥ 1 referral từ Wave 1 buyer → word-of-mouth bonus

---

## STAGE 6 — DEMO DAY + PHASE 2 DECISION (Day 28+)

### Demo Day với Leader/Mentor Droppii

Format 60 phút:
- 10p: Show dashboard live (real-time data, không slide)
- 10p: Đọc 3 transcript thật (anonymized)
- 5p: Show 1 testimonial video customer thật (nếu được consent)
- 10p: Financial summary (cash in/out, ROI projection)
- 10p: Lessons learned + risks
- 10p: Phase 2 ask (CAPEX + cofounder agreement)
- 5p: Q&A

### G6 — FINAL DECISION GATE

| Outcome | Trigger | Next step |
|---|---|---|
| **STRONG PASS** | ≥ 12 đơn, ≥ 5 KPI | Phase 2 immediate, scale 200 leads/tháng |
| **BASE PASS** | 7-11 đơn, 3-4 KPI | Phase 2 với optimization, scale 100-150/tháng |
| **CONDITIONAL PASS** | 5-6 đơn, persona/pain validated nhưng economics chưa | Mini Wave 3 (1-2tr) với fix specific |
| **FAIL** | < 5 đơn, KPI #5 fail | Post-mortem, possible pivot persona/pain hoặc stop |

---

## ASSURANCE CONTINUOUS — Cơ chế đảm bảo realtime

### A1. Daily Telegram digest cho CEO (auto, mỗi 7h sáng)

Format:
```
📊 Funnel OS Daily — Day [N]/28
─────────────────
Leads hôm qua: 12 (+15% vs avg)
Sessions hôm qua: 7 / 12 (58%)
Đơn hôm qua: 1
Handoff intent ≥70: 2

🚦 Health: GREEN
📈 Cumulative: 45 leads / 22 sessions / 4 đơn

Action cần CEO:
- 2 handoff đang chờ reply (intent 85, 72)
- 1 transcript flagged để CEO review

[Mở dashboard →]
```

### A2. Auto-alert critical events

| Trigger | Alert level | Action |
|---|---|---|
| Intent ≥85 | 🔴 Urgent | Ping CEO ngay |
| 24h không có lead | 🟡 Warning | Sync CEO + CTO |
| Quiz completion < 25% trong 48h | 🟡 Warning | Audit quiz |
| AI Coach error rate > 5% | 🔴 Urgent | CTO fix |
| Cloudflare bill > 1tr | 🔴 Urgent | Investigate spike |

### A3. Weekly review (mỗi Chủ Nhật 30 phút)

CEO + CTO sync:
- 10p: Numbers review + comparison vs target
- 10p: Quality issues (transcript flagged, customer complaints)
- 10p: Decisions next week (pause/scale/pivot)

CTO chuẩn bị data + 3 recommendations, CEO chọn 1.

### A4. Random transcript QA (CEO mỗi 2-3 ngày)

CEO đọc 2-3 transcript ngẫu nhiên → ghi vào `tone-issues.md` nếu có vấn đề. Cuối tuần CTO update prompt theo feedback.

### A5. Customer voice channel

- Zalo group "Healthspan Gia đình Droppii" — CEO monitor 1 lần/ngày
- Negative feedback escalate trong 1h
- Positive testimonial save vào `case-studies.md`

---

## EMERGENCY PROTOCOLS

### E1. Nếu khách phàn nàn nghiêm trọng (defamation risk)

**Action trong 1h:**
1. CEO contact khách trực tiếp Zalo
2. Refund 100% + xin lỗi
3. CTO pull session log để audit
4. Daily standup add agenda

### E2. Nếu FB/Zalo ban tài khoản

**Action trong 4h:**
1. Pause tất cả ads/posts
2. CTO backup landing → standalone domain
3. CEO contact platform support
4. Continue qua kênh khác (email, Zalo cá nhân)

### E3. Nếu Claude API down > 30 phút

**Action:**
1. Auto-failover sang OpenAI GPT-4 mini (CTO setup backup key trước)
2. Show notice "Coach Linh đang offline, em sẽ phản hồi qua Zalo"
3. Forward all incoming chat to CEO Zalo

### E4. Nếu CEO bị bệnh / nghỉ giữa Wave

**Action trong 24h:**
1. Activate backup CTV (1-2 người đã chuẩn bị từ Tuần 2)
2. Pause Wave promotion
3. AI Coach vẫn chạy bình thường (24/7 không ảnh hưởng)
4. Re-start Wave khi CEO trở lại

---

## TIMELINE BIG PICTURE

```
Week 1 (Day 1-7):   Foundation              → G1 ✓
Week 2 (Day 8-14):  AI Coach + QA           → G2 ✓
Week 3a (Day 15-17): Soft launch 10 friends → G3 ✓
Week 3b (Day 18-21): Wave 1 (50 contacts)   → G4 ✓
Week 4 (Day 22-28): Wave 2 (CTV team)       → G5 ✓
Day 28+:            Demo Day                → G6 → Phase 2
```

→ **6 gate, 6 cơ hội để pivot/stop với cash risk ≤ 1,5tr.**

---

## EXPECTED OUTCOMES TỪNG STAGE

| Stage | Cumulative leads | Cumulative đơn | Cash spent | Cash in | Net cash |
|---|---|---|---|---|---|
| End G0 | 0 | 0 | 0 | 0 | 0 |
| End G1 | 0 | 0 | ~300k (Claude test) | 0 | -300k |
| End G2 | 0 | 0 | ~500k | 0 | -500k |
| End G3 | 10 friend | 1-2 | ~700k | ~590k-1.180k | -100k đến +480k |
| End G4 | 30-50 | 3-5 | ~1tr | 1.770-2.950k | +770k đến +1.950k |
| End G5 | 100-150 | 7-12 | ~1,5tr | 4.130-7.080k | +2.630k đến +5.580k |

→ **Cash flow dương từ G4** (cuối tuần 3) — nghĩa là sau 3 tuần CEO đã thấy tiền vào nhiều hơn ra.

---

## KẾT LUẬN — Cam kết hiệu quả vững chắc

3 cơ chế bảo hiểm hiệu quả ở mỗi bước:

**1. Validation Gate trước khi pass stage** — không có G(N) nào pass mà KPI rõ ràng fail. CEO + CTO cùng review.

**2. Mid-stage checkpoint** — Stage 4 có ngày 19 mid-wave; Stage 5 có ngày 25 mid-wave. Pause nếu signal yếu, không đợi hết stage.

**3. Continuous assurance** — daily digest, auto-alerts, weekly sync, random QA — không có 24h nào CEO không thấy data.

→ **CEO chỉ cần 1.5h/ngày + 6 gate review** = tổng 35-40 giờ trong 4 tuần.

→ **CTO chỉ commit code sau khi G0 pass** = không waste effort.

→ **Cash risk tối đa 1,5tr** = bằng giá 1 bữa ăn cao cấp.

→ **Cash positive từ Stage 4** = không lỗ trong 75% kịch bản.

→ **Decision rõ ràng ngày 28** = không kéo dài unstable.

---

## NEXT STEP — Bắt đầu Day 0 ngay khi CEO confirm

CEO gửi 1 tin nhắn xác nhận đầy đủ:
```
✓ Q1 — Approve CAPEX 1,5tr
✓ Q2 — SKU [tên] giá 590k + STK [...]
✓ Q3 — Có 35-40h trong 4 tuần [date range]
✓ D1-D5 sẽ gửi trong 24h
```

→ CTO bắt đầu Day 1 ngay sáng hôm sau, gửi Telegram update đầu tiên cuối Day 1.

---

**Phiên bản:** v1 Execution Plan with Gates
**Phụ trách:** CEO (Leader) + CTO (Anh — Auto-CTO Hive Warfare)
**Sẵn sàng bắt đầu trong:** 24 giờ sau confirm
