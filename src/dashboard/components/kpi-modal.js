/**
 * KPI Drill-down Modal Component
 * Shows 30-day history with tier-target overlay for detailed analysis
 * Includes mini chart, data table, and goal progression
 */

class KPIModal {
  constructor(config) {
    this.metric = config.metric;
    this.member = config.member;
    this.currentKPI = config.currentKPI;
    this.tierTarget = config.tierTarget;
    this.onClose = config.onClose || (() => {});

    this.isVisible = false;
    this.modalElement = null;
    this.historyData = null;

    this.setupModal();
  }

  setupModal() {
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'kpi-modal-overlay';
    this.modalElement.innerHTML = this.generateModalHTML();

    // Add to container
    const container = document.getElementById('kpi-modal-container') || document.body;
    container.appendChild(this.modalElement);

    this.bindEvents();
  }

  generateModalHTML() {
    const metricLabel = this.getMetricLabel();
    const metricIcon = this.getMetricIcon();

    return `
      <div class="kpi-modal" role="dialog" aria-labelledby="kpi-modal-title" aria-modal="true">
        <div class="kpi-modal-content">
          <header class="kpi-modal-header">
            <div class="kpi-modal-title-group">
              <h2 id="kpi-modal-title" class="kpi-modal-title">
                <span class="modal-icon">${metricIcon}</span>
                ${metricLabel} - Chi tiết
              </h2>
              <p class="kpi-modal-subtitle">
                ${this.member.full_name} (${this.member.tier || 'Tân Binh'})
              </p>
            </div>
            <button class="kpi-modal-close" aria-label="Đóng modal" type="button">
              <span>✕</span>
            </button>
          </header>

          <div class="kpi-modal-body">
            <div class="loading-section">
              <div class="loading-spinner"></div>
              <p>Đang tải dữ liệu 30 ngày qua...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async show() {
    this.isVisible = true;
    this.modalElement.style.display = 'flex';

    // Add animation class after a brief delay for smooth entry
    requestAnimationFrame(() => {
      this.modalElement.classList.add('visible');
    });

    // Focus management for accessibility
    const closeButton = this.modalElement.querySelector('.kpi-modal-close');
    if (closeButton) {
      closeButton.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Load detailed data
    await this.loadDetailedData();
  }

  hide() {
    this.isVisible = false;
    this.modalElement.classList.remove('visible');

    // Restore body scroll
    document.body.style.overflow = '';

    setTimeout(() => {
      this.modalElement.style.display = 'none';
      this.cleanup();
    }, 300); // Match CSS transition duration
  }

  cleanup() {
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
    this.modalElement = null;
  }

  async loadDetailedData() {
    try {
      // Fetch 30-day history from API
      const response = await fetch(`/api/kpi/${this.member.id || 'current'}/history?metric=${this.metric}&days=30`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.status}`);
      }

      this.historyData = await response.json();
      this.renderDetailedContent();

    } catch (error) {
      console.error('Failed to load KPI history:', error);
      this.renderError(error.message);
    }
  }

  renderDetailedContent() {
    const modalBody = this.modalElement.querySelector('.kpi-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="kpi-detail-content">
        <!-- Current Status Section -->
        <section class="current-status-section">
          <h3 class="section-title">Trạng thái hiện tại</h3>
          <div class="status-grid">
            ${this.renderCurrentStatusCard()}
            ${this.renderTargetProgressCard()}
            ${this.renderTrendAnalysisCard()}
          </div>
        </section>

        <!-- History Chart Section -->
        <section class="history-chart-section">
          <h3 class="section-title">Xu hướng 30 ngày qua</h3>
          <div class="chart-container">
            ${this.renderHistoryChart()}
          </div>
        </section>

        <!-- Data Table Section -->
        <section class="history-table-section">
          <h3 class="section-title">Dữ liệu chi tiết</h3>
          <div class="table-container">
            ${this.renderHistoryTable()}
          </div>
        </section>

        <!-- Insights Section -->
        <section class="insights-section">
          <h3 class="section-title">Phân tích & Gợi ý</h3>
          <div class="insights-content">
            ${this.renderInsights()}
          </div>
        </section>
      </div>
    `;
  }

  renderCurrentStatusCard() {
    const status = this.currentKPI.status;
    const statusClass = status.toLowerCase();
    const statusText = this.getStatusText(status);

    return `
      <div class="status-card current-status">
        <div class="status-header">
          <span class="status-icon">📊</span>
          <span class="status-label">Giá trị hiện tại</span>
        </div>
        <div class="status-value">
          ${this.formatValue(this.currentKPI.current_value)}
        </div>
        <div class="status-pill status-${statusClass}">
          ${statusText}
        </div>
      </div>
    `;
  }

  renderTargetProgressCard() {
    const progress = this.tierTarget ? (this.currentKPI.current_value / this.tierTarget.target_value) * 100 : 0;
    const progressClass = progress >= 100 ? 'complete' : progress >= 80 ? 'good' : progress >= 60 ? 'warning' : 'poor';

    return `
      <div class="status-card target-progress">
        <div class="status-header">
          <span class="status-icon">🎯</span>
          <span class="status-label">Mục tiêu ${this.member.tier || 'Tân Binh'}</span>
        </div>
        <div class="status-value">
          ${this.tierTarget ? this.formatValue(this.tierTarget.target_value) : 'Chưa đặt'}
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${progressClass}" style="width: ${Math.min(progress, 100)}%"></div>
          <div class="progress-text">${Math.round(progress)}%</div>
        </div>
      </div>
    `;
  }

  renderTrendAnalysisCard() {
    if (!this.historyData || !this.historyData.daily_values) {
      return `
        <div class="status-card trend-analysis">
          <div class="status-header">
            <span class="status-icon">📈</span>
            <span class="status-label">Xu hướng</span>
          </div>
          <div class="no-data">Chưa có dữ liệu</div>
        </div>
      `;
    }

    const values = this.historyData.daily_values.map(d => d.value);
    const recent7 = values.slice(-7);
    const previous7 = values.slice(-14, -7);

    const recentAvg = recent7.reduce((a, b) => a + b, 0) / recent7.length;
    const previousAvg = previous7.length ? previous7.reduce((a, b) => a + b, 0) / previous7.length : recentAvg;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    const trendDirection = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    const trendIcon = trendDirection === 'up' ? '↗️' : trendDirection === 'down' ? '↘️' : '➡️';

    return `
      <div class="status-card trend-analysis">
        <div class="status-header">
          <span class="status-icon">📈</span>
          <span class="status-label">Xu hướng 7 ngày</span>
        </div>
        <div class="status-value">
          ${trendIcon} ${Math.abs(change).toFixed(1)}%
        </div>
        <div class="trend-description">
          ${trendDirection === 'up' ? 'Tăng' : trendDirection === 'down' ? 'Giảm' : 'Ổn định'} so với tuần trước
        </div>
      </div>
    `;
  }

  renderHistoryChart() {
    if (!this.historyData || !this.historyData.daily_values) {
      return '<div class="chart-placeholder">Chưa có dữ liệu để hiển thị biểu đồ</div>';
    }

    const data = this.historyData.daily_values;
    const target = this.tierTarget ? this.tierTarget.target_value : null;

    // Simple line chart with SVG
    const width = 600;
    const height = 200;
    const padding = 40;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values, target || Infinity);
    const maxValue = Math.max(...values, target || -Infinity);
    const valueRange = maxValue - minValue || 1;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = padding + (height - 2 * padding) - ((item.value - minValue) / valueRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    // Target line
    const targetY = target ? padding + (height - 2 * padding) - ((target - minValue) / valueRange) * (height - 2 * padding) : null;

    return `
      <svg class="history-chart" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <!-- Grid lines -->
        <defs>
          <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="var(--border-secondary)" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Target line -->
        ${target ? `
          <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}"
                stroke="var(--brand-amber)" stroke-width="2" stroke-dasharray="5,5" opacity="0.8">
          </line>
          <text x="${width - padding - 60}" y="${targetY - 5}" fill="var(--brand-amber)" font-size="12">
            Mục tiêu: ${this.formatValue(target)}
          </text>
        ` : ''}

        <!-- Data line -->
        <polyline fill="none" stroke="var(--brand-gold)" stroke-width="2" points="${points}"/>

        <!-- Data points -->
        ${data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
          const y = padding + (height - 2 * padding) - ((item.value - minValue) / valueRange) * (height - 2 * padding);
          return `<circle cx="${x}" cy="${y}" r="3" fill="var(--brand-gold-electric)">
            <title>${new Date(item.date).toLocaleDateString('vi-VN')}: ${this.formatValue(item.value)}</title>
          </circle>`;
        }).join('')}

        <!-- Axes -->
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="var(--text-secondary)" stroke-width="1"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--text-secondary)" stroke-width="1"/>
      </svg>
    `;
  }

  renderHistoryTable() {
    if (!this.historyData || !this.historyData.daily_values) {
      return '<div class="table-placeholder">Chưa có dữ liệu chi tiết</div>';
    }

    const data = this.historyData.daily_values.slice(-14); // Show last 14 days

    return `
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Giá trị</th>
              <th>Mục tiêu</th>
              <th>Trạng thái</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => {
              const prevValue = index > 0 ? data[index - 1].value : item.value;
              const change = item.value - prevValue;
              const changePercent = prevValue ? (change / prevValue) * 100 : 0;
              const status = this.calculateDayStatus(item.value);

              return `
                <tr>
                  <td>${new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                  <td class="value-cell">${this.formatValue(item.value)}</td>
                  <td class="target-cell">${this.tierTarget ? this.formatValue(this.tierTarget.target_value) : '--'}</td>
                  <td>
                    <span class="status-pill status-${status.toLowerCase()}">${this.getStatusText(status)}</span>
                  </td>
                  <td class="change-cell ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}">
                    ${change > 0 ? '+' : ''}${change.toFixed(1)}
                    ${changePercent !== 0 ? `(${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderInsights() {
    if (!this.historyData) {
      return '<div class="insights-placeholder">Đang phân tích dữ liệu...</div>';
    }

    const insights = this.generateInsights();

    return `
      <div class="insights-grid">
        ${insights.map(insight => `
          <div class="insight-card ${insight.type}">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
              <h4 class="insight-title">${insight.title}</h4>
              <p class="insight-description">${insight.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateInsights() {
    const insights = [];
    const values = this.historyData.daily_values.map(d => d.value);

    // Trend analysis
    const recent7 = values.slice(-7);
    const trend = recent7[recent7.length - 1] - recent7[0];
    if (trend > 0) {
      insights.push({
        type: 'positive',
        icon: '📈',
        title: 'Xu hướng tích cực',
        description: `Hiệu suất đã cải thiện ${this.formatValue(trend)} trong 7 ngày qua.`
      });
    } else if (trend < 0) {
      insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Cần chú ý',
        description: `Hiệu suất giảm ${this.formatValue(Math.abs(trend))} trong 7 ngày qua.`
      });
    }

    // Consistency check
    const variance = this.calculateVariance(recent7);
    if (variance < 10) {
      insights.push({
        type: 'neutral',
        icon: '🎯',
        title: 'Hiệu suất ổn định',
        description: 'Kết quả tương đối đồng đều trong tuần qua.'
      });
    } else {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Biến động cao',
        description: 'Hiệu suất có nhiều thay đổi. Cần tìm hiểu nguyên nhân.'
      });
    }

    // Goal progress
    if (this.tierTarget) {
      const progress = (this.currentKPI.current_value / this.tierTarget.target_value) * 100;
      if (progress >= 100) {
        insights.push({
          type: 'success',
          icon: '🏆',
          title: 'Đã đạt mục tiêu',
          description: 'Chúc mừng! Bạn đã vượt qua mục tiêu đề ra.'
        });
      } else if (progress >= 80) {
        insights.push({
          type: 'positive',
          icon: '🎯',
          title: 'Gần đạt mục tiêu',
          description: `Chỉ còn ${Math.round(100 - progress)}% nữa để hoàn thành mục tiêu.`
        });
      } else {
        insights.push({
          type: 'warning',
          icon: '💪',
          title: 'Cần nỗ lực thêm',
          description: `Cần cải thiện ${Math.round(100 - progress)}% để đạt mục tiêu tier.`
        });
      }
    }

    return insights;
  }

  calculateDayStatus(value) {
    if (!this.tierTarget) return 'YELLOW';

    const target = this.tierTarget.target_value;
    const ratio = value / target;

    if (ratio >= 1) return 'GREEN';
    if (ratio >= 0.8) return 'YELLOW';
    return 'RED';
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  bindEvents() {
    // Close modal events
    const closeButton = this.modalElement.querySelector('.kpi-modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide();
        this.onClose();
      });
    }

    // Close on overlay click
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.hide();
        this.onClose();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
        this.onClose();
      }
    });
  }

  renderError(message) {
    const modalBody = this.modalElement.querySelector('.kpi-modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <h3>Không thể tải dữ liệu chi tiết</h3>
          <p>${message}</p>
          <button class="retry-button btn-primary" onclick="this.closest('.kpi-modal-overlay').dispatchEvent(new CustomEvent('retry'))">
            Thử lại
          </button>
        </div>
      </div>
    `;

    // Handle retry
    this.modalElement.addEventListener('retry', () => {
      this.loadDetailedData();
    });
  }

  // Helper methods
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
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
      'connects_per_day': '📞',
      'follow_ups_per_day': '💌',
      'first_order_14d': '🛒',
      'habit_score': '⭐',
      'team_size': '👥',
      'retention_rate': '🔒',
      'personal_revenue': '💰',
      'team_revenue': '🏆'
    };
    return iconMap[this.metric] || '📊';
  }

  getStatusText(status) {
    const statusMap = {
      'RED': 'Cần cải thiện',
      'YELLOW': 'Gần đạt',
      'GREEN': 'Đạt mục tiêu'
    };
    return statusMap[status] || 'Chưa xác định';
  }

  formatValue(value) {
    if (typeof value !== 'number') return value || '--';

    if (this.metric.includes('revenue')) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value);
    } else if (this.metric.includes('rate')) {
      return `${Math.round(value)}%`;
    } else if (this.metric === 'habit_score') {
      return `${value.toFixed(1)}/6`;
    } else {
      return Math.round(value).toLocaleString('vi-VN');
    }
  }

  // Static method to add CSS styles
  static addStyles() {
    if (document.getElementById('kpi-modal-styles')) return;

    const styles = `
      <style id="kpi-modal-styles">
        .kpi-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .kpi-modal-overlay.visible {
          opacity: 1;
        }

        .kpi-modal {
          background: var(--surface-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-luxury);
          max-width: 90vw;
          max-height: 90vh;
          width: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .kpi-modal-overlay.visible .kpi-modal {
          transform: scale(1);
        }

        .kpi-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--border-primary);
        }

        .kpi-modal-title-group {
          flex: 1;
        }

        .kpi-modal-title {
          color: var(--text-accent-bright);
          margin: 0 0 var(--spacing-sm) 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .modal-icon {
          font-size: 1.5rem;
        }

        .kpi-modal-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9rem;
        }

        .kpi-modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .kpi-modal-close:hover {
          background: var(--surface-tertiary);
          color: var(--text-primary);
        }

        .kpi-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-xl);
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          min-height: 200px;
        }

        .section-title {
          color: var(--text-accent);
          margin-bottom: var(--spacing-md);
          font-size: 1.1rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .status-card {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .status-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .status-value {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-accent-bright);
          margin-bottom: var(--spacing-sm);
        }

        .chart-container {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          overflow-x: auto;
        }

        .history-chart {
          width: 100%;
          min-width: 600px;
        }

        .table-container {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-xl);
        }

        .history-table {
          overflow-x: auto;
        }

        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th,
        .history-table td {
          padding: var(--spacing-md);
          text-align: left;
          border-bottom: 1px solid var(--border-secondary);
        }

        .history-table th {
          background: var(--surface-primary);
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .value-cell {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .change-cell.positive {
          color: #00cc66;
        }

        .change-cell.negative {
          color: #ff4444;
        }

        .change-cell.neutral {
          color: var(--text-secondary);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .insight-card {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          display: flex;
          gap: var(--spacing-md);
        }

        .insight-card.positive {
          border-left: 4px solid #00cc66;
        }

        .insight-card.warning {
          border-left: 4px solid #ffaa00;
        }

        .insight-card.success {
          border-left: 4px solid #00cc66;
        }

        .insight-card.info {
          border-left: 4px solid var(--brand-gold);
        }

        .insight-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .insight-title {
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 0.9rem;
        }

        .insight-description {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .kpi-modal {
            width: 95vw;
            max-height: 95vh;
          }

          .kpi-modal-header,
          .kpi-modal-body {
            padding: var(--spacing-lg);
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .chart-container {
            padding: var(--spacing-md);
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Auto-initialize styles when module loads
KPIModal.addStyles();

export default KPIModal;