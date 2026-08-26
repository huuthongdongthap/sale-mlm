/**
 * Mock PSN Health API — per-PSN record generation
 */

/**
 * Generate a single mock PSN record, sampling a state from the weighted
 * distribution and computing its metrics + 4-week trajectory.
 */
function generateMockPSN(i, states, generateTrajectory) {
  // Weighted state distribution - favor healthier states
  const stateWeights = [0.05, 0.15, 0.10, 0.20, 0.15, 0.15, 0.10, 0.07, 0.03];
  let random = Math.random();
  let stateId = 1;

  for (let j = 0; j < stateWeights.length; j++) {
    random -= stateWeights[j];
    if (random <= 0) {
      stateId = j + 1;
      break;
    }
  }

  const state = states[stateId - 1];
  const teamSize = Math.floor(Math.random() * 25) + 3; // 3-27 team members
  const retention30d = Math.random() * 0.4 + 0.6; // 60-100%
  const retention90d = retention30d * (Math.random() * 0.2 + 0.8); // Slightly lower than 30d
  const revenueThisMonth = Math.floor(Math.random() * 50000000) + 5000000; // 5M-55M VND
  const revenueLastMonth = revenueThisMonth * (Math.random() * 0.6 + 0.7); // Revenue delta context
  const activityRatio = Math.random() * 0.3 + 0.7; // 70-100%

  // Generate 4-week trajectory based on current state
  const trajectory = generateTrajectory(stateId, 4);

  // Determine top risk based on state and metrics
  let topRisk = 'Không có rủi ro đáng kể';
  if (stateId >= 7) {
    const risks = [
      'Retention rate giảm mạnh',
      'Team size thu hẹp',
      'Revenue giảm 3 tuần liên tiếp',
      'Activity ratio < 50%',
      'Không có new recruit 2 tuần',
      'Habit score team trung bình < 3'
    ];
    topRisk = risks[Math.floor(Math.random() * risks.length)];
  } else if (stateId >= 4) {
    const mediumRisks = [
      'Cần tăng cường training',
      'Follow-up chưa đều',
      'Cần mở rộng warm market'
    ];
    topRisk = mediumRisks[Math.floor(Math.random() * mediumRisks.length)];
  }

  return {
    id: `PSN-${String(i).padStart(3, '0')}`,
    leader_name: `Chỉ Huy ${String.fromCharCode(64 + i)}`,
    current_state: state,
    team_size: teamSize,
    retention_30d: Math.round(retention30d * 100),
    retention_90d: Math.round(retention90d * 100),
    revenue_current: revenueThisMonth,
    revenue_previous: Math.floor(revenueLastMonth),
    revenue_delta: Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100),
    activity_ratio: Math.round(activityRatio * 100),
    trajectory_4weeks: trajectory,
    top_risk: topRisk,
    last_updated: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Within 24h
    buddy_assigned: stateId >= 7 ? `Mentor ${String.fromCharCode(75 + (i % 10))}` : null,
    escalation_level: stateId >= 8 ? 'urgent' : stateId >= 6 ? 'watch' : 'normal'
  };
}

export { generateMockPSN };