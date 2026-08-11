---
description: "Reset một task về todo (xóa evidence, status=todo) để làm lại từ đầu"
argument-hint: "<task-id> [--hard]"
allowed-tools: Read, Bash
---

# /sale-mlm:cto-reset — Reset task về todo

Tham số: $ARGUMENTS

Hành vi:

1. Đọc tasks.json, xác định task.
2. Hỏi xác nhận user ("Xác nhận reset <id> — mọi evidence trong kanban sẽ bị clear?").
3. Nếu user đồng ý:
   - Set `status = "todo"`
   - Xóa `notes`, `evidence_paths`, `files_changed` (nếu có)
   - Ghi event: `{"ts": "<iso>", "actor": "manual-reset", "from": "<old>", "to": "todo"}`
4. Nếu `--hard` có trong argument: cũng revert file changes liên quan trong git (`git checkout -- <paths>`). Cảnh báo kỹ trước khi chạy.
5. KHÔNG xóa file nào ngoài phạm vi task đã ghi.

Sau đó in task state sau reset.
