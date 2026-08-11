---
description: "Build toàn bộ frontend (epic E4-dashboard) — chỉ dispatch FE workers, bỏ qua backend/data/content"
argument-hint: "[--max N] [--dry-run] [--include-blocked]"
allowed-tools: Read, Write, Bash, Task, Glob, Grep
---

# /sale-mlm:build-fe — FE-only Orchestrator

Bạn đóng vai **FE Lead** cho Droppii Training OS. Khác với `/sale-mlm:cto` (orchestrator toàn cục), lệnh này chỉ tập trung vào **epic E4-dashboard** và bỏ qua mọi task khác.

## Bối cảnh sẵn có (đã done bởi vòng CTO trước)

- T-001 auth + RBAC      — JWT, 4 roles, login API
- T-002 member CRUD       — AES-256, PDPA audit
- T-003 habit tracker     — 6-point algorithm, streak
- T-004 KPI rollup        — 3 metrics, RED/YELLOW/GREEN
- T-007 dashboard shell   — Vite, dark theme, 6 routes

FE worker được brief đầy đủ các API nội bộ ở trên — không cần build lại.

## Phạm vi vòng này

Đọc `.mekong/tasks.json`, lọc:
- `epic === "E4-dashboard"`
- `status === "todo"`
- (mặc định) tất cả `blockedBy` đã `done`

Mặc định 4 task FE: **T-008 (members table), T-009 (KPI panel), T-010 (PSN view), T-011 (alerts inbox)**.
Trong đó T-010 cần T-005 (PSN health), T-011 cần T-006 (alerts engine) — nếu chưa done, **bỏ qua** trừ khi user gắn flag `--include-blocked`.

## Quy tắc bắt buộc cho FE workers

1. **Brand tokens lấy từ `tasks.json.policy.brand`** — không hardcode màu khác. Tất cả định nghĩa qua CSS variables `--bg`, `--card`, `--gold`, `--gold-electric`, `--amber`.
2. **Font**: Playfair Display (display headings), Inter (body), JetBrains Mono (số liệu, KPI, code).
3. **Vietnamese UI** — text hiển thị bắt buộc tiếng Việt. Comment code tiếng Anh.
4. **Mobile-first responsive**, breakpoint 640 / 1024 / 1280.
5. **A11y ≥ 90** (Lighthouse) — semantic HTML, alt, aria-label, contrast 4.5:1.
6. **Reuse từ T-007** — đọc `src/dashboard/index.html` + `src/dashboard/main.js` để hiểu router/layout đã có. Không tạo router mới, chỉ extend.
7. **Build smoke** — mỗi worker sau khi xong phải `cd src/dashboard && npx vite build` thành công, không error.

## Quy trình thực thi

### Bước 1 — Quét ready FE tasks
```bash
node bin/kanban.js list --epic E4-dashboard
```

In bảng cho user: tổng số FE task, ready, blocked, done.

### Bước 2 — Chọn batch
- Lấy tối đa N (mặc định = `policy.max_parallel` = 4, override bằng `--max`).
- Chỉ task `todo` + ready (trừ khi `--include-blocked`).
- Nếu `--dry-run`, in batch và dừng.

### Bước 3 — Xác nhận
In bảng batch + dừng hỏi user "go" / "ok" / "chạy". Bỏ qua xác nhận nếu user đã gõ confirm trong cùng message.

### Bước 4 — Fan-out FE workers song song

Cho mỗi task trong batch, gọi Task tool (đặt nhiều Task call trong CÙNG message để chạy song song):

```
subagent_type: "general-purpose"
description:   "<task-id> FE — <title 5 chữ>"
prompt: <load .claude/agents/sale-mlm-worker.md>
        + WORKER_TYPE=frontend
        + TASK_ID + TASK_TITLE + ACCEPT_CRITERIA
        + BRAND tokens
        + Yêu cầu: extend src/dashboard, không tạo project mới
        + API endpoints có thể gọi (đã done): /api/auth/login, /api/members, /api/habits, /api/kpi
```

Trước khi bắn, mark `in_progress`:
```bash
node bin/kanban.js update <id> in_progress fe-worker-<short>
```

### Bước 5 — Verify từng kết quả

Khi worker trả evidence JSON:
- Parse `tests`, `accept_coverage`, `files_changed`.
- Chạy build smoke: `cd src/dashboard && npx vite build --outDir /tmp/check-<id>`.
- Nếu build pass + tất cả accept criteria có evidence → `done`.
- Nếu build fail hoặc thiếu criteria → `blocked` + comment chỉ rõ.

```bash
node bin/kanban.js update <id> done
node bin/kanban.js comment <id> "FE verified: build OK, <N> accept hết"
```

### Bước 6 — Báo cáo

Bảng tóm tắt:

```
Build FE — vòng #1 — N task dispatched
  T-008  members-table    ✓ done       sticky table + 4 filter chips, build 1.2s
  T-009  kpi-panel        ⟳ review     cần check sparkline contrast
Còn lại (blocked by backend): T-010, T-011
```

Nếu còn task FE ready (do dependency vừa unlock) → vòng kế. Nếu hết → dừng + đề xuất next step (`/sale-mlm:cto` để tiếp tục backend hoặc `/sale-mlm:cto --only E5-content`).

## Flag

- `--max N` — số worker FE song song (1–4).
- `--dry-run` — chỉ in plan, không dispatch.
- `--include-blocked` — bỏ qua check `blockedBy`, dispatch luôn cả task đang chờ backend (nguy hiểm — worker phải mock API).

## Ranh giới

- **Không động tới** code backend (`src/api/`, `src/models/`, `src/auth/`, `src/middleware/`, `src/analytics/`).
- **Không cài package backend** (express, jsonwebtoken, ...).
- **Không sửa** `.mekong/company.json`, `tasks.json` ngoài field `status`/`notes`/`events`.
- **Không deploy** — đó là epic E8 do `ops` worker phụ trách.

$ARGUMENTS
