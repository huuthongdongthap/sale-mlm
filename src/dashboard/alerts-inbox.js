/**
 * Alerts Inbox - Main alerts management interface
 * T-011 implementation with severity grouping and ACK functionality
 * Vietnamese UI with mock API until T-006 backend ready
 */

import { mockAlertsAPI } from '../mocks/alerts-api.js';
import { SeverityGroup } from './components/severity-group.js';
import { AlertCard } from './components/alert-card.js';

export class AlertsInbox {
  constructor() {
    this.alerts = [];
    this.groupedAlerts = {};
    this.filters = {
      severity: null,
      acknowledged: null
    };
    this.loading = false;
    this.container = null;

    this.init();
  }

  async init() {
    await this.loadAlerts();
    this.render();
    this.setupEventListeners();

    // Auto-refresh every 30 seconds
    setInterval(() => {
      if (!this.loading) {
        this.loadAlerts(true); // Silent refresh
      }
    }, 30000);
  }

  async loadAlerts(silent = false) {
    if (!silent) {
      this.loading = true;
      this.updateLoadingState();
    }

    try {
      const response = await mockAlertsAPI.getAlerts(this.filters);

      if (response.success) {
        this.alerts = response.data.alerts;
        this.groupedAlerts = response.data.grouped;

        if (!silent) {
          this.render();
          this.showNotification('success', `Đã tải ${this.alerts.length} cảnh báo`);
        } else {
          // Silent update - only update counters
          this.updateCounters();
        }
      } else {
        this.showNotification('error', 'Không thể tải dữ liệu cảnh báo');
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.showNotification('error', 'Lỗi kết nối - thử lại sau');
    } finally {
      this.loading = false;
      if (!silent) {
        this.updateLoadingState();
      }
    }
  }

  async acknowledgeAlerts(alertIds) {
    if (!alertIds || alertIds.length === 0) return;

    this.showNotification('info', `Đang xử lý ${alertIds.length} cảnh báo...`);

    try {
      let result;

      if (alertIds.length === 1) {
        result = await mockAlertsAPI.acknowledgeAlert(alertIds[0], 'current-user');
      } else {
        result = await mockAlertsAPI.bulkAcknowledge(alertIds, 'current-user');
      }

      if (result.success) {
        // Refresh alerts data
        await this.loadAlerts();

        const count = alertIds.length === 1 ? 1 : result.data.acknowledged;
        this.showNotification('success', `✅ Đã xử lý ${count} cảnh báo`);

        // Log audit trail for compliance
        console.log('Alert acknowledgment audit:', {
          action: 'alerts_acknowledged',
          count: count,
          alert_ids: alertIds,
          timestamp: new Date().toISOString()
        });
      } else {
        this.showNotification('error', result.error || 'Không thể xử lý cảnh báo');
      }
    } catch (error) {
      console.error('Error acknowledging alerts:', error);
      this.showNotification('error', 'Lỗi xử lý cảnh báo');
    }
  }

  render() {
    this.container = document.getElementById('page-content');
    if (!this.container) return;

    const unacknowledgedCount = this.alerts.filter(a => !a.acknowledged).length;
    const totalCount = this.alerts.length;

    this.container.innerHTML = `
      <div class="alerts-inbox">
        <!-- Page Header -->
        <div class="page-header" style="
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h1 class="page-title" style="
                font-family: var(--font-display);
                font-size: 2rem;
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
              ">
                🚨 Trung tâm cảnh báo
              </h1>
              <p class="page-subtitle" style="
                color: var(--text-secondary);
                margin: 0;
                font-size: 1.1rem;
              ">
                Hệ thống cảnh báo tự động cho retention và campaign triggers
              </p>
            </div>

            <div class="alerts-summary" style="
              display: flex;
              gap: 1rem;
              align-items: center;
            ">
              <div class="summary-card" style="
                background: var(--surface-secondary);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                text-align: center;
                min-width: 120px;
              ">
                <div style="
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: ${unacknowledgedCount > 0 ? 'var(--brand-gold)' : 'var(--text-secondary)'};
                  margin-bottom: 0.25rem;
                ">
                  ${unacknowledgedCount}
                </div>
                <div style="
                  font-size: 0.75rem;
                  color: var(--text-tertiary);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Chưa xử lý
                </div>
              </div>

              <div class="summary-card" style="
                background: var(--surface-secondary);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                text-align: center;
                min-width: 120px;
              ">
                <div style="
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: var(--text-secondary);
                  margin-bottom: 0.25rem;
                ">
                  ${totalCount}
                </div>
                <div style="
                  font-size: 0.75rem;
                  color: var(--text-tertiary);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Tổng số
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="inbox-controls" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <div class="filter-controls" style="
            display: flex;
            gap: 0.75rem;
            align-items: center;
            flex-wrap: wrap;
          ">
            <label style="
              font-size: 0.875rem;
              color: var(--text-secondary);
              font-weight: 500;
            ">
              Lọc theo:
            </label>

            <select id="severity-filter" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              font-size: 0.875rem;
            ">
              <option value="">Tất cả mức độ</option>
              <option value="critical">🚨 Nghiêm trọng</option>
              <option value="warn">⚠️ Cảnh báo</option>
              <option value="info">ℹ️ Thông tin</option>
            </select>

            <select id="status-filter" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              font-size: 0.875rem;
            ">
              <option value="">Tất cả trạng thái</option>
              <option value="false">Chưa xử lý</option>
              <option value="true">Đã xử lý</option>
            </select>
          </div>

          <div class="action-controls" style="
            display: flex;
            gap: 0.75rem;
            align-items: center;
          ">
            <button id="refresh-btn" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-secondary);
              padding: 0.5rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.875rem;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.borderColor='var(--brand-gold)'"
            onmouseout="this.style.borderColor='var(--border-color)'">
              🔄 Làm mới
            </button>

            ${unacknowledgedCount > 0 ? `
              <button id="ack-all-btn" style="
                background: var(--brand-gold);
                color: var(--surface-primary);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background='var(--brand-gold-electric)'"
              onmouseout="this.style.background='var(--brand-gold)'">
                ✓ Xử lý tất cả (${unacknowledgedCount})
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Loading State -->
        <div id="loading-indicator" class="loading-indicator" style="
          display: none;
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        ">
          <div style="
            display: inline-block;
            width: 32px;
            height: 32px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--brand-gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          "></div>
          <div>Đang tải cảnh báo...</div>
        </div>

        <!-- Alerts Content -->
        <div id="alerts-content" class="alerts-content">
          ${this.renderAlertsContent()}
        </div>

        <!-- Notification Area -->
        <div id="notifications" class="notifications" style="
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
        "></div>
      </div>

      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .notification {
          background: var(--surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: translateX(100%);
          animation: slideIn 0.3s ease-out forwards;
        }

        .notification.success {
          border-left: 4px solid #4CAF50;
        }

        .notification.error {
          border-left: 4px solid #FF4444;
        }

        .notification.info {
          border-left: 4px solid var(--brand-gold);
        }

        @keyframes slideIn {
          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .inbox-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls,
          .action-controls {
            justify-content: center;
          }

          .alerts-summary {
            justify-content: center !important;
          }
        }
      </style>
    `;

    this.setupEventListeners();
  }

  renderAlertsContent() {
    if (this.alerts.length === 0) {
      return `
        <div class="empty-state" style="
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📥</div>
          <h3 style="font-family: var(--font-display); margin: 0 0 0.5rem 0;">
            Không có cảnh báo nào
          </h3>
          <p>Hệ thống đang hoạt động bình thường. Tất cả chỉ số trong tầm kiểm soát.</p>
        </div>
      `;
    }

    // Render grouped by severity
    return `
      <div class="severity-groups">
        ${['critical', 'warn', 'info']
          .filter(severity => this.groupedAlerts[severity]?.length > 0)
          .map(severity => {
            const severityGroup = new SeverityGroup(
              severity,
              this.groupedAlerts[severity],
              (alertIds) => this.acknowledgeAlerts(alertIds)
            );
            return severityGroup.render();
          })
          .join('')}
      </div>
    `;
  }

  setupEventListeners() {
    // Filters
    const severityFilter = document.getElementById('severity-filter');
    const statusFilter = document.getElementById('status-filter');

    if (severityFilter) {
      severityFilter.value = this.filters.severity || '';
      severityFilter.addEventListener('change', (e) => {
        this.filters.severity = e.target.value || null;
        this.loadAlerts();
      });
    }

    if (statusFilter) {
      statusFilter.value = this.filters.acknowledged?.toString() || '';
      statusFilter.addEventListener('change', (e) => {
        const value = e.target.value;
        this.filters.acknowledged = value === '' ? null : value === 'true';
        this.loadAlerts();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadAlerts();
      });
    }

    // Acknowledge all button
    const ackAllBtn = document.getElementById('ack-all-btn');
    if (ackAllBtn) {
      ackAllBtn.addEventListener('click', () => {
        const unackIds = this.alerts
          .filter(a => !a.acknowledged)
          .map(a => a.id);

        if (unackIds.length > 0) {
          this.acknowledgeAlerts(unackIds);
        }
      });
    }

    // Setup event listeners for rendered components
    setTimeout(() => {
      ['critical', 'warn', 'info'].forEach(severity => {
        if (this.groupedAlerts[severity]?.length > 0) {
          const severityGroup = new SeverityGroup(
            severity,
            this.groupedAlerts[severity],
            (alertIds) => this.acknowledgeAlerts(alertIds)
          );
          severityGroup.setupEventListeners();
        }
      });

      // Individual alert cards
      this.alerts.forEach(alert => {
        const alertCard = new AlertCard(alert, (alertIds) => this.acknowledgeAlerts(alertIds));
        alertCard.setupEventListeners();
      });
    }, 100);
  }

  updateLoadingState() {
    const indicator = document.getElementById('loading-indicator');
    const content = document.getElementById('alerts-content');

    if (this.loading) {
      if (indicator) indicator.style.display = 'block';
      if (content) content.style.opacity = '0.5';
    } else {
      if (indicator) indicator.style.display = 'none';
      if (content) content.style.opacity = '1';
    }
  }

  updateCounters() {
    // Update summary counters without full re-render
    const unacknowledgedCount = this.alerts.filter(a => !a.acknowledged).length;
    const summaryCards = document.querySelectorAll('.summary-card div:first-child');

    if (summaryCards[0]) {
      summaryCards[0].textContent = unacknowledgedCount;
      summaryCards[0].style.color = unacknowledgedCount > 0 ? 'var(--brand-gold)' : 'var(--text-secondary)';
    }

    if (summaryCards[1]) {
      summaryCards[1].textContent = this.alerts.length;
    }
  }

  showNotification(type, message) {
    const notifications = document.getElementById('notifications');
    if (!notifications) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      ">
        <div>
          <div style="font-weight: 500; margin-bottom: 0.25rem;">
            ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
          </div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            ${message}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0;
          font-size: 1.2rem;
        ">×</button>
      </div>
    `;

    notifications.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
}

// Export for use in router
export default AlertsInbox;