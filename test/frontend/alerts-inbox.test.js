/**
 * Test suite for Alerts Inbox functionality
 * T-011 acceptance criteria verification
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="page-content"></div>
    </body>
  </html>
`, { url: 'http://localhost' });

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock CSS variables for brand colors
const mockCSSVars = {
  '--surface-primary': '#0A0A0A',
  '--surface-secondary': '#1A1A1A',
  '--text-primary': '#FFFFFF',
  '--text-secondary': '#B0B0B0',
  '--text-tertiary': '#808080',
  '--brand-gold': '#C9A200',
  '--brand-gold-electric': '#FFD700',
  '--border-color': '#333333'
};

// Mock getComputedStyle
global.window.getComputedStyle = () => ({
  getPropertyValue: (prop) => mockCSSVars[prop] || ''
});

describe('Alerts Inbox - T-011 Acceptance Criteria', () => {
  let AlertsInbox, mockAlertsAPI, SeverityGroup, AlertCard;

  beforeEach(async () => {
    // Clear DOM
    document.getElementById('page-content').innerHTML = '';

    // Import modules
    const alertsModule = await import('../../src/dashboard/alerts-inbox.js');
    AlertsInbox = alertsModule.AlertsInbox;

    const mockAPIModule = await import('../../src/mocks/alerts-api.js');
    mockAlertsAPI = mockAPIModule.mockAlertsAPI;

    const severityModule = await import('../../src/dashboard/components/severity-group.js');
    SeverityGroup = severityModule.SeverityGroup;

    const cardModule = await import('../../src/dashboard/components/alert-card.js');
    AlertCard = cardModule.AlertCard;
  });

  afterEach(() => {
    // Clean up timers
    vi.clearAllTimers();
  });

  test('Accept Criteria 1: Inbox groups by severity (critical / warn / info)', async () => {
    const inbox = new AlertsInbox();

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 400));

    // Check that severity groups are rendered
    const criticalGroup = document.querySelector('[data-severity="critical"]');
    const warnGroup = document.querySelector('[data-severity="warn"]');
    const infoGroup = document.querySelector('[data-severity="info"]');

    expect(criticalGroup).toBeTruthy();
    expect(warnGroup).toBeTruthy();
    expect(infoGroup).toBeTruthy();

    // Check group headers have correct labels
    const criticalHeader = criticalGroup.querySelector('.severity-title');
    const warnHeader = warnGroup.querySelector('.severity-title');
    const infoHeader = infoGroup.querySelector('.severity-title');

    expect(criticalHeader.textContent).toBe('Nghiêm trọng');
    expect(warnHeader.textContent).toBe('Cảnh báo');
    expect(infoHeader.textContent).toBe('Thông tin');
  });

  test('Accept Criteria 2: Each alert shows rule, evidence, suggested action, ACK button', async () => {
    const inbox = new AlertsInbox();

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 400));

    // Get first unacknowledged alert
    const alertCard = document.querySelector('.alert-card:not(.acknowledged)');
    expect(alertCard).toBeTruthy();

    // Check rule display
    const ruleElement = alertCard.querySelector('.alert-rule');
    expect(ruleElement).toBeTruthy();
    expect(ruleElement.textContent).toMatch(/^[A-Z\s]+$/); // Should be uppercase

    // Check evidence section
    const evidenceSection = alertCard.querySelector('.alert-evidence');
    expect(evidenceSection).toBeTruthy();

    const evidenceText = evidenceSection.querySelector('.evidence-content');
    expect(evidenceText).toBeTruthy();
    expect(evidenceText.textContent.length).toBeGreaterThan(10);

    // Check suggested action
    const actionSection = alertCard.querySelector('.suggested-action');
    expect(actionSection).toBeTruthy();

    const actionText = actionSection.querySelector('.action-content');
    expect(actionText).toBeTruthy();
    expect(actionText.textContent).toContain('→'); // Should have action indicator

    // Check ACK button (should exist for unacknowledged alerts)
    const ackButton = alertCard.querySelector('.acknowledge-btn');
    expect(ackButton).toBeTruthy();
    expect(ackButton.textContent).toContain('Xử lý');
  });

  test('Accept Criteria 3: ACK writes audit row per governance.audit_trail spec', async () => {
    const console_log_spy = vi.spyOn(console, 'log');

    // Get mock API to test audit trail
    const alertId = 'alert-001';

    const result = await mockAlertsAPI.acknowledgeAlert(alertId, 'test-user');

    expect(result.success).toBe(true);
    expect(result.data.audit_entry).toBeDefined();

    const auditEntry = result.data.audit_entry;
    expect(auditEntry.action).toBe('alert_acknowledged');
    expect(auditEntry.resource_type).toBe('alert');
    expect(auditEntry.resource_id).toBe(alertId);
    expect(auditEntry.actor).toBe('test-user');
    expect(auditEntry.timestamp).toBeDefined();
    expect(auditEntry.metadata).toBeDefined();
    expect(auditEntry.metadata.alert_severity).toBeDefined();
    expect(auditEntry.metadata.alert_rule).toBeDefined();

    // Verify console log was called (mock audit trail logging)
    expect(console_log_spy).toHaveBeenCalledWith(
      'Mock audit trail entry:',
      expect.objectContaining({
        action: 'alert_acknowledged',
        resource_type: 'alert',
        resource_id: alertId
      })
    );

    console_log_spy.mockRestore();
  });

  test('Severity grouping displays correct counts', () => {
    const criticalAlerts = [
      { id: '1', severity: 'critical', acknowledged: false },
      { id: '2', severity: 'critical', acknowledged: true }
    ];

    const severityGroup = new SeverityGroup('critical', criticalAlerts, () => {});
    const rendered = severityGroup.render();

    // Should show total count (2)
    expect(rendered).toContain('2'); // total badge

    // Should show unacknowledged count (1)
    expect(rendered).toContain('1 chưa xử lý');
  });

  test('Alert card time formatting', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const alert = {
      id: 'test',
      severity: 'info',
      title: 'Test',
      created_at: oneHourAgo.toISOString(),
      acknowledged: false,
      rule: 'TEST_RULE',
      evidence: 'Test evidence',
      suggested_action: 'Test action'
    };

    const alertCard = new AlertCard(alert, () => {});
    const formatted = alertCard.formatTimeAgo(alert.created_at);

    expect(formatted).toContain('giờ trước');

    // Test day formatting
    alert.created_at = oneDayAgo.toISOString();
    const dayFormatted = alertCard.formatTimeAgo(alert.created_at);
    expect(dayFormatted).toContain('ngày trước');
  });

  test('Bulk acknowledge functionality', async () => {
    const alertIds = ['alert-001', 'alert-002'];
    const result = await mockAlertsAPI.bulkAcknowledge(alertIds, 'test-user');

    expect(result.success).toBe(true);
    expect(result.data.acknowledged).toBe(2);
    expect(result.data.failed).toBe(0);

    // Check that alerts are marked as acknowledged
    const alerts = await mockAlertsAPI.getAlerts();
    const acknowledgedAlerts = alerts.data.alerts.filter(a =>
      alertIds.includes(a.id) && a.acknowledged
    );

    expect(acknowledgedAlerts.length).toBe(2);
  });

  test('Filter functionality works correctly', async () => {
    // Test severity filter
    const criticalOnly = await mockAlertsAPI.getAlerts({ severity: 'critical' });
    expect(criticalOnly.data.alerts.every(a => a.severity === 'critical')).toBe(true);

    // Test acknowledged filter
    const unacknowledgedOnly = await mockAlertsAPI.getAlerts({ acknowledged: false });
    expect(unacknowledgedOnly.data.alerts.every(a => !a.acknowledged)).toBe(true);
  });

  test('Vietnamese UI text validation', async () => {
    const inbox = new AlertsInbox();
    await new Promise(resolve => setTimeout(resolve, 400));

    const pageContent = document.getElementById('page-content').innerHTML;

    // Check for Vietnamese UI elements
    expect(pageContent).toContain('Trung tâm cảnh báo');
    expect(pageContent).toContain('Nghiêm trọng');
    expect(pageContent).toContain('Cảnh báo');
    expect(pageContent).toContain('Thông tin');
    expect(pageContent).toContain('Chưa xử lý');
    expect(pageContent).toContain('Xử lý');
    expect(pageContent).toContain('Bằng chứng');
    expect(pageContent).toContain('Hành động đề xuất');

    // Ensure no English UI text leaked through
    expect(pageContent).not.toContain('Critical');
    expect(pageContent).not.toContain('Warning');
    expect(pageContent).not.toContain('Info');
    expect(pageContent).not.toContain('Acknowledge');
  });

  test('Mobile responsive layout classes present', async () => {
    const inbox = new AlertsInbox();
    await new Promise(resolve => setTimeout(resolve, 400));

    const styles = document.querySelector('style').textContent;

    // Check for mobile responsive CSS
    expect(styles).toContain('@media (max-width: 768px)');
    expect(styles).toContain('flex-direction: column');
    expect(styles).toContain('justify-content: center');
  });

  test('Accessibility features implemented', async () => {
    const inbox = new AlertsInbox();
    await new Promise(resolve => setTimeout(resolve, 400));

    // Check for proper semantic HTML structure
    const pageContent = document.getElementById('page-content').innerHTML;
    expect(pageContent).toContain('<h1');
    expect(pageContent).toContain('<h3');
    expect(pageContent).toContain('<h4');

    // Check for button accessibility
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      // Buttons should have meaningful text content
      expect(button.textContent.trim().length).toBeGreaterThan(0);
    });

    // Check for proper form labels
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      expect(select.id).toBeDefined();
    });
  });
});

describe('Mock API Compliance', () => {
  test('Mock API matches expected interface', async () => {
    // Test getAlerts
    const alerts = await mockAlertsAPI.getAlerts();
    expect(alerts.success).toBe(true);
    expect(alerts.data.alerts).toBeInstanceOf(Array);
    expect(alerts.data.grouped).toBeDefined();
    expect(alerts.data.total).toBeTypeOf('number');
    expect(alerts.data.unacknowledged).toBeTypeOf('number');

    // Test acknowledgeAlert
    const ackResult = await mockAlertsAPI.acknowledgeAlert('alert-004');
    expect(ackResult.success).toBe(true);
    expect(ackResult.data.alert).toBeDefined();
    expect(ackResult.data.audit_entry).toBeDefined();

    // Test error handling
    const notFound = await mockAlertsAPI.acknowledgeAlert('nonexistent');
    expect(notFound.success).toBe(false);
    expect(notFound.error).toBeDefined();
  });

  test('Alert data structure compliance', async () => {
    const alerts = await mockAlertsAPI.getAlerts();
    const alert = alerts.data.alerts[0];

    // Required fields per accept criteria
    expect(alert.id).toBeDefined();
    expect(alert.severity).toMatch(/^(critical|warn|info)$/);
    expect(alert.rule).toBeDefined();
    expect(alert.title).toBeDefined();
    expect(alert.evidence).toBeDefined();
    expect(alert.suggested_action).toBeDefined();
    expect(alert.created_at).toBeDefined();
    expect(typeof alert.acknowledged).toBe('boolean');

    // Vietnamese content check
    expect(alert.title).toMatch(/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    expect(alert.suggested_action).toMatch(/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
  });
});