# Training OS — Audit Trước Verification
> **Ngày:** 2026-07-07 | **Baseline:** training-os-audit.md (2026-07-06) + codebase current state

---

## TL;DR

> **Training OS = Infrastructure KHÔNG CÓ CONTENT + KHÔNG CÓ UI + AI giả.**
> Audit đã đúng về hướng nhưng **underestimate mức độ thiếu hụt**:
> - Audit nói "~200 lines content" → Reality: **ZERO daily lessons, ZERO quizzes**
> - 4/12 content files **BROKEN JSON** (crash parser)
> - `generateNudge()` = hardcoded string array, chưa phải "AI" gì cả

---

## GAP ANALYSIS — Training OS Audit vs Reality

### 🔴 Content Gap — TỒI HƠN AUDIT

| Metric | Audit Estimate | Reality | Delta |
|--------|---------------|---------|-------|
| Total content LOC | 2,626 lines | ~2,600 lines (metadata only) | Same |
| Daily lesson LOC | ~200 lines | **0 lines** | **Worse** |
| Quiz questions | "some" | **0** | **Worse** |
| Broken files | 1 (M9) | **4** (M9, M10, M11, M12) | **Worse** |

**Audit said:** "~2,400 lines are metadata (overview, objectives, focus). Actual teachable content: ~200 lines."

**Reality:** All 12 files have identical structure:
```json
{
  "module": { "id", "title", "tier", "duration_days", "focus", "overview", "objectives" },
  "audience_brief": "..."
}
```
Keys present in EVERY file: `id`, `title`, `tier`, `duration_days`, `focus`, `overview`, `objectives`.
Keys ABSENT from ALL files: `daily_lessons`, `lessons`, `topics`, `daily_topics`, `quiz`, `assessment`, `exercises`, `content`.

**There is NOTHING to teach.** A CTV opening M1 would see "Overview" + "Objectives" — 3 paragraphs of prose. No day-by-day progression. No exercises. No quizzes.

### 🔴 4 Files BROKEN (vs audit's 1)

| File | Audit Status | Reality | Error |
|------|-------------|---------|-------|
| m9-sun-tzu.json | "Broken JSON, parse error" | ❌ BROKEN | Expecting ',': line 181 col 3 |
| m10-campaign.json | "Overview only" | ❌ BROKEN | Expecting ',': line 172 |
| m11-data.json | "Overview only" | ❌ BROKEN | Expecting property name: line 156 |
| m12-legacy.json | "Overview only" | ❌ BROKEN | Invalid control char: line 42 |

### 🔴 AI Coach = Hardcoded Strings (confirmed worse than audit)

**Audit said:** "Hardcoded message strings, no LLM calls."

**Reality confirmed:** `generateNudge()` line 162-230:
```javascript
function generateNudge(memberId) {
  // ...
  return (messages[week] || messages[1])[day - 1] || 'Tiếp tục practice hôm nay!';
}
```
Pure string lookup array. No API calls. No personalization beyond "chào buổi sáng" + member name inserted into template.

### 🔴 Training UI = Placeholder (confirmed)

| Page | Location | Status |
|------|----------|--------|
| /training (leader) | router.js line 51 | "Coming soon" + "6 AI agents hỗ trợ" (marketing text) |
| /psn (leader) | router.js line ~166 | "Đang phát triển..." |
| /kpi (leader) | router.js line ~187 | "Đang tích hợp..." |
| CTV portal | NOT FOUND | Directory doesn't exist |
| Public training | NOT FOUND | `src/dashboard/public/` doesn't exist |

### 🔴 No Content Delivery API

**Audit said:** "No content API endpoint."

**Reality confirmed:** No `/api/content/` routes in Workers. The `content/` directory is static JSON files on disk that NO client can access. Even if they had content, there's no server to serve it.

### 🟡 Graduation → Funnel OS Bridge Missing (confirmed)

**Audit noted:** "Graduation → Funnel OS enrollment link missing."

**Reality:** `onboardingBot.checkGraduation()` returns `{ graduated: true }` but no code connects this to:
- Auto-creating lead in Funnel OS
- Upgrading member tier
- Notifying PSN leader
- Triggering commission tracking

TOTAL BRIDGE CODE: **0 lines.**

### 🟡 In-Memory Training Data (confirmed)

**Audit noted:** "in-memory = data loss"

**Reality:** `trainingRecords = {}` in `trainingOps.js`, `sessions = {}` in `onboardingBot.js`. Restart = lose all training progress. D1 schema HAS `training_records` table (migration 0002) but Workers handlers write to in-memory objects, NOT D1.

---

## REVISED TRAINING OS FEASIBILITY

### Original Audit Scores (2026-07-06) vs Revised

| Dimension | Audit Score | Revised Score | Reason |
|-----------|------------|---------------|--------|
| Backend logic | 7/10 | **7/10** | State machines still solid |
| Content | 1/10 | **0/10** | ZERO daily lessons/quiz/exercises (was 1/10 because audit thought ~200 lines existed) |
| UI/UX | 2/10 | **0/10** | ALL pages are placeholders. Public directory doesn't exist. (was 2/10 because audit only saw router.js) |
| AI/LLM | 0/10 | **0/10** | Confirmed: hardcoded arrays only |
| Content delivery | 0/10 | **0/10** | Confirmed: no API |
| Assessment | 0/10 | **0/10** | Confirmed: no quiz/grading |
| Persistence | 3/10 | **2/10** | Worse: in-memory confirmed + D1 table unused |
| Certification | 0/10 | **0/10** | Confirmed |
| Monetization | 2/10 | **1/10** | No viable path — training costs money, generates NO revenue |
| Integration Funnel OS | 4/10 | **3/10** | Worse: bridge = 0 LOC |

**REVISED OVERALL: 1.7/10 for actual training delivery**
**REVISED OVERALL: 6/10 for tracking/monitoring existing training** (state machines still good IF data persisted)

---

## WHAT'S ACTUALLY GOOD (still from audit)

### 1. Habit Scoring Algorithm ✅
6-point system works correctly:
- `wakeUp5am`: 2pts
- `connects ≥15`: 2pts, `10-14`: 1pt
- `zoomAttend`: 1pt
- `kaizenJournal`: 1pt
- Max: 6pts/day. Pass: ≥4pts
- Streak: consecutive days ≥4pts

### 2. Onboarding State Machine ✅
`startOnboarding()` → `advanceDay()` → `recordHabitScore()` → `checkGraduation()` all functional. 4-week program, 7 days/week. State tracking works.

### 3. Training Ops API ✅ (in-memory)
`assignCurriculum`, `updateProgress`, `getActiveTrainees`, `getTraineesNeedingAttention`, `getTraineesByPSN` — all functional but in-memory.

### 4. Graduation Criteria ✅
Clear formula: 3 orders + habit ≥4/6 × 3 consecutive weeks. Automated check exists.

---

## REVISED PRIORITY LIST

### What MUST be built (in order):

**STAGE 0: Persistence (prerequisite for everything else)**
```
trainingRecords {} → D1 INSERT/UPDATE
→ Without this: all training data lost on restart
→ 200 LOC in Workers handler
```

**STAGE 1: Content (prerequisite for training)**
```
12 files × add daily_lessons[] array
→ 4 broken files need JSON fix FIRST
→ ~3,000 LOC of daily lessons + quizzes (human writing)
→ OR: content worker task to generate
```

**STAGE 2: Content Delivery API**
```
GET /api/content/modules — list
GET /api/content/modules/:id — overview
GET /api/content/modules/:id/day/:d — today's lesson
POST /api/content/modules/:id/day/:d/quiz — submit + grade
→ ~250 LOC
```

**STAGE 3: Training UI**
```
src/dashboard/public/my-training.html — no auth required
src/dashboard/training-portal/ — authenticated view
→ ~400 LOC
```

**STAGE 4: AI Coach**
```
Anthropic API call in generateNudge()
→ $84/month for 100 CTV
→ ~150 LOC
```

**STAGE 5: Graduation → Funnel Bridge**
```
POST /api/training/:id/graduate
→ create lead + assign CTV + upgrade tier + notify
→ ~100 LOC
```

---

## UNRESOLVED QUESTIONS

1. **Content authoring:** Ai viết 28 daily lessons × 12 modules = 336 lessons? Leader? Content worker? External copywriter?
2. **M9-M12 broken JSON:** Khi nào fix? Broken tầm này Tier 3 chặn hoàn toàn.
3. **Training data migration:** staging → D1 trước hay sau khi có content? Persistence trước thì training không bị mất data giữa chừng.
4. **OnboardingBot + trainingOps overlap:** Hai agents đang track cùng thứ (sessions, progress, habit). Cần consolidate.
5. **Certificate format:** Text? Image? PDF? Embedded credential (like Open Badges)?
