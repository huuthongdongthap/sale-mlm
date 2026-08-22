/**
 * PSN Health Score — Cửu Địa 9-state labels + recommended actions
 */

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

module.exports = { STATE_LABELS, getStateLabel, getRecommendedActions };