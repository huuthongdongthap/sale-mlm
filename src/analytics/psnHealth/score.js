/**
 * PSN Health Score — weighted scoring + state mapping
 */
/**
 * Calculate weighted health score 0-100
 */
function calculateHealthScore(metrics) {
  const {
    retention_30d, retention_90d, revenue_delta,
    activity_ratio, habit_avg, connect_avg
  } = metrics;

  // Weights
  const w_retention30 = 0.25;
  const w_retention90 = 0.15;
  const w_revenue = 0.20;
  const w_activity = 0.20;
  const w_habit = 0.10;
  const w_connect = 0.10;

  // Normalize each metric to 0-100
  const retention30Score = retention_30d * 100;
  const retention90Score = retention_90d * 100;
  const revenueScore = Math.max(0, Math.min(100, (revenue_delta + 1) * 50)); // -1→0, 0→50, +1→100
  const activityScore = activity_ratio * 100;
  const habitScore = (habit_avg / 6) * 100; // 0-6 → 0-100
  const connectScore = Math.min(100, (connect_avg / 15) * 100); // 15 connects = 100%

  return (
    retention30Score * w_retention30 +
    retention90Score * w_retention90 +
    revenueScore * w_revenue +
    activityScore * w_activity +
    habitScore * w_habit +
    connectScore * w_connect
  );
}

/**
 * Map score + key indicators to 9-state
 */
function scoreToState(score, indicators) {
  const { retention_30d, revenue_delta, activity_ratio } = indicators;

  // Critical overrides: very low retention or activity
  if (retention_30d < 0.2 || activity_ratio < 0.1) return 1; // Critical
  if (retention_30d < 0.35 && revenue_delta < -0.3) return 2; // Declining
  if (retention_30d < 0.5 || revenue_delta < -0.15) return 3; // At Risk

  // Score-based states
  if (score < 25) return 1; // Critical
  if (score < 35) return 2; // Declining
  if (score < 45) return 3; // At Risk
  if (score < 55) return 4; // Unstable
  if (score < 65) return 5; // Average
  if (score < 75) return 6; // Stable
  if (score < 85) return 7; // Growing
  if (score < 95) return 8; // Thriving
  return 9; // Elite
}

module.exports = { calculateHealthScore, scoreToState };