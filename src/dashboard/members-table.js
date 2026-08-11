/**
 * Members Table View Page
 * Integrates FilterChips and MembersTable components
 */

import { FilterChips } from './components/filter-chips.js';
import { MembersTable } from './components/members-table.js';

export class MembersTableView {
  constructor(container) {
    this.container = container;
    this.filterChips = null;
    this.membersTable = null;
    this.userRole = this.getCurrentUserRole();
    this.init();
  }

  init() {
    this.render();
    this.initializeComponents();
  }

  render() {
    this.container.innerHTML = `
      <div class="members-table-view">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Quản lý thành viên</h1>
            <p class="page-subtitle">
              Theo dõi và quản lý toàn bộ thành viên trong Hive Warfare Academy
            </p>
          </div>

          <div class="header-actions">
            <button type="button" class="btn-primary" id="add-member-btn">
              ➕ Thêm thành viên
            </button>
          </div>
        </div>

        <div class="members-content">
          <div class="filters-section">
            <!-- Filter chips will be rendered here -->
          </div>

          <div class="table-section">
            <!-- Members table will be rendered here -->
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('members-table-view-styles')) return;

    const style = document.createElement('style');
    style.id = 'members-table-view-styles';
    style.textContent = `
      .members-table-view {
        padding: var(--spacing-lg);
        max-width: var(--container-max-width);
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-xl);
        gap: var(--spacing-lg);
      }

      .header-content {
        flex: 1;
      }

      .page-title {
        font-family: var(--font-display);
        color: var(--text-accent);
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 2rem;
      }

      .page-subtitle {
        color: var(--text-secondary);
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .btn-primary {
        background: var(--brand-gold);
        border: none;
        color: var(--surface-primary);
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 0.875rem;
      }

      .btn-primary:hover {
        background: var(--brand-gold-electric);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(201, 162, 0, 0.3);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      .members-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .filters-section {
        order: 1;
      }

      .table-section {
        order: 2;
      }

      /* Error boundary */
      .error-boundary {
        background: var(--surface-secondary);
        border: 1px solid #EF4444;
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        color: #EF4444;
      }

      .error-boundary h3 {
        color: #EF4444;
        margin-bottom: var(--spacing-md);
      }

      .error-boundary p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);
      }

      .error-boundary .btn-retry {
        background: transparent;
        border: 1px solid #EF4444;
        color: #EF4444;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .error-boundary .btn-retry:hover {
        background: #EF4444;
        color: white;
      }

      /* Loading state */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .loading-content {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        min-width: 200px;
      }

      .loading-spinner-large {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-secondary);
        border-top: 3px solid var(--brand-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto var(--spacing-md);
      }

      .loading-text {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .members-table-view {
          padding: var(--spacing-md);
        }

        .page-header {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-md);
        }

        .page-title {
          font-size: 1.5rem;
        }

        .header-actions {
          justify-content: stretch;
        }

        .btn-primary {
          justify-content: center;
          padding: var(--spacing-md);
        }

        .members-content {
          gap: var(--spacing-md);
        }
      }

      /* High DPI support */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .loading-spinner-large {
          transform: translateZ(0);
        }
      }

      /* Print styles */
      @media print {
        .page-header,
        .filters-section,
        .btn-primary {
          display: none !important;
        }

        .members-table-view {
          padding: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  initializeComponents() {
    try {
      // Initialize filter chips
      const filtersContainer = this.container.querySelector('.filters-section');
      this.filterChips = new FilterChips(filtersContainer, (filters) => {
        this.handleFilterChange(filters);
      });

      // Initialize members table
      const tableContainer = this.container.querySelector('.table-section');
      this.membersTable = new MembersTable(tableContainer, {
        userRole: this.userRole,
        enableInlineEdit: this.userRole === 'Admin'
      });

      // Setup additional event listeners
      this.setupEventListeners();

      console.log('✅ Members table view initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing members table view:', error);
      this.renderErrorBoundary(error);
    }
  }

  setupEventListeners() {
    const addMemberBtn = this.container.querySelector('#add-member-btn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => {
        this.handleAddMember();
      });
    }

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        this.handleAddMember();
      }

      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        this.refreshData();
      }

      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        this.focusSearch();
      }
    });
  }

  handleFilterChange(filters) {
    try {
      if (this.membersTable) {
        this.membersTable.applyFilters(filters);
      }

      // Update URL to preserve filter state
      this.updateUrlWithFilters(filters);

    } catch (error) {
      console.error('Error applying filters:', error);
      this.showErrorMessage('Có lỗi khi áp dụng bộ lọc');
    }
  }

  handleAddMember() {
    if (this.userRole !== 'Admin' && this.userRole !== 'PSN Leader') {
      this.showErrorMessage('Bạn không có quyền thêm thành viên mới');
      return;
    }

    // In a real app, this would open a modal or navigate to an add member page
    this.showModal('add-member');
  }

  refreshData() {
    if (this.membersTable) {
      this.membersTable.loadMembers();
    }
  }

  focusSearch() {
    const searchInput = this.container.querySelector('.filter-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  updateUrlWithFilters(filters) {
    try {
      const url = new URL(window.location);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (value && typeof value === 'string') {
          params.set(key, value);
        }
      });

      url.hash = `#/members?${params.toString()}`;
      window.history.replaceState(null, '', url.toString());

    } catch (error) {
      console.warn('Could not update URL with filters:', error);
    }
  }

  loadFiltersFromUrl() {
    try {
      const url = new URL(window.location);
      const hash = url.hash.replace('#', '');
      const [route, queryString] = hash.split('?');

      if (route !== '/members' || !queryString) {
        return {};
      }

      const params = new URLSearchParams(queryString);
      const filters = {};

      for (const [key, value] of params) {
        if (key === 'search') {
          filters[key] = value;
        } else {
          filters[key] = value.split(',');
        }
      }

      return filters;

    } catch (error) {
      console.warn('Could not load filters from URL:', error);
      return {};
    }
  }

  handleRouteChange() {
    const filters = this.loadFiltersFromUrl();
    if (this.filterChips && Object.keys(filters).length > 0) {
      this.filterChips.setFilters(filters);
    }
  }

  renderErrorBoundary(error) {
    this.container.innerHTML = `
      <div class="error-boundary">
        <h3>❌ Có lỗi xảy ra khi tải trang</h3>
        <p>Lỗi: ${error.message}</p>
        <button class="btn-retry" onclick="window.location.reload()">
          🔄 Tải lại trang
        </button>
      </div>
    `;
  }

  showErrorMessage(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #EF4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }

  showModal(type) {
    // Modal implementation would go here
    console.log(`Opening ${type} modal`);

    // For now, just show a notification
    this.showErrorMessage('Tính năng này đang được phát triển');
  }

  getCurrentUserRole() {
    // In production, this would get the role from the authenticated user context
    // For now, return a mock role based on localStorage or default to Member
    const mockRole = localStorage.getItem('user_role');
    return mockRole || 'Member';
  }

  // Method to set user role (for testing)
  setUserRole(role) {
    this.userRole = role;
    localStorage.setItem('user_role', role);

    if (this.membersTable) {
      this.membersTable.options.userRole = role;
      this.membersTable.options.enableInlineEdit = role === 'Admin';
      this.membersTable.renderTableBody();
    }
  }

  // Cleanup method
  destroy() {
    if (this.filterChips) {
      this.filterChips = null;
    }
    if (this.membersTable) {
      this.membersTable = null;
    }

    // Remove event listeners
    const addMemberBtn = this.container.querySelector('#add-member-btn');
    if (addMemberBtn) {
      addMemberBtn.replaceWith(addMemberBtn.cloneNode(true));
    }
  }
}

// Export for use in router
export function renderMembersTablePage(container) {
  return new MembersTableView(container);
}