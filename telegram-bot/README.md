# 📱 TELEGRAM MINI-APP — ZERO INSTALL UX

## 🎯 Mục Tiêu
- **Zero install**: Không cần tải app, truy cập trực tiếp qua Telegram
- **Giant UI**: Nút bấm khổng lồ (48px+), font 16pt+, dễ dùng cho cô chú trung niên
- **One-click action**: Báo cáo thói quen chỉ bằng 1 nút bấm

## 🏗️ Kiến Trúc

```
telegram-bot/
├── bot.js                 # Main Telegram bot logic
├── giant-ui/
│   ├── components/        # UI components với kích thước lớn
│   ├── static/            # Assets tĩnh
│   └── index.html         # Giao diện web app
├── habit-tracker/
│   ├── checkin.js         # Logic check-in thói quen
│   └── scoring.js         # Tính điểm thói quen
├── onboarding/
│   ├── drip-flow.js       # Flow onboarding 28 ngày
│   └── welcome-messages/  # Tin nhắn chào mừng
└── alerts/
    ├── monitor.js         # Giám sát member
    └── notify.js          # Gửi thông báo
```

## 🎨 Giant UI Principles
- **Font Size**: Minimum 16pt cho toàn bộ text
- **Button Size**: Minimum 48px touch target
- **Contrast**: High contrast colors (AA standard)
- **Voice Input**: Hỗ trợ báo cáo bằng giọng nói

## 🔗 Integration Points
- Connect với hệ thống điểm số Hive Warfare OS
- Tích hợp với Telegram Bot API
- Đồng bộ dữ liệu với dashboard chính