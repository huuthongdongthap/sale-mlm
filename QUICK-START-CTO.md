# Quick Start — Auto CTO cho Droppii Training OS

3 lệnh bạn cần nhớ khi mở Claude Code CLI trong folder này:

| Lệnh | Mục đích |
|------|---------|
| `/sale-mlm:cto` | Khởi động vòng lặp CTO — plan, fan-out workers, verify. Xin xác nhận lần đầu rồi tự chạy. |
| `/sale-mlm:cto-status` | Xem kanban hiện tại (không dispatch gì). |
| `/sale-mlm:cto-assign T-XXX` | Ép dispatch 1 task cụ thể. |

Hoặc trên terminal (ngoài Claude Code):

```bash
node bin/kanban.js list           # in bảng kanban
node bin/kanban.js summary        # 1 dòng tóm tắt
node bin/kanban.js ready          # task đã mở khóa
node bin/kanban.js get T-001      # chi tiết 1 task
```

## Luồng chạy điển hình

1. Mở Claude Code trong folder `SALE MLM/`.
2. Gõ `/sale-mlm:cto` và enter.
3. CTO in ra: tổng task, critical path, 4 task sẽ dispatch vòng đầu. Dừng hỏi confirm.
4. Bạn gõ `go` hoặc `ok`.
5. CTO dispatch 4 worker subagent song song. Mỗi worker:
   - Đọc `.mekong/tasks.json`, `.mekong/company.json`, `plans/orchestrator/README.md`.
   - Code hoàn chỉnh, viết test, chạy test.
   - Ghi evidence JSON, trả về CTO.
6. CTO verify từng evidence → set `done` / `review` / `blocked`.
7. Lặp cho tới khi hết task hoặc bạn Ctrl-C.

## Cấu trúc thư mục liên quan

```
SALE MLM/
├── .claude/
│   ├── agents/
│   │   ├── sale-mlm-worker.md          ← prompt cho worker subagent
│   │   └── mekong -> …                 ← symlink 6 agent từ mekong-cli
│   ├── commands/
│   │   ├── sale-mlm/
│   │   │   ├── cto.md                  ← /sale-mlm:cto (main orchestrator)
│   │   │   ├── cto-status.md           ← /sale-mlm:cto-status
│   │   │   ├── cto-assign.md           ← /sale-mlm:cto-assign
│   │   │   └── cto-reset.md            ← /sale-mlm:cto-reset
│   │   └── mekong -> …                 ← symlink 365 commands từ mekong-cli
│   ├── skills/
│   │   └── mekong -> …                 ← symlink 11 skills
│   └── settings.json
├── .mekong/
│   ├── company.json                    ← context domain (không sửa trừ khi chiến lược đổi)
│   ├── tasks.json                      ← kanban — CTO/workers đọc+ghi
│   └── cli-cache/                      ← mekong-cli repo clone
├── bin/
│   └── kanban.js                       ← CLI mini cho tasks.json
├── plans/
│   └── orchestrator/
│       └── README.md                   ← plan chi tiết (đọc trước khi CTO chạy)
├── src/                                ← code project (worker viết vào đây)
├── install-mekong-global.sh            ← 1-time script để cài global
├── mekong-sync.sh                      ← pull update từ upstream mekong-cli
└── QUICK-START-CTO.md                  ← file này
```

## Flag hữu ích cho /sale-mlm:cto

- `/sale-mlm:cto --max 2` — chỉ 2 worker song song (tiết kiệm credit khi test).
- `/sale-mlm:cto --only E1-foundation` — chỉ làm epic nền tảng trước.
- `/sale-mlm:cto --dry-run` — xem trước batch, không dispatch.

## Khi có lỗi

- **Worker report blocked: file-lock-conflict** — worker khác đang chiếm file. Chờ vòng sau, hoặc `/sale-mlm:cto-reset` worker cũ.
- **Task kẹt ở review** — đọc `.mekong/tasks.json` trường `notes`, xem CTO yêu cầu thêm gì. Sửa xong rồi `/sale-mlm:cto-assign <id>` để verify lại.
- **Muốn làm tay 1 task** — cứ code bằng tay trong Claude Code chat, rồi `node bin/kanban.js update T-XXX done`.

## KPI thành công cho vòng pilot đầu

Theo `.mekong/company.json → okrs[0]`:

> "Q2-2026: Launch Tier 1 training for 50 members, achieve 70% habit completion rate"

Nghĩa là khi T-025 (pilot launch checklist) về `done`, bạn đã sẵn sàng mời 10 Tân Binh vào hệ thống, và Q2 sẽ scale lên 50. CTO đã được brief điều này trong plan.
