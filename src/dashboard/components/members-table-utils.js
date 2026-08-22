/**
 * Members Table - Utility Functions
 * Pure helper functions extracted from MembersTable class.
 * All functions are stateless — no `this` dependency.
 */

/**
 * Render role cell with optional inline edit dropdown.
 * When inline edit is enabled and user is Admin, renders a <select>;
 * otherwise renders a static badge.
 *
 * @param {Object} member - Member data object
 * @param {Object} options - { enableInlineEdit: boolean, userRole: string }
 * @returns {string} HTML string for the role cell
 */
export function renderRoleCell(member, options = {}) {
  const { enableInlineEdit = false, userRole = 'Member' } = options;
  if (!enableInlineEdit || userRole !== 'Admin') {
    const className = member.role.replace(' ', '-').toLowerCase();
    return `<span class="role-badge role-${className}">${member.role}</span>`;
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

/**
 * Render a tier badge with localized label.
 * @param {number} tier
 * @returns {string} HTML string
 */
export function renderTierBadge(tier) {
  const tierLabels = { 1: 'Tân Binh', 2: 'Chiến Binh', 3: 'Chỉ Huy' };
  return `<span class="tier-badge tier-badge-${tier}">${tierLabels[tier] || `Tier ${tier}`}</span>`;
}

/**
 * Render a status badge with localized label.
 * @param {string} status
 * @returns {string} HTML string
 */
export function renderStatusBadge(status) {
  const statusLabels = { active: 'Hoạt động', inactive: 'Nghỉ', training: 'Đào tạo' };
  return `<span class="status-badge status-badge-${status}">${statusLabels[status] || status}</span>`;
}

/**
 * Render a habit score bar (0-6 scale).
 * @param {number} score
 * @returns {string} HTML string
 */
export function renderHabitScore(score = 0) {
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

/**
 * Render action buttons (view / edit) for a member row.
 * @param {Object} member
 * @returns {string} HTML string
 */
export function renderActionButtons(member) {
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

/**
 * Format a Vietnamese phone number (+84xxxxxxxxx).
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\+84)(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3 $4');
}

/**
 * Format a date string as a vi-VN locale date.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
}

/**
 * Escape text so it is safe to inject into HTML.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}