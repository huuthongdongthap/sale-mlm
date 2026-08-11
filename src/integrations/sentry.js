/**
 * PHASE 4: Sentry Error Tracking Integration
 *
 * Production error tracking with Sentry SDK.
 *
 * Setup:
 *   1. Create Sentry project
 *   2. Get DSN from Sentry settings
 *   3. Set SENTRY_DSN env var
 *   4. Install: npm install @sentry/node
 */

const { init, captureException, captureMessage, setContext } = require('@sentry/node');

let sentryInitialized = false;

/**
 * Initialize Sentry
 */
function initSentry() {
  if (sentryInitialized || !process.env.SENTRY_DSN) return;

  init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = '[REDACTED]';
      }
      return event;
    }
  });

  sentryInitialized = true;
  console.log('[Sentry] Initialized');
}

/**
 * Capture exception with context
 */
function captureError(error, context = {}) {
  if (!sentryInitialized) {
    console.error('[Sentry] Not initialized, logging error:', error.message);
    return;
  }

  setContext('app', {
    service: 'hive-warfare-os',
    version: '1.0.0',
    ...context
  });

  return captureException(error);
}

/**
 * Capture message with level
 */
function captureInfo(message, level = 'info', context = {}) {
  if (!sentryInitialized) {
    console.log(`[Sentry] ${message}`);
    return;
  }

  setContext('app', { service: 'hive-warfare-os', ...context });
  return captureMessage(message, { level });
}

module.exports = { initSentry, captureError, captureInfo };
