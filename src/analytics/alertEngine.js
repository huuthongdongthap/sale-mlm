/**
 * T-006: Alert Rules Engine
 *
 * Rule DSL: { metric, op, threshold, window, action, severity }
 *
 * Metrics: team_size, retention_30d, retention_90d, revenue_delta,
 *          activity_ratio, habit_avg, connect_avg, psn_health_score
 *
 * Operators: <, <=, >, >=, ==, !=
 *
 * Actions: notify_leader, notify_admin, escalate, auto_buddy, schedule_review
 *
 * Severity: critical, warning, info
 */

const crypto = require('crypto');
const { classifyPSNHealth } = require('../analytics/psnHealth');

// In-memory rule storage
const rules = [];
const alertLog = [];

/**
 * Default seeded rules
 */
const DEFAULT_RULES = [
  {
    id: 'rule-retention-critical',
    name: 'Retention Below 30%',
    metric: 'retention_30d',
    op: '<',
    threshold: 0.30,
    window: 'daily',
    action: 'escalate',
    severity: 'critical',
    message: 'PSN retention dưới 30% — cần can thiệp ngay',
    active: true
  },
  {
    id: 'rule-habit-low',
    name: 'Habit Score Below 2.5',
    metric: 'habit_avg',
    op: '<',
    threshold: 2.5,
    window: 'daily',
    action: 'auto_buddy',
    severity: 'warning',
    message: 'Điểm thói quen trung bình dưới 2.5 — kích hoạt buddy system',
    active: true
  },
  {
    id: 'rule-activity-low',
    name: 'Activity Ratio Below 40%',
    metric: 'activity_ratio',
    op: '<',
    threshold: 0.40,
    window: 'weekly',
    action: 'notify_leader',
    severity: 'warning',
    message: 'Tỷ lệ hoạt động dưới 40% — leader cần check-in',
    active: true
  },
  {
    id: 'rule-revenue-decline',
    name: 'Revenue Decline > 20%',
    metric: 'revenue_delta',
    op: '<',
    threshold: -0.20,
    window: 'weekly',
    action: 'schedule_review',
    severity: 'warning',
    message: 'Doanh số giảm hơn 20% — cần review chiến lược',
    active: true
  },
  {
    id: 'rule-connects-low',
    name: 'Connects Below 8/day',
    metric: 'connect_avg',
    op: '<',
    threshold: 8,
    window: 'daily',
    action: 'notify_leader',
    severity: 'info',
    message: 'Trung bình kết nối dưới 8/ngày — nhắc nhở Connect Engine',
    active: true
  },
  {
    id: 'rule-psn-critical',
    name: 'PSN Health Score Critical',
    metric: 'psn_health_score',
    op: '<=',
    threshold: 25,
    window: 'daily',
    action: 'escalate',
    severity: 'critical',
    message: 'PSN health score ở mức Tử Địa — can thiệp khẩn cấp',
    active: true
  }
];

/**
 * Initialize with default rules
 */
function initRules() {
  if (rules.length === 0) {
    rules.push(...DEFAULT_RULES.map(r => ({ ...r })));
  }
  return [...rules];
}

/**
 * Evaluate a single rule against a metric value
 */
function evaluateRule(rule, metricValue) {
  if (!rule.active) return false;

  const { op, threshold } = rule;

  switch (op) {
    case '<': return metricValue < threshold;
    case '<=': return metricValue <= threshold;
    case '>': return metricValue > threshold;
    case '>=': return metricValue >= threshold;
    case '==': return metricValue === threshold;
    case '!=': return metricValue !== threshold;
    default: return false;
  }
}

/**
 * Evaluate all rules against current PSN metrics
 * @param {Object} metrics - PSN metrics
 * @param {string} psnId - PSN identifier
 * @returns {Array} Array of fired alerts
 */
function evaluateAll(metrics, psnId = 'unknown') {
  const activeRules = rules.filter(r => r.active);
  const fired = [];

  // Also compute PSN health score if not provided
  const psnHealth = classifyPSNHealth(metrics);
  const fullMetrics = { ...metrics, psn_health_score: psnHealth.score };

  for (const rule of activeRules) {
    const metricValue = fullMetrics[rule.metric];
    if (metricValue === undefined || metricValue === null) continue;

    if (evaluateRule(rule, metricValue)) {
      const alert = {
        id: crypto.randomUUID(),
        rule_id: rule.id,
        rule_name: rule.name,
        psn_id: psnId,
        metric: rule.metric,
        metric_value: metricValue,
        threshold: rule.threshold,
        operator: rule.op,
        severity: rule.severity,
        action: rule.action,
        message: rule.message,
        fired_at: new Date().toISOString(),
        acknowledged: false,
        psn_health: psnHealth
      };

      alertLog.push(alert);
      fired.push(alert);
    }
  }

  return fired;
}

/**
 * Add a new rule
 */
function addRule(ruleData) {
  const rule = {
    id: ruleData.id || crypto.randomUUID(),
    name: ruleData.name,
    metric: ruleData.metric,
    op: ruleData.op,
    threshold: ruleData.threshold,
    window: ruleData.window || 'daily',
    action: ruleData.action || 'notify_leader',
    severity: ruleData.severity || 'warning',
    message: ruleData.message || '',
    active: ruleData.active !== undefined ? ruleData.active : true,
    created_at: new Date().toISOString()
  };

  rules.push(rule);
  return rule;
}

/**
 * Update a rule
 */
function updateRule(ruleId, updates) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return null;

  rules[idx] = { ...rules[idx], ...updates, updated_at: new Date().toISOString() };
  return rules[idx];
}

/**
 * Delete a rule
 */
function deleteRule(ruleId) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;

  rules.splice(idx, 1);
  return true;
}

/**
 * Get all rules
 */
function getRules() {
  return [...rules];
}

/**
 * Get alert log
 */
function getAlertLog(filters = {}) {
  let logs = [...alertLog];

  if (filters.severity) {
    logs = logs.filter(a => a.severity === filters.severity);
  }
  if (filters.psn_id) {
    logs = logs.filter(a => a.psn_id === filters.psn_id);
  }
  if (filters.acknowledged !== undefined) {
    logs = logs.filter(a => a.acknowledged === filters.acknowledged);
  }

  return logs.sort((a, b) => new Date(b.fired_at) - new Date(a.fired_at));
}

/**
 * Acknowledge an alert
 */
function acknowledgeAlert(alertId, userId) {
  const alert = alertLog.find(a => a.id === alertId);
  if (!alert) return null;

  alert.acknowledged = true;
  alert.acknowledged_by = userId;
  alert.acknowledged_at = new Date().toISOString();
  return alert;
}

/**
 * Get alert summary
 */
function getAlertSummary() {
  const total = alertLog.length;
  const unacknowledged = alertLog.filter(a => !a.acknowledged).length;
  const bySeverity = {};
  const byAction = {};

  for (const alert of alertLog) {
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    byAction[alert.action] = (byAction[alert.action] || 0) + 1;
  }

  return {
    total,
    unacknowledged,
    acknowledged: total - unacknowledged,
    bySeverity,
    byAction,
    latest: alertLog.length > 0 ? alertLog[0] : null
  };
}

module.exports = {
  initRules,
  evaluateRule,
  evaluateAll,
  addRule,
  updateRule,
  deleteRule,
  getRules,
  getAlertLog,
  acknowledgeAlert,
  getAlertSummary,
  DEFAULT_RULES,
  rules,
  alertLog
};
