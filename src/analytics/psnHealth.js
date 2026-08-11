/**
 * T-005: PSN Health Score — Cửu Địa 9-State Classifier
 *
 * Based on Sun Tzu's "Nine Terrains" (九地) applied to PSN health.
 *
 * Inputs:
 *   - team_size: number of active members
 *   - retention_30d: 30-day retention rate (0-1)
 *   - retention_90d: 90-day retention rate (0-1)
 *   - revenue_delta: month-over-month revenue change (-1 to +1)
 *   - activity_ratio: fraction of members active this week (0-1)
 *   - habit_avg: average habit score across team (0-6)
 *   - connect_avg: average daily connects per member
 *
 * Output: state 1-9 (Cửu Địa)
 *   1 = Tán Địa (Scattered) — team falling apart
 *   2 = Khinh Địa (Light) — new, uncommitted
 *   3 = Tranh Địa (Contested) — fighting for survival
 *   4 = Giao Địa (Intersecting) — crossroads, could go either way
 *   5 = Cù Địa (Thoroughfare) — busy but not deep
 *   6 = Trọng Địa (Heavy) — committed, stable
 *   7 = Phạp Địa (Difficult) — struggling but holding
 *   8 = Vi Địa (Surrounded) — trapped, needs rescue
 *   9 = Tử Địa (Death) — beyond recovery
 *
 * Actually, let me simplify to 9 practical states:
 *   1 = Critical (Tử Địa) — immediate intervention needed
 *   2 = Declining (Phạp Địa) — downward trend
 *   3 = At Risk (Vi Địa) — warning signs
 *   4 = Unstable (Giao Địa) — inconsistent performance
 *   5 = Average (Cù Địa) — meeting minimums
 *   6 = Stable (Trọng Địa) — consistent, healthy
 *   7 = Growing (Tranh Địa) — upward momentum
 *   8 = Thriving (Khinh Địa) — exceeding targets
 *   9 = Elite (Tán Địa) — model PSN, mentorship ready
 */

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

/**
 * Get detailed health factors
 */
function getHealthFactors(metrics) {
  const {
    team_size, retention_30d, retention_90d,
    revenue_delta, activity_ratio, habit_avg, connect_avg
  } = metrics;

  return {
    team_size: {
      value: team_size,
      status: team_size >= 5 ? 'healthy' : team_size >= 3 ? 'warning' : 'critical',
      target: 5
    },
    retention_30d: {
      value: Math.round(retention_30d * 100) + '%',
      status: retention_30d >= 0.7 ? 'healthy' : retention_30d >= 0.5 ? 'warning' : 'critical',
      target: '70%'
    },
    retention_90d: {
      value: Math.round(retention_90d * 100) + '%',
      status: retention_90d >= 0.6 ? 'healthy' : retention_90d >= 0.4 ? 'warning' : 'critical',
      target: '60%'
    },
    revenue_delta: {
      value: Math.round(revenue_delta * 100) + '%',
      status: revenue_delta >= 0.1 ? 'healthy' : revenue_delta >= -0.1 ? 'warning' : 'critical',
      target: '+10%'
    },
    activity_ratio: {
      value: Math.round(activity_ratio * 100) + '%',
      status: activity_ratio >= 0.7 ? 'healthy' : activity_ratio >= 0.4 ? 'warning' : 'critical',
      target: '70%'
    },
    habit_avg: {
      value: habit_avg.toFixed(1) + '/6',
      status: habit_avg >= 4 ? 'healthy' : habit_avg >= 2.5 ? 'warning' : 'critical',
      target: '4/6'
    },
    connect_avg: {
      value: Math.round(connect_avg) + '/day',
      status: connect_avg >= 12 ? 'healthy' : connect_avg >= 8 ? 'warning' : 'critical',
      target: '15/day'
    }
  };
}

/**
 * State labels (Cửu Địa — 9 Terrains)
 */
const STATE_LABELS = {
  1: { vi: 'Tử Địa — Nguy Cấp', en: 'Critical — Immediate Intervention', color: '#EF4444', icon: '🔴' },
  2: { vi: 'Phạp Địa — Suy Giảm', en: 'Declining — Downward Trend', color: '#F97316', icon: '🟠' },
  3: { vi: 'Vi Địa — Cảnh Báo', en: 'At Risk — Warning Signs', color: '#EAB308', icon: '🟡' },
  4: { vi: 'Giao Địa — Không Ổn Định', en: 'Unstable — Inconsistent', color: '#A3E635', icon: '🟢' },
  5: { vi: 'Cù Địa — Trung Bình', en: 'Average — Meeting Minimums', color: '#22C55E', icon: '🟢' },
  6: { vi: 'Trọng Địa — Ổn Định', en: 'Stable — Consistent & Healthy', color: '#10B981', icon: '💚' },
  7: { vi: 'Tranh Địa — Tăng Trưởng', en: 'Growing — Upward Momentum', color: '#06B6D4', icon: '📈' },
  8: { vi: 'Khinh Địa — Phát Triển', en: 'Thriving — Exceeding Targets', color: '#8B5CF6', icon: '⭐' },
  9: { vi: 'Tán Địa — Ưu Tú', en: 'Elite — Model PSN', color: '#FFD700', icon: '👑' }
};

/**
 * Get state label by number
 */
function getStateLabel(state) {
  return STATE_LABELS[state] || STATE_LABELS[1];
}

/**
 * Get recommended actions for a given state
 */
function getRecommendedActions(state) {
  const actions = {
    1: ['Immediate leader intervention', '1:1 with every member', 'Emergency PSN meeting', 'Consider restructure'],
    2: ['Identify root cause of decline', 'Increase coaching frequency', 'Review member engagement', 'Set recovery targets'],
    3: ['Weekly health check-ins', 'Buddy system activation', 'Habit score improvement plan', 'Connect engine review'],
    4: ['Stabilize daily routines', 'Focus on habit consistency', 'Team bonding activities', 'Set weekly milestones'],
    5: ['Maintain current momentum', 'Push for 10% improvement', 'Cross-PSN learning', 'Skill development focus'],
    6: ['Optimize processes', 'Mentor other PSNs', 'Advanced training modules', 'Leadership development'],
    7: ['Scale successful practices', 'Document best practices', 'Prepare for Tier 2 transition', 'Recognition & rewards'],
    8: ['Share methodology', 'Lead training sessions', 'Expand PSN network', 'Consider new PSN formation'],
    9: ['Mentor new leaders', 'System thinking development', 'Campaign warfare planning', 'Legacy building']
  };
  return actions[state] || actions[5];
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
