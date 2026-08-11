(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const f="modulepreload",y=function(c){return"/"+c},g={},l=function(e,t,r){let n=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));n=Promise.allSettled(t.map(s=>{if(s=y(s),s in g)return;g[s]=!0;const u=s.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${p}`))return;const d=document.createElement("link");if(d.rel=u?"stylesheet":f,u||(d.as="script"),d.crossOrigin="",d.href=s,o&&d.setAttribute("nonce",o),document.head.appendChild(d),u)return new Promise((m,v)=>{d.addEventListener("load",m),d.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${s}`)))})}))}function i(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return n.then(a=>{for(const o of a||[])o.status==="rejected"&&i(o.reason);return e().catch(i)})};function h(c){const e=document.createElement("div");return e.appendChild(document.createTextNode(c)),e.innerHTML}class b{constructor(){this.routes=new Map,this.currentRoute="/",this.contentContainer=null,this.init()}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.setup()):this.setup()}setup(){if(this.contentContainer=document.getElementById("page-content"),!this.contentContainer){console.error("Router: page-content container not found");return}this.setupRoutes(),this.setupNavigation(),this.handleRoute(),window.addEventListener("popstate",()=>this.handleRoute())}setupRoutes(){this.routes.set("/",()=>this.renderHomepage()),this.routes.set("/members",()=>this.renderMembersPage()),this.routes.set("/psn",()=>this.renderPSNPage()),this.routes.set("/kpi",()=>this.renderKPIPage()),this.routes.set("/training",()=>this.renderTrainingPage()),this.routes.set("/alerts",()=>this.renderAlertsPage()),this.routes.set("/funnel",()=>this.renderFunnelPage()),this.routes.set("/orders",()=>this.renderOrdersPage()),this.routes.set("/leads",()=>this.renderLeadsPage())}setupNavigation(){document.addEventListener("click",r=>{const n=r.target.closest(".nav-link");if(n&&n.hasAttribute("data-route")){r.preventDefault();const i=n.getAttribute("data-route");this.navigateTo(i)}});const e=document.querySelector(".nav-toggle"),t=document.querySelector(".nav-menu");e&&t&&(e.addEventListener("click",()=>{const r=t.classList.contains("active");t.classList.toggle("active",!r),e.setAttribute("aria-expanded",!r)}),document.addEventListener("click",r=>{!e.contains(r.target)&&!t.contains(r.target)&&(t.classList.remove("active"),e.setAttribute("aria-expanded","false"))}))}navigateTo(e){this.routes.has(e)||(console.warn(`Router: Route "${e}" not found, redirecting to home`),e="/"),this.currentRoute=e,window.history.pushState(null,"",`#${e}`),this.updateActiveNav(),this.render()}handleRoute(){const e=window.location.hash.slice(1)||"/";this.currentRoute=this.routes.has(e)?e:"/",this.updateActiveNav(),this.render()}updateActiveNav(){document.querySelectorAll(".nav-link").forEach(e=>{const t=e.getAttribute("data-route");e.classList.toggle("active",t===this.currentRoute)})}async render(){if(!this.contentContainer)return;const e=this.routes.get(this.currentRoute);if(e)try{const t=await e();this.contentContainer.innerHTML=t}catch(t){console.error("Error rendering route:",t),this.contentContainer.innerHTML=this.renderNotFound()}else this.contentContainer.innerHTML=this.renderNotFound();this.updatePageTitle()}updatePageTitle(){const t={"/":"Tổng quan","/members":"Quản lý thành viên","/psn":"PSN Health Monitor","/kpi":"KPI Tracker","/training":"Hệ thống đào tạo","/alerts":"Trung tâm cảnh báo","/funnel":"Funnel OS Analytics","/orders":"Quản lý đơn hàng","/leads":"Quản lý Leads"}[this.currentRoute]||"Hive Warfare Academy";document.title=`${t} - Droppii Training OS`}renderHomepage(){return`
      <div class="page-header">
        <h1 class="page-title">Chào mừng đến với Hive Warfare Academy</h1>
        <p class="page-subtitle">Hệ thống đào tạo Droppii Training OS - Nền tảng phát triển chiến binh bán hàng</p>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h3 class="card-title">📊 Tổng quan hệ thống</h3>
          <p>Dashboard tổng hợp dữ liệu training, KPI và PSN health của toàn bộ academy.</p>
          <div class="coming-soon">Đang phát triển...</div>
        </div>

        <div class="card">
          <h3 class="card-title">🎯 Sun Tzu Warfare Methodology</h3>
          <p>Áp dụng 13 chương Binh Pháp vào hệ thống đào tạo sales MLM hiện đại.</p>
          <div class="coming-soon">Sẽ ra mắt trong các module tiếp theo</div>
        </div>

        <div class="card">
          <h3 class="card-title">🏆 Training Architecture</h3>
          <ul style="margin-top: 1rem; color: var(--text-secondary);">
            <li><strong>Tier 1:</strong> Tân Binh → Chiến Binh (4 tuần)</li>
            <li><strong>Tier 2:</strong> Chiến Binh → Chỉ Huy (8 tuần)</li>
            <li><strong>Tier 3:</strong> Chỉ Huy → Tướng Quân (12 tuần)</li>
          </ul>
        </div>

        <div class="card">
          <h3 class="card-title">🤖 AI Agents</h3>
          <p>6 AI agents hỗ trợ training, retention, campaign và analytics tự động.</p>
          <div class="coming-soon">Đang tích hợp...</div>
        </div>
      </div>
    `}async renderMembersPage(){try{const{renderMembersTablePage:e}=await l(async()=>{const{renderMembersTablePage:r}=await import("./members-table-CP0p7FMg.js");return{renderMembersTablePage:r}},[]),t=document.createElement("div");return e(t),t.innerHTML}catch(e){return console.error("Error loading members page:",e),`
        <div class="page-header">
          <h1 class="page-title">Quản lý thành viên</h1>
          <p class="page-subtitle">Theo dõi và quản lý toàn bộ thành viên trong Hive Warfare Academy</p>
        </div>

        <div class="card">
          <h3 class="card-title">❌ Lỗi tải trang</h3>
          <p>Không thể tải trang quản lý thành viên: ${h(e.message)}</p>
          <button onclick="window.location.reload()" style="
            background: var(--brand-gold);
            border: none;
            color: var(--surface-primary);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-sm);
            cursor: pointer;
            margin-top: var(--spacing-md);
          ">
            🔄 Tải lại
          </button>
        </div>
      `}}renderPSNPage(){const e=document.createElement("div");return e.id="psn-health-container",l(()=>import("./psn-health-BTevSn7R.js"),[]).then(t=>{const r=t.default;new r().render(e)}).catch(t=>{console.error("Failed to load PSN Health View:",t),e.innerHTML=`
        <div class="page-header">
          <h1 class="page-title">PSN Health Monitor</h1>
          <p class="page-subtitle">Giám sát sức khỏe Personal Sales Network theo 9 trạng thái Cửu Địa</p>
        </div>
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải component</h3>
          <p>Không thể tải PSN Health View. Chi tiết lỗi: ${h(t.message)}</p>
          <p><strong>Ghi chú:</strong> PSN Health View với mock data từ T-010 đang development.</p>
        </div>
      `}),e.outerHTML}renderKPIPage(){return l(()=>import("./kpi-panel-weRl6IvA.js"),[]).then(e=>{const t=e.default;new t}).catch(e=>{console.error("Failed to load KPI panel:",e),this.contentContainer&&(this.contentContainer.innerHTML=this.renderKPIPlaceholder())}),`
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Đang tải bảng điều khiển KPI...</p>
      </div>

      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang khởi tạo KPI Tracker...</p>
      </div>
    `}renderKPIPlaceholder(){return`
      <div class="page-header">
        <h1 class="page-title">📊 KPI Tracker</h1>
        <p class="page-subtitle">Theo dõi các chỉ số hiệu suất quan trọng theo từng tier và mục tiêu</p>
      </div>

      <div class="card">
        <h3 class="card-title">🎯 Performance Metrics</h3>
        <p>Tracking connects/day, follow-ups/day, first-order-14d với trạng thái RED/YELLOW/GREEN.</p>
        <div class="coming-soon">
          Lỗi tải module KPI Panel. Vui lòng thử lại sau.
        </div>
      </div>
    `}renderTrainingPage(){return`
      <div class="page-header">
        <h1 class="page-title">Hệ thống đào tạo</h1>
        <p class="page-subtitle">Curriculum 3 tầng từ Tân Binh đến Tướng Quân</p>
      </div>

      <div class="card">
        <h3 class="card-title">🎓 Training Modules</h3>
        <p>4 modules Tier-1 đang được phát triển bởi content worker:</p>
        <ul style="margin-top: 1rem; color: var(--text-secondary);">
          <li>M1: Mindset Reset — 5AM Club + Kaizen journaling</li>
          <li>M2: Product Mastery — Droppii ecosystem deep-dive</li>
          <li>M3: Connect Engine — 15 connects/day framework</li>
          <li>M4: First Close — Follow-up sequence mastery</li>
        </ul>
        <div class="coming-soon">
          Chờ content worker T-012 đến T-015 hoàn thành
        </div>
      </div>
    `}renderAlertsPage(){return l(()=>import("./alerts-inbox-6A4NjEEo.js"),[]).then(e=>{const t=e.default;new t}).catch(e=>{console.error("Failed to load alerts inbox:",e),this.contentContainer.innerHTML=`
        <div class="page-header">
          <h1 class="page-title">Trung tâm cảnh báo</h1>
          <p class="page-subtitle">Hệ thống cảnh báo tự động cho retention và campaign triggers</p>
        </div>

        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải module</h3>
          <p>Không thể tải giao diện cảnh báo. Vui lòng thử lại sau.</p>
          <button onclick="location.reload()" style="
            background: var(--brand-gold);
            color: var(--surface-primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">
            Tải lại trang
          </button>
        </div>
      `}),`
      <div class="page-header">
        <h1 class="page-title">Trung tâm cảnh báo</h1>
        <p class="page-subtitle">Đang tải giao diện cảnh báo...</p>
      </div>

      <div class="loading-placeholder" style="
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
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
          margin-right: 1rem;
        "></div>
        Đang khởi tạo hệ thống cảnh báo...
      </div>

      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `}renderFunnelPage(){return l(()=>import("./funnel-view-B3gBDwbB.js"),[]).then(e=>{const t=e.default,r=new t,n=document.createElement("div");r.render(n),this.contentContainer.innerHTML=n.innerHTML}).catch(e=>{console.error("Failed to load Funnel View:",e),this.contentContainer.innerHTML='<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>'+h(e.message)+"</p></div>"}),'<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo Funnel OS...</p></div>'}renderOrdersPage(){return l(()=>import("./orders-view-5qEiZ1pS.js"),[]).then(e=>{const t=e.default,r=new t,n=document.createElement("div");r.render(n),this.contentContainer.innerHTML=n.innerHTML}).catch(e=>{console.error("Failed to load Orders View:",e),this.contentContainer.innerHTML='<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>'+h(e.message)+"</p></div>"}),'<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý đơn hàng...</p></div>'}renderLeadsPage(){return l(()=>import("./leads-view-C_3Mu3En.js"),[]).then(e=>{const t=e.default,r=new t,n=document.createElement("div");r.render(n),this.contentContainer.innerHTML=n.innerHTML}).catch(e=>{console.error("Failed to load Leads View:",e),this.contentContainer.innerHTML='<div class="card"><h3 class="card-title">⚠️ Lỗi tải component</h3><p>'+h(e.message)+"</p></div>"}),'<div class="loading-state"><div class="loading-spinner"></div><p>Đang khởi tạo quản lý leads...</p></div>'}renderNotFound(){return`
      <div class="page-header">
        <h1 class="page-title">404 - Không tìm thấy trang</h1>
        <p class="page-subtitle">Trang bạn tìm kiếm không tồn tại trong hệ thống</p>
      </div>

      <div class="card">
        <h3 class="card-title">🔍 Trang không tồn tại</h3>
        <p>Vui lòng sử dụng menu điều hướng hoặc quay về <a href="#/" style="color: var(--brand-gold);">trang chủ</a>.</p>
      </div>
    `}}class T{constructor(){this.router=null,this.init()}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.setup()):this.setup()}setup(){console.log("🚀 Initializing Droppii Training OS Dashboard..."),this.router=new b,this.setupTheme(),this.setupAccessibility(),this.setupPerformance(),this.addDashboardStyles(),console.log("✅ Dashboard initialized successfully")}setupTheme(){document.body.classList.add("dashboard-theme"),window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",t=>{console.log("System theme preference:",t.matches?"dark":"light")})}setupAccessibility(){document.addEventListener("keydown",e=>{if(e.key==="Escape"){const t=document.querySelector(".nav-menu"),r=document.querySelector(".nav-toggle");t&&t.classList.contains("active")&&(t.classList.remove("active"),r&&r.setAttribute("aria-expanded","false"))}if(e.altKey&&e.key>="1"&&e.key<="6"){e.preventDefault();const t=["/","/members","/psn","/kpi","/training","/alerts","/funnel","/orders","/leads"],r=parseInt(e.key)-1;t[r]&&this.router&&this.router.navigateTo(t[r])}}),document.addEventListener("focusin",e=>{e.target.matches(".nav-link, button, input, select, textarea")&&(e.target.style.outline="2px solid var(--brand-gold)",e.target.style.outlineOffset="2px")}),document.addEventListener("focusout",e=>{e.target.matches(".nav-link, button, input, select, textarea")&&(e.target.style.outline="",e.target.style.outlineOffset="")}),this.addSkipToContentLink()}addSkipToContentLink(){const e=document.createElement("a");e.href="#page-content",e.textContent="Chuyển đến nội dung chính",e.className="skip-to-content",e.style.cssText=`
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--brand-gold);
      color: var(--surface-primary);
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1001;
      font-weight: 600;
      transition: top 0.2s ease;
    `,e.addEventListener("focus",()=>{e.style.top="6px"}),e.addEventListener("blur",()=>{e.style.top="-40px"}),document.body.insertBefore(e,document.body.firstChild)}setupPerformance(){if(["Playfair Display","Inter","JetBrains Mono"].forEach(t=>{const r=document.createElement("link");r.rel="preload",r.as="font",r.crossOrigin="anonymous"}),"PerformanceObserver"in window)try{new PerformanceObserver(r=>{for(const n of r.getEntries())n.entryType==="navigation"&&console.log(`Dashboard load time: ${n.loadEventEnd-n.loadEventStart}ms`)}).observe({entryTypes:["navigation"]})}catch(t){console.warn("Performance monitoring not available:",t)}}addDashboardStyles(){const e=document.createElement("style");e.textContent=`
      /* Dashboard-specific grid layout */
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
        margin-top: var(--spacing-xl);
      }

      .dashboard-theme {
        /* Additional theme classes can be added here */
      }

      /* Loading states and animations */
      .fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Print styles for reports */
      @media print {
        .main-nav,
        .nav-toggle,
        .loading-spinner {
          display: none !important;
        }

        .main-content {
          margin-top: 0;
        }

        .card {
          border: 1px solid #000;
          box-shadow: none;
          break-inside: avoid;
        }

        body {
          background: white !important;
          color: black !important;
        }
      }

      /* High DPI display support */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .nav-icon,
        .loading-spinner {
          transform: translateZ(0);
        }
      }
    `,document.head.appendChild(e)}getSystemInfo(){return{userAgent:navigator.userAgent,viewport:{width:window.innerWidth,height:window.innerHeight},colorScheme:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",reducedMotion:window.matchMedia("(prefers-reduced-motion: reduce)").matches,currentRoute:this.router?this.router.currentRoute:null,timestamp:new Date().toISOString()}}}const w=new T;window.DashboardApp=w;"serviceWorker"in navigator&&window.addEventListener("load",()=>{console.log("Service worker support detected")});export{l as _};
//# sourceMappingURL=main-D-XKVPla.js.map
