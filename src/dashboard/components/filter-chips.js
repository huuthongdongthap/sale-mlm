/**
 * Filter Chips Component for Members Table
 * Handles filtering by tier, PSN, status, habit score bands
 */

export class FilterChips {
  constructor(container, onFilterChange = () => {}) {
    this.container = container;
    this.onFilterChange = onFilterChange;
    this.activeFilters = {};
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  getFilterConfig() {
    return {
      tier: {
        label: 'Cấp độ',
        options: [
          { value: '1', label: 'Tân Binh', color: 'var(--brand-amber)' },
          { value: '2', label: 'Chiến Binh', color: 'var(--brand-gold)' },
          { value: '3', label: 'Chỉ Huy', color: 'var(--brand-gold-electric)' }
        ]
      },
      status: {
        label: 'Trạng thái',
        options: [
          { value: 'active', label: 'Hoạt động', color: '#22C55E' },
          { value: 'inactive', label: 'Nghỉ', color: '#EF4444' },
          { value: 'training', label: 'Đào tạo', color: '#3B82F6' }
        ]
      },
      habitScore: {
        label: 'Điểm thói quen',
        options: [
          { value: '5-6', label: 'Xuất sắc (5-6)', color: 'var(--brand-gold-electric)' },
          { value: '3-4', label: 'Khá (3-4)', color: 'var(--brand-gold)' },
          { value: '1-2', label: 'Cần cải thiện (1-2)', color: 'var(--brand-amber)' }
        ]
      },
      role: {
        label: 'Vai trò',
        options: [
          { value: 'Admin', label: 'Quản trị', color: 'var(--brand-gold-electric)' },
          { value: 'Core Leader', label: 'Lãnh đạo cốt cán', color: 'var(--brand-gold)' },
          { value: 'PSN Leader', label: 'Trưởng nhóm', color: 'var(--brand-amber)' },
          { value: 'Member', label: 'Thành viên', color: 'var(--gray-500)' }
        ]
      }
    };
  }

  render() {
    const filterConfig = this.getFilterConfig();

    this.container.innerHTML = `
      <div class="filter-chips-container">
        <div class="filter-chips-header">
          <h4 class="filter-chips-title">Bộ lọc</h4>
          <button type="button" class="filter-clear-all" aria-label="Xóa tất cả bộ lọc">
            Xóa tất cả
          </button>
        </div>

        <div class="filter-chips-groups">
          ${Object.entries(filterConfig).map(([key, config]) => `
            <div class="filter-group" data-filter="${key}">
              <span class="filter-group-label">${config.label}:</span>
              <div class="filter-chips" role="group" aria-label="${config.label}">
                ${config.options.map(option => `
                  <button type="button"
                    class="filter-chip"
                    data-filter="${key}"
                    data-value="${option.value}"
                    style="--chip-color: ${option.color}"
                    role="checkbox"
                    aria-checked="false">
                    <span class="chip-label">${option.label}</span>
                    <span class="chip-remove" aria-hidden="true">×</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="filter-search-group">
          <label for="filter-search" class="filter-search-label">Tìm kiếm:</label>
          <input type="text"
            id="filter-search"
            class="filter-search-input"
            placeholder="Nhập tên, email hoặc số điện thoại..."
            autocomplete="off">
        </div>

        <div class="active-filters" aria-live="polite">
          <span class="active-filters-count">Chưa có bộ lọc nào</span>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('filter-chips-styles')) return;

    const style = document.createElement('style');
    style.id = 'filter-chips-styles';
    style.textContent = `
      .filter-chips-container {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
      }

      .filter-chips-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
      }

      .filter-chips-title {
        font-family: var(--font-display);
        font-size: 1.125rem;
        color: var(--text-accent);
        margin: 0;
      }

      .filter-clear-all {
        background: transparent;
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .filter-clear-all:hover {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .filter-chips-groups {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
      }

      .filter-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .filter-group-label {
        font-weight: 500;
        color: var(--text-secondary);
        font-size: 0.875rem;
        min-width: 80px;
        flex-shrink: 0;
      }

      .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        flex: 1;
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        background: var(--surface-tertiary);
        border: 1px solid var(--border-secondary);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.875rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        gap: var(--spacing-xs);
        position: relative;
      }

      .filter-chip:hover {
        border-color: var(--chip-color);
        color: var(--chip-color);
        transform: translateY(-1px);
      }

      .filter-chip[aria-checked="true"] {
        background: var(--chip-color);
        border-color: var(--chip-color);
        color: var(--surface-primary);
        font-weight: 500;
      }

      .filter-chip[aria-checked="true"] .chip-remove {
        opacity: 1;
      }

      .chip-label {
        font-family: var(--font-body);
      }

      .chip-remove {
        opacity: 0;
        font-weight: bold;
        font-size: 1rem;
        transition: opacity 0.2s ease;
        cursor: pointer;
        line-height: 1;
        margin-left: 2px;
      }

      .filter-search-group {
        margin-bottom: var(--spacing-md);
      }

      .filter-search-label {
        display: block;
        font-weight: 500;
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: var(--spacing-xs);
      }

      .filter-search-input {
        width: 100%;
        background: var(--surface-tertiary);
        border: 1px solid var(--border-secondary);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .filter-search-input:focus {
        outline: none;
        border-color: var(--brand-gold);
        box-shadow: 0 0 0 2px rgba(201, 162, 0, 0.2);
      }

      .filter-search-input::placeholder {
        color: var(--text-tertiary);
      }

      .active-filters {
        border-top: 1px solid var(--border-secondary);
        padding-top: var(--spacing-sm);
      }

      .active-filters-count {
        font-size: 0.875rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .filter-group {
          flex-direction: column;
          align-items: flex-start;
        }

        .filter-group-label {
          min-width: auto;
        }

        .filter-chips {
          width: 100%;
        }

        .filter-chips-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-sm);
        }
      }
    `;

    document.head.appendChild(style);
  }

  attachEventListeners() {
    // Filter chip clicks
    this.container.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (chip) {
        this.toggleFilter(chip);
      }

      // Clear all button
      if (e.target.matches('.filter-clear-all')) {
        this.clearAllFilters();
      }
    });

    // Search input
    const searchInput = this.container.querySelector('.filter-search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.activeFilters.search = e.target.value.trim();
        this.updateActiveFiltersDisplay();
        this.onFilterChange(this.activeFilters);
      }, 300); // Debounce search
    });

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const chip = e.target.closest('.filter-chip');
        if (chip) {
          e.preventDefault();
          this.toggleFilter(chip);
        }
      }
    });
  }

  toggleFilter(chip) {
    const filterType = chip.getAttribute('data-filter');
    const filterValue = chip.getAttribute('data-value');
    const isActive = chip.getAttribute('aria-checked') === 'true';

    if (isActive) {
      // Remove filter
      if (this.activeFilters[filterType] && this.activeFilters[filterType].includes(filterValue)) {
        this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
        if (this.activeFilters[filterType].length === 0) {
          delete this.activeFilters[filterType];
        }
      }
      chip.setAttribute('aria-checked', 'false');
    } else {
      // Add filter
      if (!this.activeFilters[filterType]) {
        this.activeFilters[filterType] = [];
      }
      this.activeFilters[filterType].push(filterValue);
      chip.setAttribute('aria-checked', 'true');
    }

    this.updateActiveFiltersDisplay();
    this.onFilterChange(this.activeFilters);
  }

  clearAllFilters() {
    this.activeFilters = {};

    // Reset all chips
    this.container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.setAttribute('aria-checked', 'false');
    });

    // Reset search
    const searchInput = this.container.querySelector('.filter-search-input');
    if (searchInput) {
      searchInput.value = '';
    }

    this.updateActiveFiltersDisplay();
    this.onFilterChange(this.activeFilters);
  }

  updateActiveFiltersDisplay() {
    const activeFiltersElement = this.container.querySelector('.active-filters-count');
    const totalFilters = Object.keys(this.activeFilters).length + (this.activeFilters.search ? 0 : -1);

    if (totalFilters <= 0) {
      activeFiltersElement.textContent = 'Chưa có bộ lọc nào';
    } else {
      const filterParts = [];

      Object.entries(this.activeFilters).forEach(([key, values]) => {
        if (key === 'search' && values) {
          filterParts.push(`Tìm kiếm: "${values}"`);
        } else if (Array.isArray(values) && values.length > 0) {
          filterParts.push(`${values.length} ${this.getFilterDisplayName(key)}`);
        }
      });

      activeFiltersElement.textContent = `Đang áp dụng: ${filterParts.join(', ')}`;
    }
  }

  getFilterDisplayName(filterType) {
    const names = {
      tier: 'cấp độ',
      status: 'trạng thái',
      habitScore: 'điểm thói quen',
      role: 'vai trò'
    };
    return names[filterType] || filterType;
  }

  getActiveFilters() {
    return { ...this.activeFilters };
  }

  setFilters(filters) {
    this.clearAllFilters();

    Object.entries(filters).forEach(([filterType, values]) => {
      if (filterType === 'search' && values) {
        const searchInput = this.container.querySelector('.filter-search-input');
        if (searchInput) {
          searchInput.value = values;
        }
        this.activeFilters.search = values;
      } else if (Array.isArray(values)) {
        values.forEach(value => {
          const chip = this.container.querySelector(`[data-filter="${filterType}"][data-value="${value}"]`);
          if (chip) {
            chip.setAttribute('aria-checked', 'true');
            if (!this.activeFilters[filterType]) {
              this.activeFilters[filterType] = [];
            }
            this.activeFilters[filterType].push(value);
          }
        });
      }
    });

    this.updateActiveFiltersDisplay();
  }
}