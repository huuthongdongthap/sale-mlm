/**
 * Test suite for Members Table T-008
 * Verifies all accept criteria: data table, filters, inline edit, virtualization
 */

// Mock DOM environment
const { JSDOM } = require('jsdom');

// Setup DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div id="test-container"></div>
</body>
</html>
`, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Mock CSS custom properties
global.getComputedStyle = () => ({
  getPropertyValue: () => '#0A0A0A'
});

describe('Members Table T-008', () => {
  let container;

  beforeEach(() => {
    container = document.getElementById('test-container');
    container.innerHTML = '';

    // Reset fetch mock
    global.fetch.mockReset();

    // Reset localStorage mock
    global.localStorage.getItem.mockReturnValue('Admin');

    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [
          {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'a@example.com',
            phone: '+84901234567',
            role: 'Admin',
            tier: 1,
            status: 'active',
            habitScore: 5,
            joinedAt: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            name: 'Trần Thị B',
            email: 'b@example.com',
            phone: '+84907654321',
            role: 'PSN Leader',
            tier: 2,
            status: 'training',
            habitScore: 3,
            joinedAt: '2024-02-01T00:00:00Z'
          }
        ]
      })
    });
  });

  afterEach(() => {
    container.innerHTML = '';
  });

  describe('Accept Criteria 1: Data table with sticky header, sortable columns', () => {
    test('should render data table with sticky header', async () => {
      // Dynamic import to avoid module loading issues
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init

      // Verify table structure
      const tableElement = container.querySelector('.members-table');
      expect(tableElement).toBeTruthy();

      // Verify sticky header
      const tableHead = container.querySelector('.table-head');
      expect(tableHead).toBeTruthy();
      expect(window.getComputedStyle(tableHead).position).toBe('sticky');

      // Verify table has proper ARIA labels
      expect(tableElement.getAttribute('role')).toBe('table');
      expect(tableElement.getAttribute('aria-label')).toContain('Bảng danh sách thành viên');
    });

    test('should have sortable columns with proper indicators', async () => {
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify sortable columns
      const sortableHeaders = container.querySelectorAll('.table-header-cell.sortable');
      expect(sortableHeaders.length).toBeGreaterThan(0);

      // Verify sort indicators
      sortableHeaders.forEach(header => {
        expect(header.hasAttribute('aria-sort')).toBe(true);
        expect(header.querySelector('.sort-indicator')).toBeTruthy();
      });

      // Test sorting functionality
      const nameHeader = container.querySelector('[data-column="name"]');
      expect(nameHeader).toBeTruthy();
      expect(nameHeader.classList.contains('sortable')).toBe(true);
    });

    test('should render member data correctly', async () => {
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait for data to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify data is displayed
      const memberNames = container.querySelectorAll('.name-primary');
      expect(memberNames.length).toBe(2);
      expect(memberNames[0].textContent).toBe('Nguyễn Văn A');
      expect(memberNames[1].textContent).toBe('Trần Thị B');

      // Verify tier badges
      const tierBadges = container.querySelectorAll('.tier-badge');
      expect(tierBadges.length).toBe(2);
      expect(tierBadges[0].classList.contains('tier-badge-1')).toBe(true);
      expect(tierBadges[1].classList.contains('tier-badge-2')).toBe(true);
    });
  });

  describe('Accept Criteria 2: Filter chips: tier, PSN, status, habit score band', () => {
    test('should render filter chips with all required categories', async () => {
      const module = await import('../src/dashboard/components/filter-chips.js');
      const { FilterChips } = module;

      const filterContainer = document.createElement('div');
      container.appendChild(filterContainer);

      const filterChips = new FilterChips(filterContainer);

      // Verify filter groups exist
      const filterGroups = filterContainer.querySelectorAll('.filter-group');
      expect(filterGroups.length).toBe(4);

      const filterTypes = Array.from(filterGroups).map(group => group.dataset.filter);
      expect(filterTypes).toContain('tier');
      expect(filterTypes).toContain('status');
      expect(filterTypes).toContain('habitScore');
      expect(filterTypes).toContain('role');
    });

    test('should have correct tier filter options', async () => {
      const module = await import('../src/dashboard/components/filter-chips.js');
      const { FilterChips } = module;

      const filterContainer = document.createElement('div');
      container.appendChild(filterContainer);

      const filterChips = new FilterChips(filterContainer);

      const tierGroup = filterContainer.querySelector('[data-filter="tier"]');
      expect(tierGroup).toBeTruthy();

      const tierChips = tierGroup.querySelectorAll('.filter-chip');
      expect(tierChips.length).toBe(3);

      const tierLabels = Array.from(tierChips).map(chip => chip.querySelector('.chip-label').textContent);
      expect(tierLabels).toContain('Tân Binh');
      expect(tierLabels).toContain('Chiến Binh');
      expect(tierLabels).toContain('Chỉ Huy');
    });

    test('should handle filter selection and callbacks', async () => {
      const module = await import('../src/dashboard/components/filter-chips.js');
      const { FilterChips } = module;

      const filterContainer = document.createElement('div');
      container.appendChild(filterContainer);

      let capturedFilters = null;
      const onFilterChange = (filters) => {
        capturedFilters = filters;
      };

      const filterChips = new FilterChips(filterContainer, onFilterChange);

      // Simulate clicking a tier filter
      const tierChip = filterContainer.querySelector('[data-filter="tier"][data-value="1"]');
      expect(tierChip).toBeTruthy();

      tierChip.click();

      expect(capturedFilters).toBeTruthy();
      expect(capturedFilters.tier).toContain('1');
      expect(tierChip.getAttribute('aria-checked')).toBe('true');
    });

    test('should support search functionality', async () => {
      const module = await import('../src/dashboard/components/filter-chips.js');
      const { FilterChips } = module;

      const filterContainer = document.createElement('div');
      container.appendChild(filterContainer);

      let capturedFilters = null;
      const filterChips = new FilterChips(filterContainer, (filters) => {
        capturedFilters = filters;
      });

      const searchInput = filterContainer.querySelector('.filter-search-input');
      expect(searchInput).toBeTruthy();
      expect(searchInput.placeholder).toContain('Nhập tên, email hoặc số điện thoại');

      // Simulate search input
      searchInput.value = 'Nguyễn';
      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(capturedFilters).toBeTruthy();
      expect(capturedFilters.search).toBe('Nguyễn');
    });
  });

  describe('Accept Criteria 3: Inline role edit (Admin only — 403 for others)', () => {
    test('should show role select for Admin users', async () => {
      global.localStorage.getItem.mockReturnValue('Admin');

      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container, { userRole: 'Admin' });
      await new Promise(resolve => setTimeout(resolve, 500));

      const roleSelects = container.querySelectorAll('.role-select');
      expect(roleSelects.length).toBeGreaterThan(0);

      // Verify role options
      const firstSelect = roleSelects[0];
      const options = firstSelect.querySelectorAll('option');
      expect(options.length).toBe(4);

      const optionValues = Array.from(options).map(opt => opt.value);
      expect(optionValues).toContain('Admin');
      expect(optionValues).toContain('Core Leader');
      expect(optionValues).toContain('PSN Leader');
      expect(optionValues).toContain('Member');
    });

    test('should not show role edit for non-Admin users', async () => {
      global.localStorage.getItem.mockReturnValue('Member');

      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container, { userRole: 'Member' });
      await new Promise(resolve => setTimeout(resolve, 500));

      const roleSelects = container.querySelectorAll('.role-select');
      expect(roleSelects.length).toBe(0);

      // Should show role badges instead
      const roleBadges = container.querySelectorAll('.role-badge');
      expect(roleBadges.length).toBeGreaterThan(0);
    });

    test('should handle role edit API calls', async () => {
      global.localStorage.getItem.mockReturnValue('Admin');

      // Mock successful role update
      global.fetch.mockImplementation((url, options) => {
        if (options && options.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        // Default to the original mock for GET requests
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                id: '1',
                name: 'Nguyễn Văn A',
                email: 'a@example.com',
                phone: '+84901234567',
                role: 'Admin',
                tier: 1,
                status: 'active',
                habitScore: 5,
                joinedAt: '2024-01-15T00:00:00Z'
              }
            ]
          })
        });
      });

      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container, { userRole: 'Admin' });
      await new Promise(resolve => setTimeout(resolve, 500));

      const roleSelect = container.querySelector('.role-select');
      expect(roleSelect).toBeTruthy();

      // Simulate role change
      roleSelect.value = 'Core Leader';
      const changeEvent = new Event('change', { bubbles: true });
      roleSelect.dispatchEvent(changeEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify PATCH request was made
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/members/'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Core Leader')
        })
      );
    });
  });

  describe('Accept Criteria 4: Virtualized rendering for ≥ 1000 rows', () => {
    test('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1500 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `+8490${String(i).padStart(7, '0')}`,
        role: ['Admin', 'Core Leader', 'PSN Leader', 'Member'][i % 4],
        tier: (i % 3) + 1,
        status: ['active', 'inactive', 'training'][i % 3],
        habitScore: (i % 6) + 1,
        joinedAt: new Date(2024, 0, i % 30 + 1).toISOString()
      }));

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: largeDataset
        })
      });

      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const startTime = performance.now();
      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const endTime = performance.now();

      // Verify table loads within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);

      // Verify table structure exists
      const tableElement = container.querySelector('.members-table');
      expect(tableElement).toBeTruthy();

      // Verify virtual scrolling container
      const virtualWrapper = container.querySelector('.virtual-table-wrapper');
      expect(virtualWrapper).toBeTruthy();

      const scrollContainer = container.querySelector('.table-scroll-container');
      expect(scrollContainer).toBeTruthy();
    });

    test('should have proper table dimensions and scrolling', async () => {
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      const virtualWrapper = container.querySelector('.virtual-table-wrapper');
      expect(virtualWrapper).toBeTruthy();

      // Verify table has fixed height for virtualization
      const computedStyle = window.getComputedStyle(virtualWrapper);
      expect(computedStyle.height).toBe('600px');
      expect(computedStyle.overflow).toBe('hidden');

      // Verify scroll container
      const scrollContainer = container.querySelector('.table-scroll-container');
      const scrollStyle = window.getComputedStyle(scrollContainer);
      expect(scrollStyle.height).toBe('100%');
      expect(scrollStyle.overflowY).toBe('hidden');
    });
  });

  describe('Additional functionality', () => {
    test('should have responsive mobile design', async () => {
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if mobile styles are applied
      const style = document.getElementById('members-table-styles');
      expect(style).toBeTruthy();
      expect(style.textContent).toContain('@media (max-width: 768px)');
    });

    test('should support bulk selection and actions', async () => {
      global.localStorage.getItem.mockReturnValue('Admin');

      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container, { userRole: 'Admin' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify bulk actions container exists
      const bulkActions = container.querySelector('.bulk-actions');
      expect(bulkActions).toBeTruthy();

      // Verify bulk action buttons for Admin
      const bulkButtons = container.querySelectorAll('.btn-bulk-action');
      expect(bulkButtons.length).toBeGreaterThan(0);

      const buttonActions = Array.from(bulkButtons).map(btn => btn.dataset.action);
      expect(buttonActions).toContain('activate');
      expect(buttonActions).toContain('deactivate');
      expect(buttonActions).toContain('delete');
    });

    test('should have accessibility features', async () => {
      const module = await import('../src/dashboard/components/members-table.js');
      const { MembersTable } = module;

      const table = new MembersTable(container);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify ARIA labels and roles
      const tableElement = container.querySelector('.members-table');
      expect(tableElement.getAttribute('role')).toBe('table');
      expect(tableElement.getAttribute('aria-label')).toBeTruthy();

      // Verify header has proper ARIA attributes
      const headerCells = container.querySelectorAll('.table-header-cell');
      headerCells.forEach(header => {
        expect(header.getAttribute('role')).toBe('columnheader');
      });

      // Verify checkboxes have proper labels
      const checkboxes = container.querySelectorAll('.row-select');
      checkboxes.forEach(checkbox => {
        expect(checkbox.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });
});

// Integration test with FilterChips
describe('Members Table Integration with Filter Chips', () => {
  test('should integrate filter chips with table filtering', async () => {
    const container = document.getElementById('test-container');
    container.innerHTML = '';

    const module = await import('../src/dashboard/members-table.js');
    const { MembersTableView } = module;

    const view = new MembersTableView(container);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify both components are rendered
    const filterSection = container.querySelector('.filters-section');
    const tableSection = container.querySelector('.table-section');

    expect(filterSection).toBeTruthy();
    expect(tableSection).toBeTruthy();

    // Verify filter chips exist
    const filterChips = container.querySelectorAll('.filter-chip');
    expect(filterChips.length).toBeGreaterThan(0);

    // Verify members table exists
    const membersTable = container.querySelector('.members-table');
    expect(membersTable).toBeTruthy();
  });
});