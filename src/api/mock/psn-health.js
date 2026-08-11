/**
 * Mock PSN Health API endpoint for frontend development
 *
 * This mock generates realistic 9-state health data since T-005 (PSN health score) is blocked.
 *
 * States mapping (Cửu Địa - Sun Tzu's Nine Grounds):
 * 1. Tản Địa (Dispersive) - Low cohesion, scattered
 * 2. Khinh Địa (Light) - Easy territory, good conditions
 * 3. Tranh Địa (Contentious) - Competitive area, mixed results
 * 4. Giao Địa (Open) - Good connections, moderate growth
 * 5. Cù Địa (Focal) - Central hub, multiple partnerships
 * 6. Trọng Địa (Heavy) - Strong foundation, serious commitment
 * 7. Bì Địa (Bad) - Difficult terrain, needs support
 * 8. Vi Địa (Enclosed) - Limited options, urgent action needed
 * 9. Tử Địa (Death) - Critical situation, do or die
 */

// Mock data generator for 9-state PSN health classifier
function generateMockPSNHealth() {
  const states = [
    {
      id: 1,
      name: 'Tản Địa',
      name_en: 'Dispersive Ground',
      description: 'Lực lượng rải rác, thiếu tập trung. Cần gom nhóm và củng cố.',
      risk_level: 'medium',
      color: '#FF6B6B',
      trend: 'stable'
    },
    {
      id: 2,
      name: 'Khinh Địa',
      name_en: 'Light Ground',
      description: 'Điều kiện thuận lợi, dễ phát triển. Tận dụng tốt thời cơ.',
      risk_level: 'low',
      color: '#4ECDC4',
      trend: 'up'
    },
    {
      id: 3,
      name: 'Tranh Địa',
      name_en: 'Contentious Ground',
      description: 'Khu vực cạnh tranh cao. Kết quả không ổn định, cần chiến lược.',
      risk_level: 'medium',
      color: '#FFD93D',
      trend: 'volatile'
    },
    {
      id: 4,
      name: 'Giao Địa',
      name_en: 'Open Ground',
      description: 'Kết nối tốt, tăng trưởng ổn định. Mở rộng mạng lưới hiệu quả.',
      risk_level: 'low',
      color: '#6BCF7F',
      trend: 'up'
    },
    {
      id: 5,
      name: 'Cù Địa',
      name_en: 'Focal Ground',
      description: 'Trung tâm kết nối, nhiều đối tác. Vị trí chiến lược quan trọng.',
      risk_level: 'low',
      color: '#4D96FF',
      trend: 'stable'
    },
    {
      id: 6,
      name: 'Trọng Địa',
      name_en: 'Heavy Ground',
      description: 'Nền tảng vững chắc, cam kết cao. Đầu tư dài hạn hiệu quả.',
      risk_level: 'low',
      color: '#9B59B6',
      trend: 'up'
    },
    {
      id: 7,
      name: 'Bì Địa',
      name_en: 'Bad Ground',
      description: 'Địa hình khó khăn, cần hỗ trợ. Đội ngũ cần mentoring.',
      risk_level: 'high',
      color: '#F39C12',
      trend: 'down'
    },
    {
      id: 8,
      name: 'Vi Địa',
      name_en: 'Enclosed Ground',
      description: 'Lựa chọn hạn chế, cần hành động khẩn cấp. Buddy system kích hoạt.',
      risk_level: 'critical',
      color: '#E74C3C',
      trend: 'down'
    },
    {
      id: 9,
      name: 'Tử Địa',
      name_en: 'Death Ground',
      description: 'Tình huống nghiêm trọng, quyết đấu. Cần can thiệp leadership ngay.',
      risk_level: 'critical',
      color: '#8E44AD',
      trend: 'critical'
    }
  ];

  // Generate mock PSN data with realistic distribution
  const mockPSNs = [];
  const psnCount = 12; // Sample PSN count

  for (let i = 1; i <= psnCount; i++) {
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

    mockPSNs.push({
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
    });
  }

  return {
    states,
    psns: mockPSNs,
    summary: {
      total_psns: psnCount,
      healthy_count: mockPSNs.filter(p => p.current_state.risk_level === 'low').length,
      at_risk_count: mockPSNs.filter(p => p.current_state.risk_level === 'medium').length,
      critical_count: mockPSNs.filter(p => p.current_state.risk_level === 'high' || p.current_state.risk_level === 'critical').length,
      avg_team_size: Math.round(mockPSNs.reduce((sum, p) => sum + p.team_size, 0) / psnCount),
      total_revenue: mockPSNs.reduce((sum, p) => sum + p.revenue_current, 0)
    },
    meta: {
      generated_at: new Date().toISOString(),
      data_source: 'mock',
      note: 'Mock data generated for frontend development. Replace with real API when T-005 is complete.'
    }
  };
}

function generateTrajectory(currentState, weeks) {
  const trajectory = [];
  let state = currentState;

  for (let week = weeks; week >= 1; week--) {
    // Simulate state changes over time with some randomness but logical trends
    if (Math.random() < 0.3) { // 30% chance of state change per week
      const change = Math.random() < 0.6 ? 1 : -1; // Slightly favor improvement
      state = Math.max(1, Math.min(9, state + change));
    }

    trajectory.unshift({
      week: week,
      state_id: state,
      date: new Date(Date.now() - (week * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    });
  }

  return trajectory;
}

// Mock API endpoint handler
export function handlePSNHealthRequest(request) {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockPSNHealth();
      resolve({
        status: 200,
        data: data
      });
    }, Math.random() * 500 + 100); // 100-600ms delay
  });
}

// For direct import usage
export const mockPSNHealthData = generateMockPSNHealth();