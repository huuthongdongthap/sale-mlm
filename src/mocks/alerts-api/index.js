/**
 * Mock API for alerts system - simulates backend T-006 (Alert rules engine)
 * Used until real alert rules engine is implemented
 *
 * Implementation lives in src/mocks/alerts-api/
 */
const { generateMockAlerts } = require('./alerts');
const { getAlerts, acknowledgeAlert, bulkAcknowledge, evaluateRules } = require('./operations');

class MockAlertsAPI {
  constructor() {
    this.alerts = generateMockAlerts();
  }

  async getAlerts(options = {}) {
    return getAlerts(this.alerts, options);
  }

  async acknowledgeAlert(alertId, acknowledgedBy = 'current-user') {
    return acknowledgeAlert(this.alerts, alertId, acknowledgedBy);
  }

  async bulkAcknowledge(alertIds, acknowledgedBy = 'current-user') {
    return bulkAcknowledge(this.alerts, alertIds, acknowledgedBy);
  }

  async evaluateRules() {
    return evaluateRules(this.alerts);
  }
}

// Global mock instance
const mockAlertsAPI = new MockAlertsAPI();

module.exports = { MockAlertsAPI, mockAlertsAPI };