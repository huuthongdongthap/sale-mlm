# G0 Pilot — Mockup Data Docs

> **Mục đích:** Tài liệu tham chiếu cho G0 Pilot — sản phẩm, bank details, contacts
> **Lưu ý:** Tất cả dữ liệu dưới đây là MOCKUP để CTO build hệ thống. CEO sẽ replace bằng data thật trước khi go live.
> **Created:** 2026-06-04
> **Gate:** G0 Pre-flight — D1, D2, D4 tài liệu mockup

---

## 1. SẢN PHẨM DROPPII — Product Catalog (D1)

### 1.1 Sản phẩm L1 — Gói Vitamin Gia Đình (Entry Point)

| Field | Value |
|-------|-------|
| **SKU** | `DROP-FAMILY-01` |
| **Tên sản phẩm** | Gói Vitamin Gia Đình Droppii |
| **Giá bán lẻ** | **590.000đ** |
| **Giá nhập (COGS)** | 320.000đ |
| **Margin** | 46% (~270K/sản phẩm) |
| **Phân khúc** | L1 — Trial / Entry point (< 1tr) |
| **Đối tượng** | Gia đình có trẻ nhỏ, người lớn tuổi, người bận rộn cần bổ sung vitamin hàng ngày |
| **Thời gian sử dụng** | 1 tháng/hộp |
| **Số lượng/hộp** | 30 gói x 10g |
| **Hạn sử dụng** | 24 tháng kể từ ngày sản xuất |
| **Bảo quản** | Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp |
| **Xuất xứ** | Việt Nam |
| **Giấy phép** | Giấy xác nhận công bố TPCN số ___ (CEO cung cấp) |

**Thành phần chính (mockup — CEO xác nhận):**
- Vitamin C: 60mg (100% NRV)
- Vitamin D3: 400IU (100% NRV)
- Vitamin B complex: B1 1.4mg, B2 1.6mg, B6 2mg, B12 2.5mcg
- Kẽm: 10mg (100% NRV)
- Sắt: 14mg (100% NRV)
- Canxi: 200mg
- Chiết xuất đông trùng hạ thổ: 100mg
- Chiết xuất collagen peptide: 500mg

**Công dụng (tuân thủ compliance):**
- Bổ sung vitamin và khoáng chất thiết yếu hàng ngày
- Hỗ trợ tăng cường sức đề kháng
- Hỗ trợ năng lượng và sự tỉnh táo
- **⚠️ Lưu ý:** Sản phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh

**Hình ảnh cần có (≥3 ảnh mobile-ready):**
- [ ] Ảnh chính: Hộp sản phẩm + gia đình (lifestyle)
- [ ] Ảnh thành phần: Bảng thành phẩn rõ ràng
- [ ] Ảnh công dụng: Info-graphic 4-5 công dụng chính
- [ ] Ảnh CTA: QR code + thông tin đặt hàng

---

### 1.2 Sản phẩm L2 — Gói Health Active 30 Ngày (Upgrade)

| Field | Value |
|-------|-------|
| **SKU** | `DROP-ACTIVE-30` |
| **Tên sản phẩm** | Health Active 30 Ngày — Gói Nâng Cao |
| **Giá bán lẻ** | **3.500.000đ** |
| **Giá nhập (COGS)** | 1.800.000đ |
| **Margin** | 49% (~1.7M/sản phẩm) |
| **Phân khúc** | L2 — Active buyer (3-5tr, 30-45 ngày) |
| **Đối tượng** | Người đã dùng L1, muốn nâng cấp routine sức khỏe |
| **Thời gian sử dụng** | 30 ngày |
| **Bao gồm:** | Gói L1 + Thực phẩm bổ sung cao cấp (omega-3, probiotic) + App theo dõi habit |

**Bao gồm trong gói:**
- Gói Vitamin Gia Đình (L1) — 1 tháng
- Omega-3 Fish Oil: 60 viên
- Probiotic 10 tỷ CFU: 30 gói
- Ebook "Healthspan Handbook" (50 pages)
- App tracking habit + AI Coach 5 buổi tư vấn

---

### 1.3 Sản phẩm L3 — Combo 90 Ngày Transformation (Premium)

| Field | Value |
|-------|-------|
| **SKU** | `DROP-TRANSFORM-90` |
| **Tên sản phẩm** | Combo Health Transformation 90 Ngày |
| **Giá bán lẻ** | **9.500.000đ** |
| **Giá nhập (COGS)** | 4.500.000đ |
| **Margin** | 53% (~5M/sản phẩm) |
| **Phân khúc** | L3 — Committed buyer (90+ ngày) |
| **Đối tượng** | Người nghiêm túc về sức khỏe, sẵn sàng commit 90 ngày |
| **Thời gian sử dụng** | 90 ngày |

**Bao gồm trong gói:**
- Gói Health Active (L2) × 3 tháng
- Omega-3 Fish Oil × 3 chai
- Probiotic × 3 hộp
- Curcumin Complex: 90 viên
- Vitamin tổng hợp cao cấp: 90 gói
- Ebook "Healthspan Handbook" + "Family Wellness Guide"
- AI Coach 20 buổi tư vấn (1 buổi/tuần)
- Zalo group riêng "Health Active Family"
- Weekly check-in với health advisor

---

### 1.4 Product Matrix Summary

| Tier | SKU | Price | COGS | Margin | Target | Position |
|------|-----|-------|------|--------|--------|----------|
| L0 (Lead Magnet) | `DROP-EBOOK-01` | Free | 0đ | — | 100% leads | AI Coach + Ebook |
| L1 (Entry) | `DROP-FAMILY-01` | 590K | 320K | 46% | Warm network | Trial pack 1 tháng |
| L2 (Active) | `DROP-ACTIVE-30` | 3.5M | 1.8M | 49% | L1 buyers | 30-day program |
| L3 (Premium) | `DROP-TRANSFORM-90` | 9.5M | 4.5M | 53% | L2 buyers | 90-day commitment |
| L4 (Partner) | CTV contract | N/A | N/A | — | L3 evangelists | Become CTV Droppii |

---

## 2. PAYMENT — PAYOS Gateway (D2)

> ⚠️ **MOCKUP** — Thay bằng thông tin thật của CEO trước khi go live

### 2.1 Tổng quan PAYOS

PAYOS là cổng thanh toán Napas 247 — chuyển khoản ngân hàng + QR code, tiền về trực tiếp tài khoản ngân hàng merchant. Không cần hợp đồng phức tạp, tích hợp trong 5 phút.

**Ưu điểm so với Sepay:**
- Miễn phí khởi tạo + duy trì + không giới hạn giao dịch
- Tiền về trực tiếp STK ngân hàng (không cần withdraw)
- Mã QR động đầy đủ thông tin đơn hàng
- Webhook real-time khi có giao dịch thành công
- Open source examples có sẵn

**Tài liệu:** [developers.payos.vn](https://developers.payos.vn/)

### 2.2 Setup PAYOS Merchant

| Bước | Hành động | Ghi chú |
|------|-----------|---------|
| 1 | Đăng ký tài khoản PAYOS | payos.vn → Đăng ký |
| 2 | Xác thực thông tin doanh nghiệp | CCCD/GPKD |
| 3 | Thêm ngân hàng nhận tiền | STK do CEO cung cấp |
| 4 | Lấy API credentials | Client ID, Client Secret, API Key |
| 5 | Cấu hình webhook URL | `https://[domain]/api/payments/payos-webhook` |

**PAYOS Credentials (mockup):**

| Field | Mockup Value |
|-------|-------------|
| **Client ID** | `CLIENT_ID_PLACEHOLDER` |
| **Client Secret** | `CLIENT_SECRET_PLACEHOLDER` |
| **API Key** | `API_KEY_PLACEHOLDER` |
| **Merchant Account** | `MERCHANT_CODE_PLACEHOLDER` |
| **Callback URL** | `https://app.hivewarfare.vn/api/payments/payos-webhook` |
| **Return URL** | `https://app.hivewarfare.vn/payment/success` |
| **Cancel URL** | `https://app.hivewarfare.vn/payment/cancel` |

### 2.3 PAYOS API Flow — Tạo Payment Link

**Endpoint:** `POST https://api-merchant.payos.vn/v2/payment-requests`

**Request:**
```json
{
  "orderCode": "DROP-20260604-001",
  "amount": 590000,
  "description": "Gói Vitamin Gia Đình Droppii - Đơn hàng #001",
  "returnUrl": "https://app.hivewarfare.vn/payment/success?orderCode={orderCode}",
  "cancelUrl": "https://app.hivewarfare.vn/payment/cancel?orderCode={orderCode}",
  "items": [
    {
      "name": "Gói Vitamin Gia Đình",
      "quantity": 1,
      "price": 590000
    }
  ],
  "expiredAt": 1749052800,
  "signature": "<HMAC_SHA256_signature>"
}
```

**Response:**
```json
{
  "orderCode": "DROP-20260604-001",
  "checkoutUrl": "https://pay.payos.vn/web/checkout/...",
  "qrCode": "https://qr.sepay.vn/img/...",
  "status": "PENDING"
}
```

**Flow:**
```
Customer chọn sản phẩm
       │
       ▼
Server tạo PAYOS payment link (POST /v2/payment-requests)
       │
       ▼
Customer redirect → PAYOS checkout page
       │
       ├── Option A: Quét QR code (Napas app) → tự động điền amount
       ├── Option B: Internet Banking → nhập thông tin
       └── Option C: Ví điện tử (MoMo, ZaloPay) nếu enabled
       │
       ▼
Customer xác nhận thanh toán
       │
       ▼
PAYOS webhook → POST /api/payments/payos-webhook (real-time)
       │
       ▼
Server verify signature → update order status → notify customer + CTV
```

### 2.4 Webhook Handler

**Endpoint:** `POST /api/payments/payos-webhook`

**Webhook body (PAYOS sends):**
```json
{
  "event": "PAYMENT_SUCCESS",
  "data": {
    "orderCode": "DROP-20260604-001",
    "amount": 590000,
    "description": "Gói Vitamin Gia Đình Droppii",
    "reference": "NAPAS_REF_123456789",
    "paidAt": "2026-06-04T10:30:00+07:00",
    "signature": "<HMAC_SHA256>"
  }
}
```

**Webhook handler logic:**
```js
// 1. Verify signature (HMAC-SHA256)
const crypto = require('crypto');
const sign = crypto.createHmac('sha256', CLIENT_SECRET)
  .update(JSON.stringify(payload.data))
  .digest('hex');

if (sign !== payload.data.signature) {
  return 401; // Invalid signature → reject
}

// 2. Idempotent check (PAYOS may retry)
const existing = await db.getOrderByCode(payload.data.orderCode);
if (existing?.status === 'PAID') {
  return 200; // Already processed → ack, no action
}

// 3. Update order
await db.updateOrder(payload.data.orderCode, {
  status: 'PAID',
  paid_at: payload.data.paidAt,
  payment_ref: payload.data.reference,
  amount: payload.data.amount
});

// 4. Notify customer + CTV
await notifyCustomer(order);
await notifyCTV(order);
```

### 2.5 Signature Verification

**PAYOS dùng HMAC-SHA256 để verify webhook authenticity:**

```js
function verifyPayOSSignature(data, signature, clientSecret) {
  const expected = crypto
    .createHmac('sha256', clientSecret)
    .update(JSON.stringify(data))
    .digest('hex');
  return expected === signature;
}
```

**⚠️ BẮT BUỘC:** Luôn verify signature trước khi xử lý. Không tin webhook body chưa verify.

### 2.6 Đơn giá theo SKU (PAYOS)

| SKU | Amount (VND) | Description |
|-----|-------------|-------------|
| `DROP-FAMILY-01` | 590,000 | Gói Vitamin Gia Đình — 1 tháng |
| `DROP-ACTIVE-30` | 3,500,000 | Health Active 30 Ngày |
| `DROP-TRANSFORM-90` | 9,500,000 | Combo 90 Ngày Transformation |
| `DROP-EBOOK-01` | 0 | Free ebook (no PAYOS link needed) |

### 2.7 Order Management

**Order status flow:**
```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
                ↓
              FAILED (timeout/cancel)
              EXPIRED (>24h unpaid)
```

**Order record (D1):**
```sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_zalo TEXT,
  sku TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',
  payment_ref TEXT,
  payos_order_code TEXT,
  paid_at TEXT,
  ctv_id TEXT,
  source TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### 2.8 Xác nhận thanh toán (cho customer)

**Template — Thanh toán thành công (auto-send qua Zalo DM + email):**
```
Chào [tên]! 🎉

Cảm ơn chị đã đặt [Tên SP]! Đơn hàng đã được xác nhận thanh toán.

📦 Chi tiết đơn hàng:
- Mã đơn: [ORDER-XXXX]
- Sản phẩm: [Tên SP]
- Số tiền: [X] triệu đồng
- Thanh toán: ✅ Đã xác nhận bởi PAYOS

🚚 Thông tin giao hàng:
- CTV sẽ liên hệ xác nhận địa chỉ trong vòng 24h
- Thời gian giao hàng dự kiến: 2-3 ngày làm việc

📞 Liên hệ hỗ trợ:
- CTV: [Tên CTV] — [Zalo]
- Hotline: [SĐT]

Em cảm ơn chị tin tưởng! 
Đội ngũ Droppii 🌿
```

**Template — Đơn hàng chờ thanh toán:**
```
Chào [tên]! 

Đơn hàng [Tên SP] của chị đang chờ thanh toán.

💳 Thanh toán:
- Số tiền: [X] triệu đồng
- Link thanh toán: [PAYOS checkout URL]
- Hạn thanh toán: 24h

Sau khi thanh toán, chị sẽ nhận được xác nhận tự động.
Nếu có vấn đề, nhắn em bất cứ lúc nào nha!

Em cảm ơn,
Đội ngũ Droppii 🌿
```

### 2.9 Chiến lược thanh toán

| Giai đoạn | Phương thức | Lý do |
|-----------|-------------|-------|
| G3 Soft launch (10 friends) | Chuyển khoản thủ công (STK cũ) | Test nhanh, không cần API |
| G4 Wave 1 (50 contacts) | PAYOS payment link | Tự động, chuyên nghiệp |
| G5+ Scale | PAYOS + Zalo Mini App | Tích hợp đầy đủ |

**Lý do chọn PAYOS:**
- Miễn phí — không tốn phí giao dịch
- Về thẳng STK ngân hàng — không cần withdraw
- QR code động — customer quét là đủ
- Webhook real-time — order confirm ngay khi thanh toán
- Tích hợp đơn giản — 5 phút setup

---

## 3. 50 CONTACTS — Warm Network List (D4)

> ⚠️ **MOCKUP** — CEO replace bằng danh bạ thật. Format: Tên | Zalo | Nhóm | Ghi chú

### 3.1 Nhóm 1: Friend/Family Pilot (10 người)

| # | Tên | Zalo | Mối quan hệ | Độ sẵn sàng | Ghi chú |
|---|-----|------|------------|-------------|---------|
| 1 | [Name] | 09xx.xxx.001 | Bạn thân college | ⭐⭐⭐⭐⭐ | Đã dùng sản phẩm trước |
| 2 | [Name] | 09xx.xxx.002 | Chị em họ | ⭐⭐⭐⭐ | Có con nhỏ, đúng target |
| 3 | [Name] | 09xx.xxx.003 | Bạn cùng phòng gym | ⭐⭐⭐⭐⭐ | Quan tâm sức khỏe |
| 4 | [Name] | 09xx.xxx.004 | Anh họ | ⭐⭐⭐ | Có uống TPCN rồi |
| 5 | [Name] | 09xx.xxx.005 | Bạn thân cấp 3 | ⭐⭐⭐⭐ | Đang tìm thêm thu nhập |
| 6 | [Name] | 09xx.xxx.006 | Chị đồng nghiệp | ⭐⭐⭐⭐⭐ | Phụ nữ U40, quản lý gia đình |
| 7 | [Name] | 09xx.xxx.007 | Bạn bè FB | ⭐⭐⭐ | Theo dõi page Droppii |
| 8 | [Name] | 09xx.xxx.008 | Cô ruột | ⭐⭐⭐⭐ | Quan tâm sức khỏe người lớn |
| 9 | [Name] | 09xx.xxx.009 | Bạn thân | ⭐⭐⭐⭐⭐ | Test luôn cho các dự án |
| 10 | [Name] | 09xx.xxx.010 | Anh rể | ⭐⭐⭐ | Có thể thử L1 |

**Pilot criteria:** Chọn 7/10 người này cho soft launch (G3). Ưu tiên ⭐⭐⭐⭐⭐ trước.

### 3.2 Nhóm 2: Khách cũ Droppii (20 người)

| # | Tên | Zalo | Lịch sử mua | Lần cuối mua | Đề xuất |
|---|-----|------|-------------|---------------|---------|
| 1 | [Name] | 09xx.xxx.011 | 3 đơn | 2 tháng trước | Upsell L2 |
| 2 | [Name] | 09xx.xxx.012 | 5 đơn | 1 tháng trước | Upsell L2 |
| 3 | [Name] | 09xx.xxx.013 | 1 đơn | 4 tháng trước | Re-activate L1 |
| 4 | [Name] | 09xx.xxx.014 | 2 đơn | 3 tháng trước | Re-activate L1 |
| 5 | [Name] | 09xx.xxx.015 | 4 đơn | 2 tuần trước | Upsell L2 |
| 6-20 | ... | ... | ... | ... | ... |

**Pilot criteria:** Chọn 15/20 người cho Wave 1 (G4). Ưu tiên: mua gần đây, mua nhiều lần.

### 3.3 Nhóm 3: CTV Tin tưởng (20 người)

| # | Tên | Zalo | Cap | Số đơn | Ghi chú |
|---|-----|------|-----|--------|---------|
| 1 | [Name] | 09xx.xxx.031 | M4 | 8 | Leader tiềm năng |
| 2 | [Name] | 09xx.xxx.032 | M3 | 5 | Active, có thể recruit |
| 3 | [Name] | 09xx.xxx.033 | M2 | 3 | Mới nhưng năng động |
| 4-20 | ... | ... | ... | ... | ... |

**Pilot criteria:** Chọn 15/20 người cho Wave 2 (G5). Mục tiêu: recruit 3-5 CTV mới từ group này.

---

## 4. CONTENT TEMPLATES (D3)

### 4.1 Tone Guide Droppii

**Brand voice:** "Chị em thân tình" — friendly, knowledgeable, NOT pushy

**Xưng hô:**
- CTV → Khách: "Em" / "chị" (tùy tuổi)
- Khách → CTV: "em" / "chị" (phù hợp)
- Tránh: "anh/chị mua đi", "em đảm bảo", "không mua là thiệt"

**Từ nên dùng:**
- "Hỗ trợ", "bổ sung", "routine", "thói quen", "chủ động"
- "Sống khỏe", "healthspan", "chăm sóc gia đình"
- "Em thấy chị có thể...", "Nếu chị muốn thử...", "Em gửi thông tin..."

**Từ KHÔNG dùng:**
- ❌ "Trị bệnh", "chữa khỏi", "điều trị", "thuốc"
- ❌ "Đảm bảo", "chắc chắn", "100% hiệu quả"
- ❌ "Mua ngay", "số lượng có hạn", "không mua là lỗ"
- ❌ Cam kết thu nhập, "kiếm X triệu/tháng"

**Compliance:**
- Luôn kèm disclaimer TPCN khi nói về sản phẩm
- Dùng "hỗ trợ" thay vì "trị/chữa"
- Medicine 3.0 framing: chủ động, phòng ngừa, healthspan

### 4.2 DM Templates

**Template 1 — Warm reach (Friend/Family)**
```
Chào [tên]! Lâu quá không chat, em vừa bắt đầu
một dự án mới về sức khỏe gia đình với Droppii.
Em tìm được gói vitamin bổ sung cho cả nhà khá hay,
giá mềm 590k/hộp 1 tháng. 

Nếu [tên] muốn thử em có thể gửi thông tin?
Không áp lực gì đâu ạ, chỉ muốn chia sẻ thôi 😊
```

**Template 2 — Reactivate old customer**
```
Chào chị [tên]! Em nhớ chị đã mua sản phẩm
Droppii cách đây [X] tháng rồi. 

Droppii vừa ra gói mới cho cả gia đình, giá 590k.
Nếu chị muốn thử em tư vấn riêng nha?
```

**Template 3 — CTV recruitment**
```
Chào [tên]! Em đang mở rộng team Droppii ở khu vực
[tên]. Bạn thấy Droppii như một cơ hội kinh doanh
bên cạnh công việc chính.

Nếu bạn quan tâm, em có thể chia sẻ thêm.
Không cần bỏ công việc hiện tại, chỉ cần 1-2h/ngày.
```

### 4.3 Disclaimer y tế chuẩn (D5)

```
⚠️ THÔNG BÁO QUAN TRỌNG

Sản phẩm này là THỰC PHẨM CHỨC NĂNG, không phải thuốc.
Sản phẩm không có tác dụng thay thế thuốc chữa bệnh.
Không sử dụng cho người dị ứng với bất kỳ thành phần nào.
Phụ nữ có thai và cho con bú nên tham khảo ý kiến bác sĩ.

Công dụng: Hỗ trợ bổ sung vitamin và khoáng chất,
tăng cường sức đề kháng, bổ sung năng lượng.

Thông tin trên không nhằm mục đích chẩn đoán, 
trị, chữa hoặc ngăn ngừa bất kỳ bệnh nào.
```

---

## 5. PILOT EXECUTION CHECKLIST

### G0 Pre-flight (Before ANY outreach)

- [ ] Q1: Budget 1.5tr approved + transferred
- [ ] Q2: SKU L1 confirmed (590K) + Bank details set up
- [ ] Q3: 35-40h locked in calendar for 4 weeks
- [ ] D1: Product photos (≥3) + description + COGS confirmed
- [ ] D2: Bank account active + QR code generated + tested
- [ ] D3: Tone guide reviewed + DM templates customized
- [ ] D4: 50 contacts loaded into Zalo DM sequence
- [ ] D5: Disclaimer TPCN approved by CEO

### G1 Foundation (Day 1-7)

- [ ] Cloudflare Pages + D1 deployed
- [ ] Landing page `/quiz/healthspan-gia-dinh` live
- [ ] Quiz 5 câu (DISC + pain) working
- [ ] Lead capture → D1 insert
- [ ] Zalo group join link working
- [ ] Admin dashboard showing real-time leads
- [ ] Email thank-you via Resend (with ebook)

### G2 AI Coach (Day 8-14)

- [ ] `/coach/[id]` UI deployed
- [ ] Claude Haiku integration live
- [ ] System prompt v1 deployed (Medicine 3.0)
- [ ] `score_session()` working
- [ ] Guardrail regex blocking "trị/chữa/khỏi"
- [ ] 10 test sessions + tone review (≥7/10 pass)
- [ ] Disclaimer auto-injection working

### G3 Soft Launch (Day 15-17)

- [ ] 10 friend/family contacted
- [ ] ≥7 complete quiz
- [ ] ≥5 complete AI Coach session (≥5 min)
- [ ] Feedback collected

### G4 Wave 1 (Day 18-21)

- [ ] 50 contacts (20 old customers + 30 CTV)
- [ ] ≥3 orders from 50 contacts
- [ ] Payment flow tested end-to-end

### G5 Wave 2 (Day 22-25)

- [ ] Remaining 20 CTV contacted
- [ ] ≥7 total orders (cumulative)

### G6 Demo Day (Day 28)

- [ ] ≥3/5 KPIs met
- [ ] Decision: Phase 2 go / pivot / stop

---

## 6. ZALO OA SETUP (Prerequisite)

### 6.1 Tài khoản cần có

| Tài khoản | Mục đích | Trạng thái |
|-----------|---------|-----------|
| Zalo OA Official Account | Gửi tin nhắn khách hàng (24h window) | ⬜ Cần setup |
| Zalo Mini App (optional) | Quiz/AI Coach trong Zalo | ⬜ Phase 2 |
| PAYOS API | Payment gateway + webhook | ⬜ Cần setup |
| Resend API | Email thank-you + ebook | ⬜ Cần setup |

### 6.2 Zalo DM Sequence (zalo-auto-sales)

```
Day 0:  Warm intro (Template 1)
Day 1:  Follow-up if no reply
Day 3:  Value content (Medicine 3.0 tip)
Day 5:  CTA — try AI Coach quiz
Day 7:  Soft follow-up
Day 10: L1 offer (590K) — limited time
Day 14: Final nudge
```

Sequence engine: `zalo-auto-sales/src/sequence-engine.ts`
Template engine: `zalo-auto-sales/src/template-engine.ts`

---

## 7. SUCCESS METRICS

### Phase 1 Targets (4 tuần)

| Metric | Target | Pass criteria |
|--------|--------|---------------|
| Quiz completions | 100-150 | ≥100 warm leads |
| AI Coach sessions | 30-50 | ≥50% of leads |
| L1 orders | 4-8 | ≥4 đơn 590K |
| L2 orders | 1-2 | Nice to have |
| CAC L1 | ≤ 250K | Revenue / orders |
| Revenue | 2.5-5tr | 4-8 × 590K |
| Net (after cost 1.5tr) | +1-3.5tr | Cash positive |

### Cohort Targets

| Cohort | Size | Conversion Target |
|--------|------|-------------------|
| Friend/Family (G3) | 10 | ≥70% quiz, ≥50% session |
| Old Customers (G4) | 50 | ≥6% L1 purchase |
| CTV (G5) | 20 | ≥3 CTV signups |

---

## 8. ARCHITECTURE CHECKLIST

### Backend (SALE MLM Worker)

- [ ] `wrangler.toml` — D1 binding active ✅
- [ ] `migrations/0001_initial_schema.sql` — Applied ✅
- [ ] `src/db/adapter.js` — D1 queries wired ✅
- [ ] `src/workers/index.js` — Routes: /auth/login, /api/members, /api/habits/checkin, /api/kpi/:id, /api/training/progress ✅
- [ ] Secrets: `JWT_SECRET`, `PASSWORD_SALT`, `ALLOWED_ORIGIN`, `ADMIN_TOKEN` — Need `wrangler secret put`

### Funnel (zalo-auto-sales Worker)

- [ ] `zalo-auto-sales/wrangler.toml` — Config ready
- [ ] `zalo-auto-sales/src/index.ts` — Main entry
- [ ] `zalo-auto-sales/src/sequence-engine.ts` — DM sequences
- [ ] `zalo-auto-sales/src/template-engine.ts` — Message templates
- [ ] `zalo-auto-sales/src/token-manager.ts` — Zalo OAuth
- [ ] `zalo-auto-sales/src/human-sender.ts` — Human-in-the-loop
- [ ] D1 database: `zalo-auto-sales` (cb0ca817) — Need migration
- [ ] Cron trigger: `*/1 * * * *` — Every 1 minute

### Frontend (Vite Dashboard)

- [ ] Landing page: `/quiz/healthspan-gia-dinh`
- [ ] Quiz component: 5 questions (DISC + pain)
- [ ] AI Coach: `/coach/[id]` with SSE streaming
- [ ] Admin dashboard: Real-time lead view

---

*This document is the single source of truth for G0 Pilot data. CEO replaces mockup values with real data before go-live.*
