---
description: "Force-dispatch một task cụ thể bất kể blockedBy (dùng khi CTO main loop không pick đúng)"
argument-hint: "<task-id>"
allowed-tools: Read, Write, Bash, Task
---

# /sale-mlm:cto-assign — Giao thủ công task

Tham số: $ARGUMENTS  (ví dụ `T-007`).

Các bước:

1. Đọc `.mekong/tasks.json`, tìm task theo id.
2. Nếu không tồn tại → báo lỗi, dừng.
3. Nếu status đã là `done` → hỏi user có chắc muốn re-run không.
4. Nếu có `blockedBy` chưa done, cảnh báo nhưng vẫn cho phép (user đã chủ động).
5. Đổi status `in_progress` + ghi `events[]` với actor `manual-assign`.
6. Gọi Task tool với prompt từ `.claude/agents/sale-mlm-worker.md` + toàn bộ task context.
7. Chờ worker xong, verify, cập nhật status như CTO chính.
8. In kết quả.

Không lặp vòng — chỉ chạy cho 1 task này rồi dừng.
