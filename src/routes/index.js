/**
 * Routes — composition barrel
 * Delegates to focused route modules.
 */

const authRoutes = require('../api/auth');
const habitRoutes = require('../api/habits');
const memberRoutes = require('../api/members');
const kpiRoutes = require('../api/kpi');
const alertRoutes = require('../api/alerts');
const leadsRoutes = require('../api/leads');
const analyticsFunnelRoutes = require('../api/analytics-funnel');

const { registerAlertRoutes } = require('./alert-routes');
const { registerOnboardingRoutes } = require('./onboarding-routes');
const { registerMonitoringRoutes } = require('./monitoring-routes');

/**
 * Mount all API routes on the Express app.
 * @param {Express.Application} app
 * @param {Object|null} db - Database adapter instance
 */
function setupRoutes(app, db) {
  const { authLimiter, apiLimiter, webhookLimiter } = require('../middleware/rateLimit');
  const { triggerWebhooks, subscribeWebhook, unsubscribeWebhook, webhookSubscriptions } = require('../webhooks');
  const { evaluateAll, getRules, getAlertLog, getAlertSummary, acknowledgeAlert, addRule, updateRule, deleteRule } = require('../analytics/alertEngine');
  const { startOnboarding, getSession, advanceDay, generateNudge, getProgress, getActiveSessions, checkGraduation } = require('../agents/onboardingBot');
  const { assignCurriculum, getRecord, updateProgress, getProgress: getTrainingProgress, getActiveTrainees, getTraineesNeedingAttention, getTraineesByPSN } = require('../agents/trainingOps');
  const { notFoundMiddleware, getHealthStatus, monitoring } = require('../utils/monitoring');
  const { requireRole } = require('../middleware/requireRole');
  const { classifyPSNHealth } = require('../analytics/psnHealth');
  const { computePSNMetrics: computeMetrics, runScheduledEvaluation } = require('../metrics');

  // Make db and webhook functions available globally for legacy API routes
  global.db = db;
  global.webhookManager = { subscribeWebhook, unsubscribeWebhook, triggerWebhooks, getSubscriptions: () => webhookSubscriptions };

  // Auth is the highest-value brute-force target — apply the strictest limiter.
  app.use('/auth', authLimiter, authRoutes);
  app.use('/api/habits', apiLimiter, habitRoutes);
  app.use('/api/members', apiLimiter, memberRoutes);
  app.use('/api/kpi', apiLimiter, kpiRoutes);

  // Alert management - register via module
  registerAlertRoutes(app);

  // Onboarding and training
  registerOnboardingRoutes(app, db);

  // Leads
  app.use('/api/leads', leadsRoutes);

  // Analytics funnel
  app.use('/api/analytics/funnel', analyticsFunnelRoutes);

  // Monitoring and compliance
  registerMonitoringRoutes(app);
}

module.exports = { setupRoutes };