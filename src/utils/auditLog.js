const crypto = require('crypto');

/**
 * PDPA Audit Log for Droppii Training OS
 * Logs all access to personally identifiable information (PII) per Vietnam PDPA compliance
 */

const auditLogs = []; // In-memory storage for demo, replace with database in production

/**
 * PII field types that require audit logging
 */
const PII_FIELDS = ['phone', 'email', 'name', 'address'];

/**
 * Log PII access event
 * @param {Object} event - Audit event details
 * @param {string} event.action - Action performed (read, create, update, delete)
 * @param {string} event.resource - Resource accessed (member)
 * @param {string} event.resourceId - ID of the resource
 * @param {string[]} event.piiFields - List of PII fields accessed
 * @param {string} event.userId - ID of user performing action
 * @param {string} event.userRole - Role of user performing action
 * @param {string} event.ipAddress - IP address of user (optional)
 * @param {string} event.userAgent - User agent string (optional)
 */
function logPIIAccess(event) {
  const auditEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId,
    piiFields: event.piiFields,
    userId: event.userId,
    userRole: event.userRole,
    ipAddress: event.ipAddress || 'unknown',
    userAgent: event.userAgent || 'unknown',
    compliance: 'PDPA_VN'
  };

  auditLogs.push(auditEvent);

  // In production, this should write to a secure audit database
  console.log(`[PDPA AUDIT] ${auditEvent.timestamp} - User ${auditEvent.userId} (${auditEvent.userRole}) performed ${auditEvent.action} on ${auditEvent.resource}:${auditEvent.resourceId}, accessed PII: ${auditEvent.piiFields.join(', ')}`);

  return auditEvent.id;
}

/**
 * Get audit logs (Admin only)
 * @param {Object} filters - Optional filters
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.resource - Filter by resource type
 * @param {string} filters.action - Filter by action type
 * @param {Date} filters.dateFrom - Filter from date
 * @param {Date} filters.dateTo - Filter to date
 * @returns {Array} Filtered audit logs
 */
function getAuditLogs(filters = {}) {
  let logs = [...auditLogs];

  if (filters.userId) {
    logs = logs.filter(log => log.userId === filters.userId);
  }

  if (filters.resource) {
    logs = logs.filter(log => log.resource === filters.resource);
  }

  if (filters.action) {
    logs = logs.filter(log => log.action === filters.action);
  }

  if (filters.dateFrom) {
    logs = logs.filter(log => new Date(log.timestamp) >= filters.dateFrom);
  }

  if (filters.dateTo) {
    logs = logs.filter(log => new Date(log.timestamp) <= filters.dateTo);
  }

  // Sort by timestamp, newest first
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Check if a field is considered PII
 * @param {string} fieldName - Field name to check
 * @returns {boolean} True if field is PII
 */
function isPIIField(fieldName) {
  return PII_FIELDS.includes(fieldName.toLowerCase());
}

/**
 * Extract PII fields from an object
 * @param {Object} data - Data object to analyze
 * @returns {string[]} List of PII field names present in data
 */
function extractPIIFields(data) {
  if (!data || typeof data !== 'object') return [];

  return Object.keys(data).filter(key => isPIIField(key));
}

module.exports = {
  logPIIAccess,
  getAuditLogs,
  isPIIField,
  extractPIIFields,
  PII_FIELDS
};