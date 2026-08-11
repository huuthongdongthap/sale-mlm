# Funnel Analytics Visualization — Tech Stack Research

**Date:** 2026-07-03
**Project:** Droppii Sales Training OS (droppii-training-os)
**Context:** `/Users/mac/mekong-cli/SALE MLM/`

---

## 1. Existing Stack (scoped from `docs/system-architecture.md`)

| Layer | Current | Notes |
|-------|---------|-------|
| Backend runtime | Cloudflare Workers (V8 isolates) | Extensible to Express.js if needed |
| Database | Cloudflare D1 (SQLite) | D1-compatible schema |
| Frontend | Vite + Vanilla JS | **No React/Vue framework** |
| Dashboard | Single Page App, dark luxury theme | 5 views: Members, KPI, PSN Health, Alerts, Training |
| Build | Vite static assets → Cloudflare Pages | No compiled framework |

**Implication:** Libraries must work with **Vanilla JS** (no React/Vue component wrapper required).

---

## 2. Funnel Chart Libraries

### 2.1 ECharts (Apache) — ⭐ RECOMMENDED

| Property | Value |
|----------|-------|
| License | Apache 2.0 (permissive, no attribution required) |
| Bundle size | ~300KB full build, tree-shakeable |
| Funnel support | Native `funnel` chart type with rich configuration |
| Framework support | Vanilla JS, React, Vue, Angular wrappers |
| Docs | https://echarts.apache.org/en/option.html#series-funnel |
| Rendering | SVG + Canvas hybrid (auto-switch by chart complexity) |
| Animations | Built-in enter/update/exit animations |
| Real-time | `setOption` with `notMerge: false` for incremental updates |

**Pros:**
- Native funnel chart type — no plugin needed
- Supports comparison (multiple funnel series)
- Extensive theming (dark theme already in project)
- Large community, well-maintained
- Works standalone `<script>` tag or ES module

**Cons:**
- 300KB is heavy for a dashboard widget (consider lazy-loaded CDN)
- API surface is large (2000+ options) — learning curve

**Best fit:** Production-grade funnel with labels, conversion rates, comparisons across time periods.

---

### 2.2 ApexCharts

| Property | Value |
|----------|-------|
| License | MIT |
| Bundle size | ~160KB gzipped |
| Funnel support | Native `funnel` chart type |
| Framework support | Vanilla JS, React, Vue, Angular |
| Docs | https://apexcharts.com/docs/chart-types/funnel/ |
| Rendering | SVG |

**Pros:**
- Native funnel support
- Cleaner API than ECharts for simple use cases
- MIT license
- Responsive out-of-the-box

**Cons:**
- Less mature than ECharts for complex multi-series
- SVG-only (slower with large data volumes)
- Less control over animation timing

**Best fit:** Clean, simple funnel charts with modest customization needs.

---

### 2.3 Chart.js + Plugin

| Property | Value |
|----------|-------|
| License | MIT |
| Bundle size | ~60KB core, funnel plugin adds ~15KB |
| Funnel support | Via `chartjs-chart-funnel` plugin |
| Framework support | Vanilla JS, React, Vue wrappers |
| Rendering | Canvas (blazing fast for large datasets) |
| Docs | https://chartjs.org/ |

**Pros:**
- Smallest bundle of the three options
- Canvas rendering — no SVG node overhead
- Very simple API

**Cons:**
- Funnel support requires third-party plugin (`chartjs-chart-funnel`)
- No comparison funnel (2 series side-by-side) in plugin
- Less customization for funnel shape/labels/arrows

**Best fit:** Budget-conscious choice; funnel is secondary visual, not primary.

---

### 2.4 D3.js (D3 Shape)

| Property | Value |
|----------|-------|
| License | ISC |
| Bundle size | ~300KB (only import what you need) |
| Funnel support | No native chart; build from `d3-shape` trapezia |
| Framework support | Any (DOM-level) |
| Rendering | SVG (user-controlled) |

**Pros:**
- Total control over funnel geometry, animations
- Framework-agnostic
- Follows data-join pattern

**Cons:**
- Requires significant custom code (~50-100 lines minimum per chart)
- No "drop-in" funnel chart; build from primitives
- Steeper learning curve

**Best fit:** Custom funnel with unique visual design requirements.

---

### 2.5 Funnel.js (Specialized)

| Property | Value |
|----------|-------|
| License | MIT |
| Bundle size | ~20KB |
| Funnel support | **Dedicated funnel library** (built on D3) |
| Framework support | Vanilla JS, jQuery |
| Rendering | SVG |

**Pros:**
- Smallest, most focused option
- Built specifically for funnel/pipeline charts
- Trivial API: `new FunnelChart(el, data)`

**Cons:**
- Less actively maintained
- Smaller community
- Limited styling options compared to ECharts/ApexCharts

**Best fit:** Lightweight dashboards where funnel is the primary chart.

---

## 3. Kanban Board Libraries

### 3.1 HelloKanban — ⭐ RECOMMENDED

| Property | Value |
|----------|-------|
| License | MIT |
| Bundle size | Zero dependencies, single JS file |
| Drag-drop | Native HTML5 drag & drop |
| DOM | Creates its own DOM (no framework dependency) |
| GitHub | https://github.com/YouCanBookMe/hellokanban |
| Rendering | DOM-based (HTML/CSS columns) |

**Pros:**
- Zero framework dependency — fits Vanilla JS project perfectly
- MIT license, no attribution required
- Small codebase (~200 lines), easy to fork/customize
- CSS-customizable to match dark luxury theme
- Column-based structure matches MLM pipeline stages

**Cons:**
- Minimal features (no swimlanes, no card linking)
- Less active maintenance
- Card data model is basic (title + description)

**Best fit:** Simple pipeline/member-stage tracking board that integrates cleanly into existing dashboard.

---

### 3.2 Custom HTML5 Drag & Drop (No Library)

| Property | Value |
|----------|-------|
| License | Native browser API |
| Bundle size | 0KB — no library |
| Drag-drop | HTML5 native `draggable` + `dragstart`/`drop` events |
| Rendering | CSS Grid / Flexbox columns |

**Pros:**
- Zero dependency, zero bundle cost
- Full design control to match project theme
- No version conflicts
- Easier to integrate with existing API data calls

**Cons:**
- More implementation work (~150-200 lines of custom code)
- Need to handle: touch events, scroll, accessibility, animations
- Mobile drag-drop is notorious

**Best fit:** When board is simple and you want zero third-party risk.

---

## 4. Pipeline Chart (Sankey / Process Flow)

### 4.1 ECharts Sankey

ECharts includes a **sankey** chart type (`series-sankey`) ideal for showing member flow through MLM stages:
- Input: stage labels + flow volume between stages
- Renders as SVG/Canvas with gradient links
- Supports click-to-drill-down

### 4.2 Frappe Gantt / Frappe Charts

- Open source, MIT license
- Frappe Charts includes sankey
- Lightweight (~30KB)
- Built for dashboard contexts

---

## 5. Recommendation Matrix

| Need | Recommended Library | Alternative | Why |
|------|-------------------|-------------|-----|
| Funnel chart (primary) | **ECharts** | ApexCharts | Native funnel type, comparison support, dark theme, Apache 2.0 |
| Funnel chart (light) | **Funnel.js** | chartjs-chart-funnel | Minimal bundle if funnel is the only complex chart |
| Kanban / Pipeline board | **HelloKanban** | Custom HTML5 DnD | Zero framework deps, MIT, CSS-themeable |
| Sankey / Flow diagram | **ECharts sankey** | — | If using ECharts for funnel, reuse for sankey (zero extra cost) |

---

## 6. License Summary

| Library | License | Commercial Use | Modification |
|---------|---------|---------------|--------------|
| ECharts | Apache 2.0 | ✅ Yes | ✅ Full |
| ApexCharts | MIT | ✅ Yes | ✅ Full |
| Funnel.js | MIT | ✅ Yes | ✅ Full |
| HelloKanban | MIT | ✅ Yes | ✅ Full |
| Chart.js | MIT | ✅ Yes | ✅ Full |
| Frappe Charts | MIT | ✅ Yes | ✅ Full |
| D3.js | ISC | ✅ Yes | ✅ Full (functionally same as MIT) |

All recommended libraries support commercial use with full modification rights.

---

## 7. Express.js Integration Pattern

Since the project uses REST API (currently CF Workers, extensible to Express.js):

```javascript
// 1. Backend endpoint (Express or Workers)
app.get('/api/analytics/funnel', (req, res) => {
  const funnelData = calculateFunnelStages(db);
  res.json({
    stages: [
      { name: 'Leads', count: 150 },
      { name: 'Contacted', count: 120 },
      { name: 'Demos', count: 80 },
      { name: 'Orders', count: 45 },
      { name: 'Tier-1', count: 12 },
    ]
  });
});

// 2. Frontend fetch (Vanilla JS)
const resp = await fetch('/api/analytics/funnel');
const { stages } = await resp.json();

// 3. Render with ECharts
echarts.init(el).setOption({
  series: [{ type: 'funnel', data: stages }]
});

// 4. Render Kanban
const kanban = new HelloKanban(el, {
  lanes: [
    { id: 'leads', title: 'Leads', cards: [...] },
    { id: 'contacted', title: 'Contacted', cards: [...] },
  ]
});
```

**CORS:** Already enabled in `src/server.js` (`app.use(cors())`) — no blocking for frontend fetching.

---

## 8. Performance Considerations for Real-time Updates

| Concern | Mitigation |
|---------|-----------|
| Funnel re-render on data change | ECharts `setOption` with `notMerge: false` — efficient diffing |
| Kanban drag overhead | HelloKanban uses native DnD, no virtual DOM — cheapest option |
| Large member datasets (500+) | Canvas rendering (Chart.js) or Lazy loading chunks |
| Dashboard load time | Lazy-load chart libs only on analytics tab (`import()` dynamic) |
| Cloudflare Workers CPU time | Pre-compute funnel aggregates in D1 query, return ready-to-plot JSON |

---

## 9. Final Recommendation

```
┌────────────────────────────────────────────────────────────────┐
│  STACK DECISION FOR SALE MLM FUNNEL ANALYTICS                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Funnel Chart:      ECharts (Apache 2.0, native funnel type)  │
│  Kanban Board:      HelloKanban (MIT, zero deps, Vanilla JS)   │
│  Flow Diagram:      ECharts Sankey (reuse same library)        │
│  Integration:       REST API → fetch() → Vanilla JS            │
│  Bundle impact:     ~300KB ECharts (lazy-loaded) + ~0KB kanban │
│  Dark theme:        ECharts supports dark theme out-of-box     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Rationale:**
- ECharts covers funnel + sankey in one library (no multiple chart libs)
- HelloKanban has zero framework deps — fits Vanilla JS dashboard perfectly
- Both Apache 2.0/MIT — no legal risk
- Real-time: ECharts incremental `setOption` is performant; HelloKanban is DOM-native drag-drop

---

## Unresolved Questions

1. **Tradeoff HelloKanban vs Custom DnD?** If the MLM pipeline needs custom drag-drop rules (e.g., only moving members forward, not backward), custom HTML5 DnD gives more control at ~200 LOC cost.
2. **Server-side funnel computation?** Should backend return pre-aggregated stage counts, or raw member arrays and let frontend aggregate? Pre-aggregated is cleaner for Workers 10ms CPU limit.
3. **Mobile support for kanban?** HelloKanban uses HTML5 DnD which has poor mobile support — need to evaluate if mobile board interaction is required.
4. **Real-time update mechanism** — WebSocket push vs polling? Cloudflare Workers doesn't support WebSocket session state easily; polling every 30s from client is simpler first pass.
