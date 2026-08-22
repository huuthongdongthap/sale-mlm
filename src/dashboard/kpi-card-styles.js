/**
 * KPI Card Styles
 * All CSS styles for the KPI Card component
 */

export function getKPIStyles() {
  return `
    <style>
      .kpi-card {
        background: var(--surface-secondary, var(--card-bg));
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .kpi-card:hover {
        border-color: var(--brand-gold);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .kpi-card:focus {
        outline: 2px solid var(--brand-gold);
        outline-offset: 2px;
      }

      .kpi-card.status-red {
        border-left: 4px solid var(--md-sys-color-error, var(--color-error));
      }

      .kpi-card.status-yellow {
        border-left: 4px solid var(--md-sys-color-warning, var(--color-warning));
      }

      .kpi-card.status-green {
        border-left: 4px solid var(--md-sys-color-success, var(--color-success));
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);
      }

      .kpi-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .kpi-icon {
        font-size: 1.25rem;
      }

      .kpi-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .kpi-status-pill {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-red {
        background: var(--md-sys-color-error-container, rgba(255, 68, 68, 0.1));
        color: var(--md-sys-color-error, var(--color-error));
      }

      .status-yellow {
        background: var(--md-sys-color-warning-container, rgba(255, 170, 0, 0.1));
        color: var(--md-sys-color-warning, var(--color-warning));
      }

      .status-green {
        background: var(--md-sys-color-success-container, rgba(0, 204, 102, 0.1));
        color: var(--md-sys-color-success, var(--color-success));
      }

      .kpi-content {
        margin-bottom: var(--spacing-md);
      }

      .kpi-values {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: var(--spacing-sm);
      }

      .kpi-current {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .kpi-current .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .kpi-current .trend {
        font-size: 0.875rem;
      }

      .kpi-current .trend.up {
        color: var(--md-sys-color-success, var(--color-success));
      }

      .kpi-current .trend.down {
        color: var(--md-sys-color-error, var(--color-error));
      }

      .kpi-current .trend.stable {
        color: var(--md-sys-color-outline, var(--color-outline));
      }

      .kpi-target {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .kpi-target .label {
        color: var(--text-tertiary);
      }

      .kpi-target .value {
        font-weight: 600;
      }

      .kpi-progress {
        margin-bottom: var(--spacing-md);
      }

      .progress-bar {
        position: relative;
        background: var(--surface-tertiary);
        border-radius: var(--radius-sm);
        height: 8px;
        overflow: hidden;
      }

      .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: var(--radius-sm);
        transition: width 0.5s ease;
      }

      .progress-fill.poor {
        background: var(--md-sys-color-error, var(--color-error));
      }

      .progress-fill.warning {
        background: var(--md-sys-color-warning, var(--color-warning));
      }

      .progress-fill.good {
        background: var(--md-sys-color-success, var(--color-success));
      }

      .progress-fill.complete {
        background: var(--md-sys-color-primary, var(--brand-gold));
      }

      .kpi-chart {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kpi-chart canvas {
        width: 100%;
        height: 100%;
      }

      .sparkline-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-tertiary);
        font-size: 0.75rem;
        font-style: italic;
      }

      .sparkline-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--md-sys-color-error, var(--color-error));
        font-size: 0.75rem;
      }

      .kpi-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--spacing-sm);
        border-top: 1px solid var(--border-color);
      }

      .kpi-footer .period {
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .kpi-footer .action {
        font-size: 0.75rem;
        color: var(--brand-gold);
        font-weight: 500;
      }

      /* Status color variations for specific metrics */
      .kpi-card[data-metric="connects_per_day"].status-red {
        background: linear-gradient(135deg, var(--surface-secondary), rgba(255, 68, 68, 0.05));
      }

      .kpi-card[data-metric="connects_per_day"].status-yellow {
        background: linear-gradient(135deg, var(--surface-secondary), rgba(255, 170, 0, 0.05));
      }

      .kpi-card[data-metric="connects_per_day"].status-green {
        background: linear-gradient(135deg, var(--surface-secondary), rgba(0, 204, 102, 0.05));
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .kpi-card {
          padding: var(--spacing-md);
        }

        .kpi-current .value {
          font-size: 1.25rem;
        }

        .kpi-header {
          flex-direction: column;
          gap: var(--spacing-sm);
        }
      }
    </style>
  `;
}
