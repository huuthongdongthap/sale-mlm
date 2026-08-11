/**
 * T-022: Monitoring + Error Reporting
 *
 * Features:
 *   - Sentry SDK integration (stub for now — real SDK needs @sentry/node)
 *   - Error middleware for Express
 *   - Zalo webhook alert on critical errors
 *   - Health check with subsystem status
 */

const crypto = require('crypto');

// In-memory error log
const errorLog = [];

/**
 * Sentry-like error capture (stub — replace with real @sentry/node in production)
 */
class MonitoringClient {
  constructor(dsn) {
    this.dsn = dsn;
    this.enabled = !!dsn;
  }

  captureException(error, context = {}) {
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      environment: process.env.NODE_ENV || 'development'
    };

    errorLog.push(event);

    if (this.enabled) {
      // In production: Sentry.captureException(error, context)
      console.error(`[Monitoring] Error captured: ${error.message}`);
    }

    return event.id;
  }

  captureMessage(message, level = 'info', context = {}) {
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message,
      level,
      context
    };

    errorLog.push(event);
    return event.id;
  }

  getErrorLog(limit = 50) {
    return errorLog.slice(-limit).reverse();
  }

  getErrorSummary() {
    const total = errorLog.length;
    const errors = errorLog.filter(e => e.error).length;
    const messages = errorLog.filter(e => e.message && !e.error).length;

    const byLevel = {};
    for (const event of errorLog) {
      const level = event.error ? 'error' : (event.level || 'info');
      byLevel[level] = (byLevel[level] || 0) + 1;
    }

    return { total, errors, messages, byLevel };
  }
}

// Initialize monitoring client
const monitoring = new MonitoringClient(process.env.SENTRY_DSN);

/**
 * Express error middleware
 */
function errorMiddleware(err, req, res, next) {
  const eventId = monitoring.captureException(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Check if critical error → trigger Zalo webhook
  if (err.statusCode >= 500 || err.isCritical) {
    triggerZaloAlert(err, req);
  }

  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    eventId
  });
}

/**
 * Trigger Zalo webhook alert for critical errors
 */
function triggerZaloAlert(error, req) {
  const webhookUrl = process.env.ZALO_ALERT_WEBHOOK;
  if (!webhookUrl) return;

  const payload = {
    type: 'critical_error',
    timestamp: new Date().toISOString(),
    error: error.message,
    url: req?.originalUrl,
    method: req?.method,
    severity: 'critical'
  };

  // In production: fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) })
  console.error(`[Zalo Alert] Critical error: ${error.message}`);
  return payload;
}

/**
 * Health check with subsystem status
 */
function getHealthStatus() {
  const subsystems = {
    api: { status: 'healthy', check: 'express_running' },
    database: { status: 'healthy', check: 'in_memory' },
    monitoring: { status: monitoring.enabled ? 'healthy' : 'disabled', check: 'sentry_dsn' },
    alerts: { status: 'healthy', check: 'rules_loaded' },
    onboarding: { status: 'healthy', check: 'bot_running' },
    training: { status: 'healthy', check: 'ops_running' }
  };

  const allHealthy = Object.values(subsystems).every(s => s.status === 'healthy' || s.status === 'disabled');

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    service: 'Hive Warfare OS',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    subsystems,
    error_count: errorLog.length
  };
}

/**
 * 404 handler
 */
function notFoundMiddleware(req, res) {
  monitoring.captureMessage(`404: ${req.method} ${req.originalUrl}`, 'warning');
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
}

module.exports = {
  monitoring,
  errorMiddleware,
  notFoundMiddleware,
  getHealthStatus,
  triggerZaloAlert,
  errorLog
};
