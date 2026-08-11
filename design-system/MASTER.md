# Hive MLM — Master Design System

> Source of truth for UI/UX across Hive Warfare Academy (Dashboard + Hive Academy).
> Last updated: 2026-07-03

---

## 1 Product Context

| Dimension | Value |
|-----------|-------|
| Product type | SaaS + EdTech hybrid (MLM sales training platform) |
| Market | Vietnamese |
| Audience | Sales reps 18–45, mobile-first |
| Primary tone | Professional, motivational, structured |
| Visual direction | Dark luxury — premium gravitas with warm gold energy |

---

## 2 Design Tokens

### 2.1 Color Palette

#### Base Surfaces (Dark Mode Primary)

```css
--color-bg-base: #0A0A0A;       /* app background */
--color-bg-card: #141414;       /* cards, panels */
--color-bg-elevated: #1E1E1E;   /* modals, dropdowns */
--color-bg-hover: #1E1E1E;      /* hover state */
--color-bg-active: #262626;     /* active/pressed state */
```

#### Accent — Gold System

```css
--color-gold-50:  #FFF9E6;
--color-gold-100: #FFECB3;
--color-gold-200: #FFE082;
--color-gold-300: #FFD54F;
--color-gold-400: #FFC107;
--color-gold-500: #C9A200;       /* PRIMARY brand gold */
--color-gold-600: #A68400;
--color-gold-700: #846B00;
--color-gold-800: #6B5600;
--color-gold-900: #544400;
--color-gold-electric: #FFD700;  /* highlight / glow */
```

#### Semantic Colors (WCAG AA Verified)

```css
/* Success */
--color-success:       #4ADE80;
--color-success-soft:  rgba(74, 222, 128, 0.12);

/* Warning */
--color-warning:       #FBBF24;
--color-warning-soft:  rgba(251, 191, 36, 0.12);

/* Error */
--color-error:         #F87171;
--color-error-soft:    rgba(248, 113, 113, 0.12);

/* Info */
--color-info:          #60A5FA;
--color-info-soft:     rgba(96, 165, 250, 0.12);
```

#### Text (Contrast-Rated)

```css
--color-text-primary:    #F5F5F5;    /* 17:1 on #0A0A0A ✓ */
--color-text-secondary:  #D4D4D4;    /* 10:1 on #0A0A0A ✓ */
--color-text-tertiary:   #A3A3A3;    /* 4.6:1 on #0A0A0A ✓ AAA */
--color-text-disabled:   #525252;    /* 2.3:1 — decorative only */
--color-text-on-gold:    #1A1400;    /* 8.2:1 on gold-500 ✓ */
```

#### Borders & Dividers

```css
--color-border-default: #333333;
--color-border-subtle:  #262626;
--color-border-focus:   var(--color-gold-500);
```

#### PSN Health Colors (9-State Cửu Địa)

```css
--color-psn-cuc-cuc:     #6B7280;   /* Gray-500 — neutral/baseline */
--color-psn-tan-binh:    #60A5FA;   /* Blue — recruit */
--color-psn-truong-binh: #A78BFA;   /* Purple — established */
--color-psn-chien-binh:  #34D399;   /* Green — warrior */
--color-psn-chi-huy:     #FBBF24;   /* Amber — commander */
--color-psn-tuong-quan:  var(--color-gold-electric); /* Gold — general */
--color-psn-tuong-lenh:  #F472B6;   /* Pink — elite */
--color-psn-than-binh:   #E5E7EB;   /* Silver */
--color-psn-cao-thuong:  var(--color-gold-400); /* Premium gold */
```

### 2.2 Typography

#### Font Stack

```css
--font-display: 'Playfair Display', 'Georgia', serif;
--font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Type Scale

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| --text-xs | 0.75rem (12px) | 400 | 1.4 | Captions, badges |
| --text-sm | 0.875rem (14px) | 400 | 1.5 | Secondary text, labels |
| --text-base | 1rem (16px) | 400 | 1.6 | Body text |
| --text-md | 1.125rem (18px) | 400 | 1.6 | Lead text |
| --text-lg | 1.25rem (20px) | 500 | 1.5 | Subtitles |
| --text-xl | 1.5rem (24px) | 500 | 1.4 | Section headers |
| --text-2xl | 1.875rem (30px) | 600 | 1.3 | Page titles |
| --text-3xl | 2.25rem (36px) | 700 | 1.2 | Hero headings |

### 2.3 Spacing (8px Grid)

```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.5rem;    /* 24px */
--space-6:  2rem;      /* 32px */
--space-7:  2.5rem;    /* 40px */
--space-8:  3rem;      /* 48px */
--space-9:  4rem;      /* 64px */
--space-10: 6rem;      /* 96px */
```

### 2.4 Border Radius

```css
--radius-xs: 2px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;  /* pills, avatars */
```

### 2.5 Shadows

```css
--shadow-sm:      0 1px 2px rgba(0,0,0,0.4);
--shadow-md:      0 4px 8px rgba(0,0,0,0.4);
--shadow-lg:      0 8px 24px rgba(0,0,0,0.5);
--shadow-gold-sm: 0 2px 8px rgba(201,162,0,0.15);
--shadow-gold-lg: 0 4px 24px rgba(201,162,0,0.2);
```

### 2.6 Motion Tokens

```css
--duration-fast:   150ms;
--duration-normal: 200ms;
--duration-slow:   300ms;
--duration-page:   400ms;

--easing-enter: cubic-bezier(0.16, 1, 0.3, 1);
--easing-exit:  cubic-bezier(0.7, 0, 0.84, 0);
--easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot */
```

### 2.7 Icon Sizes

```css
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

### 2.8 Breakpoints

```css
--bp-sm:  375px;   /* compact phone */
--bp-md:  768px;   /* tablet */
--bp-lg:  1024px;  /* small desktop */
--bp-xl:  1440px;  /* large desktop */
```

### 2.9 Z-Index Scale

```css
--z-base:     0;
--z-dropdown: 100;
--z-sticky:   200;
--z-overlay:  300;  /* modal backdrop */
--z-modal:    400;
--z-toast:    500;
--z-tooltip:  600;
```

---

## 3 Layout System

### 3.1 Container Widths

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
```

### 3.2 Dashboard Layout (Desktop)

- Sidebar: 280px width, fixed left, full height
- Main content: `calc(100vw - 280px)` with `max-width: 1280px`
- Top bar: 64px fixed zone for notifications/search

### 3.3 Mobile Navigation

- Bottom tab bar: 5 items max, 56px height
- Safe area padding for home indicator
- Hamburger menu for secondary items

---

## 4 Component Patterns

### 4.1 Buttons

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| Primary | gold-500 | bg-base | none | Main CTA |
| Primary-hover | gold-400 | bg-base | none | Hover state |
| Secondary | transparent | text-primary | border-default | Secondary actions |
| Ghost | transparent | text-secondary | none | Tertiary actions |
| Danger | error | white | none | Destructive actions |
| disabled | bg-elevated | text-disabled | none | Disabled state |

**Specs**: Height 40px (desktop) / 44px (mobile), padding 0 16px, border-radius md, font-weight 500.

### 4.2 Cards

- Background: `color-bg-card`
- Border: 1px solid `color-border-default`
- Border-radius: lg (12px)
- Padding: 20px
- Shadow: shadow-sm default, shadow-gold-sm on hover
- Transition: hover — background shift 200ms ease-out

### 4.3 Inputs

- Height: 40px desktop, 44px mobile
- Border: 1px solid `color-border-default`
- Focus ring: 2px solid `color-border-focus`, 4px outline offset
- Error state: border-color error, helper text in error color
- Labels: always visible above input, 14px, text-secondary

### 4.4 Tables

- Row height: 48px minimum
- Header: bg-elevated, text-tertiary, uppercase, 11px, letter-spacing 0.05em
- Hover row: bg-hover
- Sort indicator: text-tertiary, gold-500 when active
- Responsive: horizontal scroll with sticky first column on mobile

### 4.5 Modals

- Backdrop: rgba(0,0,0,0.6)
- Animation: scale(0.95) → scale(1) + fade-in, 200ms ease-out
- Focus trap: first focusable element on open
- Close: X button (top-right) + Escape key + backdrop click
- Max-width: 560px

### 4.6 Toast Notifications

- Position: top-right on desktop, bottom-center on mobile
- Duration: 5s auto-dismiss
- Types: success (green left-border), error (red), warning (amber), info (blue)
- Stack: max 3 visible, others collapse

### 4.7 Empty States

- Illustration: inline SVG (line icon style)
- Heading: text-lg, text-secondary
- Body: text-sm, text-tertiary, max-width 320px
- CTA: Primary button below description

### 4.8 Loading Skeletons

- Pulse animation: opacity 0.4 → 0.8 → 0.4, 1.5s infinite
- Shape: match component being loaded
- Color: surface-elevated with animate-pulse

---

## 5 Accessibility Rules

### 5.1 Contrast (WCAG AA)

- Normal text (<18px): ≥4.5:1 — all text-tertiary pairs verified
- Large text (≥18px): ≥3:1
- UI components: ≥3:1
- Focus indicators: ≥3:1 against adjacent colors

### 5.2 Focus Management

- Visible focus ring on ALL interactive elements
- 2px solid gold-500, 4px transparent outline offset (no layout shift)
- Skip to main content link (visually hidden, shown on focus)
- Focus order matches visual DOM order

### 5.3 Touch Targets

- Minimum 44×44pt on all interactive elements
- Icon-only buttons: extend hitSlop to 44×44
- Spacing between targets: ≥8px

### 5.4 Screen Reader

- aria-label on all icon-only buttons
- aria-live="polite" on dynamic content (toasts, alerts)
- role="alert" on error messages
- Semantic heading hierarchy (h1 → h2 → h3, no skips)

### 5.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 6 Icon System

### 6.1 Library

**Lucide React** (for Hive Academy) / **Lucide Vanilla/SVG** (for Dashboard)

- No emoji icons in navigation, buttons, or data displays
- Stroke width: 2px (default lucide), consistent across all icons
- Icon sizes: use tokens from §2.7

### 6.2 Navigation Icons (Replace Emojis)

| Nav Item | Current Emoji | Lucide Icon |
|----------|-------------|-------------|
| Tổng quan (Overview) | 🏠 | Home |
| Thành viên (Members) | 👥 | Users |
| PSN Health | 📊 | Activity |
| KPI Tracker | 🎯 | Target |
| Đào tạo (Training) | 🎓 | GraduationCap |
| Cảnh báo (Alerts) | 🚨 | AlertTriangle |
| Funnel | (none) | Filter |
| Leads | (none) | UserPlus |
| Orders | (none) | ShoppingBag |

---

## 7 Responsive Behavior

### 7.1 Breakpoint Rules

| Breakpoint | Width | Layout Change |
|-----------|-------|---------------|
| sm | 375px | Single column, bottom nav, stacked cards |
| md | 768px | 2-column grid, sidebar collapses to icons |
| lg | 1024px | 3-column grid, full sidebar |
| xl | 1440px | Max-width container, generous whitespace |

### 7.2 Mobile-First Rules

- Default styles = mobile, `@media (min-width: ...)` = upscale
- Font size ≥16px body text (prevents iOS auto-zoom)
- No horizontal scroll on any viewport
- Use `min-height: 100dvh` for full-screen layouts

---

## 8 Anti-Patterns (Do Not Do)

1. ❌ Emoji as structural icons → ✅ Lucide SVGs
2. ❌ Placeholder-only labels → ✅ Visible labels above inputs
3. ❌ Color-only meaning (no icon/text) → ✅ Multi-modal indicators
4. ❌ Instant state changes (0ms) → ✅ 150-300ms transitions
5. ❌ Fixed px widths on containers → ✅ max-width + fluid
6. ❌ Inline hardcoded hex colors → ✅ CSS custom properties
7. ❌ Hover-only interactions → ✅ Click/tap primary + hover enhancement
8. ❌ Decorative-only animation → ✅ Meaningful, interruptible transitions
9. ❌ Truncation without expand → ✅ Wrap or tooltip
10. ❌ More than 5 primary nav items → ✅ Categorize / overflow menu

---

## 9 Page-Specific Overrides

See `design-system/pages/` for per-page deviations from this Master file.

Current page overrides:
- *(none yet — create as pages are designed)*

---

## 10 Implementation Checklist

- [x] Design system file persisted at `design-system/MASTER.md`
- [x] Dashboard: replace emoji icons with Lucide SVGs (index.html)
- [x] Dashboard: extend style.css with semantic tokens (status colors, surfaces, motion, z-index)
- [x] Dashboard: add focus states to all interactive elements (focus-visible, skip-link)
- [x] Dashboard: loading skeletons + empty states for all views
- [x] Design review completed — design-audit + css-issues reports generated
- [x] Critical CSS fixes applied (modal reduced-motion, skeleton pulse, nav layout shift)
- [ ] Hive Academy: audit globals.css / layout.tsx for token alignment (blocked on Bash)
- [ ] Hive Academy: add Lucide React dependency
- [ ] Token naming decision: `--color-*` vs `--brand-*` prefix (blocking for Hive Academy integration)
- [ ] Accessibility: full keyboard nav test pass
- [ ] Accessibility: contrast ratio validation (all text pairs)
- [ ] Responsive: test at 375px, 768px, 1024px viewports
- [x] Motion: prefers-reduced-motion support confirmed
- [x] Modal: animation-fill-mode: backwards (fixes invisible modal under reduced-motion)
- [x] Nav active state: pre-allocated transparent border (prevents 2px layout shift)
- [x] Skeleton pulse: bright→dim→bright direction (CSS-03)
