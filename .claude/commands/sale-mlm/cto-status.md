---
description: "Trạng thái kanban hiện tại: số task theo status, critical path, đang kẹt ở đâu"
allowed-tools: Read, Bash
---

# /sale-mlm:cto-status — Xem trạng thái CTO

Đọc `.mekong/tasks.json` và in báo cáo ngắn (không dispatch gì cả):

1. **Summary line**: `todo: X | in_progress: Y | review: Z | done: D | blocked: B  (Σ 25)`
2. **Bảng theo epic** (E1 → E11): done/total, % hoàn thành.
3. **Ready next** — task đã mở khóa nhưng vẫn `todo`, sort theo critical-path priority, top 5.
4. **Blocked list** — task status=blocked + lý do (từ trường `notes` hoặc `events[]`).
5. **Estimated time remaining** — tổng `estimate_min` của task chưa done, chia cho max_parallel.

Chạy:
```bash
node bin/kanban.js list --verbose
```

Sau đó phân tích output và trình bày ngắn gọn. KHÔNG gọi Task tool, KHÔNG sửa gì.
