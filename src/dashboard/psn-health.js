/**
 * PSN Health View - Main component for PSN health monitoring dashboard
 * Integrates legend, heat list, and handles API interactions with mock data
 */

import { mockPSNHealthData } from '../api/mock/psn-health.js';
import { createPSNLegend, psnLegendStyles, attachPSNLegendEvents } from './components/psn-legend.js';
import { createPSNCard, psnCardStyles, attachPSNCardEvents } from './components/psn-card.js';

class PSNHealthView {
  constructor() {
    this.data = null;
    this.filteredPSNs = [];
    this.activeStateFilter = null;
    this.sortBy = 'state_desc'; // default sort by state descending (critical first)
    this.container = null;

    this.init();
  }

  async init() {
    // Load mock data (replace with real API call when T-005 is complete)
    try {
      this.data = mockPSNHealthData;
      this.filteredPSNs = [...this.data.psns];
      this.applySorting();
      console.log('PSN Health data loaded:', this.data.summary);
    } catch (error) {
      console.error('Failed to load PSN health data:', error);
      this.handleDataLoadError(error);
    }
  }

  render(containerElement) {
    if (!containerElement) {
      console.error('PSN Health View: Container element required');
      return;
    }

    this.container = containerElement;

    if (!this.data) {
      containerElement.innerHTML = this.renderLoadingState();
      return;
    }

    // Inject styles
    this.injectStyles();

    const viewHTML = `
      <div class="psn-health-view">
        <div class="psn-header">
          <h1 class="page-title">PSN Health Monitor</h1>
          <p class="page-subtitle">
            Giám sát sức khỏe Personal Sales Network theo hệ thống Cửu Địa
          </p>
          <div class="header-meta">
            <span class="data-timestamp">
              Cập nhật: ${this.formatTimestamp(this.data.meta.generated_at)}
            </span>
            ${this.data.meta.data_source === 'mock' ?
              '<span class="mock-badge">🚧 Mock Data</span>' : ''
            }
          </div>
        </div>

        <!-- 9-State Legend -->
        <div class="legend-section">
          ${createPSNLegend(this.data.states, this.data.summary)}
        </div>

        <!-- Controls -->
        <div class="controls-section">
          <div class="controls-header">
            <h2 class="section-title">Danh sách PSN (${this.filteredPSNs.length})</h2>
            <div class="controls">
              <select class="sort-select" data-sort>
                <option value="state_desc">Trạng thái: Nghiêm trọng trước</option>
                <option value="state_asc">Trạng thái: Ổn định trước</option>
                <option value="revenue_desc">Doanh thu: Cao nhất</option>
                <option value="revenue_asc">Doanh thu: Thấp nhất</option>
                <option value="team_size_desc">Team size: Lớn nhất</option>
                <option value="retention_desc">Retention: Tốt nhất</option>
                <option value="risk_first">Rủi ro cao trước</option>
              </select>
              ${this.activeStateFilter ?
                `<button class="clear-filter-btn">Xóa bộ lọc trạng thái ${this.activeStateFilter}</button>`
                : ''
              }
            </div>
          </div>
        </div>

        <!-- PSN Cards Grid -->
        <div class="psn-grid-section">
          <div class="psn-grid" id="psn-cards-container">
            ${this.renderPSNCards()}
          </div>
        </div>

        <!-- Summary Footer -->
        <div class="summary-footer">
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="stat-label">Tổng PSN:</span>
              <span class="stat-value">${this.data.summary.total_psns}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Team size TB:</span>
              <span class="stat-value">${this.data.summary.avg_team_size}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Tổng doanh thu:</span>
              <span class="stat-value">${this.formatVND(this.data.summary.total_revenue)}</span>
            </div>
          </div>
          <div class="refresh-section">
            <button class="refresh-btn" id="refresh-data">
              🔄 Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>
    `;

    containerElement.innerHTML = viewHTML;
    this.attachEventListeners();
  }

  renderPSNCards() {
    if (this.filteredPSNs.length === 0) {
      return `
        <div class="no-psns">
          <div class="no-psns-icon">📊</div>
          <h3>Không tìm thấy PSN</h3>
          <p>Thử thay đổi bộ lọc hoặc làm mới dữ liệu</p>
        </div>
      `;
    }

    return this.filteredPSNs.map(psn => createPSNCard(psn)).join('');
  }

  renderLoadingState() {
    return `
      <div class="psn-loading">
        <div class="loading-spinner"></div>
        <h2>Đang tải dữ liệu PSN Health...</h2>
        <p>Phân tích trạng thái Cửu Địa</p>
      </div>
    `;
  }

  handleDataLoadError(error) {
    const errorHTML = `
      <div class="psn-error">
        <div class="error-icon">⚠️</div>
        <h2>Không thể tải dữ liệu PSN</h2>
        <p>Lỗi: ${error.message}</p>
        <p class="error-note">
          <strong>Ghi chú:</strong> Task T-005 (PSN health score) đang được phát triển.
          Hiện tại sử dụng mock data.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          Thử lại
        </button>
      </div>
    `;

    if (this.container) {
      this.container.innerHTML = errorHTML;
    }
  }

  attachEventListeners() {
    if (!this.container) return;

    // Legend filter events
    const legendSection = this.container.querySelector('.legend-section');
    attachPSNLegendEvents(legendSection, (stateId) => {
      this.filterByState(stateId);
    });

    // PSN card events
    const psnGrid = this.container.querySelector('#psn-cards-container');
    attachPSNCardEvents(psnGrid, (psnId) => {
      this.showPSNDetail(psnId);
    });

    // Sort control
    const sortSelect = this.container.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.value = this.sortBy;
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applySorting();
        this.updatePSNGrid();
      });
    }

    // Clear filter button
    const clearFilterBtn = this.container.querySelector('.clear-filter-btn');
    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', () => {
        this.filterByState(null);
      });
    }

    // Refresh button
    const refreshBtn = this.container.querySelector('#refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await this.refreshData();
      });
    }
  }

  filterByState(stateId) {
    this.activeStateFilter = stateId;

    if (stateId === null) {
      this.filteredPSNs = [...this.data.psns];
    } else {
      this.filteredPSNs = this.data.psns.filter(psn =>
        psn.current_state.id === stateId
      );
    }

    this.applySorting();
    this.updateView();
  }

  applySorting() {
    if (!this.filteredPSNs.length) return;

    this.filteredPSNs.sort((a, b) => {
      switch (this.sortBy) {
        case 'state_desc':
          return b.current_state.id - a.current_state.id;
        case 'state_asc':
          return a.current_state.id - b.current_state.id;
        case 'revenue_desc':
          return b.revenue_current - a.revenue_current;
        case 'revenue_asc':
          return a.revenue_current - b.revenue_current;
        case 'team_size_desc':
          return b.team_size - a.team_size;
        case 'retention_desc':
          return b.retention_30d - a.retention_30d;
        case 'risk_first':
          const riskOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (riskOrder[b.current_state.risk_level] || 0) -
                 (riskOrder[a.current_state.risk_level] || 0);
        default:
          return 0;
      }
    });
  }

  updateView() {
    // Re-render the entire view with current filter/sort state
    if (this.container) {
      this.render(this.container);
    }
  }

  updatePSNGrid() {
    // Only update the PSN grid section
    const psnGrid = this.container?.querySelector('#psn-cards-container');
    if (psnGrid) {
      psnGrid.innerHTML = this.renderPSNCards();
      attachPSNCardEvents(psnGrid, (psnId) => {
        this.showPSNDetail(psnId);
      });
    }
  }

  async refreshData() {
    const refreshBtn = this.container?.querySelector('#refresh-data');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '🔄 Đang làm mới...';
    }

    try {
      // In production, this would fetch from real API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // For now, generate new mock data
      const { mockPSNHealthData: newData } = await import('../api/mock/psn-health.js');
      this.data = newData;
      this.filteredPSNs = [...this.data.psns];
      this.activeStateFilter = null;
      this.applySorting();
      this.updateView();

      console.log('PSN Health data refreshed');
    } catch (error) {
      console.error('Failed to refresh PSN data:', error);
      alert('Không thể làm mới dữ liệu. Vui lòng thử lại sau.');
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄 Làm mới dữ liệu';
      }
    }
  }

  showPSNDetail(psnId) {
    // Find PSN data
    const psn = this.data.psns.find(p => p.id === psnId);
    if (!psn) {
      console.error('PSN not found:', psnId);
      return;
    }

    // Show detail modal/page - for now just alert
    // In production, this would navigate to detail page with buddy assignment CTA
    const detailInfo = `
PSN: ${psn.id} - ${psn.leader_name}
Trạng thái: ${psn.current_state.name} (${psn.current_state.id})
Team: ${psn.team_size} thành viên
Retention 30d: ${psn.retention_30d}%
Doanh thu: ${this.formatVND(psn.revenue_current)}
Rủi ro: ${psn.top_risk}
${psn.buddy_assigned ? `Buddy: ${psn.buddy_assigned}` : 'Chưa có buddy'}

[Trang chi tiết PSN với CTA buddy assignment sẽ được implement ở task khác]
    `.trim();

    alert(detailInfo);

    // TODO: Navigate to detail page
    // this.router.navigateTo(`/psn/${psnId}`);
  }

  injectStyles() {
    const styleId = 'psn-health-styles';
    if (document.getElementById(styleId)) return; // Already injected

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ${psnLegendStyles}
      ${psnCardStyles}
      ${psnHealthViewStyles}
    `;

    document.head.appendChild(style);
  }

  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatTimestamp(isoString) {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  }
}

// Additional styles for the main PSN health view
const psnHealthViewStyles = `
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

export default PSNHealthView;