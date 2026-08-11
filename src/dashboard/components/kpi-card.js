/**
 * KPI Card Component
 * Individual metric card with status pill and weekly sparkline
 * Displays current vs target with RED/YELLOW/GREEN status indicator
 */

import Sparkline from './sparkline.js';

class KPICard {
  constructor(config) {
    this.metric = config.metric;
    this.currentValue = config.current_value;
    this.targetValue = config.target_value;
    this.status = config.status; // RED, YELLOW, GREEN from backend
    this.sparklineData = config.sparkline || [];
    this.trend = config.trend || 'stable'; // up, down, stable
    this.period = config.period || 'weekly';

    this.sparkline = new Sparkline();
  }

  render() {
    const cardId = `kpi-card-${this.metric.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const statusClass = this.getStatusClass();
    const metricLabel = this.getMetricLabel();
    const trendIcon = this.getTrendIcon();

    return `
      <div class="kpi-card ${statusClass}"
           data-metric="${this.metric}"
           id="${cardId}"
           role="button"
           tabindex="0"
           aria-label="KPI ${metricLabel}: ${this.formatValue(this.currentValue)} / ${this.formatValue(this.targetValue)}. Trạng thái: ${this.getStatusText()}. Nhấn để xem chi tiết">

        <div class="kpi-header">
          <div class="kpi-title">
            <span class="kpi-icon">${this.getMetricIcon()}</span>
            <span class="kpi-label">${metricLabel}</span>
          </div>
          <div class="kpi-status-pill status-${this.status.toLowerCase()}">
            ${this.getStatusText()}
          </div>
        </div>

        <div class="kpi-content">
          <div class="kpi-values">
            <div class="kpi-current">
              <span class="value">${this.formatValue(this.currentValue)}</span>
              <span class="trend ${this.trend}">
                ${trendIcon}
              </span>
            </div>
            <div class="kpi-target">
              <span class="label">Mục tiêu:</span>
              <span class="value">${this.formatValue(this.targetValue)}</span>
            </div>
          </div>

          <div class="kpi-progress">
            ${this.renderProgressBar()}
          </div>

          <div class="kpi-chart">
            ${this.renderSparkline()}
          </div>
        </div>

        <div class="kpi-footer">
          <span class="period-label">${this.getPeriodLabel()}</span>
          <span class="click-hint">Nhấn để xem chi tiết</span>
        </div>
      </div>
    `;
  }

  getStatusClass() {
    const statusMap = {
      'RED': 'status-red',
      'YELLOW': 'status-yellow',
      'GREEN': 'status-green'
    };
    return statusMap[this.status] || 'status-neutral';
  }

  getStatusText() {
    const statusMap = {
      'RED': 'Cần cải thiện',
      'YELLOW': 'Gần đạt',
      'GREEN': 'Đạt mục tiêu'
    };
    return statusMap[this.status] || 'Chưa xác định';
  }

  getMetricLabel() {
    const labelMap = {
      'connects_per_day': 'Kết nối/ngày',
      'follow_ups_per_day': 'Follow-up/ngày',
      'first_order_14d': 'Đơn đầu 14 ngày',
      'habit_score': 'Điểm thói quen',
      'team_size': 'Quy mô nhóm',
      'retention_rate': 'Tỷ lệ giữ chân',
      'personal_revenue': 'Doanh thu cá nhân',
      'team_revenue': 'Doanh thu nhóm'
    };
    return labelMap[this.metric] || this.metric;
  }

  getMetricIcon() {
    const iconMap = {
      'connects_per_day': '[📞]',
      'follow_ups_per_day': '[💌]',
      'first_order_14d': '[🛒]',
      'habit_score': '[⭐]',
      'team_size': '[👥]',
      'retention_rate': '[🔒]',
      'personal_revenue': '[💰]',
      'team_revenue': '[🏆]'
    };
    return iconMap[this.metric] || '[📊]';
  }

  getTrendIcon() {
    const iconMap = {
      'up': '↗️',
      'down': '↘️',
      'stable': '➡️'
    };
    return iconMap[this.trend] || '➡️';
  }

  formatValue(value) {
    if (typeof value !== 'number') return value || '--';

    // Format based on metric type
    if (this.metric.includes('revenue')) {
      // Format currency (VND)
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value);
    } else if (this.metric.includes('rate')) {
      // Format percentage
      return `${Math.round(value)}%`;
    } else if (this.metric === 'habit_score') {
      // Format score out of 6
      return `${value.toFixed(1)}/6`;
    } else {
      // Format as number
      return Math.round(value).toLocaleString('vi-VN');
    }
  }

  renderProgressBar() {
    if (!this.targetValue || this.targetValue === 0) {
      return '<div class="progress-bar-placeholder">Chưa có mục tiêu</div>';
    }

    const percentage = Math.min((this.currentValue / this.targetValue) * 100, 100);
    const progressClass = percentage >= 100 ? 'complete' :
                         percentage >= 80 ? 'good' :
                         percentage >= 60 ? 'warning' : 'poor';

    return `
      <div class="progress-bar" role="progressbar"
           aria-valuenow="${this.currentValue}"
           aria-valuemin="0"
           aria-valuemax="${this.targetValue}"
           aria-label="Tiến độ: ${Math.round(percentage)}%">
        <div class="progress-fill ${progressClass}"
             style="width: ${percentage}%"></div>
        <div class="progress-text">
          ${Math.round(percentage)}%
        </div>
      </div>
    `;
  }

  renderSparkline() {
    if (!this.sparklineData || this.sparklineData.length === 0) {
      return '<div class="sparkline-placeholder">Chưa có dữ liệu xu hướng</div>';
    }

    try {
      return this.sparkline.render({
        data: this.sparklineData,
        width: 120,
        height: 40,
        color: this.getSparklineColor(),
        showDots: false,
        smooth: true
      });
    } catch (error) {
      console.warn('Sparkline render error:', error);
      return '<div class="sparkline-error">Lỗi biểu đồ</div>';
    }
  }

  getSparklineColor() {
    const colorMap = {
      'RED': 'var(--md-color-error, #ff4444)',
      'YELLOW': 'var(--md-color-warning, #ffaa00)',
      'GREEN': 'var(--md-color-success, #00cc66)'
    };
    return colorMap[this.status] || 'var(--md-color-outline, #666666)';
  }

  getPeriodLabel() {
    const labelMap = {
      'daily': 'Hôm nay',
      'weekly': '7 ngày qua',
      'monthly': '30 ngày qua'
    };
    return labelMap[this.period] || 'Kỳ này';
  }

  // Static method to handle keyboard navigation
  static bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      const focusedCard = document.activeElement;
      if (focusedCard && focusedCard.classList.contains('kpi-card')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          focusedCard.click();
        }
      }
    });
  }

  // Static method to add CSS styles if not already present
  static addStyles() {
    if (document.getElementById('kpi-card-styles')) return;

    const styles = `
      <style id="kpi-card-styles">
        .kpi-card {
          background: var(--surface-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .kpi-card:hover,
        .kpi-card:focus {
          transform: translateY(-2px);
          box-shadow: var(--shadow-luxury);
          border-color: var(--brand-gold);
        }

        .kpi-card.status-red {
          border-left: 4px solid var(--md-sys-color-error, var(--color-error));
        }

        .kpi-card.status-yellow {
          border-left: 4px solid var(--md-sys-color-tertiary, var(--color-warning, var(--md-color-warning, #ffaa00)));
        }

        .kpi-card.status-green {
          border-left: 4px solid var(--md-sys-color-success, var(--color-success, var(--md-color-success, #00cc66)));
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
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .kpi-status-pill {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-red {
          background: rgba(255, 68, 68, 0.1);
          color: var(--md-sys-color-error, var(--color-error));
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .status-yellow {
          background: rgba(255, 170, 0, 0.1);
          color: var(--md-sys-color-tertiary, var(--color-warning, var(--md-color-warning-light, #ffcc33)));
          border: 1px solid rgba(255, 170, 0, 0.3);
        }

        .status-green {
          background: rgba(0, 204, 102, 0.1);
          color: var(--md-sys-color-success, var(--color-success, var(--md-color-success-light, #33ff88)));
          border: 1px solid rgba(0, 204, 102, 0.3);
        }

        .kpi-values {
          margin-bottom: var(--spacing-md);
        }

        .kpi-current {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }

        .kpi-current .value {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-accent-bright);
        }

        .trend {
          font-size: 1rem;
        }

        .kpi-target {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .progress-bar {
          position: relative;
          background: var(--surface-tertiary);
          border-radius: var(--radius-sm);
          height: 6px;
          margin-bottom: var(--spacing-md);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--radius-sm);
          transition: width 0.3s ease;
        }

        .progress-fill.complete {
          background: linear-gradient(90deg, var(--md-sys-color-primary-container), var(--md-sys-color-primary));
        }

        .progress-fill.good {
          background: linear-gradient(90deg, var(--md-sys-color-tertiary-container), var(--md-sys-color-tertiary));
        }

        .progress-fill.warning {
          background: linear-gradient(90deg, var(--md-sys-color-tertiary-container), var(--md-sys-color-tertiary));
        }

        .progress-fill.poor {
          background: linear-gradient(90deg, var(--md-sys-color-error-container), var(--md-sys-color-error));
        }

        .progress-text {
          position: absolute;
          top: -24px;
          right: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .kpi-chart {
          margin-bottom: var(--spacing-md);
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .sparkline-placeholder,
        .sparkline-error {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          font-style: italic;
          text-align: center;
          width: 100%;
        }

        .kpi-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          border-top: 1px solid var(--border-secondary);
          padding-top: var(--spacing-sm);
        }

        .click-hint {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .kpi-card:hover .click-hint,
        .kpi-card:focus .click-hint {
          opacity: 1;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-card {
            padding: var(--spacing-md);
          }

          .kpi-current .value {
            font-size: 1.25rem;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Auto-initialize styles and keyboard events when module loads
KPICard.addStyles();
KPICard.bindKeyboardEvents();

export default KPICard;