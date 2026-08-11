class v{constructor(){this.apiBase=window.location.origin||location.origin,this.metrics=null}async render(n){n.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Funnel OS Analytics</h1>
        <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
      </div>
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu funnel...</p>
      </div>
    `,await this.loadMetrics(n)}async loadMetrics(n){try{const a=await fetch(`${this.apiBase}/api/analytics/funnel`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!a.ok)throw new Error(`API error: ${a.status}`);this.metrics=await a.json(),this.renderMetrics(n)}catch(a){n.innerHTML=`
        <div class="page-header">
          <h1 class="page-title">Funnel OS Analytics</h1>
          <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
        </div>
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải dữ liệu</h3>
          <p>Không thể kết nối API: ${a.message}</p>
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
      `}}renderMetrics(n){const a=this.metrics.counts||[],c=this.metrics.rates||[],l=this.metrics.revenue||[],o=["Lead Magnet","Trial","Health Active","Combo","CTV Partner"],t=["#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444"],i=["🧲","🎁","💚","🎯","🤝"],s=a.reduce((e,r)=>e+(r.count||0),0);let h="";if(a.length>0){const e=Math.max(...a.map(r=>r.count||0),1);h=`
        <div class="funnel-visualization">
          ${a.map((r,d)=>{const p=r.count||0,g=e>0?Math.max(p/e*100,5):5,m=c[d]?c[d].conversion_rate:null;return`
              <div class="funnel-tier" style="
                width: ${g}%;
                background: linear-gradient(135deg, ${t[d]}, ${t[d]}88);
                margin: 0 auto;
                padding: 1.5rem;
                border-radius: 8px;
                color: white;
                text-align: center;
                transition: all 0.3s ease;
                min-width: 200px;
              ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${i[d]}</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${p}</div>
                <div style="font-size: 0.875rem; opacity: 0.9;">${o[d]}</div>
                ${m!==null?`<div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">${m}% conversion</div>`:""}
              </div>
            `}).join('<div style="text-align: center; padding: 0.5rem; color: var(--text-secondary);">↓</div>')}
        </div>
      `}let u="";l.length>0&&(u=`
        <h3 style="margin-top: 2rem;">Doanh thu theo tier</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Tier</th><th>Tên</th><th>Số đơn</th><th>Tổng doanh thu</th></tr>
            </thead>
            <tbody>
              ${l.map(e=>`
                <tr>
                  <td><span class="tier-badge tier-${e.tier||0}">Tier ${e.tier||0}</span></td>
                  <td>${e.tier_name||"N/A"}</td>
                  <td>${e.order_count||0}</td>
                  <td><strong>${this.formatVND(e.revenue)}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `),n.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Funnel OS Analytics</h1>
        <p class="page-subtitle">Phân tích chuyển đổi 5-tier funnel và doanh thu</p>
      </div>

      <div class="card">
        <h3 class="card-title">📊 Tổng quan Funnel</h3>
        <p style="margin-bottom: 1rem;">Tổng số leads: <strong>${s}</strong></p>
        ${h}
      </div>

      ${c.length>0?`
        <div class="card" style="margin-top: 1.5rem;">
          <h3 class="card-title">📈 Tỷ lệ chuyển đổi</h3>
          <div class="dashboard-grid">
            ${c.map((e,r)=>`
              <div class="conversion-card" style="
                background: linear-gradient(135deg, ${t[r]}15, ${t[r]}05);
                border-left: 4px solid ${t[r]};
                padding: 1rem;
                border-radius: 8px;
              ">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${o[r]}</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: ${t[r]};">
                  ${e.conversion_rate||0}%
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  ${e.from_count||0} → ${e.to_count||0}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `:""}

      ${u}

      <div class="card" style="margin-top: 1.5rem;">
       

 <div class="card" style="margin-top: 1.5rem;">
 <h3 class="card-title">⚡ Hành động leader</h3>
 <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
 <button id="funnel-action-transition" class="btn-primary" disabled>Chuyển tier</button>
 <button id="funnel-action-create-order" class="btn-primary">Tạo đơn</button>
 <button id="funnel-action-mark-paid" class="btn-primary" disabled>Xác nhận thanh toán</button>
 </div>
 <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Chọn 1 lead từ bảng Funnel trước khi chuyển tier hoặc đánh dấu thanh toán.</p>
 </div>

 <h3 class="card-title">ℹ️ Thông tin hệ thống</h3>
        <p style="color: var(--text-secondary);">
          Funnel OS theo mô hình 5-tier: Lead Magnet (L0) → Trial (L1) → Health Active (L2) → Combo (L3) → CTV Partner (L4).
          Mỗi level có sản phẩm và giá trị riêng, tạo thành hệ thống chuyển đổi tự động.
        </p>
      </div>
    `}setupActionButtons(){const n=this.getAuthToken();if(!n)return;this.selectedLeadId=null,this.selectedOrderId=null;const a=document.getElementById("funnel-action-transition"),c=document.getElementById("funnel-action-create-order"),l=document.getElementById("funnel-action-mark-paid");a&&(a.onclick=async()=>{if(!this.selectedLeadId){alert("Chọn 1 lead từ bảng Funnel trước khi chuyển tier.");return}const o=prompt(`Nhập level mới (0-4):
0=Lead Magnet, 1=Trial, 2=Health Active, 3=Combo, 4=CTV Partner`);if(o===null)return;const t=parseInt(o,10);if(!Number.isInteger(t)||t<0||t>4){alert("Level không hợp lệ. Nhập số 0-4.");return}try{const i=await fetch(`${this.apiBase}/api/leads/${this.selectedLeadId}/transition`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({toLevel:t,actorId:"leader-ui"})});if(!i.ok)throw new Error(`HTTP ${i.status}`);const s=await i.json();alert(`Đã chuyển tier thành công! New level: ${s.lead.funnelLevel}`),this.loadMetrics(document.getElementById("page-content")||document.body)}catch(i){alert("Lỗi chuyển tier: "+i.message)}}),c&&(c.onclick=async()=>{const o=prompt("Tên lead:");if(o===null)return;const t=prompt("Tên sản phẩm:");if(t===null)return;const i=prompt("Product tier (0-4):");if(i===null)return;const s=parseInt(i,10),h=prompt("Đơn giá VND:");if(h===null)return;const u=parseInt(h,10);try{const e=await fetch(`${this.apiBase}/api/orders`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({leadName:o,productName:t,productTier:s,quantity:1,unitPriceVND:u,commissionRate:s>=4?25:s>=3?20:s>=2?15:10,paymentMethod:"cod"})});if(!e.ok)throw new Error(`HTTP ${e.status}`);const r=await e.json();alert(`Đã tạo đơn #${r.order.id}! Tổng: ${this.formatVND(r.order.totalVND)}`),this.loadMetrics(document.getElementById("page-content")||document.body)}catch(e){alert("Lỗi tạo đơn: "+e.message)}}),l&&(l.onclick=async()=>{if(!this.selectedOrderId){alert("Chọn 1 đơn hàng từ bảng đơn hàng trước khi xác nhận thanh toán.");return}const o=prompt("Mã thanh toán (paymentReference):");if(o!==null)try{const t=await fetch(`${this.apiBase}/api/orders/mark-paid`,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({orderId:this.selectedOrderId,paymentReference:o,paymentMethod:"cod"})});if(!t.ok)throw new Error(`HTTP ${t.status}`);const i=await t.json();alert(`Đã xác nhận thanh toán! Đơn #${i.order.id} - Trạng thái: ${i.order.paymentStatus}`),this.loadMetrics(document.getElementById("page-content")||document.body)}catch(t){alert("Lỗi xác nhận thanh toán: "+t.message)}})}formatVND(n){return!n||n===0?"0 ₫":new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0}).format(n)}getAuthToken(){return localStorage.getItem("auth_token")||""}}export{v as default};
//# sourceMappingURL=funnel-view-B3gBDwbB.js.map
