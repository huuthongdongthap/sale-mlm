/**
 * Route content renderers for the Dashboard Router
 * Each function returns HTML string or uses dynamic import for lazy-loaded components.
 */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function renderHomepage() {
  return `
    <div class="page-header">
      <h1 class="page-title">Chào mừng đến với Hive Warfare Academy</h1>
      <p class="page-subtitle">Hệ thống đào tạo Droppii Training OS - Nền tảng phát triển chiến binh bán hàng</p>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3 class="card-title">📊 Tổng quan hệ thống</h3>
        <p>Dashboard tổng hợp dữ liệu training, KPI và PSN health của toàn bộ academy.</p>
        <div class="coming-soon">Đang phát triển...</div>
      </div>

      <div class="card">
        <h3 class="card-title">🎯 Sun Tzu Warfare Methodology</h3>
        <p>Áp dụng 13 chương Binh Pháp vào hệ thống đào tạo sales MLM hiện đại.</p>
        <div class="coming-soon">Sẽ ra mắt trong các module tiếp theo</div>
      </div>

      <div class="card">
        <h3 class="card-title">🏆 Training Architecture</h3>
        <ul style="margin-top: 1rem; color: var(--text-secondary);">
          <li><strong>Tier 1:</strong> Tân Binh → Chiến Binh (4 tuần)</li>
          <li><strong>Tier 2:</strong> Chiến Binh → Chỉ Huy (8 tuần)</li>
          <li><strong>Tier 3:</strong> Chỉ Huy → Tướng Quân (12 tuần)</li>
        </ul>
      </div>

      <div class="card">
        <h3 class="card-title">🤖 AI Agents</h3>
        <p>6 AI agents hỗ trợ training, retention, campaign và analytics tự động.</p>
        <div class="coming-soon">Đang tích hợp...</div>
      </div>
    </div>
  `;
}

export async function renderMembersPage() {
  try {
    const { renderMembersTablePage } = await import('./members-table.js');
    const container = document.createElement('div');
    renderMembersTablePage(container);
    return container.innerHTML;
  } catch (error) {
    console.error('Error loading members page:', error);
    return `
      <div class="page-header">
        <h1 class="page-title">Quản lý thành viên</h1>
        <p class="page-subtitle">Theo dõi và quản lý toàn bộ thành viên trong Hive Warfare Academy</p>
      </div>

      <div class="card">
        <h3 class="card-title">❌ Lỗi tải trang</h3>
        <p>Không thể tải trang quản lý thành viên: ${escapeHtml(error.message)}</p>
        <button onclick="window.location.reload()" style="
          background: var(--brand-gold);
          border: none;
          color: var(--surface-primary);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          cursor: pointer;
          margin-top: var(--spacing-md);
        ">
          🔄 Tải lại
        </button>
      </div>
    `;
  }
}

export function renderPSNPage() {
  const container = document.createElement('div');
  container.id = 'psn-health-container';

  import('./psn-health.js').then(module => {
    const PSNHealthView = module.default;
    const psnHealthView = new PSNHealthView();
    psnHealthView.render(container);
  }).catch(error => {
    console.error('Failed to load PSN Health View:', error);
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">PSN Health Monitor</h1>
        <p class="page-subtitle">Giám sát sức khỏe Personal Sales Network theo 9 trạng thái Cửu Địa</p>
      </div>
      <div class="card">
        <h3 class="card-title">⚠️ Lỗi tải component</h3>
        <p>Không thể tải PSN Health View. Chi tiết lỗi: ${escapeHtml(error.message)}</p>
        <p><strong>Ghi chú:</strong> PSN Health View với mock data từ T-010 đang development.</p>
      </div>
    `;
  });

  return container.outerHTML;
}

export function renderKPIPage(contentContainer) {
  import('./kpi-panel.js').then(module => {
    const KPIPanel = module.default;
    const kpiPanel = new KPIPanel();
  }).catch(error => {
    console.error('Failed to load KPI panel:', error);
    if (contentContainer) {
      contentContainer.innerHTML = renderKPIPlaceholder();
    }
  });

  return `
    <div class="page-header">
      <h1 class="page-title">📊 KPI Tracker</h1>
      <p class="page-subtitle">Đang tải bảng điều khiển KPI...</p>
    </div>

    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Đang khởi tạo KPI Tracker...</p>
    </div>
  `;
}

export function renderKPIPlaceholder() {
  return `
    <div class="page-header">
      <h1 class="page-title">📊 KPI Tracker</h1>
      <p class="page-subtitle">Theo dõi các chỉ số hiệu suất quan trọng theo từng tier và mục tiêu</p>
    </div>

    <div class="card">
      <h3 class="card-title">🎯 Performance Metrics</h3>
      <p>Tracking connects/day, follow-ups/day, first-order-14d với trạng thái RED/YELLOW/GREEN.</p>
      <div class="coming-soon">
        Lỗi tải module KPI Panel. Vui lòng thử lại sau.
      </div>
    </div>
  `;
}

export function renderTrainingPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">Hệ thống đào tạo</h1>
      <p class="page-subtitle">Curriculum 3 tầng từ Tân Binh đến Tướng Quân</p>
    </div>

    <div class="card">
      <h3 class="card-title">🎓 Training Modules</h3>
      <p>4 modules Tier-1 đang được phát triển bởi content worker:</p>
      <ul style="margin-top: 1rem; color: var(--text-secondary);">
        <li>M1: Mindset Reset — 5AM Club + Kaizen journaling</li>
        <li>M2: Product Mastery — Droppii ecosystem deep-dive</li>
        <li>M3: Connect Engine — 15 connects/day framework</li>
        <li>M4: First Close — Follow-up sequence mastery</li>
      </ul>
      <div class="coming-soon">
        Chờ content worker T-012 đến T-015 hoàn thành
      </div>
    </div>
  `;
}

export function renderAlertsPage(contentContainer) {
  import('./alerts-inbox.js').then(module => {
    const AlertsInbox = module.default;
    new AlertsInbox();
  }).catch(error => {
    console.error('Failed to load alerts inbox:', error);
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">Trung tâm cảnh báo</h1>
          <p class="page-subtitle">Hệ thống cảnh báo tự động cho retention và campaign triggers</p>
        </div>

        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải module</h3>
          <p>Không thể tải giao diện cảnh báo. Vui lòng thử lại sau.</p>
          <button onclick="location.reload()" style="
            background: var(--brand-gold);
            color: var(--surface-primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">
            Tải lại trang
          </button>
        </div>
      `;
    }
  });

  return `
    <div class="page-header">
      <h1 class="page-title">Trung tâm cảnh báo</h1>
      <p class="page-subtitle">Đang tải giao diện cảnh báo...</p>
    </div>

    <div class="loading-placeholder" style="
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
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
        margin-right: 1rem;
      "></div>
      Đang khởi tạo hệ thống cảnh báo...
    </div>

    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

export function renderFunnelPage(contentContainer) {
  import('./funnel-view.js').then(module => {
    const FunnelView = module.default;
    const funnelView = new FunnelView();
    const container = document.createElement('div');
    funnelView.render(container);
    contentContainer.innerHTML = container.innerHTML;
  }).catch(error => {
    console.error('Failed to load Funnel View:', error);
    contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
  });
  return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo Funnel OS...</p></div>';
}

export function renderOrdersPage(contentContainer) {
  import('./orders-view.js').then(module => {
    const OrdersView = module.default;
    const ordersView = new OrdersView();
    const container = document.createElement('div');
    ordersView.render(container);
    contentContainer.innerHTML = container.innerHTML;
  }).catch(error => {
    console.error('Failed to load Orders View:', error);
    contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
  });
  return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý đơn hàng...</p></div>';
}

export function renderLeadsPage(contentContainer) {
  import('./leads-view.js').then(module => {
    const LeadsView = module.default;
    const leadsView = new LeadsView();
    const container = document.createElement('div');
    leadsView.render(container);
    contentContainer.innerHTML = container.innerHTML;
  }).catch(error => {
    console.error('Failed to load Leads View:', error);
    contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
  });
  return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý leads...</p></div>';
}

export function renderNotFound() {
  return `
    <div class="page-header">
      <h1 class="page-title">404 - Không tìm thấy trang</h1>
      <p class="page-subtitle">Trang bạn tìm kiếm không tồn tại trong hệ thống</p>
    </div>

    <div class="card">
      <h3 class="card-title">🔍 Trang không tồn tại</h3>
      <p>Vui lòng sử dụng menu điều hướng hoặc quay về <a href="#/" style="color: var(--brand-gold);">trang chủ</a>.</p>
    </div>
  `;
}
