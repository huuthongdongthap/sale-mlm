/**
 * LocalDatabaseAdapter — Referrals table operations
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

class ReferralsOps {
  constructor(db) {
    this.db = db;
  }

  async createReferral(referrerId, refereeId, refereeEmail, refereeName) {
    return bindRun(this.db.prepare('INSERT INTO referrals (id, referrer_id, referee_id, referee_email, referee_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(), referrerId, refereeId, refereeEmail, refereeName, 'pending', new Date().toISOString()
    ));
  }

  async getReferralsByReferrer(referrerId) {
    return bindAll(this.db.prepare('SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC').bind(referrerId));
  }
}

module.exports = { ReferralsOps };