/**
 * Mock alert data — generateMockAlerts
 */

/**
 * Generate mock alerts
 */
function generateMockAlerts() {
  return [
    {
      id: 'alert-001',
      severity: 'critical',
      rule: 'Habit Score Drop',
      title: 'Nguyễn Văn An - Habit score dưới 3 điểm',
      evidence: 'Habit score: 2.1/6 trong 3 ngày liên tiếp (22-24/04)',
      suggested_action: 'Kích hoạt buddy system - ghép với mentor Trần Thị Mai',
      member_id: 'mem-001',
      member_name: 'Nguyễn Văn An',
      created_at: '2026-04-24T14:30:00Z',
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null
    },
    {
      id: 'alert-002',
      severity: 'warn',
      title: 'Phạm Thị Hoa - Connects/day giảm mạnh',
      rule: 'Low Daily Connects',
      evidence: 'Connects: 8/day (target 15/day) trong 5 ngày gần nhất',
      suggested_action: 'Flash campaign "Chiến dịch 48h" - boost motivation',
      member_id: 'mem-002',
      member_name: 'Phạm Thị Hoa',
      created_at: '2026-04-24T10:15:00Z',
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null
    },
    {
      id: 'alert-003',
      severity: 'critical',
      title: 'PSN Dragon Team - Team retention < 60%',
      rule: 'PSN Retention Drop',
      evidence: 'Retention 30d: 45% (target ≥70%) - 3/5 members inactive',
      suggested_action: 'Cuộc họp khẩn PSN Leader + escalate lên Core Leader',
      member_id: 'psn-001',
      member_name: 'Dragon Team (Leader: Võ Minh Tuấn)',
      created_at: '2026-04-24T08:45:00Z',
      acknowledged: true,
      acknowledged_by: 'admin-001',
      acknowledged_at: '2026-04-24T15:30:00Z'
    },
    {
      id: 'alert-004',
      severity: 'info',
      title: 'Lê Quang Huy - Sắp hoàn thành Tier 1',
      rule: 'Graduation Readiness',
      evidence: 'Module 4/4 hoàn thành 80%, habit score 5.2/6 ổn định',
      suggested_action: 'Chuẩn bị ceremony tốt nghiệp + assign Tier 2',
      member_id: 'mem-003',
      member_name: 'Lê Quang Huy',
      created_at: '2026-04-24T07:20:00Z',
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null
    },
    {
      id: 'alert-005',
      severity: 'warn',
      title: 'System Alert - Vite build performance',
      rule: 'System Performance',
      evidence: 'Build time: 3.2s (baseline 1.8s) - bundle size tăng 15%',
      suggested_action: 'Code review dependency mới + optimize chunks',
      member_id: null,
      member_name: 'System',
      created_at: '2026-04-23T23:45:00Z',
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null
    }
  ];
}

module.exports = { generateMockAlerts };