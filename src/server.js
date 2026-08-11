require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const authRoutes = require('./api/auth');
const habitRoutes = require('./api/habits');
const memberRoutes = require('./api/members');
const kpiRoutes = require('./api/kpi');
const alertRoutes = require('./api/alerts');
const leadsRoutes = require('./api/leads');
const ordersHandler = require('./api/orders').handler;
const analyticsFunnelRoutes = require('./api/analytics-funnel');
const { initRules, evaluateAll, getRules, getAlertLog, getAlertSummary, acknowledgeAlert, addRule, updateRule, deleteRule } = require('./analytics/alertEngine');
const { startOnboarding, getSession, advanceDay, generateNudge, getProgress, getActiveSessions, checkGraduation } = require('./agents/onboardingBot');
const { assignCurriculum, getRecord, updateProgress, getProgress: getTrainingProgress, getActiveTrainees, getTraineesNeedingAttention, getTraineesByPSN } = require('./agents/trainingOps');
const { errorMiddleware, notFoundMiddleware, getHealthStatus, monitoring } = require('./utils/monitoring');
const { classifyPSNHealth } = require('./analytics/psnHealth');
const { getStore: getMembers, initStore: initMembersStore } = require('./models/member');
const { allOrders } = require('./models/order');

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
if (!ALLOWED_ORIGIN) {
  throw new Error('ALLOWED_ORIGIN environment variable is required — refusing to start with wide-open CORS');
}
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Initialize alert rules
initRules();

// Seed models (after routes so dependencies load)
console.log('[server] Seeding leads...')
require('./models/lead').Lead.createSeededLeads()
console.log('[server] Leads seeded:', require('./models/lead').getStore().length)
console.log('[server] Seeding orders...')
require('./models/order').Order.createSeededOrders()
console.log('[server] Orders seeded:', require('./models/order').getStore().length)
console.log('[server] Initializing members store...')
initMembersStore()
console.log('[server] Members initialized:', getMembers().length)

/* ---- PSN Metrics Computation ---- */
function computePSNMetrics(psnId) {
  const members = getMembers().filter(m => m.psnId === psnId);
  const activeMembers = members.filter(m => m.status === 'active');

  // Training metrics
  const trainees = getTraineesByPSN(psnId);
  const habitScores = trainees.flatMap(t => t.avg_habit_score !== 'N/A' ? [t.avg_habit_score] : []);
  const habitAvg = habitScores.length > 0
    ? habitScores.reduce((a, b) => a + b, 0) / habitScores.length
    : 0;

  // Activity ratio: trainees with activity in last 2 days
  const now = Date.now();
  const activeRecently = trainees.filter(t => {
    if (!t.last_activity) return false;
    const daysSince = (now - new Date(t.last_activity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 2;
  }).length;
  const activityRatio = trainees.length > 0 ? activeRecently / trainees.length : 0;

  // Connect average (from onboarding)
  const sessions = getActiveSessions();
  const psnSessions = sessions.filter(s => s.psnId === psnId);
  const connectAvg = psnSessions.length > 0
    ? psnSessions.reduce((sum, s) => sum + (s.connectsToday || 0), 0) / psnSessions.length
    : 0;

  // Revenue delta (month over month)
  const orders = allOrders().filter(o => {
    const member = members.find(m => m.id === o.leadId);
    return member && o.paymentStatus === 'paid';
  });
  const thisMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, o) => sum + o.totalVND, 0);
  const lastMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, o) => sum + o.totalVND, 0);
  const revenueDelta = lastMonth > 0 ? (thisMonth - lastMonth) / lastMonth : 0;

  // Retention (simplified: members active this month / members from last month)
  const retention30d = members.length > 0 ? activeMembers.length / members.length : 0;
  const retention90d = retention30d; // simplified

  return {
    team_size: activeMembers.length,
    retention_30d: retention30d,
    retention_90d: retention90d,
    revenue_delta: revenueDelta,
    activity_ratio: activityRatio,
    habit_avg: habitAvg,
    connect_avg: connectAvg
  };
}

/* ---- Scheduled Evaluation ---- */
function runScheduledEvaluation() {
  console.log('[cron] Running scheduled PSN health evaluation...');
  const members = getMembers();
  const psnIds = [...new Set(members.map(m => m.psnId).filter(Boolean))];

  for (const psnId of psnIds) {
    try {
      const metrics = computePSNMetrics(psnId);
      const fired = evaluateAll(metrics, psnId);
      if (fired.length > 0) {
        console.log(`[cron] PSN ${psnId}: ${fired.length} alerts fired`);
        // Trigger webhook notifications
        triggerWebhooks(psnId, fired, metrics);
      }
    } catch (err) {
      console.error(`[cron] Error evaluating PSN ${psnId}:`, err.message);
    }
  }
}

// Run every 4 hours - only when running as main (not in tests)
let scheduledInterval = null;
let funnelCronInterval = null;
let stalledLeadsCronInterval = null;
if (require.main === module) {
  scheduledInterval = setInterval(runScheduledEvaluation, 4 * 60 * 60 * 1000);
  console.log('[cron] Scheduled evaluation started (every 4 hours)');

  // Funnel auto-transition cron
  const { evaluateAutoTransitions } = require('./automation/funnelRules');
  funnelCronInterval = setInterval(() => {
    console.log('[cron] Running funnel auto-transition evaluation...');
    try {
      const actions = evaluateAutoTransitions();
      if (actions.length > 0) {
        console.log(`[cron] Funnel: ${actions.length} auto-transitions queued`);
        actions.forEach(a => console.log(`  - Lead ${a.leadId} -> Tier ${a.toTier}: ${a.reason}`));
      }
    } catch (err) {
      console.error('[cron] Funnel auto-transition error:', err.message);
    }
  }, 4 * 60 * 60 * 1000);
  console.log('[cron] Funnel auto-transition cron started (every 4 hours)');

  // Stalled leads detection cron
  const { getStalledLeads } = require('./automation/funnelRules');
  stalledLeadsCronInterval = setInterval(() => {
    console.log('[cron] Checking for stalled leads...');
    try {
      const stalled = getStalledLeads();
      if (stalled.length > 0) {
        console.log(`[cron] Stalled leads: ${stalled.length} leads need attention`);
        stalled.forEach(l => console.log(`  - ${l.id} (${l.name}): tier ${l.funnelLevel}, ${l.daysSinceContact} days since contact`));
      }
    } catch (err) {
      console.error('[cron] Stalled leads error:', err.message);
    }
  }, 4 * 60 * 60 * 1000);
  console.log('[cron] Stalled leads cron started (every 4 hours)');
}

/* ---- Webhook Notifications ---- */
const webhookSubscriptions = [];

function subscribeWebhook(url, events = ['*']) {
  const sub = { id: crypto.randomUUID(), url, events, createdAt: new Date().toISOString() };
  webhookSubscriptions.push(sub);
  return sub;
}

function unsubscribeWebhook(id) {
  const idx = webhookSubscriptions.findIndex(s => s.id === id);
  if (idx === -1) return false;
  webhookSubscriptions.splice(idx, 1);
  return true;
}

async function triggerWebhooks(psnId, alerts, metrics) {
  const payload = { psnId, alerts, metrics, timestamp: new Date().toISOString() };
  for (const sub of webhookSubscriptions) {
    if (sub.events.includes('*') || sub.events.some(e => alerts.some(a => a.action === e))) {
      try {
        await fetch(sub.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log(`[webhook] Delivered to ${sub.url}`);
      } catch (err) {
        console.error(`[webhook] Failed to deliver to ${sub.url}:`, err.message);
      }
    }
  }
}

// Make webhook functions available globally for API routes
global.webhookManager = { subscribeWebhook, unsubscribeWebhook, triggerWebhooks, getSubscriptions: () => webhookSubscriptions };

// Routes
app.use('/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/kpi', kpiRoutes);
// app.use('/api/alerts', alertRoutes);  // Legacy alerts - replaced by inline routes below

// Analytics routes
app.post('/api/analytics/psn-health', (req, res) => {
  const result = classifyPSNHealth(req.body);
  res.json(result);
});

app.post('/api/alerts/evaluate', (req, res) => {
  const { metrics, psnId } = req.body;
  if (!metrics) return res.status(400).json({ error: 'metrics required' });
  const fired = evaluateAll(metrics, psnId);
  res.json({ fired, count: fired.length });
});

app.get('/api/alerts/rules', (req, res) => {
  res.json({ rules: getRules() });
});

app.get('/api/alerts/log', (req, res) => {
  res.json({ alerts: getAlertLog(req.query) });
});

app.get('/api/alerts/summary', (req, res) => {
  res.json(getAlertSummary());
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = acknowledgeAlert(req.params.id, req.body.userId);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

/* ---- Alert Engine CRUD ---- */
app.post('/api/alerts/rules', (req, res) => {
  const rule = addRule(req.body);
  res.status(201).json(rule);
});

app.put('/api/alerts/rules/:id', (req, res) => {
  const rule = updateRule(req.params.id, req.body);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  res.json(rule);
});

app.delete('/api/alerts/rules/:id', (req, res) => {
  const deleted = deleteRule(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Rule not found' });
  res.json({ success: true });
});

/* ---- Webhook Management ---- */
app.post('/api/alerts/webhooks', (req, res) => {
  const { url, events } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const sub = subscribeWebhook(url, events);
  res.status(201).json(sub);
});

app.get('/api/alerts/webhooks', (req, res) => {
  res.json({ subscriptions: global.webhookManager.getSubscriptions() });
});

app.delete('/api/alerts/webhooks/:id', (req, res) => {
  const deleted = unsubscribeWebhook(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Subscription not found' });
  res.json({ success: true });
});

/* ---- Scheduled Evaluation Trigger ---- */
app.post('/api/alerts/evaluate-scheduled', (req, res) => {
  runScheduledEvaluation();
  res.json({ success: true, message: 'Scheduled evaluation triggered' });
});

/* ---- PSN Metrics Computation ---- */
app.get('/api/alerts/psn-metrics/:psnId', (req, res) => {
  const metrics = computePSNMetrics(req.params.psnId);
  res.json(metrics);
});

// Onboarding routes
app.post('/api/onboarding/start', (req, res) => {
  const { memberId, ...memberData } = req.body;
  if (!memberId) return res.status(400).json({ error: 'memberId required' });
  const session = startOnboarding(memberId, memberData);

  // Also assign training curriculum
  const trainingRecord = assignCurriculum(memberId, memberData);
  if (trainingRecord.error) console.warn('[onboarding:start] training assign:', trainingRecord.error);

  res.json({ session, training: trainingRecord });
});

app.get('/api/onboarding/:memberId', (req, res) => {
  const session = getSession(req.params.memberId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const training = getRecord(req.params.memberId);
  res.json({ session, training });
});

app.post('/api/onboarding/:memberId/advance', (req, res) => {
  const result = advanceDay(req.params.memberId);
  if (result.error) return res.status(404).json(result);

  // Also update training progress
  const trainingResult = updateProgress(req.params.memberId, { type: 'day_complete' });
  if (trainingResult.error) console.warn('[onboarding:advance] training progress:', trainingResult.error);

  res.json({ onboarding: result, training: trainingResult.record });
});

app.post('/api/onboarding/:memberId/nudge', (req, res) => {
  const nudge = generateNudge(req.params.memberId);
  if (nudge.error) return res.status(404).json(nudge);
  res.json(nudge);
});

app.post('/api/onboarding/:memberId/habit', (req, res) => {
  const { score } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'score required' });
  const result = require('./agents/onboardingBot').recordHabitScore(req.params.memberId, score);
  if (result.error) return res.status(404).json(result);

  // Also update training progress
  const trainingResult = updateProgress(req.params.memberId, { type: 'habit_score', value: score });
  if (trainingResult.error) console.warn('[onboarding:habit] training progress:', trainingResult.error);

  res.json({ onboarding: result, training: trainingResult.record });
});

app.post('/api/onboarding/:memberId/order', (req, res) => {
  const result = require('./agents/onboardingBot').recordOrder(req.params.memberId);
  if (result.error) return res.status(404).json(result);

  // Also update training progress
  const trainingResult = updateProgress(req.params.memberId, { type: 'order' });
  if (trainingResult.error) console.warn('[onboarding:order] training progress:', trainingResult.error);

  res.json({ onboarding: result, training: trainingResult.record });
});

app.get('/api/onboarding/:memberId/progress', (req, res) => {
  const progress = getProgress(req.params.memberId);
  if (progress.error) return res.status(404).json(progress);
  res.json(progress);
});

app.get('/api/onboarding/active', (req, res) => {
  res.json({ sessions: getActiveSessions() });
});

// Training Ops routes
app.post('/api/training/assign', (req, res) => {
  const { memberId, ...memberData } = req.body;
  if (!memberId) return res.status(400).json({ error: 'memberId required' });
  const record = assignCurriculum(memberId, memberData);
  if (record.error) return res.status(400).json(record);
  res.json(record);
});

app.post('/api/training/progress', (req, res) => {
  const { memberId, type, value } = req.body;
  if (!memberId || !type) return res.status(400).json({ error: 'memberId and type required' });
  const result = updateProgress(memberId, { type, value });
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

app.get('/api/training/:memberId', (req, res) => {
  const record = getRecord(req.params.memberId);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

app.get('/api/training/:memberId/progress', (req, res) => {
  const progress = getTrainingProgress(req.params.memberId);
  if (progress.error) return res.status(404).json(progress);
  res.json(progress);
});

app.get('/api/training/active', (req, res) => {
  res.json({ trainees: getActiveTrainees() });
});

app.get('/api/training/attention', (req, res) => {
  res.json({ needing_attention: getTraineesNeedingAttention() });
});

app.get('/api/training/psn/:psnId', (req, res) => {
  res.json({ trainees: getTraineesByPSN(req.params.psnId) });
});

// Graduation check endpoint - checks both onboarding and training systems
app.get('/api/training/graduation-check/:memberId', (req, res) => {
  const { memberId } = req.params;
  const onboardingSession = getSession(memberId);
  const trainingRecord = getRecord(memberId);

  const onboardingGraduated = onboardingSession && onboardingSession.status === 'graduated';
  const trainingGraduated = trainingRecord && trainingRecord.status === 'graduated';

  // Check criteria for both
  let onboardingReady = false;
  if (onboardingSession && onboardingSession.status === 'active') {
    onboardingReady = checkGraduation(onboardingSession) && onboardingSession.completedWeeks.length >= 4;
  }

  let trainingReady = false;
  if (trainingRecord && trainingRecord.status === 'active') {
    trainingReady = trainingRecord.completed_days >= trainingRecord.total_days;
  }

  res.json({
    memberId,
    onboarding: {
      status: onboardingSession?.status || 'not_started',
      graduated: onboardingGraduated,
      ready: onboardingReady,
      orders: onboardingSession?.orders || 0,
      completedWeeks: onboardingSession?.completedWeeks?.length || 0,
    },
    training: {
      status: trainingRecord?.status || 'not_started',
      graduated: trainingGraduated,
      ready: trainingReady,
      completedDays: trainingRecord?.completed_days || 0,
      totalDays: trainingRecord?.total_days || 0,
    },
    synced: onboardingGraduated === trainingGraduated,
    overallStatus: onboardingGraduated && trainingGraduated ? 'graduated' :
                   onboardingReady && trainingReady ? 'ready' : 'in_progress'
  });
});

// Funnel OS routes
app.use('/api/leads', leadsRoutes);
app.use('/api/analytics/funnel', analyticsFunnelRoutes);
ordersHandler(app);

// Health check
app.get('/health', (req, res) => {
  res.json(getHealthStatus());
});

// Monitoring routes
app.get('/api/monitoring/errors', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ errors: monitoring.getErrorLog(limit) });
});

app.get('/api/monitoring/summary', (req, res) => {
  res.json(monitoring.getErrorSummary());
});

// 404 handler
app.use(notFoundMiddleware);

// Error middleware (must be last)
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🐝 Hive Warfare OS running on port ${PORT}`);
  });
} else {
  module.exports = {
    app,
    subscribeWebhook,
    unsubscribeWebhook,
    getSubscriptions: () => webhookSubscriptions
  };
}
