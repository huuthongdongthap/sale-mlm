/**
 * Mock API for alerts system - simulates backend T-006 (Alert rules engine)
 * Used until real alert rules engine is implemented
 */

export class MockAlertsAPI {
  constructor() {
    this.alerts = this.generateMockAlerts();
  }

  generateMockAlerts() {
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

  async getAlerts(options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    let filtered = [...this.alerts];

    // Filter by severity
    if (options.severity) {
      filtered = filtered.filter(alert => alert.severity === options.severity);
    }

    // Filter by acknowledged status
    if (options.acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === options.acknowledged);
    }

    // Sort by created_at desc (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Group by severity
    const grouped = {
      critical: filtered.filter(a => a.severity === 'critical'),
      warn: filtered.filter(a => a.severity === 'warn'),
      info: filtered.filter(a => a.severity === 'info')
    };

    return {
      success: true,
      data: {
        alerts: filtered,
        grouped,
        total: filtered.length,
        unacknowledged: filtered.filter(a => !a.acknowledged).length
      }
    };
  }

  async acknowledgeAlert(alertId, acknowledgedBy = 'current-user') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));

    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return {
        success: false,
        error: 'Alert not found'
      };
    }

    if (alert.acknowledged) {
      return {
        success: false,
        error: 'Alert already acknowledged'
      };
    }

    // Update alert
    alert.acknowledged = true;
    alert.acknowledged_by = acknowledgedBy;
    alert.acknowledged_at = new Date().toISOString();

    // Mock audit trail entry (would be saved to governance.audit_trail in real backend)
    const auditEntry = {
      id: `audit-${Date.now()}`,
      action: 'alert_acknowledged',
      resource_type: 'alert',
      resource_id: alertId,
      actor: acknowledgedBy,
      timestamp: alert.acknowledged_at,
      metadata: {
        alert_severity: alert.severity,
        alert_rule: alert.rule,
        member_affected: alert.member_id
      }
    };

    console.log('Mock audit trail entry:', auditEntry);

    return {
      success: true,
      data: {
        alert,
        audit_entry: auditEntry
      }
    };
  }

  async bulkAcknowledge(alertIds, acknowledgedBy = 'current-user') {
    const results = [];

    for (const alertId of alertIds) {
      const result = await this.acknowledgeAlert(alertId, acknowledgedBy);
      results.push({ alertId, ...result });
    }

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    return {
      success: failures.length === 0,
      data: {
        acknowledged: successes.length,
        failed: failures.length,
        results
      }
    };
  }

  // Simulate alert rule evaluation (would be triggered by cron in real backend)
  async evaluateRules() {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate finding new alerts
    const newAlerts = [
      {
        id: `alert-${Date.now()}`,
        severity: 'warn',
        rule: 'First Order Delay',
        title: 'Trần Văn Nam - Chưa có order đầu tiên',
        evidence: 'Ngày 14 kể từ join date, chưa có order nào (target ≤14 days)',
        suggested_action: 'Tăng cường support 1:1 + review product training',
        member_id: 'mem-new',
        member_name: 'Trần Văn Nam',
        created_at: new Date().toISOString(),
        acknowledged: false,
        acknowledged_by: null,
        acknowledged_at: null
      }
    ];

    // Add to alerts list
    this.alerts.push(...newAlerts);

    return {
      success: true,
      data: {
        new_alerts: newAlerts.length,
        total_alerts: this.alerts.length
      }
    };
  }
}

// Global mock instance
export const mockAlertsAPI = new MockAlertsAPI();