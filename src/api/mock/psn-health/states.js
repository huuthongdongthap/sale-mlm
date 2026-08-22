/**
 * Mock PSN Health API — 9-state definitions
 */
const { generateMockPSN } = require('./psns');

/**
 * Mock data generator for 9-state PSN health classifier
 */
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
    mockPSNs.push(generateMockPSN(i, states, generateTrajectory));
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

module.exports = { generateMockPSNHealth, generateTrajectory };