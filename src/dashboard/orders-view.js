/**
 * Orders View
 * Displays order list with filtering by status and CTV
 * Consumes: GET /api/orders, GET /api/orders/:id
 */

class OrdersView {
  constructor() {
    this.apiBase = 'https://hive-warfare-os.sadec-marketing-hub.workers.dev';
    this.orders = [];
    this.total = 0;
    this.page = 1;
    this.limit = 50;
    this.statusFilter = '';
    this.ctvFilter = '';
    this.selectedOrder = null;
  }

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Quản lý đơn hàng</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>
    `;

    await this.loadOrders(container);
  }

  async loadOrders(container) {
    try {
      const params = new URLSearchParams({
        page: this.page.toString(),
        limit: this.limit.toString()
      });
      if (this.statusFilter) params.set('status', this.statusFilter);
      if (this.ctvFilter) params.set('ctv_id', this.ctvFilter);

      const response = await fetch(`${this.apiBase}/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      this.orders = data.orders || [];
      this.total = data.total || 0;
      this.renderOrders(container);
    } catch (error) {
      container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">Quản lý đơn hàng</h1>
          <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
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

  renderOrders(container) {
    const statusColors = {
      'pending': 'var(--status-yellow)',
      'paid': 'var(--status-green)',
      'shipped': 'var(--status-blue)',
      'delivered': 'var(--status-green)',
      'cancelled': 'var(--status-red)',
      'refunded': 'var(--status-yellow)'
    };

    const statusLabels = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };

    const totalPages = Math.ceil(this.total / this.limit);

    let ordersTable = '';
    if (this.orders.length === 0) {
      ordersTable = `
        <div class="empty-state">
          <p>Không có đơn hàng nào</p>
        </div>
      `;
    } else {
      ordersTable = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>CTV</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.orders.map(order => `
                <tr>
                  <td><strong>#${order.id}</strong></td>
                  <td>${order.lead_name || 'N/A'}<br><small style="color: var(--text-secondary);">${order.lead_email || ''}</small></td>
                  <td>${order.product_name || 'N/A'}</td>
                  <td><strong>${this.formatVND(order.total_vnd)}</strong></td>
                  <td>
                    <span class="status-badge" style="background: ${statusColors[order.status] || 'var(--text-secondary)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                      ${statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td>${order.ctv_referrer_id || '—'}</td>
                  <td>${order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <button class="btn-sm btn-view-order" data-order-id="${order.id}">Chi tiết</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn-sm" ${this.page <= 1 ? 'disabled' : ''} data-page="${this.page - 1}">← Trước</button>
          <span class="page-info">Trang ${this.page} / ${totalPages || 1} (${this.total} đơn)</span>
          <button class="btn-sm" ${this.page >= totalPages ? 'disabled' : ''} data-page="${this.page + 1}">Sau →</button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Quản lý đơn hàng</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      <div class="card">
        <div class="filter-bar">
          <select id="order-status-filter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="pending" ${this.statusFilter === 'pending' ? 'selected' : ''}>Chờ thanh toán</option>
            <option value="paid" ${this.statusFilter === 'paid' ? 'selected' : ''}>Đã thanh toán</option>
            <option value="shipped" ${this.statusFilter === 'shipped' ? 'selected' : ''}>Đang giao</option>
            <option value="delivered" ${this.statusFilter === 'delivered' ? 'selected' : ''}>Đã giao</option>
            <option value="cancelled" ${this.statusFilter === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
          <input type="text" id="order-ctv-filter" class="filter-input" placeholder="Lọc theo CTV ID..." value="${this.ctvFilter}">
          <button class="btn-primary" id="apply-order-filters">Áp dụng</button>
        </div>
      </div>

      <div class="card">
        ${ordersTable}
      </div>

      <div id="order-detail-modal" class="modal" style="display: none;"></div>
    `;

    this.attachEvents(container);
  }

  attachEvents(container) {
    // Filter events
    const applyBtn = container.querySelector('#apply-order-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.statusFilter = container.querySelector('#order-status-filter')?.value || '';
        this.ctvFilter = container.querySelector('#order-ctv-filter')?.value || '';
        this.page = 1;
        this.loadOrders(container);
      });
    }

    // Pagination events
    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.page = parseInt(btn.dataset.page);
        this.loadOrders(container);
      });
    });

    // Order detail events
    container.querySelectorAll('.btn-view-order').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.orderId;
        await this.showOrderDetail(orderId);
      });
    });
  }

  async showOrderDetail(orderId) {
    try {
      const response = await fetch(`${this.apiBase}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const order = await response.json();

      const modal = document.getElementById('order-detail-modal');
      if (!modal) return;

      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Đơn hàng #${order.id}</h2>
            <button class="modal-close" onclick="this.closest('.modal').style.display='none'">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Khách hàng:</span>
                <span class="detail-value">${order.lead_name || 'N/A'} (${order.lead_email || ''})</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sản phẩm:</span>
                <span class="detail-value">${order.product_name || 'N/A'} (${order.product_tier || ''})</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Số lượng:</span>
                <span class="detail-value">${order.quantity || 1}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Đơn giá:</span>
                <span class="detail-value">${this.formatVND(order.unit_price_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tổng tiền:</span>
                <span class="detail-value" style="color: var(--brand-gold); font-weight: 700; font-size: 1.25rem;">${this.formatVND(order.total_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hoa hồng:</span>
                <span class="detail-value">${this.formatVND(order.commission_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Thanh toán:</span>
                <span class="detail-value">${order.payment_method || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Trạng thái:</span>
                <span class="detail-value">${order.status || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày tạo:</span>
                <span class="detail-value">${order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày thanh toán:</span>
                <span class="detail-value">${order.paid_at ? new Date(order.paid_at).toLocaleString('vi-VN') : 'Chưa thanh toán'}</span>
              </div>
            </div>
            ${order.items && order.items.length > 0 ? `
              <h4 style="margin-top: 1.5rem;">Chi tiết sản phẩm</h4>
              <table class="data-table">
                <thead>
                  <tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.product_name || 'N/A'}</td>
                      <td>${item.quantity}</td>
                      <td>${this.formatVND(item.unit_price_vnd)}</td>
                      <td>${this.formatVND(item.total_vnd)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load order detail:', error);
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

export default OrdersView;
