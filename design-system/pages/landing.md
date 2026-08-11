# Landing Page Overrides

> **OVERRIDE SCOPE:** This file overrides MASTER.md rules ONLY for the public landing/marketing pages.
> Routes: `/`, `/pricing`, `/features`, `/about`, `/login`, `/register`
> Rules not explicitly overridden here fall back to MASTER.md.

---

## Page Context
- **Purpose:** Marketing conversion — convert visitors to trial/lead
- **Primary User:** Cold/warm traffic, potential recruits, decision makers
- **Device Priority:** Mobile-first (majority traffic), desktop-optimized
- **Business Impact:** Top of funnel — directly drives CAC/LTV

---

## Layout Overrides

### Section-Based Layout (Landing Pattern)
```css
.landing-page {
  overflow-x: hidden;
}

/* Section container — consistent rhythm */
.landing-section {
  padding: var(--space-3xl) var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 639px) {
  .landing-section {
    padding: var(--space-2xl) var(--space-md);
  }
}

/* Hero — taller on desktop */
.landing-hero {
  min-height: 90dvh;
  display: flex;
  align-items: center;
  position: relative;
  padding-top: 80px; /* Account for fixed nav */
}

@media (max-width: 639px) {
  .landing-hero {
    min-height: auto;
    padding: var(--space-3xl) var(--space-md) var(--space-2xl);
    text-align: center;
  }
}

/* Narrow content sections (features, testimonials) */
.landing-narrow {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

/* Wide sections (pricing, FAQ, footer) */
.landing-wide {
  max-width: 1200px;
  margin: 0 auto;
}

/* Two-column alternating sections */
.landing-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
}

@media (max-width: 1023px) {
  .landing-split {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }
}

.landing-split--reverse {
  direction: rtl;
}

.landing-split--reverse > * {
  direction: ltr;
}

/* Grid sections (features, stats) */
.landing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

@media (max-width: 639px) {
  .landing-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Component Overrides

### Navigation Bar (Marketing)
```css
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-subtle);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
}

@media (max-width: 639px) {
  .landing-nav {
    height: 56px;
    padding: 0 var(--space-md);
  }
}

.landing-nav-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-foreground);
  text-decoration: none;
}

.landing-nav-logo-icon {
  width: 32px;
  height: 32px;
  color: var(--color-gold-500);
}

.landing-nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

@media (max-width: 767px) {
  .landing-nav-links {
    display: none;
  }
}

.landing-nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
  position: relative;
}

.landing-nav-link:hover,
.landing-nav-link:focus-visible {
  color: var(--color-gold-500);
}

.landing-nav-link::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-gold-500);
  border-radius: 2px;
  transform: scaleX(0);
  transition: transform 200ms ease;
}

.landing-nav-link:hover::after,
.landing-nav-link:focus-visible::after {
  transform: scaleX(1);
}

.landing-nav-cta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.landing-nav-cta .btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
}

.landing-nav-cta .btn-primary {
  padding: 10px 24px;
  font-size: 14px;
}

/* Mobile Menu Button */
.landing-mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-foreground);
  cursor: pointer;
}

@media (max-width: 767px) {
  .landing-mobile-menu-btn {
    display: flex;
  }
}
```

### Hero Section
```css
.landing-hero-content {
  max-width: 600px;
  z-index: 1;
}

@media (max-width: 639px) {
  .landing-hero-content {
    max-width: 100%;
  }
}

.landing-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(161, 98, 7, 0.1);
  border: 1px solid rgba(161, 98, 7, 0.3);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gold-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-lg);
  animation: badgePulse 3s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.landing-hero-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-foreground);
  margin-bottom: var(--space-lg);
}

.landing-hero-title .highlight {
  color: var(--color-gold-500);
  background: linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.landing-hero-subtitle {
  font-size: 20px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  max-width: 90%;
}

@media (max-width: 639px) {
  .landing-hero-subtitle {
    font-size: 17px;
    max-width: 100%;
  }
}

.landing-hero-cta-group {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-xl);
}

.landing-hero-cta-group .btn-primary {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
}

.landing-hero-cta-group .btn-secondary {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
}

.landing-hero-trust {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.landing-hero-trust-items {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.landing-hero-trust-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 500;
}

.landing-hero-trust-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
}

/* Hero Visual (right side) */
.landing-hero-visual {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
}

@media (max-width: 1023px) {
  .landing-hero-visual {
    display: none; /* Hide on tablet and below */
  }
}

.landing-hero-visual-img {
  width: 100%;
  height: auto;
  border-radius: 24px;
  box-shadow: var(--shadow-xl);
}

/* Floating badge on hero visual */
.landing-hero-floating-badge {
  position: absolute;
  bottom: var(--space-xl);
  right: var(--space-xl);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.landing-hero-floating-badge-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.landing-hero-floating-badge-icon {
  width: 40px;
  height: 40px;
  background: var(--color-gold-100);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold-700);
}

.landing-hero-floating-badge-text {
  display: flex;
  flex-direction: column;
}

.landing-hero-floating-badge-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
}

.landing-hero-floating-badge-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-foreground);
}
```

### Feature Cards
```css
.landing-feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-xl);
  transition: all 300ms ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.landing-feature-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.landing-feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--color-gold-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold-700);
  margin-bottom: var(--space-lg);
  flex-shrink: 0;
}

.landing-feature-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--space-sm);
}

.landing-feature-description {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  flex: 1;
}

.landing-feature-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-lg);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gold-500);
  text-decoration: none;
  transition: gap 150ms ease;
}

.landing-feature-link:hover {
  gap: var(--space-sm);
}
```

### Social Proof / Testimonials
```css
.landing-testimonial-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-xl);
  text-align: left;
}

.landing-testimonial-stars {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-md);
  color: var(--color-gold-500);
}

.landing-testimonial-text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-foreground);
  margin-bottom: var(--space-lg);
  font-style: italic;
}

.landing-testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.landing-testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-gold-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold-700);
  font-weight: 700;
  font-size: 16px;
}

.landing-testimonial-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.landing-testimonial-info {
  display: flex;
  flex-direction: column;
}

.landing-testimonial-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-foreground);
}

.landing-testimonial-role {
  font-size: 13px;
  color: var(--color-text-tertiary);
}
```

### Pricing Cards
```css
.landing-pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.landing-pricing-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.landing-pricing-toggle-label--active {
  color: var(--color-foreground);
}

.landing-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 1023px) {
  .landing-pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}

.landing-pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 300ms ease;
}

.landing-pricing-card:hover {
  border-color: var(--color-gold-500);
  box-shadow: var(--shadow-xl);
}

.landing-pricing-card--popular {
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 1px var(--color-gold-500), var(--shadow-xl);
}

.landing-pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--color-gold-500);
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 999px;
  white-space: nowrap;
}

.landing-pricing-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--space-md);
}

.landing-pricing-price {
  margin-bottom: var(--space-lg);
}

.landing-pricing-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.landing-pricing-currency {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-foreground);
}

.landing-pricing-value {
  font-size: 48px;
  font-weight: 800;
  color: var(--color-foreground);
  line-height: 1;
}

.landing-pricing-period {
  font-size: 16px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.landing-pricing-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
  flex: 1;
}

.landing-pricing-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.landing-pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.landing-pricing-feature-icon {
  width: 20px;
  height: 20px;
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

.landing-pricing-cta {
  width: 100%;
}

.landing-pricing-cta .btn-primary {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}

.landing-pricing-card--popular .landing-pricing-cta .btn-primary {
  background: var(--color-foreground);
  color: var(--color-background);
}

.landing-pricing-card--popular .landing-pricing-cta .btn-primary:hover {
  opacity: 0.9;
}
```

### CTA Section
```css
.landing-cta-section {
  background: linear-gradient(135deg, #0C0A09 0%, #1C1917 100%);
  border: 1px solid var(--color-gold-500);
  border-radius: 24px;
  padding: var(--space-3xl) var(--space-2xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.landing-cta-section::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(161, 98, 7, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.landing-cta-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-foreground);
  margin-bottom: var(--space-md);
  position: relative;
  z-index: 1;
}

.landing-cta-subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.landing-cta-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.landing-cta-buttons .btn-primary {
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
}

.landing-cta-buttons .btn-secondary {
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  border-color: var(--color-gold-500);
  color: var(--color-gold-500);
}

.landing-cta-buttons .btn-secondary:hover {
  background: var(--color-gold-500);
  color: white;
}
```

### Footer
```css
.landing-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-3xl) var(--space-xl) var(--space-xl);
}

@media (max-width: 639px) {
  .landing-footer {
    padding: var(--space-2xl) var(--space-md) var(--space-lg);
  }
}

.landing-footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: var(--space-2xl);
  max-width: 1200px;
  margin: 0 auto var(--space-2xl);
}

@media (max-width: 767px) {
  .landing-footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }
}

@media (max-width: 479px) {
  .landing-footer-grid {
    grid-template-columns: 1fr;
  }
}

.landing-footer-brand {
  max-width: 300px;
}

.landing-footer-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-foreground);
  text-decoration: none;
  margin-bottom: var(--space-md);
}

.landing-footer-description {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-lg);
}

.landing-footer-social {
  display: flex;
  gap: var(--space-sm);
}

.landing-footer-social-link {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: all 150ms ease;
}

.landing-footer-social-link:hover {
  border-color: var(--color-gold-500);
  color: var(--color-gold-500);
}

.landing-footer-column-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-lg);
}

.landing-footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.landing-footer-link {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
}

.landing-footer-link:hover,
.landing-footer-link:focus-visible {
  color: var(--color-gold-500);
}

.landing-footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.landing-footer-copyright {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.landing-footer-legal {
  display: flex;
  gap: var(--space-lg);
}

.landing-footer-legal-link {
  font-size: 13px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color 150ms ease;
}

.landing-footer-legal-link:hover {
  color: var(--color-gold-500);
}
```

---

## Auth Pages (Login/Register)

### Auth Layout
```css
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-md);
  background: var(--color-background);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(161, 98, 7, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: var(--space-2xl);
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
}

@media (max-width: 479px) {
  .auth-card {
    padding: var(--space-xl) var(--space-lg);
    border-radius: 16px;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-foreground);
  text-decoration: none;
  margin-bottom: var(--space-lg);
}

.auth-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-foreground);
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.auth-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.auth-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-foreground);
}

.auth-input {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 16px;
  background: var(--color-background);
  color: var(--color-foreground);
  transition: all 150ms ease;
}

.auth-input:focus {
  outline: none;
  border-color: var(--color-gold-500);
  box-shadow: 0 0 0 3px rgba(161, 98, 7, 0.15);
}

.auth-input::placeholder {
  color: var(--color-text-tertiary);
}

.auth-input-error {
  border-color: var(--color-destructive);
}

.auth-input-error:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}

.auth-error-message {
  font-size: 13px;
  color: var(--color-destructive);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.auth-forgot {
  font-size: 14px;
  color: var(--color-gold-500);
  text-decoration: none;
  text-align: right;
  transition: color 150ms ease;
}

.auth-forgot:hover {
  color: var(--color-gold-400);
  text-decoration: underline;
}

.auth-submit {
  margin-top: var(--space-md);
}

.auth-submit .btn-primary {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.auth-providers {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.auth-provider-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  color: var(--color-foreground);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.auth-provider-btn:hover {
  border-color: var(--color-gold-500);
  background: var(--color-surface-hover);
}

.auth-provider-btn:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.auth-provider-icon {
  width: 20px;
  height: 20px;
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-xl);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.auth-footer-link {
  color: var(--color-gold-500);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer-link:hover {
  text-decoration: underline;
}
```

---

## Typography Overrides

```css
/* Landing page specific scale — larger, more impact */
.landing-display {
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.landing-h1 {
  font-size: clamp(32px, 4.5vw, 48px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.landing-h2 {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.landing-h3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
}

.landing-lead {
  font-size: clamp(18px, 2.5vw, 22px);
  line-height: 1.7;
  color: var(--color-text-secondary);
  max-width: 60ch;
}

.landing-body {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-foreground);
}

.landing-body-sm {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

.landing-caption {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

.landing-button-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.landing-small-button-text {
  font-size: 14px;
  font-weight: 600;
}
```

---

## Color Overrides (Landing-Specific)

```css
:root {
  /* Landing gradient system */
  --landing-gradient-primary: linear-gradient(135deg, var(--color-gold-500) 0%, var(--color-gold-400) 100%);
  --landing-gradient-hero: linear-gradient(135deg, #0C0A09 0%, #1C1917 50%, #0C0A09 100%);
  --landing-gradient-card: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%);
  
  /* CTA states */
  --landing-cta-primary: var(--color-gold-500);
  --landing-cta-primary-hover: var(--color-gold-400);
  --landing-cta-primary-text: white;
  
  --landing-cta-secondary-border: var(--color-gold-500);
  --landing-cta-secondary-text: var(--color-gold-500);
  --landing-cta-secondary-hover-bg: var(--color-gold-500);
  --landing-cta-secondary-hover-text: white;
  
  /* Trust indicators */
  --landing-trust-border: rgba(161, 98, 7, 0.2);
  --landing-trust-bg: rgba(161, 98, 7, 0.05);
}
```

---

## Interaction Overrides

### Scroll Animations (IntersectionObserver)
```css
/* Reveal animations — respects prefers-reduced-motion */
.landing-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.landing-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.landing-reveal-stagger > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.landing-reveal-stagger--visible > *:nth-child(1) { transition-delay: 0ms; }
.landing-reveal-stagger--visible > *:nth-child(2) { transition-delay: 100ms; }
.landing-reveal-stagger--visible > *:nth-child(3) { transition-delay: 200ms; }
.landing-reveal-stagger--visible > *:nth-child(4) { transition-delay: 300ms; }
.landing-reveal-stagger--visible > *:nth-child(5) { transition-delay: 400ms; }
.landing-reveal-stagger--visible > *:nth-child(6) { transition-delay: 500ms; }

@media (prefers-reduced-motion: reduce) {
  .landing-reveal,
  .landing-reveal-stagger > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* Parallax hero visual (desktop only) */
@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  .landing-hero-visual {
    transform: translateY(var(--parallax-y, 0));
    will-change: transform;
  }
}
```

### Button Interactions
```css
.landing-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.landing-btn:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

.landing-btn--primary {
  background: var(--landing-cta-primary);
  color: var(--landing-cta-primary-text);
  border: none;
  padding: 14px 28px;
  font-size: 15px;
}

.landing-btn--primary:hover {
  background: var(--landing-cta-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(161, 98, 7, 0.3);
}

.landing-btn--primary:active {
  transform: translateY(0);
}

.landing-btn--secondary {
  background: transparent;
  color: var(--landing-cta-secondary-text);
  border: 2px solid var(--landing-cta-secondary-border);
  padding: 12px 28px;
  font-size: 15px;
}

.landing-btn--secondary:hover {
  background: var(--landing-cta-secondary-hover-bg);
  color: var(--landing-cta-secondary-hover-text);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(161, 98, 7, 0.2);
}

.landing-btn--ghost {
  background: transparent;
  color: var(--color-foreground);
  border: 2px solid transparent;
  padding: 12px 24px;
  font-size: 14px;
}

.landing-btn--ghost:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border);
}

/* Icon in button */
.landing-btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 200ms ease;
}

.landing-btn:hover .landing-btn-icon {
  transform: translateX(2px);
}
```

### Hover Card Lift (Features, Pricing, Testimonials)
```css
.landing-hover-lift {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1),
              border-color 300ms ease;
}

.landing-hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-gold-500);
}
```

---

## Accessibility Overrides

```css
/* Skip link */
.landing-skip-link {
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

.landing-skip-link:focus {
  top: var(--space-md);
}

/* Focus visible on all landing interactive */
.landing-page *:focus-visible {
  outline: 2px solid var(--color-gold-500);
  outline-offset: 2px;
}

/* Exception: hero visual, decorative elements */
.landing-hero-visual:focus-visible,
.landing-hero-floating-badge:focus-visible {
  outline: none;
}

/* Form accessibility */
.auth-input[aria-invalid="true"] {
  border-color: var(--color-destructive);
}

.auth-input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}

/* Live region for auth errors */
.auth-error-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion — critical for landing animations */
@media (prefers-reduced-motion: reduce) {
  .landing-reveal,
  .landing-reveal-stagger > *,
  .landing-hero-badge,
  .landing-hero-floating-badge,
  .landing-btn,
  .landing-hover-lift,
  .landing-feature-card,
  .landing-pricing-card,
  .landing-testimonial-card {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
  
  @keyframes float { }
  @keyframes badgePulse { }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .landing-btn--secondary {
    border-width: 3px;
  }
  
  .landing-feature-card,
  .landing-pricing-card,
  .landing-testimonial-card {
    border-width: 2px;
  }
  
  .auth-input {
    border-width: 2px;
  }
}
```

---

## Responsive Overrides

### Mobile (< 640px) — Primary
```css
@media (max-width: 639px) {
  .landing-section {
    padding: var(--space-2xl) var(--space-md);
  }
  
  .landing-hero {
    min-height: auto;
    padding: var(--space-2xl) var(--space-md);
    text-align: center;
  }
  
  .landing-hero-content {
    max-width: 100%;
  }
  
  .landing-hero-cta-group {
    flex-direction: column;
    width: 100%;
  }
  
  .landing-hero-cta-group .landing-btn {
    width: 100%;
  }
  
  .landing-hero-trust {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .landing-hero-trust-divider {
    display: none;
  }
  
  .landing-split {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
  
  .landing-split--reverse {
    direction: ltr;
  }
  
  .landing-grid {
    grid-template-columns: 1fr;
  }
  
  .landing-pricing-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
  
  .landing-footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
  
  .landing-footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  
  .landing-footer-legal {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .auth-card {
    padding: var(--space-xl) var(--space-lg);
    border-radius: 16px;
  }
}
```

### Tablet (640px - 1023px)
```css
@media (min-width: 640px) and (max-width: 1023px) {
  .landing-hero-title {
    font-size: 44px;
  }
  
  .landing-pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 700px;
    margin: 0 auto;
  }
  
  .landing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .landing-footer-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

### Desktop (≥ 1024px)
```css
@media (min-width: 1024px) {
  .landing-nav {
    padding: 0 var(--space-2xl);
  }
  
  .landing-section {
    padding: var(--space-3xl) var(--space-2xl);
  }
  
  .landing-hero {
    padding-top: 64px;
  }
  
  .landing-hero-visual {
    display: block;
  }
  
  .landing-split {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3xl);
  }
  
  .landing-pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .landing-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
```

---

## Anti-Patterns (Landing-Specific)

| ❌ Don't | ✅ Do |
|----------|-------|
| Hero CTA below fold | Primary CTA visible in first viewport |
| Multiple competing CTAs in hero | One primary + one secondary max |
| Generic stock photos | Product screenshots / dashboard preview |
| Feature list without outcomes | "Feature → Benefit → Proof" structure |
| Pricing without annual discount | Show monthly + annual toggle |
| No social proof above fold | Trust indicators in hero (logos, stats) |
| Form fields without labels | Visible labels + placeholders as hints |
| Captcha on first visit | Honeypot / behavioral analysis |
| Infinite scroll on landing | Fixed sections, clear page end |
| Heavy JS animations blocking paint | CSS-first, JS-enhanced reveals |
| Auto-play video with sound | Muted autoplay + click for sound |

---

## Data Attributes for Analytics/JS

```html
<!-- Hero CTA -->
<a class="landing-btn landing-btn--primary" 
   data-cta="hero-primary" 
   data-cta-variant="primary"
   href="/register">
  Bắt đầu ngay
</a>

<!-- Nav CTA -->
<a class="landing-btn landing-btn--primary" 
   data-cta="nav-primary" 
   href="/register">
  Đăng ký
</a>

<!-- Feature card -->
<article class="landing-feature-card landing-hover-lift landing-reveal"
  data-feature="team-management"
  data-feature-index="1">

<!-- Pricing card -->
<article class="landing-pricing-card landing-hover-lift landing-reveal"
  data-plan="pro"
  data-plan-popular="true"
  data-billing="monthly">

<!-- Testimonial -->
<article class="landing-testimonial-card landing-reveal"
  data-testimonial="user-123"
  data-tier="2"
  data-results="3x recruitment">

<!-- Auth form -->
<form class="auth-form" 
  data-form="login" 
  data-provider="email"
  novalidate>
```

---

## Implementation Checklist (Landing Pages)

- [ ] Hero: headline, subhead, primary CTA, secondary CTA, trust badges, visual
- [ ] Nav: logo, links (desktop), mobile menu, CTA buttons
- [ ] Features: 3-6 cards with icons, titles, descriptions, learn links
- [ ] Social Proof: 3+ testimonials with avatars, roles, results
- [ ] Pricing: 3 tiers, monthly/annual toggle, popular badge, feature lists
- [ ] CTA Section: gradient background, compelling copy, dual buttons
- [ ] Footer: brand, 3-4 link columns, social, copyright, legal
- [ ] Login: email/password, forgot, OAuth providers, register link
- [ ] Register: email/password, confirm, terms checkbox, OAuth, login link
- [ ] Scroll reveals: IntersectionObserver, staggered, respects reduced-motion
- [ ] Analytics: data-cta, data-feature, data-plan on all conversion elements
- [ ] A/B test ready: variant classes, copy blocks swappable
- [ ] SEO: meta tags, OG, JSON-LD, canonical, sitemap
- [ ] Performance: hero image preload, font preconnect, critical CSS inline
- [ ] Accessibility: skip link, focus visible, ARIA on forms, contrast
- [ ] Mobile: touch targets, single column, readable text, fast load

---

## Related Files
- `MASTER.md` — Base design system (fallback for all rules not overridden here)
- `pages/dashboard.md` — Authenticated dashboard (leader-facing)
- `pages/training.md` — Hive Academy (member-facing)
- `pages/admin.md` — Admin panel (platform-facing)
- `/src/app/(marketing)/` — Next.js App Router implementation
- `/src/components/landing/` — Landing-specific components