/**
 * PSN Health View - Utility functions and styles
 * Pure helpers: formatting, style injection, CSS constants
 */

import { psnLegendStyles } from './components/psn-legend.js';
import { psnCardStyles } from './components/psn-card.js';

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatTimestamp(isoString) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoString));
}

export function injectPSNHealthStyles() {
  const styleId = 'psn-health-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    ${psnLegendStyles}
    ${psnCardStyles}
    ${psnHealthViewStyles}
  `;

  document.head.appendChild(style);
}

// Styles for the main PSN health view
export const psnHealthViewStyles = `
  .psn-health-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .psn-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 2.25rem;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-md) 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .header-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }

  .mock-badge {
    background: var(--status-warning);
    color: var(--surface-primary);
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .legend-section {
    margin-bottom: var(--spacing-xl);
  }

  .controls-section {
    margin-bottom: var(--spacing-lg);
  }

  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--border-secondary);
  }

  .section-title {
    font-size: 1.25rem;
    color: var(--text-primary);
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .sort-select {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--text-primary);
    font-size: 0.85rem;
    cursor: pointer;
  }

  .sort-select:focus {
    outline: 2px solid var(--brand-gold);
    outline-offset: 2px;
  }

  .clear-filter-btn {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filter-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .psn-grid-section {
    margin-bottom: var(--spacing-xl);
  }

  .psn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--spacing-lg);
  }

  .no-psns {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
  }

  .no-psns-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
  }

  .no-psns h3 {
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .no-psns p {
    color: var(--text-tertiary);
    margin: 0;
  }

  .summary-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-secondary);
  }

  .summary-stats {
    display: flex;
    gap: var(--spacing-lg);
  }

  .summary-stat {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-weight: 600;
  }

  .stat-value {
    font-size: 1.1rem;
    color: var(--text-primary);
    font-weight: 700;
    font-family: var(--font-mono);
  }

  .refresh-btn {
    background: var(--brand-gold);
    color: var(--surface-primary);
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover {
    background: var(--brand-gold-electric);
  }

  .refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .psn-loading {
    text-align: center;
    padding: var(--spacing-xl) 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-secondary);
    border-top-color: var(--brand-gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-lg) auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .psn-loading h2 {
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .psn-loading p {
    color: var(--text-secondary);
    margin: 0;
  }

  .psn-error {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--status-error);
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
  }

  .psn-error h2 {
    color: var(--status-error);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .psn-error p {
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .error-note {
    font-size: 0.85rem !important;
    color: var(--text-tertiary) !important;
    font-style: italic;
  }

  .retry-btn {
    background: var(--status-error);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    margin-top: var(--spacing-md);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .psn-health-view {
      padding: var(--spacing-md);
    }

    .page-title {
      font-size: 1.75rem;
    }

    .controls-header {
      flex-direction: column;
      align-items: stretch;
    }

    .controls {
      justify-content: center;
    }

    .psn-grid {
      grid-template-columns: 1fr;
    }

    .summary-footer {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }

    .summary-stats {
      justify-content: space-around;
      width: 100%;
    }

    .header-meta {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
`;
