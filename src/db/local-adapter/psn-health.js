/**
 * LocalDatabaseAdapter — PSN Health table operations
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

class PsnHealthOps {
  constructor(db) {
    this.db = db;
  }

  async getPSNHealth(psnId) {
    return bindFirst(this.db.prepare('SELECT * FROM psn_health_history WHERE psn_id = ? ORDER BY created_at DESC LIMIT 1').bind(psnId));
  }

  async recordPSNHealth(psnId, state, riskLevel, metrics = {}) {
    return bindRun(this.db.prepare('INSERT INTO psn_health_history (id, psn_id, state, risk_level, metrics) VALUES (?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), psnId, state, riskLevel, JSON.stringify(metrics)
    ));
  }

  async listPSNHealth() {
    return bindAll(this.db.prepare('SELECT DISTINCT psn_id, state, risk_level, created_at FROM psn_health_history ORDER BY created_at DESC LIMIT 100'));
  }
}

module.exports = { PsnHealthOps };