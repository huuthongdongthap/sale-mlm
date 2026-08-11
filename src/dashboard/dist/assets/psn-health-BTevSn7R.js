import{_ as x}from"./main-D-XKVPla.js";function h(){const e=[{id:1,name:"Tản Địa",name_en:"Dispersive Ground",description:"Lực lượng rải rác, thiếu tập trung. Cần gom nhóm và củng cố.",risk_level:"medium",color:"#FF6B6B",trend:"stable"},{id:2,name:"Khinh Địa",name_en:"Light Ground",description:"Điều kiện thuận lợi, dễ phát triển. Tận dụng tốt thời cơ.",risk_level:"low",color:"#4ECDC4",trend:"up"},{id:3,name:"Tranh Địa",name_en:"Contentious Ground",description:"Khu vực cạnh tranh cao. Kết quả không ổn định, cần chiến lược.",risk_level:"medium",color:"#FFD93D",trend:"volatile"},{id:4,name:"Giao Địa",name_en:"Open Ground",description:"Kết nối tốt, tăng trưởng ổn định. Mở rộng mạng lưới hiệu quả.",risk_level:"low",color:"#6BCF7F",trend:"up"},{id:5,name:"Cù Địa",name_en:"Focal Ground",description:"Trung tâm kết nối, nhiều đối tác. Vị trí chiến lược quan trọng.",risk_level:"low",color:"#4D96FF",trend:"stable"},{id:6,name:"Trọng Địa",name_en:"Heavy Ground",description:"Nền tảng vững chắc, cam kết cao. Đầu tư dài hạn hiệu quả.",risk_level:"low",color:"#9B59B6",trend:"up"},{id:7,name:"Bì Địa",name_en:"Bad Ground",description:"Địa hình khó khăn, cần hỗ trợ. Đội ngũ cần mentoring.",risk_level:"high",color:"#F39C12",trend:"down"},{id:8,name:"Vi Địa",name_en:"Enclosed Ground",description:"Lựa chọn hạn chế, cần hành động khẩn cấp. Buddy system kích hoạt.",risk_level:"critical",color:"#E74C3C",trend:"down"},{id:9,name:"Tử Địa",name_en:"Death Ground",description:"Tình huống nghiêm trọng, quyết đấu. Cần can thiệp leadership ngay.",risk_level:"critical",color:"#8E44AD",trend:"critical"}],t=[],r=12;for(let a=1;a<=r;a++){const n=[.05,.15,.1,.2,.15,.15,.1,.07,.03];let s=Math.random(),i=1;for(let c=0;c<n.length;c++)if(s-=n[c],s<=0){i=c+1;break}const u=e[i-1],o=Math.floor(Math.random()*25)+3,d=Math.random()*.4+.6,l=d*(Math.random()*.2+.8),g=Math.floor(Math.random()*5e7)+5e6,m=g*(Math.random()*.6+.7),b=Math.random()*.3+.7,y=_(i,4);let p="Không có rủi ro đáng kể";if(i>=7){const c=["Retention rate giảm mạnh","Team size thu hẹp","Revenue giảm 3 tuần liên tiếp","Activity ratio < 50%","Không có new recruit 2 tuần","Habit score team trung bình < 3"];p=c[Math.floor(Math.random()*c.length)]}else if(i>=4){const c=["Cần tăng cường training","Follow-up chưa đều","Cần mở rộng warm market"];p=c[Math.floor(Math.random()*c.length)]}t.push({id:`PSN-${String(a).padStart(3,"0")}`,leader_name:`Chỉ Huy ${String.fromCharCode(64+a)}`,current_state:u,team_size:o,retention_30d:Math.round(d*100),retention_90d:Math.round(l*100),revenue_current:g,revenue_previous:Math.floor(m),revenue_delta:Math.round((g-m)/m*100),activity_ratio:Math.round(b*100),trajectory_4weeks:y,top_risk:p,last_updated:new Date(Date.now()-Math.floor(Math.random()*864e5)).toISOString(),buddy_assigned:i>=7?`Mentor ${String.fromCharCode(75+a%10)}`:null,escalation_level:i>=8?"urgent":i>=6?"watch":"normal"})}return{states:e,psns:t,summary:{total_psns:r,healthy_count:t.filter(a=>a.current_state.risk_level==="low").length,at_risk_count:t.filter(a=>a.current_state.risk_level==="medium").length,critical_count:t.filter(a=>a.current_state.risk_level==="high"||a.current_state.risk_level==="critical").length,avg_team_size:Math.round(t.reduce((a,n)=>a+n.team_size,0)/r),total_revenue:t.reduce((a,n)=>a+n.revenue_current,0)},meta:{generated_at:new Date().toISOString(),data_source:"mock",note:"Mock data generated for frontend development. Replace with real API when T-005 is complete."}}}function _(e,t){const r=[];let a=e;for(let n=t;n>=1;n--){if(Math.random()<.3){const s=Math.random()<.6?1:-1;a=Math.max(1,Math.min(9,a+s))}r.unshift({week:n,state_id:a,date:new Date(Date.now()-n*7*24*60*60*1e3).toISOString().split("T")[0]})}return r}function k(e){return new Promise(t=>{setTimeout(()=>{const r=h();t({status:200,data:r})},Math.random()*500+100)})}const f=h(),w=Object.freeze(Object.defineProperty({__proto__:null,handlePSNHealthRequest:k,mockPSNHealthData:f},Symbol.toStringTag,{value:"Module"}));function S(e,t){return`
    <div class="psn-legend">
      <div class="legend-header">
        <h3 class="legend-title">
          <span class="legend-icon">🗺️</span>
          Cửu Địa - Hệ thống phân loại PSN
        </h3>
        <p class="legend-subtitle">
          Áp dụng 9 trạng thái từ Binh Pháp Sun Tzu vào đánh giá sức khỏe mạng lưới
        </p>
      </div>

      <div class="legend-stats">
        <div class="stat-card healthy">
          <div class="stat-number">${t.healthy_count}</div>
          <div class="stat-label">Ổn định</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-number">${t.at_risk_count}</div>
          <div class="stat-label">Cảnh báo</div>
        </div>
        <div class="stat-card critical">
          <div class="stat-number">${t.critical_count}</div>
          <div class="stat-label">Nghiêm trọng</div>
        </div>
      </div>

      <div class="legend-grid">
        ${e.map(a=>$(a)).join("")}
      </div>

      <div class="legend-footer">
        <p class="methodology-note">
          <strong>Phương pháp:</strong> Dựa trên team_size, retention_rate (30d/90d), revenue_delta và activity_ratio
        </p>
      </div>
    </div>
  `}function $(e){const t={low:"risk-low",medium:"risk-medium",high:"risk-high",critical:"risk-critical"},r={low:"✅",medium:"⚠️",high:"🔴",critical:"🚨"};return`
    <div class="legend-item ${t[e.risk_level]}" data-state-id="${e.id}">
      <div class="state-indicator">
        <div class="state-number">${e.id}</div>
        <div class="state-color" style="background-color: ${e.color}"></div>
      </div>
      <div class="state-content">
        <div class="state-header">
          <h4 class="state-name">${e.name}</h4>
          <span class="state-name-en">(${e.name_en})</span>
          <span class="risk-indicator">${r[e.risk_level]}</span>
        </div>
        <p class="state-description">${e.description}</p>
        <div class="state-meta">
          <span class="risk-level ${e.risk_level}">
            ${N(e.risk_level)}
          </span>
        </div>
      </div>
    </div>
  `}function N(e){return{low:"Mức độ thấp",medium:"Cảnh báo",high:"Rủi ro cao",critical:"Nghiêm trọng"}[e]||e}const z=`
  .psn-legend {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }

  .legend-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }

  .legend-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .legend-icon {
    font-size: 1.25em;
  }

  .legend-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  .legend-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--surface-primary);
    border-radius: var(--border-radius-md);
  }

  .stat-card {
    text-align: center;
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
    min-width: 80px;
  }

  .stat-card.healthy {
    background: rgba(75, 181, 67, 0.1);
    border: 1px solid rgba(75, 181, 67, 0.3);
  }

  .stat-card.warning {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .stat-card.critical {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
  }

  .stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
  }

  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .legend-item {
    background: var(--surface-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .legend-item:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .legend-item.risk-critical {
    border-left: 4px solid var(--status-error);
  }

  .legend-item.risk-high {
    border-left: 4px solid var(--status-warning);
  }

  .legend-item.risk-medium {
    border-left: 4px solid var(--status-warning);
  }

  .legend-item.risk-low {
    border-left: 4px solid var(--status-success);
  }

  .state-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .state-number {
    width: 28px;
    height: 28px;
    background: var(--surface-secondary);
    color: var(--text-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .state-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .state-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .state-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .state-name-en {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-style: italic;
  }

  .risk-indicator {
    font-size: 0.9rem;
    margin-left: auto;
  }

  .state-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0 0 var(--spacing-sm) 0;
  }

  .state-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .risk-level {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
  }

  .risk-level.low {
    background: rgba(75, 181, 67, 0.15);
    color: var(--status-success);
  }

  .risk-level.medium {
    background: rgba(255, 193, 7, 0.15);
    color: var(--status-warning);
  }

  .risk-level.high,
  .risk-level.critical {
    background: rgba(220, 53, 69, 0.15);
    color: var(--status-error);
  }

  .legend-footer {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-md);
  }

  .methodology-note {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    text-align: center;
    margin: 0;
    line-height: 1.4;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .legend-grid {
      grid-template-columns: 1fr;
    }

    .legend-stats {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      text-align: left;
    }

    .legend-title {
      font-size: 1.25rem;
    }
  }
`;function M(e,t){e&&e.addEventListener("click",r=>{const a=r.target.closest(".legend-item");if(a&&t){const n=parseInt(a.getAttribute("data-state-id"));a.classList.contains("active")?(e.querySelectorAll(".legend-item").forEach(i=>i.classList.remove("active")),t(null)):(e.querySelectorAll(".legend-item").forEach(i=>i.classList.remove("active")),a.classList.add("active"),t(n))}})}function P(e){const t=C(e.revenue_current),r=e.revenue_delta>=0?"📈":"📉",a=e.revenue_delta>=0?"positive":"negative",n=j(e.escalation_level),s=T(e.trajectory_4weeks,e.current_state);return`
    <div class="psn-card"
         data-psn-id="${e.id}"
         data-state-id="${e.current_state.id}"
         data-risk-level="${e.current_state.risk_level}">

      <div class="psn-card-header">
        <div class="psn-info">
          <h3 class="psn-title">${e.id}</h3>
          <p class="psn-leader">${e.leader_name}</p>
        </div>
        <div class="psn-status">
          ${n}
          <div class="state-indicator" style="background-color: ${e.current_state.color}">
            ${e.current_state.id}
          </div>
        </div>
      </div>

      <div class="psn-current-state">
        <div class="state-info">
          <h4 class="state-name">${e.current_state.name}</h4>
          <p class="state-description">${e.current_state.description}</p>
        </div>
      </div>

      <div class="psn-metrics">
        <div class="metric">
          <div class="metric-label">Team Size</div>
          <div class="metric-value">${e.team_size} thành viên</div>
        </div>

        <div class="metric">
          <div class="metric-label">Retention 30d</div>
          <div class="metric-value">${e.retention_30d}%</div>
        </div>

        <div class="metric">
          <div class="metric-label">Doanh thu tháng</div>
          <div class="metric-value">
            ${t}
            <span class="revenue-delta ${a}">
              ${r} ${e.revenue_delta>=0?"+":""}${e.revenue_delta}%
            </span>
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Activity Ratio</div>
          <div class="metric-value">${e.activity_ratio}%</div>
        </div>
      </div>

      <div class="psn-trajectory">
        <div class="trajectory-header">
          <h5>Xu hướng 4 tuần</h5>
          <span class="trajectory-trend ${e.current_state.trend}">${D(e.current_state.trend)}</span>
        </div>
        <div class="trajectory-chart">
          ${s}
        </div>
      </div>

      <div class="psn-risk">
        <div class="risk-header">
          <span class="risk-icon">⚠️</span>
          <strong>Rủi ro hàng đầu:</strong>
        </div>
        <p class="risk-text">${e.top_risk}</p>
      </div>

      ${e.buddy_assigned?`
        <div class="psn-buddy">
          <span class="buddy-icon">👥</span>
          <span class="buddy-text">Buddy: <strong>${e.buddy_assigned}</strong></span>
        </div>
      `:""}

      <div class="psn-card-footer">
        <div class="last-updated">
          Cập nhật: ${L(e.last_updated)}
        </div>
        <button class="btn-detail" data-psn-id="${e.id}">
          Chi tiết & CTA
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `}function T(e,t){if(!e||e.length===0)return'<div class="trajectory-no-data">Chưa có dữ liệu</div>';const r=9,n=100/(e.length-1),s=e.map((o,d)=>{const l=d*n,g=(r-o.state_id)/r*100;return{x:l,y:g,state_id:o.state_id,week:o.week}}),i=s.map((o,d)=>`${d===0?"M":"L"} ${o.x} ${o.y}`).join(" ");return`
    <div class="trajectory-svg-container">
      <svg viewBox="0 0 100 100" class="trajectory-svg">
        <!-- Grid lines -->
        ${Array.from({length:9},(o,d)=>{const l=d/8*100;return`<line x1="0" y1="${l}" x2="100" y2="${l}" class="grid-line" />`}).join("")}

        <!-- Trajectory line -->
        <path d="${i}" class="trajectory-line" />

        <!-- Data points -->
        ${s.map(o=>`
          <circle cx="${o.x}" cy="${o.y}" r="2" class="trajectory-point"
                  data-week="${o.week}" data-state="${o.state_id}" />
        `).join("")}

        <!-- Current state highlight -->
        <circle cx="${s[s.length-1].x}" cy="${s[s.length-1].y}"
                r="3" class="current-point" />
      </svg>

      <!-- Y-axis labels -->
      <div class="y-axis-labels">
        ${Array.from({length:9},(o,d)=>`
          <span class="y-label" style="top: ${d/8*100}%">${9-d}</span>
        `).join("")}
      </div>
    </div>
  `}function j(e){const t={normal:{icon:"✅",text:"Bình thường",class:"normal"},watch:{icon:"👀",text:"Theo dõi",class:"watch"},urgent:{icon:"🚨",text:"Khẩn cấp",class:"urgent"}},r=t[e]||t.normal;return`
    <div class="escalation-badge ${r.class}">
      <span class="badge-icon">${r.icon}</span>
      <span class="badge-text">${r.text}</span>
    </div>
  `}function D(e){return{up:"⬆️",down:"⬇️",stable:"➡️",volatile:"🌊",critical:"💥"}[e]||"➡️"}function C(e){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0,maximumFractionDigits:0}).format(e)}function L(e){const t=new Date,r=new Date(e),a=t-r,n=Math.floor(a/6e4);if(n<1)return"Vừa xong";if(n<60)return`${n} phút trước`;const s=Math.floor(n/60);return s<24?`${s} giờ trước`:`${Math.floor(s/24)} ngày trước`}const H=`
  .psn-card {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    transition: all 0.2s ease;
    cursor: pointer;
    height: fit-content;
  }

  .psn-card:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .psn-card[data-risk-level="critical"] {
    border-left: 4px solid var(--status-error);
  }

  .psn-card[data-risk-level="high"] {
    border-left: 4px solid var(--status-warning);
  }

  .psn-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .psn-title {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .psn-leader {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: var(--spacing-xs) 0 0 0;
  }

  .psn-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .state-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 1rem;
  }

  .escalation-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .escalation-badge.normal {
    background: rgba(75, 181, 67, 0.15);
    color: var(--status-success);
  }

  .escalation-badge.watch {
    background: rgba(255, 193, 7, 0.15);
    color: var(--status-warning);
  }

  .escalation-badge.urgent {
    background: rgba(220, 53, 69, 0.15);
    color: var(--status-error);
  }

  .psn-current-state {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--surface-primary);
    border-radius: var(--border-radius-sm);
  }

  .state-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }

  .state-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .psn-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .metric {
    background: var(--surface-primary);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-xs);
  }

  .metric-label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .metric-value {
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-top: 2px;
    font-family: var(--font-mono);
  }

  .revenue-delta {
    display: block;
    font-size: 0.75rem;
    margin-top: 2px;
  }

  .revenue-delta.positive {
    color: var(--status-success);
  }

  .revenue-delta.negative {
    color: var(--status-error);
  }

  .psn-trajectory {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--surface-primary);
    border-radius: var(--border-radius-sm);
  }

  .trajectory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .trajectory-header h5 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 600;
  }

  .trajectory-trend {
    font-size: 1rem;
  }

  .trajectory-chart {
    height: 60px;
    position: relative;
  }

  .trajectory-svg-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .trajectory-svg {
    width: 100%;
    height: 100%;
  }

  .grid-line {
    stroke: var(--border-secondary);
    stroke-width: 0.5;
    opacity: 0.5;
  }

  .trajectory-line {
    fill: none;
    stroke: var(--brand-gold);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trajectory-point {
    fill: var(--brand-gold);
    stroke: var(--surface-primary);
    stroke-width: 1;
  }

  .current-point {
    fill: var(--brand-gold-electric);
    stroke: var(--surface-primary);
    stroke-width: 2;
  }

  .y-axis-labels {
    position: absolute;
    left: -20px;
    top: 0;
    height: 100%;
    width: 15px;
  }

  .y-label {
    position: absolute;
    font-size: 0.6rem;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    transform: translateY(-50%);
  }

  .trajectory-no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: var(--text-tertiary);
    font-size: 0.8rem;
    font-style: italic;
  }

  .psn-risk {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: rgba(255, 193, 7, 0.05);
    border-left: 3px solid var(--status-warning);
    border-radius: var(--border-radius-xs);
  }

  .risk-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    font-size: 0.85rem;
    color: var(--status-warning);
  }

  .risk-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .psn-buddy {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: rgba(75, 181, 67, 0.05);
    border-left: 3px solid var(--status-success);
    border-radius: var(--border-radius-xs);
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .psn-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-sm);
  }

  .last-updated {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .btn-detail {
    background: var(--brand-gold);
    color: var(--surface-primary);
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-xs);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .btn-detail:hover {
    background: var(--brand-gold-electric);
    transform: translateX(2px);
  }

  .btn-arrow {
    transition: transform 0.2s ease;
  }

  .btn-detail:hover .btn-arrow {
    transform: translateX(2px);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .psn-card {
      padding: var(--spacing-md);
    }

    .psn-metrics {
      grid-template-columns: 1fr;
    }

    .psn-card-footer {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    .btn-detail {
      justify-content: center;
    }
  }
`;function v(e,t){e&&(e.addEventListener("click",r=>{const a=r.target.closest(".btn-detail"),n=r.target.closest(".psn-card");if(a&&t){r.stopPropagation();const s=a.getAttribute("data-psn-id");t(s)}else if(n&&t){const s=n.getAttribute("data-psn-id");t(s)}}),e.addEventListener("mouseover",r=>{const a=r.target.closest(".trajectory-point");if(a){const n=a.getAttribute("data-week"),s=a.getAttribute("data-state");a.setAttribute("title",`Tuần ${n}: Trạng thái ${s}`)}}))}class A{constructor(){this.data=null,this.filteredPSNs=[],this.activeStateFilter=null,this.sortBy="state_desc",this.container=null,this.init()}async init(){try{this.data=f,this.filteredPSNs=[...this.data.psns],this.applySorting(),console.log("PSN Health data loaded:",this.data.summary)}catch(t){console.error("Failed to load PSN health data:",t),this.handleDataLoadError(t)}}render(t){if(!t){console.error("PSN Health View: Container element required");return}if(this.container=t,!this.data){t.innerHTML=this.renderLoadingState();return}this.injectStyles();const r=`
      <div class="psn-health-view">
        <div class="psn-header">
          <h1 class="page-title">PSN Health Monitor</h1>
          <p class="page-subtitle">
            Giám sát sức khỏe Personal Sales Network theo hệ thống Cửu Địa
          </p>
          <div class="header-meta">
            <span class="data-timestamp">
              Cập nhật: ${this.formatTimestamp(this.data.meta.generated_at)}
            </span>
            ${this.data.meta.data_source==="mock"?'<span class="mock-badge">🚧 Mock Data</span>':""}
          </div>
        </div>

        <!-- 9-State Legend -->
        <div class="legend-section">
          ${S(this.data.states,this.data.summary)}
        </div>

        <!-- Controls -->
        <div class="controls-section">
          <div class="controls-header">
            <h2 class="section-title">Danh sách PSN (${this.filteredPSNs.length})</h2>
            <div class="controls">
              <select class="sort-select" data-sort>
                <option value="state_desc">Trạng thái: Nghiêm trọng trước</option>
                <option value="state_asc">Trạng thái: Ổn định trước</option>
                <option value="revenue_desc">Doanh thu: Cao nhất</option>
                <option value="revenue_asc">Doanh thu: Thấp nhất</option>
                <option value="team_size_desc">Team size: Lớn nhất</option>
                <option value="retention_desc">Retention: Tốt nhất</option>
                <option value="risk_first">Rủi ro cao trước</option>
              </select>
              ${this.activeStateFilter?`<button class="clear-filter-btn">Xóa bộ lọc trạng thái ${this.activeStateFilter}</button>`:""}
            </div>
          </div>
        </div>

        <!-- PSN Cards Grid -->
        <div class="psn-grid-section">
          <div class="psn-grid" id="psn-cards-container">
            ${this.renderPSNCards()}
          </div>
        </div>

        <!-- Summary Footer -->
        <div class="summary-footer">
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="stat-label">Tổng PSN:</span>
              <span class="stat-value">${this.data.summary.total_psns}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Team size TB:</span>
              <span class="stat-value">${this.data.summary.avg_team_size}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Tổng doanh thu:</span>
              <span class="stat-value">${this.formatVND(this.data.summary.total_revenue)}</span>
            </div>
          </div>
          <div class="refresh-section">
            <button class="refresh-btn" id="refresh-data">
              🔄 Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>
    `;t.innerHTML=r,this.attachEventListeners()}renderPSNCards(){return this.filteredPSNs.length===0?`
        <div class="no-psns">
          <div class="no-psns-icon">📊</div>
          <h3>Không tìm thấy PSN</h3>
          <p>Thử thay đổi bộ lọc hoặc làm mới dữ liệu</p>
        </div>
      `:this.filteredPSNs.map(t=>P(t)).join("")}renderLoadingState(){return`
      <div class="psn-loading">
        <div class="loading-spinner"></div>
        <h2>Đang tải dữ liệu PSN Health...</h2>
        <p>Phân tích trạng thái Cửu Địa</p>
      </div>
    `}handleDataLoadError(t){const r=`
      <div class="psn-error">
        <div class="error-icon">⚠️</div>
        <h2>Không thể tải dữ liệu PSN</h2>
        <p>Lỗi: ${t.message}</p>
        <p class="error-note">
          <strong>Ghi chú:</strong> Task T-005 (PSN health score) đang được phát triển.
          Hiện tại sử dụng mock data.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          Thử lại
        </button>
      </div>
    `;this.container&&(this.container.innerHTML=r)}attachEventListeners(){if(!this.container)return;const t=this.container.querySelector(".legend-section");M(t,i=>{this.filterByState(i)});const r=this.container.querySelector("#psn-cards-container");v(r,i=>{this.showPSNDetail(i)});const a=this.container.querySelector(".sort-select");a&&(a.value=this.sortBy,a.addEventListener("change",i=>{this.sortBy=i.target.value,this.applySorting(),this.updatePSNGrid()}));const n=this.container.querySelector(".clear-filter-btn");n&&n.addEventListener("click",()=>{this.filterByState(null)});const s=this.container.querySelector("#refresh-data");s&&s.addEventListener("click",async()=>{await this.refreshData()})}filterByState(t){this.activeStateFilter=t,t===null?this.filteredPSNs=[...this.data.psns]:this.filteredPSNs=this.data.psns.filter(r=>r.current_state.id===t),this.applySorting(),this.updateView()}applySorting(){this.filteredPSNs.length&&this.filteredPSNs.sort((t,r)=>{switch(this.sortBy){case"state_desc":return r.current_state.id-t.current_state.id;case"state_asc":return t.current_state.id-r.current_state.id;case"revenue_desc":return r.revenue_current-t.revenue_current;case"revenue_asc":return t.revenue_current-r.revenue_current;case"team_size_desc":return r.team_size-t.team_size;case"retention_desc":return r.retention_30d-t.retention_30d;case"risk_first":const a={critical:4,high:3,medium:2,low:1};return(a[r.current_state.risk_level]||0)-(a[t.current_state.risk_level]||0);default:return 0}})}updateView(){this.container&&this.render(this.container)}updatePSNGrid(){var r;const t=(r=this.container)==null?void 0:r.querySelector("#psn-cards-container");t&&(t.innerHTML=this.renderPSNCards(),v(t,a=>{this.showPSNDetail(a)}))}async refreshData(){var r;const t=(r=this.container)==null?void 0:r.querySelector("#refresh-data");t&&(t.disabled=!0,t.textContent="🔄 Đang làm mới...");try{await new Promise(n=>setTimeout(n,1e3));const{mockPSNHealthData:a}=await x(async()=>{const{mockPSNHealthData:n}=await Promise.resolve().then(()=>w);return{mockPSNHealthData:n}},void 0);this.data=a,this.filteredPSNs=[...this.data.psns],this.activeStateFilter=null,this.applySorting(),this.updateView(),console.log("PSN Health data refreshed")}catch(a){console.error("Failed to refresh PSN data:",a),alert("Không thể làm mới dữ liệu. Vui lòng thử lại sau.")}finally{t&&(t.disabled=!1,t.textContent="🔄 Làm mới dữ liệu")}}showPSNDetail(t){const r=this.data.psns.find(n=>n.id===t);if(!r){console.error("PSN not found:",t);return}const a=`
PSN: ${r.id} - ${r.leader_name}
Trạng thái: ${r.current_state.name} (${r.current_state.id})
Team: ${r.team_size} thành viên
Retention 30d: ${r.retention_30d}%
Doanh thu: ${this.formatVND(r.revenue_current)}
Rủi ro: ${r.top_risk}
${r.buddy_assigned?`Buddy: ${r.buddy_assigned}`:"Chưa có buddy"}

[Trang chi tiết PSN với CTA buddy assignment sẽ được implement ở task khác]
    `.trim();alert(a)}injectStyles(){const t="psn-health-styles";if(document.getElementById(t))return;const r=document.createElement("style");r.id=t,r.textContent=`
      ${z}
      ${H}
      ${B}
    `,document.head.appendChild(r)}formatVND(t){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",minimumFractionDigits:0,maximumFractionDigits:0}).format(t)}formatTimestamp(t){return new Intl.DateTimeFormat("vi-VN",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(t))}}const B=`
  .psn-health-view {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .psn-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 2.25rem;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-md) 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .header-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }

  .mock-badge {
    background: var(--status-warning);
    color: var(--surface-primary);
    padding: 2px 6px;
    border-radius: var(--border-radius-xs);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .legend-section {
    margin-bottom: var(--spacing-xl);
  }

  .controls-section {
    margin-bottom: var(--spacing-lg);
  }

  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--border-secondary);
  }

  .section-title {
    font-size: 1.25rem;
    color: var(--text-primary);
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .sort-select {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--text-primary);
    font-size: 0.85rem;
    cursor: pointer;
  }

  .sort-select:focus {
    outline: 2px solid var(--brand-gold);
    outline-offset: 2px;
  }

  .clear-filter-btn {
    background: var(--surface-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filter-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .psn-grid-section {
    margin-bottom: var(--spacing-xl);
  }

  .psn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--spacing-lg);
  }

  .no-psns {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
  }

  .no-psns-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
  }

  .no-psns h3 {
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .no-psns p {
    color: var(--text-tertiary);
    margin: 0;
  }

  .summary-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-secondary);
  }

  .summary-stats {
    display: flex;
    gap: var(--spacing-lg);
  }

  .summary-stat {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-weight: 600;
  }

  .stat-value {
    font-size: 1.1rem;
    color: var(--text-primary);
    font-weight: 700;
    font-family: var(--font-mono);
  }

  .refresh-btn {
    background: var(--brand-gold);
    color: var(--surface-primary);
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover {
    background: var(--brand-gold-electric);
  }

  .refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .psn-loading {
    text-align: center;
    padding: var(--spacing-xl) 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-secondary);
    border-top-color: var(--brand-gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-lg) auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .psn-loading h2 {
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .psn-loading p {
    color: var(--text-secondary);
    margin: 0;
  }

  .psn-error {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--surface-secondary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--status-error);
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
  }

  .psn-error h2 {
    color: var(--status-error);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .psn-error p {
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .error-note {
    font-size: 0.85rem !important;
    color: var(--text-tertiary) !important;
    font-style: italic;
  }

  .retry-btn {
    background: var(--status-error);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    margin-top: var(--spacing-md);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .psn-health-view {
      padding: var(--spacing-md);
    }

    .page-title {
      font-size: 1.75rem;
    }

    .controls-header {
      flex-direction: column;
      align-items: stretch;
    }

    .controls {
      justify-content: center;
    }

    .psn-grid {
      grid-template-columns: 1fr;
    }

    .summary-footer {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }

    .summary-stats {
      justify-content: space-around;
      width: 100%;
    }

    .header-meta {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
`;export{A as default};
//# sourceMappingURL=psn-health-BTevSn7R.js.map
