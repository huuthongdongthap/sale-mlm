/**
 * PSN Health Score — detailed health factors
 */
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

module.exports = { getHealthFactors };