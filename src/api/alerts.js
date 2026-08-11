const express = require('express');
const router = express.Router();
const { requireAuth, requirePSNLeader } = require('../middleware/requireRole');

// 6 Alert Rules from plan.md
const ALERT_RULES = [
  { id: 'conversion_low', trigger: 'Conversion < 15%', action: 'Notify leader + watchlist', severity: 'red' },
  { id: 'lead_drop', trigger: 'Leads < 100/week', action: 'MiniBoost campaign + notify core', severity: 'yellow' },
  { id: 'habit_drop', trigger: 'Habit score < 3', action: 'Assign buddy + schedule 1:1', severity: 'red' },
  { id: 'psn_weak', trigger: 'PSN avg habit < 3', action: 'Escalate + coaching pack', severity: 'red' },
  { id: 'retention_risk', trigger: 'Risk = High', action: 'Immediate 1:1 + ticket', severity: 'critical' },
  { id: 'q2_neglect', trigger: 'Q2 tasks < 40%', action: 'Block time + notify leader', severity: 'red' },
];

const alertLog = [];

// GET /api/alerts/rules — List all alert rules
router.get('/rules', requireAuth, (req, res) => {
  res.json(ALERT_RULES);
});

// POST /api/alerts/check — Run alert engine against member data
router.post('/check', requireAuth, (req, res) => {
  const { memberId, habitScore, conversionRate, leadsWeek, psnAvgHabit, retentionRisk, q2Pct } = req.body;
  const triggered = [];

  if (conversionRate < 15) triggered.push({ ...ALERT_RULES[0], memberId });
  if (leadsWeek < 100) triggered.push({ ...ALERT_RULES[1], memberId });
  if (habitScore < 3) triggered.push({ ...ALERT_RULES[2], memberId });
  if (psnAvgHabit < 3) triggered.push({ ...ALERT_RULES[3], memberId });
  if (retentionRisk === 'high') triggered.push({ ...ALERT_RULES[4], memberId });
  if (q2Pct < 40) triggered.push({ ...ALERT_RULES[5], memberId });

  alertLog.push(...triggered.map(a => ({ ...a, timestamp: new Date().toISOString() })));
  res.json({ alertsTriggered: triggered.length, alerts: triggered });
});

// GET /api/alerts/log — View alert history
router.get('/log', requireAuth, requirePSNLeader, (req, res) => {
  res.json(alertLog);
});

module.exports = router;
