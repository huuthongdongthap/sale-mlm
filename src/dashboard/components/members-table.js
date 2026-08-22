/**
 * Members Table Component with Virtual Scrolling
 * Data table with sticky header, sortable columns, inline edit
 *
 * Thin orchestration class — rendering, styling and event handling are
 * delegated to focused modules under ./members-table-*.js so this file
 * stays small and focused on instance state + the few methods that
 * genuinely need `this`.
 */
import { buildColumns } from './members-table-columns.js';
import { renderTable, renderTableBody, updateFooterInfo, updateLoadingState, renderError } from './members-table-render.js';
import { attachEventListeners, handleRowSelection, updateBulkActions, handleInlineRoleEdit, handleBulkAction, handleRowAction, handleVirtualScroll, handlePagination, exportData } from './members-table-events.js';

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
    this.selectedRows = new Set();
    this.sortConfig = { column: null, direction: 'asc' };
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
    return buildColumns({ userRole: this.options.userRole, selectedRows: this.selectedRows });
  }

  render() {
    renderTable(this);
  }

  attachEventListeners() {
    attachEventListeners(this);
  }

  async loadMembers() {
    this.isLoading = true;
    updateLoadingState(this);

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
      renderTableBody(this);
      updateFooterInfo(this);

    } catch (error) {
      console.error('Error loading members:', error);
      this.error = error.message;
      renderError(this);
    } finally {
      this.isLoading = false;
      updateLoadingState(this);
    }
  }

  applyFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) {
      this.filteredMembers = [...this.members];
      renderTableBody(this);
      updateFooterInfo(this);
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

    renderTableBody(this);
    updateFooterInfo(this);
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
    renderTableBody(this);
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

  handleRowSelection(checkbox) {
    handleRowSelection(checkbox, this);
  }

  updateBulkActions() {
    updateBulkActions(this);
  }

  async handleInlineRoleEdit(select) {
    handleInlineRoleEdit(select, this);
  }

  async handleBulkAction(action) {
    handleBulkAction(action, this);
  }

  handleRowAction(button) {
    handleRowAction(button, this);
  }

  handleVirtualScroll() {
    handleVirtualScroll(this);
  }

  handlePagination(action) {
    handlePagination(action, this);
  }

  exportData() {
    exportData(this);
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
}
