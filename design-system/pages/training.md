# Hive Academy (Training) Page Overrides

> **OVERRIDE SCOPE:** This file overrides MASTER.md rules ONLY for Hive Academy training pages.
> Routes: `/learn`, `/learn/tier-1`, `/learn/tier-2`, `/learn/tier-3`, `/learn/lesson/[id]`
> Rules not explicitly overridden here fall back to MASTER.md.

---

## Page Context
- **Purpose:** Structured MLM training curriculum — 3 tiers, 4/8/12 weeks
- **Primary User:** Downline members, new recruits
- **Device Priority:** Mobile-first (consumption on phone), desktop-compatible
- **Business Impact:** Core product — completion drives retention & KPI

---

## Layout Overrides

### Training Layout (Mobile-First)
```css
.training-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--color-background);
}

/* Progress Bar — Fixed Top on Mobile */
.training-progress-bar {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 4px;
  background: var(--color-border);
  overflow: hidden;
}

.training-progress-fill {
  height: 100%;
  background: var(--color-gold-500);
  transition: width 300ms ease-out;
  border-radius: 0 4px 4px 0;
}

/* Header */
.training-header {
  position: sticky;
  top: 4px;
  z-index: 20;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .training-header {
    position: static;
    border-bottom: none;
    padding: var(--space-xl) var(--space-2xl);
  }
}

/* Content Area */
.training-content {
  flex: 1;
  padding: var(--space-lg);
  max-width: 720px;  /* Optimal reading width */
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 768px) {
  .training-content {
    padding: var(--space-2xl);
  }
}
```

---

## Component Overrides

### Tier Overview Card (Landing: /learn)
```css
.tier-overview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .tier-overview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tier-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 200ms ease;
}

.tier-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  width: fit-content;
  margin-bottom: var(--space-md);
}

.tier-badge--tier-1 { background: #FEF3C7; color: #92400E; }   /* amber-100 / amber-900 */
.tier-badge--tier-2 { background: #FDE68A; color: #78350F; }   /* amber-200 / amber-900 */
.tier-badge--tier-3 { background: #F59E0B; color: #FFF7ED; }   /* amber-500 / amber-50 */

.tier-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.tier-duration {
  font-size: 14px;
  color: var(--color-muted-foreground);
  margin-bottom: var(--space-lg);
}

.tier-stats {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.tier-stat {
  display: flex;
  flex-direction: column;
}

.tier-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-foreground);
  line-height: 1.2;
}

.tier-stat-label {
  font-size: 12px;
  color: var(--color-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tier-cta {
  margin-top: auto;
  width: 100%;
}
```

### Week Accordion (Tier Detail: /learn/tier-1, etc.)
```css
.week-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.week-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.week-header {
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  cursor: pointer;
  transition: background 150ms ease;
  user-select: none;
}

.week-header:hover {
  background: var(--color-surface-hover);
}

.week-header:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: -2px;
}

.week-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-gold-500);
  color: white;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.week-info {
  flex: 1;
  min-width: 0;
}

.week-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-meta {
  font-size: 12px;
  color: var(--color-muted-foreground);
  margin-top: 2px;
}

.week-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-muted-foreground);
  flex-shrink: 0;
  transition: transform 200ms ease;
}

.week-item[data-open="true"] .week-chevron {
  transform: rotate(180deg);
}

.week-content {
  padding: 0 var(--space-lg) var(--space-lg);
  border-top: 1px solid var(--color-border);
  overflow: hidden;
}

.week-content[data-collapsed="true"] {
  display: none;
}
```

### Lesson Card (Lesson List in Week)
```css
.lesson-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.lesson-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: all 150ms ease;
  text-decoration: none;
  color: inherit;
}

.lesson-card:hover {
  border-color: var(--color-gold-500);
  background: var(--color-surface-hover);
}

.lesson-card:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.lesson-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--color-gold-100);
  color: var(--color-gold-700);
  flex-shrink: 0;
}

.lesson-icon--video { background: #DBEAFE; color: #1D4ED8; }
.lesson-icon--pdf   { background: #FEF3C7; color: #92400E; }
.lesson-icon--quiz  { background: #D1FAE5; color: #065F46; }
.lesson-icon--live  { background: #FEF08A; color: #854D0E; }

.lesson-details {
  flex: 1;
  min-width: 0;
}

.lesson-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-muted-foreground);
}

.lesson-duration::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 4px;
}

.lesson-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.lesson-status-icon {
  width: 20px;
  height: 20px;
  color: var(--color-success);
}
```

### Lesson Player Page (/learn/lesson/[id])
```css
.lesson-player {
  max-width: 900px;
  margin: 0 auto;
}

.lesson-player-header {
  margin-bottom: var(--space-xl);
}

.lesson-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  color: var(--color-muted-foreground);
  margin-bottom: var(--space-sm);
}

.lesson-breadcrumb a {
  color: var(--color-gold-500);
  text-decoration: none;
}

.lesson-breadcrumb a:hover {
  text-decoration: underline;
}

.lesson-title-main {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-foreground);
  line-height: 1.3;
  margin-bottom: var(--space-sm);
}

.lesson-meta-main {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  font-size: 14px;
  color: var(--color-muted-foreground);
}

/* Video Player */
.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  margin-bottom: var(--space-xl);
}

.video-player {
  width: 100%;
  height: 100%;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  background: linear-gradient(135deg, #0C0A09 0%, #1C1917 100%);
  color: white;
}

.video-play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-gold-500);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
}

.video-play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(161, 98, 7, 0.5);
}

/* Content Tabs (Video / PDF / Quiz / Notes) */
.content-tabs {
  display: flex;
  gap: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-lg);
  overflow-x: auto;
  padding-bottom: 1px;
}

.content-tab {
  padding: var(--space-sm) var(--space-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted-foreground);
  background: none;
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms ease;
  position: relative;
}

.content-tab:hover {
  color: var(--color-foreground);
  background: var(--color-surface-hover);
}

.content-tab--active {
  color: var(--color-gold-500);
}

.content-tab--active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-gold-500);
  border-radius: 2px 2px 0 0;
}

.content-panel {
  animation: fadeIn 200ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Quiz Styles */
.quiz-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.quiz-question {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.quiz-question-number {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gold-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.quiz-question-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-foreground);
  margin-bottom: var(--space-lg);
  line-height: 1.5;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms ease;
}

.quiz-option:hover {
  border-color: var(--color-gold-500);
  background: var(--color-surface-hover);
}

.quiz-option:has(input:checked) {
  border-color: var(--color-gold-500);
  background: #FEFCE8;  /* amber-50 */
}

.quiz-option:has(input:focus-visible) {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.quiz-option input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-gold-500);
}

.quiz-option-text {
  font-size: 15px;
  color: var(--color-foreground);
  flex: 1;
}

.quiz-submit {
  margin-top: var(--space-md);
  width: 100%;
}

.quiz-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
}

.quiz-score {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-foreground);
  line-height: 1;
}

.quiz-score--pass { color: var(--color-success); }
.quiz-score--fail { color: var(--color-destructive); }

.quiz-message {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-muted-foreground);
}

/* Progress Navigation */
.progress-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.progress-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 150ms ease;
}

.progress-nav-btn--prev {
  color: var(--color-foreground);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.progress-nav-btn--prev:hover {
  border-color: var(--color-gold-500);
  color: var(--color-gold-500);
}

.progress-nav-btn--next {
  background: var(--color-gold-500);
  color: white;
  border: none;
}

.progress-nav-btn--next:hover {
  opacity: 0.9;
  transform: translateX(2px);
}

.progress-nav-btn--next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
```

---

## Typography Overrides

### Training-Specific Scale
```css
.training-page-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-foreground);
}

@media (max-width: 639px) {
  .training-page-title {
    font-size: 24px;
  }
}

.training-section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-foreground);
}

.training-body {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-foreground);
}

.training-body-sm {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-muted-foreground);
}

.training-caption {
  font-size: 12px;
  color: var(--color-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Color Overrides

### Training-Specific Semantic Colors
```css
:root {
  /* Completion states */
  --complete-green:    #10B981;  /* emerald-500 */
  --complete-green-bg: #ECFDF5;  /* emerald-50 */
  --complete-green-fg: #064E3B;  /* emerald-900 */
  
  --in-progress-blue:    #3B82F6;  /* blue-500 */
  --in-progress-blue-bg: #EFF6FF;  /* blue-50 */
  --in-progress-blue-fg: #1E3A5F;  /* blue-900 */
  
  --locked-gray:    #9CA3AF;  /* gray-400 */
  --locked-gray-bg: #F3F4F6;  /* gray-100 */
  --locked-gray-fg: #374151;  /* gray-700 */
  
  /* Content type indicators */
  --type-video:  #3B82F6;  /* blue */
  --type-pdf:    #F59E0B;  /* amber */
  --type-quiz:   #10B981;  /* emerald */
  --type-live:   #EF4444;  /* red */
}
```

---

## Interaction Overrides

### Touch-Friendly (Mobile-First)
```css
/* Larger touch targets for lesson cards on mobile */
@media (max-width: 639px) {
  .lesson-card {
    padding: var(--space-lg);
    min-height: 64px;  /* Exceeds 44px minimum */
  }
  
  .quiz-option {
    padding: var(--space-lg);
    min-height: 56px;
  }
  
  .progress-nav-btn {
    padding: var(--space-md) var(--space-xl);
    min-height: 48px;
  }
  
  .content-tab {
    padding: var(--space-md) var(--space-lg);
    min-height: 48px;
  }
}

/* Swipe gestures for lesson navigation on mobile */
@media (max-width: 639px) {
  .lesson-player {
    touch-action: pan-y;
  }
}
```

### Animation Overrides
```css
/* Accordion — smoother than MASTER default */
.week-content {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Progress fill — satisfying completion animation */
.training-progress-fill {
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Quiz option selection — instant feedback */
.quiz-option:has(input:checked) {
  animation: checkPulse 200ms ease;
}

@keyframes checkPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* Video play button — pulse when ready */
.video-play-btn {
  animation: playPulse 2s ease-in-out infinite;
}

@keyframes playPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(161, 98, 7, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(161, 98, 7, 0); }
}
```

---

## Accessibility Overrides

### Focus Management (Critical for Lesson Player)
```css
/* Skip to lesson content */
.training-skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-gold-500);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  z-index: 100;
}

.training-skip-link:focus {
  top: var(--space-md);
}

/* Focus trap in lesson player when modal (quiz result) opens */
.quiz-result-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.quiz-result-modal-content {
  background: var(--color-surface);
  border-radius: 16px;
  padding: var(--space-2xl);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-xl);
}

/* Focus visible on all interactive — gold ring for training brand */
.training-content *:focus-visible,
.lesson-player *:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

/* Exception: video player uses native controls */
.video-player:focus-visible {
  outline: none;
}
```

### Screen Reader Support
```html
<!-- Progress bar — aria for screen readers -->
<div class="training-progress-bar" role="progressbar" 
     aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"
     aria-label="Training progress">
  <div class="training-progress-fill" style="width: 45%"></div>
</div>

<!-- Accordion — proper ARIA -->
<button class="week-header" aria-expanded="false" aria-controls="week-1-content" id="week-1-header">
  <!-- content -->
</button>
<div class="week-content" id="week-1-content" role="region" aria-labelledby="week-1-header" hidden>
  <!-- content -->
</div>

<!-- Quiz — live region for feedback -->
<div class="quiz-feedback" aria-live="polite" aria-atomic="true">
  <!-- Correct/Incorrect message appears here -->
</div>

<!-- Quiz option — radio group semantics -->
<fieldset class="quiz-options">
  <legend class="sr-only">Question 1 options</legend>
  <label class="quiz-option">
    <input type="radio" name="q1" value="a">
    <span class="quiz-option-text">Option A</span>
  </label>
  <!-- ... -->
</fieldset>
```

---

## Responsive Overrides

### Mobile (< 640px) — Primary Target
```css
@media (max-width: 639px) {
  .training-content {
    padding: var(--space-md);
  }
  
  .tier-card {
    padding: var(--space-lg);
  }
  
  .lesson-title-main {
    font-size: 22px;
  }
  
  .video-wrapper {
    aspect-ratio: 16 / 9;
    border-radius: 8px;
  }
  
  .progress-nav {
    flex-direction: column-reverse;
    gap: var(--space-md);
  }
  
  .progress-nav-btn {
    width: 100%;
    justify-content: center;
  }
}
```

### Tablet (640px - 1023px)
```css
@media (min-width: 640px) and (max-width: 1023px) {
  .tier-overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .training-page-title {
    font-size: 28px;
  }
}
```

### Desktop (≥ 1024px) — Side-by-side Layout
```css
@media (min-width: 1024px) {
  .training-layout {
    flex-direction: row;
  }
  
  .training-sidebar {
    width: 280px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-border);
    height: 100dvh;
    position: sticky;
    top: 0;
    overflow-y: auto;
    background: var(--color-background);
  }
  
  .training-main {
    flex: 1;
    min-width: 0;
  }
  
  .training-progress-bar {
    display: none;  /* Moved to sidebar */
  }
  
  .training-header {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  /* Sidebar progress */
  .sidebar-progress {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }
  
  .sidebar-progress-ring {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-md);
  }
  
  .sidebar-progress-text {
    text-align: center;
  }
  
  .sidebar-progress-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-foreground);
  }
  
  .sidebar-progress-label {
    font-size: 13px;
    color: var(--color-muted-foreground);
  }
  
  .sidebar-nav {
    padding: var(--space-md);
  }
  
  .sidebar-nav-section {
    margin-bottom: var(--space-lg);
  }
  
  .sidebar-nav-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-muted-foreground);
    padding: 0 var(--space-sm) var(--space-xs);
  }
  
  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border-radius: 8px;
    color: var(--color-muted-foreground);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 150ms ease;
  }
  
  .sidebar-nav-item:hover {
    background: var(--color-surface-hover);
    color: var(--color-foreground);
  }
  
  .sidebar-nav-item--active {
    background: var(--color-gold-50);
    color: var(--color-gold-700);
  }
  
  .sidebar-nav-item--complete {
    color: var(--color-success);
  }
  
  .sidebar-nav-item-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}
```

---

## Anti-Patterns (Training-Specific)

| ❌ Don't | ✅ Do |
|----------|-------|
| Auto-play videos without consent | Click-to-play with clear play button |
| Hide quiz answers after submit | Show correct answer + explanation |
| Infinite scroll lesson list | Paginated or accordion weeks |
| Fixed progress bar on desktop | Move to sidebar, keep top-bar mobile only |
| Video without captions | VTT captions + transcript toggle |
| Quiz without keyboard support | Full radio/keyboard nav |
| No resume position | Save video timestamp + scroll per lesson |
| Gold text on light bg (< 4.5:1) | Gold on dark ≥ 4.5:1, or use amber-700 on light |

---

## Data Attributes for JS Hooks

```html
<!-- Tier card -->
<article class="tier-card" data-tier="1" data-weeks="4" data-lessons="28" data-completed="12">

<!-- Week accordion -->
<div class="week-item" data-week="3" data-tier="1" data-open="false" data-lessons="7">

<!-- Lesson card -->
<a class="lesson-card" data-lesson-id="t1-w3-l5" data-type="video" data-duration="12:34" data-completed="true" href="/learn/lesson/t1-w3-l5">

<!-- Video player -->
<div class="video-wrapper" data-video-src="..." data-poster="..." data-resume-time="0">

<!-- Quiz -->
<form class="quiz-container" data-quiz-id="t1-w3-q1" data-passing-score="70">
```

---

## Implementation Checklist (Training Pages)

- [ ] Tier overview cards at `/learn`
- [ ] Week accordion with lesson lists per tier
- [ ] Lesson player with video/PDF/quiz tabs
- [ ] Video player with resume, playback speed, captions
- [ ] Quiz component: radio options, submit, instant feedback, results
- [ ] Progress sync: localStorage + server sync on complete
- [ ] Sidebar navigation (desktop) / bottom sheet (mobile)
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Screen reader: ARIA on accordions, progress, quiz
- [ ] Reduced motion: disable pulse animations, instant accordion
- [ ] Touch targets: ≥48px on all mobile interactive elements
- [ ] Offline: Service worker cache video posters + PDF metadata
- [ ] Print: Lesson content printable (video → transcript link)

---

## Related Files
- `MASTER.md` — Base design system (fallback for all rules not overridden here)
- `pages/dashboard.md` — Dashboard overrides (separate product surface)
- `/hive-academy/SPEC.md` — Full product spec with user flows
- `/hive-academy/app/learn/` — Next.js App Router implementation