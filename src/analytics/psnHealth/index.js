/**
 * T-005: PSN Health Score — Cửu Địa 9-State Classifier — composition barrel
 */
const { calculateHealthScore, scoreToState } = require('./score');
const { getHealthFactors } = require('./factors');
const { STATE_LABELS, getStateLabel, getRecommendedActions } = require('./labels');

/**
 * Cửu Địa 9-state classifier
 * @param {Object} metrics - PSN health metrics
 * @returns {Object} { state: 1-9, label, score: 0-100, factors }
 */
function classifyPSNHealth(metrics) {
  const {
    team_size = 0,
    retention_30d = 0,
    retention_90d = 0,
    revenue_delta = 0,
    activity_ratio = 0,
    habit_avg = 0,
    connect_avg = 0
  } = metrics;

  // Calculate weighted health score (0-100)
  const score = calculateHealthScore({
    team_size, retention_30d, retention_90d,
    revenue_delta, activity_ratio, habit_avg, connect_avg
  });

  // Determine state based on score and key indicators
  const state = scoreToState(score, { retention_30d, revenue_delta, activity_ratio });

  const factors = getHealthFactors({
    team_size, retention_30d, retention_90d,
    revenue_delta, activity_ratio, habit_avg, connect_avg
  });

  return {
    state,
    label: STATE_LABELS[state],
    score: Math.round(score),
    factors,
    classified_at: new Date().toISOString()
  };
}

module.exports = {
  classifyPSNHealth,
  calculateHealthScore,
  scoreToState,
  getHealthFactors,
  getStateLabel,
  getRecommendedActions,
  STATE_LABELS
};