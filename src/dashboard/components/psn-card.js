/**
 * PSN Card Component - Individual PSN health display
 * Shows current state, 4-week trajectory, and top risk with click-to-detail functionality
 */

export function createPSNCard(psn) {
  const revenueFormatted = formatVND(psn.revenue_current);
  const revenueDeltaIcon = psn.revenue_delta >= 0 ? '📈' : '📉';
  const revenueDeltaClass = psn.revenue_delta >= 0 ? 'positive' : 'negative';

  const escalationBadge = getEscalationBadge(psn.escalation_level);
  const trajectoryChart = createTrajectoryChart(psn.trajectory_4weeks, psn.current_state);

  const cardHTML = `
    <div class="psn-card"
         data-psn-id="${psn.id}"
         data-state-id="${psn.current_state.id}"
         data-risk-level="${psn.current_state.risk_level}">

      <div class="psn-card-header">
        <div class="psn-info">
          <h3 class="psn-title">${psn.id}</h3>
          <p class="psn-leader">${psn.leader_name}</p>
        </div>
        <div class="psn-status">
          ${escalationBadge}
          <div class="state-indicator" style="background-color: ${psn.current_state.color}">
            ${psn.current_state.id}
          </div>
        </div>
      </div>

      <div class="psn-current-state">
        <div class="state-info">
          <h4 class="state-name">${psn.current_state.name}</h4>
          <p class="state-description">${psn.current_state.description}</p>
        </div>
      </div>

      <div class="psn-metrics">
        <div class="metric">
          <div class="metric-label">Team Size</div>
          <div class="metric-value">${psn.team_size} thành viên</div>
        </div>

        <div class="metric">
          <div class="metric-label">Retention 30d</div>
          <div class="metric-value">${psn.retention_30d}%</div>
        </div>

        <div class="metric">
          <div class="metric-label">Doanh thu tháng</div>
          <div class="metric-value">
            ${revenueFormatted}
            <span class="revenue-delta ${revenueDeltaClass}">
              ${revenueDeltaIcon} ${psn.revenue_delta >= 0 ? '+' : ''}${psn.revenue_delta}%
            </span>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Activity Ratio</div>
          <div class="metric-value">${psn.activity_ratio}%</div>
        </div>
      </div>

      <div class="psn-trajectory">
        <div class="trajectory-header">
          <h5>Xu hướng 4 tuần</h5>
          <span class="trajectory-trend ${psn.current_state.trend}">${getTrendIcon(psn.current_state.trend)}</span>
        </div>
        <div class="trajectory-chart">
          ${trajectoryChart}
        </div>
      </div>

      <div class="psn-risk">
        <div class="risk-header">
          <span class="risk-icon">⚠️</span>
          <strong>Rủi ro hàng đầu:</strong>
        </div>
        <p class="risk-text">${psn.top_risk}</p>
      </div>

      ${psn.buddy_assigned ? `
        <div class="psn-buddy">
          <span class="buddy-icon">👥</span>
          <span class="buddy-text">Buddy: <strong>${psn.buddy_assigned}</strong></span>
        </div>
      ` : ''}

      <div class="psn-card-footer">
        <div class="last-updated">
          Cập nhật: ${formatTimeAgo(psn.last_updated)}
        </div>
        <button class="btn-detail" data-psn-id="${psn.id}">
          Chi tiết & CTA
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;

  return cardHTML;
}

function createTrajectoryChart(trajectory, currentState) {
  if (!trajectory || trajectory.length === 0) {
    return '<div class="trajectory-no-data">Chưa có dữ liệu</div>';
  }

  const maxState = 9;
  const chartWidth = 100; // percentage
  const pointSpacing = chartWidth / (trajectory.length - 1);

  const points = trajectory.map((point, index) => {
    const x = index * pointSpacing;
    const y = ((maxState - point.state_id) / maxState) * 100; // Invert Y axis (1 = top, 9 = bottom)
    return { x, y, state_id: point.state_id, week: point.week };
  });

  // Create SVG path
  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const chartHTML = `
    <div class="trajectory-svg-container">
      <svg viewBox="0 0 100 100" class="trajectory-svg">
        <!-- Grid lines -->
        ${Array.from({length: 9}, (_, i) => {
          const y = (i / 8) * 100;
          return `<line x1="0" y1="${y}" x2="100" y2="${y}" class="grid-line" />`;
        }).join('')}

        <!-- Trajectory line -->
        <path d="${pathData}" class="trajectory-line" />

        <!-- Data points -->
        ${points.map(point => `
          <circle cx="${point.x}" cy="${point.y}" r="2" class="trajectory-point"
                  data-week="${point.week}" data-state="${point.state_id}" />
        `).join('')}

        <!-- Current state highlight -->
        <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}"
                r="3" class="current-point" />
      </svg>

      <!-- Y-axis labels -->
      <div class="y-axis-labels">
        ${Array.from({length: 9}, (_, i) => `
          <span class="y-label" style="top: ${(i / 8) * 100}%">${9 - i}</span>
        `).join('')}
      </div>
    </div>
  `;

  return chartHTML;
}

function getEscalationBadge(escalationLevel) {
  const badgeMap = {
    'normal': { icon: '✅', text: 'Bình thường', class: 'normal' },
    'watch': { icon: '👀', text: 'Theo dõi', class: 'watch' },
    'urgent': { icon: '🚨', text: 'Khẩn cấp', class: 'urgent' }
  };

  const badge = badgeMap[escalationLevel] || badgeMap['normal'];

  return `
    <div class="escalation-badge ${badge.class}">
      <span class="badge-icon">${badge.icon}</span>
      <span class="badge-text">${badge.text}</span>
    </div>
  `;
}

function getTrendIcon(trend) {
  const trendMap = {
    'up': '⬆️',
    'down': '⬇️',
    'stable': '➡️',
    'volatile': '🌊',
    'critical': '💥'
  };
  return trendMap[trend] || '➡️';
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatTimeAgo(isoString) {
  const now = new Date();
  const time = new Date(isoString);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

// CSS styles for PSN cards
export const psnCardStyles = `
  .psn-card {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    transition: all 0.2s ease;
    cursor: pointer;
    height: fit-content;
  }

  .psn-card:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .psn-card[data-risk-level="critical"] {
    border-left: 4px solid var(--status-error);
  }

  .psn-card[data-risk-level="high"] {
    border-left: 4px solid var(--status-warning);
  }

  .psn-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .psn-title {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .psn-leader {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: var(--spacing-xs) 0 0 0;
  }

  .psn-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .state-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 1rem;
  }

  .escalation-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .escalation-badge.normal {
    background: rgba(75, 181, 67, 0.15);
    color: var(--status-success);
  }

  .escalation-badge.watch {
    background: rgba(255, 193, 7, 0.15);
    color: var(--status-warning);
  }

  .escalation-badge.urgent {
    background: rgba(220, 53, 69, 0.15);
    color: var(--status-error);
  }

  .psn-current-state {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--surface-primary);
    border-radius: var(--border-radius-sm);
  }

  .state-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }

  .state-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .psn-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .metric {
    background: var(--surface-primary);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-xs);
  }

  .metric-label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .metric-value {
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-top: 2px;
    font-family: var(--font-mono);
  }

  .revenue-delta {
    display: block;
    font-size: 0.75rem;
    margin-top: 2px;
  }

  .revenue-delta.positive {
    color: var(--status-success);
  }

  .revenue-delta.negative {
    color: var(--status-error);
  }

  .psn-trajectory {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--surface-primary);
    border-radius: var(--border-radius-sm);
  }

  .trajectory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .trajectory-header h5 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 600;
  }

  .trajectory-trend {
    font-size: 1rem;
  }

  .trajectory-chart {
    height: 60px;
    position: relative;
  }

  .trajectory-svg-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .trajectory-svg {
    width: 100%;
    height: 100%;
  }

  .grid-line {
    stroke: var(--border-secondary);
    stroke-width: 0.5;
    opacity: 0.5;
  }

  .trajectory-line {
    fill: none;
    stroke: var(--brand-gold);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trajectory-point {
    fill: var(--brand-gold);
    stroke: var(--surface-primary);
    stroke-width: 1;
  }

  .current-point {
    fill: var(--brand-gold-electric);
    stroke: var(--surface-primary);
    stroke-width: 2;
  }

  .y-axis-labels {
    position: absolute;
    left: -20px;
    top: 0;
    height: 100%;
    width: 15px;
  }

  .y-label {
    position: absolute;
    font-size: 0.6rem;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    transform: translateY(-50%);
  }

  .trajectory-no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: var(--text-tertiary);
    font-size: 0.8rem;
    font-style: italic;
  }

  .psn-risk {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: rgba(255, 193, 7, 0.05);
    border-left: 3px solid var(--status-warning);
    border-radius: var(--border-radius-xs);
  }

  .risk-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    font-size: 0.85rem;
    color: var(--status-warning);
  }

  .risk-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .psn-buddy {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: rgba(75, 181, 67, 0.05);
    border-left: 3px solid var(--status-success);
    border-radius: var(--border-radius-xs);
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .psn-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-sm);
  }

  .last-updated {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .btn-detail {
    background: var(--brand-gold);
    color: var(--surface-primary);
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-xs);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .btn-detail:hover {
    background: var(--brand-gold-electric);
    transform: translateX(2px);
  }

  .btn-arrow {
    transition: transform 0.2s ease;
  }

  .btn-detail:hover .btn-arrow {
    transform: translateX(2px);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .psn-card {
      padding: var(--spacing-md);
    }

    .psn-metrics {
      grid-template-columns: 1fr;
    }

    .psn-card-footer {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    .btn-detail {
      justify-content: center;
    }
  }
`;

// Event handlers for PSN card interactions
export function attachPSNCardEvents(container, onDetailClick) {
  if (!container) return;

  container.addEventListener('click', (event) => {
    const detailBtn = event.target.closest('.btn-detail');
    const psnCard = event.target.closest('.psn-card');

    if (detailBtn && onDetailClick) {
      event.stopPropagation();
      const psnId = detailBtn.getAttribute('data-psn-id');
      onDetailClick(psnId);
    } else if (psnCard && onDetailClick) {
      // Card click also triggers detail view
      const psnId = psnCard.getAttribute('data-psn-id');
      onDetailClick(psnId);
    }
  });

  // Add hover effects for trajectory points
  container.addEventListener('mouseover', (event) => {
    const point = event.target.closest('.trajectory-point');
    if (point) {
      const week = point.getAttribute('data-week');
      const state = point.getAttribute('data-state');
      // Could show tooltip with week/state info
      point.setAttribute('title', `Tuần ${week}: Trạng thái ${state}`);
    }
  });
}