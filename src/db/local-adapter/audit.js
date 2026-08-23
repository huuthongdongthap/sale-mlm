/**
 * LocalDatabaseAdapter — Audit Trail table operations
 */

const crypto = require('crypto');

function bindRun(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.run();
}
function bindAll(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.all();
}
function bindFirst(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.get();
}

class AuditOps {
  constructor(db) {
    this.db = db;
  }

  async getAuditTrail(filters = {}) {
    let query = 'SELECT * FROM audit_trail WHERE 1=1';
    const params = [];
    if (filters.actorId) { query += ' AND actor_id = ?'; params.push(filters.actorId); }
    if (filters.resourceType) { query += ' AND resource_type = ?'; params.push(filters.resourceType); }
    if (filters.action) { query += ' AND action = ?'; params.push(filters.action); }
    // Normalize filter values: complianceReport passes Date objects; SQLite/D1
    // can only bind numbers, strings, bigints, buffers, and null.
    const iso = (v) => v instanceof Date ? v.toISOString() : v;
    if (filters.dateFrom) { query += ' AND created_at >= ?'; params.push(iso(filters.dateFrom)); }
    if (filters.dateTo) { query += ' AND created_at <= ?'; params.push(iso(filters.dateTo)); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(filters.limit || 1000);
    return bindAll(this.db.prepare(query), ...params);
  }

  async logAudit(data) {
    // Schema column is `details` (not `pii_fields`) and has no `user_agent` column.
    return bindRun(this.db.prepare('INSERT INTO audit_trail (id, actor_id, action, resource_type, resource_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), data.actorId || 'system', data.action || 'unknown',
      data.resourceType || 'unknown', data.resourceId || null,
      JSON.stringify(data.details || data.piiFields || []), data.ipAddress || null,
      new Date().toISOString()
    ));
  }
}

module.exports = { AuditOps };