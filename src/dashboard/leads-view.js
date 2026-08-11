/**
 * Leads View
 * Displays lead list with assignment and journey tracking
 * Consumes: GET /api/leads, GET /api/leads/:id, PATCH /api/leads/:id, GET /api/leads/:id/journey
 */

class LeadsView {
  constructor() {
    this.apiBase = window.location.origin || location.origin;
    this.leads = [];
    this.total = 0;
    this.page = 1;
    this.limit = 50;
    this.statusFilter = '';
    this.selectedLead = null;
  }

  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Quản lý Leads</h1>
        <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách leads...</p>
      </div>
    `;

    await this.loadLeads(container);
  }

  async loadLeads(container) {
    try {
      const params = new URLSearchParams({
        page: this.page.toString(),
        limit: this.limit.toString()
      });
      if (this.statusFilter) params.set('status', this.statusFilter);

      const response = await fetch(`${this.apiBase}/api/leads?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      this.leads = data.leads || [];
      this.total = data.total || 0;
      this.renderLeads(container);
    } catch (error) {
      container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">Quản lý Leads</h1>
          <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
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

  renderLeads(container) {
    const statusColors = {
      'new': 'var(--status-blue)',
      'contacted': 'var(--status-yellow)',
      'qualified': 'var(--status-green)',
      'converted': 'var(--status-green)',
      'lost': 'var(--status-red)'
    };

    const statusLabels = {
      'new': 'Mới',
      'contacted': 'Đã liên hệ',
      'qualified': 'Đủ điều kiện',
      'converted': 'Đã chuyển đổi',
      'lost': 'Đã mất'
    };

    const totalPages = Math.ceil(this.total / this.limit);

    let leadsTable = '';
    if (this.leads.length === 0) {
      leadsTable = `
        <div class="empty-state">
          <p>Không có lead nào</p>
        </div>
      `;
    } else {
      leadsTable = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Funnel Level</th>
                <th>Trạng thái</th>
                <th>CTV phụ trách</th>
                <th>Nguồn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.leads.map(lead => `
                <tr>
                  <td><strong>#${lead.id}</strong></td>
                  <td>${lead.name || 'N/A'}</td>
                  <td>${lead.email || 'N/A'}</td>
                  <td>${lead.phone || 'N/A'}</td>
                  <td><span class="tier-badge tier-${lead.funnel_level || 0}">L${lead.funnel_level || 0}</span></td>
                  <td>
                    <span class="status-badge" style="background: ${statusColors[lead.status] || 'var(--text-secondary)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                      ${statusLabels[lead.status] || lead.status || 'Mới'}
                    </span>
                  </td>
                  <td>${lead.assigned_ctv_id || 'Chưa phân công'}</td>
                  <td>${lead.source || 'N/A'}</td>
                  <td>
                    <button class="btn-sm btn-view-lead" data-lead-id="${lead.id}">Chi tiết</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn-sm" ${this.page <= 1 ? 'disabled' : ''} data-page="${this.page - 1}">← Trước</button>
          <span class="page-info">Trang ${this.page} / ${totalPages || 1} (${this.total} leads)</span>
          <button class="btn-sm" ${this.page >= totalPages ? 'disabled' : ''} data-page="${this.page + 1}">Sau →</button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Quản lý Leads</h1>
        <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
      </div>

      <div class="card">
        <div class="filter-bar">
          <select id="lead-status-filter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="new" ${this.statusFilter === 'new' ? 'selected' : ''}>Mới</option>
            <option value="contacted" ${this.statusFilter === 'contacted' ? 'selected' : ''}>Đã liên hệ</option>
            <option value="qualified" ${this.statusFilter === 'qualified' ? 'selected' : ''}>Đủ điều kiện</option>
            <option value="converted" ${this.statusFilter === 'converted' ? 'selected' : ''}>Đã chuyển đổi</option>
            <option value="lost" ${this.statusFilter === 'lost' ? 'selected' : ''}>Đã mất</option>
          </select>
          <button class="btn-primary" id="apply-lead-filters">Áp dụng</button>
        </div>
      </div>

      <div class="card">
        ${leadsTable}
      </div>

      <div id="lead-detail-modal" class="modal" style="display: none;"></div>
    `;

    this.attachEvents(container);
  }

  attachEvents(container) {
    const applyBtn = container.querySelector('#apply-lead-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.statusFilter = container.querySelector('#lead-status-filter')?.value || '';
        this.page = 1;
        this.loadLeads(container);
      });
    }

    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.page = parseInt(btn.dataset.page);
        this.loadLeads(container);
      });
    });

    container.querySelectorAll('.btn-view-lead').forEach(btn => {
      btn.addEventListener('click', async () => {
        const leadId = btn.dataset.leadId;
        await this.showLeadDetail(leadId);
      });
    });
  }

  async showLeadDetail(leadId) {
    try {
      const response = await fetch(`${this.apiBase}/api/leads/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const lead = await response.json();

      const modal = document.getElementById('lead-detail-modal');
      if (!modal) return;

      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Lead #${lead.id} - ${lead.name || 'N/A'}</h2>
            <button class="modal-close" onclick="this.closest('.modal').style.display='none'">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Tên:</span>
                <span class="detail-value">${lead.name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${lead.email || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Điện thoại:</span>
                <span class="detail-value">${lead.phone || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Funnel Level:</span>
                <span class="detail-value"><span class="tier-badge tier-${lead.funnel_level || 0}">L${lead.funnel_level || 0}</span></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Trạng thái:</span>
                <span class="detail-value">${lead.status || 'Mới'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">CTV phụ trách:</span>
                <span class="detail-value">${lead.assigned_ctv_id || 'Chưa phân công'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nguồn:</span>
                <span class="detail-value">${lead.source || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày tạo:</span>
                <span class="detail-value">${lead.created_at ? new Date(lead.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
              </div>
            </div>

            ${lead.quiz_answers ? `
              <h4 style="margin-top: 1.5rem;">Quiz Answers</h4>
              <pre style="background: var(--surface-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto;">${(() => { try { const qa = JSON.parse(lead.quiz_answers); if (typeof qa !== 'object' || Array.isArray(qa)) return ''; return JSON.stringify(qa).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]); } catch { return ''; } })()}</pre>
            ` : ''}

            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <h4 style="width: 100%;">Phân công CTV:</h4>
              <input type="text" id="assign-ctv-id" class="filter-input" placeholder="CTV ID..." style="width: 150px;">
              <select id="assign-status" class="filter-select">
                <option value="">-- Trạng thái --</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="qualified">Đủ điều kiện</option>
                <option value="converted">Đã chuyển đổi</option>
                <option value="lost">Đã mất</option>
              </select>
              <button class="btn-primary" id="assign-lead-btn">Cập nhật</button>
            </div>

            <div style="margin-top: 2rem;">
              <h4>Lịch sử hành trình</h4>
              <button class="btn-sm" id="load-journey-btn" data-lead-id="${lead.id}">Tải journey events</button>
              <div id="journey-events" style="margin-top: 1rem;"></div>
            </div>
          </div>
        </div>
      `;

        this.attachModalEvents(leadId);
    } catch (error) {
      console.error('Failed to load lead detail:', error);
    }
  }

  attachModalEvents(leadId) {
    const assignBtn = document.getElementById('assign-lead-btn');
    if (assignBtn) {
      assignBtn.addEventListener('click', async () => {
        const ctvId = document.getElementById('assign-ctv-id')?.value || '';
        const status = document.getElementById('assign-status')?.value || '';
        if (!ctvId && !status) return;

        try {
          const body = {};
          if (ctvId) body.assigned_ctv_id = ctvId;
          if (status) body.status = status;

          const response = await fetch(`${this.apiBase}/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (!response.ok) throw new Error(`API error: ${response.status}`);
          alert('Cập nhật thành công!');
          location.reload();
        } catch (error) {
          alert(`Lỗi: ${error.message}`);
        }
      });
    }

    const journeyBtn = document.getElementById('load-journey-btn');
    if (journeyBtn) {
      journeyBtn.addEventListener('click', async () => {
        const eventsContainer = document.getElementById('journey-events');
        if (!eventsContainer) return;

        try {
          const response = await fetch(`${this.apiBase}/api/leads/${leadId}/journey`, {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error(`API error: ${response.status}`);
          const data = await response.json();
          const events = data.events || [];

          if (events.length === 0) {
            eventsContainer.innerHTML = '<p style="color: var(--text-secondary);">Chưa có journey event nào.</p>';
            return;
          }

          eventsContainer.innerHTML = `
            <table class="data-table">
              <thead>
                <tr><th>Thời gian</th><th>Event</th><th>Mô tả</th><th>CTV</th></tr>
              </thead>
              <tbody>
                ${events.map(e => `
                  <tr>
                    <td>${e.created_at ? new Date(e.created_at).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td><strong>${e.event_type || 'N/A'}</strong></td>
                    <td>${e.description || '—'}</td>
                    <td>${e.ctv_id || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } catch (error) {
          eventsContainer.textContent = 'Lỗi: ' + error.message;
        }
      });
    }
  }

  getAuthToken() {
    return localStorage.getItem('auth_token') || '';
  }
}

export default LeadsView;
