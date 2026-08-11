# Funnel OS — Frontend UI/UX Research Report

**Date:** 2026-07-03  
**Project:** Droppii Training OS / Hive Warfare Academy  
**Scope:** 4 new views for Funnel OS feature (Kanban, Analytics, Prospect Detail, Theme consistency)

---

## Executive Summary

The codebase uses Vite + Vanilla JS ES modules with a hash-router SPA pattern. No drag-and-drop or kanban implementations exist yet. The dark luxury theme is well-established via CSS custom properties. This report provides component structures and design recommendations for all 4 Funnel OS views.

**Key finding:** Missing CSS variables `--status-red`, `--status-yellow`, `--status-green`, `--status-blue`, `--surface-hover`, `--border-radius-xs`, and `--brand-gold-bright` are referenced throughout components but not defined in `:root` (see `plan.md` line 62). Must add before implementing new views.

---

## 1. Kanban Board UI

### Current State
- No kanban/drag-drop exists. Leads are displayed as a table (`leads-view.js`).
- Funnel uses vertical pyramid visualization (`funnel-view.js`).

### Recommended Approach — Native HTML5 Drag & Drop

No external library needed. The project has zero JS dependencies beyond Vite. Use native `draggable="true"` + `dragstart`/`dragover`/`drop` events.

**Why not a library:** Adding SortableJS or similar adds a dependency for a feature that needs ~50 lines of native DnD. Kanban in this context only supports single-card drag between columns (not reordering within columns).

### Component Structure

```
kanban-view.js (class KanbanView)
├── render(container)           - loads data, builds board
├── createColumn(column)        - returns column HTML string
├── createProspectCard(prospect) - returns card HTML string
├── handleDragStart/Drop       - native DnD handlers
├── filterBar()                 - status/PSN filter dropdowns
└── API: GET /api/leads?stage=  then PATCH /api/leads/:id { stage }
```

### Column Design
- 5 columns matching funnel stages: **Lead Magnet → Trial → Health Active → Combo → CTV Partner**
- Column header: stage name + count badge + CSS color accent
- Column body: scrollable card list, max-height calc(100vh - 300px)
- Column drop zone: highlight with gold border on dragover

### Prospect Card Design
```
card-header:  [PSN badge] [assigned CTV ID]    [source tag]
card-body:    Name (bold) | Phone | Email
              Last contact date + action icon
card-footer:  risk-level indicator (green/yellow/red dot)
              + quick-action mini-buttons (hidden, show on hover)
```

**Color coding by risk:**
- Green border-left (#00cc66) — healthy, engaged within 48h
- Yellow/amber (#ffaa00) — at-risk, no contact 3-7 days
- Red (#ff4444) — critical, no contact 7+ days, STALL flag

**Data model per card** (from existing leads API + leddddds):
```js
{
  id, name, phone, email,
  stage: 'trial',        // maps to funnel_level
  status: 'contacted',   // new/contacted/qualified/converted/lost
  assigned_ctv_id: 'T-001',
  source: 'Zalo_ads',
  risk_level: 'low',     // computed: last_contact_at vs now
  last_contact_at: '...',
  quiz_answers: {}       // if exists, show partial summary
}
```

### PSN Leader vs Admin View Differences
| Aspect | Admin View | PSN Leader View |
|--------|-----------|-----------------|
| Column scope | All PSNs | Own PSN only |
| Card actions | Assign/unassign any CTV, change CTV role | Reassign within own team only |
| Drag authority | Can drag any card | Can drag only own team's cards |
| Quick actions | Full set (call, message, assign, delete) | Limited (call, message, escalate) |
| Data filter | All PSNs dropdown | Auto-filtered by leader's PSN ID |

**Implementation note:** Pass `userRole` and `psnId` from auth context. Filter `leadsData` client-side for PSN Leader view.

### Responsive Design (Mobile Kanban)
- Breakpoint 768px: columns become **horizontal scroll snap** container
- Each column: min-width 300px, full viewport height
- Hide card footer quick actions on mobile, keep only risk indicator
- Add **touch event polyfill**: touchStart → create ghost element → touchMove → move ghost → touchend → drop
- Simplified mobile card: name + phone + stage badge only

### CSS Variables Needed (add to `:root`)
```css
--status-red: #EF4444;
--status-yellow: #F59E0B;  
--status-green: #22C55E;
--status-blue: #3B82F6;
--status-neutral: #737373;
--surface-hover: #262626;
--border-radius-xs: 2px;
--brand-gold-bright: #FFD700;  /* already defined as --brand-gold-electric */
```

---

## 2. Funnel Analytics View

### Current State
- `funnel-view.js` exists but has a bug: `rates[i].conversion_rate` should be `rates[L${i}]` (plan.md line 61)
- Uses inline style attributes for colors (should use CSS vars)
- Limited to static pyramid + conversion cards + revenue table

### Recommended Enhancements

#### A. Funnel Chart (Pyramid Visualization)
**Current approach is fine:** CSS-sized divs in a vertical column. Enhance with:

1. **Animated entrance:** bars grow from 0 to target width on load (CSS transition)
2. **Hover tooltip:** show absolute count, conversion %, drop-off count
3. **Click-through:** click a tier → filter kanban/leads to that stage

**Recommendation:** Keep CSS-based pyramid. It's simpler than SVG/Chart.js and consistent with the existing FunnelView approach. The `funnel-tier` class already has `transition: all 0.3s` — just add `width` animation.

```css
.funnel-tier {
  animation: funnel-grow 0.6s ease-out forwards;
  transform-origin: top center;
}
@keyframes funnel-grow {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}
```

#### B. Drop-off Heatmap / Table
New section below pyramid: table showing for each transition:
- From stage → To stage
- Count entering, count exiting, count dropped
- Drop-off % (most important metric)

```html
<table class="data-table">
  <thead>
    <tr><th>Chuyển đổi</th><th>Vào</th><th>Ra</th><th>Mất</th><th>Tỷ lệ mất</th></tr>
  </thead>
  <tbody>
    <!-- filled from rates[L0], rates[L1], etc. -->
  </tbody>
</table>
```

**Color coding drop-off cells:**
- < 20% drop-off: green (#00cc66)
- 20-40%: yellow (#ffaa00)  
- > 40%: red (#ff4444)

#### C. Trend Charts (In/Out Per Stage Over Time)
Use existing **Sparkline component** (`sparkline.js`) — already handles SVG line charts with gradient fills and trend arrows.

**New API endpoint needed:** `GET /api/analytics/funnel/trend?range=30d` returning:
```json
{
  "L0": [{date: "2026-06-01", in: 45, out: 12}, ...],
  "L1": [...],
  ...
}
```

**Layout:** 5 sparkline cards in a grid, 2 per row on desktop, 1 on mobile. Each card shows:
- Stage name + icon
- Sparkline for "in" count (gold)
- Sparkline for "out" count (muted gray)
- Net change indicator at bottom

#### D. PSN-Level Aggregation
Add a PSN filter dropdown above the analytics section. When a PSN Leader selects their PSN, the funnel recalculates with only that PSN's member data.

**API:** `GET /api/analytics/funnel?psn_id=T-001`

---

## 3. Prospect Detail View

### Current State
- No dedicated prospect detail view exists
- Lead detail modal exists in `leads-view.js` (showLeadDetail, lines 206-296)
- KPI detail modal exists in `kpi-modal.js` (documents the pattern)

### Recommended Component Structure

```
prospect-detail-view.js (class ProspectDetailView)
├── render(container)           - loads prospect, builds view
├── loadProspect(id)            - GET /api/leads/:id
├── renderInfoSection()         - contact info + linked member
├── renderJourneyTimeline()     - activity timeline events
├── renderFollowUpScheduler()   - next follow-up form
├── renderQuickActions()        - call, zalo, assign buttons
├── bindEvents()
└── API: GET /api/leads/:id
     GET /api/leads/:id/journey
     PATCH /api/leads/:id       (assign, update status)
     POST /api/leads/:id/follow-ups
```

### Section Breakdown

#### Header Section
```
[← Back]  Prospect #ID — Name
[Risk: ● Low] [Stage: Trial] [Status: Contacted]
[Assigned: T-001] [PSN: T-010]
```

#### Contact Info Card
Auto-hide masked fields for non-Admin roles:
| Field | Admin View | PSN Leader View | Member View |
|-------|-----------|-----------------|-------------|
| Phone | Full | Full | Masked (***) |
| Email | Full | Full | Hidden |
| Address | Full | Hidden | Hidden |
| Quiz answers | Full JSON | Hidden | Hidden |

#### Activity Timeline
Extend `showLeadDetail` journey table (leads-view.js:352-368) into a proper timeline component:

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot" style="background: var(--status-blue)"></div>
    <div class="timeline-content">
      <div class="timeline-time">15/07/2026 14:30</div>
      <div class="timeline-event">Zalo message sent</div>
      <div class="timeline-actor">T-001 Nguyễn Văn A</div>
    </div>
  </div>
  <!-- more items, newest first -->
</div>
```

Style: left border with gold, dots at each event, alternating sides optional (keep single-side for mobile).

#### Follow-up Scheduler
Simple form:
```html
<div class="followup-card">
  <h4>Lên lịch follow-up</h4>
  <input type="datetime-local" class="filter-input">
  <select class="filter-select">
    <option>Cuộc gọi Zalo</option>
    <option>Messenger</option>
    <option>Email</option>
    <option>Gặp trực tiếp</option>
  </select>
  <textarea class="filter-input" placeholder="Ghi chú..."></textarea>
  <button class="btn-primary">Lên lịch</button>
</div>
```

#### Quick Actions Bar (sticky below header)
```
[📞 Call] [💬 Zalo] [📋 Assign] [📝 Add Note] [🗑️ Mark Lost]
```

Each button:
- **Call:** Opens `tel:` link (opens phone app on mobile)
- **Zalo:** Opens `https://zalo.me/{phone}` if phone exists
- **Assign:** Opens mini dropdown of available CTVs in same PSN
- **Add Note:** Inline textarea + submit (POST to `/api/leads/:id/notes`)
- **Mark Lost:** Confirm dialog → PATCH status='lost'

**Permission gating:** PSN Leader can only assign to members in their own PSN. Admin can assign anywhere.

---

## 4. Dark Luxury Theme Consistency

### Existing CSS Token System

The theme is well-structured in `style.css:3-66`:

```css
:root {
  /* Brand */
  --brand-bg: #0A0A0A;              /* main background */
  --brand-card: #1A1A1A;            /* card surfaces */
  --brand-gold: #C9A200;            /* primary accent */
  --brand-gold-electric: #FFD700;   /* bright accent */
  --brand-amber: #FFB300;           /* warning tone */

  /* Gray scale */
  --gray-50 to --gray-900;          /* 10 levels */

  /* Semantic */
  --surface-primary: var(--brand-bg);
  --surface-secondary: var(--brand-card);
  --surface-tertiary: var(--gray-800);
  --surface-overlay: rgba(26,26,26,0.95);
  --text-primary/secondary/tertiary;
  --border-primary/secondary/accent;

  /* Typography */
  --font-display: "Playfair Display", serif;   /* headings */
  --font-body: "Inter", sans-serif;            /* body */
  --font-mono: "JetBrains Mono", monospace;    /* numbers, code */

  /* Layout */
  --nav-height: 64px;
  --nav-width-desktop: 280px;
  --spacing-xs to --spacing-2xl;
  --radius-sm to --radius-xl;
  --shadow-sm to --shadow-luxury;
}
```

### Guidelines for New Components

1. **Use `var(--brand-gold)` for primary actions and accents.** Never use raw gold values like `#C9A200` directly — reference the variable. This allows one-place theme changes.

2. **Card surfaces:** always `var(--surface-secondary)` bg + `var(--border-primary)` border + `var(--shadow-luxury)` shadow.

3. **Typography hierarchy:**
   - Page titles: `--font-display`, color `--text-accent-bright` (gold)
   - Card titles: `--font-display`, color `--text-accent` (darker gold)
   - Body: `--font-body`, color `--text-primary`
   - Secondary/meta: `--font-body`, color `--text-secondary`
   - Numbers/monetary: `--font-mono`

4. **Status colors:** Use `--brand-amber` for warning, gold for neutral accent. Define:
   ```css
   --status-success: #22C55E;   /* green */
   --status-warning: #F59E0B;   /* amber */
   --status-error: #EF4444;     /* red */
   --status-info: #3B82F6;      /* blue */
   ```

5. **Hover states:** Consistent pattern across all interactive elements:
   ```css
   .interactive:hover {
     background: rgba(201, 162, 0, 0.05);
     border-color: var(--brand-gold);
   }
   ```

6. **Gold glow effect** for primary CTAs:
   ```css
   .btn-primary {
     background: var(--brand-gold);
     box-shadow: 0 0 20px rgba(201, 162, 0, 0.3);
   }
   ```

### Component Pattern Established in Codebase

Every component follows this pattern (observed across `kpi-card.js`, `psn-card.js`, `filter-chips.js`):
1. Class constructor takes config
2. `render()` generates HTML template string using `var(--...)` tokens
3. `addStyles()` injects a `<style>` tag if not already present (guarded by ID)
4. `bindEvents()` attaches event listeners via event delegation on container
5. Static method `addStyles()` + `bindKeyboardEvents()` called on module load

**Follow this exactly for new components.**

### Modal Pattern
All modals use the same structure (from `style.css:557-628` and `kpi-modal.js`):
```css
.modal-overlay { rgba(0,0,0,0.7) + backdrop-filter:blur(4px) }
.modal-content { centered, surface-primary bg, border-primary, radius-lg, shadow }
.modal-header { flex row, sticky, border-bottom }
.modal-close { hover: surface-tertiary bg }
.modal-body { overflow-y:auto, scrollable }
```
Add ESC close + overlay click close.

---

## 5. Responsive Design

### Existing Breakpoints
- **Desktop:** > 768px (referenced as default)
- **Tablet:** 768px (fold breakpoint for nav)
- **Mobile:** 480px (small adjustments)

### Recommended Responsive Patterns for Funnel OS

#### Kanban (Horizontal Scroll on Mobile)
```css
@media (max-width: 768px) {
  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }
  .kanban-column {
    min-width: 300px;
    max-width: 85vw;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
  .prospect-card { min-width: unset; }
}
```

#### Funnel Analytics (Stacked on Mobile)
```css
@media (max-width: 768px) {
  .funnel-pyramid { max-width: 100%; }
  .funnel-tier { min-width: 150px; }
  .trend-cards-grid { grid-template-columns: 1fr; }
}
```

#### Prospect Detail (Full-width Cards)
```css
@media (max-width: 768px) {
  .prospect-header { flex-direction: column; }
  .quick-actions-bar { flex-wrap: wrap; }
  .timeline { padding-left: var(--spacing-md); }
  .followup-scheduler { grid-template-columns: 1fr; }
}
```

#### Table Responsiveness (Existing Pattern)
All tables use `.table-wrapper` with `overflow-x: auto` (style.css:463-467). Maintain this pattern. On mobile, hide non-essential columns via CSS:
```css
@media (max-width: 480px) {
  .data-table .col-hide-mobile { display: none; }
}
```

### Touch Targets
- Minimum 44px height for all interactive elements (WCAG 2.5.5)
- Increase padding on mobile: `btn-sm` → larger touch target
- Kanban cards: min 44px height on touch devices

---

## 6. File Structure Recommendation

```
src/dashboard/
├── funnel-view.js              # EXISTING — fix rates bug
├── kanban-view.js              # NEW — ~200 lines, class KanbanView
├── funnel-analytics.js         # NEW OR extend funnel-view.js — analytics dashboard
├── prospect-detail.js          # NEW — ~250 lines
├── style.css                   # UPDATE — fix missing vars, add kanban styles
│
├── components/
│   ├── prospect-card.js        # NEW — reusable card for kanban + detail
│   ├── timeline.js             # NEW — activity timeline component
│   └── existing components...
│
└── plans/260702-0137-design-ui-for-stitch/plan.md  # REFERENCE
```

### Key Bugs to Fix First (from plan.md lines 61-65)
1. `funnel-view.js:82` — `rates[i].conversion_rate` → `rates[L${i}].conversion_rate`
2. Add 6 missing CSS vars to `:root`
3. `router.js:259-270` — `renderKPIPage()` doesn't call `.render(container)` on KPIPanel instance
4. Duplicate `@keyframes spin` — consolidate to style.css only, remove from component files

---

## 7. API Contract Summary

| Feature | GET | PATCH | POST |
|---------|-----|-------|------|
| Kanban | `GET /api/leads?stage=&psn_id=` | `PATCH /api/leads/:id { stage, assigned_ctv_id }` | — |
| Funnel Analytics | `GET /api/analytics/funnel?psn_id=` | — | — |
| Funnel Trends | `GET /api/analytics/funnel/trend?range=30d&psn_id=` | — | — |
| Prospect Detail | `GET /api/leads/:id`, `GET /api/leads/:id/journey` | `PATCH /api/leads/:id { status, assigned_ctv_id }` | `POST /api/leads/:id/notes` |
| Follow-up | — | — | `POST /api/leads/:id/follow-ups` |

**Auth pattern** (consistent across all views): `Authorization: Bearer ${localStorage.getItem('auth_token')}`

---

## 8. Implementation Order

1. **Fix existing bugs** (CSS vars, funnel rates, KPI render) — 30 min
2. **Kanban Board** — 3-4 hours (new feature, highest user value)
3. **Prospect Detail View** — 2-3 hours (extends existing lead modal pattern)
4. **Funnel Analytics Enhancements** (trend charts, drop-off table) — 2-3 hours
5. **Theme polish + responsive fine-tuning** — 1-2 hours

---

## 9. Unresolved Questions

1. **Auth context propagation:** How is the current user's `psnId` and `role` passed to views? Currently spreads across `localStorage.auth_token` + API responses. Should add a user context singleton.
2. **Zalo Web SDK integration:** Quick-action Zalo button may need Zalo Mini App SDK vs simple URL scheme (`zalo://`). Needs confirmation.
3. **Real-time updates:** Should kanban/views poll for updates? Current code loads once. Consider adding WebSocket or 30-second polling for kanban.
4. **Prospect-to-Member conversion flow:** When a prospect is marked "converted" (CTV Partner), should it auto-create a member record? Or is that a separate admin action?
5. **Funnel stages defined by API or frontend?** Need to verify if stage names (Lead Magnet, Trial, etc.) come from backend or are frontend-only.
