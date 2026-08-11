class c{constructor(){this.apiBase=window.location.origin||location.origin,this.leads=[],this.total=0,this.page=1,this.limit=50,this.statusFilter="",this.selectedLead=null}async render(e){e.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Quản lý Leads</h1>
        <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách leads...</p>
      </div>
    `,await this.loadLeads(e)}async loadLeads(e){try{const s=new URLSearchParams({page:this.page.toString(),limit:this.limit.toString()});this.statusFilter&&s.set("status",this.statusFilter);const t=await fetch(`${this.apiBase}/api/leads?${s}`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!t.ok)throw new Error(`API error: ${t.status}`);const a=await t.json();this.leads=a.leads||[],this.total=a.total||0,this.renderLeads(e)}catch(s){e.innerHTML=`
        <div class="page-header">
          <h1 class="page-title">Quản lý Leads</h1>
          <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
        </div>
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải dữ liệu</h3>
          <p>Không thể kết nối API: ${s.message}</p>
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
      `}}renderLeads(e){const s={new:"var(--status-blue)",contacted:"var(--status-yellow)",qualified:"var(--status-green)",converted:"var(--status-green)",lost:"var(--status-red)"},t={new:"Mới",contacted:"Đã liên hệ",qualified:"Đủ điều kiện",converted:"Đã chuyển đổi",lost:"Đã mất"},a=Math.ceil(this.total/this.limit);let n="";this.leads.length===0?n=`
        <div class="empty-state">
          <p>Không có lead nào</p>
        </div>
      `:n=`
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Funnel Level</th>
                <th>Trạng thái</th>
                <th>CTV phụ trách</th>
                <th>Nguồn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.leads.map(i=>`
                <tr>
                  <td><strong>#${i.id}</strong></td>
                  <td>${i.name||"N/A"}</td>
                  <td>${i.email||"N/A"}</td>
                  <td>${i.phone||"N/A"}</td>
                  <td><span class="tier-badge tier-${i.funnel_level||0}">L${i.funnel_level||0}</span></td>
                  <td>
                    <span class="status-badge" style="background: ${s[i.status]||"var(--text-secondary)"}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                      ${t[i.status]||i.status||"Mới"}
                    </span>
                  </td>
                  <td>${i.assigned_ctv_id||"Chưa phân công"}</td>
                  <td>${i.source||"N/A"}</td>
                  <td>
                    <button class="btn-sm btn-view-lead" data-lead-id="${i.id}">Chi tiết</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn-sm" ${this.page<=1?"disabled":""} data-page="${this.page-1}">← Trước</button>
          <span class="page-info">Trang ${this.page} / ${a||1} (${this.total} leads)</span>
          <button class="btn-sm" ${this.page>=a?"disabled":""} data-page="${this.page+1}">Sau →</button>
        </div>
      `,e.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Quản lý Leads</h1>
        <p class="page-subtitle">Theo dõi và phân công leads trong hệ thống Funnel OS</p>
      </div>

      <div class="card">
        <div class="filter-bar">
          <select id="lead-status-filter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="new" ${this.statusFilter==="new"?"selected":""}>Mới</option>
            <option value="contacted" ${this.statusFilter==="contacted"?"selected":""}>Đã liên hệ</option>
            <option value="qualified" ${this.statusFilter==="qualified"?"selected":""}>Đủ điều kiện</option>
            <option value="converted" ${this.statusFilter==="converted"?"selected":""}>Đã chuyển đổi</option>
            <option value="lost" ${this.statusFilter==="lost"?"selected":""}>Đã mất</option>
          </select>
          <button class="btn-primary" id="apply-lead-filters">Áp dụng</button>
        </div>
      </div>

      <div class="card">
        ${n}
      </div>

      <div id="lead-detail-modal" class="modal" style="display: none;"></div>
    `,this.attachEvents(e)}attachEvents(e){const s=e.querySelector("#apply-lead-filters");s&&s.addEventListener("click",()=>{var t;this.statusFilter=((t=e.querySelector("#lead-status-filter"))==null?void 0:t.value)||"",this.page=1,this.loadLeads(e)}),e.querySelectorAll("[data-page]").forEach(t=>{t.addEventListener("click",()=>{this.page=parseInt(t.dataset.page),this.loadLeads(e)})}),e.querySelectorAll(".btn-view-lead").forEach(t=>{t.addEventListener("click",async()=>{const a=t.dataset.leadId;await this.showLeadDetail(a)})})}async showLeadDetail(e){try{const s=await fetch(`${this.apiBase}/api/leads/${e}`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!s.ok)throw new Error(`API error: ${s.status}`);const t=await s.json(),a=document.getElementById("lead-detail-modal");if(!a)return;a.style.display="block",a.innerHTML=`
        <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Lead #${t.id} - ${t.name||"N/A"}</h2>
            <button class="modal-close" onclick="this.closest('.modal').style.display='none'">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Tên:</span>
                <span class="detail-value">${t.name||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${t.email||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Điện thoại:</span>
                <span class="detail-value">${t.phone||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Funnel Level:</span>
                <span class="detail-value"><span class="tier-badge tier-${t.funnel_level||0}">L${t.funnel_level||0}</span></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Trạng thái:</span>
                <span class="detail-value">${t.status||"Mới"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">CTV phụ trách:</span>
                <span class="detail-value">${t.assigned_ctv_id||"Chưa phân công"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nguồn:</span>
                <span class="detail-value">${t.source||"N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ngày tạo:</span>
                <span class="detail-value">${t.created_at?new Date(t.created_at).toLocaleString("vi-VN"):"N/A"}</span>
              </div>
            </div>

            ${t.quiz_answers?`
              <h4 style="margin-top: 1.5rem;">Quiz Answers</h4>
              <pre style="background: var(--surface-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto;">${(()=>{try{const n=JSON.parse(t.quiz_answers);return typeof n!="object"||Array.isArray(n)?"":JSON.stringify(n).replace(/[<>&"']/g,i=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"})[i])}catch{return""}})()}</pre>
            `:""}

            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <h4 style="width: 100%;">Phân công CTV:</h4>
              <input type="text" id="assign-ctv-id" class="filter-input" placeholder="CTV ID..." style="width: 150px;">
              <select id="assign-status" class="filter-select">
                <option value="">-- Trạng thái --</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="qualified">Đủ điều kiện</option>
                <option value="converted">Đã chuyển đổi</option>
                <option value="lost">Đã mất</option>
              </select>
              <button class="btn-primary" id="assign-lead-btn">Cập nhật</button>
            </div>

            <div style="margin-top: 2rem;">
              <h4>Lịch sử hành trình</h4>
              <button class="btn-sm" id="load-journey-btn" data-lead-id="${t.id}">Tải journey events</button>
              <div id="journey-events" style="margin-top: 1rem;"></div>
            </div>
          </div>
        </div>
      `,this.attachModalEvents(e)}catch(s){console.error("Failed to load lead detail:",s)}}attachModalEvents(e){const s=document.getElementById("assign-lead-btn");s&&s.addEventListener("click",async()=>{var i,d;const a=((i=document.getElementById("assign-ctv-id"))==null?void 0:i.value)||"",n=((d=document.getElementById("assign-status"))==null?void 0:d.value)||"";if(!(!a&&!n))try{const l={};a&&(l.assigned_ctv_id=a),n&&(l.status=n);const o=await fetch(`${this.apiBase}/api/leads/${e}`,{method:"PATCH",headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"},body:JSON.stringify(l)});if(!o.ok)throw new Error(`API error: ${o.status}`);alert("Cập nhật thành công!"),location.reload()}catch(l){alert(`Lỗi: ${l.message}`)}});const t=document.getElementById("load-journey-btn");t&&t.addEventListener("click",async()=>{const a=document.getElementById("journey-events");if(a)try{const n=await fetch(`${this.apiBase}/api/leads/${e}/journey`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!n.ok)throw new Error(`API error: ${n.status}`);const d=(await n.json()).events||[];if(d.length===0){a.innerHTML='<p style="color: var(--text-secondary);">Chưa có journey event nào.</p>';return}a.innerHTML=`
            <table class="data-table">
              <thead>
                <tr><th>Thời gian</th><th>Event</th><th>Mô tả</th><th>CTV</th></tr>
              </thead>
              <tbody>
                ${d.map(l=>`
                  <tr>
                    <td>${l.created_at?new Date(l.created_at).toLocaleString("vi-VN"):"N/A"}</td>
                    <td><strong>${l.event_type||"N/A"}</strong></td>
                    <td>${l.description||"—"}</td>
                    <td>${l.ctv_id||"—"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}catch(n){a.textContent="Lỗi: "+n.message}})}getAuthToken(){return localStorage.getItem("auth_token")||""}}export{c as default};
//# sourceMappingURL=leads-view-C_3Mu3En.js.map
