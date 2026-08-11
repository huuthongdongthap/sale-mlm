/**
 * Funnel Metrics View
 * Displays 5-tier funnel conversion metrics and revenue breakdown
 * Consumes: GET /api/analytics/funnel
 */

class FunnelView {
  constructor() {
    this.apiBase = window.location.origin || location.origin;
    this.metrics = null;
  }

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Funnel OS Analytics</h1>
        <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu funnel...</p>
      </div>
    `;

    await this.loadMetrics(container);
  }

  async loadMetrics(container) {
    try {
      const response = await fetch(`${this.apiBase}/api/analytics/funnel`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      this.metrics = await response.json();
      this.renderMetrics(container);
    } catch (error) {
      container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">Funnel OS Analytics</h1>
          <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
        </div>
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải dữ liệu</h3>
          <p>Không thể kết nối API: ${error.message}</p>
          <button onclick="location.reload()" style="
            background: var(--brand-gold);
            color: var(--surface-primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">Thử lại</button>
        </div>
      `;
    }
  }

  renderMetrics(container) {
    const counts = this.metrics.counts || [];
    const rates = this.metrics.rates || [];
    const revenue = this.metrics.revenue || [];

    const tierLabels = ['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'];
    const tierColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    const tierIcons = ['🧲', '🎁', '💚', '🎯', '🤝'];

    const totalLeads = counts.reduce((sum, c) => sum + (c.count || 0), 0);

    let funnelViz = '';
    if (counts.length > 0) {
      const maxCount = Math.max(...counts.map(c => c.count || 0), 1);
      funnelViz = `
        <div class="funnel-visualization">
          ${counts.map((c, i) => {
            const count = c.count || 0;
            const widthPercent = maxCount > 0 ? Math.max((count / maxCount) * 100, 5) : 5;
            const rate = rates[i] ? rates[i].conversion_rate : null;
            return `
              <div class="funnel-tier" style="
                width: ${widthPercent}%;
                background: linear-gradient(135deg, ${tierColors[i]}, ${tierColors[i]}88);
                margin: 0 auto;
                padding: 1.5rem;
                border-radius: 8px;
                color: white;
                text-align: center;
                transition: all 0.3s ease;
                min-width: 200px;
              ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${tierIcons[i]}</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${count}</div>
                <div style="font-size: 0.875rem; opacity: 0.9;">${tierLabels[i]}</div>
                ${rate !== null ? `<div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">${rate}% conversion</div>` : ''}
              </div>
            `;
          }).join('<div style="text-align: center; padding: 0.5rem; color: var(--text-secondary);">↓</div>')}
        </div>
      `;
    }

    let revenueTable = '';
    if (revenue.length > 0) {
      revenueTable = `
        <h3 style="margin-top: 2rem;">Doanh thu theo tier</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Tier</th><th>Tên</th><th>Số đơn</th><th>Tổng doanh thu</th></tr>
            </thead>
            <tbody>
              ${revenue.map(r => `
                <tr>
                  <td><span class="tier-badge tier-${r.tier || 0}">Tier ${r.tier || 0}</span></td>
                  <td>${r.tier_name || 'N/A'}</td>
                  <td>${r.order_count || 0}</td>
                  <td><strong>${this.formatVND(r.revenue)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Funnel OS Analytics</h1>
        <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
      </div>

      <div class="card">
        <h3 class="card-title">📊 Tổng quan Funnel</h3>
        <p style="margin-bottom: 1rem;">Tổng số leads: <strong>${totalLeads}</strong></p>
        ${funnelViz}
      </div>

      ${rates.length > 0 ? `
        <div class="card" style="margin-top: 1.5rem;">
          <h3 class="card-title">📈 Tỷ lệ chuyển đổi</h3>
          <div class="dashboard-grid">
            ${rates.map((r, i) => `
              <div class="conversion-card" style="
                background: linear-gradient(135deg, ${tierColors[i]}15, ${tierColors[i]}05);
                border-left: 4px solid ${tierColors[i]};
                padding: 1rem;
                border-radius: 8px;
              ">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${tierLabels[i]}</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: ${tierColors[i]};">
                  ${r.conversion_rate || 0}%
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  ${r.from_count || 0} → ${r.to_count || 0}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${revenueTable}

      <div class="card" style="margin-top: 1.5rem;">
       

 <div class="card" style="margin-top: 1.5rem;">
 <h3 class="card-title">⚡ Hành động leader</h3>
 <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
 <button id="funnel-action-transition" class="btn-primary" disabled>Chuyển tier</button>
 <button id="funnel-action-create-order" class="btn-primary">Tạo đơn</button>
 <button id="funnel-action-mark-paid" class="btn-primary" disabled>Xác nhận thanh toán</button>
 </div>
 <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Chọn 1 lead từ bảng Funnel trước khi chuyển tier hoặc đánh dấu thanh toán.</p>
 </div>

 <h3 class="card-title">ℹ️ Thông tin hệ thống</h3>
        <p style="color: var(--text-secondary);">
          Funnel OS theo mô hình 5-tier: Lead Magnet (L0) → Trial (L1) → Health Active (L2) → Combo (L3) → CTV Partner (L4).
          Mỗi level có sản phẩm và giá trị riêng, tạo thành hệ thống chuyển đổi tự động.
        </p>
      </div>
    `;
  }

  setupActionButtons() {
 const token = this.getAuthToken();
 if (!token) return;

 this.selectedLeadId = null;
 this.selectedOrderId = null;

 const transitionBtn = document.getElementById('funnel-action-transition');
 const createBtn = document.getElementById('funnel-action-create-order');
 const markPaidBtn = document.getElementById('funnel-action-mark-paid');

 if (transitionBtn) {
   transitionBtn.onclick = async () => {
     if (!this.selectedLeadId) {
       alert('Chọn 1 lead từ bảng Funnel trước khi chuyển tier.');
       return;
     }
     const nextLevel = prompt('Nhập level mới (0-4):\n0=Lead Magnet, 1=Trial, 2=Health Active, 3=Combo, 4=CTV Partner');
     if (nextLevel === null) return;
     const toLevel = parseInt(nextLevel, 10);
     if (!Number.isInteger(toLevel) || toLevel < 0 || toLevel > 4) {
       alert('Level không hợp lệ. Nhập số 0-4.');
       return;
     }
     try {
       const res = await fetch(`${this.apiBase}/api/leads/${this.selectedLeadId}/transition`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({ toLevel, actorId: 'leader-ui' }),
       });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       alert(`Đã chuyển tier thành công! New level: ${data.lead.funnelLevel}`);
       this.loadMetrics(document.getElementById('page-content') || document.body);
     } catch (err) {
       alert('Lỗi chuyển tier: ' + err.message);
     }
   };
 }

 if (createBtn) {
   createBtn.onclick = async () => {
     const leadName = prompt('Tên lead:');
     if (leadName === null) return;
     const productName = prompt('Tên sản phẩm:');
     if (productName === null) return;
     const tierStr = prompt('Product tier (0-4):');
     if (tierStr === null) return;
     const productTier = parseInt(tierStr, 10);
     const priceStr = prompt('Đơn giá VND:');
     if (priceStr === null) return;
     const unitPriceVND = parseInt(priceStr, 10);
     try {
       const res = await fetch(`${this.apiBase}/api/orders`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           leadName,
           productName,
           productTier,
           quantity: 1,
           unitPriceVND,
           commissionRate: productTier >= 4 ? 25 : productTier >= 3 ? 20 : productTier >= 2 ? 15 : 10,
           paymentMethod: 'cod',
         }),
       });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       alert(`Đã tạo đơn #${data.order.id}! Tổng: ${this.formatVND(data.order.totalVND)}`);
       this.loadMetrics(document.getElementById('page-content') || document.body);
     } catch (err) {
       alert('Lỗi tạo đơn: ' + err.message);
     }
   };
 }

 if (markPaidBtn) {
   markPaidBtn.onclick = async () => {
     if (!this.selectedOrderId) {
       alert('Chọn 1 đơn hàng từ bảng đơn hàng trước khi xác nhận thanh toán.');
       return;
     }
     const ref = prompt('Mã thanh toán (paymentReference):');
     if (ref === null) return;
     try {
       const res = await fetch(`${this.apiBase}/api/orders/mark-paid`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({ orderId: this.selectedOrderId, paymentReference: ref, paymentMethod: 'cod' }),
       });
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       alert(`Đã xác nhận thanh toán! Đơn #${data.order.id} - Trạng thái: ${data.order.paymentStatus}`);
       this.loadMetrics(document.getElementById('page-content') || document.body);
     } catch (err) {
       alert('Lỗi xác nhận thanh toán: ' + err.message);
     }
   };
 }
}

formatVND(value) {
    if (!value || value === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  }

  getAuthToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default FunnelView;
