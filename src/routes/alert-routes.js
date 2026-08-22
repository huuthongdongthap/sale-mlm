/**
 * Routes — alert management endpoints
 */

const { evaluateAll, getRules, getAlertLog, getAlertSummary, acknowledgeAlert, addRule, updateRule, deleteRule } = require('../analytics/alertEngine');
const { triggerWebhooks, webhookSubscriptions, subscribeWebhook, unsubscribeWebhook } = require('../webhooks');
const { classifyPSNHealth } = require('../analytics/psnHealth');
const alertRoutes = require('../api/alerts');

function registerAlertRoutes(app) {
  // Analytics — PSN health submission (webhook from external sources).
  // Accepts metrics either as a top-level body (client contract) or wrapped
  // in { metrics } (alert-engine contract).
  app.post('/api/analytics/psn-health', (req, res) => {
    const { metrics, psnId } = req.body;
    const payload = metrics || req.body;
    if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'metrics required' });
    const fired = evaluateAll(payload, psnId);
    if (fired.length > 0) {
      console.log(`[analytics] PSN ${psnId}: ${fired.length} alerts fired`);
      triggerWebhooks(psnId, fired, payload);
    }
    res.json({ ...classifyPSNHealth(payload), fired });
  });

  // Alert management
  app.post('/api/alerts/evaluate', (req, res) => {
    const { psnId, metrics } = req.body;
    if (!psnId || !metrics) return res.status(400).json({ error: 'psnId and metrics required' });
    const fired = evaluateAll(metrics, psnId);
    if (fired.length > 0) {
      triggerWebhooks(psnId, fired, metrics);
    }
    res.json({ fired });
  });

  app.get('/api/alerts/rules', (req, res) => {
    res.json({ rules: getRules() });
  });

  app.get('/api/alerts/log', (req, res) => {
    res.json(getAlertLog(req.query));
  });

  app.get('/api/alerts/summary', (req, res) => {
    res.json(getAlertSummary(req.query));
  });

  app.post('/api/alerts/:id/acknowledge', (req, res) => {
    const result = acknowledgeAlert(req.params.id);
    res.json(result);
  });

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
    const ok = deleteRule(req.params.id);
    res.json({ success: ok });
  });

  // Webhook subscriptions
  app.post('/api/alerts/webhooks', (req, res) => {
    const sub = subscribeWebhook(req.body.url, req.body.events);
    res.status(201).json(sub);
  });

  app.get('/api/alerts/webhooks', (req, res) => {
    res.json({ subscriptions: webhookSubscriptions });
  });

  app.delete('/api/alerts/webhooks/:id', (req, res) => {
    const ok = unsubscribeWebhook(req.params.id);
    res.json({ success: ok });
  });

  // Scheduled evaluation endpoint (cron target)
  const { computePSNMetrics: computeMetrics, runScheduledEvaluation } = require('../metrics');
  app.post('/api/alerts/evaluate-scheduled', async (req, res) => {
    try {
      await runScheduledEvaluation();
      res.json({ success: true, message: 'evaluation triggered' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PSN metrics endpoint
  app.get('/api/alerts/psn-metrics/:psnId', async (req, res) => {
    const metrics = await computeMetrics(req.params.psnId);
    res.json(metrics);
  });

  // Legacy alert router (check / log / summary / acknowledge) — mounted LAST
  // so the explicit alert-engine routes above (rules CRUD, webhooks,
  // evaluate-scheduled, psn-metrics) keep their response contracts.
  app.use('/api/alerts', alertRoutes);
}

module.exports = { registerAlertRoutes };