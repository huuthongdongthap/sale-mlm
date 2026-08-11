/**
 * Mock Alerts API for frontend development
 * Provides realistic alert data until T-006 backend is ready
 */

// Alert severity levels
const SEVERITIES = ['info', 'warning', 'critical'];
const ALERT_TYPES = [
  'psn_health_drop',
  'funnel_stalled',
  'graduation_pending',
  'habit_streak_break',
  'order_pending',
  'member_inactive',
  'webhook_failure',

];

// Member names for mock data
const MEMBERS = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
  'Hoàng Văn Em', 'Vũ Thị Phượng', 'Đặng Văn Giang', 'Bùi Thị Hà',
  'Ngô Văn Hưng', 'Đỗ Thị Hoa', 'Lý Văn Khang', 'Tạ Thị Lan'
];

const PSN_NAMES = [
  'PSN Alpha', 'PSN Beta', 'PSN Gamma', 'PSN Delta',
  'PSN Epsilon', 'PSN Zeta', 'PSN Eta', 'PSN Theta'
];

function generateMockAlerts(count = 25) {
  const alerts = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const type = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    const member = MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
    const psn = PSN_NAMES[Math.floor(Math.random() * PSN_NAMES.length)];

    // Generate timestamps within last 7 days
    const createdAt = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    // Critical alerts are more recent
    const hoursAgo = severity === 'critical' ? Math.random() * 6 : Math.random() * 168;
    const updatedAt = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();

    let title, message;
    switch (type) {
      case 'psn_health_drop':
        title = `PSN Health Drop - ${psn}`;
        message = `${psn} health score dropped from ${Math.floor(Math.random() * 30 + 50)} to ${Math.floor(Math.random() * 40 + 10)}. Immediate review required.`;
        break;
      case 'funnel_stalled':
        title = `Lead Stalled in Funnel`;
        message = `${member} has a lead stuck at ${['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'][Math.floor(Math.random() * 5)]} tier for ${Math.floor(Math.random() * 14 + 3)} days.`;
        break;
      case 'graduation_pending':
        title = `Graduation Review Needed`;
        message = `${member} completed 4-week onboarding but hasn't met graduation criteria (3 orders + habit ≥4 for 3 weeks).`;
        break;
      case 'habit_streak_break':
        title = `Habit Streak Broken`;
        message = `${member} missed ${Math.floor(Math.random() * 3 + 1)} consecutive days of 5AM Club. Current streak: 0 days.`;
        break;
      case 'order_pending':
        title = `Order Pending Payment`;
        message = `${member} has ${Math.floor(Math.random() * 3 + 1)} unpaid order(s) awaiting confirmation.`;
        break;
      case 'member_inactive':
        title = `Member Inactive`;
        message = `${member} (${psn}) has been inactive for ${Math.floor(Math.random() * 21 + 7)} days. Last activity: ${new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}.`;
        break;
      case 'webhook_failure':
        title = `Webhook Delivery Failed`;
        message = `Failed to deliver alert to ${['Slack #alerts', 'Discord #ops', 'Email ops@company.com'][Math.floor(Math.random() * 3)]} after 3 retries.`;
        break;
      default:
        title = 'System Alert';
        message = 'A system event requires attention.';
    }

    alerts.push({
      id: `ALT-${Date.now()}-${i.toString().padStart(4, '0')}`,
      type,
      severity,
      title,
      message,
      memberName: member,
      psnName: psn,
      psnId: `psn-${Math.floor(Math.random() * 8 + 1)}`,
      memberId: `mem-${Math.floor(Math.random() * 50 + 1)}`,
      acknowledged: Math.random() > 0.7, // ~30% acknowledged
      createdAt,
      updatedAt,
      metadata: {
        funnelLevel: type === 'funnel_stalled' ? Math.floor(Math.random() * 5) : null,
        healthScore: type === 'psn_health_drop' ? Math.floor(Math.random() * 100) : null,
      }
    });
  }

  // Sort by severity (critical first) then by updatedAt desc
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return alerts;
}

function groupBySeverity(alerts) {
  const grouped = {
    critical: [],
    warning: [],
    info: []
  };

  for (const alert of alerts) {
    grouped[alert.severity].push(alert);
  }

  return grouped;
}

function filterAlerts(alerts, filters) {
  let filtered = [...alerts];

  if (filters.severity) {
    filtered = filtered.filter(a => a.severity === filters.severity);
  }
  if (filters.type) {
    filtered = filtered.filter(a => a.type === filters.type);
  }
  if (filters.psnId) {
    filtered = filtered.filter(a => a.psnId === filters.psnId);
  }
  if (filters.acknowledged !== undefined) {
    filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo));
  }

  return filtered;
}

// Generate initial mock data
let mockAlerts = generateMockAlerts(30);

// Mock API object
export const mockAlertsAPI = {
  async getAlerts(filters = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

    const filtered = filterAlerts(mockAlerts, filters);
    const grouped = groupBySeverity(filtered);

    return {
      success: true,
      data: {
        alerts: filtered,
        grouped,
        total: filtered.length,
        unacknowledged: filtered.filter(a => !a.acknowledged).length
      }
    };
  },

  async acknowledgeAlert(alertId) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const alert = mockAlerts.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    alert.acknowledged = true;
    alert.updatedAt = new Date().toISOString();

    return { success: true, data: alert };
  },

  async acknowledgeAll(alertIds) {
    await new Promise(resolve => setTimeout(resolve, 100));

    let count = 0;
    for (const id of alertIds) {
      const alert = mockAlerts.find(a => a.id === id);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        alert.updatedAt = new Date().toISOString();
        count++;
      }
    }

    return { success: true, data: { acknowledged: count } };
  },

  // For testing - regenerate mock data
  regenerate(count = 30) {
    mockAlerts = generateMockAlerts(count);
    return mockAlerts;
  },

  // Get all alerts without filtering
  getAll() {
    return mockAlerts;
  }
};

export default mockAlertsAPI;