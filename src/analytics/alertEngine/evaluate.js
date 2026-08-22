/**
 * Rule evaluation: evaluateRule, evaluateAll
 */
const crypto = require('crypto');
const { rules } = require('./state');
const { alertLog } = require('./state');
const { classifyPSNHealth } = require('../psnHealth');

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

module.exports = { evaluateRule, evaluateAll };