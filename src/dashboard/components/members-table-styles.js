/**
 * Members Table - Styles
 * Injects the members-table stylesheet into <head> exactly once (singleton).
 * Extracted verbatim from MembersTable.addStyles().
 */

/**
 * Inject the members-table stylesheet into <head>.
 * Safe to call multiple times — idempotent.
 */
export function injectMembersTableStyles() {
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