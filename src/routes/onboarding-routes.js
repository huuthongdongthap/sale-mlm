/**
 * Routes — onboarding bot and training ops endpoints
 */

const { startOnboarding, getSession, advanceDay, generateNudge, getProgress, getActiveSessions, checkGraduation } = require('../agents/onboardingBot');
const { assignCurriculum, getRecord, updateProgress, getProgress: getTrainingProgress, getActiveTrainees, getTraineesNeedingAttention, getTraineesByPSN } = require('../agents/trainingOps');

function registerOnboardingRoutes(app, db) {
  // Onboarding bot
  app.post('/api/onboarding/start', (req, res) => {
    const { memberId, psnId, name, tier, phone } = req.body;
    const session = startOnboarding(memberId, { psnId, name, tier, phone });
    res.status(200).json({ session });
  });

  app.get('/api/onboarding/:memberId', (req, res) => {
    const session = getSession(req.params.memberId);
    if (!session) return res.status(404).json({ error: 'No onboarding session' });
    res.json(session);
  });

  app.post('/api/onboarding/:memberId/advance', (req, res) => {
    const session = advanceDay(req.params.memberId);
    if (!session) return res.status(404).json({ error: 'No onboarding session' });
    res.json(session);
  });

  app.post('/api/onboarding/:memberId/nudge', (req, res) => {
    const nudge = generateNudge(req.params.memberId);
    res.json(nudge);
  });

  app.post('/api/onboarding/:memberId/habit', (req, res) => {
    const { items, score, streak } = req.body;
    if (!items) return res.status(400).json({ error: 'items required' });
    const session = getSession(req.params.memberId);
    if (!session) return res.status(404).json({ error: 'No onboarding session' });
    // Record habit checkin
    if (db) {
      db.recordCheckin(req.params.memberId, new Date().toISOString().split('T')[0], items, score || 0, streak || 0);
    }
    res.json({ ok: true });
  });

  app.post('/api/onboarding/:memberId/order', (req, res) => {
    const { productId, quantity, unitPriceVND } = req.body;
    const session = getSession(req.params.memberId);
    if (!session) return res.status(404).json({ error: 'No onboarding session' });
    res.json({ ok: true, message: 'Order recorded (placeholder)' });
  });

  app.get('/api/onboarding/:memberId/progress', (req, res) => {
    const progress = getProgress(req.params.memberId);
    if (!progress) return res.status(404).json({ error: 'No onboarding session' });
    res.json(progress);
  });

  app.get('/api/onboarding/active', (req, res) => {
    res.json(getActiveSessions());
  });

  // Training ops
  app.post('/api/training/assign', (req, res) => {
    const { memberId, name, tier, phone } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId required' });
    const record = assignCurriculum(memberId, { name, tier, phone });
    res.status(200).json({ memberId: record.memberId, ...record });
  });

  app.post('/api/training/progress', (req, res) => {
    const { memberId, type, value } = req.body;
    if (!memberId || !type) return res.status(400).json({ error: 'memberId and type required' });
    updateProgress(memberId, type, value);
    res.json({ ok: true });
  });

  app.get('/api/training/:memberId', (req, res) => {
    const record = getRecord(req.params.memberId);
    if (!record) return res.status(404).json({ error: 'No training record' });
    res.json(record);
  });

  app.get('/api/training/:memberId/progress', (req, res) => {
    const progress = getTrainingProgress(req.params.memberId);
    if (!progress) return res.status(404).json({ error: 'No training record' });
    res.json(progress);
  });

  app.get('/api/training/active', (req, res) => {
    res.json(getActiveTrainees());
  });

  app.get('/api/training/attention', (req, res) => {
    res.json(getTraineesNeedingAttention());
  });

  app.get('/api/training/psn/:psnId', (req, res) => {
    res.json(getTraineesByPSN(req.params.psnId));
  });

  // Graduation check
  app.post('/api/onboarding/:memberId/graduation', (req, res) => {
    const result = checkGraduation(req.params.memberId);
    res.json(result);
  });
}

module.exports = { registerOnboardingRoutes };