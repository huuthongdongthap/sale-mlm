/**
 * Mock alert operations — getAlerts, acknowledgeAlert, bulkAcknowledge, evaluateRules
 */

async function getAlerts(alerts, options = {}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  let filtered = [...alerts];

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

async function acknowledgeAlert(alerts, alertId, acknowledgedBy = 'current-user') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));

  const alert = alerts.find(a => a.id === alertId);
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

async function bulkAcknowledge(alerts, alertIds, acknowledgedBy = 'current-user') {
  const results = [];

  for (const alertId of alertIds) {
    const result = await acknowledgeAlert(alerts, alertId, acknowledgedBy);
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
async function evaluateRules(alerts) {
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
  alerts.push(...newAlerts);

  return {
    success: true,
    data: {
      new_alerts: newAlerts.length,
      total_alerts: alerts.length
    }
  };
}

module.exports = { getAlerts, acknowledgeAlert, bulkAcknowledge, evaluateRules };