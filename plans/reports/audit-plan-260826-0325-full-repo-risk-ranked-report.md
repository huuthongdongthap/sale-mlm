# Audit Plan — Full Repo Risk-Ranked (Droppii Sales Training OS)

## Session Info
- DateTime: 2026-08-26 03:25 ICT | CWD: `/Users/mac/mekong-cli/SALE MLM` | Branch: main
- Goal context: kiểm tra toàn bộ repo
- Pipeline: risk-rank → select-audits → allocate-resources (recipe `recipes/audit/plan.json`)
- Baseline: `audit-260826-0044-go-live-readiness-report.md` (CONDITIONAL HOLD) + 4 task tickets `plans/tasks/`

## Step 1 — Risk Rank (toàn bộ repo)

| # | Risk | Vị trí | Severity | Likelihood | Score | Evidence |
|---|------|--------|----------|------------|-------|----------|
| R1 | Coverage gate FAIL — chặn mọi PR qua CI | `jest.config.js:15-19` | 🔴 Critical | Certain | 9.5 | 57.8%/47.9%/55.3% vs ngưỡng 70/60/60 |
| R2 | Referral + LeaderDashboard routes chết (404 prod) | `src/server.js`, `src/features/{referral,leaderDashboard}.js` | 🔴 Critical | Certain | 9.0 | Không mount trong server.js; referral dùng mảng in-memory dù có `ReferralsOps` adapter |
| R3 | D1 staging/prod chung 1 database_id | `wrangler.toml:14-17,39-46,54-61` | 🟡 High | High | 8.5 | Seed staging đè data prod. **MỚI:** diff chưa commit thêm block `[env.production.d1_databases]` nhưng vẫn dùng id `def140e1-…` — KHÔNG sửa được collision |
| R4 | Webhook subscriptions in-memory — mất khi cold start | `src/server.js` (`webhookSubscriptions`) | 🟡 High | Medium | 7.5 | Không persist xuống D1 |
| R5 | **MỚI:** Script migrate password hash chưa track/chưa review | `scripts/migrate-password-hash.js` (untracked) | 🟡 High | Medium | 7.0 | Security-sensitive (auth hash migration) sắp commit mà chưa có audit |
| R6 | External blockers operator-side (CF secrets, DNS, Sentry, Zalo) | env vars + DNS | 🟡 High | Pending owner | 7.0 | Task 260826-0103; không thể tự fix trong repo |
| R7 | Hardcoded metrics `/scaling/progress` (members=10, target=50) | `src/features/leaderDashboard.js` | 🟠 Medium | Certain | 5.5 | Số liệu giả hiển thị khi route được mount |
| R8 | Branch coverage thấp nhất ở routes lớn | `src/api/leads.js`, `src/api/members.js`, `src/agents/onboardingBot.js` | 🟠 Medium | High | 5.0 | Feeds R1; 24 test files / 14 suites |

Quét secret toàn repo (src/scripts/migrations/telegram-bot): **sạch**, không tìm thấy key hardcode.

## Step 2 — Select Audits (budget-constrained: chỉ chọn audit mở khóa go-live)

| Audit | Gắn risk | Chọn? | Lý do |
|-------|----------|-------|-------|
| A1 Coverage remediation verify | R1, R8 | ✅ | Blocker CI #1, đã có ticket 0100 |
| A2 Route wiring + persistence | R2, R4, R7 | ✅ | Blocker chức năng #2, ticket 0101 |
| A3 D1 isolation + review diff wrangler.toml chưa commit | R3 | ✅ | Data-loss prod; diff mới làm tăng nguy cơ nếu commit nhầm |
| A4 Security review migrate-password-hash.js | R5 | ✅ | File mới chưa ai xem; rẻ (30p) mà chặn rủi ro auth |
| A5 External blocker sync | R6 | ✅ (coordination only) | Ticket 0103, operator-only |
| A6 Perf/load test | — | ❌ Defer | YAGNI trước pilot; chưa có traffic |
| A7 FE accessibility/design audit | — | ❌ Defer | Không phải blocker go-live |

## Step 3 — Allocate Resources

| Audit | Agent | Est | Acceptance |
|-------|-------|-----|-----------|
| A1 | `testing-expert` → fix bởi dev | 4h | `npm test` đạt thresholds 70/60/60 |
| A2 | `fullstack-developer` | 3h | `/api/referral/*` + `/scaling/*` trả live data từ `ReferralsOps`, test pass |
| A3 | `database-expert` | 1h | staging/prod khác database_id; commit wrangler.toml sau khi tách |
| A4 | `code-reviewer` (security lens) | 0.5h | Script reviewed, không log plaintext hash, idempotent |
| A5 | `coo` | — | Checklist operator tick dần |

Tổng: ~8.5h dev + 0.5h review. Trình tự gợi ý: **A3 → A4 → A2 → A1 → A5** (A3/A4 rẻ + chặn rủi ro cao nhất ngay).

## Go/No-Go (giữ nguyên từ baseline, cộng điều kiện mới)

HOLD pilot launch T-025 đến khi: R1–R3 đóng (tickets 0100–0102) **+ A4 pass** (điều kiện mới phát hiện hôm nay).

## Unresolved Questions
1. Diff wrangler.toml chưa commit (thêm production block trùng database_id) — chủ ý placeholder hay quên tách ID? Cần xác nhận trước khi commit.
2. `migrate-password-hash.js` chạy trên môi trường nào (local/staging/prod) và backup plan khi rollback?
