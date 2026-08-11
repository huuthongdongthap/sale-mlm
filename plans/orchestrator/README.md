# Droppii Training OS — Auto-CTO Orchestrator Plan

**Project:** DROPPII SALES TRAINING OS — HIVE WARFARE ACADEMY
**Team:** PHỤNG SỰ 100 ĐỘ C
**Target:** $500K ARR, 500+ active members by Q4-2026
**Updated:** 2026-04-24

## Mục đích

Tài liệu này định nghĩa cách một **Auto-CTO orchestrator** (chạy trong Claude Code CLI) điều phối N **worker subagent** song song để build xong MVP của Droppii Training OS, từ nền tảng auth/data cho đến pilot launch cho 10 Tân Binh đầu tiên.

Plan xuất phát từ `.mekong/company.json` (5 next_steps + training_architecture 3 tầng + 6 AI agents) và dịch thành 25 task có đầu ra cụ thể, dependency rõ ràng, và chuẩn chấp nhận đo được.

## Kiến trúc thực thi

```
                     ┌─────────────────────────┐
                     │  /sale-mlm:cto          │   ← bạn gõ lệnh này
                     │  (Auto-CTO Orchestrator) │     trong Claude Code
                     └──────────┬──────────────┘
                                │ 1. Đọc .mekong/tasks.json
                                │ 2. Chọn task đã mở khóa (blockedBy hết)
                                │ 3. Fan-out qua Task tool
                                ▼
    ┌──────────────┬──────────────┬──────────────┬──────────────┐
    │ backend-     │ frontend-    │ content-     │ data-        │
    │ worker       │ worker       │ worker       │ worker       │
    ├──────────────┼──────────────┼──────────────┼──────────────┤
    │ T-001 auth   │ T-007 shell  │ T-012 M1     │ T-005 PSN    │
    │ T-002 CRUD   │ T-008 table  │ T-013 M2     │ T-006 alerts │
    │ ...          │ ...          │ ...          │ ...          │
    └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
           │              │              │              │
           └──────────────┴──────┬───────┴──────────────┘
                                 │ 4. Mỗi worker ghi evidence
                                 │    + đổi status trong tasks.json
                                 ▼
                     ┌─────────────────────────┐
                     │  CTO verify loop         │
                     │  - tests pass?           │
                     │  - accept criteria hết?  │
                     │  → review | done | retry │
                     └─────────────────────────┘
```

**Orchestrator không tự code** — chỉ lập kế hoạch, phát task, kiểm tra evidence, cập nhật kanban. Việc nặng do worker làm. Điều này giữ context window của CTO tập trung vào bức tranh lớn.

## 11 Epic → 25 task

| Epic | Nội dung | Task IDs | Giờ ước tính |
|------|---------|----------|--------------|
| E1  | Nền tảng (auth, RBAC, PDPA) | T-001, T-002 | 85 |
| E2  | Habit + KPI tracker | T-003, T-004 | 105 |
| E3  | Analytics (PSN score, alerts) | T-005, T-006 | 110 |
| E4  | Dashboard 5 views | T-007 → T-011 | 285 |
| E5  | Tier-1 content (4 module × 7 ngày) | T-012 → T-015 | 360 |
| E6  | AI agents (onboarding, training ops) | T-016, T-017 | 115 |
| E7  | Test + CI | T-018, T-019, T-020 | 120 |
| E8  | Deploy + monitoring | T-021, T-022 | 80 |
| E9  | Seed data | T-023 | 40 |
| E10 | Docs + runbook | T-024 | 35 |
| E11 | Pilot launch | T-025 | 25 |
| **Total** | | 25 task | **~1,360 phút** (~23 giờ người) |

Với 4 worker song song (giới hạn `policy.max_parallel = 4`) và dependency đúng, CTO có thể co hẹp xuống **6–8 giờ thời gian thực**.

## Dependency graph (critical path)

```
T-001 ──┬─→ T-002 ──┬─→ T-008 ──┐
        │           │            │
        └─→ T-003 ──┤            ├─→ T-018 ─→ T-019 ─→ T-020 ─→ T-021 ─→ T-022 ─┐
        └─→ T-004 ──┤                                                            │
                    └─→ T-005 ─→ T-006 ─→ T-011 ───────────────────────────────┤
T-007 ──────────────→ T-008,9,10,11                                              │
T-012 ─→ T-013,14 ─→ T-015 ─────────────────────────────────────────────────────┤
T-012 ─→ T-016 ─→ T-017 ──────────────────────────────────────────────────────── ┤
T-023 (seed) ─────────────────────────────────────────────────────────────────── ┤
T-024 (docs) ──────────────────────────────────────────────────────────────────── ┤
                                                                                 ▼
                                                                              T-025 (launch)
```

Critical path: T-001 → T-002 → T-018 → T-019 → T-020 → T-021 → T-025.
Content path (parallel): T-012 → T-015.
UI path (parallel): T-007 → T-008 → T-019.

## Giao thức thực thi (execution protocol)

Mỗi vòng lặp CTO thực hiện 6 bước:

1. **Đọc kanban** — `bin/kanban.js list` để xem trạng thái hiện tại.
2. **Chọn task** — lấy tối đa `max_parallel` task có `status=todo` và tất cả `blockedBy` ở `done`. Ưu tiên critical path.
3. **Brief worker** — gọi Task tool với prompt `.claude/agents/sale-mlm-worker.md`, truyền task id + accept criteria + policy.
4. **Gate chạy song song** — chờ worker xong hoặc hết timeout (25 phút mặc định cho task ≤ 60 phút ước tính).
5. **Verify** — đọc evidence worker ghi, chạy `npm test` nếu `require_tests_before_done`, check đủ accept criteria.
6. **Cập nhật** — set `done` nếu pass, `review` nếu cần người xem, `blocked` + comment nếu fail 2 lần (`max_retries_per_task = 2`). Lặp lại bước 1.

Khi toàn bộ tasks ở `done`, CTO in báo cáo tổng và dừng.

## Thoát hiểm (escape hatches)

| Tình huống | Lệnh thoát |
|-----------|------------|
| Bạn muốn xem hiện trạng | `/sale-mlm:cto-status` |
| Task kẹt, cần force-kick lại | `/sale-mlm:cto-assign T-XXX` |
| Task sai hoàn toàn, làm lại từ đầu | `/sale-mlm:cto-reset T-XXX` |
| Ngừng CTO loop | Ctrl-C trong Claude Code |
| Worker tranh chấp cùng file | Policy yêu cầu worker lock file qua kanban `events[]` — CTO từ chối dispatch nếu đã có lock |

## Ranh giới CTO không vượt qua

Auto-CTO **KHÔNG**:
- Chạy `rm -rf`, `git push --force`, hay bất kỳ lệnh phá hủy dữ liệu nào.
- Tạo key, ký hợp đồng, gọi API tốn tiền thật (Stripe live, Zalo mass-send) mà chưa có bạn xác nhận.
- Merge PR lên `main` — luôn dừng ở `review` khi policy yêu cầu.
- Thay đổi `tasks.json` ngoài field `status`, `events`, `updated` — scope, accept criteria, dependency chỉ bạn được sửa.

## Tiếp theo

Vào Claude Code CLI tại folder SALE MLM và gõ:

```
/sale-mlm:cto
```

CTO sẽ in ra plan của vòng đầu tiên, chờ bạn xác nhận, rồi bắt đầu fan-out workers. Xem `QUICK-START-CTO.md` ở gốc repo để biết chi tiết hơn về các lệnh và flag.
