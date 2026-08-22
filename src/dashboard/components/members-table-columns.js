/**
 * Members Table - Column Definitions
 * Pure column config + helper renderers (no class dependency)
 */
import {
  renderRoleCell,
  renderTierBadge,
  renderStatusBadge,
  renderHabitScore,
  renderActionButtons,
  escapeHtml,
  formatPhone,
  formatDate,
} from './members-table-utils.js';

/**
 * Build column definitions for the members table.
 * Mirrors MembersTable.getColumns() exactly.
 * @param {Object} options - { userRole: string, selectedRows: Set<string> }
 * @returns {Array} Column config objects
 */
export function buildColumns(options = {}) {
  const { userRole = 'Member', selectedRows = new Set() } = options;

  return [
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
          ${selectedRows.has(member.id) ? 'checked' : ''}>
      `
    },
    {
      key: 'name',
      label: 'Tên',
      width: '180px',
      sortable: true,
      render: (member) => `
        <div class="member-name">
          <strong class="name-primary">${escapeHtml(member.name)}</strong>
          <div class="name-secondary">${escapeHtml(member.email || 'Chưa có email')}</div>
        </div>
      `
    },
    {
      key: 'role',
      label: 'Vai trò',
      width: '120px',
      sortable: true,
      editable: userRole === 'Admin',
      render: (member) => renderRoleCell(member, { enableInlineEdit: userRole === 'Admin', userRole })
    },
    {
      key: 'tier',
      label: 'Cấp độ',
      width: '100px',
      sortable: true,
      render: (member) => renderTierBadge(member.tier)
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: '120px',
      sortable: true,
      render: (member) => renderStatusBadge(member.status)
    },
    {
      key: 'habitScore',
      label: 'Điểm thói quen',
      width: '130px',
      sortable: true,
      render: (member) => renderHabitScore(member.habitScore)
    },
    {
      key: 'phone',
      label: 'Điện thoại',
      width: '140px',
      sortable: false,
      render: (member) => member.phone ? `
        <span class="phone-number">${formatPhone(member.phone)}</span>
      ` : '<span class="text-muted">Chưa có</span>'
    },
    {
      key: 'joinedAt',
      label: 'Ngày tham gia',
      width: '120px',
      sortable: true,
      render: (member) => formatDate(member.joinedAt)
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '100px',
      sortable: false,
      render: (member) => renderActionButtons(member)
    }
  ];
}