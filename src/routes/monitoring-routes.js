/**
 * Routes — health, monitoring, metrics, and compliance endpoints
 * Matches original server.js handlers verbatim.
 */

const { notFoundMiddleware, getHealthStatus, monitoring } = require('../utils/monitoring');
const { requireRole } = require('../middleware/requireRole');

function registerMonitoringRoutes(app) {
  // Health check
  app.get('/health', (req, res) => {
    res.json(getHealthStatus());
  });

  // Readiness probe — 200 only when the DB adapter is bound and the alert
  // engine has loaded its rules. Load balancers use this to stop routing
  // traffic before the app is actually serving.
  app.get('/ready', (req, res) => {
    const dbReady = !!global.db;
    const allHealthy = dbReady && Object.values(getHealthStatus().subsystems).every(
      s => s.status === 'healthy' || s.status === 'disabled'
    );
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not_ready',
      database: dbReady ? 'bound' : 'unbound',
      timestamp: new Date().toISOString()
    });
  });

  // Metrics probe — text/plain for Prometheus scraping. Covers error counts,
  // uptime, and per-subsystem status so dashboards can alert without parsing
  // JSON.
  app.get('/metrics', (req, res) => {
    const status = getHealthStatus();
    const lines = [
      '# HELP hive_os_up_seconds Uptime of the Hive OS process in seconds',
      '# TYPE hive_os_up_seconds gauge',
      `hive_os_up_seconds ${status.uptime.toFixed(3)}`,
      '# HELP hive_os_error_count_total Total captured error/message events',
      '# TYPE hive_os_error_count_total gauge',
      `hive_os_error_count_total ${status.error_count}`,
      '# HELP hive_os_subsystem_status Status of a subsystem (1=healthy, 0=disabled/degraded)',
      '# TYPE hive_os_subsystem_status gauge'
    ];
    for (const [name, sub] of Object.entries(status.subsystems)) {
      lines.push(`hive_os_subsystem_status{subsystem="${name}"} ${sub.status === 'healthy' ? 1 : 0}`);
    }
    res.type('text/plain').send(lines.join('\n'));
  });

  // Monitoring routes
  app.get('/api/monitoring/errors', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ errors: monitoring.getErrorLog(limit) });
  });

  app.get('/api/monitoring/summary', (req, res) => {
    res.json(monitoring.getErrorSummary());
  });

  // PDPA compliance report — Admin only. Produces the audit-trail evidence required
  // by the compliance pack; window is configurable via query params.
  app.get('/api/compliance/report', requireRole('Admin'), async (req, res) => {
    try {
      const { buildComplianceReport } = require('../utils/complianceReport');
      const report = await buildComplianceReport({
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
      });
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Compliance report error:', error.message);
      res.status(500).json({ error: 'Loi he thong khi tao bao cao tuân thu' });
    }
  });

  // 404 handler (kept for backward compatibility; usually handled globally)
  app.use(notFoundMiddleware);
}

module.exports = { registerMonitoringRoutes };