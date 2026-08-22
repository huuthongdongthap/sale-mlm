/**
 * Members Table - Event Handlers
 * All event listener + interaction logic extracted from MembersTable class.
 * Functions take the table instance as `table` and never use `this`.
 */

/**
 * Attach all delegated event listeners to the table container.
 * @param {MembersTable} table
 */
export function attachEventListeners(table) {
  const container = table.container;

  // Row selection
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-select')) {
      table.handleRowSelection(e.target);
    }
  });

  // Column sorting
  container.addEventListener('click', (e) => {
    const header = e.target.closest('.table-header-cell.sortable');
    if (header) {
      table.handleSort(header.dataset.column);
    }

    // Bulk actions
    if (e.target.classList.contains('btn-bulk-action')) {
      table.handleBulkAction(e.target.dataset.action);
    }

    // Table actions
    if (e.target.matches('.btn-refresh')) {
      table.loadMembers();
    }

    if (e.target.matches('.btn-export')) {
      table.exportData();
    }

    // Pagination
    if (e.target.classList.contains('btn-pagination')) {
      table.handlePagination(e.target.dataset.action);
    }

    // Row actions
    if (e.target.matches('.btn-action')) {
      table.handleRowAction(e.target);
    }
  });

  // Inline role editing
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('role-select')) {
      table.handleInlineRoleEdit(e.target);
    }
  });

  // Virtual scrolling
  const scrollContainer = container.querySelector('.table-scroll-container');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      table.handleVirtualScroll();
    });
  }
}

/**
 * Handle row selection checkbox change.
 * @param {HTMLInputElement} checkbox
 * @param {MembersTable} table
 */
export function handleRowSelection(checkbox, table) {
  const memberId = checkbox.dataset.id;
  const row = checkbox.closest('tr');

  if (checkbox.checked) {
    table.selectedRows.add(memberId);
    row.classList.add('selected');
  } else {
    table.selectedRows.delete(memberId);
    row.classList.remove('selected');
  }

  table.updateBulkActions();
}

/**
 * Update the bulk action bar visibility / count.
 * @param {MembersTable} table
 */
export function updateBulkActions(table) {
  const bulkActions = table.container.querySelector('.bulk-actions');
  const selectedCount = table.container.querySelector('.selected-count');

  if (table.selectedRows.size > 0) {
    bulkActions.style.display = 'flex';
    selectedCount.textContent = `${table.selectedRows.size} đã chọn`;
  } else {
    bulkActions.style.display = 'none';
  }
}

/**
 * Handle inline role select change (PATCH role to server).
 * @param {HTMLSelectElement} select
 * @param {MembersTable} table
 */
export async function handleInlineRoleEdit(select, table) {
  const memberId = select.dataset.id;
  const newRole = select.value;
  const originalRole = select.dataset.original;

  if (newRole === originalRole) return;

  try {
    const response = await fetch(`${table.options.apiUrl}/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${table.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) {
      throw new Error(`Không thể cập nhật vai trò: ${response.statusText}`);
    }

    // Update local data
    const member = table.members.find(m => m.id === memberId);
    if (member) {
      member.role = newRole;
    }

    select.dataset.original = newRole;

    // Show success message
    table.showNotification(`Đã cập nhật vai trò thành công`, 'success');

  } catch (error) {
    console.error('Error updating role:', error);
    select.value = originalRole; // Revert on error
    table.showNotification(error.message, 'error');
  }
}

/**
 * Handle bulk action button click.
 * @param {string} action
 * @param {MembersTable} table
 */
export async function handleBulkAction(action, table) {
  if (table.selectedRows.size === 0) return;

  const memberIds = Array.from(table.selectedRows);

  try {
    switch (action) {
      case 'activate':
      case 'deactivate':
        const status = action === 'activate' ? 'active' : 'inactive';
        await table.bulkUpdateStatus(memberIds, status);
        break;
      case 'delete':
        if (confirm(`Bạn có chắc muốn xóa ${memberIds.length} thành viên?`)) {
          await table.bulkDelete(memberIds);
        }
        break;
    }
  } catch (error) {
    table.showNotification(error.message, 'error');
  }
}

/**
 * Handle row action button click (view / edit).
 * @param {HTMLButtonElement} button
 * @param {MembersTable} table
 */
export function handleRowAction(button, table) {
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

/**
 * Virtual scrolling hook (simplified — renders all rows).
 * @param {MembersTable} table
 */
export function handleVirtualScroll(table) {
  // For now, we render all rows since we expect ≤ 1000 members
  // True virtual scrolling would be implemented here for larger datasets
}

/**
 * Pagination hook (client-side pagination not implemented).
 * @param {string} action
 * @param {MembersTable} table
 */
export function handlePagination(action, table) {
  // Pagination would be implemented here if using server-side pagination
  console.log('Pagination action:', action);
}

/**
 * Export filtered members to CSV and trigger download.
 * @param {MembersTable} table
 */
export function exportData(table) {
  // Simple CSV export
  const columns = table.getColumns().filter(col => col.key !== 'select' && col.key !== 'actions');
  const headers = columns.map(col => col.label).join(',');

  const rows = table.filteredMembers.map(member => {
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