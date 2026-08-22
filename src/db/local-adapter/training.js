/**
 * LocalDatabaseAdapter — Training Progress table operations
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

class TrainingOps {
  constructor(db) {
    this.db = db;
  }

  async recordTrainingProgress(memberId, type, value = {}) {
    return bindRun(this.db.prepare('INSERT OR REPLACE INTO training_progress (id, member_id, type, value, updated_at) VALUES (?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), memberId, type, JSON.stringify(value), new Date().toISOString()
    ));
  }

  async getTrainingProgress(memberId, type) {
    return bindFirst(this.db.prepare('SELECT * FROM training_progress WHERE member_id = ? AND type = ? ORDER BY updated_at DESC LIMIT 1').bind(memberId, type));
  }
}

module.exports = { TrainingOps };