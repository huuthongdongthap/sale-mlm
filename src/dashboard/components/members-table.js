/**
 * Members Table Component with Virtual Scrolling
 * Data table with sticky header, sortable columns, inline edit
 */

export class MembersTable {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      apiUrl: '/api/members',
      pageSize: 50,
      virtualRowHeight: 48,
      visibleRows: 20,
      enableInlineEdit: true,
      userRole: 'Member', // Default role, will be set by auth
      ...options
    };

    this.members = [];
    this.filteredMembers = [];
    this.sortConfig = { column: null, direction: 'asc' };
    this.selectedRows = new Set();
    this.virtualScrollTop = 0;
    this.isLoading = false;
    this.error = null;

    this.init();
  }

  async init() {
    this.render();
    this.attachEventListeners();
    await this.loadMembers();
  }

  getColumns() {
    const baseColumns = [
      {
        key: 'select',
        label: '',
        width: '50px',
        sortable: false,
        render: (member) => `
          <input type="checkbox"
            class="row-select"
            data-id="${member.id}"
            aria-label="Chọn ${member.name}"
            ${this.selectedRows.has(member.id) ? 'checked' : ''}>
        `
      },
      {
        key: 'name',
        label: 'Tên',
        width: '180px',
        sortable: true,
        render: (member) => `
          <div class="member-name">
            <strong class="name-primary">${this.escapeHtml(member.name)}</strong>
            <div class="name-secondary">${this.escapeHtml(member.email || 'Chưa có email')}</div>
          </div>
        `
      },
      {
        key: 'role',
        label: 'Vai trò',
        width: '120px',
        sortable: true,
        editable: this.options.userRole === 'Admin',
        render: (member) => this.renderRoleCell(member)
      },
      {
        key: 'tier',
        label: 'Cấp độ',
        width: '100px',
        sortable: true,
        render: (member) => this.renderTierBadge(member.tier)
      },
      {
        key: 'status',
        label: 'Trạng thái',
        width: '120px',
        sortable: true,
        render: (member) => this.renderStatusBadge(member.status)
      },
      {
        key: 'habitScore',
        label: 'Điểm thói quen',
        width: '130px',
        sortable: true,
        render: (member) => this.renderHabitScore(member.habitScore)
      },
      {
        key: 'phone',
        label: 'Điện thoại',
        width: '140px',
        sortable: false,
        render: (member) => member.phone ? `
          <span class="phone-number">${this.formatPhone(member.phone)}</span>
        ` : '<span class="text-muted">Chưa có</span>'
      },
      {
        key: 'joinedAt',
        label: 'Ngày tham gia',
        width: '120px',
        sortable: true,
        render: (member) => this.formatDate(member.joinedAt)
      },
      {
        key: 'actions',
        label: 'Thao tác',
        width: '100px',
        sortable: false,
        render: (member) => this.renderActionButtons(member)
      }
    ];

    return baseColumns;
  }

  render() {
    this.container.innerHTML = `
      <div class="members-table-container">
        <div class="table-header">
          <div class="table-controls">
            <div class="bulk-actions" style="display: none;">
              <span class="selected-count">0 đã chọn</span>
              <button type="button" class="btn-bulk-action" data-action="deactivate">
                Tạm ngưng
              </button>
              <button type="button" class="btn-bulk-action" data-action="activate">
                Kích hoạt
              </button>
              ${this.options.userRole === 'Admin' ? `
                <button type="button" class="btn-bulk-action btn-danger" data-action="delete">
                  Xóa
                </button>
              ` : ''}
            </div>

            <div class="table-actions">
              <button type="button" class="btn-refresh" aria-label="Làm mới dữ liệu">
                🔄 Làm mới
              </button>
              <button type="button" class="btn-export" aria-label="Xuất dữ liệu">
                📊 Xuất Excel
              </button>
            </div>
          </div>
        </div>

        <div class="virtual-table-wrapper">
          <div class="table-scroll-container">
            <table class="members-table" role="table" aria-label="Bảng danh sách thành viên">
              <thead class="table-head" role="rowgroup">
                <tr role="row">
                  ${this.getColumns().map(col => `
                    <th role="columnheader"
                        style="width: ${col.width}"
                        class="table-header-cell ${col.sortable ? 'sortable' : ''}"
                        data-column="${col.key}"
                        ${col.sortable ? `aria-sort="none" tabindex="0"` : ''}>
                      ${col.label}
                      ${col.sortable ? '<span class="sort-indicator" aria-hidden="true"></span>' : ''}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="table-body" role="rowgroup">
                <tr class="loading-row">
                  <td colspan="${this.getColumns().length}" class="loading-cell">
                    <div class="loading-spinner"></div>
                    <span>Đang tải dữ liệu...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="virtual-scrollbar">
            <div class="virtual-scrollbar-thumb"></div>
          </div>
        </div>

        <div class="table-footer">
          <div class="table-info">
            <span class="total-count">Tổng: 0 thành viên</span>
          </div>
          <div class="pagination-controls">
            <button type="button" class="btn-pagination" data-action="first" disabled>
              ⏪ Đầu
            </button>
            <button type="button" class="btn-pagination" data-action="prev" disabled>
              ◀ Trước
            </button>
            <span class="page-indicator">Trang 1 / 1</span>
            <button type="button" class="btn-pagination" data-action="next" disabled>
              Sau ▶
            </button>
            <button type="button" class="btn-pagination" data-action="last" disabled>
              Cuối ⏭
            </button>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('members-table-styles')) return;

    const style = document.createElement('style');
    style.id = 'members-table-styles';
    style.textContent = `
      .members-table-container {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-luxury);
      }

      .table-header {
        background: var(--surface-tertiary);
        border-bottom: 1px solid var(--border-secondary);
        padding: var(--spacing-md);
      }

      .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
      }

      .bulk-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .selected-count {
        font-weight: 500;
        color: var(--text-accent);
        font-size: 0.875rem;
      }

      .btn-bulk-action {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-bulk-action:hover {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .btn-bulk-action.btn-danger:hover {
        border-color: #EF4444;
        color: #EF4444;
      }

      .table-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .btn-refresh, .btn-export {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-refresh:hover, .btn-export:hover {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .virtual-table-wrapper {
        position: relative;
        height: 600px;
        overflow: hidden;
      }

      .table-scroll-container {
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .members-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        table-layout: fixed;
      }

      .table-head {
        position: sticky;
        top: 0;
        background: var(--surface-tertiary);
        z-index: 10;
      }

      .table-header-cell {
        padding: var(--spacing-md);
        border-bottom: 2px solid var(--border-primary);
        color: var(--text-accent);
        font-weight: 600;
        text-align: left;
        position: relative;
        user-select: none;
      }

      .table-header-cell.sortable {
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .table-header-cell.sortable:hover {
        background: var(--surface-secondary);
      }

      .sort-indicator {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .table-header-cell.sortable:hover .sort-indicator,
      .table-header-cell[aria-sort="ascending"] .sort-indicator,
      .table-header-cell[aria-sort="descending"] .sort-indicator {
        opacity: 1;
      }

      .table-header-cell[aria-sort="ascending"] .sort-indicator::after {
        content: '▲';
      }

      .table-header-cell[aria-sort="descending"] .sort-indicator::after {
        content: '▼';
      }

      .table-header-cell.sortable:hover .sort-indicator::after {
        content: '⇅';
      }

      .table-body tr {
        height: 48px;
        border-bottom: 1px solid var(--border-secondary);
        transition: background-color 0.2s ease;
      }

      .table-body tr:hover {
        background: var(--surface-tertiary);
      }

      .table-body tr.selected {
        background: rgba(201, 162, 0, 0.1);
      }

      .table-body td {
        padding: var(--spacing-sm) var(--spacing-md);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .loading-cell {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-secondary);
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-secondary);
        border-top: 2px solid var(--brand-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: var(--spacing-sm);
        vertical-align: middle;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .member-name {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name-primary {
        color: var(--text-primary);
        font-weight: 500;
      }

      .name-secondary {
        color: var(--text-tertiary);
        font-size: 0.8rem;
      }

      .role-badge, .tier-badge, .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tier-badge-1 { background: var(--brand-amber); color: var(--surface-primary); }
      .tier-badge-2 { background: var(--brand-gold); color: var(--surface-primary); }
      .tier-badge-3 { background: var(--brand-gold-electric); color: var(--surface-primary); }

      .status-badge-active { background: #22C55E; color: white; }
      .status-badge-inactive { background: #EF4444; color: white; }
      .status-badge-training { background: #3B82F6; color: white; }

      .habit-score {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .habit-score-value {
        font-weight: 600;
        font-family: var(--font-mono);
      }

      .habit-score-bar {
        flex: 1;
        height: 4px;
        background: var(--border-secondary);
        border-radius: 2px;
        overflow: hidden;
      }

      .habit-score-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .phone-number {
        font-family: var(--font-mono);
        color: var(--text-secondary);
      }

      .text-muted {
        color: var(--text-tertiary);
        font-style: italic;
      }

      .action-buttons {
        display: flex;
        gap: var(--spacing-xs);
      }

      .btn-action {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
      }

      .btn-action:hover {
        background: var(--surface-tertiary);
        color: var(--brand-gold);
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--surface-tertiary);
        border-top: 1px solid var(--border-secondary);
      }

      .total-count {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .btn-pagination {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-pagination:hover:not(:disabled) {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .btn-pagination:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-indicator {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .virtual-scrollbar {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 12px;
        background: var(--surface-secondary);
        border-left: 1px solid var(--border-secondary);
      }

      .virtual-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: 6px;
        width: 8px;
        margin: 2px;
        transition: background-color 0.2s ease;
      }

      .virtual-scrollbar-thumb:hover {
        background: var(--brand-gold);
      }

      /* Inline editing */
      .inline-edit {
        position: relative;
      }

      .role-select {
        background: var(--surface-tertiary);
        border: 1px solid var(--border-primary);
        color: var(--text-primary);
        padding: 2px 4px;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        cursor: pointer;
      }

      .role-select:focus {
        outline: none;
        border-color: var(--brand-gold);
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .virtual-table-wrapper {
          height: 400px;
        }

        .table-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .table-header-cell,
        .table-body td {
          padding: var(--spacing-xs) var(--spacing-sm);
        }

        .members-table {
          font-size: 0.8rem;
        }

        .table-footer {
          flex-direction: column;
          gap: var(--spacing-sm);
          align-items: stretch;
        }

        .pagination-controls {
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
  }

  attachEventListeners() {
    const container = this.container;

    // Row selection
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('row-select')) {
        this.handleRowSelection(e.target);
      }
    });

    // Column sorting
    container.addEventListener('click', (e) => {
      const header = e.target.closest('.table-header-cell.sortable');
      if (header) {
        this.handleSort(header.dataset.column);
      }

      // Bulk actions
      if (e.target.classList.contains('btn-bulk-action')) {
        this.handleBulkAction(e.target.dataset.action);
      }

      // Table actions
      if (e.target.matches('.btn-refresh')) {
        this.loadMembers();
      }

      if (e.target.matches('.btn-export')) {
        this.exportData();
      }

      // Pagination
      if (e.target.classList.contains('btn-pagination')) {
        this.handlePagination(e.target.dataset.action);
      }

      // Row actions
      if (e.target.matches('.btn-action')) {
        this.handleRowAction(e.target);
      }
    });

    // Inline role editing
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('role-select')) {
        this.handleInlineRoleEdit(e.target);
      }
    });

    // Virtual scrolling
    const scrollContainer = container.querySelector('.table-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', () => {
        this.handleVirtualScroll();
      });
    }
  }

  async loadMembers() {
    this.isLoading = true;
    this.updateLoadingState();

    try {
      const response = await fetch(`${this.options.apiUrl}?limit=1000&includePII=true`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.members = data.data || [];
      this.filteredMembers = [...this.members];

      this.error = null;
      this.renderTableBody();
      this.updateFooterInfo();

    } catch (error) {
      console.error('Error loading members:', error);
      this.error = error.message;
      this.renderError();
    } finally {
      this.isLoading = false;
      this.updateLoadingState();
    }
  }

  applyFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      this.filteredMembers = [...this.members];
      this.renderTableBody();
      this.updateFooterInfo();
      return;
    }

    this.filteredMembers = this.members.filter(member => {
      // Tier filter
      if (filters.tier && filters.tier.length > 0) {
        if (!filters.tier.includes(member.tier.toString())) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(member.status)) {
          return false;
        }
      }

      // Role filter
      if (filters.role && filters.role.length > 0) {
        if (!filters.role.includes(member.role)) {
          return false;
        }
      }

      // Habit score filter
      if (filters.habitScore && filters.habitScore.length > 0) {
        const score = member.habitScore || 0;
        const scoreMatches = filters.habitScore.some(range => {
          const [min, max] = range.split('-').map(Number);
          return score >= min && score <= max;
        });
        if (!scoreMatches) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = member.name.toLowerCase().includes(searchLower);
        const emailMatch = member.email && member.email.toLowerCase().includes(searchLower);
        const phoneMatch = member.phone && member.phone.includes(searchLower);

        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });

    this.renderTableBody();
    this.updateFooterInfo();
  }

  handleSort(column) {
    if (this.sortConfig.column === column) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.column = column;
      this.sortConfig.direction = 'asc';
    }

    this.filteredMembers.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle special sorting cases
      if (column === 'joinedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      let result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortConfig.direction === 'desc' ? -result : result;
    });

    this.updateSortIndicators();
    this.renderTableBody();
  }

  updateSortIndicators() {
    // Reset all sort indicators
    this.container.querySelectorAll('.table-header-cell').forEach(header => {
      header.setAttribute('aria-sort', 'none');
    });

    // Set current sort indicator
    if (this.sortConfig.column) {
      const currentHeader = this.container.querySelector(`[data-column="${this.sortConfig.column}"]`);
      if (currentHeader) {
        currentHeader.setAttribute('aria-sort', this.sortConfig.direction === 'asc' ? 'ascending' : 'descending');
      }
    }
  }

  renderTableBody() {
    const tbody = this.container.querySelector('.table-body');
    if (!tbody) return;

    if (this.filteredMembers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.getColumns().length}" class="loading-cell">
            ${this.error ?
              `<div class="error-message">❌ ${this.error}</div>` :
              '<div class="no-data">Không có dữ liệu thành viên</div>'
            }
          </td>
        </tr>
      `;
      return;
    }

    const columns = this.getColumns();
    const rows = this.filteredMembers.map(member => {
      const isSelected = this.selectedRows.has(member.id);
      return `
        <tr role="row" class="${isSelected ? 'selected' : ''}" data-id="${member.id}">
          ${columns.map(col => `
            <td role="gridcell">
              ${col.render(member)}
            </td>
          `).join('')}
        </tr>
      `;
    }).join('');

    tbody.innerHTML = rows;
  }

  renderRoleCell(member) {
    if (!this.options.enableInlineEdit || this.options.userRole !== 'Admin') {
      return `<span class="role-badge role-${member.role.replace(' ', '-').toLowerCase()}">${member.role}</span>`;
    }

    const roles = ['Admin', 'Core Leader', 'PSN Leader', 'Member'];
    return `
      <select class="role-select" data-id="${member.id}" data-original="${member.role}">
        ${roles.map(role => `
          <option value="${role}" ${role === member.role ? 'selected' : ''}>${role}</option>
        `).join('')}
      </select>
    `;
  }

  renderTierBadge(tier) {
    const tierLabels = {
      1: 'Tân Binh',
      2: 'Chiến Binh',
      3: 'Chỉ Huy'
    };
    return `<span class="tier-badge tier-badge-${tier}">${tierLabels[tier] || `Tier ${tier}`}</span>`;
  }

  renderStatusBadge(status) {
    const statusLabels = {
      active: 'Hoạt động',
      inactive: 'Nghỉ',
      training: 'Đào tạo'
    };
    return `<span class="status-badge status-badge-${status}">${statusLabels[status] || status}</span>`;
  }

  renderHabitScore(score = 0) {
    const scoreValue = Math.min(6, Math.max(0, score));
    const percentage = (scoreValue / 6) * 100;
    const color = scoreValue >= 5 ? 'var(--brand-gold-electric)' :
                  scoreValue >= 3 ? 'var(--brand-gold)' : 'var(--brand-amber)';

    return `
      <div class="habit-score">
        <span class="habit-score-value" style="color: ${color}">${scoreValue}/6</span>
        <div class="habit-score-bar">
          <div class="habit-score-fill" style="width: ${percentage}%; background: ${color}"></div>
        </div>
      </div>
    `;
  }

  renderActionButtons(member) {
    return `
      <div class="action-buttons">
        <button class="btn-action" data-action="view" data-id="${member.id}" title="Xem chi tiết">
          👁️
        </button>
        <button class="btn-action" data-action="edit" data-id="${member.id}" title="Chỉnh sửa">
          ✏️
        </button>
      </div>
    `;
  }

  formatPhone(phone) {
    if (!phone) return '';
    // Format Vietnamese phone numbers
    return phone.replace(/(\+84)(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3 $4');
  }

  formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleRowSelection(checkbox) {
    const memberId = checkbox.dataset.id;
    const row = checkbox.closest('tr');

    if (checkbox.checked) {
      this.selectedRows.add(memberId);
      row.classList.add('selected');
    } else {
      this.selectedRows.delete(memberId);
      row.classList.remove('selected');
    }

    this.updateBulkActions();
  }

  updateBulkActions() {
    const bulkActions = this.container.querySelector('.bulk-actions');
    const selectedCount = this.container.querySelector('.selected-count');

    if (this.selectedRows.size > 0) {
      bulkActions.style.display = 'flex';
      selectedCount.textContent = `${this.selectedRows.size} đã chọn`;
    } else {
      bulkActions.style.display = 'none';
    }
  }

  async handleInlineRoleEdit(select) {
    const memberId = select.dataset.id;
    const newRole = select.value;
    const originalRole = select.dataset.original;

    if (newRole === originalRole) return;

    try {
      const response = await fetch(`${this.options.apiUrl}/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error(`Không thể cập nhật vai trò: ${response.statusText}`);
      }

      // Update local data
      const member = this.members.find(m => m.id === memberId);
      if (member) {
        member.role = newRole;
      }

      select.dataset.original = newRole;

      // Show success message
      this.showNotification(`Đã cập nhật vai trò thành công`, 'success');

    } catch (error) {
      console.error('Error updating role:', error);
      select.value = originalRole; // Revert on error
      this.showNotification(error.message, 'error');
    }
  }

  async handleBulkAction(action) {
    if (this.selectedRows.size === 0) return;

    const memberIds = Array.from(this.selectedRows);

    try {
      switch (action) {
        case 'activate':
        case 'deactivate':
          const status = action === 'activate' ? 'active' : 'inactive';
          await this.bulkUpdateStatus(memberIds, status);
          break;
        case 'delete':
          if (confirm(`Bạn có chắc muốn xóa ${memberIds.length} thành viên?`)) {
            await this.bulkDelete(memberIds);
          }
          break;
      }
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  updateLoadingState() {
    const tbody = this.container.querySelector('.table-body');
    if (this.isLoading) {
      tbody.innerHTML = `
        <tr class="loading-row">
          <td colspan="${this.getColumns().length}" class="loading-cell">
            <div class="loading-spinner"></div>
            <span>Đang tải dữ liệu...</span>
          </td>
        </tr>
      `;
    }
  }

  updateFooterInfo() {
    const totalCount = this.container.querySelector('.total-count');
    if (totalCount) {
      const filtered = this.filteredMembers.length;
      const total = this.members.length;

      if (filtered === total) {
        totalCount.textContent = `Tổng: ${total} thành viên`;
      } else {
        totalCount.textContent = `Hiển thị: ${filtered} / ${total} thành viên`;
      }
    }
  }

  renderError() {
    const tbody = this.container.querySelector('.table-body');
    tbody.innerHTML = `
      <tr>
        <td colspan="${this.getColumns().length}" class="loading-cell">
          <div class="error-message" style="color: #EF4444;">
            ❌ ${this.error}
            <button class="btn-retry" onclick="this.closest('.members-table-container').querySelector('.btn-refresh').click()"
                    style="margin-left: 1rem; padding: 4px 8px; border: 1px solid #EF4444; background: transparent; color: #EF4444; border-radius: 4px; cursor: pointer;">
              Thử lại
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  getAuthToken() {
    // In production, this would get the JWT token from localStorage or sessionStorage
    return localStorage.getItem('auth_token') || 'mock-token';
  }

  showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#EF4444' : '#22C55E'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  exportData() {
    // Simple CSV export
    const columns = this.getColumns().filter(col => col.key !== 'select' && col.key !== 'actions');
    const headers = columns.map(col => col.label).join(',');

    const rows = this.filteredMembers.map(member => {
      return columns.map(col => {
        let value = member[col.key] || '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // Virtual scrolling methods (simplified implementation)
  handleVirtualScroll() {
    // For now, we render all rows since we expect ≤ 1000 members
    // True virtual scrolling would be implemented here for larger datasets
  }

  handlePagination(action) {
    // Pagination would be implemented here if using server-side pagination
    console.log('Pagination action:', action);
  }

  handleRowAction(button) {
    const action = button.dataset.action;
    const memberId = button.dataset.id;

    switch (action) {
      case 'view':
        // Navigate to member detail view
        window.location.hash = `/members/${memberId}`;
        break;
      case 'edit':
        // Open edit modal or navigate to edit page
        console.log('Edit member:', memberId);
        break;
    }
  }
}