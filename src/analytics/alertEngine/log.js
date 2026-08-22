/**
 * Alert log: getAlertLog, acknowledgeAlert, getAlertSummary
 */
const { alertLog } = require('./state');

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

module.exports = { getAlertLog, acknowledgeAlert, getAlertSummary };