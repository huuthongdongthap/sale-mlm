/**
 * Members Table - Render Methods
 * All DOM rendering logic extracted from MembersTable class.
 * Functions take the table instance as `table` and never use `this`.
 */
import { escapeHtml } from './members-table-utils.js';
import { injectMembersTableStyles } from './members-table-styles.js';

/**
 * Render the main table structure.
 * @param {MembersTable} table - The table instance
 * @returns {string} HTML string
 */
export function renderTable(table) {
  table.container.innerHTML = `
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
            ${table.options.userRole === 'Admin' ? `
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
                ${table.getColumns().map(col => `
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
                <td colspan="${table.getColumns().length}" class="loading-cell">
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

  injectMembersTableStyles();
}

/**
 * Render table body rows.
 * @param {MembersTable} table
 * @returns {string} HTML string
 */
export function renderTableBody(table) {
  const tbody = table.container.querySelector('.table-body');
  if (!tbody) return;

  if (table.filteredMembers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${table.getColumns().length}" class="loading-cell">
          ${table.error ?
            `<div class="error-message">❌ ${table.error}</div>` :
            '<div class="no-data">Không có dữ liệu thành viên</div>'
          }
        </td>
      </tr>
    `;
    return;
  }

  const columns = table.getColumns();
  const rows = table.filteredMembers.map(member => {
    const isSelected = table.selectedRows.has(member.id);
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

/**
 * Render the loading state row.
 * @param {MembersTable} table
 * @returns {string} HTML string
 */
export function renderLoading(table) {
  const tbody = table.container.querySelector('.table-body');
  tbody.innerHTML = `
    <tr>
      <td colspan="${table.getColumns().length}" class="loading-cell">
        <div class="loading-spinner"></div>
        <span>Đang tải dữ liệu...</span>
      </td>
    </tr>
  `;
}

/**
 * Render error state.
 * @param {MembersTable} table
 * @returns {string} HTML string
 */
export function renderError(table) {
  const tbody = table.container.querySelector('.table-body');
  tbody.innerHTML = `
    <tr>
      <td colspan="${table.getColumns().length}" class="loading-cell">
        <div class="error-message" style="color: #EF4444;">
          ❌ ${table.error}
          <button class="btn-retry" onclick="this.closest('.members-table-container').querySelector('.btn-refresh').click()"
                  style="margin-left: 1rem; padding: 4px 8px; border: 1px solid #EF4444; background: transparent; color: #EF4444; border-radius: 4px; cursor: pointer;">
            Thử lại
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Update the footer info text (total / filtered count).
 * @param {MembersTable} table
 */
export function updateFooterInfo(table) {
  const totalCount = table.container.querySelector('.total-count');
  if (totalCount) {
    const filtered = table.filteredMembers.length;
    const total = table.members.length;

    if (filtered === total) {
      totalCount.textContent = `Tổng: ${total} thành viên`;
    } else {
      totalCount.textContent = `Hiển thị: ${filtered} / ${total} thành viên`;
    }
  }
}

/**
 * Update the loading state row.
 * @param {MembersTable} table
 */
export function updateLoadingState(table) {
  const tbody = table.container.querySelector('.table-body');
  if (!tbody) return;

  if (table.isLoading) {
    renderLoading(table);
  }
}