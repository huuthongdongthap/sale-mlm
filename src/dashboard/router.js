/**
 * Simple client-side router for Droppii Training OS Dashboard
 * Handles navigation between main sections: /, /members, /psn, /kpi, /training, /alerts
 */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = '/';
    this.contentContainer = null;

    // Initialize router
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.contentContainer = document.getElementById('page-content');
    if (!this.contentContainer) {
      console.error('Router: page-content container not found');
      return;
    }

    // Setup route handlers
    this.setupRoutes();

    // Setup navigation event listeners
    this.setupNavigation();

    // Handle initial route
    this.handleRoute();

    // Listen to browser navigation
    window.addEventListener('popstate', () => this.handleRoute());
  }

  setupRoutes() {
    // Define all routes with their content generators
    this.routes.set('/', () => this.renderHomepage());
    this.routes.set('/members', () => this.renderMembersPage());
    this.routes.set('/psn', () => this.renderPSNPage());
    this.routes.set('/kpi', () => this.renderKPIPage());
    this.routes.set('/training', () => this.renderTrainingPage());
    this.routes.set('/alerts', () => this.renderAlertsPage());
    this.routes.set('/funnel', () => this.renderFunnelPage());
    this.routes.set('/orders', () => this.renderOrdersPage());
    this.routes.set('/leads', () => this.renderLeadsPage());
  }

  setupNavigation() {
    // Handle nav link clicks
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.nav-link');
      if (navLink && navLink.hasAttribute('data-route')) {
        e.preventDefault();
        const route = navLink.getAttribute('data-route');
        this.navigateTo(route);
      }
    });

    // Handle mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.contains('active');
        navMenu.classList.toggle('active', !isActive);
        navToggle.setAttribute('aria-expanded', !isActive);
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  navigateTo(route) {
    if (!this.routes.has(route)) {
      console.warn(`Router: Route "${route}" not found, redirecting to home`);
      route = '/';
    }

    this.currentRoute = route;
    window.history.pushState(null, '', `#${route}`);
    this.updateActiveNav();
    this.render();
  }

  handleRoute() {
    // Get route from hash or default to '/'
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = this.routes.has(hash) ? hash : '/';
    this.updateActiveNav();
    this.render();
  }

  updateActiveNav() {
    // Update active navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
      const route = link.getAttribute('data-route');
      link.classList.toggle('active', route === this.currentRoute);
    });
  }

  async render() {
    if (!this.contentContainer) return;

    const routeHandler = this.routes.get(this.currentRoute);
    if (routeHandler) {
      try {
        const content = await routeHandler();
        this.contentContainer.innerHTML = content;
      } catch (error) {
        console.error('Error rendering route:', error);
        this.contentContainer.innerHTML = this.renderNotFound();
      }
    } else {
      this.contentContainer.innerHTML = this.renderNotFound();
    }

    // Update page title
    this.updatePageTitle();
  }

  updatePageTitle() {
    const routeTitles = {
      '/': 'Tổng quan',
      '/members': 'Quản lý thành viên',
      '/psn': 'PSN Health Monitor',
      '/kpi': 'KPI Tracker',
      '/training': 'Hệ thống đào tạo',
      '/alerts': 'Trung tâm cảnh báo',
      '/funnel': 'Funnel OS Analytics',
      '/orders': 'Quản lý đơn hàng',
      '/leads': 'Quản lý Leads'
    };

    const title = routeTitles[this.currentRoute] || 'Hive Warfare Academy';
    document.title = `${title} - Droppii Training OS`;
  }

  // Route content renderers
  renderHomepage() {
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

  async renderMembersPage() {
    // Dynamically import and render the members table page
    try {
      const { renderMembersTablePage } = await import('./members-table.js');

      // Create a container for the members page
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

  renderPSNPage() {
    // Create container for PSN Health View
    const container = document.createElement('div');
    container.id = 'psn-health-container';

    // Import and initialize PSN Health View
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

  renderKPIPage() {
    // Import and render KPI panel component
    import('./kpi-panel.js').then(module => {
      const KPIPanel = module.default;
      const kpiPanel = new KPIPanel();
    }).catch(error => {
      console.error('Failed to load KPI panel:', error);
      // Fallback to placeholder
      if (this.contentContainer) {
        this.contentContainer.innerHTML = this.renderKPIPlaceholder();
      }
    });

    // Return loading state initially
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

  renderKPIPlaceholder() {
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

  renderTrainingPage() {
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

  renderAlertsPage() {
    // Load the alerts inbox component
    import('./alerts-inbox.js').then(module => {
      const AlertsInbox = module.default;
      new AlertsInbox();
    }).catch(error => {
      console.error('Failed to load alerts inbox:', error);
      // Fallback content
      this.contentContainer.innerHTML = `
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
    });

    // Return loading placeholder
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

  renderFunnelPage() {
    import('./funnel-view.js').then(module => {
      const FunnelView = module.default;
      const funnelView = new FunnelView();
      const container = document.createElement('div');
      funnelView.render(container);
      this.contentContainer.innerHTML = container.innerHTML;
    }).catch(error => {
      console.error('Failed to load Funnel View:', error);
      this.contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
    });
    return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo Funnel OS...</p></div>';
  }

  renderOrdersPage() {
    import('./orders-view.js').then(module => {
      const OrdersView = module.default;
      const ordersView = new OrdersView();
      const container = document.createElement('div');
      ordersView.render(container);
      this.contentContainer.innerHTML = container.innerHTML;
    }).catch(error => {
      console.error('Failed to load Orders View:', error);
      this.contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
    });
    return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý đơn hàng...</p></div>';
  }

  renderLeadsPage() {
    import('./leads-view.js').then(module => {
      const LeadsView = module.default;
      const leadsView = new LeadsView();
      const container = document.createElement('div');
      leadsView.render(container);
      this.contentContainer.innerHTML = container.innerHTML;
    }).catch(error => {
      console.error('Failed to load Leads View:', error);
      this.contentContainer.innerHTML = '<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>' + escapeHtml(error.message) + '</p></div>';
    });
    return '<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý leads...</p></div>';
  }

  renderNotFound() {
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
}

// Initialize router when module is loaded
export default Router;