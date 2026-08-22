/**
 * Member API — PII audit logging
 *
 * Logs access to PII fields for compliance.
 */

const { logPIIAccess, extractPIIFields } = require('../../utils/auditLog');

function logPIIAccessForMember(action, member, userId, userRole, req) {
  const piiFields = [];
  if (action === 'read' || action === 'update' || action === 'delete') {
    piiFields.push('name', 'email', 'phone');
  } else if (action === 'create') {
    piiFields.push(...extractPIIFields(req.body));
  }
  if (piiFields.length > 0) {
    logPIIAccess({
      action,
      resource: 'member',
      resourceId: member.id,
      piiFields,
      userId,
      userRole,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
}

module.exports = { logPIIAccessForMember };