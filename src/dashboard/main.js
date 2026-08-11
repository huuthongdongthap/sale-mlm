/**
 * Droppii Training OS Dashboard - Main Application Entry Point
 * Initializes the dashboard with dark luxury theme and routing
 */

import Router from './router.js';

class DashboardApp {
  constructor() {
    this.router = null;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🚀 Initializing Droppii Training OS Dashboard...');

    // Initialize router
    this.router = new Router();

    // Setup theme and accessibility
    this.setupTheme();
    this.setupAccessibility();
    this.setupPerformance();

    // Add some dashboard-specific styles
    this.addDashboardStyles();

    console.log('✅ Dashboard initialized successfully');
  }

  setupTheme() {
    // Apply theme class to body for consistency
    document.body.classList.add('dashboard-theme');

    // Handle system theme preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Our theme is already dark, but we could handle light mode here if needed
      mediaQuery.addEventListener('change', (e) => {
        // Currently we only support dark mode
        console.log('System theme preference:', e.matches ? 'dark' : 'light');
      });
    }
  }

  setupAccessibility() {
    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      // ESC key closes mobile menu
      if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }

      // Alt + number keys for quick navigation
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const routes = ['/', '/members', '/psn', '/kpi', '/training', '/alerts', '/funnel', '/orders', '/leads'];
        const routeIndex = parseInt(e.key) - 1;
        if (routes[routeIndex] && this.router) {
          this.router.navigateTo(routes[routeIndex]);
        }
      }
    });

    // Focus management for screen readers
    document.addEventListener('focusin', (e) => {
      // Add high contrast outline for focused elements
      if (e.target.matches('.nav-link, button, input, select, textarea')) {
        e.target.style.outline = '2px solid var(--brand-gold)';
        e.target.style.outlineOffset = '2px';
      }
    });

    document.addEventListener('focusout', (e) => {
      if (e.target.matches('.nav-link, button, input, select, textarea')) {
        e.target.style.outline = '';
        e.target.style.outlineOffset = '';
      }
    });

    // Skip to content link for screen readers
    this.addSkipToContentLink();
  }

  addSkipToContentLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#page-content';
    skipLink.textContent = 'Chuyển đến nội dung chính';
    skipLink.className = 'skip-to-content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--brand-gold);
      color: var(--surface-primary);
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1001;
      font-weight: 600;
      transition: top 0.2s ease;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupPerformance() {
    // Preload critical fonts
    const fonts = [
      'Playfair Display',
      'Inter',
      'JetBrains Mono'
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      // This would be the actual font file URL in production
      // link.href = `/fonts/${font.replace(' ', '-').toLowerCase()}.woff2`;
    });

    // Performance observer for monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Log performance metrics for dashboard optimization
            if (entry.entryType === 'navigation') {
              console.log(`Dashboard load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
            }
          }
        });

        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Performance monitoring not available:', e);
      }
    }
  }

  addDashboardStyles() {
    // Inject additional dashboard-specific styles
    const style = document.createElement('style');
    style.textContent = `
      /* Dashboard-specific grid layout */
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
        margin-top: var(--spacing-xl);
      }

      .dashboard-theme {
        /* Additional theme classes can be added here */
      }

      /* Loading states and animations */
      .fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Print styles for reports */
      @media print {
        .main-nav,
        .nav-toggle,
        .loading-spinner {
          display: none !important;
        }

        .main-content {
          margin-top: 0;
        }

        .card {
          border: 1px solid #000;
          box-shadow: none;
          break-inside: avoid;
        }

        body {
          background: white !important;
          color: black !important;
        }
      }

      /* High DPI display support */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .nav-icon,
        .loading-spinner {
          transform: translateZ(0);
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Utility method for development/debugging
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      currentRoute: this.router ? this.router.currentRoute : null,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize the dashboard when the script loads
const app = new DashboardApp();

// Export for debugging purposes
window.DashboardApp = app;

// Service worker registration for future PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service worker registration would go here in production
    console.log('Service worker support detected');
  });
}