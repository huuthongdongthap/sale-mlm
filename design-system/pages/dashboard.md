# Dashboard Page Overrides

> **OVERRIDE SCOPE:** This file overrides MASTER.md rules ONLY for the Dashboard page.
> Rules not explicitly overridden here fall back to MASTER.md.

---

## Page Context
- **Route:** `/dashboard`
- **Purpose:** Main command center for MLM leaders — PSN Health, KPI tracking, member management, alerts
- **Primary User:** Upline leaders, team captains
- **Device Priority:** Desktop-first (admin work), mobile-responsive

---

## Layout Overrides

### Container
```css
.dashboard-container {
  max-width: 1440px;  /* MASTER: 1200px → OVERRIDE: wider for data density */
  margin: 0 auto;
  padding: var(--space-lg) var(--space-xl);
}
```

### Grid System
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 280px 1fr;  /* Fixed sidebar + fluid main */
  gap: var(--space-lg);
  min-height: 100dvh;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

### Sidebar
- Width: `280px` fixed (MASTER: collapsible) — Dashboard needs persistent navigation
- Background: `var(--color-surface-elevated)` with subtle right border
- Position: `sticky`, `top: 0`, `height: 100dvh`

---

## Component Overrides

### PSN Health Cards (Critical Dashboard Widget)
```css
.psn-health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
}

.psn-health-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  transition: all 200ms ease;
}

.psn-health-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-lg);
}

/* PSN State Badges — override MASTER badge styles */
.psn-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.psn-badge--tử-địa    { background: #7C2D12; color: #FEF2F2; }  /* red-900/50 */
.psn-badge--trận-địa  { background: #9A3412; color: #FEF2F2; }  /* red-800/50 */
.psn-badge--trục-địa  { background: #C2410C; color: #FFF7ED; }  /* orange-700/50 */
.psn-badge--diễn-địa  { background: #C2410C; color: #FFF7ED; }  /* orange-700/50 */
.psn-badge--nghịch-địa { background: #854D0E; color: #FEF9C3; } /* amber-800/50 */
.psn-badge--trọng-địa  { background: #713F12; color: #FEF9C3; } /* amber-700/50 */
.psn-badge--hiểm-địa  { background: #166534; color: #F0FDF4; }  /* green-800/50 */
.psn-badge--sinh-địa  { background: #15803D; color: #F0FDF4; }  /* green-700/50 */
.psn-badge--tán-địa   { background: #1D4ED8; color: #EFF6FF; }  /* blue-700/50 */
```

### KPI Tracker Cards
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-foreground);
}

.kpi-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-xs);
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-top: var(--space-sm);
}

.kpi-trend--up   { color: var(--color-success); }
.kpi-trend--down { color: var(--color-destructive); }
.kpi-trend--flat { color: var(--color-muted-foreground); }
```

### Alert Panel (Right Sidebar / Slide-over on Mobile)
```css
.alert-panel {
  position: sticky;
  top: var(--space-xl);
  height: fit-content;
  max-height: calc(100dvh - var(--space-2xl));
  overflow-y: auto;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-md);
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-foreground);
  line-height: 1.4;
}

.alert-meta {
  font-size: 12px;
  color: var(--color-muted-foreground);
  margin-top: 2px;
}
```

---

## Typography Overrides

### Dashboard-Specific Scale
```css
.dashboard-title {
  font-size: 28px;  /* MASTER: 24px → OVERRIDE: larger for prominence */
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

.section-title {
  font-size: 18px;  /* MASTER: 16px → OVERRIDE: stronger hierarchy */
  font-weight: 600;
  color: var(--color-foreground);
  margin-bottom: var(--space-md);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.card-subtitle {
  font-size: 12px;
  color: var(--color-muted-foreground);
}
```

---

## Color Overrides

### Data Visualization Colors (Dashboard-specific)
```css
:root {
  /* Chart series colors — optimized for dark background, color-blind safe */
  --chart-1: #F59E0B;  /* amber-500 — primary series */
  --chart-2: #3B82F6;  /* blue-500 */
  --chart-3: #10B981;  /* emerald-500 */
  --chart-4: #EF4444;  /* red-500 */
  --chart-5: #8B5CF6;  /* violet-500 */
  --chart-6: #EC4899;  /* pink-500 */
  
  /* Semantic status — aligned with PSN health states */
  --status-critical: #EF4444;   /* red-500 */
  --status-warning: #F59E0B;    /* amber-500 */
  --status-info:    #3B82F6;    /* blue-500 */
  --status-success: #10B981;    /* emerald-500 */
  --status-neutral: #6B7280;    /* gray-500 */
}
```

---

## Interaction Overrides

### Hover States (Desktop)
```css
/* Table rows */
.dashboard-table tbody tr:hover {
  background: var(--color-surface-hover);
}

/* Card lift — more pronounced than MASTER for data density */
.psn-health-card:hover,
.kpi-card:hover,
.member-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-gold-500);
}

/* Sidebar nav items */
.sidebar-nav-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-gold-500);
}
```

### Loading States
```css
.skeleton-dashboard {
  /* Dashboard-specific skeleton: matches card grid layout */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-md);
}
```

---

## Responsive Overrides

### Mobile (< 768px)
```css
@media (max-width: 767px) {
  .dashboard-container {
    padding: var(--space-md);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 250ms ease;
  }
  
  .sidebar--open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    opacity: 0;
    visibility: hidden;
    transition: all 250ms ease;
  }
  
  .sidebar-overlay--visible {
    opacity: 1;
    visibility: visible;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .psn-health-grid {
    grid-template-columns: 1fr;
  }
  
  .alert-panel {
    position: static;
    max-height: none;
  }
}
```

### Tablet (768px - 1024px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .psn-health-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Accessibility Overrides

### Focus Management
```css
.dashboard-skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-gold-500);
  color: white;
  border-radius: 6px;
  z-index: 100;
  font-weight: 600;
}

.dashboard-skip-link:focus {
  top: var(--space-md);
}

/* Focus rings — gold for dashboard brand alignment */
.dashboard *:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.sidebar-nav-item:focus-visible,
.kpi-card:focus-visible,
.psn-health-card:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}
```

### ARIA Live Region for Alerts
```html
<!-- In alert panel -->
<div role="region" aria-live="polite" aria-label="Real-time alerts" class="alert-panel">
  <!-- alert items -->
</div>
```

---

## Anti-Patterns (Dashboard-Specific)

| ❌ Don't | ✅ Do |
|----------|-------|
| Emoji badges for PSN states | Semantic color + text badges |
| Fixed-height cards (content overflow) | `min-height` with flex grow |
| Horizontal scroll on mobile KPI grid | Single column stack |
| Hover-only tooltips on data points | Click/tap to reveal + hover |
| All caps for long labels | Title case, max 2 words |
| Gold on gold (low contrast) | Gold on dark surface (≥4.5:1) |

---

## Implementation Notes

1. **Sidebar state** — Persist open/closed in `localStorage` (key: `dashboard.sidebar.open`)
2. **Alert dismissal** — Swipe to dismiss on mobile, X button on desktop
3. **Data refresh** — Auto-refresh KPI cards every 60s, PSN every 5min (configurable)
4. **Keyboard nav** — `Tab` through sidebar → main → alert panel; `Esc` closes sidebar on mobile
5. **Print stylesheet** — Hide sidebar, show all cards in single column, remove shadows

---

## Related Files
- `MASTER.md` — Base design system (fallback for all rules not overridden here)
- `/hive-academy/SPEC.md` — Hive Academy training pages (separate overrides)
- `components/dashboard/` — Implementation components