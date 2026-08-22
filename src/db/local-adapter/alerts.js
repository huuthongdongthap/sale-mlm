/**
 * LocalDatabaseAdapter — Alerts table operations
 */

const crypto = require('crypto');

function bindRun(stmt, ...params) {
  return stmt.bind(...params).run();
}
function bindAll(stmt, ...params) {
  return stmt.bind(...params).all();
}
function bindFirst(stmt, ...params) {
  return stmt.bind(...params).first();
}

class AlertsOps {
  constructor(db) {
    this.db = db;
  }

  async logAlert(data) {
    return bindRun(this.db.prepare('INSERT INTO alerts_log (id, rule_id, metric, severity, evidence, psn_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), data.ruleId || null, data.metric || null, data.severity || 'info',
      JSON.stringify(data.evidence || {}), data.psnId || null, new Date().toISOString()
    ));
  }

  async getAlertLog(filters = {}) {
    let query = 'SELECT * FROM alerts_log WHERE 1=1';
    const params = [];
    if (filters.severity) { query += ' AND severity = ?'; params.push(filters.severity); }
    if (filters.psn_id) { query += ' AND psn_id = ?'; params.push(filters.psn_id); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(filters.limit || 100);
    return bindAll(this.db.prepare(query), ...params);
  }
}

module.exports = { AlertsOps };