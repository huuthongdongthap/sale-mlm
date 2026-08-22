/**
 * T-006: Alert Rules Engine — composition barrel
 *
 * Re-exports the public API from focused submodules while keeping the
 * original in-memory singletons (rules, alertLog) shared across callers.
 */
const { rules, alertLog } = require('./state');
const { DEFAULT_RULES, initRules, addRule, updateRule, deleteRule, getRules } = require('./rules');
const { evaluateRule, evaluateAll } = require('./evaluate');
const { getAlertLog, acknowledgeAlert, getAlertSummary } = require('./log');

module.exports = {
  DEFAULT_RULES,
  rules,
  alertLog,
  initRules,
  evaluateRule,
  evaluateAll,
  addRule,
  updateRule,
  deleteRule,
  getRules,
  getAlertLog,
  acknowledgeAlert,
  getAlertSummary
};