class d{constructor(e,t=()=>{}){this.container=e,this.onFilterChange=t,this.activeFilters={},this.init()}init(){this.render(),this.attachEventListeners()}getFilterConfig(){return{tier:{label:"Cấp độ",options:[{value:"1",label:"Tân Binh",color:"var(--brand-amber)"},{value:"2",label:"Chiến Binh",color:"var(--brand-gold)"},{value:"3",label:"Chỉ Huy",color:"var(--brand-gold-electric)"}]},status:{label:"Trạng thái",options:[{value:"active",label:"Hoạt động",color:"#22C55E"},{value:"inactive",label:"Nghỉ",color:"#EF4444"},{value:"training",label:"Đào tạo",color:"#3B82F6"}]},habitScore:{label:"Điểm thói quen",options:[{value:"5-6",label:"Xuất sắc (5-6)",color:"var(--brand-gold-electric)"},{value:"3-4",label:"Khá (3-4)",color:"var(--brand-gold)"},{value:"1-2",label:"Cần cải thiện (1-2)",color:"var(--brand-amber)"}]},role:{label:"Vai trò",options:[{value:"Admin",label:"Quản trị",color:"var(--brand-gold-electric)"},{value:"Core Leader",label:"Lãnh đạo cốt cán",color:"var(--brand-gold)"},{value:"PSN Leader",label:"Trưởng nhóm",color:"var(--brand-amber)"},{value:"Member",label:"Thành viên",color:"var(--gray-500)"}]}}}render(){const e=this.getFilterConfig();this.container.innerHTML=`
      <div class="filter-chips-container">
        <div class="filter-chips-header">
          <h4 class="filter-chips-title">Bộ lọc</h4>
          <button type="button" class="filter-clear-all" aria-label="Xóa tất cả bộ lọc">
            Xóa tất cả
          </button>
        </div>

        <div class="filter-chips-groups">
          ${Object.entries(e).map(([t,r])=>`
            <div class="filter-group" data-filter="${t}">
              <span class="filter-group-label">${r.label}:</span>
              <div class="filter-chips" role="group" aria-label="${r.label}">
                ${r.options.map(a=>`
                  <button type="button"
                    class="filter-chip"
                    data-filter="${t}"
                    data-value="${a.value}"
                    style="--chip-color: ${a.color}"
                    role="checkbox"
                    aria-checked="false">
                    <span class="chip-label">${a.label}</span>
                    <span class="chip-remove" aria-hidden="true">×</span>
                  </button>
                `).join("")}
              </div>
            </div>
          `).join("")}
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
    `,this.addStyles()}addStyles(){if(document.getElementById("filter-chips-styles"))return;const e=document.createElement("style");e.id="filter-chips-styles",e.textContent=`
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
    `,document.head.appendChild(e)}attachEventListeners(){this.container.addEventListener("click",r=>{const a=r.target.closest(".filter-chip");a&&this.toggleFilter(a),r.target.matches(".filter-clear-all")&&this.clearAllFilters()});const e=this.container.querySelector(".filter-search-input");let t;e.addEventListener("input",r=>{clearTimeout(t),t=setTimeout(()=>{this.activeFilters.search=r.target.value.trim(),this.updateActiveFiltersDisplay(),this.onFilterChange(this.activeFilters)},300)}),this.container.addEventListener("keydown",r=>{if(r.key==="Enter"||r.key===" "){const a=r.target.closest(".filter-chip");a&&(r.preventDefault(),this.toggleFilter(a))}})}toggleFilter(e){const t=e.getAttribute("data-filter"),r=e.getAttribute("data-value");e.getAttribute("aria-checked")==="true"?(this.activeFilters[t]&&this.activeFilters[t].includes(r)&&(this.activeFilters[t]=this.activeFilters[t].filter(i=>i!==r),this.activeFilters[t].length===0&&delete this.activeFilters[t]),e.setAttribute("aria-checked","false")):(this.activeFilters[t]||(this.activeFilters[t]=[]),this.activeFilters[t].push(r),e.setAttribute("aria-checked","true")),this.updateActiveFiltersDisplay(),this.onFilterChange(this.activeFilters)}clearAllFilters(){this.activeFilters={},this.container.querySelectorAll(".filter-chip").forEach(t=>{t.setAttribute("aria-checked","false")});const e=this.container.querySelector(".filter-search-input");e&&(e.value=""),this.updateActiveFiltersDisplay(),this.onFilterChange(this.activeFilters)}updateActiveFiltersDisplay(){const e=this.container.querySelector(".active-filters-count");if(Object.keys(this.activeFilters).length+(this.activeFilters.search?0:-1)<=0)e.textContent="Chưa có bộ lọc nào";else{const r=[];Object.entries(this.activeFilters).forEach(([a,i])=>{a==="search"&&i?r.push(`Tìm kiếm: "${i}"`):Array.isArray(i)&&i.length>0&&r.push(`${i.length} ${this.getFilterDisplayName(a)}`)}),e.textContent=`Đang áp dụng: ${r.join(", ")}`}}getFilterDisplayName(e){return{tier:"cấp độ",status:"trạng thái",habitScore:"điểm thói quen",role:"vai trò"}[e]||e}getActiveFilters(){return{...this.activeFilters}}setFilters(e){this.clearAllFilters(),Object.entries(e).forEach(([t,r])=>{if(t==="search"&&r){const a=this.container.querySelector(".filter-search-input");a&&(a.value=r),this.activeFilters.search=r}else Array.isArray(r)&&r.forEach(a=>{const i=this.container.querySelector(`[data-filter="${t}"][data-value="${a}"]`);i&&(i.setAttribute("aria-checked","true"),this.activeFilters[t]||(this.activeFilters[t]=[]),this.activeFilters[t].push(a))})}),this.updateActiveFiltersDisplay()}}class h{constructor(e,t={}){this.container=e,this.options={apiUrl:"/api/members",pageSize:50,virtualRowHeight:48,visibleRows:20,enableInlineEdit:!0,userRole:"Member",...t},this.members=[],this.filteredMembers=[],this.sortConfig={column:null,direction:"asc"},this.selectedRows=new Set,this.virtualScrollTop=0,this.isLoading=!1,this.error=null,this.init()}async init(){this.render(),this.attachEventListeners(),await this.loadMembers()}getColumns(){return[{key:"select",label:"",width:"50px",sortable:!1,render:t=>`
          <input type="checkbox"
            class="row-select"
            data-id="${t.id}"
            aria-label="Chọn ${t.name}"
            ${this.selectedRows.has(t.id)?"checked":""}>
        `},{key:"name",label:"Tên",width:"180px",sortable:!0,render:t=>`
          <div class="member-name">
            <strong class="name-primary">${this.escapeHtml(t.name)}</strong>
            <div class="name-secondary">${this.escapeHtml(t.email||"Chưa có email")}</div>
          </div>
        `},{key:"role",label:"Vai trò",width:"120px",sortable:!0,editable:this.options.userRole==="Admin",render:t=>this.renderRoleCell(t)},{key:"tier",label:"Cấp độ",width:"100px",sortable:!0,render:t=>this.renderTierBadge(t.tier)},{key:"status",label:"Trạng thái",width:"120px",sortable:!0,render:t=>this.renderStatusBadge(t.status)},{key:"habitScore",label:"Điểm thói quen",width:"130px",sortable:!0,render:t=>this.renderHabitScore(t.habitScore)},{key:"phone",label:"Điện thoại",width:"140px",sortable:!1,render:t=>t.phone?`
          <span class="phone-number">${this.formatPhone(t.phone)}</span>
        `:'<span class="text-muted">Chưa có</span>'},{key:"joinedAt",label:"Ngày tham gia",width:"120px",sortable:!0,render:t=>this.formatDate(t.joinedAt)},{key:"actions",label:"Thao tác",width:"100px",sortable:!1,render:t=>this.renderActionButtons(t)}]}render(){this.container.innerHTML=`
      <div class="members-table-container">
        <div class="table-header">
          <div class="table-controls">
            <div class="bulk-actions" style="display: none;">
              <span class="selected-count">0 đã chọn</span>
              <button type="button" class="btn-bulk-action" data-action="deactivate">
                Tạm ngưng
              </button>
              <button type="button" class="btn-bulk-action" data-action="activate">
                Kích hoạt
              </button>
              ${this.options.userRole==="Admin"?`
                <button type="button" class="btn-bulk-action btn-danger" data-action="delete">
                  Xóa
                </button>
              `:""}
            </div>

            <div class="table-actions">
              <button type="button" class="btn-refresh" aria-label="Làm mới dữ liệu">
                🔄 Làm mới
              </button>
              <button type="button" class="btn-export" aria-label="Xuất dữ liệu">
                📊 Xuất Excel
              </button>
            </div>
          </div>
        </div>

        <div class="virtual-table-wrapper">
          <div class="table-scroll-container">
            <table class="members-table" role="table" aria-label="Bảng danh sách thành viên">
              <thead class="table-head" role="rowgroup">
                <tr role="row">
                  ${this.getColumns().map(e=>`
                    <th role="columnheader"
                        style="width: ${e.width}"
                        class="table-header-cell ${e.sortable?"sortable":""}"
                        data-column="${e.key}"
                        ${e.sortable?'aria-sort="none" tabindex="0"':""}>
                      ${e.label}
                      ${e.sortable?'<span class="sort-indicator" aria-hidden="true"></span>':""}
                    </th>
                  `).join("")}
                </tr>
              </thead>
              <tbody class="table-body" role="rowgroup">
                <tr class="loading-row">
                  <td colspan="${this.getColumns().length}" class="loading-cell">
                    <div class="loading-spinner"></div>
                    <span>Đang tải dữ liệu...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="virtual-scrollbar">
            <div class="virtual-scrollbar-thumb"></div>
          </div>
        </div>

        <div class="table-footer">
          <div class="table-info">
            <span class="total-count">Tổng: 0 thành viên</span>
          </div>
          <div class="pagination-controls">
            <button type="button" class="btn-pagination" data-action="first" disabled>
              ⏪ Đầu
            </button>
            <button type="button" class="btn-pagination" data-action="prev" disabled>
              ◀ Trước
            </button>
            <span class="page-indicator">Trang 1 / 1</span>
            <button type="button" class="btn-pagination" data-action="next" disabled>
              Sau ▶
            </button>
            <button type="button" class="btn-pagination" data-action="last" disabled>
              Cuối ⏭
            </button>
          </div>
        </div>
      </div>
    `,this.addStyles()}addStyles(){if(document.getElementById("members-table-styles"))return;const e=document.createElement("style");e.id="members-table-styles",e.textContent=`
      .members-table-container {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-luxury);
      }

      .table-header {
        background: var(--surface-tertiary);
        border-bottom: 1px solid var(--border-secondary);
        padding: var(--spacing-md);
      }

      .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
      }

      .bulk-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .selected-count {
        font-weight: 500;
        color: var(--text-accent);
        font-size: 0.875rem;
      }

      .btn-bulk-action {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-bulk-action:hover {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .btn-bulk-action.btn-danger:hover {
        border-color: #EF4444;
        color: #EF4444;
      }

      .table-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .btn-refresh, .btn-export {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-refresh:hover, .btn-export:hover {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .virtual-table-wrapper {
        position: relative;
        height: 600px;
        overflow: hidden;
      }

      .table-scroll-container {
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .members-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        table-layout: fixed;
      }

      .table-head {
        position: sticky;
        top: 0;
        background: var(--surface-tertiary);
        z-index: 10;
      }

      .table-header-cell {
        padding: var(--spacing-md);
        border-bottom: 2px solid var(--border-primary);
        color: var(--text-accent);
        font-weight: 600;
        text-align: left;
        position: relative;
        user-select: none;
      }

      .table-header-cell.sortable {
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .table-header-cell.sortable:hover {
        background: var(--surface-secondary);
      }

      .sort-indicator {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .table-header-cell.sortable:hover .sort-indicator,
      .table-header-cell[aria-sort="ascending"] .sort-indicator,
      .table-header-cell[aria-sort="descending"] .sort-indicator {
        opacity: 1;
      }

      .table-header-cell[aria-sort="ascending"] .sort-indicator::after {
        content: '▲';
      }

      .table-header-cell[aria-sort="descending"] .sort-indicator::after {
        content: '▼';
      }

      .table-header-cell.sortable:hover .sort-indicator::after {
        content: '⇅';
      }

      .table-body tr {
        height: 48px;
        border-bottom: 1px solid var(--border-secondary);
        transition: background-color 0.2s ease;
      }

      .table-body tr:hover {
        background: var(--surface-tertiary);
      }

      .table-body tr.selected {
        background: rgba(201, 162, 0, 0.1);
      }

      .table-body td {
        padding: var(--spacing-sm) var(--spacing-md);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .loading-cell {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-secondary);
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-secondary);
        border-top: 2px solid var(--brand-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: var(--spacing-sm);
        vertical-align: middle;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .member-name {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name-primary {
        color: var(--text-primary);
        font-weight: 500;
      }

      .name-secondary {
        color: var(--text-tertiary);
        font-size: 0.8rem;
      }

      .role-badge, .tier-badge, .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tier-badge-1 { background: var(--brand-amber); color: var(--surface-primary); }
      .tier-badge-2 { background: var(--brand-gold); color: var(--surface-primary); }
      .tier-badge-3 { background: var(--brand-gold-electric); color: var(--surface-primary); }

      .status-badge-active { background: #22C55E; color: white; }
      .status-badge-inactive { background: #EF4444; color: white; }
      .status-badge-training { background: #3B82F6; color: white; }

      .habit-score {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .habit-score-value {
        font-weight: 600;
        font-family: var(--font-mono);
      }

      .habit-score-bar {
        flex: 1;
        height: 4px;
        background: var(--border-secondary);
        border-radius: 2px;
        overflow: hidden;
      }

      .habit-score-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .phone-number {
        font-family: var(--font-mono);
        color: var(--text-secondary);
      }

      .text-muted {
        color: var(--text-tertiary);
        font-style: italic;
      }

      .action-buttons {
        display: flex;
        gap: var(--spacing-xs);
      }

      .btn-action {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
      }

      .btn-action:hover {
        background: var(--surface-tertiary);
        color: var(--brand-gold);
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--surface-tertiary);
        border-top: 1px solid var(--border-secondary);
      }

      .total-count {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .btn-pagination {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        color: var(--text-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-pagination:hover:not(:disabled) {
        border-color: var(--brand-gold);
        color: var(--brand-gold);
      }

      .btn-pagination:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-indicator {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .virtual-scrollbar {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 12px;
        background: var(--surface-secondary);
        border-left: 1px solid var(--border-secondary);
      }

      .virtual-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: 6px;
        width: 8px;
        margin: 2px;
        transition: background-color 0.2s ease;
      }

      .virtual-scrollbar-thumb:hover {
        background: var(--brand-gold);
      }

      /* Inline editing */
      .inline-edit {
        position: relative;
      }

      .role-select {
        background: var(--surface-tertiary);
        border: 1px solid var(--border-primary);
        color: var(--text-primary);
        padding: 2px 4px;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        cursor: pointer;
      }

      .role-select:focus {
        outline: none;
        border-color: var(--brand-gold);
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .virtual-table-wrapper {
          height: 400px;
        }

        .table-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .table-header-cell,
        .table-body td {
          padding: var(--spacing-xs) var(--spacing-sm);
        }

        .members-table {
          font-size: 0.8rem;
        }

        .table-footer {
          flex-direction: column;
          gap: var(--spacing-sm);
          align-items: stretch;
        }

        .pagination-controls {
          justify-content: center;
        }
      }
    `,document.head.appendChild(e)}attachEventListeners(){const e=this.container;e.addEventListener("change",r=>{r.target.classList.contains("row-select")&&this.handleRowSelection(r.target)}),e.addEventListener("click",r=>{const a=r.target.closest(".table-header-cell.sortable");a&&this.handleSort(a.dataset.column),r.target.classList.contains("btn-bulk-action")&&this.handleBulkAction(r.target.dataset.action),r.target.matches(".btn-refresh")&&this.loadMembers(),r.target.matches(".btn-export")&&this.exportData(),r.target.classList.contains("btn-pagination")&&this.handlePagination(r.target.dataset.action),r.target.matches(".btn-action")&&this.handleRowAction(r.target)}),e.addEventListener("change",r=>{r.target.classList.contains("role-select")&&this.handleInlineRoleEdit(r.target)});const t=e.querySelector(".table-scroll-container");t&&t.addEventListener("scroll",()=>{this.handleVirtualScroll()})}async loadMembers(){this.isLoading=!0,this.updateLoadingState();try{const e=await fetch(`${this.options.apiUrl}?limit=1000&includePII=true`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const t=await e.json();this.members=t.data||[],this.filteredMembers=[...this.members],this.error=null,this.renderTableBody(),this.updateFooterInfo()}catch(e){console.error("Error loading members:",e),this.error=e.message,this.renderError()}finally{this.isLoading=!1,this.updateLoadingState()}}applyFilters(e){if(!e||Object.keys(e).length===0){this.filteredMembers=[...this.members],this.renderTableBody(),this.updateFooterInfo();return}this.filteredMembers=this.members.filter(t=>{if(e.tier&&e.tier.length>0&&!e.tier.includes(t.tier.toString())||e.status&&e.status.length>0&&!e.status.includes(t.status)||e.role&&e.role.length>0&&!e.role.includes(t.role))return!1;if(e.habitScore&&e.habitScore.length>0){const r=t.habitScore||0;if(!e.habitScore.some(i=>{const[s,o]=i.split("-").map(Number);return r>=s&&r<=o}))return!1}if(e.search){const r=e.search.toLowerCase(),a=t.name.toLowerCase().includes(r),i=t.email&&t.email.toLowerCase().includes(r),s=t.phone&&t.phone.includes(r);if(!a&&!i&&!s)return!1}return!0}),this.renderTableBody(),this.updateFooterInfo()}handleSort(e){this.sortConfig.column===e?this.sortConfig.direction=this.sortConfig.direction==="asc"?"desc":"asc":(this.sortConfig.column=e,this.sortConfig.direction="asc"),this.filteredMembers.sort((t,r)=>{let a=t[e],i=r[e];e==="joinedAt"?(a=new Date(a).getTime(),i=new Date(i).getTime()):typeof a=="string"&&(a=a.toLowerCase(),i=i.toLowerCase());let s=a<i?-1:a>i?1:0;return this.sortConfig.direction==="desc"?-s:s}),this.updateSortIndicators(),this.renderTableBody()}updateSortIndicators(){if(this.container.querySelectorAll(".table-header-cell").forEach(e=>{e.setAttribute("aria-sort","none")}),this.sortConfig.column){const e=this.container.querySelector(`[data-column="${this.sortConfig.column}"]`);e&&e.setAttribute("aria-sort",this.sortConfig.direction==="asc"?"ascending":"descending")}}renderTableBody(){const e=this.container.querySelector(".table-body");if(!e)return;if(this.filteredMembers.length===0){e.innerHTML=`
        <tr>
          <td colspan="${this.getColumns().length}" class="loading-cell">
            ${this.error?`<div class="error-message">❌ ${this.error}</div>`:'<div class="no-data">Không có dữ liệu thành viên</div>'}
          </td>
        </tr>
      `;return}const t=this.getColumns(),r=this.filteredMembers.map(a=>`
        <tr role="row" class="${this.selectedRows.has(a.id)?"selected":""}" data-id="${a.id}">
          ${t.map(s=>`
            <td role="gridcell">
              ${s.render(a)}
            </td>
          `).join("")}
        </tr>
      `).join("");e.innerHTML=r}renderRoleCell(e){if(!this.options.enableInlineEdit||this.options.userRole!=="Admin")return`<span class="role-badge role-${e.role.replace(" ","-").toLowerCase()}">${e.role}</span>`;const t=["Admin","Core Leader","PSN Leader","Member"];return`
      <select class="role-select" data-id="${e.id}" data-original="${e.role}">
        ${t.map(r=>`
          <option value="${r}" ${r===e.role?"selected":""}>${r}</option>
        `).join("")}
      </select>
    `}renderTierBadge(e){return`<span class="tier-badge tier-badge-${e}">${{1:"Tân Binh",2:"Chiến Binh",3:"Chỉ Huy"}[e]||`Tier ${e}`}</span>`}renderStatusBadge(e){return`<span class="status-badge status-badge-${e}">${{active:"Hoạt động",inactive:"Nghỉ",training:"Đào tạo"}[e]||e}</span>`}renderHabitScore(e=0){const t=Math.min(6,Math.max(0,e)),r=t/6*100,a=t>=5?"var(--brand-gold-electric)":t>=3?"var(--brand-gold)":"var(--brand-amber)";return`
      <div class="habit-score">
        <span class="habit-score-value" style="color: ${a}">${t}/6</span>
        <div class="habit-score-bar">
          <div class="habit-score-fill" style="width: ${r}%; background: ${a}"></div>
        </div>
      </div>
    `}renderActionButtons(e){return`
      <div class="action-buttons">
        <button class="btn-action" data-action="view" data-id="${e.id}" title="Xem chi tiết">
          👁️
        </button>
        <button class="btn-action" data-action="edit" data-id="${e.id}" title="Chỉnh sửa">
          ✏️
        </button>
      </div>
    `}formatPhone(e){return e?e.replace(/(\+84)(\d{3})(\d{3})(\d{3,4})/,"$1 $2 $3 $4"):""}formatDate(e){return e?new Date(e).toLocaleDateString("vi-VN"):""}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}handleRowSelection(e){const t=e.dataset.id,r=e.closest("tr");e.checked?(this.selectedRows.add(t),r.classList.add("selected")):(this.selectedRows.delete(t),r.classList.remove("selected")),this.updateBulkActions()}updateBulkActions(){const e=this.container.querySelector(".bulk-actions"),t=this.container.querySelector(".selected-count");this.selectedRows.size>0?(e.style.display="flex",t.textContent=`${this.selectedRows.size} đã chọn`):e.style.display="none"}async handleInlineRoleEdit(e){const t=e.dataset.id,r=e.value,a=e.dataset.original;if(r!==a)try{const i=await fetch(`${this.options.apiUrl}/${t}`,{method:"PATCH",headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"},body:JSON.stringify({role:r})});if(!i.ok)throw new Error(`Không thể cập nhật vai trò: ${i.statusText}`);const s=this.members.find(o=>o.id===t);s&&(s.role=r),e.dataset.original=r,this.showNotification("Đã cập nhật vai trò thành công","success")}catch(i){console.error("Error updating role:",i),e.value=a,this.showNotification(i.message,"error")}}async handleBulkAction(e){if(this.selectedRows.size===0)return;const t=Array.from(this.selectedRows);try{switch(e){case"activate":case"deactivate":const r=e==="activate"?"active":"inactive";await this.bulkUpdateStatus(t,r);break;case"delete":confirm(`Bạn có chắc muốn xóa ${t.length} thành viên?`)&&await this.bulkDelete(t);break}}catch(r){this.showNotification(r.message,"error")}}updateLoadingState(){const e=this.container.querySelector(".table-body");this.isLoading&&(e.innerHTML=`
        <tr class="loading-row">
          <td colspan="${this.getColumns().length}" class="loading-cell">
            <div class="loading-spinner"></div>
            <span>Đang tải dữ liệu...</span>
          </td>
        </tr>
      `)}updateFooterInfo(){const e=this.container.querySelector(".total-count");if(e){const t=this.filteredMembers.length,r=this.members.length;t===r?e.textContent=`Tổng: ${r} thành viên`:e.textContent=`Hiển thị: ${t} / ${r} thành viên`}}renderError(){const e=this.container.querySelector(".table-body");e.innerHTML=`
      <tr>
        <td colspan="${this.getColumns().length}" class="loading-cell">
          <div class="error-message" style="color: #EF4444;">
            ❌ ${this.error}
            <button class="btn-retry" onclick="this.closest('.members-table-container').querySelector('.btn-refresh').click()"
                    style="margin-left: 1rem; padding: 4px 8px; border: 1px solid #EF4444; background: transparent; color: #EF4444; border-radius: 4px; cursor: pointer;">
              Thử lại
            </button>
          </div>
        </td>
      </tr>
    `}getAuthToken(){return localStorage.getItem("auth_token")||"mock-token"}showNotification(e,t="info"){const r=document.createElement("div");r.textContent=e,r.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${t==="error"?"#EF4444":"#22C55E"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `,document.body.appendChild(r),setTimeout(()=>{document.body.removeChild(r)},3e3)}exportData(){const e=this.getColumns().filter(o=>o.key!=="select"&&o.key!=="actions"),t=e.map(o=>o.label).join(","),r=this.filteredMembers.map(o=>e.map(c=>{let n=o[c.key]||"";return typeof n=="string"&&n.includes(",")&&(n=`"${n}"`),n}).join(",")),a=[t,...r].join(`
`),i=new Blob([a],{type:"text/csv;charset=utf-8;"}),s=document.createElement("a");s.href=URL.createObjectURL(i),s.download=`members-${new Date().toISOString().split("T")[0]}.csv`,s.click()}handleVirtualScroll(){}handlePagination(e){console.log("Pagination action:",e)}handleRowAction(e){const t=e.dataset.action,r=e.dataset.id;switch(t){case"view":window.location.hash=`/members/${r}`;break;case"edit":console.log("Edit member:",r);break}}}class b{constructor(e){this.container=e,this.filterChips=null,this.membersTable=null,this.userRole=this.getCurrentUserRole(),this.init()}init(){this.render(),this.initializeComponents()}render(){this.container.innerHTML=`
      <div class="members-table-view">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Quản lý thành viên</h1>
            <p class="page-subtitle">
              Theo dõi và quản lý toàn bộ thành viên trong Hive Warfare Academy
            </p>
          </div>

          <div class="header-actions">
            <button type="button" class="btn-primary" id="add-member-btn">
              ➕ Thêm thành viên
            </button>
          </div>
        </div>

        <div class="members-content">
          <div class="filters-section">
            <!-- Filter chips will be rendered here -->
          </div>

          <div class="table-section">
            <!-- Members table will be rendered here -->
          </div>
        </div>
      </div>
    `,this.addStyles()}addStyles(){if(document.getElementById("members-table-view-styles"))return;const e=document.createElement("style");e.id="members-table-view-styles",e.textContent=`
      .members-table-view {
        padding: var(--spacing-lg);
        max-width: var(--container-max-width);
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-xl);
        gap: var(--spacing-lg);
      }

      .header-content {
        flex: 1;
      }

      .page-title {
        font-family: var(--font-display);
        color: var(--text-accent);
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 2rem;
      }

      .page-subtitle {
        color: var(--text-secondary);
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .btn-primary {
        background: var(--brand-gold);
        border: none;
        color: var(--surface-primary);
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 0.875rem;
      }

      .btn-primary:hover {
        background: var(--brand-gold-electric);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(201, 162, 0, 0.3);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      .members-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .filters-section {
        order: 1;
      }

      .table-section {
        order: 2;
      }

      /* Error boundary */
      .error-boundary {
        background: var(--surface-secondary);
        border: 1px solid #EF4444;
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        color: #EF4444;
      }

      .error-boundary h3 {
        color: #EF4444;
        margin-bottom: var(--spacing-md);
      }

      .error-boundary p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);
      }

      .error-boundary .btn-retry {
        background: transparent;
        border: 1px solid #EF4444;
        color: #EF4444;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .error-boundary .btn-retry:hover {
        background: #EF4444;
        color: white;
      }

      /* Loading state */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .loading-content {
        background: var(--surface-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        min-width: 200px;
      }

      .loading-spinner-large {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-secondary);
        border-top: 3px solid var(--brand-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto var(--spacing-md);
      }

      .loading-text {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .members-table-view {
          padding: var(--spacing-md);
        }

        .page-header {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-md);
        }

        .page-title {
          font-size: 1.5rem;
        }

        .header-actions {
          justify-content: stretch;
        }

        .btn-primary {
          justify-content: center;
          padding: var(--spacing-md);
        }

        .members-content {
          gap: var(--spacing-md);
        }
      }

      /* High DPI support */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .loading-spinner-large {
          transform: translateZ(0);
        }
      }

      /* Print styles */
      @media print {
        .page-header,
        .filters-section,
        .btn-primary {
          display: none !important;
        }

        .members-table-view {
          padding: 0;
        }
      }
    `,document.head.appendChild(e)}initializeComponents(){try{const e=this.container.querySelector(".filters-section");this.filterChips=new d(e,r=>{this.handleFilterChange(r)});const t=this.container.querySelector(".table-section");this.membersTable=new h(t,{userRole:this.userRole,enableInlineEdit:this.userRole==="Admin"}),this.setupEventListeners(),console.log("✅ Members table view initialized successfully")}catch(e){console.error("❌ Error initializing members table view:",e),this.renderErrorBoundary(e)}}setupEventListeners(){const e=this.container.querySelector("#add-member-btn");e&&e.addEventListener("click",()=>{this.handleAddMember()}),window.addEventListener("popstate",()=>{this.handleRouteChange()}),document.addEventListener("keydown",t=>{t.altKey&&t.key==="n"&&(t.preventDefault(),this.handleAddMember()),t.altKey&&t.key==="r"&&(t.preventDefault(),this.refreshData()),t.altKey&&t.key==="f"&&(t.preventDefault(),this.focusSearch())})}handleFilterChange(e){try{this.membersTable&&this.membersTable.applyFilters(e),this.updateUrlWithFilters(e)}catch(t){console.error("Error applying filters:",t),this.showErrorMessage("Có lỗi khi áp dụng bộ lọc")}}handleAddMember(){if(this.userRole!=="Admin"&&this.userRole!=="PSN Leader"){this.showErrorMessage("Bạn không có quyền thêm thành viên mới");return}this.showModal("add-member")}refreshData(){this.membersTable&&this.membersTable.loadMembers()}focusSearch(){const e=this.container.querySelector(".filter-search-input");e&&(e.focus(),e.select())}updateUrlWithFilters(e){try{const t=new URL(window.location),r=new URLSearchParams;Object.entries(e).forEach(([a,i])=>{Array.isArray(i)&&i.length>0?r.set(a,i.join(",")):i&&typeof i=="string"&&r.set(a,i)}),t.hash=`#/members?${r.toString()}`,window.history.replaceState(null,"",t.toString())}catch(t){console.warn("Could not update URL with filters:",t)}}loadFiltersFromUrl(){try{const t=new URL(window.location).hash.replace("#",""),[r,a]=t.split("?");if(r!=="/members"||!a)return{};const i=new URLSearchParams(a),s={};for(const[o,c]of i)o==="search"?s[o]=c:s[o]=c.split(",");return s}catch(e){return console.warn("Could not load filters from URL:",e),{}}}handleRouteChange(){const e=this.loadFiltersFromUrl();this.filterChips&&Object.keys(e).length>0&&this.filterChips.setFilters(e)}renderErrorBoundary(e){this.container.innerHTML=`
      <div class="error-boundary">
        <h3>❌ Có lỗi xảy ra khi tải trang</h3>
        <p>Lỗi: ${e.message}</p>
        <button class="btn-retry" onclick="window.location.reload()">
          🔄 Tải lại trang
        </button>
      </div>
    `}showErrorMessage(e){const t=document.createElement("div");t.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: #EF4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
    `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},4e3)}showModal(e){console.log(`Opening ${e} modal`),this.showErrorMessage("Tính năng này đang được phát triển")}getCurrentUserRole(){return localStorage.getItem("user_role")||"Member"}setUserRole(e){this.userRole=e,localStorage.setItem("user_role",e),this.membersTable&&(this.membersTable.options.userRole=e,this.membersTable.options.enableInlineEdit=e==="Admin",this.membersTable.renderTableBody())}destroy(){this.filterChips&&(this.filterChips=null),this.membersTable&&(this.membersTable=null);const e=this.container.querySelector("#add-member-btn");e&&e.replaceWith(e.cloneNode(!0))}}function p(l){return new b(l)}export{b as MembersTableView,p as renderMembersTablePage};
//# sourceMappingURL=members-table-CP0p7FMg.js.map
