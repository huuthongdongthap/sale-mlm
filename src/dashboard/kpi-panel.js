/**
 * KPI Tracker Panel Component
 * Displays per-member + team aggregate cards with RED/YELLOW/GREEN status
 * Features weekly sparklines and drill-down modal with 30-day history
 */

import KPICard from './components/kpi-card.js';
import KPIModal from './components/kpi-modal.js';

class KPIPanel {
  constructor() {
    this.currentMemberId = null;
    this.kpiData = null;
    this.isLoading = false;
    this.modal = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }

  setupEventListeners() {
    // Handle member selection from header or URL params
    window.addEventListener('hashchange', () => {
      const urlParams = this.parseURLParams();
      if (urlParams.member_id !== this.currentMemberId) {
        this.currentMemberId = urlParams.member_id;
        this.loadKPIData();
      }
    });

    // Handle refresh button
    document.addEventListener('click', (e) => {
      if (e.target.matches('.kpi-refresh-btn') || e.target.closest('.kpi-refresh-btn')) {
        e.preventDefault();
        this.refreshData();
      }
    });
  }

  parseURLParams() {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    return {
      member_id: params.get('member_id') || 'current'
    };
  }

  async loadInitialData() {
    const urlParams = this.parseURLParams();
    this.currentMemberId = urlParams.member_id;
    await this.loadKPIData();
  }

  async loadKPIData() {
    this.setLoading(true);

    try {
      // Call backend API T-004 KPI rollup endpoint
      const response = await fetch(`https://hive-warfare-os.sadec-marketing-hub.workers.dev/api/kpi/${this.currentMemberId || 'current'}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`KPI API error: ${response.status} ${response.statusText}`);
      }

      this.kpiData = await response.json();
      this.render();

    } catch (error) {
      console.error('Failed to load KPI data:', error);
      this.renderError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async refreshData() {
    await this.loadKPIData();
  }

  getAuthToken() {
    // Get JWT token from localStorage or session
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;

    const container = document.getElementById('page-content');
    if (!container) return;

    if (isLoading) {
      container.classList.add('loading');
    } else {
      container.classList.remove('loading');
    }
  }

  render() {
    const container = document.getElementById('page-content');
    if (!container) {
      console.error('KPIPanel: page-content container not found');
      return;
    }

    container.innerHTML = this.generateHTML();
    this.bindEvents();
  }

  generateHTML() {
    if (!this.kpiData) {
      return this.generateLoadingHTML();
    }

    const { member, kpis, weekly_sparklines, tier_targets } = this.kpiData;

    return `
      <div class="page-header">
        <div class="header-main">
          <h1 class="page-title">📊 KPI Tracker</h1>
          <p class="page-subtitle">Theo dõi hiệu suất ${member.full_name} - ${member.tier || 'Tân Binh'}</p>
        </div>
        <div class="header-actions">
          <button class="kpi-refresh-btn btn-secondary" aria-label="Làm mới dữ liệu">
            <span class="btn-icon">🔄</span>
            Làm mới
          </button>
          <select class="member-selector" aria-label="Chọn thành viên">
            <option value="current">Hiện tại (${member.full_name})</option>
            <option value="team">Tổng hợp nhóm</option>
          </select>
        </div>
      </div>

      <div class="kpi-dashboard">
        <div class="kpi-grid">
          ${this.generateKPICards(kpis, weekly_sparklines, tier_targets)}
        </div>

        <div class="kpi-summary">
          <div class="summary-card">
            <h3 class="summary-title">Tổng quan tuần này</h3>
            <div class="summary-stats">
              ${this.generateSummaryStats(kpis)}
            </div>
          </div>
        </div>
      </div>

      ${this.generateModalHTML()}
    `;
  }

  generateKPICards(kpis, sparklines, targets) {
    if (!kpis || !Array.isArray(kpis)) {
      return '<div class="error-state">Không có dữ liệu KPI</div>';
    }

    return kpis.map(kpi => {
      const sparklineData = sparklines[kpi.metric] || [];
      const target = targets[kpi.metric] || {};

      const kpiCard = new KPICard({
        metric: kpi.metric,
        current_value: kpi.current_value,
        target_value: target.target_value,
        status: kpi.status, // RED/YELLOW/GREEN from backend
        sparkline: sparklineData,
        trend: kpi.trend || 'stable',
        period: kpi.period || 'weekly'
      });

      return kpiCard.render();
    }).join('');
  }

  generateSummaryStats(kpis) {
    if (!kpis) return '';

    const statusCounts = kpis.reduce((acc, kpi) => {
      acc[kpi.status] = (acc[kpi.status] || 0) + 1;
      return acc;
    }, {});

    const totalKpis = kpis.length;
    const greenPercent = Math.round(((statusCounts.GREEN || 0) / totalKpis) * 100);

    return `
      <div class="stat-item">
        <div class="stat-value">${statusCounts.GREEN || 0}/${totalKpis}</div>
        <div class="stat-label">KPI đạt mục tiêu</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${greenPercent}%</div>
        <div class="stat-label">Tỷ lệ thành công</div>
      </div>
      <div class="stat-item">
        <div class="stat-value status-${(statusCounts.RED || 0) > 0 ? 'red' : 'green'}">
          ${(statusCounts.RED || 0) > 0 ? '⚠️ Cần cải thiện' : '✅ Đạt chuẩn'}
        </div>
        <div class="stat-label">Trạng thái chung</div>
      </div>
    `;
  }

  generateLoadingHTML() {
    return `
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Đang tải dữ liệu hiệu suất...</p>
      </div>

      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải KPI từ hệ thống...</p>
      </div>
    `;
  }

  generateModalHTML() {
    return '<div id="kpi-modal-container"></div>';
  }

  renderError(message) {
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Lỗi tải dữ liệu</p>
      </div>

      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <h3>Không thể tải dữ liệu KPI</h3>
          <p>${message}</p>
          <button class="kpi-refresh-btn btn-primary" style="margin-top: 1rem;">
            Thử lại
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Handle KPI card clicks for drill-down modal
    document.addEventListener('click', (e) => {
      const kpiCard = e.target.closest('.kpi-card');
      if (kpiCard) {
        const metric = kpiCard.dataset.metric;
        this.openKPIModal(metric);
      }
    });

    // Handle member selector change
    const memberSelector = document.querySelector('.member-selector');
    if (memberSelector) {
      memberSelector.addEventListener('change', (e) => {
        const newMemberId = e.target.value;
        this.updateURL({ member_id: newMemberId });
      });
    }
  }

  openKPIModal(metric) {
    if (!this.kpiData || !metric) return;

    const kpiItem = this.kpiData.kpis.find(k => k.metric === metric);
    if (!kpiItem) return;

    // Create and show modal with 30-day history
    this.modal = new KPIModal({
      metric: metric,
      member: this.kpiData.member,
      currentKPI: kpiItem,
      tierTarget: this.kpiData.tier_targets[metric],
      onClose: () => this.closeKPIModal()
    });

    this.modal.show();
  }

  closeKPIModal() {
    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }
  }

  updateURL(params) {
    const urlParams = this.parseURLParams();
    const newParams = { ...urlParams, ...params };

    const searchParams = new URLSearchParams(newParams).toString();
    const newHash = `#/kpi${searchParams ? '?' + searchParams : ''}`;

    window.history.pushState(null, '', newHash);

    // Trigger data reload
    this.currentMemberId = newParams.member_id;
    this.loadKPIData();
  }

  // Public API for external components
  getCurrentMemberId() {
    return this.currentMemberId;
  }

  getKPIData() {
    return this.kpiData;
  }
}

// Export for use in router
export default KPIPanel;