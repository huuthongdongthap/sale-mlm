class y{constructor(){this.defaultOptions={width:120,height:40,color:"#C9A200",strokeWidth:2,showDots:!1,smooth:!0,animate:!0,padding:{top:4,right:4,bottom:4,left:4}}}render(t={}){const e={...this.defaultOptions,...t},{data:a,width:s,height:r,color:i,strokeWidth:n,showDots:l,smooth:o,animate:c,padding:d}=e;if(!a||!Array.isArray(a)||a.length<2)return this.renderEmptyState();const h=`sparkline-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,p=s-d.left-d.right,m=r-d.top-d.bottom,u=this.prepareDataPoints(a,p,m,d),b=this.generatePath(u,o);return`
      <svg id="${h}"
           class="sparkline-svg"
           width="${s}"
           height="${r}"
           viewBox="0 0 ${s} ${r}"
           xmlns="http://www.w3.org/2000/svg"
           role="img"
           aria-label="Biểu đồ xu hướng ${a.length} điểm dữ liệu">

        <defs>
          <linearGradient id="sparkline-gradient-${h}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${i};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${i};stop-opacity:0.05" />
          </linearGradient>
        </defs>

        <!-- Background area fill -->
        ${this.generateAreaPath(u,r,d,`sparkline-gradient-${h}`)}

        <!-- Main line -->
        <path d="${b}"
              fill="none"
              stroke="${i}"
              stroke-width="${n}"
              stroke-linecap="round"
              stroke-linejoin="round"
              ${c?'class="sparkline-animate"':""}>
        </path>

        <!-- Data points -->
        ${l?this.generateDots(u,i):""}

        <!-- Trend indicators -->
        ${this.generateTrendIndicators(u,i)}
      </svg>
    `}prepareDataPoints(t,e,a,s){const r=t.map(o=>typeof o=="object"?o.value:o),i=Math.min(...r),l=Math.max(...r)-i||1;return t.map((o,c)=>{const d=typeof o=="object"?o.value:o,h=typeof o=="object"?o.timestamp:null,p=s.left+c/(t.length-1)*e,m=s.top+a-(d-i)/l*a;return{x:Math.round(p*100)/100,y:Math.round(m*100)/100,value:d,timestamp:h,index:c}})}generatePath(t,e){return t.length?e&&t.length>2?this.generateSmoothPath(t):this.generateLinearPath(t):""}generateLinearPath(t){return t.map((a,s)=>s===0?`M ${a.x} ${a.y}`:`L ${a.x} ${a.y}`).join(" ")}generateSmoothPath(t){if(t.length<3)return this.generateLinearPath(t);const e=[];e.push(`M ${t[0].x} ${t[0].y}`);for(let a=1;a<t.length;a++){const s=t[a-1],r=t[a];if(a===1){const i=t[a+1],n=s.x+(r.x-s.x)*.3,l=s.y,o=r.x-(i.x-s.x)*.3,c=r.y;e.push(`C ${n} ${l}, ${o} ${c}, ${r.x} ${r.y}`)}else if(a===t.length-1){const i=t[a-2],n=s.x+(r.x-i.x)*.3,l=s.y,o=r.x,c=r.y;e.push(`C ${n} ${l}, ${o} ${c}, ${r.x} ${r.y}`)}else{const i=t[a-2],n=t[a+1],l=s.x+(r.x-i.x)*.3,o=s.y,c=r.x-(n.x-s.x)*.3,d=r.y;e.push(`C ${l} ${o}, ${c} ${d}, ${r.x} ${r.y}`)}}return e.join(" ")}generateAreaPath(t,e,a,s){if(!t.length)return"";const r=this.generatePath(t,!0),i=t[0],n=t[t.length-1];return`
      <path d="${`${r} L ${n.x} ${e-a.bottom} L ${i.x} ${e-a.bottom} Z`}"
            fill="url(#${s})"
            opacity="0.6">
      </path>
    `}generateDots(t,e){return t.map(a=>`
      <circle cx="${a.x}"
              cy="${a.y}"
              r="2"
              fill="${e}"
              stroke="var(--surface-secondary)"
              stroke-width="1">
        <title>Giá trị: ${a.value}</title>
      </circle>
    `).join("")}generateTrendIndicators(t,e){if(t.length<2)return"";const a=t[0],s=t[t.length-1],r=s.value>a.value?"up":s.value<a.value?"down":"stable",i=3,n=s.x+8,l=s.y;return r==="up"?`
        <polygon points="${n},${l-i} ${n+i},${l+i} ${n-i},${l+i}"
                 fill="#00cc66"
                 opacity="0.8">
        </polygon>
      `:r==="down"?`
        <polygon points="${n},${l+i} ${n+i},${l-i} ${n-i},${l-i}"
                 fill="#ff4444"
                 opacity="0.8">
        </polygon>
      `:""}renderEmptyState(){return`
      <div class="sparkline-empty" style="
        width: ${this.defaultOptions.width}px;
        height: ${this.defaultOptions.height}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        font-size: 0.75rem;
        border: 1px dashed var(--border-secondary);
        border-radius: var(--radius-sm);
      ">
        Chưa có dữ liệu
      </div>
    `}static addStyles(){if(document.getElementById("sparkline-styles"))return;document.head.insertAdjacentHTML("beforeend",`
      <style id="sparkline-styles">
        .sparkline-svg {
          overflow: visible;
        }

        .sparkline-animate {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: sparkline-draw 1.5s ease-out forwards;
        }

        @keyframes sparkline-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .sparkline-empty {
          background: var(--surface-tertiary);
        }

        @media (prefers-reduced-motion: reduce) {
          .sparkline-animate {
            animation: none;
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }
      </style>
    `)}static generateSampleData(t=7,e=0,a=100){const s=[];for(let r=0;r<t;r++)s.push({value:Math.floor(Math.random()*(a-e+1))+e,timestamp:new Date(Date.now()-(t-r-1)*24*60*60*1e3).toISOString()});return s}}y.addStyles();class v{constructor(t){this.metric=t.metric,this.currentValue=t.current_value,this.targetValue=t.target_value,this.status=t.status,this.sparklineData=t.sparkline||[],this.trend=t.trend||"stable",this.period=t.period||"weekly",this.sparkline=new y}render(){const t=`kpi-card-${this.metric.replace(/[^a-zA-Z0-9]/g,"-")}`,e=this.getStatusClass(),a=this.getMetricLabel(),s=this.getTrendIcon();return`
      <div class="kpi-card ${e}"
           data-metric="${this.metric}"
           id="${t}"
           role="button"
           tabindex="0"
           aria-label="KPI ${a}: ${this.formatValue(this.currentValue)} / ${this.formatValue(this.targetValue)}. Trạng thái: ${this.getStatusText()}. Nhấn để xem chi tiết">

        <div class="kpi-header">
          <div class="kpi-title">
            <span class="kpi-icon">${this.getMetricIcon()}</span>
            <span class="kpi-label">${a}</span>
          </div>
          <div class="kpi-status-pill status-${this.status.toLowerCase()}">
            ${this.getStatusText()}
          </div>
        </div>

        <div class="kpi-content">
          <div class="kpi-values">
            <div class="kpi-current">
              <span class="value">${this.formatValue(this.currentValue)}</span>
              <span class="trend ${this.trend}">
                ${s}
              </span>
            </div>
            <div class="kpi-target">
              <span class="label">Mục tiêu:</span>
              <span class="value">${this.formatValue(this.targetValue)}</span>
            </div>
          </div>

          <div class="kpi-progress">
            ${this.renderProgressBar()}
          </div>

          <div class="kpi-chart">
            ${this.renderSparkline()}
          </div>
        </div>

        <div class="kpi-footer">
          <span class="period-label">${this.getPeriodLabel()}</span>
          <span class="click-hint">Nhấn để xem chi tiết</span>
        </div>
      </div>
    `}getStatusClass(){return{RED:"status-red",YELLOW:"status-yellow",GREEN:"status-green"}[this.status]||"status-neutral"}getStatusText(){return{RED:"Cần cải thiện",YELLOW:"Gần đạt",GREEN:"Đạt mục tiêu"}[this.status]||"Chưa xác định"}getMetricLabel(){return{connects_per_day:"Kết nối/ngày",follow_ups_per_day:"Follow-up/ngày",first_order_14d:"Đơn đầu 14 ngày",habit_score:"Điểm thói quen",team_size:"Quy mô nhóm",retention_rate:"Tỷ lệ giữ chân",personal_revenue:"Doanh thu cá nhân",team_revenue:"Doanh thu nhóm"}[this.metric]||this.metric}getMetricIcon(){return{connects_per_day:"[📞]",follow_ups_per_day:"[💌]",first_order_14d:"[🛒]",habit_score:"[⭐]",team_size:"[👥]",retention_rate:"[🔒]",personal_revenue:"[💰]",team_revenue:"[🏆]"}[this.metric]||"[📊]"}getTrendIcon(){return{up:"↗️",down:"↘️",stable:"➡️"}[this.trend]||"➡️"}formatValue(t){return typeof t!="number"?t||"--":this.metric.includes("revenue")?new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0}).format(t):this.metric.includes("rate")?`${Math.round(t)}%`:this.metric==="habit_score"?`${t.toFixed(1)}/6`:Math.round(t).toLocaleString("vi-VN")}renderProgressBar(){if(!this.targetValue||this.targetValue===0)return'<div class="progress-bar-placeholder">Chưa có mục tiêu</div>';const t=Math.min(this.currentValue/this.targetValue*100,100),e=t>=100?"complete":t>=80?"good":t>=60?"warning":"poor";return`
      <div class="progress-bar" role="progressbar"
           aria-valuenow="${this.currentValue}"
           aria-valuemin="0"
           aria-valuemax="${this.targetValue}"
           aria-label="Tiến độ: ${Math.round(t)}%">
        <div class="progress-fill ${e}"
             style="width: ${t}%"></div>
        <div class="progress-text">
          ${Math.round(t)}%
        </div>
      </div>
    `}renderSparkline(){if(!this.sparklineData||this.sparklineData.length===0)return'<div class="sparkline-placeholder">Chưa có dữ liệu xu hướng</div>';try{return this.sparkline.render({data:this.sparklineData,width:120,height:40,color:this.getSparklineColor(),showDots:!1,smooth:!0})}catch(t){return console.warn("Sparkline render error:",t),'<div class="sparkline-error">Lỗi biểu đồ</div>'}}getSparklineColor(){return{RED:"var(--md-color-error, #ff4444)",YELLOW:"var(--md-color-warning, #ffaa00)",GREEN:"var(--md-color-success, #00cc66)"}[this.status]||"var(--md-color-outline, #666666)"}getPeriodLabel(){return{daily:"Hôm nay",weekly:"7 ngày qua",monthly:"30 ngày qua"}[this.period]||"Kỳ này"}static bindKeyboardEvents(){document.addEventListener("keydown",t=>{const e=document.activeElement;e&&e.classList.contains("kpi-card")&&(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),e.click())})}static addStyles(){if(document.getElementById("kpi-card-styles"))return;document.head.insertAdjacentHTML("beforeend",`
      <style id="kpi-card-styles">
        .kpi-card {
          background: var(--surface-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .kpi-card:hover,
        .kpi-card:focus {
          transform: translateY(-2px);
          box-shadow: var(--shadow-luxury);
          border-color: var(--brand-gold);
        }

        .kpi-card.status-red {
          border-left: 4px solid var(--md-sys-color-error, var(--color-error));
        }

        .kpi-card.status-yellow {
          border-left: 4px solid var(--md-sys-color-tertiary, var(--color-warning, var(--md-color-warning, #ffaa00)));
        }

        .kpi-card.status-green {
          border-left: 4px solid var(--md-sys-color-success, var(--color-success, var(--md-color-success, #00cc66)));
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .kpi-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .kpi-icon {
          font-size: 1.25rem;
        }

        .kpi-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .kpi-status-pill {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-red {
          background: rgba(255, 68, 68, 0.1);
          color: var(--md-sys-color-error, var(--color-error));
          border: 1px solid rgba(255, 68, 68, 0.3);
        }

        .status-yellow {
          background: rgba(255, 170, 0, 0.1);
          color: var(--md-sys-color-tertiary, var(--color-warning, var(--md-color-warning-light, #ffcc33)));
          border: 1px solid rgba(255, 170, 0, 0.3);
        }

        .status-green {
          background: rgba(0, 204, 102, 0.1);
          color: var(--md-sys-color-success, var(--color-success, var(--md-color-success-light, #33ff88)));
          border: 1px solid rgba(0, 204, 102, 0.3);
        }

        .kpi-values {
          margin-bottom: var(--spacing-md);
        }

        .kpi-current {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }

        .kpi-current .value {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-accent-bright);
        }

        .trend {
          font-size: 1rem;
        }

        .kpi-target {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .progress-bar {
          position: relative;
          background: var(--surface-tertiary);
          border-radius: var(--radius-sm);
          height: 6px;
          margin-bottom: var(--spacing-md);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: var(--radius-sm);
          transition: width 0.3s ease;
        }

        .progress-fill.complete {
          background: linear-gradient(90deg, var(--md-sys-color-primary-container), var(--md-sys-color-primary));
        }

        .progress-fill.good {
          background: linear-gradient(90deg, var(--md-sys-color-tertiary-container), var(--md-sys-color-tertiary));
        }

        .progress-fill.warning {
          background: linear-gradient(90deg, var(--md-sys-color-tertiary-container), var(--md-sys-color-tertiary));
        }

        .progress-fill.poor {
          background: linear-gradient(90deg, var(--md-sys-color-error-container), var(--md-sys-color-error));
        }

        .progress-text {
          position: absolute;
          top: -24px;
          right: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .kpi-chart {
          margin-bottom: var(--spacing-md);
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .sparkline-placeholder,
        .sparkline-error {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          font-style: italic;
          text-align: center;
          width: 100%;
        }

        .kpi-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          border-top: 1px solid var(--border-secondary);
          padding-top: var(--spacing-sm);
        }

        .click-hint {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .kpi-card:hover .click-hint,
        .kpi-card:focus .click-hint {
          opacity: 1;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-card {
            padding: var(--spacing-md);
          }

          .kpi-current .value {
            font-size: 1.25rem;
          }
        }
      </style>
    `)}}v.addStyles();v.bindKeyboardEvents();class f{constructor(t){this.metric=t.metric,this.member=t.member,this.currentKPI=t.currentKPI,this.tierTarget=t.tierTarget,this.onClose=t.onClose||(()=>{}),this.isVisible=!1,this.modalElement=null,this.historyData=null,this.setupModal()}setupModal(){this.modalElement=document.createElement("div"),this.modalElement.className="kpi-modal-overlay",this.modalElement.innerHTML=this.generateModalHTML(),(document.getElementById("kpi-modal-container")||document.body).appendChild(this.modalElement),this.bindEvents()}generateModalHTML(){const t=this.getMetricLabel();return`
      <div class="kpi-modal" role="dialog" aria-labelledby="kpi-modal-title" aria-modal="true">
        <div class="kpi-modal-content">
          <header class="kpi-modal-header">
            <div class="kpi-modal-title-group">
              <h2 id="kpi-modal-title" class="kpi-modal-title">
                <span class="modal-icon">${this.getMetricIcon()}</span>
                ${t} - Chi tiết
              </h2>
              <p class="kpi-modal-subtitle">
                ${this.member.full_name} (${this.member.tier||"Tân Binh"})
              </p>
            </div>
            <button class="kpi-modal-close" aria-label="Đóng modal" type="button">
              <span>✕</span>
            </button>
          </header>

          <div class="kpi-modal-body">
            <div class="loading-section">
              <div class="loading-spinner"></div>
              <p>Đang tải dữ liệu 30 ngày qua...</p>
            </div>
          </div>
        </div>
      </div>
    `}async show(){this.isVisible=!0,this.modalElement.style.display="flex",requestAnimationFrame(()=>{this.modalElement.classList.add("visible")});const t=this.modalElement.querySelector(".kpi-modal-close");t&&t.focus(),document.body.style.overflow="hidden",await this.loadDetailedData()}hide(){this.isVisible=!1,this.modalElement.classList.remove("visible"),document.body.style.overflow="",setTimeout(()=>{this.modalElement.style.display="none",this.cleanup()},300)}cleanup(){this.modalElement&&this.modalElement.parentNode&&this.modalElement.parentNode.removeChild(this.modalElement),this.modalElement=null}async loadDetailedData(){try{const t=await fetch(`/api/kpi/${this.member.id||"current"}/history?metric=${this.metric}&days=30`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!t.ok)throw new Error(`Failed to load history: ${t.status}`);this.historyData=await t.json(),this.renderDetailedContent()}catch(t){console.error("Failed to load KPI history:",t),this.renderError(t.message)}}renderDetailedContent(){const t=this.modalElement.querySelector(".kpi-modal-body");t&&(t.innerHTML=`
      <div class="kpi-detail-content">
        <!-- Current Status Section -->
        <section class="current-status-section">
          <h3 class="section-title">Trạng thái hiện tại</h3>
          <div class="status-grid">
            ${this.renderCurrentStatusCard()}
            ${this.renderTargetProgressCard()}
            ${this.renderTrendAnalysisCard()}
          </div>
        </section>

        <!-- History Chart Section -->
        <section class="history-chart-section">
          <h3 class="section-title">Xu hướng 30 ngày qua</h3>
          <div class="chart-container">
            ${this.renderHistoryChart()}
          </div>
        </section>

        <!-- Data Table Section -->
        <section class="history-table-section">
          <h3 class="section-title">Dữ liệu chi tiết</h3>
          <div class="table-container">
            ${this.renderHistoryTable()}
          </div>
        </section>

        <!-- Insights Section -->
        <section class="insights-section">
          <h3 class="section-title">Phân tích & Gợi ý</h3>
          <div class="insights-content">
            ${this.renderInsights()}
          </div>
        </section>
      </div>
    `)}renderCurrentStatusCard(){const t=this.currentKPI.status,e=t.toLowerCase(),a=this.getStatusText(t);return`
      <div class="status-card current-status">
        <div class="status-header">
          <span class="status-icon">📊</span>
          <span class="status-label">Giá trị hiện tại</span>
        </div>
        <div class="status-value">
          ${this.formatValue(this.currentKPI.current_value)}
        </div>
        <div class="status-pill status-${e}">
          ${a}
        </div>
      </div>
    `}renderTargetProgressCard(){const t=this.tierTarget?this.currentKPI.current_value/this.tierTarget.target_value*100:0,e=t>=100?"complete":t>=80?"good":t>=60?"warning":"poor";return`
      <div class="status-card target-progress">
        <div class="status-header">
          <span class="status-icon">🎯</span>
          <span class="status-label">Mục tiêu ${this.member.tier||"Tân Binh"}</span>
        </div>
        <div class="status-value">
          ${this.tierTarget?this.formatValue(this.tierTarget.target_value):"Chưa đặt"}
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${e}" style="width: ${Math.min(t,100)}%"></div>
          <div class="progress-text">${Math.round(t)}%</div>
        </div>
      </div>
    `}renderTrendAnalysisCard(){if(!this.historyData||!this.historyData.daily_values)return`
        <div class="status-card trend-analysis">
          <div class="status-header">
            <span class="status-icon">📈</span>
            <span class="status-label">Xu hướng</span>
          </div>
          <div class="no-data">Chưa có dữ liệu</div>
        </div>
      `;const t=this.historyData.daily_values.map(o=>o.value),e=t.slice(-7),a=t.slice(-14,-7),s=e.reduce((o,c)=>o+c,0)/e.length,r=a.length?a.reduce((o,c)=>o+c,0)/a.length:s,i=(s-r)/r*100,n=i>5?"up":i<-5?"down":"stable";return`
      <div class="status-card trend-analysis">
        <div class="status-header">
          <span class="status-icon">📈</span>
          <span class="status-label">Xu hướng 7 ngày</span>
        </div>
        <div class="status-value">
          ${n==="up"?"↗️":n==="down"?"↘️":"➡️"} ${Math.abs(i).toFixed(1)}%
        </div>
        <div class="trend-description">
          ${n==="up"?"Tăng":n==="down"?"Giảm":"Ổn định"} so với tuần trước
        </div>
      </div>
    `}renderHistoryChart(){if(!this.historyData||!this.historyData.daily_values)return'<div class="chart-placeholder">Chưa có dữ liệu để hiển thị biểu đồ</div>';const t=this.historyData.daily_values,e=this.tierTarget?this.tierTarget.target_value:null,a=600,s=200,r=40,i=t.map(h=>h.value),n=Math.min(...i,e||1/0),o=Math.max(...i,e||-1/0)-n||1,c=t.map((h,p)=>{const m=r+p/(t.length-1)*(a-2*r),u=r+(s-2*r)-(h.value-n)/o*(s-2*r);return`${m},${u}`}).join(" "),d=e?r+(s-2*r)-(e-n)/o*(s-2*r):null;return`
      <svg class="history-chart" width="${a}" height="${s}" viewBox="0 0 ${a} ${s}">
        <!-- Grid lines -->
        <defs>
          <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="var(--border-secondary)" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Target line -->
        ${e?`
          <line x1="${r}" y1="${d}" x2="${a-r}" y2="${d}"
                stroke="var(--brand-amber)" stroke-width="2" stroke-dasharray="5,5" opacity="0.8">
          </line>
          <text x="${a-r-60}" y="${d-5}" fill="var(--brand-amber)" font-size="12">
            Mục tiêu: ${this.formatValue(e)}
          </text>
        `:""}

        <!-- Data line -->
        <polyline fill="none" stroke="var(--brand-gold)" stroke-width="2" points="${c}"/>

        <!-- Data points -->
        ${t.map((h,p)=>{const m=r+p/(t.length-1)*(a-2*r),u=r+(s-2*r)-(h.value-n)/o*(s-2*r);return`<circle cx="${m}" cy="${u}" r="3" fill="var(--brand-gold-electric)">
            <title>${new Date(h.date).toLocaleDateString("vi-VN")}: ${this.formatValue(h.value)}</title>
          </circle>`}).join("")}

        <!-- Axes -->
        <line x1="${r}" y1="${r}" x2="${r}" y2="${s-r}" stroke="var(--text-secondary)" stroke-width="1"/>
        <line x1="${r}" y1="${s-r}" x2="${a-r}" y2="${s-r}" stroke="var(--text-secondary)" stroke-width="1"/>
      </svg>
    `}renderHistoryTable(){if(!this.historyData||!this.historyData.daily_values)return'<div class="table-placeholder">Chưa có dữ liệu chi tiết</div>';const t=this.historyData.daily_values.slice(-14);return`
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Giá trị</th>
              <th>Mục tiêu</th>
              <th>Trạng thái</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            ${t.map((e,a)=>{const s=a>0?t[a-1].value:e.value,r=e.value-s,i=s?r/s*100:0,n=this.calculateDayStatus(e.value);return`
                <tr>
                  <td>${new Date(e.date).toLocaleDateString("vi-VN",{weekday:"short",day:"2-digit",month:"2-digit"})}</td>
                  <td class="value-cell">${this.formatValue(e.value)}</td>
                  <td class="target-cell">${this.tierTarget?this.formatValue(this.tierTarget.target_value):"--"}</td>
                  <td>
                    <span class="status-pill status-${n.toLowerCase()}">${this.getStatusText(n)}</span>
                  </td>
                  <td class="change-cell ${r>0?"positive":r<0?"negative":"neutral"}">
                    ${r>0?"+":""}${r.toFixed(1)}
                    ${i!==0?`(${i>0?"+":""}${i.toFixed(1)}%)`:""}
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `}renderInsights(){return this.historyData?`
      <div class="insights-grid">
        ${this.generateInsights().map(e=>`
          <div class="insight-card ${e.type}">
            <div class="insight-icon">${e.icon}</div>
            <div class="insight-content">
              <h4 class="insight-title">${e.title}</h4>
              <p class="insight-description">${e.description}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `:'<div class="insights-placeholder">Đang phân tích dữ liệu...</div>'}generateInsights(){const t=[],a=this.historyData.daily_values.map(i=>i.value).slice(-7),s=a[a.length-1]-a[0];if(s>0?t.push({type:"positive",icon:"📈",title:"Xu hướng tích cực",description:`Hiệu suất đã cải thiện ${this.formatValue(s)} trong 7 ngày qua.`}):s<0&&t.push({type:"warning",icon:"📉",title:"Cần chú ý",description:`Hiệu suất giảm ${this.formatValue(Math.abs(s))} trong 7 ngày qua.`}),this.calculateVariance(a)<10?t.push({type:"neutral",icon:"🎯",title:"Hiệu suất ổn định",description:"Kết quả tương đối đồng đều trong tuần qua."}):t.push({type:"info",icon:"📊",title:"Biến động cao",description:"Hiệu suất có nhiều thay đổi. Cần tìm hiểu nguyên nhân."}),this.tierTarget){const i=this.currentKPI.current_value/this.tierTarget.target_value*100;i>=100?t.push({type:"success",icon:"🏆",title:"Đã đạt mục tiêu",description:"Chúc mừng! Bạn đã vượt qua mục tiêu đề ra."}):i>=80?t.push({type:"positive",icon:"🎯",title:"Gần đạt mục tiêu",description:`Chỉ còn ${Math.round(100-i)}% nữa để hoàn thành mục tiêu.`}):t.push({type:"warning",icon:"💪",title:"Cần nỗ lực thêm",description:`Cần cải thiện ${Math.round(100-i)}% để đạt mục tiêu tier.`})}return t}calculateDayStatus(t){if(!this.tierTarget)return"YELLOW";const e=this.tierTarget.target_value,a=t/e;return a>=1?"GREEN":a>=.8?"YELLOW":"RED"}calculateVariance(t){const e=t.reduce((s,r)=>s+r,0)/t.length,a=t.reduce((s,r)=>s+Math.pow(r-e,2),0)/t.length;return Math.sqrt(a)}bindEvents(){const t=this.modalElement.querySelector(".kpi-modal-close");t&&t.addEventListener("click",()=>{this.hide(),this.onClose()}),this.modalElement.addEventListener("click",e=>{e.target===this.modalElement&&(this.hide(),this.onClose())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.isVisible&&(this.hide(),this.onClose())})}renderError(t){const e=this.modalElement.querySelector(".kpi-modal-body");e&&(e.innerHTML=`
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <h3>Không thể tải dữ liệu chi tiết</h3>
          <p>${t}</p>
          <button class="retry-button btn-primary" onclick="this.closest('.kpi-modal-overlay').dispatchEvent(new CustomEvent('retry'))">
            Thử lại
          </button>
        </div>
      </div>
    `,this.modalElement.addEventListener("retry",()=>{this.loadDetailedData()}))}getAuthToken(){return localStorage.getItem("auth_token")||sessionStorage.getItem("auth_token")||""}getMetricLabel(){return{connects_per_day:"Kết nối/ngày",follow_ups_per_day:"Follow-up/ngày",first_order_14d:"Đơn đầu 14 ngày",habit_score:"Điểm thói quen",team_size:"Quy mô nhóm",retention_rate:"Tỷ lệ giữ chân",personal_revenue:"Doanh thu cá nhân",team_revenue:"Doanh thu nhóm"}[this.metric]||this.metric}getMetricIcon(){return{connects_per_day:"📞",follow_ups_per_day:"💌",first_order_14d:"🛒",habit_score:"⭐",team_size:"👥",retention_rate:"🔒",personal_revenue:"💰",team_revenue:"🏆"}[this.metric]||"📊"}getStatusText(t){return{RED:"Cần cải thiện",YELLOW:"Gần đạt",GREEN:"Đạt mục tiêu"}[t]||"Chưa xác định"}formatValue(t){return typeof t!="number"?t||"--":this.metric.includes("revenue")?new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0}).format(t):this.metric.includes("rate")?`${Math.round(t)}%`:this.metric==="habit_score"?`${t.toFixed(1)}/6`:Math.round(t).toLocaleString("vi-VN")}static addStyles(){if(document.getElementById("kpi-modal-styles"))return;document.head.insertAdjacentHTML("beforeend",`
      <style id="kpi-modal-styles">
        .kpi-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .kpi-modal-overlay.visible {
          opacity: 1;
        }

        .kpi-modal {
          background: var(--surface-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-luxury);
          max-width: 90vw;
          max-height: 90vh;
          width: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .kpi-modal-overlay.visible .kpi-modal {
          transform: scale(1);
        }

        .kpi-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--border-primary);
        }

        .kpi-modal-title-group {
          flex: 1;
        }

        .kpi-modal-title {
          color: var(--text-accent-bright);
          margin: 0 0 var(--spacing-sm) 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .modal-icon {
          font-size: 1.5rem;
        }

        .kpi-modal-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9rem;
        }

        .kpi-modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .kpi-modal-close:hover {
          background: var(--surface-tertiary);
          color: var(--text-primary);
        }

        .kpi-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-xl);
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          min-height: 200px;
        }

        .section-title {
          color: var(--text-accent);
          margin-bottom: var(--spacing-md);
          font-size: 1.1rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .status-card {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .status-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .status-value {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-accent-bright);
          margin-bottom: var(--spacing-sm);
        }

        .chart-container {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          overflow-x: auto;
        }

        .history-chart {
          width: 100%;
          min-width: 600px;
        }

        .table-container {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-xl);
        }

        .history-table {
          overflow-x: auto;
        }

        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th,
        .history-table td {
          padding: var(--spacing-md);
          text-align: left;
          border-bottom: 1px solid var(--border-secondary);
        }

        .history-table th {
          background: var(--surface-primary);
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .value-cell {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .change-cell.positive {
          color: #00cc66;
        }

        .change-cell.negative {
          color: #ff4444;
        }

        .change-cell.neutral {
          color: var(--text-secondary);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .insight-card {
          background: var(--surface-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          display: flex;
          gap: var(--spacing-md);
        }

        .insight-card.positive {
          border-left: 4px solid #00cc66;
        }

        .insight-card.warning {
          border-left: 4px solid #ffaa00;
        }

        .insight-card.success {
          border-left: 4px solid #00cc66;
        }

        .insight-card.info {
          border-left: 4px solid var(--brand-gold);
        }

        .insight-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .insight-title {
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 0.9rem;
        }

        .insight-description {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .kpi-modal {
            width: 95vw;
            max-height: 95vh;
          }

          .kpi-modal-header,
          .kpi-modal-body {
            padding: var(--spacing-lg);
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .chart-container {
            padding: var(--spacing-md);
          }
        }
      </style>
    `)}}f.addStyles();class k{constructor(){this.currentMemberId=null,this.kpiData=null,this.isLoading=!1,this.modal=null,this.init()}init(){this.setupEventListeners(),this.loadInitialData()}setupEventListeners(){window.addEventListener("hashchange",()=>{const t=this.parseURLParams();t.member_id!==this.currentMemberId&&(this.currentMemberId=t.member_id,this.loadKPIData())}),document.addEventListener("click",t=>{(t.target.matches(".kpi-refresh-btn")||t.target.closest(".kpi-refresh-btn"))&&(t.preventDefault(),this.refreshData())})}parseURLParams(){const t=window.location.hash.slice(1);return{member_id:new URLSearchParams(t.includes("?")?t.split("?")[1]:"").get("member_id")||"current"}}async loadInitialData(){const t=this.parseURLParams();this.currentMemberId=t.member_id,await this.loadKPIData()}async loadKPIData(){this.setLoading(!0);try{const t=await fetch(`https://hive-warfare-os.sadec-marketing-hub.workers.dev/api/kpi/${this.currentMemberId||"current"}`,{headers:{Authorization:`Bearer ${this.getAuthToken()}`,"Content-Type":"application/json"}});if(!t.ok)throw new Error(`KPI API error: ${t.status} ${t.statusText}`);this.kpiData=await t.json(),this.render()}catch(t){console.error("Failed to load KPI data:",t),this.renderError(t.message)}finally{this.setLoading(!1)}}async refreshData(){await this.loadKPIData()}getAuthToken(){return localStorage.getItem("auth_token")||sessionStorage.getItem("auth_token")||""}setLoading(t){this.isLoading=t;const e=document.getElementById("page-content");e&&(t?e.classList.add("loading"):e.classList.remove("loading"))}render(){const t=document.getElementById("page-content");if(!t){console.error("KPIPanel: page-content container not found");return}t.innerHTML=this.generateHTML(),this.bindEvents()}generateHTML(){if(!this.kpiData)return this.generateLoadingHTML();const{member:t,kpis:e,weekly_sparklines:a,tier_targets:s}=this.kpiData;return`
      <div class="page-header">
        <div class="header-main">
          <h1 class="page-title">📊 KPI Tracker</h1>
          <p class="page-subtitle">Theo dõi hiệu suất ${t.full_name} - ${t.tier||"Tân Binh"}</p>
        </div>
        <div class="header-actions">
          <button class="kpi-refresh-btn btn-secondary" aria-label="Làm mới dữ liệu">
            <span class="btn-icon">🔄</span>
            Làm mới
          </button>
          <select class="member-selector" aria-label="Chọn thành viên">
            <option value="current">Hiện tại (${t.full_name})</option>
            <option value="team">Tổng hợp nhóm</option>
          </select>
        </div>
      </div>

      <div class="kpi-dashboard">
        <div class="kpi-grid">
          ${this.generateKPICards(e,a,s)}
        </div>

        <div class="kpi-summary">
          <div class="summary-card">
            <h3 class="summary-title">Tổng quan tuần này</h3>
            <div class="summary-stats">
              ${this.generateSummaryStats(e)}
            </div>
          </div>
        </div>
      </div>

      ${this.generateModalHTML()}
    `}generateKPICards(t,e,a){return!t||!Array.isArray(t)?'<div class="error-state">Không có dữ liệu KPI</div>':t.map(s=>{const r=e[s.metric]||[],i=a[s.metric]||{};return new v({metric:s.metric,current_value:s.current_value,target_value:i.target_value,status:s.status,sparkline:r,trend:s.trend||"stable",period:s.period||"weekly"}).render()}).join("")}generateSummaryStats(t){if(!t)return"";const e=t.reduce((r,i)=>(r[i.status]=(r[i.status]||0)+1,r),{}),a=t.length,s=Math.round((e.GREEN||0)/a*100);return`
      <div class="stat-item">
        <div class="stat-value">${e.GREEN||0}/${a}</div>
        <div class="stat-label">KPI đạt mục tiêu</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${s}%</div>
        <div class="stat-label">Tỷ lệ thành công</div>
      </div>
      <div class="stat-item">
        <div class="stat-value status-${(e.RED||0)>0?"red":"green"}">
          ${(e.RED||0)>0?"⚠️ Cần cải thiện":"✅ Đạt chuẩn"}
        </div>
        <div class="stat-label">Trạng thái chung</div>
      </div>
    `}generateLoadingHTML(){return`
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Đang tải dữ liệu hiệu suất...</p>
      </div>

      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải KPI từ hệ thống...</p>
      </div>
    `}generateModalHTML(){return'<div id="kpi-modal-container"></div>'}renderError(t){const e=document.getElementById("page-content");e&&(e.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Lỗi tải dữ liệu</p>
      </div>

      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <h3>Không thể tải dữ liệu KPI</h3>
          <p>${t}</p>
          <button class="kpi-refresh-btn btn-primary" style="margin-top: 1rem;">
            Thử lại
          </button>
        </div>
      </div>
    `)}bindEvents(){document.addEventListener("click",e=>{const a=e.target.closest(".kpi-card");if(a){const s=a.dataset.metric;this.openKPIModal(s)}});const t=document.querySelector(".member-selector");t&&t.addEventListener("change",e=>{const a=e.target.value;this.updateURL({member_id:a})})}openKPIModal(t){if(!this.kpiData||!t)return;const e=this.kpiData.kpis.find(a=>a.metric===t);e&&(this.modal=new f({metric:t,member:this.kpiData.member,currentKPI:e,tierTarget:this.kpiData.tier_targets[t],onClose:()=>this.closeKPIModal()}),this.modal.show())}closeKPIModal(){this.modal&&(this.modal.hide(),this.modal=null)}updateURL(t){const a={...this.parseURLParams(),...t},s=new URLSearchParams(a).toString(),r=`#/kpi${s?"?"+s:""}`;window.history.pushState(null,"",r),this.currentMemberId=a.member_id,this.loadKPIData()}getCurrentMemberId(){return this.currentMemberId}getKPIData(){return this.kpiData}}export{k as default};
//# sourceMappingURL=kpi-panel-weRl6IvA.js.map
