class u{constructor(){this.alerts=this.generateMockAlerts()}generateMockAlerts(){return[{id:"alert-001",severity:"critical",rule:"Habit Score Drop",title:"Nguyễn Văn An - Habit score dưới 3 điểm",evidence:"Habit score: 2.1/6 trong 3 ngày liên tiếp (22-24/04)",suggested_action:"Kích hoạt buddy system - ghép với mentor Trần Thị Mai",member_id:"mem-001",member_name:"Nguyễn Văn An",created_at:"2026-04-24T14:30:00Z",acknowledged:!1,acknowledged_by:null,acknowledged_at:null},{id:"alert-002",severity:"warn",title:"Phạm Thị Hoa - Connects/day giảm mạnh",rule:"Low Daily Connects",evidence:"Connects: 8/day (target 15/day) trong 5 ngày gần nhất",suggested_action:'Flash campaign "Chiến dịch 48h" - boost motivation',member_id:"mem-002",member_name:"Phạm Thị Hoa",created_at:"2026-04-24T10:15:00Z",acknowledged:!1,acknowledged_by:null,acknowledged_at:null},{id:"alert-003",severity:"critical",title:"PSN Dragon Team - Team retention < 60%",rule:"PSN Retention Drop",evidence:"Retention 30d: 45% (target ≥70%) - 3/5 members inactive",suggested_action:"Cuộc họp khẩn PSN Leader + escalate lên Core Leader",member_id:"psn-001",member_name:"Dragon Team (Leader: Võ Minh Tuấn)",created_at:"2026-04-24T08:45:00Z",acknowledged:!0,acknowledged_by:"admin-001",acknowledged_at:"2026-04-24T15:30:00Z"},{id:"alert-004",severity:"info",title:"Lê Quang Huy - Sắp hoàn thành Tier 1",rule:"Graduation Readiness",evidence:"Module 4/4 hoàn thành 80%, habit score 5.2/6 ổn định",suggested_action:"Chuẩn bị ceremony tốt nghiệp + assign Tier 2",member_id:"mem-003",member_name:"Lê Quang Huy",created_at:"2026-04-24T07:20:00Z",acknowledged:!1,acknowledged_by:null,acknowledged_at:null},{id:"alert-005",severity:"warn",title:"System Alert - Vite build performance",rule:"System Performance",evidence:"Build time: 3.2s (baseline 1.8s) - bundle size tăng 15%",suggested_action:"Code review dependency mới + optimize chunks",member_id:null,member_name:"System",created_at:"2026-04-23T23:45:00Z",acknowledged:!1,acknowledged_by:null,acknowledged_at:null}]}async getAlerts(e={}){await new Promise(a=>setTimeout(a,300+Math.random()*200));let t=[...this.alerts];e.severity&&(t=t.filter(a=>a.severity===e.severity)),e.acknowledged!==void 0&&(t=t.filter(a=>a.acknowledged===e.acknowledged)),t.sort((a,n)=>new Date(n.created_at)-new Date(a.created_at));const r={critical:t.filter(a=>a.severity==="critical"),warn:t.filter(a=>a.severity==="warn"),info:t.filter(a=>a.severity==="info")};return{success:!0,data:{alerts:t,grouped:r,total:t.length,unacknowledged:t.filter(a=>!a.acknowledged).length}}}async acknowledgeAlert(e,t="current-user"){await new Promise(n=>setTimeout(n,150+Math.random()*100));const r=this.alerts.find(n=>n.id===e);if(!r)return{success:!1,error:"Alert not found"};if(r.acknowledged)return{success:!1,error:"Alert already acknowledged"};r.acknowledged=!0,r.acknowledged_by=t,r.acknowledged_at=new Date().toISOString();const a={id:`audit-${Date.now()}`,action:"alert_acknowledged",resource_type:"alert",resource_id:e,actor:t,timestamp:r.acknowledged_at,metadata:{alert_severity:r.severity,alert_rule:r.rule,member_affected:r.member_id}};return console.log("Mock audit trail entry:",a),{success:!0,data:{alert:r,audit_entry:a}}}async bulkAcknowledge(e,t="current-user"){const r=[];for(const o of e){const i=await this.acknowledgeAlert(o,t);r.push({alertId:o,...i})}const a=r.filter(o=>o.success),n=r.filter(o=>!o.success);return{success:n.length===0,data:{acknowledged:a.length,failed:n.length,results:r}}}async evaluateRules(){await new Promise(t=>setTimeout(t,500));const e=[{id:`alert-${Date.now()}`,severity:"warn",rule:"First Order Delay",title:"Trần Văn Nam - Chưa có order đầu tiên",evidence:"Ngày 14 kể từ join date, chưa có order nào (target ≤14 days)",suggested_action:"Tăng cường support 1:1 + review product training",member_id:"mem-new",member_name:"Trần Văn Nam",created_at:new Date().toISOString(),acknowledged:!1,acknowledged_by:null,acknowledged_at:null}];return this.alerts.push(...e),{success:!0,data:{new_alerts:e.length,total_alerts:this.alerts.length}}}}const s=new u;class g{constructor(e,t,r){this.severity=e,this.alerts=t,this.onAcknowledge=r}getSeverityConfig(){const e={critical:{label:"Nghiêm trọng",icon:"🚨",color:"#FF4444",bgColor:"rgba(255, 68, 68, 0.1)",borderColor:"rgba(255, 68, 68, 0.3)"},warn:{label:"Cảnh báo",icon:"⚠️",color:"#FFB300",bgColor:"rgba(255, 179, 0, 0.1)",borderColor:"rgba(255, 179, 0, 0.3)"},info:{label:"Thông tin",icon:"ℹ️",color:"#00BCD4",bgColor:"rgba(0, 188, 212, 0.1)",borderColor:"rgba(0, 188, 212, 0.3)"}};return e[this.severity]||e.info}render(){if(this.alerts.length===0)return"";const e=this.getSeverityConfig(),t=this.alerts.filter(r=>!r.acknowledged).length;return`
      <div class="severity-group" data-severity="${this.severity}">
        <div class="severity-header" style="
          border-left: 4px solid ${e.color};
          background: ${e.bgColor};
          border: 1px solid ${e.borderColor};
        ">
          <div class="severity-info">
            <span class="severity-icon">${e.icon}</span>
            <h3 class="severity-title">${e.label}</h3>
            <span class="severity-badge" style="
              background: ${e.color};
              color: var(--surface-primary);
            ">
              ${this.alerts.length}
            </span>
            ${t>0?`
              <span class="unack-badge" style="
                background: var(--brand-gold);
                color: var(--surface-primary);
              ">
                ${t} chưa xử lý
              </span>
            `:""}
          </div>

          <div class="severity-actions">
            ${t>0?`
              <button class="bulk-ack-btn"
                      data-severity="${this.severity}"
                      style="
                        background: var(--brand-gold);
                        color: var(--surface-primary);
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        transition: all 0.2s ease;
                      "
                      onmouseover="this.style.background='var(--brand-gold-electric)'"
                      onmouseout="this.style.background='var(--brand-gold)'">
                Xử lý tất cả (${t})
              </button>
            `:""}

            <button class="toggle-group-btn"
                    data-severity="${this.severity}"
                    style="
                      background: transparent;
                      color: var(--text-secondary);
                      border: 1px solid var(--border-color);
                      padding: 0.5rem;
                      border-radius: 4px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    "
                    onmouseover="this.style.borderColor='${e.color}'; this.style.color='${e.color}'"
                    onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)'">
              <span class="toggle-icon">▼</span>
            </button>
          </div>
        </div>

        <div class="alerts-list" data-group="${this.severity}">
          ${this.alerts.map(r=>this.renderAlert(r,e)).join("")}
        </div>
      </div>
    `}renderAlert(e,t){const r=e.acknowledged,a=this.formatTimeAgo(e.created_at);return`
      <div class="alert-card ${r?"acknowledged":""}"
           data-alert-id="${e.id}"
           style="
             border-left: 3px solid ${t.color};
             background: var(--surface-secondary);
             margin: 0.75rem 0;
             padding: 1rem;
             border-radius: 0 6px 6px 0;
             transition: all 0.2s ease;
             opacity: ${r?"0.7":"1"};
           ">

        <div class="alert-header">
          <div class="alert-meta">
            <span class="alert-rule" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
            ">
              ${e.rule}
            </span>
            <span class="alert-time" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
            ">
              ${a}
            </span>
          </div>

          ${r?`
            <div class="ack-status" style="
              font-size: 0.75rem;
              color: var(--text-tertiary);
              display: flex;
              align-items: center;
              gap: 0.25rem;
            ">
              ✅ Đã xử lý
              <span style="color: var(--text-quaternary);">
                ${this.formatTimeAgo(e.acknowledged_at)}
              </span>
            </div>
          `:`
            <button class="ack-btn"
                    data-alert-id="${e.id}"
                    style="
                      background: var(--brand-gold);
                      color: var(--surface-primary);
                      border: none;
                      padding: 0.375rem 0.75rem;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 0.75rem;
                      font-weight: 500;
                      transition: all 0.2s ease;
                    "
                    onmouseover="this.style.background='var(--brand-gold-electric)'"
                    onmouseout="this.style.background='var(--brand-gold)'">
              ✓ Xử lý
            </button>
          `}
        </div>

        <h4 class="alert-title" style="
          font-family: var(--font-display);
          font-size: 1.1rem;
          margin: 0.5rem 0;
          color: var(--text-primary);
          line-height: 1.3;
        ">
          ${e.title}
        </h4>

        <div class="alert-evidence" style="
          background: var(--surface-primary);
          padding: 0.75rem;
          border-radius: 4px;
          margin: 0.75rem 0;
          border: 1px solid var(--border-color);
        ">
          <div class="evidence-label" style="
            font-size: 0.75rem;
            color: var(--text-tertiary);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          ">
            Bằng chứng
          </div>
          <div class="evidence-text" style="
            font-family: var(--font-mono);
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.4;
          ">
            ${e.evidence}
          </div>
        </div>

        <div class="suggested-action" style="
          background: rgba(201, 162, 0, 0.1);
          border: 1px solid rgba(201, 162, 0, 0.3);
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 0.75rem;
        ">
          <div class="action-label" style="
            font-size: 0.75rem;
            color: var(--brand-gold);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          ">
            💡 Hành động đề xuất
          </div>
          <div class="action-text" style="
            font-size: 0.875rem;
            color: var(--text-primary);
            line-height: 1.4;
            font-weight: 500;
          ">
            ${e.suggested_action}
          </div>
        </div>

        ${e.member_name&&e.member_name!=="System"?`
          <div class="alert-member" style="
            margin-top: 0.75rem;
            font-size: 0.75rem;
            color: var(--text-tertiary);
          ">
            👤 Liên quan: <span style="color: var(--text-secondary); font-weight: 500;">${e.member_name}</span>
          </div>
        `:""}
      </div>
    `}formatTimeAgo(e){const t=new Date,r=new Date(e),a=t-r,n=Math.floor(a/(1e3*60)),o=Math.floor(a/(1e3*60*60)),i=Math.floor(a/(1e3*60*60*24));return n<1?"Vừa xong":n<60?`${n} phút trước`:o<24?`${o} giờ trước`:i<7?`${i} ngày trước`:r.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}setupEventListeners(){document.querySelectorAll(".ack-btn").forEach(e=>{e.addEventListener("click",t=>{const r=t.target.dataset.alertId;r&&this.onAcknowledge&&this.onAcknowledge([r])})}),document.querySelectorAll(".bulk-ack-btn").forEach(e=>{e.addEventListener("click",t=>{const r=t.target.dataset.severity,a=this.alerts.filter(n=>n.severity===r&&!n.acknowledged).map(n=>n.id);a.length>0&&this.onAcknowledge&&this.onAcknowledge(a)})}),document.querySelectorAll(".toggle-group-btn").forEach(e=>{e.addEventListener("click",t=>{const r=t.target.dataset.severity,a=document.querySelector(`[data-group="${r}"]`),n=t.target.querySelector(".toggle-icon");if(a){const o=a.style.display==="none";a.style.display=o?"block":"none",n.textContent=o?"▼":"▶"}})})}}class l{constructor(e,t){this.alert=e,this.onAcknowledge=t}getSeverityStyle(){const e={critical:{borderColor:"#FF4444",iconBg:"rgba(255, 68, 68, 0.1)",icon:"🚨"},warn:{borderColor:"#FFB300",iconBg:"rgba(255, 179, 0, 0.1)",icon:"⚠️"},info:{borderColor:"#00BCD4",iconBg:"rgba(0, 188, 212, 0.1)",icon:"ℹ️"}};return e[this.alert.severity]||e.info}formatTimeAgo(e){const t=new Date,r=new Date(e),a=t-r,n=Math.floor(a/(1e3*60)),o=Math.floor(a/(1e3*60*60)),i=Math.floor(a/(1e3*60*60*24));return n<1?"Vừa xong":n<60?`${n} phút trước`:o<24?`${o} giờ trước`:i<7?`${i} ngày trước`:r.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}render(){const e=this.getSeverityStyle(),t=this.alert.acknowledged;return`
      <div class="alert-card ${t?"acknowledged":""}"
           data-alert-id="${this.alert.id}"
           data-severity="${this.alert.severity}"
           style="
             background: var(--surface-secondary);
             border: 1px solid var(--border-color);
             border-left: 4px solid ${e.borderColor};
             border-radius: 0 8px 8px 0;
             padding: 1.25rem;
             margin: 1rem 0;
             transition: all 0.3s ease;
             opacity: ${t?"0.7":"1"};
             position: relative;
           "
           onmouseover="this.style.transform='translateX(4px)'; this.style.borderLeftWidth='6px'"
           onmouseout="this.style.transform='translateX(0)'; this.style.borderLeftWidth='4px'">

        <!-- Alert Header -->
        <div class="alert-header" style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        ">
          <div class="alert-meta" style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="severity-icon" style="
                background: ${e.iconBg};
                padding: 0.25rem;
                border-radius: 4px;
                font-size: 0.875rem;
              ">
                ${e.icon}
              </span>
              <span class="alert-rule" style="
                font-family: var(--font-mono);
                font-size: 0.75rem;
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
              ">
                ${this.alert.rule}
              </span>
            </div>
            <span class="alert-timestamp" style="
              font-size: 0.75rem;
              color: var(--text-quaternary);
              font-family: var(--font-mono);
            ">
              ${this.formatTimeAgo(this.alert.created_at)}
            </span>
          </div>

          <div class="alert-actions">
            ${t?`
              <div class="acknowledged-status" style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: var(--text-tertiary);
              ">
                <span style="color: #4CAF50;">✅</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                  <span>Đã xử lý</span>
                  <span style="color: var(--text-quaternary);">
                    ${this.formatTimeAgo(this.alert.acknowledged_at)}
                  </span>
                </div>
              </div>
            `:`
              <button class="acknowledge-btn"
                      data-alert-id="${this.alert.id}"
                      style="
                        background: var(--brand-gold);
                        color: var(--surface-primary);
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 600;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(201, 162, 0, 0.2);
                      "
                      onmouseover="this.style.background='var(--brand-gold-electric)'; this.style.transform='translateY(-1px)'"
                      onmouseout="this.style.background='var(--brand-gold)'; this.style.transform='translateY(0)'">
                ✓ Xử lý ngay
              </button>
            `}
          </div>
        </div>

        <!-- Alert Title -->
        <h4 class="alert-title" style="
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        ">
          ${this.alert.title}
        </h4>

        <!-- Evidence Section -->
        <div class="alert-evidence" style="
          background: var(--surface-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        ">
          <div class="evidence-header" style="
            font-size: 0.75rem;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          ">
            📊 Bằng chứng
          </div>
          <div class="evidence-content" style="
            font-family: var(--font-mono);
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.5;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.75rem;
            border-radius: 4px;
            border-left: 3px solid ${e.borderColor};
          ">
            ${this.alert.evidence}
          </div>
        </div>

        <!-- Suggested Action Section -->
        <div class="suggested-action" style="
          background: linear-gradient(135deg, rgba(201, 162, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 1px solid rgba(201, 162, 0, 0.3);
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        ">
          <div class="action-header" style="
            font-size: 0.75rem;
            color: var(--brand-gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          ">
            💡 Hành động đề xuất
          </div>
          <div class="action-content" style="
            font-size: 0.9rem;
            color: var(--text-primary);
            line-height: 1.5;
            font-weight: 500;
          ">
            ${this.alert.suggested_action}
          </div>
        </div>

        <!-- Member Info (if applicable) -->
        ${this.alert.member_name&&this.alert.member_name!=="System"?`
          <div class="alert-member-info" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          ">
            <div style="
              background: rgba(0, 188, 212, 0.1);
              padding: 0.375rem;
              border-radius: 4px;
              font-size: 0.875rem;
            ">
              👤
            </div>
            <div style="
              display: flex;
              flex-direction: column;
              gap: 0.125rem;
            ">
              <span style="
                font-size: 0.75rem;
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
              ">
                Thành viên liên quan
              </span>
              <span style="
                font-size: 0.875rem;
                color: var(--text-primary);
                font-weight: 500;
              ">
                ${this.alert.member_name}
              </span>
            </div>
          </div>
        `:""}

        <!-- Audit Trail (if acknowledged) -->
        ${t?`
          <div class="audit-trail" style="
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.75rem;
            color: var(--text-quaternary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <span>🔍</span>
            <span>
              Audit: Đã xử lý bởi ${this.alert.acknowledged_by||"system"}
              lúc ${this.formatTimeAgo(this.alert.acknowledged_at)}
            </span>
          </div>
        `:""}
      </div>
    `}setupEventListeners(){const e=document.querySelector(`[data-alert-id="${this.alert.id}"]`);if(!e)return;const t=e.querySelector(".acknowledge-btn");t&&this.onAcknowledge&&t.addEventListener("click",r=>{r.preventDefault();const a=r.target.dataset.alertId;a&&(r.target.disabled=!0,r.target.textContent="Đang xử lý...",this.onAcknowledge([a]).finally(()=>{r.target&&(r.target.disabled=!1,r.target.textContent="✓ Xử lý ngay")}))})}static renderBatch(e,t){return e.map(r=>new l(r,t).render()).join("")}}class p{constructor(){this.alerts=[],this.groupedAlerts={},this.filters={severity:null,acknowledged:null},this.loading=!1,this.container=null,this.init()}async init(){await this.loadAlerts(),this.render(),this.setupEventListeners(),setInterval(()=>{this.loading||this.loadAlerts(!0)},3e4)}async loadAlerts(e=!1){e||(this.loading=!0,this.updateLoadingState());try{const t=await s.getAlerts(this.filters);t.success?(this.alerts=t.data.alerts,this.groupedAlerts=t.data.grouped,e?this.updateCounters():(this.render(),this.showNotification("success",`Đã tải ${this.alerts.length} cảnh báo`))):this.showNotification("error","Không thể tải dữ liệu cảnh báo")}catch(t){console.error("Error loading alerts:",t),this.showNotification("error","Lỗi kết nối - thử lại sau")}finally{this.loading=!1,e||this.updateLoadingState()}}async acknowledgeAlerts(e){if(!(!e||e.length===0)){this.showNotification("info",`Đang xử lý ${e.length} cảnh báo...`);try{let t;if(e.length===1?t=await s.acknowledgeAlert(e[0],"current-user"):t=await s.bulkAcknowledge(e,"current-user"),t.success){await this.loadAlerts();const r=e.length===1?1:t.data.acknowledged;this.showNotification("success",`✅ Đã xử lý ${r} cảnh báo`),console.log("Alert acknowledgment audit:",{action:"alerts_acknowledged",count:r,alert_ids:e,timestamp:new Date().toISOString()})}else this.showNotification("error",t.error||"Không thể xử lý cảnh báo")}catch(t){console.error("Error acknowledging alerts:",t),this.showNotification("error","Lỗi xử lý cảnh báo")}}}render(){if(this.container=document.getElementById("page-content"),!this.container)return;const e=this.alerts.filter(r=>!r.acknowledged).length,t=this.alerts.length;this.container.innerHTML=`
      <div class="alerts-inbox">
        <!-- Page Header -->
        <div class="page-header" style="
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h1 class="page-title" style="
                font-family: var(--font-display);
                font-size: 2rem;
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
              ">
                🚨 Trung tâm cảnh báo
              </h1>
              <p class="page-subtitle" style="
                color: var(--text-secondary);
                margin: 0;
                font-size: 1.1rem;
              ">
                Hệ thống cảnh báo tự động cho retention và campaign triggers
              </p>
            </div>

            <div class="alerts-summary" style="
              display: flex;
              gap: 1rem;
              align-items: center;
            ">
              <div class="summary-card" style="
                background: var(--surface-secondary);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                text-align: center;
                min-width: 120px;
              ">
                <div style="
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: ${e>0?"var(--brand-gold)":"var(--text-secondary)"};
                  margin-bottom: 0.25rem;
                ">
                  ${e}
                </div>
                <div style="
                  font-size: 0.75rem;
                  color: var(--text-tertiary);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Chưa xử lý
                </div>
              </div>

              <div class="summary-card" style="
                background: var(--surface-secondary);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                text-align: center;
                min-width: 120px;
              ">
                <div style="
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: var(--text-secondary);
                  margin-bottom: 0.25rem;
                ">
                  ${t}
                </div>
                <div style="
                  font-size: 0.75rem;
                  color: var(--text-tertiary);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Tổng số
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="inbox-controls" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        ">
          <div class="filter-controls" style="
            display: flex;
            gap: 0.75rem;
            align-items: center;
            flex-wrap: wrap;
          ">
            <label style="
              font-size: 0.875rem;
              color: var(--text-secondary);
              font-weight: 500;
            ">
              Lọc theo:
            </label>

            <select id="severity-filter" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              font-size: 0.875rem;
            ">
              <option value="">Tất cả mức độ</option>
              <option value="critical">🚨 Nghiêm trọng</option>
              <option value="warn">⚠️ Cảnh báo</option>
              <option value="info">ℹ️ Thông tin</option>
            </select>

            <select id="status-filter" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              font-size: 0.875rem;
            ">
              <option value="">Tất cả trạng thái</option>
              <option value="false">Chưa xử lý</option>
              <option value="true">Đã xử lý</option>
            </select>
          </div>

          <div class="action-controls" style="
            display: flex;
            gap: 0.75rem;
            align-items: center;
          ">
            <button id="refresh-btn" style="
              background: var(--surface-secondary);
              border: 1px solid var(--border-color);
              color: var(--text-secondary);
              padding: 0.5rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.875rem;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.borderColor='var(--brand-gold)'"
            onmouseout="this.style.borderColor='var(--border-color)'">
              🔄 Làm mới
            </button>

            ${e>0?`
              <button id="ack-all-btn" style="
                background: var(--brand-gold);
                color: var(--surface-primary);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background='var(--brand-gold-electric)'"
              onmouseout="this.style.background='var(--brand-gold)'">
                ✓ Xử lý tất cả (${e})
              </button>
            `:""}
          </div>
        </div>

        <!-- Loading State -->
        <div id="loading-indicator" class="loading-indicator" style="
          display: none;
          text-align: center;
          padding: 2rem;
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
            margin-bottom: 1rem;
          "></div>
          <div>Đang tải cảnh báo...</div>
        </div>

        <!-- Alerts Content -->
        <div id="alerts-content" class="alerts-content">
          ${this.renderAlertsContent()}
        </div>

        <!-- Notification Area -->
        <div id="notifications" class="notifications" style="
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
        "></div>
      </div>

      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .notification {
          background: var(--surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: translateX(100%);
          animation: slideIn 0.3s ease-out forwards;
        }

        .notification.success {
          border-left: 4px solid #4CAF50;
        }

        .notification.error {
          border-left: 4px solid #FF4444;
        }

        .notification.info {
          border-left: 4px solid var(--brand-gold);
        }

        @keyframes slideIn {
          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .inbox-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls,
          .action-controls {
            justify-content: center;
          }

          .alerts-summary {
            justify-content: center !important;
          }
        }
      </style>
    `,this.setupEventListeners()}renderAlertsContent(){return this.alerts.length===0?`
        <div class="empty-state" style="
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📥</div>
          <h3 style="font-family: var(--font-display); margin: 0 0 0.5rem 0;">
            Không có cảnh báo nào
          </h3>
          <p>Hệ thống đang hoạt động bình thường. Tất cả chỉ số trong tầm kiểm soát.</p>
        </div>
      `:`
      <div class="severity-groups">
        ${["critical","warn","info"].filter(e=>{var t;return((t=this.groupedAlerts[e])==null?void 0:t.length)>0}).map(e=>new g(e,this.groupedAlerts[e],r=>this.acknowledgeAlerts(r)).render()).join("")}
      </div>
    `}setupEventListeners(){var n;const e=document.getElementById("severity-filter"),t=document.getElementById("status-filter");e&&(e.value=this.filters.severity||"",e.addEventListener("change",o=>{this.filters.severity=o.target.value||null,this.loadAlerts()})),t&&(t.value=((n=this.filters.acknowledged)==null?void 0:n.toString())||"",t.addEventListener("change",o=>{const i=o.target.value;this.filters.acknowledged=i===""?null:i==="true",this.loadAlerts()}));const r=document.getElementById("refresh-btn");r&&r.addEventListener("click",()=>{this.loadAlerts()});const a=document.getElementById("ack-all-btn");a&&a.addEventListener("click",()=>{const o=this.alerts.filter(i=>!i.acknowledged).map(i=>i.id);o.length>0&&this.acknowledgeAlerts(o)}),setTimeout(()=>{["critical","warn","info"].forEach(o=>{var i;((i=this.groupedAlerts[o])==null?void 0:i.length)>0&&new g(o,this.groupedAlerts[o],m=>this.acknowledgeAlerts(m)).setupEventListeners()}),this.alerts.forEach(o=>{new l(o,c=>this.acknowledgeAlerts(c)).setupEventListeners()})},100)}updateLoadingState(){const e=document.getElementById("loading-indicator"),t=document.getElementById("alerts-content");this.loading?(e&&(e.style.display="block"),t&&(t.style.opacity="0.5")):(e&&(e.style.display="none"),t&&(t.style.opacity="1"))}updateCounters(){const e=this.alerts.filter(r=>!r.acknowledged).length,t=document.querySelectorAll(".summary-card div:first-child");t[0]&&(t[0].textContent=e,t[0].style.color=e>0?"var(--brand-gold)":"var(--text-secondary)"),t[1]&&(t[1].textContent=this.alerts.length)}showNotification(e,t){const r=document.getElementById("notifications");if(!r)return;const a=document.createElement("div");a.className=`notification ${e}`,a.innerHTML=`
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      ">
        <div>
          <div style="font-weight: 500; margin-bottom: 0.25rem;">
            ${e==="success"?"✅":e==="error"?"❌":"ℹ️"}
          </div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            ${t}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0;
          font-size: 1.2rem;
        ">×</button>
      </div>
    `,r.appendChild(a),setTimeout(()=>{a.parentElement&&(a.style.opacity="0",a.style.transform="translateX(100%)",setTimeout(()=>a.remove(),300))},5e3)}}export{p as AlertsInbox,p as default};
//# sourceMappingURL=alerts-inbox-6A4NjEEo.js.map
