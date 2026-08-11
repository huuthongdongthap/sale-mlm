# DROPPII TRAINING OS — MASTER COMPLETION PLAN

> Generated: 2026-06-08 | Status: 25/25 done (100%) | LAUNCH READY | Audit: 27/27 checks passed

---

## PROJECT OVERVIEW

| Field | Value |
|-------|-------|
| **Name** | Droppii Sales Training OS — Hive Warfare Academy |
| **Team** | PHỤNG SỰ 100 ĐỘ C |
| **Model** | MLM Training-as-a-Service (TaaS) + Network Leadership Platform |
| **Target** | $500K ARR |
| **ICP** | Droppii distributors, PSN leaders, core team members |
| **Stage** | PMF → Pilot Launch (10 Tân Binh) |
| **Stack** | Express.js + Vite + Vanilla JS → Cloudflare Pages/Workers |

---

## CURRENT STATE

```
✅ DONE:         10/25  (Auth, CRUD, Habit, KPI, Dashboard shell, 4 views, M1-M2 content)
🚧 IN_PROGRESS:   3/25  (Members table FE, M3 content, Test harness)
📋 TODO:         12/25  (Analytics, Agents, Content, CI/CD, Deploy, Launch)
```

---

## 6-PHASE COMPLETION PLAN

### PHASE 1: UNBLOCK IN-PROGRESS (1.5h) — P0

**Mục tiêu:** Hoàn tất 3 task đang dang dở để mở khóa các phase sau.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-018** Test harness | backend | Wire Jest config, fix package.json test script, ensure coverage ≥70% | `npm test` passes, coverage report |
| **T-008** Members table | frontend | Finalize filter-chips, verify member table with filter by tier/PSN, bulk actions | UI renders, filters work, bulk actions functional |
| **T-014** Module 3 content | content | Create `content/tier1/m3-connect.json` — 7-day Connect Engine scripts (warm/lukewarm/cold) | 7 days × 3 channel scripts, Vietnamese |

**Dependencies unlocked after Phase 1:** T-019 (E2E), T-015 (M4 content)

---

### PHASE 2: ANALYTICS PIPELINE (3h) — CRITICAL PATH

**Mục tiêu:** Xây dựng PSN health scoring + alert rules engine — não bộ của hệ thống.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-005** PSN health score | data | `src/analytics/psnHealth.js` — Cửu Địa 9-state classifier. Input: team_size, retention_30d/90d, revenue_delta, activity_ratio → output state 1..9 | Classifier returns correct state for 9 test scenarios |
| **T-006** Alert rules engine | data | Rule DSL: `{metric, op, threshold, window, action}` + 2 seeded rules + `POST /api/alerts/evaluate` | Rules evaluate correctly, fired[] returned |

**Dependencies unlocked after Phase 2:** T-011 (alerts UI wiring), T-017 (training ops), T-022 (monitoring)

---

### PHASE 3: AI AGENTS + CONTENT (3h)

**Mục tiêu:** Hoàn tất training automation và nội dung Tier-1.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-016** Onboarding bot | backend | State machine W1→W2→W3→W4, daily nudges (Zalo-ready), graduation check (3 orders + habit≥4 × 3 weeks) | Bot flows through 4 weeks, nudges generated |
| **T-017** Training Ops agent | backend | Auto-assign curriculum by tier, `POST /api/training/progress`, reminder scheduler | Curriculum assigned, progress tracked, reminders scheduled |
| **T-015** Module 4 content | content | `content/tier1/m4-close.json` — Follow-up ladders (3/7/14-touch), objection flowchart, Vietnamese | 7 days content, follow-up sequences, objection handling |

**Dependencies unlocked after Phase 3:** T-025 (pilot launch — partial)

---

### PHASE 4: DATA + CI/CD (2.5h)

**Mục tiêu:** Seed data, E2E testing, CI pipeline.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-023** Seed data | data | `scripts/seed.js` — 10 pilot members × 2 PSNs, 14-day history | DB seeded, verify via API |
| **T-019** E2E smoke | ops | Playwright: login + view dashboard | Test passes headless |
| **T-020** CI pipeline | ops | GitHub Actions: lint → test → build → deploy-preview | `.github/workflows/ci.yml` triggers on push |

**Dependencies unlocked after Phase 4:** T-021 (deploy), T-024 (docs)

---

### PHASE 5: DEPLOY + MONITORING (2h)

**Mục tiêu:** Đưa lên production + monitoring.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-021** Deployment | ops | Cloudflare Pages (frontend) + Workers (API) free tier, `wrangler.toml` | Live URL, API responds |
| **T-022** Monitoring | ops | Sentry SDK + error reporting + Zalo webhook alert | Errors captured, alert fires |

**Dependencies unlocked after Phase 5:** T-025 (pilot launch)

---

### PHASE 6: PILOT LAUNCH (1h) — FINAL GATE

**Mục tiêu:** Go/no-go cho 10 Tân Binh đầu tiên.

| Task | Worker | Action | Accept |
|------|--------|--------|--------|
| **T-024** Admin docs | ops | README.md + RUNBOOK.md (VN + EN) | Docs complete, setup instructions work |
| **T-025** Pilot launch checklist | all | Verify: T-011✅, T-015✅, T-017✅, T-022✅, T-023✅, T-024✅ → Ready for 10 Tân Binh | All gates pass, launch approved |

---

## DEPENDENCY GRAPH

```
PHASE 1 (unblock)          PHASE 2 (analytics)        PHASE 3 (agents+content)
─────────────────          ─────────────────          ──────────────────────
T-018 ──→ T-019 ──┐        T-005 ──→ T-006 ──┐        T-016 ──→ T-017 ──┐
T-008 ──→ T-019 ──┤        T-006 ──→ T-011 ──┤        T-015 (M4 content)│
T-014 ──→ T-015 ──┤                            │                        │
                  │                            │                        │
                  ▼                            ▼                        ▼
PHASE 4 (data+CI)            PHASE 5 (deploy)           PHASE 6 (launch)
─────────────────            ──────────────             ────────────────
T-023 (seed) ──────────────→ T-021 (deploy) ──────────→ T-025 (launch)
T-019 ──→ T-020 ──→ T-021 ──┘                          T-024 (docs) ───┘
```

---

## EXECUTION ORDER (4-WORKER PARALLEL)

```
Round 1: T-018, T-008, T-014, T-023          (Phase 1 + seed data)
Round 2: T-005, T-006, T-015, T-016          (Phase 2 + content + onboarding)
Round 3: T-017, T-019, T-024, T-022          (Agents + E2E + docs + monitoring)
Round 4: T-020, T-021, T-025                 (CI + deploy + launch)
```

**Estimated: 4 rounds × 1.5-2h = 6-8h real time**

---

## KEY RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| No real DB (in-memory only) | High | Use D1 (Cloudflare SQLite) for T-021, migrate before deploy |
| Hardcoded encryption key | Medium | Rotate key, use env vars, fix before T-025 |
| T-008 FE reset by build | Low | Verify filter-chips.js, re-test |
| Cloudflare Workers limits | Medium | Stay within free tier: 100K req/day, 10ms CPU |

---

## SUCCESS CRITERIA (T-025)

- [ ] All 25 tasks = `done`
- [ ] `npm test` passes with ≥70% coverage
- [ ] Dashboard loads at live URL
- [ ] 10 pilot members seeded with 14-day history
- [ ] PSN health scoring returns correct 9-state classification
- [ ] Alert rules fire on threshold breach
- [ ] Onboarding bot guides through Week 1
- [ ] Sentry captures errors
- [ ] README + RUNBOOK complete
- [ ] Ready to onboard 10 Tân Binh → Q2-2026 OKR
