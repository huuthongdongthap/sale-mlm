/**
 * Severity Group Component - Groups alerts by severity level
 * Part of T-011 alerts inbox implementation
 */

export class SeverityGroup {
  constructor(severity, alerts, onAcknowledge) {
    this.severity = severity;
    this.alerts = alerts;
    this.onAcknowledge = onAcknowledge;
  }

  getSeverityConfig() {
    const configs = {
      critical: {
        label: 'Nghiêm trọng',
        icon: '🚨',
        color: '#FF4444',
        bgColor: 'rgba(255, 68, 68, 0.1)',
        borderColor: 'rgba(255, 68, 68, 0.3)'
      },
      warn: {
        label: 'Cảnh báo',
        icon: '⚠️',
        color: '#FFB300',
        bgColor: 'rgba(255, 179, 0, 0.1)',
        borderColor: 'rgba(255, 179, 0, 0.3)'
      },
      info: {
        label: 'Thông tin',
        icon: 'ℹ️',
        color: '#00BCD4',
        bgColor: 'rgba(0, 188, 212, 0.1)',
        borderColor: 'rgba(0, 188, 212, 0.3)'
      }
    };
    return configs[this.severity] || configs.info;
  }

  render() {
    if (this.alerts.length === 0) {
      return '';
    }

    const config = this.getSeverityConfig();
    const unacknowledgedCount = this.alerts.filter(a => !a.acknowledged).length;

    return `
      <div class="severity-group" data-severity="${this.severity}">
        <div class="severity-header" style="
          border-left: 4px solid ${config.color};
          background: ${config.bgColor};
          border: 1px solid ${config.borderColor};
        ">
          <div class="severity-info">
            <span class="severity-icon">${config.icon}</span>
            <h3 class="severity-title">${config.label}</h3>
            <span class="severity-badge" style="
              background: ${config.color};
              color: var(--surface-primary);
            ">
              ${this.alerts.length}
            </span>
            ${unacknowledgedCount > 0 ? `
              <span class="unack-badge" style="
                background: var(--brand-gold);
                color: var(--surface-primary);
              ">
                ${unacknowledgedCount} chưa xử lý
              </span>
            ` : ''}
          </div>

          <div class="severity-actions">
            ${unacknowledgedCount > 0 ? `
              <button class="bulk-ack-btn"
                      data-severity="${this.severity}"
                      style="
                        background: var(--brand-gold);
                        color: var(--surface-primary);
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        transition: all 0.2s ease;
                      "
                      onmouseover="this.style.background='var(--brand-gold-electric)'"
                      onmouseout="this.style.background='var(--brand-gold)'">
                Xử lý tất cả (${unacknowledgedCount})
              </button>
            ` : ''}

            <button class="toggle-group-btn"
                    data-severity="${this.severity}"
                    style="
                      background: transparent;
                      color: var(--text-secondary);
                      border: 1px solid var(--border-color);
                      padding: 0.5rem;
                      border-radius: 4px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    "
                    onmouseover="this.style.borderColor='${config.color}'; this.style.color='${config.color}'"
                    onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)'">
              <span class="toggle-icon">▼</span>
            </button>
          </div>
        </div>

        <div class="alerts-list" data-group="${this.severity}">
          ${this.alerts.map(alert => this.renderAlert(alert, config)).join('')}
        </div>
      </div>
    `;
  }

  renderAlert(alert, config) {
    const isAcknowledged = alert.acknowledged;
    const timeAgo = this.formatTimeAgo(alert.created_at);

    return `
      <div class="alert-card ${isAcknowledged ? 'acknowledged' : ''}"
           data-alert-id="${alert.id}"
           style="
             border-left: 3px solid ${config.color};
             background: var(--surface-secondary);
             margin: 0.75rem 0;
             padding: 1rem;
             border-radius: 0 6px 6px 0;
             transition: all 0.2s ease;
             opacity: ${isAcknowledged ? '0.7' : '1'};
           ">

        <div class="alert-header">
          <div class="alert-meta">
            <span class="alert-rule" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
            ">
              ${alert.rule}
            </span>
            <span class="alert-time" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
            ">
              ${timeAgo}
            </span>
          </div>

          ${!isAcknowledged ? `
            <button class="ack-btn"
                    data-alert-id="${alert.id}"
                    style="
                      background: var(--brand-gold);
                      color: var(--surface-primary);
                      border: none;
                      padding: 0.375rem 0.75rem;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 0.75rem;
                      font-weight: 500;
                      transition: all 0.2s ease;
                    "
                    onmouseover="this.style.background='var(--brand-gold-electric)'"
                    onmouseout="this.style.background='var(--brand-gold)'">
              ✓ Xử lý
            </button>
          ` : `
            <div class="ack-status" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
              display: flex;
              align-items: center;
              gap: 0.25rem;
            ">
              ✅ Đã xử lý
              <span style="color: var(--text-quaternary);">
                ${this.formatTimeAgo(alert.acknowledged_at)}
              </span>
            </div>
          `}
        </div>

        <h4 class="alert-title" style="
          font-family: var(--font-display);
          font-size: 1.1rem;
          margin: 0.5rem 0;
          color: var(--text-primary);
          line-height: 1.3;
        ">
          ${alert.title}
        </h4>

        <div class="alert-evidence" style="
          background: var(--surface-primary);
          padding: 0.75rem;
          border-radius: 4px;
          margin: 0.75rem 0;
          border: 1px solid var(--border-color);
        ">
          <div class="evidence-label" style="
            font-size: 0.75rem;
            color: var(--text-tertiary);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          ">
            Bằng chứng
          </div>
          <div class="evidence-text" style="
            font-family: var(--font-mono);
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.4;
          ">
            ${alert.evidence}
          </div>
        </div>

        <div class="suggested-action" style="
          background: rgba(201, 162, 0, 0.1);
          border: 1px solid rgba(201, 162, 0, 0.3);
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 0.75rem;
        ">
          <div class="action-label" style="
            font-size: 0.75rem;
            color: var(--brand-gold);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          ">
            💡 Hành động đề xuất
          </div>
          <div class="action-text" style="
            font-size: 0.875rem;
            color: var(--text-primary);
            line-height: 1.4;
            font-weight: 500;
          ">
            ${alert.suggested_action}
          </div>
        </div>

        ${alert.member_name && alert.member_name !== 'System' ? `
          <div class="alert-member" style="
            margin-top: 0.75rem;
            font-size: 0.75rem;
            color: var(--text-tertiary);
          ">
            👤 Liên quan: <span style="color: var(--text-secondary); font-weight: 500;">${alert.member_name}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return time.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  setupEventListeners() {
    // Individual ACK buttons
    document.querySelectorAll('.ack-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        if (alertId && this.onAcknowledge) {
          this.onAcknowledge([alertId]);
        }
      });
    });

    // Bulk ACK buttons
    document.querySelectorAll('.bulk-ack-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const severity = e.target.dataset.severity;
        const unackAlerts = this.alerts
          .filter(a => a.severity === severity && !a.acknowledged)
          .map(a => a.id);

        if (unackAlerts.length > 0 && this.onAcknowledge) {
          this.onAcknowledge(unackAlerts);
        }
      });
    });

    // Toggle group collapse
    document.querySelectorAll('.toggle-group-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const severity = e.target.dataset.severity;
        const alertsList = document.querySelector(`[data-group="${severity}"]`);
        const toggleIcon = e.target.querySelector('.toggle-icon');

        if (alertsList) {
          const isCollapsed = alertsList.style.display === 'none';
          alertsList.style.display = isCollapsed ? 'block' : 'none';
          toggleIcon.textContent = isCollapsed ? '▼' : '▶';
        }
      });
    });
  }
}