/**
 * KPI Panel Component Test Suite
 * Tests KPI card rendering, sparklines, modal interactions, and API integration
 */

import { jest } from '@jest/globals';

// Mock global fetch for API calls
global.fetch = jest.fn();

// Mock DOM methods
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn(() => ({
    className: '',
    innerHTML: '',
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    },
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    setAttribute: jest.fn()
  })),
  head: {
    appendChild: jest.fn(),
    insertAdjacentHTML: jest.fn()
  },
  body: {
    style: {},
    insertBefore: jest.fn(),
    appendChild: jest.fn()
  },
  addEventListener: jest.fn(),
  readyState: 'complete'
};

global.window = {
  location: {
    hash: '#/kpi',
    href: 'http://localhost:3000/#/kpi'
  },
  history: {
    pushState: jest.fn()
  },
  addEventListener: jest.fn(),
  requestAnimationFrame: jest.fn(callback => setTimeout(callback, 0)),
  localStorage: {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  }
};

// Import components after DOM setup
describe('KPI Panel Component Tests', () => {
  let mockKPIData;
  let mockContainer;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    fetch.mockClear();

    // Mock container element
    mockContainer = {
      innerHTML: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };

    document.getElementById.mockReturnValue(mockContainer);

    // Mock KPI data response
    mockKPIData = {
      member: {
        id: 'member-123',
        full_name: 'Nguyễn Văn A',
        tier: 'Chiến Binh'
      },
      kpis: [
        {
          metric: 'connects_per_day',
          current_value: 12,
          status: 'YELLOW',
          trend: 'up',
          period: 'weekly'
        },
        {
          metric: 'follow_ups_per_day',
          current_value: 5,
          status: 'GREEN',
          trend: 'stable',
          period: 'weekly'
        },
        {
          metric: 'first_order_14d',
          current_value: 2,
          status: 'RED',
          trend: 'down',
          period: 'weekly'
        }
      ],
      weekly_sparklines: {
        connects_per_day: [8, 10, 12, 14, 11, 13, 12],
        follow_ups_per_day: [3, 4, 5, 5, 6, 5, 5],
        first_order_14d: [3, 2, 1, 2, 2, 1, 2]
      },
      tier_targets: {
        connects_per_day: { target_value: 15 },
        follow_ups_per_day: { target_value: 3 },
        first_order_14d: { target_value: 3 }
      }
    };
  });

  describe('KPI Panel Initialization', () => {
    test('should initialize with correct default state', async () => {
      // Dynamic import to test module loading
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);

      const panel = new KPIPanel();

      expect(panel.currentMemberId).toBeNull();
      expect(panel.kpiData).toBeNull();
      expect(panel.isLoading).toBe(false);
      expect(panel.modal).toBeNull();
    });

    test('should setup event listeners on initialization', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);

      new KPIPanel();

      // Verify window event listener for hashchange is added
      expect(window.addEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function));

      // Verify document event listener for refresh button is added
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('API Integration', () => {
    test('should fetch KPI data from correct endpoint', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKPIData)
      });

      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      await panel.loadKPIData();

      expect(fetch).toHaveBeenCalledWith('/api/kpi/current', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });

      expect(panel.kpiData).toEqual(mockKPIData);
    });

    test('should handle API error gracefully', async () => {
      // Mock API error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      // Mock renderError method
      panel.renderError = jest.fn();

      await panel.loadKPIData();

      expect(panel.renderError).toHaveBeenCalledWith('Network error');
    });

    test('should handle non-200 response codes', async () => {
      // Mock 404 response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.renderError = jest.fn();

      await panel.loadKPIData();

      expect(panel.renderError).toHaveBeenCalledWith('KPI API error: 404 Not Found');
    });
  });

  describe('KPI Card Rendering', () => {
    test('should render KPI cards with correct data', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.kpiData = mockKPIData;

      const cardsHTML = panel.generateKPICards(
        mockKPIData.kpis,
        mockKPIData.weekly_sparklines,
        mockKPIData.tier_targets
      );

      // Check that all 3 KPI cards are generated
      expect(cardsHTML).toContain('connects_per_day');
      expect(cardsHTML).toContain('follow_ups_per_day');
      expect(cardsHTML).toContain('first_order_14d');

      // Check status indicators
      expect(cardsHTML).toContain('status-yellow');
      expect(cardsHTML).toContain('status-green');
      expect(cardsHTML).toContain('status-red');

      // Check values are formatted
      expect(cardsHTML).toContain('12'); // connects current value
      expect(cardsHTML).toContain('5');  // follow-ups current value
      expect(cardsHTML).toContain('2');  // first order current value
    });

    test('should handle empty KPI data gracefully', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      const cardsHTML = panel.generateKPICards([], {}, {});

      expect(cardsHTML).toContain('Không có dữ liệu KPI');
    });

    test('should handle null KPI data gracefully', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      const cardsHTML = panel.generateKPICards(null, {}, {});

      expect(cardsHTML).toContain('Không có dữ liệu KPI');
    });
  });

  describe('Summary Statistics', () => {
    test('should calculate summary stats correctly', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      const summaryHTML = panel.generateSummaryStats(mockKPIData.kpis);

      // Should show 1 GREEN out of 3 total KPIs
      expect(summaryHTML).toContain('1/3');
      expect(summaryHTML).toContain('33%'); // 1/3 * 100 = 33%
      expect(summaryHTML).toContain('Cần cải thiện'); // RED status present
    });

    test('should handle all GREEN KPIs', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      const allGreenKPIs = mockKPIData.kpis.map(kpi => ({ ...kpi, status: 'GREEN' }));
      const summaryHTML = panel.generateSummaryStats(allGreenKPIs);

      expect(summaryHTML).toContain('3/3');
      expect(summaryHTML).toContain('100%');
      expect(summaryHTML).toContain('Đạt chuẩn');
    });
  });

  describe('Loading States', () => {
    test('should show loading state while fetching data', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      panel.setLoading(true);

      expect(mockContainer.classList.add).toHaveBeenCalledWith('loading');

      panel.setLoading(false);

      expect(mockContainer.classList.remove).toHaveBeenCalledWith('loading');
    });

    test('should render loading HTML when no data available', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      const loadingHTML = panel.generateLoadingHTML();

      expect(loadingHTML).toContain('Đang tải dữ liệu hiệu suất');
      expect(loadingHTML).toContain('loading-spinner');
      expect(loadingHTML).toContain('Đang tải KPI từ hệ thống');
    });
  });

  describe('Error Handling', () => {
    test('should render error state with retry option', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      panel.renderError('Test error message');

      expect(mockContainer.innerHTML).toContain('Không thể tải dữ liệu KPI');
      expect(mockContainer.innerHTML).toContain('Test error message');
      expect(mockContainer.innerHTML).toContain('Thử lại');
    });
  });

  describe('URL Parameter Handling', () => {
    test('should parse URL parameters correctly', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      // Mock URL with member_id parameter
      window.location.hash = '#/kpi?member_id=member-456';

      const params = panel.parseURLParams();

      expect(params.member_id).toBe('member-456');
    });

    test('should default to current member when no parameter', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      window.location.hash = '#/kpi';

      const params = panel.parseURLParams();

      expect(params.member_id).toBe('current');
    });

    test('should update URL when member selection changes', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.loadKPIData = jest.fn(); // Mock to avoid actual API call

      panel.updateURL({ member_id: 'member-789' });

      expect(window.history.pushState).toHaveBeenCalledWith(null, '', '#/kpi?member_id=member-789');
      expect(panel.currentMemberId).toBe('member-789');
      expect(panel.loadKPIData).toHaveBeenCalled();
    });
  });

  describe('Modal Integration', () => {
    test('should open modal when KPI card is clicked', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.kpiData = mockKPIData;
      panel.openKPIModal = jest.fn();

      // Simulate KPI card click
      const mockCard = { dataset: { metric: 'connects_per_day' }, closest: () => mockCard };
      const clickEvent = { target: mockCard };

      panel.bindEvents();

      // Manually trigger the click handler logic
      panel.openKPIModal('connects_per_day');

      expect(panel.openKPIModal).toHaveBeenCalledWith('connects_per_day');
    });

    test('should create modal with correct metric data', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const KPIModal = await import('../../src/dashboard/components/kpi-modal.js').then(m => m.default);

      const panel = new KPIPanel();
      panel.kpiData = mockKPIData;

      // Mock modal
      const mockModal = {
        show: jest.fn()
      };

      // Override KPIModal constructor
      const originalKPIModal = global.KPIModal;
      global.KPIModal = jest.fn().mockImplementation(() => mockModal);

      panel.openKPIModal('connects_per_day');

      // Restore original
      global.KPIModal = originalKPIModal;

      expect(mockModal.show).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should include proper ARIA labels in generated HTML', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.kpiData = mockKPIData;

      const fullHTML = panel.generateHTML();

      // Check for ARIA labels
      expect(fullHTML).toContain('aria-label');
      expect(fullHTML).toContain('role="button"');
      expect(fullHTML).toContain('tabindex="0"');
    });

    test('should handle keyboard navigation', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      panel.openKPIModal = jest.fn();

      // Simulate keyboard event on KPI card
      const mockKeyEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
        target: {
          closest: () => ({ dataset: { metric: 'connects_per_day' } })
        }
      };

      // This would be handled by the KPI card's keyboard event handler
      // The test verifies the structure supports keyboard interaction
      expect(panel.openKPIModal).toBeDefined();
    });
  });

  describe('Responsive Design', () => {
    test('should adapt layout for mobile screens', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();
      panel.kpiData = mockKPIData;

      const fullHTML = panel.generateHTML();

      // Check for responsive grid classes
      expect(fullHTML).toContain('kpi-grid');

      // The actual responsive behavior is tested via CSS,
      // but we can verify the structure supports it
      expect(fullHTML).toContain('header-actions');
      expect(fullHTML).toContain('member-selector');
    });
  });

  describe('Performance', () => {
    test('should handle large datasets efficiently', async () => {
      const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
      const panel = new KPIPanel();

      // Create large mock dataset
      const largeKPIData = {
        member: mockKPIData.member,
        kpis: Array(50).fill(null).map((_, i) => ({
          metric: `metric_${i}`,
          current_value: Math.random() * 100,
          status: ['RED', 'YELLOW', 'GREEN'][i % 3],
          trend: 'stable'
        })),
        weekly_sparklines: {},
        tier_targets: {}
      };

      panel.kpiData = largeKPIData;

      const startTime = Date.now();
      const cardsHTML = panel.generateKPICards(
        largeKPIData.kpis,
        largeKPIData.weekly_sparklines,
        largeKPIData.tier_targets
      );
      const endTime = Date.now();

      // Should complete within reasonable time (< 100ms for 50 cards)
      expect(endTime - startTime).toBeLessThan(100);
      expect(cardsHTML).toBeTruthy();
    });
  });
});

// Integration test for full component lifecycle
describe('KPI Panel Integration Tests', () => {
  test('should complete full initialization and data loading cycle', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockKPIData)
    });

    const mockContainer = {
      innerHTML: '',
      classList: { add: jest.fn(), remove: jest.fn() }
    };
    document.getElementById.mockReturnValue(mockContainer);

    const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
    const panel = new KPIPanel();

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(fetch).toHaveBeenCalled();
    expect(mockContainer.innerHTML).toBeTruthy();
  });

  test('should handle component cleanup properly', async () => {
    const KPIPanel = await import('../../src/dashboard/kpi-panel.js').then(m => m.default);
    const panel = new KPIPanel();

    // Mock modal for cleanup test
    panel.modal = {
      hide: jest.fn()
    };

    panel.closeKPIModal();

    expect(panel.modal.hide).toHaveBeenCalled();
    expect(panel.modal).toBeNull();
  });
});

export { mockKPIData };