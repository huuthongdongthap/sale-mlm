/**
 * PSN Health View - Render functions
 * All render/UI helpers, each takes the view instance as first param
 */

import { createPSNCard, attachPSNCardEvents } from './components/psn-card.js';
import { formatVND } from './psn-health-utils.js';

export function renderPSNCards(view) {
  if (!view.filteredPSNs.length) {
    return `
      <div class="no-results">
        <h3>Không tìm thấy PSN</h3>
        <p>Thử thay đổi bộ lọc hoặc làm mới dữ liệu</p>
      </div>
    `;
  }

  return view.filteredPSNs.map(psn => createPSNCard(psn)).join('');
}

export function renderLoadingState() {
  return `
    <div class="psn-loading">
      <div class="loading-spinner"></div>
      <h2>Đang tải dữ liệu PSN Health...</h2>
      <p>Phân tích trạng thái Cửu Địa</p>
    </div>
  `;
}

export function handleDataLoadError(view, error) {
  const errorHTML = `
    <div class="psn-error">
      <div class="error-icon">⚠️</div>
      <h2>Không thể tải dữ liệu PSN</h2>
      <p>Lỗi: ${error.message}</p>
      <p class="error-note">
        <strong>Ghi chú:</strong> Task T-005 (PSN health score) đang được phát triển.
        Hiện tại sử dụng mock data.
      </p>
      <button class="retry-btn" onclick="window.location.reload()">
        Thử lại
      </button>
    </div>
  `;

  if (view.container) {
    view.container.innerHTML = errorHTML;
  }
}

export function updatePSNGrid(view) {
  const psnGrid = view.container?.querySelector('#psn-cards-container');
  if (psnGrid) {
    psnGrid.innerHTML = renderPSNCards(view);
    attachPSNCardEvents(psnGrid, (psnId) => {
      showPSNDetail(view, psnId);
    });
  }
}

export function showPSNDetail(view, psnId) {
  const psn = view.data.psns.find(p => p.id === psnId);
  if (!psn) {
    console.error('PSN not found:', psnId);
    return;
  }

  const detailInfo = `
PSN: ${psn.id} - ${psn.leader_name}
Trạng thái: ${psn.current_state.name} (${psn.current_state.id})
Team: ${psn.team_size} thành viên
Retention 30d: ${psn.retention_30d}%
Doanh thu: ${formatVND(psn.revenue_current)}
Rủi ro: ${psn.top_risk}
${psn.buddy_assigned ? `Buddy: ${psn.buddy_assigned}` : 'Chưa có buddy'}

[Trang chi tiết PSN với CTA buddy assignment sẽ được implement ở task khác]
  `.trim();

  alert(detailInfo);
}
