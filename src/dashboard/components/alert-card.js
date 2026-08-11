/**
 * Alert Card Component - Individual alert display
 * Handles display and interaction for single alert items
 * Part of T-011 alerts inbox implementation
 */

export class AlertCard {
  constructor(alert, onAcknowledge) {
    this.alert = alert;
    this.onAcknowledge = onAcknowledge;
  }

  getSeverityStyle() {
    const styles = {
      critical: {
        borderColor: '#FF4444',
        iconBg: 'rgba(255, 68, 68, 0.1)',
        icon: '🚨'
      },
      warn: {
        borderColor: '#FFB300',
        iconBg: 'rgba(255, 179, 0, 0.1)',
        icon: '⚠️'
      },
      info: {
        borderColor: '#00BCD4',
        iconBg: 'rgba(0, 188, 212, 0.1)',
        icon: 'ℹ️'
      }
    };
    return styles[this.alert.severity] || styles.info;
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

  render() {
    const style = this.getSeverityStyle();
    const isAcknowledged = this.alert.acknowledged;

    return `
      <div class="alert-card ${isAcknowledged ? 'acknowledged' : ''}"
           data-alert-id="${this.alert.id}"
           data-severity="${this.alert.severity}"
           style="
             background: var(--surface-secondary);
             border: 1px solid var(--border-color);
             border-left: 4px solid ${style.borderColor};
             border-radius: 0 8px 8px 0;
             padding: 1.25rem;
             margin: 1rem 0;
             transition: all 0.3s ease;
             opacity: ${isAcknowledged ? '0.7' : '1'};
             position: relative;
           "
           onmouseover="this.style.transform='translateX(4px)'; this.style.borderLeftWidth='6px'"
           onmouseout="this.style.transform='translateX(0)'; this.style.borderLeftWidth='4px'">

        <!-- Alert Header -->
        <div class="alert-header" style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        ">
          <div class="alert-meta" style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="severity-icon" style="
                background: ${style.iconBg};
                padding: 0.25rem;
                border-radius: 4px;
                font-size: 0.875rem;
              ">
                ${style.icon}
              </span>
              <span class="alert-rule" style="
                font-family: var(--font-mono);
                font-size: 0.75rem;
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
              ">
                ${this.alert.rule}
              </span>
            </div>
            <span class="alert-timestamp" style="
              font-size: 0.75rem;
              color: var(--text-quaternary);
              font-family: var(--font-mono);
            ">
              ${this.formatTimeAgo(this.alert.created_at)}
            </span>
          </div>

          <div class="alert-actions">
            ${!isAcknowledged ? `
              <button class="acknowledge-btn"
                      data-alert-id="${this.alert.id}"
                      style="
                        background: var(--brand-gold);
                        color: var(--surface-primary);
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 600;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(201, 162, 0, 0.2);
                      "
                      onmouseover="this.style.background='var(--brand-gold-electric)'; this.style.transform='translateY(-1px)'"
                      onmouseout="this.style.background='var(--brand-gold)'; this.style.transform='translateY(0)'">
                ✓ Xử lý ngay
              </button>
            ` : `
              <div class="acknowledged-status" style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: var(--text-tertiary);
              ">
                <span style="color: #4CAF50;">✅</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                  <span>Đã xử lý</span>
                  <span style="color: var(--text-quaternary);">
                    ${this.formatTimeAgo(this.alert.acknowledged_at)}
                  </span>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Alert Title -->
        <h4 class="alert-title" style="
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        ">
          ${this.alert.title}
        </h4>

        <!-- Evidence Section -->
        <div class="alert-evidence" style="
          background: var(--surface-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        ">
          <div class="evidence-header" style="
            font-size: 0.75rem;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          ">
            📊 Bằng chứng
          </div>
          <div class="evidence-content" style="
            font-family: var(--font-mono);
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.5;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.75rem;
            border-radius: 4px;
            border-left: 3px solid ${style.borderColor};
          ">
            ${this.alert.evidence}
          </div>
        </div>

        <!-- Suggested Action Section -->
        <div class="suggested-action" style="
          background: linear-gradient(135deg, rgba(201, 162, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 1px solid rgba(201, 162, 0, 0.3);
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        ">
          <div class="action-header" style="
            font-size: 0.75rem;
            color: var(--brand-gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          ">
            💡 Hành động đề xuất
          </div>
          <div class="action-content" style="
            font-size: 0.9rem;
            color: var(--text-primary);
            line-height: 1.5;
            font-weight: 500;
          ">
            ${this.alert.suggested_action}
          </div>
        </div>

        <!-- Member Info (if applicable) -->
        ${this.alert.member_name && this.alert.member_name !== 'System' ? `
          <div class="alert-member-info" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          ">
            <div style="
              background: rgba(0, 188, 212, 0.1);
              padding: 0.375rem;
              border-radius: 4px;
              font-size: 0.875rem;
            ">
              👤
            </div>
            <div style="
              display: flex;
              flex-direction: column;
              gap: 0.125rem;
            ">
              <span style="
                font-size: 0.75rem;
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
              ">
                Thành viên liên quan
              </span>
              <span style="
                font-size: 0.875rem;
                color: var(--text-primary);
                font-weight: 500;
              ">
                ${this.alert.member_name}
              </span>
            </div>
          </div>
        ` : ''}

        <!-- Audit Trail (if acknowledged) -->
        ${isAcknowledged ? `
          <div class="audit-trail" style="
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.75rem;
            color: var(--text-quaternary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <span>🔍</span>
            <span>
              Audit: Đã xử lý bởi ${this.alert.acknowledged_by || 'system'}
              lúc ${this.formatTimeAgo(this.alert.acknowledged_at)}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    const card = document.querySelector(`[data-alert-id="${this.alert.id}"]`);
    if (!card) return;

    const ackBtn = card.querySelector('.acknowledge-btn');
    if (ackBtn && this.onAcknowledge) {
      ackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const alertId = e.target.dataset.alertId;
        if (alertId) {
          // Disable button during processing
          e.target.disabled = true;
          e.target.textContent = 'Đang xử lý...';

          this.onAcknowledge([alertId]).finally(() => {
            // Re-enable if still exists (might be removed after ACK)
            if (e.target) {
              e.target.disabled = false;
              e.target.textContent = '✓ Xử lý ngay';
            }
          });
        }
      });
    }
  }

  static renderBatch(alerts, onAcknowledge) {
    return alerts.map(alert => new AlertCard(alert, onAcknowledge).render()).join('');
  }
}