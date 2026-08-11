class n{constructor(){this.apiBase="https://hive-warfare-os.sadec-marketing-hub.workers.dev",this.orders=[],this.total=0,this.page=1,this.limit=50,this.statusFilter="",this.ctvFilter="",this.selectedOrder=null}async render(a){a.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Quản lý đơn hàng</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>
    `,await this.loadOrders(a)}async loadOrders(a){try{const e=new URLSearchParams({page:this.page.toString(),limit:this.limit.toString()});this.statusFilter&&e.set("status",this.statusFilter),this.ctvFilter&&e.set("ctv_id",this.ctvFilter);const t=await fetch(`${this.apiBase}/api/orders?${e}`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!t.ok)throw new Error(`API error: ${t.status}`);const s=await t.json();this.orders=s.orders||[],this.total=s.total||0,this.renderOrders(a)}catch(e){a.innerHTML=`
        <div class="page-header">
          <h1 class="page-title">Quản lý đơn hàng</h1>
          <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải dữ liệu</h3>
          <p>Không thể kết nối API: ${e.message}</p>
          <button onclick="location.reload()" style="
            background: var(--brand-gold);
            color: var(--surface-primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">Thử lại</button>
        </div>
      `}}renderOrders(a){const e={pending:"var(--status-yellow)",paid:"var(--status-green)",shipped:"var(--status-blue)",delivered:"var(--status-green)",cancelled:"var(--status-red)",refunded:"var(--status-yellow)"},t={pending:"Chờ thanh toán",paid:"Đã thanh toán",shipped:"Đang giao",delivered:"Đã giao",cancelled:"Đã hủy",refunded:"Đã hoàn tiền"},s=Math.ceil(this.total/this.limit);let l="";this.orders.length===0?l=`
        <div class="empty-state">
          <p>Không có đơn hàng nào</p>
        </div>
      `:l=`
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>CTV</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.orders.map(i=>`
                <tr>
                  <td><strong>#${i.id}</strong></td>
                  <td>${i.lead_name||"N/A"}<br><small style="color: var(--text-secondary);">${i.lead_email||""}</small></td>
                  <td>${i.product_name||"N/A"}</td>
                  <td><strong>${this.formatVND(i.total_vnd)}</strong></td>
                  <td>
                    <span class="status-badge" style="background: ${e[i.status]||"var(--text-secondary)"}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                      ${t[i.status]||i.status}
                    </span>
                  </td>
                  <td>${i.ctv_referrer_id||"—"}</td>
                  <td>${i.created_at?new Date(i.created_at).toLocaleDateString("vi-VN"):"N/A"}</td>
                  <td>
                    <button class="btn-sm btn-view-order" data-order-id="${i.id}">Chi tiết</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn-sm" ${this.page<=1?"disabled":""} data-page="${this.page-1}">← Trước</button>
          <span class="page-info">Trang ${this.page} / ${s||1} (${this.total} đơn)</span>
          <button class="btn-sm" ${this.page>=s?"disabled":""} data-page="${this.page+1}">Sau →</button>
        </div>
      `,a.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Quản lý đơn hàng</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      <div class="card">
        <div class="filter-bar">
          <select id="order-status-filter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="pending" ${this.statusFilter==="pending"?"selected":""}>Chờ thanh toán</option>
            <option value="paid" ${this.statusFilter==="paid"?"selected":""}>Đã thanh toán</option>
            <option value="shipped" ${this.statusFilter==="shipped"?"selected":""}>Đang giao</option>
            <option value="delivered" ${this.statusFilter==="delivered"?"selected":""}>Đã giao</option>
            <option value="cancelled" ${this.statusFilter==="cancelled"?"selected":""}>Đã hủy</option>
          </select>
          <input type="text" id="order-ctv-filter" class="filter-input" placeholder="Lọc theo CTV ID..." value="${this.ctvFilter}">
          <button class="btn-primary" id="apply-order-filters">Áp dụng</button>
        </div>
      </div>

      <div class="card">
        ${l}
      </div>

      <div id="order-detail-modal" class="modal" style="display: none;"></div>
    `,this.attachEvents(a)}attachEvents(a){const e=a.querySelector("#apply-order-filters");e&&e.addEventListener("click",()=>{var t,s;this.statusFilter=((t=a.querySelector("#order-status-filter"))==null?void 0:t.value)||"",this.ctvFilter=((s=a.querySelector("#order-ctv-filter"))==null?void 0:s.value)||"",this.page=1,this.loadOrders(a)}),a.querySelectorAll("[data-page]").forEach(t=>{t.addEventListener("click",()=>{this.page=parseInt(t.dataset.page),this.loadOrders(a)})}),a.querySelectorAll(".btn-view-order").forEach(t=>{t.addEventListener("click",async()=>{const s=t.dataset.orderId;await this.showOrderDetail(s)})})}async showOrderDetail(a){try{const e=await fetch(`${this.apiBase}/api/orders/${a}`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!e.ok)throw new Error(`API error: ${e.status}`);const t=await e.json(),s=document.getElementById("order-detail-modal");if(!s)return;s.style.display="block",s.innerHTML=`
        <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Đơn hàng #${t.id}</h2>
            <button class="modal-close" onclick="this.closest('.modal').style.display='none'">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Khách hàng:</span>
                <span class="detail-value">${t.lead_name||"N/A"} (${t.lead_email||""})</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sản phẩm:</span>
                <span class="detail-value">${t.product_name||"N/A"} (${t.product_tier||""})</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Số lượng:</span>
                <span class="detail-value">${t.quantity||1}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Đơn giá:</span>
                <span class="detail-value">${this.formatVND(t.unit_price_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tổng tiền:</span>
                <span class="detail-value" style="color: var(--brand-gold); font-weight: 700; font-size: 1.25rem;">${this.formatVND(t.total_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hoa hồng:</span>
                <span class="detail-value">${this.formatVND(t.commission_vnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Thanh toán:</span>
                <span class="detail-value">${t.payment_method||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Trạng thái:</span>
                <span class="detail-value">${t.status||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày tạo:</span>
                <span class="detail-value">${t.created_at?new Date(t.created_at).toLocaleString("vi-VN"):"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày thanh toán:</span>
                <span class="detail-value">${t.paid_at?new Date(t.paid_at).toLocaleString("vi-VN"):"Chưa thanh toán"}</span>
              </div>
            </div>
            ${t.items&&t.items.length>0?`
              <h4 style="margin-top: 1.5rem;">Chi tiết sản phẩm</h4>
              <table class="data-table">
                <thead>
                  <tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>
                  ${t.items.map(l=>`
                    <tr>
                      <td>${l.product_name||"N/A"}</td>
                      <td>${l.quantity}</td>
                      <td>${this.formatVND(l.unit_price_vnd)}</td>
                      <td>${this.formatVND(l.total_vnd)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `:""}
          </div>
        </div>
      `}catch(e){console.error("Failed to load order detail:",e)}}formatVND(a){return!a||a===0?"0 ₫":new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0}).format(a)}getAuthToken(){return localStorage.getItem("auth_token")||""}}export{n as default};
//# sourceMappingURL=orders-view-5qEiZ1pS.js.map
