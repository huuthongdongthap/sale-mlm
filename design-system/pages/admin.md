# Admin Panel Page Overrides

> **OVERRIDE SCOPE:** This file overrides MASTER.md rules ONLY for Admin Panel pages.
> Routes: `/admin`, `/admin/users`, `/admin/teams`, `/admin/analytics`, `/admin/settings`, `/admin/billing`
> Rules not explicitly overridden here fall back to MASTER.md.

---

## Page Context
- **Purpose:** Platform administration — user management, team oversight, analytics, billing, system config
- **Primary User:** Platform admins, super-admins, support agents
- **Device Priority:** Desktop-first (complex data tables), tablet-functional
- **Security:** Elevated permissions — all actions audited, destructive actions require confirmation

---

## Layout Overrides

### Admin Shell (Persistent Layout)
```css
.admin-shell {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 260px 1fr;
  min-height: 100dvh;
  background: var(--color-background);
}

/* Top Bar — Fixed */
.admin-topbar {
  grid-column: 1 / -1;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 30;
}

@media (max-width: 1023px) {
  .admin-topbar {
    height: 52px;
    padding: 0 var(--space-md);
  }
}

/* Sidebar — Fixed Left */
.admin-sidebar {
  grid-row: 2;
  height: calc(100dvh - 56px);
  position: sticky;
  top: 56px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--space-md) 0;
  z-index: 20;
}

@media (max-width: 1023px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 52px;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    transform: translateX(-100%);
    transition: transform 250ms ease;
    z-index: 40;
    height: calc(100dvh - 52px);
    box-shadow: var(--shadow-xl);
  }
  
  .admin-sidebar--open {
    transform: translateX(0);
  }
  
  .admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 35;
    opacity: 0;
    visibility: hidden;
    transition: all 250ms ease;
  }
  
  .admin-sidebar-overlay--visible {
    opacity: 1;
    visibility: visible;
  }
}

/* Main Content */
.admin-main {
  grid-row: 2;
  grid-column: 2;
  padding: var(--space-xl) var(--space-2xl);
  overflow-y: auto;
  max-width: 100%;
}

@media (max-width: 1023px) {
  .admin-main {
    padding: var(--space-lg) var(--space-md);
    grid-column: 1;
  }
}

@media (max-width: 639px) {
  .admin-main {
    padding: var(--space-md);
  }
}

/* Page Header Pattern */
.admin-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.admin-page-title-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.admin-page-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

@media (max-width: 639px) {
  .admin-page-title {
    font-size: 22px;
  }
}

.admin-page-description {
  font-size: 15px;
  color: var(--color-muted-foreground);
  max-width: 600px;
}

.admin-page-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}
```

---

## Component Overrides

### Data Tables (Core Admin Pattern)
```css
/* Table Container — Responsive with Horizontal Scroll on Mobile */
.admin-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;  /* Forces horizontal scroll on narrow viewports */
  font-size: 14px;
}

.admin-table thead {
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.admin-table th {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted-foreground);
  white-space: nowrap;
  border-bottom: 1px solid var(--color-border);
}

.admin-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-foreground);
  vertical-align: middle;
}

.admin-table tbody tr {
  transition: background 150ms ease;
}

.admin-table tbody tr:hover {
  background: var(--color-surface-hover);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

/* Sticky First Column (for row identifier) */
.admin-table th:first-child,
.admin-table td:first-child {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
}

.admin-table thead th:first-child {
  z-index: 2;
}

/* Row Actions */
.admin-row-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.admin-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-muted-foreground);
  cursor: pointer;
  transition: all 150ms ease;
}

.admin-action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

.admin-action-btn--destructive:hover {
  background: #FEF2F2;
  color: var(--color-destructive);
  border-color: #FECACA;
}

.admin-action-btn:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

/* Status Badges in Tables */
.admin-status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-status-badge--active    { background: #ECFDF5; color: #065F46; }
.admin-status-badge--pending   { background: #FEF3C7; color: #92400E; }
.admin-status-badge--suspended { background: #FEF2F2; color: #991B1B; }
.admin-status-badge--banned    { background: #F5F5F4; color: #44403C; }
.admin-status-badge--trial     { background: #EFF6FF; color: #1E40AF; }

/* Clickable Row (for drill-down) */
.admin-table tbody tr[data-href] {
  cursor: pointer;
}

.admin-table tbody tr[data-href]:hover {
  background: var(--color-surface-hover);
}

.admin-table tbody tr[data-href]:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: -2px;
}
```

### Filter/Sort Toolbar
```css
.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.admin-toolbar-left,
.admin-toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.admin-search {
  position: relative;
  width: 280px;
}

@media (max-width: 639px) {
  .admin-search {
    width: 100%;
    order: 3;
  }
}

.admin-search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md) var(--space-sm) 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-foreground);
  transition: all 150ms ease;
}

.admin-search-input:focus {
  outline: none;
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 3px rgba(161, 98, 7, 0.15);
}

.admin-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-muted-foreground);
  pointer-events: none;
}

.admin-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-foreground);
  min-width: 160px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 36px;
}

.admin-select:focus {
  outline: none;
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 3px rgba(161, 98, 7, 0.15);
}

.admin-toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 var(--space-sm);
}

@media (max-width: 639px) {
  .admin-toolbar-divider {
    display: none;
  }
}
```

### User/Team Cards (Grid View Alternative)
```css
.admin-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}

.admin-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  transition: all 200ms ease;
}

.admin-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-md);
}

.admin-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.admin-card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-gold-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold-700);
  flex-shrink: 0;
  font-weight: 700;
  font-size: 18px;
}

.admin-card-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.admin-card-info {
  flex: 1;
  min-width: 0;
}

.admin-card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-card-email {
  font-size: 13px;
  color: var(--color-muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.admin-card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.admin-card-meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  color: var(--color-muted-foreground);
}

.admin-card-meta-label {
  font-weight: 500;
}

.admin-card-meta-value {
  color: var(--color-foreground);
}

.admin-card-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
```

---

## Analytics Dashboard Overrides (Charts & Metrics)

### Metric Cards Row
```css
.admin-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

@media (max-width: 1023px) {
  .admin-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .admin-metrics-grid {
    grid-template-columns: 1fr;
  }
}

.admin-metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.admin-metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-metric-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted-foreground);
}

.admin-metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.admin-metric-trend--up { color: var(--color-success); }
.admin-metric-trend--down { color: var(--color-destructive); }
.admin-metric-trend--flat { color: var(--color-muted-foreground); }

.admin-metric-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-foreground);
}

.admin-metric-sparkline {
  margin-top: auto;
  height: 40px;
}
```

### Chart Containers
```css
.admin-chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.admin-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.admin-chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
}

.admin-chart-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.admin-chart-period {
  display: flex;
  gap: 4px;
  background: var(--color-background);
  border-radius: 6px;
  padding: 2px;
}

.admin-chart-period-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted-foreground);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.admin-chart-period-btn:hover {
  color: var(--color-foreground);
}

.admin-chart-period-btn--active {
  background: var(--color-gold-500);
  color: white;
}

.admin-chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 639px) {
  .admin-chart-wrapper {
    height: 240px;
  }
}
```

---

## Modal/Dialog Overrides (Admin Actions)

### Confirmation Dialogs (Destructive Actions)
```css
.admin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  animation: fadeIn 150ms ease;
}

.admin-modal {
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  max-width: 480px;
  width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
  animation: slideUp 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.admin-modal--destructive .admin-modal-header {
  border-bottom: 1px solid var(--color-border);
}

.admin-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-lg);
  gap: var(--space-md);
}

.admin-modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-modal--destructive .admin-modal-icon {
  background: #FEF2F2;
  color: var(--color-destructive);
}

.admin-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.admin-modal-description {
  font-size: 14px;
  color: var(--color-muted-foreground);
  line-height: 1.5;
}

.admin-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-muted-foreground);
  cursor: pointer;
  transition: all 150ms ease;
}

.admin-modal-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

.admin-modal-body {
  padding: var(--space-lg);
}

.admin-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  border-radius: 0 0 16px 16px;
}

.admin-modal-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.admin-modal-btn--cancel {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}

.admin-modal-btn--cancel:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-gold-500);
  color: var(--color-gold-500);
}

.admin-modal-btn--confirm {
  background: var(--color-gold-500);
  color: white;
  border: none;
}

.admin-modal-btn--confirm:hover {
  opacity: 0.9;
}

.admin-modal-btn--destructive {
  background: var(--color-destructive);
  color: white;
  border: none;
}

.admin-modal-btn--destructive:hover {
  opacity: 0.9;
}

/* Checkbox for "I understand" confirmation */
.admin-modal-confirm {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.admin-modal-confirm input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-gold-500);
  flex-shrink: 0;
  margin-top: 2px;
}

.admin-modal-confirm label {
  font-size: 13px;
  color: var(--color-foreground);
  line-height: 1.5;
  cursor: pointer;
}
```

### Slide-over Panel (Side Panel for Detail Views)
```css
.admin-slideover {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 100vw;
  background: var(--color-surface);
  box-shadow: var(--shadow-xl);
  z-index: 80;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-slideover--open {
  transform: translateX(0);
}

.admin-slideover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 75;
  opacity: 0;
  visibility: hidden;
  transition: all 250ms ease;
}

.admin-slideover-overlay--visible {
  opacity: 1;
  visibility: visible;
}

.admin-slideover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 10;
}

.admin-slideover-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-foreground);
}

.admin-slideover-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-muted-foreground);
  cursor: pointer;
  transition: all 150ms ease;
}

.admin-slideover-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

.admin-slideover-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.admin-slideover-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

@media (max-width: 639px) {
  .admin-slideover {
    width: 100vw;
    border-radius: 0;
  }
}
```

---

## Settings Forms (Admin Configuration)

### Form Layout
```css
.admin-form {
  max-width: 720px;
}

.admin-form-section {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.admin-form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.admin-form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
  margin-bottom: var(--space-lg);
}

.admin-form-group {
  margin-bottom: var(--space-lg);
}

.admin-form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.admin-form-label-required::after {
  content: " *";
  color: var(--color-destructive);
}

.admin-form-input,
.admin-form-select,
.admin-form-textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-foreground);
  transition: all 150ms ease;
}

.admin-form-input:focus,
.admin-form-select:focus,
.admin-form-textarea:focus {
  outline: none;
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 3px rgba(161, 98, 7, 0.15);
}

.admin-form-input::placeholder {
  color: var(--color-muted-foreground);
}

.admin-form-textarea {
  min-height: 120px;
  resize: vertical;
}

.admin-form-hint {
  font-size: 12px;
  color: var(--color-muted-foreground);
  margin-top: var(--space-xs);
}

.admin-form-error {
  font-size: 12px;
  color: var(--color-destructive);
  margin-top: var(--space-xs);
}

.admin-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 639px) {
  .admin-form-row {
    grid-template-columns: 1fr;
  }
}

/* Toggle Switch */
.admin-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.admin-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.admin-toggle-track {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--color-border);
  transition: background 150ms ease;
  position: relative;
}

.admin-toggle-track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 150ms ease;
}

.admin-toggle input:checked + .admin-toggle-track {
  background: var(--color-gold-500);
}

.admin-toggle input:checked + .admin-toggle-track::after {
  transform: translateX(20px);
}

.admin-toggle input:focus-visible + .admin-toggle-track {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.admin-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-foreground);
  user-select: none;
}
```

---

## Billing/Subscription Management

### Plan Cards
```css
.admin-plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
}

.admin-plan-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 200ms ease;
}

.admin-plan-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-lg);
}

.admin-plan-card--popular {
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 1px var(--color-gold-500), var(--shadow-lg);
}

.admin-plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: var(--color-gold-500);
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 999px;
  white-space: nowrap;
}

.admin-plan-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.admin-plan-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.admin-plan-amount {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-foreground);
  line-height: 1;
}

.admin-plan-period {
  font-size: 14px;
  color: var(--color-muted-foreground);
}

.admin-plan-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  flex: 1;
}

.admin-plan-feature {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--color-foreground);
  line-height: 1.5;
}

.admin-plan-feature-icon {
  width: 18px;
  height: 18px;
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

.admin-plan-cta {
  width: 100%;
}
```

---

## Typography Overrides

```css
/* Admin-specific typographic scale */
.admin-heading-1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
.admin-heading-2 { font-size: 20px; font-weight: 600; }
.admin-heading-3 { font-size: 16px; font-weight: 600; }
.admin-body { font-size: 14px; line-height: 1.6; }
.admin-body-sm { font-size: 13px; line-height: 1.5; }
.admin-caption { font-size: 12px; color: var(--color-muted-foreground); }
.admin-mono { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; }
```

---

## Color Overrides (Admin-Specific)

```css
:root {
  /* Admin semantic colors */
  --admin-bg: var(--color-background);
  --admin-surface: var(--color-surface);
  --admin-surface-elevated: var(--color-surface-elevated);
  --admin-border: var(--color-border);
  --admin-border-focus: var(--color-gold-500);
  
  /* Status colors — aligned with PSN but for system states */
  --admin-status-online: #10B981;
  --admin-status-busy: #F59E0B;
  --admin-status-offline: #9CA3AF;
  --admin-status-error: #EF4444;
  
  /* Severity colors for alerts/logs */
  --admin-severity-critical: #DC2626;
  --admin-severity-high: #EA580C;
  --admin-severity-medium: #CA8A04;
  --admin-severity-low: #3B82F6;
  --admin-severity-info: #6B7280;
}
```

---

## Interaction Overrides

### Table Row Selection (Bulk Actions)
```css
.admin-table-row-selected {
  background: #FEFCE8 !important; /* amber-50 */
}

.admin-table-row-selected td:first-child {
  border-left: 3px solid var(--color-gold-500);
}

.admin-bulk-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  animation: slideUp 200ms ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.admin-bulk-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-foreground);
}

.admin-bulk-actions {
  display: flex;
  gap: var(--space-sm);
}
```

### Tooltip/Popover (For Truncated Content)
```css
.admin-tooltip {
  position: absolute;
  z-index: 200;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-foreground);
  color: var(--color-background);
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 150ms ease;
}

.admin-tooltip::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--color-foreground);
}

.admin-has-tooltip:hover .admin-tooltip {
  opacity: 1;
  visibility: visible;
}
```

---

## Accessibility Overrides

```css
/* Skip link for admin shell */
.admin-skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-gold-500);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  z-index: 200;
}

.admin-skip-link:focus {
  top: var(--space-md);
}

/* Focus management in modals/slideovers */
.admin-modal[open] *:focus-visible,
.admin-slideover[open] *:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

/* Table keyboard navigation */
.admin-table tbody tr[data-href]:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: -2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .admin-table th,
  .admin-table td {
    border-color: currentColor;
  }
  
  .admin-status-badge {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .admin-modal,
  .admin-slideover,
  .admin-bulk-action-bar,
  .admin-tooltip,
  .admin-table tbody tr,
  .admin-action-btn,
  .admin-card {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Responsive Overrides

### Mobile (< 640px)
```css
@media (max-width: 639px) {
  .admin-topbar {
    height: 52px;
  }
  
  .admin-sidebar {
    top: 52px;
    height: calc(100dvh - 52px);
  }
  
  .admin-main {
    padding: var(--space-md);
  }
  
  .admin-page-title {
    font-size: 22px;
  }
  
  .admin-metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .admin-search {
    width: 100%;
  }
  
  .admin-table-wrapper {
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin: calc(var(--space-md) * -1) calc(var(--space-md) * -1);
    border-radius: 0;
  }
  
  .admin-card-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-form-row {
    grid-template-columns: 1fr;
  }
  
  .admin-bulk-action-bar {
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
  }
  
  .admin-bulk-actions {
    width: 100%;
  }
  
  .admin-bulk-actions .admin-modal-btn {
    flex: 1;
    justify-content: center;
  }
}
```

### Tablet (640px - 1023px)
```css
@media (min-width: 640px) and (max-width: 1023px) {
  .admin-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .admin-toolbar {
    flex-wrap: wrap;
  }
}
```

---

## Anti-Patterns (Admin-Specific)

| ❌ Don't | ✅ Do |
|----------|-------|
| Tables without horizontal scroll on mobile | `overflow-x: auto` + `min-width` on table |
| Bulk actions hidden in dropdown | Persistent bottom bar when rows selected |
| Destructive actions without confirmation | Two-step: click → confirm modal + checkbox |
| No loading state on data fetch | Skeleton rows matching column count |
| Fixed-width tables | Fluid + min-width + sticky first column |
| Confirmation modals without "I understand" | Checkbox for irreversible actions |
| Icons without labels in table actions | Tooltip + aria-label on every icon button |
| Inline editing without save/cancel | Clear save (gold) / cancel (ghost) buttons |
| Pagination without page size selector | 10/25/50/100 rows per page |
| Filters that don't persist in URL | Sync filters to URL params for sharing |

---

## Data Attributes for JS Hooks

```html
<!-- Table -->
<table class="admin-table" data-table="users" data-sortable data-filterable>
  <thead>
    <tr>
      <th data-sort="name">Name</th>
      <th data-sort="email">Email</th>
      <th data-sort="status">Status</th>
      <th data-sort="created">Joined</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr data-href="/admin/users/123" data-id="123" data-status="active">
      <td>John Doe</td>
      <td>john@example.com</td>
      <td><span class="admin-status-badge admin-status-badge--active">Active</span></td>
      <td>2024-01-15</td>
      <td><div class="admin-row-actions">...</div></td>
    </tr>
  </tbody>
</table>

<!-- Bulk action bar (shown when rows selected) -->
<div class="admin-bulk-action-bar" data-bulk-action-bar hidden>
  <span class="admin-bulk-info"><span data-selected-count>0</span> selected</span>
  <div class="admin-bulk-actions">
    <button class="admin-modal-btn admin-modal-btn--cancel" data-bulk-cancel>Clear</button>
    <button class="admin-modal-btn admin-modal-btn--destructive" data-bulk-delete>Delete</button>
    <button class="admin-modal-btn admin-modal-btn--confirm" data-bulk-export>Export</button>
  </div>
</div>

<!-- Modal -->
<div class="admin-modal-overlay" data-modal="delete-confirm" hidden>
  <div class="admin-modal admin-modal--destructive" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="admin-modal-header">
      <div>
        <div class="admin-modal-icon" aria-hidden="true"><svg>...</svg></div>
        <h2 class="admin-modal-title" id="modal-title">Delete 3 users?</h2>
        <p class="admin-modal-description">This action cannot be undone. All associated data will be permanently removed.</p>
      </div>
      <button class="admin-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="admin-modal-body">
      <label class="admin-modal-confirm">
        <input type="checkbox" required>
        <span>I understand this is irreversible</span>
      </label>
    </div>
    <div class="admin-modal-footer">
      <button class="admin-modal-btn admin-modal-btn--cancel">Cancel</button>
      <button class="admin-modal-btn admin-modal-btn--destructive" data-confirm-delete>Delete permanently</button>
    </div>
  </div>
</div>

<!-- Slideover -->
<div class="admin-slideover-overlay" data-slideover-overlay hidden></div>
<div class="admin-slideover" data-slideover="user-detail" role="dialog" aria-modal="true" aria-labelledby="slideover-title">
  <div class="admin-slideover-header">
    <h2 class="admin-slideover-title" id="slideover-title">User Details</h2>
    <button class="admin-slideover-close" aria-label="Close">&times;</button>
  </div>
  <div class="admin-slideover-body" data-slideover-content></div>
  <div class="admin-slideover-footer">
    <button class="admin-modal-btn admin-modal-btn--cancel">Close</button>
    <button class="admin-modal-btn admin-modal-btn--confirm">Save Changes</button>
  </div>
</div>
```

---

## Implementation Checklist (Admin Pages)

- [ ] Admin shell layout (topbar + sidebar + main)
- [ ] Responsive sidebar (slide-over on mobile)
- [ ] Data tables with sortable, filterable columns
- [ ] Sticky first column + header on tables
- [ ] Row selection + bulk action bar
- [ ] Search + multi-select filters in toolbar
- [ ] Pagination with page size selector
- [ ] Confirmation modals for destructive actions
- [ ] Slideover panels for detail/edit views
- [ ] Settings forms with validation + toggles
- [ ] Billing plan cards with popular badge
- [ ] Metric cards with sparklines
- [ ] Chart cards with period selector
- [ ] User/team card grid (alternative to tables)
- [ ] Toast notifications for async actions
- [ ] Keyboard navigation: Tab through all interactive
- [ ] Focus trap in modals/slideovers
- [ ] ARIA on tables (sort, filter), modals, slideovers
- [ ] Reduced motion: instant transitions
- [ ] High contrast: visible borders
- [ ] URL sync for filters/pagination/sort
- [ ] Server-side pagination for 10k+ rows

---

## Related Files
- `MASTER.md` — Base design system (fallback for all rules not overridden here)
- `pages/dashboard.md` — Dashboard overrides (leader-facing, not admin)
- `pages/training.md` — Training overrides (member-facing)
- `/src/app/admin/` — Next.js App Router implementation
- `/src/components/admin/` — Shared admin components