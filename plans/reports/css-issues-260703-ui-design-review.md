# CSS Issues Report — Dashboard style.css

**Date:** 2026-07-03
**Scope:** `src/dashboard/style.css` (rewritten v2 with design system tokens)

---

## Issues Found

### CSS-01: `animation-fill-mode` not set on modal-enter

**Severity:** CRITICAL
**File:** style.css ~line modal-enter keyframe

```css
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.modal-content {
  animation: modal-enter var(--duration-normal) var(--easing-enter);
  /* MISSING: animation-fill-mode: backwards; */
}
```

Without `animation-fill-mode: backwards` or `both`, the element renders in its natural state (opacity: 1) BEFORE the animation starts, causing a flash of fully-visible content.

**Fix:** Add `animation-fill-mode: backwards` to `.modal-content`.

---

### CSS-02: `--brand-gold-bright` referenced but undefined

**Severity:** HIGH

```css
.btn-primary:hover:not([disabled]) {
  background: var(--brand-gold-bright);  /* NOT DECLARED in :root */
}
```

Evaluates to `transparent` at runtime — hover background fails silently.

**Fix:** Define `--brand-gold-bright: #FFD700` in `:root`, or replace with `var(--brand-gold-electric)`.

---

### CSS-03: Skeleton pulse timing — dim-then-bright feels unnatural

**Severity:** MEDIUM

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
```

Skeleton appears at 40% opacity (half-dimmed), then brightens, then dims again. This reads as "loading content briefly visible then fading" — confusing. Users expect content that's *appearing*, not *disappearing*.

**Fix:**
```css
@keyframes skeleton-pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.4; }
  100% { opacity: 1; }
}
```

---

### CSS-04: No `will-change` on frequently animated elements

**Severity:** LOW (performance)

`.nav-toggle-line`, `.loading-spinner`, `.funnel-tier`, `.conversion-card` animate without `will-change` hints, causing GPU layer promotion delays on first interaction.

**Fix:** Add `will-change: transform` to `.loading-spinner` and `.nav-toggle-line`.

---

### CSS-05: `.data-table min-width: 600px` causes overflow on 768px tablets

**Severity:** MEDIUM

On a 768px tablet (effective content width ~736px after padding), a 600px-min table with 7+ columns forces horizontal scroll. No sticky-first-column fallback.

**Fix:** Implement the documented sticky-first-column pattern:
```css
.data-table th:first-child,
.data-table td:first-child {
  position: sticky;
  left: 0;
  background: var(--surface-secondary);
  z-index: 1;
}
```

---

### CSS-06: `.nav-link.active` border causes 1px layout shift

**Severity:** LOW

```css
.nav-link.active { border: 1px solid var(--border-accent); }
```

Adding/removing border changes box size by 2px, subtly shifting adjacent links.

**Fix:** Pre-allocate border space:
```css
.nav-link { border: 1px solid transparent; }
.nav-link.active { border-color: var(--border-accent); }
```

---

### CSS-07: Toggle button missing `aria-controls`

**Severity:** LOW (a11y)

```html
<button aria-label="Toggle menu" aria-expanded="false">
```

Has `aria-expanded` ✅ but no `aria-controls` linking to the menu. Screen readers can't associate the button to its target.

**Fix:** Add `aria-controls="main-nav-menu"` and `id="main-nav-menu"` on `.nav-menu`.

---

### CSS-08: `--brand-gold-bright` also missing from style.css `:root`

**Severity:** HIGH (same root cause as CSS-02)

The original style.css had `--brand-gold`, `--brand-gold-electric`, `--brand-amber` but NOT `--brand-gold-bright`. The new rewrite adds `.btn-primary:hover { background: var(--brand-gold-bright) }` which will be undefined.

---

### CSS-09: `100vh` should be `100dvh` on mobile

**Severity:** LOW

```css
.main-content { min-height: calc(100vh - var(--nav-height)); }
```

On mobile browsers, `100vh` includes the address bar, causing scroll jank when bar hides/shows. MASTER.md §7.1 explicitly recommends `100dvh`.

**Fix:**
```css
.main-content { min-height: calc(100dvh - var(--nav-height)); }
```

---

### CSS-10: `--bp-sm` and `--bp-lg`/`--bp-xl` tokens defined but never used in media queries

**Severity:** LOW

MASTER.md defines all 4 breakpoints as tokens but CSS only uses 768px and 480px hardcoded values. The semantic tokens exist but are unused.

**Fix:** Replace:
```css
@media (max-width: var(--bp-md)) { ... }
@media (max-width: 480px) { ... }  /* → var(--bp-sm) */
```

---

## Summary

| ID | Severity | Description | Blocking? |
|----|----------|-------------|-----------|
| CSS-01 | CRITICAL | Modal invisible with reduced-motion | YES |
| CSS-02 | HIGH | `--brand-gold-bright` undefined → broken hover | YES |
| CSS-03 | MEDIUM | Skeleton pulse direction counterintuitive | No |
| CSS-04 | LOW | Missing `will-change` on animated elements | No |
| CSS-05 | MEDIUM | Table min-width overflows tablet viewport | No |
| CSS-06 | LOW | Active border causes layout shift | No |
| CSS-07 | LOW | Toggle missing `aria-controls` | No |
| CSS-08 | HIGH | Same root cause as CSS-02 | YES |
| CSS-09 | LOW | `100vh` → `100dvh` per design system spec | No |
| CSS-10 | LOW | Breakpoint tokens unused in CSS | No |

**2 blocking issues** (CSS-01, CSS-02/08) — must fix before deployment.
