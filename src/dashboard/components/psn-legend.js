/**
 * PSN Legend Component - Cửu Địa (Nine Grounds) State Legend
 * Displays the 9 states classification with Vietnamese labels and risk levels
 */

export function createPSNLegend(states, summary) {
  const legendHTML = `
    <div class="psn-legend">
      <div class="legend-header">
        <h3 class="legend-title">
          <span class="legend-icon">🗺️</span>
          Cửu Địa - Hệ thống phân loại PSN
        </h3>
        <p class="legend-subtitle">
          Áp dụng 9 trạng thái từ Binh Pháp Sun Tzu vào đánh giá sức khỏe mạng lưới
        </p>
      </div>

      <div class="legend-stats">
        <div class="stat-card healthy">
          <div class="stat-number">${summary.healthy_count}</div>
          <div class="stat-label">Ổn định</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-number">${summary.at_risk_count}</div>
          <div class="stat-label">Cảnh báo</div>
        </div>
        <div class="stat-card critical">
          <div class="stat-number">${summary.critical_count}</div>
          <div class="stat-label">Nghiêm trọng</div>
        </div>
      </div>

      <div class="legend-grid">
        ${states.map(state => createStateItem(state)).join('')}
      </div>

      <div class="legend-footer">
        <p class="methodology-note">
          <strong>Phương pháp:</strong> Dựa trên team_size, retention_rate (30d/90d), revenue_delta và activity_ratio
        </p>
      </div>
    </div>
  `;

  return legendHTML;
}

function createStateItem(state) {
  const riskClassMap = {
    'low': 'risk-low',
    'medium': 'risk-medium',
    'high': 'risk-high',
    'critical': 'risk-critical'
  };

  const riskIcon = {
    'low': '✅',
    'medium': '⚠️',
    'high': '🔴',
    'critical': '🚨'
  };

  return `
    <div class="legend-item ${riskClassMap[state.risk_level]}" data-state-id="${state.id}">
      <div class="state-indicator">
        <div class="state-number">${state.id}</div>
        <div class="state-color" style="background-color: ${state.color}"></div>
      </div>
      <div class="state-content">
        <div class="state-header">
          <h4 class="state-name">${state.name}</h4>
          <span class="state-name-en">(${state.name_en})</span>
          <span class="risk-indicator">${riskIcon[state.risk_level]}</span>
        </div>
        <p class="state-description">${state.description}</p>
        <div class="state-meta">
          <span class="risk-level ${state.risk_level}">
            ${getRiskLevelText(state.risk_level)}
          </span>
        </div>
      </div>
    </div>
  `;
}

function getRiskLevelText(level) {
  const levelMap = {
    'low': 'Mức độ thấp',
    'medium': 'Cảnh báo',
    'high': 'Rủi ro cao',
    'critical': 'Nghiêm trọng'
  };
  return levelMap[level] || level;
}

// CSS styles for the legend component
export const psnLegendStyles = `
  .psn-legend {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }

  .legend-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }

  .legend-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .legend-icon {
    font-size: 1.25em;
  }

  .legend-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  .legend-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--surface-primary);
    border-radius: var(--border-radius-md);
  }

  .stat-card {
    text-align: center;
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
    min-width: 80px;
  }

  .stat-card.healthy {
    background: rgba(75, 181, 67, 0.1);
    border: 1px solid rgba(75, 181, 67, 0.3);
  }

  .stat-card.warning {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .stat-card.critical {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
  }

  .stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
  }

  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .legend-item {
    background: var(--surface-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .legend-item:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .legend-item.risk-critical {
    border-left: 4px solid var(--status-error);
  }

  .legend-item.risk-high {
    border-left: 4px solid var(--status-warning);
  }

  .legend-item.risk-medium {
    border-left: 4px solid var(--status-warning);
  }

  .legend-item.risk-low {
    border-left: 4px solid var(--status-success);
  }

  .state-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .state-number {
    width: 28px;
    height: 28px;
    background: var(--surface-secondary);
    color: var(--text-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .state-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .state-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .state-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .state-name-en {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-style: italic;
  }

  .risk-indicator {
    font-size: 0.9rem;
    margin-left: auto;
  }

  .state-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0 0 var(--spacing-sm) 0;
  }

  .state-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .risk-level {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
  }

  .risk-level.low {
    background: rgba(75, 181, 67, 0.15);
    color: var(--status-success);
  }

  .risk-level.medium {
    background: rgba(255, 193, 7, 0.15);
    color: var(--status-warning);
  }

  .risk-level.high,
  .risk-level.critical {
    background: rgba(220, 53, 69, 0.15);
    color: var(--status-error);
  }

  .legend-footer {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-md);
  }

  .methodology-note {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    text-align: center;
    margin: 0;
    line-height: 1.4;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .legend-grid {
      grid-template-columns: 1fr;
    }

    .legend-stats {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      text-align: left;
    }

    .legend-title {
      font-size: 1.25rem;
    }
  }
`;

// Event handlers for legend interactions
export function attachPSNLegendEvents(container, onStateFilter) {
  if (!container) return;

  container.addEventListener('click', (event) => {
    const legendItem = event.target.closest('.legend-item');
    if (legendItem && onStateFilter) {
      const stateId = parseInt(legendItem.getAttribute('data-state-id'));

      // Toggle active state
      const isActive = legendItem.classList.contains('active');

      // Remove active from all items if clicking active item
      if (isActive) {
        container.querySelectorAll('.legend-item').forEach(item =>
          item.classList.remove('active'));
        onStateFilter(null); // Clear filter
      } else {
        // Set this item as active
        container.querySelectorAll('.legend-item').forEach(item =>
          item.classList.remove('active'));
        legendItem.classList.add('active');
        onStateFilter(stateId);
      }
    }
  });
}