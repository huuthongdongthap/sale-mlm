# G0 Pilot — CEO Decisions (Formal Record)

> **Gate:** G0 Pre-flight — 3 quyết định CEO
> **Date:** 2026-06-04
> **Status:** ✅ DECIDED — Gate PASS

---

## Q1: Budget Approval

**Decision:** Approve **Tier 1 — Ultra Lean @ ~1,5tr VND**

| Hạng mục | Số tiền | Ghi chú |
|---|---|---|
| Claude API (Haiku) — 100-150 sessions | 700K | 🔴 Bắt buộc |
| Sản phẩm L1 prototype (in nhãn, ship hậu cần) | 300K | 🟡 Nếu chưa có sẵn |
| Buffer Claude overage (Sonnet fallback) | 200K | 🟡 |
| Phí giao hành pilot (5-10 đơn đầu J&T/GHN) | 200K | 🟡 |
| Misc (QR code, banner Zalo group) | 100K | 🟢 |
| **TỔNG** | **~1.500.000đ** | |

**Rejected tiers:**
- T2 Organic + Mini Ads (~3tr) — Không cần ở Phase 1, proof trước đã
- T3 Lean 5M (~5tr) — Over-kill cho warm network test
- Full plan (~38tr) — Phase 2+ consideration only

**Rationale:** 1,5tr = bằng 1 bữa cao cấp hoặc 1 tài khoản Claude Pro. Risk gần zero. Expected revenue 4-8 đơn × 590K = 2,5-5tr → cash-positive ngay Phase 1.

---

## Q2: SKU + Payment

**Decision:**

- **SKU L1:** Gói vitamin gia đình — ~**590K VND** (đề xuất từ leader Droppii)
- **Payment:** Chuyển khoản ngân hàng (STK do CEO cung cấp trong D2)
- **QR Code:** Từ STK ngân hàng — CEO cung cấp trong D2

**Positioning:**
- Medicine 3.0 framing: "chăm sóc sức khỏe chủ động", "kéo dài healthspan"
- Target buyer: Phụ nữ 28-50, người quản lý sức khỏe gia đình
- Compliance: NO disease cure claims, NO income guarantees
- Language: "chị-em thân tình" tone, Droppii brand voice

**COGS cần xác nhận:** CEO cung cấp cost breakdown cho 590K SKU

---

## Q3: Time Commitment

**Decision:** Dành **35-40 giờ ops trong 4 tuần** (~1,5 giờ/ngày)

| Tuần | Giờ ước tính | Nội dung |
|---|---|---|
| Tuần 1 | ~5h | Cung cấp D1-D5 + review landing copy + test E2E |
| Tuần 2 | ~6h | QA 10 session AI Coach — quan trọng nhất |
| Tuần 3 | ~3h | Soft launch 10 friends + follow-up |
| Tuần 4 | ~3h | Wave 1 outreach 50 contacts + demo day prep |
| Buffer | ~5h | Bug fix, feedback, adjustments |
| **TỔNG** | **~22h direct + ~15h monitoring** | **~37h** |

**Condition:** Lịch 4 tuần sạch, không trùng đi công tác. Nếu có conflict → extend 1 tuần.

---

## 5 Tài Liệu CEO — Delivery Checklist

- [ ] **D1:** Ảnh sản phẩm L1 (≥3 ảnh, mobile-ready) + mô tả 200 từ + COGS
- [ ] **D2:** STK ngân hàng + tên người nhận + QR code chuyển khoản
- [ ] **D3:** Tone guide Droppii 1 trang (xưng hô, từ vựng nên/không dùng)
- [ ] **D4:** List 50 contacts — 10 friend/family, 20 khách cũ, 20 CTV tin tưởng
- [ ] **D5:** Disclaimer y tế chuẩn Droppii (compliance TPCN)

---

## G0 Gate Result

| Item | Required | Status |
|---|---|---|
| Q1 Approve CAPEX 1,5tr | ✅ Bank transfer commit | **DECIDED** |
| Q2 SKU + STK | ✅ Có sẵn + COGS cần xác nhận | **DECIDED** — details in D2 |
| Q3 Confirm 35-40h | ✅ Lịch 4 tuần | **DECIDED** |
| D1-D5 (5 tài liệu) | ✅ All 5 | **PENDING DELIVERY** |

**Overall G0: ✅ PASS** — Decisions made. Execution blocked only by D1-D5 document delivery from CEO.

---

## Next Step

CTO có thể bắt đầu **Stage 1 — Foundation (Ngày 1-7)** ngay khi nhận đủ D1-D5 từ CEO.

| Day | Task | Output |
|---|---|---|
| 1 | Setup repo + Cloudflare Pages + D1 | Hello world deployed |
| 2 | D1 schema 5 bảng + seed | migrate.sql chạy thành công |
| 3 | Landing page `/quiz/healthspan-gia-dinh` | Mobile responsive |
| 4 | Quiz 5 câu DISC + pain | Form submit lưu D1 |
| 5 | Lead capture + Zalo group join | Full flow lead-in works |
| 6 | Admin dashboard 1 trang | Real-time refresh 5p |
| 7 | Email auto thank-you qua Resend | Email delivered trong 60s |
