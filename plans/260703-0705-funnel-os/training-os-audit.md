# Training OS (Academy) — Feasibility Audit & Gap Analysis
> **Ngày audit:** 2026-07-06 | **Scope:** Toàn bộ Training OS — từ content, delivery, tracking đến monetization

---

## EXECUTIVE VERDICT

> **TRAINING OS HIỆN TẠI = INFRASTRUCTURE FRAMEWORK KHÔNG CÓ CONTENT + KHÔNG CÓ UI.**
> Có đầy đủ data models, state machines, APIs. Nhưng **không thể đào tạo được 1 CTV từ đầu đến cuối** vì thiếu chính nội dung đào tạo.

```javascript
// Có thể chạy:         ✅ onboardingBot.startOnboarding() works
// Có thể track:        ✅ habit scores, KPI, progress%
// Có content để học:   ❌ NO. JSON files = metadata only, no daily lessons
// Có UI để học:        ❌ NO. Training page = "coming soon" placeholder
// Có AI teach:         ❌ NO. Hardcoded message strings, no LLM calls
// Có graduation logic: ✅ YES. Criteria defined.
```

---

## PHẦN 1 — NHỮNG GÌ CÓ SẴN (ĐÁNG TIN CẬY)

### 1.1 Data Models — SOLID

| Model | File | Lines | Trạng thái | Note |
|-------|------|-------|-----------|------|
| Habit | `src/models/habit.js` | 91 | ✅ Hoạt động | 6-point scoring, streak tracking, graduation criteria |
| KPI | `src/models/kpi.js` | 75 | ✅ Hoạt động | Daily/weekly/monthly rollup, RED/YELLOW/GREEN status, tier targets from company.json |
| PSN | `src/models/psn.js` | 22 | ⚠️ Minimal | Chỉ id/name/members array. Không có health scoring, downline tree |
| Member | `src/models/member.js` | ~150 | ✅ Hoạt động | Role, tier, encrypted PII, password hash |
| Lead | `src/models/lead.js` | ~200 | ✅ Hoạt động | Full CRUD, funnel levels L0-L4 |

### 1.2 State Machines — HOẠT ĐỘNG

**Onboarding Bot** (`src/agents/onboardingBot.js`, 348 lines):
- ✅ 4-week state machine (W1→W4, 7 days each)
- ✅ `startOnboarding()` → tạo session
- ✅ `advanceDay()` → progress tracking
- ✅ `recordHabitScore()` → ghi điểm thói quen
- ✅ `generateNudge()` → daily message
- ✅ `getProgress()` → progress%
- ✅ `checkGraduation()` → criteria: 3 orders + habit≥4/6 × 3 weeks
- ✅ `getSessionsNeedingNudges()` → leader biết ai cần push

**Training Ops** (`src/agents/trainingOps.js`, 322 lines):
- ✅ 3-tier curriculum structure (Tier 1: 4 weeks, Tier 2: 8 weeks, Tier 3: 12 weeks)
- ✅ `assignCurriculum()` → auto-assign theo tier
- ✅ `updateProgress()` → day_complete, habit_score, order, KPI
- ✅ `getProgress()` → full progress%
- ✅ `getActiveTrainees()` → xem ai đang học
- ✅ `getTraineesNeedingAttention()` → low habit score or inactive
- ✅ `getTraineesByPSN()` → group by PSN leader
- ✅ Reminder scheduling + Zalo-ready payload

### 1.3 Backend APIs — HOẠT ĐỘNG

```
POST /api/onboarding/start      ✅ Tạo session onboarding
GET  /api/onboarding/:id        ✅ Xem progress
POST /api/onboarding/:id/advance ✅ Chuyển ngày
POST /api/onboarding/:id/nudge  ✅ Gửi nudge message
POST /api/onboarding/:id/habit  ✅ Record habit score
POST /api/onboarding/:id/order  ✅ Record order
GET  /api/onboarding/:id/progress ✅ Xem progress%
GET  /api/onboarding/active     ✅ Danh sách active trainees

POST /api/training/assign       ✅ Gán curriculum
POST /api/training/progress     ✅ Update progress
GET  /api/training/:id          ✅ Xem training record
GET  /api/training/:id/progress ✅ Progress%
GET  /api/training/active       ✅ Danh sách active
GET  /api/training/attention    ✅ Cần attention
GET  /api/training/psn/:psnId   ✅ Theo PSN

POST /api/habits/checkin        ✅ Check-in thói quen
GET  /api/habits/streak/:id     ✅ Xem streak
GET  /api/habits/               ✅ Filter by member/date
POST /api/habits/snapshot       ✅ Midnight snapshot (stub)

POST /api/kpi                   ✅ Tạo KPI record
GET  /api/kpi/:member_id        ✅ Rollup theo member
GET  /api/kpi/leaderboard       ✅ Leaderboard
```

### 1.4 HABIT SCORING — CHUẨN MỰC

Algorithm rất tốt:
- wakeUp5am = 2 điểm
- connects≥15 = 2 điểm, 10-14 = 1 điểm
- zoomAttend = 1 điểm
- kaizenJournal = 1 điểm
- **Max 6 điểm/ngày. Pass threshold: ≥4/6**
- **Streak logic:** consecutive days ≥4 điểm → streak++. Miss 1 day → reset về 0.

Graduation criteria rõ ràng: **3 orders + habit score ≥4/6 trong 3 consecutive weeks (21 ngày)**.

### 1.5 Content Files — CÓ FORM, KHÔNG CÓ NỘI DUNG

| Module | File | Lines | Byte | Có daily_topics? | Có exercises? | Có quiz? | Content depth |
|--------|------|-------|------|-----------------|---------------|---------|---------------|
| M1 Mindset | tier1/m1-mindset.json | 294 | 26KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M2 Product | tier1/m2-product.json | 415 | 37KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M3 Connect | tier1/m3-connect.json | 278 | 22KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M4 Close | tier1/m4-close.json | 97 | 13KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M5 Recruitment | tier2/m5-recruitment.json | 143 | 40KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M6 DISC | tier2/m6-disc.json | 149 | 35KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M7 PSN Mgmt | tier2/m7-psn-management.json | 148 | 62KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M8 Coaching | tier2/m8-coaching.json | 336 | 77KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M9 Sun Tzu | tier3/m9-sun-tzu.json | 182 | 88KB | ❌ | ❌ | ❌ | **BROKEN JSON — parse error** |
| M10 Campaign | tier3/m10-campaign.json | 173 | 83KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M11 Data | tier3/m11-data.json | 181 | 83KB | ❌ | ❌ | ❌ | Overview + objectives only |
| M12 Legacy | tier3/m12-legacy.json | 242 | 84KB | ❌ | ❌ | ❌ | Overview + objectives only |

**Total content:** 2,626 lines. But ~2,400 lines are metadata (overview, objectives, audience_brief, focus). **Actual teachable content: ~200 lines.**

### 1.6 Dashboard Training Page — PLACEHOLDER

```javascript
// src/dashboard/router.js → renderTrainingPage()
renderTrainingPage() {
  return `<div class="coming-soon">Chờ content worker T-012 đến T-015 hoàn thành</div>`;
}
```

**Có route `/training` trong dashboard, nhưng page là "coming soon" — chỉ liệt kê tên modules.**

---

## PHẦN 2 — NHỮNG GÌ THIẾU (THEO THỨ TỰ ƯU TIÊN)

### ❌ TIER 1 — CRITICAL (Block hoàn toàn việc đào tạo)

#### C1. Content đào tạo CHƯA CÓ
**Vấn đề:** Các file JSON chỉ có metadata. Không có:
- Daily lesson content (nội dung CTV cần học ngày hôm đó)
- Exercises / practice assignments
- Quizzes / assessments
- Video/audio embeds
- Downloadable resources (PDFs, worksheets)

**Consequence:** Onboarding bot chạy được (tạo session, advance day, record score) nhưng CTV học cái gì? Nhận Zalo message "Ngày 2: Công thức 20/20/20" rồi... click vào đâu? Không có link. Không có content.

**Cần build:**
```
content/tier1/m1-mindset.json:
  {
    "module": { "id": "M1", ... },
    "daily_lessons": [
      {
        "day": 1,
        "title": "Công thức 20/20/20",
        "content": "<p>HTML content — giải thích 20/20/20 là gì...</p>",
        "action_items": ["Exercise 1", "Exercise 2"],
        "quiz": {
          "question": "3 thành phần của 20/20/20?",
          "options": ["A...", "B...", "C...", "D..."],
          "answer": 0
        }
      },
      ... // Day 2-7
    ]
  }
```

#### C2. NO CONTENT DELIVERY API
**Vấn đề:** Không có endpoint nào để serve content cho trainee.

```
Cần thêm:
  GET /api/content/modules            → List all modules by tier
  GET /api/content/modules/M1          → Module overview
  GET /api/content/modules/M1/day/1   → Day 1 lesson
  POST /api/content/modules/M1/day/1/quiz → Submit quiz answer
  GET /api/content/my-progress        → Member's content consumption history
```

#### C3. NO CTV-FACING TRAINING UI
**Vấn đề:** Trainer page trong dashboard là "coming soon". CTV không có nơi để:
- Xem bài học hôm nay
- Đọc content
- Làm quiz
- Check-in habit
- Xem progress%

Dashboard hiện tại dành cho Leader (members table, funnel, leads, KPI). CTV phải có UI riêng — đơn giản hơn: "Hôm nay học gì?" + "Check-in thói quen".

**Cần build:**
```
src/dashboard/ctv-portal/ (NEW)
  ├── index.html           → CTV login redirect
  ├── today.js             → "Hôm nay là ngày X/Y, học MZ"
  ├── lesson.js            → Render lesson content + quiz
  ├── habit-checkin.js     → 6-point habit score input
  └── progress.js          → "Bạn đã hoàn thành Z%"

Hoặc đơn giản hơn: 1 page "My Training" trong dashboard hiện tại
  → leader xem được, CTV log in cũng xem được (RBAC filtered)
```

#### C4. NO QUIZ / ASSESSMENT ENGINE
**Vấn đề:** Mỗi module list "objectives" nhưng không có cách nào để test xem CTV đã nắm được chưa.

- Content JSON không có `quiz` field
- Không có grade/score tracking
- Không có "pass/fail" gate (ví dụ: phải pass quiz M2 trước cho vào M3)

**Consequence:** CTV có thể "complete" module mà không hiểu gì. Cấp chứng chỉ rỗng.

---

### ⚠️ TIER 2 — MAJOR (Giảm 50% effectiveness)

#### C5. Onboarding Bot DÙNG HARDCODED MESSAGES, KHÔNG AI

**Vấn đề:** `src/agents/onboardingBot.js` generateNudge() tra về message từ array string:

```javascript
const messages = {
  1: ['🌅 Chào buổi sáng! Hôm nay là ngày 1...', '⏰ Ngày 2: Công thức 20/20/20...', ...],
  ...
};
```

**Không gọi Anthropic API.** Không cá nhân hóa. Không adapt theo habit score. Không trả lời câu hỏi.

**Consequence:**
- 100 CTV nhận GIỐNG NHAU 100% message
- Không adaptive: CTV hỏi "Em không hiểu 20/20/20 là gì?" → không có AI trả lời
- Không personalized: "Chào An, hôm nay em đã streak 5 ngày — xuất sắc!"
- Mỗi message là ~100 tokens hardcoded → "AI" chỉ là string matching

**Cần thêm:**
```javascript
// extend generateNudge(memberId) {
//   const session = getSession(memberId);
//   const progress = getProgress(memberId);
//   const prompt = buildPersonalizedPrompt(session, progress);
//   const aiMessage = await callAnthropic(prompt); // actual LLM
//   return { ...nudge, message: aiMessage, ai_generated: true };
// }
```

Ước tính cost: 28 messages/CTV × $0.001/Haiku call × 100 CTV × 30 days = **$84/tháng**. Rẻ.

#### C6. NO CONTENT PROGRESS TRACKING
**Vấn đề:** `updateProgress({type: 'day_complete'})` chỉ tăng `completed_days` counter. Không biết:
- CTV đã ĐỌC lesson chưa?
- CTV đã LÀM quiz chưa?
- CTV đã điểm bao nhiêu?
- CTV quay lại xem lại lesson cũ không?

**Cần:** Một content consumption tracker riêng:
```javascript
// GET /api/content/progress/:memberId
// → { M1: { day1: { read: true, quiz_score: 85 }, day2: { read: false } }, ... }
```

#### C7. NO CERTIFICATION / GRADUATION SYSTEM
**Vấn đề:** `checkGraduation()` logic đã có (3 orders + habit ≥4/6 × 3 weeks). Nhưng:
- Không có certificate generation
- Không có "Tân Binh → Chiến Binh" title change trong UI
- Leader phải manually change member tier
- Không có graduation notification/slack

**Cần:**
```javascript
POST /api/training/:id/graduate → Auto-upgrade tier, send certificate, notify mentor
```

#### C8. TIER 3 CONTENT m9-sun-tzu.json IS BROKEN
**Vấn đề:** Parse error tại line 181, position 84992. Toàn bộ module M9 (Sun Tzu Applied) không load được.

**Impact:** Tier 3 (Chỉ Huy → Tướng Quân) là tầng cao nhất, đầu vào cao nhất. M9 là module đầu tiên của Tier 3. Nếu M9 broken → **không thể train Tier 3 members.**

---

### 🟡 TIER 3 — MEDIUM (Làm chậm, có workaround)

#### C9. NO AI COACH FOR TRAINING (chỉ có cho sales funnel)
**Vấn đề:** AI Coach (`onboardingBot`) hiện tại chỉ support onboarding flow. Không có AI Coach cho:
- Hỏi đáp kiến thức sản phẩm (M2)
- Role-play closing objections (M4)
- DISC coaching simulation (M6)
- Sun Tzu strategy discussions (M9)

**Consequence:** CTV học theory từ content rồi phải tự practice không có feedback.

#### C10. PSN MODEL QUÁ SƠ
**Vấn đề:** PSN class chỉ có `id, name, leaderId, members[]`. Thiếu:
- Health scoring (đã có trong PSN Health classifier nhưng không connect với PSN model)
- Downline tree structure
- Depth calculation
- Revenue per PSN
- Retention rate per PSN

**Consequence:** Dashboard `/psn` có thể hiển thị health states nhưng không có PSN data structure để visualize. PSN management (M7) là module trong curriculum nhưng không có tool để practice.

#### C11. NO BUDDY SYSTEM TRACKING
**Vấn đề:** `assignCurriculum()` accepts `buddyId` parameter. `startOnboarding()` stores `buddyId`. Nhưng:
- Không có API để assign buddy
- Không có notification cho buddy khi trainee của họ cần help
- Không có buddy dashboard (xem "buddy của tôi đang học gì?")

#### C12. IN-MEMORY FOR TRAINING DATA
**Vấn đề:** `trainingRecords = {}` và `sessions = {}` trong trainingOps và onboardingBot. Restart server → mất toàn bộ onboarding progress, training records, reminders.

**Đặc biệt nghiêm trọng cho training:** training kéo dài 4-24 tuần. Mất data giữa chừng = đào tạo lại từ đầu = churn CTV.

---

## PHẦN 3 — MONETIZATION MODEL CHO TRAINING OS

### 3.1 Hiện tại — Training is COST, không phải REVENUE

Training OS hiện tại cost:
- Claude API calls (future — hiện tại hardcoded messages = $0)
- Leader time (onboard, coach, review)
- Infrastructure

**Không có revenue stream nào từ training.**

### 3.2 Theo mô hình gợi ý trước đó — Training-as-a-Service (TaaS)

Từ `company.json`:
```json
"target_arr": "$500K",
"model": "MLM Training-as-a-Service (TaaS) + Network Leadership Platform"
```

Nhưng reality:
| Tier | Giá đề xuất (from solo-leader model) | CTV actual afford | Rủi ro |
|------|--------------------------------------|-------------------|--------|
| Tier 1 (Tân Binh) | 200-500K/tháng | CTV mới chưa có doanh thu | Rất khó thu phí |
| Tier 2 (Chiến Binh) | 500K-1tr/tháng | Có doanh thu nhỏ | Có thể nhưng phải chứng minh value |
| Tier 3 (Chỉ Huy) | 1-2tr/tháng | Leader-teammate, có thể | Có hiệu quả |

**Vấn đề cốt lõi:** CTV mới (Tân Binh) vừa vào đã đóng phí training → tăng barrier to entry. Droppii model hiện tại là CTV mua products, không mua training. Training cần là **included value** để recruit CTV, không phải **separate charge**.

### 3.3 Monetization thực tế cho Training OS

**Option A: Training là acquisition cost (recommended)**
- Training miễn phí cho CTV
- Value: CTV qua training → sell được nhiều hơn → Leader thu được từ sales
- ROI: 1 CTV qua training sell 5 L1/tháng × 50K commission cho CTV = 250K/tháng. Leader cost cho training = 7K/month AI = **35x ROI**

**Option B: "Training deposit" model**
- CTV đóng 500K deposit khi onboard
- Hoàn trả sau khi graduate (3 orders + 3 weeks habit)
- Works như commitment device — giảm attrition
- Không phải revenue thật, nhưng giữ cash flow

**Option C: Tiered access**
- Tier 1 (Tân Binh): Free — onboarding bot + content
- Tier 2 (Chiến Binh): 200K/tháng — advanced modules + 1:1 coaching
- Tier 3 (Chỉ Huy): 500K/tháng — Sun Tzu + campaign warfare
- **Problem:** Droppii có chính sách riêng cho hoa hồng. Thêm training fee có thể xung đột.

**Recommendation:** Option A + B kết hợp. Training free nhưng có deposit mechanism để giữ quality.

---

## PHẦN 4 — ĐÁNH GIÁ TỔNG

### Training OS Feasibility Score

| Dimension | Score | Note |
|-----------|-------|------|
| **Backend logic** | 7/10 | State machines, APIs, scoring đều tốt |
| **Content** | 1/10 | Chỉ có metadata. Không có bài học, quiz, exercises. M9 broken. |
| **UI/UX** | 2/10 | Training page = placeholder. No CTV-facing view. |
| **AI/LLM** | 0/10 | Hardcoded messages. No LLM calls. |
| **Content delivery** | 0/10 | No API endpoint to serve content |
| **Assessment** | 0/10 | No quiz engine, no grading |
| **Persistence** | 3/10 | In-memory = dev only. Training data mất hết khi restart. |
| **Certification** | 0/10 | Graduation logic có nhưng no certificate/gate mechanism |
| **Monetization** | 2/10 | TaaS target $500K không có evidence path từ current state |
| **Integration with Funnel OS** | 4/10 | Content có, nhưng no bridge: Lead L4 → CTV → Onboarding |

**OVERALL TRAINING OS FEASIBILITY: 2.5/10 for actual training delivery**
**OVERALL TRAINING OS FEASIBILITY: 7/10 for tracking/monitoring existing training**

### So sánh với Funnel OS

| | Funnel OS | Training OS |
|---|---|---|
| Data model | ✅ Hoàn chỉnh | ✅ Hoàn chỉnh cho tracking |
| API layer | ✅ 8 endpoints | ✅ 10+ endpoints |
| Frontend | ✅ Đầy đủ views | ❌ Placeholder only |
| Content | ❌ Chưa có | ❌ **Metadata only, thiếu bài học thực tế** |
| Revenue path | ❌ Thiếu order/payment | ❌ Không có monetization model viable |
| AI integration | ❌ Recommend logic thiếu | ❌ Hardcoded, không gọi LLM |
| Persistence | ❌ In-memory | ❌ In-memory |
| Production ready | ❌ | ❌ |

---

## PHẦN 5 — PRIORITIZED ROADMAP

### WAVE 1: "Training có thể chạy" (Tuần 1-2 — 3,800 LOC)

Mục tiêu: CTV mở page → xem bài hôm nay → đọc content → làm quiz → check-in habit → xem progress.

```
Priority 1A: Content API (serve content từ JSON files)
  → src/api/content.js (NEW, ~200 LOC)
  → GET /api/content/modules — list all
  → GET /api/content/modules/:id — module detail
  → GET /api/content/modules/:id/day/:day — today's lesson
  → POST /api/content/modules/:id/day/:day/quiz — submit answer, grade

Priority 1B: Fill content (daily lessons cho M1-M4)
  → Viết 28 daily lessons (4 modules × 7 days)
  → Mỗi lesson: title, content HTML, action_items, quiz (3-5 questions)
  → ~28 files × 50 lines = ~1,400 LOC mới
  → Hoặc: 1 file JSON update với daily_topics array
  → Fix m9-sun-tzu.json (broken JSON)

Priority 1C: CTV Training Portal page
  → src/dashboard/public/my-training.html (NEW, ~300 LOC)
  → Xem bài hôm nay, đọc content, quiz, habit check-in, progress bar
  → No JWT required (CTV login với phone + OTP)

Priority 1D: Content progress tracking
  → POST /api/training/progress (extend) — thêm 'lesson_read', 'quiz_pass'
  → GET /api/training/:id/content-progress — xem đọc đến đâu
```

### WAVE 2: "Training có AI" (Tuần 3-4 — 500 LOC)

```
Priority 2A: Anthropic API trong onboardingBot
  → Thay hardcoded messages bằng Claude Haiku calls
  → Mỗi nudge personalized theo habit score + progress + member name
  → ~$84/tháng cho 100 CTV

Priority 2B: AI Q&A cho content
  → Trong lesson page: "Hỏi AI về bài học này"
  → CTV hỏi → Claude trả lời dựa trên module content
  → Context: system prompt = module content + member progress

Priority 2C: Certificates
  → Generate certificate image/text khi graduate
  → POST /api/training/:id/graduate → auto-upgrade tier + certificate
```

### WAVE 3: "Production-ready" (Tuần 5-8 — 1,500 LOC)

```
Priority 3A: D1 migration (training data)
Priority 3B: CTV mobile app (React Native — PWA đủ cho start)
Priority 3C: Buddy system (notifications, tracking)
Priority 3D: Advanced PSN model (health scoring, downline tree)
Priority 3E: Campaign modules fill (M10-M12 content)
```

### SKIPPED (not critical for revenue):

- DISC personality assessment integration (nice to have)
- Sun Tzu strategy simulation (M9 game-like experience)
- Leaderboard gamification (badges, streaks, public ranking)

---

## PHẦN 6 — ĐIỀM ĐÁNG LO (SO SÁNH VỚI BUSINESS MODEL)

### Vấn đề cốt lõi: Training OS không có path nào → revenue

```
Hiện tại:
  Training OS → Track habit/KPI/progress → (end of line)

Cần có:
  Training OS → Graduate CTV → CTV sells via Funnel OS → Revenue
                         ↑
                    LINK ĐANG THIẾU
```

**Link này là:** khi CTV graduate Tier 1 → tự động tạo Lead funnel entry + CTV account trong Funnel OS + commission tracking. Code hiện tại:
- `checkGraduation()` trả về `{ graduated: true }`
- Nhưng không có code nào connect graduation → Funnel OS enrollment
- Không có endpoint `POST /api/training/:id/graduate → /api/leads/assign-ctv`

### Training OS phụ thuộc nặng vào AI mà chưa có AI

Content delivery → quiz → coaching → progression tất cả cần AI để scale. Hiện tại hardcoded message strings → không scale 100 CTV. 1 Leader có thể coach 1:1 với 5 CTV, không thể với 50 CTV.

### In-memory cho training data = data loss certainty

Funnel OS mất data = mất leads (có thể xấu nhưng recoverable — bạn nhớ face sẵn). Training OS mất data = CTV mất progress tháng 2 tuần học → dropout. **Works once, can't prove retention without persistence.**

---

## KẾT LUẬN

**Training OS có backend infrastructure tốt (7/10) nhưng thiếu 2 thứ cốt lõi để train được người thật:**

```
1. CONTENT (0/10) — 12 modules, 2,626 LOC, 95% là metadata
   Hôm nay CTV vào training → đọc 5 câu overview → finished. Không học được gì.

2. DELIVERY + UI (0/10) — No content API, no training portal page
   Content có trên disk nhưng không thể access từ dashboard/browser.

3. AI COACH (0/10) — Hardcoded string messages, không phải AI
   Như chatbot năm 1990, không phải AI Coach.
```

**Quick wins (hàng tuần):**
1. Fill M1-M4 content (1 file JSON update) — **3 ngày**
2. Content API + CTV portal page — **2 ngày**
3. Connect graduation → Funnel OS auto-enroll — **0.5 ngày**
4. Anthropic API trong onboardingBot — **1 ngày**

**Total: 6.5 ngày để Training OS chạy được 1 cohort 10 CTV từ M1→M4.**
