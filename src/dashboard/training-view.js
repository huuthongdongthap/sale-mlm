/**
 * Training View — Hive Academy
 * Routes: /learn, /learn/tier-1, /learn/tier-2, /learn/tier-3, /learn/lesson/:id
 *
 * Consumes:
 *   GET  /api/training/active          — all trainees
 *   GET  /api/training/attention       — trainees needing help
 *   GET  /api/training/:memberId       — full training record
 *   GET  /api/training/:memberId/progress — progress object
 *   POST /api/training/progress        — update progress
 *   POST /api/training/assign          — assign curriculum
 */

const TIER_BADGE = {
  1: 'tier-badge--tier-1',
  2: 'tier-badge--tier-2',
  3: 'tier-badge--tier-3',
};

const TIER_NAME = {
  1: 'Tân Binh → Chiến Binh',
  2: 'Chiến Binh → Chỉ Huy',
  3: 'Chỉ Huy → Tướng Quân',
};

const TIER_WEEKS = { 1: 4, 2: 8, 3: 12 };

const TIER_MODULES = {
  1: [
    { id: 'M1', name: 'Mindset Reset — 5AM Club', days: 7 },
    { id: 'M2', name: 'Product Mastery — Droppii Ecosystem', days: 7 },
    { id: 'M3', name: 'Connect Engine — 15 Connects/Day', days: 7 },
    { id: 'M4', name: 'First Close — Follow-Up Mastery', days: 7 },
  ],
  2: [
    { id: 'M5', name: 'Recruitment Funnel', days: 14 },
    { id: 'M6', name: 'Leader DNA — DISC Coaching', days: 14 },
    { id: 'M7', name: 'PSN Management', days: 14 },
    { id: 'M8', name: 'Coaching Conversations', days: 14 },
  ],
  3: [
    { id: 'M9', name: 'Sun Tzu Applied — 13 Chapters', days: 21 },
    { id: 'M10', name: 'Campaign Warfare', days: 21 },
    { id: 'M11', name: 'Data Commander', days: 21 },
    { id: 'M12', name: 'Legacy Builder', days: 21 },
  ],
};

const LESSON_TYPE_ICON = {
  video: { icon: '🎬', bg: '#DBEAFE', color: '#1D4ED8', label: 'Video' },
  pdf: { icon: '📄', bg: '#FEF3C7', color: '#92400E', label: 'PDF' },
  quiz: { icon: '📝', bg: '#D1FAE5', color: '#065F46', label: 'Quiz' },
  live: { icon: '🔴', bg: '#FEF08A', color: '#854D0E', label: 'Live' },
};

class TrainingView {
  constructor() {
    this.apiBase = window.location.origin || location.origin;
    this.activeTab = 'overview';
    this.expandedWeeks = {};
    this.selectedLesson = null;
    this.trainingData = null;
    this.memberId = null;
    this.isLeaderView = false;
  }

  async render(container) {
    this.container = container;
    this.isLeaderView = new URLSearchParams(window.location.hash.split('?')[1] || '').has('leaderView');

    await this.loadData(container);
  }

  async loadData(container) {
    await this.setupLessonProgress();
    await this.setupLessonTypes();
    try {
      const url = this.isLeaderView ? '/api/training/attention' : '/api/training/active';
      const res = await fetch(`${this.apiBase}${url}`, { headers: { Authorization: `Bearer ${this.getAuthToken()}` } });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      this.trainingData = json.trainees || json || [];
      if (this.trainingData.length) this.memberId = this.trainingData[0].memberId;
      this.renderShell(container);
    } catch (err) {
      container.innerHTML = `
        <div class="card">
          <h3 class="card-title">⚠️ Lỗi tải dữ liệu</h3>
          <p>Không thể kết nối API: ${err.message}</p>
        </div>`;
    }
  }

  renderShell(container) {
    const tab = this.activeTab;
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">🐝 Hive Academy</h1>
        <p class="page-subtitle">Khoá huấn luyện nội bộ — ${this.isLeaderView ? 'Leader View' : 'Trainee View'}</p>
      </div>
      <div class="training-shell">
        <div class="training-welcome" role="status" aria-live="polite"></div>
        <div class="training-tabs" role="tablist"></div>
        <div class="training-body" id="active-tab-panel" role="tabpanel"></div>
      </div>`;
    this.renderTabs();
    this.renderActiveTab();
    this.bindGlobalActions();
  }

  renderTabs() {
    const tabs = [
      { key: 'overview', label: '📊 Tổng quan', help: this.isLeaderView ? 'Danh sách trainee + scheduler' : 'Tiến độ tổng quan' },
      { key: 'plan', label: '📋 Curriculum', help: 'Kế hoạch theo tuần' },
      { key: 'lesson', label: '▶️ Bài học', help: 'Người dùng bật tab này khi đang học' },
      { key: 'community', label: '💬 Hive Hub', help: 'Bảng cộng đồng với alert+realistic' },
    ];
    const list = container && container.querySelector && container.querySelector('.training-tabs');
    if (!list) return;
    list.innerHTML = tabs.map((t, idx) => `
      <button
        class="training-tab ${this.activeTab === t.key ? 'training-tab--active' : ''}"
        data-tab="${t.key}"
        aria-selected="${this.activeTab === t.key}"
        aria-controls="active-tab-panel"
        role="tab"
      >
        ${t.label}
        <span class="visually-hidden">${t.help}</span>
      </button>`).join('');
    list.querySelectorAll('.training-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.renderShell(this.container);
      });
    });
  }

  renderActiveTab() {
    const panel = this.container.querySelector('#active-tab-panel');
    if (!panel) return;
    switch (this.activeTab) {
      case 'overview': this.renderOverview(panel); break;
      case 'plan': this.renderPlan(panel); break;
      case 'lesson': this.renderLesson(panel); break;
      case 'community': this.renderCommunity(panel); break;
      default: this.renderOverview(panel);
    }
  }

  renderOverview(panel) {
    const records = this.trainingData || [];
    const focus = records.filter(r => r.needsHelp);
    const list = focus.length ? focus.map(r => `
      <li class="focus-item">
        <span class="tier-badge ${TIER_BADGE[r.tier] || ''}">${r.displayTier || ('T' + (r.tier || 1))}</span>
        <span class="focus-name">${this.escapeHtml(r.name)}</span>
        <span class="focus-meta">${r.completedModules || 0}/${r.totalModules || 0} modules</span>
      </li>`).join('') : '<li class="focus-item focus-item--empty">Chưa có trainee cần hỗ trợ.</li>';

    panel.innerHTML = `
      <section class="training-section" aria-labelledby="training-overview">
        <div class="card">
          <h3 class="card-title">📊 Active Trainees</h3>
          <div class="dashboard-grid overview-grid">
            ${records.map(r => `
              <article class="overview-card" data-member-id="${r.memberId}">
                <div class="overview-card__header">
                  <span class="tier-badge ${TIER_BADGE[r.tier] || ''}">${r.displayTier || ('T' + (r.tier || 1))}</span>
                  <span class="overview-card__name">${this.escapeHtml(r.name)}</span>
                </div>
                <div class="overview-card__progress">
                  <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.percent || 0}" style="width: ${r.percent || 0}%;">
                    <span class="progress__label">${r.percent || 0}%</span>
                  </div>
                </div>
                <div class="overview-card__meta">${r.completedModules || 0}/${r.totalModules || 0} modules</div>
                <button class="btn-secondary btn-sm btn-continue" data-member-id="${r.memberId}">Tiếp tục</button>
              </article>`).join('')}
            ${records.length === 0 ? '<p>No active trainees.</p>' : ''}
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">🎯 Focus: Cần hỗ trợ</h3>
          <ul class="focus-list">${list}</ul>
        </div>
      </section>`;

    panel.querySelectorAll('.btn-continue').forEach(btn => {
      btn.addEventListener('click', async () => {
        const memberId = btn.dataset.memberId;
        await this.openMemberRecord(memberId);
      });
    });

    panel.querySelectorAll('.overview-card').forEach(card => {
      card.addEventListener('click', async () => {
        const memberId = card.dataset.memberId;
        await this.openMemberRecord(memberId);
      });
    });
  }

  async openMemberRecord(memberId) {
    this.memberId = memberId;
    this.activeTab = 'plan';
    this.renderShell(this.container);
  }

  renderPlan(panel) {
    panel.innerHTML = `
      <section class="training-section">
        <div class="plan-header">
          <h3 class="card-title">📋 Kế hoạch huấn luyện — T${this.tier}</h3>
          <p class="plan-subtitle">${TIER_NAME[this.tier] || ''}</p>
        </div>
        <ol class="week-accordion">
          ${this.getWeekAccordionItems().map((item, idx) => `
            <li class="week-accordion__item">
              <button class="week-accordion__trigger" aria-expanded="${this.expandedWeeks[idx]}" aria-controls="week-${idx}">
                <span class="week-accordion__week">${item.week}</span>
                <span class="week-accordion__name">${item.name}</span>
                <span class="week-accordion__meta">${item.lessons}/${item.totalLessons} lessons</span>
                <span class="week-accordion__chevron" aria-hidden="true">▾</span>
              </button>
              <div id="week-${idx}" class="week-accordion__panel" hidden>
                <ul class="lesson-list">
                  ${item.lessons.map((lesson, li) => `
                    <li class="lesson-item" role="button" tabindex="0" data-module-id="${lesson.moduleId}" data-lesson-id="${lesson.lessonId}">
                      <span class="lesson-icon">${LESSON_TYPE_ICON[lesson.type]?.icon || '📄'}</span>
                      <span class="lesson-title">${this.escapeHtml(lesson.title)}</span>
                      <span class="lesson-duration">${lesson.duration || '10m'}</span>
                    </li>`).join('')}
                </ul>
              </div>
            </li>`).join('')}
        </ol>
      </section>`;

    panel.querySelectorAll('.week-accordion__trigger').forEach((btn, idx) => {
      btn.addEventListener('click', async () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(`week-${idx}`);
        if (panel) panel.hidden = !expanded;
        btn.setAttribute('aria-expanded', String(!expanded));
        this.expandedWeeks[idx] = !expanded;
        if (!expanded) await this.renderLessonForWeek(idx);
      });
    });
  }

  renderLesson(panel) {
    panel.innerHTML = `
      <section class="training-section">
        <div class="lesson-player" id="lesson-player" role="region" aria-label="Lesson player"></div>
      </section>`;
  }

  renderCommunity(panel) {
    panel.innerHTML = `
      <section class="training-section">
        <div class="card">
          <h3 class="card-title">💬 Hive Hub</h3>
          <div class="alert-slot" role="status" aria-live="polite"></div>
          <div class="community-feed">Cộng đồng đăng ký projeto này đang được tập trung</div>
        </div>
      </section>`;
  }

  bindGlobalActions() {
    const continueBtn = document.getElementById('training-continue');
    if (continueBtn) continueBtn.addEventListener('click', () => this.openNextLesson());
  }

  getWeekAccordionItems() {
    const modules = TIER_MODULES[this.tier] || [];
    const rows = [];
    const WEEKS = this.totalWeeks || 4;
    modules.forEach((module, idx) => {
      const week = idx + 1;
      const totalLessons = 3;
      const completedLessons = Math.min(totalLessons, this.getModuleProgress(module.id));
      rows.push({
        week: `Tuần ${week}: ${module.name}`,
        name: module.name,
        lessons: [
          { moduleId: module.id, lessonId: `${module.id}-L1`, title: `${module.name} — Phần 1`, type: 'video', duration: '10m' },
          { moduleId: module.id, lessonId: `${module.id}-L2`, title: `${module.name} — Phần 2`, type: 'pdf', duration: '10m' },
          { moduleId: module.id, lessonId: `${module.id}-L3`, title: `${module.name} — Kiểm tra`, type: 'quiz', duration: '5m' },
        ],
        totalLessons,
        completedLessons,
      });
    });
    return rows;
  }

  getModuleProgress(moduleId) {
    if (!this.trainingData || !this.memberId) return 0;
    const rec = this.trainingData.find(r => r.memberId === this.memberId);
    if (!rec || !rec.progress) return 0;
    const p = rec.progress;
    if (p.lastModule === moduleId) return 3;
    const idx = (TIER_MODULES[this.tier] || []).findIndex(m => m.id === moduleId);
    const pIdx = (TIER_MODULES[this.tier] || []).findIndex(m => m.id === (p.lastModule || ''));
    if (idx >= 0 && idx < pIdx) return 3;
    return 0;
  }

  async renderLessonForWeek(weekIndex) {
    const modules = TIER_MODULES[this.tier] || [];
    const lesson = modules[weekIndex];
    if (!lesson) return;
    const player = document.getElementById('lesson-player');
    if (!player) return;
    player.innerHTML = `
      <div class="lesson-placeholder">
        <div class="lesson-icon" aria-hidden="true">📚</div>
        <h4 class="lesson-title">${this.escapeHtml(lesson.name)}</h4>
        <p class="lesson-help">Đây là nội dung demo. Thay bằng player thật sau khi backend sẵn sàng.</p>
      </div>`;
  }

  async openNextLesson() {
    if (!this.memberId) return;
    const modules = TIER_MODULES[this.tier] || [];
    if (!modules.length) return;
    const first = modules[0];
    this.selectedLesson = { moduleId: first.id, lessonId: `${first.id}-L1` };
    this.activeTab = 'lesson';
    this.renderShell(this.container);
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  setupLessonProgress() {
    if (!this.trainingData || !this.trainingData.length) return;
    ['module-progress', 'lesson-status'].forEach(cls => {
      const slots = document.querySelectorAll(`.${cls}`);
      slots.forEach(node => { node.textContent = 'Đang tải...'; });
    });
  }

  setupLessonTypes() {
    const processed = new Set();
    document.querySelectorAll('[data-lesson-type]').forEach(el => {
      const type = (el.dataset.lessonType || 'pdf').toLowerCase();
      if (processed.has(type)) return;
      processed.add(type);
      const meta = LESSON_TYPE_ICON[type] || LESSON_TYPE_ICON.pdf;
      if (el.dataset.role === 'img') el.alt = `${meta.label} icon`;
      el.textContent = `${meta.icon} ${meta.label}`;
    });
  }

  get tier() {
  if (!Number.isFinite(this._tier)) {
    const first = this.trainingData && this.trainingData[0];
    this._tier = first && Number.isFinite(first.tier) ? first.tier : 1;
  }
  return this._tier;
}

get totalWeeks() {
  return TIER_WEEKS[this.tier] || 4;
}
}